import React, { useState } from 'react';
import Navbar from '../../components/student/Navbar';
import Sidebar from '../../components/student/Sidebar';
import AskBodhi from '../../components/student/AskBodhi';
import MeetingCenter from '../../components/student/MeetingCenter';
import Profile from '../../components/student/Profile';

export default function DashboardLayout({ student, onLogout }) {
  // Active Sidebar Tab State
  const [activeTab, setActiveTab] = useState('ask-bodhi');

  // Render the selected screen based on sidebar selection
  const renderScreen = () => {
    switch (activeTab) {
      case 'ask-bodhi':
        return <AskBodhi />;
      case 'meeting-center':
        return <MeetingCenter />;
      case 'profile':
        return <Profile student={student} />;
      default:
        return <AskBodhi />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Navbar Component */}
      <Navbar student={student} onLogout={onLogout} />

      {/* Screen Layout: Sidebar + Dynamic Main Screen */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Sidebar Component */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Screen View Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}