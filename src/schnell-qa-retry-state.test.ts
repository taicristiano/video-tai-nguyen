/**
 * src/schnell-qa-retry-state.test.ts
 *
 * Unit tests for HAY & ĐẸP. — V3.3B-S.6.2.1 / FINAL GATE 1 PRE-FLIGHT
 * Hardened retry harness test suite.
 * No external API calls.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  computeSha256,
  verifyFrozenPrompts,
  handleApiError,
  handleGenerationSuccess,
  recordVisualQa,
  checkFinalizationEligibility,
  getMetrics,
  migrateFromS6Baseline,
  generateNextCandidate,
  executeRecordQaCli,
  saveQaLedger,
  loadQaLedger,
  TARGET_BEATS,
} from '../scripts/test-hay-dep-video001-schnell-qa-retry.mjs';

describe('FINAL GATE 1 PRE-FLIGHT: Hardened Retry Harness Tests', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'schnell-harness-hardening-'));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  function createInitialLedger() {
    return {
      runStatus: 'IN_PROGRESS',
      updatedAt: new Date().toISOString(),
      operationalMetrics: {
        baselineImagesReused: 9,
        apiRequestsSinceMigration: 0,
        successfulGenerationCallsSinceMigration: 0,
        failedApiRequestsSinceMigration: 0,
      },
      beats: [
        {
          beatId: 'beat-06',
          status: 'NEEDS_GENERATION',
          nextAttempt: 2,
          selectedAttempt: null,
          selectedFile: null,
          attempts: [
            {
              attempt: 1,
              file: 'beat-06-attempt-01.jpg',
              generationStatus: 'SUCCESS',
              qaStatus: 'COMPLETED',
              style: 'PASS',
              peopleContract: 'PASS',
              semanticFidelity: 'PASS',
              anatomy: 'PASS',
              textPollution: 'FAIL',
              overall: 'FAIL',
              reasons: ['text pollution'],
            },
          ],
          generationErrors: [],
        },
      ],
    };
  }

  // --- Test 1: Mutated frozen prompt blocks generation preflight ---
  it('Test 1: Frozen prompt mutated after initialization blocks generation preflight', async () => {
    // Setup dummy source prompts
    const dummySource: Record<string, any> = {};
    const dummyFrozen: Record<string, any> = {};
    for (const b of TARGET_BEATS) {
      dummySource[b] = { prompt: `Prompt text for ${b}` };
      dummyFrozen[b] = {
        prompt: b === 'beat-06' ? 'Mutated prompt text!' : `Prompt text for ${b}`,
      };
    }

    const sourcePath = path.join(tmpDir, 'source-prompts.json');
    fs.writeFileSync(sourcePath, JSON.stringify(dummySource));

    const frozenPath = path.join(tmpDir, 'prompts-frozen.json');
    fs.writeFileSync(frozenPath, JSON.stringify(dummyFrozen));

    const ledger = createInitialLedger();
    saveQaLedger(ledger, tmpDir);

    await expect(generateNextCandidate(tmpDir, sourcePath)).rejects.toThrow(
      /FROZEN_PROMPT_MISMATCH/
    );
  });

  // --- Test 2: Duplicate generation attempt number throws ---
  it('Test 2: Duplicate generation attempt number throws error', () => {
    const ledger = createInitialLedger();
    const mockImageBuffer = Buffer.from('fake-jpeg-data');

    // First success on attempt 2
    handleGenerationSuccess('beat-06', 2, mockImageBuffer, ledger, tmpDir);

    // Reset status to NEEDS_GENERATION with nextAttempt: 2 to simulate duplicate collision
    ledger.beats[0].status = 'NEEDS_GENERATION';
    ledger.beats[0].nextAttempt = 2;

    expect(() => {
      handleGenerationSuccess('beat-06', 2, mockImageBuffer, ledger, tmpDir);
    }).toThrow(/Duplicate attempt/);
  });

  // --- Test 3: Wrong nextAttempt throws ---
  it('Test 3: Wrong nextAttempt throws error', () => {
    const ledger = createInitialLedger(); // nextAttempt is 2
    const mockImageBuffer = Buffer.from('fake-jpeg-data');

    expect(() => {
      handleGenerationSuccess('beat-06', 3, mockImageBuffer, ledger, tmpDir);
    }).toThrow(/Attempt number mismatch/);
  });

  // --- Test 4: QA can only target latest PENDING attempt ---
  it('Test 4: QA can only target latest PENDING attempt', () => {
    const ledger = createInitialLedger();
    const mockImageBuffer = Buffer.from('fake-jpeg-data');

    // Attempt 1 is already COMPLETED
    expect(() => {
      recordVisualQa({
        beatId: 'beat-06',
        attempt: 1,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        reasons: [],
        ledger,
        baseDir: tmpDir,
      });
    }).toThrow(/expected AWAITING_QA/);

    // Now generate attempt 2 properly
    handleGenerationSuccess('beat-06', 2, mockImageBuffer, ledger, tmpDir);
    expect(ledger.beats[0].status).toBe('AWAITING_QA');

    // Trying to QA attempt 1 while awaiting attempt 2 QA throws
    expect(() => {
      recordVisualQa({
        beatId: 'beat-06',
        attempt: 1,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        reasons: [],
        ledger,
        baseDir: tmpDir,
      });
    }).toThrow(/not the latest attempt/);
  });

  // --- Test 5: Duplicate QA throws ---
  it('Test 5: Duplicate QA throws error', () => {
    const ledger = createInitialLedger();
    const mockImageBuffer = Buffer.from('fake-jpeg-data');
    handleGenerationSuccess('beat-06', 2, mockImageBuffer, ledger, tmpDir);

    // Complete QA on attempt 2
    recordVisualQa({
      beatId: 'beat-06',
      attempt: 2,
      style: 'PASS',
      peopleContract: 'PASS',
      semanticFidelity: 'PASS',
      anatomy: 'PASS',
      textPollution: 'PASS',
      reasons: [],
      ledger,
      baseDir: tmpDir,
    });
    expect(ledger.beats[0].status).toBe('SELECTED');

    // Attempting QA again on attempt 2 throws because status is SELECTED (not AWAITING_QA)
    expect(() => {
      recordVisualQa({
        beatId: 'beat-06',
        attempt: 2,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'PASS',
        reasons: [],
        ledger,
        baseDir: tmpDir,
      });
    }).toThrow(/expected AWAITING_QA/);
  });

  // --- Test 6: Attempt 3 cannot exhaust unless attempts 1, 2, 3 all real + QA FAIL ---
  it('Test 6: Attempt 3 cannot exhaust unless attempts 1, 2, 3 all real + QA FAIL', () => {
    const ledger = createInitialLedger();
    const mockImageBuffer = Buffer.from('fake-jpeg-data');

    // Create an invalid state: jump straight to attempt 3 without attempt 2 being completed
    ledger.beats[0].attempts.push({
      attempt: 3,
      file: 'beat-06-attempt-03.jpg',
      generationStatus: 'SUCCESS',
      qaStatus: 'PENDING',
    });
    ledger.beats[0].status = 'AWAITING_QA';
    fs.writeFileSync(path.join(tmpDir, 'beat-06-attempt-03.jpg'), mockImageBuffer);

    // Recording FAIL on attempt 3 without attempt 2 must throw State integrity error
    expect(() => {
      recordVisualQa({
        beatId: 'beat-06',
        attempt: 3,
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'FAIL',
        reasons: ['fail attempt 3'],
        ledger,
        baseDir: tmpDir,
      });
    }).toThrow(/State integrity error/);
    expect(ledger.beats[0].status).not.toBe('EXHAUSTED');
  });

  // --- Test 7: --record-qa input validation and execution ---
  it('Test 7: --record-qa CLI validates input fields, records valid transition, and rejects missing fields', () => {
    const ledger = createInitialLedger();
    const mockImageBuffer = Buffer.from('fake-jpeg-data');
    handleGenerationSuccess('beat-06', 2, mockImageBuffer, ledger, tmpDir);
    saveQaLedger(ledger, tmpDir);

    // Invalid QA json with missing fields
    const invalidQaFile = path.join(tmpDir, 'invalid-qa.json');
    fs.writeFileSync(invalidQaFile, JSON.stringify({ style: 'PASS', textPollution: 'INVALID_VALUE' }));

    expect(() => {
      executeRecordQaCli('beat-06', 2, invalidQaFile, tmpDir);
    }).toThrow();

    // Valid QA json
    const validQaFile = path.join(tmpDir, 'valid-qa.json');
    fs.writeFileSync(
      validQaFile,
      JSON.stringify({
        style: 'PASS',
        peopleContract: 'PASS',
        semanticFidelity: 'PASS',
        anatomy: 'PASS',
        textPollution: 'FAIL',
        reasons: ['signature in lower right'],
      })
    );

    const updatedBeat = executeRecordQaCli('beat-06', 2, validQaFile, tmpDir);
    expect(updatedBeat.status).toBe('NEEDS_GENERATION');
    expect(updatedBeat.nextAttempt).toBe(3);

    const reloaded = loadQaLedger(tmpDir);
    expect(reloaded.beats[0].status).toBe('NEEDS_GENERATION');
  });

  // --- Test 8: Persisted API metrics survive save/reload ---
  it('Test 8: Persisted API metrics survive save/reload in ledger', () => {
    const ledger = createInitialLedger();
    ledger.operationalMetrics = {
      baselineImagesReused: 9,
      apiRequestsSinceMigration: 4,
      successfulGenerationCallsSinceMigration: 3,
      failedApiRequestsSinceMigration: 1,
    };

    saveQaLedger(ledger, tmpDir);
    const reloaded = loadQaLedger(tmpDir);

    expect(reloaded.operationalMetrics).toEqual(ledger.operationalMetrics);
    const metrics = getMetrics(reloaded);
    expect(metrics.apiRequestsSinceMigration).toBe(4);
    expect(metrics.successfulGenerationCallsSinceMigration).toBe(3);
    expect(metrics.failedApiRequestsSinceMigration).toBe(1);
  });

  // --- Test 9: API request metric invariant ---
  it('Test 9: API request metric invariant is strictly enforced', () => {
    const ledger = createInitialLedger();
    // Intentionally violate invariant: total 5 != 3 + 1
    ledger.operationalMetrics = {
      baselineImagesReused: 9,
      apiRequestsSinceMigration: 5,
      successfulGenerationCallsSinceMigration: 3,
      failedApiRequestsSinceMigration: 1,
    };

    expect(() => {
      saveQaLedger(ledger, tmpDir);
    }).toThrow(/Metric invariant violated/);
  });

  // --- Test 10: Non-quota API error does not leave stale PAUSED_QUOTA ---
  it('Test 10: Non-quota API error does not leave stale PAUSED_QUOTA', () => {
    const ledger = createInitialLedger();
    ledger.runStatus = 'IN_PROGRESS';

    handleApiError('beat-06', 2, { httpStatus: 500, message: 'Internal Server Error' }, ledger);

    expect(ledger.runStatus).toBe('IN_PROGRESS');
    expect(ledger.beats[0].status).toBe('NEEDS_GENERATION');
    expect(ledger.beats[0].nextAttempt).toBe(2);
    expect(ledger.operationalMetrics.failedApiRequestsSinceMigration).toBe(1);
    expect(ledger.operationalMetrics.apiRequestsSinceMigration).toBe(1);
  });

  // --- Test 11: Migration does not fabricate generationErrors ---
  it('Test 11: Migration does not fabricate generationErrors', () => {
    const mockS6Qa = [
      { beatId: 'beat-02', overall: 'PASS', style: 'PASS', peopleContract: 'PASS', semanticFidelity: 'PASS', anatomy: 'PASS', textPollution: 'PASS' },
      { beatId: 'beat-04', overall: 'PASS', style: 'PASS', peopleContract: 'PASS', semanticFidelity: 'PASS', anatomy: 'PASS', textPollution: 'PASS' },
      { beatId: 'beat-06', overall: 'FAIL', style: 'PASS', peopleContract: 'PASS', semanticFidelity: 'PASS', anatomy: 'PASS', textPollution: 'FAIL' },
      { beatId: 'beat-07', overall: 'FAIL', style: 'PASS', peopleContract: 'FAIL', semanticFidelity: 'PASS', anatomy: 'PASS', textPollution: 'FAIL' },
      { beatId: 'beat-08', overall: 'PASS', style: 'PASS', peopleContract: 'PASS', semanticFidelity: 'PASS', anatomy: 'PASS', textPollution: 'PASS' },
      { beatId: 'beat-09', overall: 'FAIL', style: 'PASS', peopleContract: 'PASS', semanticFidelity: 'PASS', anatomy: 'PASS', textPollution: 'FAIL' },
      { beatId: 'beat-10', overall: 'FAIL', style: 'PASS', peopleContract: 'FAIL', semanticFidelity: 'PASS', anatomy: 'PASS', textPollution: 'FAIL' },
      { beatId: 'beat-12', overall: 'FAIL', style: 'PASS', peopleContract: 'FAIL', semanticFidelity: 'PASS', anatomy: 'FAIL', textPollution: 'PASS' },
      { beatId: 'beat-15', overall: 'FAIL', style: 'PASS', peopleContract: 'PASS', semanticFidelity: 'PASS', anatomy: 'PASS', textPollution: 'FAIL' },
    ];

    const s6Dir = path.join(tmpDir, 's6');
    fs.mkdirSync(s6Dir);
    fs.writeFileSync(path.join(s6Dir, 'qa.json'), JSON.stringify(mockS6Qa));

    for (const item of mockS6Qa) {
      fs.writeFileSync(path.join(s6Dir, `${item.beatId}.jpg`), 'fake');
    }

    const targetDir = path.join(tmpDir, 'target');
    const migrated = migrateFromS6Baseline(targetDir, s6Dir);

    for (const beat of migrated.beats) {
      expect(beat.generationErrors).toEqual([]);
    }
    expect(migrated.migrationNote).toContain('Previous run was reported quota-blocked');
    expect(migrated.operationalMetrics.apiRequestsSinceMigration).toBe(0);
    expect(migrated.operationalMetrics.successfulGenerationCallsSinceMigration).toBe(0);
    expect(migrated.operationalMetrics.failedApiRequestsSinceMigration).toBe(0);
  });
});
