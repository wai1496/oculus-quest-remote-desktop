import React from "react";
import * as BABYLON from "babylonjs";
import BabylonScene, { SceneEventArgs } from "../components/scene";
import { History } from "history";
import createDesktop from "../domain/babylon/desktop";
import { join, create } from "../domain/webrtc/signaling";

export default class PageWithScene extends React.Component<
  { history: History },
  { stream?: MediaStream }
> {
  constructor(props: any) {
    super(props);
    this.state = { stream: undefined };
  }

  connect = async () => {
    const peer = await create("quest", false);
    console.log({ peer });
    this.setState({ stream: peer.remoteStream });
  };

  onSceneMount = async (e: SceneEventArgs) => {
    const { canvas, scene, engine } = e;

    // Create simple sphere
    const sphere = BABYLON.Mesh.CreateIcoSphere(
      "sphere",
      { radius: 0.2, flat: true, subdivisions: 1 },
      scene
    );
    sphere.position.y = 3;
    sphere.material = new BABYLON.StandardMaterial("sphere material", scene);

    // Lights and camera
    const light = new BABYLON.DirectionalLight(
      "light",
      new BABYLON.Vector3(0, -0.5, 1.0),
      scene
    );
    light.position = new BABYLON.Vector3(0, 5, -2);
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 4,
      3,
      new BABYLON.Vector3(0, 3, 0),
      scene
    );
    camera.attachControl(canvas, true);
    (scene.activeCamera as any).beta += 0.8;

    // Default Environment
    const environment = scene.createDefaultEnvironment({
      enableGroundShadow: true,
      groundYBias: 1
    });
    environment!.setMainColor(BABYLON.Color3.FromHexString("#74b9ff"));

    // Shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    shadowGenerator.addShadowCaster(sphere, true);

    // Enable VR
    const vrHelper = scene.createDefaultVRExperience({
      createDeviceOrientationCamera: false
    });
    vrHelper.enableTeleportation({ floorMeshes: [environment!.ground!] });

    // Runs every frame to rotate the sphere
    scene.onBeforeRenderObservable.add(() => {
      sphere.rotation.y += 0.0001 * scene.getEngine().getDeltaTime();
      sphere.rotation.x += 0.0001 * scene.getEngine().getDeltaTime();

      if (this.state.stream) {
        console.log("exist");
        createDesktop(e, this.state.stream);
        this.setState({ stream: undefined });
      }
    });

    engine.runRenderLoop(() => {
      if (scene) {
        scene.render();
      }
    });
  };

  render() {
    return (
      <div>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => {
              this.props.history.push("cast");
            }}
          >
            cast
          </button>
          <button onClick={this.connect}>connect</button>
        </div>
        <BabylonScene
          onSceneMount={this.onSceneMount}
          height={400}
          width={600}
        />
      </div>
    );
  }
}
