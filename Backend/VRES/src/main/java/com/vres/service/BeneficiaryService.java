package com.vres.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vres.entity.Beneficiaries;
import com.vres.repository.BeneficiariesRepository;

@Service
public class BeneficiaryService {

    @Autowired
    private BeneficiariesRepository beneficiariesRepository;

   
    public int updateBeneficiaryStatus(List<Integer> ids, String status) {
        List<Beneficiaries> beneficiariesToUpdate = beneficiariesRepository.findAllById(ids);
        
        boolean isApproved = "active".equalsIgnoreCase(status);
        
        for (Beneficiaries beneficiary : beneficiariesToUpdate) {
            beneficiary.setIs_approved(isApproved);
        }
        
        beneficiariesRepository.saveAll(beneficiariesToUpdate);
        
        return beneficiariesToUpdate.size();
    }
}

