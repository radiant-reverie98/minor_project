import React from 'react';
import { User, Mail, GraduationCap, Building2, BookOpen, Shield } from 'lucide-react';

export default function Profile({ student }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Student Profile</h1>
        <p className="text-sm text-slate-500">Your registered university credentials and academic details.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-900 to-blue-800"></div>
        <div className="px-6 pb-6 relative">
          <div className="-mt-12 flex items-end justify-between mb-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 border-4 border-white shadow-md">
              <div className="w-full h-full bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center text-2xl font-bold">
                {student?.name ? student.name.charAt(0) : "S"}
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-xs font-bold">
              Verified Student
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">{student?.name || "Tejendra Singh"}</h2>
          <p className="text-sm text-slate-500">{student?.email || "student@mbm.ac.in"}</p>

          {/* Grid Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-blue-900" />
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Degree</p>
                <p className="text-sm font-semibold text-slate-800">B.E. Computer Science</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-900" />
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Institution</p>
                <p className="text-sm font-semibold text-slate-800">M.B.M. University, Jodhpur</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-900" />
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Roll Number</p>
                <p className="text-sm font-semibold text-slate-800">{student?.rollNo || "23CS101"}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-900" />
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Academic Status</p>
                <p className="text-sm font-semibold text-green-700">Active / Enrolled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}