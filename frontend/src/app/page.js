"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { MdOutlinePhotoCamera } from "react-icons/md";
import { FaPencilAlt } from "react-icons/fa";
import { IoIosLink } from "react-icons/io";
import "./globals.css"
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

    return (
        <main className={styles.main}>
            <div className={styles.header_title}>
               <h1>Insta<span className={styles.header_span}>QR</span></h1>
            </div>

            <div className={styles.subheading}>
              <p>Transform your text, image and URL to a scannable code using our QR Code Generator</p>
            </div>

            <div className={styles.flex}>
              <button className={styles.txt} onClick={()=> router.push('/text')}> Text <FaPencilAlt className="icon_img"/></button>
              <button className={styles.txt} onClick={()=> router.push('/image')}> Upload Image <MdOutlinePhotoCamera className="icon_img" /> </button>
              <button className={styles.txt} onClick={()=> router.push('/link')}> URL <IoIosLink className="icon_img"/></button>
            </div>     
        </main>     
    )           
}

