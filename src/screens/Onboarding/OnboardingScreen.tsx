import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LottieView from 'lottie-react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import { wp, hp } from '@/helpers/dimensionHelpers';
import { AlertCircle } from 'lucide-react-native';
import Button from '@/components/Button';
import { storage, StorageKeys } from '@/utils/storage';
import { RootStackParamList } from '@/navigation/RootNavigator';
import Sound from 'react-native-sound';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const navigation = useNavigation<NavigationProp>();
  const S = createStyles();

  // Animation values for the button scale
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const navigateToHome = (trimmedName: string) => {
    // Save pet name and completion flag
    storage.set(StorageKeys.PET_NAME, trimmedName);
    storage.set(StorageKeys.HAS_COMPLETED_ONBOARDING, true);

    // Redirect to Home screen
    navigation.replace('Home');
  };

  const handleStartJourney = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Oops!', 'Please enter a name for your pet.');
      return;
    }

    // Play click sound
    const soundAsset = Image.resolveAssetSource(require('@/assets/sfx/button.mp3'));
    const clickSound = new Sound(soundAsset.uri, '', (error) => {
      if (error) {
        console.warn('Failed to load button sound:', error);
      } else {
        clickSound.play((_success) => {
          clickSound.release();
        });
      }
    });

    // Animate button scale (small -> big -> settle)
    buttonScale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 300 }),
      withSpring(1.1, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );

    // Navigate to Home screen after a short delay to let the animation play
    setTimeout(() => {
      navigateToHome(trimmedName);
    }, 300);
  };

  return (
    <View style={S.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={S.scrollContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        {/* Animation */}
        <View style={S.animationContainer}>
          <LottieView
            source={require('@/assets/animations/blessed-cat.json')}
            autoPlay
            loop
            style={S.lottieAnimation}
          />
        </View>

        {/* Title */}
        <Text style={S.title}>Name Your Pet</Text>

        {/* Input Field */}
        <TextInput
          style={S.input}
          placeholder="e.g. Shiba, Tama, Milo..."
          placeholderTextColor={theme.colors.subtext}
          value={name}
          onChangeText={setName}
          maxLength={15}
          autoCorrect={false}
        />

        {/* Warning Card */}
        <View style={S.warningCard}>
          <AlertCircle size={18} color={theme.colors.accent} style={S.warningIcon} />
          <View style={S.warningTextContainer}>
            <Text style={S.warningTitle}>Important Note</Text>
            <Text style={S.warningText}>
              You cannot change your pet's name later. To change it, you will have to delete all progress.
            </Text>
          </View>
        </View>

        {/* Action Button wrapped in Animated.View */}
        <Animated.View style={[S.buttonContainer, animatedButtonStyle]}>
          <Button
            title="Adopt & Start Journey"
            onPress={handleStartJourney}
            variant="primary"
          />
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.accent,
    },
    scrollContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: wp(6),
      paddingVertical: hp(4),
    },
    animationContainer: {
      width: wp(65),
      height: wp(65),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    lottieAnimation: {
      width: '100%',
      height: '100%',
    },
    title: {
      fontFamily: theme.fontFamily.heading,
      fontSize: theme.fontSize.heading,
      color: theme.colors.card,
      textAlign: 'center',
      marginBottom: verticalScale(20),
    },
    input: {
      width: '100%',
      height: verticalScale(52),
      backgroundColor: theme.colors.card,
      borderRadius: scale(16),
      borderWidth: 2,
      borderColor: theme.colors.text,
      paddingHorizontal: scale(16),
      fontFamily: theme.fontFamily.bodyBold,
      fontSize: theme.fontSize.button,
      color: theme.colors.text,
      marginBottom: verticalScale(16),
      textAlign: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    warningCard: {
      width: '100%',
      backgroundColor: theme.colors.foam,
      borderRadius: scale(14),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderLeftWidth: scale(5),
      borderLeftColor: theme.colors.accentLight,
      padding: scale(14),
      marginBottom: verticalScale(24),
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    warningIcon: {
      marginRight: scale(10),
      marginTop: verticalScale(2),
    },
    warningTextContainer: {
      flex: 1,
    },
    warningTitle: {
      fontFamily: theme.fontFamily.heading,
      fontSize: theme.fontSize.statLabel,
      color: theme.colors.accent,
      marginBottom: verticalScale(4),
    },
    warningText: {
      fontFamily: theme.fontFamily.body,
      fontSize: theme.fontSize.body - 1,
      color: theme.colors.readingText,
      lineHeight: scale(18),
    },
    buttonContainer: {
      width: '100%',
    },
  });
