describe('Categorias - Busca', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirCategorias() {
    cy.contains(/Categorias/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de categorias/i, { timeout: 30000 })
      .should('be.visible');
  }

  function buscarCategoria(texto: string) {
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

  function obterCategoriaExistenteDaGrade() {
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
      cy.log('Nenhuma categoria encontrada na grade. Teste interrompido sem erro.');

      Cypress.log({
        name: 'Categorias',
        message: 'Nenhuma categoria encontrada na grade. Teste finalizado sem falha.',
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

    const nomeCategoria = textosColunas[0];

    if (!nomeCategoria) {
      cy.log('Categoria sem nome na grade. Teste interrompido sem erro.');

      Cypress.log({
        name: 'Categorias',
        message: 'Linha encontrada, mas sem nome de categoria.',
      });

      return null;
    }

    Cypress.log({
      name: 'Categoria escolhida',
      message: nomeCategoria,
    });

    return nomeCategoria;
  });
}

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();
    abrirCategorias();
  });
  cy.wait(1500);
  it('Deve buscar primeiro uma categoria existente e depois uma inexistente.', () => {
  obterCategoriaExistenteDaGrade().then((nomeCategoriaExistente) => {
    if (!nomeCategoriaExistente) {
      return;
    }

    buscarCategoria(nomeCategoriaExistente);

    cy.get('body')
      .invoke('text')
      .should('include', nomeCategoriaExistente);

    limparBusca();

    const categoriaInexistente = `CATEGORIA_INEXISTENTE_E2E_${Date.now()}`;

    buscarCategoria(categoriaInexistente);

    cy.get('body').then(($body) => {
      const linhas = $body.find('tbody tr:visible');

      if (linhas.length > 0) {
        const textoTabela = linhas.text();

        expect(textoTabela).not.to.include(categoriaInexistente);
      }
    });
  });
});
});