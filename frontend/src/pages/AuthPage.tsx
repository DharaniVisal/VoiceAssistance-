import React, { useState } from 'react';
import { ScreenId } from '../types';
import { authService } from '../services/authService';

interface AuthPageProps {
  onNavigate: (screen: ScreenId) => void;
}

type VerificationState = 'IDLE' | 'CAPTURING' | 'MATCHING' | 'VERIFIED' | 'FAILED';

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const user = authService.getCurrentUser();
  const [verificationState, setVerificationState] = useState<VerificationState>('IDLE');
  const [threshold, setThreshold] = useState<number>(0.82);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const runVerification = async (forceFail = false) => {
    setStatusMessage(null);
    setVerificationState('CAPTURING');
    await new Promise((r) => setTimeout(r, 650));

    setVerificationState('MATCHING');
    await new Promise((r) => setTimeout(r, 800));

    const simulatedScore = forceFail ? 0.58 : 0.94;
    setLastScore(simulatedScore);

    if (simulatedScore >= threshold) {
      setVerificationState('VERIFIED');
      setStatusMessage(
        `Acoustic Verification Successful! Match Score: ${(simulatedScore * 100).toFixed(0)}% (Threshold: ${(threshold * 100).toFixed(0)}%). Driver session validated.`
      );
      await authService.verifyBiometricSimulation(false);
    } else {
      setVerificationState('FAILED');
      setStatusMessage(
        `Biometric Mismatch Detected! Score: ${(simulatedScore * 100).toFixed(0)}% fell below authorized threshold (${(threshold * 100).toFixed(0)}%). Access restricted.`
      );
      await authService.verifyBiometricSimulation(true);
    }
  };

  return (
    <div id="auth-page" className="max-w-4xl mx-auto py-6 flex flex-col gap-6">
      {/* Header & Prominent Prototype Warning (Requirement 9) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] sm:text-[32px] font-bold text-[#dbe2f7]">
            Operator Voice Authentication
          </h2>
          <p className="text-[14px] text-[#c3c6d4] mt-0.5">
            Local acoustic speaker verification and operator biometric profile management.
          </p>
        </div>

        {/* Obligatory Notice Label */}
        <div className="px-3.5 py-1.5 rounded-lg bg-[#5d8ef1]/15 border border-[#5d8ef1]/30 text-[#aec6ff] text-[11px] font-mono font-bold self-start sm:self-auto">
          PROTOTYPE VOICE VERIFICATION SIMULATION
        </div>
      </div>

      {/* Warning Callout (Requirement 9) */}
      <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544] flex items-start gap-3 text-[12px] text-[#c3c6d4]">
        <span className="material-symbols-outlined text-[#aec6ff] text-[20px] shrink-0 mt-0.5">
          verified_user
        </span>
        <div>
          <strong className="text-[#dbe2f7]">Biometric Simulation Notice:</strong> Prototype Voice Verification Simulation — Do not present simulated scores as real biometric performance. Used exclusively for local offline pipeline benchmarking and UI integration tests.
        </div>
      </div>

      {/* Main Registered Profile & Verification Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Operator Profile Card (Requirement 9: Alex Mercer, ID: TN-CBE-9824, etc.) */}
        <div className="md:col-span-5 bg-[#18202e] rounded-xl p-6 ghost-border flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#2d3544]">
              <div className="w-16 h-16 rounded-xl bg-[#141c2a] border border-[#424752] overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsOiYUSLo1ljKaTNgF_ir5REBPDWSZCe6Uqpa75revkN9eOx475PEz4YuUx1zyypQHl6p8Q41xc6qsGzxxrbGE3BrLBZjRxdI9x62c0nmSSfwbexj0WvInP0pChKPSQch6lXRqzJgXI4q7CUPNW5OmgL46V8XqKJIlxDhVZEDGDJGp2W_oEmaVOFxrSIA4Hsc6QhV5NhtySVoesf9JU80zwAC_Dnl5Qv8d3GQ-cydMFpx-NfMyec5TFg"
                  alt="Operator Alex Mercer"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-headline-md text-[18px] font-bold text-[#dbe2f7] leading-tight">
                  {user.name}
                </h3>
                <p className="text-[12px] font-mono text-[#aec6ff] mt-0.5">{user.id}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] font-semibold">
                  Active Duty
                </span>
              </div>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <span className="text-[#8d909e] block text-[11px] uppercase tracking-wider">Role</span>
                <span className="font-semibold text-[#dbe2f7]">Senior Transit Driver</span>
              </div>
              <div>
                <span className="text-[#8d909e] block text-[11px] uppercase tracking-wider">Division</span>
                <span className="text-[#c3c6d4]">TNSTC Coimbatore Urban Depot #2</span>
              </div>
              <div>
                <span className="text-[#8d909e] block text-[11px] uppercase tracking-wider">Clearance</span>
                <span className="font-semibold text-[#10b981]">Clearance: Level 3 (Operations)</span>
              </div>
              <div className="pt-2 border-t border-[#2d3544]">
                <span className="text-[#8d909e] block text-[11px] uppercase tracking-wider">
                  Acoustic Voice Profile
                </span>
                <span className="font-mono text-[#aec6ff] text-[11px] block mt-0.5">
                  {user.voiceProfile}
                </span>
                <span className="text-[10px] text-[#8d909e] block mt-0.5">
                  Enrolled: 2026-02-15 • 16kHz PCM
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2d3544]">
            <button
              onClick={() => onNavigate('security-logs')}
              className="w-full py-2 bg-[#141c2a] hover:bg-[#222a39] border border-[#2d3544] text-[#aec6ff] rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Driver Auth Logs</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Verification Engine & Controls (Col span 7) */}
        <div className="md:col-span-7 bg-[#18202e] rounded-xl p-6 ghost-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2d3544]">
              <h3 className="font-headline-md text-[18px] font-bold text-[#dbe2f7] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#aec6ff]">mic_double</span>
                Voice Biometric Verifier
              </h3>

              {/* State Badge */}
              <span
                className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  verificationState === 'VERIFIED'
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : verificationState === 'FAILED'
                    ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                    : verificationState === 'IDLE'
                    ? 'bg-[#222a39] text-[#c3c6d4]'
                    : 'bg-[#5d8ef1]/20 text-[#aec6ff] border border-[#5d8ef1]/40 animate-pulse'
                }`}
              >
                {verificationState}
              </span>
            </div>

            {/* Threshold Slider (Requirement 9: Configurable 0.70 to 0.95) */}
            <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544] mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[12px] font-bold text-[#c3c6d4] uppercase tracking-wider">
                  Verification Threshold
                </label>
                <span className="font-mono text-[14px] font-bold text-[#aec6ff]">
                  {threshold.toFixed(2)} ({(threshold * 100).toFixed(0)}%)
                </span>
              </div>
              <input
                id="threshold-slider"
                type="range"
                min="0.70"
                max="0.95"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#aec6ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8d909e] mt-1 font-mono">
                <span>0.70 (Permissive)</span>
                <span>0.82 (Standard)</span>
                <span>0.95 (Strict)</span>
              </div>
            </div>

            {/* Interactive Status Display */}
            <div className="min-h-[90px] flex flex-col items-center justify-center p-4 rounded-xl bg-[#0b1321] border border-[#424752] text-center mb-5">
              {verificationState === 'IDLE' && (
                <p className="text-[13px] text-[#c3c6d4]">
                  Awaiting driver verification test. Click one of the simulation triggers below.
                </p>
              )}
              {verificationState === 'CAPTURING' && (
                <div className="flex items-center gap-2 text-[#aec6ff]">
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  <span className="text-[13px] font-semibold">Capturing acoustic voice sample...</span>
                </div>
              )}
              {verificationState === 'MATCHING' && (
                <div className="flex items-center gap-2 text-[#aec6ff]">
                  <span className="material-symbols-outlined text-[20px] animate-spin">fingerprint</span>
                  <span className="text-[13px] font-semibold">Calculating 128-d spectral cosine distance...</span>
                </div>
              )}
              {(verificationState === 'VERIFIED' || verificationState === 'FAILED') && (
                <div>
                  <p
                    className={`text-[14px] font-bold ${
                      verificationState === 'VERIFIED' ? 'text-[#10b981]' : 'text-[#ef4444]'
                    }`}
                  >
                    {statusMessage}
                  </p>
                  {lastScore !== null && (
                    <p className="text-[12px] text-[#8d909e] mt-1 font-mono">
                      Calculated Similarity Score: {lastScore.toFixed(2)} | Threshold: {threshold.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Simulation Action Buttons (Requirement 9: Success test & Failure test) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-simulate-auth-success"
                onClick={() => runVerification(false)}
                disabled={verificationState === 'CAPTURING' || verificationState === 'MATCHING'}
                className="py-3 px-4 rounded-xl bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#10b981]/50 text-[#10b981] font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Test Authentic Voice (Match)</span>
              </button>

              <button
                id="btn-simulate-auth-fail"
                onClick={() => runVerification(true)}
                disabled={verificationState === 'CAPTURING' || verificationState === 'MATCHING'}
                className="py-3 px-4 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444]/30 border border-[#ef4444]/50 text-[#ef4444] font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
                <span>Test Voice Mismatch (Fail)</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2d3544] flex justify-between items-center text-[11px] text-[#8d909e]">
            <span>Algorithm: MFCC Cosine Similarity</span>
            <span>Zero Cloud Transmission</span>
          </div>
        </div>
      </div>
    </div>
  );
};
