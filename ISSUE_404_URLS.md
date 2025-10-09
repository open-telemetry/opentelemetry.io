# 404 URLs Found in refcache.json (PR #8043)

This issue tracks URLs in `static/refcache.json` that returned a 404 status code
in PR #8043.

## URLs with 404 Status

### 1. Ubuntu 20.04 Runner Images README

**404 URL:**

```
https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2004-Readme.md
```

**Context:** Ubuntu 20.04 reached end-of-life and the documentation has been
removed from the runner-images repository.

**Suggested Replacement URLs:**

- **Recommended (last valid commit):**
  `https://github.com/actions/runner-images/blob/e82adb8a25d915d5a4598ced53814bdacac218cc/images/ubuntu/Ubuntu2004-Readme.md`
  (Last version before removal, from April 11, 2025)
- **Recommended (current):**
  `https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2204-Readme.md`
  (Ubuntu 22.04 - Current LTS)
- Alternative:
  `https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md`
  (Ubuntu 24.04 - Latest LTS)
- General: `https://github.com/actions/runner-images` (Main repository)

**Status:** ✅ All replacement URLs verified as working (HTTP 200)

---

### 2. OpenTelemetry JS Contrib - Node Detectors

**404 URL:**

```
https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/detectors/node
```

**Context:** The repository structure has been reorganized. The `detectors/node`
path no longer exists; detector packages have been moved to the `packages/`
directory.

**Suggested Replacement URLs:**

- **Recommended (last valid commit):**
  `https://github.com/open-telemetry/opentelemetry-js-contrib/tree/52dd28deae0ebfbec43bdaed82f4749fc9803797/detectors/node`
  (Last version before reorganization, from July 7, 2025)
- **Recommended (current, general):**
  `https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages`
  (All packages including detectors)
- **Recommended (with anchor):**
  `https://github.com/open-telemetry/opentelemetry-js-contrib#resource-detectors`
  (README section on resource detectors)
- **Specific detector examples:**
  - `https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/resource-detector-aws`
  - `https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/resource-detector-gcp`
  - `https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/resource-detector-azure`

**Status:** ✅ All replacement URLs verified as working (HTTP 200)

---

### 3. OpenTelemetry JS Contrib - Express Instrumentation

**404 URL:**

```
https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express
```

**Context:** The repository structure has been reorganized. The `plugins/node/`
path has been changed to `packages/` directory.

**Suggested Replacement URLs:**

- **Recommended (last valid commit):**
  `https://github.com/open-telemetry/opentelemetry-js-contrib/tree/52dd28deae0ebfbec43bdaed82f4749fc9803797/plugins/node/opentelemetry-instrumentation-express`
  (Last version before reorganization, from July 7, 2025)
- **Recommended (current):**
  `https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-express`
  (New location of the package)
- **Alternative (with anchor):**
  `https://github.com/open-telemetry/opentelemetry-js-contrib#plugins-instrumentations-maintained-by-opentelemetry-authors`
  (README section on instrumentations)
- General: `https://github.com/open-telemetry/opentelemetry-js-contrib` (Main
  repository)

**Status:** ✅ All replacement URLs verified as working (HTTP 200)

---

## Summary

- **Total 404 URLs:** 3
- **All have verified working replacements:** ✅

## Next Steps

1. Update references to these URLs in the documentation
2. Update `static/refcache.json` with the new URLs (will be done automatically
   on next cache refresh)

## Related

- PR #8043 - Refresh refcache

---

**Note:** This issue was automatically generated based on analysis of PR #8043
changes to `static/refcache.json`.
