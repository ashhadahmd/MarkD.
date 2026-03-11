import AsyncStorage from '@react-native-async-storage/async-storage';
import { CookieJar } from 'tough-cookie';

const COOKIE_JAR_KEY = 'ssuet_cookie_jar';

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
  }
};
