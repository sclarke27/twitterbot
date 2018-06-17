package ai.swim.service;

import ai.swim.Main;
import ai.swim.model.Robot;
import recon.Form;
import recon.Record;
import recon.Value;
import swim.api.*;
import swim.util.Uri;

import java.util.Map;


public class BotService extends AbstractService {

  private boolean iniJoin = false;

  // FIXME: Remove function when core is fixed.
  @Override
  public Uri hostUri() {
    return Uri.parse(
      "ws://" +
        System.getProperty("device.host.uri", "localhost") +
        ":" + Main.getSwimPort());
  }

  /**
   * Robot Instance and Properties initialization and assignment
   */

  @SwimLane("robotInstance")
  ValueLane<Robot> robotInstance = valueLane().valueForm(Robot.FORM)
    .isTransient(true);

  @SwimLane("name")
  ValueLane<String> name = valueLane().valueClass(String.class)
    .didSet((n, o) -> {
      robotInstance.set(robotInstance.get().withName(n));
    })
    .isTransient(true);

  @SwimLane("destination")
  MapLane<String, String> destination = mapLane()
    .keyClass(String.class)
    .valueClass(String.class)
    .didUpdate((k, n ,o ) -> {
      System.out.println("Bot new Destination join update: " + k + ", " + n);
      robotInstance.set(robotInstance.get().withDestination(k, n));
    })
    .isTransient(true);

  @SwimLane("plantName")
  ValueLane<String> plantName = valueLane()
    .valueForm(Form.STRING)
    .isTransient(true);

  @SwimLane("status")
  ValueLane<String> status = valueLane().valueClass(String.class)
    .didSet((n, o) -> {
      System.out.println("Robot status: " + n);
      robotInstance.set(robotInstance.get().withStatus(n));
      if (n.equals("WORKING")) {
        robotInstance.get().work();
      }
    })
    .isTransient(true);



  @SwimLane("addDestination")
  CommandLane<Value> addDestination = commandLane()
    .onCommand(v -> {
      String deviceHost = v.get("deviceHost").stringValue();
      String deviceName = v.get("deviceName").stringValue();
      String sensorUri = v.get("sensorUri").stringValue();

      destination.put("deviceHost", deviceHost);
      destination.put("deviceName", deviceName);
      destination.put("sensorUri", sensorUri);

      String[] nameOnly = deviceName.split("\\|");
      plantName.set(nameOnly[0]);

      status.set("WORKING");

      Record r = Record.of()
        .slot("robotHost", hostUri().toUri())
        .slot("robotNode", nodeUri().toUri())
        .slot("robotName", System.getProperty("device.name", ""))
        .slot("sensorUri", sensorUri);

      command(deviceHost, "/device", "addRobot", r);

    });

  @SwimLane("latest")
  private ValueLane<Value> latest = valueLane().isTransient(true);

  @SwimLane("join/latest")
  private JoinValueLane<String, Integer> joinLatest = joinValueLane().keyForm(Form.STRING).valueForm(Form.INTEGER)
    .didUpdate((k,n,o) -> {
      // System.out.println("Robot join update: " + k + ", " + n);
      final Record r = Record.of();
      for (Map.Entry<String, Integer> entry : this.joinLatest.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      latest.set(r);
      if (!iniJoin) {
        iniSetUp();
        doJoin();
        iniJoin = true;
      }
    })
    .isTransient(true);

  @SwimLane("addSensor")
  private CommandLane<Value> addSensor = commandLane()
    .onCommand(v -> {
      final String key = v.stringValue();  // "temp4"
      joinLatest.downlink(key)
        .nodeUri("/sensor/"+key) //  "/sensor/temp4"
        .laneUri("latest")
        .open();
    });

  @SwimLane("taskFinish")
  CommandLane<Value> taskFinish = commandLane()
    .onCommand(v -> {
      status.set("AVAILABLE");
      destination.drop(3);
      plantName.set(null);
      robotInstance.get().workFinish(true);

    });

  void iniSetUp() {
    name.set(prop("id").stringValue());
    if (status.get().isEmpty()) {
      status.set("AVAILABLE");
    }
  }

  private void doJoin(){

    final String aggHost = System.getProperty("aggregate.host.uri", "");
    if (aggHost.isEmpty()) {
      command("/aggregate", "addBot", Record.of()
        .slot("node", nodeUri().toUri())
        .slot("key", System.getProperty("device.name", "")));
    } else {
      command(aggHost, "/aggregate", "addBot", Record.of()
        .slot("host", hostUri().toUri()) // ws://192.168.0.151:5620
        .slot("node", nodeUri().toUri()) // /bot/6
        .slot("key", System.getProperty("device.name", "")));// RaspiBot6|192.168.0.151:5620
    }
  }

}
