import React from 'react';
import { ScreenId } from '../types';

interface ArchitecturePageProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ onNavigate }) => {
  return (
    <div id="architecture-page" className="max-w-6xl mx-auto py-6 flex flex-col gap-6">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] sm:text-[32px] font-bold text-[#dbe2f7]">
            System Architecture Blueprint
          </h2>
          <p className="text-[14px] text-[#c3c6d4] mt-0.5">
            Production specification for the offline voice-integrated transport system with AI cybersecurity.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-[11px] font-mono font-bold self-start sm:self-auto">
          STANDALONE OFFLINE TARGET
        </div>
      </div>

      {/* Production Blueprint Callout (Requirement 14) */}
      <div className="p-5 rounded-2xl bg-[#141c2a] border border-[#2d3544] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-md text-[17px] font-bold text-[#dbe2f7]">
            Frontend Prototype Status Notice
          </h3>
          <p className="text-[13px] text-[#c3c6d4] mt-1 leading-relaxed max-w-3xl">
            This React application is the complete, functional frontend prototype designed to run standalone in the browser. It features mock service interfaces that directly match the API and IPC contracts of the intended target local Python backend stack.
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-lg bg-[#aec6ff] hover:bg-[#5d8ef1] text-[#00275e] font-bold text-[12px] whitespace-nowrap cursor-pointer transition-colors"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Pipeline Diagram */}
      <div className="bg-[#18202e] rounded-2xl p-6 sm:p-8 ghost-border">
        <h3 className="font-headline-md text-[18px] font-bold text-[#dbe2f7] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#aec6ff]">schema</span>
          End-to-End On-Device Data Flow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#aec6ff] font-bold">STAGE 01</span>
            <span className="material-symbols-outlined text-[32px] text-[#5d8ef1] my-2">mic</span>
            <div>
              <h4 className="font-bold text-[14px] text-[#dbe2f7]">Audio Ingestion</h4>
              <p className="text-[11px] text-[#c3c6d4] mt-1">16kHz PCM audio capture from vehicle cab</p>
            </div>
            <span className="mt-2 text-[10px] text-[#10b981] font-mono">Local Hardware</span>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#aec6ff] font-bold">STAGE 02</span>
            <span className="material-symbols-outlined text-[32px] text-[#10b981] my-2">security</span>
            <div>
              <h4 className="font-bold text-[14px] text-[#dbe2f7]">Cyber Defense</h4>
              <p className="text-[11px] text-[#c3c6d4] mt-1">Anti-replay, liveness, & voice biometrics</p>
            </div>
            <span className="mt-2 text-[10px] text-[#10b981] font-mono">CQCC / MFCC Filter</span>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#aec6ff] font-bold">STAGE 03</span>
            <span className="material-symbols-outlined text-[32px] text-[#fbbf24] my-2">graphic_eq</span>
            <div>
              <h4 className="font-bold text-[14px] text-[#dbe2f7]">Local STT</h4>
              <p className="text-[11px] text-[#c3c6d4] mt-1">Speech-to-text transcription</p>
            </div>
            <span className="mt-2 text-[10px] text-[#fbbf24] font-mono">Whisper.cpp / Vosk</span>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#aec6ff] font-bold">STAGE 04</span>
            <span className="material-symbols-outlined text-[32px] text-[#aec6ff] my-2">database</span>
            <div>
              <h4 className="font-bold text-[14px] text-[#dbe2f7]">Intent & GTFS</h4>
              <p className="text-[11px] text-[#c3c6d4] mt-1">Fuzzy matching & schedule queries</p>
            </div>
            <span className="mt-2 text-[10px] text-[#aec6ff] font-mono">SQLite / GTFS Core</span>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[#aec6ff] font-bold">STAGE 05</span>
            <span className="material-symbols-outlined text-[32px] text-[#5d8ef1] my-2">record_voice_over</span>
            <div>
              <h4 className="font-bold text-[14px] text-[#dbe2f7]">Local Audio TTS</h4>
              <p className="text-[11px] text-[#c3c6d4] mt-1">Speech audio synthesis</p>
            </div>
            <span className="mt-2 text-[10px] text-[#5d8ef1] font-mono">Piper / ONNX Engine</span>
          </div>
        </div>
      </div>

      {/* Module Breakdown Grid (Requirement 14: Clear Architecture Details) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Offline Frontend */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border">
          <div className="flex items-center gap-2 mb-2 text-[#aec6ff]">
            <span className="material-symbols-outlined text-[20px]">devices</span>
            <h4 className="font-bold text-[16px] text-[#dbe2f7]">Offline Frontend</h4>
          </div>
          <p className="text-[12px] text-[#c3c6d4] leading-relaxed mb-3">
            <strong className="text-[#dbe2f7]">Stack:</strong> React 19, TypeScript, Tailwind CSS.
          </p>
          <ul className="text-[12px] text-[#8d909e] space-y-1.5 list-disc list-inside">
            <li>Zero external runtime CDN or cloud dependency</li>
            <li>Clean service abstraction layer for future IPC</li>
            <li>Local state caching and audit history in browser storage</li>
          </ul>
        </div>

        {/* Local Backend */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border">
          <div className="flex items-center gap-2 mb-2 text-[#aec6ff]">
            <span className="material-symbols-outlined text-[20px]">terminal</span>
            <h4 className="font-bold text-[16px] text-[#dbe2f7]">Local Python Backend</h4>
          </div>
          <p className="text-[12px] text-[#c3c6d4] leading-relaxed mb-3">
            <strong className="text-[#dbe2f7]">Stack:</strong> Python 3.11+, FastAPI / Uvicorn (Localhost) or Unix Domain Sockets (IPC).
          </p>
          <ul className="text-[12px] text-[#8d909e] space-y-1.5 list-disc list-inside">
            <li>Zero internet egress bindings (127.0.0.1 only)</li>
            <li>Sub-50ms inter-process communication</li>
            <li>Direct interface to on-device audio hardware</li>
          </ul>
        </div>

        {/* Local STT */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border">
          <div className="flex items-center gap-2 mb-2 text-[#aec6ff]">
            <span className="material-symbols-outlined text-[20px]">mic</span>
            <h4 className="font-bold text-[16px] text-[#dbe2f7]">Local STT Engine</h4>
          </div>
          <p className="text-[12px] text-[#c3c6d4] leading-relaxed mb-3">
            <strong className="text-[#dbe2f7]">Models:</strong> Whisper-base.en (whisper.cpp) / Vosk Kaldi offline library.
          </p>
          <ul className="text-[12px] text-[#8d909e] space-y-1.5 list-disc list-inside">
            <li>Quantized INT8 CPU inference (~250ms RTF)</li>
            <li>Custom transit dictionary bias (Coimbatore stops)</li>
            <li>No cloud speech transmission</li>
          </ul>
        </div>

        {/* Intent Parsing & Fuzzy Matching */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border">
          <div className="flex items-center gap-2 mb-2 text-[#aec6ff]">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            <h4 className="font-bold text-[16px] text-[#dbe2f7]">Local Intent & Fuzzy Matcher</h4>
          </div>
          <p className="text-[12px] text-[#c3c6d4] leading-relaxed mb-3">
            <strong className="text-[#dbe2f7]">Engine:</strong> Rule-based pattern automata + Levenshtein / SymSpell stop normalizer.
          </p>
          <ul className="text-[12px] text-[#8d909e] space-y-1.5 list-disc list-inside">
            <li>Corrects phonetically ambiguous Tamil/English stop names</li>
            <li>Classifies 7 transit intent domains deterministically</li>
            <li>Strict bounds prevent command injection</li>
          </ul>
        </div>

        {/* Local Transport Database */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border">
          <div className="flex items-center gap-2 mb-2 text-[#aec6ff]">
            <span className="material-symbols-outlined text-[20px]">storage</span>
            <h4 className="font-bold text-[16px] text-[#dbe2f7]">Local SQLite & GTFS</h4>
          </div>
          <p className="text-[12px] text-[#c3c6d4] leading-relaxed mb-3">
            <strong className="text-[#dbe2f7]">Storage:</strong> SQLite3 with R-Tree spatial indexing & standard GTFS schema.
          </p>
          <ul className="text-[12px] text-[#8d909e] space-y-1.5 list-disc list-inside">
            <li>Pre-bundled Coimbatore bus network tables</li>
            <li>Zero-latency indexed timetable Lookups (&lt;2ms)</li>
            <li>Read-only filesystem lock prevents corruption</li>
          </ul>
        </div>

        {/* Local TTS */}
        <div className="bg-[#18202e] rounded-xl p-5 ghost-border">
          <div className="flex items-center gap-2 mb-2 text-[#aec6ff]">
            <span className="material-symbols-outlined text-[20px]">volume_up</span>
            <h4 className="font-bold text-[16px] text-[#dbe2f7]">Local Piper TTS</h4>
          </div>
          <p className="text-[12px] text-[#c3c6d4] leading-relaxed mb-3">
            <strong className="text-[#dbe2f7]">Synthesizer:</strong> Piper Neural VITS / ONNX Runtime.
          </p>
          <ul className="text-[12px] text-[#8d909e] space-y-1.5 list-disc list-inside">
            <li>High quality natural voice without internet access</li>
            <li>Ultra-fast streaming synthesis to ALSA / PulseAudio</li>
            <li>Zero external cloud synthesis APIs</li>
          </ul>
        </div>
      </div>

      {/* Cybersecurity Defense Stack Details (Requirement 14) */}
      <div className="bg-[#18202e] rounded-2xl p-6 sm:p-8 ghost-border">
        <h3 className="font-headline-md text-[18px] font-bold text-[#dbe2f7] mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#10b981]">shield</span>
          AI-Based Cybersecurity Defense Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544]">
            <h4 className="font-bold text-[#aec6ff] text-[14px] mb-1">
              Acoustic Replay Attack Detection
            </h4>
            <p className="text-[#c3c6d4] leading-relaxed">
              Analyzes raw audio for high-frequency spectral phase distortion and secondary room impulse response (RIR) signatures characteristic of pre-recorded loudspeaker playback.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544]">
            <h4 className="font-bold text-[#aec6ff] text-[14px] mb-1">
              Voice Biometrics & Speaker Verification
            </h4>
            <p className="text-[#c3c6d4] leading-relaxed">
              Extracts 128-dimensional acoustic embeddings via pre-trained on-device neural encoder to verify authorized driver identity prior to granting dispatch or timetable configuration access.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544]">
            <h4 className="font-bold text-[#aec6ff] text-[14px] mb-1">
              Input Validation & Command Integrity
            </h4>
            <p className="text-[#c3c6d4] leading-relaxed">
              All parsed transcripts undergo syntactic sanitation and semantic boundary checks to reject malformed, empty, or malicious shell/database injection payloads before execution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141c2a] border border-[#2d3544]">
            <h4 className="font-bold text-[#aec6ff] text-[14px] mb-1">
              Defensive Threat Mitigation
            </h4>
            <p className="text-[#c3c6d4] leading-relaxed">
              Zero offensive capability design: The system exclusively intercepts, quarantines, alerts, and records anomalous inputs into a tamper-evident local audit log without active counter-probing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
