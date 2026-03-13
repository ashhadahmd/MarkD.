import AsyncStorage from '@react-native-async-storage/async-storage';
import { CookieJar } from 'tough-cookie';

const COOKIE_JAR_KEY = 'ssuet_cookie_jar';
const REMEMBER_ME_KEY = 'remember_me';

export const sessionService = {
  async loadJar(): Promise<CookieJar> {
    const stored = await AsyncStorage.getItem(COOKIE_JAR_KEY);
    if (stored) {
      try {
        const jar = CookieJar.deserializeSync(JSON.parse(stored));
        return jar;
      } catch (e) {}
    }
    return new CookieJar();
  },

  async saveJar(jar: CookieJar): Promise<void> {
    try {
      const serialized = jar.serializeSync();
      await AsyncStorage.setItem(COOKIE_JAR_KEY, JSON.stringify(serialized));
    } catch(e) {}
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(COOKIE_JAR_KEY);
  },

  async setRememberMe(value: boolean): Promise<void> {
    await AsyncStorage.setItem(REMEMBER_ME_KEY, value ? 'true' : 'false');
  },

  async getRememberMe(): Promise<boolean> {
    const val = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    return val === 'true';
  },

  async clearIfNotPersistent(): Promise<void> {
    const remember = await this.getRememberMe();
    if (!remember) {
      await this.clearSession();
    }
  },
};
