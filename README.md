# Software Margin Tearsheet

An interactive analysis of margin trajectory, pricing power, and AI unit economics across 56 publicly traded software companies, covering fiscal years 2016 through 2025.

Built to answer a specific question: in a sector where gross margin is close to a physical constant, what does it mean when a company's margin actually moves?

## What it shows

**Table.** Every company, sortable, with a trajectory ribbon per row showing the ten-year path of the selected metric. Green means expanding, red means compressing. Scanning one column separates the two groups instantly.

**10-year cohort.** Median growth and median free cash flow margin stacked by year, which reveals that Rule of 40 is now composed of entirely different material than it was in 2018. Roughly 35 points of growth and 5 of cash then; roughly 15 and 25 now. Same score, opposite business.

**Rule of 40.** Growth against free cash flow margin, coloured by revenue scale. The two clusters are the story.

**Trends.** Multi-company comparison across any metric.

**AI margin math.** An interactive model of inference economics. Set up a customer, add an AI feature, and watch what happens to gross margin as you adjust usage, token consumption, caching, model routing, committed capacity and price. Alongside it, a framework for reading which monetization and cost-recognition choices a company has made, and how those choices surface in reported numbers.

## Metrics

| Metric | Why it is here |
| --- | --- |
| Gross margin | The pricing power test. Nearly constant across the sector, so movement carries information. |
| FCF margin | Self funding capacity. The metric that transformed most across the decade. |
| Revenue growth | Read alongside FCF margin, never alone. |
| Net revenue retention | What existing customers do when the bill arrives. Contaminated by seat and usage growth, so match the proxy to the business model. |
| Rule of 40 | Growth plus FCF margin. Composition matters more than the score. |
| Pricing power | A composite: 0.35 gross margin, 0.25 NRR, 0.25 three-year average growth, 0.15 gross margin trend. Formula shown in the footer. |

## Data

Figures are approximations, rounded and fiscal-year aligned, assembled for pattern illustration rather than precision. Recent years include estimates for companies whose fiscal year had not closed. Companies that were not public, or not reliably reported, in a given year render as gaps rather than guesses.

Two biases worth stating plainly. **Survivorship:** companies acquired or taken private during the decade are absent, so the picture is systematically healthier than reality. **Starting point:** 2016 to 2021 spans an era of near-zero interest rates, so every trend line partly reflects a change in the cost of capital rather than in the businesses themselves.

This is an independent analytical exercise. It is not investment advice, not a recommendation to buy or sell any security, and not affiliated with or endorsed by any company shown.

## Running locally

Requires Node 18 or later.

```bash
npm install
npm run dev
```

Then open the printed local address. To produce a production build:

```bash
npm run build
npm run preview
```

## Deploying

The project is a standard Vite build and deploys to Vercel, Netlify, Cloudflare Pages or GitHub Pages without configuration changes. Build command `npm run build`, output directory `dist`.

## Stack

React 18, Vite 5, Tailwind CSS 4, Recharts 2. Single component, no backend, no data fetching, no browser storage.

## Licence

MIT. See LICENSE.
