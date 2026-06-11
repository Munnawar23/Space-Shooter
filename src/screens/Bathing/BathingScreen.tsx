import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { scale, verticalScale } from 'react-native-size-matters';
import Sound from 'react-native-sound';

import { theme } from '@/styles/theme';
import { wp, hp } from '@/helpers/dimensionHelpers';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { play, applyDecay, scrub } from '@/store/petSlice';
import { Sparkles } from 'lucide-react-native';
import FoamCanvas, { FoamCanvasRef } from './components/FoamCanvas';
import CelebrationOverlay from './components/CelebrationOverlay';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bathing'>;

export default function BathingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const foamCanvasRef = useRef<FoamCanvasRef>(null);
  const bathSoundRef = useRef<Sound | null>(null);

  // Select pet stats
  const { hunger, energy, happiness, cleanliness } = useSelector((state: RootState) => state.pet);
  const isAngry = !(hunger > 80 && energy > 80 && happiness > 80);

  const progress = cleanliness;
  const [soapPos, setSoapPos] = useState({ x: wp(80), y: hp(45) });
  const [isAutoWashing, setIsAutoWashing] = useState(false);

  // Sound helper functions
  const startBathSound = () => {
    stopBathSound();
    try {
      const soundAsset = Image.resolveAssetSource(require('@/assets/sfx/bath.mp3'));
      const sound = new Sound(soundAsset.uri, '', (error) => {
        if (error) {
          console.warn('Failed to load bath sound:', error);
          return;
        }
        bathSoundRef.current = sound;
        sound.setNumberOfLoops(-1);
        sound.play();
      });
    } catch (e) {
      console.warn('Error playing bath sound:', e);
    }
  };

  const stopBathSound = () => {
    if (bathSoundRef.current) {
      bathSoundRef.current.stop();
      bathSoundRef.current.release();
      bathSoundRef.current = null;
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

  // Sync / decay loop while screen is active
  useEffect(() => {
    dispatch(applyDecay(Date.now()));
    const interval = setInterval(() => {
      dispatch(applyDecay(Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Clean up auto-washing timers and sounds
  const autoWashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (autoWashIntervalRef.current) {
        clearInterval(autoWashIntervalRef.current);
      }
      stopBathSound();
    };
  }, []);

  const handleGestureUpdate = (x: number, y: number) => {
    setSoapPos({ x, y });

    // Call child FoamCanvas via ref to add bubbles without parent re-renders
    foamCanvasRef.current?.addBubbles(x, y);
  };

  const panGesture = Gesture.Pan()
    .enabled(!isAutoWashing)
    .onUpdate((event) => {
      scheduleOnRN(handleGestureUpdate, event.x, event.y);
    });

  const handleAutoWash = () => {
    if (progress >= 100) return;

    if (isAutoWashing) {
      // Stop washing
      if (autoWashIntervalRef.current) {
        clearInterval(autoWashIntervalRef.current);
        autoWashIntervalRef.current = null;
      }
      setIsAutoWashing(false);
      foamCanvasRef.current?.spawnWater(false);
      stopBathSound();
    } else {
      // Start washing
      setIsAutoWashing(true);
      foamCanvasRef.current?.spawnWater(true);
      startBathSound();

      autoWashIntervalRef.current = setInterval(() => {
        dispatch(scrub(1)); // Adds 1% cleanliness every 200ms (20 seconds total)
      }, 200);
    }
  };

  // Listen for cleanliness reaching 100% to stop auto wash
  useEffect(() => {
    if (progress >= 99.9 && isAutoWashing) {
      if (autoWashIntervalRef.current) {
        clearInterval(autoWashIntervalRef.current);
        autoWashIntervalRef.current = null;
      }
      setIsAutoWashing(false);
      foamCanvasRef.current?.spawnWater(false);
      stopBathSound();
      playCheerSound();
      dispatch(play()); // boost happiness on complete
    }
  }, [progress, isAutoWashing, dispatch]);

  const handleBack = () => {
    navigation.goBack();
  };

  const S = createStyles(insets);

  return (
    <ImageBackground
      source={require('@/assets/images/bg-bath.webp')}
      style={S.background}
      resizeMode="cover"
    >
      <View style={S.container}>
        {/* Progress Bar Container at the Top */}
        <View style={S.progressContainer}>
          <ProgressBar
            progress={progress}
            label={progress >= 99.9 ? 'Pet is Clean!' : isAutoWashing ? 'Shower Active!' : 'Scrub the Pet'}
            color={theme.colors.sky}
            onBack={handleBack}
          />
        </View>

        {/* Main Bath Area */}
        <GestureDetector gesture={panGesture}>
          <View style={S.bathArea}>
            {/* Lottie Animation of Pet - wrap in TouchableOpacity for click to wash */}
            <TouchableOpacity
              onPress={handleAutoWash}
              activeOpacity={0.9}
              style={S.petContainer}
              disabled={isAutoWashing || progress >= 99.9}
            >
              <LottieView
                source={require('@/assets/animations/angel-cat.json')}
                autoPlay
                loop
                style={S.petAnimation}
              />
              {progress >= 99.9 && (
                <View style={S.sparkleOverlay}>
                  <Sparkles size={scale(48)} color={theme.colors.sunshine} />
                </View>
              )}
            </TouchableOpacity>

            {/* Skia Foam & Water Canvas Overlay */}
            <FoamCanvas ref={foamCanvasRef} />

            {/* Soap Icon overlay (always visible) */}
            <View
              style={[
                S.soapContainer,
                {
                  left: soapPos.x - scale(30),
                  top: soapPos.y - scale(20),
                },
              ]}
            >
              <View style={S.soapBar} />
              <View style={[S.soapBubble, { top: -4, left: 10 }]} />
              <View style={[S.soapBubble, { bottom: -2, right: 8, width: 8, height: 8 }]} />
            </View>

            {/* Reanimated Floating Emojis and Celebration Badge Pop-up */}
            {progress >= 99.9 && <CelebrationOverlay />}
          </View>
        </GestureDetector>

        {/* Action Button at the Bottom */}
        <View style={S.bottomContainer}>
          <Button
            title={progress >= 99.9 ? 'Pet is Clean!' : isAutoWashing ? 'Stop Wash' : 'Wash Pet'}
            onPress={handleAutoWash}
            disabled={progress >= 99.9}
            variant="primary"
            style={S.washButton}
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
    bathArea: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    petContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: verticalScale(20),
    },
    petAnimation: {
      width: scale(250),
      height: scale(250),
    },
    sparkleOverlay: {
      position: 'absolute',
      top: 0,
      right: scale(20),
    },
    soapContainer: {
      position: 'absolute',
      width: scale(60),
      height: scale(40),
      zIndex: 99,
      pointerEvents: 'none', // pass events to the pan gesture container
    },
    soapBar: {
      width: '100%',
      height: '100%',
      backgroundColor: '#FFD3E8', // pink soap bar
      borderRadius: scale(14),
      borderWidth: 2.5,
      borderColor: theme.colors.text,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    soapBubble: {
      position: 'absolute',
      width: scale(12),
      height: scale(12),
      borderRadius: scale(6),
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 1.5,
      borderColor: theme.colors.text,
    },
    bottomContainer: {
      width: '100%',
      marginBottom: verticalScale(10),
    },
    washButton: {
      width: '100%',
    },
  });
