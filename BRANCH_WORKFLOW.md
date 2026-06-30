# Git branch workflow for the effect-catalog refactor

This refactor is intentionally branch-first. Do not apply it directly to `main`.

```bash
git switch main
git pull --ff-only

git tag backup-before-effect-catalog-v1
git switch -c feature/effect-catalog-v1
```

Copy the files from this patch package into the repository root, then check the diff:

```bash
git status
git diff --stat
```

Commit the foundation only:

```bash
git add src/data/effects src/data/generated/moeForgeEffectCatalog.generated.js src/data/generated/moeForgeEquipmentBuffIndex.generated.js src/data/generated/moeForgeEffectCatalog.summary.json src/effects tools/build-moe-forge-effect-catalog.mjs docs/effect-system-v1.md data/external/moe-forge/README.md
git commit -m "Add generic effect catalog foundation"
git push -u origin feature/effect-catalog-v1
```

Rollback options:

```bash
# Leave the refactor branch and return to current stable main
git switch main

# Delete local experimental branch if needed
git branch -D feature/effect-catalog-v1

# Restore exact pre-refactor point
git switch main
git reset --hard backup-before-effect-catalog-v1
```
