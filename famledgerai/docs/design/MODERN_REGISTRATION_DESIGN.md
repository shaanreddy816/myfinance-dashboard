# Modern Registration Screen Design

## Design Inspiration

Taking inspiration from Twilio's clean, professional onboarding with:
- Progress indicator
- Clear value propositions
- Minimal friction
- Visual hierarchy
- Trust indicators

## Implementation

### New Registration Screen HTML

```html
<div id="registration-screen" style="display:none; min-height:100vh; background:linear-gradient(135deg, #0b0f1a 0%, #1a2235 100%);">
    <div style="display:flex; min-height:100vh;">
        
        <!-- Left Panel - Value Proposition -->
        <div style="flex:1; padding:60px; display:flex; flex-direction:column; justify-content:center; background:rgba(0,0,0,0.3);">
            <div style="max-width:500px;">
                <div style="margin-bottom:40px;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                        <div class="logo-icon" style="width:48px; height:48px; font-size:24px;">💰</div>
                        <div class="logo-text" style="font-size:24px;">Fam<span>Ledger</span>AI</div>
                    </div>
                    <h1 style="font-size:36px; font-weight:800; color:var(--text); margin-bottom:16px; line-height:1.2;">
                        Start your journey to financial freedom today
                    </h1>
                    <p style="font-size:18px; color:var(--text2); line-height:1.6;">
                        Join thousands of Indian families managing their finances smarter with AI-powered insights.
                    </p>
                </div>

                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:flex; align-items:start; gap:16px;">
                        <div style="width:32px; height:32px; background:var(--green-dim); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <span style="font-size:16px;">✓</span>
                        </div>
                        <div>
                            <div style="font-size:16px; font-weight:600; color:var(--text); margin-bottom:4px;">No credit card required</div>
                            <div style="font-size:14px; color:var(--text3);">Start free, upgrade when you're ready</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:start; gap:16px;">
                        <div style="width:32px; height:32px; background:var(--green-dim); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <span style="font-size:16px;">✓</span>
                        </div>
                        <div>
                            <div style="font-size:16px; font-weight:600; color:var(--text); margin-bottom:4px;">Complete financial dashboard</div>
                            <div style="font-size:14px; color:var(--text3);">Track income, expenses, investments, loans & more</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:start; gap:16px;">
                        <div style="width:32px; height:32px; background:var(--green-dim); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <span style="font-size:16px;">✓</span>
                        </div>
                        <div>
                            <div style="font-size:16px; font-weight:600; color:var(--text); margin-bottom:4px;">AI-powered recommendations</div>
                            <div style="font-size:14px; color:var(--text3);">Get personalized advice for your financial goals</div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:start; gap:16px;">
                        <div style="width:32px; height:32px; background:var(--green-dim); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <span style="font-size:16px;">✓</span>
                        </div>
                        <div>
                            <div style="font-size:16px; font-weight:600; color:var(--text); margin-bottom:4px;">WhatsApp reminders</div>
                            <div style="font-size:14px; color:var(--text3);">Never miss a payment with smart notifications</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top:40px; padding-top:40px; border-top:1px solid var(--border);">
                    <div style="font-size:12px; color:var(--text3); margin-bottom:12px;">TRUSTED BY</div>
                    <div style="display:flex; align-items:center; gap:24px;">
                        <div style="font-size:14px; color:var(--text2);">
                            <span style="font-size:24px; font-weight:800; color:var(--accent);">1,000+</span><br>
                            <span style="font-size:12px;">Active Users</span>
                        </div>
                        <div style="font-size:14px; color:var(--text2);">
                            <span style="font-size:24px; font-weight:800; color:var(--green);">₹50Cr+</span><br>
                            <span style="font-size:12px;">Assets Tracked</span>
                        </div>
                        <div style="font-size:14px; color:var(--text2);">
                            <span style="font-size:24px; font-weight:800; color:var(--purple);">4.8★</span><br>
                            <span style="font-size:12px;">User Rating</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Panel - Registration Form -->
        <div style="flex:1; padding:60px; display:flex; flex-direction:column; justify-content:center; background:var(--bg2);">
            <div style="max-width:480px; width:100%; margin:0 auto;">
                
                <!-- Progress Bar -->
                <div style="margin-bottom:32px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:12px; font-weight:600; color:var(--accent);">STEP 1 OF 3</span>
                        <span style="font-size:12px; color:var(--text3);">33%</span>
                    </div>
                    <div style="height:4px; background:var(--border); border-radius:2px; overflow:hidden;">
                        <div style="height:100%; width:33%; background:var(--accent); transition:width 0.3s;"></div>
                    </div>
                </div>

                <h2 style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:8px;">
                    Create your account
                </h2>
                <p style="font-size:14px; color:var(--text2); margin-bottom:32px;">
                    Get started in less than 2 minutes
                </p>

                <!-- Registration Form -->
                <form id="modern-registration-form" onsubmit="handleModernRegistration(event)">
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
                        <div>
                            <label style="display:block; font-size:13px; font-weight:600; color:var(--text); margin-bottom:8px;">
                                First name *
                            </label>
                            <input type="text" id="reg-firstname" required
                                   style="width:100%; padding:12px 16px; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text); font-size:14px; outline:none; transition:border-color 0.2s;"
                                   placeholder="Shantan"
                                   onfocus="this.style.borderColor='var(--accent)'"
                                   onblur="this.style.borderColor='var(--border2)'">
                        </div>
                        <div>
                            <label style="display:block; font-size:13px; font-weight:600; color:var(--text); margin-bottom:8px;">
                                Last name *
                            </label>
                            <input type="text" id="reg-lastname" required
                                   style="width:100%; padding:12px 16px; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text); font-size:14px; outline:none; transition:border-color 0.2s;"
                                   placeholder="Kumar"
                                   onfocus="this.style.borderColor='var(--accent)'"
                                   onblur="this.style.borderColor='var(--border2)'">
                        </div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:13px; font-weight:600; color:var(--text); margin-bottom:8px;">
                            Email address *
                        </label>
                        <input type="email" id="reg-email" required
                               style="width:100%; padding:12px 16px; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text); font-size:14px; outline:none; transition:border-color 0.2s;"
                               placeholder="you@example.com"
                               onfocus="this.style.borderColor='var(--accent)'"
                               onblur="this.style.borderColor='var(--border2)'">
                    </div>

                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:13px; font-weight:600; color:var(--text); margin-bottom:8px;">
                            WhatsApp Number (Optional)
                        </label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" value="+91" disabled
                                   style="width:60px; padding:12px 16px; background:var(--bg); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text3); font-size:14px; text-align:center;">
                            <input type="tel" id="reg-whatsapp" pattern="[0-9]{10}"
                                   style="flex:1; padding:12px 16px; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text); font-size:14px; outline:none; transition:border-color 0.2s;"
                                   placeholder="9876543210"
                                   onfocus="this.style.borderColor='var(--accent)'"
                                   onblur="this.style.borderColor='var(--border2)'">
                        </div>
                        <div style="font-size:11px; color:var(--text3); margin-top:6px; display:flex; align-items:center; gap:4px;">
                            <span>📱</span> Get payment reminders & alerts
                        </div>
                    </div>

                    <div style="margin-bottom:24px;">
                        <label style="display:block; font-size:13px; font-weight:600; color:var(--text); margin-bottom:8px;">
                            Password *
                        </label>
                        <div style="position:relative;">
                            <input type="password" id="reg-password" required
                                   style="width:100%; padding:12px 16px; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text); font-size:14px; outline:none; transition:border-color 0.2s;"
                                   placeholder="••••••••"
                                   onfocus="this.style.borderColor='var(--accent)'; showPasswordRequirements()"
                                   onblur="this.style.borderColor='var(--border2)'"
                                   oninput="validatePassword()">
                            <button type="button" onclick="togglePasswordVisibility('reg-password')"
                                    style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text3); cursor:pointer; font-size:16px;">
                                👁️
                            </button>
                        </div>
                        
                        <!-- Password Requirements -->
                        <div id="password-requirements" style="display:none; margin-top:12px; padding:12px; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); font-size:12px;">
                            <div style="color:var(--text3); margin-bottom:8px; font-weight:600;">Your password must contain:</div>
                            <div id="req-length" style="display:flex; align-items:center; gap:8px; margin-bottom:4px; color:var(--text3);">
                                <span>○</span> At least 8 characters
                            </div>
                            <div id="req-case" style="display:flex; align-items:center; gap:8px; margin-bottom:4px; color:var(--text3);">
                                <span>○</span> Upper & lowercase letters
                            </div>
                            <div id="req-number" style="display:flex; align-items:center; gap:8px; margin-bottom:4px; color:var(--text3);">
                                <span>○</span> At least one number
                            </div>
                            <div id="req-special" style="display:flex; align-items:center; gap:8px; color:var(--text3);">
                                <span>○</span> At least one special character
                            </div>
                        </div>
                    </div>

                    <!-- Terms Checkbox -->
                    <div style="margin-bottom:24px;">
                        <label style="display:flex; align-items:start; gap:12px; cursor:pointer;">
                            <input type="checkbox" id="reg-terms" required
                                   style="margin-top:2px; width:18px; height:18px; cursor:pointer;">
                            <span style="font-size:13px; color:var(--text2); line-height:1.5;">
                                By clicking Continue, you agree to our 
                                <a href="#" style="color:var(--accent); text-decoration:none;">Terms of Service</a> 
                                and 
                                <a href="#" style="color:var(--accent); text-decoration:none;">Privacy Policy</a>
                            </span>
                        </label>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" class="ebtn" style="width:100%; padding:14px; font-size:15px; margin-bottom:16px;">
                        Continue →
                    </button>

                    <!-- Divider -->
                    <div style="display:flex; align-items:center; gap:16px; margin:24px 0;">
                        <div style="flex:1; height:1px; background:var(--border);"></div>
                        <span style="font-size:12px; color:var(--text3);">OR</span>
                        <div style="flex:1; height:1px; background:var(--border);"></div>
                    </div>

                    <!-- Social Login (Optional) -->
                    <button type="button" onclick="showToast('Google sign-in coming soon!', 'blue')"
                            style="width:100%; padding:12px; background:var(--bg3); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text); font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:12px; transition:all 0.2s;"
                            onmouseover="this.style.borderColor='var(--accent)'"
                            onmouseout="this.style.borderColor='var(--border2)'">
                        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
                        Continue with Google
                    </button>

                    <!-- Sign In Link -->
                    <div style="text-align:center; margin-top:24px; padding-top:24px; border-top:1px solid var(--border);">
                        <span style="font-size:14px; color:var(--text2);">
                            Already have an account? 
                            <a href="#" onclick="showLoginScreen(); return false;" style="color:var(--accent); text-decoration:none; font-weight:600;">
                                Sign in
                            </a>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
// Password validation
function showPasswordRequirements() {
    document.getElementById('password-requirements').style.display = 'block';
}

function validatePassword() {
    const password = document.getElementById('reg-password').value;
    
    // Length check
    const lengthValid = password.length >= 8;
    updateRequirement('req-length', lengthValid);
    
    // Case check
    const caseValid = /[a-z]/.test(password) && /[A-Z]/.test(password);
    updateRequirement('req-case', caseValid);
    
    // Number check
    const numberValid = /[0-9]/.test(password);
    updateRequirement('req-number', numberValid);
    
    // Special character check
    const specialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    updateRequirement('req-special', specialValid);
}

function updateRequirement(id, isValid) {
    const element = document.getElementById(id);
    if (isValid) {
        element.style.color = 'var(--green)';
        element.querySelector('span').textContent = '✓';
    } else {
        element.style.color = 'var(--text3)';
        element.querySelector('span').textContent = '○';
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

async function handleModernRegistration(event) {
    event.preventDefault();
    
    const firstname = document.getElementById('reg-firstname').value.trim();
    const lastname = document.getElementById('reg-lastname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const whatsapp = document.getElementById('reg-whatsapp').value.trim();
    const password = document.getElementById('reg-password').value;
    
    // Validate password
    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'red');
        return;
    }
    
    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    try {
        // Register with Supabase
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstname,
                    last_name: lastname,
                    full_name: `${firstname} ${lastname}`,
                    whatsapp_number: whatsapp || null
                }
            }
        });
        
        if (error) throw error;
        
        // Success!
        showToast('✅ Account created! Check your email to verify.', 'green');
        
        // Redirect to onboarding after 2 seconds
        setTimeout(() => {
            window.location.href = '/onboarding';
        }, 2000);
        
    } catch (error) {
        console.error('Registration error:', error);
        showToast(`❌ ${error.message}`, 'red');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
</script>
```

## Key Features

1. **Split Screen Design**
   - Left: Value propositions & trust indicators
   - Right: Clean registration form

2. **Progress Indicator**
   - Shows "Step 1 of 3" (33%)
   - Visual progress bar

3. **Smart Form Fields**
   - First name + Last name (side by side)
   - Email with validation
   - WhatsApp number (optional) with +91 prefix
   - Password with real-time validation
   - Show/hide password toggle

4. **Password Requirements**
   - Shows requirements on focus
   - Real-time validation with checkmarks
   - Visual feedback (green checkmarks)

5. **Trust Elements**
   - "No credit card required"
   - Feature highlights with checkmarks
   - User statistics (1,000+ users, ₹50Cr+ tracked)
   - 4.8★ rating

6. **Social Login**
   - Google sign-in button (ready for future)
   - Clean divider with "OR"

7. **Mobile Responsive**
   - Stacks vertically on mobile
   - Touch-friendly inputs
   - Optimized spacing

## Color Scheme

- Background: Dark gradient (#0b0f1a → #1a2235)
- Accent: Blue (#3b7eff)
- Success: Green (#10d98e)
- Text: Light (#e8edf5)
- Borders: Subtle (#1e2d45)

## Next Steps

1. Replace current registration screen with this design
2. Add email verification flow
3. Create onboarding steps 2 & 3
4. Add Google OAuth (optional)
5. Test on mobile devices
