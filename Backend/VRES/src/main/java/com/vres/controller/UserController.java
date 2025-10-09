package com.vres.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vres.dto.CoordinatorDto; // <-- NEW IMPORT
import com.vres.dto.GenericResponse;
import com.vres.dto.UserRegistrationRequest;
import com.vres.dto.UserResponse;
import com.vres.service.UserService;

@RestController
@RequestMapping("/vres/users")
@CrossOrigin(origins={"http://localhost:3000", "http://vres.s3-website-us-west-1.amazonaws.com"})
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsersByRole(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Integer projectId) { // <-- ADD projectId
        
        List<UserResponse> users = userService.getAllUsersByRole(role, projectId); // <-- PASS projectId
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<UserResponse> onboardUser(@RequestBody UserRegistrationRequest request) {
        UserResponse newUser = userService.onboardUser(request);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable int userId) {
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    
    @PutMapping("/{userId}")
    public ResponseEntity<GenericResponse> updateUser(@PathVariable int userId, @RequestBody UserRegistrationRequest request) {
        userService.updateUser(userId, request);
        return ResponseEntity.ok(new GenericResponse("User updated successfully"));
    }
    
    // --- NEW ENDPOINT FOR PROJECT COORDINATOR DROPDOWN ---
    /**
     * Endpoint to fetch all users who have the 'project_coordinator' role.
     * Maps to GET /vres/users/coordinators
     */
    @GetMapping("/coordinators")
    public ResponseEntity<List<CoordinatorDto>> getAllProjectCoordinators() {
        // Calls the new method in the UserService to fetch coordinators
        List<CoordinatorDto> coordinators = userService.getProjectCoordinators();
        return ResponseEntity.ok(coordinators);
    }
    // -----------------------------------------------------
}