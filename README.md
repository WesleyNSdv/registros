# Site de Atividades

Site simples onde os alunos escolhem **disciplina → semana**, respondem as questões e clicam em
**"Copiar perguntas e respostas"** para colar tudo de uma vez na Sala do Futuro.
As respostas ficam salvas como rascunho no navegador do aluno (se fechar a página, não perde).

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `data/atividades.js` | **Único arquivo que você precisa editar** — disciplinas, semanas e questões |
| `index.html`, `app.js`, `style.css` | O site em si (não precisa mexer) |

## Adicionar uma semana

Abra `data/atividades.js`, encontre a disciplina e cole dentro de `semanas: [ ... ]`:

```js
{
  numero: 21,
  titulo: "Tema da semana (opcional)",
  questoes: [
    "Primeira pergunta?",
    "Segunda pergunta?",
  ],
},
```

Depois apague a semana de exemplo de IA (Semana 20) quando não precisar mais dela.

Link direto para uma semana: `https://SEU-USUARIO.github.io/NOME-DO-REPO/#/ia/21`
(ids: `ia`, `front-end`, `back-end`, `versionamento`, `redes`, `carreiras`, `projeto-multidisciplinar`).

## Publicar no GitHub Pages

1. Crie um repositório público em <https://github.com/new> (ex.: `atividades`).
2. Na página do repositório: **Add file → Upload files**, arraste `index.html`, `app.js`, `style.css`, `README.md` e a pasta `data`. Clique em **Commit changes**.
3. Vá em **Settings → Pages**, em *Branch* escolha `main` e `/ (root)`, clique em **Save**.
4. Em 1–2 minutos o site estará em `https://SEU-USUARIO.github.io/atividades/`.

Para atualizar: edite `data/atividades.js` direto no GitHub (ícone de lápis) e faça *Commit*. O site atualiza sozinho em ~1 minuto.

## Testar no computador

Basta dar dois cliques em `index.html`.
