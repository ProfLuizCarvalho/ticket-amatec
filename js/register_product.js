// js/register_product.js - Versão com Grid e Botões de Ação (Ordem Padronizada)

document.addEventListener('DOMContentLoaded', () => {
    const productRegistrationForm = document.getElementById('productRegistrationForm');
    const formMessage = document.getElementById('formMessage');
    const productGridBody = document.querySelector('#productGrid tbody');

    const saveButton = document.getElementById('saveButton');
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const deleteButton = document.getElementById('deleteButton');

    let editingProductId = null; // Armazena o ID do produto que está sendo editado

    // Função para carregar produtos do localStorage
    const loadProducts = () => {
        return JSON.parse(localStorage.getItem('appProducts')) || {};
    };

    // Função para salvar produtos no localStorage
    const saveProducts = (products) => {
        localStorage.setItem('appProducts', JSON.stringify(products));
    };

    // Função para renderizar a grid de produtos
    const renderProductGrid = () => {
        const products = loadProducts();
        productGridBody.innerHTML = ''; // Limpa a grid antes de renderizar

        const productArray = Object.keys(products).map(id => ({ id, ...products[id] }));

        productArray.forEach(product => {
            const row = productGridBody.insertRow();
            row.dataset.productId = product.id; // Armazena o ID na linha

            row.insertCell().textContent = product.id;
            row.insertCell().textContent = product.productName;
            row.insertCell().textContent = product.category;
            row.insertCell().textContent = `R$ ${parseFloat(product.price).toFixed(2)}`;
            row.insertCell().textContent = product.stock;
            row.insertCell().textContent = product.status;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('grid-actions');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('btn-edit-grid');
            editBtn.addEventListener('click', () => editProduct(product.id));
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('btn-delete-grid');
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteProduct(product.id);
            });
            actionsCell.appendChild(deleteBtn);
        });
    };

    // Função para preencher o formulário com dados de um produto para edição
    const editProduct = (id) => {
        const products = loadProducts();
        const productToEdit = products[id];

        if (productToEdit) {
            document.getElementById('productId').value = productToEdit.id;
            document.getElementById('productName').value = productToEdit.productName;
            document.getElementById('category').value = productToEdit.category;
            document.getElementById('price').value = productToEdit.price;
            document.getElementById('stock').value = productToEdit.stock;
            document.getElementById('status').value = productToEdit.status;

            document.getElementById('productId').disabled = true; // Não permite mudar o ID em edição

            // Visibilidade dos botões no modo de edição
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';

            editingProductId = id;
            formMessage.textContent = '';
        }
    };

    // Função para excluir um produto
    const deleteProduct = (id) => {
        if (confirm(`Tem certeza que deseja excluir o produto "${id}"?`)) {
            let products = loadProducts();
            delete products[id];
            saveProducts(products);
            renderProductGrid();
            resetForm();
            formMessage.textContent = `Produto "${id}" excluído com sucesso.`;
            formMessage.classList.remove('error-message');
            formMessage.classList.add('success-message');
        }
    };

    // Função para resetar o formulário e o estado de edição
    const resetForm = () => {
        productRegistrationForm.reset();
        document.getElementById('productId').disabled = false;

        // Visibilidade dos botões no modo de cadastro (inicial)
        saveButton.style.display = 'inline-block';
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';
        cancelButton.style.display = 'none';

        editingProductId = null;
        formMessage.textContent = '';
    };

    // Inicializa a grid e o formulário
    renderProductGrid();
    resetForm();

    // Event Listener para o formulário (Salvar/Atualizar)
    productRegistrationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const productId = document.getElementById('productId').value;
        const productName = document.getElementById('productName').value;
        const category = document.getElementById('category').value;
        const price = parseFloat(document.getElementById('price').value);
        const stock = parseInt(document.getElementById('stock').value);
        const status = document.getElementById('status').value;

        // Validações
        if (!productId || !productName || category === '' || isNaN(price) || isNaN(stock) || !status) {
            formMessage.textContent = 'Por favor, preencha todos os campos obrigatórios e válidos.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }
        if (price < 0 || stock < 0) {
            formMessage.textContent = 'Preço e estoque não podem ser negativos.';
            formMessage.classList.remove('success-message');
            formMessage.classList.add('error-message');
            return;
        }

        let products = loadProducts();

        if (editingProductId === null) { // Modo de Cadastro (novo produto)
            if (products[productId]) {
                formMessage.textContent = 'ID de produto já existe. Escolha outro.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
            products[productId] = { id: productId, productName, category, price, stock, status };
            saveProducts(products);
            formMessage.textContent = `Produto "${productName}" cadastrado com sucesso!`;
        } else { // Modo de Edição (atualizar produto existente)
            const productToUpdate = products[editingProductId];
            if (productToUpdate) {
                productToUpdate.productName = productName;
                productToUpdate.category = category;
                productToUpdate.price = price;
                productToUpdate.stock = stock;
                productToUpdate.status = status;
                saveProducts(products);
                formMessage.textContent = `Produto "${productName}" atualizado com sucesso!`;
            } else {
                formMessage.textContent = 'Erro: Produto não encontrado para atualização.';
                formMessage.classList.remove('success-message');
                formMessage.classList.add('error-message');
                return;
            }
        }

        formMessage.classList.remove('error-message');
        formMessage.classList.add('success-message');
        renderProductGrid();
        resetForm();
    });

    // Event Listeners para os botões de ação
    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        productRegistrationForm.dispatchEvent(new Event('submit'));
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
        if (editingProductId) {
            deleteProduct(editingProductId);
        }
    });

    // Event listener para cliques nas linhas da grid para edição
    productGridBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.productId) {
            editProduct(row.dataset.productId);
        }
    });
});