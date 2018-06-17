package ai.swim.service;

import ai.swim.Main;
import recon.*;
import swim.api.*;
import swim.util.Uri;

import java.util.Map;

public class DeviceService extends AbstractService {

  private boolean iniLatestJoin = false;
  private boolean iniAlertJoin = false;

  // FIXME: Remove function when core is fixed.
  @Override
  public Uri hostUri() {
    return Uri.parse(
      "ws://" +
        System.getProperty("device.host.uri", "localhost") +
        ":" + Main.getSwimPort());
  }

  @SwimLane("latest")
  private ValueLane<Value> latest = valueLane().isTransient(true);

  @SwimLane("join/latest")
  private JoinValueLane<String, Integer> joinLatest = joinValueLane().keyForm(Form.STRING).valueForm(Form.INTEGER)
    .didUpdate((k,n,o) -> {
      // System.out.println("device join update: " + k + ", " + n);
      final Record r = Record.of();
      for (Map.Entry<String, Integer> entry : this.joinLatest.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      latest.set(r);
      if (!iniLatestJoin) {
        sendToAggregate("addDevice");
        iniLatestJoin = true;
      }
    })
    .isTransient(true);

  // Store Record of Value
  @SwimLane("alert")
  private ValueLane<Value> alert = valueLane().isTransient(true);

  // join Alert store: key: temp4, value: true -> {temp4 : false, soil: true, light: false}
  // key and value could be accessed here Detail
  @SwimLane("join/alert")
  private JoinValueLane<String, Boolean> joinAlert = joinValueLane().keyForm(Form.STRING).valueForm(Form.BOOLEAN)
    .didUpdate((k,n,o) -> {
      // System.out.println("alert join update: " + k + ", " + n);
      final Record r = Record.of();
      for (Map.Entry<String, Boolean> entry : this.joinAlert.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      alert.set(r);
      if (!iniAlertJoin) {
        sendToAggregate("addAlert");
        iniAlertJoin = true;
      }
    })
    .isTransient(true);

  @SwimLane("assignedRobot")
  MapLane<String, Value> assignedRobot = mapLane().keyClass(String.class)
    .didUpdate((k, n, o) -> {
      System.out.println("Device Assigned Robot join update: " + k + ", " + n.toRecon());
      command(k, "robotAck", n);
    })
    .isTransient(true);


  @SwimLane("addRobot")
  CommandLane<Value> addRobot = commandLane()
    .onCommand(v -> {
      Record r = Record.of()
        .slot("robotHost", v.get("robotHost").stringValue())
        .slot("robotNode", v.get("robotNode").stringValue())
        .slot("robotName", v.get("robotName").stringValue());
      assignedRobot.put(v.get("sensorUri").stringValue(), r);
    });

  @SwimLane("addSensor")
  private CommandLane<Value> addSensor = commandLane()
    .onCommand(v -> {
      final String key = v.stringValue();  // "temp4"
      joinLatest.downlink(key)
        .nodeUri("/sensor/"+key) //  "/sensor/temp4"
        .laneUri("latest")
        .open();
      joinAlert.downlink(key)
        .nodeUri("/sensor/"+key)
        .laneUri("alert")
        .open();
    });

  @SwimLane("taskFinish")
  private CommandLane<Value> taskFinish = commandLane()
    .onCommand(v -> {
      String key = "/sensor/" + v.stringValue();
      System.out.println("***** Task Finished on: " + key + "*****");
      command(assignedRobot.get(key).get("robotHost").stringValue(),
        assignedRobot.get(key).get("robotNode").stringValue(),"taskFinish", Value.of(true));
      assignedRobot.remove(key);
    });

  private void sendToAggregate(String laneName) {
    final String aggHost = System.getProperty("aggregate.host.uri", "");
    if (aggHost.isEmpty()) {
      command("/aggregate", laneName, Record.of()
        .slot("node", nodeUri().toUri())
        .slot("key", System.getProperty("device.name", "")));
    } else {
      command(aggHost, "/aggregate", laneName, Record.of()
        .slot("host", hostUri().toUri()) // device.host.uri= ws://192.168.0.150:5620
        .slot("node", nodeUri().toUri()) // /device
        .slot("key", System.getProperty("device.name", "")));  //RaspiPlant4|192.168.0.150:5620
    }
  }

}
