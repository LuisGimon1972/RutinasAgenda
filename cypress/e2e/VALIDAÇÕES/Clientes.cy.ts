describe('Clientes - Validações', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirCadastroCliente() {
    cy.contains(/Clientes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de clientes/i, { timeout: 30000 })
      .should('be.visible');

    cy.contains(/Cadastrar cliente/i, { timeout: 30000 })
      .should('be.visible')
      .click({ force: true });

    cy.contains(/Dados do cliente/i, { timeout: 30000 })
      .should('be.visible');

    cy.url().should('include', '/customers/cadastro');
  }

  function preencherInput(index: number, valor: string) {
    cy.get('input:visible')
      .eq(index)
      .should('be.visible')
      .click({ force: true })
      .type(`{selectall}{backspace}${valor}`, { force: true });
  }

  function preencherData(index: number, valor: string) {
    cy.get('input:visible')
      .eq(index)
      .should('be.visible')
      .clear({ force: true })
      .type(valor, { force: true });
  }

  function clicarGravar() {
    cy.contains(/Gravar/i, { timeout: 30000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);
  }

  function validarQueNaoSaiuDoCadastro() {
    cy.url().should('include', '/customers/cadastro');
  }

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();
    abrirCadastroCliente();
  });

  it('Não deve gravar cliente sem preencher nenhum campo.', () => {
    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should(
        'match',
        /obrigat[oó]rio|required|preencha|nome|telefone|cpf|documento|e-mail|email/i
      );
  });

  it('Não deve gravar cliente sem nome completo.', () => {
    const timestamp = Date.now();  
    
    preencherInput(1, '49999999999');
    
    preencherInput(2, '12345678909');
    
    preencherInput(3, `cliente.validacao.${timestamp}@teste.com`);
    
    preencherData(4, '1990-05-20');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /nome|obrigat[oó]rio|required|preencha/i);
  });

  it('Não deve aceitar e-mail inválido.', () => {
  
    preencherInput(0, `Cliente Validação ${Date.now()}`);
  
    preencherInput(1, '49999999999');
  
    preencherInput(2, '12345678909');
  
    preencherInput(3, 'email-invalido');
    
    preencherData(4, '1990-05-20');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /e-mail|email|inv[aá]lido|invalido/i);
  });

  it('Não deve aceitar CPF inválido.', () => {
    const timestamp = Date.now();
  
    preencherInput(0, `Cliente CPF Inválido ${timestamp}`);
    
    preencherInput(1, '49999999999');
    
    preencherInput(2, '11111111111');
    
    preencherInput(3, `cliente.cpf.invalido.${timestamp}@teste.com`);
    
    preencherData(4, '1990-05-20');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /cpf|documento|inv[aá]lido|invalido/i);
  });

  it('Não deve aceitar telefone incompleto.', () => {
    const timestamp = Date.now();
  
    preencherInput(0, `Cliente Telefone Inválido ${timestamp}`);
    
    preencherInput(1, '49');
    
    preencherInput(2, '12345678909');
    
    preencherInput(3, `cliente.telefone.invalido.${timestamp}@teste.com`);
    
    preencherData(4, '1990-05-20');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /telefone|celular|inv[aá]lido|invalido|obrigat[oó]rio/i);
  });
});