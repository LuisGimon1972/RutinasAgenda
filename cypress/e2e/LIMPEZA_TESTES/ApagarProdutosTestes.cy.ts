describe('Limpeza - Produtos criados pelos testes E2E', () => {
  const regexProdutoE2E = /E2E|TESTE E2E|Produto E2E|Produto_Teste/i;

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

  function abrirProdutos() {
    cy.contains(/Produtos|Productos/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Produtos|Productos|Listagem de produtos|Listado de productos|Cadastrar produto|Registrar producto/i
      );

    cy.wait(1500);
  }

  function buscarProdutosE2E() {
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

  function obterPrimeiraLinhaProdutoE2E($body: JQuery<HTMLElement>) {
    const linhas = $body.find('tbody tr:visible').toArray();

    const linhaProdutoE2E = linhas.find((linha) => {
      const textoLinha = limparTexto(Cypress.$(linha).text());

      const temColunas = Cypress.$(linha).find('td').length > 0;

      const naoEhLinhaVazia =
        !/nenhum|no hay|sin registros|no encontrado|nenhum produto/i.test(
          textoLinha
        );

      return temColunas && naoEhLinhaVazia && regexProdutoE2E.test(textoLinha);
    });

    return linhaProdutoE2E || null;
  }

  function clicarExcluirNaLinha(linha: HTMLElement) {
    const botoes = Cypress.$(linha)
      .find('button:visible, a:visible, [role="button"]:visible, .q-btn:visible')
      .toArray();

    const botaoExcluir = botoes.find((botao) => {
      const texto = limparTexto(Cypress.$(botao).text());
      const html = String(botao.outerHTML || '');

      const pareceExcluir =
        /delete|delete_outline|trash|excluir|eliminar|remover|apagar/i.test(
          `${texto} ${html}`
        );

      const naoEhEditar =
        !/edit|editar|border_color|create|pencil/i.test(`${texto} ${html}`);

      return pareceExcluir && naoEhEditar;
    });

    if (!botaoExcluir) {
      cy.screenshot('botao-excluir-produto-e2e-nao-encontrado');
      throw new Error('Botão de excluir produto E2E não encontrado na linha.');
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
        cy.log('Modal de confirmação não apareceu ou exclusão não exige confirmação.');
      }
    });

    cy.wait(1500);
  }

  function apagarProdutosE2E(tentativa = 1) {
    if (tentativa > 100) {
      throw new Error(
        'Limite de 100 tentativas atingido ao apagar produtos E2E.'
      );
    }

    cy.get('body', { timeout: 30000 }).then(($body) => {
      const linhaProdutoE2E = obterPrimeiraLinhaProdutoE2E($body);

      if (!linhaProdutoE2E) {
        cy.log('Nenhum produto E2E encontrado. Limpeza finalizada sem erro.');
        return;
      }

      const textoProduto = limparTexto(Cypress.$(linhaProdutoE2E).text());

      cy.log(`Apagando produto E2E ${tentativa}: ${textoProduto}`);

      clicarExcluirNaLinha(linhaProdutoE2E);

      confirmarExclusaoSeAparecer();

      buscarProdutosE2E();

      apagarProdutosE2E(tentativa + 1);
    });
  }

  beforeEach(() => {
    cy.viewport(1366, 768);

    cy.login();

    fecharCookiesSeAparecer();

    abrirProdutos();
  });

  it('Deve apagar todos os produtos criados pelos testes E2E.', () => {
    buscarProdutosE2E();

    apagarProdutosE2E();

    cy.get('body').then(($body) => {
      const textoTabela = limparTexto($body.text());

      expect(textoTabela).not.to.match(regexProdutoE2E);
    });
  });
});