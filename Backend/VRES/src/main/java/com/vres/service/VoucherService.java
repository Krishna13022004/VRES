package com.vres.service;

import java.io.IOException;
import java.sql.Date;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.zxing.WriterException;
import com.vres.entity.Beneficiaries;
import com.vres.entity.Redemptions;
import com.vres.entity.Users;
import com.vres.entity.Vouchers;
import com.vres.generator.CodeGeneratorService;
import com.vres.generator.QRCodeGenerator;
import com.vres.repository.BeneficiariesRepository;
import com.vres.repository.RedemptionsRepository;
import com.vres.repository.UsersRepository;
import com.vres.repository.VouchersRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class VoucherService {

    @Autowired
    private VouchersRepository vouchersRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BeneficiariesRepository beneficiariesRepository;

    @Autowired
    private RedemptionsRepository redemptionRepository;

    @Autowired
    private CodeGeneratorService codeGeneratorService;

    @Autowired
    private SnsService snsService; // ✅ integrate SNS here

    private static final ConcurrentHashMap<String, String> OTP_STORE = new ConcurrentHashMap<>();

    // -------------------------------------------------------------------
    // VOUCHER CREATION
    // -------------------------------------------------------------------
    @Transactional
    public Vouchers issueNewVoucher(Integer beneficiaryId) throws Exception {

        String uniqueVoucherCode;
        Vouchers existingVoucher;

        do {
            uniqueVoucherCode = codeGeneratorService.generateUniqueCode();
            existingVoucher = vouchersRepository.findByStringCode(uniqueVoucherCode).orElse(null);
        } while (existingVoucher != null);

        byte[] qrCodeBytes;
        try {
            int size = 300;
            qrCodeBytes = QRCodeGenerator.generateQRCodeImage(uniqueVoucherCode, size, size);
        } catch (WriterException | IOException e) {
            System.err.println("Error generating QR Code: " + e.getMessage());
            throw new RuntimeException("Failed to generate QR Code image for new voucher.", e);
        }

        Beneficiaries beneficiary = beneficiariesRepository.findById(beneficiaryId)
                .orElseThrow(() -> new EntityNotFoundException("Beneficiary not found with id: " + beneficiaryId));

        Vouchers newVoucher = new Vouchers();
        newVoucher.setBeneficiary(beneficiary);
        newVoucher.setProject(beneficiary.getProject());
        newVoucher.setStringCode(uniqueVoucherCode);
        newVoucher.setQrCodeImage(qrCodeBytes);
        newVoucher.setStatus("ISSUED");

        System.out.println("Saving in Database");
        Vouchers savedVoucher = vouchersRepository.save(newVoucher);

        // ✅ Send SMS Notification through SNS after saving
        try {
            String phoneNumber = beneficiary.getPhone(); // Ensure this is in +91XXXXXXXXXX format
            System.out.println(phoneNumber);
            if (phoneNumber != null && !phoneNumber.isEmpty()) {
                String message = String.format(
                    "Hello %s, your voucher has been issued successfully!\nVoucher Code: %s\nPlease keep it safe for redemption.",
                    beneficiary.getName(), uniqueVoucherCode
                );

                // Use sandbox or production based on your SNS setup
                snsService.publishSmsDirect(phoneNumber, message);
                System.out.println("Voucher SMS sent to " + phoneNumber);
            } else {
                System.err.println("No phone number found for beneficiary ID: " + beneficiaryId);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS via SNS for voucher: " + uniqueVoucherCode + " - " + e.getMessage());
        }

        return savedVoucher;
    }

    // -------------------------------------------------------------------
    // QR CODE IMAGE RETRIEVAL
    // -------------------------------------------------------------------
    public byte[] getQrCodeImageBytes(Integer voucherId) {
        Optional<Vouchers> voucherOpt = vouchersRepository.findById(voucherId);
        if (voucherOpt.isEmpty()) {
            throw new EntityNotFoundException("Voucher not found with ID: " + voucherId);
        }
        return voucherOpt.get().getQrCodeImage();
    }

    // -------------------------------------------------------------------
    // UNIQUE VOUCHER TEXT RETRIEVAL
    // -------------------------------------------------------------------
    public String getVoucherCodeById(Integer voucherId) {
        Optional<Vouchers> voucherOpt = vouchersRepository.findById(voucherId);
        if (voucherOpt.isEmpty()) {
            throw new EntityNotFoundException("Voucher not found with ID: " + voucherId);
        }
        return voucherOpt.get().getStringCode();
    }

    // -------------------------------------------------------------------
    // REDEMPTION INITIATION (USES VOUCHER TEXT)
    // -------------------------------------------------------------------
    public void initiateRedemption(String voucherCode) {
        Vouchers voucher = vouchersRepository.findByStringCode(voucherCode)
                .orElseThrow(() -> new EntityNotFoundException("Voucher not found with code: " + voucherCode));

        if (!"ISSUED".equalsIgnoreCase(voucher.getStatus())) {
            throw new IllegalStateException("This voucher is not available for redemption. Its status is: " + voucher.getStatus());
        }

        String otp = String.format("%06d", (int) (Math.random() * 999999));
        OTP_STORE.put(voucherCode, otp);
        System.out.println("Initiating redemption for voucher: " + voucherCode + ". OTP generated (SIMULATED SEND): " + otp);
    }

    // -------------------------------------------------------------------
    // REDEMPTION CONFIRMATION (USES VOUCHER TEXT AND OTP)
    // -------------------------------------------------------------------
    @Transactional
    public void confirmRedemption(String voucherCode, String otp, int vendorId) {
        String storedOtp = OTP_STORE.get(voucherCode);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP for voucher: " + voucherCode);
        }

        Vouchers voucher = vouchersRepository.findByStringCode(voucherCode)
                .orElseThrow(() -> new EntityNotFoundException("Voucher not found with code: " + voucherCode));

        Users vendor = usersRepository.findById(vendorId)
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id: " + vendorId));

        if (!"ISSUED".equalsIgnoreCase(voucher.getStatus())) {
            throw new IllegalStateException("This voucher cannot be redeemed. Its status is: " + voucher.getStatus());
        }

        Redemptions redemption = new Redemptions();
        redemption.setVoucher(voucher);
        redemption.setVendor(vendor);
        redemption.setRedeemed_date(new Date(System.currentTimeMillis()));
        redemption.setGeo_lat(0.0);
        redemption.setGeo_lon(0.0);
        redemption.setDevice_fingerprint("placeholder-device-fingerprint");

        redemptionRepository.save(redemption);
        voucher.setStatus("REDEEMED");
        vouchersRepository.save(voucher);
        OTP_STORE.remove(voucherCode);

        System.out.println("Confirmed redemption for voucher: " + voucherCode + " by vendor: " + vendor.getName());
    }
}
