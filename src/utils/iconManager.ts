import {changeIcon, getIcon} from 'react-native-change-icon';
import {Platform} from 'react-native';

export type AppIconName = 'Default' | 'DarkIcon';

export const IconManager = {
  getActiveIcon: async (): Promise<string> => {
    try {
      const icon = await getIcon();
      return icon === 'Default' ? 'Default' : icon;
    } catch (error) {
      console.warn('Error getting app icon', error);
      return 'Default';
    }
  },

  /**
   * Changes the app icon
   * @param iconName The name of the icon ('Default' or 'DarkIcon')
   */
  setIcon: async (iconName: AppIconName): Promise<boolean> => {
    try {
      const name =
        iconName === 'Default'
          ? Platform.OS === 'android'
            ? 'MainActivityDefault'
            : 'Default'
          : iconName;
      await changeIcon(name);
      return true;
    } catch (error) {
      console.error(`Failed to change app icon to ${iconName}`, error);
      return false;
    }
  },
};
