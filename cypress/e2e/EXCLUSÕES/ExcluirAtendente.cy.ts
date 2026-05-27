describe('Clientes - Editar atendente aleatório da lista', () => {
  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Atendentes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de atendentes/i, { timeout: 30000 })
      .should('be.visible');
  });

  it('Deve selecionar aleatoriamente um atendente da lista e abrir dialogo de excluir', () => {
    cy.get('tbody tr', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const totalLinhas = $linhas.length;
        const indiceAleatorio = Math.floor(Math.random() * totalLinhas);
        const linhaSelecionada = $linhas.eq(indiceAleatorio);
        const nomeCliente = linhaSelecionada.find('td').eq(0).text().trim();

        cy.log(`Cliente selecionado: ${nomeCliente}`);

        cy.wrap(linhaSelecionada)
          .as('linhaClienteSelecionada');
      });

    cy.get('@linhaClienteSelecionada')
      .within(() => {
        cy.contains(/delete/i)
          .click({ force: true });
      });    
  });
});