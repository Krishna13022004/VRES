package com.vres.entity;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType; // <-- NEW IMPORT
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="vouchers")
public class Vouchers {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column
	private Integer id;
	
	@ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
	private Projects project;
	
	@ManyToOne
    @JoinColumn(name = "beneficiary_id")
	private Beneficiaries beneficiary;

	@Column(name="string_code", unique = true, nullable = false) 
	private String stringCode; 

	@Lob
    @Column(name="qr_code", columnDefinition = "LONGBLOB") 
    @jakarta.persistence.Basic(fetch = FetchType.EAGER) // <-- EAGERLY LOAD THE BYTES
	private byte[] qrCodeImage;
	
	@Column(nullable = false)
	private String status;
	
	@Column(name="issued_at")
	private Date issuedAt;
	
// ... (rest of the getters and setters remain the same) ...

	public Vouchers() {}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Projects getProject() {
		return project;
	}

	public void setProject(Projects project) {
		this.project = project;
	}

	public Beneficiaries getBeneficiary() {
		return beneficiary;
	}

	// FIX 3: Setter uses the Beneficiaries entity object
	public void setBeneficiary(Beneficiaries beneficiary) {
		this.beneficiary = beneficiary;
	}

	public String getStringCode() {
		return stringCode;
	}

	public void setStringCode(String stringCode) {
		this.stringCode = stringCode;
	}

	// FIX 4: Corrected getter/setter names to match service's expected calls
	public byte[] getQrCodeImage() { 
		return qrCodeImage;
	}

	public void setQrCodeImage(byte[] qrCodeImage) { 
		this.qrCodeImage = qrCodeImage;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Date getIssuedAt() {
		return issuedAt;
	}

	public void setIssuedAt(Date issuedAt) {
		this.issuedAt = issuedAt;
	}
}
