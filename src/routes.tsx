import { createBrowserRouter } from "react-router-dom";
import ContestPage from "./pages/contests/ContestPage";
import ContestDetails from "./pages/contests/ContestDetails";
import ContestRegister from "./pages/contests/ContestRegister";
import ContestLeaderboard from "./pages/contests/ContestLeaderboard";
import ContestProblem from "./pages/contests/ContestProblem";
import ContestSubmissions from "./pages/contests/ContestSubmissions";
import Layout from "./components/layout";
import ErrorPage from "./error-page";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import MessagesPage from "./pages/messages/MessagesPage";
import SearchPage from "./pages/search/SearchPage";
import AboutPage from "./pages/about/AboutPage";
import ContactPage from "./pages/contact/ContactPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import HelpPage from "./pages/help/HelpPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
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
        element: <ContestProblem />,
      },
      {
        path: "/contest/:contestId/submissions",
        element: <ContestSubmissions />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/profile/edit",
        element: <EditProfilePage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/notifications",
        element: <NotificationsPage />,
      },
      {
        path: "/messages",
        element: <MessagesPage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/privacy",
        element: <PrivacyPage />,
      },
      {
        path: "/terms",
        element: <TermsPage />,
      },
      {
        path: "/help",
        element: <HelpPage />,
      },
    ],
  },
]);