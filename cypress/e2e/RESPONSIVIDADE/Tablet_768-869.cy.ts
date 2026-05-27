describe('Responsividade - 768x869 - Percorrer telas', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function clicarMenu(menu: RegExp) {

    cy.contains(menu, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.wait(1200);
  }

  beforeEach(() => {
    cy.login({ width: 768, height: 869 });
    fecharCookiesSeAparecer();
  });

  it('Deve percorrer as telas principais na dimensão 768x869.', () => {
    const telas = [
      {
        nome: 'Dashboard',
        menu: /Dashboard/i,
        esperado: /Dashboard|Bom dia|Boa tarde|Boa noite/i,
      },
      {
        nome: 'Agenda',
        menu: /Agenda/i,
        esperado: /Listagem de agendamentos/i,
      },
      {
        nome: 'Clientes',
        menu: /Clientes/i,
        esperado: /Listagem de clientes/i,
      },
      {
        nome: 'Atendentes',
        menu: /Atendentes/i,
        esperado: /Listagem de atendentes/i,
      },
      {
        nome: 'Serviços',
        menu: /Servi[çc]os/i,
        esperado: /Listagem de servi[çc]os/i,
      },
      {
        nome: 'Produtos',
        menu: /Produtos/i,
        esperado: /Listagem de produtos/i,
      },
      {
        nome: 'Categorias',
        menu: /Categorias/i,
        esperado: /Listagem de categorias/i,
      },
      {
        nome: 'Comissões',
        menu: /Comiss(ões|oes)/i,
        esperado: /Comiss(ões|oes)|Total de comissão|Profissionais/i,
      },
      {
        nome: 'Planos',
        menu: /Planos/i,
        esperado: /Listagem de planos/i,
      },
      {
        nome: 'Configurações',
        menu: /Configura[çc][õo]es/i,
        esperado: /Configura[çc][õo]es/i,
      },
    ];

    telas.forEach((tela) => {
      cy.log(`Acessando tela: ${tela.nome}`);

      clicarMenu(tela.menu);

      cy.get('body', { timeout: 30000 })
        .invoke('text')
        .should('match', tela.esperado);
    });
  });
});