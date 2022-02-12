import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signin from './components/signin';
import Home from './components/home';
import hide from './components/welcome2.svg'
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Signin/>}></Route>
          <Route path="/home" element={<Home/>}></Route>
        </Routes>
      </Router>
      <div className='mobile-view'>
            <img className='hide-girl' src={hide} alt="oops!"></img>
            <h1>Not Supported for Mobiles!</h1>
      </div>
    </div>
  );
}

export default App;
