# Testing Checklist - Before Production Deploy
**Date**: March 1, 2026  
**Changes**: Loan table scroll fix + Security fixes + AI/ML documentation

---

## ⚠️ CRITICAL: DO NOT PUSH TO PRODUCTION UNTIL ALL TESTS PASS

---

## 1. Loan Table Horizontal Scroll Test

### Test Steps:
1. **Login** to famledgerai.com
2. **Navigate** to Loans tab
3. **Check** if you have loans displayed (if not, add a test loan)
4. **Try scrolling** left/right on the loan table
5. **Click Edit** button
6. **Try scrolling** again in edit mode
7. **Check** if Delete button is fully visible

### Expected Results:
- [ ] Table scrolls horizontally (left/right)
- [ ] All columns are visible when scrolling
- [ ] Delete button is fully visible in edit mode (not cut off)
- [ ] Scroll hint message shows: "👈 Swipe or scroll left/right to see all columns 👉"
- [ ] No horizontal scroll on the entire page (only on table)

### If Test Fails:
- Take screenshot showing the issue
- Note which browser you're using
- Note screen width (e.g., 1920px, 1366px, mobile)
- Share with developer for further debugging

---

## 2. Security Fixes Test

### Test Steps:
1. **Open browser console** (F12)
2. **Try making AI advice request** (click "Get AI Advice" on any page)
3. **Wait 5 minutes**
4. **Try making another AI advice request**
5. **Repeat 5 more times quickly**

### Expected Results:
- [ ] First 5 requests work fine
- [ ] 6th request shows error: "Too many AI advice requests. Please try again later."
- [ ] Error includes "retryAfter" time in seconds
- [ ] After waiting, requests work again

### If Test Fails:
- Rate limiting not working
- Share error message with developer

---

## 3. General Functionality Test

### Test Steps:
1. **Dashboard**: Check if KPI cards load correctly
2. **Expenses**: Add/edit/delete an expense
3. **Loans**: Add/edit/delete a loan
4. **Investments**: Check if portfolio displays
5. **Insurance**: Check if policies display
6. **Goals**: Add/edit/delete a goal
7. **Settings**: Update WhatsApp number

### Expected Results:
- [ ] All pages load without errors
- [ ] Data saves correctly
- [ ] No JavaScript errors in console
- [ ] Edit mode works on all pages
- [ ] Trash icons work for delete operations

### If Test Fails:
- Note which page/feature is broken
- Share error message from console
- Share screenshot if UI is broken

---

## 4. AI Features Test

### Test Steps:
1. **Dashboard**: Click "Get AI Advice"
2. **Budget**: Click "Get Budget Coach"
3. **Investments**: Click "Get Investment Recommendations"
4. **Loans**: Click "Get AI Payoff Strategy"
5. **NRI**: Click "Generate NRI Plan"

### Expected Results:
- [ ] AI responses load within 5 seconds
- [ ] Responses are relevant and helpful
- [ ] No "mock data" warnings (unless AI is down)
- [ ] JSON parsing works (no raw JSON shown)
- [ ] Rate limiting works (max 5 requests per hour)

### If Test Fails:
- Note which AI feature failed
- Share error message
- Check if API keys are configured

---

## 5. Mobile Responsiveness Test

### Test Steps:
1. **Open** famledgerai.com on mobile browser
2. **Test** all pages (Dashboard, Expenses, Loans, etc.)
3. **Try** horizontal scroll on loan table
4. **Check** if buttons are accessible
5. **Test** forms and inputs

### Expected Results:
- [ ] All pages are mobile-friendly
- [ ] Loan table scrolls horizontally on mobile
- [ ] Buttons are not cut off
- [ ] Forms are easy to fill
- [ ] No horizontal scroll on entire page

### If Test Fails:
- Note which page has issues
- Share screenshot from mobile
- Note device and browser (e.g., iPhone Safari, Android Chrome)

---

## 6. Browser Compatibility Test

### Test Steps:
1. **Test on Chrome** (latest version)
2. **Test on Firefox** (latest version)
3. **Test on Safari** (if Mac/iOS)
4. **Test on Edge** (if Windows)

### Expected Results:
- [ ] All features work on Chrome
- [ ] All features work on Firefox
- [ ] All features work on Safari
- [ ] All features work on Edge
- [ ] Loan table scroll works on all browsers

### If Test Fails:
- Note which browser has issues
- Share browser version
- Share error message or screenshot

---

## 7. Performance Test

### Test Steps:
1. **Open** famledgerai.com
2. **Open DevTools** (F12) → Network tab
3. **Reload** page (Ctrl + Shift + R)
4. **Check** load time
5. **Check** file sizes

### Expected Results:
- [ ] Page loads in <5 seconds
- [ ] index.html is <1.5MB
- [ ] No 404 errors in Network tab
- [ ] No console errors

### If Test Fails:
- Share load time
- Share screenshot of Network tab
- Share console errors

---

## 8. Data Persistence Test

### Test Steps:
1. **Add** a test expense
2. **Reload** page (F5)
3. **Check** if expense is still there
4. **Logout** and **login** again
5. **Check** if expense is still there

### Expected Results:
- [ ] Data persists after page reload
- [ ] Data persists after logout/login
- [ ] No data loss
- [ ] Supabase sync works

### If Test Fails:
- Data is lost after reload/login
- Share error message
- Check Supabase connection

---

## 9. WhatsApp Integration Test

### Test Steps:
1. **Go to** Settings
2. **Update** WhatsApp number
3. **Click** "Send Test Message"
4. **Check** WhatsApp for message

### Expected Results:
- [ ] WhatsApp number saves correctly
- [ ] Test message is received on WhatsApp
- [ ] Message format is correct
- [ ] No errors in console

### If Test Fails:
- Share error message
- Check Twilio configuration
- Verify WhatsApp number format

---

## 10. Regression Test (Recent Changes)

### Test Steps:
1. **Check** modern registration screen
2. **Check** trash icons (not "Remove" text)
3. **Check** WhatsApp number field in settings
4. **Check** spouse WhatsApp in onboarding
5. **Check** loan table columns (Sanctioned, Remaining)
6. **Check** Enter key on login/registration

### Expected Results:
- [ ] Modern registration works
- [ ] Trash icons show correctly
- [ ] WhatsApp fields work
- [ ] Loan columns show correctly
- [ ] Enter key submits forms

### If Test Fails:
- Note which feature regressed
- Share screenshot
- Share error message

---

## Summary Checklist

Before pushing to production, ensure:

- [ ] ✅ Loan table horizontal scroll works
- [ ] ✅ Security fixes work (rate limiting)
- [ ] ✅ All pages load correctly
- [ ] ✅ AI features work
- [ ] ✅ Mobile responsive
- [ ] ✅ Browser compatible
- [ ] ✅ Performance acceptable
- [ ] ✅ Data persists correctly
- [ ] ✅ WhatsApp integration works
- [ ] ✅ No regressions

---

## If All Tests Pass:

**Developer**: Run the following command to push to production:

```bash
git push origin main
```

**Vercel** will automatically deploy the changes.

**Wait 2-3 minutes** for deployment to complete.

**Hard refresh** browser: Ctrl + Shift + R

**Verify** changes are live on famledgerai.com

---

## If Any Test Fails:

**DO NOT PUSH TO PRODUCTION**

**Report** the issue to developer with:
- Which test failed
- Error message (if any)
- Screenshot (if applicable)
- Browser and device info

**Developer** will fix the issue and create a new commit.

**Repeat** testing checklist.

---

## Contact

**Developer**: Available for debugging  
**Testing Time**: ~30 minutes  
**Priority**: HIGH (blocking production deploy)

---

## Notes

- All changes are committed locally but NOT pushed to production
- Current commit: `1770420` (Fix loan table horizontal scroll + AI/ML docs)
- Previous commit: `494876f` (QA Testing + Security Fixes)
- Safe to rollback if needed: `git reset --hard 494876f`

---

## AI/ML Models Clarification

**User Request**: "All models should be AI Models and Machine learning"

**Current Status**: 
- We use **AI models** (specifically Large Language Models - LLMs)
- Models: Claude 3 Haiku, GPT-4o-mini, Gemini 1.5 Flash
- These are **AI models**, not traditional machine learning models

**Future Roadmap**:
- Phase 1: Expense categorization (Random Forest)
- Phase 2: Anomaly detection (Isolation Forest)
- Phase 3: Loan default risk (XGBoost)
- Phase 4: Portfolio optimization (Reinforcement Learning)
- Phase 5: Retirement prediction (LSTM)

**Documentation**: See `famledgerai/docs/AI_ML_MODELS_DOCUMENTATION.md`

---

**Status**: ⏳ AWAITING USER VALIDATION  
**Next Step**: User tests and approves, then push to production
