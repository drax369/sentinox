"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { AssistantState } from "@/types";

const holoVertex = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const holoFragment = `
  uniform float uTime;
  uniform float uSpeak;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    float scan = sin(vPosition.y * 20.0 + uTime * 3.0) * 0.5 + 0.5;
    float pulse = 0.6 + uSpeak * 0.4;
    vec3 col = uColor * (fresnel * 0.8 + scan * 0.3) * pulse;
    gl_FragColor = vec4(col, fresnel * 0.7 + 0.15);
  }
`;

function HeadMesh({ state }: { state: AssistantState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => new THREE.SphereGeometry(1.2, 32, 32), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeak: { value: 0 },
      uColor: { value: new THREE.Color("#00f5ff") },
    }),
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      const speak =
        state === "speaking" ? 0.5 + Math.sin(t * 12) * 0.3 : state === "listening" ? 0.3 : 0.1;
      materialRef.current.uniforms.uSpeak.value = speak;
    }
    if (meshRef.current) {
      const breath = 1 + Math.sin(t * 1.5) * 0.02;
      meshRef.current.scale.setScalar(breath);
      if (state === "thinking") {
        meshRef.current.rotation.y += delta * 0.3;
      }
    }
    const eyeOffset = state === "listening" ? 0.08 : 0.03;
    [eyeL, eyeR].forEach((eye, i) => {
      if (eye.current) {
        eye.current.position.x = (i === 0 ? -0.35 : 0.35) + mouse.current.x * eyeOffset;
        eye.current.position.y = 0.25 + mouse.current.y * eyeOffset;
      }
    });
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group>
        <mesh ref={meshRef} geometry={geometry}>
          <shaderMaterial
            ref={materialRef}
            vertexShader={holoVertex}
            fragmentShader={holoFragment}
            uniforms={uniforms}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={eyeL} position={[-0.35, 0.25, 1.05]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#00f5ff" />
        </mesh>
        <mesh ref={eyeR} position={[0.35, 0.25, 1.05]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#00f5ff" />
        </mesh>
        {state === "listening" && (
          <mesh position={[0, -1.8, 0]}>
            <ringGeometry args={[0.5, 0.55, 32]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

interface HolographicFaceProps {
  state?: AssistantState;
  className?: string;
}

export function HolographicFace({ state = "idle", className }: HolographicFaceProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#00f5ff" />
        <pointLight position={[-2, -1, 1]} intensity={0.5} color="#a855f7" />
        <HeadMesh state={state} />
      </Canvas>
    </div>
  );
}
