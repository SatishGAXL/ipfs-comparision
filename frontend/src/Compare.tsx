import { useParams, useLocation } from "react-router-dom";
import { MessageInstance } from "antd/es/message/interface";
import { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { message, Upload, Table } from "antd";
import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import { encode as pbEncode } from "@ipld/dag-pb";
import { BACKEND_URL } from "./config";

const { Dragger } = Upload;

export const Compare = ({ messageApi }: { messageApi: MessageInstance }) => {
    const { cid } = useParams();
    const location = useLocation();
    const { record } = location.state || {};

    const props: UploadProps = {
        name: "file",
        beforeUpload: async (file) => {
            console.log("beforeUpload", file);

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch(`${BACKEND_URL}/upload-file`, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Failed to upload file");
                }

                const data = await response.json();
                const uploadedHash = data.IpfsHash;

                console.log("Uploaded Hash", uploadedHash);
                console.log("Original CID", cid);

                if (uploadedHash === cid) {
                    messageApi.success("Files are the same");
                } else {
                    messageApi.error("Files are different");
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                messageApi.error("Error uploading file");
            }

            return false;
        },
        onDrop(e) {
            console.log("Dropped files", e.dataTransfer.files);
        },
    };

    return (
        <div className="mainWrapper">
            <h1 className="pageTitle">Compare Files</h1>
            <div className="uploadWrapper">
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
                {cid && (
                    <div className="cidDisplay">
                        <p>Original CID: {cid}</p>
                    </div>
                )}
                {record.metadata.name && (
                    <div className="fileNameDisplay">
                        <p>File Name: {record.metadata.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
