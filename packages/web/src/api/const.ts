export const STRING_MAX_LENGTH = 8192;
export const TITLE_MAX_LENGTH = 128;
export const USE_DUMMY_DATA = process.env.NODE_ENV === "development";
export const DEFAULT_EXPLANATION_PROMPT = `Explain the correct answer to a question as a \
teacher would, being as concise and factual as possible. Use a single \
paragraph and focus on the context and reasoning.

# Notes

- Avoid introducing unrelated information to maintain clarity.
- Use references to authoritative sources where possible.
- Avoid repeating the question or answer itself.`;
