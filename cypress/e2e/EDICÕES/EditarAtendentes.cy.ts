describe('Atendentes - Editar atendente aleatório da lista', () => {
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

  it('Deve selecionar aleatoriamente um atendente da lista e abrir edição.', () => {
    cy.get('tbody tr', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .then(($linhas) => {
        const totalLinhas = $linhas.length;
        const indiceAleatorio = Math.floor(Math.random() * totalLinhas);
        const linhaSelecionada = $linhas.eq(indiceAleatorio);
        const nomeAtendente = linhaSelecionada.find('td').eq(0).text().trim();

        cy.log(`Atendente selecionado: ${nomeAtendente}`);

        cy.wrap(linhaSelecionada).within(() => {
          cy.get('td')
            .last()
            .find('i, button, svg, [role="button"], .q-icon')
            .eq(2)
            .click({ force: true });
        });
      });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Cadastrar atendente|Editar atendente|Nome completo|E-mail|Gravar/i);
  });
});