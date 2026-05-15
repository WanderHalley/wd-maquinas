// ╔══════════════════════════════════════════════════════════════╗
// ║  WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026              ║
// ║  script.js — CÓDIGO COMPLETO TOKENIZADO                    ║
// ╚══════════════════════════════════════════════════════════════╝

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-CFG-01 — CONFIGURAÇÃO GLOBAL                     │
// │ Deps: nenhuma                                                │
// └──────────────────────────────────────────────────────────────┘
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
// └──────────────────── FIM SCR-CFG-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-UTL-01 — HELPERS DE FORMATO                      │
// │ Deps: nenhuma                                                │
// └──────────────────────────────────────────────────────────────┘
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
// └──────────────────── FIM SCR-UTL-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-UTL-02 — MÁSCARAS AUTOMÁTICAS                    │
// │ Deps: nenhuma                                                │
// └──────────────────────────────────────────────────────────────┘
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
// └──────────────────── FIM SCR-UTL-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-DAT-01 — DADOS PADRÃO                            │
// │ Deps: nenhuma                                                │
// └──────────────────────────────────────────────────────────────┘
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
// └──────────────────── FIM SCR-DAT-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-DAT-02 — LOAD / SAVE / ENSURE DEFAULTS           │
// │ Deps: SCR-CFG-01, SCR-DAT-01                                │
// └──────────────────────────────────────────────────────────────┘
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
// └──────────────────── FIM SCR-DAT-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-UI-01 — TOAST + MODAL HELPERS                    │
// │ Deps: nenhuma (DOM only)                                     │
// └──────────────────────────────────────────────────────────────┘
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
// └──────────────────── FIM SCR-UI-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-UI-02 — SIDEBAR TOGGLE / COLLAPSE / INFO         │
// │ Deps: SCR-CFG-01 (appData)                                  │
// └──────────────────────────────────────────────────────────────┘
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('collapsed');
  syncExpandBtn();
}

function collapseSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('collapsed');
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
// └──────────────────── FIM SCR-UI-02 ──────────────────────────┘



// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-NAV-01 — NAVEGAÇÃO ENTRE PÁGINAS                 │
// │ Deps: SCR-DSH-01..SCR-SYS-02 (render functions)             │
// └──────────────────────────────────────────────────────────────┘
const pageTitles = {
  'dashboard':'Dashboard','janeiro':'Janeiro','fevereiro':'Fevereiro','marco':'Março','abril':'Abril','maio':'Maio','junho':'Junho','julho':'Julho','agosto':'Agosto','setembro':'Setembro','outubro':'Outubro','novembro':'Novembro','dezembro':'Dezembro',
  'compras':'Compras','vendas':'Vendas','estoque':'Estoque','produtos':'Produtos','clientes':'Clientes','fornecedores':'Fornecedores','pfornecedores':'P. Fornecedores',
  'boletos':'Boletos','cheques':'Cheques','prestacoes':'Prestações','projetos':'Projetos','pagclientes':'Pag. Clientes','garantias':'Garantias',
  'relatorios':'Relatórios','notasentrada':'Notas Entrada','notassaida':'Notas Saída','receitasmei':'Receitas MEI',
  'configuracoes':'Configurações','backup':'Backup'
};

function navigateTo(page) {
  // Esconder todas as páginas
  document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
  const el = document.getElementById('page-' + page);
  if (el) el.style.display = 'block';

  // Atualizar título
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = pageTitles[page] || page;

  // Atualizar nav ativa
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector('.nav-item[onclick*="' + page + '"]');
  if (navItem) navItem.classList.add('active');

  // Fechar sidebar mobile
  document.getElementById('sidebar').classList.remove('active');

  // Renderizar conteúdo da página
  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const mesIdx = meses.indexOf(page);

  if (page === 'dashboard') renderDashboard();
  else if (mesIdx > -1) renderFluxoMes(mesIdx);
  else if (page === 'compras') renderVendasPage_real();
  else if (page === 'vendas') renderComprasPage_real();
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
// └──────────────────── FIM SCR-NAV-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-DSH-01 — DASHBOARD                               │
// │ Deps: SCR-UTL-01 (formatCurrency), SCR-CFG-01 (appData)     │
// └──────────────────────────────────────────────────────────────┘
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
  const entregasPendentes = compras.filter(c => c.entrega === 'Pendente' || c.entrega === 'Não Entregue').length;

  // ── Salário Mensal por mês (descrição "Wander" = valor de 1 sócio) ──
  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const mesesLabel = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  // Calcular salário mensal: pega lançamentos com categoria "Salário" e descrição contendo "Wander", soma apenas o Wander (que é igual ao Daniel)
  let salarioMensalRows = '';
  let salarioAnualTotal = 0;
  let salarioAnualWander = 0;
  let salarioAnualDaniel = 0;

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


  // Fluxo mensal resumido
  let fluxoResumo = '';
  meses.forEach((m, i) => {
    const lancamentos = (appData.fluxoCaixa && appData.fluxoCaixa[m]) ? appData.fluxoCaixa[m] : [];
    const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + (l.valor || 0), 0);
    const saidas = lancamentos.filter(l => l.tipo === 'saida').reduce((s, l) => s + (l.valor || 0), 0);
    const saldo = entradas - saidas;
    const cor = saldo >= 0 ? 'text-success' : 'text-danger';
    fluxoResumo += '<tr onclick="navigateTo(\'' + m + '\')" style="cursor:pointer"><td>' + mesesLabel[i] + '</td><td class="text-success">' + formatCurrency(entradas) + '</td><td class="text-danger">' + formatCurrency(saidas) + '</td><td class="' + cor + '">' + formatCurrency(saldo) + '</td></tr>';
  });

  // Últimas vendas
  const ultVendas = vendas.slice(-5).reverse();
  let vendasRows = '';
  if (ultVendas.length === 0) {
    vendasRows = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma venda</td></tr>';
  } else {
    ultVendas.forEach(v => {
      vendasRows += '<tr><td>' + formatDate(v.data) + '</td><td>' + v.produto + '</td><td>' + formatCurrency((v.quantidade || 1) * (v.valorUnit || 0)) + '</td><td><span class="badge ' + (v.situacao === 'Pago' ? 'badge-success' : 'badge-danger') + '">' + v.situacao + '</span></td></tr>';
    });
  }

  // Últimas compras
  const ultCompras = compras.slice(-5).reverse();
  let comprasRows = '';
  if (ultCompras.length === 0) {
    comprasRows = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma compra</td></tr>';
  } else {
    ultCompras.forEach(c => {
      comprasRows += '<tr><td>' + formatDate(c.data) + '</td><td>' + c.produto + '</td><td>' + formatCurrency((c.quantidade || 1) * (c.valorUnit || 0)) + '</td><td><span class="badge ' + (c.situacao === 'Pago' ? 'badge-success' : c.situacao === 'Devendo' ? 'badge-danger' : 'badge-warning') + '">' + c.situacao + '</span></td></tr>';
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

    <!-- SALÁRIO MENSAL -->
    <div class="dashboard-grid" style="margin-bottom:20px">
    <div class="card" style="border-left:3px solid var(--warning)">
        <div class="card-header"><span>💰 Salário Wander (Anual)</span></div>
        <div class="card-value text-warning">${formatCurrency(salarioAnualWander)}</div>
      </div>
      <div class="card" style="border-left:3px solid var(--info)">
        <div class="card-header"><span>💰 Salário Daniel (Anual)</span></div>
        <div class="card-value text-info">${formatCurrency(salarioAnualDaniel)}</div>
      </div>
      <div class="card" style="border-left:3px solid var(--danger)">
        <div class="card-header"><span>💸 Salário Pago Total (Anual)</span></div>
        <div class="card-value text-danger">${formatCurrency(salarioAnualTotal)}</div>
        <div class="card-sub" style="color:var(--text-muted);font-size:.7rem;margin-top:4px">Wander + Daniel — todos os meses</div>
      </div>

        <div class="card-value text-warning">${formatCurrency(salarioAnualWander > 0 ? salarioAnualWander / meses.filter((m) => { const l = (appData.fluxoCaixa && appData.fluxoCaixa[m]) ? appData.fluxoCaixa[m] : []; return l.some(x => ((x.categoria||'').toLowerCase().includes('salário') || (x.categoria||'').toLowerCase().includes('salario')) && (x.descricao||'').toLowerCase().includes('wander')); }).length : 0)}</div>
        <div class="card-sub" style="color:var(--text-muted);font-size:.7rem;margin-top:4px">Valor por mês (apenas Wander)</div>
      </div>
      <div class="card" style="border-left:3px solid var(--danger)">
        <div class="card-header"><span>💸 Salário Pago Total (Anual)</span></div>
        <div class="card-value text-danger">${formatCurrency(salarioAnualTotal)}</div>
        <div class="card-sub" style="color:var(--text-muted);font-size:.7rem;margin-top:4px">Wander + Daniel — todos os meses</div>
      </div>
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
// └──────────────────── FIM SCR-DSH-01 ──────────────────────────┘


// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-FLX-01 — FLUXO DE CAIXA MENSAL (RENDERIZAÇÃO)    │
// │ Deps: SCR-UTL-01, SCR-CFG-01, SCR-FLX-02                    │
// └──────────────────────────────────────────────────────────────┘
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

  // Saldo anterior
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
  const saldoMes = totalEntradas - totalSaidas;
  const saldoFinal = saldoAnterior + saldoMes;

  const dinheiroNotas = lancamentos.filter(l => l.categoria === 'Dinheiro em Notas').reduce((s, l) => s + (l.valor || 0), 0);

  // Salário Pago Total = todos os lançamentos com categoria "Salário" (independente do tipo entrada/saida)
  const salarioLancs = lancamentos.filter(l => (l.categoria || '').toLowerCase().includes('salário') || (l.categoria || '').toLowerCase().includes('salario'));
  const salarioPagoTotal = salarioLancs.reduce((s, l) => s + (l.valor || 0), 0);

  // Salário Mensal (Wander) = apenas lançamentos de salário com descrição contendo "Wander"
  const salarioWander = salarioLancs.filter(l => (l.descricao || '').toLowerCase().includes('wander')).reduce((s, l) => s + (l.valor || 0), 0);
  const salarioDaniel = salarioLancs.filter(l => (l.descricao || '').toLowerCase().includes('daniel')).reduce((s, l) => s + (l.valor || 0), 0);

  // Filtros tipo
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
           <div class="card" style="border-left:3px solid var(--danger)">
        <div class="card-header"><span>Salário Pago Total</span></div>
        <div class="card-value text-danger">${formatCurrency(salarioPagoTotal)}</div>
        <div style="display:flex;align-items:center;gap:16px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color)">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Wander:</span>
            <span style="font-size:.95rem;font-weight:700;color:var(--warning)">${formatCurrency(salarioWander)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase">Daniel:</span>
            <span style="font-size:.95rem;font-weight:700;color:var(--warning)">${formatCurrency(salarioDaniel)}</span>
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
// └──────────────────── FIM SCR-FLX-01 ──────────────────────────┘


// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-FLX-02 — FLUXO DE CAIXA (CRUD)                   │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-FLX-01         │
// └──────────────────────────────────────────────────────────────┘
function renderFluxoTable(mesIdx) {
  const mesKey = mesesKeys[mesIdx];
  const tbody = document.getElementById('fluxoBody');
  if (!tbody) return;

  let lancamentos = (appData.fluxoCaixa && appData.fluxoCaixa[mesKey]) ? [...appData.fluxoCaixa[mesKey]] : [];

  // Filtrar por texto
  if (fluxoFilterText) {
    lancamentos = lancamentos.filter(l => (l.descricao || '').toLowerCase().includes(fluxoFilterText) || (l.categoria || '').toLowerCase().includes(fluxoFilterText));
  }

  // Filtrar por tipo
  if (fluxoFilterTipo) {
    if (fluxoFilterTipo === 'entrada' || fluxoFilterTipo === 'saida') {
      lancamentos = lancamentos.filter(l => l.tipo === fluxoFilterTipo);
    } else if (fluxoFilterTipo.includes(':')) {
      const parts = fluxoFilterTipo.split(':');
      lancamentos = lancamentos.filter(l => l.tipo === parts[0] && l.categoria === parts[1]);
    }
  }

  // Ordenar por data
  lancamentos.sort((a, b) => (a.data || '').localeCompare(b.data || ''));

  if (lancamentos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum lançamento</td></tr>';
    return;
  }

  tbody.innerHTML = lancamentos.map(l => {
    const isEntrada = l.tipo === 'entrada';
    return '<tr>' +
      '<td>' + formatDate(l.data) + '</td>' +
      '<td>' + (l.descricao || '-') + '</td>' +
      '<td>' + (l.categoria || '-') + '</td>' +
      '<td><span class="badge ' + (isEntrada ? 'badge-success' : 'badge-danger') + '">' + (isEntrada ? 'Entrada' : 'Saída') + '</span></td>' +
      '<td class="' + (isEntrada ? 'text-success' : 'text-danger') + '">' + formatCurrency(l.valor) + '</td>' +
      '<td><button class="btn btn-sm btn-primary" onclick="editLancamento(' + mesIdx + ',' + l.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteLancamento(' + mesIdx + ',' + l.id + ')">🗑️</button></td>' +
      '</tr>';
  }).join('');
}

function openLancamentoModal(mesIdx, lanc) {
  const isEdit = !!lanc;
  const mesKey = mesesKeys[mesIdx];
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

  // Atualizar visibilidade das categorias
  setTimeout(function() { updateFlxCatOptions(); }, 50);
}

function updateFlxCatOptions() {
  const tipo = document.getElementById('flxTipo').value;
  const catEntradas = document.getElementById('flxCatEntradas');
  const catSaidas = document.getElementById('flxCatSaidas');
  if (catEntradas) catEntradas.style.display = (tipo === 'entrada') ? '' : 'none';
  if (catSaidas) catSaidas.style.display = (tipo === 'saida') ? '' : 'none';
  // Selecionar primeira opção visível
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

  saveData();
  closeCadastroModal();
  renderFluxoMes(mesIdx);
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
  saveData();
  renderFluxoMes(mesIdx);
  showToast('Lançamento excluído!', 'success');
}
// └──────────────────── FIM SCR-FLX-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-CMP-01 — COMPRAS (PÁGINA + PAINEL)               │
// │ Deps: SCR-UTL-01, SCR-CFG-01, SCR-CMP-02, SCR-CMP-03       │
// └──────────────────────────────────────────────────────────────┘
function renderComprasPage() {
  const pg = document.getElementById('page-vendas');
  if (!pg) return;
  const compras = appData.compras || [];

  const total = compras.reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const pago = compras.filter(c => c.situacao === 'Pago').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const devendo = compras.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);

  const sitOpts = (appData.situacaoCompra || []).map(s => '<option value="' + s + '">' + s + '</option>').join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => '<option value="' + f + '">' + f + '</option>').join('');

    pg.innerHTML = `
    <div class="page-header">
      <h2>🛒 Compras</h2>
      <button class="btn btn-primary" onclick="openCompraModal()">+ Nova Compra</button>
    </div>
    <div class="dashboard-grid" id="comprasResultPanel">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">${formatCurrency(total)}</div><div class="card-sub">${compras.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(pago)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(devendo)}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar compra..." value="${comprasSearchQuery}" oninput="onComprasSearch(this.value)">
      <select class="form-control" style="max-width:150px" onchange="onComprasFilterSit(this.value)">
        <option value="">Todas situações</option>${sitOpts}
      </select>
      <select class="form-control" style="max-width:180px" onchange="onComprasFilterPgto(this.value)">
        <option value="">Todas formas pgto</option>${pgtoOpts}
      </select>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn btn-warning btn-sm" onclick="toggleComprasEditMode()" id="btnComprasEdit">✏️ Editar Todos</button>
      <button class="btn btn-danger btn-sm" onclick="deleteAllCompras()">🗑️ Excluir Todos</button>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Pgto</th><th>Situação</th><th>Entrega</th><th>Ações</th></tr></thead>
    <tbody id="comprasBody"></tbody></table></div>`;


  comprasSearchQuery = '';
  comprasFilterSit = '';
  comprasFilterPgto = '';
  renderComprasTable(compras);
}
// └──────────────────── FIM SCR-CMP-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-CMP-02 — COMPRAS (CRUD)                          │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CMP-01        │
// └──────────────────────────────────────────────────────────────┘
function renderComprasTable(compras) {
  const tbody = document.getElementById('comprasBody');
  if (!tbody) return;

  if (compras.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma compra encontrada</td></tr>';
    return;
  }

  const sitOpts = (appData.situacaoCompra || []);
  const entOpts = (appData.situacaoEntrega || []);

  tbody.innerHTML = compras.map(c => {
    const total = (c.quantidade || 1) * (c.valorUnit || 0);
    const sitBadge = c.situacao === 'Pago' ? 'badge-success' : c.situacao === 'Devendo' ? 'badge-danger' : 'badge-warning';
    const entBadge = c.entrega === 'Entregue OK' ? 'badge-success' : c.entrega === 'Entregue com Defeito' ? 'badge-danger' : c.entrega === 'Pendente' || c.entrega === 'Não Entregue' ? 'badge-warning' : 'badge-info';

    // Dropdown de situação
    const sitSelect = '<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeCompraField(' + c.id + ',\'situacao\',this.value)">' + sitOpts.map(s => '<option value="' + s + '"' + (c.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select>';

    // Dropdown de entrega
    const entSelect = '<select class="form-control" style="min-width:120px;padding:4px 6px;font-size:12px" onchange="changeCompraField(' + c.id + ',\'entrega\',this.value)">' + entOpts.map(e => '<option value="' + e + '"' + (c.entrega === e ? ' selected' : '') + '>' + e + '</option>').join('') + '</select>';

    const acoes = comprasEditMode
      ? '<button class="btn btn-sm btn-outline" onclick="viewCompra(' + c.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCompra(' + c.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCompra(' + c.id + ')">🗑️</button>'
      : '<button class="btn btn-sm btn-outline" onclick="viewCompra(' + c.id + ')">👁️</button>';

    return '<tr>' +
      '<td>' + formatDate(c.data) + '</td>' +
      '<td>' + (c.produto || '-') + '</td>' +
      '<td>' + (c.fornecedor || '-') + '</td>' +
      '<td>' + (c.quantidade || 1) + '</td>' +
      '<td>' + formatCurrency(c.valorUnit) + '</td>' +
      '<td>' + formatCurrency(total) + '</td>' +
      '<td>' + (c.formaPagamento || '-') + '</td>' +
      '<td>' + sitSelect + '</td>' +
      '<td>' + entSelect + '</td>' +
      '<td>' + acoes + '</td>' +
      '</tr>';
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
  const entOpts = (appData.situacaoEntrega || []).map(e => '<option value="' + e + '"' + (compra && compra.entrega === e ? ' selected' : '') + '>' + e + '</option>').join('');

  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Compra' : 'Nova Compra';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="cpData" value="${compra ? compra.data : new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="cpVenc" value="${compra ? compra.vencimento || '' : ''}"></div></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="cpProd" value="${compra ? compra.produto : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="cpQtd" value="${compra ? compra.quantidade : 1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="cpValor" value="${compra ? compra.valorUnit : ''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="cpForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="cpPgto"><option value="">Selecione...</option>${pgtoOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Situação</label><select class="form-control" id="cpSit">${sitOpts}</select></div><div class="form-group"><label>Entrega</label><select class="form-control" id="cpEnt">${entOpts}</select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="cpObs" rows="2">${compra ? compra.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCompra(' + (isEdit ? compra.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveCompra(id) {
  const obj = {
    data: document.getElementById('cpData').value,
    vencimento: document.getElementById('cpVenc').value,
    produto: document.getElementById('cpProd').value.trim(),
    quantidade: parseFloat(document.getElementById('cpQtd').value) || 1,
    valorUnit: parseFloat(document.getElementById('cpValor').value) || 0,
    fornecedor: document.getElementById('cpForn').value,
    formaPagamento: document.getElementById('cpPgto').value,
    situacao: document.getElementById('cpSit').value,
    entrega: document.getElementById('cpEnt').value,
    obs: document.getElementById('cpObs').value
  };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.compras) appData.compras = [];
  if (id) {
    const idx = appData.compras.findIndex(c => c.id === id);
    if (idx > -1) { obj.id = id; appData.compras[idx] = obj; }
  } else {
    obj.id = nextId(appData.compras);
    appData.compras.push(obj);
  }
  saveData(); closeCadastroModal(); renderComprasPage(); showToast(id ? 'Compra atualizada!' : 'Compra cadastrada!', 'success');
}

function editCompra(id) { const c = (appData.compras || []).find(x => x.id === id); if (c) openCompraModal(c); }

function viewCompra(id) {
  const c = (appData.compras || []).find(x => x.id === id); if (!c) return;
  const total = (c.quantidade || 1) * (c.valorUnit || 0);
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Compra';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Data</span>' + formatDate(c.data) + '</div><div class="detail-item"><span class="detail-label">Vencimento</span>' + formatDate(c.vencimento) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Produto</span>' + c.produto + '</div><div class="detail-item"><span class="detail-label">Qtd</span>' + c.quantidade + '</div>' +
    '<div class="detail-item"><span class="detail-label">V.Unit</span>' + formatCurrency(c.valorUnit) + '</div><div class="detail-item"><span class="detail-label">Total</span>' + formatCurrency(total) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Fornecedor</span>' + (c.fornecedor || '-') + '</div><div class="detail-item"><span class="detail-label">Pgto</span>' + (c.formaPagamento || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Situação</span><span class="badge ' + (c.situacao === 'Pago' ? 'badge-success' : 'badge-danger') + '">' + c.situacao + '</span></div>' +
    '<div class="detail-item"><span class="detail-label">Entrega</span><span class="badge ' + (c.entrega === 'Entregue OK' ? 'badge-success' : 'badge-warning') + '">' + (c.entrega || '-') + '</span></div>' +
    '</div>' + (c.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + c.obs + '</div>' : '');
  openViewModal();
}

function deleteCompra(id) {
  if (!confirm('Excluir compra?')) return;
  appData.compras = (appData.compras || []).filter(c => c.id !== id);
  saveData(); renderComprasPage(); showToast('Compra excluída!', 'success');
}
// └──────────────────── FIM SCR-CMP-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-CMP-03 — COMPRAS (FEATURES: EDIT ALL, FILTROS)   │
// │ Deps: SCR-CMP-01, SCR-CMP-02, SCR-DAT-02                   │
// └──────────────────────────────────────────────────────────────┘
function toggleComprasEditMode() {
  comprasEditMode = !comprasEditMode;
  const btn = document.getElementById('btnComprasEdit');
  if (btn) btn.textContent = comprasEditMode ? '✅ Finalizar Edição' : '✏️ Editar Todos';
  applyComprasFilters();
}

function deleteAllCompras() {
  if (!confirm('Tem certeza que deseja excluir TODAS as compras? Esta ação não pode ser desfeita.')) return;
  appData.compras = [];
  saveData(); renderComprasPage(); showToast('Todas as compras foram excluídas!', 'success');
}

function onComprasSearch(q) { comprasSearchQuery = q.toLowerCase(); applyComprasFilters(); }
function onComprasFilterSit(s) { comprasFilterSit = s; applyComprasFilters(); }
function onComprasFilterPgto(p) { comprasFilterPgto = p; applyComprasFilters(); }

function applyComprasFilters() {
  let filtered = appData.compras || [];
  if (comprasSearchQuery) {
    filtered = filtered.filter(c =>
      (c.produto || '').toLowerCase().includes(comprasSearchQuery) ||
      (c.fornecedor || '').toLowerCase().includes(comprasSearchQuery) ||
      (c.obs || '').toLowerCase().includes(comprasSearchQuery)
    );
  }
  if (comprasFilterSit) filtered = filtered.filter(c => c.situacao === comprasFilterSit);
  if (comprasFilterPgto) filtered = filtered.filter(c => c.formaPagamento === comprasFilterPgto);
  renderComprasTable(filtered);
  renderComprasResultPanel(filtered);
}

function renderComprasResultPanel(filtered) {
  const panel = document.getElementById('comprasResultPanel');
  if (!panel) return;
  const all = appData.compras || [];
  const total = filtered.reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const pago = filtered.filter(c => c.situacao === 'Pago').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const devendo = filtered.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);

  panel.innerHTML = `
    <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">${formatCurrency(total)}</div><div class="card-sub">${filtered.length} de ${all.length} registros</div></div>
    <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(pago)}</div></div>
    <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(devendo)}</div></div>`;
}
// └──────────────────── FIM SCR-CMP-03 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-VND-01 — VENDAS (PÁGINA + PAINEL)                │
// │ Deps: SCR-UTL-01, SCR-CFG-01, SCR-VND-02, SCR-VND-03       │
// └──────────────────────────────────────────────────────────────┘
function renderVendasPage() {
  const pg = document.getElementById('page-compras');
  if (!pg) return;
  const vendas = appData.vendas || [];

  const total = vendas.reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const recebido = vendas.filter(v => v.situacao === 'Pago').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const devendo = vendas.filter(v => v.situacao === 'Devendo').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);

  const sitOpts = (appData.situacaoVenda || []).map(s => '<option value="' + s + '">' + s + '</option>').join('');

    pg.innerHTML = `
    <div class="page-header">
      <h2>💰 Vendas</h2>
      <button class="btn btn-primary" onclick="openVendaModal()">+ Nova Venda</button>
    </div>
    <div class="dashboard-grid" id="vendasResultPanel">
      <div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">${formatCurrency(total)}</div><div class="card-sub">${vendas.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">${formatCurrency(recebido)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(devendo)}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar venda..." value="${vendasSearchQuery}" oninput="onVendasSearch(this.value)">
      <select class="form-control" style="max-width:150px" onchange="onVendasFilterSit(this.value)">
        <option value="">Todas situações</option>${sitOpts}
      </select>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn btn-warning btn-sm" onclick="toggleVendasEditMode()" id="btnVendasEdit">✏️ Editar Todos</button>
      <button class="btn btn-danger btn-sm" onclick="deleteAllVendas()">🗑️ Excluir Todos</button>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Pgto</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="vendasBody"></tbody></table></div>`;


  vendasSearchQuery = '';
  vendasFilterSit = '';
  renderVendasTable(vendas);
}
// └──────────────────── FIM SCR-VND-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-VND-02 — VENDAS (CRUD)                           │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-VND-01        │
// └──────────────────────────────────────────────────────────────┘
function renderVendasTable(vendas) {
  const tbody = document.getElementById('vendasBody');
  if (!tbody) return;

  if (vendas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma venda encontrada</td></tr>';
    return;
  }

  const sitOpts = (appData.situacaoVenda || appData.situacaoCompra || []);

  tbody.innerHTML = vendas.map(v => {
    const total = (v.quantidade || 1) * (v.valorUnit || 0);
    const sitSelect = '<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeVendaField(' + v.id + ',\'situacao\',this.value)">' + sitOpts.map(s => '<option value="' + s + '"' + (v.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select>';

    const acoes = vendasEditMode
      ? '<button class="btn btn-sm btn-outline" onclick="viewVenda(' + v.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editVenda(' + v.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteVenda(' + v.id + ')">🗑️</button>'
      : '<button class="btn btn-sm btn-outline" onclick="viewVenda(' + v.id + ')">👁️</button>';

    return '<tr>' +
      '<td>' + formatDate(v.data) + '</td>' +
      '<td>' + (v.produto || '-') + '</td>' +
      '<td>' + (v.cliente || '-') + '</td>' +
      '<td>' + (v.quantidade || 1) + '</td>' +
      '<td>' + formatCurrency(v.valorUnit) + '</td>' +
      '<td>' + formatCurrency(total) + '</td>' +
      '<td>' + (v.formaPagamento || '-') + '</td>' +
      '<td>' + sitSelect + '</td>' +
      '<td>' + acoes + '</td>' +
      '</tr>';
  }).join('');
}

function changeVendaField(id, field, value) {
  const v = (appData.vendas || []).find(x => x.id === id);
  if (v) { v[field] = value; saveData(); applyVendasFilters(); }
}

function openVendaModal(venda) {
  const isEdit = !!venda;
  const cliOpts = (appData.clientes || []).map(c => '<option value="' + c.nome + '"' + (venda && venda.cliente === c.nome ? ' selected' : '') + '>' + c.nome + '</option>').join('');
  const vendedorOpts = (appData.vendedores || []).map(v => '<option value="' + v + '"' + (venda && venda.vendedor === v ? ' selected' : '') + '>' + v + '</option>').join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => '<option value="' + f + '"' + (venda && venda.formaPagamento === f ? ' selected' : '') + '>' + f + '</option>').join('');
  const sitOpts = (appData.situacaoVenda || appData.situacaoCompra || []).map(s => '<option value="' + s + '"' + (venda && venda.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('');

  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Venda' : 'Nova Venda';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="vnData" value="${venda ? venda.data : new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="vnVenc" value="${venda ? venda.vencimento || '' : ''}"></div></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="vnProd" value="${venda ? venda.produto : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="vnQtd" value="${venda ? venda.quantidade : 1}" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="vnValor" value="${venda ? venda.valorUnit : ''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="vnCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Vendedor</label><select class="form-control" id="vnVend"><option value="">Selecione...</option>${vendedorOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="vnPgto"><option value="">Selecione...</option>${pgtoOpts}</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="vnSit">${sitOpts}</select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="vnObs" rows="2">${venda ? venda.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda(' + (isEdit ? venda.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveVenda(id) {
  const obj = {
    data: document.getElementById('vnData').value,
    vencimento: document.getElementById('vnVenc').value,
    produto: document.getElementById('vnProd').value.trim(),
    quantidade: parseFloat(document.getElementById('vnQtd').value) || 1,
    valorUnit: parseFloat(document.getElementById('vnValor').value) || 0,
    cliente: document.getElementById('vnCli').value,
    vendedor: document.getElementById('vnVend').value,
    formaPagamento: document.getElementById('vnPgto').value,
    situacao: document.getElementById('vnSit').value,
    obs: document.getElementById('vnObs').value
  };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.vendas) appData.vendas = [];
  if (id) {
    const idx = appData.vendas.findIndex(v => v.id === id);
    if (idx > -1) { obj.id = id; appData.vendas[idx] = obj; }
  } else {
    obj.id = nextId(appData.vendas);
    appData.vendas.push(obj);
  }
  saveData(); closeCadastroModal(); renderVendasPage(); showToast(id ? 'Venda atualizada!' : 'Venda cadastrada!', 'success');
}

function editVenda(id) { const v = (appData.vendas || []).find(x => x.id === id); if (v) openVendaModal(v); }

function viewVenda(id) {
  const v = (appData.vendas || []).find(x => x.id === id); if (!v) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Venda';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Data</span>' + formatDate(v.data) + '</div><div class="detail-item"><span class="detail-label">Vencimento</span>' + formatDate(v.vencimento) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Produto</span>' + v.produto + '</div><div class="detail-item"><span class="detail-label">Qtd</span>' + v.quantidade + '</div>' +
    '<div class="detail-item"><span class="detail-label">V.Unit</span>' + formatCurrency(v.valorUnit) + '</div><div class="detail-item"><span class="detail-label">Total</span>' + formatCurrency(v.quantidade * v.valorUnit) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Cliente</span>' + (v.cliente || '-') + '</div><div class="detail-item"><span class="detail-label">Vendedor</span>' + (v.vendedor || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Pgto</span>' + (v.formaPagamento || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Situação</span><span class="badge ' + (v.situacao === 'Pago' ? 'badge-success' : 'badge-danger') + '">' + v.situacao + '</span></div>' +
    '</div>' + (v.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + v.obs + '</div>' : '');
  openViewModal();
}

function deleteVenda(id) {
  if (!confirm('Excluir venda?')) return;
  appData.vendas = (appData.vendas || []).filter(v => v.id !== id);
  saveData(); renderVendasPage(); showToast('Venda excluída!', 'success');
}
// └──────────────────── FIM SCR-VND-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-VND-03 — VENDAS (FEATURES: EDIT ALL, FILTROS)    │
// │ Deps: SCR-VND-01, SCR-VND-02, SCR-DAT-02                   │
// └──────────────────────────────────────────────────────────────┘
function toggleVendasEditMode() {
  vendasEditMode = !vendasEditMode;
  const btn = document.getElementById('btnVendasEdit');
  if (btn) btn.textContent = vendasEditMode ? '✅ Finalizar Edição' : '✏️ Editar Todos';
  applyVendasFilters();
}

function deleteAllVendas() {
  if (!confirm('Tem certeza que deseja excluir TODAS as vendas? Esta ação não pode ser desfeita.')) return;
  appData.vendas = [];
  saveData(); renderVendasPage(); showToast('Todas as vendas foram excluídas!', 'success');
}

function onVendasSearch(q) { vendasSearchQuery = q.toLowerCase(); applyVendasFilters(); }
function onVendasFilterSit(s) { vendasFilterSit = s; applyVendasFilters(); }

function applyVendasFilters() {
  let filtered = appData.vendas || [];
  if (vendasSearchQuery) {
    filtered = filtered.filter(v =>
      (v.produto || '').toLowerCase().includes(vendasSearchQuery) ||
      (v.cliente || '').toLowerCase().includes(vendasSearchQuery) ||
      (v.obs || '').toLowerCase().includes(vendasSearchQuery)
    );
  }
  if (vendasFilterSit) filtered = filtered.filter(v => v.situacao === vendasFilterSit);
  renderVendasTable(filtered);
  renderVendasResultPanel(filtered);
}

function renderVendasResultPanel(filtered) {
  const panel = document.getElementById('vendasResultPanel');
  if (!panel) return;
  const all = appData.vendas || [];
  const total = filtered.reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const recebido = filtered.filter(v => v.situacao === 'Pago').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const devendo = filtered.filter(v => v.situacao === 'Devendo').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);

  panel.innerHTML = `
    <div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">${formatCurrency(total)}</div><div class="card-sub">${filtered.length} de ${all.length} registros</div></div>
    <div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">${formatCurrency(recebido)}</div></div>
    <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(devendo)}</div></div>`;
}
// └──────────────────── FIM SCR-VND-03 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-EST-01 — ESTOQUE (PÁGINA)                        │
// │ Deps: SCR-UTL-01, SCR-CFG-01, SCR-EST-02                    │
// └──────────────────────────────────────────────────────────────┘
function renderEstoquePage() {
  const pg = document.getElementById('page-estoque');
  if (!pg) return;
  const estoque = appData.estoque || [];
  const totalItens = estoque.reduce((s, e) => s + (e.quantidade || 0), 0);
  const totalValor = estoque.reduce((s, e) => s + ((e.quantidade || 0) * (e.valorUnit || 0)), 0);

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
// └──────────────────── FIM SCR-EST-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-EST-02 — ESTOQUE (CRUD)                          │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-EST-01        │
// └──────────────────────────────────────────────────────────────┘
function renderEstoqueTable(estoque) {
  const tbody = document.getElementById('estoqueBody');
  if (!tbody) return;
  if (estoque.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum item no estoque</td></tr>'; return; }
  tbody.innerHTML = estoque.map(e => '<tr>' +
    '<td>' + e.produto + '</td><td>' + e.quantidade + '</td><td>' + (e.unidade || '-') + '</td><td>' + formatCurrency(e.valorUnit) + '</td><td>' + formatCurrency((e.quantidade || 0) * (e.valorUnit || 0)) + '</td><td>' + (e.localizacao || '-') + '</td>' +
    '<td><button class="btn btn-sm btn-outline" onclick="viewEstoque(' + e.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editEstoque(' + e.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteEstoque(' + e.id + ')">🗑️</button></td></tr>').join('');
}

function filterEstoque(q) { q = q.toLowerCase(); renderEstoqueTable((appData.estoque || []).filter(e => (e.produto || '').toLowerCase().includes(q))); }

function openEstoqueModal(item) {
  const isEdit = !!item;
  const unOpts = (appData.tipoUnidade || []).map(u => '<option value="' + u + '"' + (item && item.unidade === u ? ' selected' : '') + '>' + u + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Item' : 'Novo Item';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="estProd" value="${item ? item.produto : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="estQtd" value="${item ? item.quantidade : 0}" min="0"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="estUn"><option value="">Selecione...</option>${unOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="estValor" value="${item ? item.valorUnit : ''}" step="0.01"></div><div class="form-group"><label>Localização</label><input type="text" class="form-control" id="estLoc" value="${item ? item.localizacao || '' : ''}"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="estObs" rows="2">${item ? item.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEstoque(' + (isEdit ? item.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveEstoque(id) {
  const obj = {
    produto: document.getElementById('estProd').value.trim(),
    quantidade: parseFloat(document.getElementById('estQtd').value) || 0,
    unidade: document.getElementById('estUn').value,
    valorUnit: parseFloat(document.getElementById('estValor').value) || 0,
    localizacao: document.getElementById('estLoc').value,
    obs: document.getElementById('estObs').value
  };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.estoque) appData.estoque = [];
  if (id) { const idx = appData.estoque.findIndex(e => e.id === id); if (idx > -1) { obj.id = id; appData.estoque[idx] = obj; } }
  else { obj.id = nextId(appData.estoque); appData.estoque.push(obj); }
  saveData(); closeCadastroModal(); renderEstoquePage(); showToast(id ? 'Item atualizado!' : 'Item cadastrado!', 'success');
}

function editEstoque(id) { const e = (appData.estoque || []).find(x => x.id === id); if (e) openEstoqueModal(e); }

function viewEstoque(id) {
  const e = (appData.estoque || []).find(x => x.id === id); if (!e) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes do Estoque';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Produto</span>' + e.produto + '</div><div class="detail-item"><span class="detail-label">Qtd</span>' + e.quantidade + '</div>' +
    '<div class="detail-item"><span class="detail-label">Unidade</span>' + (e.unidade || '-') + '</div><div class="detail-item"><span class="detail-label">V.Unit</span>' + formatCurrency(e.valorUnit) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Total</span>' + formatCurrency((e.quantidade || 0) * (e.valorUnit || 0)) + '</div><div class="detail-item"><span class="detail-label">Localização</span>' + (e.localizacao || '-') + '</div>' +
    '</div>' + (e.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + e.obs + '</div>' : '');
  openViewModal();
}

function deleteEstoque(id) { if (!confirm('Excluir item?')) return; appData.estoque = (appData.estoque || []).filter(e => e.id !== id); saveData(); renderEstoquePage(); showToast('Item excluído!', 'success'); }
// └──────────────────── FIM SCR-EST-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-PRD-01 — PRODUTOS (PÁGINA)                       │
// │ Deps: SCR-UTL-01, SCR-CFG-01, SCR-PRD-02                    │
// └──────────────────────────────────────────────────────────────┘
function renderProdutosPage() {
  const pg = document.getElementById('page-produtos');
  if (!pg) return;
  const prods = appData.produtos || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🏷️ Produtos</h2><button class="btn btn-primary" onclick="openProdutoModal()">+ Novo Produto</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto..." oninput="filterProdutos(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Categoria</th><th>Unidade</th><th>Preço Custo</th><th>Preço Venda</th><th>Ações</th></tr></thead>
    <tbody id="produtosBody"></tbody></table></div>`;
  renderProdutosTable(prods);
}
// └──────────────────── FIM SCR-PRD-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-PRD-02 — PRODUTOS (CRUD)                         │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-PRD-01        │
// └──────────────────────────────────────────────────────────────┘
function renderProdutosTable(prods) {
  const tbody = document.getElementById('produtosBody');
  if (!tbody) return;
  if (prods.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto</td></tr>'; return; }
  tbody.innerHTML = prods.map(p => '<tr><td>' + p.nome + '</td><td>' + (p.categoria || '-') + '</td><td>' + (p.unidade || '-') + '</td><td>' + formatCurrency(p.precoCusto) + '</td><td>' + formatCurrency(p.precoVenda) + '</td>' +
    '<td><button class="btn btn-sm btn-primary" onclick="editProduto(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProduto(' + p.id + ')">🗑️</button></td></tr>').join('');
}

function filterProdutos(q) { q = q.toLowerCase(); renderProdutosTable((appData.produtos || []).filter(p => (p.nome || '').toLowerCase().includes(q))); }

function openProdutoModal(prod) {
  const isEdit = !!prod;
  const unOpts = (appData.tipoUnidade || []).map(u => '<option value="' + u + '"' + (prod && prod.unidade === u ? ' selected' : '') + '>' + u + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Produto' : 'Novo Produto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prNome" value="${prod ? prod.nome : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="prCat" value="${prod ? prod.categoria || '' : ''}"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="prUn"><option value="">Selecione...</option>${unOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Preço Custo</label><input type="number" class="form-control" id="prCusto" value="${prod ? prod.precoCusto : ''}" step="0.01"></div><div class="form-group"><label>Preço Venda</label><input type="number" class="form-control" id="prVenda" value="${prod ? prod.precoVenda : ''}" step="0.01"></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="prObs" rows="2">${prod ? prod.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduto(' + (isEdit ? prod.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveProduto(id) {
  const obj = {
    nome: document.getElementById('prNome').value.trim(),
    categoria: document.getElementById('prCat').value,
    unidade: document.getElementById('prUn').value,
    precoCusto: parseFloat(document.getElementById('prCusto').value) || 0,
    precoVenda: parseFloat(document.getElementById('prVenda').value) || 0,
    obs: document.getElementById('prObs').value
  };
  if (!obj.nome) { showToast('Informe o nome', 'error'); return; }
  if (!appData.produtos) appData.produtos = [];
  if (id) { const idx = appData.produtos.findIndex(p => p.id === id); if (idx > -1) { obj.id = id; appData.produtos[idx] = obj; } }
  else { obj.id = nextId(appData.produtos); appData.produtos.push(obj); }
  saveData(); closeCadastroModal(); renderProdutosPage(); showToast(id ? 'Produto atualizado!' : 'Produto cadastrado!', 'success');
}

function editProduto(id) { const p = (appData.produtos || []).find(x => x.id === id); if (p) openProdutoModal(p); }
function deleteProduto(id) { if (!confirm('Excluir produto?')) return; appData.produtos = (appData.produtos || []).filter(p => p.id !== id); saveData(); renderProdutosPage(); showToast('Produto excluído!', 'success'); }
// └──────────────────── FIM SCR-PRD-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-CLI-01 — CLIENTES (PÁGINA)                       │
// │ Deps: SCR-UTL-01, SCR-CFG-01, SCR-CLI-02                    │
// └──────────────────────────────────────────────────────────────┘
function renderClientesPage() {
  const pg = document.getElementById('page-clientes');
  if (!pg) return;
  const clientes = appData.clientes || [];
  pg.innerHTML = `
    <div class="page-header"><h2>👥 Clientes</h2><button class="btn btn-primary" onclick="openClienteModal()">+ Novo Cliente</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cliente..." oninput="filterClientes(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Cidade</th><th>Ações</th></tr></thead>
    <tbody id="clientesBody"></tbody></table></div>`;
  renderClientesTable(clientes);
}
// └──────────────────── FIM SCR-CLI-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-CLI-02 — CLIENTES (CRUD)                         │
// │ Deps: SCR-UTL-01, SCR-UTL-02, SCR-DAT-02, SCR-UI-01        │
// └──────────────────────────────────────────────────────────────┘
function renderClientesTable(clientes) {
  const tbody = document.getElementById('clientesBody');
  if (!tbody) return;
  if (clientes.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cliente</td></tr>'; return; }
  tbody.innerHTML = clientes.map(c => '<tr><td>' + c.nome + '</td><td>' + (c.telefone || '-') + '</td><td>' + (c.email || '-') + '</td><td>' + (c.cidade || '-') + '</td>' +
    '<td><button class="btn btn-sm btn-outline" onclick="viewCliente(' + c.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCliente(' + c.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCliente(' + c.id + ')">🗑️</button></td></tr>').join('');
}

function filterClientes(q) { q = q.toLowerCase(); renderClientesTable((appData.clientes || []).filter(c => (c.nome || '').toLowerCase().includes(q) || (c.telefone || '').includes(q))); }

function openClienteModal(cli) {
  const isEdit = !!cli;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Cliente' : 'Novo Cliente';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="clNome" value="${cli ? cli.nome : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="clTelefone" value="${cli ? cli.telefone || '' : ''}"></div><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="clCelular" value="${cli ? cli.celular || '' : ''}"></div></div>
    <div class="form-row"><div class="form-group"><label>CPF</label><input type="text" class="form-control" id="clCpf" value="${cli ? cli.cpf || '' : ''}"></div><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="clCnpj" value="${cli ? cli.cnpj || '' : ''}"></div></div>
    <div class="form-group"><label>Email</label><input type="email" class="form-control" id="clEmail" value="${cli ? cli.email || '' : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="clCidade" value="${cli ? cli.cidade || '' : ''}"></div><div class="form-group"><label>Estado</label><input type="text" class="form-control" id="clEstado" value="${cli ? cli.estado || '' : ''}" maxlength="2"></div></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="clEnd" value="${cli ? cli.endereco || '' : ''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="clObs" rows="2">${cli ? cli.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCliente(' + (isEdit ? cli.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
  setTimeout(function() {
    applyMask('clTelefone', maskTelefone);
    applyMask('clCelular', maskTelefone);
    applyMask('clCpf', maskCPF);
    applyMask('clCnpj', maskCNPJ);
  }, 100);
}

function saveCliente(id) {
  const obj = {
    nome: document.getElementById('clNome').value.trim(),
    telefone: document.getElementById('clTelefone').value,
    celular: document.getElementById('clCelular').value,
    cpf: document.getElementById('clCpf').value,
    cnpj: document.getElementById('clCnpj').value,
    email: document.getElementById('clEmail').value,
    cidade: document.getElementById('clCidade').value,
    estado: document.getElementById('clEstado').value,
    endereco: document.getElementById('clEnd').value,
    obs: document.getElementById('clObs').value
  };
  if (!obj.nome) { showToast('Informe o nome', 'error'); return; }
  if (!appData.clientes) appData.clientes = [];
  if (id) { const idx = appData.clientes.findIndex(c => c.id === id); if (idx > -1) { obj.id = id; appData.clientes[idx] = obj; } }
  else { obj.id = nextId(appData.clientes); appData.clientes.push(obj); }
  saveData(); closeCadastroModal(); renderClientesPage(); showToast(id ? 'Cliente atualizado!' : 'Cliente cadastrado!', 'success');
}

function editCliente(id) { const c = (appData.clientes || []).find(x => x.id === id); if (c) openClienteModal(c); }

function viewCliente(id) {
  const c = (appData.clientes || []).find(x => x.id === id); if (!c) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes do Cliente';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Nome</span>' + c.nome + '</div><div class="detail-item"><span class="detail-label">Telefone</span>' + (c.telefone || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Celular</span>' + (c.celular || '-') + '</div><div class="detail-item"><span class="detail-label">CPF</span>' + (c.cpf || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">CNPJ</span>' + (c.cnpj || '-') + '</div><div class="detail-item"><span class="detail-label">Email</span>' + (c.email || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Cidade</span>' + (c.cidade || '-') + '</div><div class="detail-item"><span class="detail-label">Estado</span>' + (c.estado || '-') + '</div>' +
    '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Endereço</span>' + (c.endereco || '-') + '</div>' +
    '</div>' + (c.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + c.obs + '</div>' : '');
  openViewModal();
}

function deleteCliente(id) { if (!confirm('Excluir cliente?')) return; appData.clientes = (appData.clientes || []).filter(c => c.id !== id); saveData(); renderClientesPage(); showToast('Cliente excluído!', 'success'); }
// └──────────────────── FIM SCR-CLI-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-FOR-01 — FORNECEDORES (PÁGINA)                   │
// │ Deps: SCR-UTL-01, SCR-CFG-01, SCR-FOR-02                    │
// └──────────────────────────────────────────────────────────────┘
function renderFornecedoresPage() {
  const pg = document.getElementById('page-fornecedores');
  if (!pg) return;
  const forns = appData.fornecedores || [];
  pg.innerHTML = `
    <div class="page-header"><h2>🏭 Fornecedores</h2><button class="btn btn-primary" onclick="openFornecedorModal()">+ Novo Fornecedor</button></div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar fornecedor..." oninput="filterFornecedores(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Cidade</th><th>Ações</th></tr></thead>
    <tbody id="fornecedoresBody"></tbody></table></div>`;
  renderFornecedoresTable(forns);
}
// └──────────────────── FIM SCR-FOR-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-FOR-02 — FORNECEDORES (CRUD)                     │
// │ Deps: SCR-UTL-01, SCR-UTL-02, SCR-DAT-02, SCR-UI-01        │
// └──────────────────────────────────────────────────────────────┘
function renderFornecedoresTable(forns) {
  const tbody = document.getElementById('fornecedoresBody');
  if (!tbody) return;
  if (forns.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum fornecedor</td></tr>'; return; }
  tbody.innerHTML = forns.map(f => '<tr><td>' + f.nome + '</td><td>' + (f.telefone || '-') + '</td><td>' + (f.email || '-') + '</td><td>' + (f.cidade || '-') + '</td>' +
    '<td><button class="btn btn-sm btn-outline" onclick="viewFornecedor(' + f.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editFornecedor(' + f.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFornecedor(' + f.id + ')">🗑️</button></td></tr>').join('');
}

function filterFornecedores(q) { q = q.toLowerCase(); renderFornecedoresTable((appData.fornecedores || []).filter(f => (f.nome || '').toLowerCase().includes(q))); }

function openFornecedorModal(forn) {
  const isEdit = !!forn;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="fnNome" value="${forn ? forn.nome : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="fnTelefone" value="${forn ? forn.telefone || '' : ''}"></div><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="fnCelular" value="${forn ? forn.celular || '' : ''}"></div></div>
    <div class="form-row"><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="fnCnpj" value="${forn ? forn.cnpj || '' : ''}"></div><div class="form-group"><label>Email</label><input type="email" class="form-control" id="fnEmail" value="${forn ? forn.email || '' : ''}"></div></div>
    <div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="fnCidade" value="${forn ? forn.cidade || '' : ''}"></div><div class="form-group"><label>Estado</label><input type="text" class="form-control" id="fnEstado" value="${forn ? forn.estado || '' : ''}" maxlength="2"></div></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="fnEnd" value="${forn ? forn.endereco || '' : ''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="fnObs" rows="2">${forn ? forn.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFornecedor(' + (isEdit ? forn.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
  setTimeout(function() {
    applyMask('fnTelefone', maskTelefone);
    applyMask('fnCelular', maskTelefone);
    applyMask('fnCnpj', maskCNPJ);
  }, 100);
}

function saveFornecedor(id) {
  const obj = {
    nome: document.getElementById('fnNome').value.trim(),
    telefone: document.getElementById('fnTelefone').value,
    celular: document.getElementById('fnCelular').value,
    cnpj: document.getElementById('fnCnpj').value,
    email: document.getElementById('fnEmail').value,
    cidade: document.getElementById('fnCidade').value,
    estado: document.getElementById('fnEstado').value,
    endereco: document.getElementById('fnEnd').value,
    obs: document.getElementById('fnObs').value
  };
  if (!obj.nome) { showToast('Informe o nome', 'error'); return; }
  if (!appData.fornecedores) appData.fornecedores = [];
  if (id) { const idx = appData.fornecedores.findIndex(f => f.id === id); if (idx > -1) { obj.id = id; appData.fornecedores[idx] = obj; } }
  else { obj.id = nextId(appData.fornecedores); appData.fornecedores.push(obj); }
  saveData(); closeCadastroModal(); renderFornecedoresPage(); showToast(id ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!', 'success');
}

function editFornecedor(id) { const f = (appData.fornecedores || []).find(x => x.id === id); if (f) openFornecedorModal(f); }

function viewFornecedor(id) {
  const f = (appData.fornecedores || []).find(x => x.id === id); if (!f) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes do Fornecedor';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Nome</span>' + f.nome + '</div><div class="detail-item"><span class="detail-label">Telefone</span>' + (f.telefone || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Celular</span>' + (f.celular || '-') + '</div><div class="detail-item"><span class="detail-label">CNPJ</span>' + (f.cnpj || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Email</span>' + (f.email || '-') + '</div><div class="detail-item"><span class="detail-label">Cidade</span>' + (f.cidade || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Estado</span>' + (f.estado || '-') + '</div><div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Endereço</span>' + (f.endereco || '-') + '</div>' +
    '</div>' + (f.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + f.obs + '</div>' : '');
  openViewModal();
}

function deleteFornecedor(id) { if (!confirm('Excluir fornecedor?')) return; appData.fornecedores = (appData.fornecedores || []).filter(f => f.id !== id); saveData(); renderFornecedoresPage(); showToast('Fornecedor excluído!', 'success'); }
// └──────────────────── FIM SCR-FOR-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-PFR-01 — PRODUTOS DE FORNECEDORES (PÁGINA+CRUD)  │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// └──────────────────────────────────────────────────────────────┘
function renderPFornecedoresPage() {
  const pg = document.getElementById('page-pfornecedores');
  if (!pg) return;
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
  tbody.innerHTML = pf.map(p => '<tr><td>' + (p.fornecedor || '-') + '</td><td>' + p.produto + '</td><td>' + formatCurrency(p.preco) + '</td>' +
    '<td><button class="btn btn-sm btn-primary" onclick="editPFornecedor(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePFornecedor(' + p.id + ')">🗑️</button></td></tr>').join('');
}

function filterPFornecedores(q) { q = q.toLowerCase(); renderPFornecedoresTable((appData.pFornecedores || []).filter(p => (p.produto || '').toLowerCase().includes(q) || (p.fornecedor || '').toLowerCase().includes(q))); }

function openPFornecedorModal(pf) {
  const isEdit = !!pf;
  const fornOpts = (appData.fornecedores || []).map(f => '<option value="' + f.nome + '"' + (pf && pf.fornecedor === f.nome ? ' selected' : '') + '>' + f.nome + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar' : 'Novo Produto de Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Fornecedor</label><select class="form-control" id="pfForn"><option value="">Selecione...</option>${fornOpts}</select></div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="pfProd" value="${pf ? pf.produto : ''}"></div>
    <div class="form-group"><label>Preço</label><input type="number" class="form-control" id="pfPreco" value="${pf ? pf.preco : ''}" step="0.01"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pfObs" rows="2">${pf ? pf.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePFornecedor(' + (isEdit ? pf.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function savePFornecedor(id) {
  const obj = {
    fornecedor: document.getElementById('pfForn').value,
    produto: document.getElementById('pfProd').value.trim(),
    preco: parseFloat(document.getElementById('pfPreco').value) || 0,
    obs: document.getElementById('pfObs').value
  };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.pFornecedores) appData.pFornecedores = [];
  if (id) { const idx = appData.pFornecedores.findIndex(p => p.id === id); if (idx > -1) { obj.id = id; appData.pFornecedores[idx] = obj; } }
  else { obj.id = nextId(appData.pFornecedores); appData.pFornecedores.push(obj); }
  saveData(); closeCadastroModal(); renderPFornecedoresPage(); showToast(id ? 'Registro atualizado!' : 'Registro cadastrado!', 'success');
}

function editPFornecedor(id) { const p = (appData.pFornecedores || []).find(x => x.id === id); if (p) openPFornecedorModal(p); }
function deletePFornecedor(id) { if (!confirm('Excluir?')) return; appData.pFornecedores = (appData.pFornecedores || []).filter(p => p.id !== id); saveData(); renderPFornecedoresPage(); showToast('Registro excluído!', 'success'); }
// └──────────────────── FIM SCR-PFR-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-BOL-01 — BOLETOS (PÁGINA + CRUD)                 │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// └──────────────────────────────────────────────────────────────┘
function renderBoletosPage() {
  const pg = document.getElementById('page-boletos');
  if (!pg) return;
  const boletos = appData.boletos || [];
  const totalPend = boletos.filter(b => b.situacao !== 'Pago').reduce((s, b) => s + (b.valor || 0), 0);
  const totalPago = boletos.filter(b => b.situacao === 'Pago').reduce((s, b) => s + (b.valor || 0), 0);

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
        <option value="">Todas situações</option>${(appData.situacaoBoleto || []).map(s => '<option value="' + s + '">' + s + '</option>').join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Vencimento</th><th>Descrição</th><th>Valor</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="boletosBody"></tbody></table></div>`;
  renderBoletosTable(boletos);
}

function renderBoletosTable(boletos) {
  const tbody = document.getElementById('boletosBody');
  if (!tbody) return;
  if (boletos.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>'; return; }
  tbody.innerHTML = boletos.map(b => {
    const badge = b.situacao === 'Pago' ? 'badge-success' : b.situacao === 'Vencido' ? 'badge-danger' : 'badge-warning';
    return '<tr><td>' + formatDate(b.vencimento) + '</td><td>' + (b.descricao || '-') + '</td><td>' + formatCurrency(b.valor) + '</td>' +
      '<td><span class="badge ' + badge + '">' + b.situacao + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline" onclick="viewBoleto(' + b.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editBoleto(' + b.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBoleto(' + b.id + ')">🗑️</button></td></tr>';
  }).join('');
}

function filterBoletos(q) { q = q.toLowerCase(); renderBoletosTable((appData.boletos || []).filter(b => (b.descricao || '').toLowerCase().includes(q))); }
function filterBoletosSit(s) { renderBoletosTable(s ? (appData.boletos || []).filter(b => b.situacao === s) : (appData.boletos || [])); }

function openBoletoModal(bol) {
  const isEdit = !!bol;
  const sitOpts = (appData.situacaoBoleto || []).map(s => '<option value="' + s + '"' + (bol && bol.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Boleto' : 'Novo Boleto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="bolVenc" value="${bol ? bol.vencimento : ''}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="bolValor" value="${bol ? bol.valor : ''}" step="0.01"></div></div>
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="bolDesc" value="${bol ? bol.descricao : ''}"></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="bolSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="bolObs" rows="2">${bol ? bol.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBoleto(' + (isEdit ? bol.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveBoleto(id) {
  const obj = {
    vencimento: document.getElementById('bolVenc').value,
    valor: parseFloat(document.getElementById('bolValor').value) || 0,
    descricao: document.getElementById('bolDesc').value.trim(),
    situacao: document.getElementById('bolSit').value,
    obs: document.getElementById('bolObs').value
  };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.boletos) appData.boletos = [];
  if (id) { const idx = appData.boletos.findIndex(b => b.id === id); if (idx > -1) { obj.id = id; appData.boletos[idx] = obj; } }
  else { obj.id = nextId(appData.boletos); appData.boletos.push(obj); }
  saveData(); closeCadastroModal(); renderBoletosPage(); showToast(id ? 'Boleto atualizado!' : 'Boleto cadastrado!', 'success');
}

function editBoleto(id) { const b = (appData.boletos || []).find(x => x.id === id); if (b) openBoletoModal(b); }

function viewBoleto(id) {
  const b = (appData.boletos || []).find(x => x.id === id); if (!b) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes do Boleto';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Vencimento</span>' + formatDate(b.vencimento) + '</div><div class="detail-item"><span class="detail-label">Valor</span>' + formatCurrency(b.valor) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Descrição</span>' + b.descricao + '</div><div class="detail-item"><span class="detail-label">Situação</span><span class="badge ' + (b.situacao === 'Pago' ? 'badge-success' : 'badge-warning') + '">' + b.situacao + '</span></div>' +
    '</div>' + (b.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + b.obs + '</div>' : '');
  openViewModal();
}

function deleteBoleto(id) { if (!confirm('Excluir boleto?')) return; appData.boletos = (appData.boletos || []).filter(b => b.id !== id); saveData(); renderBoletosPage(); showToast('Boleto excluído!', 'success'); }
// └──────────────────── FIM SCR-BOL-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-CHQ-01 — CHEQUES (PÁGINA + CRUD)                 │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// └──────────────────────────────────────────────────────────────┘
function renderChequesPage() {
  const pg = document.getElementById('page-cheques');
  if (!pg) return;
  const cheques = appData.cheques || [];

  pg.innerHTML = `
    <div class="page-header"><h2>📝 Cheques</h2><button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button></div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cheque..." oninput="filterCheques(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterChequesSit(this.value)">
        <option value="">Todas situações</option>${(appData.situacaoCheque || []).map(s => '<option value="' + s + '">' + s + '</option>').join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nº</th><th>Data</th><th>Valor</th><th>Destino</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="chequesBody"></tbody></table></div>`;
  renderChequesTable(cheques);
}

function renderChequesTable(cheques) {
  const tbody = document.getElementById('chequesBody');
  if (!tbody) return;
  if (cheques.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>'; return; }
  tbody.innerHTML = cheques.map(c => '<tr><td>' + (c.numero || '-') + '</td><td>' + formatDate(c.data) + '</td><td>' + formatCurrency(c.valor) + '</td><td>' + (c.destino || '-') + '</td>' +
    '<td><span class="badge ' + (c.situacao === 'Compensado' ? 'badge-success' : 'badge-warning') + '">' + c.situacao + '</span></td>' +
    '<td><button class="btn btn-sm btn-primary" onclick="editCheque(' + c.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCheque(' + c.id + ')">🗑️</button></td></tr>').join('');
}

function filterCheques(q) { q = q.toLowerCase(); renderChequesTable((appData.cheques || []).filter(c => (c.destino || '').toLowerCase().includes(q) || (c.numero || '').toLowerCase().includes(q))); }
function filterChequesSit(s) { renderChequesTable(s ? (appData.cheques || []).filter(c => c.situacao === s) : (appData.cheques || [])); }

function openChequeModal(chq) {
  const isEdit = !!chq;
  const sitOpts = (appData.situacaoCheque || []).map(s => '<option value="' + s + '"' + (chq && chq.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Cheque' : 'Novo Cheque';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Nº Cheque</label><input type="text" class="form-control" id="chqNum" value="${chq ? chq.numero : ''}"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="chqData" value="${chq ? chq.data : new Date().toISOString().split('T')[0]}"></div></div>
    <div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="chqValor" value="${chq ? chq.valor : ''}" step="0.01"></div><div class="form-group"><label>Destino</label><input type="text" class="form-control" id="chqDest" value="${chq ? chq.destino || '' : ''}"></div></div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="chqSit">${sitOpts}</select></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="chqObs" rows="2">${chq ? chq.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCheque(' + (isEdit ? chq.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveCheque(id) {
  const obj = {
    numero: document.getElementById('chqNum').value,
    data: document.getElementById('chqData').value,
    valor: parseFloat(document.getElementById('chqValor').value) || 0,
    destino: document.getElementById('chqDest').value,
    situacao: document.getElementById('chqSit').value,
    obs: document.getElementById('chqObs').value
  };
  if (!appData.cheques) appData.cheques = [];
  if (id) { const idx = appData.cheques.findIndex(c => c.id === id); if (idx > -1) { obj.id = id; appData.cheques[idx] = obj; } }
  else { obj.id = nextId(appData.cheques); appData.cheques.push(obj); }
  saveData(); closeCadastroModal(); renderChequesPage(); showToast(id ? 'Cheque atualizado!' : 'Cheque cadastrado!', 'success');
}

function editCheque(id) { const c = (appData.cheques || []).find(x => x.id === id); if (c) openChequeModal(c); }
function deleteCheque(id) { if (!confirm('Excluir cheque?')) return; appData.cheques = (appData.cheques || []).filter(c => c.id !== id); saveData(); renderChequesPage(); showToast('Cheque excluído!', 'success'); }
// └──────────────────── FIM SCR-CHQ-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-PRS-01 — PRESTAÇÕES (PÁGINA + CRUD)              │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// └──────────────────────────────────────────────────────────────┘
function renderPrestacoesPage() {
  const pg = document.getElementById('page-prestacoes');
  if (!pg) return;
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
  if (prest.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma prestação</td></tr>'; return; }
  tbody.innerHTML = prest.map(p => '<tr><td>' + (p.descricao || '-') + '</td><td>' + (p.parcela || '-') + '</td><td>' + formatCurrency(p.valor) + '</td><td>' + formatDate(p.vencimento) + '</td>' +
    '<td><span class="badge ' + (p.situacao === 'Pago' ? 'badge-success' : 'badge-warning') + '">' + (p.situacao || 'Pendente') + '</span></td>' +
    '<td><button class="btn btn-sm btn-primary" onclick="editPrestacao(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePrestacao(' + p.id + ')">🗑️</button></td></tr>').join('');
}

function filterPrestacoes(q) { q = q.toLowerCase(); renderPrestacoesTable((appData.prestacoes || []).filter(p => (p.descricao || '').toLowerCase().includes(q))); }

function openPrestacaoModal(prest) {
  const isEdit = !!prest;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Prestação' : 'Nova Prestação';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="prstDesc" value="${prest ? prest.descricao : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Parcela</label><input type="text" class="form-control" id="prstParc" value="${prest ? prest.parcela || '' : ''}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prstValor" value="${prest ? prest.valor : ''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="prstVenc" value="${prest ? prest.vencimento : ''}"></div><div class="form-group"><label>Situação</label><select class="form-control" id="prstSit"><option value="Pendente" ${prest && prest.situacao === 'Pendente' ? 'selected' : ''}>Pendente</option><option value="Pago" ${prest && prest.situacao === 'Pago' ? 'selected' : ''}>Pago</option></select></div></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="prstObs" rows="2">${prest ? prest.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePrestacao(' + (isEdit ? prest.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function savePrestacao(id) {
  const obj = {
    descricao: document.getElementById('prstDesc').value.trim(),
    parcela: document.getElementById('prstParc').value,
    valor: parseFloat(document.getElementById('prstValor').value) || 0,
    vencimento: document.getElementById('prstVenc').value,
    situacao: document.getElementById('prstSit').value,
    obs: document.getElementById('prstObs').value
  };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.prestacoes) appData.prestacoes = [];
  if (id) { const idx = appData.prestacoes.findIndex(p => p.id === id); if (idx > -1) { obj.id = id; appData.prestacoes[idx] = obj; } }
  else { obj.id = nextId(appData.prestacoes); appData.prestacoes.push(obj); }
  saveData(); closeCadastroModal(); renderPrestacoesPage(); showToast(id ? 'Prestação atualizada!' : 'Prestação cadastrada!', 'success');
}

function editPrestacao(id) { const p = (appData.prestacoes || []).find(x => x.id === id); if (p) openPrestacaoModal(p); }
function deletePrestacao(id) { if (!confirm('Excluir prestação?')) return; appData.prestacoes = (appData.prestacoes || []).filter(p => p.id !== id); saveData(); renderPrestacoesPage(); showToast('Prestação excluída!', 'success'); }
// └──────────────────── FIM SCR-PRS-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-PRJ-01 — PROJETOS (PÁGINA + CRUD) ★ COMPLETADO   │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// │ Nota: Original estava INCOMPLETO — agora totalmente escrito  │
// └──────────────────────────────────────────────────────────────┘
function renderProjetosPage() {
  const pg = document.getElementById('page-projetos');
  if (!pg) return;
  const proj = appData.projetos || [];

  const totalValor = proj.reduce((s, p) => s + (p.valor || 0), 0);
  const emAndamento = proj.filter(p => p.status === 'Em Andamento').length;
  const concluidos = proj.filter(p => p.status === 'Concluído').length;

  pg.innerHTML = `
    <div class="page-header"><h2>📐 Projetos</h2><button class="btn btn-primary" onclick="openProjetoModal()">+ Novo Projeto</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Projetos</span></div><div class="card-value">${proj.length}</div></div>
      <div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value">${formatCurrency(totalValor)}</div></div>
      <div class="card"><div class="card-header"><span>Em Andamento</span></div><div class="card-value text-warning">${emAndamento}</div></div>
      <div class="card"><div class="card-header"><span>Concluídos</span></div><div class="card-value text-success">${concluidos}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar projeto..." oninput="filterProjetos(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Cliente</th><th>Valor</th><th>Início</th><th>Status</th><th>Ações</th></tr></thead>
    <tbody id="projetosBody"></tbody></table></div>`;
  renderProjetosTable(proj);
}

function renderProjetosTable(proj) {
  const tbody = document.getElementById('projetosBody');
  if (!tbody) return;
  if (proj.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum projeto</td></tr>'; return; }
  tbody.innerHTML = proj.map(p => {
    const badge = p.status === 'Concluído' ? 'badge-success' : p.status === 'Cancelado' ? 'badge-danger' : p.status === 'Em Andamento' ? 'badge-warning' : 'badge-info';
    return '<tr><td>' + (p.nome || '-') + '</td><td>' + (p.cliente || '-') + '</td><td>' + formatCurrency(p.valor) + '</td><td>' + formatDate(p.inicio) + '</td>' +
      '<td><span class="badge ' + badge + '">' + (p.status || 'Pendente') + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline" onclick="viewProjeto(' + p.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editProjeto(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProjeto(' + p.id + ')">🗑️</button></td></tr>';
  }).join('');
}

function filterProjetos(q) { q = q.toLowerCase(); renderProjetosTable((appData.projetos || []).filter(p => (p.nome || '').toLowerCase().includes(q) || (p.cliente || '').toLowerCase().includes(q))); }

function openProjetoModal(proj) {
  const isEdit = !!proj;
  const cliOpts = (appData.clientes || []).map(c => '<option value="' + c.nome + '"' + (proj && proj.cliente === c.nome ? ' selected' : '') + '>' + c.nome + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Projeto' : 'Novo Projeto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prjNome" value="${proj ? proj.nome : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="prjCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prjValor" value="${proj ? proj.valor : ''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Data Início</label><input type="date" class="form-control" id="prjInicio" value="${proj ? proj.inicio || '' : ''}"></div><div class="form-group"><label>Previsão Término</label><input type="date" class="form-control" id="prjFim" value="${proj ? proj.fim || '' : ''}"></div></div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="prjStatus">
        <option value="Pendente" ${proj && proj.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
        <option value="Em Andamento" ${proj && proj.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
        <option value="Concluído" ${proj && proj.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
        <option value="Cancelado" ${proj && proj.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
      </select>
    </div>
    <div class="form-group"><label>Descrição</label><textarea class="form-control" id="prjDesc" rows="3">${proj ? proj.descricao || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProjeto(' + (isEdit ? proj.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveProjeto(id) {
  const obj = {
    nome: document.getElementById('prjNome').value.trim(),
    cliente: document.getElementById('prjCli').value,
    valor: parseFloat(document.getElementById('prjValor').value) || 0,
    inicio: document.getElementById('prjInicio').value,
    fim: document.getElementById('prjFim').value,
    status: document.getElementById('prjStatus').value,
    descricao: document.getElementById('prjDesc').value
  };
  if (!obj.nome) { showToast('Informe o nome do projeto', 'error'); return; }
  if (!appData.projetos) appData.projetos = [];
  if (id) { const idx = appData.projetos.findIndex(p => p.id === id); if (idx > -1) { obj.id = id; appData.projetos[idx] = obj; } }
  else { obj.id = nextId(appData.projetos); appData.projetos.push(obj); }
  saveData(); closeCadastroModal(); renderProjetosPage(); showToast(id ? 'Projeto atualizado!' : 'Projeto cadastrado!', 'success');
}

function editProjeto(id) { const p = (appData.projetos || []).find(x => x.id === id); if (p) openProjetoModal(p); }

function viewProjeto(id) {
  const p = (appData.projetos || []).find(x => x.id === id); if (!p) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes do Projeto';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Nome</span>' + p.nome + '</div><div class="detail-item"><span class="detail-label">Cliente</span>' + (p.cliente || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Valor</span>' + formatCurrency(p.valor) + '</div><div class="detail-item"><span class="detail-label">Status</span><span class="badge ' + (p.status === 'Concluído' ? 'badge-success' : p.status === 'Cancelado' ? 'badge-danger' : 'badge-warning') + '">' + (p.status || 'Pendente') + '</span></div>' +
    '<div class="detail-item"><span class="detail-label">Início</span>' + formatDate(p.inicio) + '</div><div class="detail-item"><span class="detail-label">Previsão Término</span>' + formatDate(p.fim) + '</div>' +
    '</div>' + (p.descricao ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Descrição:</strong> ' + p.descricao + '</div>' : '');
  openViewModal();
}

function deleteProjeto(id) { if (!confirm('Excluir projeto?')) return; appData.projetos = (appData.projetos || []).filter(p => p.id !== id); saveData(); renderProjetosPage(); showToast('Projeto excluído!', 'success'); }
// └──────────────────── FIM SCR-PRJ-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-PGC-01 — PAG. CLIENTES (PÁGINA + CRUD) ★ NOVO    │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// │ Nota: Módulo NOVO — não existia no script.js original        │
// └──────────────────────────────────────────────────────────────┘
function renderPagClientesPage() {
  const pg = document.getElementById('page-pagclientes');
  if (!pg) return;
  const pags = appData.pagClientes || [];
  const totalRecebido = pags.filter(p => p.situacao === 'Recebido').reduce((s, p) => s + (p.valor || 0), 0);
  const totalPendente = pags.filter(p => p.situacao !== 'Recebido').reduce((s, p) => s + (p.valor || 0), 0);

  pg.innerHTML = `
    <div class="page-header"><h2>💵 Pagamentos de Clientes</h2><button class="btn btn-primary" onclick="openPagClienteModal()">+ Novo Pagamento</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Recebido</span></div><div class="card-value text-success">${formatCurrency(totalRecebido)}</div></div>
      <div class="card"><div class="card-header"><span>Total Pendente</span></div><div class="card-value text-warning">${formatCurrency(totalPendente)}</div></div>
      <div class="card"><div class="card-header"><span>Registros</span></div><div class="card-value">${pags.length}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar pagamento..." oninput="filterPagClientes(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterPagClientesSit(this.value)">
        <option value="">Todas situações</option>
        <option value="Recebido">Recebido</option>
        <option value="Pendente">Pendente</option>
        <option value="Atrasado">Atrasado</option>
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Cliente</th><th>Descrição</th><th>Valor</th><th>Forma Pgto</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="pagClientesBody"></tbody></table></div>`;
  renderPagClientesTable(pags);
}

function renderPagClientesTable(pags) {
  const tbody = document.getElementById('pagClientesBody');
  if (!tbody) return;
  if (pags.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum pagamento registrado</td></tr>'; return; }
  tbody.innerHTML = pags.map(p => {
    const badge = p.situacao === 'Recebido' ? 'badge-success' : p.situacao === 'Atrasado' ? 'badge-danger' : 'badge-warning';
    return '<tr><td>' + formatDate(p.data) + '</td><td>' + (p.cliente || '-') + '</td><td>' + (p.descricao || '-') + '</td><td>' + formatCurrency(p.valor) + '</td><td>' + (p.formaPagamento || '-') + '</td>' +
      '<td><span class="badge ' + badge + '">' + (p.situacao || 'Pendente') + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline" onclick="viewPagCliente(' + p.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editPagCliente(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePagCliente(' + p.id + ')">🗑️</button></td></tr>';
  }).join('');
}

function filterPagClientes(q) { q = q.toLowerCase(); renderPagClientesTable((appData.pagClientes || []).filter(p => (p.cliente || '').toLowerCase().includes(q) || (p.descricao || '').toLowerCase().includes(q))); }
function filterPagClientesSit(s) { renderPagClientesTable(s ? (appData.pagClientes || []).filter(p => p.situacao === s) : (appData.pagClientes || [])); }

function openPagClienteModal(pag) {
  const isEdit = !!pag;
  const cliOpts = (appData.clientes || []).map(c => '<option value="' + c.nome + '"' + (pag && pag.cliente === c.nome ? ' selected' : '') + '>' + c.nome + '</option>').join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => '<option value="' + f + '"' + (pag && pag.formaPagamento === f ? ' selected' : '') + '>' + f + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Pagamento' : 'Novo Pagamento de Cliente';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="pgcData" value="${pag ? pag.data : new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pgcValor" value="${pag ? pag.valor : ''}" step="0.01"></div></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="pgcCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="pgcPgto"><option value="">Selecione...</option>${pgtoOpts}</select></div></div>
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="pgcDesc" value="${pag ? pag.descricao : ''}"></div>
    <div class="form-group"><label>Situação</label>
      <select class="form-control" id="pgcSit">
        <option value="Pendente" ${pag && pag.situacao === 'Pendente' ? 'selected' : ''}>Pendente</option>
        <option value="Recebido" ${pag && pag.situacao === 'Recebido' ? 'selected' : ''}>Recebido</option>
        <option value="Atrasado" ${pag && pag.situacao === 'Atrasado' ? 'selected' : ''}>Atrasado</option>
      </select>
    </div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="pgcObs" rows="2">${pag ? pag.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePagCliente(' + (isEdit ? pag.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function savePagCliente(id) {
  const obj = {
    data: document.getElementById('pgcData').value,
    valor: parseFloat(document.getElementById('pgcValor').value) || 0,
    cliente: document.getElementById('pgcCli').value,
    formaPagamento: document.getElementById('pgcPgto').value,
    descricao: document.getElementById('pgcDesc').value.trim(),
    situacao: document.getElementById('pgcSit').value,
    obs: document.getElementById('pgcObs').value
  };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.pagClientes) appData.pagClientes = [];
  if (id) { const idx = appData.pagClientes.findIndex(p => p.id === id); if (idx > -1) { obj.id = id; appData.pagClientes[idx] = obj; } }
  else { obj.id = nextId(appData.pagClientes); appData.pagClientes.push(obj); }
  saveData(); closeCadastroModal(); renderPagClientesPage(); showToast(id ? 'Pagamento atualizado!' : 'Pagamento cadastrado!', 'success');
}

function editPagCliente(id) { const p = (appData.pagClientes || []).find(x => x.id === id); if (p) openPagClienteModal(p); }

function viewPagCliente(id) {
  const p = (appData.pagClientes || []).find(x => x.id === id); if (!p) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes do Pagamento';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Data</span>' + formatDate(p.data) + '</div><div class="detail-item"><span class="detail-label">Valor</span>' + formatCurrency(p.valor) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Cliente</span>' + (p.cliente || '-') + '</div><div class="detail-item"><span class="detail-label">Forma Pgto</span>' + (p.formaPagamento || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Descrição</span>' + p.descricao + '</div><div class="detail-item"><span class="detail-label">Situação</span><span class="badge ' + (p.situacao === 'Recebido' ? 'badge-success' : 'badge-warning') + '">' + (p.situacao || 'Pendente') + '</span></div>' +
    '</div>' + (p.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + p.obs + '</div>' : '');
  openViewModal();
}

function deletePagCliente(id) { if (!confirm('Excluir pagamento?')) return; appData.pagClientes = (appData.pagClientes || []).filter(p => p.id !== id); saveData(); renderPagClientesPage(); showToast('Pagamento excluído!', 'success'); }
// └──────────────────── FIM SCR-PGC-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-GAR-01 — GARANTIAS (PÁGINA + CRUD) ★ NOVO        │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// │ Nota: Módulo NOVO — não existia no script.js original        │
// └──────────────────────────────────────────────────────────────┘
function renderGarantiasPage() {
  const pg = document.getElementById('page-garantias');
  if (!pg) return;
  const garantias = appData.garantias || [];
  const ativas = garantias.filter(g => g.situacao === 'Ativa').length;
  const expiradas = garantias.filter(g => g.situacao === 'Expirada').length;

  pg.innerHTML = `
    <div class="page-header"><h2>🛡️ Garantias</h2><button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">${garantias.length}</div></div>
      <div class="card"><div class="card-header"><span>Ativas</span></div><div class="card-value text-success">${ativas}</div></div>
      <div class="card"><div class="card-header"><span>Expiradas</span></div><div class="card-value text-danger">${expiradas}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar garantia..." oninput="filterGarantias(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterGarantiasSit(this.value)">
        <option value="">Todas situações</option>${(appData.situacaoGarantia || []).map(s => '<option value="' + s + '">' + s + '</option>').join('')}
      </select>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Cliente</th><th>Início</th><th>Vencimento</th><th>Situação</th><th>Ações</th></tr></thead>
    <tbody id="garantiasBody"></tbody></table></div>`;
  renderGarantiasTable(garantias);
}

function renderGarantiasTable(garantias) {
  const tbody = document.getElementById('garantiasBody');
  if (!tbody) return;
  if (garantias.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>'; return; }
  tbody.innerHTML = garantias.map(g => {
    const badge = g.situacao === 'Ativa' ? 'badge-success' : g.situacao === 'Expirada' ? 'badge-danger' : 'badge-warning';
    return '<tr><td>' + (g.produto || '-') + '</td><td>' + (g.cliente || '-') + '</td><td>' + formatDate(g.inicio) + '</td><td>' + formatDate(g.vencimento) + '</td>' +
      '<td><span class="badge ' + badge + '">' + (g.situacao || 'Ativa') + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline" onclick="viewGarantia(' + g.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editGarantia(' + g.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGarantia(' + g.id + ')">🗑️</button></td></tr>';
  }).join('');
}

function filterGarantias(q) { q = q.toLowerCase(); renderGarantiasTable((appData.garantias || []).filter(g => (g.produto || '').toLowerCase().includes(q) || (g.cliente || '').toLowerCase().includes(q))); }
function filterGarantiasSit(s) { renderGarantiasTable(s ? (appData.garantias || []).filter(g => g.situacao === s) : (appData.garantias || [])); }

function openGarantiaModal(gar) {
  const isEdit = !!gar;
  const cliOpts = (appData.clientes || []).map(c => '<option value="' + c.nome + '"' + (gar && gar.cliente === c.nome ? ' selected' : '') + '>' + c.nome + '</option>').join('');
  const sitOpts = (appData.situacaoGarantia || []).map(s => '<option value="' + s + '"' + (gar && gar.situacao === s ? ' selected' : '') + '>' + s + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Garantia' : 'Nova Garantia';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="garProd" value="${gar ? gar.produto : ''}"></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="garCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="garSit">${sitOpts}</select></div></div>
    <div class="form-row"><div class="form-group"><label>Data Início</label><input type="date" class="form-control" id="garInicio" value="${gar ? gar.inicio || '' : ''}"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="garVenc" value="${gar ? gar.vencimento || '' : ''}"></div></div>
    <div class="form-group"><label>Nº Nota Fiscal</label><input type="text" class="form-control" id="garNota" value="${gar ? gar.notaFiscal || '' : ''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="garObs" rows="2">${gar ? gar.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGarantia(' + (isEdit ? gar.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveGarantia(id) {
  const obj = {
    produto: document.getElementById('garProd').value.trim(),
    cliente: document.getElementById('garCli').value,
    situacao: document.getElementById('garSit').value,
    inicio: document.getElementById('garInicio').value,
    vencimento: document.getElementById('garVenc').value,
    notaFiscal: document.getElementById('garNota').value,
    obs: document.getElementById('garObs').value
  };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.garantias) appData.garantias = [];
  if (id) { const idx = appData.garantias.findIndex(g => g.id === id); if (idx > -1) { obj.id = id; appData.garantias[idx] = obj; } }
  else { obj.id = nextId(appData.garantias); appData.garantias.push(obj); }
  saveData(); closeCadastroModal(); renderGarantiasPage(); showToast(id ? 'Garantia atualizada!' : 'Garantia cadastrada!', 'success');
}

function editGarantia(id) { const g = (appData.garantias || []).find(x => x.id === id); if (g) openGarantiaModal(g); }

function viewGarantia(id) {
  const g = (appData.garantias || []).find(x => x.id === id); if (!g) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Garantia';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Produto</span>' + g.produto + '</div><div class="detail-item"><span class="detail-label">Cliente</span>' + (g.cliente || '-') + '</div>' +
    '<div class="detail-item"><span class="detail-label">Início</span>' + formatDate(g.inicio) + '</div><div class="detail-item"><span class="detail-label">Vencimento</span>' + formatDate(g.vencimento) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Situação</span><span class="badge ' + (g.situacao === 'Ativa' ? 'badge-success' : 'badge-danger') + '">' + (g.situacao || 'Ativa') + '</span></div>' +
    '<div class="detail-item"><span class="detail-label">Nota Fiscal</span>' + (g.notaFiscal || '-') + '</div>' +
    '</div>' + (g.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + g.obs + '</div>' : '');
  openViewModal();
}

function deleteGarantia(id) { if (!confirm('Excluir garantia?')) return; appData.garantias = (appData.garantias || []).filter(g => g.id !== id); saveData(); renderGarantiasPage(); showToast('Garantia excluída!', 'success'); }
// └──────────────────── FIM SCR-GAR-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-REL-01 — RELATÓRIOS (PÁGINA) ★ NOVO              │
// │ Deps: SCR-UTL-01, SCR-CFG-01                                │
// │ Nota: Módulo NOVO — não existia no script.js original        │
// └──────────────────────────────────────────────────────────────┘
function renderRelatoriosPage() {
  const pg = document.getElementById('page-relatorios');
  if (!pg) return;

  const compras = appData.compras || [];
  const vendas = appData.vendas || [];
  const boletos = appData.boletos || [];
  const cheques = appData.cheques || [];
  const prestacoes = appData.prestacoes || [];
  const garantias = appData.garantias || [];
  const pagClientes = appData.pagClientes || [];

  const totalCompras = compras.reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const totalVendas = vendas.reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const lucro = totalVendas - totalCompras;

  const comprasPagas = compras.filter(c => c.situacao === 'Pago').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const comprasDevendo = compras.filter(c => c.situacao === 'Devendo').reduce((s, c) => s + ((c.quantidade || 1) * (c.valorUnit || 0)), 0);
  const vendasRecebidas = vendas.filter(v => v.situacao === 'Pago').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const vendasDevendo = vendas.filter(v => v.situacao === 'Devendo').reduce((s, v) => s + ((v.quantidade || 1) * (v.valorUnit || 0)), 0);
  const boletosPend = boletos.filter(b => b.situacao !== 'Pago').reduce((s, b) => s + (b.valor || 0), 0);
  const boletosPagos = boletos.filter(b => b.situacao === 'Pago').reduce((s, b) => s + (b.valor || 0), 0);
  const prestPend = prestacoes.filter(p => p.situacao !== 'Pago').reduce((s, p) => s + (p.valor || 0), 0);
  const prestPagas = prestacoes.filter(p => p.situacao === 'Pago').reduce((s, p) => s + (p.valor || 0), 0);
  const pgcRecebido = pagClientes.filter(p => p.situacao === 'Recebido').reduce((s, p) => s + (p.valor || 0), 0);
  const pgcPendente = pagClientes.filter(p => p.situacao !== 'Recebido').reduce((s, p) => s + (p.valor || 0), 0);
  const garantiasAtivas = garantias.filter(g => g.situacao === 'Ativa').length;

  // Fluxo anual
  const mesesKeys = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const mesesLabel = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  let fluxoRows = '';
  let totalEntradasAno = 0, totalSaidasAno = 0;
  mesesKeys.forEach((m, i) => {
    const lancs = (appData.fluxoCaixa && appData.fluxoCaixa[m]) ? appData.fluxoCaixa[m] : [];
    const ent = lancs.filter(l => l.tipo === 'entrada').reduce((s, l) => s + (l.valor || 0), 0);
    const sai = lancs.filter(l => l.tipo === 'saida').reduce((s, l) => s + (l.valor || 0), 0);
    totalEntradasAno += ent;
    totalSaidasAno += sai;
    const saldo = ent - sai;
    fluxoRows += '<tr><td>' + mesesLabel[i] + '</td><td class="text-success">' + formatCurrency(ent) + '</td><td class="text-danger">' + formatCurrency(sai) + '</td><td class="' + (saldo >= 0 ? 'text-success' : 'text-danger') + '">' + formatCurrency(saldo) + '</td></tr>';
  });
  fluxoRows += '<tr style="font-weight:bold;border-top:2px solid var(--accent-primary)"><td>TOTAL</td><td class="text-success">' + formatCurrency(totalEntradasAno) + '</td><td class="text-danger">' + formatCurrency(totalSaidasAno) + '</td><td class="' + ((totalEntradasAno - totalSaidasAno) >= 0 ? 'text-success' : 'text-danger') + '">' + formatCurrency(totalEntradasAno - totalSaidasAno) + '</td></tr>';

  pg.innerHTML = `
    <div class="page-header"><h2>📊 Relatórios Gerais</h2>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Imprimir</button>
    </div>

    <div class="section-title">Resumo Financeiro Anual</div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">${formatCurrency(totalCompras)}</div><div class="card-sub">${compras.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">${formatCurrency(totalVendas)}</div><div class="card-sub">${vendas.length} registros</div></div>
      <div class="card"><div class="card-header"><span>Lucro Bruto</span></div><div class="card-value ${lucro >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(lucro)}</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px">
      <div class="card">
        <div class="card-header"><span>Compras</span></div>
        <div style="padding:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Pagas:</span><span class="text-success">${formatCurrency(comprasPagas)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Devendo:</span><span class="text-danger">${formatCurrency(comprasDevendo)}</span></div>
          <div style="display:flex;justify-content:space-between"><span>Total:</span><strong>${formatCurrency(totalCompras)}</strong></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Vendas</span></div>
        <div style="padding:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Recebidas:</span><span class="text-success">${formatCurrency(vendasRecebidas)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Devendo:</span><span class="text-danger">${formatCurrency(vendasDevendo)}</span></div>
          <div style="display:flex;justify-content:space-between"><span>Total:</span><strong>${formatCurrency(totalVendas)}</strong></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Boletos</span></div>
        <div style="padding:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Pagos:</span><span class="text-success">${formatCurrency(boletosPagos)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Pendentes:</span><span class="text-warning">${formatCurrency(boletosPend)}</span></div>
          <div style="display:flex;justify-content:space-between"><span>Qtd:</span><strong>${boletos.length}</strong></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Outros</span></div>
        <div style="padding:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Prestações pendentes:</span><span class="text-warning">${formatCurrency(prestPend)}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Pag. Clientes pendente:</span><span class="text-warning">${formatCurrency(pgcPendente)}</span></div>
          <div style="display:flex;justify-content:space-between"><span>Garantias ativas:</span><strong>${garantiasAtivas}</strong></div>
        </div>
      </div>
    </div>

    <div class="section-title" style="margin-top:24px">Fluxo de Caixa Mensal — 2026</div>
    <div class="card">
      <div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead>
      <tbody>${fluxoRows}</tbody></table></div>
    </div>`;
}
// └──────────────────── FIM SCR-REL-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-NTE-01 — NOTAS DE ENTRADA (PÁGINA + CRUD) ★ NOVO │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// └──────────────────────────────────────────────────────────────┘
function renderNotasEntradaPage() {
  const pg = document.getElementById('page-notasentrada');
  if (!pg) return;
  const notas = appData.notasEntrada || [];
  const totalValor = notas.reduce((s, n) => s + (n.valor || 0), 0);

  pg.innerHTML = `
    <div class="page-header"><h2>📥 Notas de Entrada</h2><button class="btn btn-primary" onclick="openNotaEntradaModal()">+ Nova Nota</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Notas</span></div><div class="card-value">${notas.length}</div></div>
      <div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value">${formatCurrency(totalValor)}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar nota..." oninput="filterNotasEntrada(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nº Nota</th><th>Data</th><th>Fornecedor</th><th>Valor</th><th>Descrição</th><th>Ações</th></tr></thead>
    <tbody id="notasEntradaBody"></tbody></table></div>`;
  renderNotasEntradaTable(notas);
}

function renderNotasEntradaTable(notas) {
  const tbody = document.getElementById('notasEntradaBody');
  if (!tbody) return;
  if (notas.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota de entrada</td></tr>'; return; }
  tbody.innerHTML = notas.map(n => '<tr><td>' + (n.numero || '-') + '</td><td>' + formatDate(n.data) + '</td><td>' + (n.fornecedor || '-') + '</td><td>' + formatCurrency(n.valor) + '</td><td>' + (n.descricao || '-') + '</td>' +
    '<td><button class="btn btn-sm btn-outline" onclick="viewNotaEntrada(' + n.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editNotaEntrada(' + n.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada(' + n.id + ')">🗑️</button></td></tr>').join('');
}

function filterNotasEntrada(q) { q = q.toLowerCase(); renderNotasEntradaTable((appData.notasEntrada || []).filter(n => (n.descricao || '').toLowerCase().includes(q) || (n.numero || '').toLowerCase().includes(q) || (n.fornecedor || '').toLowerCase().includes(q))); }

function openNotaEntradaModal(nota) {
  const isEdit = !!nota;
  const fornOpts = (appData.fornecedores || []).map(f => '<option value="' + f.nome + '"' + (nota && nota.fornecedor === f.nome ? ' selected' : '') + '>' + f.nome + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Nota de Entrada' : 'Nova Nota de Entrada';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="neNum" value="${nota ? nota.numero || '' : ''}"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="neData" value="${nota ? nota.data : new Date().toISOString().split('T')[0]}"></div></div>
    <div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="neForn"><option value="">Selecione...</option>${fornOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="neValor" value="${nota ? nota.valor : ''}" step="0.01"></div></div>
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="neDesc" value="${nota ? nota.descricao : ''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="neObs" rows="2">${nota ? nota.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaEntrada(' + (isEdit ? nota.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveNotaEntrada(id) {
  const obj = {
    numero: document.getElementById('neNum').value,
    data: document.getElementById('neData').value,
    fornecedor: document.getElementById('neForn').value,
    valor: parseFloat(document.getElementById('neValor').value) || 0,
    descricao: document.getElementById('neDesc').value.trim(),
    obs: document.getElementById('neObs').value
  };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.notasEntrada) appData.notasEntrada = [];
  if (id) { const idx = appData.notasEntrada.findIndex(n => n.id === id); if (idx > -1) { obj.id = id; appData.notasEntrada[idx] = obj; } }
  else { obj.id = nextId(appData.notasEntrada); appData.notasEntrada.push(obj); }
  saveData(); closeCadastroModal(); renderNotasEntradaPage(); showToast(id ? 'Nota atualizada!' : 'Nota cadastrada!', 'success');
}

function editNotaEntrada(id) { const n = (appData.notasEntrada || []).find(x => x.id === id); if (n) openNotaEntradaModal(n); }

function viewNotaEntrada(id) {
  const n = (appData.notasEntrada || []).find(x => x.id === id); if (!n) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Nota de Entrada';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Nº Nota</span>' + (n.numero || '-') + '</div><div class="detail-item"><span class="detail-label">Data</span>' + formatDate(n.data) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Fornecedor</span>' + (n.fornecedor || '-') + '</div><div class="detail-item"><span class="detail-label">Valor</span>' + formatCurrency(n.valor) + '</div>' +
    '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Descrição</span>' + n.descricao + '</div>' +
    '</div>' + (n.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + n.obs + '</div>' : '');
  openViewModal();
}

function deleteNotaEntrada(id) { if (!confirm('Excluir nota?')) return; appData.notasEntrada = (appData.notasEntrada || []).filter(n => n.id !== id); saveData(); renderNotasEntradaPage(); showToast('Nota excluída!', 'success'); }
// └──────────────────── FIM SCR-NTE-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-NTS-01 — NOTAS DE SAÍDA (PÁGINA + CRUD) ★ NOVO   │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// └──────────────────────────────────────────────────────────────┘
function renderNotasSaidaPage() {
  const pg = document.getElementById('page-notassaida');
  if (!pg) return;
  const notas = appData.notasSaida || [];
  const totalValor = notas.reduce((s, n) => s + (n.valor || 0), 0);

  pg.innerHTML = `
    <div class="page-header"><h2>📤 Notas de Saída</h2><button class="btn btn-primary" onclick="openNotaSaidaModal()">+ Nova Nota</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Notas</span></div><div class="card-value">${notas.length}</div></div>
      <div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value">${formatCurrency(totalValor)}</div></div>
    </div>
    <div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar nota..." oninput="filterNotasSaida(this.value)"></div>
    <div class="table-responsive"><table class="table"><thead><tr><th>Nº Nota</th><th>Data</th><th>Cliente</th><th>Valor</th><th>Descrição</th><th>Ações</th></tr></thead>
    <tbody id="notasSaidaBody"></tbody></table></div>`;
  renderNotasSaidaTable(notas);
}

function renderNotasSaidaTable(notas) {
  const tbody = document.getElementById('notasSaidaBody');
  if (!tbody) return;
  if (notas.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota de saída</td></tr>'; return; }
  tbody.innerHTML = notas.map(n => '<tr><td>' + (n.numero || '-') + '</td><td>' + formatDate(n.data) + '</td><td>' + (n.cliente || '-') + '</td><td>' + formatCurrency(n.valor) + '</td><td>' + (n.descricao || '-') + '</td>' +
    '<td><button class="btn btn-sm btn-outline" onclick="viewNotaSaida(' + n.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editNotaSaida(' + n.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaSaida(' + n.id + ')">🗑️</button></td></tr>').join('');
}

function filterNotasSaida(q) { q = q.toLowerCase(); renderNotasSaidaTable((appData.notasSaida || []).filter(n => (n.descricao || '').toLowerCase().includes(q) || (n.numero || '').toLowerCase().includes(q) || (n.cliente || '').toLowerCase().includes(q))); }

function openNotaSaidaModal(nota) {
  const isEdit = !!nota;
  const cliOpts = (appData.clientes || []).map(c => '<option value="' + c.nome + '"' + (nota && nota.cliente === c.nome ? ' selected' : '') + '>' + c.nome + '</option>').join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Nota de Saída' : 'Nova Nota de Saída';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="nsNum" value="${nota ? nota.numero || '' : ''}"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="nsData" value="${nota ? nota.data : new Date().toISOString().split('T')[0]}"></div></div>
    <div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="nsCli"><option value="">Selecione...</option>${cliOpts}</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="nsValor" value="${nota ? nota.valor : ''}" step="0.01"></div></div>
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="nsDesc" value="${nota ? nota.descricao : ''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="nsObs" rows="2">${nota ? nota.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaSaida(' + (isEdit ? nota.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveNotaSaida(id) {
  const obj = {
    numero: document.getElementById('nsNum').value,
    data: document.getElementById('nsData').value,
    cliente: document.getElementById('nsCli').value,
    valor: parseFloat(document.getElementById('nsValor').value) || 0,
    descricao: document.getElementById('nsDesc').value.trim(),
    obs: document.getElementById('nsObs').value
  };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.notasSaida) appData.notasSaida = [];
  if (id) { const idx = appData.notasSaida.findIndex(n => n.id === id); if (idx > -1) { obj.id = id; appData.notasSaida[idx] = obj; } }
  else { obj.id = nextId(appData.notasSaida); appData.notasSaida.push(obj); }
  saveData(); closeCadastroModal(); renderNotasSaidaPage(); showToast(id ? 'Nota atualizada!' : 'Nota cadastrada!', 'success');
}

function editNotaSaida(id) { const n = (appData.notasSaida || []).find(x => x.id === id); if (n) openNotaSaidaModal(n); }

function viewNotaSaida(id) {
  const n = (appData.notasSaida || []).find(x => x.id === id); if (!n) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Nota de Saída';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid">' +
    '<div class="detail-item"><span class="detail-label">Nº Nota</span>' + (n.numero || '-') + '</div><div class="detail-item"><span class="detail-label">Data</span>' + formatDate(n.data) + '</div>' +
    '<div class="detail-item"><span class="detail-label">Cliente</span>' + (n.cliente || '-') + '</div><div class="detail-item"><span class="detail-label">Valor</span>' + formatCurrency(n.valor) + '</div>' +
    '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Descrição</span>' + n.descricao + '</div>' +
    '</div>' + (n.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + n.obs + '</div>' : '');
  openViewModal();
}

function deleteNotaSaida(id) { if (!confirm('Excluir nota?')) return; appData.notasSaida = (appData.notasSaida || []).filter(n => n.id !== id); saveData(); renderNotasSaidaPage(); showToast('Nota excluída!', 'success'); }
// └──────────────────── FIM SCR-NTS-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-RMI-01 — RECEITAS MEI (PÁGINA + CRUD) ★ NOVO     │
// │ Deps: SCR-UTL-01, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// └──────────────────────────────────────────────────────────────┘
function renderReceitasMeiPage() {
  const pg = document.getElementById('page-receitasmei');
  if (!pg) return;
  const receitas = appData.receitasMei || [];

  const mesesLabel = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const totalAnual = receitas.reduce((s, r) => s + (r.valor || 0), 0);
  const limite = 81000;
  const percentual = Math.min((totalAnual / limite) * 100, 100);

  // Agrupar por mês
  let porMes = {};
  receitas.forEach(r => {
    if (r.data) {
      const m = parseInt(r.data.split('-')[1]) - 1;
      if (!porMes[m]) porMes[m] = 0;
      porMes[m] += (r.valor || 0);
    }
  });

  let mesRows = '';
  for (let i = 0; i < 12; i++) {
    mesRows += '<tr><td>' + mesesLabel[i] + '</td><td>' + formatCurrency(porMes[i] || 0) + '</td></tr>';
  }

  pg.innerHTML = `
    <div class="page-header"><h2>📋 Receitas MEI</h2><button class="btn btn-primary" onclick="openReceitaMeiModal()">+ Nova Receita</button></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Receita Anual</span></div><div class="card-value">${formatCurrency(totalAnual)}</div></div>
      <div class="card"><div class="card-header"><span>Limite MEI</span></div><div class="card-value">${formatCurrency(limite)}</div></div>
      <div class="card"><div class="card-header"><span>Utilizado</span></div><div class="card-value ${percentual > 80 ? 'text-danger' : percentual > 50 ? 'text-warning' : 'text-success'}">${percentual.toFixed(1)}%</div></div>
      <div class="card"><div class="card-header"><span>Disponível</span></div><div class="card-value text-success">${formatCurrency(Math.max(0, limite - totalAnual))}</div></div>
    </div>

    <div class="progress-bar" style="margin:16px 0">
      <div style="width:${percentual}%;background:${percentual > 80 ? 'var(--danger)' : percentual > 50 ? 'var(--warning)' : 'var(--success)'};height:100%;border-radius:inherit;transition:width 0.5s"></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
      <div class="card">
        <div class="card-header"><span>Receita por Mês</span></div>
        <div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Valor</th></tr></thead><tbody>${mesRows}</tbody></table></div>
      </div>
      <div>
        <div class="filter-bar" style="margin-bottom:12px"><input type="text" class="form-control" placeholder="Buscar receita..." oninput="filterReceitasMei(this.value)"></div>
        <div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead>
        <tbody id="receitasMeiBody"></tbody></table></div>
      </div>
    </div>`;
  renderReceitasMeiTable(receitas);
}

function renderReceitasMeiTable(receitas) {
  const tbody = document.getElementById('receitasMeiBody');
  if (!tbody) return;
  if (receitas.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma receita</td></tr>'; return; }
  tbody.innerHTML = receitas.map(r => '<tr><td>' + formatDate(r.data) + '</td><td>' + (r.descricao || '-') + '</td><td>' + formatCurrency(r.valor) + '</td>' +
    '<td><button class="btn btn-sm btn-primary" onclick="editReceitaMei(' + r.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteReceitaMei(' + r.id + ')">🗑️</button></td></tr>').join('');
}

function filterReceitasMei(q) { q = q.toLowerCase(); renderReceitasMeiTable((appData.receitasMei || []).filter(r => (r.descricao || '').toLowerCase().includes(q))); }

function openReceitaMeiModal(rec) {
  const isEdit = !!rec;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Receita' : 'Nova Receita MEI';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="rmiData" value="${rec ? rec.data : new Date().toISOString().split('T')[0]}"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="rmiValor" value="${rec ? rec.valor : ''}" step="0.01"></div></div>
    <div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="rmiDesc" value="${rec ? rec.descricao : ''}"></div>
    <div class="form-group"><label>Nº Nota Fiscal</label><input type="text" class="form-control" id="rmiNota" value="${rec ? rec.notaFiscal || '' : ''}"></div>
    <div class="form-group"><label>Obs</label><textarea class="form-control" id="rmiObs" rows="2">${rec ? rec.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveReceitaMei(' + (isEdit ? rec.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveReceitaMei(id) {
  const obj = {
    data: document.getElementById('rmiData').value,
    valor: parseFloat(document.getElementById('rmiValor').value) || 0,
    descricao: document.getElementById('rmiDesc').value.trim(),
    notaFiscal: document.getElementById('rmiNota').value,
    obs: document.getElementById('rmiObs').value
  };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.receitasMei) appData.receitasMei = [];
  if (id) { const idx = appData.receitasMei.findIndex(r => r.id === id); if (idx > -1) { obj.id = id; appData.receitasMei[idx] = obj; } }
  else { obj.id = nextId(appData.receitasMei); appData.receitasMei.push(obj); }
  saveData(); closeCadastroModal(); renderReceitasMeiPage(); showToast(id ? 'Receita atualizada!' : 'Receita cadastrada!', 'success');
}

function editReceitaMei(id) { const r = (appData.receitasMei || []).find(x => x.id === id); if (r) openReceitaMeiModal(r); }
function deleteReceitaMei(id) { if (!confirm('Excluir receita?')) return; appData.receitasMei = (appData.receitasMei || []).filter(r => r.id !== id); saveData(); renderReceitasMeiPage(); showToast('Receita excluída!', 'success'); }
// └──────────────────── FIM SCR-RMI-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-SYS-01 — CONFIGURAÇÕES (PÁGINA) ★ NOVO           │
// │ Deps: SCR-UTL-02, SCR-DAT-02, SCR-UI-01, SCR-CFG-01        │
// └──────────────────────────────────────────────────────────────┘
function renderConfiguracoesPage() {
  const pg = document.getElementById('page-configuracoes');
  if (!pg) return;
  const emp = appData.empresa || {};

  pg.innerHTML = `
    <div class="page-header"><h2>⚙️ Configurações</h2></div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><span>Dados da Empresa</span></div>
      <div style="padding:20px">
        <div class="form-group">
          <label>Logo da Empresa</label>
          <div class="logo-upload-area" onclick="document.getElementById('cfgLogoInput').click()" style="cursor:pointer">
            ${emp.logo ? '<img src="' + emp.logo + '" style="max-width:120px;max-height:120px;border-radius:8px">' : '<span style="color:var(--text-muted)">Clique para enviar logo</span>'}
            <input type="file" id="cfgLogoInput" accept="image/*" style="display:none" onchange="handleLogoUpload(event)">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Nome da Empresa</label><input type="text" class="form-control" id="cfgNome" value="${emp.nome || ''}"></div>
          <div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="${emp.cnpj || ''}"></div>
        </div>
        <button class="btn btn-primary" onclick="saveConfiguracoes()">Salvar Configurações</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><span>Vendedores</span></div>
      <div style="padding:20px">
        <div id="cfgVendedoresList">${(appData.vendedores || []).map((v, i) => '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:center"><input type="text" class="form-control" value="' + v + '" id="cfgVend' + i + '" style="max-width:250px"><button class="btn btn-sm btn-danger" onclick="removeVendedor(' + i + ')">🗑️</button></div>').join('')}</div>
        <div style="display:flex;gap:8px;margin-top:8px"><input type="text" class="form-control" id="cfgNovoVend" placeholder="Nome do vendedor" style="max-width:250px"><button class="btn btn-sm btn-primary" onclick="addVendedor()">+ Adicionar</button></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span>Formas de Pagamento</span></div>
      <div style="padding:20px">
        <div id="cfgPgtoList">${(appData.formasPagamento || []).map((f, i) => '<span class="badge badge-info" style="margin:4px;padding:6px 12px;font-size:12px">' + f + ' <button style="background:none;border:none;color:inherit;cursor:pointer;font-size:14px" onclick="removePgto(' + i + ')">×</button></span>').join('')}</div>
        <div style="display:flex;gap:8px;margin-top:12px"><input type="text" class="form-control" id="cfgNovoPgto" placeholder="Nova forma de pagamento" style="max-width:250px"><button class="btn btn-sm btn-primary" onclick="addPgto()">+ Adicionar</button></div>
      </div>
    </div>`;

  setTimeout(function() { applyMask('cfgCnpj', maskCNPJ); }, 100);
}

function saveConfiguracoes() {
  if (!appData.empresa) appData.empresa = {};
  appData.empresa.nome = document.getElementById('cfgNome').value.trim();
  appData.empresa.cnpj = document.getElementById('cfgCnpj').value.trim();

  // Salvar vendedores editados
  const vendList = document.querySelectorAll('[id^="cfgVend"]');
  const novosVend = [];
  vendList.forEach(el => { if (el.value.trim()) novosVend.push(el.value.trim()); });
  appData.vendedores = novosVend;

  saveData();
  updateSidebarInfo();
  showToast('Configurações salvas!', 'success');
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!appData.empresa) appData.empresa = {};
    appData.empresa.logo = e.target.result;
    saveData();
    updateSidebarInfo();
    renderConfiguracoesPage();
    showToast('Logo atualizado!', 'success');
  };
  reader.readAsDataURL(file);
}

function addVendedor() {
  const input = document.getElementById('cfgNovoVend');
  const nome = input.value.trim();
  if (!nome) { showToast('Informe o nome', 'error'); return; }
  if (!appData.vendedores) appData.vendedores = [];
  appData.vendedores.push(nome);
  saveData(); renderConfiguracoesPage(); showToast('Vendedor adicionado!', 'success');
}

function removeVendedor(idx) {
  if (!confirm('Remover vendedor?')) return;
  appData.vendedores.splice(idx, 1);
  saveData(); renderConfiguracoesPage(); showToast('Vendedor removido!', 'success');
}

function addPgto() {
  const input = document.getElementById('cfgNovoPgto');
  const nome = input.value.trim();
  if (!nome) { showToast('Informe a forma de pagamento', 'error'); return; }
  if (!appData.formasPagamento) appData.formasPagamento = [];
  appData.formasPagamento.push(nome);
  saveData(); renderConfiguracoesPage(); showToast('Forma de pagamento adicionada!', 'success');
}

function removePgto(idx) {
  if (!confirm('Remover forma de pagamento?')) return;
  appData.formasPagamento.splice(idx, 1);
  saveData(); renderConfiguracoesPage(); showToast('Forma removida!', 'success');
}
// └──────────────────── FIM SCR-SYS-01 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-SYS-02 — BACKUP (PÁGINA) ★ NOVO                  │
// │ Deps: SCR-DAT-02, SCR-UI-01, SCR-CFG-01                     │
// └──────────────────────────────────────────────────────────────┘
function renderBackupPage() {
  const pg = document.getElementById('page-backup');
  if (!pg) return;

  const dataSize = JSON.stringify(appData).length;
  const dataSizeKB = (dataSize / 1024).toFixed(1);

  pg.innerHTML = `
    <div class="page-header"><h2>💾 Backup e Restauração</h2></div>

    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Tamanho dos Dados</span></div><div class="card-value">${dataSizeKB} KB</div></div>
      <div class="card"><div class="card-header"><span>Registros Totais</span></div><div class="card-value">${
        (appData.compras||[]).length + (appData.vendas||[]).length + (appData.clientes||[]).length +
        (appData.fornecedores||[]).length + (appData.produtos||[]).length + (appData.estoque||[]).length +
        (appData.boletos||[]).length + (appData.cheques||[]).length + (appData.prestacoes||[]).length +
        (appData.projetos||[]).length + (appData.pagClientes||[]).length + (appData.garantias||[]).length +
        (appData.notasEntrada||[]).length + (appData.notasSaida||[]).length + (appData.receitasMei||[]).length
      }</div></div>
      <div class="card"><div class="card-header"><span>Armazenamento</span></div><div class="card-value">${supabaseClient ? 'Supabase + Local' : 'LocalStorage'}</div></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
      <div class="card">
        <div class="card-header"><span>Exportar Backup</span></div>
        <div style="padding:20px">
          <p style="color:var(--text-secondary);margin-bottom:16px">Baixe um arquivo JSON com todos os seus dados. Guarde em local seguro.</p>
          <button class="btn btn-primary" onclick="exportBackup()" style="width:100%">📥 Exportar Dados (JSON)</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span>Importar Backup</span></div>
        <div style="padding:20px">
          <p style="color:var(--text-secondary);margin-bottom:16px">Restaure seus dados a partir de um arquivo JSON exportado anteriormente.</p>
          <button class="btn btn-warning" onclick="document.getElementById('backupFileInput').click()" style="width:100%">📤 Importar Dados (JSON)</button>
          <input type="file" id="backupFileInput" accept=".json" style="display:none" onchange="importBackup(event)">
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-header"><span style="color:var(--danger)">Zona de Perigo</span></div>
      <div style="padding:20px">
        <p style="color:var(--text-secondary);margin-bottom:16px">Apagar TODOS os dados e restaurar para o estado inicial. Esta ação é irreversível!</p>
        <button class="btn btn-danger" onclick="resetAllData()">🗑️ Resetar Todos os Dados</button>
      </div>
    </div>`;
}

function exportBackup() {
  try {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const hoje = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = 'wdmaquinas_backup_' + hoje + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso!', 'success');
  } catch (e) {
    showToast('Erro ao exportar: ' + e.message, 'error');
  }
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!confirm('Importar backup substituirá TODOS os dados atuais. Deseja continuar?')) { event.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && typeof imported === 'object') {
        appData = imported;
        ensureDefaults();
        saveData();
        renderDashboard();
        updateSidebarInfo();
        renderBackupPage();
        showToast('Backup importado com sucesso!', 'success');
      } else {
        showToast('Arquivo inválido', 'error');
      }
    } catch (err) {
      showToast('Erro ao ler arquivo: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function resetAllData() {
  if (!confirm('ATENÇÃO: Todos os dados serão apagados permanentemente!\n\nDeseja continuar?')) return;
  if (!confirm('ÚLTIMA CHANCE: Tem certeza absoluta? Recomendamos exportar um backup antes.')) return;
  appData = getDefaultData();
  saveData();
  renderDashboard();
  updateSidebarInfo();
  navigateTo('dashboard');
  showToast('Todos os dados foram resetados!', 'success');
}
// └──────────────────── FIM SCR-SYS-02 ──────────────────────────┘

// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-SYS-01 — CONFIGURAÇÕES (COMPLETO)                │
// │ Deps: SCR-CFG-01, SCR-DAT-02, SCR-UI-01, SCR-UTL-02        │
// └──────────────────────────────────────────────────────────────┘
function renderConfiguracoesPage() {
  const pg = document.getElementById('page-configuracoes');
  if (!pg) return;

  // === VENDEDORES ===
  const vendedoresHTML = (appData.vendedores || []).map((v, i) => `
    <div class="cfg-drag-item" draggable="true" data-type="vendedor" data-index="${i}">
      <span class="cfg-drag-handle" title="Arraste para reordenar">⠿</span>
      <input type="text" class="form-control cfg-inline-input" value="${v}" onchange="cfgUpdateVendedor(${i}, this.value)">
      <button class="btn btn-sm btn-danger" onclick="cfgRemoveVendedor(${i})" title="Excluir">✕</button>
    </div>
  `).join('');

  // === FORMAS DE PAGAMENTO ===
  const pgtoHTML = (appData.formasPagamento || []).map((f, i) => `
    <div class="cfg-drag-item" draggable="true" data-type="formapgto" data-index="${i}">
      <span class="cfg-drag-handle" title="Arraste para reordenar">⠿</span>
      <span class="cfg-tag-text">${f}</span>
      <button class="btn-tag-remove" onclick="cfgRemoveFormaPgto(${i})" title="Excluir">✕</button>
    </div>
  `).join('');

  // === CATEGORIAS ENTRADA ===
  const catsEntrada = (appData.categoriasFluxo || []).filter(c => c.tipo === 'entrada');
  const catsEntradaHTML = catsEntrada.map((c, i) => {
    const realIdx = appData.categoriasFluxo.indexOf(c);
    return `
    <div class="cfg-drag-item cfg-cat-entrada" draggable="true" data-type="catentrada" data-index="${realIdx}">
      <span class="cfg-drag-handle" title="Arraste para reordenar">⠿</span>
      <span class="cfg-cat-badge badge-success">▲ ENTRADA</span>
      <input type="text" class="form-control cfg-inline-input" value="${c.nome}" onchange="cfgUpdateCategoria(${realIdx}, this.value)">
      <button class="btn btn-sm btn-danger" onclick="cfgRemoveCategoria(${realIdx})" title="Excluir">✕</button>
    </div>`;
  }).join('');

  // === CATEGORIAS SAÍDA ===
  const catsSaida = (appData.categoriasFluxo || []).filter(c => c.tipo === 'saida');
  const catsSaidaHTML = catsSaida.map((c, i) => {
    const realIdx = appData.categoriasFluxo.indexOf(c);
    return `
    <div class="cfg-drag-item cfg-cat-saida" draggable="true" data-type="catsaida" data-index="${realIdx}">
      <span class="cfg-drag-handle" title="Arraste para reordenar">⠿</span>
      <span class="cfg-cat-badge badge-danger">▼ SAÍDA</span>
      <input type="text" class="form-control cfg-inline-input" value="${c.nome}" onchange="cfgUpdateCategoria(${realIdx}, this.value)">
      <button class="btn btn-sm btn-danger" onclick="cfgRemoveCategoria(${realIdx})" title="Excluir">✕</button>
    </div>`;
  }).join('');

  pg.innerHTML = `
    <div class="page-header"><h2>⚙️ Configurações</h2></div>

    <!-- DADOS DA EMPRESA -->
    <div class="cfg-section">
      <div class="cfg-section-header">
        <span class="cfg-section-icon">🏢</span>
        <h3>Dados da Empresa</h3>
      </div>
      <div class="cfg-section-body">
        <div class="form-row">
          <div class="form-group">
            <label>Nome da Empresa</label>
            <input type="text" class="form-control" id="cfgNome" value="${appData.empresa?.nome || 'WD Máquinas'}" onchange="cfgSaveEmpresa()">
          </div>
          <div class="form-group">
            <label>CNPJ</label>
            <input type="text" class="form-control" id="cfgCnpj" value="${appData.empresa?.cnpj || ''}" onchange="cfgSaveEmpresa()">
          </div>
        </div>
        <div class="form-group">
          <label>Logo da Empresa</label>
          <div class="logo-upload-area" onclick="document.getElementById('cfgLogoInput').click()">
            ${appData.empresa?.logo ? '<img src="' + appData.empresa.logo + '" alt="Logo">' : '<div class="upload-text">📷 Clique para enviar logo</div><div class="upload-hint">PNG, JPG — max 200×80px recomendado</div>'}
            <input type="file" id="cfgLogoInput" accept="image/*" style="display:none" onchange="cfgUploadLogo(this)">
          </div>
        </div>
      </div>
    </div>

    <!-- VENDEDORES -->
    <div class="cfg-section">
      <div class="cfg-section-header">
        <span class="cfg-section-icon">👤</span>
        <h3>Vendedores</h3>
      </div>
      <div class="cfg-section-body">
        <div class="cfg-drag-list" id="cfgVendedoresList">${vendedoresHTML}</div>
        <div class="cfg-add-row">
          <input type="text" class="form-control" id="cfgNovoVendedor" placeholder="Nome do vendedor">
          <button class="btn btn-primary" onclick="cfgAddVendedor()">+ Adicionar</button>
        </div>
      </div>
    </div>

    <!-- FORMAS DE PAGAMENTO -->
    <div class="cfg-section">
      <div class="cfg-section-header">
        <span class="cfg-section-icon">💳</span>
        <h3>Formas de Pagamento</h3>
      </div>
      <div class="cfg-section-body">
        <div class="cfg-drag-list cfg-tags-list" id="cfgPgtoList">${pgtoHTML}</div>
        <div class="cfg-add-row">
          <input type="text" class="form-control" id="cfgNovaPgto" placeholder="Nova forma de pagamento">
          <button class="btn btn-primary" onclick="cfgAddFormaPgto()">+ Adicionar</button>
        </div>
      </div>
    </div>

    <!-- CATEGORIAS DE FLUXO — ENTRADA -->
    <div class="cfg-section">
      <div class="cfg-section-header">
        <span class="cfg-section-icon" style="color:var(--success)">▲</span>
        <h3>Categorias de Entrada <span style="font-size:.75rem;color:var(--text-muted)">(Fluxo de Caixa)</span></h3>
      </div>
      <div class="cfg-section-body">
        <div class="cfg-drag-list" id="cfgCatEntradaList">${catsEntradaHTML}</div>
        <div class="cfg-add-row">
          <input type="text" class="form-control" id="cfgNovaCatEntrada" placeholder="Nova categoria de entrada">
          <button class="btn btn-primary" onclick="cfgAddCategoria('entrada')">+ Adicionar</button>
        </div>
      </div>
    </div>

    <!-- CATEGORIAS DE FLUXO — SAÍDA -->
    <div class="cfg-section">
      <div class="cfg-section-header">
        <span class="cfg-section-icon" style="color:var(--danger)">▼</span>
        <h3>Categorias de Saída <span style="font-size:.75rem;color:var(--text-muted)">(Fluxo de Caixa)</span></h3>
      </div>
      <div class="cfg-section-body">
        <div class="cfg-drag-list" id="cfgCatSaidaList">${catsSaidaHTML}</div>
        <div class="cfg-add-row">
          <input type="text" class="form-control" id="cfgNovaCatSaida" placeholder="Nova categoria de saída">
          <button class="btn btn-primary" onclick="cfgAddCategoria('saida')">+ Adicionar</button>
        </div>
      </div>
    </div>
  `;

  // Aplicar drag & drop em todas as listas
  setTimeout(() => {
    applyMask('cfgCnpj', maskCNPJ);
    initCfgDragDrop('cfgVendedoresList', 'vendedor');
    initCfgDragDrop('cfgPgtoList', 'formapgto');
    initCfgDragDrop('cfgCatEntradaList', 'catentrada');
    initCfgDragDrop('cfgCatSaidaList', 'catsaida');
  }, 50);
}

// ── Drag & Drop Engine ──────────────────────────────────────────
function initCfgDragDrop(listId, type) {
  const list = document.getElementById(listId);
  if (!list) return;

  let dragSrcEl = null;

  list.addEventListener('dragstart', function(e) {
    const item = e.target.closest('.cfg-drag-item');
    if (!item) return;
    dragSrcEl = item;
    item.classList.add('cfg-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.index);
  });

  list.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const afterEl = getDragAfterElement(list, e.clientY);
    const dragItem = list.querySelector('.cfg-dragging');
    if (!dragItem) return;
    if (afterEl == null) {
      list.appendChild(dragItem);
    } else {
      list.insertBefore(dragItem, afterEl);
    }
  });

  list.addEventListener('dragend', function(e) {
    const item = e.target.closest('.cfg-drag-item');
    if (item) item.classList.remove('cfg-dragging');
    // Salvar nova ordem
    saveCfgDragOrder(listId, type);
  });

  list.addEventListener('drop', function(e) {
    e.preventDefault();
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll('.cfg-drag-item:not(.cfg-dragging)')];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveCfgDragOrder(listId, type) {
  const list = document.getElementById(listId);
  if (!list) return;
  const items = [...list.querySelectorAll('.cfg-drag-item')];
  const indices = items.map(el => parseInt(el.dataset.index));

  if (type === 'vendedor') {
    const old = [...appData.vendedores];
    appData.vendedores = indices.map(i => old[i]);
    saveData();
    renderConfiguracoesPage();
  } else if (type === 'formapgto') {
    const old = [...appData.formasPagamento];
    appData.formasPagamento = indices.map(i => old[i]);
    saveData();
    renderConfiguracoesPage();
  } else if (type === 'catentrada' || type === 'catsaida') {
    // Reordenar dentro do array principal mantendo posições relativas
    const tipoFiltro = type === 'catentrada' ? 'entrada' : 'saida';
    const otherCats = appData.categoriasFluxo.filter(c => c.tipo !== tipoFiltro);
    const thisCats = indices.map(i => appData.categoriasFluxo[i]);
    // Rebuild: entradas primeiro, saídas depois
    const entradas = tipoFiltro === 'entrada' ? thisCats : appData.categoriasFluxo.filter(c => c.tipo === 'entrada');
    const saidas = tipoFiltro === 'saida' ? thisCats : appData.categoriasFluxo.filter(c => c.tipo === 'saida');
    appData.categoriasFluxo = [...entradas, ...saidas];
    saveData();
    renderConfiguracoesPage();
  }
  showToast('Ordem atualizada!', 'success');
}

// ── CRUD Vendedores ─────────────────────────────────────────────
function cfgAddVendedor() {
  const input = document.getElementById('cfgNovoVendedor');
  const nome = (input.value || '').trim();
  if (!nome) { showToast('Informe o nome', 'error'); return; }
  if (!appData.vendedores) appData.vendedores = [];
  if (appData.vendedores.includes(nome)) { showToast('Vendedor já existe', 'error'); return; }
  appData.vendedores.push(nome);
  saveData(); renderConfiguracoesPage(); showToast('Vendedor adicionado!', 'success');
}

function cfgUpdateVendedor(idx, value) {
  const nome = value.trim();
  if (!nome) return;
  appData.vendedores[idx] = nome;
  saveData(); showToast('Vendedor atualizado!', 'success');
}

function cfgRemoveVendedor(idx) {
  if (!confirm('Excluir vendedor "' + appData.vendedores[idx] + '"?')) return;
  appData.vendedores.splice(idx, 1);
  saveData(); renderConfiguracoesPage(); showToast('Vendedor excluído!', 'success');
}

// ── CRUD Formas de Pagamento ────────────────────────────────────
function cfgAddFormaPgto() {
  const input = document.getElementById('cfgNovaPgto');
  const nome = (input.value || '').trim();
  if (!nome) { showToast('Informe a forma de pagamento', 'error'); return; }
  if (!appData.formasPagamento) appData.formasPagamento = [];
  if (appData.formasPagamento.find(f => f.toLowerCase() === nome.toLowerCase())) { showToast('Forma de pagamento já existe', 'error'); return; }
  appData.formasPagamento.push(nome);
  saveData(); renderConfiguracoesPage(); showToast('Forma de pagamento adicionada!', 'success');
}

function cfgRemoveFormaPgto(idx) {
  if (!confirm('Excluir "' + appData.formasPagamento[idx] + '"?')) return;
  appData.formasPagamento.splice(idx, 1);
  saveData(); renderConfiguracoesPage(); showToast('Removida!', 'success');
}

// ── CRUD Categorias de Fluxo (Entrada/Saída dos meses) ─────────
function cfgAddCategoria(tipo) {
  const inputId = tipo === 'entrada' ? 'cfgNovaCatEntrada' : 'cfgNovaCatSaida';
  const input = document.getElementById(inputId);
  const nome = (input.value || '').trim();
  if (!nome) { showToast('Informe o nome da categoria', 'error'); return; }
  if (!appData.categoriasFluxo) appData.categoriasFluxo = [];
  const existe = appData.categoriasFluxo.find(c => c.nome.toLowerCase() === nome.toLowerCase() && c.tipo === tipo);
  if (existe) { showToast('Categoria já existe', 'error'); return; }
  appData.categoriasFluxo.push({ nome: nome, tipo: tipo });
  saveData(); renderConfiguracoesPage(); showToast('Categoria adicionada!', 'success');
}

function cfgUpdateCategoria(idx, value) {
  const nome = value.trim();
  if (!nome) return;
  appData.categoriasFluxo[idx].nome = nome;
  saveData(); showToast('Categoria atualizada!', 'success');
}

function cfgRemoveCategoria(idx) {
  const cat = appData.categoriasFluxo[idx];
  if (!confirm('Excluir categoria "' + cat.nome + '" (' + (cat.tipo === 'entrada' ? 'Entrada' : 'Saída') + ')?')) return;
  appData.categoriasFluxo.splice(idx, 1);
  saveData(); renderConfiguracoesPage(); showToast('Categoria excluída!', 'success');
}

// ── Empresa ─────────────────────────────────────────────────────
function cfgSaveEmpresa() {
  if (!appData.empresa) appData.empresa = {};
  appData.empresa.nome = (document.getElementById('cfgNome').value || '').trim();
  appData.empresa.cnpj = (document.getElementById('cfgCnpj').value || '').trim();
  saveData();
  updateSidebarInfo();
  showToast('Dados da empresa salvos!', 'success');
}

function cfgUploadLogo(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!appData.empresa) appData.empresa = {};
    appData.empresa.logo = e.target.result;
    saveData();
    updateSidebarInfo();
    renderConfiguracoesPage();
    showToast('Logo atualizada!', 'success');
  };
  reader.readAsDataURL(input.files[0]);
}
// └──────────────────── FIM SCR-SYS-01 ──────────────────────────┘


// ┌──────────────────────────────────────────────────────────────┐
// │ TOKEN: SCR-INI-01 — INICIALIZAÇÃO (DOMContentLoaded)        │
// │ Deps: SCR-CFG-01, SCR-DAT-02, SCR-DSH-01, SCR-UI-02        │
// │ ⚠️  DEVE SER O ÚLTIMO BLOCO DO ARQUIVO                      │
// └──────────────────────────────────────────────────────────────┘
document.addEventListener('DOMContentLoaded', async function() {
  // Conectar Supabase
  try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Supabase conectado');
    }
  } catch(e) { console.warn('Supabase indisponível:', e.message); }

  // Mostrar data atual
  var hoje = new Date();
  var dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  var meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var dateEl = document.getElementById('currentDate');
  if (dateEl) dateEl.textContent = dias[hoje.getDay()] + ', ' + hoje.getDate() + ' de ' + meses[hoje.getMonth()] + ' de ' + hoje.getFullYear();

  // Carregar dados e renderizar
  await loadData();
  renderDashboard();
  updateSidebarInfo();
});
// └──────────────────── FIM SCR-INI-01 ──────────────────────────┘
// ╔══════════════════════════════════════════════════════════════╗
// ║  FIM DO ARQUIVO — WD MÁQUINAS script.js TOKENIZADO          ║
// ╚══════════════════════════════════════════════════════════════╝
