"use client"
import styles from "../page.module.css";
import { useState } from 'react';
import "../globals.css"
import { useRouter } from 'next/navigation';
import { MdArrowBack } from "react-icons/md";

export default function Scan() {
    const [textData, setTextData] = useState('');
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState("");

    const isValidURL = (string) => {
      try {
          new URL(string);
          return true;
      } catch (_) {
          return false;
      }
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setTextData(value);

    if (value) {
        setErrorMessage("");
    }
};

  const handleGenerateQR = async (type, data) => {
        if (!data) {
          setErrorMessage("Input field cannot be empty. Please enter a URL.");
          return;
        }

        if (!isValidURL(data)) {
            setErrorMessage("Please enter a valid URL.");
            return;
        }

      setErrorMessage("");
      const response = await fetch("http://localhost:8000/generate-qr/",
      // /api/proxy", 
      {
            method: "POST", 
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ data_type: type, data: data }),
      });
      if (response.ok) {
        const result = await response.json();
        const qrCode = encodeURIComponent(result.image_data);
        router.push(`/get_code?qr=${qrCode}`);
    } else {
        console.error('Failed to generate QR code');
    }
  };
  
    return (
        <main className={styles.main}>
        <div className={styles.back_container} onClick={()=> router.push('/')}><MdArrowBack className="header_img"/><span>Back</span></div>
        <div className={styles.header_title}>
           <h1>Insta<span className={styles.header_span}>QR</span></h1>
        </div>

        <div className={styles.subheading}>
          <p>Transform your text, image and URL to a scannable code using our QR Code Generator</p>
        </div>
        <div className={styles.input_container}>

            <input  placeholder="Enter a valid URL" className={styles.search} type="text" value={textData} onChange={handleInputChange}/>
            <p className={styles.error}>{errorMessage}</p>
            <button className={styles.search_btn} onClick={() => handleGenerateQR("url", textData)}>Generate QR Code</button>
        </div>
      </main>     
       
    );
}
