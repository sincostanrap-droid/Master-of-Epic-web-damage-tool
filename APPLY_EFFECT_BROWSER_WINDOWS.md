# Apply effect catalog browser patch on Windows

Use this while staying on `feature/effect-catalog-v1`. Do not merge PR #1 yet.

```powershell
git switch feature/effect-catalog-v1
git status
```

Copy this patch package into the repository root. It should add:

- `effect-catalog-browser.html`
- `src/effects/effectCatalogBrowser.js`
- `docs/effect-catalog-browser-v1.md`
- `APPLY_EFFECT_BROWSER_WINDOWS.md`

Then commit and push:

```powershell
git status
git add effect-catalog-browser.html src/effects/effectCatalogBrowser.js docs/effect-catalog-browser-v1.md APPLY_EFFECT_BROWSER_WINDOWS.md
git commit -m "Add effect catalog browser"
git push
```

Open locally:

```powershell
python -m http.server 8080
```

Browser:

```text
http://localhost:8080/effect-catalog-browser.html
```

PR #1 will update automatically after `git push`.
