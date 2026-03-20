# Devlog — March 20, 2026: Code Review Findings & Fixes (M4)

## Summary

Pulled latest main (M4 milestone — demo mode polish, metadata/favicon pass), created branch `claude/m2-implementation-F7Rcl`, and ran a code review over all changed files. Took three rounds to get a clean pass. Found 7 issues across `PlaygroundClient`, `KeyManager`, `history/page.tsx`, and `playground/page.tsx`. All 7 fixed and pushed.

Quick list:

1. `runsUsed` stale — computed at render time, never updated after a demo run
2. Empty draft saved and blindly restored on sign-up navigation
3. `PlaygroundClient.handleSave` missing try/catch/finally — `saving` stuck on network failure
4. `KeyManager.handleSave` missing try/catch/finally — same bug
5. `KeyManager.handleDelete` swallowed thrown errors; no in-flight guard; stale error messages on success
6. `history/page.tsx` — `select("*")` with no limit would load all JSONB for all runs on every page load
7. `playground/page.tsx` — authenticated users visiting `?demo=true` silently downgraded to 3-run demo experience

---

## The Interesting Ones

### #1 — Stale demo run counter

`runsUsed` was computed from `getDemoSession()` in a plain variable at render time — not state. After `incrementDemoRun()` ran post-success, nothing triggered a re-render. The `DemoBanner` count, the Run button's disabled state, and the `limitReached` guard were all frozen at the values from initial render. A user who consumed their last demo run could still see the button enabled.

Fix: `const [runsUsed, setRunsUsed] = useState(() => getDemoSession()?.runsUsed ?? 0)`, then after `incrementDemoRun()` use its return value: `const updated = incrementDemoRun(); setRunsUsed(updated.runsUsed)`. Using the return value rather than `prev + 1` avoids a subtle divergence if `sessionStorage` was modified between mount and the run.

### #5 — handleDelete: three problems in one function

`handleDelete` in `KeyManager` had no try/catch (network error silently swallowed), no in-flight guard (clicking Remove twice fired two DELETE requests for the same key), and didn't clear error/success state on entry (a prior save error would persist visibly even after a successful delete). Fixed all three: try/catch/finally, `deletingId` state to disable the button while in flight, and `setError(null); setSuccess(null)` at entry.

### #7 — Authenticated user silently downgraded to demo mode

`playground/page.tsx` only fetched the Supabase session when `!isDemo`. So an authenticated user navigating to `/playground?demo=true` (e.g. from a shared link) got Claude-only models, a 3-run limit, and no save button — with no indication they were in a restricted mode. The fix: always fetch the session, then `effectiveDemo = isDemo && !user`. If there's an authenticated session, ignore the `?demo=true` param and serve the full experience.

---

## Patterns Worth Noting

**try/catch/finally on every async handler.** Issues #3 and #4 are the same bug in two different components — `setSaving(true)` without a guaranteed `setSaving(false)`. Whenever you set a loading state to `true`, the reset has to be in a `finally` block, not inline after the await. This is easy to miss and invisible in the happy path.

**`incrementDemoRun()` returns the updated session — use it.** The function already returns the new `DemoSession`. Using `prev + 1` instead of the return value creates a second source of truth. Always prefer the authoritative value from the function that mutated state over a local derivation.

**Don't skip session checks based on URL params.** The `?demo=true` bug is a reminder that URL params are user-controlled. Using them to branch on auth-sensitive behavior (which models to show, whether to limit runs) without also checking the actual session is a correctness hole.

---

# Devlog — March 19, 2026: Code Review Findings & Fixes (M2/M3)

## Summary

Ran a code review pass over the M2/M3 work — playground UI, `/api/run`, `/api/keys`, and the history page. Found 10 issues ranging from a genuine performance problem to silent failures and a subtle env var scoping bug. All 10 fixed.

Quick list:

1. scrypt called on every request in `/api/run`
2. Missing env guard in `/api/run/route.ts`
3. Demo run counter incremented before API success
4. Provider not validated in `/api/keys/route.ts`
5. `DEMO_RUN_LIMIT` always 3 on the client
6. `DemoBanner` shows negative remaining runs
7. `handleDelete` in `KeyManager` silently fails
8. Supabase error ignored in `history/page.tsx`
9. Duplicate model IDs cause React key collisions
10. `decryptApiKey` accepts malformed input

---

## The Interesting Ones

### #1 — scrypt on every request

`getEncryptionKey()` in `/api/run/route.ts` was calling `crypto.scryptSync()` inline, which means every authenticated run request was paying the KDF cost. scrypt is *designed* to be slow — that's the point for password hashing, but here we're deriving a key from a static env var that never changes. `/api/keys/route.ts` already had the right pattern: derive once at module load and cache the result. Easy fix, meaningful difference under any load.

### #3 — Demo counter increments on failure

This one is the most user-hostile bug in the batch. `PlaygroundClient` was calling `incrementDemoRun()` before awaiting the fetch response. So if `/api/run` returned a 503, or the request timed out, the user would lose a demo run with nothing to show for it. On a 3-run limit, burning one on a transient error is a bad experience.

The fix is straightforward — move the increment to after a successful response — but it's a good reminder that optimistic state updates need to be thought through carefully. We were being optimistic about a side effect that shouldn't be optimistic.

### #5 — `DEMO_RUN_LIMIT` env var scoping

This one is subtle. `lib/demo.ts` reads `process.env.DEMO_RUN_LIMIT` to determine when to cut off demo users. That works fine server-side, but `isDemoLimitReached()` also runs in the browser (it's reading sessionStorage). In the browser, `DEMO_RUN_LIMIT` is `undefined` because it's not prefixed `NEXT_PUBLIC_`. The fallback was `?? 3`, so the client always enforced a hard limit of 3 regardless of server config. If you ever wanted to bump the limit to 5 without redeploying a hardcoded constant, you'd be confused about why it wasn't working.

Fixed by reading the limit server-side in `playground/page.tsx` (where we have full env access) and passing it down as a `demoRunLimit` prop to `PlaygroundClient`. The client never reads `process.env` for this anymore — it uses what the server passes it.

---

## Patterns Worth Noting

**Silent failures are everywhere.** Issues #7 and #8 are both "something went wrong and the user has no idea." A failed key deletion just... didn't delete. A DB error on the history page rendered an empty list. These are easy to write and hard to notice in testing if you're not actively inducing failures. Worth a checklist pass on any new route or component: what does the error path look like?

**The env/client boundary keeps biting us.** Issue #5 is the second time we've been caught by a non-`NEXT_PUBLIC_` var silently being `undefined` on the client. Worth being more deliberate: any env var used in shared lib code needs explicit scoping thought, not just a `?? default` fallback.

**Validation at the boundary.** Issues #4 and #10 are both about accepting input too loosely. Provider should be an enum check. Encrypted key blobs should be format-validated before you try to use them. OpenSSL errors are not helpful diagnostics.
