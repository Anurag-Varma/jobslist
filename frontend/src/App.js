import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

import { Route, Routes, Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom';

function App() {
  const [user, setUser] = useState(null);
  const currentUser = useRecoilValue(userAtom);

  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    console.log(document.cookie)
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  useEffect(() => {
    const jwtToken = getCookieValue('jwt');

    console.log(jwtToken)

    if (jwtToken) {
      // If the cookie is present, use the value from Recoil
      setUser(currentUser);
    } else {
      // If the cookie is not present, set user to null
      setUser(null);
    }

    // Periodic check every 60 seconds
    const intervalId = setInterval(() => {
      const updatedJwtToken = getCookieValue('jwt');
      if (!updatedJwtToken) {
        setUser(null);
      }
    }, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentUser]);

  return (
    <Routes>
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
