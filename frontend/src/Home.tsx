import { useEffect, useState } from "react";
import { MessageInstance } from "antd/es/message/interface";
import { BACKEND_URL, IPFS_GATEWAY } from "./config";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { message, Upload, Table } from "antd";

import { Space } from "antd";
import { NavLink } from "react-router-dom";

import "./App.css";

// Define the data structure for the table
interface DataType {
  key: string;
  name: string;
  metadata: any;
  ipfs_pin_hash: number;
}

// Define the columns for the Ant Design Table component
const columns = [
  {
    title: "File Name",
    key: "name",
    // Render the file name from the metadata
    render: (_: any, record: DataType) => <>{record.metadata.name}</>,
  },
  {
    title: "CID",
    dataIndex: "ipfs_pin_hash",
    key: "cid",
    // Render the CID as a link to the IPFS gateway
    render: (text: string) => (
      <a target="_blank" href={`${IPFS_GATEWAY}/${text}`}>
        {text}
      </a>
    ),
  },
  {
    title: "Action",
    key: "action",
    // Render a "Compare" link that navigates to the Compare page with the record as state
    render: (_: any, record: DataType) => (
      <Space size="middle">
        <NavLink to={`/compare/${record.ipfs_pin_hash}`} state={{ record }}>
          Compare
        </NavLink>
      </Space>
    ),
  },
];

const { Dragger } = Upload;

// Define the Home component, which takes a messageApi prop for displaying messages
export const Home = ({ messageApi }: { messageApi: MessageInstance }) => {
  // State for storing the fetched data
  const [data, setData] = useState<DataType[] | null>(null);
  // State for tracking the loading status
  const [loading, setLoading] = useState(true);

  // Function to fetch the files from the backend
  const fetchFiles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/get-files`);
      const result = await response.json();
      console.log(result);
      setData(result);
      setLoading(false);
    } catch {
      messageApi.error("Failed to fetch data");
      setLoading(false);
    }
  };

  // Define the props for the Ant Design Upload component
  const props: UploadProps = {
    name: "file",
    multiple: true,
    action: `${BACKEND_URL}/upload-file`,
    // Function to run when the upload status changes
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        if (info.file.response.isDuplicate) {
          message.error(`${info.file.name} file is already in IPFS.`);
        } else {
          message.success(`${info.file.name} file uploaded successfully.`);
          fetchFiles();
        }
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    // Function to run when files are dropped on the component
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  // Fetch the files when the component mounts
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="mainWrapper">
      {/* Display a loading message while the data is being fetched */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div>
          {/* Page title */}
          <h1 className="pageTitle">Home</h1>
          <div className="uploadWrapper">
            {/* Ant Design Dragger component for file uploads */}
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from
                uploading company data or other banned files.
              </p>
            </Dragger>
          </div>
          {/* Table to display the fetched data */}
          <div className="tableWrapper">
            <Table<DataType> columns={columns} dataSource={data || []} />
          </div>
        </div>
      )}
    </div>
  );
};
