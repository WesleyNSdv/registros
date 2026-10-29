(function () {
  "use strict";

  var app = document.getElementById("app");
  var trilha = document.getElementById("trilha");
  var aviso = document.getElementById("aviso");
  var disciplinas = window.ATIVIDADES || [];

  // ---------- utilidades ----------

  function el(tag, attrs, filhos) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "texto") n.textContent = attrs[k];
      else if (k === "estilo") n.style.cssText = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (filhos || []).forEach(function (f) { if (f) n.appendChild(f); });
    return n;
  }

  function lerRascunho(chave) {
    try { return localStorage.getItem(chave) || ""; } catch (e) { return ""; }
  }

  function salvarRascunho(chave, valor) {
    try {
      if (valor) localStorage.setItem(chave, valor);
      else localStorage.removeItem(chave);
      return true;
    } catch (e) { return false; }
  }

  var avisoTimer;
  function mostrarAviso(msg) {
    aviso.textContent = msg;
    aviso.classList.add("visivel");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { aviso.classList.remove("visivel"); }, 3000);
  }

  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).catch(function () { return copiarFallback(texto); });
    }
    return copiarFallback(texto);
  }

  function copiarFallback(texto) {
    var ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return ok ? Promise.resolve() : Promise.reject();
  }

  function ajustarAltura(ta) {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + 2 + "px";
  }

  function definirTrilha(itens) {
    trilha.innerHTML = "";
    itens.forEach(function (i) {
      var span = el("span");
      span.appendChild(i.href ? el("a", { href: i.href, texto: i.texto }) : document.createTextNode(i.texto));
      trilha.appendChild(span);
    });
  }

  function plural(n, um, varios) { return n + " " + (n === 1 ? um : varios); }

  // ---------- telas ----------

  function telaInicio() {
    document.title = "Atividades";
    definirTrilha([]);
    var grade = el("div", { class: "grade" });
    disciplinas.forEach(function (d) {
      grade.appendChild(el("a", { class: "cartao", href: "#/" + d.id, estilo: "--cor:" + d.cor }, [
        el("strong", { texto: d.nome }),
        el("small", { texto: d.semanas.length ? plural(d.semanas.length, "semana", "semanas") : "Nenhuma atividade ainda" }),
      ]));
    });
    app.replaceChildren(
      el("h1", { texto: "Escolha a disciplina" }),
      el("p", { class: "subtitulo", texto: "Responda as questões e use o botão para copiar tudo para a Sala do Futuro." }),
      grade
    );
  }

  function telaDisciplina(d) {
    document.title = d.nome + " · Atividades";
    definirTrilha([{ texto: "Início", href: "#/" }, { texto: d.nome }]);
    var semanas = d.semanas.slice().sort(function (a, b) { return b.numero - a.numero; });
    var corpo;
    if (!semanas.length) {
      corpo = el("div", { class: "vazio", texto: "Nenhuma atividade publicada ainda." });
    } else {
      corpo = el("div", { class: "grade" });
      semanas.forEach(function (s) {
        corpo.appendChild(el("a", { class: "cartao", href: "#/" + d.id + "/" + s.numero, estilo: "--cor:" + d.cor }, [
          el("strong", { texto: "Semana " + s.numero }),
          el("small", { texto: (s.titulo ? s.titulo + " · " : "") + plural(s.questoes.length, "questão", "questões") }),
        ]));
      });
    }
    var cta = d.lousa && el("a", { class: "cta", href: d.lousa, estilo: "--cor:" + d.cor }, [
      el("strong", { texto: "📒 Tópicos da lousa" }),
      el("small", { texto: "Revise o conteúdo antes de responder as questões" }),
    ]);
    app.replaceChildren(el("h1", { texto: d.nome }), el("p", { class: "subtitulo", texto: "Escolha a semana." }), cta || "", corpo);
  }

  function telaSemana(d, s) {
    document.title = d.nome + " – Semana " + s.numero;
    definirTrilha([{ texto: "Início", href: "#/" }, { texto: d.nome, href: "#/" + d.id }, { texto: "Semana " + s.numero }]);
    document.documentElement.style.setProperty("--cor", d.cor);

    var prefixo = "resp:" + d.id + ":" + s.numero + ":";
    var estado = el("span", { class: "estado" });
    var campos = [];
    var lista = el("div");

    s.questoes.forEach(function (q, i) {
      var id = "q" + i;
      var ta = el("textarea", { id: id, placeholder: "Digite sua resposta aqui..." });
      ta.value = lerRascunho(prefixo + i);
      var bloco = el("div", { class: "questao" }, [el("label", { for: id, texto: (i + 1) + ". " + q }), ta]);
      var timer;
      ta.addEventListener("input", function () {
        ajustarAltura(ta);
        bloco.classList.remove("pendente");
        estado.textContent = "Salvando...";
        clearTimeout(timer);
        timer = setTimeout(function () {
          estado.textContent = salvarRascunho(prefixo + i, ta.value) ? "Rascunho salvo ✓" : "";
        }, 300);
      });
      campos.push({ pergunta: q, ta: ta, bloco: bloco });
      lista.appendChild(bloco);
    });

    var btnCopiar = el("button", { class: "principal", type: "button", texto: "Copiar perguntas e respostas" });
    btnCopiar.addEventListener("click", function () {
      var vazias = 0;
      var texto = campos.map(function (c, i) {
        var resp = c.ta.value.trim();
        c.bloco.classList.toggle("pendente", !resp);
        if (!resp) vazias++;
        return (i + 1) + ". " + c.pergunta + "\nResposta: " + resp;
      }).join("\n\n");

      copiarTexto(texto).then(function () {
        btnCopiar.textContent = "Copiado! ✓";
        btnCopiar.classList.add("ok");
        setTimeout(function () {
          btnCopiar.textContent = "Copiar perguntas e respostas";
          btnCopiar.classList.remove("ok");
        }, 2000);
        mostrarAviso(vazias
          ? "Copiado, mas " + plural(vazias, "questão está", "questões estão") + " sem resposta (em vermelho)."
          : "Tudo copiado! Agora é só colar na Sala do Futuro.");
      }, function () {
        mostrarAviso("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
      });
    });

    var btnLimpar = el("button", { type: "button", texto: "Limpar respostas" });
    btnLimpar.addEventListener("click", function () {
      if (!confirm("Apagar todas as respostas desta semana?")) return;
      campos.forEach(function (c, i) {
        c.ta.value = "";
        ajustarAltura(c.ta);
        c.bloco.classList.remove("pendente");
        salvarRascunho(prefixo + i, "");
      });
      estado.textContent = "";
    });

    app.replaceChildren(
      el("h1", { texto: d.nome + " – Semana " + s.numero }),
      el("p", { class: "subtitulo", texto: s.titulo || "Responda todas as questões abaixo." }),
      lista,
      el("div", { class: "barra" }, [estado, btnLimpar, btnCopiar])
    );
    campos.forEach(function (c) { ajustarAltura(c.ta); });
  }

  function telaNaoEncontrada() {
    definirTrilha([{ texto: "Início", href: "#/" }]);
    app.replaceChildren(
      el("h1", { texto: "Página não encontrada" }),
      el("p", {}, [el("a", { href: "#/", texto: "Voltar ao início" })])
    );
  }

  // ---------- roteamento ----------

  function rotear() {
    document.documentElement.style.removeProperty("--cor");
    var partes = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    window.scrollTo(0, 0);
    if (!partes.length) return telaInicio();

    var d = disciplinas.find(function (x) { return x.id === partes[0]; });
    if (!d) return telaNaoEncontrada();
    if (partes.length === 1) return telaDisciplina(d);

    var s = d.semanas.find(function (x) { return String(x.numero) === partes[1]; });
    if (!s) return telaNaoEncontrada();
    telaSemana(d, s);
  }

  window.addEventListener("hashchange", rotear);
  rotear();
})();
