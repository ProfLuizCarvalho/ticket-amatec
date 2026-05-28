// js/open_ticket.js - Versão Completa com Seção de Produtos Vendidos e Cálculos de Desconto

document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticketForm');
    const formMessage = document.getElementById('formMessage');
    const ticketGridBody = document.querySelector('#ticketGrid tbody');

    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const deleteButton = document.getElementById('deleteButton');

    // Referências aos campos do formulário (Dados do Ticket)
    const ticketIdInput = document.getElementById('ticketId');
    const openingDateInput = document.getElementById('openingDate');
    const clientIdSelect = document.getElementById('clientId');
    const equipmentIdSelect = document.getElementById('equipmentId');
    const sectorInput = document.getElementById('sector');
    const terminalInput = document.getElementById('terminal');
    const equipmentNumberInput = document.getElementById('equipmentNumber');
    const problemDescriptionTextarea = document.getElementById('problemDescription');

    // Referências aos campos do formulário (Dados do Atendimento - Técnico)
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

    // Referências aos campos do formulário (Produtos Vendidos)
    const productsSoldSection = document.getElementById('productsSoldSection'); // A seção inteira
    const productIdSelect = document.getElementById('productId');
    const productQuantityInput = document.getElementById('productQuantity');
    const productUnitPriceInput = document.getElementById('productUnitPrice'); // Preço Unitário Original
    const productDiscountInput = document.getElementById('productDiscount'); // NOVO: Desconto (%)
    const productUnitPriceWithDiscountInput = document.getElementById('productUnitPriceWithDiscount'); // NOVO: Preço Unitário com Desconto
    const productTotalPriceInput = document.getElementById('productTotalPrice'); // Total do Item com Desconto
    const addProductBtn = document.getElementById('addProductBtn');
    const productsTableBody = document.querySelector('#productsTable tbody');
    const productsSubtotalOriginalDisplay = document.getElementById('productsSubtotalOriginal'); // NOVO: Subtotal Original
    const productsTotalDiscountDisplay = document.getElementById('productsTotalDiscount'); // NOVO: Total de Desconto
    const productsSubtotalWithDiscountDisplay = document.getElementById('productsSubtotalWithDiscount'); // NOVO: Subtotal com Desconto

    let editingTicketId = null;
    let allClients = {};
    let allEquipments = {};
    let allTechnicians = {};
    let allProducts = {}; 
    let currentTicketProducts = []; 

    const loggedInUserProfile = localStorage.getItem('userProfile'); // Perfil do usuário logado

    // --- Funções de Carregamento/Salvamento ---
    const loadTickets = () => JSON.parse(localStorage.getItem('appTickets')) || {};
    const saveTickets = (tickets) => localStorage.setItem('appTickets', JSON.stringify(tickets));
    const loadClients = () => JSON.parse(localStorage.getItem('appClients')) || {};
    const loadEquipments = () => JSON.parse(localStorage.getItem('appEquipments')) || {};
    const loadTechnicians = () => JSON.parse(localStorage.getItem('appTechnicians')) || {};
    const loadProducts = () => JSON.parse(localStorage.getItem('appProducts')) || {}; 

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

    // Popula o select de produtos
    const populateProductSelect = () => {
        allProducts = loadProducts();
        productIdSelect.innerHTML = '<option value="">Selecione um Produto</option>';
        const productArray = Object.keys(allProducts).map(id => ({ id, ...allProducts[id] }));
        productArray.sort((a, b) => a.productName.localeCompare(b.productName));
        productArray.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.productName;
            productIdSelect.appendChild(option);
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
            const equipment = allEquipments[selectedEquipmentId];
            sectorInput.value = equipment.sector || '';
            terminalInput.value = equipment.terminal || '';
            equipmentNumberInput.value = equipment.equipmentNumber || '';
        } else {
            sectorInput.value = '';
            terminalInput.value = '';
            equipmentNumberInput.value = '';
        }
    };

    // Habilita/desabilita o campo de data fim da garantia do ticket
    const toggleWarrantyEndDateTicketField = () => {
        if (hasWarrantyTicketSelect.value === 'Sim') {
            warrantyEndDateTicketInput.disabled = false;
            warrantyEndDateTicketGroup.style.display = 'block';
        } else {
            warrantyEndDateTicketInput.disabled = true;
            warrantyEndDateTicketInput.value = '';
            warrantyEndDateTicketGroup.style.display = 'none';
        }
    };

    // Calcula e atualiza os campos de preço e total do item
    const updateProductPriceFields = () => {
        const selectedProductId = productIdSelect.value;
        const quantity = parseFloat(productQuantityInput.value) || 0;
        const discount = parseFloat(productDiscountInput.value) || 0; // Desconto em %

        if (selectedProductId && allProducts[selectedProductId]) {
            const product = allProducts[selectedProductId];
            const unitPriceOriginal = parseFloat(product.price) || 0;

            // Calcula o preço unitário com desconto
            const unitPriceWithDiscount = unitPriceOriginal * (1 - (discount / 100));
            // Calcula o total do item com desconto
            const itemTotalPrice = unitPriceWithDiscount * quantity;

            productUnitPriceInput.value = unitPriceOriginal.toFixed(2);
            productUnitPriceWithDiscountInput.value = unitPriceWithDiscount.toFixed(2);
            productTotalPriceInput.value = itemTotalPrice.toFixed(2);
        } else {
            productUnitPriceInput.value = '0.00';
            productUnitPriceWithDiscountInput.value = '0.00';
            productTotalPriceInput.value = '0.00';
        }
    };

    // Adiciona um produto à lista de produtos do ticket
    const addProductToTicket = () => {
        const selectedProductId = productIdSelect.value;
        const quantity = parseFloat(productQuantityInput.value);
        const discount = parseFloat(productDiscountInput.value); // Desconto em %

        if (!selectedProductId || !quantity || quantity <= 0) {
            alert('Por favor, selecione um produto e informe uma quantidade válida.');
            return;
        }

        const product = allProducts[selectedProductId];
        const unitPriceOriginal = parseFloat(product.price);
        const unitPriceWithDiscount = unitPriceOriginal * (1 - (discount / 100));
        const itemTotalPrice = unitPriceWithDiscount * quantity;

        const newProductItem = {
            productId: selectedProductId,
            productName: product.productName,
            quantity: quantity,
            unitPriceOriginal: unitPriceOriginal,
            discount: discount, // Armazena o percentual de desconto
            unitPriceWithDiscount: unitPriceWithDiscount,
            totalPrice: itemTotalPrice
        };

        currentTicketProducts.push(newProductItem);
        renderProductsTable();

        // Reseta os campos de adição de produto
        productIdSelect.value = '';
        productQuantityInput.value = '1';
        productDiscountInput.value = '0';
        updateProductPriceFields(); // Limpa os campos de preço
    };

    // Remove um produto da lista de produtos do ticket
    const removeProductFromTicket = (index) => {
        currentTicketProducts.splice(index, 1);
        renderProductsTable();
    };

    // Renderiza a tabela de produtos vendidos
    const renderProductsTable = () => {
        productsTableBody.innerHTML = '';
        let subtotalOriginal = 0;
        let totalDiscountAmount = 0;
        let subtotalWithDiscount = 0;

        currentTicketProducts.forEach((item, index) => {
            const row = productsTableBody.insertRow();
            row.innerHTML = `
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>R$ ${item.unitPriceOriginal.toFixed(2)}</td>
                <td>${item.discount.toFixed(0)}%</td>
                <td>R$ ${item.unitPriceWithDiscount.toFixed(2)}</td>
                <td>R$ ${item.totalPrice.toFixed(2)}</td>
                <td><button type="button" class="btn btn-danger btn-sm remove-product-btn" data-index="${index}">Remover</button></td>
            `;
            subtotalOriginal += item.unitPriceOriginal * item.quantity;
            totalDiscountAmount += (item.unitPriceOriginal * item.quantity) - item.totalPrice;
            subtotalWithDiscount += item.totalPrice;
        });

        productsSubtotalOriginalDisplay.textContent = `R$ ${subtotalOriginal.toFixed(2)}`;
        productsTotalDiscountDisplay.textContent = `R$ ${totalDiscountAmount.toFixed(2)}`;
        productsSubtotalWithDiscountDisplay.textContent = `R$ ${subtotalWithDiscount.toFixed(2)}`;

        // Adiciona event listeners para os botões de remover
        productsTableBody.querySelectorAll('.remove-product-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                removeProductFromTicket(index);
            });
        });
    };

    // Gera um ID de ticket único (ex: TICKET-AAAA-MM-DD-HHMMSS)
    const generateTicketId = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `TICKET-${year}${month}${day}-${hours}${minutes}${seconds}`;
    };

    // Renderiza a grid de tickets
    const renderTicketGrid = () => {
        ticketGridBody.innerHTML = '';
        const tickets = loadTickets();
        const ticketArray = Object.values(tickets);

        // Filtra tickets para o cliente logado, se for perfil 'user'
        let filteredTickets = ticketArray;
        if (loggedInUserProfile === 'user') {
            const loggedInUser = localStorage.getItem('loggedInUser');
            const clients = loadClients();
            const client = Object.values(clients).find(c => c.clientUser === loggedInUser);
            if (client) {
                filteredTickets = ticketArray.filter(ticket => ticket.clientId === client.id);
            } else {
                filteredTickets = []; // Se o usuário logado não for um cliente, não mostra tickets
            }
        }

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
                    <button type="button" class="btn btn-primary btn-sm" onclick="editTicket('${ticket.id}')">Editar</button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteTicket('${ticket.id}')">Excluir</button>
                </td>
            `;
        });
    };

    // Preenche o formulário para edição de um ticket existente
    const editTicket = (id) => {
        const tickets = loadTickets();
        const ticket = tickets[id];

        if (ticket) {
            editingTicketId = id;

            ticketIdInput.value = ticket.id;
            openingDateInput.value = ticket.openingDate;
            clientIdSelect.value = ticket.clientId;
            populateEquipmentSelect(); // Popula equipamentos para o cliente selecionado
            equipmentIdSelect.value = ticket.equipmentId;
            updateEquipmentDetails(); // Preenche detalhes do equipamento
            problemDescriptionTextarea.value = ticket.problemDescription;

            technicianIdSelect.value = ticket.technicianId || '';
            scheduledDateInput.value = ticket.scheduledDate || '';
            serviceDateInput.value = ticket.serviceDate || '';
            diagnosisTextarea.value = ticket.diagnosis || '';
            solutionTextarea.value = ticket.solution || '';
            hasWarrantyTicketSelect.value = ticket.hasWarrantyTicket || 'Nao';
            toggleWarrantyEndDateTicketField(); // Mostra/esconde campo de garantia
            warrantyEndDateTicketInput.value = ticket.warrantyEndDateTicket || '';
            billingDueDateInput.value = ticket.billingDueDate || '';
            statusSelect.value = ticket.status;

            currentTicketProducts = ticket.productsSold || [];
            renderProductsTable();

            // Habilita/desabilita campos e botões com base no perfil e modo de edição
            const isUser = loggedInUserProfile === 'user';
            const isAdminOrTech = loggedInUserProfile === 'admin' || loggedInUserProfile === 'technician';

            // Campos do Ticket (Cliente pode ver, Admin/Tech pode editar)
            clientIdSelect.disabled = isUser;
            equipmentIdSelect.disabled = isUser;
            problemDescriptionTextarea.disabled = isUser;

            // Campos de Atendimento (Apenas Admin/Tech pode editar)
            technicianIdSelect.disabled = isUser;
            scheduledDateInput.disabled = isUser;
            serviceDateInput.disabled = isUser;
            diagnosisTextarea.disabled = isUser;
            solutionTextarea.disabled = isUser;
            hasWarrantyTicketSelect.disabled = isUser;
            warrantyEndDateTicketInput.disabled = isUser || (hasWarrantyTicketSelect.value !== 'Sim');
            billingDueDateInput.disabled = isUser;
            statusSelect.disabled = isUser;

            // Campos de Produtos (Apenas Admin/Tech pode editar)
            productIdSelect.disabled = isUser;
            productQuantityInput.disabled = isUser;
            productDiscountInput.disabled = isUser;
            addProductBtn.disabled = isUser;
            productsTableBody.querySelectorAll('.remove-product-btn').forEach(btn => btn.disabled = isUser);

            // Botões de Ação
            saveButton.style.display = 'none'; // Salvar só para novo ticket
            editButton.style.display = 'inline-block'; // Editar para atualizar
            deleteButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';

            formMessage.textContent = '';
        } else {
            alert('Ticket não encontrado.');
        }
    };

    // Exclui um ticket
    const deleteTicket = (id) => {
        if (confirm(`Tem certeza que deseja excluir o ticket ${id}?`)) {
            let tickets = loadTickets();
            delete tickets[id];
            saveTickets(tickets);
            formMessage.textContent = `Ticket "${id}" excluído com sucesso!`;
            formMessage.classList.remove('error-message');
            formMessage.classList.add('success-message');
            renderTicketGrid();
            resetForm();
        }
    };

    // --- Inicialização e Event Listeners ---

    // Popula selects e renderiza grid ao carregar a página
    populateClientSelect();
    populateTechnicianSelect();
    populateProductSelect(); 
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

    // Event listeners para a seção de produtos
    productIdSelect.addEventListener('change', updateProductPriceFields);
    productQuantityInput.addEventListener('input', updateProductPriceFields);
    productDiscountInput.addEventListener('input', updateProductPriceFields); // NOVO: Evento para o campo de desconto
    addProductBtn.addEventListener('click', addProductToTicket);

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
            status,
            productsSold: currentTicketProducts 
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
                formMessage.classList.add('error-error');
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