import React, {useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {ThemeProvider, ThemeContext} from './src/context/ThemeContext';
import {Auth0Provider} from 'react-native-auth0';
import AuthWrapper from './src/components/AuthWrapper';

// Import screens
import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import Search from './src/screens/Search';
import MyPG from './src/screens/MyPG';
import ContactSupportScreen from './src/screens/ContactSupportScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsScreen from './src/screens/TermsScreen';
import PGDetailScreen from './src/screens/PGDetailScreen';
import RoomAvailabilityScreen from './src/screens/RoomAvailabilityScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

// Import icons
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab icons configuration
const tabIcons = {
  Home: <AntDesign name="home" size={22} />,
  Search: <Octicons name="search" size={22} />,
  'My PG': <MaterialIcons name="hotel" size={22} />,
  Profile: <Feather name="user" size={22} />,
  Favorite: <MaterialIcons name="favorite" size={22} />,
};

// Home Stack Navigator
const HomeStack = () => {
  const theme = useContext(ThemeContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.background},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen
        name="HomeMain"
        component={Home}
        options={{title: 'Home'}}
      />
      <Stack.Screen
        name="PGDetail"
        component={PGDetailScreen}
        options={({route}) => ({title: route.params.pgItem.name})}
      />
      <Stack.Screen
        name="RoomAvailability"
        component={RoomAvailabilityScreen}
        options={{title: 'Available Rooms'}}
      />
    </Stack.Navigator>
  );
};

// Search Stack Navigator
const SearchStack = () => {
  const theme = useContext(ThemeContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.background},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen
        name="SearchMain"
        component={Search}
        options={{title: 'Search'}}
      />
      <Stack.Screen
        name="PGDetail"
        component={PGDetailScreen}
        options={({route}) => ({title: route.params.pgItem.name})}
      />
    </Stack.Navigator>
  );
};

// My PG Stack Navigator
const MyPGStack = () => {
  const theme = useContext(ThemeContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.background},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen name="MyPG" component={MyPG} options={{title: 'My PG'}} />
    </Stack.Navigator>
  );
};

const FavoriteStack = () => {
  const theme = useContext(ThemeContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.background},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen
        name="FavoriteMain"
        component={FavoritesScreen}
        options={{title: 'Favorite'}}
      />
      <Stack.Screen
        name="PGDetail"
        component={PGDetailScreen}
        options={{title:'PGDetailScreen'}}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  const theme = useContext(ThemeContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.background},
        headerTintColor: theme.colors.text,
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen
        name="ProfileMain"
        component={Profile}
        options={{title: 'Profile'}}
      />
      <Stack.Screen
        name="PremiumScreen"
        component={PremiumScreen}
        options={{title: 'Premium Plan'}}
      />
      <Stack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
        options={{title: 'Privacy Policy'}}
      />
      <Stack.Screen
        name="TermsScreen"
        component={TermsScreen}
        options={{title: 'Terms & Conditions'}}
      />
      <Stack.Screen
        name="ContactSupportScreen"
        component={ContactSupportScreen}
        options={{title: 'Contact Support'}}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  const theme = useContext(ThemeContext);

  const tabs = [
    {name: 'Home', component: HomeStack},
    {name: 'Search', component: SearchStack},
    {name: 'Favorite', component: FavoriteStack},
    {name: 'My PG', component: MyPGStack},
    {name: 'Profile', component: ProfileStack},
  ];

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {fontSize: 10},
        tabBarStyle: {height: 55, backgroundColor: theme.colors.tabBar},
        headerShown: false,
      }}>
      {tabs.map(({name, component}) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: ({color}) =>
              React.cloneElement(tabIcons[name], {color}),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

// Main App Component
const App = () => (
  <Auth0Provider
    domain={'dev-pftxcjiylw0on71u.us.auth0.com'}
    clientId={'LnCvxnKK8FwJCdo0OTsYK470GC1QrDzp'}>
    <ThemeProvider>
      <NavigationContainer>
        <AuthWrapper>
          <TabNavigator />
        </AuthWrapper>
      </NavigationContainer>
    </ThemeProvider>
  </Auth0Provider>
);

export default App;
