import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock, User, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const token = () => localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('accessToken');

export default function MeetingCenter() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API}/api/appointments/mine`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not load appointments.');
      setAppointments(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    try {
      const response = await fetch(`${API}/api/appointments/${id}/cancel`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not cancel appointment.');
      await load();
    } catch (err) { setError(err.message); }
  };

  const visible = appointments.filter((a) => {
    if (filter === 'upcoming') return ['pending', 'confirmed'].includes(a.status);
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-900">Meeting Center</h1>
          <p className="text-sm text-slate-500">Your faculty consultation requests and appointments.</p></div>
        <button onClick={load} className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Refresh</button>
      </div>
      <div className="flex gap-5 border-b border-slate-200">
        {['upcoming', 'completed', 'all'].map((tab) => <button key={tab} onClick={() => setFilter(tab)}
          className={`pb-3 text-sm font-semibold capitalize border-b-2 ${filter === tab ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500'}`}>{tab}</button>)}
      </div>
      {error && <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading your appointments…</p> :
        visible.length === 0 ? <div className="p-8 text-center bg-white rounded-xl border text-sm text-slate-500">No appointments in this view yet. Ask Bodhi to find a faculty member and book a slot.</div> :
        <div className="grid gap-4">{visible.map((a) => (
          <article key={a.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex items-start gap-3"><div className="p-3 rounded-xl bg-blue-50 text-blue-900"><User/></div>
                <div><h3 className="font-bold text-slate-900">{a.faculty_name}</h3>
                  <p className="text-xs text-slate-500">{a.faculty_department || 'Faculty'}</p>
                  <p className="text-sm mt-2 font-medium">{a.topic}</p>
                  {a.description && <p className="text-sm text-slate-500 mt-1">{a.description}</p>}
                </div></div>
              <span className={`h-fit px-3 py-1 rounded-full text-xs font-semibold capitalize ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : a.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
            </div>
            <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-4 text-xs text-slate-600"><span className="flex items-center gap-1"><CalendarDays className="w-4 h-4"/>{a.slot_date}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/>{a.start_time}–{a.end_time}</span></div>
              <div className="flex gap-2">{a.meeting_link && <a href={a.meeting_link} target="_blank" rel="noreferrer" className="text-xs px-3 py-2 bg-blue-900 text-white rounded-lg">Join meeting</a>}
                {['pending', 'confirmed'].includes(a.status) && <button onClick={() => cancel(a.id)} className="text-xs px-3 py-2 border border-red-200 text-red-700 rounded-lg">Cancel request</button>}</div>
            </div>
          </article>
        ))}</div>}
    </div>
  );
}
