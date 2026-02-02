# AUDIT REPORT - PHASE 2: Session Saving Failure

## Findings

### 1. Masking of Authentication Errors
In `app/src/logic/SupabaseService.js`, the `saveSessionLog` function wraps the entire logic in a `try-catch` block that throws a generic "Fallo de conexión" error.
- **Problem:** If `getUserId()` returns null (session expired), an error is thrown but then caught and replaced by the generic connection error. The user is never told they need to log in again.
- **Location:** `app/src/logic/SupabaseService.js` lines 18 and 81.

### 2. Sync Queue Duplication Bug
The retry logic is flawed:
- `processSyncQueue` iterates over the queue and calls `this.saveSessionLog(log)`.
- If `saveSessionLog` fails, it calls `this.queueForRetry(log)`, which pushes the item back into `localStorage`.
- Then `processSyncQueue` catches the error and pushes the item into `remainingQueue`.
- **Result:** Every failed sync attempt potentially duplicates the session in the queue.
- **Location:** `app/src/logic/SupabaseService.js` lines 80 and 110.

### 3. Data Integrity Confirmation
- The data is correctly saved in `localStorage` under `hx_session_draft_[sessionId]` and `hx_sync_queue`.
- **User Risk:** LOW for data loss (as long as they don't clear their browser cache), but HIGH for frustration as they cannot finalize the session.

## Recommendations
- [ ] Refactor `SupabaseService.js` to handle different error types (Auth vs Network).
- [ ] Decouple queue management from the low-level `saveSessionLog`.
- [ ] Update `SessionForm.jsx` to show more specific error messages.
