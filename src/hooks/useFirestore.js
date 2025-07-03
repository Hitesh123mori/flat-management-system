// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import {
  doc,
  collection,
  getDocs,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../services/firebase';

export const useFirestore = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || collectionName.trim() === '') {
      console.error('Invalid collection name passed to useFirestore:', collectionName);
      setError('Invalid collection name');
      setLoading(false);
      return;
    }

    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(documents);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  // ✅ Add this function
  const getCollection = async (colName) => {
    if (!colName || typeof colName !== 'string') {
      throw new Error(`Invalid collection name: ${colName}`);
    }

    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  return { data, loading, error, getCollection };
};
