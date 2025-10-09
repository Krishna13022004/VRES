import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { MultiSelect } from "react-multi-select-component-19";

const CreateVoucherPage = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8686";
  const [projectId, setProjectId] = useState(null);
  const [voucherPoints, setVoucherPoints] = useState("");
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [allBeneficiaries, setAllBeneficiaries] = useState([]);
  const [validityStart, setValidityStart] = useState("");
  const [validityEnd, setValidityEnd] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBeneficiaryPopup, setShowBeneficiaryPopup] = useState(false);

  // --- DATA FETCHING ---
  // This runs once when the component loads to get all necessary data.
  useEffect(() => {
    const savedProjectId = localStorage.getItem("selectedProjectId");

    if (savedProjectId) {
      setProjectId(savedProjectId);
      fetchBeneficiaries(savedProjectId);
      fetchAllVendors(savedProjectId);
    } else {
      toast.error(
        "No project selected. Please select a project from the dashboard."
      );
      setError("No project selected.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures this runs only once on mount

  const fetchBeneficiaries = async (projId) => {
    try {
      // --- THIS IS THE CORRECTED API ENDPOINT ---
      const response = await axios.get(
        `${API_BASE_URL}/vres/projects/${projId}/approved-beneficiaries`
      );
      setAllBeneficiaries(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch beneficiaries.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchAllVendors = async (projId) => {
    try {
      // The API call now includes the projectId as a query parameter
      const response = await axios.get(
        `${API_BASE_URL}/vres/users?role=Vendor&projectId=${projId}`
      );
      setAllVendors(
        response.data.map((v) => ({ label: v.name, value: v.userId }))
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch vendors for this project.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !projectId ||
      !voucherPoints ||
      selectedBeneficiaries.length === 0 ||
      !validityStart ||
      !validityEnd
    ) {
      toast.error(
        "Please fill all required fields (Points, Beneficiaries, and Dates)."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    // NOTE: The 'vendors' are not included here because your backend 'createVouchersForProject'
    // method does not currently accept them. This can be added later.
    const payload = {
      voucherPoints: Number(voucherPoints),
      beneficiaryIds: selectedBeneficiaries.map((b) => b.beneficiaryId),
      validityStart,
      validityEnd,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/vres/projects/${projectId}/vouchers`,
        payload
      );

      toast.success(response.data.message || "Vouchers issued successfully!");
      handleCancel();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to issue vouchers.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setVoucherPoints("");
    setSelectedBeneficiaries([]);
    setValidityStart("");
    setValidityEnd("");
    setSelectedVendors([]);
  };

  const toggleBeneficiarySelection = (beneficiary) => {
    setSelectedBeneficiaries((prev) => {
      const exists = prev.find(
        (b) => b.beneficiaryId === beneficiary.beneficiaryId
      );
      if (exists) {
        return prev.filter(
          (b) => b.beneficiaryId !== beneficiary.beneficiaryId
        );
      } else {
        return [...prev, beneficiary];
      }
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Voucher</h2>

      {error && <div style={{ color: "red", marginBottom: 15 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Voucher Points */}
        <div style={styles.formGroup}>
          <label htmlFor="voucherPoints" style={styles.label}>
            Voucher Points
          </label>
          <input
            type="number"
            id="voucherPoints"
            value={voucherPoints}
            onChange={(e) => setVoucherPoints(e.target.value)}
            required
            min={0}
            style={styles.input}
          />
        </div>

        {/* Beneficiary Popup Button */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Beneficiaries</label>
          <button
            type="button"
            onClick={() => setShowBeneficiaryPopup(true)}
            style={styles.btnSelect}
          >
            Select Beneficiaries
          </button>
          {selectedBeneficiaries.length > 0 && (
            <p style={{ marginTop: 8, fontSize: "0.9em", color: "#555" }}>
              {selectedBeneficiaries.length} beneficiary/ies selected
            </p>
          )}
        </div>

        {/* Validity Dates */}
        <div style={styles.formGroup}>
          <label htmlFor="validityStart" style={styles.label}>
            Validity Start Date
          </label>
          <input
            type="date"
            id="validityStart"
            value={validityStart}
            onChange={(e) => setValidityStart(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="validityEnd" style={styles.label}>
            Validity End Date
          </label>
          <input
            type="date"
            id="validityEnd"
            value={validityEnd}
            onChange={(e) => setValidityEnd(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {/* Vendor MultiSelect */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Vendors</label>
          <MultiSelect
            options={allVendors}
            value={selectedVendors}
            onChange={setSelectedVendors}
            labelledBy="Select Vendors"
            overrideStrings={{ selectSomeItems: "Select vendors..." }}
          />
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button type="submit" disabled={isLoading} style={styles.btnPrimary}>
            {isLoading ? "Submitting..." : "Issue Voucher"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={styles.btnSecondary}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Beneficiary Popup Modal */}
      {showBeneficiaryPopup && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Beneficiary List</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Select</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Phone</th>
                </tr>
              </thead>
              <tbody>
                {allBeneficiaries.map((b) => (
                  <tr key={b.beneficiaryId}>
                    <td style={styles.tableCell}>
                      <input
                        type="checkbox"
                        checked={selectedBeneficiaries.some(
                          (sel) => sel.beneficiaryId === b.beneficiaryId
                        )}
                        onChange={() => toggleBeneficiarySelection(b)}
                      />
                    </td>
                    <td style={styles.tableCell}>{b.name}</td>
                    <td style={styles.tableCell}>{b.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setShowBeneficiaryPopup(false)}
                style={styles.btnPrimary}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateVoucherPage;

// --- STYLES ---
const styles = {
  container: {
    maxWidth: 700,
    margin: "auto",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  heading: { textAlign: "center", color: "#007bff", marginBottom: 24 },
  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  formGroup: { gridColumn: "span 2" },
  label: { fontWeight: "bold", marginBottom: 8, display: "block" },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 4,
    border: "1px solid #ced4da",
    boxSizing: "border-box",
  },
  btnSelect: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  buttonGroup: {
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 24,
  },
  btnPrimary: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    padding: 30,
    borderRadius: 8,
    width: "90%",
    maxWidth: "600px",
    maxHeight: "80%",
    overflowY: "auto",
  },
  tableHeader: {
    borderBottom: "2px solid #dee2e6",
    padding: "12px",
    textAlign: "left",
  },
  tableCell: { borderBottom: "1px solid #dee2e6", padding: "12px" },
};
