// ======== Konfigurasi API ========
const API_BASE_URL = 'http://54.225.230.242/api';

// ======== Fungsi Bantu ========
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'index.html';
    throw new Error('Unauthorized');
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = 'index.html';
    }
    throw new Error(await response.text());
  }
  return response.json();
}

// ======== Fungsi Admin ========
let users = [];

async function loadUsers() {
  try {
    users = await fetchWithAuth(`${API_BASE_URL}/admin/users`);
    renderUsers();
  } catch (err) {
    console.error('Gagal memuat user:', err);
    alert('Gagal memuat data user');
  }
}

async function renderUsers() {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";
  
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${user.profile_pic || 'https://i.pravatar.cc/50?u=' + user.username}" /></td>
      <td>${user.username}</td>
      <td>${user.bio || '-'}</td>
      <td>${user.role}</td>
      <td>
        <button class="edit-btn" onclick="showEditModal('${user.id}')">Edit</button>
        <button class="delete-btn" onclick="confirmDelete('${user.id}')">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ======== Modal Functions ========
let currentEditUserId = null;

function showAddModal() {
  currentEditUserId = null;
  document.getElementById("modalTitle").textContent = "Tambah User";
  document.getElementById("userForm").reset();
  document.getElementById("userPreview").innerHTML = "";
  document.getElementById("userModal").classList.add("show");
}

async function showEditModal(userId) {
  try {
    const user = await fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}`);
    currentEditUserId = userId;

    document.getElementById("modalTitle").textContent = "Edit User";
    document.getElementById("userName").value = user.username;
    document.getElementById("userBio").value = user.bio || '';
    document.getElementById("userRole").value = user.role;
    
    const preview = document.getElementById("userPreview");
    preview.innerHTML = "";
    if (user.profile_pic) {
      const img = document.createElement("img");
      img.src = user.profile_pic;
      preview.appendChild(img);
    }

    document.getElementById("userModal").classList.add("show");
  } catch (err) {
    console.error('Gagal memuat data user:', err);
    alert('Gagal memuat data user');
  }
}

function closeModal() {
  document.getElementById("userModal").classList.remove("show");
}

// ======== CRUD Operations ========
async function handleUserSubmit(e) {
  e.preventDefault();
  
  const username = document.getElementById("userName").value;
  const bio = document.getElementById("userBio").value;
  const role = document.getElementById("userRole").value;
  const password = document.getElementById("userPass").value;
  const fileInput = document.getElementById("userPhoto");

  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('role', role);
    if (password) formData.append('password', password);
    if (fileInput.files[0]) formData.append('profile_pic', fileInput.files[0]);

    if (currentEditUserId) {
      // Update existing user
      await fetchWithAuth(`${API_BASE_URL}/admin/users/${currentEditUserId}`, {
        method: 'PUT',
        body: formData
      });
      alert('User berhasil diperbarui');
    } else {
      // Create new user
      await fetchWithAuth(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        body: formData
      });
      alert('User berhasil ditambahkan');
    }

    closeModal();
    await loadUsers();
  } catch (err) {
    console.error('Gagal menyimpan user:', err);
    alert('Gagal menyimpan user: ' + err.message);
  }
}

async function confirmDelete(userId) {
  if (!confirm("Apakah kamu yakin ingin menghapus user ini?")) return;
  
  try {
    await fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE'
    });
    alert('User berhasil dihapus');
    await loadUsers();
  } catch (err) {
    console.error('Gagal menghapus user:', err);
    alert('Gagal menghapus user');
  }
}

// ======== Photo Preview ========
function previewPhoto() {
  const file = document.getElementById("userPhoto").files[0];
  const preview = document.getElementById("userPreview");
  preview.innerHTML = "";

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

// ======== Initialize Admin Panel ========
async function initAdminPanel() {
  // Cek apakah user adalah admin
  try {
    const user = await fetchWithAuth(`${API_BASE_URL}/users/me`);
    if (user.role !== 'admin') {
      window.location.href = 'profile.html';
    }
  } catch (err) {
    window.location.href = 'index.html';
    return;
  }

  // Load initial data
  await loadUsers();

  // Setup event listeners
  document.getElementById("addUserBtn").addEventListener("click", showAddModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("userPhoto").addEventListener("change", previewPhoto);
  document.getElementById("userForm").addEventListener("submit", handleUserSubmit);
}

// Start the admin panel when DOM is loaded
document.addEventListener("DOMContentLoaded", initAdminPanel);