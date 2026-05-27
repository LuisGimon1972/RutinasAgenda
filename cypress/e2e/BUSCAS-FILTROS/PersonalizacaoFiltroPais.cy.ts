describe('Configurações - Personalização - Filtro de países', () => {
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

  function abrirConfiguracoes() {
    cy.contains(/Configura[çc][õo]es|Configuraciones|Settings/i, {
      timeout: 30000,
    })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Configura[çc][õo]es|Configuraciones|Settings|General|WhatsApp|Personaliza[çc][aã]o|Personalización/i
      );
  }

  function abrirPersonalizacao() {
    cy.contains(
      /Personaliza[çc][aã]o|Personalización|Personalizacion|Personalization/i,
      { timeout: 30000 }
    )
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Dados do site|Datos del sitio|URL do site|URL de tu sitio web|Telefone|Teléfono|Phone/i
      );

    cy.wait(1500);
  }

  function clicarBandeiraPaises() {
    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Dados do site|Datos del sitio|Telefone|Teléfono|Phone/i
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

      const labelTelefone = $body
        .find('*:visible')
        .toArray()
        .find((el) => /Telefone|Teléfono|Phone/i.test(Cypress.$(el).text()));

      if (!labelTelefone) {
        cy.screenshot('label-telefone-configuracao-nao-encontrado');

        throw new Error(
          'Label Telefone/Teléfono/Phone não encontrado em Configurações > Personalização.'
        );
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
  });

  it('Deve filtrar país existente e país inexistente na Personalização.', () => {
    abrirConfiguracoes();

    abrirPersonalizacao();

    clicarBandeiraPaises();

    buscarPais('Brazil');

    cy.get('body')
      .invoke('text')
      .should('match', /Brazil|Brasil|\+55/i);

    buscarPais('United States');

    cy.get('body')
      .invoke('text')
      .should('match', /United States|\+58/i);

    const paisInexistente = `PAIS_INEXISTENTE_E2E_${Date.now()}`;

    buscarPais(paisInexistente);

    validarPaisInexistente(paisInexistente);
  });
});