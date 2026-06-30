# native effect candidate strict review v6.1 parser fix

This patch replaces `tools/review-native-effect-rule-candidates.mjs`.

## Why

v6 used a quote-aware TSV parser. The generated candidate TSV stores JSON cells as raw text, for example:

```txt
{"attackPct":30}
```

Those cells are not CSV-quoted, so the quote-aware parser stripped JSON quotes and made every `effects_json` invalid. As a result all rows were classified as `non_combat_or_description_only`.

v6.1 uses a plain TSV parser for this generated candidate file. Tabs and newlines are already sanitized by the extractor.

## Apply

Copy this patch into the repository root, overwriting the existing file:

```txt
tools/review-native-effect-rule-candidates.mjs
```

Then run:

```powershell
node tools/extract-native-effect-rule-candidates.mjs
node tools/review-native-effect-rule-candidates.mjs
Get-Content .\dist\native-effect-rules\nativeEffectRules.strictReview.summary.json -Encoding UTF8
Get-Content .\dist\native-effect-rules\nativeEffectRules.strictReview.combat.tsv -Encoding UTF8 -First 40
```

## Commit

```powershell
git add tools/review-native-effect-rule-candidates.mjs
git commit -m "Fix strict native effect review TSV parsing"
git push
```
