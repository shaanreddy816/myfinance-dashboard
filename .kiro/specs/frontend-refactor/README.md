# Frontend Refactor Spec

## Overview

Refactor the monolithic 15,000+ line `index.html` into a maintainable, modular structure with proper separation of concerns, build tooling, and automated testing.

## Goals

1. ✅ Split monolithic file into ~30 focused modules
2. ✅ Add unit tests for all financial calculation engines
3. ✅ Set up modern build tooling (Vite)
4. ✅ Add CI/CD pipeline (GitHub Actions)
5. ✅ Maintain 100% backward compatibility (no UI/feature changes)

## Structure

```
.kiro/specs/frontend-refactor/
├── README.md           # This file
├── requirements.md     # Detailed requirements (10 requirements)
├── design.md          # Technical design and architecture
└── tasks.md           # Implementation tasks (27 tasks, 6 phases)
```

## Quick Start

### For Product Owners

Read `requirements.md` to understand:
- What we're building
- Why we're building it
- Success criteria
- Timeline (13 days)

### For Engineers

Read `design.md` to understand:
- Architecture (before/after)
- Component design
- Migration strategy
- Code examples

Then follow `tasks.md` for step-by-step implementation.

## Key Deliverables

### 1. Folder Structure

```
src/
├── main.js                 # Entry point
├── lib/
│   ├── supabaseClient.js   # Supabase singleton
│   └── utils.js            # Shared utilities
├── engines/
│   ├── forecastEngine.js   # 15-year forecast
│   ├── riskEngine.js       # Risk scoring
│   └── stressEngine.js     # Stress testing
├── ui/
│   ├── renderOverview.js   # Overview page
│   ├── renderForecast.js   # Forecast card
│   ├── renderRisk.js       # Risk card
│   └── renderStress.js     # Stress card
├── store/
│   ├── userStore.js        # Reactive state
│   └── computeCache.js     # Memoization
├── dal/
│   ├── householdContext.js # Phase 2 context
│   ├── loadData.js         # Data loading
│   └── saveData.js         # Data saving
└── styles/
    └── main.css            # Extracted CSS
```

### 2. Build Tool (Vite)

- Fast dev server with HMR
- Optimized production builds
- Tree-shaking and code splitting
- Source maps for debugging

### 3. Unit Tests (Vitest)

- Forecast engine tests (invariants, edge cases)
- Risk engine tests (ranges, mappings)
- Stress engine tests (scenarios, deltas)
- ≥ 80% code coverage

### 4. CI/CD (GitHub Actions)

- Lint on every PR
- Test on every PR
- Build on every PR
- Block merge if any check fails

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Extract Engines | 3 days | Engines with tests |
| 2. Extract UI | 3 days | UI rendering modules |
| 3. Extract DAL | 3 days | Data access layer |
| 4. State Management | 2 days | Reactive state |
| 5. CI/CD Setup | 1 day | Automated checks |
| 6. Final Migration | 1 day | Complete refactor |
| **Total** | **13 days** | **Fully modular app** |

## Success Metrics

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Lines per file | 15,000 | ≤ 200 | ⏳ |
| Test coverage | 0% | ≥ 80% | ⏳ |
| Build time | N/A | ≤ 30s | ⏳ |
| Dev server start | N/A | ≤ 2s | ⏳ |
| Bundle size (gzip) | ~400KB | ≤ 500KB | ⏳ |
| CI pipeline time | N/A | ≤ 5min | ⏳ |

## Constraints

- ❌ No UI redesign
- ❌ No feature changes
- ❌ No database changes
- ❌ No API changes
- ✅ Only refactor + safety improvements

## Benefits

### For Developers

- **Faster development**: HMR updates in < 100ms
- **Easier debugging**: Source maps + modular code
- **Safer refactoring**: Unit tests catch regressions
- **Better collaboration**: Smaller files = fewer merge conflicts

### For Product

- **Higher quality**: Automated tests prevent bugs
- **Faster releases**: CI/CD catches issues early
- **Lower risk**: Phased migration allows rollback
- **Better maintainability**: Clear structure = easier onboarding

### For Users

- **No disruption**: 100% backward compatible
- **Same performance**: Optimized builds
- **Same features**: Zero functional changes
- **Better reliability**: More tests = fewer bugs

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | High | Phased migration + comprehensive testing |
| CI/CD failures | Medium | Retry logic + clear error messages |
| Performance regression | Medium | Bundle size monitoring |
| Developer resistance | Low | Clear documentation + training |

## Next Steps

1. **Review this spec** with the team
2. **Get approval** from stakeholders
3. **Start Phase 1** (Extract Engines)
4. **Deploy incrementally** after each phase
5. **Monitor metrics** throughout migration

## Questions?

- **Product questions**: See `requirements.md`
- **Technical questions**: See `design.md`
- **Implementation questions**: See `tasks.md`

## Status

📝 **Spec Status**: Complete - Ready for implementation

🚀 **Implementation Status**: Not started

✅ **Approval Status**: Pending review
