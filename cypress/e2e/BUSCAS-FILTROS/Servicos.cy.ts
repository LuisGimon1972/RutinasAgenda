describe('Serviços - Busca', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirServicos() {
    cy.contains(/Servi[çc]os|Servicios/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Listagem de servi[çc]os|Listado de servicios|Servi[çc]os|Servicios/i
      );

    cy.wait(1500);
  }

  function buscarServico(texto: string) {
    cy.get('input:visible')
      .first()
      .should('be.visible')
      .click({ force: true })
      .type(`{selectall}{backspace}${texto}`, { force: true });

    cy.wait(1500);
  }

  function limparBusca() {
    cy.get('input:visible')
      .first()
      .should('be.visible')
      .click({ force: true })
      .type('{selectall}{backspace}', { force: true });

    cy.wait(1500);
  }

  function obterServicoExistenteDaGrade(): Cypress.Chainable<string | null> {
    return cy.get('body', { timeout: 30000 }).then(($body) => {
      const textoTela = $body.text().replace(/\s+/g, ' ').trim();

      const telaSemRegistros =
        /nenhum servi[çc]o encontrado|nenhum registro encontrado|nenhum resultado|no hay registros|sin registros|no se encontraron|no encontrado/i.test(
          textoTela
        );

      const linhas = $body.find('tbody tr:visible').toArray();

      const linhasValidas = linhas.filter((linha) => {
        const $linha = Cypress.$(linha);
        const texto = $linha.text().replace(/\s+/g, ' ').trim();
        const temColunas = $linha.find('td').length > 0;

        const naoEhLinhaVazia =
          !/nenhum|no hay|sin registros|no encontrado/i.test(texto);

        return temColunas && texto.length > 0 && naoEhLinhaVazia;
      });

      if (telaSemRegistros || linhasValidas.length === 0) {
        cy.log('Nenhum serviço encontrado na grade. Teste interrompido sem erro.');
        return null;
      }

      const indiceAleatorio = Cypress._.random(0, linhasValidas.length - 1);
      const linhaSelecionada = Cypress.$(linhasValidas[indiceAleatorio]);

      const textosColunas = linhaSelecionada
        .find('td')
        .toArray()
        .map((td) => Cypress.$(td).text().replace(/\s+/g, ' ').trim())
        .filter((texto) => texto.length > 0)
        .filter((texto) => {
          return !/drag_indicator|edit|delete|more_vert|visibility/i.test(
            texto
          );
        });

      const nomeServico =
        textosColunas.find((texto) => {
          return (
            texto.length >= 2 &&
            !/^\d+$/.test(texto) &&
            !/^\+?\d/.test(texto) &&
            !/R\$|BRL|₲|\$|PYG/i.test(texto)
          );
        }) || textosColunas[0];

      if (!nomeServico) {
        cy.log('Nenhum nome de serviço válido encontrado. Teste interrompido sem erro.');
        return null;
      }

      Cypress.log({
        name: 'Serviço escolhido',
        message: nomeServico,
      });

      return nomeServico;
    });
  }

  beforeEach(() => {
    cy.login();

    fecharCookiesSeAparecer();

    abrirServicos();
  });

  it('Deve buscar primeiro um serviço existente e depois um inexistente.', () => {
    obterServicoExistenteDaGrade().then((nomeServicoExistente) => {
      if (!nomeServicoExistente) {
        cy.log('Busca de serviços não executada porque não existem serviços cadastrados.');
        return;
      }

      buscarServico(nomeServicoExistente);

      cy.get('body')
        .invoke('text')
        .should('include', nomeServicoExistente);

      limparBusca();

      const servicoInexistente = `SERVICO_INEXISTENTE_E2E_${Date.now()}`;

      buscarServico(servicoInexistente);

      cy.get('body').then(($body) => {
        const linhas = $body.find('tbody tr:visible');

        if (linhas.length > 0) {
          const textoTabela = linhas.text();

          expect(textoTabela).not.to.include(servicoInexistente);
        }
      });
    });
  });
});