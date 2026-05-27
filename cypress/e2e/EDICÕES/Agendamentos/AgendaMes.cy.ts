describe('Agendamentos - Mês', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('scrollToTime is not a function')) {
        return false;
      }

      return true;
    });

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

  it('Deve clicar na ficha Mês.', () => {
    cy.contains(/^M[EÊ]S$/i, { timeout: 30000 })
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);   
  });
});