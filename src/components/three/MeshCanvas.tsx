"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function AnimatedMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(4, 2), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        color="#00f5ff"
        wireframe
        transparent
        opacity={0.06}
      />
    </mesh>
  );
}

function PulseWaves() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });
  return (
    <group ref={group}>
      {[3, 5, 7].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <ringGeometry args={[r, r + 0.05, 64]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.08 - i * 0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function MeshCanvas() {
  return (
    <Canvas
      className="!fixed inset-0 pointer-events-none opacity-40"
      camera={{ position: [0, 0, 12], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00f5ff" />
      <AnimatedMesh />
      <PulseWaves />
    </Canvas>
  );
}
