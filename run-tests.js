#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTests() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  log('🧪 Employee Management System - Test Runner', colors.cyan);
  log('=' .repeat(50), colors.cyan);

  try {
    switch (testType) {
      case 'unit':
        log('🔬 Running Unit Tests with Karma/Jasmine on Edge...', colors.yellow);
        await runCommand('ng', ['test', '--watch=false', '--browsers=EdgeHeadless']);
        log('✅ Unit tests completed successfully!', colors.green);
        break;

      case 'unit:watch':
        log('🔬 Running Unit Tests in Watch Mode on Edge...', colors.yellow);
        await runCommand('ng', ['test', '--browsers=EdgeAsChrome']);
        break;

      case 'unit:coverage':
        log('🔬 Running Unit Tests with Coverage on Edge...', colors.yellow);
        await runCommand('ng', ['test', '--code-coverage', '--watch=false', '--browsers=EdgeHeadless']);
        log('📊 Coverage report generated in ./coverage/', colors.blue);
        break;

      case 'e2e':
        log('🌐 Opening Cypress Test Runner with Edge...', colors.yellow);
        await runCommand('npm', ['run', 'e2e']);
        break;

      case 'e2e:headless':
        log('🌐 Running E2E Tests in Headless Mode with Edge...', colors.yellow);
        await runCommand('npm', ['run', 'e2e:headless']);
        log('✅ E2E tests completed successfully!', colors.green);
        break;

      case 'all':
        log('🚀 Running All Tests...', colors.magenta);
        
        log('📝 Step 1: Unit Tests with Coverage', colors.blue);
        await runCommand('ng', ['test', '--code-coverage', '--watch=false', '--browsers=EdgeHeadless']);
        log('✅ Unit tests completed!', colors.green);
        
        log('📝 Step 2: E2E Tests', colors.blue);
        await runCommand('npm', ['run', 'e2e:headless']);
        log('✅ E2E tests completed!', colors.green);
        
        log('🎉 All tests passed successfully!', colors.green);
        break;

      case 'ci':
        log('🤖 Running Tests for CI/CD...', colors.magenta);
        
        // Set CI environment
        process.env.CI = 'true';
        
        log('📝 Running Unit Tests with Coverage...', colors.blue);
        await runCommand('ng', ['test', '--code-coverage', '--watch=false', '--browsers=EdgeCI']);
        
        log('📝 Running E2E Tests...', colors.blue);
        await runCommand('npm', ['run', 'e2e:headless']);
        
        log('✅ CI tests completed successfully!', colors.green);
        break;

      case 'help':
      default:
        log('📖 Available Commands:', colors.bright);
        log('');
        log('  unit              Run unit tests once', colors.white);
        log('  unit:watch        Run unit tests in watch mode', colors.white);
        log('  unit:coverage     Run unit tests with coverage report', colors.white);
        log('  e2e               Open Cypress test runner (interactive)', colors.white);
        log('  e2e:headless      Run E2E tests in headless mode', colors.white);
        log('  all               Run all tests (unit + e2e)', colors.white);
        log('  ci                Run tests for CI/CD pipeline', colors.white);
        log('  help              Show this help message', colors.white);
        log('');
        log('Examples:', colors.yellow);
        log('  node run-tests.js unit', colors.cyan);
        log('  node run-tests.js e2e:headless', colors.cyan);
        log('  node run-tests.js all', colors.cyan);
        break;
    }
  } catch (error) {
    log(`❌ Tests failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Test execution interrupted', colors.yellow);
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Test execution terminated', colors.yellow);
  process.exit(0);
});

runTests();