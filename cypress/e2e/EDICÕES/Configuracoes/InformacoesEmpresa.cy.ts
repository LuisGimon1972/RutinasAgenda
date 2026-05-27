describe('Configurações - Informações da empresa', () => {
  function preencherInputSeExistir(index: number, valor: string) {
    cy.get('input:visible').then(($inputs) => {
      if ($inputs.length > index) {
        cy.wrap($inputs.eq(index))
          .click({ force: true })
          .type(`{selectall}{backspace}${valor}`, { force: true });
      }
    });
  }

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

  it('Deve editar informações da empresa sem gravar.', () => {
    cy.contains(/Informa[çc][õo]es da empresa/i, { timeout: 30000 })
      .click({ force: true });

    cy.wait(1000); 
        
  });
});