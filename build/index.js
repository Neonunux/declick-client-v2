import webpack from 'webpack'

const [target] = process.argv.slice(2)
const config = require(`./config.${target}.js`).default

webpack(config, (error, stats) => {
  if (error) {
    console.error(error)
    return
  }
  console.log(stats.toString({
    chunks: false,
    colors: true,
    errorDetails: true,
  }))
})
