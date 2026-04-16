import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get<string>('firebase.projectId'),
          clientEmail: this.config.get<string>('firebase.clientEmail'),
          privateKey: this.config.get<string>('firebase.privateKey'),
        }),
      });
      this.logger.log('Firebase Admin SDK initialized');
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(idToken);
  }

  async createUser(email: string, password: string): Promise<admin.auth.UserRecord> {
    return admin.auth().createUser({ email, password });
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    return admin.auth().getUserByEmail(email);
  }

  async deleteUser(uid: string): Promise<void> {
    return admin.auth().deleteUser(uid);
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    return admin.auth().generatePasswordResetLink(email);
  }
}
