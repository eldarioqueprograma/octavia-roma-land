import emailjs from '@emailjs/browser';

const form = document.getElementById('reserve-form');
if (!form) {
  console.warn('Reserve form not found.');
} else {
  const result = document.getElementById('reserveResult');
  const reserveBtn = document.getElementById('reserveBtn');
  const clearBtn = document.getElementById('clearBtn');

  const prices = { Familia: 35, Gladiador: 25, Imperial: 48 };
  const ticketType = document.getElementById('ticketType');
  const quantity = document.getElementById('quantity');
  const totalAmount = document.getElementById('totalAmount');

  if (!ticketType || !quantity || !totalAmount) {
    console.warn('Reserva inputs no encontrados.');
  } else {
    const PUBLIC_EMAILJS_PUBLIC_KEY = import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY || '';
    const PUBLIC_EMAILJS_SERVICE_ID = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID || '';
    const PUBLIC_EMAILJS_TEMPLATE_ID = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID || '';

    if (!PUBLIC_EMAILJS_PUBLIC_KEY || !PUBLIC_EMAILJS_SERVICE_ID || !PUBLIC_EMAILJS_TEMPLATE_ID) {
      if (result) result.textContent = 'Error de configuración: falta EmailJS PUBLIC_KEY o SERVICE_ID o TEMPLATE_ID.';
    } else {
      emailjs.init(PUBLIC_EMAILJS_PUBLIC_KEY);

      const MAX_TOTAL = 800;

      function computeTotal() {
        const type = ticketType.value;
        const qty = Math.max(1, parseInt(quantity.value || '1', 10));
        const price = prices[type] || 0;
        return price * qty;
      }

      function updateTotal() {
        const total = computeTotal();
        totalAmount.textContent = `€${total.toFixed(2)}`;
      }

      ticketType.addEventListener('change', updateTotal);
      quantity.addEventListener('input', updateTotal);
      updateTotal();

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailEl = document.getElementById('email');
        const email = emailEl ? emailEl.value.trim() : '';
        if (!email) {
          if (result) result.textContent = 'Introduce un correo válido.';
          return;
        }

        const type = ticketType.value;
        const qty = Math.max(1, parseInt(quantity.value || '1', 10));
        const total = computeTotal();

        if (total > MAX_TOTAL) {
          if (result) result.textContent = `El total (€${total.toFixed(2)}) supera el máximo permitido de €${MAX_TOTAL}. Reduce la cantidad o elige otra entrada.`;
          return;
        }

        if (reserveBtn) reserveBtn.disabled = true;
        if (result) result.textContent = 'Enviando reserva...';

        try {
          await emailjs.send(PUBLIC_EMAILJS_SERVICE_ID, PUBLIC_EMAILJS_TEMPLATE_ID, {
            to_email: email,
            type,
            quantity: qty,
            total: total.toFixed(2),
            message: `Gracias por tu reserva de ${qty}x ${type} por €${total.toFixed(2)}. Esperamos verte en Octavia Roma Land.`,
          });
          if (result) result.textContent = 'Reserva enviada. Revisa tu correo para la confirmación.';
        } catch (err) {
          if (result) result.textContent = `Error enviando reserva: ${err.message || err}`;
        } finally {
          if (reserveBtn) reserveBtn.disabled = false;
        }
      });
    }
  }
}
