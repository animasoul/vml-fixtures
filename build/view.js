/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/


jQuery(function ($) {
  const ajax_url = $("div#topdf").data("ajax-url");
  function setButtonLoadingState($button, isLoading) {
    if (isLoading) {
      $button.attr("disabled", "disabled").attr("data-loading", "true");
    } else {
      $button.removeAttr("disabled").removeAttr("data-loading");
    }
  }
  function displayError(errorMessage, $errorDialog) {
    console.error("Error:", errorMessage); // log the error message
    $errorDialog.text(errorMessage).show();
  }
  function sendAddToCartRequest(products, button) {
    console.log("Sending request with products:", products); // log the products data

    const $button = $(button);
    const $commonAncestor = $button.closest(".common-container");
    const $loadingMessageElement = $button.find(".js-loadingMsg");
    const $successDialog = $commonAncestor.find(".addToCart-success");
    const $errorDialog = $commonAncestor.find(".addToCart-fail");
    setButtonLoadingState($button, true);
    $loadingMessageElement.text($loadingMessageElement.data("loading-msg"));
    $successDialog.hide();
    $errorDialog.hide();
    if (!products || products.length === 0) {
      displayError("Product information is missing. Please try again.", $errorDialog);
      return;
    }
    const data = {
      action: "vizmerch_add_to_cart",
      products: products
    };
    console.log("Sending request with data:", data); // log the products data

    $.ajax({
      url: ajax_url,
      type: "POST",
      data: $.param(data)
    }).done(function (data) {
      console.log("Request successful, received data:", data); // log the success data
      if (data.error) {
        displayError(data.error, $errorDialog);
        return;
      }
      $successDialog.show();
      cart_info.count += products.length;
      updateCartCount();
    }).fail(function (jqXHR) {
      console.error("Request failed:", jqXHR); // log the failure object
      let errorMessage = "There has been a problem adding the items to the cart. Please try again later.";
      if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
        errorMessage = jqXHR.responseJSON.error;
      }
      displayError(errorMessage, $errorDialog);
    }).always(function () {
      setButtonLoadingState($button, false);
      $loadingMessageElement.text("");
    });
  }
  $(document).on("click", "button.add-cart", function (event) {
    const $button = $(event.target).closest("button");
    const product_id = $button.data("product-id");
    const product_code = $button.data("product-code");
    sendAddToCartRequest([{
      product_id: product_id,
      product_code: product_code,
      qty: 1
    }], $button[0]);
  });
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
  document.addEventListener("click", function (e) {
    if (e.target instanceof HTMLDialogElement && e.target.open) {
      window.closeDialog(e.target.id);
    }
  }, false);
});
/******/ })()
;
//# sourceMappingURL=view.js.map