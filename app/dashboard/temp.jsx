"use client";
import React, { useState, useEffect } from 'react';
import { listAll, ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import { useDropzone } from 'react-dropzone';
import { storage } from '../firebase';
import '../dashboard/style.css';
import Link from 'next/link';
import ImageThumbnail from '../thumbnail/page';
import * as PDFJS from 'pdfjs-dist';
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

const UploadForm = ({user}) => {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userFiles, setUserFiles] = useState([]);

  async function toPNG(file) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    var pdf = await PDFJS.getDocument({ url: URL.createObjectURL(file) }).promise;
    var page = await pdf.getPage(1);
    var viewport = page.getViewport({ scale: 1.0 });
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    const cv = canvas.toDataURL("image/png");
    return cv.split(',')[1];
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length > 0 ) {
      setFile(acceptedFiles[0]);
      const img = await toPNG(acceptedFiles[0]);
      setImg(img);
      console.log("img", img);
    }
    setUploadError(null); 
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a PDF file to upload.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.');
      return;
    }

    if (file.size > 10485760) { // 10 MB limit
      setUploadError('File size exceeds the limit of 10 MB.');
      return;
    }

    try {
      const userPath = `uploads/${user?.uid}`; 
      const fileRefPdf = ref(storage, `${userPath}/${file.name}`);
      const fileRefImage = ref(storage, `${userPath}/thumbnails/${file.name}`.slice(0, -4) +".png");
      await uploadBytes(fileRefPdf, file);
      await uploadString(fileRefImage, img, 'base64');
      setFile(null);

      const uploadedFileInfo = {
        name: file.name,
      };

      setUploadedFiles([...uploadedFiles, uploadedFileInfo]);
      const fileUrl = await getDownloadURL(fileRefPdf);
      const imgUrl = await getDownloadURL(fileRefImage);
      console.log("urls", fileUrl, imgUrl);
    } catch (error) {
      setUploadError(`Error uploading file: ${error.message}`);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  useEffect(() => {
    const getUserFiles = async () => {
      if (!user?.uid) return;
      const userPath = `uploads/${user.uid}`;
      const storageRef = ref(storage, userPath);
      try {
        const listResult = await listAll(storageRef);
        const fetchedFiles = listResult.items.map((itemRef) => itemRef.fullPath.split("/").pop());
        setUserFiles(fetchedFiles);        
      } catch (error) {
        console.error('Error fetching user files:', error);        
      }
    };

    getUserFiles();
  }, [uploadedFiles]);

  const downloadFile = async (filename) => {
    const userPath = `uploads/${user?.uid}`;
    const fileRefPdf = ref(storage, `${userPath}/${filename}`);
    const fileUrl = await getDownloadURL(fileRefPdf);
    window.open(fileUrl, '_blank');
  };
 
  return (
  // <div className="upload-form bg-gray-900 p-4 rounded-lg shadow-md">
  //   <div
  //     className="dropzone bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out p-4 rounded-lg text-gray-300"
  //     {...getRootProps()}
  //   >
  //     <input {...getInputProps()} />
  //     <div className="dropzone-inner flex flex-col items-center justify-center">
  //       <FontAwesomeIcon
  //         icon={faPlusCircle}
  //         size="2x"
  //         className="text-gray-500"
  //       />
  //       <p>Drag & drop or click to select a PDF file (max 10 MB)</p>
  //     </div>
  //   </div>
  //   {file && <p className="text-gray-300 mt-2">Selected file: {file.name}</p>}
  //   <button
  //     className="full-width-button bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded-lg mt-4 transition duration-300 ease-in-out border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
  //     onClick={handleUpload}
  //     disabled={!file}
  //   >
  //     Upload
  //   </button>
  //   <hr className="my-4 border-gray-700" />
  //   {uploadError && <p className="error text-red-500">{uploadError}</p>}
  //   {userFiles.length > 0 && (
  //     <div>
  //       <div className="uploaded-files text-gray-200 font-bold text-lg">
  //         Uploaded Files
  //       </div>
  //       <hr className="my-4 border-gray-700" />
  //       <div className="file-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  //         {userFiles.map((fileName) => (
  //           <div
  //             key={fileName}
  //             className="file-item bg-gray-800 p-4 rounded-lg shadow-md"
  //           >
  //             <div className="file-name text-gray-300 font-semibold">
  //               {fileName}
  //             </div>
  //             <ImageThumbnail />
  //             <div className="buttons flex space-x-2 mt-4">
  //               <button
  //                 className="open bg-gray-600 hover:bg-gray-500 text-gray-300 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out border border-gray-500 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
  //                 onClick={() => downloadFile(fileName)}
  //               >
  //                 Download <FontAwesomeIcon icon={faDownload} />
  //               </button>
  //               <Link
  //                 className="open bg-gray-600 hover:bg-gray-500 text-gray-300 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out border border-gray-500 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
  //                 href={`/pdf-viewer?fileName=${fileName}`}
  //               >
  //                 View PDF <FontAwesomeIcon icon={faEye} />
  //               </Link>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   )}
  // </div>
  <div className="upload-form bg-gray-900 p-4 rounded-lg shadow-md">
  <div
    className="dropzone bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out p-4 rounded-lg text-gray-400"
    {...getRootProps()}
  >
    <input {...getInputProps()} />
    <div className="dropzone-inner flex flex-col items-center justify-center">
      <FontAwesomeIcon
        icon={faPlusCircle}
        size="2x"
        className="text-blue-900"
      />
      <p className='text-white-500 p-4'>Drag & drop or click to select a PDF file (max 10 MB)</p>
    </div>
  </div>

  {file && (
    <p className="text-gray-400 mt-2">Selected file: {file.name}</p>
  )}

  <button
    className="full-width-button bg-blue-900 hover:bg-blue-800 text-gray-300 font-semibold py-2 px-4 rounded-lg mt-4 transition duration-300 ease-in-out border border-blue-800 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
    onClick={handleUpload}
    disabled={!file}
  >
    Upload
  </button>

  <hr className="my-4 border-gray-700" />

  {uploadError && <p className="error text-red-600">{uploadError}</p>}

  {userFiles.length > 0 && (
    <div>
      <div className="text-gray-300 font-bold text-lg">
        Uploaded Files
      </div>

      <hr className="my-4 border-gray-700" />

      <div className="file-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {userFiles.map((fileName) => (
          <div
            key={fileName}
            className="file-item bg-gray-800 p-4 rounded-lg shadow-md"
          >
            <div className="file-name text-gray-400 font-semibold break-all">
              {fileName}
            </div>
            <ImageThumbnail fileName={fileName}/>
            <div className="buttons flex space-x-2 mt-4">
              <button
                className="open bg-blue-900 hover:bg-blue-800 text-gray-300 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out border border-blue-800 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                onClick={() => downloadFile(fileName)}
              >
                Download <FontAwesomeIcon icon={faDownload} />
              </button>
              <Link
                className="open bg-blue-900 hover:bg-blue-800 text-gray-300 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out border border-blue-800 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
                href={`/pdf-viewer?fileName=${fileName}&uid=${user.uid}`}
              >
                View PDF <FontAwesomeIcon icon={faEye} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
  );
};

export default UploadForm;