// ---------------------------------------------------------------------------
// Match spoken text (one or more recognition alternatives) to foods.
// - Arabic normalisation (hamza/taa-marbuta/alef-maqsura/diacritics)
// - strips the article and attached و/ب/ف/ل prefixes: "والخبز" -> "خبز"
// - longest name wins on overlapping text: "بطاطا حلوة" beats "بطاطا",
//   "لبنة" beats "لبن"
// - finds SEVERAL foods in one sentence: "بدي بيض وخبز وحليب"
// ---------------------------------------------------------------------------
export const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const ARTICLE = /^(وال|بال|فال|كال|لل|ال)(?=..)/

function buildIndex(foods) {
  const vocab = new Set()
  const names = []
  for (const f of foods) {
    for (const raw of [f.name.ar, f.name.en, ...(f.aliases || [])]) {
      const n = normalize(raw).split(' ').map((w) => w.replace(ARTICLE, '')).join(' ')
      if (!n) continue
      names.push({ id: f.id, n })
      n.split(' ').forEach((w) => vocab.add(w))
    }
  }
  names.sort((a, b) => b.n.length - a.n.length) // longest first
  return { names, vocab }
}

// Clean each spoken word: drop the article, then a single conjunction or
// preposition letter if what remains is (the start of) a known food word.
function cleanWords(text, vocab) {
  return normalize(text)
    .split(' ')
    .map((w) => {
      let x = w.replace(ARTICLE, '')
      if (/^[وبفل]/.test(x) && x.length > 2) {
        const rest = x.slice(1).replace(ARTICLE, '')
        const known = (s) => [...vocab].some((v) => s.startsWith(v) || v.startsWith(s))
        if (!known(x) && known(rest)) x = rest
      }
      return x
    })
}

const cache = new WeakMap()
export function findFoods(alternatives, foods) {
  if (!cache.has(foods)) cache.set(foods, buildIndex(foods))
  const { names, vocab } = cache.get(foods)
  for (const alt of alternatives) {
    const words = cleanWords(alt, vocab)
    const used = new Array(words.length).fill(false)
    const found = []
    for (const { id, n } of names) {
      const parts = n.split(' ')
      for (let i = 0; i + parts.length <= words.length; i++) {
        // each name word must START the spoken word ("تفاح" ~ "تفاحه", "apple" ~ "apples")
        const ok = parts.every((p, k) => !used[i + k] && words[i + k].startsWith(p) && words[i + k].length - p.length <= 2)
        if (ok) {
          for (let k = 0; k < parts.length; k++) used[i + k] = true
          if (!found.includes(id)) found.push(id)
        }
      }
    }
    if (found.length) return found // first alternative that matches anything
  }
  return []
}
