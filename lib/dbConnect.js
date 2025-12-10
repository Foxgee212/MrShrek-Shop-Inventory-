import mongoose from  "mongoose";

export async function dbConnect() {
    if(mongoose.connection.readyState >= 1) return;

    return mongoose.connect(process.env.MONGO_URL);
}