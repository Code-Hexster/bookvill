require("dotenv").config();
const mongoose = require("mongoose");

async function test() {
    console.log("🔍 Testing MongoDB connection...");
    console.log("URI:", process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@")); // Mask password

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ SUCCESS: Connected to MongoDB!");
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ FAILURE: Could not connect to MongoDB");
        console.error("Error Message:", err.message);
        if (err.message.includes("IP") || err.message.includes("whitelist")) {
            console.error("\n💡 TIP: This looks like a MongoDB Atlas IP Whitelist error.");
        }
        process.exit(1);
    }
}

test();
