package com.vres.dto;

import java.util.List;

public class UpdateBeneficiaryStatusRequest {
    private List<Integer> beneficiaryIds;
    private String status;

    // Getters and Setters
    public List<Integer> getBeneficiaryIds() { return beneficiaryIds; }
    public void setBeneficiaryIds(List<Integer> beneficiaryIds) { this.beneficiaryIds = beneficiaryIds; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
