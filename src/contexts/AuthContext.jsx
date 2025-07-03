// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const role = await authService.getUserRole(user.uid);

          console.log(user.email) ;
        
          setUser(user);
          setUserRole(role);
          setUserData({ uid: user.uid, email: user.email, role });
        } else {
          setUser(null);
          setUserRole(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

 const signIn = async (email, password) => {
  try {
    setLoading(true);
    setError(null);

    const result = await authService.signIn(email, password);

    const role = await authService.getUserRole(result.user.uid);

    setUser(result.user);
    setUserRole(role);
    setUserData({ uid: result.user.uid, email: result.user.email, role });

    return { user: result.user, role };
  } catch (error) {
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};


  const signup = async (email, password, role) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.signUp(email, password, role);
      return result.user;
    } catch (error) {
      setError(error.message)
      throw error ;
    }finally{
      setLoading(false) ;
    }
  }; 

  
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setUserRole(null);
      setUserData(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return userRole === 'admin';
  };

  const isUser = () => {
    return userRole === 'user';
  };

  const value = {
    user,
    userRole,
    userData,
    loading,
    error,
    signIn,
    signup,
    signOut,
    isAdmin,
    isUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};