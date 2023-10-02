jQuery(function ($) {
	// Define the URL for AJAX requests
	const ajax_url = $("div#topdf").data("ajax-url");

	/**
	 * Function to send an AJAX request to add products to the cart.
	 *
	 * @param {Array} products - Array of product objects to add to the cart.
	 * @param {HTMLElement} button - The button that triggered the request.
	 */
	function sendAddToCartRequest(products, button) {
		const $button = $(button);
		// Find the closest common ancestor that contains the message elements
		const $commonAncestor = $button.closest(
			".dialog, .shelf-title, .footer-tocart",
		);
		const $loadingMessageElement = $button.find(".js-loadingMsg");

		// Disable the button and show loading message
		$button.attr("disabled", "disabled").attr("data-loading", "true");
		$loadingMessageElement.text($loadingMessageElement.data("loading-msg"));

		// Remove any existing messages
		$commonAncestor.find(".addToCart-success, .addToCart-fail").hide();

		if (!products || products.length === 0) {
			displayError(
				"Product information is missing. Please try again.",
				$commonAncestor,
			);
			return;
		}

		const data = {
			action: "vizmerch_add_to_cart",
			products: products,
		};

		console.log(data); // Debug line, consider removing for production

		$.ajax({
			url: ajax_url,
			type: "POST",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
		})
			.done(function (data) {
				console.log(data); // Debug line, consider removing for production
				if (data.error) {
					displayError(data.error, $commonAncestor);
					return;
				}
				$commonAncestor.find(".addToCart-success").show();
				cart_info.count += products.length; // Update to handle multiple products
				updateCartCount();
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				console.error(
					"There has been a problem with your fetch operation:",
					errorThrown,
				);
				let errorMessage =
					"There has been a problem adding the items to the cart. Please try again later.";
				if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
					errorMessage = jqXHR.responseJSON.error;
				}
				displayError(errorMessage, $commonAncestor);
			})
			.always(function () {
				// Re-enable the button and hide loading message
				$button.removeAttr("disabled").removeAttr("data-loading");
				$loadingMessageElement.text("");
			});
	}

	/**
	 * Function to display an error message.
	 *
	 * @param {string} errorMessage - The error message to display.
	 * @param {jQuery} $commonAncestor - The common ancestor element containing the error message element.
	 */
	function displayError(errorMessage, $commonAncestor) {
		const $errorDialog = $commonAncestor.find(".addToCart-fail");
		$errorDialog.text(errorMessage).show();
	}

	// Event handler for adding a single product to the cart
	window.handleAddToCart = function (event) {
		const $button = $(event.target).closest("button");
		const product_id = $button.data("product-id");
		const product_code = $button.data("product-code");
		sendAddToCartRequest(
			[{ product_id: product_id, product_code: product_code, qty: 1 }],
			$button[0],
		);
	};

	// Event handler for adding all shelf products to the cart
	window.handleAddShelfToCart = function (products) {
		const $button = $(event.target).closest("button");
		sendAddToCartRequest(products, $button[0]);
	};
});
