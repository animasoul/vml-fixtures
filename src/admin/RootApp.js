import React, { useState } from "@wordpress/element";
import FrontendApp from "../components/FrontEndApp";
import PromotionsList from "../components/PromotionsList";

function RootApp() {
	const [selectedPromotion, setSelectedPromotion] = useState(null);

	return (
		<div className="admin-fixture-wrapper">
			<PromotionsList
				onPromotionSelect={setSelectedPromotion}
				selectedPromotion={selectedPromotion}
			/>

			<FrontendApp context="admin" selectedPromotion={selectedPromotion} />
		</div>
	);
}

export default RootApp;
