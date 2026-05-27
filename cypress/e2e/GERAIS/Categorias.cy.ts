describe('Categorias', () => {
  beforeEach(() => {
    cy.viewport(1366, 768);
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  });

  it('Deve abrir a tela de Categorias', () => {
    cy.contains(/Categorias/i)
      .scrollIntoView()
      .click({ force: true });

    cy.get('body').should('contain.text', 'Categorias');
  });
});