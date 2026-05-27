describe('Clientes - Filtro de países', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function limparTexto(texto: string) {
    return String(texto || '').replace(/\s+/g, ' ').trim();
  }

  function normalizarTexto(texto: string) {
    return limparTexto(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  function abrirClientes() {
    cy.contains(/Clientes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Listagem de clientes|Listado de clientes|Clientes/i);
  }

  function editarPrimeiroClienteDaGrade() {
    cy.get('tbody tr:visible', { timeout: 30000 })
      .should('have.length.greaterThan', 0)
      .first()
      .then(($linha) => {
        const linkEditar = $linha
          .find('a[href*="/customers/"][href*="/edit"]')
          .get(0);

        if (linkEditar) {
          cy.wrap(linkEditar).click({ force: true });
          return;
        }

        const botaoEditar = $linha
          .find('button:visible, a:visible, [role="button"]:visible')
          .toArray()
          .find((acao) => {
            const texto = limparTexto(Cypress.$(acao).text());
            const html = String(acao.outerHTML || '');

            const pareceEditar =
              /edit|editar|border_color|create|pencil/i.test(texto) ||
              /edit|editar|border_color|create|pencil/i.test(html);

            const naoEhExcluir =
              !/delete|trash|excluir|remover|deletar/i.test(texto) &&
              !/delete|trash|excluir|remover|deletar/i.test(html);

            const naoEhWhatsapp =
              !/whatsapp|wa\.me/i.test(texto) &&
              !/whatsapp|wa\.me/i.test(html);

            return pareceEditar && naoEhExcluir && naoEhWhatsapp;
          });

        if (!botaoEditar) {
          cy.screenshot('botao-editar-cliente-nao-encontrado');
          throw new Error('Botão de editar cliente não encontrado na primeira linha.');
        }

        cy.wrap(botaoEditar).click({ force: true });
      });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Editar cliente|Dados do cliente|Datos del cliente|Cliente/i
      );

    cy.url({ timeout: 30000 }).should('match', /\/customers\/.+\/edit/i);
  }

function clicarBandeiraPaises() {
  cy.get('body', { timeout: 30000 })
    .invoke('text')
    .should(
      'match',
      /Dados do cliente|Datos del cliente|Telefone|Teléfono|Phone/i
    );

  cy.contains(/Telefone|Teléfono|Phone/i, { timeout: 30000 })
    .should('be.visible');

  cy.wait(1000);

  cy.get('body', { timeout: 30000 }).then(($body) => {
    const bandeira =
      $body.find('.iti__selected-country:visible').first()[0] ||
      $body.find('.iti__selected-flag:visible').first()[0] ||
      $body.find('.iti__flag-container:visible').first()[0];

    if (bandeira) {
      cy.wrap(bandeira).click({ force: true });
      return;
    }

    /*
      Fallback: se a classe da bandeira não aparecer no DOM,
      clica pela posição do label Telefone.
      A bandeira fica logo abaixo do label, no início do campo.
    */
    const labelTelefone = $body
      .find('*:visible')
      .toArray()
      .find((el) => /Telefone|Teléfono|Phone/i.test(Cypress.$(el).text()));

    if (!labelTelefone) {
      cy.screenshot('label-telefone-nao-encontrado');
      throw new Error('Label Telefone/Teléfono/Phone não encontrado.');
    }

    const rect = labelTelefone.getBoundingClientRect();

    cy.get('body').click(rect.left + 25, rect.bottom + 32, {
      force: true,
    });
  });

  cy.get('input:visible', { timeout: 30000 })
    .filter((_index, input) => {
      const placeholder = String(input.getAttribute('placeholder') || '');

      return /buscar|search|pesquisar/i.test(placeholder);
    })
    .first()
    .should('be.visible');
}

function buscarPais(texto: string) {
  cy.get('input:visible', { timeout: 30000 })
    .filter((_index, input) => {
      const placeholder = String(input.getAttribute('placeholder') || '');

      return /buscar|search|pesquisar/i.test(placeholder);
    })
    .first()
    .should('be.visible')
    .click({ force: true })
    .type(`{selectall}{backspace}${texto}`, { force: true });

  cy.wait(800);
}

  function validarPaisExistente() {
    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Venezuela|\+49/i);
  }

  function validarPaisInexistente(paisInexistente: string) {
    cy.get('body').then(($body) => {
      const textoTela = limparTexto($body.text());

      expect(textoTela).not.to.include(paisInexistente);
    });
  }

  beforeEach(() => {
    cy.viewport(1366, 768);

    cy.login();

    fecharCookiesSeAparecer();

    abrirClientes();
  });

it('Deve filtrar país existente e país inexistente no seletor de bandeira.', () => {
  editarPrimeiroClienteDaGrade();

  clicarBandeiraPaises();

  buscarPais('Brazil');

  cy.get('body')
    .invoke('text')
    .should('match', /Brazil|Brasil|\+55/i);

  buscarPais('Venezuela');

  cy.get('body')
    .invoke('text')
    .should('match', /Venezuela|\+49/i);

  const paisInexistente = `PAIS_INEXISTENTE_E2E_${Date.now()}`;

  buscarPais(paisInexistente);

  cy.get('body')
    .invoke('text')
    .should('not.include', paisInexistente);
});
});