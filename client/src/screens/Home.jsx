import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ThemeContext} from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {pgData} from '../data/pgData';
import Sound from 'react-native-sound';

const Home = ({navigation, route}) => {
  const theme = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceSort, setPriceSort] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [clickSound, setClickSound] = useState(null);
  const [notifiedItems, setNotifiedItems] = useState([]);
  const [bellSound, setBellSound] = useState(null);

  useEffect(() => {
    // Load the bell sound
    const sound = new Sound('bell.wav', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Failed to load bell sound', error);
        return;
      }
      setBellSound(sound);
    });
  
    // Cleanup on unmount
    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, []);

  const onboardingAnswers = route.params?.onboardingAnswers || {};

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Save favorites to storage whenever they change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    };
    saveFavorites();
  }, [favorites]);

  useEffect(() => {
    // Enable playback in silence mode (iOS)
    Sound.setCategory('Playback');

    // Load the sound
    const sound = new Sound('click.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      setClickSound(sound);
    });

    // Cleanup on unmount
    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, []);

  const toggleFavorite = pgId => {
    setFavorites(prev =>
      prev.includes(pgId) ? prev.filter(id => id !== pgId) : [...prev, pgId],
    );
  };

  const allAmenities = ['AC', 'WiFi', 'Laundry', 'Food', 'Light Backup', 'Gym'];

  const toggleAmenity = amenity => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity],
    );
  };

  const clearAllFilters = () => {
    setPriceSort(null);
    setSelectedAmenities([]);
  };
  const filteredData = useMemo(() => {
    let result = [...pgData];
  
    // Apply onboarding filters only if they were explicitly selected (not skipped)
    if (onboardingAnswers.budget) {
      const budgetRanges = {
        '5k-7k': { min: 5000, max: 7000 },
        '7k-10k': { min: 7000, max: 10000 },
        '10k-15k': { min: 10000, max: 15000 },
        '15k+': { min: 15000, max: Infinity }
      };
      
      const range = budgetRanges[onboardingAnswers.budget];
      result = result.filter(item => {
        const price = parseInt(item.rent.replace(/,/g, ''));
        return price >= range.min && price <= range.max;
      });
    }
  
    // Only filter AC if the user explicitly answered "Yes" or "No"
    if (onboardingAnswers.acRequired === 'Yes') {
      result = result.filter(item => item.services.includes('AC'));
    } else if (onboardingAnswers.acRequired === 'No') {
      result = result.filter(item => !item.services.includes('AC'));
    }
  
    // Only filter Food if the user explicitly answered "Yes" or "No"
    if (onboardingAnswers.foodPreference === 'Yes') {
      result = result.filter(item => item.services.includes('Food'));
    } else if (onboardingAnswers.foodPreference === 'No') {
      result = result.filter(item => !item.services.includes('Food'));
    }
  
    // Only filter Laundry if the user explicitly answered "Yes" or "No"
    if (onboardingAnswers.LaundryPreference === 'Yes') {
      result = result.filter(item => item.services.includes('Laundry'));
    } else if (onboardingAnswers.LaundryPreference === 'No') {
      result = result.filter(item => !item.services.includes('Laundry'));
    }
  
    // Apply location filter only if provided
    if (onboardingAnswers.location) {
      const locationQuery = onboardingAnswers.location.toLowerCase();
      result = result.filter(item => 
        item.location.toLowerCase().includes(locationQuery)
      );
    }
  
    // Then apply the user's search and filter selections (from the search bar and filter modal)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query)
      );
    }
  
    if (selectedAmenities.length > 0) {
      result = result.filter(item =>
        selectedAmenities.every(amenity => item.services.includes(amenity))
      );
    }
  
    if (priceSort) {
      result.sort((a, b) => {
        const priceA = parseInt(a.rent.replace(/,/g, ''));
        const priceB = parseInt(b.rent.replace(/,/g, ''));
        return priceSort === 'lowToHigh' ? priceA - priceB : priceB - priceA;
      });
    }
  
    return result;
  }, [searchQuery, priceSort, selectedAmenities, onboardingAnswers]);



  const serviceIcons = {
    AC: 'ac-unit',
    WiFi: 'wifi',
    Laundry: 'local-laundry-service',
    Food: 'restaurant',
    'Light Backup': 'flash-on',
    Gym: 'fitness-center',
    default: 'check-circle',
  };

  const renderServiceIcon = service => (
    <MaterialIcons
      name={serviceIcons[service] || serviceIcons.default}
      size={20}
      color="#4CAF50"
      style={styles.serviceIcon}
    />
  );

  const handleNotificationPress = useCallback((item) => {
    const isNotified = notifiedItems.includes(item.id);
    
    if (!isNotified) {
      // Play bell sound if loaded
      if (bellSound) {
        bellSound.play(success => {
          if (!success) {
            console.log('Bell sound playback failed');
          }
        });
      }
      
      setTimeout(() => {
        Alert.alert('Notifications', 'We will notify you when this PG becomes available.', [
          { text: 'OK', onPress: () => {} },
        ]);
      }, 800); 
      
      setNotifiedItems([...notifiedItems, item.id]);
    } else {
      setNotifiedItems(notifiedItems.filter(id => id !== item.id));
    }
  }, [notifiedItems, bellSound]);
  

  const handleCardPress = useCallback(
    item => {
      // Play click sound if loaded
      if (clickSound) {
        clickSound.play(success => {
          if (!success) {
            console.log('Sound playback failed');
          }
        });
      }

      // Navigate to PG detail
      navigation.navigate('PGDetail', {pgItem: item});
    },
    [clickSound, navigation],
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.pgCard,
        {
          backgroundColor: theme.colors.card,
          opacity: item.isAvailable ? 1 : 0.5,
        },
      ]}
      onPress={() => {
        handleCardPress(item);
        navigation.navigate('PGDetail', {pgItem: item});
      }}
      disabled={!item.isAvailable}>
      {item.isAvailable && (
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={e => {
            e.stopPropagation(); // Prevent card press
            toggleFavorite(item.id);
          }}>
          <MaterialIcons
            name={favorites.includes(item.id) ? 'favorite' : 'favorite-border'}
            size={24}
            color={favorites.includes(item.id) ? '#FF6B6B' : theme.colors.text}
          />
        </TouchableOpacity>
      )}

      {!item.isAvailable && (
        <View style={styles.unavailableOverlay}>
          <TouchableOpacity
  style={styles.notificationIcon}
  onPress={() => handleNotificationPress(item)}>
  <MaterialIcons
    name="notifications"
    size={24}
    color={
      notifiedItems.includes(item.id) ? '#FF6B6B' : theme.colors.text
    }
  />
</TouchableOpacity>

          <Text style={styles.unavailableText}>Room Unavailable</Text>
        </View>
      )}
      <Image
        source={item.image}
        style={[styles.pgImage, !item.isAvailable && styles.pgImage]}
      />
      <View style={styles.pgInfo}>
        <View style={styles.pgHeader}>
          <View style={styles.nameLocationContainer}>
            <Text style={[styles.pgName, {color: theme.colors.text}]}>
              {item.name}
            </Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={14} color="#FF6B6B" />
              <Text style={styles.pgLocation}>{item.location}</Text>
            </View>
          </View>
          <Text style={styles.pgPrice}>₹{item.rent.toLocaleString()}/mon</Text>
        </View>

        <View style={styles.servicesContainer}>
          {item.services.slice(0, 4).map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              {renderServiceIcon(service)}
              <Text style={[styles.serviceText, {color: theme.colors.text}]}>
                {service}
              </Text>
            </View>
          ))}
          {item.services.length > 4 && (
            <Text style={[styles.moreText, {color: theme.colors.text}]}>
              +{item.services.length - 4} more
            </Text>
          )}
        </View>

        {item.noAdvance && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Advance Required</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}>
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, {backgroundColor: theme.colors.card}]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
              Filter Options
            </Text>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={[styles.clearText, {color: 'red'}]}>
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView>
            {/* Price Sorting */}
            <View style={styles.filterSection}>
              <Text
                style={[styles.filterSectionTitle, {color: theme.colors.text}]}>
                Sort by Price
              </Text>
              <TouchableOpacity
                style={[styles.filterOption, priceSort === 'lowToHigh']}
                onPress={() => setPriceSort('lowToHigh')}>
                <MaterialIcons
                  name={
                    priceSort === 'lowToHigh'
                      ? 'radio-button-checked'
                      : 'radio-button-unchecked'
                  }
                  size={20}
                  color={
                    priceSort === 'lowToHigh' ? '#4CAF50' : theme.colors.text
                  }
                />
                <Text
                  style={[styles.filterOptionText, {color: theme.colors.text}]}>
                  Low to High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  priceSort === 'highToLow' && styles.selectedFilterOption,
                ]}
                onPress={() => setPriceSort('highToLow')}>
                <MaterialIcons
                  name={
                    priceSort === 'highToLow'
                      ? 'radio-button-checked'
                      : 'radio-button-unchecked'
                  }
                  size={20}
                  color={
                    priceSort === 'highToLow' ? '#4CAF50' : theme.colors.text
                  }
                />
                <Text
                  style={[styles.filterOptionText, {color: theme.colors.text}]}>
                  High to Low
                </Text>
              </TouchableOpacity>

            </View>

            {/* Amenities Filter */}
            <View style={styles.filterSection}>
              <Text
                style={[styles.filterSectionTitle, {color: theme.colors.text}]}>
                Amenities
              </Text>
              <View style={styles.amenitiesContainer}>
                {allAmenities.map((amenity, index) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityItem,
                      selectedAmenities.includes(amenity) &&
                        styles.selectedAmenityItem,
                      index % 2 === 0 ? {marginRight: 10} : {marginRight: 0},
                      {borderColor: theme.colors.border},
                    ]}
                    onPress={() => toggleAmenity(amenity)}>
                    <MaterialIcons
                      name={
                        selectedAmenities.includes(amenity)
                          ? 'check-box'
                          : 'check-box-outline-blank'
                      }
                      size={20}
                      color={
                        selectedAmenities.includes(amenity)
                          ? theme.colors.text
                          : theme.colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.amenityText,
                        {
                          color: selectedAmenities.includes(amenity)
                            ? theme.colors.text
                            : theme.colors.text,
                        },
                      ]}>
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.applyButton,
              {backgroundColor: theme.colors.primary},
            ]}
            onPress={() => setShowFilters(false)}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderHeader = () => {
    // Get only the preferences that were actually selected (not skipped)
    const selectedPreferences = Object.entries(onboardingAnswers)
      .filter(([_, value]) => value !== undefined && value !== '');
    
    if (selectedPreferences.length === 0) return null;
    
    return (
      <View style={[styles.preferencesHeader, {backgroundColor: theme.colors.card}]}>
        <Text style={[styles.preferencesTitle, {color: theme.colors.text}]}>
          Your Preferences:
        </Text>
        <View style={styles.preferencesContainer}>
          {selectedPreferences.map(([key, value]) => (
            <View key={key} style={styles.preferenceItem}>
              <Text style={[styles.preferenceText, {color: theme.colors.text}]}>
                {key}: {value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };


  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Search Bar */}
      <View
        style={[styles.searchContainer, {backgroundColor: theme.colors.card}]}>
        <MaterialIcons name="search" size={20} color="#6B7280" />
        <TextInput
          style={[styles.searchInput, {color: theme.colors.text}]}
          placeholder="Search by PG name or location..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}>
          <MaterialIcons
            name="filter-list"
            size={24}
            color={
              selectedAmenities.length > 0 || priceSort ? '#4CAF50' : '#6B7280'
            }
          />
          {(selectedAmenities.length > 0 || priceSort) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {selectedAmenities.length + (priceSort ? 1 : 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* PG List */}
      {renderHeader()}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={50} color="#9CA3AF" />
            <Text style={[styles.emptyText, {color: theme.colors.text}]}>
              No PGs found matching your search
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 0,
  },
  filterButton: {
    marginLeft: 10,
    position: 'relative',
  },
  pgCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  pgImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  pgInfo: {
    padding: 16,
  },
  pgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameLocationContainer: {
    flex: 1,
    marginRight: 8,
  },
  pgName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  pgLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  pgPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    alignItems: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  serviceIcon: {
    marginRight: 6,
  },
  serviceText: {
    fontSize: 14,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 2,
    borderRadius: 20,
    padding: 5,
  },
  moreText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF9800',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 2,
    elevation: 3,
  },
  unavailableText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearText: {
    fontSize: 16,
    marginRight: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
  },

  filterOptionText: {
    marginLeft: 10,
    fontSize: 15,
  },
  applyButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5722',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // leaves 4% space between items (2% on each side)
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  selectedAmenityItem: {
    borderColor: '#4CAF50',
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
  },
    notificationIcon: {
      position: 'absolute',
      top: 0,
      right: 295,
      zIndex: 2,
    },
});

export default Home;
