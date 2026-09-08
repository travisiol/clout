/**
 * Every user-visible mention of the brand resolves here. Renaming the site is
 * meant to be this file plus the two brand art strings below — nothing in
 * `components/` or `app/` hard-codes the name.
 *
 * Note that "KOL" elsewhere in the copy is the category noun (key opinion
 * leader), not the brand: it stays put whatever this is called.
 */
export const site = {
  name: "clout.capital",
  /** Shown in the balloon wordmark at the foot of the page. */
  wordmark: "clout.capital",
  /** The app mark: the initial plus the dot from the domain, inflated. */
  mark: "c.",
  tagline: "Trade the traders. Back the best.",
  description:
    "Invest in KOLs on Robinhood Chain. Buy and sell KOL shares; every hour the losers' shares are sold and the winners get bought back.",
  domain: "clout.capital",
  url: "https://clout.capital",
  xHandle: "cloutdotcapital",
  get xUrl() {
    return `https://x.com/${this.xHandle}`;
  },
} as const;

export const themeColor = "#EEF7FE";
