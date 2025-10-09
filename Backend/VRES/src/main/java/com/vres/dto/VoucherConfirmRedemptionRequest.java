package com.vres.dto;

public class VoucherConfirmRedemptionRequest {
    private String voucherCode;
    private String otp;

    // Getters and Setters
    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
