/**
 * TransitVoice: Types & Service Interfaces
 * Strictly offline-first architecture for Coimbatore local bus transit
 */

export type ScreenId =
  | 'dashboard'
  | 'voice-assistant'
  | 'transport'
  | 'navigation'
  | 'auth'
  | 'security'
  | 'security-logs'
  | 'architecture'
  | 'about';

export type VoiceAssistantStage =
  | 'READY'
  | 'LISTENING'
  | 'AUTHENTICATING'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'RESPONSE'
  | 'TTS';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export type SecurityStateLevel = 'SECURE' | 'WARNING' | 'BLOCKED';

export type TravelMode = 'bus' | 'walk' | 'car' | 'bike';

export type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

export interface TransitStop {
  id: string;
  name: string;
  landmark?: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central';
  coordinates: { x: number; y: number }; // Relative coordinates on offline canvas/map
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  name: string;
  origin: string;
  destination: string;
  stops: string[];
  via: string[];
  departureTime: string;
  arrivalTime: string;
  firstTiming: string;
  lastTiming: string;
  durationMinutes: number;
  frequencyMinutes: number;
  fare: string;
  badge?: 'Fastest' | 'High Frequency' | 'Eco Choice';
  status: 'On Time' | 'Moderate Delay' | 'Departing Soon';
  type: 'City Bus' | 'Express' | 'Loop';
}

export interface SecurityStatus {
  identityVerified: boolean;
  driverId: string;
  driverName: string;
  clearanceLevel: string;
  voiceBiometricsStatus: SecurityStateLevel;
  inputValidationStatus: SecurityStateLevel;
  commandIntegrityStatus: SecurityStateLevel;
  replayProtectionStatus: SecurityStateLevel;
  unauthorizedAccessStatus: SecurityStateLevel;
  pipelineSteps: {
    command: 'Received' | 'Pending';
    idCheck: 'Valid' | 'Invalid' | 'Pending';
    speakerVerif: 'Processing' | 'Valid' | 'Failed';
    replayCheck: 'Pending' | 'Passed' | 'Detected';
    access: 'Locked' | 'Granted' | 'Denied';
  };
}

export type SecurityLogStatus = 'Success' | 'Warning' | 'Blocked';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  event: string;
  status: SecurityLogStatus;
  description: string;
  type: 'Voice Command' | 'Route Calculation' | 'Location Override' | 'Profile Update' | 'System Login' | 'Security Check';
  category: 'Direct Input' | 'System Action' | 'Manual Intervention' | 'Account Sync' | 'Authentication' | 'Threat Mitigation';
  securityBadgeColor?: string;
}

export type SupportedIntent =
  | 'ROUTE_SEARCH'
  | 'BUS_TIMING'
  | 'BUS_STOP'
  | 'DIRECTIONS'
  | 'AVAILABLE_BUSES'
  | 'HELP'
  | 'UNKNOWN';

export interface ParsedIntentResult {
  intent: SupportedIntent;
  source?: string;
  destination?: string;
  routeNumber?: string;
  stopName?: string;
  rawText: string;
  correctionNotice?: string;
  validationStatus: 'VALID' | 'EMPTY' | 'BLOCKED_INTEGRITY';
  validationMessage?: string;
  replyText: string;
}

// Clean Service Interfaces for future local Python backend compatibility
export interface ISpeechService {
  startListening(onTranscript: (text: string, isFinal: boolean) => void, onError: (err: string) => void): Promise<void>;
  stopListening(): void;
  isSupported(): boolean;
}

export interface IAuthService {
  verifyBiometricSimulation(forceFail?: boolean): Promise<{
    success: boolean;
    score: number;
    threshold: number;
    message: string;
  }>;
  getCurrentUser(): {
    name: string;
    id: string;
    email: string;
    role: string;
    clearance: string;
    voiceProfile: string;
    twoFactor: boolean;
  };
}

export interface IIntentService {
  parseVoiceCommand(transcript: string): Promise<ParsedIntentResult>;
  fuzzyMatchStop(input: string): { matchedName: string; corrected: boolean };
}

export interface ITransportService {
  searchRoutes(source: string, destination: string): Promise<BusRoute[]>;
  getPopularRoutes(): BusRoute[];
  getAllRoutes(): BusRoute[];
  getAllStops(): TransitStop[];
  getRouteByNumber(routeNumber: string): BusRoute | undefined;
}

export interface INavigationService {
  getRouteWaypoints(routeId: string): { x: number; y: number; name: string }[];
  calculateETA(source: string, destination: string, mode?: TravelMode): {
    etaMinutes: number;
    distanceKm: number;
    speedKmh: number;
  };
}

export interface ISecurityService {
  checkReplayAttack(isReplayAttackSimulation?: boolean): Promise<{
    isReplay: boolean;
    confidenceScore: number;
    livenessConfirmed: boolean;
    status: SecurityStateLevel;
    message: string;
    simulationNotice: string;
  }>;
  validateCommand(command: string): {
    valid: boolean;
    reason?: string;
    status: SecurityStateLevel;
  };
  getSecurityOverview(): SecurityStatus;
}

export interface ITTSService {
  speak(text: string, onEnd?: () => void): void;
  cancel(): void;
}
