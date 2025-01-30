import ContestHome from './ContestHome';
import ContestDetail from './ContestDetail';

export { ContestHome, ContestDetail };

export const contestRoutes = [
  {
    path: '/contests',
    element: <ContestHome />
  },
  {
    path: '/contests/:id',
    element: <ContestDetail />
  }
];