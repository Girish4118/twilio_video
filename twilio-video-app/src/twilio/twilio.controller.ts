import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Get('generate-token')
  generateToken(
    @Query('identity') identity: string,
    @Query('roomName') roomName: string,
  ): string {
    return this.twilioService.generateToken(identity, roomName);
  }

  @Get('create-room')
  async createRoom(@Query('roomName') roomName: string) {
    const room = await this.twilioService.createRoom(roomName);
    return room;
  }
}
