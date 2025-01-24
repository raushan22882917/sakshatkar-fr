import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminRoute } from "@/components/AdminRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DevOpsFlow from "@/components/DevOpsFlow";
import MLFlow from './components/MLFlow/MLFlow';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import PostJob from "./pages/recruiter/PostJob";
import Jobs from "./pages/recruiter/Jobs";
import Messages from "./pages/recruiter/Messages";
import Settings from "./pages/recruiter/Settings";
import Applications from "./pages/recruiter/Applications";
import ViewProfile from "./pages/recruiter/ViewProfile";
import Interviews from "./pages/recruiter/Interviews";
import { Home as RecruiterHome } from "./pages/recruiter/Home";
import PolicyPage from "./pages/PolicyPage";
import NewsPage from './pages/NewsPage';
import AuthCallback from "./pages/AuthCallback";
import About from "./pages/About";
import Services from "./pages/Services";
import Topics from "./pages/Topics";
import TopicQuestions from "./pages/TopicQuestions";
import PeerTopic from "./pages/PeerTopic";
import SolvePage from "./pages/SolvePage";
import PeerPractice from "./pages/PeerPractice";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Pricing from "./pages/Pricing";
import TeamCoding from "./pages/TeamCoding";
import DevOpsPractice from "./pages/DevOpsPractice";
import HRInterview from "./pages/HRInterview";
import HRInterviewSession from "./pages/HRInterviewSession";
import TechnicalRound from "./pages/TechnicalRound";
import FAQ from "./pages/FAQ";
import Coding from "./pages/Coding";
import Resources from "./pages/Resources";
import InterviewRounds from "./pages/InterviewRounds";
import Contact from "./pages/Contact";
import ArticlePage from "./pages/ArticlePage";
import Payment from "./pages/Payment";
import JobsPost from "./pages/JobsPost";
import ChatInterface from './pages/ChatInterface';
import ChatLayout from './components/chat/ChatLayout';
import { HelmetProvider } from 'react-helmet-async';
import { CustomCursor } from '@/components/ui/custom-cursor';
import PeerSolvePage from "./pages/PeerSolvePage";
import CompanyPractice from "./pages/CompanyPractice";
import CompanyTopic from "./pages/CompanyTopic";
import { 
  ContestHome,
  ContestPage,
  ContestDetails,
  ContestProblem,
  ContestLeaderboard,
  ContestCreate,
  ContestPractice
} from "@/pages/contests";
import { InterviewPractice } from "@/pages/InterviewPractice";
import { DevOpsQuestions } from "@/pages/interview/DevOpsQuestions";
import { ArticleDetail } from "@/pages/ArticleDetail";
import VideoInterview from "./pages/VideoInterview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SubscriptionProvider>
              <TooltipProvider>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <CustomCursor />
                    <AppSidebar />
                    <main className="flex-1">
                      <Routes>
                        {/* Public routes */}
                        <Route path="/jobpost" element={<JobsPost />} />
                        
                        {/* DevOps Routes */}
                        <Route 
                          path="/devops-flow" 
                          element={
                            <ProtectedRoute>
                              <DevOpsFlow />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/devops-practice" 
                          element={
                            <ProtectedRoute>
                              <DevOpsPractice />
                            </ProtectedRoute>
                          } 
                        />
                        
                        {/* Recruiter routes */}
                        <Route path="/recruiter" element={<RecruiterHome />} />
                        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                        <Route path="/recruiter/applications" element={<Applications />} />
                        <Route path="/recruiter/applications/:applicationId/profile" element={<ViewProfile />} />
                        <Route path="/recruiter/interviews/:applicationId" element={<Interviews />} />
                        <Route 
                          path="/recruiter/jobs/post" 
                          element={
                            <ProtectedRoute>
                              <PostJob />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/recruiter/jobs" 
                          element={
                            <ProtectedRoute>
                              <Jobs />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/recruiter/messages" 
                          element={
                            <ProtectedRoute>
                              <Messages />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/recruiter/settings" 
                          element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          } 
                        />
                        
                        {/* Contest Routes */}
                        <Route path="contest">
                          <Route index element={<ContestHome />} />
                          <Route path="list" element={<ContestPage />} />
                          <Route path="leaderboard" element={<ContestLeaderboard />} />
                          <Route path="practice" element={<ContestPractice />} />
                          <Route path="create" element={
                            <ProtectedRoute>
                              <ContestCreate />
                            </ProtectedRoute>
                          } />
                          <Route path=":contestId" element={<ContestDetails />} />
                          <Route path=":contestId/problem/:problemId" element={<ContestProblem />} />
                        </Route>
                        
                        {/* Existing routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/coding" element={<Coding />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/interview-rounds" element={<InterviewRounds />} />
                        <Route path="/self-practice" element={<Topics />} />
                        <Route path="/news" element={<NewsPage />} /> 
                        <Route path="/policy" element={<PolicyPage />} />
                        <Route 
                          path="/settings" 
                          element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/topic/:id" 
                          element={
                            <ProtectedRoute>
                              <TopicQuestions />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/solve/:id" 
                          element={
                            <ProtectedRoute>
                              <SolvePage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/peer-practice" 
                          element={
                            <ProtectedRoute>
                              <PeerPractice />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/peer-practice/topic/:id" 
                          element={
                            <ProtectedRoute>
                              <PeerTopic />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/peer-practice/solve/:id" 
                          element={
                            <ProtectedRoute>
                              <PeerSolvePage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/team-coding" 
                          element={
                            <ProtectedRoute>
                              <TeamCoding />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/dashboard" 
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/community" 
                          element={
                            <ProtectedRoute>
                              <Community />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/payment" element={<Payment />} />
                        <Route 
                          path="/ML-flow" 
                          element={
                            <ProtectedRoute>
                              <MLFlow />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/hr-interview" 
                          element={
                            <ProtectedRoute>
                              <HRInterview />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/hr-interview/:id" 
                          element={
                            <ProtectedRoute>
                              <HRInterviewSession />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/hr-interview-session/:id" 
                          element={
                            <ProtectedRoute>
                              <HRInterviewSession />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/technical-round" 
                          element={
                            <ProtectedRoute>
                              <TechnicalRound />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/pricing" 
                          element={
                            <ProtectedRoute>
                              <Pricing />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/article/:id" element={<ArticleDetail />} />
                        <Route path="/chat" element={<ChatInterface />} />
                        <Route path="/learn" element={<ChatLayout />} />
                        <Route 
                          path="/company-practice" 
                          element={
                            <ProtectedRoute>
                              <CompanyPractice />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/company-practice/topic/:id" 
                          element={
                            <ProtectedRoute>
                              <CompanyTopic />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/company-practice/solve/:id" 
                          element={
                            <ProtectedRoute>
                              <PeerSolvePage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/interview-practice" element={<InterviewPractice />} />
                        <Route path="/interview/devops-questions" element={<DevOpsQuestions />} />
                        <Route path="/video-interview" element={<VideoInterview />} />
                      </Routes>
                    </main>
                  </div>
                  <CustomCursor />
                  <Toaster />
                  <Sonner />
                </SidebarProvider>
              </TooltipProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;