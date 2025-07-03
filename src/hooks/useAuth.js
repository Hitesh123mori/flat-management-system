// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserRole } from '../services/firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          setUser({ ...user, role });
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUser(null);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userRole === 'admin';
  const isUser = userRole === 'user';

  const signOut = () => firebaseSignOut(auth); // ✅ Add this

  return {
    user,
    loading,
    userRole,
    isAdmin,
    isUser,
    isAuthenticated: !!user,
    signOut, // ✅ Return it here
  };
};
