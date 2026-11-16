import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Clock, Plus, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const token = () => localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('accessToken');
const today = new Date().toISOString().slice(0, 10);

export default function EditTimeSlots() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('09:30');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API}/api/faculty/availability/me/slots?from_date=${selectedDate}&to_date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not load slots.');
      setSlots(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { load(); }, [load]);

  const addSlot = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`${API}/api/faculty/availability/me/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ slot_date: selectedDate, start_time: start, end_time: end }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not add slot.');
      setNotice('Availability slot added.'); await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const toggle = async (slot) => {
    setError(''); setNotice('');
    try {
      const response = await fetch(`${API}/api/faculty/availability/me/slots/${slot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ is_available: !slot.is_available }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not update slot.');
      await load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-slate-900">Manage Availability</h1>
        <p className="text-sm text-slate-500">Add consultation windows and block slots you cannot attend.</p></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><label className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4"/>Date
          <input type="date" min={today} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="ml-2 border rounded-lg px-3 py-2 text-sm"/></label>
          <button onClick={load} className="text-sm border rounded-lg px-3 py-2 flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Refresh</button></div>
        <form onSubmit={addSlot} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <label className="text-xs font-semibold text-slate-600">Start time<input type="time" value={start} onChange={e => setStart(e.target.value)} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"/></label>
          <label className="text-xs font-semibold text-slate-600">End time<input type="time" value={end} onChange={e => setEnd(e.target.value)} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"/></label>
          <button disabled={busy} className="px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4"/>{busy ? 'Adding…' : 'Add availability'}</button>
        </form>
        {error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">{error}</p>}
        {notice && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">{notice}</p>}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="font-bold text-slate-900">Slots for {selectedDate}</h2>
        {loading ? <p className="text-sm text-slate-500">Loading…</p> :
          slots.length === 0 ? <p className="text-sm text-slate-500">No slots added for this date.</p> :
          slots.map(slot => <div key={slot.id} className="flex flex-wrap items-center justify-between gap-3 border rounded-xl p-3">
            <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-blue-900"/>
              <div><p className="text-sm font-semibold">{slot.start_time} – {slot.end_time}</p>
                <p className="text-xs text-slate-500">{slot.is_booked ? 'Booked' : slot.is_available ? 'Available for students' : 'Blocked'}</p></div></div>
            <button disabled={slot.is_booked} onClick={() => toggle(slot)} className={`px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-40 ${slot.is_available ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
              {slot.is_booked ? 'Booked' : slot.is_available ? 'Block slot' : 'Make available'}
            </button>
          </div>)}
      </div>
    </div>
  );
}
