// js/open_ticket.js - Versão Atualizada (Apenas Formulário de Ticket)

document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticketForm');
    const formMessage = document.getElementById('formMessage');
    // REMOVIDO: const ticketGridBody = document.querySelector('#ticketGrid tbody');

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
    const productDiscountInput = document.getElementById('productDiscount'); // Desconto (%)
    const productUnitPriceWithDiscountInput = document.getElementById('productUnitPriceWithDiscount'); // Preço Unitário com Desconto
    const productTotalPriceInput = document.getElementById('productTotalPrice'); // Total do Item com Desconto
    const addProductBtn = document.getElementById('addProductBtn');
    const productsTableBody = document.querySelector('#productsTable tbody');
    const productsSubtotalOriginalDisplay = document.getElementById('productsSubtotalOriginal'); // Subtotal Original
    const productsTotalDiscountDisplay = document.getElementById('productsTotalDiscount'); // Total de Desconto
    const productsSubtotalWithDiscountDisplay = document.getElementById('productsSubtotalWithDiscount'); // Subtotal com Desconto

    let editingTicketId = null;
    let allClients = {};
    let allEquipments = {};
    let allTechnicians = {};
    let allProducts = {}; 
    let currentTicketProducts = []; 

    const loggedInUserProfile = localStorage.getItem('userProfile'); // Perfil do usuário logado
    const loggedInUser = localStorage.getItem('loggedInUser'); // Nome de usuário logado

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
        technicianIdSelect.innerHTML = '<option value="" disabled selected>Selecione um Técnico</option>'; // Adicionado disabled selected
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
            sectorInput.value = eq.sector || ''; 
            terminalInput.value = eq.terminal || ''; 
            equipmentNumberInput.value = eq.patrimonyNumber || eq.id;
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
        } else {
            warrantyEndDateTicketGroup.style.display = 'none';
            warrantyEndDateTicketInput.value = ''; // Limpa o valor se não houver garantia
        }
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

    // Atualiza os campos de preço unitário, desconto e total do item de produto
    const updateProductPriceFields = () => {
        const selectedProductId = productIdSelect.value;
        const quantity = parseInt(productQuantityInput.value) || 0;
        const discountPercent = parseFloat(productDiscountInput.value) || 0;
        const product = allProducts[selectedProductId];

        if (product && quantity > 0) {
            const unitPriceOriginal = parseFloat(product.salePrice);
            const discountFactor = 1 - (discountPercent / 100);
            const unitPriceWithDiscount = unitPriceOriginal * discountFactor;
            const totalPriceWithDiscount = unitPriceWithDiscount * quantity;

            productUnitPriceInput.value = unitPriceOriginal.toFixed(2);
            productUnitPriceWithDiscountInput.value = unitPriceWithDiscount.toFixed(2);
            productTotalPriceInput.value = totalPriceWithDiscount.toFixed(2);
        } else {
            productUnitPriceInput.value = '0.00';
            productUnitPriceWithDiscountInput.value = '0.00';
            productTotalPriceInput.value = '0.00';
        }
    };

    // Adiciona um produto à lista de produtos do ticket
    const addProductToTicket = () => {
        const selectedProductId = productIdSelect.value;
        const quantity = parseInt(productQuantityInput.value) || 0;
        const discountPercent = parseFloat(productDiscountInput.value) || 0;

        if (!selectedProductId || quantity <= 0) {
            formMessage.textContent = 'Selecione um produto e uma quantidade válida.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }

        const product = allProducts[selectedProductId];
        if (!product) {
            formMessage.textContent = 'Produto não encontrado.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }

        const unitPriceOriginal = parseFloat(product.salePrice);
        const discountFactor = 1 - (discountPercent / 100);
        const unitPriceWithDiscount = unitPriceOriginal * discountFactor;
        const subtotalWithDiscount = unitPriceWithDiscount * quantity;
        const totalDiscountValue = (unitPriceOriginal * quantity) - subtotalWithDiscount;

        const newProductItem = {
            productId: product.id,
            productName: product.productName,
            quantity: quantity,
            unitPriceOriginal: unitPriceOriginal,
            discountPercent: discountPercent,
            unitPriceWithDiscount: unitPriceWithDiscount,
            subtotalWithDiscount: subtotalWithDiscount,
            totalDiscountValue: totalDiscountValue
        };

        // Verifica se o produto já existe na lista e atualiza
        const existingProductIndex = currentTicketProducts.findIndex(item => item.productId === newProductItem.productId);
        if (existingProductIndex > -1) {
            currentTicketProducts[existingProductIndex] = newProductItem;
        } else {
            currentTicketProducts.push(newProductItem);
        }

        renderProductsTable();
        // Limpa os campos de adição após adicionar
        productIdSelect.value = '';
        productQuantityInput.value = '1';
        productDiscountInput.value = '0';
        updateProductPriceFields(); // Reseta os campos de preço
        formMessage.textContent = ''; // Limpa mensagem de erro
    };

    // Remove um produto da lista de produtos do ticket
    const removeProductFromTicket = (index) => {
        currentTicketProducts.splice(index, 1);
        renderProductsTable();
    };

    // Renderiza a tabela de produtos vendidos
    const renderProductsTable = () => {
        productsTableBody.innerHTML = '';
        let totalSubtotalOriginal = 0;
        let totalDiscount = 0;
        let totalSubtotalWithDiscount = 0;

        if (currentTicketProducts.length === 0) {
            const row = productsTableBody.insertRow();
            row.innerHTML = `<td colspan="7">Nenhum produto adicionado.</td>`;
            productsSubtotalOriginalDisplay.textContent = 'R$ 0.00';
            productsTotalDiscountDisplay.textContent = 'R$ 0.00';
            productsSubtotalWithDiscountDisplay.textContent = 'R$ 0.00';
            return;
        }

        currentTicketProducts.forEach((item, index) => {
            const row = productsTableBody.insertRow();
            const subtotalOriginalItem = item.unitPriceOriginal * item.quantity;

            totalSubtotalOriginal += subtotalOriginalItem;
            totalDiscount += item.totalDiscountValue;
            totalSubtotalWithDiscount += item.subtotalWithDiscount;

            row.innerHTML = `
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>R$ ${item.unitPriceOriginal.toFixed(2)}</td>
                <td>${item.discountPercent.toFixed(2)}%</td>
                <td>R$ ${item.unitPriceWithDiscount.toFixed(2)}</td>
                <td>R$ ${item.subtotalWithDiscount.toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm remove-product-btn" data-index="${index}">Remover</button>
                </td>
            `;
        });

        productsSubtotalOriginalDisplay.textContent = `R$ ${totalSubtotalOriginal.toFixed(2)}`;
        productsTotalDiscountDisplay.textContent = `R$ ${totalDiscount.toFixed(2)}`;
        productsSubtotalWithDiscountDisplay.textContent = `R$ ${totalSubtotalWithDiscount.toFixed(2)}`;

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
            resetForm(); // Reseta o formulário se o ticket não for encontrado
        }
    };

    // Exclui um ticket (agora esta função é chamada apenas pelo botão de delete no formulário de edição)
    const deleteTicket = (id) => {
        if (confirm(`Tem certeza que deseja excluir o ticket "${id}"?`)) {
            let tickets = loadTickets();
            delete tickets[id];
            saveTickets(tickets);
            formMessage.textContent = `Ticket "${id}" excluído com sucesso!`;
            formMessage.classList.remove('error-message');
            formMessage.classList.add('success-message');
            resetForm(); // Reseta o formulário após exclusão
            // O ideal aqui seria redirecionar para a lista de tickets
            // loadContent('manage_tickets.html', 'js/manage_tickets.js', 'Gerenciar Tickets');
        }
    };

    // Reseta o formulário para o estado inicial (novo ticket)
    const resetForm = () => {
        ticketForm.reset();
        ticketIdInput.value = generateTicketId();
        openingDateInput.value = new Date().toISOString().split('T')[0];
        currentTicketProducts = [];
        renderProductsTable();

        // Habilita todos os campos para um novo ticket (Admin/Tecnico ou Cliente abrindo)
        ticketIdInput.disabled = true; // ID sempre desabilitado
        openingDateInput.disabled = true; // Data de abertura sempre desabilitada
        clientIdSelect.disabled = false;
        equipmentIdSelect.disabled = false;
        problemDescriptionTextarea.disabled = false;

        // Campos de atendimento técnico (desabilitados por padrão para novo ticket)
        technicianIdSelect.disabled = true;
        scheduledDateInput.disabled = true;
        serviceDateInput.disabled = true;
        diagnosisTextarea.disabled = true;
        solutionTextarea.disabled = true;
        hasWarrantyTicketSelect.disabled = true;
        warrantyEndDateTicketInput.disabled = true;
        billingDueDateInput.disabled = true;
        statusSelect.disabled = true; // Status inicial é "Pendente" ou "Aguardando Aprovação"

        // Campos de produto
        productIdSelect.disabled = false;
        productQuantityInput.disabled = false;
        productDiscountInput.disabled = false; // Habilita o campo de desconto
        addProductBtn.disabled = false;
        productsTableBody.querySelectorAll('.remove-product-btn').forEach(btn => btn.disabled = false);

        // Botões de ação
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

    // Popula selects
    populateClientSelect();
    populateTechnicianSelect();
    populateProductSelect(); 

    // Verifica se há um ticket para edição vindo do localStorage (da lista de tickets)
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
    productDiscountInput.addEventListener('input', updateProductPriceFields);
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
        // Após salvar/atualizar, o ideal é redirecionar para a lista de tickets ou resetar o formulário
        resetForm();
        // Se você quiser redirecionar para a lista de tickets após salvar/atualizar:
        // loadContent('manage_tickets.html', 'js/manage_tickets.js', 'Gerenciar Tickets');
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
        // Se estiver em modo de edição e cancelar, pode ser útil voltar para a lista
        // if (editingTicketId) {
        //     loadContent('manage_tickets.html', 'js/manage_tickets.js', 'Gerenciar Tickets');
        // }
    });

    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (editingTicketId) {
            deleteTicket(editingTicketId);
        }
    });
});