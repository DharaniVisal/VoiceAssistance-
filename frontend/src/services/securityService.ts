import { ISecurityService, SecurityStatus, SecurityStateLevel } from '../types';
import { logService } from './logService';

class SecurityService implements ISecurityService {
  private currentStatus: SecurityStatus = {
    identityVerified: true,
    driverId: 'TN-CBE-9824',
    driverName: 'Alex Mercer',
    clearanceLevel: 'Level 3 - Operations',
    voiceBiometricsStatus: 'SECURE',
    inputValidationStatus: 'SECURE',
    commandIntegrityStatus: 'SECURE',
    replayProtectionStatus: 'SECURE',
    unauthorizedAccessStatus: 'SECURE',
    pipelineSteps: {
      command: 'Received',
      idCheck: 'Valid',
      speakerVerif: 'Valid',
      replayCheck: 'Passed',
      access: 'Granted',
    },
  };

  getSecurityOverview(): SecurityStatus {
    return { ...this.currentStatus };
  }

  async checkReplayAttack(isReplayAttackSimulation = false) {
    // Simulated defensive verification pipeline delay
    await new Promise((res) => setTimeout(res, 700));

    if (isReplayAttackSimulation) {
      // Replay attack simulation detected
      this.currentStatus.replayProtectionStatus = 'BLOCKED';
      this.currentStatus.pipelineSteps.replayCheck = 'Detected';
      this.currentStatus.pipelineSteps.access = 'Denied';

      logService.addLog({
        event: 'Replay Attack Intercepted',
        status: 'Blocked',
        description: 'Synthetic audio playback signature detected. Inconsistent room impulse response (RIR) & phase jitter. Command rejected.',
        type: 'Security Check',
        category: 'Threat Mitigation',
      });

      return {
        isReplay: true,
        confidenceScore: 0.18,
        livenessConfirmed: false,
        status: 'BLOCKED' as SecurityStateLevel,
        message: 'Acoustic replay attack detected. Simulated pre-recorded playback intercepted and quarantined.',
        simulationNotice: 'Prototype Voice Verification Simulation — Local Defensive Pipeline',
      };
    }

    // Normal genuine voice check passed
    this.currentStatus.replayProtectionStatus = 'SECURE';
    this.currentStatus.pipelineSteps.replayCheck = 'Passed';
    this.currentStatus.pipelineSteps.access = 'Granted';

    logService.addLog({
      event: 'Voice Biometric Verification',
      status: 'Success',
      description: 'Acoustic liveness confirmed (CQCC spectral analysis score: 0.94). Operator Alex Mercer verified.',
      type: 'Security Check',
      category: 'Authentication',
    });

    return {
      isReplay: false,
      confidenceScore: 0.94,
      livenessConfirmed: true,
      status: 'SECURE' as SecurityStateLevel,
      message: 'Liveness confirmed. Spectral harmonic distribution matches live human vocal tract.',
      simulationNotice: 'Prototype Voice Verification Simulation — Local Defensive Pipeline',
    };
  }

  validateCommand(command: string): { valid: boolean; reason?: string; status: SecurityStateLevel } {
    const trimmed = (command || '').trim();

    if (!trimmed) {
      this.currentStatus.inputValidationStatus = 'WARNING';
      logService.addLog({
        event: 'Input Validation Warning',
        status: 'Warning',
        description: 'Null or empty command payload submitted to speech processor.',
        type: 'Security Check',
        category: 'Direct Input',
      });
      return {
        valid: false,
        reason: 'Empty command input rejected.',
        status: 'WARNING',
      };
    }

    const dangerousWords = ['delete database', 'drop table', 'truncate', 'format', 'rm -rf', 'system override', 'bypass'];
    for (const bad of dangerousWords) {
      if (trimmed.toLowerCase().includes(bad)) {
        this.currentStatus.commandIntegrityStatus = 'BLOCKED';
        logService.addLog({
          event: 'Command Integrity Alert',
          status: 'Blocked',
          description: `Blocked unauthorized administrative instruction: "${bad}". Command integrity check failed.`,
          type: 'Security Check',
          category: 'Threat Mitigation',
        });
        return {
          valid: false,
          reason: `Rejected: Command integrity violation ("${bad}" unsupported).`,
          status: 'BLOCKED',
        };
      }
    }

    this.currentStatus.inputValidationStatus = 'SECURE';
    this.currentStatus.commandIntegrityStatus = 'SECURE';
    return {
      valid: true,
      status: 'SECURE',
    };
  }
}

export const securityService = new SecurityService();
