// Substitua pela URL da sua implantação do Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbyt06SBkCdDyTfAJV737r40KEt85ZB_5AosWC5iSuLSIWB-YjNCZ9VeJ43fjt4rq_0V/exec";

// Elementos do DOM
const productForm = document.getElementById("productForm");
const productIdInput = document.getElementById("productId");
const nomeInput = document.getElementById("nome");
const precoInput = document.getElementById("preco");
const quantidadeInput = document.getElementById("quantidade");
const productTableBody = document.getElementById("productTableBody");
const loadingDiv = document.getElementById("loading");
const formTitle = document.getElementById("formTitle");
const btnCancel = document.getElementById("btnCancel");

// Carrega os produtos ao iniciar
document.addEventListener("DOMContentLoaded", loadProducts);

// 1. LER PRODUTOS (readAll)
async function loadProducts() {
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}?action=readAll`);
    const result = await response.json();

    if (result.status === "success") {
      renderTable(result.data);
    } else {
      alert("Erro ao carregar dados: " + result.message);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Falha ao conectar com a API.");
  } finally {
    showLoading(false);
  }
}

// Renderiza a tabela no HTML
function renderTable(products) {
  productTableBody.innerHTML = "";
  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
      <td>${p.quantidade}</td>
      <td>
        <button class="btn-edit" onclick="editProduct(${p.id}, '${p.nome}', ${p.preco}, ${p.quantidade})">Editar</button>
        <button class="btn-delete" onclick="deleteProduct(${p.id})">Excluir</button>
      </td>
    `;
    productTableBody.appendChild(tr);
  });
}

// 2. CRIAR E ATUALIZAR PRODUTO (create / update)
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const id = productIdInput.value;
  const action = id ? "update" : "create";

  const payload = {
    action: action,
    id: id ? Number(id) : undefined,
    nome: nomeInput.value,
    preco: parseFloat(precoInput.value),
    quantidade: parseInt(quantidadeInput.value)
  };

  showLoading(true);

  try {
    // Enviamos como text/plain para evitar problemas de CORS no Apps Script
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === "success") {
      resetForm();
      await loadProducts();
    } else {
      alert("Erro: " + result.message);
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro ao enviar dados.");
  } finally {
    showLoading(false);
  }
});

// 3. EXCLUIR PRODUTO (delete)
async function deleteProduct(id) {
  if (!confirm(`Deseja realmente excluir o produto ID ${id}?`)) return;

  showLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "delete", id: id })
    });

    const result = await response.json();

    if (result.status === "success") {
      await loadProducts();
    } else {
      alert("Erro ao excluir: " + result.message);
    }
  } catch (error) {
    console.error("Erro ao excluir:", error);
    alert("Erro ao conectar com a API.");
  } finally {
    showLoading(false);
  }
}

// Prepara o formulário para edição
function editProduct(id, nome, preco, quantidade) {
  productIdInput.value = id;
  nomeInput.value = nome;
  precoInput.value = preco;
  quantidadeInput.value = quantidade;

  formTitle.textContent = "Editar Produto";
  btnCancel.style.display = "inline-block";
}

// Reseta o formulário
function resetForm() {
  productIdInput.value = "";
  productForm.reset();
  formTitle.textContent = "Novo Produto";
  btnCancel.style.display = "none";
}

function showLoading(isLoading) {
  loadingDiv.style.display = isLoading ? "block" : "none";
}
