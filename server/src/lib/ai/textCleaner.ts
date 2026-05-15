// Normalises raw PDF-extracted text before chunking.
// Pure functions — no I/O, no side-effects.

/**
 * Remove artifacts that PDF parsers commonly leave behind:
 * form-feed characters, horizontal rules, "Page N of M" lines,
 * and lone page-number lines.
 */
export function stripPageArtifacts(text: string): string {
    return text
        .replace(/\f/g, '\n')                           // form-feed → newline
        .replace(/^-{3,}$/gm, '')                       // "---" horizontal rules
        .replace(/^Page\s+\d+\s+of\s+\d+\s*$/gim, '')  // "Page 1 of 10"
        .replace(/^\d+\s*$/gm, '');                     // lone page numbers
}

/**
 * Collapse noisy whitespace that column/table layouts produce:
 * - CRLF / stray CR → LF
 * - runs of non-newline whitespace → single space
 * - 3+ consecutive blank lines → 1 blank line
 * - trailing / leading spaces per line stripped
 */
export function cleanText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[^\S\n]+/g, ' ')    // non-newline whitespace runs → space
        .replace(/\n{3,}/g, '\n\n')   // 3+ blank lines → 2
        .replace(/[ \t]+\n/g, '\n')   // trailing spaces before newline
        .replace(/\n[ \t]+/g, '\n')   // leading spaces after newline
        .trim();
}

/**
 * Convenience wrapper — runs both passes in the correct order.
 * This is the only function the rest of the pipeline calls.
 */
export function prepareText(raw: string): string {
    return cleanText(stripPageArtifacts(raw));
}