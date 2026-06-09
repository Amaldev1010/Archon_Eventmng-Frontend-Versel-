
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import EventPage from './components/Events';
import AddEventPage from './components/AddEvent';
import ParticipantDetails from './components/ParticipantDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/events" element={<EventPage />} />
        <Route path="/add_event" element={<AddEventPage />} />
        <Route path="/participants/:id" element={<ParticipantDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
