import './App.css'
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import Home from './pages/home';
import CollectionPage from './pages/collection';
import SingleDoc from './pages/single_doc';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/:collection" element={<CollectionPage/>} />
        <Route path="/:collection/:doc_id" element={<SingleDoc/>}/>
      </Routes>
    </Router>
  )
}

export default App
