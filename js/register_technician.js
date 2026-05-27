// js/register_technician.js - Versão com Grid e Botões de Ação (Ordem Padronizada)

document.addEventListener('DOMContentLoaded', () => {
    const technicianRegistrationForm = document.getElementById('technicianRegistrationForm');
    const formMessage = document.getElementById('formMessage');
    const technicianGridBody = document.querySelector('#technicianGrid tbody');

    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const deleteButton = document.getElementById('deleteButton');

    let editingTechnicianId = null; // Armazena o ID do técnico que está sendo editado

    // Função para carregar técnicos do localStorage
    const loadTechnicians = () => {
        return JSON.parse(localStorage.getItem('appTechnicians')) || {};
    };

    // Função para salvar técnicos no localStorage
    const saveTechnicians = (technicians) => {
        localStorage.setItem('appTechnicians', JSON.stringify(technicians));
    };

    // Função para renderizar a grid de técnicos
    const renderTechnicianGrid = () => {
        const technicians = loadTechnicians();
        technicianGridBody.innerHTML = ''; // Limpa a grid antes de renderizar

        const technicianArray = Object.keys(technicians).map(id => ({ id, ...technicians[id] }));

        technicianArray.forEach(tech => {
            const row = technicianGridBody.insertRow();
            row.dataset.technicianId = tech.id; // Armazena o ID na linha

            row.insertCell().textContent = tech.id;
            row.insertCell().textContent = tech.fullName;
            row.insertCell().textContent = tech.email;
            row.insertCell().textContent = tech.specialty;
            row.insertCell().textContent = tech.status;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('grid-actions');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('btn-edit-grid');
            editBtn.addEventListener('click', () => editTechnician(tech.id));
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('btn-delete-grid');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteTechnician(tech.id);
            });
            actionsCell.appendChild(deleteBtn);
        });
    };

    // Função para preencher o formulário com dados de um técnico para edição
    const editTechnician = (id) => {
        const technicians = loadTechnicians();
        const techToEdit = technicians[id];

        if (techToEdit) {
            document.getElementById('technicianId').value = techToEdit.id;
            document.getElementById('fullName').value = techToEdit.fullName;
            document.getElementById('email').value = techToEdit.email;
            document.getElementById('specialty').value = techToEdit.specialty;
            document.getElementById('phone').value = techToEdit.phone;
            document.getElementById('status').value = techToEdit.status;

            document.getElementById('technicianId').disabled = true; // Não permite mudar o ID em edição

            // Visibilidade dos botões no modo de edição
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';

            editingTechnicianId = id;
            formMessage.textContent = '';
        }
    };

    // Função para excluir um técnico
    const deleteTechnician = (id) => {
        if (confirm(`Tem certeza que deseja excluir o técnico "${id}"?`)) {
            let technicians = loadTechnicians();
            delete technicians[id];
            saveTechnicians(technicians);
            renderTechnicianGrid();
            resetForm();
            formMessage.textContent = `Técnico "${id}" excluído com sucesso.`;
            formMessage.classList.remove('error-message');
            formMessage.classList.add('success-message');
        }
    };

    // Função para resetar o formulário e o estado de edição
    const resetForm = () => {
        technicianRegistrationForm.reset();
        document.getElementById('technicianId').disabled = false;

        // Visibilidade dos botões no modo de cadastro (inicial)
        saveButton.style.display = 'inline-block';
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
        cancelButton.style.display = 'none';

        editingTechnicianId = null;
        formMessage.textContent = '';
    };

    // Inicializa a grid e o formulário
    renderTechnicianGrid();
    resetForm();

    // Event Listener para o formulário (Salvar/Atualizar)
    technicianRegistrationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const technicianId = document.getElementById('technicianId').value;
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const specialty = document.getElementById('specialty').value;
        const phone = document.getElementById('phone').value;
        const status = document.getElementById('status').value;

        // Validações
        if (!technicianId || !fullName || !email || !status) {
            formMessage.textContent = 'Por favor, preencha os campos obrigatórios (ID, Nome, Email, Status).';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }

        let technicians = loadTechnicians();

        if (editingTechnicianId === null) { // Modo de Cadastro (novo técnico)
            if (technicians[technicianId]) {
                formMessage.textContent = 'ID de técnico já existe. Escolha outro.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
            technicians[technicianId] = { id: technicianId, fullName, email, specialty, phone, status };
            saveTechnicians(technicians);
            formMessage.textContent = `Técnico "${technicianId}" cadastrado com sucesso!`;
        } else { // Modo de Edição (atualizar técnico existente)
            const techToUpdate = technicians[editingTechnicianId];
            if (techToUpdate) {
                techToUpdate.fullName = fullName;
                techToUpdate.email = email;
                techToUpdate.specialty = specialty;
                techToUpdate.phone = phone;
                techToUpdate.status = status;
                saveTechnicians(technicians);
                formMessage.textContent = `Técnico "${technicianId}" atualizado com sucesso!`;
            } else {
                formMessage.textContent = 'Erro: Técnico não encontrado para atualização.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
        }

        formMessage.classList.remove('error-message');
        formMessage.classList.add('success-message');
        renderTechnicianGrid();
        resetForm();
    });

    // Event Listeners para os botões de ação
    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        technicianRegistrationForm.dispatchEvent(new Event('submit'));
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
        if (editingTechnicianId) {
            deleteTechnician(editingTechnicianId);
        }
    });

    // Event listener para cliques nas linhas da grid para edição
    technicianGridBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.technicianId) {
            editTechnician(row.dataset.technicianId);
        }
    });
});