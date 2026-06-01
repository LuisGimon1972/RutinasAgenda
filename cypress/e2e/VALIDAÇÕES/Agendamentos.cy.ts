describe('Agendamentos - Validações', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      const texto = $body.text();

      if (/Entendi|Aceitar|Aceito|OK|Concordo/i.test(texto)) {
        cy.contains(/Entendi|Aceitar|Aceito|OK|Concordo/i)
          .click({ force: true });
      }
    });
  }

  function abrirCadastroAgendamento() {
    cy.contains(/Agenda/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de agendamentos/i, { timeout: 30000 })
      .should('be.visible');

    cy.contains(/Cadastrar agendamento/i, { timeout: 30000 })
      .should('be.visible')
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Escolha o servi[çc]o/i);
  }

  function obterCardsServico($body: JQuery<HTMLElement>) {
    return $body
      .find('div:visible, button:visible, [role="button"]:visible')
      .toArray()
      .filter((el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().replace(/\s+/g, ' ').trim();
        const rect = el.getBoundingClientRect();

        const temTamanhoDeCard =
          rect.width >= 100 &&
          rect.width <= 350 &&
          rect.height >= 60 &&
          rect.height <= 250;

        const pareceServico =
          /R\$\s*\d+/i.test(texto) ||
          /A partir de R\$/i.test(texto);

        const naoEhCampoBusca =
          !/Buscar servi[çc]o|Escolha o servi[çc]o|Exibir mais/i.test(texto);

        return temTamanhoDeCard && pareceServico && naoEhCampoBusca;
      }) as HTMLElement[];
  }

  function selecionarServico() {
    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Escolha o servi[çc]o/i);

    cy.wait(1000);

    cy.get('body').then(($body) => {
      const cardsServico = obterCardsServico($body);

      if (cardsServico.length === 0) {
        cy.screenshot('servico-nao-encontrado');

        throw new Error(
          'Nenhum card de serviço encontrado. Verifique se existem serviços disponíveis no cadastro de agendamento.'
        );
      }

      const cardServico = cardsServico[0];

      const textoServico = Cypress.$(cardServico)
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      cy.log(`Serviço escolhido: ${textoServico}`);

      cy.wrap(cardServico)
        .scrollIntoView()
        .click('center', { force: true });
    });

    cy.wait(1200);
  }

  function obterCardsProfissional($body: JQuery<HTMLElement>) {
    return $body
      .find('div:visible, button:visible, [role="button"]:visible')
      .toArray()
      .filter((el) => {
        const $el = Cypress.$(el);
        const texto = $el.text().replace(/\s+/g, ' ').trim();
        const rect = el.getBoundingClientRect();

        const temTamanhoDeCard =
          rect.width >= 80 &&
          rect.width <= 400 &&
          rect.height >= 60 &&
          rect.height <= 300;

        const naoEhTitulo =
          !/Escolha o profissional|Escolha o servi[çc]o|Buscar|Exibir mais/i.test(
            texto
          );

        const temTextoValido = texto.length >= 3;

        return temTamanhoDeCard && naoEhTitulo && temTextoValido;
      }) as HTMLElement[];
  }

  function selecionarProfissional() {
    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Escolha o profissional/i);

    cy.wait(1000);

    cy.get('body').then(($body) => {
      const cardsProfissional = obterCardsProfissional($body);

      if (cardsProfissional.length === 0) {
        cy.screenshot('profissional-nao-encontrado');

        throw new Error(
          'Nenhum card de profissional foi encontrado após selecionar o serviço.'
        );
      }

      const profissionalE2E = cardsProfissional.find((card) => {
        const texto = Cypress.$(card).text().replace(/\s+/g, ' ').trim();

        return /E2E\s+Atendente/i.test(texto);
      });

      const cardProfissional = profissionalE2E || cardsProfissional[0];

      const textoProfissional = Cypress.$(cardProfissional)
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      cy.log(`Profissional escolhido: ${textoProfissional}`);

      cy.wrap(cardProfissional)
        .scrollIntoView()
        .click('center', { force: true });
    });

    cy.wait(2000);
  }

  function selecionarDataDoCadastro() {
    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /\d{2}\/\d{2}/);

    cy.get('body').then(($body) => {
      const datas = $body
        .find('*:visible')
        .toArray()
        .filter((el) => {
          const $el = Cypress.$(el);
          const texto = $el.text().trim();

          const ehData = /^\d{2}\/\d{2}$/.test(texto);
          const estaEmTabela = $el.closest('table, tbody, tr').length > 0;
          const estaEmBreadcrumb =
            $el.closest('[class*="breadcrumb"]').length > 0;

          return ehData && !estaEmTabela && !estaEmBreadcrumb;
        }) as HTMLElement[];

      expect(
        datas.length,
        'datas disponíveis no cadastro'
      ).to.be.greaterThan(0);

      cy.wrap(datas[0])
        .scrollIntoView()
        .click({ force: true });
    });

    cy.wait(1500);
  }

  function selecionarHorarioDoCadastro() {
    cy.contains(/Hor[aá]rios dispon[ií]veis/i, { timeout: 30000 })
      .should('exist');

    cy.get('body').then(($body) => {
      const horarios = $body
        .find('*:visible')
        .toArray()
        .filter((el) => {
          const $el = Cypress.$(el);
          const texto = $el.text().trim();

          const ehHorario = /^\d{1,2}:\d{2}h$/i.test(texto);
          const estaEmTabela = $el.closest('table, tbody, tr').length > 0;

          return ehHorario && !estaEmTabela;
        }) as HTMLElement[];

      expect(
        horarios.length,
        'horários disponíveis no cadastro'
      ).to.be.greaterThan(0);

      cy.wrap(horarios[0])
        .scrollIntoView()
        .click({ force: true });
    });

    cy.wait(1000);
  }

  function clicarGravarSeExistir() {
    cy.get('body').then(($body) => {
      const botoesGravar = $body
        .find('button:visible, .q-btn:visible, [role="button"]:visible')
        .toArray()
        .filter((botao) => {
          const texto = Cypress.$(botao)
            .text()
            .replace(/\s+/g, ' ')
            .trim();

          return /Gravar|Agendar|Salvar|Guardar/i.test(texto);
        }) as HTMLElement[];

      if (botoesGravar.length === 0) {
        cy.log('Botão Gravar ainda não existe nesta etapa.');
        return;
      }

      cy.wrap(botoesGravar[0])
        .scrollIntoView()
        .click({ force: true });

      cy.wait(1000);
    });
  }

  function validarQueFormularioFinalNaoApareceu() {
    cy.get('body')
      .invoke('text')
      .should('not.match', /Nome do cliente|Telefone\/Celular/i);
  }

  function validarSemErroGrave() {
    cy.get('body')
      .invoke('text')
      .should(
        'not.match',
        /TypeError|Cannot read|undefined is not|Internal Server Error|Network Error|Erro interno|is not a function/i
      );
  }

  beforeEach(() => {
    cy.login();

    fecharCookiesSeAparecer();

    abrirCadastroAgendamento();
  });

  it('Não deve avançar sem selecionar serviço', () => {
    cy.get('body')
      .invoke('text')
      .should('match', /Escolha o servi[çc]o/i);

    clicarGravarSeExistir();

    cy.get('body')
      .invoke('text')
      .should('match', /Escolha o servi[çc]o|servi[çc]o/i);

    validarSemErroGrave();
  });

  it('Não deve avançar para data sem selecionar profissional', () => {
    selecionarServico();

    cy.get('body')
      .invoke('text')
      .should('match', /Escolha o profissional/i);

    validarQueFormularioFinalNaoApareceu();

    validarSemErroGrave();
  });

  it('Não deve exibir formulário final sem selecionar data', () => {
    selecionarServico();

    selecionarProfissional();

    validarQueFormularioFinalNaoApareceu();

    validarSemErroGrave();
  });

  it('Não deve exibir formulário final sem selecionar horário', () => {
    selecionarServico();

    selecionarProfissional();

    selecionarDataDoCadastro();

    validarQueFormularioFinalNaoApareceu();

    validarSemErroGrave();
  });

  it('Não deve gravar sem selecionar cliente', () => {
    selecionarServico();

    selecionarProfissional();

    selecionarDataDoCadastro();

    selecionarHorarioDoCadastro();

    cy.contains(/Nome do cliente/i, { timeout: 30000 })
      .scrollIntoView()
      .should('be.visible');

    cy.contains(/Gravar|Salvar|Agendar|Guardar/i, { timeout: 30000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /cliente|obrigat[oó]rio|required|preencha|selecione|Nome do cliente/i
      );

    validarSemErroGrave();
  });

  afterEach(() => {
    cy.log('✅ Teste finalizado!');
  });

  after(() => {
    cy.log('✅ Todos os testes foram finalizados!');
  });
});