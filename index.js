document.addEventListener('DOMContentLoaded', () => {
    const dadosProdutosContainer = document.getElementById('dadosProdutos');
    const vitrineContainer = document.getElementById('linksProdutosVitrine');
    const produtosRaw = dadosProdutosContainer.querySelectorAll('.produto');
    
    // Limpa a mensagem de carregamento
    vitrineContainer.innerHTML = ''; 

    // 1. GERA A VITRINE DE LINKS
    if (produtosRaw.length > 0) {
        produtosRaw.forEach((produtoDiv) => {
            // Tenta encontrar o nome e o link
            const nomeElement = produtoDiv.querySelector('h3');
            const linkElement = produtoDiv.querySelector('a');

            if (nomeElement && linkElement) {
                const nome = nomeElement.textContent.trim();
                const link = linkElement.getAttribute('href');

                // Cria o card de visualização
                const card = document.createElement('div');
                card.className = 'produto-card';

                // Nome do Produto
                const pNome = document.createElement('p');
                pNome.textContent = nome;

                // Link para Abrir
                const aLink = document.createElement('a');
                aLink.href = link;
                aLink.textContent = 'Abrir Produto';
                aLink.target = '_blank'; // Abre em nova aba
                aLink.rel = 'noopener noreferrer';

                card.appendChild(pNome);
                card.appendChild(aLink);
                vitrineContainer.appendChild(card);
            }
        });
    } else {
        vitrineContainer.innerHTML = '<p style="color: red;">Nenhum produto encontrado na lista de dados ocultos.</p>';
    }
    
    // 2. LÓGICA DE LIMPEZA DO FORMULÁRIO (Melhoria de usabilidade)
    const coletaForm = document.getElementById('coletaForm');
    
    // Após o envio (que é tratado pelo FormSubmit), o ideal é que o analista 
    // recarregue a página, ou que os campos sejam limpos. Como o FormSubmit
    // geralmente redireciona, essa lógica é mais para o caso de envio AJAX.
    // Para simplificar, vou deixar um alert de sucesso.
    
    coletaForm.addEventListener('submit', function() {
        // Você pode adicionar validações aqui se necessário
        
        // Timeout para que o FormSubmit possa processar antes do alerta
        setTimeout(() => {
            alert('Dados enviados com sucesso! Por favor, colete o próximo produto.');
            // Opcional: Limpar campos para o próximo produto
            // coletaForm.reset(); 
            
            // Mas o FormSubmit fará a submissão via POST normalmente.
        }, 100); 
    });
});