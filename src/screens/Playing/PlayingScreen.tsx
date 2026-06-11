import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import Sound from 'react-native-sound';

import { theme } from '@/styles/theme';
import { wp, hp } from '@/helpers/dimensionHelpers';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { incrementHappiness, applyDecay } from '@/store/petSlice';
import { Sparkles } from 'lucide-react-native';
import CustomModal from '@/components/CustomModal';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Playing'>;

export default function PlayingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const { hunger, energy, cleanliness, happiness } = useSelector((state: RootState) => state.pet);
  const isHealthy = hunger > 70 && energy > 70 && cleanliness > 70;

  const progress = happiness;
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const playSoundRef = useRef<Sound | null>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync / decay loop while screen is active
  useEffect(() => {
    dispatch(applyDecay(Date.now()));
    const interval = setInterval(() => {
      dispatch(applyDecay(Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Clean up sounds and intervals on unmount
  useEffect(() => {
    return () => {
      stopPlaySound();
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  const startPlaySound = () => {
    stopPlaySound();
    try {
      const soundAsset = Image.resolveAssetSource(require('@/assets/sfx/bath.mp3'));
      const sound = new Sound(soundAsset.uri, '', (error) => {
        if (error) {
          console.warn('Failed to load play loop sound:', error);
          return;
        }
        playSoundRef.current = sound;
        sound.setNumberOfLoops(-1);
        sound.play();
      });
    } catch (e) {
      console.warn('Error playing play loop sound:', e);
    }
  };

  const stopPlaySound = () => {
    if (playSoundRef.current) {
      playSoundRef.current.stop();
      playSoundRef.current.release();
      playSoundRef.current = null;
    }
  };

  const playCheerSound = () => {
    try {
      const soundAsset = Image.resolveAssetSource(require('@/assets/sfx/cheer.mp3'));
      const sound = new Sound(soundAsset.uri, '', (error) => {
        if (error) {
          console.warn('Failed to load cheer sound:', error);
          return;
        }
        sound.play(() => {
          sound.release();
        });
      });
    } catch (e) {
      console.warn('Error playing cheer sound:', e);
    }
  };

  const handleTogglePlay = () => {
    if (progress >= 100) return;

    if (isPlaying) {
      // Cancel Play
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlaying(false);
      stopPlaySound();
    } else {
      // Start Play
      setIsPlaying(true);
      startPlaySound();

      playIntervalRef.current = setInterval(() => {
        dispatch(incrementHappiness(1)); // Increase happiness over time
      }, 150);
    }
  };

  // Monitor progress reaching 100%
  useEffect(() => {
    if (progress >= 99.9 && !showCelebration) {
      setShowCelebration(true);
      if (isPlaying) {
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current);
          playIntervalRef.current = null;
        }
        setIsPlaying(false);
        stopPlaySound();
      }
      playCheerSound();
      ReactNativeHapticFeedback.trigger('notificationSuccess', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      Vibration.vibrate(500);
    }
  }, [progress, isPlaying, showCelebration]);

  const handleBack = () => {
    stopPlaySound();
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
    navigation.goBack();
  };

  const S = createStyles(insets);

  return (
    <ImageBackground
      source={require('@/assets/images/play.webp')}
      style={S.background}
      resizeMode="cover"
    >
      <View style={S.container}>
        {/* Progress Bar Container at the Top */}
        <View style={S.progressContainer}>
          <ProgressBar
            progress={progress}
            label={progress >= 99.9 ? 'Pet is Happy!' : isPlaying ? 'Playing...' : 'Tap Start to Play'}
            color={theme.colors.accent}
            onBack={handleBack}
          />
        </View>

        {/* Main Play Area */}
        <View style={S.playArea}>
          <LottieView
            source={
              isPlaying
                ? require('@/assets/animations/boxing-cat.json')
                : isHealthy
                ? require('@/assets/animations/cat.json')
                : require('@/assets/animations/angry-cat.json')
            }
            autoPlay
            loop
            style={S.petAnimation}
          />
        </View>

        {/* Action Button at the Bottom */}
        <View style={S.bottomContainer}>
          <Button
            title={progress >= 99.9 ? 'Happy Pet!' : isPlaying ? 'Cancel Play' : 'Start Play'}
            onPress={handleTogglePlay}
            disabled={progress >= 99.9}
            variant="primary"
            style={S.playButton}
          />
        </View>
      </View>
      <CustomModal
        visible={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          navigation.navigate('Home');
        }}
        title="CONGRATULATIONS! 🎉"
        message="Congratulations, it's done! Your pet is happy and energized!"
        buttonTitle="Okay"
        onButtonPress={() => {
          setShowCelebration(false);
          navigation.navigate('Home');
        }}
        showCloseButton={false}
        icon={<Sparkles size={scale(36)} color={theme.colors.sunshine} fill={theme.colors.sunshine} />}
        showCelebrationEffect={true}
      />
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
    playArea: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    petAnimation: {
      width: scale(250),
      height: scale(250),
    },
    bottomContainer: {
      width: '100%',
      marginBottom: verticalScale(10),
    },
    playButton: {
      width: '100%',
    },
  });
