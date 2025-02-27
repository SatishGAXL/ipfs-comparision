import express, { Request, Response } from "express";
import { PINATA_JWT } from "./config";
import cors from "cors";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = 5172;

// Middleware setup
app.use(express.json()); // Parses incoming JSON requests
app.use(cors()); // Enables Cross-Origin Resource Sharing

// Define routes
// Basic route to check if the server is running
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

// Route to fetch pinned files from Pinata
app.get("/get-files", async (req: Request, res: Response) => {
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${PINATA_JWT}` }, // Use the Pinata JWT from config
  };
  const result = await fetch(
    "https://api.pinata.cloud/data/pinList?status=pinned",
    options
  );
  const data = await result.json();
  console.log(data);
  res.send(data.rows); // Send the list of pinned files as a response
});

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" }); // Destination folder for uploaded files

// Route to handle file uploads
app.post(
  "/upload-file",
  upload.single("file"), // Middleware to handle single file uploads
  async (req: Request, res: Response): Promise<void> => {
    const file = req.file; // Get the uploaded file

    // If no file was uploaded, return an error
    if (!file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    // Read the file from the temporary path
    const fileBuffer = fs.readFileSync(file.path);
    // Create a Blob from the file buffer
    const blob = new Blob([fileBuffer], { type: file.mimetype });
    // Create a FormData object to send the file
    const formData = new FormData();
    // Append the file to the FormData object
    formData.append("file", blob, file.originalname);

    console.log(file);

    try {
      // Add metadata to the FormData object
      formData.append(`pinataMetadata`, `{"name": "${file.originalname}"}`);

      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`, // Use the Pinata JWT from config
        },
        body: formData, // Set the FormData object as the body
      };

      // Upload the file to Pinata
      const e = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        options
      );
      const response = await e.json();
      console.log(response);
      if(response.IpfsHash){
        res.send(response); // Send the IPFS hash as a response
      }else{
        res.status(500).send("Error uploading file to IPFS.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading file to IPFS.");
    } finally {
      fs.unlinkSync(file.path); // Remove the file from the server
    }
  }
);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
