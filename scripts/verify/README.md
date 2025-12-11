# Verification Scripts

This directory contains development verification scripts used during the implementation of Skills System 2.0.

## Purpose

These scripts were created to verify individual features during development:

- `verify-action-grouper.ts` - Tests action grouping logic
- `verify-action-recorder-grouping.ts` - Tests action recorder with grouping
- `verify-finish-recording-integration.ts` - Tests finish recording workflow
- `verify-schema-generator.ts` - Tests schema generation from goals
- `verify-validation.ts` - Tests result validation logic
- `verify-variable-detector.ts` - Tests variable detection and mapping
- `verify-variable-substitution.ts` - Tests variable substitution in execution
- `verify-zod-schema-builder.ts` - Tests Zod schema builder

## Usage

These scripts can be run with:

```bash
npx tsx scripts/verify/[script-name].ts
```

## Note

These are development-only scripts and are not part of the production codebase. They can be safely deleted after confirming all features work correctly in the full test suite (`tests/skills-system.test.ts`).

## Cleanup

Once the comprehensive test suite passes, these scripts can be removed:

```bash
rm -rf scripts/verify
```
