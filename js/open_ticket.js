// js/open_ticket.js - Versão Atualizada para Edição a partir do Painel

document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticketForm');
    const formMessage = document.getElementById('formMessage');
    const ticketGridBody = document.querySelector('#ticketGrid tbody');

    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const deleteButton = document.getElementById('deleteButton');

    // Referências aos campos do formulário
    const ticketIdInput = document.getElementById('ticketId');
    const openingDateInput = document.getElementById('openingDate');
    const clientIdSelect = document.getElementById('clientId');
    const equipmentIdSelect = document.getElementById('equipmentId');
    const sectorInput = document.getElementById('sector');
    const terminalInput = document.getElementById('terminal');
    const equipmentNumberInput = document.getElementById('equipmentNumber');
    const problemDescriptionTextarea = document.getElementById('problemDescription');

    const technicianIdSelect = document.getElementById('technicianId');
    const scheduledDateInput = document.getElementById('scheduledDate');
    const serviceDateInput = document.getElementById('serviceDate');
    const diagnosisTextarea = document.getElementById('diagnosis');
    const solutionTextarea = document.getElementById('solution');
    const hasWarrantyTicketSelect = document.getElementById('hasWarrantyTicket');
    const warrantyEndDateTicketInput = document.getElementById('warrantyEndDateTicket');
    const warrantyEndDateTicketGroup = document.getElementById('warrantyEndDateTicketGroup');
    const billingDueDateInput = document.getElementById('billingDueDate');
    const statusSelect = document.getElementById('status');

    let editingTicketId = null;
    let allClients = {};
    let allEquipments = {};
    let allTechnicians = {};

    const loggedInUserProfile = localStorage.getItem('userProfile'); // Perfil do usuário logado

    // --- Funções de Carregamento/Salvamento ---
    const loadTickets = () => JSON.parse(localStorage.getItem('appTickets')) || {};
    const saveTickets = (tickets) => localStorage.setItem('appTickets', JSON.stringify(tickets));
    const loadClients = () => JSON.parse(localStorage.getItem('appClients')) || {};
    const loadEquipments = () => JSON.parse(localStorage.getItem('appEquipments')) || {};
    const loadTechnicians = () => JSON.parse(localStorage.getItem('appTechnicians')) || {};

    // --- Lógica de UI e Interdependências ---

    // Popula o select de clientes
    const populateClientSelect = () => {
        allClients = loadClients();
        clientIdSelect.innerHTML = '<option value="">Selecione um Cliente</option>';
        const clientArray = Object.keys(allClients).map(id => ({ id, ...allClients[id] }));
        clientArray.sort((a, b) => (a.clientName || a.tradeName).localeCompare(b.clientName || b.tradeName));
        clientArray.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.clientName || client.tradeName;
            clientIdSelect.appendChild(option);
        });
    };

    // Popula o select de técnicos
    const populateTechnicianSelect = () => {
        allTechnicians = loadTechnicians();
        technicianIdSelect.innerHTML = '<option value="">Selecione um Técnico</option>';
        const technicianArray = Object.keys(allTechnicians).map(id => ({ id, ...allTechnicians[id] }));
        technicianArray.sort((a, b) => a.fullName.localeCompare(b.fullName));
        technicianArray.forEach(tech => {
            const option = document.createElement('option');
            option.value = tech.id;
            option.textContent = tech.fullName;
            technicianIdSelect.appendChild(option);
        });
    };

    // Popula o select de equipamentos com base no cliente selecionado
    const populateEquipmentSelect = () => {
        allEquipments = loadEquipments();
        const selectedClientId = clientIdSelect.value;
        equipmentIdSelect.innerHTML = '<option value="">Selecione um Equipamento</option>';
        sectorInput.value = '';
        terminalInput.value = '';
        equipmentNumberInput.value = '';

        if (selectedClientId) {
            const clientEquipments = Object.values(allEquipments).filter(eq => eq.clientId === selectedClientId);
            clientEquipments.sort((a, b) => a.equipmentName.localeCompare(b.equipmentName));
            clientEquipments.forEach(eq => {
                const option = document.createElement('option');
                option.value = eq.id;
                option.textContent = `${eq.equipmentName} (${eq.id})`;
                equipmentIdSelect.appendChild(option);
            });
        }
    };

    // Preenche os campos de setor, terminal e número do equipamento ao selecionar um equipamento
    const updateEquipmentDetails = () => {
        const selectedEquipmentId = equipmentIdSelect.value;
        if (selectedEquipmentId && allEquipments[selectedEquipmentId]) {
            const eq = allEquipments[selectedEquipmentId];
            // Estes campos 'sector' e 'terminal' precisam ser adicionados ao cadastro de equipamento
            // Se não existirem, ficarão vazios ou com um valor padrão
            sectorInput.value = eq.sector || ''; 
            terminalInput.value = eq.terminal || ''; 
            equipmentNumberInput.value = eq.patrimonyNumber || eq.id; // Usar patrimônio ou ID
        } else {
            sectorInput.value = '';
            terminalInput.value = '';
            equipmentNumberInput.value = '';
        }
    };

    // Alterna a visibilidade do campo de Data Fim da Garantia do Ticket
    const toggleWarrantyEndDateTicketField = () => {
        if (hasWarrantyTicketSelect.value === 'Sim') {
            warrantyEndDateTicketGroup.style.display = 'block';
            warrantyEndDateTicketInput.setAttribute('required', 'required');
        } else {
            warrantyEndDateTicketGroup.style.display = 'none';
            warrantyEndDateTicketInput.removeAttribute('required');
            warrantyEndDateTicketInput.value = '';
        }
    };

    // Controla a habilitação/desabilitação dos campos do técnico
    const toggleTechnicianFields = (enable) => {
        const technicianFields = [
            technicianIdSelect, scheduledDateInput, serviceDateInput,
            diagnosisTextarea, solutionTextarea, hasWarrantyTicketSelect,
            warrantyEndDateTicketInput, billingDueDateInput
        ];
        technicianFields.forEach(field => {
            if (field.id !== 'warrantyEndDateTicket') { // A data de garantia é controlada por toggleWarrantyEndDateTicketField
                field.disabled = !enable;
            }
        });
        // O status pode ser alterado por todos, mas o técnico tem mais opções
        // statusSelect.disabled = !enable; // Decidir se o status é editável apenas pelo técnico
    };

    // --- Funções de CRUD ---

    // Função para renderizar a grid de tickets
    const renderTicketGrid = () => {
        const tickets = loadTickets();
        ticketGridBody.innerHTML = '';

        const ticketArray = Object.keys(tickets).map(id => ({ id, ...tickets[id] }));
        ticketArray.sort((a, b) => new Date(b.openingDate) - new Date(a.openingDate)); // Ordena por data de abertura mais recente

        ticketArray.forEach(ticket => {
            const row = ticketGridBody.insertRow();
            row.dataset.ticketId = ticket.id;

            const clientName = ticket.clientId && allClients[ticket.clientId] ? (allClients[ticket.clientId].clientName || allClients[ticket.clientId].tradeName) : 'N/A';
            const equipmentName = ticket.equipmentId && allEquipments[ticket.equipmentId] ? allEquipments[ticket.equipmentId].equipmentName : 'N/A';
            const technicianName = ticket.technicianId && allTechnicians[ticket.technicianId] ? allTechnicians[ticket.technicianId].fullName : 'Não Atribuído';

            row.insertCell().textContent = ticket.id;
            row.insertCell().textContent = ticket.openingDate;
            row.insertCell().textContent = clientName;
            row.insertCell().textContent = equipmentName;
            row.insertCell().textContent = ticket.problemDescription.substring(0, 50) + (ticket.problemDescription.length > 50 ? '...' : '');
            row.insertCell().textContent = technicianName;
            row.insertCell().textContent = ticket.status;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('grid-actions');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('btn-edit-grid');
            editBtn.addEventListener('click', () => editTicket(ticket.id));
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('btn-delete-grid');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteTicket(ticket.id);
            });
            actionsCell.appendChild(deleteBtn);
        });
    };

    // Função para preencher o formulário com dados de um ticket para edição
    const editTicket = (id) => {
        const tickets = loadTickets();
        const ticketToEdit = tickets[id];

        if (ticketToEdit) {
            ticketIdInput.value = ticketToEdit.id;
            openingDateInput.value = ticketToEdit.openingDate;
            clientIdSelect.value = ticketToEdit.clientId;
            populateEquipmentSelect(); // Popula equipamentos para o cliente selecionado
            equipmentIdSelect.value = ticketToEdit.equipmentId;
            updateEquipmentDetails(); // Preenche detalhes do equipamento
            problemDescriptionTextarea.value = ticketToEdit.problemDescription;

            technicianIdSelect.value = ticketToEdit.technicianId || '';
            scheduledDateInput.value = ticketToEdit.scheduledDate || '';
            serviceDateInput.value = ticketToEdit.serviceDate || '';
            diagnosisTextarea.value = ticketToEdit.diagnosis || '';
            solutionTextarea.value = ticketToEdit.solution || '';
            hasWarrantyTicketSelect.value = ticketToEdit.hasWarrantyTicket || '';
            warrantyEndDateTicketInput.value = ticketToEdit.warrantyEndDateTicket || '';
            billingDueDateInput.value = ticketToEdit.billingDueDate || '';
            statusSelect.value = ticketToEdit.status;

            ticketIdInput.disabled = true; // ID não editável
            openingDateInput.disabled = true; // Data de abertura não editável

            // Habilita/desabilita campos com base no perfil
            if (loggedInUserProfile === 'admin' || loggedInUserProfile === 'technician') {
                toggleTechnicianFields(true); // Técnico e Admin podem editar campos do técnico
                clientIdSelect.disabled = false; // Admin pode mudar cliente
                equipmentIdSelect.disabled = false; // Admin pode mudar equipamento
                problemDescriptionTextarea.disabled = false; // Admin pode mudar descrição
            } else { // User
                toggleTechnicianFields(false); // Usuário não pode editar campos do técnico
                clientIdSelect.disabled = true; // Usuário não pode mudar cliente
                equipmentIdSelect.disabled = true; // Usuário não pode mudar equipamento
                problemDescriptionTextarea.disabled = true; // Usuário não pode mudar descrição
            }

            // Botões de ação
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';

            editingTicketId = id;
            formMessage.textContent = '';

            toggleWarrantyEndDateTicketField(); // Atualiza visibilidade da garantia do ticket
        }
    };

    // Função para excluir um ticket
    const deleteTicket = (id) => {
        if (confirm(`Tem certeza que deseja excluir o ticket "${id}"?`)) {
            let tickets = loadTickets();
            delete tickets[id];
            saveTickets(tickets);
            renderTicketGrid();
            resetForm();
            formMessage.textContent = `Ticket "${id}" excluído com sucesso.`;
            formMessage.classList.remove('error-message');
            formMessage.classList.add('success-message');
        }
    };

    // Função para resetar o formulário e o estado de edição
    const resetForm = () => {
        ticketForm.reset();
        ticketIdInput.disabled = true; // ID sempre desabilitado
        openingDateInput.disabled = true; // Data de abertura sempre desabilitada
        sectorInput.disabled = true;
        terminalInput.disabled = true;
        equipmentNumberInput.disabled = true;

        // Gera um novo ID e preenche a data de abertura
        ticketIdInput.value = `TICKET-${Date.now()}`;
        openingDateInput.valueAsDate = new Date();

        // Habilita/desabilita campos com base no perfil para novo ticket
        if (loggedInUserProfile === 'admin' || loggedInUserProfile === 'technician') {
            clientIdSelect.disabled = false;
            equipmentIdSelect.disabled = false;
            problemDescriptionTextarea.disabled = false;
            toggleTechnicianFields(true); // Admin/Técnico podem preencher tudo
        } else { // User
            clientIdSelect.disabled = false;
            equipmentIdSelect.disabled = false;
            problemDescriptionTextarea.disabled = false;
            toggleTechnicianFields(false); // Usuário não pode preencher campos do técnico
        }

        saveButton.style.display = 'inline-block';
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
        cancelButton.style.display = 'none';

        editingTicketId = null;
        formMessage.textContent = '';

        populateEquipmentSelect(); // Limpa e repopula equipamentos
        toggleWarrantyEndDateTicketField(); // Esconde o campo de data de garantia do ticket
    };

    // --- Inicialização e Event Listeners ---

    // Popula selects e renderiza grid ao carregar a página
    populateClientSelect();
    populateTechnicianSelect();
    renderTicketGrid();

    // Verifica se há um ticket para edição vindo do dashboard
    const ticketToEditId = localStorage.getItem('ticketToEditId');
    if (ticketToEditId) {
        editTicket(ticketToEditId);
        localStorage.removeItem('ticketToEditId'); // Limpa o ID após carregar
    } else {
        resetForm(); // Se não houver, inicia no modo de novo ticket
    }

    // Event listeners para interdependências
    clientIdSelect.addEventListener('change', populateEquipmentSelect);
    equipmentIdSelect.addEventListener('change', updateEquipmentDetails);
    hasWarrantyTicketSelect.addEventListener('change', toggleWarrantyEndDateTicketField);

    // Event Listener para o formulário (Salvar/Atualizar)
    ticketForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const ticketId = ticketIdInput.value;
        const openingDate = openingDateInput.value;
        const clientId = clientIdSelect.value;
        const equipmentId = equipmentIdSelect.value;
        const sector = sectorInput.value;
        const terminal = terminalInput.value;
        const equipmentNumber = equipmentNumberInput.value;
        const problemDescription = problemDescriptionTextarea.value;

        const technicianId = technicianIdSelect.value;
        const scheduledDate = scheduledDateInput.value;
        const serviceDate = serviceDateInput.value;
        const diagnosis = diagnosisTextarea.value;
        const solution = solutionTextarea.value;
        const hasWarrantyTicket = hasWarrantyTicketSelect.value;
        const warrantyEndDateTicket = warrantyEndDateTicketInput.value;
        const billingDueDate = billingDueDateInput.value;
        const status = statusSelect.value;

        // Validações
        if (!ticketId || !openingDate || !clientId || !equipmentId || !problemDescription || !status) {
            formMessage.textContent = 'Por favor, preencha todos os campos obrigatórios do ticket.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }
        if (hasWarrantyTicket === 'Sim' && !warrantyEndDateTicket) {
            formMessage.textContent = 'Por favor, informe a Data Fim da Garantia do Ticket.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }

        let tickets = loadTickets();
        let ticketData = {
            id: ticketId,
            openingDate,
            clientId,
            equipmentId,
            sector,
            terminal,
            equipmentNumber,
            problemDescription,
            technicianId,
            scheduledDate,
            serviceDate,
            diagnosis,
            solution,
            hasWarrantyTicket,
            warrantyEndDateTicket: hasWarrantyTicket === 'Sim' ? warrantyEndDateTicket : '',
            billingDueDate,
            status
        };

        if (editingTicketId === null) { // Modo de Cadastro (novo ticket)
            if (tickets[ticketId]) {
                formMessage.textContent = 'ID de ticket já existe. Gere um novo ID ou edite o existente.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
            tickets[ticketId] = ticketData;
            saveTickets(tickets);
            formMessage.textContent = `Ticket "${ticketId}" aberto com sucesso!`;
        } else { // Modo de Edição (atualizar ticket existente)
            const ticketToUpdate = tickets[editingTicketId];
            if (ticketToUpdate) {
                tickets[editingTicketId] = { ...ticketData, id: editingTicketId };
                saveTickets(tickets);
                formMessage.textContent = `Ticket "${ticketId}" atualizado com sucesso!`;
            } else {
                formMessage.textContent = 'Erro: Ticket não encontrado para atualização.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
        }

        formMessage.classList.remove('error-message');
        formMessage.classList.add('success-message');
        renderTicketGrid();
        resetForm();
    });

    // Event Listeners para os botões de ação
    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        ticketForm.dispatchEvent(new Event('submit'));
    });

    cancelButton.addEventListener('click', (event) => {
        event.preventDefault();
        resetForm();
        formMessage.textContent = 'Operação cancelada.';
        formMessage.classList.remove('success-message');
        formMessage.classList.add('error-message');
    });

    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (editingTicketId) {
            deleteTicket(editingTicketId);
        }
    });

    // Event listener para cliques nas linhas da grid para edição
    ticketGridBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.ticketId) {
            editTicket(row.dataset.ticketId);
        }
    });
});