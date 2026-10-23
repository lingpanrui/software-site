import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config();

import { createApp } from './create-app';

async function bootstrap(): Promise<void> {
  const app = await createApp({ serveFrontend: true });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
