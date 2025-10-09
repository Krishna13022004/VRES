package com.vres.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.vres.service.VoucherService;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/vres/vouchers")
@CrossOrigin(origins={"http://localhost:3000", "http://vres.s3-website-us-west-1.amazonaws.com"})
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

   
    @GetMapping(value = "/{voucherId}/code", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getVoucherCode(@PathVariable Integer voucherId) {
        try {
            String uniqueCode = voucherService.getVoucherCodeById(voucherId);

            if (uniqueCode == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(uniqueCode);

        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher not found.");
        } catch (Exception e) {
            System.err.println("Code retrieval failed for ID " + voucherId + ": " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Database error during code retrieval.");
        }
    }

   
    @GetMapping(value = "/{voucherId}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrCodeImageBytes(@PathVariable Integer voucherId) {
        try {
            byte[] qrCodeBytes = voucherService.getQrCodeImageBytes(voucherId);

            if (qrCodeBytes == null || qrCodeBytes.length == 0) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(qrCodeBytes);

        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "QR Code not found.");
        } catch (Exception e) {
            System.err.println("QR Code retrieval failed for ID " + voucherId + ": " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Database error during QR code retrieval.");
        }
    }
}