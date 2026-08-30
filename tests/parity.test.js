/* Parity test.
 *
 * The reference implementation below is the original monolithic component's
 * locator logic, copied verbatim. Every candidate and every rendered snippet
 * from the refactored domain layer must match it exactly, for every element,
 * format, quote style and strict-XPath setting. */

import test from "node:test";
import assert from "node:assert/strict";

import { ELEMENTS } from "../fixtures/elements.js";
import {
  FORMATS,
  QUOTE_STYLES,
  RANKERS,
  buildCandidates,
  renderCandidate,
} from "../src/index.js";

/* ---- reference implementation (original) -------------------------- */

const wrap = (s, q) => (q === "single" ? `'${s}'` : `"${s}"`);
const innerQ = (q) => (q === "single" ? '"' : "'");

const HASH_PATTERNS = [
  /^(css|sc|jsx|emotion|styled|mui|chakra|radix|ant|tw)[-_][A-Za-z0-9]{4,}$/i,
  /^_{1,2}[A-Za-z][\w-]*_{1,2}[A-Za-z0-9]{4,}$/,
  /^[A-Za-z][\w-]*-[a-f0-9]{6,}$/i,
  /^[A-Za-z]+[-_]?[0-9]{4,}$/,
  /^(?=.*\d)[A-Za-z0-9]{8,}$/,
];

function isHashed(token) {
  if (!token) return true;
  if (HASH_PATTERNS.some((r) => r.test(token))) return true;
  const digits = (token.match(/\d/g) || []).length;
  return digits >= 3 && digits / token.length > 0.3;
}

function anchorNode(node) {
  const rejected = [
    ...(node.id && isHashed(node.id) ? [`#${node.id}`] : []),
    ...node.classes.filter(isHashed).map((c) => `.${c}`),
  ];
  const stableClasses = node.classes.filter((c) => !isHashed(c));
  const base = { tag: node.tag, index: node.index, total: node.total, rejected };

  if (node.testid) return { ...base, kind: "test-id", token: node.testid };
  if (node.id && !isHashed(node.id)) return { ...base, kind: "id", token: node.id };
  if (stableClasses.length) return { ...base, kind: "class", token: stableClasses[0] };
  return { ...base, kind: "position", token: null };
}

function buildCanonical(el) {
  const segments = (el.chain || []).map(anchorNode);
  const anchored = segments.filter((s) => s.kind !== "position").length;
  const ratio = segments.length ? anchored / segments.length : 0;
  const targetAnchored = segments.length
    ? segments[segments.length - 1].kind !== "position"
    : false;
  const score = Math.min(82, 28 + Math.round(46 * ratio) + (targetAnchored ? 8 : 0));
  return {
    segments,
    anchored,
    ratio,
    score,
    rejected: segments.flatMap((s) => s.rejected),
  };
}

const segCss = (s, ch) => {
  switch (s.kind) {
    case "test-id":
      return `${s.tag}[data-testid=${ch}${s.token}${ch}]`;
    case "id":
      return `${s.tag}#${s.token}`;
    case "class":
      return `${s.tag}.${s.token}`;
    default:
      return s.total > 1 ? `${s.tag}:nth-of-type(${s.index})` : s.tag;
  }
};

const segXPath = (s, ch, strict) => {
  const cls = strict
    ? `contains(concat(${ch} ${ch},normalize-space(@class),${ch} ${ch}),${ch} ${s.token} ${ch})`
    : `contains(@class,${ch}${s.token}${ch})`;
  switch (s.kind) {
    case "test-id":
      return `${s.tag}[@data-testid=${ch}${s.token}${ch}]`;
    case "id":
      return `${s.tag}[@id=${ch}${s.token}${ch}]`;
    case "class":
      return `${s.tag}[${cls}]`;
    default:
      return s.total > 1 ? `${s.tag}[${s.index}]` : s.tag;
  }
};

const canonCss = (segs, ch) => segs.map((s) => segCss(s, ch)).join(" > ");
const canonXPath = (segs, ch, strict) =>
  "//" + segs.map((s) => segXPath(s, ch, strict)).join("/");

function referenceCandidates(el) {
  const a = el.attrs;
  const out = [];
  if (a.testid)
    out.push({ key: "testid", strategy: "test-id", score: 96, matches: 1, value: a.testid });
  if (a.id) out.push({ key: "id", strategy: "id", score: 88, matches: 1, value: a.id });
  if (a.labelText)
    out.push({ key: "label", strategy: "label", score: 84, matches: 1, value: a.labelText });
  if (a.role && (a.text || a.labelText))
    out.push({
      key: "role",
      strategy: "role",
      score: 81,
      matches: 1,
      value: a.role,
      name: a.text || a.labelText,
      fromLabel: !a.text && !!a.labelText,
    });
  if (el.chain && el.chain.length) {
    const canon = buildCanonical(el);
    out.push({
      key: "canonical",
      strategy: "canonical",
      score: canon.score,
      matches: 1,
      value: null,
      canon,
    });
  }
  if (a.name)
    out.push({ key: "attr", strategy: "attribute", score: 74, matches: 1, value: a.name });
  if (a.text)
    out.push({
      key: "text",
      strategy: "text",
      score: 63,
      matches: el.siblings > 3 ? 2 : 1,
      value: a.text,
    });
  out.push({
    key: "structural",
    strategy: "structural",
    score: 22,
    matches: el.siblings,
    value: el.path.slice(-3).join(" > "),
  });
  return out;
}

function referenceRender(c, el, fmt, q, opts = {}) {
  const iq = innerQ(q);
  const oq = q === "single" ? "'" : '"';
  const v = c.value;
  const t = el.tag;

  if (c.key === "canonical") {
    const segs = c.canon.segments;
    switch (fmt) {
      case "CSS":
        return canonCss(segs, oq);
      case "XPath":
        return canonXPath(segs, oq, !!opts.strictXPath);
      case "Playwright":
        return `page.locator(${wrap(canonCss(segs, iq), q)})`;
      case "Cypress":
        return `cy.get(${wrap(canonCss(segs, iq), q)})`;
      case "Selenium":
        return `driver.find_element(By.CSS_SELECTOR, ${wrap(canonCss(segs, iq), q)})`;
      default:
        return null;
    }
  }

  const css = {
    testid: `[data-testid=${iq}${v}${iq}]`,
    id: `#${v}`,
    attr: `${t}[name=${iq}${v}${iq}]`,
    structural: v,
  }[c.key];

  switch (c.key) {
    case "testid":
    case "id":
    case "attr":
    case "structural":
      switch (fmt) {
        case "CSS":
          if (c.key === "testid") return `[data-testid=${wrap(v, q)}]`;
          if (c.key === "attr") return `${t}[name=${wrap(v, q)}]`;
          return css;
        case "XPath":
          if (c.key === "id") return `//*[@id=${wrap(v, q)}]`;
          if (c.key === "testid") return `//*[@data-testid=${wrap(v, q)}]`;
          if (c.key === "attr") return `//${t}[@name=${wrap(v, q)}]`;
          return el.xpath;
        case "Playwright":
          if (c.key === "testid") return `page.getByTestId(${wrap(v, q)})`;
          return `page.locator(${wrap(css, q)})`;
        case "Cypress":
          return `cy.get(${wrap(css, q)})`;
        case "Selenium":
          if (c.key === "id") return `driver.find_element(By.ID, ${wrap(v, q)})`;
          return `driver.find_element(By.CSS_SELECTOR, ${wrap(css, q)})`;
        default:
          return null;
      }

    case "label":
      switch (fmt) {
        case "CSS":
          return null;
        case "XPath":
          return `//label[normalize-space()=${wrap(v, q)}]/following::${t}[1]`;
        case "Playwright":
          return `page.getByLabel(${wrap(v, q)})`;
        case "Cypress":
          return `cy.contains(${wrap("label", q)}, ${wrap(v, q)}).find(${wrap(t, q)})`;
        case "Selenium":
          return `driver.find_element(By.XPATH, ${wrap(
            `//label[normalize-space()=${iq}${v}${iq}]/following::${t}[1]`,
            q
          )})`;
        default:
          return null;
      }

    case "role": {
      const xp = c.fromLabel
        ? `//label[normalize-space()=${iq}${c.name}${iq}]/following::*[@role=${iq}${v}${iq}][1]`
        : `//*[@role=${iq}${v}${iq}][normalize-space()=${iq}${c.name}${iq}]`;
      switch (fmt) {
        case "CSS":
          return null;
        case "XPath":
          return xp.split(iq).join(q === "single" ? "'" : '"');
        case "Playwright":
          return `page.getByRole(${wrap(v, q)}, { name: ${wrap(c.name, q)} })`;
        case "Cypress":
          return `cy.findByRole(${wrap(v, q)}, { name: ${wrap(c.name, q)} })`;
        case "Selenium":
          return `driver.find_element(By.XPATH, ${wrap(xp, q)})`;
        default:
          return null;
      }
    }

    case "text":
      switch (fmt) {
        case "CSS":
          return null;
        case "XPath":
          return `//${t}[normalize-space(text())=${wrap(v, q)}]`;
        case "Playwright":
          return `page.getByText(${wrap(v, q)}, { exact: true })`;
        case "Cypress":
          return `cy.contains(${wrap(t, q)}, ${wrap(v, q)})`;
        case "Selenium":
          return `driver.find_element(By.XPATH, ${wrap(
            `//${t}[normalize-space(text())=${iq}${v}${iq}]`,
            q
          )})`;
        default:
          return null;
      }
    default:
      return null;
  }
}

/* ---- assertions --------------------------------------------------- */

const shape = (c) => ({
  key: c.key,
  strategy: c.strategy,
  score: c.score,
  matches: c.matches,
  value: c.value ?? null,
  name: c.name ?? null,
  fromLabel: c.fromLabel ?? null,
  canonScore: c.canon?.score ?? null,
  canonSegments: c.canon?.segments ?? null,
});

test("candidates match the reference implementation", () => {
  for (const el of ELEMENTS) {
    assert.deepEqual(
      buildCandidates(el).map(shape),
      referenceCandidates(el).map(shape),
      `candidates differ for <${el.tag}> ${el.label}`
    );
  }
});

test("every rendered locator matches the reference implementation", () => {
  let compared = 0;
  for (const el of ELEMENTS) {
    for (const candidate of buildCandidates(el)) {
      for (const format of FORMATS) {
        for (const quote of QUOTE_STYLES) {
          for (const strictXPath of [false, true]) {
            const actual = renderCandidate(candidate, el, format, { quote, strictXPath });
            const expected = referenceRender(candidate, el, format, quote, { strictXPath });
            assert.equal(
              actual,
              expected,
              `${el.label} · ${candidate.key} · ${format} · ${quote} · strict=${strictXPath}`
            );
            compared += 1;
          }
        }
      }
    }
  }
  assert.ok(compared > 100, `expected a broad matrix, compared ${compared}`);
});

test("FORMATS and RANKERS keep their original identities", () => {
  assert.deepEqual(FORMATS, ["CSS", "XPath", "Playwright", "Cypress", "Selenium"]);
  assert.deepEqual(Object.keys(RANKERS), ["test-id first", "semantic first", "shortest"]);
});
