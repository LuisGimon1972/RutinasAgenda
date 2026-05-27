describe('Produtos - Abrir edição de produto aleatório', () => {
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

  it('Deve selecionar aleatoriamente um produto da lista e abrir a tela de edição.', () => {
    cy.get('tbody tr', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const totalLinhas = $linhas.length;
        const indiceAleatorio = Math.floor(Math.random() * totalLinhas);
        const linhaSelecionada = $linhas.eq(indiceAleatorio);

        const nomeProduto = linhaSelecionada.find('td').eq(0).text().trim();

        cy.log(`Produto selecionado: ${nomeProduto}`);

        cy.wrap(linhaSelecionada).within(() => {
          cy.get('td')
            .last()
            .find('i, button, svg, [role="button"], .q-icon')
            .eq(0)
            .click({ force: true });
        });
      });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Cadastrar produto|Editar produto|Nome do produto|Valor|Quantidade|Gravar/i
      );

    cy.url().should('include', '/products');

    cy.get('input:visible')
      .eq(0)
      .should('be.visible');

    cy.contains(/Gravar/i, { timeout: 30000 })
      .should('be.visible');
  });
});