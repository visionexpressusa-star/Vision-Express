package com.ve.app.repository;

import com.ve.app.model.Prescription;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

	Optional<Prescription> findFirstByIntakeFormIdOrderByIdDesc(Long intakeFormId);
}
