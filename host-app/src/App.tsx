import React, { useState, useEffect, useRef } from 'react';
import { connect, Room, RemoteParticipant } from 'twilio-video';
import axios from 'axios';

const App: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [token, setToken] = useState<string>('');
  const [isCameraOn, setCameraOn] = useState(true);
  const [isMicOn, setMicOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const roomName = 'test-room1';

  useEffect(() => {
    const fetchToken = async () => {
      const response = await axios.get(
        `http://localhost:3000/twilio/generate-token?identity=host&roomName=${roomName}`
      );
      setToken(response.data);
    };
    fetchToken();
  }, []);

  const joinRoom = async () => {
    if (token) {
      const room = await connect(token, { video: true, audio: true });
      setRoom(room);
      room.localParticipant.tracks.forEach((publication) => {
        if (publication.track.kind === 'video') {
          publication.track.attach(localVideoRef.current!);
        }
      });
      room.on('participantConnected', handleParticipantConnected);
      room.participants.forEach(handleParticipantConnected);
    }
  };

  const leaveRoom = () => {
    room?.disconnect();
    setRoom(null);
  };

  const handleParticipantConnected = (participant: RemoteParticipant) => {
    participant.tracks.forEach((publication) => {
      if (publication.isSubscribed && publication?.track?.kind === 'video') {
        publication.track.attach(remoteVideoRef.current!);
      }
    });
    participant.on('trackSubscribed', (track) => {
      if (track.kind === 'video') {
        track.attach(remoteVideoRef.current!);
      }
    });
  };

  const toggleCamera = () => {
    room?.localParticipant.videoTracks.forEach((publication) => {
      if (isCameraOn) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
    });
    setCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    room?.localParticipant.audioTracks.forEach((publication) => {
      if (isMicOn) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
    });
    setMicOn(!isMicOn);
  };

  return (
    <div>
      <h1>Host App</h1>
      <div
        style={{
          position: 'relative',
          width: '640px',
          height: '360px',
          border: '1px solid black',
        }}
      >
        <video
          ref={remoteVideoRef}
          style={{ width: '100%', height: '100%' }}
          autoPlay={true}
        />
        <video
          ref={localVideoRef}
          style={{
            width: '150px',
            height: 'auto',
            position: 'absolute',
            bottom: '10px',
            right: '10px',
          }}
          autoPlay={true}
          muted
        />
      </div>
      <button onClick={joinRoom}>Join Room</button>
      <button onClick={leaveRoom}>Leave Room</button>
      <button onClick={toggleCamera}>
        {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
      </button>
      <button onClick={toggleMic}>
        {isMicOn ? 'Turn Off Mic' : 'Turn On Mic'}
      </button>
    </div>
  );
};

export default App;
