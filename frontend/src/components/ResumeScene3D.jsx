import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

// Individual Orbiting Shape
function OrbitingShape({ geometry, color, speed, radius, scale, positionY = 0 }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * speed;
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(time) * radius;
      meshRef.current.position.z = Math.sin(time) * radius;
      meshRef.current.position.y = positionY + Math.sin(time * 2) * 0.5;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      {geometry}
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.8}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transmission={0.6}
        thickness={0.5}
      />
    </mesh>
  );
}

// Interactive Floating Resume Document
function ResumeDocument() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      meshRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef}>
        {/* Document Board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 4.2, 0.1]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.1}
            transmission={0.6}
            thickness={1.5}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Profile Header Block */}
        <mesh position={[-0.8, 1.4, 0.06]}>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial color="#d97706" transparent opacity={0.9} />
        </mesh>
        
        {/* Profile Pic Placeholder */}
        <mesh position={[0.9, 1.4, 0.06]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial color="#e7e5e4" />
        </mesh>

        {/* Text lines details */}
        {/* Header Name Line */}
        <mesh position={[-0.7, 1.0, 0.06]}>
          <planeGeometry args={[1.2, 0.1]} />
          <meshBasicMaterial color="#2e2520" />
        </mesh>

        {/* Subtitle */}
        <mesh position={[-0.9, 0.8, 0.06]}>
          <planeGeometry args={[0.8, 0.05]} />
          <meshBasicMaterial color="#78716c" />
        </mesh>

        {/* Section 1 */}
        <mesh position={[-1.0, 0.4, 0.06]}>
          <planeGeometry args={[0.6, 0.08]} />
          <meshBasicMaterial color="#d97706" />
        </mesh>
        <mesh position={[0, 0.2, 0.06]}>
          <planeGeometry args={[2.6, 0.04]} />
          <meshBasicMaterial color="#e7e5e4" />
        </mesh>
        <mesh position={[0, 0.05, 0.06]}>
          <planeGeometry args={[2.6, 0.04]} />
          <meshBasicMaterial color="#e7e5e4" />
        </mesh>

        {/* Section 2 */}
        <mesh position={[-1.0, -0.3, 0.06]}>
          <planeGeometry args={[0.6, 0.08]} />
          <meshBasicMaterial color="#d97706" />
        </mesh>
        <mesh position={[0, -0.5, 0.06]}>
          <planeGeometry args={[2.6, 0.04]} />
          <meshBasicMaterial color="#e7e5e4" />
        </mesh>
        <mesh position={[0, -0.65, 0.06]}>
          <planeGeometry args={[2.6, 0.04]} />
          <meshBasicMaterial color="#e7e5e4" />
        </mesh>
        <mesh position={[0, -0.8, 0.06]}>
          <planeGeometry args={[1.8, 0.04]} />
          <meshBasicMaterial color="#e7e5e4" />
        </mesh>
      </group>
    </Float>
  );
}

// Background Particle System forming "AI" / Neural Network
function AIParticles() {
  const pointsRef = useRef();

  const [positions, sizes] = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 6 + Math.random() * 8;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = Math.random() * 0.15 + 0.05;
    }

    return [positions, sizes];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f59e0b"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ResumeScene3D() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <pointLight position={[0, 5, 5]} intensity={1} color="#f59e0b" />

        <ResumeDocument />

        {/* Orbiting shapes around the resume */}
        <OrbitingShape
          geometry={<torusGeometry args={[0.5, 0.15, 16, 100]} />}
          color="#f59e0b"
          speed={0.8}
          radius={3.8}
          scale={0.8}
          positionY={1.5}
        />
        <OrbitingShape
          geometry={<octahedronGeometry args={[0.6]} />}
          color="#fbbf24"
          speed={-0.6}
          radius={4.2}
          scale={0.7}
          positionY={-1}
        />
        <OrbitingShape
          geometry={<icosahedronGeometry args={[0.5]} />}
          color="#d97706"
          speed={0.5}
          radius={3.5}
          scale={0.8}
          positionY={0.5}
        />

        <AIParticles />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
