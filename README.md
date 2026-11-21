# Guia winget

Site: https://wallysondevs.github.io/guia-winget/

Curso de **winget**, o gerenciador de pacotes oficial do Windows, em português, para quem **nunca usou a linha de comando do Windows** e para quem já usa e quer ir além. Funciona como uma escola: uma aula para cada assunto, organizadas em **3 níveis** (25 páginas). O curso começa no `winget --version` e na busca de pacotes e chega a códigos de saída, fontes, configurações, manifestos YAML e scripts no PowerShell.

- **Nível 1 · Iniciante** (13 páginas): começando (terminal, versão, `--info`, ajuda e erros) e encontrando pacotes (`search`, filtros, tags, `show`, versões e tipos de instalador). Aqui só se consulta: nada muda no computador.
- **Nível 2 · Intermediário** (3 páginas): contratos e modo não interativo, códigos de saída e erros ao instalar e remover.
- **Nível 3 · Avançado** (9 páginas): fontes, configurações, recursos experimentais, manifestos (`hash` e `validate`), scripts com winget, boas práticas e uma referência rápida.

Cada aula explica a linha de comando parte por parte, mostra a resposta real do winget e o que acontece quando dá errado, com a mensagem como o programa escreveu. As saídas foram colhidas com o **winget v1.29.380** num Windows em português, por um script que só consulta. Números de versão e listas de pacotes mudam com o tempo, então a sua resposta pode trazer valores diferentes. Nos exemplos, o computador se chama `NOTEBOOK` e a usuária é a fictícia `ana`, com a pasta `C:\Users\ana`.

Para praticar, as páginas trazem **20 missões** em caixas **Experimente**: copie o comando, rode no seu Windows e cole a resposta. Não há simulador: você usa o seu próprio winget.

1. Leia a missão e complete o comando.
2. Rode no PowerShell ou no CMD do seu Windows.
3. Cole a resposta na caixa e clique em **Conferir**: a caixa diz se você chegou ao resultado pedido.
4. Depois do primeiro **Conferir**, o botão **Ver solução** é liberado.

A caixa é montada por `assets/rode-local.js`. O comando e a resposta colada ficam só na página: nada é enviado nem guardado no navegador.

Site 100% estático (HTML + CSS + JS, sem build e sem dependências externas): abre direto no navegador e funciona no GitHub Pages.

## Estrutura

```
index.html                   página inicial
<tema>.html                  uma aula por tema
assets/style.css             visual
assets/site.js               níveis/menu (lista NIVEIS), Anterior/Próximo, exercícios
assets/rode-local.js         as caixas de missão (Experimente)
assets/rode-local.css        visual da caixa
tools/testar-missoes.js      testa as missões com o mesmo avaliador da página e a saída real guardada
tools/testar-navegador.js    abre as páginas num Chrome sem janela e confere as caixas
tools/checar-privacidade.sh  procura dados de máquina real nas páginas e no histórico
CONTRIBUINDO.md              regras para escrever ou mudar uma aula
```

## Testes

```bash
node tools/testar-missoes.js                       # todas as missões
node tools/testar-missoes.js --secao "Começando"   # só uma seção do menu
node tools/testar-navegador.js --todas -q          # todas as páginas num Chrome sem janela (precisa do puppeteer-core em tools/node_modules)
PROIBIDO=../lista.txt bash tools/checar-privacidade.sh   # privacidade: rode antes de todo commit
```

## Publicar no GitHub Pages

Envie a pasta para um repositório e ative **Settings → Pages → Deploy from a branch → main / (root)**.

## Adicionar uma aula

Siga o [CONTRIBUINDO.md](CONTRIBUINDO.md): só saídas reais e anonimizadas, nada de `winget list` ou `upgrade` sem filtro e nenhum comando que altere o sistema nos exemplos com saída. Inclua a página na lista `NIVEIS` de `assets/site.js` só quando ela estiver pronta e rode os testes acima antes do commit.
