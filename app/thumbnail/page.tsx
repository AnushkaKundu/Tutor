"use client";
import { useEffect, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { UserAuth } from "../context/AuthContext.mjs";
import { storage } from '../firebase';
import Image from 'next/image';

import './page.css';

export default function ImageThumbnail(props: any) {
  const { user } = UserAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    async function getData() {
      setLoading(true);
      const fileRef = ref(storage, `uploads/${user.uid}/thumbnails/${props.fileName}`.slice(0, -4) + ".png");
      const fileUrl = await getDownloadURL(fileRef);
      console.log(fileUrl);
      try {
        const res = await fetch(`/api/fetch-base64?fileName=${props.fileName}&uid=${user?.uid}&url=${fileUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch image');
        }

        let reader = res.body?.getReader();
        let chunks: Uint8Array[] = [];
        let result: ReadableStreamReadResult<Uint8Array>;
        
        while (!(result = await reader?.read() as ReadableStreamReadResult<Uint8Array>)?.done) {
            chunks.push(result.value);
        }
        
        let totalLength = chunks.reduce((total, arr) => total + arr.length, 0);
        let uint8Array = new Uint8Array(totalLength);
        let offset = 0;
        
        for (let chunk of chunks) {
            uint8Array.set(chunk, offset);
            offset += chunk.length;
        }
        let base64String = "";
        for (let i = 0; i < uint8Array.length; i++) {
          base64String += String.fromCharCode(uint8Array[i]);
        }

        setUrl(`data:image/png;base64,${btoa(base64String)}`);

        // let blob = new Blob([uint8Array], { type: 'image/png;base64' });
        
        // let urlCreator = window.URL || window.webkitURL;
        // let imageUrl = urlCreator.createObjectURL(blob);
        
        // setUrl(imageUrl);
      } catch (error) {
        setError((error as Error).message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [ user]);
  return (
    <div>
      <Image className='inner'
        src={url}
        alt="Image"
        width={500}
        height={300}
      />
    </div>
  );
}
