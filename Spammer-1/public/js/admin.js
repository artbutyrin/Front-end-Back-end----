const form = document.querySelector('#contact-form');
const tbody = document.querySelector('#contacts');
const idInput = document.querySelector('#contact-id');

function readForm() {
  return {
    lastName: form.lastName.value,
    firstName: form.firstName.value,
    middleName: form.middleName.value,
    email: form.email.value
  };
}

function clearForm() {
  form.reset();
  idInput.value = '';
}

async function loadContacts() {
  const response = await fetch('/api/contacts');
  const contacts = await response.json();

  tbody.innerHTML = contacts.map((contact) => `
    <tr>
      <td>${contact.lastName}</td>
      <td>${contact.firstName}</td>
      <td>${contact.middleName}</td>
      <td>${contact.email}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${contact._id}">Змінити</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${contact._id}">Видалити</button>
      </td>
    </tr>
  `).join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = idInput.value;
  const response = await fetch(id ? `/api/contacts/${id}` : '/api/contacts', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(readForm())
  });

  if (!response.ok) {
    const data = await response.json();
    alert(data.error);
    return;
  }

  clearForm();
  loadContacts();
});

tbody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;

  if (button.dataset.action === 'delete') {
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    loadContacts();
    return;
  }

  const response = await fetch('/api/contacts');
  const contacts = await response.json();
  const contact = contacts.find((item) => item._id === id);
  idInput.value = contact._id;
  form.lastName.value = contact.lastName;
  form.firstName.value = contact.firstName;
  form.middleName.value = contact.middleName;
  form.email.value = contact.email;
});

document.querySelector('#cancel-edit').addEventListener('click', clearForm);
loadContacts();