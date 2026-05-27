describe('Comissões - Histórico aleatório', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();

    cy.contains(/Comiss(ões|oes)/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });
  });

  it('Deve selecionar aleatoriamente um histórico de comissão.', () => {
    cy.contains(/Histórico/i, { timeout: 30000 })
      .should('exist');

    cy.get('button:visible, .q-btn:visible, [role="button"]:visible')
      .filter((_, botao) => {
        const texto = Cypress.$(botao).text().trim();

        return /Histórico/i.test(texto);
      })
      .then(($botoesHistorico) => {
        expect(
          $botoesHistorico.length,
          'botões Histórico encontrados'
        ).to.be.greaterThan(0);

        const indiceAleatorio = Cypress._.random(
          0,
          $botoesHistorico.length - 1
        );

        const botaoSelecionado = $botoesHistorico.eq(indiceAleatorio);

        Cypress.log({
          name: 'Histórico selecionado',
          message: `Índice ${indiceAleatorio}`,
        });

        cy.wrap(botaoSelecionado)
          .scrollIntoView()
          .click({ force: true });
      });

    cy.wait(1000);
   
  });
});