# Windows apply notes

1. Download and extract `moe_effect_system_patch_v1.zip`.
2. Copy the extracted folders/files into the repository root, so paths line up like:

```txt
src\data\generated\referenceEffectCatalog.generated.js
src\data\generated\referenceEquipmentBuffIndex.generated.js
src\effects\effectResolver.js
```

3. In PowerShell at the repository root:

```powershell
git switch main
git pull --ff-only
git tag backup-before-effect-catalog-v1
git switch -c feature/effect-catalog-v1

git status
git add src\data\effects src\data\generated\referenceEffectCatalog.generated.js src\data\generated\referenceEquipmentBuffIndex.generated.js src\data\generated\referenceEffectCatalog.summary.json src\effects tools\build-reference-effect-catalog.mjs docs\effect-system-v1.md data\external\external-reference\README.md BRANCH_WORKFLOW.md README.md MANIFEST.json
git commit -m "Add generic effect catalog foundation"
git push -u origin feature/effect-catalog-v1
```
