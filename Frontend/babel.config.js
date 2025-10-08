module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./",
          },
        },
      ],
      "react-native-worklets/plugin", // 👈 use this instead of reanimated/plugin
    ],
  };
};
