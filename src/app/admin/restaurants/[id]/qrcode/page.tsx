"use client";

import QRCode from "react-qr-code";
import { useParams } from "next/navigation";

export default function QRCodePage() {
  const { id } = useParams();

  const menuUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${id}/start`;

  return (
    <div className="p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Restaurant QR Code</h1>

      <div className="bg-white p-6 rounded shadow">
        <QRCode value={menuUrl} size={220} />
      </div>

      <p className="mt-4 text-gray-700">
        Scan to view menu:  
        <br />
        <strong>{menuUrl}</strong>
      </p>
    </div>
  );
}
