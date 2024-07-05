import { useState, createContext, useEffect } from 'react';
const socketUri = process.env.EXPO_PUBLIC_EVENT_SOCKET;
const streamUri = process.env.EXPO_PUBLIC_STREAM_URI;

export const LiveStreamContext = createContext({});

export function LiveStreamProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [stream, setStream] = useState({ uri: streamUri, isLive });
  const [error, setError] = useState(null);
  let handleLiveInterval = null;

  const connectToStream = () => {
    setSocket(new WebSocket(socketUri));
  }

  const handleStreamNotification = (notification) => {
    let data = JSON.parse(notification.data);
    switch (data.message) {
      case 'STREAM_START':
        setIsLive(true);
        break;
      case 'STREAM_END':
      default:
        setIsLive(false);
    }
  }

  const handleLive = () => {
    fetch(streamUri).then(response => {
      console.log('CONNECTED STREAM', response.status);
      if (response.status === 200) {
        setStream({ uri: streamUri, isLive });
        clearInterval(handleLiveInterval);
      }
    })
  }

  const endStream = () => {
    clearInterval(handleLiveInterval);
    setStream({ ...stream, isLive: false });
  }

  useEffect(() => {
    connectToStream();
  }, []);

  useEffect(() => {
    console.log('IS LIVE', isLive);
    if (isLive) {
      handleLiveInterval = setInterval(handleLive, 2000);
    } else {
      endStream();
    }
    return endStream;
  }, [isLive]);

  useEffect(() => {
    if (socket !== null) {
      console.log('STREAM CONNECTION ESTABLISHED');
      socket.onmessage = function (message) {
        try {
          console.log('Notification', JSON.parse(message.data));
          handleStreamNotification(message);
        } catch (e) {
          console.error('UNABLE TO PROCESS MESSAGE', e);
        }
      }
    } else {
      console.log('STREAM CONNECTION DISRUPTED');
      setError({ message: 'STAND_BY', code: 404 });
    }
  }, [socket]);

  return (
    <LiveStreamContext.Provider value={{ isLive, stream, error, connectToStream }}>
      {children}
    </LiveStreamContext.Provider>
  )
}