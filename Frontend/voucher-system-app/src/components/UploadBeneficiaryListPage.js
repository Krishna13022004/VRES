import React, { useState, useEffect } from "react";
import axios from "axios"; // NEW: Import axios
import { FaInfoCircle } from "react-icons/fa";

const UploadBeneficiaryListPage = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8686";
  // CHANGED: Get projectId and departmentId dynamically from localStorage
  const projectId = localStorage.getItem("selectedProjectId");
  const departmentId = localStorage.getItem("departmentId");

  // REMOVED: Obsolete state for hardcoded departments and selection
  // const [departments, setDepartments] = useState([]);
  // const [selectedDepartment, setSelectedDepartment] = useState("");

  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // NEW: Add a check on component load to ensure required data exists
  useEffect(() => {
    if (!projectId || !departmentId) {
      setError(
        "Project or Department information is missing. Please log out and select a project again."
      );
    }
  }, [projectId, departmentId]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // CHANGED: Validation now checks for the required IDs
    if (!projectId || !departmentId) {
      setError("Cannot submit. Project or Department information is missing.");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one Excel file.");
      return;
    }

    const allowedTypes = [".xls", ".xlsx"];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.some((ext) => file.name.endsWith(ext))
    );

    if (invalidFiles.length > 0) {
      setError("Only Excel files (.xls, .xlsx) are allowed.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    // CHANGED: Append the departmentId from localStorage
    formData.append("department_id", departmentId);

    files.forEach((file) => {
      formData.append("beneficiary_files", file);
    });

    // --- CONVERTED TO AXIOS ---
    try {
      const response = await axios.post(
        `${API_BASE_URL}/vres/projects/${projectId}/beneficiaries/upload`,
        formData
        // axios handles multipart/form-data headers automatically with FormData
      );

      setMessage(
        response.data.message ||
          `Successfully submitted ${files.length} file(s) for processing.`
      );
      setFiles([]);
      // No need to reset selectedDepartment anymore
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred during the upload.";
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFiles([]);
    setMessage("");
    setError("");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        Upload Beneficiary List for Project {projectId}
      </h2>

      <div style={styles.infoBox}>
        <p
          className="page-subtitle"
          style={{ textAlign: "center", marginTop: "-10px" }}
        >
          Upload Beneficiary List{" "}
          <span
            className="info-icon"
            title={`Rules:
1. Only Excel files (.xls, .xlsx) are allowed.
2. You can upload beneficiary list.`}
          >
            <FaInfoCircle />
          </span>
        </p>
      </div>

      <form
        className="form-grid"
        onSubmit={handleSubmit}
        onReset={handleCancel}
      >
        {/* REMOVED: Department selection dropdown is no longer needed */}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="beneficiary_files">
            Select Beneficiary List File(s)
          </label>
          <input
            type="file"
            id="beneficiary_files"
            accept=".xls,.xlsx"
            multiple
            required
            onChange={handleFileChange}
            disabled={isLoading || !projectId || !departmentId} // Also disable if IDs are missing
          />
        </div>

        {isLoading && (
          <p style={{ color: "#007bff", marginTop: "15px" }}>
            Uploading, please wait...
          </p>
        )}
        {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
        {message && (
          <p style={{ color: "#28a745", marginTop: "15px" }}>{message}</p>
        )}

        <div style={styles.buttonGroup}>
          <button
            type="submit"
            style={styles.btnPrimary}
            disabled={isLoading || !projectId || !departmentId}
          >
            {isLoading ? "Uploading..." : "Submit"}
          </button>
          <button type="reset" style={styles.btnSecondary} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadBeneficiaryListPage;

// --- Inline styles (unchanged) ---
const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "30px",
    maxWidth: "750px",
    margin: "40px auto",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
    color: "#343a40",
  },
  heading: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: "24px",
  },
  infoBox: {
    backgroundColor: "#e7f7e2",
    borderLeft: "5px solid #28a745",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "4px",
    fontSize: "0.9em",
    color: "#155724",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },
  btnPrimary: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnSecondary: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
