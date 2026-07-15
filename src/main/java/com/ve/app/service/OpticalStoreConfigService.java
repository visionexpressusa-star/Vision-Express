package com.ve.app.service;

import com.ve.app.model.OpticalFrameDiscountOption;
import com.ve.app.model.OpticalLensOptionCharge;
import com.ve.app.model.OpticalLensPrice;
import com.ve.app.model.OpticalLensProtectionCoating;
import com.ve.app.model.OpticalLensTransitionOption;
import com.ve.app.model.OpticalStoreConfigEntity;
import com.ve.app.repository.OpticalStoreConfigRepository;
import com.ve.app.web.form.FrameDiscountOptionForm;
import com.ve.app.web.form.LensOptionChargeForm;
import com.ve.app.web.form.LensPriceForm;
import com.ve.app.web.form.LensProtectionCoatingForm;
import com.ve.app.web.form.LensTransitionOptionForm;
import com.ve.app.web.form.OpticalStoreConfigForm;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OpticalStoreConfigService {

	private static final long CONFIG_ID = 1L;

	private final OpticalStoreConfigRepository configRepository;

	public OpticalStoreConfigService(OpticalStoreConfigRepository configRepository) {
		this.configRepository = configRepository;
	}

	@Transactional
	public OpticalStoreConfig getConfig() {
		return toConfig(findOrCreateConfig());
	}

	@Transactional
	public OpticalStoreConfigForm getConfigForm() {
		OpticalStoreConfig current = toConfig(findOrCreateConfig());
		OpticalStoreConfigForm form = new OpticalStoreConfigForm();
		form.setEyeExamPrice(current.getEyeExamPrice());
		form.setExamDiscountWithCompleteGlasses(current.getExamDiscountWithCompleteGlasses());
		form.setOutsidePrescriptionDiscount(current.getOutsidePrescriptionDiscount());
		form.setLensDiscountWithoutInsurance(current.getLensDiscountWithoutInsurance());
		form.setPofCharge(current.getPofCharge());
		form.setFrameDiscountOptions(current.getFrameDiscountOptions().stream()
				.map(FrameDiscountOptionForm::new)
				.toList());
		form.setLensOptionCharges(current.getLensOptionCharges().stream()
				.map(option -> new LensOptionChargeForm(option.name(), option.charge()))
				.toList());
		form.setLensProtectionCoatings(current.getLensProtectionCoatings().stream()
				.map(coating -> new LensProtectionCoatingForm(coating.name(), coating.price()))
				.toList());
		form.setLensTransitionOptions(current.getLensTransitionOptions().stream()
				.map(option -> new LensTransitionOptionForm(option.name(), option.price()))
				.toList());
		form.setLensPrices(current.getLensPrices().stream()
				.map(lens -> new LensPriceForm(lens.name(), lens.price()))
				.toList());
		return form;
	}

	@Transactional
	public void updateConfig(OpticalStoreConfigForm form) {
		OpticalStoreConfigEntity entity = findOrCreateConfig();
		entity.setEyeExamPrice(moneyOrZero(form.getEyeExamPrice()));
		entity.setExamDiscountWithCompleteGlasses(moneyOrZero(form.getExamDiscountWithCompleteGlasses()));
		entity.setOutsidePrescriptionDiscount(moneyOrZero(form.getOutsidePrescriptionDiscount()));
		entity.setLensDiscountWithoutInsurance(moneyOrZero(form.getLensDiscountWithoutInsurance()));
		entity.setPofCharge(moneyOrZero(form.getPofCharge()));

		List<BigDecimal> frameDiscounts = nullToList(form.getFrameDiscountOptions()).stream()
				.map(FrameDiscountOptionForm::getPercent)
				.filter(percent -> percent != null)
				.map(this::moneyOrZero)
				.toList();
		List<LensOptionCharge> lensOptionCharges = nullToList(form.getLensOptionCharges()).stream()
				.filter(option -> option.getName() != null && !option.getName().isBlank())
				.map(option -> new LensOptionCharge(option.getName().trim(), moneyOrZero(option.getCharge())))
				.toList();
		List<LensPrice> lensPrices = nullToList(form.getLensPrices()).stream()
				.filter(lens -> lens.getName() != null && !lens.getName().isBlank())
				.map(lens -> new LensPrice(lens.getName().trim(), moneyOrZero(lens.getPrice())))
				.toList();
		List<LensProtectionCoating> lensProtectionCoatings = nullToList(form.getLensProtectionCoatings()).stream()
				.filter(coating -> coating.getName() != null && !coating.getName().isBlank())
				.map(coating -> new LensProtectionCoating(coating.getName().trim(), moneyOrZero(coating.getPrice())))
				.toList();
		List<LensTransitionOption> lensTransitionOptions = nullToList(form.getLensTransitionOptions()).stream()
				.filter(option -> option.getName() != null && !option.getName().isBlank())
				.map(option -> new LensTransitionOption(option.getName().trim(), moneyOrZero(option.getPrice())))
				.toList();

		replaceFrameDiscountOptions(entity, frameDiscounts);
		replaceLensOptionCharges(entity, lensOptionCharges);
		replaceLensProtectionCoatings(entity, lensProtectionCoatings);
		replaceLensTransitionOptions(entity, lensTransitionOptions);
		replaceLensPrices(entity, lensPrices);
		configRepository.save(entity);
	}

	private OpticalStoreConfig defaultConfig() {
		OpticalStoreConfig defaultConfig = new OpticalStoreConfig();
		defaultConfig.setFrameDiscountOptions(List.of(new BigDecimal("10"), new BigDecimal("20"), new BigDecimal("30")));
		defaultConfig.setLensOptionCharges(List.of(
				new LensOptionCharge("Regular", new BigDecimal("0.00")),
				new LensOptionCharge("Rimless", new BigDecimal("49.99")),
				new LensOptionCharge("Extra large frame", new BigDecimal("39.99")),
				new LensOptionCharge("Safety lens", new BigDecimal("49.99")),
				new LensOptionCharge("Curve lens (frame)", new BigDecimal("39.99"))));
		defaultConfig.setLensProtectionCoatings(List.of(
				new LensProtectionCoating("SV - UV/AR/Anti-Scratch", new BigDecimal("79.99")),
				new LensProtectionCoating("BF/P - UV/AR/Anti-Scratch", new BigDecimal("89.99")),
				new LensProtectionCoating("SV - Blue Shield + UV/AR/Anti-Scratch", new BigDecimal("109.99")),
				new LensProtectionCoating("BF/P - Blue Shield + UV/AR/Anti-Scratch", new BigDecimal("149.99"))));
		defaultConfig.setLensTransitionOptions(List.of(
				new LensTransitionOption("Regular (Gray/Brown)", new BigDecimal("129.99")),
				new LensTransitionOption("Regular (Blue/Green - only for progressive)", new BigDecimal("129.99")),
				new LensTransitionOption("Extra Dark (Gray for progressive only)", new BigDecimal("169.99")),
				new LensTransitionOption("Polorized Gray/Brown", new BigDecimal("129.99")),
				new LensTransitionOption("Blue/Green", new BigDecimal("149.99")),
				new LensTransitionOption("Solid Color", new BigDecimal("89.99")),
				new LensTransitionOption("Gradiant", new BigDecimal("99.99"))));
		defaultConfig.setLensPrices(List.of(
				new LensPrice("Single Vision - CR39 Plastic", new BigDecimal("219.99")),
				new LensPrice("Single Vision - Poly HD", new BigDecimal("249.99")),
				new LensPrice("Single Vision - Poly Plus Aspheric HD", new BigDecimal("269.99")),
				new LensPrice("Single Vision - Hi Index Ultra HD 1.67", new BigDecimal("319.99")),
				new LensPrice("Single Vision - Hi Index Ultra HD 1.74 Without Cyl", new BigDecimal("369.99")),
				new LensPrice("Single Vision - Hi Index Ultra HD 1.74 With Cyl", new BigDecimal("469.99")),
				new LensPrice("Bifocal With Line - CR39 Plastic", new BigDecimal("339.99")),
				new LensPrice("Bifocal With Line - Poly HD", new BigDecimal("359.99")),
				new LensPrice("Bifocal With Line - Poly Plus Aspheric HD", new BigDecimal("379.99")),
				new LensPrice("Bifocal With Line - Hi Index Ultra HD 1.67", new BigDecimal("419.99")),
				new LensPrice("Bifocal With Line - Hi Index Ultra HD 1.74 Without Cyl", new BigDecimal("469.99")),
				new LensPrice("Bifocal With Line - Hi Index Ultra HD 1.74 With Cyl", new BigDecimal("539.99")),
				new LensPrice("Blended Bifocal No Line - CR39 Plastic", new BigDecimal("389.99")),
				new LensPrice("Blended Bifocal No Line - Poly HD", new BigDecimal("409.99")),
				new LensPrice("Blended Bifocal No Line - Poly Plus Aspheric HD", new BigDecimal("429.99")),
				new LensPrice("Blended Bifocal No Line - Hi Index Ultra HD 1.67", new BigDecimal("469.99")),
				new LensPrice("Blended Bifocal No Line - Hi Index Ultra HD 1.74 Without Cyl", new BigDecimal("519.99")),
				new LensPrice("Blended Bifocal No Line - Hi Index Ultra HD 1.74 With Cyl", new BigDecimal("589.99")),
				new LensPrice("Standard Progressive No Line - CR39 Plastic", new BigDecimal("359.99")),
				new LensPrice("Standard Progressive No Line - Poly HD", new BigDecimal("379.99")),
				new LensPrice("Standard Progressive No Line - Poly Plus Aspheric HD", new BigDecimal("399.99")),
				new LensPrice("Standard Progressive No Line - Hi Index Ultra HD 1.67", new BigDecimal("439.99")),
				new LensPrice("Standard Progressive No Line - Hi Index Ultra HD 1.74 Without Cyl", new BigDecimal("489.99")),
				new LensPrice("Standard Progressive No Line - Hi Index Ultra HD 1.74 With Cyl", new BigDecimal("589.99")),
				new LensPrice("Advanced Progressive No Line - Optimized Add-on", new BigDecimal("49.99")),
				new LensPrice("Advanced Progressive No Line - Customized Add-on", new BigDecimal("59.99")),
				new LensPrice("Advanced Progressive No Line - Personalized Add-on", new BigDecimal("69.99"))));
		return defaultConfig;
	}

	private OpticalStoreConfigEntity findOrCreateConfig() {
		return configRepository.findById(CONFIG_ID).orElseGet(() -> {
			OpticalStoreConfig defaultConfig = defaultConfig();
			OpticalStoreConfigEntity entity = new OpticalStoreConfigEntity(
					CONFIG_ID,
					defaultConfig.getEyeExamPrice(),
					defaultConfig.getExamDiscountWithCompleteGlasses(),
					defaultConfig.getOutsidePrescriptionDiscount(),
					defaultConfig.getLensDiscountWithoutInsurance(),
					defaultConfig.getPofCharge());
			replaceFrameDiscountOptions(entity, defaultConfig.getFrameDiscountOptions());
			replaceLensOptionCharges(entity, defaultConfig.getLensOptionCharges());
			replaceLensProtectionCoatings(entity, defaultConfig.getLensProtectionCoatings());
			replaceLensTransitionOptions(entity, defaultConfig.getLensTransitionOptions());
			replaceLensPrices(entity, defaultConfig.getLensPrices());
			return configRepository.save(entity);
		});
	}

	private OpticalStoreConfig toConfig(OpticalStoreConfigEntity entity) {
		OpticalStoreConfig config = new OpticalStoreConfig();
		config.setEyeExamPrice(entity.getEyeExamPrice());
		config.setExamDiscountWithCompleteGlasses(entity.getExamDiscountWithCompleteGlasses());
		config.setOutsidePrescriptionDiscount(entity.getOutsidePrescriptionDiscount());
		config.setLensDiscountWithoutInsurance(entity.getLensDiscountWithoutInsurance());
		config.setPofCharge(entity.getPofCharge());
		config.setFrameDiscountOptions(entity.getFrameDiscountOptions().stream()
				.map(OpticalFrameDiscountOption::getPercent)
				.toList());
		config.setLensOptionCharges(entity.getLensOptionCharges().stream()
				.map(option -> new LensOptionCharge(option.getName(), option.getCharge()))
				.toList());
		config.setLensPrices(entity.getLensPrices().stream()
				.map(lens -> new LensPrice(lens.getName(), lens.getPrice()))
				.toList());
		config.setLensProtectionCoatings(entity.getLensProtectionCoatings().stream()
				.map(coating -> new LensProtectionCoating(coating.getName(), coating.getPrice()))
				.toList());
		config.setLensTransitionOptions(entity.getLensTransitionOptions().stream()
				.map(option -> new LensTransitionOption(option.getName(), option.getPrice()))
				.toList());
		return config;
	}

	private void replaceFrameDiscountOptions(OpticalStoreConfigEntity entity, List<BigDecimal> discounts) {
		entity.getFrameDiscountOptions().clear();
		for (int index = 0; index < discounts.size(); index++) {
			entity.getFrameDiscountOptions().add(new OpticalFrameDiscountOption(entity, index + 1, discounts.get(index)));
		}
	}

	private void replaceLensOptionCharges(OpticalStoreConfigEntity entity, List<LensOptionCharge> charges) {
		entity.getLensOptionCharges().clear();
		for (int index = 0; index < charges.size(); index++) {
			LensOptionCharge charge = charges.get(index);
			entity.getLensOptionCharges().add(new OpticalLensOptionCharge(entity, index + 1, charge.name(), charge.charge()));
		}
	}

	private void replaceLensPrices(OpticalStoreConfigEntity entity, List<LensPrice> prices) {
		entity.getLensPrices().clear();
		for (int index = 0; index < prices.size(); index++) {
			LensPrice price = prices.get(index);
			entity.getLensPrices().add(new OpticalLensPrice(entity, index + 1, price.name(), price.price()));
		}
	}

	private void replaceLensProtectionCoatings(OpticalStoreConfigEntity entity, List<LensProtectionCoating> coatings) {
		entity.getLensProtectionCoatings().clear();
		for (int index = 0; index < coatings.size(); index++) {
			LensProtectionCoating coating = coatings.get(index);
			entity.getLensProtectionCoatings().add(new OpticalLensProtectionCoating(entity, index + 1, coating.name(), coating.price()));
		}
	}

	private void replaceLensTransitionOptions(OpticalStoreConfigEntity entity, List<LensTransitionOption> options) {
		entity.getLensTransitionOptions().clear();
		for (int index = 0; index < options.size(); index++) {
			LensTransitionOption option = options.get(index);
			entity.getLensTransitionOptions().add(new OpticalLensTransitionOption(entity, index + 1, option.name(), option.price()));
		}
	}

	private BigDecimal moneyOrZero(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

	private <T> List<T> nullToList(List<T> value) {
		return value == null ? Collections.emptyList() : value;
	}
}
