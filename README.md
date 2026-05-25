# CHANDO · Prototipo Web

Prototipo del **sistema digital de transformación del canal de marketing** de **CHANDO**,
una empresa de cosméticos. Simula la plataforma que conecta a minoristas, operadores de
inventario y la dirección ejecutiva tras la consolidación logística y la digitalización del
canal (de 177 a 14 bodegas, despacho de 1 semana a 2 horas, entrega de 1 mes a 45 horas).

> Es un **prototipo de demostración**: los datos son simulados (archivos JSON en memoria) y
> no hay backend ni base de datos. Las acciones (pedidos, reabastecimiento) modifican el
> estado en memoria mientras la app está abierta.

> **Documentación adicional:**
> - **[MANUAL.md](MANUAL.md)** — manual de usuario con capturas (guía paso a paso).
> - **[MANUAL-TECNICO.md](MANUAL-TECNICO.md)** — manual técnico (arquitectura, estado, datos, build).

---

## Stack tecnológico

| Herramienta | Uso |
| ----------- | --- |
| **Vite** | Bundler y servidor de desarrollo |
| **React 18** (JavaScript) | Librería de UI |
| **React Router DOM v6** | Navegación entre rutas |
| **Tailwind CSS v3** | Estilos utilitarios + paleta corporativa |
| **Recharts** | Gráficos del dashboard ejecutivo |
| **Lucide React** | Iconografía |
| **react-hot-toast** | Notificaciones (toasts) |

---

## Instalación y ejecución

Requisitos: **Node.js 18+** y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo (http://localhost:5173)
npm run dev

# 3. (Opcional) Generar el build de producción
npm run build

# 4. (Opcional) Previsualizar el build
npm run preview
```

---

## Roles disponibles (login)

La autenticación es **simulada**: en la pantalla de inicio se elige un perfil (sin
contraseña) que redirige a su módulo correspondiente.

| Tarjeta de login | Rol interno | Ruta | Módulo |
| ---------------- | ----------- | ---- | ------ |
| **Soy Minorista** | `minorista` | `/minorista` | Portal del Minorista |
| **Soy Operador de Inventario** | `operador` | `/inventario` | Centro de Control de Inventario |
| **Soy Ejecutivo CHANDO** | `ejecutivo` | `/ejecutivo` | Dashboard Ejecutivo |

---

## Módulos

### 1. Portal del Minorista (`/minorista`)
Sidebar propio con tres vistas:
- **Catálogo** — grid de productos con búsqueda por nombre y filtro por categoría.
  Badges de stock: *Stock limitado* (< 50) y *Sin stock* (botón deshabilitado).
- **Mi Carrito** — controles +/- de cantidad, subtotal y resumen. Al **Confirmar Pedido**
  se genera un número correlativo, se asigna una bodega y se **descuenta del inventario**.
- **Mis Pedidos** — lista con filtros por estado, tarjetas expandibles, línea de tiempo
  (Confirmado → En preparación → En tránsito → Entregado) y modal de detalle.

### 2. Centro de Control de Inventario (`/inventario`)
Sidebar propio con tres vistas:
- **Vista General** — métricas (SKUs, unidades, bodegas activas, alertas) y grid de las
  14 bodegas con barra de ocupación en colores semáforo (verde/amarillo/rojo).
- **Detalle por Bodega** — selector de bodega y tabla de productos con estado
  *OK / Bajo / Crítico*; las filas críticas se resaltan y permiten "Reabastecer".
- **Alertas** — lista de productos en stock bajo/crítico con cantidad sugerida
  (`nivelMínimo × 2`). **Aprobar** suma stock al inventario; **Rechazar** descarta la alerta.

### 3. Dashboard Ejecutivo (`/ejecutivo`)
Sidebar propio + selector de rango de fechas en el header. Tres vistas:
- **KPIs** — 4 tarjetas (Ventas e Inventario **calculados desde los datos**; Despacho y
  Rotación de la transformación), gráfico de líneas (ventas por mes), gráfico de barras
  (ventas por región), mapa de calor de bodegas y top 5 de productos.
- **Análisis Comparativo** — tarjetas y gráfico de barras agrupadas "Antes vs. Después".
- **Reportes** — generador con tipo de reporte, rango de fechas y formato (PDF/Excel);
  muestra una vista previa con gráfico + tabla y botones de descarga (simulados).

---

## Datos conectados (en memoria)

El estado de dominio se comparte entre los módulos mediante `DataContext`:

- Al **confirmar un pedido** (minorista) → se **resta** del inventario.
- Al **aprobar un reabastecimiento** (operador) → se **suma** al stock.
- Los **KPIs del ejecutivo** (ventas totales, inventario consolidado, alertas) se
  **calculan** a partir de esos datos, por lo que reflejan los cambios en tiempo real.

---

## Estructura de carpetas

```
PROTOTIPO/
├── public/                 Recursos estáticos (favicon)
├── src/
│   ├── components/          Componentes reutilizables
│   │   ├── Sidebar.jsx          Barra lateral (items + rol activo)
│   │   ├── Header.jsx           Encabezado (logo, título, usuario, logout)
│   │   ├── Card.jsx             Card genérica + StatCard
│   │   └── Button.jsx           Botón con variantes y animaciones
│   ├── pages/
│   │   ├── Login.jsx            Selección de rol
│   │   ├── RetailerPortal.jsx   Portal del Minorista
│   │   ├── InventoryCenter.jsx  Centro de Control de Inventario
│   │   └── ExecutiveDashboard.jsx  Dashboard Ejecutivo
│   ├── context/
│   │   ├── AuthContext.jsx      Rol del usuario (login/logout simulado)
│   │   ├── CartContext.jsx      Carrito del minorista
│   │   └── DataContext.jsx      Inventario, pedidos, alertas y KPIs compartidos
│   ├── data/               Datos simulados (JSON)
│   │   ├── productos.json   · bodegas.json · inventario.json
│   │   ├── pedidos.json     · kpis.json    · campaigns.json
│   ├── assets/             Logo SVG de CHANDO
│   ├── App.jsx             Definición de rutas
│   ├── main.jsx            Punto de entrada (providers + Toaster)
│   └── index.css           Tailwind + estilos globales
├── tailwind.config.js      Paleta corporativa + animaciones
├── vite.config.js
└── package.json
```

---

## Paleta corporativa

| Token | Hex | Uso |
| ----- | --- | --- |
| `primary` | `#E91E63` | Rosa/coral principal |
| `primary.light` | `#F8BBD0` | Rosa claro |
| `primary.dark` | `#C2185B` | Rosa oscuro (hover) |
| `secondary` | `#D4AF37` | Dorado |
| `dark` | `#1F2937` | Gris oscuro (sidebar, textos) |
| `light` | `#FFF8F3` | Crema (fondos) |

---

_Proyecto académico — Análisis de Sistemas 1, UMG. © 2026 CHANDO Cosméticos (ficticio)._
