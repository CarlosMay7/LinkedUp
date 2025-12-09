export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    testMatch: ['**/__tests__/**/*.spec.js'],
    testPathIgnorePatterns: [
        'src/infrastructure/repositories/__tests__/(room|message|websocket).repository.spec.js',
    ],
    moduleNameMapper: {},
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.spec.js',
        '!src/**/__tests__/**',
        '!src/main.jsx',
    ],
    // Support for ES modules
    projects: [
        {
            displayName: 'unit',
            testEnvironment: 'node',
            testMatch: ['**/__tests__/**/*.spec.js'],
            testPathIgnorePatterns: [
                'src/infrastructure/repositories/__tests__/(room|message|websocket).repository.spec.js',
            ],
            transform: {
                '^.+\\.jsx?$': 'babel-jest',
            },
        },
    ],
};
