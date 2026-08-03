import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

// Individual Orbiting Shape - using lightweight meshStandardMaterial
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
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.6}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Interactive Floating Resume Document - optimized material and segments
function ResumeDocument() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.18;
      meshRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.5) * 0.08;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={meshRef}>
        {/* Document Board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 4.2, 0.1]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.2}
            metalness={0.05}
            transparent
            opacity={0.92}
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
        <mesh position={[-0.7, 1.0, 0.06]}>
          <planeGeometry args={[1.2, 0.1]} />
          <meshBasicMaterial color="#2e2520" />
        </mesh>

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

// Background Particle System forming "AI" / Neural Network (Optimized count: 160)
function AIParticles() {
  const pointsRef = useRef();

  const [positions] = useMemo(() => {
    const count = 160;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 5.5 + Math.random() * 7;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    return [positions];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.06;
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
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ResumeScene3D() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  // Pause render loop when canvas is scrolled out of viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.5)}
        frameloop={isVisible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.3} />
        <pointLight position={[-10, -10, -5]} intensity={0.4} />
        <pointLight position={[0, 5, 5]} intensity={0.9} color="#f59e0b" />

        <ResumeDocument />

        {/* Orbiting shapes around the resume */}
        <OrbitingShape
          geometry={<torusGeometry args={[0.5, 0.12, 16, 32]} />}
          color="#f59e0b"
          speed={0.7}
          radius={3.8}
          scale={0.8}
          positionY={1.5}
        />
        <OrbitingShape
          geometry={<octahedronGeometry args={[0.6]} />}
          color="#fbbf24"
          speed={-0.5}
          radius={4.2}
          scale={0.7}
          positionY={-1}
        />
        <OrbitingShape
          geometry={<icosahedronGeometry args={[0.5]} />}
          color="#d97706"
          speed={0.4}
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
