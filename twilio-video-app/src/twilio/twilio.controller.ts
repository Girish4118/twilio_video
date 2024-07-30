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
  @Post('start-recording')
  async startRecording(@Body('roomSid') roomSid: string) {
    return this.twilioService.startRecording(roomSid);
  }

  @Post('stop-recording')
  async stopRecording(@Body('roomSid') roomSid: string) {
    return this.twilioService.stopRecording(roomSid);
  }
  @Post('create-composition')
  async createComposition(@Body('roomSid') roomSid: string) {
    return this.twilioService.createComposition(roomSid);
  }
  @Get('get-composition-media-uri')
  async getCompositionMediaUri(
    @Query('compositionSid') compositionSid: string,
  ) {
    return this.twilioService.getCompositionMediaUri(compositionSid);
  }
}
