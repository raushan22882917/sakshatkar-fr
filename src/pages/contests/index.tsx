import ContestHome from './ContestHome';
import ContestDetail from './ContestDetail';
import ContestProblem from './ContestProblem';

export { ContestHome, ContestDetail, ContestProblem };

export const contestRoutes = [
  {
    path: '/contests',
    element: <ContestHome />
  },
  {
    path: '/contests/:id',
    element: <ContestDetail />
  },
  {
    path: '/contests/:id/problem/:problemId',
    element: <ContestProblem />
  }
];