import './App.css'
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import Home from './pages/home';
import CollectionPage from './pages/collection';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/:collection" element={<CollectionPage/>} />
      </Routes>
    </Router>
  )
}

export default App
