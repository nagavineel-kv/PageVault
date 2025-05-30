import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected...");
    } catch (error) {
        console.log("Error Connecting to Database...");
        process.exit(1); //exit with failure
    }
}