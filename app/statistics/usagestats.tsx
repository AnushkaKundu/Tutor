"use client";
import React, { useState, useEffect } from 'react';
import { ref, get, child } from 'firebase/database';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import moment from 'moment';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement);
import { database } from './../firebase';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

interface ActionData {
  [key: string]: number; // Key can be date ('YYYY-MM-DD') or hour ('HH')
}

const UserStatisticsChart = (props: { uid: string }) => {
  const [chartData, setChartData] = useState({ daily: null, weekly: null } as { daily: ChartData | null; weekly: ChartData | null });
  const [activeChart, setActiveChart] = useState('daily');

  function encode(key: string) {
    return encodeURIComponent(key).replace(/\.|\#|\$|\[|\]/g, (match) => {
      return '%' + match.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      const fetchActionData = async (action: string, timeRange: 'daily' | 'weekly') => {
        const statisticsRef = ref(database, `/statistics/${props.uid}/${action}`);
        try {
          const snapshot = await get(statisticsRef);
          const data: ActionData = {};
          if (snapshot.exists()) {
            console.log(`${action} snapshot exists.`);
            snapshot.forEach((childSnapshot) => {
              const timestamp: number = childSnapshot.val();
              let key: string;
              if (timeRange === 'daily') {
                key = moment(timestamp).format('HH'); 
              } else {
                key = moment(timestamp).format('YYYY-MM-DD'); 
              }
              data[key] = (data[key] || 0) + 1;
            });
          } else {
            console.log(
              `/statistics/${props.uid}/${action}: ${action} snapshot dne.`,
            );
          }
          console.log(action, data);
          return data;
        } catch (error) {
          console.error(error);
          return {}; // Return an empty object in case of an error
        }
      };

      const downloadsDataDaily = (await fetchActionData('downloads', 'daily')) as ActionData;
      const uploadsDataDaily = (await fetchActionData('uploads', 'daily')) as ActionData;
      const queriesDataDaily = (await fetchActionData('queries', 'daily')) as ActionData;
      const downloadsDataWeekly = (await fetchActionData(
        'downloads',
        'weekly',
      )) as ActionData;
      const uploadsDataWeekly = (await fetchActionData('uploads', 'weekly')) as ActionData;
      const queriesDataWeekly = (await fetchActionData('queries', 'weekly')) as ActionData;

      // Prepare data for the past week
      const pastWeek = Array.from(Array(7).keys()).map((i) =>
        moment().subtract(i, 'days').format('YYYY-MM-DD'),
      ).reverse();
      const now = moment();
      const hours = Array.from(Array(24).keys()).map((i) =>
        now
          .clone() // Create a copy of the moment object to avoid modifying the original
          .subtract(i, 'hours')
          .format('HH'),
      ).reverse();

      // Daily Chart Data
      const dailyChartData: ChartData = {
        labels: hours,
        datasets: [
          {
            label: 'Queries',
            data: hours.map((hour) => (queriesDataDaily[hour] || 0) + (downloadsDataDaily[hour] || 0) + (uploadsDataDaily[hour] || 0)),
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
          },
        ],
      };

      // Weekly Chart Data
      const weeklyChartData: ChartData = {
        labels: pastWeek,
        datasets: [
          {
            label: 'Queries',
            data: pastWeek.map((date) => (queriesDataWeekly[date] || 0) + (uploadsDataWeekly[date] || 0) + (downloadsDataWeekly[date] || 0)),
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
          },
        ],
      };

      setChartData({ daily: dailyChartData, weekly: weeklyChartData });
    };
    fetchData();
  }, [props.uid]);

    if (!chartData.daily || !chartData.weekly) {
        return <div>Loading...</div>;
    }
    return (
    <div>
    <h2 className="text-2xl font-semibold mb-4 text-white text-center pt-4">
        App Usage Statistics
    </h2>
      <div className='flex justify-center'>
      <div className="flex flex-row space-x-4 mb-4 p-1 bg-slate-400 rounded-md justify-center"> 
        <button
          className={`px-4 py-2 rounded-md font-medium ${activeChart === 'weekly' ? 'bg-slate-450 text-gray-700' : 'bg-slate-900 hover:bg-gray-600 text-white'}`}
          onClick={() => setActiveChart('daily')}
        >
          Daily
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium ${activeChart === 'daily' ? 'bg-slate-450 text-gray-700' : 'bg-slate-900 hover:bg-gray-600 text-white'}`}
          onClick={() => setActiveChart('weekly')}
        >
          Weekly
        </button>
      </div>
      </div>

      <div className="bg-gray-900 p-4 rounded-md flex justify-center mt-2"> 
      <div className="w-full flex-grow lg:w-1/2 lg:flex-grow-0"> {/* Chart container */}
            {activeChart === 'daily' ? (
            <Line data={chartData.daily} />
            ) : (
            <Line data={chartData.weekly} />
            )}
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsChart;