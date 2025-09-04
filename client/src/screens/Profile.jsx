import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {ThemeContext} from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
import { Linking, Share, Clipboard } from 'react-native';
import {useAuth0} from 'react-native-auth0';

const Profile = ({navigation}) => {
  const theme = useContext(ThemeContext);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const {clearSession, user, authorize, error} = useAuth0();
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
  });

  const navigations = useNavigation();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (user) {
          setEditedProfile({
            name: user.name || 'User',
            email: user.email || '',
          });
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handlePremiumPress = () => {
    navigations.navigate('PremiumScreen');
  };

  const handlePrivacyPress = () => {
    navigations.navigate('PrivacyPolicyScreen');
  };

  const handleTermsPress = () => {
    navigations.navigate('TermsScreen');
  };

  const handleContactSupportPress = () => {
    navigations.navigate('ContactSupportScreen');
  };

  const iconBackground = theme.isDarkMode
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)';

  const cardShadow = theme.isDarkMode
    ? {}
    : {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      };

      const handleReferFriend = () => {
        const referralCode = "PG2025AYUSH";
        const referralLink = "https://android-release.vercel.app/?ref=" + referralCode;
        const message = `Join Find My PG using my referral code ${referralCode} and we both get ₹100 credit!\n\n${referralLink}`;
      
        Share.share({
          message: message,
          title: 'Earn ₹100 with Find My PG',
          url: referralLink
        }, {
          dialogTitle: 'Share your referral link',
          subject: 'Earn ₹100 with Find My PG'
        })
        .then(result => {
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // Shared with activity type (e.g., WhatsApp, Facebook)
              console.log('Shared with', result.activityType);
            } else {
              // Shared
              console.log('Shared successfully');
            }
          } else if (result.action === Share.dismissedAction) {
            // Dismissed
            console.log('Share dismissed');
          }
        })
        .catch(error => {
          console.log('Error sharing:', error.message);
          Alert.alert('Error', 'Could not share referral link');
        });
      };
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await clearSession();
          } catch (e) {
            console.log('Log out cancelled');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
    Alert.alert(
      'Notifications',
      notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled',
    );
  };


  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <Ionicons name="warning-outline" size={40} color="#EF5350" />
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>
          Error loading profile: {error.message}
        </Text>
        <TouchableOpacity
          style={[
            styles.loginButton,
            {backgroundColor: theme.colors.primary, marginTop: 20},
          ]}
          onPress={() => authorize()}>
          <Text style={styles.loginButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={[
          styles.loginContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <View style={styles.loginContent}>
          <View style={styles.loginIconContainer}>
            <Ionicons
              name="person-circle-outline"
              size={80}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.loginTitle, {color: theme.colors.text}]}>
            Welcome to Find MyPG
          </Text>
          <Text style={[styles.loginSubtitle, {color: theme.colors.text}]}>
            Login to access your bookings, preferences and more
          </Text>
          <TouchableOpacity
            style={[
              styles.loginButton,
              {backgroundColor: theme.colors.primary},
            ]}
            onPress={() => authorize()}>
            <Ionicons name="log-in-outline" size={24} color="white" />
            <Text style={styles.loginButtonText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoggingOut) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>
          Logging out...
        </Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View
        style={[
          styles.loginContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <View style={styles.loginContent}>
          <View style={styles.loginIconContainer}>
            <Ionicons
              name="person-circle-outline"
              size={80}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.loginTitle, {color: theme.colors.text}]}>
            Welcome to Find MyPG
          </Text>
          <Text style={[styles.loginSubtitle, {color: theme.colors.text}]}>
            Login to access your bookings, preferences and more
          </Text>
          <TouchableOpacity
            style={[
              styles.loginButton,
              {backgroundColor: theme.colors.primary},
            ]}
            onPress={() => authorize()}>
            <Ionicons name="log-in-outline" size={24} color="white" />
            <Text style={styles.loginButtonText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <View style={styles.container}>
        {/* Profile Header with Edit Button */}
        <View
          style={[
            styles.cardContainer,
            {backgroundColor: theme.colors.card},
            cardShadow,
          ]}>
          <View style={styles.profileSection}>
            <View
              style={[
                styles.profileCircle,
                {backgroundColor: theme.colors.primary},
              ]}>
              {user.picture ? (
                <Image
                  source={{uri: user.picture}}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person" size={40} color="white" />
              )}
            </View>
            <View style={styles.profileTextContainer}>
              <View style={styles.nameVerificationRow}>
                <Text style={[styles.profileName, {color: theme.colors.text}]}>
                  {editedProfile.name}
                </Text>
              </View>
              <Text style={[styles.profileEmail, {color: theme.colors.text}]}>
                {editedProfile.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Premium Banner */}
        <TouchableOpacity
          style={[
            styles.premiumBanner,
            cardShadow,
            {
              backgroundColor: theme.isDarkMode
                ? 'rgba(255, 215, 0, 0.7)'
                : '#FFD700',
            },
          ]}
          onPress={handlePremiumPress}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumIconContainer}>
              <Ionicons
                name="diamond"
                size={24}
                color={theme.isDarkMode ? '#000' : '#8B4513'}
              />
            </View>
            <View style={styles.premiumTextContainer}>
              <Text
                style={[
                  styles.premiumTitle,
                  {color: theme.isDarkMode ? '#000' : '#8B4513'},
                ]}>
                Upgrade to premium
              </Text>
              <Text
                style={[
                  styles.premiumSubtitle,
                  {color: theme.isDarkMode ? '#333' : '#5D3A00'},
                ]}>
                Priority bookings, discounts & more
              </Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={theme.isDarkMode ? '#000' : '#8B4513'}
            />
          </View>
        </TouchableOpacity>

        {/* Account Settings Section */}
        <View
          style={[
            styles.sectionContainer,
            {backgroundColor: theme.colors.card},
            cardShadow,
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Account Settings
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={theme.toggleTheme}>
            <View style={styles.iconTextContainer}>
              <View
                style={[styles.iconCircle, {backgroundColor: iconBackground}]}>
                {theme.isDarkMode ? (
                  <MaterialCommunityIcons
                    name="weather-night"
                    size={20}
                    color={theme.colors.text}
                  />
                ) : (
                  <Ionicons name="sunny" size={20} color={theme.colors.text} />
                )}
              </View>
              <Text style={[styles.cardText, {color: theme.colors.text}]}>
                {theme.isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Switch
              value={theme.isDarkMode}
              onValueChange={theme.toggleTheme}
              thumbColor={theme.isDarkMode ? '#f5dd4b' : '#f4f3f4'}
              trackColor={{false: '#767577', true: '#81b0ff'}}
            />
          </TouchableOpacity>

          {/* Notifications Toggle */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={toggleNotifications}>
            <View style={styles.iconTextContainer}>
              <View
                style={[styles.iconCircle, {backgroundColor: iconBackground}]}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <Text style={[styles.cardText, {color: theme.colors.text}]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
              trackColor={{false: '#767577', true: '#81b0ff'}}
            />
          </TouchableOpacity>

        </View>
        {/* Support Section */}
        <View
          style={[
            styles.sectionContainer,
            {backgroundColor: theme.colors.card},
            cardShadow,
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Support
          </Text>

          {/* Refer a Friend */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleReferFriend}>
            <View style={styles.iconTextContainer}>
              <View
                style={[styles.iconCircle, {backgroundColor: iconBackground}]}>
                <MaterialIcons
                  name="person-add"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <Text style={[styles.cardText, {color: theme.colors.text}]}>
                Refer a Friend
              </Text>
            </View>
            <View style={styles.referralBadge}>
              <Text style={styles.referralBadgeText}>Earn ₹100</Text>
            </View>
          </TouchableOpacity>

          {/* Contact Support */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleContactSupportPress}>
            <View style={styles.iconTextContainer}>
              <View
                style={[styles.iconCircle, {backgroundColor: iconBackground}]}>
                <MaterialCommunityIcons
                  name="headset"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <Text style={[styles.cardText, {color: theme.colors.text}]}>
                Contact Support
              </Text>
            </View>
            <Entypo name="chevron-right" size={20} color={theme.colors.text} />
          </TouchableOpacity>
         
        </View>

        {/* Legal Section */}
        <View
          style={[
            styles.sectionContainer,
            {backgroundColor: theme.colors.card},
            cardShadow,
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Legal
          </Text>

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleTermsPress}>
            <View style={styles.iconTextContainer}>
              <View
                style={[styles.iconCircle, {backgroundColor: iconBackground}]}>
                <MaterialIcons
                  name="description"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <Text style={[styles.cardText, {color: theme.colors.text}]}>
                Terms & Conditions
              </Text>
            </View>
            <Entypo name="chevron-right" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handlePrivacyPress}>
            <View style={styles.iconTextContainer}>
              <View
                style={[styles.iconCircle, {backgroundColor: iconBackground}]}>
                <MaterialCommunityIcons
                  name="shield-account"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
              <Text style={[styles.cardText, {color: theme.colors.text}]}>
                Privacy Policy
              </Text>
            </View>
            <Entypo name="chevron-right" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, {color: theme.colors.text}]}>
          Find My PG v1.2.0
        </Text>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.isDarkMode
                ? 'rgba(239, 83, 80, 0.2)'
                : 'rgba(239, 83, 80, 0.1)',
              borderColor: theme.isDarkMode
                ? 'rgba(239, 83, 80, 0.5)'
                : 'rgba(239, 83, 80, 0.3)',
            },
          ]}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF5350" />
          <Text style={[styles.logoutText, {color: '#EF5350'}]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginContent: {
    alignItems: 'center',
    width: '100%',
  },
  loginIconContainer: {
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 30,
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    gap: 12,
    width: '100%',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    width: '100%',
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 100,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 23,
    fontWeight: '600',
    marginBottom: 8,
  },
  profileEmail: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 12,
    opacity: 0.7,
  },

  cardContainer: {
    padding: 16,
    borderRadius: 12,
  },
  sectionContainer: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
  },
  premiumBanner: {
    padding: 16,
    borderRadius: 12,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumIconContainer: {
    padding: 10,
    borderRadius: 50,
    marginRight: 12,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 12,
    opacity: 0.9,
  },
  statusBadge: {
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadge: {
    backgroundColor: '#4a6bff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  referralBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  referralBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },

  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  earnBadge: {
    backgroundColor: '#FFA000',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  earnBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Profile;
