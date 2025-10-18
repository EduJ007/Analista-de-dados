document.addEventListener('DOMContentLoaded', () => {
    const dadosProdutosContainer = document.getElementById('dadosProdutos');
    const vitrineContainer = document.getElementById('linksProdutosVitrine');
    // Busca todos os divs de produto na lista oculta
    const produtosRaw = dadosProdutosContainer.querySelectorAll('.produto');
    
    // Limpa a mensagem de carregamento
    vitrineContainer.innerHTML = ''; 

    // 1. GERA A VITRINE VISUAL
    if (produtosRaw.length > 0) {
        produtosRaw.forEach((produtoDiv) => {
            // Tenta encontrar os elementos necessários
            const nomeElement = produtoDiv.querySelector('h3');
            const linkElement = produtoDiv.querySelector('a');
            const imagemElement = produtoDiv.querySelector('img');

            if (nomeElement && linkElement && imagemElement) {
                const nome = nomeElement.textContent.trim();
                const link = linkElement.getAttribute('href');
                const imagemSrc = imagemElement.getAttribute('src');
                const imagemAlt = imagemElement.getAttribute('alt');

                // Cria o card de visualização
                const card = document.createElement('div');
                card.className = 'produto-card';

                // Imagem do Produto
                const img = document.createElement('img');
                img.src = imagemSrc;
                img.alt = imagemAlt || nome;

                // Nome do Produto
                const h4Nome = document.createElement('h4');
                h4Nome.textContent = nome;

                // Link para Abrir
                const aLink = document.createElement('a');
                aLink.href = link;
                aLink.textContent = 'Abrir Produto';
                aLink.target = '_blank'; // Abre em nova aba
                aLink.rel = 'noopener noreferrer';

                card.appendChild(img);
                card.appendChild(h4Nome);
                card.appendChild(aLink);
                vitrineContainer.appendChild(card);
            }
        });
    } else {
        vitrineContainer.innerHTML = '<p style="color: red; padding: 20px;">❌ Nenhum produto encontrado na lista de dados ocultos. Verifique a estrutura HTML na div #dadosProdutos.</p>';
    }
    
    // 2. FUNÇÃO PARA TRATAR O SUCESSO DO ENVIO (Alerta + Recarregamento)
    function checarSucessoERecarregar() {
        // Cria um objeto URLSearchParams para ler os parâmetros da URL
        const params = new URLSearchParams(window.location.search);

        // Verifica se o parâmetro 'success=true' existe na URL (enviado pelo FormSubmit)
        if (params.get('success') === 'true') {
            // 1. Exibe o alerta de sucesso (o 'Ok' que o usuário pediu)
            alert('✅ Dados coletados e enviados com sucesso! A página será recarregada para o próximo produto.');
            
            // 2. Remove o parâmetro 'success' da URL antes de recarregar
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // 3. Recarrega a página para limpar o formulário para o próximo envio
            window.location.reload();
        }
    }
    
    // Chama a função para checar ao carregar a página
    checarSucessoERecarregar();
});