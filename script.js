// ======== Konfigurasi API ========
const API_BASE_URL = 'http://54.225.230.242/api';

// ======== Fungsi Bantu ========
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // Tambahkan Content-Type jika tidak ada dan body adalah JSON
  if (options.body && !options.headers?.['Content-Type']) {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    };
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}

// ===================== LOGIN =====================
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("auth-message");

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ 
        email: username, 
        password: password 
      })
    });
    
    localStorage.setItem('token', response.token);
    
    // Dapatkan data user setelah login berhasil
    const userResponse = await fetchWithAuth(`${API_BASE_URL}/users/me`);
    localStorage.setItem('currentUser', JSON.stringify(userResponse));
    
    window.location.href = "profile.html";
  } catch (err) {
    console.error("Login error:", err);
    msg.textContent = "Username atau password salah.";
  }
}

// ===================== SIGN UP =====================
function previewPhoto() {
  const fileInput = document.getElementById("photoFile");
  const preview = document.getElementById("preview");
  preview.innerHTML = "";

  const file = fileInput.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "150px";
      img.style.borderRadius = "10px";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "<p>File bukan gambar</p>";
  }
}

async function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const bio = document.getElementById("bio").value.trim();
  const photoInput = document.getElementById("photoFile");
  const msg = document.getElementById("auth-message");

  if (!username || !password) {
    msg.textContent = "Username dan password wajib diisi.";
    return;
  }

  try {
    // Buat FormData untuk handle file upload
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', username); // Asumsi email sama dengan username
    formData.append('password', password);
    formData.append('bio', bio);
    if (photoInput.files[0]) {
      formData.append('profile_pic', photoInput.files[0]);
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData
      // Tidak perlu Content-Type header untuk FormData
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      window.location.href = "profile.html";
    } else {
      msg.textContent = data.error || "Pendaftaran gagal";
    }
  } catch (err) {
    console.error("Signup error:", err);
    msg.textContent = "Terjadi kesalahan saat pendaftaran";
  }
}

// ===================== PROFILE =====================
async function loadUserPhotos() {
  try {
    const gallery = document.getElementById("photo-gallery");
    gallery.innerHTML = ""; // Clear existing photos

    const photos = await fetchWithAuth(`${API_BASE_URL}/photos/me`);
    
    photos.forEach(photo => {
      const img = document.createElement("img");
      img.src = photo.image_url;
      img.alt = photo.caption || "Foto pengguna";
      img.classList.add("photo-item");
      img.onclick = () => openZoom(photo.image_url);
      gallery.appendChild(img);
    });
  } catch (err) {
    console.error("Gagal memuat foto:", err);
  }
}

function openZoom(src) {
  const modal = document.getElementById("zoomModal");
  const zoomedImg = document.getElementById("zoomedImg");
  zoomedImg.src = src;
  modal.style.display = "block";
}

function closeZoom() {
  document.getElementById("zoomModal").style.display = "none";
}

async function uploadPhoto() {
  const fileInput = document.getElementById("photoFile");
  const file = fileInput.files[0];
  
  if (!file) {
    alert("Silakan pilih file terlebih dahulu.");
    return;
  }

  const caption = prompt("Masukkan caption foto:");
  if (caption === null) return; // Jika user cancel

  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('caption', caption);

    await fetchWithAuth(`${API_BASE_URL}/photos/upload`, {
      method: 'POST',
      body: formData
    });

    alert("Foto berhasil diunggah!");
    window.location.href = "profile.html";
  } catch (err) {
    console.error("Upload error:", err);
    alert("Gagal mengunggah foto: " + err.message);
  }
}

// ===================== EDIT PROFILE =====================
async function setupEditProfile() {
  try {
    // Dapatkan data user saat ini
    const user = await fetchWithAuth(`${API_BASE_URL}/users/me`);
    
    const editName = document.getElementById("editName");
    const editBio = document.getElementById("editBio");
    const preview = document.getElementById("editPreview");

    if (editName) editName.value = user.username;
    if (editBio) editBio.value = user.bio || "";

    if (preview && user.profile_pic) {
      const img = document.createElement("img");
      img.src = user.profile_pic;
      preview.appendChild(img);
    }

    // Setup form submit
    const editForm = document.getElementById("editForm");
    if (editForm) {
      editForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("editName").value;
        const bio = document.getElementById("editBio").value;
        const photoInput = document.getElementById("editPhoto");

        try {
          const formData = new FormData();
          formData.append('username', name);
          formData.append('bio', bio);
          if (photoInput.files[0]) {
            formData.append('profile_pic', photoInput.files[0]);
          }

          await fetchWithAuth(`${API_BASE_URL}/users/me`, {
            method: 'PUT',
            body: formData
          });

          // Update local storage
          const updatedUser = await fetchWithAuth(`${API_BASE_URL}/users/me`);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          window.location.href = "profile.html";
        } catch (err) {
          console.error("Update error:", err);
          alert("Gagal memperbarui profil");
        }
      });
    }

  } catch (err) {
    console.error("Failed to setup edit profile:", err);
    window.location.href = "index.html";
  }
}

// ===================== LOGOUT =====================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  window.location.href = "index.html";
}

// ===================== DOM Loaded Events =====================
document.addEventListener("DOMContentLoaded", async () => {
  // Preview foto di signup/edit
  const photoInput = document.getElementById("photoFile");
  if (photoInput) {
    photoInput.addEventListener("change", previewPhoto);
  }

  // Event submit signup
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      signup();
    });
  }

  // Setup edit profile jika halaman edit
  if (window.location.pathname.includes("editprofile.html")) {
    await setupEditProfile();
  }

  // Load profile data jika di halaman profile
  if (window.location.pathname.includes("profile.html")) {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) throw new Error("No user data");
      
      document.getElementById("profile-name").textContent = user.username;
      document.getElementById("profile-bio").textContent = user.bio || "";
      
      const profilePic = document.getElementById("profile-pic");
      if (profilePic) {
        profilePic.src = user.profile_pic || 'https://i.pravatar.cc/100';
      }
      
      await loadUserPhotos();
    } catch (err) {
      console.error("Failed to load profile:", err);
      window.location.href = "index.html";
    }
  }
});