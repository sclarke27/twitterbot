package ai.swim.service;

import ai.swim.Main;
import recon.*;
import swim.api.*;
import swim.util.Uri;

import java.util.Map;

public class AggregateService extends AbstractService {

  private static final int ALERT_HISTORY_SIZE = 10;
  private static final int AVG_SIZE = 10;

  private boolean iniJoin = false;

  // FIXME: Remove function when core is fixed.
  @Override
  public Uri hostUri() {
    return Uri.parse(
      "ws://" +
        System.getProperty("device.host.uri", "localhost") +
        ":" + Main.getSwimPort());
  }

  @SwimLane("aggLatest")
  MapLane<String, Value> aggLatest = mapLane().keyForm(Form.STRING)
    .didUpdate((k, n, o) -> {
      final Record r = Record.of();
      for (Map.Entry<String, Value> entry : this.aggLatest.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      if (!iniJoin) {
        doJoin(r);
        iniJoin = true;
      }
    })
    .isTransient(true);

  /**
   * Following snippets of Swim Lanes represent Avg. sensor data on Aggregate Monitor page
   */

  @SwimLane("avg/light")
  MapLane<Long, Integer> avgLight = mapLane().keyForm(Form.LONG).valueForm(Form.INTEGER)
    .didUpdate((k, n, o) -> {
      // System.out.println("receive light: " + n);
      if (this.avgLight.size() > AVG_SIZE) {
        this.avgLight.drop(this.avgLight.size() - AVG_SIZE);
      }
    })
    .isTransient(true);

  @SwimLane("avg/soil")
  MapLane<Long, Integer> avgSoil = mapLane().keyForm(Form.LONG).valueForm(Form.INTEGER)
    .didUpdate((k, n, o) -> {
      // System.out.println("receive soil: " + n);
      if (this.avgSoil.size() > AVG_SIZE) {
        this.avgSoil.drop(this.avgSoil.size() - AVG_SIZE);
      }
    })
    .isTransient(true);

  @SwimLane("avg/temp")
  MapLane<Long, Integer> avgTemp = mapLane().keyForm(Form.LONG).valueForm(Form.INTEGER)
    .didUpdate((k, n, o) -> {
      // System.out.println("receive temp: " + n);
      if (this.avgTemp.size() > AVG_SIZE) {
        this.avgTemp.drop(this.avgTemp.size() - AVG_SIZE);
      }
    })
    .isTransient(true);

  //TODO: NEED TO CREATE A SWIM VALUE/MAP LANE THAT CONTAIN ALL THE DEVICE AND ROBOT ATTACHED TO THIS AGGREGATE

  /**
   * Following snippets present the latest read-in from Device attached to Aggregate
   */

  @SwimLane("join/latest")
  JoinValueLane<String, Value> joinLatest = joinValueLane().keyForm(Form.STRING)
    .didUpdate((k,n,o) -> {
      // System.out.println("Aggregate join update: " + k + ", " + n.toRecon());
      long tm = System.currentTimeMillis();
      Integer light = 0;
      Integer soil = 0;
      Integer temperatureCh1 = 0;
      for (Map.Entry<String, Value> entry : this.joinLatest.entrySet()) {
        light += entry.getValue().get("light").intValue();
        soil += entry.getValue().get("soil").intValue();
        temperatureCh1 += entry.getValue().get("temperatureCh1").intValue();
      }
      avgLight.put(tm, light / this.joinLatest.size());
      avgSoil.put(tm, soil / this.joinLatest.size());
      avgTemp.put(tm, temperatureCh1 / this.joinLatest.size());

      aggLatest.put(k, n);
    })
    .isTransient(true);

  @SwimLane("addDevice")
  private CommandLane<Value> addDevice = commandLane()
    .onCommand(v -> {
      final Value host = v.get("host");
        if (host.isDefined()) {
          joinLatest.downlink(v.get("key").stringValue())
            .hostUri(host.stringValue())
            .nodeUri(v.get("node").stringValue())
            .laneUri("latest")
            .open();
        } else {
          joinLatest.downlink(v.get("key").stringValue())
            .nodeUri(v.get("node").stringValue())
            .laneUri("latest")
            .open();
        }
    });

  /**
   * Following snippets present the latest read-in from Robot attached to Aggregate
   */

  @SwimLane("join/robot")
  protected JoinValueLane<Value, String> joinRobot = joinValueLane()
    .valueForm(Form.STRING)
    .didUpdate((k, n, o) -> {
      // System.out.println("Aggregate join Robot update: " + k.toRecon() + ", " + n);
      aggLatest.put(k.get("key").stringValue(), Value.of(n));
    })
    .isTransient(true);

  @SwimLane("addBot")
  private CommandLane<Value> addBot = commandLane()
    .onCommand(v -> {
      final Value host = v.get("host"); // ws://192.168.0.151:5620
      if (host.isDefined()) {
        joinRobot.downlink(v)
          .hostUri(host.stringValue())
          .nodeUri(v.get("node").stringValue())
          .laneUri("status")
          .open();
      } else {
        joinRobot.downlink(v)
          .nodeUri(v.get("node").stringValue())
          .laneUri("status")
          .open();
      }
    });

  /**
   * createTask presents the task creation and assignment based on sensor alert and bots' availabilities
   */

  @SwimLane("createTask")
  private ValueLane<String> createTask = valueLane().valueClass(String.class)
    .didSet((n, o) -> {
      System.out.println("***** Task needed to work on alert on: " + n + "*****");
      Record r = Record.of();
      String[] dest = n.split("-");
      String secondSplit = dest[0];
      String destSensor = dest[1];

      String[] device = secondSplit.split("_");
      String deviceHost = device[0];
      String deviceName = device[1];


      r.slot("deviceHost", deviceHost);   // ws://192.168.0.150:5620
      r.slot("deviceName", deviceName);   // RaspiPlant10|192.168.0.116:8080
      r.slot("sensorUri", "/sensor/" + destSensor); // /sensor/temp4

      for (Map.Entry<Value, String> entry : joinRobot.entrySet()) {
        if (entry.getValue().equals("AVAILABLE")) {

          // call addDestination in Bot to work here with String.split.get hostUri.
          command(entry.getKey().get("host").stringValue(), entry.getKey().get("node").stringValue(), "addDestination", r);
          System.out.println("Bot picked: " + entry.getKey().get("node").stringValue());
          break;
        }
      }
    })
    .isTransient(true);

  /**
   * Following snippets present the lane alerts from sensors to both robots and UIs
   */

  @SwimLane("totalAlert")
  ValueLane<Integer> totalAlert = valueLane().valueForm(Form.INTEGER).isTransient(true);

  @SwimLane("alert/history")
  MapLane<Long, Integer> alertHistory = mapLane().keyForm(Form.LONG).valueForm(Form.INTEGER)
    .didUpdate((key, newValue, oldValue) -> {
      if (this.alertHistory.size() > ALERT_HISTORY_SIZE) {
        this.alertHistory.drop(this.alertHistory.size() - ALERT_HISTORY_SIZE);
      }
    })
    .isTransient(true);    

  // {ws://192.168.1.92:5620_RaspiPlant4|192.168.1.92:8080-temp4: T/F}
  @SwimLane("alert")
  protected MapLane<String, Boolean> alert = mapLane().keyForm(Form.STRING)
    .valueForm(Form.BOOLEAN)
    .didUpdate((k, n, o) -> {
      // System.out.println("Aggregate alert update: " + k + ", " + n);
      long tm = System.currentTimeMillis();
      Integer sum = 0;
      for (Map.Entry<String, Boolean> entry : this.alert.entrySet()) {
        if (entry.getValue()) {
          sum += 1;
        }
      }
      totalAlert.set(sum);
      alertHistory.put(tm, sum);

      if (n && !o) {
        createTask.set(k);
      }
    })
    .isTransient(true);

  // send alert to next available bot
  // {RaspiPlant4|192.168.1.92:8080 : {temp4 : false, soil : true, light : false}}
  @SwimLane("join/alert")
  JoinValueLane<String, Value> joinAlert = joinValueLane().keyForm(Form.STRING)
    .didUpdate((k,n,o) -> {
      // System.out.println("Aggregate join/alert update: " + k + ", " + n.toRecon());
    })
    .isTransient(true);

  @SwimLane("join/alertServer")
  JoinValueLane<String, Value> joinAlertServer = joinValueLane().keyForm(Form.STRING)
    .didUpdate((k, n, o) -> {
      for (Map.Entry<String, Value> entry : this.joinAlertServer.entrySet()) {
        for (Item v : entry.getValue()) {
          alert.put(entry.getKey().concat("-").concat(v.getKey().stringValue()), v.getValue().booleanValue());
        }
      }
    })
    .isTransient(true);

  @SwimLane("addAlert")
  private CommandLane<Value> addAlert = commandLane()
    .onCommand(v -> {
      final Value host = v.get("host"); // device.host.uri=192.168.0.150:5620
      if (host.isDefined()) {
        joinAlert.downlink(v.get("key").stringValue()) //RaspiPlant4|192.168.0.150:8080
          .hostUri(host.stringValue())
          .nodeUri(v.get("node").stringValue())  //  /device
          .laneUri("alert")
          .open();
        String str = v.get("host").stringValue().concat("_").concat(v.get("key").stringValue());
        joinAlertServer.downlink(str)
          .hostUri(host.stringValue())
          .nodeUri(v.get("node").stringValue())
          .laneUri("alert")
          .open();
      } else {
        joinAlert.downlink(v.get("key").stringValue())
          .nodeUri(v.get("node").stringValue())
          .laneUri("alert")
          .open();
      }
    });

  private void doJoin(Value r) {
    final String aggHost = System.getProperty("aggregate.host.uri", "");
    if (aggHost.isEmpty()) {
      command("/zone", "addAgg", Record.of()
        .slot("node", nodeUri().toUri())
        .slot("key", System.getProperty("device.name", ""))
        .slot("data", r));
    } else {
      command(aggHost, "/zone", "addAgg", Record.of()
        .slot("host", hostUri().toUri()) // device.host.uri= ws://192.168.0.150:5620
        .slot("node", nodeUri().toUri()) // /aggregate
        .slot("key", System.getProperty("device.name", "")) //RaspiAgg4|192.168.0.150:5620
        .slot("data", r));
    }
  }

}
