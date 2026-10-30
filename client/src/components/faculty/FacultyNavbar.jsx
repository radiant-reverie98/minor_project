import React from 'react';
import { Bot, Bell, Search, UserCheck, LogOut } from 'lucide-react';

export default function FacultyNavbar({ faculty, onLogout }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-blue-950">
            FacultyConnect <span className="text-blue-600">AI</span>
          </span>
          <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
            Faculty Portal & Resource Management
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student requests, uploaded files, or slots..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button 
          aria-label="Notifications"
          className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Faculty User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-800 leading-none">
              {faculty?.name || "Dr. Rajesh Sharma"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {faculty?.department || "CSE Dept."}
            </p>
          </div>
          
          <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
            {faculty?.name ? faculty.name.charAt(0) : <UserCheck className="w-4 h-4" />}
          </div>

          <button
            onClick={onLogout}
            title="Log Out"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}