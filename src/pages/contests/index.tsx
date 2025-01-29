import ContestHome from './ContestHome';
import ContestList from './ContestList';
import ContestDetails from './ContestDetails';
import ContestProblem from './ContestProblem';
import ContestCreate from './ContestCreate';
import ContestLeaderboard from './ContestLeaderboard';
import ContestPractice from './ContestPractice';

// Export the components individually
export { ContestHome };
export { ContestList };
export { ContestDetails };
export { ContestProblem };
export { ContestCreate };
export { ContestLeaderboard };
export { ContestPractice };

// Export the routes configuration
export const contestRoutes = [
  {
    path: '/contests',
    element: <ContestHome />
  },
  {
    path: '/contests/list',
    element: <ContestList />
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