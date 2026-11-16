import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Clock, GraduationCap, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const token = () => localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('accessToken');

export default function UpcomingMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API}/api/appointments/faculty`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not load appointment requests.');
      setMeetings(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id, status) => {
    setBusyId(id); setError('');
    try {
      const response = await fetch(`${API}/api/appointments/${id}/faculty-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not update appointment.');
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-900">Appointment Requests</h1>
          <p className="text-sm text-slate-500">Review student requests and manage consultations.</p></div>
        <button onClick={load} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Refresh</button>
      </div>
      {error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading appointments…</p> :
        meetings.length === 0 ? <div className="bg-white border rounded-xl p-8 text-center text-sm text-slate-500">No appointment requests yet. Your available slots can be booked by students through Bodhi.</div> :
        <div className="grid gap-4">{meetings.map((meeting) => (
          <article key={meeting.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div><div className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-900"/><h3 className="font-bold text-slate-900">{meeting.student_name}</h3></div>
                <p className="text-xs text-slate-500 mt-1">{meeting.student_department || 'Student'}{meeting.student_roll_no ? ` · ${meeting.student_roll_no}` : ''}</p></div>
              <span className={`h-fit px-3 py-1 rounded-full text-xs font-semibold capitalize ${meeting.status === 'confirmed' ? 'bg-green-100 text-green-700' : meeting.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{meeting.status}</span>
            </div>
            <div><h4 className="font-semibold text-sm text-slate-800">{meeting.topic}</h4>
              {meeting.description && <p className="text-sm text-slate-500 mt-1">{meeting.description}</p>}</div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 border-t pt-3"><span className="flex items-center gap-1"><Calendar className="w-4 h-4"/>{meeting.slot_date}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4"/>{meeting.start_time}–{meeting.end_time}</span></div>
            {meeting.status === 'pending' && <div className="flex justify-end gap-2">
              <button disabled={busyId === meeting.id} onClick={() => update(meeting.id, 'rejected')} className="px-3 py-2 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50"><XCircle className="w-4 h-4"/>Reject</button>
              <button disabled={busyId === meeting.id} onClick={() => update(meeting.id, 'confirmed')} className="px-3 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50"><CheckCircle className="w-4 h-4"/>Accept request</button>
            </div>}
            {meeting.status === 'confirmed' && <div className="flex justify-end">
              <button disabled={busyId === meeting.id} onClick={() => update(meeting.id, 'completed')} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50">Mark completed</button>
            </div>}
          </article>
        ))}</div>}
    </div>
  );
}
