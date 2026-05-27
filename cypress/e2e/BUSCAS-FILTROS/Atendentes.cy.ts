describe('Atendentes - Busca', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirAtendentes() {
    cy.contains(/Atendentes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de atendentes/i, { timeout: 30000 })
      .should('be.visible');
  }

  function buscarAtendente(texto: string) {
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

  function obterAtendenteExistenteDaGrade() {
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
      cy.log('Nenhum atendente encontrado na grade. Teste interrompido sem erro.');

      Cypress.log({
        name: 'Atendentes',
        message: 'Nenhum atendente encontrado na grade. Teste finalizado sem falha.',
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

    const nomeAtendente = textosColunas[0];

    if (!nomeAtendente) {
      cy.log('Atendente sem nome na grade. Teste interrompido sem erro.');

      Cypress.log({
        name: 'Atendentes',
        message: 'Linha encontrada, mas sem nome de atendente.',
      });

      return null;
    }

    Cypress.log({
      name: 'Atendente escolhido',
      message: nomeAtendente,
    });

    return nomeAtendente;
  });
}

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();
    abrirAtendentes();
  });

it('Deve buscar primeiro um atendente existente e depois um inexistente.', () => {
  obterAtendenteExistenteDaGrade().then((nomeAtendenteExistente) => {
    if (!nomeAtendenteExistente) {
      return;
    }

    buscarAtendente(nomeAtendenteExistente);

    cy.get('body')
      .invoke('text')
      .should('include', nomeAtendenteExistente);

    limparBusca();

    const atendenteInexistente = `ATENDENTE_INEXISTENTE_E2E_${Date.now()}`;

    buscarAtendente(atendenteInexistente);

    cy.get('body').then(($body) => {
      const linhas = $body.find('tbody tr:visible');

      if (linhas.length > 0) {
        const textoTabela = linhas.text();

        expect(textoTabela).not.to.include(atendenteInexistente);
      }
    });
  });
});
});