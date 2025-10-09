import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import { FaInfoCircle } from "react-icons/fa";

const ProjectDashboardPage = ({ projects }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8686";
  const [selectedProject, setSelectedProject] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      axios
        .get(`${API_BASE_URL}/vres/projects/${selectedProject}`)
        .then((res) => {
          setProjectDetails(res.data);
        })
        .catch((err) => {
          console.error("Error fetching project details:", err);
          setProjectDetails(null);
        });
    }
  }, [API_BASE_URL, selectedProject]);

  // Calculate voucher status counts for pie chart
  const statusCount = projectDetails?.vouchers?.reduce(
    (acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    },
    { ISSUED: 0, REDEEMED: 0, EXPIRED: 0, CANCELLED: 0 }
  ) || { ISSUED: 0, REDEEMED: 0, EXPIRED: 0, CANCELLED: 0 };

  // Chart Data for react-chartjs-2 Pie component
  const chartData = {
    labels: ["ISSUED", "REDEEMED", "EXPIRED", "CANCELLED"],
    datasets: [
      {
        data: [
          statusCount.ISSUED,
          statusCount.REDEEMED,
          statusCount.EXPIRED,
          statusCount.CANCELLED,
        ],
        backgroundColor: [
          "#28a745", // success color (ISSUED)
          "#007bff", // primary color (REDEEMED)
          "#ffc107", // warning color (EXPIRED)
          "#dc3545", // danger color (CANCELLED)
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div
      className="container"
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f9fa",
        color: "#343a40",
        padding: "40px",
        maxWidth: "700px",
        margin: "0 auto",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2
        style={{
          color: "#007bff",
          marginBottom: "24px",
          borderBottom: "2px solid #e9ecef",
          paddingBottom: "10px",
        }}
      >
        Project Dashboard
      </h2>

      <div
        style={{
          backgroundColor: "#e9ecef",
          borderLeft: "5px solid #6c757d",
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "4px",
          fontSize: "0.9em",
        }}
      >
        <p
          className="page-subtitle"
          style={{ textAlign: "center", marginTop: "-10px" }}
        >
          Project Dashboard{" "}
          <span
            className="info-icon"
            title={`Access Rules:
1. OBSERVER, ADMIN: Can view All Projects.
2. DEPARTMENT, ISSUER: Can view Projects for their department only.`}
          >
            <FaInfoCircle />
          </span>
        </p>
      </div>

      {/* Project Select Dropdown */}
      <div className="form-group" style={{ marginBottom: "20px" }}>
        <label
          htmlFor="project"
          style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}
        >
          Select Project
        </label>
        <select
          id="project"
          name="project"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            boxSizing: "border-box",
          }}
        >
          <option value="" disabled>
            -- Select a Project to view details --
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {projectDetails && (
        <div
          className="dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "30px",
            marginTop: "20px",
          }}
        >
          {/* Project Details Section */}
          <div
            className="project-details"
            style={{
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>
              Project Details
            </h3>
            <div
              style={{
                marginBottom: "15px",
                paddingBottom: "5px",
                borderBottom: "1px dashed #e9ecef",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "0.9em",
                  color: "#6c757d",
                }}
              >
                Project Title
              </strong>
              <span style={{ fontSize: "1.1em", fontWeight: 500 }}>
                {projectDetails.title}
              </span>
            </div>
            <div
              style={{
                marginBottom: "15px",
                paddingBottom: "5px",
                borderBottom: "1px dashed #e9ecef",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "0.9em",
                  color: "#6c757d",
                }}
              >
                Creation Date
              </strong>
              <span style={{ fontSize: "1.1em", fontWeight: 500 }}>
                {projectDetails.creationDate || projectDetails.startDate}
              </span>
            </div>
            <div
              style={{
                marginBottom: "15px",
                paddingBottom: "5px",
                borderBottom: "1px dashed #e9ecef",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "0.9em",
                  color: "#6c757d",
                }}
              >
                Vendors
              </strong>
              <span style={{ fontSize: "1.1em", fontWeight: 500 }}>
                {projectDetails.vendors?.join(", ") || "N/A"}
              </span>
            </div>
            <div
              style={{
                marginBottom: "15px",
                paddingBottom: "5px",
                borderBottom: "1px dashed #e9ecef",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "0.9em",
                  color: "#6c757d",
                }}
              >
                Voucher Points
              </strong>
              <span style={{ fontSize: "1.1em", fontWeight: 500 }}>
                {projectDetails.voucherPoints || "N/A"}
              </span>
            </div>
            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: "0.9em",
                  color: "#6c757d",
                }}
              >
                Validity Dates
              </strong>
              <span style={{ fontSize: "1.1em", fontWeight: 500 }}>
                {projectDetails.validityStartDate} to{" "}
                {projectDetails.validityEndDate}
              </span>
            </div>
          </div>

          {/* Voucher Status Summary Section */}
          <div>
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>
              Voucher Status Summary
            </h3>
            <div
              className="chart-mock"
              style={{
                padding: "20px",
                backgroundColor: "#f1f1f1",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <Pie data={chartData} />
              <div
                className="legend"
                style={{ marginTop: "15px", textAlign: "left" }}
              >
                <div style={{ margin: "5px 0", fontSize: "0.9em" }}>
                  <span
                    className="legend-dot"
                    style={{
                      backgroundColor: "#28a745",
                      height: "10px",
                      width: "10px",
                      borderRadius: "50%",
                      display: "inline-block",
                      marginRight: "5px",
                    }}
                  ></span>{" "}
                  Issued ({statusCount.ISSUED})
                </div>
                <div style={{ margin: "5px 0", fontSize: "0.9em" }}>
                  <span
                    className="legend-dot"
                    style={{
                      backgroundColor: "#007bff",
                      height: "10px",
                      width: "10px",
                      borderRadius: "50%",
                      display: "inline-block",
                      marginRight: "5px",
                    }}
                  ></span>{" "}
                  Redeemed ({statusCount.REDEEMED})
                </div>
                <div style={{ margin: "5px 0", fontSize: "0.9em" }}>
                  <span
                    className="legend-dot"
                    style={{
                      backgroundColor: "#ffc107",
                      height: "10px",
                      width: "10px",
                      borderRadius: "50%",
                      display: "inline-block",
                      marginRight: "5px",
                    }}
                  ></span>{" "}
                  Expired ({statusCount.EXPIRED})
                </div>
                <div style={{ margin: "5px 0", fontSize: "0.9em" }}>
                  <span
                    className="legend-dot"
                    style={{
                      backgroundColor: "#dc3545",
                      height: "10px",
                      width: "10px",
                      borderRadius: "50%",
                      display: "inline-block",
                      marginRight: "5px",
                    }}
                  ></span>{" "}
                  Cancelled ({statusCount.CANCELLED})
                </div>
              </div>
            </div>
          </div>

          {/* Beneficiary Table */}
          <div
            className="table-section"
            style={{ gridColumn: "1 / -1", marginTop: "30px" }}
          >
            <h3>Beneficiary List Status</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "15px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "12px",
                      textAlign: "left",
                      backgroundColor: "#007bff",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Beneficiary Name
                  </th>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "12px",
                      textAlign: "left",
                      backgroundColor: "#007bff",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Voucher Status
                  </th>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "12px",
                      textAlign: "left",
                      backgroundColor: "#007bff",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Redemption Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectDetails.vouchers?.length > 0 ? (
                  projectDetails.vouchers.map((voucher, i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: i % 2 === 1 ? "#f2f2f2" : "white",
                      }}
                    >
                      <td
                        style={{
                          border: "1px solid #dee2e6",
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        {voucher.beneficiary || `Beneficiary ${i + 1}`}
                      </td>
                      <td
                        style={{
                          border: "1px solid #dee2e6",
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "bold",
                          color:
                            voucher.status === "ISSUED"
                              ? "#28a745"
                              : voucher.status === "REDEEMED"
                              ? "#007bff"
                              : voucher.status === "EXPIRED"
                              ? "#ffc107"
                              : voucher.status === "CANCELLED"
                              ? "#dc3545"
                              : "#343a40",
                        }}
                      >
                        {voucher.status}
                      </td>
                      <td
                        style={{
                          border: "1px solid #dee2e6",
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        {voucher.redemptionDate || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      style={{ textAlign: "center", padding: "12px" }}
                    >
                      No vouchers available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboardPage;
