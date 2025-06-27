import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function Ground() {
  const colorMap = useTexture("/images/texture/floor/wood_floor_deck_diff_1k.jpg");
  const normalMap = useTexture("/images/texture/floor/wood_floor_deck_nor_gl_1k.jpg");
  const roughMap = useTexture("/images/texture/floor/wood_floor_deck_rough_1k.jpg");
  const aoMap = useTexture("/images/texture/floor/wood_floor_deck_ao_1k.jpg");

  colorMap.repeat.set(1, 2);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  normalMap.repeat.set(1, 2);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;

  roughMap.repeat.set(1, 2);
  roughMap.wrapS = THREE.RepeatWrapping;
  roughMap.wrapT = THREE.RepeatWrapping;

  aoMap.repeat.set(1, 2);
  aoMap.wrapS = THREE.RepeatWrapping;
  aoMap.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow castShadow>
        <planeGeometry args={[10, 20]} />
        <meshStandardMaterial side={THREE.FrontSide} map={colorMap} normalMap={normalMap} roughnessMap={roughMap} aoMap={aoMap} />
      </mesh>
      <RigidBody type="fixed" colliders="cuboid" position={[-1.5, 0, 0]}>
        <mesh rotation-x={-Math.PI / 2} position-y={0}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial side={THREE.FrontSide} wireframe={false} opacity={0} transparent />
        </mesh>
      </RigidBody>
    </>
  );
}
