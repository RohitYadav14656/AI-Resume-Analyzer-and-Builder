import React, { useState, useRef, useEffect, useMemo } from "react";
import Spline from "@splinetool/react-spline";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// A beautiful, local 3D Neural Network / Brain model using standard R3F
function LocalNeuralBrain() {
  const groupRef = useRef();
  const count = 80;

  // Generate random points on a sphere
  const [points, connections] = useMemo(() => {
    const tempPoints = [];
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 0.4;
      tempPoints.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }

    // Generate connections between nearby points
    const tempConnections = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (tempPoints[i].distanceTo(tempPoints[j]) < 1.3) {
          tempConnections.push(tempPoints[i], tempPoints[j]);
        }
      }
    }

    return [tempPoints, tempConnections];
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Node Vertices */}
      {points.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
      ))}

      {/* Connection Lines */}
      <lineSegments>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(connections.flatMap(p => [p.x, p.y, p.z])),
              3
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#60a5fa" transparent opacity={0.35} linewidth={1} />
      </lineSegments>

      {/* Core Glowing Orb */}
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshPhysicalMaterial
          color="#2563eb"
          emissive="#1d4ed8"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          thickness={1}
        />
      </mesh>
    </group>
  );
}

export default function SplineScene() {
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const splineRef = useRef(null);

  // Set a timeout: if Spline doesn't load in 4 seconds, show the local 3D Neural Brain fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Spline took too long to load. Activating local 3D Brain fallback.");
        setShowFallback(true);
        setLoading(false);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [loading]);

  function onLoad(splineApp) {
    splineRef.current = splineApp;
    setLoading(false);
    setShowFallback(false);
  }

  function onError(e) {
    console.error("Spline load error:", e);
    setShowFallback(true);
    setLoading(false);
  }

  if (showFallback) {
    return (
      <div style={{ width: "100%", height: "100%", minHeight: "450px", position: "relative" }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <LocalNeuralBrain />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15, 23, 42, 0.6)",
          color: "white",
          padding: "4px 12px",
          borderRadius: "999px",
          fontSize: "0.7rem",
          backdropFilter: "blur(4px)"
        }}>
          Rendered local 3D Brain
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        width: "100%", 
        height: "100%", 
        minHeight: "450px", 
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden"
      }}
    >
      {loading && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(248, 250, 252, 0.9)",
          color: "#2563eb",
          fontWeight: 600,
          zIndex: 10
        }}>
          <div className="spinner"></div>
          <span style={{ fontSize: "0.9rem" }}>Loading 3D AI Brain...</span>
        </div>
      )}
      <Spline 
        scene="https://prod.spline.design/PV172n5u5-Wqj4xK/scene.splinecode" 
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}
