// js/home.js - Versão Completa e Atualizada (com Cadastros de Usuários, Técnicos, Produtos, Clientes e Equipamentos)

// Funções auxiliares para criar elementos HTML (para evitar repetição)
function createDashboardSummary() {
    const div = document.createElement('div');
    div.classList.add('dashboard-summary');
    div.innerHTML = `
        <div class="summary-card"><h3>Tickets Abertos</h3><p class="count">5</p></div>
        <div class="summary-card"><h3>Tickets em Andamento</h3><p class="count">12</p></div>
        <div class="summary-card"><h3>Tickets Concluídos (Hoje)</h3><p class="count">3</p></div>
    `;
    return div;
}

function createRecentTickets() {
    const section = document.createElement('section');
    section.classList.add('recent-tickets');
    section.innerHTML = `
        <h2>Tickets Recentes</h2>
        <ul>
            <li>#001 - Problema com acesso à rede - <span class="status pending">Pendente</span></li>
            <li>#002 - Solicitação de instalação de software - <span class="status in-progress">Em Andamento</span></li>
            <li>#003 - Lentidão no sistema - <span class="status resolved">Resolvido</span></li>
        </ul>
    `;
    return section;
}

// Função para carregar conteúdo HTML e JavaScript dinamicamente
async function loadContent(pageUrl, scriptUrl = null, pageTitleText = '') {
    const mainContentArea = document.getElementById('mainContentArea');
    const pageTitleElement = document.getElementById('pageTitle');
    const topbarElement = document.querySelector('.topbar');

    mainContentArea.innerHTML = ''; // Limpa o conteúdo atual

    // Lógica para esconder/mostrar a topbar e o título
    // Esconde se for 'Dashboard', 'Gerenciar Usuários', 'Gerenciar Técnicos', 'Gerenciar Produtos', 'Gerenciar Clientes' ou 'Gerenciar Equipamentos'
    if (pageTitleText === 'Dashboard' || pageTitleText === 'Gerenciar Usuários' || pageTitleText === 'Gerenciar Técnicos' || pageTitleText === 'Gerenciar Produtos' || pageTitleText === 'Gerenciar Clientes' || pageTitleText === 'Gerenciar Equipamentos') {
        if (topbarElement) topbarElement.style.display = 'none';
    } else { // Para outras páginas, mostra a topbar e define o título
        if (topbarElement) topbarElement.style.display = 'flex';
        if (pageTitleElement) pageTitleElement.textContent = pageTitleText;
    }

    // Carrega o HTML
    try {
        const response = await fetch(pageUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        mainContentArea.innerHTML = html;

        // Carrega o JavaScript associado, se houver
        if (scriptUrl) {
            // Remove scripts anteriores para evitar duplicação e erros
            const oldScript = document.getElementById('dynamicScript');
            if (oldScript) oldScript.remove();

            const script = document.createElement('script');
            script.src = scriptUrl;
            script.id = 'dynamicScript'; // Adiciona um ID para fácil remoção
            script.onload = () => {
                console.log(`Script ${scriptUrl} carregado com sucesso.`);
            };
            script.onerror = () => console.error(`Erro ao carregar script: ${scriptUrl}`);
            document.body.appendChild(script);
        }
    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        mainContentArea.innerHTML = `<p class="error-message">Erro ao carregar a página.</p>`;
    }
}


// Função principal para construir o menu lateral e o conteúdo da HOME
function initializePage() {
    const userProfile = localStorage.getItem('userProfile');
    const loggedInUser = localStorage.getItem('loggedInUser');

    // Se não houver perfil ou usuário logado, redireciona para o login (segurança básica)
    if (!userProfile || !loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    // Atualiza o nome do usuário no rodapé do sidebar
    const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
    if (loggedInUserDisplay) {
        loggedInUserDisplay.textContent = loggedInUser;
    }

    const sidebarNavList = document.getElementById('sidebarNavList');
    const mainContentArea = document.getElementById('mainContentArea');
    const pageTitleElement = document.getElementById('pageTitle'); // Pega o elemento do título
    const topbarElement = document.querySelector('.topbar'); // Pega o elemento da topbar

    // Limpa apenas a navegação para reconstruir conforme o perfil
    sidebarNavList.innerHTML = '';

    // Função para adicionar um item de menu
    const addMenuItem = (text, targetPage, scriptToLoad = null, isActive = false, id = '') => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#'; // Todos os links agora são '#' para evitar recarregar a página
        a.textContent = text;
        if (isActive) a.classList.add('active');
        if (id) a.id = id;

        a.addEventListener('click', (event) => {
            event.preventDefault();
            // Remove a classe 'active' de todos os itens e adiciona ao clicado
            document.querySelectorAll('.sidebar-nav a').forEach(item => item.classList.remove('active'));
            a.classList.add('active');

            if (id === 'logoutButton') {
                const confirmLogout = confirm('Tem certeza que deseja sair?');
                if (confirmLogout) {
                    localStorage.removeItem('userProfile');
                    localStorage.removeItem('loggedInUser');
                    alert('Você foi desconectado.');
                    window.location.href = 'login.html';
                }
            } else if (targetPage === 'dashboard') { // Conteúdo da dashboard da home
                mainContentArea.innerHTML = ''; // Limpa antes de adicionar

                // Esconde a topbar para a dashboard
                if (topbarElement) topbarElement.style.display = 'none';

                if (userProfile === 'user') {
                    mainContentArea.innerHTML = `
                        <h2>Meus Tickets</h2>
                        <p>Aqui você pode ver o histórico dos seus tickets e o status atual.</p>
                        <ul>
                            <li>#004 - Problema com impressora - <span class="status pending">Pendente</span></li>
                            <li>#005 - Solicitação de acesso VPN - <span class="status in-progress">Em Andamento</span></li>
                        </ul>
                        <button onclick="alert('Abrir formulário de novo ticket')">Abrir Novo Ticket</button>
                    `;
                } else { // Technician e Admin
                    mainContentArea.innerHTML = `
                        <h2>Dashboard do ${userProfile === 'technician' ? 'Técnico' : 'Administrador'}</h2>
                        <p>Visão geral dos tickets e ações rápidas.</p>
                    `;
                    mainContentArea.appendChild(createDashboardSummary());
                    mainContentArea.appendChild(createRecentTickets());
                    if (userProfile === 'technician') {
                        const techActions = document.createElement('div');
                        techActions.innerHTML = `
                            <h3>Ações do Técnico</h3>
                            <button onclick="alert('Ver todos os tickets')">Gerenciar Tickets</button>
                            <button onclick="alert('Atualizar status')">Atualizar Status</button>
                        `;
                        mainContentArea.appendChild(techActions);
                    } else if (userProfile === 'admin') {
                        const adminActions = document.createElement('div');
                        adminActions.innerHTML = `
                            <h3>Ações do Administrador</h3>
                            <button onclick="alert('Gerenciar Usuários')">Gerenciar Usuários</button>
                            <button onclick="alert('Gerenciar Técnicos')">Gerenciar Técnicos</button>
                            <button onclick="alert('Gerenciar Clientes')">Gerenciar Clientes</button>
                            <button onclick="alert('Gerenciar Produtos')">Gerenciar Produtos</button>
                            <button onclick="alert('Gerenciar Equipamentos')">Gerenciar Equipamentos</button>
                        `;
                        mainContentArea.appendChild(adminActions);
                    }
                }
            } else { // Carrega o conteúdo de outras páginas
                // Mostra a topbar e define o título para outras páginas, a menos que seja uma das páginas sem título
                if (topbarElement) {
                    if (text === 'Gerenciar Usuários' || text === 'Gerenciar Técnicos' || text === 'Gerenciar Produtos' || text === 'Gerenciar Clientes' || text === 'Gerenciar Equipamentos') {
                        topbarElement.style.display = 'none';
                    } else {
                        topbarElement.style.display = 'flex';
                    }
                }
                loadContent(targetPage, scriptToLoad, text); // Passa o texto do menu como título da página
            }
        });
        li.appendChild(a);
        sidebarNavList.appendChild(li);
        return a; // Retorna o link para poder simular o clique
    };

    let dashboardLink; // Variável para guardar o link da dashboard

    switch (userProfile) {
        case 'user':
            dashboardLink = addMenuItem('Dashboard', 'dashboard', null, true);
            addMenuItem('Meus Tickets', 'user_tickets.html', 'js/user_tickets.js'); // Exemplo futuro
            addMenuItem('Abrir Ticket', 'open_ticket.html', 'js/open_ticket.js'); // Exemplo futuro
            addMenuItem('Sair', '', null, false, 'logoutButton');
            break;

        case 'technician':
            dashboardLink = addMenuItem('Dashboard', 'dashboard', null, true);
            addMenuItem('Todos os Tickets', 'all_tickets.html', 'js/all_tickets.js'); // Exemplo futuro
            addMenuItem('Abrir Ticket', 'open_ticket.html', 'js/open_ticket.js');
            addMenuItem('Configurações', 'tech_settings.html', 'js/tech_settings.js');
            addMenuItem('Sair', '', null, false, 'logoutButton');
            break;

        case 'admin':
            dashboardLink = addMenuItem('Dashboard', 'dashboard', null, true);
            addMenuItem('Todos os Tickets', 'all_tickets.html', 'js/all_tickets.js');
            addMenuItem('Abrir Ticket', 'open_ticket.html', 'js/open_ticket.js');
            addMenuItem('Gerenciar Usuários', 'register_user.html', 'js/register_user.js');
            addMenuItem('Gerenciar Técnicos', 'register_technician.html', 'js/register_technician.js');
            addMenuItem('Gerenciar Clientes', 'register_client.html', 'js/register_client.js');
            addMenuItem('Gerenciar Produtos', 'register_product.html', 'js/register_product.js');
            addMenuItem('Gerenciar Equipamentos', 'register_equipment.html', 'js/register_equipment.js'); // NOVO ITEM
            addMenuItem('Configurações', 'admin_settings.html', 'js/admin_settings.js');
            addMenuItem('Sair', '', null, false, 'logoutButton');
            break;

        default:
            window.location.href = 'login.html';
            break;
    }

    // Carrega o conteúdo inicial da dashboard (simula o clique no link da dashboard)
    if (dashboardLink) {
        dashboardLink.click();
    }
}

// Inicializa a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializePage);