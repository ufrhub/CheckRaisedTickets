import { Routes, Route } from 'react-router-dom';
import Home from "./Screens/Home";
import TicketsRaised from "./Screens/TicketsRaised";

function App() {
  return (
    <Routes>
      <Route path="/" exact element={<Home />} />
      <Route path="/tickets/:date" exact element={<TicketsRaised />} />
    </Routes>
  )
}

export default App;