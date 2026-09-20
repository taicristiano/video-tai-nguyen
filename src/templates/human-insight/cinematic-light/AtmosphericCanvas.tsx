/**
 * AtmosphericCanvas.tsx — Living atmospheric background canvas for HAY & ĐẸP.
 *
 * Implements:
 *  - Base organic ivory / warm cream foundation
 *  - Warm radial light pool behind visual center
 *  - Tactile paper grain texture
 *  - Floating warm dust motes & out-of-focus bokeh particles (deterministic via useCurrentFrame)
 */

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS } from './tokens';

interface ParticleDef {
  seedX: number;
  seedY: number;
  speed: number;
  swaySpeed: number;
  swayAmp: number;
  size: number;
  blur: number;
  baseOpacity: number;
  isBokeh: boolean;
  color: string;
}

export const AtmosphericCanvas: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();

  // Generate 22 deterministic ambient particles for background canvas
  const particleDefs = useMemo<ParticleDef[]>(() => {
    const defs: ParticleDef[] = [];
    for (let i = 0; i < 22; i++) {
      const isBokeh = i % 4 === 0;
      defs.push({
        seedX: ((i * 173 + 37) % 1000) + 40,
        seedY: ((i * 307 + 71) % 1920),
        speed: 0.35 + (i % 6) * 0.18,
        swaySpeed: 0.012 + (i % 5) * 0.005,
        swayAmp: 12 + (i % 4) * 8,
        size: isBokeh ? 26 + (i % 3) * 12 : 3.5 + (i % 4) * 1.5,
        blur: isBokeh ? 10 + (i % 3) * 4 : 0.8,
        baseOpacity: isBokeh ? 0.24 : 0.38,
        isBokeh,
        color: i % 3 === 0 ? '#E2B165' : i % 3 === 1 ? '#D89E48' : '#ECC682',
      });
    }
    return defs;
  }, []);

  // Generate 7 delicate foreground dust motes floating across the full frame
  const fgParticleDefs = useMemo<ParticleDef[]>(() => {
    const defs: ParticleDef[] = [];
    for (let i = 0; i < 7; i++) {
      defs.push({
        seedX: ((i * 157 + 89) % 960) + 60,
        seedY: ((i * 271 + 130) % 1920),
        speed: 0.42 + (i % 3) * 0.15,
        swaySpeed: 0.015 + (i % 4) * 0.006,
        swayAmp: 14 + (i % 3) * 6,
        size: 3.5 + (i % 3) * 1.5,
        blur: 0.6,
        baseOpacity: 0.32,
        isBokeh: false,
        color: i % 2 === 0 ? '#F3D295' : '#E8BE78',
      });
    }
    return defs;
  }, []);

  // Slow ambient light drift: gentle sinusoidal breathing (period ~16s)
  const lightDriftX = Math.sin((frame / 30) * Math.PI * 0.12) * 3.6;
  const lightDriftY = Math.cos((frame / 30) * Math.PI * 0.10) * 2.8;
  const lightRadiusW = 760 + Math.sin((frame / 30) * Math.PI * 0.14) * 35;
  const lightRadiusH = 960 + Math.cos((frame / 30) * Math.PI * 0.11) * 45;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgIvory,
        overflow: 'hidden',
      }}
    >
      {/* ── 1. Warm Radial Light Pool (slow gentle breathing behind visual center) ────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse ${lightRadiusW.toFixed(0)}px ${lightRadiusH.toFixed(0)}px at ${(50 + lightDriftX).toFixed(2)}% ${(46 + lightDriftY).toFixed(2)}%, rgba(255, 251, 242, 0.98) 0%, rgba(248, 237, 218, 0.85) 50%, rgba(232, 218, 198, 0.98) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── 2. Subtle Archival Paper Grain Texture ─────────────────── */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.052,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      >
        <filter id="paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>

      {/* ── 3. Floating Warm Dust & Bokeh Particles in Background ───────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      >
        {particleDefs.map((p, idx) => {
          // Continuous upward float with wrapping
          const currentY =
            ((p.seedY - frame * p.speed) % 1920 + 1920) % 1920;
          const currentX =
            p.seedX + Math.sin(frame * p.swaySpeed + idx) * p.swayAmp;
          // Gentle pulsing opacity
          const pulse = Math.sin(frame * 0.03 + idx * 0.8) * 0.08;
          const opacity = Math.max(0.18, Math.min(0.55, p.baseOpacity + pulse));

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${currentX}px`,
                top: `${currentY}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                backgroundColor: p.color,
                opacity,
                filter: `blur(${p.blur}px)`,
                transform: 'translate(-50%, -50%)',
                boxShadow: p.isBokeh ? undefined : '0 0 6px rgba(210, 150, 60, 0.35)',
              }}
            />
          );
        })}
      </div>

      {/* ── 4. Main Scene & Layer Children ─────────────────────────── */}
      {children}

      {/* ── 5. Subtle Foreground Floating Dust Motes (Living frame-wide atmosphere) ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      >
        {fgParticleDefs.map((p, idx) => {
          const currentY = ((p.seedY - frame * p.speed) % 1920 + 1920) % 1920;
          const currentX = p.seedX + Math.sin(frame * p.swaySpeed + idx * 1.3) * p.swayAmp;
          const pulse = Math.sin(frame * 0.035 + idx) * 0.08;
          const opacity = Math.max(0.20, Math.min(0.48, p.baseOpacity + pulse));

          return (
            <div
              key={`fg-${idx}`}
              style={{
                position: 'absolute',
                left: `${currentX}px`,
                top: `${currentY}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                backgroundColor: p.color,
                opacity,
                filter: `blur(${p.blur}px)`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 6px rgba(230, 175, 90, 0.45)',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
