// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();
// import { worker } from './mocks/browser';

// // Establish API mocking before all tests.
// beforeAll(() => worker.start());

// // Reset any request handlers that are declared as a part of our tests (i.e. for testing one-time error scenarios).
// afterEach(() => worker.resetHandlers());

// // Clean up after the tests are finished.
// afterAll(() => worker.stop());
