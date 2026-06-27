import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LottieView from "lottie-react-native";
import { verticalScale } from "react-native-size-matters";
import { theme } from "@/styles/theme";
import { wp } from "@/helpers/dimensionHelpers";
import { RootStackParamList } from "@/navigation/RootNavigator";
import LoaderBar from "./components/LoaderBar";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Splash">;

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp>();
  const S = createStyles();

  const handleComplete = () => {
    navigation.replace("Home");
  };

  return (
    <View style={S.container}>
      <View style={S.animationContainer}>
        <LottieView
          source={require("@/assets/animations/space.json")}
          autoPlay
          loop
          style={S.lottieAnimation}
        />
      </View>
      <LoaderBar onComplete={handleComplete} duration={3000} />
    </View>
  );
}


const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#060814",
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
  });


