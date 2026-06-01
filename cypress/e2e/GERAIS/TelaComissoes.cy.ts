describe('Comissões', () => {
  beforeEach(() => {
    cy.viewport(1366, 768);
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  });

  it('Deve abrir a tela de Comissões.', () => {
    cy.contains(/Comiss(ões|oes)/i)
      .scrollIntoView()
      .click({ force: true });

    cy.get('body')
      .invoke('text')
      .should('match', /Comiss(ões|oes)/i);
  });
});