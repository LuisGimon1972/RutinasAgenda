describe('Limpeza - Planos criados pelos testes E2E', () => {
  const regexPlanoE2E =
    /E2E|TESTE E2E|Plano E2E|Plano_Teste|Plano Teste|Plan E2E/i;

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

  function abrirPlanos() {
    cy.contains(/Planos|Planes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Planos|Planes|Listagem de planos|Listado de planes|Cadastrar plano|Registrar plan/i
      );

    cy.wait(1500);
  }

  function buscarPlanosE2E() {
    cy.get('body').then(($body) => {
      const inputs = $body.find('input:visible');

      if (inputs.length === 0) {
        cy.log('Campo de busca não encontrado. Continuando com a grade atual.');
        return;
      }

      cy.wrap(inputs.first())
        .click({ force: true })
        .type('{selectall}{backspace}E2E', { force: true });

      cy.wait(1500);
    });
  }

  function linhaTemBotaoExcluir(linha: HTMLElement) {
    const botoes = Cypress.$(linha)
      .find('button:visible, a:visible, [role="button"]:visible, .q-btn:visible')
      .toArray();

    return botoes.some((botao) => {
      const texto = limparTexto(Cypress.$(botao).text());
      const html = String(botao.outerHTML || '');
      const conteudo = `${texto} ${html}`;

      const pareceExcluir =
        /delete|delete_outline|trash|excluir|eliminar|remover|apagar|deletar/i.test(
          conteudo
        );

      const naoEhEditar =
        !/edit|editar|border_color|create|pencil/i.test(conteudo);

      return pareceExcluir && naoEhEditar;
    });
  }

  function obterPrimeiraLinhaPlanoE2E($body: JQuery<HTMLElement>) {
    const linhas = $body.find('tbody tr:visible').toArray();

    const linhaPlanoE2E = linhas.find((linha) => {
      const $linha = Cypress.$(linha);
      const textoLinha = limparTexto($linha.text());
      const temColunas = $linha.find('td').length > 0;

      const naoEhLinhaVazia =
        !/nenhum|no hay|sin registros|no encontrado|nenhum plano|ningún plan/i.test(
          textoLinha
        );

      return (
        temColunas &&
        naoEhLinhaVazia &&
        regexPlanoE2E.test(textoLinha) &&
        linhaTemBotaoExcluir(linha)
      );
    });

    return linhaPlanoE2E || null;
  }

  function clicarExcluirNaLinha(linha: HTMLElement) {
    const botoes = Cypress.$(linha)
      .find('button:visible, a:visible, [role="button"]:visible, .q-btn:visible')
      .toArray();

    const botaoExcluir = botoes.find((botao) => {
      const texto = limparTexto(Cypress.$(botao).text());
      const html = String(botao.outerHTML || '');
      const conteudo = `${texto} ${html}`;

      const pareceExcluir =
        /delete|delete_outline|trash|excluir|eliminar|remover|apagar|deletar/i.test(
          conteudo
        );

      const naoEhEditar =
        !/edit|editar|border_color|create|pencil/i.test(conteudo);

      return pareceExcluir && naoEhEditar;
    });

    if (!botaoExcluir) {
      cy.screenshot('botao-excluir-plano-e2e-nao-encontrado');
      throw new Error('Botão de excluir plano E2E não encontrado na linha.');
    }

    cy.wrap(botaoExcluir)
      .scrollIntoView()
      .click({ force: true });
  }

  function confirmarExclusaoSeAparecer() {
    cy.wait(500);

    cy.get('body').then(($body) => {
      const botoesConfirmacao = $body
        .find('button:visible, .q-btn:visible, [role="button"]:visible')
        .toArray();

      const botaoConfirmar = botoesConfirmacao.find((botao) => {
        const texto = limparTexto(Cypress.$(botao).text());

        const ehConfirmar =
          /confirmar|excluir|eliminar|remover|apagar|deletar|sim|sí|si|yes/i.test(
            texto
          );

        const naoEhCancelar =
          !/cancelar|cancel|não|nao|no|voltar/i.test(texto);

        return ehConfirmar && naoEhCancelar;
      });

      if (botaoConfirmar) {
        cy.wrap(botaoConfirmar).click({ force: true });
      } else {
        cy.log(
          'Modal de confirmação não apareceu ou exclusão não exige confirmação.'
        );
      }
    });

    cy.wait(1500);
  }

  function apagarPlanosE2E(tentativa = 1) {
    if (tentativa > 100) {
      throw new Error(
        'Limite de 100 tentativas atingido ao apagar planos E2E.'
      );
    }

    cy.get('body', { timeout: 30000 }).then(($body) => {
      const linhaPlanoE2E = obterPrimeiraLinhaPlanoE2E($body);

      if (!linhaPlanoE2E) {
        cy.log('Nenhum plano E2E encontrado. Limpeza finalizada sem erro.');
        return;
      }

      const textoPlano = limparTexto(Cypress.$(linhaPlanoE2E).text());

      cy.log(`Apagando plano E2E ${tentativa}: ${textoPlano}`);

      clicarExcluirNaLinha(linhaPlanoE2E);

      confirmarExclusaoSeAparecer();

      buscarPlanosE2E();

      apagarPlanosE2E(tentativa + 1);
    });
  }

  function validarNenhumPlanoE2E() {
    cy.get('body').then(($body) => {
      const linhas = $body.find('tbody tr:visible').toArray();

      const planosRestantes = linhas
        .map((linha) => limparTexto(Cypress.$(linha).text()))
        .filter((textoLinha) => {
          const naoEhLinhaVazia =
            !/nenhum|no hay|sin registros|no encontrado|nenhum plano|ningún plan/i.test(
              textoLinha
            );

          return naoEhLinhaVazia && regexPlanoE2E.test(textoLinha);
        });

      expect(planosRestantes, 'planos E2E restantes na grade').to.have.length(
        0
      );
    });
  }

  beforeEach(() => {
    cy.viewport(1366, 768);

    cy.login();

    fecharCookiesSeAparecer();

    abrirPlanos();
  });

  it('Deve apagar todos os planos criados pelos testes E2E.', () => {
    buscarPlanosE2E();

    apagarPlanosE2E();

    buscarPlanosE2E();

    validarNenhumPlanoE2E();
  });
});