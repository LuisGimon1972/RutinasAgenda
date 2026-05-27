describe('Limpeza - Categorias criadas pelos testes E2E', () => {
  const regexCategoriaE2E =
    /E2E|TESTE E2E|Categoria E2E|Categoria_Teste|Categoria Teste/i;

  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function limparTexto(texto: string) {
    return String(texto || '').replace(/\s+/g, ' ').trim();
  }

  function abrirCategorias() {
    cy.contains(/Categorias|Categor[ií]as/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Categorias|Categor[ií]as|Listagem de categorias|Listado de categor[ií]as|Cadastrar categoria|Registrar categor[ií]a/i
      );

    cy.wait(1500);
  }

  function buscarCategoriasE2E() {
    cy.get('body').then(($body) => {
      const inputs = $body.find('input:visible');

      if (inputs.length === 0) {
        cy.log('Campo de busca não encontrado. Continuando com a grade atual.');
        return;
      }

      cy.wrap(inputs.first())
        .click({ force: true })
        .type('{selectall}{backspace}E2E', { force: true });

      cy.wait(1500);
    });
  }

  function linhaTemBotaoExcluir(linha: HTMLElement) {
    const botoes = Cypress.$(linha)
      .find('button:visible, a:visible, [role="button"]:visible, .q-btn:visible')
      .toArray();

    return botoes.some((botao) => {
      const texto = limparTexto(Cypress.$(botao).text());
      const html = String(botao.outerHTML || '');
      const conteudo = `${texto} ${html}`;

      const pareceExcluir =
        /delete|delete_outline|trash|excluir|eliminar|remover|apagar/i.test(
          conteudo
        );

      const naoEhEditar =
        !/edit|editar|border_color|create|pencil/i.test(conteudo);

      return pareceExcluir && naoEhEditar;
    });
  }

  function obterPrimeiraLinhaCategoriaE2E($body: JQuery<HTMLElement>) {
    const linhas = $body.find('tbody tr:visible').toArray();

    const linhaCategoriaE2E = linhas.find((linha) => {
      const $linha = Cypress.$(linha);
      const textoLinha = limparTexto($linha.text());
      const temColunas = $linha.find('td').length > 0;

      const naoEhLinhaVazia =
        !/nenhum|no hay|sin registros|no encontrado|nenhuma categoria|ninguna categor[ií]a/i.test(
          textoLinha
        );

      return (
        temColunas &&
        naoEhLinhaVazia &&
        regexCategoriaE2E.test(textoLinha) &&
        linhaTemBotaoExcluir(linha)
      );
    });

    return linhaCategoriaE2E || null;
  }

  function clicarExcluirNaLinha(linha: HTMLElement) {
    const botoes = Cypress.$(linha)
      .find('button:visible, a:visible, [role="button"]:visible, .q-btn:visible')
      .toArray();

    const botaoExcluir = botoes.find((botao) => {
      const texto = limparTexto(Cypress.$(botao).text());
      const html = String(botao.outerHTML || '');
      const conteudo = `${texto} ${html}`;

      const pareceExcluir =
        /delete|delete_outline|trash|excluir|eliminar|remover|apagar/i.test(
          conteudo
        );

      const naoEhEditar =
        !/edit|editar|border_color|create|pencil/i.test(conteudo);

      return pareceExcluir && naoEhEditar;
    });

    if (!botaoExcluir) {
      cy.screenshot('botao-excluir-categoria-e2e-nao-encontrado');
      throw new Error('Botão de excluir categoria E2E não encontrado na linha.');
    }

    cy.wrap(botaoExcluir)
      .scrollIntoView()
      .click({ force: true });
  }

  function confirmarExclusaoSeAparecer() {
    cy.wait(500);

    cy.get('body').then(($body) => {
      const botoesConfirmacao = $body
        .find('button:visible, .q-btn:visible, [role="button"]:visible')
        .toArray();

      const botaoConfirmar = botoesConfirmacao.find((botao) => {
        const texto = limparTexto(Cypress.$(botao).text());

        const ehConfirmar =
          /confirmar|excluir|eliminar|remover|apagar|deletar|sim|sí|si|yes/i.test(
            texto
          );

        const naoEhCancelar =
          !/cancelar|cancel|não|nao|no|voltar/i.test(texto);

        return ehConfirmar && naoEhCancelar;
      });

      if (botaoConfirmar) {
        cy.wrap(botaoConfirmar).click({ force: true });
      } else {
        cy.log(
          'Modal de confirmação não apareceu ou exclusão não exige confirmação.'
        );
      }
    });

    cy.wait(1500);
  }

  function apagarCategoriasE2E(tentativa = 1) {
    if (tentativa > 100) {
      throw new Error(
        'Limite de 100 tentativas atingido ao apagar categorias E2E.'
      );
    }

    cy.get('body', { timeout: 30000 }).then(($body) => {
      const linhaCategoriaE2E = obterPrimeiraLinhaCategoriaE2E($body);

      if (!linhaCategoriaE2E) {
        cy.log('Nenhuma categoria E2E encontrada. Limpeza finalizada sem erro.');
        return;
      }

      const textoCategoria = limparTexto(Cypress.$(linhaCategoriaE2E).text());

      cy.log(`Apagando categoria E2E ${tentativa}: ${textoCategoria}`);

      clicarExcluirNaLinha(linhaCategoriaE2E);

      confirmarExclusaoSeAparecer();

      buscarCategoriasE2E();

      apagarCategoriasE2E(tentativa + 1);
    });
  }

  function validarNenhumaCategoriaE2E() {
    cy.get('body').then(($body) => {
      const linhas = $body.find('tbody tr:visible').toArray();

      const categoriasRestantes = linhas
        .map((linha) => limparTexto(Cypress.$(linha).text()))
        .filter((textoLinha) => {
          const naoEhLinhaVazia =
            !/nenhum|no hay|sin registros|no encontrado|nenhuma categoria|ninguna categor[ií]a/i.test(
              textoLinha
            );

          return naoEhLinhaVazia && regexCategoriaE2E.test(textoLinha);
        });

      expect(
        categoriasRestantes,
        'categorias E2E restantes na grade'
      ).to.have.length(0);
    });
  }

  beforeEach(() => {
    cy.viewport(1366, 768);

    cy.login();

    fecharCookiesSeAparecer();

    abrirCategorias();
  });

  it('Deve apagar todas as categorias criadas pelos testes E2E.', () => {
    buscarCategoriasE2E();

    apagarCategoriasE2E();

    buscarCategoriasE2E();

    validarNenhumaCategoriaE2E();
  });
});