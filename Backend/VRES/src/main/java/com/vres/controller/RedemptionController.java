package com.vres.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vres.dto.GenericResponse;
import com.vres.dto.VoucherConfirmRedemptionRequest;
import com.vres.dto.VoucherInitiateRedemptionRequest;
import com.vres.service.VoucherService;

@RestController
@RequestMapping("/vres/redemption")
@CrossOrigin(origins={"http://localhost:3000", "http://vres.s3-website-us-west-1.amazonaws.com"})
public class RedemptionController {

    @Autowired
    private VoucherService voucherService;

    @PostMapping("/initiate")
    public ResponseEntity<GenericResponse> initiateRedemption(@RequestBody VoucherInitiateRedemptionRequest request) {
        voucherService.initiateRedemption(request.getVoucherCode());
        return ResponseEntity.ok(new GenericResponse("Redemption initiated, OTP sent to beneficiary."));
    }


    @PostMapping("/confirm")
    public ResponseEntity<GenericResponse> confirmRedemption(@RequestBody VoucherConfirmRedemptionRequest request) {
        // --- MODIFIED: Added the third required argument ---
        
        // In a real application, you would get the vendor's ID from the security context (e.g., JWT token).
        // For demonstration purposes, we will hardcode a vendor ID. Let's use vendor with ID 6.
        int vendorId = 6; 
        
        voucherService.confirmRedemption(request.getVoucherCode(), request.getOtp(), vendorId);
        
        return ResponseEntity.ok(new GenericResponse("Voucher redeemed successfully."));
    }
}

