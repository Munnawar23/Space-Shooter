import React, { useEffect } from 'react';
import { StatusBar, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sound from 'react-native-sound';
import RootNavigator from '@/navigation/RootNavigator';
import { theme } from '@/styles/theme';

function App() {
  useEffect(() => {
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    // Resolve the require asset to a string URI
    const asset = Image.resolveAssetSource(require('@/assets/sfx/bg.mp3'));

    // Load and play the background music
    const bgSound = new Sound(asset.uri, '', (error) => {
      if (error) {
        console.error('Failed to load background music', error);
        return;
      }
      bgSound.setNumberOfLoops(-1);
      bgSound.setVolume(0.5);
      bgSound.play();
    });

    return () => {
      bgSound.stop();
      bgSound.release();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
