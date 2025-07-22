// Utility to generate slug from name
const generateSlug = (name) => {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

module.exports = { generateSlug };