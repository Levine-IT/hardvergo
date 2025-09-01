import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock Next.js router
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => {},
	}),
});

// Global test setup
beforeAll(() => {
	// Setup code that runs before all tests
});

// Cleanup after each test case
afterEach(() => {
	cleanup();
});

// Global teardown
afterAll(() => {
	// Cleanup code that runs after all tests
});
