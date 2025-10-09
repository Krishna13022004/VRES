package com.vres.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vres.entity.Beneficiaries;

@Repository
public interface BeneficiariesRepository extends JpaRepository<Beneficiaries, Integer> {

    // Finds beneficiaries by the ID of the associated project
    List<Beneficiaries> findByProjectId(int projectId);
    
    /**
     * Finds beneficiaries by Project ID, optionally filtering by approval status and Department ID.
     */
    @Query("SELECT b FROM Beneficiaries b WHERE b.project.id = :projectId " +
            "AND (:isApproved IS NULL OR b.is_approved = :isApproved) " +
            "AND (:departmentId IS NULL OR b.department.id = :departmentId)")
    List<Beneficiaries> findByProjectAndFilters(
          @Param("projectId") int projectId,
          @Param("isApproved") Boolean isApproved,
          @Param("departmentId") Integer departmentId
    );
    
    /**
     * Finds beneficiaries by Project ID, optionally filtering only by approval status.
     */
    @Query("SELECT b FROM Beneficiaries b WHERE b.project.id = :projectId " +
            "AND (:isApproved IS NULL OR b.is_approved = :isApproved) ")
    List<Beneficiaries> findByProject(
          @Param("projectId") int projectId,
          @Param("isApproved") Boolean isApproved
    );
}
