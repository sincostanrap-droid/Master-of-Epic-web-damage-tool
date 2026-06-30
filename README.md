# MoE effect system patch v1

This package adds a branch-safe foundation for moving from damage-only equipment/buff fields to a generic effect catalog.

Counts:

- Effect catalog entries: 2276
- Equipment buff index entries: 12408
- Canonical stats: 29

Apply on a separate branch:

```bash
git switch main
git pull --ff-only
git tag backup-before-effect-catalog-v1
git switch -c feature/effect-catalog-v1
```

Then copy this package's folders into the repository root and commit.

See:

- `BRANCH_WORKFLOW.md`
- `docs/effect-system-v1.md`
