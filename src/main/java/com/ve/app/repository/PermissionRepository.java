package com.ve.app.repository;

import com.ve.app.model.Permission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

	List<Permission> findAllByNameNotOrderByNameAsc(String name);

	List<Permission> findAllByIdInAndNameNot(List<Long> ids, String name);
}
