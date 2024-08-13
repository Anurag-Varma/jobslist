import React, { useEffect } from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

import { Route, Routes, Navigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import userAtom from './atoms/userAtom';

import Cookies from 'js-cookie';

function isCookieExpired(cookie) {
  const cookieParts = cookie.split(';');

  for (let i = 0; i < cookieParts.length; i++) {
    const cookiePart = cookieParts[i].trim();
    if (cookiePart.startsWith('expires=')) {
      const expiresDate = new Date(cookiePart.substring('expires='.length));
      return expiresDate < new Date(); // If the expiration date is in the past, the cookie is expired
    }
  }

  // If no expiration date is found, the cookie is considered session-based and not expired
  return false;
}

function App() {
  const [user, setUser] = useRecoilState(userAtom);

  useEffect(() => {
    const checkCookieExpiration = () => {
      const cookie = Cookies.get('jwt');
      if (cookie && isCookieExpired(cookie)) {
        setUser(null);
      }
    };

    checkCookieExpiration();
  }, []);

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
