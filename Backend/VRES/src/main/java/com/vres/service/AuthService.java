package com.vres.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vres.dto.LoginRequest;
import com.vres.dto.LoginResponse;
import com.vres.dto.ProjectSummaryDto;
import com.vres.entity.Department;
import com.vres.entity.ProjectUser;
import com.vres.entity.Users;
import com.vres.repository.DepartmentRepository;
import com.vres.repository.ProjectUserRepository;
import com.vres.repository.ProjectsRepository;
import com.vres.repository.UsersRepository;

@Service
public class AuthService {
	
	@Autowired
    private UsersRepository usersRepository;
	
	@Autowired
    private ProjectUserRepository projectUserRepository;
    
    @Autowired
    private ProjectsRepository projectsRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private SnsService snsService;

    public LoginResponse login(LoginRequest loginRequest) {
        // 1. Find user by email and verify password
        Users user = usersRepository.findByEmail(loginRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("Invalid credentials."));

        if (!loginRequest.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Invalid credentials.");
        }

        // --- MODIFICATION for new workflow ---
        // 2. Check if the user is active
        if (!user.isIs_active()) {
            // User is not active, check if their SNS subscription is now confirmed
            boolean isConfirmed = snsService.isSubscriptionConfirmed(user.getEmail());
            
            if (isConfirmed) {
                // If confirmed, activate the user and proceed with login
                user.setIs_active(true);
                usersRepository.save(user);
            } else {
                // If still not confirmed, block the login
                throw new RuntimeException("Account not active. Please check your email for the confirmation link.");
            }
        }
        // ------------------------------------

        // 3. If user is active (or was just activated), build and return the successful login response
        return buildLoginResponse(user);
    }

    /**
     * Helper method to build the LoginResponse DTO.
     */
    private LoginResponse buildLoginResponse(Users user) {
        String roleName = user.getRole().getName().toUpperCase();
        List<ProjectSummaryDto> assignedProjects = Collections.emptyList();

        if (!"ADMIN".equals(roleName)) {
            List<Integer> projectIds = projectUserRepository.findAllByUserId(user.getId()).stream()
                    .map(ProjectUser::getProjectId)
                    .collect(Collectors.toList());

            if (!projectIds.isEmpty()) {
                assignedProjects = projectsRepository.findAllById(projectIds).stream()
                        .map(project -> {
                            Integer departmentId = departmentRepository.findByProjectIdAndUser(project.getId(), user.getId())
                                    .map(Department::getId)
                                    .orElse(null);
                            return new ProjectSummaryDto(project.getId(), project.getTitle(), departmentId);
                        })
                        .collect(Collectors.toList());
            }
        }

        return new LoginResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            roleName,
            assignedProjects
        );
    }

    public void forgotPassword(String userId) {
        // --- Placeholder Logic ---
        // 1. Find user by email (userId).
        // 2. If user exists, generate a unique, secure password reset token.
        // 3. Save the token and its expiry date against the user's record in the database.
        // 4. Send an email to the user with a link containing the reset token.
        // Note: Do not throw an error if the user is not found to prevent email enumeration attacks.
        System.out.println("Forgot password requested for user: " + userId);
    }

    public void resetPassword(String token, String newPassword) {
        // --- Placeholder Logic ---
        // 1. Find the user associated with the provided reset token.
        // 2. Validate that the token has not expired.
        // 3. If valid, hash the newPassword.
        // 4. Update the user's password in the database with the new hash.
        // 5. Invalidate or delete the reset token so it cannot be used again.
        System.out.println("Resetting password with token: " + token);
    }
}
