/* eslint-disable */

/**
 * Riot public api
 */

/**
 * Register a custom tag by name
 * @param   {string} name - component name
 * @param   {object} implementation - tag implementation
 * @returns {object} object representing our tag implementation
 */
export function register(name, implementation) {

}

/**
 * Unregister a riot web component
 * @param   {string} name - component name
 * @returns {boolean} true if deleted
 */
export function unregister(name) {

}

/**
 * Mounting function
 * @param   {string|HTMLElement} element - query for the selection or a DOM element
 * @param   {object} options - options that will be passed to the element instance
 * @returns {array} list of nodes upgraded
 */
export function mount(element, options) {

}

/**
 * Unmounting function
 * @param   {string|HTMLElement} element - query for the selection or a DOM element
 * @returns {array} list of nodes unmounted
 */
export function unmount(element) {

}

/**
 * Define a mixin
 * @param   {string} name - mixin id
 * @param   {object|function} mixin - mixin logic
 * @returns {object} a copy of the mixin just created
 */
export function mixin(name, mixin) {

}
