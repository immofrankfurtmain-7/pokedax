"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface PikachuState {
  visible: boolean;
  side: "left" | "right";
  bottom: number;
}

export default function FloatingPikachu() {
  const [state, setState] = useState<PikachuState>({
    visible: false,
    side: "left",
    bottom: 120,
  });

  const showPikachu = useCallback(() => {
    const side = Math.random() > 0.5 ? "left" : "right";
    const bottom = Math.floor(Math.random() * 200) + 80; // 80–280px from bottom

    setState({ visible: true, side, bottom });

    // Hide after 4 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = Math.floor(Math.random() * 30000) + 30000; // 30–60s
      timeout = setTimeout(() => {
        showPikachu();
        schedule(); // schedule next appearance
      }, delay);
    };

    // First appearance after 5s so page has loaded
    timeout = setTimeout(() => {
      showPikachu();
      schedule();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [showPikachu]);

  const isLeft  = state.side === "left";
  const isRight = state.side === "right";

  return (
    <>
      {/* Left Pikachu */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          bottom: state.bottom,
          zIndex: 10,
          pointerEvents: "none",
          transform: state.visible && isLeft ? "translateX(0)" : "translateX(-110%)",
          transition: state.visible && isLeft
            ? "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)"
            : "transform 0.5s cubic-bezier(0.4,0,1,1)",
          width: 110,
        }}
      >
        <div style={{
          animation: state.visible && isLeft ? "pikachu-bounce 0.5s ease infinite alternate" : "none",
        }}>
          <Image
            src="/pikachu-left.svg"
            alt=""
            width={80}
            height={80}
            style={{ width: "100%", height: "auto", filter: "drop-shadow(0 4px 12px rgba(250,204,21,0.4))" }}
          />
        </div>
      </div>

      {/* Right Pikachu */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          right: 0,
          bottom: state.bottom,
          zIndex: 10,
          pointerEvents: "none",
          transform: state.visible && isRight ? "translateX(0)" : "translateX(110%)",
          transition: state.visible && isRight
            ? "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)"
            : "transform 0.5s cubic-bezier(0.4,0,1,1)",
          width: 110,
        }}
      >
        <div style={{
          animation: state.visible && isRight ? "pikachu-bounce 0.5s ease infinite alternate" : "none",
        }}>
          <Image
            src="/pikachu-right.svg"
            alt=""
            width={80}
            height={80}
            style={{ width: "100%", height: "auto", filter: "drop-shadow(0 4px 12px rgba(250,204,21,0.4))" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pikachu-bounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-8px); }
        }
      `}</style>
    </>
  );
}
