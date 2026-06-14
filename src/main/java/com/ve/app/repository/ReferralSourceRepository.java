package com.ve.app.repository;

import com.ve.app.model.ReferralSource;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferralSourceRepository extends JpaRepository<ReferralSource, Long> {

	List<ReferralSource> findAllByOrderByIdAsc();
}
