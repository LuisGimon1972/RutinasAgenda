describe('Limpeza - Atendentes criados pelos testes E2E', () => {
  /*
    Só apaga atendentes cujo NOME começa com E2E.

    Exemplos apagados:
    - E2E Atendente 1779999999999
    - E2E Profissional Teste
    - E2E Usuario Teste

    Não apaga se E2E aparecer apenas no e-mail ou outro campo.
  */
  const regexAtendenteE2E = /^E2E\b/i;

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

  function abrirAtendentes() {
    cy.contains(/Atendentes|Profissionais|Profesionales/i, { timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });

    cy.get('body', { timeout: 30000 })
      .invoke('text')
      .should(
        'match',
        /Atendentes|Profissionais|Profesionales|Listagem de atendentes|Listado de profesionales|Cadastrar atendente/i
      );

    cy.wait(1500);
  }

  function buscarAtendentesE2E() {
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

  function obterPrimeiraLinhaAtendenteE2E($body: JQuery<HTMLElement>) {
    const linhas = $body.find('tbody tr:visible').toArray();

    const linhaAtendenteE2E = linhas.find((linha) => {
      const $linha = Cypress.$(linha);
      const colunas = $linha.find('td').toArray();

      if (colunas.length === 0) {
        return false;
      }

      const nomeAtendente = limparTexto(Cypress.$(colunas[0]).text());
      const textoLinha = limparTexto($linha.text());

      const naoEhLinhaVazia =
        !/nenhum|no hay|sin registros|no encontrado|nenhum atendente|nenhum profissional/i.test(
          textoLinha
        );

      return naoEhLinhaVazia && regexAtendenteE2E.test(nomeAtendente);
    });

    return linhaAtendenteE2E || null;
  }

 function clicarExcluirNaLinha(linha: HTMLElement) {
  const $linha = Cypress.$(linha);

  // 1️⃣ abrir menu (3 pontos)
  const botaoMenu = $linha
    .find('button:visible, [role="button"]:visible, .q-btn:visible')
    .toArray()
    .find((el) => {
      const html = (el.outerHTML || '').toLowerCase();

      return (
        html.includes('more_vert') ||
        html.includes('more_horiz') ||
        html.includes('ellipsis') ||
        html.includes('three')
      );
    });

  if (!botaoMenu) {
    cy.screenshot('menu-3-pontos-nao-encontrado');
    throw new Error('Botão de menu (3 pontos) não encontrado.');
  }

  cy.wrap(botaoMenu)
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });

  // 2️⃣ esperar menu aparecer (SEM wait)
  cy.get('body').should(($body) => {
    const existeMenu = $body.find(
      '[role="menu"]:visible, .q-menu:visible, .q-list:visible'
    ).length > 0;

    expect(existeMenu, 'menu aberto na tela').to.eq(true);
  });

  // 3️⃣ clicar em excluir (mais inteligente)
  cy.get('body')
    .find('button:visible, [role="menuitem"]:visible, .q-item:visible')
    .filter((i, el) => {
      const texto = (Cypress.$(el).text() || '').toLowerCase();
      const html = (el.outerHTML || '').toLowerCase();

      return (
        texto.includes('excluir') ||
        texto.includes('eliminar') ||
        texto.includes('apagar') ||
        texto.includes('delete') ||
        texto.includes('remover') ||
        html.includes('delete') // fallback 🔥
      );
    })
    .first()
    .should('be.visible')
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

  function apagarAtendentesE2E(tentativa = 1) {
    if (tentativa > 100) {
      throw new Error(
        'Limite de 100 tentativas atingido ao apagar atendentes E2E.'
      );
    }

    cy.get('body', { timeout: 30000 }).then(($body) => {
      const linhaAtendenteE2E = obterPrimeiraLinhaAtendenteE2E($body);

      if (!linhaAtendenteE2E) {
        cy.log('Nenhum atendente E2E encontrado. Limpeza finalizada sem erro.');
        return;
      }

      const textoAtendente = limparTexto(Cypress.$(linhaAtendenteE2E).text());

      cy.log(`Apagando atendente E2E ${tentativa}: ${textoAtendente}`);

      clicarExcluirNaLinha(linhaAtendenteE2E);

      confirmarExclusaoSeAparecer();

      buscarAtendentesE2E();

      apagarAtendentesE2E(tentativa + 1);
    });
  }

  function validarNenhumAtendenteE2E() {
    buscarAtendentesE2E();

    cy.get('body').then(($body) => {
      const nomesAtendentes = $body
        .find('tbody tr:visible')
        .toArray()
        .map((linha) => {
          const primeiraColuna = Cypress.$(linha).find('td').first();

          return limparTexto(primeiraColuna.text());
        });

      nomesAtendentes.forEach((nome) => {
        expect(nome).not.to.match(regexAtendenteE2E);
      });
    });
  }

  beforeEach(() => {
    cy.viewport(1366, 768);

    cy.login();

    fecharCookiesSeAparecer();

    abrirAtendentes();
  });

  it('Deve apagar todos os atendentes criados pelos testes E2E.', () => {
    buscarAtendentesE2E();

    apagarAtendentesE2E();

    validarNenhumAtendenteE2E();
  });
});