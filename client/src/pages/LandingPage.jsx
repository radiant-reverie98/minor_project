import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  GraduationCap, 
  Building2, 
  MessageSquare, 
  FileText, 
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  User,
  Check,
  CalendarCheck
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'faculty'
  const [demoIndex, setDemoIndex] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Client-focused interactive demo scenarios
  const demoScenarios = [
    {
      question: "What is the procedure for mid-term re-evaluation if I was sick?",
      category: "University Policy",
      answer: "Submit Medical Form B along with doctor's verification to the Academic Block (Room 102) within 3 working days of the exam.",
      source: "University Academic Ordinance (Sec 4.2)",
      faculty: {
        name: "Prof. Rajesh Verma",
        title: "Dean of Academic Affairs",
        department: "Administration Block",
        slot: "Tomorrow at 11:00 AM"
      }
    },
    {
      question: "How do I normalize a relational table to 3NF for CS201?",
      category: "Academic Question",
      answer: "Third Normal Form requires the table to be in 2NF and have no transitive functional dependencies (X → Y where Y is non-prime).",
      source: "CS201 Lecture Notes - Module 3",
      faculty: {
        name: "Dr. Ananya Sharma",
        title: "Associate Professor",
        department: "Computer Science Dept",
        slot: "Today at 3:30 PM"
      }
    },
    {
      question: "When are the operating systems lab consultation hours?",
      category: "Course Schedule",
      answer: "Operating Systems lab consultation is held twice weekly in Computing Lab 3 on Tuesdays and Thursdays.",
      source: "CS302 Course Syllabus 2026",
      faculty: {
        name: "Dr. Vikramaditya Rao",
        title: "Assistant Professor",
        department: "Computer Science Dept",
        slot: "Thursday at 2:00 PM"
      }
    }
  ];

  const currentScenario = demoScenarios[demoIndex];

  const handleBookSlot = () => {
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      
      {/* ==================== 1. NAVBAR ==================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-900/10">
              <GraduationCap className="h-6 w-6 text-blue-200" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                FacultyConnect <span className="text-blue-700">AI</span>
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-900 transition-colors">How It Works</a>
            <a href="#for-users" className="hover:text-blue-900 transition-colors">For Students & Faculty</a>
            <a href="#faqs" className="hover:text-blue-900 transition-colors">FAQs</a>
          </nav>

          {/* Login & Primary CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-semibold text-slate-700 hover:text-blue-900 px-4 py-2 transition-colors">
              Log In
            </button>
            <a
              href="#interactive-demo"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-white shadow-sm transition-all"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col gap-3 font-semibold text-slate-700 text-sm">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#for-users" onClick={() => setMobileMenuOpen(false)}>For Students & Faculty</a>
              <a href="#faqs" onClick={() => setMobileMenuOpen(false)}>FAQs</a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button className="w-full py-2.5 text-center text-slate-700 font-semibold text-sm">
                Log In
              </button>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-lg bg-blue-900 text-white font-semibold text-sm"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ==================== 2. HERO SECTION ==================== */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-blue-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-900 text-xs sm:text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span>Smart Academic Guidance & Consultation Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Instant Academic Answers.{' '}
                <span className="text-blue-900">Seamless Faculty Meetings.</span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Empower your campus with an intelligent portal that resolves course and university queries instantly using official resources, while organizing faculty consultation hours without the back-and-forth emails.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#interactive-demo"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-lg font-semibold bg-blue-900 hover:bg-blue-800 text-white shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Try Demo Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#for-users"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-lg font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Features</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-extrabold text-blue-900">Instant</div>
                  <div className="text-xs font-medium text-slate-500">Query Resolution</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-blue-900">1-Click</div>
                  <div className="text-xs font-medium text-slate-500">Office Hour Booking</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-blue-900">100%</div>
                  <div className="text-xs font-medium text-slate-500">Official Resource Accuracy</div>
                </div>
              </div>
            </div>

            {/* Interactive Product Mock Preview */}
            <div className="lg:col-span-5" id="interactive-demo">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                
                {/* Mock Header */}
                <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span className="text-xs font-semibold tracking-wide uppercase">FacultyConnect Assistant</span>
                  </div>
                  <button 
                    onClick={() => setDemoIndex((prev) => (prev + 1) % demoScenarios.length)}
                    className="text-xs text-blue-200 hover:text-white bg-blue-800/60 px-2.5 py-1 rounded border border-blue-700/50 transition-all"
                  >
                    Switch Example #{((demoIndex + 1) % demoScenarios.length) + 1}
                  </button>
                </div>

                {/* Simulated Chat & Booking Interface */}
                <div className="p-5 space-y-4 bg-slate-50">
                  
                  {/* Student Question */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Student Asked ({currentScenario.category})
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 shadow-sm">
                      "{currentScenario.question}"
                    </div>
                  </div>

                  {/* AI Resolution */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Instant Verified Answer
                    </div>
                    <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {currentScenario.answer}

                      <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center gap-1.5 text-[11px] text-blue-900 font-semibold">
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        <span>Source: {currentScenario.source}</span>
                      </div>
                    </div>
                  </div>

                  {/* Faculty Direct Booking Option */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Need 1-on-1 Guidance?
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                        {currentScenario.faculty.name.split(' ')[1]?.[0] || 'F'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {currentScenario.faculty.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {currentScenario.faculty.title} • {currentScenario.faculty.department}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-blue-700" />
                        <span>{currentScenario.faculty.slot}</span>
                      </div>

                      <button
                        onClick={handleBookSlot}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                          bookingSuccess 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-blue-900 hover:bg-blue-800 text-white'
                        }`}
                      >
                        {bookingSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Confirmed!
                          </>
                        ) : (
                          <>
                            Book Consultation
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 3. SIMPLE 3-STEP PROCESS ==================== */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-widest">
              Simple & Fast Workflow
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How FacultyConnect AI Helps Students & Faculty
            </p>
            <p className="text-slate-600 text-sm sm:text-base">
              A hassle-free process designed to save time for students and reduce administrative workload for professors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ask Any Question</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Students submit queries regarding course topics, mid-term procedures, or office availability in plain everyday language.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Get Instant Verified Answers</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The AI searches approved department documents, lecture notes, and official university handbooks to provide instant, cited answers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Schedule 1-on-1 When Needed</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                If personal guidance is needed, students see open faculty consultation slots and book instantly without back-and-forth emails.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 4. DUAL PERSPECTIVE SECTION ==================== */}
      <section id="for-users" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2">
                Designed For Your Campus
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Built to Solve Real Campus Problems
              </p>
            </div>

            {/* Toggle Pills */}
            <div className="bg-white p-1 rounded-lg border border-slate-200 flex self-start md:self-auto">
              <button
                onClick={() => setActiveTab('student')}
                className={`px-5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'student'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                For Students
              </button>
              <button
                onClick={() => setActiveTab('faculty')}
                className={`px-5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'faculty'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                For Faculty
              </button>
            </div>
          </div>

          {/* Dynamic Content Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm grid lg:grid-cols-2 gap-10 items-center">
            
            {activeTab === 'student' ? (
              <>
                <div className="space-y-5">
                  <div className="inline-block px-3 py-1 rounded-md bg-blue-100 text-blue-900 text-xs font-bold">
                    STUDENT BENEFITS
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    No More Chasing Professors or Waiting Days for Email Replies
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    First-year students often struggle to find which faculty member to contact or end up visiting offices when professors are unavailable. FacultyConnect AI gives you clear, verified answers and direct consultation options.
                  </p>

                  <ul className="space-y-3 pt-2">
                    {[
                      "Instant answers to course syllabus and academic procedure questions",
                      "Find faculty members by their specific subject expertise",
                      "View open office hour slots and book appointments in 1 click",
                      "Access official department lecture notes and resources"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Student Dashboard</span>
                    <span className="text-xs font-semibold text-blue-900">Upcoming Consultations</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">DBMS Normalization Help</div>
                        <div className="text-[11px] text-slate-500">Dr. Ananya Sharma • CS Office 302</div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-semibold">
                        Today 3:30 PM
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Mid-Term Medical Form Clearance</div>
                        <div className="text-[11px] text-slate-500">Prof. Rajesh Verma • Admin Block</div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium">
                        Tomorrow 11:00 AM
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-5">
                  <div className="inline-block px-3 py-1 rounded-md bg-blue-100 text-blue-900 text-xs font-bold">
                    FACULTY BENEFITS
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Reclaim Your Time & Reduce Repetitive Email Queries
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Professors receive dozens of repetitive questions every semester about exam dates, consultation hours, and course policies. FacultyConnect AI handles routine questions automatically.
                  </p>

                  <ul className="space-y-3 pt-2">
                    {[
                      "Automated answering of routine course content & schedule questions",
                      "Easily set and adjust weekly available consultation time slots",
                      "Prevent unexpected student drop-ins during research hours",
                      "Keep clear digital records of all student consultation bookings"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Faculty Schedule Control</span>
                    <span className="text-xs font-semibold text-emerald-700">Active Consultation Hours</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="text-slate-500 font-medium">Monday Slots</div>
                      <div className="text-blue-900 font-bold">2:00 PM - 4:00 PM</div>
                      <div className="text-[10px] text-slate-500">2 Booked • 1 Available</div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="text-slate-500 font-medium">Thursday Slots</div>
                      <div className="text-blue-900 font-bold">10:00 AM - 12:00 PM</div>
                      <div className="text-[10px] text-slate-500">3 Booked • 0 Available</div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      </section>

      {/* ==================== 5. KEY FEATURES GRID ==================== */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything Your Institution Needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Approved Resource Answers</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Queries are answered exclusively using course notes, syllabus PDFs, and official university policies to ensure accuracy.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Faculty Expertise Directory</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Students can search professors by specific subjects, research domains, or department affiliations to reach the right contact.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center mb-4">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Guaranteed Available Slots</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Appointments are validated against actual open slots in real time to prevent scheduling conflicts or double bookings.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 6. FAQS ==================== */}
      <section id="faqs" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-widest">
              Got Questions?
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Is the information provided by the platform reliable?",
                a: "Yes. The AI searches approved department notes, course syllabus PDFs, and official university guidelines to provide answers with source citations."
              },
              {
                q: "How do faculty members set their consultation hours?",
                a: "Faculty members have a simple portal where they can define weekly office hours, block specific dates, and approve or reschedule appointment requests."
              },
              {
                q: "Can students book an appointment if the question is already resolved?",
                a: "If the AI answers the student's question completely using course materials, the student may not need a meeting. However, option for 1-on-1 consultation with faculty remains available if further guidance is needed."
              },
              {
                q: "Does this replace direct communication with professors?",
                a: "No. FacultyConnect AI acts as a bridge to resolve repetitive inquiries quickly while ensuring genuine student consultation needs are handled during organized office hours."
              }
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-900 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-900' : ''
                    }`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ==================== 7. CTA CALLOUT ==================== */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-900 rounded-2xl p-8 sm:p-12 text-center text-white space-y-6 shadow-lg">
            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Ready to Streamline Academic Support?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base">
                Join students and professors experiencing instant academic answers and organized consultation hours.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button className="w-full sm:w-auto px-7 py-3 rounded-lg font-bold bg-white text-blue-900 hover:bg-blue-50 transition-all text-sm">
                  Log In to Campus Portal
                </button>
                <button className="w-full sm:w-auto px-7 py-3 rounded-lg font-bold bg-blue-800 text-white border border-blue-700 hover:bg-blue-700 transition-all text-sm">
                  Contact University Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 8. FOOTER ==================== */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold text-xs">
                FC
              </div>
              <span className="text-base font-bold text-white">FacultyConnect AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent university platform for quick academic answers and organized student-faculty appointments.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#for-users" className="hover:text-white transition-colors">For Students</a></li>
              <li><a href="#for-users" className="hover:text-white transition-colors">For Faculty</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Student Login</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Faculty Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Admin Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Verified University System
              </li>
              <li className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Campus IT Integration
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} FacultyConnect AI. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}