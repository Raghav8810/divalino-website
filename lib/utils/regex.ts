/**
 * regex.ts — Central validation patterns for the project.
 * Import from here rather than inlining regexes in components.
 */

/** Standard email — user@domain.tld */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Indian mobile number.
 *  - Optional +91 country code (with optional space/dash after it)
 *  - 10 digits starting with 6, 7, 8, or 9
 * Valid examples: 9876543210 | +91 9876543210 | +91-9876543210
 */
export const INDIA_MOBILE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;

/** Non-empty string (after trimming whitespace) */
export const REQUIRED_REGEX = /\S+/;

/** Full name — at least 2 characters, no digits */
export const FULL_NAME_REGEX = /^[a-zA-Z\s'.]{2,}$/;
