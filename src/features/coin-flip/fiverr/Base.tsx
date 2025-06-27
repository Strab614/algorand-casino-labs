/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import useSceneStore, { SceneStore } from "./store";
import * as THREE from "three";
import { Ground } from "./Ground";

//const hitSound = new Audio("/audio/hit1.wav");
//const hit2Sound = new Audio("/audio/hit2.wav");

function Base() {
  const {
    setFlipCoinFn,
    fallCoin,
    setFallCoin,
    setOutcome,
    canFlip,
    setCanFlip,
    setInit,
    init,
    outcome,
  } = useSceneStore((state: SceneStore) => state);

  const coinRef = useRef<any>(null);
  const [headTex, tailTex, edgeTex] = useTexture([
    "/images/coin-flip/HEADS.png",
    "/images/coin-flip/TAILS.png",
    "/images/texture/coin/edge.jpg",
  ]);

  // camera controls
  const { camera } = useThree();

  useFrame(() => {
    camera.lookAt(-1.6, 0, 0);
  });

  const flipCoin = () => {
    if (!coinRef.current || !canFlip) return;
    if (!init) setInit(true);
    setFallCoin(false);
    setOutcome(null);
    setCanFlip(false);

    coinRef.current.setTranslation(
      { x: -1.5, y: coinRef.current.translation().y, z: 0 },
      false
    );
    coinRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, false);
    coinRef.current.setLinvel({ x: 0, y: 0, z: 0 }, false);
    coinRef.current.setAngvel({ x: 0, y: 0, z: 0 }, false);

    const randomTorque = {
      x: 0.8,
      y: 0,
      z: 0,
    };
    coinRef.current.applyImpulse({ x: 0, y: 0.1, z: 0 }, false);
    coinRef.current.applyTorqueImpulse(randomTorque, false);
  };

  useFrame(() => {
    const rb = coinRef.current;

    // todo: consider checking if outcome is set
    if (!rb) {
      return;
    }

    const vel = rb.linvel();
    const ang = rb.angvel();
    const pos = rb.translation();

    if (!fallCoin && pos.y > 2) {
      rb.setGravityScale(0, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setAngvel({ x: 9, y: 0, z: 0 }, true);
    }

    if (init && fallCoin && pos.y < 1.95) {
      setFallCoin(false);
    }

    if (fallCoin && init) {
      const r = rb.rotation();
      const quat = new THREE.Quaternion(r.x, r.y, r.z, r.w);

      const up = new THREE.Vector3(0, 1, 0);
      up.applyQuaternion(quat); // Rotate up vector

      const worldUp = new THREE.Vector3(0, 1, 0);
      // const worldDown = new THREE.Vector3(0, -1, 0);

      const angleUp = up.angleTo(worldUp); // 0 degrees = perfect up
      //const angleDown = up.angleTo(worldDown); // 0 degrees = perfect down

      if (angleUp < 0.2) {
        rb.setAngvel({ x: 0, y: 0, z: 0 }, true);

        if (outcome === "heads") {
          //console.log("Coin landed heads up!");
          rb.setGravityScale(1, false);
          rb.setAngvel({ x: 9, y: 0, z: 0 }, true);
        } else {
          // console.log("Need to nudge for tails!");
          rb.setGravityScale(1, false);
          rb.setAngvel({ x: 7.5, y: 0, z: 0 }, true);
        }
      }
    }

    const isSleeping =
      Math.abs(vel.x) < 0.01 &&
      Math.abs(vel.y) < 0.01 &&
      Math.abs(vel.z) < 0.01 &&
      Math.abs(ang.x) < 0.01 &&
      Math.abs(ang.y) < 0.01 &&
      Math.abs(ang.z) < 0.01;

    if (isSleeping) {
      // const rotation = rb.rotation();
      // const up =
      //   rotation.w * rotation.w -
      //   rotation.x * rotation.x -
      //   rotation.y * rotation.y +
      //   rotation.z * rotation.z;

      // const outcome = up > 0 ? "heads" : "tails";
      // setResult(outcome);
      setCanFlip(true);
    }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setFlipCoinFn(flipCoin), [setFlipCoinFn]);

  return (
    <>
      {/* COIN */}
      <RigidBody
        ref={coinRef}
        restitution={0.1}
        colliders={false}
        friction={0.1}
        mass={3}
        name="coin"
        position-y={4}
        position-x={-1.5}
        onCollisionEnter={() => {
          // hitSound.currentTime = 0;
          // hitSound.play();
        }}
        onCollisionExit={() => {
          // hit2Sound.currentTime = 0;
          //hit2Sound.play();
        }}
      >
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 64]} />
          <meshStandardMaterial map={edgeTex} attach="material-0" />
          <meshStandardMaterial map={headTex} attach="material-1" />
          <meshStandardMaterial map={tailTex} attach="material-2" />
        </mesh>
        <CylinderCollider args={[0.1, 0.5]} />
        {/* Side */}
        {/* <CuboidCollider
          args={[0.5, 0.005, 0.5]}
          position={[0, 0.025, 0]}
        />{" "} */}
        {/* Heads */}
        {/* <CuboidCollider
          args={[0.5, 0.005, 0.5]}
          position={[0, -0.025, 0]}
        />{" "} */}
        {/* Tails */}
      </RigidBody>

      {/* GROUND */}
      <Ground />
    </>
  );
}

export default Base;
