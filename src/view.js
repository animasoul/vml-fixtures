"use strict";

jQuery(function ($) {
	const ajax_url = $("div#topdf").data("ajax-url");

	function sendAddToCartRequest(products, button) {
		const $button = $(button);
		const $commonAncestor = $button.closest(".common-container");
		const $loadingMessageElement = $button.find(".js-loadingMsg");
		const $successDialog = $commonAncestor.find(".addToCart-success");
		const $errorDialog = $commonAncestor.find(".addToCart-fail");

		$button.attr("disabled", "disabled").attr("data-loading", "true");
		$loadingMessageElement.text($loadingMessageElement.data("loading-msg"));
		$successDialog.hide();
		$errorDialog.hide();

		if (!products || products.length === 0) {
			displayError(
				"Product information is missing. Please try again.",
				$errorDialog,
			);
			return;
		}

		const data = {
			action: "vizmerch_add_to_cart",
			products: products,
		};

		$.ajax({
			url: ajax_url,
			type: "POST",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify(data),
		})
			.done(function (data) {
				if (data.error) {
					displayError(data.error, $errorDialog);
					return;
				}
				$successDialog.show();
				cart_info.count += products.length;
				updateCartCount();
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				let errorMessage =
					"There has been a problem adding the items to the cart. Please try again later.";
				if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
					errorMessage = jqXHR.responseJSON.error;
				}
				displayError(errorMessage, $errorDialog);
			})
			.always(function () {
				$button.removeAttr("disabled").removeAttr("data-loading");
				$loadingMessageElement.text("");
			});
	}

	function displayError(errorMessage, $errorDialog) {
		$errorDialog.text(errorMessage).show();
	}

	window.handleAddToCart = function (event) {
		const $button = $(event.target).closest("button");
		const product_id = $button.data("product-id");
		const product_code = $button.data("product-code");
		sendAddToCartRequest(
			[{ product_id: product_id, product_code: product_code, qty: 1 }],
			$button[0],
		);
	};

	window.handleAddShelfToCart = function (products) {
		const $button = $(event.target).closest("button");
		sendAddToCartRequest(products, $button[0]);
	};

	window.openDialog = function (id) {
		document.getElementById(id).showModal();
	};

	window.closeDialog = function (id) {
		document.getElementById(id).close();
	};

	/* Handle clicks on the backdrop */
	document.addEventListener(
		"click",
		function (e) {
			if (e.target instanceof HTMLDialogElement && e.target.open) {
				window.closeDialog(e.target.id);
			}
		},
		false,
	);
});
