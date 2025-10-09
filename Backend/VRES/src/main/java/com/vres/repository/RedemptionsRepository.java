package com.vres.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.vres.entity.Redemptions;

@Repository
public interface RedemptionsRepository extends JpaRepository<Redemptions, Integer> {
    
}
