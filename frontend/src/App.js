import React, { useEffect } from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

import { Route, Routes, Navigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import userAtom from './atoms/userAtom';

function App() {
  const user = useRecoilValue(userAtom);
  const setUser = useSetRecoilState(userAtom);

  useEffect(() => {
    const checkAuthStatus = () => {
      const jwtCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt='));

      if (!jwtCookie) {
        setUser(null);
      }
    };

    // Call the checkAuthStatus function on component mount
    checkAuthStatus();

    // Optionally, set up a timer to periodically check the user's auth status
    const intervalId = setInterval(checkAuthStatus, 60000); // Check every 60 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [setUser]);

  return (
    <Routes>
      <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/auth" />} />
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
