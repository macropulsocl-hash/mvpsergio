# Everex OS · MVP demostrativo

Maqueta estática y responsive para validar el flujo operativo de compra de fruta IQF, exportación, documentos, cobranza y cierre usando **Pedido / FCL** como unidad central.

> Todo el contenido es ficticio. La aplicación no usa Supabase, autenticación, correo, firma, SII, almacenamiento, archivos privados, secretos ni servicios externos. Los cambios viven solo en memoria y se restauran al recargar.

## Ejecutar localmente

Requisitos:

- Node.js 22.13 o superior.
- npm 10 o superior.

Instalación y desarrollo:

```bash
npm install
npm run dev
```

Vite mostrará una dirección local, normalmente `http://localhost:5173`.

### Acceso de prueba

- Usuario: `sergio.demo`
- Clave: `everex2026`

Las credenciales también aparecen en la pantalla de ingreso y pueden completarse con un botón. Esta validación ocurre únicamente en el navegador; no existe un servidor de autenticación. La sesión se recuerda con `sessionStorage` hasta cerrar la pestaña o usar “Cerrar sesión demo”.

Validación y compilación:

```bash
npm run lint
npm run build
npm run preview
```

La compilación estática queda en `dist/`. `vite.config.ts` usa rutas relativas (`base: './'`), por lo que el mismo resultado funciona en la raíz de un dominio o bajo `/nombre-del-repositorio/` en GitHub Pages.

## Recorrido recomendado

1. Ingresa con el usuario de prueba y accede al **Tablero**.
2. En **Tablero**, selecciona una tarjeta de macroestado y revisa alertas y tareas.
3. En **Pedidos / FCL**, abre `FCL-26095` para ver booking, carga real, Customs Broker, factura parcial, documentos y sets.
4. En la pestaña **Documentos**, usa “Completar documentación demo”. Luego confirma entrega, registra el saldo total y cierra el pedido. El cierre solo se habilita con entrega confirmada, documentos obligatorios completos y saldo cero.
5. Abre `FCL-26091` para recorrer desde confirmación de planta, booking e instructivo. Este caso muestra USA + orgánico + NOPIC.
6. Abre `FCL-26092` para revisar Europa + orgánico + COI, además de alertas ETD.
7. En **Contratos**, selecciona el contrato `BORRADOR` y pulsa “Emitir contrato”. La sesión asigna el correlativo `EVX-CT-26042`, simula el PDF y crea dos Pedidos / FCL.
8. En **Plantas**, revisa documentos por vencer o vencidos y simula una solicitud de renovación.
9. En **Cobranza**, registra un abono o pago completo. En **Configuración**, prueba estados de carga, éxito, error y restaura la sesión.

## Datos de demostración

Los datos tipados viven exclusivamente en `src/demo-data/`:

- 3 clientes internacionales con contactos Comercial, Logística y Documentación/Cobranza.
- 3 plantas chilenas con contactos, habilitaciones y documentos permanentes en distintos estados.
- 6 productos IQF convencionales y orgánicos.
- 3 contratos: borrador, emitido y casi completo.
- 6 Pedidos / FCL iniciales en los macroestados Pendiente, En Curso, Despachado y Cerrado.
- Casos específicos NOPIC, COI, Ex Dock con Customs Broker, pago parcial y expediente cerrado.
- Documentos internos/externos, sets documentales, alertas, tareas y facturas.

Todos los nombres, correos, teléfonos, identificadores, naves, empresas y valores son inventados para esta maqueta.

## Arquitectura

- `src/App.tsx`: acceso demostrativo, shell, navegación y estado local de la sesión.
- `src/pages/LoginPage.tsx`: formulario de ingreso y credenciales públicas de prueba.
- `src/demo-data/types.ts`: modelo funcional estricto.
- `src/demo-data/index.ts`: registros ficticios iniciales.
- `src/pages/`: pantallas de tablero, maestros, contratos, Pedidos / FCL, documentos, cobranza y configuración.
- `src/components/ui.tsx`: componentes reutilizables de interfaz, diálogos, badges, estados vacíos y notificaciones.
- `src/index.css`: tokens visuales, estilos globales y comportamiento responsive.
- `.github/workflows/deploy-pages.yml`: compilación y despliegue de la carpeta `dist/`.

La app también registra, si el navegador implementa WebMCP, dos herramientas locales y acotadas: abrir una ficha por código y completar un hito demostrativo. No son integraciones externas.

## Decisiones de UX

- Navegación lateral en escritorio y panel desplegable en móvil.
- Azul noche para el marco operativo; turquesa para acciones; ámbar y rojo para riesgo y vencimientos.
- El primer viewport prioriza macroestados, métricas, pedidos activos y alertas.
- Cada Pedido / FCL concentra fechas, ítems, booking, carga, hitos, checklists, documentos, sets, historial y condición de cierre.
- Las tablas conservan densidad operativa y admiten desplazamiento horizontal en pantallas pequeñas.
- Todas las acciones simuladas muestran confirmación y actualizan el historial o estado visible cuando corresponde.
- Los diálogos de documentos y envíos indican explícitamente que no generan archivos ni contactan destinatarios reales.

## Publicar en GitHub Pages

El repositorio incluye el workflow, pero este proyecto **no ha sido publicado ni subido a ningún remoto**.

1. Crea un repositorio nuevo en GitHub.
2. Desde esta carpeta, inicializa Git y sube el código cuando estés listo:

   ```bash
   git init
   git add .
   git commit -m "Add Everex OS static demo"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```

3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, elige **Source: GitHub Actions**.
5. Abre **Actions** y verifica el workflow “Deploy Everex OS demo to GitHub Pages”. Se ejecuta al hacer push a `main`; también puede iniciarse manualmente con **Run workflow**.
6. Al finalizar, la URL aparecerá en el job `deploy` y en **Settings → Pages**. Tendrá la forma `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

## Limitaciones conocidas

- No hay persistencia: recargar restaura la información inicial.
- El login es solo una barrera visual con credenciales públicas; no entrega seguridad real, roles ni control de permisos.
- Generar, descargar, aprobar o enviar documentos es una simulación visual; no se crean PDF/DOCX ni correos.
- Fechas y plazos son estáticos y no ejecutan calendarios laborales reales.
- Los montos no realizan conversión de monedas, impuestos ni conciliación bancaria.
- No existe conexión a navieras, forwarders, SAG, aduanas, SII, bancos, Supabase u otras APIs.
- La búsqueda cubre datos cargados en la sesión y no un índice persistente.
