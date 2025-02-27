// This file loads environment variables from a .env file and exports them for use in the application.
import { config } from "dotenv";

// Load environment variables from .env file
config();

// Export the Pinata JWT for authentication with the Pinata service.
export const PINATA_JWT = process.env.PINATA_JWT || "";
