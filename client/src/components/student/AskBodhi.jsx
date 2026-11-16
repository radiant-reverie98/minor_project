import React, { useCallback, useEffect, useState } from 'react';
import { Send, Sparkles, FileText, UserCheck, Loader2, Plus, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function getToken() {
  // Use the key your login page currently writes. The fallbacks support common setups.
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken')
  );
}

function formatTime(value) {
  if (!value) return 'Just now';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AskBodhi() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [bookingFaculty, setBookingFaculty] = useState(null);
  const [bookingSlots, setBookingSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingTopic, setBookingTopic] = useState('Academic guidance');
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const request = useCallback(async (path, options = {}) => {
    const token = getToken();
    if (!token) throw new Error('You are not logged in. Please sign in again.');

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || `Request failed (${response.status})`);
    }
    return data;
  }, []);

  const loadMessages = useCallback(async (id) => {
    const data = await request(`/api/student/chats/${id}/messages`);
    setMessages(data.map((item) => ({
      id: item.id,
      sender: item.role === 'user' ? 'user' : 'bodhi',
      text: item.content,
      time: formatTime(item.created_at),
      metadata: item.message_metadata,
    })));
  }, [request]);

  const createConversation = useCallback(async () => {
    const chat = await request('/api/student/chats/', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Conversation' }),
    });
    setChatId(chat.id);
    setMessages([{
      id: 'welcome',
      sender: 'bodhi',
      text: "Hello! I'm Bodhi, your academic assistant. Ask me about university policies, course resources, exam schedules, or faculty consultations.",
      time: 'Just now',
    }]);
  }, [request]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setInitializing(true);
        // Start a fresh conversation for this component session.
        const chat = await request('/api/student/chats/', {
          method: 'POST',
          body: JSON.stringify({ title: 'New Conversation' }),
        });
        if (!active) return;
        setChatId(chat.id);
        setMessages([{
          id: 'welcome',
          sender: 'bodhi',
          text: "Hello! I'm Bodhi, your academic assistant. Ask me about university policies, course resources, exam schedules, or faculty consultations.",
          time: 'Just now',
        }]);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => { active = false; };
  }, [request]);

  const handleSend = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading || !chatId) return;

    setError('');
    setInput('');
    setLoading(true);

    const temporaryId = `temp-${Date.now()}`;
    setMessages((previous) => [
      ...previous,
      { id: temporaryId, sender: 'user', text: content, time: 'Just now' },
    ]);

    try {
      const result = await request(`/api/student/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      setMessages((previous) => [
        ...previous.filter((message) => message.id !== temporaryId),
        {
          id: result.user_message.id,
          sender: 'user',
          text: result.user_message.content,
          time: formatTime(result.user_message.created_at),
        },
        {
          id: result.assistant_message.id,
          sender: 'bodhi',
          text: result.assistant_message.content,
          time: formatTime(result.assistant_message.created_at),
          metadata: result.assistant_message.message_metadata,
        },
      ]);
    } catch (err) {
      setMessages((previous) => previous.filter((message) => message.id !== temporaryId));
      setInput(content);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openBooking = async (faculty, topic) => {
    setBookingFaculty(faculty);
    setBookingSlots([]);
    setSelectedSlot('');
    setBookingTopic(topic || 'Academic guidance');
    setBookingError('');
    try {
      const slots = await request(`/api/faculty/${faculty.id}/slots`);
      setBookingSlots(slots);
      if (!slots.length) setBookingError('No available slots in the next 30 days.');
    } catch (err) {
      setBookingError(err.message);
    }
  };

  const submitBooking = async () => {
    if (!bookingFaculty || !selectedSlot) return;
    setBookingBusy(true);
    setBookingError('');
    try {
      await request('/api/appointments/', {
        method: 'POST',
        body: JSON.stringify({
          faculty_id: bookingFaculty.id,
          slot_id: Number(selectedSlot),
          chat_id: chatId,
          topic: bookingTopic.trim() || 'Academic guidance',
        }),
      });
      setBookingFaculty(null);
      setBookingSlots([]);
      setSelectedSlot('');
      setMessages((previous) => [...previous, {
        id: `booking-${Date.now()}`, sender: 'bodhi',
        text: `Your appointment request with ${bookingFaculty.name} has been sent. You can track its status in Meeting Center.`,
        time: 'Just now',
      }]);
    } catch (err) {
      setBookingError(err.message);
      try {
        const fresh = await request(`/api/faculty/${bookingFaculty.id}/slots`);
        setBookingSlots(fresh);
      } catch { /* keep the original booking error */ }
    } finally {
      setBookingBusy(false);
    }
  };

  const handleNewChat = async () => {
    if (loading) return;
    setError('');
    setInitializing(true);
    try {
      await createConversation();
    } catch (err) {
      setError(err.message);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Bodhi AI Assistant</h2>
            <p className="text-xs text-slate-500">Answers grounded in university knowledge</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
            {loading ? 'Thinking...' : 'Ready'}
          </span>
          <button
            type="button"
            onClick={handleNewChat}
            disabled={loading || initializing}
            title="Start a new conversation"
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-2xl p-4 rounded-2xl text-sm ${
              msg.sender === 'user'
                ? 'bg-blue-900 text-white rounded-br-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {msg.metadata?.sources?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.metadata.sources.map((source, index) => (
                      <span key={`${source}-${index}`} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {msg.metadata?.faculty_booking?.id && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <p className="text-xs font-semibold text-slate-800">
                    Appointment with {msg.metadata.faculty_booking.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Choose an available time and send your appointment request.
                  </p>
                  <button
                    type="button"
                    onClick={() => openBooking(msg.metadata.faculty_booking, 'Academic guidance')}
                    className="mt-2 px-3 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800"
                  >
                    Choose a slot
                  </button>
                </div>
              )}

              {(msg.metadata?.faculty_recommendations?.length > 0 || msg.metadata?.facultySuggestion) && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <UserCheck className="w-4 h-4" /> Recommended Faculty
                  </div>
                  {(msg.metadata.faculty_recommendations || [msg.metadata.facultySuggestion]).map((person) => (
                    <div key={person.id || person.name} className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{person.name}</p>
                          <p className="text-slate-500">{person.designation || person.department || 'Faculty'}</p>
                          {person.expertise && <p className="text-slate-600 mt-1">{person.expertise}</p>}
                        </div>
                        {person.id && <button type="button" onClick={() => openBooking(person, 'Academic guidance')}
                          className="shrink-0 px-3 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800">
                          View slots
                        </button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Bodhi is searching the university knowledge base...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {bookingFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div><h3 className="font-bold text-slate-900">Book a consultation</h3>
                <p className="text-sm text-slate-500">With {bookingFaculty.name}</p></div>
              <button type="button" onClick={() => setBookingFaculty(null)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>
            <label className="block text-xs font-semibold text-slate-600">Discussion topic
              <input value={bookingTopic} onChange={(e) => setBookingTopic(e.target.value)} maxLength={200}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </label>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">Available slots (next 30 days)</p>
              {bookingSlots.map((slot) => (
                <label key={slot.id} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${String(slot.id) === selectedSlot ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}>
                  <span className="text-sm">{new Date(`${slot.slot_date}T00:00:00`).toLocaleDateString()} · {slot.start_time}–{slot.end_time}</span>
                  <input type="radio" name="booking-slot" value={slot.id} checked={String(slot.id) === selectedSlot}
                    onChange={() => setSelectedSlot(String(slot.id))} />
                </label>
              ))}
              {!bookingSlots.length && !bookingError && <p className="text-sm text-slate-500">Loading available slots…</p>}
            </div>
            {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
            <p className="text-xs text-slate-500">Your request will remain pending until the faculty member responds.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setBookingFaculty(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="button" disabled={!selectedSlot || bookingBusy} onClick={submitBooking}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                {bookingBusy ? 'Sending…' : 'Request appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={loading || initializing || !chatId}
          placeholder="Ask Bodhi about university policies, resources, or faculty..."
          className="flex-1 min-w-0 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || initializing || !chatId || !input.trim()}
          className="px-5 py-2.5 bg-blue-900 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}