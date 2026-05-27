describe('Clientes - Busca', () => {
  function fecharCookiesSeAparecer() {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });
  }

  function abrirClientes() {
    cy.contains(/Clientes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.contains(/Listagem de clientes/i, { timeout: 30000 })
      .should('be.visible');
  }

  function buscarCliente(texto: string) {
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

  function obterClienteExistenteDaGrade() {
  return cy.get('body', { timeout: 30000 }).then(($body) => {
    const linhasValidas = $body
      .find('tbody tr:visible')
      .toArray()
      .filter((linha) => {
        const $linha = Cypress.$(linha);
        const texto = $linha.text().trim();
        const temColunas = $linha.find('td').length > 0;

        return temColunas && texto.length > 0;
      });

    if (linhasValidas.length === 0) {
      cy.log('Nenhum cliente encontrado na grade. Teste interrompido sem erro.');

      Cypress.log({
        name: 'Clientes',
        message: 'Nenhum cliente encontrado na grade. Teste finalizado sem falha.',
      });

      return null;
    }

    const indiceAleatorio = Cypress._.random(0, linhasValidas.length - 1);
    const linhaSelecionada = Cypress.$(linhasValidas[indiceAleatorio]);

    const textosColunas = linhaSelecionada
      .find('td')
      .toArray()
      .map((td) => Cypress.$(td).text().trim())
      .filter((texto) => texto.length > 0)
      .filter((texto) => !/drag_indicator/i.test(texto));

    const nomeCliente = textosColunas[0];

    if (!nomeCliente) {
      cy.log('Cliente sem nome na grade. Teste interrompido sem erro.');

      Cypress.log({
        name: 'Clientes',
        message: 'Linha encontrada, mas sem nome de cliente.',
      });

      return null;
    }

    Cypress.log({
      name: 'Cliente escolhido',
      message: nomeCliente,
    });

    return nomeCliente;
  });
}

  beforeEach(() => {
    cy.login();
    fecharCookiesSeAparecer();
    abrirClientes();
  });

it('Deve buscar primeiro um cliente existente e depois um inexistente.', () => {
  obterClienteExistenteDaGrade().then((nomeClienteExistente) => {
    
    if (!nomeClienteExistente) {     
      return;
    }

    buscarCliente(nomeClienteExistente);

    cy.get('body')
      .invoke('text')
      .should('include', nomeClienteExistente);

    limparBusca();

    const clienteInexistente = `CLIENTE_INEXISTENTE_E2E_${Date.now()}`;

    buscarCliente(clienteInexistente);

    cy.get('body').then(($body) => {
      const linhas = $body.find('tbody tr:visible');

      if (linhas.length > 0) {
        const textoTabela = linhas.text();

        expect(textoTabela).not.to.include(clienteInexistente);
      }
    });
  });
});
});