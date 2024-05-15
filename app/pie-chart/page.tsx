"use client"
import React, {useEffect, useState} from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChartData } from 'chart.js';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from './../../tailwind.config';
import AnswerStats from './piestats';

import {ref, get} from 'firebase/database';
import {database} from '../firebase';
import { UserAuth } from '../context/AuthContext.mjs';

ChartJS.register(ArcElement, Tooltip, Legend);


const PieChart = (props: any) => {
  const {user} = UserAuth();
  const [uid, setUid] = useState("");
  const fullConfig = resolveConfig(tailwindConfig);
  const colors = fullConfig.theme.colors;

  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [skipped, setSkipped] = useState(0);

  useEffect(() => {
    setUid(user?.uid);
    console.log(user?.uid);
  }, [user]);
  
  const getAnswerStats = async (action: string) => {
    const reference = ref(database, `/answerStats/${uid}/${action}`);
    const snapshot = await get(reference);
    if (snapshot.exists()) {
      if (action === 'correct') {
        setCorrect(snapshot.val());
      } else if (action === 'incorrect') {
        setIncorrect(snapshot.val());
      } else {
        setSkipped(snapshot.val());
      }
    } 
  };

  getAnswerStats("correct");
  getAnswerStats("incorrect");
  getAnswerStats("skipped");

  const data: ChartData<'pie', number[], string> = {
    labels: ['Correct', 'Incorrect', 'Skipped'],
    datasets: [
      {
        data: [correct,incorrect,skipped],
        backgroundColor: [
          colors.blue['500'], // Correct - Vibrant blue 
          colors.red['600'],   // Incorrect - Noticeable red 
          colors.slate['400'], // Skipped - Soft gray 
        ],
        hoverBackgroundColor: [
          colors.blue['600'],
          colors.red['700'],
          colors.slate['500'],
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false, 
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
    cutout: '65%', // Larger cutout for a more modern look
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white text-center pt-4">
        Answer Statistics
      </h2>
      <div className="flex flex-row justify-center bg-gray-900 p-4 rounded-lg shadow-md" > 
      <div >
        <Pie data={data} options={options} />
      </div>
      <AnswerStats correctlyAnswered={correct} incorrectlyAnswered={incorrect} skipped={skipped}/>
    </div>
    </div>
  );
};

export default PieChart;