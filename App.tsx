import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {store} from './src/store';
import {ThemeProvider} from './src/hooks/useTheme';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import {useOfflineSync} from './src/hooks/useOfflineSync';
import {OfflineBanner} from './src/components/OfflineBanner';
import {setupPushNotifications} from './src/services/PushNotificationService';

export default function App() {
  const {isOffline} = useOfflineSync();

  useEffect(() => {
    const unsubscribe = setupPushNotifications();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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
