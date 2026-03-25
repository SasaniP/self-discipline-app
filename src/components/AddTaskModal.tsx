"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddTaskModal({ onClose, onAdded }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Default to 1 hour from now for the datetime-local input
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const handleSubmit = async () => {
    if (!title.trim()) return setError("You need a task title. Be specific.");
    if (!deadline) return setError("You MUST set a deadline. No deadline = no accountability.");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, deadline }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create task");
        return;
      }
      onAdded();
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg mx-4 border border-[#1E2A34] bg-[#0E1318] rounded-sm animate-[slideIn_0.2s_ease-out]"
        style={{ boxShadow: "0 0 60px rgba(255,45,45,0.1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E2A34]">
          <div>
            <h2 className="font-['Bebas_Neue'] text-2xl text-[#C8D8E4] tracking-widest">
              NEW COMMITMENT
            </h2>
            <p className="text-xs text-[#6B8699] mt-0.5">
              Once set, this deadline is law. No extensions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B8699] hover:text-[#C8D8E4] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-[#6B8699] tracking-widest mb-2">
              WHAT WILL YOU DO *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Be specific. Vague goals get vague results."
              className="w-full bg-[#141B22] border border-[#1E2A34] focus:border-[#FF2D2D] text-[#C8D8E4] placeholder:text-[#3D5060] px-4 py-3 text-sm outline-none transition-colors rounded-sm font-mono"
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[#6B8699] tracking-widest mb-2">
              DETAILS (OPTIONAL)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specific steps, resources, success criteria..."
              className="w-full bg-[#141B22] border border-[#1E2A34] focus:border-[#FF2D2D] text-[#C8D8E4] placeholder:text-[#3D5060] px-4 py-3 text-sm outline-none transition-colors rounded-sm font-mono resize-none h-20"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs text-[#6B8699] tracking-widest mb-2">
              DEADLINE — WHEN WILL THIS BE DONE? *
            </label>
            <input
              type="datetime-local"
              value={deadline}
              min={minDatetime}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#141B22] border border-[#1E2A34] focus:border-[#FF2D2D] text-[#C8D8E4] px-4 py-3 text-sm outline-none transition-colors rounded-sm font-mono [color-scheme:dark]"
            />
          </div>

          {/* Warning */}
          <div className="bg-[#141B22] border border-[#FF2D2D]/30 p-3 rounded-sm">
            <p className="text-xs text-[#FF2D2D]/80 leading-relaxed">
              ⚠ Missing this deadline will cost you <strong>−20 points</strong>.
              Abandoning will cost <strong>−30 points</strong>. Choose wisely.
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm border border-red-500/30 p-2 rounded-sm bg-red-500/10">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#FF2D2D] hover:bg-[#E02020] disabled:opacity-50 disabled:cursor-not-allowed text-white font-['Bebas_Neue'] text-xl tracking-widest py-3 transition-colors rounded-sm"
          >
            {loading ? "COMMITTING..." : "COMMIT TO THIS TASK"}
          </button>
        </div>
      </div>
    </div>
  );
}
