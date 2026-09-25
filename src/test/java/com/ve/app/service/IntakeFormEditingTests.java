package com.ve.app.service;

import com.ve.app.model.IntakeForm;
import com.ve.app.model.ReferralSource;
import com.ve.app.repository.*;
import com.ve.app.web.form.CreateIntakeFormForm;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IntakeFormEditingTests {
    private static <T> T stub(Class<T> type) {
        return mock(type, withSettings().mockMaker("mock-maker-subclass"));
    }

    private final IntakeFormRepository intakes = stub(IntakeFormRepository.class);
    private final ChecklistItemRepository checklist = stub(ChecklistItemRepository.class);
    private final PrescriptionRepository prescriptions = stub(PrescriptionRepository.class);
    private final LensRecommendationRepository recommendations = stub(LensRecommendationRepository.class);
    private final ReferralSourceRepository referrals = stub(ReferralSourceRepository.class);
    private final IntakeFormService service = new IntakeFormService(intakes, checklist, prescriptions, recommendations, referrals);

    private IntakeForm existing() {
        ReferralSource referral = stub(ReferralSource.class);
        when(referral.getId()).thenReturn(3L);
        when(referrals.findById(3L)).thenReturn(Optional.of(referral));
        when(checklist.findAllByOrderBySortNumberAsc()).thenReturn(List.of());
        IntakeForm intake = new IntakeForm(100L, "Original", true, true, false, true, false,
                new BigDecimal("30.0"), new BigDecimal("31.0"), "20/20", "20/25", "20/30",
                "Insurance", referral, "Creator", LocalDateTime.of(2026, 1, 1, 12, 0));
        intake.setCreatedByUserId(7L);
        when(intakes.findById(1L)).thenReturn(Optional.of(intake));
        return intake;
    }

    @Test
    void ownerCanLoadAndSaveIntakeWithoutChangingAuditOrRefraction() {
        IntakeForm intake = existing();
        LocalDateTime createdOn = intake.getCreatedOn();
        CreateIntakeFormForm form = service.findEditableIntakeForm(1, 7L);
        assertEquals("100", form.getAccountId());
        assertEquals("31.0", form.getPdRight());
        assertEquals(3L, form.getReferralSourceId());
        assertTrue(form.isRetinalImagingRequired());
        form.setFullName("Updated");
        form.setAccountId("200");
        form.setDoingContactLens(true);
        service.updateIntakeForm(1, form, 7L);
        assertEquals("Updated", intake.getFullName());
        assertEquals(200L, intake.getAccountId());
        assertTrue(intake.isDoingContactLens());
        assertEquals("Creator", intake.getCreatedBy());
        assertEquals(7L, intake.getCreatedByUserId());
        assertEquals(createdOn, intake.getCreatedOn());
        verify(intakes).save(intake);
        verifyNoInteractions(prescriptions, recommendations);
    }

    @Test
    void nonOwnerCannotLoadOrSaveEvenWithDirectRequest() {
        existing();
        assertThrows(AccessDeniedException.class, () -> service.findEditableIntakeForm(1, 8L));
        assertThrows(AccessDeniedException.class, () -> service.updateIntakeForm(1, new CreateIntakeFormForm(), 8L));
        verify(intakes, never()).save(any());
        verifyNoInteractions(prescriptions, recommendations);
    }

    @Test
    void unidentifiedLegacyOwnerCannotEdit() {
        existing().setCreatedByUserId(null);
        assertThrows(AccessDeniedException.class, () -> service.findEditableIntakeForm(1, 7L));
        assertThrows(AccessDeniedException.class, () -> service.updateIntakeForm(1, new CreateIntakeFormForm(), null));
    }

    @Test
    void invalidInputLeavesExistingIntakeUntouched() {
        IntakeForm intake = existing();
        CreateIntakeFormForm form = service.findEditableIntakeForm(1, 7L);
        form.setFullName("Changed");
        form.setPdLeft("-1");
        assertThrows(IllegalArgumentException.class, () -> service.updateIntakeForm(1, form, 7L));
        assertEquals("Original", intake.getFullName());
        verify(intakes, never()).save(any());
        verifyNoInteractions(prescriptions, recommendations);
    }

    @Test
    void missingIntakeReturnsNotFound() {
        when(intakes.findById(99L)).thenReturn(Optional.empty());
        assertEquals(404, assertThrows(ResponseStatusException.class,
                () -> service.findEditableIntakeForm(99, 7L)).getStatusCode().value());
    }
}
