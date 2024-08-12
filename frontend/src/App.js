import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

import { Route, Routes, Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import Cookies from 'js-cookie';
import userAtom from './atoms/userAtom';

function App() {
  const [user, setUser] = useState(null);
  const currentUser = useRecoilValue(userAtom);

  useEffect(() => {
    const checkAuthStatus = () => {
      const jwtToken = Cookies.get('jwt');
      if (jwtToken) {
        // If the cookie is present, use the value from Recoil
        setUser(currentUser);
      } else {
        // If the cookie is not present, set user to null
        setUser(null);
      }
    };

    // Initial check on component mount
    checkAuthStatus();

    // Periodic check every 60 seconds
    const intervalId = setInterval(() => {
      checkAuthStatus();
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
