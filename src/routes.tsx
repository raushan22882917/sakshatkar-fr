import { createBrowserRouter } from 'react-router-dom';
import ContestHome from './pages/contests/ContestHome';

export const router = createBrowserRouter([
  {
    path: "/contests",
    element: <ContestHome />,
  }
]);