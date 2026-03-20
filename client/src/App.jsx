import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Library from "./pages/Library";
import BookDetails from "./pages/BookDetails";
import Reader from "./pages/Reader";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";
import "./App.css";

// Pages that should NOT show the sidebar
const NO_SIDEBAR = ["/", "/login", "/register"];

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const hideSidebar = NO_SIDEBAR.includes(location.pathname) || location.pathname.startsWith("/read/");

  return (
    <div className={`app-shell ${hideSidebar ? "no-sidebar" : "with-sidebar"}`}>
      {!hideSidebar && user && <Sidebar />}
      <main className="app-main">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/library" element={<PrivateRoute><Library /></PrivateRoute>} />
          <Route path="/browse" element={<PrivateRoute><Browse /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/book/:bookId" element={<BookDetails />} />
          <Route path="/read/:bookId/:chapterNumber" element={<PrivateRoute><Reader /></PrivateRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
