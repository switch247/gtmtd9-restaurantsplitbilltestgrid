import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { copyFileSync, readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { spawnSync } from 'child_process';

// Meta-test: run the repository_after test suite against multiple implementations
// located in tests/resources. For each implementation we expect:
// - `correct` implementation: original tests pass (exit code 0)
// - `broken*` implementations: original tests fail (non-zero exit code)
// Additionally, for the correct implementation we run with coverage and assert
// branch coverage meets the required threshold.

const ROOT = process.cwd();
const REPO_AFTER_DIR = join(ROOT, 'repository_after');
const REPO_AFTER_IMPL = join(REPO_AFTER_DIR, 'BillSplitter.js');
const RESOURCES_DIR = join(__dirname, 'resources');
const BACKUP_IMPL = join(__dirname, 'resources', '__backup_BillSplitter.js');

const COVERAGE_SUMMARY = join(ROOT, 'coverage', 'coverage-summary.json');
const REQUIRED_BRANCH_COVERAGE = 100; // percent

function runVitest(targetTestFile, withCoverage = false) {
  const args = ['vitest', 'run', targetTestFile, '--reporter', 'json'];
  if (withCoverage) args.push('--coverage');

  // Use npx via shell to ensure local bin resolution on Windows; capture output
  if (withCoverage) {
    // Use the npm script which already includes --coverage in package.json
    const res = spawnSync('npm run test:impl', { encoding: 'utf8', shell: true, stdio: 'pipe' });
    return {
      status: res.status,
      stdout: res.stdout || '',
      stderr: res.stderr || '',
    };
  }

  const res = spawnSync('npx ' + args.map(a => JSON.stringify(a)).join(' '), {
    encoding: 'utf8',
    shell: true,
    stdio: 'pipe',
  });

  return {
    status: res.status, // exit code (number)
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  };
}

// ----------------------------
// Helper utilities for meta-tests
// ----------------------------

// Ensure the implementation file exists before attempting to copy it.
function ensureImplExists(implPath) {
  if (!existsSync(implPath)) {
    throw new Error(`Implementation file not found: ${implPath}`);
  }
}

// Install (copy) the implementation into the repository_after location so
// the original tests will import and execute that implementation.
function installImplementation(implPath) {
  copyFileSync(implPath, REPO_AFTER_IMPL);
}

// Run the original repository_after test file (non-coverage run).
// Returns the result object from the subprocess runner.
function runOriginalTests() {
  const targetTest = 'repository_after/BillSplitter.test.js';
  return runVitest(targetTest, false);
}

// Parse failures out of the JSON reporter output when available.
// Returns an object { parsed, failures } where failures may be null
// if parsing wasn't possible.
function parseFailures(result) {
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (e) {
    parsed = null;
  }
  const failures = parsed && parsed.stats ? parsed.stats.failures : null;
  return { parsed, failures };
}

// Assert the expected outcome for an implementation.
// - `correct` implementations must cause the original tests to pass.
// - `broken` implementations must cause at least one failure (or non-zero exit).
function assertImplementationOutcome(name, result, failures, file) {
  if (name.toLowerCase().includes('correct')) {
    const passed = result.status === 0 && (failures === null || failures === 0);
    if (!passed) {
      // Provide useful diagnostics on failure
      // eslint-disable-next-line no-console
      console.error('Original tests failed for correct implementation:', {
        exitCode: result.status,
        failures,
        stdout: result.stdout.slice(0, 800),
        stderr: result.stderr.slice(0, 800),
      });
    }
    expect(passed).toBe(true);
  } else {
    const failed = result.status !== 0 || (failures !== null && failures > 0);
    if (!failed) {
      // eslint-disable-next-line no-console
      console.error('Broken implementation unexpectedly passed tests:', { file, stdout: result.stdout.slice(0, 800) });
    }
    expect(failed).toBe(true);
  }
}

// Backup original implementation from repository_after (if exists)
beforeAll(() => {
  if (existsSync(REPO_AFTER_IMPL)) {
    copyFileSync(REPO_AFTER_IMPL, BACKUP_IMPL);
  }
});

afterAll(() => {
  // Restore original implementation if we backed it up
  if (existsSync(BACKUP_IMPL)) {
    copyFileSync(BACKUP_IMPL, REPO_AFTER_IMPL);
  }
});

describe('Meta-tests: validate test-suite against multiple implementations', () => {
  // Separate, explicit tests for each implementation make results easier to read
  it('should pass original tests for the correct implementation', () => {
    const file = 'correct.js';
    const implPath = join(RESOURCES_DIR, file);
    const name = 'correct';

    ensureImplExists(implPath);
    installImplementation(implPath);

    const result = runOriginalTests();
    const { failures } = parseFailures(result);
    assertImplementationOutcome(name, result, failures, file);
  });

  it('should fail original tests for broken implementation: remainder assigned to last', () => {
    const file = 'broken-remainder.js';
    const implPath = join(RESOURCES_DIR, file);
    const name = 'broken-remainder';

    ensureImplExists(implPath);
    installImplementation(implPath);

    const result = runOriginalTests();
    const { failures } = parseFailures(result);
    assertImplementationOutcome(name, result, failures, file);
  });

  it('should fail original tests for broken implementation: per-person rounding error', () => {
    const file = 'broken-rounding.js';
    const implPath = join(RESOURCES_DIR, file);
    const name = 'broken-rounding';

    ensureImplExists(implPath);
    installImplementation(implPath);

    const result = runOriginalTests();
    const { failures } = parseFailures(result);
    assertImplementationOutcome(name, result, failures, file);
  });

  it('should fail original tests for broken implementation: tax calculated incorrectly', () => {
    const file = 'broken-tax.js';
    const implPath = join(RESOURCES_DIR, file);
    const name = 'broken-tax';

    ensureImplExists(implPath);
    installImplementation(implPath);

    const result = runOriginalTests();
    const { failures } = parseFailures(result);
    assertImplementationOutcome(name, result, failures, file);
  });

  it('should fail original tests for broken implementation: null returned for zero people', () => {
    const file = 'broken-zero-people.js';
    const implPath = join(RESOURCES_DIR, file);
    const name = 'broken-zero-people';

    ensureImplExists(implPath);
    installImplementation(implPath);

    const result = runOriginalTests();
    const { failures } = parseFailures(result);
    assertImplementationOutcome(name, result, failures, file);
  });

  it('should verify branch coverage for the correct implementation', () => {
    const correctPath = join(RESOURCES_DIR, 'correct.js');
    copyFileSync(correctPath, REPO_AFTER_IMPL);

    // Run tests with coverage enabled via the project's npm script
    const targetTest = 'repository_after/BillSplitter.test.js';
    const result = runVitest(targetTest, true);

    if (result.status !== 0) {
      // Provide diagnostics and fail early
      // eslint-disable-next-line no-console
      console.error('Coverage run failed:', { exitCode: result.status, stderr: result.stderr.slice(0, 800) });
      expect(result.status).toBe(0);
      return;
    }

    // Parse coverage percentages from stdout produced by the npm script (text reporter)
    const match = result.stdout.match(/^All files\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)\s*\|/m);
    if (!match) {
      // eslint-disable-next-line no-console
      console.error('Could not parse coverage output. stdout:', result.stdout.slice(0, 2000));
      throw new Error('Could not parse coverage output');
    }

    const branchPct = parseFloat(match[2]);
    expect(branchPct).toBeGreaterThanOrEqual(REQUIRED_BRANCH_COVERAGE);
  });
});
