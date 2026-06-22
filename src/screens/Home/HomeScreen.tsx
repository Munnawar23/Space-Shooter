import React, { useEffect, useState } from 'react';
import {View,Text,StyleSheet,ImageBackground} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import { Moon, Smile as SmileIcon, Bath } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { applyDecay } from '@/store/petSlice';
import StatBar from './Components/StatBar';
import ActionButton from './Components/ActionButton';
import { RootStackParamList } from '@/navigation/RootNavigator';
import CustomModal from '@/components/CustomModal';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const insets = useSafeAreaInsets();
  const { energy, happiness, isSleeping, cleanliness } = useSelector((state: RootState) => state.pet);
  const [isSleepingModalVisible, setIsSleepingModalVisible] = useState(false);

  // Apply decay on mount and set up an interval to decay over time
  useEffect(() => {
    // Initial check for offline time
    dispatch(applyDecay(Date.now()));

    // Interval to decay while app is open
    const interval = setInterval(() => {
      dispatch(applyDecay(Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);


  const handleAction = (action: 'play' | 'sleep' | 'bath') => {
    if (isSleeping && (action === 'play' || action === 'bath')) {
      setIsSleepingModalVisible(true);
      return;
    }
    switch (action) {
      case 'play':
        navigation.navigate('Playing');
        break;
      case 'sleep':
        navigation.navigate('Sleeping');
        break;
      case 'bath':
        navigation.navigate('Bathing');
        break;
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/bg.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Top HUD */}
        <View style={styles.topHUD}>
          <StatBar
            happiness={happiness}
            energy={energy}
            cleanliness={cleanliness}
            happinessIcon={<SmileIcon size={20} color={theme.colors.text} />}
            energyIcon={<Moon size={20} color={theme.colors.text} />}
            cleanlinessIcon={<Bath size={20} color={theme.colors.text} />}
          />
        </View>

        {/* Center: Pet Animation */}
        <View style={styles.petContainer}>
          {isSleeping ? (
            <Text style={styles.sleepingText}>Pet is sleeping</Text>
          ) : (
            <LottieView
              source={
                happiness > 70 && energy > 70 && cleanliness > 70
                  ? require('@/assets/animations/cat.json')
                  : require('@/assets/animations/angry-cat.json')
              }
              autoPlay
              loop
              style={styles.petAnimation}
            />
          )}
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <ActionButton
            label="Play"
            icon={<SmileIcon size={24} color={theme.colors.card} />}
            color={theme.colors.accent}
            onPress={() => handleAction('play')}
          />
          <ActionButton
            label="Sleep"
            icon={<Moon size={24} color={theme.colors.text} />}
            color={theme.colors.sunshine}
            textColor={theme.colors.text}
            onPress={() => handleAction('sleep')}
          />
          <ActionButton
            label="Bath"
            icon={<Bath size={24} color={theme.colors.card} />}
            color={theme.colors.sky}
            onPress={() => handleAction('bath')}
          />
        </View>
      </View>
      <CustomModal
        visible={isSleepingModalVisible}
        onClose={() => setIsSleepingModalVisible(false)}
        title="SHHH... 💤"
        message="Your pet is sleeping peacefully right now! You cannot play or bathe it until it wakes up."
        buttonTitle="Go to Bedroom"
        onButtonPress={() => {
          setIsSleepingModalVisible(false);
          navigation.navigate('Sleeping');
        }}
        secondaryButtonTitle="Close"
        onSecondaryButtonPress={() => setIsSleepingModalVisible(false)}
        icon={<Moon size={scale(36)} color={theme.colors.sunshine} fill={theme.colors.sunshine} />}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHUD: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
  },
  petContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(80),
  },
  petAnimation: {
    width: scale(250),
    height: scale(250),
  },
  sleepingText: {
    fontFamily: theme.fontFamily.heading,
    fontSize: moderateScale(40),
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(40),
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    paddingBottom: verticalScale(30),
  },
});
