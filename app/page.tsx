'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Slide, ToastContainer, Zoom, toast } from 'react-toastify';

export default function Home() {
  const [interviewType, setInterviewType] = useState<string>('');
  const [checkBox, setCheckBox] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
  }, []);

  const handleGoToInterview = () => {
    if (interviewType && checkBox) {
      router.push(`/interview?type=${interviewType}`);
    } else if (!checkBox) {
      toast.error("Please agree to the terms and conditions.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      })
    }
    else{
      toast.error("Please enter an interview type.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      })  
    }
    return true
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Interview Prep</h1>
      <div className='flex gap-1 items-center mb-10'>
        <input
          type="text"
          placeholder="Enter interview type (e.g., Software Engineer)"
          className="border p-2 w-[400px] rounded"
          value={interviewType}
          onChange={(e) => setInterviewType(e.target.value)}
          />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-extrabold py-2 px-4 rounded hover:cursor-pointer" onClick={handleGoToInterview}>→
        </button>
      </div>
      <div className='flex flex-col gap-4 items-start w-[100%] max-w-[1000px] border rounded-4xl p-4'>
        <h1 className='text-2xl font-bold z-10 px-1 mx-5 bg-[#0a0a0a] -mt-8'>Rules</h1>
        <div>
          <ul className='list-decimal list-inside flex flex-col gap-2'>
            <li>The dummy interview will help you hone your confidence, speaking and critical thinking skills.</li>
            <li>Questions will be asked by AI. Pardon any misgeneration.</li>
            <li>Answer the questions as if you are in an interview.</li>
            <li>Respond only when the mic is turned on. Click on the mic again to submit the answer.</li>
            <li>The AI will provide feedback on your answer. You can urge to ask from topics for follow-up questions.</li>
            <li>Review your feedback on the feedback page.</li>
          </ul>
        </div>
        <div className='flex gap-2 mx-auto'>
        <input type="checkbox" name="checkbox" id="" onClick={() => setCheckBox(!checkBox)} />
        <label htmlFor="checkbox">I have read and accept the rules.</label>
        </div>
      </div>
      <ToastContainer position='top-right' theme='dark' autoClose={5000} transition={Slide} />
    </div>
  );
}