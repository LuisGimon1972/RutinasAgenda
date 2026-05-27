describe('Limpeza - Clientes criados pelos testes E2E', () => {
  /*
    Só apaga clientes cujo NOME começa com:
    - E2E
    - Cliente Painel

    Exemplos apagados:
    - E2E Cliente 1778013543989
    - E2E Teste Cliente
    - Cliente Painel 1779999999999

    Não apaga se E2E aparecer apenas em e-mail, telefone ou outro campo.
  */
  const regexClienteTeste = /^(E2E|Cliente Painel)\b/i;

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

  function abrirClientes() {
    cy.contains(/Clientes/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Clientes|Listagem de clientes|Listado de clientes|Cadastrar cliente|Registrar cliente/i
      );

    cy.wait(1500);
  }

  function buscarClientesTeste(termo: string) {
    cy.get('body').then(($body) => {
      const inputs = $body.find('input:visible');

      if (inputs.length === 0) {
        cy.log('Campo de busca não encontrado. Continuando com a grade atual.');
        return;
      }

      cy.wrap(inputs.first())
        .click({ force: true })
        .type(`{selectall}{backspace}${termo}`, { force: true });

      cy.wait(1500);
    });
  }

  function obterPrimeiraLinhaClienteTeste($body: JQuery<HTMLElement>) {
    const linhas = $body.find('tbody tr:visible').toArray();

    const linhaClienteTeste = linhas.find((linha) => {
      const $linha = Cypress.$(linha);
      const colunas = $linha.find('td').toArray();

      if (colunas.length === 0) {
        return false;
      }

      const nomeCliente = limparTexto(Cypress.$(colunas[0]).text());
      const textoLinha = limparTexto($linha.text());

      const naoEhLinhaVazia =
        !/nenhum|no hay|sin registros|no encontrado|nenhum cliente/i.test(
          textoLinha
        );

      return naoEhLinhaVazia && regexClienteTeste.test(nomeCliente);
    });

    return linhaClienteTeste || null;
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

      const naoEhWhatsapp =
        !/whatsapp|wa\.me/i.test(conteudo);

      return pareceExcluir && naoEhEditar && naoEhWhatsapp;
    });

    if (!botaoExcluir) {
      cy.screenshot('botao-excluir-cliente-e2e-nao-encontrado');

      throw new Error('Botão de excluir cliente E2E não encontrado na linha.');
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
        cy.log('Modal de confirmação não apareceu ou exclusão não exige confirmação.');
      }
    });

    cy.wait(1500);
  }

  function apagarClientesTeste(termoBusca: string, tentativa = 1) {
    if (tentativa > 100) {
      throw new Error(
        `Limite de 100 tentativas atingido ao apagar clientes com termo: ${termoBusca}.`
      );
    }

    cy.get('body', { timeout: 30000 }).then(($body) => {
      const linhaClienteTeste = obterPrimeiraLinhaClienteTeste($body);

      if (!linhaClienteTeste) {
        cy.log(`Nenhum cliente teste encontrado para o termo: ${termoBusca}.`);
        return;
      }

      const textoCliente = limparTexto(Cypress.$(linhaClienteTeste).text());

      cy.log(`Apagando cliente teste ${tentativa}: ${textoCliente}`);

      clicarExcluirNaLinha(linhaClienteTeste);

      confirmarExclusaoSeAparecer();

      buscarClientesTeste(termoBusca);

      apagarClientesTeste(termoBusca, tentativa + 1);
    });
  }

  function validarNenhumClienteTesteNaBusca(termoBusca: string) {
    buscarClientesTeste(termoBusca);

    cy.get('body').then(($body) => {
      const nomesClientes = $body
        .find('tbody tr:visible')
        .toArray()
        .map((linha) => {
          const primeiraColuna = Cypress.$(linha).find('td').first();

          return limparTexto(primeiraColuna.text());
        });

      nomesClientes.forEach((nome) => {
        expect(nome).not.to.match(regexClienteTeste);
      });
    });
  }

  beforeEach(() => {
    cy.viewport(1366, 768);

    cy.login();

    fecharCookiesSeAparecer();

    abrirClientes();
  });

  it('Deve apagar todos os clientes criados pelos testes E2E.', () => {
    buscarClientesTeste('E2E');

    apagarClientesTeste('E2E');

    buscarClientesTeste('Cliente Painel');

    apagarClientesTeste('Cliente Painel');

    validarNenhumClienteTesteNaBusca('E2E');

    validarNenhumClienteTesteNaBusca('Cliente Painel');
  });
});