import { createBrowserRouter } from 'react-router-dom';
import ContestHome from './pages/contests/ContestHome';
import ContestDetails from './pages/contests/ContestDetails';
import ContestProblem from './pages/contests/ContestProblem';
import ContestLeaderboard from './pages/contests/ContestLeaderboard';

export const router = createBrowserRouter([
  {
    path: "/contests",
    element: <ContestHome />,
  },
  {
    path: "/contest/:contestId",
    element: <ContestDetails />,
  },
  {
    path: "/contest/:contestId/problem/:problemId",
    element: <ContestProblem />,
  },
  {
    path: "/contest/:contestId/leaderboard",
    element: <ContestLeaderboard />,
  }
]);