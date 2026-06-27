/*
  storage/shareUrl.js

  見せびらかしタブの軽量共有URLを扱います。
  役割:
  - 現在使用中の構成だけを軽量JSON化
  - gzip可能なら圧縮してURL hashへ格納
  - 共有URLから構成を復元
*/

function shareSetIfNumber(out, key, value) {
  const n = parseFloat(value);
  if (Number.isFinite(n) && n !== 0) out[key] = n;
}

function shareSetIfString(out, key, value) {
  const s = String(value || "").trim();
  if (s) out[key] = s;
}

function shareCompactSkillSim(skillSim) {
  const s = normalizeSkillSim(skillSim);
  const skills = {};
  SKILL_SIM_ALL.forEach(name => {
    const v = +(s.skills?.[name] || 0);
    if (v) skills[name] = v;
  });
  return {
    name: s.name || "",
    race: s.race || "newtar",
    cap: s.cap || 850,
    weaponSkill: s.weaponSkill || "こんぼう",
    autoApply: s.autoApply !== false,
    skills
  };
}

function shareCompactExtraStats(row, out, modes) {
  (modes || ["base", "equipBuff", "buff"]).forEach(mode => {
    extraFieldDefsFor(mode).forEach(d => {
      const v = +(row?.[d.prop] || 0);
      if (v) out[d.prop] = v;
    });
  });
}

function shareCompactWeaponReq(rows) {
  return normalizeWeaponReqRowsForEquipment(rows)
    .filter(r => +(r.required || 0))
    .map(r => ({name:r.name || "こんぼう", required:+r.required || 0}));
}

function shareCompactEquipmentRow(row) {
  const r = normalizeEquipmentCandidate(row);
  const out = {slot: r.slot || "防具: 頭"};
  shareSetIfString(out, "name", r.name);
  shareSetIfString(out, "tags", r.tags);
  shareSetIfString(out, "note", r.note);
  shareSetIfNumber(out, "attack", r.attack);
  shareSetIfNumber(out, "magic", r.magic);
  shareSetIfNumber(out, "speed", r.speed);
  shareSetIfNumber(out, "weaponDamage", r.weaponDamage);
  shareSetIfNumber(out, "weaponWeight", r.weaponWeight);
  shareSetIfNumber(out, "weaponAttackInterval", r.weaponAttackInterval);
  shareSetIfNumber(out, "weaponRange", r.weaponRange);
  shareSetIfNumber(out, "weaponDurability", r.weaponDurability);
  if (r.weaponTwoHanded === "○") out.weaponTwoHanded = "○";
  const req = shareCompactWeaponReq(r.weaponReq);
  if (req.length) out.weaponReq = req;

  shareCompactExtraStats(r, out, ["base"]);

  if (r.equipBuffEnabled && equipmentBuffHasEffect(r)) {
    out.equipBuffEnabled = true;
    if (r.equipBuffSlot === false) out.equipBuffSlot = false;
    shareSetIfString(out, "equipBuffName", r.equipBuffName);
    shareSetIfString(out, "equipBuffNote", r.equipBuffNote);
    shareSetIfNumber(out, "equipBuffAttackPct", r.equipBuffAttackPct);
    shareSetIfNumber(out, "equipBuffMagicPct", r.equipBuffMagicPct);
    shareSetIfNumber(out, "equipBuffSpeedPct", r.equipBuffSpeedPct);
    shareSetIfNumber(out, "equipBuffFlatAttack", r.equipBuffFlatAttack);
    shareSetIfNumber(out, "equipBuffFlatMagic", r.equipBuffFlatMagic);
    shareSetIfNumber(out, "equipBuffFlatSpeed", r.equipBuffFlatSpeed);
    shareSetIfNumber(out, "equipBuffConvMagicRate", r.equipBuffConvMagicRate);
    shareSetIfNumber(out, "equipBuffConvSpeedRate", r.equipBuffConvSpeedRate);
    shareSetIfNumber(out, "equipBuffDmgPct", r.equipBuffDmgPct);
    if (+r.equipBuffSpecial && +r.equipBuffSpecial !== 1) out.equipBuffSpecial = +r.equipBuffSpecial;
    shareCompactExtraStats(r, out, ["equipBuff"]);
  }

  return out;
}

function shareCompactCompositeRow(row) {
  const r = normalizeCompositeRows([row])[0] || {};
  const out = {enabled:true};
  if (r.slot === false) out.slot = false;
  shareSetIfString(out, "name", r.name);
  shareSetIfString(out, "tags", r.tags);
  shareSetIfString(out, "note", r.note);
  shareSetIfNumber(out, "attackPct", r.attackPct);
  shareSetIfNumber(out, "magicPct", r.magicPct);
  shareSetIfNumber(out, "speedPct", r.speedPct);
  shareSetIfNumber(out, "flatAttack", r.flatAttack);
  shareSetIfNumber(out, "flatMagic", r.flatMagic);
  shareSetIfNumber(out, "flatSpeed", r.flatSpeed);
  shareSetIfNumber(out, "convMagicRate", r.convMagicRate);
  shareSetIfNumber(out, "convSpeedRate", r.convSpeedRate);
  shareSetIfNumber(out, "dmgPct", r.dmgPct);
  if (+r.special && +r.special !== 1) out.special = +r.special;
  shareCompactExtraStats(r, out, ["buff"]);
  return out;
}

function shareCompactPostRow(row) {
  const out = {enabled:true};
  if (row?.slot === false) out.slot = false;
  shareSetIfString(out, "name", row?.name);
  shareSetIfString(out, "tags", row?.tags || row?.tag);
  shareSetIfString(out, "note", row?.note);
  if (+row?.value && +row.value !== 1) out.value = +row.value;
  return out;
}

function shareCompactOtherRow(row) {
  const out = {enabled:true};
  shareSetIfString(out, "name", row?.name);
  shareSetIfString(out, "tags", row?.tags || row?.tag);
  shareSetIfString(out, "note", row?.note);
  return out;
}

function collectShowcaseShareConfig() {
  const cfg = collectConfig();
  const st = cfg.state || {};

  return {
    inputs: cfg.inputs,
    state: {
      weaponReq: [],
      skillSim: shareCompactSkillSim(st.skillSim),
      equipment: normalizeEquipmentRows(st.equipment)
        .filter(r => r.enabled !== false && equipmentCandidateHasData(r))
        .map(shareCompactEquipmentRow),
      composite: normalizeCompositeRows(st.composite)
        .filter(r => r.enabled && compositeHasEffect(r))
        .map(shareCompactCompositeRow),
      post: (st.post || [])
        .filter(r => r.enabled)
        .map(shareCompactPostRow),
      other: (st.other || [])
        .filter(r => r.enabled)
        .map(shareCompactOtherRow),
      pct: [],
      flat: [],
      conv: [],
      dmg: [],
      special: []
    }
  };
}

function bytesToBase64Url(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const b64 = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function utf8ToBase64Url(text) {
  return bytesToBase64Url(new TextEncoder().encode(text));
}

function base64UrlToUtf8(data) {
  return new TextDecoder().decode(base64UrlToBytes(data));
}

async function encodeSharePayload(text) {
  if ("CompressionStream" in window) {
    try {
      const stream = new Blob([text], {type:"application/json"}).stream().pipeThrough(new CompressionStream("gzip"));
      const buffer = await new Response(stream).arrayBuffer();
      return "g." + bytesToBase64Url(new Uint8Array(buffer));
    } catch (e) {
      // 圧縮に失敗した環境では非圧縮へフォールバック。
    }
  }
  return "j." + utf8ToBase64Url(text);
}

async function decodeSharePayload(data) {
  const raw = String(data || "");
  if (raw.startsWith("g.")) {
    if (!("DecompressionStream" in window)) {
      throw new Error("このブラウザは圧縮共有URLの読み込みに対応していません。");
    }
    const bytes = base64UrlToBytes(raw.slice(2));
    const stream = new Blob([bytes], {type:"application/gzip"}).stream().pipeThrough(new DecompressionStream("gzip"));
    return await new Response(stream).text();
  }
  if (raw.startsWith("j.")) return base64UrlToUtf8(raw.slice(2));

  // 旧/手動用: prefixなしbase64urlも一応読む。
  return base64UrlToUtf8(raw);
}

function shareHashData() {
  const hash = String(location.hash || "");
  const match = hash.match(/(?:^#|&)moeShare=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function generateShowcaseShareUrl() {
  const status = byId("showcaseShareStatus");
  const box = byId("showcaseShareUrl");
  if (status) status.textContent = "軽量共有URLを作成中...";
  try {
    syncSkillSimToCalcInputs(false, false);
    syncSelectedWeaponToHiddenInputs();
    const payload = {
      v: 1,
      app: "Master of Epic 物理ダメージ計算webツール",
      savedAt: new Date().toISOString(),
      config: collectShowcaseShareConfig()
    };
    const encoded = await encodeSharePayload(JSON.stringify(payload));
    const baseUrl = location.href.split("#")[0];
    const url = `${baseUrl}#moeShare=${encodeURIComponent(encoded)}`;

    if (box) {
      box.value = url;
      box.focus();
      box.select();
    }

    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        copied = true;
      } else if (box) {
        document.execCommand("copy");
        copied = true;
      }
    } catch (e) {
      copied = false;
    }

    const lengthNote = url.length > 60000
      ? ` URLがかなり長いです（${url.length.toLocaleString()}文字）。共有先で開けない場合はJSON共有を使ってください。`
      : ` ${url.length.toLocaleString()}文字。`;
    if (status) status.textContent = copied ? `軽量共有URLをコピーしました。${lengthNote}` : `軽量共有URLを発行しました。手動でコピーしてください。${lengthNote}`;
  } catch (e) {
    if (status) status.textContent = "共有URLの発行に失敗しました: " + e.message;
  }
}

async function loadConfigFromShareHash() {
  const data = shareHashData();
  if (!data) return false;
  const status = byId("showcaseShareStatus");
  try {
    const text = await decodeSharePayload(data);
    const payload = JSON.parse(text);
    const cfg = payload.config || payload.cfg || payload;
    applyConfig(cfg);
    const box = byId("showcaseShareUrl");
    if (box) box.value = location.href;
    if (status) status.textContent = "共有URLから軽量構成を読み込みました。";
    activateMainTab("showcase");
    return true;
  } catch (e) {
    if (status) status.textContent = "共有URLの読み込みに失敗しました: " + e.message;
    return false;
  }
}
