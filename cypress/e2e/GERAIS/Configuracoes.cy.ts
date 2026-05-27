describe('Configuracoes', () => {
  beforeEach(() => {
    cy.viewport(1366, 768);
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  });

  it('Deve abrir a tela de Configurações.', () => {
    cy.contains(/Configura(ções|coes)/i)
      .scrollIntoView()
      .click({ force: true });

    cy.get('body')
      .invoke('text')
      .should('match', /Configura(ções|coes)/i);
  });
});