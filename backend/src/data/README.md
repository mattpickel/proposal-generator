# Service Content Templates

This directory contains the detailed content templates used for proposal generation.

## File: `serviceContentTemplates.js`

This file defines the detailed content for each service that appears in generated proposals. Each service has three main sections:

### 1. `detailedDescription` - Used in "What's Included" section

```javascript
detailedDescription: {
  intro: "Opening paragraph that explains what the service is and why it matters",

  deliverableGroups: [
    {
      groupTitle: "Category Name",
      bullets: [
        "Specific deliverable or task",
        "Another deliverable",
        // ... more bullets
      ]
    },
    // ... more groups
  ],

  timeline: "How long this service takes",
  outcome: "The benefit or result the client gets"
}
```

### 2. `investmentNarrative` - Used in "Investment" section

```javascript
investmentNarrative: {
  structure: "one_time" | "monthly_retainer" | "one_time_variable",
  totalPrice: 7500, // or monthlyPrice for retainers
  narrative: "How pricing is described in the proposal",
  valueStatement: "ROI or value statement to reinforce the investment"
}
```

### 3. `quoteDescription` - Used in Products & Services line items

```javascript
quoteDescription: "Short 1-2 sentence description for HighLevel quote line items"
```

## How to Edit Templates

### Step 1: Edit `serviceContentTemplates.js`

Open `backend/src/data/serviceContentTemplates.js` and modify the content for your services:

- **Update the intro** to match your positioning
- **Edit deliverable groups** to reflect your actual service deliverables
- **Adjust pricing** in `investmentNarrative.totalPrice` or `monthlyPrice`
- **Customize narratives** to match your voice and offerings
- **Refine quote descriptions** for clarity

### Step 2: Reseed the Database

After editing the templates, you need to reseed the database to update Firebase:

```bash
cd backend
npm run seed
```

This will:
1. Read your updated `serviceContentTemplates.js`
2. Merge templates with service modules
3. Update the `serviceModules` collection in Firebase

### Step 3: Test Proposal Generation

1. Start the dev servers: `npm run dev` (from root)
2. Create a new proposal
3. Select services
4. Generate proposal
5. Verify the "What's Included" and "Investment" sections use your updated content

## Template Structure by Service

### marketing_machine
- **Price:** $7,500 one-time
- **Deliverable Groups:** 7 groups covering strategy, brand, audience, value prop, marketing channels, measurement, implementation
- **Timeline:** 6-8 weeks

### internal_comms
- **Price:** $2,500 one-time
- **Deliverable Groups:** 3 groups covering audit, strategy, system design
- **Timeline:** 4-6 weeks

### seo_hosting
- **Price:** $3,500 one-time (includes 12 months hosting)
- **Deliverable Groups:** 4 groups covering technical audit, on-page SEO, managed hosting, local SEO
- **Timeline:** 2-3 weeks

### digital_upgrades
- **Price:** Starting at $5,000 (variable)
- **Deliverable Groups:** 4 groups covering UX audit, CRM integration, custom development, optimization
- **Timeline:** 4-8 weeks (varies)

### 828_marketing
- **Price:** $3,000/month retainer
- **Deliverable Groups:** 5 groups covering content, email, social, campaigns, reporting
- **Timeline:** Ongoing monthly

### fractional_cmo
- **Price:** $5,000/month retainer
- **Deliverable Groups:** 5 groups covering strategy, team management, campaign oversight, reporting, availability
- **Timeline:** Ongoing (6-12 month commitment)

## Tips for Writing Great Content

### For `intro` paragraphs:
- Start with the benefit or problem you solve
- Keep it to 2-3 sentences
- Use "you/your" language to speak directly to the client
- Avoid buzzwords—be concrete and specific

### For `deliverable_groups` bullets:
- Start with action verbs (Create, Design, Develop, Implement, etc.)
- Be specific about what's included
- Use sub-bullets for multi-step deliverables if needed
- Keep bullets scannable—aim for 5-10 words per bullet

### For `investmentNarrative`:
- Always include payment terms
- Add a value statement that reinforces ROI
- Use concrete numbers when possible (% improvement, time saved, etc.)
- Keep the tone confident but not salesy

### For `quoteDescription`:
- Keep it to 1-2 sentences max
- Include the key deliverables or outcomes
- Make it clear enough to stand alone in a quote
- Match the tone of your brand

## Advanced: Adding New Services

To add a new service:

1. **Add to `serviceModules` array** in `backend/scripts/seedDatabase.js`:
   ```javascript
   {
     id: 'new_service_id',
     label: 'New Service Name',
     category: 'strategy',
     summary: 'One-line summary',
     billingType: 'one_time', // or 'monthly'
     lineItemDefaults: [
       { label: 'Line Item 1', description: 'Description', price: 1000 }
     ]
   }
   ```

2. **Add to `serviceContentTemplates`** in this file:
   ```javascript
   new_service_id: {
     serviceKey: 'new_service_id',
     displayName: 'New Service Name',
     detailedDescription: { /* ... */ },
     investmentNarrative: { /* ... */ },
     quoteDescription: "..."
   }
   ```

3. **Add to frontend** `ProposalBuilderPage.jsx` serviceOptions array:
   ```javascript
   { id: 'new_service_id', label: 'New Service Name', price: '$X,XXX' }
   ```

4. **Reseed the database:**
   ```bash
   npm run seed
   ```

## Sample vs Production Content

The current templates contain **sample content** that demonstrates the structure and level of detail. You should:

1. Replace all intro paragraphs with your actual positioning
2. Update deliverable groups to match your real service deliverables
3. Adjust pricing to your actual rates
4. Customize value statements with your real ROI data or case studies
5. Refine the tone to match your brand voice

Don't just tweak the samples—make them authentically yours!
