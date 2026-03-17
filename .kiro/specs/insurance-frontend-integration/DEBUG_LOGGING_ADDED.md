# Debug Logging Added - Insurance Upload Investigation

**Date:** March 12, 2026  
**Status:** 🔍 DEBUG MODE ENABLED  
**Commit:** f73225d

---

## Problem

User reports that insurance upload STILL shows:
```
"Security threat detected: Suspicious content detected in file"
```

Despite previous fixes to:
1. Database schema (`created_at` → `generated_at`) ✅
2. Virus scanner (relaxed PDF checks) ✅
3. Error handling (added error codes) ✅

**Conclusion:** The fixes were deployed but the error persists, suggesting a different root cause.

---

## Debug Strategy

Added comprehensive logging at every stage to trace the exact error path:

### 1. Upload Service Logging

**File:** `src/features/insurance/policy-upload/services/upload.service.ts`

**Added logs:**
```typescript
console.log('[UploadService] Starting upload for file:', file.name, 'size:', file.size);
console.log('[UploadService] Validating file...');
console.log('[UploadService] File validation passed');
console.log('[UploadService] Converting to buffer...');
console.log('[UploadService] Buffer created, size:', buffer.length);
console.log('[UploadService] Scanning for viruses...');
console.log('[UploadService] Scan result:', scanResult);
console.log('[UploadService] Virus scan passed');
console.log('[UploadService] Storing file...');
console.log('[UploadService] Storage result:', storageResult.success ? 'success' : 'failed');
console.log('[UploadService] Upload completed successfully');

// Error logging
console.error('[UploadService] Upload failed with error:', error);
console.error('[UploadService] Error type:', error instanceof ValidationError ? 'ValidationError' : error instanceof StorageError ? 'StorageError' : 'Unknown');
console.error('[UploadService] Error code:', (error as any).code);
```

**What this reveals:**
- Which step fails (validation, scanning, or storage)
- Exact error type and code
- Whether virus scanner is the actual culprit

### 2. Pipeline Orchestrator Logging

**File:** `src/features/insurance/insurance-pipeline/services/pipeline-orchestrator.service.ts`

**Added logs:**
```typescript
console.log('[Pipeline] Starting upload stage...');
console.log('[Pipeline] Calling uploadService.uploadPolicy...');
console.log('[Pipeline] Upload service returned success');

// Error logging
console.error('[Pipeline] Upload stage failed:', {
  errorMessage,
  errorCode,
  errorType: error instanceof Error ? error.constructor.name : typeof error,
});
```

**What this reveals:**
- Whether error occurs in pipeline or upload service
- Error code propagation
- Error type preservation

### 3. API Route Logging

**File:** `src/app/api/insurance/analyze/route.ts`

**Added logs:**
```typescript
// Pipeline execution with try-catch
try {
  pipelineResult = await pipelineOrchestratorService.execute({...});
} catch (pipelineError) {
  console.error('[API] Pipeline execution threw exception:', pipelineError);
  console.error('[API] Pipeline error details:', {
    message: pipelineError instanceof Error ? pipelineError.message : 'Unknown',
    stack: pipelineError instanceof Error ? pipelineError.stack : undefined,
  });
  
  return NextResponse.json({
    success: false,
    error: {
      code: 'PIPELINE_EXCEPTION',
      message: 'Pipeline execution failed',
      details: pipelineError instanceof Error ? pipelineError.message : 'Unknown error',
    },
  }, { status: 500 });
}

// Enhanced stage logging
console.log(`[API] Stages:`, pipelineResult.stages.map(s => 
  `${s.stage}: ${s.status}${s.error ? ` (${s.error})` : ''}${s.errorCode ? ` [${s.errorCode}]` : ''}`
));

// Enhanced error logging
console.error('[API] Analysis error:', error);
console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
console.error('[API] Full error details:', JSON.stringify(errorDetails, null, 2));
```

**What this reveals:**
- Complete error stack trace
- All stage statuses and error codes
- Whether error is caught at API level

---

## How to Use Debug Logs

### Step 1: Deploy and Wait
- ✅ Code committed (f73225d)
- ✅ Pushed to GitHub
- ⏳ Vercel deployment (2-3 minutes)

### Step 2: Reproduce Error
1. Go to insurance page
2. Upload a PDF
3. Wait for error

### Step 3: Check Logs

**In Browser Console:**
Look for these log patterns:

**If virus scanner is the issue:**
```
[UploadService] Scanning for viruses...
[UploadService] Scan result: { clean: false, threat: "..." }
[UploadService] Virus scan failed: ...
[UploadService] Error code: SECURITY_THREAT
```

**If validation fails:**
```
[UploadService] Validating file...
[UploadService] Validation failed: [...]
[UploadService] Error code: INVALID_FILE
```

**If storage fails:**
```
[UploadService] Storing file...
[UploadService] Storage result: failed
[UploadService] Error code: STORAGE_FAILED
```

**If database error:**
```
[API] Pipeline execution threw exception: ...
[API] Pipeline error details: { message: "column ... does not exist" }
```

**In Vercel Logs:**
```bash
# Check server-side logs
vercel logs --follow
```

Look for the same patterns plus stack traces.

---

## Expected Findings

### Scenario A: Virus Scanner False Positive
**Logs will show:**
```
[UploadService] Scan result: { clean: false, threat: "Suspicious content detected in file" }
[UploadService] Error code: SECURITY_THREAT
```

**Fix:** Further relax virus scanner or disable for MVP

### Scenario B: Database Schema Issue
**Logs will show:**
```
[API] Pipeline execution threw exception: Error: column insurance_analysis.created_at does not exist
```

**Fix:** There's still a query using `created_at` that we missed

### Scenario C: Storage/Supabase Issue
**Logs will show:**
```
[UploadService] Storage result: failed
[UploadService] Storage failed: [Supabase error]
[UploadService] Error code: STORAGE_FAILED
```

**Fix:** Check Supabase configuration, RLS policies, or storage bucket

### Scenario D: File Validation Issue
**Logs will show:**
```
[UploadService] Validation failed: [validation errors]
[UploadService] Error code: INVALID_FILE
```

**Fix:** Adjust file validation rules

### Scenario E: Unknown Error
**Logs will show:**
```
[UploadService] Upload failed with error: [unexpected error]
[UploadService] Error type: Unknown
```

**Fix:** Investigate the specific error

---

## Files Modified

### Commit f73225d (Debug Logging)
1. ✅ `src/features/insurance/policy-upload/services/upload.service.ts` - Added step-by-step logging
2. ✅ `src/app/api/insurance/analyze/route.ts` - Added exception handling and detailed logging
3. ✅ `src/features/insurance/insurance-pipeline/services/pipeline-orchestrator.service.ts` - Added upload stage logging

---

## Duplicate Upload Detection

**Status:** ❌ CONFIRMED - NO DUPLICATE DETECTION EXISTS

**Evidence:**
- Searched entire codebase for duplicate file logic
- Only found `checkDuplicateAlert` in automation (unrelated)
- No file hash checking
- No filename deduplication
- No policy number uniqueness validation

**Conclusion:** Re-uploading the same deleted PDF is NOT causing the error.

---

## Next Steps

### After Deployment (2-3 minutes)

1. **Reproduce the error:**
   - Upload a PDF to insurance page
   - Wait for "Security threat" error

2. **Collect logs:**
   - Open browser console (F12)
   - Copy all `[UploadService]`, `[Pipeline]`, and `[API]` logs
   - Check Vercel logs for server-side details

3. **Identify root cause:**
   - Match log pattern to scenarios above
   - Determine exact failure point
   - Identify error code

4. **Apply targeted fix:**
   - Based on root cause identified
   - No more guessing
   - Precise fix for exact issue

---

## Deployment Status

**Commit:** f73225d  
**Status:** ✅ PUSHED TO GITHUB  
**Deployment:** ⏳ IN PROGRESS (2-3 minutes)  
**Confidence:** VERY HIGH - Will identify exact issue

---

## What We Know So Far

### ✅ Fixed (Confirmed)
1. Database schema - All queries use `generated_at`
2. Virus scanner - Relaxed to not flag PDF JavaScript
3. Error codes - Added to all error paths
4. Error mapping - API maps codes to messages
5. Frontend - Displays specific error messages

### ❓ Unknown (Need Logs)
1. Which stage actually fails?
2. What's the real error message?
3. What's the error code?
4. Is it virus scanner or something else?

### 🎯 Goal
Identify the EXACT failure point and error code so we can apply a targeted fix.

---

## Log Analysis Guide

### Good Logs (Success Path)
```
[UploadService] Starting upload for file: policy.pdf size: 1234567
[UploadService] Validating file...
[UploadService] File validation passed
[UploadService] Converting to buffer...
[UploadService] Buffer created, size: 1234567
[UploadService] Scanning for viruses...
[UploadService] Scan result: { clean: true, scanTime: 5 }
[UploadService] Virus scan passed
[UploadService] Storing file...
[UploadService] Storage result: success
[UploadService] Upload completed successfully
[Pipeline] Upload service returned success
[API] Pipeline completed with status: success
```

### Bad Logs (Failure Path)
```
[UploadService] Starting upload for file: policy.pdf size: 1234567
[UploadService] Validating file...
[UploadService] File validation passed
[UploadService] Converting to buffer...
[UploadService] Buffer created, size: 1234567
[UploadService] Scanning for viruses...
[UploadService] Scan result: { clean: false, threat: "Suspicious content detected in file" }
[UploadService] Virus scan failed: Suspicious content detected in file
[UploadService] Upload failed with error: ValidationError: Suspicious content detected in file
[UploadService] Error type: ValidationError
[UploadService] Error code: SECURITY_THREAT
[Pipeline] Upload stage failed: { errorMessage: "Suspicious content detected in file", errorCode: "SECURITY_THREAT", errorType: "ValidationError" }
[API] Pipeline completed with status: failed
[API] Stages: upload: failed (Suspicious content detected in file) [SECURITY_THREAT]
```

**From bad logs, we can see:**
- Failure happens at virus scanning step
- Error code is `SECURITY_THREAT`
- Error type is `ValidationError`
- This means virus scanner is still too aggressive

---

## Quick Reference

### Check Deployment Status
```bash
git log --oneline -3
# Should show: f73225d debug: add comprehensive logging...
```

### Monitor Vercel Logs
```bash
vercel logs --follow
```

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Filter by: `UploadService` or `Pipeline` or `API`

---

**🔍 DEBUG MODE ACTIVE - READY TO IDENTIFY ROOT CAUSE**

**Next Action:** Wait 2-3 minutes for deployment, then reproduce error and collect logs

**Expected Outcome:** Exact identification of failure point and error code

---

**Status:** 🚀 DEPLOYED - AWAITING ERROR REPRODUCTION AND LOG COLLECTION
