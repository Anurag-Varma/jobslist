import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

import { Route, Routes, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom';

function App() {
  const [user, setUser] = useState(null);
  const currentUser = useRecoilValue(userAtom);

  const updateUserState = () => {
    const jwtToken = Cookies.get('jwt');
    if (jwtToken) {
      // If the cookie is present, use the value from Recoil
      setUser(currentUser);
    } else {
      // If the cookie is not present, set user to null
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial check on component mount
    updateUserState();

    // Periodic check every 60 seconds
    const intervalId = setInterval(() => {
      updateUserState();
    }, 60000);

    // Event listener for storage changes (handles changes in other tabs)
    window.addEventListener('storage', updateUserState);

    // Clean up the interval and event listener on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', updateUserState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    <Routes>
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
