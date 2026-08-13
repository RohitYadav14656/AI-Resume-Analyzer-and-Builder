import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function HeroMockup() {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      perspective: "1000px"
    }}>
      {/* Background Glow */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0
        }}
      />

      {/* Floating Resume Card */}
      <motion.div
        initial={{ rotateY: -10, rotateX: 5, y: 20, opacity: 0 }}
        animate={{ rotateY: [-5, 5, -5], rotateX: [2, -2, 2], y: [0, -15, 0], opacity: 1 }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.8 }
        }}
        style={{
          width: "320px",
          height: "450px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          zIndex: 1,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "16px" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--accent)", opacity: 0.9 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ height: "12px", width: "70%", background: "#1f2937", borderRadius: "6px" }} />
            <div style={{ height: "8px", width: "40%", background: "#9ca3af", borderRadius: "4px" }} />
          </div>
        </div>

        {/* Sections */}
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ height: "10px", width: "30%", background: "var(--accent)", borderRadius: "4px", opacity: 0.8 }} />
            <div style={{ height: "6px", width: "100%", background: "#e5e7eb", borderRadius: "3px" }} />
            <div style={{ height: "6px", width: "90%", background: "#e5e7eb", borderRadius: "3px" }} />
            <div style={{ height: "6px", width: "75%", background: "#e5e7eb", borderRadius: "3px" }} />
          </div>
        ))}

        {/* Floating ATS Score Badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
          style={{
            position: "absolute",
            bottom: "-20px",
            right: "-20px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.5)",
            transform: "translateZ(30px)"
          }}
        >
          <CheckCircle2 size={24} color="white" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, opacity: 0.9 }}>ATS Score</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1 }}>98%</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
