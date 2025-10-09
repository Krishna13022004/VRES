package com.vres.dto;

public class UserRegistrationRequest {
    private String name;
    private String role; // e.g., "maker", "checker"
    private String email;
    private String phone;
    private Integer projectId;
    
    // --- ADDED Vendor Fields ---
    private String gst;
    private String address;
    // ---------------------------

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }

    // --- ADDED Vendor Getters/Setters ---
    public String getGst() { return gst; }
    public void setGst(String gst) { this.gst = gst; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    // ------------------------------------
}