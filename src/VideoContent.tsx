import React from 'react';
import {AbsoluteFill} from 'remotion';

export const VideoContent: React.FC<{slug: string}> = () => (
  <AbsoluteFill
    style={{
      alignItems: 'center',
      background: 'linear-gradient(135deg, #101828 0%, #111827 55%, #182230 100%)',
      color: '#F8FAFC',
      display: 'flex',
      fontFamily: 'Arial, sans-serif',
      justifyContent: 'center',
      padding: 96,
      textAlign: 'center',
    }}
  >
    <div>
      <div
        style={{
          color: '#38BDF8',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 0,
          marginBottom: 24,
          textTransform: 'uppercase',
        }}
      >
        Premium Text To Video
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: 0,
          lineHeight: 1.05,
          marginBottom: 24,
        }}
      >
        Ready for your first generation
      </div>
      <div
        style={{
          color: '#CBD5E1',
          fontSize: 30,
          lineHeight: 1.4,
          margin: '0 auto',
          maxWidth: 760,
        }}
      >
        Run /templates, then generate a video with one of the bundled templates.
      </div>
    </div>
  </AbsoluteFill>
);
