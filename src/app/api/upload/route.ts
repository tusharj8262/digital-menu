import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file → buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const upload = await cloudinary.uploader.upload_stream(
      { folder: "digital-menu" },
      (error, result) => {
        if (error || !result) {
          return error;
        }
        return result;
      }
    );

    // Create readable stream
    const stream = upload as any;
    stream.end(buffer);

    return new Promise((resolve) => {
      stream.on("finish", () => {
        resolve(
          NextResponse.json({ url: stream.response.secure_url })
        );
      });

      stream.on("error", () => {
        resolve(
          NextResponse.json({ error: "Upload failed" }, { status: 500 })
        );
      });
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
