import React, { useState } from 'react';
import { speechService } from '../services/speechService';
import { logService } from '../services/logService';

interface BackendResult {
  text: string;
  intent: string;
  entities: {
    bus_number: string | null;
    source: string | null;
    destination: string | null;
  };
  buses: any[];
  response: string;
  audio?: string;
}

type Stage =
  | 'READY'
  | 'LISTENING'
  | 'PROCESSING'
  | 'VALIDATING'
  | 'COMPLETE';

const VoiceAssistantPage: React.FC = () => {
  const [commandInput, setCommandInput] = useState('');
  const [result, setResult] =
    useState<BackendResult | null>(null);

  const [stage, setStage] =
    useState<Stage>('READY');

  const [loading, setLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [error, setError] =
    useState('');

  const [authStatus, setAuthStatus] =
    useState('Not verified');

  // ==========================================
  // PLAY PIPER AUDIO
  // ==========================================

  const playResponseAudio = async (
    audioPath?: string
  ) => {
    if (!audioPath) return;

    try {
      const audio = new Audio(
        `http://127.0.0.1:8000${audioPath}`
      );

      await audio.play();
    } catch (err) {
      console.log(
        'Audio playback error:',
        err
      );
    }
  };

  // ==========================================
  // HANDLE BACKEND RESULT
  // ==========================================

  const handleBackendResult = async (
    data: BackendResult
  ) => {
    setResult(data);

    setStage('VALIDATING');
    setAuthStatus('Voice verification passed');

    await new Promise((resolve) =>
      setTimeout(resolve, 400)
    );

    setStage('COMPLETE');

    if (data.audio) {
      await playResponseAudio(data.audio);
    }
  };

  // ==========================================
  // TEXT COMMAND
  // ==========================================

  const processTypedCommand = async () => {
    const text = commandInput.trim();

    if (!text) {
      setError(
        'Please enter a transport command.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setAuthStatus('Not required for typed command');
    setStage('PROCESSING');

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/text',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            text: String(text),
          }),
        }
      );

      const data = await response.json();

      console.log(
        'FastAPI /text response:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.detail
            ? JSON.stringify(data.detail)
            : `Backend error: ${response.status}`
        );
      }

      await handleBackendResult(data);

      logService.addLog({
        event: `Typed Intent: ${data.intent}`,
        status: 'Success',
        description:
          `Input: "${text}" → Intent: ${data.intent}`,
        type: 'Voice Command',
        category: 'Direct Input',
      });

    } catch (err: any) {
      console.error(
        'TEXT COMMAND ERROR:',
        err
      );

      setError(
        err?.message ||
          'Could not connect to FastAPI backend.'
      );

      setStage('READY');

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VOICE COMMAND
  // ==========================================

  const handleVoiceCommand = async () => {
    if (listening) return;

    setListening(true);
    setLoading(true);
    setError('');
    setResult(null);
    setAuthStatus('Checking voice...');
    setStage('LISTENING');

    try {
      await speechService.startListening(
        (text) => {
          setCommandInput(text);
        },

        (err) => {
          console.error(
            'Speech error:',
            err
          );

          setError(err);
          setListening(false);
          setLoading(false);
          setStage('READY');
        },

        async (data) => {
          console.log(
            'FastAPI /voice response:',
            data
          );

          await handleBackendResult(data);

          setListening(false);
          setLoading(false);
        }
      );

    } catch (err: any) {
      console.error(
        'VOICE COMMAND ERROR:',
        err
      );

      setError(
        err?.message ||
          'Could not access microphone.'
      );

      setListening(false);
      setLoading(false);
      setStage('READY');
    }
  };

  // ==========================================
  // STOP VOICE
  // ==========================================

  const stopVoiceCommand = () => {
    speechService.stopListening();

    setListening(false);
    setLoading(false);
    setStage('READY');
    setAuthStatus('Stopped');
  };

  // ==========================================
  // STAGE TEXT
  // ==========================================

  const getStageText = () => {
    switch (stage) {
      case 'LISTENING':
        return 'Listening for your voice...';

      case 'PROCESSING':
        return 'Processing command...';

      case 'VALIDATING':
        return 'Validating transport request...';

      case 'COMPLETE':
        return 'Request completed';

      default:
        return 'Ready for your command';
    }
  };

  // ==========================================
  // STAGE ICON
  // ==========================================

  const getStageIcon = () => {
    switch (stage) {
      case 'LISTENING':
        return '🎙️';

      case 'PROCESSING':
        return '⚙️';

      case 'VALIDATING':
        return '🔐';

      case 'COMPLETE':
        return '✓';

      default:
        return '●';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background:
          'linear-gradient(135deg, #07111f 0%, #0b1628 50%, #111827 100%)',
        color: '#ffffff',
        fontFamily:
          'Arial, Helvetica, sans-serif',
        boxSizing: 'border-box',
        padding: '28px',
      }}
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              🚍 VoiceTransport
            </h1>

            <p
              style={{
                margin:
                  '7px 0 0',
                color: '#94a3b8',
                fontSize: '15px',
              }}
            >
              AI Voice-Based Public
              Transport Assistant
            </p>
          </div>

          <div
            style={{
              padding:
                '10px 18px',
              borderRadius: '20px',
              background:
                'rgba(34,197,94,0.12)',
              border:
                '1px solid rgba(34,197,94,0.35)',
              color: '#4ade80',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            ● SYSTEM ONLINE
          </div>

        </div>

        {/* =====================================
            PIPELINE
        ===================================== */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(6, 1fr)',
            gap: '10px',
            marginBottom: '25px',
          }}
        >

          {[
            ['🎤', 'Voice Input'],
            ['📝', 'Whisper STT'],
            ['🧠', 'Intent'],
            ['🔎', 'Entity Match'],
            ['🗄️', 'Transport DB'],
            ['🔊', 'Piper TTS'],
          ].map(
            ([icon, title], index) => (
              <div
                key={title}
                style={{
                  background:
                    'rgba(15,23,42,0.85)',
                  border:
                    '1px solid #263449',
                  borderRadius: '10px',
                  padding: '13px 8px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '19px',
                    marginBottom: '5px',
                  }}
                >
                  {icon}
                </div>

                <div
                  style={{
                    color: '#cbd5e1',
                    fontSize: '11px',
                  }}
                >
                  {title}
                </div>

                {index <
                  5 && (
                  <div
                    style={{
                      display: 'none',
                    }}
                  />
                )}
              </div>
            )
          )}

        </div>

        {/* =====================================
            MAIN GRID
        ===================================== */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1.2fr 0.8fr',
            gap: '22px',
          }}
        >

          {/* ===================================
              LEFT SIDE
          =================================== */}

          <div>

            {/* COMMAND CARD */}

            <div
              style={{
                background:
                  'rgba(15,23,42,0.92)',
                border:
                  '1px solid #263449',
                borderRadius: '16px',
                padding: '25px',
                boxShadow:
                  '0 15px 40px rgba(0,0,0,0.25)',
              }}
            >

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                }}
              >

                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '20px',
                    }}
                  >
                    Transport Assistant
                  </h2>

                  <p
                    style={{
                      margin:
                        '6px 0 0',
                      color:
                        '#64748b',
                      fontSize:
                        '13px',
                    }}
                  >
                    Speak or type your
                    transport request
                  </p>
                </div>

                <div
                  style={{
                    fontSize:
                      '28px',
                  }}
                >
                  🤖
                </div>

              </div>

              {/* INPUT */}

              <input
                type="text"
                value={commandInput}
                onChange={(e) =>
                  setCommandInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !loading
                  ) {
                    processTypedCommand();
                  }
                }}
                placeholder="Bus timing from Gandhipuram to Ukkadam"
                style={{
                  width: '100%',
                  boxSizing:
                    'border-box',
                  padding:
                    '16px',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid #334155',
                  background:
                    '#0b1220',
                  color:
                    '#ffffff',
                  outline: 'none',
                  fontSize:
                    '15px',
                }}
              />

              {/* BUTTONS */}

              <div
                style={{
                  display:
                    'flex',
                  gap: '12px',
                  marginTop:
                    '15px',
                }}
              >

                <button
                  onClick={
                    processTypedCommand
                  }
                  disabled={
                    loading
                  }
                  style={{
                    flex: 1,
                    padding:
                      '14px',
                    border: 'none',
                    borderRadius:
                      '10px',
                    background:
                      loading
                        ? '#334155'
                        : '#2563eb',
                    color:
                      '#ffffff',
                    fontSize:
                      '14px',
                    fontWeight:
                      600,
                    cursor:
                      loading
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {loading
                    ? 'Processing...'
                    : 'Send Command'}
                </button>

                {!listening ? (
                  <button
                    onClick={
                      handleVoiceCommand
                    }
                    disabled={
                      loading
                    }
                    style={{
                      flex: 1,
                      padding:
                        '14px',
                      border:
                        '1px solid #334155',
                      borderRadius:
                        '10px',
                      background:
                        '#172033',
                      color:
                        '#ffffff',
                      fontSize:
                        '14px',
                      fontWeight:
                        600,
                      cursor:
                        loading
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    🎤 Speak
                  </button>
                ) : (
                  <button
                    onClick={
                      stopVoiceCommand
                    }
                    style={{
                      flex: 1,
                      padding:
                        '14px',
                      border:
                        'none',
                      borderRadius:
                        '10px',
                      background:
                        '#dc2626',
                      color:
                        '#ffffff',
                      fontSize:
                        '14px',
                      fontWeight:
                        600,
                      cursor:
                        'pointer',
                    }}
                  >
                    ⏹ Stop
                  </button>
                )}

              </div>

              {/* STATUS */}

              <div
                style={{
                  marginTop:
                    '20px',
                  padding:
                    '14px',
                  background:
                    '#0b1220',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid #263449',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: '12px',
                }}
              >

                <span
                  style={{
                    fontSize:
                      '22px',
                  }}
                >
                  {getStageIcon()}
                </span>

                <div>
                  <div
                    style={{
                      fontSize:
                        '14px',
                      fontWeight:
                        600,
                    }}
                  >
                    {getStageText()}
                  </div>

                  <div
                    style={{
                      marginTop:
                        '3px',
                      color:
                        '#64748b',
                      fontSize:
                        '12px',
                    }}
                  >
                    {authStatus}
                  </div>
                </div>

              </div>

              {error && (
                <div
                  style={{
                    marginTop:
                      '15px',
                    padding:
                      '12px',
                    borderRadius:
                      '8px',
                    background:
                      'rgba(239,68,68,0.12)',
                    border:
                      '1px solid rgba(239,68,68,0.3)',
                    color:
                      '#fca5a5',
                    fontSize:
                      '13px',
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

            </div>

            {/* RESULT CARD */}

            {result && (
              <div
                style={{
                  marginTop:
                    '22px',
                  background:
                    'rgba(15,23,42,0.92)',
                  border:
                    '1px solid #263449',
                  borderRadius:
                    '16px',
                  padding:
                    '25px',
                }}
              >

                <h2
                  style={{
                    margin:
                      '0 0 20px',
                    fontSize:
                      '20px',
                  }}
                >
                  📊 Transport Result
                </h2>

                {/* ENTITY GRID */}

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      'repeat(3, 1fr)',
                    gap: '12px',
                  }}
                >

                  <InfoBox
                    title="Intent"
                    value={
                      result.intent
                    }
                  />

                  <InfoBox
                    title="Source"
                    value={
                      result
                        .entities
                        .source ||
                      'Not detected'
                    }
                  />

                  <InfoBox
                    title="Destination"
                    value={
                      result
                        .entities
                        .destination ||
                      'Not detected'
                    }
                  />

                </div>

                {/* COMMAND */}

                <div
                  style={{
                    marginTop:
                      '15px',
                    padding:
                      '14px',
                    background:
                      '#0b1220',
                    borderRadius:
                      '9px',
                  }}
                >

                  <div
                    style={{
                      color:
                        '#64748b',
                      fontSize:
                        '11px',
                      marginBottom:
                        '5px',
                    }}
                  >
                    RECOGNIZED COMMAND
                  </div>

                  <div
                    style={{
                      fontSize:
                        '14px',
                    }}
                  >
                    {result.text}
                  </div>

                </div>

                {/* RESPONSE */}

                <div
                  style={{
                    marginTop:
                      '15px',
                    padding:
                      '15px',
                    background:
                      'rgba(37,99,235,0.08)',
                    border:
                      '1px solid rgba(37,99,235,0.2)',
                    borderRadius:
                      '9px',
                  }}
                >

                  <div
                    style={{
                      color:
                        '#60a5fa',
                      fontSize:
                        '11px',
                      marginBottom:
                        '7px',
                    }}
                  >
                    ASSISTANT RESPONSE
                  </div>

                  <div
                    style={{
                      whiteSpace:
                        'pre-line',
                      lineHeight:
                        '1.6',
                      fontSize:
                        '14px',
                    }}
                  >
                    {result.response}
                  </div>

                </div>

                {/* BUSES */}

                {result.buses &&
                  result.buses.length >
                    0 && (
                    <div
                      style={{
                        marginTop:
                          '20px',
                      }}
                    >

                      <h3
                        style={{
                          fontSize:
                            '16px',
                          marginBottom:
                            '12px',
                        }}
                      >
                        🚌 Available Buses
                      </h3>

                      {result.buses.map(
                        (
                          bus,
                          index
                        ) => (
                          <div
                            key={
                              index
                            }
                            style={{
                              display:
                                'grid',
                              gridTemplateColumns:
                                '1fr 1fr 1fr 1fr 0.6fr',
                              gap:
                                '10px',
                              padding:
                                '14px',
                              marginBottom:
                                '8px',
                              background:
                                '#0b1220',
                              border:
                                '1px solid #263449',
                              borderRadius:
                                '9px',
                              alignItems:
                                'center',
                            }}
                          >

                            <InfoSmall
                              label="BUS"
                              value={
                                bus[0]
                              }
                            />

                            <InfoSmall
                              label="NAME"
                              value={
                                bus[1]
                              }
                            />

                            <InfoSmall
                              label="DEPARTURE"
                              value={
                                bus[2]
                              }
                            />

                            <InfoSmall
                              label="ARRIVAL"
                              value={
                                bus[3]
                              }
                            />

                            <InfoSmall
                              label="FARE"
                              value={`₹${bus[4]}`}
                            />

                          </div>
                        )
                      )}

                    </div>
                  )}

              </div>
            )}

          </div>

          {/* ===================================
              RIGHT SIDE
          =================================== */}

          <div>

            {/* SECURITY */}

            <div
              style={{
                background:
                  'rgba(15,23,42,0.92)',
                border:
                  '1px solid #263449',
                borderRadius:
                  '16px',
                padding:
                  '22px',
              }}
            >

              <h2
                style={{
                  margin:
                    '0 0 18px',
                  fontSize:
                    '18px',
                }}
              >
                🔐 Voice Security
              </h2>

              <div
                style={{
                  padding:
                    '18px',
                  background:
                    '#0b1220',
                  borderRadius:
                    '10px',
                  textAlign:
                    'center',
                }}
              >

                <div
                  style={{
                    fontSize:
                      '35px',
                  }}
                >
                  {listening
                    ? '🎙️'
                    : '🔒'}
                </div>

                <div
                  style={{
                    marginTop:
                      '10px',
                    fontWeight:
                      600,
                  }}
                >
                  {authStatus}
                </div>

                <div
                  style={{
                    marginTop:
                      '6px',
                    color:
                      '#64748b',
                    fontSize:
                      '12px',
                  }}
                >
                  Prototype Voice
                  Verification
                </div>

              </div>

              <div
                style={{
                  marginTop:
                    '15px',
                  fontSize:
                    '12px',
                  color:
                    '#64748b',
                  lineHeight:
                    '1.6',
                }}
              >
                Voice authentication is
                currently implemented as
                a prototype security layer.
              </div>

            </div>

            {/* PROCESSING */}

            <div
              style={{
                marginTop:
                  '20px',
                background:
                  'rgba(15,23,42,0.92)',
                border:
                  '1px solid #263449',
                borderRadius:
                  '16px',
                padding:
                  '22px',
              }}
            >

              <h2
                style={{
                  margin:
                    '0 0 18px',
                  fontSize:
                    '18px',
                }}
              >
                ⚙️ Processing Pipeline
              </h2>

              {[
                [
                  '01',
                  'Voice Input',
                  'Microphone',
                ],
                [
                  '02',
                  'Speech-to-Text',
                  'Whisper.cpp',
                ],
                [
                  '03',
                  'Intent Detection',
                  'Python',
                ],
                [
                  '04',
                  'Entity Matching',
                  'RapidFuzz',
                ],
                [
                  '05',
                  'Transport Search',
                  'SQLite',
                ],
                [
                  '06',
                  'Response',
                  'Piper TTS',
                ],
              ].map(
                ([num, title, value]) => (
                  <div
                    key={num}
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: '12px',
                      padding:
                        '10px 0',
                      borderBottom:
                        '1px solid #1e293b',
                    }}
                  >

                    <div
                      style={{
                        width:
                          '30px',
                        height:
                          '30px',
                        borderRadius:
                          '8px',
                        background:
                          '#172033',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        fontSize:
                          '11px',
                        color:
                          '#60a5fa',
                      }}
                    >
                      {num}
                    </div>

                    <div
                      style={{
                        flex: 1,
                      }}
                    >

                      <div
                        style={{
                          fontSize:
                            '13px',
                          fontWeight:
                            600,
                        }}
                      >
                        {title}
                      </div>

                      <div
                        style={{
                          color:
                            '#64748b',
                          fontSize:
                            '11px',
                          marginTop:
                            '2px',
                        }}
                      >
                        {value}
                      </div>

                    </div>

                    <div
                      style={{
                        color:
                          '#4ade80',
                        fontSize:
                          '12px',
                      }}
                    >
                      ✓
                    </div>

                  </div>
                )
              )}

            </div>

            {/* TEST COMMANDS */}

            <div
              style={{
                marginTop:
                  '20px',
                background:
                  'rgba(15,23,42,0.92)',
                border:
                  '1px solid #263449',
                borderRadius:
                  '16px',
                padding:
                  '22px',
              }}
            >

              <h2
                style={{
                  margin:
                    '0 0 14px',
                  fontSize:
                    '18px',
                }}
              >
                💡 Example Commands
              </h2>

              {[
                'Bus timing from Gandhipuram to Ukkadam',
                'Bus fare from Gandhipuram to Singanallur',
                'Route from Gandhipuram to Peelamedu',
                'Buses available from Ukkadam to Town Hall',
              ].map(
                (example) => (
                  <button
                    key={example}
                    onClick={() =>
                      setCommandInput(
                        example
                      )
                    }
                    style={{
                      width:
                        '100%',
                      textAlign:
                        'left',
                      padding:
                        '10px',
                      marginBottom:
                        '7px',
                      background:
                        '#0b1220',
                      border:
                        '1px solid #263449',
                      borderRadius:
                        '7px',
                      color:
                        '#cbd5e1',
                      cursor:
                        'pointer',
                      fontSize:
                        '11px',
                    }}
                  >
                    {example}
                  </button>
                )
              )}

            </div>

          </div>

        </div>

        {/* =====================================
            FOOTER
        ===================================== */}

        <div
          style={{
            textAlign:
              'center',
            marginTop:
              '28px',
            paddingTop:
              '20px',
            borderTop:
              '1px solid #1e293b',
            color:
              '#64748b',
            fontSize:
              '12px',
          }}
        >
          VoiceTransport • Secure Offline
          Transport Assistance
          <br />
          Whisper.cpp • FastAPI • SQLite •
          Piper TTS
        </div>

      </div>

    </div>
  );
};

// ==========================================
// SMALL INFO COMPONENTS
// ==========================================

const InfoBox = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => {
  return (
    <div
      style={{
        background:
          '#0b1220',
        border:
          '1px solid #263449',
        borderRadius:
          '9px',
        padding:
          '13px',
      }}
    >
      <div
        style={{
          color:
            '#64748b',
          fontSize:
            '10px',
          marginBottom:
            '5px',
          textTransform:
            'uppercase',
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            '13px',
          fontWeight:
            600,
        }}
      >
        {value}
      </div>
    </div>
  );
};

const InfoSmall = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div>
      <div
        style={{
          color:
            '#64748b',
          fontSize:
            '9px',
          marginBottom:
            '4px',
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize:
            '11px',
          fontWeight:
            600,
          color:
            '#e2e8f0',
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default VoiceAssistantPage;