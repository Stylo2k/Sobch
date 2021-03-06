import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Profile from './components/users/Profile';
import EditProfile from './components/users/EditProfile';
import MyDevices from './components/devices/MyDevices';
import Stats from './components/devices/Stats';
import Alter from './components/devices/Alter';
import AddDevice from './components/devices/AddDevice';
import Logout from './components/auth/Logout';
import TeamSobch from './components/general/TeamSobch';
import Help from './components/general/Help';
import Corparate from './components/general/Company';
import NavHelp from './components/general/NavHelp';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "https://www.sobch.xyz/api";

function App() {
  
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<MyDevices />} />
        <Route path="/register/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/profile/" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit-profile/" element={<EditProfile />} />
        <Route path="/my-devices" element={<MyDevices />} />
        <Route path="/add-device" element={<AddDevice />} />
        <Route path="/stats/:deviceId" element={<Stats />} />
        <Route path="/alter/:deviceId" element={<Alter />} />
        <Route path="/team" element={<TeamSobch />} />
        <Route path="/help" element={<Help />} />
        <Route path="/corporate" element={<Corparate />} />
        <Route path="/navhelp" element={<NavHelp />} />
      </Routes>
    </Router>
  );
}

export {
  App,
  BACKEND_BASE_URL
};
