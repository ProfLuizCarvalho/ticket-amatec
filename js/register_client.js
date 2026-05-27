// js/register_client.js - Versão Detalhada (Ordem Padronizada de Botões)

document.addEventListener('DOMContentLoaded', () => {
    const clientRegistrationForm = document.getElementById('clientRegistrationForm');
    const formMessage = document.getElementById('formMessage');
    const clientGridBody = document.querySelector('#clientGrid tbody');

    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const deleteButton = document.getElementById('deleteButton');

    // Referências aos campos do formulário
    const clientIdInput = document.getElementById('clientId');
    const clientTypeSelect = document.getElementById('clientType');
    const clientNameInput = document.getElementById('clientName');
    const contactPersonInput = document.getElementById('contactPerson');
    const emailInput = document.getElementById('email');
    const mainPhoneInput = document.getElementById('mainPhone');
    const secondaryPhoneInput = document.getElementById('secondaryPhone');
    const streetInput = document.getElementById('street');
    const numberInput = document.getElementById('number');
    const neighborhoodInput = document.getElementById('neighborhood');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const zipCodeInput = document.getElementById('zipCode');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const creditLimitInput = document.getElementById('creditLimit');
    const registrationDateInput = document.getElementById('registrationDate');
    const statusSelect = document.getElementById('status');
    const originInput = document.getElementById('origin');
    const notesTextarea = document.getElementById('notes');

    // Campos Pessoa Física
    const cpfInput = document.getElementById('cpf');
    const birthDateInput = document.getElementById('birthDate');
    const genderSelect = document.getElementById('gender');
    const pfFields = document.querySelectorAll('.pf-field');

    // Campos Pessoa Jurídica
    const cnpjInput = document.getElementById('cnpj');
    const tradeNameInput = document.getElementById('tradeName');
    const stateRegistrationInput = document.getElementById('stateRegistration');
    const pjFields = document.querySelectorAll('.pj-field');

    let editingClientId = null; // Armazena o ID do cliente que está sendo editado

    // Função para carregar clientes do localStorage
    const loadClients = () => {
        return JSON.parse(localStorage.getItem('appClients')) || {};
    };

    // Função para salvar clientes no localStorage
    const saveClients = (clients) => {
        localStorage.setItem('appClients', JSON.stringify(clients));
    };

    // Função para alternar a visibilidade dos campos PF/PJ
    const toggleClientTypeFields = () => {
        const clientType = clientTypeSelect.value;

        pfFields.forEach(field => {
            field.style.display = clientType === 'PF' ? 'block' : 'none';
            // Limpa os campos quando escondidos para evitar envio de dados incorretos
            if (clientType !== 'PF') {
                field.querySelectorAll('input, select').forEach(input => input.value = '');
            }
        });

        pjFields.forEach(field => {
            field.style.display = clientType === 'PJ' ? 'block' : 'none';
            // Limpa os campos quando escondidos
            if (clientType !== 'PJ') {
                field.querySelectorAll('input, select').forEach(input => input.value = '');
            }
        });

        // O campo Pessoa de Contato é específico de PJ
        document.getElementById('contactPersonGroup').style.display = clientType === 'PJ' ? 'block' : 'none';
        if (clientType !== 'PJ') contactPersonInput.value = '';
    };

    // Event listener para o select de Tipo de Cliente
    clientTypeSelect.addEventListener('change', toggleClientTypeFields);

    // Função para renderizar a grid de clientes
    const renderClientGrid = () => {
        const clients = loadClients();
        clientGridBody.innerHTML = ''; // Limpa a grid antes de renderizar

        const clientArray = Object.keys(clients).map(id => ({ id, ...clients[id] }));

        clientArray.forEach(client => {
            const row = clientGridBody.insertRow();
            row.dataset.clientId = client.id; // Armazena o ID na linha

            row.insertCell().textContent = client.id;
            row.insertCell().textContent = client.clientName || client.tradeName; // Nome ou Razão Social
            row.insertCell().textContent = client.clientType;
            row.insertCell().textContent = client.email;
            row.insertCell().textContent = client.mainPhone;
            row.insertCell().textContent = client.status;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('grid-actions');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('btn-edit-grid');
            editBtn.addEventListener('click', () => editClient(client.id));
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('btn-delete-grid');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteClient(client.id);
            });
            actionsCell.appendChild(deleteBtn);
        });
    };

    // Função para preencher o formulário com dados de um cliente para edição
    const editClient = (id) => {
        const clients = loadClients();
        const clientToEdit = clients[id];

        if (clientToEdit) {
            clientIdInput.value = clientToEdit.id;
            clientTypeSelect.value = clientToEdit.clientType;
            clientNameInput.value = clientToEdit.clientName || clientToEdit.tradeName; // Nome ou Razão Social
            contactPersonInput.value = clientToEdit.contactPerson || '';
            emailInput.value = clientToEdit.email;
            mainPhoneInput.value = clientToEdit.mainPhone;
            secondaryPhoneInput.value = clientToEdit.secondaryPhone || '';
            streetInput.value = clientToEdit.address?.street || '';
            numberInput.value = clientToEdit.address?.number || '';
            neighborhoodInput.value = clientToEdit.address?.neighborhood || '';
            cityInput.value = clientToEdit.address?.city || '';
            stateInput.value = clientToEdit.address?.state || '';
            zipCodeInput.value = clientToEdit.address?.zipCode || '';
            paymentMethodSelect.value = clientToEdit.paymentMethod || '';
            creditLimitInput.value = clientToEdit.creditLimit || '';
            registrationDateInput.value = clientToEdit.registrationDate || '';
            statusSelect.value = clientToEdit.status;
            originInput.value = clientToEdit.origin || '';
            notesTextarea.value = clientToEdit.notes || '';

            // Campos PF
            cpfInput.value = clientToEdit.cpf || '';
            birthDateInput.value = clientToEdit.birthDate || '';
            genderSelect.value = clientToEdit.gender || '';

            // Campos PJ
            cnpjInput.value = clientToEdit.cnpj || '';
            tradeNameInput.value = clientToEdit.tradeName || '';
            stateRegistrationInput.value = clientToEdit.stateRegistration || '';

            clientIdInput.disabled = true; // Não permite mudar o ID em edição

            // Visibilidade dos botões no modo de edição
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';

            editingClientId = id;
            formMessage.textContent = '';
            toggleClientTypeFields(); // Atualiza a visibilidade dos campos PF/PJ
        }
    };

    // Função para excluir um cliente
    const deleteClient = (id) => {
        if (confirm(`Tem certeza que deseja excluir o cliente "${id}"?`)) {
            let clients = loadClients();
            delete clients[id];
            saveClients(clients);
            renderClientGrid();
            resetForm();
            formMessage.textContent = `Cliente "${id}" excluído com sucesso.`;
            formMessage.classList.remove('error-message');
            formMessage.classList.add('success-message');
        }
    };

    // Função para resetar o formulário e o estado de edição
    const resetForm = () => {
        clientRegistrationForm.reset();
        clientIdInput.disabled = false;

        // Visibilidade dos botões no modo de cadastro (inicial)
        saveButton.style.display = 'inline-block';
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
        cancelButton.style.display = 'none';

        editingClientId = null;
        formMessage.textContent = '';
        toggleClientTypeFields(); // Esconde os campos PF/PJ até que um tipo seja selecionado
    };

    // Inicializa a grid e o formulário
    renderClientGrid();
    resetForm(); // Garante que o formulário comece limpo e com campos PF/PJ escondidos

    // Event Listener para o formulário (Salvar/Atualizar)
    clientRegistrationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const clientId = clientIdInput.value;
        const clientType = clientTypeSelect.value;
        const clientName = clientNameInput.value;
        const contactPerson = contactPersonInput.value;
        const email = emailInput.value;
        const mainPhone = mainPhoneInput.value;
        const secondaryPhone = secondaryPhoneInput.value;
        const street = streetInput.value;
        const number = numberInput.value;
        const neighborhood = neighborhoodInput.value;
        const city = cityInput.value;
        const state = stateInput.value;
        const zipCode = zipCodeInput.value;
        const paymentMethod = paymentMethodSelect.value;
        const creditLimit = creditLimitInput.value ? parseFloat(creditLimitInput.value) : null;
        const registrationDate = registrationDateInput.value;
        const status = statusSelect.value;
        const origin = originInput.value;
        const notes = notesTextarea.value;

        // Campos PF
        const cpf = cpfInput.value;
        const birthDate = birthDateInput.value;
        const gender = genderSelect.value;

        // Campos PJ
        const cnpj = cnpjInput.value;
        const tradeName = tradeNameInput.value;
        const stateRegistration = stateRegistrationInput.value;

        // Validações
        if (!clientId || !clientType || !clientName || !email || !mainPhone || !status) {
            formMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }

        if (clientType === 'PF') {
            if (!cpf || !birthDate) {
                formMessage.textContent = 'Para Pessoa Física, CPF e Data de Nascimento são obrigatórios.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
        } else if (clientType === 'PJ') {
            if (!cnpj || !tradeName) {
                formMessage.textContent = 'Para Pessoa Jurídica, CNPJ e Nome Fantasia são obrigatórios.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
        }

        let clients = loadClients();
        let clientData = {
            id: clientId,
            clientType,
            clientName,
            email,
            mainPhone,
            secondaryPhone,
            address: { street, number, neighborhood, city, state, zipCode },
            paymentMethod,
            creditLimit,
            registrationDate,
            status,
            origin,
            notes
        };

        if (clientType === 'PF') {
            clientData.cpf = cpf;
            clientData.birthDate = birthDate;
            clientData.gender = gender;
        } else if (clientType === 'PJ') {
            clientData.cnpj = cnpj;
            clientData.tradeName = tradeName;
            clientData.stateRegistration = stateRegistration;
            clientData.contactPerson = contactPerson; // Pessoa de contato é mais relevante para PJ
        }

        if (editingClientId === null) { // Modo de Cadastro (novo cliente)
            if (clients[clientId]) {
                formMessage.textContent = 'ID de cliente já existe. Escolha outro.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
            clients[clientId] = clientData;
            saveClients(clients);
            formMessage.textContent = `Cliente "${clientName}" cadastrado com sucesso!`;
        } else { // Modo de Edição (atualizar cliente existente)
            const clientToUpdate = clients[editingClientId];
            if (clientToUpdate) {
                // Mantém o ID, atualiza o restante
                clients[editingClientId] = { ...clientData, id: editingClientId }; // Garante que o ID não mude
                saveClients(clients);
                formMessage.textContent = `Cliente "${clientName}" atualizado com sucesso!`;
            } else {
                formMessage.textContent = 'Erro: Cliente não encontrado para atualização.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
        }

        formMessage.classList.remove('error-message');
        formMessage.classList.add('success-message');
        renderClientGrid();
        resetForm();
    });

    // Event Listeners para os botões de ação
    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        clientRegistrationForm.dispatchEvent(new Event('submit'));
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
        if (editingClientId) {
            deleteClient(editingClientId);
        }
    });

    // Event listener para cliques nas linhas da grid para edição
    clientGridBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.clientId) {
            editClient(row.dataset.clientId);
        }
    });
});