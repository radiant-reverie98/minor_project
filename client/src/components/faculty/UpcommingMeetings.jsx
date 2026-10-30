import React, { useState } from 'react';
import { Calendar, Clock, GraduationCap, FileText, CheckCircle, XCircle, Search } from 'lucide-react';

export default function UpcomingMeetings() {
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      studentName: 'Tejendra Singh',
      branch: 'Computer Science & Engineering',
      rollNo: '23CS101',
      date: 'Today',
      time: '03:30 PM - 04:00 PM',
      topic: 'DBMS Query Optimization & Normalization',
      description: 'Student has doubts regarding 3NF vs BCNF decomposition and needs assistance with indexed queries for the upcoming mid-sem project.',
      status: 'Confirmed'
    },
    {
      id: 2,
      studentName: 'Priya Sharma',
      branch: 'Information Technology',
      rollNo: '23IT045',
      date: 'Tomorrow',
      time: '11:00 AM - 11:30 AM',
      topic: 'B.Tech Major Project Guidance',
      description: 'Needs approval on project architecture diagram and database schema setup for automated attendance tracker.',
      status: 'Pending'
    },
    {
      id: 3,
      studentName: 'Aman Mathur',
      branch: 'Computer Science & Engineering',
      rollNo: '23CS012',
      date: 'Nov 02, 2026',
      time: '02:00 PM - 02:30 PM',
      topic: 'Mid-Sem Paper Re-evaluation',
      description: 'Wants to discuss question #4 evaluation from Database Systems paper.',
      status: 'Confirmed'
    }
  ]);

  const handleAction = (id, newStatus) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Upcoming Meetings</h1>
        <p className="text-sm text-slate-500">Review scheduled consultations and student appointment queries.</p>
      </div>

      {/* Meeting Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col gap-4"
          >
            {/* Header: Student Info & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-sm border border-blue-200">
                  {meeting.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{meeting.studentName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-900" />
                      {meeting.branch}
                    </span>
                    <span>•</span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {meeting.rollNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    meeting.status === 'Confirmed'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  {meeting.status}
                </span>
                <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-900" />
                  <span>{meeting.date}, {meeting.time}</span>
                </div>
              </div>
            </div>

            {/* Content: Topic & Description */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileText className="w-4 h-4 text-blue-900" />
                <span>Topic: {meeting.topic}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {meeting.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              {meeting.status === 'Pending' && (
                <button
                  onClick={() => handleAction(meeting.id, 'Confirmed')}
                  className="px-3.5 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Accept Request
                </button>
              )}
              <button
                onClick={() => handleAction(meeting.id, 'Cancelled')}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reschedule / Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}