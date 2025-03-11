import { useEffect, useRef, useState } from 'react';

type Props = {
    onResult: (result: string) => void;
    onError?: (error: string) => void;
};

const useSpeechRecognition = ({ onResult, onError }: Props) => {
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isStarting = useRef(false);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition is not supported in this browser.');
            return;
        }

        const rec = new SpeechRecognition();
        recognitionRef.current = rec;

        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        const resetTimeout = () => {
            if (timeoutId.current) clearTimeout(timeoutId.current);
            timeoutId.current = setTimeout(() => {
                console.log('Mic turned off due to inactivity.');
                stop(); // ✅ Stop the mic after 3 seconds of inactivity
            }, 5000);
        };

        rec.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsRecording(false);
            resetTimeout(); // ✅ Reset timeout after successful result
        };

        rec.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'aborted') return; // ✅ Ignore "aborted" errors
            setIsRecording(false);
            isStarting.current = false;
            if (onError) onError(event.error);
            if (timeoutId.current) clearTimeout(timeoutId.current);
        };

        rec.onend = () => {
            setIsRecording(false);
            isStarting.current = false;
            resetTimeout(); // ✅ Reset timeout when recognition ends
        };

        return () => {
            rec.stop();
            recognitionRef.current = null;
            if (timeoutId.current) clearTimeout(timeoutId.current);
        };
    }, [onResult, onError]);

    const start = () => {
        if (!recognitionRef.current || isRecording || isStarting.current) return;
        isStarting.current = true;
        try {
            recognitionRef.current.start();
            setIsRecording(true);
            console.log('Mic started');
            if (timeoutId.current) clearTimeout(timeoutId.current);
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            isStarting.current = false;
            setIsRecording(false);
        }
    };

    const stop = () => {
        if (!recognitionRef.current || !isRecording) return;
        recognitionRef.current.stop();
        setIsRecording(false);
        isStarting.current = false;
        if (timeoutId.current) clearTimeout(timeoutId.current);
        console.log('Mic stopped');
    };

    return { isRecording, start, stop };
};

export default useSpeechRecognition;
