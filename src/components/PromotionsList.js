import { useEffect, useState } from "@wordpress/element";
import fetchDataFromServer from "../services/dataService";

function PromotionsList({ onPromotionSelect }) {
	// Helper function to extract URL params
	const getUrlParameter = (name) => {
		name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
		const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
		const results = regex.exec(location.search);
		return results === null
			? ""
			: decodeURIComponent(results[1].replace(/\+/g, " "));
	};

	// Initial setup for selected promotion either from URL or local storage
	const testPromotion = getUrlParameter("test");
	const initialSelectedPromotion =
		testPromotion || localStorage.getItem("lastSelectedPromotion");

	// State setup
	const [promotions, setPromotions] = useState([]);
	const [selectedPromotion, setSelectedPromotion] = useState(
		initialSelectedPromotion,
	);

	// Effect for fetching and caching promotions
	useEffect(() => {
		if (!testPromotion) {
			const cachedPromotions = localStorage.getItem("cachedPromotions");
			const parsedPromotions = cachedPromotions && JSON.parse(cachedPromotions);
			const isCacheValid = (cacheTimestamp) => {
				const now = new Date();
				const minutesPassed = (now - new Date(cacheTimestamp)) / (1000 * 60);
				return minutesPassed < 60; // Cache is valid if less than 60 minutes have passed
			};

			if (parsedPromotions && isCacheValid(parsedPromotions.timestamp)) {
				setPromotions(parsedPromotions.data);
				if (parsedPromotions.data.length > 0 && !selectedPromotion) {
					const defaultSelection = parsedPromotions.data[0].ProjectTitle;
					setSelectedPromotion(defaultSelection);
					onPromotionSelect(defaultSelection);
					localStorage.setItem("lastSelectedPromotion", defaultSelection);
				}
			} else {
				fetchDataFromServer("vizmerch_list_promotions", null, "active", "true")
					.then((fetchedData) => {
						const reversedData = [...fetchedData].reverse();
						const dataToCache = {
							data: reversedData,
							timestamp: new Date().toISOString(),
						};
						localStorage.setItem(
							"cachedPromotions",
							JSON.stringify(dataToCache),
						);
						setPromotions(reversedData);
						if (reversedData.length > 0 && !selectedPromotion) {
							const defaultSelection = reversedData[0].ProjectTitle;
							setSelectedPromotion(defaultSelection);
							onPromotionSelect(defaultSelection);
							localStorage.setItem("lastSelectedPromotion", defaultSelection);
						}
					})
					.catch((err) => {
						console.error("Error fetching promotions:", err);
					});
			}
		} else {
			// If we have a test promotion, we don't need to fetch or cache
			onPromotionSelect(testPromotion);
			localStorage.setItem("lastSelectedPromotion", testPromotion);
		}
	}, [testPromotion, onPromotionSelect]);

	// Handle promotion selection
	const handlePromotionSelection = (promotionTitle) => {
		setSelectedPromotion(promotionTitle);
		onPromotionSelect(promotionTitle);
		localStorage.setItem("lastSelectedPromotion", promotionTitle);
	};

	// If there's a test promotion in the URL, display the header and don't show the buttons
	if (testPromotion) {
		return <h2>Test: {selectedPromotion}</h2>;
	}

	// If we only have one or no promotions, there's no need to display the selection
	if (promotions.length <= 1) {
		return null;
	}

	// Render the buttons for promotion selection
	return (
		<>
			<h3>Choose a promotion (all are currently active)</h3>
			<div className="buttons-row">
				{promotions.map((promotion) => (
					<button
						key={promotion.ProjectID}
						data-projectid={promotion.ProjectID}
						className={
							selectedPromotion === promotion.ProjectTitle ? "activeBtn" : ""
						}
						onClick={() => handlePromotionSelection(promotion.ProjectTitle)}
					>
						{promotion.ProjectTitle}
					</button>
				))}
			</div>
		</>
	);
}

export default PromotionsList;
