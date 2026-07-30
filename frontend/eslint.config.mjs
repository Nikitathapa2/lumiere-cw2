import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

// ESLint 9 only reads flat config, and Next 16 removed `next lint`, so linting
// runs through the eslint CLI against the config eslint-config-next now exports
// directly as a flat array.
const config = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next.config.js'],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // eslint-plugin-react-hooks 7 (pulled in by eslint-config-next 16) ships
      // the React Compiler rule set as errors. They flag the ordinary
      // "fetch on mount and setState" pattern this app is built on, so treating
      // them as errors would fail CI on working code. Kept as warnings so the
      // guidance still surfaces without gating the build.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]

export default config
