import yaml from 'js-yaml';

// Property -> DC path (under instrumentation/development)
// From ConfigPropertiesBackedDeclarativeConfigProperties.java SPECIAL_MAPPINGS
const SPECIAL_MAPPINGS = {
  'otel.instrumentation.http.client.capture-request-headers':
    'general.http.client.request_captured_headers',
  'otel.instrumentation.http.client.capture-response-headers':
    'general.http.client.response_captured_headers',
  'otel.instrumentation.http.server.capture-request-headers':
    'general.http.server.request_captured_headers',
  'otel.instrumentation.http.server.capture-response-headers':
    'general.http.server.response_captured_headers',
  'otel.instrumentation.sanitization.url.experimental.sensitive-query-parameters':
    'general.sanitization.url.sensitive_query_parameters/development',
  'otel.semconv-stability.opt-in': 'general.semconv_stability.opt_in',
  'otel.instrumentation.http.known-methods': 'java.common.http.known_methods',
  'otel.instrumentation.http.client.experimental.redact-query-parameters':
    'java.common.http.client.redact_query_parameters/development',
  'otel.instrumentation.http.client.emit-experimental-telemetry':
    'java.common.http.client.emit_experimental_telemetry/development',
  'otel.instrumentation.http.server.emit-experimental-telemetry':
    'java.common.http.server.emit_experimental_telemetry/development',
  'otel.instrumentation.common.db-statement-sanitizer.enabled':
    'java.common.database.statement_sanitizer.enabled',
  'otel.instrumentation.common.experimental.db-sqlcommenter.enabled':
    'java.common.database.sqlcommenter/development.enabled',
  'otel.instrumentation.messaging.experimental.receive-telemetry.enabled':
    'java.common.messaging.receive_telemetry/development.enabled',
  'otel.instrumentation.messaging.experimental.capture-headers':
    'java.common.messaging.capture_headers/development',
  'otel.instrumentation.genai.capture-message-content':
    'java.common.gen_ai.capture_message_content',
  'otel.instrumentation.experimental.span-suppression-strategy':
    'java.common.span_suppression_strategy/development',
  'otel.instrumentation.opentelemetry-annotations.exclude-methods':
    'java.opentelemetry_extension_annotations.exclude_methods',
  'otel.experimental.javascript-snippet':
    'java.servlet.javascript_snippet/development',
  'otel.jmx.enabled': 'java.jmx.enabled',
  'otel.jmx.config': 'java.jmx.config',
  'otel.jmx.target.system': 'java.jmx.target.system',
};

// Build reverse lookup: env var name -> property key
// E.g. OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS -> otel.instrumentation.http.known-methods
const ENV_TO_PROPERTY = {};
for (const key of Object.keys(SPECIAL_MAPPINGS)) {
  const envKey = key.toUpperCase().replace(/\./g, '_').replace(/-/g, '_');
  ENV_TO_PROPERTY[envKey] = key;
}

// Known instrumentation names for enable/disable and env var matching
const KNOWN_INSTRUMENTATIONS = [
  'jdbc',
  'kafka',
  'mongo',
  'r2dbc',
  'micrometer',
  'logback-appender',
  'logback-mdc',
  'log4j-appender',
  'spring-web',
  'spring-webmvc',
  'spring-webflux',
  'spring-kafka',
  'spring-data',
  'spring-jms',
  'spring-integration',
  'spring-rabbit',
  'spring-scheduling',
  'annotations',
  'opentelemetry-annotations',
  'methods',
  'external-annotations',
  'grpc',
  'okhttp',
  'apache-httpclient',
  'runtime-telemetry',
  'oshi',
];

// ── Parsing ────────────────────────────────────────────────────────────

function parseProperties(text) {
  const result = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//'))
      continue;
    // Strip -D prefix for sys props
    const clean = trimmed.startsWith('-D') ? trimmed.slice(2) : trimmed;
    const eq = clean.indexOf('=');
    if (eq === -1) continue;
    result.push({
      key: clean.slice(0, eq).trim(),
      value: clean.slice(eq + 1).trim(),
    });
  }
  return result;
}

function envVarToProperty(envKey) {
  // Check known properties first
  if (ENV_TO_PROPERTY[envKey]) return ENV_TO_PROPERTY[envKey];

  // Handle enable/disable: OTEL_INSTRUMENTATION_<NAME>_ENABLED
  const enableMatch = envKey.match(/^OTEL_INSTRUMENTATION_(.+)_ENABLED$/);
  if (enableMatch) {
    const rawName = enableMatch[1].toLowerCase();
    // Try known instrumentation names
    for (const name of KNOWN_INSTRUMENTATIONS) {
      if (rawName === name.replace(/-/g, '_')) {
        return `otel.instrumentation.${name}.enabled`;
      }
    }
    // Best guess: use the raw name with . for _
    return `otel.instrumentation.${rawName.replace(/_/g, '-')}.enabled`;
  }

  // OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED
  if (envKey === 'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED') {
    return 'otel.instrumentation.common.default-enabled';
  }

  // SDK properties: straightforward lowercasing
  if (
    envKey.startsWith('OTEL_SERVICE_') ||
    envKey.startsWith('OTEL_RESOURCE_') ||
    envKey.startsWith('OTEL_PROPAGATORS') ||
    envKey.startsWith('OTEL_EXPORTER_') ||
    envKey === 'OTEL_SDK_DISABLED'
  ) {
    return envKey.toLowerCase().replace(/_/g, '.');
  }

  // Fallback: lowercase and replace _ with .
  return envKey.toLowerCase().replace(/_/g, '.');
}

function parseEnvVars(text) {
  const result = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    // Strip "export " prefix
    const clean = trimmed.startsWith('export ')
      ? trimmed.slice(7).trim()
      : trimmed;
    const eq = clean.indexOf('=');
    if (eq === -1) continue;
    const envKey = clean.slice(0, eq).trim();
    let value = clean.slice(eq + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result.push({ key: envVarToProperty(envKey), value });
  }
  return result;
}

function flattenYaml(obj, prefix = '') {
  const result = [];
  if (obj == null) return result;
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenYaml(value, fullKey));
    } else {
      result.push({ key: fullKey, value: String(value) });
    }
  }
  return result;
}

function parseYamlInput(text) {
  try {
    const parsed = yaml.load(text);
    if (parsed == null || typeof parsed !== 'object') return [];
    return flattenYaml(parsed);
  } catch {
    return [];
  }
}

// ── Classification ─────────────────────────────────────────────────────

function classify(key) {
  // Enable/disable
  const enableMatch = key.match(/^otel\.instrumentation\.(.+)\.enabled$/);
  if (enableMatch) {
    const name = enableMatch[1];
    // Skip if it looks like a sub-property (e.g. common.db-statement-sanitizer.enabled)
    if (!name.includes('.')) {
      return { type: 'enable', name };
    }
  }

  if (key === 'otel.instrumentation.common.default-enabled') {
    return { type: 'default-enabled' };
  }

  // Special mappings
  if (SPECIAL_MAPPINGS[key]) {
    return { type: 'special', dcPath: SPECIAL_MAPPINGS[key] };
  }

  // Generic instrumentation config
  if (key.startsWith('otel.instrumentation.')) {
    return {
      type: 'instrumentation',
      suffix: key.slice('otel.instrumentation.'.length),
    };
  }

  // Known SDK properties
  if (key === 'otel.sdk.disabled') return { type: 'sdk-disabled' };
  if (key === 'otel.service.name') return { type: 'sdk-service-name' };
  if (key === 'otel.propagators') return { type: 'sdk-propagators' };

  return { type: 'unknown' };
}

// ── Default algorithm: property suffix → DC path ───────────────────────

function defaultInstrumentationPath(suffix) {
  // suffix: everything after "otel.instrumentation."
  // e.g. "logback-appender.experimental-log-attributes"
  const segments = suffix.split('.');
  const result = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dcSeg = seg.replace(/-/g, '_');

    if (seg === 'experimental' && i < segments.length - 1) {
      // "experimental" as standalone segment: next segment gets /development
      i++;
      const next = segments[i].replace(/-/g, '_');
      result.push(next + '/development');
    } else if (dcSeg.startsWith('experimental_') || dcSeg === 'experimental') {
      // Segment name contains "experimental" — add /development
      result.push(dcSeg + '/development');
    } else {
      result.push(dcSeg);
    }
  }

  return 'java.' + result.join('.');
}

// ── Build output ───────────────────────────────────────────────────────

function setNested(obj, dottedPath, value) {
  const parts = dottedPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in current) || typeof current[p] !== 'object') {
      current[p] = {};
    }
    current = current[p];
  }
  current[parts[parts.length - 1]] = value;
}

function coerceValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

function coerceListValue(value) {
  // Comma-separated → array
  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').map((s) => s.trim());
  }
  return coerceValue(value);
}

function buildDcYaml(properties, source, gettingStartedYaml) {
  const warnings = [];
  const enabled = [];
  const disabled = [];
  let defaultEnabled = null;
  const instrumentationConfig = {};
  const sdkConfig = {};
  const unknownLines = [];

  for (const { key, value } of properties) {
    const cls = classify(key);

    switch (cls.type) {
      case 'enable': {
        const dcName = cls.name.replace(/-/g, '_');
        if (value === 'true') enabled.push(dcName);
        else if (value === 'false') disabled.push(dcName);
        break;
      }

      case 'default-enabled':
        defaultEnabled = coerceValue(value);
        break;

      case 'special':
        setNested(instrumentationConfig, cls.dcPath, coerceListValue(value));
        break;

      case 'instrumentation': {
        const dcPath = defaultInstrumentationPath(cls.suffix);
        setNested(instrumentationConfig, dcPath, coerceListValue(value));
        break;
      }

      case 'sdk-disabled':
        sdkConfig.disabled = coerceValue(value);
        break;

      case 'sdk-service-name':
        if (!sdkConfig.resource) sdkConfig.resource = {};
        if (!sdkConfig.resource.attributes) sdkConfig.resource.attributes = [];
        sdkConfig.resource.attributes.push({
          name: 'service.name',
          value: value,
        });
        break;

      case 'sdk-propagators': {
        const propagators = value.split(',').map((p) => p.trim());
        sdkConfig.propagator = {
          composite: propagators.map((p) => ({ [p]: null })),
        };
        break;
      }

      case 'unknown':
        unknownLines.push(`${key}=${value}`);
        warnings.push(`Could not convert: ${key}`);
        break;
    }
  }

  const dumpOpts = {
    indent: 2,
    lineWidth: -1,
    quotingType: "'",
    forceQuotes: false,
    noRefs: true,
    sortKeys: false,
  };

  function dumpClean(obj) {
    return yaml.dump(obj, dumpOpts).replace(/: null$/gm, ':');
  }

  // ── Getting-started skeleton from opentelemetry-configuration repo ──
  // For Spring, convert ${VAR:-default} to ${VAR:default} syntax.
  let skeletonYaml = gettingStartedYaml;
  if (source === 'spring') {
    skeletonYaml = skeletonYaml.replace(/\$\{([^}]+?):-/g, '${$1:');
  }

  // Parse the skeleton to apply SDK overrides (propagators, resource attributes)
  let skeleton;
  try {
    skeleton = yaml.load(skeletonYaml);
  } catch {
    skeleton = {};
  }

  if (sdkConfig.propagator) {
    skeleton.propagator = sdkConfig.propagator;
  }
  if (sdkConfig.resource && sdkConfig.resource.attributes) {
    if (!skeleton.resource) skeleton.resource = {};
    skeleton.resource.attributes = sdkConfig.resource.attributes;
  }
  if (sdkConfig.disabled != null) skeleton.disabled = sdkConfig.disabled;

  // ── Converted from your configuration ─────────────────────────────

  const converted = {};

  // Distribution (enable/disable)
  const distroKey = source === 'spring' ? 'spring_starter' : 'javaagent';
  if (enabled.length || disabled.length || defaultEnabled != null) {
    const instrumentation = {};
    if (defaultEnabled != null)
      instrumentation.default_enabled = defaultEnabled;
    if (enabled.length) instrumentation.enabled = enabled;
    if (disabled.length) instrumentation.disabled = disabled;
    converted.distribution = { [distroKey]: { instrumentation } };
  }

  // Instrumentation config
  if (Object.keys(instrumentationConfig).length) {
    converted['instrumentation/development'] = instrumentationConfig;
  }

  // ── Assemble output with comments ─────────────────────────────────

  const indent = source === 'spring' ? '  ' : '';
  const wrap = (obj) => (source === 'spring' ? { otel: obj } : obj);

  let output = '# Getting started configuration from\n';
  output +=
    '# https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/otel-getting-started.yaml\n';
  output += dumpClean(wrap(skeleton));

  if (Object.keys(converted).length) {
    output += `\n${indent}# Converted from your configuration\n`;
    // Dump converted and strip the top-level wrapper key if Spring
    if (source === 'spring') {
      const inner = dumpClean(converted);
      // Indent each line to sit under "otel:"
      output += inner
        .split('\n')
        .map((line) => (line ? indent + line : line))
        .join('\n');
    } else {
      output += dumpClean(converted);
    }
  }

  // Append unknown properties as comments
  if (unknownLines.length) {
    output +=
      '\n# Could not convert the following properties:\n' +
      unknownLines.map((l) => `# ${l}`).join('\n') +
      '\n';
  }

  return { yaml: output, warnings };
}

// ── DOM wiring ─────────────────────────────────────────────────────────

function init() {
  const container = document.querySelector('.dc-converter');
  if (!container) return;

  const propsInput = document.getElementById('dc-input-props');
  const envInput = document.getElementById('dc-input-env');
  const yamlInput = document.getElementById('dc-input-yaml');
  const output = document.getElementById('dc-output');
  const copyBtn = document.getElementById('dc-copy');
  const warningsEl = document.getElementById('dc-warnings');

  if (!output) return;

  const source = container.dataset.source || 'agent';
  const gettingStartedYaml = container.dataset.gettingStarted || '';

  function convert() {
    const properties = [
      ...parseProperties(propsInput ? propsInput.value : ''),
      ...parseEnvVars(envInput ? envInput.value : ''),
      ...(yamlInput ? parseYamlInput(yamlInput.value) : []),
    ];

    const result = buildDcYaml(properties, source, gettingStartedYaml);
    output.value = result.yaml;

    if (result.warnings.length) {
      warningsEl.textContent = result.warnings.join('\n');
      warningsEl.classList.remove('d-none');
    } else {
      warningsEl.classList.add('d-none');
    }
  }

  let debounceTimer;
  function onInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convert, 300);
  }

  if (propsInput) propsInput.addEventListener('input', onInput);
  if (envInput) envInput.addEventListener('input', onInput);
  if (yamlInput) yamlInput.addEventListener('input', onInput);

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = original;
        }, 2000);
      });
    });
  }

  // Show skeleton immediately on page load
  convert();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
