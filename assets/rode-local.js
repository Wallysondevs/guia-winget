/* =========================================================
   Guia winget — modo "Rode no seu terminal"
   Carregado pelo site.js em cada página com .trycmd.
   Em cada .trycmd: editor com o comando inicial, "Copiar comando",
   caixa para colar a saída do terminal, "Conferir" (avalia as metas
   do data-goal) e "Ver solução" (liberado depois do 1º Conferir).
   Privacidade: o código e a saída colada ficam só na página. Nada
   é enviado (sem fetch/XHR/beacon) nem guardado (sem localStorage,
   sessionStorage, cookies ou IndexedDB).
   ========================================================= */
(function () {
  "use strict";

  /* cmf-avaliador:inicio (o teste em Node recorta este trecho) */
  function cmfNormaliza(s) {
    return String(s == null ? "" : s)
      .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "") // cores ANSI, se vierem na cópia
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .split("\n").map(function (l) { return l.replace(/[ \t]+$/, ""); }).join("\n");
  }
  /* Heurística do "semerro": a saída tem cara de erro do winget se alguma linha
     traz um código de erro do winget (0x8A15xxxx) ou uma das mensagens de falha.
     As mensagens em português foram conferidas nas saídas reais deste guia
     (winget v1.29.380, Windows em pt-BR); as em inglês são as equivalentes do
     winget em inglês, para quem usa o Windows nesse idioma. Pode dar falso
     positivo se o texto de um pacote trouxer uma dessas frases. */
  var CMF_ERRO = [
    /0x8a15[0-9a-f]{4}/i,
    // pt-BR (colhidas)
    /^Nenhum pacote (?:instalado )?(?:foi )?encontr/i,
    /^Nenhuma vers[ãa]o correspondente foi encontrada/i,
    /^O nome do argumento n[ãa]o foi reconhecido/i,
    /^Comando n[ãa]o reconhecido/i,
    /^O n[úu]mero solicitado de resultados deve estar entre/i,
    /^Falha na valida[çc][ãa]o do manifesto/i,
    /^Manifest Error:/,
    // en-US
    /^No (?:installed )?package found matching input criteria/i,
    /^Multiple (?:installed )?packages found matching input criteria/i,
    /^Argument name was not recognized/i,
    /^Unrecognized command/i,
    /^Manifest validation failed/i,
    /^Installer failed with exit code/i,
    /^An unexpected error occurred while executing the command/i,
    // comando inexistente no próprio Windows
    /n[ãa]o [ée] reconhecido como (?:um )?(?:comando interno|nome de cmdlet)/i,
    /is not recognized as an internal or external command/i,
    /is not recognized as the name of a cmdlet/i,
    // where.exe sem resultado
    /^INFO: Could not find files/i,
    /^INFORMA[ÇC][ÕO]ES?: n[ãa]o foi poss[íi]vel localizar/i
  ];
  function cmfTemErro(saida) {
    var linhas = saida.split("\n");
    for (var i = 0; i < linhas.length; i++) {
      for (var j = 0; j < CMF_ERRO.length; j++) if (CMF_ERRO[j].test(linhas[i])) return linhas[i];
    }
    return null;
  }
  function cmfCurto(s) { s = String(s); return s.length > 60 ? s.slice(0, 57) + "…" : s; }
  /* Devolve [{tipo, ok: true|false|null (manual), desc, falha?}] */
  function cmfAvaliar(goal, codigo, saidaBruta) {
    var saida = cmfNormaliza(saidaBruta), cod = cmfNormaliza(codigo), res = [];
    String(goal || "").split(";;").forEach(function (meta) {
      if (!meta.trim()) return;
      var k = meta.indexOf(":"), tipo = (k === -1 ? meta : meta.slice(0, k)).trim(), val = k === -1 ? "" : meta.slice(k + 1);
      var r = { tipo: tipo, ok: false, desc: "" };
      function rx(flags, alvo, rotulo) {
        try { r.ok = new RegExp(val, flags).test(alvo); }
        catch (e) { r.ok = false; r.falha = "regra inválida nesta missão (" + e.message + "); avise quem mantém o guia"; }
        r.desc = rotulo;
      }
      if (tipo === "out") {
        var alvo = cmfNormaliza(val);
        r.ok = alvo !== "" && saida.indexOf(alvo) !== -1;
        r.desc = "a saída mostra \u201c" + cmfCurto(val) + "\u201d";
      } else if (tipo === "outre") {
        rx("m", saida, "a saída tem o padrão esperado (" + cmfCurto(val) + ")");
      } else if (tipo === "src") {
        // o winget não diferencia maiúsculas em IDs e opções: comparação sem diferenciar
        rx("mi", cod, "o comando usa " + cmfCurto(val.replace(/\\b/g, "").replace(/\\(.)/g, "$1")));
      } else if (tipo === "semerro") {
        var linha = cmfTemErro(saida);
        // saída vazia ("(sem saída)") não comprova execução: vira item para o leitor confirmar
        r.ok = linha ? false : saida.trim() === "" ? null : true;
        r.desc = linha ? "rodar sem erros (achei: \u201c" + cmfCurto(linha.trim()) + "\u201d)" : saida.trim() === "" ? "confirme que o comando executou sem erros no seu terminal" : "rodou sem erros";
      } else if (tipo === "erro") {
        r.ok = val !== "" && saida.indexOf(cmfNormaliza(val)) !== -1;
        r.desc = "aparece o erro \u201c" + cmfCurto(val) + "\u201d";
      } else if (tipo === "exit") {
        r.ok = null; r.desc = "confira você mesmo: o código de saída é " + val + " (no PowerShell, digite $LASTEXITCODE logo depois de rodar)";
      } else if (tipo === "arquivo") {
        var t = val.indexOf("~"), nome = t === -1 ? val : val.slice(0, t), cont = t === -1 ? "" : val.slice(t + 1);
        r.ok = null; r.desc = "confira você mesmo: existe \u201c" + nome + "\u201d" + (cont ? " com o texto \u201c" + cmfCurto(cont) + "\u201d" : "") + " (use dir / type)";
      } else {
        r.ok = null; r.desc = "confira você mesmo: " + meta;
      }
      res.push(r);
    });
    return res;
  }
  /* cmf-avaliador:fim */

  if (typeof document === "undefined") return;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function copiar(texto, botao) {
    var rot = botao.textContent;
    var feito = function () { botao.textContent = "Copiado!"; setTimeout(function () { botao.textContent = rot; }, 1500); };
    var antigo = function () {
      var t = el("textarea", { "aria-hidden": "true" });
      t.value = texto; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); feito(); } catch (e) { botao.textContent = "Selecione e copie (Ctrl+C)"; }
      document.body.removeChild(t);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(feito, antigo);
    else antigo();
  }

  if (!document.querySelector('link[href$="rode-local.css"]')) {
    document.head.appendChild(el("link", { rel: "stylesheet", href: "assets/rode-local.css" }));
  }

  var n = 0;
  document.querySelectorAll(".trycmd").forEach(function (box) {
    if (box.querySelector(".cmf")) return;
    n++;
    var pre = box.querySelector("pre.script"), sol = box.querySelector("pre.solucao");
    var inicial = pre ? pre.textContent.replace(/^\n+/, "").replace(/\s+$/, "") : "";
    var arq = "comando";
    var goal = box.getAttribute("data-goal") || "";
    var id = "cmf" + n;
    var head = box.querySelector(".try-head");
    if (head && /clique em Rodar|copie o código/.test(head.textContent)) {
      head.textContent = "Experimente: copie o comando, rode no seu Windows e cole a resposta";
    }
    if (pre) pre.hidden = true;
    if (sol) sol.hidden = true;

    var w = el("div", { "class": "cmf ts" });
    w.innerHTML =
      '<p class="cmf-aviso">Este guia não roda o winget no navegador: o winget só existe no Windows. Ajuste o comando abaixo, copie, cole no PowerShell (ou no Prompt de Comando) do seu Windows, aperte Enter e cole a resposta.</p>' +
      '<div class="ts-bar"><span class="ts-arq">comando</span><span class="ts-sp"></span>' +
      '<button type="button" class="sim-btn cmf-copiar">Copiar comando</button>' +
      '<button type="button" class="sim-btn cmf-reset">Voltar ao original</button></div>' +
      '<div class="ts-editor"><label class="cmf-sr" for="' + id + '-cod">Comando para rodar no Windows</label>' +
      '<textarea class="ts-code cmf-cod" id="' + id + '-cod" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea></div>' +
      '<ol class="cmf-passos"><li>Complete o comando no editor e clique em <strong>Copiar comando</strong>.</li><li>Cole no PowerShell ou no Prompt de Comando do Windows e aperte <kbd>Enter</kbd>.</li><li>Copie o que o winget <strong>respondeu</strong> (não o comando) e cole abaixo.</li></ol>' +
      '<label class="cmf-rot" for="' + id + '-out">Cole aqui o que o winget respondeu (não o comando)</label>' +
      '<textarea class="cmf-out" id="' + id + '-out" rows="5" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="Ex.: o texto que apareceu no terminal depois de você apertar Enter"></textarea>' +
      '<div class="ex-actions cmf-acoes"><button type="button" class="cmf-conferir">Conferir</button>' +
      '<button type="button" class="secondary cmf-ver" disabled title="Liberado depois do primeiro Conferir">Ver solução</button></div>' +
      '<div class="cmf-res" aria-live="polite"></div>';
    if (pre) pre.parentNode.insertBefore(w, pre); else box.appendChild(w);

    var cod = w.querySelector(".cmf-cod"), out = w.querySelector(".cmf-out"), resDiv = w.querySelector(".cmf-res");
    var verBtn = w.querySelector(".cmf-ver");
    function ajusta() { cod.rows = Math.max(3, cod.value.split("\n").length + 1); }
    cod.value = inicial; ajusta();
    cod.addEventListener("input", ajusta);
    cod.addEventListener("keydown", function (e) {
      if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        if (cod.dataset.sair) { delete cod.dataset.sair; return; }
        e.preventDefault();
        var a = cod.selectionStart, b = cod.selectionEnd;
        cod.value = cod.value.slice(0, a) + "    " + cod.value.slice(b);
        cod.selectionStart = cod.selectionEnd = a + 4; ajusta();
      } else if (e.key === "Escape") cod.dataset.sair = "1";
    });
    w.querySelector(".cmf-copiar").addEventListener("click", function () { copiar(cod.value, this); });
    w.querySelector(".cmf-reset").addEventListener("click", function () { cod.value = inicial; ajusta(); cod.focus(); });

    w.querySelector(".cmf-conferir").addEventListener("click", function () {
      verBtn.disabled = false; verBtn.removeAttribute("title");
      // Detecta quando a pessoa colou o código em vez da saída
      var norm = function (t) {
        return t.replace(/\r\n?/g, "\n")
          .replace(/^(PS )?[A-Za-z]:\\[^>\n]*>\s*/gm, "")
          .replace(/^([a-z_][\w-]*@[\w.-]+:[^$\n]*)?\$\s*/gm, "")
          .replace(/\s+/g, " ").trim().toLowerCase();
      };
      var colado = norm(out.value);
      if (!colado) {
        resDiv.innerHTML = '<p class="ex-result bad">Cole primeiro o que o terminal respondeu. Se ele não mostrou nada, escreva <code>(sem saída)</code> na caixa.</p>';
        out.focus(); return;
      }
      var linhasCod = [cod.value, inicial, sol ? sol.textContent : ""].join("\n").split("\n").map(norm).filter(function (l) { return l && l.charAt(0) !== "#"; });
      var linhasCol = out.value.split("\n").map(norm).filter(Boolean);
      var soCodigo = linhasCol.length && linhasCol.every(function (l) { return linhasCod.indexOf(l) >= 0; });
      if (soCodigo || colado === norm(cod.value) || colado === norm(inicial) || (sol && colado === norm(sol.textContent))) {
        resDiv.innerHTML = '<p class="ex-result bad">Parece que você colou o <strong>comando</strong>, não a resposta. Rode o comando no PowerShell ou no Prompt de Comando e cole aqui o que o winget <strong>respondeu</strong>.</p>';
        out.focus(); return;
      }
      var metas;
      try { metas = cmfAvaliar(goal, cod.value, /^\s*\(sem sa[ií]da\)\s*$/i.test(out.value) ? "" : out.value); }
      catch (e) { resDiv.innerHTML = '<p class="ex-result bad">Não consegui conferir esta missão (' + esc(e.message) + ').</p>'; return; }
      var faltam = 0, manuais = 0, html = '<ul class="cmf-metas">';
      metas.forEach(function (m) {
        var cls = m.ok === null ? "manual" : m.ok ? "ok" : "bad", sinal = m.ok === null ? "☐" : m.ok ? "✔" : "✘";
        if (m.ok === false) faltam++;
        if (m.ok === null) manuais++;
        html += '<li class="' + cls + '"><span class="cmf-sinal" aria-hidden="true">' + sinal + "</span> " +
          '<span class="cmf-sr">' + (m.ok === null ? "Conferir à mão: " : m.ok ? "Cumprida: " : "Falta: ") + "</span>" +
          esc(m.desc) + (m.falha ? ' <em class="cmf-falha">(' + esc(m.falha) + ")</em>" : "") + "</li>";
      });
      html += "</ul>";
      if (!metas.length) html = "";
      var fim = faltam ? '<p class="ex-result bad">Ainda não: falta' + (faltam > 1 ? "m " + faltam + " metas" : " 1 meta") + ' (marcada' + (faltam > 1 ? "s" : "") + " com ✘). Ajuste e rode de novo." + (out.value.trim() ? "" : " Você colou a saída do terminal na caixa acima?") + "</p>"
        : manuais ? '<p class="ex-result">Quase lá! O que dá pra conferir aqui está ✔. Confira você mesmo o' + (manuais > 1 ? "s itens marcados" : " item marcado") + " com ☐ e a missão está cumprida.</p>"
        : '<p class="ex-result ok">Missão cumprida!</p>';
      resDiv.innerHTML = html + fim;
    });

    verBtn.addEventListener("click", function () {
      if (!sol) return;
      var caixa = w.querySelector(".sim-sol");
      if (caixa) { caixa.hidden = !caixa.hidden; verBtn.textContent = caixa.hidden ? "Ver solução" : "Esconder solução"; return; }
      var txt = sol.textContent.replace(/^\n+/, "").replace(/\s+$/, "");
      caixa = el("div", { "class": "sim-sol" },
        '<p class="sim-sol-tit">Um comando que resolve</p><pre class="sim-sol-cmd">' + esc(txt) + "</pre>" +
        '<button type="button" class="sim-btn2 secundario cmf-usar">Colocar no editor</button>');
      resDiv.parentNode.insertBefore(caixa, resDiv.nextSibling);
      caixa.querySelector(".cmf-usar").addEventListener("click", function () { cod.value = txt; ajusta(); cod.focus(); });
      verBtn.textContent = "Esconder solução";
    });
  });
})();
