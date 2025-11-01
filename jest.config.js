module.exports = {
  preset: 'jest-preset-angular',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/**/*.module.ts',
    '!src/**/environment*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text-summary', 'lcov'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ]
};