describe('Responsividade - Mobile - Percorrer telas', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function clicarMenu(menu: RegExp) {

    cy.get('body').then(($body) => {
      const drawer = $body
        .find('.q-drawer:visible, aside:visible, nav:visible')
        .filter((_, el) => {
          const texto = Cypress.$(el).text();

          return /Dashboard|Agenda|Clientes|Servi[çc]os/i.test(texto);
        })
        .first();

      if (drawer.length > 0) {
        cy.wrap(drawer)
          .contains(menu, { timeout: 1000 })
          .scrollIntoView()
          .click({ force: true });
      } else {
        cy.contains(menu, { timeout: 1000 })
          .scrollIntoView()
          .click({ force: true });
      }
    });

    cy.wait(500);
  }

  beforeEach(() => {
    cy.login('iphone-x');

    fecharCookiesSeAparecer();

    cy.wait(1000);
  });

  it('Deve percorrer as telas principais em tamanho mobile.', () => {
    const telas = [
      {
        menu: /Dashboard/i,
        esperado: /Dashboard|Bom dia|Boa tarde|Boa noite/i,
      },
      {
        menu: /Agenda/i,
        esperado: /Listagem de agendamentos/i,
      },
      {
        menu: /Clientes/i,
        esperado: /Listagem de clientes/i,
      },
      {
        menu: /Atendentes/i,
        esperado: /Listagem de atendentes/i,
      },
      {
        menu: /Servi[çc]os/i,
        esperado: /Listagem de servi[çc]os/i,
      },
      {
        menu: /Produtos/i,
        esperado: /Listagem de produtos/i,
      },
      {
        menu: /Categorias/i,
        esperado: /Listagem de categorias/i,
      },
      {
        menu: /Comiss(ões|oes)/i,
        esperado: /Comiss(ões|oes)|Total de comissão|Profissionais/i,
      },
      {
        menu: /Planos/i,
        esperado: /Listagem de planos/i,
      },
      {
        menu: /Configura[çc][õo]es/i,
        esperado: /Configura[çc][õo]es/i,
      },
    ];

    telas.forEach((tela) => {
      clicarMenu(tela.menu);

      cy.get('body', { timeout: 500})
        .invoke('text')
        .should('match', tela.esperado);
    });
  });
});