import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import { wp, hp } from '@/helpers/dimensionHelpers';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { ChevronLeft } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setIsSleeping, applyDecay } from '@/store/petSlice';
import ZzzEffect from './components/ZzzEffect';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sleeping'>;

export default function SleepingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  
  // Select current stats from Redux
  const { hunger, energy, happiness, isSleeping } = useSelector((state: RootState) => state.pet);
  
  // Determine if dog is angry (same logic as Home Screen)
  const isAngry = !(hunger > 80 && energy > 80 && happiness > 80);

  const progress = energy;

  // Sync / decay loop while screen is active
  useEffect(() => {
    dispatch(applyDecay(Date.now()));

    const interval = setInterval(() => {
      dispatch(applyDecay(Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleToggleSleep = () => {
    dispatch(setIsSleeping(!isSleeping));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const S = createStyles(insets);

  return (
    <ImageBackground
      source={require('@/assets/images/sleeping.webp')}
      style={S.background}
      resizeMode="cover"
    >
      <View style={S.container}>
        {/* Progress Bar Container at the Top */}
        <View style={S.progressContainer}>
          <ProgressBar progress={progress} label="Sleep Progress" onBack={handleBack} />
        </View>

        {/* Main Pet Visual Area at the Bottom */}
        <View style={S.petContainer}>
          {isSleeping && <ZzzEffect />}
          {isSleeping ? (
            <Image
              source={require('@/assets/images/sleeping-dog-clean.png')}
              style={S.petImage}
              resizeMode="contain"
            />
          ) : (
            <LottieView
              source={
                isAngry
                  ? require('@/assets/animations/angry-cat.json')
                  : require('@/assets/animations/cat.json')
              }
              autoPlay
              loop
              style={S.petAnimation}
            />
          )}
        </View>

        {/* Bottom Actions */}
        <View style={S.bottomContainer}>
          <Button
            title={isSleeping ? 'Wake Up' : 'Sleep'}
            onPress={handleToggleSleep}
            variant="primary"
            style={S.actionButton}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const createStyles = (insets: any) =>
  StyleSheet.create({
    background: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: insets.top + verticalScale(10),
      paddingBottom: insets.bottom + verticalScale(30),
      paddingHorizontal: wp(6),
    },
    progressContainer: {
      width: '100%',
      marginTop: verticalScale(10),
    },
    petContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: verticalScale(50),
    },
    petAnimation: {
      width: scale(250),
      height: scale(250),
    },
    petImage: {
      width: scale(250),
      height: scale(250),
    },
    bottomContainer: {
      width: '100%',
    },
    actionButton: {
      width: '100%',
    },
  });
