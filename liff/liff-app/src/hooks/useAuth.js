import { useState, useEffect } from 'react';
import liff from '@line/liff';
import { auth } from '../firebase'; // Import Firebase auth instance
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

const useAuth = () => {
  const [liffInitialized, setLiffInitialized] = useState(false);
  const [liffError, setLiffError] = useState(null);
  const [user, setUser] = useState(null); // Firebase user
  const [loading, setLoading] = useState(true); // Loading state for authentication

  useEffect(() => {
    const initLiffAndAuth = async () => {
      try {
        // 1. Initialize LIFF
        if (!liffInitialized) { // Only initialize once
          await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
          setLiffInitialized(true);
          console.log("LIFF initialized successfully.");
        }

        // 2. Check LIFF login status
        if (!liff.isLoggedIn()) {
          console.log("LIFF not logged in. Redirecting to LIFF login...");
          liff.login(); // Redirects to LINE login page
          return; // Stop further processing until after redirect
        }

        // 3. Get LIFF ID token
        const idToken = liff.getIDToken();
        if (!idToken) {
          throw new Error("LIFF ID Token is null.");
        }
        console.log("LIFF ID Token obtained.");

        // 4. Send ID token to Cloud Function to get Firebase custom token
        const createTokenUrl = import.meta.env.VITE_CREATE_TOKEN_URL;
        if (!createTokenUrl) {
          throw new Error("VITE_CREATE_TOKEN_URL is not defined in environment variables.");
        }

        console.log("Exchanging LIFF ID Token for Firebase Custom Token...");
        const response = await fetch(createTokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          // Handle 401 error (expired LIFF ID token) specifically
          if (response.status === 401) {
            console.warn("Authentication failed (401). Token might be expired. Logging out LIFF session and trying to log in again...");
            liff.logout(); // Clear LIFF session
            liff.login(); // Force re-login
            return; // Stop further processing
          }
          const errorText = await response.text();
          throw new Error(`Failed to get Firebase custom token: ${response.status} ${errorText}`);
        }

        const { firebaseToken } = await response.json();
        if (!firebaseToken) {
          throw new Error("Firebase Custom Token not received from Cloud Function.");
        }
        console.log("Firebase Custom Token obtained.");

        // 5. Sign in to Firebase with the custom token
        console.log("Signing in to Firebase with custom token...");
        await signInWithCustomToken(auth, firebaseToken);
        console.log("Firebase signed in successfully.");

      } catch (error) {
        console.error("Authentication flow failed:", error);
        setLiffError(error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // If Firebase user exists and LIFF is initialized, we are good to go.
      // If currentUser is null, it means Firebase is not signed in, trigger LIFF/Firebase flow.
      if (!currentUser && liffInitialized) {
        initLiffAndAuth();
      } else if (!currentUser && !liffInitialized) {
        // If not authenticated and liff not initialized, then init LIFF and Auth
        initLiffAndAuth();
      } else if (currentUser && liffInitialized) {
        // If authenticated and liff initialized, then loading is done.
        setLoading(false);
      }
    });

    // Initial check and trigger for authentication if not already signed in
    if (!auth.currentUser) {
      initLiffAndAuth();
    }

    return () => unsubscribe(); // Cleanup Firebase auth listener
  }, [liffInitialized]); // Depend on liffInitialized to re-run when LIFF is ready

  return { liffInitialized, liffError, user, loading };
};

export default useAuth;