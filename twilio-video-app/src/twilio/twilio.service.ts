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

  async startRecording(roomSid: string) {
    return this.twilioClient.video.v1
      .rooms(roomSid)
      .recordingRules.update({ rules: [{ type: 'include', all: true }] })
      .then((recording_rules) => console.log(recording_rules.roomSid));
  }

  async stopRecording(roomSid: string) {
    this.twilioClient.video.v1
      .rooms(roomSid)
      .recordingRules.update({ rules: [{ type: 'exclude', all: true }] })
      .then((recording_rules) => console.log(recording_rules.roomSid));
  }
  // async createComposition(roomSid: string) {
  //   return this.twilioClient.video.v1.compositions
  //     .create({
  //       roomSid: roomSid,
  //       videoLayout: {
  //         grid: {
  //           video_sources: ['*'],
  //         },
  //       },
  //       statusCallback: 'http://localhost:3000/twilio/composition-callback',
  //       format: 'mp4',
  //     })
  //     .then((composition) => composition.sid);
  // }

  async createComposition(roomName: string): Promise<string> {
    const rooms = await this.twilioClient.video.v1.rooms.list({
      uniqueName: roomName,
      limit: 1,
    });
    // if (rooms.length === 0) {
    //   throw new Error('Room not found');
    // }
    // const roomSid = rooms[0].sid;
    if (rooms.length > 0) {
      console.log('>>>>>>>>>>>>>', rooms[0]);
    } else {
      console.log('no rooms found');
    }

    const roomSid = 'RM75567128576ffca8cdb6c92d0a177eac';

    const composition = await this.twilioClient.video.v1.compositions.create({
      roomSid: roomSid,
      audioSources: ['*'],
      videoLayout: {
        grid: {
          video_sources: ['*'],
        },
      },
      statusCallback: 'http://localhost:3000/twilio/composition-callback',
      format: 'mp4',
    });

    return composition.sid;
  }

  async getCompositionMediaUri(compositionSid: string): Promise<string> {
    const composition = await this.twilioClient.video.v1
      .compositions(compositionSid)
      .fetch();
    const mediaUri = composition.links.media;
    // Append basic auth credentials to the media URL
    const auth = Buffer.from(
      `${this.configService.get<string>('TWILIO_ACCOUNT_SID')}:${this.configService.get<string>('TWILIO_AUTH_TOKEN')}`,
    ).toString('base64');
    return `${mediaUri}?Auth=${auth}`;
  }
}
