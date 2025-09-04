import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  Platform,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {ThemeContext} from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

import LottieView from 'lottie-react-native';

const OnboardingScreen = ({onComplete}) => {
  const theme = useContext(ThemeContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Saving your preferences...');
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [answers, setAnswers] = useState({
    budget: '',
    acRequired: '',
    location: '',
    foodPreference: '',
    LaundryPreference: '',
    gender: '',
    profession:''
  });

  const questions = [
    {
      question: 'Your monthly budget',
      options: ['5,000-7,000', '7,000-10,000', '10,000-15,000', '15,000 +'],
      key: 'budget',
      image: require('../assets/budget.png'),
    },
    {
      question: 'Describe your gender',
      options: [
        { label: 'Male', image: require('../assets/boy.png') },
        { label: 'Female', image: require('../assets/girl.png') }
      ],
      key: 'gender',
    },
    {
      question: 'Student or Employee?',
      options: [
        { label: 'Student', image: require('../assets/student.png') },
        { label: 'Employee', image: require('../assets/working.png') }
      ],
      key: 'profession',
    },
    {
      question: 'Need AC room?',
      options: ['Yes', 'No'],
      key: 'acRequired',
      image: require('../assets/ac.png'),
    },
    {
      question: 'City looking for...',
      key: 'location',
      hasInput: true,
      inputPlaceholder: 'Enter city name...',
      image: require('../assets/location.png'),
    },
    {
      question: 'Included Food?',
      options: ['Yes', 'No'],
      key: 'foodPreference',
      image: require('../assets/food.png'),
    },
    {
      question: 'Laundry preference?',
      options: ['Yes', 'No'],
      key: 'LaundryPreference',
      image: require('../assets/laundry.png'),
    },
  ];

  
  const handleSkip = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitAnswers();
    }
  };

  const handleOptionSelect = option => {
    const newAnswers = {
      ...answers,
      [questions[currentStep].key]: option,
    };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        submitAnswers();
      }
    }, 300);
  };

  const handleInputChange = text => {
    setAnswers({
      ...answers,
      location: text,
    });
  };

  const handleLocationSubmit = () => {
    if (answers.location.trim()) {
      Keyboard.dismiss();
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          submitAnswers();
        }
      }, 300);
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setAnswers({
        ...answers,
        location: currentLocation,
      });
    }
  };

  const submitAnswers = () => {
    setLoading(true);
    setLoadingText('Saving your preferences...');
    
    // After 1.5 seconds, change the text
    setTimeout(() => {
      setLoadingText('Finding the best PGs for you...');
    }, 1500);
    
    setTimeout(() => {
      setLoading(false);
      onComplete(answers);
    }, 6000);
  };

  const currentQuestion = questions[currentStep];
  const isLocationStep = currentQuestion.key === 'location';
  const isSubmitDisabled = isLocationStep && !answers.location.trim();

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <LottieView
          source={require('../assets/finding.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>
          {loadingText}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      keyboardVerticalOffset={80}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text
              style={[styles.skipText, {color: theme.colors.textSecondary}]}>
              {currentStep < questions.length - 1 ? 'Skip' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.questionContainer}>
        {currentQuestion.image && (
          <Image 
            source={currentQuestion.image} 
            style={styles.questionImage}
            resizeMode="contain"
          />
        )}
          <Text style={[styles.questionText, {color: theme.colors.text}]}>
            {currentQuestion.question}
            {currentQuestion.optional && (
              <Text
                style={[
                  styles.optionalText,
                  {color: theme.colors.textSecondary},
                ]}>
                {''}
              </Text>
            )}
          </Text>

          {isLocationStep ? (
            <View style={styles.locationStepContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder={currentQuestion.inputPlaceholder}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={answers.location}
                  onChangeText={handleInputChange}
                  returnKeyType="done"
                  onSubmitEditing={handleLocationSubmit}
                />
                <TouchableOpacity
                  style={[
                    styles.inputSubmit,
                    {
                      backgroundColor: isSubmitDisabled
                        ? theme.colors.disabled
                        : theme.colors.primary,
                    },
                  ]}
                  onPress={handleLocationSubmit}
                  disabled={isSubmitDisabled}>
                  <Icon name="arrow-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {locationPermissionGranted && (
                <TouchableOpacity
                  style={[
                    styles.locationButton,
                    {
                      backgroundColor: currentLocation
                        ? theme.colors.primary
                        : theme.colors.disabled,
                    },
                  ]}
                  onPress={useCurrentLocation}
                  disabled={!currentLocation}>
                  <Icon name="locate" size={20} color="#fff" />
                  <Text style={styles.locationButtonText}>
                    {currentLocation
                      ? 'Use Current Location'
                      : 'Getting Location...'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : currentQuestion.key === 'gender' || currentQuestion.key === 'profession' ? (
            <View style={styles.genderOptionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.genderOption,
                    {
                      backgroundColor:
                        answers[currentQuestion.key] === option.label
                          ? theme.colors.primary
                          : theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleOptionSelect(option.label)}>
                  <Image 
                    source={option.image} 
                    style={styles.genderImage}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      {
                        color:
                          answers[currentQuestion.key] === option.label
                            ? '#fff'
                            : theme.colors.text,
                      },
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        answers[currentQuestion.key] === option
                          ? theme.colors.primary
                          : theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleOptionSelect(option)}>
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          answers[currentQuestion.key] === option
                            ? '#fff'
                            : theme.colors.text,
                      },
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionalText: {
    fontSize: 16,
    fontWeight: '400',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 60,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  inputSubmit: {
    height: 56,
    width: 56,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  locationButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  questionImage: {
    width: 600,
    height: 200,
    alignSelf: 'center',
  },
  genderOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 24,
  },
  genderOption: {
    width: 140,
    height: 160,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  genderImage: {
    width: 70,
    height: 100,
    marginBottom: 12,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;