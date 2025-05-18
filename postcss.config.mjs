module.exports = {
  plugins: [
    require('postcss-preset-env')({
      browsers: 'last 2 versions',
      stage: 3
    }),
    require('autoprefixer')({
      // Конфигурация Autoprefixer
      grid: true,
      overrideBrowserslist: ['>1%', 'last 4 versions']
    })
  ]
}
