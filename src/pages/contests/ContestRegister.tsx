import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Contest } from '@/types/contest';
import { useState } from 'react';

export default function ContestRegister() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  // Placeholder contest data for UI development
  const contestData: Contest = {
    id: id || '',
    title: 'Weekly Coding Challenge',
    description: 'Join our weekly coding challenge to test your skills and compete with other developers.',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    end_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
    created_at: new Date().toISOString(),
    is_public: true,
    participant_count: 0,
    coding_problems: []
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader 
          type="spinner"
          size="large"
          message="Loading contest details..."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 space-y-6 bg-gray-900 text-white">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {contestData.title}
          </h1>
          
          <div className="text-lg text-gray-300">
            {contestData.description}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400">Start Time</h3>
              <p className="text-gray-300">
                {new Date(contestData.start_time).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400">End Time</h3>
              <p className="text-gray-300">
                {new Date(contestData.end_time).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg mt-6">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Contest Rules</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>Read all problems carefully before starting</li>
              <li>Each problem has its own scoring criteria</li>
              <li>You can submit multiple times for each problem</li>
              <li>Your highest score for each problem will be considered</li>
              <li>Time limit and memory constraints are strictly enforced</li>
              <li>Use of external libraries may be restricted</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg mt-6">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Prizes & Recognition</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>Top performers will be featured on the leaderboard</li>
              <li>Certificates for top 3 winners</li>
              <li>Special badges for outstanding solutions</li>
            </ul>
          </div>

          <div className="pt-6">
            <Button
              disabled={loading}
              className={`w-full h-12 text-lg transition-all duration-300 ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader type="spinner" size="small" />
                  <span>Registering...</span>
                </div>
              ) : (
                'Register for Contest'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}