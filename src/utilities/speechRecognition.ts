import { requireOptionalNativeModule } from 'expo';

type SpeechResultEvent = {
  results?: { transcript?: string }[];
};

type SpeechErrorEvent = {
  error?: string;
};

type SpeechRecognitionNative = {
  isRecognitionAvailable: () => boolean;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (options: {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    iosTaskHint?: string;
  }) => void;
  stop: () => void;
  abort: () => void;
  addListener: (
    eventName: string,
    listener: (event: SpeechResultEvent & SpeechErrorEvent) => void,
  ) => { remove: () => void };
};

export const speechRecognition =
  requireOptionalNativeModule<SpeechRecognitionNative>(
    'ExpoSpeechRecognition',
  );

export function isSpeechRecognitionAvailable(): boolean {
  try {
    return Boolean(speechRecognition?.isRecognitionAvailable());
  } catch {
    return false;
  }
}
