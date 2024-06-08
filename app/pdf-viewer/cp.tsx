"use client";
import React, { useEffect, useState, useRef } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { ref as dbref, push, set, get, serverTimestamp, onValue } from 'firebase/database';
import { useSearchParams, usePathname } from 'next/navigation';
import { UserAuth } from "../context/AuthContext.mjs";
import { storage, database } from '../firebase';

import { Document, Page, pdfjs } from 'react-pdf';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faSearchPlus, faSearchMinus, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';

import './page.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "AIzaSyATL2W9X4coAMv0OpaFgK2_LxzdpygpjZs";
const generativeAi = new GoogleGenerativeAI(apiKey);

interface Question {
  question: string;
  text: string;
  timestamp: number;
}


export default function PV(props: any) {
  const { user } = UserAuth();
  // const [uid, setUid] = useState("Mxj1jPA1sSNJcozS2oOsmDao3K83");
  const [blob, setBlob] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fileName = searchParams.get('fileName');
  const uid = searchParams.get('uid');

  useEffect(() => {
    async function getData() {
      setLoading(true);
      const fileRef = ref(storage, `uploads/${uid}/${fileName}`);
      const url = await getDownloadURL(fileRef);
      setPdfUrl(url);
      try {
        const res = await fetch(`/api/fetch-pdf?uid=${uid}&fileName=${fileName}&url=${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch pdf');
        }

        const blob = await res.blob();
        setBlob(blob);
      } catch (error) {
        setError((error as Error).message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [pathname, searchParams, user]);

  const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageHeight, setPageHeight] = useState<number>(0);
    const [pageScale, setPageScale] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0); 
    const [pdfLoaded, setPdfLoaded] = useState<boolean>(false); 
    const pdfViewerRef = useRef<HTMLDivElement>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPdfLoaded(true);
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const handleNextPage = () => {
        if (pageNumber < numPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handleMagnify = () => {
        setPageScale(prevScale => prevScale + 0.2); 
    };

    const handleMinify = () => {
        setPageScale(prevScale => prevScale - 0.2); 
    };

    const handleRotateLeft = () => {
        setRotation(rotation => rotation - 90); 
    };

    const handleRotateRight = () => {
        setRotation(rotation => rotation + 90); 
    };

    const handleResize = () => {
        if (pdfViewerRef.current) {
            const page = pdfViewerRef.current.querySelector('.react-pdf__Page');
            if (page) {
                const pageClientHeight = page.clientHeight;
                const pageClientWidth = page.clientWidth;
                const scaleHeight = pageClientHeight * pageScale;
                const scaleWidth = pageClientWidth * pageScale;
                const radians = rotation * Math.PI / 180;
                const rotatedHeight = Math.abs(scaleHeight * Math.cos(radians)) + Math.abs(scaleWidth * Math.sin(radians));
                const rotatedWidth = Math.abs(scaleHeight * Math.sin(radians)) + Math.abs(scaleWidth * Math.cos(radians));
                setPageHeight(rotatedHeight); 
            }
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        handleResize();
    }, [pageNumber, pageScale, rotation, pdfLoaded]);

    const handleTextSelection = (e: any) => {
        const selection = window.getSelection();
        if (selection) {
            const selectedText = selection.toString();
            console.log('Selected text:', selectedText);
        }
    };
    const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [quizActive, setQuizActive] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string, type: string }[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const model = generativeAi.getGenerativeModel({ model: 'gemini-pro' });

  const summarizeText = async () => {
    try {
      const prompt = `Please provide a concise bullet point summary of the following text:\n\n${text}`;
      const response = model.generateContent(prompt);
      const summaryText = (await response).response.text();
      setSummary(summaryText);
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
            role: 'user', 
            content: text,
            type: 'text'
        },
        { 
            role: 'assistant', 
            content: summaryText,
            type: 'summary' 
        },
      ]);
    } catch (error) {
      console.error('Error summarizing text:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
            role: 'user', 
            content: text,
            type: 'text'
        },
        {
          role: 'assistant',
          content: 'An error occurred while summarizing the text.',
          type: 'error'
        },
      ]);
    }
    // console.log(messages);
    handleQueryStats(fileName);
    setUserAnswer("");
  };
  const generateQuestion = async () => {
    try {
      const prompt = `Generate a single concise objective question based on this text:\n\n${text}. Just return one question in one line nothing else. Make sure the question is randomly from any part of the text.`;
      const response = model.generateContent(prompt);
      const questionText = (await response).response.text();
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
            role: 'assistant', 
            content: questionText ,
            type: 'question'
        },
      ]);
    } catch (error) {
      console.error('Error generating question:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'An error occurred while generating the question.',
          type: 'error'
        },
      ]);
    }
    console.log(messages);
    handleQueryStats(fileName);
  };

  const handleStartQuiz = () => {
    setQuizActive(true);
    generateQuestion();
    handleQueryStats(fileName);
  };

  const handleStopQuiz = () => {
    setQuizActive(false);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: 'assistant',
        content: 'Quiz stopped.',
        type: 'notification',
      },
    ]);
    setText("");
    handleQueryStats(fileName);
  };

  const handleSubmitAnswer = async (userAnswer: string) => {
    const lastQuestion = messages[messages.length - 1].content;
    try {
      const prompt = `Considering the text:\n\n${text}\n\nIs the following answer correct for the question:\n\n${lastQuestion}\n\nAnswer: ${userAnswer}. Return a json in string format, with 2 keys, the first key will be isCorrect and the value should be 1 if it is correct 0 otherwise. The second key should be your feedback.`;
      const response = model.generateContent(prompt);
      const feedback = (await response).response.text().replace(/`/g, '').replace("json", "");
      const jsonObject = JSON.parse(feedback);
      const fb = (jsonObject.isCorrect === 1 ? "Correct, ": "Incorrect, ") + jsonObject.feedback;
      console.log(feedback);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: userAnswer, type: 'answer' },
        { role: 'assistant', content: fb, type: 'feedback' },
      ]);
      if (jsonObject.isCorrect === 1) {
        updateCorrectAnswers();
      } else {
        updateIncorrectAnswers();
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: userAnswer, type: 'answer' },
        { role: 'assistant', content: 'Error evaluating answer', type: 'error' },
      ]);
    }
    setUserAnswer("");
    generateQuestion();  
    handleQueryStats(fileName);
  };

  const handleSkipQuestion = () => {
    generateQuestion();
    handleQueryStats(fileName);
    updateSkippedAnswers();
  };

  function encode(key: string) {
    return encodeURIComponent(key).replace(/\.|\#|\$|\[|\]/g, (match) => {
      return '%' + match.charCodeAt(0).toString(16).toUpperCase(); 
    });
  }

  const handleSaveQuestion = () => {
    // console.log("Question saved");
    // const uid = user?.uid;
    // const fileName = searchParams.get('fileName');
    // const pgno = pageNumber;
    const lastQuestion = messages[messages.length - 1];
    if (lastQuestion.type !== 'question') {
      return;
    }
    const questionsRef = dbref(database, `/questions/${uid}/${encode(fileName as string)}/${pageNumber}`);
    const newQuestionRef = push(questionsRef);
    set(newQuestionRef, {
      question: lastQuestion.content,
      text: text,
      timestamp: serverTimestamp() 
    })
    .then(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
            role: 'assistant', 
            content: 'Question saved successfully.',
            type: 'save question'
        }
      ]);
    })
    .catch((error) => console.error('Error saving question:', error)); 
    handleQueryStats(fileName);
    getPageQuestions();
    generateQuestion();
    updateSkippedAnswers();
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const getPageQuestions = () => {
    setQuestions([]);
    const questionsRef = dbref(database, `/questions/${uid}/${encode(fileName as string)}/${pageNumber}`);
    get(questionsRef).then(snapshot => {
      if (snapshot.exists()) {
        const fetchedQuestions: Question[] = Object.values(snapshot.val());
        setQuestions(fetchedQuestions);
        console.log(pageNumber, fetchedQuestions);
        handleQueryStats(fileName);
      } else {
        console.log("No questions found at this path.");
      }
    }).catch((error) => {
      console.error("Error fetching questions:", error);
    });
  };

  useEffect (() => {
    getPageQuestions();
  },[pageNumber, uid]);

  const [openId, setOpenId] = useState(null);

  const toggleAccordion = (timestamp: any) => {
    setOpenId(openId === timestamp ? null : timestamp);
  };

  const handleQueryStats = (fileName: any) => {
    const timestampRef = dbref(database, `/statistics/${user?.uid}/queries`);
    const newtsRef = push(timestampRef);
    set(newtsRef, serverTimestamp())
    .catch((error) => console.error('Error saving statistics:', error)); 

  }
  const updateCorrectAnswers = async () => {
    const correctRef = dbref(database, `/answerStats/${uid}/correct`);
    const snapshot = await get(correctRef);
    if (snapshot.exists()) {
      set(correctRef, snapshot.val()+1);
    } else {
      set(correctRef, 1);
    }
  }

  const updateIncorrectAnswers = async () => {
    const incorrectRef = dbref(database, `/answerStats/${uid}/incorrect`);
    const snapshot = await get(incorrectRef);
    if (snapshot.exists()) {
      set(incorrectRef, snapshot.val()+1);
    } else {
      set(incorrectRef, 1);
    }
  }
  const updateSkippedAnswers = async () => {
    const skippedRef = dbref(database, `/answerStats/${uid}/skipped`);
    const snapshot = await get(skippedRef);
    if (snapshot.exists()) {
      set(skippedRef, snapshot.val()+1);
    } else {
      set(skippedRef, 1);
    }
  }

  console.log(questions);
  return (
  <div>
  <div className="flex flex-row">
    <div className="w-1/2 h-screen">
      <div className="pdf-container p-4 rounded-lg shadow-md bg-gray-900">
        <div className="toolbar flex justify-between items-center mb-4 bg-gray-800 rounded-lg">
          <div className="toolbar-group">
            <button
              onClick={handlePreviousPage}
              disabled={pageNumber === 1}
              className="toolbar-btn left p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-300 mr-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className='toolbar-btn left bg-gray-700 hover:bg-gray-600 text-white transition duration-300 mr-2'>
             {pageNumber}
            </div>
            <button
              onClick={handleNextPage}
              disabled={pageNumber === numPages}
              className="toolbar-btn left p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-300 mr-2"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
          <div className="toolbar-group">
            <button
              onClick={handleMagnify}
              className="toolbar-btn center p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-300 mr-2"
            >
              <FontAwesomeIcon icon={faSearchPlus} />
            </button>
            <button
              onClick={handleMinify}
              className="toolbar-btn center p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-300 mr-2"
            >
              <FontAwesomeIcon icon={faSearchMinus} />
            </button>
          </div>
          <div className="toolbar-group">
            <button
              onClick={handleRotateLeft}
              className="toolbar-btn right p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-300 mr-2"
            >
              <FontAwesomeIcon icon={faUndo} />
            </button>
            <button
              onClick={handleRotateRight}
              className="toolbar-btn right p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition duration-300 mr-2"
            >
              <FontAwesomeIcon icon={faRedo} />
            </button>
          </div>
        </div>
        <div
          className="pdf-viewer overflow-x-auto overflow-y-auto"
          ref={pdfViewerRef}
          style={{ height: pageHeight, maxHeight: 'calc(100vh - 100px)' }}
          onMouseUp={handleTextSelection}
        >
          <Document file={blob as File} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={pageNumber}
              scale={pageScale}
              rotate={rotation}
              renderTextLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
    <div className="w-1/2 h-screen">
      <div className="flex flex-col h-screen">
      <div className="bg-gray-800 pb-4">
      <div className="container mx-auto text-center bg-gray-900 py-4">
        <div className="text-white mb-4">
          Hi! 👋 How can I help?
        </div>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Summarise</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Test your understanding</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Review saved questions</button>
        </div>
      </div>
    </div>
        <div className="flex-grow p-6 overflow-y-auto bg-gray-800">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                message.role === 'user' ? 'items-end' : 'items-start'
              } mb-4`}
            >
              <div
                className={`${
                  message.role === 'user'
                    ? 'bg-blue-700 text-white'
                    : message.type === 'question'
                    ? 'bg-gray-700 text-white'
                    : message.type === 'summary'
                    ? 'bg-gray-600 text-white'
                    : message.type === 'feedback'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-500 text-white'
                } p-3 rounded-lg`}
              >
                {message.content}
              </div>
              {message.role === 'assistant' &&
                quizActive &&
                message.type === 'question' &&
                index === messages.length - 1 && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={handleSkipQuestion}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-700"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleSaveQuestion}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-800"
                    >
                      Skip & Save
                    </button>
                    <button
                      onClick={handleStopQuiz}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-800"
                    >
                      Stop quiz
                    </button>
                  </div>
                )}
              {message.role === 'assistant' &&
                !quizActive &&
                message.type === 'summary' && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={handleStartQuiz}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-800"
                    >
                      Test Your Understanding
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-700 border-t border-gray-600">
          {quizActive ? (
            <div className="flex">
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-600 bg-gray-600 text-white"
                placeholder="Enter your answer..."
                onChange={(e) => setUserAnswer(e.target.value)}
                value={userAnswer}
              />
              <button
                onClick={() => handleSubmitAnswer(userAnswer)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-700 ml-2"
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="flex">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                rows={5}
                className="w-full p-2 border rounded-md resize-none focus:outline-none focus:ring focus:border-blue-600 bg-gray-600 text-white"
              />
              <button
                onClick={summarizeText}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-700 ml-2"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  <div className="px-8 py-6 my-4 rounded-lg bg-gray-900 shadow-md">
    {
      !questions.length && (
        <h2 className="text-2xl font-semibold mb-4 text-white text-center">
          Your saved questions will appear here
        </h2>
      )
    }
    {questions.length && (
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white text-center">
          Saved Questions
        </h2>
        <div className="w-4/5 mx-auto">
          {questions.map((item) => (
            <div
              className="border-b border-gray-700"
              key={item.timestamp}
            >
              <button
                className="flex items-center justify-between w-full p-4 focus:outline-none hover:bg-gray-800"
                onClick={() => toggleAccordion(item.timestamp)}
              >
                <span className="text-lg text-white">{item.question}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform duration-300 ${
                    openId === item.timestamp ? 'rotate-90' : ''
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.293 7.293a1 1 0 0 1 1.414 1.414l-3 3a1 1 0 1 1-1.414-1.414l3-3zm6 0a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-height ease duration-300 ${
                  openId === item.timestamp ? 'h-auto' : 'h-0'
                }`}
              >
                <div className="p-4 text-gray-300">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
          </div>
        )}
      </div>
    </div>
  );
}
