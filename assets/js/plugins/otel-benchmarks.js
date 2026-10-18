// Docsy resolves a plugin's script at `js/plugins/NAME.js` only; this one
// lives in `otel-benchmarks/`, entry `index.js`. Spelled out because a bare
// `./otel-benchmarks` resolves to this file first.
import './otel-benchmarks/index.js';
