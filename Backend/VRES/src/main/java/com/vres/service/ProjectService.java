package com.vres.service;
 
import java.io.IOException;
import java.io.InputStream;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
 
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
 
import com.google.zxing.WriterException;
import com.vres.dto.ApproverPairDto;
import com.vres.dto.BeneficiaryDto;
import com.vres.dto.CoordinatorDto;
import com.vres.dto.ProjectDetailsCreationRequest;
import com.vres.dto.ProjectInitiationRequest;
import com.vres.dto.ProjectResponse;
import com.vres.dto.VoucherCreationRequest;
import com.vres.entity.Beneficiaries;
import com.vres.entity.Department;
import com.vres.entity.ProjectUser;
import com.vres.entity.Projects;
import com.vres.entity.Roles;
import com.vres.entity.Users;
import com.vres.entity.Vouchers;
import com.vres.generator.CodeGeneratorService;
import com.vres.generator.QRCodeGenerator;
import com.vres.repository.BeneficiariesRepository;
import com.vres.repository.DepartmentRepository;
import com.vres.repository.ProjectUserRepository;
import com.vres.repository.ProjectsRepository;
import com.vres.repository.RolesRepository;
import com.vres.repository.UsersRepository;
import com.vres.repository.VouchersRepository;
 
import jakarta.persistence.EntityNotFoundException;
 
@Service
public class ProjectService {
 
	@Autowired
	private ProjectsRepository projectsRepository;
	@Autowired
	private UsersRepository usersRepository;
	@Autowired
	private BeneficiariesRepository beneficiariesRepository;
	@Autowired
	private RolesRepository rolesRepository;
	@Autowired
	private DepartmentRepository departmentRepository;
 
	@Autowired
	private ProjectUserRepository projectUserRepository;
    
    @Autowired
    private VouchersRepository vouchersRepository;
    
    @Autowired
    private SnsService snsService;
    
    @Autowired
    private CodeGeneratorService codeGeneratorService;
 
	public List<ProjectResponse> getAllProjects() {
		return projectsRepository.findAll().stream()
				.map(this::convertToProjectResponse)
				.collect(Collectors.toList());
	}
 
	public List<CoordinatorDto> getProjectCoordinators() {
		Roles coordinatorRole = rolesRepository.findByName("project_coordinator")
				.orElseThrow(() -> new EntityNotFoundException("Role 'project_coordinator' not found. Please seed the database."));
		List<Users> coordinators = usersRepository.findByRole(coordinatorRole);
		return coordinators.stream()
				.map(this::convertToCoordinatorDto)
				.collect(Collectors.toList());
	}
	
	@Transactional
	public ProjectResponse initiateProject(ProjectInitiationRequest request) {
		Users existingCoordinator = usersRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new EntityNotFoundException(
						"Project Coordinator user not found with email: " + request.getEmail() + ". User must be registered first."
				));
 
		Projects newProject = new Projects();
		newProject.setTitle(request.getTitle());
		newProject.setDescription("");
		newProject.setStatus("Draft");
 
		Projects savedProject = projectsRepository.save(newProject);
 
		ProjectUser projectUserMapping = new ProjectUser();
		projectUserMapping.setUserId(existingCoordinator.getId());
		projectUserMapping.setProjectId(savedProject.getId());
		projectUserRepository.save(projectUserMapping);
 
		return convertToProjectResponse(savedProject);
	}
	
	@Transactional
	public void defineProjectDetails(int projectId, ProjectDetailsCreationRequest request) {
		Projects project = projectsRepository.findById(projectId)
				.orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
 
		project.setDescription(request.getProjectDescription());
		project.setStart_date(Date.valueOf(request.getStartDate()));
		project.setEnd_date(Date.valueOf(request.getRegistrationEndDate()));
 
		if (request.getCoordinatorEmail() != null && !request.getCoordinatorEmail().isEmpty()) {
			Users newCoordinator = usersRepository.findByEmail(request.getCoordinatorEmail())
					.orElseThrow(() -> new EntityNotFoundException("Coordinator user not found with email: " + request.getCoordinatorEmail()));
			
			List<ProjectUser> mappings = projectUserRepository.findByProjectId(project.getId());
			ProjectUser mapping = mappings.isEmpty() ? new ProjectUser() : mappings.get(0);
			mapping.setUserId(newCoordinator.getId());
			mapping.setProjectId(project.getId());
			projectUserRepository.save(mapping);
		}
 
		if (request.getApprovers() != null) {
			departmentRepository.deleteByProjectId(projectId);
 
			List<Department> newDepartments = new ArrayList<>();
			for (ApproverPairDto pair : request.getApprovers()) {
				Department newDepartment = new Department();
				newDepartment.setProject(project);
				newDepartment.setMakerId(pair.getMakerId());
				newDepartment.setCheckerId(pair.getCheckerId());
				newDepartments.add(newDepartment);
			}
 
			if (!newDepartments.isEmpty()) {
				departmentRepository.saveAll(newDepartments);
			}
		}
 
		projectsRepository.save(project);
	}
 
	@Transactional
	public void processBeneficiaryUpload(int projectId, int departmentId, MultipartFile[] files) {
		Projects project = projectsRepository.findById(projectId)
				.orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
 
		Department department = departmentRepository.findById(departmentId)
				.orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + departmentId));
 
		if (files == null || files.length == 0) {
			throw new IllegalStateException("No files were uploaded.");
		}
 
		List<Beneficiaries> allBeneficiariesToSave = new ArrayList<>();
 
		for (MultipartFile file : files) {
			if (file.isEmpty()) {
				System.err.println("Skipping empty file: " + file.getOriginalFilename());
				continue;	
			}
 
			try (InputStream inputStream = file.getInputStream()) {
				Workbook workbook = WorkbookFactory.create(inputStream);
				Sheet sheet = workbook.getSheetAt(0);
 
				for (Row row : sheet) {
					if (row.getRowNum() == 0) { // Skip header row
						continue;
					}
 
					String name = getCellValueAsString(row.getCell(0));
					String phone = getCellValueAsString(row.getCell(1));
 
					if (name == null || name.trim().isEmpty() || phone == null || phone.trim().isEmpty()) {
						System.err.println("Skipping invalid row " + (row.getRowNum() + 1) + " in file " + file.getOriginalFilename());
						continue;
					}
 
					Beneficiaries newBeneficiary = new Beneficiaries();
					newBeneficiary.setName(name);
					newBeneficiary.setPhone(phone);
					newBeneficiary.setIs_approved(false); // Default to pending approval
					newBeneficiary.setProject(project);
					newBeneficiary.setDepartment(department);
 
					allBeneficiariesToSave.add(newBeneficiary);
				}
 
			} catch (IOException e) {
				throw new RuntimeException("Failed to parse Excel file " + file.getOriginalFilename() + ": " + e.getMessage(), e);
			}
		}
 
		if (!allBeneficiariesToSave.isEmpty()) {
			beneficiariesRepository.saveAll(allBeneficiariesToSave);
		}
	}
	
	// --- HELPER for Excel parsing ---
	private String getCellValueAsString(Cell cell) {
		if (cell == null) {
			return null;
		}
		switch (cell.getCellType()) {
			case STRING:
				return cell.getStringCellValue();
			case NUMERIC:
				return String.format("%.0f", cell.getNumericCellValue());
			case BOOLEAN:
				return String.valueOf(cell.getBooleanCellValue());
			case FORMULA:
				return cell.getCachedFormulaResultType().toString();
			default:
				return null;
		}
	}
	
	// ============================================================================================
	// === NEW METHOD ADDED TO SOLVE THE ISSUE ====================================================
	// ============================================================================================
	/**
	 * Gets a list of ONLY APPROVED beneficiaries for a project.
	 * Use this method for screens where you need to select beneficiaries for vouchers.
	 * * @param projectId The ID of the project.
	 * @param departmentId Optional department ID to filter by. Can be null.
	 * @return A list of approved beneficiaries.
	 */
	public List<BeneficiaryDto> getApprovedBeneficiariesForProject(int projectId, Integer departmentId) {
		// 1. Ensure the project exists
		projectsRepository.findById(projectId)
				.orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
 
		// 2. Call the repository method, but always pass 'true' for the isApproved status
		List<Beneficiaries> beneficiaries = beneficiariesRepository.findByProjectAndFilters(projectId, true, departmentId);
		
		// 3. Convert to DTO and return
		return beneficiaries.stream()
			.map(this::convertBeneficiaryToDto)
			.collect(Collectors.toList());
	}
 
 
	// --- Original methods are left unchanged for other uses ---
 
	public List<BeneficiaryDto> getBeneficiariesForProjectAndDepartment(int projectId, String status, Integer departmentId) {
		projectsRepository.findById(projectId)
				.orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
 
		Boolean isApproved = null;
		if (status != null && !status.isEmpty()) {
			if ("active".equalsIgnoreCase(status)) {
				isApproved = true;
			} else if ("pending_approval".equalsIgnoreCase(status)) {
				isApproved = false;
			}
		}
 
		List<Beneficiaries> beneficiaries = beneficiariesRepository.findByProjectAndFilters(projectId, isApproved, departmentId);
		
		return beneficiaries.stream()
			.map(this::convertBeneficiaryToDto)
			.collect(Collectors.toList());
	}
	
	public List<BeneficiaryDto> getBeneficiariesForProject(int projectId, String status) {
		projectsRepository.findById(projectId)
				.orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
 
		Boolean isApproved = null;
		if (status != null && !status.isEmpty()) {
			if ("active".equalsIgnoreCase(status)) {
				isApproved = true;
			} else if ("pending_approval".equalsIgnoreCase(status)) {
				isApproved = false;
			}
		}
 
		List<Beneficiaries> beneficiaries = beneficiariesRepository.findByProject(projectId, isApproved);
		
		return beneficiaries.stream()
			.map(this::convertBeneficiaryToDto)
			.collect(Collectors.toList());
	}
 
	public Optional<Projects> getProject(int projectId) {
		return projectsRepository.findById(projectId);
	}
 
	@Transactional
    public void createVouchersForProject(int projectId, VoucherCreationRequest request) {
        String uniqueVoucherCode;
        Vouchers existingVoucher;
 
        do {
            uniqueVoucherCode = codeGeneratorService.generateUniqueCode();
            existingVoucher = vouchersRepository.findByStringCode(uniqueVoucherCode).orElse(null);
        } while (existingVoucher != null);
 
        byte[] qrCodeBytes;
        try {
            int size = 300;
            qrCodeBytes = QRCodeGenerator.generateQRCodeImage(uniqueVoucherCode, size, size);
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR Code image.", e);
        }
 
        Projects project = projectsRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
 
        List<Beneficiaries> beneficiaries = beneficiariesRepository.findAllById(request.getBeneficiaryIds());
        if (beneficiaries.size() != request.getBeneficiaryIds().size()) {
            throw new EntityNotFoundException("One or more beneficiaries could not be found.");
        }
 
        project.setVoucher_points(request.getVoucherPoints());
        project.setVoucher_valid_from(Date.valueOf(request.getValidityStart()));
        project.setVoucher_valid_till(Date.valueOf(request.getValidityEnd()));
        projectsRepository.save(project);
 
        for (Beneficiaries beneficiary : beneficiaries) {
            Vouchers newVoucher = new Vouchers();
            newVoucher.setProject(project);
            newVoucher.setBeneficiary(beneficiary);
            newVoucher.setStatus("ISSUED");
            newVoucher.setStringCode(uniqueVoucherCode);
            newVoucher.setIssuedAt(new Date(System.currentTimeMillis()));
            newVoucher.setQrCodeImage(qrCodeBytes);
            vouchersRepository.save(newVoucher);
 
            try {
                String phoneNumber = beneficiary.getPhone();
                if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
                    String message = "Dear " + beneficiary.getName() +
                            ", your voucher has been issued.\n" +
                            "Voucher Code: " + uniqueVoucherCode + "\n" +
                            "Points: " + request.getVoucherPoints() + "\n" +
                            "Valid: " + request.getValidityStart() + " to " + request.getValidityEnd();
                    snsService.publishSmsDirect(phoneNumber, message);
                } else {
                    System.err.println("Skipping SMS: No valid phone number for beneficiary " + beneficiary.getName());
                }
            } catch (Exception e) {
                System.err.println("Failed to send SMS to " + beneficiary.getName() + ": " + e.getMessage());
            }
        }
    }
 
	private ProjectResponse convertToProjectResponse(Projects project) {
		ProjectResponse res = new ProjectResponse();
		res.setProjectId(project.getId());
		res.setTitle(project.getTitle());
		res.setStatus(project.getStatus());
 
		List<ProjectUser> mappings = projectUserRepository.findByProjectId(project.getId());
		if (!mappings.isEmpty()) {
			res.setCoordinatorId(mappings.get(0).getUserId());
		}
		
		return res;
	}
 
	private BeneficiaryDto convertBeneficiaryToDto(Beneficiaries beneficiary) {
		BeneficiaryDto dto = new BeneficiaryDto();
		dto.setBeneficiaryId(beneficiary.getId());
		dto.setName(beneficiary.getName());
		dto.setPhone(beneficiary.getPhone());
		dto.setStatus(beneficiary.isIs_approved() ? "active" : "pending_approval");
		if (beneficiary.getDepartment() != null) {
			dto.setDepartmentId(beneficiary.getDepartment().getId());
		}
		return dto;
	}
	
	private CoordinatorDto convertToCoordinatorDto(Users user) {
		CoordinatorDto dto = new CoordinatorDto();
		dto.setName(user.getName());
		dto.setEmail(user.getEmail());
		dto.setPhone(user.getPhone());
		return dto;
	}
}