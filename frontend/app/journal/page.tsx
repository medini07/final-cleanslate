'use client';

import React from 'react';
import MainLayout from '../../components/layout/MainLayout';

const JournalPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">My Journal</h1>
        
        <div className="grid gap-6">
          {/* Journal entries section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Daily Reflections</h2>
            
            {/* Create new entry */}
            <div className="mb-6">
              <button className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Journal Entry
              </button>
            </div>
            
            {/* Journal entries list */}
            <div className="space-y-4">
              {/* Sample entry 1 */}
              <div className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">April 21, 2025</h3>
                  <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">Day 14</span>
                </div>
                <p className="text-gray-600 mt-2">
                  Today was challenging. I had strong cravings after lunch, but I managed to distract myself by taking a short walk instead. I'm proud that I didn't give in.
                </p>
                <div className="flex gap-4 mt-3">
                  <span className="text-xs text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Mood: Steady
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    Craving Level: Moderate
                  </span>
                </div>
              </div>
              
              {/* Sample entry 2 */}
              <div className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">April 20, 2025</h3>
                  <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">Day 13</span>
                </div>
                <p className="text-gray-600 mt-2">
                  I noticed I'm starting to breathe easier, especially during my morning walk. My clothes don't smell like smoke anymore, which is a wonderful change. I'm feeling more confident about this journey.
                </p>
                <div className="flex gap-4 mt-3">
                  <span className="text-xs text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Mood: Positive
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    Craving Level: Low
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats box */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Journal Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-primary">14</p>
                <p className="text-sm text-gray-600">Journal Entries</p>
              </div>
              <div className="bg-primary/5 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-primary">8</p>
                <p className="text-sm text-gray-600">Positive Days</p>
              </div>
              <div className="bg-primary/5 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-primary">3</p>
                <p className="text-sm text-gray-600">Tough Days Overcome</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JournalPage;