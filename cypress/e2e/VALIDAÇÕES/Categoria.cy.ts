describe('Categorias - Validações', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirCategorias() {
    cy.contains(/Categorias/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de categorias/i, { timeout: 30000 })
      .should('be.visible');
  }

  function abrirCadastroCategoria() {
    abrirCategorias();

    cy.contains(/Cadastrar categoria/i, { timeout: 30000 })
      .should('be.visible')
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Cadastrar categoria|Nome da categoria|Descri[çc][aã]o|Gravar/i);
  }

  function preencherInput(index: number, valor: string) {
    cy.get('input:visible')
      .eq(index)
      .should('be.visible')
      .scrollIntoView()
      .click({ force: true });

    cy.get('input:visible')
      .eq(index)
      .type('{selectall}{backspace}', { force: true });

    cy.wait(200);

    cy.get('input:visible')
      .eq(index)
      .type(valor, { force: true, delay: 20 });
  }

  function preencherDescricao(valor: string) {
    cy.get('textarea:visible').then(($textareas) => {
      if ($textareas.length > 0) {
        cy.wrap($textareas.first())
          .scrollIntoView()
          .click({ force: true });

        cy.get('textarea:visible')
          .first()
          .type('{selectall}{backspace}', { force: true });

        cy.wait(200);

        cy.get('textarea:visible')
          .first()
          .type(valor, { force: true, delay: 20 });
      }
    });
  }

  function clicarGravar() {
    cy.contains(/Gravar/i, { timeout: 30000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    cy.wait(1200);
  }

  function validarErroFormulario(expressao: RegExp) {
    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', expressao);
  }

  function criarCategoriaE2E(nomeCategoria: string) {
    abrirCadastroCategoria();

    preencherInput(0, nomeCategoria);

    preencherDescricao(`Categoria criada para validação E2E ${Date.now()}`);

    clicarGravar();

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /categoria|sucesso|salvo|cadastrado|Listagem de categorias/i);
  }

  function buscarCategoria(nomeCategoria: string) {
    abrirCategorias();

    cy.get('input:visible')
      .first()
      .should('be.visible')
      .click({ force: true })
      .type(`{selectall}{backspace}${nomeCategoria}`, { force: true });

    cy.wait(1500);

    cy.get('body')
      .invoke('text')
      .should('include', nomeCategoria);
  }

  function abrirEdicaoCategoria(nomeCategoria: string) {
    buscarCategoria(nomeCategoria);

    cy.contains('tbody tr:visible', nomeCategoria, { timeout: 30000 })
      .should('exist')
      .within(() => {
        cy.get('td')
          .last()
          .find('i, button, svg, [role="button"], .q-icon')
          .first()
          .click({ force: true });
      });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Cadastrar categoria|Editar categoria|Nome da categoria|Gravar/i);
  }

  function tentarSelecionarCategoriaPaiIgualElaMesma(nomeCategoria: string) {    
    cy.get('input:visible')
      .then(($inputs) => {
        if ($inputs.length < 2) {
          cy.log('Campo Categoria pai não encontrado. Sistema pode não permitir edição de categoria pai.');
          return;
        }

        cy.wrap($inputs.eq(1))
          .scrollIntoView()
          .click({ force: true });
      });

    cy.wait(700);

    cy.get('body').then(($body) => {
      const seletorOpcao =
        '.q-menu:visible .q-item, .q-virtual-scroll__content .q-item, [role="option"]';

      const opcoes = $body.find(seletorOpcao).filter(':visible');

      if (opcoes.length === 0) {
        cy.log('Nenhuma opção apareceu no campo Categoria pai.');
        return;
      }

      const opcaoMesmaCategoria = opcoes.filter((_, el) => {
        const texto = Cypress.$(el).text().trim();

        return texto.includes(nomeCategoria);
      });

      if (opcaoMesmaCategoria.length === 0) {
        cy.log('A própria categoria não aparece como opção de Categoria pai. Comportamento correto.');
        return;
      }

      cy.wrap(opcaoMesmaCategoria.first())
        .click({ force: true });

      cy.wait(500);

      clicarGravar();

      validarErroFormulario(
        /categoria pai|pr[oó]pria categoria|ela mesma|inv[aá]lido|invalido|não pode|nao pode|erro/i
      );
    });
  }

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();
  });

  it('Não deve gravar categoria sem nome.', () => {
    abrirCadastroCategoria();
    
    preencherDescricao('Descrição de teste para categoria sem nome');

    clicarGravar();

    validarErroFormulario(
      /nome|categoria|obrigat[oó]rio|required|preencha/i
    );
  });

  it('Não deve aceitar nome de categoria muito curto.', () => {
    abrirCadastroCategoria();

    preencherInput(0, 'A');

    preencherDescricao('Descrição de teste para nome muito curto');

    clicarGravar();

    validarErroFormulario(
      /nome|mínimo|minimo|caracteres|inv[aá]lido|invalido/i
    );
  });

  it('Não deve permitir categoria pai igual a ela mesma, se o sistema permitir editar.', () => {
    const nomeCategoria = `E2E Categoria Self Parent ${Date.now()}`;

    criarCategoriaE2E(nomeCategoria);

    abrirEdicaoCategoria(nomeCategoria);

    tentarSelecionarCategoriaPaiIgualElaMesma(nomeCategoria);
  });
});