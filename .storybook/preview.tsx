import React from 'react';
import { View } from 'react-native';

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#333333' },
      ],
    },
  },
  decorators: [
    (Story: any) => (
      <View style={{ flex: 1, padding: 20 }}>
        <Story />
      </View>
    ),
  ],
};

export default preview;
