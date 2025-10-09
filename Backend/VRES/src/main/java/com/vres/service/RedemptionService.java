package com.vres.service;

import com.vres.dto.RedemptionDto;
import com.vres.entity.Redemptions;
import com.vres.entity.Users;
import com.vres.entity.Vouchers;
import com.vres.repository.RedemptionsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;

@Service
public class RedemptionService {

    @Autowired
    private RedemptionsRepository redemptionRepository;

    
    public RedemptionDto createRedemption(Vouchers voucher, Users vendor) {
        Redemptions redemption = new Redemptions();
        redemption.setVoucher(voucher);
        redemption.setVendor(vendor);
        redemption.setRedeemed_date(new Date(System.currentTimeMillis()));
        redemption.setGeo_lat(17.3850);
        redemption.setGeo_lon(78.4867); 
        redemption.setDevice_fingerprint("example-fingerprint-123");

        Redemptions savedRedemption = redemptionRepository.save(redemption);
        return convertToDto(savedRedemption);
    }

    private RedemptionDto convertToDto(Redemptions redemption) {
        RedemptionDto dto = new RedemptionDto();
        dto.setId(redemption.getId());
        dto.setVoucherId(redemption.getVoucher().getId());
        dto.setVendorId(redemption.getVendor().getId());
        if (redemption.getRedeemed_date() != null) {
            dto.setRedeemedAt(redemption.getRedeemed_date().toLocalDate().atStartOfDay());
        }
        
        dto.setGeoLat(redemption.getGeo_lat());
        dto.setGeoLon(redemption.getGeo_lon());
        dto.setDeviceFingerprint(redemption.getDevice_fingerprint());
        return dto;
    }
}

