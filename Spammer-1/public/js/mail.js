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

  function initials(contact) {
    return escapeHtml(`${contact.lastName[0] || ''}${contact.firstName[0] || ''}`.toUpperCase());
  }

  function avatarColor(contact) {
    const colors = ['#0f6cbd', '#c239b3', '#107c10', '#d83b01', '#5c2e91', '#038387'];
    const seed = `${contact.lastName}${contact.firstName}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[seed % colors.length];
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
      <li class="mail-row">
        <label>
          <input class="form-check-input" type="checkbox" value="${contact._id}" ${selected.has(contact._id) ? 'checked' : ''}>
          <span class="avatar" style="background:${avatarColor(contact)}">${initials(contact)}</span>
          <span class="mail-row-body">
            <span class="mail-row-name">${escapeHtml(contact.lastName)} ${escapeHtml(contact.firstName)} ${escapeHtml(contact.middleName)}</span>
            <span class="mail-row-email">${escapeHtml(contact.email)}</span>
          </span>
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
    if (!response.ok) {
      result.innerHTML = `<div class="send-status send-status-error">${escapeHtml(data.error || 'Помилка відправки')}</div>`;
      return;
    }

    const lines = (data.messages || []).map((message) => `<li>${escapeHtml(message.email)}</li>`).join('');
    result.innerHTML = `<div class="send-status"><strong>Надіслано: ${data.sent}</strong><ul>${lines}</ul></div>`;
  });
  
  loadContacts();