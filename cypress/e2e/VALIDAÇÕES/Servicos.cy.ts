describe('Serviços - Validações', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirCadastroServico() {
    cy.contains(/Servi[çc]os/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Listagem de servi[çc]os|Servi[çc]os/i);

    cy.contains(/Cadastrar servi[çc]o/i, { timeout: 30000 })
      .should('be.visible')
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', /Cadastrar servi[çc]o|Nome do servi[çc]o|Dura[çc][aã]o|Gravar/i);
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

  function validarErroDeFormulario(expressao: RegExp) {
    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should('match', expressao);
  }

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();
    abrirCadastroServico();
  });

  it('Não deve gravar serviço sem preencher nenhum campo.', () => {
    clicarGravar();

    validarErroDeFormulario(
      /obrigat[oó]rio|required|preencha|nome|servi[çc]o|dura[çc][aã]o/i
    );
  });

  it('Não deve gravar serviço sem nome.', () => {   
    
    preencherInput(1, '30');

    preencherDescricao('Descrição de teste para serviço sem nome');

    clicarGravar();

    validarErroDeFormulario(
      /nome|servi[çc]o|obrigat[oó]rio|required|preencha/i
    );
  });

  it('Não deve gravar serviço sem duração.', () => {
    const timestamp = Date.now();
  
    preencherInput(0, `Serviço Validação ${timestamp}`);    

    preencherDescricao('Descrição de teste para serviço sem duração');

    clicarGravar();

    validarErroDeFormulario(
      /dura[çc][aã]o|tempo|minuto|obrigat[oó]rio|required|preencha/i
    );
  });

  it('Não deve aceitar duração zero.', () => {
    const timestamp = Date.now();
    
    preencherInput(0, `E2E Serviço Duração Zero ${timestamp}`);
    
    preencherInput(1, '0');

    preencherDescricao('Descrição de teste para duração zero');

    clicarGravar();

    validarErroDeFormulario(
      /dura[çc][aã]o|tempo|minuto|maior que zero|inv[aá]lido|invalido/i
    );
  });

  it('Não deve aceitar duração negativa.', () => {
    const timestamp = Date.now();
    
    preencherInput(0, `E2E Serviço Duração Negativa ${timestamp}`);
    
    preencherInput(1, '-30');

    preencherDescricao('Descrição de teste para duração negativa');

    clicarGravar();

    validarErroDeFormulario(
      /dura[çc][aã]o|tempo|minuto|negativo|maior que zero|inv[aá]lido|invalido/i
    );
  });

  it('Não deve aceitar nome muito curto.', () => {   
    preencherInput(0, 'A');
    
    preencherInput(1, '30');

    preencherDescricao('Descrição de teste para nome muito curto');

    clicarGravar();

    validarErroDeFormulario(
      /nome|mínimo|minimo|caracteres|inv[aá]lido|invalido/i
    );
  });
});