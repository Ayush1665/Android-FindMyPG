import React, {useContext} from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {ThemeContext} from '../context/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const TermsScreen = () => {
  const theme = useContext(ThemeContext);

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@findmypg.com');
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, {color: theme.colors.text}]}>
        Terms & Conditions
      </Text>
      <Text style={[styles.effectiveDate, {color: theme.colors.text}]}>
        Last Updated: May 2025
      </Text>

      <Text style={[styles.introText, {color: theme.colors.text}]}>
        Welcome to Find My PG! These Terms & Conditions govern your use of our
        mobile application and services.
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        1. Acceptance of Terms
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        By accessing or using the Find My PG app, you agree to be bound by these
        Terms. If you disagree, please do not use our services.
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        2. User Accounts
      </Text>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          You must be at least 18 years old to use our services
        </Text>
      </View>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          You are responsible for maintaining account confidentiality
        </Text>
      </View>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Provide accurate and current information
        </Text>
      </View>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        3. PG Listings
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        Find My PG acts as a platform connecting users with PG providers:
      </Text>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          We verify listings but don't guarantee their accuracy
        </Text>
      </View>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Users should verify details before booking
        </Text>
      </View>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Prices and availability may change without notice
        </Text>
      </View>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        4. Bookings & Payments
      </Text>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Booking terms are between you and the PG provider
        </Text>
      </View>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          We may charge service fees for transactions
        </Text>
      </View>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Cancellation policies vary by provider
        </Text>
      </View>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        5. User Responsibilities
      </Text>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Use the app only for lawful purposes
        </Text>
      </View>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Don't post false or misleading information
        </Text>
      </View>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Respect the privacy of PG owners and other users
        </Text>
      </View>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        6. Intellectual Property
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        The Find My PG app and its original content, features, and functionality
        are owned by us and are protected by international copyright, trademark,
        and other intellectual property laws.
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        7. Limitation of Liability
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        Find My PG shall not be liable for any indirect, incidental, special,
        consequential or punitive damages resulting from your use of or
        inability to use the service.
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        8. Changes to Terms
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        We reserve the right to modify these terms at any time. Your continued
        use of the app constitutes acceptance of the updated terms.
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        9. Governing Law
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        These Terms shall be governed by the laws of [Your Country/State]
        without regard to its conflict of law provisions.
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        10. Contact Information
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        For questions about these Terms & Conditions, please contact us at:
      </Text>
      <TouchableOpacity onPress={handleEmailPress}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <MaterialIcons name="email" size={20} color="#888" />
          <Text
            style={[
              styles.email,
              {color: '#888', marginLeft: 5, marginBottom: 10},
            ]}>
            support@findmypg.com
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  effectiveDate: {
    fontSize: 14,
    marginBottom: 20,
    color: '#666',
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  bullet: {
    marginRight: 10,
    marginTop: 8,
  },
  email: {
    fontSize: 16,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
});

export default TermsScreen;
