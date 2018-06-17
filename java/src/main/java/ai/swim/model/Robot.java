package ai.swim.model;

import recon.Form;
import recon.Item;
import recon.Record;
import recon.Value;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class Robot {
  String name;
  String status; // available, offline, working
  Map<String, String> destination;

  public static final Robot EMPTY = new Robot("",null, null);

  public Robot(String name, String status, Map<String, String> destination) {
    this.name = name;
    this.status = status;
    this.destination = destination;
  }

  public String getName() {
    return name;
  }

  public String getStatus() {
    return status;
  }

  public Map<String, String> getDestination() {
    return destination;
  }

  public Robot withName(String name) {
    this.name = name;
    return this;
  }

  public Robot withStatus(String status) {
    this.status = status;
    return this;
  }

  public Robot withDestination(String key, String value ) {
    this.destination.put(key, value);
    return this;
  }

  public boolean hasDestination() {
    return destination != null && destination.size() > 0;
  }

  public void workStart() {
    if (status.equals("AVAILABLE")) {
      status = "WORKING";
      // TODO: Do the work to fix problem
    }
  }

  public void workFinish(Boolean done) {
    if (done) {
      status = "AVAILABLE";
      destination = null;
    }
  }

  public void work() {
    // Add work task later
    // Simulation work for Robot now
    //for (int i = 0; i <= 10; i++) {

    System.out.println("Robot Java Class Got to : " +
      destination.get("sensorUri") + ", " + destination.get("deviceHost") + ", " + destination.get("deviceName") + " working on status: " + status + ". " +
      "Name: " + name);
    //}
    // Call back to workFinish
    // workFinish(true);
  }

  public Value toValue() { return FORM.mold(this); }

  public boolean isEmpty() { return this.equals(EMPTY); }

  public boolean isNotEmpty() { return !isEmpty(); }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Robot robot = (Robot) o;
    return status == robot.status &&
      Objects.equals(name, robot.name) &&
      Objects.equals(destination, robot.destination);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, status, destination);
  }

  @Override
  public String toString() {
    final StringBuilder sb = new StringBuilder(' ').append("Robot(");
    sb.append("name='").append(name).append('\'');
    sb.append("status='").append(status).append('\'');
    if (hasDestination()) {
      sb.append(", destination='").append(destination).append('\'');
    }
    sb.append(")");
    return sb.toString();
  }

  public static final Form<Robot> FORM = new RobotForm();
}

final class RobotForm extends Form<Robot> {
  @Override
  public String getTag() { return "robot"; }

  @Override
  public Class<?> getType() { return Robot.class; }

  @Override
  public Value mold(Robot robot) {
    final Record record = Record.of()
      .attr(getTag(), robot.getName());
    record.slot("status", robot.getStatus());

    final Record dest = Record.of();
    if (robot.hasDestination()) {
      for (Map.Entry<String, String> entry : robot.getDestination().entrySet()) {
        dest.slot(entry.getKey(), entry.getValue());
      }
      record.slot("destination", dest);
    }
    return record;
  }

  @Override
  public Robot cast(Value value) {
    final Value tag = value.getAttr(getTag());
    if (!tag.isAbsent()) {
      final String name = tag.getValue().stringValue();
      String status = value.get("status").stringValue();
      Map<String, String> destination = new HashMap<>();
      if (!value.get("destination").isAbsent()) {
        for (Item item: value.get("destination")) {
          destination.put(item.getKey().stringValue(), item.getValue().stringValue());
        }
      }
      return new Robot(name, status, destination);
    }
    return Robot.EMPTY;
  }
}
