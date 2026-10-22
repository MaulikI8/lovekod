document.addEventListener('DOMContentLoaded', function () {
  const phoneInput = document.getElementById('id_phone');
  if (!phoneInput) return;

  // Create badge element below phone input
  const badge = document.createElement('div');
  badge.id = 'customer_lookup_badge';
  badge.style.marginTop = '6px';
  badge.style.fontSize = '0.8rem';
  badge.style.fontWeight = '500';
  badge.style.display = 'none';
  badge.style.borderRadius = '6px';
  badge.style.padding = '4px 10px';
  phoneInput.parentNode.appendChild(badge);

  let debounceTimer = null;

  async function checkPhone(val) {
    const clean = (val || '').replace(/[^\d+]/g, '').trim();
    if (clean.length < 7) {
      badge.style.display = 'none';
      return;
    }

    try {
      const res = await fetch('/api/customers/lookup/?phone=' + encodeURIComponent(clean));
      if (!res.ok) return;
      const data = await res.json();

      if (data.exists && data.customer) {
        const c = data.customer;
        badge.style.display = 'inline-block';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = '#10b981';
        badge.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        badge.innerHTML = `✓ <strong>Existing Customer:</strong> ${c.name || 'Valued Client'} • ${c.totalOrders || 0} orders • Spent: Rs. ${(c.totalSpent || 0).toLocaleString()}`;

        // Auto-fill form fields if they are blank or default
        const nameInput = document.getElementById('id_customer_name');
        if (nameInput && (!nameInput.value || nameInput.value === 'Valued Customer' || nameInput.value === 'Customer')) {
          nameInput.value = c.name || '';
        }

        const emailInput = document.getElementById('id_email');
        if (emailInput && !emailInput.value && c.email) {
          emailInput.value = c.email;
        }

        const waInput = document.getElementById('id_whatsapp');
        if (waInput && !waInput.value) {
          waInput.value = c.whatsapp || c.phone;
        }

        const districtSelect = document.getElementById('id_district');
        if (districtSelect && c.district) {
          districtSelect.value = c.district;
        }

        const cityInput = document.getElementById('id_city');
        if (cityInput && (!cityInput.value || cityInput.value === 'Kathmandu') && c.city) {
          cityInput.value = c.city;
        }

        const addrInput = document.getElementById('id_address');
        if (addrInput && !addrInput.value && c.address) {
          addrInput.value = c.address;
        }
      } else {
        badge.style.display = 'inline-block';
        badge.style.background = 'rgba(59, 130, 246, 0.12)';
        badge.style.color = '#60a5fa';
        badge.style.border = '1px solid rgba(59, 130, 246, 0.25)';
        badge.innerHTML = `ℹ <strong>New Customer:</strong> Record will be registered in Customers directory upon saving.`;
      }
    } catch (err) {
      console.warn('Customer lookup error:', err);
    }
  }

  phoneInput.addEventListener('input', function (e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => checkPhone(e.target.value), 350);
  });

  phoneInput.addEventListener('change', function (e) {
    checkPhone(e.target.value);
  });

  if (phoneInput.value) {
    checkPhone(phoneInput.value);
  }
});
