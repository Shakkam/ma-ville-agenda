module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
      // Worklets plugin must be listed last (reanimated 4 / SDK 54)
      'react-native-worklets/plugin',
    ],
  };
};
