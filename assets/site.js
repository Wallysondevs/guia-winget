/* =========================================================
   Guia winget — navegação e componentes
   NIVEIS é a única fonte do menu lateral, do selo de nível,
   dos botões Anterior/Próximo e do mapa da capa. Para adicionar
   uma página, inclua-a aqui. Um item com {pronta: false} não
   aparece no menu, no pager nem no mapa, e links para ele viram
   texto simples.
   ========================================================= */
var NIVEIS = [
  { id: "n1", nome: "Nível 1 · Iniciante", curto: "Iniciante", desc: "Do zero ao primeiro winget search: terminal, ajuda, busca e detalhes", grupos: [
    { grupo: "Começando", itens: [
      ["index.html", "Início"],
      ["introducao.html", "O que é o winget"],
      ["terminal-windows.html", "Abrindo o Terminal (PowerShell e CMD)"],
      ["instalar-e-versao.html", "Instalação e Versão (--version)"],
      ["winget-info.html", "Informações do winget (--info)"],
      ["ajuda.html", "Pedindo Ajuda (--help)"],
      ["lendo-erros.html", "Lendo Mensagens de Erro"]
    ]},
    { grupo: "Encontrando Pacotes", itens: [
      ["buscar.html", "Buscando Pacotes (search)"],
      ["buscar-filtros.html", "Filtros da Busca (--id, --name, --exact)"],
      ["buscar-tag-moniker.html", "Tags, Monikers e Comandos"],
      ["mostrar.html", "Detalhes de um Pacote (show)"],
      ["versoes.html", "Versões Disponíveis (--versions)"],
      ["tipos-de-instalador.html", "Tipos de Instalador"]
    ]}
  ]},
  { id: "n2", nome: "Nível 2 · Intermediário", curto: "Intermediário", desc: "Instalar, listar, atualizar, fixar e remover com segurança", grupos: [
    { grupo: "Antes de Instalar", itens: [
      ["acordos-e-interatividade.html", "Contratos e Modo Não Interativo"],
      ["baixar.html", "Baixando sem Instalar (download)"],
      ["escopo-e-portatil.html", "Escopo de Usuário e Pacotes Portáteis"]
    ]},
    { grupo: "Ciclo de Vida", itens: [
      ["instalar.html", "Instalando (install)"],
      ["listar.html", "Listando o que Está Instalado (list)"],
      ["atualizar.html", "Atualizando (upgrade)"],
      ["fixar-versoes.html", "Fixando Versões (pin)"],
      ["desinstalar.html", "Desinstalando (uninstall)"],
      ["ciclo-completo.html", "Projeto: Ciclo Completo de um Pacote"]
    ]},
    { grupo: "Diagnóstico", itens: [
      ["codigos-de-saida.html", "Códigos de Saída"],
      ["erros-de-instalacao.html", "Erros ao Instalar e Remover"]
    ]}
  ]},
  { id: "n3", nome: "Nível 3 · Avançado", curto: "Avançado", desc: "Fontes, configurações, manifestos e automação", grupos: [
    { grupo: "Fontes e Configurações", itens: [
      ["fontes.html", "Fontes (source list e export)"],
      ["configuracoes.html", "Configurações (settings export)"],
      ["recursos-experimentais.html", "Recursos Experimentais (features)"]
    ]},
    { grupo: "Manifestos", itens: [
      ["manifestos.html", "Manifestos YAML"],
      ["hash.html", "Hash de Arquivos (hash)"],
      ["validar-manifesto.html", "Validando Manifestos (validate)"]
    ]},
    { grupo: "Automação", itens: [
      ["scripts-com-winget.html", "winget em Scripts do PowerShell"],
      ["boas-praticas.html", "Boas Práticas e Segurança"],
      ["referencia-rapida.html", "Referência Rápida"]
    ]}
  ]}
];

(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var atual = location.pathname.split("/").pop() || "index.html";
  if (!document.getElementById("estilo-em-breve")) {
    var estiloEmBreve = document.createElement("style");
    estiloEmBreve.id = "estilo-em-breve";
    estiloEmBreve.textContent = ".em-breve{color:var(--muted)} .sidebar span.em-breve{display:block;padding:3px 16px 3px 24px;font-size:14.5px;line-height:1.6}";
    document.head.appendChild(estiloEmBreve);
  }

  function estaPronta(i) { return !(i[2] && i[2].pronta === false); }

  // Lista linear de páginas (para Anterior/Próximo) e localização da atual.
  // O pager usa só as prontas: as {pronta: false} são puladas.
  var plano = [], aqui = null;
  NIVEIS.forEach(function (n) {
    n.grupos.forEach(function (g) {
      g.itens.forEach(function (i) {
        var item = { href: i[0], titulo: i[1], nivel: n, grupo: g.grupo, pronta: estaPronta(i) };
        plano.push(item);
        if (i[0] === atual) aqui = item;
      });
    });
  });
  var planoNav = plano.filter(function (p) { return p.pronta; });
  var pos = aqui && aqui.pronta ? planoNav.indexOf(aqui) : -1;

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function semAcento(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  /* ---------- Barra superior ---------- */
  var links = NIVEIS.map(function (n) {
    var primeira = null;
    n.grupos.forEach(function (g) {
      g.itens.forEach(function (i) {
        if (!primeira && estaPronta(i)) primeira = i[0];
      });
    });
    var ativo = (aqui && aqui.nivel === n) ? " ativo" : "";
    if (primeira) return '<a class="top-link' + ativo + '" href="' + primeira + '">' + n.curto + "</a>";
    return "";
  }).join("");
  var header = el("header", { "class": "topbar" },
    '<button class="icon-btn" id="menu-btn" aria-label="Abrir menu" aria-expanded="false">&#9776;</button>' +
    '<a class="brand" href="index.html"><span class="brand-mark">&gt;_</span>Guia winget</a>' +
    '<nav class="top-links" aria-label="Níveis">' + links + "</nav>" +
    '<span class="spacer"></span>' +
    '<button class="icon-btn" id="theme-btn" aria-label="Alternar tema claro/escuro" title="Alternar tema"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg></button>');
  body.insertBefore(header, body.firstChild);

  /* ---------- Menu lateral com abas de nível ---------- */
  var sidebar = document.getElementById("sidebar");
  if (sidebar) {
    var nivelAtivo = aqui ? aqui.nivel.id : "n1";
    var html = '<div class="sidebar-filter"><input type="search" placeholder="Buscar em todos os níveis…" aria-label="Buscar tópicos"></div>';
    html += '<div class="nivel-tabs" role="tablist">' + NIVEIS.map(function (n) {
      return '<button type="button" role="tab" data-nivel="' + n.id + '" class="tab-' + n.id + '">' + n.curto + "</button>";
    }).join("") + "</div>";
    NIVEIS.forEach(function (n) {
      html += '<div class="nivel-lista" data-nivel="' + n.id + '"><p class="nivel-desc">' + n.desc + "</p>";
      n.grupos.forEach(function (g) {
        if (!g.itens.some(estaPronta)) return;
        html += '<div class="grupo"><h2>' + g.grupo + "</h2><ul>";
        g.itens.forEach(function (i) {
          if (estaPronta(i)) html += '<li><a href="' + i[0] + '"' + (i[0] === atual ? ' class="active" aria-current="page"' : "") + ">" + i[1] + "</a></li>";
        });
        html += "</ul></div>";
      });
      html += "</div>";
    });
    sidebar.innerHTML = html;

    var mostrar = function (id) {
      sidebar.querySelectorAll(".nivel-lista").forEach(function (l) { l.hidden = l.getAttribute("data-nivel") !== id; });
      sidebar.querySelectorAll(".nivel-tabs button").forEach(function (b) {
        var on = b.getAttribute("data-nivel") === id;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
    };
    mostrar(nivelAtivo);
    sidebar.querySelectorAll(".nivel-tabs button").forEach(function (b) {
      b.addEventListener("click", function () { mostrar(b.getAttribute("data-nivel")); sidebar.scrollTop = 0; });
    });

    var ativo = sidebar.querySelector("a.active");
    if (ativo) sidebar.scrollTop = ativo.offsetTop - sidebar.clientHeight / 2;

    sidebar.querySelector(".sidebar-filter input").addEventListener("input", function () {
      var q = semAcento(this.value.trim());
      if (!q) { mostrar(nivelAtivo); sidebar.querySelectorAll(".grupo, li").forEach(function (x) { x.style.display = ""; }); sidebar.classList.remove("buscando"); return; }
      sidebar.classList.add("buscando");
      sidebar.querySelectorAll(".nivel-lista").forEach(function (l) {
        var algumNivel = false;
        l.querySelectorAll(".grupo").forEach(function (g) {
          var algum = false;
          g.querySelectorAll("li").forEach(function (li) {
            var ok = semAcento(li.textContent + " " + g.querySelector("h2").textContent).indexOf(q) !== -1;
            li.style.display = ok ? "" : "none";
            if (ok) algum = true;
          });
          g.style.display = algum ? "" : "none";
          if (algum) algumNivel = true;
        });
        l.hidden = !algumNivel;
      });
    });
  }

  /* ---------- Selo de nível abaixo do título ---------- */
  var h1 = document.querySelector(".content h1");
  if (h1 && aqui && atual !== "index.html") {
    var selo = el("p", { "class": "selo selo-" + aqui.nivel.id }, '<span class="selo-nivel">' + aqui.nivel.nome + '</span><span class="selo-grupo">' + aqui.grupo + "</span>");
    h1.parentNode.insertBefore(selo, h1.nextSibling);
  }

  /* ---------- Anterior / Próximo ---------- */
  document.querySelectorAll(".pager").forEach(function (p) {
    var h = "";
    if (pos > 0) h += '<a class="prev" href="' + planoNav[pos - 1].href + '">&#10094; Anterior</a>';
    if (pos >= 0 && pos < planoNav.length - 1) h += '<a class="next" href="' + planoNav[pos + 1].href + '">Próximo &#10095;</a>';
    p.innerHTML = h;
  });

  /* Links internos para páginas {pronta: false} viram texto simples, sem 404. */
  var naoProntas = {};
  NIVEIS.forEach(function (n) {
    n.grupos.forEach(function (g) {
      g.itens.forEach(function (i) { if (!estaPronta(i)) naoProntas[i[0]] = true; });
    });
  });
  document.querySelectorAll("a[href]").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (/^(https?:|mailto:|javascript:|#|\/\/)/i.test(href)) return;
    var dest = href.split("#")[0].split("?")[0].split("/").pop();
    if (!naoProntas[dest]) return;
    var s = document.createElement("span");
    s.innerHTML = a.innerHTML;
    a.parentNode.replaceChild(s, a);
  });

  /* ---------- Rodapé ---------- */
  var content = document.querySelector(".content");
  if (content) {
    content.appendChild(el("footer", { "class": "site-footer" },
      "Guia winget · O gerenciador de pacotes do Windows do zero · Copie o comando, rode no seu Windows e cole a resposta · Saídas reais, colhidas com o winget no Windows."));
  }

  /* ---------- Mapa dos níveis na capa (gerado de NIVEIS) ---------- */
  var mapa = document.getElementById("mapa-niveis");
  if (mapa) {
    NIVEIS.forEach(function (n) {
      var card = el("div", { "class": "trilha " + n.id });
      var primeira = null;
      n.grupos.forEach(function (g) {
        g.itens.forEach(function (i) {
          if (!primeira && estaPronta(i) && i[0] !== "index.html") primeira = i;
        });
      });
      var h = "<h3>" + esc(n.nome) + "</h3><p>" + esc(n.desc) + "</p><ul>";
      n.grupos.forEach(function (g) {
        var itens = g.itens.filter(function (i) { return i[0] !== "index.html" && estaPronta(i); });
        if (!itens.length) return;
        h += '<li><a href="' + itens[0][0] + '">' + esc(g.grupo) + "</a>: ";
        h += itens.map(function (i) { return esc(i[1]); }).join(", ");
        h += "</li>";
      });
      h += "</ul>";
      if (!primeira) return;
      h += '<a class="btn" href="' + primeira[0] + '">Começar &#10095;</a>';
      card.innerHTML = h;
      mapa.appendChild(card);
    });
  }

  /* ---------- Tema ---------- */
  document.getElementById("theme-btn").addEventListener("click", function () {
    var t = root.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var novo = t === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", novo);
    try { localStorage.setItem("tema", novo); } catch (e) {}
  });

  /* ---------- Menu no celular ---------- */
  var menuBtn = document.getElementById("menu-btn");
  menuBtn.addEventListener("click", function () {
    var aberto = body.classList.toggle("menu-open");
    menuBtn.setAttribute("aria-expanded", aberto ? "true" : "false");
  });

  /* ---------- Copiar ---------- */
  function botaoCopiar(bloco, texto) {
    var b = el("button", { "class": "copy-btn", "type": "button" }, "copiar");
    b.addEventListener("click", function () {
      var feito = function () { b.textContent = "copiado!"; setTimeout(function () { b.textContent = "copiar"; }, 1500); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(feito);
      } else {
        var t = el("textarea"); t.value = texto; body.appendChild(t); t.select();
        try { document.execCommand("copy"); feito(); } catch (e) {}
        body.removeChild(t);
      }
    });
    bloco.appendChild(b);
  }

  /* ---------- Sessão de terminal (máquina fictícia) ----------
     <pre class="term">$ comando
     saída do comando        « anotação opcional
     #> comando como root
     </pre>
     data-user (ana) · data-host (notebook) · data-cwd (~)
     O prompt acompanha os "cd" da própria sessão. */
  function resolver(cwd, alvo, home) {
    if (!alvo || alvo === "~") return home;
    if (alvo === "-") return cwd;
    if (alvo.indexOf("~/") === 0) alvo = home + alvo.slice(1);
    var partes = (alvo[0] === "/" ? alvo : cwd + "/" + alvo).split("/"), out = [];
    partes.forEach(function (x) { if (!x || x === ".") return; if (x === "..") out.pop(); else out.push(x); });
    return "/" + out.join("/");
  }
  function curto(p, home) { return p === home ? "~" : p.indexOf(home + "/") === 0 ? "~" + p.slice(home.length) : p; }


  /* ---------- acompanhar a pasta atual nas sessões pre.term ----------
     Entende cd/pushd/popd com aspas, barras invertidas, ~, variáveis atribuídas
     na própria sessão, cd - e CDPATH (pela linha que o Bash imprime), e não
     muda a pasta quando a saída mostra que o comando falhou. */
  function saidaDepois(linhas, idx) {
    var out = [], j = idx + 1;
    while (j < linhas.length && /^> ?/.test(linhas[j])) j++; // linhas de continuação
    for (; j < linhas.length; j++) {
      if (/^(\$|#>)( |$)/.test(linhas[j])) break;
      out.push(linhas[j].replace(/\s*«.*$/, ""));
    }
    return out;
  }
  function palavrasShell(txt, vars, home) {
    var res = [], cur = null, i = 0, c;
    function add(x) { cur = (cur || "") + x; }
    function variavel() {
      var m = /^\$(\{([A-Za-z_]\w*)\}|([A-Za-z_]\w*))/.exec(txt.slice(i));
      if (!m) { add("$"); i++; return; }
      var n = m[2] || m[3];
      add(n === "HOME" ? home : n === "PWD" ? vars.__pwd : n === "OLDPWD" ? (vars.__oldpwd || "") : (vars[n] != null ? vars[n] : "\u0000"));
      i += m[0].length;
    }
    while (i < txt.length) {
      c = txt[i];
      if (/\s/.test(c)) { if (cur !== null) { res.push(cur); cur = null; } i++; continue; }
      if (c === "~" && cur === null && (i + 1 === txt.length || /[\/\s]/.test(txt[i + 1]))) { add(home); i++; continue; }
      if (c === "\\") { add(txt[i + 1] || ""); i += 2; continue; }
      if (c === "'") { var f = txt.indexOf("'", i + 1); if (f < 0) f = txt.length; add(txt.slice(i + 1, f)); i = f + 1; continue; }
      if (c === '"') {
        i++; add("");
        while (i < txt.length && txt[i] !== '"') {
          if (txt[i] === "\\" && /[$`"\\]/.test(txt[i + 1] || "")) { add(txt[i + 1]); i += 2; }
          else if (txt[i] === "$") variavel();
          else { add(txt[i]); i++; }
        }
        i++; continue;
      }
      if (c === "$") { variavel(); continue; }
      add(c); i++;
    }
    if (cur !== null) res.push(cur);
    return res;
  }
  function segmentos(cmd) { // divide em && ; || fora de aspas
    var segs = [], cur = "", q = "", i;
    for (i = 0; i < cmd.length; i++) {
      var c = cmd[i];
      if (q) { cur += c; if (c === "\\" && q === '"') { cur += cmd[++i] || ""; } else if (c === q) q = ""; continue; }
      if (c === "\\") { cur += c + (cmd[++i] || ""); continue; }
      if (c === "'" || c === '"') { q = c; cur += c; continue; }
      if ((c === "&" && cmd[i + 1] === "&") || (c === "|" && cmd[i + 1] === "|")) { segs.push(cur); cur = ""; i++; continue; }
      if (c === ";" || c === "|") { segs.push(cur); cur = ""; continue; }
      cur += c;
    }
    segs.push(cur);
    return segs;
  }
  function acompanharCd(cmd, cwd, home, ses, saida) {
    var falhou = saida.some(function (l) { return /^bash: (cd|pushd|popd|dirs): /.test(l); });
    var impresso = saida.filter(function (l) { return /^(\/|~)/.test(l); })[0];
    var mudou = false;
    segmentos(cmd).forEach(function (seg) {
      ses.vars.__pwd = cwd; ses.vars.__oldpwd = ses.oldpwd;
      var w = palavrasShell(seg.trim(), ses.vars, home);
      if (!w.length) return;
      // atribuições simples: nome=valor (sem comando depois)
      if (w.every(function (x) { return /^[A-Za-z_]\w*=/.test(x); })) {
        w.forEach(function (x) { var k = x.indexOf("="); ses.vars[x.slice(0, k)] = x.slice(k + 1); });
        return;
      }
      var nome = w[0], args = w.slice(1).filter(function (a) { return !/^-[LPe@]+$/.test(a); });
      if (nome !== "cd" && nome !== "pushd" && nome !== "popd") return;
      if (falhou) return;
      if (args.some(function (a) { return a.indexOf("\u0000") !== -1; })) return; // variável desconhecida
      var novo = null;
      if (nome === "cd") {
        if (args[0] === "-") { if (!ses.oldpwd) return; novo = ses.oldpwd; }
        else if (impresso && !mudou) novo = impresso.replace(/^~(?=\/|$)/, home); // CDPATH: o Bash imprime a pasta
        else novo = resolver(cwd, args[0] || home, home);
      } else if (nome === "pushd") {
        if (impresso && !mudou) { // pushd imprime a pilha: a primeira entrada é a pasta de destino
          var topo = impresso.split(" ")[0].replace(/^~(?=\/|$)/, home);
          novo = topo;
        } else novo = args[0] ? resolver(cwd, args[0], home) : (ses.pilha[ses.pilha.length - 1] || null);
        if (novo) ses.pilha.push(cwd);
      } else if (nome === "popd") {
        if (impresso && !mudou) novo = impresso.split(" ")[0].replace(/^~(?=\/|$)/, home);
        else novo = ses.pilha.length ? ses.pilha[ses.pilha.length - 1] : null;
        ses.pilha.pop();
      }
      if (novo && novo !== cwd) { ses.oldpwd = cwd; cwd = novo; mudou = true; }
      else if (novo) mudou = true;
    });
    return cwd;
  }
  document.querySelectorAll("pre.term").forEach(function (pre) {
    var user = pre.getAttribute("data-user") || "ana",
      host = pre.getAttribute("data-host") || "notebook",
      homeUser = user === "root" ? "/root" : "/home/" + user,
      cwd = resolver("/", (pre.getAttribute("data-cwd") || "~").replace(/^~/, homeUser), homeUser);
    var linhas = pre.textContent.replace(/^\n+|\s+$/g, "").split("\n"), html = [], cmds = [];
    var tituloCwd = curto(cwd, homeUser), primeiroUser = user, pilhaSu = [];
    var modoPS = false, ultimoCmd = false, sessao = { vars: {}, oldpwd: null, pilha: [] };
    linhas.forEach(function (l, idx) {
      var mc = ultimoCmd && !modoPS && /^> ?(.*)$/.exec(l);
      if (mc) {
        var nc = "", ic = mc[1].indexOf("«");
        if (ic !== -1) { nc = '<span class="t-a">← ' + esc(mc[1].slice(ic + 1).trim()) + "</span>"; mc[1] = mc[1].slice(0, ic).replace(/\s+$/, ""); }
        html.push('<span class="t-p">&gt; </span><span class="t-c">' + esc(mc[1]) + "</span>" + (nc ? "   " + nc : ""));
        cmds[cmds.length - 1] += "\n" + mc[1];
        return;
      }
      // o prompt do cmd ("C:\Users\ana>dir") é o padrão deste guia;
      // o parser ainda entende o do PowerShell ("PS C:\Users\ana> ") se aparecer numa comparação
      var ms = /^(PS (?:[A-Za-z]:\\|\/|[A-Za-z]+:)[^>]*>)(?: (.*)|())$/.exec(l) || (modoPS && /^(>>)(?: (.*)|())$/.exec(l)) || /^([A-Z]:\\[^>]*>)(.*)$/.exec(l);
      if (ms) { if (ms[1] !== ">>") { modoPS = true; cmds.push((ms[2] || "").replace(/\s*«.*$/, "")); } else if (cmds.length) cmds[cmds.length - 1] += "\n" + (ms[2] || "").replace(/\s*«.*$/, ""); }
      if (ms) {
        var cs = ms[2] || "", ns = "", is = cs.indexOf("«");
        if (is !== -1) { ns = '<span class="t-a">← ' + esc(cs.slice(is + 1).trim()) + "</span>"; cs = cs.slice(0, is).replace(/\s+$/, ""); }
        html.push('<span class="t-p">' + esc(ms[1]) + ' </span><span class="t-c">' + esc(cs) + "</span>" + (ns ? "   " + ns : ""));
        ultimoCmd = false;
        return;
      }
      // prompt com ambiente virtual ativo: "(.venv) ana@notebook:~/loja$ pip list" ou só "(.venv) $ pip list"
      var mv = /^\(([^()\s]+)\) (?:([a-z_][a-z0-9_-]*)@([a-z0-9-]+):([^$\s]*))?\$(?: (.*)|())$/.exec(l);
      if (mv) {
        var cv = mv[5] || "", nv = "", iv = cv.indexOf("«");
        if (iv !== -1) { nv = '<span class="t-a">← ' + esc(cv.slice(iv + 1).trim()) + "</span>"; cv = cv.slice(0, iv).replace(/\s+$/, ""); }
        var dirv = mv[4] != null ? mv[4] : curto(cwd, homeUser);
        html.push('<span class="t-p">(' + esc(mv[1]) + ') <span class="t-u">' + esc(mv[2] || user) + "@" + esc(mv[3] || host) + '</span>:<span class="t-d">' + esc(dirv) + "</span>$ </span>" + '<span class="t-c">' + esc(cv) + "</span>" + (nv ? "   " + nv : ""));
        cmds.push(cv);
        if (mv[4] == null) cwd = acompanharCd(cv, cwd, homeUser, sessao, saidaDepois(linhas, idx));
        ultimoCmd = true;
        return;
      }
      var m = /^(\$|#>)(?: (.*)|())$/.exec(l);
      if (m && m[2] == null) m[2] = "";
      ultimoCmd = !!m;
      if (m) {
        var root_ = m[1] === "#>", u = root_ ? "root" : user, home = root_ ? "/root" : homeUser;
        var nota = "", ia = m[2].indexOf("«");
        if (ia !== -1) { nota = '<span class="t-a">← ' + esc(m[2].slice(ia + 1).trim()) + "</span>"; m[2] = m[2].slice(0, ia).replace(/\s+$/, ""); }
        html.push('<span class="t-p"><span class="t-u">' + u + "@" + host + '</span>:<span class="t-d">' + esc(curto(cwd, home)) + "</span>" + (root_ ? "#" : "$") + " </span>" + '<span class="t-c">' + esc(m[2]) + "</span>" + (nota ? "   " + nota : ""));
        cmds.push(m[2]);
        modoPS = /^\s*pwsh\s*$/.test(m[2]);
        cwd = acompanharCd(m[2], cwd, home, sessao, saidaDepois(linhas, idx));
        if (/^\s*sudo -i\s*$/.test(m[2])) cwd = "/root";
        if (/^\s*su(\s+-|\s+-l|\s+--login)?(\s+root)?\s*$/.test(m[2])) { pilhaSu.push({ cwd: cwd }); if (/-/.test(m[2])) cwd = "/root"; }
        if (/^\s*(exit|logout)\s*$/.test(m[2]) && root_ && pilhaSu.length) cwd = pilhaSu.pop().cwd;
        return;
      }
      var a = l.indexOf("«");
      if (a !== -1) html.push('<span class="t-o">' + esc(l.slice(0, a)) + '</span><span class="t-a">← ' + esc(l.slice(a + 1).trim()) + "</span>");
      else html.push('<span class="t-o">' + esc(l) + "</span>");
    });
    var janela = el("div", { "class": "term-win" });
    var titulo = pre.getAttribute("data-title") || (primeiroUser + "@" + host + ": " + tituloCwd);
    janela.innerHTML = '<div class="term-bar"><span class="sim-dots"><i></i><i></i><i></i></span><span class="term-title">' + esc(titulo) + "</span></div>";
    pre.parentNode.insertBefore(janela, pre);
    pre.innerHTML = html.join("\n");
    janela.appendChild(pre);
    if (cmds.join("").trim()) botaoCopiar(janela, cmds.filter(function (c) { return c.trim(); }).join("\n"));
  });

  /* ---------- Anatomia do comando ----------
     <dl class="anatomy">
       <dt>pgrep</dt><dd>o programa que procura processos</dd>
       <dt>-a</dt><dd>mostra a linha de comando completa</dd>
     </dl> */
  document.querySelectorAll("dl.anatomy").forEach(function (dl) {
    var dts = dl.querySelectorAll("dt"), linha = el("div", { "class": "anat-cmd" });
    dts.forEach(function (dt, i) {
      var n = i + 1;
      dt.setAttribute("data-n", n);
      dt.classList.add("anat-" + (i % 6));
      var parte = el("span", { "class": "anat-parte anat-" + (i % 6), "data-n": n }, esc(dt.textContent));
      linha.appendChild(parte);
      if (i < dts.length - 1) linha.appendChild(document.createTextNode(" "));
    });
    dl.parentNode.insertBefore(linha, dl);
    var caixa = el("div", { "class": "anat-box" });
    dl.parentNode.insertBefore(caixa, linha);
    caixa.appendChild(el("p", { "class": "anat-label" }, "Anatomia"));
    caixa.appendChild(linha);
    caixa.appendChild(dl);
  });

  /* ---------- Blocos antigos pre.cmd (ainda suportados) ---------- */
  document.querySelectorAll("pre.cmd").forEach(function (pre) {
    var linhas = pre.textContent.replace(/^\n+|\s+$/g, "").split("\n"), continua = false, copiaveis = [];
    pre.innerHTML = linhas.map(function (l) {
      var out;
      if (/^\s*#/.test(l)) out = '<span class="cmt">' + esc(l) + "</span>";
      else if (continua || l.trim() === "") { out = esc(l); copiaveis.push(l); }
      else { out = '<span class="prompt">$ </span>' + esc(l); copiaveis.push(l); }
      continua = /\\\s*$/.test(l);
      return out;
    }).join("\n");
    botaoCopiar(pre, copiaveis.join("\n"));
  });
  document.querySelectorAll("pre.file").forEach(function (pre) {
    botaoCopiar(pre, pre.textContent.replace(/^\n+|\s+$/g, ""));
  });

  /* ---------- Experimente: modo "cole a saída do terminal" (sem simulador) ---------- */
  var tries = document.querySelectorAll(".try, .trycmd");
  if (tries.length) {
    tries.forEach(function (t) {
      if (!t.querySelector(".try-head")) t.insertBefore(el("p", { "class": "try-head" }, t.classList.contains("trycmd") ? "Experimente: copie o comando, rode no seu Windows e cole a resposta" : "Experimente você mesmo"), t.firstChild);
    });
  }
  if (document.querySelector(".trycmd")) body.appendChild(el("script", { src: "assets/rode-local.js" }));

  /* ---------- Exercícios de completar ----------
     <div class="exercise"><div class="ex-code">ls <input data-answer="-a|-A"> ~</div></div> */
  /* "|" separa respostas alternativas; "\|" é uma barra vertical dentro da resposta (ex.: int\|string). */
  function respostas(i) {
    return i.getAttribute("data-answer").split(/(?<!\\)\|/).map(function (r) { return r.replace(/\\\|/g, "|"); });
  }
  document.querySelectorAll(".exercise").forEach(function (ex) {
    var inputs = ex.querySelectorAll(".ex-code input");
    if (!inputs.length) return;
    inputs.forEach(function (i) {
      i.setAttribute("autocomplete", "off");
      i.setAttribute("spellcheck", "false");
      i.setAttribute("autocapitalize", "off");
      var maior = 0;
      respostas(i).forEach(function (r) { maior = Math.max(maior, r.length); });
      i.style.width = Math.max(4, maior + 2) + "ch";
    });
    var acoes = el("div", { "class": "ex-actions" },
      '<button type="button" class="ex-check">Verificar</button>' +
      '<button type="button" class="secondary ex-show">Mostrar resposta</button>' +
      '<span class="ex-result" aria-live="polite"></span>');
    ex.appendChild(acoes);
    var res = acoes.querySelector(".ex-result");
    function norm(s) { return s.trim().replace(/\s+/g, " "); }
    acoes.querySelector(".ex-check").addEventListener("click", function () {
      var tudo = true;
      inputs.forEach(function (i) {
        var certas = respostas(i).map(norm);
        // o winget não diferencia maiúsculas em comandos, opções e IDs
        var v = norm(i.value).toLowerCase();
        var ok = certas.some(function (c) { return c.toLowerCase() === v; });
        i.classList.toggle("ok", ok);
        i.classList.toggle("bad", !ok);
        if (!ok) tudo = false;
      });
      res.textContent = tudo ? "Correto!" : "Ainda não. Tente de novo.";
      res.className = "ex-result " + (tudo ? "ok" : "bad");
    });
    acoes.querySelector(".ex-show").addEventListener("click", function () {
      inputs.forEach(function (i) {
        i.value = respostas(i)[0];
        i.classList.remove("bad"); i.classList.add("ok");
      });
      res.textContent = "";
    });
    inputs.forEach(function (i) {
      i.addEventListener("keydown", function (e) { if (e.key === "Enter") acoes.querySelector(".ex-check").click(); });
    });
  });

  /* ---------- Múltipla escolha ----------
     <div class="mc" data-answer="2"><p class="mc-q">…</p><label><input type="radio" name="q1"> …</label>…</div> */
  document.querySelectorAll(".mc").forEach(function (mc) {
    var certa = parseInt(mc.getAttribute("data-answer"), 10) - 1;
    var labels = mc.querySelectorAll("label");
    var fb = el("p", { "class": "mc-feedback", "aria-live": "polite" });
    mc.appendChild(fb);
    labels.forEach(function (lb, n) {
      lb.querySelector("input").addEventListener("change", function () {
        labels.forEach(function (x) { x.classList.remove("ok", "bad"); });
        if (n === certa) { lb.classList.add("ok"); fb.textContent = "Correto!"; fb.style.color = "var(--ok)"; }
        else { lb.classList.add("bad"); fb.textContent = "Não é essa. Tente outra opção."; fb.style.color = "var(--bad)"; }
        var placar = document.getElementById("placar");
        if (placar) placar.textContent = document.querySelectorAll(".mc label.ok").length + " de " + document.querySelectorAll(".mc").length;
      });
    });
  });
})();
