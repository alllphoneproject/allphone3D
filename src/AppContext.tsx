import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { Language, translations } from "./i18n";

type DeviceState = "off" | "booting" | "idle" | "recording" | "playing";

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  deviceState: DeviceState;
  setDeviceState: React.Dispatch<React.SetStateAction<DeviceState>>;
  recordingTime: number;
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>;
  audioUrl: string | null;
  setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>;
  simulationMode: boolean;
  setSimulationMode: (mode: boolean) => void;
  activeHotspot: string | null;
  setActiveHotspot: (hotspot: string | null) => void;
  tutorialMode: boolean;
  setTutorialMode: (tutorialMode: boolean) => void;
  setPower: (powered: boolean) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playAudio: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("he");
  const [deviceState, setDeviceState] = useState<DeviceState>("off");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [tutorialMode, setTutorialMode] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const bootTimerRef = useRef<number | null>(null);
  const simulationTimerRef = useRef<number | null>(null);

  const t = translations[language];

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime((previous) => previous + 1);
    }, 1000);
  }, [stopTimer]);

  const stopMedia = useCallback(() => {
    stopTimer();

    if (simulationTimerRef.current !== null) {
      window.clearTimeout(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, [stopTimer]);

  const setPower = useCallback((powered: boolean) => {
    if (bootTimerRef.current !== null) {
      window.clearTimeout(bootTimerRef.current);
      bootTimerRef.current = null;
    }

    if (!powered) {
      stopMedia();
      setRecordingTime(0);
      setDeviceState("off");
      return;
    }

    setRecordingTime(0);
    setDeviceState("booting");
    bootTimerRef.current = window.setTimeout(() => {
      setDeviceState("idle");
      bootTimerRef.current = null;
    }, 850);
  }, [stopMedia]);

  const startRecording = useCallback(async () => {
    if (deviceState !== "idle") return;

    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioUrl((previousUrl) => {
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            return URL.createObjectURL(audioBlob);
          });
        }
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      };

      mediaRecorder.start();
      setSimulationMode(false);
    } catch (error) {
      console.warn("Microphone access denied. Simulating recording.", error);
      setSimulationMode(true);
    }

    setDeviceState("recording");
    startTimer();
  }, [deviceState, startTimer]);

  const stopRecording = useCallback(() => {
    if (deviceState === "recording") {
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
      stopTimer();
      setDeviceState("idle");
      return;
    }

    if (deviceState === "playing") {
      stopMedia();
      setDeviceState("idle");
    }
  }, [deviceState, stopMedia, stopTimer]);

  const playAudio = useCallback(() => {
    if (deviceState !== "idle") return;

    if (simulationMode) {
      setDeviceState("playing");
      startTimer();
      simulationTimerRef.current = window.setTimeout(() => {
        stopTimer();
        setDeviceState("idle");
        simulationTimerRef.current = null;
      }, 5000);
      return;
    }

    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => {
      stopTimer();
      setDeviceState("idle");
      audioRef.current = null;
    };
    void audio.play();
    setDeviceState("playing");
    startTimer();
  }, [audioUrl, deviceState, simulationMode, startTimer, stopTimer]);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (bootTimerRef.current !== null) window.clearTimeout(bootTimerRef.current);
      stopMedia();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [stopMedia]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        deviceState,
        setDeviceState,
        recordingTime,
        setRecordingTime,
        audioUrl,
        setAudioUrl,
        simulationMode,
        setSimulationMode,
        activeHotspot,
        setActiveHotspot,
        tutorialMode,
        setTutorialMode,
        setPower,
        startRecording,
        stopRecording,
        playAudio,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
