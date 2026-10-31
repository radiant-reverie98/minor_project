import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import Login from '../pages/student/Login';
import FacultyLogin from '../pages/faculty/Login';
import LandingPage from '../pages/LandingPage';

import FacultyDashboardLayout from '../pages/faculty/FacultyDashboardLayout';
import DashboardLayout from '../pages/student/DashboardLayout';

function Router() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(() => {
    const savedType = localStorage.getItem('user_type');

    if (savedType !== 'faculty') {
      return null;
    }

    return {
      id: localStorage.getItem('user_id'),
      name: localStorage.getItem('user_name'),
    };
  });

  const handleFacultyLogin = (facultyData) => {
    setFaculty(facultyData);
    navigate('/faculty/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');

    setFaculty(null);
    navigate('/login/faculty');
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/student" element={<Login />} />
      <Route
        path="/login/faculty"
        element={<FacultyLogin onLoginSuccess={handleFacultyLogin} />}
      />

      {/* Faculty dashboard */}
      <Route
        path="/faculty/dashboard"
        element={
          faculty ? (
            <FacultyDashboardLayout
              faculty={faculty}
              onLogout={handleLogout}
            />
          ) : (
            <FacultyLogin onLoginSuccess={handleFacultyLogin} />
          )
        }
      />

      {/* Student dashboard — existing component */}
      <Route
        path="/student/dashboard"
        element={<DashboardLayout />}
      />
    </Routes>
  );
}

export default Router;