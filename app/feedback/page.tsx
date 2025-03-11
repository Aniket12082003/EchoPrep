"use client";

import { useEffect, useState } from "react";

type Answer = {
    question: string;
    answer: string;
    feedback: string;
};

export default function Feedback() {
    const [feedback, setFeedback] = useState<Answer[]>([]);

    useEffect(() => {
        // Fetch feedback from local storage
        const storedFeedback = JSON.parse(localStorage.getItem("answers") || "[]") as Answer[];
        setFeedback(storedFeedback); // ✅ Store as objects, not strings
        console.log("Retrieved Feedback from Local Storage:", storedFeedback);
    }, []);

    return (
        <div className="p-4 max-w-[1000px] flex flex-col justify-center items-center mx-auto">
            <h1 className="text-2xl font-bold mb-4">Feedback</h1>
            {feedback.length === 0 ? (
                <p>No feedback available.</p>
            ) : (
                feedback.map((item, index) => (
                    <div key={index} className="mb-4 max-w-[800px] w-[100%] flex flex-col gap-4 border rounded-4xl p-4">
                        <p><strong>Question:</strong> {item.question}</p>
                        <p><strong>Your Answer:</strong> {item.answer}</p>
                        <p><strong>Feedback:</strong> {item.feedback}</p>
                    </div>
                ))
            )}
        </div>
    );
}
