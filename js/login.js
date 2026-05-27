document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Foco automático no campo de usuário
    usernameInput.focus();

    // Usuários de teste com seus perfis atualizados
    const users = {
        'cliente': { password: '123', profile: 'user' },
        'tecnico': { password: '123', profile: 'technician' },
        'adm':     { password: '123', profile: 'admin' }
    };

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        const user = users[username]; // Tenta encontrar o usuário

        if (user && user.password === password) {
            errorMessage.textContent = '';
            alert(`Login bem-sucedido! Perfil: ${user.profile}`);

            // Armazena o perfil no localStorage para que a página home possa acessá-lo
            localStorage.setItem('userProfile', user.profile);
            localStorage.setItem('loggedInUser', username); // Opcional: armazena o nome do usuário

            window.location.href = 'home.html'; 
        } else {
            errorMessage.textContent = 'Usuário ou senha inválidos.';

            if (!user || user.password !== password) { // Se o usuário não existe ou a senha está errada
                usernameInput.value = '';
                passwordInput.value = '';
                usernameInput.focus();
            } else { // Se apenas a senha estiver errada (usuário existe, mas senha incorreta)
                passwordInput.value = '';
                passwordInput.focus();
            }
        }
    });
});