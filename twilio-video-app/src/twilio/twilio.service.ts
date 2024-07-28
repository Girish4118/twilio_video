import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const apiKeySid = this.configService.get<string>('TWILIO_API_KEY_SID');
    const apiKeySecret = this.configService.get<string>(
      'TWILIO_API_KEY_SECRET',
    );

    this.twilioClient = twilio(apiKeySid, apiKeySecret, { accountSid });
  }

  async createRoom(roomName: string) {
    try {
      const room = await this.twilioClient.video.rooms(roomName).fetch();
      return room;
    } catch (error) {
      if (error.status === 404) {
        const room = await this.twilioClient.video.rooms.create({
          uniqueName: roomName,
          type: 'group', // or 'peer-to-peer' based on your use case
        });
        return room;
      } else {
        throw error;
      }
    }
  }

  generateToken(identity: string, roomName: string) {
    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_API_KEY_SID'),
      this.configService.get<string>('TWILIO_API_KEY_SECRET'),
      {
        ttl: 3600, // Token time-to-live in seconds (1 hour)
        identity: identity,
      },
    );

    token.identity = identity;

    const videoGrant = new VideoGrant({ room: roomName });
    token.addGrant(videoGrant);

    return token.toJwt();
  }
}
