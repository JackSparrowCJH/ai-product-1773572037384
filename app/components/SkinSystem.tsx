"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Skin {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  sound: string;
  icon: string;
}

const soundMap: Record<string, () => void> = {};

function playSound(type: string) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.3;

    if (type === "dong") {
      osc.frequency.value = 150;
      osc.type = "sine";
    } else if (type === "zap") {
      osc.frequency.value = 440;
      osc.type = "sawtooth";
    } else {
      osc.frequency.value = 800;
      osc.type = "sine";
    }

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export default function SkinSystem() {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [activeSkinId, setActiveSkinId] = useState("classic");
  const [tapped, setTapped] = useState(false);
  const [merit, setMerit] = useState(0);
  const [floats, setFloats] = useState<{ id: number; x: number; y: number }[]>([]);
  const floatId = useRef(0);

  useEffect(() => {
    fetch("/api/skins").then(r => r.json()).then(d => setSkins(d.skins));
    fetch("/api/skins/active").then(r => r.json()).then(d => setActiveSkinId(d.activeSkin));
  }, []);

  const activeSkin = skins.find(s => s.id === activeSkinId) || skins[0];

  const switchSkin = useCallback(async (skinId: string) => {
    const res = await fetch("/api/skins/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skinId }),
    });
    const d = await res.json();
    if (d.activeSkin) {
      setActiveSkinId(d.activeSkin);
      const skin = skins.find(s => s.id === d.activeSkin);
      if (skin) playSound(skin.sound);
    }
  }, [skins]);

  const handleTap = useCallback(() => {
    if (!activeSkin) return;
    setMerit(m => m + 1);
    setTapped(true);
    setTimeout(() => setTapped(false), 150);
    playSound(activeSkin.sound);

    const id = ++floatId.current;
    const x = 50 + (Math.random() - 0.5) * 30;
    setFloats(f => [...f, { id, x, y: 0 }]);
    setTimeout(() => setFloats(f => f.filter(fl => fl.id !== id)), 900);
  }, [activeSkin]);

  if (!activeSkin) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>加载中...</div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: activeSkin.bgColor,
      color: activeSkin.color,
      transition: "background 0.4s, color 0.4s",
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      overflow: "hidden",
    }}>
      <h1 style={{ fontSize: "24px", margin: "10px 0 4px", letterSpacing: "2px" }}>敲木鱼</h1>
      <p style={{ opacity: 0.6, fontSize: "13px", margin: 0 }}>当前皮肤：{activeSkin.name}</p>

      {/* Tap area */}
      <div style={{ position: "relative", margin: "30px 0" }}>
        <div
          data-testid="wooden-fish"
          onClick={handleTap}
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 35%, ${activeSkin.color}33, ${activeSkin.color}11)`,
            border: `3px solid ${activeSkin.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            cursor: "pointer",
            transform: tapped ? "scale(0.9)" : "scale(1)",
            transition: "transform 0.1s ease-out",
            userSelect: "none",
            boxShadow: `0 0 ${tapped ? 30 : 15}px ${activeSkin.color}44`,
          }}
        >
          {activeSkin.icon}
        </div>
        {floats.map(f => (
          <div key={f.id} style={{
            position: "absolute",
            left: `${f.x}%`,
            top: "20%",
            transform: "translateX(-50%)",
            animation: "floatUp 0.9s ease-out forwards",
            fontWeight: "bold",
            fontSize: 18,
            color: activeSkin.color,
            pointerEvents: "none",
            textShadow: `0 0 6px ${activeSkin.color}66`,
          }}>
            功德+1
          </div>
        ))}
      </div>

      <div style={{ fontSize: 28, fontWeight: "bold", marginBottom: 30, letterSpacing: 1 }}>
        功德：{merit}
      </div>

      {/* Skin grid */}
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, textAlign: "center", opacity: 0.8 }}>选择皮肤</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}>
          {skins.map(skin => {
            const isActive = skin.id === activeSkinId;
            return (
              <div
                key={skin.id}
                data-testid={`skin-${skin.id}`}
                onClick={() => switchSkin(skin.id)}
                style={{
                  background: skin.bgColor,
                  border: `2px solid ${isActive ? skin.color : skin.color + "44"}`,
                  borderRadius: 12,
                  padding: "16px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  transition: "all 0.25s",
                  boxShadow: isActive ? `0 0 12px ${skin.color}66` : "0 1px 4px rgba(0,0,0,0.1)",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  position: "relative",
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: skin.color,
                    color: skin.bgColor,
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: "bold",
                  }}>✓</div>
                )}
                <span style={{ fontSize: 36 }}>{skin.icon}</span>
                <span style={{ fontSize: 13, fontWeight: "bold", color: skin.color }}>{skin.name}</span>
                <span style={{ fontSize: 11, color: skin.color, opacity: 0.6, textAlign: "center" }}>{skin.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-80px); }
        }
      `}</style>
    </div>
  );
}
