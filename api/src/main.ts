import { createApp } from './bootstrap-app';

async function bootstrap() {
  const { app, config } = await createApp();

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);
  console.log(`GigHub API running on http://localhost:${port}/v1`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
