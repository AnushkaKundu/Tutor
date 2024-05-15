import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserAuth } from "../context/AuthContext.mjs";

const Navbar = () => {
  const { user, googleSignIn, logOut } = UserAuth();
  const [loading, setLoading] = useState(true);

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  return (
    <div>
      {
        !loading && user && (
          <div className="h-20 w-full bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6"> 
          <ul className="flex space-x-4">
            <li className="text-gray-300 hover:text-white cursor-pointer transition duration-300">
              <Link href="/">Home</Link>
            </li>
            <li className="text-gray-300 hover:text-white cursor-pointer transition duration-300">
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li className="text-gray-300 hover:text-white cursor-pointer transition duration-300">
              <Link href="/statistics">Statistics and Activity</Link>
            </li>
          </ul>          
          <div className="flex items-center space-x-4">
          <p className="text-gray-300">Welcome, {user.displayName}</p>
          <p 
            className="text-blue-500 hover:text-blue-700 cursor-pointer transition duration-300" 
            onClick={handleSignOut}
          >
            Sign out
          </p>
        </div>          
        </div>
        )
      }
    </div>
  
  )
};

export default Navbar;
