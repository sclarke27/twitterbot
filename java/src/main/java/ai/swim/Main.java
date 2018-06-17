package ai.swim;

import ai.swim.service.*;
import ai.swim.util.SerialReader;
import recon.Recon;
import recon.Value;
import swim.api.*;
import swim.http.headers.Server;
import swim.server.ServerDef;
import swim.server.SwimPlane;
import swim.server.SwimServer;
import swim.util.Decodee;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Main extends AbstractPlane {

  private static int PORT;
  public static int getSwimPort() { return PORT; }

  // define the uri for a service with @SwimRoute annotation. Specify dynamic portions of the route with a : prefix
  // All instances of the A service will have a URI of the form /a/:id
  @SwimRoute("/sensor/:id")
  final ServiceType<?> sensorService = serviceClass(SensorService.class);

  @SwimRoute("/device")
  final ServiceType<?> deviceService = serviceClass(DeviceService.class);

  @SwimRoute("/bot/:id")
  final ServiceType<?> botService = serviceClass(BotService.class);

  @SwimRoute("/aggregate")
  final ServiceType<?> aggregateService = serviceClass(AggregateService.class);

  @SwimRoute("/zone")
  final ServiceType<?> zoneService = serviceClass(ZoneService.class);

  public static void main(String[] args) throws InterruptedException, IOException {
    // Load any system properties from a file
    loadConfig();

    // Instantiate a swim server
    final SwimServer server = new SwimServer();
    final ServerDef sd = loadReconConfig(args);
    PORT = sd.getOutletDefs().headValue().getPort();
    System.out.println("Listening on port: " + PORT);
    server.materialize(loadReconConfig(args));

    final SwimPlane plane = server.getPlane("senmon-demo");

    // Run the swim server, this stays alive until termination
    server.run();

//    plane.command("/sensor/humidity", "unused", Value.of("wakeup"));
//    plane.command("/sensor/temperature", "unused", Value.of("wakeup"));
//
//    //plane.command("/bot/4", "status", Value.of("WORKING"));
//    plane.command("/bot/4", "unused", Value.of("wakeup"));
//    plane.command("/bot/5", "unused", Value.of("wakeup"));
//
//    Thread.sleep(1000);
//    plane.command("/sensor/humidity", "setThreshold", Value.of(50));
//
//    plane.command("/sensor/humidity", "addLatest", Value.of(48));
//    plane.command("/sensor/temperature", "addLatest", Value.of(5));
//    plane.command("/bot/4", "addLatest", Value.of(1));
//    plane.command("/bot/5", "addLatest", Value.of(1));
//    Thread.sleep(100);
//
//    plane.command("/sensor/humidity", "addLatest", Value.of(49));
//    plane.command("/sensor/temperature", "addLatest", Value.of(5));
//    plane.command("/bot/4", "addLatest", Value.of(1));
//    plane.command("/bot/5", "addLatest", Value.of(1));
//    Thread.sleep(100);
//
//    plane.command("/sensor/humidity", "addLatest", Value.of(50));
//    plane.command("/sensor/temperature", "addLatest", Value.of(5));
//    plane.command("/bot/4", "addLatest", Value.of(1));
//    plane.command("/bot/5", "addLatest", Value.of(1));
//    Thread.sleep(100);
//
//    plane.command("/sensor/humidity", "addLatest", Value.of(51));
//    plane.command("/sensor/temperature", "addLatest", Value.of(5));
//    plane.command("/bot/4", "addLatest", Value.of(1));
//    plane.command("/bot/5", "addLatest", Value.of(1));
//    Thread.sleep(100);
//
//    plane.command("/sensor/humidity", "addLatest", Value.of(52));
//    plane.command("/sensor/temperature", "addLatest", Value.of(5));
//    plane.command("/bot/4", "addLatest", Value.of(1));
//    plane.command("/bot/5", "addLatest", Value.of(1));
//    Thread.sleep(100);

//    for (int i = 1; i < 100; i++) {
//      plane.command("/sensor/light", "addLatest", Value.of(i));
//      plane.command("/sensor/soil", "addLatest", Value.of(i));
//      plane.command("/sensor/temperatureCh1", "addLatest", Value.of(i));
//      Thread.sleep(100);
//    }

    doSerial(plane);
  }

  private static void loadConfig() {
    final String propFileLocation = System.getProperty("app.config", "/raspi-app.properties");
    final File propFile = new File(propFileLocation);
    Properties props = new Properties(System.getProperties());
    try {
      if (propFile.exists()) {
        props.load(new FileInputStream(propFile));
      } else {
        props.load(Main.class.getResourceAsStream(propFileLocation));
      }
    } catch (IOException e) {
      System.out.println("[WARN] No properties file detected");
    }
    System.setProperties(props);
  }

  private static void doSerial(SwimPlane plane) {
    final String serialPort = System.getProperty("serial.port", "");
    if (!serialPort.isEmpty()) {
      // Polls forever in the main thread
      new SerialReader(plane, serialPort).poll();
    } else {
      System.out.println("[WARN] No serial property found. Serial feed to SWIM must now be provided by another process");
    }
  }

  private static String getConfigPath(String[] args, String property, String defaultPath) {
    String configPath;
    if (args.length > 0) {
      // 1. Command-line argument takes highest precedence...
      return args[0];
    } else {
      // 2. followed by a system property...
      configPath = System.getProperty(property);
      return configPath == null ? defaultPath : configPath;
    }
  }

  private static Value loadRecon(String[] args, String property, String defaultPath) throws IOException {
    InputStream input = null;
    Value value;
    try {
      final File file = new File(getConfigPath(args, property, defaultPath));
      if (file.exists()) {
        // 3. followed by the defaultPath argument...
        input = new FileInputStream(file);
      } else {
        // 4. followed by assuming the file is stored as a resource in the .jar
        input = Main.class.getResourceAsStream(defaultPath);
      }
      value = Decodee.readUtf8(Recon.FACTORY.blockParser(), input);
    } finally {
      try {
        if (input != null) input.close();
      } catch (Exception ignored) {}
    }
    return value;
  }

  private static ServerDef loadReconConfig(String[] args) throws IOException {
    return ServerDef.FORM.cast(
      loadRecon(args, "swim.config", "/sensorMonitorDemo.recon")
    );
  }
}
