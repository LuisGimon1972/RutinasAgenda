describe('Smoke Test - SG Agenda', () => {
  it('Deve carregar o sistema de SG Agenda homologação.', () => {
    cy.visit('/');
    cy.title().should('match', /SG Agenda|Painel/i);
  });
});