import { createBrowserRouter } from "react-router-dom";
import ContestPage from "./pages/contests/ContestPage";
import ContestDetails from "./pages/contests/ContestDetails";
import ContestLeaderboard from "./pages/contests/ContestLeaderboard";
import ContestProblem from "./pages/contests/ContestProblem";
import Layout from "./components/Layout";
import ErrorPage from "./components/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/contests",
        element: <ContestPage />,
      },
      {
        path: "/contest/:contestId",
        element: <ContestDetails />,
      },
      {
        path: "/contest/:contestId/leaderboard",
        element: <ContestLeaderboard />,
      },
      {
        path: "/contest/:contestId/problem/:problemId",
        element: <ContestProblem />,
      }
    ],
  },
]);