import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

const sampleQuestions = [
    {
        id: 1,
        question: "If a train travels 360 kilometers in 4 hours, what is its average speed in kilometers per hour?",
        options: ["80 km/h", "90 km/h", "85 km/h", "95 km/h"],
        correctAnswer: "90 km/h"
    },
    {
        id: 2,
        question: "A shopkeeper bought 100 pens at ₹8 each and sold them at ₹10 each. What is the percentage of profit?",
        options: ["20%", "25%", "15%", "30%"],
        correctAnswer: "25%"
    },
    {
        id: 3,
        question: "If 8 workers can complete a job in 6 days, how many workers are needed to complete the same job in 4 days?",
        options: ["10 workers", "12 workers", "14 workers", "16 workers"],
        correctAnswer: "12 workers"
    }
];

export function Quiz() {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question

    useEffect(() => {
        if (!showScore && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !showScore) {
            handleNextQuestion();
        }
    }, [timeLeft, showScore]);

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
        if (answer === sampleQuestions[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        if (currentQuestion < sampleQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setTimeLeft(30);
        } else {
            setShowScore(true);
        }
    };

    const getScoreMessage = () => {
        const percentage = (score / sampleQuestions.length) * 100;
        if (percentage >= 80) return "Excellent! You've mastered this topic!";
        if (percentage >= 60) return "Good job! Keep practicing to improve further.";
        return "Keep practicing! You'll get better with time.";
    };

    if (showScore) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto"
                >
                    <Card className="p-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
                        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Quiz Complete!
                        </h2>
                        <div className="text-center mb-8">
                            <p className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                                {score} / {sampleQuestions.length}
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                {getScoreMessage()}
                            </p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setCurrentQuestion(0);
                                    setScore(0);
                                    setShowScore(false);
                                    setTimeLeft(30);
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/aptitude-test')}
                                className="px-6 py-2 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Back to Tests
                            </button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Question {currentQuestion + 1} of {sampleQuestions.length}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Time Left: {timeLeft}s
                        </span>
                    </div>
                    <Progress value={(currentQuestion + 1) * (100 / sampleQuestions.length)} />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-6 mb-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                                {sampleQuestions[currentQuestion].question}
                            </h2>
                            <div className="space-y-4">
                                {sampleQuestions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(option)}
                                        className={`w-full p-4 text-left rounded-lg transition-colors ${
                                            selectedAnswer === option
                                                ? 'bg-purple-100 dark:bg-purple-900 border-2 border-purple-500'
                                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        <span className="text-gray-900 dark:text-white">
                                            {option}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </Card>
                        <div className="flex justify-end">
                            <button
                                onClick={handleNextQuestion}
                                disabled={!selectedAnswer}
                                className={`px-6 py-2 rounded-lg transition-opacity ${
                                    selectedAnswer
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'
                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {currentQuestion === sampleQuestions.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
