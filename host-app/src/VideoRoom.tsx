import React, { useEffect, useState, useRef } from 'react';
import Video, { Room } from 'twilio-video';

const VideoRoom = ({ token }: { token: string }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    Video.connect(token, { name: 'my-room' }).then((room) => {
      setRoom(room);

      room.localParticipant.videoTracks.forEach((publication) => {
        const videoTrack = publication.track;
        if (localVideoRef.current) {
          videoTrack.attach(localVideoRef.current);
        }
      });

      return () => {
        room.disconnect();
      };
    });
  }, [token]);

  const handleMute = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach((publication) => {
        if (isMuted) {
          publication.track.enable();
        } else {
          publication.track.disable();
        }
      });
      setIsMuted(!isMuted);
    }
  };

  const handleCamera = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach((publication) => {
        if (isCameraOff) {
          publication.track.enable();
        } else {
          publication.track.disable();
        }
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay={true} />
      <button onClick={handleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
      <button onClick={handleCamera}>
        {isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
      </button>
    </div>
  );
};

export default VideoRoom;
