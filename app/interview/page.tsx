'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateResponse } from '@/lib/gemini';
import useSpeechRecognition from '@/app/hooks/useSpeechRecognition';

type Answer = {
    question: string;
    answer: string;
    feedback: string;
};

export default function Interview() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get('type');

    const [question, setQuestion] = useState<string>('');
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [questionCount, setQuestionCount] = useState<number>(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [hasStarted, setHasStarted] = useState<boolean>(false);

    // ---------- SPEECH RECOGNITION ----------
    const { isRecording, start, stop } = useSpeechRecognition({
        onResult: (transcript) => {
            setUserAnswer(transcript);
            handleAnswerSubmit(transcript);
        },
        onError: (error) => {
            console.error('Speech Recognition Error:', error);
        }
    });

    // ---------- SPEAK FUNCTION ----------
    let isSpeaking = false;

    const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
        return new Promise((resolve) => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length) {
                resolve(voices);
            } else {
                const interval = setInterval(() => {
                    voices = window.speechSynthesis.getVoices();
                    if (voices.length) {
                        clearInterval(interval);
                        resolve(voices);
                    }
                }, 100);
            }
        });
    };

    const speak = async (text: string) => {
        if (typeof window === 'undefined') return;

        const synth = window.speechSynthesis;

        // Wait for any ongoing speech to finish
        while (isSpeaking) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        isSpeaking = true;
        synth.cancel();

        const voices = await getVoices();
        const preferredVoice = voices.find((voice) =>
            voice.name.includes('Google UK English Female') ||
            voice.name.includes('Karen') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Victoria')
        );

        // Split text into chunks (max 200 characters to avoid cut-off)
        const chunks = text.match(/.{1,200}(\s|$)/g) || [text];

        for (const chunk of chunks) {
            await new Promise<void>((resolve) => {
                const utterance = new SpeechSynthesisUtterance(chunk);
                if (preferredVoice) utterance.voice = preferredVoice;

                utterance.onend = () => {
                    resolve();
                };

                utterance.onerror = () => {
                    console.error('Speech error occurred.');
                    resolve();
                };

                synth.speak(utterance);
            });
        }

        isSpeaking = false;
    };

    // ---------- START INTERVIEW ----------
    const handleStartInterview = async () => {
        if (!type) return;

        localStorage.removeItem('feedback');

        const initialPrompt = `You are an interviewer for a ${type} position but of no company. Introduce yourself as Samantha and ask the first interview question without asterisk or backticks.`;
        const firstQuestion = await generateResponse(initialPrompt);

        setQuestion(firstQuestion); // ✅ Display question first
        setHasStarted(true);

        await speak(firstQuestion); // ✅ Speak question after displaying it
    };

    // ---------- HANDLE ANSWER ----------
    const handleAnswerSubmit = async (answer: string) => {
        if (!answer) return;

        const prompt = `User answered: "${answer}". Provide one-line feedback followed by the next question on ${type}. Use 'Feedback:' and 'Question:' without asterisks or backticks. Do not ponder on a single topic too much, change the topic every 2 questions.`;

        const response = await generateResponse(prompt);

        const feedbackMatch = response.match(/Feedback:([\s\S]*?)Question:/);
        const questionMatch = response.match(/Question:([\s\S]*)/);

        const newFeedback = feedbackMatch ? feedbackMatch[1].trim() : 'No feedback available.';
        const newQuestion = questionMatch ? questionMatch[1].trim() : 'No more questions.';

        const updatedAnswers = [...answers, { question, answer, feedback: newFeedback }];
        setAnswers(updatedAnswers);
        localStorage.setItem('answers', JSON.stringify(updatedAnswers));

        setUserAnswer('');
        setQuestionCount((prev) => prev + 1);

        // ✅ End interview after 10 questions
        if (questionCount + 1 >= 10) {
            setFeedback(newFeedback);
            setQuestion('');

            await speak(newFeedback);
            await speak('That concludes the interview. Please review your feedback on the feedback page.');

            await fetch('/api/save-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: updatedAnswers })
            });

            router.push('/feedback');
            return;
        }

        // ✅ Display next question after feedback
        setFeedback('');
        setQuestion(newQuestion);
        await speak(newQuestion);
    };

    // ---------- MIC TOGGLE ----------
    const handleMic = () => {
        if (isRecording) {
            stop();
        } else {
            start();
        }
    };

    // ---------- RENDER ----------
    return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Interview</h1>

            {!hasStarted ? (
                <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                    onClick={handleStartInterview}
                >
                    Start Interview
                </button>
            ) : (
                <>
                    <p className="mb-2">{question}</p>

                    <div className="flex flex-col items-center">
                        <button
                            className={`bg-${isRecording ? 'red-500' : 'green-500'} hover:bg-${isRecording ? 'red-700' : 'green-700'} text-white font-bold py-2 px-4 rounded mb-2`}
                            onClick={handleMic}
                        >
                            🎙️ {isRecording ? 'Stop' : 'Start'}
                        </button>
                    </div>

                    {feedback && (
                        <div className="mt-4 text-center">
                            <p className="font-medium">{feedback}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
