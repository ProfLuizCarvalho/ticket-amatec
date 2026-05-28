// js/ticket_dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const ticketDashboardGridBody = document.getElementById('ticketDashboardGridBody');
    const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    // Elementos do resumo
    const pendingTicketsCount = document.getElementById('pendingTicketsCount');
    const inProgressTicketsCount = document.getElementById('inProgressTicketsCount');
    const awaitingApprovalTicketsCount = document.getElementById('awaitingApprovalTicketsCount');
    const finishedTodayTicketsCount = document.getElementById('finishedTodayTicketsCount');

    // Elementos dos filtros
    const filterStatus = document.getElementById('filterStatus');
    const filterTechnician = document.getElementById('filterTechnician');
    const filterClient = document.getElementById('filterClient');
    const filterEquipment = document.getElementById('filterEquipment');
    const filterOpeningDateStart = document.getElementById('filterOpeningDateStart');
    const filterOpeningDateEnd = document.getElementById('filterOpeningDateEnd');

    let allTickets = {};
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

    // Popula o select de técnicos para o filtro
    const populateTechnicianFilter = () => {
        allTechnicians = loadTechnicians();
        filterTechnician.innerHTML = '<option value="">Todos</option>';
        const technicianArray = Object.keys(allTechnicians).map(id => ({ id, ...allTechnicians[id] }));
        technicianArray.sort((a, b) => a.fullName.localeCompare(b.fullName));
        technicianArray.forEach(tech => {
            const option = document.createElement('option');
            option.value = tech.id;
            option.textContent = tech.fullName;
            filterTechnician.appendChild(option);
        });

        // Se o usuário logado for um técnico, pré-seleciona seu próprio ID
        if (loggedInUserProfile === 'technician') {
            const currentTechnician = Object.values(allTechnicians).find(tech => tech.username === loggedInUser);
            if (currentTechnician) {
                filterTechnician.value = currentTechnician.id;
                filterTechnician.disabled = true; // Impede que o técnico mude o filtro para outro técnico
            }
        }
    };

    // --- Funções de Renderização e Filtragem ---

    const renderDashboard = () => {
        allTickets = loadTickets();
        allClients = loadClients();
        allEquipments = loadEquipments();
        allTechnicians = loadTechnicians();

        let ticketsArray = Object.values(allTickets);

        // Filtro inicial para técnicos: só vêem seus próprios tickets
        if (loggedInUserProfile === 'technician') {
            const currentTechnician = Object.values(allTechnicians).find(tech => tech.username === loggedInUser);
            if (currentTechnician) {
                ticketsArray = ticketsArray.filter(ticket => ticket.technicianId === currentTechnician.id);
            } else {
                ticketsArray = []; // Se não encontrar o técnico logado, não mostra tickets
            }
        }

        // Aplica filtros da UI
        const filteredTickets = applyUiFilters(ticketsArray);

        updateSummaryCards(filteredTickets);
        renderTicketsTable(filteredTickets);
    };

    const applyUiFilters = (tickets) => {
        let filtered = [...tickets];

        const status = filterStatus.value;
        const technicianId = filterTechnician.value;
        const clientName = filterClient.value.toLowerCase();
        const equipmentSearch = filterEquipment.value.toLowerCase();
        const openingDateStart = filterOpeningDateStart.value;
        const openingDateEnd = filterOpeningDateEnd.value;

        if (status) {
            filtered = filtered.filter(ticket => ticket.status === status);
        }
        if (technicianId) {
            filtered = filtered.filter(ticket => ticket.technicianId === technicianId);
        }
        if (clientName) {
            filtered = filtered.filter(ticket => {
                const client = allClients[ticket.clientId];
                return client && (client.clientName || client.tradeName).toLowerCase().includes(clientName);
            });
        }
        if (equipmentSearch) {
            filtered = filtered.filter(ticket => {
                const equipment = allEquipments[ticket.equipmentId];
                return equipment && (equipment.equipmentName.toLowerCase().includes(equipmentSearch) || equipment.id.toLowerCase().includes(equipmentSearch));
            });
        }
        if (openingDateStart) {
            filtered = filtered.filter(ticket => ticket.openingDate >= openingDateStart);
        }
        if (openingDateEnd) {
            filtered = filtered.filter(ticket => ticket.openingDate <= openingDateEnd);
        }

        return filtered;
    };

    const updateSummaryCards = (tickets) => {
        const today = new Date().toISOString().split('T')[0];

        const pending = tickets.filter(t => t.status === 'Pendente').length;
        const inProgress = tickets.filter(t => t.status === 'Em Andamento').length;
        const awaitingApproval = tickets.filter(t => t.status === 'Aguardando Aprovação').length;
        const finishedToday = tickets.filter(t => t.status === 'Finalizada' && t.serviceDate === today).length; // Assumindo serviceDate é a data de finalização

        pendingTicketsCount.textContent = pending;
        inProgressTicketsCount.textContent = inProgress;
        awaitingApprovalTicketsCount.textContent = awaitingApproval;
        finishedTodayTicketsCount.textContent = finishedToday;
    };

    const renderTicketsTable = (tickets) => {
        ticketDashboardGridBody.innerHTML = '';

        if (tickets.length === 0) {
            const row = ticketDashboardGridBody.insertRow();
            row.innerHTML = `<td colspan="7">Nenhum ticket encontrado com os filtros aplicados.</td>`;
            return;
        }

        tickets.sort((a, b) => new Date(b.openingDate) - new Date(a.openingDate)); // Ordena por data de abertura mais recente

        tickets.forEach(ticket => {
            const row = ticketDashboardGridBody.insertRow();
            const client = allClients[ticket.clientId];
            const equipment = allEquipments[ticket.equipmentId];
            const technician = allTechnicians[ticket.technicianId];

            // Formata o status para CSS (remove espaços e acentos)
            const statusClass = ticket.status.replace(/\s/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            row.innerHTML = `
                <td>${ticket.id}</td>
                <td>${ticket.openingDate}</td>
                <td>${client ? (client.clientName || client.tradeName) : 'N/A'}</td>
                <td>${equipment ? equipment.equipmentName : 'N/A'}</td>
                <td>${technician ? technician.fullName : 'N/A'}</td>
                <td><span class="status ${statusClass}">${ticket.status}</span></td>
                <td>
                    <button type="button" class="btn btn-primary btn-sm view-ticket-btn" data-ticket-id="${ticket.id}">Ver/Editar</button>
                </td>
            `;
        });

        // Adiciona event listeners para os botões "Ver/Editar"
        ticketDashboardGridBody.querySelectorAll('.view-ticket-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const ticketId = event.target.dataset.ticketId;
                // Salva o ID no localStorage para que open_ticket.js possa carregá-lo
                localStorage.setItem('ticketToEditId', ticketId);
                // Carrega a página de edição de ticket
                loadContent('open_ticket.html', 'js/open_ticket.js', 'Gerenciar Tickets');
            });
        });
    };

    // --- Event Listeners ---
    refreshDashboardBtn.addEventListener('click', renderDashboard);
    applyFiltersBtn.addEventListener('click', renderDashboard);
    clearFiltersBtn.addEventListener('click', () => {
        filterStatus.value = '';
        // Se for técnico, mantém o filtro de técnico desabilitado e selecionado
        if (loggedInUserProfile !== 'technician') {
            filterTechnician.value = '';
        }
        filterClient.value = '';
        filterEquipment.value = '';
        filterOpeningDateStart.value = '';
        filterOpeningDateEnd.value = '';
        renderDashboard(); // Renderiza com filtros limpos
    });

    // --- Inicialização ---
    populateTechnicianFilter(); // Popula o filtro de técnicos
    renderDashboard(); // Renderiza o painel na carga inicial
});