// js/billing_module.js - Versão COMPLETA e ATUALIZADA

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do Dashboard de Resumo ---
    const totalBilledThisMonth = document.getElementById('totalBilledThisMonth');
    const pendingInvoicesCount = document.getElementById('pendingInvoicesCount');
    // const pieChartPlaceholder = document.querySelector('.pie-chart-placeholder'); // Para futura implementação de gráfico real

    // --- Elementos da Lista de Faturas Recentes ---
    const recentInvoicesTableBody = document.getElementById('recentInvoicesTableBody');

    // --- Elementos do Formulário de Criação de Fatura ---
    const newInvoiceBtn = document.getElementById('newInvoiceBtn');
    const createInvoiceFormContainer = document.getElementById('createInvoiceFormContainer');
    const closeCreateInvoiceForm = document.getElementById('closeCreateInvoiceForm');
    const invoiceClientSelect = document.getElementById('invoiceClientSelect');
    const invoiceProjectSelect = document.getElementById('invoiceProjectSelect'); // Assumindo que "Projeto" pode ser o ticket ou um grupo de tickets
    const invoiceItemsTableBody = document.getElementById('invoiceItemsTableBody');
    const addInvoiceItemBtn = document.getElementById('addInvoiceItemBtn');
    const addTicketsToInvoiceBtn = document.getElementById('addTicketsToInvoiceBtn');
    // REMOVIDOS: invoiceSubtotal e invoiceTaxes
    const invoiceTotalGeneral = document.getElementById('invoiceTotalGeneral');
    const invoicePaymentMethod = document.getElementById('invoicePaymentMethod');
    const invoiceNotes = document.getElementById('invoiceNotes');
    const saveInvoiceDraftBtn = document.getElementById('saveInvoiceDraftBtn');
    const emitInvoiceBtn = document.getElementById('emitInvoiceBtn');

    // --- Dados em Memória ---
    let allTickets = {};
    let allClients = {};
    let allProducts = {};
    let allInvoices = {}; // Armazenará as faturas geradas
    let currentInvoiceItems = []; // Itens da fatura sendo criada/editada
    let selectedTicketsForInvoice = []; // Tickets selecionados para serem faturados

    // --- Funções de Carregamento/Salvamento de Dados ---
    const loadTickets = () => JSON.parse(localStorage.getItem('appTickets')) || {};
    const loadClients = () => JSON.parse(localStorage.getItem('appClients')) || {};
    const loadProducts = () => JSON.parse(localStorage.getItem('appProducts')) || {};
    const loadInvoices = () => JSON.parse(localStorage.getItem('appInvoices')) || {};
    const saveInvoices = (invoices) => localStorage.setItem('appInvoices', JSON.stringify(invoices));

    // --- Funções Auxiliares ---
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
        return date.toLocaleDateString('pt-BR');
    };

    const getClientName = (clientId) => {
        const client = allClients[clientId];
        return client ? (client.clientName || client.tradeName) : 'N/A';
    };

    const getProductName = (productId) => {
        const product = allProducts[productId];
        return product ? product.productName : 'N/A';
    };

    // --- Funções de Renderização do Dashboard de Resumo ---
    const renderSummaryCards = () => {
        allInvoices = loadInvoices();
        allTickets = loadTickets();

        let totalBilled = 0;
        let pendingCount = 0;
        let pendingAmount = 0;
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        Object.values(allInvoices).forEach(invoice => {
            const invoiceDate = new Date(invoice.issueDate + 'T00:00:00');
            if (invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear) {
                totalBilled += invoice.totalGeneral;
            }
            if (invoice.status === 'pending' || invoice.status === 'overdue') {
                pendingCount++;
                pendingAmount += invoice.totalGeneral;
            }
        });

        totalBilledThisMonth.textContent = formatCurrency(totalBilled);
        pendingInvoicesCount.textContent = `${pendingCount} faturas / ${formatCurrency(pendingAmount)}`;

        // Implementar lógica de trend-indicator e pie-chart-placeholder se houver dados históricos
        // Por enquanto, apenas placeholders
    };

    // --- Funções de Renderização da Lista de Faturas Recentes ---
    const renderRecentInvoices = () => {
        recentInvoicesTableBody.innerHTML = '';
        allInvoices = loadInvoices();
        allClients = loadClients(); // Garante que os clientes estão carregados

        const invoicesArray = Object.values(allInvoices).sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)); // Mais recentes primeiro

        if (invoicesArray.length === 0) {
            const row = recentInvoicesTableBody.insertRow();
            row.innerHTML = `<td colspan="6">Nenhuma fatura encontrada.</td>`;
            return;
        }

        invoicesArray.slice(0, 10).forEach(invoice => { // Mostra as 10 faturas mais recentes
            const row = recentInvoicesTableBody.insertRow();
            const clientName = getClientName(invoice.clientId);
            const statusClass = invoice.status.toLowerCase().replace(' ', '-'); // Ex: "pending" -> "pending"

            row.innerHTML = `
                <td>${invoice.id}</td>
                <td>${formatDate(invoice.issueDate)}</td>
                <td>${clientName}</td>
                <td>${formatCurrency(invoice.totalGeneral)}</td>
                <td><span class="invoice-status ${statusClass}">${invoice.status}</span></td>
                <td>
                    <button class="btn btn-info btn-sm view-invoice-btn" data-invoice-id="${invoice.id}">Ver</button>
                    <button class="btn btn-secondary btn-sm edit-invoice-btn" data-invoice-id="${invoice.id}">Editar</button>
                </td>
            `;
        });

        // Adicionar event listeners para os botões "Ver" e "Editar"
        recentInvoicesTableBody.querySelectorAll('.view-invoice-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const invoiceId = event.target.dataset.invoiceId;
                // Implementar lógica para visualizar detalhes da fatura
                alert(`Visualizar fatura ${invoiceId}`);
            });
        });

        recentInvoicesTableBody.querySelectorAll('.edit-invoice-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const invoiceId = event.target.dataset.invoiceId;
                // Implementar lógica para editar fatura
                alert(`Editar fatura ${invoiceId}`);
            });
        });
    };

    // --- Funções do Formulário de Criação de Fatura ---

    // Popula o select de clientes
    const populateClientSelect = () => {
        allClients = loadClients();
        invoiceClientSelect.innerHTML = '<option value="">Selecionar Cliente</option>';
        Object.values(allClients).forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.clientName || client.tradeName;
            invoiceClientSelect.appendChild(option);
        });
    };

    // Popula o select de projetos (tickets finalizados para o cliente selecionado)
    const populateProjectSelect = (clientId) => {
        invoiceProjectSelect.innerHTML = '<option value="">Selecionar Projeto</option>';
        if (!clientId) return;

        allTickets = loadTickets();
        const finalizadosTickets = Object.values(allTickets).filter(
            ticket => ticket.clientId === clientId && ticket.status === 'Finalizada'
        );

        finalizadosTickets.forEach(ticket => {
            const option = document.createElement('option');
            option.value = ticket.id;
            option.textContent = `Ticket ${ticket.id} - ${ticket.problemDescription.substring(0, 30)}...`;
            invoiceProjectSelect.appendChild(option);
        });
    };

    // Adiciona um item à fatura (manual ou de um ticket)
    const addInvoiceItem = (item = {}) => {
        const newItem = {
            id: item.id || `item-${Date.now()}`,
            description: item.description || 'Novo Item',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            total: item.total || 0,
            productId: item.productId || null, // Se for um produto
            ticketId: item.ticketId || null // Se for de um ticket
        };
        currentInvoiceItems.push(newItem);
        renderInvoiceItems();
        calculateInvoiceTotals();
    };

    // Renderiza os itens da fatura na tabela
    const renderInvoiceItems = () => {
        invoiceItemsTableBody.innerHTML = '';
        currentInvoiceItems.forEach(item => {
            const row = invoiceItemsTableBody.insertRow();
            row.dataset.itemId = item.id;
            row.innerHTML = `
                <td>${item.description}</td>
                <td><input type="number" value="${item.quantity}" min="1" class="item-quantity-input" data-item-id="${item.id}" style="width: 60px;"></td>
                <td><input type="text" value="${formatCurrency(item.unitPrice)}" class="item-unitprice-input" data-item-id="${item.id}" style="width: 100px;"></td>
                <td>${formatCurrency(item.total)}</td>
                <td><button class="btn btn-danger btn-sm remove-item-btn" data-item-id="${item.id}">X</button></td>
            `;
        });

        // Adicionar event listeners para inputs de quantidade e preço
        invoiceItemsTableBody.querySelectorAll('.item-quantity-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const itemId = event.target.dataset.itemId;
                const newQuantity = parseInt(event.target.value);
                const itemIndex = currentInvoiceItems.findIndex(i => i.id === itemId);
                if (itemIndex !== -1 && !isNaN(newQuantity) && newQuantity > 0) {
                    currentInvoiceItems[itemIndex].quantity = newQuantity;
                    currentInvoiceItems[itemIndex].total = currentInvoiceItems[itemIndex].quantity * currentInvoiceItems[itemIndex].unitPrice;
                    renderInvoiceItems();
                    calculateInvoiceTotals();
                }
            });
        });

        invoiceItemsTableBody.querySelectorAll('.item-unitprice-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const itemId = event.target.dataset.itemId;
                const newPrice = parseFloat(event.target.value.replace(/[R$,.]/g, '').replace(',', '.')); // Limpa e converte
                const itemIndex = currentInvoiceItems.findIndex(i => i.id === itemId);
                if (itemIndex !== -1 && !isNaN(newPrice) && newPrice >= 0) {
                    currentInvoiceItems[itemIndex].unitPrice = newPrice;
                    currentInvoiceItems[itemIndex].total = currentInvoiceItems[itemIndex].quantity * currentInvoiceItems[itemIndex].unitPrice;
                    renderInvoiceItems();
                    calculateInvoiceTotals();
                }
            });
        });

        // Adicionar event listeners para botões de remover item
        invoiceItemsTableBody.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.dataset.itemId;
                currentInvoiceItems = currentInvoiceItems.filter(item => item.id !== itemId);
                renderInvoiceItems();
                calculateInvoiceTotals();
            });
        });
    };

    // Calcula os totais da fatura
    const calculateInvoiceTotals = () => {
        let subtotal = 0;
        currentInvoiceItems.forEach(item => {
            subtotal += item.total;
        });

        // Simples cálculo de impostos (ex: 10% do subtotal)
        const taxes = subtotal * 0.10;
        const totalGeneral = subtotal + taxes;

        // REMOVIDOS: invoiceSubtotal.textContent e invoiceTaxes.textContent
        invoiceTotalGeneral.textContent = formatCurrency(totalGeneral);
    };

    // Abre/Fecha o formulário de criação de fatura
    const toggleCreateInvoiceForm = (show = true) => {
        if (show) {
            createInvoiceFormContainer.style.display = 'block';
            // Resetar formulário ao abrir
            resetCreateInvoiceForm();
            populateClientSelect();
            // Habilitar campos
            invoiceClientSelect.disabled = false;
            invoiceProjectSelect.disabled = false;
            addInvoiceItemBtn.disabled = false;
            addTicketsToInvoiceBtn.disabled = false;
            invoicePaymentMethod.disabled = false;
            invoiceNotes.disabled = false;
            saveInvoiceDraftBtn.disabled = false;
            emitInvoiceBtn.disabled = false;
        } else {
            createInvoiceFormContainer.style.display = 'none';
            // Desabilitar campos ao fechar
            invoiceClientSelect.disabled = true;
            invoiceProjectSelect.disabled = true;
            addInvoiceItemBtn.disabled = true;
            addTicketsToInvoiceBtn.disabled = true;
            invoicePaymentMethod.disabled = true;
            invoiceNotes.disabled = true;
            saveInvoiceDraftBtn.disabled = true;
            emitInvoiceBtn.disabled = true;
        }
    };

    // Reseta o formulário de criação de fatura
    const resetCreateInvoiceForm = () => {
        invoiceClientSelect.value = '';
        invoiceProjectSelect.innerHTML = '<option value="">Selecionar Projeto</option>';
        currentInvoiceItems = [];
        selectedTicketsForInvoice = [];
        renderInvoiceItems();
        calculateInvoiceTotals();
        invoicePaymentMethod.value = '';
        invoiceNotes.value = '';
    };

    // --- Lógica de Geração/Emissão de Fatura ---
    const generateInvoiceId = () => {
        const invoices = loadInvoices();
        const lastId = Object.keys(invoices).reduce((max, id) => {
            const num = parseInt(id.replace('INV-', ''));
            return num > max ? num : max;
        }, 0);
        return `INV-${String(lastId + 1).padStart(4, '0')}`;
    };

    const emitInvoice = (status = 'pending') => {
        const clientId = invoiceClientSelect.value;
        if (!clientId) {
            alert('Por favor, selecione um cliente para a fatura.');
            return;
        }
        if (currentInvoiceItems.length === 0) {
            alert('A fatura deve conter pelo menos um item.');
            return;
        }

        const newInvoiceId = generateInvoiceId();
        const issueDate = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const dueDateString = dueDate.toISOString().split('T')[0];

        // Recalcular os totais para garantir que os valores estejam corretos antes de salvar
        let subtotal = 0;
        currentInvoiceItems.forEach(item => {
            subtotal += item.total;
        });
        const taxes = subtotal * 0.10;
        const totalGeneral = subtotal + taxes;

        const newInvoice = {
            id: newInvoiceId,
            clientId: clientId,
            issueDate: issueDate,
            dueDate: dueDateString,
            items: currentInvoiceItems,
            // REMOVIDOS: subtotal e taxes do objeto da fatura se não forem mais necessários
            // subtotal: subtotal,
            // taxes: taxes,
            totalGeneral: totalGeneral,
            paymentMethod: invoicePaymentMethod.value,
            notes: invoiceNotes.value,
            status: status, // 'pending' ou 'draft'
            associatedTickets: selectedTicketsForInvoice.map(t => t.id)
        };

        let invoices = loadInvoices();
        invoices[newInvoiceId] = newInvoice;
        saveInvoices(invoices);

        // Atualizar status dos tickets associados para 'Faturada'
        let tickets = loadTickets();
        selectedTicketsForInvoice.forEach(ticket => {
            if (tickets[ticket.id]) {
                tickets[ticket.id].status = 'Faturada';
            }
        });
        localStorage.setItem('appTickets', JSON.stringify(tickets));


        alert(`Fatura ${newInvoiceId} ${status === 'draft' ? 'salva como rascunho' : 'emitida'} com sucesso!`);
        toggleCreateInvoiceForm(false); // Fecha o formulário
        renderSummaryCards();
        renderRecentInvoices();
    };

    // --- Event Listeners ---
    newInvoiceBtn.addEventListener('click', () => toggleCreateInvoiceForm(true));
    closeCreateInvoiceForm.addEventListener('click', () => toggleCreateInvoiceForm(false));

    invoiceClientSelect.addEventListener('change', (event) => {
        const clientId = event.target.value;
        populateProjectSelect(clientId);
        // Limpa itens e tickets selecionados ao mudar de cliente
        currentInvoiceItems = [];
        selectedTicketsForInvoice = [];
        renderInvoiceItems();
        calculateInvoiceTotals();
    });

    // Evento para adicionar um item manual
    addInvoiceItemBtn.addEventListener('click', () => {
        addInvoiceItem({
            description: 'Serviço/Produto Manual',
            quantity: 1,
            unitPrice: 0,
            total: 0
        });
    });

    // Evento para adicionar tickets à fatura
    addTicketsToInvoiceBtn.addEventListener('click', () => {
        const clientId = invoiceClientSelect.value;
        if (!clientId) {
            alert('Por favor, selecione um cliente primeiro.');
            return;
        }

        const selectedTicketId = invoiceProjectSelect.value;
        if (selectedTicketId && !selectedTicketsForInvoice.some(t => t.id === selectedTicketId)) {
            const ticket = allTickets[selectedTicketId];
            if (ticket && ticket.status === 'Finalizada') {
                selectedTicketsForInvoice.push(ticket);
                // Adicionar produtos do ticket como itens da fatura
                ticket.productsSold.forEach(product => {
                    addInvoiceItem({
                        id: `prod-${product.productId}-${ticket.id}`, // ID único para o item da fatura
                        description: `${getProductName(product.productId)} (Ticket ${ticket.id})`,
                        quantity: product.quantity,
                        unitPrice: product.unitPriceWithDiscount,
                        total: product.subtotalWithDiscount,
                        productId: product.productId,
                        ticketId: ticket.id
                    });
                });
                // Remover o ticket do select para evitar duplicação
                invoiceProjectSelect.querySelector(`option[value="${selectedTicketId}"]`).remove();
                invoiceProjectSelect.value = ''; // Reseta a seleção
            } else {
                alert('Ticket não encontrado ou não está no status "Finalizada".');
            }
        } else if (selectedTicketId) {
            alert('Este ticket já foi adicionado à fatura.');
        } else {
            alert('Por favor, selecione um ticket para adicionar.');
        }
    });

    saveInvoiceDraftBtn.addEventListener('click', () => emitInvoice('draft'));
    emitInvoiceBtn.addEventListener('click', () => emitInvoice('pending'));

    // --- Inicialização ---
    const initializeBillingModule = () => {
        allClients = loadClients();
        allProducts = loadProducts();
        allTickets = loadTickets(); // Carrega tickets para uso em populateProjectSelect e emitInvoice

        renderSummaryCards();
        renderRecentInvoices();
        toggleCreateInvoiceForm(false); // Garante que o formulário de criação esteja fechado inicialmente
    };

    initializeBillingModule();
});