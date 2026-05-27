describe('Produtos - Excluir produto aleatório', () => {
  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Produtos/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de produtos/i, { timeout: 30000 })
      .should('be.visible');
  });

  it('Deve selecionar aleatoriamente um produto da lista e clicar no delete da grade.', () => {
    cy.get('tbody tr', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const totalLinhas = $linhas.length;
        const indiceAleatorio = Math.floor(Math.random() * totalLinhas);
        const linhaSelecionada = $linhas.eq(indiceAleatorio);

        const nomeProduto = linhaSelecionada
          .find('td')
          .eq(0)
          .text()
          .trim();

        cy.log(`Produto selecionado: ${nomeProduto}`);

        cy.wrap(linhaSelecionada).within(() => {
          cy.get('td')
            .last()
            .find('i, button, svg, [role="button"], .q-icon')
            .last()
            .click({ force: true });
        });
      });    
  });
});