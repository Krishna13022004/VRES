package com.vres.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vres.entity.Roles;
import com.vres.entity.Users;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
 
    // Required for authentication (AuthService) and guaranteed unique lookup
    Optional<Users> findByEmail(String email);
    
    // Required for filtering user lists by role name
    List<Users> findByRole_Name(String roleName);

    // Required for specific filtering where the Role entity is known
    List<Users> findByRole(Roles role);
    
    /**
     * Finds users (e.g., Project Coordinators) assigned to a specific project.
     */
    @Query("SELECT u FROM Users u JOIN ProjectUser pu ON u.id = pu.userId WHERE pu.projectId = :projectId AND u.role.name = :roleName")
    List<Users> findByProjectAndRole(
         @Param("projectId") Integer projectId, 
         @Param("roleName") String roleName
    );
}
