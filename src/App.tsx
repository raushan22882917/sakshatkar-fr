import { BrowserRouter as Router, Route } from 'react-router-dom';
import ContestHome from './pages/contests/ContestHome';
import ContestList from './pages/contests/ContestList';
import ContestDetails from './pages/contests/ContestDetails';
import ContestProblem from './pages/contests/ContestProblem';
import ContestCreate from './pages/contests/ContestCreate';
import ContestLeaderboard from './pages/contests/ContestLeaderboard';
import ContestPractice from './pages/contests/ContestPractice';

function App() {
  return (
    <Router>
      {/* Contest Routes */}
      <Route path="contests">
        <Route index element={<ContestHome />} />
        <Route path="list" element={<ContestList />} />
        <Route path=":contestId" element={<ContestDetails />} />
        <Route path="create" element={<ContestCreate />} />
        <Route path=":contestId/leaderboard" element={<ContestLeaderboard />} />
        <Route path="practice" element={<ContestPractice />} />
      </Route>
      <Route path="contest/:contestId/problem/:problemId" element={<ContestProblem />} />
    </Router>
  );
}

export default App;
