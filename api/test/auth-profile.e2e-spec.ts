import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * E2E Auth & Profile tests.
 *
 * These tests run against a real NestJS app bootstrap but mock the external
 * services (Firebase, Directus, R2) so they do not require live credentials.
 *
 * External deps are mocked at the module level via jest.mock() before the
 * AppModule is imported.
 */

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockRejectedValue(new Error('mock: always invalid in tests')),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    generatePasswordResetLink: jest.fn().mockResolvedValue('https://reset.link'),
  })),
}));

jest.mock('@/utils/directus.api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        response: { use: jest.fn() },
        request: { use: jest.fn() },
      },
    })),
  },
}));

import axios from 'axios';
import directusApi from '../src/utils/directus.api';

const axiosPost = axios.post as jest.Mock;
const mockedDirectusApi = directusApi as jest.Mocked<typeof directusApi>;

describe('Auth & Profile (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Public routes ────────────────────────────────────────────────────────

  describe('GET /v1/categories', () => {
    it('returns 200 with category list', () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({
        data: { data: [{ id: '1', name: 'Design', slug: 'design' }] },
      });

      return request(app.getHttpServer()).get('/v1/categories').expect(200);
    });
  });

  // ─── Auth: register ───────────────────────────────────────────────────────

  describe('POST /v1/auth/register', () => {
    const validBody = {
      email: 'student@ju.edu.bd',
      password: 'Password123',
      display_name: 'Rahim',
      username: 'rahim_test',
    };

    it('returns 201 and tokens on valid registration', async () => {
      // username not taken
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: [] } });
      // firebase createUser
      const { auth } = await import('firebase-admin');
      (auth().createUser as jest.Mock).mockResolvedValueOnce({ uid: 'new-uid' });
      // directus create profile
      mockedDirectusApi.post = jest.fn().mockResolvedValueOnce({
        data: {
          data: {
            id: 'p-uuid',
            username: 'rahim_test',
            is_verified: false,
            role: 'student',
            email: validBody.email,
            display_name: validBody.display_name,
          },
        },
      });

      const res = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(validBody)
        .expect(201);

      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
    });

    it('returns 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email: 'bad' })
        .expect(400);
    });

    it('returns 400 for invalid username characters', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ ...validBody, username: 'Invalid Username!' })
        .expect(400);
    });

    it('returns 409 when username is already taken', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({
        data: { data: [{ id: 'existing-id' }] },
      });

      return request(app.getHttpServer()).post('/v1/auth/register').send(validBody).expect(409);
    });
  });

  // ─── Auth: login ──────────────────────────────────────────────────────────

  describe('POST /v1/auth/login', () => {
    const mockStoredProfile = {
      id: 'p-uuid',
      username: 'testuser',
      is_verified: false,
      role: 'student',
    };

    it('returns 200 and tokens for password login', async () => {
      axiosPost.mockResolvedValueOnce({ data: { localId: 'firebase-uid' } });
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({
        data: { data: [mockStoredProfile] },
      });

      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ provider: 'password', email: 'test@example.com', password: 'pass123' })
        .expect(200);

      expect(res.body.data).toHaveProperty('access_token');
    });

    it('returns 400 for unknown provider', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ provider: 'twitter' })
        .expect(400);
    });

    it('returns 400 when password provider is missing email', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ provider: 'password', password: 'pass123' })
        .expect(400);
    });

    it('returns 401 for wrong password', async () => {
      axiosPost.mockRejectedValueOnce(new Error('invalid credentials'));

      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ provider: 'password', email: 'test@example.com', password: 'wrong' })
        .expect(401);
    });
  });

  // ─── Auth: forgot & reset password ───────────────────────────────────────

  describe('POST /v1/auth/forgot-password', () => {
    it('returns 200 regardless of whether email exists (anti-enumeration)', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/forgot-password')
        .send({ email: 'anyone@example.com' })
        .expect(200);
    });

    it('returns 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    it('returns 200 on valid reset', async () => {
      axiosPost.mockResolvedValueOnce({ data: {} });

      return request(app.getHttpServer())
        .post('/v1/auth/reset-password')
        .send({ oob_code: 'valid-code', new_password: 'NewPassword123' })
        .expect(200);
    });

    it('returns 400 for invalid/expired oob code', async () => {
      axiosPost.mockRejectedValueOnce(new Error('invalid code'));

      return request(app.getHttpServer())
        .post('/v1/auth/reset-password')
        .send({ oob_code: 'bad-code', new_password: 'NewPassword123' })
        .expect(400);
    });

    it('returns 400 when fields are missing', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/reset-password')
        .send({ oob_code: 'code' })
        .expect(400);
    });
  });

  // ─── Protected routes (no token) ─────────────────────────────────────────

  describe('GET /v1/profiles/me (protected)', () => {
    it('returns 401 without Authorization header', () => {
      return request(app.getHttpServer()).get('/v1/profiles/me').expect(401);
    });
  });

  describe('PATCH /v1/profiles/me (protected)', () => {
    it('returns 401 without token', () => {
      return request(app.getHttpServer())
        .patch('/v1/profiles/me')
        .send({ type: 'fcm_token', fcm_token: 'abc' })
        .expect(401);
    });
  });

  // ─── Public profile view ──────────────────────────────────────────────────

  describe('GET /v1/profiles/:username', () => {
    const publicProfile = {
      id: 'p-uuid',
      display_name: 'Rahim',
      username: 'rahim',
      avatar: null,
      bio: null,
      skills: [],
      availability_status: 'available',
      is_verified: false,
      avg_rating: 0,
      total_reviews: 0,
      created_at: '2024-01-01T00:00:00.000Z',
    };

    it('returns 200 with profile data for valid username', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: [publicProfile] } });

      const res = await request(app.getHttpServer()).get('/v1/profiles/rahim').expect(200);

      expect(res.body.data.username).toBe('rahim');
    });

    it('returns 404 for nonexistent username', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: [] } });

      return request(app.getHttpServer()).get('/v1/profiles/nobody').expect(404);
    });

    it('returns profile with empty gigs array for type=gigs', async () => {
      mockedDirectusApi.get = jest.fn().mockResolvedValueOnce({ data: { data: [publicProfile] } });

      const res = await request(app.getHttpServer())
        .get('/v1/profiles/rahim?type=gigs')
        .expect(200);

      expect(res.body.data).toHaveProperty('gigs');
      expect(Array.isArray(res.body.data.gigs)).toBe(true);
    });
  });
});
