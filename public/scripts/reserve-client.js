const form = document.getElementById('reserve-form');
const result = document.getElementById('reserveResult');
const reserveBtn = document.getElementById('reserveBtn');
const clearBtn = document.getElementById('clearBtn');
const ticketType = document.getElementById('ticketType');
const quantity = document.getElementById('quantity');
const totalAmount = document.getElementById('totalAmount');
const emailInput = document.getElementById('email');

function setResult(message, isError = false) {
  if (!result) return;
  result.textContent = message;
  result.classList.toggle('text-rose-400', isError);
  result.classList.toggle('text-emerald-300', !isError);
}

if (!form || !result || !reserveBtn || !clearBtn || !ticketType || !quantity || !totalAmount || !emailInput) {
  console.warn('Formulario de reserva incompleto o elementos no encontrados.');
} else {
  const config = window.EMAILJS_CONFIG || {};
  const PUBLIC_EMAILJS_PUBLIC_KEY = config.publicKey || '';
  const PUBLIC_EMAILJS_SERVICE_ID = config.serviceId || '';
  const PUBLIC_EMAILJS_TEMPLATE_ID = config.templateId || '';

  if (!window.emailjs) {
    setResult('Error: EmailJS no está disponible en la página.');
    console.error('EmailJS global no cargado. Asegúrate de incluir https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js');
    reserveBtn.disabled = true;
  } else if (!PUBLIC_EMAILJS_PUBLIC_KEY || !PUBLIC_EMAILJS_SERVICE_ID || !PUBLIC_EMAILJS_TEMPLATE_ID) {
    setResult('Error de configuración: faltan las variables PUBLIC_EMAILJS_PUBLIC_KEY, PUBLIC_EMAILJS_SERVICE_ID o PUBLIC_EMAILJS_TEMPLATE_ID.');
    reserveBtn.disabled = true;
  } else {
    emailjs.init(PUBLIC_EMAILJS_PUBLIC_KEY);

    const prices = { Familia: 35, Gladiador: 25, Imperial: 48 };
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
    clearBtn.addEventListener('click', () => {
      form.reset();
      updateTotal();
      setResult('Formulario restablecido. Completa los datos y presiona Reservar.');
    });

    updateTotal();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const email = emailInput.value.trim();
      if (!email) {
        setResult('Introduce un correo electrónico válido.', true);
        return;
      }

      const type = ticketType.value;
      const qty = Math.max(1, parseInt(quantity.value || '1', 10));
      const total = computeTotal();

      if (total > MAX_TOTAL) {
        setResult(`El total (€${total.toFixed(2)}) supera el máximo permitido de €${MAX_TOTAL}.`, true);
        return;
      }

      reserveBtn.disabled = true;
      setResult('Enviando reserva...');

      try {
        await emailjs.send(PUBLIC_EMAILJS_SERVICE_ID, PUBLIC_EMAILJS_TEMPLATE_ID, {
          to_email: email,
          ticket_type: type,
          quantity: qty,
          total: total.toFixed(2),
          message: `Reserva de ${qty}x ${type} por €${total.toFixed(2)}.`,
        });

        setResult('Reserva enviada correctamente. Revisa tu correo para la confirmación.');
        form.reset();
        updateTotal();
      } catch (error) {
        console.error('EmailJS send error:', error);
        setResult('Error enviando la reserva. Intenta nuevamente en unos momentos.', true);
      } finally {
        reserveBtn.disabled = false;
      }
    });
  }
}
