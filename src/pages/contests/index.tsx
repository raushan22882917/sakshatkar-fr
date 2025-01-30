import ContestHome from './ContestHome';

// Export the component individually
export { ContestHome };

// Export the routes configuration
export const contestRoutes = [
  {
    path: '/contests',
    element: <ContestHome />
  }
];