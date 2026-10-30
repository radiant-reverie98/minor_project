import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Check, Lock, RefreshCw } from 'lucide-react';

export default function EditTimeSlots() {
  const [selectedDate, setSelectedDate] = useState('2026-10-30');
  const [slots, setSlots] = useState([
    { id: 's1', time: '09:00 AM - 09:45 AM', isAvailable: true },
    { id: 's2', time: '10:00 AM - 10:45 AM', isAvailable: true },
    { id: 's3', time: '11:15 AM - 12:00 PM', isAvailable: false, reason: 'Department Meeting' },
    { id: 's4', time: '02:00 PM - 02:45 PM', isAvailable: true },
    { id: 's5', time: '03:00 PM - 03:45 PM', isAvailable: true },
    { id: 's6', time: '04:00 PM - 04:45 PM', isAvailable: true },
  ]);

  // Mark single slot as unavailable or available
  const toggleSlot = (id) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, isAvailable: !slot.isAvailable } : slot
      )
    );
  };

  // Mark whole day as unavailable
  const markEntireDayUnavailable = () => {
    setSlots((prev) => prev.map((s) => ({ ...s, isAvailable: false })));
  };

  // Reset day
  const resetDaySlots = () => {
    setSlots((prev) => prev.map((s) => ({ ...s, isAvailable: true })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Edit Time Slots</h1>
        <p className="text-sm text-slate-500">Manage your consultation availability or mark specific dates as unavailable.</p>
      </div>

      {/* Date Picker & Quick Actions Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-900" />
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markEntireDayUnavailable}
            className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Mark Entire Day Unavailable
          </button>
          <button
            onClick={resetDaySlots}
            className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Available Consultation Slots ({selectedDate})
          </h3>
          <span className="text-xs text-slate-500">Click any card to toggle availability</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => toggleSlot(slot.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                slot.isAvailable
                  ? 'bg-blue-50/50 border-blue-200 hover:border-blue-400 text-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className={`w-4 h-4 ${slot.isAvailable ? 'text-blue-900' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-bold">{slot.time}</p>
                  <p className="text-[11px] font-medium mt-0.5">
                    {slot.isAvailable ? 'Available' : slot.reason || 'Blocked'}
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  slot.isAvailable ? 'bg-blue-900 text-white' : 'bg-slate-300 text-slate-600'
                }`}
              >
                {slot.isAvailable ? <Check className="w-3 h-3" /> : '×'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}