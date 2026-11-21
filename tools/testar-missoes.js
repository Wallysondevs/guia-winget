#!/usr/bin/env node
/* =========================================================
   Testador das missões (.trycmd) do Guia winget.
   Sem simulador: confere a estrutura de cada caixa e avalia
   as metas do tipo src no pre.solucao (e no pre.script, que
   só deve cumprir src se já for igual à solução). Metas out,
   erro e semerro dependem da saída real colhida e ficam para
   o teste no navegador (cole a saída).

   Uso:
     node tools/testar-missoes.js
     node tools/testar-missoes.js --secao "Coleções"
   ========================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "assets", "site.js");
const RODE_LOCAL = path.join(ROOT, "assets", "rode-local.js");

function uso() {
  return [
    "Uso: node tools/testar-missoes.js [--secao NOME]",
    "  --secao   filtra pela seção do NIVEIS (ex.: Começando, \"Tipos e Valores\")"
  ].join("\n");
}

function args() {
  const out = { secao: null };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--secao" && a[i + 1]) out.secao = a[++i];
    else if (a[i] === "--help" || a[i] === "-h") { console.log(uso()); process.exit(0); }
    else {
      console.error("Opção desconhecida: " + a[i] + "\n" + uso());
      process.exit(2);
    }
  }
  return out;
}

function carregarNiveis() {
  const src = fs.readFileSync(SITE, "utf8");
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src.replace(/\n\(\s*function\s*\(\s*\)\s*\{[\s\S]*$/, "\n") + "\nthis.NIVEIS = NIVEIS;\n", ctx, { filename: "site.js#NIVEIS" });
  if (!Array.isArray(ctx.NIVEIS)) throw new Error("não achei NIVEIS em assets/site.js");
  return ctx.NIVEIS;
}

function carregarAvaliador() {
  const src = fs.readFileSync(RODE_LOCAL, "utf8");
  const m = src.match(/\/\* cmf-avaliador:inicio[^*]*\*\/\s*([\s\S]*?)\s*\/\* cmf-avaliador:fim \*\//);
  if (!m) throw new Error("não achei o trecho cmf-avaliador em rode-local.js.");
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(m[1] + "\nthis.cmfAvaliar = cmfAvaliar;\nthis.cmfNormaliza = cmfNormaliza;\n", ctx, { filename: "rode-local.js#avaliador" });
  if (typeof ctx.cmfAvaliar !== "function") throw new Error("o trecho recortado não exportou cmfAvaliar.");
  return ctx;
}

function trim(s) { return String(s || "").replace(/^\n+/, "").replace(/\s+$/, ""); }

function caixasDe(html) {
  const out = [];
  const re = /<div\s+class="[^"]*\btrycmd\b[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  // fallback: data-goal may be on the opening tag; capture the tag + body until next trycmd or end of reasonable block
  const re2 = /<div([^>]*\btrycmd\b[^>]*)>([\s\S]*?)(?=<div[^>]*\btrycmd\b|<\/div>\s*<\/div>\s*<hr>|<h2>Resumo|$)/gi;
  let m;
  const src = html;
  const tagRe = /<div\b([^>]*\btrycmd\b[^>]*)>/gi;
  const indices = [];
  while ((m = tagRe.exec(src))) indices.push({ start: m.index, attrs: m[1], bodyStart: m.index + m[0].length });
  for (let i = 0; i < indices.length; i++) {
    const end = i + 1 < indices.length ? indices[i + 1].start : src.length;
    const chunk = src.slice(indices[i].start, end);
    const attrs = indices[i].attrs;
    const gm = /\bdata-goal="([^"]*)"/.exec(attrs) || /\bdata-goal="([^"]*)"/.exec(chunk);
    const script = /<pre\s+class="script"[^>]*>([\s\S]*?)<\/pre>/.exec(chunk);
    const solucao = /<pre\s+class="solucao"[^>]*>([\s\S]*?)<\/pre>/.exec(chunk);
    out.push({
      goal: gm ? decode(gm[1]) : "",
      script: script ? trim(decode(script[1])) : "",
      solucao: solucao ? trim(decode(solucao[1])) : "",
      temSol: !!solucao
    });
  }
  return out;
}

function decode(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
}

function soSrc(goal) {
  const partes = String(goal || "").split(";;").map((p) => p.trim()).filter(Boolean);
  return partes.filter((p) => {
    const tipo = (p.indexOf(":") === -1 ? p : p.slice(0, p.indexOf(":"))).trim();
    return tipo === "src";
  });
}

(function main() {
  const opt = args();
  const niveis = carregarNiveis();
  const av = carregarAvaliador();
  let paginas = [];
  niveis.forEach((n) => n.grupos.forEach((g) => g.itens.forEach((i) => {
    const pronta = !(i[2] && i[2].pronta === false);
    if (opt.secao && g.grupo !== opt.secao) return;
    paginas.push({ href: i[0], titulo: i[1], secao: g.grupo, pronta });
  })));

  let falhou = 0, testadas = 0, puladas = 0;
  for (const p of paginas) {
    const arq = path.join(ROOT, p.href);
    if (!p.pronta) { puladas++; continue; }
    if (!fs.existsSync(arq)) {
      console.log("✗ " + p.href + "  marcada pronta, mas o arquivo não existe");
      falhou++; continue;
    }
    const html = fs.readFileSync(arq, "utf8");
    const caixas = caixasDe(html);
    if (!caixas.length) {
      console.log("· " + p.href + "  sem .trycmd");
      continue;
    }
    caixas.forEach((c, idx) => {
      const nome = p.href + " caixa " + (idx + 1);
      if (!c.goal) { console.log("· " + nome + "  sem data-goal"); return; }
      if (!c.temSol) { console.log("✗ " + nome + "  missão sem pre.solucao"); falhou++; return; }
      testadas++;
      const metasSrc = soSrc(c.goal);
      if (!metasSrc.length) {
        console.log("· " + nome + "  sem meta src (ok; out/semerro dependem da coleta)");
        return;
      }
      const goalSrc = metasSrc.join(";;");
      const rSol = av.cmfAvaliar(goalSrc, c.solucao, "");
      const falhasSol = rSol.filter((m) => m.ok !== true);
      if (falhasSol.length) {
        console.log("✗ " + nome + "  a solução não cumpre src: " + falhasSol.map((m) => m.desc || m.falha).join(" ;; "));
        falhou++;
      } else {
        const iguais = c.script === c.solucao;
        const rIni = av.cmfAvaliar(goalSrc, c.script, "");
        const iniOk = rIni.every((m) => m.ok === true);
        if (iniOk && !iguais && c.script) {
          console.log("✗ " + nome + "  o script inicial já cumpre as metas src");
          falhou++;
        } else {
          console.log("✓ " + nome);
        }
      }
    });
  }
  console.log("\n" + testadas + " missão(ões) conferida(s), " + falhou + " com problema, " + puladas + " página(s) não pronta(s) pulada(s).");
  process.exit(falhou ? 1 : 0);
})();
