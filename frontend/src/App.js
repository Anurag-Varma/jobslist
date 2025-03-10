import React, { useEffect } from 'react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import UpdateProfilePage from './pages/UpdateProfilePage';

import { Route, Routes, Navigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import userAtom from './atoms/userAtom';
import authScreenAtom from './atoms/authAtom';
import OAuthCallback from './pages/OAuthCallback';


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
  const setAuthScreenState = useSetRecoilState(authScreenAtom);

  useEffect(() => {
    const checkCookieExpiration = () => {
      const cookie = Cookies.get('jwt');
      if (!cookie || isCookieExpired(cookie)) {
        localStorage.removeItem('jobs-list');
        setUser(null);
        setAuthScreenState('login');
      }
    };

    checkCookieExpiration();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/editProfile" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
      </Routes>
    </>
  );
}

export default App;
