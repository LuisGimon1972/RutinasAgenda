describe('Agendamentos - Semana em modo lista', () => {
  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Agenda/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de agendamentos/i, { timeout: 30000 })
      .should('be.visible');
  });

  it('Deve clicar em Semana e marcar Lista se não estiver marcada.', () => {

    cy.contains(/^SEMANA$/i, { timeout: 30000 })
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);

    cy.get('body').then(($body) => {
      const estaEmLista =
        $body.text().includes('Data') &&
        $body.text().includes('Hora') &&
        $body.text().includes('Agendamento') &&
        $body.text().includes('Status');

      if (!estaEmLista) {
        cy.get('.q-btn-group:visible')
          .first()
          .within(() => {
            cy.get('.q-btn')
              .eq(1)
              .click({ force: true });
          });
      }
    });

    cy.wait(1000);
    
  });
});