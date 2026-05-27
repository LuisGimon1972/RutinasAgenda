describe('Configurações - Personalização', () => {
  function preencherInputSeExistir(index: number, valor: string) {
    cy.get('input:visible').then(($inputs) => {
      if ($inputs.length > index) {
        cy.wrap($inputs.eq(index))
          .click({ force: true })
          .type(`{selectall}{backspace}${valor}`, { force: true });
      }
    });
  }

  beforeEach(() => {
    cy.login();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Entendi')) {
        cy.contains('Entendi').click({ force: true });
      }
    });

    cy.contains(/Configura[çc][õo]es/i, { timeout: 30000 })
      .click({ force: true });
  });

  it('Deve editar campos da aba Personalização sem sair e sem gravar.', () => {
    cy.contains(/Personaliza[çc][aã]o/i, { timeout: 30000 })
      .click({ force: true });

    cy.wait(1000);

    preencherInputSeExistir(1, '49999999999');
    
    preencherInputSeExistir(2, 'MUITO BOA TESTE E2E');
    
    cy.get('button:visible, .q-btn:visible').then(($botoes) => {
      const botaoMais = [...$botoes].find((botao) =>
        botao.textContent?.includes('+')
      );

      if (botaoMais) {
        cy.wrap(botaoMais).click({ force: true });
      }
    });
    
    cy.get('body').then(($body) => {
      const cores = $body.find(
        '[role="radio"], .q-radio, .tw-rounded-full, .rounded-full'
      );

      if (cores.length > 0) {
        cy.wrap(cores.first()).click({ force: true });
      }
    });   
  });
});