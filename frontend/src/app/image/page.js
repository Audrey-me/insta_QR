"use client";
import styles from "../page.module.css";
import { useState } from 'react';
import "../globals.css";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from 'next/navigation';

export default function Scan() {
  const [imageData, setImageData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(""); // State for the generated QR code
  const router = useRouter();

  const handleImageUpload = async () => {
    if (!imageData) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', imageData);

    try {
      const response = await fetch('http://localhost:8000/generate-qr-image/',
      // /api/proxy-image', 
      {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const qrCode = encodeURIComponent(result.image_data);
        router.push(`/get_code?qr=${qrCode}`);
      } else {
        console.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileChange = (e) => {
    setImageData(e.target.files[0]);
  };

  return (
    <main className={styles.main}>
      <div className={styles.back_container} onClick={() => router.push('/')}>
        <MdArrowBack className="header_img" /><span>Back</span>
      </div>
      <div className={styles.header_title}>
        <h1>Insta<span className={styles.header_span}>QR</span></h1>
      </div>

      <div className={styles.subheading}>
        <p>Transform your text, image, and URL to a scannable code using our QR Code Generator</p>
      </div>
      <div className={styles.input_container}>
        <input type="file" accept="image/*" onChange={handleFileChange} placeholder="Upload Image" className={styles.search} />
        <button onClick={handleImageUpload} className={styles.search_btn}>
          Generate QR Code
        </button>
      </div>

      {/* Display the generated QR code */}
      {qrCodeData && (
        <div className={styles.qr_code_container}>
          <img src={`data:image/png;base64,${qrCodeData}`} alt="Generated QR Code" />
        </div>
      )}
    </main>
  );
}
