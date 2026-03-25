"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "Every second you waste, someone else is getting ahead.",
  "Discipline is doing it when you don't feel like it.",
  "You said you'd do this. Was that a lie?",
  "Discomfort is temporary. Regret lasts forever.",
  "The task is still there. It won't do itself.",
  "Stop scrolling. Start working.",
  "Your future self will either thank you or curse you.",
  "One more minute wasted is one you can't get back.",
  "Motivation is for amateurs. You run on discipline.",
  "You don't need to feel ready. Just start.",
  "Amateur hour is over. Get to work.",
  "Nobody is coming to save you. Do it yourself.",
  "Consistency beats talent every single time.",
  "The pain of discipline is lighter than the pain of regret.",
];

export default function GuiltTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-y border-[#1E2A34] bg-[#080B0F] py-2 px-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <span className="text-[#FF2D2D] text-[10px] font-bold tracking-[0.3em] shrink-0">
          REMINDER
        </span>
        <div className="w-px h-3 bg-[#1E2A34]" />
        <p
          className={`text-[#6B8699] text-xs italic transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {MESSAGES[index]}
        </p>
      </div>
    </div>
  );
}
