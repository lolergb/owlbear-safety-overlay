/**
 * Setup global para tests
 */

import { jest, beforeEach } from '@jest/globals';
import { mockOBR } from './obr-sdk.js';

global.OBR = mockOBR;

const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = String(value);
  }),
  removeItem: jest.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  }),
  get length() {
    return Object.keys(localStorageMock.store).length;
  },
  key: jest.fn((index) => Object.keys(localStorageMock.store)[index] || null)
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  mockOBR.room.getMetadata.mockResolvedValue({});
  mockOBR.room.setMetadata.mockResolvedValue(undefined);
  mockOBR.player.getRole.mockResolvedValue('GM');
});
