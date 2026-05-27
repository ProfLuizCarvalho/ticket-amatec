// js/register_equipment.js - Versão Atualizada com campos específicos e vinculação de cliente

document.addEventListener('DOMContentLoaded', () => {
    const equipmentRegistrationForm = document.getElementById('equipmentRegistrationForm');
    const formMessage = document.getElementById('formMessage');
    const equipmentGridBody = document.querySelector('#equipmentGrid tbody');

    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const deleteButton = document.getElementById('deleteButton');

    // Referências aos campos do formulário
    const equipmentIdInput = document.getElementById('equipmentId');
    const registrationDateInput = document.getElementById('registrationDate');
    const purchaseDateInput = document.getElementById('purchaseDate');
    const equipmentTypeSelect = document.getElementById('equipmentType');
    const equipmentNameInput = document.getElementById('equipmentName');
    const brandInput = document.getElementById('brand');
    const hasWarrantySelect = document.getElementById('hasWarranty');
    const warrantyEndDateInput = document.getElementById('warrantyEndDate');
    const warrantyEndDateGroup = document.getElementById('warrantyEndDateGroup'); // O div do campo de data de garantia
    const usedValueInput = document.getElementById('usedValue');
    const patrimonyNumberInput = document.getElementById('patrimonyNumber');
    const statusSelect = document.getElementById('status');
    const clientIdSelect = document.getElementById('clientId');
    const clientNameDisplayInput = document.getElementById('clientNameDisplay');

    let editingEquipmentId = null; // Armazena o ID do equipamento que está sendo editado
    let allClients = {}; // Armazena todos os clientes para fácil consulta

    // --- Funções de Carregamento/Salvamento ---
    const loadEquipments = () => {
        return JSON.parse(localStorage.getItem('appEquipments')) || {};
    };

    const saveEquipments = (equipments) => {
        localStorage.setItem('appEquipments', JSON.stringify(equipments));
    };

    const loadClients = () => {
        return JSON.parse(localStorage.getItem('appClients')) || {};
    };

    // --- Lógica de UI ---

    // Função para popular o select de clientes
    const populateClientSelect = () => {
        allClients = loadClients(); // Carrega todos os clientes
        clientIdSelect.innerHTML = '<option value="">Selecione um Cliente</option>'; // Limpa e adiciona opção padrão

        // Converte o objeto de clientes em um array para ordenar e iterar
        const clientArray = Object.keys(allClients).map(id => ({ id, ...allClients[id] }));
        clientArray.sort((a, b) => (a.clientName || a.tradeName).localeCompare(b.clientName || b.tradeName)); // Ordena por nome

        clientArray.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.clientName || client.tradeName; // Exibe nome ou razão social
            clientIdSelect.appendChild(option);
        });
    };

    // Função para atualizar o campo de exibição do nome do cliente
    const updateClientNameDisplay = () => {
        const selectedClientId = clientIdSelect.value;
        if (selectedClientId && allClients[selectedClientId]) {
            clientNameDisplayInput.value = allClients[selectedClientId].clientName || allClients[selectedClientId].tradeName;
        } else {
            clientNameDisplayInput.value = '';
        }
    };

    // Função para alternar a visibilidade do campo de Data Fim da Garantia
    const toggleWarrantyEndDateField = () => {
        if (hasWarrantySelect.value === 'Sim') {
            warrantyEndDateGroup.style.display = 'block';
            warrantyEndDateInput.setAttribute('required', 'required');
        } else {
            warrantyEndDateGroup.style.display = 'none';
            warrantyEndDateInput.removeAttribute('required');
            warrantyEndDateInput.value = ''; // Limpa o campo se a garantia for "Não"
        }
    };

    // --- Funções de CRUD ---

    // Função para renderizar a grid de equipamentos
    const renderEquipmentGrid = () => {
        const equipments = loadEquipments();
        equipmentGridBody.innerHTML = '';

        const equipmentArray = Object.keys(equipments).map(id => ({ id, ...equipments[id] }));

        equipmentArray.forEach(eq => {
            const row = equipmentGridBody.insertRow();
            row.dataset.equipmentId = eq.id;

            const clientName = eq.clientId && allClients[eq.clientId] ? (allClients[eq.clientId].clientName || allClients[eq.clientId].tradeName) : 'N/A';

            row.insertCell().textContent = eq.id;
            row.insertCell().textContent = eq.equipmentName;
            row.insertCell().textContent = eq.equipmentType;
            row.insertCell().textContent = eq.brand;
            row.insertCell().textContent = clientName;
            row.insertCell().textContent = eq.status;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('grid-actions');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('btn-edit-grid');
            editBtn.addEventListener('click', () => editEquipment(eq.id));
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('btn-delete-grid');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteEquipment(eq.id);
            });
            actionsCell.appendChild(deleteBtn);
        });
    };

    // Função para preencher o formulário com dados de um equipamento para edição
    const editEquipment = (id) => {
        const equipments = loadEquipments();
        const eqToEdit = equipments[id];

        if (eqToEdit) {
            equipmentIdInput.value = eqToEdit.id;
            registrationDateInput.value = eqToEdit.registrationDate;
            purchaseDateInput.value = eqToEdit.purchaseDate;
            equipmentTypeSelect.value = eqToEdit.equipmentType;
            equipmentNameInput.value = eqToEdit.equipmentName;
            brandInput.value = eqToEdit.brand;
            hasWarrantySelect.value = eqToEdit.hasWarranty;
            warrantyEndDateInput.value = eqToEdit.warrantyEndDate;
            usedValueInput.value = eqToEdit.usedValue;
            patrimonyNumberInput.value = eqToEdit.patrimonyNumber;
            statusSelect.value = eqToEdit.status;
            clientIdSelect.value = eqToEdit.clientId;

            equipmentIdInput.disabled = true;

            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';

            editingEquipmentId = id;
            formMessage.textContent = '';

            toggleWarrantyEndDateField(); // Atualiza visibilidade da garantia
            updateClientNameDisplay(); // Atualiza nome do cliente
        }
    };

    // Função para excluir um equipamento
    const deleteEquipment = (id) => {
        if (confirm(`Tem certeza que deseja excluir o equipamento "${id}"?`)) {
            let equipments = loadEquipments();
            delete equipments[id];
            saveEquipments(equipments);
            renderEquipmentGrid();
            resetForm();
            formMessage.textContent = `Equipamento "${id}" excluído com sucesso.`;
            formMessage.classList.remove('error-message');
            formMessage.classList.add('success-message');
        }
    };

    // Função para resetar o formulário e o estado de edição
    const resetForm = () => {
        equipmentRegistrationForm.reset();
        equipmentIdInput.disabled = false;

        saveButton.style.display = 'inline-block';
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
        cancelButton.style.display = 'none';

        editingEquipmentId = null;
        formMessage.textContent = '';

        // Garante que a data de cadastro seja a data atual ao resetar
        registrationDateInput.valueAsDate = new Date(); 

        toggleWarrantyEndDateField(); // Esconde o campo de data de garantia
        updateClientNameDisplay(); // Limpa o nome do cliente
    };

    // --- Inicialização e Event Listeners ---

    // Popula o select de clientes e renderiza a grid ao carregar a página
    populateClientSelect();
    renderEquipmentGrid();
    resetForm(); // Garante que o formulário comece limpo e com a data de cadastro preenchida

    // Event listeners para mudanças nos selects
    clientIdSelect.addEventListener('change', updateClientNameDisplay);
    hasWarrantySelect.addEventListener('change', toggleWarrantyEndDateField);

    // Event Listener para o formulário (Salvar/Atualizar)
    equipmentRegistrationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const equipmentId = equipmentIdInput.value;
        const registrationDate = registrationDateInput.value;
        const purchaseDate = purchaseDateInput.value;
        const equipmentType = equipmentTypeSelect.value;
        const equipmentName = equipmentNameInput.value;
        const brand = brandInput.value;
        const hasWarranty = hasWarrantySelect.value;
        const warrantyEndDate = warrantyEndDateInput.value;
        const usedValue = usedValueInput.value ? parseFloat(usedValueInput.value) : null;
        const patrimonyNumber = patrimonyNumberInput.value;
        const status = statusSelect.value;
        const clientId = clientIdSelect.value;

        // Validações
        if (!equipmentId || !registrationDate || !equipmentType || !equipmentName || !status || !clientId) {
            formMessage.textContent = 'Por favor, preencha todos os campos obrigatórios (ID, Data de Cadastro, Tipo, Nome, Status, Cliente Vinculado).';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }
        if (hasWarranty === 'Sim' && !warrantyEndDate) {
            formMessage.textContent = 'Por favor, informe a Data Fim da Garantia.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }
        if (usedValue !== null && usedValue < 0) {
            formMessage.textContent = 'Valor Usado não pode ser negativo.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }

        let equipments = loadEquipments();
        let equipmentData = {
            id: equipmentId,
            registrationDate,
            purchaseDate,
            equipmentType,
            equipmentName,
            brand,
            hasWarranty,
            warrantyEndDate: hasWarranty === 'Sim' ? warrantyEndDate : '', // Salva vazio se não tiver garantia
            usedValue,
            patrimonyNumber,
            status,
            clientId
        };

        if (editingEquipmentId === null) { // Modo de Cadastro (novo equipamento)
            if (equipments[equipmentId]) {
                formMessage.textContent = 'ID de equipamento já existe. Escolha outro.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
            equipments[equipmentId] = equipmentData;
            saveEquipments(equipments);
            formMessage.textContent = `Equipamento "${equipmentName}" cadastrado com sucesso!`;
        } else { // Modo de Edição (atualizar equipamento existente)
            const eqToUpdate = equipments[editingEquipmentId];
            if (eqToUpdate) {
                equipments[editingEquipmentId] = { ...equipmentData, id: editingEquipmentId };
                saveEquipments(equipments);
                formMessage.textContent = `Equipamento "${equipmentName}" atualizado com sucesso!`;
            } else {
                formMessage.textContent = 'Erro: Equipamento não encontrado para atualização.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
        }

        formMessage.classList.remove('error-message');
        formMessage.classList.add('success-message');
        renderEquipmentGrid();
        resetForm();
    });

    // Event Listeners para os botões de ação
    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        equipmentRegistrationForm.dispatchEvent(new Event('submit'));
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
        if (editingEquipmentId) {
            deleteEquipment(editingEquipmentId);
        }
    });

    // Event listener para cliques nas linhas da grid para edição
    equipmentGridBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.equipmentId) {
            editEquipment(row.dataset.equipmentId);
        }
    });
});