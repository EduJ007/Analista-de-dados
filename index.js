document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const vitrineContainer = document.getElementById('linksProdutosVitrine');
    const dadosProdutosContainer = document.getElementById('dadosProdutos');
    const produtosRaw = dadosProdutosContainer.querySelectorAll('.produto');
    
    const adicionarBtn = document.getElementById('adicionarProduto');
    const enviarBtn = document.getElementById('enviarColeta');
    const form = document.getElementById('coletaForm');
    
    const contadorColetados = document.getElementById('contadorColetados');
    const tituloColeta = document.getElementById('tituloColeta');
    const emailAnalistaInput = document.getElementById('email_analista');

    // Variáveis de estado
    let produtosParaColeta = []; // Lista para armazenar os produtos coletados ou marcados como 'NAO_ENCONTRADO'
    let produtoAtualId = null;   // ID do produto que está sendo coletado

    // Array de todos os produtos para fácil lookup
    const listaProdutosMapeada = Array.from(produtosRaw).map(div => {
        const h3 = div.querySelector('h3');
        const img = div.querySelector('img');
        const link = div.querySelector('a');

        // Cria um ID único para cada produto (usando o link como identificador)
        const id = link ? link.href : Math.random().toString(36).substring(7);

        return {
            id: id,
            nome: h3 ? h3.textContent.trim() : 'Produto Sem Nome',
            link: link ? link.href : '#',
            imagem: img ? img.src : '',
            div: div 
        };
    });

    // 1. GERA A VITRINE VISUAL
    function renderizarVitrine() {
        vitrineContainer.innerHTML = '';
        if (listaProdutosMapeada.length === 0) {
            vitrineContainer.innerHTML = '<p style="color: red; padding: 20px;">❌ Nenhum produto encontrado na lista de dados ocultos.</p>';
            return;
        }

        listaProdutosMapeada.forEach((produto) => {
            const card = document.createElement('div');
            card.className = 'produto-card';
            card.setAttribute('data-id', produto.id);

            // Verifica status de coleta
            const coletaExistente = produtosParaColeta.find(p => p.id === produto.id);
            const jaColetado = coletaExistente && coletaExistente.status === 'COLETADO';
            const naoExiste = coletaExistente && coletaExistente.status === 'NAO_ENCONTRADO';
            
            if (jaColetado) {
                card.classList.add('coletado');
            } else if (naoExiste) {
                card.classList.add('nao-encontrado');
            }
            if (produtoAtualId === produto.id) {
                card.classList.add('selecionado');
            }

            // Imagem e Nome
            const img = document.createElement('img');
            img.src = produto.imagem || 'placeholder.png';
            img.alt = produto.nome;
            
            const h4Nome = document.createElement('h4');
            h4Nome.textContent = produto.nome;
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'card-buttons-group';

            // --- BOTÃO 1: ABRIR E COLETAR ---
            const aLink = document.createElement('a');
            aLink.href = produto.link;
            aLink.textContent = jaColetado ? '✅ COLETADO' : 'Abrir Produto';
            aLink.target = '_blank';
            aLink.rel = 'noopener noreferrer';
            aLink.className = 'card-button-coleta';
            
            aLink.addEventListener('click', (e) => {
                e.preventDefault(); 
                window.open(produto.link, '_blank'); 
                marcarProdutoParaColeta(produto.id);
            });
            
            // --- BOTÃO 2: NÃO EXISTE MAIS ---
            const btnNaoExiste = document.createElement('button');
            btnNaoExiste.type = 'button'; 
            btnNaoExiste.textContent = naoExiste ? '❌ REGISTRADO' : 'Não Existe Mais';
            btnNaoExiste.className = 'card-button-nao-existe';
            
            btnNaoExiste.addEventListener('click', () => {
                registrarNaoEncontrado(produto.id);
            });

            card.appendChild(img);
            card.appendChild(h4Nome);
            buttonContainer.appendChild(aLink);
            buttonContainer.appendChild(btnNaoExiste);
            card.appendChild(buttonContainer);
            
            vitrineContainer.appendChild(card);
        });
    }

    // 2. LÓGICA DE MARCAR O PRODUTO PARA COLETA
    function marcarProdutoParaColeta(produtoId) {
        const produto = listaProdutosMapeada.find(p => p.id === produtoId);
        if (!produto) return;

        // Limpa o estado visual anterior de seleção
        document.querySelectorAll('.produto-card').forEach(card => {
            card.classList.remove('selecionado');
        });
        
        // Atualiza a variável de estado e o estilo
        produtoAtualId = produtoId; 
        document.querySelector(`.produto-card[data-id="${produtoId}"]`).classList.add('selecionado');

        // Atualiza o título do formulário
        tituloColeta.textContent = `Coleta de Dados Atuais: ${produto.nome.substring(0, 60)}...`;
        
        // Preenche o nome automaticamente e limpa os outros campos
        document.getElementById('nome_produto').value = produto.nome;
        document.getElementById('preco_final').value = '';
        document.getElementById('nota_produto').value = '';
        document.getElementById('avaliacoes').value = '';
        
        // Ativa o botão de adicionar
        adicionarBtn.disabled = false;
        adicionarBtn.style.backgroundColor = '#28a745';
    }

    // 3. LÓGICA DE REGISTRAR PRODUTO NÃO ENCONTRADO
    function registrarNaoEncontrado(produtoId) {
        const produto = listaProdutosMapeada.find(p => p.id === produtoId);
        if (!produto) return;

        // 1. Remove um registro existente (permite re-marcação)
        produtosParaColeta = produtosParaColeta.filter(p => p.id !== produtoId);

        // 2. Cria o registro de "Não Encontrado"
        const registroNaoEncontrado = {
            id: produtoId,
            email: emailAnalistaInput.value,
            nomeOriginal: produto.nome,
            linkOriginal: produto.link,
            status: 'NAO_ENCONTRADO',
            mensagem: 'Produto não encontrado, link quebrado ou indisponível.',
            timestamp: new Date().toLocaleString('pt-BR')
        };
        
        produtosParaColeta.push(registroNaoEncontrado);

        // 3. Atualiza a visualização
        atualizarContadorEBotoes();
        renderizarVitrine();
        
        alert(`❌ Produto "${produto.nome.substring(0, 30)}..." registrado como NÃO ENCONTRADO e adicionado ao relatório.`);

        // 4. Limpa o formulário se for o item atual
        if (produtoAtualId === produtoId) {
            limparFormularioColeta();
        }
    }

    // 4. LÓGICA DE ADICIONAR PRODUTO À LISTA
    adicionarBtn.addEventListener('click', () => {
        if (!produtoAtualId) {
            alert('Por favor, primeiro clique em "Abrir Produto" na vitrine para selecionar o item a ser coletado.');
            return;
        }

        // Validação básica do formulário
        if (!form.reportValidity()) {
            return;
        }
        
        // Remove um produto existente antes de adicionar o atualizado (permite re-coleta)
        produtosParaColeta = produtosParaColeta.filter(p => p.id !== produtoAtualId);

        // Captura os dados do formulário
        const produtoOriginal = listaProdutosMapeada.find(p => p.id === produtoAtualId);
        const novoProdutoColetado = {
            id: produtoAtualId,
            email: emailAnalistaInput.value,
            nomeOriginal: produtoOriginal.nome,
            nomeColetado: document.getElementById('nome_produto').value,
            preco: document.getElementById('preco_final').value,
            nota: document.getElementById('nota_produto').value,
            avaliacoes: document.getElementById('avaliacoes').value,
            status: 'COLETADO',
            linkOriginal: produtoOriginal ? produtoOriginal.link : 'N/A',
            timestamp: new Date().toLocaleString('pt-BR')
        };

        produtosParaColeta.push(novoProdutoColetado);

        // Atualiza a visualização
        atualizarContadorEBotoes();
        renderizarVitrine();
        limparFormularioColeta();

        alert(`Produto (${produtosParaColeta.length}) adicionado à lista de coleta!`);
    });

    // 5. FUNÇÃO DE LIMPAR FORMULÁRIO APÓS ADIÇÃO
    function limparFormularioColeta() {
        tituloColeta.textContent = 'Coleta de Dados Atuais: N/A';
        produtoAtualId = null;
        document.getElementById('nome_produto').value = '';
        document.getElementById('preco_final').value = '';
        document.getElementById('nota_produto').value = '';
        document.getElementById('avaliacoes').value = '';
        
        document.querySelectorAll('.produto-card').forEach(card => {
            card.classList.remove('selecionado');
        });

        adicionarBtn.disabled = true;
        adicionarBtn.style.backgroundColor = '#cccccc';
    }

    // 6. FUNÇÃO DE ATUALIZAR CONTADOR E BOTÕES
    function atualizarContadorEBotoes() {
        const count = produtosParaColeta.length;
        contadorColetados.textContent = `Produtos Prontos para Envio: ${count}`;
        
        enviarBtn.textContent = `🚀 Finalizar Coleta e Enviar (${count} Produtos)`;
        document.getElementById('_subject').value = `Nova Coleta de Dados de Produto Realizada (${count} Itens)`;

        // Ativa o botão de envio se houver pelo menos 1 produto
        enviarBtn.disabled = count === 0;
    }

    // 7. LÓGICA FINAL DE ENVIO (Pré-processamento antes do FormSubmit)
    form.addEventListener('submit', (e) => {
        if (produtosParaColeta.length === 0) {
            e.preventDefault();
            alert('Não há produtos na lista de coleta para enviar. Adicione pelo menos um produto antes de finalizar.');
            return;
        }

        // Prepara o campo JSON completo para o FormSubmit
        const jsonOutput = JSON.stringify(produtosParaColeta, null, 2);
        document.getElementById('dadosCompletosJson').value = jsonOutput;
        
        // Prepara uma lista simples de nomes/status para o corpo do email 
        const linksLista = produtosParaColeta.map(p => {
            const status = p.status === 'NAO_ENCONTRADO' ? '❌ NÃO EXISTE' : '✅ COLETADO';
            return `- ${status}: ${p.nomeOriginal || p.nomeColetado} (ID: ${p.id.substring(0, 30)}...)`;
        }).join('\n');
        document.getElementById('produtosColetadosNames').value = "Lista de Produtos Coletados:\n" + linksLista;

        // O formulário prossegue com o envio normal para o FormSubmit
    });

    // 8. LÓGICA DE ALERTA E RECARREGAMENTO APÓS O ENVIO (FormSubmit)
    function checarSucessoERecarregar() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            alert('✅ Relatório de Coleta enviado com sucesso! A página será recarregada para iniciar um novo relatório.');
            
            // Remove o parâmetro 'success' da URL e recarrega
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload();
        }
    }

    // Inicialização
    renderizarVitrine();
    atualizarContadorEBotoes();
    checarSucessoERecarregar();
    limparFormularioColeta();
});