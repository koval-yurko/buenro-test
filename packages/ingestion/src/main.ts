import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the app - this will trigger onModuleInit
  const app = await NestFactory.create(AppModule);

  // Initialize the app (triggers lifecycle hooks)
  await app.init();

  console.log('Ingestion completed successfully');

  // Close the app after ingestion is done
  await app.close();

  // Exit with success code
  process.exit(0);
}

bootstrap();
