import React from 'react';
import {Provider} from 'react-redux';
import {store} from './src/store';
import {ThemeProvider} from './src/hooks/useTheme';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { useOfflineSync } from './src/hooks/useOfflineSync';
import { OfflineBanner } from './src/components/OfflineBanner';

export default function App() {
  const { isOffline } = useOfflineSync();

  return (
    <Provider store={store}>
      <ThemeProvider>
        <OfflineBanner isOffline={isOffline} />
        <AppNavigator />
        <Toast />
      </ThemeProvider>
    </Provider>
  );
}
