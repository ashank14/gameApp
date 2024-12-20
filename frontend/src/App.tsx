
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/home'
import Signin from './pages/signin'
import Signup from './pages/signup'
import Game from './pages/game';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Game/:event" element={<Game />}/>
      </Routes>
    </Router>
  );
}

export default App;