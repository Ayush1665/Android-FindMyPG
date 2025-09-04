import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import {ThemeContext} from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const {width, height} = Dimensions.get('window');

const PremiumScreen = ({navigation}) => {
  const theme = useContext(ThemeContext);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [userPhone, setUserPhone] = useState('9876543210');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load current subscription and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        const subscription = await AsyncStorage.getItem('currentSubscription');
        if (subscription) {
          setCurrentSubscription(JSON.parse(subscription));
        }

        const email = await AsyncStorage.getItem('userEmail');
        const phone = await AsyncStorage.getItem('userPhone');
        if (email) setUserEmail(email);
        if (phone) setUserPhone(phone);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Gold color palette
  const goldColors = {
    primary: '#FFD700',
    dark: '#D4AF37',
    light: '#FFECB3',
    accent: '#F9A825',
  };

  const premiumPlans = [
    {
      id: 'monthly',
      title: 'Monthly Plan',
      price: '₹199/month',
      amount: 19900,
      features: [
        'Unlimited PG listings',
        'Priority customer support',
        'Advanced filters',
        'No ads',
      ],
      popular: false,
      icon: 'calendar-month',
    },
    {
      id: 'yearly',
      title: 'Yearly Plan',
      price: '₹1999/year',
      amount: 199900,
      savings: 'Save 15%',
      features: [
        'All monthly features',
        'Early access to new features',
        'Exclusive yearly bonuses',
      ],
      popular: true,
      icon: 'calendar-today',
    },
    {
      id: 'lifetime',
      title: 'Lifetime Access',
      price: '₹3999 once',
      amount: 399900,
      features: [
        'All premium features forever',
        'Free lifetime updates',
        'VIP support priority',
      ],
      popular: false,
      icon: 'all-inclusive',
    },
  ];

  const calculateExpiryDate = (planId) => {
    const now = new Date();
    switch(planId) {
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        now.setFullYear(now.getFullYear() + 1);
        break;
      case 'lifetime':
        now.setFullYear(now.getFullYear() + 100);
        break;
      default:
        now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
  };

  const handleSubscribe = async (planId) => {
    if (currentSubscription) {
      Alert.alert(
        'Already Subscribed',
        `You already have an active ${currentSubscription.title} subscription.`,
        [{text: 'OK'}]
      );
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(planId);

    try {
      const selectedPlanData = premiumPlans.find(p => p.id === planId);
      
      const options = {
        description: selectedPlanData.title,
        image: 'https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-6018-61f7-900f-d92c2e1ad463/raw?se=2025-05-15T19%3A30%3A26Z&sp=r&sv=2024-08-04&sr=b&scid=00000000-0000-0000-0000-000000000000&skoid=add8ee7d-5fc7-451e-b06e-a82b2276cf62&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-15T13%3A24%3A05Z&ske=2025-05-16T13%3A24%3A05Z&sks=b&skv=2024-08-04&sig=3C6V8w1mMa1baUcQQ/dHtESl/rKy6drmsu7QBWnNrmg%3D',
        currency: 'INR',
        key: 'rzp_test_tANvftiC8cm9ph',
        amount: selectedPlanData.amount.toString(),
        name: 'Find My PG',
        order_id: '',
        prefill: {
          email: userEmail,
          contact: userPhone,
          name: 'PG User',
        },
        theme: {color: goldColors.primary},
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          setPaymentStatus('success');
          setShowPaymentModal(true);
          
          setTimeout(async () => {
            const subscriptionData = {
              planId,
              title: selectedPlanData.title,
              price: selectedPlanData.price,
              subscribedOn: new Date().toISOString(),
              expiresOn: calculateExpiryDate(planId),
              receipt: data.razorpay_payment_id,
            };

            await AsyncStorage.setItem(
              'currentSubscription',
              JSON.stringify(subscriptionData)
            );
            setCurrentSubscription(subscriptionData);
            setShowPaymentModal(false);
          }, 3000);
        })
        .catch((error) => {
          setPaymentStatus('failed');
          setShowPaymentModal(true);
        })
        .finally(() => {
          setIsProcessing(false);
        });
    } catch (error) {
      console.error('Subscription error:', error);
      setIsProcessing(false);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{text: 'OK'}]
      );
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            setIsCancelling(true);
            
            // Simulate cancellation process (3 seconds)
            setTimeout(async () => {
              try {
                await AsyncStorage.removeItem('currentSubscription');
                setCurrentSubscription(null);
                setIsCancelling(false);
                Alert.alert(
                  'Subscription Cancelled',
                  'Your subscription has been cancelled successfully.',
                  [{text: 'OK'}]
                );
              } catch (error) {
                console.error('Error cancelling subscription:', error);
                setIsCancelling(false);
                Alert.alert(
                  'Error',
                  'Failed to cancel subscription. Please try again.',
                  [{text: 'OK'}]
                );
              }
            }, 3000);
          },
        },
      ]
    );
  };
  

  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan === plan.id;
    const isCurrentPlan = currentSubscription?.planId === plan.id;

    return (
      <TouchableOpacity
        key={plan.id}
        activeOpacity={0.9}
        onPress={() => !isProcessing && setSelectedPlan(plan.id)}
        disabled={isCurrentPlan || isProcessing}>
        <LinearGradient
          colors={
            isCurrentPlan
              ? ['#4CAF50', '#81C784']
              : isSelected
              ? [goldColors.dark, goldColors.primary]
              : [theme.colors.card, theme.colors.card]
          }
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            styles.planCard,
            {
              borderWidth: isSelected || isCurrentPlan ? 0 : 1,
              borderColor: theme.colors.border,
              shadowColor: isSelected
                ? goldColors.primary
                : isCurrentPlan
                ? '#4CAF50'
                : theme.colors.border,
              opacity: isProcessing && !isSelected ? 0.7 : 1,
            },
          ]}>
          {isCurrentPlan && (
            <View style={[styles.popularBadge, {backgroundColor: '#4CAF50'}]}>
              <Text style={styles.popularBadgeText}>CURRENT PLAN</Text>
            </View>
          )}

          {plan.popular && !isCurrentPlan && (
            <View style={[styles.popularBadge, {backgroundColor: goldColors.accent}]}>
              <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
            </View>
          )}

          <View style={styles.planHeader}>
            <Icon
              name={plan.icon}
              size={32}
              color={
                isCurrentPlan
                  ? 'white'
                  : isSelected
                  ? 'white'
                  : goldColors.primary
              }
            />
            {plan.savings && !isCurrentPlan && (
              <View style={[styles.savingsBadge, {backgroundColor: theme.colors.background}]}>
                <Text style={[styles.savingsText, {color: goldColors.dark}]}>
                  {plan.savings}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.planTitle, {color: isCurrentPlan || isSelected ? 'white' : theme.colors.text}]}>
            {plan.title}
          </Text>

          <Text style={[styles.planPrice, {color: isCurrentPlan ? 'white' : isSelected ? 'white' : goldColors.primary}]}>
            {plan.price}
          </Text>

          <View style={styles.featuresContainer}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon
                  name="check-circle"
                  size={18}
                  color={isCurrentPlan ? 'white' : isSelected ? 'white' : goldColors.primary}
                />
                <Text style={[styles.featureText, {color: isCurrentPlan || isSelected ? 'white' : theme.colors.text}]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {isCurrentPlan ? (
            <View style={styles.currentPlanActions}>
              <View style={[styles.subscribeButton, {backgroundColor: 'white', opacity: 0.9, marginBottom: 10}]}>
                <Text style={[styles.subscribeButtonText, {color: '#4CAF50'}]}>
                  Active Until {new Date(currentSubscription.expiresOn).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.cancelButton, {borderColor: '#FF6B6B'}]}
                onPress={handleCancelSubscription}>
                <Text style={[styles.cancelButtonText, {color: '#FF6B6B'}]}>
                  Cancel Subscription
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                {
                  backgroundColor: isSelected ? 'white' : goldColors.primary,
                  opacity: isProcessing && !isSelected ? 0.6 : 1,
                },
              ]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={isProcessing}>
              {isProcessing && isSelected ? (
                <ActivityIndicator color={goldColors.dark} />
              ) : (
                <Text style={[styles.subscribeButtonText, {color: isSelected ? goldColors.dark : 'white'}]}>
                  Subscribe Now
                </Text>
              )}
            </TouchableOpacity>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}
        contentContainerStyle={styles.scrollContent}>
        {/* Premium Header */}
        <LinearGradient
          colors={[goldColors.dark, goldColors.primary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.premiumHeader}>
          <Icon
            name="workspace-premium"
            size={48}
            color="white"
            style={styles.premiumIcon}
          />
          <Text style={styles.headerTitle}>Premium Plan</Text>
          <Text style={[styles.headerSubtitle, {fontSize:14, color:'white'}]}>
            Unlock exclusive features and benefits
          </Text>
        </LinearGradient>

        {/* Current Subscription Banner */}
        {currentSubscription && (
          <View style={[styles.currentSubscriptionBanner, {backgroundColor: '#E8F5E9'}]}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <Text style={[styles.currentSubscriptionText, {color: '#2E7D32'}]}>
              You're currently subscribed to {currentSubscription.title} (expires {new Date(currentSubscription.expiresOn).toLocaleDateString()})
            </Text>
          </View>
        )}

        {/* Benefits Section */}
        <View style={[styles.sectionContainer, {backgroundColor: theme.colors.card}]}>
          <View style={styles.sectionHeader}>
            <Icon name="stars" size={24} color={goldColors.primary} />
            <Text style={[styles.sectionTitle, {color: theme.colors.text, marginLeft: 10}]}>
              Premium Benefits
            </Text>
          </View>

          {[
            {icon: 'home', text: 'Unlimited PG listings with detailed information'},
            {icon: 'filter-alt', text: 'Advanced filters for precise searching'},
            {icon: 'support-agent', text: 'Priority customer support'},
            {icon: 'flash-on', text: 'Exclusive early access to new features'},
            {icon: 'verified-user', text: 'Verified PG listings only'},
          ].map((item, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={[styles.benefitIconContainer, {backgroundColor: goldColors.light}]}>
                <Icon name={item.icon} size={20} color={goldColors.dark} />
              </View>
              <Text style={[styles.benefitText, {color: theme.colors.text}]}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Plans Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Icon name="payment" size={24} color={goldColors.primary} />
            <Text style={[styles.sectionTitle, {color: theme.colors.text, marginLeft: 10}]}>
              Choose Your Plan
            </Text>
          </View>

          <View style={styles.plansContainer}>
            {premiumPlans.map(renderPlanCard)}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={[styles.sectionContainer, {backgroundColor: theme.colors.card}]}>
          <View style={styles.sectionHeader}>
            <Icon name="help-outline" size={24} color={goldColors.primary} />
            <Text style={[styles.sectionTitle, {color: theme.colors.text, marginLeft: 10}]}>
              Frequently Asked Questions
            </Text>
          </View>

          {[
            {
              icon: 'receipt',
              question: 'How does billing work?',
              answer: 'Your subscription will automatically renew unless canceled at least 24 hours before the end of the current period.',
            },
            {
              icon: 'cancel',
              question: 'Can I cancel anytime?',
              answer: 'Yes, you can cancel your subscription anytime.',
            },
            {
              icon: 'free-breakfast',
              question: 'Is there a free trial?',
              answer: 'We occasionally offer free trials. Check our promotions page for current offers.',
            },
            {
              icon: 'security',
              question: 'Is my payment secure?',
              answer: 'All payments are processed through secure, encrypted channels.',
            },
          ].map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqQuestionContainer}>
                <View style={[styles.faqIconContainer, {backgroundColor: goldColors.light}]}>
                  <Icon name={item.icon} size={16} color={goldColors.dark} />
                </View>
                <Text style={[styles.faqQuestion, {color: theme.colors.text}]}>
                  {item.question}
                </Text>
              </View>
              <Text style={[styles.faqAnswer, {color: '#888'}]}>
                {item.answer}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Icon name="security" size={18} color={goldColors.dark} />
          <Text style={[styles.footerText, {color: theme.colors.secondaryText || '#888'}]}>
            Secure payment processing. By subscribing, you agree to our{' '}
            <Text style={{textDecorationLine: 'underline', fontWeight: '500'}}>
              Terms
            </Text>{' '}
            and{' '}
            <Text style={{textDecorationLine: 'underline', fontWeight: '500'}}>
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </ScrollView>

      {/* Payment Status Modal */}

      <Modal
  visible={isCancelling}
  transparent={true}
  animationType="fade"
  onRequestClose={() => {}}>
  <View style={styles.cancellingModalContainer}>
    <View style={styles.cancellingModalContent}>
      <ActivityIndicator size="large" color={goldColors.primary} />
      <Text style={styles.cancellingModalText}>Cancelling Subscription...</Text>
    </View>
  </View>
</Modal>

      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
        onShow={() => {
          // Auto-close after 3 seconds if not already closed
          setTimeout(() => {
            if (showPaymentModal) {
              setShowPaymentModal(false);
            }
          }, 2000);
        }}
        >
        <View style={styles.paymentModalContainer}>
          <View style={styles.paymentModalContent}>
            {paymentStatus === 'success' ? (
              <>
                <LottieView
                  source={require('../assets/premium_success.json')}
                  autoPlay
                  loop={false}
                  style={styles.lottieAnimation}
                />
                <Text style={styles.paymentModalText}>Subscription Confirmed!</Text>
              </>
            ) : (
              <>
                <LottieView
                  source={require('../assets/premium_failed.json')}
                  autoPlay
                  loop={false}
                  style={styles.lottieAnimation}
                />
                <Text style={styles.paymentModalText}>Payment Failed</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  premiumHeader: {
    padding: 30,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  premiumIcon: {
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    maxWidth: '80%',
    opacity: 0.9,
  },
  currentSubscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  currentSubscriptionText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  sectionContainer: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    flex: 1,
  },
  plansContainer: {
    marginBottom: 10,
  },
  planCard: {
    borderRadius: 16,
    padding: 25,
    marginBottom: 15,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  savingsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
  },
  currentPlanActions: {
    marginTop: 10,
  },
  subscribeButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  faqIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 38,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  footerText: {
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
  },
  paymentModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  paymentModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.8,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  paymentModalText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  cancellingModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cancellingModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.8,
  },
  cancellingModalText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default PremiumScreen;