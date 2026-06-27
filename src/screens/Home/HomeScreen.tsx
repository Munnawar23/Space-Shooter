import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trophy, Play } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, runOnJS } from 'react-native-reanimated';
import Sound from 'react-native-sound';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import { storage } from '@/utils/storage';
import { RootStackParamList } from '@/navigation/RootNavigator';
import { wp, hp } from '@/helpers/dimensionHelpers';

import Button from '@/components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [highScore, setHighScore] = useState(0);

  // Logo floating animation
  const logoTranslateY = useSharedValue(0);

  // Sound ref
  const buttonSoundRef = useRef<Sound | null>(null);

  useEffect(() => {
    // Load high score
    try {
      const savedScore = storage.getNumber('space_shooter_high_score');
      if (savedScore) {
        setHighScore(savedScore);
      }
    } catch (e) {
      console.log('Error reading high score:', e);
    }

    // Start logo floating animation on UI thread
    logoTranslateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1800 }),
        withTiming(0, { duration: 1800 })
      ),
      -1,
      true
    );

    // Enable playback in silence mode
    Sound.setCategory('Playback');

    // Load button sound using correct react-native-sound API
    const sound = new Sound('button.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.warn('Failed to load button.mp3:', error);
        return;
      }
      sound.setVolume(1.0);
      buttonSoundRef.current = sound;
    });

    return () => {
      if (buttonSoundRef.current) {
        buttonSoundRef.current.release();
        buttonSoundRef.current = null;
      }
    };
  }, []);

  // Update high score whenever screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      try {
        const savedScore = storage.getNumber('space_shooter_high_score');
        setHighScore(savedScore || 0);
      } catch (e) {
        // Ignore MMKV error
      }
    });
    return unsubscribe;
  }, [navigation]);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: logoTranslateY.value }],
    };
  });

  const navigateToGame = () => {
    navigation.navigate('SpaceShooter');
  };

  const handlePress = () => {
    // Play button sound safely (will not block navigation if sound fails)
    try {
      if (buttonSoundRef.current) {
        buttonSoundRef.current.stop(() => {
          buttonSoundRef.current?.play((success) => {
            if (!success) {
              console.log('sound playback failed');
            }
          });
        });
      }
    } catch (e) {
      console.log('Error playing button sound:', e);
    }

    navigateToGame();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#060814" />

      {/* Background star accents */}
      <View style={[styles.starAccent, { top: hp(15), left: wp(10) }]} />
      <View style={[styles.starAccent, { top: hp(40), right: wp(15) }]} />
      <View style={[styles.starAccent, { bottom: hp(25), left: wp(20) }]} />
      <View style={[styles.starAccent, { top: hp(70), left: wp(80) }]} />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>ARCADE EDITION</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <Text style={styles.logoTextMain}>NEON</Text>
          <Text style={styles.logoTextSub}>GALAXY</Text>
          <Text style={styles.logoTagline}>SKIA SPACE SHOOTER</Text>
        </Animated.View>

        {/* High Score Panel */}
        <View style={styles.scorePanel}>
          <Trophy size={20} color="#ffea00" />
          <Text style={styles.scoreLabel}>GALAXY RECORD: </Text>
          <Text style={styles.scoreValue}>{highScore}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.menuButtons}>
          <Button
            title="LAUNCH MISSION"
            icon={<Play size={20} color="#060814" />}
            onPress={handlePress}
            style={{ width: wp(80) }}
          />
        </View>
      </View>

      {/* Spacing empty footer to keep alignment */}
      <View style={{ height: hp(3) }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060814',
    justifyContent: 'space-between',
    paddingHorizontal: wp(6),
  },
  starAccent: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    opacity: 0.6,
  },
  header: {
    alignItems: 'center',
    marginTop: hp(3),
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    fontFamily: theme.fontFamily.heading,
    color: '#ff007f',
    letterSpacing: 2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: hp(5),
  },
  logoTextMain: {
    fontSize: moderateScale(54),
    fontFamily: theme.fontFamily.heading,
    color: '#ffffff',
    lineHeight: moderateScale(56),
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  logoTextSub: {
    fontSize: moderateScale(60),
    fontFamily: theme.fontFamily.heading,
    color: '#00f3ff',
    lineHeight: moderateScale(62),
    textShadowColor: 'rgba(0, 243, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  logoTagline: {
    fontSize: moderateScale(11),
    fontFamily: theme.fontFamily.bodyBold,
    color: '#8f9bb3',
    letterSpacing: 3,
    marginTop: hp(1),
  },
  scorePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111736',
    borderWidth: 1.5,
    borderColor: '#1e295d',
    borderRadius: scale(20),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    marginBottom: hp(5),
  },
  scoreLabel: {
    fontSize: moderateScale(12),
    fontFamily: theme.fontFamily.bodyBold,
    color: '#8f9bb3',
    marginLeft: scale(6),
  },
  scoreValue: {
    fontSize: moderateScale(16),
    fontFamily: theme.fontFamily.heading,
    color: '#ffea00',
  },
  menuButtons: {
    width: '100%',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#00f3ff',
    width: wp(80),
    paddingVertical: hp(2),
    borderRadius: scale(30),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00f3ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    color: '#060814',
    fontSize: moderateScale(16),
    fontFamily: theme.fontFamily.heading,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginRight: scale(8),
  },
});
