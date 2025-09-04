import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import React, {useContext, useState, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {ThemeContext} from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import RazorpayCheckout from 'react-native-razorpay';

const MyPG = ({navigation, route}) => {
  const theme = useContext(ThemeContext);
  const [bookedPG, setBookedPG] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [nextDueDate, setNextDueDate] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasPenalty, setHasPenalty] = useState(false);
  const intervalRef = useRef();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutWindowEnd, setCheckoutWindowEnd] = useState(null);
  const [canCheckout, setCanCheckout] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadBookedPG();

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []),
  );

  const loadBookedPG = async () => {
    try {
      const storedPG = await AsyncStorage.getItem('bookedPG');
      if (storedPG) {
        const pgData = JSON.parse(storedPG);
        setBookedPG(pgData);

        // Calculate next due date (30 days from booking time)
        const bookingTime = pgData.bookingTime ? new Date(pgData.bookingTime) : new Date();
        const dueDate = new Date(bookingTime.getTime() + 30 * 24 * 60 * 60 * 1000);
        setNextDueDate(dueDate);

        // Calculate checkout window (3 days from booking)
        const checkoutEndDate = new Date(bookingTime.getTime() + 3 * 24 * 60 * 60 * 1000);
        setCheckoutWindowEnd(checkoutEndDate);

        // Calculate refund amount (90% of rent)
        const rentAmount = parseInt(pgData.rent.replace(/,/g, ''), 10);
        setRefundAmount(Math.floor(rentAmount * 0.9));

        // Check if we're still within the checkout window
        const now = new Date();
        setCanCheckout(now <= checkoutEndDate);

        if (dueDate > new Date()) {
          startCountdown(dueDate);
        } else {
          // If due date passed, penalty
          setHasPenalty(true);
        }
      } else {
        setBookedPG(null);
        setNextDueDate(null);
        setTimeLeft(0);
        setHasPenalty(false);
        setCheckoutWindowEnd(null);
        setCanCheckout(false);
      }
    } catch (error) {
      console.error('Error loading booked PG:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPaymentDueSoon = () => {
    if (!nextDueDate) return false;
    const now = new Date();
    const timeDiff = nextDueDate - now;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    return daysDiff <= 10;
  };

  const startCountdown = dueDate => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    updateTimeLeft(dueDate);
    intervalRef.current = setInterval(() => {
      updateTimeLeft(dueDate);
    }, 1000);
  };

  const updateTimeLeft = dueDate => {
    const now = new Date();
    const diff = dueDate - now;

    if (diff <= 0) {
      setTimeLeft(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setHasPenalty(true);
    } else {
      setTimeLeft(diff);
    }
  };

  const extendPaymentCycle = (withPenalty = false) => {
    const newDueDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
    setNextDueDate(newDueDate);
    startCountdown(newDueDate);
    setHasPenalty(false);

    const updatedPG = {
      ...bookedPG,
      lastPaymentTime: new Date().toISOString(),
      penaltyPaid: withPenalty ? true : bookedPG?.penaltyPaid || false,
    };

    setBookedPG(updatedPG);
    AsyncStorage.setItem('bookedPG', JSON.stringify(updatedPG));
  };

  const formatDaysLeft = (time) => {
    if (time <= 0) return '0 days';
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} day${days !== 1 ? 's' : ''} ${hours > 0 ? `${Math.floor(hours)} hours` : ''}`;
  };

  const formatDate = date => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePayNow = () => {
    const baseAmount = parseInt(bookedPG.rent.replace(/,/g, ''), 10);
    const amountInPaise = (hasPenalty ? baseAmount + 100 : baseAmount) * 100;

    const options = {
      description: hasPenalty
        ? `Monthly Rent + Penalty for ${bookedPG.name}`
        : `Monthly Rent for ${bookedPG.name}`,
      image: 'https://your-logo-url.png',
      currency: 'INR',
      key: 'rzp_test_tANvftiC8cm9ph',
      amount: amountInPaise.toString(),
      name: 'Find My PG',
      prefill: {
        email: 'user@example.com',
        contact: '9999999999',
        name: 'PG Tenant',
      },
      theme: {color: '#4CAF50'},
    };

    RazorpayCheckout.open(options)
      .then(async data => {
        setPaymentStatus('success');
        extendPaymentCycle(hasPenalty);

        const paymentRecord = {
          id: data.razorpay_payment_id,
          amount: baseAmount,
          penalty: hasPenalty ? 100 : 0,
          date: new Date().toISOString(),
          pgId: bookedPG.id,
          pgName: bookedPG.name,
        };

        await savePaymentRecord(paymentRecord);

        setTimeout(() => {
          setPaymentStatus(null);
        }, 5000);
      })
      .catch(error => {
        setPaymentStatus('failed');
        setTimeout(() => {
          setPaymentStatus(null);
        }, 4500);
      });
  };

  const savePaymentRecord = async payment => {
    try {
      const payments = await AsyncStorage.getItem('pgPayments');
      let paymentHistory = payments ? JSON.parse(payments) : [];
      paymentHistory.push(payment);
      await AsyncStorage.setItem('pgPayments', JSON.stringify(paymentHistory));
    } catch (error) {
      console.error('Error saving payment record:', error);
    }
  };

  const handleCheckout = () => {
    let message = 'Are you sure you want to checkout from this PG?';
    if (hasPenalty) {
      message = 'You have a penalty of ₹100. Are you sure you want to checkout?';
    } else if (canCheckout) {
      message = `You will get a refund of ₹${refundAmount}. Are you sure you want to checkout?`;
    } else {
      message = 'Checkout window has expired. You need to pay the rent to checkout.';
      Alert.alert('Checkout Not Available', message);
      return;
    }

    Alert.alert('Checkout Confirmation', message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: hasPenalty ? 'Pay & Checkout' : 'Yes, Checkout',
        onPress: async () => {
          setIsCheckingOut(true);
          setTimeout(async () => {
            await AsyncStorage.removeItem('bookedPG');
            setBookedPG(null);
            setNextDueDate(null);
            setTimeLeft(0);
            setHasPenalty(false);
            setIsCheckingOut(false);
            setShowSuccess(true);

            setTimeout(() => {
              setShowSuccess(false);
              navigation.navigate('Home');
            }, 1800);
          }, 3000);
        },
      },
    ]);
  };

  const renderPGItem = ({item}) => (
    <TouchableOpacity
      style={[styles.pgCard, {backgroundColor: theme.colors.card}]}
      onPress={() => navigation.navigate('PGDetail', {pgItem: item})}>
      <Image
        source={typeof item.image === 'string' ? {uri: item.image} : item.image}
        style={styles.pgImage}
      />
      <View style={styles.pgInfo}>
        <Text style={[styles.pgName, {color: theme.colors.text}]}>
          {item.name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={theme.colors.text}
            style={{opacity: 0.7}}
          />
          <Text style={[styles.pgLocation, {color: theme.colors.text}]}>
            {item.location}
          </Text>
        </View>
        <Text style={[styles.pgPrice, {color: '#4CAF50'}]}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  if (paymentStatus === 'success') {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <LottieView
          source={require('../assets/confirming_payment.json')}
          autoPlay
          loop={true}
          style={styles.paymentAnimation}
        />
        <Text style={[styles.paymentStatusText, {color: theme.colors.text}]}>
          Confirming your payment
        </Text>
      </View>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <LottieView
          source={require('../assets/fail_payment.json')}
          autoPlay
          loop={false}
          style={styles.paymentAnimation}
        />
        <Text style={[styles.paymentStatusText, {color: theme.colors.text}]}>
          Payment Failed
        </Text>
        <TouchableOpacity
          style={[styles.tryAgainButton, {backgroundColor: theme.colors.primary}]}
          onPress={() => setPaymentStatus(null)}>
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || isCheckingOut) {
    return (
      <View style={[styles.container, {
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }]}>
        <LottieView
          source={require('../assets/checkout.json')}
          autoPlay
          loop
          style={{width: 200, height: 200}}
        />
        {isCheckingOut && (
          <Text style={[styles.loadingText, {color: theme.colors.text}]}>
            Processing {hasPenalty ? 'penalty payment and ' : ''}checkout...
          </Text>
        )}
      </View>
    );
  }

  if (showSuccess) {
    return (
      <View style={[styles.container, {
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }]}>
        <LottieView
          source={require('../assets/success_checkout.json')}
          autoPlay
          loop={false}
          style={{width: 250, height: 250}}
        />
        <Text style={[styles.successText, {color: theme.colors.text}]}>
          Successfully checked out
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.scrollContainer}>
      {bookedPG ? (
        <View style={styles.bookedContainer}>
          <View style={[styles.bookedCard, {backgroundColor: theme.colors.card}]}>
            <Image
              source={typeof bookedPG.image === 'string' ? {uri: bookedPG.image} : bookedPG.image}
              style={styles.bookedImage}
            />

            <View style={styles.bookedInfo}>
              <Text style={[styles.bookedName, {color: theme.colors.text}]}>
                {bookedPG.name}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={theme.colors.text}
                  style={{opacity: 0.7}}
                />
                <Text style={[styles.bookedLocation, {color: theme.colors.text}]}>
                  {bookedPG.location}
                </Text>
              </View>

              <Text style={[styles.bookedPrice, {color: '#4CAF50'}]}>
                ₹{bookedPG.rent}/month
              </Text>

              <View style={styles.bookingStatus}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={[styles.statusText, {color: theme.colors.text}]}>
                  Booked on {formatDate(new Date(bookedPG.bookingTime || new Date()))}
                </Text>
              </View>

              

              {nextDueDate && (
                <View style={styles.dueDateContainer}>
                  <Text style={[styles.dueDateLabel, {color: '#333'}]}>
                    Next Payment Due:
                  </Text>
                  <Text style={[styles.dueDate, {color: '#333'}]}>
                    {formatDate(nextDueDate)}
                  </Text>

                  {timeLeft > 0 && timeLeft <= 3 * 24 * 60 * 60 * 1000 && (
                    <View style={styles.timerContainer}>
                      <MaterialIcons name="timer" size={16} color="#FF6B6B" />
                      <Text style={[styles.timerText, {color: '#FF6B6B'}]}>
                        {`Days remaining: ${formatDaysLeft(timeLeft)}`}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {hasPenalty && (
                <View style={styles.penaltyContainer}>
                  <MaterialIcons name="warning" size={16} color="#FF9800" />
                  <Text style={[styles.penaltyText, {color: '#FF9800', marginLeft: 6}]}>
                    Late Payment Penalty: ₹100
                  </Text>
                </View>
              )}

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    hasPenalty
                      ? styles.penaltyButton
                      : isPaymentDueSoon() || hasPenalty
                      ? styles.payNowButton
                      : styles.disabledButton,
                  ]}
                  onPress={isPaymentDueSoon() || hasPenalty ? handlePayNow : null}
                  disabled={!(isPaymentDueSoon() || hasPenalty)}>
                  <Text style={styles.buttonText}>
                    {hasPenalty ? 'Pay Penalty' : 'Pay Now'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton, 
                    styles.checkoutButton,
                    !canCheckout && !hasPenalty && styles.disabledButton
                  ]}
                  onPress={handleCheckout}
                  disabled={!canCheckout && !hasPenalty}>
                  <Text style={styles.buttonText}>
                    {canCheckout ? 'Checkout' : 'Checkout'}
                  </Text>
                </TouchableOpacity>
              </View>
              {checkoutWindowEnd && (
                <View style={styles.checkoutInfoContainer}>
                  {canCheckout ? (
                    <>
                      <View style={styles.timerContainer}>
                        <MaterialIcons name="timer" size={16} color="#4CAF50" />
                        <Text style={[styles.timerText, {color: '#4CAF50'}]}>
                          {`Checkout window ends in: ${formatDaysLeft(checkoutWindowEnd - new Date())}`}
                        </Text>
                      </View>
                      <Text style={[styles.refundText, {color: theme.colors.text}]}>
                        You can checkout within 3 days - 10% of ₹{bookedPG.rent} will be deducted
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.refundText, {color: '#FF6B6B'}]}>
                      Checkout window has expired. Pay rent to checkout.
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="emoticon-sad-outline"
            size={80}
            color={theme.colors.text}
            style={{opacity: 0.5}}
          />
          <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
            No PG Booked Yet
          </Text>
          <Text style={[styles.emptySubtitle, {color: theme.colors.text}]}>
            You haven't added any PG yet
          </Text>
          <TouchableOpacity
            style={[styles.addButton, {backgroundColor: theme.colors.card}]}
            onPress={() => navigation.navigate('Home')}>
            <Ionicons name="add" size={24} color="#4CAF50" />
            <Text style={styles.addButtonText}>Book Your PG</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  successText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bookedContainer: {
    marginBottom: 24,
  },
  bookedCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bookedImage: {
    width: '100%',
    height: 200,
  },
  bookedInfo: {
    padding: 16,
  },
  bookedName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookedLocation: {
    fontSize: 14,
    opacity: 0.8,
    marginLeft: 4,
  },
  bookedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
  },
  dueDateContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  dueDateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dueDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timerText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  penaltyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  penaltyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  penaltyButton: {
    backgroundColor: '#FF9800',
    marginRight: 8,
  },
  checkoutButton: {
    backgroundColor: '#F44336',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 110,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  pgCard: {
    width: 200,
    borderRadius: 12,
    marginRight: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pgImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pgInfo: {
    padding: 12,
  },
  pgName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pgLocation: {
    fontSize: 12,
    opacity: 0.7,
  },
  pgPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  paymentAnimation: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  paymentStatusText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  tryAgainButton: {
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignSelf: 'center',
  },
  tryAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  checkoutInfoContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  refundText: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default MyPG;