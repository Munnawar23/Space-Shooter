import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '@/screens/Splash/SplashScreen';
import OnboardingScreen from '@/screens/Onboarding/OnboardingScreen';
import HomeScreen from '@/screens/Home/HomeScreen';
import SleepingScreen from '@/screens/Sleeping/SleepingScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  Sleeping: undefined;
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
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Sleeping" component={SleepingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
