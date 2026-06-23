import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { initializeApp, App, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { firebaseConfig } from '../config/env.config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: App | null = null;

  onModuleInit() {
    if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
      this.logger.warn('Firebase configuration is incomplete. Firebase Admin SDK NOT initialized. Google Auth will work in mock mode only.');
      return;
    }

    try {
      this.firebaseApp = initializeApp({
        credential: cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey,
        }),
      });
      this.logger.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase Admin: ${error.message}`);
    }
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    if (!this.firebaseApp) {
      // Allow development mock tokens when Firebase credentials are not provided
      if (token.startsWith('mock_')) {
        const mockUid = token.replace('mock_', '');
        this.logger.log(`Mocking Google ID Token verification for UID: ${mockUid}`);
        return {
          uid: mockUid,
          email: `${mockUid}@gmail.com`,
          name: `${mockUid} Mocked User`,
          email_verified: true,
          auth_time: Math.floor(Date.now() / 1000),
          iss: 'https://securetoken.google.com/mock',
          aud: 'mock',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          sub: mockUid,
          firebase: {
            identities: {
              'google.com': [mockUid]
            },
            sign_in_provider: 'google.com'
          }
        } as DecodedIdToken;
      }
      throw new Error('Firebase Admin SDK is not initialized. Provide FCM environment variables or use a mock_ token for development.');
    }
    return getAuth().verifyIdToken(token);
  }
}
