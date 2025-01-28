import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Loader } from '../ui/loader';

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface TestModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

const categories = [
  { id: 'global', name: 'Global Companies', icon: '🌍' },
  { id: 'startup', name: 'Startups', icon: '🚀' },
  { id: 'product', name: 'Product-Based Companies', icon: '💻' },
  { id: 'consulting', name: 'Consulting Firms', icon: '📊' },
];

const companies: Record<string, Company[]> = {
  'Global Companies': [
    { id: 'microsoft', name: 'Microsoft', logo: 'https://companieslogo.com/img/orig/MSFT-a203b22d.png?t=1633073277' },
    { id: 'amazon', name: 'Amazon', logo: 'https://companieslogo.com/img/orig/AMZN-e9f942e4.png?t=1632523695' },
    { id: 'google', name: 'Google', logo: 'https://companieslogo.com/img/orig/GOOGL-0ed88f7c.png?t=1633218227' },
  ],
  'Startups': [
    { id: 'zomato', name: 'Zomato', logo: 'https://companieslogo.com/img/orig/ZOMATO.NS-4b35a9e1.png?t=1631949272' },
    { id: 'swiggy', name: 'Swiggy', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png' },
    { id: 'flipkart', name: 'Flipkart', logo: 'https://companieslogo.com/img/orig/FLIP.NS-18f8a8c5.png?t=1631949272' },
  ],
  'Product-Based Companies': [
    { id: 'microsoft', name: 'Microsoft', logo: 'https://companieslogo.com/img/orig/MSFT-a203b22d.png?t=1633073277' },
    { id: 'amazon', name: 'Amazon', logo: 'https://companieslogo.com/img/orig/AMZN-e9f942e4.png?t=1632523695' },
    { id: 'google', name: 'Google', logo: 'https://companieslogo.com/img/orig/GOOGL-0ed88f7c.png?t=1633218227' },
  ],
  'Consulting Firms': [
    { id: 'tcs', name: 'TCS', logo: 'https://companieslogo.com/img/orig/TCS.NS-7401f1bd.png?t=1631949260' },
    { id: 'infosys', name: 'Infosys', logo: 'https://companieslogo.com/img/orig/INFY-ea82b563.png?t=1631949272' },
  ],
};

const difficultyColors = {
  'Easy': 'bg-green-500',
  'Intermediate': 'bg-yellow-500',
  'Hard': 'bg-red-500',
};

export function AptitudeTest() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timer, setTimer] = useState<number>(1800);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timer]);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedCompany('');
    setCurrentStep(1);
    setIsCompaniesLoading(true);
    // Simulate loading companies data
    setTimeout(() => {
      setIsCompaniesLoading(false);
    }, 1000);
  };

  const handleCompanySelect = (companyId: string) => {
    navigate(`/aptitude-test/company/${companyId}`);
  };

  const startTest = (moduleId: string) => {
    setCurrentStep(3);
    setTimer(1800);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Loader 
          type="dots" 
          size="large" 
          message="Loading aptitude test platform..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Aptitude Test Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Test your skills and prepare for your dream company
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <Progress value={(currentStep / 3) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Select Category</span>
            <span>Choose Company</span>
            <span>Take Test</span>
          </div>
        </div>

        {/* Step 1: Category Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select Category
            </label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    className="flex items-center py-3 hover:bg-purple-50"
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Step 2: Company Selection */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
              Select Company
            </h2>
            {isCompaniesLoading ? (
              <div className="flex justify-center py-12">
                <Loader 
                  type="spinner" 
                  size="medium" 
                  message="Loading companies..." 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {companies[categories.find((cat) => cat.id === selectedCategory)?.name as keyof typeof companies].map((company) => (
                  <motion.div
                    key={company.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="cursor-pointer"
                    onClick={() => handleCompanySelect(company.id)}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-colors ${
                        selectedCompany === company.id
                          ? 'bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 flex-shrink-0">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                            {company.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            Click to view tests
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Test Modules */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
              Available Test Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Easy', 'Intermediate', 'Hard'].map((difficulty, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                        Quantitative Test {index + 1}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`${difficultyColors[difficulty as keyof typeof difficultyColors]} text-white`}
                      >
                        {difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      10 questions covering arithmetic and basic math skills.
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300 mb-4">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Duration: 30 minutes
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        10 Questions
                      </span>
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                      onClick={() => startTest(`module-${index}`)}
                    >
                      Start Test
                    </button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Question Interface */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-8 shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    Question {currentQuestion + 1}/10
                  </span>
                  <Progress
                    value={((currentQuestion + 1) / 10) * 100}
                    className="w-32 h-2"
                  />
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">{formatTime(timer)}</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                  What is the sum of first 100 natural numbers?
                </h3>
                <div className="space-y-4">
                  {['5050', '5150', '5000', '5250'].map((option, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAnswer === option
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-purple-200 dark:border-gray-600 dark:hover:border-purple-600'
                        }`}
                        onClick={() => setSelectedAnswer(option)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedAnswer === option
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {selectedAnswer === option && (
                            <div className="w-2 h-2 bg-white rounded-full dark:bg-gray-900" />
                          )}
                        </div>
                        <span className="text-gray-800 dark:text-white">{option}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  onClick={() => setCurrentQuestion(Math.min(9, currentQuestion + 1))}
                >
                  {currentQuestion === 9 ? 'Submit Test' : 'Next Question'}
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
