package com.vres.entity;

import java.time.LocalDateTime; // MODIFIED: Changed from java.sql.Date

import org.hibernate.annotations.CreationTimestamp; // ADDED: For auto-timestamping

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="users")
public class Users {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column
	private int id;
	@Column
	private String name;
	@ManyToOne
    @JoinColumn(name = "role_id")
	private Roles role;
	@Column
	private String email;
	@Column
	private String phone;
	@Column(name="vendor_gst")
	private String gst;
	@Column(name="vendor_address")
	private String address;
	@Column
	private String password;
	@Column
	private boolean is_active;

    // --- MODIFIED SECTION START ---
    @CreationTimestamp // This annotation automatically sets the timestamp when a user is created
    @Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt; // The field type is changed and renamed to follow convention
    // --- MODIFIED SECTION END ---
	
	public Users() {}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Roles getRole() {
		return role;
	}

	public void setRole(Roles role) {
		this.role = role;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getGst() {
		return gst;
	}

	public void setGst(String gst) {
		this.gst = gst;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean isIs_active() {
		return is_active;
	}

	public void setIs_active(boolean is_active) {
		this.is_active = is_active;
	}

    // --- MODIFIED: Getter and setter for the new field ---
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}

