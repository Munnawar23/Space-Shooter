import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '@/screens/Splash/SplashScreen';
import HomeScreen from '@/screens/Home/HomeScreen';
import SpaceShooterScreen from '@/screens/SpaceShooter/SpaceShooterScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  SpaceShooter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SpaceShooter" component={SpaceShooterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
