import React, {useContext, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ThemeContext} from '../context/ThemeContext';
import {pgData} from '../data/pgData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesScreen = ({navigation}) => {
  const theme = useContext(ThemeContext);
  const [favorites, setFavorites] = useState([]);
  const [favoritePGs, setFavoritePGs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavorites(parsedFavorites);
        setFavoritePGs(pgData.filter(pg => parsedFavorites.includes(pg.id)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [loadFavorites, navigation]);

  const removeFavorite = async (pgId) => {
    try {
      const newFavorites = favorites.filter(id => id !== pgId);
      setFavorites(newFavorites);
      setFavoritePGs(prev => prev.filter(pg => pg.id !== pgId));
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove favorite');
      // Revert UI state if operation fails
      setFavoritePGs(pgData.filter(pg => favorites.includes(pg.id)));
    }
  };

  const handlePGPress = useCallback((item) => {
    navigation.navigate('PGDetail', { pgItem: item });
  }, [navigation]);

  const renderItem = useCallback(({item}) => (
    <TouchableOpacity
      style={[styles.pgCard, {backgroundColor: theme.colors.card}]}
      onPress={() => handlePGPress(item)}>
      <Image source={item.image} style={styles.pgImage} />
      <View style={styles.pgInfoContainer}>
        <View style={styles.pgHeader}>
          <Text 
            style={[styles.pgName, {color: theme.colors.text}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              removeFavorite(item.id);
            }}
            style={styles.favoriteButton}
            activeOpacity={0.7}>
            <MaterialIcons name="favorite" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <View style={styles.locationContainer}>
          <MaterialIcons 
            name="location-on" 
            size={16} 
            color="#FF6B6B" 
          />
          <Text 
            style={[styles.pgLocation, {color: theme.colors.textSecondary}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.location}
          </Text>
        </View>
        <Text style={[styles.pgPrice, {color: '#4CAF50'}]}>
          ₹{item.rent}/month
        </Text>
      </View>
    </TouchableOpacity>
  ), [handlePGPress, theme]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, {backgroundColor: theme.colors.background}]}>
        <Text style={{color: theme.colors.text}}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {favoritePGs.length > 0 ? (
        <FlatList
          data={favoritePGs}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="favorite-border" 
            size={60} 
            color={theme.colors.textSecondary} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyText, {color: theme.colors.text}]}>
            No favorite PGs yet
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  pgCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pgImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  pgInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  pgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pgName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pgLocation: {
    fontSize: 14,
    flex: 1,
    marginLeft: 4,
  },
  pgPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
});

export default FavoritesScreen;