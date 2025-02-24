import express, { Request, Response } from "express";
import { PINATA_JWT } from "./config";
import cors from "cors";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = 5172;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.get("/get-files", async (req: Request, res: Response) => {
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
  };
  const result = await fetch(
    "https://api.pinata.cloud/data/pinList?status=pinned",
    options
  );
  const data = await result.json();
  console.log(data);
  res.send(data.rows);
});

const upload = multer({ dest: "uploads/" });

app.post(
  "/upload-file",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    if (!file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const fileBuffer = fs.readFileSync(file.path);
    const blob = new Blob([fileBuffer], { type: file.mimetype });
    const formData = new FormData();
    formData.append("file", blob, file.originalname);

    console.log(file);

    try {
      formData.append(`pinataMetadata`, `{"name": "${file.originalname}"}`);

      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      };

      const e = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        options
      );
      const response = await e.json();
      console.log(response);
      if(response.IpfsHash){
        res.send(response);
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
