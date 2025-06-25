"use client";

import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [detectedSlang, setDetectedSlang] = useState([]);
  const [loading, setLoading] = useState(false);

  // Voice input (simple)
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setInputText((prev) => prev + " " + voiceText);
    };

    recognition.start();
  };

  // Check slang via backend
  const handleCheckSlang = async () => {
    if (!inputText.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/check_slang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText }),
      });

      const data = await response.json();
      setDetectedSlang(data.slang);
    } catch (error) {
      console.error("Error calling API:", error);
    }

    setLoading(false);
  };

  const generateBotReply = () => {
    if (detectedSlang.length === 0) {
      return "Hey! I didn’t find any slang in your sentence.";
    }

    let reply = "Hey! I noticed you used some slang:\n\n";
    detectedSlang.forEach((slang) => {
      reply += `👉 "${slang.word}" means: ${slang.meaning}\n\n`;
    });
    reply += "Hope this helps! 🚀";

    return reply;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">Language Buddy</h1>

      <textarea
        className="p-4 border border-gray-600 rounded w-full max-w-lg mb-4 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        rows="4"
        placeholder="Type your sentence here or use voice input..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <div className="flex space-x-4">
        <button
          className={`px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleCheckSlang}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Slang"}
        </button>

        <button
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-all duration-300"
          onClick={handleVoiceInput}
        >
          Voice
        </button>
      </div>

      {!loading && inputText && (
        <div className="mt-6 p-6 bg-gray-900 text-white border border-gray-700 rounded max-w-lg transition-all duration-500">
          <h2 className="text-xl font-semibold mb-4">Language Buddy Bot:</h2>
          <pre className="whitespace-pre-wrap text-gray-300">{generateBotReply()}</pre>
        </div>
      )}
    </main>
  );
}
