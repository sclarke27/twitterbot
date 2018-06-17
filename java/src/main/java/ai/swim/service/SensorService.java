package ai.swim.service;

import recon.Value;
import swim.api.*;

public class SensorService extends AbstractService {

  private static final int DAY_MS = 1000 * 60 * 60 * 24;
  private static final int RESOLUTION_MS = Integer.parseInt(System.getProperty("sensor.resolution", "60000"));
  private static final int HISTORY_SIZE = DAY_MS / RESOLUTION_MS;
  private static final int SHORT_HISTORY_SIZE = 100;
  private static final int ALERT_HISTORY_SIZE = 10;

  private boolean initJoin = false;

  /**
   * Use a value lane to store a single data item, the class type of the item needs to be specified
   * In this case store value lane is of type Integer
   *
   * didSet is called when the ValueLane gets updated with a new value
   */
  @SwimLane("latest")
  ValueLane<Integer> latest = valueLane().valueClass(Integer.class)
    .didSet((n, o) -> {
      if (!initJoin) {
        senToDeviceBot();
        initJoin = true;
      }
    })
    .isTransient(true);

  /**
   * Use a map lane to store a keyed collection of data items of a specific type. The class type of the key and the
   * data item needs to be specified
   *
   * In this case store the key to the map lane is of type Long and the value of the map lane is of type Integer
   *
   * didUpdate is called when the MapLane gets updated
   */
  @SwimLane("history")
  MapLane<Long, Integer> history = mapLane().keyClass(Long.class).valueClass(Integer.class)
    .didUpdate((key, newValue, oldValue) -> {
      if (this.history.size() > SHORT_HISTORY_SIZE) {
        this.history.drop(this.history.size() - SHORT_HISTORY_SIZE);
      }
    })
    .isTransient(true);

  /**
   * Use a map lane to store a keyed collection of data items of a specific type. The class type of the key and the
   * data item needs to be specified
   *
   * In this case store the key to the map lane is of type Long and the value of the map lane is of type Integer
   *
   * didUpdate is called when the MapLane gets updated
   */
  @SwimLane("shortHistory")
  MapLane<Long, Integer> shortHistory = mapLane().keyClass(Long.class).valueClass(Integer.class)
    .didUpdate((key, newValue, oldValue) -> {
      if (this.shortHistory.size() > SHORT_HISTORY_SIZE) {
        this.shortHistory.drop(this.shortHistory.size() - SHORT_HISTORY_SIZE);
      }
    })
    .isTransient(true);    

  /**
   * Use a value lane to store threshold for current sensor. The class type of the item needs to be specified
   * In this case store value lane is of the type Integer.
   *
   * didSet is called when the ValueLane gets updated with a new value
   */
  @SwimLane("threshold")
  ValueLane<Integer> threshold = valueLane().valueClass(Integer.class)
    .isTransient(true);

  /**
   * Use a command lane to send sensor threshold from UI setting, the class type of the data item needs to be specified
   * In this case the command lane is of type Integer
   */
  @SwimLane("setThreshold")
  CommandLane<Integer> setThreshold = commandLane().valueClass(Integer.class)
    .onCommand(t -> {
      threshold.set(t);
    });

  /**
   * Use a value lane to store option. The class type of the item needs to be specified
   * In this case store value lane is of the type Integer.
   *
   * didSet is called when the ValueLane gets updated with a new value
   */
  @SwimLane("option")
  ValueLane<Integer> option = valueLane().valueClass(Integer.class)
    .isTransient(true);

  /**
   * Use a command lane to send sensor option from UI setting, the class type of the data item needs to be specified
   * In this case the command lane is of type Integer
   */
  @SwimLane("setOption")
  CommandLane<Integer> setOption = commandLane().valueClass(Integer.class)
    .onCommand(t -> {
      option.set(t);
    });

  @SwimLane("robotAssigned")
  ValueLane<Value> robotAssigned = valueLane()
    .didSet((n, o) -> {
      System.out.println("ACK: Robot assigned to this Sensor based on Alert: " + n.toRecon());
    })
    .isTransient(true);

  @SwimLane("robotAck")
  CommandLane<Value> robotAck = commandLane()
    .onCommand(v -> {
      robotAssigned.set(v);
    });

  /**
   * Update robot status and destination after taskFinish
   */
  @SwimLane("taskFinish")
  ValueLane<Boolean> taskFinish = valueLane().valueClass(Boolean.class)
    .didSet((n, o) -> {
      if (n) {
        command("/device", "taskFinish", prop("id"));
        robotAssigned.set(null);
      }
    })
    .isTransient(true);

  /**
   * Use a value value to store alert on current sensor. The class type of item needs to be specified
   * In this case store value lane is of the type Integer.
   *
   */
  @SwimLane("alert")
  ValueLane<Boolean> alert = valueLane().valueClass(Boolean.class)
    .didSet((n, o) -> {
      if (!n && o) {
        taskFinish.set(true);
      } else taskFinish.set(false);
    })
    .isTransient(true);

  /**
   * Use a map lane to store a keyed collection of data items of a specific type. The class type of the key and the
   * data item needs to be specified
   *
   * In this case store the key to the map lane is of type Long and the value of the map lane is of type Integer
   *
   * didUpdate is called when the MapLane gets updated
   */
  @SwimLane("alertHistory")
  MapLane<Long, Integer> alertHistory = mapLane().keyClass(Long.class).valueClass(Integer.class)
    .didUpdate((key, newValue, oldValue) -> {
      if (this.alertHistory.size() > ALERT_HISTORY_SIZE) {
        this.alertHistory.drop(this.alertHistory.size() - ALERT_HISTORY_SIZE);
      }
    })
    .isTransient(true);

  /**
   * Create Alert helper method to monitor device under certain sensor status.
   *
   */
  void checkAlert(Long tm, Integer v) {
    // FIXME: set alert when sensor is below or equal to threshold for now, possible need to set alert when sensor is above threshold in certain circumstance.
    if (v <= threshold.get()) {
      alert.set(true);
      alertHistory.put(tm, 1);
    } else {
      alert.set(false);
      alertHistory.put(tm, 0);
    }
  }

  /**
   * Use a command lane to ingest data from an external client, the class type of the data item needs to be specified
   * In this case the command lane is of type Integer
   */
  @SwimLane("addLatest")
  CommandLane<Integer> addLatest = commandLane().valueClass(Integer.class)
    .onCommand(i -> {
      latest.set(i);
      final long now = System.currentTimeMillis();
      history.put(now / RESOLUTION_MS * RESOLUTION_MS, i);
      shortHistory.put(now, i);
      checkAlert(now, i);
    });

  private void senToDeviceBot() {

    // System.out.println("device.name: " + System.getProperty("device.name", ""));
    // System.out.println("device.name.contains Bot" + System.getProperty("device.name", "").contains("Bot"));

    if (System.getProperty("device.name", "").contains("Plant")){
      command("/device", "addSensor", prop("id"));
    }
    else if (System.getProperty("device.name", "").contains("Bot")) {
      String[] split = System.getProperty("device.name").split("\\|");
      String id = split[0];
      command("/bot/" + id, "addSensor", prop("id"));
    }
  }
}