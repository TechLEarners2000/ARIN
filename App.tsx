import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from './src/components/BottomNav';
import { HeaderStatus } from './src/components/HeaderStatus';
import { AppProvider, useApp } from './src/context/AppContext';
import { LauncherScreen } from './src/screens/LauncherScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { TestScreen } from './src/screens/TestScreen';
import { ControllerScreen } from './src/screens/controller/ControllerScreen';
import { colors } from './src/theme/colors';

function MainNavigator() {
  const { isSplashVisible, hasCompletedOnboarding, activeTab, isControllerOpen, setIsControllerOpen } = useApp();
  const safeArea = useSafeAreaInsets();

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <View style={[styles.root, { paddingTop: safeArea.top, paddingBottom: safeArea.bottom }]}>
        <OnboardingScreen />
      </View>
    );
  }

  if (isControllerOpen) {
    return (
      <View style={styles.root}>
        <ControllerScreen onClose={() => setIsControllerOpen(false)} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: safeArea.top, paddingBottom: safeArea.bottom }]}>
      <HeaderStatus />
      <View style={styles.body}>
        {activeTab === 'dashboard' && <LauncherScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
        {activeTab === 'test-interface' && <TestScreen />}
      </View>
      <BottomNav />
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
});

export default App;
