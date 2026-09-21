import React, { useState, useEffect } from 'react';
import { ScreenId, VoiceState, ActivityLogItem } from '../types';
import { speechService } from '../services/speechService';
import { intentService } from '../services/intentService';
import { ttsService } from '../services/ttsService';
import { securityService } from '../services/securityService';
import { logService } from '../services/logService';
import { COIMBATORE_BUS_ROUTES } from '../data/coimbatoreData';
import { VoiceWaveform } from '../components/VoiceWaveform';
import { CyberMicButton } from '../components/CyberMicIcon';

interface DashboardPageProps {
  onNavigate: (screen: ScreenId) => void;
  onSetSelectedRoute?: (routeId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    setRecentLogs(logService.getLogs());
  }, []);

  const handleMicClick = () => {
    if (voiceState === 'listening') {
      speechService.stopListening();
      setVoiceState('idle');
      return;
    }

    setVoiceState('listening');
    setFeedbackMessage('Listening for Coimbatore bus commands...');

    speechService.startListening(
      async (transcript, isFinal) => {
        setLastSpoken(transcript);
        if (isFinal) {
          setVoiceState('processing');
          setFeedbackMessage(`Analyzing: "${transcript}"`);

          // Validate command integrity & defensive checks
          const valResult = securityService.validateCommand(transcript);
          if (!valResult.valid) {
            setVoiceState('error');
            setFeedbackMessage(valResult.reason || 'Command rejected.');
            ttsService.speak(valResult.reason || 'Command rejected.');
            setTimeout(() => setVoiceState('idle'), 3500);
            setRecentLogs(logService.getLogs());
            return;
          }

          // Parse intent with fuzzy matching
          const parsed = await intentService.parseVoiceCommand(transcript);

          // Log command to persistent storage
          logService.addLog({
            event: `Voice Command: ${parsed.intent}`,
            status: 'Success',
            description: `"${transcript}" → ${parsed.replyText}`,
            type: 'Voice Command',
            category: 'Direct Input',
          });
          setRecentLogs(logService.getLogs());

          setVoiceState('speaking');
          setFeedbackMessage(parsed.replyText);
          ttsService.speak(parsed.replyText, () => {
            setVoiceState('idle');
            if (parsed.intent === 'ROUTE_SEARCH' || parsed.intent === 'AVAILABLE_BUSES' || parsed.intent === 'BUS_TIMING') {
              onNavigate('transport');
            } else if (parsed.intent === 'DIRECTIONS' || parsed.intent === 'BUS_STOP') {
              onNavigate('navigation');
            }
          });
        }
      },
      (err) => {
        setVoiceState('error');
        setFeedbackMessage(`Notice: ${err}. You can also click sample queries below.`);
        setTimeout(() => setVoiceState('idle'), 3500);
      }
    );
  };

  const handleQuickCommand = async (cmd: string) => {
    setLastSpoken(cmd);
    setVoiceState('processing');
    setFeedbackMessage(`Processing: "${cmd}"`);

    const parsed = await intentService.parseVoiceCommand(cmd);

    logService.addLog({
      event: `Voice Command: ${parsed.intent}`,
      status: 'Success',
      description: `Simulated: "${cmd}" → ${parsed.replyText}`,
      type: 'Voice Command',
      category: 'Direct Input',
    });
    setRecentLogs(logService.getLogs());

    setVoiceState('speaking');
    setFeedbackMessage(parsed.replyText);
    ttsService.speak(parsed.replyText, () => {
      setVoiceState('idle');
      if (cmd.includes('direction') || cmd.includes('railway station')) {
        onNavigate('navigation');
      } else {
        onNavigate('transport');
      }
    });
  };

  // Extract recent commands and security events
  const voiceCommandLogs = recentLogs.filter((l) => l.type === 'Voice Command').slice(0, 3);
  const securityLogs = recentLogs.filter((l) => l.type === 'Security Check' || l.status !== 'Success').slice(0, 3);

  return (
    <div id="dashboard-page" className="flex flex-col gap-8 py-4">
      {/* 1. HERO SECTION: Interactive Voice Assistant with Pulse Ring */}
      <section className="flex flex-col items-center justify-center min-h-[340px] text-center pt-2">
        <div className="mb-6 flex items-center justify-center">
          <CyberMicButton
            isListening={voiceState === 'listening'}
            onClick={handleMicClick}
            size="hero"
            title={voiceState === 'listening' ? 'Click to stop listening' : 'Click to speak transit query'}
          />
        </div>

        <h2 className="font-headline-lg text-[32px] sm:text-[36px] font-bold text-[#dbe2f7] mb-2 tracking-tight">
          {voiceState === 'listening'
            ? 'Listening to your voice...'
            : voiceState === 'processing'
            ? 'Processing local intent...'
            : voiceState === 'speaking'
            ? 'Voice guidance active'
            : 'Ready to listen'}
        </h2>

        <p className="text-[15px] sm:text-[17px] text-[#c3c6d4] mb-4 max-w-xl">
          Say <span className="text-[#aec6ff] font-medium">"Show bus route from Gandhipuram to Saravanampatti"</span> or{' '}
          <span className="text-[#aec6ff] font-medium">"What is the timing of route 12?"</span>
        </p>

        {/* Waveform Visualizer */}
        <div className="mb-3">
          <VoiceWaveform isActive={voiceState === 'listening' || voiceState === 'speaking'} />
        </div>

        {/* Feedback / Transcript Pill */}
        {feedbackMessage && (
          <div className="px-4 py-2 rounded-lg bg-[#141c2a] border border-[#5d8ef1]/40 text-[#aec6ff] text-[13px] animate-fadeIn max-w-2xl">
            {feedbackMessage}
          </div>
        )}

        {/* Example Commands (Requirement 4) */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-3xl">
          <button
            onClick={() => handleQuickCommand('Show bus route from Gandhipuram to Saravanampatti')}
            className="text-[12px] px-3 py-1.5 rounded-full bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[#c3c6d4] hover:text-[#aec6ff] transition-all cursor-pointer"
          >
            "Show bus route from Gandhipuram to Saravanampatti"
          </button>
          <button
            onClick={() => handleQuickCommand('What is the timing of route 12?')}
            className="text-[12px] px-3 py-1.5 rounded-full bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[#c3c6d4] hover:text-[#aec6ff] transition-all cursor-pointer"
          >
            "What is the timing of route 12?"
          </button>
          <button
            onClick={() => handleQuickCommand('Which bus goes to the railway station?')}
            className="text-[12px] px-3 py-1.5 rounded-full bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[#c3c6d4] hover:text-[#aec6ff] transition-all cursor-pointer"
          >
            "Which bus goes to the railway station?"
          </button>
          <button
            onClick={() => handleQuickCommand('Show available buses')}
            className="text-[12px] px-3 py-1.5 rounded-full bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[#c3c6d4] hover:text-[#aec6ff] transition-all cursor-pointer"
          >
            "Show available buses"
          </button>
          <button
            onClick={() => handleQuickCommand('Give directions to the nearest bus stop')}
            className="text-[12px] px-3 py-1.5 rounded-full bg-[#18202e] hover:bg-[#222a39] border border-[#2d3544] text-[#c3c6d4] hover:text-[#aec6ff] transition-all cursor-pointer"
          >
            "Give directions to the nearest bus stop"
          </button>
        </div>
      </section>

      {/* 2. OPERATIONAL STATUS OVERVIEW GRID (Requirement 3) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Offline Readiness */}
        <div
          onClick={() => onNavigate('architecture')}
          className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between hover:bg-[#222a39]/70 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider">
              Offline Readiness
            </span>
            <span className="material-symbols-outlined text-[#10b981] text-[20px] group-hover:scale-110 transition-transform">
              wifi_off
            </span>
          </div>
          <div>
            <h3 className="font-headline-md text-[24px] font-bold text-[#dbe2f7]">100% Ready</h3>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              Zero cloud network calls. All models, timetables, and services run locally on vehicle host.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#2d3544] text-[11px] text-[#10b981] flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span>Autonomous Active</span>
            </span>
            <span className="text-[#aec6ff] text-[11px] font-semibold flex items-center">
              Blueprint <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Security Status */}
        <div
          onClick={() => onNavigate('security')}
          className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between hover:bg-[#222a39]/70 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#aec6ff] uppercase tracking-wider">
              Security Status
            </span>
            <span className="material-symbols-outlined text-[#aec6ff] text-[20px] group-hover:scale-110 transition-transform">
              verified_user
            </span>
          </div>
          <div>
            <h3 className="font-headline-md text-[24px] font-bold text-[#dbe2f7]">SECURE</h3>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              Continuous liveness detection & anti-replay defense active. Operator Alex Mercer authorized.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#2d3544] text-[11px] text-[#aec6ff] flex items-center justify-between font-semibold">
            <span>Inspect Pipeline</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>

        {/* Local Database Status */}
        <div
          onClick={() => onNavigate('transport')}
          className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between hover:bg-[#222a39]/70 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#c3c6d4] uppercase tracking-wider">
              Local Database Status
            </span>
            <span className="material-symbols-outlined text-[#c3c6d4] text-[20px]">database</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="font-headline-md text-[24px] font-bold text-[#dbe2f7]">
                {COIMBATORE_BUS_ROUTES.length}
              </h3>
              <span className="text-[14px] text-[#c3c6d4]">Routes Loaded</span>
            </div>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              SQLite GTFS engine initialized. 18 Coimbatore key transit stops cached.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#2d3544] text-[11px] text-[#aec6ff] flex items-center justify-between font-semibold">
            <span>View All Bus Routes</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>

        {/* Offline Map Availability */}
        <div
          onClick={() => onNavigate('navigation')}
          className="bg-[#18202e] rounded-xl p-5 ghost-border flex flex-col justify-between hover:bg-[#222a39]/70 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#fbbf24] uppercase tracking-wider">
              Offline Map Cache
            </span>
            <span className="material-symbols-outlined text-[#fbbf24] text-[20px]">map</span>
          </div>
          <div>
            <h3 className="font-headline-md text-[24px] font-bold text-[#dbe2f7]">Cached & Ready</h3>
            <p className="text-[12px] text-[#c3c6d4] mt-1">
              Coimbatore radial road network & waypoint trajectory offline raster ready.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#2d3544] text-[11px] text-[#aec6ff] flex items-center justify-between font-semibold">
            <span>Open Navigation</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>
      </section>

      {/* 3. RECENT COMMANDS & RECENT SECURITY EVENTS (Requirement 3) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Commands (Col span 7) */}
        <div className="lg:col-span-7 bg-[#18202e] rounded-xl p-6 ghost-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-[18px] text-[#dbe2f7] flex items-center gap-2 font-semibold">
              <span className="material-symbols-outlined text-[#aec6ff]">history</span>
              Recent Voice Commands
            </h3>
            <button
              onClick={() => onNavigate('security-logs')}
              className="text-[12px] font-semibold text-[#aec6ff] hover:text-[#d8e2ff] px-2.5 py-1 rounded bg-[#141c2a] border border-[#2d3544] transition-all cursor-pointer"
            >
              Full History
            </button>
          </div>

          <div className="space-y-3">
            {voiceCommandLogs.length > 0 ? (
              voiceCommandLogs.map((cmd) => (
                <div
                  key={cmd.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#141c2a] border border-[#2d3544] hover:border-[#aec6ff]/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#222a39] flex items-center justify-center shrink-0 text-[#aec6ff]">
                    <span className="material-symbols-outlined text-[18px]">mic</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#dbe2f7] truncate">
                      {cmd.description}
                    </p>
                    <p className="text-[11px] text-[#c3c6d4] mt-0.5">{cmd.timestamp}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                    {cmd.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-[#c3c6d4] italic py-4">No recent voice commands.</p>
            )}
          </div>
        </div>

        {/* Recent Security Events & Architecture Summary (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Security Events Card */}
          <div className="bg-[#18202e] rounded-xl p-5 ghost-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[14px] font-bold text-[#dbe2f7] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#aec6ff] text-[18px]">shield</span>
                Recent Security Audits
              </h4>
              <button
                onClick={() => onNavigate('security')}
                className="text-[11px] text-[#aec6ff] font-semibold hover:underline cursor-pointer"
              >
                Security Center
              </button>
            </div>

            <div className="space-y-2">
              {securityLogs.length > 0 ? (
                securityLogs.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-2.5 rounded-lg bg-[#141c2a] border border-[#2d3544] flex items-center justify-between text-[12px]"
                  >
                    <div className="overflow-hidden mr-2">
                      <p className="font-semibold text-[#dbe2f7] truncate">{sec.event}</p>
                      <p className="text-[10px] text-[#c3c6d4] truncate">{sec.description}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                      style={{
                        color: sec.status === 'Success' ? '#10b981' : sec.status === 'Warning' ? '#f59e0b' : '#ef4444',
                        backgroundColor:
                          sec.status === 'Success'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : sec.status === 'Warning'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        border: `1px solid ${sec.status === 'Success' ? '#10b981' : sec.status === 'Warning' ? '#f59e0b' : '#ef4444'}40`,
                      }}
                    >
                      {sec.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-[#c3c6d4] italic">All local integrity checks nominal.</p>
              )}
            </div>
          </div>

          {/* Architecture Summary (Requirement 3) */}
          <div className="bg-[#18202e] rounded-xl p-5 ghost-border border-l-4 border-l-[#5d8ef1]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13px] font-bold text-[#dbe2f7] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#5d8ef1] text-[18px]">account_tree</span>
                Local Architecture Blueprint
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#141c2a] text-[#aec6ff]">
                Target: Python Backend
              </span>
            </div>
            <p className="text-[12px] text-[#c3c6d4] mb-3">
              Modular service layer designed to connect to an on-device Python stack: Whisper STT, CQCC Anti-Spoofing, and SQLite GTFS.
            </p>
            <button
              onClick={() => onNavigate('architecture')}
              className="w-full py-2 bg-[#141c2a] hover:bg-[#222a39] border border-[#2d3544] text-[#aec6ff] rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Inspect Service Contracts & Pipeline</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Offline Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] text-[#c3c6d4]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#aec6ff] text-[18px]">verified</span>
          <span>
            <strong className="text-[#dbe2f7]">Coimbatore Offline Division:</strong> Prototype state simulation for local Python engine testing. All bus routes reflect TNSTC Coimbatore local operations.
          </span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded bg-[#222a39] text-[#aec6ff] whitespace-nowrap self-start sm:self-auto font-mono">
          DEMO DATA — NOT REAL-TIME
        </span>
      </div>
    </div>
  );
};
