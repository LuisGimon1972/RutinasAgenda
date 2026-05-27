describe('Configurações - Geral editar', () => {
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

  it('Deve editar configurações gerais.', () => {
    
    cy.contains(/^Geral$/i, { timeout: 30000 })
      .click({ force: true });

    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      const texto = $body.text();

      if (texto.includes('English')) {
        cy.contains('English')
          .click({ force: true });

        cy.wait(500);

        cy.contains(/Portugu[eê]s|Portuguese/i)
          .click({ force: true });
      } else if (texto.match(/Portugu[eê]s|Portuguese/i)) {
        cy.contains(/Portugu[eê]s|Portuguese/i)
          .click({ force: true });

        cy.wait(500);

        cy.contains(/English/i)
          .click({ force: true });
      }
    });

    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      const texto = $body.text();

      if (texto.includes('R$ - Real Brasileiro')) {
        cy.contains('R$ - Real Brasileiro')
          .click({ force: true });

        cy.wait(500);

        cy.contains(/R\$ - Real Brasileiro|Real Brasileiro/i)
          .click({ force: true });
      }
    });

    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      const texto = $body.text();

      if (texto.match(/Salvar|Gravar/i)) {
        cy.contains(/Salvar|Gravar/i)
          .click({ force: true });
      }
    });
  });
});