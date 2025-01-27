import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface CompanyInfo {
  id: string;
  name: string;
  logo: string;
  description: string;
  employeeCount: string;
  headquarters: string;
  founded: string;
  industry: string;
}

const companyInfo: Record<string, CompanyInfo> = {
  tcs: {
    id: 'tcs',
    name: 'TCS',
    logo: 'https://companieslogo.com/img/orig/TCS.NS-7401f1bd.png?t=1631949260',
    description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company.',
    employeeCount: '500,000+',
    headquarters: 'Mumbai, India',
    founded: '1968',
    industry: 'Information Technology',
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart',
    logo: 'https://companieslogo.com/img/orig/FLIP.NS-18f8a8c5.png?t=1631949272',
    description: 'Flipkart is India\'s leading e-commerce marketplace with over 150 million products across 80+ categories.',
    employeeCount: '50,000+',
    headquarters: 'Bangalore, India',
    founded: '2007',
    industry: 'E-commerce',
  },
  infosys: {
    id: 'infosys',
    name: 'Infosys',
    logo: 'https://companieslogo.com/img/orig/INFY-ea82b563.png?t=1631949272',
    description: 'Infosys is a global leader in next-generation digital services and consulting.',
    employeeCount: '300,000+',
    headquarters: 'Bangalore, India',
    founded: '1981',
    industry: 'Information Technology',
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    logo: 'https://companieslogo.com/img/orig/MSFT-a203b22d.png?t=1633073277',
    description: 'Microsoft Corporation is an American multinational technology corporation that develops computer software, consumer electronics, and related services.',
    employeeCount: '180,000+',
    headquarters: 'Redmond, Washington, USA',
    founded: '1975',
    industry: 'Technology',
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://companieslogo.com/img/orig/AMZN-e9f942e4.png?t=1632523695',
    description: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.',
    employeeCount: '1,600,000+',
    headquarters: 'Seattle, Washington, USA',
    founded: '1994',
    industry: 'Technology, E-commerce',
  },
  google: {
    id: 'google',
    name: 'Google',
    logo: 'https://companieslogo.com/img/orig/GOOGL-0ed88f7c.png?t=1633218227',
    description: 'Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.',
    employeeCount: '150,000+',
    headquarters: 'Mountain View, California, USA',
    founded: '1998',
    industry: 'Technology',
  },
  zomato: {
    id: 'zomato',
    name: 'Zomato',
    logo: 'https://companieslogo.com/img/orig/ZOMATO.NS-4b35a9e1.png?t=1631949272',
    description: 'Zomato is an Indian multinational restaurant aggregator and food delivery company.',
    employeeCount: '5,000+',
    headquarters: 'Gurgaon, India',
    founded: '2008',
    industry: 'Food Delivery',
  },
  swiggy: {
    id: 'swiggy',
    name: 'Swiggy',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png',
    description: 'Swiggy is India\'s leading on-demand delivery platform with a tech-first approach to logistics and a solution-first approach to consumer demands.',
    employeeCount: '5,000+',
    headquarters: 'Bangalore, India',
    founded: '2014',
    industry: 'Food Delivery',
  }
};

const modules = [
  {
    id: 'quantitative',
    title: 'Quantitative Aptitude',
    description: 'Test your mathematical and analytical skills',
    difficulty: 'Intermediate',
    questions: 20,
    duration: 30,
    topics: ['Arithmetic', 'Algebra', 'Data Interpretation'],
    bestScore: 85,
  },
  {
    id: 'logical',
    title: 'Logical Reasoning',
    description: 'Evaluate your logical thinking and problem-solving abilities',
    difficulty: 'Hard',
    questions: 15,
    duration: 25,
    topics: ['Verbal Reasoning', 'Non-verbal Reasoning', 'Critical Thinking'],
    bestScore: 90,
  },
  {
    id: 'verbal',
    title: 'Verbal Ability',
    description: 'Assess your English language and communication skills',
    difficulty: 'Easy',
    questions: 25,
    duration: 35,
    topics: ['Reading Comprehension', 'Grammar', 'Vocabulary'],
    bestScore: 75,
  },
];

export function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const company = companyInfo[companyId || ''];

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Company Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/aptitude-test')}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    Easy: 'bg-green-500 dark:bg-green-600',
    Intermediate: 'bg-yellow-500 dark:bg-yellow-600',
    Hard: 'bg-red-500 dark:bg-red-600',
  };

  const startTest = (moduleId: string) => {
    navigate(`/aptitude-test/quiz/${moduleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="flex items-center space-x-8">
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={company.logo}
                alt={company.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {company.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {company.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Founded
                  </h3>
                  <p className="text-gray-900 dark:text-white">{company.founded}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Headquarters
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {company.headquarters}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Employees
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {company.employeeCount}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Industry
                  </h3>
                  <p className="text-gray-900 dark:text-white">{company.industry}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Test Modules */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Available Test Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <motion.div
              key={module.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                    {module.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`${
                      difficultyColors[
                        module.difficulty as keyof typeof difficultyColors
                      ]
                    } text-white`}
                  >
                    {module.difficulty}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {module.description}
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="text-gray-900 dark:text-white">
                      {module.duration} minutes
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                    <span className="text-gray-900 dark:text-white">
                      {module.questions}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Best Score:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {module.bestScore}%
                    </span>
                  </div>
                </div>
                <div className="space-x-2 mb-4">
                  {module.topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
                <button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white py-2 rounded-lg transition-opacity"
                  onClick={() => startTest(module.id)}
                >
                  Start Test
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
