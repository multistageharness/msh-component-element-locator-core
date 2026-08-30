# `@msh/locator-core`

## What it is

Locator generation as a library: given one element's inspector output, it produces every way of
addressing that element, renders each one into a target syntax, ranks them, and scores how
robust the result is.

It is **React-free** and **dependency-free**. There is no build step — the sources are ESM with
explicit `.js` extensions, so Node and bundlers read them directly. A CLI, a devtools panel or a
VS Code extension can consume it as-is; nothing in here knows a browser is involved.

This repository *is* the package: `src/`, `types/`, `fixtures/` and `tests/` sit at its root.

## Install

The package is distributed as a **git dependency**, pinned to a tag. It is not on any registry.

```json
"dependencies": {
  "@msh/locator-core": "git+ssh://git@github.com/multistageharness/msh-component-element-locator-core.git#v0.1.0"
}
```

Then `npm install`. There is nothing to build afterwards — no `prepare` script runs, because the
checkout *is* the package.

**Always pin a ref.** Without the `#v0.1.0` suffix the dependency resolves to whatever the
default branch happens to be at install time, so a push here silently changes your build. If you
need immutability stronger than a tag, put a commit SHA in the same position:

```
git+ssh://git@github.com/multistageharness/msh-component-element-locator-core.git#<40-char-sha>
```

Installing requires git read access to this repository, over whatever transport your environment
authenticates with. A headless environment needs a deploy key or an SSH agent — a plain
`npm ci` with no credentials cannot resolve the dependency.

### Developing against a local checkout

A git dependency resolves to an immutable copy under `node_modules`, so editing this package does
**not** show up in a consumer until a new ref is published. To get a live feedback loop back
while you work, point the consumer at your checkout:

```bash
# in the consumer, temporarily:
npm install --no-save "file:/absolute/path/to/msh-component-element-locator-core"
```

Edits under `src/` are then live in the consumer immediately. `--no-save` keeps it out of
`package.json`; **do not commit a `file:` dependency** — it is machine-specific and will break
every other checkout. To undo it:

```bash
npm install                  # restores the pinned git dependency from package.json
```

## Use

A worked example, using the bundled fixture:

```js
import { bestRowKey, buildRows, healthOf, tierOf } from "@msh/locator-core";
import { ELEMENTS } from "@msh/locator-core/fixtures";

const rows = buildRows(ELEMENTS[0], {
  format: "CSS",
  quote: "double",
  ranking: "test-id first",
});

for (const { candidate, text } of rows) {
  console.log(candidate.strategy.padEnd(12), text ?? "(not expressible in this format)");
}

const health = healthOf(rows);
console.log(`best: ${bestRowKey(rows)} — health ${health} (${tierOf(health)})`);
```

`buildRows` returns **every** candidate that applies, highest-ranked first. Rows the chosen
format cannot express carry `text: null` rather than being dropped — see *Extending it*.

Run the tests with `npm test` — Node's built-in runner, no dev dependencies to install.

## Public API

Everything below is exported from `src/index.js`. Nothing deeper than that entry point is a
supported import path — the package `exports` map declares exactly two: `.` and `./fixtures`.

**Candidates** — what ways of addressing this element exist.

| Export | What it is |
| --- | --- |
| `buildCandidates(element)` | Every strategy that applies, in priority order |
| `STRATEGIES` | The registry; declaration order is the default priority |
| `STRATEGY_META` | Per-strategy `why` — the sentence explaining its score |
| `STRATEGY_PRIORITY` | Strategy names in priority order |

**Rendering** — turning a candidate into a target syntax.

| Export | What it is |
| --- | --- |
| `renderCandidate(candidate, element, format, opts)` | The rendered string, or `null` if the format cannot express it |
| `FORMATS` | The format registry |
| `FORMAT_LIST` | Formats in menu order |
| `FORMAT_BY_ID` | Lookup by id |
| `DEFAULT_FORMAT` | The format to start on |

**Composition** — the two together.

| Export | What it is |
| --- | --- |
| `buildRows(element, settings)` | Rendered, ranked rows — unfiltered |
| `bestRowKey(rows)` | Key of the highest-ranked row the format can express |

**Scoring** — how good the best available locator is.

| Export | What it is |
| --- | --- |
| `healthOf(rows)` | Best score among rows the format can express |
| `tierOf(score)` | `"robust"` \| `"decent"` \| `"brittle"` |
| `TIERS` | The three tier names |

**Anchoring** — the canonical ancestor path.

| Export | What it is |
| --- | --- |
| `buildCanonical(element)` | Full path, each hop on the most stable token available |
| `anchorNode(node)` | The anchor chosen for one hop |
| `ANCHOR_ORDER` | Anchor kinds, most stable first |

**Hash filtering** — telling build-generated tokens from authored ones.

| Export | What it is |
| --- | --- |
| `isHashed(token)` | Whether a class or id looks machine-generated |
| `HASH_PATTERNS` | The patterns behind that judgment |

**Fragments** — the syntax primitives the formats are built from.

| Export | What it is |
| --- | --- |
| `cssFragment`, `segmentCss`, `canonicalCss` | CSS pieces |
| `segmentXPath`, `canonicalXPath`, `roleXPath`, `labelXPath`, `textXPath` | XPath pieces |

**Quoting** — keeping generated strings valid in the host language.

| Export | What it is |
| --- | --- |
| `quoteContext(style)` | The quote pair for a style |
| `outerQuote`, `innerQuote`, `wrap` | Applying it |
| `QUOTE_STYLES` | Available styles |

**Ranking** — what "best" means.

| Export | What it is |
| --- | --- |
| `RANKERS` | Ranking functions by mode name |
| `RANKING_MODES` | Available modes |
| `DEFAULT_RANKING` | The mode to start on |

## Input contract

Every entry point takes one element in the shape below. The full declaration is
[`types/element.d.ts`](types/element.d.ts); `assertElement` checks it at run time in development.

```js
{
  tag: "input",                       // required — emitted by XPath/Cypress/Selenium
  path: ["main", "form", "input"],    // required — RECORDED, see the warning below
  xpath: "/html/body/main/form/input",// required — RECORDED, see the warning below
  siblings: 3,                        // required — sets `matches` on text/structural rows
  attrs: {                            // required object; every field optional + nullable
    testid: "email-field",            //   optional | null → test-id strategy (96)
    id: "email",                      //   optional | null → id strategy (88)
    labelText: "Email",               //   optional | null → label strategy (84)
    role: "textbox",                  //   optional | null → role strategy (81)
    name: "email",                    //   optional | null → attribute strategy (74)
    text: null,                       //   optional | null → text strategy (63)
  },
  chain: [                            // OPTIONAL — the ancestor path, outermost first
    { tag: "main", id: null, classes: ["app"], testid: null, index: 1, total: 1 },
  ],
}
```

An absent or `null` attribute is never an error — it means that strategy does not apply.

### `path` and `xpath` are recorded, not derived

**The package never computes them.** They come from the inspector that captured the element, and
are passed straight through:

- Under the **XPath** format, `structural` returns `element.xpath` verbatim
  (`src/formats/xpath.js`).
- Under **CSS**, `structural` returns `element.path.slice(-3).join(" > ")`
  (`src/strategies.js` → `cssFragment` in `src/fragments.js`).

So an element carrying a stale or hand-invented `path`/`xpath` produces a **confidently wrong
locator, not an error** — it renders, it scores, and it is simply incorrect. This is the single
most surprising thing about the input. Run `assertElement` in development and you get a thrown
error instead of a silent one.

### `chain` is optional, and its absence has two different faces

Omitting `chain` is legal, but the two entry points diverge:

- **`buildRows` / `buildCandidates`** — the `canonical` strategy's `applies` predicate is
  `Boolean(el.chain && el.chain.length)`, so with no chain **no canonical row is produced at
  all**. Nothing signals why.
- **`buildCanonical(element)` called directly** — guards with `element.chain || []` and returns a
  well-formed result with `segments: []` and `score: 28`, the floor. Nothing signals that the
  input was empty.

That second one is the trap: a score of 28 is a *plausible* number, so an absent chain looks like
a weak result rather than a missing input. A consumer that feeds `buildCanonical` directly — to
render a breakdown panel, say — hits exactly that path, independently of the row list.

### Worked examples

`@msh/locator-core/fixtures` exports three real captured elements covering the interesting cases:
a `div` with both a testid and an id, a `button` with `id: null`, and an `input` with
`testid: null` that is the only one carrying `labelText`.

```js
import { ELEMENTS } from "@msh/locator-core/fixtures";
```

Those elements also record `label` and `attrs.cls`, which this package ignores — see the note at
the top of `types/element.d.ts`.

## Extending it

Two registries carry the extension points, so adding capability does not mean editing existing
code paths.

**Adding a format** is a module in `src/formats/` exporting handlers keyed by strategy, plus one
line in `src/formats/index.js`. Consumers pick it up with no other change.

**Adding a strategy** is an entry in `src/strategies.js` — its `applies`, its `build`, its score
— plus a handler in whichever formats can express it.

The two procedures are written up as skills at `.claude/skills/` — `locator-format-add`,
`locator-strategy-add` and `locator-ranking-mode-add` for the three registries, plus
`locator-core-install`, `locator-element-capture`, `locator-core-consume` and
`locator-core-upgrade` for consuming the package from another project.

> `.claude/` is a **git submodule** on its own branch, so the skills version separately from the
> code they describe. Changing a registry and its matching skill is two commits in two
> repositories, and the parent's submodule pointer has to be advanced or the skill change stays
> invisible to clones.

A **missing format handler is the answer, not a gap.** When a format has no handler for a
strategy, `renderCandidate` returns `null` and the caller renders "not expressible in this
format". Do not add a handler that emits an approximation; a locator that does not work is worse
than an absent one.

## What is deliberately not here

This package holds locator knowledge only. Three things a consuming app owns instead:

- **No palette.** Which colour a strategy is badged with is a rendering decision.
- **No UI copy.** The domain decides a locator's tier; how to phrase that to a user is product
  voice.
- **No view filtering.** `buildRows` returns every candidate. Deciding which subset a user is
  currently looking at — hiding structural rows, hiding unexpressible ones — belongs to the
  caller.

If one of these starts to look like it belongs here, that is the signal the boundary is being
eroded, not that the package is incomplete.
