package com.ve.app.repository;

import com.ve.app.model.LensRecommendation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LensRecommendationRepository extends JpaRepository<LensRecommendation, Long> {

	Optional<LensRecommendation> findByPrescriptionId(Long prescriptionId);
}
