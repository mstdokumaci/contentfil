import vue from 'rollup-plugin-vue'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import uglify from 'rollup-plugin-uglify'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import replace from 'rollup-plugin-replace'
import image from 'rollup-plugin-image'

let plugins = [
  vue({
    css: './dist/assets/css/app.css',
    needMap: false
  }),
  resolve({
    browser: true,
    extensions: [ '.mjs', '.js', '.vue', '.json' ]
  }),
  commonjs(),
  globals(),
  image()
]

let config = {
  input: './src/main.js',
  output: {
    file: './dist/assets/js/app.js',
    format: 'iife',
    sourcemap: true
  },
  plugins
}

if (process.env.NODE_ENV === 'production') {
  config.output.sourcemap = false
  config.plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  )
  config.plugins.push(uglify)
} else {
  config.plugins.push(livereload())
  config.plugins.push(
    serve({
      contentBase: './dist/',
      port: 8080,
      open: true,
      historyApiFallback: true
    })
  )
}

export default config
