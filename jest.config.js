module.exports = {
  projects: [
    '<rootDir>/packages/*',
    {
      displayName: 'eslint',
      runner: 'jest-runner-eslint',
      testMatch: ['**/*.js'],
    },
  ],
};
