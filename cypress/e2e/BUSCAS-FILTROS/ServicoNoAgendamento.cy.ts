describe('Agendamentos - Busca de serviços no cadastro', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirAgenda() {
    cy.contains(/Agenda/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de agendamentos/i, { timeout: 30000 })
      .should('be.visible');
  }

  function extrairNomeServico(textoCard: string) {
  return textoCard
    .replace(/\s+/g, ' ')
    .replace(/a?\s*partir\s*de.*$/i, '')
    .replace(/R\$\s*\d+[.,]?\d*/gi, '')
    .trim();
}

  function abrirCadastroAgendamento() {
    cy.contains(/Cadastrar agendamento/i, { timeout: 30000 })
      .should('be.visible')
      .click({ force: true });

    cy.contains(/Escolha o servi[çc]o/i, { timeout: 30000 })
      .should('be.visible');

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Buscar servi[çc]o por nome|Escolha o servi[çc]o/i);
  }

  function normalizarTexto(texto: string) {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function obterCardsServicos($body: JQuery<HTMLElement>) {
    return $body
      .find('div:visible')
      .toArray()
      .filter((card) => {
        const $card = Cypress.$(card);
        const texto = $card.text().replace(/\s+/g, ' ').trim();
        const rect = card.getBoundingClientRect();

        const temTamanhoDeCard =
          rect.width >= 120 &&
          rect.width <= 300 &&
          rect.height >= 70 &&
          rect.height <= 180;

        const temValor = /R\$\s*\d+/i.test(texto);

        const naoEhContainer =
          !/Escolha o servi[çc]o|Buscar servi[çc]o|Exibir mais|Listagem de agendamentos/i.test(
            texto
          );

        return temTamanhoDeCard && temValor && texto.length > 0 && naoEhContainer;
      }) as HTMLElement[];
  }

  function campoBuscaServico() {
    return cy.get('input:visible', { timeout: 30000 }).then(($inputs) => {
      const inputBusca = $inputs
        .filter((_, input) => {
          const $input = Cypress.$(input);

          const placeholder = String($input.attr('placeholder') || '');
          const ariaLabel = String($input.attr('aria-label') || '');

          return /buscar.*servi/i.test(`${placeholder} ${ariaLabel}`);
        })
        .first();

      const campo = inputBusca.length > 0 ? inputBusca : $inputs.first();

      expect(campo.length, 'campo de busca de serviço').to.be.greaterThan(0);

      return cy.wrap(campo);
    });
  }

  function buscarServico(texto: string) {

    campoBuscaServico()
      .should('be.visible')
      .click({ force: true });

    campoBuscaServico()
      .type('{selectall}{backspace}', { force: true });

    cy.wait(300);

    campoBuscaServico()
      .type(texto, { force: true, delay: 20 });

    cy.wait(1500);
  }

  function limparBusca() {
    campoBuscaServico()
      .should('be.visible')
      .click({ force: true });

    campoBuscaServico()
      .type('{selectall}{backspace}', { force: true });

    cy.wait(1200);
  }

  function obterServicoExistenteDaTela() {
    return cy.get('body').then(($body) => {
      const cards = obterCardsServicos($body);

      expect(
        cards.length,
        'serviços disponíveis no cadastro de agendamento'
      ).to.be.greaterThan(0);

      const indiceAleatorio = Cypress._.random(0, cards.length - 1);
      const cardSelecionado = cards[indiceAleatorio];

      const textoCard = Cypress.$(cardSelecionado)
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      const nomeServico = extrairNomeServico(textoCard);

      expect(nomeServico, 'nome do serviço existente').to.not.be.empty;

      Cypress.log({
        name: 'Serviço escolhido',
        message: nomeServico,
      });

      return nomeServico;
    });
  }

  function validarFiltroExistente(nomeServico: string) {
    const nomeNormalizado = normalizarTexto(nomeServico);

    cy.get('body', { timeout: 10000 }).should(($body) => {
      const cards = obterCardsServicos($body);

      expect(
        cards.length,
        'quantidade de serviços após busca existente'
      ).to.be.greaterThan(0);

      const cardsInvalidos = cards.filter((card) => {
        const textoCard = normalizarTexto(Cypress.$(card).text());

        return !textoCard.includes(nomeNormalizado);
      });

      expect(
        cardsInvalidos.length,
        `todos os cards devem conter o serviço buscado: ${nomeServico}`
      ).to.eq(0);
    });
  }

  function validarFiltroInexistente() {
    cy.get('body', { timeout: 10000 }).should(($body) => {
      const cards = obterCardsServicos($body);

      expect(
        cards.length,
        'não deve exibir serviços para busca inexistente'
      ).to.eq(0);
    });
  }

  beforeEach(() => {
    cy.login();

    fecharCookiesSeAparecer();

    abrirAgenda();

    abrirCadastroAgendamento();
  });

  it('Deve filtrar um serviço existente e depois um serviço inexistente.', () => {
    obterServicoExistenteDaTela().then((nomeServicoExistente) => {
      buscarServico(nomeServicoExistente);

      validarFiltroExistente(nomeServicoExistente);

      limparBusca();

      const servicoInexistente = `SERVICO_INEXISTENTE_AGENDAMENTO_${Date.now()}`;

      buscarServico(servicoInexistente);

      validarFiltroInexistente();
    });
  });
});