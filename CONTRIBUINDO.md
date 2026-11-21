# Contribuindo

- Toda saída exibida precisa ter vindo do winget rodando de verdade no Windows. Não traduza nem edite a resposta; explique ao lado.
- Antes de publicar uma saída, troque nomes de computador e de usuário, pastas pessoais, IPs e MACs por valores neutros (`NOTEBOOK`, `ana`, `C:\Users\ana`, `192.168.0.x`, `02:00:00:00:00:xx`).
- Não publique a saída de `winget list`, `winget upgrade` ou `winget export` sem filtro: elas listam todos os programas do computador.
- Comandos que alteram o sistema (`upgrade --all`, `source add/remove/reset`, `configure`, `import`) não entram nos exemplos com saída.
- Uma aula só entra em `NIVEIS` (`assets/site.js`) quando estiver pronta, com as saídas reais encaixadas; o menu, o pager e o índice saem dali. (`{ pronta: false }` ainda funciona, mas não vai para o repositório.)
- Rode os testes do README antes de enviar.
