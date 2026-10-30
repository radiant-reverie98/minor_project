import React, { useState } from 'react';
import FacultyNavbar from '../../components/faculty/FacultyNavbar';
import FacultySidebar from '../../components/faculty/FacultySidebar';
import UpcomingMeetings from '../../components/faculty/UpcommingMeetings';
import EditTimeSlots from '../../components/faculty/EditTimeSlots';
import ResourceCenter from '../../components/faculty/ResourceCenter';

export default function FacultyDashboardLayout({ faculty, onLogout }) {
  const [activeTab, setActiveTab] = useState('upcoming-meetings');

  const renderScreen = () => {
    switch (activeTab) {
      case 'upcoming-meetings':
        return <UpcomingMeetings />;
      case 'edit-timeslots':
        return <EditTimeSlots />;
      case 'resource-center':
        return <ResourceCenter />;
      default:
        return <UpcomingMeetings />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <FacultyNavbar faculty={faculty} onLogout={onLogout} />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <FacultySidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}