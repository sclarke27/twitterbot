package ai.swim.util;

import com.fazecast.jSerialComm.*;
import recon.*;
import swim.server.SwimPlane;

public class SerialReader {

  private final SwimPlane sp;
  private final SerialPort commPort;

  public SerialReader(SwimPlane sp, String commPort) {
    this.sp = sp;
    this.commPort = SerialPort.getCommPort(commPort);
  }

  private static Record sanitize(String s) {
    try {
      return Record.parseJson(s);
    } catch (Exception e) {
      return Record.EMPTY;
    }
  }

  private void sendToSwim(String s) {
    for (Item i: sanitize(s)) {
      final Slot slot = i.asSlot();
      sp.command("/sensor/"+slot.getKey(), "addLatest", slot.getValue());
    }
  }

  public void poll() {
    commPort.setBaudRate(115200);
    commPort.openPort();
    try {
      int tries = 0;
      while (!commPort.isOpen() && tries++ < 10) {
        Thread.sleep(1000);
      }
      if (!commPort.isOpen()) {
        System.out.println("Failed to open commPort. Aborting...");
        System.exit(-1);
      }
      StringBuilder sb = new StringBuilder(256);
      while (true) {
        while (commPort.bytesAvailable() == 0) {
          Thread.sleep(20);
        }
        byte[] readBuffer = new byte[commPort.bytesAvailable()];
        commPort.readBytes(readBuffer, readBuffer.length);
        for (char b: new String(readBuffer, "UTF-8").toCharArray()) {
          if (b == '}') {
            sb.append(b);
            sendToSwim(sb.toString());
            sb = new StringBuilder(256);
          } else if (b == '\r' || b == '\n') {

          } else {
            sb.append(b);
          }
        }
      }
    } catch (Exception e) { e.printStackTrace(); }
    commPort.closePort();
  }
}