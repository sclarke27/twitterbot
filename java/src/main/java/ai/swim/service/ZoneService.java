package ai.swim.service;

import recon.Form;
import recon.Value;
import swim.api.*;


public class ZoneService extends AbstractService {

  @SwimLane("join/latest")
  MapLane<String, Value> joinLatest = mapLane().keyForm(Form.STRING)
    .didUpdate((k,n,o) -> {
      // System.out.println("Zone join update: " + k + ", " + n.toRecon());
    })
    .isTransient(true);

  @SwimLane("fullInfoLatest")
  MapLane<String, Value> fullInfoLatest = mapLane().keyForm(Form.STRING)
    .didUpdate((k, n, o) -> {
      // System.out.println("Zone full info update: " + k + ", " + n.toRecon());
    })
    .isTransient(true);

  @SwimLane("addAgg")
  private CommandLane<Value> addAgg = commandLane()
    .onCommand(v -> {
      joinLatest.put(v.get("key").stringValue(), v.get("data"));
      if (!v.get("host").stringValue().isEmpty()) {
        fullInfoLatest.put(v.get("key").stringValue().concat("-").concat(v.get("host").stringValue()), v.get("data"));
      }
    });

}
