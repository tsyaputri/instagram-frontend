// ===================== LOGIN =====================
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("auth-message");

  const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
  const user = storedUsers.find(u => u.username === username && u.password === password);

  if (user) {
    msg.textContent = "";
    alert("Login berhasil sebagai: " + username);
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "profile.html";
  } else {
    msg.textContent = "Username atau password salah.";
  }
}

//Nantinya proses validasi ini bisa diganti pakai API login yang ngecek ke database, bukan dari localStorage.

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

function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const bio = document.getElementById("bio").value.trim();
  const photoInput = document.getElementById("photoFile");
  const msg = document.getElementById("auth-message");

  if (!username || !password) {
    msg.textContent = "Username dan password wajib diisi.";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(u => u.username === username)) {
    msg.textContent = "Username sudah terdaftar. Coba login.";
    return;
  }

  const newUser = {
    username,
    password,
    bio,
    photo: ""
  };

  if (photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      newUser.photo = e.target.result;
      saveUser(newUser, users);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveUser(newUser, users);
  }
}

function saveUser(user, users) {
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("loggedInUser", JSON.stringify(user));
  window.location.href = "profile.html";
}

// ===================== PROFILE =====================
function loadUserPhotos() {
  const gallery = document.getElementById("photo-gallery");

  const photos = [
    "https://picsum.photos/300?random=1",
    "https://picsum.photos/300?random=2",
    "https://picsum.photos/300?random=3",
    "https://picsum.photos/300?random=4"
  ];

  photos.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Foto pengguna";
    img.classList.add("photo-item");
    img.onclick = () => openZoom(url);
    gallery.appendChild(img);
  });
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

function uploadPhoto() {
  const file = document.getElementById("photoFile").files[0];
  if (file) {
    alert("Foto berhasil diunggah (simulasi): " + file.name);
    window.location.href = "profile.html";
  } else {
    alert("Silakan pilih file terlebih dahulu.");
  }
}

// ===================== EDIT PROFILE =====================
function setupEditProfile() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user) {
    const editName = document.getElementById("editName");
    const editBio = document.getElementById("editBio");
    const preview = document.getElementById("editPreview");

    if (editName) editName.value = user.username;
    if (editBio) editBio.value = user.bio || "";

    if (preview && user.photo) {
      const img = document.createElement("img");
      img.src = user.photo;
      preview.appendChild(img);
    }
  }

  const editPhoto = document.getElementById("editPhoto");
  if (editPhoto) {
    editPhoto.addEventListener("change", function () {
      const file = this.files[0];
      const preview = document.getElementById("editPreview");
      preview.innerHTML = "";

      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const editForm = document.getElementById("editForm");
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("editName").value;
      const bio = document.getElementById("editBio").value;
      const photoInput = document.getElementById("editPhoto");
      let user = JSON.parse(localStorage.getItem("loggedInUser"));
      let users = JSON.parse(localStorage.getItem("users")) || [];

      user.bio = bio;
      user.username = name;

      const updateUserAndRedirect = () => {
        const index = users.findIndex(u => u.username === user.username);
        if (index !== -1) {
          users[index] = user;
        }
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "profile.html";
      };

      if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
          user.photo = e.target.result;
          updateUserAndRedirect();
        };
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        updateUserAndRedirect();
      }
    });
  }
}

// ===================== DOM Loaded Events =====================
document.addEventListener("DOMContentLoaded", () => {
  // Preview foto di signup
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
  setupEditProfile();
});
