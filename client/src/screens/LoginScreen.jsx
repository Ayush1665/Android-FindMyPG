import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { ThemeContext } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';

const LoginScreen = ({ navigation }) => {
  const { authorize, clearSession, isLoading } = useAuth0();
  const theme = useContext(ThemeContext);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGuestLoggingIn, setIsGuestLoggingIn] = useState(false);

  const onLogin = async () => {
    try {
      setIsLoggingIn(true);
      await authorize({ scope: 'openid profile email' });
    } catch (e) {
      console.log('Auth Error:', e);
      Alert.alert(
        'Login Failed',
        e.message || 'Unable to login. Please try again.',
        [{ text: 'OK', onPress: () => {} }]
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onGuestLogin = () => {
    setIsGuestLoggingIn(true);
    setTimeout(() => {
      navigation.replace('Home', { isGuest: true });
      setIsGuestLoggingIn(false);
    }, 5000);
  };

  if (isGuestLoggingIn) {
    return (
      <View style={[styles.container, { 
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center'
      }]}>
        <LottieView
          source={require('../assets/guest.json')}
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
        <Text style={[styles.title, { color: theme.colors.text, marginTop: 20 }]}>
          Logging you as a guest...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.inner}>
        <Image
          source={require('../assets/logo.png')}
          style={[styles.logo, { width: 120, height: 120, borderRadius: 12 }]}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Find My PG
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Discover the best PGs around you
        </Text>

        {isLoggingIn || isLoading ? (
          <View style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.loginButtonText}>Signing in...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            onPress={onLogin}
            activeOpacity={0.85}
            disabled={isLoggingIn}
          >
            <Icon name="log-in-outline" size={22} color="#fff" />
            <Text style={styles.loginButtonText}>Login / Signup</Text>
          </TouchableOpacity>
        )}

        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.text }]} />
          <Text style={[styles.dividerText, { color: theme.colors.text }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.text }]} />
        </View>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
          onPress={onGuestLogin}
          disabled={isGuestLoggingIn}
        >
          <Text style={[styles.secondaryButtonText, { color: "#fff" }]}>
            Explore as Guest
          </Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: theme.colors.text }]}>
          By continuing, you agree to our {'\n'}
          <Text style={styles.linkText}>Terms of Service</Text> and {' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 36,
    opacity: 0.8,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    width: '100%',
    marginBottom: 16,
    elevation: 2,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    width: '100%',
    marginBottom: 28,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    paddingHorizontal: 10,
    opacity: 0.6,
    fontSize: 14,
  },
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});

export default LoginScreen;