describe('Clientes - Excluir atendente aleatório da lista', () => {
  beforeEach(() => {
    cy.login();

    // Fecha cookies se aparecer
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

  it('Deve selecionar um atendente aleatório e abrir o modal de exclusão', () => {
    cy.get('tbody tr', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const total = $linhas.length;
        const index = Math.floor(Math.random() * total);
        const linha = $linhas.eq(index);

        const nome = linha.find('td').eq(0).text().trim();
        cy.log(`Atendente selecionado: ${nome}`);

        cy.wrap(linha).as('linhaSelecionada');
      });


    cy.get('@linhaSelecionada')
      .within(() => {
        cy.get('button')
          .last() // geralmente o menu é o último botão da linha
          .click({ force: true });
      });

    // 👇 PASSO 2: clicar em excluir
    cy.contains('Excluir atendente', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

   
    cy.contains('Confirmar', { timeout: 10000 }).should('be.visible');
  });
});