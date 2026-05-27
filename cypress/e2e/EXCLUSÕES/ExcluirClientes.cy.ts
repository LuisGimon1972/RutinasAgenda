describe('Clientes - Excluir cliente aleatório da lista', () => {
  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Clientes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de clientes/i, { timeout: 30000 })
      .should('be.visible');
  });

  it('Deve selecionar aleatoriamente um cliente diferente da lista e abrir diálogo de exclusão.', () => {
    cy.get('tbody tr:visible', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const linhasValidas = [...$linhas].filter((linha) => {
          const $linha = Cypress.$(linha);

          const temColunas = $linha.find('td').length > 0;
          const temTexto = $linha.text().trim().length > 0;
          const temAcoes =
            $linha
              .find('td')
              .last()
              .find('i, button, svg, [role="button"], .q-icon')
              .length > 0;

          return temColunas && temTexto && temAcoes;
        });

        expect(linhasValidas.length, 'linhas válidas').to.be.greaterThan(0);

        cy.window().then((win) => {
          const totalLinhas = linhasValidas.length;

          const ultimoIndice = Number(
            win.localStorage.getItem('ultimoClienteExclusaoIndex') ?? '-1'
          );

          let indiceAleatorio = Cypress._.random(0, totalLinhas - 1);

          if (totalLinhas > 1 && indiceAleatorio === ultimoIndice) {
            indiceAleatorio = (indiceAleatorio + 1) % totalLinhas;
          }

          win.localStorage.setItem(
            'ultimoClienteExclusaoIndex',
            String(indiceAleatorio)
          );

          const linhaSelecionada = Cypress.$(linhasValidas[indiceAleatorio]);

          const nomeCliente = linhaSelecionada
            .find('td')
            .eq(0)
            .text()
            .trim();

          cy.log(`Total de linhas válidas: ${totalLinhas}`);
          cy.log(`Último índice usado: ${ultimoIndice}`);
          cy.log(`Novo índice escolhido: ${indiceAleatorio}`);
          cy.log(`Cliente selecionado: ${nomeCliente}`);

          cy.wrap(linhaSelecionada).within(() => {
            cy.get('td')
              .last()
              .find('i, button, svg, [role="button"], .q-icon')
              .last()
              .click({ force: true });
          });
        });
      });

    cy.get('.q-dialog, [role="dialog"]', { timeout: 30000 })
      .should('exist');

    cy.get('body')
      .invoke('text')
      .should('match', /excluir|remover|confirmar|deseja|cliente/i);
  });
});