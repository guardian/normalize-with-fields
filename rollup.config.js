import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import defs from 'rollup-plugin-flow-defs';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    plugins: [babel(), defs()],
    external: ['react', 'lodash/fp/get', 'lodash/fp/set']
  }
];
