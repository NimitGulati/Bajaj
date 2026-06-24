'use strict';

/**
 * Validates a single hierarchy entry string.
 *
 * Valid format: "A->B"
 *   - parent : single uppercase letter A-Z
 *   - child  : single uppercase letter A-Z
 *   - parent !== child
 *
 * Whitespace is trimmed before validation.
 *
 * @param {string} entry
 * @returns {{ valid: true, parent: string, child: string } | { valid: false }}
 */
const validateEntry = (entry) => {
  if (typeof entry !== 'string') return { valid: false };

  const trimmed = entry.trim();

  // Must match exactly "X->Y" where X and Y are single uppercase letters
  const match = trimmed.match(/^([A-Z])->([A-Z])$/);
  if (!match) return { valid: false };

  const [, parent, child] = match;

  // Self-loop is invalid (A->A)
  if (parent === child) return { valid: false };

  return { valid: true, parent, child };
};

module.exports = { validateEntry };
