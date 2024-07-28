// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwilioModule } from './twilio/twilio.module';

@Module({
  imports: [ConfigModule.forRoot(), TwilioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
