# Octavia Roma Land — Guía para Agents

## Propósito del Proyecto

**Octavia Roma Land** es un sitio web estático para un parque temático romano que permite:
- Visualizar atracciones y espectáculos
- Comprar/reservar entradas a través de un formulario de reserva
- Recibir confirmaciones vía email usando EmailJS

El sitio NO procesa pagos. Solo recopila datos de reserva y envía confirmaciones por correo.

---

## Stack Tecnológico

| Componente | Versión | Rol |
|-----------|---------|-----|
| **Astro** | 6.4.2 | Framework SSG (Static Site Generation) |
| **Tailwind CSS** | 4.3.0 | Estilos y diseño responsive |
| **@tailwindcss/postcss** | 4.3.0 | Procesador PostCSS para Tailwind v4 |
| **EmailJS** | 4.4.1 | Envío de emails desde el cliente |
| **pnpm** | — | Package manager |

### Configuración PostCSS

Usa `@tailwindcss/postcss`, **NO** `@astrojs/tailwind`. Esto es crítico para que Tailwind v4 funcione correctamente en producción.

---

## Estructura del Proyecto

```
octavia-roma-land/
├── src/
│   ├── pages/
│   │   ├── index.astro           # Página principal
│   │   ├── buy-tickets.astro     # Página de reserva (formulario EmailJS)
│   │   ├── atracciones.astro     # Listado de atracciones
│   │   ├── espectaculos.astro    # Listado de espectáculos
│   │   └── api/                  # Rutas API (si aplica)
│   ├── layouts/
│   │   └── Layout.astro          # Layout global con header y nav
│   ├── components/
│   │   └── Welcome.astro         # Componentes reutilizables
│   ├── assets/                   # Imágenes, fuentes
│   └── styles.css                # Estilos globales
├── public/
│   ├── Gemini_Generated_Image_...png  # Logo del sitio
│   └── favicon.ico
├── dist/                         # Output de build (generado)
├── astro.config.mjs              # Configuración Astro
├── tailwind.config.js            # Configuración Tailwind
├── postcss.config.js             # Configuración PostCSS (importante)
├── tsconfig.json                 # Configuración TypeScript
├── package.json                  # Dependencias
└── .env                          # Variables de entorno (NO commitear)
```

---

## Cómo Funciona el Formulario de Reserva

### 1. **Localización**
Archivo: `src/pages/buy-tickets.astro`

### 2. **Flujo de Datos**

```
┌─────────────────────────────────────────────────────────────┐
│ Página buy-tickets.astro se renderiza                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontmatter Astro (servidor)                                │
│ • Lee import.meta.env (variables de entorno)                │
│ • Inyecta valores en div[id="config-container"]             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ <div id="config-container" data-*="..."> (HTML)             │
│ • data-public-key = PUBLIC_EMAILJS_PUBLIC_KEY               │
│ • data-service-id = PUBLIC_EMAILJS_SERVICE_ID               │
│ • data-template-id = PUBLIC_EMAILJS_TEMPLATE_ID             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ <script type="module">                                       │
│ • Lee datos del div vía dataset                             │
│ • Importa @emailjs/browser                                  │
│ • Registra listeners de formulario                          │
│ • En submit: event.preventDefault() + envía via EmailJS     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario completa formulario y presiona "Reservar"           │
│ • No recarga página (preventDefault)                        │
│ • EmailJS envía email al template configurado               │
│ • Usuario ve confirmación en resultado                      │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Componentes del Formulario**

| Elemento | ID | Tipo | Propósito |
|----------|----|----|----------|
| Tipo de entrada | `ticketType` | Select | Elige: Familia (€35), Gladiador (€25), Imperial (€48) |
| Cantidad | `quantity` | Number | Cuántas entradas |
| Email | `email` | Email | Para enviar confirmación |
| Total | `totalAmount` | Display | Calcula: precio × cantidad |
| Botón Reservar | `reserveBtn` | Submit | Envía datos a EmailJS |
| Botón Limpiar | `clearBtn` | Button | Resetea formulario |
| Resultado | `reserveResult` | Display | Mensajes de éxito/error |

### 4. **Lógica de Validación**

```javascript
const MAX_TOTAL = 800;  // Máximo permitido por transacción

if (total > MAX_TOTAL) {
  // Mostrar error: "El total supera el máximo"
  return;
}
```

---

## Variables de Entorno Requeridas

Crear archivo `.env` en la raíz del proyecto:

```bash
# EmailJS Configuration
PUBLIC_EMAILJS_PUBLIC_KEY=AuYiuGHGpSrffHJEL
PUBLIC_EMAILJS_SERVICE_ID=service_cptz2mn
PUBLIC_EMAILJS_TEMPLATE_ID=template_vqikhs7
```

### Obtener estas credenciales:

1. **Ir a [emailjs.com](https://www.emailjs.com/)**
2. **Crear cuenta** y confirmar email
3. **En "Email Services"**: agregar servicio de email (Gmail, Outlook, etc.)
   - Obtener `SERVICE_ID`
4. **En "Email Templates"**: crear template con variables:
   - `{{to_email}}`, `{{ticket_type}}`, `{{quantity}}`, `{{total}}`, `{{message}}`
   - Obtener `TEMPLATE_ID`
5. **En "Account"**: copiar `Public Key`

⚠️ **IMPORTANTE**: Variables con prefijo `PUBLIC_` son seguras exponer en el cliente. EmailJS está diseñado para usarse así (desde JavaScript del navegador).

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo local (hot reload)
pnpm run dev

# Build estático
pnpm exec astro build

# Preview del build
pnpm run preview

# Limpiar build
pnpm run clean
```

---

## Despliegue

El sitio es **completamente estático** (sin servidor necesario):

1. **Build local**:
   ```bash
   pnpm exec astro build
   ```

2. **Output**: Carpeta `dist/` contiene HTML/CSS/JS listo para servir

3. **Opciones de hosting**:
   - **Vercel** (recomendado para Astro): Solo push a git, se auto-deploya
   - **Netlify**: Conectar repo, detecta Astro automáticamente
   - **GitHub Pages**: Push a rama `gh-pages`
   - **Cualquier host estático**: Sube contenido de `dist/`

### Variables de Entorno en Producción

En Vercel/Netlify, agregar variables en el panel de control:
- `PUBLIC_EMAILJS_PUBLIC_KEY`
- `PUBLIC_EMAILJS_SERVICE_ID`
- `PUBLIC_EMAILJS_TEMPLATE_ID`

---

## Problemas Comunes

### ❌ "EmailJS no está disponible en la página"
**Causa**: El script que importa EmailJS se ejecuta antes de que los datos estén disponibles.

**Solución**: Verificar que `<div id="config-container">` esté **antes** del `<script type="module">` en el HTML generado.

```bash
# Verificar build
cat dist/buy-tickets/index.html | grep -A2 "config-container"
```

### ❌ "Form reloads instead of sending"
**Causa**: `event.preventDefault()` no se ejecuta o hay error en el listener.

**Solución**: 
1. Abrir DevTools (F12)
2. Console → ver errores de JavaScript
3. Network → verificar si la llamada a EmailJS se envía

### ❌ "Tailwind CSS no funciona en producción"
**Causa**: Usando `@astrojs/tailwind` en lugar de `@tailwindcss/postcss`.

**Solución**:
1. Verificar `postcss.config.js`:
   ```javascript
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   };
   ```
2. Verificar `package.json`: debe tener `@tailwindcss/postcss`, no `@astrojs/tailwind`
3. Limpiar build: `pnpm run clean && pnpm exec astro build`

---

## Arquitectura de Email

### Template de EmailJS

El template debe contener variables:

```html
<h2>Reserva Confirmada</h2>

<p>Hola,</p>

<p>Tu reserva ha sido registrada:</p>
<ul>
  <li><strong>Tipo de entrada:</strong> {{ticket_type}}</li>
  <li><strong>Cantidad:</strong> {{quantity}}</li>
  <li><strong>Total:</strong> €{{total}}</li>
  <li><strong>Mensaje:</strong> {{message}}</li>
</ul>

<p>Nos vemos en Octavia Roma Land!</p>
```

### Datos Enviados por el Formulario

```javascript
emailjs.send(serviceId, templateId, {
  to_email: 'usuario@example.com',           // Email del cliente
  ticket_type: 'Familia',                    // Tipo seleccionado
  quantity: 2,                               // Cantidad
  total: '70.00',                            // Total calculado
  message: 'Reserva de 2x Familia por €70.00'
});
```

---

## Notas para Agents

### Si necesitas modificar el formulario:
1. Editar `src/pages/buy-tickets.astro`
2. Cambiar IDs, labels, opciones de precios
3. **Mantener** la estructura de frontmatter que lee env vars
4. **Mantener** el div `config-container` con data-attributes
5. **NO** cambiar lógica de `event.preventDefault()` sin razón

### Si necesitas agregar más páginas:
1. Crear `.astro` en `src/pages/`
2. Astro automáticamente genera ruta basada en nombre
3. Usar `<Layout>` para header/footer consistente

### Si necesitas agregar estilos globales:
1. Editar `src/styles.css`
2. Tailwind procesa automáticamente
3. Tailwind v4: usa `@import "tailwindcss"` (no `@tailwind`)

---

## Checklist de Deployment

- [ ] Variables `.env` configuradas localmente
- [ ] `pnpm exec astro build` sin errores
- [ ] `dist/` generada con `index.html` correcto
- [ ] `dist/buy-tickets/index.html` contiene div `config-container`
- [ ] EmailJS template creado con variables correctas
- [ ] Variables `PUBLIC_*` configuradas en hosting (Vercel/Netlify)
- [ ] Test manual: llenar y enviar formulario
- [ ] Verificar email de confirmación recibido
- [ ] Comprobar logo y estilos se ven bien

---

**Última actualización:** 2026-06-06
