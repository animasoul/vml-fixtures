import Loader from "../components/Loader";
import React, { useState } from "@wordpress/element";
import { Document, Page, Thumbnail, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function UploadPdf() {
	const [file, setFile] = useState(null);
	const [pdfUrl, setPdfUrl] = useState("");

	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
		console.log(event.target.files[0]);
	};

	const [isFileLoading, setIsFileLoading] = useState(false);
	const uploadFile = async () => {
		if (!file) {
			return;
		}
		setIsFileLoading(true);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await fetch("/wp-json/vml-fixtures/v1/upload-pdf", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setPdfUrl(data.url);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setIsFileLoading(false);
		}
	};

	return (
		<div className="uploadPdf">
			<p className="noprint">Upload PDF of the first page</p>
			<input
				type="file"
				onChange={handleFileChange}
				accept="application/pdf"
				className="noprint file-input"
			/>

			<button
				onClick={uploadFile}
				className="noprint ui-checkboxradio-label ui-corner-all ui-button ui-widget ui-checkboxradio-radio-label"
			>
				Upload PDF
			</button>
			{isFileLoading && <Loader />}
			{pdfUrl ? (
				<>
					<Document file={pdfUrl} className="print-pdf">
						{/* <Document file="http://ga.local/wp-content/uploads/2024/02/Beauty-Blender-SEP-EC-Spring-12.8.23-UPDATE.pdf"> */}
						<Page
							pageNumber={1}
							renderMode="canvas"
							renderTextLayer={false}
							renderAnnotationLayer={false}
							width={1140}
							className={"onlyprint"}
						/>
					</Document>

					<Document file={pdfUrl}>
						<Thumbnail
							pageNumber={1}
							renderMode="canvas"
							renderTextLayer={false}
							renderAnnotationLayer={false}
							width={200}
							className={"noprint thumnail-pdf"}
						/>
					</Document>
				</>
			) : (
				<br />
			)}
		</div>
	);
}
