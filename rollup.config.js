import path from 'path'
import alias from 'rollup-plugin-alias'
import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import nodeGlobals from 'rollup-plugin-node-globals'
import uglify from 'rollup-plugin-uglify'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import replace from 'rollup-plugin-replace'
import image from 'rollup-plugin-image'

let plugins = [
  alias({
    vue$: 'vue/dist/vue.common.js',
    '@': path.resolve('./src/'),
    resolve: ['.js', '.vue']
  }),
  vue({
    css: './dist/assets/css/app.css'
  }),
  buble({
    objectAssign: 'Object.assign'
  }),
  nodeResolve({
    jsnext: true,
    main: true,
    browser: true,
    extensions: [ '.mjs', '.js', '.vue', '.json' ]
  }),
  commonjs(),
  nodeGlobals(),
  image()
]

let config = {
  input: './src/main.js',
  output: {
    file: './dist/assets/js/app.js',
    format: 'umd',
    sourcemap: true
  },
  external: [
  ],
  plugins: plugins
}

const isProduction = process.env.NODE_ENV === `production`
const isDevelopment = process.env.NODE_ENV === `development`

if (isProduction) {
  config.output.sourcemap = false
  config.plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  )
  config.plugins.push(uglify)
}

if (isDevelopment) {
  config.plugins.push(livereload())
  config.plugins.push(
    serve({
      contentBase: './dist/',
      port: 8080,
      open: true
    })
  )
}

export default config
