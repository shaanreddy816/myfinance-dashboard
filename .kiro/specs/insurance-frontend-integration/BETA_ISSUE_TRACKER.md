# Beta Issue Tracker - Insurance Module

**Beta Period**: [Start Date] - [End Date]  
**Last Updated**: [Date]

---

## Issue Tracking Guidelines

### Issue Categories
1. **Extraction Errors** - Fields not extracted or extracted incorrectly
2. **Insurer-Specific Parsing** - Issues specific to certain insurers
3. **UI Confusion** - User experience and interface issues
4. **Performance Issues** - Slow processing, timeouts, errors

### Severity Levels
- **Critical**: Blocks core functionality, affects all users
- **High**: Significant impact, affects many users
- **Medium**: Moderate impact, affects some users
- **Low**: Minor impact, affects few users

### Status
- **Open**: Issue identified, not yet addressed
- **In Progress**: Being worked on
- **Fixed**: Solution implemented
- **Verified**: Fix confirmed working
- **Closed**: Issue resolved and verified

---

## Active Issues

### Critical Issues

#### Issue #C001: [Title]
- **Category**: Extraction Errors / Insurer-Specific / UI Confusion / Performance
- **Severity**: Critical
- **Status**: Open / In Progress / Fixed / Verified / Closed
- **Reported**: [Date]
- **Reporter**: [Name/User ID]
- **Affected Users**: [Count]
- **Frequency**: Always / Often / Sometimes / Rare

**Description**:
[Detailed description of the issue]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Impact**:
[How this affects users]

**Root Cause**:
[Analysis of why this happens]

**Solution**:
[Proposed or implemented fix]

**Verification**:
- [ ] Fix implemented
- [ ] Tested with sample data
- [ ] Verified with affected users
- [ ] Monitoring for recurrence

**Notes**:
[Additional context, related issues, etc.]

---

### High Priority Issues

#### Issue #H001: [Title]
- **Category**: Extraction Errors
- **Severity**: High
- **Status**: Open
- **Reported**: [Date]
- **Affected Users**: [Count]
- **Frequency**: Often

**Description**:
[Issue description]

**Data**:
- Insurer: [Name]
- Field: [Field name]
- Missing Count: [X]
- Accuracy Impact: [X]%

**Action Items**:
- [ ] Analyze sample policies
- [ ] Identify pattern
- [ ] Implement fix
- [ ] Test with real data
- [ ] Deploy and monitor

---

### Medium Priority Issues

#### Issue #M001: [Title]
- **Category**: UI Confusion
- **Severity**: Medium
- **Status**: Open
- **Reported**: [Date]
- **Affected Users**: [Count]
- **Frequency**: Sometimes

**Description**:
[Issue description]

**User Feedback**:
- "[Quote from user]"
- "[Quote from user]"

**Proposed Solution**:
[How to fix]

**Action Items**:
- [ ] Design improvement
- [ ] Implement changes
- [ ] Test with users
- [ ] Deploy

---

### Low Priority Issues

#### Issue #L001: [Title]
- **Category**: Performance
- **Severity**: Low
- **Status**: Open
- **Reported**: [Date]
- **Affected Users**: [Count]
- **Frequency**: Rare

**Description**:
[Issue description]

**Action Items**:
- [ ] Monitor for frequency increase
- [ ] Plan fix for next sprint
- [ ] Document workaround

---

## Extraction Error Issues

### Template: Extraction Error

#### Issue #E[XXX]: [Field] not extracted for [Insurer]
- **Category**: Extraction Errors
- **Severity**: [Critical/High/Medium/Low]
- **Status**: [Status]
- **Reported**: [Date]
- **Affected Insurer**: [Insurer Name]
- **Affected Field**: [Field Name]
- **Missing Count**: [X] out of [Y] uploads
- **Accuracy Impact**: [X]%

**Sample Data**:
```
Policy: [Policy ID]
Insurer: [Name]
Expected: [Value]
Actual: [Value or NULL]
```

**Pattern Analysis**:
- Document format: [PDF structure]
- Field location: [Where in document]
- Extraction method: [Current approach]
- Why it fails: [Root cause]

**Solution**:
- [ ] Add insurer-specific extraction rule
- [ ] Update field detection pattern
- [ ] Test with 5+ sample policies
- [ ] Verify accuracy improvement

**Verification**:
```sql
-- Check if fixed
SELECT 
  COUNT(*) as total,
  COUNT([field_name]) as extracted,
  ROUND(COUNT([field_name]) * 100.0 / COUNT(*), 1) as accuracy
FROM insurance_policies
WHERE insurer_name = '[Insurer]'
  AND created_at > '[Fix Date]';
```

---

## Insurer-Specific Parsing Issues

### Template: Insurer-Specific Issue

#### Issue #I[XXX]: [Insurer] - [Issue Description]
- **Category**: Insurer-Specific Parsing
- **Severity**: [Severity]
- **Status**: [Status]
- **Reported**: [Date]
- **Affected Insurer**: [Insurer Name]
- **Uploads Affected**: [X]
- **Overall Accuracy**: [X]%

**Issues Identified**:
1. [Field 1]: Missing in [X]% of uploads
2. [Field 2]: Incorrect in [X]% of uploads
3. [Field 3]: Format not recognized

**Sample Policies**:
- Policy 1: [ID] - [Issues]
- Policy 2: [ID] - [Issues]
- Policy 3: [ID] - [Issues]

**Insurer-Specific Patterns**:
- Document structure: [Description]
- Field naming: [How they name fields]
- Unique characteristics: [What's different]

**Solution Approach**:
1. Create insurer-specific extraction rules
2. Add field name variations
3. Handle unique document structure
4. Test with multiple policies

**Action Items**:
- [ ] Collect 10+ sample policies
- [ ] Analyze document patterns
- [ ] Implement insurer-specific rules
- [ ] Test extraction accuracy
- [ ] Deploy and monitor

---

## UI Confusion Issues

### Template: UI Confusion

#### Issue #U[XXX]: [UI Element] - [Confusion Description]
- **Category**: UI Confusion
- **Severity**: [Severity]
- **Status**: [Status]
- **Reported**: [Date]
- **Affected Users**: [Count]
- **User Feedback Count**: [X]

**User Feedback**:
- User 1: "[Quote]"
- User 2: "[Quote]"
- User 3: "[Quote]"

**Confusion Point**:
[What users don't understand]

**Current Design**:
[How it works now]

**Proposed Improvement**:
[How to make it clearer]

**Design Changes**:
- [ ] Add tooltip/help text
- [ ] Improve labeling
- [ ] Add visual indicators
- [ ] Simplify workflow

**Action Items**:
- [ ] Design mockup
- [ ] Get user feedback
- [ ] Implement changes
- [ ] A/B test if possible
- [ ] Deploy and monitor

---

## Performance Issues

### Template: Performance Issue

#### Issue #P[XXX]: [Performance Problem]
- **Category**: Performance Issues
- **Severity**: [Severity]
- **Status**: [Status]
- **Reported**: [Date]
- **Affected Users**: [Count]
- **Frequency**: [Frequency]

**Performance Metrics**:
- Average time: [X]s
- P95 time: [X]s
- Timeout rate: [X]%
- Target: [X]s

**Affected Scenarios**:
- [Scenario 1]: [Time]
- [Scenario 2]: [Time]
- [Scenario 3]: [Time]

**Root Cause**:
[Why it's slow]

**Optimization Approach**:
1. [Optimization 1]
2. [Optimization 2]
3. [Optimization 3]

**Action Items**:
- [ ] Profile performance
- [ ] Identify bottleneck
- [ ] Implement optimization
- [ ] Test performance improvement
- [ ] Deploy and monitor

---

## Closed Issues

### Issue #C001: [Title] - CLOSED
- **Category**: [Category]
- **Severity**: [Severity]
- **Reported**: [Date]
- **Closed**: [Date]
- **Resolution**: [How it was fixed]

**Verification**:
- ✅ Fix implemented
- ✅ Tested successfully
- ✅ Verified with users
- ✅ No recurrence in 1 week

---

## Issue Statistics

### By Category
| Category | Open | In Progress | Fixed | Closed | Total |
|----------|------|-------------|-------|--------|-------|
| Extraction Errors | [X] | [X] | [X] | [X] | [X] |
| Insurer-Specific | [X] | [X] | [X] | [X] | [X] |
| UI Confusion | [X] | [X] | [X] | [X] | [X] |
| Performance | [X] | [X] | [X] | [X] | [X] |
| **Total** | [X] | [X] | [X] | [X] | [X] |

### By Severity
| Severity | Open | In Progress | Fixed | Closed | Total |
|----------|------|-------------|-------|--------|-------|
| Critical | [X] | [X] | [X] | [X] | [X] |
| High | [X] | [X] | [X] | [X] | [X] |
| Medium | [X] | [X] | [X] | [X] | [X] |
| Low | [X] | [X] | [X] | [X] | [X] |
| **Total** | [X] | [X] | [X] | [X] | [X] |

### Top Issues by Impact
1. [Issue ID]: [Title] - Affects [X] users
2. [Issue ID]: [Title] - Affects [X] users
3. [Issue ID]: [Title] - Affects [X] users
4. [Issue ID]: [Title] - Affects [X] users
5. [Issue ID]: [Title] - Affects [X] users

---

## Quick Reference

### Issue ID Format
- **C###**: Critical issues
- **H###**: High priority issues
- **M###**: Medium priority issues
- **L###**: Low priority issues
- **E###**: Extraction errors
- **I###**: Insurer-specific issues
- **U###**: UI confusion issues
- **P###**: Performance issues

### Workflow
1. **Report**: User reports issue or identified in monitoring
2. **Triage**: Assign category, severity, priority
3. **Investigate**: Analyze root cause
4. **Fix**: Implement solution
5. **Test**: Verify fix works
6. **Deploy**: Push to production
7. **Monitor**: Watch for recurrence
8. **Close**: Mark as resolved

### SQL Queries for Issue Investigation

**Check specific insurer accuracy**:
```sql
SELECT 
  insurer_name,
  COUNT(*) as total,
  COUNT(policy_number) as has_policy_number,
  COUNT(sum_insured) as has_sum_insured,
  COUNT(premium_amount) as has_premium_amount
FROM insurance_policies
WHERE insurer_name = '[Insurer Name]'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY insurer_name;
```

**Check specific field extraction**:
```sql
SELECT 
  insurer_name,
  COUNT(*) as total,
  COUNT([field_name]) as extracted,
  ROUND(COUNT([field_name]) * 100.0 / COUNT(*), 1) as accuracy_pct
FROM insurance_policies
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY insurer_name
ORDER BY accuracy_pct ASC;
```

**Check user feedback for specific issue**:
```sql
SELECT 
  p.insurer_name,
  f.feedback_type,
  f.insurer_name_wrong,
  f.sum_insured_wrong,
  f.policy_type_wrong,
  f.analysis_confusing,
  f.notes
FROM insurance_beta_feedback f
JOIN insurance_policies p ON f.policy_id = p.id
WHERE f.created_at > NOW() - INTERVAL '7 days'
  AND (f.insurer_name_wrong = true OR f.sum_insured_wrong = true)
ORDER BY f.created_at DESC;
```

---

## Notes

- Update this tracker daily during beta
- Link issues to user feedback
- Track resolution time
- Document learnings for future
- Archive closed issues weekly

---

**Last Updated**: [Date]  
**Next Review**: [Date]  
**Maintained By**: [Name]
