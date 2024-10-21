"use client"
import styles from "../page.module.css";
import { useRouter } from 'next/navigation';
import { MdArrowBack } from "react-icons/md";
import { useEffect, useState } from 'react';
import "../globals.css";

export default function GetCode() {
    const router = useRouter();
    const [qrCode, setQrCode] = useState(" ");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const qr = searchParams.get("qr");
            if (qr) {
                setQrCode(qr);
            }
        }
    }, []);
    return (
        <main className={styles.main}>
            <div className={styles.back_container} onClick={() => router.push('/')}>
                <MdArrowBack className="header_img" />
            </div>
            <div className={styles.header_title}>
                <h1>Insta<span className={styles.header_span}>QR</span></h1>
            </div>

            <div className={styles.subheading}>
                <p>Scan Code with your phone camera app</p>
            </div>
            <div className={styles.input_container}>
                {qrCode ? (
                <img src={`data:image/png;base64,${qrCode}`} alt="Generated QR Code" />
                ) : (
                <p>No QR Code Available</p>
                )}
            </div>
        </main>
    );
}
