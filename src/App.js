import { Routes, Route, Navigate } from 'react-router-dom';
import Home from "./Screens/Home";
import TicketsRaised from "./Screens/TicketsRaised";

function App() {
  return (
    <Routes>
      <Route path="*" exact element={<Navigate to="/" />} />
      <Route path="/" exact element={<Home />} />
      <Route path="/tickets/:id/:date" exact element={<TicketsRaised />} />
    </Routes>
  )
}

export default App;