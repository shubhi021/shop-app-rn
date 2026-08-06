module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|react-redux|@react-navigation|firebase|@firebase|react-native-safe-area-context|react-native-gesture-handler|react-native-screens|react-native-reanimated|react-native-vector-icons)/',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@firebase/(.*)': '<rootDir>/node_modules/@firebase/$1/dist/index.cjs.js',
  },
};
