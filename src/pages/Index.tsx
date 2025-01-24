import { useState, useEffect } from "react";
import { 
  Brain, 
  Code2, 
  Users as UsersIcon, 
  Building, 
  MessageSquare, 
  BookOpen, 
  Target, 
  Zap,
  Plus,
  Minus,
  Video,
  Star,
  Heart,
  ThumbsUp,
  BrainCircuit,
  BrainCog
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PracticeModeCard } from "@/components/PracticeModeCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MdSmartToy } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LearningPathCards } from "@/components/learning/LearningPathCards";

const feedbacks = [
  {
    name: "John Doe",
    message: "Great platform for interview prep!",
    profileImage: "https://randomuser.me/api/portraits/men/10.jpg",
    icon: <Heart className="w-6 h-6 text-gradient" />,
  },
  {
    name: "Jane Smith",
    message: "Helps me a lot with coding interviews!",
    profileImage: "https://randomuser.me/api/portraits/women/10.jpg",
    icon: <Star className="w-6 h-6 text-gradient" />,
  },
  {
    name: "Alex Johnson",
    message: "Wonderful experience, would recommend to others.",
    profileImage: "https://randomuser.me/api/portraits/men/11.jpg",
    icon: <ThumbsUp className="w-6 h-6 text-gradient" />,
  },
  {
    name: "Emily Davis",
    message: "A fantastic resource for interview preparation!",
    profileImage: "https://randomuser.me/api/portraits/women/11.jpg",
    icon: <Heart className="w-6 h-6 text-gradient" />,
  },
  {
    name: "Michael Brown",
    message: "Loved the coding challenges and feedback system!",
    profileImage: "https://randomuser.me/api/portraits/men/12.jpg",
    icon: <Star className="w-6 h-6 text-gradient" />,
  },
  {
    name: "Sarah Lee",
    message: "A great platform for improving coding skills.",
    profileImage: "https://randomuser.me/api/portraits/women/12.jpg",
    icon: <ThumbsUp className="w-6 h-6 text-gradient" />,
  },
];

const practiceModes = [
  {
    title: "Beginers Coder",
    description: "Enhance your coding skills independently with comprehensive feedback.",
    icon: User,
    route: "/self-practice",
    image: "https://www.yarddiant.com/images/how-to-practice-coding-every-day.jpg",
  },
  {
    title: "Experianced Coder",
    description: "Work alongside peers to solve problems and learn collectively.",
    icon: Users,
    route: "/peer-practice",
    image: "https://www.codio.com/hubfs/Blog_EN_PICS/August%202021%20Blog%20-%20Collaborative%20Coding%20in%20Codio.png#keepProtocol",
  },
  
  {
    title: "AI-Assisted DevOps",
    description: "Practice DevOps concepts with the support of AI tools.",
    icon: Code,
    route: "/devops-practice",
    image: "https://www.amplework.com/wp-content/uploads/2022/07/DevOps-with-AI.png",
  },
  {
    title: "HR Round Simulation",
    description: "Prepare for HR interviews by practicing common questions and scenarios.",
    icon: UserCog,
    route: "/hr-interview",
    image: "https://media.gettyimages.com/id/1365436662/photo/successful-partnership.jpg?s=612x612&w=0&k=20&c=B1xspe9Q5WMsLc7Hc9clR8MWUL4bsK1MfUdDNVNR2Xg=",
  },
  {
    title: "Technical Round Simulation",
    description: "Sharpen your technical skills with simulated problem-solving sessions.",
    icon: Code,
    route: "/technical-round",
    image: "",
  },
  {
    title: "Company Wise Questions",
    description: "Browse and practice coding questions by your company's previous year questions.",
    icon: Building,
    route: "/company-practice",
    image: "https://savvytokyo.scdn3.secure.raxcdn.com/app/uploads/2023/10/LINE_ALBUM_1-Monday_231016_4.jpg",
  },
];

const services = [
  {
    icon: Brain,
    title: "Technical Interview Practice",
    description: "Practice technical interviews with AI-powered feedback and evaluation",
    color: "bg-purple-500/10 text-purple-500",
    href: "/technical-round"
  },
  {
    icon: Code2,
    title: "Coding Challenges",
    description: "Solve real-world coding problems and get instant feedback",
    color: "bg-blue-500/10 text-blue-500",
    href: "/solve"
  },
  {
    icon: UsersIcon,
    title: "Mock Interviews",
    description: "Practice with peers or AI interviewers in a realistic setting",
    color: "bg-green-500/10 text-green-500",
    href: "/mock-interview"
  },
  {
    icon: Video,
    title: "Video Interviews",
    description: "Record and review your interview performances",
    color: "bg-orange-500/10 text-orange-500",
    href: "/video-interview"
  },
  {
    icon: MessageSquare,
    title: "Communication Skills",
    description: "Improve your communication and soft skills",
    color: "bg-pink-500/10 text-pink-500",
    href: "/communication"
  },
  {
    icon: BookOpen,
    title: "Learning Resources",
    description: "Access curated learning materials and guides",
    color: "bg-yellow-500/10 text-yellow-500",
    href: "/resources"
  },
  {
    icon: Target,
    title: "Interview Tracking",
    description: "Track your progress and interview performance",
    color: "bg-red-500/10 text-red-500",
    href: "/tracking"
  },
  {
    icon: Zap,
    title: "Quick Practice",
    description: "Short practice sessions for busy professionals",
    color: "bg-indigo-500/10 text-indigo-500",
    href: "/quick-practice"
  }
];

const fetchUserCount = async () => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error fetching user count:', error);
    throw error;
  }
  
  return count || 0;
};

export default function Index() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentText, setCurrentText] = useState("");
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const textArray = ["Master Every Interview, Land Your Dream Job!"];
  const [showLearningPaths, setShowLearningPaths] = useState(false);

  const { data: userCount = 0, isLoading: isLoadingUserCount } = useQuery({
    queryKey: ['userCount'],
    queryFn: fetchUserCount,
  });

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < textArray[0].length) {
        setCurrentText(textArray[0].substring(0, index + 1));
        index++;
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeedbackIndex((prevIndex) => (prevIndex + 3) % feedbacks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/learn');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="flex-1 container py-12">
        {!showWelcome && (
          <div className="space-y-12">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
              {practiceModes.map((mode) => (
                <PracticeModeCard key={mode.title} {...mode} />
              ))}
            </div>
          </div>
        )}

        {showWelcome && (
          <>
            <div className="flex flex-col md:flex-row items-center justify-between h-full space-y-6 md:space-y-0">
              <div className="md:w-1/2 text-left space-y-6">
                <h1 className="text-4xl font-bold text-gradient">
                  <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-transparent bg-clip-text">
                    {currentText}
                  </span>
                </h1>
                <p>
                  Welcome to our coding platform, where learning, practicing, and mastering coding skills come together to unlock your full potential! We offer comprehensive interview-related materials, including resources for HR rounds, technical rounds, and coding rounds to help you succeed.
                </p>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => navigate('/video-interview')}
                    className="relative px-6 py-3 text-white rounded-full flex items-center transition-all duration-300 
                             bg-gray-800 hover:bg-gradient-to-r from-purple-600 to-blue-500 
                             shadow-lg shadow-blue-500/50 border border-transparent hover:border-blue-400"
                  >
                    <Video className="mr-2 w-6 h-6 text-blue-300 group-hover:text-blue-400 transition-colors" />
                    <span className="text-lg font-semibold">Virtual Interview AI</span>
                    <span className="absolute inset-0 rounded-full animate-pulse opacity-40"></span>
                  </Button>

                  <Button
                    onClick={() => setShowLearningPaths(!showLearningPaths)}
                    className="relative px-6 py-3 text-white rounded-full flex items-center transition-all duration-300 
                             bg-gray-800 hover:bg-gradient-to-r from-pink-600 to-purple-500 
                             shadow-lg shadow-pink-500/50 border border-transparent hover:border-pink-400"
                  >
                    <BrainCircuit className="mr-2 w-6 h-6 text-pink-300 group-hover:text-pink-400 transition-colors" />
                    <span className="text-lg font-semibold">StudyMate AI</span>
                    <span className="absolute inset-0 rounded-full animate-pulse opacity-40"></span>
                  </Button>
                </div>

                {showLearningPaths && (
                  <div className="mt-8 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6">Choose Your Learning Path</h2>
                    <LearningPathCards />
                  </div>
                )}
              </div>

              <div className="relative md:w-1/2 ml-8 bg-transparent">
                <img
                  src="front.png"
                  alt="Welcome"
                  className="w-2/3 max-w-md rounded-lg shadow-lg animate-floating"
                />
              </div>

            </div>

            {/* Trusted Numbers Section */}
            <div className="py-12 bg-gray-100 dark:bg-gray-900 text-center">
              <h2 className="text-3xl font-bold mb-6 text-gradient">
                Why Trust Us?
              </h2>
              <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-12">
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600">
                    {isLoadingUserCount ? "..." : `${userCount}+`}
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Trusted Users</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600">200k+</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Questions Solved</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600">1k+</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Resources Available</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600">95%</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">User Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Showcase Section */}
            <div className="flex flex-col space-y-12">
              {/* Why Choose Us Section */}
              <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
                <div className="relative md:w-1/2">
                  <img
                    src="back.png"
                    alt="Why Choose Us"
                    style={{
                      width: '400px',
                      height: '300px',
                      margin: '100px',
                      animation: 'moveUpDown 2s ease-in-out infinite',
                    }}
                    className="rounded-lg shadow-lg"
                  />
                </div>
                <div className="md:w-1/2 text-left space-y-6">
                  <h2 className="text-3xl font-bold text-gradient relative">
                    Why Choose Us?
                    <span className="absolute bottom-[-10px] left-0 w-full border-t-4 border-t-transparent border-b-4 border-b-purple-600"></span>
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Explore our platform to enhance your coding skills with practical exercises, interview preparation resources, and real-world challenges. Our user-focused design ensures a seamless and effective learning experience.
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Comprehensive coding tutorials and resources</li>
                    <li>Expert guidance for HR, tech, and coding rounds</li>
                    <li>Interactive practice modes to sharpen your skills</li>
                  </ul>
                </div>
              </div>

              {/* What We Offer Section */}
              <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
                <div className="md:w-1/2 text-left space-y-6">
                  <h2 className="text-3xl font-bold text-gradient relative">
                    What We Offer
                    <span className="absolute bottom-[-10px] left-0 w-full border-t-4 border-t-transparent border-b-4 border-b-purple-600"></span>
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Take advantage of our carefully designed modules and tools that cater to every learning style. We offer the best resources to make coding accessible, fun, and engaging for all skill levels.
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Customizable coding environments</li>
                    <li>Step-by-step interview preparation guides</li>
                    <li>Access to exclusive projects and challenges</li>
                  </ul>
                </div>

                <div className="relative md:w-1/2">
                  <img
                    src="oip.jpeg"
                    alt="What We Offer"
                    style={{
                      width: '300px',
                      height: '300px',
                      marginLeft: '150px',
                      animation: 'moveUpDown 2s ease-in-out infinite',
                    }}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Services Section */}
            <section className="container mx-auto px-4 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Services</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive tools and resources to help you succeed in your interviews
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Card 
                      key={index}
                      className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                      onClick={() => window.location.href = service.href}
                    >
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-500 transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="container mx-auto px-4 py-16">
              <h2 className="text-3xl font-bold text-center mb-12 text-gradient">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto space-y-4">
                {[
                  {
                    question: "How does the AI teaching assistant work?",
                    answer: "Our AI teaching assistant uses advanced language models to provide personalized explanations, generate practice questions, and adapt to your learning style. It can explain concepts in multiple ways and create custom exercises based on your needs."
                  },
                  {
                    question: "What types of questions can I practice with?",
                    answer: "You can practice with multiple types of questions including Multiple Choice (MCQ), subjective questions, debugging exercises, coding challenges, and fill-in-the-blank questions. The AI generates questions based on your specific topic of interest."
                  },
                  {
                    question: "How does the platform adapt to my understanding?",
                    answer: "After each explanation, you can indicate if you understood the concept. If you need more clarity, the AI will provide a simpler explanation. Once you understand, it will generate practice questions to reinforce your learning."
                  },
                  {
                    question: "Can I get feedback on my answers?",
                    answer: "Yes! The platform provides immediate, detailed feedback on your answers. For coding questions, it checks your solution against test cases. For subjective questions, it evaluates your understanding of key concepts."
                  },
                  {
                    question: "Is the platform suitable for beginners?",
                    answer: "Absolutely! Our AI teaching assistant can explain concepts at various levels of complexity. If you find an explanation too complex, it will break it down into simpler terms with more examples."
                  },
                  {
                    question: "What subjects are covered?",
                    answer: "You can ask questions about any programming or technical topic. The AI is trained on a wide range of subjects and can provide explanations, examples, and practice questions across different domains."
                  }
                ].map((faq, index) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <div 
                      key={index} 
                      className="border-b border-purple-200 last:border-0"
                    >
                      <button
                        className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        <h3 className="text-lg font-semibold text-gradient">{faq.question}</h3>
                        <span className="ml-4 flex-shrink-0">
                          {isOpen ? (
                            <Minus className="h-6 w-6 text-purple-500" />
                          ) : (
                            <Plus className="h-6 w-6 text-purple-500" />
                          )}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="pb-6">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Stats Section */}
          

            {/* Testimonials Section */}
            <div className="mt-12 space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                {feedbacks.slice(currentFeedbackIndex, currentFeedbackIndex + 3).map((feedback, index) => (
                  <div
                    key={index}
                    className="bg-transparent p-6 rounded-lg shadow-lg flex items-center space-x-4"
                  >
                    <img
                      src={feedback.profileImage}
                      alt={feedback.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="text-sm text-gradient">{feedback.message}</p>
                      <p className="text-lg font-semibold text-gradient">{feedback.name}</p>
                    </div>
                    <div className="ml-auto">{feedback.icon}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          @keyframes floating {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .animate-floating {
            animation: floating 4s ease-in-out infinite;
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }

          .animate-fade-in {
            animation: fadeIn 1s ease-in-out;
          }

          .text-gradient {
            background: linear-gradient(to right, #ff7c7c, #fbbf24, #8b5cf6);
            -webkit-background-clip: text;
            color: transparent;
          }
        `}
      </style>
    </div>
  );
}
