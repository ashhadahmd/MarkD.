import * as Device from 'expo-device';
import murmurhash from 'murmurhash3js';

export const fingerprintService = {
  generateFingerprint(): string {
    const hardwareValues = `${Device.brand}-${Device.modelName}-${Device.osName}-${Device.osVersion}`;
    const hash = murmurhash.x64.hash128(hardwareValues, 31);
    return hash;
  }
};
