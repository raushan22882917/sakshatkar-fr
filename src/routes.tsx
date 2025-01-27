import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import MentorList from "@/pages/mentorship/MentorList";
import Interviews from "@/pages/recruiter/Interviews";
import Jobs from "@/pages/recruiter/Jobs";
import Applications from "@/pages/recruiter/Applications";
import ReNewJob from "@/pages/re/jobs/new";
import ReApplications from "@/pages/recruiter/Applications";
import Services from "@/pages/Services";
import Community from "@/pages/Community";
import About from "@/pages/About";
import Signup from "@/pages/Signup";
import Coding from "@/pages/Coding";
import AuthCallback from "@/pages/AuthCallback";
import Admin from "@/pages/Admin";
import PeerSolvePage from "@/pages/PeerSolvePage";
import SolvePage from "@/pages/SolvePage";
import Pricing from "@/pages/Pricing";
import ContestDetails from "@/pages/contests/ContestDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/mentorship",
    element: <MentorList />,
  },
  {
    path: "/recruiter/interviews",
    element: <Interviews />,
  },
  {
    path: "/recruiter/jobs",
    element: <Jobs />,
  },
  {
    path: "/recruiter/applications",
    element: <Applications />,
  },
  {
    path: "/re/jobs/new",
    element: <ReNewJob />,
  },
  {
    path: "/services",
    element: <Services />,
  },
  {
    path: "/community",
    element: <Community />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/coding",
    element: <Coding />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/peer-solve/:id",
    element: <PeerSolvePage />,
  },
  {
    path: "/solve/:id",
    element: <SolvePage />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/contests/:id",
    element: <ContestDetails />,
  },
]);

export default router;
