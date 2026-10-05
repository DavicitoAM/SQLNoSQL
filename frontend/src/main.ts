import './styles.css';
import { api } from './api';

const app = document.querySelector<HTMLDivElement>('#app')!;

const icon = (name: 'home'|'model'|'compare'|'crud'|'book'|'database'|'play'|'file') => {
  const paths: Record<string, string> = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/>',
    model: '<rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="14" width="7" height="6" rx="1"/><path d="M10 7h4v10h0"/><path d="M14 17h-4"/>',
    compare: '<path d="M7 7h12"/><path d="m16 4 3 3-3 3"/><path d="M17 17H5"/><path d="m8 14-3 3 3 3"/>',
    crud: '<path d="M4 6h16"/><path d="M7 3v6"/><path d="M17 3v6"/><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 11h3M8 15h5M15 11h1"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};

app.innerHTML = `
  <div class="doodle one"></div><div class="doodle two"></div>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">${icon('book')}</div>
        <div class="brand-text"><h1>Biblioteca<br>entre líneas</h1><p>SQL × NoSQL</p></div>
      </div>
      <nav class="nav">
        <button class="active" data-view="home">${icon('home')}<span>Inicio</span></button>
        <button data-view="models">${icon('model')}<span>Modelos</span></button>
        <button data-view="compare">${icon('compare')}<span>Comparador</span></button>
        <button data-view="crud">${icon('crud')}<span>CRUD comparativo</span></button>
      </nav>
      <div class="sidebar-note"><strong>Idea central</strong>La misma biblioteca, dos maneras de organizar y consultar sus datos.</div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <div class="eyebrow">Laboratorio de datos bibliotecarios</div>
          <h1 class="page-title" id="page-title">Biblioteca entre líneas</h1>
          <p class="subtitle" id="page-subtitle">Explora cómo MySQL y MongoDB representan la misma información de catálogo y circulación.</p>
        </div>
        <div class="status-cluster" id="status-cluster">
          <div class="status-chip"><span class="status-dot"></span>API</div>
          <div class="status-chip"><span class="status-dot"></span>MySQL</div>
          <div class="status-chip"><span class="status-dot"></span>MongoDB</div>
        </div>
      </header>

      <section class="view active" id="view-home">
        <div class="hero-grid">
          <article class="paper-card hero-card">
            <div class="eyebrow">Una biblioteca, dos paradigmas</div>
            <h2>De tablas y relaciones a documentos embebidos</h2>
            <p>Este proyecto usa el catálogo, los ejemplares, los usuarios y los préstamos de una biblioteca para comparar de forma visual las consultas SQL de MySQL con las consultas documentales de MongoDB. La interfaz no oculta la consulta: la muestra, la ejecuta y enseña el resultado de ambos motores.</p>
            <div class="book-strip" aria-hidden="true"><span class="book-spine"></span><span class="book-spine"></span><span class="book-spine"></span><span class="book-spine"></span></div>
          </article>
          <article class="paper-card stats-card">
            <h3>Mapa del sistema</h3>
            <div class="big-stat">9</div><div class="stat-label">tablas en el modelo relacional</div>
            <div class="stat-row">
              <div class="mini-stat"><strong>3</strong><span>colecciones documentales</span></div>
              <div class="mini-stat"><strong>5</strong><span>consultas comparativas</span></div>
              <div class="mini-stat"><strong>N:M</strong><span>Libro ↔ Autor</span></div>
              <div class="mini-stat"><strong>CRUD</strong><span>visible en ambos motores</span></div>
            </div>
          </article>
        </div>
      </section>

      <section class="view" id="view-models">
        <div class="section-heading"><div><h2>Explorador de modelos</h2><p>La misma información vista como relaciones y como documentos.</p></div></div>
        <div class="model-grid" id="model-grid"><div class="paper-card engine-card loading">Cargando estructura</div></div>
      </section>

      <section class="view" id="view-compare">
        <div class="section-heading"><div><h2>Comparador de consultas</h2><p>Selecciona una necesidad real de la biblioteca y observa qué consulta ejecuta cada motor.</p></div></div>
        <div class="paper-card query-toolbar">
          <div class="field"><label>Consulta bibliotecaria</label><select id="operation-select"></select></div>
          <div class="field" id="dynamic-param"><label>Parámetro</label><input class="input" disabled value="No requiere parámetros"></div>
          <button class="primary-btn" id="run-compare">${icon('play')} Ejecutar comparación</button>
        </div>
        <div id="comparison-output">
          <div class="compare-grid">
            <article class="paper-card engine-card"><div class="result-placeholder">${icon('database')}<div><strong>MySQL</strong><br>La consulta SQL aparecerá aquí.</div></div></article>
            <article class="paper-card engine-card mongo"><div class="result-placeholder">${icon('file')}<div><strong>MongoDB</strong><br>La consulta documental aparecerá aquí.</div></div></article>
          </div>
        </div>
      </section>

      <section class="view" id="view-crud">
        <div class="section-heading"><div><h2>CRUD bibliográfico comparativo</h2><p>Crea, modifica o elimina una ficha y observa las operaciones reales usadas en MySQL y MongoDB.</p></div><button class="secondary-btn" id="sync-mongo">Sincronizar Mongo desde MySQL</button></div>
        <div class="crud-layout">
          <article class="paper-card form-card">
            <h3 class="section-title">Ficha de libro</h3>
            <div class="form-grid">
              <div class="field"><label>ID para cargar / editar / eliminar</label><input id="crud-id" class="input" type="number" min="1" placeholder="Ej. 6"></div>
              <div class="field" style="align-self:end"><button class="secondary-btn" id="load-book">Cargar ficha</button></div>
              <div class="field"><label>ISBN</label><input id="book-isbn" class="input" placeholder="978..."></div>
              <div class="field"><label>Año</label><input id="book-year" class="input" type="number" min="1000" max="2100" value="2026"></div>
              <div class="field full"><label>Título</label><input id="book-title" class="input" placeholder="Título del libro"></div>
              <div class="field"><label>Idioma</label><input id="book-language" class="input" value="Español"></div>
              <div class="field"><label>Editorial</label><select id="book-editorial"></select></div>
              <div class="field full"><label>Categoría</label><select id="book-category"></select></div>
              <div class="field full"><label>Autores</label><div id="authors-list" class="check-list">Cargando autores…</div></div>
              <div class="field full"><label>Descripción</label><textarea id="book-description" rows="4" placeholder="Breve descripción bibliográfica"></textarea></div>
            </div>
            <div class="button-row">
              <button class="primary-btn" id="create-book">Crear en ambos</button>
              <button class="secondary-btn" id="update-book">Actualizar</button>
              <button class="danger-btn" id="delete-book">Eliminar</button>
            </div>
          </article>
          <article class="paper-card engine-card" id="crud-output">
            <div class="result-placeholder">${icon('book')}<div><strong>Resultado comparativo</strong><br>Al ejecutar una acción aparecerán aquí las operaciones de ambos motores.</div></div>
          </article>
        </div>
      </section>
    </main>
  </div>
  <div class="toast" id="toast"></div>
`;

const titles: Record<string, [string, string]> = {
  home: ['Biblioteca entre líneas', 'Explora cómo MySQL y MongoDB representan la misma información de catálogo y circulación.'],
  models: ['Dos formas de ordenar la biblioteca', 'Tablas, claves y relaciones frente a documentos, objetos y arreglos embebidos.'],
  compare: ['La misma pregunta, dos consultas', 'Ejecuta una necesidad bibliotecaria y compara la query, las estructuras involucradas y el resultado.'],
  crud: ['Mover una ficha cambia según el modelo', 'Observa cómo crear, actualizar y eliminar afecta tablas relacionadas o un documento agregado.']
};

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function showToast(message: string, error = false) {
  const toast = document.querySelector<HTMLDivElement>('#toast')!;
  toast.textContent = message;
  toast.className = `toast show${error ? ' error' : ''}`;
  window.setTimeout(() => toast.className = 'toast', 3500);
}

function setView(view: string) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelector(`#view-${view}`)?.classList.add('active');
  document.querySelectorAll('.nav button').forEach(el => el.classList.toggle('active', (el as HTMLElement).dataset.view === view));
  const [title, subtitle] = titles[view];
  document.querySelector('#page-title')!.textContent = title;
  document.querySelector('#page-subtitle')!.textContent = subtitle;
}

document.querySelectorAll<HTMLButtonElement>('.nav button').forEach(button => button.addEventListener('click', () => setView(button.dataset.view!)));

async function loadHealth() {
  const holder = document.querySelector<HTMLDivElement>('#status-cluster')!;
  try {
    const health = await api.health();
    const items = [['API', health.api?.status], ['MySQL', health.mysql?.status], ['MongoDB', health.mongodb?.status]];
    holder.innerHTML = items.map(([name,status]) => `<div class="status-chip ${status === 'online' ? 'online' : 'offline'}"><span class="status-dot"></span>${name}</div>`).join('');
  } catch {
    holder.innerHTML = `<div class="status-chip offline"><span class="status-dot"></span>API sin conexión</div>`;
  }
}

async function loadModels() {
  const target = document.querySelector<HTMLDivElement>('#model-grid')!;
  try {
    const data = await api.models();
    const tables = data.relational.tables.map((table: any) => `
      <div class="schema-item">
        <div class="schema-head"><strong>${escapeHtml(table.table)}</strong><span>${escapeHtml(table.purpose)}</span></div>
        <div class="schema-columns">${table.columns.map((c: string[]) => `<div class="column-row"><span>${escapeHtml(c[0])}</span><span>${escapeHtml(c[1])}</span><span class="key-tag">${escapeHtml(c[2])}</span></div>`).join('')}</div>
      </div>`).join('');
    const collections = data.document.collections.map((col: any) => `
      <div class="schema-item">
        <div class="schema-head"><strong>${escapeHtml(col.collection)}</strong><span>${escapeHtml(col.description)}</span></div>
        <div class="schema-columns">${col.embeds.length ? col.embeds.map((e: string) => `<div class="column-row"><span>${escapeHtml(e)}</span><span>embebido</span><span class="key-tag">BSON</span></div>`).join('') : '<div class="column-row"><span>documento independiente</span><span></span><span class="key-tag">BSON</span></div>'}</div>
      </div>`).join('');
    target.innerHTML = `
      <article class="paper-card engine-card">
        <div class="engine-title"><h3>MySQL · modelo relacional</h3><span class="badge">9 tablas</span></div>
        <div class="schema-list">${tables}</div>
        <div class="relation-notes"><strong>Relaciones:</strong><br>${data.relational.relations.map((r: string[]) => escapeHtml(r.join(' · '))).join('<br>')}</div>
      </article>
      <article class="paper-card engine-card mongo">
        <div class="engine-title"><h3>MongoDB · modelo documental</h3><span class="badge">3 colecciones</span></div>
        <div class="schema-list">${collections}</div>
        <div class="relation-notes"><strong>Lectura:</strong><br>El catálogo se agrupa por agregado: una ficha de libro contiene editorial, categoría, autores y ejemplares. Los préstamos conservan sus detalles como un arreglo.</div>
      </article>`;
  } catch (error) {
    target.innerHTML = `<article class="paper-card engine-card"><p>No se pudo cargar la definición: ${escapeHtml((error as Error).message)}</p></article>`;
  }
}

let operations: any[] = [];
async function loadOperations() {
  try {
    operations = await api.operations();
    const select = document.querySelector<HTMLSelectElement>('#operation-select')!;
    select.innerHTML = operations.map(op => `<option value="${escapeHtml(op.id)}">${escapeHtml(op.label)}</option>`).join('');
    renderParam();
    select.addEventListener('change', renderParam);
  } catch (error) {
    showToast((error as Error).message, true);
  }
}

function renderParam() {
  const selected = operations.find(op => op.id === document.querySelector<HTMLSelectElement>('#operation-select')!.value);
  const target = document.querySelector<HTMLDivElement>('#dynamic-param')!;
  if (!selected?.params?.length) {
    target.innerHTML = '<label>Parámetro</label><input class="input" disabled value="No requiere parámetros">';
    return;
  }
  const p = selected.params[0];
  target.innerHTML = `<label>${escapeHtml(p.label)}</label><input class="input" id="operation-param" data-name="${escapeHtml(p.name)}" placeholder="${escapeHtml(p.placeholder)}">`;
}

function renderTable(rows: any[]): string {
  if (!rows.length) return '<div class="result-placeholder"><div>No se encontraron registros.</div></div>';
  const keys = Object.keys(rows[0]);
  return `<div class="results-box"><table class="data-table"><thead><tr>${keys.map(k => `<th>${escapeHtml(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${keys.map(k => `<td>${typeof row[k] === 'object' && row[k] !== null ? escapeHtml(JSON.stringify(row[k])) : escapeHtml(row[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderEngineCard(title: string, engine: any, mongo = false): string {
  const metricPills = Object.entries(engine.metrics ?? {}).map(([k,v]) => `<span class="meta-pill">${escapeHtml(k)}: ${escapeHtml(v)}</span>`).join('');
  return `<article class="paper-card engine-card ${mongo ? 'mongo' : ''}">
    <div class="engine-title"><h3>${escapeHtml(title)}</h3><span class="badge">${mongo ? 'documental' : 'relacional'}</span></div>
    <div class="query-meta">${engine.entities.map((e: string) => `<span class="meta-pill">${escapeHtml(e)}</span>`).join('')}${metricPills}</div>
    <pre class="code-block">${escapeHtml(engine.query)}</pre>
    ${mongo ? `<div class="results-box"><pre class="json-view">${escapeHtml(JSON.stringify(engine.rows, null, 2))}</pre></div>` : renderTable(engine.rows)}
  </article>`;
}

async function runComparison() {
  const button = document.querySelector<HTMLButtonElement>('#run-compare')!;
  const op = document.querySelector<HTMLSelectElement>('#operation-select')!.value;
  const input = document.querySelector<HTMLInputElement>('#operation-param');
  const params = input ? { [input.dataset.name!]: input.value } : {};
  button.disabled = true; button.classList.add('loading');
  try {
    const result = await api.compare(op, params);
    document.querySelector<HTMLDivElement>('#comparison-output')!.innerHTML = `
      <div class="compare-grid">
        ${renderEngineCard('MySQL · SQL ejecutado', result.mysql)}
        ${renderEngineCard('MongoDB · query ejecutada', result.mongodb, true)}
      </div>
      <div class="comparison-reading"><strong>Qué está pasando</strong><br>${escapeHtml(result.reading)}</div>`;
  } catch (error) {
    showToast((error as Error).message, true);
  } finally {
    button.disabled = false; button.classList.remove('loading');
  }
}
document.querySelector('#run-compare')!.addEventListener('click', runComparison);

let referenceData: any = null;
async function loadReferenceData() {
  try {
    referenceData = await api.referenceData();
    document.querySelector<HTMLSelectElement>('#book-editorial')!.innerHTML = referenceData.editorials.map((x: any) => `<option value="${x.id}">${escapeHtml(x.nombre)}</option>`).join('');
    document.querySelector<HTMLSelectElement>('#book-category')!.innerHTML = referenceData.categories.map((x: any) => `<option value="${x.id}">${escapeHtml(x.nombre)}</option>`).join('');
    document.querySelector<HTMLDivElement>('#authors-list')!.innerHTML = referenceData.authors.map((x: any) => `<label class="check-item"><input type="checkbox" name="author" value="${x.id}">${escapeHtml(x.nombre)}</label>`).join('');
  } catch (error) {
    document.querySelector<HTMLDivElement>('#authors-list')!.textContent = 'Conecta MySQL para cargar el catálogo de autores.';
  }
}

function bookPayload() {
  return {
    isbn: (document.querySelector<HTMLInputElement>('#book-isbn')!).value,
    titulo: (document.querySelector<HTMLInputElement>('#book-title')!).value,
    anioPublicacion: Number((document.querySelector<HTMLInputElement>('#book-year')!).value),
    idioma: (document.querySelector<HTMLInputElement>('#book-language')!).value,
    descripcion: (document.querySelector<HTMLTextAreaElement>('#book-description')!).value,
    idEditorial: Number((document.querySelector<HTMLSelectElement>('#book-editorial')!).value),
    idCategoria: Number((document.querySelector<HTMLSelectElement>('#book-category')!).value),
    autorIds: Array.from(document.querySelectorAll<HTMLInputElement>('input[name="author"]:checked')).map(x => Number(x.value))
  };
}

function renderCrudResult(result: any, action: string) {
  document.querySelector<HTMLDivElement>('#crud-output')!.innerHTML = `
    <div class="engine-title"><h3>${escapeHtml(action)}</h3><span class="badge">comparación CRUD</span></div>
    <h4>MySQL</h4><pre class="code-block">${escapeHtml(result.mysql?.query ?? '—')}</pre>
    <div class="results-box"><pre class="json-view">${escapeHtml(JSON.stringify(result.mysql?.result ?? {}, null, 2))}</pre></div>
    <h4>MongoDB</h4><pre class="code-block">${escapeHtml(result.mongodb?.query ?? '—')}</pre>
    <div class="results-box"><pre class="json-view">${escapeHtml(JSON.stringify(result.mongodb?.result ?? {}, null, 2))}</pre></div>
    <div class="comparison-reading"><strong>Lectura</strong><br>${escapeHtml(result.reading ?? '')}</div>`;
}

async function loadBook() {
  const id = Number(document.querySelector<HTMLInputElement>('#crud-id')!.value);
  if (!id) return showToast('Escribe un ID de libro.', true);
  try {
    const b = await api.getBook(id);
    (document.querySelector<HTMLInputElement>('#book-isbn')!).value = b.isbn;
    (document.querySelector<HTMLInputElement>('#book-title')!).value = b.titulo;
    (document.querySelector<HTMLInputElement>('#book-year')!).value = String(b.anioPublicacion);
    (document.querySelector<HTMLInputElement>('#book-language')!).value = b.idioma;
    (document.querySelector<HTMLTextAreaElement>('#book-description')!).value = b.descripcion;
    (document.querySelector<HTMLSelectElement>('#book-editorial')!).value = String(b.idEditorial);
    (document.querySelector<HTMLSelectElement>('#book-category')!).value = String(b.idCategoria);
    document.querySelectorAll<HTMLInputElement>('input[name="author"]').forEach(x => x.checked = b.autorIds.includes(Number(x.value)));
    showToast('Ficha cargada desde MySQL.');
  } catch (error) { showToast((error as Error).message, true); }
}

document.querySelector('#load-book')!.addEventListener('click', loadBook);
document.querySelector('#create-book')!.addEventListener('click', async () => {
  try {
    const result = await api.createBook(bookPayload());
    (document.querySelector<HTMLInputElement>('#crud-id')!).value = String(result.idLibro);
    renderCrudResult(result, `Libro #${result.idLibro} creado`);
    showToast('Libro creado y comparado en ambos motores.');
  } catch (error) { showToast((error as Error).message, true); }
});
document.querySelector('#update-book')!.addEventListener('click', async () => {
  const id = Number(document.querySelector<HTMLInputElement>('#crud-id')!.value);
  if (!id) return showToast('Escribe el ID del libro que quieres actualizar.', true);
  try { const result = await api.updateBook(id, bookPayload()); renderCrudResult(result, `Libro #${id} actualizado`); showToast('Actualización completada.'); }
  catch (error) { showToast((error as Error).message, true); }
});
document.querySelector('#delete-book')!.addEventListener('click', async () => {
  const id = Number(document.querySelector<HTMLInputElement>('#crud-id')!.value);
  if (!id) return showToast('Escribe el ID del libro que quieres eliminar.', true);
  if (!window.confirm(`¿Eliminar el libro #${id}? MySQL puede bloquearlo si tiene ejemplares relacionados.`)) return;
  try { const result = await api.deleteBook(id); renderCrudResult(result, `Libro #${id} eliminado`); showToast('Eliminación completada.'); }
  catch (error) { showToast((error as Error).message, true); }
});
document.querySelector('#sync-mongo')!.addEventListener('click', async () => {
  try {
    const result = await api.syncMongo();
    showToast(`MongoDB sincronizado: ${result.counts.books} libros, ${result.counts.users} usuarios, ${result.counts.loans} préstamos.`);
    await loadHealth();
  } catch (error) { showToast((error as Error).message, true); }
});

Promise.allSettled([loadHealth(), loadModels(), loadOperations(), loadReferenceData()]);
