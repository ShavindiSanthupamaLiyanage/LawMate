// Polyfills for React Native
if (typeof global !== 'undefined') {
    if (!global.setImmediate) {
        global.setImmediate = setTimeout as unknown as typeof setImmediate;
    }
}

// Export empty to make this a module
export {};
