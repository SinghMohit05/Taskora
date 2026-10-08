import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'taskora_jwt_token';
const LEGACY_TOKEN_KEY = 'taskforge_jwt_token';

export const secureStorage = {
  async getToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) return token;
      return await SecureStore.getItemAsync(LEGACY_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      throw new Error('Failed to persist authentication token to secure storage');
    }
  },

  async deleteToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
    } catch {
      // Best-effort removal
    }
  },
};
