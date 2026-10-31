import {Routes, Route} from 'react-router-dom'
import Login from '../pages/student/Login'
import FacultyLogin from '../pages/faculty/Login'
import LandingPage from '../pages/LandingPage'
import FacultyDashboardLayout from '../pages/faculty/FacultyDashboardLayout'
import DashboardLayout from '../pages/student/DashboardLayout'

function Router(){
    return (
        
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/login/student" element={<Login/>}/>
                <Route path="/login/faculty" element={<FacultyLogin/>}/>

            </Routes>
        
    )
}

export default Router;