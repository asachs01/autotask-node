/**
 * Global teardown for integration tests
 * This runs once after all integration tests complete
 */
export default async function globalTeardown() {
  console.log('🧹 Cleaning up integration test environment...');

  // Clean up any global resources if needed
  if (globalThis.__AUTOTASK_CLIENT__) {
    // The AutotaskClient doesn't maintain persistent connections,
    // but we can clear the reference
    delete globalThis.__AUTOTASK_CLIENT__;
  }

  if (globalThis.__INTEGRATION_CONFIG__) {
    delete globalThis.__INTEGRATION_CONFIG__;
  }

  console.log('✅ Integration test cleanup complete');
} 