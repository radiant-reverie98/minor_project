import React, { useState } from 'react';
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function FacultyLogin({ onLoginSuccess, onSwitchToStudent }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simulate successful faculty login object
      const facultyData = {
        name: email.includes('rajesh') ? 'Dr. Rajesh Sharma' : 'Prof. Faculty Member',
        email: email,
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        cabin: 'Block A, Room 204'
      };
      if (onLoginSuccess) onLoginSuccess(facultyData);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-950 to-blue-900 text-white relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-blue-800/80 rounded-full text-[11px] font-semibold tracking-wide border border-blue-700">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Faculty Portal</span>
          </div>

          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold mb-3 border border-white/10">
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Faculty Sign In</h1>
          <p className="text-xs text-blue-200 mt-1">
            Manage your consultation slots, student appointments, and resource approvals.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Faculty Email / Staff ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh.sharma@mbm.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-900 focus:ring-blue-900 w-4 h-4"
                />
                <span>Remember device</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-900 font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In as Faculty</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Role Link */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Are you a student?{' '}
              <button
                onClick={onSwitchToStudent}
                className="text-blue-900 font-bold hover:underline"
              >
                Switch to Student Portal
              </button>
            </p>
          </div>
        </div>

        {/* Footer Support Notice */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-900 shrink-0" />
          <span>Need a faculty account or cabin mapping updated? Contact IT Cell.</span>
        </div>
      </div>

      {/* Forgot Password Modal Simulator */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reset Faculty Password</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your official faculty email address to receive password reset instructions from the university domain server.
            </p>
            <input
              type="email"
              placeholder="faculty@mbm.ac.in"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Reset instructions sent to your official email.');
                  setShowForgotModal(false);
                }}
                className="flex-1 py-2 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors"
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}