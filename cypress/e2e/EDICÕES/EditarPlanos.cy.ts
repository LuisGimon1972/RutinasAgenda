describe('Planos - Abrir edição de plano aleatório', () => {
  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Planos/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de planos/i, { timeout: 30000 })
      .should('be.visible');
  });

  it('Deve selecionar aleatoriamente um plano da lista e abrir a tela de edição sem gravar.', () => {
    cy.get('tbody tr', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const totalLinhas = $linhas.length;
        const indiceAleatorio = Math.floor(Math.random() * totalLinhas);
        const linhaSelecionada = $linhas.eq(indiceAleatorio);

        const nomePlano = linhaSelecionada.find('td').eq(0).text().trim();

        cy.log(`Plano selecionado: ${nomePlano}`);

        cy.wrap(linhaSelecionada).within(() => {
          cy.get('td')
            .last()
            .find('i, button, svg, [role="button"], .q-icon')
            .eq(1)
            .click({ force: true });
        });
      });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Cadastrar plano|Editar plano|Nome|Valor|Per[ií]odo|Descri[çc][aã]o|Plano/i
      );

    cy.url().should('include', '/plans');

    cy.get('body')
      .invoke('text')
      .should('match', /Nome|Valor|Per[ií]odo|Descri[çc][aã]o|Plano/i);
  });
});