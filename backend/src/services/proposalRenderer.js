/**
 * Proposal Renderer Service
 *
 * Converts proposal JSON to HTML and plain text formats.
 * Rendering happens only at the final step after all editing is complete.
 *
 * Goals:
 * - Match PDF feel
 * - Survive HighLevel paste behavior
 * - Minimal styling, semantic HTML
 */

import { log } from '../utils/logger.js';

// =============================================================================
// INLINE STYLES (for rich text editor compatibility)
// =============================================================================

// Brand colors
const colors = {
  primary: '#eb372a',      // Red - for titles
  primaryDark: '#c32218',  // Darker red
  accent: '#c0a367',       // Gold - for accents
  accentLight: '#d4b87f',  // Light gold
  text: '#1A1A1A',         // Main text
  textSecondary: '#595959', // Secondary text
  border: '#E0E0DD',       // Border color
  bg: '#FAFAF8',           // Background
};

// Inline styles as objects (converted to strings when needed)
const styles = {
  // Base content wrapper
  content: `font-family: 'Poppins', system-ui, -apple-system, sans-serif; line-height: 1.6; color: ${colors.text}; font-size: 14px;`,

  // Headings
  h1: `font-family: 'Poppins', system-ui, sans-serif; font-size: 1.75rem; margin-bottom: 0.5rem; color: ${colors.primary}; font-weight: 700;`,
  h2: `font-family: 'Poppins', system-ui, sans-serif; font-size: 1.25rem; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid ${colors.accent}; padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; color: ${colors.primary}; font-weight: 600;`,
  h3: `font-family: 'Poppins', system-ui, sans-serif; font-size: 1.1rem; margin-top: 1.5rem; color: ${colors.primary}; font-weight: 600;`,
  h4: `font-family: 'Poppins', system-ui, sans-serif; font-size: 1rem; margin-top: 1rem; margin-bottom: 0.5rem; color: ${colors.text}; font-weight: 600;`,

  // Paragraphs and text
  p: `margin: 0.75rem 0;`,
  ul: `margin: 0.5rem 0; padding-left: 1.5rem;`,
  li: `margin: 0.25rem 0;`,

  // Cover section
  cover: `margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid ${colors.accent};`,
  meta: `color: ${colors.textSecondary}; margin-top: 1rem; font-size: 0.95rem;`,
  metaItem: `margin: 0.25rem 0;`,
  brandName: `font-family: 'Poppins', system-ui, sans-serif; font-weight: 600; color: ${colors.primary};`,

  // Comments section
  greeting: `font-size: 1.05rem; margin-bottom: 0.5rem;`,
  signoff: `font-weight: 600; margin-top: 1.5rem; color: ${colors.text};`,

  // Service section
  serviceSubsection: `margin: 1rem 0;`,
  serviceOutcome: `font-style: italic; color: ${colors.textSecondary}; margin-top: 1rem;`,
  serviceTimeline: `color: ${colors.textSecondary}; font-size: 0.95rem;`,
  serviceInvestment: `margin-top: 1rem; padding: 0.75rem; background: ${colors.bg}; border-radius: 4px; border-left: 3px solid ${colors.accent};`,

  // Placeholder
  placeholder: `background: #fef3c7; padding: 1rem; border-radius: 4px; margin: 1.5rem 0;`,
  placeholderText: `color: #92400e; font-style: italic;`,

  // Terms section
  termsIntro: `font-style: italic; margin-bottom: 1.5rem; color: ${colors.textSecondary};`,
  termsClause: `margin: 1rem 0;`,
  termsClauseH4: `font-family: 'Poppins', system-ui, sans-serif; font-size: 1rem; margin-top: 1rem; margin-bottom: 0.25rem; color: ${colors.text}; font-weight: 600;`,
  termsSection: `margin-top: 2rem; padding-top: 1rem; border-top: 2px solid ${colors.accent};`,
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parse restricted markdown to HTML with inline styles
 * Only allows: bold, italic, unordered lists
 * @param {string} markdown - Markdown text
 * @returns {string} HTML output
 */
function parseRestrictedMarkdown(markdown) {
  if (!markdown) return '';

  let html = markdown
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* (but not if it's part of bold)
    .replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Process line by line for lists
  const lines = html.split('\n');
  const processedLines = [];
  let inList = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('- ')) {
      if (!inList) {
        processedLines.push(`<ul style="${styles.ul}">`);
        inList = true;
      }
      processedLines.push(`<li style="${styles.li}">${escapeHtml(trimmedLine.substring(2))}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (trimmedLine) {
        processedLines.push(`<p style="${styles.p}">${escapeHtml(trimmedLine)}</p>`);
      }
    }
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  return processedLines.join('\n');
}

/**
 * Render cover block to HTML with inline styles
 * @param {import('../models/proposalSchema.js').CoverBlock} cover - Cover block
 * @returns {string} HTML output
 */
function renderCover(cover) {
  return `
<header style="${styles.cover}">
  <h1 style="${styles.h1}">${escapeHtml(cover.proposalTitle)}</h1>
  <div style="${styles.meta}">
    <div style="${styles.brandName}">${escapeHtml(cover.brandName)}</div>
    <div style="${styles.metaItem}">
      Prepared by ${escapeHtml(cover.preparedByName)}, ${escapeHtml(cover.preparedByTitle)}
    </div>
    <div style="${styles.metaItem}">Date: ${escapeHtml(cover.quoteCreatedDate)}</div>
    <div style="${styles.metaItem}">
      <div>For: ${escapeHtml(cover.forClientName)}</div>
      <div>${escapeHtml(cover.forClientOrg)}</div>
      ${cover.forClientEmail ? `<div>${escapeHtml(cover.forClientEmail)}</div>` : ''}
    </div>
  </div>
</header>`;
}

/**
 * Render comments block to HTML with inline styles
 * @param {import('../models/proposalSchema.js').CommentsBlock} comments - Comments block
 * @returns {string} HTML output
 */
function renderComments(comments) {
  const paragraphsHtml = comments.paragraphs
    .map(p => `<p style="${styles.p}">${escapeHtml(p)}</p>`)
    .join('\n    ');

  return `
<section>
  <h2 style="${styles.h2}">${escapeHtml(comments.heading)}</h2>
  <p style="${styles.greeting}">${escapeHtml(comments.greetingLine)}</p>
  ${paragraphsHtml}
  <p style="${styles.signoff}">${escapeHtml(comments.signoff)}</p>
</section>`;
}

/**
 * Render single service block to HTML with inline styles
 * @param {import('../models/proposalSchema.js').ServiceBlock} service - Service block
 * @returns {string} HTML output
 */
function renderService(service) {
  if (!service.enabled) return '';

  const subsectionsHtml = service.subsections
    .map(sub => {
      // Use override if available, otherwise use default
      const body = service.overrides?.[`subsection_${sub.number}`] || sub.bodyMarkdown;
      return `
  <div style="${styles.serviceSubsection}">
    <h4 style="${styles.h4}">${sub.number}. ${escapeHtml(sub.title)}</h4>
    ${parseRestrictedMarkdown(body)}
  </div>`;
    })
    .join('\n');

  const outcomeHtml = service.outcome
    ? `<p style="${styles.serviceOutcome}">${escapeHtml(service.outcome)}</p>`
    : '';

  // Use investment override if available, otherwise use default
  const investmentDisplay = service.overrides?.investment_renderHint || service.investment?.renderHint;
  const investmentHtml = investmentDisplay
    ? `<div style="${styles.serviceInvestment}"><strong>Investment:</strong> ${escapeHtml(investmentDisplay)}</div>`
    : '';

  const timelineHtml = service.timeline
    ? `<p style="${styles.serviceTimeline}"><strong>Timeline:</strong> ${escapeHtml(service.timeline)}</p>`
    : '';

  return `
<section>
  <h2 style="${styles.h2}">${escapeHtml(service.displayNameCaps)}</h2>
  ${subsectionsHtml}
  ${outcomeHtml}
  ${timelineHtml}
  ${investmentHtml}
</section>`;
}

/**
 * Render all services to HTML
 * @param {import('../models/proposalSchema.js').ServiceBlock[]} services - Service blocks
 * @returns {string} HTML output
 */
function renderServices(services) {
  return services
    .filter(s => s.enabled)
    .map(renderService)
    .join('\n');
}

/**
 * Render optional modules to HTML with inline styles
 * @param {import('../models/proposalSchema.js').ModuleBlock[]} modules - Module blocks
 * @returns {string} HTML output
 */
function renderModules(modules) {
  return modules
    .filter(m => m.enabled)
    .map(module => `
<section>
  ${module.titleCaps ? `<h2 style="${styles.h2}">${escapeHtml(module.titleCaps)}</h2>` : ''}
  ${parseRestrictedMarkdown(module.bodyMarkdown)}
</section>`)
    .join('\n');
}

/**
 * Render itemized block to HTML with inline styles
 * @param {import('../models/proposalSchema.js').ItemizedBlock} itemized - Itemized block
 * @returns {string} HTML output
 */
function renderItemized(itemized) {
  if (itemized.source === 'placeholder') {
    return `
<section style="${styles.placeholder}">
  <h2 style="${styles.h2}">PRODUCTS & SERVICES</h2>
  <p style="${styles.placeholderText}">${escapeHtml(itemized.placeholderText)}</p>
</section>`;
  }

  // Future: render actual itemized data from HighLevel
  return '';
}

/**
 * Render terms block to HTML with inline styles
 * @param {import('../models/proposalSchema.js').TermsBlock} terms - Terms block
 * @returns {string} HTML output
 */
function renderTerms(terms) {
  const introHtml = terms.introText
    ? `<p style="${styles.termsIntro}">${escapeHtml(terms.introText)}</p>`
    : '';

  const clausesHtml = terms.clauses
    .map(clause => {
      // Handle multi-paragraph clauses (split on double newlines)
      const bodyParagraphs = clause.body.split('\n\n')
        .map(p => `<p style="${styles.p}">${escapeHtml(p)}</p>`)
        .join('\n    ');
      return `
  <div style="${styles.termsClause}">
    <h4 style="${styles.termsClauseH4}">${clause.number}. ${clause.title ? escapeHtml(clause.title) : ''}</h4>
    ${bodyParagraphs}
  </div>`;
    })
    .join('\n');

  return `
<section style="${styles.termsSection}">
  <h2 style="${styles.h2}">${escapeHtml(terms.titleCaps)}</h2>
  ${introHtml}
  ${clausesHtml}
</section>`;
}

/**
 * Render signatures block to HTML with inline styles
 * @param {import('../models/proposalSchema.js').SignatureBlock} signatures - Signatures block
 * @returns {string} HTML output
 */
function renderSignatures(signatures) {
  if (signatures.source === 'placeholder') {
    return `
<section style="${styles.placeholder}">
  <h2 style="${styles.h2}">ACCEPTANCE</h2>
  <p style="${styles.placeholderText}">${escapeHtml(signatures.placeholderText)}</p>
</section>`;
  }

  return '';
}

/**
 * Render complete proposal to HTML with inline styles
 * All styles are inlined for rich text editor compatibility (GHL, etc.)
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to render
 * @returns {string} Complete HTML document
 */
export function renderProposalToHtml(proposal) {
  log.info('ProposalRenderer', 'Rendering proposal to HTML', {
    proposalId: proposal.id
  });

  // Note: No <style> tag - all styles are inline for rich text editor compatibility
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(proposal.cover.proposalTitle)}</title>
</head>
<body>
<div style="${styles.content}">
${renderComments(proposal.comments)}
${renderServices(proposal.services)}
${renderModules(proposal.modules)}
</div>
</body>
</html>`;

  return html;
}

/**
 * Render proposal to plain text (for clipboard fallback)
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to render
 * @returns {string} Plain text output
 */
export function renderProposalToPlainText(proposal) {
  log.info('ProposalRenderer', 'Rendering proposal to plain text', {
    proposalId: proposal.id
  });

  const lines = [];

  // Cover
  lines.push(proposal.cover.proposalTitle);
  lines.push('');
  lines.push(proposal.cover.brandName);
  lines.push(`Prepared by ${proposal.cover.preparedByName}, ${proposal.cover.preparedByTitle}`);
  lines.push(`Date: ${proposal.cover.quoteCreatedDate}`);
  lines.push(`For: ${proposal.cover.forClientName}, ${proposal.cover.forClientOrg}`);
  if (proposal.cover.forClientEmail) {
    lines.push(proposal.cover.forClientEmail);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Comments
  lines.push(proposal.comments.heading.toUpperCase());
  lines.push('');
  lines.push(proposal.comments.greetingLine);
  lines.push('');
  proposal.comments.paragraphs.forEach(p => {
    lines.push(p);
    lines.push('');
  });
  lines.push(proposal.comments.signoff);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Services
  proposal.services.filter(s => s.enabled).forEach(service => {
    lines.push(service.displayNameCaps);
    lines.push('');

    service.subsections.forEach(sub => {
      const body = service.overrides?.[`subsection_${sub.number}`] || sub.bodyMarkdown;
      lines.push(`${sub.number}. ${sub.title}`);
      // Remove markdown formatting for plain text
      lines.push(body.replace(/\*\*/g, '').replace(/\*/g, ''));
      lines.push('');
    });

    if (service.outcome) {
      lines.push(service.outcome);
      lines.push('');
    }

    if (service.timeline) {
      lines.push(`Timeline: ${service.timeline}`);
      lines.push('');
    }

    const investmentDisplay = service.overrides?.investment_renderHint || service.investment?.renderHint;
    if (investmentDisplay) {
      lines.push(`Investment: ${investmentDisplay}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  // Modules
  proposal.modules.filter(m => m.enabled).forEach(module => {
    if (module.titleCaps) {
      lines.push(module.titleCaps);
      lines.push('');
    }
    lines.push(module.bodyMarkdown.replace(/\*\*/g, '').replace(/\*/g, ''));
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  // Itemized
  if (proposal.itemized.source === 'placeholder') {
    lines.push('PRODUCTS & SERVICES');
    lines.push('');
    lines.push(proposal.itemized.placeholderText);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Terms
  lines.push(proposal.terms.titleCaps);
  lines.push('');
  if (proposal.terms.introText) {
    lines.push(proposal.terms.introText);
    lines.push('');
  }
  proposal.terms.clauses.forEach(clause => {
    lines.push(`${clause.number}. ${clause.title || ''}`);
    lines.push(clause.body);
    lines.push('');
  });
  lines.push('---');
  lines.push('');

  // Signatures
  if (proposal.signatures.source === 'placeholder') {
    lines.push('ACCEPTANCE');
    lines.push('');
    lines.push(proposal.signatures.placeholderText);
  }

  return lines.join('\n');
}

/**
 * Render proposal body only (without full HTML wrapper)
 * Useful for embedding in existing pages or pasting into editors
 * All styles are inlined for rich text editor compatibility
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to render
 * @returns {string} HTML body content only
 */
export function renderProposalBodyHtml(proposal) {
  return `<div style="${styles.content}">
${renderComments(proposal.comments)}
${renderServices(proposal.services)}
${renderModules(proposal.modules)}
</div>`.trim();
}
