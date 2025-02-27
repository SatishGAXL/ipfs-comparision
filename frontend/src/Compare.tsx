import { useParams, useLocation } from "react-router-dom";
import { MessageInstance } from "antd/es/message/interface";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Upload } from "antd";
import { BACKEND_URL } from "./config";

const { Dragger } = Upload;

// Define the Compare component, which takes a messageApi prop for displaying messages
export const Compare = ({ messageApi }: { messageApi: MessageInstance }) => {
    // Extract the CID from the URL parameters
    const { cid } = useParams();
    // Get the location object from react-router-dom
    const location = useLocation();
    // Extract the record from the location state, if it exists
    const { record } = location.state || {};

    // Define the props for the Ant Design Upload component
    const props: UploadProps = {
        name: "file",
        // Function to run before the file is uploaded
        beforeUpload: async (file) => {
            console.log("beforeUpload", file);

            // Create a FormData object to send the file
            const formData = new FormData();
            formData.append("file", file);

            try {
                // Send the file to the backend for upload
                const response = await fetch(`${BACKEND_URL}/upload-file`, {
                    method: "POST",
                    body: formData,
                });

                // If the response is not ok, throw an error
                if (!response.ok) {
                    throw new Error("Failed to upload file");
                }

                // Parse the response as JSON
                const data = await response.json();
                // Extract the uploaded hash from the response
                const uploadedHash = data.IpfsHash;

                console.log("Uploaded Hash", uploadedHash);
                console.log("Original CID", cid);

                // Compare the uploaded hash with the original CID
                if (uploadedHash === cid) {
                    messageApi.success("Files are the same");
                } else {
                    messageApi.error("Files are different");
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                messageApi.error("Error uploading file");
            }

            // Prevent the default upload behavior
            return false;
        },
        // Function to run when files are dropped on the component
        onDrop(e) {
            console.log("Dropped files", e.dataTransfer.files);
        },
    };

    return (
        <div className="mainWrapper">
            {/* Page title */}
            <h1 className="pageTitle">Compare Files</h1>
            <div className="uploadWrapper">
                {/* Ant Design Dragger component for file uploads */}
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                        Click or drag file to this area to compare
                    </p>
                    <p className="ant-upload-hint">
                        Ensure the file matches the original CID.
                    </p>
                </Dragger>
                {/* Display the original CID if it exists */}
                {cid && (
                    <div className="cidDisplay">
                        <p>Original CID: {cid}</p>
                    </div>
                )}
                {/* Display the file name if it exists in the record */}
                {record.metadata.name && (
                    <div className="fileNameDisplay">
                        <p>File Name: {record.metadata.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
