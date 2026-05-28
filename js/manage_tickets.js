// js/manage_tickets.js

document.addEventListener('DOMContentLoaded', () => {
    const ticketGridBody = document.getElementById('ticketGridBody');

    let allClients = {};
    let allEquipments = {};
    let allTechnicians = {};

    const loggedInUserProfile = localStorage.getItem('userProfile');
    const loggedInUser = localStorage.getItem('loggedInUser');

    // --- Funções de Carregamento de Dados ---
    const loadTickets = () => JSON.parse(localStorage.getItem('appTickets')) || {};
    const loadClients = () => JSON.parse(localStorage.getItem('appClients')) || {};
    const loadEquipments = () => JSON.parse(localStorage.getItem('appEquipments')) || {};
    const loadTechnicians = () => JSON.parse(localStorage.getItem('appTechnicians')) || {};

    // Função para carregar o conteúdo de uma página (copiada de home.js para uso interno)
    const loadContent = (page, script = null, title = '') => {
        const mainContentArea = document.getElementById('mainContentArea');
        const pageTitleElement = document.getElementById('pageTitle');
        const topbarElement = document.querySelector('.topbar');

        mainContentArea.innerHTML = '';

        const oldScript = document.getElementById('dynamicScript');
        if (oldScript) {
            oldScript.remove();
        }

        if (pageTitleElement) {
            pageTitleElement.textContent = title;
        }
        if (topbarElement) {
            if (['Gerenciar Usuários', 'Gerenciar Técnicos', 'Gerenciar Produtos', 'Gerenciar Clientes', 'Gerenciar Equipamentos', 'Abrir Ticket', 'Gerenciar Tickets', 'Meus Tickets', 'Painel de Tickets'].includes(title)) {
                topbarElement.style.display = 'none';
            } else {
                topbarElement.style.display = 'flex';
            }
        }

        fetch(page)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                mainContentArea.innerHTML = html;
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

    // Renderiza a grid de tickets
    const renderTicketGrid = () => {
        ticketGridBody.innerHTML = '';
        const tickets = loadTickets();
        const ticketArray = Object.values(tickets);

        allClients = loadClients();
        allEquipments = loadEquipments();
        allTechnicians = loadTechnicians();

        // Filtra tickets para o cliente logado, se for perfil 'user'
        let filteredTickets = ticketArray;
        if (loggedInUserProfile === 'user') {
            const client = Object.values(allClients).find(c => c.clientUser === loggedInUser);
            if (client) {
                filteredTickets = ticketArray.filter(ticket => ticket.clientId === client.id);
            } else {
                filteredTickets = []; // Se o usuário logado não for um cliente, não mostra tickets
            }
        } else if (loggedInUserProfile === 'technician') {
            // Se for técnico, filtra para mostrar apenas os tickets atribuídos a ele
            const technician = Object.values(allTechnicians).find(t => t.username === loggedInUser);
            if (technician) {
                filteredTickets = ticketArray.filter(ticket => ticket.technicianId === technician.id);
            } else {
                filteredTickets = [];
            }
        }
        // Admin vê todos os tickets

        filteredTickets.sort((a, b) => new Date(b.openingDate) - new Date(a.openingDate)); // Ordena por data de abertura

        if (filteredTickets.length === 0) {
            const row = ticketGridBody.insertRow();
            row.innerHTML = `<td colspan="8">Nenhum ticket encontrado.</td>`;
            return;
        }

        filteredTickets.forEach(ticket => {
            const row = ticketGridBody.insertRow();
            row.dataset.ticketId = ticket.id; // Adiciona o ID do ticket como data attribute
            const client = allClients[ticket.clientId];
            const equipment = allEquipments[ticket.equipmentId];
            const technician = allTechnicians[ticket.technicianId];

            row.innerHTML = `
                <td>${ticket.id}</td>
                <td>${ticket.openingDate}</td>
                <td>${client ? (client.clientName || client.tradeName) : 'N/A'}</td>
                <td>${equipment ? equipment.equipmentName : 'N/A'}</td>
                <td>${ticket.problemDescription.substring(0, 50)}...</td>
                <td>${technician ? technician.fullName : 'N/A'}</td>
                <td>${ticket.status}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-sm view-edit-ticket-btn" data-ticket-id="${ticket.id}">Ver/Editar</button>
                    <button type="button" class="btn btn-danger btn-sm delete-ticket-btn" data-ticket-id="${ticket.id}">Excluir</button>
                </td>
            `;
        });

        // Adiciona event listeners para os botões "Ver/Editar"
        ticketGridBody.querySelectorAll('.view-edit-ticket-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const ticketId = event.target.dataset.ticketId;
                // Salva o ID no localStorage para que open_ticket.js possa carregá-lo
                localStorage.setItem('ticketToEditId', ticketId);
                // Carrega a página de edição de ticket
                loadContent('open_ticket.html', 'js/open_ticket.js', 'Editar Ticket');
            });
        });

        // Adiciona event listeners para os botões "Excluir"
        ticketGridBody.querySelectorAll('.delete-ticket-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const ticketId = event.target.dataset.ticketId;
                if (confirm(`Tem certeza que deseja excluir o ticket "${ticketId}"?`)) {
                    let tickets = loadTickets();
                    delete tickets[ticketId];
                    localStorage.setItem('appTickets', JSON.stringify(tickets));
                    renderTicketGrid(); // Atualiza a grid após exclusão
                    alert(`Ticket "${ticketId}" excluído com sucesso!`);
                }
            });
        });
    };

    // --- Inicialização ---
    renderTicketGrid();
});