import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <Routes>
        {/* Contest Routes */}
        <Route path="/contests" element={<ContestHome />} />
        <Route path="/contests/list" element={<ContestList />} />
        <Route path="/contests/:contestId" element={<ContestDetails />} />
        <Route path="/contests/create" element={<ContestCreate />} />
        <Route path="/contests/:contestId/leaderboard" element={<ContestLeaderboard />} />
        <Route path="/contests/practice" element={<ContestPractice />} />
        <Route path="/contest/:contestId/problem/:problemId" element={<ContestProblem />} />
      </Routes>
    </Router>
  );
}

export default App;