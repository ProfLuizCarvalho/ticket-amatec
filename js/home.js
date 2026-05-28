// js/home.js - Versão Completa e Atualizada para as Novas Páginas

document.addEventListener('DOMContentLoaded', initializePage);

// Função para carregar conteúdo dinamicamente na área principal
const loadContent = (page, script = null, title = '') => {
    const mainContentArea = document.getElementById('mainContentArea');
    const pageTitleElement = document.getElementById('pageTitle');
    const topbarElement = document.querySelector('.topbar');

    // Limpa o conteúdo atual
    mainContentArea.innerHTML = '';

    // Remove qualquer script JS carregado anteriormente para evitar duplicação de event listeners
    const oldScript = document.getElementById('dynamicScript');
    if (oldScript) {
        oldScript.remove();
    }

    // Define o título da página e visibilidade da topbar
    if (pageTitleElement) {
        pageTitleElement.textContent = title;
    }
    if (topbarElement) {
        // Ocultar topbar para certas páginas se desejar um layout diferente
        if (['Gerenciar Usuários', 'Gerenciar Técnicos', 'Gerenciar Produtos', 'Gerenciar Clientes', 'Gerenciar Equipamentos', 'Abrir Ticket', 'Gerenciar Tickets', 'Meus Tickets', 'Painel de Tickets', 'Editar Ticket'].includes(title)) { // Adicionado 'Editar Ticket'
            topbarElement.style.display = 'none';
        } else {
            topbarElement.style.display = 'flex';
        }
    }

    // Carrega o HTML da página
    fetch(page)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            mainContentArea.innerHTML = html;

            // Carrega o script JS associado, se houver
            if (script) {
                const scriptElement = document.createElement('script');
                scriptElement.id = 'dynamicScript';
                scriptElement.src = script;
                scriptElement.onload = () => {
                    console.log(`Script ${script} carregado com sucesso.`);
                };
                scriptElement.onerror = () => {
                    console.error(`Erro ao carregar o script ${script}.`);
                };
                document.body.appendChild(scriptElement);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar o conteúdo da página:', error);
            mainContentArea.innerHTML = `<p>Erro ao carregar a página: ${title}.</p>`;
        });
};

function initializePage() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userProfile = localStorage.getItem('userProfile');
    const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
    const sidebarNavList = document.getElementById('sidebarNavList');

    if (!loggedInUser || !userProfile) {
        window.location.href = 'login.html';
        return;
    }

    if (loggedInUserDisplay) {
        loggedInUserDisplay.textContent = `${loggedInUser} (${userProfile})`;
    }

    // Limpa o menu existente
    sidebarNavList.innerHTML = '';

    // Função auxiliar para adicionar itens ao menu
    const addMenuItem = (text, targetPage, scriptToLoad = null, isDashboard = false, id = null) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = text;
        if (id) a.id = id;

        a.addEventListener('click', (event) => {
            event.preventDefault();
            if (id === 'logoutButton') {
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userProfile');
                window.location.href = 'login.html';
                return;
            }

            if (isDashboard) {
                // Lógica específica para a dashboard
                const mainContentArea = document.getElementById('mainContentArea');
                const pageTitleElement = document.getElementById('pageTitle');
                const topbarElement = document.querySelector('.topbar');

                if (pageTitleElement) pageTitleElement.textContent = text;
                if (topbarElement) topbarElement.style.display = 'flex'; // Garante que a topbar apareça na dashboard

                mainContentArea.innerHTML = ''; // Limpa o conteúdo atual
                mainContentArea.appendChild(createDashboardSummary());
                mainContentArea.appendChild(createRecentTickets());
                if (userProfile === 'technician') {
                    const techActions = document.createElement('div');
                    techActions.innerHTML = `
                        <h3>Ações do Técnico</h3>
                        <button class="btn" onclick="loadContent('open_ticket.html', 'js/open_ticket.js', 'Abrir Ticket')">Abrir Novo Ticket</button>
                        <button class="btn" onclick="loadContent('manage_tickets.html', 'js/manage_tickets.js', 'Gerenciar Tickets')">Ver Meus Tickets</button>
                        <button class="btn" onclick="loadContent('ticket_dashboard.html', 'js/ticket_dashboard.js', 'Painel de Tickets')">Ver Painel de Tickets</button>
                    `;
                    mainContentArea.appendChild(techActions);
                } else if (userProfile === 'admin') {
                    const adminActions = document.createElement('div');
                    adminActions.innerHTML = `
                        <h3>Ações do Administrador</h3>
                        <button class="btn" onclick="loadContent('open_ticket.html', 'js/open_ticket.js', 'Abrir Ticket')">Abrir Novo Ticket</button>
                        <button class="btn" onclick="loadContent('manage_tickets.html', 'js/manage_tickets.js', 'Gerenciar Tickets')">Gerenciar Todos os Tickets</button>
                        <button class="btn" onclick="loadContent('ticket_dashboard.html', 'js/ticket_dashboard.js', 'Painel de Tickets')">Ver Painel de Tickets</button>
                        <button class="btn" onclick="loadContent('register_user.html', 'js/register_user.js', 'Gerenciar Usuários')">Gerenciar Usuários</button>
                        <button class="btn" onclick="loadContent('register_technician.html', 'js/register_technician.js', 'Gerenciar Técnicos')">Gerenciar Técnicos</button>
                        <button class="btn" onclick="loadContent('register_client.html', 'js/register_client.js', 'Gerenciar Clientes')">Gerenciar Clientes</button>
                        <button class="btn" onclick="loadContent('register_product.html', 'js/register_product.js', 'Gerenciar Produtos')">Gerenciar Produtos</button>
                        <button class="btn" onclick="loadContent('register_equipment.html', 'js/register_equipment.js', 'Gerenciar Equipamentos')">Gerenciar Equipamentos</button>
                    `;
                    mainContentArea.appendChild(adminActions);
                }
            } else { // Carrega o conteúdo de outras páginas
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
            addMenuItem('Abrir Ticket', 'open_ticket.html', 'js/open_ticket.js'); // Cliente pode abrir ticket
            addMenuItem('Meus Tickets', 'manage_tickets.html', 'js/manage_tickets.js'); // Cliente vê seus tickets
            addMenuItem('Sair', '', null, false, 'logoutButton');
            break;

        case 'technician':
            dashboardLink = addMenuItem('Dashboard', 'dashboard', null, true);
            addMenuItem('Abrir Ticket', 'open_ticket.html', 'js/open_ticket.js');
            addMenuItem('Meus Tickets', 'manage_tickets.html', 'js/manage_tickets.js'); // Técnico vê seus tickets
            addMenuItem('Painel de Tickets', 'ticket_dashboard.html', 'js/ticket_dashboard.js');
            addMenuItem('Configurações', 'tech_settings.html', 'js/tech_settings.js');
            addMenuItem('Sair', '', null, false, 'logoutButton');
            break;

        case 'admin':
            dashboardLink = addMenuItem('Dashboard', 'dashboard', null, true);
            addMenuItem('Abrir Ticket', 'open_ticket.html', 'js/open_ticket.js');
            addMenuItem('Gerenciar Tickets', 'manage_tickets.html', 'js/manage_tickets.js'); // Admin gerencia todos os tickets
            addMenuItem('Painel de Tickets', 'ticket_dashboard.html', 'js/ticket_dashboard.js');
            addMenuItem('Gerenciar Usuários', 'register_user.html', 'js/register_user.js');
            addMenuItem('Gerenciar Técnicos', 'register_technician.html', 'js/register_technician.js');
            addMenuItem('Gerenciar Clientes', 'register_client.html', 'js/register_client.js');
            addMenuItem('Gerenciar Produtos', 'register_product.html', 'js/register_product.js');
            addMenuItem('Gerenciar Equipamentos', 'register_equipment.html', 'js/register_equipment.js');
            addMenuItem('Configurações', 'admin_settings.html', 'js/admin_settings.js');
            addMenuItem('Sair', '', null, false, 'logoutButton');
            break;

        default:
            window.location.href = 'login.html';
            break;
    }

    // Funções auxiliares para a dashboard (seção de resumo e tickets recentes)
    function createDashboardSummary() {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'dashboard-summary';
        summaryDiv.innerHTML = `
            <h3>Resumo da Dashboard</h3>
            <p>Bem-vindo, ${loggedInUser}! Seu perfil é: ${userProfile}.</p>
            <!-- Adicione mais informações de resumo aqui se desejar -->
        `;
        return summaryDiv;
    }

    function createRecentTickets() {
        const recentTicketsDiv = document.createElement('div');
        recentTicketsDiv.className = 'recent-tickets';
        recentTicketsDiv.innerHTML = `
            <h3>Tickets Recentes</h3>
            <p>Esta seção pode mostrar os últimos tickets abertos ou atualizados.</p>
            <!-- Tabela ou lista de tickets recentes pode ser adicionada aqui -->
        `;
        return recentTicketsDiv;
    }

    // Carrega o conteúdo inicial da dashboard (simula o clique no link da dashboard)
    if (dashboardLink) {
        dashboardLink.click();
    }
}