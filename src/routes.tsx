import { createBrowserRouter } from 'react-router-dom';
import { Login } from '@/pages/auth/Login';
import PostJob from '@/pages/recruiter/PostJob';
import Jobs from '@/pages/recruiter/Jobs';
import Messages from '@/pages/recruiter/Messages';
import Settings from '@/pages/recruiter/Settings';
import RecruiterDashboard from '@/pages/recruiter/RecruiterDashboard';
import Applications from '@/pages/recruiter/Applications';
import ViewProfile from '@/pages/recruiter/ViewProfile';
import Interviews from '@/pages/recruiter/Interviews';
import JobsPost from '@/pages/JobsPost';
import { Mentorship } from '@/pages/Mentorship';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/mentorship',
    element: <Mentorship />,
  },
  // Recruiter Routes
  {
    path: '/recruiter',
    element: <RecruiterDashboard />,
  },
  {
    path: '/recruiter/dashboard',
    element: <RecruiterDashboard />,
  },
  {
    path: '/recruiter/jobs/post',
    element: <PostJob />,
  },
  {
    path: '/recruiter/jobs',
    element: <Jobs />,
  },
  {
    path: '/recruiter/messages',
    element: <Messages />,
  },
  {
    path: '/recruiter/settings',
    element: <Settings />,
  },
  {
    path: '/recruiter/applications',
    element: <Applications />,
  },
  {
    path: '/recruiter/applications/:applicationId/profile',
    element: <ViewProfile />,
  },
  {
    path: '/recruiter/interviews/:applicationId',
    element: <Interviews />,
  },
  {
    path: '/jobpost',
    element: <JobsPost />,
  },
]);
