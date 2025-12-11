import { v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadBufferOrUrl({ buffer, url, folder }) {
    if(url) {
        const result = await cloudinary.uploader.upload(url, { folder });
        return result.secure_url;
    }
    if(buffer) {
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
            stream.end(buffer);
        });
        return result.secure_url;
    }
    throw new Error("Either buffer or url must be provided");
}

export default { uploadBufferOrUrl };