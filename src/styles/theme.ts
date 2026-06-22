import { moderateScale } from "react-native-size-matters";

export const colors = {
  background: "#FFF8EE",     // Warm cream, matches the soft bathroom tile warmth
  backgroundAlt: "#E8F6FF",  // Light sky blue for outdoor/play screens
  card: "#FFFDF7",           // Off-white card surface, slightly warm
  text: "#3B2A1A",           // Deep warm brown, like Shiba's outline strokes
  subtext: "#8C6E52",        // Mid-tone earthy brown for secondary labels
  readingText: "#000000",
  primary: "#F5A623",        // Shiba golden amber — the dominant fur color
  primaryDark: "#D4861A",    // Deeper amber for pressed states / shadows
  accent: "#E8533A",         // Coral red from the bandana and soap bottle
  accentLight: "#FFCAB0",    // Pale salmon for accent backgrounds / tints
  sky: "#3AAFE8",            // Bright outdoor sky blue from the play scene
  grass: "#5BBF3E",          // Lush grass green from the yard
  grassDark: "#3E9126",      // Deeper green for shadows on grass
  sunshine: "#FFD93D",       // Sunny yellow from the smiling sun
  foam: "#E8F4FF",           // Soapy bubble/foam near-white blue
  border: "#F0DFC8",         // Warm beige border, harmonizes with background
  statBarBackground: "#EDE0D0", // Soft warm fill for stat bar tracks
  shadow: "#C49A6C",         // Warm brown shadow tone
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