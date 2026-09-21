import React, { useState } from 'react';
import { ScreenId, SecurityStateLevel } from '../types';
import { securityService } from '../services/securityService';
import { logService } from '../services/logService';

interface SecurityPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ onNavigate }) => {
  const [replaySimulationRunning, setReplaySimulationRunning] = useState(false);
  const [replayResult, setReplayResult] = useState<{
    status: SecurityStateLevel;
    message: string;
    score: number;
    notice: string;
  } | null>(null);

  // Security Module States
  const [voiceAuthStatus, setVoiceAuthStatus] = useState<SecurityStateLevel>('SECURE');
  const [inputValStatus, setInputValStatus] = useState<SecurityStateLevel>('SECURE');
  const [commandIntegrityStatus, setCommandIntegrityStatus] = useState<SecurityStateLevel>('SECURE');
  const [replayDefenseStatus, setReplayDefenseStatus] = useState<SecurityStateLevel>('SECURE');
  const [unauthAccessStatus, setUnauthAccessStatus] = useState<SecurityStateLevel>('SECURE');

  // Interactive Replay Demo (Requirement 11)
  const handleRunReplayTest = async (isReplayAttack: boolean) => {
    setReplaySimulationRunning(true);
    setReplayResult(null);

    const res = await securityService.checkReplayAttack(isReplayAttack);

    if (isReplayAttack) {
      setReplayDefenseStatus('BLOCKED');
      setCommandIntegrityStatus('WARNING');
      setReplayResult({
        status: 'BLOCKED',
        message: 'Acoustic replay attack intercepted. High-frequency room impulse signature mismatch detected. Command quarantined.',
        score: res.confidenceScore,
        notice: res.simulationNotice,
      });
    } else {
      setReplayDefenseStatus('SECURE');
      setCommandIntegrityStatus('SECURE');
      setReplayResult({
        status: 'SECURE',
        message: 'Acoustic liveness confirmed (CQCC spectral harmonic analysis). Authentic live human vocal tract validated.',
        score: res.confidenceScore,
        notice: res.simulationNotice,
      });
    }

    setReplaySimulationRunning(false);
  };

  // Interactive Input Validation Test (Requirement 10 & 12)
  const handleTestValidation = (command: string) => {
    const val = securityService.validateCommand(command);
    if (val.status === 'BLOCKED') {
      setCommandIntegrityStatus('BLOCKED');
      setInputValStatus('WARNING');
    } else if (val.status === 'WARNING') {
      setInputValStatus('WARNING');
    } else {
      setInputValStatus('SECURE');
      setCommandIntegrityStatus('SECURE');
    }
  };

  const getBadgeClass = (status: SecurityStateLevel) => {
    if (status === 'SECURE') {
      return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40';
    }
    if (status === 'WARNING') {
      return 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40';
    }
    return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40';
  };

  return (
    <div id="security-page" className="max-w-6xl mx-auto py-6 flex flex-col gap-6">
      {/* Header & Prominent Prototype Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] sm:text-[32px] font-bold text-[#dbe2f7]">
            Cybersecurity & Defense Center
          </h2>
          <p className="text-[14px] text-[#c3c6d4] mt-0.5">
            Defensive voice cybersecurity architecture: Anti-spoofing, acoustic replay interception, and integrity protection.
          </p>
        </div>

        {/* Prototype Label (Requirement 11) */}
        <div className="px-3.5 py-1.5 rounded-lg bg-[#5d8ef1]/15 border border-[#5d8ef1]/30 text-[#aec6ff] text-[11px] font-mono font-bold self-start sm:self-auto">
          PROTOTYPE VOICE VERIFICATION SIMULATION
        </div>
      </div>

      {/* Requirement 10: Clear Frontend States for All 6 Security Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Voice Authentication */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider">
              1. Voice Authentication
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getBadgeClass(voiceAuthStatus)}`}>
              {voiceAuthStatus}
            </span>
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#dbe2f7]">Operator Biometrics</h4>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              128-dim MFCC acoustic cosine matching against enrolled operator voice profile.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#2d3544] flex items-center justify-between text-[11px]">
            <span className="text-[#8d909e]">Clearance: Level 3</span>
            <button
              onClick={() => onNavigate('auth')}
              className="text-[#aec6ff] hover:underline font-semibold cursor-pointer"
            >
              Inspect
            </button>
          </div>
        </div>

        {/* 2. Input Validation */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider">
              2. Input Validation
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getBadgeClass(inputValStatus)}`}>
              {inputValStatus}
            </span>
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#dbe2f7]">Syntax & Payload Sanitization</h4>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              Length, boundary verification, and rejection of null or truncated speech buffers.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#2d3544] flex items-center justify-between text-[11px]">
            <span className="text-[#8d909e]">Rule Engine: Local Regex</span>
            <span className="text-[#10b981]">Active</span>
          </div>
        </div>

        {/* 3. Command Integrity */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider">
              3. Command Integrity
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getBadgeClass(commandIntegrityStatus)}`}>
              {commandIntegrityStatus}
            </span>
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#dbe2f7]">Intent Boundary Guard</h4>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              Strict isolation preventing command execution outside Coimbatore transit grammar.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#2d3544] flex items-center justify-between text-[11px]">
            <span className="text-[#8d909e]">Sandbox: Read-Only Transit</span>
            <span className="text-[#10b981]">Enforced</span>
          </div>
        </div>

        {/* 4. Replay Detection */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider">
              4. Replay Detection
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getBadgeClass(replayDefenseStatus)}`}>
              {replayDefenseStatus}
            </span>
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#dbe2f7]">Acoustic Liveness Analysis</h4>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              Constant-Q cepstral coefficients (CQCC) detect speaker transducer artifacts.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#2d3544] flex items-center justify-between text-[11px]">
            <span className="text-[#8d909e]">Filter: 16-band Spectral</span>
            <span className="text-[#10b981]">Defensive</span>
          </div>
        </div>

        {/* 5. Unauthorized Access Detection */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider">
              5. Unauthorized Access
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getBadgeClass(unauthAccessStatus)}`}>
              {unauthAccessStatus}
            </span>
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#dbe2f7]">Privilege Quarantine</h4>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              Immediate lockout of operator controls upon three anomalous voice attempts.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#2d3544] flex items-center justify-between text-[11px]">
            <span className="text-[#8d909e]">Lockout Threshold: 3</span>
            <span className="text-[#10b981]">Guarded</span>
          </div>
        </div>

        {/* 6. Security Logs */}
        <div
          onClick={() => onNavigate('security-logs')}
          className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between hover:bg-[#222a39] cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#aec6ff] uppercase tracking-wider">
              6. Security Logs
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
              SECURE
            </span>
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#dbe2f7] group-hover:text-[#aec6ff] transition-colors">
              Tamper-Evident Audit Trail
            </h4>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              Local persistent record of every biometric trial, command evaluation, and blocked threat.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#2d3544] flex items-center justify-between text-[11px] text-[#aec6ff] font-semibold">
            <span>View All Logs</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* Requirement 11: INTERACTIVE REPLAY ATTACK SIMULATION DEMO */}
      <div className="bg-[#18202e] rounded-2xl p-6 sm:p-8 ghost-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#2d3544]">
          <div>
            <h3 className="font-headline-md text-[20px] font-bold text-[#dbe2f7] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#aec6ff]">smart_toy</span>
              Defensive Replay Simulation Engine
            </h3>
            <p className="text-[13px] text-[#c3c6d4] mt-0.5">
              Compare genuine live human acoustic patterns against simulated pre-recorded loudspeaker playback.
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-[#141c2a] text-[#aec6ff] border border-[#2d3544] font-mono">
            Zero Offensive Capabilities
          </span>
        </div>

        {/* Live Simulation Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Normal Voice Test */}
          <div className="p-5 rounded-xl bg-[#141c2a] border border-[#2d3544] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <h4 className="font-bold text-[#dbe2f7] text-[15px]">Normal Live Voice Test</h4>
              </div>
              <p className="text-[12px] text-[#c3c6d4] mb-4">
                Simulates authorized driver Alex Mercer speaking in real-time. Harmonic overtone continuity is verified and command is accepted.
              </p>
            </div>
            <button
              id="btn-test-normal-voice"
              onClick={() => handleRunReplayTest(false)}
              disabled={replaySimulationRunning}
              className="w-full py-2.5 px-4 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#10b981]/50 text-[#10b981] font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              <span>Test Normal Voice (Accept)</span>
            </button>
          </div>

          {/* Replay Attack Simulation */}
          <div className="p-5 rounded-xl bg-[#141c2a] border border-[#2d3544] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                <h4 className="font-bold text-[#dbe2f7] text-[15px]">Simulated Replay Attack</h4>
              </div>
              <p className="text-[12px] text-[#c3c6d4] mb-4">
                Simulates pre-recorded playback through an external speaker. Speaker enclosure resonance is identified and command is blocked.
              </p>
            </div>
            <button
              id="btn-test-replay-attack"
              onClick={() => handleRunReplayTest(true)}
              disabled={replaySimulationRunning}
              className="w-full py-2.5 px-4 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444]/30 border border-[#ef4444]/50 text-[#ef4444] font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">phonelink_ring</span>
              <span>Test Replay Attack (Block)</span>
            </button>
          </div>
        </div>

        {/* Simulation Execution Result Feedback */}
        {replaySimulationRunning && (
          <div className="p-4 rounded-xl bg-[#0b1321] border border-[#424752] flex items-center justify-center gap-3 text-[#aec6ff]">
            <span className="material-symbols-outlined text-[24px] animate-spin">cyclone</span>
            <span className="text-[14px] font-semibold">Running acoustic spectral liveness evaluation...</span>
          </div>
        )}

        {replayResult && !replaySimulationRunning && (
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn ${
              replayResult.status === 'BLOCKED'
                ? 'bg-[#ef4444]/10 border-[#ef4444]/40'
                : 'bg-[#10b981]/10 border-[#10b981]/40'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[12px] px-2 py-0.5 rounded font-bold uppercase ${
                    replayResult.status === 'BLOCKED'
                      ? 'bg-[#ef4444]/20 text-[#ef4444]'
                      : 'bg-[#10b981]/20 text-[#10b981]'
                  }`}
                >
                  {replayResult.status === 'BLOCKED' ? 'ATTACK INTERCEPTED & BLOCKED' : 'VERIFICATION PASSED'}
                </span>
                <span className="text-[11px] text-[#8d909e] font-mono">
                  Confidence Score: {(replayResult.score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[13px] text-[#dbe2f7] font-medium leading-relaxed">
                {replayResult.message}
              </p>
              <p className="text-[11px] text-[#8d909e] mt-1 italic">
                {replayResult.notice}
              </p>
            </div>

            <button
              onClick={() => onNavigate('security-logs')}
              className="px-4 py-2 rounded-lg bg-[#18202e] hover:bg-[#222a39] border border-[#424752] text-[#aec6ff] font-bold text-[12px] whitespace-nowrap cursor-pointer self-start sm:self-auto"
            >
              Verify in Activity Logs →
            </button>
          </div>
        )}
      </div>

      {/* Requirement 12: Input Validation Test Bar */}
      <div className="bg-[#141c2a] rounded-xl p-5 border border-[#2d3544]">
        <h4 className="text-[13px] font-semibold text-[#dbe2f7] mb-2 uppercase tracking-wider">
          Requirement 12 Defensive Input Validation Bench:
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTestValidation('Show route 12')}
            className="px-3 py-1.5 rounded-lg bg-[#10b981]/15 hover:bg-[#10b981]/25 border border-[#10b981]/30 text-[#10b981] text-[12px] font-bold cursor-pointer"
          >
            Test "Show route 12" → Valid
          </button>
          <button
            onClick={() => handleTestValidation('')}
            className="px-3 py-1.5 rounded-lg bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 border border-[#f59e0b]/30 text-[#f59e0b] text-[12px] font-bold cursor-pointer"
          >
            Test Empty Input → Rejected
          </button>
          <button
            onClick={() => handleTestValidation('Delete database')}
            className="px-3 py-1.5 rounded-lg bg-[#ef4444]/15 hover:bg-[#ef4444]/25 border border-[#ef4444]/30 text-[#ef4444] text-[12px] font-bold cursor-pointer"
          >
            Test "Delete database" → Command Integrity Alert
          </button>
        </div>
      </div>
    </div>
  );
};
