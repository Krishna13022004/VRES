package com.vres.dto;

import java.time.LocalDate;
import java.util.List;

public class ProjectDetailsCreationRequest {
    private String projectName;
    private String projectDescription;
    private LocalDate startDate;
    private LocalDate registrationEndDate;
    // ADDED: Field to hold the coordinator's email for assignment/update
    private String coordinatorEmail; 
    private List<ApproverPairDto> approvers;

    // Getters and Setters
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    
    public String getProjectDescription() { return projectDescription; }
    public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getRegistrationEndDate() { return registrationEndDate; }
    public void setRegistrationEndDate(LocalDate registrationEndDate) { this.registrationEndDate = registrationEndDate; }
    
    public String getCoordinatorEmail() { return coordinatorEmail; }
    public void setCoordinatorEmail(String coordinatorEmail) { this.coordinatorEmail = coordinatorEmail; }
    
    public List<ApproverPairDto> getApprovers() { return approvers; } // <-- ADD THIS
    public void setApprovers(List<ApproverPairDto> approvers) { this.approvers = approvers; } // <-- ADD THIS
}
