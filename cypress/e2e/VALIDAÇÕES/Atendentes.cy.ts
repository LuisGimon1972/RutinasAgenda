describe('Atendentes - Validações', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirCadastroAtendente() {
    cy.contains(/Atendentes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de atendentes/i, { timeout: 30000 })
      .should('be.visible');

    cy.contains(/Cadastrar atendente/i, { timeout: 30000 })
      .should('be.visible')
      .click({ force: true });

    cy.contains(/Cadastrar atendente/i, { timeout: 30000 })
      .should('be.visible');

    cy.url().should('include', '/service-providers/create');
  }

  function preencherInput(index: number, valor: string) {
    cy.get('input:visible')
      .eq(index)
      .should('be.visible')
      .click({ force: true })
      .type(`{selectall}{backspace}${valor}`, { force: true });
  }

  function clicarGravar() {
    cy.contains(/Gravar/i, { timeout: 30000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);
  }

  function validarQueNaoSaiuDoCadastro() {
    cy.url().should('include', '/service-providers/create');
  }

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();
    abrirCadastroAtendente();
  });

  it('Não deve gravar atendente sem preencher nenhum campo.', () => {
    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should(
        'match',
        /obrigat[oó]rio|required|preencha|nome|e-mail|email|senha/i
      );
  });

  it('Não deve gravar atendente sem nome completo.', () => {
    const timestamp = Date.now();
  
    preencherInput(1, `atendente.sem.nome.${timestamp}@teste.com`);

    preencherInput(2, 'Teste@123456');
    
    preencherInput(3, 'Teste@123456');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /nome|obrigat[oó]rio|required|preencha/i);
  });

  it('Não deve gravar atendente sem e-mail.', () => {
    const timestamp = Date.now();
  
    preencherInput(0, `Atendente Sem Email ${timestamp}`);    
    
    preencherInput(2, 'Teste@123456');
    
    preencherInput(3, 'Teste@123456');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /e-mail|email|obrigat[oó]rio|required|preencha/i);
  });

  it('Não deve aceitar e-mail inválido.', () => {
    const timestamp = Date.now();
    
    preencherInput(0, `Atendente Email Inválido ${timestamp}`);
    
    preencherInput(1, 'email-invalido');
    
    preencherInput(2, 'Teste@123456');

    // eq(3) Confirmar senha
    preencherInput(3, 'Teste@123456');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /e-mail|email|inv[aá]lido|invalido/i);
  });

  it('Não deve gravar atendente sem senha.', () => {
    const timestamp = Date.now();
    
    preencherInput(0, `Atendente Sem Senha ${timestamp}`);
    
    preencherInput(1, `atendente.sem.senha.${timestamp}@teste.com`);
    
    preencherInput(3, 'Teste@123456');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /senha|obrigat[oó]rio|required|preencha/i);
  });

  it('Não deve aceitar senha e confirmação diferentes.', () => {
    const timestamp = Date.now();
    
    preencherInput(0, `Atendente Senha Diferente ${timestamp}`);
    
    preencherInput(1, `atendente.senha.diferente.${timestamp}@teste.com`);
    
    preencherInput(2, 'Teste@123456');
    
    preencherInput(3, 'OutraSenha@123');

    clicarGravar();

    validarQueNaoSaiuDoCadastro();

    cy.get('body')
      .invoke('text')
      .should('match', /senha|confirma[çc][aã]o|diferente|confere|igual/i);
  });

  it('Não deve aceitar comissão de serviço maior que 100.', () => {
  const timestamp = Date.now();

  let statusCriacao: number | undefined;

  cy.intercept('POST', '**/users*', (req) => {
    req.continue((res) => {
      statusCriacao = res.statusCode;
    });
  }).as('criarAtendente');

  preencherInput(0, `Atendente Comissão Serviço ${timestamp}`);

  preencherInput(1, `atendente.comissao.servico.${timestamp}@teste.com`);

  preencherInput(2, 'Teste@123456');

  preencherInput(3, 'Teste@123456');

  preencherInput(4, '15000');

  preencherInput(5, '2000');

  clicarGravar();

  cy.wait(1500);

  cy.then(() => {
    expect(
      statusCriacao,
      'não deve retornar POST 201 ao tentar comissão de serviço maior que 100'
    ).to.not.eq(201);
  });

  validarQueNaoSaiuDoCadastro();

  cy.get('body')
    .invoke('text')
    .should('match', /comiss[aã]o|servi[çc]o|100|inv[aá]lido|invalido|required|obrigat[oó]rio/i);
});

 it('Não deve aceitar comissão de produto maior que 100.', () => {
  const timestamp = Date.now();

  let statusCriacao: number | undefined;

  cy.intercept('POST', '**/users*', (req) => {
    req.continue((res) => {
      statusCriacao = res.statusCode;
    });
  }).as('criarAtendente');

  preencherInput(0, `Atendente Comissão Produto ${timestamp}`);

  preencherInput(1, `atendente.comissao.produto.${timestamp}@teste.com`);

  preencherInput(2, 'Teste@123456');

  preencherInput(3, 'Teste@123456');

  preencherInput(4, '3000');

  preencherInput(5, '15000');

  clicarGravar();

  cy.wait(1500);

  cy.then(() => {
    expect(
      statusCriacao,
      'não deve retornar POST 201 ao tentar comissão de produto maior que 100'
    ).to.not.eq(201);
  });

  validarQueNaoSaiuDoCadastro();

  cy.get('body')
    .invoke('text')
    .should('match', /comiss[aã]o|produto|100|inv[aá]lido|invalido|required|obrigat[oó]rio/i);
});
});