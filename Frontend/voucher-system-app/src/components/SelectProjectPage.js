import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// This config helps determine where to go after selecting a project.
const navConfig = {
  "PROJECT COORDINATOR": { defaultRoute: "/user-registration" },
  ISSUER: { defaultRoute: "/create-voucher" },
  OBSERVER: { defaultRoute: "/dashboard" },
  CHECKER: { defaultRoute: "/approve-beneficiary-list" },
  MAKER: { defaultRoute: "/upload-beneficiary-list" },
};

const SelectProjectPage = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  const [selectedProjectId, setSelectedProjectId] = useState(
    currentUser?.projects?.[0]?.projectId || ""
  );

  useEffect(() => {
    if (!currentUser?.projects || currentUser.projects.length === 0) {
      toast.error(
        "You are not assigned to any projects. Please contact an administrator."
      );
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleProjectSelect = (e) => {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.warn("Please select a project to continue.");
      return;
    }

    // --- UPDATED LOGIC ---
    // 1. Find the full project object from the currentUser state
    const selectedProject = currentUser.projects.find(
        // eslint-disable-next-line
      (p) => p.projectId == selectedProjectId
    );

    if (!selectedProject) {
      toast.error("An error occurred. Could not find the selected project.");
      return;
    }

    // 2. Store the projectId in localStorage (as before)
    localStorage.setItem("selectedProjectId", selectedProjectId);

    // 3. NEW: If the user is a MAKER or CHECKER, store the departmentId
    if (currentUser.role === "MAKER" || currentUser.role === "CHECKER") {
      if (selectedProject.departmentId) {
        localStorage.setItem("departmentId", selectedProject.departmentId);
      } else {
        // If the selected project has no departmentId, ensure the old one is cleared
        localStorage.removeItem("departmentId");
        console.warn(`Project "${selectedProject.projectName}" has no departmentId.`);
      }
    }

    const updatedUser = {
      ...currentUser,
      selectedProjectId: parseInt(selectedProjectId, 10),
    };
    setCurrentUser(updatedUser);

    const defaultRoute = navConfig[currentUser.role]?.defaultRoute;
    if (defaultRoute) {
      toast.success(`Project selected!`);
      navigate(defaultRoute);
    } else {
      toast.error("Could not determine your destination page.");
      navigate("/login");
    }
  };

  if (!currentUser?.projects) {
    return null; // Render nothing while loading
  }

  // --- UPDATED JSX WITH CORRECT STYLING ---
  return (
    // This outer div helps center the card in the main content area
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 100px)",
      }}
    >
      <div className="form-card-dark">
        {" "}
        {/* CHANGED: Use the main dark card style */}
        <h2 className="page-title">Select Your Project</h2>
        <p className="page-subtitle" style={{ textAlign: "center" }}>
          Welcome, {currentUser.name}. Please choose a project to work on.
        </p>
        <form onSubmit={handleProjectSelect} style={{ width: "100%" }}>
          <div className="form-group">
            <label htmlFor="project-select">Assigned Projects</label>
            <select
              id="project-select"
              className="form-select" // CHANGED: Use the correct select class
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Choose a project --
              </option>
              {currentUser.projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>
          <div className="button-group" style={{ justifyContent: "center" }}>
            {" "}
            {/* CHANGED: Use button-group to center */}
            <button type="submit" className="btn btn-primary">
              {" "}
              {/* CHANGED: Use standard button classes */}
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectProjectPage;
