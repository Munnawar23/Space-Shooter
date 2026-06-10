import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LottieView from "lottie-react-native";
import { verticalScale, scale } from "react-native-size-matters";
import { theme } from "@/styles/theme";
import { wp, hp } from "@/helpers/dimensionHelpers";
import { RootStackParamList } from "@/navigation/RootNavigator";

import { storage, StorageKeys } from "@/utils/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Splash">;

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();
  const S = createStyles();

  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO: Remove for production — always show Onboarding for testing
      navigation.replace("Onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={S.container}>
      <View style={S.animationContainer}>
        <LottieView
          source={require("@/assets/animations/boxing-cat.json")}
          autoPlay
          loop
          style={S.lottieAnimation}
        />
      </View>
      <Text style={S.title}>My Pet</Text>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    animationContainer: {
      width: wp(60),
      height: wp(60),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(20),
    },
    lottieAnimation: {
      width: "100%",
      height: "100%",
    },
    title: {
      fontFamily: theme.fontFamily.heading,
      fontSize: theme.fontSize.display || scale(40),
      color: theme.colors.text,
      textAlign: "center",
      letterSpacing: scale(1),
    },
  });
