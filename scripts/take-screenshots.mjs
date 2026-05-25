// Genera las capturas del demo para el MANUAL.md
// Uso: node scripts/take-screenshots.mjs  (con el dev server en http://localhost:5173)
import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:5173'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'docs', 'img')
mkdirSync(OUT, { recursive: true })

let page

const shot = async (name, h = 900) => {
  await page.setViewportSize({ width: 1280, height: h })
  await page.waitForTimeout(800) // dejar que terminen layout + fade-in
  await page.screenshot({ path: join(OUT, `${name}.png`) })
  console.log('  ✓', name)
}

const waitImgs = async () => {
  await page
    .waitForFunction(
      () => {
        const i = document.querySelector('img[src*="placehold"]')
        return i && i.complete && i.naturalWidth > 0
      },
      { timeout: 8000 },
    )
    .catch(() => {})
}

const run = async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  })
  page = await ctx.newPage()

  // 1. Login
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  await shot('01-login', 880)

  // 2. Portal Minorista · Catálogo
  await page.locator('button', { hasText: 'Ingresar' }).first().click()
  await page.waitForURL('**/minorista')
  await waitImgs()
  await shot('02-minorista-catalogo', 1480)

  // agregar 2 productos al carrito
  const add = page.locator('button', { hasText: 'Agregar al carrito' })
  await add.nth(0).click()
  await page.waitForTimeout(150)
  await add.nth(1).click()
  await page.waitForTimeout(150)

  // 3. Carrito
  await page.getByTitle('Mi Carrito').click()
  await waitImgs()
  await shot('03-minorista-carrito', 780)

  // 4. Pedido confirmado (modal + toast)
  await page.locator('button', { hasText: 'Confirmar Pedido' }).click()
  await page.waitForTimeout(600)
  await shot('04-minorista-pedido-confirmado', 800)

  // 5. Mis Pedidos
  await page.locator('button', { hasText: 'Ver mis pedidos' }).click()
  await page.waitForTimeout(600)
  await shot('05-minorista-pedidos', 1050)

  // 6. Inventario · Vista General
  await page.goto(`${BASE}/inventario`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  await shot('06-inventario-general', 1500)

  // 7. Detalle por Bodega
  await page.getByTitle('Detalle por Bodega').click()
  await waitImgs()
  await shot('07-inventario-detalle', 980)

  // 8. Alertas
  await page.getByTitle('Alertas').click()
  await page.waitForTimeout(600)
  await shot('08-inventario-alertas', 1250)

  // 9. Ejecutivo · KPIs
  await page.goto(`${BASE}/ejecutivo`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(900)
  await shot('09-ejecutivo-kpis', 1180)

  // 10. Análisis Comparativo
  await page.getByTitle('Análisis Comparativo').click()
  await page.waitForTimeout(600)
  await shot('10-ejecutivo-comparativo', 980)

  // 11. Reportes (con vista previa generada)
  await page.getByTitle('Reportes').click()
  await page.waitForTimeout(300)
  await page.locator('button', { hasText: 'Generar Reporte' }).click()
  await page.waitForTimeout(800)
  await shot('11-ejecutivo-reportes', 1200)

  await browser.close()
  console.log('DONE')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
