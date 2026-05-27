describe('Configurações - Pagamentos', () => {
  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Configura[çc][õo]es/i, { timeout: 30000 })
      .click({ force: true });
  });

  it('Deve abrir pagamentos sem validar e sem alterar integrações.', () => {
    cy.contains(/Pagamentos/i, { timeout: 30000 })
      .click({ force: true });

    cy.wait(1000);
    
    cy.contains(/Mercado Pago/i, { timeout: 30000 })
      .scrollIntoView();
   
    cy.contains(/Stripe/i, { timeout: 30000 })
      .scrollIntoView();
   
  });
});