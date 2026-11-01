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

              {msg.metadata?.facultySuggestion && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-blue-900 font-bold mb-1">
                    <UserCheck className="w-4 h-4" />
                    Recommended Faculty
                  </div>
                  <p className="font-semibold text-slate-900">{msg.metadata.facultySuggestion.name}</p>
                  <p className="text-slate-500">{msg.metadata.facultySuggestion.department}</p>
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