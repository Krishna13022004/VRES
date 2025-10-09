package com.vres.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vres.entity.Vouchers;

@Repository
public interface VouchersRepository extends JpaRepository<Vouchers, Integer> {
    
    // Required for both issuing and redemption logic (finding the voucher by its unique text)
    Optional<Vouchers> findByStringCode(String stringCode);
}
