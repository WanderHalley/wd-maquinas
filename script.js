  // Carregar dados e renderizar
  await loadData();
  renderDashboard();
  updateSidebarInfo();
});
// ==========================================
// WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026
// script.js — CÓDIGO COMPLETO
// ==========================================

// ---------- SUPABASE ----------
const SUPABASE_URL = 'https://iwbsmsadctvndhrcjkbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GQpRJ7CFZOFrdmYfsN8rcA_ucfNR2AM';
let supabaseClient = null;
let appData = {};

// ---------- EDIT TOGGLE STATES ----------
let comprasEditMode = false;
let vendasEditMode = false;
let comprasSearchQuery = '';
let comprasFilterSit = '';
let comprasFilterPgto = '';
let vendasSearchQuery = '';
let vendasFilterSit = '';

// ---------- ID helper ----------
function nextId(arr) {
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(i => i.id || 0)) + 1;
}

// ---------- FORMAT HELPERS ----------
function formatCurrency(val) {
  return 'R$ ' + (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '-';
  const parts = d.split('-');
  if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
  return d;
}

// ---------- MÁSCARAS AUTOMÁTICAS ----------
function maskCPF(v) {
  v = v.replace(/\D/g, '').substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v;
}

function maskCNPJ(v) {
  v = v.replace(/\D/g, '').substring(0, 14);
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  return v;
}

function maskCPFouCNPJ(v) {
  var digits = v.replace(/\D/g, '');
  if (digits.length <= 11) return maskCPF(v);
  return maskCNPJ(v);
}

function maskTelefone(v) {
  v = v.replace(/\D/g, '').substring(0, 11);
  if (v.length <= 10) {
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return v;
}

function applyMask(inputId, maskFn) {
  var el = document.getElementById(inputId);
  if (!el) return;
  el.addEventListener('input', function() {
    var pos = el.selectionStart;
    var oldLen = el.value.length;
    el.value = maskFn(el.value);
    var newLen = el.value.length;
    el.setSelectionRange(pos + (newLen - oldLen), pos + (newLen - oldLen));
  });
}

function applyAllMasks() {
  setTimeout(function() {
    applyMask('clTelefone', maskTelefone);
    applyMask('clCelular', maskTelefone);
    applyMask('clCpf', maskCPF);
    applyMask('clCnpj', maskCNPJ);
    applyMask('clCpfCnpj', maskCPFouCNPJ);
    applyMask('fnTelefone', maskTelefone);
    applyMask('fnCelular', maskTelefone);
    applyMask('fnCpf', maskCPF);
    applyMask('fnCnpj', maskCNPJ);
    applyMask('fnCpfCnpj', maskCPFouCNPJ);
    applyMask('cfgCnpj', maskCNPJ);
  }, 100);
}

// ---------- DADOS PADRÃO ----------
function getDefaultData() {
  return {
    empresa: { nome: "WD Máquinas", cnpj: "29.595.239/0001-33", logo: "" },
    vendedores: ["Wander", "Daniel"],
    formasPagamento: ["Boleto","Caixa da Oficina","Cartão de Crédito MP","Cartão de Crédito PagBank","Cartão de Débito MP","Cartão de Débito PagBank","Dinheiro","Link MP","Link PagBank","MP","PagBank","Pix"],
    tipoUnidade: ["Unidade","Kg","Metro","Litro","Caixa","Pacote","Par","Jogo","Rolo","Barra","Chapa","Peça"],
    tipoVenda: ["Direta","Revenda"],
    situacaoCompra: ["Devendo","Guardado","Pago"],
    situacaoVenda: ["Devendo","Pago","Parcial"],
    situacaoEntrega: ["Entregue com Defeito","Entregue OK","Não Entregue","Pendente"],
    situacaoCheque: ["Compensado","Depositado","Devolvido","Em Mãos","Repassado"],
    situacaoGarantia: ["Ativa","Expirada","Utilizada"],
    situacaoBoleto: ["Pago","Pendente","Vencido"],
    categoriasFluxo: [
      { nome: "Salário", tipo: "entrada" },
      { nome: "Venda", tipo: "entrada" },
      { nome: "Serviço", tipo: "entrada" },
      { nome: "Outros (Entrada)", tipo: "entrada" },
      { nome: "Dinheiro em Notas", tipo: "entrada" },
      { nome: "Material", tipo: "saida" },
      { nome: "Combustível", tipo: "saida" },
      { nome: "Alimentação", tipo: "saida" },
      { nome: "Conta de Luz", tipo: "saida" },
      { nome: "Aluguel", tipo: "saida" },
      { nome: "Outros (Saída)", tipo: "saida" }
    ],
    clientes: [],
    fornecedores: [],
    produtos: [],
    pFornecedores: [],
    compras: [],
    vendas: [],
    estoque: [],
    boletos: [],
    cheques: [],
    prestacoes: [],
    projetos: [],
    pagClientes: [],
    garantias: [],
    notasEntrada: [],
    notasSaida: [],
    receitasMei: [],
    fluxoCaixa: {}
  };
}

// ---------- LOAD / SAVE ----------
async function loadData() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('wdmaquinas_data').select('*').eq('id', 1).single();
      if (data && data.payload) {
        appData = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
        ensureDefaults();
        console.log('Dados carregados do Supabase');
        return;
      }
    } catch (e) { console.warn('Supabase load falhou:', e.message); }
  }
  try {
    const local = localStorage.getItem('wdmaquinas_data');
    if (local) { appData = JSON.parse(local); ensureDefaults(); console.log('Dados carregados do localStorage'); return; }
  } catch (e) {}
  appData = getDefaultData();
  console.log('Dados padrão carregados');
}

async function saveData() {
  try { localStorage.setItem('wdmaquinas_data', JSON.stringify(appData)); } catch (e) {}
  if (supabaseClient) {
    try {
      await supabaseClient.from('wdmaquinas_data').upsert({ id: 1, payload: appData, updated_at: new Date().toISOString() });
    } catch (e) { console.warn('Supabase save falhou:', e.message); }
  }
}

function ensureDefaults() {
  const def = getDefaultData();
  Object.keys(def).forEach(k => { if (appData[k] === undefined) appData[k] = def[k]; });
  if (!appData.categoriasFluxo || appData.categoriasFluxo.length === 0) appData.categoriasFluxo = def.categoriasFluxo;
  if (!appData.situacaoVenda) appData.situacaoVenda = def.situacaoVenda;
}

// ---------- TOAST ----------
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || 'success');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ---------- MODAL HELPERS ----------
function openCadastroModal() { document.getElementById('cadastroModal').style.display = 'flex'; }
function closeCadastroModal() { document.getElementById('cadastroModal').style.display = 'none'; }
function openViewModal() { document.getElementById('viewModal').style.display = 'flex'; }
function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }

// ---------- SIDEBAR TOGGLE & COLLAPSE ----------
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

function collapseSidebar() {
  var sb = document.getElementById('sidebar');
  var btn = document.getElementById('expandBtn');
  sb.classList.toggle('collapsed');
  if (sb.classList.contains('collapsed')) {
    if (btn) btn.style.display = 'inline-flex';
  } else {
    if (btn) btn.style.display = 'none';
  }
}

function updateSidebarInfo() {
  var emp = appData.empresa || {};
  var nameEl = document.getElementById('sidebarNome');
  var cnpjEl = document.getElementById('sidebarCnpj');
  var logoEl = document.getElementById('sidebarLogo');
  if (nameEl && emp.nome) nameEl.textContent = emp.nome.toUpperCase();
  if (cnpjEl && emp.cnpj) cnpjEl.textContent = 'CNPJ: ' + emp.cnpj;
  if (logoEl && emp.logo) { logoEl.src = emp.logo; logoEl.style.display = 'block'; }
  else if (logoEl) { logoEl.style.display = 'none'; }
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
const mesesNav = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const pageTitles = {
  dashboard:'Dashboard', janeiro:'Fluxo de Caixa — Janeiro', fevereiro:'Fluxo de Caixa — Fevereiro',
  marco:'Fluxo de Caixa — Março', abril:'Fluxo de Caixa — Abril', maio:'Fluxo de Caixa — Maio',
  junho:'Fluxo de Caixa — Junho', julho:'Fluxo de Caixa — Julho', agosto:'Fluxo de Caixa — Agosto',
  setembro:'Fluxo de Caixa — Setembro', outubro:'Fluxo de Caixa — Outubro', novembro:'Fluxo de Caixa — Novembro',
  dezembro:'Fluxo de Caixa — Dezembro', compras:'Compras', vendas:'Vendas', estoque:'Estoque',
  produtos:'Produtos', clientes:'Clientes', fornecedores:'Fornecedores', pfornecedores:'Produtos de Fornecedores',
  boletos:'Boletos', cheques:'Cheques', prestacoes:'Prestações', projetos:'Projetos',
  pagclientes:'Pagamentos de Clientes', garantias:'Garantias', relatorios:'Relatórios',
  notasentrada:'Notas de Entrada', notassaida:'Notas de Saída', receitasmei:'Receitas MEI',
  configuracoes:'Configurações', backup:'Backup'
};

function navigateTo(page) {
  document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
  const target = document.getElementById('page-' + page);
  if (target) target.style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    if ((n.getAttribute('onclick') || '').includes("'" + page + "'")) n.classList.add('active');
  });
  document.getElementById('pageTitle').textContent = pageTitles[page] || page;
  document.getElementById('sidebar').classList.remove('open');

  const mesIdx = mesesNav.indexOf(page);
  if (mesIdx > -1) { renderFluxoMes(page, mesesNomes[mesIdx], mesIdx); return; }
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'compras': renderComprasPage(); break;
    case 'vendas': renderVendasPage(); break;
    case 'estoque': renderEstoquePage(); break;
    case 'produtos': renderProdutosPage(); break;
    case 'clientes': renderClientesPage(); break;
    case 'fornecedores': renderFornecedoresPage(); break;
    case 'pfornecedores': renderPFornecedoresPage(); break;
    case 'boletos': renderBoletosPage(); break;
    case 'cheques': renderChequesPage(); break;
    case 'prestacoes': renderPrestacoesPage(); break;
    case 'projetos': renderProjetosPage(); break;
    case 'pagclientes': renderPagClientesPage(); break;
    case 'garantias': renderGarantiasPage(); break;
    case 'relatorios': renderRelatoriosPage(); break;
    case 'notasentrada': renderNotasEntradaPage(); break;
    case 'notassaida': renderNotasSaidaPage(); break;
    case 'receitasmei': renderReceitasMeiPage(); break;
    case 'configuracoes': renderConfiguracoesPage(); break;
    case 'backup': renderBackupPage(); break;
  }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const compras = appData.compras || [];
  const vendas = appData.vendas || [];
  const totalCompras = compras.reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalVendas = vendas.reduce((s, v) => s + (v.quantidade * v.valorUnit), 0);
  const lucro = totalVendas - totalCompras;
  const boletosPend = (appData.boletos || []).filter(b => b.situacao !== 'Pago').length;

  let caixaAtual = 0;
  mesesNav.forEach(mes => {
    const fc = (appData.fluxoCaixa || {})[mes];
    if (fc && fc.lancamentos) {
      fc.lancamentos.forEach(l => { caixaAtual += l.tipo === 'entrada' ? (l.valor || 0) : -(l.valor || 0); });
    }
  });

  document.getElementById('dashboardCards').innerHTML = `
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>💰 Caixa Atual</span></div><div class="card-value ${caixaAtual >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(caixaAtual)}</div></div>
      <div class="card"><div class="card-header"><span>🛒 Total Compras</span></div><div class="card-value text-danger">${formatCurrency(totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>💰 Total Vendas</span></div><div class="card-value text-success">${formatCurrency(totalVendas)}</div></div>
      <div class="card"><div class="card-header"><span>📊 Lucro Bruto</span></div><div class="card-value ${lucro >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(lucro)}</div></div>
      <div class="card"><div class="card-header"><span>👥 Clientes</span></div><div class="card-value">${(appData.clientes||[]).length}</div></div>
      <div class="card"><div class="card-header"><span>🏭 Fornecedores</span></div><div class="card-value">${(appData.fornecedores||[]).length}</div></div>
      <div class="card"><div class="card-header"><span>🔖 Boletos Pendentes</span></div><div class="card-value text-warning">${boletosPend}</div></div>
      <div class="card"><div class="card-header"><span>📦 Entregas Pendentes</span></div><div class="card-value text-warning">${compras.filter(c=>c.entrega==='Pendente').length}</div></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-title">Últimas Vendas</div>
      <div class="table-responsive" style="border:none">
        <table class="table"><thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Total</th><th>Situação</th></tr></thead>
        <tbody>${vendas.slice(-5).reverse().map(v=>`<tr><td>${formatDate(v.data)}</td><td>${v.cliente||'-'}</td><td>${v.produto}</td><td>${formatCurrency(v.quantidade*v.valorUnit)}</td><td><span class="badge ${v.situacao==='Pago'?'badge-success':'badge-danger'}">${v.situacao}</span></td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma venda</td></tr>'}</tbody></table>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-title">Últimas Compras</div>
      <div class="table-responsive" style="border:none">
        <table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Total</th><th>Situação</th></tr></thead>
        <tbody>${compras.slice(-5).reverse().map(c=>`<tr><td>${formatDate(c.data)}</td><td>${c.produto}</td><td>${c.fornecedor}</td><td>${formatCurrency(c.quantidade*c.valorUnit)}</td><td><span class="badge ${c.situacao==='Pago'?'badge-success':'badge-danger'}">${c.situacao}</span></td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma compra</td></tr>'}</tbody></table>
      </div>
    </div>`;
}

// ============================================================
// FLUXO DE CAIXA MENSAL
// ============================================================
function renderFluxoMes(mesKey, mesNome, mesIdx) {
  const pg = document.getElementById('page-' + mesKey);
  if (!appData.fluxoCaixa) appData.fluxoCaixa = {};
  if (!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey] = { lancamentos: [] };
  const fc = appData.fluxoCaixa[mesKey];
  const lancs = fc.lancamentos || [];

  let caixaAnterior = 0;
  for (let i = 0; i < mesIdx; i++) {
    const fcAnt = (appData.fluxoCaixa || {})[mesesNav[i]];
    if (fcAnt && fcAnt.lancamentos) {
      fcAnt.lancamentos.forEach(l => { caixaAnterior += l.tipo === 'entrada' ? (l.valor || 0) : -(l.valor || 0); });
    }
  }

  const totalEntradas = lancs.filter(l => l.tipo === 'entrada').reduce((s, l) => s + (l.valor || 0), 0);
  const totalSaidas = lancs.filter(l => l.tipo === 'saida').reduce((s, l) => s + (l.valor || 0), 0);
  const caixaAtual = caixaAnterior + totalEntradas - totalSaidas;
  const dinheiroNotas = lancs.filter(l => l.categoria === 'Dinheiro em Notas').reduce((s, l) => s + (l.tipo === 'entrada' ? (l.valor||0) : -(l.valor||0)), 0);
  const salarioRec = lancs.filter(l => l.categoria === 'Salário' && l.tipo === 'entrada').reduce((s, l) => s + (l.valor || 0), 0);

  pg.innerHTML = `
    <div class="page-header">
      <h2>📅 ${mesNome} 2026</h2>
      <button class="btn btn-primary" onclick="openFluxoModal('${mesKey}')">+ Novo Lançamento</button>
    </div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>💰 Caixa Atual</span></div><div class="card-value ${caixaAtual>=0?'text-success':'text-danger'}">${formatCurrency(caixaAtual)}</div></div>
      <div class="card"><div class="card-header"><span>📈 Total Entradas</span></div><div class="card-value text-success">${formatCurrency(totalEntradas)}</div></div>
      <div class="card"><div class="card-header"><span>📉 Total Saídas</span></div><div class="card-value text-danger">${formatCurrency(totalSaidas)}</div></div>
      <div class="card"><div class="card-header"><span>💵 Dinheiro em Notas</span></div><div class="card-value">${formatCurrency(dinheiroNotas)}</div></div>
      <div class="card"><div class="card-header"><span>💼 Salário Recebido</span></div><div class="card-value">${formatCurrency(salarioRec)}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:200px" placeholder="Buscar..." oninput="filterFluxo('${mesKey}',this.value)">
      <select class="form-control" style="max-width:140px" onchange="filterFluxoTipo('${mesKey}',this.value)">
        <option value="">Todos</option><option value="entrada">Entradas</option><option value="saida">Saídas</option>
      </select>
    </div>
    <div class="table-responsive">
      <table class="table"><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead>
      <tbody id="fluxoBody-${mesKey}"></tbody></table>
    </div>`;
  renderFluxoTable(mesKey, lancs);
}

function renderFluxoTable(mesKey, lancs) {
  var tbody = document.getElementById('fluxoBody-' + mesKey);
  if (!tbody) return;
  var sorted = lancs.slice().sort(function(a, b) { return (a.data || '').localeCompare(b.data || ''); });
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum lançamento</td></tr>';
    return;
  }
  tbody.innerHTML = sorted.map(function(l) {
    var origIdx = lancs.indexOf(l);
    return '<tr>' +
      '<td>' + (l.data ? formatDate(l.data) : (l.dia || '-')) + '</td>' +
      '<td><span class="badge ' + (l.tipo === 'entrada' ? 'badge-success' : 'badge-danger') + '">' + (l.tipo === 'entrada' ? 'Entrada' : 'Saída') + '</span></td>' +
      '<td>' + (l.categoria || '-') + '</td>' +
      '<td>' + (l.descricao || '-') + '</td>' +
      '<td style="color:' + (l.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)') + '">' + (l.tipo === 'entrada' ? '+' : '-') + ' ' + formatCurrency(l.valor) + '</td>' +
      '<td>' +
        '<button class="btn btn-sm btn-primary" onclick="editFluxo(\'' + mesKey + '\',' + origIdx + ')">✏️</button> ' +
        '<button class="btn btn-sm btn-danger" onclick="deleteFluxo(\'' + mesKey + '\',' + origIdx + ')">🗑️</button>' +
      '</td></tr>';
  }).join('');
}

function filterFluxo(mesKey, q) {
  q = q.toLowerCase();
  const lancs = ((appData.fluxoCaixa||{})[mesKey]||{}).lancamentos || [];
  renderFluxoTable(mesKey, lancs.filter(l => (l.categoria||'').toLowerCase().includes(q) || (l.descricao||'').toLowerCase().includes(q)));
}

function filterFluxoTipo(mesKey, tipo) {
  const lancs = ((appData.fluxoCaixa||{})[mesKey]||{}).lancamentos || [];
  renderFluxoTable(mesKey, tipo ? lancs.filter(l => l.tipo === tipo) : lancs);
}

let fluxoModalTipo = 'entrada';

function openFluxoModal(mesKey, editIdx) {
  var isEdit = (editIdx !== undefined && editIdx !== null && editIdx !== 'null');
  var lanc = isEdit ? appData.fluxoCaixa[mesKey].lancamentos[editIdx] : null;
  fluxoModalTipo = lanc ? lanc.tipo : 'entrada';

  var cats = appData.categoriasFluxo || [];
  var catsFiltradas = cats.filter(function(c){ return c.tipo === fluxoModalTipo; });
  var catOpts = catsFiltradas.map(function(c){ return '<option value="' + c.nome + '"' + (lanc && lanc.categoria === c.nome ? ' selected' : '') + '>' + c.nome + '</option>'; }).join('');

  var hoje = new Date().toISOString().split('T')[0];
  var dataAtual = lanc && lanc.data ? lanc.data : hoje;

  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Lançamento' : 'Novo Lançamento';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-group"><label>Data *</label><input type="date" class="form-control" id="flData" value="' + dataAtual + '"></div>' +
    '<div class="form-group"><label>Tipo</label>' +
    '<div style="display:flex;gap:8px;margin-top:4px">' +
    '<button type="button" class="fluxo-tipo-btn ' + (fluxoModalTipo === 'entrada' ? 'entrada-active' : '') + '" id="btnEntrada" onclick="setFluxoTipo(\'entrada\')">ENTRADA</button>' +
    '<button type="button" class="fluxo-tipo-btn ' + (fluxoModalTipo === 'saida' ? 'saida-active' : '') + '" id="btnSaida" onclick="setFluxoTipo(\'saida\')">SAÍDA</button>' +
    '</div></div>' +
    '<div class="form-group"><label>Categoria</label><select class="form-control" id="flCat"><option value="">Selecione...</option>' + catOpts + '</select></div>' +
    '<div class="form-group"><label>Descrição</label><input type="text" class="form-control" id="flDesc" value="' + (lanc ? (lanc.descricao || '') : '') + '"></div>' +
    '<div class="form-group"><label>Valor *</label><input type="number" class="form-control" id="flValor" value="' + (lanc ? lanc.valor : '') + '" step="0.01" min="0"></div>';

  document.getElementById('cadastroModalFooter').innerHTML =
    '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>' +
    '<button class="btn btn-primary" id="btnSalvarFluxo">Salvar</button>';

  openCadastroModal();

  setTimeout(function(){
    var btnSalvar = document.getElementById('btnSalvarFluxo');
    if (btnSalvar) {
      btnSalvar.onclick = function(){ saveFluxo(mesKey, isEdit ? editIdx : null); };
    }
  }, 50);
}

function setFluxoTipo(tipo) {
  fluxoModalTipo = tipo;
  document.getElementById('btnEntrada').className = 'fluxo-tipo-btn ' + (tipo === 'entrada' ? 'entrada-active' : '');
  document.getElementById('btnSaida').className = 'fluxo-tipo-btn ' + (tipo === 'saida' ? 'saida-active' : '');
  var cats = (appData.categoriasFluxo || []).filter(function(c){ return c.tipo === tipo; });
  document.getElementById('flCat').innerHTML = '<option value="">Selecione...</option>' + cats.map(function(c){ return '<option value="' + c.nome + '">' + c.nome + '</option>'; }).join('');
}

function saveFluxo(mesKey, editIdx) {
  var dataEl = document.getElementById('flData');
  var catEl = document.getElementById('flCat');
  var descEl = document.getElementById('flDesc');
  var valorEl = document.getElementById('flValor');
  if (!dataEl || !valorEl) { showToast('Erro ao ler formulário', 'error'); return; }
  var data = dataEl.value;
  var cat = catEl ? catEl.value : '';
  var desc = descEl ? descEl.value : '';
  var valor = parseFloat(valorEl.value) || 0;
  if (!data) { showToast('Informe a data', 'error'); return; }
  if (valor <= 0) { showToast('Informe um valor válido', 'error'); return; }
  var partes = data.split('-');
  var dia = parseInt(partes[2]) || 1;
  var obj = { dia: dia, data: data, tipo: fluxoModalTipo, categoria: cat, descricao: desc, valor: valor };
  if (!appData.fluxoCaixa) appData.fluxoCaixa = {};
  if (!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey] = { lancamentos: [] };
  if (!appData.fluxoCaixa[mesKey].lancamentos) appData.fluxoCaixa[mesKey].lancamentos = [];
  if (editIdx !== null && editIdx !== undefined && editIdx >= 0) {
    appData.fluxoCaixa[mesKey].lancamentos[editIdx] = obj;
    showToast('Lançamento atualizado!', 'success');
  } else {
    appData.fluxoCaixa[mesKey].lancamentos.push(obj);
    showToast('Lançamento cadastrado!', 'success');
  }
  saveData();
  closeCadastroModal();
  var mesIdx = mesesNav.indexOf(mesKey);
  renderFluxoMes(mesKey, mesesNomes[mesIdx], mesIdx);
}

function editFluxo(mesKey, idx) {
  if (!appData.fluxoCaixa || !appData.fluxoCaixa[mesKey] || !appData.fluxoCaixa[mesKey].lancamentos) return;
  if (idx < 0 || idx >= appData.fluxoCaixa[mesKey].lancamentos.length) return;
  openFluxoModal(mesKey, idx);
}

function deleteFluxo(mesKey, idx) {
  if (!confirm('Excluir este lançamento?')) return;
  if (!appData.fluxoCaixa || !appData.fluxoCaixa[mesKey] || !appData.fluxoCaixa[mesKey].lancamentos) return;
  appData.fluxoCaixa[mesKey].lancamentos.splice(idx, 1);
  saveData();
  var mesIdx = mesesNav.indexOf(mesKey);
  renderFluxoMes(mesKey, mesesNomes[mesIdx], mesIdx);
  showToast('Lançamento excluído!', 'success');
}
// ============================================================
// COMPRAS — SEM COLUNA ID, COM EDITAR TODOS, EXCLUIR TODOS,
// PAINEL DE RESULTADO AGREGADO, FILTRO PGTO, LISTAS SITUAÇÃO/ENTREGA
// ============================================================
function getFilteredCompras() {
  let list = appData.compras || [];
  if (comprasSearchQuery) {
    const q = comprasSearchQuery.toLowerCase();
    list = list.filter(c => (c.produto||'').toLowerCase().includes(q) || (c.fornecedor||'').toLowerCase().includes(q));
  }
  if (comprasFilterSit) list = list.filter(c => c.situacao === comprasFilterSit);
  if (comprasFilterPgto) list = list.filter(c => c.formaPagamento === comprasFilterPgto);
  return list;
}

function renderComprasPage() {
  comprasSearchQuery = '';
  comprasFilterSit = '';
  comprasFilterPgto = '';
  comprasEditMode = false;
  const pg = document.getElementById('page-compras');
  const compras = appData.compras || [];
  const totalCompras = compras.reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalPago = compras.filter(c => c.situacao === 'Pago').reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalDevendo = compras.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);

  pg.innerHTML = `
    <div class="page-header">
      <h2>🛒 Compras</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="openCompraModal()">+ Nova Compra</button>
        <button class="btn btn-warning" id="btnEditAllCompras" onclick="toggleComprasEditMode()">📝 Editar Todos</button>
        <button class="btn btn-danger" onclick="deleteAllCompras()">🗑️ Excluir Todos</button>
      </div>
    </div>
    <div class="dashboard-grid" id="comprasCards">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">${formatCurrency(totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${compras.length}</div></div>
    </div>
    <div id="comprasResultPanel" style="display:none"></div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto/fornecedor..." id="comprasSearchInput" oninput="onComprasSearch(this.value)">
      <select class="form-control" style="max-width:150px" id="comprasSitFilter" onchange="onComprasFilterSit(this.value)">
        <option value="">Todas situações</option>${(appData.situacaoCompra||[]).map(s=>'<option value="'+s+'">'+s+'</option>').join('')}
      </select>
      <select class="form-control" style="max-width:160px" id="comprasPgtoFilter" onchange="onComprasFilterPgto(this.value)">
        <option value="">Todos pagamentos</option>${(appData.formasPagamento||[]).map(f=>'<option value="'+f+'">'+f+'</option>').join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr>
      <th>Data</th><th>Produto</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Fornecedor</th><th>Pgto</th><th>Situação</th><th>Entrega</th><th>Ações</th>
    </tr></thead>
    <tbody id="comprasBody"></tbody></table></div>`;
  renderComprasTable(compras);
}

function renderComprasTable(compras) {
  const tbody = document.getElementById('comprasBody');
  if (!tbody) return;
  if (compras.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma compra</td></tr>';
    return;
  }
  const sitOpts = (appData.situacaoCompra||[]);
  const entOpts = (appData.situacaoEntrega||[]);
  tbody.innerHTML = compras.map(c => {
    const sitSelect = '<select class="form-control" style="padding:4px 6px;font-size:0.75rem;min-width:100px" onchange="changeCompraField('+c.id+',\'situacao\',this.value)">' +
      sitOpts.map(s => '<option value="'+s+'"'+(c.situacao===s?' selected':'')+'>'+s+'</option>').join('') + '</select>';
    const entSelect = '<select class="form-control" style="padding:4px 6px;font-size:0.75rem;min-width:120px" onchange="changeCompraField('+c.id+',\'entrega\',this.value)">' +
      entOpts.map(s => '<option value="'+s+'"'+(c.entrega===s?' selected':'')+'>'+s+'</option>').join('') + '</select>';
    const editBtns = comprasEditMode ?
      '<button class="btn btn-sm btn-primary" onclick="editCompra('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCompra('+c.id+')">🗑️</button>' : '';
    return '<tr>' +
      '<td>'+formatDate(c.data)+'</td>' +
      '<td>'+c.produto+'</td>' +
      '<td>'+c.quantidade+'</td>' +
      '<td>'+formatCurrency(c.valorUnit)+'</td>' +
      '<td>'+formatCurrency(c.quantidade*c.valorUnit)+'</td>' +
      '<td>'+(c.fornecedor||'-')+'</td>' +
      '<td>'+(c.formaPagamento||'-')+'</td>' +
      '<td>'+sitSelect+'</td>' +
      '<td>'+entSelect+'</td>' +
      '<td><button class="btn btn-sm btn-outline" onclick="viewCompra('+c.id+')">👁️</button> '+editBtns+'</td>' +
      '</tr>';
  }).join('');
}

function changeCompraField(id, field, value) {
  const idx = (appData.compras||[]).findIndex(c => c.id === id);
  if (idx > -1) { appData.compras[idx][field] = value; saveData(); }
}

function onComprasSearch(q) {
  comprasSearchQuery = q;
  applyComprasFilters();
}

function onComprasFilterSit(s) {
  comprasFilterSit = s;
  applyComprasFilters();
}

function onComprasFilterPgto(p) {
  comprasFilterPgto = p;
  applyComprasFilters();
}

function applyComprasFilters() {
  const filtered = getFilteredCompras();
  renderComprasTable(filtered);
  renderComprasResultPanel(filtered);
}

function renderComprasResultPanel(filtered) {
  const panel = document.getElementById('comprasResultPanel');
  if (!panel) return;
  if (!comprasSearchQuery && !comprasFilterSit && !comprasFilterPgto) {
    panel.style.display = 'none';
    // Restore default cards
    const compras = appData.compras || [];
    const totalCompras = compras.reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
    const totalPago = compras.filter(c => c.situacao === 'Pago').reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
    const totalDevendo = compras.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
    const cards = document.getElementById('comprasCards');
    if (cards) cards.innerHTML = `
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">${formatCurrency(totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${compras.length}</div></div>`;
    return;
  }
  panel.style.display = 'block';
  const totalFiltered = filtered.reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalPago = filtered.filter(c => c.situacao === 'Pago').reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalDevendo = filtered.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalQtd = filtered.reduce((s, c) => s + (c.quantidade || 0), 0);
  const searchLabel = comprasSearchQuery ? (' — "' + comprasSearchQuery + '"') : '';
  panel.innerHTML = `
    <div class="card" style="margin-bottom:16px;border-color:var(--accent-primary)">
      <div class="section-title">📊 Resultado da Busca${searchLabel}</div>
      <div class="dashboard-grid">
        <div class="card"><div class="card-header"><span>Total Compras (filtro)</span></div><div class="card-value">${formatCurrency(totalFiltered)}</div></div>
        <div class="card"><div class="card-header"><span>Total Pago</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
        <div class="card"><div class="card-header"><span>Total Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
        <div class="card"><div class="card-header"><span>Qtd Comprada</span></div><div class="card-value">${totalQtd}</div></div>
      </div>
    </div>`;
  // Update top cards too
  const cards = document.getElementById('comprasCards');
  if (cards) cards.innerHTML = `
    <div class="card card-accent"><div class="card-header"><span>Total (filtro)</span></div><div class="card-value">${formatCurrency(totalFiltered)}</div></div>
    <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
    <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
    <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${filtered.length}</div></div>`;
}

function toggleComprasEditMode() {
  comprasEditMode = !comprasEditMode;
  const btn = document.getElementById('btnEditAllCompras');
  if (btn) {
    btn.textContent = comprasEditMode ? '✅ Desativar Edição' : '📝 Editar Todos';
    btn.className = comprasEditMode ? 'btn btn-secondary' : 'btn btn-warning';
  }
  renderComprasTable(getFilteredCompras());
}

function deleteAllCompras() {
  if (!appData.compras || appData.compras.length === 0) { showToast('Nenhuma compra para excluir','error'); return; }
  if (!confirm('Tem certeza que deseja EXCLUIR TODAS as compras? Esta ação não pode ser desfeita!')) return;
  appData.compras = [];
  saveData();
  renderComprasPage();
  showToast('Todas as compras foram excluídas!','success');
}

function openCompraModal(compra) {
  const isEdit = !!compra;
  const fornOpts = (appData.fornecedores||[]).map(f=>'<option value="'+f.nome+'"'+(compra&&compra.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>').join('');
  const pgtoOpts = (appData.formasPagamento||[]).map(f=>'<option value="'+f+'"'+(compra&&compra.formaPagamento===f?' selected':'')+'>'+f+'</option>').join('');
  const sitOpts = (appData.situacaoCompra||[]).map(s=>'<option value="'+s+'"'+(compra&&compra.situacao===s?' selected':'')+'>'+s+'</option>').join('');
  const entOpts = (appData.situacaoEntrega||[]).map(s=>'<option value="'+s+'"'+(compra&&compra.entrega===s?' selected':'')+'>'+s+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Compra' : 'Nova Compra';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="cpData" value="${compra?compra.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="cpVenc" value="${compra?compra.vencimento||'':''}"></div></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="cpProd" value="${compra?compra.produto:''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="cpQtd" value="${compra?compra.quantidade:1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="cpValor" value="${compra?compra.valorUnit:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="cpForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="cpPgto"><option value="">Selecione...</option>${pgtoOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Situação</label><select class="form-control" id="cpSit">${sitOpts}</select></div><div class="form-group"><label>Entrega</label><select class="form-control" id="cpEnt">${entOpts}</select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="cpObs" rows="2">${compra?compra.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCompra('+(isEdit?compra.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveCompra(id) {
  const obj = { data:document.getElementById('cpData').value, vencimento:document.getElementById('cpVenc').value, produto:document.getElementById('cpProd').value.trim(), quantidade:parseFloat(document.getElementById('cpQtd').value)||1, valorUnit:parseFloat(document.getElementById('cpValor').value)||0, fornecedor:document.getElementById('cpForn').value, formaPagamento:document.getElementById('cpPgto').value, situacao:document.getElementById('cpSit').value, entrega:document.getElementById('cpEnt').value, obs:document.getElementById('cpObs').value };
  if (!obj.produto) { showToast('Informe o produto','error'); return; }
  if (!appData.compras) appData.compras = [];
  if (id) { const idx=appData.compras.findIndex(c=>c.id===id); if(idx>-1){obj.id=id;appData.compras[idx]=obj;} } else { obj.id=nextId(appData.compras); appData.compras.push(obj); }
  saveData(); closeCadastroModal(); renderComprasPage(); showToast(id?'Compra atualizada!':'Compra cadastrada!','success');
}

function editCompra(id) { const c=(appData.compras||[]).find(x=>x.id===id); if(c)openCompraModal(c); }

function viewCompra(id) {
  const c=(appData.compras||[]).find(x=>x.id===id); if(!c)return;
  document.getElementById('viewModalTitle').textContent='Detalhes da Compra';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid">'+
    '<div class="detail-item"><span class="detail-label">Data</span>'+formatDate(c.data)+'</div><div class="detail-item"><span class="detail-label">Vencimento</span>'+formatDate(c.vencimento)+'</div>'+
    '<div class="detail-item"><span class="detail-label">Produto</span>'+c.produto+'</div><div class="detail-item"><span class="detail-label">Qtd</span>'+c.quantidade+'</div>'+
    '<div class="detail-item"><span class="detail-label">V.Unit</span>'+formatCurrency(c.valorUnit)+'</div><div class="detail-item"><span class="detail-label">Total</span>'+formatCurrency(c.quantidade*c.valorUnit)+'</div>'+
    '<div class="detail-item"><span class="detail-label">Fornecedor</span>'+(c.fornecedor||'-')+'</div><div class="detail-item"><span class="detail-label">Pgto</span>'+(c.formaPagamento||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Situação</span><span class="badge '+(c.situacao==='Pago'?'badge-success':'badge-danger')+'">'+c.situacao+'</span></div>'+
    '<div class="detail-item"><span class="detail-label">Entrega</span><span class="badge '+(c.entrega==='Entregue OK'?'badge-success':'badge-warning')+'">'+c.entrega+'</span></div>'+
    '</div>'+(c.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+c.obs+'</div>':'');
  openViewModal();
}

function deleteCompra(id) { if(!confirm('Excluir compra?'))return; appData.compras=(appData.compras||[]).filter(c=>c.id!==id); saveData(); renderComprasPage(); showToast('Compra excluída!','success'); }

// ============================================================
// VENDAS — SEM COLUNA ID, COM EDITAR TODOS, EXCLUIR TODOS,
// PAINEL DE RESULTADO AGREGADO, LISTA SITUAÇÃO
// ============================================================
function getFilteredVendas() {
  let list = appData.vendas || [];
  if (vendasSearchQuery) {
    const q = vendasSearchQuery.toLowerCase();
    list = list.filter(v => (v.produto||'').toLowerCase().includes(q) || (v.cliente||'').toLowerCase().includes(q));
  }
  if (vendasFilterSit) list = list.filter(v => v.situacao === vendasFilterSit);
  return list;
}

function renderVendasPage() {
  vendasSearchQuery = '';
  vendasFilterSit = '';
  vendasEditMode = false;
  const pg = document.getElementById('page-vendas');
  const vendas = appData.vendas || [];
  const totalVendas = vendas.reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);
  const totalPago = vendas.filter(v=>v.situacao==='Pago').reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);
  const totalDevendo = vendas.filter(v=>v.situacao==='Devendo').reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);

  pg.innerHTML = `
    <div class="page-header">
      <h2>💰 Vendas</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="openVendaModal()">+ Nova Venda</button>
        <button class="btn btn-warning" id="btnEditAllVendas" onclick="toggleVendasEditMode()">📝 Editar Todos</button>
        <button class="btn btn-danger" onclick="deleteAllVendas()">🗑️ Excluir Todos</button>
      </div>
    </div>
    <div class="dashboard-grid" id="vendasCards">
      <div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">${formatCurrency(totalVendas)}</div></div>
      <div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${vendas.length}</div></div>
    </div>
    <div id="vendasResultPanel" style="display:none"></div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto/cliente..." id="vendasSearchInput" oninput="onVendasSearch(this.value)">
      <select class="form-control" style="max-width:150px" id="vendasSitFilter" onchange="onVendasFilterSit(this.value)">
        <option value="">Todas situações</option>${(appData.situacaoVenda||appData.situacaoCompra||[]).map(s=>'<option value="'+s+'">'+s+'</option>').join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr>
      <th>Data</th><th>Produto</th><th>Cliente</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Vendedor</th><th>Pgto</th><th>Situação</th><th>Ações</th>
    </tr></thead>
    <tbody id="vendasBody"></tbody></table></div>`;
  renderVendasTable(vendas);
}

function renderVendasTable(vendas) {
  const tbody = document.getElementById('vendasBody');
  if (!tbody) return;
  if (vendas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma venda</td></tr>';
    return;
  }
  const sitOpts = (appData.situacaoVenda||appData.situacaoCompra||[]);
  tbody.innerHTML = vendas.map(v => {
    const sitSelect = '<select class="form-control" style="padding:4px 6px;font-size:0.75rem;min-width:100px" onchange="changeVendaField('+v.id+',\'situacao\',this.value)">' +
      sitOpts.map(s => '<option value="'+s+'"'+(v.situacao===s?' selected':'')+'>'+s+'</option>').join('') + '</select>';
    const editBtns = vendasEditMode ?
      '<button class="btn btn-sm btn-primary" onclick="editVenda('+v.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteVenda('+v.id+')">🗑️</button>' : '';
    return '<tr>' +
      '<td>'+formatDate(v.data)+'</td>' +
      '<td>'+v.produto+'</td>' +
      '<td>'+(v.cliente||'-')+'</td>' +
      '<td>'+v.quantidade+'</td>' +
      '<td>'+formatCurrency(v.valorUnit)+'</td>' +
      '<td>'+formatCurrency(v.quantidade*v.valorUnit)+'</td>' +
      '<td>'+(v.vendedor||'-')+'</td>' +
      '<td>'+(v.formaPagamento||'-')+'</td>' +
      '<td>'+sitSelect+'</td>' +
      '<td><button class="btn btn-sm btn-outline" onclick="viewVenda('+v.id+')">👁️</button> '+editBtns+'</td>' +
      '</tr>';
  }).join('');
}

function changeVendaField(id, field, value) {
  const idx = (appData.vendas||[]).findIndex(v => v.id === id);
  if (idx > -1) { appData.vendas[idx][field] = value; saveData(); }
}

function onVendasSearch(q) {
  vendasSearchQuery = q;
  applyVendasFilters();
}

function onVendasFilterSit(s) {
  vendasFilterSit = s;
  applyVendasFilters();
}

function applyVendasFilters() {
  const filtered = getFilteredVendas();
  renderVendasTable(filtered);
  renderVendasResultPanel(filtered);
}

function renderVendasResultPanel(filtered) {
  const panel = document.getElementById('vendasResultPanel');
  if (!panel) return;
  if (!vendasSearchQuery && !vendasFilterSit) {
    panel.style.display = 'none';
    const vendas = appData.vendas || [];
    const totalVendas = vendas.reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);
    const totalPago = vendas.filter(v=>v.situacao==='Pago').reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);
    const totalDevendo = vendas.filter(v=>v.situacao==='Devendo').reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);
    const cards = document.getElementById('vendasCards');
    if (cards) cards.innerHTML = `
      <div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">${formatCurrency(totalVendas)}</div></div>
      <div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${vendas.length}</div></div>`;
    return;
  }
  panel.style.display = 'block';
  const totalFiltered = filtered.reduce((s, v) => s + (v.quantidade * v.valorUnit), 0);
  const totalRecebido = filtered.filter(v => v.situacao === 'Pago').reduce((s, v) => s + (v.quantidade * v.valorUnit), 0);
  const totalDevendo = filtered.filter(v => v.situacao === 'Devendo').reduce((s, v) => s + (v.quantidade * v.valorUnit), 0);
  const totalQtd = filtered.reduce((s, v) => s + (v.quantidade || 0), 0);
  const searchLabel = vendasSearchQuery ? (' — "' + vendasSearchQuery + '"') : '';
  panel.innerHTML = `
    <div class="card" style="margin-bottom:16px;border-color:var(--accent-primary)">
      <div class="section-title">📊 Resultado da Busca${searchLabel}</div>
      <div class="dashboard-grid">
        <div class="card"><div class="card-header"><span>Total Vendas (filtro)</span></div><div class="card-value">${formatCurrency(totalFiltered)}</div></div>
        <div class="card"><div class="card-header"><span>Total Recebido</span></div><div class="card-value text-success">${formatCurrency(totalRecebido)}</div></div>
        <div class="card"><div class="card-header"><span>Total Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
        <div class="card"><div class="card-header"><span>Qtd Vendida</span></div><div class="card-value">${totalQtd}</div></div>
      </div>
    </div>`;
  const cards = document.getElementById('vendasCards');
  if (cards) cards.innerHTML = `
    <div class="card card-accent"><div class="card-header"><span>Total (filtro)</span></div><div class="card-value">${formatCurrency(totalFiltered)}</div></div>
    <div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">${formatCurrency(totalRecebido)}</div></div>
    <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
    <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${filtered.length}</div></div>`;
}

function toggleVendasEditMode() {
  vendasEditMode = !vendasEditMode;
  const btn = document.getElementById('btnEditAllVendas');
  if (btn) {
    btn.textContent = vendasEditMode ? '✅ Desativar Edição' : '📝 Editar Todos';
    btn.className = vendasEditMode ? 'btn btn-secondary' : 'btn btn-warning';
  }
  renderVendasTable(getFilteredVendas());
}

function deleteAllVendas() {
  if (!appData.vendas || appData.vendas.length === 0) { showToast('Nenhuma venda para excluir','error'); return; }
  if (!confirm('Tem certeza que deseja EXCLUIR TODAS as vendas? Esta ação não pode ser desfeita!')) return;
  appData.vendas = [];
  saveData();
  renderVendasPage();
  showToast('Todas as vendas foram excluídas!','success');
}

function openVendaModal(venda) {
  const isEdit = !!venda;
  const cliOpts = (appData.clientes||[]).map(c=>'<option value="'+c.nome+'"'+(venda&&venda.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>').join('');
  const vendedorOpts = (appData.vendedores||[]).map(v=>'<option value="'+v+'"'+(venda&&venda.vendedor===v?' selected':'')+'>'+v+'</option>').join('');
  const pgtoOpts = (appData.formasPagamento||[]).map(f=>'<option value="'+f+'"'+(venda&&venda.formaPagamento===f?' selected':'')+'>'+f+'</option>').join('');
  const sitOpts = (appData.situacaoVenda||appData.situacaoCompra||[]).map(s=>'<option value="'+s+'"'+(venda&&venda.situacao===s?' selected':'')+'>'+s+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Venda' : 'Nova Venda';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="vnData" value="${venda?venda.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="vnVenc" value="${venda?venda.vencimento||'':''}"></div></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="vnProd" value="${venda?venda.produto:''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="vnQtd" value="${venda?venda.quantidade:1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="vnValor" value="${venda?venda.valorUnit:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="vnCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Vendedor</label><select class="form-control" id="vnVend"><option value="">Selecione...</option>${vendedorOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="vnPgto"><option value="">Selecione...</option>${pgtoOpts}</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="vnSit">${sitOpts}</select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="vnObs" rows="2">${venda?venda.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda('+(isEdit?venda.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveVenda(id) {
  const obj = { data:document.getElementById('vnData').value, vencimento:document.getElementById('vnVenc').value, produto:document.getElementById('vnProd').value.trim(), quantidade:parseFloat(document.getElementById('vnQtd').value)||1, valorUnit:parseFloat(document.getElementById('vnValor').value)||0, cliente:document.getElementById('vnCli').value, vendedor:document.getElementById('vnVend').value, formaPagamento:document.getElementById('vnPgto').value, situacao:document.getElementById('vnSit').value, obs:document.getElementById('vnObs').value };
  if (!obj.produto) { showToast('Informe o produto','error'); return; }
  if (!appData.vendas) appData.vendas = [];
  if (id) { const idx=appData.vendas.findIndex(v=>v.id===id); if(idx>-1){obj.id=id;appData.vendas[idx]=obj;} } else { obj.id=nextId(appData.vendas); appData.vendas.push(obj); }
  saveData(); closeCadastroModal(); renderVendasPage(); showToast(id?'Venda atualizada!':'Venda cadastrada!','success');
}

function editVenda(id) { const v=(appData.vendas||[]).find(x=>x.id===id); if(v)openVendaModal(v); }

function viewVenda(id) {
  const v=(appData.vendas||[]).find(x=>x.id===id); if(!v)return;
  document.getElementById('viewModalTitle').textContent='Detalhes da Venda';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid">'+
    '<div class="detail-item"><span class="detail-label">Data</span>'+formatDate(v.data)+'</div><div class="detail-item"><span class="detail-label">Vencimento</span>'+formatDate(v.vencimento)+'</div>'+
    '<div class="detail-item"><span class="detail-label">Produto</span>'+v.produto+'</div><div class="detail-item"><span class="detail-label">Qtd</span>'+v.quantidade+'</div>'+
    '<div class="detail-item"><span class="detail-label">V.Unit</span>'+formatCurrency(v.valorUnit)+'</div><div class="detail-item"><span class="detail-label">Total</span>'+formatCurrency(v.quantidade*v.valorUnit)+'</div>'+
    '<div class="detail-item"><span class="detail-label">Cliente</span>'+(v.cliente||'-')+'</div><div class="detail-item"><span class="detail-label">Vendedor</span>'+(v.vendedor||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Pgto</span>'+(v.formaPagamento||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Situação</span><span class="badge '+(v.situacao==='Pago'?'badge-success':'badge-danger')+'">'+v.situacao+'</span></div>'+
    '</div>'+(v.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+v.obs+'</div>':'');
  openViewModal();
}

function deleteVenda(id) { if(!confirm('Excluir venda?'))return; appData.vendas=(appData.vendas||[]).filter(v=>v.id!==id); saveData(); renderVendasPage(); showToast('Venda excluída!','success'); }
// ============================================================
// ESTOQUE
// ============================================================
function renderEstoquePage() {
  const pg = document.getElementById('page-estoque');
  const estoque = appData.estoque || [];
  const totalItens = estoque.reduce((s,e) => s + (e.quantidade||0), 0);
  const totalValor = estoque.reduce((s,e) => s + ((e.quantidade||0)*(e.valorUnit||0)), 0);

  pg.innerHTML = `
    <div class="page-header"><h2>📦 Estoque</h2><button class="btn btn-primary" onclick="openEstoqueModal()">+ Novo Item</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Itens</span></div><div class="card-value">${totalItens}</div></div>
      <div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value">${formatCurrency(totalValor)}</div></div>
      <div class="card"><div class="card-header"><span>Produtos</span></div><div class="card-value">${estoque.length}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar no estoque..." oninput="filterEstoque(this.value)">
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Qtd</th><th>Unidade</th><th>V.Unit</th><th>Total</th><th>Localização</th><th>Ações</th></tr></thead>
    <tbody id="estoqueBody"></tbody></table></div>`;
  renderEstoqueTable(estoque);
}

function renderEstoqueTable(estoque) {
  const tbody = document.getElementById('estoqueBody');
  if (!tbody) return;
  if (estoque.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum item no estoque</td></tr>'; return; }
  tbody.innerHTML = estoque.map(e => '<tr>' +
    '<td>'+e.produto+'</td><td>'+e.quantidade+'</td><td>'+(e.unidade||'-')+'</td><td>'+formatCurrency(e.valorUnit)+'</td><td>'+formatCurrency((e.quantidade||0)*(e.valorUnit||0))+'</td><td>'+(e.localizacao||'-')+'</td>' +
    '<td><button class="btn btn-sm btn-outline" onclick="viewEstoque('+e.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editEstoque('+e.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteEstoque('+e.id+')">🗑️</button></td></tr>').join('');
}

function filterEstoque(q) { q=q.toLowerCase(); renderEstoqueTable((appData.estoque||[]).filter(e=>(e.produto||'').toLowerCase().includes(q))); }

function openEstoqueModal(item) {
  const isEdit = !!item;
  const unOpts = (appData.tipoUnidade||[]).map(u=>'<option value="'+u+'"'+(item&&item.unidade===u?' selected':'')+'>'+u+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Item' : 'Novo Item';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="estProd" value="${item?item.produto:''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="estQtd" value="${item?item.quantidade:0}" min="0"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="estUn"><option value="">Selecione...</option>${unOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="estValor" value="${item?item.valorUnit:''}" step="0.01"></div><div class="form-group"><label>Localização</label><input type="text" class="form-control" id="estLoc" value="${item?item.localizacao||'':''}"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="estObs" rows="2">${item?item.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEstoque('+(isEdit?item.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveEstoque(id) {
  const obj = { produto:document.getElementById('estProd').value.trim(), quantidade:parseFloat(document.getElementById('estQtd').value)||0, unidade:document.getElementById('estUn').value, valorUnit:parseFloat(document.getElementById('estValor').value)||0, localizacao:document.getElementById('estLoc').value, obs:document.getElementById('estObs').value };
  if (!obj.produto) { showToast('Informe o produto','error'); return; }
  if (!appData.estoque) appData.estoque = [];
  if (id) { const idx=appData.estoque.findIndex(e=>e.id===id); if(idx>-1){obj.id=id;appData.estoque[idx]=obj;} } else { obj.id=nextId(appData.estoque); appData.estoque.push(obj); }
  saveData(); closeCadastroModal(); renderEstoquePage(); showToast(id?'Item atualizado!':'Item cadastrado!','success');
}

function editEstoque(id) { const e=(appData.estoque||[]).find(x=>x.id===id); if(e)openEstoqueModal(e); }

function viewEstoque(id) {
  const e=(appData.estoque||[]).find(x=>x.id===id); if(!e)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Estoque';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid">'+
    '<div class="detail-item"><span class="detail-label">Produto</span>'+e.produto+'</div><div class="detail-item"><span class="detail-label">Qtd</span>'+e.quantidade+'</div>'+
    '<div class="detail-item"><span class="detail-label">Unidade</span>'+(e.unidade||'-')+'</div><div class="detail-item"><span class="detail-label">V.Unit</span>'+formatCurrency(e.valorUnit)+'</div>'+
    '<div class="detail-item"><span class="detail-label">Total</span>'+formatCurrency((e.quantidade||0)*(e.valorUnit||0))+'</div><div class="detail-item"><span class="detail-label">Localização</span>'+(e.localizacao||'-')+'</div>'+
    '</div>'+(e.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+e.obs+'</div>':'');
  openViewModal();
}

function deleteEstoque(id) { if(!confirm('Excluir item?'))return; appData.estoque=(appData.estoque||[]).filter(e=>e.id!==id); saveData(); renderEstoquePage(); showToast('Item excluído!','success'); }

// ============================================================
// PRODUTOS
// ============================================================
function renderProdutosPage() {
  const pg = document.getElementById('page-produtos');
  const prods = appData.produtos || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🏷️ Produtos</h2><button class="btn btn-primary" onclick="openProdutoModal()">+ Novo Produto</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto..." oninput="filterProdutos(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Categoria</th><th>Unidade</th><th>Preço Custo</th><th>Preço Venda</th><th>Ações</th></tr></thead>
    <tbody id="produtosBody"></tbody></table></div>`;
  renderProdutosTable(prods);
}

function renderProdutosTable(prods) {
  const tbody = document.getElementById('produtosBody');
  if (!tbody) return;
  if (prods.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto</td></tr>'; return; }
  tbody.innerHTML = prods.map(p => '<tr><td>'+p.nome+'</td><td>'+(p.categoria||'-')+'</td><td>'+(p.unidade||'-')+'</td><td>'+formatCurrency(p.precoCusto)+'</td><td>'+formatCurrency(p.precoVenda)+'</td>'+
    '<td><button class="btn btn-sm btn-primary" onclick="editProduto('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProduto('+p.id+')">🗑️</button></td></tr>').join('');
}

function filterProdutos(q) { q=q.toLowerCase(); renderProdutosTable((appData.produtos||[]).filter(p=>(p.nome||'').toLowerCase().includes(q))); }

function openProdutoModal(prod) {
  const isEdit = !!prod;
  const unOpts = (appData.tipoUnidade||[]).map(u=>'<option value="'+u+'"'+(prod&&prod.unidade===u?' selected':'')+'>'+u+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Produto' : 'Novo Produto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prNome" value="${prod?prod.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="prCat" value="${prod?prod.categoria||'':''}"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="prUn"><option value="">Selecione...</option>${unOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Preço Custo</label><input type="number" class="form-control" id="prCusto" value="${prod?prod.precoCusto:''}" step="0.01"></div><div class="form-group"><label>Preço Venda</label><input type="number" class="form-control" id="prVenda" value="${prod?prod.precoVenda:''}" step="0.01"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="prObs" rows="2">${prod?prod.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduto('+(isEdit?prod.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveProduto(id) {
  const obj = { nome:document.getElementById('prNome').value.trim(), categoria:document.getElementById('prCat').value, unidade:document.getElementById('prUn').value, precoCusto:parseFloat(document.getElementById('prCusto').value)||0, precoVenda:parseFloat(document.getElementById('prVenda').value)||0, obs:document.getElementById('prObs').value };
  if (!obj.nome) { showToast('Informe o nome','error'); return; }
  if (!appData.produtos) appData.produtos = [];
  if (id) { const idx=appData.produtos.findIndex(p=>p.id===id); if(idx>-1){obj.id=id;appData.produtos[idx]=obj;} } else { obj.id=nextId(appData.produtos); appData.produtos.push(obj); }
  saveData(); closeCadastroModal(); renderProdutosPage(); showToast(id?'Produto atualizado!':'Produto cadastrado!','success');
}

function editProduto(id) { const p=(appData.produtos||[]).find(x=>x.id===id); if(p)openProdutoModal(p); }
function deleteProduto(id) { if(!confirm('Excluir produto?'))return; appData.produtos=(appData.produtos||[]).filter(p=>p.id!==id); saveData(); renderProdutosPage(); showToast('Produto excluído!','success'); }

// ============================================================
// CLIENTES
// ============================================================
function renderClientesPage() {
  const pg = document.getElementById('page-clientes');
  const clientes = appData.clientes || [];
  pg.innerHTML = `
    <div class="page-header"><h2>👥 Clientes</h2><button class="btn btn-primary" onclick="openClienteModal()">+ Novo Cliente</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cliente..." oninput="filterClientes(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Cidade</th><th>Ações</th></tr></thead>
    <tbody id="clientesBody"></tbody></table></div>`;
  renderClientesTable(clientes);
}

function renderClientesTable(clientes) {
  const tbody = document.getElementById('clientesBody');
  if (!tbody) return;
  if (clientes.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cliente</td></tr>'; return; }
  tbody.innerHTML = clientes.map(c => '<tr><td>'+c.nome+'</td><td>'+(c.telefone||'-')+'</td><td>'+(c.email||'-')+'</td><td>'+(c.cidade||'-')+'</td>'+
    '<td><button class="btn btn-sm btn-outline" onclick="viewCliente('+c.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCliente('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCliente('+c.id+')">🗑️</button></td></tr>').join('');
}

function filterClientes(q) { q=q.toLowerCase(); renderClientesTable((appData.clientes||[]).filter(c=>(c.nome||'').toLowerCase().includes(q)||(c.telefone||'').includes(q))); }

function openClienteModal(cli) {
  const isEdit = !!cli;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Cliente' : 'Novo Cliente';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="clNome" value="${cli?cli.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="clTelefone" value="${cli?cli.telefone||'':''}"></div><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="clCelular" value="${cli?cli.celular||'':''}"></div></div>
    <div class="form-row"><div class="form-group"><label>CPF</label><input type="text" class="form-control" id="clCpf" value="${cli?cli.cpf||'':''}"></div><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="clCnpj" value="${cli?cli.cnpj||'':''}"></div></div>
    <div class="form-group"><label>Email</label><input type="email" class="form-control" id="clEmail" value="${cli?cli.email||'':''}"></div>
    <div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="clCidade" value="${cli?cli.cidade||'':''}"></div><div class="form-group"><label>Estado</label><input type="text" class="form-control" id="clEstado" value="${cli?cli.estado||'':''}" maxlength="2"></div></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="clEnd" value="${cli?cli.endereco||'':''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="clObs" rows="2">${cli?cli.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCliente('+(isEdit?cli.id:'null')+')">Salvar</button>';
  openCadastroModal();
  setTimeout(function(){
    applyMask('clTelefone', maskTelefone);
    applyMask('clCelular', maskTelefone);
    applyMask('clCpf', maskCPF);
    applyMask('clCnpj', maskCNPJ);
  }, 100);
}

function saveCliente(id) {
  const obj = { nome:document.getElementById('clNome').value.trim(), telefone:document.getElementById('clTelefone').value, celular:document.getElementById('clCelular').value, cpf:document.getElementById('clCpf').value, cnpj:document.getElementById('clCnpj').value, email:document.getElementById('clEmail').value, cidade:document.getElementById('clCidade').value, estado:document.getElementById('clEstado').value, endereco:document.getElementById('clEnd').value, obs:document.getElementById('clObs').value };
  if (!obj.nome) { showToast('Informe o nome','error'); return; }
  if (!appData.clientes) appData.clientes = [];
  if (id) { const idx=appData.clientes.findIndex(c=>c.id===id); if(idx>-1){obj.id=id;appData.clientes[idx]=obj;} } else { obj.id=nextId(appData.clientes); appData.clientes.push(obj); }
  saveData(); closeCadastroModal(); renderClientesPage(); showToast(id?'Cliente atualizado!':'Cliente cadastrado!','success');
}

function editCliente(id) { const c=(appData.clientes||[]).find(x=>x.id===id); if(c)openClienteModal(c); }

function viewCliente(id) {
  const c=(appData.clientes||[]).find(x=>x.id===id); if(!c)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Cliente';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid">'+
    '<div class="detail-item"><span class="detail-label">Nome</span>'+c.nome+'</div><div class="detail-item"><span class="detail-label">Telefone</span>'+(c.telefone||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Celular</span>'+(c.celular||'-')+'</div><div class="detail-item"><span class="detail-label">CPF</span>'+(c.cpf||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">CNPJ</span>'+(c.cnpj||'-')+'</div><div class="detail-item"><span class="detail-label">Email</span>'+(c.email||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Cidade</span>'+(c.cidade||'-')+'</div><div class="detail-item"><span class="detail-label">Estado</span>'+(c.estado||'-')+'</div>'+
    '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Endereço</span>'+(c.endereco||'-')+'</div>'+
    '</div>'+(c.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+c.obs+'</div>':'');
  openViewModal();
}

function deleteCliente(id) { if(!confirm('Excluir cliente?'))return; appData.clientes=(appData.clientes||[]).filter(c=>c.id!==id); saveData(); renderClientesPage(); showToast('Cliente excluído!','success'); }

// ============================================================
// FORNECEDORES
// ============================================================
function renderFornecedoresPage() {
  const pg = document.getElementById('page-fornecedores');
  const forns = appData.fornecedores || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🏭 Fornecedores</h2><button class="btn btn-primary" onclick="openFornecedorModal()">+ Novo Fornecedor</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar fornecedor..." oninput="filterFornecedores(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Cidade</th><th>Ações</th></tr></thead>
    <tbody id="fornecedoresBody"></tbody></table></div>`;
  renderFornecedoresTable(forns);
}

function renderFornecedoresTable(forns) {
  const tbody = document.getElementById('fornecedoresBody');
  if (!tbody) return;
  if (forns.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum fornecedor</td></tr>'; return; }
  tbody.innerHTML = forns.map(f => '<tr><td>'+f.nome+'</td><td>'+(f.telefone||'-')+'</td><td>'+(f.email||'-')+'</td><td>'+(f.cidade||'-')+'</td>'+
    '<td><button class="btn btn-sm btn-outline" onclick="viewFornecedor('+f.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editFornecedor('+f.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFornecedor('+f.id+')">🗑️</button></td></tr>').join('');
}

function filterFornecedores(q) { q=q.toLowerCase(); renderFornecedoresTable((appData.fornecedores||[]).filter(f=>(f.nome||'').toLowerCase().includes(q))); }

function openFornecedorModal(forn) {
  const isEdit = !!forn;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="fnNome" value="${forn?forn.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="fnTelefone" value="${forn?forn.telefone||'':''}"></div><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="fnCelular" value="${forn?forn.celular||'':''}"></div></div>
    <div class="form-row"><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="fnCnpj" value="${forn?forn.cnpj||'':''}"></div><div class="form-group"><label>Email</label><input type="email" class="form-control" id="fnEmail" value="${forn?forn.email||'':''}"></div></div>
    <div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="fnCidade" value="${forn?forn.cidade||'':''}"></div><div class="form-group"><label>Estado</label><input type="text" class="form-control" id="fnEstado" value="${forn?forn.estado||'':''}" maxlength="2"></div></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="fnEnd" value="${forn?forn.endereco||'':''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="fnObs" rows="2">${forn?forn.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFornecedor('+(isEdit?forn.id:'null')+')">Salvar</button>';
  openCadastroModal();
  setTimeout(function(){
    applyMask('fnTelefone', maskTelefone);
    applyMask('fnCelular', maskTelefone);
    applyMask('fnCnpj', maskCNPJ);
  }, 100);
}

function saveFornecedor(id) {
  const obj = { nome:document.getElementById('fnNome').value.trim(), telefone:document.getElementById('fnTelefone').value, celular:document.getElementById('fnCelular').value, cnpj:document.getElementById('fnCnpj').value, email:document.getElementById('fnEmail').value, cidade:document.getElementById('fnCidade').value, estado:document.getElementById('fnEstado').value, endereco:document.getElementById('fnEnd').value, obs:document.getElementById('fnObs').value };
  if (!obj.nome) { showToast('Informe o nome','error'); return; }
  if (!appData.fornecedores) appData.fornecedores = [];
  if (id) { const idx=appData.fornecedores.findIndex(f=>f.id===id); if(idx>-1){obj.id=id;appData.fornecedores[idx]=obj;} } else { obj.id=nextId(appData.fornecedores); appData.fornecedores.push(obj); }
  saveData(); closeCadastroModal(); renderFornecedoresPage(); showToast(id?'Fornecedor atualizado!':'Fornecedor cadastrado!','success');
}

function editFornecedor(id) { const f=(appData.fornecedores||[]).find(x=>x.id===id); if(f)openFornecedorModal(f); }

function viewFornecedor(id) {
  const f=(appData.fornecedores||[]).find(x=>x.id===id); if(!f)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Fornecedor';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid">'+
    '<div class="detail-item"><span class="detail-label">Nome</span>'+f.nome+'</div><div class="detail-item"><span class="detail-label">Telefone</span>'+(f.telefone||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Celular</span>'+(f.celular||'-')+'</div><div class="detail-item"><span class="detail-label">CNPJ</span>'+(f.cnpj||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Email</span>'+(f.email||'-')+'</div><div class="detail-item"><span class="detail-label">Cidade</span>'+(f.cidade||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Estado</span>'+(f.estado||'-')+'</div><div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Endereço</span>'+(f.endereco||'-')+'</div>'+
    '</div>'+(f.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+f.obs+'</div>':'');
  openViewModal();
}

function deleteFornecedor(id) { if(!confirm('Excluir fornecedor?'))return; appData.fornecedores=(appData.fornecedores||[]).filter(f=>f.id!==id); saveData(); renderFornecedoresPage(); showToast('Fornecedor excluído!','success'); }

// ============================================================
// PRODUTOS DE FORNECEDORES
// ============================================================
function renderPFornecedoresPage() {
  const pg = document.getElementById('page-pfornecedores');
  const pf = appData.pFornecedores || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📋 Produtos de Fornecedores</h2><button class="btn btn-primary" onclick="openPFornecedorModal()">+ Novo</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPFornecedores(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Fornecedor</th><th>Produto</th><th>Preço</th><th>Ações</th></tr></thead>
    <tbody id="pfornBody"></tbody></table></div>`;
  renderPFornecedoresTable(pf);
}

function renderPFornecedoresTable(pf) {
  const tbody = document.getElementById('pfornBody');
  if (!tbody) return;
  if (pf.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>'; return; }
  tbody.innerHTML = pf.map(p => '<tr><td>'+(p.fornecedor||'-')+'</td><td>'+p.produto+'</td><td>'+formatCurrency(p.preco)+'</td>'+
    '<td><button class="btn btn-sm btn-primary" onclick="editPFornecedor('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePFornecedor('+p.id+')">🗑️</button></td></tr>').join('');
}

function filterPFornecedores(q) { q=q.toLowerCase(); renderPFornecedoresTable((appData.pFornecedores||[]).filter(p=>(p.produto||'').toLowerCase().includes(q)||(p.fornecedor||'').toLowerCase().includes(q))); }

function openPFornecedorModal(pf) {
  const isEdit = !!pf;
  const fornOpts = (appData.fornecedores||[]).map(f=>'<option value="'+f.nome+'"'+(pf&&pf.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar' : 'Novo Produto de Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Fornecedor</label><select class="form-control" id="pfForn"><option value="">Selecione...</option>${fornOpts}</select></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="pfProd" value="${pf?pf.produto:''}"></div>
    <div class="form-group"><label>Preço</label><input type="number" class="form-control" id="pfPreco" value="${pf?pf.preco:''}" step="0.01"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pfObs" rows="2">${pf?pf.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePFornecedor('+(isEdit?pf.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function savePFornecedor(id) {
  const obj = { fornecedor:document.getElementById('pfForn').value, produto:document.getElementById('pfProd').value.trim(), preco:parseFloat(document.getElementById('pfPreco').value)||0, obs:document.getElementById('pfObs').value };
  if (!obj.produto) { showToast('Informe o produto','error'); return; }
  if (!appData.pFornecedores) appData.pFornecedores = [];
  if (id) { const idx=appData.pFornecedores.findIndex(p=>p.id===id); if(idx>-1){obj.id=id;appData.pFornecedores[idx]=obj;} } else { obj.id=nextId(appData.pFornecedores); appData.pFornecedores.push(obj); }
  saveData(); closeCadastroModal(); renderPFornecedoresPage(); showToast(id?'Registro atualizado!':'Registro cadastrado!','success');
}

function editPFornecedor(id) { const p=(appData.pFornecedores||[]).find(x=>x.id===id); if(p)openPFornecedorModal(p); }
function deletePFornecedor(id) { if(!confirm('Excluir?'))return; appData.pFornecedores=(appData.pFornecedores||[]).filter(p=>p.id!==id); saveData(); renderPFornecedoresPage(); showToast('Registro excluído!','success'); }
// ============================================================
// BOLETOS
// ============================================================
function renderBoletosPage() {
  const pg = document.getElementById('page-boletos');
  const boletos = appData.boletos || [];
  const totalPend = boletos.filter(b=>b.situacao!=='Pago').reduce((s,b)=>s+(b.valor||0),0);
  const totalPago = boletos.filter(b=>b.situacao==='Pago').reduce((s,b)=>s+(b.valor||0),0);
  pg.innerHTML = `
    <div class="page-header"><h2>🔖 Boletos</h2><button class="btn btn-primary" onclick="openBoletoModal()">+ Novo Boleto</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Pendente</span></div><div class="card-value text-warning">${formatCurrency(totalPend)}</div></div>
      <div class="card"><div class="card-header"><span>Total Pago</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${boletos.length}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar boleto..." oninput="filterBoletos(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterBoletosSit(this.value)">
        <option value="">Todas situações</option>${(appData.situacaoBoleto||[]).map(s=>'<option value="'+s+'">'+s+'</option>').join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Vencimento</th><th>Descrição</th><th>Valor</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="boletosBody"></tbody></table></div>`;
  renderBoletosTable(boletos);
}

function renderBoletosTable(boletos) {
  const tbody = document.getElementById('boletosBody');
  if (!tbody) return;
  if (boletos.length===0) { tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>'; return; }
  tbody.innerHTML = boletos.map(b => {
    const badge = b.situacao==='Pago'?'badge-success':b.situacao==='Vencido'?'badge-danger':'badge-warning';
    return '<tr><td>'+formatDate(b.vencimento)+'</td><td>'+(b.descricao||'-')+'</td><td>'+formatCurrency(b.valor)+'</td>'+
      '<td><span class="badge '+badge+'">'+b.situacao+'</span></td>'+
      '<td><button class="btn btn-sm btn-outline" onclick="viewBoleto('+b.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editBoleto('+b.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBoleto('+b.id+')">🗑️</button></td></tr>';
  }).join('');
}

function filterBoletos(q) { q=q.toLowerCase(); renderBoletosTable((appData.boletos||[]).filter(b=>(b.descricao||'').toLowerCase().includes(q))); }
function filterBoletosSit(s) { renderBoletosTable(s?(appData.boletos||[]).filter(b=>b.situacao===s):(appData.boletos||[])); }

function openBoletoModal(bol) {
  const isEdit = !!bol;
  const sitOpts = (appData.situacaoBoleto||[]).map(s=>'<option value="'+s+'"'+(bol&&bol.situacao===s?' selected':'')+'>'+s+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Boleto':'Novo Boleto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="bolVenc" value="${bol?bol.vencimento:''}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="bolValor" value="${bol?bol.valor:''}" step="0.01"></div></div>
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="bolDesc" value="${bol?bol.descricao:''}"></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="bolSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="bolObs" rows="2">${bol?bol.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBoleto('+(isEdit?bol.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveBoleto(id) {
  const obj = { vencimento:document.getElementById('bolVenc').value, valor:parseFloat(document.getElementById('bolValor').value)||0, descricao:document.getElementById('bolDesc').value.trim(), situacao:document.getElementById('bolSit').value, obs:document.getElementById('bolObs').value };
  if (!obj.descricao) { showToast('Informe a descrição','error'); return; }
  if (!appData.boletos) appData.boletos=[];
  if (id) { const idx=appData.boletos.findIndex(b=>b.id===id); if(idx>-1){obj.id=id;appData.boletos[idx]=obj;} } else { obj.id=nextId(appData.boletos); appData.boletos.push(obj); }
  saveData(); closeCadastroModal(); renderBoletosPage(); showToast(id?'Boleto atualizado!':'Boleto cadastrado!','success');
}

function editBoleto(id) { const b=(appData.boletos||[]).find(x=>x.id===id); if(b)openBoletoModal(b); }

function viewBoleto(id) {
  const b=(appData.boletos||[]).find(x=>x.id===id); if(!b)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Boleto';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid">'+
    '<div class="detail-item"><span class="detail-label">Vencimento</span>'+formatDate(b.vencimento)+'</div><div class="detail-item"><span class="detail-label">Valor</span>'+formatCurrency(b.valor)+'</div>'+
    '<div class="detail-item"><span class="detail-label">Descrição</span>'+b.descricao+'</div><div class="detail-item"><span class="detail-label">Situação</span><span class="badge '+(b.situacao==='Pago'?'badge-success':'badge-warning')+'">'+b.situacao+'</span></div>'+
    '</div>'+(b.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+b.obs+'</div>':'');
  openViewModal();
}

function deleteBoleto(id) { if(!confirm('Excluir boleto?'))return; appData.boletos=(appData.boletos||[]).filter(b=>b.id!==id); saveData(); renderBoletosPage(); showToast('Boleto excluído!','success'); }

// ============================================================
// CHEQUES
// ============================================================
function renderChequesPage() {
  const pg = document.getElementById('page-cheques');
  const cheques = appData.cheques || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📝 Cheques</h2><button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button></div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cheque..." oninput="filterCheques(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterChequesSit(this.value)">
        <option value="">Todas situações</option>${(appData.situacaoCheque||[]).map(s=>'<option value="'+s+'">'+s+'</option>').join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nº</th><th>Data</th><th>Valor</th><th>Destino</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="chequesBody"></tbody></table></div>`;
  renderChequesTable(cheques);
}

function renderChequesTable(cheques) {
  const tbody = document.getElementById('chequesBody');
  if (!tbody) return;
  if (cheques.length===0) { tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>'; return; }
  tbody.innerHTML = cheques.map(c => '<tr><td>'+(c.numero||'-')+'</td><td>'+formatDate(c.data)+'</td><td>'+formatCurrency(c.valor)+'</td><td>'+(c.destino||'-')+'</td>'+
    '<td><span class="badge '+(c.situacao==='Compensado'?'badge-success':'badge-warning')+'">'+c.situacao+'</span></td>'+
    '<td><button class="btn btn-sm btn-primary" onclick="editCheque('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCheque('+c.id+')">🗑️</button></td></tr>').join('');
}

function filterCheques(q) { q=q.toLowerCase(); renderChequesTable((appData.cheques||[]).filter(c=>(c.destino||'').toLowerCase().includes(q)||(c.numero||'').toLowerCase().includes(q))); }
function filterChequesSit(s) { renderChequesTable(s?(appData.cheques||[]).filter(c=>c.situacao===s):(appData.cheques||[])); }

function openChequeModal(chq) {
  const isEdit = !!chq;
  const sitOpts = (appData.situacaoCheque||[]).map(s=>'<option value="'+s+'"'+(chq&&chq.situacao===s?' selected':'')+'>'+s+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Cheque':'Novo Cheque';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Nº Cheque</label><input type="text" class="form-control" id="chqNum" value="${chq?chq.numero:''}"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="chqData" value="${chq?chq.data:new Date().toISOString().split('T')[0]}"></div></div>
    <div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="chqValor" value="${chq?chq.valor:''}" step="0.01"></div><div class="form-group"><label>Destino</label><input type="text" class="form-control" id="chqDest" value="${chq?chq.destino||'':''}"></div></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="chqSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="chqObs" rows="2">${chq?chq.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCheque('+(isEdit?chq.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveCheque(id) {
  const obj = { numero:document.getElementById('chqNum').value, data:document.getElementById('chqData').value, valor:parseFloat(document.getElementById('chqValor').value)||0, destino:document.getElementById('chqDest').value, situacao:document.getElementById('chqSit').value, obs:document.getElementById('chqObs').value };
  if (!appData.cheques) appData.cheques=[];
  if (id) { const idx=appData.cheques.findIndex(c=>c.id===id); if(idx>-1){obj.id=id;appData.cheques[idx]=obj;} } else { obj.id=nextId(appData.cheques); appData.cheques.push(obj); }
  saveData(); closeCadastroModal(); renderChequesPage(); showToast(id?'Cheque atualizado!':'Cheque cadastrado!','success');
}

function editCheque(id) { const c=(appData.cheques||[]).find(x=>x.id===id); if(c)openChequeModal(c); }
function deleteCheque(id) { if(!confirm('Excluir cheque?'))return; appData.cheques=(appData.cheques||[]).filter(c=>c.id!==id); saveData(); renderChequesPage(); showToast('Cheque excluído!','success'); }

// ============================================================
// PRESTAÇÕES
// ============================================================
function renderPrestacoesPage() {
  const pg = document.getElementById('page-prestacoes');
  const prest = appData.prestacoes || [];
  pg.innerHTML = `
    <div class="page-header"><h2>💳 Prestações</h2><button class="btn btn-primary" onclick="openPrestacaoModal()">+ Nova Prestação</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPrestacoes(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Descrição</th><th>Parcela</th><th>Valor</th><th>Vencimento</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="prestacoesBody"></tbody></table></div>`;
  renderPrestacoesTable(prest);
}

function renderPrestacoesTable(prest) {
  const tbody = document.getElementById('prestacoesBody');
  if (!tbody) return;
  if (prest.length===0) { tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma prestação</td></tr>'; return; }
  tbody.innerHTML = prest.map(p => '<tr><td>'+(p.descricao||'-')+'</td><td>'+(p.parcela||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+formatDate(p.vencimento)+'</td>'+
    '<td><span class="badge '+(p.situacao==='Pago'?'badge-success':'badge-warning')+'">'+(p.situacao||'Pendente')+'</span></td>'+
    '<td><button class="btn btn-sm btn-primary" onclick="editPrestacao('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePrestacao('+p.id+')">🗑️</button></td></tr>').join('');
}

function filterPrestacoes(q) { q=q.toLowerCase(); renderPrestacoesTable((appData.prestacoes||[]).filter(p=>(p.descricao||'').toLowerCase().includes(q))); }

function openPrestacaoModal(prest) {
  const isEdit = !!prest;
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Prestação':'Nova Prestação';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="prstDesc" value="${prest?prest.descricao:''}"></div>
    <div class="form-row"><div class="form-group"><label>Parcela</label><input type="text" class="form-control" id="prstParc" value="${prest?prest.parcela||'':''}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prstValor" value="${prest?prest.valor:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="prstVenc" value="${prest?prest.vencimento:''}"></div><div class="form-group"><label>Situação</label><select class="form-control" id="prstSit"><option value="Pendente" ${prest&&prest.situacao==='Pendente'?'selected':''}>Pendente</option><option value="Pago" ${prest&&prest.situacao==='Pago'?'selected':''}>Pago</option></select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="prstObs" rows="2">${prest?prest.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePrestacao('+(isEdit?prest.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function savePrestacao(id) {
  const obj = { descricao:document.getElementById('prstDesc').value.trim(), parcela:document.getElementById('prstParc').value, valor:parseFloat(document.getElementById('prstValor').value)||0, vencimento:document.getElementById('prstVenc').value, situacao:document.getElementById('prstSit').value, obs:document.getElementById('prstObs').value };
  if (!obj.descricao) { showToast('Informe a descrição','error'); return; }
  if (!appData.prestacoes) appData.prestacoes=[];
  if (id) { const idx=appData.prestacoes.findIndex(p=>p.id===id); if(idx>-1){obj.id=id;appData.prestacoes[idx]=obj;} } else { obj.id=nextId(appData.prestacoes); appData.prestacoes.push(obj); }
  saveData(); closeCadastroModal(); renderPrestacoesPage(); showToast(id?'Prestação atualizada!':'Prestação cadastrada!','success');
}

function editPrestacao(id) { const p=(appData.prestacoes||[]).find(x=>x.id===id); if(p)openPrestacaoModal(p); }
function deletePrestacao(id) { if(!confirm('Excluir prestação?'))return; appData.prestacoes=(appData.prestacoes||[]).filter(p=>p.id!==id); saveData(); renderPrestacoesPage(); showToast('Prestação excluída!','success'); }

// ============================================================
// PROJETOS
// ============================================================
function renderProjetosPage() {
  const pg = document.getElementById('page-projetos');
  const proj = appData.projetos || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📐 Projetos</h2><button class="btn btn-primary" onclick="openProjetoModal()">+ Novo Projeto</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar projeto..." oninput="filterProjetos(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Cliente</th><th>Valor</th><th>Início</th><th>Status</th><th>Ações</th></tr></thead>
    <tbody id="projetosBody"></tbody></table></div>`;
  renderProjetosTable(proj);
}

function renderProjetosTable(proj) {
  const tbody = document.getElementById('projetosBody');
  if (!tbody) return;
  if (proj.length===0) { tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum projeto</td></tr>'; return; }
  tbody.innerHTML = proj.map(p => '<tr><td>'+p.nome+'</td><td>'+(p.cliente||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+formatDate(p.inicio)+'</td>'+
    '<td><span class="badge '+(p.status==='Concluído'?'badge-success':p.status==='Em andamento'?'badge-info':'badge-warning')+'">'+(p.status||'Pendente')+'</span></td>'+
    '<td><button class="btn btn-sm btn-outline" onclick="viewProjeto('+p.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editProjeto('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProjeto('+p.id+')">🗑️</button></td></tr>').join('');
}

function filterProjetos(q) { q=q.toLowerCase(); renderProjetosTable((appData.projetos||[]).filter(p=>(p.nome||'').toLowerCase().includes(q)||(p.cliente||'').toLowerCase().includes(q))); }

function openProjetoModal(proj) {
  const isEdit = !!proj;
  const cliOpts = (appData.clientes||[]).map(c=>'<option value="'+c.nome+'"'+(proj&&proj.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Projeto':'Novo Projeto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="projNome" value="${proj?proj.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="projCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="projValor" value="${proj?proj.valor:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Início</label><input type="date" class="form-control" id="projInicio" value="${proj?proj.inicio:''}"></div><div class="form-group"><label>Previsão</label><input type="date" class="form-control" id="projPrev" value="${proj?proj.previsao||'':''}"></div></div>
    <div class="form-group"><label>Status</label><select class="form-control" id="projStatus"><option value="Pendente" ${proj&&proj.status==='Pendente'?'selected':''}>Pendente</option><option value="Em andamento" ${proj&&proj.status==='Em andamento'?'selected':''}>Em andamento</option><option value="Concluído" ${proj&&proj.status==='Concluído'?'selected':''}>Concluído</option></select></div>
    <div class="form-group"><label>Descrição</label><textarea class="form-control" id="projDesc" rows="2">${proj?proj.descricao||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProjeto('+(isEdit?proj.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveProjeto(id) {
  const obj = { nome:document.getElementById('projNome').value.trim(), cliente:document.getElementById('projCli').value, valor:parseFloat(document.getElementById('projValor').value)||0, inicio:document.getElementById('projInicio').value, previsao:document.getElementById('projPrev').value, status:document.getElementById('projStatus').value, descricao:document.getElementById('projDesc').value };
  if (!obj.nome) { showToast('Informe o nome','error'); return; }
  if (!appData.projetos) appData.projetos=[];
  if (id) { const idx=appData.projetos.findIndex(p=>p.id===id); if(idx>-1){obj.id=id;appData.projetos[idx]=obj;} } else { obj.id=nextId(appData.projetos); appData.projetos.push(obj); }
  saveData(); closeCadastroModal(); renderProjetosPage(); showToast(id?'Projeto atualizado!':'Projeto cadastrado!','success');
}

function editProjeto(id) { const p=(appData.projetos||[]).find(x=>x.id===id); if(p)openProjetoModal(p); }

function viewProjeto(id) {
  const p=(appData.projetos||[]).find(x=>x.id===id); if(!p)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Projeto';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid">'+
    '<div class="detail-item"><span class="detail-label">Nome</span>'+p.nome+'</div><div class="detail-item"><span class="detail-label">Cliente</span>'+(p.cliente||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Valor</span>'+formatCurrency(p.valor)+'</div><div class="detail-item"><span class="detail-label">Início</span>'+formatDate(p.inicio)+'</div>'+
    '<div class="detail-item"><span class="detail-label">Previsão</span>'+formatDate(p.previsao)+'</div><div class="detail-item"><span class="detail-label">Status</span><span class="badge '+(p.status==='Concluído'?'badge-success':'badge-info')+'">'+p.status+'</span></div>'+
    '</div>'+(p.descricao?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Descrição:</strong> '+p.descricao+'</div>':'');
  openViewModal();
}

function deleteProjeto(id) { if(!confirm('Excluir projeto?'))return; appData.projetos=(appData.projetos||[]).filter(p=>p.id!==id); saveData(); renderProjetosPage(); showToast('Projeto excluído!','success'); }

// ============================================================
// PAGAMENTOS DE CLIENTES
// ============================================================
function renderPagClientesPage() {
  const pg = document.getElementById('page-pagclientes');
  const pags = appData.pagClientes || [];
  const totalRec = pags.reduce((s,p)=>s+(p.valor||0),0);
  pg.innerHTML = `
    <div class="page-header"><h2>🤝 Pagamentos de Clientes</h2><button class="btn btn-primary" onclick="openPagClienteModal()">+ Novo Pagamento</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Recebido</span></div><div class="card-value text-success">${formatCurrency(totalRec)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${pags.length}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPagClientes(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Cliente</th><th>Valor</th><th>Forma Pgto</th><th>Ações</th></tr></thead>
    <tbody id="pagClientesBody"></tbody></table></div>`;
  renderPagClientesTable(pags);
}

function renderPagClientesTable(pags) {
  const tbody = document.getElementById('pagClientesBody');
  if (!tbody) return;
  if (pags.length===0) { tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum pagamento</td></tr>'; return; }
  tbody.innerHTML = pags.map(p => '<tr><td>'+formatDate(p.data)+'</td><td>'+(p.cliente||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+(p.formaPagamento||'-')+'</td>'+
    '<td><button class="btn btn-sm btn-primary" onclick="editPagCliente('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePagCliente('+p.id+')">🗑️</button></td></tr>').join('');
}

function filterPagClientes(q) { q=q.toLowerCase(); renderPagClientesTable((appData.pagClientes||[]).filter(p=>(p.cliente||'').toLowerCase().includes(q))); }

function openPagClienteModal(pag) {
  const isEdit = !!pag;
  const cliOpts = (appData.clientes||[]).map(c=>'<option value="'+c.nome+'"'+(pag&&pag.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>').join('');
  const pgtoOpts = (appData.formasPagamento||[]).map(f=>'<option value="'+f+'"'+(pag&&pag.formaPagamento===f?' selected':'')+'>'+f+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Pagamento':'Novo Pagamento';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="pgcData" value="${pag?pag.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pgcValor" value="${pag?pag.valor:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="pgcCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="pgcPgto"><option value="">Selecione...</option>${pgtoOpts}</select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pgcObs" rows="2">${pag?pag.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePagCliente('+(isEdit?pag.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function savePagCliente(id) {
  const obj = { data:document.getElementById('pgcData').value, valor:parseFloat(document.getElementById('pgcValor').value)||0, cliente:document.getElementById('pgcCli').value, formaPagamento:document.getElementById('pgcPgto').value, obs:document.getElementById('pgcObs').value };
  if (!appData.pagClientes) appData.pagClientes=[];
  if (id) { const idx=appData.pagClientes.findIndex(p=>p.id===id); if(idx>-1){obj.id=id;appData.pagClientes[idx]=obj;} } else { obj.id=nextId(appData.pagClientes); appData.pagClientes.push(obj); }
  saveData(); closeCadastroModal(); renderPagClientesPage(); showToast(id?'Pagamento atualizado!':'Pagamento cadastrado!','success');
}

function editPagCliente(id) { const p=(appData.pagClientes||[]).find(x=>x.id===id); if(p)openPagClienteModal(p); }
function deletePagCliente(id) { if(!confirm('Excluir pagamento?'))return; appData.pagClientes=(appData.pagClientes||[]).filter(p=>p.id!==id); saveData(); renderPagClientesPage(); showToast('Pagamento excluído!','success'); }

// ============================================================
// GARANTIAS
// ============================================================
function renderGarantiasPage() {
  const pg = document.getElementById('page-garantias');
  const gars = appData.garantias || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🛡️ Garantias</h2><button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button></div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar garantia..." oninput="filterGarantias(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterGarantiasSit(this.value)">
        <option value="">Todas situações</option>${(appData.situacaoGarantia||[]).map(s=>'<option value="'+s+'">'+s+'</option>').join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Fornecedor</th><th>Validade</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="garantiasBody"></tbody></table></div>`;
  renderGarantiasTable(gars);
}

function renderGarantiasTable(gars) {
  const tbody = document.getElementById('garantiasBody');
  if (!tbody) return;
  if (gars.length===0) { tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>'; return; }
  tbody.innerHTML = gars.map(g => '<tr><td>'+g.produto+'</td><td>'+(g.fornecedor||'-')+'</td><td>'+formatDate(g.validade)+'</td>'+
    '<td><span class="badge '+(g.situacao==='Ativa'?'badge-success':g.situacao==='Expirada'?'badge-danger':'badge-warning')+'">'+g.situacao+'</span></td>'+
    '<td><button class="btn btn-sm btn-outline" onclick="viewGarantia('+g.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editGarantia('+g.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGarantia('+g.id+')">🗑️</button></td></tr>').join('');
}

function filterGarantias(q) { q=q.toLowerCase(); renderGarantiasTable((appData.garantias||[]).filter(g=>(g.produto||'').toLowerCase().includes(q))); }
function filterGarantiasSit(s) { renderGarantiasTable(s?(appData.garantias||[]).filter(g=>g.situacao===s):(appData.garantias||[])); }

function openGarantiaModal(gar) {
  const isEdit = !!gar;
  const sitOpts = (appData.situacaoGarantia||[]).map(s=>'<option value="'+s+'"'+(gar&&gar.situacao===s?' selected':'')+'>'+s+'</option>').join('');
  const fornOpts = (appData.fornecedores||[]).map(f=>'<option value="'+f.nome+'"'+(gar&&gar.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Garantia':'Nova Garantia';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="garProd" value="${gar?gar.produto:''}"></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="garForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Validade</label><input type="date" class="form-control" id="garVal" value="${gar?gar.validade:''}"></div></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="garSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="garObs" rows="2">${gar?gar.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGarantia('+(isEdit?gar.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveGarantia(id) {
  const obj = { produto:document.getElementById('garProd').value.trim(), fornecedor:document.getElementById('garForn').value, validade:document.getElementById('garVal').value, situacao:document.getElementById('garSit').value, obs:document.getElementById('garObs').value };
  if (!obj.produto) { showToast('Informe o produto','error'); return; }
  if (!appData.garantias) appData.garantias=[];
  if (id) { const idx=appData.garantias.findIndex(g=>g.id===id); if(idx>-1){obj.id=id;appData.garantias[idx]=obj;} } else { obj.id=nextId(appData.garantias); appData.garantias.push(obj); }
  saveData(); closeCadastroModal(); renderGarantiasPage(); showToast(id?'Garantia atualizada!':'Garantia cadastrada!','success');
}

function editGarantia(id) { const g=(appData.garantias||[]).find(x=>x.id===id); if(g)openGarantiaModal(g); }

function viewGarantia(id) {
  const g=(appData.garantias||[]).find(x=>x.id===id); if(!g)return;
  document.getElementById('viewModalTitle').textContent='Detalhes da Garantia';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid">'+
    '<div class="detail-item"><span class="detail-label">Produto</span>'+g.produto+'</div><div class="detail-item"><span class="detail-label">Fornecedor</span>'+(g.fornecedor||'-')+'</div>'+
    '<div class="detail-item"><span class="detail-label">Validade</span>'+formatDate(g.validade)+'</div><div class="detail-item"><span class="detail-label">Situação</span><span class="badge '+(g.situacao==='Ativa'?'badge-success':'badge-danger')+'">'+g.situacao+'</span></div>'+
    '</div>'+(g.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+g.obs+'</div>':'');
  openViewModal();
}

function deleteGarantia(id) { if(!confirm('Excluir garantia?'))return; appData.garantias=(appData.garantias||[]).filter(g=>g.id!==id); saveData(); renderGarantiasPage(); showToast('Garantia excluída!','success'); }
// ============================================================
// RELATÓRIOS
// ============================================================
function renderRelatoriosPage() {
  const pg = document.getElementById('page-relatorios');
  const compras = appData.compras || [];
  const vendas = appData.vendas || [];
  const totalCompras = compras.reduce((s,c) => s + (c.quantidade*c.valorUnit), 0);
  const totalVendas = vendas.reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);
  const lucro = totalVendas - totalCompras;
  const totalProdutos = (appData.produtos||[]).length;

  let fluxoResumo = '';
  mesesNav.forEach((mes, i) => {
    const fc = (appData.fluxoCaixa||{})[mes];
    if (!fc || !fc.lancamentos || fc.lancamentos.length === 0) return;
    const ent = fc.lancamentos.filter(l=>l.tipo==='entrada').reduce((s,l)=>s+(l.valor||0),0);
    const sai = fc.lancamentos.filter(l=>l.tipo==='saida').reduce((s,l)=>s+(l.valor||0),0);
    fluxoResumo += '<tr><td>'+mesesNomes[i]+'</td><td class="text-success">'+formatCurrency(ent)+'</td><td class="text-danger">'+formatCurrency(sai)+'</td><td class="'+(ent-sai>=0?'text-success':'text-danger')+'">'+formatCurrency(ent-sai)+'</td></tr>';
  });

  // Top produtos comprados
  const prodCompras = {};
  compras.forEach(c => {
    if (!prodCompras[c.produto]) prodCompras[c.produto] = { qtd:0, total:0 };
    prodCompras[c.produto].qtd += c.quantidade||0;
    prodCompras[c.produto].total += (c.quantidade||0)*(c.valorUnit||0);
  });
  const topCompras = Object.entries(prodCompras).sort((a,b)=>b[1].total-a[1].total).slice(0,5);

  // Top clientes vendas
  const cliVendas = {};
  vendas.forEach(v => {
    const cli = v.cliente || 'Sem cliente';
    if (!cliVendas[cli]) cliVendas[cli] = { qtd:0, total:0 };
    cliVendas[cli].qtd += v.quantidade||0;
    cliVendas[cli].total += (v.quantidade||0)*(v.valorUnit||0);
  });
  const topClientes = Object.entries(cliVendas).sort((a,b)=>b[1].total-a[1].total).slice(0,5);

  pg.innerHTML = `
    <div class="page-header"><h2>📈 Relatórios</h2></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">${formatCurrency(totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">${formatCurrency(totalVendas)}</div></div>
      <div class="card"><div class="card-header"><span>Lucro Bruto</span></div><div class="card-value ${lucro>=0?'text-success':'text-danger'}">${formatCurrency(lucro)}</div></div>
      <div class="card"><div class="card-header"><span>Produtos Cadastrados</span></div><div class="card-value">${totalProdutos}</div></div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">📊 Fluxo de Caixa Mensal</div>
      <div class="table-responsive" style="border:none">
        <table class="table"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead>
        <tbody>${fluxoResumo || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum lançamento</td></tr>'}</tbody></table>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="section-title">🛒 Top 5 Produtos Comprados</div>
        <div class="table-responsive" style="border:none">
          <table class="table"><thead><tr><th>Produto</th><th>Qtd</th><th>Total</th></tr></thead>
          <tbody>${topCompras.length>0 ? topCompras.map(([nome,d])=>'<tr><td>'+nome+'</td><td>'+d.qtd+'</td><td>'+formatCurrency(d.total)+'</td></tr>').join('') : '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Sem dados</td></tr>'}</tbody></table>
        </div>
      </div>
      <div class="card">
        <div class="section-title">👥 Top 5 Clientes (Vendas)</div>
        <div class="table-responsive" style="border:none">
          <table class="table"><thead><tr><th>Cliente</th><th>Qtd</th><th>Total</th></tr></thead>
          <tbody>${topClientes.length>0 ? topClientes.map(([nome,d])=>'<tr><td>'+nome+'</td><td>'+d.qtd+'</td><td>'+formatCurrency(d.total)+'</td></tr>').join('') : '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Sem dados</td></tr>'}</tbody></table>
        </div>
      </div>
    </div>`;
}

// ============================================================
// NOTAS DE ENTRADA
// ============================================================
function renderNotasEntradaPage() {
  const pg = document.getElementById('page-notasentrada');
  const notas = appData.notasEntrada || [];
  const totalNotas = notas.reduce((s,n)=>s+(n.valor||0),0);
  pg.innerHTML = `
    <div class="page-header"><h2>📥 Notas de Entrada</h2><button class="btn btn-primary" onclick="openNotaEntradaModal()">+ Nova Nota</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">${formatCurrency(totalNotas)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${notas.length}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar nota..." oninput="filterNotasEntrada(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Nº Nota</th><th>Fornecedor</th><th>Valor</th><th>Ações</th></tr></thead>
    <tbody id="notasEntradaBody"></tbody></table></div>`;
  renderNotasEntradaTable(notas);
}

function renderNotasEntradaTable(notas) {
  const tbody = document.getElementById('notasEntradaBody');
  if (!tbody) return;
  if (notas.length===0) { tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>'; return; }
  tbody.innerHTML = notas.map(n => '<tr><td>'+formatDate(n.data)+'</td><td>'+(n.numero||'-')+'</td><td>'+(n.fornecedor||'-')+'</td><td>'+formatCurrency(n.valor)+'</td>'+
    '<td><button class="btn btn-sm btn-primary" onclick="editNotaEntrada('+n.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada('+n.id+')">🗑️</button></td></tr>').join('');
}

function filterNotasEntrada(q) { q=q.toLowerCase(); renderNotasEntradaTable((appData.notasEntrada||[]).filter(n=>(n.fornecedor||'').toLowerCase().includes(q)||(n.numero||'').toLowerCase().includes(q))); }

function openNotaEntradaModal(nota) {
  const isEdit = !!nota;
  const fornOpts = (appData.fornecedores||[]).map(f=>'<option value="'+f.nome+'"'+(nota&&nota.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Nota de Entrada':'Nova Nota de Entrada';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="neData" value="${nota?nota.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="neNum" value="${nota?nota.numero||'':''}"></div></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="neForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="neValor" value="${nota?nota.valor:''}" step="0.01"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="neObs" rows="2">${nota?nota.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaEntrada('+(isEdit?nota.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveNotaEntrada(id) {
  const obj = { data:document.getElementById('neData').value, numero:document.getElementById('neNum').value, fornecedor:document.getElementById('neForn').value, valor:parseFloat(document.getElementById('neValor').value)||0, obs:document.getElementById('neObs').value };
  if (!appData.notasEntrada) appData.notasEntrada=[];
  if (id) { const idx=appData.notasEntrada.findIndex(n=>n.id===id); if(idx>-1){obj.id=id;appData.notasEntrada[idx]=obj;} } else { obj.id=nextId(appData.notasEntrada); appData.notasEntrada.push(obj); }
  saveData(); closeCadastroModal(); renderNotasEntradaPage(); showToast(id?'Nota atualizada!':'Nota cadastrada!','success');
}

function editNotaEntrada(id) { const n=(appData.notasEntrada||[]).find(x=>x.id===id); if(n)openNotaEntradaModal(n); }
function deleteNotaEntrada(id) { if(!confirm('Excluir nota?'))return; appData.notasEntrada=(appData.notasEntrada||[]).filter(n=>n.id!==id); saveData(); renderNotasEntradaPage(); showToast('Nota excluída!','success'); }

// ============================================================
// NOTAS DE SAÍDA
// ============================================================
function renderNotasSaidaPage() {
  const pg = document.getElementById('page-notassaida');
  const notas = appData.notasSaida || [];
  const totalNotas = notas.reduce((s,n)=>s+(n.valor||0),0);
  pg.innerHTML = `
    <div class="page-header"><h2>📤 Notas de Saída</h2><button class="btn btn-primary" onclick="openNotaSaidaModal()">+ Nova Nota</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">${formatCurrency(totalNotas)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${notas.length}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar nota..." oninput="filterNotasSaida(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Nº Nota</th><th>Cliente</th><th>Valor</th><th>Ações</th></tr></thead>
    <tbody id="notasSaidaBody"></tbody></table></div>`;
  renderNotasSaidaTable(notas);
}

function renderNotasSaidaTable(notas) {
  const tbody = document.getElementById('notasSaidaBody');
  if (!tbody) return;
  if (notas.length===0) { tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>'; return; }
  tbody.innerHTML = notas.map(n => '<tr><td>'+formatDate(n.data)+'</td><td>'+(n.numero||'-')+'</td><td>'+(n.cliente||'-')+'</td><td>'+formatCurrency(n.valor)+'</td>'+
    '<td><button class="btn btn-sm btn-primary" onclick="editNotaSaida('+n.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaSaida('+n.id+')">🗑️</button></td></tr>').join('');
}

function filterNotasSaida(q) { q=q.toLowerCase(); renderNotasSaidaTable((appData.notasSaida||[]).filter(n=>(n.cliente||'').toLowerCase().includes(q)||(n.numero||'').toLowerCase().includes(q))); }

function openNotaSaidaModal(nota) {
  const isEdit = !!nota;
  const cliOpts = (appData.clientes||[]).map(c=>'<option value="'+c.nome+'"'+(nota&&nota.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Nota de Saída':'Nova Nota de Saída';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="nsData" value="${nota?nota.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="nsNum" value="${nota?nota.numero||'':''}"></div></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="nsCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="nsValor" value="${nota?nota.valor:''}" step="0.01"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="nsObs" rows="2">${nota?nota.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaSaida('+(isEdit?nota.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveNotaSaida(id) {
  const obj = { data:document.getElementById('nsData').value, numero:document.getElementById('nsNum').value, cliente:document.getElementById('nsCli').value, valor:parseFloat(document.getElementById('nsValor').value)||0, obs:document.getElementById('nsObs').value };
  if (!appData.notasSaida) appData.notasSaida=[];
  if (id) { const idx=appData.notasSaida.findIndex(n=>n.id===id); if(idx>-1){obj.id=id;appData.notasSaida[idx]=obj;} } else { obj.id=nextId(appData.notasSaida); appData.notasSaida.push(obj); }
  saveData(); closeCadastroModal(); renderNotasSaidaPage(); showToast(id?'Nota atualizada!':'Nota cadastrada!','success');
}

function editNotaSaida(id) { const n=(appData.notasSaida||[]).find(x=>x.id===id); if(n)openNotaSaidaModal(n); }
function deleteNotaSaida(id) { if(!confirm('Excluir nota?'))return; appData.notasSaida=(appData.notasSaida||[]).filter(n=>n.id!==id); saveData(); renderNotasSaidaPage(); showToast('Nota excluída!','success'); }

// ============================================================
// RECEITAS MEI
// ============================================================
function renderReceitasMeiPage() {
  const pg = document.getElementById('page-receitasmei');
  const rec = appData.receitasMei || [];
  const totalRec = rec.reduce((s,r)=>s+(r.valor||0),0);
  pg.innerHTML = `
    <div class="page-header"><h2>📄 Receitas MEI</h2><button class="btn btn-primary" onclick="openReceitaMeiModal()">+ Nova Receita</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Receitas</span></div><div class="card-value text-success">${formatCurrency(totalRec)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${rec.length}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar receita..." oninput="filterReceitasMei(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead>
    <tbody id="receitasMeiBody"></tbody></table></div>`;
  renderReceitasMeiTable(rec);
}

function renderReceitasMeiTable(rec) {
  const tbody = document.getElementById('receitasMeiBody');
  if (!tbody) return;
  if (rec.length===0) { tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma receita</td></tr>'; return; }
  tbody.innerHTML = rec.map(r => '<tr><td>'+formatDate(r.data)+'</td><td>'+(r.descricao||'-')+'</td><td>'+formatCurrency(r.valor)+'</td>'+
    '<td><button class="btn btn-sm btn-primary" onclick="editReceitaMei('+r.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteReceitaMei('+r.id+')">🗑️</button></td></tr>').join('');
}

function filterReceitasMei(q) { q=q.toLowerCase(); renderReceitasMeiTable((appData.receitasMei||[]).filter(r=>(r.descricao||'').toLowerCase().includes(q))); }

function openReceitaMeiModal(rec) {
  const isEdit = !!rec;
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar Receita':'Nova Receita MEI';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="rmData" value="${rec?rec.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="rmValor" value="${rec?rec.valor:''}" step="0.01"></div></div>
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="rmDesc" value="${rec?rec.descricao:''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="rmObs" rows="2">${rec?rec.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveReceitaMei('+(isEdit?rec.id:'null')+')">Salvar</button>';
  openCadastroModal();
}

function saveReceitaMei(id) {
  const obj = { data:document.getElementById('rmData').value, valor:parseFloat(document.getElementById('rmValor').value)||0, descricao:document.getElementById('rmDesc').value.trim(), obs:document.getElementById('rmObs').value };
  if (!obj.descricao) { showToast('Informe a descrição','error'); return; }
  if (!appData.receitasMei) appData.receitasMei=[];
  if (id) { const idx=appData.receitasMei.findIndex(r=>r.id===id); if(idx>-1){obj.id=id;appData.receitasMei[idx]=obj;} } else { obj.id=nextId(appData.receitasMei); appData.receitasMei.push(obj); }
  saveData(); closeCadastroModal(); renderReceitasMeiPage(); showToast(id?'Receita atualizada!':'Receita cadastrada!','success');
}

function editReceitaMei(id) { const r=(appData.receitasMei||[]).find(x=>x.id===id); if(r)openReceitaMeiModal(r); }
function deleteReceitaMei(id) { if(!confirm('Excluir receita?'))return; appData.receitasMei=(appData.receitasMei||[]).filter(r=>r.id!==id); saveData(); renderReceitasMeiPage(); showToast('Receita excluída!','success'); }
// ============================================================
// CONFIGURAÇÕES
// ============================================================
function renderConfiguracoesPage() {
  const pg = document.getElementById('page-configuracoes');
  const emp = appData.empresa || {};
  const vendedores = appData.vendedores || [];
  const formas = appData.formasPagamento || [];
  const cats = appData.categoriasFluxo || [];

  pg.innerHTML = `
    <div class="page-header"><h2>⚙️ Configurações</h2></div>

    <!-- EMPRESA -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">🏢 Dados da Empresa</div>
      <div class="form-row">
        <div class="form-group"><label>Nome da Empresa</label><input type="text" class="form-control" id="cfgNome" value="${emp.nome||''}"></div>
        <div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="${emp.cnpj||''}"></div>
      </div>
      <div class="form-group">
        <label>Logo da Empresa (dimensão recomendada: 220 x 70 px, máx 500KB)</label>
        <div class="logo-upload-area" id="logoUploadArea" onclick="document.getElementById('logoFileInput').click()">
          ${emp.logo ? '<img src="'+emp.logo+'" alt="Logo" id="logoPreview">' : '<div id="logoPreview" style="display:none"></div>'}
          <div class="upload-text">${emp.logo ? 'Clique para trocar a logo' : '📁 Clique para escolher a logo'}</div>
          <div class="upload-hint">PNG, JPG ou SVG — 220×70px recomendado</div>
        </div>
        <input type="file" id="logoFileInput" accept="image/png,image/jpeg,image/svg+xml" style="display:none" onchange="handleLogoUpload(event)">
        ${emp.logo ? '<button class="btn btn-sm btn-danger" style="margin-top:8px" onclick="removeLogo()">Remover Logo</button>' : ''}
      </div>
      <button class="btn btn-primary" onclick="saveEmpresa()">💾 Salvar Empresa</button>
    </div>

    <!-- VENDEDORES -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">👤 Vendedores</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        ${vendedores.map((v,i) => '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg-tertiary);padding:6px 12px;border-radius:20px;font-size:0.8rem">'+v+' <button class="btn btn-sm btn-danger" style="padding:2px 6px;font-size:0.7rem" onclick="removeVendedor('+i+')">✕</button></span>').join('')}
      </div>
      <div style="display:flex;gap:8px">
        <input type="text" class="form-control" id="novoVendedor" placeholder="Nome do vendedor" style="max-width:250px">
        <button class="btn btn-primary btn-sm" onclick="addVendedor()">+ Adicionar</button>
      </div>
    </div>

    <!-- FORMAS DE PAGAMENTO -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">💳 Formas de Pagamento</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        ${formas.map((f,i) => '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg-tertiary);padding:6px 12px;border-radius:20px;font-size:0.8rem">'+f+' <button class="btn btn-sm btn-danger" style="padding:2px 6px;font-size:0.7rem" onclick="removeFormaPgto('+i+')">✕</button></span>').join('')}
      </div>
      <div style="display:flex;gap:8px">
        <input type="text" class="form-control" id="novaFormaPgto" placeholder="Nova forma de pagamento" style="max-width:250px">
        <button class="btn btn-primary btn-sm" onclick="addFormaPgto()">+ Adicionar</button>
      </div>
    </div>

    <!-- CATEGORIAS FLUXO -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">📂 Categorias do Fluxo de Caixa</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        ${cats.map((c,i) => '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg-tertiary);padding:6px 12px;border-radius:20px;font-size:0.8rem"><span class="badge '+(c.tipo==='entrada'?'badge-success':'badge-danger')+'" style="margin-right:4px">'+(c.tipo==='entrada'?'E':'S')+'</span>'+c.nome+' <button class="btn btn-sm btn-danger" style="padding:2px 6px;font-size:0.7rem" onclick="removeCatFluxo('+i+')">✕</button></span>').join('')}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input type="text" class="form-control" id="novaCatFluxo" placeholder="Nova categoria" style="max-width:200px">
        <select class="form-control" id="novaCatFluxoTipo" style="max-width:120px">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="addCatFluxo()">+ Adicionar</button>
      </div>
    </div>`;

  // Apply CNPJ mask
  setTimeout(function(){ applyMask('cfgCnpj', maskCNPJ); }, 100);
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024) { showToast('Arquivo muito grande! Máximo 500KB.','error'); return; }
  if (!file.type.match(/image\/(png|jpeg|svg\+xml)/)) { showToast('Formato inválido. Use PNG, JPG ou SVG.','error'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    appData.empresa.logo = e.target.result;
    saveData();
    updateSidebarInfo();
    renderConfiguracoesPage();
    showToast('Logo atualizada!','success');
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  appData.empresa.logo = '';
  saveData();
  updateSidebarInfo();
  renderConfiguracoesPage();
  showToast('Logo removida!','success');
}

function saveEmpresa() {
  appData.empresa.nome = document.getElementById('cfgNome').value.trim();
  appData.empresa.cnpj = document.getElementById('cfgCnpj').value.trim();
  saveData();
  updateSidebarInfo();
  showToast('Dados da empresa salvos!','success');
}

function addVendedor() {
  const v = document.getElementById('novoVendedor').value.trim();
  if (!v) { showToast('Informe o nome','error'); return; }
  if (!appData.vendedores) appData.vendedores = [];
  if (appData.vendedores.includes(v)) { showToast('Vendedor já existe','error'); return; }
  appData.vendedores.push(v);
  saveData(); renderConfiguracoesPage(); showToast('Vendedor adicionado!','success');
}

function removeVendedor(i) {
  appData.vendedores.splice(i, 1);
  saveData(); renderConfiguracoesPage(); showToast('Vendedor removido!','success');
}

function addFormaPgto() {
  const f = document.getElementById('novaFormaPgto').value.trim();
  if (!f) { showToast('Informe a forma de pagamento','error'); return; }
  if (!appData.formasPagamento) appData.formasPagamento = [];
  if (appData.formasPagamento.includes(f)) { showToast('Forma já existe','error'); return; }
  appData.formasPagamento.push(f);
  appData.formasPagamento.sort();
  saveData(); renderConfiguracoesPage(); showToast('Forma de pagamento adicionada!','success');
}

function removeFormaPgto(i) {
  appData.formasPagamento.splice(i, 1);
  saveData(); renderConfiguracoesPage(); showToast('Forma removida!','success');
}

function addCatFluxo() {
  const nome = document.getElementById('novaCatFluxo').value.trim();
  const tipo = document.getElementById('novaCatFluxoTipo').value;
  if (!nome) { showToast('Informe a categoria','error'); return; }
  if (!appData.categoriasFluxo) appData.categoriasFluxo = [];
  if (appData.categoriasFluxo.some(c => c.nome === nome && c.tipo === tipo)) { showToast('Categoria já existe','error'); return; }
  appData.categoriasFluxo.push({ nome: nome, tipo: tipo });
  saveData(); renderConfiguracoesPage(); showToast('Categoria adicionada!','success');
}

function removeCatFluxo(i) {
  appData.categoriasFluxo.splice(i, 1);
  saveData(); renderConfiguracoesPage(); showToast('Categoria removida!','success');
}

// ============================================================
// BACKUP
// ============================================================
function renderBackupPage() {
  const pg = document.getElementById('page-backup');
  pg.innerHTML = `
    <div class="page-header"><h2>💾 Backup</h2></div>

    <!-- SUPABASE STATUS -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">☁️ Supabase (Nuvem)</div>
      <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:12px">Status: <span id="supabaseStatus" style="color:var(--warning)">Verificando...</span></p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="forceUpload()">⬆️ Forçar Upload</button>
        <button class="btn btn-secondary" onclick="forceDownload()">⬇️ Forçar Download</button>
      </div>
    </div>

    <!-- EXPORT / IMPORT JSON -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">📁 Exportar / Importar JSON</div>
      <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:12px">Faça backup dos seus dados em arquivo JSON local.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="exportBackup()">📥 Exportar Backup</button>
        <button class="btn btn-secondary" onclick="document.getElementById('importFileInput').click()">📤 Importar Backup</button>
        <input type="file" id="importFileInput" accept=".json" style="display:none" onchange="importBackup(event)">
      </div>
    </div>

    <!-- EXCLUIR TUDO -->
    <div class="card" style="border-color:var(--danger)">
      <div class="section-title" style="color:var(--danger)">⚠️ Zona de Perigo</div>
      <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:12px">Excluir todos os dados permanentemente. Esta ação não pode ser desfeita!</p>
      <button class="btn btn-danger" onclick="excluirTodosDados()">🗑️ Excluir Todos os Dados</button>
    </div>`;
  checkSupabase();
}

async function checkSupabase() {
  const el = document.getElementById('supabaseStatus');
  if (!el) return;
  if (!supabaseClient) { el.textContent = '❌ Não conectado'; el.style.color = 'var(--danger)'; return; }
  try {
    const { data, error } = await supabaseClient.from('wdmaquinas_data').select('updated_at').eq('id', 1).single();
    if (error) throw error;
    el.textContent = '✅ Conectado — Último update: ' + (data.updated_at ? new Date(data.updated_at).toLocaleString('pt-BR') : 'N/A');
    el.style.color = 'var(--success)';
  } catch (e) {
    el.textContent = '❌ Erro: ' + e.message;
    el.style.color = 'var(--danger)';
  }
}

async function forceUpload() {
  if (!supabaseClient) { showToast('Supabase não conectado','error'); return; }
  try {
    await supabaseClient.from('wdmaquinas_data').upsert({ id: 1, payload: appData, updated_at: new Date().toISOString() });
    showToast('Upload concluído!','success');
    checkSupabase();
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function forceDownload() {
  if (!supabaseClient) { showToast('Supabase não conectado','error'); return; }
  try {
    const { data, error } = await supabaseClient.from('wdmaquinas_data').select('*').eq('id', 1).single();
    if (error) throw error;
    if (data && data.payload) {
      appData = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
      ensureDefaults();
      try { localStorage.setItem('wdmaquinas_data', JSON.stringify(appData)); } catch(e){}
      showToast('Download concluído! Dados restaurados.','success');
      renderDashboard();
      updateSidebarInfo();
    } else {
      showToast('Nenhum dado encontrado no Supabase','error');
    }
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wdmaquinas_backup_' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exportado!','success');
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported || typeof imported !== 'object') throw new Error('Formato inválido');
      if (!confirm('Isso irá SUBSTITUIR todos os dados atuais. Deseja continuar?')) return;
      appData = imported;
      ensureDefaults();
      saveData();
      updateSidebarInfo();
      renderDashboard();
      navigateTo('dashboard');
      showToast('Backup importado com sucesso!','success');
    } catch (err) {
      showToast('Erro ao importar: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function excluirTodosDados() {
  if (!confirm('ATENÇÃO: Isso irá excluir TODOS os dados permanentemente!\n\nTem certeza?')) return;
  if (!confirm('ÚLTIMA CONFIRMAÇÃO: Todos os dados serão perdidos. Continuar?')) return;
  appData = getDefaultData();
  saveData();
  updateSidebarInfo();
  renderDashboard();
  navigateTo('dashboard');
  showToast('Todos os dados foram excluídos!','success');
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
window.addEventListener('DOMContentLoaded', async function() {
  // Conectar Supabase
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Supabase conectado');
    } catch (e) {
      console.warn('Erro ao conectar Supabase:', e.message);
    }
  }

  // Data atual
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const hoje = new Date();
    const dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    dateEl.textContent = dias[hoje.getDay()] + ', ' + hoje.getDate() + ' de ' + meses[hoje.getMonth()] + ' de ' + hoje.getFullYear();
  }

  // Carregar dados e renderizar
  await loadData();
  renderDashboard();
  updateSidebarInfo();
});
