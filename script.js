// ╔══════════════════════════════════════════════════════════════╗
// ║  WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026              ║
// ║  script.js — CÓDIGO COMPLETO CORRIGIDO v9                  ║
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

// ── SCR-UTL-04 — CÁLCULO DE DIAS RESTANTES (BOLETO/CHEQUE) ──
function calcDiasRestantes(dataVenc) {
  if (!dataVenc) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataVenc + 'T00:00:00');
  const diff = venc.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDiasRestantes(dias, situacao) {
  if (situacao === 'Pago' || situacao === 'Compensado') return '<span style="color:var(--success);font-weight:600">—</span>';
  if (dias === null) return '-';
  if (dias < 0) return '<span style="color:#e53e3e;font-weight:700">Vencido</span>';
  if (dias === 0) return '<span style="color:#e53e3e;font-weight:700">Vence hoje</span>';
  if (dias <= 7) return '<span style="color:#dd6b20;font-weight:600">' + dias + ' dia' + (dias > 1 ? 's' : '') + '</span>';
  return '<span style="color:var(--text-muted)">' + dias + ' dias</span>';
}

// ── SCR-UTL-04b — CÁLCULO DE DIAS GARANTIA (CORRIGIDO v9) ──
function calcDiasGarantia(dataInicio, diasGarantia) {
  if (!dataInicio || !diasGarantia) return null;
  var hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  var inicio = new Date(dataInicio + 'T00:00:00');
  inicio.setHours(0, 0, 0, 0);
  // Data de expiração = dataInicio + diasGarantia dias
  var expiracao = new Date(inicio.getTime() + (diasGarantia * 24 * 60 * 60 * 1000));
  var diff = expiracao.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDiasGarantia(dias, situacao) {
  if (situacao === 'Perdeu a Garantia') return '<span style="color:#e53e3e;font-weight:600">—</span>';
  if (dias === null) return '-';
  if (dias <= 0) return '<span style="color:#e53e3e;font-weight:700">—</span>';
  if (dias <= 30) return '<span style="color:#dd6b20;font-weight:600">' + dias + ' dia' + (dias > 1 ? 's' : '') + '</span>';
  return '<span style="color:var(--text-muted)">' + dias + ' dia' + (dias > 1 ? 's' : '') + '</span>';
}

function getGarantiaSituacaoAuto(dataInicio, diasGarantia, situacaoManual) {
  if (situacaoManual === 'Perdeu a Garantia') return 'Perdeu a Garantia';
  var dias = calcDiasGarantia(dataInicio, diasGarantia);
  if (dias === null) return 'Ativa';
  if (dias <= 0) return 'Vencida';
  return 'Ativa';
}

// ── SCR-UTL-05 — BADGE DE SITUAÇÃO COLORIDA (GLOBAL) ──
function situacaoBadge(sit) {
  if (!sit) return '<span style="color:var(--text-muted)">-</span>';
  var s = sit.toLowerCase();
  if (s === 'pago' || s === 'compensado' || s === 'entregue ok' || s === 'ativa' || s === 'concluído')
    return '<span style="color:#38a169;font-weight:600">' + sit + '</span>';
  if (s === 'vencido' || s === 'vencida' || s === 'devendo' || s === 'devolvido' || s === 'cancelado' || s === 'expirada' || s === 'perdeu a garantia' || s === 'entregue com defeito' || s === 'não entregue')
    return '<span style="color:#e53e3e;font-weight:600">' + sit + '</span>';
  if (s === 'pendente' || s === 'parcial' || s === 'guardado' || s === 'depositado' || s === 'em mãos' || s === 'repassado' || s === 'em andamento')
    return '<span style="color:#dd6b20;font-weight:600">' + sit + '</span>';
  return '<span style="font-weight:600">' + sit + '</span>';
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
  el.addEventListener('input', function () {
    var pos = el.selectionStart;
    var oldLen = el.value.length;
    el.value = maskFn(el.value);
    var newLen = el.value.length;
    el.setSelectionRange(pos + (newLen - oldLen), pos + (newLen - oldLen));
  });
}
function applyAllMasks() {
  setTimeout(function () {
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

// ── SCR-UTL-03 — UPLOAD DE IMAGEM ──
function handleImageUpload(inputId, previewId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('change', function () {
    var file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Selecione um arquivo de imagem (JPG, PNG, WEBP)', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Imagem muito grande! Máximo 2 MB.', 'error');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var prev = document.getElementById(previewId);
      if (prev) prev.innerHTML = '<img src="' + e.target.result + '" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover">';
      input.setAttribute('data-base64', e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// ── SCR-DAT-01 — DADOS PADRÃO ──
function getDefaultData() {
  return {
    empresa: { nome: "WD Máquinas", cnpj: "29.595.239/0001-33", logo: "" },
    vendedores: ["Wander", "Daniel"],
    formasPagamento: ["Boleto", "Caixa da Oficina", "Cartão de Crédito MP", "Cartão de Crédito PagBank", "Cartão de Débito MP", "Cartão de Débito PagBank", "Dinheiro", "Link MP", "Link PagBank", "MP", "PagBank", "Pix"],
    tipoUnidade: ["Unidade", "Kg", "Metro", "Litro", "Caixa", "Pacote", "Par", "Jogo", "Rolo", "Barra", "Chapa", "Peça"],
    tipoVenda: ["Direta", "Revenda"],
    situacaoCompra: ["Devendo", "Guardado", "Pago"],
    situacaoVenda: ["Devendo", "Pago", "Parcial"],
    situacaoEntrega: ["Entregue com Defeito", "Entregue OK", "Não Entregue", "Pendente"],
    situacaoCheque: ["Compensado", "Depositado", "Devolvido", "Em Mãos", "Repassado"],
    situacaoGarantia: ["Ativa", "Perdeu a Garantia", "Vencida"],
    situacaoBoleto: ["Pago", "Pendente", "Vencido"],
    categoriasFluxo: [
      { nome: "Salário", tipo: "entrada" }, { nome: "Venda", tipo: "entrada" }, { nome: "Serviço", tipo: "entrada" },
      { nome: "Outros (Entrada)", tipo: "entrada" }, { nome: "Dinheiro em Notas", tipo: "entrada" },
      { nome: "Material", tipo: "saida" }, { nome: "Combustível", tipo: "saida" }, { nome: "Alimentação", tipo: "saida" },
      { nome: "Conta de Luz", tipo: "saida" }, { nome: "Aluguel", tipo: "saida" }, { nome: "Outros (Saída)", tipo: "saida" }
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
      var resp = await supabaseClient.from('wdmaquinas_data').select('*').eq('id', 1).single();
      if (resp.data && resp.data.payload) {
        appData = typeof resp.data.payload === 'string' ? JSON.parse(resp.data.payload) : resp.data.payload;
        ensureDefaults();
        console.log('Dados carregados do Supabase');
        return;
      }
    } catch (e) { console.warn('Supabase load falhou:', e.message); }
  }
  try {
    var local = localStorage.getItem('wdmaquinas_data');
    if (local) { appData = JSON.parse(local); ensureDefaults(); console.log('Dados carregados do localStorage'); return; }
  } catch (e) { }
  appData = getDefaultData();
  console.log('Dados padrão carregados');
}
async function saveData() {
  try { localStorage.setItem('wdmaquinas_data', JSON.stringify(appData)); } catch (e) { }
  if (supabaseClient) {
    try { await supabaseClient.from('wdmaquinas_data').upsert({ id: 1, payload: appData, updated_at: new Date().toISOString() }); } catch (e) { console.warn('Supabase save falhou:', e.message); }
  }
}
function ensureDefaults() {
  var def = getDefaultData();
  Object.keys(def).forEach(function (k) { if (appData[k] === undefined) appData[k] = def[k]; });
  if (!appData.categoriasFluxo || appData.categoriasFluxo.length === 0) appData.categoriasFluxo = def.categoriasFluxo;
  if (!appData.situacaoVenda) appData.situacaoVenda = def.situacaoVenda;
  if (!appData.situacaoGarantia) appData.situacaoGarantia = def.situacaoGarantia;
}

// ── SCR-UI-01 — TOAST + MODAL HELPERS ──
function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || 'success');
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 3000);
}
function openCadastroModal() { document.getElementById('cadastroModal').style.display = 'flex'; }
function closeCadastroModal() { document.getElementById('cadastroModal').style.display = 'none'; }
function openViewModal() { document.getElementById('viewModal').style.display = 'flex'; }
function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }

// ── SCR-UI-02 — SIDEBAR ──
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('collapsed'); syncExpandBtn(); }
function collapseSidebar() { document.getElementById('sidebar').classList.toggle('collapsed'); syncExpandBtn(); }
function syncExpandBtn() {
  var sb = document.getElementById('sidebar');
  var expandBtn = document.getElementById('expandBtn');
  var arrow = document.getElementById('collapseArrow');
  var isCollapsed = sb.classList.contains('collapsed');
  if (expandBtn) expandBtn.style.display = isCollapsed ? 'inline-flex' : 'none';
  if (arrow) arrow.textContent = isCollapsed ? '»' : '«';
}
function updateSidebarInfo() {
  var nameEl = document.getElementById('sidebarNome');
  var cnpjEl = document.getElementById('sidebarCnpj');
  if (nameEl && appData.empresa) nameEl.textContent = appData.empresa.nome || 'WD Máquinas';
  if (cnpjEl && appData.empresa) cnpjEl.textContent = 'CNPJ: ' + (appData.empresa.cnpj || '');
  var logoEl = document.getElementById('sidebarLogo');
  if (logoEl && appData.empresa && appData.empresa.logo) { logoEl.src = appData.empresa.logo; logoEl.style.display = 'block'; }
}

// ── SCR-NAV-01 — NAVEGAÇÃO ENTRE PÁGINAS ──
var pageTitles = {
  'dashboard': 'Dashboard', 'janeiro': 'Janeiro', 'fevereiro': 'Fevereiro', 'marco': 'Março', 'abril': 'Abril', 'maio': 'Maio', 'junho': 'Junho', 'julho': 'Julho', 'agosto': 'Agosto', 'setembro': 'Setembro', 'outubro': 'Outubro', 'novembro': 'Novembro', 'dezembro': 'Dezembro',
  'compras': 'Compras', 'vendas': 'Vendas', 'estoque': 'Estoque', 'produtos': 'Produtos', 'clientes': 'Clientes', 'fornecedores': 'Fornecedores', 'pfornecedores': 'P. Fornecedores',
  'boletos': 'Boletos', 'cheques': 'Cheques', 'prestacoes': 'Prestações', 'projetos': 'Projetos', 'pagclientes': 'Pag. Clientes', 'garantias': 'Garantias',
  'relatorios': 'Relatórios', 'notasentrada': 'Notas Entrada', 'notassaida': 'Notas Saída', 'receitasmei': 'Receitas MEI',
  'configuracoes': 'Configurações', 'backup': 'Backup'
};

function navigateTo(page) {
  document.querySelectorAll('.page-content').forEach(function (p) { p.style.display = 'none'; });
  var el = document.getElementById('page-' + page);
  if (el) el.style.display = 'block';
  var titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = pageTitles[page] || page;
  document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
  var navItem = document.querySelector('.nav-item[onclick*="' + page + '"]');
  if (navItem) navItem.classList.add('active');
  document.getElementById('sidebar').classList.remove('active');

  var meses = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var mesIdx = meses.indexOf(page);

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

// ══════════════════════════════════════════════════════════════
// ── SCR-DSH-01 — DASHBOARD (v9 — ordem corrigida) ──
// ══════════════════════════════════════════════════════════════
function renderDashboard() {
  var pg = document.getElementById('page-dashboard');
  if (!pg) return;

  var compras = appData.compras || [];
  var vendas = appData.vendas || [];
  var boletos = appData.boletos || [];
  var cheques = appData.cheques || [];
  var prestacoes = appData.prestacoes || [];

  var totalCompras = compras.reduce(function (s, c) { return s + ((c.quantidade || 1) * (c.valorUnit || 0)); }, 0);
  var totalVendas = vendas.reduce(function (s, v) { return s + ((v.quantidade || 1) * (v.valorUnit || 0)); }, 0);
  var lucro = totalVendas - totalCompras;

  var totalPrestacoes = prestacoes.reduce(function (s, p) { return s + (p.valor || 0); }, 0);

  var chequesPendentes = cheques.filter(function (ch) { return ch.situacao !== 'Compensado'; }).reduce(function (s, ch) { return s + (ch.valor || 0); }, 0);
  var chequesPendentesQtd = cheques.filter(function (ch) { return ch.situacao !== 'Compensado'; }).length;

  var boletosPendentes = boletos.filter(function (b) { return b.situacao !== 'Pago'; }).reduce(function (s, b) { return s + (b.valor || 0); }, 0);
  var boletosPendentesQtd = boletos.filter(function (b) { return b.situacao !== 'Pago'; }).length;

  var meses = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var mesesLabel = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  var salarioMensalRows = '';
  meses.forEach(function (m, i) {
    var lancamentos = (appData.fluxoCaixa && appData.fluxoCaixa[m]) ? appData.fluxoCaixa[m] : [];
    var salarioLancs = lancamentos.filter(function (l) { return (l.categoria || '').toLowerCase().includes('salário') || (l.categoria || '').toLowerCase().includes('salario'); });
    var salarioTotal = salarioLancs.reduce(function (s, l) { return s + (l.valor || 0); }, 0);
    var salarioWander = salarioLancs.filter(function (l) { return (l.descricao || '').toLowerCase().includes('wander'); }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);
    var salarioDaniel = salarioLancs.filter(function (l) { return (l.descricao || '').toLowerCase().includes('daniel'); }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);
    if (salarioTotal > 0) {
      salarioMensalRows += '<tr><td>' + mesesLabel[i] + '</td><td>' + formatCurrency(salarioWander) + '</td><td>' + formatCurrency(salarioDaniel) + '</td><td>' + formatCurrency(salarioTotal) + '</td></tr>';
    }
  });

  var fluxoResumo = '';
  meses.forEach(function (m, i) {
    var lancamentos = (appData.fluxoCaixa && appData.fluxoCaixa[m]) ? appData.fluxoCaixa[m] : [];
    var entradas = lancamentos.filter(function (l) { return l.tipo === 'entrada'; }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);
    var saidas = lancamentos.filter(function (l) { return l.tipo === 'saida'; }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);
    var saldo = entradas - saidas;
    var cor = saldo >= 0 ? 'text-success' : 'text-danger';
    fluxoResumo += '<tr onclick="navigateTo(\'' + m + '\')" style="cursor:pointer"><td>' + mesesLabel[i] + '</td><td class="text-success">' + formatCurrency(entradas) + '</td><td class="text-danger">' + formatCurrency(saidas) + '</td><td class="' + cor + '">' + formatCurrency(saldo) + '</td></tr>';
  });

  var ultVendas = vendas.slice(-5).reverse();
  var vendasRows = '';
  if (ultVendas.length === 0) {
    vendasRows = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma venda</td></tr>';
  } else {
    ultVendas.forEach(function (v) {
      vendasRows += '<tr><td>' + formatDate(v.data) + '</td><td>' + (v.produto || '-') + '</td><td>' + formatCurrency((v.quantidade || 1) * (v.valorUnit || 0)) + '</td><td>' + situacaoBadge(v.situacao) + '</td></tr>';
    });
  }

  var ultCompras = compras.slice(-5).reverse();
  var comprasRows = '';
  if (ultCompras.length === 0) {
    comprasRows = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma compra</td></tr>';
  } else {
    ultCompras.forEach(function (c) {
      comprasRows += '<tr><td>' + formatDate(c.data) + '</td><td>' + (c.produto || '-') + '</td><td>' + formatCurrency((c.quantidade || 1) * (c.valorUnit || 0)) + '</td><td>' + situacaoBadge(c.situacao) + '</td></tr>';
    });
  }

  // CARDS: Total Compras | Total Vendas | Lucro | Total Prestações | Cheques Pendentes | Boletos Pendentes
  pg.innerHTML =
    '<div class="page-header"><h2>📊 Dashboard</h2></div>' +
    '<div class="dashboard-grid">' +
      '<div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">' + formatCurrency(totalCompras) + '</div><div class="card-sub">' + compras.length + ' registros</div></div>' +
      '<div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">' + formatCurrency(totalVendas) + '</div><div class="card-sub">' + vendas.length + ' registros</div></div>' +
      '<div class="card"><div class="card-header"><span>Lucro</span></div><div class="card-value ' + (lucro >= 0 ? 'text-success' : 'text-danger') + '">' + formatCurrency(lucro) + '</div></div>' +
      '<div class="card"><div class="card-header"><span>💳 Total Prestações</span></div><div class="card-value text-info">' + formatCurrency(totalPrestacoes) + '</div><div class="card-sub">' + prestacoes.length + ' prestação(ões)</div></div>' +
      '<div class="card" style="border-left:3px solid var(--warning)"><div class="card-header"><span>📝 Cheques Pendentes</span></div><div class="card-value text-warning">' + formatCurrency(chequesPendentes) + '</div><div class="card-sub">' + chequesPendentesQtd + ' cheque(s)</div></div>' +
      '<div class="card" style="border-left:3px solid var(--danger)"><div class="card-header"><span>📄 Boletos Pendentes</span></div><div class="card-value text-danger">' + formatCurrency(boletosPendentes) + '</div><div class="card-sub">' + boletosPendentesQtd + ' boleto(s)</div></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
      '<div>' +
        '<div class="card" style="margin-bottom:16px"><div class="card-header"><span>Fluxo de Caixa Mensal</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>' + fluxoResumo + '</tbody></table></div></div>' +
      '</div>' +
      '<div>' +
        (salarioMensalRows ? '<div class="card" style="margin-bottom:16px"><div class="card-header"><span>💰 Salário por Mês</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Wander</th><th>Daniel</th><th>Pago Total</th></tr></thead><tbody>' + salarioMensalRows + '</tbody></table></div></div>' : '') +
        '<div class="card" style="margin-bottom:16px"><div class="card-header"><span>Últimas Vendas</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Valor</th><th>Situação</th></tr></thead><tbody>' + vendasRows + '</tbody></table></div></div>' +
        '<div class="card"><div class="card-header"><span>Últimas Compras</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Valor</th><th>Situação</th></tr></thead><tbody>' + comprasRows + '</tbody></table></div></div>' +
      '</div>' +
    '</div>';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-FLX-01 — FLUXO DE CAIXA MENSAL ──
// ══════════════════════════════════════════════════════════════
var mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
var mesesKeys = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

var fluxoFilterText = '';
var fluxoFilterTipo = '';

function renderFluxoMes(mesIdx) {
  var mesKey = mesesKeys[mesIdx];
  var mesNome = mesesNomes[mesIdx];
  var pg = document.getElementById('page-' + mesKey);
  if (!pg) return;

  if (!appData.fluxoCaixa) appData.fluxoCaixa = {};
  if (!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey] = [];

  var lancamentos = appData.fluxoCaixa[mesKey];

  var saldoAnterior = 0;
  for (var i = 0; i < mesIdx; i++) {
    var mk = mesesKeys[i];
    var lancs = (appData.fluxoCaixa[mk]) || [];
    lancs.forEach(function (l) {
      if (l.tipo === 'entrada') saldoAnterior += (l.valor || 0);
      else saldoAnterior -= (l.valor || 0);
    });
  }

  var totalEntradas = lancamentos.filter(function (l) { return l.tipo === 'entrada'; }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);
  var totalSaidas = lancamentos.filter(function (l) { return l.tipo === 'saida'; }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);
  var saldoFinal = saldoAnterior + totalEntradas - totalSaidas;
  var dinheiroNotas = lancamentos.filter(function (l) { return l.categoria === 'Dinheiro em Notas'; }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);

  var salarioLancs = lancamentos.filter(function (l) { return (l.categoria || '').toLowerCase().includes('salário') || (l.categoria || '').toLowerCase().includes('salario'); });
  var salarioPagoTotal = salarioLancs.reduce(function (s, l) { return s + (l.valor || 0); }, 0);
  var salarioWander = salarioLancs.filter(function (l) { return (l.descricao || '').toLowerCase().includes('wander'); }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);
  var salarioDaniel = salarioLancs.filter(function (l) { return (l.descricao || '').toLowerCase().includes('daniel'); }).reduce(function (s, l) { return s + (l.valor || 0); }, 0);

  var catEntrada = (appData.categoriasFluxo || []).filter(function (c) { return c.tipo === 'entrada'; }).map(function (c) { return '<option value="entrada:' + c.nome + '">' + c.nome + '</option>'; }).join('');
  var catSaida = (appData.categoriasFluxo || []).filter(function (c) { return c.tipo === 'saida'; }).map(function (c) { return '<option value="saida:' + c.nome + '">' + c.nome + '</option>'; }).join('');

  pg.innerHTML =
    '<div class="page-header"><h2>📅 ' + mesNome + ' 2026</h2><button class="btn btn-primary" onclick="openLancamentoModal(' + mesIdx + ')">+ Novo Lançamento</button></div>' +
    '<div class="dashboard-grid">' +
      '<div class="card"><div class="card-header"><span>Saldo Anterior</span></div><div class="card-value ' + (saldoAnterior >= 0 ? 'text-success' : 'text-danger') + '">' + formatCurrency(saldoAnterior) + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Entradas</span></div><div class="card-value text-success">' + formatCurrency(totalEntradas) + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Saídas</span></div><div class="card-value text-danger">' + formatCurrency(totalSaidas) + '</div></div>' +
      '<div class="card card-accent"><div class="card-header"><span>Saldo Final</span></div><div class="card-value ' + (saldoFinal >= 0 ? 'text-success' : 'text-danger') + '">' + formatCurrency(saldoFinal) + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Dinheiro em Notas</span></div><div class="card-value">' + formatCurrency(dinheiroNotas) + '</div></div>' +
      '<div class="card" style="border-left:3px solid var(--danger);grid-column:span 2"><div class="card-header"><span>Salário Pago Total</span></div><div class="card-value text-danger">' + formatCurrency(salarioPagoTotal) + '</div>' +
        '<div style="display:flex;align-items:center;gap:24px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);flex-wrap:wrap">' +
          '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase">Wander:</span><span style="font-size:1rem;font-weight:700;color:var(--warning)">' + formatCurrency(salarioWander) + '</span></div>' +
          '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase">Daniel:</span><span style="font-size:1rem;font-weight:700;color:var(--warning)">' + formatCurrency(salarioDaniel) + '</span></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="filter-bar">' +
      '<input type="text" class="form-control" style="max-width:250px" placeholder="Buscar lançamento..." oninput="fluxoFilterText=this.value.toLowerCase();renderFluxoTable(' + mesIdx + ')">' +
      '<select class="form-control" style="max-width:200px" onchange="fluxoFilterTipo=this.value;renderFluxoTable(' + mesIdx + ')"><option value="">Todos os tipos</option><optgroup label="Entradas">' + catEntrada + '</optgroup><optgroup label="Saídas">' + catSaida + '</optgroup></select>' +
      '<div class="flux-toggle">' +
        '<button class="btn btn-sm ' + (fluxoFilterTipo === '' ? 'btn-primary' : 'btn-outline') + '" onclick="fluxoFilterTipo=\'\';renderFluxoTable(' + mesIdx + ')">Todos</button>' +
        '<button class="btn btn-sm ' + (fluxoFilterTipo === 'entrada' ? 'btn-primary' : 'btn-outline') + '" onclick="fluxoFilterTipo=\'entrada\';renderFluxoTable(' + mesIdx + ')">Entradas</button>' +
        '<button class="btn btn-sm ' + (fluxoFilterTipo === 'saida' ? 'btn-primary' : 'btn-outline') + '" onclick="fluxoFilterTipo=\'saida\';renderFluxoTable(' + mesIdx + ')">Saídas</button>' +
      '</div>' +
    '</div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="fluxoBody"></tbody></table></div>';

  fluxoFilterText = '';
  fluxoFilterTipo = '';
  renderFluxoTable(mesIdx);
}

function renderFluxoTable(mesIdx) {
  var mesKey = mesesKeys[mesIdx];
  var tbody = document.getElementById('fluxoBody');
  if (!tbody) return;
  var lancamentos = (appData.fluxoCaixa && appData.fluxoCaixa[mesKey]) ? appData.fluxoCaixa[mesKey].slice() : [];
  if (fluxoFilterText) {
    lancamentos = lancamentos.filter(function (l) { return (l.descricao || '').toLowerCase().includes(fluxoFilterText) || (l.categoria || '').toLowerCase().includes(fluxoFilterText); });
  }
  if (fluxoFilterTipo) {
    if (fluxoFilterTipo === 'entrada' || fluxoFilterTipo === 'saida') {
      lancamentos = lancamentos.filter(function (l) { return l.tipo === fluxoFilterTipo; });
    } else if (fluxoFilterTipo.includes(':')) {
      var parts = fluxoFilterTipo.split(':');
      lancamentos = lancamentos.filter(function (l) { return l.tipo === parts[0] && l.categoria === parts[1]; });
    }
  }
  lancamentos.sort(function (a, b) { return (a.data || '').localeCompare(b.data || ''); });
  if (lancamentos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum lançamento</td></tr>';
    return;
  }
  tbody.innerHTML = lancamentos.map(function (l) {
    var isEntrada = l.tipo === 'entrada';
    return '<tr><td>' + formatDate(l.data) + '</td><td>' + (l.descricao || '-') + '</td><td>' + (l.categoria || '-') + '</td><td><span class="badge ' + (isEntrada ? 'badge-success' : 'badge-danger') + '">' + (isEntrada ? 'Entrada' : 'Saída') + '</span></td><td class="' + (isEntrada ? 'text-success' : 'text-danger') + '">' + formatCurrency(l.valor) + '</td><td><button class="btn btn-sm btn-primary" onclick="editLancamento(' + mesIdx + ',' + l.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteLancamento(' + mesIdx + ',' + l.id + ')">🗑️</button></td></tr>';
  }).join('');
}

function openLancamentoModal(mesIdx, lanc) {
  var mesKey = mesesKeys[mesIdx];
  var isEdit = !!lanc;
  var catEntrada = (appData.categoriasFluxo || []).filter(function (c) { return c.tipo === 'entrada'; }).map(function (c) { return '<option value="' + c.nome + '"' + (lanc && lanc.categoria === c.nome ? ' selected' : '') + '>' + c.nome + '</option>'; }).join('');
  var catSaida = (appData.categoriasFluxo || []).filter(function (c) { return c.tipo === 'saida'; }).map(function (c) { return '<option value="' + c.nome + '"' + (lanc && lanc.categoria === c.nome ? ' selected' : '') + '>' + c.nome + '</option>'; }).join('');
  var tipoVal = lanc ? lanc.tipo : 'entrada';
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Lançamento' : 'Novo Lançamento';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-group"><label>Data</label><input type="date" class="form-control" id="flxData" value="' + (lanc ? lanc.data : new Date().toISOString().split('T')[0]) + '"></div>' +
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="flxDesc" value="' + (lanc ? lanc.descricao || '' : '') + '"></div>' +
    '<div class="form-row"><div class="form-group"><label>Tipo</label><select class="form-control" id="flxTipo" onchange="updateFlxCatOptions()"><option value="entrada"' + (tipoVal === 'entrada' ? ' selected' : '') + '>Entrada</option><option value="saida"' + (tipoVal === 'saida' ? ' selected' : '') + '>Saída</option></select></div>' +
    '<div class="form-group"><label>Categoria</label><select class="form-control" id="flxCat"></select></div></div>' +
    '<div class="form-group"><label>Valor *</label><input type="number" class="form-control" id="flxValor" value="' + (lanc ? lanc.valor || '' : '') + '" step="0.01"></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveLancamento(' + mesIdx + ',' + (isEdit ? lanc.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
  setTimeout(function () { updateFlxCatOptions(); if (lanc) document.getElementById('flxCat').value = lanc.categoria || ''; }, 50);
}

function updateFlxCatOptions() {
  var tipo = document.getElementById('flxTipo').value;
  var catSel = document.getElementById('flxCat');
  var cats = (appData.categoriasFluxo || []).filter(function (c) { return c.tipo === tipo; });
  catSel.innerHTML = cats.map(function (c) { return '<option value="' + c.nome + '">' + c.nome + '</option>'; }).join('');
}

function saveLancamento(mesIdx, id) {
  var mesKey = mesesKeys[mesIdx];
  var obj = { data: document.getElementById('flxData').value, descricao: document.getElementById('flxDesc').value.trim(), tipo: document.getElementById('flxTipo').value, categoria: document.getElementById('flxCat').value, valor: parseFloat(document.getElementById('flxValor').value) || 0 };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!obj.valor) { showToast('Informe o valor', 'error'); return; }
  if (!appData.fluxoCaixa) appData.fluxoCaixa = {};
  if (!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey] = [];
  if (id) {
    var idx = appData.fluxoCaixa[mesKey].findIndex(function (l) { return l.id === id; });
    if (idx > -1) { obj.id = id; appData.fluxoCaixa[mesKey][idx] = obj; }
  } else { obj.id = nextId(appData.fluxoCaixa[mesKey]); appData.fluxoCaixa[mesKey].push(obj); }
  saveData(); closeCadastroModal(); renderFluxoMes(mesIdx); showToast(id ? 'Atualizado!' : 'Cadastrado!', 'success');
}

function editLancamento(mesIdx, id) {
  var mesKey = mesesKeys[mesIdx];
  var lanc = (appData.fluxoCaixa[mesKey] || []).find(function (l) { return l.id === id; });
  if (lanc) openLancamentoModal(mesIdx, lanc);
}

function deleteLancamento(mesIdx, id) {
  if (!confirm('Excluir lançamento?')) return;
  var mesKey = mesesKeys[mesIdx];
  appData.fluxoCaixa[mesKey] = (appData.fluxoCaixa[mesKey] || []).filter(function (l) { return l.id !== id; });
  saveData(); renderFluxoMes(mesIdx); showToast('Excluído!', 'success');
}

// ══════════════════════════════════════════════════════════════
// ── SCR-CMP-01 — COMPRAS ──
// ══════════════════════════════════════════════════════════════
function renderComprasPage() {
  var pg = document.getElementById('page-compras');
  if (!pg) return;
  var compras = appData.compras || [];
  var sitOpts = (appData.situacaoCompra || []).map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
  var pgtoOpts = (appData.formasPagamento || []).map(function (f) { return '<option value="' + f + '">' + f + '</option>'; }).join('');
  pg.innerHTML =
    '<div class="page-header"><h2>🛒 Compras</h2><div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openCompraModal()">+ Nova Compra</button><button class="btn btn-outline" id="btnComprasEdit" onclick="toggleComprasEditMode()">' + (comprasEditMode ? '✅ Finalizar Edição' : '✏️ Editar Todos') + '</button><button class="btn btn-danger" onclick="deleteAllCompras()">🗑️ Excluir Todos</button></div></div>' +
    '<div class="dashboard-grid" id="comprasResultPanel"></div>' +
    '<div class="filter-bar">' +
      '<input type="text" class="form-control" style="max-width:250px" placeholder="Buscar compra..." oninput="onComprasSearch(this.value)">' +
      '<select class="form-control" style="max-width:160px" onchange="onComprasFilterSit(this.value)"><option value="">Situação (todas)</option>' + sitOpts + '</select>' +
      '<select class="form-control" style="max-width:160px" onchange="onComprasFilterPgto(this.value)"><option value="">Pgto (todos)</option>' + pgtoOpts + '</select>' +
    '</div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>F.Pgto</th><th>Venc.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="comprasBody"></tbody></table></div>';
  comprasSearchQuery = '';
  comprasFilterSit = '';
  comprasFilterPgto = '';
  applyComprasFilters();
}

function renderComprasTable(compras) {
  var tbody = document.getElementById('comprasBody');
  if (!tbody) return;
  if (compras.length === 0) { tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma compra encontrada</td></tr>'; return; }
  var sitOpts = (appData.situacaoCompra || []);
  tbody.innerHTML = compras.map(function (c) {
    var total = (c.quantidade || 1) * (c.valorUnit || 0);
    var sitSelect = '<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeCompraField(' + c.id + ',\'situacao\',this.value)">' + sitOpts.map(function (s) { return '<option value="' + s + '"' + (c.situacao === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>';
    var acoes = comprasEditMode
      ? '<button class="btn btn-sm btn-outline" onclick="viewCompra(' + c.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCompra(' + c.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCompra(' + c.id + ')">🗑️</button>'
      : '<button class="btn btn-sm btn-outline" onclick="viewCompra(' + c.id + ')">👁️</button>';
    return '<tr><td>' + formatDate(c.data) + '</td><td>' + (c.produto || '-') + '</td><td>' + (c.fornecedor || '-') + '</td><td>' + (c.quantidade || 1) + '</td><td>' + formatCurrency(c.valorUnit) + '</td><td>' + formatCurrency(total) + '</td><td>' + (c.formaPagamento || '-') + '</td><td>' + formatDate(c.vencimento) + '</td><td>' + sitSelect + '</td><td>' + acoes + '</td></tr>';
  }).join('');
}

function changeCompraField(id, field, value) { var c = (appData.compras || []).find(function (x) { return x.id === id; }); if (c) { c[field] = value; saveData(); applyComprasFilters(); } }

function openCompraModal(compra) {
  var isEdit = !!compra;
  var fornOpts = (appData.fornecedores || []).map(function (f) { return '<option value="' + f.nome + '"' + (compra && compra.fornecedor === f.nome ? ' selected' : '') + '>' + f.nome + '</option>'; }).join('');
  var pgtoOpts = (appData.formasPagamento || []).map(function (f) { return '<option value="' + f + '"' + (compra && compra.formaPagamento === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
  var sitOpts = (appData.situacaoCompra || []).map(function (s) { return '<option value="' + s + '"' + (compra && compra.situacao === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Compra' : 'Nova Compra';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="cpData" value="' + (compra ? compra.data : new Date().toISOString().split('T')[0]) + '"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="cpVenc" value="' + (compra ? compra.vencimento || '' : '') + '"></div></div>' +
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="cpProd" value="' + (compra ? compra.produto : '') + '"></div>' +
    '<div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="cpQtd" value="' + (compra ? compra.quantidade : 1) + '" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="cpValor" value="' + (compra ? compra.valorUnit : '') + '" step="0.01"></div></div>' +
    '<div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="cpForn"><option value="">Selecione...</option>' + fornOpts + '</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="cpPgto"><option value="">Selecione...</option>' + pgtoOpts + '</select></div></div>' +
    '<div class="form-group"><label>Situação</label><select class="form-control" id="cpSit">' + sitOpts + '</select></div>' +
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="cpObs" rows="2">' + (compra ? compra.obs || '' : '') + '</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCompra(' + (isEdit ? compra.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveCompra(id) {
  var obj = { data: document.getElementById('cpData').value, vencimento: document.getElementById('cpVenc').value, produto: document.getElementById('cpProd').value.trim(), quantidade: parseFloat(document.getElementById('cpQtd').value) || 1, valorUnit: parseFloat(document.getElementById('cpValor').value) || 0, fornecedor: document.getElementById('cpForn').value, formaPagamento: document.getElementById('cpPgto').value, situacao: document.getElementById('cpSit').value, obs: document.getElementById('cpObs').value };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.compras) appData.compras = [];
  if (id) { var idx = appData.compras.findIndex(function (c) { return c.id === id; }); if (idx > -1) { obj.id = id; appData.compras[idx] = obj; } }
  else { obj.id = nextId(appData.compras); appData.compras.push(obj); }
  saveData(); closeCadastroModal(); renderComprasPage(); showToast(id ? 'Compra atualizada!' : 'Compra cadastrada!', 'success');
}

function editCompra(id) { var c = (appData.compras || []).find(function (x) { return x.id === id; }); if (c) openCompraModal(c); }

function viewCompra(id) {
  var c = (appData.compras || []).find(function (x) { return x.id === id; }); if (!c) return;
  var total = (c.quantidade || 1) * (c.valorUnit || 0);
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Compra';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>' + formatDate(c.data) + '</div><div class="detail-item"><span class="detail-label">Vencimento</span>' + formatDate(c.vencimento) + '</div><div class="detail-item"><span class="detail-label">Produto</span>' + c.produto + '</div><div class="detail-item"><span class="detail-label">Qtd</span>' + c.quantidade + '</div><div class="detail-item"><span class="detail-label">V.Unit</span>' + formatCurrency(c.valorUnit) + '</div><div class="detail-item"><span class="detail-label">Total</span>' + formatCurrency(total) + '</div><div class="detail-item"><span class="detail-label">Fornecedor</span>' + (c.fornecedor || '-') + '</div><div class="detail-item"><span class="detail-label">Pgto</span>' + (c.formaPagamento || '-') + '</div><div class="detail-item"><span class="detail-label">Situação</span>' + situacaoBadge(c.situacao) + '</div></div>' + (c.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + c.obs + '</div>' : '');
  openViewModal();
}

function deleteCompra(id) { if (!confirm('Excluir compra?')) return; appData.compras = (appData.compras || []).filter(function (c) { return c.id !== id; }); saveData(); renderComprasPage(); showToast('Compra excluída!', 'success'); }
function toggleComprasEditMode() { comprasEditMode = !comprasEditMode; var btn = document.getElementById('btnComprasEdit'); if (btn) btn.textContent = comprasEditMode ? '✅ Finalizar Edição' : '✏️ Editar Todos'; applyComprasFilters(); }
function deleteAllCompras() { if (!confirm('Excluir TODAS as compras?')) return; appData.compras = []; saveData(); renderComprasPage(); showToast('Todas excluídas!', 'success'); }
function onComprasSearch(q) { comprasSearchQuery = q.toLowerCase(); applyComprasFilters(); }
function onComprasFilterSit(s) { comprasFilterSit = s; applyComprasFilters(); }
function onComprasFilterPgto(p) { comprasFilterPgto = p; applyComprasFilters(); }
function applyComprasFilters() {
  var filtered = appData.compras || [];
  if (comprasSearchQuery) filtered = filtered.filter(function (c) { return (c.produto || '').toLowerCase().includes(comprasSearchQuery) || (c.fornecedor || '').toLowerCase().includes(comprasSearchQuery); });
  if (comprasFilterSit) filtered = filtered.filter(function (c) { return c.situacao === comprasFilterSit; });
  if (comprasFilterPgto) filtered = filtered.filter(function (c) { return c.formaPagamento === comprasFilterPgto; });
  renderComprasTable(filtered);
  renderComprasResultPanel(filtered);
}
function renderComprasResultPanel(filtered) {
  var panel = document.getElementById('comprasResultPanel'); if (!panel) return;
  var all = appData.compras || [];
  var total = filtered.reduce(function (s, c) { return s + ((c.quantidade || 1) * (c.valorUnit || 0)); }, 0);
  var pago = filtered.filter(function (c) { return c.situacao === 'Pago'; }).reduce(function (s, c) { return s + ((c.quantidade || 1) * (c.valorUnit || 0)); }, 0);
  var devendo = filtered.filter(function (c) { return c.situacao === 'Devendo'; }).reduce(function (s, c) { return s + ((c.quantidade || 1) * (c.valorUnit || 0)); }, 0);
  panel.innerHTML = '<div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">' + formatCurrency(total) + '</div><div class="card-sub">' + filtered.length + ' de ' + all.length + ' registros</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">' + formatCurrency(pago) + '</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">' + formatCurrency(devendo) + '</div></div>';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-VND-01 — VENDAS ──
// ══════════════════════════════════════════════════════════════
function renderVendasPage() {
  var pg = document.getElementById('page-vendas');
  if (!pg) return;
  var vendas = appData.vendas || [];
  var sitOpts = (appData.situacaoVenda || []).map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
  pg.innerHTML =
    '<div class="page-header"><h2>💰 Vendas</h2><div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openVendaModal()">+ Nova Venda</button><button class="btn btn-outline" id="btnVendasEdit" onclick="toggleVendasEditMode()">' + (vendasEditMode ? '✅ Finalizar Edição' : '✏️ Editar Todos') + '</button><button class="btn btn-danger" onclick="deleteAllVendas()">🗑️ Excluir Todos</button></div></div>' +
    '<div class="dashboard-grid" id="vendasResultPanel"></div>' +
    '<div class="filter-bar">' +
      '<input type="text" class="form-control" style="max-width:250px" placeholder="Buscar venda..." oninput="onVendasSearch(this.value)">' +
      '<select class="form-control" style="max-width:160px" onchange="onVendasFilterSit(this.value)"><option value="">Situação (todas)</option>' + sitOpts + '</select>' +
    '</div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Vendedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>F.Pgto</th><th>Situação</th><th>Entrega</th><th>Ações</th></tr></thead><tbody id="vendasBody"></tbody></table></div>';
  vendasSearchQuery = '';
  vendasFilterSit = '';
  applyVendasFilters();
}

function renderVendasTable(vendas) {
  var tbody = document.getElementById('vendasBody'); if (!tbody) return;
  if (vendas.length === 0) { tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma venda encontrada</td></tr>'; return; }
  var sitOpts = (appData.situacaoVenda || []);
  var entOpts = (appData.situacaoEntrega || []);
  tbody.innerHTML = vendas.map(function (v) {
    var total = (v.quantidade || 1) * (v.valorUnit || 0);
    var sitSelect = '<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeVendaField(' + v.id + ',\'situacao\',this.value)">' + sitOpts.map(function (s) { return '<option value="' + s + '"' + (v.situacao === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>';
    var entSelect = '<select class="form-control" style="min-width:120px;padding:4px 6px;font-size:12px" onchange="changeVendaField(' + v.id + ',\'entrega\',this.value)">' + entOpts.map(function (e) { return '<option value="' + e + '"' + (v.entrega === e ? ' selected' : '') + '>' + e + '</option>'; }).join('') + '</select>';
    var acoes = vendasEditMode
      ? '<button class="btn btn-sm btn-outline" onclick="viewVenda(' + v.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editVenda(' + v.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteVenda(' + v.id + ')">🗑️</button>'
      : '<button class="btn btn-sm btn-outline" onclick="viewVenda(' + v.id + ')">👁️</button>';
    return '<tr><td>' + formatDate(v.data) + '</td><td>' + (v.produto || '-') + '</td><td>' + (v.cliente || '-') + '</td><td>' + (v.vendedor || '-') + '</td><td>' + (v.quantidade || 1) + '</td><td>' + formatCurrency(v.valorUnit) + '</td><td>' + formatCurrency(total) + '</td><td>' + (v.formaPagamento || '-') + '</td><td>' + sitSelect + '</td><td>' + entSelect + '</td><td>' + acoes + '</td></tr>';
  }).join('');
}

function changeVendaField(id, field, value) { var v = (appData.vendas || []).find(function (x) { return x.id === id; }); if (v) { v[field] = value; saveData(); applyVendasFilters(); } }

function openVendaModal(venda) {
  var isEdit = !!venda;
  var cliOpts = (appData.clientes || []).map(function (c) { return '<option value="' + c.nome + '"' + (venda && venda.cliente === c.nome ? ' selected' : '') + '>' + c.nome + '</option>'; }).join('');
  var vendOpts = (appData.vendedores || []).map(function (v) { return '<option value="' + v + '"' + (venda && venda.vendedor === v ? ' selected' : '') + '>' + v + '</option>'; }).join('');
  var pgtoOpts = (appData.formasPagamento || []).map(function (f) { return '<option value="' + f + '"' + (venda && venda.formaPagamento === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
  var sitOpts = (appData.situacaoVenda || []).map(function (s) { return '<option value="' + s + '"' + (venda && venda.situacao === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
  var entOpts = (appData.situacaoEntrega || []).map(function (e) { return '<option value="' + e + '"' + (venda && venda.entrega === e ? ' selected' : '') + '>' + e + '</option>'; }).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Venda' : 'Nova Venda';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="vnData" value="' + (venda ? venda.data : new Date().toISOString().split('T')[0]) + '"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="vnVenc" value="' + (venda ? venda.vencimento || '' : '') + '"></div></div>' +
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="vnProd" value="' + (venda ? venda.produto : '') + '"></div>' +
    '<div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="vnQtd" value="' + (venda ? venda.quantidade : 1) + '" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="vnValor" value="' + (venda ? venda.valorUnit : '') + '" step="0.01"></div></div>' +
    '<div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="vnCli"><option value="">Selecione...</option>' + cliOpts + '</select></div><div class="form-group"><label>Vendedor</label><select class="form-control" id="vnVend"><option value="">Selecione...</option>' + vendOpts + '</select></div></div>' +
    '<div class="form-row"><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="vnPgto"><option value="">Selecione...</option>' + pgtoOpts + '</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="vnSit">' + sitOpts + '</select></div></div>' +
    '<div class="form-group"><label>Entrega</label><select class="form-control" id="vnEnt">' + entOpts + '</select></div>' +
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="vnObs" rows="2">' + (venda ? venda.obs || '' : '') + '</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda(' + (isEdit ? venda.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}

function saveVenda(id) {
  var obj = { data: document.getElementById('vnData').value, vencimento: document.getElementById('vnVenc').value, produto: document.getElementById('vnProd').value.trim(), quantidade: parseFloat(document.getElementById('vnQtd').value) || 1, valorUnit: parseFloat(document.getElementById('vnValor').value) || 0, cliente: document.getElementById('vnCli').value, vendedor: document.getElementById('vnVend').value, formaPagamento: document.getElementById('vnPgto').value, situacao: document.getElementById('vnSit').value, entrega: document.getElementById('vnEnt').value, obs: document.getElementById('vnObs').value };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.vendas) appData.vendas = [];
  if (id) { var idx = appData.vendas.findIndex(function (v) { return v.id === id; }); if (idx > -1) { obj.id = id; appData.vendas[idx] = obj; } }
  else { obj.id = nextId(appData.vendas); appData.vendas.push(obj); }
  saveData(); closeCadastroModal(); renderVendasPage(); showToast(id ? 'Venda atualizada!' : 'Venda cadastrada!', 'success');
}

function editVenda(id) { var v = (appData.vendas || []).find(function (x) { return x.id === id; }); if (v) openVendaModal(v); }

function viewVenda(id) {
  var v = (appData.vendas || []).find(function (x) { return x.id === id; }); if (!v) return;
  var total = (v.quantidade || 1) * (v.valorUnit || 0);
  document.getElementById('viewModalTitle').textContent = 'Detalhes da Venda';
  document.getElementById('viewModalBody').innerHTML = '<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>' + formatDate(v.data) + '</div><div class="detail-item"><span class="detail-label">Vencimento</span>' + formatDate(v.vencimento) + '</div><div class="detail-item"><span class="detail-label">Produto</span>' + v.produto + '</div><div class="detail-item"><span class="detail-label">Qtd</span>' + v.quantidade + '</div><div class="detail-item"><span class="detail-label">V.Unit</span>' + formatCurrency(v.valorUnit) + '</div><div class="detail-item"><span class="detail-label">Total</span>' + formatCurrency(total) + '</div><div class="detail-item"><span class="detail-label">Cliente</span>' + (v.cliente || '-') + '</div><div class="detail-item"><span class="detail-label">Vendedor</span>' + (v.vendedor || '-') + '</div><div class="detail-item"><span class="detail-label">Pgto</span>' + (v.formaPagamento || '-') + '</div><div class="detail-item"><span class="detail-label">Situação</span>' + situacaoBadge(v.situacao) + '</div><div class="detail-item"><span class="detail-label">Entrega</span>' + situacaoBadge(v.entrega) + '</div></div>' + (v.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + v.obs + '</div>' : '');
  openViewModal();
}

function deleteVenda(id) { if (!confirm('Excluir venda?')) return; appData.vendas = (appData.vendas || []).filter(function (v) { return v.id !== id; }); saveData(); renderVendasPage(); showToast('Venda excluída!', 'success'); }
function toggleVendasEditMode() { vendasEditMode = !vendasEditMode; var btn = document.getElementById('btnVendasEdit'); if (btn) btn.textContent = vendasEditMode ? '✅ Finalizar Edição' : '✏️ Editar Todos'; applyVendasFilters(); }
function deleteAllVendas() { if (!confirm('Excluir TODAS as vendas?')) return; appData.vendas = []; saveData(); renderVendasPage(); showToast('Todas excluídas!', 'success'); }
function onVendasSearch(q) { vendasSearchQuery = q.toLowerCase(); applyVendasFilters(); }
function onVendasFilterSit(s) { vendasFilterSit = s; applyVendasFilters(); }
function applyVendasFilters() {
  var filtered = appData.vendas || [];
  if (vendasSearchQuery) filtered = filtered.filter(function (v) { return (v.produto || '').toLowerCase().includes(vendasSearchQuery) || (v.cliente || '').toLowerCase().includes(vendasSearchQuery); });
  if (vendasFilterSit) filtered = filtered.filter(function (v) { return v.situacao === vendasFilterSit; });
  renderVendasTable(filtered);
  renderVendasResultPanel(filtered);
}
function renderVendasResultPanel(filtered) {
  var panel = document.getElementById('vendasResultPanel'); if (!panel) return;
  var all = appData.vendas || [];
  var total = filtered.reduce(function (s, v) { return s + ((v.quantidade || 1) * (v.valorUnit || 0)); }, 0);
  var recebido = filtered.filter(function (v) { return v.situacao === 'Pago'; }).reduce(function (s, v) { return s + ((v.quantidade || 1) * (v.valorUnit || 0)); }, 0);
  var devendo = filtered.filter(function (v) { return v.situacao === 'Devendo'; }).reduce(function (s, v) { return s + ((v.quantidade || 1) * (v.valorUnit || 0)); }, 0);
  panel.innerHTML = '<div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">' + formatCurrency(total) + '</div><div class="card-sub">' + filtered.length + ' de ' + all.length + ' registros</div></div><div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">' + formatCurrency(recebido) + '</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">' + formatCurrency(devendo) + '</div></div>';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-EST-01 — ESTOQUE ──
// ══════════════════════════════════════════════════════════════
function renderEstoquePage() {
  var pg = document.getElementById('page-estoque'); if (!pg) return;
  var estoque = appData.estoque || [];
  pg.innerHTML =
    '<div class="page-header"><h2>📦 Estoque</h2><button class="btn btn-primary" onclick="openEstoqueModal()">+ Novo Item</button></div>' +
    '<div class="dashboard-grid">' +
      '<div class="card card-accent"><div class="card-header"><span>Total Itens</span></div><div class="card-value">' + estoque.length + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value text-success">' + formatCurrency(estoque.reduce(function (s, e) { return s + ((e.quantidade || 0) * (e.valorUnit || 0)); }, 0)) + '</div></div>' +
    '</div>' +
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar no estoque..." oninput="filterEstoque(this.value)"></div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Unidade</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Ações</th></tr></thead><tbody id="estoqueBody"></tbody></table></div>';
  renderEstoqueTable(estoque);
}
function renderEstoqueTable(items) {
  var tbody = document.getElementById('estoqueBody'); if (!tbody) return;
  if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum item</td></tr>'; return; }
  tbody.innerHTML = items.map(function (e) { return '<tr><td>' + (e.produto || '-') + '</td><td>' + (e.unidade || '-') + '</td><td>' + (e.quantidade || 0) + '</td><td>' + formatCurrency(e.valorUnit) + '</td><td>' + formatCurrency((e.quantidade || 0) * (e.valorUnit || 0)) + '</td><td><button class="btn btn-sm btn-primary" onclick="editEstoque(' + e.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteEstoque(' + e.id + ')">🗑️</button></td></tr>'; }).join('');
}
function filterEstoque(q) { q = q.toLowerCase(); renderEstoqueTable((appData.estoque || []).filter(function (e) { return (e.produto || '').toLowerCase().includes(q); })); }
function openEstoqueModal(item) {
  var isEdit = !!item;
  var unidOpts = (appData.tipoUnidade || []).map(function (u) { return '<option value="' + u + '"' + (item && item.unidade === u ? ' selected' : '') + '>' + u + '</option>'; }).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Item' : 'Novo Item';
  document.getElementById('cadastroModalBody').innerHTML = '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="estProd" value="' + (item ? item.produto : '') + '"></div><div class="form-row"><div class="form-group"><label>Unidade</label><select class="form-control" id="estUnid">' + unidOpts + '</select></div><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="estQtd" value="' + (item ? item.quantidade : 0) + '" min="0"></div></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="estValor" value="' + (item ? item.valorUnit : '') + '" step="0.01"></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEstoque(' + (isEdit ? item.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}
function saveEstoque(id) {
  var obj = { produto: document.getElementById('estProd').value.trim(), unidade: document.getElementById('estUnid').value, quantidade: parseFloat(document.getElementById('estQtd').value) || 0, valorUnit: parseFloat(document.getElementById('estValor').value) || 0 };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.estoque) appData.estoque = [];
  if (id) { var idx = appData.estoque.findIndex(function (e) { return e.id === id; }); if (idx > -1) { obj.id = id; appData.estoque[idx] = obj; } }
  else { obj.id = nextId(appData.estoque); appData.estoque.push(obj); }
  saveData(); closeCadastroModal(); renderEstoquePage(); showToast(id ? 'Atualizado!' : 'Cadastrado!', 'success');
}
function editEstoque(id) { var e = (appData.estoque || []).find(function (x) { return x.id === id; }); if (e) openEstoqueModal(e); }
function deleteEstoque(id) { if (!confirm('Excluir?')) return; appData.estoque = (appData.estoque || []).filter(function (e) { return e.id !== id; }); saveData(); renderEstoquePage(); showToast('Excluído!', 'success'); }

// ══════════════════════════════════════════════════════════════
// ── SCR-PRD-01 — PRODUTOS (COM upload imagem) ──
// ══════════════════════════════════════════════════════════════
function renderProdutosPage() {
  var pg = document.getElementById('page-produtos'); if (!pg) return;
  var items = appData.produtos || [];
  pg.innerHTML =
    '<div class="page-header"><h2>🏷️ Produtos</h2><button class="btn btn-primary" onclick="openProdutoModal()">+ Novo Produto</button></div>' +
    '<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Produtos</span></div><div class="card-value">' + items.length + '</div></div></div>' +
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto..." oninput="filterProdutos(this.value)"></div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th style="width:70px">Imagem</th><th>Nome</th><th>Categoria</th><th>Unidade</th><th>Preço</th><th>Ações</th></tr></thead><tbody id="produtosBody"></tbody></table></div>';
  renderProdutosTable(items);
}
function renderProdutosTable(items) {
  var tbody = document.getElementById('produtosBody'); if (!tbody) return;
  if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto</td></tr>'; return; }
  tbody.innerHTML = items.map(function (p) {
    var img = p.imagem ? '<img src="' + p.imagem + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="viewProduto(' + p.id + ')" onerror="this.style.display=\'none\'">' : '<span style="color:var(--text-muted)">—</span>';
    return '<tr><td>' + img + '</td><td>' + (p.nome || '-') + '</td><td>' + (p.categoria || '-') + '</td><td>' + (p.unidade || '-') + '</td><td>' + formatCurrency(p.preco) + '</td><td><button class="btn btn-sm btn-outline" onclick="viewProduto(' + p.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editProduto(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProduto(' + p.id + ')">🗑️</button></td></tr>';
  }).join('');
}
function filterProdutos(q) { q = q.toLowerCase(); renderProdutosTable((appData.produtos || []).filter(function (p) { return (p.nome || '').toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q); })); }
function openProdutoModal(prod) {
  var isEdit = !!prod;
  var unidOpts = (appData.tipoUnidade || []).map(function (u) { return '<option value="' + u + '"' + (prod && prod.unidade === u ? ' selected' : '') + '>' + u + '</option>'; }).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Produto' : 'Novo Produto';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prdNome" value="' + (prod ? prod.nome : '') + '"></div>' +
    '<div class="form-row"><div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="prdCat" value="' + (prod ? prod.categoria || '' : '') + '"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="prdUnid">' + unidOpts + '</select></div></div>' +
    '<div class="form-group"><label>Preço</label><input type="number" class="form-control" id="prdPreco" value="' + (prod ? prod.preco || '' : '') + '" step="0.01"></div>' +
    '<div class="form-group"><label>Imagem do Produto</label>' +
      '<div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center;margin-top:4px">' +
        '<input type="file" id="prdImgFile" accept="image/jpeg,image/png,image/webp" style="display:none">' +
        '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'prdImgFile\').click()" style="margin-bottom:8px">📁 Carregar Imagem do Computador</button>' +
        '<p style="font-size:.75rem;color:var(--text-muted);margin:4px 0 0 0">Tamanho ideal: <strong>500 x 500 px</strong> (quadrada) — JPG, PNG ou WEBP — Máx: 2 MB</p>' +
      '</div>' +
      '<div id="prdImgPreview" style="margin-top:10px;text-align:center">' + (prod && prod.imagem ? '<img src="' + prod.imagem + '" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover"><br><button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="document.getElementById(\'prdImgPreview\').innerHTML=\'\';document.getElementById(\'prdImgFile\').setAttribute(\'data-base64\',\'REMOVER\')">🗑️ Remover</button>' : '') + '</div>' +
    '</div>' +
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="prdObs" rows="2">' + (prod ? prod.obs || '' : '') + '</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduto(' + (isEdit ? prod.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
  setTimeout(function () { handleImageUpload('prdImgFile', 'prdImgPreview'); }, 50);
}
function saveProduto(id) {
  var imgInput = document.getElementById('prdImgFile');
  var base64 = imgInput ? imgInput.getAttribute('data-base64') : null;
  var imagem = '';
  if (base64 === 'REMOVER') imagem = '';
  else if (base64) imagem = base64;
  else if (id) { var ex = (appData.produtos || []).find(function (p) { return p.id === id; }); imagem = ex ? ex.imagem || '' : ''; }
  var obj = { nome: document.getElementById('prdNome').value.trim(), categoria: document.getElementById('prdCat').value.trim(), unidade: document.getElementById('prdUnid').value, preco: parseFloat(document.getElementById('prdPreco').value) || 0, imagem: imagem, obs: document.getElementById('prdObs').value.trim() };
  if (!obj.nome) { showToast('Informe o nome', 'error'); return; }
  if (!appData.produtos) appData.produtos = [];
  if (id) { var idx = appData.produtos.findIndex(function (p) { return p.id === id; }); if (idx > -1) { obj.id = id; appData.produtos[idx] = obj; } }
  else { obj.id = nextId(appData.produtos); appData.produtos.push(obj); }
  saveData(); closeCadastroModal(); renderProdutosPage(); showToast(id ? 'Atualizado!' : 'Cadastrado!', 'success');
}
function editProduto(id) { var p = (appData.produtos || []).find(function (x) { return x.id === id; }); if (p) openProdutoModal(p); }
function deleteProduto(id) { if (!confirm('Excluir?')) return; appData.produtos = (appData.produtos || []).filter(function (p) { return p.id !== id; }); saveData(); renderProdutosPage(); showToast('Excluído!', 'success'); }
function viewProduto(id) {
  var p = (appData.produtos || []).find(function (x) { return x.id === id; }); if (!p) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes do Produto';
  document.getElementById('viewModalBody').innerHTML = '<div style="text-align:center;margin-bottom:16px">' + (p.imagem ? '<img src="' + p.imagem + '" style="max-width:300px;max-height:250px;border-radius:10px;object-fit:cover">' : '<span style="color:var(--text-muted)">Sem imagem</span>') + '</div><div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>' + (p.nome || '-') + '</div><div class="detail-item"><span class="detail-label">Categoria</span>' + (p.categoria || '-') + '</div><div class="detail-item"><span class="detail-label">Unidade</span>' + (p.unidade || '-') + '</div><div class="detail-item"><span class="detail-label">Preço</span>' + formatCurrency(p.preco) + '</div></div>' + (p.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + p.obs + '</div>' : '');
  openViewModal();
}

// ══════════════════════════════════════════════════════════════
// ── SCR-PFN-01 — P. FORNECEDORES (COM upload imagem) ──
// ══════════════════════════════════════════════════════════════
function renderPFornecedoresPage() {
  var pg = document.getElementById('page-pfornecedores'); if (!pg) return;
  var items = appData.pFornecedores || [];
  pg.innerHTML =
    '<div class="page-header"><h2>📋 P. Fornecedores</h2><button class="btn btn-primary" onclick="openPFornModal()">+ Novo Produto</button></div>' +
    '<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">' + items.length + '</div></div></div>' +
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPForn(this.value)"></div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th style="width:70px">Imagem</th><th>Produto</th><th>Fornecedor</th><th>Categoria</th><th>Unidade</th><th>Preço</th><th>Ações</th></tr></thead><tbody id="pfornBody"></tbody></table></div>';
  renderPFornTable(items);
}
function renderPFornTable(items) {
  var tbody = document.getElementById('pfornBody'); if (!tbody) return;
  if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>'; return; }
  tbody.innerHTML = items.map(function (p) {
    var img = p.imagem ? '<img src="' + p.imagem + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="viewPForn(' + p.id + ')" onerror="this.style.display=\'none\'">' : '<span style="color:var(--text-muted)">—</span>';
    return '<tr><td>' + img + '</td><td>' + (p.produto || p.nome || '-') + '</td><td>' + (p.fornecedor || '-') + '</td><td>' + (p.categoria || '-') + '</td><td>' + (p.unidade || '-') + '</td><td>' + formatCurrency(p.preco) + '</td><td><button class="btn btn-sm btn-outline" onclick="viewPForn(' + p.id + ')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editPForn(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePForn(' + p.id + ')">🗑️</button></td></tr>';
  }).join('');
}
function filterPForn(q) { q = q.toLowerCase(); renderPFornTable((appData.pFornecedores || []).filter(function (p) { return (p.produto || p.nome || '').toLowerCase().includes(q) || (p.fornecedor || '').toLowerCase().includes(q); })); }
function openPFornModal(prod) {
  var isEdit = !!prod;
  var fornOpts = (appData.fornecedores || []).map(function (f) { return '<option value="' + f.nome + '"' + (prod && prod.fornecedor === f.nome ? ' selected' : '') + '>' + f.nome + '</option>'; }).join('');
  var unidOpts = (appData.tipoUnidade || []).map(function (u) { return '<option value="' + u + '"' + (prod && prod.unidade === u ? ' selected' : '') + '>' + u + '</option>'; }).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Produto Fornecedor' : 'Novo Produto Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="pfProd" value="' + (prod ? prod.produto || prod.nome || '' : '') + '"></div>' +
    '<div class="form-group"><label>Fornecedor *</label><select class="form-control" id="pfForn"><option value="">Selecione...</option>' + fornOpts + '</select></div>' +
    '<div class="form-row"><div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="pfCat" value="' + (prod ? prod.categoria || '' : '') + '"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="pfUnid">' + unidOpts + '</select></div></div>' +
    '<div class="form-group"><label>Preço</label><input type="number" class="form-control" id="pfPreco" value="' + (prod ? prod.preco || '' : '') + '" step="0.01"></div>' +
    '<div class="form-group"><label>Imagem do Produto</label>' +
      '<div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center;margin-top:4px">' +
        '<input type="file" id="pfImgFile" accept="image/jpeg,image/png,image/webp" style="display:none">' +
        '<button type="button" class="btn btn-outline" onclick="document.getElementById(\'pfImgFile\').click()" style="margin-bottom:8px">📁 Carregar Imagem</button>' +
        '<p style="font-size:.75rem;color:var(--text-muted);margin:4px 0 0 0">Tamanho ideal: <strong>500 x 500 px</strong> — JPG, PNG ou WEBP — Máx: 2 MB</p>' +
      '</div>' +
      '<div id="pfImgPreview" style="margin-top:10px;text-align:center">' + (prod && prod.imagem ? '<img src="' + prod.imagem + '" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover"><br><button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="document.getElementById(\'pfImgPreview\').innerHTML=\'\';document.getElementById(\'pfImgFile\').setAttribute(\'data-base64\',\'REMOVER\')">🗑️ Remover</button>' : '') + '</div>' +
    '</div>' +
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="pfObs" rows="2">' + (prod ? prod.obs || '' : '') + '</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePForn(' + (isEdit ? prod.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
  setTimeout(function () { handleImageUpload('pfImgFile', 'pfImgPreview'); }, 50);
}
function savePForn(id) {
  var imgInput = document.getElementById('pfImgFile');
  var base64 = imgInput ? imgInput.getAttribute('data-base64') : null;
  var imagem = '';
  if (base64 === 'REMOVER') imagem = '';
  else if (base64) imagem = base64;
  else if (id) { var ex = (appData.pFornecedores || []).find(function (p) { return p.id === id; }); imagem = ex ? ex.imagem || '' : ''; }
  var obj = { produto: document.getElementById('pfProd').value.trim(), fornecedor: document.getElementById('pfForn').value, categoria: document.getElementById('pfCat').value.trim(), unidade: document.getElementById('pfUnid').value, preco: parseFloat(document.getElementById('pfPreco').value) || 0, imagem: imagem, obs: document.getElementById('pfObs').value.trim() };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!obj.fornecedor) { showToast('Selecione o fornecedor', 'error'); return; }
  if (!appData.pFornecedores) appData.pFornecedores = [];
  if (id) { var idx = appData.pFornecedores.findIndex(function (p) { return p.id === id; }); if (idx > -1) { obj.id = id; appData.pFornecedores[idx] = obj; } }
  else { obj.id = nextId(appData.pFornecedores); appData.pFornecedores.push(obj); }
  saveData(); closeCadastroModal(); renderPFornecedoresPage(); showToast(id ? 'Atualizado!' : 'Cadastrado!', 'success');
}
function editPForn(id) { var p = (appData.pFornecedores || []).find(function (x) { return x.id === id; }); if (p) openPFornModal(p); }
function deletePForn(id) { if (!confirm('Excluir?')) return; appData.pFornecedores = (appData.pFornecedores || []).filter(function (p) { return p.id !== id; }); saveData(); renderPFornecedoresPage(); showToast('Excluído!', 'success'); }
function viewPForn(id) {
  var p = (appData.pFornecedores || []).find(function (x) { return x.id === id; }); if (!p) return;
  document.getElementById('viewModalTitle').textContent = 'Detalhes do Produto (Fornecedor)';
  document.getElementById('viewModalBody').innerHTML = '<div style="text-align:center;margin-bottom:16px">' + (p.imagem ? '<img src="' + p.imagem + '" style="max-width:300px;max-height:250px;border-radius:10px;object-fit:cover">' : '<span style="color:var(--text-muted)">Sem imagem</span>') + '</div><div class="detail-grid"><div class="detail-item"><span class="detail-label">Produto</span>' + (p.produto || p.nome || '-') + '</div><div class="detail-item"><span class="detail-label">Fornecedor</span>' + (p.fornecedor || '-') + '</div><div class="detail-item"><span class="detail-label">Categoria</span>' + (p.categoria || '-') + '</div><div class="detail-item"><span class="detail-label">Unidade</span>' + (p.unidade || '-') + '</div><div class="detail-item"><span class="detail-label">Preço</span>' + formatCurrency(p.preco) + '</div></div>' + (p.obs ? '<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ' + p.obs + '</div>' : '');
  openViewModal();
}

// ══════════════════════════════════════════════════════════════
// ── SCR-BOL-01 — BOLETOS ──
// ══════════════════════════════════════════════════════════════
function renderBoletosPage() {
  var pg = document.getElementById('page-boletos'); if (!pg) return;
  var boletos = appData.boletos || [];
  var totalPendente = boletos.filter(function (b) { return b.situacao !== 'Pago'; }).reduce(function (s, b) { return s + (b.valor || 0); }, 0);
  pg.innerHTML =
    '<div class="page-header"><h2>📄 Boletos</h2><button class="btn btn-primary" onclick="openBoletoModal()">+ Novo Boleto</button></div>' +
    '<div class="dashboard-grid">' +
      '<div class="card card-accent"><div class="card-header"><span>Total Boletos</span></div><div class="card-value">' + boletos.length + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-danger">' + formatCurrency(totalPendente) + '</div></div>' +
    '</div>' +
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar boleto..." oninput="filterBoletos(this.value)"></div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Situação</th><th>Dias Rest.</th><th>Ações</th></tr></thead><tbody id="boletosBody"></tbody></table></div>';
  renderBoletosTable(boletos);
}
function renderBoletosTable(items) {
  var tbody = document.getElementById('boletosBody'); if (!tbody) return;
  if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>'; return; }
  tbody.innerHTML = items.map(function (b) {
    var dias = calcDiasRestantes(b.vencimento);
    var sitAuto = b.situacao;
    if (b.situacao === 'Pendente' && dias !== null && dias < 0) sitAuto = 'Vencido';
    var rowStyle = '';
    if (sitAuto === 'Vencido') rowStyle = 'color:#e53e3e;';
    else if (sitAuto === 'Pago') rowStyle = 'color:#38a169;';
    return '<tr style="' + rowStyle + '"><td>' + (b.descricao || '-') + '</td><td>' + formatCurrency(b.valor) + '</td><td>' + formatDate(b.vencimento) + '</td><td>' + situacaoBadge(sitAuto) + '</td><td>' + formatDiasRestantes(dias, b.situacao) + '</td><td><button class="btn btn-sm btn-primary" onclick="editBoleto(' + b.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBoleto(' + b.id + ')">🗑️</button></td></tr>';
  }).join('');
}
function filterBoletos(q) { q = q.toLowerCase(); renderBoletosTable((appData.boletos || []).filter(function (b) { return (b.descricao || '').toLowerCase().includes(q); })); }
function openBoletoModal(bol) {
  var isEdit = !!bol;
  var sitOpts = (appData.situacaoBoleto || []).map(function (s) { return '<option value="' + s + '"' + (bol && bol.situacao === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Boleto' : 'Novo Boleto';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="bolDesc" value="' + (bol ? bol.descricao || '' : '') + '"></div>' +
    '<div class="form-row"><div class="form-group"><label>Valor *</label><input type="number" class="form-control" id="bolValor" value="' + (bol ? bol.valor || '' : '') + '" step="0.01"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="bolVenc" value="' + (bol ? bol.vencimento || '' : '') + '"></div></div>' +
    '<div class="form-group"><label>Situação</label><select class="form-control" id="bolSit">' + sitOpts + '</select></div>' +
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="bolObs" rows="2">' + (bol ? bol.obs || '' : '') + '</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBoleto(' + (isEdit ? bol.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}
function saveBoleto(id) {
  var obj = { descricao: document.getElementById('bolDesc').value.trim(), valor: parseFloat(document.getElementById('bolValor').value) || 0, vencimento: document.getElementById('bolVenc').value, situacao: document.getElementById('bolSit').value, obs: document.getElementById('bolObs').value.trim() };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.boletos) appData.boletos = [];
  if (id) { var idx = appData.boletos.findIndex(function (b) { return b.id === id; }); if (idx > -1) { obj.id = id; appData.boletos[idx] = obj; } }
  else { obj.id = nextId(appData.boletos); appData.boletos.push(obj); }
  saveData(); closeCadastroModal(); renderBoletosPage(); showToast(id ? 'Atualizado!' : 'Cadastrado!', 'success');
}
function editBoleto(id) { var b = (appData.boletos || []).find(function (x) { return x.id === id; }); if (b) openBoletoModal(b); }
function deleteBoleto(id) { if (!confirm('Excluir?')) return; appData.boletos = (appData.boletos || []).filter(function (b) { return b.id !== id; }); saveData(); renderBoletosPage(); showToast('Excluído!', 'success'); }

// ══════════════════════════════════════════════════════════════
// ── SCR-CHQ-01 — CHEQUES ──
// ══════════════════════════════════════════════════════════════
function renderChequesPage() {
  var pg = document.getElementById('page-cheques'); if (!pg) return;
  var cheques = appData.cheques || [];
  var totalPendente = cheques.filter(function (ch) { return ch.situacao !== 'Compensado'; }).reduce(function (s, ch) { return s + (ch.valor || 0); }, 0);
  pg.innerHTML =
    '<div class="page-header"><h2>📝 Cheques</h2><button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button></div>' +
    '<div class="dashboard-grid">' +
      '<div class="card card-accent"><div class="card-header"><span>Total Cheques</span></div><div class="card-value">' + cheques.length + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-warning">' + formatCurrency(totalPendente) + '</div></div>' +
    '</div>' +
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cheque..." oninput="filterCheques(this.value)"></div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Situação</th><th>Dias Rest.</th><th>Ações</th></tr></thead><tbody id="chequesBody"></tbody></table></div>';
  renderChequesTable(cheques);
}
function renderChequesTable(items) {
  var tbody = document.getElementById('chequesBody'); if (!tbody) return;
  if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>'; return; }
  tbody.innerHTML = items.map(function (ch) {
    var dias = calcDiasRestantes(ch.vencimento);
    var rowStyle = '';
    if (ch.situacao === 'Devolvido') rowStyle = 'color:#e53e3e;';
    else if (ch.situacao === 'Compensado') rowStyle = 'color:#38a169;';
    else if (dias !== null && dias < 0) rowStyle = 'color:#e53e3e;';
    return '<tr style="' + rowStyle + '"><td>' + (ch.descricao || '-') + '</td><td>' + formatCurrency(ch.valor) + '</td><td>' + formatDate(ch.vencimento) + '</td><td>' + situacaoBadge(ch.situacao) + '</td><td>' + formatDiasRestantes(dias, ch.situacao) + '</td><td><button class="btn btn-sm btn-primary" onclick="editCheque(' + ch.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCheque(' + ch.id + ')">🗑️</button></td></tr>';
  }).join('');
}
function filterCheques(q) { q = q.toLowerCase(); renderChequesTable((appData.cheques || []).filter(function (ch) { return (ch.descricao || '').toLowerCase().includes(q); })); }
function openChequeModal(ch) {
  var isEdit = !!ch;
  var sitOpts = (appData.situacaoCheque || []).map(function (s) { return '<option value="' + s + '"' + (ch && ch.situacao === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Cheque' : 'Novo Cheque';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="chqDesc" value="' + (ch ? ch.descricao || '' : '') + '"></div>' +
    '<div class="form-row"><div class="form-group"><label>Valor *</label><input type="number" class="form-control" id="chqValor" value="' + (ch ? ch.valor || '' : '') + '" step="0.01"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="chqVenc" value="' + (ch ? ch.vencimento || '' : '') + '"></div></div>' +
    '<div class="form-group"><label>Situação</label><select class="form-control" id="chqSit">' + sitOpts + '</select></div>' +
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="chqObs" rows="2">' + (ch ? ch.obs || '' : '') + '</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCheque(' + (isEdit ? ch.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}
function saveCheque(id) {
  var obj = { descricao: document.getElementById('chqDesc').value.trim(), valor: parseFloat(document.getElementById('chqValor').value) || 0, vencimento: document.getElementById('chqVenc').value, situacao: document.getElementById('chqSit').value, obs: document.getElementById('chqObs').value.trim() };
  if (!obj.descricao) { showToast('Informe a descrição', 'error'); return; }
  if (!appData.cheques) appData.cheques = [];
  if (id) { var idx = appData.cheques.findIndex(function (ch) { return ch.id === id; }); if (idx > -1) { obj.id = id; appData.cheques[idx] = obj; } }
  else { obj.id = nextId(appData.cheques); appData.cheques.push(obj); }
  saveData(); closeCadastroModal(); renderChequesPage(); showToast(id ? 'Atualizado!' : 'Cadastrado!', 'success');
}
function editCheque(id) { var ch = (appData.cheques || []).find(function (x) { return x.id === id; }); if (ch) openChequeModal(ch); }
function deleteCheque(id) { if (!confirm('Excluir?')) return; appData.cheques = (appData.cheques || []).filter(function (ch) { return ch.id !== id; }); saveData(); renderChequesPage(); showToast('Excluído!', 'success'); }

// ══════════════════════════════════════════════════════════════
// ── SCR-GAR-01 — GARANTIAS (v9 — cálculo corrigido) ──
// ══════════════════════════════════════════════════════════════
function renderGarantiasPage() {
  var pg = document.getElementById('page-garantias'); if (!pg) return;
  var garantias = appData.garantias || [];
  var ativas = garantias.filter(function (g) { return getGarantiaSituacaoAuto(g.dataInicio, g.diasGarantia, g.situacao) === 'Ativa'; }).length;
  var vencidas = garantias.filter(function (g) { return getGarantiaSituacaoAuto(g.dataInicio, g.diasGarantia, g.situacao) === 'Vencida'; }).length;
  pg.innerHTML =
    '<div class="page-header"><h2>🛡️ Garantias</h2><button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button></div>' +
    '<div class="dashboard-grid">' +
      '<div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">' + garantias.length + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Ativas</span></div><div class="card-value text-success">' + ativas + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Vencidas</span></div><div class="card-value text-danger">' + vencidas + '</div></div>' +
    '</div>' +
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar garantia..." oninput="filterGarantias(this.value)"></div>' +
    '<div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Cliente</th><th>Data Início</th><th>Dias Gar.</th><th>Situação</th><th>Dias Rest.</th><th>Obs</th><th>Ações</th></tr></thead><tbody id="garantiasBody"></tbody></table></div>';
  renderGarantiasTable(garantias);
}
function renderGarantiasTable(items) {
  var tbody = document.getElementById('garantiasBody'); if (!tbody) return;
  if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>'; return; }
  tbody.innerHTML = items.map(function (g) {
    var dias = calcDiasGarantia(g.dataInicio, g.diasGarantia);
    var sitAuto = getGarantiaSituacaoAuto(g.dataInicio, g.diasGarantia, g.situacao);
    var rowStyle = '';
    if (sitAuto === 'Vencida' || sitAuto === 'Perdeu a Garantia') rowStyle = 'color:#e53e3e;';
    else if (sitAuto === 'Ativa') rowStyle = 'color:#38a169;';
    return '<tr style="' + rowStyle + '"><td>' + (g.produto || '-') + '</td><td>' + (g.cliente || '-') + '</td><td>' + formatDate(g.dataInicio) + '</td><td>' + (g.diasGarantia || '-') + '</td><td>' + situacaoBadge(sitAuto) + '</td><td>' + formatDiasGarantia(dias, sitAuto) + '</td><td>' + (g.obs || '-') + '</td><td><button class="btn btn-sm btn-primary" onclick="editGarantia(' + g.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGarantia(' + g.id + ')">🗑️</button></td></tr>';
  }).join('');
}
function filterGarantias(q) { q = q.toLowerCase(); renderGarantiasTable((appData.garantias || []).filter(function (g) { return (g.produto || '').toLowerCase().includes(q) || (g.cliente || '').toLowerCase().includes(q); })); }
function openGarantiaModal(gar) {
  var isEdit = !!gar;
  var sitOpts = (appData.situacaoGarantia || []).map(function (s) { return '<option value="' + s + '"' + (gar && gar.situacao === s ? ' selected' : '') + '>' + s + '</option>'; }).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Garantia' : 'Nova Garantia';
  document.getElementById('cadastroModalBody').innerHTML =
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="garProd" value="' + (gar ? gar.produto || '' : '') + '"></div>' +
    '<div class="form-group"><label>Cliente</label><input type="text" class="form-control" id="garCli" value="' + (gar ? gar.cliente || '' : '') + '"></div>' +
    '<div class="form-row"><div class="form-group"><label>Data Início *</label><input type="date" class="form-control" id="garData" value="' + (gar ? gar.dataInicio || '' : new Date().toISOString().split('T')[0]) + '"></div><div class="form-group"><label>Dias de Garantia *</label><input type="number" class="form-control" id="garDias" value="' + (gar ? gar.diasGarantia || 365 : 365) + '" min="1"></div></div>' +
    '<div class="form-group"><label>Situação (manual)</label><select class="form-control" id="garSit">' + sitOpts + '</select><p style="font-size:.75rem;color:var(--text-muted);margin-top:4px">Deixe "Ativa" para cálculo automático. Use "Perdeu a Garantia" para definir manualmente.</p></div>' +
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="garObs" rows="2">' + (gar ? gar.obs || '' : '') + '</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGarantia(' + (isEdit ? gar.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
}
function saveGarantia(id) {
  var obj = { produto: document.getElementById('garProd').value.trim(), cliente: document.getElementById('garCli').value.trim(), dataInicio: document.getElementById('garData').value, diasGarantia: parseInt(document.getElementById('garDias').value) || 365, situacao: document.getElementById('garSit').value, obs: document.getElementById('garObs').value.trim() };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!obj.dataInicio) { showToast('Informe a data de início', 'error'); return; }
  if (!appData.garantias) appData.garantias = [];
  if (id) { var idx = appData.garantias.findIndex(function (g) { return g.id === id; }); if (idx > -1) { obj.id = id; appData.garantias[idx] = obj; } }
  else { obj.id = nextId(appData.garantias); appData.garantias.push(obj); }
  saveData(); closeCadastroModal(); renderGarantiasPage(); showToast(id ? 'Atualizado!' : 'Cadastrado!', 'success');
}
function editGarantia(id) { var g = (appData.garantias || []).find(function (x) { return x.id === id; }); if (g) openGarantiaModal(g); }
function deleteGarantia(id) { if (!confirm('Excluir?')) return; appData.garantias = (appData.garantias || []).filter(function (g) { return g.id !== id; }); saveData(); renderGarantiasPage(); showToast('Excluído!', 'success'); }

// ══════════════════════════════════════════════════════════════
// ── SCR-GEN-01 — CRUD GENÉRICO (clientes, fornecedores, etc.) ──
// ══════════════════════════════════════════════════════════════
function getGenericConfig(page) {
  var configs = {
    clientes: { title: 'Clientes', icon: '👥', key: 'clientes', fields: [
      { name: 'nome', label: 'Nome *', type: 'text', required: true },
      { name: 'cpfCnpj', label: 'CPF/CNPJ', type: 'text' },
      { name: 'telefone', label: 'Telefone', type: 'text' },
      { name: 'celular', label: 'Celular', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'endereco', label: 'Endereço', type: 'text' },
      { name: 'cidade', label: 'Cidade', type: 'text' },
      { name: 'obs', label: 'Obs', type: 'textarea' }
    ] },
    fornecedores: { title: 'Fornecedores', icon: '🏭', key: 'fornecedores', fields: [
      { name: 'nome', label: 'Nome *', type: 'text', required: true },
      { name: 'cpfCnpj', label: 'CNPJ', type: 'text' },
      { name: 'telefone', label: 'Telefone', type: 'text' },
      { name: 'celular', label: 'Celular', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'endereco', label: 'Endereço', type: 'text' },
      { name: 'cidade', label: 'Cidade', type: 'text' },
      { name: 'obs', label: 'Obs', type: 'textarea' }
    ] },
    prestacoes: { title: 'Prestações', icon: '💳', key: 'prestacoes', fields: [
      { name: 'descricao', label: 'Descrição *', type: 'text', required: true },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'parcelas', label: 'Parcelas', type: 'number' },
      { name: 'vencimento', label: 'Vencimento', type: 'date' },
      { name: 'situacao', label: 'Situação', type: 'text' },
      { name: 'obs', label: 'Obs', type: 'textarea' }
    ] },
    projetos: { title: 'Projetos', icon: '📐', key: 'projetos', fields: [
      { name: 'nome', label: 'Nome *', type: 'text', required: true },
      { name: 'cliente', label: 'Cliente', type: 'text' },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'dataInicio', label: 'Data Início', type: 'date' },
      { name: 'dataFim', label: 'Data Fim', type: 'date' },
      { name: 'situacao', label: 'Situação', type: 'text' },
      { name: 'obs', label: 'Obs', type: 'textarea' }
    ] },
    pagclientes: { title: 'Pag. Clientes', icon: '💵', key: 'pagClientes', fields: [
      { name: 'cliente', label: 'Cliente *', type: 'text', required: true },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'data', label: 'Data', type: 'date' },
      { name: 'formaPagamento', label: 'Forma Pgto', type: 'text' },
      { name: 'obs', label: 'Obs', type: 'textarea' }
    ] },
    notasentrada: { title: 'Notas Entrada', icon: '📥', key: 'notasEntrada', fields: [
      { name: 'numero', label: 'Número *', type: 'text', required: true },
      { name: 'fornecedor', label: 'Fornecedor', type: 'text' },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'data', label: 'Data', type: 'date' },
      { name: 'obs', label: 'Obs', type: 'textarea' }
    ] },
    notassaida: { title: 'Notas Saída', icon: '📤', key: 'notasSaida', fields: [
      { name: 'numero', label: 'Número *', type: 'text', required: true },
      { name: 'cliente', label: 'Cliente', type: 'text' },
      { name: 'valor', label: 'Valor', type: 'number' },
      { name: 'data', label: 'Data', type: 'date' },
      { name: 'obs', label: 'Obs', type: 'textarea' }
    ] },
    receitasmei: { title: 'Receitas MEI', icon: '📊', key: 'receitasMei', fields: [
      { name: 'mes', label: 'Mês *', type: 'text', required: true },
      { name: 'receita', label: 'Receita', type: 'number' },
      { name: 'obs', label: 'Obs', type: 'textarea' }
    ] }
  };
  return configs[page] || null;
}

function genericCrudPage(page) {
  var cfg = getGenericConfig(page);
  if (!cfg) return;
  var pg = document.getElementById('page-' + page); if (!pg) return;
  var items = appData[cfg.key] || [];
  var headers = cfg.fields.filter(function (f) { return f.type !== 'textarea'; }).slice(0, 5);
  pg.innerHTML =
    '<div class="page-header"><h2>' + cfg.icon + ' ' + cfg.title + '</h2><button class="btn btn-primary" onclick="openGenericModal(\'' + page + '\')">+ Novo</button></div>' +
    '<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">' + items.length + '</div></div></div>' +
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterGeneric(\'' + page + '\',this.value)"></div>' +
    '<div class="table-responsive"><table class="table"><thead><tr>' + headers.map(function (h) { return '<th>' + h.label.replace(' *', '') + '</th>'; }).join('') + '<th>Ações</th></tr></thead><tbody id="genericBody_' + page + '"></tbody></table></div>';
  renderGenericTable(page, items);
}

function renderGenericTable(page, items) {
  var cfg = getGenericConfig(page); if (!cfg) return;
  var tbody = document.getElementById('genericBody_' + page); if (!tbody) return;
  var headers = cfg.fields.filter(function (f) { return f.type !== 'textarea'; }).slice(0, 5);
  var cols = headers.length + 1;
  if (items.length === 0) { tbody.innerHTML = '<tr><td colspan="' + cols + '" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>'; return; }
  tbody.innerHTML = items.map(function (item) {
    var cells = headers.map(function (h) {
      var val = item[h.name];
      if (h.type === 'number') return '<td>' + formatCurrency(val) + '</td>';
      if (h.type === 'date') return '<td>' + formatDate(val) + '</td>';
      return '<td>' + (val || '-') + '</td>';
    }).join('');
    return '<tr>' + cells + '<td><button class="btn btn-sm btn-primary" onclick="editGeneric(\'' + page + '\',' + item.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGeneric(\'' + page + '\',' + item.id + ')">🗑️</button></td></tr>';
  }).join('');
}

function filterGeneric(page, q) {
  var cfg = getGenericConfig(page); if (!cfg) return;
  q = q.toLowerCase();
  var items = (appData[cfg.key] || []).filter(function (item) {
    return cfg.fields.some(function (f) { return (item[f.name] || '').toString().toLowerCase().includes(q); });
  });
  renderGenericTable(page, items);
}

function openGenericModal(page, item) {
  var cfg = getGenericConfig(page); if (!cfg) return;
  var isEdit = !!item;
  document.getElementById('cadastroModalTitle').textContent = (isEdit ? 'Editar ' : 'Novo ') + cfg.title.replace(/s$/, '');
  document.getElementById('cadastroModalBody').innerHTML = cfg.fields.map(function (f) {
    var val = item ? (item[f.name] || '') : (f.type === 'date' ? '' : '');
    if (f.type === 'textarea') return '<div class="form-group"><label>' + f.label + '</label><textarea class="form-control" id="gen_' + f.name + '" rows="2">' + val + '</textarea></div>';
    return '<div class="form-group"><label>' + f.label + '</label><input type="' + f.type + '" class="form-control" id="gen_' + f.name + '" value="' + val + '"' + (f.type === 'number' ? ' step="0.01"' : '') + '></div>';
  }).join('');
  document.getElementById('cadastroModalFooter').innerHTML = '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGeneric(\'' + page + '\',' + (isEdit ? item.id : 'null') + ')">Salvar</button>';
  openCadastroModal();
  applyAllMasks();
}

function saveGeneric(page, id) {
  var cfg = getGenericConfig(page); if (!cfg) return;
  var obj = {};
  var valid = true;
  cfg.fields.forEach(function (f) {
    var el = document.getElementById('gen_' + f.name);
    var val = el ? el.value : '';
    if (f.type === 'number') val = parseFloat(val) || 0;
    else val = val.trim ? val.trim() : val;
    obj[f.name] = val;
    if (f.required && !val) { showToast('Preencha ' + f.label.replace(' *', ''), 'error'); valid = false; }
  });
  if (!valid) return;
  if (!appData[cfg.key]) appData[cfg.key] = [];
  if (id) { var idx = appData[cfg.key].findIndex(function (x) { return x.id === id; }); if (idx > -1) { obj.id = id; appData[cfg.key][idx] = obj; } }
  else { obj.id = nextId(appData[cfg.key]); appData[cfg.key].push(obj); }
  saveData(); closeCadastroModal(); genericCrudPage(page); showToast(id ? 'Atualizado!' : 'Cadastrado!', 'success');
}

function editGeneric(page, id) {
  var cfg = getGenericConfig(page); if (!cfg) return;
  var item = (appData[cfg.key] || []).find(function (x) { return x.id === id; });
  if (item) openGenericModal(page, item);
}

function deleteGeneric(page, id) {
  if (!confirm('Excluir registro?')) return;
  var cfg = getGenericConfig(page); if (!cfg) return;
  appData[cfg.key] = (appData[cfg.key] || []).filter(function (x) { return x.id !== id; });
  saveData(); genericCrudPage(page); showToast('Excluído!', 'success');
}

// Render wrappers for each generic page
function renderClientesPage() { genericCrudPage('clientes'); }
function renderFornecedoresPage() { genericCrudPage('fornecedores'); }
function renderPrestacoesPage() { genericCrudPage('prestacoes'); }
function renderProjetosPage() { genericCrudPage('projetos'); }
function renderPagClientesPage() { genericCrudPage('pagclientes'); }
function renderNotasEntradaPage() { genericCrudPage('notasentrada'); }
function renderNotasSaidaPage() { genericCrudPage('notassaida'); }
function renderReceitasMeiPage() { genericCrudPage('receitasmei'); }

// ══════════════════════════════════════════════════════════════
// ── SCR-REL-01 — RELATÓRIOS ──
// ══════════════════════════════════════════════════════════════
function renderRelatoriosPage() {
  var pg = document.getElementById('page-relatorios'); if (!pg) return;
  var compras = appData.compras || [];
  var vendas = appData.vendas || [];
  var totalCompras = compras.reduce(function (s, c) { return s + ((c.quantidade || 1) * (c.valorUnit || 0)); }, 0);
  var totalVendas = vendas.reduce(function (s, v) { return s + ((v.quantidade || 1) * (v.valorUnit || 0)); }, 0);
  var lucro = totalVendas - totalCompras;
  pg.innerHTML =
    '<div class="page-header"><h2>📊 Relatórios</h2></div>' +
    '<div class="dashboard-grid">' +
      '<div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">' + formatCurrency(totalCompras) + '</div><div class="card-sub">' + compras.length + ' registros</div></div>' +
      '<div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">' + formatCurrency(totalVendas) + '</div><div class="card-sub">' + vendas.length + ' registros</div></div>' +
      '<div class="card"><div class="card-header"><span>Lucro</span></div><div class="card-value ' + (lucro >= 0 ? 'text-success' : 'text-danger') + '">' + formatCurrency(lucro) + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Estoque</span></div><div class="card-value">' + (appData.estoque || []).length + ' itens</div></div>' +
      '<div class="card"><div class="card-header"><span>Clientes</span></div><div class="card-value">' + (appData.clientes || []).length + '</div></div>' +
      '<div class="card"><div class="card-header"><span>Fornecedores</span></div><div class="card-value">' + (appData.fornecedores || []).length + '</div></div>' +
    '</div>';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-CFG-02 — CONFIGURAÇÕES ──
// ══════════════════════════════════════════════════════════════
function renderConfiguracoesPage() {
  var pg = document.getElementById('page-configuracoes'); if (!pg) return;
  var emp = appData.empresa || {};
  pg.innerHTML =
    '<div class="page-header"><h2>⚙️ Configurações</h2></div>' +
    '<div class="card" style="max-width:600px">' +
      '<div class="card-header"><span>Dados da Empresa</span></div>' +
      '<div style="padding:16px">' +
        '<div class="form-group"><label>Nome da Empresa</label><input type="text" class="form-control" id="cfgNome" value="' + (emp.nome || '') + '"></div>' +
        '<div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="' + (emp.cnpj || '') + '"></div>' +
        '<div class="form-group"><label>Logo (URL)</label><input type="text" class="form-control" id="cfgLogo" value="' + (emp.logo || '') + '"></div>' +
        '<button class="btn btn-primary" onclick="saveConfiguracoes()">Salvar</button>' +
      '</div>' +
    '</div>';
  applyAllMasks();
}
function saveConfiguracoes() {
  if (!appData.empresa) appData.empresa = {};
  appData.empresa.nome = document.getElementById('cfgNome').value.trim();
  appData.empresa.cnpj = document.getElementById('cfgCnpj').value.trim();
  appData.empresa.logo = document.getElementById('cfgLogo').value.trim();
  saveData(); updateSidebarInfo(); showToast('Configurações salvas!', 'success');
}

// ══════════════════════════════════════════════════════════════
// ── SCR-BKP-01 — BACKUP ──
// ══════════════════════════════════════════════════════════════
function renderBackupPage() {
  var pg = document.getElementById('page-backup'); if (!pg) return;
  pg.innerHTML =
    '<div class="page-header"><h2>💾 Backup</h2></div>' +
    '<div class="card" style="max-width:600px">' +
      '<div class="card-header"><span>Exportar / Importar Dados</span></div>' +
      '<div style="padding:16px">' +
        '<p style="margin-bottom:16px;color:var(--text-muted)">Exporte seus dados para um arquivo JSON ou importe um backup anterior.</p>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
          '<button class="btn btn-primary" onclick="exportBackup()">📥 Exportar Backup</button>' +
          '<button class="btn btn-outline" onclick="document.getElementById(\'importFileInput\').click()">📤 Importar Backup</button>' +
          '<input type="file" id="importFileInput" accept=".json" style="display:none" onchange="importBackup(event)">' +
        '</div>' +
      '</div>' +
    '</div>';
}
function exportBackup() {
  var blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'wdmaquinas_backup_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  showToast('Backup exportado!', 'success');
}
function importBackup(e) {
  var file = e.target.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function (ev) {
    try {
      var data = JSON.parse(ev.target.result);
      if (!confirm('Importar backup? Dados atuais serão substituídos.')) return;
      appData = data;
      ensureDefaults();
      saveData();
      updateSidebarInfo();
      renderDashboard();
      navigateTo('dashboard');
      showToast('Backup importado com sucesso!', 'success');
    } catch (err) { showToast('Arquivo inválido', 'error'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-INIT-01 — INICIALIZAÇÃO ──
// ══════════════════════════════════════════════════════════════
async function initApp() {
  if (typeof window !== 'undefined' && window.supabase) {
    try { supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) { console.warn('Supabase init falhou:', e.message); }
  }
  await loadData();
  updateSidebarInfo();
  renderDashboard();
  var dateEl = document.getElementById('currentDate');
  if (dateEl) {
    var now = new Date();
    dateEl.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
