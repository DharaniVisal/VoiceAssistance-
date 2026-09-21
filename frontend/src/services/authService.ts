import { IAuthService } from '../types';
import { logService } from './logService';

class AuthService implements IAuthService {
  private user = {
    name: 'Alex Mercer',
    id: 'TN-CBE-9824',
    email: 'a.mercer@tnstc-cbe.transit',
    role: 'Senior Transit Operator (Division 1)',
    clearance: 'Clearance: Level 3 (Operations)',
    voiceProfile: '128-dim MFCC / Spectral Acoustic Baseline #V-9824',
    twoFactor: true,
  };

  private verificationThreshold = 0.82;

  async verifyBiometricSimulation(forceFail = false) {
    // Simulated prototype biometric matching latency
    await new Promise((res) => setTimeout(res, 850));

    if (forceFail) {
      logService.addLog({
        event: 'Biometric Mismatch (Simulation)',
        status: 'Warning',
        description: 'Simulated acoustic spectral similarity score (0.58) below authorized driver threshold (0.82). Access restricted.',
        type: 'Profile Update',
        category: 'Authentication',
      });

      return {
        success: false,
        score: 0.58,
        threshold: this.verificationThreshold,
        message: 'Biometric verification failed: Spectral distance exceeded authorized variance threshold.',
      };
    }

    logService.addLog({
      event: 'Biometric Session Authorized',
      status: 'Success',
      description: 'Voice biometric session unlocked. Acoustic similarity score: 0.94 (Threshold: 0.82). Sensitive route details unmasked.',
      type: 'Profile Update',
      category: 'Authentication',
    });

    return {
      success: true,
      score: 0.94,
      threshold: this.verificationThreshold,
      message: 'Acoustic verification confirmed (Prototype Voice Verification Simulation).',
    };
  }

  getCurrentUser() {
    return this.user;
  }
}

export const authService = new AuthService();
