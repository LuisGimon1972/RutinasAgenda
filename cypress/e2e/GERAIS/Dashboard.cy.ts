describe('Dashboard', () => {
   beforeEach(() => {
    cy.viewport(1366, 768);
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  });

  it('Deve exibir o dashboard após login.', () => {
    cy.get('body')
      .invoke('text')
      .should('match', /Dashboard/i)
      .and('match', /Total de atendimentos/i)
      .and('match', /Faturamento total/i)
      .and('match', /Ticket m[eé]dio/i);
  });
});