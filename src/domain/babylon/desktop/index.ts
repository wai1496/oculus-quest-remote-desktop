import { SceneEventArgs } from "../../../components/scene";
import * as BABYLON from "babylonjs";

export default async function createDesktop(
  e: SceneEventArgs,
  stream: MediaStream
) {
  const { canvas, scene, engine } = e;

  console.log({ stream });

  const ground = BABYLON.MeshBuilder.CreatePlane(
    "ground1",
    { width: 2 * 1.7, height: 2 },
    scene
  );

  const mat = new BABYLON.StandardMaterial("mat", scene);

  const videoTexture = await BABYLON.VideoTexture.CreateFromStreamAsync(
    scene,
    stream
  );

  videoTexture.uScale = 1;
  videoTexture.vScale = -1;

  mat.diffuseTexture = videoTexture;
  ground.material = mat;

  ground.position = new BABYLON.Vector3(0, 3, 0);
  ground.rotation = new BABYLON.Vector3(0, 0, 0);

  scene.onPointerUp = () => {
    videoTexture.video.play();
  };
}
