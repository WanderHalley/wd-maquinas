// ╔══════════════════════════════════════════════════════════════╗
// ║  WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026              ║
// ║  script.js — CÓDIGO COMPLETO CORRIGIDO v5                  ║
// ╚══════════════════════════════════════════════════════════════╝

// ── SCR-CFG-01 — CONFIGURAÇÃO GLOBAL ──
const SUPABASE_URL = 'https://iwbsmsadctvndhrcjkbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GQpRJ7CFZOFrdmYfsN8rcA_ucfNR2AM';
let supabaseClient = null;
let appData = {};

let comprasEditMode = false;
let vendasEditMode = false;
let comprasSearchQuery = '';
let comprasFilterSit = '';
let comprasFilterPgto = '';
let vendasSearchQuery = '';
let vendasFilterSit = '';

// ── SCR-UTL-01 — HELPERS DE FORMATO ──
function nextId(arr) {
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(i => i.id || 0)) + 1;
}
function formatCurrency(val) {
  return 'R$ ' + (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(d) {
  if (!d) return '-';
  const parts = d.split('-');
  if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
  return d;
}

// ── SCR-UTL-02 — MÁSCARAS AUTOMÁTICAS ──
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
    applyMask('gen_cpfCnpj', maskCPFouCNPJ);
    applyMask('gen_telefone', maskTelefone);
    applyMask('gen_celular', maskTelefone);
  }, 100);
}

// ── SCR-DAT-01 — DADOS PADRÃO ──
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
    clientes: [], fornecedores: [], produtos: [], pFornecedores: [],
    compras: [], vendas: [], estoque: [],
    boletos: [], cheques: [], prestacoes: [], projetos: [],
    pagClientes: [], garantias: [],
    notasEntrada: [], notasSaida: [], receitasMei: [],
    fluxoCaixa: {}
  };
}

// ── SCR-DAT-02 — LOAD / SAVE / ENSURE DEFAULTS ──
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
    if (local) {
      appData = JSON.parse(local);
      ensureDefaults();
      console.log('Dados carregados do localStorage');
      return;
    }
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

// ── SCR-UI-01 — TOAST + MODAL HELPERS ──
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || 'success');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
function openCadastroModal() { document.getElementById('cadastroModal').style.display = 'flex'; }
function closeCadastroModal() { document.getElementById('cadastroModal').style.display = 'none'; }
function openViewModal() { document.getElementById('viewModal').style.display = 'flex'; }
function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }

// ── SCR-UI-02 — SIDEBAR TOGGLE / COLLAPSE / INFO ──
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  syncExpandBtn();
}
function collapseSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  syncExpandBtn();
}
function syncExpandBtn() {
  const sb = document.getElementById('sidebar');
  const expandBtn = document.getElementById('expandBtn');
  const arrow = document.getElementById('collapseArrow');
  const isCollapsed = sb.classList.contains('collapsed');
  if (expandBtn) expandBtn.style.display = isCollapsed ? 'inline-flex' : 'none';
  if (arrow) arrow.textContent = isCollapsed ? '»' : '«';
}
function updateSidebarInfo() {
  const nameEl = document.getElementById('sidebarNome');
  const cnpjEl = document.getElementById('sidebarCnpj');
  if (nameEl && appData.empresa) nameEl.textContent = appData.empresa.nome || 'WD Máquinas';
  if (cnpjEl && appData.empresa) cnpjEl.textContent = 'CNPJ: ' + (appData.empresa.cnpj || '');
  const logoEl = document.getElementById('sidebarLogo');
  if (logoEl && appData.empresa && appData.empresa.logo) {
    logoEl.src = appData.empresa.logo;
    logoEl.style.display = 'block';
  }
}

// ── SCR-NAV-01 — NAVEGAÇÃO ENTRE PÁGINAS ──
const pageTitles = {
  'dashboard':'Dashboard','janeiro':'Janeiro','fevereiro':'Fevereiro','marco':'Março','abril':'Abril','maio':'Maio','junho':'Junho','julho':'Julho','agosto':'Agosto','setembro':'Setembro','outubro':'Outubro','novembro':'Novembro','dezembro':'Dezembro',
  'compras':'Compras','vendas':'Vendas','estoque':'Estoque','produtos':'Produtos','clientes':'Clientes','fornecedores':'Fornecedores','pfornecedores':'P. Fornecedores',
  'boletos':'Boletos','cheques':'Cheques','prestacoes':'Prestações','projetos':'Projetos','pagclientes':'Pag. Clientes','garantias':'Garantias',
  'relatorios':'Relatórios','notasentrada':'Notas Entrada','notassaida':'Notas Saída','receitasmei':'Receitas MEI',
  'configuracoes':'Configurações','backup':'Backup'
};

function navigateTo(page) {
  document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
  const el = document.getElementById('page-' + page);
  if (el) el.style.display = 'block';
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = pageTitles[page] || page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector('.nav-item[onclick*="' + page + '"]');
  if (navItem) navItem.classList.add('active');
  document.getElementById('sidebar').classList.remove('active');

  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const mesIdx = meses.indexOf(page);

  if (page === 'dashboard') renderDashboard();
  else if (mesIdx > -1) renderFluxoMes(mesIdx);
  else if (page === 'compras') renderComprasPage();
  else if (page === 'vendas') renderVendasPage();
  else if (page === 'estoque') renderEstoquePage();
  else if (page === 'produtos') renderProdutosPage();
  else if (page === 'clientes') renderClientesPage();
  else if (page === 'fornecedores') renderFornecedoresPage();
  else if (page === 'pfornecedores') renderPFornecedoresPage();
  else if (page === 'boletos') renderBoletosPage();
  else if (page === 'cheques') renderChequesPage();
  else if (page === 'prestacoes') renderPrestacoesPage();
  else if (page === 'projetos') renderProjetosPage();
  else if (page === 'pagclientes') renderPagClientesPage();
  else if (page === 'garantias') renderGarantiasPage();
  else if (page === 'relatorios') renderRelatoriosPage();
  else if (page === 'notasentrada') renderNotasEntradaPage();
  else if (page === 'notassaida') renderNotasSaidaPage();
  else if (page === 'receitasmei') renderReceitasMeiPage();
  else if (page === 'configuracoes') renderConfiguracoesPage();
  else if (page === 'backup') renderBackupPage();
}

// ── SCR-DSH-01 — DASHBOARD ──
function renderDashboard() {
  const pg = document.getElementById('page-dashboard');
  if (!pg) return;

  const compras = appData.compras || [];
  const vendas = appData.vendas || [];
  const boletos = appData.boletos || [];

  const totalCompras = compras.reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const totalVendas = vendas.reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const lucro = totalVendas - totalCompras;

  const comprasPendentes = compras.filter(c => c.situacao !== 'Pago').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const vendasPendentes = vendas.filter(v => v.situacao !== 'Pago').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const boletosPendentes = boletos.filter(b => b.situacao !== 'Pago').reduce((s, b) => s + (b.valor || 0), 0);
  const entregasPendentes = vendas.filter(v => v.entrega === 'Pendente' || v.entrega === 'Não Entregue').length;

  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const mesesLabel = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  let salarioMensalRows = '';
  let salarioAnualTotal = 0, salarioAnualWander = 0, salarioAnualDaniel = 0;

  meses.forEach((m, i) => {
    const lancamentos = (appData.fluxoCaixa && appData.fluxoCaixa[m]) ? appData.fluxoCaixa[m] : [];
    const salarioLancs = lancamentos.filter(l => (l.categoria || '').toLowerCase().includes('salário') || (l.categoria || '').toLowerCase().includes('salario'));
    const salarioTotal = salarioLancs.reduce((s, l) => s + (l.valor || 0), 0);
    const salarioWander = salarioLancs.filter(l => (l.descricao || '').toLowerCase().includes('wander')).reduce((s, l) => s + (l.valor || 0), 0);
    const salarioDaniel = salarioLancs.filter(l => (l.descricao || '').toLowerCase().includes('daniel')).reduce((s, l) => s + (l.valor || 0), 0);
    salarioAnualTotal += salarioTotal;
    salarioAnualWander += salarioWander;
    salarioAnualDaniel += salarioDaniel;
    if (salarioTotal > 0) {
      salarioMensalRows += '<tr><td>' + mesesLabel[i] + '</td><td>' + formatCurrency(salarioWander) + '</td><td>' + formatCurrency(salarioDaniel) + '</td><td>' + formatCurrency(salarioTotal) + '</td></tr>';
    }
  });

  let fluxoResumo = '';
  meses.forEach((m, i) => {
    const lancamentos = (appData.fluxoCaixa && appData.fluxoCaixa[m]) ? appData.fluxoCaixa[m] : [];
    const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + (l.valor || 0), 0);
    const saidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + (l.valor || 0), 0);
    const saldo = entradas - saidas;
    const cor = saldo >= 0 ? 'text-success' : 'text-danger';
    fluxoResumo += '<tr onclick="navigateTo(\'' + m + '\')" style="cursor:pointer"><td>' + mesesLabel[i] + '</td><td class="text-success">' + formatCurrency(entradas) + '</td><td class="text-danger">' + formatCurrency(saidas) + '</td><td class="' + cor + '">' + formatCurrency(saldo) + '</td></tr>';
  });

  const ultVendas = vendas.slice(-5).reverse();
  let vendasRows = '';
  if (ultVendas.length === 0) {
    vendasRows = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma venda</td></tr>';
  } else {
    ultVendas.forEach(v => {
      vendasRows += '<tr><td>' + formatDate(v.data) + '</td><td>' + (v.produto || '-') + '</td><td>' + formatCurrency((v.quantidade || 1) * (v.valorUnit || 0)) + '</td><td><span class="badge ' + (v.situacao === 'Pago' ? 'badge-success' : 'badge-danger') + '">' + (v.situacao || '-') + '</span></td></tr>';
    });
  }

  const ultCompras = compras.slice(-5).reverse();
  let comprasRows = '';
  if (ultCompras.length === 0) {
    comprasRows = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma compra</td></tr>';
  } else {
    ultCompras.forEach(c => {
      comprasRows += '<tr><td>' + formatDate(c.data) + '</td><td>' + (c.produto || '-') + '</td><td>' + formatCurrency((c.quantidade || 1) * (c.valorUnit || 0)) + '</td><td><span class="badge ' + (c.situacao === 'Pago' ? 'badge-success' : c.situacao === 'Devendo' ? 'badge-danger' : 'badge-warning') + '">' + (c.situacao || '-') + '</span></td></tr>';
    });
  }

  pg.innerHTML = `
    <div class="page-header"><h2>📊 Dashboard</h2></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">${formatCurrency(totalCompras)}</div><div class="card-sub">${compras.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">${formatCurrency(totalVendas)}</div><div class="card-sub">${vendas.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Lucro</span></div><div class="card-value ${lucro >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(lucro)}</div></div>
      <div class="card"><div class="card-header"><span>Compras Pendentes</span></div><div class="card-value text-warning">${formatCurrency(comprasPendentes)}</div></div>
      <div class="card"><div class="card-header"><span>Vendas Pendentes</span></div><div class="card-value text-warning">${formatCurrency(vendasPendentes)}</div></div>
      <div class="card"><div class="card-header"><span>Boletos Pendentes</span></div><div class="card-value text-warning">${formatCurrency(boletosPendentes)}</div></div>
      <div class="card"><div class="card-header"><span>Entregas Pendentes</span></div><div class="card-value text-info">${entregasPendentes}</div></div>
      <div class="card"><div class="card-header"><span>Estoque</span></div><div class="card-value">${(appData.estoque || []).length} itens</div></div>
    </div>
    <div class="dashboard-grid" style="margin-bottom:20px">
      <div class="card" style="border-left:3px solid var(--warning)"><div class="card-header"><span>💰 Salário Wander (Anual)</span></div><div class="card-value text-warning">${formatCurrency(salarioAnualWander)}</div></div>
      <div class="card" style="border-left:3px solid var(--info)"><div class="card-header"><span>💰 Salário Daniel (Anual)</span></div><div class="card-value text-info">${formatCurrency(salarioAnualDaniel)}</div></div>
      <div class="card" style="border-left:3px solid var(--danger)"><div class="card-header"><span>💸 Salário Pago Total (Anual)</span></div><div class="card-value text-danger">${formatCurrency(salarioAnualTotal)}</div><div class="card-sub" style="color:var(--text-muted);font-size:.7rem;margin-top:4px">Wander + Daniel — todos os meses</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div class="card" style="margin-bottom:16px"><div class="card-header"><span>Fluxo de Caixa Mensal</span></div>
          <div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>${fluxoResumo}</tbody></table></div>
        </div>
      </div>
      <div>
        ${salarioMensalRows ? '<div class="card" style="margin-bottom:16px"><div class="card-header"><span>💰 Salário por Mês</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Wander</th><th>Daniel</th><th>Pago Total</th></tr></thead><tbody>' + salarioMensalRows + '</tbody></table></div></div>' : ''}
        <div class="card" style="margin-bottom:16px"><div class="card-header"><span>Últimas Vendas</span></div>
          <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Valor</th><th>Situação</th></tr></thead><tbody>${vendasRows}</tbody></table></div>
        </div>
        <div class="card"><div class="card-header"><span>Últimas Compras</span></div>
          <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Valor</th><th>Situação</th></tr></thead><tbody>${comprasRows}</tbody></table></div>
        </div>
      </div>
    </div>`;
}

// ── SCR-FLX-01 — FLUXO DE CAIXA MENSAL ──
const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const mesesKeys = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

let fluxoFilterText = '';
let fluxoFilterTipo = '';

function renderFluxoMes(mesIdx) {
  const mesKey = mesesKeys[mesIdx];
  const mesNome = mesesNomes[mesIdx];
  const pg = document.getElementById('page-' + mesKey);
  if (!pg) return;

  if (!appData.fluxoCaixa) appData.fluxoCaixa = {};
  if (!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey] = [];

  const lancamentos = appData.fluxoCaixa[mesKey];

  let saldoAnterior = 0;
  for (let i = 0; i < mesIdx; i++) {
    const mk = mesesKeys[i];
    const lancs = (appData.fluxoCaixa[mk]) || [];
    lancs.forEach(l => {
      if (l.tipo === 'entrada') saldoAnterior += (l.valor || 0);
      else saldoAnterior -= (l.valor || 0);
    });
  }

  const totalEntradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + (l.valor || 0), 0);
  const totalSaidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + (l.valor || 0), 0);
  const saldoFinal = saldoAnterior + totalEntradas - totalSaidas;

  const dinheiroNotas = lancamentos.filter(l => l.categoria === 'Dinheiro em Notas').reduce((s, l) => s + (l.valor || 0), 0);

  const salarioLancs = lancamentos.filter(l => (l.categoria || '').toLowerCase().includes('salário') || (l.categoria || '').toLowerCase().includes('salario'));
  const salarioPagoTotal = salarioLancs.reduce((s, l) => s + (l.valor || 0), 0);
  const salarioWander = salarioLancs.filter(l => (l.descricao || '').toLowerCase().includes('wander')).reduce((s, l) => s + (l.valor || 0), 0);
  const salarioDaniel = salarioLancs.filter(l => (l.descricao || '').toLowerCase().includes('daniel')).reduce((s, l) => s + (l.valor || 0), 0);

  const catEntrada = (appData.categoriasFluxo || []).filter(c => c.tipo === 'entrada').map(c => '<option value="entrada:' + c.nome + '">' + c.nome + '</option>').join('');
  const catSaida = (appData.categoriasFluxo || []).filter(c => c.tipo === 'saida').map(c => '<option value="saida:' + c.nome + '">' + c.nome + '</option>').join('');

  pg.innerHTML = `
    <div class="page-header"><h2>📅 ${mesNome} 2026</h2><button class="btn btn-primary" onclick="openLancamentoModal(${mesIdx})">+ Novo Lançamento</button></div>
    <div class="dashboard-grid">
      <div class="card"><div class="card-header"><span>Saldo Anterior</span></div><div class="card-value ${saldoAnterior >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(saldoAnterior)}</div></div>
      <div class="card"><div class="card-header"><span>Entradas</span></div><div class="card-value text-success">${formatCurrency(totalEntradas)}</div></div>
      <div class="card"><div class="card-header"><span>Saídas</span></div><div class="card-value text-danger">${formatCurrency(totalSaidas)}</div></div>
      <div class="card card-accent"><div class="card-header"><span>Saldo Final</span></div><div class="card-value ${saldoFinal >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(saldoFinal)}</div></div>
      <div class="card"><div class="card-header"><span>Dinheiro em Notas</span></div><div class="card-value">${formatCurrency(dinheiroNotas)}</div></div>
      <div class="card" style="border-left:3px solid var(--danger);grid-column:span 2">
        <div class="card-header"><span>Salário Pago Total</span></div>
        <div class="card-value text-danger">${formatCurrency(salarioPagoTotal)}</div>
        <div style="display:flex;align-items:center;gap:24px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase">Wander:</span>
            <span style="font-size:1rem;font-weight:700;color:var(--warning)">${formatCurrency(salarioWander)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase">Daniel:</span>
            <span style="font-size:1rem;font-weight:700;color:var(--warning)">${formatCurrency(salarioDaniel)}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar lançamento..." oninput="fluxoFilterText=this.value.toLowerCase();renderFluxoTable(${mesIdx})">
      <select class="form-control" style="max-width:200px" onchange="fluxoFilterTipo=this.value;renderFluxoTable(${mesIdx})">
        <option value="">Todos os tipos</option>
        <optgroup label="Entradas">${catEntrada}</optgroup>
        <optgroup label="Saídas">${catSaida}</optgroup>
      </select>
      <div class="flux-toggle">
        <button class="btn btn-sm ${fluxoFilterTipo === '' ? 'btn-primary' : 'btn-outline'}" onclick="fluxoFilterTipo='';renderFluxoTable(${mesIdx})">Todos</button>
        <button class="btn btn-sm ${fluxoFilterTipo === 'entrada' ? 'btn-primary' : 'btn-outline'}" onclick="fluxoFilterTipo='entrada';renderFluxoTable(${mesIdx})">Entradas</button>
        <button class="btn btn-sm ${fluxoFilterTipo === 'saida' ? 'btn-primary' : 'btn-outline'}" onclick="fluxoFilterTipo='saida';renderFluxoTable(${mesIdx})">Saídas</button>
      </div>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Ações</th></tr></thead>
    <tbody id="fluxoBody"></tbody></table></div>`;

  fluxoFilterText = '';
  fluxoFilterTipo = '';
  renderFluxoTable(mesIdx);
}

// ── SCR-FLX-02 — FLUXO CRUD ──
function renderFluxoTable(mesIdx) {
  const mesKey = mesesKeys[mesIdx];
  const tbody = document.getElementById('fluxoBody');
  if (!tbody) return;
  let lancamentos = (appData.fluxoCaixa && appData.fluxoCaixa[mesKey]) ? [...appData.fluxoCaixa[mesKey]] : [];
  if (fluxoFilterText) {
    lancamentos = lancamentos.filter(l => (l.descricao || '').toLowerCase().includes(fluxoFilterText) || (l.categoria || '').toLowerCase().includes(fluxoFilterText));
  }
  if (fluxoFilterTipo) {
    if (fluxoFilterTipo === 'entrada' || fluxoFilterTipo === 'saida') {
      lancamentos = lancamentos.filter(l => l.tipo === fluxoFilterTipo);
    } else if (fluxoFilterTipo.includes(':')) {
      const parts = fluxoFilterTipo.split(':');
      lancamentos = lancamentos.filter(l => l.tipo === parts[0] && l.categoria === parts[1]);
    }
  }
  lancamentos.sort((a, b) => (a.data || '').localeCompare(b.data || ''));
  if (lancamentos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum lançamento</td></tr>';
    return;
  }
  tbody.innerHTML = lancamentos.map(l => {
    const isEntrada = l.tipo === 'entrada';
    return '<tr><td>' + formatDate(l.data) + '</td><td>' + (l.descricao || '-') + '</td><td>' + (l.categoria || '-') + '</td><td><span class="badge ' + (isEntrada ? 'badge-success' : 'badge-danger') + '">' + (isEntrada ? 'Entrada' : 'Saída') + '</span></td><td class="' + (isEntrada ? 'text-success' : 'text-danger') + '">' + formatCurrency(l.valor) + '</td><td><button class="btn btn-sm btn-primary" onclick="editLancamento(' + mesIdx + ',' + l.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteLancamento(' + mesIdx + ',' + l.id + ')">🗑️</button></td></tr>';
  }).join('');
}

function openLancamentoModal(mesIdx, lanc) {
  const isEdit = !!lanc;
  const cats = appData.categoriasFluxo || [];
  const catEntradaOpts = cats.filter(c => c.tipo === 'entrada').map(c => '<option value="' + c.nome + '"' + (lanc && lanc.categoria === c.nome ? ' selected' : '') + '>' + c.nome + '</option>').join('');
  const catSaidaOpts = cats.filter(c => c.tipo === 'saida').map(c => '<option value="' + c.nome + '"' + (lanc && lanc.categoria === c.nome ? ' selected' : '') + '>' + c.nome + '</option>').join('');
  const tipoEntradaSel = (!lanc || lanc.tipo === 'entrada') ? 'selected' : '';
  const tipoSaidaSel = (lanc && lanc.tipo === 'saida') ? 'selected' : '';

  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Lançamento' : 'Novo Lançamento — ' + mesesNomes[mesIdx];
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Data</label><input type="date" class="form-control" id="flxData" value="${lanc ? lanc.data : new Date().toISOString().split('T')[0]}"></div>
      <div class="form-group"><label>Tipo</label>
        <select class="form-control" id="flxTipo" onchange="updateFlxCatOptions()">
          <option value="entrada" ${tipoEntradaSel}>Entrada</option>
          <option value="saida" ${tipoSaidaSel}>Saída</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label>Categoria</label>
      <select class="form-control" id="flxCat">
        <optgroup label="Entradas" id="flxCatEntradas">${catEntradaOpts}</optgroup>
        <optgroup label="Saídas" id="flxCatSaidas">${catSaidaOpts}</optgroup>
      </select>
    </div>
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="flxDesc" value="${lanc ? lanc.descricao || '' : ''}"></div>
    <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="flxValor" value="${lanc ? lanc.valor : ''}" step="0.01" min="0"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="flxObs" rows="2">${lanc ? lanc.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveLancamento(' + mesIdx + ',' + (isEdit ? lanc.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
  setTimeout(function() { updateFlxCatOptions(); }, 50);
}

function updateFlxCatOptions() {
  const tipo = document.getElementById('flxTipo').value;
  const catEntradas = document.getElementById('flxCatEntradas');
  const catSaidas = document.getElementById('flxCatSaidas');
  if (catEntradas) catEntradas.style.display = (tipo === 'entrada') ? '' : 'none';
  if (catSaidas) catSaidas.style.display = (tipo === 'saida') ? '' : 'none';
  const select = document.getElementById('flxCat');
  if (select) {
    const opts = select.querySelectorAll('option');
    for (let o of opts) {
      if (o.parentElement.style.display !== 'none') { select.value = o.value; break; }
    }
  }
}

function saveLancamento(mesIdx, id) {
  const mesKey = mesesKeys[mesIdx];
  const obj = {
    data: document.getElementById('flxData').value,
    tipo: document.getElementById('flxTipo').value,
    categoria: document.getElementById('flxCat').value,
    descricao: document.getElementById('flxDesc').value.trim(),
    valor: parseFloat(document.getElementById('flxValor').value) || 0,
    obs: document.getElementById('flxObs').value
  };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.fluxoCaixa) appData.fluxoCaixa = {};
  if (!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey] = [];
  if (id) {
    const idx = appData.fluxoCaixa[mesKey].findIndex(l => l.id === id);
    if (idx > -1) { obj.id = id; appData.fluxoCaixa[mesKey][idx] = obj; }
  } else {
    obj.id = nextId(appData.fluxoCaixa[mesKey]);
    appData.fluxoCaixa[mesKey].push(obj);
  }
  saveData(); closeCadastroModal(); renderFluxoMes(mesIdx);
  showToast(id ? 'Lançamento atualizado!' : 'Lançamento cadastrado!', 'success');
}

function editLancamento(mesIdx, id) {
  const mesKey = mesesKeys[mesIdx];
  const lanc = (appData.fluxoCaixa[mesKey] || []).find(l => l.id === id);
  if (lanc) openLancamentoModal(mesIdx, lanc);
}

function deleteLancamento(mesIdx, id) {
  if (!confirm('Excluir lançamento?')) return;
  const mesKey = mesesKeys[mesIdx];
  appData.fluxoCaixa[mesKey] = (appData.fluxoCaixa[mesKey] || []).filter(l => l.id !== id);
  saveData(); renderFluxoMes(mesIdx);
  showToast('Lançamento excluído!', 'success');
}

// ══════════════════════════════════════════════════════════════
// ── SCR-CMP-01 — COMPRAS (SEM coluna Entrega) ──
// ══════════════════════════════════════════════════════════════
function renderComprasPage() {
  const pg = document.getElementById('page-compras');
  if (!pg) return;
  const compras = appData.compras || [];
  const total = compras.reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const pago = compras.filter(c => c.situacao === 'Pago').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const devendo = compras.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const sitOpts = (appData.situacaoCompra || []).map(s => '<option value="' + s + '">' + s + '</option>').join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => '<option value="' + f + '">' + f + '</option>').join('');

  pg.innerHTML = `
    <div class="page-header"><h2>🛒 Compras</h2><button class="btn btn-primary" onclick="openCompraModal()">+ Nova Compra</button></div>
    <div class="dashboard-grid" id="comprasResultPanel">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">${formatCurrency(total)}</div><div class="card-sub">${compras.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(pago)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(devendo)}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar compra..." value="${comprasSearchQuery}" oninput="onComprasSearch(this.value)">
      <select class="form-control" style="max-width:150px" onchange="onComprasFilterSit(this.value)"><option value="">Todas situações</option>${sitOpts}</select>
      <select class="form-control" style="max-width:180px" onchange="onComprasFilterPgto(this.value)"><option value="">Todas formas pgto</option>${pgtoOpts}</select>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn btn-warning btn-sm" onclick="toggleComprasEditMode()" id="btnComprasEdit">✏️ Editar Todos</button>
      <button class="btn btn-danger btn-sm" onclick="deleteAllCompras()">🗑️ Excluir Todos</button>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Pgto</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="comprasBody"></tbody></table></div>`;
  comprasSearchQuery = ''; comprasFilterSit = ''; comprasFilterPgto = '';
  renderComprasTable(compras);
}

function renderComprasTable(compras) {
  const tbody = document.getElementById('comprasBody');
  if (!tbody) return;
  if (compras.length === 0) { tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma compra encontrada</td></tr>'; return; }
  const sitOpts = (appData.situacaoCompra || []);
  tbody.innerHTML = compras.map(c => {
    const total = (c.quantidade || 1) * (c.valorUnit || 0);
    const sitSelect = '<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeCompraField(' + c.id + ',\'situacao\',this.value)">' + sitOpts.map(s => '<option value="' + s + '"' + (c.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select>';
    const acoes = comprasEditMode
      ? '<button class="btn btn-sm btn-outline" onclick="viewCompra(' + c.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCompra(' + c.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCompra(' + c.id + ')">🗑️</button>'
      : '<button class="btn btn-sm btn-outline" onclick="viewCompra(' + c.id + ')">👁️</button>';
    return '<tr><td>' + formatDate(c.data) + '</td><td>' + (c.produto || '-') + '</td><td>' + (c.fornecedor || '-') + '</td><td>' + (c.quantidade || 1) + '</td><td>' + formatCurrency(c.valorUnit) + '</td><td>' + formatCurrency(total) + '</td><td>' + (c.formaPagamento || '-') + '</td><td>' + sitSelect + '</td><td>' + acoes + '</td></tr>';
  }).join('');
}

function changeCompraField(id, field, value) {
  const c = (appData.compras || []).find(x => x.id === id);
  if (c) { c[field] = value; saveData(); applyComprasFilters(); }
}

function openCompraModal(compra) {
  const isEdit = !!compra;
  const fornOpts = (appData.fornecedores || []).map(f => '<option value="' + f.nome + '"' + (compra && compra.fornecedor === f.nome ? ' selected' : '') + '>' + f.nome + '</option>').join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => '<option value="' + f + '"' + (compra && compra.formaPagamento === f ? ' selected' : '') + '>' + f + '</option>').join('');
  const sitOpts = (appData.situacaoCompra || []).map(s => '<option value="' + s + '"' + (compra && compra.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Compra' : 'Nova Compra';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="cpData" value="${compra ? compra.data : new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="cpVenc" value="${compra ? compra.vencimento || '' : ''}"></div></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="cpProd" value="${compra ? compra.produto : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="cpQtd" value="${compra ? compra.quantidade : 1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="cpValor" value="${compra ? compra.valorUnit : ''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="cpForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="cpPgto"><option value="">Selecione...</option>${pgtoOpts}</select></div></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="cpSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="cpObs" rows="2">${compra ? compra.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCompra(' + (isEdit ? compra.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveCompra(id) {
  const obj = { data: document.getElementById('cpData').value, vencimento: document.getElementById('cpVenc').value, produto: document.getElementById('cpProd').value.trim(), quantidade: parseFloat(document.getElementById('cpQtd').value) || 1, valorUnit: parseFloat(document.getElementById('cpValor').value) || 0, fornecedor: document.getElementById('cpForn').value, formaPagamento: document.getElementById('cpPgto').value, situacao: document.getElementById('cpSit').value, obs: document.getElementById('cpObs').value };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.compras) appData.compras = [];
  if (id) { const idx = appData.compras.findIndex(c => c.id === id); if (idx > -1) { obj.id = id; appData.compras[idx] = obj; } }
  else { obj.id = nextId(appData.compras); appData.compras.push(obj); }
  saveData(); closeCadastroModal(); renderComprasPage(); showToast(id ? 'Compra atualizada!' : 'Compra cadastrada!', 'success');
}

function editCompra(id) { const c = (appData.compras || []).find(x => x.id === id); if (c) openCompraModal(c); }

function viewCompra(id) {
  const c = (appData.compras || []).find(x => x.id === id); if (!c) return;
  const total = (c.quantidade || 1) * (c.valorUnit || 0);
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Compra';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>' + formatDate(c.data) + '</div><div class="detail-item"><span class="detail-label">Vencimento</span>' + formatDate(c.vencimento) + '</div><div class="detail-item"><span class="detail-label">Produto</span>' + c.produto + '</div><div class="detail-item"><span class="detail-label">Qtd</span>' + c.quantidade + '</div><div class="detail-item"><span class="detail-label">V.Unit</span>' + formatCurrency(c.valorUnit) + '</div><div class="detail-item"><span class="detail-label">Total</span>' + formatCurrency(total) + '</div><div class="detail-item"><span class="detail-label">Fornecedor</span>' + (c.fornecedor || '-') + '</div><div class="detail-item"><span class="detail-label">Pgto</span>' + (c.formaPagamento || '-') + '</div><div class="detail-item"><span class="detail-label">Situação</span><span class="badge ' + (c.situacao === 'Pago' ? 'badge-success' : 'badge-danger') + '">' + c.situacao + '</span></div></div>' + (c.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + c.obs + '</div>' : '');
  openViewModal();
}

function deleteCompra(id) { if (!confirm('Excluir compra?')) return; appData.compras = (appData.compras || []).filter(c => c.id !== id); saveData(); renderComprasPage(); showToast('Compra excluída!', 'success'); }

function toggleComprasEditMode() { comprasEditMode = !comprasEditMode; const btn = document.getElementById('btnComprasEdit'); if (btn) btn.textContent = comprasEditMode ? '✅ Finalizar Edição' : '✏️ Editar Todos'; applyComprasFilters(); }
function deleteAllCompras() { if (!confirm('Excluir TODAS as compras?')) return; appData.compras = []; saveData(); renderComprasPage(); showToast('Todas excluídas!', 'success'); }
function onComprasSearch(q) { comprasSearchQuery = q.toLowerCase(); applyComprasFilters(); }
function onComprasFilterSit(s) { comprasFilterSit = s; applyComprasFilters(); }
function onComprasFilterPgto(p) { comprasFilterPgto = p; applyComprasFilters(); }
function applyComprasFilters() {
  let filtered = appData.compras || [];
  if (comprasSearchQuery) filtered = filtered.filter(c => (c.produto || '').toLowerCase().includes(comprasSearchQuery) || (c.fornecedor || '').toLowerCase().includes(comprasSearchQuery));
  if (comprasFilterSit) filtered = filtered.filter(c => c.situacao === comprasFilterSit);
  if (comprasFilterPgto) filtered = filtered.filter(c => c.formaPagamento === comprasFilterPgto);
  renderComprasTable(filtered); renderComprasResultPanel(filtered);
}
function renderComprasResultPanel(filtered) {
  const panel = document.getElementById('comprasResultPanel'); if (!panel) return;
  const all = appData.compras || [];
  const total = filtered.reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const pago = filtered.filter(c => c.situacao === 'Pago').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const devendo = filtered.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  panel.innerHTML = '<div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">' + formatCurrency(total) + '</div><div class="card-sub">' + filtered.length + ' de ' + all.length + ' registros</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">' + formatCurrency(pago) + '</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">' + formatCurrency(devendo) + '</div></div>';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-VND-01 — VENDAS (COM coluna Entrega) ──
// ══════════════════════════════════════════════════════════════
function renderVendasPage() {
  const pg = document.getElementById('page-vendas');
  if (!pg) return;
  const vendas = appData.vendas || [];
  const total = vendas.reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const recebido = vendas.filter(v => v.situacao === 'Pago').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const devendo = vendas.filter(v => v.situacao === 'Devendo').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const sitOpts = (appData.situacaoVenda || []).map(s => '<option value="' + s + '">' + s + '</option>').join('');

  pg.innerHTML = `
    <div class="page-header"><h2>💰 Vendas</h2><button class="btn btn-primary" onclick="openVendaModal()">+ Nova Venda</button></div>
    <div class="dashboard-grid" id="vendasResultPanel">
      <div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">${formatCurrency(total)}</div><div class="card-sub">${vendas.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">${formatCurrency(recebido)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(devendo)}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar venda..." value="${vendasSearchQuery}" oninput="onVendasSearch(this.value)">
      <select class="form-control" style="max-width:150px" onchange="onVendasFilterSit(this.value)"><option value="">Todas situações</option>${sitOpts}</select>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn btn-warning btn-sm" onclick="toggleVendasEditMode()" id="btnVendasEdit">✏️ Editar Todos</button>
      <button class="btn btn-danger btn-sm" onclick="deleteAllVendas()">🗑️ Excluir Todos</button>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Vendedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Pgto</th><th>Situação</th><th>Entrega</th><th>Ações</th></tr></thead>
    <tbody id="vendasBody"></tbody></table></div>`;
  vendasSearchQuery = ''; vendasFilterSit = '';
  renderVendasTable(vendas);
}

function renderVendasTable(vendas) {
  const tbody = document.getElementById('vendasBody'); if (!tbody) return;
  if (vendas.length === 0) { tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma venda encontrada</td></tr>'; return; }
  const sitOpts = (appData.situacaoVenda || []);
  const entOpts = (appData.situacaoEntrega || []);
  tbody.innerHTML = vendas.map(v => {
    const total = (v.quantidade || 1) * (v.valorUnit || 0);
    const sitSelect = '<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeVendaField(' + v.id + ',\'situacao\',this.value)">' + sitOpts.map(s => '<option value="' + s + '"' + (v.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select>';
    const entSelect = '<select class="form-control" style="min-width:120px;padding:4px 6px;font-size:12px" onchange="changeVendaField(' + v.id + ',\'entrega\',this.value)">' + entOpts.map(e => '<option value="' + e + '"' + (v.entrega === e ? ' selected' : '') + '>' + e + '</option>').join('') + '</select>';
    const acoes = vendasEditMode
      ? '<button class="btn btn-sm btn-outline" onclick="viewVenda(' + v.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editVenda(' + v.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteVenda(' + v.id + ')">🗑️</button>'
      : '<button class="btn btn-sm btn-outline" onclick="viewVenda(' + v.id + ')">👁️</button>';
    return '<tr><td>' + formatDate(v.data) + '</td><td>' + (v.produto || '-') + '</td><td>' + (v.cliente || '-') + '</td><td>' + (v.vendedor || '-') + '</td><td>' + (v.quantidade || 1) + '</td><td>' + formatCurrency(v.valorUnit) + '</td><td>' + formatCurrency(total) + '</td><td>' + (v.formaPagamento || '-') + '</td><td>' + sitSelect + '</td><td>' + entSelect + '</td><td>' + acoes + '</td></tr>';
  }).join('');
}

function changeVendaField(id, field, value) { const v = (appData.vendas || []).find(x => x.id === id); if (v) { v[field] = value; saveData(); applyVendasFilters(); } }

function openVendaModal(venda) {
  const isEdit = !!venda;
  const cliOpts = (appData.clientes || []).map(c => '<option value="' + c.nome + '"' + (venda && venda.cliente === c.nome ? ' selected' : '') + '>' + c.nome + '</option>').join('');
  const vendOpts = (appData.vendedores || []).map(v => '<option value="' + v + '"' + (venda && venda.vendedor === v ? ' selected' : '') + '>' + v + '</option>').join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => '<option value="' + f + '"' + (venda && venda.formaPagamento === f ? ' selected' : '') + '>' + f + '</option>').join('');
  const sitOpts = (appData.situacaoVenda || []).map(s => '<option value="' + s + '"' + (venda && venda.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('');
  const entOpts = (appData.situacaoEntrega || []).map(e => '<option value="' + e + '"' + (venda && venda.entrega === e ? ' selected' : '') + '>' + e + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Venda' : 'Nova Venda';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="vnData" value="${venda ? venda.data : new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="vnVenc" value="${venda ? venda.vencimento || '' : ''}"></div></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="vnProd" value="${venda ? venda.produto : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="vnQtd" value="${venda ? venda.quantidade : 1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="vnValor" value="${venda ? venda.valorUnit : ''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="vnCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Vendedor</label><select class="form-control" id="vnVend"><option value="">Selecione...</option>${vendOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="vnPgto"><option value="">Selecione...</option>${pgtoOpts}</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="vnSit">${sitOpts}</select></div></div>
    <div class="form-group"><label>Entrega</label><select class="form-control" id="vnEnt">${entOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="vnObs" rows="2">${venda ? venda.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda(' + (isEdit ? venda.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveVenda(id) {
  const obj = { data: document.getElementById('vnData').value, vencimento: document.getElementById('vnVenc').value, produto: document.getElementById('vnProd').value.trim(), quantidade: parseFloat(document.getElementById('vnQtd').value) || 1, valorUnit: parseFloat(document.getElementById('vnValor').value) || 0, cliente: document.getElementById('vnCli').value, vendedor: document.getElementById('vnVend').value, formaPagamento: document.getElementById('vnPgto').value, situacao: document.getElementById('vnSit').value, entrega: document.getElementById('vnEnt').value, obs: document.getElementById('vnObs').value };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.vendas) appData.vendas = [];
  if (id) { const idx = appData.vendas.findIndex(v => v.id === id); if (idx > -1) { obj.id = id; appData.vendas[idx] = obj; } }
  else { obj.id = nextId(appData.vendas); appData.vendas.push(obj); }
  saveData(); closeCadastroModal(); renderVendasPage(); showToast(id ? 'Venda atualizada!' : 'Venda cadastrada!', 'success');
}

function editVenda(id) { const v = (appData.vendas || []).find(x => x.id === id); if (v) openVendaModal(v); }

function viewVenda(id) {
  const v = (appData.vendas || []).find(x => x.id === id); if (!v) return;
  const total = (v.quantidade || 1) * (v.valorUnit || 0);
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Venda';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>' + formatDate(v.data) + '</div><div class="detail-item"><span class="detail-label">Vencimento</span>' + formatDate(v.vencimento) + '</div><div class="detail-item"><span class="detail-label">Produto</span>' + v.produto + '</div><div class="detail-item"><span class="detail-label">Qtd</span>' + v.quantidade + '</div><div class="detail-item"><span class="detail-label">V.Unit</span>' + formatCurrency(v.valorUnit) + '</div><div class="detail-item"><span class="detail-label">Total</span>' + formatCurrency(total) + '</div><div class="detail-item"><span class="detail-label">Cliente</span>' + (v.cliente || '-') + '</div><div class="detail-item"><span class="detail-label">Vendedor</span>' + (v.vendedor || '-') + '</div><div class="detail-item"><span class="detail-label">Pgto</span>' + (v.formaPagamento || '-') + '</div><div class="detail-item"><span class="detail-label">Situação</span><span class="badge ' + (v.situacao === 'Pago' ? 'badge-success' : 'badge-danger') + '">' + v.situacao + '</span></div><div class="detail-item"><span class="detail-label">Entrega</span><span class="badge ' + (v.entrega === 'Entregue OK' ? 'badge-success' : 'badge-warning') + '">' + (v.entrega || '-') + '</span></div></div>' + (v.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + v.obs + '</div>' : '');
  openViewModal();
}

function deleteVenda(id) { if (!confirm('Excluir venda?')) return; appData.vendas = (appData.vendas || []).filter(v => v.id !== id); saveData(); renderVendasPage(); showToast('Venda excluída!', 'success'); }

function toggleVendasEditMode() { vendasEditMode = !vendasEditMode; const btn = document.getElementById('btnVendasEdit'); if (btn) btn.textContent = vendasEditMode ? '✅ Finalizar Edição' : '✏️ Editar Todos'; applyVendasFilters(); }
function deleteAllVendas() { if (!confirm('Excluir TODAS as vendas?')) return; appData.vendas = []; saveData(); renderVendasPage(); showToast('Todas excluídas!', 'success'); }
function onVendasSearch(q) { vendasSearchQuery = q.toLowerCase(); applyVendasFilters(); }
function onVendasFilterSit(s) { vendasFilterSit = s; applyVendasFilters(); }
function applyVendasFilters() {
  let filtered = appData.vendas || [];
  if (vendasSearchQuery) filtered = filtered.filter(v => (v.produto || '').toLowerCase().includes(vendasSearchQuery) || (v.cliente || '').toLowerCase().includes(vendasSearchQuery));
  if (vendasFilterSit) filtered = filtered.filter(v => v.situacao === vendasFilterSit);
  renderVendasTable(filtered); renderVendasResultPanel(filtered);
}
function renderVendasResultPanel(filtered) {
  const panel = document.getElementById('vendasResultPanel'); if (!panel) return;
  const all = appData.vendas || [];
  const total = filtered.reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const recebido = filtered.filter(v => v.situacao === 'Pago').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const devendo = filtered.filter(v => v.situacao === 'Devendo').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  panel.innerHTML = '<div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">' + formatCurrency(total) + '</div><div class="card-sub">' + filtered.length + ' de ' + all.length + ' registros</div></div><div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">' + formatCurrency(recebido) + '</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">' + formatCurrency(devendo) + '</div></div>';
}

// ── SCR-EST-01 — ESTOQUE ──
function renderEstoquePage() {
  const pg = document.getElementById('page-estoque'); if (!pg) return;
  const estoque = appData.estoque || [];
  pg.innerHTML = `
    <div class="page-header"><h2>📦 Estoque</h2><button class="btn btn-primary" onclick="openEstoqueModal()">+ Novo Item</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Itens</span></div><div class="card-value">${estoque.length}</div></div>
      <div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value text-success">${formatCurrency(estoque.reduce((s,e)=>s+((e.quantidade||0)*(e.valorUnit||0)),0))}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar no estoque..." oninput="filterEstoque(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Unidade</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Ações</th></tr></thead><tbody id="estoqueBody"></tbody></table></div>`;
  renderEstoqueTable(estoque);
}
function renderEstoqueTable(items) {
  const tbody = document.getElementById('estoqueBody'); if (!tbody) return;
  if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum item</td></tr>'; return; }
  tbody.innerHTML = items.map(e => '<tr><td>' + (e.produto||'-') + '</td><td>' + (e.unidade||'-') + '</td><td>' + (e.quantidade||0) + '</td><td>' + formatCurrency(e.valorUnit) + '</td><td>' + formatCurrency((e.quantidade||0)*(e.valorUnit||0)) + '</td><td><button class="btn btn-sm btn-primary" onclick="editEstoque(' + e.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteEstoque(' + e.id + ')">🗑️</button></td></tr>').join('');
}
function filterEstoque(q) { q=q.toLowerCase(); renderEstoqueTable((appData.estoque||[]).filter(e=>(e.produto||'').toLowerCase().includes(q))); }
function openEstoqueModal(item) {
  const isEdit = !!item;
  const unidOpts = (appData.tipoUnidade||[]).map(u=>'<option value="'+u+'"'+(item&&item.unidade===u?' selected':'')+'>'+u+'</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Item' : 'Novo Item';
  document.getElementById('cadastroModalBody').innerHTML = '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="estProd" value="'+(item?item.produto:'')+'"></div><div class="form-row"><div class="form-group"><label>Unidade</label><select class="form-control" id="estUnid">'+unidOpts+'</select></div><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="estQtd" value="'+(item?item.quantidade:0)+'" min="0"></div></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="estValor" value="'+(item?item.valorUnit:'')+'" step="0.01"></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEstoque('+(isEdit?item.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveEstoque(id) {
  const obj = { produto: document.getElementById('estProd').value.trim(), unidade: document.getElementById('estUnid').value, quantidade: parseFloat(document.getElementById('estQtd').value)||0, valorUnit: parseFloat(document.getElementById('estValor').value)||0 };
  if (!obj.produto) { showToast('Informe o produto','error'); return; }
  if (!appData.estoque) appData.estoque = [];
  if (id) { const idx=appData.estoque.findIndex(e=>e.id===id); if(idx>-1){obj.id=id;appData.estoque[idx]=obj;} } else { obj.id=nextId(appData.estoque); appData.estoque.push(obj); }
  saveData(); closeCadastroModal(); renderEstoquePage(); showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editEstoque(id) { const e=(appData.estoque||[]).find(x=>x.id===id); if(e) openEstoqueModal(e); }
function deleteEstoque(id) { if(!confirm('Excluir?')) return; appData.estoque=(appData.estoque||[]).filter(e=>e.id!==id); saveData(); renderEstoquePage(); showToast('Excluído!','success'); }

// ── MÓDULOS GENÉRICOS (Produtos, Clientes, Fornecedores, etc.) ──
function getGenericConfig(key) {
  const configs = {
    produtos: { titulo: 'Produto', campos: [
      { field:'nome', label:'Nome', type:'text', required:true },
      { field:'categoria', label:'Categoria', type:'text' },
      { field:'unidade', label:'Unidade', type:'select', options: appData.tipoUnidade||[] },
      { field:'preco', label:'Preço', type:'number' }
    ]},
    clientes: { titulo: 'Cliente', campos: [
      { field:'nome', label:'Nome', type:'text', required:true },
      { field:'cpfCnpj', label:'CPF/CNPJ', type:'text' },
      { field:'telefone', label:'Telefone', type:'text' },
      { field:'celular', label:'Celular', type:'text' },
      { field:'email', label:'E-mail', type:'email' },
      { field:'endereco', label:'Endereço', type:'text' },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    fornecedores: { titulo: 'Fornecedor', campos: [
      { field:'nome', label:'Nome', type:'text', required:true },
      { field:'cpfCnpj', label:'CPF/CNPJ', type:'text' },
      { field:'telefone', label:'Telefone', type:'text' },
      { field:'celular', label:'Celular', type:'text' },
      { field:'email', label:'E-mail', type:'email' },
      { field:'endereco', label:'Endereço', type:'text' },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    pFornecedores: { titulo: 'Produto do Fornecedor', campos: [
      { field:'fornecedor', label:'Fornecedor', type:'text', required:true },
      { field:'produto', label:'Produto', type:'text', required:true },
      { field:'preco', label:'Preço', type:'number' },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    boletos: { titulo: 'Boleto', campos: [
      { field:'descricao', label:'Descrição', type:'text', required:true },
      { field:'valor', label:'Valor', type:'number' },
      { field:'vencimento', label:'Vencimento', type:'date' },
      { field:'situacao', label:'Situação', type:'select', options: appData.situacaoBoleto||[] },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    cheques: { titulo: 'Cheque', campos: [
      { field:'descricao', label:'Descrição', type:'text', required:true },
      { field:'valor', label:'Valor', type:'number' },
      { field:'data', label:'Data', type:'date' },
      { field:'situacao', label:'Situação', type:'select', options: appData.situacaoCheque||[] },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    prestacoes: { titulo: 'Prestação', campos: [
      { field:'descricao', label:'Descrição', type:'text', required:true },
      { field:'valor', label:'Valor', type:'number' },
      { field:'vencimento', label:'Vencimento', type:'date' },
      { field:'situacao', label:'Situação', type:'select', options:['Pago','Pendente','Vencido'] },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    projetos: { titulo: 'Projeto', campos: [
      { field:'nome', label:'Nome', type:'text', required:true },
      { field:'cliente', label:'Cliente', type:'text' },
      { field:'valor', label:'Valor', type:'number' },
      { field:'dataInicio', label:'Data Início', type:'date' },
      { field:'dataFim', label:'Data Fim', type:'date' },
      { field:'situacao', label:'Situação', type:'select', options:['Em Andamento','Concluído','Cancelado'] },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    pagClientes: { titulo: 'Pagamento de Cliente', campos: [
      { field:'cliente', label:'Cliente', type:'text', required:true },
      { field:'valor', label:'Valor', type:'number' },
      { field:'data', label:'Data', type:'date' },
      { field:'formaPagamento', label:'Forma Pgto', type:'select', options: appData.formasPagamento||[] },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    garantias: { titulo: 'Garantia', campos: [
      { field:'produto', label:'Produto', type:'text', required:true },
      { field:'cliente', label:'Cliente', type:'text' },
      { field:'dataInicio', label:'Data Início', type:'date' },
      { field:'dataFim', label:'Data Fim', type:'date' },
      { field:'situacao', label:'Situação', type:'select', options: appData.situacaoGarantia||[] },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    notasEntrada: { titulo: 'Nota de Entrada', campos: [
      { field:'numero', label:'Número', type:'text', required:true },
      { field:'fornecedor', label:'Fornecedor', type:'text' },
      { field:'valor', label:'Valor', type:'number' },
      { field:'data', label:'Data', type:'date' },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    notasSaida: { titulo: 'Nota de Saída', campos: [
      { field:'numero', label:'Número', type:'text', required:true },
      { field:'cliente', label:'Cliente', type:'text' },
      { field:'valor', label:'Valor', type:'number' },
      { field:'data', label:'Data', type:'date' },
      { field:'obs', label:'Obs', type:'text' }
    ]},
    receitasMei: { titulo: 'Receita MEI', campos: [
      { field:'descricao', label:'Descrição', type:'text', required:true },
      { field:'valor', label:'Valor', type:'number' },
      { field:'data', label:'Data', type:'date' },
      { field:'obs', label:'Obs', type:'text' }
    ]}
  };
  return configs[key] || { titulo: key, campos: [] };
}

function genericCrudPage(key, titulo, icon, campos) {
  const pg = document.getElementById('page-' + key); if (!pg) return;
  const items = appData[key] || [];
  let thRow = campos.map(c=>'<th>'+c.label+'</th>').join('')+'<th>Ações</th>';
  let rows = items.length===0 ? '<tr><td colspan="'+(campos.length+1)+'" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>' :
    items.map(item => '<tr>'+campos.map(c=>'<td>'+(c.type==='number'&&item[c.field]?formatCurrency(item[c.field]):c.type==='date'?formatDate(item[c.field]):(item[c.field]||'-'))+'</td>').join('')+'<td><button class="btn btn-sm btn-primary" onclick="editGeneric(\''+key+'\','+item.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGeneric(\''+key+'\','+item.id+')">🗑️</button></td></tr>').join('');
  pg.innerHTML = '<div class="page-header"><h2>'+icon+' '+titulo+'</h2><button class="btn btn-primary" onclick="openGenericModal(\''+key+'\')">+ Novo</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+items.length+'</div></div></div><div class="table-responsive"><table class="table"><thead><tr>'+thRow+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function openGenericModal(key, item) {
  const isEdit=!!item; const configs=getGenericConfig(key);
  let formHtml=configs.campos.map(c=>{const val=item?(item[c.field]||''):'';if(c.type==='select'){const opts=(c.options||[]).map(o=>'<option value="'+o+'"'+(val===o?' selected':'')+'>'+o+'</option>').join('');return '<div class="form-group"><label>'+c.label+'</label><select class="form-control" id="gen_'+c.field+'">'+opts+'</select></div>';}return '<div class="form-group"><label>'+c.label+(c.required?' *':'')+'</label><input type="'+(c.type||'text')+'" class="form-control" id="gen_'+c.field+'" value="'+val+'" '+(c.type==='number'?'step="0.01"':'')+'>  </div>';}).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit?'Editar '+configs.titulo:'Novo '+configs.titulo;
  document.getElementById('cadastroModalBody').innerHTML = formHtml;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGeneric(\''+key+'\','+(isEdit?item.id:'null')+')">Salvar</button>';
  openCadastroModal(); if(key==='clientes'||key==='fornecedores') applyAllMasks();
}

function saveGeneric(key, id) {
  const configs=getGenericConfig(key); const obj={}; let valid=true;
  configs.campos.forEach(c=>{const el=document.getElementById('gen_'+c.field);if(el){obj[c.field]=c.type==='number'?(parseFloat(el.value)||0):el.value.trim();if(c.required&&!obj[c.field]) valid=false;}});
  if(!valid){showToast('Preencha os campos obrigatórios','error');return;}
  if(!appData[key]) appData[key]=[];
  if(id){const idx=appData[key].findIndex(x=>x.id===id);if(idx>-1){obj.id=id;appData[key][idx]=obj;}} else {obj.id=nextId(appData[key]);appData[key].push(obj);}
  saveData(); closeCadastroModal();
  const pageMap = { pFornecedores:'pfornecedores', pagClientes:'pagclientes', notasEntrada:'notasentrada', notasSaida:'notassaida', receitasMei:'receitasmei' };
  navigateTo(pageMap[key] || key);
  showToast(id?'Atualizado!':'Cadastrado!','success');
}

function editGeneric(key,id){const item=(appData[key]||[]).find(x=>x.id===id);if(item) openGenericModal(key,item);}

function deleteGeneric(key,id){
  if(!confirm('Excluir?')) return;
  appData[key]=(appData[key]||[]).filter(x=>x.id!==id);
  saveData();
  const pageMap = { pFornecedores:'pfornecedores', pagClientes:'pagclientes', notasEntrada:'notasentrada', notasSaida:'notassaida', receitasMei:'receitasmei' };
  navigateTo(pageMap[key] || key);
  showToast('Excluído!','success');
}

// ── RENDERS DE PÁGINAS GENÉRICAS ──
function renderProdutosPage() { const c = getGenericConfig('produtos'); genericCrudPage('produtos','Produtos','🏷️',c.campos); }
function renderClientesPage() { const c = getGenericConfig('clientes'); genericCrudPage('clientes','Clientes','👥',c.campos); }
function renderFornecedoresPage() { const c = getGenericConfig('fornecedores'); genericCrudPage('fornecedores','Fornecedores','🏭',c.campos); }
function renderPFornecedoresPage() { const c = getGenericConfig('pFornecedores'); genericCrudPage('pfornecedores','P. Fornecedores','📋',c.campos); }
function renderBoletosPage() { const c = getGenericConfig('boletos'); genericCrudPage('boletos','Boletos','🔖',c.campos); }
function renderChequesPage() { const c = getGenericConfig('cheques'); genericCrudPage('cheques','Cheques','📝',c.campos); }
function renderPrestacoesPage() { const c = getGenericConfig('prestacoes'); genericCrudPage('prestacoes','Prestações','💳',c.campos); }
function renderProjetosPage() { const c = getGenericConfig('projetos'); genericCrudPage('projetos','Projetos','📐',c.campos); }
function renderPagClientesPage() { const c = getGenericConfig('pagClientes'); genericCrudPage('pagclientes','Pag. Clientes','🤝',c.campos); }
function renderGarantiasPage() { const c = getGenericConfig('garantias'); genericCrudPage('garantias','Garantias','🛡️',c.campos); }
function renderNotasEntradaPage() { const c = getGenericConfig('notasEntrada'); genericCrudPage('notasentrada','Notas Entrada','📥',c.campos); }
function renderNotasSaidaPage() { const c = getGenericConfig('notasSaida'); genericCrudPage('notassaida','Notas Saída','📤',c.campos); }
function renderReceitasMeiPage() { const c = getGenericConfig('receitasMei'); genericCrudPage('receitasmei','Receitas MEI','📄',c.campos); }

// ── RELATÓRIOS ──
function renderRelatoriosPage() {
  const pg = document.getElementById('page-relatorios'); if (!pg) return;
  const compras = appData.compras || [];
  const vendas = appData.vendas || [];
  const totalCompras = compras.reduce((s,c)=>s+((c.quantidade||1)*(c.valorUnit||0)),0);
  const totalVendas = vendas.reduce((s,v)=>s+((v.quantidade||1)*(v.valorUnit||0)),0);
  const lucro = totalVendas - totalCompras;

  pg.innerHTML = `
    <div class="page-header"><h2>📈 Relatórios</h2></div>
    <div class="dashboard-grid">
      <div class="card"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">${formatCurrency(totalCompras)}</div><div class="card-sub">${compras.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">${formatCurrency(totalVendas)}</div><div class="card-sub">${vendas.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Lucro</span></div><div class="card-value ${lucro>=0?'text-success':'text-danger'}">${formatCurrency(lucro)}</div></div>
      <div class="card"><div class="card-header"><span>Estoque</span></div><div class="card-value">${(appData.estoque||[]).length} itens</div></div>
      <div class="card"><div class="card-header"><span>Clientes</span></div><div class="card-value">${(appData.clientes||[]).length}</div></div>
      <div class="card"><div class="card-header"><span>Fornecedores</span></div><div class="card-value">${(appData.fornecedores||[]).length}</div></div>
    </div>`;
}

// ── CONFIGURAÇÕES ──
function renderConfiguracoesPage() {
  const pg = document.getElementById('page-configuracoes'); if (!pg) return;
  const emp = appData.empresa || {};
  pg.innerHTML = `
    <div class="page-header"><h2>⚙️ Configurações</h2></div>
    <div class="card" style="max-width:600px">
      <div class="card-header"><span>Dados da Empresa</span></div>
      <div style="padding:16px">
        <div class="form-group"><label>Nome da Empresa</label><input type="text" class="form-control" id="cfgNome" value="${emp.nome||''}"></div>
        <div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="${emp.cnpj||''}"></div>
        <div class="form-group"><label>Logo (URL)</label><input type="text" class="form-control" id="cfgLogo" value="${emp.logo||''}"></div>
        <button class="btn btn-primary" onclick="saveConfiguracoes()">Salvar</button>
      </div>
    </div>`;
  applyAllMasks();
}
function saveConfiguracoes() {
  appData.empresa = { nome: document.getElementById('cfgNome').value.trim(), cnpj: document.getElementById('cfgCnpj').value.trim(), logo: document.getElementById('cfgLogo').value.trim() };
  saveData(); updateSidebarInfo(); showToast('Configurações salvas!','success');
}

// ── BACKUP ──
function renderBackupPage() {
  const pg = document.getElementById('page-backup'); if (!pg) return;
  pg.innerHTML = `
    <div class="page-header"><h2>💾 Backup</h2></div>
    <div class="dashboard-grid" style="max-width:800px">
      <div class="card">
        <div class="card-header"><span>Exportar Dados</span></div>
        <div style="padding:16px"><p style="color:var(--text-muted);margin-bottom:12px">Baixe todos os dados em formato JSON.</p><button class="btn btn-primary" onclick="exportBackup()">📥 Exportar JSON</button></div>
      </div>
      <div class="card">
        <div class="card-header"><span>Importar Dados</span></div>
        <div style="padding:16px"><p style="color:var(--text-muted);margin-bottom:12px">Restaure dados de um arquivo JSON.</p><input type="file" id="importFile" accept=".json" style="margin-bottom:8px"><br><button class="btn btn-warning" onclick="importBackup()">📤 Importar JSON</button></div>
      </div>
      <div class="card">
        <div class="card-header"><span>Limpar Dados</span></div>
        <div style="padding:16px"><p style="color:var(--text-muted);margin-bottom:12px">Apaga TODOS os dados e restaura os padrões.</p><button class="btn btn-danger" onclick="clearAllData()">🗑️ Limpar Tudo</button></div>
      </div>
    </div>`;
}
function exportBackup() {
  const blob = new Blob([JSON.stringify(appData, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'wdmaquinas_backup_' + new Date().toISOString().split('T')[0] + '.json'; a.click();
  URL.revokeObjectURL(url); showToast('Backup exportado!','success');
}
function importBackup() {
  const file = document.getElementById('importFile').files[0];
  if (!file) { showToast('Selecione um arquivo','error'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      appData = data; ensureDefaults(); saveData(); updateSidebarInfo(); renderDashboard(); navigateTo('dashboard');
      showToast('Dados importados com sucesso!','success');
    } catch(err) { showToast('Arquivo inválido','error'); }
  };
  reader.readAsText(file);
}
function clearAllData() {
  if (!confirm('ATENÇÃO: Isso apagará TODOS os dados. Deseja continuar?')) return;
  if (!confirm('Tem certeza? Esta ação é irreversível!')) return;
  appData = getDefaultData();
  saveData(); updateSidebarInfo(); navigateTo('dashboard');
  showToast('Dados limpos!','success');
}

// ── INICIALIZAÇÃO ──
async function initApp() {
  try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Supabase conectado');
    }
  } catch (e) { console.warn('Supabase não disponível:', e.message); }

  await loadData();
  updateSidebarInfo();
  renderDashboard();

  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const hoje = new Date();
    const dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    dateEl.textContent = dias[hoje.getDay()] + ', ' + hoje.getDate() + ' de ' + meses[hoje.getMonth()] + ' de ' + hoje.getFullYear();
  }

  document.getElementById('cadastroModal').addEventListener('mousedown', function(e) { if (e.target === this) closeCadastroModal(); });
  document.getElementById('viewModal').addEventListener('mousedown', function(e) { if (e.target === this) closeViewModal(); });

  console.log('WD Máquinas v5 — Sistema inicializado!');
}

document.addEventListener('DOMContentLoaded', initApp);
