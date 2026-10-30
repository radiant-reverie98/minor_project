import React, { useState } from 'react';
import { Send, Sparkles, FileText, Calendar, Clock, UserCheck } from 'lucide-react';

export default function AskBodhi() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bodhi',
      text: "Hello! I'm Bodhi, your academic assistant. Ask me about course notes, exam schedules, lab guidelines, or faculty consultation hours.",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input, time: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulated AI response
    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'bodhi',
        text: 'I checked the database and university documents for your query.',
        sources: ['DBMS_Unit_3_Normalization.pdf', 'CS_Department_TimeTable_2026.pdf'],
        facultySuggestion: {
          name: 'Dr. Rajesh Sharma',
          dept: 'Computer Science & Engineering',
          subject: 'Database Management Systems',
          availableSlot: 'Today, 3:30 PM - 4:15 PM'
        },
        time: 'Just now'
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Bodhi AI Assistant</h2>
            <p className="text-xs text-slate-500">Retrieves info from verified university documents</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
          Online
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-900 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>

              {/* Verified Sources Badge */}
              {msg.sources && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Verified Sources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200 font-mono"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty Appointment Suggestion Card */}
              {msg.facultySuggestion && (
                <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-slate-800">
                  <div className="flex items-center gap-2 text-blue-900 font-bold mb-1">
                    <UserCheck className="w-4 h-4" />
                    <span>Recommended Faculty Contact</span>
                  </div>
                  <p className="font-semibold text-slate-900">{msg.facultySuggestion.name}</p>
                  <p className="text-slate-500">{msg.facultySuggestion.dept}</p>
                  <div className="mt-2 flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{msg.facultySuggestion.availableSlot}</span>
                    </div>
                    <button className="px-3 py-1 bg-blue-900 text-white rounded-md text-xs font-semibold hover:bg-blue-800 transition-colors">
                      Book Slot
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Bodhi about course notes, timings, or faculty availability..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-900 text-white rounded-xl hover:bg-blue-800 font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}