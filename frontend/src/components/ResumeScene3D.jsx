import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// Glowing Background Aura Mesh
function AuraGlow() {
  return (
    <mesh position={[0, 0, -1.2]}>
      <planeGeometry args={[7, 7]} />
      <meshBasicMaterial
        color="#e2e8f0"
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </mesh>
  );
}

// Interactive 3D Resume Document Card
function ResumeDocumentCard({ pointer }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth subtle floating & mouse hover tilt
      const t = state.clock.getElapsedTime();
      const targetRotY = Math.sin(t * 0.6) * 0.1 + (pointer?.x || 0) * 0.12;
      const targetRotX = Math.cos(t * 0.5) * 0.05 - (pointer?.y || 0) * 0.1;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.06);
      groupRef.current.position.y = -0.35 + Math.sin(t * 1.0) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.35, 0]}>
      {/* Main Resume Sheet */}
      <RoundedBox args={[2.8, 3.8, 0.1]} radius={0.12} smoothness={2}>
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.2}
          metalness={0.05}
        />
      </RoundedBox>

      {/* Header Accent Bar */}
      <RoundedBox args={[1.1, 0.18, 0.04]} radius={0.04} position={[-0.55, 1.35, 0.07]}>
        <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.3} />
      </RoundedBox>

      {/* Avatar Circle */}
      <mesh position={[0.8, 1.35, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.04, 20]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.4} />
      </mesh>

      {/* Header Text Line Details */}
      <RoundedBox args={[0.9, 0.08, 0.03]} radius={0.02} position={[-0.65, 1.12, 0.07]}>
        <meshStandardMaterial color="#2e2520" />
      </RoundedBox>

      <RoundedBox args={[0.65, 0.06, 0.03]} radius={0.02} position={[-0.78, 0.96, 0.07]}>
        <meshStandardMaterial color="#78716c" />
      </RoundedBox>

      {/* Divider */}
      <RoundedBox args={[2.3, 0.03, 0.02]} radius={0.01} position={[0, 0.78, 0.07]}>
        <meshStandardMaterial color="#e7e5e4" />
      </RoundedBox>

      {/* ATS Pass Score Badge on 3D Document */}
      <group position={[0.6, 0.5, 0.1]}>
        <RoundedBox args={[1.0, 0.32, 0.06]} radius={0.08} smoothness={2}>
          <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.4} />
        </RoundedBox>
        {/* White Check Circle inside ATS Badge */}
        <mesh position={[-0.3, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <RoundedBox args={[0.36, 0.07, 0.02]} radius={0.02} position={[0.1, 0, 0.04]}>
          <meshBasicMaterial color="#ffffff" />
        </RoundedBox>
      </group>

      {/* Experience Section Headline */}
      <RoundedBox args={[0.75, 0.08, 0.03]} radius={0.02} position={[-0.75, 0.5, 0.07]}>
        <meshStandardMaterial color="#d97706" />
      </RoundedBox>

      {/* Bullet Paragraph Lines */}
      <RoundedBox args={[2.3, 0.05, 0.02]} radius={0.01} position={[0, 0.28, 0.07]}>
        <meshStandardMaterial color="#a8a29e" />
      </RoundedBox>
      <RoundedBox args={[2.3, 0.05, 0.02]} radius={0.01} position={[0, 0.14, 0.07]}>
        <meshStandardMaterial color="#e7e5e4" />
      </RoundedBox>
      <RoundedBox args={[1.6, 0.05, 0.02]} radius={0.01} position={[-0.35, 0.0, 0.07]}>
        <meshStandardMaterial color="#e7e5e4" />
      </RoundedBox>

      {/* Skills Section Headline */}
      <RoundedBox args={[0.75, 0.08, 0.03]} radius={0.02} position={[-0.75, -0.24, 0.07]}>
        <meshStandardMaterial color="#d97706" />
      </RoundedBox>

      {/* Skill Pills Row */}
      <group position={[0, -0.48, 0.08]}>
        <RoundedBox args={[0.65, 0.17, 0.04]} radius={0.04} position={[-0.8, 0, 0]}>
          <meshStandardMaterial color="#fef3c7" roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.65, 0.17, 0.04]} radius={0.04} position={[-0.05, 0, 0]}>
          <meshStandardMaterial color="#ffedd5" roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.65, 0.17, 0.04]} radius={0.04} position={[0.7, 0, 0]}>
          <meshStandardMaterial color="#f5f0eb" roughness={0.3} />
        </RoundedBox>
      </group>

      {/* Lower Detail Lines */}
      <RoundedBox args={[2.3, 0.05, 0.02]} radius={0.01} position={[0, -0.78, 0.07]}>
        <meshStandardMaterial color="#e7e5e4" />
      </RoundedBox>
      <RoundedBox args={[1.9, 0.05, 0.02]} radius={0.01} position={[-0.2, -0.92, 0.07]}>
        <meshStandardMaterial color="#e7e5e4" />
      </RoundedBox>
      <RoundedBox args={[1.4, 0.05, 0.02]} radius={0.01} position={[-0.45, -1.06, 0.07]}>
        <meshStandardMaterial color="#e7e5e4" />
      </RoundedBox>
    </group>
  );
}

// Floating AI Tech Gem (3D Rhombus floating directly over the document page)
function FloatingGem() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // Sweeps over the top half of the paged document animation (x from -1.3 to +1.3)
      meshRef.current.position.x = Math.sin(t * 0.7) * 1.3;
      meshRef.current.position.y = 0.75 + Math.cos(t * 0.5) * 0.35;
      meshRef.current.position.z = 0.95 + Math.sin(t * 0.8) * 0.25;

      meshRef.current.rotation.x += 0.015;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.75, 0.95]} scale={0.42}>
      <octahedronGeometry args={[1]} />
      <meshStandardMaterial color="#f59e0b" roughness={0.15} metalness={0.75} />
    </mesh>
  );
}

// Floating 3D ATS Shield Card (Floating over middle section of document)
function FloatingATSBadge() {
  const badgeRef = useRef();

  useFrame((state) => {
    if (badgeRef.current) {
      const t = state.clock.getElapsedTime();
      // Sweeps over the right-middle area of the paged document animation
      badgeRef.current.position.x = 0.85 + Math.sin(t * 0.5) * 0.55;
      badgeRef.current.position.y = -0.25 + Math.cos(t * 0.7) * 0.35;
      badgeRef.current.position.z = 0.85 + Math.sin(t * 0.6) * 0.2;

      badgeRef.current.rotation.z = Math.sin(t * 0.4) * 0.1;
      badgeRef.current.rotation.y = Math.cos(t * 0.5) * 0.15;
    }
  });

  return (
    <group ref={badgeRef} position={[0.85, -0.25, 0.85]} scale={0.62}>
      <RoundedBox args={[1.2, 0.7, 0.1]} radius={0.08} smoothness={2}>
        <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.4} />
      </RoundedBox>
      {/* Outer Ring Accent */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.48, 0.04, 12, 20]} />
        <meshStandardMaterial color="#34d399" roughness={0.2} metalness={0.6} />
      </mesh>
    </group>
  );
}

// Floating 3D AI Target Ring (Floating directly over the lower half of document page)
function FloatingTargetRing() {
  const ringRef = useRef();

  useFrame((state) => {
    if (ringRef.current) {
      const t = state.clock.getElapsedTime();
      // Sweeps over the lower half of the paged document animation (x from +1.35 to -1.35)
      ringRef.current.position.x = Math.cos(t * 0.6) * 1.35;
      ringRef.current.position.y = -1.25 + Math.sin(t * 0.6) * 0.4;
      ringRef.current.position.z = 1.05 + Math.cos(t * 0.7) * 0.2;

      ringRef.current.rotation.x = Math.sin(t * 0.8) * 0.5;
      ringRef.current.rotation.y += 0.02;
      ringRef.current.rotation.z += 0.01;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, -1.25, 1.05]} scale={0.45}>
      <torusGeometry args={[0.8, 0.1, 12, 20]} />
      <meshStandardMaterial color="#d97706" roughness={0.25} metalness={0.6} />
    </mesh>
  );
}

// Lightweight AI Background Floating Dust Particles (Ultra performance optimized)
function AIParticles() {
  const pointsRef = useRef();

  const [positions] = useMemo(() => {
    const count = 25;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 1.0 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = (r * Math.cos(phi)) * 0.5;
    }

    return [pos];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      pointsRef.current.rotation.y = Math.sin(t * 0.1) * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#d97706"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
}

export default function ResumeScene3D() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

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

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setPointer({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="resume-scene-3d-wrapper"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        background: "rgba(255, 255, 255, 0.45)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.04)",
        backdropFilter: "blur(6px)",
        padding: "1rem",
        boxSizing: "border-box",
        touchAction: "none"
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "520px", display: "block" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 8, 5]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-6, -6, -2]} intensity={0.6} color="#e2e8f0" />
        <pointLight position={[0, 2, 4]} intensity={2.0} color="#cbd5e1" />

        <AuraGlow />
        <ResumeDocumentCard pointer={pointer} />

        <FloatingGem />
        <FloatingATSBadge />
        <FloatingTargetRing />

        <AIParticles />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.15}
          minPolarAngle={Math.PI / 2 - 0.25}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
