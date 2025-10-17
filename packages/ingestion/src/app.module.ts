import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@buenro/common';
import { UrlDataLoader } from './loaders/url-data-loader.service';
import { FileDataLoader } from './loaders/file-data-loader.service';
import { Schema1Normalizer } from './normalizers/schema1-normalizer.service';
import { Schema2Normalizer } from './normalizers/schema2-normalizer.service';
import { IngestionOrchestratorService } from './services/ingestion-orchestrator.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // Loaders
    UrlDataLoader,
    FileDataLoader,
    // Normalizers
    Schema1Normalizer,
    Schema2Normalizer,
    // Orchestrator
    IngestionOrchestratorService,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly orchestrator: IngestionOrchestratorService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const source = this.configService.get<string>('INGESTION_SOURCE');
    if (!source) {
      throw new Error('INGESTION_SOURCE is not configured');
    }
    await this.orchestrator.ingestSource(source);
  }
}
