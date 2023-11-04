import React, { useState } from "@wordpress/element";
import FrontendApp from "../components/FrontEndApp";
import PromotionsList from "../components/PromotionsList";

function StoreApp() {
	const [selectedPromotion, setSelectedPromotion] = useState(null);

	return (
		<div className="store-fixture-wrapper">
			<PromotionsList
				onPromotionSelect={setSelectedPromotion}
				selectedPromotion={selectedPromotion}
			/>

			<FrontendApp context="store" selectedPromotion={selectedPromotion} />
		</div>
	);
}

export default StoreApp;
