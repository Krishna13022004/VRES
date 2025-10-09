package com.vres.dto;

import java.util.List; // Import List

public class LoginResponse {
    private Integer userId;
    private String name;
    private String email;
    private String role;
    private List<ProjectSummaryDto> projects; // <-- ADDED

    // UPDATED Constructor
    public LoginResponse(Integer userId, String name, String email, String role, List<ProjectSummaryDto> projects) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.projects = projects; // <-- ADDED
    }
    
    // --- Getters and Setters for all fields ---
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public List<ProjectSummaryDto> getProjects() { return projects; } // <-- ADDED
    public void setProjects(List<ProjectSummaryDto> projects) { this.projects = projects; } // <-- ADDED
}