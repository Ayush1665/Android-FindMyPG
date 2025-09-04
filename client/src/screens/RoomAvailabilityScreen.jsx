import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ThemeContext} from '../context/ThemeContext';

const RoomAvailabilityScreen = ({route, navigation}) => {
  const {pgItem} = route.params;
  const theme = useContext(ThemeContext);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Enhanced room data with more realistic occupant information
  const [rooms, setRooms] = useState([
    {
      id: '1',
      number: '101',
      available: true,
      price: pgItem.rent,
    },
    {
      id: '2',
      number: '102',
      available: false,
      price: pgItem.rent,
      occupant: {
        name: 'Rahul Sharma',
        from: 'Mumbai, Maharashtra',
        since: 'March 2023',
        image: require('../assets/profile1.jpg'),
      }
    },
    {
      id: '3',
      number: '201',
      available: false,
      price: pgItem.rent,
      occupant: {
        name: 'Priya Patel',
        from: 'Ahmedabad, Gujarat',
        since: 'January 2024',
        image: require('../assets/profile2.jpg'),
      }
    },
    {
      id: '4',
      number: '202',
      available: true,
      price: pgItem.rent,
    },
    {
      id: '5',
      number: '301',
      available: true,
      price: pgItem.rent,
    },
    {
      id: '6',
      number: '302',
      available: false,
      price: pgItem.rent,
      occupant: {
        name: 'Arjun Singh',
        from: 'Delhi',
        since: 'November 2023',
        image: require('../assets/profile3.jpg'),
      }
    },
  ]);

  // Separate available and occupied rooms
  const availableRooms = rooms.filter(room => room.available);
  const occupiedRooms = rooms.filter(room => !room.available);

  const renderRoomItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.roomCard,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: item.available ? '#4CAF50' : '#FF6B6B',
        },
      ]}
      onPress={() => setSelectedRoom(item)}>
      <View style={styles.roomHeader}>
        <Text style={[styles.roomNumber, {color: theme.colors.text}]}>
          Room {item.number}
        </Text>
        <View
          style={[
            styles.roomStatus,
            {backgroundColor: item.available ? '#4CAF50' : '#FF6B6B'},
          ]}>
          <Text style={styles.roomStatusText}>
            {item.available ? 'Available' : 'Occupied'}
          </Text>
        </View>
      </View>
      <Text style={[styles.roomPrice, {color: theme.colors.text}]}>
        ₹{item.price}/month
      </Text>
      
      {!item.available && item.occupant && (
        <View style={styles.occupantPreview}>
          <Image source={item.occupant.image} style={styles.previewImage} />
          <Text style={[styles.occupantName, {color: theme.colors.text}]}>
            {item.occupant.name.split(' ')[0]} • {item.occupant.from.split(',')[0]}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {pgItem.name} - Room Status
          </Text>
        </View>

        {/* Available Rooms Section */}
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Available Rooms ({availableRooms.length})
        </Text>
        {availableRooms.length > 0 ? (
          <FlatList
            data={availableRooms}
            renderItem={renderRoomItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.roomList}
          />
        ) : (
          <Text style={[styles.noRoomsText, {color: theme.colors.text}]}>
            No rooms currently available
          </Text>
        )}

        {/* Occupied Rooms Section */}
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          Occupied Rooms ({occupiedRooms.length})
        </Text>
        {occupiedRooms.length > 0 ? (
          <FlatList
            data={occupiedRooms}
            renderItem={renderRoomItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.roomList}
          />
        ) : (
          <Text style={[styles.noRoomsText, {color: theme.colors.text}]}>
            All rooms are currently available
          </Text>
        )}

        {/* Selected Room Details */}
        {selectedRoom && (
          <View style={[
            styles.detailsContainer,
            {backgroundColor: theme.colors.cardBackground}
          ]}>
            <Text style={[styles.detailsTitle, {color: theme.colors.text}]}>
              Room {selectedRoom.number} Details
            </Text>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, {color: theme.colors.text}]}>
                Status:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {color: selectedRoom.available ? '#4CAF50' : '#FF6B6B'},
                ]}>
                {selectedRoom.available ? 'Available' : 'Occupied'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, {color: theme.colors.text}]}>
                Rent:
              </Text>
              <Text style={[styles.detailValue, {color: theme.colors.text}]}>
                ₹{selectedRoom.price}/month
              </Text>
            </View>

            {!selectedRoom.available && selectedRoom.occupant && (
              <>
                <Text style={[styles.occupantTitle, {color: theme.colors.text}]}>
                  Current Occupant
                </Text>
                <View style={styles.occupantCard}>
                  <Image 
                    source={selectedRoom.occupant.image} 
                    style={styles.occupantImage} 
                  />
                  <View style={styles.occupantInfo}>
                    <Text style={[styles.occupantName, {color: theme.colors.text}]}>
                      {selectedRoom.occupant.name}
                    </Text>
                    <View style={styles.occupantDetail}>
                      <MaterialIcons name="location-on" size={16} color="#FF6B6B" />
                      <Text style={[styles.occupantText, {color: theme.colors.text}]}>
                        From {selectedRoom.occupant.from}
                      </Text>
                    </View>
                    <View style={styles.occupantDetail}>
                      <MaterialIcons name="calendar-today" size={16} color="#FF6B6B" />
                      <Text style={[styles.occupantText, {color: theme.colors.text}]}>
                        Staying since {selectedRoom.occupant.since}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {selectedRoom.available && (
              <TouchableOpacity
                style={[styles.bookButton, {backgroundColor: theme.colors.primary}]}
                onPress={() => navigation.navigate('PGDetail', {pgItem})}>
                <Text style={styles.bookButtonText}>Book This Room</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  noRoomsText: {
    textAlign: 'center',
    marginVertical: 15,
    fontStyle: 'italic',
  },
  roomList: {
    paddingBottom: 10,
  },
  roomCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomNumber: {
    fontSize: 17,
    fontWeight: '600',
  },
  roomStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  occupantPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  previewImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  occupantName: {
    fontSize: 14,
  },
  detailsContainer: {
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  detailsTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    width: 80,
    fontWeight: '600',
    fontSize: 15,
  },
  detailValue: {
    flex: 1,
    fontSize: 15,
  },
  occupantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  occupantCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  occupantImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  occupantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  occupantName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  occupantDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  occupantText: {
    marginLeft: 5,
    fontSize: 14,
  },
  bookButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoomAvailabilityScreen;