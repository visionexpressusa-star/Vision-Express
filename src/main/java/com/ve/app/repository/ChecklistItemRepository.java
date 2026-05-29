package com.ve.app.repository;

import com.ve.app.model.ChecklistItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

	List<ChecklistItem> findAllByOrderBySortNumberAsc();
}
