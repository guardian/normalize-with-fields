import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import mkdirp from 'mkdirp';
import fs from 'fs';
import path from 'path';

const flowStr = entry =>
  `// @flow

export * from '${entry}';
`;

const addFlowDefs = flowPath => ({
  transformBundle: (_, id) => {
    const file = `${id.file}.flow`;
    mkdirp(path.dirname(file), err => {
      if (err) {
        throw `Couldn't write file`;
      }
      fs.writeFileSync(file, flowStr(flowPath));
    });
  }
});

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    plugins: [babel(), addFlowDefs('../src/index.js')],
    external: ['react', 'lodash/fp/get', 'lodash/fp/set']
  },
];
