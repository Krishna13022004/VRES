import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";

const ApproveBeneficiaryListPage = ({ role, projectId }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8686";
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selected, setSelected] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const departmentId = localStorage.getItem("departmentId");

  // --- FETCH BENEFICIARIES ---
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!projectId) {
        setError("No project has been selected.");
        setBeneficiaries([]);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${API_BASE_URL}/vres/projects/${projectId}/departments/${departmentId}/beneficiaries?status=pending_approval`
        );
        setBeneficiaries(response.data);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch beneficiaries.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeneficiaries();
  }, [projectId, departmentId, API_BASE_URL]);

  const handleCheckboxChange = (beneficiaryId) => {
    setSelected((prev) =>
      prev.includes(beneficiaryId)
        ? prev.filter((id) => id !== beneficiaryId)
        : [...prev, beneficiaryId]
    );
  };

  // --- UPDATE STATUS ---
  const handleStatusUpdate = async (newStatus) => {
    if (selected.length === 0) {
      setError(`No beneficiaries selected to ${newStatus}.`);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/vres/beneficiaries/status`,
        {
          beneficiaryIds: selected,
          status: newStatus,
        }
      );

      setMessage(response.data.message);

      setBeneficiaries(
        beneficiaries.filter((b) => !selected.includes(b.beneficiaryId))
      );
      setSelected([]);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${newStatus} beneficiaries.`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isReadOnly = role === "maker";

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Approve Beneficiary List</h2>
      <p
        className="page-subtitle"
        style={{ textAlign: "center", marginTop: "-10px" }}
      >
        Approve / Reject Beneficiary List{" "}
        <span
          className="info-icon"
          title={`Rules:
1. Only CHECKER role can approve or reject beneficiaries.
2. Once approved, beneficiary data becomes final and cannot be modified.
3. Rejected beneficiaries must be corrected and re-uploaded.`}
        >
          <FaInfoCircle />
        </span>
      </p>

      {error && (
        <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
      )}
      {message && (
        <div style={{ color: "green", marginBottom: "15px" }}>{message}</div>
      )}

      {isLoading && <p>Loading beneficiaries...</p>}

      {!isLoading && beneficiaries.length === 0 && !error && (
        <p>
          No beneficiaries are currently awaiting approval for this project.
        </p>
      )}

      {!isLoading && beneficiaries.length > 0 && (
        <form>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map((b) => (
                <tr key={b.beneficiaryId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(b.beneficiaryId)}
                      disabled={isReadOnly}
                      onChange={() => handleCheckboxChange(b.beneficiaryId)}
                    />
                  </td>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isReadOnly && (
            <div style={styles.buttonGroup}>
              <button
                type="button"
                style={styles.primaryBtn}
                onClick={() => handleStatusUpdate("active")}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Approve"}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default ApproveBeneficiaryListPage;

// Inline styles
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
  table: {
    width: "100%",
    border: "1px solid #00070fff",
    borderCollapse: "collapse",
    marginBottom: "20px",
    textAlign: "left",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  primaryBtn: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  secondaryBtn: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
