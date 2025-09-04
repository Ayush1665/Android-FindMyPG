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

const PrivacyPolicyScreen = () => {
  const theme = useContext(ThemeContext);

  const handleEmailPress = () => {
    Linking.openURL('mailto:privacy@findmypg.com');
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, {color: theme.colors.text}]}>
        Privacy Policy
      </Text>
      <Text style={[styles.effectiveDate, {color: theme.colors.text}]}>
        Effective: May 2025
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        1. Information We Collect
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        We collect information to provide better services to all our users. This
        includes:
      </Text>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Personal information you provide (name, email, phone number)
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
          PG search preferences and booking history
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
          Device information and location data (with your permission)
        </Text>
      </View>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        2. How We Use Information
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        The information we collect is used to:
      </Text>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Provide and improve our services
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
          Personalize your experience
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
          Process bookings and transactions
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
          Communicate with you about your account
        </Text>
      </View>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        3. Data Sharing
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        We do not sell your personal information. We may share information with:
      </Text>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          PG owners/hosts for booking purposes
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
          Service providers who assist in our operations
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
          Legal authorities when required by law
        </Text>
      </View>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        4. Your Choices
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>You can:</Text>
      <View style={styles.listItem}>
        <MaterialIcons
          name="circle"
          size={8}
          color={theme.colors.text}
          style={styles.bullet}
        />
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Update account information in app settings
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
          Disable location services in device settings
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
          Request account deletion by contacting us
        </Text>
      </View>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        5. Data Security
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        We implement appropriate security measures to protect your information,
        including encryption and secure servers.
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        6. Changes to This Policy
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        We may update this policy periodically. We'll notify you of significant
        changes through the app or via email.
      </Text>

      <Text style={[styles.heading, {color: theme.colors.text}]}>
        7. Contact Us
      </Text>
      <Text style={[styles.text, {color: theme.colors.text}]}>
        For questions about this privacy policy, please contact us at:
      </Text>
      <TouchableOpacity onPress={handleEmailPress}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <MaterialIcons name="email" size={20} color="#888" />
          <Text
            style={[
              styles.email,
              {color: '#888', marginLeft: 5, marginBottom: 10},
            ]}>
            privacy@findmypg.com
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

export default PrivacyPolicyScreen;
