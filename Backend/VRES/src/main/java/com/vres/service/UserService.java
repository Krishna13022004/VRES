package com.vres.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vres.dto.CoordinatorDto;
import com.vres.dto.UserRegistrationRequest;
import com.vres.dto.UserResponse;
import com.vres.entity.ProjectUser;
import com.vres.entity.Roles;
import com.vres.entity.Users;
import com.vres.repository.ProjectUserRepository;
import com.vres.repository.RolesRepository;
import com.vres.repository.UsersRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class UserService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private RolesRepository rolesRepository;
    
    @Autowired
    private ProjectUserRepository projectUserRepository;
    
    @Autowired
    private SnsService snsService;


    // --- NEW METHOD TO FETCH COORDINATORS ---
    public List<CoordinatorDto> getProjectCoordinators() {
        // 1. Find the Role entity for 'project_coordinator'
        Roles coordinatorRole = rolesRepository.findByName("project_coordinator")
                .orElseThrow(() -> new EntityNotFoundException("Role 'project_coordinator' not found. Please seed the database."));

        // 2. Find all Users with that role. Requires findByRole(Roles role) in UsersRepository.
        List<Users> coordinators = usersRepository.findByRole(coordinatorRole); 

        // 3. Convert the list of Users entities to a list of CoordinatorDto
        return coordinators.stream()
                .map(this::convertToCoordinatorDto)
                .collect(Collectors.toList());
    }
    
    // Helper method for DTO conversion
    private CoordinatorDto convertToCoordinatorDto(Users user) {
        CoordinatorDto dto = new CoordinatorDto();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        return dto;
    }
    // ----------------------------------------

    // --- MODIFIED: Logic to support the new GET endpoint for filtering by role ---
    public List<UserResponse> getAllUsersByRole(String role, Integer projectId) { // <-- ADD projectId
        List<Users> users;

        if (projectId != null && role != null) {
            // --- NEW LOGIC for filtering by project and role ---
            users = usersRepository.findByProjectAndRole(projectId, role);
        } else if (role != null) {
            users = usersRepository.findByRole_Name(role);
        } else {
            users = usersRepository.findAll();
        }
        
        return users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    // --- MODIFIED: Now returns UserResponse as required by the new API spec ---
    @Transactional
    public UserResponse onboardUser(UserRegistrationRequest request) {
        if (usersRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalStateException("A user with the email '" + request.getEmail() + "' already exists.");
        }
        
        Users newUser = new Users();
        newUser.setPassword("pass1234"); 
        
        // This is a helper method you already have, it populates user details from the request
        updateUserFromDto(newUser, request); 

        // --- MODIFICATION for new workflow ---
        // 1. Set user as inactive by default
        newUser.setIs_active(false);
        
        Users savedUser = usersRepository.save(newUser);

        // 2. Send the AWS SNS confirmation email
        snsService.subscribeEmail(savedUser.getEmail());
        // ------------------------------------

        if (request.getProjectId() != null) {
            ProjectUser projectUserMapping = new ProjectUser();
            projectUserMapping.setUserId(savedUser.getId());
            projectUserMapping.setProjectId(request.getProjectId());
            projectUserRepository.save(projectUserMapping);
        }

        return convertToUserResponse(savedUser);
    }

    public UserResponse getUserById(int userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        return convertToUserResponse(user);
    }

    public void updateUser(int userId, UserRegistrationRequest request) {
        Users existingUser = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        updateUserFromDto(existingUser, request);
        
        usersRepository.save(existingUser);
    }

    private UserResponse convertToUserResponse(Users user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        if (user.getRole() != null) {
            response.setRole(user.getRole().getName());
        }
        return response;
    }
    
    private void updateUserFromDto(Users user, UserRegistrationRequest dto) {
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());

        Roles role = rolesRepository.findByName(dto.getRole())
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + dto.getRole()));
        user.setRole(role);

        user.setGst(dto.getGst());
        user.setAddress(dto.getAddress());

        
    }
}