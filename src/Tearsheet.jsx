import React, { useState, useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine,
  BarChart, Bar, Legend, ComposedChart
} from "recharts";

/* ------------------------------------------------------------------ */
/*  PALETTE                                                            */
/* ------------------------------------------------------------------ */
const C = {
  canvas: "#0E1216",
  panel: "#161B21",
  panel2: "#1B222A",
  rule: "#262E36",
  ink: "#EDEAE3",
  muted: "#7E8994",
  dim: "#4E5862",
  up: "#6FD3B4",
  down: "#D9566A",
  amber: "#F2C14E",
  blue: "#7FA8D9",
};

const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/*  [ticker, name, category, revenue[], grossMargin[], fcfMargin[],    */
/*   netRevenueRetention(latest, null if n/a)]                         */
/*  Fiscal years aligned to nearest calendar year. Figures are         */
/*  approximations from knowledge through mid-2026. Verify before use. */
/* ------------------------------------------------------------------ */
const RAW = [
  ["MSFT","Microsoft","Platform",[168088,198270,211915,245122,281700],[69,68,69,70,69],[34,39,28,29,25],null],
  ["ORCL","Oracle","Platform",[40479,42440,49954,52961,57399],[80,79,77,77,76],[34,12,17,21,-1],null],
  ["CRM","Salesforce","Enterprise Suites",[26492,31352,34857,37895,41300],[73,73,75,77,78],[22,19,18,26,29],101],
  ["SAP","SAP","Enterprise Suites",[32800,32500,33700,37000,40500],[72,72,73,74,75],[13,15,17,17,20],null],
  ["ADBE","Adobe","Design & Engineering",[15785,17606,19409,21505,23600],[88,88,88,89,89],[44,42,37,36,38],null],
  ["INTU","Intuit","Enterprise Suites",[9633,12726,14368,16285,18831],[82,80,79,79,80],[33,29,29,29,30],null],
  ["NOW","ServiceNow","Enterprise Suites",[5896,7245,8971,10984,13300],[77,78,79,79,80],[26,27,31,32,32],98],
  ["WDAY","Workday","Enterprise Suites",[5139,6216,7259,8446,9500],[72,73,75,76,77],[26,25,25,26,28],96],
  ["PANW","Palo Alto Networks","Security",[4256,5502,6893,8028,9179],[70,68,72,74,74],[33,27,39,39,38],null],
  ["CRWD","CrowdStrike","Security",[1452,2241,3056,3954,4800],[74,75,75,75,75],[30,30,31,27,25],112],
  ["DDOG","Datadog","DevTools & Observability",[1029,1675,2128,2684,3450],[78,80,81,81,80],[24,21,29,28,26],115],
  ["SNOW","Snowflake","Data & Cloud Infra",[1219,2066,2806,3626,4600],[62,65,68,67,67],[6,20,26,25,25],126],
  ["MDB","MongoDB","Data & Cloud Infra",[874,1284,1683,2006,2350],[70,72,74,73,73],[-5,-2,7,6,10],119],
  ["TEAM","Atlassian","DevTools & Observability",[2089,2803,3535,4359,5217],[83,82,82,82,82],[22,17,17,32,30],null],
  ["HUBS","HubSpot","Marketing & Engagement",[1301,1731,2170,2627,3100],[81,81,84,84,85],[8,7,14,17,17],104],
  ["VEEV","Veeva Systems","Vertical SaaS",[1851,2155,2364,2747,3100],[72,71,72,74,75],[42,34,39,38,40],108],
  ["ZM","Zoom","Work & Content",[4100,4393,4527,4666,4800],[74,75,76,76,77],[36,28,32,35,35],98],
  ["DOCU","DocuSign","Work & Content",[2107,2516,2761,2976,3150],[79,79,80,80,81],[21,17,32,32,30],101],
  ["TWLO","Twilio","Data & Cloud Infra",[2842,3826,4154,4457,5000],[50,47,49,51,52],[-14,-7,7,15,16],107],
  ["NET","Cloudflare","Data & Cloud Infra",[656,975,1297,1670,2150],[78,77,77,77,77],[-6,0,9,7,9],111],
  ["ZS","Zscaler","Security",[673,1091,1617,2168,2673],[78,77,78,78,78],[22,21,22,29,28],114],
  ["OKTA","Okta","Security",[1300,1858,2263,2610,2900],[71,72,75,77,78],[-2,4,17,27,29],106],
  ["CFLT","Confluent","Data & Cloud Infra",[388,586,777,964,1150],[66,69,72,75,76],[-46,-40,-14,-1,5],117],
  ["ESTC","Elastic","DevTools & Observability",[608,862,1069,1267,1483],[74,74,73,75,76],[-2,0,7,14,16],112],
  ["GTLB","GitLab","DevTools & Observability",[253,424,580,759,940],[89,89,90,90,90],[-32,-30,-3,15,17],121],
  ["ASAN","Asana","Work & Content",[378,547,652,724,780],[89,90,90,90,90],[-44,-32,-9,0,3],96],
  ["MNDY","monday.com","Work & Content",[308,519,730,972,1250],[88,89,89,90,90],[0,9,25,31,30],112],
  ["IOT","Samsara","Vertical SaaS",[428,653,937,1255,1600],[69,71,73,75,76],[-35,-24,-2,7,10],115],
  ["BILL","BILL Holdings","Vertical SaaS",[238,642,1058,1290,1455],[74,78,80,81,82],[-3,3,12,17,20],null],
  ["TOST","Toast","Vertical SaaS",[1705,2731,3865,4963,6100],[20,19,21,24,26],[-8,-6,0,6,9],null],
  ["SHOP","Shopify","Commerce",[4612,5600,7060,8880,11200],[54,49,49,51,50],[10,-4,13,18,20],null],
  ["U","Unity","Design & Engineering",[1110,1391,2187,1813,1750],[78,68,66,73,76],[-10,-8,3,15,17],null],
  ["KVYO","Klaviyo","Marketing & Engagement",[290,473,698,937,1180],[73,75,76,77,78],[-5,-2,5,12,15],108],
  ["BRZE","Braze","Marketing & Engagement",[238,356,472,593,700],[67,68,69,70,71],[-18,-14,-3,3,7],109],
  ["BOX","Box","Work & Content",[874,991,1038,1090,1160],[73,74,77,80,81],[30,26,29,29,30],102],
  ["YEXT","Yext","Marketing & Engagement",[390,401,404,421,460],[76,76,77,77,74],[-3,1,6,9,6],98],
  ["ADSK","Autodesk","Design & Engineering",[4386,5005,5497,6132,6900],[91,92,92,92,92],[34,40,23,20,26],null],
  ["PLTR","Palantir","Platform",[1542,1906,2225,2866,4100],[78,79,80,80,80],[21,10,32,40,45],null],
  ["FTNT","Fortinet","Security",[3342,4417,5305,5958,6800],[78,76,76,80,81],[40,38,32,36,37],null],
  ["SNPS","Synopsys","Design & Engineering",[4204,5082,5843,6127,7000],[79,80,81,81,80],[26,29,22,23,20],null],
  ["CDNS","Cadence","Design & Engineering",[2988,3562,4090,4641,5300],[90,90,90,86,87],[30,30,27,23,26],null],
  ["TYL","Tyler Technologies","Vertical SaaS",[1592,1850,1952,2138,2350],[45,44,44,46,47],[18,13,16,21,22],null],
  ["DT","Dynatrace","DevTools & Observability",[929,1159,1431,1704,1950],[82,82,82,83,84],[26,22,24,26,27],111],
  ["DUOL","Duolingo","Consumer",[251,369,531,748,1020],[72,73,73,73,72],[0,4,20,24,28],null],
  ["FIG","Figma","Design & Engineering",[null,333,505,749,1000],[null,88,90,91,91],[null,-8,3,10,14],132],
  ["DOCS","Doximity","Vertical SaaS",[344,419,475,570,650],[87,88,89,90,90],[35,32,38,42,44],119],
  ["DBX","Dropbox","Work & Content",[2158,2325,2502,2548,2470],[79,81,82,83,84],[30,32,31,33,34],null],
  ["NTNX","Nutanix","Data & Cloud Infra",[1394,1581,1863,2148,2570],[79,81,84,85,87],[-11,2,11,26,28],null],
  ["WIX","Wix","Commerce",[1270,1388,1562,1761,1980],[62,62,67,68,69],[-1,2,13,17,19],null],
  ["GWRE","Guidewire","Vertical SaaS",[743,813,906,981,1180],[51,50,55,60,64],[0,-2,7,15,18],null],
  ["PTC","PTC","Design & Engineering",[1807,1933,2097,2298,2500],[78,79,80,81,81],[24,24,29,32,33],null],
  ["BSY","Bentley Systems","Design & Engineering",[965,1041,1203,1353,1500],[79,79,80,81,81],[25,25,26,28,29],110],
  ["MANH","Manhattan Associates","Vertical SaaS",[664,767,928,1043,1090],[54,54,55,56,56],[22,22,25,25,26],null],
  ["APPF","AppFolio","Vertical SaaS",[359,472,620,794,920],[60,58,61,66,67],[5,-2,15,24,26],null],
  ["SPT","Sprout Social","Marketing & Engagement",[188,254,334,405,440],[74,75,76,77,78],[-5,-3,0,5,7],101],
  ["AMPL","Amplitude","Marketing & Engagement",[167,238,276,300,330],[71,73,75,76,77],[-14,-16,-6,0,3],98],
];

const SIZE_TIERS = [
  { key: "Small", label: "< $1B",    lo: 0,     hi: 1000,   color: "#7FA8D9" },
  { key: "Mid",   label: "$1-5B",    lo: 1000,  hi: 5000,   color: "#6FD3B4" },
  { key: "Large", label: "$5-25B",   lo: 5000,  hi: 25000,  color: "#F2C14E" },
  { key: "Mega",  label: "> $25B",   lo: 25000, hi: 1e9,    color: "#D9566A" },
];
const tierOf = (rev) => (SIZE_TIERS.find((t) => rev >= t.lo && rev < t.hi) || SIZE_TIERS[0]).key;
const tierColor = (k) => (SIZE_TIERS.find((t) => t.key === k) || SIZE_TIERS[0]).color;

/* qualitative notes for the companies that matter most to the read */
const NOTES = {
  ADSK: "The stability case. Gross margin has sat at 91-92% for five straight years, the flattest line in this entire dataset. A quasi-monopoly in design software with a subscription transition long finished. FCF margin dipped mid-period on a billing model change, not a demand problem.",
  DDOG: "Premium infrastructure with visible NRR decay: roughly 130%+ in 2021 to about 115% now. Gross margin holding near 80% says pricing power is intact; the NRR slide says the land-and-expand engine has normalized, not broken. The P/E collapse is a rate story, not a business story.",
  CRWD: "Category leader with the strongest security consolidation narrative, but FCF margin has come down from the peak on the back of the 2024 outage remediation and customer commitment packages. Gross margin is flat at 75%, which is the real signal: no pricing erosion.",
  BOX: "The maturity archetype. Growth around 5%, but gross margin has climbed roughly 8pp over five years and FCF margin sits near 30%. This is what a company looks like when it optimizes for cash generation rather than growth rate.",
  GTLB: "Best-in-class 90% gross margin and a genuine turn from deeply negative to positive FCF. NRR has fallen from the 150s to around 120, which is normalization rather than distress. The open-source model gives structurally high margin.",
  SNOW: "The most dramatic NRR decompression in software: 178% to the mid-120s. Consumption pricing cuts both ways. Gross margin in the high 60s is structurally capped by the underlying cloud infrastructure it resells.",
  ZM: "The cautionary tale. Growth went from 55% to about 3% in four years while margins stayed excellent. Proof that margin quality alone does not save a decelerating top line, and that a pandemic demand pull-forward can permanently reset a growth curve.",
  U: "The only company here with declining revenue across the period alongside margin whiplash. A reminder that in software, a broken pricing model (the 2023 runtime fee episode) destroys customer trust faster than any competitor can.",
  TWLO: "Structurally weak pricing power: gross margin around 50% because carrier fees pass through. Usage-based revenue without margin protection is the hardest model in software.",
  MSFT: "Gross margin flat near 69% despite an enormous AI capex cycle. FCF margin compression from 39% to about 25% is the clearest evidence in this dataset that the AI buildout is a real cash cost even for the strongest balance sheet on earth.",
  DOCS: "Quietly one of the best financial profiles in software: 90% gross margin, mid-40s FCF margin, high NRR, and a vertical moat in physician audiences. Rarely discussed, hard to displace.",
  VEEV: "Vertical SaaS done right. Life sciences lock-in produces 40% FCF margins with no hypergrowth required. The template for durable, unsexy compounding.",
  PLTR: "The outlier on every axis: accelerating growth at scale with 45% FCF margin. Also carries the most extreme valuation multiple in the sector, meaning almost all future execution is already priced.",
  FIG: "Newly public with a 91% gross margin and the highest NRR in the dataset. Design tooling has proven remarkably defensible against both incumbents and AI-native entrants so far.",
  DUOL: "Consumer subscription with software-like margins and a rare combination of accelerating growth and expanding FCF. The education category's clearest financial success story.",
  ORCL: "The AI capex casualty. FCF margin went from 34% to roughly breakeven or negative as datacenter spending for AI hosting overwhelmed operating cash flow. Revenue growth improved; cash generation did not.",
};

/* ------------------------------------------------------------------ */
/*  HISTORY 2016-2020                                                  */
/*  ticker: [revenue[5], grossMargin[5], fcfMargin[5]]                 */
/*  Absent tickers were not public / not reliably reported in these    */
/*  years and render as gaps rather than guesses.                      */
/* ------------------------------------------------------------------ */
const N5 = [null, null, null, null, null];
const HIST = {
  MSFT: [[85320,89950,110360,125843,143015],[61,62,65,66,68],[29,37,29,30,32]],
  ORCL: [[37047,37728,39831,39506,39068],[79,79,80,80,80],[30,30,33,34,34]],
  CRM:  [[6667,8392,10480,13282,17098],[75,74,74,75,75],[15,14,17,17,18]],
  SAP:  [[24400,26200,28800,30000,31000],[69,70,70,71,71],[12,14,13,14,20]],
  ADBE: [[5854,7302,9030,11171,12868],[86,86,87,85,87],[32,35,38,36,42]],
  INTU: [[4694,5177,5964,6784,7679],[84,84,83,83,82],[26,28,30,32,29]],
  NOW:  [[1391,1933,2609,3460,4519],[66,71,74,76,77],[15,18,21,24,27]],
  WDAY: [[1574,2143,2822,3627,4318],[69,70,70,71,72],[15,15,17,23,26]],
  PANW: [[1379,1762,2273,2900,3408],[73,72,71,70,70],[27,27,30,29,29]],
  CRWD: [[null,null,null,481,874],[null,null,null,71,74],[null,null,null,-2,10]],
  DDOG: [[null,null,198,363,604],[null,null,75,77,78],[null,null,4,3,14]],
  SNOW: [[null,null,null,null,592],[null,null,null,null,56],[null,null,null,null,-33]],
  MDB:  [[null,155,267,422,590],[null,72,71,70,70],[null,-31,-25,-9,-6]],
  TEAM: [[457,620,874,1210,1614],[80,81,83,84,83],[25,26,29,29,22]],
  HUBS: [[271,376,513,675,883],[78,80,81,81,81],[-1,2,5,6,8]],
  VEEV: [[409,544,686,862,1104],[63,66,71,72,72],[26,28,32,34,39]],
  ZM:   [[null,null,331,623,2651],[null,null,80,82,69],[null,null,15,17,50]],
  DOCU: [[null,519,701,974,1453],[null,77,79,75,79],[null,-5,2,8,20]],
  TWLO: [[277,399,650,1134,1762],[58,55,54,55,53],[-6,-6,-3,-4,-1]],
  NET:  [[null,null,null,287,431],[null,null,null,78,77],[null,null,null,-27,-15]],
  ZS:   [[null,null,190,303,431],[null,null,81,80,78],[null,null,3,4,16]],
  OKTA: [[160,257,399,586,835],[68,70,72,73,74],[null,-12,-6,0,10]],
  CFLT: [[null,null,null,null,237],[null,null,null,null,63],[null,null,null,null,-50]],
  ESTC: [[null,null,160,272,428],[null,null,73,73,74],[null,null,-19,-12,-4]],
  GTLB: [[null,null,null,null,152],[null,null,null,null,88],[null,null,null,null,-45]],
  ASAN: [[null,null,null,143,227],[null,null,null,86,87],[null,null,null,-42,-40]],
  MNDY: [[null,null,null,78,161],[null,null,null,84,86],[null,null,null,-60,-25]],
  IOT:  [[null,null,null,120,250],[null,null,null,58,62],[null,null,null,-70,-50]],
  BILL: [[null,null,null,108,157],[null,null,null,74,74],[null,null,null,-9,-6]],
  TOST: [[null,null,null,665,823],[null,null,null,22,19],[null,null,null,-25,-15]],
  SHOP: [[389,673,1073,1578,2929],[55,56,56,55,53],[-3,1,3,-2,13]],
  U:    [[null,null,381,542,772],[null,null,76,79,78],[null,null,-20,-17,-13]],
  BRZE: [[null,null,null,null,150],[null,null,null,null,65],[null,null,null,null,-22]],
  BOX:  [[399,506,608,696,771],[70,72,72,70,70],[-3,1,5,10,24]],
  YEXT: [[124,170,228,298,355],[71,73,75,75,76],[-30,-25,-22,-18,-8]],
  ADSK: [[2031,2057,2570,3274,3790],[84,86,87,89,90],[-25,-9,11,26,35]],
  PLTR: [[null,null,595,743,1093],[null,null,67,72,68],[null,null,-49,-38,-28]],
  FTNT: [[1275,1495,1801,2156,2594],[72,74,76,77,78],[22,25,28,32,36]],
  SNPS: [[2423,2725,3121,3361,3685],[78,78,78,78,79],[13,17,17,21,26]],
  CDNS: [[1816,1943,2138,2336,2683],[88,89,89,89,90],[20,22,23,25,29]],
  TYL:  [[786,841,935,1086,1116],[47,47,46,45,44],[18,20,20,21,25]],
  DT:   [[null,null,431,545,704],[null,null,80,81,81],[null,null,10,15,22]],
  DUOL: [[null,null,null,71,161],[null,null,null,70,71],[null,null,null,-15,-5]],
  DOCS: [[null,null,null,null,207],[null,null,null,null,85],[null,null,null,null,30]],
  DBX:  [[null,1107,1392,1661,1914],[null,67,74,76,79],[null,12,26,26,25]],
  NTNX: [[445,846,1155,1236,1308],[62,61,68,72,78],[-25,-15,-8,-25,-20]],
  WIX:  [[290,426,604,761,989],[82,80,77,74,70],[3,7,11,10,17]],
  GWRE: [[514,514,596,661,742],[62,58,55,52,50],[15,10,8,5,2]],
  PTC:  [[1140,1164,1242,1256,1458],[73,74,75,73,76],[15,17,18,21,22]],
  BSY:  [[null,null,null,737,802],[null,null,null,77,78],[null,null,null,20,24]],
  MANH: [[605,617,551,618,586],[55,55,53,53,53],[21,22,21,20,23]],
  APPF: [[145,190,256,256,310],[58,59,60,60,61],[5,8,12,10,14]],
  SPT:  [[null,null,null,103,133],[null,null,null,73,74],[null,null,null,-15,-8]],
  AMPL: [[null,null,null,68,102],[null,null,null,68,69],[null,null,null,-20,-18]],
};

/* ------------------------------------------------------------------ */
/*  DERIVE                                                             */
/* ------------------------------------------------------------------ */
function growthSeries(rev) {
  return rev.map((v, i) => {
    if (i === 0 || v == null || rev[i - 1] == null) return null;
    return +(((v - rev[i - 1]) / rev[i - 1]) * 100).toFixed(1);
  });
}

function norm(v, lo, hi) {
  if (v == null) return 0.5;
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
}

const COMPANIES = RAW.map(([ticker, name, category, rev5, gm5, fcf5, nrr]) => {
  const h = HIST[ticker] || [N5, N5, N5];
  const rev = [...h[0], ...rev5];
  const gm = [...h[1], ...gm5];
  const fcf = [...h[2], ...fcf5];

  const growth = growthSeries(rev);
  const last = rev.length - 1;
  const firstIdx = rev.findIndex((v) => v != null);
  const firstYear = YEARS[firstIdx];
  const gmDelta = +(gm[last] - gm[firstIdx]).toFixed(1);
  const fcfDelta = +(fcf[last] - fcf[firstIdx]).toFixed(1);
  const recentGrowth = growth.slice(7).filter((v) => v != null);
  const avgGrowth = recentGrowth.length
    ? +(recentGrowth.reduce((a, b) => a + b, 0) / recentGrowth.length).toFixed(1)
    : 0;
  const rule40 = +((growth[last] ?? 0) + fcf[last]).toFixed(1);

  const power = Math.round(
    100 *
      (0.35 * norm(gm[last], 45, 92) +
        0.25 * norm(nrr ?? 105, 95, 135) +
        0.25 * norm(avgGrowth, 0, 45) +
        0.15 * norm(gmDelta, -6, 12))
  );

  return {
    ticker, name, category, rev, gm, fcf, nrr, growth, firstYear,
    gmDelta, fcfDelta, avgGrowth, rule40, power,
    revLatest: rev[last],
    tier: tierOf(rev[last]),
    gmLatest: gm[last],
    fcfLatest: fcf[last],
    growthLatest: growth[last],
    note: NOTES[ticker] || null,
  };
});

const CATEGORIES = ["All", ...Array.from(new Set(COMPANIES.map((c) => c.category))).sort()];

const METRICS = [
  { key: "gm", label: "Gross margin", unit: "%", lo: 15, hi: 95 },
  { key: "fcf", label: "FCF margin", unit: "%", lo: -50, hi: 50 },
  { key: "growth", label: "Revenue growth", unit: "%", lo: -10, hi: 120 },
  { key: "rev", label: "Revenue", unit: "$M", lo: 0, hi: 290000 },
];

/* ------------------------------------------------------------------ */
/*  TRAJECTORY RIBBON  — the signature element                         */
/* ------------------------------------------------------------------ */
function Ribbon({ series, lo, hi, w = 108, h = 26 }) {
  const pts = series.map((v, i) => ({ v, i })).filter((p) => p.v != null);
  if (pts.length < 2) return <div style={{ width: w, height: h }} />;

  const span = hi - lo || 1;
  const x = (i) => (i / (series.length - 1)) * w;
  const y = (v) => h - ((v - lo) / span) * h;

  const first = pts[0].v;
  const last = pts[pts.length - 1].v;
  const dir = last - first;
  const color = dir > 0.75 ? C.up : dir < -0.75 ? C.down : C.muted;

  const line = pts.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const base = y(first);
  const area = `${line} L${x(pts[pts.length - 1].i).toFixed(1)},${base.toFixed(1)} L${x(pts[0].i).toFixed(1)},${base.toFixed(1)} Z`;

  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <line x1="0" y1={base} x2={w} y2={base} stroke={C.dim} strokeWidth="1" strokeDasharray="2 3" />
      <path d={area} fill={color} opacity="0.16" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(pts[pts.length - 1].i)} cy={y(last)} r="2.4" fill={color} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  SMALL PARTS                                                        */
/* ------------------------------------------------------------------ */
const Label = ({ children, style }) => (
  <div style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted, ...style }}>
    {children}
  </div>
);

function Delta({ v, suffix = "pp" }) {
  if (v == null) return <span style={{ color: C.dim }}>—</span>;
  const col = v > 0.5 ? C.up : v < -0.5 ? C.down : C.muted;
  return (
    <span style={{ color: col, fontFamily: MONO, fontSize: 12 }}>
      {v > 0 ? "+" : ""}{v.toFixed(1)}{suffix}
    </span>
  );
}

function PowerBar({ v }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 46, height: 4, background: C.rule, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${v}%`, height: "100%", background: v >= 70 ? C.up : v >= 50 ? C.amber : C.down }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, width: 18 }}>{v}</span>
    </div>
  );
}

function Btn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 transition-colors"
      style={{
        fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase",
        background: active ? C.ink : "transparent",
        color: active ? C.canvas : C.muted,
        border: `1px solid ${active ? C.ink : C.rule}`,
        borderRadius: 2, cursor: "pointer", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  INFERENCE ECONOMICS  — modeled, not reported                       */
/* ------------------------------------------------------------------ */
function Slider({ label, help, value, set, min, max, step, fmt, accent }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex justify-between items-baseline">
        <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: accent || C.amber }}>{fmt(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => set(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: accent || C.amber, marginTop: 5, cursor: "pointer" }}
      />
      {help && (
        <div style={{ fontFamily: SANS, fontSize: 10.5, color: C.dim, lineHeight: 1.5, marginTop: 3 }}>{help}</div>
      )}
    </div>
  );
}

function MarginBar({ label, value, base, sub }) {
  const delta = value - base;
  const col = Math.abs(delta) < 0.15 ? C.muted : delta > 0 ? C.up : C.down;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="flex justify-between items-baseline" style={{ marginBottom: 4 }}>
        <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13 }}>
          {value.toFixed(1)}%{" "}
          <span style={{ color: col, fontSize: 11 }}>
            ({delta >= 0 ? "+" : ""}{delta.toFixed(1)}pp)
          </span>
        </span>
      </div>
      <div style={{ height: 16, background: C.canvas, border: `1px solid ${C.rule}`, borderRadius: 2, position: "relative", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: col, opacity: 0.4 }} />
        <div style={{ position: "absolute", left: `${Math.max(0, Math.min(100, base))}%`, top: 0, bottom: 0, width: 1, background: C.ink, opacity: 0.75 }} />
      </div>
      {sub && <div style={{ fontFamily: SANS, fontSize: 10, color: C.dim, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

const PRESETS = {
  bundled: { label: "Bundled into renewals", rev: 12000, queries: 2000, tokens: 4000, cost: 3, attach: 40, uplift: 0, baseGM: 80, cache: 0, route: 0, commit: 0 },
  priced:  { label: "Priced SKU, optimized", rev: 12000, queries: 2000, tokens: 4000, cost: 3, attach: 40, uplift: 15, baseGM: 80, cache: 45, route: 60, commit: 25 },
  heavy:   { label: "Reasoning-heavy agent",  rev: 12000, queries: 2000, tokens: 25000, cost: 3, attach: 60, uplift: 10, baseGM: 80, cache: 20, route: 20, commit: 15 },
};

function InferenceSim() {
  const [s, setS] = useState(PRESETS.bundled);
  const up = (k) => (v) => setS((p) => ({ ...p, [k]: v }));

  const tokensYr = s.queries * 12 * s.tokens;
  const rawCogs = (tokensYr / 1e6) * s.cost;
  const afterCache = rawCogs * (1 - s.cache / 100);
  const blend = (1 - s.route / 100) + (s.route / 100) * 0.10;
  const afterRoute = afterCache * blend;
  const aiCogs = afterRoute * (1 - s.commit / 100);

  const C0 = s.rev * (1 - s.baseGM / 100);
  const a = s.attach / 100;
  const u = s.uplift / 100;

  const gmBase = s.baseGM;
  const gmNoLevers = 100 * (1 - (C0 + a * rawCogs) / s.rev);
  const gmLevers = 100 * (1 - (C0 + a * aiCogs) / s.rev);
  const gmFinal = 100 * (1 - (C0 + a * aiCogs) / (s.rev * (1 + a * u)));
  const breakeven = (aiCogs / C0) * 100;
  const accretive = gmFinal >= gmBase - 0.05;

  const P = ({ k }) => (
    <Btn active={s.label === PRESETS[k].label} onClick={() => setS(PRESETS[k])}>{PRESETS[k].label}</Btn>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Label>Start from</Label>
        <P k="bundled" /><P k="priced" /><P k="heavy" />
      </div>

      <div className="ai-sim-grid">

        {/* inputs */}
        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 2, padding: 14 }}>
          <Label style={{ color: C.blue, marginBottom: 12 }}>1 · The business as it is</Label>
          <Slider label="Revenue per customer / year" value={s.rev} set={up("rev")} min={1000} max={100000} step={1000}
            fmt={(v) => `$${v.toLocaleString()}`} accent={C.blue}
            help="What one customer pays you annually today." />
          <Slider label="Gross margin before AI" value={s.baseGM} set={up("baseGM")} min={40} max={95} step={1}
            fmt={(v) => `${v}%`} accent={C.blue}
            help="Revenue minus hosting, support and delivery cost. Software typically 75-90%." />
          <Slider label="Customers using the AI feature" value={s.attach} set={up("attach")} min={0} max={100} step={5}
            fmt={(v) => `${v}%`} accent={C.blue}
            help="Attach rate. Only these customers generate inference cost." />
          <Slider label="Price increase for AI" value={s.uplift} set={up("uplift")} min={0} max={60} step={1}
            fmt={(v) => `+${v}%`} accent={C.blue}
            help="Extra revenue charged for AI, as a percent of the base subscription. Zero means you bundled it in for free." />
        </div>

        {/* cost drivers + levers */}
        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 2, padding: 14 }}>
          <Label style={{ color: C.down, marginBottom: 12 }}>2 · What the AI costs you</Label>
          <Slider label="AI queries per customer / month" value={s.queries} set={up("queries")} min={0} max={20000} step={100}
            fmt={(v) => v.toLocaleString()} accent={C.down}
            help="How often a customer actually uses the feature." />
          <Slider label="Tokens per query" value={s.tokens} set={up("tokens")} min={500} max={60000} step={500}
            fmt={(v) => v.toLocaleString()} accent={C.down}
            help="Input plus output. A short answer is ~2,000. A reasoning model working through a problem can be 20,000+." />
          <Slider label="Cost per 1M tokens" value={s.cost} set={up("cost")} min={0.1} max={20} step={0.1}
            fmt={(v) => `$${v.toFixed(2)}`} accent={C.down}
            help="Your blended rate. Retail API pricing sits higher than negotiated capacity." />

          <div style={{ borderTop: `1px solid ${C.rule}`, margin: "14px 0 12px" }} />
          <Label style={{ color: C.up, marginBottom: 12 }}>3 · Levers that claw margin back</Label>
          <Slider label="Cache hit rate" value={s.cache} set={up("cache")} min={0} max={90} step={5}
            fmt={(v) => `${v}%`} accent={C.up}
            help="Share of queries answered from stored results instead of fresh compute. Repetitive workloads cache well." />
          <Slider label="Routed to a small model" value={s.route} set={up("route")} min={0} max={95} step={5}
            fmt={(v) => `${v}%`} accent={C.up}
            help="Send easy queries to a cheap model, escalate only hard ones. Assumes the small model costs 10% as much." />
          <Slider label="Committed capacity discount" value={s.commit} set={up("commit")} min={0} max={60} step={5}
            fmt={(v) => `${v}%`} accent={C.up}
            help="Volume or reserved-capacity pricing instead of paying retail rates." />
        </div>

        {/* results */}
        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderLeft: `2px solid ${accretive ? C.up : C.down}`, borderRadius: 2, padding: 14 }}>
          <Label style={{ color: C.amber, marginBottom: 12 }}>4 · What happens to gross margin</Label>

          <MarginBar label="Before AI" value={gmBase} base={gmBase} sub="Your starting point. The white line marks it on every bar below." />
          <MarginBar label="AI added, nothing optimized, no price change" value={gmNoLevers} base={gmBase} sub="Where most enterprise software sits today." />
          <MarginBar label="After engineering levers" value={gmLevers} base={gmBase} sub="Caching, model routing and committed capacity applied." />
          <MarginBar label="After the price increase too" value={gmFinal} base={gmBase} sub="The full picture, including what you charge for AI." />

          <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: 12, paddingTop: 12 }}>
            <div className="flex flex-wrap gap-5">
              <div>
                <Label>AI cost per user / year</Label>
                <div style={{ fontFamily: MONO, fontSize: 16, marginTop: 3 }}>${aiCogs.toFixed(0)}</div>
                <div style={{ fontFamily: SANS, fontSize: 10, color: C.dim }}>was ${rawCogs.toFixed(0)} before levers</div>
              </div>
              <div>
                <Label>Price rise needed to break even</Label>
                <div style={{ fontFamily: MONO, fontSize: 16, marginTop: 3, color: breakeven > s.uplift ? C.down : C.up }}>
                  +{breakeven.toFixed(1)}%
                </div>
                <div style={{ fontFamily: SANS, fontSize: 10, color: C.dim }}>you are charging +{s.uplift}%</div>
              </div>
            </div>
            <div style={{ marginTop: 12, padding: "8px 10px", background: C.canvas, border: `1px solid ${accretive ? C.up : C.down}`, borderRadius: 2 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: accretive ? C.up : C.down }}>
                {accretive ? "ACCRETIVE" : "DILUTIVE"}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.muted, marginLeft: 8 }}>
                {accretive
                  ? "The AI feature pays for its own compute and then some."
                  : `Every AI customer costs more than they pay. Gross margin falls ${(gmBase - gmFinal).toFixed(1)}pp.`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.muted, marginTop: 14, lineHeight: 1.7, maxWidth: 1000 }}>
        <strong style={{ color: C.ink }}>How to read this.</strong> Gross margin is what is left of a dollar of revenue after the cost of
        delivering the product. Traditional software has almost no cost per extra user, which is why margins sit near 80%. AI changes that,
        because every query burns compute that someone has to pay for. Move the sliders in panel 2 up and watch the third bar fall. Then use
        panel 3 to see how much engineering can recover, and the price slider in panel 1 to see how much of the rest pricing has to cover.
        The headline finding is usually the same: engineering alone rarely closes the gap, and the price increase needed is often smaller than
        people fear.
      </div>
    </div>
  );
}

function AIEconomics() {
  const revenue = [
    { t: "Separately priced SKU", d: "AI sold as its own line item with its own price.",
      sig: "New revenue line; NRR rises; gross margin holds if priced above compute cost.",
      ex: "Cleanest to measure. The price can be set against the cost directly." },
    { t: "Attach to an existing tier", d: "AI raises the price of a package customers already buy.",
      sig: "Average selling price and NRR rise; no new SKU appears in disclosures.",
      ex: "Common in suite businesses, where the packaging ladder does the monetizing." },
    { t: "Included to defend renewals", d: "AI added at no additional charge to protect the installed base.",
      sig: "Revenue flat, gross retention protected, gross margin absorbs the compute.",
      ex: "Rational when churn is the live risk. The cost is real and the revenue offset is indirect." },
    { t: "Displacing legacy revenue", d: "The AI product replaces an older product customers were already paying for.",
      sig: "Mix shifts; headline growth understates adoption; blended margin moves toward the new product's.",
      ex: "The net effect depends entirely on whether the new margin is above or below the old." },
  ];
  const cost = [
    { t: "Cost of revenue", d: "Inference is bought from a provider and consumed per query.",
      sig: "Gross margin reflects it in the same period.", c: C.blue },
    { t: "Capital expenditure", d: "Compute is owned or leased as infrastructure.",
      sig: "Gross margin stays steady; free cash flow carries the investment.", c: C.amber },
    { t: "Research and development", d: "Compute supports development work ahead of general availability.",
      sig: "Neither margin moves yet; treatment typically shifts toward cost of revenue at launch.", c: C.up },
  ];
  const grid = [
    { r: "Priced", c: "Rented", o: "Accretive if price clears cost", n: "Margin visible and controllable. The clearest position to manage from.", col: C.up },
    { r: "Priced", c: "Owned",  o: "Accretive with a cash lag",      n: "Gross margin looks strong while cash flow absorbs the build.", col: C.up },
    { r: "Included", c: "Rented", o: "Dilutive by design",           n: "A deliberate trade of margin for retention. Worth naming as such.", col: C.down },
    { r: "Included", c: "Owned",  o: "Dilutive to cash",             n: "Investment ahead of monetization. Sustainable only with scale or patience.", col: C.down },
  ];
  const looks = [
    "Is AI disclosed as a distinct SKU, a tier uplift, or not separately at all?",
    "Has gross margin moved since AI features became generally available, and in which direction?",
    "Has capital expenditure or purchase commitments for compute grown as a share of revenue?",
    "Has net revenue retention moved, and does management attribute any of it to AI?",
    "Is management guiding to margin recovery, and on what mechanism: price, packaging, or efficiency?",
  ];
  const Card = ({ title, body, sig, extra, color }) => (
    <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderTop: `2px solid ${color || C.rule}`, borderRadius: 2, padding: 13 }}>
      <div style={{ fontFamily: MONO, fontSize: 13.5, color: color || C.ink, marginBottom: 7, lineHeight: 1.35 }}>{title}</div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: C.ink, lineHeight: 1.55, marginBottom: 7 }}>{body}</div>
      <Label>What it looks like</Label>
      <div style={{ fontFamily: SANS, fontSize: 11.5, color: C.muted, lineHeight: 1.55, marginTop: 3 }}>{sig}</div>
      {extra && <div style={{ fontFamily: SANS, fontSize: 11, color: C.dim, lineHeight: 1.5, marginTop: 6 }}>{extra}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: C.muted, lineHeight: 1.7, maxWidth: 960, marginBottom: 18 }}>
        Whether an AI product adds to or subtracts from the bottom line comes down to two independent choices: how it is monetized, and how its
        compute is accounted for. All of the options below are legitimate and each suits different circumstances. The point of the framework is to
        read which combination a company has chosen, and what that implies about the numbers you are looking at. Companies do not report inference
        cost separately, so this is a way of interpreting disclosures rather than a set of measurements.
      </div>

      <Label style={{ color: C.amber, marginBottom: 10 }}>1 · How the revenue shows up</Label>
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {revenue.map((r) => <Card key={r.t} title={r.t} body={r.d} sig={r.sig} extra={r.ex} color={C.blue} />)}
      </div>

      <Label style={{ color: C.amber, marginBottom: 10 }}>2 · Where the compute cost is recognized</Label>
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {cost.map((r) => <Card key={r.t} title={r.t} body={r.d} sig={r.sig} color={r.c} />)}
      </div>

      <Label style={{ color: C.amber, marginBottom: 10 }}>3 · The four combinations</Label>
      <div style={{ border: `1px solid ${C.rule}`, borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Monetization", "Compute", "Likely effect on the bottom line", "Reading"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontFamily: SANS, fontSize: 9,
                  letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, fontWeight: 400,
                  borderBottom: `1px solid ${C.rule}`, background: C.panel }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((g, i) => (
              <tr key={i} style={{ background: i % 2 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <td style={{ padding: "9px 12px", fontFamily: MONO, fontSize: 12, borderBottom: `1px solid ${C.rule}` }}>{g.r}</td>
                <td style={{ padding: "9px 12px", fontFamily: MONO, fontSize: 12, borderBottom: `1px solid ${C.rule}` }}>{g.c}</td>
                <td style={{ padding: "9px 12px", fontFamily: MONO, fontSize: 12, color: g.col, borderBottom: `1px solid ${C.rule}` }}>{g.o}</td>
                <td style={{ padding: "9px 12px", fontFamily: SANS, fontSize: 11.5, color: C.muted, borderBottom: `1px solid ${C.rule}`, lineHeight: 1.5 }}>{g.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Label style={{ color: C.amber, marginBottom: 10 }}>4 · Questions the disclosures can answer</Label>
      <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 2, padding: 14 }}>
        {looks.map((l, i) => (
          <div key={i} className="flex gap-3" style={{ marginBottom: i === looks.length - 1 ? 0 : 9 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.dim, minWidth: 16 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: SANS, fontSize: 12.5, color: C.ink, lineHeight: 1.55 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TEN YEAR COHORT VIEW                                               */
/* ------------------------------------------------------------------ */
function median(arr) {
  const a = arr.filter((v) => v != null).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : +((a[m - 1] + a[m]) / 2).toFixed(1);
}

function Cohort({ companies }) {
  const rows = YEARS.map((y, i) => ({
    year: y,
    growth: median(companies.map((c) => c.growth[i])),
    fcf: median(companies.map((c) => c.fcf[i])),
    gm: median(companies.map((c) => c.gm[i])),
    n: companies.filter((c) => c.rev[i] != null).length,
  }));

  const newlyListed = YEARS.map((y, i) => ({
    year: y,
    count: companies.filter((c) => c.firstYear === y).length,
  }));

  const cards = [
    {
      t: "The cash flow flip is the decade's real story",
      b: "In the back half of the 2010s the median company in this group burned cash or barely broke even, and that was considered correct: capital was cheap and growth was the only scoreboard. After 2022 the median FCF margin turned solidly positive and kept climbing. Nothing about the products changed. The cost of capital did.",
    },
    {
      t: "Rule of 40 is made of completely different stuff now",
      b: "Look at the two stacked bars. Around 2018 a company hit 40 with roughly 35 points of growth and 5 of cash. By 2025 it hits a similar number with roughly 15 of growth and 25 of cash. Same score, opposite business. Any benchmark that treats the two as equivalent is missing the point.",
    },
    {
      t: "Gross margin is the flattest line in software",
      b: "Across ten years, a repricing of the entire sector, a pandemic, and the arrival of AI, the median gross margin moved within a narrow band. It is close to a physical constant of the industry, which is exactly why small moves in it, like Yext's recent give-back, carry more information than they appear to.",
    },
    {
      t: "The listing wave, and the window slamming shut",
      b: "Watch the newly listed bars cluster in 2019 to 2021, then collapse. Most of the AI-era software companies you can invest in came public in a three-year window. The cohort also shrank afterward through take-privates and acquisitions, which is invisible here because delisted names were excluded.",
    },
    {
      t: "The subscription J-curve, and why patience paid",
      b: "Select ADSK on the trends tab. Revenue stalls, cash flow goes deeply negative, then both compound for years afterward. Autodesk's gross margin climbed from the mid-eighties to 92% across the transition. Model changes look like deterioration for two years and like a moat for the following eight.",
    },
    {
      t: "Growth deceleration is close to universal",
      b: "Almost no company in this set grows faster now than it did five years ago. Some of that is the arithmetic of a larger base, some is market maturity, and some is that the 2020 to 2021 numbers were inflated by a demand pull-forward that never repeated. Beware any comparison anchored to those two years.",
    },
  ];

  return (
    <div>
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <div style={{ border: `1px solid ${C.rule}`, borderRadius: 2, padding: 14 }}>
          <Label>Median revenue growth and median FCF margin, stacked · the composition of Rule of 40</Label>
          <div style={{ height: 260, marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} margin={{ top: 6, right: 8, bottom: 4, left: -14 }}>
                <CartesianGrid stroke={C.rule} strokeDasharray="2 4" />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10.5, fontFamily: MONO }} stroke={C.rule} />
                <YAxis tick={{ fill: C.muted, fontSize: 10.5, fontFamily: MONO }} stroke={C.rule} />
                <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.rule}`, fontFamily: MONO, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontFamily: SANS, fontSize: 11 }} />
                <ReferenceLine y={40} stroke={C.amber} strokeDasharray="4 4" />
                <Bar dataKey="growth" name="Growth %" stackId="a" fill={C.blue} fillOpacity={0.75} />
                <Bar dataKey="fcf" name="FCF margin %" stackId="a" fill={C.up} fillOpacity={0.75} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: C.dim, marginTop: 6, lineHeight: 1.6 }}>
            Blue is growth, green is cash generation. The amber line is 40. Watch the mix invert across the decade.
          </div>
        </div>

        <div style={{ border: `1px solid ${C.rule}`, borderRadius: 2, padding: 14 }}>
          <Label>Median gross margin · the constant</Label>
          <div style={{ height: 118, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: -14 }}>
                <CartesianGrid stroke={C.rule} strokeDasharray="2 4" />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10, fontFamily: MONO }} stroke={C.rule} />
                <YAxis domain={[50, 95]} tick={{ fill: C.muted, fontSize: 10, fontFamily: MONO }} stroke={C.rule} />
                <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.rule}`, fontFamily: MONO, fontSize: 11 }} />
                <Line type="monotone" dataKey="gm" stroke={C.amber} strokeWidth={2.4} dot={{ r: 2.5 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: 10, paddingTop: 10 }} />
          <Label>Companies first appearing each year · the listing wave</Label>
          <div style={{ height: 110, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newlyListed} margin={{ top: 6, right: 8, bottom: 0, left: -14 }}>
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10, fontFamily: MONO }} stroke={C.rule} />
                <YAxis tick={{ fill: C.muted, fontSize: 10, fontFamily: MONO }} stroke={C.rule} />
                <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.rule}`, fontFamily: MONO, fontSize: 11 }} />
                <Bar dataKey="count" name="First year in data" fill={C.blue} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {cards.map((c) => (
          <div key={c.t} style={{ background: C.panel, border: `1px solid ${C.rule}`, borderLeft: `2px solid ${C.amber}`, borderRadius: 2, padding: 14 }}>
            <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.ink, marginBottom: 7, lineHeight: 1.4 }}>{c.t}</div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{c.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN                                                               */
/* ------------------------------------------------------------------ */
export default function SoftwareTearsheet() {
  const [view, setView] = useState("table");
  const [metric, setMetric] = useState("gm");
  const [year, setYear] = useState(4);
  const [cat, setCat] = useState("All");
  const [size, setSize] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "revLatest", dir: -1 });
  const [sel, setSel] = useState(null);
  const [compare, setCompare] = useState(["ADSK", "MSFT", "ZM", "SNOW", "U"]);

  const M = METRICS.find((m) => m.key === metric);

  const rows = useMemo(() => {
    let r = COMPANIES.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (size !== "all" && c.tier !== size) return false;
      if (q && !(`${c.name} ${c.ticker}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
    const k = sort.key;
    r = [...r].sort((a, b) => {
      const av = a[k] ?? -Infinity, bv = b[k] ?? -Infinity;
      return av === bv ? 0 : (av > bv ? 1 : -1) * sort.dir;
    });
    return r;
  }, [cat, size, q, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: -1 }));

  const scatterData = rows
    .filter((c) => c.growthLatest != null)
    .map((c) => ({
      x: c.growthLatest, y: c.fcfLatest, z: Math.sqrt(c.revLatest),
      name: c.name, ticker: c.ticker, rev: c.revLatest,
      tier: c.tier,
    }));

  const trendData = YEARS.map((yr, i) => {
    const o = { year: yr };
    compare.forEach((t) => {
      const c = COMPANIES.find((x) => x.ticker === t);
      if (c) o[t] = c[metric === "growth" ? "growth" : metric][i];
    });
    return o;
  });

  const selC = sel ? COMPANIES.find((c) => c.ticker === sel) : null;

  const TH = ({ k, children, align = "right", w }) => (
    <th
      onClick={() => toggleSort(k)}
      className="py-2 px-2 cursor-pointer select-none"
      style={{
        textAlign: align, fontFamily: SANS, fontSize: 9, letterSpacing: "0.14em",
        textTransform: "uppercase", color: sort.key === k ? C.amber : C.muted,
        fontWeight: 400, borderBottom: `1px solid ${C.rule}`, whiteSpace: "nowrap", width: w,
        position: "sticky", top: 0, background: C.canvas, zIndex: 2,
      }}
    >
      {children}{sort.key === k ? (sort.dir === -1 ? " ↓" : " ↑") : ""}
    </th>
  );

  return (
    <div style={{ background: C.canvas, color: C.ink, minHeight: "100vh", fontFamily: SANS }}>
      <div className="max-w-full mx-auto px-5 py-5">

        {/* MASTHEAD */}
        <div className="flex flex-wrap items-end justify-between gap-3 pb-4" style={{ borderBottom: `1px solid ${C.rule}` }}>
          <div>
            <Label style={{ color: C.amber }}>Software equity tearsheet · FY2016 – FY2025</Label>
            <h1 style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "-0.02em", marginTop: 6, fontWeight: 500 }}>
              Margin trajectory &amp; pricing power
            </h1>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, textAlign: "right", lineHeight: 1.7 }}>
            <div>{COMPANIES.length} companies · {CATEGORIES.length - 1} categories · 10 years</div>
            <div style={{ color: C.dim }}>Fiscal years aligned to nearest calendar year</div>
          </div>
        </div>

        {/* PROVENANCE */}
        <div className="mt-3 mb-4 px-3 py-2" style={{ background: C.panel, border: `1px solid ${C.rule}`, borderLeft: `2px solid ${C.amber}`, borderRadius: 2 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
            <span style={{ color: C.amber }}>Data provenance and disclaimer.</span> Figures are approximations, rounded and fiscal-year aligned,
            assembled for pattern illustration rather than precision. Recent years include estimates for companies whose fiscal year had not closed.
            Directionally useful for reading trends; not filing-grade. Verify against 10-K/10-Q filings before relying on any number.
            This is an independent analytical exercise, not investment advice, not a recommendation to buy or sell any security, and not affiliated
            with or endorsed by any company shown. Views are the author's own.
          </span>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex flex-wrap gap-1">
            {[["table","Table"],["cohort","10-year cohort"],["quadrant","Rule of 40"],["trend","Trends"],["ai","AI margin math"]].map(([k,l]) => (
              <Btn key={k} active={view===k} onClick={()=>setView(k)}>{l}</Btn>
            ))}
          </div>
          {view !== "ai" && view !== "cohort" && (
            <>
              <div style={{ width: 1, height: 20, background: C.rule }} />
              <div className="flex items-center gap-2">
                <Label>Metric</Label>
                <div className="flex flex-wrap gap-1">
                  {METRICS.map((m) => (
                    <Btn key={m.key} active={metric===m.key} onClick={()=>setMetric(m.key)}>{m.label}</Btn>
                  ))}
                </div>
              </div>
              <div style={{ width: 1, height: 20, background: C.rule }} />
              <div className="flex items-center gap-2">
                <Label>Year</Label>
                <div className="flex flex-wrap gap-1">
                  {YEARS.map((y, i) => (
                    <Btn key={y} active={year===i} onClick={()=>setYear(i)}>{`'${String(y).slice(2)}`}</Btn>
                  ))}
                </div>
              </div>
            </>
          )}
          <div style={{ width: 1, height: 20, background: C.rule }} />
          <div className="flex flex-wrap gap-1">
            <Label style={{ alignSelf: "center", marginRight: 4 }}>Size by revenue</Label>
            <Btn active={size==="all"} onClick={()=>setSize("all")}>All</Btn>
            {SIZE_TIERS.map((t) => (
              <Btn key={t.key} active={size===t.key} onClick={()=>setSize(t.key)}>{t.label}</Btn>
            ))}
          </div>
          <select
            value={cat} onChange={(e)=>setCat(e.target.value)}
            style={{ background: C.panel, color: C.ink, border: `1px solid ${C.rule}`, borderRadius: 2,
              fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 8px" }}
          >
            {CATEGORIES.map((c)=><option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search"
            style={{ background: C.panel, color: C.ink, border: `1px solid ${C.rule}`, borderRadius: 2,
              fontFamily: MONO, fontSize: 12, padding: "5px 10px", width: 130, outline: "none" }}
          />
        </div>

        {/* ---------------- TABLE ---------------- */}
        {view === "table" && (
          <div style={{ overflowX: "auto", maxHeight: "68vh", border: `1px solid ${C.rule}`, borderRadius: 2 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <TH k="name" align="left" w={210}>Company</TH>
                  <TH k="revLatest">Rev FY{String(YEARS[year]).slice(2)} $M</TH>
                  <TH k="growthLatest">Growth</TH>
                  <TH k="gmLatest">Gross mgn</TH>
                  <TH k="fcfLatest">FCF mgn</TH>
                  <TH k="rule40">Rule of 40</TH>
                  <TH k="nrr">NRR</TH>
                  <TH k="gmDelta">GM Δ life</TH>
                  <TH k="fcfDelta">FCF Δ life</TH>
                  <th className="py-2 px-2" style={{ textAlign: "left", fontFamily: SANS, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, fontWeight: 400, borderBottom: `1px solid ${C.rule}`, position: "sticky", top: 0, background: C.canvas, zIndex: 2, whiteSpace: "nowrap" }}>
                    {M.label} path
                  </th>
                  <TH k="power" align="left">Pricing power</TH>
                </tr>
              </thead>
              <tbody>
                {rows.map((c, idx) => {
                  const stripe = tierColor(c.tier);
                  const series = c[metric === "growth" ? "growth" : metric];
                  return (
                    <tr
                      key={c.ticker}
                      onClick={() => setSel(c.ticker === sel ? null : c.ticker)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: sel === c.ticker ? C.panel2 : idx % 2 ? "rgba(255,255,255,0.012)" : "transparent",
                        borderLeft: `2px solid ${stripe}`,
                      }}
                    >
                      <td className="py-1.5 px-2" style={{ borderBottom: `1px solid ${C.rule}` }}>
                        <div className="flex items-baseline gap-2">
                          <span style={{ fontFamily: MONO, fontSize: 11, color: C.dim, width: 42 }}>{c.ticker}</span>
                          <span style={{ fontFamily: SANS, fontSize: 12.5 }}>{c.name}</span>
                        </div>
                        <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim, marginLeft: 50 }}>{c.category}</div>
                      </td>
                      <td className="py-1.5 px-2 text-right" style={{ fontFamily: MONO, fontSize: 12, borderBottom: `1px solid ${C.rule}` }}>
                        {c.rev[year] != null ? c.rev[year].toLocaleString() : "—"}
                      </td>
                      <td className="py-1.5 px-2 text-right" style={{ fontFamily: MONO, fontSize: 12, borderBottom: `1px solid ${C.rule}`,
                        color: c.growth[year] == null ? C.dim : c.growth[year] > 20 ? C.up : c.growth[year] < 5 ? C.down : C.ink }}>
                        {c.growth[year] != null ? `${c.growth[year]}%` : "—"}
                      </td>
                      <td className="py-1.5 px-2 text-right" style={{ fontFamily: MONO, fontSize: 12, borderBottom: `1px solid ${C.rule}` }}>
                        {c.gm[year] != null ? `${c.gm[year]}%` : "—"}
                      </td>
                      <td className="py-1.5 px-2 text-right" style={{ fontFamily: MONO, fontSize: 12, borderBottom: `1px solid ${C.rule}`,
                        color: c.fcf[year] == null ? C.dim : c.fcf[year] < 0 ? C.down : C.ink }}>
                        {c.fcf[year] != null ? `${c.fcf[year]}%` : "—"}
                      </td>
                      <td className="py-1.5 px-2 text-right" style={{ fontFamily: MONO, fontSize: 12, borderBottom: `1px solid ${C.rule}`,
                        color: c.rule40 >= 40 ? C.up : c.rule40 >= 25 ? C.ink : C.down }}>
                        {c.rule40}
                      </td>
                      <td className="py-1.5 px-2 text-right" style={{ fontFamily: MONO, fontSize: 12, borderBottom: `1px solid ${C.rule}`, color: c.nrr == null ? C.dim : c.nrr >= 115 ? C.up : c.nrr < 100 ? C.down : C.ink }}>
                        {c.nrr != null ? `${c.nrr}%` : "—"}
                      </td>
                      <td className="py-1.5 px-2 text-right" style={{ borderBottom: `1px solid ${C.rule}` }}><Delta v={c.gmDelta} /></td>
                      <td className="py-1.5 px-2 text-right" style={{ borderBottom: `1px solid ${C.rule}` }}><Delta v={c.fcfDelta} /></td>
                      <td className="py-1.5 px-2" style={{ borderBottom: `1px solid ${C.rule}` }}>
                        <Ribbon series={series} lo={M.lo} hi={M.hi} />
                      </td>
                      <td className="py-1.5 px-2" style={{ borderBottom: `1px solid ${C.rule}` }}><PowerBar v={c.power} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- QUADRANT ---------------- */}
        {view === "quadrant" && (
          <div style={{ border: `1px solid ${C.rule}`, borderRadius: 2, padding: 16 }}>
            <div className="flex justify-between items-baseline mb-3">
              <Label>Revenue growth vs FCF margin · FY2025 · bubble = revenue scale</Label>
              <Label style={{ color: C.amber }}>Diagonal = Rule of 40</Label>
            </div>
            <div style={{ height: 460 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 24, bottom: 34, left: 8 }}>
                  <CartesianGrid stroke={C.rule} strokeDasharray="2 4" />
                  <XAxis type="number" dataKey="x" domain={[-10, 60]} tick={{ fill: C.muted, fontSize: 11, fontFamily: MONO }} stroke={C.rule}
                    label={{ value: "Revenue growth %", position: "insideBottom", offset: -18, fill: C.muted, fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" domain={[-20, 50]} tick={{ fill: C.muted, fontSize: 11, fontFamily: MONO }} stroke={C.rule}
                    label={{ value: "FCF margin %", angle: -90, position: "insideLeft", fill: C.muted, fontSize: 11 }} />
                  <ZAxis type="number" dataKey="z" range={[30, 620]} />
                  <ReferenceLine segment={[{ x: -10, y: 50 }, { x: 60, y: -20 }]} stroke={C.amber} strokeDasharray="4 4" />
                  <ReferenceLine y={0} stroke={C.dim} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3", stroke: C.dim }}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: C.panel, border: `1px solid ${C.rule}`, padding: "8px 10px", borderRadius: 2, fontFamily: MONO, fontSize: 11.5 }}>
                          <div style={{ color: C.ink, marginBottom: 3 }}>{d.name} <span style={{ color: C.dim }}>{d.ticker}</span></div>
                          <div style={{ color: C.muted }}>growth {d.x}% · fcf {d.y}%</div>
                          <div style={{ color: C.muted }}>rule of 40 · {(d.x + d.y).toFixed(0)}</div>
                          <div style={{ color: C.dim }}>rev ${d.rev.toLocaleString()}M</div>
                        </div>
                      );
                    }}
                  />
                  {SIZE_TIERS.map((t) => (
                    <Scatter key={t.key} name={t.label} data={scatterData.filter((d) => d.tier === t.key)}
                      fill={t.color} fillOpacity={0.7} />
                  ))}
                  <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 11 }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.7 }}>
              Above the amber diagonal is the durable zone. Colour marks revenue scale. Note the two distinct clusters:
              high-growth/low-cash companies to the lower right, and low-growth/high-cash mature companies to the upper left.
              Very few sit in the top right, and those that do command the sector's highest multiples.
            </div>
          </div>
        )}

        {/* ---------------- TREND ---------------- */}
        {view === "trend" && (
          <div style={{ border: `1px solid ${C.rule}`, borderRadius: 2, padding: 16 }}>
            <div className="flex flex-wrap gap-1 mb-3">
              <Label style={{ marginRight: 8, alignSelf: "center" }}>Compare</Label>
              {COMPANIES.map((c) => (
                <button key={c.ticker}
                  onClick={() => setCompare((p) => p.includes(c.ticker) ? p.filter((t)=>t!==c.ticker) : p.length < 7 ? [...p, c.ticker] : p)}
                  style={{ fontFamily: MONO, fontSize: 10, padding: "2px 6px", borderRadius: 2, cursor: "pointer",
                    border: `1px solid ${compare.includes(c.ticker) ? C.amber : C.rule}`,
                    background: compare.includes(c.ticker) ? "rgba(242,193,78,0.12)" : "transparent",
                    color: compare.includes(c.ticker) ? C.amber : C.dim }}>
                  {c.ticker}
                </button>
              ))}
            </div>
            <div style={{ height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid stroke={C.rule} strokeDasharray="2 4" />
                  <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11, fontFamily: MONO }} stroke={C.rule} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11, fontFamily: MONO }} stroke={C.rule}
                    label={{ value: `${M.label} (${M.unit})`, angle: -90, position: "insideLeft", fill: C.muted, fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: 2, fontFamily: MONO, fontSize: 11.5 }}
                    labelStyle={{ color: C.ink }} />
                  <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 11 }} />
                  {compare.map((t, i) => (
                    <Line key={t} type="monotone" dataKey={t} stroke={[C.amber, C.up, C.blue, C.down, C.ink, "#B58BD1", "#8FD46F"][i % 7]}
                      strokeWidth={1.9} dot={{ r: 2 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ---------------- COHORT ---------------- */}
        {view === "cohort" && (
          <div>
            <div className="mb-4 px-3 py-2" style={{ background: C.panel, border: `1px solid ${C.rule}`, borderLeft: `2px solid ${C.blue}`, borderRadius: 2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                <span style={{ color: C.blue }}>Reading note.</span> Medians, not averages, so a handful of giants do not distort the picture.
                Each year only counts companies that reported that year, so the early bars reflect a smaller and more mature set. Survivorship
                applies throughout: companies acquired or taken private during the decade are absent, which biases the picture upward.
              </span>
            </div>
            <Cohort companies={rows} />
          </div>
        )}

        {/* ---------------- AI MARGIN MATH ---------------- */}
        {view === "ai" && (
          <div>
            <div className="mb-4 px-3 py-2" style={{ background: C.panel, border: `1px solid ${C.rule}`, borderLeft: `2px solid ${C.blue}`, borderRadius: 2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                <span style={{ color: C.blue }}>Different kind of data.</span> Everything on this tab is a model you control, not figures from
                company filings. It is kept separate from the other tabs on purpose, so calculated numbers never sit in the same table as reported ones.
              </span>
            </div>

            <div style={{ border: `1px solid ${C.rule}`, borderRadius: 2, padding: 16, marginBottom: 16 }}>
              <div style={{ fontFamily: MONO, fontSize: 17, marginBottom: 4 }}>Does this AI feature pay for itself?</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted, marginBottom: 16, maxWidth: 800, lineHeight: 1.6 }}>
                Set up a customer, add an AI feature, and watch what happens to the margin. Every number here is arithmetic you can check by hand.
              </div>
              <InferenceSim />
            </div>

            <div style={{ border: `1px solid ${C.rule}`, borderRadius: 2, padding: 16 }}>
              <div style={{ fontFamily: MONO, fontSize: 17, marginBottom: 4 }}>Reading AI economics from the outside</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted, marginBottom: 16, maxWidth: 820, lineHeight: 1.6 }}>A framework for working out whether a company has made its AI products accretive, and how that choice surfaces in reported numbers.</div>
              <AIEconomics />
            </div>
          </div>
        )}

        {/* ---------------- DETAIL ---------------- */}
        {selC && view !== "ai" && view !== "cohort" && (
          <div className="mt-4 p-4" style={{ background: C.panel, border: `1px solid ${C.rule}`, borderLeft: `2px solid ${C.amber}`, borderRadius: 2 }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <Label style={{ color: C.amber }}>{selC.category}</Label>
                <div style={{ fontFamily: MONO, fontSize: 19, marginTop: 4 }}>
                  {selC.name} <span style={{ color: C.dim, fontSize: 14 }}>{selC.ticker}</span>
                </div>
              </div>
              <button onClick={() => setSel(null)} style={{ background: "transparent", border: `1px solid ${C.rule}`, color: C.muted, fontFamily: MONO, fontSize: 11, padding: "3px 9px", borderRadius: 2, cursor: "pointer" }}>close</button>
            </div>

            <div className="flex flex-wrap gap-6 mb-4">
              {[
                ["Revenue FY25", `$${(selC.revLatest/1000).toFixed(2)}B`],
                ["Growth", `${selC.growthLatest}%`],
                ["Gross margin", `${selC.gmLatest}%`],
                ["FCF margin", `${selC.fcfLatest}%`],
                ["Rule of 40", `${selC.rule40}`],
                ["NRR", selC.nrr ? `${selC.nrr}%` : "n/d"],
                ["Pricing power", `${selC.power}/100`],
              ].map(([l, v]) => (
                <div key={l}>
                  <Label>{l}</Label>
                  <div style={{ fontFamily: MONO, fontSize: 17, marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ height: 180 }}>
                <Label>Revenue $M</Label>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={YEARS.map((y,i)=>({ year:y, rev: selC.rev[i] }))} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                    <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 10, fontFamily: MONO }} stroke={C.rule} />
                    <YAxis tick={{ fill: C.dim, fontSize: 10, fontFamily: MONO }} stroke={C.rule} />
                    <Tooltip contentStyle={{ background: C.canvas, border: `1px solid ${C.rule}`, fontFamily: MONO, fontSize: 11 }} />
                    <Bar dataKey="rev" fill={C.blue} fillOpacity={0.55} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ height: 180 }}>
                <Label>Gross margin vs FCF margin %</Label>
                <ResponsiveContainer width="100%" height="88%">
                  <LineChart data={YEARS.map((y,i)=>({ year:y, gm: selC.gm[i], fcf: selC.fcf[i] }))} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                    <CartesianGrid stroke={C.rule} strokeDasharray="2 4" />
                    <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 10, fontFamily: MONO }} stroke={C.rule} />
                    <YAxis tick={{ fill: C.dim, fontSize: 10, fontFamily: MONO }} stroke={C.rule} />
                    <Tooltip contentStyle={{ background: C.canvas, border: `1px solid ${C.rule}`, fontFamily: MONO, fontSize: 11 }} />
                    <Line type="monotone" dataKey="gm" stroke={C.amber} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                    <Line type="monotone" dataKey="fcf" stroke={C.up} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {selC.note && (
              <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${C.rule}` }}>
                <Label>Read</Label>
                <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: C.ink, marginTop: 6, maxWidth: 900 }}>{selC.note}</p>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-5 pt-3 flex flex-wrap gap-6" style={{ borderTop: `1px solid ${C.rule}`, fontFamily: MONO, fontSize: 10.5, color: C.dim }}>
          <span><span style={{ color: C.up }}>■</span> expanding</span>
          <span><span style={{ color: C.down }}>■</span> compressing</span>
          {SIZE_TIERS.map((t) => (
            <span key={t.key}><span style={{ color: t.color }}>■</span> {t.label}</span>
          ))}
          <span>Pricing power = 0.35 gross margin + 0.25 NRR + 0.25 three-year avg growth + 0.15 gross margin trend</span>
        </div>
      </div>
    </div>
  );
}
