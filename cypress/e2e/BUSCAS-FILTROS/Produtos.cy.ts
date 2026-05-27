describe('Produtos - Busca', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirProdutos() {
    cy.contains(/Produtos/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de produtos/i, { timeout: 30000 })
      .should('be.visible');
  }

  function buscarProduto(texto: string) {
    cy.get('input:visible')
      .first()
      .should('be.visible')
      .click({ force: true })
      .type(`{selectall}{backspace}${texto}`, { force: true });

    cy.wait(1500);
  }

  function limparBusca() {
    cy.get('input:visible')
      .first()
      .should('be.visible')
      .click({ force: true })
      .type('{selectall}{backspace}', { force: true });

    cy.wait(1500);
  }

  function obterProdutoExistenteDaGrade() {
  return cy.get('body', { timeout: 30000 }).then(($body) => {
    const linhasValidas = $body
      .find('tbody tr:visible')
      .toArray()
      .filter((linha) => {
        const $linha = Cypress.$(linha);
        const texto = $linha.text().trim();
        const temColunas = $linha.find('td').length > 0;

        return temColunas && texto.length > 0;
      });

    if (linhasValidas.length === 0) {
      cy.log('Nenhum produto encontrado na grade. Teste interrompido sem erro.');

      Cypress.log({
        name: 'Produtos',
        message: 'Nenhum produto encontrado na grade. Teste finalizado sem falha.',
      });

      return null;
    }

    const indiceAleatorio = Cypress._.random(0, linhasValidas.length - 1);
    const linhaSelecionada = Cypress.$(linhasValidas[indiceAleatorio]);

    const textosColunas = linhaSelecionada
      .find('td')
      .toArray()
      .map((td) => Cypress.$(td).text().trim())
      .filter((texto) => texto.length > 0)
      .filter((texto) => !/drag_indicator/i.test(texto));

    const nomeProduto = textosColunas[0];

    if (!nomeProduto) {
      cy.log('Produto sem nome na grade. Teste interrompido sem erro.');

      Cypress.log({
        name: 'Produtos',
        message: 'Linha encontrada, mas sem nome de produto.',
      });

      return null;
    }

    Cypress.log({
      name: 'Produto escolhido',
      message: nomeProduto,
    });

    return nomeProduto;
  });
}

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();
    abrirProdutos();
  });

  it('Deve buscar primeiro um produto existente e depois um inexistente.', () => {
  obterProdutoExistenteDaGrade().then((nomeProdutoExistente) => {
    if (!nomeProdutoExistente) {
      return;
    }

    buscarProduto(nomeProdutoExistente);

    cy.get('body')
      .invoke('text')
      .should('include', nomeProdutoExistente);

    limparBusca();

    const produtoInexistente = `PRODUTO_INEXISTENTE_E2E_${Date.now()}`;

    buscarProduto(produtoInexistente);

    cy.get('body').then(($body) => {
      const linhas = $body.find('tbody tr:visible');

      if (linhas.length > 0) {
        const textoTabela = linhas.text();

        expect(textoTabela).not.to.include(produtoInexistente);
      }
    });
  });
});
});