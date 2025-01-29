import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import ContestPage from "@/pages/contests/ContestPage";
import ContestDetails from "@/pages/contests/ContestDetails";
import ContestRegister from "@/pages/contests/ContestRegister";
import ContestLeaderboard from "@/pages/contests/ContestLeaderboard";
import ProblemPage from "@/pages/ProblemPage";
import PeerSolvePage from "@/pages/PeerSolvePage";
import PeerGroupPage from "@/pages/PeerGroupPage";
import PeerSessionPage from "@/pages/PeerSessionPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import HRInterviewPage from "@/pages/HRInterviewPage";
import TechnicalInterviewPage from "@/pages/TechnicalInterviewPage";
import InterviewFeedbackPage from "@/pages/InterviewFeedbackPage";
import InterviewHistoryPage from "@/pages/InterviewHistoryPage";
import MentorshipPage from "@/pages/mentorship/MentorshipPage";
import MentorDetails from "@/pages/mentorship/MentorDetails";
import MentorshipPayment from "@/pages/mentorship/MentorshipPayment";
import MentorshipSuccess from "@/pages/mentorship/MentorshipSuccess";
import MentorshipDashboard from "@/pages/mentorship/MentorshipDashboard";
import MentorshipBookings from "@/pages/mentorship/MentorshipBookings";
import MentorshipAvailability from "@/pages/mentorship/MentorshipAvailability";
import MentorshipProfile from "@/pages/mentorship/MentorshipProfile";
import CommunityPage from "@/pages/community/CommunityPage";
import QuestionPage from "@/pages/community/QuestionPage";
import AskQuestionPage from "@/pages/community/AskQuestionPage";
import ResourcesPage from "@/pages/resources/ResourcesPage";
import ResourceDetails from "@/pages/resources/ResourceDetails";
import JobsPage from "@/pages/jobs/JobsPage";
import JobDetails from "@/pages/jobs/JobDetails";
import PostJob from "@/pages/jobs/PostJob";
import Applications from "@/pages/jobs/Applications";
import ApplicationDetails from "@/pages/jobs/ApplicationDetails";
import RecruiterDashboard from "@/pages/jobs/RecruiterDashboard";
import RecruiterSettings from "@/pages/jobs/RecruiterSettings";
import Pricing from "@/pages/Pricing";
import ContactPage from "@/pages/ContactPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminContests from "@/pages/admin/AdminContests";
import AdminMentors from "@/pages/admin/AdminMentors";
import AdminJobs from "@/pages/admin/AdminJobs";
import AdminSettings from "@/pages/admin/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/contests",
        element: <ContestPage />,
      },
      {
        path: "/contest/:contestId",
        element: <ContestDetails />,
      },
      {
        path: "/contest/:contestId/register",
        element: <ContestRegister />,
      },
      {
        path: "/contest/:contestId/leaderboard",
        element: <ContestLeaderboard />,
      },
      {
        path: "/contest/:contestId/problem/:problemId",
        element: <ProblemPage />,
      },
      {
        path: "/peer-solve",
        element: <PeerSolvePage />,
      },
      {
        path: "/peer-groups",
        element: <PeerGroupPage />,
      },
      {
        path: "/peer-session/:sessionId",
        element: <PeerSessionPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/hr-interview",
        element: <HRInterviewPage />,
      },
      {
        path: "/technical-interview",
        element: <TechnicalInterviewPage />,
      },
      {
        path: "/interview-feedback/:interviewId",
        element: <InterviewFeedbackPage />,
      },
      {
        path: "/interview-history",
        element: <InterviewHistoryPage />,
      },
      {
        path: "/mentorship",
        element: <MentorshipPage />,
      },
      {
        path: "/mentor/:mentorId",
        element: <MentorDetails />,
      },
      {
        path: "/mentorship/payment",
        element: <MentorshipPayment />,
      },
      {
        path: "/mentorship/success",
        element: <MentorshipSuccess />,
      },
      {
        path: "/mentorship/dashboard",
        element: <MentorshipDashboard />,
      },
      {
        path: "/mentorship/bookings",
        element: <MentorshipBookings />,
      },
      {
        path: "/mentorship/availability",
        element: <MentorshipAvailability />,
      },
      {
        path: "/mentorship/profile",
        element: <MentorshipProfile />,
      },
      {
        path: "/community",
        element: <CommunityPage />,
      },
      {
        path: "/community/question/:questionId",
        element: <QuestionPage />,
      },
      {
        path: "/community/ask",
        element: <AskQuestionPage />,
      },
      {
        path: "/resources",
        element: <ResourcesPage />,
      },
      {
        path: "/resources/:resourceId",
        element: <ResourceDetails />,
      },
      {
        path: "/jobs",
        element: <JobsPage />,
      },
      {
        path: "/jobs/:jobId",
        element: <JobDetails />,
      },
      {
        path: "/jobs/post",
        element: <PostJob />,
      },
      {
        path: "/jobs/applications",
        element: <Applications />,
      },
      {
        path: "/jobs/applications/:applicationId",
        element: <ApplicationDetails />,
      },
      {
        path: "/recruiter/dashboard",
        element: <RecruiterDashboard />,
      },
      {
        path: "/recruiter/settings",
        element: <RecruiterSettings />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/admin",
        element: <AdminDashboard />,
      },
      {
        path: "/admin/users",
        element: <AdminUsers />,
      },
      {
        path: "/admin/contests",
        element: <AdminContests />,
      },
      {
        path: "/admin/mentors",
        element: <AdminMentors />,
      },
      {
        path: "/admin/jobs",
        element: <AdminJobs />,
      },
      {
        path: "/admin/settings",
        element: <AdminSettings />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);