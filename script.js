// ===== MOBILE MENU =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// ===== CHECK REPAIR STATUS =====
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZuhMI626y3Y2a3FNsQGa3QexQqmI8ewCQMli-6sbe7bmXXJ8drhWBhrEm1nf7HsBPkAJ6NSNEIORw/pub?output=csv";

const checkBtn = document.getElementById('checkStatusBtn');
const phoneInput = document.getElementById('phoneInput');
const resultBox = document.getElementById('statusResult');

if (checkBtn) {
  checkBtn.addEventListener('click', checkStatus);
  phoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkStatus();
  });
}

async function checkStatus() {
  const phone = phoneInput.value.trim().replace(/\D/g, '');
  
  if (phone.length < 10) {
    showError("Please enter a valid 10-digit phone number.");
    return;
  }

  resultBox.classList.add('show');
  resultBox.innerHTML = '<p style="text-align:center; color:#a0a0a0;">Checking...</p>';

  try {
    const response = await fetch(SHEET_CSV_URL);
    const csvText = await response.text();
    const records = parseCSV(csvText);
    
    const found = records.find(r => {
      const sheetPhone = (r.Phone || '').replace(/\D/g, '');
      return sheetPhone.endsWith(phone.slice(-10));
    });

    if (found) {
      showResult(found);
    } else {
      showError("No record found for this number. Please contact us on WhatsApp.");
    }
  } catch (err) {
    showError("Unable to fetch status. Please try again or contact us on WhatsApp.");
  }
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const headers = splitCSVLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length === 0) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function showResult(data) {
  resultBox.innerHTML = `
    <h3>✅ Repair Found</h3>
    <div class="status-row"><span class="label">Name</span><span class="value">${escapeHtml(data.Name || '-')}</span></div>
    <div class="status-row"><span class="label">Brand</span><span class="value">${escapeHtml(data.Brand || '-')}</span></div>
    <div class="status-row"><span class="label">Device</span><span class="value">${escapeHtml(data.Device || '-')}</span></div>
    <div class="status-row"><span class="label">Entry Date</span><span class="value">${escapeHtml(data.EntryDate || '-')}</span></div>
    <div class="status-row"><span class="label">Estimate Cost</span><span class="value">${escapeHtml(data.EstimateCost || '-')}</span></div>
    <div class="status-row"><span class="label">Delivery Date</span><span class="value">${escapeHtml(data.DeliveryDate || '-')}</span></div>
    <div class="status-row"><span class="label">Status</span><span class="value">${escapeHtml(data.Status || '-')}</span></div>
    <div class="status-row"><span class="label">Notes</span><span class="value">${escapeHtml(data.Notes || '-')}</span></div>
  `;
  resultBox.classList.add('show');
}

function showError(message) {
  resultBox.innerHTML = `<p class="status-error">${message}</p>`;
  resultBox.classList.add('show');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
