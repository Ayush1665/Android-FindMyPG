import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {ThemeContext} from '../context/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {pgData} from '../data/pgData';

const Search = ({navigation}) => {
  const theme = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const popularLocations = ['Mumbai', 'Bangalore', 'Gurugram', 'Pune'];

  const handleSearch = text => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = pgData.filter(
        pg =>
          pg.name.toLowerCase().includes(text.toLowerCase()) ||
          (pg.location &&
            pg.location.toLowerCase().includes(text.toLowerCase())),
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[styles.pgCard, {backgroundColor: theme.colors.card}]}
      onPress={() => navigation.navigate('PGDetail', {pgItem: item})}>
      <Image source={item.image} style={styles.pgImage} />
      <Text style={[styles.pgName, {color: theme.colors.text}]}>
        {item.name}
      </Text>
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={14} color="#6B7280" />
        <Text style={[styles.pgLocation, {color: '#6B7280'}]}>
          {item.location}
        </Text>
      </View>
      <Text style={styles.pgRent}>₹{item.rent}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View
        style={[styles.searchContainer, {backgroundColor: theme.colors.card}]}>
        <MaterialIcons
          name="search"
          size={24}
          color={theme.colors.text}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, {color: theme.colors.text}]}
          placeholder="Search by PG name or location..."
          placeholderTextColor={theme.isDarkMode ? '#aaa' : '#888'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}>
            <MaterialIcons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length === 0 ? (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Popular Locations
          </Text>
          <View style={styles.locationsContainer}>
            {popularLocations.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationTag,
                  {backgroundColor: theme.colors.card},
                ]}
                onPress={() => {
                  setSearchQuery(location);
                  handleSearch(location);
                }}>
                <Text style={[styles.locationText, {color: theme.colors.text}]}>
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.resultsContainer}
        />
      ) : (
        <View style={styles.noResults}>
          <MaterialIcons
            name="search-off"
            size={50}
            color={theme.colors.text}
          />
          <Text style={[styles.noResultsText, {color: theme.colors.text}]}>
            No PGs found matching "{searchQuery}"
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pgImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  pgInfo: {
    paddingHorizontal: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  locationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  locationTag: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  pgCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  pgName: {
    fontSize: 16,
    fontWeight: '600',
  },
  pgLocation: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 5,
  },
  pgRent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 8,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noResultsText: {
    fontSize: 18,
    marginTop: 15,
  },
});

export default Search;
