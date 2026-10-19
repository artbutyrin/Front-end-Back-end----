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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function loadContacts() {
  const response = await fetch('/api/contacts');
  const contacts = await response.json();

  tbody.innerHTML = contacts.map((contact) => {
    const letters = `${contact.lastName[0] || ''}${contact.firstName[0] || ''}`.toUpperCase();
    const colors = ['#0f6cbd', '#c239b3', '#107c10', '#d83b01', '#5c2e91', '#038387'];
    const seed = `${contact.lastName}${contact.firstName}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const color = colors[seed % colors.length];
    return `
      <tr class="person-row">
        <td>
          <div class="person">
            <span class="avatar" style="background:${color}">${letters}</span>
            <span class="person-copy">
              <span class="person-name">${escapeHtml(contact.lastName)} ${escapeHtml(contact.firstName)} ${escapeHtml(contact.middleName)}</span>
              <span class="person-email">${escapeHtml(contact.email)}</span>
            </span>
          </div>
        </td>
        <td class="person-actions">
          <button class="btn-line" type="button" data-action="edit" data-id="${contact._id}">Змінити</button>
          <button class="btn-danger" type="button" data-action="delete" data-id="${contact._id}">Видалити</button>
        </td>
      </tr>
    `;
  }).join('');
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