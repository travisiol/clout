# clout.capital

Trade the traders. Back the best.

A market in KOL shares on Robinhood Chain. Traders are ranked by their daily
trading PnL; each one can have a share launched on a pons bonding curve; every
trade pays a 1% fee to the trader. Losing traders' shares burn, and the value
from those positions funds buybacks of the winners'.

This is a rebuild of [kol.capital](https://kol.capital) under a different name.
The interface, the copy and the mechanism are the original's; the brand — the
name, the inflated mark and wordmark — is new, and lives in one file.

## Running it

```bash
npm install
npm run dev
```

Nothing is required to start. With no environment set the roster is the
bundled sample and the market page says so, in a chip next to its title.

## Where the name lives

`src/lib/site.ts`. Name, wordmark, mark glyph, tagline, domain, X handle.
Nothing in `app/` or `components/` hard-codes the brand, and the two pieces of
brand art are drawn at runtime from those strings rather than shipped as
images — see `src/lib/balloon.ts`, which inflates a glyph by taking the exact
euclidean distance to its edge, turning that into a circular tube profile and
lighting it. Renaming the site renames the art.

"KOL" elsewhere in the copy is the category noun, not the brand. It stays
whatever this is called.

## What is real and what is not

| Piece | State |
| --- | --- |
| Trader leaderboard | Real, via the FOMO API — **needs `FOMO_API_KEY`**. Without it, the bundled sample roster (invented handles) and `source: "seed"` in the API. |
| Share prices, market cap, bonding progress | Read straight off the pons curve on Robinhood Chain, once a share is in the registry. Sample shares are priced by the same curve maths, and are marked `source: "sample"`. |
| Buy / sell | Encodes a real `buy(quoteAmount, minTokensOut, recipient)` against the curve and hands it to the wallet. It refuses to sign against a sample market. |
| Candles, holders, trades | **Need an indexer.** An RPC node cannot enumerate holders or replay `CurveBuy`/`CurveSell`. Those three routes answer `501` naming `INDEXER_URL`; sample shares serve a generated series so the page is walkable. |
| Portfolio | Real `balanceOf` per launched share, straight from the token contracts. No cost basis — that needs trade history, so the table shows value and says nothing about entry. |

Nothing is faked silently: every surface that is showing sample data says so.

## Before it goes live

1. **`FOMO_API_KEY`** — a free key is 1,000 credits/month at
   <https://fomoapi.io/dashboard>. Until it is set the roster is invented.
2. **The share registry** — `data/shares.json` or `SHARE_REGISTRY_JSON`, mapping
   handle → `{ token, curve }`. A curve does not know the handle it was
   launched for, so this cannot be derived. Empty is valid: every trader then
   shows "Launch".
3. **`INDEXER_URL`** — until this exists there is no chart, no holder table and
   no trade feed for a real share.
4. **`NEXT_PUBLIC_RPC_URL`** — the public Robinhood Chain RPC is the default and
   will not survive real traffic.
5. **The X handle** — `site.xHandle` is `@cloutdotcapital`, which nobody has
   registered. Point it at the real account or drop the two links.
6. **The disclaimer in the footer** is structured boilerplate. It has not been
   read by a lawyer.

## Chain

Robinhood Chain, id 4663. pons V2: factory
`0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e`, launch forwarder
`0xe33e9e479df8802cb0866d5d05258bec4cf62948`, fee escrow
`0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e`. A curve carries 1.68 ETH of
virtual quote reserve and graduates at 4.2 ETH raised; the fee is 100 bps and
sits on the curve until pons sweeps it to the escrow, which is why "fees
accrued" and "fees paid" are two different numbers here.

## Stack

Next 16 (App Router, Turbopack), React 19, Tailwind 4, viem. No component
library, no chart library, no icon package — the chart is SVG, the icons are
paths, the brand art is arithmetic.
