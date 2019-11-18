module.exports = api => ({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: api.env('test') ? { node: 'current' } : ['>0.1%', 'not dead'],
        modules: api.env('test') && 'commonjs',
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { helpers: true }],
    '@babel/plugin-proposal-class-properties',
  ],
});
