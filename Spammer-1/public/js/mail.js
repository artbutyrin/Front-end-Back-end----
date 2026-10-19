const templates = [
    { title: 'Нагадування', subject: 'Нагадування', text: 'Добрий день. Нагадуємо про нагадування негайно нагадайте' },
    { title: 'Запрошення', subject: 'Запрошення', text: 'Запрошуємо вас на запрошення ось цього запрошення.' },
    { title: 'Оголошення', subject: 'Оголошення', text: 'Маємо для вас коротке оголошення, оголосіть оголошення, будь ласка.' }
  ];
  
  const contactsList = document.querySelector('#contacts');
  const templateSelect = document.querySelector('#template');
  const form = document.querySelector('#mail-form');
  const quickForm = document.querySelector('#quick-contact');
  const selectAll = document.querySelector('#select-all');
  const result = document.querySelector('#result');

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function selectedIds() {
    return [...contactsList.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
  }
  
  templates.forEach((template, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = template.title;
    templateSelect.append(option);
  });
  
  templateSelect.addEventListener('change', () => {
    const template = templates[templateSelect.value];
    if (!template) return;
    form.subject.value = template.subject;
    form.text.value = template.text;
  });
  
  async function loadContacts(selectId) {
    const selected = new Set(selectedIds());
    if (selectId) selected.add(selectId);

    const response = await fetch('/api/contacts');
    const contacts = await response.json();
    contactsList.innerHTML = contacts.map((contact) => `
      <li class="list-group-item">
        <label class="d-flex align-items-center gap-2 mb-0">
          <input class="form-check-input mt-0" type="checkbox" value="${contact._id}" ${selected.has(contact._id) ? 'checked' : ''}>
          <span>${escapeHtml(contact.lastName)} ${escapeHtml(contact.firstName)} ${escapeHtml(contact.middleName)} — ${escapeHtml(contact.email)}</span>
        </label>
      </li>
    `).join('');
    selectAll.checked = contacts.length > 0 && selected.size === contacts.length;
  }

  selectAll.addEventListener('change', () => {
    contactsList.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = selectAll.checked;
    });
  });

  contactsList.addEventListener('change', () => {
    const boxes = [...contactsList.querySelectorAll('input[type="checkbox"]')];
    selectAll.checked = boxes.length > 0 && boxes.every((input) => input.checked);
  });

  quickForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lastName: quickForm.lastName.value,
        firstName: quickForm.firstName.value,
        middleName: quickForm.middleName.value,
        email: quickForm.email.value
      })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error);
      return;
    }
    quickForm.reset();
    loadContacts(data._id);
  });
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const ids = selectedIds();
    if (ids.length === 0) {
      alert('Оберіть хоча б одну адресу');
      return;
    }

    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: form.subject.value,
        text: form.text.value,
        ids
      })
    });
    const data = await response.json();
    result.textContent = JSON.stringify(data, null, 2);
  });
  
  loadContacts();