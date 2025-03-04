// getOptionService.js

/**
 * Fetch option data from the custom WordPress REST API.
 * @param {string} brand - The brand parameter for the API.
 * @param {string} promo - The promo parameter for the API.
 * @returns {Promise<any>} A promise that resolves to the fetched data.
 */
export const fetchOptionData = async (noPromo = false) => {
	try {

		const url = noPromo
			? '/wp-json/vml-fixtures/v1/get-option?noPromo=true'
			: '/wp-json/vml-fixtures/v1/get-option';

		const response = await fetch(url);
		const data = await response.json();
		console.log('Response data', data);

		// Log any SKUs with missing required fields
		if (data?.data?.final_skus) {
			const invalidSkus = Object.entries(data.data.final_skus)
				.filter(([_, sku]) => {
					const missingFields = [];
					if (!sku.code) missingFields.push('code');
					if (!sku.positions) missingFields.push('positions');
					if (sku.positions?.some(pos =>
						!pos.fixture_type ||
						!pos.shelf ||
						!pos.horizontal ||
						!pos.vertical
					)) {
						missingFields.push('position_fields');
					}
					return missingFields.length > 0;
				})
				.map(([key, sku]) => {
					// Find positions with missing fields
					const problematicPositions = sku.positions?.map((pos, index) => {
						const missing = [];
						if (!pos.fixture_type) missing.push('fixture_type');
						if (!pos.shelf) missing.push('shelf');
						if (!pos.horizontal) missing.push('horizontal');
						if (!pos.vertical) missing.push('vertical');
						return missing.length > 0 ? {
							positionIndex: index,
							missingFields: missing,
							positionData: {
								fixture_type: pos.fixture_type,
								shelf: pos.shelf,
								horizontal: pos.horizontal,
								vertical: pos.vertical,
								update: pos.update,
								region: pos.region,
								bay: pos.bay
							}
						} : null;
					}).filter(Boolean);

					return {
						skuKey: key,
						skuCode: sku.code || 'missing_code',
						issues: {
							missingSkuFields: {
								code: !sku.code,
								positions: !sku.positions,
							},
							problematicPositions
						}
					};
				});

			if (invalidSkus.length > 0) {
				console.group('Invalid SKUs Details:');
				invalidSkus.forEach(sku => {
					console.group(`SKU: ${sku.skuCode} (key: ${sku.skuKey})`);

					if (sku.issues.missingSkuFields.code || sku.issues.missingSkuFields.positions) {
						console.warn('Missing SKU Fields:',
							Object.entries(sku.issues.missingSkuFields)
								.filter(([_, isMissing]) => isMissing)
								.map(([field]) => field)
						);
					}

					if (sku.issues.problematicPositions.length > 0) {
						console.warn('Positions with missing data:');
						sku.issues.problematicPositions.forEach(pos => {
							console.log(`Position ${pos.positionIndex}:`, {
								missingFields: pos.missingFields,
								currentData: pos.positionData
							});
						});
					}
					console.groupEnd();
				});
				console.groupEnd();
			}
		}

		return data;
	} catch (error) {
		console.error('Error fetching option data:', error);
		throw error;
	}
};
