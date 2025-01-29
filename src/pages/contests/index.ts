import ContestHome from './ContestHome';
import ContestDetails from './ContestDetails';
import ContestProblem from './ContestProblem';
import ContestCreate from './ContestCreate';
import ContestLeaderboard from './ContestLeaderboard';
import ContestPractice from './ContestPractice';

export const contestRoutes = [
  {
    path: '/contests',
    element: <ContestHome />
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