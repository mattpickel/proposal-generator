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
 * Parse restricted markdown to HTML
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
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${escapeHtml(trimmedLine.substring(2))}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (trimmedLine) {
        processedLines.push(`<p>${escapeHtml(trimmedLine)}</p>`);
      }
    }
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  return processedLines.join('\n');
}

/**
 * Render cover block to HTML
 * @param {import('../models/proposalSchema.js').CoverBlock} cover - Cover block
 * @returns {string} HTML output
 */
function renderCover(cover) {
  return `
<header class="proposal-cover">
  <h1 class="proposal-title">${escapeHtml(cover.proposalTitle)}</h1>
  <div class="proposal-meta">
    <div class="brand-name">${escapeHtml(cover.brandName)}</div>
    <div class="prepared-by">
      Prepared by ${escapeHtml(cover.preparedByName)}, ${escapeHtml(cover.preparedByTitle)}
    </div>
    <div class="date">Date: ${escapeHtml(cover.quoteCreatedDate)}</div>
    <div class="for-client">
      <div>For: ${escapeHtml(cover.forClientName)}</div>
      <div>${escapeHtml(cover.forClientOrg)}</div>
      ${cover.forClientEmail ? `<div>${escapeHtml(cover.forClientEmail)}</div>` : ''}
    </div>
  </div>
</header>`;
}

/**
 * Render comments block to HTML
 * @param {import('../models/proposalSchema.js').CommentsBlock} comments - Comments block
 * @returns {string} HTML output
 */
function renderComments(comments) {
  const paragraphsHtml = comments.paragraphs
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('\n    ');

  return `
<section class="proposal-comments">
  <h2>${escapeHtml(comments.heading)}</h2>
  <p class="greeting">${escapeHtml(comments.greetingLine)}</p>
  ${paragraphsHtml}
  <p class="signoff">${escapeHtml(comments.signoff)}</p>
</section>`;
}

/**
 * Render single service block to HTML
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
  <div class="service-subsection">
    <h4>${sub.number}. ${escapeHtml(sub.title)}</h4>
    ${parseRestrictedMarkdown(body)}
  </div>`;
    })
    .join('\n');

  const outcomeHtml = service.outcome
    ? `<p class="service-outcome">${escapeHtml(service.outcome)}</p>`
    : '';

  const investmentHtml = service.investment?.renderHint
    ? `<div class="service-investment"><strong>Investment:</strong> ${escapeHtml(service.investment.renderHint)}</div>`
    : '';

  const timelineHtml = service.timeline
    ? `<p class="service-timeline"><strong>Timeline:</strong> ${escapeHtml(service.timeline)}</p>`
    : '';

  return `
<section class="proposal-service">
  <h2 class="service-title">${escapeHtml(service.displayNameCaps)}</h2>
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
 * Render optional modules to HTML
 * @param {import('../models/proposalSchema.js').ModuleBlock[]} modules - Module blocks
 * @returns {string} HTML output
 */
function renderModules(modules) {
  return modules
    .filter(m => m.enabled)
    .map(module => `
<section class="proposal-module">
  ${module.titleCaps ? `<h2>${escapeHtml(module.titleCaps)}</h2>` : ''}
  ${parseRestrictedMarkdown(module.bodyMarkdown)}
</section>`)
    .join('\n');
}

/**
 * Render itemized block to HTML
 * @param {import('../models/proposalSchema.js').ItemizedBlock} itemized - Itemized block
 * @returns {string} HTML output
 */
function renderItemized(itemized) {
  if (itemized.source === 'placeholder') {
    return `
<section class="proposal-itemized placeholder">
  <h2>PRODUCTS & SERVICES</h2>
  <p class="placeholder-text">${escapeHtml(itemized.placeholderText)}</p>
</section>`;
  }

  // Future: render actual itemized data from HighLevel
  return '';
}

/**
 * Render terms block to HTML
 * @param {import('../models/proposalSchema.js').TermsBlock} terms - Terms block
 * @returns {string} HTML output
 */
function renderTerms(terms) {
  const clausesHtml = terms.clauses
    .map(clause => `
  <div class="terms-clause">
    <h4>${clause.number}. ${clause.title ? escapeHtml(clause.title) : ''}</h4>
    <p>${escapeHtml(clause.body)}</p>
  </div>`)
    .join('\n');

  return `
<section class="proposal-terms">
  <h2>${escapeHtml(terms.titleCaps)}</h2>
  ${clausesHtml}
</section>`;
}

/**
 * Render signatures block to HTML
 * @param {import('../models/proposalSchema.js').SignatureBlock} signatures - Signatures block
 * @returns {string} HTML output
 */
function renderSignatures(signatures) {
  if (signatures.source === 'placeholder') {
    return `
<section class="proposal-signatures placeholder">
  <h2>ACCEPTANCE</h2>
  <p class="placeholder-text">${escapeHtml(signatures.placeholderText)}</p>
</section>`;
  }

  return '';
}

/**
 * Get CSS styles for the proposal
 * @returns {string} CSS styles
 */
function getProposalStyles() {
  return `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      font-size: 14px;
    }
    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
      color: #111;
    }
    h2 {
      font-size: 1.25rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid #e5e5e5;
      padding-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #333;
    }
    h3 {
      font-size: 1.1rem;
      margin-top: 1.5rem;
      color: #444;
    }
    h4 {
      font-size: 1rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      color: #555;
    }
    p {
      margin: 0.75rem 0;
    }
    ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    li {
      margin: 0.25rem 0;
    }
    .proposal-cover {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #ddd;
    }
    .proposal-meta {
      color: #666;
      margin-top: 1rem;
      font-size: 0.95rem;
    }
    .proposal-meta > div {
      margin: 0.25rem 0;
    }
    .brand-name {
      font-weight: 600;
      color: #333;
    }
    .greeting {
      font-size: 1.05rem;
      margin-bottom: 0.5rem;
    }
    .signoff {
      font-weight: 600;
      margin-top: 1.5rem;
    }
    .service-title {
      color: #2563eb;
    }
    .service-subsection {
      margin: 1rem 0;
    }
    .service-outcome {
      font-style: italic;
      color: #555;
      margin-top: 1rem;
    }
    .service-timeline {
      color: #666;
      font-size: 0.95rem;
    }
    .service-investment {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f5f5f5;
      border-radius: 4px;
      border-left: 3px solid #2563eb;
    }
    .placeholder {
      background: #fef3c7;
      padding: 1rem;
      border-radius: 4px;
      margin: 1.5rem 0;
    }
    .placeholder-text {
      color: #92400e;
      font-style: italic;
    }
    .terms-clause {
      margin: 1rem 0;
    }
    .terms-clause h4 {
      margin-bottom: 0.25rem;
    }
    .proposal-terms {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
    }
  `;
}

/**
 * Render complete proposal to HTML
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to render
 * @returns {string} Complete HTML document
 */
export function renderProposalToHtml(proposal) {
  log.info('ProposalRenderer', 'Rendering proposal to HTML', {
    proposalId: proposal.id
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(proposal.cover.proposalTitle)}</title>
  <style>${getProposalStyles()}</style>
</head>
<body>
${renderCover(proposal.cover)}
${renderComments(proposal.comments)}
${renderServices(proposal.services)}
${renderModules(proposal.modules)}
${renderItemized(proposal.itemized)}
${renderTerms(proposal.terms)}
${renderSignatures(proposal.signatures)}
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

    if (service.investment?.renderHint) {
      lines.push(`Investment: ${service.investment.renderHint}`);
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
 * Useful for embedding in existing pages
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to render
 * @returns {string} HTML body content only
 */
export function renderProposalBodyHtml(proposal) {
  return `
${renderCover(proposal.cover)}
${renderComments(proposal.comments)}
${renderServices(proposal.services)}
${renderModules(proposal.modules)}
${renderItemized(proposal.itemized)}
${renderTerms(proposal.terms)}
${renderSignatures(proposal.signatures)}
  `.trim();
}
