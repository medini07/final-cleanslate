'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MainLayout from '@/components/layout/MainLayout';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Dummy data for the dashboard
const dummyUser = {
  name: 'Ayam ',
  age: 32,
  startDate: '2025-03-15',
  initialCigarettes: 20,
  currentWeek: 3,
  streak: 18, // days
};

const dummyWeeklyGoals = [
  { week: 1, dailyLimit: 18, actualAverage: 17.5, completed: true },
  { week: 2, dailyLimit: 15, actualAverage: 14.2, completed: true },
  { week: 3, dailyLimit: 12, actualAverage: 11.8, completed: false },
  { week: 4, dailyLimit: 9, actualAverage: null, completed: false },
  { week: 5, dailyLimit: 6, actualAverage: null, completed: false },
  { week: 6, dailyLimit: 4, actualAverage: null, completed: false },
  { week: 7, dailyLimit: 2, actualAverage: null, completed: false },
  { week: 8, dailyLimit: 0, actualAverage: null, completed: false },
];

const dummyDailyEntries = [
  { date: '2025-03-15', count: 18, notes: 'First day, feeling motivated!' },
  { date: '2025-03-16', count: 19, notes: 'Difficult day at work, smoked more than planned' },
  { date: '2025-03-17', count: 17, notes: 'Starting to feel better physically' },
  { date: '2025-03-18', count: 16, notes: 'Craving was strong but managed to reduce' },
  { date: '2025-03-19', count: 16, notes: 'Consistent day' },
  { date: '2025-03-20', count: 15, notes: 'Good progress!' },
  { date: '2025-03-21', count: 15, notes: 'End of week 1, feeling positive' },
  { date: '2025-03-22', count: 15, notes: 'Started week 2 well' },
  { date: '2025-03-23', count: 14, notes: 'Met with friends, managed to reduce' },
  { date: '2025-03-24', count: 14, notes: 'Feeling less dependent' },
  { date: '2025-03-25', count: 13, notes: 'Good day, below target!' },
  { date: '2025-03-26', count: 15, notes: 'Stressful meeting today' },
  { date: '2025-03-27', count: 14, notes: 'Back on track' },
  { date: '2025-03-28', count: 15, notes: 'End of week 2, consistent progress' },
  { date: '2025-03-29', count: 12, notes: 'Great start to week 3!' },
  { date: '2025-03-30', count: 12, notes: 'Feeling more energetic' },
  { date: '2025-03-31', count: 11, notes: 'Below target again!' },
  { date: '2025-04-01', count: 12, notes: 'Maintaining good control' },
];

// Calculate achievements
const calculateAchievements = () => {
  const totalReduction = dummyUser.initialCigarettes - dummyDailyEntries[dummyDailyEntries.length - 1].count;
  const percentReduction = Math.round((totalReduction / dummyUser.initialCigarettes) * 100);
  const cigarettesAvoided = dummyDailyEntries.reduce((total, entry, index) => {
    if (index === 0) return 0;
    return total + (dummyUser.initialCigarettes - entry.count);
  }, 0);
  const moneySaved = cigarettesAvoided * 0.5; // Assuming $0.50 per cigarette
  
  return {
    totalReduction,
    percentReduction,
    cigarettesAvoided,
    moneySaved: moneySaved.toFixed(2),
    daysSmokeFree: 0, // None yet in this early stage
  };
};

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ count: '', notes: '' });
  const [cigarettesData, setCigarettesData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Simulate loading data from API
  useEffect(() => {
    // Prepare chart data
    const chartLabels = dummyDailyEntries.map(entry => formatDate(entry.date));
    const chartData = dummyDailyEntries.map(entry => entry.count);
    const goalData = dummyDailyEntries.map((entry, index) => {
      // Find which week this entry belongs to
      const entryDate = new Date(entry.date);
      const startDate = new Date(dummyUser.startDate);
      const dayDiff = Math.floor((entryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(dayDiff / 7);
      
      return dummyWeeklyGoals[weekIndex]?.dailyLimit || null;
    });
    
    setCigarettesData({
      labels: chartLabels,
      datasets: [
        {
          label: 'Daily Cigarettes',
          data: chartData,
          borderColor: '#8A2BE2',
          backgroundColor: 'rgba(138, 43, 226, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Daily Target',
          data: goalData,
          borderColor: '#9370DB',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.1,
          pointRadius: 0,
        },
      ],
    });
    
    setAchievements(calculateAchievements());
    
    // Simulate API loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.count) return;
    
    setIsSubmitting(true);
    
    // Simulate API call to add new entry
    setTimeout(() => {
      // Just for demo purposes - in real app we would update the backend
      setIsSubmitting(false);
      setShowAddEntryForm(false);
      setNewEntry({ count: '', notes: '' });
      
      // Show success toast or notification here
    }, 1000);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome back, {dummyUser.name}</h1>
            <p className="text-gray-600">Week {dummyUser.currentWeek} of your 8-week journey • Started on {new Date(dummyUser.startDate).toLocaleDateString()}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={() => setShowAddEntryForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Log Today's Cigarettes
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="purple" hoverable className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Current Week Target</h3>
              <span className="bg-primary/10 px-2 py-1 rounded text-sm font-medium">Week {dummyUser.currentWeek}</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-bold">{dummyWeeklyGoals[dummyUser.currentWeek-1].dailyLimit}</span>
                <span className="ml-2">cigarettes/day</span>
              </div>
              <div className="text-right text-sm">
                <div>Current Avg:</div>
                <div className="font-bold text-black">{dummyWeeklyGoals[dummyUser.currentWeek-1].actualAverage || '-'}</div>
              </div>
            </div>
          </Card>
          
          <Card variant="purple" hoverable className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Your Streak</h3>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">Days</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-primary">{dummyUser.streak}</span>
                <span className="ml-2">days consistent</span>
              </div>
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
          </Card>
          
          <Card variant="purple" hoverable className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Overall Reduction</h3>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">Progress</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-primary">{achievements.percentReduction}%</span>
                <span className="ml-2">from start</span>
              </div>
              <div className="text-right text-sm">
                <div>From {dummyUser.initialCigarettes} to</div>
                <div className="font-bold text-black">{dummyDailyEntries[dummyDailyEntries.length - 1].count} per day</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <div className="mb-8">
          <Card className="bg-white p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">Your Progress</h2>
            {cigarettesData && (
              <div className="h-[400px]">
                <Line
                  data={cigarettesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Cigarettes'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Date'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      tooltip: {
                        backgroundColor: 'rgba(138, 43, 226, 0.8)',
                      }
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Achievements and Weekly Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Achievements */}
          <Card variant="gradient" hoverable className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-primary">Your Achievements</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cigarettes Avoided</p>
                  <p className="font-bold">{achievements.cigarettesAvoided} cigarettes</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Money Saved</p>
                  <p className="font-bold">${achievements.moneySaved}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Health Milestone</p>
                  <p className="font-bold">Carbon Monoxide Levels Normalizing</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reduction</p>
                  <p className="font-bold">{achievements.totalReduction} cigarettes per day</p>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Right: Weekly Goals Progress */}
          <Card variant="gradient" className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-primary">8-Week Plan Progress</h2>
            <div className="space-y-4">
              {dummyWeeklyGoals.map((week) => (
                <div key={week.week} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Week {week.week}</h3>
                    <div>
                      {week.completed ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Completed</span>
                      ) : week.week === dummyUser.currentWeek ? (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Current</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">Upcoming</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-1">
                    <span className="text-sm text-gray-600 w-32">Daily Limit:</span>
                    <span className="font-medium">{week.dailyLimit} cigarettes</span>
                  </div>
                  
                  {week.actualAverage !== null && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-32">Your Average:</span>
                      <span className={`font-medium ${
                        week.actualAverage <= week.dailyLimit ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {week.actualAverage} cigarettes
                      </span>
                    </div>
                  )}
                  
                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        week.completed 
                          ? 'bg-green-500' 
                          : week.week === dummyUser.currentWeek 
                            ? 'bg-primary' 
                            : 'bg-gray-300'
                      }`}
                      style={{ 
                        width: `${week.completed ? '100' : week.week === dummyUser.currentWeek ? '40' : '0'}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Entries */}
        <Card variant="gradient" className="mb-8 text-white">
          <h2 className="text-xl font-bold mb-4 text-primary">Recent Entries</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full ">
              <thead>
                <tr className="bg-primary/10 ">
                  <th className="py-2 px-4 text-left rounded-tl-lg">Date</th>
                  <th className="py-2 px-4 text-left">Cigarettes</th>
                  <th className="py-2 px-4 text-left">Target</th>
                  <th className="py-2 px-4 text-left rounded-tr-lg">Notes</th>
                </tr>
              </thead>
              <tbody>
                {dummyDailyEntries.slice(-5).reverse().map((entry, index) => {
                  // Calculate which week's target applies
                  const entryDate = new Date(entry.date);
                  const startDate = new Date(dummyUser.startDate);
                  const dayDiff = Math.floor((entryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const weekIndex = Math.floor(dayDiff / 7);
                  const target = dummyWeeklyGoals[weekIndex]?.dailyLimit;
                  const isOverTarget = entry.count > target;
                  
                  return (
                    <tr key={entry.date} className="border-b hover:bg-purple-300">
                      <td className="py-3 px-4">{formatDate(entry.date)}</td>
                      <td className={`py-3 px-4 font-medium ${isOverTarget ? 'text-red-600' : 'text-green-600'}`}>
                        {entry.count}
                      </td>
                      <td className="py-3 px-4">
                        {target}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {entry.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        
        {/* Modal for adding new entry */}
        {showAddEntryForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-primary">Log Today's Cigarettes</h3>
                  <button 
                    onClick={() => setShowAddEntryForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmitEntry}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Cigarettes Smoked Today</label>
                    <input
                      type="number"
                      min="0"
                      value={newEntry.count}
                      onChange={(e) => setNewEntry({...newEntry, count: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter number"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Notes (optional)</label>
                    <textarea
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="How was your day? Any triggers or challenges?"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => setShowAddEntryForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={isSubmitting}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      Save Entry
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}