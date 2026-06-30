from pathlib import Path
import shutil

ROOT = Path.cwd()

renames = [
    ("src/data/generated/moeForgeEffectCatalog.generated.js", "src/data/generated/referenceEffectCatalog.generated.js"),
    ("src/data/generated/moeForgeEquipmentBuffIndex.generated.js", "src/data/generated/referenceEquipmentBuffIndex.generated.js"),
    ("src/data/generated/moeForgeEffectCatalog.summary.json", "src/data/generated/referenceEffectCatalog.summary.json"),
    ("tools/build-moe-forge-effect-catalog.mjs", "tools/build-reference-effect-catalog.mjs"),
    ("data/external/moe-forge", "data/external/effect-reference"),
]

for src, dst in renames:
    src_path = ROOT / src
    dst_path = ROOT / dst
    if src_path.exists() and not dst_path.exists():
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src_path), str(dst_path))
        print(f"renamed: {src} -> {dst}")
    elif src_path.exists() and dst_path.exists():
        print(f"skip rename, destination exists: {dst}")
    else:
        print(f"skip missing: {src}")

replacements = [
    ("MOE_FORGE_EFFECT_CATALOG", "REFERENCE_EFFECT_CATALOG"),
    ("MOE_FORGE_EQUIPMENT_BUFF_INDEX", "REFERENCE_EQUIPMENT_BUFF_INDEX"),
    ("moeForgeEffectCatalog.generated.js", "referenceEffectCatalog.generated.js"),
    ("moeForgeEquipmentBuffIndex.generated.js", "referenceEquipmentBuffIndex.generated.js"),
    ("moeForgeEffectCatalog.summary.json", "referenceEffectCatalog.summary.json"),
    ("build-moe-forge-effect-catalog.mjs", "build-reference-effect-catalog.mjs"),
    ("data/external/moe-forge", "data/external/effect-reference"),
    ("moe-forge-extracted-json-modules-v2.json", "external-effect-reference.raw.json"),
    ("MoE Forge extracted reference data", "external reference effect data"),
    ("MoE Forge source map/license were not found in the extracted bundle.", "Upstream source map/license were not included in the provided reference bundle."),
    ("Reference/provisional data extracted from MoE Forge bundle. Do not treat as official without verification.", "Reference/provisional data extracted from an external reference bundle. Do not treat as official without verification."),
    ("MoE Forge reference extraction", "External reference effect extraction"),
    ("MoE Forge data", "Reference data"),
    ("MoE Forge由来データ", "外部参考データ"),
    ("MoE Forge抽出データ", "外部参考データ"),
    ("MoE Forge由来", "外部参考"),
    ("MoE Forge", "参考データ"),
    ("moe-forge:", "external-reference:"),
    ("moe-forge", "external-reference"),
]

text_exts = {".js", ".mjs", ".json", ".md", ".html", ".txt", ".css", ".yml", ".yaml"}
scan_dirs = [ROOT / "src", ROOT / "docs", ROOT / "tools", ROOT / "data"]
scan_files = [ROOT / "APPLY_WINDOWS.md", ROOT / "BRANCH_WORKFLOW.md", ROOT / "MANIFEST.json", ROOT / "MANIFEST_EFFECT_BROWSER.json", ROOT / "APPLY_EFFECT_BROWSER_WINDOWS.md", ROOT / "effect-catalog-browser.html"]

paths = []
for d in scan_dirs:
    if d.exists():
        paths.extend([p for p in d.rglob("*") if p.is_file() and p.suffix.lower() in text_exts])
for f in scan_files:
    if f.exists() and f not in paths:
        paths.append(f)

changed = 0
for p in paths:
    try:
        text = p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    new = text
    for old, new_value in replacements:
        new = new.replace(old, new_value)
    if new != text:
        p.write_text(new, encoding="utf-8")
        changed += 1
        print(f"updated: {p.relative_to(ROOT)}")

print(f"done. updated files: {changed}")
