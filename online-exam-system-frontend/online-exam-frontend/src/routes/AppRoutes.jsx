import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Home from '../pages/common/Home';
import About from '../pages/common/About';
import NotFound from '../pages/common/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import UserDashboard from '../pages/user/UserDashboard';
import Profile from '../pages/user/Profile';
import StartQuiz from '../pages/user/StartQuiz';
import QuizInstructions from '../pages/user/QuizInstructions';
import UserResult from '../pages/user/UserResult';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Register from '../pages/auth/Register';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/result" element={<UserResult />} />
          <Route path="/quiz/:quizId/instructions" element={<QuizInstructions />} />
          <Route path="/quiz/:quizId/start" element={<StartQuiz />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
