// ==========================================
// WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026
// script.js — CÓDIGO COMPLETO
// ==========================================

// ---------- SUPABASE ----------
const SUPABASE_URL = 'https://iwbsmsadctvndhrcjkbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GQpRJ7CFZOFrdmYfsN8rcA_ucfNR2AM';
let supabaseClient = null;
let appData = {};

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
    btn.style.display = 'inline-flex';
  } else {
    btn.style.display = 'none';
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
        <tbody>${vendas.slice(-5).reverse().map(v=>`<tr><td>${formatDate(v.data)}</td><td>${v.cliente}</td><td>${v.produto}</td><td>${formatCurrency(v.quantidade*v.valorUnit)}</td><td><span class="badge ${v.situacao==='Pago'?'badge-success':'badge-danger'}">${v.situacao}</span></td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma venda</td></tr>'}</tbody></table>
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
// COMPRAS
// ============================================================
function renderComprasPage() {
  const pg = document.getElementById('page-compras');
  const compras = appData.compras || [];
  const totalCompras = compras.reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalPago = compras.filter(c => c.situacao === 'Pago').reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalDevendo = compras.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);

  pg.innerHTML = `
    <div class="page-header"><h2>🛒 Compras</h2><button class="btn btn-primary" onclick="openCompraModal()">+ Nova Compra</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">${formatCurrency(totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${compras.length}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar compra..." oninput="filterCompras(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterComprasSit(this.value)">
        <option value="">Todas situações</option>${(appData.situacaoCompra||[]).map(s=>`<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Data</th><th>Produto</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Fornecedor</th><th>Pgto</th><th>Situação</th><th>Entrega</th><th>Ações</th></tr></thead>
    <tbody id="comprasBody"></tbody></table></div>`;
  renderComprasTable(compras);
}

function renderComprasTable(compras) {
  const tbody = document.getElementById('comprasBody');
  if (!tbody) return;
  tbody.innerHTML = compras.length === 0 ? '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma compra</td></tr>' :
    compras.map(c => `<tr>
      <td>${c.id}</td><td>${formatDate(c.data)}</td><td>${c.produto}</td><td>${c.quantidade}</td><td>${formatCurrency(c.valorUnit)}</td><td>${formatCurrency(c.quantidade*c.valorUnit)}</td><td>${c.fornecedor}</td><td>${c.formaPagamento}</td>
      <td><span class="badge ${c.situacao==='Pago'?'badge-success':c.situacao==='Devendo'?'badge-danger':'badge-warning'}">${c.situacao}</span></td>
      <td><span class="badge ${c.entrega==='Entregue OK'?'badge-success':'badge-warning'}">${c.entrega}</span></td>
      <td><button class="btn btn-sm btn-outline" onclick="viewCompra(${c.id})">👁️</button><button class="btn btn-sm btn-primary" onclick="editCompra(${c.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteCompra(${c.id})">🗑️</button></td>
    </tr>`).join('');
}

function filterCompras(q) { q=q.toLowerCase(); renderComprasTable((appData.compras||[]).filter(c=>c.produto.toLowerCase().includes(q)||c.fornecedor.toLowerCase().includes(q))); }
function filterComprasSit(s) { renderComprasTable(s?(appData.compras||[]).filter(c=>c.situacao===s):(appData.compras||[])); }

function openCompraModal(compra) {
  const isEdit = !!compra;
  const fornOpts = (appData.fornecedores||[]).map(f=>`<option value="${f.nome}" ${compra&&compra.fornecedor===f.nome?'selected':''}>${f.nome}</option>`).join('');
  const pgtoOpts = (appData.formasPagamento||[]).map(f=>`<option value="${f}" ${compra&&compra.formaPagamento===f?'selected':''}>${f}</option>`).join('');
  const sitOpts = (appData.situacaoCompra||[]).map(s=>`<option value="${s}" ${compra&&compra.situacao===s?'selected':''}>${s}</option>`).join('');
  const entOpts = (appData.situacaoEntrega||[]).map(s=>`<option value="${s}" ${compra&&compra.entrega===s?'selected':''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Compra' : 'Nova Compra';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="cpData" value="${compra?compra.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="cpVenc" value="${compra?compra.vencimento||'':''}"></div></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="cpProd" value="${compra?compra.produto:''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="cpQtd" value="${compra?compra.quantidade:1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="cpValor" value="${compra?compra.valorUnit:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="cpForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="cpPgto">${pgtoOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Situação</label><select class="form-control" id="cpSit">${sitOpts}</select></div><div class="form-group"><label>Entrega</label><select class="form-control" id="cpEnt">${entOpts}</select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="cpObs" rows="2">${compra?compra.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCompra(${isEdit?compra.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveCompra(id) {
  const obj = { data:document.getElementById('cpData').value, vencimento:document.getElementById('cpVenc').value, produto:document.getElementById('cpProd').value.trim(), quantidade:parseFloat(document.getElementById('cpQtd').value)||1, valorUnit:parseFloat(document.getElementById('cpValor').value)||0, fornecedor:document.getElementById('cpForn').value, formaPagamento:document.getElementById('cpPgto').value, situacao:document.getElementById('cpSit').value, entrega:document.getElementById('cpEnt').value, obs:document.getElementById('cpObs').value };
  if (!obj.produto) { showToast('Informe o produto','error'); return; }
  if (id) { const idx=appData.compras.findIndex(c=>c.id===id); if(idx>-1){obj.id=id;appData.compras[idx]=obj;} } else { obj.id=nextId(appData.compras); appData.compras.push(obj); }
  saveData(); closeCadastroModal(); renderComprasPage(); showToast(id?'Compra atualizada!':'Compra cadastrada!','success');
}

function editCompra(id) { const c=(appData.compras||[]).find(x=>x.id===id); if(c)openCompraModal(c); }

function viewCompra(id) {
  const c=(appData.compras||[]).find(x=>x.id===id); if(!c)return;
  document.getElementById('viewModalTitle').textContent='Compra #'+c.id;
  document.getElementById('viewModalBody').innerHTML=`<div class="detail-grid">
    <div class="detail-item"><span class="detail-label">Data</span>${formatDate(c.data)}</div><div class="detail-item"><span class="detail-label">Vencimento</span>${formatDate(c.vencimento)}</div>
    <div class="detail-item"><span class="detail-label">Produto</span>${c.produto}</div><div class="detail-item"><span class="detail-label">Qtd</span>${c.quantidade}</div>
    <div class="detail-item"><span class="detail-label">V.Unit</span>${formatCurrency(c.valorUnit)}</div><div class="detail-item"><span class="detail-label">Total</span>${formatCurrency(c.quantidade*c.valorUnit)}</div>
    <div class="detail-item"><span class="detail-label">Fornecedor</span>${c.fornecedor}</div><div class="detail-item"><span class="detail-label">Pgto</span>${c.formaPagamento}</div>
    <div class="detail-item"><span class="detail-label">Situação</span><span class="badge ${c.situacao==='Pago'?'badge-success':'badge-danger'}">${c.situacao}</span></div>
    <div class="detail-item"><span class="detail-label">Entrega</span><span class="badge ${c.entrega==='Entregue OK'?'badge-success':'badge-warning'}">${c.entrega}</span></div>
  </div>${c.obs?`<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${c.obs}</div>`:''}`;
  openViewModal();
}

function deleteCompra(id) { if(!confirm('Excluir compra?'))return; appData.compras=(appData.compras||[]).filter(c=>c.id!==id); saveData(); renderComprasPage(); showToast('Compra excluída!','success'); }

// ============================================================
// VENDAS
// ============================================================
function renderVendasPage() {
  const pg = document.getElementById('page-vendas');
  const vendas = appData.vendas || [];
  const totalVendas = vendas.reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);
  const totalPago = vendas.filter(v=>v.situacao==='Pago').reduce((s,v) => s + (v.quantidade*v.valorUnit), 0);

  pg.innerHTML = `
    <div class="page-header"><h2>💰 Vendas</h2><button class="btn btn-primary" onclick="openVendaModal()">+ Nova Venda</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">${formatCurrency(totalVendas)}</div></div>
      <div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>A Receber</span></div><div class="card-value text-danger">${formatCurrency(totalVendas - totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${vendas.length}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar venda..." oninput="filterVendas(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterVendasSit(this.value)">
        <option value="">Todas</option><option value="Pago">Pago</option><option value="Devendo">Devendo</option>
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Data</th><th>Cliente</th><th>Produto</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Vendedor</th><th>Pgto</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="vendasBody"></tbody></table></div>`;
  renderVendasTable(vendas);
}

function renderVendasTable(vendas) {
  const tbody = document.getElementById('vendasBody'); if(!tbody)return;
  tbody.innerHTML = vendas.length===0 ? '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma venda</td></tr>' :
    vendas.map(v => `<tr>
      <td>${v.id}</td><td>${formatDate(v.data)}</td><td>${v.cliente}</td><td>${v.produto}</td><td>${v.quantidade}</td><td>${formatCurrency(v.valorUnit)}</td><td>${formatCurrency(v.quantidade*v.valorUnit)}</td><td>${v.vendedor}</td><td>${v.formaPagamento}</td>
      <td><span class="badge ${v.situacao==='Pago'?'badge-success':'badge-danger'}">${v.situacao}</span></td>
      <td><button class="btn btn-sm btn-outline" onclick="viewVenda(${v.id})">👁️</button><button class="btn btn-sm btn-primary" onclick="editVenda(${v.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteVenda(${v.id})">🗑️</button></td>
    </tr>`).join('');
}

function filterVendas(q) { q=q.toLowerCase(); renderVendasTable((appData.vendas||[]).filter(v=>v.cliente.toLowerCase().includes(q)||v.produto.toLowerCase().includes(q))); }
function filterVendasSit(s) { renderVendasTable(s?(appData.vendas||[]).filter(v=>v.situacao===s):(appData.vendas||[])); }

function openVendaModal(venda) {
  const isEdit=!!venda;
  const cliOpts=(appData.clientes||[]).map(c=>`<option value="${c.nome}" ${venda&&venda.cliente===c.nome?'selected':''}>${c.nome}</option>`).join('');
  const vendOpts=(appData.vendedores||[]).map(v=>`<option value="${v}" ${venda&&venda.vendedor===v?'selected':''}>${v}</option>`).join('');
  const pgtoOpts=(appData.formasPagamento||[]).map(f=>`<option value="${f}" ${venda&&venda.formaPagamento===f?'selected':''}>${f}</option>`).join('');
  const tipoOpts=(appData.tipoVenda||[]).map(t=>`<option value="${t}" ${venda&&venda.tipo===t?'selected':''}>${t}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Venda':'Nova Venda';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="vData" value="${venda?venda.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Cliente</label><select class="form-control" id="vCliente"><option value="">Selecione...</option>${cliOpts}</select></div></div>
    <div class="form-group"><label>Produto</label><input type="text" class="form-control" id="vProduto" value="${venda?venda.produto:''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="vQtd" value="${venda?venda.quantidade:1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="vValor" value="${venda?venda.valorUnit:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Vendedor</label><select class="form-control" id="vVendedor">${vendOpts}</select></div><div class="form-group"><label>Tipo Venda</label><select class="form-control" id="vTipo">${tipoOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="vPgto">${pgtoOpts}</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="vSit"><option value="Pago" ${venda&&venda.situacao==='Pago'?'selected':''}>Pago</option><option value="Devendo" ${venda&&venda.situacao==='Devendo'?'selected':''}>Devendo</option></select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="vObs" rows="2">${venda?venda.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda(${isEdit?venda.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveVenda(id) {
  const obj={data:document.getElementById('vData').value,cliente:document.getElementById('vCliente').value,produto:document.getElementById('vProduto').value.trim(),quantidade:parseFloat(document.getElementById('vQtd').value)||1,valorUnit:parseFloat(document.getElementById('vValor').value)||0,vendedor:document.getElementById('vVendedor').value,tipo:document.getElementById('vTipo').value,formaPagamento:document.getElementById('vPgto').value,situacao:document.getElementById('vSit').value,obs:document.getElementById('vObs').value};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(id){const idx=appData.vendas.findIndex(v=>v.id===id);if(idx>-1){obj.id=id;appData.vendas[idx]=obj;}}else{obj.id=nextId(appData.vendas);appData.vendas.push(obj);}
  saveData();closeCadastroModal();renderVendasPage();showToast(id?'Venda atualizada!':'Venda cadastrada!','success');
}

function editVenda(id){const v=(appData.vendas||[]).find(x=>x.id===id);if(v)openVendaModal(v);}

function viewVenda(id) {
  const v=(appData.vendas||[]).find(x=>x.id===id);if(!v)return;
  document.getElementById('viewModalTitle').textContent='Venda #'+v.id;
  document.getElementById('viewModalBody').innerHTML=`<div class="detail-grid">
    <div class="detail-item"><span class="detail-label">Data</span>${formatDate(v.data)}</div><div class="detail-item"><span class="detail-label">Cliente</span>${v.cliente}</div>
    <div class="detail-item"><span class="detail-label">Produto</span>${v.produto}</div><div class="detail-item"><span class="detail-label">Qtd</span>${v.quantidade}</div>
    <div class="detail-item"><span class="detail-label">V.Unit</span>${formatCurrency(v.valorUnit)}</div><div class="detail-item"><span class="detail-label">Total</span>${formatCurrency(v.quantidade*v.valorUnit)}</div>
    <div class="detail-item"><span class="detail-label">Vendedor</span>${v.vendedor}</div><div class="detail-item"><span class="detail-label">Pgto</span>${v.formaPagamento}</div>
    <div class="detail-item"><span class="detail-label">Tipo</span>${v.tipo}</div>
    <div class="detail-item"><span class="detail-label">Situação</span><span class="badge ${v.situacao==='Pago'?'badge-success':'badge-danger'}">${v.situacao}</span></div>
  </div>${v.obs?`<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${v.obs}</div>`:''}`;
  openViewModal();
}

function deleteVenda(id){if(!confirm('Excluir venda?'))return;appData.vendas=(appData.vendas||[]).filter(v=>v.id!==id);saveData();renderVendasPage();showToast('Venda excluída!','success');}

// ============================================================
// ESTOQUE
// ============================================================
function renderEstoquePage() {
  const pg = document.getElementById('page-estoque');
  const produtos = appData.produtos || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📦 Estoque</h2></div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto..." oninput="filterEstoque(this.value)">
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Produto</th><th>Unidade</th><th>Estoque Min.</th><th>Estoque Atual</th><th>Status</th></tr></thead>
    <tbody id="estoqueBody"></tbody></table></div>`;
  renderEstoqueTable(produtos);
}

function renderEstoqueTable(produtos) {
  const tbody = document.getElementById('estoqueBody'); if(!tbody)return;
  tbody.innerHTML = produtos.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto cadastrado</td></tr>':
    produtos.map(p=>{
      const atual=p.estoqueAtual||0;const min=p.estoqueMin||0;
      const status=atual<=0?'badge-danger':atual<=min?'badge-warning':'badge-success';
      const statusTxt=atual<=0?'Sem Estoque':atual<=min?'Baixo':'OK';
      return `<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.unidade||'Unidade'}</td><td>${min}</td><td>${atual}</td><td><span class="badge ${status}">${statusTxt}</span></td></tr>`;
    }).join('');
}

function filterEstoque(q){q=q.toLowerCase();renderEstoqueTable((appData.produtos||[]).filter(p=>p.nome.toLowerCase().includes(q)));}

// ============================================================
// PRODUTOS
// ============================================================
function renderProdutosPage() {
  const pg = document.getElementById('page-produtos');
  const produtos = appData.produtos || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🏷️ Produtos</h2><button class="btn btn-primary" onclick="openProdutoModal()">+ Novo Produto</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto..." oninput="filterProdutos(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>Unidade</th><th>Preço Compra</th><th>Preço Venda</th><th>Est.Min</th><th>Est.Atual</th><th>Ações</th></tr></thead>
    <tbody id="produtosBody"></tbody></table></div>`;
  renderProdutosTable(produtos);
}

function renderProdutosTable(produtos) {
  const tbody=document.getElementById('produtosBody');if(!tbody)return;
  tbody.innerHTML=produtos.length===0?'<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto</td></tr>':
    produtos.map(p=>`<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.unidade||'Unidade'}</td><td>${formatCurrency(p.precoCompra)}</td><td>${formatCurrency(p.precoVenda)}</td><td>${p.estoqueMin||0}</td><td>${p.estoqueAtual||0}</td>
    <td><button class="btn btn-sm btn-primary" onclick="editProduto(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteProduto(${p.id})">🗑️</button></td></tr>`).join('');
}

function filterProdutos(q){q=q.toLowerCase();renderProdutosTable((appData.produtos||[]).filter(p=>p.nome.toLowerCase().includes(q)));}

function openProdutoModal(produto) {
  const isEdit=!!produto;
  const unOpts=(appData.tipoUnidade||[]).map(u=>`<option value="${u}" ${produto&&produto.unidade===u?'selected':''}>${u}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Produto':'Novo Produto';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prNome" value="${produto?produto.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>Unidade</label><select class="form-control" id="prUnidade">${unOpts}</select></div><div class="form-group"><label>Preço Compra</label><input type="number" class="form-control" id="prCompra" value="${produto?produto.precoCompra:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Preço Venda</label><input type="number" class="form-control" id="prVenda" value="${produto?produto.precoVenda:''}" step="0.01"></div><div class="form-group"><label>Est. Mínimo</label><input type="number" class="form-control" id="prEstMin" value="${produto?produto.estoqueMin:0}"></div></div>
    <div class="form-group"><label>Est. Atual</label><input type="number" class="form-control" id="prEstAtual" value="${produto?produto.estoqueAtual:0}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="prObs" rows="2">${produto?produto.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduto(${isEdit?produto.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveProduto(id) {
  const obj={nome:document.getElementById('prNome').value.trim(),unidade:document.getElementById('prUnidade').value,precoCompra:parseFloat(document.getElementById('prCompra').value)||0,precoVenda:parseFloat(document.getElementById('prVenda').value)||0,estoqueMin:parseInt(document.getElementById('prEstMin').value)||0,estoqueAtual:parseInt(document.getElementById('prEstAtual').value)||0,obs:document.getElementById('prObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(id){const idx=appData.produtos.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.produtos[idx]=obj;}}else{obj.id=nextId(appData.produtos);appData.produtos.push(obj);}
  saveData();closeCadastroModal();renderProdutosPage();showToast(id?'Produto atualizado!':'Produto cadastrado!','success');
}

function editProduto(id){const p=(appData.produtos||[]).find(x=>x.id===id);if(p)openProdutoModal(p);}
function deleteProduto(id){if(!confirm('Excluir produto?'))return;appData.produtos=(appData.produtos||[]).filter(p=>p.id!==id);saveData();renderProdutosPage();showToast('Produto excluído!','success');}

// ============================================================
// CLIENTES
// ============================================================
function renderClientesPage() {
  const pg = document.getElementById('page-clientes');
  const clientes = appData.clientes || [];
  pg.innerHTML = `
    <div class="page-header"><h2>👥 Clientes</h2><button class="btn btn-primary" onclick="openClienteModal()">+ Novo Cliente</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cliente..." oninput="filterClientes(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead>
    <tbody id="clientesBody"></tbody></table></div>`;
  renderClientesTable(clientes);
}

function renderClientesTable(clientes) {
  const tbody=document.getElementById('clientesBody');if(!tbody)return;
  tbody.innerHTML=clientes.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cliente</td></tr>':
    clientes.map(c=>`<tr><td>${c.id}</td><td>${c.nome}</td><td>${c.cpfCnpj||'-'}</td><td>${c.telefone||'-'}</td><td>${c.cidade||'-'}</td>
    <td><button class="btn btn-sm btn-outline" onclick="viewCliente(${c.id})">👁️</button><button class="btn btn-sm btn-primary" onclick="editCliente(${c.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteCliente(${c.id})">🗑️</button></td></tr>`).join('');
}

function filterClientes(q){q=q.toLowerCase();renderClientesTable((appData.clientes||[]).filter(c=>c.nome.toLowerCase().includes(q)));}

function openClienteModal(cliente) {
  const isEdit=!!cliente;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cliente':'Novo Cliente';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="clNome" value="${cliente?cliente.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="clCpfCnpj" value="${cliente?cliente.cpfCnpj||'':''}" placeholder="000.000.000-00"></div><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="clTelefone" value="${cliente?cliente.telefone||'':''}" placeholder="(00) 00000-0000"></div></div>
    <div class="form-row"><div class="form-group"><label>Email</label><input type="email" class="form-control" id="clEmail" value="${cliente?cliente.email||'':''}"></div><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="clCidade" value="${cliente?cliente.cidade||'':''}"></div></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="clEndereco" value="${cliente?cliente.endereco||'':''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="clObs" rows="2">${cliente?cliente.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCliente(${isEdit?cliente.id:'null'})">Salvar</button>`;
  openCadastroModal();
  applyAllMasks();
}

function saveCliente(id) {
  const obj={nome:document.getElementById('clNome').value.trim(),cpfCnpj:document.getElementById('clCpfCnpj').value.trim(),telefone:document.getElementById('clTelefone').value.trim(),email:document.getElementById('clEmail').value.trim(),cidade:document.getElementById('clCidade').value.trim(),endereco:document.getElementById('clEndereco').value.trim(),obs:document.getElementById('clObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(id){const idx=appData.clientes.findIndex(c=>c.id===id);if(idx>-1){obj.id=id;appData.clientes[idx]=obj;}}else{obj.id=nextId(appData.clientes);appData.clientes.push(obj);}
  saveData();closeCadastroModal();renderClientesPage();showToast(id?'Cliente atualizado!':'Cliente cadastrado!','success');
}

function editCliente(id){const c=(appData.clientes||[]).find(x=>x.id===id);if(c)openClienteModal(c);}

function viewCliente(id) {
  const c=(appData.clientes||[]).find(x=>x.id===id);if(!c)return;
  document.getElementById('viewModalTitle').textContent='Cliente #'+c.id;
  document.getElementById('viewModalBody').innerHTML=`<div class="detail-grid">
    <div class="detail-item"><span class="detail-label">Nome</span>${c.nome}</div><div class="detail-item"><span class="detail-label">CPF/CNPJ</span>${c.cpfCnpj||'-'}</div>
    <div class="detail-item"><span class="detail-label">Telefone</span>${c.telefone||'-'}</div><div class="detail-item"><span class="detail-label">Email</span>${c.email||'-'}</div>
    <div class="detail-item"><span class="detail-label">Cidade</span>${c.cidade||'-'}</div><div class="detail-item"><span class="detail-label">Endereço</span>${c.endereco||'-'}</div>
  </div>${c.obs?`<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${c.obs}</div>`:''}`;
  openViewModal();
}

function deleteCliente(id){if(!confirm('Excluir cliente?'))return;appData.clientes=(appData.clientes||[]).filter(c=>c.id!==id);saveData();renderClientesPage();showToast('Cliente excluído!','success');}

// ============================================================
// FORNECEDORES
// ============================================================
function renderFornecedoresPage() {
  const pg = document.getElementById('page-fornecedores');
  const fornecedores = appData.fornecedores || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🏭 Fornecedores</h2><button class="btn btn-primary" onclick="openFornecedorModal()">+ Novo Fornecedor</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar fornecedor..." oninput="filterFornecedores(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead>
    <tbody id="fornecedoresBody"></tbody></table></div>`;
  renderFornecedoresTable(fornecedores);
}

function renderFornecedoresTable(fornecedores) {
  const tbody=document.getElementById('fornecedoresBody');if(!tbody)return;
  tbody.innerHTML=fornecedores.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum fornecedor</td></tr>':
    fornecedores.map(f=>`<tr><td>${f.id}</td><td>${f.nome}</td><td>${f.cnpj||'-'}</td><td>${f.telefone||'-'}</td><td>${f.cidade||'-'}</td>
    <td><button class="btn btn-sm btn-outline" onclick="viewFornecedor(${f.id})">👁️</button><button class="btn btn-sm btn-primary" onclick="editFornecedor(${f.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteFornecedor(${f.id})">🗑️</button></td></tr>`).join('');
}

function filterFornecedores(q){q=q.toLowerCase();renderFornecedoresTable((appData.fornecedores||[]).filter(f=>f.nome.toLowerCase().includes(q)));}

function openFornecedorModal(fornecedor) {
  const isEdit=!!fornecedor;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Fornecedor':'Novo Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="fnNome" value="${fornecedor?fornecedor.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="fnCnpj" value="${fornecedor?fornecedor.cnpj||'':''}" placeholder="00.000.000/0000-00"></div><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="fnTelefone" value="${fornecedor?fornecedor.telefone||'':''}" placeholder="(00) 00000-0000"></div></div>
    <div class="form-row"><div class="form-group"><label>Email</label><input type="email" class="form-control" id="fnEmail" value="${fornecedor?fornecedor.email||'':''}"></div><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="fnCidade" value="${fornecedor?fornecedor.cidade||'':''}"></div></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="fnEndereco" value="${fornecedor?fornecedor.endereco||'':''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="fnObs" rows="2">${fornecedor?fornecedor.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFornecedor(${isEdit?fornecedor.id:'null'})">Salvar</button>`;
  openCadastroModal();
  applyAllMasks();
}

function saveFornecedor(id) {
  const obj={nome:document.getElementById('fnNome').value.trim(),cnpj:document.getElementById('fnCnpj').value.trim(),telefone:document.getElementById('fnTelefone').value.trim(),email:document.getElementById('fnEmail').value.trim(),cidade:document.getElementById('fnCidade').value.trim(),endereco:document.getElementById('fnEndereco').value.trim(),obs:document.getElementById('fnObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(id){const idx=appData.fornecedores.findIndex(f=>f.id===id);if(idx>-1){obj.id=id;appData.fornecedores[idx]=obj;}}else{obj.id=nextId(appData.fornecedores);appData.fornecedores.push(obj);}
  saveData();closeCadastroModal();renderFornecedoresPage();showToast(id?'Fornecedor atualizado!':'Fornecedor cadastrado!','success');
}

function editFornecedor(id){const f=(appData.fornecedores||[]).find(x=>x.id===id);if(f)openFornecedorModal(f);}

function viewFornecedor(id) {
  const f=(appData.fornecedores||[]).find(x=>x.id===id);if(!f)return;
  document.getElementById('viewModalTitle').textContent='Fornecedor #'+f.id;
  document.getElementById('viewModalBody').innerHTML=`<div class="detail-grid">
    <div class="detail-item"><span class="detail-label">Nome</span>${f.nome}</div><div class="detail-item"><span class="detail-label">CNPJ</span>${f.cnpj||'-'}</div>
    <div class="detail-item"><span class="detail-label">Telefone</span>${f.telefone||'-'}</div><div class="detail-item"><span class="detail-label">Email</span>${f.email||'-'}</div>
    <div class="detail-item"><span class="detail-label">Cidade</span>${f.cidade||'-'}</div><div class="detail-item"><span class="detail-label">Endereço</span>${f.endereco||'-'}</div>
  </div>${f.obs?`<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${f.obs}</div>`:''}`;
  openViewModal();
}

function deleteFornecedor(id){if(!confirm('Excluir fornecedor?'))return;appData.fornecedores=(appData.fornecedores||[]).filter(f=>f.id!==id);saveData();renderFornecedoresPage();showToast('Fornecedor excluído!','success');}

// ============================================================
// PRODUTOS DE FORNECEDORES
// ============================================================
function renderPFornecedoresPage() {
  const pg = document.getElementById('page-pfornecedores');
  const pf = appData.pFornecedores || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📋 Produtos de Fornecedores</h2><button class="btn btn-primary" onclick="openPFornecedorModal()">+ Novo</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPFornecedores(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Fornecedor</th><th>Produto</th><th>Preço</th><th>Obs</th><th>Ações</th></tr></thead>
    <tbody id="pfBody"></tbody></table></div>`;
  renderPFornecedoresTable(pf);
}

function renderPFornecedoresTable(pf) {
  const tbody=document.getElementById('pfBody');if(!tbody)return;
  tbody.innerHTML=pf.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>':
    pf.map(p=>`<tr><td>${p.id}</td><td>${p.fornecedor}</td><td>${p.produto}</td><td>${formatCurrency(p.preco)}</td><td>${p.obs||'-'}</td>
    <td><button class="btn btn-sm btn-primary" onclick="editPFornecedor(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deletePFornecedor(${p.id})">🗑️</button></td></tr>`).join('');
}

function filterPFornecedores(q){q=q.toLowerCase();renderPFornecedoresTable((appData.pFornecedores||[]).filter(p=>p.fornecedor.toLowerCase().includes(q)||p.produto.toLowerCase().includes(q)));}

function openPFornecedorModal(pf) {
  const isEdit=!!pf;
  const fornOpts=(appData.fornecedores||[]).map(f=>`<option value="${f.nome}" ${pf&&pf.fornecedor===f.nome?'selected':''}>${f.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar':'Novo Produto de Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Fornecedor</label><select class="form-control" id="pfForn"><option value="">Selecione...</option>${fornOpts}</select></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="pfProd" value="${pf?pf.produto:''}"></div>
    <div class="form-group"><label>Preço</label><input type="number" class="form-control" id="pfPreco" value="${pf?pf.preco:''}" step="0.01"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pfObs" rows="2">${pf?pf.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePFornecedor(${isEdit?pf.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePFornecedor(id) {
  const obj={fornecedor:document.getElementById('pfForn').value,produto:document.getElementById('pfProd').value.trim(),preco:parseFloat(document.getElementById('pfPreco').value)||0,obs:document.getElementById('pfObs').value};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(id){const idx=appData.pFornecedores.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.pFornecedores[idx]=obj;}}else{obj.id=nextId(appData.pFornecedores);appData.pFornecedores.push(obj);}
  saveData();closeCadastroModal();renderPFornecedoresPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}

function editPFornecedor(id){const p=(appData.pFornecedores||[]).find(x=>x.id===id);if(p)openPFornecedorModal(p);}
function deletePFornecedor(id){if(!confirm('Excluir?'))return;appData.pFornecedores=(appData.pFornecedores||[]).filter(p=>p.id!==id);saveData();renderPFornecedoresPage();showToast('Excluído!','success');}

// ============================================================
// BOLETOS
// ============================================================
function renderBoletosPage() {
  const pg = document.getElementById('page-boletos');
  const boletos = appData.boletos || [];
  const totalPend = boletos.filter(b=>b.situacao==='Pendente').reduce((s,b)=>s+(b.valor||0),0);
  const totalPago = boletos.filter(b=>b.situacao==='Pago').reduce((s,b)=>s+(b.valor||0),0);
  pg.innerHTML = `
    <div class="page-header"><h2>🔖 Boletos</h2><button class="btn btn-primary" onclick="openBoletoModal()">+ Novo Boleto</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">${formatCurrency(totalPend+totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-warning">${formatCurrency(totalPend)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${boletos.length}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar boleto..." oninput="filterBoletos(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterBoletosSit(this.value)"><option value="">Todas</option>${(appData.situacaoBoleto||[]).map(s=>`<option value="${s}">${s}</option>`).join('')}</select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="boletosBody"></tbody></table></div>`;
  renderBoletosTable(boletos);
}

function renderBoletosTable(boletos) {
  const tbody=document.getElementById('boletosBody');if(!tbody)return;
  tbody.innerHTML=boletos.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>':
    boletos.map(b=>`<tr><td>${b.id}</td><td>${b.descricao||'-'}</td><td>${formatCurrency(b.valor)}</td><td>${formatDate(b.vencimento)}</td>
    <td><span class="badge ${b.situacao==='Pago'?'badge-success':b.situacao==='Vencido'?'badge-danger':'badge-warning'}">${b.situacao}</span></td>
    <td><button class="btn btn-sm btn-primary" onclick="editBoleto(${b.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteBoleto(${b.id})">🗑️</button></td></tr>`).join('');
}

function filterBoletos(q){q=q.toLowerCase();renderBoletosTable((appData.boletos||[]).filter(b=>(b.descricao||'').toLowerCase().includes(q)));}
function filterBoletosSit(s){renderBoletosTable(s?(appData.boletos||[]).filter(b=>b.situacao===s):(appData.boletos||[]));}

function openBoletoModal(boleto) {
  const isEdit=!!boleto;
  const sitOpts=(appData.situacaoBoleto||[]).map(s=>`<option value="${s}" ${boleto&&boleto.situacao===s?'selected':''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Boleto':'Novo Boleto';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="blDesc" value="${boleto?boleto.descricao:''}"></div>
    <div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="blValor" value="${boleto?boleto.valor:''}" step="0.01"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="blVenc" value="${boleto?boleto.vencimento:''}"></div></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="blSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="blObs" rows="2">${boleto?boleto.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBoleto(${isEdit?boleto.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveBoleto(id) {
  const obj={descricao:document.getElementById('blDesc').value.trim(),valor:parseFloat(document.getElementById('blValor').value)||0,vencimento:document.getElementById('blVenc').value,situacao:document.getElementById('blSit').value,obs:document.getElementById('blObs').value};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(id){const idx=appData.boletos.findIndex(b=>b.id===id);if(idx>-1){obj.id=id;appData.boletos[idx]=obj;}}else{obj.id=nextId(appData.boletos);appData.boletos.push(obj);}
  saveData();closeCadastroModal();renderBoletosPage();showToast(id?'Boleto atualizado!':'Boleto cadastrado!','success');
}

function editBoleto(id){const b=(appData.boletos||[]).find(x=>x.id===id);if(b)openBoletoModal(b);}
function deleteBoleto(id){if(!confirm('Excluir boleto?'))return;appData.boletos=(appData.boletos||[]).filter(b=>b.id!==id);saveData();renderBoletosPage();showToast('Boleto excluído!','success');}

// ============================================================
// CHEQUES
// ============================================================
function renderChequesPage() {
  const pg = document.getElementById('page-cheques');
  const cheques = appData.cheques || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📝 Cheques</h2><button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cheque..." oninput="filterCheques(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nº Cheque</th><th>Valor</th><th>Data</th><th>Destinatário</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="chequesBody"></tbody></table></div>`;
  renderChequesTable(cheques);
}

function renderChequesTable(cheques) {
  const tbody=document.getElementById('chequesBody');if(!tbody)return;
  tbody.innerHTML=cheques.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>':
    cheques.map(c=>`<tr><td>${c.id}</td><td>${c.numero||'-'}</td><td>${formatCurrency(c.valor)}</td><td>${formatDate(c.data)}</td><td>${c.destinatario||'-'}</td>
    <td><span class="badge ${c.situacao==='Compensado'?'badge-success':c.situacao==='Devolvido'?'badge-danger':'badge-warning'}">${c.situacao}</span></td>
    <td><button class="btn btn-sm btn-primary" onclick="editCheque(${c.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteCheque(${c.id})">🗑️</button></td></tr>`).join('');
}

function filterCheques(q){q=q.toLowerCase();renderChequesTable((appData.cheques||[]).filter(c=>(c.numero||'').toLowerCase().includes(q)||(c.destinatario||'').toLowerCase().includes(q)));}

function openChequeModal(cheque) {
  const isEdit=!!cheque;
  const sitOpts=(appData.situacaoCheque||[]).map(s=>`<option value="${s}" ${cheque&&cheque.situacao===s?'selected':''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cheque':'Novo Cheque';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Nº Cheque</label><input type="text" class="form-control" id="chNum" value="${cheque?cheque.numero:''}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="chValor" value="${cheque?cheque.valor:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="chData" value="${cheque?cheque.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Situação</label><select class="form-control" id="chSit">${sitOpts}</select></div></div>
    <div class="form-group"><label>Destinatário</label><input type="text" class="form-control" id="chDest" value="${cheque?cheque.destinatario:''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="chObs" rows="2">${cheque?cheque.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCheque(${isEdit?cheque.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveCheque(id) {
  const obj={numero:document.getElementById('chNum').value.trim(),valor:parseFloat(document.getElementById('chValor').value)||0,data:document.getElementById('chData').value,situacao:document.getElementById('chSit').value,destinatario:document.getElementById('chDest').value.trim(),obs:document.getElementById('chObs').value};
  if(id){const idx=appData.cheques.findIndex(c=>c.id===id);if(idx>-1){obj.id=id;appData.cheques[idx]=obj;}}else{obj.id=nextId(appData.cheques);appData.cheques.push(obj);}
  saveData();closeCadastroModal();renderChequesPage();showToast(id?'Cheque atualizado!':'Cheque cadastrado!','success');
}

function editCheque(id){const c=(appData.cheques||[]).find(x=>x.id===id);if(c)openChequeModal(c);}
function deleteCheque(id){if(!confirm('Excluir cheque?'))return;appData.cheques=(appData.cheques||[]).filter(c=>c.id!==id);saveData();renderChequesPage();showToast('Cheque excluído!','success');}

// ============================================================
// PRESTAÇÕES
// ============================================================
function renderPrestacoesPage() {
  const pg = document.getElementById('page-prestacoes');
  const prestacoes = appData.prestacoes || [];
  pg.innerHTML = `
    <div class="page-header"><h2>💳 Prestações</h2><button class="btn btn-primary" onclick="openPrestacaoModal()">+ Nova Prestação</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPrestacoes(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Descrição</th><th>Valor Parcela</th><th>Parcelas</th><th>Pagas</th><th>Início</th><th>Ações</th></tr></thead>
    <tbody id="prestacoesBody"></tbody></table></div>`;
  renderPrestacoesTable(prestacoes);
}

function renderPrestacoesTable(prestacoes) {
  const tbody=document.getElementById('prestacoesBody');if(!tbody)return;
  tbody.innerHTML=prestacoes.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma prestação</td></tr>':
    prestacoes.map(p=>`<tr><td>${p.id}</td><td>${p.descricao||'-'}</td><td>${formatCurrency(p.valorParcela)}</td><td>${p.totalParcelas||0}</td><td>${p.parcelasPagas||0}</td><td>${formatDate(p.dataInicio)}</td>
    <td><button class="btn btn-sm btn-primary" onclick="editPrestacao(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deletePrestacao(${p.id})">🗑️</button></td></tr>`).join('');
}

function filterPrestacoes(q){q=q.toLowerCase();renderPrestacoesTable((appData.prestacoes||[]).filter(p=>(p.descricao||'').toLowerCase().includes(q)));}

function openPrestacaoModal(prest) {
  const isEdit=!!prest;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Prestação':'Nova Prestação';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="psDesc" value="${prest?prest.descricao:''}"></div>
    <div class="form-row"><div class="form-group"><label>Valor Parcela</label><input type="number" class="form-control" id="psValor" value="${prest?prest.valorParcela:''}" step="0.01"></div><div class="form-group"><label>Total Parcelas</label><input type="number" class="form-control" id="psTotal" value="${prest?prest.totalParcelas:''}" min="1"></div></div>
    <div class="form-row"><div class="form-group"><label>Parcelas Pagas</label><input type="number" class="form-control" id="psPagas" value="${prest?prest.parcelasPagas:0}" min="0"></div><div class="form-group"><label>Data Início</label><input type="date" class="form-control" id="psData" value="${prest?prest.dataInicio:''}"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="psObs" rows="2">${prest?prest.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePrestacao(${isEdit?prest.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePrestacao(id) {
  const obj={descricao:document.getElementById('psDesc').value.trim(),valorParcela:parseFloat(document.getElementById('psValor').value)||0,totalParcelas:parseInt(document.getElementById('psTotal').value)||1,parcelasPagas:parseInt(document.getElementById('psPagas').value)||0,dataInicio:document.getElementById('psData').value,obs:document.getElementById('psObs').value};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(id){const idx=appData.prestacoes.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.prestacoes[idx]=obj;}}else{obj.id=nextId(appData.prestacoes);appData.prestacoes.push(obj);}
  saveData();closeCadastroModal();renderPrestacoesPage();showToast(id?'Prestação atualizada!':'Prestação cadastrada!','success');
}

function editPrestacao(id){const p=(appData.prestacoes||[]).find(x=>x.id===id);if(p)openPrestacaoModal(p);}
function deletePrestacao(id){if(!confirm('Excluir prestação?'))return;appData.prestacoes=(appData.prestacoes||[]).filter(p=>p.id!==id);saveData();renderPrestacoesPage();showToast('Prestação excluída!','success');}

// ============================================================
// PROJETOS
// ============================================================
function renderProjetosPage() {
  const pg = document.getElementById('page-projetos');
  const projetos = appData.projetos || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📐 Projetos</h2><button class="btn btn-primary" onclick="openProjetoModal()">+ Novo Projeto</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterProjetos(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>Cliente</th><th>Valor</th><th>Início</th><th>Previsão</th><th>Status</th><th>Ações</th></tr></thead>
    <tbody id="projetosBody"></tbody></table></div>`;
  renderProjetosTable(projetos);
}

function renderProjetosTable(projetos) {
  const tbody=document.getElementById('projetosBody');if(!tbody)return;
  tbody.innerHTML=projetos.length===0?'<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum projeto</td></tr>':
    projetos.map(p=>`<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.cliente||'-'}</td><td>${formatCurrency(p.valor)}</td><td>${formatDate(p.dataInicio)}</td><td>${formatDate(p.previsao)}</td>
    <td><span class="badge ${p.status==='Concluído'?'badge-success':p.status==='Cancelado'?'badge-danger':'badge-warning'}">${p.status||'Em andamento'}</span></td>
    <td><button class="btn btn-sm btn-primary" onclick="editProjeto(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteProjeto(${p.id})">🗑️</button></td></tr>`).join('');
}

function filterProjetos(q){q=q.toLowerCase();renderProjetosTable((appData.projetos||[]).filter(p=>p.nome.toLowerCase().includes(q)));}

function openProjetoModal(projeto) {
  const isEdit=!!projeto;
  const cliOpts=(appData.clientes||[]).map(c=>`<option value="${c.nome}" ${projeto&&projeto.cliente===c.nome?'selected':''}>${c.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Projeto':'Novo Projeto';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="pjNome" value="${projeto?projeto.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="pjCliente"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pjValor" value="${projeto?projeto.valor:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Início</label><input type="date" class="form-control" id="pjInicio" value="${projeto?projeto.dataInicio:''}"></div><div class="form-group"><label>Previsão</label><input type="date" class="form-control" id="pjPrevisao" value="${projeto?projeto.previsao:''}"></div></div>
    <div class="form-group"><label>Status</label><select class="form-control" id="pjStatus"><option value="Em andamento" ${projeto&&projeto.status==='Em andamento'?'selected':''}>Em andamento</option><option value="Concluído" ${projeto&&projeto.status==='Concluído'?'selected':''}>Concluído</option><option value="Cancelado" ${projeto&&projeto.status==='Cancelado'?'selected':''}>Cancelado</option></select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pjObs" rows="2">${projeto?projeto.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProjeto(${isEdit?projeto.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveProjeto(id) {
  const obj={nome:document.getElementById('pjNome').value.trim(),cliente:document.getElementById('pjCliente').value,valor:parseFloat(document.getElementById('pjValor').value)||0,dataInicio:document.getElementById('pjInicio').value,previsao:document.getElementById('pjPrevisao').value,status:document.getElementById('pjStatus').value,obs:document.getElementById('pjObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(id){const idx=appData.projetos.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.projetos[idx]=obj;}}else{obj.id=nextId(appData.projetos);appData.projetos.push(obj);}
  saveData();closeCadastroModal();renderProjetosPage();showToast(id?'Projeto atualizado!':'Projeto cadastrado!','success');
}

function editProjeto(id){const p=(appData.projetos||[]).find(x=>x.id===id);if(p)openProjetoModal(p);}
function deleteProjeto(id){if(!confirm('Excluir projeto?'))return;appData.projetos=(appData.projetos||[]).filter(p=>p.id!==id);saveData();renderProjetosPage();showToast('Projeto excluído!','success');}

// ============================================================
// PAGAMENTOS DE CLIENTES
// ============================================================
function renderPagClientesPage() {
  const pg = document.getElementById('page-pagclientes');
  const pags = appData.pagClientes || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🤝 Pagamentos de Clientes</h2><button class="btn btn-primary" onclick="openPagClienteModal()">+ Novo Pagamento</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPagClientes(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Cliente</th><th>Valor</th><th>Data</th><th>Forma Pgto</th><th>Ações</th></tr></thead>
    <tbody id="pagClientesBody"></tbody></table></div>`;
  renderPagClientesTable(pags);
}

function renderPagClientesTable(pags) {
  const tbody=document.getElementById('pagClientesBody');if(!tbody)return;
  tbody.innerHTML=pags.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum pagamento</td></tr>':
    pags.map(p=>`<tr><td>${p.id}</td><td>${p.cliente||'-'}</td><td>${formatCurrency(p.valor)}</td><td>${formatDate(p.data)}</td><td>${p.formaPagamento||'-'}</td>
    <td><button class="btn btn-sm btn-primary" onclick="editPagCliente(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deletePagCliente(${p.id})">🗑️</button></td></tr>`).join('');
}

function filterPagClientes(q){q=q.toLowerCase();renderPagClientesTable((appData.pagClientes||[]).filter(p=>(p.cliente||'').toLowerCase().includes(q)));}

function openPagClienteModal(pag) {
  const isEdit=!!pag;
  const cliOpts=(appData.clientes||[]).map(c=>`<option value="${c.nome}" ${pag&&pag.cliente===c.nome?'selected':''}>${c.nome}</option>`).join('');
  const pgtoOpts=(appData.formasPagamento||[]).map(f=>`<option value="${f}" ${pag&&pag.formaPagamento===f?'selected':''}>${f}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Pagamento':'Novo Pagamento';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Cliente</label><select class="form-control" id="pcCliente"><option value="">Selecione...</option>${cliOpts}</select></div>
    <div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pcValor" value="${pag?pag.valor:''}" step="0.01"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="pcData" value="${pag?pag.data:new Date().toISOString().split('T')[0]}"></div></div>
    <div class="form-group"><label>Forma Pgto</label><select class="form-control" id="pcPgto">${pgtoOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pcObs" rows="2">${pag?pag.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePagCliente(${isEdit?pag.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePagCliente(id) {
  const obj={cliente:document.getElementById('pcCliente').value,valor:parseFloat(document.getElementById('pcValor').value)||0,data:document.getElementById('pcData').value,formaPagamento:document.getElementById('pcPgto').value,obs:document.getElementById('pcObs').value};
  if(id){const idx=appData.pagClientes.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.pagClientes[idx]=obj;}}else{obj.id=nextId(appData.pagClientes);appData.pagClientes.push(obj);}
  saveData();closeCadastroModal();renderPagClientesPage();showToast(id?'Pagamento atualizado!':'Pagamento cadastrado!','success');
}

function editPagCliente(id){const p=(appData.pagClientes||[]).find(x=>x.id===id);if(p)openPagClienteModal(p);}
function deletePagCliente(id){if(!confirm('Excluir pagamento?'))return;appData.pagClientes=(appData.pagClientes||[]).filter(p=>p.id!==id);saveData();renderPagClientesPage();showToast('Pagamento excluído!','success');}

// ============================================================
// GARANTIAS
// ============================================================
function renderGarantiasPage() {
  const pg = document.getElementById('page-garantias');
  const garantias = appData.garantias || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🛡️ Garantias</h2><button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterGarantias(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Produto</th><th>Cliente</th><th>Data Compra</th><th>Validade</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="garantiasBody"></tbody></table></div>`;
  renderGarantiasTable(garantias);
}

function renderGarantiasTable(garantias) {
  const tbody=document.getElementById('garantiasBody');if(!tbody)return;
  tbody.innerHTML=garantias.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>':
    garantias.map(g=>`<tr><td>${g.id}</td><td>${g.produto||'-'}</td><td>${g.cliente||'-'}</td><td>${formatDate(g.dataCompra)}</td><td>${formatDate(g.validade)}</td>
    <td><span class="badge ${g.situacao==='Ativa'?'badge-success':g.situacao==='Expirada'?'badge-danger':'badge-warning'}">${g.situacao}</span></td>
    <td><button class="btn btn-sm btn-primary" onclick="editGarantia(${g.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteGarantia(${g.id})">🗑️</button></td></tr>`).join('');
}

function filterGarantias(q){q=q.toLowerCase();renderGarantiasTable((appData.garantias||[]).filter(g=>(g.produto||'').toLowerCase().includes(q)||(g.cliente||'').toLowerCase().includes(q)));}

function openGarantiaModal(garantia) {
  const isEdit=!!garantia;
  const sitOpts=(appData.situacaoGarantia||[]).map(s=>`<option value="${s}" ${garantia&&garantia.situacao===s?'selected':''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Garantia':'Nova Garantia';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="grProduto" value="${garantia?garantia.produto:''}"></div>
    <div class="form-group"><label>Cliente</label><input type="text" class="form-control" id="grCliente" value="${garantia?garantia.cliente:''}"></div>
    <div class="form-row"><div class="form-group"><label>Data Compra</label><input type="date" class="form-control" id="grDataCompra" value="${garantia?garantia.dataCompra:''}"></div><div class="form-group"><label>Validade</label><input type="date" class="form-control" id="grValidade" value="${garantia?garantia.validade:''}"></div></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="grSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="grObs" rows="2">${garantia?garantia.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGarantia(${isEdit?garantia.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveGarantia(id) {
  const obj={produto:document.getElementById('grProduto').value.trim(),cliente:document.getElementById('grCliente').value.trim(),dataCompra:document.getElementById('grDataCompra').value,validade:document.getElementById('grValidade').value,situacao:document.getElementById('grSit').value,obs:document.getElementById('grObs').value};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(id){const idx=appData.garantias.findIndex(g=>g.id===id);if(idx>-1){obj.id=id;appData.garantias[idx]=obj;}}else{obj.id=nextId(appData.garantias);appData.garantias.push(obj);}
  saveData();closeCadastroModal();renderGarantiasPage();showToast(id?'Garantia atualizada!':'Garantia cadastrada!','success');
}

function editGarantia(id){const g=(appData.garantias||[]).find(x=>x.id===id);if(g)openGarantiaModal(g);}
function deleteGarantia(id){if(!confirm('Excluir garantia?'))return;appData.garantias=(appData.garantias||[]).filter(g=>g.id!==id);saveData();renderGarantiasPage();showToast('Garantia excluída!','success');}
// ============================================================
// RELATÓRIOS
// ============================================================
function renderRelatoriosPage() {
  const pg = document.getElementById('page-relatorios');
  const compras = appData.compras || [];
  const vendas = appData.vendas || [];
  const totalCompras = compras.reduce((s,c)=>s+(c.quantidade*c.valorUnit),0);
  const totalVendas = vendas.reduce((s,v)=>s+(v.quantidade*v.valorUnit),0);

  let resumoMeses = '';
  mesesNav.forEach(function(mes, idx) {
    const fc = (appData.fluxoCaixa||{})[mes];
    if (!fc || !fc.lancamentos || fc.lancamentos.length === 0) return;
    const ent = fc.lancamentos.filter(l=>l.tipo==='entrada').reduce((s,l)=>s+(l.valor||0),0);
    const sai = fc.lancamentos.filter(l=>l.tipo==='saida').reduce((s,l)=>s+(l.valor||0),0);
    resumoMeses += `<tr><td>${mesesNomes[idx]}</td><td class="text-success">${formatCurrency(ent)}</td><td class="text-danger">${formatCurrency(sai)}</td><td class="${(ent-sai)>=0?'text-success':'text-danger'}">${formatCurrency(ent-sai)}</td></tr>`;
  });

  pg.innerHTML = `
    <div class="page-header"><h2>📈 Relatórios</h2></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">${formatCurrency(totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">${formatCurrency(totalVendas)}</div></div>
      <div class="card"><div class="card-header"><span>Lucro Bruto</span></div><div class="card-value ${(totalVendas-totalCompras)>=0?'text-success':'text-danger'}">${formatCurrency(totalVendas-totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>Produtos</span></div><div class="card-value">${(appData.produtos||[]).length}</div></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-title">Resumo Mensal do Fluxo de Caixa</div>
      <div class="table-responsive" style="border:none">
        <table class="table"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead>
        <tbody>${resumoMeses || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum dado</td></tr>'}</tbody></table>
      </div>
    </div>`;
}

// ============================================================
// NOTAS DE ENTRADA
// ============================================================
function renderNotasEntradaPage() {
  const pg = document.getElementById('page-notasentrada');
  const notas = appData.notasEntrada || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📥 Notas de Entrada</h2><button class="btn btn-primary" onclick="openNotaEntradaModal()">+ Nova Nota</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterNotasEntrada(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nº Nota</th><th>Fornecedor</th><th>Valor</th><th>Data</th><th>Ações</th></tr></thead>
    <tbody id="notasEntradaBody"></tbody></table></div>`;
  renderNotasEntradaTable(notas);
}

function renderNotasEntradaTable(notas) {
  const tbody=document.getElementById('notasEntradaBody');if(!tbody)return;
  tbody.innerHTML=notas.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>':
    notas.map(n=>`<tr><td>${n.id}</td><td>${n.numero||'-'}</td><td>${n.fornecedor||'-'}</td><td>${formatCurrency(n.valor)}</td><td>${formatDate(n.data)}</td>
    <td><button class="btn btn-sm btn-primary" onclick="editNotaEntrada(${n.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada(${n.id})">🗑️</button></td></tr>`).join('');
}

function filterNotasEntrada(q){q=q.toLowerCase();renderNotasEntradaTable((appData.notasEntrada||[]).filter(n=>(n.numero||'').toLowerCase().includes(q)||(n.fornecedor||'').toLowerCase().includes(q)));}

function openNotaEntradaModal(nota) {
  const isEdit=!!nota;
  const fornOpts=(appData.fornecedores||[]).map(f=>`<option value="${f.nome}" ${nota&&nota.fornecedor===f.nome?'selected':''}>${f.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota Entrada':'Nova Nota de Entrada';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="neNum" value="${nota?nota.numero:''}"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="neData" value="${nota?nota.data:new Date().toISOString().split('T')[0]}"></div></div>
    <div class="form-group"><label>Fornecedor</label><select class="form-control" id="neForn"><option value="">Selecione...</option>${fornOpts}</select></div>
    <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="neValor" value="${nota?nota.valor:''}" step="0.01"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="neObs" rows="2">${nota?nota.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaEntrada(${isEdit?nota.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveNotaEntrada(id) {
  const obj={numero:document.getElementById('neNum').value.trim(),data:document.getElementById('neData').value,fornecedor:document.getElementById('neForn').value,valor:parseFloat(document.getElementById('neValor').value)||0,obs:document.getElementById('neObs').value};
  if(id){const idx=appData.notasEntrada.findIndex(n=>n.id===id);if(idx>-1){obj.id=id;appData.notasEntrada[idx]=obj;}}else{obj.id=nextId(appData.notasEntrada);appData.notasEntrada.push(obj);}
  saveData();closeCadastroModal();renderNotasEntradaPage();showToast(id?'Nota atualizada!':'Nota cadastrada!','success');
}

function editNotaEntrada(id){const n=(appData.notasEntrada||[]).find(x=>x.id===id);if(n)openNotaEntradaModal(n);}
function deleteNotaEntrada(id){if(!confirm('Excluir nota?'))return;appData.notasEntrada=(appData.notasEntrada||[]).filter(n=>n.id!==id);saveData();renderNotasEntradaPage();showToast('Nota excluída!','success');}

// ============================================================
// NOTAS DE SAÍDA
// ============================================================
function renderNotasSaidaPage() {
  const pg = document.getElementById('page-notassaida');
  const notas = appData.notasSaida || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📤 Notas de Saída</h2><button class="btn btn-primary" onclick="openNotaSaidaModal()">+ Nova Nota</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterNotasSaida(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nº Nota</th><th>Cliente</th><th>Valor</th><th>Data</th><th>Ações</th></tr></thead>
    <tbody id="notasSaidaBody"></tbody></table></div>`;
  renderNotasSaidaTable(notas);
}

function renderNotasSaidaTable(notas) {
  const tbody=document.getElementById('notasSaidaBody');if(!tbody)return;
  tbody.innerHTML=notas.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>':
    notas.map(n=>`<tr><td>${n.id}</td><td>${n.numero||'-'}</td><td>${n.cliente||'-'}</td><td>${formatCurrency(n.valor)}</td><td>${formatDate(n.data)}</td>
    <td><button class="btn btn-sm btn-primary" onclick="editNotaSaida(${n.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteNotaSaida(${n.id})">🗑️</button></td></tr>`).join('');
}

function filterNotasSaida(q){q=q.toLowerCase();renderNotasSaidaTable((appData.notasSaida||[]).filter(n=>(n.numero||'').toLowerCase().includes(q)||(n.cliente||'').toLowerCase().includes(q)));}

function openNotaSaidaModal(nota) {
  const isEdit=!!nota;
  const cliOpts=(appData.clientes||[]).map(c=>`<option value="${c.nome}" ${nota&&nota.cliente===c.nome?'selected':''}>${c.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota Saída':'Nova Nota de Saída';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="nsNum" value="${nota?nota.numero:''}"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="nsData" value="${nota?nota.data:new Date().toISOString().split('T')[0]}"></div></div>
    <div class="form-group"><label>Cliente</label><select class="form-control" id="nsCliente"><option value="">Selecione...</option>${cliOpts}</select></div>
    <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="nsValor" value="${nota?nota.valor:''}" step="0.01"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="nsObs" rows="2">${nota?nota.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaSaida(${isEdit?nota.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveNotaSaida(id) {
  const obj={numero:document.getElementById('nsNum').value.trim(),data:document.getElementById('nsData').value,cliente:document.getElementById('nsCliente').value,valor:parseFloat(document.getElementById('nsValor').value)||0,obs:document.getElementById('nsObs').value};
  if(id){const idx=appData.notasSaida.findIndex(n=>n.id===id);if(idx>-1){obj.id=id;appData.notasSaida[idx]=obj;}}else{obj.id=nextId(appData.notasSaida);appData.notasSaida.push(obj);}
  saveData();closeCadastroModal();renderNotasSaidaPage();showToast(id?'Nota atualizada!':'Nota cadastrada!','success');
}

function editNotaSaida(id){const n=(appData.notasSaida||[]).find(x=>x.id===id);if(n)openNotaSaidaModal(n);}
function deleteNotaSaida(id){if(!confirm('Excluir nota?'))return;appData.notasSaida=(appData.notasSaida||[]).filter(n=>n.id!==id);saveData();renderNotasSaidaPage();showToast('Nota excluída!','success');}

// ============================================================
// RECEITAS MEI
// ============================================================
function renderReceitasMeiPage() {
  const pg = document.getElementById('page-receitasmei');
  const receitas = appData.receitasMei || [];
  const totalReceitas = receitas.reduce((s,r)=>s+(r.valor||0),0);
  pg.innerHTML = `
    <div class="page-header"><h2>📄 Receitas MEI</h2><button class="btn btn-primary" onclick="openReceitaMeiModal()">+ Nova Receita</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Receitas</span></div><div class="card-value">${formatCurrency(totalReceitas)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd</span></div><div class="card-value">${receitas.length}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterReceitasMei(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Descrição</th><th>Valor</th><th>Data</th><th>Ações</th></tr></thead>
    <tbody id="receitasMeiBody"></tbody></table></div>`;
  renderReceitasMeiTable(receitas);
}

function renderReceitasMeiTable(receitas) {
  const tbody=document.getElementById('receitasMeiBody');if(!tbody)return;
  tbody.innerHTML=receitas.length===0?'<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma receita</td></tr>':
    receitas.map(r=>`<tr><td>${r.id}</td><td>${r.descricao||'-'}</td><td>${formatCurrency(r.valor)}</td><td>${formatDate(r.data)}</td>
    <td><button class="btn btn-sm btn-primary" onclick="editReceitaMei(${r.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteReceitaMei(${r.id})">🗑️</button></td></tr>`).join('');
}

function filterReceitasMei(q){q=q.toLowerCase();renderReceitasMeiTable((appData.receitasMei||[]).filter(r=>(r.descricao||'').toLowerCase().includes(q)));}

function openReceitaMeiModal(receita) {
  const isEdit=!!receita;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Receita':'Nova Receita MEI';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="rmDesc" value="${receita?receita.descricao:''}"></div>
    <div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="rmValor" value="${receita?receita.valor:''}" step="0.01"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="rmData" value="${receita?receita.data:new Date().toISOString().split('T')[0]}"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="rmObs" rows="2">${receita?receita.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveReceitaMei(${isEdit?receita.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveReceitaMei(id) {
  const obj={descricao:document.getElementById('rmDesc').value.trim(),valor:parseFloat(document.getElementById('rmValor').value)||0,data:document.getElementById('rmData').value,obs:document.getElementById('rmObs').value};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(id){const idx=appData.receitasMei.findIndex(r=>r.id===id);if(idx>-1){obj.id=id;appData.receitasMei[idx]=obj;}}else{obj.id=nextId(appData.receitasMei);appData.receitasMei.push(obj);}
  saveData();closeCadastroModal();renderReceitasMeiPage();showToast(id?'Receita atualizada!':'Receita cadastrada!','success');
}

function editReceitaMei(id){const r=(appData.receitasMei||[]).find(x=>x.id===id);if(r)openReceitaMeiModal(r);}
function deleteReceitaMei(id){if(!confirm('Excluir receita?'))return;appData.receitasMei=(appData.receitasMei||[]).filter(r=>r.id!==id);saveData();renderReceitasMeiPage();showToast('Receita excluída!','success');}

// ============================================================
// CONFIGURAÇÕES
// ============================================================
function renderConfiguracoesPage() {
  var pg = document.getElementById('page-configuracoes');
  var emp = appData.empresa || {};
  var logoPreview = emp.logo ? '<img src="' + emp.logo + '" alt="Logo"><br>' : '';
  pg.innerHTML =
    '<div class="page-header"><h2>⚙️ Configurações</h2></div>' +
    '<div class="card" style="margin-bottom:16px">' +
      '<div class="section-title">Empresa</div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Nome</label><input type="text" class="form-control" id="cfgNome" value="' + (emp.nome || '') + '"></div>' +
        '<div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="' + (emp.cnpj || '') + '" placeholder="00.000.000/0000-00"></div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Logo da Empresa</label>' +
        '<div class="logo-upload-area" id="logoUploadArea" onclick="document.getElementById(\'logoFileInput\').click()">' +
          '<div id="logoPreviewContainer">' + logoPreview + '</div>' +
          '<div class="upload-text">Clique para selecionar a logo</div>' +
          '<div class="upload-hint">Recomendado: 220x70 px | PNG ou JPG | Máx. 500KB</div>' +
          '<input type="file" id="logoFileInput" accept="image/png,image/jpeg,image/webp" style="display:none" onchange="handleLogoUpload(event)">' +
        '</div>' +
      '</div>' +
      (emp.logo ? '<button class="btn btn-danger btn-sm" style="margin-bottom:12px" onclick="removeLogo()">Remover Logo</button> ' : '') +
      '<button class="btn btn-primary" onclick="salvarEmpresa()">Salvar Empresa</button>' +
    '</div>' +
    '<div class="card" style="margin-bottom:16px">' +
      '<div class="section-title">Vendedores</div>' +
      '<div id="cfgVendedoresLista" style="margin-bottom:8px">' +
        (appData.vendedores || []).map(function(v, i) {
          return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="color:var(--text-secondary)">' + v + '</span><button class="btn btn-sm btn-danger" onclick="removeVendedor(' + i + ')">✕</button></div>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;gap:8px"><input type="text" class="form-control" id="cfgNovoVendedor" placeholder="Nome do vendedor" style="max-width:250px"><button class="btn btn-primary btn-sm" onclick="addVendedor()">Adicionar</button></div>' +
    '</div>' +
    '<div class="card" style="margin-bottom:16px">' +
      '<div class="section-title">Formas de Pagamento</div>' +
      '<div id="cfgPgtoLista" style="margin-bottom:8px">' +
        (appData.formasPagamento || []).map(function(f, i) {
          return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="color:var(--text-secondary)">' + f + '</span><button class="btn btn-sm btn-danger" onclick="removePgto(' + i + ')">✕</button></div>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;gap:8px"><input type="text" class="form-control" id="cfgNovoPgto" placeholder="Forma de pagamento" style="max-width:250px"><button class="btn btn-primary btn-sm" onclick="addPgto()">Adicionar</button></div>' +
    '</div>' +
    '<div class="card">' +
      '<div class="section-title">Categorias do Fluxo de Caixa</div>' +
      '<div id="cfgCatLista" style="margin-bottom:8px">' +
        (appData.categoriasFluxo || []).map(function(c, i) {
          return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span class="badge ' + (c.tipo === 'entrada' ? 'badge-success' : 'badge-danger') + '">' + c.tipo + '</span><span style="color:var(--text-secondary)">' + c.nome + '</span><button class="btn btn-sm btn-danger" onclick="removeCat(' + i + ')">✕</button></div>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><input type="text" class="form-control" id="cfgNovaCat" placeholder="Nome da categoria" style="max-width:200px"><select class="form-control" id="cfgNovaCatTipo" style="max-width:120px"><option value="entrada">Entrada</option><option value="saida">Saída</option></select><button class="btn btn-primary btn-sm" onclick="addCat()">Adicionar</button></div>' +
    '</div>';
  setTimeout(function(){ applyMask('cfgCnpj', maskCNPJ); }, 50);
}

function handleLogoUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 512000) { showToast('Arquivo muito grande. Máximo 500KB.', 'error'); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    if (!appData.empresa) appData.empresa = {};
    appData.empresa.logo = e.target.result;
    saveData();
    updateSidebarInfo();
    renderConfiguracoesPage();
    showToast('Logo atualizada!', 'success');
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  if (!appData.empresa) appData.empresa = {};
  appData.empresa.logo = '';
  saveData();
  updateSidebarInfo();
  renderConfiguracoesPage();
  showToast('Logo removida!', 'success');
}

function salvarEmpresa() {
  if (!appData.empresa) appData.empresa = {};
  appData.empresa.nome = document.getElementById('cfgNome').value.trim();
  appData.empresa.cnpj = document.getElementById('cfgCnpj').value.trim();
  saveData();
  updateSidebarInfo();
  showToast('Empresa atualizada!', 'success');
}

function addVendedor() { var v=document.getElementById('cfgNovoVendedor').value.trim(); if(!v)return; if(!appData.vendedores)appData.vendedores=[]; appData.vendedores.push(v); saveData(); renderConfiguracoesPage(); }
function removeVendedor(i) { appData.vendedores.splice(i,1); saveData(); renderConfiguracoesPage(); }
function addPgto() { var f=document.getElementById('cfgNovoPgto').value.trim(); if(!f)return; if(!appData.formasPagamento)appData.formasPagamento=[]; appData.formasPagamento.push(f); saveData(); renderConfiguracoesPage(); }
function removePgto(i) { appData.formasPagamento.splice(i,1); saveData(); renderConfiguracoesPage(); }
function addCat() { var n=document.getElementById('cfgNovaCat').value.trim(); var t=document.getElementById('cfgNovaCatTipo').value; if(!n)return; if(!appData.categoriasFluxo)appData.categoriasFluxo=[]; appData.categoriasFluxo.push({nome:n,tipo:t}); saveData(); renderConfiguracoesPage(); }
function removeCat(i) { appData.categoriasFluxo.splice(i,1); saveData(); renderConfiguracoesPage(); }

// ============================================================
// BACKUP
// ============================================================
function renderBackupPage() {
  var pg = document.getElementById('page-backup');
  var supaOk = !!supabaseClient;
  var statusMsg = supaOk ? '<span style="color:var(--success)">✔ Conectado</span>' : '<span style="color:var(--danger)">✖ Não conectado</span>';
  pg.innerHTML =
    '<div class="page-header"><h2>💾 Backup</h2></div>' +
    '<div class="card" style="margin-bottom:16px">' +
      '<div class="section-title">Supabase</div>' +
      '<p style="margin-bottom:8px;color:var(--text-secondary)">Dados sincronizados automaticamente com Supabase.</p>' +
      '<p style="margin-bottom:12px">Status: ' + statusMsg + '</p>' +
      '<div id="supabaseStatus" style="margin-bottom:12px"></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn btn-primary" onclick="forceUpload()">⬆ Forçar Upload</button>' +
        '<button class="btn btn-secondary" onclick="forceDownload()">⬇ Forçar Download</button>' +
      '</div>' +
    '</div>' +
    '<div class="card" style="margin-bottom:16px">' +
      '<div class="section-title">Backup Local (JSON)</div>' +
      '<p style="margin-bottom:12px;color:var(--text-secondary)">Exporte ou importe seus dados em formato JSON.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn btn-primary" onclick="exportBackup()">📥 Exportar Backup</button>' +
        '<button class="btn btn-secondary" onclick="document.getElementById(\'importFile\').click()">📤 Importar Backup</button>' +
        '<input type="file" id="importFile" accept=".json" style="display:none" onchange="importBackup(event)">' +
      '</div>' +
    '</div>' +
    '<div class="card" style="border-color:var(--danger)">' +
      '<div class="section-title" style="color:var(--danger)">⚠ Zona Perigosa</div>' +
      '<p style="margin-bottom:12px;color:var(--text-secondary)">Excluir TODOS os dados do sistema. Esta ação não pode ser desfeita.</p>' +
      '<button class="btn btn-danger" onclick="excluirTodosDados()">🗑️ Excluir Todos os Dados</button>' +
    '</div>';
  checkSupabase();
}

function checkSupabase() {
  var el = document.getElementById('supabaseStatus');
  if (!el) return;
  if (!supabaseClient) {
    el.innerHTML = '<span style="color:var(--danger)">Supabase não configurado</span>';
    return;
  }
  supabaseClient.from('wdmaquinas_data').select('updated_at').eq('id', 1).single().then(function(res) {
    if (res.data && res.data.updated_at) {
      var d = new Date(res.data.updated_at);
      el.innerHTML = '<span style="color:var(--success)">Último sync: ' + d.toLocaleString('pt-BR') + '</span>';
    } else {
      el.innerHTML = '<span style="color:var(--warning)">Nenhum dado no Supabase ainda</span>';
    }
  }).catch(function() {
    el.innerHTML = '<span style="color:var(--danger)">Erro ao verificar Supabase</span>';
  });
}

async function forceUpload() {
  if (!supabaseClient) { showToast('Supabase não conectado', 'error'); return; }
  try {
    await supabaseClient.from('wdmaquinas_data').upsert({ id: 1, payload: appData, updated_at: new Date().toISOString() });
    showToast('Upload realizado com sucesso!', 'success');
    checkSupabase();
  } catch (e) {
    showToast('Erro no upload: ' + e.message, 'error');
  }
}

async function forceDownload() {
  if (!supabaseClient) { showToast('Supabase não conectado', 'error'); return; }
  try {
    const { data, error } = await supabaseClient.from('wdmaquinas_data').select('*').eq('id', 1).single();
    if (data && data.payload) {
      appData = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
      ensureDefaults();
      saveData();
      showToast('Download realizado com sucesso!', 'success');
      renderDashboard();
      updateSidebarInfo();
      checkSupabase();
    } else {
      showToast('Nenhum dado encontrado no Supabase', 'error');
    }
  } catch (e) {
    showToast('Erro no download: ' + e.message, 'error');
  }
}

function exportBackup() {
  var blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  var hoje = new Date().toISOString().split('T')[0];
  a.download = 'wdmaquinas_backup_' + hoje + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exportado!', 'success');
}

function importBackup(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var dados = JSON.parse(e.target.result);
      appData = dados;
      ensureDefaults();
      saveData();
      showToast('Backup importado com sucesso!', 'success');
      renderDashboard();
      updateSidebarInfo();
    } catch (err) {
      showToast('Erro ao importar: arquivo inválido', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function excluirTodosDados() {
  if (!confirm('⚠ ATENÇÃO: Isso vai excluir TODOS os dados do sistema. Deseja continuar?')) return;
  if (!confirm('ÚLTIMA CHANCE: Tem certeza que deseja apagar tudo? Esta ação NÃO pode ser desfeita!')) return;
  appData = getDefaultData();
  saveData();
  showToast('Todos os dados foram excluídos!', 'success');
  renderBackupPage();
  renderDashboard();
  updateSidebarInfo();
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
  // Supabase init
  try {
    if (typeof supabase !== 'undefined') {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Supabase conectado');
    }
  } catch(e) { console.warn('Supabase indisponível:', e.message); }

  // Data atual no topbar
  var d = new Date();
  var dias = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  var meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = dias[d.getDay()] + ', ' + d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear();
  }

  // Carregar dados e renderizar
  await loadData();
  renderDashboard();
  updateSidebarInfo();
});
