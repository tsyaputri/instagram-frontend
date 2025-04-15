let users = JSON.parse(localStorage.getItem("userList")) || [];

function renderUsers() {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";
  users.forEach((user, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${user.photo || 'https://i.pravatar.cc/50?u=' + user.name}" /></td>
      <td>${user.name}</td>
      <td>${user.bio}</td>
      <td>
        <button class="edit-btn" onclick="editUser(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteUser(${index})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function showModal(editMode = false, index = null) {
  document.getElementById("userModal").classList.add("show");
  document.getElementById("modalTitle").textContent = editMode ? "Edit User" : "Tambah User";
  document.getElementById("userForm").reset();
  document.getElementById("userPreview").innerHTML = "";
  document.getElementById("userId").value = index !== null ? index : "";

  if (editMode && index !== null) {
    const user = users[index];
    document.getElementById("userName").value = user.name;
    document.getElementById("userBio").value = user.bio;
    if (user.photo) {
      const img = document.createElement("img");
      img.src = user.photo;
      document.getElementById("userPreview").appendChild(img);
    }
  }
}

document.getElementById("addUserBtn").addEventListener("click", () => {
  showModal(false);
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("userModal").classList.remove("show");
});

document.getElementById("userPhoto").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("userPreview");
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

document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("userName").value;
  const bio = document.getElementById("userBio").value;
  const index = document.getElementById("userId").value;
  const file = document.getElementById("userPhoto").files[0];

  const saveUser = (photoData) => {
    const userData = { name, bio, photo: photoData };
    if (index === "") {
      users.push(userData);
    } else {
      users[index] = userData;
    }
    localStorage.setItem("userList", JSON.stringify(users));
    document.getElementById("userModal").classList.remove("show");
    renderUsers();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => saveUser(e.target.result);
    reader.readAsDataURL(file);
  } else {
    const currentPhoto = index !== "" ? users[index].photo : "";
    saveUser(currentPhoto);
  }
});

function editUser(index) {
  showModal(true, index);
}

function deleteUser(index) {
  if (confirm("Apakah kamu yakin ingin menghapus user ini?")) {
    users.splice(index, 1);
    localStorage.setItem("userList", JSON.stringify(users));
    renderUsers();
  }
}

if (!localStorage.getItem("userList")) {
    users = [
      {
        name: "Afianada Tri Handayani",
        bio: "Pecinta fotografi dan senja 🌇",
        photo: "https://i.pravatar.cc/100?u=alya"
      },
      {
        name: "Salsabila Yekti",
        bio: "Traveler & pemburu kuliner 😋",
        photo: "https://i.pravatar.cc/100?u=bima"
      },
      {
        name: "Tasya",
        bio: "Desainer grafis freelance 🎨",
        photo: "https://i.pravatar.cc/100?u=chika"
      }
    ];
    localStorage.setItem("userList", JSON.stringify(users));
  }
  
document.addEventListener("DOMContentLoaded", renderUsers);
