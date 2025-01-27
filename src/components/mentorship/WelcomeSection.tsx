import React from 'react';

export function WelcomeSection() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Find Your Perfect Mentor
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Connect with experienced professionals who can guide you on your journey
      </p>
    </div>
  );
}