# Hamburguesa Nómada — Alleycat 5º Aniversario

Micrositio estático para el **Alleycat del 5º Aniversario de Hamburguesa Nómada**, construido con [Astro](https://astro.build). Sirve como hub del evento con información, premiación, consulta de premios por código QR y descarga de tarjeta PNG.

**Sitio en vivo:** [`https://nomada.izignamx.com`](https://nomada.izignamx.com)

---

## Tecnologías

- **Framework:** Astro 7 (static output)
- **Lenguaje:** TypeScript (strict)
- **Estilos:** SCSS con arquitectura de tokens
- **QR:** `qrcode` (generación 100% del lado del cliente)
- **CI/CD:** GitHub Actions → GitHub Pages
- **Hosting:** Estático (GitHub Pages)

## Funcionalidades

### P0
- Información del evento (fecha, sedes, horarios)
- Categorías (Trans/N.B., Femenil, Varonil, Cargo mixto, Patines mixto)
- Comunicado oficial con las reglas del evento
- Cuadrícula de patrocinadores y colaboradorxs
- Consulta de premio por código ✨
- Generación de QR en navegador
- Descarga de tarjeta PNG (1080 × 1350)

### P1
- Resultados completos
- Menú con enlace directo a WhatsApp
- Web Share API
- PWA

### P2
- Galería de fotos
- Historial de ediciones anteriores
- Open Graph individual por premio

---

## Comenzar

```bash
# Entrar al directorio del proyecto
cd starter

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se levanta en `http://localhost:4321` por defecto.

## Verificación

```bash
# Type checking (Astro check)
npm run check

# Build de producción
npm run build
```

El build de producción se genera en `dist/`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `PUBLIC_DATA_API_URL` | URL opcional para API externa de datos (fallback local por defecto) |

Copia `.env.example` a `.env` y completa si usas fuente remota.

## Despliegue

El repositorio incluye un workflow de **GitHub Actions** (`.github/workflows/deploy.yml`) que:

1. Construye el sitio en `ubuntu-latest`
2. Sube el artifact a GitHub Pages
3. Despliega automáticamente al hacer push a `main`

También se puede disparar manualmente desde la pestaña **Actions** del repositorio.

## Estructura del proyecto

```
starter/
├── public/
│   ├── data/           # JSON público (payload, sponsors, copy)
│   ├── images/         # Fotografías y placeholders
│   ├── logos/          # Logos del evento
│   ├── sponsors/       # Logos de patrocinadores
│   ├── CNAME           # Dominio personalizado
│   └── robots.txt
├── src/
│   ├── components/     # Componentes Astro (Hero, SponsorsGrid, PrizeLookup…)
│   ├── data/           # Datos del evento en JSON
│   ├── layouts/        # Layout base (BaseLayout.astro)
│   ├── lib/            # Utilidades y tipos compartidos
│   ├── pages/          # Rutas del sitio
│   ├── scripts/        # Lógica del lado del cliente (prize, card, data-client)
│   └── styles/         # SCSS con sistema de tokens
├── .env.example        # Template de variables de entorno
├── .gitignore
├── .nvmrc              # Versión de Node recomendada
├── astro.config.mjs    # Configuración de Astro
├── package.json
└── tsconfig.json
```

## Principios de diseño

- **Static-first:** Sin backend, sin base de datos, sin autenticación.
- **Offline-friendly:** Fetch con fallback local; todo premio funciona sin API.
- **Accesible:** WCAG 2.2 AA, navegación por teclado, foco visible.
- **Responsive:** `prefers-reduced-motion` respetado.
- **Sin datos sensibles:** No se exponen teléfonos, correos ni datos privados en JSON público.

## Licencia

GPLv2 — ver [LICENSE](./LICENSE).
