describe('Categorias - Abrir edição de categoria aleatória', () => {
  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Categorias/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de categorias/i, { timeout: 30000 })
      .should('be.visible');
  });

  it('Deve selecionar aleatoriamente uma categoria da lista e abrir a tela de edição.', () => {
    cy.get('tbody tr', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const totalLinhas = $linhas.length;
        const indiceAleatorio = Math.floor(Math.random() * totalLinhas);
        const linhaSelecionada = $linhas.eq(indiceAleatorio);
        const nomeCategoria = linhaSelecionada.find('td').eq(0).text().trim();

        cy.log(`Categoria selecionada: ${nomeCategoria}`);

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
        /Cadastrar categoria|Editar categoria|Nome da categoria|Descri[çc][aã]o|Gravar/i
      );

    cy.url().should('include', '/categories');

    cy.get('input:visible')
      .eq(0)
      .should('be.visible');

    cy.contains(/Gravar/i, { timeout: 30000 })
      .should('be.visible');
  });
});