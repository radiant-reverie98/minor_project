import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  CalendarCheck, 
  Sparkles, 
  HelpCircle, 
  X, 
  CheckCircle2, 
  Building2,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  setErrorMessage('');

  if (!emailOrId.trim()) {
    setErrorMessage('Please enter your university email.');
    return;
  }

  if (!password) {
    setErrorMessage('Please enter your password.');
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(
      'http://127.0.0.1:8000/api/auth/student/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailOrId.trim(),
          password: password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || 'Login failed. Please check your credentials.'
      );
    }

    // Save the authentication token and student details.
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_type', data.user_type);
    localStorage.setItem('user_id', String(data.user_id));
    localStorage.setItem('user_name', data.name);

    setToastMessage({
      type: 'success',
      title: 'Login Successful',
      desc: 'Redirecting to your Student Dashboard...',
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    window.location.href = '/student/dashboard';
  } catch (error) {
    setErrorMessage(
      error.message || 'Unable to connect to the server. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    
    setResetSubmitted(true);
    setTimeout(() => {
      setResetSubmitted(false);
      setShowForgotPassword(false);
      setResetEmail('');
      setToastMessage({
        type: 'info',
        title: 'Reset Instructions Sent',
        desc: 'Please check your university email inbox for password recovery steps.'
      });
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between relative">
      
      {/* ==================== TOAST NOTIFICATION ==================== */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-white border border-slate-200 rounded-xl p-4 shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900">{toastMessage.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{toastMessage.desc}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="h-5 w-5 text-blue-200" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              FacultyConnect <span className="text-blue-900">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">University Student Portal</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-12 min-h-[580px]">
          
          {/* LEFT SIDEBAR: Brand & Student Benefits */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 via-blue-900 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-700/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold border border-blue-700/50">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Academic Gateway</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                  Welcome back to your academic assistant.
                </h2>
                <p className="text-blue-100/90 text-xs sm:text-sm mt-2 leading-relaxed">
                  Sign in with your official university credentials to get instant answers from course notes and schedule faculty consultations.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-4 pt-4 border-t border-blue-800/80">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-800/60 text-blue-200 border border-blue-700/40 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Instant Academic Answers</h4>
                    <p className="text-[11px] text-blue-200/80 mt-0.5">Verified answers directly from approved syllabus & lecture documents.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-800/60 text-blue-200 border border-blue-700/40 shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Direct Consultation Slots</h4>
                    <p className="text-[11px] text-blue-200/80 mt-0.5">Book 1-on-1 office hour appointments with professors seamlessly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-800/60 text-blue-200 border border-blue-700/40 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Course Repository Access</h4>
                    <p className="text-[11px] text-blue-200/80 mt-0.5">Find assigned faculty contacts and guidelines by subject expertise.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-blue-800/80 flex items-center gap-2 text-xs text-blue-200/80 relative z-10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secured by Single Sign-On (SSO) Protocol</span>
            </div>
          </div>

          {/* RIGHT SIDE: Pure Login Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
            
            <div className="max-w-md w-full mx-auto space-y-6">
              
              <div>
                <div className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
                  Student Sign In
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Access Your Student Portal
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Enter your university email or student registration ID to continue.
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Field 1: Student Email / Roll Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    University Email / Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={emailOrId}
                      onChange={(e) => setEmailOrId(e.target.value)}
                      placeholder="student.name@university.edu or STU12345"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs font-semibold text-blue-900 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-900 accent-blue-900 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">Remember this device for 30 days</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Student Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Student Support Box */}
              <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <HelpCircle className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Need Portal Access?</span> Student accounts are automatically provisioned by the campus IT registrar. Contact your campus administrator if you face login issues.
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* ==================== FORGOT PASSWORD MODAL ==================== */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-900">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Reset Student Password</h3>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Recovery Email Sent</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  We've sent reset instructions to <span className="font-semibold text-slate-800">{resetEmail}</span> if it matches an active student record.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered university email address. We will issue a secure password reset link verified against university records.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    University Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="student.name@university.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 rounded-lg shadow-sm"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} FacultyConnect AI • Official Student Authentication</span>
          <div className="flex gap-4 text-slate-500">
            <a href="#" className="hover:underline">University IT Support</a>
            <span>•</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}