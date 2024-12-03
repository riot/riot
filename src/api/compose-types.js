/**
 * function that returns a function to apply the wrapper to a component while adding the proper types to your component via typescript
 * @param {Function|Object} component - component default export
 * @returns {Function} returns a function that takes the component to apply the wrappers to
 */
/* istanbul ignore next */
export const composeTypes = (...withTypesList) => component => withTypesList.reduce((c, fn) => fn(c), component)
