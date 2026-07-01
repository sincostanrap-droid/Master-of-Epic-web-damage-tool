# Strict native effect candidate review v6.1

v6.1 fixes the TSV parser used by `tools/review-native-effect-rule-candidates.mjs`.

The candidate extractor writes `effects_json` as raw JSON inside a TSV cell. Because the cell itself is not CSV-quoted, a quote-aware parser incorrectly treats JSON quotes as delimiters and strips them.

The review tool now uses a plain TSV split parser for `nativeEffectRules.candidates.tsv`. The extractor already sanitizes tabs and newlines from cells, so this is safe for the generated file format.

This patch does not promote any rule and does not change `data/manual/nativeEffectRules.manual.tsv`.
