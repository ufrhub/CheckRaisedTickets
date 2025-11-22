import { Routes, Route, Navigate } from 'react-router-dom';
import Home from "./Screens/Home";
import TicketsRaised from "./Screens/TicketsRaised";
import { Amenity } from "./Screens/Amenity";
import { AmenitySlot } from "./Screens/AmenitySlot";

function App() {
  return (
    <Routes>
      <Route path="*" exact element={<Navigate to="/" />} />
      <Route path="/" exact element={<Home />} />
      <Route path="/tickets/:id/:isSupervisor/:date" exact element={<TicketsRaised />} />
      <Route path="/amenity/" exact element={<Amenity />} />
      <Route path="/amenityslot/:token/:amenityID/:date" exact element={<AmenitySlot />} />
    </Routes>
  )
}

export default App;