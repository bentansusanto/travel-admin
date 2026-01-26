const fs = require("fs");
const path = require("path");

console.log("📦 Copying files for standalone deployment...");

try {
  // Check if standalone directory exists
  const standalonePath = path.join(__dirname, "..", ".next", "standalone");
  if (!fs.existsSync(standalonePath)) {
    console.error("❌ Error: .next/standalone directory not found!");
    console.error(
      '   Make sure you have run "next build" with output: "standalone" in next.config.ts'
    );
    process.exit(1);
  }

  // Copy public folder
  const publicSrc = path.join(__dirname, "..", "public");
  const publicDest = path.join(standalonePath, "public");

  if (fs.existsSync(publicSrc)) {
    console.log("📁 Copying public folder...");
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log("✅ Public folder copied");
  } else {
    console.warn("⚠️  Warning: public folder not found");
  }

  // Copy .next/static folder
  const staticSrc = path.join(__dirname, "..", ".next", "static");
  const staticDest = path.join(standalonePath, ".next", "static");

  if (fs.existsSync(staticSrc)) {
    console.log("📁 Copying .next/static folder...");

    // Create .next directory in standalone if it doesn't exist
    const nextDir = path.join(standalonePath, ".next");
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }

    fs.cpSync(staticSrc, staticDest, { recursive: true });
    console.log("✅ .next/static folder copied");
  } else {
    console.error("❌ Error: .next/static folder not found!");
    process.exit(1);
  }

  // Optional: Copy .env file (controlled by COPY_ENV environment variable)
  // Usage: COPY_ENV=true pnpm build:prod
  if (process.env.COPY_ENV === "true") {
    const envSrc = path.join(__dirname, "..", ".env");
    const envDest = path.join(standalonePath, ".env");

    if (fs.existsSync(envSrc)) {
      console.log("📁 Copying .env file...");
      fs.copyFileSync(envSrc, envDest);
      console.log("✅ .env file copied");
      console.log("⚠️  Remember: .env contains sensitive data!");
    } else {
      console.warn("⚠️  Warning: .env file not found, skipping...");
    }
  }

  console.log("");
  console.log("✅ All files copied successfully!");
  console.log("📍 Standalone build location: .next/standalone/");
  console.log("");
  console.log("Next steps:");
  console.log("1. Copy .next/standalone/ to your VPS");
  if (process.env.COPY_ENV !== "true") {
    console.log("2. Copy .env file to the standalone directory on VPS");
  }
  console.log("3. Run: node server.js");
  console.log("   or use PM2: pm2 start ecosystem.config.js");
} catch (error) {
  console.error("❌ Error copying files:", error.message);
  process.exit(1);
}
