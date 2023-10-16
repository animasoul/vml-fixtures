import React from "react";
import PropTypes from "prop-types";
import AddButton from "./AddButton";
import Modal from "react-modal";
import { addSingleProductToCart } from "../utilities/addSingleProductToCart";

// Set the root of your app for accessibility features of Modal.
// This should ideally be set only once in your app.
Modal.setAppElement("#content");

function ItemModal({ isOpen, onClose, modalId, largeImgSrc, details }) {
	const handleAddItemToCart = async (itemDetails) => {
		try {
			if (!itemDetails) {
				throw new Error("Item details not provided.");
			}

			await addSingleProductToCart(itemDetails);

			console.log(`Item ${itemDetails.ProductID} added to cart.`);
		} catch (error) {
			console.error("Error adding item to cart:", error.message);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onClose}
			contentLabel="Item Modal"
			id={modalId}
			shouldCloseOnOverlayClick={false}
			shouldCloseOnEsc={true}
			style={{
				content: {
					top: "50%",
					left: "50%",
					right: "auto",
					bottom: "auto",
					marginRight: "-50%",
					transform: "translate(-50%, -50%)",
					width: "auto",
					maxHeight: "90%",
					zIndex: "1000",
					borderRadius: "20px",
				},
				overlay: {
					backgroundColor: "#0a090952",
					position: "fixed",
					top: "0",
					left: "0",
					right: "0",
					bottom: "0",
				},
			}}
		>
			<img
				src={largeImgSrc}
				alt={details["Description"] || "Item image"}
				data-product-id={details["ProductID"]}
				data-product-code={details["Code"]}
			/>
			<div>
				{Object.keys(details).map((key) => (
					<p key={key}>
						<strong>{key}:</strong> {details[key]}
					</p>
				))}
			</div>
			<div className="modal-buttons common-container">
				<button
					onClick={(e) => {
						onClose();
						e.stopPropagation();
					}}
					className="close-modal"
				>
					Close
				</button>
				<AddButton
					onClickHandler={() => handleAddItemToCart(details)}
					text={`Add item to cart`}
				/>
			</div>
		</Modal>
	);
}

ItemModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	modalId: PropTypes.string.isRequired,
	largeImgSrc: PropTypes.string.isRequired,
	details: PropTypes.shape({
		Description: PropTypes.string,
		ProductID: PropTypes.string,
		Code: PropTypes.string,
	}).isRequired,
};

export default ItemModal;
