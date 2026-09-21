import React from 'react';

interface VoiceWaveformProps {
  isActive?: boolean;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isActive = true }) => {
  return (
    <div className="flex items-center gap-1.5 h-10 opacity-85 justify-center">
      <div
        className="waveform-bar"
        style={{
          animationDelay: '0.1s',
          animationDuration: isActive ? '1.0s' : '0s',
          height: isActive ? undefined : '6px',
        }}
      />
      <div
        className="waveform-bar"
        style={{
          animationDelay: '0.3s',
          animationDuration: isActive ? '1.2s' : '0s',
          height: isActive ? undefined : '6px',
        }}
      />
      <div
        className="waveform-bar"
        style={{
          animationDelay: '0.5s',
          animationDuration: isActive ? '1.4s' : '0s',
          height: isActive ? undefined : '6px',
        }}
      />
      <div
        className="waveform-bar"
        style={{
          animationDelay: '0.2s',
          animationDuration: isActive ? '1.1s' : '0s',
          height: isActive ? undefined : '6px',
        }}
      />
      <div
        className="waveform-bar"
        style={{
          animationDelay: '0.4s',
          animationDuration: isActive ? '1.3s' : '0s',
          height: isActive ? undefined : '6px',
        }}
      />
      <div
        className="waveform-bar"
        style={{
          animationDelay: '0.6s',
          animationDuration: isActive ? '1.25s' : '0s',
          height: isActive ? undefined : '6px',
        }}
      />
      <div
        className="waveform-bar"
        style={{
          animationDelay: '0.35s',
          animationDuration: isActive ? '1.05s' : '0s',
          height: isActive ? undefined : '6px',
        }}
      />
      <div
        className="waveform-bar"
        style={{
          animationDelay: '0.15s',
          animationDuration: isActive ? '0.95s' : '0s',
          height: isActive ? undefined : '6px',
        }}
      />
    </div>
  );
};
