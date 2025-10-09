package com.vres.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vres.dto.DepartmentRequest;
import com.vres.dto.DepartmentResponse;
import com.vres.entity.Department;
import com.vres.entity.Projects;
import com.vres.repository.DepartmentRepository;
import com.vres.repository.ProjectsRepository;
import com.vres.repository.UsersRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private ProjectsRepository projectsRepository; 

    // MODIFIED: Method name and return type updated
    public List<DepartmentResponse> getAllDepartmentsForProject(int projectId) {
        // This requires a findByProjectId method in your DepartmentRepository
        return departmentRepository.findByProjectId(projectId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // MODIFIED: Method name and return type updated
    public DepartmentResponse getDepartmentById(int departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + departmentId));
        return convertToResponse(department);
    }

    // MODIFIED: Method name and parameters updated
    public DepartmentResponse onboardDepartment(int projectId, DepartmentRequest request) {
        Projects project = projectsRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        if (!usersRepository.existsById(request.getCheckerUserId())) {
            throw new EntityNotFoundException("Checker user not found with id: " + request.getCheckerUserId());
        }
        if (!usersRepository.existsById(request.getMakerUserId())) {
            throw new EntityNotFoundException("Maker user not found with id: " + request.getMakerUserId());
        }

        Department department = new Department();
        department.setCheckerId(request.getCheckerUserId());
        department.setMakerId(request.getMakerUserId());
        department.setProject(project); 

        Department savedDepartment = departmentRepository.save(department);
        return convertToResponse(savedDepartment);
    }

    // MODIFIED: Method name and parameters updated
    public DepartmentResponse updateDepartment(int departmentId, DepartmentRequest request) {
        Department existingDepartment = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + departmentId));

        if (!usersRepository.existsById(request.getCheckerUserId())) {
            throw new EntityNotFoundException("Checker user not found with id: " + request.getCheckerUserId());
        }
        if (!usersRepository.existsById(request.getMakerUserId())) {
            throw new EntityNotFoundException("Maker user not found with id: " + request.getMakerUserId());
        }
        
        existingDepartment.setCheckerId(request.getCheckerUserId());
        existingDepartment.setMakerId(request.getMakerUserId());

        Department updatedDepartment = departmentRepository.save(existingDepartment);
        return convertToResponse(updatedDepartment);
    }

    // MODIFIED: Helper method updated to use DepartmentResponse
    private DepartmentResponse convertToResponse(Department department) {
        DepartmentResponse response = new DepartmentResponse();
        response.setDepartmentId(department.getId());
        response.setCheckerUserId(department.getCheckerId());
        response.setMakerUserId(department.getMakerId());
        return response;
    }
}

