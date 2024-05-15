"use client";
import { useEffect, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
// import { useSearchParams, usePathname } from 'next/navigation';
import { UserAuth } from "../context/AuthContext.mjs";
import { storage } from '../firebase';
import './page.css';

export default function ImageThumbnail(props: any) {
  const { user } = UserAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const pathname = usePathname();
  // const searchParams = useSearchParams();
  useEffect(() => {
    // console.log("searchParams", searchParams);
    async function getData() {
      setLoading(true);
      // const fileName = props.fileName;
      // console.log("fileName", props.fileName);
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

        // working
        // const uint8Array = (await res.body?.getReader().read())?.value;
        // const blob = new Blob([uint8Array as Uint8Array], { type: 'image/png;base64' });
        // var urlCreator = window.URL || window.webkitURL;
        // var imageUrl = urlCreator.createObjectURL( blob );
        // setUrl(imageUrl);        
        // end of working

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
        
        let blob = new Blob([uint8Array], { type: 'image/png;base64' });
        
        let urlCreator = window.URL || window.webkitURL;
        let imageUrl = urlCreator.createObjectURL(blob);
        
        setUrl(imageUrl);
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
    <div className="inner">
      <img src={url} alt="img"/>
    </div>
  );
}
