package com.vres.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vres.entity.ProjectUser;

public interface ProjectUserRepository extends JpaRepository<ProjectUser, Integer> {
	List<ProjectUser> findAllByUserId(Integer userId);
	Optional<ProjectUser> findAllByProjectId(Integer projectId);
	List<ProjectUser> findByProjectId(Integer projectId);
}
