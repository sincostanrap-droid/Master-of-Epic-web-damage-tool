$ErrorActionPreference = "Stop"

$old = "Master of Epic 物理ダメージ計算webツール"
$new = "Master of Epic 戦闘シミュレーター"

$files = @(
    "worker/README.md",
    "src/ui/appVersionBadge.js",
    "README.md",
    "README.txt",
    "worker/moe-idb-proxy-worker.js",
    "src/storage/shareUrl.js",
    "index.html",
    "tools/refine-buff-rules-tsv.mjs",
    "styles/main.css",
    "tools/build-buff-rules-template.mjs",
    "tools/build-buff-rules-manual-from-tsv.mjs",
    "legacy/single_html_latest.html",
    "src/data/manual/reviewedBuffCatalog.manual.js",
    "tools/enrich-buff-rules-template-from-scrapbox.mjs",
    "patches/src-main-js.patch"
)

if (-not (Test-Path ".git")) {
    throw "Gitリポジトリのルートで実行してください。"
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$totalReplacements = 0
$changedFiles = @()

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        throw "対象ファイルが見つかりません: $file"
    }

    $fullPath = (Resolve-Path $file).Path
    $text = [System.IO.File]::ReadAllText($fullPath)
    $count = [regex]::Matches($text, [regex]::Escape($old)).Count

    if ($count -gt 0) {
        $updated = $text.Replace($old, $new)
        [System.IO.File]::WriteAllText($fullPath, $updated, $utf8NoBom)
        $totalReplacements += $count
        $changedFiles += $file
        Write-Host "更新: $file ($count 箇所)"
    }
}

if ($changedFiles.Count -eq 0) {
    Write-Host "旧名称は見つかりませんでした。すでに変更済みの可能性があります。"
    exit 0
}

Write-Host ""
Write-Host "完了: $($changedFiles.Count) ファイル / $totalReplacements 箇所を変更しました。"
Write-Host "旧GitHub Pages URL・リポジトリ名は変更していません。"
Write-Host ""

Write-Host "=== git diff --check ==="
git diff --check
if ($LASTEXITCODE -ne 0) {
    throw "git diff --check で問題が見つかりました。"
}

Write-Host ""
Write-Host "=== git diff --stat ==="
git diff --stat

Write-Host ""
Write-Host "確認コマンド:"
Write-Host '  git grep -n "Master of Epic 物理ダメージ計算webツール"'
Write-Host '  git grep -n "Master of Epic 戦闘シミュレーター"'
Write-Host ""
Write-Host "問題なければ:"
Write-Host '  git add .'
Write-Host '  git commit -m "Rename app to Master of Epic 戦闘シミュレーター"'
Write-Host '  git push'
