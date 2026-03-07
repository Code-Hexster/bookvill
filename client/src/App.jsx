import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Library from "./pages/Library";
import BookDetails from "./pages/BookDetails";
import Reader from "./pages/Reader";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/library"
            element={
              <PrivateRoute>
                <Library />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/book/:bookId"
            element={<BookDetails />} // Keep this public or private? Most sites allow public viewing of details.
          />

          <Route
            path="/read/:bookId/:chapterNumber"
            element={
              <PrivateRoute>
                <Reader />
              </PrivateRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
