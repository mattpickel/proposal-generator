/**
 * Markdown Utility Functions
 */

/**
 * Convert markdown to HTML
 * Simple converter for common markdown elements
 */
export function markdownToHtml(markdown) {
  return markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/gs, '<ul>$&</ul>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^(?!<[h|u|l|p])(.*$)/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[h|u])/g, '$1')
    .replace(/(<\/[h|u|l]>)<\/p>/g, '$1');
}

/**
 * Count words in text
 */
export function countWords(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Estimate reading time (assuming 250 words per minute)
 */
export function estimateReadingTime(wordCount) {
  return Math.ceil(wordCount / 250);
}

/**
 * Count paragraphs in text
 */
export function countParagraphs(text) {
  return text.split('\n\n').length;
}
