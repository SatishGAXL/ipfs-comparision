import { config } from "dotenv";
config();
export const PINATA_JWT = process.env.PINATA_JWT || "";
