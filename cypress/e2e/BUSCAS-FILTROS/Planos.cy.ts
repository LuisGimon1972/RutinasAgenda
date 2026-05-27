describe('Planos - Busca', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirPlanos() {
    cy.contains(/Planos/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Planos|Planes|Listagem de planos|Listado de planes|Cadastrar plano|Registrar plan/i
      );

    cy.wait(1500);
  }

  function buscarPlano(texto: string) {
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

  function obterPlanoExistenteDaGrade(): Cypress.Chainable<string | null> {
    return cy.get('body', { timeout: 30000 }).then(($body) => {
      const textoTela = $body.text().replace(/\s+/g, ' ').trim();

      const telaSemRegistros =
        /nenhum plano encontrado|nenhum registro encontrado|nenhum resultado|no hay registros|sin registros|no se encontraron|no encontrado/i.test(
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
        cy.log('Nenhum plano encontrado na grade. Teste interrompido sem erro.');
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

      const nomePlano =
        textosColunas.find((texto) => {
          return (
            texto.length >= 2 &&
            !/^\d+$/.test(texto) &&
            !/^\+?\d/.test(texto) &&
            !/R\$|BRL|₲|\$|PYG/i.test(texto)
          );
        }) || textosColunas[0];

      if (!nomePlano) {
        cy.log('Nenhum nome de plano válido encontrado. Teste interrompido sem erro.');
        return null;
      }

      Cypress.log({
        name: 'Plano escolhido',
        message: nomePlano,
      });

      return nomePlano;
    });
  }

  beforeEach(() => {
    cy.login();

    fecharCookiesSeAparecer();

    abrirPlanos();
  });

  it('Deve buscar primeiro um plano existente e depois um inexistente.', () => {
    obterPlanoExistenteDaGrade().then((nomePlanoExistente) => {
      if (!nomePlanoExistente) {
        cy.log('Busca de planos não executada porque não existem planos cadastrados.');
        return;
      }

      buscarPlano(nomePlanoExistente);

      cy.get('body')
        .invoke('text')
        .should('include', nomePlanoExistente);

      limparBusca();

      const planoInexistente = `PLANO_INEXISTENTE_E2E_${Date.now()}`;

      buscarPlano(planoInexistente);

      cy.get('body').then(($body) => {
        const linhas = $body.find('tbody tr:visible');

        if (linhas.length > 0) {
          const textoTabela = linhas.text();

          expect(textoTabela).not.to.include(planoInexistente);
        }
      });
    });
  });
});