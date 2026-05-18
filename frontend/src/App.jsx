import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import Dashboard from './pages/Dashboard';  
import Profile from './pages/Profile';     

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />    
          <Route path="/profile" element={<Profile />} />       
          <Route path="/create" element={<CreatePost />} />      
          <Route path="/edit/:id" element={<EditPost />} />      
          <Route path="/post/:slug" element={<PostDetail />} />  
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;