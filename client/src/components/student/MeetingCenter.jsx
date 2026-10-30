import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, Plus, Search } from 'lucide-react';

export default function MeetingCenter() {
  const [activeSubTab, setActiveSubTab] = useState('upcoming');

  const appointments = [
    {
      id: 1,
      faculty: 'Dr. Rajesh Sharma',
      department: 'Computer Science',
      subject: 'DBMS Query Optimization',
      date: 'Today, 3:30 PM',
      status: 'Confirmed',
      location: 'Block A, Room 204'
    },
    {
      id: 2,
      faculty: 'Prof. Anita Verma',
      department: 'Mathematics',
      subject: 'Linear Algebra Doubts',
      date: 'Tomorrow, 11:00 AM',
      status: 'Pending Approval',
      location: 'Block C, Faculty Cabin 12'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & New Booking Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meeting Center</h1>
          <p className="text-sm text-slate-500">Manage your faculty consultation bookings and schedule.</p>
        </div>
        <button className="px-4 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800 text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {['upcoming', 'completed', 'all-faculties'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-all ${
              activeSubTab === tab
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* List of Appointments */}
      <div className="grid gap-4">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">{appt.faculty}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      appt.status === 'Confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{appt.department}</p>
                <p className="text-sm text-slate-800 font-medium mt-1">Topic: {appt.subject}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{appt.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{appt.location}</span>
                </div>
              </div>

              <button className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-semibold transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}