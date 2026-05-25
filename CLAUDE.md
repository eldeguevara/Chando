# CHANDO · Prototipo Web

Prototipo del **sistema digital de transformación del canal de marketing** de CHANDO,
una empresa de cosméticos. Es un prototipo de demostración (datos simulados, sin backend).

## Stack

- **Vite** + **React 18** (JavaScript, sin TypeScript)
- **Tailwind CSS v3** para estilos
- **React Router DOM v6** para navegación
- **Lucide React** para iconos
- **Recharts** para gráficos

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción a /dist
npm run preview  # previsualizar el build
```

## Estructura

```
src/
├── components/   Componentes reutilizables
│   ├── Sidebar.jsx          Barra lateral reutilizable (props: items, active, onSelect, rol)
│   ├── Header.jsx           Encabezado reutilizable (logo, título, usuario, logout, acciones)
│   ├── Card.jsx             Card genérica + StatCard (métricas)
│   └── Button.jsx           Botón con variantes (primary/secondary/outline/ghost/dark)
├── pages/
│   ├── Login.jsx            Selección de rol e ingreso
│   ├── RetailerPortal.jsx   Portal minorista: sidebar propio + 3 vistas (Catálogo, Carrito, Mis Pedidos)
│   ├── InventoryCenter.jsx  Centro de Control de Inventario: 3 vistas (General, Detalle por Bodega, Alertas)
│   └── ExecutiveDashboard.jsx  Dashboard ejecutivo: 3 vistas (KPIs, Análisis Comparativo, Reportes) con Recharts
├── data/         Datos simulados en JSON
│   ├── productos.json       Catálogo (12 prod.: id, sku, categoria, precio, imagen, stockTotal)
│   ├── bodegas.json         14 bodegas centrales (ciudad, capacidad, ocupación, estado)
│   ├── inventario.json      Stock por producto×bodega (cantidad, nivelMinimo) — 14 bodegas
│   ├── pedidos.json         8 pedidos (numeroPedido, minoristaId, estado, bodega, total)
│   ├── kpis.json            Series de gráficos + métricas de transformación (despacho, región, antes/después)
│   └── campaigns.json       Campañas de marketing (sin uso actual)
├── context/
│   ├── AuthContext.jsx      Rol del usuario (login/logout simulado)
│   ├── CartContext.jsx      Carrito del minorista (estado de UI)
│   └── DataContext.jsx      Inventario/pedidos/alertas compartidos + KPIs calculados (estado en memoria)
├── assets/
│   └── chando-logo.svg      Logo monograma de CHANDO
├── App.jsx       Definición de rutas (React Router)
├── main.jsx      Punto de entrada (BrowserRouter + AuthProvider + DataProvider + Toaster)
└── index.css     Tailwind + estilos globales
```

## Rutas

| Ruta          | Página             | Rol         |
| ------------- | ------------------ | ----------- |
| `/`           | Login              | —           |
| `/minorista`  | RetailerPortal     | minorista   |
| `/inventario` | InventoryCenter    | operador    |
| `/ejecutivo`  | ExecutiveDashboard | ejecutivo   |

## Paleta corporativa (tailwind.config.js)

| Token        | Hex       | Uso                          |
| ------------ | --------- | ---------------------------- |
| `primary`    | `#E91E63` | Rosa/coral principal         |
| `primary.light` | `#F8BBD0` | Rosa claro                |
| `primary.dark`  | `#C2185B` | Rosa oscuro (hover)       |
| `secondary`  | `#D4AF37` | Dorado                       |
| `secondary.light` | `#E8D48A` | Dorado claro            |
| `dark`       | `#1F2937` | Gris oscuro (textos, sidebar)|
| `light`      | `#FFF8F3` | Blanco/cream (fondos)        |

## Convenciones

- Componentes en `PascalCase.jsx`; un componente por archivo (export default).
- La autenticación es **simulada**: `Login` elige un rol (`minorista` / `operador` /
  `ejecutivo`) y `AuthContext` lo guarda en memoria vía `login(rol)` / `logout()`
  (estado `usuario = { rol }`). No hay contraseñas ni persistencia.
- Los datos viven en `src/data/*.json`. El estado mutable (inventario, pedidos, alertas)
  se comparte vía `DataContext`: confirmar un pedido **resta** stock, aprobar
  reabastecimiento **suma** stock, y los KPIs (ventas/inventario) se **calculan** desde ahí.
- Cada módulo arma su layout con `<Header/>` (arriba) + `<Sidebar/>` (izquierda) y cambia
  de vista con `useState` (tabs); `Login` es independiente.
- Notificaciones con **react-hot-toast** (`<Toaster/>` en `main.jsx`).
- Animaciones: `animate-fade-in` (Tailwind) al cambiar de vista; hover/escala en botones.
- Estilos solo con clases de Tailwind usando los tokens de la paleta.
