import { moderateScale } from "react-native-size-matters";

export const colors = {
  background: "#060814",     // Deep Space Dark Blue/Black
  backgroundAlt: "#0b112c",  // Slightly lighter space blue
  card: "#111736",           // Futuristic card surface
  text: "#ffffff",           // Crisp white text
  subtext: "#8f9bb3",        // Cool gray secondary text
  readingText: "#ffffff",
  primary: "#00f3ff",        // Neon Cyan — player color
  primaryDark: "#00b2bd",    // Deep Cyan
  accent: "#ff007f",         // Neon Magenta — accent/alien color
  accentLight: "#ffb3d9",    // Pale Magenta
  sky: "#00f3ff",            // Neon Cyan
  grass: "#39ff14",          // Neon green
  grassDark: "#1b9c0c",      // Darker neon green
  sunshine: "#ffea00",       // Electric yellow — items/flame color
  foam: "#172047",           // Dark space grid / track
  border: "#1e295d",         // Dark blue border
  statBarBackground: "#172047", // Dark fill for stat bar tracks
  shadow: "#000000",         // Solid shadow
};

// ─── Font Families ──────────────────────────────────────────────────────────
export const fontFamily = {
  heading: "LuckiestGuy-Regular",
  body: "Baloo2-Regular",
  bodyBold: "Baloo2-Bold",
};

// ─── Semantic Font Sizes (pre-scaled) ────────────────────────────────────
export const fontSize = {
  small:      moderateScale(12),
  body:       moderateScale(14),
  statLabel:  moderateScale(15),
  button:     moderateScale(16),
  title:      moderateScale(20),
  heading:    moderateScale(28),
  display:    moderateScale(48),
};

// ─── Exporting the Final Theme Object & Types ───────────────────────────────
export const theme = {
  colors,
  fontFamily,
  fontSize,
};

export type ThemeColors     = typeof colors;
export type ThemeFontSize   = typeof fontSize;
export type ThemeFontFamily = typeof fontFamily;