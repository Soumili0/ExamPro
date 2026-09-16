import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth pages
import Login            from '../pages/auth/Login';
import Register         from '../pages/auth/Register';

// Common pages
import Home             from '../pages/common/Home';
import About            from '../pages/common/About';
import NotFound         from '../pages/common/NotFound';

// Guards
import ProtectedRoute   from '../components/ProtectedRoute';

// Student pages
import UserDashboard    from '../pages/user/UserDashboard';
import Profile          from '../pages/user/Profile';
import StartQuiz        from '../pages/user/StartQuiz';
import QuizInstructions from '../pages/user/QuizInstructions';
import UserResult       from '../pages/user/UserResult';
import MockInterview    from '../pages/user/MockInterview';
import InterviewResult  from '../pages/user/InterviewResult';

// Admin page
import AdminDashboard   from '../pages/admin/AdminDashboard';

// Teacher page
import TeacherDashboard from '../pages/admin/TeacherDashboard';

/** Redirect already-logged-in users away from /login and /register */
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  const role = (user.role || '').toLowerCase();
  if (role === 'admin')   return <Navigate to="/admin/dashboard"   replace />;
  if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Router>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"      element={<Home />} />
        <Route path="/about" element={<About />} />

        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* ── Student routes ── */}
        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route path="/user/dashboard"            element={<UserDashboard />} />
          <Route path="/user/profile"              element={<Profile />} />
          <Route path="/user/result"               element={<UserResult />} />
          <Route path="/user/interview"            element={<MockInterview />} />
          <Route path="/user/interview/result"     element={<InterviewResult />} />
          <Route path="/quiz/:quizId/instructions" element={<QuizInstructions />} />
          <Route path="/quiz/:quizId/start"        element={<StartQuiz />} />
        </Route>

        {/* ── Admin routes ── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ── Teacher routes ── */}
        <Route element={<ProtectedRoute roles={['teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}
