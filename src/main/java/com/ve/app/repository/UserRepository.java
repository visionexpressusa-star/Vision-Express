package com.ve.app.repository;

import com.ve.app.model.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

	@EntityGraph(attributePaths = {"role", "permissions"})
	Optional<User> findByUsername(String username);

	@EntityGraph(attributePaths = "permissions")
	@Query("SELECT u FROM User u WHERE u.id = :id")
	Optional<User> findByIdWithPermissions(@Param("id") Long id);

	boolean existsByUsername(String username);

	@EntityGraph(attributePaths = "role")
	@Query("""
			SELECT u
			FROM User u
			WHERE :search = ''
			   OR str(u.id) LIKE concat('%', :search, '%')
			   OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
			   OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :search, '%'))
			ORDER BY u.id ASC
			""")
	Page<User> search(@Param("search") String search, Pageable pageable);
}
