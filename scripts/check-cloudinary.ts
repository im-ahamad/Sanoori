import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const testIds = [
  "SanooriTrading/products/TIL-045/tiles-45",
  "SanooriTrading/products/TIL-046/tiles-46",
  "SanooriTrading/products/TIL-047/tiles-48",
  "SanooriTrading/products/TIL-048/tiles-47",
  "SanooriTrading/products/TIL-049/tiles-50",
  "SanooriTrading/products/TIL-050/tiles-49",
  "SanooriTrading/products/TIL-051/tiles-52",
  "SanooriTrading/products/TIL-052/tiles-51",
];

async function check() {
  for (const id of testIds) {
    try {
      const result = await cloudinary.api.resource(id, { resource_type: "image" });
      console.log("EXISTS:", id, "->", result.format, result.bytes, "bytes");
    } catch (e) {
      console.log("MISSING:", id);
    }
  }
}

check();