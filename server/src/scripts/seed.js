import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { connectDB } from "../config/db.js";
import { seedInitialData } from "../services/dataService.js";

async function runSeed() {
  console.log("=== Seeding LeaveFlow Database ===");
  await connectDB();
  await seedInitialData();
  console.log("=== Seed Completed Successfully ===");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
