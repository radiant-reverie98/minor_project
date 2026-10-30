import React from 'react';
import { Calendar, Clock, Database, ChevronRight, FileText } from 'lucide-react';

export default function FacultySidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    {
      id: 'upcoming-meetings',
      label: 'Upcoming Meetings',
      icon: Calendar,
      badge: '3 New',
      description: 'Student bookings & query details'
    },
    {
      id: 'edit-timeslots',
      label: 'Edit Time Slots',
      icon: Clock,
      badge: null,
      description: 'Manage & block consultation hours'
    },
    {
      id: 'resource-center',
      label: 'Resource Center',
      icon: Database,
      badge: 'RAG Fed',
      description: 'Manage notes, syllabus & PDF context'
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-1.5">
        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Faculty Controls
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                isActive
                  ? 'bg-blue-900 text-white shadow-sm font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-none flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-blue-700 text-blue-100'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] mt-1 ${
                      isActive ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'text-blue-200 translate-x-0.5' : 'text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* RAG Knowledge Status Footer */}
      <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-blue-900 font-bold mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span>RAG Pipeline Status</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          4 active course documents indexed. AI uses this data to answer student questions.
        </p>
      </div>
    </aside>
  );
}