package com.ve.app.service;

import com.ve.app.web.form.OpticalEstimateForm;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OpticalEstimateSunglassesTests {
    private final OpticalEstimateService service = new OpticalEstimateService();
    private final OpticalStoreConfig config = new OpticalStoreConfig();

    private OpticalEstimateForm frame() {
        OpticalEstimateForm form = new OpticalEstimateForm();
        form.setBuyingFrame(true);
        form.setFramePrice(new BigDecimal("100.00"));
        form.setSunglasses(true);
        return form;
    }

    @Test
    void addsTaxWhenCheckedAndRemovesItWhenUnchecked() {
        OpticalEstimateForm form = frame();
        OpticalEstimateResult result = service.calculate(form, config);
        assertEquals(new BigDecimal("8.25"), result.getSalesTax());
        assertEquals(new BigDecimal("108.25"), result.getTotal());
        assertEquals(new BigDecimal("108.25"), result.getSubtotal());
        form.setSunglasses(false);
        result = service.calculate(form, config);
        assertEquals(new BigDecimal("0.00"), result.getSalesTax());
        assertEquals(new BigDecimal("100.00"), result.getTotal());
    }

    @Test
    void taxesFullFramePriceBeforeDiscount() {
        OpticalEstimateForm form = frame();
        form.setBuyingLenses(true);
        form.setBuyingEyeExam(true);
        form.setLensTypeName("Lens");
        form.setSelectedFrameDiscountPercent(new BigDecimal("20"));
        config.setLensPrices(List.of(new LensPrice("Lens", new BigDecimal("200"))));
        OpticalEstimateResult result = service.calculate(form, config);
        assertEquals(new BigDecimal("8.25"), result.getSalesTax());
        assertEquals(new BigDecimal("198.25"), result.getTotal());
        assertEquals(new BigDecimal("403.25"), result.getSubtotal());
        assertEquals("Frame", result.getLineItems().get(1).label());
        assertEquals("Sales tax (8.25%)", result.getLineItems().get(2).label());
        assertEquals(result.getTotal(), result.getSubtotal().subtract(result.getTotalDiscount()));
    }

    @Test
    void handlesInsuranceAndRoundsToCents() {
        OpticalEstimateForm form = frame();
        form.setHasInsurance(true);
        form.setInsuranceDiscount(new BigDecimal("10"));
        form.setFramePrice(new BigDecimal("99.99"));
        OpticalEstimateResult result = service.calculate(form, config);
        assertEquals(new BigDecimal("8.25"), result.getSalesTax());
        assertEquals(new BigDecimal("98.24"), result.getTotal());
    }

    @Test
    void ignoresUnselectedFrameButTaxesFullyDiscountedFrame() {
        OpticalEstimateForm form = frame();
        form.setBuyingFrame(false);
        assertEquals(new BigDecimal("0.00"), service.calculate(form, config).getSalesTax());
        form.setBuyingFrame(true);
        form.setBuyingLenses(true);
        form.setPrescriptionSource("OUTSIDE_RX");
        form.setSelectedFrameDiscountPercent(new BigDecimal("100"));
        OpticalEstimateResult result = service.calculate(form, config);
        assertEquals(new BigDecimal("8.25"), result.getSalesTax());
        assertEquals(new BigDecimal("8.25"), result.getTotal());
        form.setFramePrice(BigDecimal.ZERO);
        assertEquals(new BigDecimal("0.00"), service.calculate(form, config).getSalesTax());
    }
}
