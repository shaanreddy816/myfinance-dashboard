# Modern Registration Screen - Testing Guide

## Quick Test Steps

### 1. Access Registration Screen
1. Open `https://famledgerai.com` (or local dev)
2. You should see the classic login screen
3. Click the "Register" tab
4. ✅ Modern split-screen registration should appear

### 2. Test Form Validation

#### Required Fields
1. Try clicking "Continue" without filling anything
2. ✅ Should show error: "Please enter your first and last name"

#### Email Validation
1. Fill first name: "Test"
2. Fill last name: "User"
3. Leave email empty, click "Continue"
4. ✅ Should show error: "Please enter your email address"

#### Password Validation
1. Fill email: "test@example.com"
2. Click on password field
3. ✅ Password requirements should appear below
4. Type "abc" → Requirements should show gray circles
5. Type "Abc123" → Requirements should show green checkmarks
6. ✅ At least 6 characters: ✓
7. ✅ Upper & lowercase: ✓
8. ✅ At least one number: ✓

#### Terms Checkbox
1. Fill all fields but don't check terms
2. Click "Continue"
3. ✅ Should show error: "Please agree to the Terms of Service"

### 3. Test WhatsApp Field (Optional)

#### Valid Number
1. Enter 10-digit number: "9876543210"
2. ✅ Should accept without error

#### Invalid Number
1. Enter letters or special characters
2. ✅ Should not allow (pattern validation)

#### Leave Empty
1. Don't fill WhatsApp field
2. ✅ Should still allow registration (optional field)

### 4. Test Password Toggle
1. Type password: "Test123"
2. Click the eye icon (👁️)
3. ✅ Password should become visible
4. Click again
5. ✅ Password should hide again

### 5. Test Sign In Link
1. Click "Sign in" link at bottom
2. ✅ Should return to classic login screen

### 6. Test Successful Registration

#### New User
1. Fill all required fields:
   - First name: "Shantan"
   - Last name: "Kumar"
   - Email: "shantan.test@example.com"
   - WhatsApp: "9876543210" (optional)
   - Password: "Test123"
2. Check terms checkbox
3. Click "Continue"
4. ✅ Should show: "Creating account..."
5. ✅ Should show success toast
6. ✅ Should redirect to onboarding or dashboard

#### Existing User
1. Try registering with same email again
2. ✅ Should show error: "This email is already registered. Please sign in instead."

### 7. Test Mobile Responsive

#### Tablet (768px)
1. Resize browser to 768px width
2. ✅ Left and right panels should stack vertically
3. ✅ All content should be readable

#### Mobile (375px)
1. Resize browser to 375px width
2. ✅ Form should be single column
3. ✅ Inputs should be touch-friendly
4. ✅ No horizontal scrolling

### 8. Test Google Sign-In Button
1. Click "Continue with Google"
2. ✅ Should show toast: "Google sign-in coming soon!"

### 9. Verify Data Storage

#### Check Supabase
1. After successful registration, check Supabase dashboard
2. Go to Authentication → Users
3. ✅ New user should be listed
4. Click on user → User Metadata
5. ✅ Should see:
   ```json
   {
     "name": "Shantan Kumar",
     "age": 30,
     "occupation": "salaried",
     "incomeRange": "6-12",
     "goals": ["retirement"],
     "risk": "moderate",
     "whatsapp_number": "+919876543210"
   }
   ```

#### Check user_data Table
1. Go to Table Editor → user_data
2. ✅ New row should exist with user's email
3. ✅ Profile should have default data

### 10. Test Error Handling

#### Rate Limiting
1. Try registering multiple times quickly
2. ✅ Should show: "Too many registration attempts. Please wait..."

#### Invalid Email
1. Enter invalid email: "notanemail"
2. ✅ Browser should show validation error

#### Network Error
1. Disconnect internet
2. Try registering
3. ✅ Should show appropriate error message

## Expected Behavior Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| Click Register tab | Modern screen appears | ⬜ |
| Empty form submit | Shows validation errors | ⬜ |
| Password validation | Real-time feedback | ⬜ |
| WhatsApp optional | Can skip field | ⬜ |
| Terms required | Must check to continue | ⬜ |
| Password toggle | Shows/hides password | ⬜ |
| Sign in link | Returns to login | ⬜ |
| Successful registration | Creates account | ⬜ |
| Duplicate email | Shows error | ⬜ |
| Mobile responsive | Stacks vertically | ⬜ |
| Google button | Shows coming soon | ⬜ |
| Data in Supabase | Stored correctly | ⬜ |

## Common Issues & Solutions

### Issue: Modern screen doesn't appear
- **Solution**: Check browser console for errors
- Verify `switchAuth()` function is defined
- Check if `modern-registration` div exists

### Issue: Password validation not working
- **Solution**: Check if `validatePassword()` is called on input
- Verify requirement divs have correct IDs
- Check browser console for errors

### Issue: WhatsApp number not saved
- **Solution**: Check Supabase user metadata
- Verify `tempWhatsAppNumber` is set before calling `doReg()`
- Check if number is formatted with +91 prefix

### Issue: Form submits but no account created
- **Solution**: Check Supabase credentials
- Verify email confirmation is not blocking
- Check browser console for Supabase errors

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Performance Checks

- Page load time: < 2 seconds
- Form submission: < 3 seconds
- No console errors
- No memory leaks
- Smooth animations

---

**Last Updated**: March 1, 2026
**Tester**: _____________
**Date Tested**: _____________
**Result**: ⬜ Pass / ⬜ Fail
**Notes**: _____________________________________________
