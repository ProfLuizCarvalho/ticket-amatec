// js/register_user.js - Versão com Grid e Botões de Ação (Ordem Padronizada)

document.addEventListener('DOMContentLoaded', () => {
    const userRegistrationForm = document.getElementById('userRegistrationForm');
    const formMessage = document.getElementById('formMessage');
    const userGridBody = document.querySelector('#userGrid tbody');

    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const deleteButton = document.getElementById('deleteButton');

    let editingUserUsername = null; // Armazena o username do usuário que está sendo editado

    // Função para carregar usuários do localStorage
    const loadUsers = () => {
        return JSON.parse(localStorage.getItem('appUsers')) || {};
    };

    // Função para salvar usuários no localStorage
    const saveUsers = (users) => {
        localStorage.setItem('appUsers', JSON.stringify(users));
    };

    // Função para renderizar a grid de usuários
    const renderUserGrid = () => {
        const users = loadUsers();
        userGridBody.innerHTML = ''; // Limpa a grid antes de renderizar

        // Converte o objeto de usuários em um array para facilitar a iteração
        const userArray = Object.keys(users).map(username => ({ username, ...users[username] }));

        userArray.forEach(user => {
            const row = userGridBody.insertRow();
            row.dataset.username = user.username; // Armazena o username na linha para fácil acesso

            row.insertCell().textContent = user.username;
            row.insertCell().textContent = user.profile;
            row.insertCell().textContent = user.fullName;
            row.insertCell().textContent = user.email;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('grid-actions');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('btn-edit-grid');
            editBtn.addEventListener('click', () => editUser(user.username));
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('btn-delete-grid');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Impede que o clique na linha ative a edição
                deleteUser(user.username);
            });
            actionsCell.appendChild(deleteBtn);
        });
    };

    // Função para preencher o formulário com dados de um usuário para edição
    const editUser = (username) => {
        const users = loadUsers();
        const userToEdit = users[username];

        if (userToEdit) {
            document.getElementById('username').value = userToEdit.username;
            document.getElementById('password').value = ''; // Senha não é preenchida por segurança
            document.getElementById('confirmPassword').value = '';
            document.getElementById('profile').value = userToEdit.profile;
            document.getElementById('fullName').value = userToEdit.fullName;
            document.getElementById('email').value = userToEdit.email;

            document.getElementById('username').disabled = true; // Não permite mudar o username em edição

            // Visibilidade dos botões no modo de edição
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';

            editingUserUsername = username; // Define o usuário que está sendo editado
            formMessage.textContent = ''; // Limpa mensagens anteriores
        }
    };

    // Função para excluir um usuário
    const deleteUser = (username) => {
        if (confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
            let users = loadUsers();
            delete users[username];
            saveUsers(users);
            renderUserGrid();
            resetForm();
            formMessage.textContent = `Usuário "${username}" excluído com sucesso.`;
            formMessage.classList.remove('error-message');
            formMessage.classList.add('success-message');
        }
    };

    // Função para resetar o formulário e o estado de edição
    const resetForm = () => {
        userRegistrationForm.reset();
        document.getElementById('username').disabled = false; // Habilita o username

        // Visibilidade dos botões no modo de cadastro (inicial)
        saveButton.style.display = 'inline-block';
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
        cancelButton.style.display = 'none';

        editingUserUsername = null;
        formMessage.textContent = '';
    };

    // Inicializa a grid e o formulário
    renderUserGrid();
    resetForm(); // Garante que o formulário comece no modo de "novo"

    // Event Listener para o formulário (Salvar/Atualizar)
    userRegistrationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const profile = document.getElementById('profile').value;
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;

        // Validações
        if (!username || !profile || !fullName || !email) {
            formMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }

        if (editingUserUsername === null) { // Modo de Cadastro (novo usuário)
            if (!password || !confirmPassword) {
                formMessage.textContent = 'Por favor, preencha a senha e a confirmação.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
            if (password !== confirmPassword) {
                formMessage.textContent = 'As senhas não coincidem.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
            let users = loadUsers();
            if (users[username]) {
                formMessage.textContent = 'Nome de usuário já existe. Escolha outro.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
            users[username] = { password: password, profile: profile, fullName: fullName, email: email };
            saveUsers(users);
            formMessage.textContent = `Usuário "${username}" cadastrado com sucesso!`;
        } else { // Modo de Edição (atualizar usuário existente)
            let users = loadUsers();
            const userToUpdate = users[editingUserUsername];
            if (userToUpdate) {
                userToUpdate.profile = profile;
                userToUpdate.fullName = fullName;
                userToUpdate.email = email;
                // A senha só é atualizada se ambos os campos de senha forem preenchidos e coincidirem
                if (password && confirmPassword) {
                    if (password !== confirmPassword) {
                        formMessage.textContent = 'As novas senhas não coincidem.';
                        formMessage.classList.remove('success-message');
                        formMessage.classList.add('error-message');
                        return;
                    }
                    userToUpdate.password = password;
                } else if (password || confirmPassword) { // Se um campo de senha foi preenchido e o outro não
                    formMessage.textContent = 'Preencha ambos os campos de senha para atualizar.';
                    formMessage.classList.remove('success-message');
                    formMessage.classList.add('error-message');
                    return;
                }
                saveUsers(users);
                formMessage.textContent = `Usuário "${username}" atualizado com sucesso!`;
            } else {
                formMessage.textContent = 'Erro: Usuário não encontrado para atualização.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
        }

        formMessage.classList.remove('error-message');
        formMessage.classList.add('success-message');
        renderUserGrid(); // Atualiza a grid
        resetForm(); // Limpa o formulário e volta para o modo de cadastro
    });

    // Event Listeners para os botões de ação
    // O botão "Editar" no formulário agora dispara o submit para atualizar
    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        userRegistrationForm.dispatchEvent(new Event('submit')); // Dispara o evento submit
    });

    cancelButton.addEventListener('click', (event) => {
        event.preventDefault();
        resetForm();
        formMessage.textContent = 'Operação cancelada.';
        formMessage.classList.remove('success-message');
        formMessage.classList.add('error-message'); // Pode ser uma mensagem neutra
    });

    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (editingUserUsername) {
            deleteUser(editingUserUsername);
        }
    });

    // Event listener para cliques nas linhas da grid para edição
    userGridBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.username) {
            editUser(row.dataset.username);
        }
    });
});