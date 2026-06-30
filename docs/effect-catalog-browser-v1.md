# Effect Catalog Browser v1

`effect-catalog-browser.html` is a read-only reference screen for the generated MoE Forge effect data.

## Purpose

- Search the generated Buff/effect catalog.
- Search the equipment Buff index.
- Show normalized effects, raw fields, unsupported fields, source layer, and verification status.
- Keep existing damage calculation untouched.

## How to use

Open the repository via a local server:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/effect-catalog-browser.html
```

## Safety

This screen imports generated data only for display. It does not write to localStorage and does not connect to the current calculator state.

MoE Forge data is `reference` / `provisional` until verified against official DB, Wiki, or self-tests.

## Next phase

After confirming the browser works:

1. Add candidate search inside the existing equipment Buff detail UI.
2. Allow copying/reference display only.
3. Add a feature flag for applying physical-only effects.
4. Promote verified rules into a separate verified catalog.
