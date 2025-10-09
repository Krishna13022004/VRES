/* eslint-disable eqeqeq */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaInfoCircle } from "react-icons/fa";

const CreateProjectPage = ({ setProjects, currentUser }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8686";
  const navigate = useNavigate();

  // Determine if the component should be in "Edit Mode"
  const selectedProjectId = localStorage.getItem("selectedProjectId");
  const isEditMode =
    currentUser?.role === "PROJECT COORDINATOR" && selectedProjectId;

  // State for all form fields
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [maker, setMaker] = useState("");
  const [checker, setChecker] = useState("");
  const [makerOptions, setMakerOptions] = useState([]);
  const [checkerOptions, setCheckerOptions] = useState([]);
  const [tagPairs, setTagPairs] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect to fetch all required data on component load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const projId = localStorage.getItem("selectedProjectId");
      try {
        // Fetch Maker and Checker lists from your backend API
        const makersRes = await axios.get(
          `${API_BASE_URL}/vres/users?role=Maker&projectId=${projId}`
        );
        const checkersRes = await axios.get(
          `${API_BASE_URL}/vres/users?role=Checker&projectId=${projId}`
        );

        setMakerOptions(makersRes.data);
        setCheckerOptions(checkersRes.data);

        // If in Edit Mode, fetch the specific project's details
        if (isEditMode) {
          const projectRes = await axios.get(
            `${API_BASE_URL}/vres/projects/${selectedProjectId}`
          );
          const projectData = projectRes.data;

          // Populate the form fields with the fetched project data
          setProjectName(projectData.title || "");
          setDescription(projectData.description || "");
          setStartDate(projectData.start_date || "");
          setRegistrationEndDate(projectData.end_date || "");
          setTagPairs(projectData.approvers || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load necessary data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL, isEditMode, selectedProjectId]);

  const handleCombine = () => {
    if (!maker || !checker) {
      toast.warn("Please select both a Maker and a Checker.");
      return;
    }

    // CORRECTED: Use 'userId' to find the user objects
    const makerObj = makerOptions.find((m) => m.userId == maker);
    const checkerObj = checkerOptions.find((c) => c.userId == checker);

    if (!makerObj || !checkerObj) {
      console.error("Could not find selected maker or checker object.");
      return;
    }

    setTagPairs((prev) => [
      ...prev,
      {
        makerId: maker,
        checkerId: checker,
        makerName: makerObj.name,
        checkerName: checkerObj.name,
      },
    ]);

    // CORRECTED: Use 'userId' to filter the options
    setMakerOptions((prev) => prev.filter((item) => item.userId != maker));
    setCheckerOptions((prev) => prev.filter((item) => item.userId != checker));

    setMaker("");
    setChecker("");
  };

  const handleRemoveTag = (index) => {
    // In a full implementation, you would re-add the removed users to the dropdowns
    setTagPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: projectName,
      description,
      startDate,
      registrationEndDate,
      status: "DRAFT",
      approvers: tagPairs.map((p) => ({
        makerId: p.makerId,
        checkerId: p.checkerId,
      })),
    };

    try {
      if (isEditMode) {
        await axios.put(
          `${API_BASE_URL}/vres/projects/${selectedProjectId}/details`,
          payload
        );
        toast.success("Project updated successfully.");
        navigate("/dashboard");
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/vres/projects`,
          payload
        );
        setProjects((prev) => [...prev, response.data]);
        toast.success("Project created successfully with status DRAFT.");
        handleCancel();
      }
    } catch (err) {
      console.error("Error submitting project:", err);
      const errorMessage =
        err.response?.data?.message || "Error submitting project.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProjectName("");
    setDescription("");
    setStartDate("");
    setRegistrationEndDate("");
    setTagPairs([]);
    setMaker("");
    setChecker("");
    // You might want to re-fetch the maker/checker lists here
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div style={styles.container}>
        <h2 style={styles.title}>
          {isEditMode ? `Create Project Page` : "Create New Project"}
        </h2>
        <div style={styles.infoHeading}>
          <p
            className="page-subtitle"
            style={{ textAlign: "center", marginTop: "-10px" }}
          >
            Create a new project{" "}
            <span
              className="info-icon"
              title={`Rules:
1. This page is for updating the details of the already initiated project.
2. Project Status remains 'DRAFT' until further action.
3. Project Coordinator will be assigned/updated upon submit.`}
            >
              <FaInfoCircle />
            </span>
          </p>
        </div>
        <form style={styles.formGrid} onSubmit={handleSubmit}>
          <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
            <label style={styles.label}>Project Name</label>
            <input
              style={styles.input}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
            <label style={styles.label}>Project Description</label>
            <textarea
              style={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Project Start Date</label>
            <input
              style={styles.input}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Registration End Date</label>
            <input
              style={styles.input}
              type="date"
              value={registrationEndDate}
              onChange={(e) => setRegistrationEndDate(e.target.value)}
              required
            />
          </div>

          <div style={styles.tagContainer}>
            {tagPairs.map((pair, index) => (
              <div style={styles.tag} key={index}>
                {pair.makerName}, {pair.checkerName}
                <span
                  style={styles.removeBtn}
                  onClick={() => handleRemoveTag(index)}
                >
                  ✕
                </span>
              </div>
            ))}
          </div>

          <div style={styles.dropdownGroup}>
            <select
              style={styles.select}
              value={maker}
              onChange={(e) => setMaker(e.target.value)}
            >
              <option value="">-- Select Maker --</option>
              {makerOptions.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.name}
                </option>
              ))}
            </select>
            <select
              style={styles.select}
              value={checker}
              onChange={(e) => setChecker(e.target.value)}
            >
              <option value="">-- Select Checker --</option>
              {checkerOptions.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              style={styles.btnPrimary}
              onClick={handleCombine}
            >
              Combine
            </button>
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;

// --- Full Styles Object ---
const styles = {
  container: {
    width: "90%",
    maxWidth: "750px",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif",
    color: "#343a40",
  },
  title: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: "24px",
  },
  infoHeading: {
    backgroundColor: "#e7f7e2",
    borderLeft: "5px solid #28a745",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "4px",
    fontSize: "0.9em",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  formGroup: {
    marginBottom: "0",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    minHeight: "80px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  buttonGroup: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },
  btnPrimary: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: "#007bff",
    color: "#fff",
  },
  btnSecondary: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: "#6c757d",
    color: "#fff",
  },
  tagContainer: {
    gridColumn: "1 / -1",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    margin: "10px 0",
  },
  tag: {
    backgroundColor: "#e9ecef",
    borderRadius: "16px",
    padding: "6px 12px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.9em",
  },
  removeBtn: {
    marginLeft: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#dc3545",
  },
  dropdownGroup: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  select: {
    flex: 1,
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
  },
};
