import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// A simple debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const useFirestoreSettings = (user) => {
  // Default settings
  const [isOn, setIsOn] = useState(true);
  const [mode, setMode] = useState('blink');
  const [colors, setColors] = useState(['#FF0000', '#00FF00', '#FFFF00', '#FFA500']);
  const [isLoaded, setIsLoaded] = useState(false);

  // Debounced function to write to Firestore
  const debouncedWrite = useMemo(
    () => debounce(async (uid, settings) => {
      if (uid) {
        console.log('Writing to Firestore:', settings);
        try {
          const userDocRef = doc(db, 'users', uid);
          await setDoc(userDocRef, { settings }, { merge: true });
        } catch (error) {
          console.error("Error writing settings to Firestore:", error);
        }
      }
    }, 500), // 500ms delay
    [] 
  );

  // Effect to read settings from Firestore on initial load
  useEffect(() => {
    const readSettings = async () => {
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const fetchedSettings = docSnap.data().settings;
            if (fetchedSettings) {
              console.log('Settings loaded from Firestore:', fetchedSettings);
              // Set state only if values are not null/undefined
              if (fetchedSettings.isOn !== undefined && fetchedSettings.isOn !== null) {
                setIsOn(fetchedSettings.isOn);
              }
              if (fetchedSettings.mode) {
                setMode(fetchedSettings.mode);
              }
              if (fetchedSettings.colors && Array.isArray(fetchedSettings.colors) && fetchedSettings.colors.length === 4) {
                setColors(fetchedSettings.colors);
              }
            }
          } else {
            console.log('No settings document found for user. Using default settings.');
          }
        } catch (error) {
          console.error("Error reading settings from Firestore:", error);
        } finally {
          setIsLoaded(true);
        }
      }
    };

    readSettings();
  }, [user]); // Only runs when the user object changes

  // Effect to write settings to Firestore when they change
  useEffect(() => {
    // Only write after initial settings have been loaded
    if (isLoaded && user?.uid) {
      const settings = { isOn, mode, colors };
      debouncedWrite(user.uid, settings);
    }
  }, [isOn, mode, colors, isLoaded, user, debouncedWrite]);

  return {
    isOn, setIsOn,
    mode, setMode,
    colors, setColors,
    isLoaded
  };
};

export default useFirestoreSettings;