package com.vres.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.vres.entity.Projects;

public interface ProjectsRepository extends JpaRepository<Projects, Integer> {
	

}
