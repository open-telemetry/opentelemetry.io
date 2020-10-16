/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/js/app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@opentelemetry/api/build/src/api/context.js":
/*!******************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/api/context.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const context_base_1 = __webpack_require__(/*! @opentelemetry/context-base */ "./node_modules/@opentelemetry/context-base/build/src/index.js");
const global_utils_1 = __webpack_require__(/*! ./global-utils */ "./node_modules/@opentelemetry/api/build/src/api/global-utils.js");
const NOOP_CONTEXT_MANAGER = new context_base_1.NoopContextManager();
/**
 * Singleton object which represents the entry point to the OpenTelemetry Context API
 */
class ContextAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() { }
    /** Get the singleton instance of the Context API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new ContextAPI();
        }
        return this._instance;
    }
    /**
     * Set the current context manager. Returns the initialized context manager
     */
    setGlobalContextManager(contextManager) {
        if (global_utils_1._global[global_utils_1.GLOBAL_CONTEXT_MANAGER_API_KEY]) {
            // global context manager has already been set
            return this._getContextManager();
        }
        global_utils_1._global[global_utils_1.GLOBAL_CONTEXT_MANAGER_API_KEY] = global_utils_1.makeGetter(global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION, contextManager, NOOP_CONTEXT_MANAGER);
        return contextManager;
    }
    /**
     * Get the currently active context
     */
    active() {
        return this._getContextManager().active();
    }
    /**
     * Execute a function with an active context
     *
     * @param context context to be active during function execution
     * @param fn function to execute in a context
     */
    with(context, fn) {
        return this._getContextManager().with(context, fn);
    }
    /**
     * Bind a context to a target function or event emitter
     *
     * @param target function or event emitter to bind
     * @param context context to bind to the event emitter or function. Defaults to the currently active context
     */
    bind(target, context = this.active()) {
        return this._getContextManager().bind(target, context);
    }
    _getContextManager() {
        var _a, _b, _c;
        return (_c = (_b = (_a = global_utils_1._global)[global_utils_1.GLOBAL_CONTEXT_MANAGER_API_KEY]) === null || _b === void 0 ? void 0 : _b.call(_a, global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION), (_c !== null && _c !== void 0 ? _c : NOOP_CONTEXT_MANAGER));
    }
    /** Disable and remove the global context manager */
    disable() {
        this._getContextManager().disable();
        delete global_utils_1._global[global_utils_1.GLOBAL_CONTEXT_MANAGER_API_KEY];
    }
}
exports.ContextAPI = ContextAPI;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/api/global-utils.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/api/global-utils.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = __webpack_require__(/*! ../platform */ "./node_modules/@opentelemetry/api/build/src/platform/browser/index.js");
exports.GLOBAL_CONTEXT_MANAGER_API_KEY = Symbol.for('io.opentelemetry.js.api.context');
exports.GLOBAL_METRICS_API_KEY = Symbol.for('io.opentelemetry.js.api.metrics');
exports.GLOBAL_PROPAGATION_API_KEY = Symbol.for('io.opentelemetry.js.api.propagation');
exports.GLOBAL_TRACE_API_KEY = Symbol.for('io.opentelemetry.js.api.trace');
exports._global = platform_1._globalThis;
/**
 * Make a function which accepts a version integer and returns the instance of an API if the version
 * is compatible, or a fallback version (usually NOOP) if it is not.
 *
 * @param requiredVersion Backwards compatibility version which is required to return the instance
 * @param instance Instance which should be returned if the required version is compatible
 * @param fallback Fallback instance, usually NOOP, which will be returned if the required version is not compatible
 */
function makeGetter(requiredVersion, instance, fallback) {
    return (version) => version === requiredVersion ? instance : fallback;
}
exports.makeGetter = makeGetter;
/**
 * A number which should be incremented each time a backwards incompatible
 * change is made to the API. This number is used when an API package
 * attempts to access the global API to ensure it is getting a compatible
 * version. If the global API is not compatible with the API package
 * attempting to get it, a NOOP API implementation will be returned.
 */
exports.API_BACKWARDS_COMPATIBILITY_VERSION = 0;
//# sourceMappingURL=global-utils.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/api/metrics.js":
/*!******************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/api/metrics.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopMeterProvider_1 = __webpack_require__(/*! ../metrics/NoopMeterProvider */ "./node_modules/@opentelemetry/api/build/src/metrics/NoopMeterProvider.js");
const global_utils_1 = __webpack_require__(/*! ./global-utils */ "./node_modules/@opentelemetry/api/build/src/api/global-utils.js");
/**
 * Singleton object which represents the entry point to the OpenTelemetry Metrics API
 */
class MetricsAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() { }
    /** Get the singleton instance of the Metrics API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new MetricsAPI();
        }
        return this._instance;
    }
    /**
     * Set the current global meter. Returns the initialized global meter provider.
     */
    setGlobalMeterProvider(provider) {
        if (global_utils_1._global[global_utils_1.GLOBAL_METRICS_API_KEY]) {
            // global meter provider has already been set
            return this.getMeterProvider();
        }
        global_utils_1._global[global_utils_1.GLOBAL_METRICS_API_KEY] = global_utils_1.makeGetter(global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION, provider, NoopMeterProvider_1.NOOP_METER_PROVIDER);
        return provider;
    }
    /**
     * Returns the global meter provider.
     */
    getMeterProvider() {
        var _a, _b, _c;
        return (_c = (_b = (_a = global_utils_1._global)[global_utils_1.GLOBAL_METRICS_API_KEY]) === null || _b === void 0 ? void 0 : _b.call(_a, global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION), (_c !== null && _c !== void 0 ? _c : NoopMeterProvider_1.NOOP_METER_PROVIDER));
    }
    /**
     * Returns a meter from the global meter provider.
     */
    getMeter(name, version) {
        return this.getMeterProvider().getMeter(name, version);
    }
    /** Remove the global meter provider */
    disable() {
        delete global_utils_1._global[global_utils_1.GLOBAL_METRICS_API_KEY];
    }
}
exports.MetricsAPI = MetricsAPI;
//# sourceMappingURL=metrics.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/api/propagation.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/api/propagation.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const getter_1 = __webpack_require__(/*! ../context/propagation/getter */ "./node_modules/@opentelemetry/api/build/src/context/propagation/getter.js");
const NoopHttpTextPropagator_1 = __webpack_require__(/*! ../context/propagation/NoopHttpTextPropagator */ "./node_modules/@opentelemetry/api/build/src/context/propagation/NoopHttpTextPropagator.js");
const setter_1 = __webpack_require__(/*! ../context/propagation/setter */ "./node_modules/@opentelemetry/api/build/src/context/propagation/setter.js");
const context_1 = __webpack_require__(/*! ./context */ "./node_modules/@opentelemetry/api/build/src/api/context.js");
const global_utils_1 = __webpack_require__(/*! ./global-utils */ "./node_modules/@opentelemetry/api/build/src/api/global-utils.js");
const contextApi = context_1.ContextAPI.getInstance();
/**
 * Singleton object which represents the entry point to the OpenTelemetry Propagation API
 */
class PropagationAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() { }
    /** Get the singleton instance of the Propagator API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new PropagationAPI();
        }
        return this._instance;
    }
    /**
     * Set the current propagator. Returns the initialized propagator
     */
    setGlobalPropagator(propagator) {
        if (global_utils_1._global[global_utils_1.GLOBAL_PROPAGATION_API_KEY]) {
            // global propagator has already been set
            return this._getGlobalPropagator();
        }
        global_utils_1._global[global_utils_1.GLOBAL_PROPAGATION_API_KEY] = global_utils_1.makeGetter(global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION, propagator, NoopHttpTextPropagator_1.NOOP_HTTP_TEXT_PROPAGATOR);
        return propagator;
    }
    /**
     * Inject context into a carrier to be propagated inter-process
     *
     * @param carrier carrier to inject context into
     * @param setter Function used to set values on the carrier
     * @param context Context carrying tracing data to inject. Defaults to the currently active context.
     */
    inject(carrier, setter = setter_1.defaultSetter, context = contextApi.active()) {
        return this._getGlobalPropagator().inject(context, carrier, setter);
    }
    /**
     * Extract context from a carrier
     *
     * @param carrier Carrier to extract context from
     * @param getter Function used to extract keys from a carrier
     * @param context Context which the newly created context will inherit from. Defaults to the currently active context.
     */
    extract(carrier, getter = getter_1.defaultGetter, context = contextApi.active()) {
        return this._getGlobalPropagator().extract(context, carrier, getter);
    }
    /** Remove the global propagator */
    disable() {
        delete global_utils_1._global[global_utils_1.GLOBAL_PROPAGATION_API_KEY];
    }
    _getGlobalPropagator() {
        var _a, _b, _c;
        return (_c = (_b = (_a = global_utils_1._global)[global_utils_1.GLOBAL_PROPAGATION_API_KEY]) === null || _b === void 0 ? void 0 : _b.call(_a, global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION), (_c !== null && _c !== void 0 ? _c : NoopHttpTextPropagator_1.NOOP_HTTP_TEXT_PROPAGATOR));
    }
}
exports.PropagationAPI = PropagationAPI;
//# sourceMappingURL=propagation.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/api/trace.js":
/*!****************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/api/trace.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopTracerProvider_1 = __webpack_require__(/*! ../trace/NoopTracerProvider */ "./node_modules/@opentelemetry/api/build/src/trace/NoopTracerProvider.js");
const global_utils_1 = __webpack_require__(/*! ./global-utils */ "./node_modules/@opentelemetry/api/build/src/api/global-utils.js");
/**
 * Singleton object which represents the entry point to the OpenTelemetry Tracing API
 */
class TraceAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() { }
    /** Get the singleton instance of the Trace API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new TraceAPI();
        }
        return this._instance;
    }
    /**
     * Set the current global tracer. Returns the initialized global tracer provider
     */
    setGlobalTracerProvider(provider) {
        if (global_utils_1._global[global_utils_1.GLOBAL_TRACE_API_KEY]) {
            // global tracer provider has already been set
            return this.getTracerProvider();
        }
        global_utils_1._global[global_utils_1.GLOBAL_TRACE_API_KEY] = global_utils_1.makeGetter(global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION, provider, NoopTracerProvider_1.NOOP_TRACER_PROVIDER);
        return this.getTracerProvider();
    }
    /**
     * Returns the global tracer provider.
     */
    getTracerProvider() {
        var _a, _b, _c;
        return (_c = (_b = (_a = global_utils_1._global)[global_utils_1.GLOBAL_TRACE_API_KEY]) === null || _b === void 0 ? void 0 : _b.call(_a, global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION), (_c !== null && _c !== void 0 ? _c : NoopTracerProvider_1.NOOP_TRACER_PROVIDER));
    }
    /**
     * Returns a tracer from the global tracer provider.
     */
    getTracer(name, version) {
        return this.getTracerProvider().getTracer(name, version);
    }
    /** Remove the global tracer provider */
    disable() {
        delete global_utils_1._global[global_utils_1.GLOBAL_TRACE_API_KEY];
    }
}
exports.TraceAPI = TraceAPI;
//# sourceMappingURL=trace.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/context/propagation/NoopHttpTextPropagator.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/context/propagation/NoopHttpTextPropagator.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * No-op implementations of {@link HttpTextPropagator}.
 */
class NoopHttpTextPropagator {
    /** Noop inject function does nothing */
    inject(context, carrier, setter) { }
    /** Noop extract function does nothing and returns the input context */
    extract(context, carrier, getter) {
        return context;
    }
}
exports.NoopHttpTextPropagator = NoopHttpTextPropagator;
exports.NOOP_HTTP_TEXT_PROPAGATOR = new NoopHttpTextPropagator();
//# sourceMappingURL=NoopHttpTextPropagator.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/context/propagation/getter.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/context/propagation/getter.js ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default getter which just does a simple property access. Returns
 * undefined if the key is not set.
 *
 * @param carrier
 * @param key
 */
function defaultGetter(carrier, key) {
    return carrier[key];
}
exports.defaultGetter = defaultGetter;
//# sourceMappingURL=getter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/context/propagation/setter.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/context/propagation/setter.js ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default setter which sets value via direct property access
 *
 * @param carrier
 * @param key
 */
function defaultSetter(carrier, key, value) {
    carrier[key] = value;
}
exports.defaultSetter = defaultSetter;
//# sourceMappingURL=setter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/correlation_context/EntryValue.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/correlation_context/EntryValue.js ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * EntryTtl is an integer that represents number of hops an entry can propagate.
 *
 * For now, ONLY special values (0 and -1) are supported.
 */
var EntryTtl;
(function (EntryTtl) {
    /**
     * NO_PROPAGATION is considered to have local context and is used within the
     * process it created.
     */
    EntryTtl[EntryTtl["NO_PROPAGATION"] = 0] = "NO_PROPAGATION";
    /** UNLIMITED_PROPAGATION can propagate unlimited hops. */
    EntryTtl[EntryTtl["UNLIMITED_PROPAGATION"] = -1] = "UNLIMITED_PROPAGATION";
})(EntryTtl = exports.EntryTtl || (exports.EntryTtl = {}));
//# sourceMappingURL=EntryValue.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/index.js":
/*!************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/index.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./context/propagation/getter */ "./node_modules/@opentelemetry/api/build/src/context/propagation/getter.js"));
__export(__webpack_require__(/*! ./context/propagation/NoopHttpTextPropagator */ "./node_modules/@opentelemetry/api/build/src/context/propagation/NoopHttpTextPropagator.js"));
__export(__webpack_require__(/*! ./context/propagation/setter */ "./node_modules/@opentelemetry/api/build/src/context/propagation/setter.js"));
__export(__webpack_require__(/*! ./correlation_context/EntryValue */ "./node_modules/@opentelemetry/api/build/src/correlation_context/EntryValue.js"));
__export(__webpack_require__(/*! ./metrics/Metric */ "./node_modules/@opentelemetry/api/build/src/metrics/Metric.js"));
__export(__webpack_require__(/*! ./metrics/NoopMeter */ "./node_modules/@opentelemetry/api/build/src/metrics/NoopMeter.js"));
__export(__webpack_require__(/*! ./metrics/NoopMeterProvider */ "./node_modules/@opentelemetry/api/build/src/metrics/NoopMeterProvider.js"));
__export(__webpack_require__(/*! ./trace/NoopSpan */ "./node_modules/@opentelemetry/api/build/src/trace/NoopSpan.js"));
__export(__webpack_require__(/*! ./trace/NoopTracer */ "./node_modules/@opentelemetry/api/build/src/trace/NoopTracer.js"));
__export(__webpack_require__(/*! ./trace/NoopTracerProvider */ "./node_modules/@opentelemetry/api/build/src/trace/NoopTracerProvider.js"));
__export(__webpack_require__(/*! ./trace/span_kind */ "./node_modules/@opentelemetry/api/build/src/trace/span_kind.js"));
__export(__webpack_require__(/*! ./trace/status */ "./node_modules/@opentelemetry/api/build/src/trace/status.js"));
__export(__webpack_require__(/*! ./trace/trace_flags */ "./node_modules/@opentelemetry/api/build/src/trace/trace_flags.js"));
var context_base_1 = __webpack_require__(/*! @opentelemetry/context-base */ "./node_modules/@opentelemetry/context-base/build/src/index.js");
exports.Context = context_base_1.Context;
const context_1 = __webpack_require__(/*! ./api/context */ "./node_modules/@opentelemetry/api/build/src/api/context.js");
/** Entrypoint for context API */
exports.context = context_1.ContextAPI.getInstance();
const trace_1 = __webpack_require__(/*! ./api/trace */ "./node_modules/@opentelemetry/api/build/src/api/trace.js");
/** Entrypoint for trace API */
exports.trace = trace_1.TraceAPI.getInstance();
const metrics_1 = __webpack_require__(/*! ./api/metrics */ "./node_modules/@opentelemetry/api/build/src/api/metrics.js");
/** Entrypoint for metrics API */
exports.metrics = metrics_1.MetricsAPI.getInstance();
const propagation_1 = __webpack_require__(/*! ./api/propagation */ "./node_modules/@opentelemetry/api/build/src/api/propagation.js");
/** Entrypoint for propagation API */
exports.propagation = propagation_1.PropagationAPI.getInstance();
exports.default = {
    trace: exports.trace,
    metrics: exports.metrics,
    context: exports.context,
    propagation: exports.propagation,
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/metrics/Metric.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/metrics/Metric.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** The Type of value. It describes how the data is reported. */
var ValueType;
(function (ValueType) {
    ValueType[ValueType["INT"] = 0] = "INT";
    ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
//# sourceMappingURL=Metric.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/metrics/NoopMeter.js":
/*!************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/metrics/NoopMeter.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
 * constant NoopMetrics for all of its methods.
 */
class NoopMeter {
    constructor() { }
    /**
     * Returns constant noop measure.
     * @param name the name of the metric.
     * @param [options] the metric options.
     */
    createMeasure(name, options) {
        return exports.NOOP_MEASURE_METRIC;
    }
    /**
     * Returns a constant noop counter.
     * @param name the name of the metric.
     * @param [options] the metric options.
     */
    createCounter(name, options) {
        return exports.NOOP_COUNTER_METRIC;
    }
    /**
     * Returns constant noop observer.
     * @param name the name of the metric.
     * @param [options] the metric options.
     */
    createObserver(name, options) {
        return exports.NOOP_OBSERVER_METRIC;
    }
}
exports.NoopMeter = NoopMeter;
class NoopMetric {
    constructor(instrument) {
        this._instrument = instrument;
    }
    /**
     * Returns a Bound Instrument associated with specified Labels.
     * It is recommended to keep a reference to the Bound Instrument instead of
     * always calling this method for every operations.
     * @param labels key-values pairs that are associated with a specific metric
     *     that you want to record.
     */
    bind(labels) {
        return this._instrument;
    }
    /**
     * Removes the Binding from the metric, if it is present.
     * @param labels key-values pairs that are associated with a specific metric.
     */
    unbind(labels) {
        return;
    }
    /**
     * Clears all timeseries from the Metric.
     */
    clear() {
        return;
    }
}
exports.NoopMetric = NoopMetric;
class NoopCounterMetric extends NoopMetric {
    add(value, labels) {
        this.bind(labels).add(value);
    }
}
exports.NoopCounterMetric = NoopCounterMetric;
class NoopMeasureMetric extends NoopMetric {
    record(value, labels, correlationContext, spanContext) {
        if (typeof correlationContext === 'undefined') {
            this.bind(labels).record(value);
        }
        else if (typeof spanContext === 'undefined') {
            this.bind(labels).record(value, correlationContext);
        }
        else {
            this.bind(labels).record(value, correlationContext, spanContext);
        }
    }
}
exports.NoopMeasureMetric = NoopMeasureMetric;
class NoopObserverMetric extends NoopMetric {
    setCallback(callback) { }
}
exports.NoopObserverMetric = NoopObserverMetric;
class NoopBoundCounter {
    add(value) {
        return;
    }
}
exports.NoopBoundCounter = NoopBoundCounter;
class NoopBoundMeasure {
    record(value, correlationContext, spanContext) {
        return;
    }
}
exports.NoopBoundMeasure = NoopBoundMeasure;
exports.NOOP_METER = new NoopMeter();
exports.NOOP_BOUND_COUNTER = new NoopBoundCounter();
exports.NOOP_COUNTER_METRIC = new NoopCounterMetric(exports.NOOP_BOUND_COUNTER);
exports.NOOP_BOUND_MEASURE = new NoopBoundMeasure();
exports.NOOP_MEASURE_METRIC = new NoopMeasureMetric(exports.NOOP_BOUND_MEASURE);
exports.NOOP_OBSERVER_METRIC = new NoopObserverMetric();
//# sourceMappingURL=NoopMeter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/metrics/NoopMeterProvider.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/metrics/NoopMeterProvider.js ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopMeter_1 = __webpack_require__(/*! ./NoopMeter */ "./node_modules/@opentelemetry/api/build/src/metrics/NoopMeter.js");
/**
 * An implementation of the {@link MeterProvider} which returns an impotent Meter
 * for all calls to `getMeter`
 */
class NoopMeterProvider {
    getMeter(_name, _version) {
        return NoopMeter_1.NOOP_METER;
    }
}
exports.NoopMeterProvider = NoopMeterProvider;
exports.NOOP_METER_PROVIDER = new NoopMeterProvider();
//# sourceMappingURL=NoopMeterProvider.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/platform/browser/globalThis.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/platform/browser/globalThis.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** only globals that common to node and browsers are allowed */
// eslint-disable-next-line node/no-unsupported-features/es-builtins, no-undef
exports._globalThis = typeof globalThis === 'object' ? globalThis : window;
//# sourceMappingURL=globalThis.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/platform/browser/index.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/platform/browser/index.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./globalThis */ "./node_modules/@opentelemetry/api/build/src/platform/browser/globalThis.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/trace/NoopSpan.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/trace/NoopSpan.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const trace_flags_1 = __webpack_require__(/*! ./trace_flags */ "./node_modules/@opentelemetry/api/build/src/trace/trace_flags.js");
exports.INVALID_TRACE_ID = '0';
exports.INVALID_SPAN_ID = '0';
const INVALID_SPAN_CONTEXT = {
    traceId: exports.INVALID_TRACE_ID,
    spanId: exports.INVALID_SPAN_ID,
    traceFlags: trace_flags_1.TraceFlags.NONE,
};
/**
 * The NoopSpan is the default {@link Span} that is used when no Span
 * implementation is available. All operations are no-op including context
 * propagation.
 */
class NoopSpan {
    constructor(_spanContext = INVALID_SPAN_CONTEXT) {
        this._spanContext = _spanContext;
    }
    // Returns a SpanContext.
    context() {
        return this._spanContext;
    }
    // By default does nothing
    setAttribute(key, value) {
        return this;
    }
    // By default does nothing
    setAttributes(attributes) {
        return this;
    }
    // By default does nothing
    addEvent(name, attributes) {
        return this;
    }
    // By default does nothing
    setStatus(status) {
        return this;
    }
    // By default does nothing
    updateName(name) {
        return this;
    }
    // By default does nothing
    end(endTime) { }
    // isRecording always returns false for noopSpan.
    isRecording() {
        return false;
    }
}
exports.NoopSpan = NoopSpan;
exports.NOOP_SPAN = new NoopSpan();
//# sourceMappingURL=NoopSpan.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/trace/NoopTracer.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/trace/NoopTracer.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopSpan_1 = __webpack_require__(/*! ./NoopSpan */ "./node_modules/@opentelemetry/api/build/src/trace/NoopSpan.js");
/**
 * No-op implementations of {@link Tracer}.
 */
class NoopTracer {
    getCurrentSpan() {
        return NoopSpan_1.NOOP_SPAN;
    }
    // startSpan starts a noop span.
    startSpan(name, options) {
        return NoopSpan_1.NOOP_SPAN;
    }
    withSpan(span, fn) {
        return fn();
    }
    bind(target, span) {
        return target;
    }
}
exports.NoopTracer = NoopTracer;
exports.NOOP_TRACER = new NoopTracer();
//# sourceMappingURL=NoopTracer.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/trace/NoopTracerProvider.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/trace/NoopTracerProvider.js ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopTracer_1 = __webpack_require__(/*! ./NoopTracer */ "./node_modules/@opentelemetry/api/build/src/trace/NoopTracer.js");
/**
 * An implementation of the {@link TracerProvider} which returns an impotent
 * Tracer for all calls to `getTracer`.
 *
 * All operations are no-op.
 */
class NoopTracerProvider {
    getTracer(_name, _version) {
        return NoopTracer_1.NOOP_TRACER;
    }
}
exports.NoopTracerProvider = NoopTracerProvider;
exports.NOOP_TRACER_PROVIDER = new NoopTracerProvider();
//# sourceMappingURL=NoopTracerProvider.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/trace/span_kind.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/trace/span_kind.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Type of span. Can be used to specify additional relationships between spans
 * in addition to a parent/child relationship.
 */
var SpanKind;
(function (SpanKind) {
    /** Default value. Indicates that the span is used internally. */
    SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
    /**
     * Indicates that the span covers server-side handling of an RPC or other
     * remote request.
     */
    SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
    /**
     * Indicates that the span covers the client-side wrapper around an RPC or
     * other remote request.
     */
    SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
    /**
     * Indicates that the span describes producer sending a message to a
     * broker. Unlike client and server, there is no direct critical path latency
     * relationship between producer and consumer spans.
     */
    SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
    /**
     * Indicates that the span describes consumer receiving a message from a
     * broker. Unlike client and server, there is no direct critical path latency
     * relationship between producer and consumer spans.
     */
    SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
})(SpanKind = exports.SpanKind || (exports.SpanKind = {}));
//# sourceMappingURL=span_kind.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/trace/status.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/trace/status.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An enumeration of canonical status codes.
 */
var CanonicalCode;
(function (CanonicalCode) {
    /**
     * Not an error; returned on success
     */
    CanonicalCode[CanonicalCode["OK"] = 0] = "OK";
    /**
     * The operation was cancelled (typically by the caller).
     */
    CanonicalCode[CanonicalCode["CANCELLED"] = 1] = "CANCELLED";
    /**
     * Unknown error.  An example of where this error may be returned is
     * if a status value received from another address space belongs to
     * an error-space that is not known in this address space.  Also
     * errors raised by APIs that do not return enough error information
     * may be converted to this error.
     */
    CanonicalCode[CanonicalCode["UNKNOWN"] = 2] = "UNKNOWN";
    /**
     * Client specified an invalid argument.  Note that this differs
     * from FAILED_PRECONDITION.  INVALID_ARGUMENT indicates arguments
     * that are problematic regardless of the state of the system
     * (e.g., a malformed file name).
     */
    CanonicalCode[CanonicalCode["INVALID_ARGUMENT"] = 3] = "INVALID_ARGUMENT";
    /**
     * Deadline expired before operation could complete.  For operations
     * that change the state of the system, this error may be returned
     * even if the operation has completed successfully.  For example, a
     * successful response from a server could have been delayed long
     * enough for the deadline to expire.
     */
    CanonicalCode[CanonicalCode["DEADLINE_EXCEEDED"] = 4] = "DEADLINE_EXCEEDED";
    /**
     * Some requested entity (e.g., file or directory) was not found.
     */
    CanonicalCode[CanonicalCode["NOT_FOUND"] = 5] = "NOT_FOUND";
    /**
     * Some entity that we attempted to create (e.g., file or directory)
     * already exists.
     */
    CanonicalCode[CanonicalCode["ALREADY_EXISTS"] = 6] = "ALREADY_EXISTS";
    /**
     * The caller does not have permission to execute the specified
     * operation.  PERMISSION_DENIED must not be used for rejections
     * caused by exhausting some resource (use RESOURCE_EXHAUSTED
     * instead for those errors).  PERMISSION_DENIED must not be
     * used if the caller can not be identified (use UNAUTHENTICATED
     * instead for those errors).
     */
    CanonicalCode[CanonicalCode["PERMISSION_DENIED"] = 7] = "PERMISSION_DENIED";
    /**
     * Some resource has been exhausted, perhaps a per-user quota, or
     * perhaps the entire file system is out of space.
     */
    CanonicalCode[CanonicalCode["RESOURCE_EXHAUSTED"] = 8] = "RESOURCE_EXHAUSTED";
    /**
     * Operation was rejected because the system is not in a state
     * required for the operation's execution.  For example, directory
     * to be deleted may be non-empty, an rmdir operation is applied to
     * a non-directory, etc.
     *
     * A litmus test that may help a service implementor in deciding
     * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
     *
     *  - Use UNAVAILABLE if the client can retry just the failing call.
     *  - Use ABORTED if the client should retry at a higher-level
     *    (e.g., restarting a read-modify-write sequence).
     *  - Use FAILED_PRECONDITION if the client should not retry until
     *    the system state has been explicitly fixed.  E.g., if an "rmdir"
     *    fails because the directory is non-empty, FAILED_PRECONDITION
     *    should be returned since the client should not retry unless
     *    they have first fixed up the directory by deleting files from it.
     *  - Use FAILED_PRECONDITION if the client performs conditional
     *    REST Get/Update/Delete on a resource and the resource on the
     *    server does not match the condition. E.g., conflicting
     *    read-modify-write on the same resource.
     */
    CanonicalCode[CanonicalCode["FAILED_PRECONDITION"] = 9] = "FAILED_PRECONDITION";
    /**
     * The operation was aborted, typically due to a concurrency issue
     * like sequencer check failures, transaction aborts, etc.
     *
     * See litmus test above for deciding between FAILED_PRECONDITION,
     * ABORTED, and UNAVAILABLE.
     */
    CanonicalCode[CanonicalCode["ABORTED"] = 10] = "ABORTED";
    /**
     * Operation was attempted past the valid range.  E.g., seeking or
     * reading past end of file.
     *
     * Unlike INVALID_ARGUMENT, this error indicates a problem that may
     * be fixed if the system state changes. For example, a 32-bit file
     * system will generate INVALID_ARGUMENT if asked to read at an
     * offset that is not in the range [0,2^32-1], but it will generate
     * OUT_OF_RANGE if asked to read from an offset past the current
     * file size.
     *
     * There is a fair bit of overlap between FAILED_PRECONDITION and
     * OUT_OF_RANGE.  We recommend using OUT_OF_RANGE (the more specific
     * error) when it applies so that callers who are iterating through
     * a space can easily look for an OUT_OF_RANGE error to detect when
     * they are done.
     */
    CanonicalCode[CanonicalCode["OUT_OF_RANGE"] = 11] = "OUT_OF_RANGE";
    /**
     * Operation is not implemented or not supported/enabled in this service.
     */
    CanonicalCode[CanonicalCode["UNIMPLEMENTED"] = 12] = "UNIMPLEMENTED";
    /**
     * Internal errors.  Means some invariants expected by underlying
     * system has been broken.  If you see one of these errors,
     * something is very broken.
     */
    CanonicalCode[CanonicalCode["INTERNAL"] = 13] = "INTERNAL";
    /**
     * The service is currently unavailable.  This is a most likely a
     * transient condition and may be corrected by retrying with
     * a backoff.
     *
     * See litmus test above for deciding between FAILED_PRECONDITION,
     * ABORTED, and UNAVAILABLE.
     */
    CanonicalCode[CanonicalCode["UNAVAILABLE"] = 14] = "UNAVAILABLE";
    /**
     * Unrecoverable data loss or corruption.
     */
    CanonicalCode[CanonicalCode["DATA_LOSS"] = 15] = "DATA_LOSS";
    /**
     * The request does not have valid authentication credentials for the
     * operation.
     */
    CanonicalCode[CanonicalCode["UNAUTHENTICATED"] = 16] = "UNAUTHENTICATED";
})(CanonicalCode = exports.CanonicalCode || (exports.CanonicalCode = {}));
//# sourceMappingURL=status.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/api/build/src/trace/trace_flags.js":
/*!************************************************************************!*\
  !*** ./node_modules/@opentelemetry/api/build/src/trace/trace_flags.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An enumeration that represents global trace flags. These flags are
 * propagated to all child {@link Span}. These determine features such as
 * whether a Span should be traced. It is implemented as a bitmask.
 */
var TraceFlags;
(function (TraceFlags) {
    /** Represents no flag set. */
    TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
    /** Bit to represent whether trace is sampled in trace flags. */
    TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
})(TraceFlags = exports.TraceFlags || (exports.TraceFlags = {}));
//# sourceMappingURL=trace_flags.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/base/build/src/ExportResult.js":
/*!********************************************************************!*\
  !*** ./node_modules/@opentelemetry/base/build/src/ExportResult.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ExportResult;
(function (ExportResult) {
    ExportResult[ExportResult["SUCCESS"] = 0] = "SUCCESS";
    ExportResult[ExportResult["FAILED_NOT_RETRYABLE"] = 1] = "FAILED_NOT_RETRYABLE";
    ExportResult[ExportResult["FAILED_RETRYABLE"] = 2] = "FAILED_RETRYABLE";
})(ExportResult = exports.ExportResult || (exports.ExportResult = {}));
//# sourceMappingURL=ExportResult.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/base/build/src/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/@opentelemetry/base/build/src/index.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./ExportResult */ "./node_modules/@opentelemetry/base/build/src/ExportResult.js"));
__export(__webpack_require__(/*! ./platform */ "./node_modules/@opentelemetry/base/build/src/platform/browser/index.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/base/build/src/platform/browser/constants.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/base/build/src/platform/browser/constants.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const version_1 = __webpack_require__(/*! ../../version */ "./node_modules/@opentelemetry/base/build/src/version.js");
/** Constants describing the SDK in use */
exports.SDK_INFO = {
    NAME: 'opentelemetry',
    RUNTIME: 'browser',
    LANGUAGE: 'webjs',
    VERSION: version_1.VERSION,
};
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/base/build/src/platform/browser/index.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@opentelemetry/base/build/src/platform/browser/index.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./constants */ "./node_modules/@opentelemetry/base/build/src/platform/browser/constants.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/base/build/src/version.js":
/*!***************************************************************!*\
  !*** ./node_modules/@opentelemetry/base/build/src/version.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// this is autogenerated file, see scripts/version-update.js
exports.VERSION = '0.6.1';
//# sourceMappingURL=version.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/context-base/build/src/NoopContextManager.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/context-base/build/src/NoopContextManager.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = __webpack_require__(/*! ./context */ "./node_modules/@opentelemetry/context-base/build/src/context.js");
class NoopContextManager {
    active() {
        return context_1.Context.ROOT_CONTEXT;
    }
    with(context, fn) {
        return fn();
    }
    bind(target, context) {
        return target;
    }
    enable() {
        return this;
    }
    disable() {
        return this;
    }
}
exports.NoopContextManager = NoopContextManager;
//# sourceMappingURL=NoopContextManager.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/context-base/build/src/context.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@opentelemetry/context-base/build/src/context.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class which stores and manages current context values. All methods which
 * update context such as get and delete do not modify an existing context,
 * but create a new one with updated values.
 */
class Context {
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext) {
        this._currentContext = parentContext ? new Map(parentContext) : new Map();
    }
    /** Get a key to uniquely identify a context value */
    static createKey(description) {
        return Symbol(description);
    }
    /**
     * Get a value from the context.
     *
     * @param key key which identifies a context value
     */
    getValue(key) {
        return this._currentContext.get(key);
    }
    /**
     * Create a new context which inherits from this context and has
     * the given key set to the given value.
     *
     * @param key context key for which to set the value
     * @param value value to set for the given key
     */
    setValue(key, value) {
        const context = new Context(this._currentContext);
        context._currentContext.set(key, value);
        return context;
    }
    /**
     * Return a new context which inherits from this context but does
     * not contain a value for the given key.
     *
     * @param key context key for which to clear a value
     */
    deleteValue(key) {
        const context = new Context(this._currentContext);
        context._currentContext.delete(key);
        return context;
    }
}
exports.Context = Context;
/** The root context is used as the default parent context when there is no active context */
Context.ROOT_CONTEXT = new Context();
/**
 * This is another identifier to the root context which allows developers to easily search the
 * codebase for direct uses of context which need to be removed in later PRs.
 *
 * It's existence is temporary and it should be removed when all references are fixed.
 */
Context.TODO = Context.ROOT_CONTEXT;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/context-base/build/src/index.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@opentelemetry/context-base/build/src/index.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./context */ "./node_modules/@opentelemetry/context-base/build/src/context.js"));
__export(__webpack_require__(/*! ./NoopContextManager */ "./node_modules/@opentelemetry/context-base/build/src/NoopContextManager.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/ExportResult.js":
/*!********************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/ExportResult.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ExportResult;
(function (ExportResult) {
    ExportResult[ExportResult["SUCCESS"] = 0] = "SUCCESS";
    ExportResult[ExportResult["FAILED_NOT_RETRYABLE"] = 1] = "FAILED_NOT_RETRYABLE";
    ExportResult[ExportResult["FAILED_RETRYABLE"] = 2] = "FAILED_RETRYABLE";
})(ExportResult = exports.ExportResult || (exports.ExportResult = {}));
//# sourceMappingURL=ExportResult.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/common/ConsoleLogger.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/common/ConsoleLogger.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/@opentelemetry/core/build/src/common/types.js");
class ConsoleLogger {
    constructor(level = types_1.LogLevel.INFO) {
        if (level >= types_1.LogLevel.DEBUG) {
            this.debug = (...args) => {
                console.debug(...args);
            };
        }
        if (level >= types_1.LogLevel.INFO) {
            this.info = (...args) => {
                console.info(...args);
            };
        }
        if (level >= types_1.LogLevel.WARN) {
            this.warn = (...args) => {
                console.warn(...args);
            };
        }
        if (level >= types_1.LogLevel.ERROR) {
            this.error = (...args) => {
                console.error(...args);
            };
        }
    }
    debug(message, ...args) { }
    error(message, ...args) { }
    warn(message, ...args) { }
    info(message, ...args) { }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=ConsoleLogger.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/common/NoopLogger.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/common/NoopLogger.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** No-op implementation of Logger */
class NoopLogger {
    // By default does nothing
    debug(message, ...args) { }
    // By default does nothing
    error(message, ...args) { }
    // By default does nothing
    warn(message, ...args) { }
    // By default does nothing
    info(message, ...args) { }
}
exports.NoopLogger = NoopLogger;
//# sourceMappingURL=NoopLogger.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/common/time.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/common/time.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = __webpack_require__(/*! ../platform */ "./node_modules/@opentelemetry/core/build/src/platform/browser/index.js");
const NANOSECOND_DIGITS = 9;
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
/**
 * Converts a number to HrTime
 * @param epochMillis
 */
function numberToHrtime(epochMillis) {
    const epochSeconds = epochMillis / 1000;
    // Decimals only.
    const seconds = Math.trunc(epochSeconds);
    // Round sub-nanosecond accuracy to nanosecond.
    const nanos = Number((epochSeconds - seconds).toFixed(NANOSECOND_DIGITS)) *
        SECOND_TO_NANOSECONDS;
    return [seconds, nanos];
}
function getTimeOrigin() {
    let timeOrigin = platform_1.otperformance.timeOrigin;
    if (typeof timeOrigin !== 'number') {
        const perf = platform_1.otperformance;
        timeOrigin = perf.timing && perf.timing.fetchStart;
    }
    return timeOrigin;
}
/**
 * Returns an hrtime calculated via performance component.
 * @param performanceNow
 */
function hrTime(performanceNow) {
    const timeOrigin = numberToHrtime(getTimeOrigin());
    const now = numberToHrtime(typeof performanceNow === 'number' ? performanceNow : platform_1.otperformance.now());
    let seconds = timeOrigin[0] + now[0];
    let nanos = timeOrigin[1] + now[1];
    // Nanoseconds
    if (nanos > SECOND_TO_NANOSECONDS) {
        nanos -= SECOND_TO_NANOSECONDS;
        seconds += 1;
    }
    return [seconds, nanos];
}
exports.hrTime = hrTime;
/**
 *
 * Converts a TimeInput to an HrTime, defaults to _hrtime().
 * @param time
 */
function timeInputToHrTime(time) {
    // process.hrtime
    if (isTimeInputHrTime(time)) {
        return time;
    }
    else if (typeof time === 'number') {
        // Must be a performance.now() if it's smaller than process start time.
        if (time < getTimeOrigin()) {
            return hrTime(time);
        }
        else {
            // epoch milliseconds or performance.timeOrigin
            return numberToHrtime(time);
        }
    }
    else if (time instanceof Date) {
        return [time.getTime(), 0];
    }
    else {
        throw TypeError('Invalid input type');
    }
}
exports.timeInputToHrTime = timeInputToHrTime;
/**
 * Returns a duration of two hrTime.
 * @param startTime
 * @param endTime
 */
function hrTimeDuration(startTime, endTime) {
    let seconds = endTime[0] - startTime[0];
    let nanos = endTime[1] - startTime[1];
    // overflow
    if (nanos < 0) {
        seconds -= 1;
        // negate
        nanos += SECOND_TO_NANOSECONDS;
    }
    return [seconds, nanos];
}
exports.hrTimeDuration = hrTimeDuration;
/**
 * Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
 * @param hrTime
 */
function hrTimeToTimeStamp(hrTime) {
    const precision = NANOSECOND_DIGITS;
    const tmp = `${'0'.repeat(precision)}${hrTime[1]}Z`;
    const nanoString = tmp.substr(tmp.length - precision - 1);
    const date = new Date(hrTime[0] * 1000).toISOString();
    return date.replace('000Z', nanoString);
}
exports.hrTimeToTimeStamp = hrTimeToTimeStamp;
/**
 * Convert hrTime to nanoseconds.
 * @param hrTime
 */
function hrTimeToNanoseconds(hrTime) {
    return hrTime[0] * SECOND_TO_NANOSECONDS + hrTime[1];
}
exports.hrTimeToNanoseconds = hrTimeToNanoseconds;
/**
 * Convert hrTime to milliseconds.
 * @param hrTime
 */
function hrTimeToMilliseconds(hrTime) {
    return Math.round(hrTime[0] * 1e3 + hrTime[1] / 1e6);
}
exports.hrTimeToMilliseconds = hrTimeToMilliseconds;
/**
 * Convert hrTime to microseconds.
 * @param hrTime
 */
function hrTimeToMicroseconds(hrTime) {
    return Math.round(hrTime[0] * 1e6 + hrTime[1] / 1e3);
}
exports.hrTimeToMicroseconds = hrTimeToMicroseconds;
/**
 * check if time is HrTime
 * @param value
 */
function isTimeInputHrTime(value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number');
}
exports.isTimeInputHrTime = isTimeInputHrTime;
/**
 * check if input value is a correct types.TimeInput
 * @param value
 */
function isTimeInput(value) {
    return (isTimeInputHrTime(value) ||
        typeof value === 'number' ||
        value instanceof Date);
}
exports.isTimeInput = isTimeInput;
//# sourceMappingURL=time.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/common/types.js":
/*!********************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/common/types.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** Defines a log levels. */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/context/context.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/context/context.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const context_base_1 = __webpack_require__(/*! @opentelemetry/context-base */ "./node_modules/@opentelemetry/context-base/build/src/index.js");
/**
 * Active span key
 */
exports.ACTIVE_SPAN_KEY = context_base_1.Context.createKey('OpenTelemetry Context Key ACTIVE_SPAN');
const EXTRACTED_SPAN_CONTEXT_KEY = context_base_1.Context.createKey('OpenTelemetry Context Key EXTRACTED_SPAN_CONTEXT');
/**
 * Return the active span if one exists
 *
 * @param context context to get span from
 */
function getActiveSpan(context) {
    return context.getValue(exports.ACTIVE_SPAN_KEY) || undefined;
}
exports.getActiveSpan = getActiveSpan;
/**
 * Set the active span on a context
 *
 * @param context context to use as parent
 * @param span span to set active
 */
function setActiveSpan(context, span) {
    return context.setValue(exports.ACTIVE_SPAN_KEY, span);
}
exports.setActiveSpan = setActiveSpan;
/**
 * Get the extracted span context from a context
 *
 * @param context context to get span context from
 */
function getExtractedSpanContext(context) {
    return (context.getValue(EXTRACTED_SPAN_CONTEXT_KEY) || undefined);
}
exports.getExtractedSpanContext = getExtractedSpanContext;
/**
 * Set the extracted span context on a context
 *
 * @param context context to set span context on
 * @param spanContext span context to set
 */
function setExtractedSpanContext(context, spanContext) {
    return context.setValue(EXTRACTED_SPAN_CONTEXT_KEY, spanContext);
}
exports.setExtractedSpanContext = setExtractedSpanContext;
/**
 * Get the span context of the parent span if it exists,
 * or the extracted span context if there is no active
 * span.
 *
 * @param context context to get values from
 */
function getParentSpanContext(context) {
    var _a;
    return ((_a = getActiveSpan(context)) === null || _a === void 0 ? void 0 : _a.context()) || getExtractedSpanContext(context);
}
exports.getParentSpanContext = getParentSpanContext;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/context/propagation/B3Propagator.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/context/propagation/B3Propagator.js ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
const context_1 = __webpack_require__(/*! ../context */ "./node_modules/@opentelemetry/core/build/src/context/context.js");
exports.X_B3_TRACE_ID = 'x-b3-traceid';
exports.X_B3_SPAN_ID = 'x-b3-spanid';
exports.X_B3_SAMPLED = 'x-b3-sampled';
const VALID_TRACEID_REGEX = /^([0-9a-f]{16}){1,2}$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
const INVALID_ID_REGEX = /^0+$/i;
function isValidTraceId(traceId) {
    return VALID_TRACEID_REGEX.test(traceId) && !INVALID_ID_REGEX.test(traceId);
}
function isValidSpanId(spanId) {
    return VALID_SPANID_REGEX.test(spanId) && !INVALID_ID_REGEX.test(spanId);
}
/**
 * Propagator for the B3 HTTP header format.
 * Based on: https://github.com/openzipkin/b3-propagation
 */
class B3Propagator {
    inject(context, carrier, setter) {
        const spanContext = context_1.getParentSpanContext(context);
        if (!spanContext)
            return;
        if (isValidTraceId(spanContext.traceId) &&
            isValidSpanId(spanContext.spanId)) {
            setter(carrier, exports.X_B3_TRACE_ID, spanContext.traceId);
            setter(carrier, exports.X_B3_SPAN_ID, spanContext.spanId);
            // We set the header only if there is an existing sampling decision.
            // Otherwise we will omit it => Absent.
            if (spanContext.traceFlags !== undefined) {
                setter(carrier, exports.X_B3_SAMPLED, (api_1.TraceFlags.SAMPLED & spanContext.traceFlags) === api_1.TraceFlags.SAMPLED
                    ? '1'
                    : '0');
            }
        }
    }
    extract(context, carrier, getter) {
        const traceIdHeader = getter(carrier, exports.X_B3_TRACE_ID);
        const spanIdHeader = getter(carrier, exports.X_B3_SPAN_ID);
        const sampledHeader = getter(carrier, exports.X_B3_SAMPLED);
        const traceIdHeaderValue = Array.isArray(traceIdHeader)
            ? traceIdHeader[0]
            : traceIdHeader;
        const spanId = Array.isArray(spanIdHeader) ? spanIdHeader[0] : spanIdHeader;
        const options = Array.isArray(sampledHeader)
            ? sampledHeader[0]
            : sampledHeader;
        if (typeof traceIdHeaderValue !== 'string' || typeof spanId !== 'string') {
            return context;
        }
        const traceId = traceIdHeaderValue.padStart(32, '0');
        if (isValidTraceId(traceId) && isValidSpanId(spanId)) {
            return context_1.setExtractedSpanContext(context, {
                traceId,
                spanId,
                isRemote: true,
                traceFlags: isNaN(Number(options)) ? api_1.TraceFlags.NONE : Number(options),
            });
        }
        return context;
    }
}
exports.B3Propagator = B3Propagator;
//# sourceMappingURL=B3Propagator.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/context/propagation/HttpTraceContext.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/context/propagation/HttpTraceContext.js ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
const TraceState_1 = __webpack_require__(/*! ../../trace/TraceState */ "./node_modules/@opentelemetry/core/build/src/trace/TraceState.js");
const context_1 = __webpack_require__(/*! ../context */ "./node_modules/@opentelemetry/core/build/src/context/context.js");
exports.TRACE_PARENT_HEADER = 'traceparent';
exports.TRACE_STATE_HEADER = 'tracestate';
const VALID_TRACE_PARENT_REGEX = /^00-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/;
const VERSION = '00';
/**
 * Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
 * @param traceParent - A meta property that comes from server.
 *     It should be dynamically generated server side to have the server's request trace Id,
 *     a parent span Id that was set on the server's request span,
 *     and the trace flags to indicate the server's sampling decision
 *     (01 = sampled, 00 = not sampled).
 *     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
 *     For more information see {@link https://www.w3.org/TR/trace-context/}
 */
function parseTraceParent(traceParent) {
    const match = traceParent.match(VALID_TRACE_PARENT_REGEX);
    if (!match ||
        match[1] === '00000000000000000000000000000000' ||
        match[2] === '0000000000000000') {
        return null;
    }
    return {
        traceId: match[1],
        spanId: match[2],
        traceFlags: parseInt(match[3], 16),
    };
}
exports.parseTraceParent = parseTraceParent;
/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 *
 * Based on the Trace Context specification:
 * https://www.w3.org/TR/trace-context/
 */
class HttpTraceContext {
    inject(context, carrier, setter) {
        const spanContext = context_1.getParentSpanContext(context);
        if (!spanContext)
            return;
        const traceParent = `${VERSION}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || api_1.TraceFlags.NONE).toString(16)}`;
        setter(carrier, exports.TRACE_PARENT_HEADER, traceParent);
        if (spanContext.traceState) {
            setter(carrier, exports.TRACE_STATE_HEADER, spanContext.traceState.serialize());
        }
    }
    extract(context, carrier, getter) {
        const traceParentHeader = getter(carrier, exports.TRACE_PARENT_HEADER);
        if (!traceParentHeader)
            return context;
        const traceParent = Array.isArray(traceParentHeader)
            ? traceParentHeader[0]
            : traceParentHeader;
        if (typeof traceParent !== 'string')
            return context;
        const spanContext = parseTraceParent(traceParent);
        if (!spanContext)
            return context;
        spanContext.isRemote = true;
        const traceStateHeader = getter(carrier, exports.TRACE_STATE_HEADER);
        if (traceStateHeader) {
            // If more than one `tracestate` header is found, we merge them into a
            // single header.
            const state = Array.isArray(traceStateHeader)
                ? traceStateHeader.join(',')
                : traceStateHeader;
            spanContext.traceState = new TraceState_1.TraceState(typeof state === 'string' ? state : undefined);
        }
        return context_1.setExtractedSpanContext(context, spanContext);
    }
}
exports.HttpTraceContext = HttpTraceContext;
//# sourceMappingURL=HttpTraceContext.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/context/propagation/composite.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/context/propagation/composite.js ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopLogger_1 = __webpack_require__(/*! ../../common/NoopLogger */ "./node_modules/@opentelemetry/core/build/src/common/NoopLogger.js");
/** Combines multiple propagators into a single propagator. */
class CompositePropagator {
    /**
     * Construct a composite propagator from a list of propagators.
     *
     * @param [config] Configuration object for composite propagator
     */
    constructor(config = {}) {
        var _a, _b;
        this._propagators = (_a = config.propagators, (_a !== null && _a !== void 0 ? _a : []));
        this._logger = (_b = config.logger, (_b !== null && _b !== void 0 ? _b : new NoopLogger_1.NoopLogger()));
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same carrier key, the propagator later in the list
     * will "win".
     *
     * @param context Context to inject
     * @param carrier Carrier into which context will be injected
     */
    inject(context, carrier, setter) {
        for (const propagator of this._propagators) {
            try {
                propagator.inject(context, carrier, setter);
            }
            catch (err) {
                this._logger.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
            }
        }
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same context key, the propagator later in the list
     * will "win".
     *
     * @param context Context to add values to
     * @param carrier Carrier from which to extract context
     */
    extract(context, carrier, getter) {
        return this._propagators.reduce((ctx, propagator) => {
            try {
                return propagator.extract(ctx, carrier, getter);
            }
            catch (err) {
                this._logger.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
            }
            return ctx;
        }, context);
    }
}
exports.CompositePropagator = CompositePropagator;
//# sourceMappingURL=composite.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/correlation-context/correlation-context.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/correlation-context/correlation-context.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const context_base_1 = __webpack_require__(/*! @opentelemetry/context-base */ "./node_modules/@opentelemetry/context-base/build/src/index.js");
const CORRELATION_CONTEXT = context_base_1.Context.createKey('OpenTelemetry Distributed Contexts Key');
/**
 * @param {Context} Context that manage all context values
 * @returns {CorrelationContext} Extracted correlation context from the context
 */
function getCorrelationContext(context) {
    return (context.getValue(CORRELATION_CONTEXT) || undefined);
}
exports.getCorrelationContext = getCorrelationContext;
/**
 * @param {Context} Context that manage all context values
 * @param {CorrelationContext} correlation context that will be set in the actual context
 */
function setCorrelationContext(context, correlationContext) {
    return context.setValue(CORRELATION_CONTEXT, correlationContext);
}
exports.setCorrelationContext = setCorrelationContext;
//# sourceMappingURL=correlation-context.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/correlation-context/propagation/HttpCorrelationContext.js":
/*!**************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/correlation-context/propagation/HttpCorrelationContext.js ***!
  \**************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const correlation_context_1 = __webpack_require__(/*! ../correlation-context */ "./node_modules/@opentelemetry/core/build/src/correlation-context/correlation-context.js");
const KEY_PAIR_SEPARATOR = '=';
const PROPERTIES_SEPARATOR = ';';
const ITEMS_SEPARATOR = ',';
// Name of the http header used to propagate the correlation context
exports.CORRELATION_CONTEXT_HEADER = 'otcorrelations';
// Maximum number of name-value pairs allowed by w3c spec
exports.MAX_NAME_VALUE_PAIRS = 180;
// Maximum number of bytes per a single name-value pair allowed by w3c spec
exports.MAX_PER_NAME_VALUE_PAIRS = 4096;
// Maximum total length of all name-value pairs allowed by w3c spec
exports.MAX_TOTAL_LENGTH = 8192;
/**
 * Propagates {@link CorrelationContext} through Context format propagation.
 *
 * Based on the Correlation Context specification:
 * https://w3c.github.io/correlation-context/
 */
class HttpCorrelationContext {
    inject(context, carrier, setter) {
        const correlationContext = correlation_context_1.getCorrelationContext(context);
        if (!correlationContext)
            return;
        const keyPairs = this._getKeyPairs(correlationContext)
            .filter((pair) => {
            return pair.length <= exports.MAX_PER_NAME_VALUE_PAIRS;
        })
            .slice(0, exports.MAX_NAME_VALUE_PAIRS);
        const headerValue = this._serializeKeyPairs(keyPairs);
        if (headerValue.length > 0) {
            setter(carrier, exports.CORRELATION_CONTEXT_HEADER, headerValue);
        }
    }
    _serializeKeyPairs(keyPairs) {
        return keyPairs.reduce((hValue, current) => {
            const value = `${hValue}${hValue != '' ? ITEMS_SEPARATOR : ''}${current}`;
            return value.length > exports.MAX_TOTAL_LENGTH ? hValue : value;
        }, '');
    }
    _getKeyPairs(correlationContext) {
        return Object.keys(correlationContext).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(correlationContext[key].value)}`);
    }
    extract(context, carrier, getter) {
        const headerValue = getter(carrier, exports.CORRELATION_CONTEXT_HEADER);
        if (!headerValue)
            return context;
        const correlationContext = {};
        if (headerValue.length == 0) {
            return context;
        }
        const pairs = headerValue.split(ITEMS_SEPARATOR);
        if (pairs.length == 1)
            return context;
        pairs.forEach(entry => {
            const keyPair = this._parsePairKeyValue(entry);
            if (keyPair) {
                correlationContext[keyPair.key] = { value: keyPair.value };
            }
        });
        return correlation_context_1.setCorrelationContext(context, correlationContext);
    }
    _parsePairKeyValue(entry) {
        const valueProps = entry.split(PROPERTIES_SEPARATOR);
        if (valueProps.length <= 0)
            return;
        const keyPairPart = valueProps.shift();
        if (!keyPairPart)
            return;
        const keyPair = keyPairPart.split(KEY_PAIR_SEPARATOR);
        if (keyPair.length <= 1)
            return;
        const key = decodeURIComponent(keyPair[0].trim());
        let value = decodeURIComponent(keyPair[1].trim());
        if (valueProps.length > 0) {
            value =
                value + PROPERTIES_SEPARATOR + valueProps.join(PROPERTIES_SEPARATOR);
        }
        return { key, value };
    }
}
exports.HttpCorrelationContext = HttpCorrelationContext;
//# sourceMappingURL=HttpCorrelationContext.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/index.js":
/*!*************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/index.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./common/ConsoleLogger */ "./node_modules/@opentelemetry/core/build/src/common/ConsoleLogger.js"));
__export(__webpack_require__(/*! ./common/NoopLogger */ "./node_modules/@opentelemetry/core/build/src/common/NoopLogger.js"));
__export(__webpack_require__(/*! ./common/time */ "./node_modules/@opentelemetry/core/build/src/common/time.js"));
__export(__webpack_require__(/*! ./common/types */ "./node_modules/@opentelemetry/core/build/src/common/types.js"));
__export(__webpack_require__(/*! ./ExportResult */ "./node_modules/@opentelemetry/core/build/src/ExportResult.js"));
__export(__webpack_require__(/*! ./version */ "./node_modules/@opentelemetry/core/build/src/version.js"));
__export(__webpack_require__(/*! ./context/context */ "./node_modules/@opentelemetry/core/build/src/context/context.js"));
__export(__webpack_require__(/*! ./context/propagation/B3Propagator */ "./node_modules/@opentelemetry/core/build/src/context/propagation/B3Propagator.js"));
__export(__webpack_require__(/*! ./context/propagation/composite */ "./node_modules/@opentelemetry/core/build/src/context/propagation/composite.js"));
__export(__webpack_require__(/*! ./context/propagation/HttpTraceContext */ "./node_modules/@opentelemetry/core/build/src/context/propagation/HttpTraceContext.js"));
__export(__webpack_require__(/*! ./correlation-context/correlation-context */ "./node_modules/@opentelemetry/core/build/src/correlation-context/correlation-context.js"));
__export(__webpack_require__(/*! ./correlation-context/propagation/HttpCorrelationContext */ "./node_modules/@opentelemetry/core/build/src/correlation-context/propagation/HttpCorrelationContext.js"));
__export(__webpack_require__(/*! ./platform */ "./node_modules/@opentelemetry/core/build/src/platform/browser/index.js"));
__export(__webpack_require__(/*! ./trace/NoRecordingSpan */ "./node_modules/@opentelemetry/core/build/src/trace/NoRecordingSpan.js"));
__export(__webpack_require__(/*! ./trace/sampler/ProbabilitySampler */ "./node_modules/@opentelemetry/core/build/src/trace/sampler/ProbabilitySampler.js"));
__export(__webpack_require__(/*! ./trace/spancontext-utils */ "./node_modules/@opentelemetry/core/build/src/trace/spancontext-utils.js"));
__export(__webpack_require__(/*! ./trace/TraceState */ "./node_modules/@opentelemetry/core/build/src/trace/TraceState.js"));
__export(__webpack_require__(/*! ./utils/url */ "./node_modules/@opentelemetry/core/build/src/utils/url.js"));
__export(__webpack_require__(/*! ./utils/wrap */ "./node_modules/@opentelemetry/core/build/src/utils/wrap.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/internal/validators.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/internal/validators.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const VALID_KEY_CHAR_RANGE = '[_0-9a-z-*/]';
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
/**
 * Key is opaque string up to 256 characters printable. It MUST begin with a
 * lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
 * underscores _, dashes -, asterisks *, and forward slashes /.
 * For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
 * vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
 * see https://www.w3.org/TR/trace-context/#key
 */
function validateKey(key) {
    return VALID_KEY_REGEX.test(key);
}
exports.validateKey = validateKey;
/**
 * Value is opaque string up to 256 characters printable ASCII RFC0020
 * characters (i.e., the range 0x20 to 0x7E) except comma , and =.
 */
function validateValue(value) {
    return (VALID_VALUE_BASE_REGEX.test(value) &&
        !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value));
}
exports.validateValue = validateValue;
//# sourceMappingURL=validators.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/platform/BaseAbstractPlugin.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/platform/BaseAbstractPlugin.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** This class represent the base to patch plugin. */
class BaseAbstractPlugin {
    constructor(_tracerName, _tracerVersion) {
        this._tracerName = _tracerName;
        this._tracerVersion = _tracerVersion;
    }
    disable() {
        this.unpatch();
    }
}
exports.BaseAbstractPlugin = BaseAbstractPlugin;
//# sourceMappingURL=BaseAbstractPlugin.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/platform/browser/BasePlugin.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/platform/browser/BasePlugin.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BaseAbstractPlugin_1 = __webpack_require__(/*! ../BaseAbstractPlugin */ "./node_modules/@opentelemetry/core/build/src/platform/BaseAbstractPlugin.js");
/** This class represent the base to patch plugin. */
class BasePlugin extends BaseAbstractPlugin_1.BaseAbstractPlugin {
    enable(moduleExports, tracerProvider, logger, config) {
        this._moduleExports = moduleExports;
        this._tracer = tracerProvider.getTracer(this._tracerName, this._tracerVersion);
        this._logger = logger;
        if (config)
            this._config = config;
        return this.patch();
    }
}
exports.BasePlugin = BasePlugin;
//# sourceMappingURL=BasePlugin.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/platform/browser/hex-to-base64.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/platform/browser/hex-to-base64.js ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * converts id string into base64
 * @param hexStr - id of span
 */
function hexToBase64(hexStr) {
    const hexStrLen = hexStr.length;
    let hexAsciiCharsStr = '';
    for (let i = 0; i < hexStrLen; i += 2) {
        const hexPair = hexStr.substring(i, i + 2);
        const hexVal = parseInt(hexPair, 16);
        hexAsciiCharsStr += String.fromCharCode(hexVal);
    }
    return btoa(hexAsciiCharsStr);
}
exports.hexToBase64 = hexToBase64;
//# sourceMappingURL=hex-to-base64.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/platform/browser/id.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/platform/browser/id.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cryptoLib = window.crypto || window.msCrypto;
const SPAN_ID_BYTES = 8;
const TRACE_ID_BYTES = 16;
const randomBytesArray = new Uint8Array(TRACE_ID_BYTES);
/** Returns a random 16-byte trace ID formatted as a 32-char hex string. */
function randomTraceId() {
    cryptoLib.getRandomValues(randomBytesArray);
    return toHex(randomBytesArray.slice(0, TRACE_ID_BYTES));
}
exports.randomTraceId = randomTraceId;
/** Returns a random 8-byte span ID formatted as a 16-char hex string. */
function randomSpanId() {
    cryptoLib.getRandomValues(randomBytesArray);
    return toHex(randomBytesArray.slice(0, SPAN_ID_BYTES));
}
exports.randomSpanId = randomSpanId;
/**
 * Get the hex string representation of a byte array
 *
 * @param byteArray
 */
function toHex(byteArray) {
    const chars = new Array(byteArray.length * 2);
    const alpha = 'a'.charCodeAt(0) - 10;
    const digit = '0'.charCodeAt(0);
    let p = 0;
    for (let i = 0; i < byteArray.length; i++) {
        let nibble = (byteArray[i] >>> 4) & 0xf;
        chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
        nibble = byteArray[i] & 0xf;
        chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
    }
    return String.fromCharCode.apply(null, chars);
}
//# sourceMappingURL=id.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/platform/browser/index.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/platform/browser/index.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./BasePlugin */ "./node_modules/@opentelemetry/core/build/src/platform/browser/BasePlugin.js"));
__export(__webpack_require__(/*! ./hex-to-base64 */ "./node_modules/@opentelemetry/core/build/src/platform/browser/hex-to-base64.js"));
__export(__webpack_require__(/*! ./id */ "./node_modules/@opentelemetry/core/build/src/platform/browser/id.js"));
__export(__webpack_require__(/*! ./performance */ "./node_modules/@opentelemetry/core/build/src/platform/browser/performance.js"));
__export(__webpack_require__(/*! ./sdk-info */ "./node_modules/@opentelemetry/core/build/src/platform/browser/sdk-info.js"));
__export(__webpack_require__(/*! ./timer-util */ "./node_modules/@opentelemetry/core/build/src/platform/browser/timer-util.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/platform/browser/performance.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/platform/browser/performance.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.otperformance = performance;
//# sourceMappingURL=performance.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/platform/browser/sdk-info.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/platform/browser/sdk-info.js ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const version_1 = __webpack_require__(/*! ../../version */ "./node_modules/@opentelemetry/core/build/src/version.js");
/** Constants describing the SDK in use */
exports.SDK_INFO = {
    NAME: 'opentelemetry',
    RUNTIME: 'browser',
    LANGUAGE: 'webjs',
    VERSION: version_1.VERSION,
};
//# sourceMappingURL=sdk-info.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/platform/browser/timer-util.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/platform/browser/timer-util.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** This is Node specific, does nothing in case of browser */
function unrefTimer(timer) { }
exports.unrefTimer = unrefTimer;
//# sourceMappingURL=timer-util.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/trace/NoRecordingSpan.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/trace/NoRecordingSpan.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
const spancontext_utils_1 = __webpack_require__(/*! ../trace/spancontext-utils */ "./node_modules/@opentelemetry/core/build/src/trace/spancontext-utils.js");
/**
 * The NoRecordingSpan extends the {@link NoopSpan}, making all operations no-op
 * except context propagation.
 */
class NoRecordingSpan extends api_1.NoopSpan {
    constructor(spanContext) {
        super(spanContext);
        this._context = spanContext || spancontext_utils_1.INVALID_SPAN_CONTEXT;
    }
    // Returns a SpanContext.
    context() {
        return this._context;
    }
}
exports.NoRecordingSpan = NoRecordingSpan;
//# sourceMappingURL=NoRecordingSpan.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/trace/TraceState.js":
/*!************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/trace/TraceState.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = __webpack_require__(/*! ../internal/validators */ "./node_modules/@opentelemetry/core/build/src/internal/validators.js");
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ',';
const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';
/**
 * TraceState must be a class and not a simple object type because of the spec
 * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
 *
 * Here is the list of allowed mutations:
 * - New key-value pair should be added into the beginning of the list
 * - The value of any key can be updated. Modified keys MUST be moved to the
 * beginning of the list.
 */
class TraceState {
    constructor(rawTraceState) {
        this._internalState = new Map();
        if (rawTraceState)
            this._parse(rawTraceState);
    }
    set(key, value) {
        // TODO: Benchmark the different approaches(map vs list) and
        // use the faster one.
        if (this._internalState.has(key))
            this._internalState.delete(key);
        this._internalState.set(key, value);
    }
    unset(key) {
        this._internalState.delete(key);
    }
    get(key) {
        return this._internalState.get(key);
    }
    serialize() {
        return this._keys()
            .reduce((agg, key) => {
            agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
            return agg;
        }, [])
            .join(LIST_MEMBERS_SEPARATOR);
    }
    _parse(rawTraceState) {
        if (rawTraceState.length > MAX_TRACE_STATE_LEN)
            return;
        this._internalState = rawTraceState
            .split(LIST_MEMBERS_SEPARATOR)
            .reverse() // Store in reverse so new keys (.set(...)) will be placed at the beginning
            .reduce((agg, part) => {
            const i = part.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
            if (i !== -1) {
                const key = part.slice(0, i);
                const value = part.slice(i + 1, part.length);
                if (validators_1.validateKey(key) && validators_1.validateValue(value)) {
                    agg.set(key, value);
                }
                else {
                    // TODO: Consider to add warning log
                }
            }
            return agg;
        }, new Map());
        // Because of the reverse() requirement, trunc must be done after map is created
        if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
            this._internalState = new Map(Array.from(this._internalState.entries())
                .reverse() // Use reverse same as original tracestate parse chain
                .slice(0, MAX_TRACE_STATE_ITEMS));
        }
    }
    _keys() {
        return Array.from(this._internalState.keys()).reverse();
    }
}
exports.TraceState = TraceState;
//# sourceMappingURL=TraceState.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/trace/sampler/ProbabilitySampler.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/trace/sampler/ProbabilitySampler.js ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
/** Sampler that samples a given fraction of traces. */
class ProbabilitySampler {
    constructor(_probability = 0) {
        this._probability = _probability;
        this._probability = this._normalize(_probability);
    }
    shouldSample(parentContext) {
        // Respect the parent sampling decision if there is one
        if (parentContext && typeof parentContext.traceFlags !== 'undefined') {
            return ((api_1.TraceFlags.SAMPLED & parentContext.traceFlags) === api_1.TraceFlags.SAMPLED);
        }
        if (this._probability >= 1.0)
            return true;
        else if (this._probability <= 0)
            return false;
        return Math.random() < this._probability;
    }
    toString() {
        // TODO: Consider to use `AlwaysSampleSampler` and `NeverSampleSampler`
        // based on the specs.
        return `ProbabilitySampler{${this._probability}}`;
    }
    _normalize(probability) {
        if (typeof probability !== 'number' || isNaN(probability))
            return 0;
        return probability >= 1 ? 1 : probability <= 0 ? 0 : probability;
    }
}
exports.ProbabilitySampler = ProbabilitySampler;
exports.ALWAYS_SAMPLER = new ProbabilitySampler(1);
exports.NEVER_SAMPLER = new ProbabilitySampler(0);
//# sourceMappingURL=ProbabilitySampler.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/trace/spancontext-utils.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/trace/spancontext-utils.js ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
exports.INVALID_SPANID = '0';
exports.INVALID_TRACEID = '0';
exports.INVALID_SPAN_CONTEXT = {
    traceId: exports.INVALID_TRACEID,
    spanId: exports.INVALID_SPANID,
    traceFlags: api_1.TraceFlags.NONE,
};
/**
 * Returns true if this {@link SpanContext} is valid.
 * @return true if this {@link SpanContext} is valid.
 */
function isValid(spanContext) {
    return (spanContext.traceId !== exports.INVALID_TRACEID &&
        spanContext.spanId !== exports.INVALID_SPANID);
}
exports.isValid = isValid;
//# sourceMappingURL=spancontext-utils.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/utils/url.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/utils/url.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Check if {@param url} matches {@param urlToMatch}
 * @param url
 * @param urlToMatch
 */
function urlMatches(url, urlToMatch) {
    if (typeof urlToMatch === 'string') {
        return url === urlToMatch;
    }
    else {
        return !!url.match(urlToMatch);
    }
}
exports.urlMatches = urlMatches;
/**
 * Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
 * @param url
 * @param ignoredUrls
 */
function isUrlIgnored(url, ignoredUrls) {
    if (!ignoredUrls) {
        return false;
    }
    for (const ignoreUrl of ignoredUrls) {
        if (urlMatches(url, ignoreUrl)) {
            return true;
        }
    }
    return false;
}
exports.isUrlIgnored = isUrlIgnored;
//# sourceMappingURL=url.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/utils/wrap.js":
/*!******************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/utils/wrap.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Checks if certain function has been already wrapped
 * @param func
 */
function isWrapped(func) {
    return (typeof func === 'function' &&
        typeof func.__original === 'function' &&
        typeof func.__unwrap === 'function' &&
        func.__wrapped === true);
}
exports.isWrapped = isWrapped;
//# sourceMappingURL=wrap.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/core/build/src/version.js":
/*!***************************************************************!*\
  !*** ./node_modules/@opentelemetry/core/build/src/version.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// this is autogenerated file, see scripts/version-update.js
exports.VERSION = '0.8.3';
//# sourceMappingURL=version.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/exporter-collector/build/src/CollectorExporterBase.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/exporter-collector/build/src/CollectorExporterBase.js ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
const DEFAULT_SERVICE_NAME = 'collector-exporter';
const DEFAULT_COLLECTOR_URL = 'http://localhost:55678/v1/trace';
/**
 * Collector Exporter abstract base class
 */
class CollectorExporterBase {
    /**
     * @param config
     */
    constructor(config = {}) {
        this._isShutdown = false;
        this.serviceName = config.serviceName || DEFAULT_SERVICE_NAME;
        this.url = config.url || DEFAULT_COLLECTOR_URL;
        if (typeof config.hostName === 'string') {
            this.hostName = config.hostName;
        }
        this.attributes = config.attributes;
        this.logger = config.logger || new core_1.NoopLogger();
        this.shutdown = this.shutdown.bind(this);
        // platform dependent
        this.onInit(config);
    }
    /**
     * Export spans.
     * @param spans
     * @param resultCallback
     */
    export(spans, resultCallback) {
        if (this._isShutdown) {
            resultCallback(core_1.ExportResult.FAILED_NOT_RETRYABLE);
            return;
        }
        this._exportSpans(spans)
            .then(() => {
            resultCallback(core_1.ExportResult.SUCCESS);
        })
            .catch((error) => {
            if (error.message) {
                this.logger.error(error.message);
            }
            if (error.code && error.code < 500) {
                resultCallback(core_1.ExportResult.FAILED_NOT_RETRYABLE);
            }
            else {
                resultCallback(core_1.ExportResult.FAILED_RETRYABLE);
            }
        });
    }
    _exportSpans(spans) {
        return new Promise((resolve, reject) => {
            try {
                this.logger.debug('spans to be sent', spans);
                // Send spans to [opentelemetry collector]{@link https://github.com/open-telemetry/opentelemetry-collector}
                // it will use the appropriate transport layer automatically depends on platform
                this.sendSpans(spans, resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     * Shutdown the exporter.
     */
    shutdown() {
        if (this._isShutdown) {
            this.logger.debug('shutdown already started');
            return;
        }
        this._isShutdown = true;
        this.logger.debug('shutdown started');
        // platform dependent
        this.onShutdown();
    }
}
exports.CollectorExporterBase = CollectorExporterBase;
//# sourceMappingURL=CollectorExporterBase.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/exporter-collector/build/src/index.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@opentelemetry/exporter-collector/build/src/index.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./platform */ "./node_modules/@opentelemetry/exporter-collector/build/src/platform/browser/index.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/exporter-collector/build/src/platform/browser/CollectorExporter.js":
/*!********************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/exporter-collector/build/src/platform/browser/CollectorExporter.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const CollectorExporterBase_1 = __webpack_require__(/*! ../../CollectorExporterBase */ "./node_modules/@opentelemetry/exporter-collector/build/src/CollectorExporterBase.js");
const transform_1 = __webpack_require__(/*! ../../transform */ "./node_modules/@opentelemetry/exporter-collector/build/src/transform.js");
const collectorTypes = __webpack_require__(/*! ../../types */ "./node_modules/@opentelemetry/exporter-collector/build/src/types.js");
/**
 * Collector Exporter for Web
 */
class CollectorExporter extends CollectorExporterBase_1.CollectorExporterBase {
    onInit() {
        window.addEventListener('unload', this.shutdown);
    }
    onShutdown() {
        window.removeEventListener('unload', this.shutdown);
    }
    sendSpans(spans, onSuccess, onError) {
        const exportTraceServiceRequest = transform_1.toCollectorExportTraceServiceRequest(spans, this);
        const body = JSON.stringify(exportTraceServiceRequest);
        if (typeof navigator.sendBeacon === 'function') {
            this._sendSpansWithBeacon(body, onSuccess, onError);
        }
        else {
            this._sendSpansWithXhr(body, onSuccess, onError);
        }
    }
    /**
     * send spans using browser navigator.sendBeacon
     * @param body
     * @param onSuccess
     * @param onError
     */
    _sendSpansWithBeacon(body, onSuccess, onError) {
        if (navigator.sendBeacon(this.url, body)) {
            this.logger.debug('sendBeacon - can send', body);
            onSuccess();
        }
        else {
            this.logger.error('sendBeacon - cannot send', body);
            onError({});
        }
    }
    /**
     * function to send spans using browser XMLHttpRequest
     *     used when navigator.sendBeacon is not available
     * @param body
     * @param onSuccess
     * @param onError
     */
    _sendSpansWithXhr(body, onSuccess, onError) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.url);
        xhr.setRequestHeader(collectorTypes.OT_REQUEST_HEADER, '1');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status <= 299) {
                    this.logger.debug('xhr success', body);
                    onSuccess();
                }
                else {
                    this.logger.error('body', body);
                    this.logger.error('xhr error', xhr);
                    onError({
                        code: xhr.status,
                        message: xhr.responseText,
                    });
                }
            }
        };
    }
}
exports.CollectorExporter = CollectorExporter;
//# sourceMappingURL=CollectorExporter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/exporter-collector/build/src/platform/browser/index.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/exporter-collector/build/src/platform/browser/index.js ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./CollectorExporter */ "./node_modules/@opentelemetry/exporter-collector/build/src/platform/browser/CollectorExporter.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/exporter-collector/build/src/transform.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@opentelemetry/exporter-collector/build/src/transform.js ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
const resources_1 = __webpack_require__(/*! @opentelemetry/resources */ "./node_modules/@opentelemetry/resources/build/src/index.js");
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/@opentelemetry/exporter-collector/build/src/types.js");
var ValueType = types_1.opentelemetryProto.common.v1.ValueType;
/**
 * Converts attributes
 * @param attributes
 */
function toCollectorAttributes(attributes) {
    return Object.keys(attributes).map(key => {
        return toCollectorAttributeKeyValue(key, attributes[key]);
    });
}
exports.toCollectorAttributes = toCollectorAttributes;
/**
 * Converts key and value to AttributeKeyValue
 * @param value event value
 */
function toCollectorAttributeKeyValue(key, value) {
    let aType = ValueType.STRING;
    const AttributeKeyValue = {
        key,
        type: 0,
    };
    if (typeof value === 'string') {
        AttributeKeyValue.stringValue = value;
    }
    else if (typeof value === 'boolean') {
        aType = ValueType.BOOL;
        AttributeKeyValue.boolValue = value;
    }
    else if (typeof value === 'number') {
        // all numbers will be treated as double
        aType = ValueType.DOUBLE;
        AttributeKeyValue.doubleValue = value;
    }
    AttributeKeyValue.type = aType;
    return AttributeKeyValue;
}
exports.toCollectorAttributeKeyValue = toCollectorAttributeKeyValue;
/**
 *
 * Converts events
 * @param events array of events
 */
function toCollectorEvents(timedEvents) {
    return timedEvents.map(timedEvent => {
        const timeUnixNano = core.hrTimeToNanoseconds(timedEvent.time);
        const name = timedEvent.name;
        const attributes = toCollectorAttributes(timedEvent.attributes || {});
        const droppedAttributesCount = 0;
        const protoEvent = {
            timeUnixNano,
            name,
            attributes,
            droppedAttributesCount,
        };
        return protoEvent;
    });
}
exports.toCollectorEvents = toCollectorEvents;
/**
 * Converts links
 * @param span
 */
function toCollectorLinks(span) {
    return span.links.map((link) => {
        const protoLink = {
            traceId: core.hexToBase64(link.context.traceId),
            spanId: core.hexToBase64(link.context.spanId),
            attributes: toCollectorAttributes(link.attributes || {}),
            droppedAttributesCount: 0,
        };
        return protoLink;
    });
}
exports.toCollectorLinks = toCollectorLinks;
/**
 * Converts span
 * @param span
 */
function toCollectorSpan(span) {
    return {
        traceId: core.hexToBase64(span.spanContext.traceId),
        spanId: core.hexToBase64(span.spanContext.spanId),
        parentSpanId: span.parentSpanId
            ? core.hexToBase64(span.parentSpanId)
            : undefined,
        traceState: toCollectorTraceState(span.spanContext.traceState),
        name: span.name,
        kind: toCollectorKind(span.kind),
        startTimeUnixNano: core.hrTimeToNanoseconds(span.startTime),
        endTimeUnixNano: core.hrTimeToNanoseconds(span.endTime),
        attributes: toCollectorAttributes(span.attributes),
        droppedAttributesCount: 0,
        events: toCollectorEvents(span.events),
        droppedEventsCount: 0,
        status: span.status,
        links: toCollectorLinks(span),
        droppedLinksCount: 0,
    };
}
exports.toCollectorSpan = toCollectorSpan;
/**
 * Converts resource
 * @param resource
 * @param additionalAttributes
 */
function toCollectorResource(resource, additionalAttributes = {}) {
    const attr = Object.assign({}, additionalAttributes, resource ? resource.labels : {});
    const resourceProto = {
        attributes: toCollectorAttributes(attr),
        droppedAttributesCount: 0,
    };
    return resourceProto;
}
exports.toCollectorResource = toCollectorResource;
/**
 * Converts span kind
 * @param kind
 */
function toCollectorKind(kind) {
    const collectorKind = types_1.COLLETOR_SPAN_KIND_MAPPING[kind];
    return typeof collectorKind === 'number'
        ? collectorKind
        : types_1.opentelemetryProto.trace.v1.Span.SpanKind.SPAN_KIND_UNSPECIFIED;
}
exports.toCollectorKind = toCollectorKind;
/**
 * Converts traceState
 * @param traceState
 */
function toCollectorTraceState(traceState) {
    if (!traceState)
        return undefined;
    return traceState.serialize();
}
exports.toCollectorTraceState = toCollectorTraceState;
/**
 * Prepares trace service request to be sent to collector
 * @param spans spans
 * @param collectorExporterBase
 * @param [name] Instrumentation Library Name
 */
function toCollectorExportTraceServiceRequest(spans, collectorExporterBase, name = '') {
    const spansToBeSent = spans.map(span => toCollectorSpan(span));
    const resource = spans.length > 0 ? spans[0].resource : resources_1.Resource.empty();
    const additionalAttributes = Object.assign({}, collectorExporterBase.attributes || {}, {
        'service.name': collectorExporterBase.serviceName,
    });
    const protoResource = toCollectorResource(resource, additionalAttributes);
    const instrumentationLibrarySpans = {
        spans: spansToBeSent,
        instrumentationLibrary: {
            name: name || `${core.SDK_INFO.NAME} - ${core.SDK_INFO.LANGUAGE}`,
            version: core.SDK_INFO.VERSION,
        },
    };
    const resourceSpan = {
        resource: protoResource,
        instrumentationLibrarySpans: [instrumentationLibrarySpans],
    };
    return {
        resourceSpans: [resourceSpan],
    };
}
exports.toCollectorExportTraceServiceRequest = toCollectorExportTraceServiceRequest;
//# sourceMappingURL=transform.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/exporter-collector/build/src/types.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@opentelemetry/exporter-collector/build/src/types.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
// header to prevent instrumentation on request
exports.OT_REQUEST_HEADER = 'x-opentelemetry-outgoing-request';
/* eslint-disable @typescript-eslint/no-namespace */
var opentelemetryProto;
(function (opentelemetryProto) {
    let trace;
    (function (trace) {
        let v1;
        (function (v1) {
            let ConstantSampler;
            (function (ConstantSampler) {
                let ConstantDecision;
                (function (ConstantDecision) {
                    ConstantDecision[ConstantDecision["ALWAYS_OFF"] = 0] = "ALWAYS_OFF";
                    ConstantDecision[ConstantDecision["ALWAYS_ON"] = 1] = "ALWAYS_ON";
                    ConstantDecision[ConstantDecision["ALWAYS_PARENT"] = 2] = "ALWAYS_PARENT";
                })(ConstantDecision = ConstantSampler.ConstantDecision || (ConstantSampler.ConstantDecision = {}));
            })(ConstantSampler = v1.ConstantSampler || (v1.ConstantSampler = {}));
            let Span;
            (function (Span) {
                let SpanKind;
                (function (SpanKind) {
                    SpanKind[SpanKind["SPAN_KIND_UNSPECIFIED"] = 0] = "SPAN_KIND_UNSPECIFIED";
                    SpanKind[SpanKind["INTERNAL"] = 1] = "INTERNAL";
                    SpanKind[SpanKind["SERVER"] = 2] = "SERVER";
                    SpanKind[SpanKind["CLIENT"] = 3] = "CLIENT";
                    SpanKind[SpanKind["PRODUCER"] = 4] = "PRODUCER";
                    SpanKind[SpanKind["CONSUMER"] = 5] = "CONSUMER";
                })(SpanKind = Span.SpanKind || (Span.SpanKind = {}));
            })(Span = v1.Span || (v1.Span = {}));
        })(v1 = trace.v1 || (trace.v1 = {}));
    })(trace = opentelemetryProto.trace || (opentelemetryProto.trace = {}));
    let common;
    (function (common) {
        let v1;
        (function (v1) {
            let ValueType;
            (function (ValueType) {
                ValueType[ValueType["STRING"] = 0] = "STRING";
                ValueType[ValueType["INT"] = 1] = "INT";
                ValueType[ValueType["DOUBLE"] = 2] = "DOUBLE";
                ValueType[ValueType["BOOL"] = 3] = "BOOL";
            })(ValueType = v1.ValueType || (v1.ValueType = {}));
        })(v1 = common.v1 || (common.v1 = {}));
    })(common = opentelemetryProto.common || (opentelemetryProto.common = {}));
})(opentelemetryProto = exports.opentelemetryProto || (exports.opentelemetryProto = {}));
/**
 * Mapping between api SpanKind and proto SpanKind
 */
exports.COLLETOR_SPAN_KIND_MAPPING = {
    [api_1.SpanKind.INTERNAL]: opentelemetryProto.trace.v1.Span.SpanKind.INTERNAL,
    [api_1.SpanKind.SERVER]: opentelemetryProto.trace.v1.Span.SpanKind.SERVER,
    [api_1.SpanKind.CLIENT]: opentelemetryProto.trace.v1.Span.SpanKind.CLIENT,
    [api_1.SpanKind.PRODUCER]: opentelemetryProto.trace.v1.Span.SpanKind.PRODUCER,
    [api_1.SpanKind.CONSUMER]: opentelemetryProto.trace.v1.Span.SpanKind.CONSUMER,
};
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/build/src/documentLoad.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/build/src/documentLoad.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js");
const web_1 = __webpack_require__(/*! @opentelemetry/web */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/index.js");
const AttributeNames_1 = __webpack_require__(/*! ./enums/AttributeNames */ "./node_modules/@opentelemetry/plugin-document-load/build/src/enums/AttributeNames.js");
const version_1 = __webpack_require__(/*! ./version */ "./node_modules/@opentelemetry/plugin-document-load/build/src/version.js");
/**
 * This class represents a document load plugin
 */
class DocumentLoad extends core_1.BasePlugin {
    /**
     *
     * @param config
     */
    constructor(config = {}) {
        super('@opentelemetry/plugin-document-load', version_1.VERSION);
        this.component = 'document-load';
        this.version = '1';
        this.moduleName = this.component;
        this._onDocumentLoaded = this._onDocumentLoaded.bind(this);
        this._config = config;
    }
    /**
     * callback to be executed when page is loaded
     */
    _onDocumentLoaded() {
        // Timeout is needed as load event doesn't have yet the performance metrics for loadEnd.
        // Support for event "loadend" is very limited and cannot be used
        window.setTimeout(() => {
            this._collectPerformance();
        });
    }
    /**
     * Adds spans for all resources
     * @param rootSpan
     */
    _addResourcesSpans(rootSpan) {
        const resources = core_1.otperformance.getEntriesByType('resource');
        if (resources) {
            resources.forEach(resource => {
                this._initResourceSpan(resource, { parent: rootSpan });
            });
        }
    }
    /**
     * Adds span network events
     * @param span
     * @param entries entries that contains performance information about resource
     */
    _addSpanNetworkEvents(span, entries) {
        web_1.addSpanNetworkEvent(span, web_1.PerformanceTimingNames.DOMAIN_LOOKUP_START, entries);
        web_1.addSpanNetworkEvent(span, web_1.PerformanceTimingNames.DOMAIN_LOOKUP_END, entries);
        web_1.addSpanNetworkEvent(span, web_1.PerformanceTimingNames.CONNECT_START, entries);
        web_1.addSpanNetworkEvent(span, web_1.PerformanceTimingNames.SECURE_CONNECTION_START, entries);
        web_1.addSpanNetworkEvent(span, web_1.PerformanceTimingNames.CONNECT_END, entries);
        web_1.addSpanNetworkEvent(span, web_1.PerformanceTimingNames.REQUEST_START, entries);
        web_1.addSpanNetworkEvent(span, web_1.PerformanceTimingNames.RESPONSE_START, entries);
    }
    /**
     * Collects information about performance and creates appropriate spans
     */
    _collectPerformance() {
        const metaElement = [...document.getElementsByTagName('meta')].find(e => e.getAttribute('name') === core_1.TRACE_PARENT_HEADER);
        const entries = this._getEntries();
        const traceparent = (metaElement && metaElement.content) || '';
        api_1.context.with(api_1.propagation.extract({ traceparent }), () => {
            const rootSpan = this._startSpan(AttributeNames_1.AttributeNames.DOCUMENT_LOAD, web_1.PerformanceTimingNames.FETCH_START, entries);
            if (!rootSpan) {
                return;
            }
            this._tracer.withSpan(rootSpan, () => {
                const fetchSpan = this._startSpan(AttributeNames_1.AttributeNames.DOCUMENT_FETCH, web_1.PerformanceTimingNames.FETCH_START, entries);
                if (fetchSpan) {
                    this._tracer.withSpan(fetchSpan, () => {
                        this._addSpanNetworkEvents(fetchSpan, entries);
                        this._endSpan(fetchSpan, web_1.PerformanceTimingNames.RESPONSE_END, entries);
                    });
                }
            });
            this._addResourcesSpans(rootSpan);
            web_1.addSpanNetworkEvent(rootSpan, web_1.PerformanceTimingNames.UNLOAD_EVENT_START, entries);
            web_1.addSpanNetworkEvent(rootSpan, web_1.PerformanceTimingNames.UNLOAD_EVENT_END, entries);
            web_1.addSpanNetworkEvent(rootSpan, web_1.PerformanceTimingNames.DOM_INTERACTIVE, entries);
            web_1.addSpanNetworkEvent(rootSpan, web_1.PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_START, entries);
            web_1.addSpanNetworkEvent(rootSpan, web_1.PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_END, entries);
            web_1.addSpanNetworkEvent(rootSpan, web_1.PerformanceTimingNames.DOM_COMPLETE, entries);
            web_1.addSpanNetworkEvent(rootSpan, web_1.PerformanceTimingNames.LOAD_EVENT_START, entries);
            this._endSpan(rootSpan, web_1.PerformanceTimingNames.LOAD_EVENT_END, entries);
        });
    }
    /**
     * Helper function for ending span
     * @param span
     * @param performanceName name of performance entry for time end
     * @param entries
     */
    _endSpan(span, performanceName, entries) {
        // span can be undefined when entries are missing the certain performance - the span will not be created
        if (span) {
            if (web_1.hasKey(entries, performanceName)) {
                web_1.addSpanNetworkEvent(span, performanceName, entries);
                span.end(entries[performanceName]);
            }
            else {
                // just end span
                span.end();
            }
        }
    }
    /**
     * gets performance entries of navigation
     */
    _getEntries() {
        const entries = {};
        const performanceNavigationTiming = core_1.otperformance.getEntriesByType('navigation')[0];
        if (performanceNavigationTiming) {
            const keys = Object.values(web_1.PerformanceTimingNames);
            keys.forEach((key) => {
                if (web_1.hasKey(performanceNavigationTiming, key)) {
                    const value = performanceNavigationTiming[key];
                    if (typeof value === 'number' && value > 0) {
                        entries[key] = value;
                    }
                }
            });
        }
        else {
            // // fallback to previous version
            const perf = core_1.otperformance;
            const performanceTiming = perf.timing;
            if (performanceTiming) {
                const keys = Object.values(web_1.PerformanceTimingNames);
                keys.forEach((key) => {
                    if (web_1.hasKey(performanceTiming, key)) {
                        const value = performanceTiming[key];
                        if (typeof value === 'number' && value > 0) {
                            entries[key] = value;
                        }
                    }
                });
            }
        }
        return entries;
    }
    /**
     * Creates and ends a span with network information about resource added as timed events
     * @param resource
     * @param spanOptions
     */
    _initResourceSpan(resource, spanOptions = {}) {
        const span = this._startSpan(resource.name, web_1.PerformanceTimingNames.FETCH_START, resource, spanOptions);
        if (span) {
            this._addSpanNetworkEvents(span, resource);
            this._endSpan(span, web_1.PerformanceTimingNames.RESPONSE_END, resource);
        }
    }
    /**
     * Helper function for starting a span
     * @param spanName name of span
     * @param performanceName name of performance entry for time start
     * @param entries
     * @param spanOptions
     */
    _startSpan(spanName, performanceName, entries, spanOptions = {}) {
        if (web_1.hasKey(entries, performanceName) &&
            typeof entries[performanceName] === 'number') {
            const span = this._tracer.startSpan(spanName, Object.assign({}, {
                startTime: entries[performanceName],
            }, spanOptions));
            span.setAttribute(AttributeNames_1.AttributeNames.COMPONENT, this.component);
            web_1.addSpanNetworkEvent(span, performanceName, entries);
            return span;
        }
        return undefined;
    }
    /**
     * executes callback {_onDocumentLoaded} when the page is loaded
     */
    _waitForPageLoad() {
        if (window.document.readyState === 'complete') {
            this._onDocumentLoaded();
        }
        else {
            window.addEventListener('load', this._onDocumentLoaded);
        }
    }
    /**
     * implements patch function
     */
    patch() {
        this._waitForPageLoad();
        return this._moduleExports;
    }
    /**
     * implements unpatch function
     */
    unpatch() {
        window.removeEventListener('load', this._onDocumentLoaded);
    }
}
exports.DocumentLoad = DocumentLoad;
//# sourceMappingURL=documentLoad.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/build/src/enums/AttributeNames.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/build/src/enums/AttributeNames.js ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var AttributeNames;
(function (AttributeNames) {
    AttributeNames["COMPONENT"] = "component";
    AttributeNames["DOCUMENT_LOAD"] = "documentLoad";
    AttributeNames["DOCUMENT_FETCH"] = "documentFetch";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
//# sourceMappingURL=AttributeNames.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/build/src/index.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/build/src/index.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./documentLoad */ "./node_modules/@opentelemetry/plugin-document-load/build/src/documentLoad.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/build/src/version.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/build/src/version.js ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// this is autogenerated file, see scripts/version-update.js
exports.VERSION = '0.6.1';
//# sourceMappingURL=version.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/context.js":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/context.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const context_base_1 = __webpack_require__(/*! @opentelemetry/context-base */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/index.js");
/**
 * Singleton object which represents the entry point to the OpenTelemetry Context API
 */
class ContextAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
        this._contextManager = new context_base_1.NoopContextManager();
    }
    /** Get the singleton instance of the Context API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new ContextAPI();
        }
        return this._instance;
    }
    /**
     * Set the current context manager. Returns the initialized context manager
     */
    setGlobalContextManager(contextManager) {
        this._contextManager = contextManager;
        return contextManager;
    }
    /**
     * Get the currently active context
     */
    active() {
        return this._contextManager.active();
    }
    /**
     * Execute a function with an active context
     *
     * @param context context to be active during function execution
     * @param fn function to execute in a context
     */
    with(context, fn) {
        return this._contextManager.with(context, fn);
    }
    /**
     * Bind a context to a target function or event emitter
     *
     * @param target function or event emitter to bind
     * @param context context to bind to the event emitter or function. Defaults to the currently active context
     */
    bind(target, context = this.active()) {
        return this._contextManager.bind(target, context);
    }
}
exports.ContextAPI = ContextAPI;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/metrics.js":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/metrics.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopMeterProvider_1 = __webpack_require__(/*! ../metrics/NoopMeterProvider */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/NoopMeterProvider.js");
/**
 * Singleton object which represents the entry point to the OpenTelemetry Metrics API
 */
class MetricsAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
        this._meterProvider = NoopMeterProvider_1.NOOP_METER_PROVIDER;
    }
    /** Get the singleton instance of the Metrics API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new MetricsAPI();
        }
        return this._instance;
    }
    /**
     * Set the current global meter. Returns the initialized global meter provider.
     */
    setGlobalMeterProvider(provider) {
        this._meterProvider = provider;
        return provider;
    }
    /**
     * Returns the global meter provider.
     */
    getMeterProvider() {
        return this._meterProvider;
    }
    /**
     * Returns a meter from the global meter provider.
     */
    getMeter(name, version) {
        return this.getMeterProvider().getMeter(name, version);
    }
}
exports.MetricsAPI = MetricsAPI;
//# sourceMappingURL=metrics.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/propagation.js":
/*!***********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/propagation.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const getter_1 = __webpack_require__(/*! ../context/propagation/getter */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/getter.js");
const NoopHttpTextPropagator_1 = __webpack_require__(/*! ../context/propagation/NoopHttpTextPropagator */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/NoopHttpTextPropagator.js");
const setter_1 = __webpack_require__(/*! ../context/propagation/setter */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/setter.js");
const context_1 = __webpack_require__(/*! ./context */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/context.js");
const contextApi = context_1.ContextAPI.getInstance();
/**
 * Singleton object which represents the entry point to the OpenTelemetry Propagation API
 */
class PropagationAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
        this._propagator = NoopHttpTextPropagator_1.NOOP_HTTP_TEXT_PROPAGATOR;
    }
    /** Get the singleton instance of the Propagator API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new PropagationAPI();
        }
        return this._instance;
    }
    /**
     * Set the current propagator. Returns the initialized propagator
     */
    setGlobalPropagator(propagator) {
        this._propagator = propagator;
        return propagator;
    }
    /**
     * Inject context into a carrier to be propagated inter-process
     *
     * @param carrier carrier to inject context into
     * @param setter Function used to set values on the carrier
     * @param context Context carrying tracing data to inject. Defaults to the currently active context.
     */
    inject(carrier, setter = setter_1.defaultSetter, context = contextApi.active()) {
        return this._propagator.inject(context, carrier, setter);
    }
    /**
     * Extract context from a carrier
     *
     * @param carrier Carrier to extract context from
     * @param getter Function used to extract keys from a carrier
     * @param context Context which the newly created context will inherit from. Defaults to the currently active context.
     */
    extract(carrier, getter = getter_1.defaultGetter, context = contextApi.active()) {
        return this._propagator.extract(context, carrier, getter);
    }
}
exports.PropagationAPI = PropagationAPI;
//# sourceMappingURL=propagation.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/trace.js":
/*!*****************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/trace.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopTracerProvider_1 = __webpack_require__(/*! ../trace/NoopTracerProvider */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopTracerProvider.js");
/**
 * Singleton object which represents the entry point to the OpenTelemetry Tracing API
 */
class TraceAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
        this._tracerProvider = NoopTracerProvider_1.NOOP_TRACER_PROVIDER;
    }
    /** Get the singleton instance of the Trace API */
    static getInstance() {
        if (!this._instance) {
            this._instance = new TraceAPI();
        }
        return this._instance;
    }
    /**
     * Set the current global tracer. Returns the initialized global tracer provider
     */
    setGlobalTracerProvider(provider) {
        this._tracerProvider = provider;
        return provider;
    }
    /**
     * Returns the global tracer provider.
     */
    getTracerProvider() {
        return this._tracerProvider;
    }
    /**
     * Returns a tracer from the global tracer provider.
     */
    getTracer(name, version) {
        return this.getTracerProvider().getTracer(name, version);
    }
}
exports.TraceAPI = TraceAPI;
//# sourceMappingURL=trace.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/NoopHttpTextPropagator.js":
/*!**************************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/NoopHttpTextPropagator.js ***!
  \**************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * No-op implementations of {@link HttpTextPropagator}.
 */
class NoopHttpTextPropagator {
    /** Noop inject function does nothing */
    inject(context, carrier, setter) { }
    /** Noop extract function does nothing and returns the input context */
    extract(context, carrier, getter) {
        return context;
    }
}
exports.NoopHttpTextPropagator = NoopHttpTextPropagator;
exports.NOOP_HTTP_TEXT_PROPAGATOR = new NoopHttpTextPropagator();
//# sourceMappingURL=NoopHttpTextPropagator.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/getter.js":
/*!**********************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/getter.js ***!
  \**********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default getter which just does a simple property access. Returns
 * undefined if the key is not set.
 *
 * @param carrier
 * @param key
 */
function defaultGetter(carrier, key) {
    return carrier[key];
}
exports.defaultGetter = defaultGetter;
//# sourceMappingURL=getter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/setter.js":
/*!**********************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/setter.js ***!
  \**********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default setter which sets value via direct property access
 *
 * @param carrier
 * @param key
 */
function defaultSetter(carrier, key, value) {
    carrier[key] = value;
}
exports.defaultSetter = defaultSetter;
//# sourceMappingURL=setter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/correlation_context/EntryValue.js":
/*!**************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/correlation_context/EntryValue.js ***!
  \**************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * EntryTtl is an integer that represents number of hops an entry can propagate.
 *
 * For now, ONLY special values (0 and -1) are supported.
 */
var EntryTtl;
(function (EntryTtl) {
    /**
     * NO_PROPAGATION is considered to have local context and is used within the
     * process it created.
     */
    EntryTtl[EntryTtl["NO_PROPAGATION"] = 0] = "NO_PROPAGATION";
    /** UNLIMITED_PROPAGATION can propagate unlimited hops. */
    EntryTtl[EntryTtl["UNLIMITED_PROPAGATION"] = -1] = "UNLIMITED_PROPAGATION";
})(EntryTtl = exports.EntryTtl || (exports.EntryTtl = {}));
//# sourceMappingURL=EntryValue.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./context/propagation/getter */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/getter.js"));
__export(__webpack_require__(/*! ./context/propagation/NoopHttpTextPropagator */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/NoopHttpTextPropagator.js"));
__export(__webpack_require__(/*! ./context/propagation/setter */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/context/propagation/setter.js"));
__export(__webpack_require__(/*! ./correlation_context/EntryValue */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/correlation_context/EntryValue.js"));
__export(__webpack_require__(/*! ./metrics/Metric */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/Metric.js"));
__export(__webpack_require__(/*! ./metrics/NoopMeter */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/NoopMeter.js"));
__export(__webpack_require__(/*! ./metrics/NoopMeterProvider */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/NoopMeterProvider.js"));
__export(__webpack_require__(/*! ./trace/NoopSpan */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopSpan.js"));
__export(__webpack_require__(/*! ./trace/NoopTracer */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopTracer.js"));
__export(__webpack_require__(/*! ./trace/NoopTracerProvider */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopTracerProvider.js"));
__export(__webpack_require__(/*! ./trace/span_kind */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/span_kind.js"));
__export(__webpack_require__(/*! ./trace/status */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/status.js"));
__export(__webpack_require__(/*! ./trace/trace_flags */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/trace_flags.js"));
var context_base_1 = __webpack_require__(/*! @opentelemetry/context-base */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/index.js");
exports.Context = context_base_1.Context;
const context_1 = __webpack_require__(/*! ./api/context */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/context.js");
/** Entrypoint for context API */
exports.context = context_1.ContextAPI.getInstance();
const trace_1 = __webpack_require__(/*! ./api/trace */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/trace.js");
/** Entrypoint for trace API */
exports.trace = trace_1.TraceAPI.getInstance();
const metrics_1 = __webpack_require__(/*! ./api/metrics */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/metrics.js");
/** Entrypoint for metrics API */
exports.metrics = metrics_1.MetricsAPI.getInstance();
const propagation_1 = __webpack_require__(/*! ./api/propagation */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/api/propagation.js");
/** Entrypoint for propagation API */
exports.propagation = propagation_1.PropagationAPI.getInstance();
exports.default = {
    trace: exports.trace,
    metrics: exports.metrics,
    context: exports.context,
    propagation: exports.propagation,
};
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/Metric.js":
/*!**********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/Metric.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** The Type of value. It describes how the data is reported. */
var ValueType;
(function (ValueType) {
    ValueType[ValueType["INT"] = 0] = "INT";
    ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
//# sourceMappingURL=Metric.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/NoopMeter.js":
/*!*************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/NoopMeter.js ***!
  \*************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
 * constant NoopMetrics for all of its methods.
 */
class NoopMeter {
    constructor() { }
    /**
     * Returns constant noop measure.
     * @param name the name of the metric.
     * @param [options] the metric options.
     */
    createMeasure(name, options) {
        return exports.NOOP_MEASURE_METRIC;
    }
    /**
     * Returns a constant noop counter.
     * @param name the name of the metric.
     * @param [options] the metric options.
     */
    createCounter(name, options) {
        return exports.NOOP_COUNTER_METRIC;
    }
    /**
     * Returns constant noop observer.
     * @param name the name of the metric.
     * @param [options] the metric options.
     */
    createObserver(name, options) {
        return exports.NOOP_OBSERVER_METRIC;
    }
}
exports.NoopMeter = NoopMeter;
class NoopMetric {
    constructor(instrument) {
        this._instrument = instrument;
    }
    /**
     * Returns a Bound Instrument associated with specified Labels.
     * It is recommended to keep a reference to the Bound Instrument instead of
     * always calling this method for every operations.
     * @param labels key-values pairs that are associated with a specific metric
     *     that you want to record.
     */
    bind(labels) {
        return this._instrument;
    }
    /**
     * Removes the Binding from the metric, if it is present.
     * @param labels key-values pairs that are associated with a specific metric.
     */
    unbind(labels) {
        return;
    }
    /**
     * Clears all timeseries from the Metric.
     */
    clear() {
        return;
    }
}
exports.NoopMetric = NoopMetric;
class NoopCounterMetric extends NoopMetric {
    add(value, labels) {
        this.bind(labels).add(value);
    }
}
exports.NoopCounterMetric = NoopCounterMetric;
class NoopMeasureMetric extends NoopMetric {
    record(value, labels, correlationContext, spanContext) {
        if (typeof correlationContext === 'undefined') {
            this.bind(labels).record(value);
        }
        else if (typeof spanContext === 'undefined') {
            this.bind(labels).record(value, correlationContext);
        }
        else {
            this.bind(labels).record(value, correlationContext, spanContext);
        }
    }
}
exports.NoopMeasureMetric = NoopMeasureMetric;
class NoopObserverMetric extends NoopMetric {
    setCallback(callback) { }
}
exports.NoopObserverMetric = NoopObserverMetric;
class NoopBoundCounter {
    add(value) {
        return;
    }
}
exports.NoopBoundCounter = NoopBoundCounter;
class NoopBoundMeasure {
    record(value, correlationContext, spanContext) {
        return;
    }
}
exports.NoopBoundMeasure = NoopBoundMeasure;
class NoopBoundObserver {
    setCallback(callback) { }
}
exports.NoopBoundObserver = NoopBoundObserver;
exports.NOOP_METER = new NoopMeter();
exports.NOOP_BOUND_COUNTER = new NoopBoundCounter();
exports.NOOP_COUNTER_METRIC = new NoopCounterMetric(exports.NOOP_BOUND_COUNTER);
exports.NOOP_BOUND_MEASURE = new NoopBoundMeasure();
exports.NOOP_MEASURE_METRIC = new NoopMeasureMetric(exports.NOOP_BOUND_MEASURE);
exports.NOOP_BOUND_OBSERVER = new NoopBoundObserver();
exports.NOOP_OBSERVER_METRIC = new NoopObserverMetric(exports.NOOP_BOUND_OBSERVER);
//# sourceMappingURL=NoopMeter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/NoopMeterProvider.js":
/*!*********************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/NoopMeterProvider.js ***!
  \*********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopMeter_1 = __webpack_require__(/*! ./NoopMeter */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/metrics/NoopMeter.js");
/**
 * An implementation of the {@link MeterProvider} which returns an impotent Meter
 * for all calls to `getMeter`
 */
class NoopMeterProvider {
    getMeter(_name, _version) {
        return NoopMeter_1.NOOP_METER;
    }
}
exports.NoopMeterProvider = NoopMeterProvider;
exports.NOOP_METER_PROVIDER = new NoopMeterProvider();
//# sourceMappingURL=NoopMeterProvider.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopSpan.js":
/*!**********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopSpan.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const trace_flags_1 = __webpack_require__(/*! ./trace_flags */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/trace_flags.js");
exports.INVALID_TRACE_ID = '0';
exports.INVALID_SPAN_ID = '0';
const INVALID_SPAN_CONTEXT = {
    traceId: exports.INVALID_TRACE_ID,
    spanId: exports.INVALID_SPAN_ID,
    traceFlags: trace_flags_1.TraceFlags.NONE,
};
/**
 * The NoopSpan is the default {@link Span} that is used when no Span
 * implementation is available. All operations are no-op including context
 * propagation.
 */
class NoopSpan {
    constructor(_spanContext = INVALID_SPAN_CONTEXT) {
        this._spanContext = _spanContext;
    }
    // Returns a SpanContext.
    context() {
        return this._spanContext;
    }
    // By default does nothing
    setAttribute(key, value) {
        return this;
    }
    // By default does nothing
    setAttributes(attributes) {
        return this;
    }
    // By default does nothing
    addEvent(name, attributes) {
        return this;
    }
    // By default does nothing
    setStatus(status) {
        return this;
    }
    // By default does nothing
    updateName(name) {
        return this;
    }
    // By default does nothing
    end(endTime) { }
    // isRecording always returns false for noopSpan.
    isRecording() {
        return false;
    }
}
exports.NoopSpan = NoopSpan;
exports.NOOP_SPAN = new NoopSpan();
//# sourceMappingURL=NoopSpan.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopTracer.js":
/*!************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopTracer.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopSpan_1 = __webpack_require__(/*! ./NoopSpan */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopSpan.js");
/**
 * No-op implementations of {@link Tracer}.
 */
class NoopTracer {
    getCurrentSpan() {
        return NoopSpan_1.NOOP_SPAN;
    }
    // startSpan starts a noop span.
    startSpan(name, options) {
        return NoopSpan_1.NOOP_SPAN;
    }
    withSpan(span, fn) {
        return fn();
    }
    bind(target, span) {
        return target;
    }
}
exports.NoopTracer = NoopTracer;
exports.NOOP_TRACER = new NoopTracer();
//# sourceMappingURL=NoopTracer.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopTracerProvider.js":
/*!********************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopTracerProvider.js ***!
  \********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopTracer_1 = __webpack_require__(/*! ./NoopTracer */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/NoopTracer.js");
/**
 * An implementation of the {@link TracerProvider} which returns an impotent Tracer
 * for all calls to `getTracer`
 */
class NoopTracerProvider {
    getTracer(_name, _version) {
        return NoopTracer_1.NOOP_TRACER;
    }
}
exports.NoopTracerProvider = NoopTracerProvider;
exports.NOOP_TRACER_PROVIDER = new NoopTracerProvider();
//# sourceMappingURL=NoopTracerProvider.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/span_kind.js":
/*!***********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/span_kind.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Type of span. Can be used to specify additional relationships between spans
 * in addition to a parent/child relationship.
 */
var SpanKind;
(function (SpanKind) {
    /** Default value. Indicates that the span is used internally. */
    SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
    /**
     * Indicates that the span covers server-side handling of an RPC or other
     * remote request.
     */
    SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
    /**
     * Indicates that the span covers the client-side wrapper around an RPC or
     * other remote request.
     */
    SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
    /**
     * Indicates that the span describes producer sending a message to a
     * broker. Unlike client and server, there is no direct critical path latency
     * relationship between producer and consumer spans.
     */
    SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
    /**
     * Indicates that the span describes consumer receiving a message from a
     * broker. Unlike client and server, there is no direct critical path latency
     * relationship between producer and consumer spans.
     */
    SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
})(SpanKind = exports.SpanKind || (exports.SpanKind = {}));
//# sourceMappingURL=span_kind.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/status.js":
/*!********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/status.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An enumeration of canonical status codes.
 */
var CanonicalCode;
(function (CanonicalCode) {
    /**
     * Not an error; returned on success
     */
    CanonicalCode[CanonicalCode["OK"] = 0] = "OK";
    /**
     * The operation was cancelled (typically by the caller).
     */
    CanonicalCode[CanonicalCode["CANCELLED"] = 1] = "CANCELLED";
    /**
     * Unknown error.  An example of where this error may be returned is
     * if a status value received from another address space belongs to
     * an error-space that is not known in this address space.  Also
     * errors raised by APIs that do not return enough error information
     * may be converted to this error.
     */
    CanonicalCode[CanonicalCode["UNKNOWN"] = 2] = "UNKNOWN";
    /**
     * Client specified an invalid argument.  Note that this differs
     * from FAILED_PRECONDITION.  INVALID_ARGUMENT indicates arguments
     * that are problematic regardless of the state of the system
     * (e.g., a malformed file name).
     */
    CanonicalCode[CanonicalCode["INVALID_ARGUMENT"] = 3] = "INVALID_ARGUMENT";
    /**
     * Deadline expired before operation could complete.  For operations
     * that change the state of the system, this error may be returned
     * even if the operation has completed successfully.  For example, a
     * successful response from a server could have been delayed long
     * enough for the deadline to expire.
     */
    CanonicalCode[CanonicalCode["DEADLINE_EXCEEDED"] = 4] = "DEADLINE_EXCEEDED";
    /**
     * Some requested entity (e.g., file or directory) was not found.
     */
    CanonicalCode[CanonicalCode["NOT_FOUND"] = 5] = "NOT_FOUND";
    /**
     * Some entity that we attempted to create (e.g., file or directory)
     * already exists.
     */
    CanonicalCode[CanonicalCode["ALREADY_EXISTS"] = 6] = "ALREADY_EXISTS";
    /**
     * The caller does not have permission to execute the specified
     * operation.  PERMISSION_DENIED must not be used for rejections
     * caused by exhausting some resource (use RESOURCE_EXHAUSTED
     * instead for those errors).  PERMISSION_DENIED must not be
     * used if the caller can not be identified (use UNAUTHENTICATED
     * instead for those errors).
     */
    CanonicalCode[CanonicalCode["PERMISSION_DENIED"] = 7] = "PERMISSION_DENIED";
    /**
     * Some resource has been exhausted, perhaps a per-user quota, or
     * perhaps the entire file system is out of space.
     */
    CanonicalCode[CanonicalCode["RESOURCE_EXHAUSTED"] = 8] = "RESOURCE_EXHAUSTED";
    /**
     * Operation was rejected because the system is not in a state
     * required for the operation's execution.  For example, directory
     * to be deleted may be non-empty, an rmdir operation is applied to
     * a non-directory, etc.
     *
     * A litmus test that may help a service implementor in deciding
     * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
     *
     *  - Use UNAVAILABLE if the client can retry just the failing call.
     *  - Use ABORTED if the client should retry at a higher-level
     *    (e.g., restarting a read-modify-write sequence).
     *  - Use FAILED_PRECONDITION if the client should not retry until
     *    the system state has been explicitly fixed.  E.g., if an "rmdir"
     *    fails because the directory is non-empty, FAILED_PRECONDITION
     *    should be returned since the client should not retry unless
     *    they have first fixed up the directory by deleting files from it.
     *  - Use FAILED_PRECONDITION if the client performs conditional
     *    REST Get/Update/Delete on a resource and the resource on the
     *    server does not match the condition. E.g., conflicting
     *    read-modify-write on the same resource.
     */
    CanonicalCode[CanonicalCode["FAILED_PRECONDITION"] = 9] = "FAILED_PRECONDITION";
    /**
     * The operation was aborted, typically due to a concurrency issue
     * like sequencer check failures, transaction aborts, etc.
     *
     * See litmus test above for deciding between FAILED_PRECONDITION,
     * ABORTED, and UNAVAILABLE.
     */
    CanonicalCode[CanonicalCode["ABORTED"] = 10] = "ABORTED";
    /**
     * Operation was attempted past the valid range.  E.g., seeking or
     * reading past end of file.
     *
     * Unlike INVALID_ARGUMENT, this error indicates a problem that may
     * be fixed if the system state changes. For example, a 32-bit file
     * system will generate INVALID_ARGUMENT if asked to read at an
     * offset that is not in the range [0,2^32-1], but it will generate
     * OUT_OF_RANGE if asked to read from an offset past the current
     * file size.
     *
     * There is a fair bit of overlap between FAILED_PRECONDITION and
     * OUT_OF_RANGE.  We recommend using OUT_OF_RANGE (the more specific
     * error) when it applies so that callers who are iterating through
     * a space can easily look for an OUT_OF_RANGE error to detect when
     * they are done.
     */
    CanonicalCode[CanonicalCode["OUT_OF_RANGE"] = 11] = "OUT_OF_RANGE";
    /**
     * Operation is not implemented or not supported/enabled in this service.
     */
    CanonicalCode[CanonicalCode["UNIMPLEMENTED"] = 12] = "UNIMPLEMENTED";
    /**
     * Internal errors.  Means some invariants expected by underlying
     * system has been broken.  If you see one of these errors,
     * something is very broken.
     */
    CanonicalCode[CanonicalCode["INTERNAL"] = 13] = "INTERNAL";
    /**
     * The service is currently unavailable.  This is a most likely a
     * transient condition and may be corrected by retrying with
     * a backoff.
     *
     * See litmus test above for deciding between FAILED_PRECONDITION,
     * ABORTED, and UNAVAILABLE.
     */
    CanonicalCode[CanonicalCode["UNAVAILABLE"] = 14] = "UNAVAILABLE";
    /**
     * Unrecoverable data loss or corruption.
     */
    CanonicalCode[CanonicalCode["DATA_LOSS"] = 15] = "DATA_LOSS";
    /**
     * The request does not have valid authentication credentials for the
     * operation.
     */
    CanonicalCode[CanonicalCode["UNAUTHENTICATED"] = 16] = "UNAUTHENTICATED";
})(CanonicalCode = exports.CanonicalCode || (exports.CanonicalCode = {}));
//# sourceMappingURL=status.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/trace_flags.js":
/*!*************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/trace/trace_flags.js ***!
  \*************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An enumeration that represents global trace flags. These flags are
 * propagated to all child {@link Span}. These determine features such as
 * whether a Span should be traced. It is implemented as a bitmask.
 */
var TraceFlags;
(function (TraceFlags) {
    /** Represents no flag set. */
    TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
    /** Bit to represent whether trace is sampled in trace flags. */
    TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
})(TraceFlags = exports.TraceFlags || (exports.TraceFlags = {}));
//# sourceMappingURL=trace_flags.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/NoopContextManager.js":
/*!***********************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/NoopContextManager.js ***!
  \***********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = __webpack_require__(/*! ./context */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/context.js");
class NoopContextManager {
    active() {
        return context_1.Context.ROOT_CONTEXT;
    }
    with(context, fn) {
        return fn();
    }
    bind(target, context) {
        return target;
    }
    enable() {
        return this;
    }
    disable() {
        return this;
    }
}
exports.NoopContextManager = NoopContextManager;
//# sourceMappingURL=NoopContextManager.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/context.js":
/*!************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/context.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class which stores and manages current context values. All methods which
 * update context such as get and delete do not modify an existing context,
 * but create a new one with updated values.
 */
class Context {
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext) {
        this._currentContext = parentContext ? new Map(parentContext) : new Map();
    }
    /** Get a key to uniquely identify a context value */
    static createKey(description) {
        return Symbol(description);
    }
    /**
     * Get a value from the context.
     *
     * @param key key which identifies a context value
     */
    getValue(key) {
        return this._currentContext.get(key);
    }
    /**
     * Create a new context which inherits from this context and has
     * the given key set to the given value.
     *
     * @param key context key for which to set the value
     * @param value value to set for the given key
     */
    setValue(key, value) {
        const context = new Context(this._currentContext);
        context._currentContext.set(key, value);
        return context;
    }
    /**
     * Return a new context which inherits from this context but does
     * not contain a value for the given key.
     *
     * @param key context key for which to clear a value
     */
    deleteValue(key) {
        const context = new Context(this._currentContext);
        context._currentContext.delete(key);
        return context;
    }
}
exports.Context = Context;
/** The root context is used as the default parent context when there is no active context */
Context.ROOT_CONTEXT = new Context();
/**
 * This is another identifier to the root context which allows developers to easily search the
 * codebase for direct uses of context which need to be removed in later PRs.
 *
 * It's existence is temporary and it should be removed when all references are fixed.
 */
Context.TODO = Context.ROOT_CONTEXT;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/index.js":
/*!**********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/index.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./context */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/context.js"));
__export(__webpack_require__(/*! ./NoopContextManager */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/NoopContextManager.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/ConsoleLogger.js":
/*!*****************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/ConsoleLogger.js ***!
  \*****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/types.js");
class ConsoleLogger {
    constructor(level = types_1.LogLevel.INFO) {
        if (level >= types_1.LogLevel.DEBUG) {
            this.debug = (...args) => {
                console.debug(...args);
            };
        }
        if (level >= types_1.LogLevel.INFO) {
            this.info = (...args) => {
                console.info(...args);
            };
        }
        if (level >= types_1.LogLevel.WARN) {
            this.warn = (...args) => {
                console.warn(...args);
            };
        }
        if (level >= types_1.LogLevel.ERROR) {
            this.error = (...args) => {
                console.error(...args);
            };
        }
    }
    debug(message, ...args) { }
    error(message, ...args) { }
    warn(message, ...args) { }
    info(message, ...args) { }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=ConsoleLogger.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/NoopLogger.js":
/*!**************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/NoopLogger.js ***!
  \**************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** No-op implementation of Logger */
class NoopLogger {
    // By default does nothing
    debug(message, ...args) { }
    // By default does nothing
    error(message, ...args) { }
    // By default does nothing
    warn(message, ...args) { }
    // By default does nothing
    info(message, ...args) { }
}
exports.NoopLogger = NoopLogger;
//# sourceMappingURL=NoopLogger.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/time.js":
/*!********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/time.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = __webpack_require__(/*! ../platform */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/index.js");
const NANOSECOND_DIGITS = 9;
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
/**
 * Converts a number to HrTime
 * @param epochMillis
 */
function numberToHrtime(epochMillis) {
    const epochSeconds = epochMillis / 1000;
    // Decimals only.
    const seconds = Math.trunc(epochSeconds);
    // Round sub-nanosecond accuracy to nanosecond.
    const nanos = Number((epochSeconds - seconds).toFixed(NANOSECOND_DIGITS)) *
        SECOND_TO_NANOSECONDS;
    return [seconds, nanos];
}
function getTimeOrigin() {
    let timeOrigin = platform_1.otperformance.timeOrigin;
    if (typeof timeOrigin !== 'number') {
        const perf = platform_1.otperformance;
        timeOrigin = perf.timing && perf.timing.fetchStart;
    }
    return timeOrigin;
}
/**
 * Returns an hrtime calculated via performance component.
 * @param performanceNow
 */
function hrTime(performanceNow) {
    const timeOrigin = numberToHrtime(getTimeOrigin());
    const now = numberToHrtime(typeof performanceNow === 'number' ? performanceNow : platform_1.otperformance.now());
    let seconds = timeOrigin[0] + now[0];
    let nanos = timeOrigin[1] + now[1];
    // Nanoseconds
    if (nanos > SECOND_TO_NANOSECONDS) {
        nanos -= SECOND_TO_NANOSECONDS;
        seconds += 1;
    }
    return [seconds, nanos];
}
exports.hrTime = hrTime;
/**
 *
 * Converts a TimeInput to an HrTime, defaults to _hrtime().
 * @param time
 */
function timeInputToHrTime(time) {
    // process.hrtime
    if (isTimeInputHrTime(time)) {
        return time;
    }
    else if (typeof time === 'number') {
        // Must be a performance.now() if it's smaller than process start time.
        if (time < getTimeOrigin()) {
            return hrTime(time);
        }
        else {
            // epoch milliseconds or performance.timeOrigin
            return numberToHrtime(time);
        }
    }
    else if (time instanceof Date) {
        return [time.getTime(), 0];
    }
    else {
        throw TypeError('Invalid input type');
    }
}
exports.timeInputToHrTime = timeInputToHrTime;
/**
 * Returns a duration of two hrTime.
 * @param startTime
 * @param endTime
 */
function hrTimeDuration(startTime, endTime) {
    let seconds = endTime[0] - startTime[0];
    let nanos = endTime[1] - startTime[1];
    // overflow
    if (nanos < 0) {
        seconds -= 1;
        // negate
        nanos += SECOND_TO_NANOSECONDS;
    }
    return [seconds, nanos];
}
exports.hrTimeDuration = hrTimeDuration;
/**
 * Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
 * @param hrTime
 */
function hrTimeToTimeStamp(hrTime) {
    const precision = NANOSECOND_DIGITS;
    const tmp = `${'0'.repeat(precision)}${hrTime[1]}Z`;
    const nanoString = tmp.substr(tmp.length - precision - 1);
    const date = new Date(hrTime[0] * 1000).toISOString();
    return date.replace('000Z', nanoString);
}
exports.hrTimeToTimeStamp = hrTimeToTimeStamp;
/**
 * Convert hrTime to nanoseconds.
 * @param hrTime
 */
function hrTimeToNanoseconds(hrTime) {
    return hrTime[0] * SECOND_TO_NANOSECONDS + hrTime[1];
}
exports.hrTimeToNanoseconds = hrTimeToNanoseconds;
/**
 * Convert hrTime to milliseconds.
 * @param hrTime
 */
function hrTimeToMilliseconds(hrTime) {
    return Math.round(hrTime[0] * 1e3 + hrTime[1] / 1e6);
}
exports.hrTimeToMilliseconds = hrTimeToMilliseconds;
/**
 * Convert hrTime to microseconds.
 * @param hrTime
 */
function hrTimeToMicroseconds(hrTime) {
    return Math.round(hrTime[0] * 1e6 + hrTime[1] / 1e3);
}
exports.hrTimeToMicroseconds = hrTimeToMicroseconds;
/**
 * check if time is HrTime
 * @param value
 */
function isTimeInputHrTime(value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number');
}
exports.isTimeInputHrTime = isTimeInputHrTime;
/**
 * check if input value is a correct types.TimeInput
 * @param value
 */
function isTimeInput(value) {
    return (isTimeInputHrTime(value) ||
        typeof value === 'number' ||
        value instanceof Date);
}
exports.isTimeInput = isTimeInput;
//# sourceMappingURL=time.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/types.js":
/*!*********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/types.js ***!
  \*********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** Defines a log levels. */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/context.js":
/*!************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/context.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const context_base_1 = __webpack_require__(/*! @opentelemetry/context-base */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/context-base/build/src/index.js");
/**
 * Active span key
 */
exports.ACTIVE_SPAN_KEY = context_base_1.Context.createKey('OpenTelemetry Context Key ACTIVE_SPAN');
const EXTRACTED_SPAN_CONTEXT_KEY = context_base_1.Context.createKey('OpenTelemetry Context Key EXTRACTED_SPAN_CONTEXT');
/**
 * Return the active span if one exists
 *
 * @param context context to get span from
 */
function getActiveSpan(context) {
    return context.getValue(exports.ACTIVE_SPAN_KEY) || undefined;
}
exports.getActiveSpan = getActiveSpan;
/**
 * Set the active span on a context
 *
 * @param context context to use as parent
 * @param span span to set active
 */
function setActiveSpan(context, span) {
    return context.setValue(exports.ACTIVE_SPAN_KEY, span);
}
exports.setActiveSpan = setActiveSpan;
/**
 * Get the extracted span context from a context
 *
 * @param context context to get span context from
 */
function getExtractedSpanContext(context) {
    return (context.getValue(EXTRACTED_SPAN_CONTEXT_KEY) || undefined);
}
exports.getExtractedSpanContext = getExtractedSpanContext;
/**
 * Set the extracted span context on a context
 *
 * @param context context to set span context on
 * @param spanContext span context to set
 */
function setExtractedSpanContext(context, spanContext) {
    return context.setValue(EXTRACTED_SPAN_CONTEXT_KEY, spanContext);
}
exports.setExtractedSpanContext = setExtractedSpanContext;
/**
 * Get the span context of the parent span if it exists,
 * or the extracted span context if there is no active
 * span.
 *
 * @param context context to get values from
 */
function getParentSpanContext(context) {
    var _a;
    return ((_a = getActiveSpan(context)) === null || _a === void 0 ? void 0 : _a.context()) || getExtractedSpanContext(context);
}
exports.getParentSpanContext = getParentSpanContext;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/B3Propagator.js":
/*!*****************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/B3Propagator.js ***!
  \*****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
const context_1 = __webpack_require__(/*! ../context */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/context.js");
exports.X_B3_TRACE_ID = 'x-b3-traceid';
exports.X_B3_SPAN_ID = 'x-b3-spanid';
exports.X_B3_SAMPLED = 'x-b3-sampled';
const VALID_TRACEID_REGEX = /^[0-9a-f]{32}$/i;
const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
const INVALID_ID_REGEX = /^0+$/i;
function isValidTraceId(traceId) {
    return VALID_TRACEID_REGEX.test(traceId) && !INVALID_ID_REGEX.test(traceId);
}
function isValidSpanId(spanId) {
    return VALID_SPANID_REGEX.test(spanId) && !INVALID_ID_REGEX.test(spanId);
}
/**
 * Propagator for the B3 HTTP header format.
 * Based on: https://github.com/openzipkin/b3-propagation
 */
class B3Propagator {
    inject(context, carrier, setter) {
        const spanContext = context_1.getParentSpanContext(context);
        if (!spanContext)
            return;
        if (isValidTraceId(spanContext.traceId) &&
            isValidSpanId(spanContext.spanId)) {
            setter(carrier, exports.X_B3_TRACE_ID, spanContext.traceId);
            setter(carrier, exports.X_B3_SPAN_ID, spanContext.spanId);
            // We set the header only if there is an existing sampling decision.
            // Otherwise we will omit it => Absent.
            if (spanContext.traceFlags !== undefined) {
                setter(carrier, exports.X_B3_SAMPLED, Number(spanContext.traceFlags));
            }
        }
    }
    extract(context, carrier, getter) {
        const traceIdHeader = getter(carrier, exports.X_B3_TRACE_ID);
        const spanIdHeader = getter(carrier, exports.X_B3_SPAN_ID);
        const sampledHeader = getter(carrier, exports.X_B3_SAMPLED);
        const traceId = Array.isArray(traceIdHeader)
            ? traceIdHeader[0]
            : traceIdHeader;
        const spanId = Array.isArray(spanIdHeader) ? spanIdHeader[0] : spanIdHeader;
        const options = Array.isArray(sampledHeader)
            ? sampledHeader[0]
            : sampledHeader;
        if (typeof traceId !== 'string' || typeof spanId !== 'string')
            return context;
        if (isValidTraceId(traceId) && isValidSpanId(spanId)) {
            return context_1.setExtractedSpanContext(context, {
                traceId,
                spanId,
                isRemote: true,
                traceFlags: isNaN(Number(options)) ? api_1.TraceFlags.NONE : Number(options),
            });
        }
        return context;
    }
}
exports.B3Propagator = B3Propagator;
//# sourceMappingURL=B3Propagator.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/HttpTraceContext.js":
/*!*********************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/HttpTraceContext.js ***!
  \*********************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
const TraceState_1 = __webpack_require__(/*! ../../trace/TraceState */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/TraceState.js");
const context_1 = __webpack_require__(/*! ../context */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/context.js");
exports.TRACE_PARENT_HEADER = 'traceparent';
exports.TRACE_STATE_HEADER = 'tracestate';
const VALID_TRACE_PARENT_REGEX = /^00-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/;
const VERSION = '00';
/**
 * Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
 * @param traceParent - A meta property that comes from server.
 *     It should be dynamically generated server side to have the server's request trace Id,
 *     a parent span Id that was set on the server's request span,
 *     and the trace flags to indicate the server's sampling decision
 *     (01 = sampled, 00 = not sampled).
 *     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
 *     For more information see {@link https://www.w3.org/TR/trace-context/}
 */
function parseTraceParent(traceParent) {
    const match = traceParent.match(VALID_TRACE_PARENT_REGEX);
    if (!match ||
        match[1] === '00000000000000000000000000000000' ||
        match[2] === '0000000000000000') {
        return null;
    }
    return {
        traceId: match[1],
        spanId: match[2],
        traceFlags: parseInt(match[3], 16),
    };
}
exports.parseTraceParent = parseTraceParent;
/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 *
 * Based on the Trace Context specification:
 * https://www.w3.org/TR/trace-context/
 */
class HttpTraceContext {
    inject(context, carrier, setter) {
        const spanContext = context_1.getParentSpanContext(context);
        if (!spanContext)
            return;
        const traceParent = `${VERSION}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || api_1.TraceFlags.NONE).toString(16)}`;
        setter(carrier, exports.TRACE_PARENT_HEADER, traceParent);
        if (spanContext.traceState) {
            setter(carrier, exports.TRACE_STATE_HEADER, spanContext.traceState.serialize());
        }
    }
    extract(context, carrier, getter) {
        const traceParentHeader = getter(carrier, exports.TRACE_PARENT_HEADER);
        if (!traceParentHeader)
            return context;
        const traceParent = Array.isArray(traceParentHeader)
            ? traceParentHeader[0]
            : traceParentHeader;
        if (typeof traceParent !== 'string')
            return context;
        const spanContext = parseTraceParent(traceParent);
        if (!spanContext)
            return context;
        spanContext.isRemote = true;
        const traceStateHeader = getter(carrier, exports.TRACE_STATE_HEADER);
        if (traceStateHeader) {
            // If more than one `tracestate` header is found, we merge them into a
            // single header.
            const state = Array.isArray(traceStateHeader)
                ? traceStateHeader.join(',')
                : traceStateHeader;
            spanContext.traceState = new TraceState_1.TraceState(typeof state === 'string' ? state : undefined);
        }
        return context_1.setExtractedSpanContext(context, spanContext);
    }
}
exports.HttpTraceContext = HttpTraceContext;
//# sourceMappingURL=HttpTraceContext.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/composite.js":
/*!**************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/composite.js ***!
  \**************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const NoopLogger_1 = __webpack_require__(/*! ../../common/NoopLogger */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/NoopLogger.js");
/** Combines multiple propagators into a single propagator. */
class CompositePropagator {
    /**
     * Construct a composite propagator from a list of propagators.
     *
     * @param [config] Configuration object for composite propagator
     */
    constructor(config = {}) {
        var _a, _b;
        this._propagators = (_a = config.propagators, (_a !== null && _a !== void 0 ? _a : []));
        this._logger = (_b = config.logger, (_b !== null && _b !== void 0 ? _b : new NoopLogger_1.NoopLogger()));
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same carrier key, the propagator later in the list
     * will "win".
     *
     * @param context Context to inject
     * @param carrier Carrier into which context will be injected
     */
    inject(context, carrier, setter) {
        for (const propagator of this._propagators) {
            try {
                propagator.inject(context, carrier, setter);
            }
            catch (err) {
                this._logger.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
            }
        }
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same context key, the propagator later in the list
     * will "win".
     *
     * @param context Context to add values to
     * @param carrier Carrier from which to extract context
     */
    extract(context, carrier, getter) {
        return this._propagators.reduce((ctx, propagator) => {
            try {
                return propagator.extract(ctx, carrier, getter);
            }
            catch (err) {
                this._logger.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
            }
            return ctx;
        }, context);
    }
}
exports.CompositePropagator = CompositePropagator;
//# sourceMappingURL=composite.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js":
/*!**************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js ***!
  \**************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./common/ConsoleLogger */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/ConsoleLogger.js"));
__export(__webpack_require__(/*! ./common/NoopLogger */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/NoopLogger.js"));
__export(__webpack_require__(/*! ./common/time */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/time.js"));
__export(__webpack_require__(/*! ./common/types */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/common/types.js"));
__export(__webpack_require__(/*! ./version */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/version.js"));
__export(__webpack_require__(/*! ./context/context */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/context.js"));
__export(__webpack_require__(/*! ./context/propagation/B3Propagator */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/B3Propagator.js"));
__export(__webpack_require__(/*! ./context/propagation/composite */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/composite.js"));
__export(__webpack_require__(/*! ./context/propagation/HttpTraceContext */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/context/propagation/HttpTraceContext.js"));
__export(__webpack_require__(/*! ./platform */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/index.js"));
__export(__webpack_require__(/*! ./trace/instrumentation/BasePlugin */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/instrumentation/BasePlugin.js"));
__export(__webpack_require__(/*! ./trace/NoRecordingSpan */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/NoRecordingSpan.js"));
__export(__webpack_require__(/*! ./trace/sampler/ProbabilitySampler */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/sampler/ProbabilitySampler.js"));
__export(__webpack_require__(/*! ./trace/spancontext-utils */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/spancontext-utils.js"));
__export(__webpack_require__(/*! ./trace/TraceState */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/TraceState.js"));
__export(__webpack_require__(/*! ./utils/url */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/utils/url.js"));
__export(__webpack_require__(/*! ./utils/wrap */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/utils/wrap.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/internal/validators.js":
/*!****************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/internal/validators.js ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const VALID_KEY_CHAR_RANGE = '[_0-9a-z-*/]';
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
/**
 * Key is opaque string up to 256 characters printable. It MUST begin with a
 * lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
 * underscores _, dashes -, asterisks *, and forward slashes /.
 * For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
 * vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
 * see https://www.w3.org/TR/trace-context/#key
 */
function validateKey(key) {
    return VALID_KEY_REGEX.test(key);
}
exports.validateKey = validateKey;
/**
 * Value is opaque string up to 256 characters printable ASCII RFC0020
 * characters (i.e., the range 0x20 to 0x7E) except comma , and =.
 */
function validateValue(value) {
    return (VALID_VALUE_BASE_REGEX.test(value) &&
        !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value));
}
exports.validateValue = validateValue;
//# sourceMappingURL=validators.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/hex-to-base64.js":
/*!***************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/hex-to-base64.js ***!
  \***************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * converts id string into base64
 * @param hexStr - id of span
 */
function hexToBase64(hexStr) {
    const hexStrLen = hexStr.length;
    let hexAsciiCharsStr = '';
    for (let i = 0; i < hexStrLen; i += 2) {
        const hexPair = hexStr.substring(i, i + 2);
        const hexVal = parseInt(hexPair, 16);
        hexAsciiCharsStr += String.fromCharCode(hexVal);
    }
    return btoa(hexAsciiCharsStr);
}
exports.hexToBase64 = hexToBase64;
//# sourceMappingURL=hex-to-base64.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/id.js":
/*!****************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/id.js ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cryptoLib = window.crypto || window.msCrypto;
const SPAN_ID_BYTES = 8;
const TRACE_ID_BYTES = 16;
const randomBytesArray = new Uint8Array(TRACE_ID_BYTES);
/** Returns a random 16-byte trace ID formatted as a 32-char hex string. */
function randomTraceId() {
    cryptoLib.getRandomValues(randomBytesArray);
    return toHex(randomBytesArray.slice(0, TRACE_ID_BYTES));
}
exports.randomTraceId = randomTraceId;
/** Returns a random 8-byte span ID formatted as a 16-char hex string. */
function randomSpanId() {
    cryptoLib.getRandomValues(randomBytesArray);
    return toHex(randomBytesArray.slice(0, SPAN_ID_BYTES));
}
exports.randomSpanId = randomSpanId;
/**
 * Get the hex string representation of a byte array
 *
 * @param byteArray
 */
function toHex(byteArray) {
    const chars = new Array(byteArray.length * 2);
    const alpha = 'a'.charCodeAt(0) - 10;
    const digit = '0'.charCodeAt(0);
    let p = 0;
    for (let i = 0; i < byteArray.length; i++) {
        let nibble = (byteArray[i] >>> 4) & 0xf;
        chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
        nibble = byteArray[i] & 0xf;
        chars[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
    }
    return String.fromCharCode.apply(null, chars);
}
//# sourceMappingURL=id.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/index.js":
/*!*******************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/index.js ***!
  \*******************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./id */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/id.js"));
__export(__webpack_require__(/*! ./performance */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/performance.js"));
__export(__webpack_require__(/*! ./timer-util */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/timer-util.js"));
__export(__webpack_require__(/*! ./hex-to-base64 */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/hex-to-base64.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/performance.js":
/*!*************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/performance.js ***!
  \*************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.otperformance = performance;
//# sourceMappingURL=performance.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/timer-util.js":
/*!************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/platform/browser/timer-util.js ***!
  \************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** This is Node specific, does nothing in case of browser */
function unrefTimer(timer) { }
exports.unrefTimer = unrefTimer;
//# sourceMappingURL=timer-util.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/NoRecordingSpan.js":
/*!******************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/NoRecordingSpan.js ***!
  \******************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
const spancontext_utils_1 = __webpack_require__(/*! ../trace/spancontext-utils */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/spancontext-utils.js");
/**
 * The NoRecordingSpan extends the {@link NoopSpan}, making all operations no-op
 * except context propagation.
 */
class NoRecordingSpan extends api_1.NoopSpan {
    constructor(spanContext) {
        super(spanContext);
        this._context = spanContext || spancontext_utils_1.INVALID_SPAN_CONTEXT;
    }
    // Returns a SpanContext.
    context() {
        return this._context;
    }
}
exports.NoRecordingSpan = NoRecordingSpan;
//# sourceMappingURL=NoRecordingSpan.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/TraceState.js":
/*!*************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/TraceState.js ***!
  \*************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = __webpack_require__(/*! ../internal/validators */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/internal/validators.js");
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ',';
const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';
/**
 * TraceState must be a class and not a simple object type because of the spec
 * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
 *
 * Here is the list of allowed mutations:
 * - New key-value pair should be added into the beginning of the list
 * - The value of any key can be updated. Modified keys MUST be moved to the
 * beginning of the list.
 */
class TraceState {
    constructor(rawTraceState) {
        this._internalState = new Map();
        if (rawTraceState)
            this._parse(rawTraceState);
    }
    set(key, value) {
        // TODO: Benchmark the different approaches(map vs list) and
        // use the faster one.
        if (this._internalState.has(key))
            this._internalState.delete(key);
        this._internalState.set(key, value);
    }
    unset(key) {
        this._internalState.delete(key);
    }
    get(key) {
        return this._internalState.get(key);
    }
    serialize() {
        return this._keys()
            .reduce((agg, key) => {
            agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
            return agg;
        }, [])
            .join(LIST_MEMBERS_SEPARATOR);
    }
    _parse(rawTraceState) {
        if (rawTraceState.length > MAX_TRACE_STATE_LEN)
            return;
        this._internalState = rawTraceState
            .split(LIST_MEMBERS_SEPARATOR)
            .reverse() // Store in reverse so new keys (.set(...)) will be placed at the beginning
            .reduce((agg, part) => {
            const i = part.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
            if (i !== -1) {
                const key = part.slice(0, i);
                const value = part.slice(i + 1, part.length);
                if (validators_1.validateKey(key) && validators_1.validateValue(value)) {
                    agg.set(key, value);
                }
                else {
                    // TODO: Consider to add warning log
                }
            }
            return agg;
        }, new Map());
        // Because of the reverse() requirement, trunc must be done after map is created
        if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
            this._internalState = new Map(Array.from(this._internalState.entries())
                .reverse() // Use reverse same as original tracestate parse chain
                .slice(0, MAX_TRACE_STATE_ITEMS));
        }
    }
    _keys() {
        return Array.from(this._internalState.keys()).reverse();
    }
}
exports.TraceState = TraceState;
//# sourceMappingURL=TraceState.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/instrumentation sync recursive":
/*!********************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/instrumentation sync ***!
  \********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/instrumentation sync recursive";

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/instrumentation/BasePlugin.js":
/*!*****************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/instrumentation/BasePlugin.js ***!
  \*****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const semver = __webpack_require__(/*! semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/index.js");
const path = __webpack_require__(/*! path */ "./node_modules/path-browserify/index.js");
/** This class represent the base to patch plugin. */
class BasePlugin {
    constructor(_tracerName, _tracerVersion) {
        this._tracerName = _tracerName;
        this._tracerVersion = _tracerVersion;
    }
    enable(moduleExports, tracerProvider, logger, config) {
        this._moduleExports = moduleExports;
        this._tracer = tracerProvider.getTracer(this._tracerName, this._tracerVersion);
        this._logger = logger;
        this._internalFilesExports = this._loadInternalFilesExports();
        if (config)
            this._config = config;
        return this.patch();
    }
    disable() {
        this.unpatch();
    }
    /**
     * @TODO: To avoid circular dependencies, internal file loading functionality currently
     * lives in BasePlugin. It is not meant to work in the browser and so this logic
     * should eventually be moved somewhere else where it makes more sense.
     * https://github.com/open-telemetry/opentelemetry-js/issues/285
     */
    _loadInternalFilesExports() {
        if (!this._internalFilesList)
            return {};
        if (!this.version || !this.moduleName || !this._basedir) {
            // log here because internalFilesList was provided, so internal file loading
            // was expected to be working
            this._logger.debug('loadInternalFiles failed because one of the required fields was missing: moduleName=%s, version=%s, basedir=%s', this.moduleName, this.version, this._basedir);
            return {};
        }
        let extraModules = {};
        this._logger.debug('loadInternalFiles %o', this._internalFilesList);
        Object.keys(this._internalFilesList).forEach(versionRange => {
            this._loadInternalModule(versionRange, extraModules);
        });
        if (Object.keys(extraModules).length === 0) {
            this._logger.debug('No internal files could be loaded for %s@%s', this.moduleName, this.version);
        }
        return extraModules;
    }
    _loadInternalModule(versionRange, outExtraModules) {
        if (semver.satisfies(this.version, versionRange)) {
            if (Object.keys(outExtraModules).length > 0) {
                this._logger.warn('Plugin for %s@%s, has overlap version range (%s) for internal files: %o', this.moduleName, this.version, versionRange, this._internalFilesList);
            }
            this._requireInternalFiles(this._internalFilesList[versionRange], this._basedir, outExtraModules);
        }
    }
    _requireInternalFiles(extraModulesList, basedir, outExtraModules) {
        if (!extraModulesList)
            return;
        Object.keys(extraModulesList).forEach(moduleName => {
            try {
                this._logger.debug('loading File %s', extraModulesList[moduleName]);
                outExtraModules[moduleName] = __webpack_require__("./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/instrumentation sync recursive")(path.join(basedir, extraModulesList[moduleName]));
            }
            catch (e) {
                this._logger.error('Could not load internal file %s of module %s. Error: %s', path.join(basedir, extraModulesList[moduleName]), this.moduleName, e.message);
            }
        });
    }
}
exports.BasePlugin = BasePlugin;
//# sourceMappingURL=BasePlugin.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/sampler/ProbabilitySampler.js":
/*!*****************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/sampler/ProbabilitySampler.js ***!
  \*****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
/** Sampler that samples a given fraction of traces. */
class ProbabilitySampler {
    constructor(_probability = 0) {
        this._probability = _probability;
        this._probability = this._normalize(_probability);
    }
    shouldSample(parentContext) {
        // Respect the parent sampling decision if there is one
        if (parentContext && typeof parentContext.traceFlags !== 'undefined') {
            return ((api_1.TraceFlags.SAMPLED & parentContext.traceFlags) === api_1.TraceFlags.SAMPLED);
        }
        if (this._probability >= 1.0)
            return true;
        else if (this._probability <= 0)
            return false;
        return Math.random() < this._probability;
    }
    toString() {
        // TODO: Consider to use `AlwaysSampleSampler` and `NeverSampleSampler`
        // based on the specs.
        return `ProbabilitySampler{${this._probability}}`;
    }
    _normalize(probability) {
        if (typeof probability !== 'number' || isNaN(probability))
            return 0;
        return probability >= 1 ? 1 : probability <= 0 ? 0 : probability;
    }
}
exports.ProbabilitySampler = ProbabilitySampler;
exports.ALWAYS_SAMPLER = new ProbabilitySampler(1);
exports.NEVER_SAMPLER = new ProbabilitySampler(0);
//# sourceMappingURL=ProbabilitySampler.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/spancontext-utils.js":
/*!********************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/trace/spancontext-utils.js ***!
  \********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
exports.INVALID_SPANID = '0';
exports.INVALID_TRACEID = '0';
exports.INVALID_SPAN_CONTEXT = {
    traceId: exports.INVALID_TRACEID,
    spanId: exports.INVALID_SPANID,
    traceFlags: api_1.TraceFlags.NONE,
};
/**
 * Returns true if this {@link SpanContext} is valid.
 * @return true if this {@link SpanContext} is valid.
 */
function isValid(spanContext) {
    return (spanContext.traceId !== exports.INVALID_TRACEID &&
        spanContext.spanId !== exports.INVALID_SPANID);
}
exports.isValid = isValid;
//# sourceMappingURL=spancontext-utils.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/utils/url.js":
/*!******************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/utils/url.js ***!
  \******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Check if {@param url} matches {@param urlToMatch}
 * @param url
 * @param urlToMatch
 */
function urlMatches(url, urlToMatch) {
    if (typeof urlToMatch === 'string') {
        return url === urlToMatch;
    }
    else {
        return !!url.match(urlToMatch);
    }
}
exports.urlMatches = urlMatches;
/**
 * Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
 * @param url
 * @param ignoredUrls
 */
function isUrlIgnored(url, ignoredUrls) {
    if (!ignoredUrls) {
        return false;
    }
    for (const ignoreUrl of ignoredUrls) {
        if (urlMatches(url, ignoreUrl)) {
            return true;
        }
    }
    return false;
}
exports.isUrlIgnored = isUrlIgnored;
//# sourceMappingURL=url.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/utils/wrap.js":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/utils/wrap.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Checks if certain function has been already wrapped
 * @param func
 */
function isWrapped(func) {
    return (typeof func === 'function' &&
        typeof func.__original === 'function' &&
        typeof func.__unwrap === 'function' &&
        func.__wrapped === true);
}
exports.isWrapped = isWrapped;
//# sourceMappingURL=wrap.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/version.js":
/*!****************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/version.js ***!
  \****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// this is autogenerated file, see scripts/version-update.js
exports.VERSION = '0.6.1';
//# sourceMappingURL=version.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/Resource.js":
/*!**********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/Resource.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(/*! @opentelemetry/base */ "./node_modules/@opentelemetry/base/build/src/index.js");
const constants_1 = __webpack_require__(/*! ./constants */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/constants.js");
/**
 * A Resource describes the entity for which a signals (metrics or trace) are
 * collected.
 */
class Resource {
    constructor(
    /**
     * A dictionary of labels with string keys and values that provide information
     * about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on labels.
     */
    labels) {
        this.labels = labels;
    }
    /**
     * Returns an empty Resource
     */
    static empty() {
        return Resource.EMPTY;
    }
    /**
     * Returns a Resource that indentifies the SDK in use.
     */
    static createTelemetrySDKResource() {
        return new Resource({
            [constants_1.TELEMETRY_SDK_RESOURCE.LANGUAGE]: base_1.SDK_INFO.LANGUAGE,
            [constants_1.TELEMETRY_SDK_RESOURCE.NAME]: base_1.SDK_INFO.NAME,
            [constants_1.TELEMETRY_SDK_RESOURCE.VERSION]: base_1.SDK_INFO.VERSION,
        });
    }
    /**
     * Returns a new, merged {@link Resource} by merging the current Resource
     * with the other Resource. In case of a collision, current Resource takes
     * precedence.
     *
     * @param other the Resource that will be merged with this.
     * @returns the newly merged Resource.
     */
    merge(other) {
        if (!other || !Object.keys(other.labels).length)
            return this;
        // Labels from resource overwrite labels from other resource.
        const mergedLabels = Object.assign({}, other.labels, this.labels);
        return new Resource(mergedLabels);
    }
}
exports.Resource = Resource;
Resource.EMPTY = new Resource({});
//# sourceMappingURL=Resource.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/constants.js":
/*!***********************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/constants.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Semantic conventions for Resources
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-resource-semantic-conventions.md
 */
/** Attributes defining a running environment (e.g. Cloud, Data Center). */
exports.CLOUD_RESOURCE = {
    /** Name of the cloud provider. Example values are aws, azure, gcp. */
    PROVIDER: 'cloud.provider',
    /** The cloud account id used to identify different entities. */
    ACCOUNT_ID: 'cloud.account.id',
    /** A specific geographical location where different entities can run. */
    REGION: 'cloud.region',
    /** Zones are a sub set of the region connected through low-latency links. */
    ZONE: 'cloud.zone',
};
/**
 * Attributes defining a compute unit (e.g. Container, Process, Lambda
 * Function).
 * */
exports.CONTAINER_RESOURCE = {
    /** The container name. */
    NAME: 'container.name',
    /** The name of the image the container was built on. */
    IMAGE_NAME: 'container.image.name',
    /** The container image tag. */
    IMAGE_TAG: 'container.image.tag',
};
/** Attributes defining a computing instance (e.g. host). */
exports.HOST_RESOURCE = {
    /**
     * Hostname of the host. It contains what the hostname command returns on the
     * host machine.
     */
    HOSTNAME: 'host.hostname',
    /**
     * Unique host id. For Cloud this must be the instance_id assigned by the
     * cloud provider
     */
    ID: 'host.id',
    /**
     * Name of the host. It may contain what hostname returns on Unix systems,
     * the fully qualified, or a name specified by the user.
     */
    NAME: 'host.name',
    /** Type of host. For Cloud this must be the machine type.*/
    TYPE: 'host.type',
    /** Name of the VM image or OS install the host was instantiated from. */
    IMAGE_NAME: 'host.image.name',
    /** VM image id. For Cloud, this value is from the provider. */
    IMAGE_ID: 'host.image.id',
    /** The version string of the VM image */
    IMAGE_VERSION: 'host.image.version',
};
/** Attributes defining a deployment service (e.g. Kubernetes). */
exports.K8S_RESOURCE = {
    /** The name of the cluster that the pod is running in. */
    CLUSTER_NAME: 'k8s.cluster.name',
    /** The name of the namespace that the pod is running in. */
    NAMESPACE_NAME: 'k8s.namespace.name',
    /** The name of the pod. */
    POD_NAME: 'k8s.pod.name',
    /** The name of the deployment. */
    DEPLOYMENT_NAME: 'k8s.deployment.name',
};
/** Attributes describing the telemetry library. */
exports.TELEMETRY_SDK_RESOURCE = {
    /** The name of the telemetry library. */
    NAME: 'telemetry.sdk.name',
    /** The language of telemetry library and of the code instrumented with it. */
    LANGUAGE: 'telemetry.sdk.language',
    /** The version string of the telemetry library */
    VERSION: 'telemetry.sdk.version',
};
/** Attributes describing a service instance. */
exports.SERVICE_RESOURCE = {
    /** Logical name of the service.  */
    NAME: 'service.name',
    /** A namespace for `service.name`. */
    NAMESPACE: 'service.namespace',
    /** The string ID of the service instance. */
    INSTANCE_ID: 'service.instance.id',
    /** The version string of the service API or implementation. */
    VERSION: 'service.version',
};
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/index.js":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/index.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var Resource_1 = __webpack_require__(/*! ./Resource */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/Resource.js");
exports.Resource = Resource_1.Resource;
__export(__webpack_require__(/*! ./constants */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/constants.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/BasicTracerProvider.js":
/*!*******************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/BasicTracerProvider.js ***!
  \*******************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js");
const _1 = __webpack_require__(/*! . */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/index.js");
const config_1 = __webpack_require__(/*! ./config */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/config.js");
const MultiSpanProcessor_1 = __webpack_require__(/*! ./MultiSpanProcessor */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/MultiSpanProcessor.js");
const NoopSpanProcessor_1 = __webpack_require__(/*! ./NoopSpanProcessor */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/NoopSpanProcessor.js");
const resources_1 = __webpack_require__(/*! @opentelemetry/resources */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/resources/build/src/index.js");
/**
 * This class represents a basic tracer provider which platform libraries can extend
 */
class BasicTracerProvider {
    constructor(_config = config_1.DEFAULT_CONFIG) {
        this._config = _config;
        this._registeredSpanProcessors = [];
        this._tracers = new Map();
        this.activeSpanProcessor = new NoopSpanProcessor_1.NoopSpanProcessor();
        this.logger = _config.logger || new core_1.ConsoleLogger(_config.logLevel);
        this.resource = _config.resource || resources_1.Resource.createTelemetrySDKResource();
    }
    getTracer(name, version = '*', config) {
        const key = `${name}@${version}`;
        if (!this._tracers.has(key)) {
            this._tracers.set(key, new _1.Tracer(config || this._config, this));
        }
        return this._tracers.get(key);
    }
    /**
     * Adds a new {@link SpanProcessor} to this tracer.
     * @param spanProcessor the new SpanProcessor to be added.
     */
    addSpanProcessor(spanProcessor) {
        this._registeredSpanProcessors.push(spanProcessor);
        this.activeSpanProcessor = new MultiSpanProcessor_1.MultiSpanProcessor(this._registeredSpanProcessors);
    }
    getActiveSpanProcessor() {
        return this.activeSpanProcessor;
    }
    /**
     * Register this TracerProvider for use with the OpenTelemetry API.
     * Undefined values may be replaced with defaults, and
     * null values will be skipped.
     *
     * @param config Configuration object for SDK registration
     */
    register(config = {}) {
        api.trace.setGlobalTracerProvider(this);
        if (config.propagator === undefined) {
            config.propagator = new core_1.HttpTraceContext();
        }
        if (config.contextManager) {
            api.context.setGlobalContextManager(config.contextManager);
        }
        if (config.propagator) {
            api.propagation.setGlobalPropagator(config.propagator);
        }
    }
}
exports.BasicTracerProvider = BasicTracerProvider;
//# sourceMappingURL=BasicTracerProvider.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/MultiSpanProcessor.js":
/*!******************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/MultiSpanProcessor.js ***!
  \******************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Implementation of the {@link SpanProcessor} that simply forwards all
 * received events to a list of {@link SpanProcessor}s.
 */
class MultiSpanProcessor {
    constructor(_spanProcessors) {
        this._spanProcessors = _spanProcessors;
    }
    forceFlush() {
        // do nothing as all spans are being exported without waiting
    }
    onStart(span) {
        for (const spanProcessor of this._spanProcessors) {
            spanProcessor.onStart(span);
        }
    }
    onEnd(span) {
        for (const spanProcessor of this._spanProcessors) {
            spanProcessor.onEnd(span);
        }
    }
    shutdown() {
        for (const spanProcessor of this._spanProcessors) {
            spanProcessor.shutdown();
        }
    }
}
exports.MultiSpanProcessor = MultiSpanProcessor;
//# sourceMappingURL=MultiSpanProcessor.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/NoopSpanProcessor.js":
/*!*****************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/NoopSpanProcessor.js ***!
  \*****************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** No-op implementation of SpanProcessor */
class NoopSpanProcessor {
    onStart(span) { }
    onEnd(span) { }
    shutdown() { }
    forceFlush() { }
}
exports.NoopSpanProcessor = NoopSpanProcessor;
//# sourceMappingURL=NoopSpanProcessor.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/Span.js":
/*!****************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/Span.js ***!
  \****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const types = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js");
/**
 * This class represents a span.
 */
class Span {
    /** Constructs a new Span instance. */
    constructor(parentTracer, spanName, spanContext, kind, parentSpanId, links = [], startTime = core_1.hrTime()) {
        this.attributes = {};
        this.links = [];
        this.events = [];
        this.status = {
            code: types.CanonicalCode.OK,
        };
        this.endTime = [0, 0];
        this._ended = false;
        this._duration = [-1, -1];
        this.name = spanName;
        this.spanContext = spanContext;
        this.parentSpanId = parentSpanId;
        this.kind = kind;
        this.links = links;
        this.startTime = core_1.timeInputToHrTime(startTime);
        this.resource = parentTracer.resource;
        this._logger = parentTracer.logger;
        this._traceParams = parentTracer.getActiveTraceParams();
        this._spanProcessor = parentTracer.getActiveSpanProcessor();
        this._spanProcessor.onStart(this);
    }
    context() {
        return this.spanContext;
    }
    setAttribute(key, value) {
        if (this._isSpanEnded())
            return this;
        if (Object.keys(this.attributes).length >=
            this._traceParams.numberOfAttributesPerSpan) {
            const attributeKeyToDelete = Object.keys(this.attributes).shift();
            if (attributeKeyToDelete) {
                this._logger.warn(`Dropping extra attributes : ${attributeKeyToDelete}`);
                delete this.attributes[attributeKeyToDelete];
            }
        }
        this.attributes[key] = value;
        return this;
    }
    setAttributes(attributes) {
        Object.keys(attributes).forEach(key => {
            this.setAttribute(key, attributes[key]);
        });
        return this;
    }
    /**
     *
     * @param name Span Name
     * @param [attributesOrStartTime] Span attributes or start time
     *     if type is {@type TimeInput} and 3rd param is undefined
     * @param [startTime] Specified start time for the event
     */
    addEvent(name, attributesOrStartTime, startTime) {
        if (this._isSpanEnded())
            return this;
        if (this.events.length >= this._traceParams.numberOfEventsPerSpan) {
            this._logger.warn('Dropping extra events.');
            this.events.shift();
        }
        if (core_1.isTimeInput(attributesOrStartTime)) {
            if (typeof startTime === 'undefined') {
                startTime = attributesOrStartTime;
            }
            attributesOrStartTime = undefined;
        }
        if (typeof startTime === 'undefined') {
            startTime = core_1.hrTime();
        }
        this.events.push({
            name,
            attributes: attributesOrStartTime,
            time: core_1.timeInputToHrTime(startTime),
        });
        return this;
    }
    setStatus(status) {
        if (this._isSpanEnded())
            return this;
        this.status = status;
        return this;
    }
    updateName(name) {
        if (this._isSpanEnded())
            return this;
        this.name = name;
        return this;
    }
    end(endTime = core_1.hrTime()) {
        if (this._isSpanEnded()) {
            this._logger.error('You can only call end() on a span once.');
            return;
        }
        this._ended = true;
        this.endTime = core_1.timeInputToHrTime(endTime);
        this._duration = core_1.hrTimeDuration(this.startTime, this.endTime);
        if (this._duration[0] < 0) {
            this._logger.warn('Inconsistent start and end time, startTime > endTime', this.startTime, this.endTime);
        }
        this._spanProcessor.onEnd(this);
    }
    isRecording() {
        return true;
    }
    toReadableSpan() {
        return this;
    }
    get duration() {
        return this._duration;
    }
    get ended() {
        return this._ended;
    }
    _isSpanEnded() {
        if (this._ended) {
            this._logger.warn('Can not execute the operation on ended Span {traceId: %s, spanId: %s}', this.spanContext.traceId, this.spanContext.spanId);
        }
        return this._ended;
    }
}
exports.Span = Span;
//# sourceMappingURL=Span.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/Tracer.js":
/*!******************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/Tracer.js ***!
  \******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js");
const Span_1 = __webpack_require__(/*! ./Span */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/Span.js");
const utility_1 = __webpack_require__(/*! ./utility */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/utility.js");
/**
 * This class represents a basic tracer.
 */
class Tracer {
    /**
     * Constructs a new Tracer instance.
     */
    constructor(config, _tracerProvider) {
        this._tracerProvider = _tracerProvider;
        const localConfig = utility_1.mergeConfig(config);
        this._defaultAttributes = localConfig.defaultAttributes;
        this._sampler = localConfig.sampler;
        this._traceParams = localConfig.traceParams;
        this.resource = _tracerProvider.resource;
        this.logger = config.logger || new core_1.ConsoleLogger(config.logLevel);
    }
    /**
     * Starts a new Span or returns the default NoopSpan based on the sampling
     * decision.
     */
    startSpan(name, options = {}, context = api.context.active()) {
        const parentContext = getParent(options, context);
        // make sampling decision
        const samplingDecision = this._sampler.shouldSample(parentContext);
        const spanId = core_1.randomSpanId();
        let traceId;
        let traceState;
        if (!parentContext || !core_1.isValid(parentContext)) {
            // New root span.
            traceId = core_1.randomTraceId();
        }
        else {
            // New child span.
            traceId = parentContext.traceId;
            traceState = parentContext.traceState;
        }
        const traceFlags = samplingDecision
            ? api.TraceFlags.SAMPLED
            : api.TraceFlags.NONE;
        const spanContext = { traceId, spanId, traceFlags, traceState };
        if (!samplingDecision) {
            this.logger.debug('Sampling is off, starting no recording span');
            return new core_1.NoRecordingSpan(spanContext);
        }
        const span = new Span_1.Span(this, name, spanContext, options.kind || api.SpanKind.INTERNAL, parentContext ? parentContext.spanId : undefined, options.links || [], options.startTime);
        // Set default attributes
        span.setAttributes(Object.assign({}, this._defaultAttributes, options.attributes));
        return span;
    }
    /**
     * Returns the current Span from the current context.
     *
     * If there is no Span associated with the current context, undefined is returned.
     */
    getCurrentSpan() {
        const ctx = api.context.active();
        // Get the current Span from the context or null if none found.
        return core_1.getActiveSpan(ctx);
    }
    /**
     * Enters the context of code where the given Span is in the current context.
     */
    withSpan(span, fn) {
        // Set given span to context.
        return api.context.with(core_1.setActiveSpan(api.context.active(), span), fn);
    }
    /**
     * Bind a span (or the current one) to the target's context
     */
    bind(target, span) {
        return api.context.bind(target, span ? core_1.setActiveSpan(api.context.active(), span) : api.context.active());
    }
    /** Returns the active {@link TraceParams}. */
    getActiveTraceParams() {
        return this._traceParams;
    }
    getActiveSpanProcessor() {
        return this._tracerProvider.getActiveSpanProcessor();
    }
}
exports.Tracer = Tracer;
/**
 * Get the parent to assign to a started span. If options.parent is null,
 * do not assign a parent.
 *
 * @param options span options
 * @param context context to check for parent
 */
function getParent(options, context) {
    if (options.parent === null)
        return undefined;
    if (options.parent)
        return getContext(options.parent);
    return core_1.getParentSpanContext(context);
}
function getContext(span) {
    return isSpan(span) ? span.context() : span;
}
function isSpan(span) {
    return typeof span.context === 'function';
}
//# sourceMappingURL=Tracer.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/config.js":
/*!******************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/config.js ***!
  \******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js");
/** Default limit for Message events per span */
exports.DEFAULT_MAX_EVENTS_PER_SPAN = 128;
/** Default limit for Attributes per span */
exports.DEFAULT_MAX_ATTRIBUTES_PER_SPAN = 32;
/** Default limit for Links per span */
exports.DEFAULT_MAX_LINKS_PER_SPAN = 32;
/**
 * Default configuration. For fields with primitive values, any user-provided
 * value will override the corresponding default value. For fields with
 * non-primitive values (like `traceParams`), the user-provided value will be
 * used to extend the default value.
 */
exports.DEFAULT_CONFIG = {
    defaultAttributes: {},
    logLevel: core_1.LogLevel.INFO,
    sampler: core_1.ALWAYS_SAMPLER,
    traceParams: {
        numberOfAttributesPerSpan: exports.DEFAULT_MAX_ATTRIBUTES_PER_SPAN,
        numberOfLinksPerSpan: exports.DEFAULT_MAX_LINKS_PER_SPAN,
        numberOfEventsPerSpan: exports.DEFAULT_MAX_EVENTS_PER_SPAN,
    },
};
//# sourceMappingURL=config.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/BatchSpanProcessor.js":
/*!*************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/BatchSpanProcessor.js ***!
  \*************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js");
const DEFAULT_BUFFER_SIZE = 100;
const DEFAULT_BUFFER_TIMEOUT_MS = 20000;
/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */
class BatchSpanProcessor {
    constructor(_exporter, config) {
        this._exporter = _exporter;
        this._finishedSpans = [];
        this._isShutdown = false;
        this._bufferSize =
            config && config.bufferSize ? config.bufferSize : DEFAULT_BUFFER_SIZE;
        this._bufferTimeout =
            config && typeof config.bufferTimeout === 'number'
                ? config.bufferTimeout
                : DEFAULT_BUFFER_TIMEOUT_MS;
    }
    forceFlush() {
        if (this._isShutdown) {
            return;
        }
        this._flush();
    }
    // does nothing.
    onStart(span) { }
    onEnd(span) {
        if (this._isShutdown) {
            return;
        }
        this._addToBuffer(span.toReadableSpan());
    }
    shutdown() {
        if (this._isShutdown) {
            return;
        }
        this.forceFlush();
        this._isShutdown = true;
        this._exporter.shutdown();
    }
    /** Add a span in the buffer. */
    _addToBuffer(span) {
        this._finishedSpans.push(span);
        this._maybeStartTimer();
        if (this._finishedSpans.length > this._bufferSize) {
            this._flush();
        }
    }
    /** Send the span data list to exporter */
    _flush() {
        this._clearTimer();
        if (this._finishedSpans.length === 0)
            return;
        this._exporter.export(this._finishedSpans, () => { });
        this._finishedSpans = [];
    }
    _maybeStartTimer() {
        if (this._timer !== undefined)
            return;
        this._timer = setTimeout(() => {
            this._flush();
        }, this._bufferTimeout);
        core_1.unrefTimer(this._timer);
    }
    _clearTimer() {
        if (this._timer !== undefined) {
            clearTimeout(this._timer);
            this._timer = undefined;
        }
    }
}
exports.BatchSpanProcessor = BatchSpanProcessor;
//# sourceMappingURL=BatchSpanProcessor.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/ConsoleSpanExporter.js":
/*!**************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/ConsoleSpanExporter.js ***!
  \**************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(/*! @opentelemetry/base */ "./node_modules/@opentelemetry/base/build/src/index.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js");
/**
 * This is implementation of {@link SpanExporter} that prints spans to the
 * console. This class can be used for diagnostic purposes.
 */
class ConsoleSpanExporter {
    /**
     * Export spans.
     * @param spans
     * @param resultCallback
     */
    export(spans, resultCallback) {
        return this._sendSpans(spans, resultCallback);
    }
    /**
     * Shutdown the exporter.
     */
    shutdown() {
        return this._sendSpans([]);
    }
    /**
     * converts span info into more readable format
     * @param span
     */
    _exportInfo(span) {
        return {
            traceId: span.spanContext.traceId,
            parentId: span.parentSpanId,
            name: span.name,
            id: span.spanContext.spanId,
            kind: span.kind,
            timestamp: core_1.hrTimeToMicroseconds(span.startTime),
            duration: core_1.hrTimeToMicroseconds(span.duration),
            attributes: span.attributes,
            status: span.status,
            events: span.events,
        };
    }
    /**
     * Showing spans in console
     * @param spans
     * @param done
     */
    _sendSpans(spans, done) {
        for (const span of spans) {
            console.log(this._exportInfo(span));
        }
        if (done) {
            return done(base_1.ExportResult.SUCCESS);
        }
    }
}
exports.ConsoleSpanExporter = ConsoleSpanExporter;
//# sourceMappingURL=ConsoleSpanExporter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/InMemorySpanExporter.js":
/*!***************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/InMemorySpanExporter.js ***!
  \***************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(/*! @opentelemetry/base */ "./node_modules/@opentelemetry/base/build/src/index.js");
/**
 * This class can be used for testing purposes. It stores the exported spans
 * in a list in memory that can be retrieve using the `getFinishedSpans()`
 * method.
 */
class InMemorySpanExporter {
    constructor() {
        this._finishedSpans = [];
        this._stopped = false;
    }
    export(spans, resultCallback) {
        if (this._stopped)
            return resultCallback(base_1.ExportResult.FAILED_NOT_RETRYABLE);
        this._finishedSpans.push(...spans);
        return resultCallback(base_1.ExportResult.SUCCESS);
    }
    shutdown() {
        this._stopped = true;
        this._finishedSpans = [];
    }
    reset() {
        this._finishedSpans = [];
    }
    getFinishedSpans() {
        return this._finishedSpans;
    }
}
exports.InMemorySpanExporter = InMemorySpanExporter;
//# sourceMappingURL=InMemorySpanExporter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/SimpleSpanProcessor.js":
/*!**************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/SimpleSpanProcessor.js ***!
  \**************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An implementation of the {@link SpanProcessor} that converts the {@link Span}
 * to {@link ReadableSpan} and passes it to the configured exporter.
 *
 * Only spans that are sampled are converted.
 */
class SimpleSpanProcessor {
    constructor(_exporter) {
        this._exporter = _exporter;
        this._isShutdown = false;
    }
    forceFlush() {
        // do nothing as all spans are being exported without waiting
    }
    // does nothing.
    onStart(span) { }
    onEnd(span) {
        if (this._isShutdown) {
            return;
        }
        this._exporter.export([span.toReadableSpan()], () => { });
    }
    shutdown() {
        if (this._isShutdown) {
            return;
        }
        this._isShutdown = true;
        this._exporter.shutdown();
    }
}
exports.SimpleSpanProcessor = SimpleSpanProcessor;
//# sourceMappingURL=SimpleSpanProcessor.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/index.js":
/*!*****************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/index.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Tracer */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/Tracer.js"));
__export(__webpack_require__(/*! ./BasicTracerProvider */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/BasicTracerProvider.js"));
__export(__webpack_require__(/*! ./export/ConsoleSpanExporter */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/ConsoleSpanExporter.js"));
__export(__webpack_require__(/*! ./export/BatchSpanProcessor */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/BatchSpanProcessor.js"));
__export(__webpack_require__(/*! ./export/InMemorySpanExporter */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/InMemorySpanExporter.js"));
__export(__webpack_require__(/*! ./export/SimpleSpanProcessor */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/export/SimpleSpanProcessor.js"));
__export(__webpack_require__(/*! ./Span */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/Span.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/utility.js":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/utility.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __webpack_require__(/*! ./config */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/config.js");
/**
 * Function to merge Default configuration (as specified in './config') with
 * user provided configurations.
 */
function mergeConfig(userConfig) {
    const traceParams = userConfig.traceParams;
    const target = Object.assign({}, config_1.DEFAULT_CONFIG, userConfig);
    // the user-provided value will be used to extend the default value.
    if (traceParams) {
        target.traceParams.numberOfAttributesPerSpan =
            traceParams.numberOfAttributesPerSpan || config_1.DEFAULT_MAX_ATTRIBUTES_PER_SPAN;
        target.traceParams.numberOfEventsPerSpan =
            traceParams.numberOfEventsPerSpan || config_1.DEFAULT_MAX_EVENTS_PER_SPAN;
        target.traceParams.numberOfLinksPerSpan =
            traceParams.numberOfLinksPerSpan || config_1.DEFAULT_MAX_LINKS_PER_SPAN;
    }
    return target;
}
exports.mergeConfig = mergeConfig;
//# sourceMappingURL=utility.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/StackContextManager.js":
/*!***************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/StackContextManager.js ***!
  \***************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/api/build/src/index.js");
/**
 * Stack Context Manager for managing the state in web
 * it doesn't fully support the async calls though
 */
class StackContextManager {
    constructor() {
        /**
         * whether the context manager is enabled or not
         */
        this._enabled = false;
        /**
         * Keeps the reference to current context
         */
        this._currentContext = api_1.Context.ROOT_CONTEXT;
    }
    /**
     *
     * @param target Function to be executed within the context
     * @param context
     */
    _bindFunction(target, context = api_1.Context.ROOT_CONTEXT) {
        const manager = this;
        const contextWrapper = function (...args) {
            return manager.with(context, () => target.apply(this, args));
        };
        Object.defineProperty(contextWrapper, 'length', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: target.length,
        });
        return contextWrapper;
    }
    /**
     * Returns the active context
     */
    active() {
        return this._currentContext;
    }
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param target
     * @param context
     */
    bind(target, context = api_1.Context.ROOT_CONTEXT) {
        // if no specific context to propagate is given, we use the current one
        if (context === undefined) {
            context = this.active();
        }
        if (typeof target === 'function') {
            return this._bindFunction(target, context);
        }
        return target;
    }
    /**
     * Disable the context manager (clears the current context)
     */
    disable() {
        this._currentContext = api_1.Context.ROOT_CONTEXT;
        this._enabled = false;
        return this;
    }
    /**
     * Enables the context manager and creates a default(root) context
     */
    enable() {
        if (this._enabled) {
            return this;
        }
        this._enabled = true;
        this._currentContext = api_1.Context.ROOT_CONTEXT;
        return this;
    }
    /**
     * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
     * The context will be set as active
     * @param context
     * @param fn Callback function
     */
    with(context, fn) {
        const previousContext = this._currentContext;
        this._currentContext = context || api_1.Context.ROOT_CONTEXT;
        try {
            return fn();
        }
        catch (err) {
            throw err;
        }
        finally {
            this._currentContext = previousContext;
        }
    }
}
exports.StackContextManager = StackContextManager;
//# sourceMappingURL=StackContextManager.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/WebTracerProvider.js":
/*!*************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/WebTracerProvider.js ***!
  \*************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tracing_1 = __webpack_require__(/*! @opentelemetry/tracing */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/tracing/build/src/index.js");
const StackContextManager_1 = __webpack_require__(/*! ./StackContextManager */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/StackContextManager.js");
/**
 * This class represents a web tracer with {@link StackContextManager}
 */
class WebTracerProvider extends tracing_1.BasicTracerProvider {
    /**
     * Constructs a new Tracer instance.
     * @param config Web Tracer config
     */
    constructor(config = {}) {
        if (typeof config.plugins === 'undefined') {
            config.plugins = [];
        }
        super(config);
        for (const plugin of config.plugins) {
            plugin.enable([], this, this.logger);
        }
        if (config.contextManager) {
            throw 'contextManager should be defined in register method not in' +
                ' constructor';
        }
        if (config.propagator) {
            throw 'propagator should be defined in register method not in constructor';
        }
    }
    /**
     * Register this TracerProvider for use with the OpenTelemetry API.
     * Undefined values may be replaced with defaults, and
     * null values will be skipped.
     *
     * @param config Configuration object for SDK registration
     */
    register(config = {}) {
        if (config.contextManager === undefined) {
            config.contextManager = new StackContextManager_1.StackContextManager();
        }
        if (config.contextManager) {
            config.contextManager.enable();
        }
        super.register(config);
    }
}
exports.WebTracerProvider = WebTracerProvider;
//# sourceMappingURL=WebTracerProvider.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/enums/PerformanceTimingNames.js":
/*!************************************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/enums/PerformanceTimingNames.js ***!
  \************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var PerformanceTimingNames;
(function (PerformanceTimingNames) {
    PerformanceTimingNames["CONNECT_END"] = "connectEnd";
    PerformanceTimingNames["CONNECT_START"] = "connectStart";
    PerformanceTimingNames["DOM_COMPLETE"] = "domComplete";
    PerformanceTimingNames["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
    PerformanceTimingNames["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
    PerformanceTimingNames["DOM_INTERACTIVE"] = "domInteractive";
    PerformanceTimingNames["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
    PerformanceTimingNames["DOMAIN_LOOKUP_START"] = "domainLookupStart";
    PerformanceTimingNames["FETCH_START"] = "fetchStart";
    PerformanceTimingNames["LOAD_EVENT_END"] = "loadEventEnd";
    PerformanceTimingNames["LOAD_EVENT_START"] = "loadEventStart";
    PerformanceTimingNames["REDIRECT_END"] = "redirectEnd";
    PerformanceTimingNames["REDIRECT_START"] = "redirectStart";
    PerformanceTimingNames["REQUEST_START"] = "requestStart";
    PerformanceTimingNames["RESPONSE_END"] = "responseEnd";
    PerformanceTimingNames["RESPONSE_START"] = "responseStart";
    PerformanceTimingNames["SECURE_CONNECTION_START"] = "secureConnectionStart";
    PerformanceTimingNames["UNLOAD_EVENT_END"] = "unloadEventEnd";
    PerformanceTimingNames["UNLOAD_EVENT_START"] = "unloadEventStart";
})(PerformanceTimingNames = exports.PerformanceTimingNames || (exports.PerformanceTimingNames = {}));
//# sourceMappingURL=PerformanceTimingNames.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/index.js":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/index.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./WebTracerProvider */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/WebTracerProvider.js"));
__export(__webpack_require__(/*! ./StackContextManager */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/StackContextManager.js"));
__export(__webpack_require__(/*! ./enums/PerformanceTimingNames */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/enums/PerformanceTimingNames.js"));
__export(__webpack_require__(/*! ./utils */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/utils.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/utils.js":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/utils.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const PerformanceTimingNames_1 = __webpack_require__(/*! ./enums/PerformanceTimingNames */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/web/build/src/enums/PerformanceTimingNames.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/@opentelemetry/core/build/src/index.js");
/**
 * Helper function to be able to use enum as typed key in type and in interface when using forEach
 * @param obj
 * @param key
 */
function hasKey(obj, key) {
    return key in obj;
}
exports.hasKey = hasKey;
/**
 * Helper function for starting an event on span based on {@link PerformanceEntries}
 * @param span
 * @param performanceName name of performance entry for time start
 * @param entries
 */
function addSpanNetworkEvent(span, performanceName, entries) {
    if (hasKey(entries, performanceName) &&
        typeof entries[performanceName] === 'number') {
        // some metrics are available but have value 0 which means they are invalid
        // for example "secureConnectionStart" is 0 which makes the events to be wrongly interpreted
        if (entries[performanceName] === 0) {
            return undefined;
        }
        span.addEvent(performanceName, entries[performanceName]);
        return span;
    }
    return undefined;
}
exports.addSpanNetworkEvent = addSpanNetworkEvent;
/**
 * sort resources by startTime
 * @param filteredResources
 */
function sortResources(filteredResources) {
    return filteredResources.slice().sort((a, b) => {
        const valueA = a[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
        const valueB = b[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
        if (valueA > valueB) {
            return 1;
        }
        else if (valueA < valueB) {
            return -1;
        }
        return 0;
    });
}
exports.sortResources = sortResources;
/**
 * Get closest performance resource ignoring the resources that have been
 * already used.
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 */
function getResource(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources = new WeakSet()) {
    const filteredResources = filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources);
    if (filteredResources.length === 0) {
        return {
            mainRequest: undefined,
        };
    }
    if (filteredResources.length === 1) {
        return {
            mainRequest: filteredResources[0],
        };
    }
    const sorted = sortResources(filteredResources.slice());
    const parsedSpanUrl = parseUrl(spanUrl);
    if (parsedSpanUrl.origin !== window.location.origin && sorted.length > 1) {
        let corsPreFlightRequest = sorted[0];
        let mainRequest = findMainRequest(sorted, corsPreFlightRequest[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END], endTimeHR);
        const responseEnd = corsPreFlightRequest[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END];
        const fetchStart = mainRequest[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
        // no corsPreFlightRequest
        if (fetchStart < responseEnd) {
            mainRequest = corsPreFlightRequest;
            corsPreFlightRequest = undefined;
        }
        return {
            corsPreFlightRequest,
            mainRequest,
        };
    }
    else {
        return {
            mainRequest: filteredResources[0],
        };
    }
}
exports.getResource = getResource;
/**
 * Will find the main request skipping the cors pre flight requests
 * @param resources
 * @param corsPreFlightRequestEndTime
 * @param spanEndTimeHR
 */
function findMainRequest(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
    const spanEndTime = core_1.hrTimeToNanoseconds(spanEndTimeHR);
    const minTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(corsPreFlightRequestEndTime));
    let mainRequest = resources[1];
    let bestGap;
    const length = resources.length;
    for (let i = 1; i < length; i++) {
        const resource = resources[i];
        const resourceStartTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START]));
        const resourceEndTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END]));
        const currentGap = spanEndTime - resourceEndTime;
        if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
            bestGap = currentGap;
            mainRequest = resource;
        }
    }
    return mainRequest;
}
/**
 * Filter all resources that has started and finished according to span start time and end time.
 *     It will return the closest resource to a start time
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 */
function filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources) {
    const startTime = core_1.hrTimeToNanoseconds(startTimeHR);
    const endTime = core_1.hrTimeToNanoseconds(endTimeHR);
    let filteredResources = resources.filter(resource => {
        const resourceStartTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START]));
        const resourceEndTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END]));
        return (resource.initiatorType.toLowerCase() === 'xmlhttprequest' &&
            resource.name === spanUrl &&
            resourceStartTime >= startTime &&
            resourceEndTime <= endTime);
    });
    if (filteredResources.length > 0) {
        filteredResources = filteredResources.filter(resource => {
            return !ignoredResources.has(resource);
        });
    }
    return filteredResources;
}
/**
 * Parses url using anchor element
 * @param url
 */
function parseUrl(url) {
    const a = document.createElement('a');
    a.href = url;
    return a;
}
exports.parseUrl = parseUrl;
/**
 * Get element XPath
 * @param target - target element
 * @param optimised - when id attribute of element is present the xpath can be
 * simplified to contain id
 */
function getElementXPath(target, optimised) {
    if (target.nodeType === Node.DOCUMENT_NODE) {
        return '/';
    }
    const targetValue = getNodeValue(target, optimised);
    if (optimised && targetValue.indexOf('@id') > 0) {
        return targetValue;
    }
    let xpath = '';
    if (target.parentNode) {
        xpath += getElementXPath(target.parentNode, false);
    }
    xpath += targetValue;
    return xpath;
}
exports.getElementXPath = getElementXPath;
/**
 * get node index within the siblings
 * @param target
 */
function getNodeIndex(target) {
    if (!target.parentNode) {
        return 0;
    }
    const allowedTypes = [target.nodeType];
    if (target.nodeType === Node.CDATA_SECTION_NODE) {
        allowedTypes.push(Node.TEXT_NODE);
    }
    let elements = Array.from(target.parentNode.childNodes);
    elements = elements.filter((element) => {
        const localName = element.localName;
        return (allowedTypes.indexOf(element.nodeType) >= 0 &&
            localName === target.localName);
    });
    if (elements.length >= 1) {
        return elements.indexOf(target) + 1; // xpath starts from 1
    }
    // if there are no other similar child xpath doesn't need index
    return 0;
}
/**
 * get node value for xpath
 * @param target
 * @param optimised
 */
function getNodeValue(target, optimised) {
    const nodeType = target.nodeType;
    const index = getNodeIndex(target);
    let nodeValue = '';
    if (nodeType === Node.ELEMENT_NODE) {
        const id = target.getAttribute('id');
        if (optimised && id) {
            return `//*[@id="${id}"]`;
        }
        nodeValue = target.localName;
    }
    else if (nodeType === Node.TEXT_NODE ||
        nodeType === Node.CDATA_SECTION_NODE) {
        nodeValue = 'text()';
    }
    else if (nodeType === Node.COMMENT_NODE) {
        nodeValue = 'comment()';
    }
    else {
        return '';
    }
    // if index is 1 it can be omitted in xpath
    if (nodeValue && index > 1) {
        return `/${nodeValue}[${index}]`;
    }
    return `/${nodeValue}`;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/comparator.js":
/*!****************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/comparator.js ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const ANY = Symbol('SemVer ANY')
// hoisted class for cyclic dependency
class Comparator {
  static get ANY () {
    return ANY
  }
  constructor (comp, options) {
    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      }
    }

    if (comp instanceof Comparator) {
      if (comp.loose === !!options.loose) {
        return comp
      } else {
        comp = comp.value
      }
    }

    debug('comparator', comp, options)
    this.options = options
    this.loose = !!options.loose
    this.parse(comp)

    if (this.semver === ANY) {
      this.value = ''
    } else {
      this.value = this.operator + this.semver.version
    }

    debug('comp', this)
  }

  parse (comp) {
    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
    const m = comp.match(r)

    if (!m) {
      throw new TypeError(`Invalid comparator: ${comp}`)
    }

    this.operator = m[1] !== undefined ? m[1] : ''
    if (this.operator === '=') {
      this.operator = ''
    }

    // if it literally is just '>' or '' then allow anything.
    if (!m[2]) {
      this.semver = ANY
    } else {
      this.semver = new SemVer(m[2], this.options.loose)
    }
  }

  toString () {
    return this.value
  }

  test (version) {
    debug('Comparator.test', version, this.options.loose)

    if (this.semver === ANY || version === ANY) {
      return true
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      } catch (er) {
        return false
      }
    }

    return cmp(version, this.operator, this.semver, this.options)
  }

  intersects (comp, options) {
    if (!(comp instanceof Comparator)) {
      throw new TypeError('a Comparator is required')
    }

    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      }
    }

    if (this.operator === '') {
      if (this.value === '') {
        return true
      }
      return new Range(comp.value, options).test(this.value)
    } else if (comp.operator === '') {
      if (comp.value === '') {
        return true
      }
      return new Range(this.value, options).test(comp.semver)
    }

    const sameDirectionIncreasing =
      (this.operator === '>=' || this.operator === '>') &&
      (comp.operator === '>=' || comp.operator === '>')
    const sameDirectionDecreasing =
      (this.operator === '<=' || this.operator === '<') &&
      (comp.operator === '<=' || comp.operator === '<')
    const sameSemVer = this.semver.version === comp.semver.version
    const differentDirectionsInclusive =
      (this.operator === '>=' || this.operator === '<=') &&
      (comp.operator === '>=' || comp.operator === '<=')
    const oppositeDirectionsLessThan =
      cmp(this.semver, '<', comp.semver, options) &&
      (this.operator === '>=' || this.operator === '>') &&
        (comp.operator === '<=' || comp.operator === '<')
    const oppositeDirectionsGreaterThan =
      cmp(this.semver, '>', comp.semver, options) &&
      (this.operator === '<=' || this.operator === '<') &&
        (comp.operator === '>=' || comp.operator === '>')

    return (
      sameDirectionIncreasing ||
      sameDirectionDecreasing ||
      (sameSemVer && differentDirectionsInclusive) ||
      oppositeDirectionsLessThan ||
      oppositeDirectionsGreaterThan
    )
  }
}

module.exports = Comparator

const {re, t} = __webpack_require__(/*! ../internal/re */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/re.js")
const cmp = __webpack_require__(/*! ../functions/cmp */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/cmp.js")
const debug = __webpack_require__(/*! ../internal/debug */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/debug.js")
const SemVer = __webpack_require__(/*! ./semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const Range = __webpack_require__(/*! ./range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// hoisted class for cyclic dependency
class Range {
  constructor (range, options) {
    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      }
    }

    if (range instanceof Range) {
      if (
        range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease
      ) {
        return range
      } else {
        return new Range(range.raw, options)
      }
    }

    if (range instanceof Comparator) {
      // just put it in the set and return
      this.raw = range.value
      this.set = [[range]]
      this.format()
      return this
    }

    this.options = options
    this.loose = !!options.loose
    this.includePrerelease = !!options.includePrerelease

    // First, split based on boolean or ||
    this.raw = range
    this.set = range
      .split(/\s*\|\|\s*/)
      // map the range to a 2d array of comparators
      .map(range => this.parseRange(range.trim()))
      // throw out any comparator lists that are empty
      // this generally means that it was not a valid range, which is allowed
      // in loose mode, but will still throw if the WHOLE range is invalid.
      .filter(c => c.length)

    if (!this.set.length) {
      throw new TypeError(`Invalid SemVer Range: ${range}`)
    }

    this.format()
  }

  format () {
    this.range = this.set
      .map((comps) => {
        return comps.join(' ').trim()
      })
      .join('||')
      .trim()
    return this.range
  }

  toString () {
    return this.range
  }

  parseRange (range) {
    const loose = this.options.loose
    range = range.trim()
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE]
    range = range.replace(hr, hyphenReplace(this.options.includePrerelease))
    debug('hyphen replace', range)
    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace)
    debug('comparator trim', range, re[t.COMPARATORTRIM])

    // `~ 1.2.3` => `~1.2.3`
    range = range.replace(re[t.TILDETRIM], tildeTrimReplace)

    // `^ 1.2.3` => `^1.2.3`
    range = range.replace(re[t.CARETTRIM], caretTrimReplace)

    // normalize spaces
    range = range.split(/\s+/).join(' ')

    // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    const compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
    return range
      .split(' ')
      .map(comp => parseComparator(comp, this.options))
      .join(' ')
      .split(/\s+/)
      .map(comp => replaceGTE0(comp, this.options))
      // in loose mode, throw out any that are not valid comparators
      .filter(this.options.loose ? comp => !!comp.match(compRe) : () => true)
      .map(comp => new Comparator(comp, this.options))
  }

  intersects (range, options) {
    if (!(range instanceof Range)) {
      throw new TypeError('a Range is required')
    }

    return this.set.some((thisComparators) => {
      return (
        isSatisfiable(thisComparators, options) &&
        range.set.some((rangeComparators) => {
          return (
            isSatisfiable(rangeComparators, options) &&
            thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options)
              })
            })
          )
        })
      )
    })
  }

  // if ANY of the sets match ALL of its comparators, then pass
  test (version) {
    if (!version) {
      return false
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      } catch (er) {
        return false
      }
    }

    for (let i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], version, this.options)) {
        return true
      }
    }
    return false
  }
}
module.exports = Range

const Comparator = __webpack_require__(/*! ./comparator */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/comparator.js")
const debug = __webpack_require__(/*! ../internal/debug */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/debug.js")
const SemVer = __webpack_require__(/*! ./semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const {
  re,
  t,
  comparatorTrimReplace,
  tildeTrimReplace,
  caretTrimReplace
} = __webpack_require__(/*! ../internal/re */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/re.js")

// take a set of comparators and determine whether there
// exists a version which can satisfy it
const isSatisfiable = (comparators, options) => {
  let result = true
  const remainingComparators = comparators.slice()
  let testComparator = remainingComparators.pop()

  while (result && remainingComparators.length) {
    result = remainingComparators.every((otherComparator) => {
      return testComparator.intersects(otherComparator, options)
    })

    testComparator = remainingComparators.pop()
  }

  return result
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
const parseComparator = (comp, options) => {
  debug('comp', comp, options)
  comp = replaceCarets(comp, options)
  debug('caret', comp)
  comp = replaceTildes(comp, options)
  debug('tildes', comp)
  comp = replaceXRanges(comp, options)
  debug('xrange', comp)
  comp = replaceStars(comp, options)
  debug('stars', comp)
  return comp
}

const isX = id => !id || id.toLowerCase() === 'x' || id === '*'

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
const replaceTildes = (comp, options) =>
  comp.trim().split(/\s+/).map((comp) => {
    return replaceTilde(comp, options)
  }).join(' ')

const replaceTilde = (comp, options) => {
  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE]
  return comp.replace(r, (_, M, m, p, pr) => {
    debug('tilde', comp, _, M, m, p, pr)
    let ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0-0
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`
    } else if (pr) {
      debug('replaceTilde pr', pr)
      ret = `>=${M}.${m}.${p}-${pr
      } <${M}.${+m + 1}.0-0`
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0-0
      ret = `>=${M}.${m}.${p
      } <${M}.${+m + 1}.0-0`
    }

    debug('tilde return', ret)
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
// ^1.2.3 --> >=1.2.3 <2.0.0-0
// ^1.2.0 --> >=1.2.0 <2.0.0-0
const replaceCarets = (comp, options) =>
  comp.trim().split(/\s+/).map((comp) => {
    return replaceCaret(comp, options)
  }).join(' ')

const replaceCaret = (comp, options) => {
  debug('caret', comp, options)
  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET]
  const z = options.includePrerelease ? '-0' : ''
  return comp.replace(r, (_, M, m, p, pr) => {
    debug('caret', comp, _, M, m, p, pr)
    let ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`
    } else if (isX(p)) {
      if (M === '0') {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`
      }
    } else if (pr) {
      debug('replaceCaret pr', pr)
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${m}.${+p + 1}-0`
        } else {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${+m + 1}.0-0`
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr
        } <${+M + 1}.0.0-0`
      }
    } else {
      debug('no pr')
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${m}.${+p + 1}-0`
        } else {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${+m + 1}.0-0`
        }
      } else {
        ret = `>=${M}.${m}.${p
        } <${+M + 1}.0.0-0`
      }
    }

    debug('caret return', ret)
    return ret
  })
}

const replaceXRanges = (comp, options) => {
  debug('replaceXRanges', comp, options)
  return comp.split(/\s+/).map((comp) => {
    return replaceXRange(comp, options)
  }).join(' ')
}

const replaceXRange = (comp, options) => {
  comp = comp.trim()
  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE]
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    debug('xRange', comp, ret, gtlt, M, m, p, pr)
    const xM = isX(M)
    const xm = xM || isX(m)
    const xp = xm || isX(p)
    const anyX = xp

    if (gtlt === '=' && anyX) {
      gtlt = ''
    }

    // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value
    pr = options.includePrerelease ? '-0' : ''

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0'
      } else {
        // nothing is forbidden
        ret = '*'
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0
      }
      p = 0

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        gtlt = '>='
        if (xm) {
          M = +M + 1
          m = 0
          p = 0
        } else {
          m = +m + 1
          p = 0
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm) {
          M = +M + 1
        } else {
          m = +m + 1
        }
      }

      if (gtlt === '<')
        pr = '-0'

      ret = `${gtlt + M}.${m}.${p}${pr}`
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr
      } <${M}.${+m + 1}.0-0`
    }

    debug('xRange return', ret)

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
const replaceStars = (comp, options) => {
  debug('replaceStars', comp, options)
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[t.STAR], '')
}

const replaceGTE0 = (comp, options) => {
  debug('replaceGTE0', comp, options)
  return comp.trim()
    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
}

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
const hyphenReplace = incPr => ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) => {
  if (isX(fM)) {
    from = ''
  } else if (isX(fm)) {
    from = `>=${fM}.0.0${incPr ? '-0' : ''}`
  } else if (isX(fp)) {
    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`
  } else if (fpr) {
    from = `>=${from}`
  } else {
    from = `>=${from}${incPr ? '-0' : ''}`
  }

  if (isX(tM)) {
    to = ''
  } else if (isX(tm)) {
    to = `<${+tM + 1}.0.0-0`
  } else if (isX(tp)) {
    to = `<${tM}.${+tm + 1}.0-0`
  } else if (tpr) {
    to = `<=${tM}.${tm}.${tp}-${tpr}`
  } else if (incPr) {
    to = `<${tM}.${tm}.${+tp + 1}-0`
  } else {
    to = `<=${to}`
  }

  return (`${from} ${to}`).trim()
}

const testSet = (set, version, options) => {
  for (let i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (let i = 0; i < set.length; i++) {
      debug(set[i].semver)
      if (set[i].semver === Comparator.ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        const allowed = set[i].semver
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(/*! ../internal/debug */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/debug.js")
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __webpack_require__(/*! ../internal/constants */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/constants.js")
const { re, t } = __webpack_require__(/*! ../internal/re */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/re.js")

const { compareIdentifiers } = __webpack_require__(/*! ../internal/identifiers */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/identifiers.js")
class SemVer {
  constructor (version, options) {
    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      }
    }
    if (version instanceof SemVer) {
      if (version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      )
    }

    debug('SemVer', version, options)
    this.options = options
    this.loose = !!options.loose
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease

    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version

    // these are actually numbers
    this.major = +m[1]
    this.minor = +m[2]
    this.patch = +m[3]

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = []
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      })
    }

    this.build = m[5] ? m[5].split('.') : []
    this.format()
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug('SemVer.compare', this.version, this.options, other)
    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer(other, this.options)
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    return (
      compareIdentifiers(this.major, other.major) ||
      compareIdentifiers(this.minor, other.minor) ||
      compareIdentifiers(this.patch, other.patch)
    )
  }

  comparePre (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0
    do {
      const a = this.prerelease[i]
      const b = other.prerelease[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    let i = 0
    do {
      const a = this.build[i]
      const b = other.build[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre', identifier)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre', identifier)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifier)
        this.inc('pre', identifier)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier)
        }
        this.inc('pre', identifier)
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++
        }
        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++
        }
        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++
        }
        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre':
        if (this.prerelease.length === 0) {
          this.prerelease = [0]
        } else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            this.prerelease.push(0)
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (this.prerelease[0] === identifier) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, 0]
            }
          } else {
            this.prerelease = [identifier, 0]
          }
        }
        break

      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.format()
    this.raw = this.version
    return this
  }
}

module.exports = SemVer


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/clean.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/clean.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(/*! ./parse */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/parse.js")
const clean = (version, options) => {
  const s = parse(version.trim().replace(/^[=v]+/, ''), options)
  return s ? s.version : null
}
module.exports = clean


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/cmp.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/cmp.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const eq = __webpack_require__(/*! ./eq */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/eq.js")
const neq = __webpack_require__(/*! ./neq */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/neq.js")
const gt = __webpack_require__(/*! ./gt */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gt.js")
const gte = __webpack_require__(/*! ./gte */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gte.js")
const lt = __webpack_require__(/*! ./lt */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lt.js")
const lte = __webpack_require__(/*! ./lte */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lte.js")

const cmp = (a, op, b, loose) => {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError(`Invalid operator: ${op}`)
  }
}
module.exports = cmp


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/coerce.js":
/*!**************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/coerce.js ***!
  \**************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const parse = __webpack_require__(/*! ./parse */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/parse.js")
const {re, t} = __webpack_require__(/*! ../internal/re */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/re.js")

const coerce = (version, options) => {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version)
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {}

  let match = null
  if (!options.rtl) {
    match = version.match(re[t.COERCE])
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    let next
    while ((next = re[t.COERCERTL].exec(version)) &&
        (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
            next.index + next[0].length !== match.index + match[0].length) {
        match = next
      }
      re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length
    }
    // leave it in a clean state
    re[t.COERCERTL].lastIndex = -1
  }

  if (match === null)
    return null

  return parse(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
}
module.exports = coerce


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare-build.js":
/*!*********************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare-build.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const compareBuild = (a, b, loose) => {
  const versionA = new SemVer(a, loose)
  const versionB = new SemVer(b, loose)
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}
module.exports = compareBuild


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare-loose.js":
/*!*********************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare-loose.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
const compareLoose = (a, b) => compare(a, b, true)
module.exports = compareLoose


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js":
/*!***************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const compare = (a, b, loose) =>
  new SemVer(a, loose).compare(new SemVer(b, loose))

module.exports = compare


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/diff.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/diff.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(/*! ./parse */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/parse.js")
const eq = __webpack_require__(/*! ./eq */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/eq.js")

const diff = (version1, version2) => {
  if (eq(version1, version2)) {
    return null
  } else {
    const v1 = parse(version1)
    const v2 = parse(version2)
    const hasPre = v1.prerelease.length || v2.prerelease.length
    const prefix = hasPre ? 'pre' : ''
    const defaultResult = hasPre ? 'prerelease' : ''
    for (const key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
}
module.exports = diff


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/eq.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/eq.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
const eq = (a, b, loose) => compare(a, b, loose) === 0
module.exports = eq


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gt.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gt.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
const gt = (a, b, loose) => compare(a, b, loose) > 0
module.exports = gt


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gte.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gte.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
const gte = (a, b, loose) => compare(a, b, loose) >= 0
module.exports = gte


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/inc.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/inc.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")

const inc = (version, release, options, identifier) => {
  if (typeof (options) === 'string') {
    identifier = options
    options = undefined
  }

  try {
    return new SemVer(version, options).inc(release, identifier).version
  } catch (er) {
    return null
  }
}
module.exports = inc


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lt.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lt.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
const lt = (a, b, loose) => compare(a, b, loose) < 0
module.exports = lt


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lte.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lte.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
const lte = (a, b, loose) => compare(a, b, loose) <= 0
module.exports = lte


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/major.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/major.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const major = (a, loose) => new SemVer(a, loose).major
module.exports = major


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/minor.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/minor.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const minor = (a, loose) => new SemVer(a, loose).minor
module.exports = minor


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/neq.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/neq.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
const neq = (a, b, loose) => compare(a, b, loose) !== 0
module.exports = neq


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/parse.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/parse.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {MAX_LENGTH} = __webpack_require__(/*! ../internal/constants */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/constants.js")
const { re, t } = __webpack_require__(/*! ../internal/re */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/re.js")
const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")

const parse = (version, options) => {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  const r = options.loose ? re[t.LOOSE] : re[t.FULL]
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

module.exports = parse


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/patch.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/patch.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const patch = (a, loose) => new SemVer(a, loose).patch
module.exports = patch


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/prerelease.js":
/*!******************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/prerelease.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(/*! ./parse */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/parse.js")
const prerelease = (version, options) => {
  const parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}
module.exports = prerelease


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/rcompare.js":
/*!****************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/rcompare.js ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
const rcompare = (a, b, loose) => compare(b, a, loose)
module.exports = rcompare


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/rsort.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/rsort.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compareBuild = __webpack_require__(/*! ./compare-build */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare-build.js")
const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose))
module.exports = rsort


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/satisfies.js":
/*!*****************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/satisfies.js ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")
const satisfies = (version, range, options) => {
  try {
    range = new Range(range, options)
  } catch (er) {
    return false
  }
  return range.test(version)
}
module.exports = satisfies


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/sort.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/sort.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compareBuild = __webpack_require__(/*! ./compare-build */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare-build.js")
const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose))
module.exports = sort


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/valid.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/valid.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(/*! ./parse */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/parse.js")
const valid = (version, options) => {
  const v = parse(version, options)
  return v ? v.version : null
}
module.exports = valid


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/index.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/index.js ***!
  \***************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// just pre-load all the stuff that index.js lazily exports
const internalRe = __webpack_require__(/*! ./internal/re */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/re.js")
module.exports = {
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: __webpack_require__(/*! ./internal/constants */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/constants.js").SEMVER_SPEC_VERSION,
  SemVer: __webpack_require__(/*! ./classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js"),
  compareIdentifiers: __webpack_require__(/*! ./internal/identifiers */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/identifiers.js").compareIdentifiers,
  rcompareIdentifiers: __webpack_require__(/*! ./internal/identifiers */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/identifiers.js").rcompareIdentifiers,
  parse: __webpack_require__(/*! ./functions/parse */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/parse.js"),
  valid: __webpack_require__(/*! ./functions/valid */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/valid.js"),
  clean: __webpack_require__(/*! ./functions/clean */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/clean.js"),
  inc: __webpack_require__(/*! ./functions/inc */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/inc.js"),
  diff: __webpack_require__(/*! ./functions/diff */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/diff.js"),
  major: __webpack_require__(/*! ./functions/major */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/major.js"),
  minor: __webpack_require__(/*! ./functions/minor */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/minor.js"),
  patch: __webpack_require__(/*! ./functions/patch */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/patch.js"),
  prerelease: __webpack_require__(/*! ./functions/prerelease */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/prerelease.js"),
  compare: __webpack_require__(/*! ./functions/compare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js"),
  rcompare: __webpack_require__(/*! ./functions/rcompare */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/rcompare.js"),
  compareLoose: __webpack_require__(/*! ./functions/compare-loose */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare-loose.js"),
  compareBuild: __webpack_require__(/*! ./functions/compare-build */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare-build.js"),
  sort: __webpack_require__(/*! ./functions/sort */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/sort.js"),
  rsort: __webpack_require__(/*! ./functions/rsort */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/rsort.js"),
  gt: __webpack_require__(/*! ./functions/gt */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gt.js"),
  lt: __webpack_require__(/*! ./functions/lt */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lt.js"),
  eq: __webpack_require__(/*! ./functions/eq */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/eq.js"),
  neq: __webpack_require__(/*! ./functions/neq */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/neq.js"),
  gte: __webpack_require__(/*! ./functions/gte */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gte.js"),
  lte: __webpack_require__(/*! ./functions/lte */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lte.js"),
  cmp: __webpack_require__(/*! ./functions/cmp */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/cmp.js"),
  coerce: __webpack_require__(/*! ./functions/coerce */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/coerce.js"),
  Comparator: __webpack_require__(/*! ./classes/comparator */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/comparator.js"),
  Range: __webpack_require__(/*! ./classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js"),
  satisfies: __webpack_require__(/*! ./functions/satisfies */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/satisfies.js"),
  toComparators: __webpack_require__(/*! ./ranges/to-comparators */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/to-comparators.js"),
  maxSatisfying: __webpack_require__(/*! ./ranges/max-satisfying */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/max-satisfying.js"),
  minSatisfying: __webpack_require__(/*! ./ranges/min-satisfying */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/min-satisfying.js"),
  minVersion: __webpack_require__(/*! ./ranges/min-version */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/min-version.js"),
  validRange: __webpack_require__(/*! ./ranges/valid */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/valid.js"),
  outside: __webpack_require__(/*! ./ranges/outside */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/outside.js"),
  gtr: __webpack_require__(/*! ./ranges/gtr */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/gtr.js"),
  ltr: __webpack_require__(/*! ./ranges/ltr */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/ltr.js"),
  intersects: __webpack_require__(/*! ./ranges/intersects */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/intersects.js"),
  simplifyRange: __webpack_require__(/*! ./ranges/simplify */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/simplify.js"),
  subset: __webpack_require__(/*! ./ranges/subset */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/subset.js"),
}


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/constants.js":
/*!****************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/constants.js ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0'

const MAX_LENGTH = 256
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16

module.exports = {
  SEMVER_SPEC_VERSION,
  MAX_LENGTH,
  MAX_SAFE_INTEGER,
  MAX_SAFE_COMPONENT_LENGTH
}


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/debug.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/debug.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {const debug = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {}

module.exports = debug

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/identifiers.js":
/*!******************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/identifiers.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const numeric = /^[0-9]+$/
const compareIdentifiers = (a, b) => {
  const anum = numeric.test(a)
  const bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)

module.exports = {
  compareIdentifiers,
  rcompareIdentifiers
}


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/re.js":
/*!*********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/re.js ***!
  \*********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const { MAX_SAFE_COMPONENT_LENGTH } = __webpack_require__(/*! ./constants */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/constants.js")
const debug = __webpack_require__(/*! ./debug */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/internal/debug.js")
exports = module.exports = {}

// The actual regexps go on exports.re
const re = exports.re = []
const src = exports.src = []
const t = exports.t = {}
let R = 0

const createToken = (name, value, isGlobal) => {
  const index = R++
  debug(index, value)
  t[name] = index
  src[index] = value
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined)
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+')

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*')

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`)

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`)

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`)

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+')

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`)

createToken('FULL', `^${src[t.FULLPLAIN]}$`)

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`)

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)

createToken('GTLT', '((?:<|>)?=?)')

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`)

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`)

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCE', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:$|[^\\d])`)
createToken('COERCERTL', src[t.COERCE], true)

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)')

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
exports.tildeTrimReplace = '$1~'

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)')

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
exports.caretTrimReplace = '$1^'

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
exports.comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`)

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`)

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*')
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\.0\.0\\s*$')
createToken('GTE0PRE', '^\\s*>=\\s*0\.0\.0-0\\s*$')


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/gtr.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/gtr.js ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Determine if version is greater than all the versions possible in the range.
const outside = __webpack_require__(/*! ./outside */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/outside.js")
const gtr = (version, range, options) => outside(version, range, '>', options)
module.exports = gtr


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/intersects.js":
/*!***************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/intersects.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")
const intersects = (r1, r2, options) => {
  r1 = new Range(r1, options)
  r2 = new Range(r2, options)
  return r1.intersects(r2)
}
module.exports = intersects


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/ltr.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/ltr.js ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const outside = __webpack_require__(/*! ./outside */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/outside.js")
// Determine if version is less than all the versions possible in the range
const ltr = (version, range, options) => outside(version, range, '<', options)
module.exports = ltr


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/max-satisfying.js":
/*!*******************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/max-satisfying.js ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")

const maxSatisfying = (versions, range, options) => {
  let max = null
  let maxSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v
        maxSV = new SemVer(max, options)
      }
    }
  })
  return max
}
module.exports = maxSatisfying


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/min-satisfying.js":
/*!*******************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/min-satisfying.js ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")
const minSatisfying = (versions, range, options) => {
  let min = null
  let minSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v
        minSV = new SemVer(min, options)
      }
    }
  })
  return min
}
module.exports = minSatisfying


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/min-version.js":
/*!****************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/min-version.js ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")
const gt = __webpack_require__(/*! ../functions/gt */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gt.js")

const minVersion = (range, loose) => {
  range = new Range(range, loose)

  let minver = new SemVer('0.0.0')
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0')
  if (range.test(minver)) {
    return minver
  }

  minver = null
  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i]

    comparators.forEach((comparator) => {
      // Clone to avoid manipulating the comparator's semver object.
      const compver = new SemVer(comparator.semver.version)
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++
          } else {
            compver.prerelease.push(0)
          }
          compver.raw = compver.format()
          /* fallthrough */
        case '':
        case '>=':
          if (!minver || gt(minver, compver)) {
            minver = compver
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error(`Unexpected operation: ${comparator.operator}`)
      }
    })
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}
module.exports = minVersion


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/outside.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/outside.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/semver.js")
const Comparator = __webpack_require__(/*! ../classes/comparator */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/comparator.js")
const {ANY} = Comparator
const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")
const satisfies = __webpack_require__(/*! ../functions/satisfies */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/satisfies.js")
const gt = __webpack_require__(/*! ../functions/gt */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gt.js")
const lt = __webpack_require__(/*! ../functions/lt */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lt.js")
const lte = __webpack_require__(/*! ../functions/lte */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/lte.js")
const gte = __webpack_require__(/*! ../functions/gte */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/gte.js")

const outside = (version, range, hilo, options) => {
  version = new SemVer(version, options)
  range = new Range(range, options)

  let gtfn, ltefn, ltfn, comp, ecomp
  switch (hilo) {
    case '>':
      gtfn = gt
      ltefn = lte
      ltfn = lt
      comp = '>'
      ecomp = '>='
      break
    case '<':
      gtfn = lt
      ltefn = gte
      ltfn = gt
      comp = '<'
      ecomp = '<='
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i]

    let high = null
    let low = null

    comparators.forEach((comparator) => {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator
      low = low || comparator
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator
      }
    })

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

module.exports = outside


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/simplify.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/simplify.js ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
const satisfies = __webpack_require__(/*! ../functions/satisfies.js */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/satisfies.js")
const compare = __webpack_require__(/*! ../functions/compare.js */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")
module.exports = (versions, range, options) => {
  const set = []
  let min = null
  let prev = null
  const v = versions.sort((a, b) => compare(a, b, options))
  for (const version of v) {
    const included = satisfies(version, range, options)
    if (included) {
      prev = version
      if (!min)
        min = version
    } else {
      if (prev) {
        set.push([min, prev])
      }
      prev = null
      min = null
    }
  }
  if (min)
    set.push([min, null])

  const ranges = []
  for (const [min, max] of set) {
    if (min === max)
      ranges.push(min)
    else if (!max && min === v[0])
      ranges.push('*')
    else if (!max)
      ranges.push(`>=${min}`)
    else if (min === v[0])
      ranges.push(`<=${max}`)
    else
      ranges.push(`${min} - ${max}`)
  }
  const simplified = ranges.join(' || ')
  const original = typeof range.raw === 'string' ? range.raw : String(range)
  return simplified.length < original.length ? simplified : range
}


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/subset.js":
/*!***********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/subset.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range.js */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")
const { ANY } = __webpack_require__(/*! ../classes/comparator.js */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/comparator.js")
const satisfies = __webpack_require__(/*! ../functions/satisfies.js */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/satisfies.js")
const compare = __webpack_require__(/*! ../functions/compare.js */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/functions/compare.js")

// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a subset of some `R1, R2, ...`
//
// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
// - If c is only the ANY comparator
//   - If C is only the ANY comparator, return true
//   - Else return false
// - Let EQ be the set of = comparators in c
// - If EQ is more than one, return true (null set)
// - Let GT be the highest > or >= comparator in c
// - Let LT be the lowest < or <= comparator in c
// - If GT and LT, and GT.semver > LT.semver, return true (null set)
// - If EQ
//   - If GT, and EQ does not satisfy GT, return true (null set)
//   - If LT, and EQ does not satisfy LT, return true (null set)
//   - If EQ satisfies every C, return true
//   - Else return false
// - If GT
//   - If GT is lower than any > or >= comp in C, return false
//   - If GT is >=, and GT.semver does not satisfy every C, return false
// - If LT
//   - If LT.semver is greater than that of any > comp in C, return false
//   - If LT is <=, and LT.semver does not satisfy every C, return false
// - If any C is a = range, and GT or LT are set, return false
// - Else return true

const subset = (sub, dom, options) => {
  sub = new Range(sub, options)
  dom = new Range(dom, options)
  let sawNonNull = false

  OUTER: for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const isSub = simpleSubset(simpleSub, simpleDom, options)
      sawNonNull = sawNonNull || isSub !== null
      if (isSub)
        continue OUTER
    }
    // the null set is a subset of everything, but null simple ranges in
    // a complex range should be ignored.  so if we saw a non-null range,
    // then we know this isn't a subset, but if EVERY simple range was null,
    // then it is a subset.
    if (sawNonNull)
      return false
  }
  return true
}

const simpleSubset = (sub, dom, options) => {
  if (sub.length === 1 && sub[0].semver === ANY)
    return dom.length === 1 && dom[0].semver === ANY

  const eqSet = new Set()
  let gt, lt
  for (const c of sub) {
    if (c.operator === '>' || c.operator === '>=')
      gt = higherGT(gt, c, options)
    else if (c.operator === '<' || c.operator === '<=')
      lt = lowerLT(lt, c, options)
    else
      eqSet.add(c.semver)
  }

  if (eqSet.size > 1)
    return null

  let gtltComp
  if (gt && lt) {
    gtltComp = compare(gt.semver, lt.semver, options)
    if (gtltComp > 0)
      return null
    else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<='))
      return null
  }

  // will iterate one or zero times
  for (const eq of eqSet) {
    if (gt && !satisfies(eq, String(gt), options))
      return null

    if (lt && !satisfies(eq, String(lt), options))
      return null

    for (const c of dom) {
      if (!satisfies(eq, String(c), options))
        return false
    }
    return true
  }

  let higher, lower
  let hasDomLT, hasDomGT
  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>='
    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<='
    if (gt) {
      if (c.operator === '>' || c.operator === '>=') {
        higher = higherGT(gt, c, options)
        if (higher === c)
          return false
      } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options))
        return false
    }
    if (lt) {
      if (c.operator === '<' || c.operator === '<=') {
        lower = lowerLT(lt, c, options)
        if (lower === c)
          return false
      } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options))
        return false
    }
    if (!c.operator && (lt || gt) && gtltComp !== 0)
      return false
  }

  // if there was a < or >, and nothing in the dom, then must be false
  // UNLESS it was limited by another range in the other direction.
  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
  if (gt && hasDomLT && !lt && gtltComp !== 0)
    return false

  if (lt && hasDomGT && !gt && gtltComp !== 0)
    return false

  return true
}

// >=1.2.3 is lower than >1.2.3
const higherGT = (a, b, options) => {
  if (!a)
    return b
  const comp = compare(a.semver, b.semver, options)
  return comp > 0 ? a
    : comp < 0 ? b
    : b.operator === '>' && a.operator === '>=' ? b
    : a
}

// <=1.2.3 is higher than <1.2.3
const lowerLT = (a, b, options) => {
  if (!a)
    return b
  const comp = compare(a.semver, b.semver, options)
  return comp < 0 ? a
    : comp > 0 ? b
    : b.operator === '<' && a.operator === '<=' ? b
    : a
}

module.exports = subset


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/to-comparators.js":
/*!*******************************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/to-comparators.js ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")

// Mostly just for testing and legacy API reasons
const toComparators = (range, options) =>
  new Range(range, options).set
    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '))

module.exports = toComparators


/***/ }),

/***/ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/valid.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/ranges/valid.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/@opentelemetry/plugin-document-load/node_modules/semver/classes/range.js")
const validRange = (range, options) => {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}
module.exports = validRange


/***/ }),

/***/ "./node_modules/@opentelemetry/resources/build/src/Resource.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@opentelemetry/resources/build/src/Resource.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
const constants_1 = __webpack_require__(/*! ./constants */ "./node_modules/@opentelemetry/resources/build/src/constants.js");
/**
 * A Resource describes the entity for which a signals (metrics or trace) are
 * collected.
 */
class Resource {
    constructor(
    /**
     * A dictionary of labels with string keys and values that provide information
     * about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on labels.
     */
    labels) {
        this.labels = labels;
    }
    /**
     * Returns an empty Resource
     */
    static empty() {
        return Resource.EMPTY;
    }
    /**
     * Returns a Resource that indentifies the SDK in use.
     */
    static createTelemetrySDKResource() {
        return new Resource({
            [constants_1.TELEMETRY_SDK_RESOURCE.LANGUAGE]: core_1.SDK_INFO.LANGUAGE,
            [constants_1.TELEMETRY_SDK_RESOURCE.NAME]: core_1.SDK_INFO.NAME,
            [constants_1.TELEMETRY_SDK_RESOURCE.VERSION]: core_1.SDK_INFO.VERSION,
        });
    }
    /**
     * Returns a new, merged {@link Resource} by merging the current Resource
     * with the other Resource. In case of a collision, current Resource takes
     * precedence.
     *
     * @param other the Resource that will be merged with this.
     * @returns the newly merged Resource.
     */
    merge(other) {
        if (!other || !Object.keys(other.labels).length)
            return this;
        // Labels from resource overwrite labels from other resource.
        const mergedLabels = Object.assign({}, other.labels, this.labels);
        return new Resource(mergedLabels);
    }
}
exports.Resource = Resource;
Resource.EMPTY = new Resource({});
//# sourceMappingURL=Resource.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/resources/build/src/constants.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@opentelemetry/resources/build/src/constants.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Semantic conventions for Resources
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-resource-semantic-conventions.md
 */
/** Attributes defining a running environment (e.g. Cloud, Data Center). */
exports.CLOUD_RESOURCE = {
    /** Name of the cloud provider. Example values are aws, azure, gcp. */
    PROVIDER: 'cloud.provider',
    /** The cloud account id used to identify different entities. */
    ACCOUNT_ID: 'cloud.account.id',
    /** A specific geographical location where different entities can run. */
    REGION: 'cloud.region',
    /** Zones are a sub set of the region connected through low-latency links. */
    ZONE: 'cloud.zone',
};
/**
 * Attributes defining a compute unit (e.g. Container, Process, Lambda
 * Function).
 * */
exports.CONTAINER_RESOURCE = {
    /** The container name. */
    NAME: 'container.name',
    /** The name of the image the container was built on. */
    IMAGE_NAME: 'container.image.name',
    /** The container image tag. */
    IMAGE_TAG: 'container.image.tag',
};
/** Attributes defining a computing instance (e.g. host). */
exports.HOST_RESOURCE = {
    /**
     * Hostname of the host. It contains what the hostname command returns on the
     * host machine.
     */
    HOSTNAME: 'host.hostname',
    /**
     * Unique host id. For Cloud this must be the instance_id assigned by the
     * cloud provider
     */
    ID: 'host.id',
    /**
     * Name of the host. It may contain what hostname returns on Unix systems,
     * the fully qualified, or a name specified by the user.
     */
    NAME: 'host.name',
    /** Type of host. For Cloud this must be the machine type.*/
    TYPE: 'host.type',
    /** Name of the VM image or OS install the host was instantiated from. */
    IMAGE_NAME: 'host.image.name',
    /** VM image id. For Cloud, this value is from the provider. */
    IMAGE_ID: 'host.image.id',
    /** The version string of the VM image */
    IMAGE_VERSION: 'host.image.version',
};
/** Attributes defining a deployment service (e.g. Kubernetes). */
exports.K8S_RESOURCE = {
    /** The name of the cluster that the pod is running in. */
    CLUSTER_NAME: 'k8s.cluster.name',
    /** The name of the namespace that the pod is running in. */
    NAMESPACE_NAME: 'k8s.namespace.name',
    /** The name of the pod. */
    POD_NAME: 'k8s.pod.name',
    /** The name of the deployment. */
    DEPLOYMENT_NAME: 'k8s.deployment.name',
};
/** Attributes describing the telemetry library. */
exports.TELEMETRY_SDK_RESOURCE = {
    /** The name of the telemetry library. */
    NAME: 'telemetry.sdk.name',
    /** The language of telemetry library and of the code instrumented with it. */
    LANGUAGE: 'telemetry.sdk.language',
    /** The version string of the telemetry library */
    VERSION: 'telemetry.sdk.version',
};
/** Attributes describing a service instance. */
exports.SERVICE_RESOURCE = {
    /** Logical name of the service.  */
    NAME: 'service.name',
    /** A namespace for `service.name`. */
    NAMESPACE: 'service.namespace',
    /** The string ID of the service instance. */
    INSTANCE_ID: 'service.instance.id',
    /** The version string of the service API or implementation. */
    VERSION: 'service.version',
};
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/resources/build/src/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/@opentelemetry/resources/build/src/index.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Resource */ "./node_modules/@opentelemetry/resources/build/src/Resource.js"));
__export(__webpack_require__(/*! ./platform */ "./node_modules/@opentelemetry/resources/build/src/platform/browser/index.js"));
__export(__webpack_require__(/*! ./constants */ "./node_modules/@opentelemetry/resources/build/src/constants.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/resources/build/src/platform/browser/detect-resources.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/resources/build/src/platform/browser/detect-resources.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Resource_1 = __webpack_require__(/*! ../../Resource */ "./node_modules/@opentelemetry/resources/build/src/Resource.js");
/**
 * Detects resources for the browser platform, which is currently only the
 * telemetry SDK resource. More could be added in the future. This method
 * is async to match the signature of corresponding method for node.
 */
exports.detectResources = async () => {
    return Resource_1.Resource.createTelemetrySDKResource();
};
//# sourceMappingURL=detect-resources.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/resources/build/src/platform/browser/index.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/resources/build/src/platform/browser/index.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2020, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./detect-resources */ "./node_modules/@opentelemetry/resources/build/src/platform/browser/detect-resources.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/BasicTracerProvider.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/BasicTracerProvider.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
const _1 = __webpack_require__(/*! . */ "./node_modules/@opentelemetry/tracing/build/src/index.js");
const config_1 = __webpack_require__(/*! ./config */ "./node_modules/@opentelemetry/tracing/build/src/config.js");
const MultiSpanProcessor_1 = __webpack_require__(/*! ./MultiSpanProcessor */ "./node_modules/@opentelemetry/tracing/build/src/MultiSpanProcessor.js");
const NoopSpanProcessor_1 = __webpack_require__(/*! ./NoopSpanProcessor */ "./node_modules/@opentelemetry/tracing/build/src/NoopSpanProcessor.js");
const resources_1 = __webpack_require__(/*! @opentelemetry/resources */ "./node_modules/@opentelemetry/resources/build/src/index.js");
/**
 * This class represents a basic tracer provider which platform libraries can extend
 */
class BasicTracerProvider {
    constructor(config = config_1.DEFAULT_CONFIG) {
        var _a, _b;
        this._registeredSpanProcessors = [];
        this._tracers = new Map();
        this.activeSpanProcessor = new NoopSpanProcessor_1.NoopSpanProcessor();
        this.logger = (_a = config.logger, (_a !== null && _a !== void 0 ? _a : new core_1.ConsoleLogger(config.logLevel)));
        this.resource = (_b = config.resource, (_b !== null && _b !== void 0 ? _b : resources_1.Resource.createTelemetrySDKResource()));
        this._config = Object.assign({}, config, {
            logger: this.logger,
            resource: this.resource,
        });
    }
    getTracer(name, version = '*', config) {
        const key = `${name}@${version}`;
        if (!this._tracers.has(key)) {
            this._tracers.set(key, new _1.Tracer(config || this._config, this));
        }
        return this._tracers.get(key);
    }
    /**
     * Adds a new {@link SpanProcessor} to this tracer.
     * @param spanProcessor the new SpanProcessor to be added.
     */
    addSpanProcessor(spanProcessor) {
        this._registeredSpanProcessors.push(spanProcessor);
        this.activeSpanProcessor = new MultiSpanProcessor_1.MultiSpanProcessor(this._registeredSpanProcessors);
    }
    getActiveSpanProcessor() {
        return this.activeSpanProcessor;
    }
    /**
     * Register this TracerProvider for use with the OpenTelemetry API.
     * Undefined values may be replaced with defaults, and
     * null values will be skipped.
     *
     * @param config Configuration object for SDK registration
     */
    register(config = {}) {
        api.trace.setGlobalTracerProvider(this);
        if (config.propagator === undefined) {
            config.propagator = new core_1.HttpTraceContext();
        }
        if (config.contextManager) {
            api.context.setGlobalContextManager(config.contextManager);
        }
        if (config.propagator) {
            api.propagation.setGlobalPropagator(config.propagator);
        }
    }
}
exports.BasicTracerProvider = BasicTracerProvider;
//# sourceMappingURL=BasicTracerProvider.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/MultiSpanProcessor.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/MultiSpanProcessor.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Implementation of the {@link SpanProcessor} that simply forwards all
 * received events to a list of {@link SpanProcessor}s.
 */
class MultiSpanProcessor {
    constructor(_spanProcessors) {
        this._spanProcessors = _spanProcessors;
    }
    forceFlush() {
        for (const spanProcessor of this._spanProcessors) {
            spanProcessor.forceFlush();
        }
    }
    onStart(span) {
        for (const spanProcessor of this._spanProcessors) {
            spanProcessor.onStart(span);
        }
    }
    onEnd(span) {
        for (const spanProcessor of this._spanProcessors) {
            spanProcessor.onEnd(span);
        }
    }
    shutdown() {
        for (const spanProcessor of this._spanProcessors) {
            spanProcessor.shutdown();
        }
    }
}
exports.MultiSpanProcessor = MultiSpanProcessor;
//# sourceMappingURL=MultiSpanProcessor.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/NoopSpanProcessor.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/NoopSpanProcessor.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** No-op implementation of SpanProcessor */
class NoopSpanProcessor {
    onStart(span) { }
    onEnd(span) { }
    shutdown() { }
    forceFlush() { }
}
exports.NoopSpanProcessor = NoopSpanProcessor;
//# sourceMappingURL=NoopSpanProcessor.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/Span.js":
/*!***************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/Span.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
/**
 * This class represents a span.
 */
class Span {
    /** Constructs a new Span instance. */
    constructor(parentTracer, spanName, spanContext, kind, parentSpanId, links = [], startTime = core_1.hrTime()) {
        this.attributes = {};
        this.links = [];
        this.events = [];
        this.status = {
            code: api.CanonicalCode.OK,
        };
        this.endTime = [0, 0];
        this._ended = false;
        this._duration = [-1, -1];
        this.name = spanName;
        this.spanContext = spanContext;
        this.parentSpanId = parentSpanId;
        this.kind = kind;
        this.links = links;
        this.startTime = core_1.timeInputToHrTime(startTime);
        this.resource = parentTracer.resource;
        this._logger = parentTracer.logger;
        this._traceParams = parentTracer.getActiveTraceParams();
        this._spanProcessor = parentTracer.getActiveSpanProcessor();
        this._spanProcessor.onStart(this);
    }
    context() {
        return this.spanContext;
    }
    setAttribute(key, value) {
        if (this._isSpanEnded())
            return this;
        if (Object.keys(this.attributes).length >=
            this._traceParams.numberOfAttributesPerSpan) {
            const attributeKeyToDelete = Object.keys(this.attributes).shift();
            if (attributeKeyToDelete) {
                this._logger.warn(`Dropping extra attributes : ${attributeKeyToDelete}`);
                delete this.attributes[attributeKeyToDelete];
            }
        }
        this.attributes[key] = value;
        return this;
    }
    setAttributes(attributes) {
        Object.keys(attributes).forEach(key => {
            this.setAttribute(key, attributes[key]);
        });
        return this;
    }
    /**
     *
     * @param name Span Name
     * @param [attributesOrStartTime] Span attributes or start time
     *     if type is {@type TimeInput} and 3rd param is undefined
     * @param [startTime] Specified start time for the event
     */
    addEvent(name, attributesOrStartTime, startTime) {
        if (this._isSpanEnded())
            return this;
        if (this.events.length >= this._traceParams.numberOfEventsPerSpan) {
            this._logger.warn('Dropping extra events.');
            this.events.shift();
        }
        if (core_1.isTimeInput(attributesOrStartTime)) {
            if (typeof startTime === 'undefined') {
                startTime = attributesOrStartTime;
            }
            attributesOrStartTime = undefined;
        }
        if (typeof startTime === 'undefined') {
            startTime = core_1.hrTime();
        }
        this.events.push({
            name,
            attributes: attributesOrStartTime,
            time: core_1.timeInputToHrTime(startTime),
        });
        return this;
    }
    setStatus(status) {
        if (this._isSpanEnded())
            return this;
        this.status = status;
        return this;
    }
    updateName(name) {
        if (this._isSpanEnded())
            return this;
        this.name = name;
        return this;
    }
    end(endTime = core_1.hrTime()) {
        if (this._isSpanEnded()) {
            this._logger.error('You can only call end() on a span once.');
            return;
        }
        this._ended = true;
        this.endTime = core_1.timeInputToHrTime(endTime);
        this._duration = core_1.hrTimeDuration(this.startTime, this.endTime);
        if (this._duration[0] < 0) {
            this._logger.warn('Inconsistent start and end time, startTime > endTime', this.startTime, this.endTime);
        }
        this._spanProcessor.onEnd(this);
    }
    isRecording() {
        return true;
    }
    get duration() {
        return this._duration;
    }
    get ended() {
        return this._ended;
    }
    _isSpanEnded() {
        if (this._ended) {
            this._logger.warn('Can not execute the operation on ended Span {traceId: %s, spanId: %s}', this.spanContext.traceId, this.spanContext.spanId);
        }
        return this._ended;
    }
}
exports.Span = Span;
//# sourceMappingURL=Span.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/Tracer.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/Tracer.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
const Span_1 = __webpack_require__(/*! ./Span */ "./node_modules/@opentelemetry/tracing/build/src/Span.js");
const utility_1 = __webpack_require__(/*! ./utility */ "./node_modules/@opentelemetry/tracing/build/src/utility.js");
/**
 * This class represents a basic tracer.
 */
class Tracer {
    /**
     * Constructs a new Tracer instance.
     */
    constructor(config, _tracerProvider) {
        this._tracerProvider = _tracerProvider;
        const localConfig = utility_1.mergeConfig(config);
        this._defaultAttributes = localConfig.defaultAttributes;
        this._sampler = localConfig.sampler;
        this._traceParams = localConfig.traceParams;
        this.resource = _tracerProvider.resource;
        this.logger = config.logger || new core_1.ConsoleLogger(config.logLevel);
    }
    /**
     * Starts a new Span or returns the default NoopSpan based on the sampling
     * decision.
     */
    startSpan(name, options = {}, context = api.context.active()) {
        const parentContext = getParent(options, context);
        // make sampling decision
        const samplingDecision = this._sampler.shouldSample(parentContext);
        const spanId = core_1.randomSpanId();
        let traceId;
        let traceState;
        if (!parentContext || !core_1.isValid(parentContext)) {
            // New root span.
            traceId = core_1.randomTraceId();
        }
        else {
            // New child span.
            traceId = parentContext.traceId;
            traceState = parentContext.traceState;
        }
        const traceFlags = samplingDecision
            ? api.TraceFlags.SAMPLED
            : api.TraceFlags.NONE;
        const spanContext = { traceId, spanId, traceFlags, traceState };
        if (!samplingDecision) {
            this.logger.debug('Sampling is off, starting no recording span');
            return new core_1.NoRecordingSpan(spanContext);
        }
        const span = new Span_1.Span(this, name, spanContext, options.kind || api.SpanKind.INTERNAL, parentContext ? parentContext.spanId : undefined, options.links || [], options.startTime);
        // Set default attributes
        span.setAttributes(Object.assign({}, this._defaultAttributes, options.attributes));
        return span;
    }
    /**
     * Returns the current Span from the current context.
     *
     * If there is no Span associated with the current context, undefined is returned.
     */
    getCurrentSpan() {
        const ctx = api.context.active();
        // Get the current Span from the context or null if none found.
        return core_1.getActiveSpan(ctx);
    }
    /**
     * Enters the context of code where the given Span is in the current context.
     */
    withSpan(span, fn) {
        // Set given span to context.
        return api.context.with(core_1.setActiveSpan(api.context.active(), span), fn);
    }
    /**
     * Bind a span (or the current one) to the target's context
     */
    bind(target, span) {
        return api.context.bind(target, span ? core_1.setActiveSpan(api.context.active(), span) : api.context.active());
    }
    /** Returns the active {@link TraceParams}. */
    getActiveTraceParams() {
        return this._traceParams;
    }
    getActiveSpanProcessor() {
        return this._tracerProvider.getActiveSpanProcessor();
    }
}
exports.Tracer = Tracer;
/**
 * Get the parent to assign to a started span. If options.parent is null,
 * do not assign a parent.
 *
 * @param options span options
 * @param context context to check for parent
 */
function getParent(options, context) {
    if (options.parent === null)
        return undefined;
    if (options.parent)
        return getContext(options.parent);
    return core_1.getParentSpanContext(context);
}
function getContext(span) {
    return isSpan(span) ? span.context() : span;
}
function isSpan(span) {
    return typeof span.context === 'function';
}
//# sourceMappingURL=Tracer.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/config.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/config.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
/** Default limit for Message events per span */
exports.DEFAULT_MAX_EVENTS_PER_SPAN = 128;
/** Default limit for Attributes per span */
exports.DEFAULT_MAX_ATTRIBUTES_PER_SPAN = 32;
/** Default limit for Links per span */
exports.DEFAULT_MAX_LINKS_PER_SPAN = 32;
/**
 * Default configuration. For fields with primitive values, any user-provided
 * value will override the corresponding default value. For fields with
 * non-primitive values (like `traceParams`), the user-provided value will be
 * used to extend the default value.
 */
exports.DEFAULT_CONFIG = {
    defaultAttributes: {},
    logLevel: core_1.LogLevel.INFO,
    sampler: core_1.ALWAYS_SAMPLER,
    traceParams: {
        numberOfAttributesPerSpan: exports.DEFAULT_MAX_ATTRIBUTES_PER_SPAN,
        numberOfLinksPerSpan: exports.DEFAULT_MAX_LINKS_PER_SPAN,
        numberOfEventsPerSpan: exports.DEFAULT_MAX_EVENTS_PER_SPAN,
    },
};
//# sourceMappingURL=config.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/export/BatchSpanProcessor.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/export/BatchSpanProcessor.js ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
const DEFAULT_BUFFER_SIZE = 100;
const DEFAULT_BUFFER_TIMEOUT_MS = 20000;
/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */
class BatchSpanProcessor {
    constructor(_exporter, config) {
        this._exporter = _exporter;
        this._finishedSpans = [];
        this._isShutdown = false;
        this._bufferSize =
            config && config.bufferSize ? config.bufferSize : DEFAULT_BUFFER_SIZE;
        this._bufferTimeout =
            config && typeof config.bufferTimeout === 'number'
                ? config.bufferTimeout
                : DEFAULT_BUFFER_TIMEOUT_MS;
    }
    forceFlush() {
        if (this._isShutdown) {
            return;
        }
        this._flush();
    }
    // does nothing.
    onStart(span) { }
    onEnd(span) {
        if (this._isShutdown) {
            return;
        }
        this._addToBuffer(span);
    }
    shutdown() {
        if (this._isShutdown) {
            return;
        }
        this.forceFlush();
        this._isShutdown = true;
        this._exporter.shutdown();
    }
    /** Add a span in the buffer. */
    _addToBuffer(span) {
        this._finishedSpans.push(span);
        this._maybeStartTimer();
        if (this._finishedSpans.length > this._bufferSize) {
            this._flush();
        }
    }
    /** Send the span data list to exporter */
    _flush() {
        this._clearTimer();
        if (this._finishedSpans.length === 0)
            return;
        this._exporter.export(this._finishedSpans, () => { });
        this._finishedSpans = [];
    }
    _maybeStartTimer() {
        if (this._timer !== undefined)
            return;
        this._timer = setTimeout(() => {
            this._flush();
        }, this._bufferTimeout);
        core_1.unrefTimer(this._timer);
    }
    _clearTimer() {
        if (this._timer !== undefined) {
            clearTimeout(this._timer);
            this._timer = undefined;
        }
    }
}
exports.BatchSpanProcessor = BatchSpanProcessor;
//# sourceMappingURL=BatchSpanProcessor.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/export/ConsoleSpanExporter.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/export/ConsoleSpanExporter.js ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
/**
 * This is implementation of {@link SpanExporter} that prints spans to the
 * console. This class can be used for diagnostic purposes.
 */
class ConsoleSpanExporter {
    /**
     * Export spans.
     * @param spans
     * @param resultCallback
     */
    export(spans, resultCallback) {
        return this._sendSpans(spans, resultCallback);
    }
    /**
     * Shutdown the exporter.
     */
    shutdown() {
        return this._sendSpans([]);
    }
    /**
     * converts span info into more readable format
     * @param span
     */
    _exportInfo(span) {
        return {
            traceId: span.spanContext.traceId,
            parentId: span.parentSpanId,
            name: span.name,
            id: span.spanContext.spanId,
            kind: span.kind,
            timestamp: core_1.hrTimeToMicroseconds(span.startTime),
            duration: core_1.hrTimeToMicroseconds(span.duration),
            attributes: span.attributes,
            status: span.status,
            events: span.events,
        };
    }
    /**
     * Showing spans in console
     * @param spans
     * @param done
     */
    _sendSpans(spans, done) {
        for (const span of spans) {
            console.log(this._exportInfo(span));
        }
        if (done) {
            return done(core_1.ExportResult.SUCCESS);
        }
    }
}
exports.ConsoleSpanExporter = ConsoleSpanExporter;
//# sourceMappingURL=ConsoleSpanExporter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/export/InMemorySpanExporter.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/export/InMemorySpanExporter.js ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
/**
 * This class can be used for testing purposes. It stores the exported spans
 * in a list in memory that can be retrieve using the `getFinishedSpans()`
 * method.
 */
class InMemorySpanExporter {
    constructor() {
        this._finishedSpans = [];
        this._stopped = false;
    }
    export(spans, resultCallback) {
        if (this._stopped)
            return resultCallback(core_1.ExportResult.FAILED_NOT_RETRYABLE);
        this._finishedSpans.push(...spans);
        return resultCallback(core_1.ExportResult.SUCCESS);
    }
    shutdown() {
        this._stopped = true;
        this._finishedSpans = [];
    }
    reset() {
        this._finishedSpans = [];
    }
    getFinishedSpans() {
        return this._finishedSpans;
    }
}
exports.InMemorySpanExporter = InMemorySpanExporter;
//# sourceMappingURL=InMemorySpanExporter.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/export/SimpleSpanProcessor.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/export/SimpleSpanProcessor.js ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An implementation of the {@link SpanProcessor} that converts the {@link Span}
 * to {@link ReadableSpan} and passes it to the configured exporter.
 *
 * Only spans that are sampled are converted.
 */
class SimpleSpanProcessor {
    constructor(_exporter) {
        this._exporter = _exporter;
        this._isShutdown = false;
    }
    forceFlush() {
        // do nothing as all spans are being exported without waiting
    }
    // does nothing.
    onStart(span) { }
    onEnd(span) {
        if (this._isShutdown) {
            return;
        }
        this._exporter.export([span], () => { });
    }
    shutdown() {
        if (this._isShutdown) {
            return;
        }
        this._isShutdown = true;
        this._exporter.shutdown();
    }
}
exports.SimpleSpanProcessor = SimpleSpanProcessor;
//# sourceMappingURL=SimpleSpanProcessor.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/index.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Tracer */ "./node_modules/@opentelemetry/tracing/build/src/Tracer.js"));
__export(__webpack_require__(/*! ./BasicTracerProvider */ "./node_modules/@opentelemetry/tracing/build/src/BasicTracerProvider.js"));
__export(__webpack_require__(/*! ./export/ConsoleSpanExporter */ "./node_modules/@opentelemetry/tracing/build/src/export/ConsoleSpanExporter.js"));
__export(__webpack_require__(/*! ./export/BatchSpanProcessor */ "./node_modules/@opentelemetry/tracing/build/src/export/BatchSpanProcessor.js"));
__export(__webpack_require__(/*! ./export/InMemorySpanExporter */ "./node_modules/@opentelemetry/tracing/build/src/export/InMemorySpanExporter.js"));
__export(__webpack_require__(/*! ./export/SimpleSpanProcessor */ "./node_modules/@opentelemetry/tracing/build/src/export/SimpleSpanProcessor.js"));
__export(__webpack_require__(/*! ./Span */ "./node_modules/@opentelemetry/tracing/build/src/Span.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/tracing/build/src/utility.js":
/*!******************************************************************!*\
  !*** ./node_modules/@opentelemetry/tracing/build/src/utility.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __webpack_require__(/*! ./config */ "./node_modules/@opentelemetry/tracing/build/src/config.js");
/**
 * Function to merge Default configuration (as specified in './config') with
 * user provided configurations.
 */
function mergeConfig(userConfig) {
    const traceParams = userConfig.traceParams;
    const target = Object.assign({}, config_1.DEFAULT_CONFIG, userConfig);
    // the user-provided value will be used to extend the default value.
    if (traceParams) {
        target.traceParams.numberOfAttributesPerSpan =
            traceParams.numberOfAttributesPerSpan || config_1.DEFAULT_MAX_ATTRIBUTES_PER_SPAN;
        target.traceParams.numberOfEventsPerSpan =
            traceParams.numberOfEventsPerSpan || config_1.DEFAULT_MAX_EVENTS_PER_SPAN;
        target.traceParams.numberOfLinksPerSpan =
            traceParams.numberOfLinksPerSpan || config_1.DEFAULT_MAX_LINKS_PER_SPAN;
    }
    return target;
}
exports.mergeConfig = mergeConfig;
//# sourceMappingURL=utility.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/web/build/src/StackContextManager.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@opentelemetry/web/build/src/StackContextManager.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __webpack_require__(/*! @opentelemetry/api */ "./node_modules/@opentelemetry/api/build/src/index.js");
/**
 * Stack Context Manager for managing the state in web
 * it doesn't fully support the async calls though
 */
class StackContextManager {
    constructor() {
        /**
         * whether the context manager is enabled or not
         */
        this._enabled = false;
        /**
         * Keeps the reference to current context
         */
        this._currentContext = api_1.Context.ROOT_CONTEXT;
    }
    /**
     *
     * @param target Function to be executed within the context
     * @param context
     */
    _bindFunction(target, context = api_1.Context.ROOT_CONTEXT) {
        const manager = this;
        const contextWrapper = function (...args) {
            return manager.with(context, () => target.apply(this, args));
        };
        Object.defineProperty(contextWrapper, 'length', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: target.length,
        });
        return contextWrapper;
    }
    /**
     * Returns the active context
     */
    active() {
        return this._currentContext;
    }
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param target
     * @param context
     */
    bind(target, context = api_1.Context.ROOT_CONTEXT) {
        // if no specific context to propagate is given, we use the current one
        if (context === undefined) {
            context = this.active();
        }
        if (typeof target === 'function') {
            return this._bindFunction(target, context);
        }
        return target;
    }
    /**
     * Disable the context manager (clears the current context)
     */
    disable() {
        this._currentContext = api_1.Context.ROOT_CONTEXT;
        this._enabled = false;
        return this;
    }
    /**
     * Enables the context manager and creates a default(root) context
     */
    enable() {
        if (this._enabled) {
            return this;
        }
        this._enabled = true;
        this._currentContext = api_1.Context.ROOT_CONTEXT;
        return this;
    }
    /**
     * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
     * The context will be set as active
     * @param context
     * @param fn Callback function
     */
    with(context, fn) {
        const previousContext = this._currentContext;
        this._currentContext = context || api_1.Context.ROOT_CONTEXT;
        try {
            return fn();
        }
        finally {
            this._currentContext = previousContext;
        }
    }
}
exports.StackContextManager = StackContextManager;
//# sourceMappingURL=StackContextManager.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/web/build/src/WebTracerProvider.js":
/*!************************************************************************!*\
  !*** ./node_modules/@opentelemetry/web/build/src/WebTracerProvider.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tracing_1 = __webpack_require__(/*! @opentelemetry/tracing */ "./node_modules/@opentelemetry/tracing/build/src/index.js");
const StackContextManager_1 = __webpack_require__(/*! ./StackContextManager */ "./node_modules/@opentelemetry/web/build/src/StackContextManager.js");
/**
 * This class represents a web tracer with {@link StackContextManager}
 */
class WebTracerProvider extends tracing_1.BasicTracerProvider {
    /**
     * Constructs a new Tracer instance.
     * @param config Web Tracer config
     */
    constructor(config = {}) {
        if (typeof config.plugins === 'undefined') {
            config.plugins = [];
        }
        super(config);
        for (const plugin of config.plugins) {
            plugin.enable([], this, this.logger);
        }
        if (config.contextManager) {
            throw ('contextManager should be defined in register method not in' +
                ' constructor');
        }
        if (config.propagator) {
            throw 'propagator should be defined in register method not in constructor';
        }
    }
    /**
     * Register this TracerProvider for use with the OpenTelemetry API.
     * Undefined values may be replaced with defaults, and
     * null values will be skipped.
     *
     * @param config Configuration object for SDK registration
     */
    register(config = {}) {
        if (config.contextManager === undefined) {
            config.contextManager = new StackContextManager_1.StackContextManager();
        }
        if (config.contextManager) {
            config.contextManager.enable();
        }
        super.register(config);
    }
}
exports.WebTracerProvider = WebTracerProvider;
//# sourceMappingURL=WebTracerProvider.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/web/build/src/enums/PerformanceTimingNames.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@opentelemetry/web/build/src/enums/PerformanceTimingNames.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var PerformanceTimingNames;
(function (PerformanceTimingNames) {
    PerformanceTimingNames["CONNECT_END"] = "connectEnd";
    PerformanceTimingNames["CONNECT_START"] = "connectStart";
    PerformanceTimingNames["DOM_COMPLETE"] = "domComplete";
    PerformanceTimingNames["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
    PerformanceTimingNames["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
    PerformanceTimingNames["DOM_INTERACTIVE"] = "domInteractive";
    PerformanceTimingNames["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
    PerformanceTimingNames["DOMAIN_LOOKUP_START"] = "domainLookupStart";
    PerformanceTimingNames["FETCH_START"] = "fetchStart";
    PerformanceTimingNames["LOAD_EVENT_END"] = "loadEventEnd";
    PerformanceTimingNames["LOAD_EVENT_START"] = "loadEventStart";
    PerformanceTimingNames["REDIRECT_END"] = "redirectEnd";
    PerformanceTimingNames["REDIRECT_START"] = "redirectStart";
    PerformanceTimingNames["REQUEST_START"] = "requestStart";
    PerformanceTimingNames["RESPONSE_END"] = "responseEnd";
    PerformanceTimingNames["RESPONSE_START"] = "responseStart";
    PerformanceTimingNames["SECURE_CONNECTION_START"] = "secureConnectionStart";
    PerformanceTimingNames["UNLOAD_EVENT_END"] = "unloadEventEnd";
    PerformanceTimingNames["UNLOAD_EVENT_START"] = "unloadEventStart";
})(PerformanceTimingNames = exports.PerformanceTimingNames || (exports.PerformanceTimingNames = {}));
//# sourceMappingURL=PerformanceTimingNames.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/web/build/src/index.js":
/*!************************************************************!*\
  !*** ./node_modules/@opentelemetry/web/build/src/index.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./WebTracerProvider */ "./node_modules/@opentelemetry/web/build/src/WebTracerProvider.js"));
__export(__webpack_require__(/*! ./StackContextManager */ "./node_modules/@opentelemetry/web/build/src/StackContextManager.js"));
__export(__webpack_require__(/*! ./enums/PerformanceTimingNames */ "./node_modules/@opentelemetry/web/build/src/enums/PerformanceTimingNames.js"));
__export(__webpack_require__(/*! ./utils */ "./node_modules/@opentelemetry/web/build/src/utils.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@opentelemetry/web/build/src/utils.js":
/*!************************************************************!*\
  !*** ./node_modules/@opentelemetry/web/build/src/utils.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const PerformanceTimingNames_1 = __webpack_require__(/*! ./enums/PerformanceTimingNames */ "./node_modules/@opentelemetry/web/build/src/enums/PerformanceTimingNames.js");
const core_1 = __webpack_require__(/*! @opentelemetry/core */ "./node_modules/@opentelemetry/core/build/src/index.js");
/**
 * Helper function to be able to use enum as typed key in type and in interface when using forEach
 * @param obj
 * @param key
 */
function hasKey(obj, key) {
    return key in obj;
}
exports.hasKey = hasKey;
/**
 * Helper function for starting an event on span based on {@link PerformanceEntries}
 * @param span
 * @param performanceName name of performance entry for time start
 * @param entries
 */
function addSpanNetworkEvent(span, performanceName, entries) {
    if (hasKey(entries, performanceName) &&
        typeof entries[performanceName] === 'number') {
        // some metrics are available but have value 0 which means they are invalid
        // for example "secureConnectionStart" is 0 which makes the events to be wrongly interpreted
        if (entries[performanceName] === 0) {
            return undefined;
        }
        span.addEvent(performanceName, entries[performanceName]);
        return span;
    }
    return undefined;
}
exports.addSpanNetworkEvent = addSpanNetworkEvent;
/**
 * sort resources by startTime
 * @param filteredResources
 */
function sortResources(filteredResources) {
    return filteredResources.slice().sort((a, b) => {
        const valueA = a[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
        const valueB = b[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
        if (valueA > valueB) {
            return 1;
        }
        else if (valueA < valueB) {
            return -1;
        }
        return 0;
    });
}
exports.sortResources = sortResources;
/**
 * Get closest performance resource ignoring the resources that have been
 * already used.
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 */
function getResource(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources = new WeakSet()) {
    const filteredResources = filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources);
    if (filteredResources.length === 0) {
        return {
            mainRequest: undefined,
        };
    }
    if (filteredResources.length === 1) {
        return {
            mainRequest: filteredResources[0],
        };
    }
    const sorted = sortResources(filteredResources.slice());
    const parsedSpanUrl = parseUrl(spanUrl);
    if (parsedSpanUrl.origin !== window.location.origin && sorted.length > 1) {
        let corsPreFlightRequest = sorted[0];
        let mainRequest = findMainRequest(sorted, corsPreFlightRequest[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END], endTimeHR);
        const responseEnd = corsPreFlightRequest[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END];
        const fetchStart = mainRequest[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
        // no corsPreFlightRequest
        if (fetchStart < responseEnd) {
            mainRequest = corsPreFlightRequest;
            corsPreFlightRequest = undefined;
        }
        return {
            corsPreFlightRequest,
            mainRequest,
        };
    }
    else {
        return {
            mainRequest: filteredResources[0],
        };
    }
}
exports.getResource = getResource;
/**
 * Will find the main request skipping the cors pre flight requests
 * @param resources
 * @param corsPreFlightRequestEndTime
 * @param spanEndTimeHR
 */
function findMainRequest(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
    const spanEndTime = core_1.hrTimeToNanoseconds(spanEndTimeHR);
    const minTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(corsPreFlightRequestEndTime));
    let mainRequest = resources[1];
    let bestGap;
    const length = resources.length;
    for (let i = 1; i < length; i++) {
        const resource = resources[i];
        const resourceStartTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START]));
        const resourceEndTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END]));
        const currentGap = spanEndTime - resourceEndTime;
        if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
            bestGap = currentGap;
            mainRequest = resource;
        }
    }
    return mainRequest;
}
/**
 * Filter all resources that has started and finished according to span start time and end time.
 *     It will return the closest resource to a start time
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 */
function filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources) {
    const startTime = core_1.hrTimeToNanoseconds(startTimeHR);
    const endTime = core_1.hrTimeToNanoseconds(endTimeHR);
    let filteredResources = resources.filter(resource => {
        const resourceStartTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START]));
        const resourceEndTime = core_1.hrTimeToNanoseconds(core_1.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END]));
        return (resource.initiatorType.toLowerCase() === 'xmlhttprequest' &&
            resource.name === spanUrl &&
            resourceStartTime >= startTime &&
            resourceEndTime <= endTime);
    });
    if (filteredResources.length > 0) {
        filteredResources = filteredResources.filter(resource => {
            return !ignoredResources.has(resource);
        });
    }
    return filteredResources;
}
/**
 * Parses url using anchor element
 * @param url
 */
function parseUrl(url) {
    const a = document.createElement('a');
    a.href = url;
    return a;
}
exports.parseUrl = parseUrl;
/**
 * Get element XPath
 * @param target - target element
 * @param optimised - when id attribute of element is present the xpath can be
 * simplified to contain id
 */
function getElementXPath(target, optimised) {
    if (target.nodeType === Node.DOCUMENT_NODE) {
        return '/';
    }
    const targetValue = getNodeValue(target, optimised);
    if (optimised && targetValue.indexOf('@id') > 0) {
        return targetValue;
    }
    let xpath = '';
    if (target.parentNode) {
        xpath += getElementXPath(target.parentNode, false);
    }
    xpath += targetValue;
    return xpath;
}
exports.getElementXPath = getElementXPath;
/**
 * get node index within the siblings
 * @param target
 */
function getNodeIndex(target) {
    if (!target.parentNode) {
        return 0;
    }
    const allowedTypes = [target.nodeType];
    if (target.nodeType === Node.CDATA_SECTION_NODE) {
        allowedTypes.push(Node.TEXT_NODE);
    }
    let elements = Array.from(target.parentNode.childNodes);
    elements = elements.filter((element) => {
        const localName = element.localName;
        return (allowedTypes.indexOf(element.nodeType) >= 0 &&
            localName === target.localName);
    });
    if (elements.length >= 1) {
        return elements.indexOf(target) + 1; // xpath starts from 1
    }
    // if there are no other similar child xpath doesn't need index
    return 0;
}
/**
 * get node value for xpath
 * @param target
 * @param optimised
 */
function getNodeValue(target, optimised) {
    const nodeType = target.nodeType;
    const index = getNodeIndex(target);
    let nodeValue = '';
    if (nodeType === Node.ELEMENT_NODE) {
        const id = target.getAttribute('id');
        if (optimised && id) {
            return `//*[@id="${id}"]`;
        }
        nodeValue = target.localName;
    }
    else if (nodeType === Node.TEXT_NODE ||
        nodeType === Node.CDATA_SECTION_NODE) {
        nodeValue = 'text()';
    }
    else if (nodeType === Node.COMMENT_NODE) {
        nodeValue = 'comment()';
    }
    else {
        return '';
    }
    // if index is 1 it can be omitted in xpath
    if (nodeValue && index > 1) {
        return `/${nodeValue}[${index}]`;
    }
    return `/${nodeValue}`;
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/path-browserify/index.js":
/*!***********************************************!*\
  !*** ./node_modules/path-browserify/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/webpack/buildin/harmony-module.js":
/*!*******************************************!*\
  !*** (webpack)/buildin/harmony-module.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if (!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/js/app.js":
/*!***********************!*\
  !*** ./src/js/app.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const tracer = __webpack_require__(/*! ./tracing */ "./src/js/tracing.js");

function navbarToggle() {
  $('.navbar-burger').click(function() {
    $('.navbar-burger').toggleClass('is-active');
    $('.navbar-menu').toggleClass('is-active');
  });
}

$(function() {
  navbarToggle();
});


/***/ }),

/***/ "./src/js/tracing.js":
/*!***************************!*\
  !*** ./src/js/tracing.js ***!
  \***************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _opentelemetry_tracing__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @opentelemetry/tracing */ "./node_modules/@opentelemetry/tracing/build/src/index.js");
/* harmony import */ var _opentelemetry_tracing__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_opentelemetry_tracing__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _opentelemetry_web__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @opentelemetry/web */ "./node_modules/@opentelemetry/web/build/src/index.js");
/* harmony import */ var _opentelemetry_web__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_opentelemetry_web__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _opentelemetry_plugin_document_load__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @opentelemetry/plugin-document-load */ "./node_modules/@opentelemetry/plugin-document-load/build/src/index.js");
/* harmony import */ var _opentelemetry_plugin_document_load__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_opentelemetry_plugin_document_load__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _opentelemetry_exporter_collector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @opentelemetry/exporter-collector */ "./node_modules/@opentelemetry/exporter-collector/build/src/index.js");
/* harmony import */ var _opentelemetry_exporter_collector__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_opentelemetry_exporter_collector__WEBPACK_IMPORTED_MODULE_3__);





const exporter = new _opentelemetry_exporter_collector__WEBPACK_IMPORTED_MODULE_3__["CollectorExporter"]({
  serviceName: 'opentelemetry.io',
  url: 'https://otelwebtelemetry.com/v1/trace'
})

const locale = {
  "browser.language": navigator.language,
  "browser.path": location.pathname
}

const provider = new _opentelemetry_web__WEBPACK_IMPORTED_MODULE_1__["WebTracerProvider"]({
  plugins: [
    new _opentelemetry_plugin_document_load__WEBPACK_IMPORTED_MODULE_2__["DocumentLoad"]()
  ],
  defaultAttributes: locale
});

provider.addSpanProcessor(new _opentelemetry_tracing__WEBPACK_IMPORTED_MODULE_0__["SimpleSpanProcessor"](exporter));
provider.register();

module.export = provider.getTracer('otel-web');



/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/harmony-module.js */ "./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ })

/******/ });