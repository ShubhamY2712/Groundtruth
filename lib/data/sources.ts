export type Source = {
  title: string;
  url: string;
  /** Published by Flexiple itself. */
  self?: boolean;
  /** Published by a company that sells GCC services, so it has a stake in the answer. */
  vendor?: boolean;
};

export const SOURCES = {
  S1: { title: "Zinnov–nasscom, India GCC Landscape 2026 (FY26 data, Mar 2026)", url: "https://zinnov.com/centers-of-excellence/zinnov-nasscom-india-gcc-landscape-2026-report/" },
  S2: { title: "Flexiple, India GCC statistics and city pages (Aug 2026)", url: "https://flexiple.com/gcc/statistics", self: true },
  S3: { title: "Flexiple, How to set up a GCC in India", url: "https://flexiple.com/gcc/setup", self: true },
  S4: { title: "Knight Frank Q1 2026 office rents, via Business Standard (Apr 2026)", url: "https://www.business-standard.com/industry/news/office-rents-cross-rs-100-sq-ft-in-bengaluru-ncr-amid-demand-supply-gap-126042100698_1.html" },
  S5: { title: "CRE Matrix, India Office Market Q1 CY26", url: "https://www.crematrix.com/blog/india-office-market-q1-cy26-key-trends-and-city-wise-performance/" },
  S6: { title: "GCC Explorer by AIM Research (live directory)", url: "https://gccexplorer.com" },
  S7: { title: "Astravise, The India GCC Index 2026", url: "https://astraviseservices.com/insights/the-india-gcc-index-2026-companies-cities-sectors-and-functions/" },
  S8: { title: "Ceipal, GCC Statistics 2026", url: "https://www.ceipal.com/resources/gcc-statistics", vendor: true },
  S9: { title: "Zinnov, 5 shifts defining India's GCC story in 2025", url: "https://zinnov.com/centers-of-excellence/5-shifts-defining-indias-global-capability-centers-gccs-story-in-2025-blog" },
  S10: { title: "Ceipal, New GCCs in India 2024–2026", url: "https://www.ceipal.com/resources/new-gccs-in-india-who-launched-whos-expanding-and-whos-coming-next-2024-2026", vendor: true },
  S11: { title: "CBRE via Entrepreneur India, States target 1.1 Mn GCC jobs by 2031", url: "https://india.entrepreneur.com/business-news/states-target-1-1-mn-gcc-jobs-by-2031-cbre" },
  S12: { title: "Outlook Business, Year Ender 2025: states scramble with incentives", url: "https://www.outlookbusiness.com/corporate/year-ender-2025-states-scramble-with-incentives-as-gccs-redraw-indias-technology-map" },
  S13: { title: "Deloitte tax alert, Karnataka GCC Policy 2024–29", url: "https://www2.deloitte.com/content/dam/Deloitte/in/Documents/tax/Tax%20Alerts/in-deloitte-tax-alert-karnataka-gcc-policy-new-chapter-for-gcc-sector-paving-way-for-growth-jobs-statewide-prosperity-noexp.pdf" },
  S14: { title: "KPMG flash news, Maharashtra GCC Policy 2025", url: "https://www.in.kpmg.com/taxflashnews/KPMG-Flash-News-Maharshtra-GCC-policy-2025.pdf" },
  S15: { title: "Swarajya, Tamil Nadu payroll subsidy for GCCs", url: "https://swarajyamag.com/amp/story/tamil-nadu%2Ftamil-nadu-announces-a-pli-like-scheme-but-for-global-capability-centres" },
  S16: { title: "Rödl & Partner, Gujarat GCC Policy 2025–30", url: "https://www.roedl.com/insights/india-global-capability-centers-gujarat-unveils-gcc-policy" },
  S17: { title: "Siasat, New Telangana GCC policy (Sep 2026)", url: "https://www.siasat.com/new-telangana-gcc-policy-to-focus-on-ai-space-semiconductors-3543873/" },
  S18: { title: "WeWork India, Haryana GCC policy explainer (Nov 2025)", url: "https://wework.co.in/blogs/haryana-gcc-policy/", vendor: true },
  S19: { title: "Wisemonk, Timeline to launch a GCC in India", url: "https://www.wisemonk.io/blogs/timeline-to-launch-a-gcc-in-india", vendor: true },
  S20: { title: "Wisemonk, Why GCC/GBS setups fail in India", url: "https://www.wisemonk.io/blogs/why-gcc-gbs-setups-fail-india", vendor: true },
  S21: { title: "People Matters, Infosys lands $500M Truist GCC deal (May 2026)", url: "https://www.peoplematters.in/news/business/infosys-lands-dollar500-million-gcc-deal-to-hire-4500-employees-in-hyderabad-49557" },
  S22: { title: "Deccan Chronicle, Western Union to open Hyderabad GCC (Dec 2025)", url: "https://deccanchronicle.com/southern-states/telangana/western-union-to-open-hyderabad-gcc-1923335" },
  S23: { title: "UNI, ANSR to set up 200 new GCCs in next five years", url: "https://uniindia.com/ansr-to-set-up-200-new-gccs-in-next-5-year-globally-including-india/business-economy/news/3513828.html" },
  S24: { title: "Everest Group, GCC Setup Capabilities in India PEAK Matrix 2025", url: "https://www.everestgrp.com/report/egr-2025-34-r-7666" },
  S25: { title: "Business of GCC, India GCC Report 2026", url: "https://www.businessofgcc.com/gcc-data/reports/gcc-india-report" },
  S26: { title: "Zinnov–KDEM, Mid-market GCCs in Karnataka", url: "https://zinnov.com/press-releases/mid-market-gccs-in-karnataka-are-emerging-as-strategic-innovation-engines-maturing-1-4x-faster-than-peers-zinnov-kdem-study/" },
  S27: { title: "Flexiple, GCC setup service page", url: "https://flexiple.com/gcc", self: true },
  S28: { title: "Beacon Filing, Office space cost per sq ft by city (2025–26)", url: "https://beaconfiling.com/blog/office-rent-indian-city-cost-comparison", vendor: true },
  S29: { title: "India Briefing, Karnataka GCC Policy 2024–29 key features", url: "https://www.india-briefing.com/news/karnataka-global-capability-center-policy-2024-2029-key-features-35441.html" },
  S30: { title: "ANSR, India's most GCC-ready emerging cities 2026 (via CXO Digital Pulse)", url: "https://www.cxodigitalpulse.com/?p=54894", vendor: true },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

export const sourceList = Object.entries(SOURCES) as [SourceId, Source][];
