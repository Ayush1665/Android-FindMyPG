import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import {ThemeContext} from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';

const PGDetailScreen = ({route, navigation}) => {
  const {pgItem} = route.params;
  const theme = useContext(ThemeContext);
  const [isBooking, setIsBooking] = useState(false);
  const [isPayingLater, setIsPayingLater] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);

  const serviceIcons = {
    AC: 'ac-unit',
    WiFi: 'wifi',
    Laundry: 'local-laundry-service',
    Food: 'restaurant',
    'Light Backup': 'flash-on',
    Gym: 'fitness-center',
    default: 'check-circle',
  };

  const initiateRazorpayPayment = async () => {
    setIsBooking(true);

    try {
      const cleanRent = pgItem.rent.replace(/,/g, '');
      const rentNumber = parseFloat(cleanRent);
      if (isNaN(rentNumber)) {
        throw new Error('Invalid rent amount');
      }

      const amount = Math.round(rentNumber * 100);

      const options = {
        description: `Advance payment for ${pgItem.name}`,
        image:
          'https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-6018-61f7-900f-d92c2e1ad463/raw?se=2025-05-15T19%3A30%3A26Z&sp=r&sv=2024-08-04&sr=b&scid=00000000-0000-0000-0000-000000000000&skoid=add8ee7d-5fc7-451e-b06e-a82b2276cf62&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-15T13%3A24%3A05Z&ske=2025-05-16T13%3A24%3A05Z&sks=b&skv=2024-08-04&sig=3C6V8w1mMa1baUcQQ/dHtESl/rKy6drmsu7QBWnNrmg%3D', // Your app logo
        currency: 'INR',
        key: 'rzp_test_tANvftiC8cm9ph', // Your test key
        amount: amount.toString(),
        name: 'Find My PG',
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'User Name',
        },
        theme: {color: '#4CAF50'},
      };

      const data = await RazorpayCheckout.open(options);

      // Payment success
      setPaymentStatus('success');
      await saveBookedPG();
      setHasBooked(true);

      setTimeout(() => {
        setPaymentStatus(null);
        Alert.alert(
          'Booking Confirmed',
          `Your booking at ${pgItem.name} has been confirmed. Payment of ₹${pgItem.rent} advance is received.`,
          [{text: 'OK', onPress: () => {}}],
        );
      }, 6000);
    } catch (error) {
      setPaymentStatus('failed');

      setTimeout(() => {
        setPaymentStatus(null);
      }, 4000);
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    const checkExistingBooking = async () => {
      try {
        const bookedPG = await AsyncStorage.getItem('bookedPG');
        if (bookedPG) {
          setHasExistingBooking(true);
        }
      } catch (error) {
        console.error('Error checking existing booking:', error);
      }
    };

    checkExistingBooking();
  }, []);

  const handleBookNow = () => {
    if (pgItem.noAdvance) {
      // If no advance is required, proceed directly to booking
      setIsBooking(true);
      setTimeout(() => {
        setIsBooking(false);
        setPaymentStatus('success');
        saveBookedPG();
        setHasBooked(true);
        setTimeout(() => {
          setPaymentStatus(null);
          Alert.alert(
            'Booking Confirmed',
            `Your booking at ${pgItem.name} has been confirmed.`,
            [{text: 'OK', onPress: () => {}}],
          );
        }, 2000);
      }, 1500);
    } else {
      // Initiate Razorpay payment for advance
      initiateRazorpayPayment();
    }
  };

  const handlePayLater = () => {
    setIsPayingLater(true);
    setTimeout(() => {
      setIsPayingLater(false);
      saveBookedPG();
      setHasBooked(true);
      Alert.alert(
        'Booking Requested',
        `Your booking request for ${pgItem.name} has been received. The owner will contact you shortly.`,
        [{text: 'OK', onPress: () => {}}],
      );
    }, 1500);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${pgItem.contact.phone}`);
  };

  const handleEmail = () => {
    const emailUrl = `mailto:${pgItem.contact.email}?subject=Regarding ${pgItem.name}&body=Hello, I'm interested in your PG...`;
    Linking.openURL(emailUrl); 
  };

  const saveBookedPG = async () => {
    try {
      await AsyncStorage.setItem('bookedPG', JSON.stringify(pgItem));
    } catch (error) {
      console.error('Error saving booked PG:', error);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <View
        style={[
          styles.animationContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <Text style={[styles.animationText, {color: theme.colors.text}]}>
          Confirming your payment...
        </Text>
        <LottieView
          source={require('../assets/confirming_payment.json')}
          autoPlay
          loop={true}
          style={styles.animation}
        />
      </View>
    );
  }
  const disabledOverlayStyle = hasExistingBooking
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.dark
          ? 'rgba(255,255,255,0.4)'
          : 'rgba(0,0,0,0.4)',
        zIndex: 10,
      }
    : null;

  if (paymentStatus === 'failed') {
    return (
      <View
        style={[
          styles.animationContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <LottieView
          source={require('../assets/fail_payment.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />
        <TouchableOpacity
          style={[
            styles.tryAgainButton,
            {backgroundColor: theme.colors.primary},
          ]}
          onPress={() => setPaymentStatus(null)}>
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.scrollContent}>
      <Image
        source={
          typeof pgItem.image === 'string' ? {uri: pgItem.image} : pgItem.image
        }
        style={styles.detailImage}
      />

      {!pgItem.isAvailable && (
        <View style={styles.unavailableBanner}>
          <Text style={styles.unavailableText}>Currently Unavailable</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {pgItem.name}
          </Text>
          <Text style={styles.price}>₹{pgItem.rent}/mon</Text>
        </View>

        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={16} color="#FF6B6B" />
          <Text style={[styles.location, {color: theme.colors.text}]}>
            {pgItem.location}
          </Text>
        </View>

        {/* Amenities Section */}
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Amenities
        </Text>
        <View style={styles.amenitiesContainer}>
          {pgItem.services.map((service, index) => (
            <View key={index} style={styles.amenityItem}>
              <MaterialIcons
                name={serviceIcons[service] || serviceIcons.default}
                size={20}
                color="#4CAF50"
              />
              <Text style={[styles.amenityText, {color: theme.colors.text}]}>
                {service}
              </Text>
            </View>
          ))}
        </View>

        {/* Description Section */}
        {pgItem.description && (
          <View style={styles.descriptionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="description"
                size={20}
                color="#4CAF50"
                style={styles.sectionIcon}
              />
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Description
              </Text>
            </View>
            <View style={styles.descriptionContent}>
              <Text
                style={[styles.descriptionText, {color: theme.colors.text}]}>
                {pgItem.description}
              </Text>
            </View>
          </View>
        )}

        {/* Rules Section */}
        {pgItem.rules && Array.isArray(pgItem.rules) && (
          <View style={styles.rulesContainer}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="rule"
                size={20}
                color="#4CAF50"
                style={styles.sectionIcon}
              />
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Rules & Policies
              </Text>
            </View>
            <View style={styles.rulesList}>
              {pgItem.rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <MaterialIcons
                    name="fiber-manual-record"
                    size={12}
                    color="#4CAF50"
                    style={styles.ruleBullet}
                  />
                  <Text style={[styles.ruleText, {color: theme.colors.text}]}>
                    {rule}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {pgItem.isAvailable && (
          <TouchableOpacity
            style={[styles.viewRoomsButton, {borderColor: theme.colors.text}]}
            onPress={() => navigation.navigate('RoomAvailability', {pgItem})}>
            <Text style={[styles.viewRoomsText, {color: theme.colors.text}]}>
              View Available Rooms
            </Text>
          </TouchableOpacity>
        )}

        {/* Booking Buttons Section */}
        {!hasBooked ? (
          pgItem.isAvailable ? (
            pgItem.noAdvance ? (
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.payLaterButton,
                    hasExistingBooking && styles.disabledButton,
                  ]}
                  onPress={handlePayLater}
                  disabled={isPayingLater || hasExistingBooking}>
                  {isPayingLater ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Pay {`₹${pgItem.rent}`}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.bookNowButton,
                    hasExistingBooking && styles.disabledButton,
                  ]}
                  onPress={handleBookNow}
                  disabled={isBooking || hasExistingBooking}>
                  {isBooking ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Pay {`₹${pgItem.advanceAmount} & Confirm Booking`}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.bookNowButton,
                  hasExistingBooking && styles.disabledButton,
                ]}
                onPress={handleBookNow}
                disabled={isBooking || hasExistingBooking}>
                {isBooking ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Book Now</Text>
                )}
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.disabledButton]}
              disabled={true}>
              <Text style={styles.buttonText}>Not Available</Text>
            </TouchableOpacity>
          )
        ) : null}

        {/* Contact Information Section - Only visible after booking */}
        {hasBooked && (
          <View style={styles.contactContainer}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Contact Information
            </Text>
            <View style={styles.contactItem}>
              <MaterialIcons name="person" size={20} color="#4CAF50" />
              <Text style={[styles.contactText, {color: theme.colors.text}]}>
                {pgItem.contact.manager}
              </Text>
            </View>
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <MaterialIcons name="phone" size={20} color="#4CAF50" />
              <Text style={[styles.contactText, {color: '#4CAF50'}]}>
                {pgItem.contact.phone}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <MaterialIcons name="email" size={20} color="#4CAF50" />
              <Text style={[styles.contactText, {color: '#4CAF50'}]}>
                {pgItem.contact.email || 'Not provided'}
              </Text>
            </TouchableOpacity>
            <View style={styles.contactNote}>
              <MaterialIcons name="info" size={16} color="#FF9800" />
              <Text style={[styles.noteText, {color: theme.colors.text}]}>
                Please contact the PG owner within 24 hours to confirm your
                booking
              </Text>
            </View>
          </View>
        )}
      </View>
      {hasExistingBooking && (
        <View style={[styles.disabledOverlay, disabledOverlayStyle]}>
          <View style={styles.existingBookingMessage} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animationText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  tryAgainButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  tryAgainText: {
    color: '#FF6666',
    fontSize: 16,
    fontWeight: '600',
  },
  detailImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  unavailableBanner: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  unavailableText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 10,
  },
  rulesContainer: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 8,
  },
  rulesList: {
    paddingLeft: 30,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ruleIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  ruleBullet: {
    marginTop: 5,
    marginRight: 10,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 16,
    marginLeft: 5,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 15,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  contactContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
  },
  contactNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 5,
  },
  noteText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  bookNowButton: {
    backgroundColor: '#4CAF50',
    marginTop: 25,
  },
  payLaterButton: {
    marginTop: 25,
    backgroundColor: '#FF9800',
  },

  buttonText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  animation: {
    width: 400,
    height: 200,
  },
  bookingConfirmation: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  descriptionContainer: {
    marginBottom: 24,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  descriptionContent: {
    paddingLeft: 30, // Align with icon
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  confirmationText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  confirmationSubtext: {
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  viewRoomsButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 15,
  },
  viewRoomsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  existingBookingMessage: {
    backgroundColor: 'rgba(136, 136, 136)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    width: '80%',
  },
  existingBookingText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 10,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
    opacity: 0.7,
  },
});

export default PGDetailScreen;
