import React from 'react';
import { Sparkles, Calendar, User, ChevronRight } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    {
      id: 'ask-bodhi',
      label: 'Ask Bodhi',
      icon: Sparkles,
      badge: 'AI Active',
      description: 'Get academic answers & slot options'
    },
    {
      id: 'meeting-center',
      label: 'Meeting Center',
      icon: Calendar,
      badge: null,
      description: 'Bookings & Faculty Schedule'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      badge: null,
      description: 'Academic details & settings'
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5">
        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Main Menu
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

      {/* Bodhi Helper Footer Card */}
      <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-blue-900 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bodhi Assistance</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Need quick syllabus info or lab schedule details? Try asking Bodhi.
        </p>
      </div>
    </aside>
  );
}