import React, { useState } from "react";

function AddButton({ onClickHandler, text }) {
	// State to manage button loading state
	const [loading, setLoading] = useState(false);

	// State to handle any error messages
	const [error, setError] = useState(null);

	// State to display a success message
	const [success, setSuccess] = useState(false);

	/**
	 * Handle the button click event
	 */
	const handleClick = async () => {
		// Reset states for a fresh start
		setError(null);
		setSuccess(false);

		// Set button to loading state
		setLoading(true);

		try {
			await onClickHandler();

			// Set success state to show success message
			setSuccess(true);

			// Optionally, you can reset the success state after a certain duration
			// to hide the success message
			setTimeout(() => {
				setSuccess(false);
			}, 3000); // 3 seconds
		} catch (err) {
			// On error, display error message to user
			setError(err.message || "Failed to add to cart.");
		} finally {
			// Stop the loading state in both success and error scenarios
			setLoading(false);
		}
	};

	return (
		<div>
			<button onClick={handleClick} disabled={loading} className="addToCartBtn">
				{loading ? "Adding to Cart..." : text}
			</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
			{success && <p style={{ color: "green" }}>Added Successfully!</p>}
		</div>
	);
}

export default AddButton;
