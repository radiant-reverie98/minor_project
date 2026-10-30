import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import './App.css'
import Login from './pages/student/Login'
import DashboardLayout from './pages/student/DashboardLayout'
import FacultyLogin from './pages/faculty/Login'
import FacultyDashboardLayout from './pages/faculty/FacultyDashboardLayout'

function App() {
  

  return (
    <>
      {/* <LandingPage/> */}
      {/* <Login/> */}
      {/* <DashboardLayout/> */}
      {/* <FacultyLogin/> */}
      <FacultyDashboardLayout/>
    </>
  )
}

export default App
