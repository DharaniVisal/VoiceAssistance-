import React from 'react';
import { ScreenId } from '../types';

interface AboutPageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div id="about-page" className="py-6 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="font-headline-lg text-[32px] font-bold text-[#dbe2f7]">
          About TransitVoice
        </h2>
        <p className="text-[15px] text-[#c3c6d4] mt-1">
          Secure Voice-Integrated Offline Transport Assistance System with AI-Based Cybersecurity Protection.
        </p>
      </div>

      {/* Scope Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geographic & Transport Scope */}
        <div className="bg-[#141c2a] rounded-xl p-6 ghost-border">
          <div className="flex items-center gap-2 mb-3 text-[#aec6ff]">
            <span className="material-symbols-outlined text-[24px]">pin_drop</span>
            <h3 className="font-headline-md text-[18px] font-bold text-[#dbe2f7]">
              Geographic & Transport Scope
            </h3>
          </div>
          <div className="space-y-3 text-[13px] text-[#c3c6d4]">
            <p>
              <strong className="text-[#dbe2f7]">Primary Region:</strong> Coimbatore, Tamil Nadu, India.
            </p>
            <p>
              <strong className="text-[#dbe2f7]">Key Hubs:</strong> Gandhipuram Central Bus Stand, Ukkadam Bus Terminal, Singanallur Terminal, RS Puram, Peelamedu (PSG Tech), Tech Park North (TIDEL Park Coimbatore), and Central Railway Station.
            </p>
            <p>
              <strong className="text-[#dbe2f7]">Transit Mode:</strong> Focused primarily on local city bus transit routes (e.g. Route 12, Route 11A, Express T-Line, Route 44 Loop) rather than worldwide generic transit.
            </p>
          </div>
        </div>

        {/* Cybersecurity & Verification Scope */}
        <div className="bg-[#141c2a] rounded-xl p-6 ghost-border">
          <div className="flex items-center gap-2 mb-3 text-[#10b981]">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
            <h3 className="font-headline-md text-[18px] font-bold text-[#dbe2f7]">
              AI-Based Cybersecurity Protection
            </h3>
          </div>
          <div className="space-y-3 text-[13px] text-[#c3c6d4]">
            <p>
              <strong className="text-[#dbe2f7]">Voice Biometrics:</strong> Spectral feature verification ensuring commands originate from authorized operators without sending voice packets to cloud servers.
            </p>
            <p>
              <strong className="text-[#dbe2f7]">Replay Attack Mitigation:</strong> Acoustic liveness detection designed to intercept pre-recorded audio replays and synthetic speech injection.
            </p>
            <p>
              <strong className="text-[#dbe2f7]">Zero Cloud Telemetry:</strong> Guarantees driver and route confidentiality through local-only processing.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Prototype Transparency Notice */}
      <section className="bg-[#18202e] rounded-xl p-6 ghost-border border-l-4 border-l-[#f59e0b]">
        <h3 className="font-headline-md text-[18px] font-bold text-[#dbe2f7] mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f59e0b]">gavel</span>
          Prototype Status & Engineering Guidelines (Steps 8 & 9)
        </h3>
        <div className="space-y-2 text-[13px] text-[#c3c6d4]">
          <p>
            • <strong>Simulation Notice:</strong> All biometric matching, spectral scores, and security pipeline stages in this interface represent prototype simulations designed to test frontend-to-backend workflows.
          </p>
          <p>
            • <strong>No Real Measurements Implied:</strong> The displayed confidence percentages in dashboard dials are UI indicators and should not be cited as real empirical research benchmarks or field measurement figures.
          </p>
          <p>
            • <strong>Offline Architecture:</strong> This application explicitly excludes Firebase, Supabase, Google Maps API, and cloud authentication, remaining 100% compatible with an on-premises or vehicular local Python backend.
          </p>
        </div>
      </section>

      {/* Quick Navigation Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-4 rounded-xl bg-[#141c2a] hover:bg-[#18202e] ghost-border text-left transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#aec6ff] mb-2">mic</span>
          <p className="font-bold text-[14px] text-[#dbe2f7]">Voice Console</p>
          <p className="text-[12px] text-[#c3c6d4]">Interact with voice input</p>
        </button>

        <button
          onClick={() => onNavigate('transport')}
          className="p-4 rounded-xl bg-[#141c2a] hover:bg-[#18202e] ghost-border text-left transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#aec6ff] mb-2">directions_bus</span>
          <p className="font-bold text-[14px] text-[#dbe2f7]">Bus Routes</p>
          <p className="text-[12px] text-[#c3c6d4]">Search Coimbatore routes</p>
        </button>

        <button
          onClick={() => onNavigate('security')}
          className="p-4 rounded-xl bg-[#141c2a] hover:bg-[#18202e] ghost-border text-left transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#aec6ff] mb-2">shield</span>
          <p className="font-bold text-[14px] text-[#dbe2f7]">Security Center</p>
          <p className="text-[12px] text-[#c3c6d4]">Inspect verification pipeline</p>
        </button>
      </div>
    </div>
  );
};
