/**
 * Vercel Serverless Function — NestJS API Handler
 *
 * Vercel build process:
 *   1. npm install (installs both dependencies & devDependencies)
 *   2. npm run build  →  nest build  →  outputs to dist/
 *   3. This handler imports from the compiled dist/ output
 *
 * tsconfig-paths/register is required at runtime because the compiled
 * dist/ files still contain @/ path aliases (tsc does not resolve them).
 */

require('tsconfig-paths/register');

const express = require('express');

const expressApp = express();
let initialized = false;

async function bootstrap() {
  const { createApp } = require('../dist/bootstrap-app');
  await createApp(expressApp);
  initialized = true;
}

/**
 * Vercel serverless function handler.
 * Uses a module-level cache so NestJS is only bootstrapped once.
 */
module.exports = async (req, res) => {
  if (!initialized) {
    await bootstrap();
  }
  expressApp(req, res);
};
