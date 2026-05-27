// js/ticket_dashboard.js - SEM a lógica do botão "Abrir Novo Ticket"

document.addEventListener('DOMContentLoaded', () => {
    const pendingTicketsContainer = document.getElementById('pendingTickets');
    const inProgressTicketsContainer = document.getElementById('inProgressTickets');
    const waitingPartTicketsContainer = document.getElementById('waitingPartTickets');
    const waitingApprovalTicketsContainer = document.getElementById('waitingApprovalTickets');

    const pendingCount = document.getElementById('pendingCount');
    const inProgressCount = document.getElementById('inProgressCount');
    const waitingPartCount = document.getElementById('waitingPartCount');
    const waitingApprovalCount = document.getElementById('waitingApprovalCount');

    // const openNewTicketBtn = document.getElementById('openNewTicketBtn'); // REMOVIDO: Botão "Abrir Novo Ticket"

    let allClients = {};
    let allEquipments = {};
    let allTechnicians = {};

    // --- Funções de Carregamento de Dados ---
    const loadTickets = () => JSON.parse(localStorage.getItem('appTickets')) || {};
    const loadClients = () => JSON.parse(localStorage.getItem('appClients')) || {};
    const loadEquipments = () => JSON.parse(localStorage.getItem('appEquipments')) || {};
    const loadTechnicians = () => JSON.parse(localStorage.getItem('appTechnicians')) || {};

    // --- Função Principal para Renderizar o Painel ---
    const renderTicketDashboard = () => {
        allClients = loadClients();
        allEquipments = loadEquipments();
        allTechnicians = loadTechnicians();
        const tickets = loadTickets();

        // Limpa os contêineres
        pendingTicketsContainer.innerHTML = '';
        inProgressTicketsContainer.innerHTML = '';
        waitingPartTicketsContainer.innerHTML = '';
        waitingApprovalTicketsContainer.innerHTML = '';

        // Zera as contagens
        let pCount = 0, ipCount = 0, wpCount = 0, waCount = 0;

        // Converte o objeto de tickets em um array e ordena por data de abertura (mais recente primeiro)
        const ticketArray = Object.values(tickets).sort((a, b) => new Date(b.openingDate) - new Date(a.openingDate));

        ticketArray.forEach(ticket => {
            const clientName = ticket.clientId && allClients[ticket.clientId] ? (allClients[ticket.clientId].clientName || allClients[ticket.clientId].tradeName) : 'N/A';
            const equipmentName = ticket.equipmentId && allEquipments[ticket.equipmentId] ? allEquipments[ticket.equipmentId].equipmentName : 'N/A';
            const technicianName = ticket.technicianId && allTechnicians[ticket.technicianId] ? allTechnicians[ticket.technicianId].fullName : 'Não Atribuído';

            const ticketCard = document.createElement('div');
            ticketCard.classList.add('ticket-card');
            ticketCard.dataset.ticketId = ticket.id; // Armazena o ID para edição
            ticketCard.innerHTML = `
                <h4>${ticket.id} - ${equipmentName}</h4>
                <p>${ticket.problemDescription.substring(0, 100)}${ticket.problemDescription.length > 100 ? '...' : ''}</p>
                <div class="ticket-info">
                    <span>Cliente: ${clientName}</span>
                    <span>Técnico: ${technicianName}</span>
                </div>
            `;

            // Adiciona evento de clique para editar o ticket
            ticketCard.addEventListener('click', () => {
                localStorage.setItem('ticketToEditId', ticket.id); // Armazena o ID do ticket a ser editado
                // Carrega a página de abertura de ticket no modo de edição
                loadContent('open_ticket.html', 'js/open_ticket.js', 'Gerenciar Tickets');
            });

            // Distribui os tickets nos micropainéis
            switch (ticket.status) {
                case 'Pendente':
                    pendingTicketsContainer.appendChild(ticketCard);
                    pCount++;
                    break;
                case 'Em Andamento':
                    inProgressTicketsContainer.appendChild(ticketCard);
                    ipCount++;
                    break;
                case 'Aguardando Peça':
                    waitingPartTicketsContainer.appendChild(ticketCard);
                    wpCount++;
                    break;
                case 'Aguardando Aprovação':
                    waitingApprovalTicketsContainer.appendChild(ticketCard);
                    waCount++;
                    break;
                // Outros status (Finalizada, Faturada) não aparecem neste painel
            }
        });

        // Atualiza as contagens
        pendingCount.textContent = pCount;
        inProgressCount.textContent = ipCount;
        waitingPartCount.textContent = wpCount;
        waitingApprovalCount.textContent = waCount;
    };

    // --- Inicialização ---
    renderTicketDashboard();

    // REMOVIDO: Event listener para o botão "Abrir Novo Ticket"
    // openNewTicketBtn.addEventListener('click', () => {
    //     localStorage.removeItem('ticketToEditId');
    //     loadContent('open_ticket.html', 'js/open_ticket.js', 'Abrir Ticket');
    // });
});