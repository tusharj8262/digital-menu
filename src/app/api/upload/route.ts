import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// ⭐ Load Cloudinary credentials from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ⭐ Allow large requests
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "10mb",
  },
};

// ⭐ POST — Upload image
export async function POST(request: Request) {
  try {
    // 1️⃣ Read Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file received" },
        { status: 400 }
      );
    }

    // 2️⃣ Convert File → Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3️⃣ Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "menu" }, (err, result) => {
          if (err) return reject(err);
          return resolve(result);
        })
        .end(buffer);
    });

    const result = uploadResult as any;

    // 4️⃣ secure_url मिळतेय का तपास
    if (!result?.secure_url) {
      return NextResponse.json(
        { error: "Upload failed (no secure_url)" },
        { status: 500 }
      );
    }

    // 5️⃣ Return final URL
    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);

    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
