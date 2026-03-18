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
  // Tentar Supabase
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
  // Fallback localStorage
  try {
    const local = localStorage.getItem('wdmaquinas_data');
    if (local) { appData = JSON.parse(local); ensureDefaults(); console.log('Dados carregados do localStorage'); return; }
  } catch (e) {}
  // Padrão
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

// ---------- SIDEBAR TOGGLE ----------
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

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

  // Calcular caixa acumulado até o mês anterior
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

  // Dinheiro em Notas e Salário
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
      <table class="table"><thead><tr><th>Dia</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead>
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
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="vQtd" value="${venda?venda.quantidade:1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="vValorUnit" value="${venda?venda.valorUnit:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Vendedor</label><select class="form-control" id="vVendedor">${vendOpts}</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="vPgto">${pgtoOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Tipo</label><select class="form-control" id="vTipo">${tipoOpts}</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="vSit"><option value="Pago" ${venda&&venda.situacao==='Pago'?'selected':''}>Pago</option><option value="Devendo" ${venda&&venda.situacao==='Devendo'?'selected':''}>Devendo</option></select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="vObs" rows="2">${venda?venda.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda(${isEdit?venda.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveVenda(id) {
  const obj={data:document.getElementById('vData').value,cliente:document.getElementById('vCliente').value,produto:document.getElementById('vProduto').value,quantidade:parseFloat(document.getElementById('vQtd').value)||1,valorUnit:parseFloat(document.getElementById('vValorUnit').value)||0,vendedor:document.getElementById('vVendedor').value,formaPagamento:document.getElementById('vPgto').value,tipo:document.getElementById('vTipo').value,situacao:document.getElementById('vSit').value,obs:document.getElementById('vObs').value};
  if(!obj.cliente||!obj.produto){showToast('Preencha cliente e produto','error');return;}
  if(id){const idx=appData.vendas.findIndex(v=>v.id===id);if(idx>-1){obj.id=id;appData.vendas[idx]=obj;}}else{obj.id=nextId(appData.vendas);appData.vendas.push(obj);}
  saveData();closeCadastroModal();renderVendasPage();showToast(id?'Venda atualizada!':'Venda cadastrada!','success');
}

function editVenda(id){const v=appData.vendas.find(x=>x.id===id);if(v)openVendaModal(v);}

function viewVenda(id) {
  const v=appData.vendas.find(x=>x.id===id);if(!v)return;
  document.getElementById('viewModalTitle').textContent='Venda #'+v.id;
  document.getElementById('viewModalBody').innerHTML=`<div class="detail-grid">
    <div class="detail-item"><span class="detail-label">Data</span>${formatDate(v.data)}</div><div class="detail-item"><span class="detail-label">Cliente</span>${v.cliente}</div>
    <div class="detail-item"><span class="detail-label">Produto</span>${v.produto}</div><div class="detail-item"><span class="detail-label">Qtd</span>${v.quantidade}</div>
    <div class="detail-item"><span class="detail-label">V.Unit</span>${formatCurrency(v.valorUnit)}</div><div class="detail-item"><span class="detail-label">Total</span>${formatCurrency(v.quantidade*v.valorUnit)}</div>
    <div class="detail-item"><span class="detail-label">Vendedor</span>${v.vendedor}</div><div class="detail-item"><span class="detail-label">Pgto</span>${v.formaPagamento}</div>
    <div class="detail-item"><span class="detail-label">Tipo</span>${v.tipo}</div><div class="detail-item"><span class="detail-label">Situação</span><span class="badge ${v.situacao==='Pago'?'badge-success':'badge-danger'}">${v.situacao}</span></div>
  </div>${v.obs?`<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${v.obs}</div>`:''}`;
  openViewModal();
}

function deleteVenda(id){if(!confirm('Excluir venda?'))return;appData.vendas=appData.vendas.filter(v=>v.id!==id);saveData();renderVendasPage();showToast('Venda excluída!','success');}

// ============================================================
// ESTOQUE
// ============================================================
function renderEstoquePage() {
  const pg=document.getElementById('page-estoque');const estoque=appData.estoque||[];
  pg.innerHTML=`<div class="page-header"><h2>📦 Estoque</h2><button class="btn btn-primary" onclick="openEstoqueModal()">+ Novo Item</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterEstoque(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Produto</th><th>Qtd</th><th>Unidade</th><th>Local</th><th>Mín.</th><th>Status</th><th>Ações</th></tr></thead><tbody id="estoqueBody"></tbody></table></div>`;
  renderEstoqueTable(estoque);
}

function renderEstoqueTable(items) {
  const tbody=document.getElementById('estoqueBody');if(!tbody)return;
  tbody.innerHTML=items.length===0?'<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum item</td></tr>':
    items.map(e=>{const low=e.quantidade<=(e.estoqueMin||0);return`<tr><td>${e.id}</td><td>${e.produto}</td><td>${e.quantidade}</td><td>${e.unidade||'Un'}</td><td>${e.localizacao||'-'}</td><td>${e.estoqueMin||0}</td><td><span class="badge ${low?'badge-danger':'badge-success'}">${low?'Baixo':'OK'}</span></td><td><button class="btn btn-sm btn-primary" onclick="editEstoque(${e.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteEstoque(${e.id})">🗑️</button></td></tr>`;}).join('');
}

function filterEstoque(q){q=q.toLowerCase();renderEstoqueTable((appData.estoque||[]).filter(e=>e.produto.toLowerCase().includes(q)));}

function openEstoqueModal(item) {
  const isEdit=!!item;const unidOpts=(appData.tipoUnidade||[]).map(u=>`<option value="${u}" ${item&&item.unidade===u?'selected':''}>${u}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Item':'Novo Item';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="eProd" value="${item?item.produto:''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="eQtd" value="${item?item.quantidade:0}" min="0"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="eUnid">${unidOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Estoque Mín.</label><input type="number" class="form-control" id="eMin" value="${item?item.estoqueMin||0:0}" min="0"></div><div class="form-group"><label>Localização</label><input type="text" class="form-control" id="eLocal" value="${item?item.localizacao||'':''}"></div></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEstoque(${isEdit?item.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveEstoque(id) {
  const obj={produto:document.getElementById('eProd').value.trim(),quantidade:parseFloat(document.getElementById('eQtd').value)||0,unidade:document.getElementById('eUnid').value,estoqueMin:parseFloat(document.getElementById('eMin').value)||0,localizacao:document.getElementById('eLocal').value};
  if(!obj.produto){showToast('Informe o produto','error');return;}if(!appData.estoque)appData.estoque=[];
  if(id){const idx=appData.estoque.findIndex(e=>e.id===id);if(idx>-1){obj.id=id;appData.estoque[idx]=obj;}}else{obj.id=nextId(appData.estoque);appData.estoque.push(obj);}
  saveData();closeCadastroModal();renderEstoquePage();showToast(id?'Item atualizado!':'Item cadastrado!','success');
}

function editEstoque(id){const e=(appData.estoque||[]).find(x=>x.id===id);if(e)openEstoqueModal(e);}
function deleteEstoque(id){if(!confirm('Excluir item?'))return;appData.estoque=(appData.estoque||[]).filter(e=>e.id!==id);saveData();renderEstoquePage();showToast('Item excluído!','success');}

// ============================================================
// CLIENTES
// ============================================================
function renderClientesPage() {
  const pg=document.getElementById('page-clientes');const clientes=appData.clientes||[];
  pg.innerHTML=`<div class="page-header"><h2>👥 Clientes</h2><button class="btn btn-primary" onclick="openClienteModal()">+ Novo Cliente</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:300px" placeholder="Buscar cliente..." oninput="filterClientes(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>UF</th><th>Ações</th></tr></thead><tbody id="clientesBody"></tbody></table></div>`;
  renderClientesTable(clientes);
}

function renderClientesTable(clientes) {
  const tbody=document.getElementById('clientesBody');if(!tbody)return;
  tbody.innerHTML=clientes.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cliente</td></tr>':
    clientes.map(c=>`<tr><td>${c.id}</td><td>${c.nome}</td><td>${c.cpfCnpj||'-'}</td><td>${c.telefone||'-'}</td><td>${c.cidade||'-'}</td><td>${c.estado||'-'}</td><td><button class="btn btn-sm btn-outline" onclick="viewCliente(${c.id})">👁️</button><button class="btn btn-sm btn-primary" onclick="editCliente(${c.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteCliente(${c.id})">🗑️</button></td></tr>`).join('');
}

function filterClientes(q){q=q.toLowerCase();renderClientesTable((appData.clientes||[]).filter(c=>c.nome.toLowerCase().includes(q)||(c.cpfCnpj||'').includes(q)));}

function openClienteModal(cli) {
  const isEdit=!!cli;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cliente':'Novo Cliente';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="cNome" value="${cli?cli.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="cDoc" value="${cli?cli.cpfCnpj||'':''}"></div><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="cTel" value="${cli?cli.telefone||'':''}"></div></div>
    <div class="form-group"><label>Email</label><input type="email" class="form-control" id="cEmail" value="${cli?cli.email||'':''}"></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="cEnd" value="${cli?cli.endereco||'':''}"></div>
    <div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="cCidade" value="${cli?cli.cidade||'':''}"></div><div class="form-group"><label>UF</label><input type="text" class="form-control" id="cEstado" value="${cli?cli.estado||'':''}" maxlength="2"></div></div>
    <div class="form-row"><div class="form-group"><label>CEP</label><input type="text" class="form-control" id="cCep" value="${cli?cli.cep||'':''}"></div><div class="form-group"><label>Imagem (URL)</label><input type="text" class="form-control" id="cImg" value="${cli?cli.img||'':''}"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="cObs" rows="2">${cli?cli.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCliente(${isEdit?cli.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveCliente(id) {
  const obj={nome:document.getElementById('cNome').value.trim(),cpfCnpj:document.getElementById('cDoc').value,telefone:document.getElementById('cTel').value,email:document.getElementById('cEmail').value,endereco:document.getElementById('cEnd').value,cidade:document.getElementById('cCidade').value,estado:document.getElementById('cEstado').value.toUpperCase(),cep:document.getElementById('cCep').value,img:document.getElementById('cImg').value,obs:document.getElementById('cObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(id){const idx=appData.clientes.findIndex(c=>c.id===id);if(idx>-1){obj.id=id;appData.clientes[idx]=obj;}}else{obj.id=nextId(appData.clientes);appData.clientes.push(obj);}
  saveData();closeCadastroModal();renderClientesPage();showToast(id?'Cliente atualizado!':'Cliente cadastrado!','success');
}

function editCliente(id){const c=appData.clientes.find(x=>x.id===id);if(c)openClienteModal(c);}

function viewCliente(id) {
  const c=appData.clientes.find(x=>x.id===id);if(!c)return;
  document.getElementById('viewModalTitle').textContent=c.nome;
  document.getElementById('viewModalBody').innerHTML=`<div class="detail-grid">
    <div class="detail-item"><span class="detail-label">CPF/CNPJ</span>${c.cpfCnpj||'-'}</div><div class="detail-item"><span class="detail-label">Telefone</span>${c.telefone||'-'}</div>
    <div class="detail-item"><span class="detail-label">Email</span>${c.email||'-'}</div><div class="detail-item"><span class="detail-label">Endereço</span>${c.endereco||'-'}</div>
    <div class="detail-item"><span class="detail-label">Cidade</span>${c.cidade||'-'}</div><div class="detail-item"><span class="detail-label">UF</span>${c.estado||'-'}</div>
    <div class="detail-item"><span class="detail-label">CEP</span>${c.cep||'-'}</div></div>${c.obs?`<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${c.obs}</div>`:''}`;
  openViewModal();
}

function deleteCliente(id){if(!confirm('Excluir cliente?'))return;appData.clientes=appData.clientes.filter(c=>c.id!==id);saveData();renderClientesPage();showToast('Cliente excluído!','success');}

// ============================================================
// FORNECEDORES
// ============================================================
function renderFornecedoresPage() {
  const pg=document.getElementById('page-fornecedores');const fornecedores=appData.fornecedores||[];
  pg.innerHTML=`<div class="page-header"><h2>🏭 Fornecedores</h2><button class="btn btn-primary" onclick="openFornecedorModal()">+ Novo Fornecedor</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:300px" placeholder="Buscar fornecedor..." oninput="filterFornecedores(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead><tbody id="fornecedoresBody"></tbody></table></div>`;
  renderFornecedoresTable(fornecedores);
}

function renderFornecedoresTable(fornecedores) {
  const tbody=document.getElementById('fornecedoresBody');if(!tbody)return;
  tbody.innerHTML=fornecedores.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum fornecedor</td></tr>':
    fornecedores.map(f=>`<tr><td>${f.id}</td><td>${f.nome}</td><td>${f.cpfCnpj||'-'}</td><td>${f.telefone||'-'}</td><td>${f.cidade||'-'}</td><td><button class="btn btn-sm btn-outline" onclick="viewFornecedor(${f.id})">👁️</button><button class="btn btn-sm btn-primary" onclick="editFornecedor(${f.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteFornecedor(${f.id})">🗑️</button></td></tr>`).join('');
}

function filterFornecedores(q){q=q.toLowerCase();renderFornecedoresTable((appData.fornecedores||[]).filter(f=>f.nome.toLowerCase().includes(q)));}

function openFornecedorModal(forn) {
  const isEdit=!!forn;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Fornecedor':'Novo Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="fNome" value="${forn?forn.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="fDoc" value="${forn?forn.cpfCnpj||'':''}"></div><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="fTel" value="${forn?forn.telefone||'':''}"></div></div>
    <div class="form-group"><label>Email</label><input type="email" class="form-control" id="fEmail" value="${forn?forn.email||'':''}"></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="fEnd" value="${forn?forn.endereco||'':''}"></div>
    <div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="fCidade" value="${forn?forn.cidade||'':''}"></div><div class="form-group"><label>UF</label><input type="text" class="form-control" id="fEstado" value="${forn?forn.estado||'':''}" maxlength="2"></div></div>
    <div class="form-row"><div class="form-group"><label>CEP</label><input type="text" class="form-control" id="fCep" value="${forn?forn.cep||'':''}"></div><div class="form-group"><label>Imagem (URL)</label><input type="text" class="form-control" id="fImg" value="${forn?forn.img||'':''}"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="fObs" rows="2">${forn?forn.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFornecedor(${isEdit?forn.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveFornecedor(id) {
  const obj={nome:document.getElementById('fNome').value.trim(),cpfCnpj:document.getElementById('fDoc').value,telefone:document.getElementById('fTel').value,email:document.getElementById('fEmail').value,endereco:document.getElementById('fEnd').value,cidade:document.getElementById('fCidade').value,estado:document.getElementById('fEstado').value.toUpperCase(),cep:document.getElementById('fCep').value,img:document.getElementById('fImg').value,obs:document.getElementById('fObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(id){const idx=appData.fornecedores.findIndex(f=>f.id===id);if(idx>-1){obj.id=id;appData.fornecedores[idx]=obj;}}else{obj.id=nextId(appData.fornecedores);appData.fornecedores.push(obj);}
  saveData();closeCadastroModal();renderFornecedoresPage();showToast(id?'Fornecedor atualizado!':'Fornecedor cadastrado!','success');
}

function editFornecedor(id){const f=appData.fornecedores.find(x=>x.id===id);if(f)openFornecedorModal(f);}

function viewFornecedor(id) {
  const f=appData.fornecedores.find(x=>x.id===id);if(!f)return;
  document.getElementById('viewModalTitle').textContent=f.nome;
  document.getElementById('viewModalBody').innerHTML=`<div class="detail-grid">
    <div class="detail-item"><span class="detail-label">CPF/CNPJ</span>${f.cpfCnpj||'-'}</div><div class="detail-item"><span class="detail-label">Telefone</span>${f.telefone||'-'}</div>
    <div class="detail-item"><span class="detail-label">Email</span>${f.email||'-'}</div><div class="detail-item"><span class="detail-label">Endereço</span>${f.endereco||'-'}</div>
    <div class="detail-item"><span class="detail-label">Cidade</span>${f.cidade||'-'}</div><div class="detail-item"><span class="detail-label">UF</span>${f.estado||'-'}</div></div>`;
  openViewModal();
}

function deleteFornecedor(id){if(!confirm('Excluir fornecedor?'))return;appData.fornecedores=appData.fornecedores.filter(f=>f.id!==id);saveData();renderFornecedoresPage();showToast('Fornecedor excluído!','success');}

// ============================================================
// PRODUTOS
// ============================================================
function renderProdutosPage() {
  const pg=document.getElementById('page-produtos');const produtos=appData.produtos||[];
  pg.innerHTML=`<div class="page-header"><h2>🏷️ Produtos</h2><button class="btn btn-primary" onclick="openProdutoModal()">+ Novo Produto</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:300px" placeholder="Buscar produto..." oninput="filterProdutos(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Unidade</th><th>P.Custo</th><th>P.Venda</th><th>Ações</th></tr></thead><tbody id="produtosBody"></tbody></table></div>`;
  renderProdutosTable(produtos);
}

function renderProdutosTable(produtos) {
  const tbody=document.getElementById('produtosBody');if(!tbody)return;
  tbody.innerHTML=produtos.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto</td></tr>':
    produtos.map(p=>`<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.categoria||'-'}</td><td>${p.unidade||'-'}</td><td>${formatCurrency(p.precoCusto||0)}</td><td>${formatCurrency(p.precoVenda||0)}</td><td><button class="btn btn-sm btn-primary" onclick="editProduto(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteProduto(${p.id})">🗑️</button></td></tr>`).join('');
}

function filterProdutos(q){q=q.toLowerCase();renderProdutosTable((appData.produtos||[]).filter(p=>p.nome.toLowerCase().includes(q)));}

function openProdutoModal(prod) {
  const isEdit=!!prod;const unidOpts=(appData.tipoUnidade||[]).map(u=>`<option value="${u}" ${prod&&prod.unidade===u?'selected':''}>${u}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Produto':'Novo Produto';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="pNome" value="${prod?prod.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="pCat" value="${prod?prod.categoria||'':''}"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="pUnid">${unidOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>P.Custo</label><input type="number" class="form-control" id="pCusto" value="${prod?prod.precoCusto||'':''}" step="0.01"></div><div class="form-group"><label>P.Venda</label><input type="number" class="form-control" id="pVenda" value="${prod?prod.precoVenda||'':''}" step="0.01"></div></div>
    <div class="form-group"><label>Descrição</label><textarea class="form-control" id="pDesc" rows="2">${prod?prod.descricao||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduto(${isEdit?prod.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveProduto(id) {
  const obj={nome:document.getElementById('pNome').value.trim(),categoria:document.getElementById('pCat').value,unidade:document.getElementById('pUnid').value,precoCusto:parseFloat(document.getElementById('pCusto').value)||0,precoVenda:parseFloat(document.getElementById('pVenda').value)||0,descricao:document.getElementById('pDesc').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}if(!appData.produtos)appData.produtos=[];
  if(id){const idx=appData.produtos.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.produtos[idx]=obj;}}else{obj.id=nextId(appData.produtos);appData.produtos.push(obj);}
  saveData();closeCadastroModal();renderProdutosPage();showToast(id?'Produto atualizado!':'Produto cadastrado!','success');
}

function editProduto(id){const p=(appData.produtos||[]).find(x=>x.id===id);if(p)openProdutoModal(p);}
function deleteProduto(id){if(!confirm('Excluir produto?'))return;appData.produtos=(appData.produtos||[]).filter(p=>p.id!==id);saveData();renderProdutosPage();showToast('Produto excluído!','success');}

// ============================================================
// PRODUTOS DE FORNECEDORES
// ============================================================
function renderPFornecedoresPage() {
  const pg=document.getElementById('page-pfornecedores');const pf=appData.pFornecedores||[];
  pg.innerHTML=`<div class="page-header"><h2>📋 P. Fornecedores</h2><button class="btn btn-primary" onclick="openPFornModal()">+ Novo</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:300px" placeholder="Buscar..." oninput="filterPForn(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Fornecedor</th><th>Produto</th><th>Preço</th><th>Obs</th><th>Ações</th></tr></thead><tbody id="pfornBody"></tbody></table></div>`;
  renderPFornTable(pf);
}

function renderPFornTable(items) {
  const tbody=document.getElementById('pfornBody');if(!tbody)return;
  tbody.innerHTML=items.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>':
    items.map(p=>`<tr><td>${p.id}</td><td>${p.fornecedor}</td><td>${p.produto}</td><td>${formatCurrency(p.preco||0)}</td><td>${p.obs||'-'}</td><td><button class="btn btn-sm btn-primary" onclick="editPForn(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deletePForn(${p.id})">🗑️</button></td></tr>`).join('');
}

function filterPForn(q){q=q.toLowerCase();renderPFornTable((appData.pFornecedores||[]).filter(p=>p.fornecedor.toLowerCase().includes(q)||p.produto.toLowerCase().includes(q)));}

function openPFornModal(item) {
  const isEdit=!!item;const fornOpts=(appData.fornecedores||[]).map(f=>`<option value="${f.nome}" ${item&&item.fornecedor===f.nome?'selected':''}>${f.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar':'Novo P.Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Fornecedor</label><select class="form-control" id="pfForn"><option value="">Selecione...</option>${fornOpts}</select></div>
    <div class="form-group"><label>Produto</label><input type="text" class="form-control" id="pfProd" value="${item?item.produto:''}"></div>
    <div class="form-group"><label>Preço</label><input type="number" class="form-control" id="pfPreco" value="${item?item.preco||'':''}" step="0.01"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pfObs" rows="2">${item?item.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePForn(${isEdit?item.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePForn(id) {
  const obj={fornecedor:document.getElementById('pfForn').value,produto:document.getElementById('pfProd').value.trim(),preco:parseFloat(document.getElementById('pfPreco').value)||0,obs:document.getElementById('pfObs').value};
  if(!obj.fornecedor||!obj.produto){showToast('Preencha fornecedor e produto','error');return;}if(!appData.pFornecedores)appData.pFornecedores=[];
  if(id){const idx=appData.pFornecedores.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.pFornecedores[idx]=obj;}}else{obj.id=nextId(appData.pFornecedores);appData.pFornecedores.push(obj);}
  saveData();closeCadastroModal();renderPFornecedoresPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}

function editPForn(id){const p=(appData.pFornecedores||[]).find(x=>x.id===id);if(p)openPFornModal(p);}
function deletePForn(id){if(!confirm('Excluir?'))return;appData.pFornecedores=(appData.pFornecedores||[]).filter(p=>p.id!==id);saveData();renderPFornecedoresPage();showToast('Excluído!','success');}

// ============================================================
// BOLETOS
// ============================================================
function renderBoletosPage() {
  const pg=document.getElementById('page-boletos');const boletos=appData.boletos||[];
  pg.innerHTML=`<div class="page-header"><h2>🔖 Boletos</h2><button class="btn btn-primary" onclick="openBoletoModal()">+ Novo Boleto</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterBoletos(this.value)"><select class="form-control" style="max-width:150px" onchange="filterBoletosSit(this.value)"><option value="">Todas</option>${(appData.situacaoBoleto||[]).map(s=>`<option value="${s}">${s}</option>`).join('')}</select></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Fornecedor</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="boletosBody"></tbody></table></div>`;
  renderBoletosTable(boletos);
}

function renderBoletosTable(boletos) {
  const tbody=document.getElementById('boletosBody');if(!tbody)return;
  tbody.innerHTML=boletos.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>':
    boletos.map(b=>`<tr><td>${b.id}</td><td>${b.descricao||'-'}</td><td>${formatCurrency(b.valor)}</td><td>${formatDate(b.vencimento)}</td><td>${b.fornecedor||'-'}</td><td><span class="badge ${b.situacao==='Pago'?'badge-success':b.situacao==='Vencido'?'badge-danger':'badge-warning'}">${b.situacao}</span></td><td><button class="btn btn-sm btn-primary" onclick="editBoleto(${b.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteBoleto(${b.id})">🗑️</button></td></tr>`).join('');
}

function filterBoletos(q){q=q.toLowerCase();renderBoletosTable((appData.boletos||[]).filter(b=>(b.descricao||'').toLowerCase().includes(q)||(b.fornecedor||'').toLowerCase().includes(q)));}
function filterBoletosSit(s){renderBoletosTable(s?(appData.boletos||[]).filter(b=>b.situacao===s):(appData.boletos||[]));}

function openBoletoModal(boleto) {
  const isEdit=!!boleto;const fornOpts=(appData.fornecedores||[]).map(f=>`<option value="${f.nome}" ${boleto&&boleto.fornecedor===f.nome?'selected':''}>${f.nome}</option>`).join('');const sitOpts=(appData.situacaoBoleto||[]).map(s=>`<option value="${s}" ${boleto&&boleto.situacao===s?'selected':''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Boleto':'Novo Boleto';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Descrição</label><input type="text" class="form-control" id="bDesc" value="${boleto?boleto.descricao||'':''}"></div>
    <div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="bValor" value="${boleto?boleto.valor:''}" step="0.01"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="bVenc" value="${boleto?boleto.vencimento:''}"></div></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="bForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="bSit">${sitOpts}</select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="bObs" rows="2">${boleto?boleto.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBoleto(${isEdit?boleto.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveBoleto(id) {
  const obj={descricao:document.getElementById('bDesc').value,valor:parseFloat(document.getElementById('bValor').value)||0,vencimento:document.getElementById('bVenc').value,fornecedor:document.getElementById('bForn').value,situacao:document.getElementById('bSit').value,obs:document.getElementById('bObs').value};
  if(!appData.boletos)appData.boletos=[];
  if(id){const idx=appData.boletos.findIndex(b=>b.id===id);if(idx>-1){obj.id=id;appData.boletos[idx]=obj;}}else{obj.id=nextId(appData.boletos);appData.boletos.push(obj);}
  saveData();closeCadastroModal();renderBoletosPage();showToast(id?'Boleto atualizado!':'Boleto cadastrado!','success');
}

function editBoleto(id){const b=(appData.boletos||[]).find(x=>x.id===id);if(b)openBoletoModal(b);}
function deleteBoleto(id){if(!confirm('Excluir boleto?'))return;appData.boletos=(appData.boletos||[]).filter(b=>b.id!==id);saveData();renderBoletosPage();showToast('Boleto excluído!','success');}

// ============================================================
// CHEQUES
// ============================================================
function renderChequesPage() {
  const pg=document.getElementById('page-cheques');const cheques=appData.cheques||[];
  pg.innerHTML=`<div class="page-header"><h2>📝 Cheques</h2><button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nº</th><th>Valor</th><th>Data</th><th>Emitente</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="chequesBody"></tbody></table></div>`;
  const tbody=document.getElementById('chequesBody');
  tbody.innerHTML=cheques.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>':
    cheques.map(c=>`<tr><td>${c.id}</td><td>${c.numero||'-'}</td><td>${formatCurrency(c.valor)}</td><td>${formatDate(c.data)}</td><td>${c.emitente||'-'}</td><td><span class="badge ${c.situacao==='Compensado'?'badge-success':c.situacao==='Devolvido'?'badge-danger':'badge-warning'}">${c.situacao}</span></td><td><button class="btn btn-sm btn-primary" onclick="editCheque(${c.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteCheque(${c.id})">🗑️</button></td></tr>`).join('');
}

function openChequeModal(cheque) {
  const isEdit=!!cheque;const sitOpts=(appData.situacaoCheque||[]).map(s=>`<option value="${s}" ${cheque&&cheque.situacao===s?'selected':''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cheque':'Novo Cheque';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Nº Cheque</label><input type="text" class="form-control" id="chNum" value="${cheque?cheque.numero||'':''}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="chValor" value="${cheque?cheque.valor:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="chData" value="${cheque?cheque.data:''}"></div><div class="form-group"><label>Situação</label><select class="form-control" id="chSit">${sitOpts}</select></div></div>
    <div class="form-group"><label>Emitente</label><input type="text" class="form-control" id="chEmit" value="${cheque?cheque.emitente||'':''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="chObs" rows="2">${cheque?cheque.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCheque(${isEdit?cheque.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveCheque(id) {
  const obj={numero:document.getElementById('chNum').value,valor:parseFloat(document.getElementById('chValor').value)||0,data:document.getElementById('chData').value,situacao:document.getElementById('chSit').value,emitente:document.getElementById('chEmit').value,obs:document.getElementById('chObs').value};
  if(!appData.cheques)appData.cheques=[];
  if(id){const idx=appData.cheques.findIndex(c=>c.id===id);if(idx>-1){obj.id=id;appData.cheques[idx]=obj;}}else{obj.id=nextId(appData.cheques);appData.cheques.push(obj);}
  saveData();closeCadastroModal();renderChequesPage();showToast(id?'Cheque atualizado!':'Cheque cadastrado!','success');
}

function editCheque(id){const c=(appData.cheques||[]).find(x=>x.id===id);if(c)openChequeModal(c);}
function deleteCheque(id){if(!confirm('Excluir cheque?'))return;appData.cheques=(appData.cheques||[]).filter(c=>c.id!==id);saveData();renderChequesPage();showToast('Cheque excluído!','success');}

// ============================================================
// PRESTAÇÕES
// ============================================================
function renderPrestacoesPage() {
  const pg=document.getElementById('page-prestacoes');const prestacoes=appData.prestacoes||[];
  pg.innerHTML=`<div class="page-header"><h2>💳 Prestações</h2><button class="btn btn-primary" onclick="openPrestacaoModal()">+ Nova Prestação</button></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Descrição</th><th>V.Total</th><th>Parcelas</th><th>V.Parcela</th><th>Pagas</th><th>Restante</th><th>Status</th><th>Ações</th></tr></thead><tbody id="prestacoesBody"></tbody></table></div>`;
  const tbody=document.getElementById('prestacoesBody');
  tbody.innerHTML=prestacoes.length===0?'<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma prestação</td></tr>':
    prestacoes.map(p=>{const pagas=p.parcelasPagas||0;const rest=(p.parcelas-pagas)*(p.valorParcela||0);const sit=pagas>=p.parcelas?'Quitado':'Em aberto';return`<tr><td>${p.id}</td><td>${p.descricao}</td><td>${formatCurrency(p.valorTotal)}</td><td>${p.parcelas}</td><td>${formatCurrency(p.valorParcela||0)}</td><td>${pagas}/${p.parcelas}</td><td>${formatCurrency(rest)}</td><td><span class="badge ${sit==='Quitado'?'badge-success':'badge-warning'}">${sit}</span></td><td><button class="btn btn-sm btn-primary" onclick="editPrestacao(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deletePrestacao(${p.id})">🗑️</button></td></tr>`;}).join('');
}

function openPrestacaoModal(prest) {
  const isEdit=!!prest;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Prestação':'Nova Prestação';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Descrição</label><input type="text" class="form-control" id="prDesc" value="${prest?prest.descricao:''}"></div>
    <div class="form-row"><div class="form-group"><label>V.Total</label><input type="number" class="form-control" id="prTotal" value="${prest?prest.valorTotal:''}" step="0.01"></div><div class="form-group"><label>Parcelas</label><input type="number" class="form-control" id="prParc" value="${prest?prest.parcelas:''}" min="1"></div></div>
    <div class="form-row"><div class="form-group"><label>V.Parcela</label><input type="number" class="form-control" id="prVP" value="${prest?prest.valorParcela||'':''}" step="0.01"></div><div class="form-group"><label>Pagas</label><input type="number" class="form-control" id="prPagas" value="${prest?prest.parcelasPagas||0:0}" min="0"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="prObs" rows="2">${prest?prest.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePrestacao(${isEdit?prest.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePrestacao(id) {
  const obj={descricao:document.getElementById('prDesc').value,valorTotal:parseFloat(document.getElementById('prTotal').value)||0,parcelas:parseInt(document.getElementById('prParc').value)||1,valorParcela:parseFloat(document.getElementById('prVP').value)||0,parcelasPagas:parseInt(document.getElementById('prPagas').value)||0,obs:document.getElementById('prObs').value};
  if(!appData.prestacoes)appData.prestacoes=[];
  if(id){const idx=appData.prestacoes.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.prestacoes[idx]=obj;}}else{obj.id=nextId(appData.prestacoes);appData.prestacoes.push(obj);}
  saveData();closeCadastroModal();renderPrestacoesPage();showToast(id?'Prestação atualizada!':'Prestação cadastrada!','success');
}

function editPrestacao(id){const p=(appData.prestacoes||[]).find(x=>x.id===id);if(p)openPrestacaoModal(p);}
function deletePrestacao(id){if(!confirm('Excluir prestação?'))return;appData.prestacoes=(appData.prestacoes||[]).filter(p=>p.id!==id);saveData();renderPrestacoesPage();showToast('Prestação excluída!','success');}

// ============================================================
// PROJETOS
// ============================================================
function renderProjetosPage() {
  const pg=document.getElementById('page-projetos');const projetos=appData.projetos||[];
  pg.innerHTML=`<div class="page-header"><h2>📐 Projetos</h2><button class="btn btn-primary" onclick="openProjetoModal()">+ Novo Projeto</button></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>Cliente</th><th>Valor</th><th>Início</th><th>Previsão</th><th>Status</th><th>Ações</th></tr></thead><tbody id="projetosBody"></tbody></table></div>`;
  const tbody=document.getElementById('projetosBody');
  tbody.innerHTML=projetos.length===0?'<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum projeto</td></tr>':
    projetos.map(p=>`<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.cliente||'-'}</td><td>${formatCurrency(p.valor||0)}</td><td>${formatDate(p.inicio)}</td><td>${formatDate(p.previsao)}</td><td><span class="badge ${p.status==='Concluído'?'badge-success':p.status==='Cancelado'?'badge-danger':'badge-info'}">${p.status}</span></td><td><button class="btn btn-sm btn-primary" onclick="editProjeto(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteProjeto(${p.id})">🗑️</button></td></tr>`).join('');
}

function openProjetoModal(proj) {
  const isEdit=!!proj;const cliOpts=(appData.clientes||[]).map(c=>`<option value="${c.nome}" ${proj&&proj.cliente===c.nome?'selected':''}>${c.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Projeto':'Novo Projeto';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Nome</label><input type="text" class="form-control" id="projNome" value="${proj?proj.nome:''}"></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="projCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="projValor" value="${proj?proj.valor||'':''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Início</label><input type="date" class="form-control" id="projInicio" value="${proj?proj.inicio:''}"></div><div class="form-group"><label>Previsão</label><input type="date" class="form-control" id="projPrev" value="${proj?proj.previsao:''}"></div></div>
    <div class="form-group"><label>Status</label><select class="form-control" id="projStatus"><option value="Em andamento" ${proj&&proj.status==='Em andamento'?'selected':''}>Em andamento</option><option value="Concluído" ${proj&&proj.status==='Concluído'?'selected':''}>Concluído</option><option value="Cancelado" ${proj&&proj.status==='Cancelado'?'selected':''}>Cancelado</option></select></div>
    <div class="form-group"><label>Descrição</label><textarea class="form-control" id="projDesc" rows="2">${proj?proj.descricao||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProjeto(${isEdit?proj.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveProjeto(id) {
  const obj={nome:document.getElementById('projNome').value,cliente:document.getElementById('projCli').value,valor:parseFloat(document.getElementById('projValor').value)||0,inicio:document.getElementById('projInicio').value,previsao:document.getElementById('projPrev').value,status:document.getElementById('projStatus').value,descricao:document.getElementById('projDesc').value};
  if(!appData.projetos)appData.projetos=[];
  if(id){const idx=appData.projetos.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.projetos[idx]=obj;}}else{obj.id=nextId(appData.projetos);appData.projetos.push(obj);}
  saveData();closeCadastroModal();renderProjetosPage();showToast(id?'Projeto atualizado!':'Projeto cadastrado!','success');
}

function editProjeto(id){const p=(appData.projetos||[]).find(x=>x.id===id);if(p)openProjetoModal(p);}
function deleteProjeto(id){if(!confirm('Excluir projeto?'))return;appData.projetos=(appData.projetos||[]).filter(p=>p.id!==id);saveData();renderProjetosPage();showToast('Projeto excluído!','success');}

// ============================================================
// PAGAMENTOS DE CLIENTES
// ============================================================
function renderPagClientesPage() {
  const pg=document.getElementById('page-pagclientes');const pags=appData.pagClientes||[];
  pg.innerHTML=`<div class="page-header"><h2>🤝 Pag. Clientes</h2><button class="btn btn-primary" onclick="openPagClienteModal()">+ Novo Pagamento</button></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Cliente</th><th>Valor</th><th>Data</th><th>Pgto</th><th>Referência</th><th>Ações</th></tr></thead><tbody id="pagClientesBody"></tbody></table></div>`;
  const tbody=document.getElementById('pagClientesBody');
  tbody.innerHTML=pags.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum pagamento</td></tr>':
    pags.map(p=>`<tr><td>${p.id}</td><td>${p.cliente}</td><td>${formatCurrency(p.valor)}</td><td>${formatDate(p.data)}</td><td>${p.formaPagamento||'-'}</td><td>${p.referencia||'-'}</td><td><button class="btn btn-sm btn-primary" onclick="editPagCliente(${p.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deletePagCliente(${p.id})">🗑️</button></td></tr>`).join('');
}

function openPagClienteModal(pag) {
  const isEdit=!!pag;const cliOpts=(appData.clientes||[]).map(c=>`<option value="${c.nome}" ${pag&&pag.cliente===c.nome?'selected':''}>${c.nome}</option>`).join('');const pgtoOpts=(appData.formasPagamento||[]).map(f=>`<option value="${f}" ${pag&&pag.formaPagamento===f?'selected':''}>${f}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Pagamento':'Novo Pagamento';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="pcCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pcValor" value="${pag?pag.valor:''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="pcData" value="${pag?pag.data:new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Pgto</label><select class="form-control" id="pcPgto">${pgtoOpts}</select></div></div>
    <div class="form-group"><label>Referência</label><input type="text" class="form-control" id="pcRef" value="${pag?pag.referencia||'':''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pcObs" rows="2">${pag?pag.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePagCliente(${isEdit?pag.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePagCliente(id) {
  const obj={cliente:document.getElementById('pcCli').value,valor:parseFloat(document.getElementById('pcValor').value)||0,data:document.getElementById('pcData').value,formaPagamento:document.getElementById('pcPgto').value,referencia:document.getElementById('pcRef').value,obs:document.getElementById('pcObs').value};
  if(!appData.pagClientes)appData.pagClientes=[];
  if(id){const idx=appData.pagClientes.findIndex(p=>p.id===id);if(idx>-1){obj.id=id;appData.pagClientes[idx]=obj;}}else{obj.id=nextId(appData.pagClientes);appData.pagClientes.push(obj);}
  saveData();closeCadastroModal();renderPagClientesPage();showToast(id?'Pagamento atualizado!':'Pagamento cadastrado!','success');
}

function editPagCliente(id){const p=(appData.pagClientes||[]).find(x=>x.id===id);if(p)openPagClienteModal(p);}
function deletePagCliente(id){if(!confirm('Excluir pagamento?'))return;appData.pagClientes=(appData.pagClientes||[]).filter(p=>p.id!==id);saveData();renderPagClientesPage();showToast('Pagamento excluído!','success');}

// ============================================================
// GARANTIAS
// ============================================================
function renderGarantiasPage() {
  const pg=document.getElementById('page-garantias');const garantias=appData.garantias||[];
  pg.innerHTML=`<div class="page-header"><h2>🛡️ Garantias</h2><button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterGarantias(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Produto</th><th>Cliente</th><th>Início</th><th>Fim</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="garantiasBody"></tbody></table></div>`;
  renderGarantiasTable(garantias);
}

function renderGarantiasTable(garantias) {
  const tbody=document.getElementById('garantiasBody');if(!tbody)return;
  tbody.innerHTML=garantias.length===0?'<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>':
    garantias.map(g=>`<tr><td>${g.id}</td><td>${g.produto}</td><td>${g.cliente||'-'}</td><td>${formatDate(g.inicio)}</td><td>${formatDate(g.fim)}</td><td><span class="badge ${g.situacao==='Ativa'?'badge-success':g.situacao==='Expirada'?'badge-danger':'badge-warning'}">${g.situacao}</span></td><td><button class="btn btn-sm btn-primary" onclick="editGarantia(${g.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteGarantia(${g.id})">🗑️</button></td></tr>`).join('');
}

function filterGarantias(q){q=q.toLowerCase();renderGarantiasTable((appData.garantias||[]).filter(g=>g.produto.toLowerCase().includes(q)||(g.cliente||'').toLowerCase().includes(q)));}

function openGarantiaModal(gar) {
  const isEdit=!!gar;const cliOpts=(appData.clientes||[]).map(c=>`<option value="${c.nome}" ${gar&&gar.cliente===c.nome?'selected':''}>${c.nome}</option>`).join('');const sitOpts=(appData.situacaoGarantia||[]).map(s=>`<option value="${s}" ${gar&&gar.situacao===s?'selected':''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Garantia':'Nova Garantia';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-group"><label>Produto</label><input type="text" class="form-control" id="garProd" value="${gar?gar.produto:''}"></div>
    <div class="form-group"><label>Cliente</label><select class="form-control" id="garCli"><option value="">Selecione...</option>${cliOpts}</select></div>
    <div class="form-row"><div class="form-group"><label>Início</label><input type="date" class="form-control" id="garInicio" value="${gar?gar.inicio:''}"></div><div class="form-group"><label>Fim</label><input type="date" class="form-control" id="garFim" value="${gar?gar.fim:''}"></div></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="garSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="garObs" rows="2">${gar?gar.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGarantia(${isEdit?gar.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveGarantia(id) {
  const obj={produto:document.getElementById('garProd').value,cliente:document.getElementById('garCli').value,inicio:document.getElementById('garInicio').value,fim:document.getElementById('garFim').value,situacao:document.getElementById('garSit').value,obs:document.getElementById('garObs').value};
  if(!appData.garantias)appData.garantias=[];
  if(id){const idx=appData.garantias.findIndex(g=>g.id===id);if(idx>-1){obj.id=id;appData.garantias[idx]=obj;}}else{obj.id=nextId(appData.garantias);appData.garantias.push(obj);}
  saveData();closeCadastroModal();renderGarantiasPage();showToast(id?'Garantia atualizada!':'Garantia cadastrada!','success');
}

function editGarantia(id){const g=(appData.garantias||[]).find(x=>x.id===id);if(g)openGarantiaModal(g);}
function deleteGarantia(id){if(!confirm('Excluir garantia?'))return;appData.garantias=(appData.garantias||[]).filter(g=>g.id!==id);saveData();renderGarantiasPage();showToast('Garantia excluída!','success');}

// ============================================================
// RELATÓRIOS
// ============================================================
function renderRelatoriosPage() {
  const pg=document.getElementById('page-relatorios');
  const compras=appData.compras||[];const vendas=appData.vendas||[];
  const totalC=compras.reduce((s,c)=>s+(c.quantidade*c.valorUnit),0);
  const totalV=vendas.reduce((s,v)=>s+(v.quantidade*v.valorUnit),0);
  const lucro=totalV-totalC;

  const porVend={};vendas.forEach(v=>{if(!porVend[v.vendedor])porVend[v.vendedor]=0;porVend[v.vendedor]+=v.quantidade*v.valorUnit;});
  const porForn={};compras.forEach(c=>{if(!porForn[c.fornecedor])porForn[c.fornecedor]=0;porForn[c.fornecedor]+=c.quantidade*c.valorUnit;});
  const topForn=Object.entries(porForn).sort((a,b)=>b[1]-a[1]).slice(0,5);

  pg.innerHTML=`<div class="page-header"><h2>📈 Relatórios</h2></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">${formatCurrency(totalC)}</div></div>
      <div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">${formatCurrency(totalV)}</div></div>
      <div class="card"><div class="card-header"><span>Lucro Bruto</span></div><div class="card-value ${lucro>=0?'text-success':'text-danger'}">${formatCurrency(lucro)}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="card"><div class="section-title">Vendas por Vendedor</div>${Object.entries(porVend).map(([v,t])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color)"><span>${v}</span><strong>${formatCurrency(t)}</strong></div>`).join('')||'<p style="color:var(--text-muted)">Sem dados</p>'}</div>
      <div class="card"><div class="section-title">Top 5 Fornecedores</div>${topForn.map(([f,t])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color)"><span>${f}</span><strong>${formatCurrency(t)}</strong></div>`).join('')||'<p style="color:var(--text-muted)">Sem dados</p>'}</div>
    </div>`;
}

// ============================================================
// NOTAS DE ENTRADA
// ============================================================
function renderNotasEntradaPage() {
  const pg=document.getElementById('page-notasentrada');const notas=appData.notasEntrada||[];
  pg.innerHTML=`<div class="page-header"><h2>📥 Notas de Entrada</h2><button class="btn btn-primary" onclick="openNotaEntradaModal()">+ Nova Nota</button></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nº Nota</th><th>Fornecedor</th><th>Data</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="notasEntradaBody"></tbody></table></div>`;
  const tbody=document.getElementById('notasEntradaBody');
  tbody.innerHTML=notas.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>':
    notas.map(n=>`<tr><td>${n.id}</td><td>${n.numero||'-'}</td><td>${n.fornecedor||'-'}</td><td>${formatDate(n.data)}</td><td>${formatCurrency(n.valor||0)}</td><td><button class="btn btn-sm btn-primary" onclick="editNotaEntrada(${n.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada(${n.id})">🗑️</button></td></tr>`).join('');
}

function openNotaEntradaModal(nota) {
  const isEdit=!!nota;const fornOpts=(appData.fornecedores||[]).map(f=>`<option value="${f.nome}" ${nota&&nota.fornecedor===f.nome?'selected':''}>${f.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota Entrada':'Nova Nota Entrada';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="neNum" value="${nota?nota.numero||'':''}"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="neData" value="${nota?nota.data:''}"></div></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="neForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="neValor" value="${nota?nota.valor||'':''}" step="0.01"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="neObs" rows="2">${nota?nota.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaEntrada(${isEdit?nota.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveNotaEntrada(id) {
  const obj={numero:document.getElementById('neNum').value,data:document.getElementById('neData').value,fornecedor:document.getElementById('neForn').value,valor:parseFloat(document.getElementById('neValor').value)||0,obs:document.getElementById('neObs').value};
  if(!appData.notasEntrada)appData.notasEntrada=[];
  if(id){const idx=appData.notasEntrada.findIndex(n=>n.id===id);if(idx>-1){obj.id=id;appData.notasEntrada[idx]=obj;}}else{obj.id=nextId(appData.notasEntrada);appData.notasEntrada.push(obj);}
  saveData();closeCadastroModal();renderNotasEntradaPage();showToast(id?'Nota atualizada!':'Nota cadastrada!','success');
}

function editNotaEntrada(id){const n=(appData.notasEntrada||[]).find(x=>x.id===id);if(n)openNotaEntradaModal(n);}
function deleteNotaEntrada(id){if(!confirm('Excluir nota?'))return;appData.notasEntrada=(appData.notasEntrada||[]).filter(n=>n.id!==id);saveData();renderNotasEntradaPage();showToast('Nota excluída!','success');}

// ============================================================
// NOTAS DE SAÍDA
// ============================================================
function renderNotasSaidaPage() {
  const pg=document.getElementById('page-notassaida');const notas=appData.notasSaida||[];
  pg.innerHTML=`<div class="page-header"><h2>📤 Notas de Saída</h2><button class="btn btn-primary" onclick="openNotaSaidaModal()">+ Nova Nota</button></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Nº Nota</th><th>Cliente</th><th>Data</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="notasSaidaBody"></tbody></table></div>`;
  const tbody=document.getElementById('notasSaidaBody');
  tbody.innerHTML=notas.length===0?'<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>':
    notas.map(n=>`<tr><td>${n.id}</td><td>${n.numero||'-'}</td><td>${n.cliente||'-'}</td><td>${formatDate(n.data)}</td><td>${formatCurrency(n.valor||0)}</td><td><button class="btn btn-sm btn-primary" onclick="editNotaSaida(${n.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteNotaSaida(${n.id})">🗑️</button></td></tr>`).join('');
}

function openNotaSaidaModal(nota) {
  const isEdit=!!nota;const cliOpts=(appData.clientes||[]).map(c=>`<option value="${c.nome}" ${nota&&nota.cliente===c.nome?'selected':''}>${c.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota Saída':'Nova Nota Saída';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="nsNum" value="${nota?nota.numero||'':''}"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="nsData" value="${nota?nota.data:''}"></div></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="nsCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="nsValor" value="${nota?nota.valor||'':''}" step="0.01"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="nsObs" rows="2">${nota?nota.obs||'':''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaSaida(${isEdit?nota.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveNotaSaida(id) {
  const obj={numero:document.getElementById('nsNum').value,data:document.getElementById('nsData').value,cliente:document.getElementById('nsCli').value,valor:parseFloat(document.getElementById('nsValor').value)||0,obs:document.getElementById('nsObs').value};
  if(!appData.notasSaida)appData.notasSaida=[];
  if(id){const idx=appData.notasSaida.findIndex(n=>n.id===id);if(idx>-1){obj.id=id;appData.notasSaida[idx]=obj;}}else{obj.id=nextId(appData.notasSaida);appData.notasSaida.push(obj);}
  saveData();closeCadastroModal();renderNotasSaidaPage();showToast(id?'Nota atualizada!':'Nota cadastrada!','success');
}

function editNotaSaida(id){const n=(appData.notasSaida||[]).find(x=>x.id===id);if(n)openNotaSaidaModal(n);}
function deleteNotaSaida(id){if(!confirm('Excluir nota?'))return;appData.notasSaida=(appData.notasSaida||[]).filter(n=>n.id!==id);saveData();renderNotasSaidaPage();showToast('Nota excluída!','success');}

// ============================================================
// RECEITAS MEI
// ============================================================
function renderReceitasMeiPage() {
  const pg=document.getElementById('page-receitasmei');const receitas=appData.receitasMei||[];
  const totalAnual=receitas.reduce((s,r)=>s+(r.valor||0),0);const limite=81000;
  pg.innerHTML=`<div class="page-header"><h2>📄 Receitas MEI</h2><button class="btn btn-primary" onclick="openReceitaMeiModal()">+ Nova Receita</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Faturamento Anual</span></div><div class="card-value">${formatCurrency(totalAnual)}</div></div>
      <div class="card"><div class="card-header"><span>Limite MEI</span></div><div class="card-value">${formatCurrency(limite)}</div></div>
      <div class="card"><div class="card-header"><span>Disponível</span></div><div class="card-value ${(limite-totalAnual)>=0?'text-success':'text-danger'}">${formatCurrency(limite-totalAnual)}</div></div>
      <div class="card"><div class="card-header"><span>% Utilizado</span></div><div class="card-value">${((totalAnual/limite)*100).toFixed(1)}%</div><div class="progress-bar" style="margin-top:8px"><div class="progress-fill" style="width:${Math.min((totalAnual/limite)*100,100)}%"></div></div></div>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Mês</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="receitasMeiBody"></tbody></table></div>`;
  const tbody=document.getElementById('receitasMeiBody');
  tbody.innerHTML=receitas.length===0?'<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma receita</td></tr>':
    receitas.map(r=>`<tr><td>${r.id}</td><td>${r.mes||'-'}</td><td>${r.descricao||'-'}</td><td>${formatCurrency(r.valor||0)}</td><td><button class="btn btn-sm btn-primary" onclick="editReceitaMei(${r.id})">✏️</button><button class="btn btn-sm btn-danger" onclick="deleteReceitaMei(${r.id})">🗑️</button></td></tr>`).join('');
}

function openReceitaMeiModal(rec) {
  const isEdit=!!rec;const meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const mesOpts=meses.map(m=>`<option value="${m}" ${rec&&rec.mes===m?'selected':''}>${m}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Receita':'Nova Receita MEI';
  document.getElementById('cadastroModalBody').innerHTML=`
    <div class="form-row"><div class="form-group"><label>Mês</label><select class="form-control" id="rmMes">${mesOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="rmValor" value="${rec?rec.valor||'':''}" step="0.01"></div></div>
    <div class="form-group"><label>Descrição</label><input type="text" class="form-control" id="rmDesc" value="${rec?rec.descricao||'':''}"></div>`;
  document.getElementById('cadastroModalFooter').innerHTML=`<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveReceitaMei(${isEdit?rec.id:'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveReceitaMei(id) {
  const obj={mes:document.getElementById('rmMes').value,valor:parseFloat(document.getElementById('rmValor').value)||0,descricao:document.getElementById('rmDesc').value};
  if(!appData.receitasMei)appData.receitasMei=[];
  if(id){const idx=appData.receitasMei.findIndex(r=>r.id===id);if(idx>-1){obj.id=id;appData.receitasMei[idx]=obj;}}else{obj.id=nextId(appData.receitasMei);appData.receitasMei.push(obj);}
  saveData();closeCadastroModal();renderReceitasMeiPage();showToast(id?'Receita atualizada!':'Receita cadastrada!','success');
}

function editReceitaMei(id){const r=(appData.receitasMei||[]).find(x=>x.id===id);if(r)openReceitaMeiModal(r);}
function deleteReceitaMei(id){if(!confirm('Excluir receita?'))return;appData.receitasMei=(appData.receitasMei||[]).filter(r=>r.id!==id);saveData();renderReceitasMeiPage();showToast('Receita excluída!','success');}

// ============================================================
// CONFIGURAÇÕES
// ============================================================
function renderConfiguracoesPage() {
  const pg=document.getElementById('page-configuracoes');const cats=appData.categoriasFluxo||[];
  pg.innerHTML=`
    <div class="page-header"><h2>⚙️ Configurações</h2></div>

    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Empresa</div>
      <div class="form-row"><div class="form-group"><label>Nome</label><input type="text" class="form-control" id="cfgNome" value="${appData.empresa.nome}"></div><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="${appData.empresa.cnpj}"></div></div>
      <div class="form-group"><label>Logo (URL)</label><input type="text" class="form-control" id="cfgLogo" value="${appData.empresa.logo||''}"></div>
      <button class="btn btn-primary" onclick="saveConfigEmpresa()">Salvar Empresa</button>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Vendedores</div>
      <div id="cfgVendList">${(appData.vendedores||[]).map((v,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><input type="text" class="form-control" value="${v}" onchange="appData.vendedores[${i}]=this.value" style="flex:1"><button class="btn btn-sm btn-danger" onclick="appData.vendedores.splice(${i},1);renderConfiguracoesPage()">🗑️</button></div>`).join('')}</div>
      <button class="btn btn-sm btn-secondary" onclick="appData.vendedores.push('');renderConfiguracoesPage()">+ Adicionar</button>
      <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="saveData();showToast('Vendedores salvos!','success')">Salvar</button>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Formas de Pagamento</div>
      <div id="cfgPgtoList">${(appData.formasPagamento||[]).map((f,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><input type="text" class="form-control" value="${f}" onchange="appData.formasPagamento[${i}]=this.value" style="flex:1"><button class="btn btn-sm btn-danger" onclick="appData.formasPagamento.splice(${i},1);renderConfiguracoesPage()">🗑️</button></div>`).join('')}</div>
      <button class="btn btn-sm btn-secondary" onclick="appData.formasPagamento.push('');renderConfiguracoesPage()">+ Adicionar</button>
      <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="saveData();showToast('Formas salvas!','success')">Salvar</button>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Categorias de Fluxo de Caixa</div>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px">Cada categoria é do tipo <strong style="color:var(--success)">Entrada</strong> ou <strong style="color:var(--danger)">Saída</strong>.</p>
      <div id="cfgCatList">${cats.map((c,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><input type="text" class="form-control" value="${c.nome}" onchange="appData.categoriasFluxo[${i}].nome=this.value" style="flex:1"><select class="form-control" style="width:120px" onchange="appData.categoriasFluxo[${i}].tipo=this.value"><option value="entrada" ${c.tipo==='entrada'?'selected':''}>Entrada</option><option value="saida" ${c.tipo==='saida'?'selected':''}>Saída</option></select><button class="btn btn-sm btn-danger" onclick="appData.categoriasFluxo.splice(${i},1);renderConfiguracoesPage()">🗑️</button></div>`).join('')}</div>
      <button class="btn btn-sm btn-secondary" onclick="if(!appData.categoriasFluxo)appData.categoriasFluxo=[];appData.categoriasFluxo.push({nome:'',tipo:'entrada'});renderConfiguracoesPage()">+ Adicionar Categoria</button>
      <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="appData.categoriasFluxo=(appData.categoriasFluxo||[]).filter(c=>c.nome.trim()!=='');saveData();showToast('Categorias salvas!','success');renderConfiguracoesPage()">Salvar</button>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Tipos de Unidade</div>
      <div id="cfgUnidList">${(appData.tipoUnidade||[]).map((u,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><input type="text" class="form-control" value="${u}" onchange="appData.tipoUnidade[${i}]=this.value" style="flex:1"><button class="btn btn-sm btn-danger" onclick="appData.tipoUnidade.splice(${i},1);renderConfiguracoesPage()">🗑️</button></div>`).join('')}</div>
      <button class="btn btn-sm btn-secondary" onclick="appData.tipoUnidade.push('');renderConfiguracoesPage()">+ Adicionar</button>
      <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="saveData();showToast('Unidades salvas!','success')">Salvar</button>
    </div>`;
}

function saveConfigEmpresa() {
  appData.empresa.nome=document.getElementById('cfgNome').value;
  appData.empresa.cnpj=document.getElementById('cfgCnpj').value;
  appData.empresa.logo=document.getElementById('cfgLogo').value;
  saveData();
  document.querySelector('.sidebar-header h1').textContent=appData.empresa.nome.toUpperCase();
  document.querySelector('.sidebar-header p').textContent='CNPJ: '+appData.empresa.cnpj;
  if(appData.empresa.logo){const el=document.getElementById('sidebarLogo');el.src=appData.empresa.logo;el.style.display='block';}
  showToast('Empresa atualizada!','success');
}

function checkSupabase() {
  var el = document.getElementById('supabaseStatus');
  if (!el) return;
  if (supabaseClient) {
    supabaseClient.from('wdmaquinas_data').select('id').eq('id', 1).single().then(function(res) {
      if (res.error) {
        el.innerHTML = '<span style="color:var(--danger)">✖ Erro: ' + res.error.message + '</span>';
      } else {
        el.innerHTML = '<span style="color:var(--success)">✔ Conectado ao Supabase</span>';
      }
    }).catch(function(e) {
      el.innerHTML = '<span style="color:var(--danger)">✖ Erro: ' + e.message + '</span>';
    });
  } else {
    el.innerHTML = '<span style="color:var(--warning)">⚠ Supabase não configurado</span>';
  }
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
    var res = await supabaseClient.from('wdmaquinas_data').select('*').eq('id', 1).single();
    if (res.data && res.data.payload) {
      appData = typeof res.data.payload === 'string' ? JSON.parse(res.data.payload) : res.data.payload;
      ensureDefaults();
      saveData();
      showToast('Download realizado! Dados atualizados.', 'success');
      renderDashboard();
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
  a.download = 'wdmaquinas_backup_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exportado!', 'success');
}

function importBackup(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var imported = JSON.parse(e.target.result);
      appData = imported;
      ensureDefaults();
      saveData();
      showToast('Backup importado com sucesso!', 'success');
      renderDashboard();
    } catch (err) {
      showToast('Erro ao importar: arquivo inválido', 'error');
    }
  };
  reader.readAsText(file);
}

function excluirTodosDados() {
  if (!confirm('⚠ ATENÇÃO: Isso vai excluir TODOS os dados do sistema.\n\nTem certeza?')) return;
  if (!confirm('ÚLTIMA CHANCE: Realmente deseja apagar tudo?')) return;
  appData = getDefaultData();
  saveData();
  showToast('Todos os dados foram excluídos!', 'success');
  renderBackupPage();
  renderDashboard();
}

// ============================================================
// BACKUP
// ============================================================
function renderBackupPage() {
  var pg = document.getElementById('page-backup');
  pg.innerHTML = '<div class="page-header"><h2>💾 Backup</h2></div>' +
    '<div class="card" style="margin-bottom:16px"><div class="section-title">Supabase</div>' +
    '<p style="margin-bottom:8px;color:var(--text-secondary)">Dados sincronizados automaticamente.</p>' +
    '<div id="supabaseStatus" style="margin-bottom:12px"></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<button class="btn btn-primary" onclick="forceUpload()">⬆ Forçar Upload</button>' +
    '<button class="btn btn-secondary" onclick="forceDownload()">⬇ Forçar Download</button>' +
    '</div></div>' +
    '<div class="card" style="margin-bottom:16px"><div class="section-title">Backup Local (JSON)</div>' +
    '<p style="margin-bottom:12px;color:var(--text-secondary)">Exporte ou importe seus dados.</p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<button class="btn btn-primary" onclick="exportBackup()">📥 Exportar Backup</button>' +
    '<button class="btn btn-secondary" onclick="document.getElementById(\'importFile\').click()">📤 Importar Backup</button>' +
    '<input type="file" id="importFile" accept=".json" style="display:none" onchange="importBackup(event)">' +
    '</div></div>' +
    '<div class="card" style="border-color:var(--danger)"><div class="section-title" style="color:var(--danger)">⚠ Zona Perigosa</div>' +
    '<p style="margin-bottom:12px;color:var(--text-secondary)">Excluir TODOS os dados. Ação irreversível.</p>' +
    '<button class="btn btn-danger" onclick="excluirTodosDados()">🗑️ Excluir Todos os Dados</button>' +
    '</div>';
  checkSupabase();
}

function excluirTodosDados() {
  if (!confirm('⚠ ATENÇÃO: Isso vai excluir TODOS os dados do sistema (compras, vendas, clientes, fornecedores, fluxo de caixa, etc.).\n\nTem certeza?')) return;
  if (!confirm('ÚLTIMA CHANCE: Realmente deseja apagar tudo? Esta ação NÃO pode ser desfeita!')) return;
  appData = getDefaultData();
  saveData();
  showToast('Todos os dados foram excluídos!', 'success');
  renderBackupPage();
  renderDashboard();
}

function excluirTodosDados() {
  if (!confirm('⚠ ATENÇÃO: Isso vai excluir TODOS os dados do sistema (compras, vendas, clientes, fornecedores, fluxo de caixa, etc.).\n\nTem certeza?')) return;
  if (!confirm('ÚLTIMA CHANCE: Realmente deseja apagar tudo? Esta ação NÃO pode ser desfeita!')) return;

  appData = getDefaultData();
  saveData();
  showToast('Todos os dados foram excluídos!', 'success');
  renderBackupPage();
  renderDashboard();
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function init() {
  // Data atual no topbar
  const now=new Date();
  document.getElementById('currentDate').textContent=now.toLocaleDateString('pt-BR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  // Inicializar Supabase
  try {
    if(window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Supabase client inicializado');
    }
  } catch(e) { console.warn('Supabase init falhou:', e.message); }

  // Carregar dados
  await loadData();

  // Atualizar sidebar
  if(appData.empresa) {
    document.querySelector('.sidebar-header h1').textContent=appData.empresa.nome.toUpperCase();
    document.querySelector('.sidebar-header p').textContent='CNPJ: '+appData.empresa.cnpj;
    if(appData.empresa.logo){const el=document.getElementById('sidebarLogo');el.src=appData.empresa.logo;el.style.display='block';}
  }

  // Renderizar dashboard
  renderDashboard();
}

// Start
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
