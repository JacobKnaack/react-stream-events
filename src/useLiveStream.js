import { useContext } from 'react';
import { LiveStreamContext } from "../context/livestream";

export default function useLiveStream() {
  return { isLive, stream, connectToStream, error } = useContext(LiveStreamContext);
}