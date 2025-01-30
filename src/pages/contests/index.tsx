import ContestHome from './ContestHome';
import ContestDetails from './ContestDetails';
import ContestProblem from './ContestProblem';
import ContestCreate from './ContestCreate';
import ContestLeaderboard from './ContestLeaderboard';
import ContestPractice from './ContestPractice';
import LiveContests from './LiveContests';

// Export the components individually
export { ContestHome };
export { ContestDetails };
export { ContestProblem };
export { ContestCreate };
export { ContestLeaderboard };
export { ContestPractice };
export { LiveContests };

// Export the routes configuration
export const contestRoutes = [
  {
    path: '/contests',
    element: <ContestHome />
  },
  {
    path: '/contests/live',
    element: <LiveContests />
  },
  {
    path: '/contests/:contestId',
    element: <ContestDetails />
  },
  {
    path: '/contest/:contestId/problem/:problemId',
    element: <ContestProblem />
  },
  {
    path: '/contests/create',
    element: <ContestCreate />
  },
  {
    path: '/contests/:contestId/leaderboard',
    element: <ContestLeaderboard />
  },
  {
    path: '/contests/practice',
    element: <ContestPractice />
  }
];