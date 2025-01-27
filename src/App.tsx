import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/pages/Pricing";
import { Community } from "@/pages/Community";
import { Services } from "@/pages/Services";
import { About } from "@/pages/About";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Dashboard } from "@/pages/Dashboard";
import { AuthCallback } from "@/pages/AuthCallback";
import { Admin } from "@/pages/Admin";
import { AdminRoute } from "@/components/AdminRoute";
import { Coding } from "@/pages/Coding";
import { SolvePage } from "@/pages/SolvePage";
import { PeerSolvePage } from "@/pages/PeerSolvePage";
import { TopicQuestions } from "@/pages/TopicQuestions";
import { ArticleDetail } from "@/pages/ArticleDetail";
import MentorList from "@/pages/mentorship/MentorList";
import { MentorshipPayment } from "@/pages/mentorship/MentorshipPayment";
import { ContestPage } from "@/pages/contests/ContestPage";
import { ContestDetails } from "@/pages/contests/ContestDetails";
import { ContestProblem } from "@/pages/contests/ContestProblem";
import { ContestLeaderboard } from "@/pages/contests/ContestLeaderboard";
import { ReNewJob } from "@/pages/re/jobs/new";
import { ReApplications } from "@/pages/re/applications";
import { ReJobs } from "@/pages/re/jobs";
import { ReInterviews } from "@/pages/re/interviews";

function App() {
  const [customCursor, setCustomCursor] = useState({ x: 0, y: 0 });
  const [cursorDot, setCursorDot] = useState({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setCustomCursor({ x: e.clientX, y: e.clientY });
      setCursorDot(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    };

    const handleMouseDown = () => {
      setCursorDot(prev => ({ ...prev, scale: 1.5 }));
    };

    const handleMouseUp = () => {
      setCursorDot(prev => ({ ...prev, scale: 1 }));
    };

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <div
              className="custom-cursor"
              style={{
                left: `${customCursor.x}px`,
                top: `${customCursor.y}px`,
              }}
            />
            <div
              className="custom-cursor-dot"
              style={{
                left: `${cursorDot.x}px`,
                top: `${cursorDot.y}px`,
                transform: `translate(-50%, -50%) scale(${cursorDot.scale})`,
              }}
            />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/community" element={<Community />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="/coding" element={<Coding />} />
              <Route path="/solve/:id" element={<SolvePage />} />
              <Route path="/peer-solve/:id" element={<PeerSolvePage />} />
              <Route path="/topic/:id" element={<TopicQuestions />} />
              <Route path="/article/:id" element={<ArticleDetail />} />
              <Route path="/mentorship" element={<MentorList />} />
              <Route path="/mentorship/payment" element={<MentorshipPayment />} />
              <Route path="/contests" element={<ContestPage />} />
              <Route path="/contests/:id" element={<ContestDetails />} />
              <Route path="/contests/:id/problem/:problemId" element={<ContestProblem />} />
              <Route path="/contests/:id/leaderboard" element={<ContestLeaderboard />} />
              <Route path="/re/jobs/new" element={<ReNewJob />} />
              <Route path="/re/applications" element={<ReApplications />} />
              <Route path="/re/jobs" element={<ReJobs />} />
              <Route path="/re/interviews" element={<ReInterviews />} />
            </Routes>
            <Toaster />
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
