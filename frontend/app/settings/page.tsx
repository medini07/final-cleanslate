'use client';

import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';

const SettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [weeklyReports, setWeeklyReports] = useState(true);
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Settings</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                {/* Profile Information */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Profile Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        defaultValue="Alex Johnson"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        defaultValue="alex@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Password Change */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        id="current-password" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input 
                          type="password" 
                          id="new-password" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          id="confirm-password" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                {/* Enable/Disable Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">Enable Notifications</h3>
                    <p className="text-sm text-gray-500">Receive updates about your progress and reminders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                {notificationsEnabled && (
                  <>
                    {/* Daily Reminders */}
                    <div className="flex items-center justify-between pl-4 border-l-2 border-primary/30">
                      <div>
                        <h3 className="font-medium text-gray-700">Daily Reminders</h3>
                        <p className="text-sm text-gray-500">Get daily motivation and tracking reminders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={dailyReminders} onChange={() => setDailyReminders(!dailyReminders)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    {/* Reminder Time */}
                    {dailyReminders && (
                      <div className="pl-8 border-l-2 border-primary/30">
                        <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700 mb-1">Daily Reminder Time</label>
                        <input 
                          type="time" 
                          id="reminder-time" 
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    )}
                    
                    {/* Weekly Reports */}
                    <div className="flex items-center justify-between pl-4 border-l-2 border-primary/30">
                      <div>
                        <h3 className="font-medium text-gray-700">Weekly Progress Reports</h3>
                        <p className="text-sm text-gray-500">Receive a summary of your weekly progress</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={weeklyReports} onChange={() => setWeeklyReports(!weeklyReports)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Plan Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Cessation Plan</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Current Plan</h3>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">8-Week Gradual Reduction</p>
                        <p className="text-sm text-gray-600">Started: Apr 7, 2025</p>
                      </div>
                      <span className="bg-primary/20 text-primary text-sm px-3 py-1 rounded-full">Week 3 of 8</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Adjust Plan Difficulty</h3>
                  <div className="space-y-2">
                    <label htmlFor="difficulty" className="block text-sm text-gray-600">Current difficulty: Moderate</label>
                    <input 
                      type="range" 
                      id="difficulty" 
                      min="1" 
                      max="5" 
                      defaultValue="3"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Easier</span>
                      <span>Harder</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors">
                    Update Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            {/* Display Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Display Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <select 
                    id="theme" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    defaultValue="light"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="color-scheme" className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
                  <select 
                    id="color-scheme" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    defaultValue="blue"
                  >
                    <option value="blue">Blue (Default)</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="teal">Teal</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Privacy Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Privacy Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input 
                    id="share-progress" 
                    name="share-progress" 
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
                  />
                  <label htmlFor="share-progress" className="ml-2 block text-sm text-gray-700">
                    Share my progress anonymously
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    id="research" 
                    name="research" 
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
                  />
                  <label htmlFor="research" className="ml-2 block text-sm text-gray-700">
                    Contribute data to improve cessation research
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    id="show-profile" 
                    name="show-profile" 
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
                  />
                  <label htmlFor="show-profile" className="ml-2 block text-sm text-gray-700">
                    Show my profile in community
                  </label>
                </div>
              </div>
            </div>
            
            {/* Account Actions */}
            <div className="mt-6">
              <button className="w-full py-3 px-4 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;