package com.vres.dto;

public class ProjectSummaryDto {
    private int projectId;
    private String projectName;
    private Integer departmentId;

    // Constructors
    public ProjectSummaryDto() {}

    public ProjectSummaryDto(int projectId, String projectName, Integer departmentId) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.departmentId = departmentId;
    }

    // Getters and Setters
    public int getProjectId() { return projectId; }
    public void setProjectId(int projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public Integer getDepartmentId() { return departmentId; } // <-- ADDED
    public void setDepartmentId(Integer departmentId) { this.departmentId = departmentId; } // <-- ADDED
}