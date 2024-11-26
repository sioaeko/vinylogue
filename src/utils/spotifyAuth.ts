import { btoa } from './base64';

const SPOTIFY_CLIENT_ID = '5339e5fe60e1455b8d08cde0f3c43d4b';
const SPOTIFY_CLIENT_SECRET = 'bfb8c1c5354a498197caaa235423841e';

interface TokenData {
  accessToken: string;
  expiresAt: number;
}

class SpotifyAuthManager {
  private static instance: SpotifyAuthManager;
  private tokenData: TokenData | null = null;
  private tokenPromise: Promise<string> | null = null;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private constructor() {}

  static getInstance(): SpotifyAuthManager {
    if (!SpotifyAuthManager.instance) {
      SpotifyAuthManager.instance = new SpotifyAuthManager();
    }
    return SpotifyAuthManager.instance;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isTokenValid(): boolean {
    return !!(
      this.tokenData &&
      this.tokenData.accessToken &&
      this.tokenData.expiresAt &&
      Date.now() < this.tokenData.expiresAt - 10000 // 10 second buffer
    );
  }

  async getToken(): Promise<string> {
    // Return existing token if valid
    if (this.isTokenValid()) {
      return this.tokenData!.accessToken;
    }

    // If a token request is in progress, return that promise
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Create new token request
    this.tokenPromise = this.fetchNewToken();

    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async fetchNewToken(): Promise<string> {
    try {
      const auth = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Token request failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      this.tokenData = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000)
      };

      this.retryCount = 0;
      return this.tokenData.accessToken;

    } catch (error) {
      console.error('Spotify auth error:', error);
      
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        await this.delay(this.RETRY_DELAY * this.retryCount);
        return this.fetchNewToken();
      }
      
      throw error;
    }
  }

  async refreshToken(): Promise<string> {
    this.tokenData = null;
    this.tokenPromise = null;
    return this.getToken();
  }
}

export const spotifyAuth = SpotifyAuthManager.getInstance();