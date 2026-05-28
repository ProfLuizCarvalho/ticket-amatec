document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const settingsIcon = document.getElementById('settingsIcon');
    const dbSettingsModal = document.getElementById('dbSettingsModal');
    const closeDbSettingsModal = document.getElementById('closeDbSettingsModal');
    const dbSettingsForm = document.getElementById('dbSettingsForm');
    const testDbConnectionBtn = document.getElementById('testDbConnectionBtn');
    const dbConnectionMessage = document.getElementById('dbConnectionMessage');

    // Elementos do formulário de configurações
    const dbHostInput = document.getElementById('dbHost');
    const dbPortInput = document.getElementById('dbPort');
    const dbNameInput = document.getElementById('dbName');
    const dbUserInput = document.getElementById('dbUser');
    const dbPasswordInput = document.getElementById('dbPassword');

    // --- Funções para o Modal de Configurações (Mantidas) ---
    const loadDbSettings = () => {
        const settings = JSON.parse(localStorage.getItem('dbSettings')) || {
            host: 'localhost',
            port: '3306',
            name: 'sistema_inner_ai',
            user: 'root',
            password: 'password'
        };
        dbHostInput.value = settings.host;
        dbPortInput.value = settings.port;
        dbNameInput.value = settings.name;
        dbUserInput.value = settings.user;
        dbPasswordInput.value = settings.password;
    };

    const saveDbSettings = () => {
        const settings = {
            host: dbHostInput.value,
            port: dbPortInput.value,
            name: dbNameInput.value,
            user: dbUserInput.value,
            password: dbPasswordInput.value
        };
        localStorage.setItem('dbSettings', JSON.stringify(settings));
        dbConnectionMessage.textContent = 'Configurações salvas com sucesso!';
        dbConnectionMessage.className = 'info-message success';
    };

    const testDbConnection = () => {
        try {
            localStorage.setItem('testKey', 'testValue');
            localStorage.removeItem('testKey');
            dbConnectionMessage.textContent = 'Conexão com o "banco de dados" (localStorage) bem-sucedida!';
            dbConnectionMessage.className = 'info-message success';
            return true;
        } catch (e) {
            dbConnectionMessage.textContent = 'Erro ao testar conexão com o "banco de dados" (localStorage indisponível).';
            dbConnectionMessage.className = 'info-message error';
            return false;
        }
    };
    // --- Fim das Funções para o Modal de Configurações ---


    // --- Lógica de Login ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = loginForm.username.value;
        const passwordInput = loginForm.password.value;

        const usersData = JSON.parse(localStorage.getItem('appUsers')) || {};

        let foundUser = null;
        for (const userId in usersData) {
            if (usersData[userId].usu_nome_usuario === usernameInput) {
                foundUser = usersData[userId];
                break;
            }
        }

        if (foundUser && foundUser.usu_senha === passwordInput) {
            localStorage.setItem('loggedInUser', foundUser.id_usuarios);
            localStorage.setItem('userProfile', foundUser.usu_perfil);
            errorMessage.textContent = '';
            window.location.href = 'home.html';
        } else {
            errorMessage.textContent = 'Usuário ou senha inválidos.';
            errorMessage.style.color = 'red';
        }
    });
    // --- Fim da Lógica de Login ---


    // --- Eventos do Modal de Configurações (Mantidos) ---
    settingsIcon.addEventListener('click', () => {
        loadDbSettings();
        dbSettingsModal.style.display = 'flex';
        dbConnectionMessage.textContent = '';
    });

    closeDbSettingsModal.addEventListener('click', () => {
        dbSettingsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === dbSettingsModal) {
            dbSettingsModal.style.display = 'none';
        }
    });

    testDbConnectionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        testDbConnection();
    });

    dbSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveDbSettings();
    });
    // --- Fim dos Eventos do Modal de Configurações ---

    // Inicializa as configurações ao carregar a página de login
    loadDbSettings();

    // --- Função para popular usuários de teste no localStorage (AJUSTADA) ---
    const setupInitialUsers = () => {
        let users = JSON.parse(localStorage.getItem('appUsers'));
        if (!users) {
            users = {};
            // Usuário administrador: adm / adm
            users['adm'] = {
                id_usuarios: 'adm',
                usu_nome_usuario: 'adm',
                usu_senha: 'adm',
                usu_perfil: 'admin',
                usu_email: 'adm@example.com'
            };
            // Usuário técnico: tec / tec
            users['tec'] = {
                id_usuarios: 'tec',
                usu_nome_usuario: 'tec',
                usu_senha: 'tec',
                usu_perfil: 'tecnico',
                usu_email: 'tec@example.com'
            };
            // Usuário cliente: cli / cli
            users['cli'] = {
                id_usuarios: 'cli',
                usu_nome_usuario: 'cli',
                usu_senha: 'cli',
                usu_perfil: 'cliente',
                usu_email: 'cli@example.com'
            };
            localStorage.setItem('appUsers', JSON.stringify(users));
        }
    };

    // Chama a função para configurar os usuários iniciais
    setupInitialUsers();
});