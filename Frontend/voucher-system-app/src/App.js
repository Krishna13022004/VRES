import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";

import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
import ProjectDashboardPage from "./components/ProjectDashboardPage";
import UserRegistrationPage from "./components/UserRegistrationPage";
import CreateProjectPage from "./components/CreateProjectPage";
import CreateVoucherPage from "./components/CreateVoucherPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import InitiateProjectPage from "./components/InitiateProjectPage";
import BeneficiaryListPage from "./components/UploadBeneficiaryListPage";
import ApproveBeneficiaryListPage from "./components/ApproveBeneficiaryListPage";
import UploadBeneficiaryListPage from "./components/UploadBeneficiaryListPage";
import SelectProjectPage from "./components/SelectProjectPage";
import RegisterCoordinatorPage from "./components/RegisterCoordinatorPage";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/main.css";

// --- NEW: Centralized navigation configuration ---
const navConfig = {
  ADMIN: {
    nav: ["initiate-project", "new-coordinator"],
    defaultRoute: "/new-coordinator",
  },
  "PROJECT COORDINATOR": {
    nav: ["user-registration", "create-project"],
    defaultRoute: "/user-registration",
  },
  ISSUER: {
    nav: ["create-voucher"],
    defaultRoute: "/create-voucher",
  },
  OBSERVER: {
    nav: ["dashboard"],
    defaultRoute: "/dashboard",
  },
  CHECKER: {
    nav: ["approve-beneficiary-list"],
    defaultRoute: "/approve-beneficiary-list",
  },
  MAKER: {
    nav: [
      "beneficiary-list",
      "approve-beneficiary-list",
      "upload-beneficiary-list",
    ],
    defaultRoute: "/upload-beneficiary-list",
  },
};
// --- END NEW CONFIG ---

function App() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api-skillmanagement.infoshsresystems.io/vres";
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Try to get user data from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);

      // Also check for a selected project to restore the full state
      const storedProjectId = localStorage.getItem("selectedProjectId");
      if (storedProjectId) {
        user.selectedProjectId = parseInt(storedProjectId, 10);
      }
      setCurrentUser(user);
    }
  }, []);

  // Fetch projects once on load
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/vres/projects`)
      .then((res) => {
        setProjects(res.data);
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, [API_BASE_URL]);

  // --- UPDATED LOGIN HANDLER ---
  const handleLogin = (e, navigate) => {
    e.preventDefault();
    const loginPayload = {
      userId: e.target.username.value,
      password: e.target.password.value,
    };

    axios
      .post(`${API_BASE_URL}/vres/auth/login`, loginPayload)
      .then((res) => {
        const userData = res.data;
        const role = userData.role.toUpperCase();
        const userNavConfig = navConfig[role];

        if (!userNavConfig) {
          toast.error("Login failed: Unknown user role.");
          return;
        }

        // Combine backend data with frontend navigation config
        const user = {
          ...userData, // Includes id, name, email, roleName, projectId, departmentId
          role: role, // Keep a consistent 'role' property
          nav: userNavConfig.nav,
        };

        localStorage.setItem("currentUser", JSON.stringify(user));
        setCurrentUser(user);
        toast.success(`Welcome ${user.name}!`);
        if (role === "ADMIN") {
          navigate(userNavConfig.defaultRoute);
        } else {
          navigate("/select-project");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        // Display a user-friendly error from the backend if available, otherwise a generic one
        console.error("Login API call failed:", err.response);
        const errorMessage =
          err.response?.data ||
          "Invalid credentials. Please try again.";
        toast.error(errorMessage);
      });
  };
  // --- END UPDATED LOGIN HANDLER ---

  const handleLogout = () => {
    localStorage.removeItem("selectedProjectId");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("departmentId");
    setCurrentUser(null);
    toast.info("You have been logged out.");
  };

  return (
    <>
      <Router>
        {currentUser ? (
          <div className="layout">
            <Header
              currentUser={currentUser}
              handleLogout={handleLogout}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
            <main
              className="main-content"
              style={{
                marginLeft: sidebarOpen ? 220 : 60,
                transition: "margin-left 0.3s",
                padding: 20,
              }}
            >
              <Routes>
                <Route
                  path="/dashboard"
                  element={<ProjectDashboardPage projects={projects} />}
                />
                <Route
                  path="/user-registration"
                  element={<UserRegistrationPage />}
                />
                <Route
                  path="/create-project"
                  element={
                    <CreateProjectPage
                      setProjects={setProjects}
                      currentUser={currentUser}
                    />
                  }
                />
                <Route path="/new-coordinator" element={<RegisterCoordinatorPage />} />
                <Route
                  path="/create-voucher"
                  element={<CreateVoucherPage currentUser={currentUser} />}
                />
                <Route
                  path="/select-project"
                  element={
                    <SelectProjectPage
                      currentUser={currentUser}
                      setCurrentUser={setCurrentUser}
                    />
                  }
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/initiate-project"
                  element={<InitiateProjectPage />}
                />
                <Route
                  path="/beneficiary-list"
                  element={
                    <BeneficiaryListPage
                      readOnly={currentUser?.role === "CHECKER"}
                    />
                  }
                />
                <Route
                  path="/approve-beneficiary-list"
                  element={
                    <ApproveBeneficiaryListPage
                      role={currentUser?.role.toLowerCase()}
                      projectId={currentUser?.selectedProjectId}
                    />
                  }
                />
                <Route
                  path="/upload-beneficiary-list"
                  element={<UploadBeneficiaryListPage />}
                />
                <Route
                  path="*"
                  element={
                    // Redirect based on the default route from our config
                    currentUser.role !== "ADMIN" &&
                    !currentUser.selectedProjectId ? (
                      <Navigate to="/select-project" replace />
                    ) : (
                      <Navigate
                        to={
                          navConfig[currentUser.role]?.defaultRoute || "/login"
                        }
                        replace
                      />
                    )
                  }
                />
              </Routes>
            </main>
          </div>
        ) : (
          <Routes>
            <Route
              path="/login"
              element={<LoginPage handleLogin={handleLogin} />}
            />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default App;
