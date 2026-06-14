import { useAppContext } from "../AppContext";

export const useAudioRecorder = () => {
  const {
    startRecording,
    stopRecording,
    playAudio,
  } = useAppContext();

  return {
    handleStartRecording: startRecording,
    handleStopRecording: stopRecording,
    handlePlayAudio: playAudio,
  };
};
