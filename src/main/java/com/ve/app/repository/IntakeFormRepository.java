package com.ve.app.repository;

import com.ve.app.model.IntakeForm;
import com.ve.app.web.view.IntakeFormListItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IntakeFormRepository extends JpaRepository<IntakeForm, Long> {

	@Query("""
			SELECT i
			FROM IntakeForm i
			WHERE :search = ''
			   OR str(i.accountId) LIKE concat('%', :search, '%')
			   OR LOWER(i.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
			ORDER BY i.createdOn DESC, i.id DESC
			""")
	Page<IntakeForm> search(@Param("search") String search, Pageable pageable);

	@Query("""
			SELECT new com.ve.app.web.view.IntakeFormListItem(
				i.id,
				i.accountId,
				i.fullName,
				i.createdBy,
				i.createdOn,
				p.prescribedBy)
			FROM IntakeForm i
			LEFT JOIN Prescription p
				ON p.intakeForm = i
			   AND p.id = (
					SELECT MAX(latest.id)
					FROM Prescription latest
					WHERE latest.intakeForm = i
			   )
			WHERE :search = ''
			   OR str(i.accountId) LIKE concat('%', :search, '%')
			   OR LOWER(i.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
			ORDER BY i.createdOn DESC, i.id DESC
			""")
	Page<IntakeFormListItem> searchListItems(@Param("search") String search, Pageable pageable);
}
