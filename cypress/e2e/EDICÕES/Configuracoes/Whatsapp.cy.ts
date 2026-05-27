describe('Configurações - WhatsApp', () => {
  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Configura[çc][õo]es/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });
  });

  it('Deve abrir a aba WhatsApp sem validar.', () => {
    cy.contains(/^WhatsApp$/i, { timeout: 30000 })
      .click({ force: true });

    cy.wait(1000);
  });
});