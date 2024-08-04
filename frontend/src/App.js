import React from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

import { Route, Routes, Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom';


function App() {
  const user = useRecoilValue(userAtom);

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
