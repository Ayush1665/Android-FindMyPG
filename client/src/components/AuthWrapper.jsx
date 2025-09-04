import React, {useState, useEffect, useContext} from 'react';
import {View, ActivityIndicator, Text } from 'react-native';
import {useAuth0} from 'react-native-auth0';
import LoginScreen from '../screens/LoginScreen';
import {ThemeContext} from '../context/ThemeContext';
import OnboardingScreen from '../screens/OnBoardingScreen';

const AuthWrapper = ({children}) => {
  const {isLoading, user} = useAuth0();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const theme = useContext(ThemeContext);

  useEffect(() => {
    // Simulate checking auth state
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || isCheckingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // If user is logged in or is a guest, show the app
  if (user || isGuest) {
    if (!onboardingComplete && !isGuest) { // Skip onboarding for guests
      return <OnboardingScreen onComplete={() => setOnboardingComplete(true)} />;
    }
    return children;
  }

  // For non-guest, non-logged in users, show login screen
  return <LoginScreen navigation={{ replace: (route, params) => {
    if (route === 'Home' && params?.isGuest) {
      setIsGuest(true);
    }
  }}} />;
};

export default AuthWrapper;