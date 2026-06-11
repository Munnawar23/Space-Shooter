import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { feed, sleep, play, applyDecay } from '@/store/petSlice';
import LottieView from 'lottie-react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import { Settings, Utensils, Moon, Smile as SmileIcon } from 'lucide-react-native';
import StatBar from './Components/StatBar';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import ActionButton from './Components/ActionButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/RootNavigator';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const insets = useSafeAreaInsets();
  const { hunger, energy, happiness, isSleeping } = useSelector((state: RootState) => state.pet);

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

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  const handleAction = (action: 'feed' | 'sleep' | 'play') => {
    switch (action) {
      case 'feed':
        dispatch(feed());
        break;
      case 'sleep':
        navigation.navigate('Sleeping');
        break;
      case 'play':
        dispatch(play());
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
            hunger={hunger}
            energy={energy}
            happiness={happiness}
            hungerIcon={<Utensils size={20} color={theme.colors.text} />}
            energyIcon={<Moon size={20} color={theme.colors.text} />}
            happinessIcon={<SmileIcon size={20} color={theme.colors.text} />}
          />
        </View>

        {/* Center: Pet Animation */}
        <View style={styles.petContainer}>
          {isSleeping ? (
            <Text style={styles.sleepingText}>Dog is sleeping</Text>
          ) : (
            <LottieView
              source={
                hunger > 80 && energy > 80 && happiness > 80
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
            label="Eat"
            icon={<Utensils size={24} color={theme.colors.card} />}
            color={theme.colors.accent}
            onPress={() => handleAction('feed')}
          />
          <ActionButton
            label="Sleep"
            icon={<Moon size={24} color={theme.colors.text} />}
            color={theme.colors.sunshine}
            textColor={theme.colors.text}
            onPress={() => handleAction('sleep')}
          />
          <ActionButton
            label="Play"
            icon={<SmileIcon size={24} color={theme.colors.card} />}
            color={theme.colors.sky}
            onPress={() => handleAction('play')}
          />
        </View>
      </View>
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
