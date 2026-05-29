package com.ve.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "checklist_items")
public class ChecklistItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "sort_number", nullable = false)
	private int sortNumber;

	@Column(name = "checklist_item", nullable = false, columnDefinition = "TEXT")
	private String checklistItem;

	protected ChecklistItem() {
	}

	public Long getId() {
		return id;
	}

	public int getSortNumber() {
		return sortNumber;
	}

	public String getChecklistItem() {
		return checklistItem;
	}
}
