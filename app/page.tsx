"use client"
import { useState, useEffect } from 'react';
import { Libre_Franklin } from 'next/font/google'
import { UserAuth } from "./context/AuthContext.mjs";
import './globals.css'

const libre_franklin = Libre_Franklin({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-libre_franklin',
})

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export default function Component() {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const { googleSignIn, emailSignIn, emailSignUp } = UserAuth();
  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleEmailSignIn = async (e: any) => {
    e.preventDefault();
    console.log(email, password);
    try {
      await emailSignIn(email, password);
      // console.log(email, password);
    } catch (error: any) {
      setError(error.message);
      // console.log(error);
    }
  };
  const handleEmailSignUp = async () => {
    console.log(email, password);
    await emailSignUp(email, password)
    .then(() => console.log(email, password))
    .catch((error: any) => {
      setError(error.message);
      console.log(error);
    });
  }
  const handleSignUp = async () => {
    console.log(email, password);
    try {
        emailSignUp(email, password)
    } catch (error: any) {
        throw new Error(error.message);
    }        
}
  const AITutorTagline = () => {
    const [tagline, setTagline] = useState('');
    const fullTagline = 'Elevate Your Learning Experience, Tailored Just for You.';
  
    useEffect(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        setTagline(fullTagline.slice(0, currentIndex + 1));
        currentIndex++;
        if (currentIndex === fullTagline.length) {
          clearInterval(interval);
        }
      }, 100);
  
      return () => clearInterval(interval);
    }, [fullTagline]);
  
    return (
      <div className="bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-extrabold text-white sm:text-5xl lg:text-6xl">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              AI Tutor
            </span>
            <span className="block font-normal text-gray-200 drop-shadow-2xl py-4 leading-relaxed text-4xl">{tagline}</span>
          </h2>
        </div>
      </div>
    );
  };
  
  const DescribeError = (props: any) => {
    const str = (props.error).replace("Firebase: ", "").replace("Error (auth/", "").replace(").", "");
    return (
      <div className='flex flex-row justify-center space-x-6 align-center my-auto'>
        <FontAwesomeIcon
          icon={faExclamationCircle}
          size="1x"
          className="text-rose-500"
        />
        <div className='text-rose-500 flex justify-center'>
          {str}
        </div>
      </div>
    )
  };

  return (
    <div className={libre_franklin.variable}>
      <div className="grid grid-cols-2 h-screen">
        <div className="flex items-center justify-center">
          <AITutorTagline/>
        </div>
        <div className="flex items-center justify-center bg-gray-100 px-8">
          <div className="mx-auto max-w-sm bg-white rounded-lg shadow-md p-6 space-y-6"> 
            {mode === "login" && (<div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-gray-900">Login</h1>
              <p className="text-gray-500 dark:text-gray-400">Choose your preferred Login method</p>
            </div>)}
            {mode === "signup" && (<div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
              <p className="text-gray-500 dark:text-gray-400">Choose your preferred Sign Up method</p>
            </div>)}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleGoogleSignIn}>
                  <ChromeIcon className="h-5 w-5 mr-2" />
                  Google
                </Button>
                <Button variant="outline">
                  <GithubIcon className="h-5 w-5 mr-2" />
                  GitHub
                </Button>
                {/* <Button variant="outline">
                  <LinkedinIcon className="h-5 w-5 mr-2" />
                  LinkedIn
                </Button> */}
              </div>
            <Separator className="my-8" />
            {
              error !== "" && (
                <DescribeError error = {error}/>
              )
            }
            <form onSubmit={handleEmailSignIn} className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input id="email" placeholder="m@example.com" required type="email" onChange={(event) => setEmail(event.target.value)}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">Password</Label>
                <Input id="password" required type="password" onChange={(event) => {setPassword(event.target.value)}}/>
              </div>
              {mode === "login" && (<Link className="inline-block w-full text-center text-sm underline text-blue-500" href="#">
                Forgot your password?
              </Link>)}
              {mode === "login" && (<div className="w-full bg-blue-500 hover:bg-blue-400 text-white text-center py-1 rounded-md" onClick={handleEmailSignIn}>
                Login
              </div>)}
              {mode === "signup" && (<div className="w-full bg-blue-500 hover:bg-blue-400 text-white text-center py-1 rounded-md" onClick={handleEmailSignUp}>
                Sign Up
              </div>)}
            </form>
            {mode === "login" && (<div className='inline-block w-full text-center text-sm '>
              New here? 
              <div className='inline underline text-blue-500 px-2' 
              onClick={() => {
                setMode("signup");
                setError("");                
              }}>
                Sign Up
              </div>
            </div>)}
            {mode === "signup" && (<div className='inline-block w-full text-center text-sm '>
              Existing user? 
              <div className='inline underline text-blue-500 px-2' 
              onClick={() => {
                  setMode("login");
                  setError("");
              }}>
                Login
              </div>
            </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
)
}

function ChromeIcon(props : any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" x2="12" y1="8" y2="8" />
      <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
      <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
    </svg>
  )
}


function GithubIcon(props : any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}


// function LinkedinIcon(props : any) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
//       <rect width="4" height="12" x="2" y="9" />
//       <circle cx="4" cy="4" r="2" />
//     </svg>
//   )
// }