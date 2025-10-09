import React, { useState } from "react";
import axios from "axios"; // NEW: Import axios for consistency
import { toast } from "react-toastify"; // NEW: Import toast for better feedback

const RegisterCoordinatorPage = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8686";
  const [name, setName] = useState(""); // NEW: State for the name field
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCancel = () => {
    setName(""); // CHANGED: Clear name field
    setEmail("");
    setPhone("");
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    // CHANGED: Add name and role to the payload
    const payload = {
      name,
      email,
      phone,
      role: "Project Coordinator", // This is required by your backend
    };

    try {
      // CHANGED: Converted to axios and corrected the URL
      const response = await axios.post(
        `${API_BASE_URL}/vres/users`,
        payload
      );

      setMessage(
        `Project Coordinator "${response.data.name}" registered successfully!`
      );
      toast.success("Coordinator registered successfully!");
      handleCancel();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to register coordinator.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        margin: "40px auto",
      }}
    >
      <h2
        style={{ color: "#007bff", marginBottom: "24px", textAlign: "center" }}
      >
        Register Project Coordinator
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
        {/* --- NEW: Name Field Added --- */}
        <div className="form-group">
          <label
            htmlFor="name"
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="email"
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Email (User ID)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="phone"
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="role"
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Role
          </label>
          <input
            type="text"
            id="role"
            value="Project Coordinator"
            disabled
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da",
              backgroundColor: "#e9ecef",
              boxSizing: "border-box",
            }}
          />
        </div>

        {message && (
          <div
            style={{ color: "green", marginTop: "10px", textAlign: "center" }}
          >
            {message}
          </div>
        )}
        {error && (
          <div style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            paddingTop: "20px",
          }}
        >
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              minWidth: "100px",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              minWidth: "100px",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterCoordinatorPage;
