/**
 * cn — tiny classnames joiner.
 * Filters falsy values and joins the rest with a space.
 *
 * @param  {...(string | false | null | undefined)} classes
 * @returns {string}
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');

export default cn;
