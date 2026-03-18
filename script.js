:root {
    --bg-primary:#0a0a0a;--bg-secondary:#111111;--bg-tertiary:#1a1a1a;--bg-card:#161616;--bg-hover:#1e1e1e;
    --accent-primary:#3B82F6;--accent-secondary:#60A5FA;--accent-dark:#2563EB;--accent-light:#93C5FD;
    --accent-glow:rgba(59,130,246,0.15);--text-primary:#ffffff;--text-secondary:#b0b0b0;--text-muted:#666666;
    --border-color:#2a2a2a;--success:#00c853;--danger:#ff1744;--warning:#ffc107;--info:#2196f3;
    --shadow:0 4px 24px rgba(0,0,0,0.4);--radius:12px;--radius-sm:8px;
    --transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:var(--bg-primary);color:var(--text-primary);overflow:hidden;height:100vh;}
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:var(--bg-secondary);}
::-webkit-scrollbar-thumb{background:var(--accent-primary);border-radius:3px;}
.app-container{display:flex;height:100vh;}

/* SIDEBAR */
.sidebar{width:260px;min-width:260px;background:var(--bg-secondary);border-right:1px solid var(--border-color);display:flex;flex-direction:column;height:100vh;overflow:hidden;transition:var(--transition);z-index:100;}
.sidebar-header{padding:20px;border-bottom:1px solid var(--border-color);text-align:center;}
.sidebar-header h1{font-size:1.4rem;font-weight:800;color:var(--accent-primary);letter-spacing:1px;}
.sidebar-header p{font-size:0.7rem;color:var(--text-muted);margin-top:4px;}
.sidebar-nav{flex:1;overflow-y:auto;padding:10px 0;}
.nav-section{margin-bottom:8px;}
.nav-section-title{padding:8px 20px;font-size:0.65rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px;}
.nav-item{display:flex;align-items:center;padding:10px 20px;color:var(--text-secondary);cursor:pointer;transition:var(--transition);font-size:0.85rem;font-weight:500;border-left:3px solid transparent;}
.nav-item:hover{background:var(--bg-hover);color:var(--text-primary);}
.nav-item.active{background:var(--accent-glow);color:var(--accent-primary);border-left-color:var(--accent-primary);}
.nav-item .nav-icon{width:20px;margin-right:12px;text-align:center;font-size:1rem;}

/* MAIN */
.main-content{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.topbar{height:60px;min-height:60px;background:var(--bg-secondary);border-bottom:1px solid var(--border-color);display:flex;align-items:center;justify-content:space-between;padding:0 24px;}
.topbar-left{display:flex;align-items:center;gap:16px;}
.menu-toggle{display:none;background:none;border:none;color:var(--text-primary);font-size:1.5rem;cursor:pointer;}
.topbar-title{font-size:1.1rem;font-weight:600;}
.topbar-date{font-size:0.8rem;color:var(--text-secondary);}
.content-area{flex:1;overflow-y:auto;padding:24px;}
.page-content{display:none;}

/* CARDS */
.dashboard-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:16px;}
.card{background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);padding:20px;transition:var(--transition);}
.card:hover{border-color:var(--accent-primary);box-shadow:0 0 20px var(--accent-glow);}
.card-accent{border-color:var(--accent-primary);box-shadow:0 0 20px var(--accent-glow);}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:0.8rem;color:var(--text-secondary);}
.card-icon{margin-right:8px;}
.card-value{font-size:1.5rem;font-weight:800;color:var(--accent-primary);}

/* TABLE */
.table-responsive{overflow-x:auto;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);margin-bottom:16px;}
.table{width:100%;border-collapse:collapse;}
.table th{padding:12px 16px;text-align:left;font-size:0.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;background:var(--bg-tertiary);border-bottom:1px solid var(--border-color);white-space:nowrap;}
.table td{padding:12px 16px;font-size:0.83rem;border-bottom:1px solid var(--border-color);white-space:nowrap;}
.table tr:hover td{background:var(--bg-hover);}

/* BADGES */
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;text-transform:uppercase;}
.badge-success{background:rgba(0,200,83,0.15);color:var(--success);}
.badge-danger{background:rgba(255,23,68,0.15);color:var(--danger);}
.badge-warning{background:rgba(255,193,7,0.15);color:var(--warning);}
.badge-info{background:rgba(33,150,243,0.15);color:var(--info);}

/* BUTTONS */
.btn{padding:8px 16px;border:none;border-radius:var(--radius-sm);font-family:'Inter',sans-serif;font-size:0.8rem;font-weight:600;cursor:pointer;transition:var(--transition);display:inline-flex;align-items:center;gap:6px;}
.btn-primary{background:var(--accent-primary);color:white;}
.btn-primary:hover{background:var(--accent-secondary);transform:translateY(-1px);box-shadow:0 4px 12px rgba(59,130,246,0.4);}
.btn-secondary{background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--border-color);}
.btn-secondary:hover{background:var(--bg-hover);border-color:var(--accent-primary);}
.btn-danger{background:var(--danger);color:white;}
.btn-danger:hover{opacity:0.9;}
.btn-warning{background:var(--warning);color:#000;}
.btn-outline{background:transparent;border:1px solid var(--border-color);color:var(--text-secondary);}
.btn-outline:hover{border-color:var(--accent-primary);color:var(--accent-primary);}
.btn-sm{padding:5px 10px;font-size:0.75rem;}
.btn-success{background:var(--success);color:white;}
.btn-success:hover{opacity:0.9;}

/* TIPO FLUXO TOGGLE */
.tipo-fluxo-group{display:flex;gap:8px;margin-bottom:0;}
.btn-tipo-entrada{background:transparent;border:2px solid var(--success);color:var(--success);padding:10px 24px;font-weight:700;font-size:0.9rem;border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition);}
.btn-tipo-entrada.active{background:var(--success);color:#fff;box-shadow:0 0 12px rgba(0,200,83,0.4);}
.btn-tipo-saida{background:transparent;border:2px solid var(--danger);color:var(--danger);padding:10px 24px;font-weight:700;font-size:0.9rem;border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition);}
.btn-tipo-saida.active{background:var(--danger);color:#fff;box-shadow:0 0 12px rgba(255,23,68,0.4);}

/* FORMS */
.form-group{margin-bottom:16px;}
.form-group label{display:block;font-size:0.75rem;font-weight:600;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;}
.form-control{width:100%;padding:10px 12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);color:var(--text-primary);font-family:'Inter',sans-serif;font-size:0.85rem;transition:var(--transition);}
.form-control:focus{outline:none;border-color:var(--accent-primary);box-shadow:0 0 0 3px var(--accent-glow);}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

/* FILTER BAR */
.filter-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;}

/* PROGRESS */
.progress-bar{height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--accent-primary),var(--accent-secondary));border-radius:4px;transition:width 0.5s ease;}

/* SECTION TITLE */
.section-title{font-size:1rem;font-weight:700;margin-bottom:12px;color:var(--accent-primary);}

/* PAGE HEADER */
.page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;}
.page-header h2{font-size:1.2rem;font-weight:800;}

/* MODAL */
.modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:1000;align-items:center;justify-content:center;}
.modal{background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius);width:90%;max-width:600px;max-height:85vh;overflow-y:auto;box-shadow:var(--shadow);}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px;border-bottom:1px solid var(--border-color);}
.modal-header h3{font-size:1rem;font-weight:700;color:var(--accent-primary);}
.modal-close{background:none;border:none;color:var(--text-secondary);font-size:1.5rem;cursor:pointer;}
.modal-close:hover{color:var(--danger);}
.modal-body{padding:20px;}
.modal-footer{padding:16px 20px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:8px;}

/* TOAST */
.toast{position:fixed;top:20px;right:20px;z-index:2000;padding:14px 20px;border-radius:var(--radius-sm);font-size:0.85rem;color:white;box-shadow:var(--shadow);transform:translateX(150%);transition:transform 0.3s ease;max-width:350px;}
.toast.show{transform:translateX(0);}
.toast.success{background:var(--success);}
.toast.error{background:var(--danger);}

/* DETAIL GRID */
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.detail-item{padding:8px;background:var(--bg-tertiary);border-radius:var(--radius-sm);}
.detail-label{font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;display:block;margin-bottom:4px;}

/* HELPERS */
.text-success{color:var(--success)!important;}
.text-danger{color:var(--danger)!important;}
.text-warning{color:var(--warning)!important;}
.text-muted{color:var(--text-muted)!important;}
.metas-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:16px;}

/* CATEGORIA FLUXO CONFIG */
.cat-fluxo-item{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-tertiary);border-radius:8px;margin-bottom:6px;}
.cat-fluxo-item .cat-nome{font-weight:600;flex:1;}
.cat-fluxo-item .cat-tipo{font-size:0.75rem;font-weight:700;padding:2px 10px;border-radius:12px;margin:0 10px;}
.cat-fluxo-item .cat-tipo.entrada{background:rgba(0,200,83,0.15);color:var(--success);}
.cat-fluxo-item .cat-tipo.saida{background:rgba(255,23,68,0.15);color:var(--danger);}
.cat-fluxo-item .cat-actions{display:flex;gap:4px;}

/* RESPONSIVE */
@media(max-width:768px){
    .sidebar{position:fixed;left:-260px;}
    .sidebar.open{left:0;}
    .menu-toggle{display:block;}
    .dashboard-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));}
    .form-row{grid-template-columns:1fr;}
}

// ==========================================
// WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026
// script.js — COMPLETO COM SUPABASE
// ==========================================

// ---------- SUPABASE CONFIG ----------
const SUPABASE_URL = 'https://iwbsmsadctvndhrcjkbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GQpRJ7CFZOFrdmYfsN8rcA_ucfNR2AM';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Tabela única no Supabase para guardar o JSON completo
// Você precisa criar a tabela no Supabase:
// CREATE TABLE app_data (id int primary key default 1, data jsonb, updated_at timestamptz default now());
// INSERT INTO app_data (id, data) VALUES (1, '{}');

async function saveToSupabase() {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({ id: 1, data: appData, updated_at: new Date().toISOString() });
    if (error) console.error('Supabase save error:', error);
  } catch (e) {
    console.error('Supabase save exception:', e);
  }
}

async function loadFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('id', 1)
      .single();
    if (error) {
      console.error('Supabase load error:', error);
      return null;
    }
    if (data && data.data && Object.keys(data.data).length > 0) {
      return data.data;
    }
    return null;
  } catch (e) {
    console.error('Supabase load exception:', e);
    return null;
  }
}

// ---------- ID helper ----------
function nextId(arr) {
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(i => i.id || 0)) + 1;
}

// ---------- DADOS PADRÃO (sem dados hardcoded) ----------
function getDefaultData() {
  return {
    empresa: {
      nome: "WD Máquinas",
      cnpj: "59.483.994/0001-01",
      logo: ""
    },
    vendedores: ["Wander", "Daniel"],
    formasPagamento: ["Boleto", "Caixa da Oficina", "Cartão de Crédito MP", "Cartão de Crédito PagBank", "Cartão de Débito MP", "Cartão de Débito PagBank", "Dinheiro", "Link MP", "Link PagBank", "MP", "PagBank", "Pix"],
    tipoUnidade: ["Unidade", "Kg", "Metro", "Litro", "Caixa", "Pacote", "Par", "Jogo", "Rolo", "Barra", "Chapa", "Peça"],
    tipoVenda: ["Direta", "Revenda"],
    situacaoCompra: ["Devendo", "Guardado", "Pago"],
    situacaoEntrega: ["Entregue com Defeito", "Entregue OK", "Não Entregue", "Pendente"],
    situacaoCheque: ["Compensado", "Depositado", "Devolvido", "Em Mãos", "Repassado"],
    situacaoGarantia: ["Ativa", "Expirada", "Utilizada"],
    situacaoBoleto: ["Pago", "Pendente", "Vencido"],

    // Categorias de fluxo de caixa (gerenciáveis em Configurações)
    categoriasFluxo: [
      { id: 1, nome: "Geral", tipo: "Entrada" },
      { id: 2, nome: "Geral", tipo: "Saída" },
      { id: 3, nome: "Salário", tipo: "Saída" },
      { id: 4, nome: "Dinheiro em Notas", tipo: "Entrada" },
      { id: 5, nome: "Dinheiro em Notas", tipo: "Saída" }
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

    // Fluxo de caixa — agora lançamentos individuais em vez de arrays por dia
    fluxoCaixaLancamentos: []
    // Cada lançamento: { id, mes, dia, tipo: "Entrada"|"Saída", categoria, valor }
  };
}

// ---------- DADOS EM MEMÓRIA ----------
let appData = {};
let _saveTimeout = null;

async function loadData() {
  // Tentar carregar do Supabase primeiro
  const supaData = await loadFromSupabase();
  if (supaData) {
    appData = supaData;
  } else {
    // Fallback: localStorage
    const saved = localStorage.getItem('wdmaquinas_data');
    if (saved) {
      try { appData = JSON.parse(saved); } catch(e) { appData = getDefaultData(); }
    } else {
      appData = getDefaultData();
    }
  }

  // Garantir campos novos
  const def = getDefaultData();
  for (let k in def) {
    if (!(k in appData)) appData[k] = def[k];
  }
  if (!appData.categoriasFluxo) appData.categoriasFluxo = def.categoriasFluxo;
  if (!appData.fluxoCaixaLancamentos) appData.fluxoCaixaLancamentos = [];

  // Migrar fluxoCaixa antigo para fluxoCaixaLancamentos se necessário
  if (appData.fluxoCaixa && !appData._fluxoMigrated) {
    migrateOldFluxo();
    appData._fluxoMigrated = true;
  }

  updateSidebarLogo();
}

function migrateOldFluxo() {
  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const fc = appData.fluxoCaixa;
  if (!fc) return;

  let lancId = nextId(appData.fluxoCaixaLancamentos);

  meses.forEach(mesKey => {
    const mesData = fc[mesKey];
    if (!mesData) return;

    const dias = (mesData.entradas || []).length;
    for (let d = 0; d < dias; d++) {
      const dia = d + 1;
      if ((mesData.entradas || [])[d] > 0) {
        appData.fluxoCaixaLancamentos.push({ id: lancId++, mes: mesKey, dia, tipo: "Entrada", categoria: "Geral", valor: mesData.entradas[d] });
      }
      if ((mesData.saidas || [])[d] > 0) {
        appData.fluxoCaixaLancamentos.push({ id: lancId++, mes: mesKey, dia, tipo: "Saída", categoria: "Geral", valor: mesData.saidas[d] });
      }
      if ((mesData.dinheiro || [])[d] > 0) {
        appData.fluxoCaixaLancamentos.push({ id: lancId++, mes: mesKey, dia, tipo: "Entrada", categoria: "Dinheiro em Notas", valor: mesData.dinheiro[d] });
      }
      if ((mesData.combustivel || [])[d] > 0) {
        appData.fluxoCaixaLancamentos.push({ id: lancId++, mes: mesKey, dia, tipo: "Saída", categoria: "Geral", valor: mesData.combustivel[d] });
      }
      if ((mesData.wander || [])[d] > 0) {
        appData.fluxoCaixaLancamentos.push({ id: lancId++, mes: mesKey, dia, tipo: "Saída", categoria: "Salário", valor: mesData.wander[d] });
      }
      if ((mesData.daniel || [])[d] > 0) {
        appData.fluxoCaixaLancamentos.push({ id: lancId++, mes: mesKey, dia, tipo: "Saída", categoria: "Salário", valor: mesData.daniel[d] });
      }
    }
  });
}

function saveData() {
  // Salvar localStorage imediatamente
  localStorage.setItem('wdmaquinas_data', JSON.stringify(appData));
  // Debounce Supabase save (a cada 2s)
  if (_saveTimeout) clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => { saveToSupabase(); }, 2000);
}

// ---------- LOGO SIDEBAR ----------
function updateSidebarLogo() {
  const img = document.getElementById('sidebarLogo');
  if (img && appData.empresa && appData.empresa.logo) {
    img.src = appData.empresa.logo;
    img.style.display = 'block';
  } else if (img) {
    img.style.display = 'none';
  }
}

// ---------- FORMATADORES ----------
function formatCurrency(v) {
  return 'R$ ' + (Number(v) || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function formatDate(d) {
  if (!d) return '-';
  const parts = d.split('-');
  if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
  return d;
}
function getDiasEntreHoje(dateStr) {
  if (!dateStr) return 0;
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.ceil((d - hoje) / (1000*60*60*24));
}

// ---------- NAVEGAÇÃO ----------
let currentPage = 'dashboard';

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
  const el = document.getElementById('page-' + page);
  if (el) el.style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const active = document.querySelector(`.nav-item[onclick*="'${page}'"]`);
  if (active) active.classList.add('active');
  const titles = {
    dashboard:'Dashboard', janeiro:'Janeiro', fevereiro:'Fevereiro', marco:'Março',
    abril:'Abril', maio:'Maio', junho:'Junho', julho:'Julho', agosto:'Agosto',
    setembro:'Setembro', outubro:'Outubro', novembro:'Novembro', dezembro:'Dezembro',
    compras:'Compras', vendas:'Vendas', estoque:'Estoque', produtos:'Produtos',
    clientes:'Clientes', fornecedores:'Fornecedores', pfornecedores:'Produtos dos Fornecedores',
    boletos:'Boletos', cheques:'Cheques', prestacoes:'Prestações', projetos:'Projetos',
    pagclientes:'Pagamentos de Clientes', garantias:'Garantias', relatorios:'Relatórios',
    notasentrada:'Notas de Entrada', notassaida:'Notas de Saída', receitasmei:'Receitas MEI',
    configuracoes:'Configurações', backup:'Backup'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[page] || page;
  renderPage(page);
  document.querySelector('.sidebar').classList.remove('open');
}

function renderPage(page) {
  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'janeiro': case 'fevereiro': case 'marco': case 'abril':
    case 'maio': case 'junho': case 'julho': case 'agosto':
    case 'setembro': case 'outubro': case 'novembro': case 'dezembro':
      renderFluxoMes(page); break;
    case 'compras': renderCompras(); break;
    case 'vendas': renderVendas(); break;
    case 'estoque': renderEstoque(); break;
    case 'produtos': renderProdutos(); break;
    case 'clientes': renderClientes(); break;
    case 'fornecedores': renderFornecedores(); break;
    case 'pfornecedores': renderPFornecedores(); break;
    case 'boletos': renderBoletos(); break;
    case 'cheques': renderCheques(); break;
    case 'prestacoes': renderPrestacoes(); break;
    case 'projetos': renderProjetos(); break;
    case 'pagclientes': renderPagClientes(); break;
    case 'garantias': renderGarantias(); break;
    case 'relatorios': renderRelatorios(); break;
    case 'notasentrada': renderNotasEntrada(); break;
    case 'notassaida': renderNotasSaida(); break;
    case 'receitasmei': renderReceitasMei(); break;
    case 'configuracoes': renderConfiguracoes(); break;
    case 'backup': renderBackupInfo(); break;
  }
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// ---------- TOAST ----------
function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + (type || 'success');
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ---------- MODAL HELPERS (NÃO fecha ao clicar fora) ----------
function closeCadastroModal() {
  const m = document.getElementById('cadastroModal');
  if (m) m.style.display = 'none';
}
function closeViewModal() {
  const m = document.getElementById('viewModal');
  if (m) m.style.display = 'none';
}

// ==========================================
// DASHBOARD
// ==========================================
const mesConfig = {
  janeiro:   { label:'Janeiro',   dias:31, key:'janeiro' },
  fevereiro: { label:'Fevereiro', dias:28, key:'fevereiro' },
  marco:     { label:'Março',     dias:31, key:'marco' },
  abril:     { label:'Abril',     dias:30, key:'abril' },
  maio:      { label:'Maio',      dias:31, key:'maio' },
  junho:     { label:'Junho',     dias:30, key:'junho' },
  julho:     { label:'Julho',     dias:31, key:'julho' },
  agosto:    { label:'Agosto',    dias:31, key:'agosto' },
  setembro:  { label:'Setembro',  dias:30, key:'setembro' },
  outubro:   { label:'Outubro',   dias:31, key:'outubro' },
  novembro:  { label:'Novembro',  dias:30, key:'novembro' },
  dezembro:  { label:'Dezembro',  dias:31, key:'dezembro' }
};

const mesIndexMap = {
  janeiro:0, fevereiro:1, marco:2, abril:3, maio:4, junho:5,
  julho:6, agosto:7, setembro:8, outubro:9, novembro:10, dezembro:11
};

const mesesOrdem = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

// Helpers de fluxo
function getLancamentosMes(mesKey) {
  return (appData.fluxoCaixaLancamentos || []).filter(l => l.mes === mesKey);
}

function getTotaisMes(mesKey) {
  const lancs = getLancamentosMes(mesKey);
  let entradas = 0, saidas = 0, dinheiroNotas = 0, salario = 0;
  lancs.forEach(l => {
    if (l.tipo === 'Entrada') {
      entradas += l.valor;
      if (l.categoria === 'Dinheiro em Notas') dinheiroNotas += l.valor;
    } else {
      saidas += l.valor;
      if (l.categoria === 'Salário') salario += l.valor;
      if (l.categoria === 'Dinheiro em Notas') dinheiroNotas -= l.valor; // se saída de dinheiro
    }
  });
  return { entradas, saidas, dinheiroNotas, salario };
}

function getCaixaAtualAteMes(mesKey) {
  const idx = mesesOrdem.indexOf(mesKey);
  let caixa = 0;
  for (let i = 0; i <= idx; i++) {
    const t = getTotaisMes(mesesOrdem[i]);
    caixa += t.entradas - t.saidas;
  }
  return caixa;
}

function getCaixaAtualTotal() {
  let caixa = 0;
  mesesOrdem.forEach(m => {
    const t = getTotaisMes(m);
    caixa += t.entradas - t.saidas;
  });
  return caixa;
}

function renderDashboard() {
  const container = document.getElementById('dashboardCards');
  if (!container) return;

  const totalCompras = (appData.compras||[]).reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);
  const totalVendas = (appData.vendas||[]).reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
  const comprasPagas = (appData.compras||[]).filter(c => c.situacao==='Pago').reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);
  const comprasDevendo = (appData.compras||[]).filter(c => c.situacao==='Devendo').reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);
  const vendasPagas = (appData.vendas||[]).filter(v => v.situacao==='Pago').reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
  const vendasDevendo = (appData.vendas||[]).filter(v => v.situacao==='Devendo').reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
  const lucro = vendasPagas - comprasPagas;
  const boletosPendentes = (appData.boletos||[]).filter(b => b.situacao!=='Pago').reduce((s,b) => s + b.valor, 0);
  const prestacoesPendentes = (appData.prestacoes||[]).filter(p => p.situacao!=='Pago').reduce((s,p) => s + p.valor, 0);
  const totalDividas = comprasDevendo + boletosPendentes + prestacoesPendentes + vendasDevendo;

  const caixaAtual = getCaixaAtualTotal();

  let entradasFluxo = 0, saidasFluxo = 0;
  mesesOrdem.forEach(m => {
    const t = getTotaisMes(m);
    entradasFluxo += t.entradas;
    saidasFluxo += t.saidas;
  });

  const metaVendas = 15000;
  const mesAtual = new Date().getMonth();
  const vendasMesAtual = (appData.vendas||[]).filter(v => {
    const d = new Date(v.data + 'T00:00:00');
    return d.getMonth() === mesAtual && d.getFullYear() === 2026;
  }).reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
  const pctVendas = Math.min(100, (vendasMesAtual / metaVendas * 100));

  const salarioWander = 3000;
  const salarioDaniel = 2500;
  const vendasWander = (appData.vendas||[]).filter(v => v.vendedor==='Wander' && new Date(v.data+'T00:00:00').getMonth()===mesAtual).reduce((s,v) => s + (v.quantidade*v.valorUnit),0);
  const vendasDaniel = (appData.vendas||[]).filter(v => v.vendedor==='Daniel' && new Date(v.data+'T00:00:00').getMonth()===mesAtual).reduce((s,v) => s + (v.quantidade*v.valorUnit),0);

  container.innerHTML = `
    <div class="dashboard-grid">
      <div class="card card-accent">
        <div class="card-header"><span class="card-icon">💰</span><span>Caixa Atual</span></div>
        <div class="card-value ${caixaAtual >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(caixaAtual)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📈</span><span>Total Entradas</span></div>
        <div class="card-value text-success">${formatCurrency(entradasFluxo)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📉</span><span>Total Saídas</span></div>
        <div class="card-value text-danger">${formatCurrency(saidasFluxo)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">🛒</span><span>Total Compras</span></div>
        <div class="card-value">${formatCurrency(totalCompras)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">🏷️</span><span>Total Vendas</span></div>
        <div class="card-value">${formatCurrency(totalVendas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📊</span><span>Lucro</span></div>
        <div class="card-value ${lucro >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(lucro)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">⚠️</span><span>Total Dívidas</span></div>
        <div class="card-value text-danger">${formatCurrency(totalDividas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📋</span><span>Boletos Pendentes</span></div>
        <div class="card-value text-warning">${formatCurrency(boletosPendentes)}</div>
      </div>
    </div>

    <div class="section-title" style="margin-top:24px;">Metas do Mês</div>
    <div class="metas-grid">
      <div class="card">
        <div class="card-header"><span>Meta Vendas Mensal</span><span>${formatCurrency(vendasMesAtual)} / ${formatCurrency(metaVendas)}</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pctVendas}%"></div></div>
        <small>${pctVendas.toFixed(1)}%</small>
      </div>
      <div class="card">
        <div class="card-header"><span>Vendas Wander</span><span>${formatCurrency(vendasWander)}</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,vendasWander/salarioWander*100)}%;background:var(--accent-primary)"></div></div>
        <small>Meta salário: ${formatCurrency(salarioWander)}</small>
      </div>
      <div class="card">
        <div class="card-header"><span>Vendas Daniel</span><span>${formatCurrency(vendasDaniel)}</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,vendasDaniel/salarioDaniel*100)}%;background:var(--accent-secondary)"></div></div>
        <small>Meta salário: ${formatCurrency(salarioDaniel)}</small>
      </div>
    </div>

    <div class="section-title" style="margin-top:24px;">Últimas Compras</div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Valor</th><th>Situação</th></tr></thead>
        <tbody>${(appData.compras||[]).slice(-5).reverse().map(c => `
          <tr>
            <td>${formatDate(c.data)}</td>
            <td>${c.produto}</td>
            <td>${c.fornecedor}</td>
            <td>${formatCurrency(c.quantidade * c.valorUnit)}</td>
            <td><span class="badge ${c.situacao==='Pago'?'badge-success':c.situacao==='Devendo'?'badge-danger':'badge-warning'}">${c.situacao}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section-title" style="margin-top:24px;">Últimas Vendas</div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Valor</th><th>Vendedor</th><th>Situação</th></tr></thead>
        <tbody>${(appData.vendas||[]).slice(-5).reverse().map(v => `
          <tr>
            <td>${formatDate(v.data)}</td>
            <td>${v.cliente}</td>
            <td>${v.produto}</td>
            <td>${formatCurrency(v.quantidade * v.valorUnit)}</td>
            <td>${v.vendedor}</td>
            <td><span class="badge ${v.situacao==='Pago'?'badge-success':'badge-danger'}">${v.situacao}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section-title" style="margin-top:24px;">Prestações do Mês</div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>Descrição</th><th>Parcela</th><th>Valor</th><th>Vencimento</th><th>Situação</th></tr></thead>
        <tbody>${(appData.prestacoes||[]).filter(p => {
          const d = new Date(p.vencimento+'T00:00:00');
          return d.getMonth() === mesAtual;
        }).map(p => `
          <tr>
            <td>${p.descricao}</td>
            <td>${p.parcelaAtual}/${p.parcelas}</td>
            <td>${formatCurrency(p.valor)}</td>
            <td>${formatDate(p.vencimento)}</td>
            <td><span class="badge ${p.situacao==='Pago'?'badge-success':'badge-warning'}">${p.situacao}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================
// FLUXO DE CAIXA MENSAL — NOVO SISTEMA
// ==========================================

function renderFluxoMes(page) {
  const cfg = mesConfig[page];
  if (!cfg) return;
  const { key, dias, label } = cfg;

  const pageEl = document.getElementById('page-' + page);
  if (!pageEl) return;

  const lancs = getLancamentosMes(key);
  const totais = getTotaisMes(key);
  const caixaAtual = getCaixaAtualAteMes(key);

  // Dinheiro em Notas: soma entradas com cat "Dinheiro em Notas" - saídas com cat "Dinheiro em Notas"
  let dinheiroNotas = 0;
  lancs.forEach(l => {
    if (l.categoria === 'Dinheiro em Notas') {
      dinheiroNotas += l.tipo === 'Entrada' ? l.valor : -l.valor;
    }
  });

  // Salário Recebido: soma de saídas com cat "Salário"
  const salarioRecebido = lancs.filter(l => l.categoria === 'Salário' && l.tipo === 'Saída').reduce((s,l) => s + l.valor, 0);

  // Categorias para filtro
  const categoriasUsadas = [...new Set(lancs.map(l => l.categoria))].sort();

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Fluxo de Caixa — ${label} 2026</h2>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card card-accent">
        <div class="card-header"><span class="card-icon">💰</span><span>Caixa Atual</span></div>
        <div class="card-value ${caixaAtual >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(caixaAtual)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📈</span><span>Total Entradas</span></div>
        <div class="card-value text-success">${formatCurrency(totais.entradas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📉</span><span>Total Saídas</span></div>
        <div class="card-value text-danger">${formatCurrency(totais.saidas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">💵</span><span>Dinheiro em Notas</span></div>
        <div class="card-value">${formatCurrency(dinheiroNotas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">💼</span><span>Salário Recebido</span></div>
        <div class="card-value">${formatCurrency(salarioRecebido)}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="date" id="filtroDataInicio_${key}" class="form-control" style="max-width:180px" onchange="renderFluxoMes('${page}')">
      <input type="date" id="filtroDataFim_${key}" class="form-control" style="max-width:180px" onchange="renderFluxoMes('${page}')">
      <select id="filtroTipo_${key}" class="form-control" style="max-width:160px" onchange="renderFluxoMes('${page}')">
        <option value="">Todos os Tipos</option>
        <option value="Entrada">Entradas</option>
        <option value="Saída">Saídas</option>
      </select>
      <select id="filtroCategoria_${key}" class="form-control" style="max-width:180px" onchange="renderFluxoMes('${page}')">
        <option value="">Todas Categorias</option>
        ${categoriasUsadas.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <button class="btn btn-primary" onclick="openFluxoModal('${key}', ${dias})">
        <span>+</span> Adicionar
      </button>
    </div>

    <div class="table-responsive">
      <table class="table" id="tabelaFluxo_${key}">
        <thead>
          <tr>
            <th>Dia</th>
            <th>Data</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Valor</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="fluxoBody_${key}"></tbody>
      </table>
    </div>
  `;

  // Montar lista e aplicar filtros
  let filtrados = lancs.map(l => {
    const mesIdx = mesIndexMap[key];
    const dataStr = `2026-${String(mesIdx+1).padStart(2,'0')}-${String(l.dia).padStart(2,'0')}`;
    return { ...l, data: dataStr };
  });

  filtrados.sort((a,b) => a.dia - b.dia);

  const filtroDataInicio = document.getElementById('filtroDataInicio_' + key);
  const filtroDataFim = document.getElementById('filtroDataFim_' + key);
  const filtroTipo = document.getElementById('filtroTipo_' + key);
  const filtroCategoria = document.getElementById('filtroCategoria_' + key);

  if (filtroDataInicio && filtroDataInicio.value) {
    filtrados = filtrados.filter(l => l.data >= filtroDataInicio.value);
  }
  if (filtroDataFim && filtroDataFim.value) {
    filtrados = filtrados.filter(l => l.data <= filtroDataFim.value);
  }
  if (filtroTipo && filtroTipo.value) {
    filtrados = filtrados.filter(l => l.tipo === filtroTipo.value);
  }
  if (filtroCategoria && filtroCategoria.value) {
    filtrados = filtrados.filter(l => l.categoria === filtroCategoria.value);
  }

  const tbody = document.getElementById('fluxoBody_' + key);
  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum lançamento encontrado</td></tr>';
  } else {
    tbody.innerHTML = filtrados.map(l => `
      <tr>
        <td><strong>${l.dia}</strong></td>
        <td>${formatDate(l.data)}</td>
        <td><span class="badge ${l.tipo==='Entrada'?'badge-success':'badge-danger'}">${l.tipo}</span></td>
        <td>${l.categoria}</td>
        <td class="${l.tipo==='Entrada'?'text-success':'text-danger'}"><strong>${formatCurrency(l.valor)}</strong></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="editFluxoLancamento(${l.id}, '${key}', ${dias})" title="Editar">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteFluxoLancamento(${l.id}, '${page}')" title="Excluir">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  const totalFiltradoEntradas = filtrados.filter(l => l.tipo==='Entrada').reduce((s,l) => s+l.valor, 0);
  const totalFiltradoSaidas = filtrados.filter(l => l.tipo==='Saída').reduce((s,l) => s+l.valor, 0);
  tbody.innerHTML += `
    <tr style="background:var(--bg-tertiary);font-weight:bold;">
      <td colspan="4" style="text-align:right">Total Filtrado:</td>
      <td>
        <span class="text-success">${formatCurrency(totalFiltradoEntradas)}</span> /
        <span class="text-danger">${formatCurrency(totalFiltradoSaidas)}</span>
      </td>
      <td></td>
    </tr>
  `;
}

// ---------- MODAL FLUXO (Dia → Tipo toggle → Categoria → Valor) ----------
function openFluxoModal(mesKey, dias, editLanc) {
  const isEdit = !!editLanc;
  const mesLabel = Object.values(mesConfig).find(c => c.key === mesKey)?.label || mesKey;

  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Lançamento — ' + mesLabel : 'Novo Lançamento — ' + mesLabel;

  let diasOptions = '';
  for (let d = 1; d <= dias; d++) {
    diasOptions += `<option value="${d}" ${isEdit && editLanc.dia===d ? 'selected' : ''}>${d}</option>`;
  }

  const tipoAtual = isEdit ? editLanc.tipo : 'Entrada';
  const catAtual = isEdit ? editLanc.categoria : '';
  const valorAtual = isEdit ? editLanc.valor : 0;

  // Categorias baseadas no tipo selecionado
  const catsEntrada = (appData.categoriasFluxo||[]).filter(c => c.tipo === 'Entrada').map(c => c.nome);
  const catsSaida = (appData.categoriasFluxo||[]).filter(c => c.tipo === 'Saída').map(c => c.nome);
  const catsUnicas = tipoAtual === 'Entrada' ? [...new Set(catsEntrada)] : [...new Set(catsSaida)];

  modalBody.innerHTML = `
    <div class="form-group">
      <label>Dia</label>
      <select id="fluxoDia" class="form-control">${diasOptions}</select>
    </div>
    <div class="form-group">
      <label>Tipo de Fluxo</label>
      <div class="tipo-fluxo-group">
        <button type="button" id="btnTipoEntrada" class="btn-tipo-entrada ${tipoAtual==='Entrada'?'active':''}" onclick="toggleTipoFluxo('Entrada')">Entrada</button>
        <button type="button" id="btnTipoSaida" class="btn-tipo-saida ${tipoAtual==='Saída'?'active':''}" onclick="toggleTipoFluxo('Saída')">Saída</button>
      </div>
      <input type="hidden" id="fluxoTipo" value="${tipoAtual}">
    </div>
    <div class="form-group">
      <label>Categoria</label>
      <select id="fluxoCategoria" class="form-control">
        <option value="">Selecione...</option>
        ${catsUnicas.map(c => `<option value="${c}" ${catAtual===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Valor (R$)</label>
      <input type="number" id="fluxoValor" class="form-control" step="0.01" min="0" value="${valorAtual}">
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveFluxoLancamento('${mesKey}', ${dias}, ${isEdit ? editLanc.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function toggleTipoFluxo(tipo) {
  document.getElementById('fluxoTipo').value = tipo;
  const btnE = document.getElementById('btnTipoEntrada');
  const btnS = document.getElementById('btnTipoSaida');

  if (tipo === 'Entrada') {
    btnE.classList.add('active');
    btnS.classList.remove('active');
  } else {
    btnS.classList.add('active');
    btnE.classList.remove('active');
  }

  // Atualizar categorias
  const catsEntrada = (appData.categoriasFluxo||[]).filter(c => c.tipo === 'Entrada').map(c => c.nome);
  const catsSaida = (appData.categoriasFluxo||[]).filter(c => c.tipo === 'Saída').map(c => c.nome);
  const cats = tipo === 'Entrada' ? [...new Set(catsEntrada)] : [...new Set(catsSaida)];

  const sel = document.getElementById('fluxoCategoria');
  sel.innerHTML = '<option value="">Selecione...</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function saveFluxoLancamento(mesKey, dias, editId) {
  const dia = parseInt(document.getElementById('fluxoDia').value);
  const tipo = document.getElementById('fluxoTipo').value;
  const categoria = document.getElementById('fluxoCategoria').value;
  const valor = parseFloat(document.getElementById('fluxoValor').value) || 0;

  if (!categoria) {
    showToast('Selecione uma categoria', 'error');
    return;
  }
  if (valor <= 0) {
    showToast('Informe um valor maior que zero', 'error');
    return;
  }
  if (dia < 1 || dia > dias) {
    showToast('Dia inválido', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.fluxoCaixaLancamentos.findIndex(l => l.id === editId);
    if (idx >= 0) {
      appData.fluxoCaixaLancamentos[idx] = { ...appData.fluxoCaixaLancamentos[idx], dia, tipo, categoria, valor };
    }
  } else {
    appData.fluxoCaixaLancamentos.push({
      id: nextId(appData.fluxoCaixaLancamentos),
      mes: mesKey, dia, tipo, categoria, valor
    });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Lançamento atualizado!' : 'Lançamento adicionado!', 'success');
  renderFluxoMes(mesKey);
}

function editFluxoLancamento(id, mesKey, dias) {
  const lanc = appData.fluxoCaixaLancamentos.find(l => l.id === id);
  if (lanc) openFluxoModal(mesKey, dias, lanc);
}

function deleteFluxoLancamento(id, page) {
  if (!confirm('Deseja excluir este lançamento?')) return;
  appData.fluxoCaixaLancamentos = appData.fluxoCaixaLancamentos.filter(l => l.id !== id);
  saveData();
  showToast('Lançamento excluído!', 'success');
  renderFluxoMes(page);
}

// ==========================================
// WD MÁQUINAS — script.js — PARTE 4
// CRUD: Vendas, Estoque, Clientes, Fornecedores,
// PFornecedores, Boletos, Cheques, Prestações,
// Projetos, PagClientes, Garantias, Relatórios,
// Notas, Receitas MEI, Configurações, Backup
// ==========================================

// ============================================================
// VENDAS
// ============================================================
function renderVendasPage() {
  const pg = document.getElementById('page-vendas');
  const vendas = appData.vendas || [];
  const totalVendas = vendas.reduce((s, v) => s + (v.quantidade * v.valorUnit), 0);
  const totalPago = vendas.filter(v => v.situacao === 'Pago').reduce((s, v) => s + (v.quantidade * v.valorUnit), 0);
  const totalDevendo = totalVendas - totalPago;

  pg.innerHTML = `
    <div class="page-header">
      <h2>💰 Vendas</h2>
      <button class="btn btn-primary" onclick="openVendaModal()">+ Nova Venda</button>
    </div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">${formatCurrency(totalVendas)}</div></div>
      <div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>A Receber</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd Vendas</span></div><div class="card-value">${vendas.length}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar venda..." oninput="filterVendas(this.value)">
      <select class="form-control" style="max-width:160px" onchange="filterVendasSituacao(this.value)">
        <option value="">Todas situações</option>
        <option value="Pago">Pago</option>
        <option value="Devendo">Devendo</option>
      </select>
    </div>
    <div class="table-responsive">
      <table class="table" id="vendasTable">
        <thead><tr>
          <th>ID</th><th>Data</th><th>Cliente</th><th>Produto</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th><th>Vendedor</th><th>Pagamento</th><th>Situação</th><th>Ações</th>
        </tr></thead>
        <tbody id="vendasBody"></tbody>
      </table>
    </div>`;
  renderVendasTable(vendas);
}

function renderVendasTable(vendas) {
  const tbody = document.getElementById('vendasBody');
  if (!tbody) return;
  tbody.innerHTML = vendas.map(v => `
    <tr>
      <td>${v.id}</td>
      <td>${formatDate(v.data)}</td>
      <td>${v.cliente}</td>
      <td>${v.produto}</td>
      <td>${v.quantidade}</td>
      <td>${formatCurrency(v.valorUnit)}</td>
      <td>${formatCurrency(v.quantidade * v.valorUnit)}</td>
      <td>${v.vendedor}</td>
      <td>${v.formaPagamento}</td>
      <td><span class="badge ${v.situacao === 'Pago' ? 'badge-success' : 'badge-danger'}">${v.situacao}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewVenda(${v.id})">👁️</button>
        <button class="btn btn-sm btn-primary" onclick="editVenda(${v.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteVenda(${v.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterVendas(q) {
  q = q.toLowerCase();
  const filtered = (appData.vendas || []).filter(v =>
    v.cliente.toLowerCase().includes(q) || v.produto.toLowerCase().includes(q) ||
    (v.vendedor || '').toLowerCase().includes(q) || String(v.id).includes(q)
  );
  renderVendasTable(filtered);
}

function filterVendasSituacao(sit) {
  const filtered = sit ? (appData.vendas || []).filter(v => v.situacao === sit) : (appData.vendas || []);
  renderVendasTable(filtered);
}

function openVendaModal(venda) {
  const isEdit = !!venda;
  const clienteOpts = (appData.clientes || []).map(c => `<option value="${c.nome}" ${venda && venda.cliente === c.nome ? 'selected' : ''}>${c.nome}</option>`).join('');
  const vendedorOpts = (appData.vendedores || []).map(v => `<option value="${v}" ${venda && venda.vendedor === v ? 'selected' : ''}>${v}</option>`).join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => `<option value="${f}" ${venda && venda.formaPagamento === f ? 'selected' : ''}>${f}</option>`).join('');
  const tipoOpts = (appData.tipoVenda || []).map(t => `<option value="${t}" ${venda && venda.tipo === t ? 'selected' : ''}>${t}</option>`).join('');

  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Venda' : 'Nova Venda';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Data</label><input type="date" class="form-control" id="vData" value="${venda ? venda.data : new Date().toISOString().split('T')[0]}"></div>
      <div class="form-group"><label>Cliente</label><select class="form-control" id="vCliente"><option value="">Selecione...</option>${clienteOpts}</select></div>
    </div>
    <div class="form-group"><label>Produto</label><input type="text" class="form-control" id="vProduto" value="${venda ? venda.produto : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Quantidade</label><input type="number" class="form-control" id="vQtd" value="${venda ? venda.quantidade : 1}" min="1"></div>
      <div class="form-group"><label>Valor Unitário</label><input type="number" class="form-control" id="vValorUnit" value="${venda ? venda.valorUnit : ''}" step="0.01"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Vendedor</label><select class="form-control" id="vVendedor">${vendedorOpts}</select></div>
      <div class="form-group"><label>Forma Pagamento</label><select class="form-control" id="vPgto">${pgtoOpts}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Tipo</label><select class="form-control" id="vTipo">${tipoOpts}</select></div>
      <div class="form-group"><label>Situação</label>
        <select class="form-control" id="vSituacao">
          <option value="Pago" ${venda && venda.situacao === 'Pago' ? 'selected' : ''}>Pago</option>
          <option value="Devendo" ${venda && venda.situacao === 'Devendo' ? 'selected' : ''}>Devendo</option>
        </select>
      </div>
    </div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="vObs" rows="2">${venda ? venda.obs || '' : ''}</textarea></div>`;

  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveVenda(${isEdit ? venda.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveVenda(id) {
  const obj = {
    data: document.getElementById('vData').value,
    cliente: document.getElementById('vCliente').value,
    produto: document.getElementById('vProduto').value,
    quantidade: parseFloat(document.getElementById('vQtd').value) || 1,
    valorUnit: parseFloat(document.getElementById('vValorUnit').value) || 0,
    vendedor: document.getElementById('vVendedor').value,
    formaPagamento: document.getElementById('vPgto').value,
    tipo: document.getElementById('vTipo').value,
    situacao: document.getElementById('vSituacao').value,
    obs: document.getElementById('vObs').value
  };
  if (!obj.data || !obj.cliente || !obj.produto) { showToast('Preencha os campos obrigatórios', 'error'); return; }

  if (id) {
    const idx = appData.vendas.findIndex(v => v.id === id);
    if (idx > -1) { obj.id = id; appData.vendas[idx] = obj; }
  } else {
    obj.id = nextId(appData.vendas);
    appData.vendas.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderVendasPage();
  showToast(id ? 'Venda atualizada!' : 'Venda cadastrada!', 'success');
}

function editVenda(id) {
  const venda = appData.vendas.find(v => v.id === id);
  if (venda) openVendaModal(venda);
}

function viewVenda(id) {
  const v = appData.vendas.find(x => x.id === id);
  if (!v) return;
  document.getElementById('viewModalTitle').textContent = `Venda #${v.id}`;
  document.getElementById('viewModalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">Data</span>${formatDate(v.data)}</div>
      <div class="detail-item"><span class="detail-label">Cliente</span>${v.cliente}</div>
      <div class="detail-item"><span class="detail-label">Produto</span>${v.produto}</div>
      <div class="detail-item"><span class="detail-label">Quantidade</span>${v.quantidade}</div>
      <div class="detail-item"><span class="detail-label">Valor Unit.</span>${formatCurrency(v.valorUnit)}</div>
      <div class="detail-item"><span class="detail-label">Total</span>${formatCurrency(v.quantidade * v.valorUnit)}</div>
      <div class="detail-item"><span class="detail-label">Vendedor</span>${v.vendedor}</div>
      <div class="detail-item"><span class="detail-label">Forma Pgto</span>${v.formaPagamento}</div>
      <div class="detail-item"><span class="detail-label">Tipo</span>${v.tipo}</div>
      <div class="detail-item"><span class="detail-label">Situação</span><span class="badge ${v.situacao === 'Pago' ? 'badge-success' : 'badge-danger'}">${v.situacao}</span></div>
    </div>
    ${v.obs ? `<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${v.obs}</div>` : ''}`;
  openViewModal();
}

function deleteVenda(id) {
  if (!confirm('Excluir esta venda?')) return;
  appData.vendas = appData.vendas.filter(v => v.id !== id);
  saveData();
  renderVendasPage();
  showToast('Venda excluída!', 'success');
}

// ============================================================
// ESTOQUE
// ============================================================
function renderEstoquePage() {
  const pg = document.getElementById('page-estoque');
  const estoque = appData.estoque || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>📦 Estoque</h2>
      <button class="btn btn-primary" onclick="openEstoqueModal()">+ Novo Item</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto..." oninput="filterEstoque(this.value)">
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Produto</th><th>Quantidade</th><th>Unidade</th><th>Localização</th><th>Estoque Mín.</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody id="estoqueBody"></tbody>
      </table>
    </div>`;
  renderEstoqueTable(estoque);
}

function renderEstoqueTable(items) {
  const tbody = document.getElementById('estoqueBody');
  if (!tbody) return;
  tbody.innerHTML = items.length === 0 ? '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum item no estoque</td></tr>' :
    items.map(e => {
      const status = e.quantidade <= (e.estoqueMin || 0) ? 'badge-danger' : 'badge-success';
      const statusText = e.quantidade <= (e.estoqueMin || 0) ? 'Baixo' : 'OK';
      return `<tr>
        <td>${e.id}</td><td>${e.produto}</td><td>${e.quantidade}</td><td>${e.unidade || 'Unidade'}</td>
        <td>${e.localizacao || '-'}</td><td>${e.estoqueMin || 0}</td>
        <td><span class="badge ${status}">${statusText}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editEstoque(${e.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEstoque(${e.id})">🗑️</button>
        </td>
      </tr>`;
    }).join('');
}

function filterEstoque(q) {
  q = q.toLowerCase();
  const filtered = (appData.estoque || []).filter(e => e.produto.toLowerCase().includes(q));
  renderEstoqueTable(filtered);
}

function openEstoqueModal(item) {
  const isEdit = !!item;
  const unidOpts = (appData.tipoUnidade || []).map(u => `<option value="${u}" ${item && item.unidade === u ? 'selected' : ''}>${u}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Item' : 'Novo Item de Estoque';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Produto</label><input type="text" class="form-control" id="eProduto" value="${item ? item.produto : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Quantidade</label><input type="number" class="form-control" id="eQtd" value="${item ? item.quantidade : 0}" min="0"></div>
      <div class="form-group"><label>Unidade</label><select class="form-control" id="eUnidade">${unidOpts}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Estoque Mínimo</label><input type="number" class="form-control" id="eMin" value="${item ? item.estoqueMin || 0 : 0}" min="0"></div>
      <div class="form-group"><label>Localização</label><input type="text" class="form-control" id="eLocal" value="${item ? item.localizacao || '' : ''}"></div>
    </div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveEstoque(${isEdit ? item.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveEstoque(id) {
  const obj = {
    produto: document.getElementById('eProduto').value,
    quantidade: parseFloat(document.getElementById('eQtd').value) || 0,
    unidade: document.getElementById('eUnidade').value,
    estoqueMin: parseFloat(document.getElementById('eMin').value) || 0,
    localizacao: document.getElementById('eLocal').value
  };
  if (!obj.produto) { showToast('Informe o produto', 'error'); return; }
  if (!appData.estoque) appData.estoque = [];
  if (id) {
    const idx = appData.estoque.findIndex(e => e.id === id);
    if (idx > -1) { obj.id = id; appData.estoque[idx] = obj; }
  } else {
    obj.id = nextId(appData.estoque);
    appData.estoque.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderEstoquePage();
  showToast(id ? 'Item atualizado!' : 'Item cadastrado!', 'success');
}

function editEstoque(id) {
  const item = (appData.estoque || []).find(e => e.id === id);
  if (item) openEstoqueModal(item);
}

function deleteEstoque(id) {
  if (!confirm('Excluir item do estoque?')) return;
  appData.estoque = (appData.estoque || []).filter(e => e.id !== id);
  saveData();
  renderEstoquePage();
  showToast('Item excluído!', 'success');
}

// ============================================================
// CLIENTES
// ============================================================
function renderClientesPage() {
  const pg = document.getElementById('page-clientes');
  const clientes = appData.clientes || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>👥 Clientes</h2>
      <button class="btn btn-primary" onclick="openClienteModal()">+ Novo Cliente</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:300px" placeholder="Buscar cliente..." oninput="filterClientes(this.value)">
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>Estado</th><th>Ações</th></tr></thead>
        <tbody id="clientesBody"></tbody>
      </table>
    </div>`;
  renderClientesTable(clientes);
}

function renderClientesTable(clientes) {
  const tbody = document.getElementById('clientesBody');
  if (!tbody) return;
  tbody.innerHTML = clientes.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cliente cadastrado</td></tr>' :
    clientes.map(c => `<tr>
      <td>${c.id}</td><td>${c.nome}</td><td>${c.cpfCnpj || '-'}</td><td>${c.telefone || '-'}</td><td>${c.cidade || '-'}</td><td>${c.estado || '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewCliente(${c.id})">👁️</button>
        <button class="btn btn-sm btn-primary" onclick="editCliente(${c.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCliente(${c.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterClientes(q) {
  q = q.toLowerCase();
  const filtered = (appData.clientes || []).filter(c =>
    c.nome.toLowerCase().includes(q) || (c.cpfCnpj || '').includes(q) || (c.cidade || '').toLowerCase().includes(q)
  );
  renderClientesTable(filtered);
}

function openClienteModal(cliente) {
  const isEdit = !!cliente;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Cliente' : 'Novo Cliente';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="cNome" value="${cliente ? cliente.nome : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="cDoc" value="${cliente ? cliente.cpfCnpj || '' : ''}"></div>
      <div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="cTel" value="${cliente ? cliente.telefone || '' : ''}"></div>
    </div>
    <div class="form-group"><label>Email</label><input type="email" class="form-control" id="cEmail" value="${cliente ? cliente.email || '' : ''}"></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="cEnd" value="${cliente ? cliente.endereco || '' : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="cCidade" value="${cliente ? cliente.cidade || '' : ''}"></div>
      <div class="form-group"><label>Estado</label><input type="text" class="form-control" id="cEstado" value="${cliente ? cliente.estado || '' : ''}" maxlength="2"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>CEP</label><input type="text" class="form-control" id="cCep" value="${cliente ? cliente.cep || '' : ''}"></div>
      <div class="form-group"><label>Imagem (URL)</label><input type="text" class="form-control" id="cImg" value="${cliente ? cliente.img || '' : ''}"></div>
    </div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="cObs" rows="2">${cliente ? cliente.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveCliente(${isEdit ? cliente.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveCliente(id) {
  const obj = {
    nome: document.getElementById('cNome').value.trim(),
    cpfCnpj: document.getElementById('cDoc').value,
    telefone: document.getElementById('cTel').value,
    email: document.getElementById('cEmail').value,
    endereco: document.getElementById('cEnd').value,
    cidade: document.getElementById('cCidade').value,
    estado: document.getElementById('cEstado').value.toUpperCase(),
    cep: document.getElementById('cCep').value,
    img: document.getElementById('cImg').value,
    obs: document.getElementById('cObs').value
  };
  if (!obj.nome) { showToast('Informe o nome do cliente', 'error'); return; }
  if (id) {
    const idx = appData.clientes.findIndex(c => c.id === id);
    if (idx > -1) { obj.id = id; appData.clientes[idx] = obj; }
  } else {
    obj.id = nextId(appData.clientes);
    appData.clientes.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderClientesPage();
  showToast(id ? 'Cliente atualizado!' : 'Cliente cadastrado!', 'success');
}

function editCliente(id) {
  const c = appData.clientes.find(x => x.id === id);
  if (c) openClienteModal(c);
}

function viewCliente(id) {
  const c = appData.clientes.find(x => x.id === id);
  if (!c) return;
  document.getElementById('viewModalTitle').textContent = c.nome;
  document.getElementById('viewModalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">CPF/CNPJ</span>${c.cpfCnpj || '-'}</div>
      <div class="detail-item"><span class="detail-label">Telefone</span>${c.telefone || '-'}</div>
      <div class="detail-item"><span class="detail-label">Email</span>${c.email || '-'}</div>
      <div class="detail-item"><span class="detail-label">Endereço</span>${c.endereco || '-'}</div>
      <div class="detail-item"><span class="detail-label">Cidade</span>${c.cidade || '-'}</div>
      <div class="detail-item"><span class="detail-label">Estado</span>${c.estado || '-'}</div>
      <div class="detail-item"><span class="detail-label">CEP</span>${c.cep || '-'}</div>
    </div>
    ${c.obs ? `<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${c.obs}</div>` : ''}`;
  openViewModal();
}

function deleteCliente(id) {
  if (!confirm('Excluir este cliente?')) return;
  appData.clientes = appData.clientes.filter(c => c.id !== id);
  saveData();
  renderClientesPage();
  showToast('Cliente excluído!', 'success');
}

// ============================================================
// FORNECEDORES
// ============================================================
function renderFornecedoresPage() {
  const pg = document.getElementById('page-fornecedores');
  const fornecedores = appData.fornecedores || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>🏭 Fornecedores</h2>
      <button class="btn btn-primary" onclick="openFornecedorModal()">+ Novo Fornecedor</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:300px" placeholder="Buscar fornecedor..." oninput="filterFornecedores(this.value)">
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead>
        <tbody id="fornecedoresBody"></tbody>
      </table>
    </div>`;
  renderFornecedoresTable(fornecedores);
}

function renderFornecedoresTable(fornecedores) {
  const tbody = document.getElementById('fornecedoresBody');
  if (!tbody) return;
  tbody.innerHTML = fornecedores.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum fornecedor cadastrado</td></tr>' :
    fornecedores.map(f => `<tr>
      <td>${f.id}</td><td>${f.nome}</td><td>${f.cpfCnpj || '-'}</td><td>${f.telefone || '-'}</td><td>${f.cidade || '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewFornecedor(${f.id})">👁️</button>
        <button class="btn btn-sm btn-primary" onclick="editFornecedor(${f.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteFornecedor(${f.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterFornecedores(q) {
  q = q.toLowerCase();
  const filtered = (appData.fornecedores || []).filter(f =>
    f.nome.toLowerCase().includes(q) || (f.cpfCnpj || '').includes(q)
  );
  renderFornecedoresTable(filtered);
}

function openFornecedorModal(forn) {
  const isEdit = !!forn;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="fNome" value="${forn ? forn.nome : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="fDoc" value="${forn ? forn.cpfCnpj || '' : ''}"></div>
      <div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="fTel" value="${forn ? forn.telefone || '' : ''}"></div>
    </div>
    <div class="form-group"><label>Email</label><input type="email" class="form-control" id="fEmail" value="${forn ? forn.email || '' : ''}"></div>
    <div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="fEnd" value="${forn ? forn.endereco || '' : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="fCidade" value="${forn ? forn.cidade || '' : ''}"></div>
      <div class="form-group"><label>Estado</label><input type="text" class="form-control" id="fEstado" value="${forn ? forn.estado || '' : ''}" maxlength="2"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>CEP</label><input type="text" class="form-control" id="fCep" value="${forn ? forn.cep || '' : ''}"></div>
      <div class="form-group"><label>Imagem (URL)</label><input type="text" class="form-control" id="fImg" value="${forn ? forn.img || '' : ''}"></div>
    </div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="fObs" rows="2">${forn ? forn.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveFornecedor(${isEdit ? forn.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveFornecedor(id) {
  const obj = {
    nome: document.getElementById('fNome').value.trim(),
    cpfCnpj: document.getElementById('fDoc').value,
    telefone: document.getElementById('fTel').value,
    email: document.getElementById('fEmail').value,
    endereco: document.getElementById('fEnd').value,
    cidade: document.getElementById('fCidade').value,
    estado: document.getElementById('fEstado').value.toUpperCase(),
    cep: document.getElementById('fCep').value,
    img: document.getElementById('fImg').value,
    obs: document.getElementById('fObs').value
  };
  if (!obj.nome) { showToast('Informe o nome do fornecedor', 'error'); return; }
  if (id) {
    const idx = appData.fornecedores.findIndex(f => f.id === id);
    if (idx > -1) { obj.id = id; appData.fornecedores[idx] = obj; }
  } else {
    obj.id = nextId(appData.fornecedores);
    appData.fornecedores.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderFornecedoresPage();
  showToast(id ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!', 'success');
}

function editFornecedor(id) {
  const f = appData.fornecedores.find(x => x.id === id);
  if (f) openFornecedorModal(f);
}

function viewFornecedor(id) {
  const f = appData.fornecedores.find(x => x.id === id);
  if (!f) return;
  document.getElementById('viewModalTitle').textContent = f.nome;
  document.getElementById('viewModalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">CPF/CNPJ</span>${f.cpfCnpj || '-'}</div>
      <div class="detail-item"><span class="detail-label">Telefone</span>${f.telefone || '-'}</div>
      <div class="detail-item"><span class="detail-label">Email</span>${f.email || '-'}</div>
      <div class="detail-item"><span class="detail-label">Endereço</span>${f.endereco || '-'}</div>
      <div class="detail-item"><span class="detail-label">Cidade</span>${f.cidade || '-'}</div>
      <div class="detail-item"><span class="detail-label">Estado</span>${f.estado || '-'}</div>
    </div>
    ${f.obs ? `<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${f.obs}</div>` : ''}`;
  openViewModal();
}

function deleteFornecedor(id) {
  if (!confirm('Excluir este fornecedor?')) return;
  appData.fornecedores = appData.fornecedores.filter(f => f.id !== id);
  saveData();
  renderFornecedoresPage();
  showToast('Fornecedor excluído!', 'success');
}

// ============================================================
// PRODUTOS
// ============================================================
function renderProdutosPage() {
  const pg = document.getElementById('page-produtos');
  const produtos = appData.produtos || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>🏷️ Produtos</h2>
      <button class="btn btn-primary" onclick="openProdutoModal()">+ Novo Produto</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:300px" placeholder="Buscar produto..." oninput="filterProdutos(this.value)">
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Nome</th><th>Categoria</th><th>Unidade</th><th>Preço Custo</th><th>Preço Venda</th><th>Ações</th></tr></thead>
        <tbody id="produtosBody"></tbody>
      </table>
    </div>`;
  renderProdutosTable(produtos);
}

function renderProdutosTable(produtos) {
  const tbody = document.getElementById('produtosBody');
  if (!tbody) return;
  tbody.innerHTML = produtos.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto cadastrado</td></tr>' :
    produtos.map(p => `<tr>
      <td>${p.id}</td><td>${p.nome}</td><td>${p.categoria || '-'}</td><td>${p.unidade || '-'}</td>
      <td>${formatCurrency(p.precoCusto || 0)}</td><td>${formatCurrency(p.precoVenda || 0)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editProduto(${p.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduto(${p.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterProdutos(q) {
  q = q.toLowerCase();
  const filtered = (appData.produtos || []).filter(p => p.nome.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q));
  renderProdutosTable(filtered);
}

function openProdutoModal(prod) {
  const isEdit = !!prod;
  const unidOpts = (appData.tipoUnidade || []).map(u => `<option value="${u}" ${prod && prod.unidade === u ? 'selected' : ''}>${u}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Produto' : 'Novo Produto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="pNome" value="${prod ? prod.nome : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="pCat" value="${prod ? prod.categoria || '' : ''}"></div>
      <div class="form-group"><label>Unidade</label><select class="form-control" id="pUnid">${unidOpts}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Preço Custo</label><input type="number" class="form-control" id="pCusto" value="${prod ? prod.precoCusto || '' : ''}" step="0.01"></div>
      <div class="form-group"><label>Preço Venda</label><input type="number" class="form-control" id="pVenda" value="${prod ? prod.precoVenda || '' : ''}" step="0.01"></div>
    </div>
    <div class="form-group"><label>Descrição</label><textarea class="form-control" id="pDesc" rows="2">${prod ? prod.descricao || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveProduto(${isEdit ? prod.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveProduto(id) {
  const obj = {
    nome: document.getElementById('pNome').value.trim(),
    categoria: document.getElementById('pCat').value,
    unidade: document.getElementById('pUnid').value,
    precoCusto: parseFloat(document.getElementById('pCusto').value) || 0,
    precoVenda: parseFloat(document.getElementById('pVenda').value) || 0,
    descricao: document.getElementById('pDesc').value
  };
  if (!obj.nome) { showToast('Informe o nome do produto', 'error'); return; }
  if (!appData.produtos) appData.produtos = [];
  if (id) {
    const idx = appData.produtos.findIndex(p => p.id === id);
    if (idx > -1) { obj.id = id; appData.produtos[idx] = obj; }
  } else {
    obj.id = nextId(appData.produtos);
    appData.produtos.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderProdutosPage();
  showToast(id ? 'Produto atualizado!' : 'Produto cadastrado!', 'success');
}

function editProduto(id) {
  const p = (appData.produtos || []).find(x => x.id === id);
  if (p) openProdutoModal(p);
}

function deleteProduto(id) {
  if (!confirm('Excluir este produto?')) return;
  appData.produtos = (appData.produtos || []).filter(p => p.id !== id);
  saveData();
  renderProdutosPage();
  showToast('Produto excluído!', 'success');
}

// ============================================================
// PRODUTOS DE FORNECEDORES
// ============================================================
function renderPFornecedoresPage() {
  const pg = document.getElementById('page-pfornecedores');
  const pf = appData.pFornecedores || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>📋 Produtos de Fornecedores</h2>
      <button class="btn btn-primary" onclick="openPFornModal()">+ Novo Registro</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:300px" placeholder="Buscar..." oninput="filterPForn(this.value)">
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Fornecedor</th><th>Produto</th><th>Preço</th><th>Obs</th><th>Ações</th></tr></thead>
        <tbody id="pfornBody"></tbody>
      </table>
    </div>`;
  renderPFornTable(pf);
}

function renderPFornTable(items) {
  const tbody = document.getElementById('pfornBody');
  if (!tbody) return;
  tbody.innerHTML = items.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>' :
    items.map(p => `<tr>
      <td>${p.id}</td><td>${p.fornecedor}</td><td>${p.produto}</td><td>${formatCurrency(p.preco || 0)}</td><td>${p.obs || '-'}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editPForn(${p.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deletePForn(${p.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterPForn(q) {
  q = q.toLowerCase();
  const filtered = (appData.pFornecedores || []).filter(p =>
    p.fornecedor.toLowerCase().includes(q) || p.produto.toLowerCase().includes(q)
  );
  renderPFornTable(filtered);
}

function openPFornModal(item) {
  const isEdit = !!item;
  const fornOpts = (appData.fornecedores || []).map(f => `<option value="${f.nome}" ${item && item.fornecedor === f.nome ? 'selected' : ''}>${f.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar P. Fornecedor' : 'Novo P. Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Fornecedor</label><select class="form-control" id="pfForn"><option value="">Selecione...</option>${fornOpts}</select></div>
    <div class="form-group"><label>Produto</label><input type="text" class="form-control" id="pfProd" value="${item ? item.produto : ''}"></div>
    <div class="form-group"><label>Preço</label><input type="number" class="form-control" id="pfPreco" value="${item ? item.preco || '' : ''}" step="0.01"></div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="pfObs" rows="2">${item ? item.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePForn(${isEdit ? item.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePForn(id) {
  const obj = {
    fornecedor: document.getElementById('pfForn').value,
    produto: document.getElementById('pfProd').value.trim(),
    preco: parseFloat(document.getElementById('pfPreco').value) || 0,
    obs: document.getElementById('pfObs').value
  };
  if (!obj.fornecedor || !obj.produto) { showToast('Preencha fornecedor e produto', 'error'); return; }
  if (!appData.pFornecedores) appData.pFornecedores = [];
  if (id) {
    const idx = appData.pFornecedores.findIndex(p => p.id === id);
    if (idx > -1) { obj.id = id; appData.pFornecedores[idx] = obj; }
  } else {
    obj.id = nextId(appData.pFornecedores);
    appData.pFornecedores.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderPFornecedoresPage();
  showToast(id ? 'Registro atualizado!' : 'Registro cadastrado!', 'success');
}

function editPForn(id) {
  const p = (appData.pFornecedores || []).find(x => x.id === id);
  if (p) openPFornModal(p);
}

function deletePForn(id) {
  if (!confirm('Excluir este registro?')) return;
  appData.pFornecedores = (appData.pFornecedores || []).filter(p => p.id !== id);
  saveData();
  renderPFornecedoresPage();
  showToast('Registro excluído!', 'success');
}

// ============================================================
// BOLETOS
// ============================================================
function renderBoletosPage() {
  const pg = document.getElementById('page-boletos');
  const boletos = appData.boletos || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>🔖 Boletos</h2>
      <button class="btn btn-primary" onclick="openBoletoModal()">+ Novo Boleto</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar boleto..." oninput="filterBoletos(this.value)">
      <select class="form-control" style="max-width:150px" onchange="filterBoletosSit(this.value)">
        <option value="">Todas situações</option>
        ${(appData.situacaoBoleto||[]).map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Fornecedor</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody id="boletosBody"></tbody>
      </table>
    </div>`;
  renderBoletosTable(boletos);
}

function renderBoletosTable(boletos) {
  const tbody = document.getElementById('boletosBody');
  if (!tbody) return;
  tbody.innerHTML = boletos.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>' :
    boletos.map(b => {
      const badge = b.situacao === 'Pago' ? 'badge-success' : b.situacao === 'Vencido' ? 'badge-danger' : 'badge-warning';
      return `<tr>
        <td>${b.id}</td><td>${b.descricao || '-'}</td><td>${formatCurrency(b.valor)}</td><td>${formatDate(b.vencimento)}</td>
        <td>${b.fornecedor || '-'}</td><td><span class="badge ${badge}">${b.situacao}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editBoleto(${b.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteBoleto(${b.id})">🗑️</button>
        </td>
      </tr>`;
    }).join('');
}

function filterBoletos(q) {
  q = q.toLowerCase();
  renderBoletosTable((appData.boletos || []).filter(b => (b.descricao || '').toLowerCase().includes(q) || (b.fornecedor || '').toLowerCase().includes(q)));
}

function filterBoletosSit(sit) {
  renderBoletosTable(sit ? (appData.boletos || []).filter(b => b.situacao === sit) : (appData.boletos || []));
}

function openBoletoModal(boleto) {
  const isEdit = !!boleto;
  const fornOpts = (appData.fornecedores || []).map(f => `<option value="${f.nome}" ${boleto && boleto.fornecedor === f.nome ? 'selected' : ''}>${f.nome}</option>`).join('');
  const sitOpts = (appData.situacaoBoleto || []).map(s => `<option value="${s}" ${boleto && boleto.situacao === s ? 'selected' : ''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Boleto' : 'Novo Boleto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Descrição</label><input type="text" class="form-control" id="bDesc" value="${boleto ? boleto.descricao || '' : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="bValor" value="${boleto ? boleto.valor : ''}" step="0.01"></div>
      <div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="bVenc" value="${boleto ? boleto.vencimento : ''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Fornecedor</label><select class="form-control" id="bForn"><option value="">Selecione...</option>${fornOpts}</select></div>
      <div class="form-group"><label>Situação</label><select class="form-control" id="bSit">${sitOpts}</select></div>
    </div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="bObs" rows="2">${boleto ? boleto.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveBoleto(${isEdit ? boleto.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveBoleto(id) {
  const obj = {
    descricao: document.getElementById('bDesc').value,
    valor: parseFloat(document.getElementById('bValor').value) || 0,
    vencimento: document.getElementById('bVenc').value,
    fornecedor: document.getElementById('bForn').value,
    situacao: document.getElementById('bSit').value,
    obs: document.getElementById('bObs').value
  };
  if (!appData.boletos) appData.boletos = [];
  if (id) {
    const idx = appData.boletos.findIndex(b => b.id === id);
    if (idx > -1) { obj.id = id; appData.boletos[idx] = obj; }
  } else {
    obj.id = nextId(appData.boletos);
    appData.boletos.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderBoletosPage();
  showToast(id ? 'Boleto atualizado!' : 'Boleto cadastrado!', 'success');
}

function editBoleto(id) { const b = (appData.boletos || []).find(x => x.id === id); if (b) openBoletoModal(b); }
function deleteBoleto(id) { if (!confirm('Excluir boleto?')) return; appData.boletos = (appData.boletos || []).filter(b => b.id !== id); saveData(); renderBoletosPage(); showToast('Boleto excluído!','success'); }

// ============================================================
// CHEQUES
// ============================================================
function renderChequesPage() {
  const pg = document.getElementById('page-cheques');
  const cheques = appData.cheques || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>📝 Cheques</h2>
      <button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cheque..." oninput="filterCheques(this.value)">
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Nº Cheque</th><th>Valor</th><th>Data</th><th>Emitente</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody id="chequesBody"></tbody>
      </table>
    </div>`;
  renderChequesTable(cheques);
}

function renderChequesTable(cheques) {
  const tbody = document.getElementById('chequesBody');
  if (!tbody) return;
  tbody.innerHTML = cheques.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>' :
    cheques.map(c => {
      const badge = c.situacao === 'Compensado' ? 'badge-success' : c.situacao === 'Devolvido' ? 'badge-danger' : 'badge-warning';
      return `<tr>
        <td>${c.id}</td><td>${c.numero || '-'}</td><td>${formatCurrency(c.valor)}</td><td>${formatDate(c.data)}</td>
        <td>${c.emitente || '-'}</td><td><span class="badge ${badge}">${c.situacao}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editCheque(${c.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCheque(${c.id})">🗑️</button>
        </td>
      </tr>`;
    }).join('');
}

function filterCheques(q) {
  q = q.toLowerCase();
  renderChequesTable((appData.cheques || []).filter(c => (c.numero || '').toLowerCase().includes(q) || (c.emitente || '').toLowerCase().includes(q)));
}

function openChequeModal(cheque) {
  const isEdit = !!cheque;
  const sitOpts = (appData.situacaoCheque || []).map(s => `<option value="${s}" ${cheque && cheque.situacao === s ? 'selected' : ''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Cheque' : 'Novo Cheque';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Nº Cheque</label><input type="text" class="form-control" id="chNum" value="${cheque ? cheque.numero || '' : ''}"></div>
      <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="chValor" value="${cheque ? cheque.valor : ''}" step="0.01"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Data</label><input type="date" class="form-control" id="chData" value="${cheque ? cheque.data : ''}"></div>
      <div class="form-group"><label>Situação</label><select class="form-control" id="chSit">${sitOpts}</select></div>
    </div>
    <div class="form-group"><label>Emitente</label><input type="text" class="form-control" id="chEmit" value="${cheque ? cheque.emitente || '' : ''}"></div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="chObs" rows="2">${cheque ? cheque.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveCheque(${isEdit ? cheque.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveCheque(id) {
  const obj = {
    numero: document.getElementById('chNum').value,
    valor: parseFloat(document.getElementById('chValor').value) || 0,
    data: document.getElementById('chData').value,
    situacao: document.getElementById('chSit').value,
    emitente: document.getElementById('chEmit').value,
    obs: document.getElementById('chObs').value
  };
  if (!appData.cheques) appData.cheques = [];
  if (id) {
    const idx = appData.cheques.findIndex(c => c.id === id);
    if (idx > -1) { obj.id = id; appData.cheques[idx] = obj; }
  } else {
    obj.id = nextId(appData.cheques);
    appData.cheques.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderChequesPage();
  showToast(id ? 'Cheque atualizado!' : 'Cheque cadastrado!', 'success');
}

function editCheque(id) { const c = (appData.cheques || []).find(x => x.id === id); if (c) openChequeModal(c); }
function deleteCheque(id) { if (!confirm('Excluir cheque?')) return; appData.cheques = (appData.cheques || []).filter(c => c.id !== id); saveData(); renderChequesPage(); showToast('Cheque excluído!','success'); }

// ============================================================
// PRESTAÇÕES
// ============================================================
function renderPrestacoesPage() {
  const pg = document.getElementById('page-prestacoes');
  const prestacoes = appData.prestacoes || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>💳 Prestações</h2>
      <button class="btn btn-primary" onclick="openPrestacaoModal()">+ Nova Prestação</button>
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Descrição</th><th>Valor Total</th><th>Parcelas</th><th>Valor Parcela</th><th>Pagas</th><th>Restante</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody id="prestacoesBody"></tbody>
      </table>
    </div>`;
  renderPrestacoesTable(prestacoes);
}

function renderPrestacoesTable(prestacoes) {
  const tbody = document.getElementById('prestacoesBody');
  if (!tbody) return;
  tbody.innerHTML = prestacoes.length === 0 ? '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma prestação</td></tr>' :
    prestacoes.map(p => {
      const pagas = p.parcelasPagas || 0;
      const restante = (p.parcelas - pagas) * (p.valorParcela || 0);
      const sit = pagas >= p.parcelas ? 'Quitado' : 'Em aberto';
      return `<tr>
        <td>${p.id}</td><td>${p.descricao}</td><td>${formatCurrency(p.valorTotal)}</td><td>${p.parcelas}</td>
        <td>${formatCurrency(p.valorParcela || 0)}</td><td>${pagas}/${p.parcelas}</td><td>${formatCurrency(restante)}</td>
        <td><span class="badge ${sit === 'Quitado' ? 'badge-success' : 'badge-warning'}">${sit}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editPrestacao(${p.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deletePrestacao(${p.id})">🗑️</button>
        </td>
      </tr>`;
    }).join('');
}

function openPrestacaoModal(prest) {
  const isEdit = !!prest;
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Prestação' : 'Nova Prestação';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Descrição</label><input type="text" class="form-control" id="prDesc" value="${prest ? prest.descricao : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Valor Total</label><input type="number" class="form-control" id="prTotal" value="${prest ? prest.valorTotal : ''}" step="0.01"></div>
      <div class="form-group"><label>Nº Parcelas</label><input type="number" class="form-control" id="prParc" value="${prest ? prest.parcelas : ''}" min="1"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Valor Parcela</label><input type="number" class="form-control" id="prValorParc" value="${prest ? prest.valorParcela || '' : ''}" step="0.01"></div>
      <div class="form-group"><label>Parcelas Pagas</label><input type="number" class="form-control" id="prPagas" value="${prest ? prest.parcelasPagas || 0 : 0}" min="0"></div>
    </div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="prObs" rows="2">${prest ? prest.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePrestacao(${isEdit ? prest.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePrestacao(id) {
  const obj = {
    descricao: document.getElementById('prDesc').value,
    valorTotal: parseFloat(document.getElementById('prTotal').value) || 0,
    parcelas: parseInt(document.getElementById('prParc').value) || 1,
    valorParcela: parseFloat(document.getElementById('prValorParc').value) || 0,
    parcelasPagas: parseInt(document.getElementById('prPagas').value) || 0,
    obs: document.getElementById('prObs').value
  };
  if (!appData.prestacoes) appData.prestacoes = [];
  if (id) {
    const idx = appData.prestacoes.findIndex(p => p.id === id);
    if (idx > -1) { obj.id = id; appData.prestacoes[idx] = obj; }
  } else {
    obj.id = nextId(appData.prestacoes);
    appData.prestacoes.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderPrestacoesPage();
  showToast(id ? 'Prestação atualizada!' : 'Prestação cadastrada!', 'success');
}

function editPrestacao(id) { const p = (appData.prestacoes || []).find(x => x.id === id); if (p) openPrestacaoModal(p); }
function deletePrestacao(id) { if (!confirm('Excluir prestação?')) return; appData.prestacoes = (appData.prestacoes || []).filter(p => p.id !== id); saveData(); renderPrestacoesPage(); showToast('Prestação excluída!','success'); }

// ============================================================
// PROJETOS
// ============================================================
function renderProjetosPage() {
  const pg = document.getElementById('page-projetos');
  const projetos = appData.projetos || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>📐 Projetos</h2>
      <button class="btn btn-primary" onclick="openProjetoModal()">+ Novo Projeto</button>
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Nome</th><th>Cliente</th><th>Valor</th><th>Início</th><th>Previsão</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody id="projetosBody"></tbody>
      </table>
    </div>`;
  const tbody = document.getElementById('projetosBody');
  tbody.innerHTML = projetos.length === 0 ? '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum projeto</td></tr>' :
    projetos.map(p => `<tr>
      <td>${p.id}</td><td>${p.nome}</td><td>${p.cliente || '-'}</td><td>${formatCurrency(p.valor || 0)}</td>
      <td>${formatDate(p.inicio)}</td><td>${formatDate(p.previsao)}</td>
      <td><span class="badge ${p.status === 'Concluído' ? 'badge-success' : p.status === 'Cancelado' ? 'badge-danger' : 'badge-info'}">${p.status}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editProjeto(${p.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProjeto(${p.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function openProjetoModal(proj) {
  const isEdit = !!proj;
  const clienteOpts = (appData.clientes || []).map(c => `<option value="${c.nome}" ${proj && proj.cliente === c.nome ? 'selected' : ''}>${c.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Projeto' : 'Novo Projeto';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Nome</label><input type="text" class="form-control" id="projNome" value="${proj ? proj.nome : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Cliente</label><select class="form-control" id="projCliente"><option value="">Selecione...</option>${clienteOpts}</select></div>
      <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="projValor" value="${proj ? proj.valor || '' : ''}" step="0.01"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Início</label><input type="date" class="form-control" id="projInicio" value="${proj ? proj.inicio : ''}"></div>
      <div class="form-group"><label>Previsão</label><input type="date" class="form-control" id="projPrev" value="${proj ? proj.previsao : ''}"></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="projStatus">
        <option value="Em andamento" ${proj && proj.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
        <option value="Concluído" ${proj && proj.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
        <option value="Cancelado" ${proj && proj.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
      </select>
    </div>
    <div class="form-group"><label>Descrição</label><textarea class="form-control" id="projDesc" rows="2">${proj ? proj.descricao || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveProjeto(${isEdit ? proj.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveProjeto(id) {
  const obj = {
    nome: document.getElementById('projNome').value,
    cliente: document.getElementById('projCliente').value,
    valor: parseFloat(document.getElementById('projValor').value) || 0,
    inicio: document.getElementById('projInicio').value,
    previsao: document.getElementById('projPrev').value,
    status: document.getElementById('projStatus').value,
    descricao: document.getElementById('projDesc').value
  };
  if (!appData.projetos) appData.projetos = [];
  if (id) {
    const idx = appData.projetos.findIndex(p => p.id === id);
    if (idx > -1) { obj.id = id; appData.projetos[idx] = obj; }
  } else {
    obj.id = nextId(appData.projetos);
    appData.projetos.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderProjetosPage();
  showToast(id ? 'Projeto atualizado!' : 'Projeto cadastrado!', 'success');
}

function editProjeto(id) { const p = (appData.projetos || []).find(x => x.id === id); if (p) openProjetoModal(p); }
function deleteProjeto(id) { if (!confirm('Excluir projeto?')) return; appData.projetos = (appData.projetos || []).filter(p => p.id !== id); saveData(); renderProjetosPage(); showToast('Projeto excluído!','success'); }

// ============================================================
// PAGAMENTOS DE CLIENTES
// ============================================================
function renderPagClientesPage() {
  const pg = document.getElementById('page-pagclientes');
  const pags = appData.pagClientes || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>🤝 Pagamentos de Clientes</h2>
      <button class="btn btn-primary" onclick="openPagClienteModal()">+ Novo Pagamento</button>
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Cliente</th><th>Valor</th><th>Data</th><th>Forma Pgto</th><th>Referência</th><th>Ações</th></tr></thead>
        <tbody id="pagClientesBody"></tbody>
      </table>
    </div>`;
  const tbody = document.getElementById('pagClientesBody');
  tbody.innerHTML = pags.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum pagamento</td></tr>' :
    pags.map(p => `<tr>
      <td>${p.id}</td><td>${p.cliente}</td><td>${formatCurrency(p.valor)}</td><td>${formatDate(p.data)}</td>
      <td>${p.formaPagamento || '-'}</td><td>${p.referencia || '-'}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editPagCliente(${p.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deletePagCliente(${p.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function openPagClienteModal(pag) {
  const isEdit = !!pag;
  const clienteOpts = (appData.clientes || []).map(c => `<option value="${c.nome}" ${pag && pag.cliente === c.nome ? 'selected' : ''}>${c.nome}</option>`).join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => `<option value="${f}" ${pag && pag.formaPagamento === f ? 'selected' : ''}>${f}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Pagamento' : 'Novo Pagamento';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Cliente</label><select class="form-control" id="pcCliente"><option value="">Selecione...</option>${clienteOpts}</select></div>
      <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pcValor" value="${pag ? pag.valor : ''}" step="0.01"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Data</label><input type="date" class="form-control" id="pcData" value="${pag ? pag.data : new Date().toISOString().split('T')[0]}"></div>
      <div class="form-group"><label>Forma Pgto</label><select class="form-control" id="pcPgto">${pgtoOpts}</select></div>
    </div>
    <div class="form-group"><label>Referência</label><input type="text" class="form-control" id="pcRef" value="${pag ? pag.referencia || '' : ''}"></div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="pcObs" rows="2">${pag ? pag.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePagCliente(${isEdit ? pag.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function savePagCliente(id) {
  const obj = {
    cliente: document.getElementById('pcCliente').value,
    valor: parseFloat(document.getElementById('pcValor').value) || 0,
    data: document.getElementById('pcData').value,
    formaPagamento: document.getElementById('pcPgto').value,
    referencia: document.getElementById('pcRef').value,
    obs: document.getElementById('pcObs').value
  };
  if (!appData.pagClientes) appData.pagClientes = [];
  if (id) {
    const idx = appData.pagClientes.findIndex(p => p.id === id);
    if (idx > -1) { obj.id = id; appData.pagClientes[idx] = obj; }
  } else {
    obj.id = nextId(appData.pagClientes);
    appData.pagClientes.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderPagClientesPage();
  showToast(id ? 'Pagamento atualizado!' : 'Pagamento cadastrado!', 'success');
}

function editPagCliente(id) { const p = (appData.pagClientes || []).find(x => x.id === id); if (p) openPagClienteModal(p); }
function deletePagCliente(id) { if (!confirm('Excluir pagamento?')) return; appData.pagClientes = (appData.pagClientes || []).filter(p => p.id !== id); saveData(); renderPagClientesPage(); showToast('Pagamento excluído!','success'); }

// ============================================================
// GARANTIAS
// ============================================================
function renderGarantiasPage() {
  const pg = document.getElementById('page-garantias');
  const garantias = appData.garantias || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>🛡️ Garantias</h2>
      <button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar garantia..." oninput="filterGarantias(this.value)">
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Produto</th><th>Cliente</th><th>Início</th><th>Fim</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody id="garantiasBody"></tbody>
      </table>
    </div>`;
  renderGarantiasTable(garantias);
}

function renderGarantiasTable(garantias) {
  const tbody = document.getElementById('garantiasBody');
  if (!tbody) return;
  tbody.innerHTML = garantias.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>' :
    garantias.map(g => {
      const badge = g.situacao === 'Ativa' ? 'badge-success' : g.situacao === 'Expirada' ? 'badge-danger' : 'badge-warning';
      return `<tr>
        <td>${g.id}</td><td>${g.produto}</td><td>${g.cliente || '-'}</td><td>${formatDate(g.inicio)}</td><td>${formatDate(g.fim)}</td>
        <td><span class="badge ${badge}">${g.situacao}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editGarantia(${g.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteGarantia(${g.id})">🗑️</button>
        </td>
      </tr>`;
    }).join('');
}

function filterGarantias(q) {
  q = q.toLowerCase();
  renderGarantiasTable((appData.garantias || []).filter(g => g.produto.toLowerCase().includes(q) || (g.cliente || '').toLowerCase().includes(q)));
}

function openGarantiaModal(gar) {
  const isEdit = !!gar;
  const clienteOpts = (appData.clientes || []).map(c => `<option value="${c.nome}" ${gar && gar.cliente === c.nome ? 'selected' : ''}>${c.nome}</option>`).join('');
  const sitOpts = (appData.situacaoGarantia || []).map(s => `<option value="${s}" ${gar && gar.situacao === s ? 'selected' : ''}>${s}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Garantia' : 'Nova Garantia';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-group"><label>Produto</label><input type="text" class="form-control" id="garProd" value="${gar ? gar.produto : ''}"></div>
    <div class="form-group"><label>Cliente</label><select class="form-control" id="garCliente"><option value="">Selecione...</option>${clienteOpts}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Início</label><input type="date" class="form-control" id="garInicio" value="${gar ? gar.inicio : ''}"></div>
      <div class="form-group"><label>Fim</label><input type="date" class="form-control" id="garFim" value="${gar ? gar.fim : ''}"></div>
    </div>
    <div class="form-group"><label>Situação</label><select class="form-control" id="garSit">${sitOpts}</select></div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="garObs" rows="2">${gar ? gar.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveGarantia(${isEdit ? gar.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveGarantia(id) {
  const obj = {
    produto: document.getElementById('garProd').value,
    cliente: document.getElementById('garCliente').value,
    inicio: document.getElementById('garInicio').value,
    fim: document.getElementById('garFim').value,
    situacao: document.getElementById('garSit').value,
    obs: document.getElementById('garObs').value
  };
  if (!appData.garantias) appData.garantias = [];
  if (id) {
    const idx = appData.garantias.findIndex(g => g.id === id);
    if (idx > -1) { obj.id = id; appData.garantias[idx] = obj; }
  } else {
    obj.id = nextId(appData.garantias);
    appData.garantias.push(obj);
  }
  saveData();
  closeCadastroModal();
  renderGarantiasPage();
  showToast(id ? 'Garantia atualizada!' : 'Garantia cadastrada!', 'success');
}

function editGarantia(id) { const g = (appData.garantias || []).find(x => x.id === id); if (g) openGarantiaModal(g); }
function deleteGarantia(id) { if (!confirm('Excluir garantia?')) return; appData.garantias = (appData.garantias || []).filter(g => g.id !== id); saveData(); renderGarantiasPage(); showToast('Garantia excluída!','success'); }

// ============================================================
// RELATÓRIOS
// ============================================================
function renderRelatoriosPage() {
  const pg = document.getElementById('page-relatorios');
  const compras = appData.compras || [];
  const vendas = appData.vendas || [];
  const totalCompras = compras.reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalVendas = vendas.reduce((s, v) => s + (v.quantidade * v.valorUnit), 0);
  const lucro = totalVendas - totalCompras;

  // Vendas por vendedor
  const porVendedor = {};
  vendas.forEach(v => {
    if (!porVendedor[v.vendedor]) porVendedor[v.vendedor] = 0;
    porVendedor[v.vendedor] += v.quantidade * v.valorUnit;
  });

  // Compras por fornecedor (top 5)
  const porFornecedor = {};
  compras.forEach(c => {
    if (!porFornecedor[c.fornecedor]) porFornecedor[c.fornecedor] = 0;
    porFornecedor[c.fornecedor] += c.quantidade * c.valorUnit;
  });
  const topForn = Object.entries(porFornecedor).sort((a, b) => b[1] - a[1]).slice(0, 5);

  pg.innerHTML = `
    <div class="page-header"><h2>📈 Relatórios</h2></div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">${formatCurrency(totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">${formatCurrency(totalVendas)}</div></div>
      <div class="card"><div class="card-header"><span>Lucro Bruto</span></div><div class="card-value ${lucro >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(lucro)}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="card">
        <div class="section-title">Vendas por Vendedor</div>
        ${Object.entries(porVendedor).map(([v, t]) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color)">
            <span>${v}</span><strong>${formatCurrency(t)}</strong>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="section-title">Top 5 Fornecedores (Compras)</div>
        ${topForn.map(([f, t]) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color)">
            <span>${f}</span><strong>${formatCurrency(t)}</strong>
          </div>`).join('')}
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
    <div class="page-header">
      <h2>📥 Notas de Entrada</h2>
      <button class="btn btn-primary" onclick="openNotaEntradaModal()">+ Nova Nota</button>
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Nº Nota</th><th>Fornecedor</th><th>Data</th><th>Valor</th><th>Ações</th></tr></thead>
        <tbody id="notasEntradaBody"></tbody>
      </table>
    </div>`;
  const tbody = document.getElementById('notasEntradaBody');
  tbody.innerHTML = notas.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>' :
    notas.map(n => `<tr>
      <td>${n.id}</td><td>${n.numero || '-'}</td><td>${n.fornecedor || '-'}</td><td>${formatDate(n.data)}</td><td>${formatCurrency(n.valor || 0)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editNotaEntrada(${n.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada(${n.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function openNotaEntradaModal(nota) {
  const isEdit = !!nota;
  const fornOpts = (appData.fornecedores || []).map(f => `<option value="${f.nome}" ${nota && nota.fornecedor === f.nome ? 'selected' : ''}>${f.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Nota Entrada' : 'Nova Nota Entrada';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="neNum" value="${nota ? nota.numero || '' : ''}"></div>
      <div class="form-group"><label>Data</label><input type="date" class="form-control" id="neData" value="${nota ? nota.data : ''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Fornecedor</label><select class="form-control" id="neForn"><option value="">Selecione...</option>${fornOpts}</select></div>
      <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="neValor" value="${nota ? nota.valor || '' : ''}" step="0.01"></div>
    </div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="neObs" rows="2">${nota ? nota.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveNotaEntrada(${isEdit ? nota.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveNotaEntrada(id) {
  const obj = { numero: document.getElementById('neNum').value, data: document.getElementById('neData').value, fornecedor: document.getElementById('neForn').value, valor: parseFloat(document.getElementById('neValor').value) || 0, obs: document.getElementById('neObs').value };
  if (!appData.notasEntrada) appData.notasEntrada = [];
  if (id) { const idx = appData.notasEntrada.findIndex(n => n.id === id); if (idx > -1) { obj.id = id; appData.notasEntrada[idx] = obj; } }
  else { obj.id = nextId(appData.notasEntrada); appData.notasEntrada.push(obj); }
  saveData(); closeCadastroModal(); renderNotasEntradaPage(); showToast(id ? 'Nota atualizada!' : 'Nota cadastrada!', 'success');
}

function editNotaEntrada(id) { const n = (appData.notasEntrada || []).find(x => x.id === id); if (n) openNotaEntradaModal(n); }
function deleteNotaEntrada(id) { if (!confirm('Excluir nota?')) return; appData.notasEntrada = (appData.notasEntrada || []).filter(n => n.id !== id); saveData(); renderNotasEntradaPage(); showToast('Nota excluída!','success'); }

// ============================================================
// NOTAS DE SAÍDA
// ============================================================
function renderNotasSaidaPage() {
  const pg = document.getElementById('page-notassaida');
  const notas = appData.notasSaida || [];
  pg.innerHTML = `
    <div class="page-header">
      <h2>📤 Notas de Saída</h2>
      <button class="btn btn-primary" onclick="openNotaSaidaModal()">+ Nova Nota</button>
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Nº Nota</th><th>Cliente</th><th>Data</th><th>Valor</th><th>Ações</th></tr></thead>
        <tbody id="notasSaidaBody"></tbody>
      </table>
    </div>`;
  const tbody = document.getElementById('notasSaidaBody');
  tbody.innerHTML = notas.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>' :
    notas.map(n => `<tr>
      <td>${n.id}</td><td>${n.numero || '-'}</td><td>${n.cliente || '-'}</td><td>${formatDate(n.data)}</td><td>${formatCurrency(n.valor || 0)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editNotaSaida(${n.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNotaSaida(${n.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function openNotaSaidaModal(nota) {
  const isEdit = !!nota;
  const clienteOpts = (appData.clientes || []).map(c => `<option value="${c.nome}" ${nota && nota.cliente === c.nome ? 'selected' : ''}>${c.nome}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Nota Saída' : 'Nova Nota Saída';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="nsNum" value="${nota ? nota.numero || '' : ''}"></div>
      <div class="form-group"><label>Data</label><input type="date" class="form-control" id="nsData" value="${nota ? nota.data : ''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Cliente</label><select class="form-control" id="nsCliente"><option value="">Selecione...</option>${clienteOpts}</select></div>
      <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="nsValor" value="${nota ? nota.valor || '' : ''}" step="0.01"></div>
    </div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="nsObs" rows="2">${nota ? nota.obs || '' : ''}</textarea></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveNotaSaida(${isEdit ? nota.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveNotaSaida(id) {
  const obj = { numero: document.getElementById('nsNum').value, data: document.getElementById('nsData').value, cliente: document.getElementById('nsCliente').value, valor: parseFloat(document.getElementById('nsValor').value) || 0, obs: document.getElementById('nsObs').value };
  if (!appData.notasSaida) appData.notasSaida = [];
  if (id) { const idx = appData.notasSaida.findIndex(n => n.id === id); if (idx > -1) { obj.id = id; appData.notasSaida[idx] = obj; } }
  else { obj.id = nextId(appData.notasSaida); appData.notasSaida.push(obj); }
  saveData(); closeCadastroModal(); renderNotasSaidaPage(); showToast(id ? 'Nota atualizada!' : 'Nota cadastrada!', 'success');
}

function editNotaSaida(id) { const n = (appData.notasSaida || []).find(x => x.id === id); if (n) openNotaSaidaModal(n); }
function deleteNotaSaida(id) { if (!confirm('Excluir nota?')) return; appData.notasSaida = (appData.notasSaida || []).filter(n => n.id !== id); saveData(); renderNotasSaidaPage(); showToast('Nota excluída!','success'); }

// ============================================================
// RECEITAS MEI
// ============================================================
function renderReceitasMeiPage() {
  const pg = document.getElementById('page-receitasmei');
  const receitas = appData.receitasMei || [];
  const totalAnual = receitas.reduce((s, r) => s + (r.valor || 0), 0);
  const limiteAnual = 81000;

  pg.innerHTML = `
    <div class="page-header">
      <h2>📄 Receitas MEI</h2>
      <button class="btn btn-primary" onclick="openReceitaMeiModal()">+ Nova Receita</button>
    </div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Faturamento Anual</span></div><div class="card-value">${formatCurrency(totalAnual)}</div></div>
      <div class="card"><div class="card-header"><span>Limite MEI</span></div><div class="card-value">${formatCurrency(limiteAnual)}</div></div>
      <div class="card"><div class="card-header"><span>Disponível</span></div><div class="card-value ${(limiteAnual - totalAnual) >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(limiteAnual - totalAnual)}</div></div>
      <div class="card"><div class="card-header"><span>% Utilizado</span></div>
        <div class="card-value">${((totalAnual / limiteAnual) * 100).toFixed(1)}%</div>
        <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" style="width:${Math.min((totalAnual / limiteAnual) * 100, 100)}%"></div></div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>ID</th><th>Mês</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead>
        <tbody id="receitasMeiBody"></tbody>
      </table>
    </div>`;
  const tbody = document.getElementById('receitasMeiBody');
  tbody.innerHTML = receitas.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma receita</td></tr>' :
    receitas.map(r => `<tr>
      <td>${r.id}</td><td>${r.mes || '-'}</td><td>${r.descricao || '-'}</td><td>${formatCurrency(r.valor || 0)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editReceitaMei(${r.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteReceitaMei(${r.id})">🗑️</button>
      </td>
    </tr>`).join('');
}

function openReceitaMeiModal(rec) {
  const isEdit = !!rec;
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const mesOpts = meses.map(m => `<option value="${m}" ${rec && rec.mes === m ? 'selected' : ''}>${m}</option>`).join('');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Receita MEI' : 'Nova Receita MEI';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Mês</label><select class="form-control" id="rmMes">${mesOpts}</select></div>
      <div class="form-group"><label>Valor</label><input type="number" class="form-control" id="rmValor" value="${rec ? rec.valor || '' : ''}" step="0.01"></div>
    </div>
    <div class="form-group"><label>Descrição</label><input type="text" class="form-control" id="rmDesc" value="${rec ? rec.descricao || '' : ''}"></div>`;
  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveReceitaMei(${isEdit ? rec.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveReceitaMei(id) {
  const obj = { mes: document.getElementById('rmMes').value, valor: parseFloat(document.getElementById('rmValor').value) || 0, descricao: document.getElementById('rmDesc').value };
  if (!appData.receitasMei) appData.receitasMei = [];
  if (id) { const idx = appData.receitasMei.findIndex(r => r.id === id); if (idx > -1) { obj.id = id; appData.receitasMei[idx] = obj; } }
  else { obj.id = nextId(appData.receitasMei); appData.receitasMei.push(obj); }
  saveData(); closeCadastroModal(); renderReceitasMeiPage(); showToast(id ? 'Receita atualizada!' : 'Receita cadastrada!', 'success');
}

function editReceitaMei(id) { const r = (appData.receitasMei || []).find(x => x.id === id); if (r) openReceitaMeiModal(r); }
function deleteReceitaMei(id) { if (!confirm('Excluir receita?')) return; appData.receitasMei = (appData.receitasMei || []).filter(r => r.id !== id); saveData(); renderReceitasMeiPage(); showToast('Receita excluída!','success'); }

// ============================================================
// CONFIGURAÇÕES (com Categorias de Fluxo)
// ============================================================
function renderConfiguracoesPage() {
  const pg = document.getElementById('page-configuracoes');
  const cats = appData.categoriasFluxo || [];

  pg.innerHTML = `
    <div class="page-header"><h2>⚙️ Configurações</h2></div>

    <!-- EMPRESA -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Empresa</div>
      <div class="form-row">
        <div class="form-group"><label>Nome</label><input type="text" class="form-control" id="cfgNome" value="${appData.empresa.nome}"></div>
        <div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="${appData.empresa.cnpj}"></div>
      </div>
      <div class="form-group"><label>Logo (URL)</label><input type="text" class="form-control" id="cfgLogo" value="${appData.empresa.logo || ''}"></div>
      <button class="btn btn-primary" onclick="saveConfigEmpresa()">Salvar Empresa</button>
    </div>

    <!-- VENDEDORES -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Vendedores</div>
      <div id="cfgVendedoresList" style="margin-bottom:12px">
        ${(appData.vendedores || []).map((v, i) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <input type="text" class="form-control" value="${v}" onchange="appData.vendedores[${i}]=this.value" style="flex:1">
            <button class="btn btn-sm btn-danger" onclick="removeVendedor(${i})">🗑️</button>
          </div>`).join('')}
      </div>
      <button class="btn btn-sm btn-secondary" onclick="addVendedor()">+ Adicionar Vendedor</button>
      <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="saveConfigVendedores()">Salvar</button>
    </div>

    <!-- FORMAS DE PAGAMENTO -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Formas de Pagamento</div>
      <div id="cfgPgtoList" style="margin-bottom:12px">
        ${(appData.formasPagamento || []).map((f, i) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <input type="text" class="form-control" value="${f}" onchange="appData.formasPagamento[${i}]=this.value" style="flex:1">
            <button class="btn btn-sm btn-danger" onclick="removeFormaPgto(${i})">🗑️</button>
          </div>`).join('')}
      </div>
      <button class="btn btn-sm btn-secondary" onclick="addFormaPgto()">+ Adicionar</button>
      <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="saveConfigPgto()">Salvar</button>
    </div>

    <!-- CATEGORIAS DE FLUXO DE CAIXA -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Categorias de Fluxo de Caixa</div>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px">
        Cada categoria é do tipo <strong style="color:var(--success)">Entrada</strong> ou <strong style="color:var(--danger)">Saída</strong>. 
        Ao criar um lançamento no Fluxo de Caixa, você escolherá o tipo e depois a categoria.
      </p>
      <div id="cfgCatFluxoList" style="margin-bottom:12px">
        ${cats.map((c, i) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <input type="text" class="form-control" value="${c.nome}" onchange="appData.categoriasFluxo[${i}].nome=this.value" style="flex:1">
            <select class="form-control" style="width:120px" onchange="appData.categoriasFluxo[${i}].tipo=this.value">
              <option value="entrada" ${c.tipo === 'entrada' ? 'selected' : ''}>Entrada</option>
              <option value="saida" ${c.tipo === 'saida' ? 'selected' : ''}>Saída</option>
            </select>
            <button class="btn btn-sm btn-danger" onclick="removeCatFluxo(${i})">🗑️</button>
          </div>`).join('')}
      </div>
      <button class="btn btn-sm btn-secondary" onclick="addCatFluxo()">+ Adicionar Categoria</button>
      <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="saveConfigCatFluxo()">Salvar</button>
    </div>

    <!-- TIPOS DE UNIDADE -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Tipos de Unidade</div>
      <div id="cfgUnidList" style="margin-bottom:12px">
        ${(appData.tipoUnidade || []).map((u, i) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <input type="text" class="form-control" value="${u}" onchange="appData.tipoUnidade[${i}]=this.value" style="flex:1">
            <button class="btn btn-sm btn-danger" onclick="removeUnidade(${i})">🗑️</button>
          </div>`).join('')}
      </div>
      <button class="btn btn-sm btn-secondary" onclick="addUnidade()">+ Adicionar</button>
      <button class="btn btn-sm btn-primary" style="margin-left:8px" onclick="saveConfigUnid()">Salvar</button>
    </div>
  `;
}

// --- Config helpers ---
function saveConfigEmpresa() {
  appData.empresa.nome = document.getElementById('cfgNome').value;
  appData.empresa.cnpj = document.getElementById('cfgCnpj').value;
  appData.empresa.logo = document.getElementById('cfgLogo').value;
  saveData();
  // Atualizar sidebar
  document.querySelector('.sidebar-header h1').textContent = appData.empresa.nome.toUpperCase();
  document.querySelector('.sidebar-header p').textContent = 'CNPJ: ' + appData.empresa.cnpj;
  if (appData.empresa.logo) {
    const logoEl = document.getElementById('sidebarLogo');
    logoEl.src = appData.empresa.logo;
    logoEl.style.display = 'block';
  }
  showToast('Empresa atualizada!', 'success');
}

function addVendedor() { appData.vendedores.push(''); renderConfiguracoesPage(); }
function removeVendedor(i) { appData.vendedores.splice(i, 1); renderConfiguracoesPage(); }
function saveConfigVendedores() { saveData(); showToast('Vendedores salvos!', 'success'); }

function addFormaPgto() { appData.formasPagamento.push(''); renderConfiguracoesPage(); }
function removeFormaPgto(i) { appData.formasPagamento.splice(i, 1); renderConfiguracoesPage(); }
function saveConfigPgto() { saveData(); showToast('Formas de pagamento salvas!', 'success'); }

function addCatFluxo() {
  if (!appData.categoriasFluxo) appData.categoriasFluxo = [];
  appData.categoriasFluxo.push({ nome: '', tipo: 'entrada' });
  renderConfiguracoesPage();
}
function removeCatFluxo(i) {
  appData.categoriasFluxo.splice(i, 1);
  renderConfiguracoesPage();
}
function saveConfigCatFluxo() {
  // Remove categorias sem nome
  appData.categoriasFluxo = (appData.categoriasFluxo || []).filter(c => c.nome.trim() !== '');
  saveData();
  showToast('Categorias de fluxo salvas!', 'success');
  renderConfiguracoesPage();
}

function addUnidade() { appData.tipoUnidade.push(''); renderConfiguracoesPage(); }
function removeUnidade(i) { appData.tipoUnidade.splice(i, 1); renderConfiguracoesPage(); }
function saveConfigUnid() { saveData(); showToast('Unidades salvas!', 'success'); }

// ============================================================
// BACKUP
// ============================================================
function renderBackupPage() {
  const pg = document.getElementById('page-backup');
  pg.innerHTML = `
    <div class="page-header"><h2>💾 Backup</h2></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="card">
        <div class="section-title">Exportar Backup</div>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">Gera um arquivo JSON com todos os dados do sistema.</p>
        <button class="btn btn-primary" onclick="exportBackup()">📥 Exportar JSON</button>
      </div>
      <div class="card">
        <div class="section-title">Importar Backup</div>
        <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">Importa um arquivo JSON previamente exportado. <strong style="color:var(--danger)">Atenção: substituirá todos os dados atuais.</strong></p>
        <input type="file" id="backupFileInput" accept=".json" style="display:none" onchange="importBackup(event)">
        <button class="btn btn-warning" onclick="document.getElementById('backupFileInput').click()">📤 Importar JSON</button>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="section-title">Supabase</div>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">
        Seus dados são salvos automaticamente no Supabase. Status da conexão:
      </p>
      <div id="supabaseStatus" style="padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm);font-size:0.85rem;">
        Verificando...
      </div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary" onclick="forceSyncToSupabase()">⬆️ Forçar Upload</button>
        <button class="btn btn-secondary" onclick="forceLoadFromSupabase()">⬇️ Forçar Download</button>
      </div>
    </div>`;
  checkSupabaseStatus();
}

function exportBackup() {
  const json = JSON.stringify(appData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wdmaquinas_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exportado!', 'success');
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!confirm('Importar backup irá SUBSTITUIR todos os dados atuais. Deseja continuar?')) {
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      // Merge with defaults to ensure all keys exist
      const defaults = getDefaultData();
      appData = { ...defaults, ...imported };
      // Ensure categoriasFluxo exists
      if (!appData.categoriasFluxo) appData.categoriasFluxo = defaults.categoriasFluxo;
      saveData();
      showToast('Backup importado com sucesso!', 'success');
      navigateTo('dashboard');
    } catch (err) {
      showToast('Erro ao importar: arquivo inválido', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

async function checkSupabaseStatus() {
  const statusEl = document.getElementById('supabaseStatus');
  if (!statusEl) return;
  try {
    const { data, error } = await supabase.from('wdmaquinas_data').select('id').limit(1);
    if (error) throw error;
    statusEl.innerHTML = `<span style="color:var(--success)">✅ Conectado ao Supabase</span> — Dados sincronizados.`;
  } catch (err) {
    statusEl.innerHTML = `<span style="color:var(--danger)">❌ Erro de conexão:</span> ${err.message}`;
  }
}

async function forceSyncToSupabase() {
  try {
    showToast('Enviando dados ao Supabase...', 'success');
    await saveData();
    showToast('Upload concluído!', 'success');
  } catch (err) {
    showToast('Erro no upload: ' + err.message, 'error');
  }
}

async function forceLoadFromSupabase() {
  try {
    showToast('Baixando dados do Supabase...', 'success');
    await loadData();
    navigateTo('dashboard');
    showToast('Download concluído!', 'success');
  } catch (err) {
    showToast('Erro no download: ' + err.message, 'error');
  }
}

// ==========================================
// WD MÁQUINAS — script.js — PARTE 5 (FINAL)
// Navegação, Inicialização, Modal helpers,
// Compras CRUD, Dashboard
// ==========================================

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
    <div class="page-header">
      <h2>🛒 Compras</h2>
      <button class="btn btn-primary" onclick="openCompraModal()">+ Nova Compra</button>
    </div>
    <div class="dashboard-grid">
      <div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">${formatCurrency(totalCompras)}</div></div>
      <div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">${formatCurrency(totalPago)}</div></div>
      <div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">${formatCurrency(totalDevendo)}</div></div>
      <div class="card"><div class="card-header"><span>Qtd Compras</span></div><div class="card-value">${compras.length}</div></div>
    </div>
    <div class="filter-bar">
      <input type="text" class="form-control" style="max-width:250px" placeholder="Buscar compra..." oninput="filterCompras(this.value)">
      <select class="form-control" style="max-width:160px" onchange="filterComprasSit(this.value)">
        <option value="">Todas situações</option>
        ${(appData.situacaoCompra||[]).map(s=>`<option value="${s}">${s}</option>`).join('')}
      </select>
      <select class="form-control" style="max-width:160px" onchange="filterComprasEntrega(this.value)">
        <option value="">Todas entregas</option>
        ${(appData.situacaoEntrega||[]).map(s=>`<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>
    <div class="table-responsive">
      <table class="table" id="comprasTable">
        <thead><tr>
          <th>ID</th><th>Data</th><th>Produto</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th><th>Fornecedor</th><th>Pagamento</th><th>Situação</th><th>Entrega</th><th>Ações</th>
        </tr></thead>
        <tbody id="comprasBody"></tbody>
      </table>
    </div>`;
  renderComprasTable(compras);
}

function renderComprasTable(compras) {
  const tbody = document.getElementById('comprasBody');
  if (!tbody) return;
  tbody.innerHTML = compras.length === 0 ? '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma compra</td></tr>' :
    compras.map(c => {
      const sitBadge = c.situacao === 'Pago' ? 'badge-success' : c.situacao === 'Devendo' ? 'badge-danger' : 'badge-warning';
      const entBadge = c.entrega === 'Entregue OK' ? 'badge-success' : c.entrega === 'Pendente' ? 'badge-warning' : 'badge-danger';
      return `<tr>
        <td>${c.id}</td>
        <td>${formatDate(c.data)}</td>
        <td>${c.produto}</td>
        <td>${c.quantidade}</td>
        <td>${formatCurrency(c.valorUnit)}</td>
        <td>${formatCurrency(c.quantidade * c.valorUnit)}</td>
        <td>${c.fornecedor}</td>
        <td>${c.formaPagamento}</td>
        <td><span class="badge ${sitBadge}">${c.situacao}</span></td>
        <td><span class="badge ${entBadge}">${c.entrega}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="viewCompra(${c.id})">👁️</button>
          <button class="btn btn-sm btn-primary" onclick="editCompra(${c.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCompra(${c.id})">🗑️</button>
        </td>
      </tr>`;
    }).join('');
}

function filterCompras(q) {
  q = q.toLowerCase();
  const filtered = (appData.compras || []).filter(c =>
    c.produto.toLowerCase().includes(q) || c.fornecedor.toLowerCase().includes(q) || String(c.id).includes(q)
  );
  renderComprasTable(filtered);
}

function filterComprasSit(sit) {
  renderComprasTable(sit ? (appData.compras || []).filter(c => c.situacao === sit) : (appData.compras || []));
}

function filterComprasEntrega(ent) {
  renderComprasTable(ent ? (appData.compras || []).filter(c => c.entrega === ent) : (appData.compras || []));
}

function openCompraModal(compra) {
  const isEdit = !!compra;
  const fornOpts = (appData.fornecedores || []).map(f => `<option value="${f.nome}" ${compra && compra.fornecedor === f.nome ? 'selected' : ''}>${f.nome}</option>`).join('');
  const pgtoOpts = (appData.formasPagamento || []).map(f => `<option value="${f}" ${compra && compra.formaPagamento === f ? 'selected' : ''}>${f}</option>`).join('');
  const sitOpts = (appData.situacaoCompra || []).map(s => `<option value="${s}" ${compra && compra.situacao === s ? 'selected' : ''}>${s}</option>`).join('');
  const entOpts = (appData.situacaoEntrega || []).map(s => `<option value="${s}" ${compra && compra.entrega === s ? 'selected' : ''}>${s}</option>`).join('');

  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Compra' : 'Nova Compra';
  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Data</label><input type="date" class="form-control" id="cpData" value="${compra ? compra.data : new Date().toISOString().split('T')[0]}"></div>
      <div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="cpVenc" value="${compra ? compra.vencimento || '' : ''}"></div>
    </div>
    <div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="cpProduto" value="${compra ? compra.produto : ''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Quantidade</label><input type="number" class="form-control" id="cpQtd" value="${compra ? compra.quantidade : 1}" min="1"></div>
      <div class="form-group"><label>Valor Unitário</label><input type="number" class="form-control" id="cpValorUnit" value="${compra ? compra.valorUnit : ''}" step="0.01"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Fornecedor</label><select class="form-control" id="cpForn"><option value="">Selecione...</option>${fornOpts}</select></div>
      <div class="form-group"><label>Forma Pagamento</label><select class="form-control" id="cpPgto">${pgtoOpts}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Situação</label><select class="form-control" id="cpSit">${sitOpts}</select></div>
      <div class="form-group"><label>Entrega</label><select class="form-control" id="cpEnt">${entOpts}</select></div>
    </div>
    <div class="form-group"><label>Observações</label><textarea class="form-control" id="cpObs" rows="2">${compra ? compra.obs || '' : ''}</textarea></div>`;

  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveCompra(${isEdit ? compra.id : 'null'})">Salvar</button>`;
  openCadastroModal();
}

function saveCompra(id) {
  const obj = {
    data: document.getElementById('cpData').value,
    vencimento: document.getElementById('cpVenc').value,
    produto: document.getElementById('cpProduto').value.trim(),
    quantidade: parseFloat(document.getElementById('cpQtd').value) || 1,
    valorUnit: parseFloat(document.getElementById('cpValorUnit').value) || 0,
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
  saveData();
  closeCadastroModal();
  renderComprasPage();
  showToast(id ? 'Compra atualizada!' : 'Compra cadastrada!', 'success');
}

function editCompra(id) {
  const c = (appData.compras || []).find(x => x.id === id);
  if (c) openCompraModal(c);
}

function viewCompra(id) {
  const c = (appData.compras || []).find(x => x.id === id);
  if (!c) return;
  document.getElementById('viewModalTitle').textContent = `Compra #${c.id}`;
  document.getElementById('viewModalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">Data</span>${formatDate(c.data)}</div>
      <div class="detail-item"><span class="detail-label">Vencimento</span>${formatDate(c.vencimento)}</div>
      <div class="detail-item"><span class="detail-label">Produto</span>${c.produto}</div>
      <div class="detail-item"><span class="detail-label">Quantidade</span>${c.quantidade}</div>
      <div class="detail-item"><span class="detail-label">Valor Unit.</span>${formatCurrency(c.valorUnit)}</div>
      <div class="detail-item"><span class="detail-label">Total</span>${formatCurrency(c.quantidade * c.valorUnit)}</div>
      <div class="detail-item"><span class="detail-label">Fornecedor</span>${c.fornecedor}</div>
      <div class="detail-item"><span class="detail-label">Forma Pgto</span>${c.formaPagamento}</div>
      <div class="detail-item"><span class="detail-label">Situação</span><span class="badge ${c.situacao === 'Pago' ? 'badge-success' : 'badge-danger'}">${c.situacao}</span></div>
      <div class="detail-item"><span class="detail-label">Entrega</span><span class="badge ${c.entrega === 'Entregue OK' ? 'badge-success' : 'badge-warning'}">${c.entrega}</span></div>
    </div>
    ${c.obs ? `<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> ${c.obs}</div>` : ''}`;
  openViewModal();
}

function deleteCompra(id) {
  if (!confirm('Excluir esta compra?')) return;
  appData.compras = (appData.compras || []).filter(c => c.id !== id);
  saveData();
  renderComprasPage();
  showToast('Compra excluída!', 'success');
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const compras = appData.compras || [];
  const vendas = appData.vendas || [];
  const clientes = appData.clientes || [];
  const fornecedores = appData.fornecedores || [];
  const boletos = appData.boletos || [];
  const totalCompras = compras.reduce((s, c) => s + (c.quantidade * c.valorUnit), 0);
  const totalVendas = vendas.reduce((s, v) => s + (v.quantidade * v.valorUnit), 0);
  const lucro = totalVendas - totalCompras;
  const boletosPendentes = boletos.filter(b => b.situacao !== 'Pago').length;

  // Caixa atual acumulado
  const mesesKeys = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  let caixaAcumulado = 0;
  mesesKeys.forEach(mes => {
    const fc = (appData.fluxoCaixa || {})[mes];
    if (fc && fc.lancamentos) {
      fc.lancamentos.forEach(l => {
        if (l.tipo === 'entrada') caixaAcumulado += (l.valor || 0);
        else caixaAcumulado -= (l.valor || 0);
      });
    }
  });

  const dashEl = document.getElementById('dashboardCards');
  dashEl.innerHTML = `
    <div class="dashboard-grid">
      <div class="card card-accent">
        <div class="card-header"><span>💰 Caixa Atual</span></div>
        <div class="card-value ${caixaAcumulado >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(caixaAcumulado)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span>🛒 Total Compras</span></div>
        <div class="card-value text-danger">${formatCurrency(totalCompras)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span>💰 Total Vendas</span></div>
        <div class="card-value text-success">${formatCurrency(totalVendas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span>📊 Lucro Bruto</span></div>
        <div class="card-value ${lucro >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(lucro)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span>👥 Clientes</span></div>
        <div class="card-value">${clientes.length}</div>
      </div>
      <div class="card">
        <div class="card-header"><span>🏭 Fornecedores</span></div>
        <div class="card-value">${fornecedores.length}</div>
      </div>
      <div class="card">
        <div class="card-header"><span>🔖 Boletos Pendentes</span></div>
        <div class="card-value text-warning">${boletosPendentes}</div>
      </div>
      <div class="card">
        <div class="card-header"><span>📦 Compras Pendentes</span></div>
        <div class="card-value text-warning">${compras.filter(c => c.entrega === 'Pendente').length}</div>
      </div>
    </div>

    <!-- ÚLTIMAS VENDAS -->
    <div class="card" style="margin-top:16px">
      <div class="section-title">Últimas Vendas</div>
      <div class="table-responsive" style="border:none">
        <table class="table">
          <thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Total</th><th>Situação</th></tr></thead>
          <tbody>
            ${vendas.slice(-5).reverse().map(v => `<tr>
              <td>${formatDate(v.data)}</td><td>${v.cliente}</td><td>${v.produto}</td>
              <td>${formatCurrency(v.quantidade * v.valorUnit)}</td>
              <td><span class="badge ${v.situacao === 'Pago' ? 'badge-success' : 'badge-danger'}">${v.situacao}</span></td>
            </tr>`).join('')}
            ${vendas.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma venda</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ÚLTIMAS COMPRAS -->
    <div class="card" style="margin-top:16px">
      <div class="section-title">Últimas Compras</div>
      <div class="table-responsive" style="border:none">
        <table class="table">
          <thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Total</th><th>Situação</th></tr></thead>
          <tbody>
            ${compras.slice(-5).reverse().map(c => `<tr>
              <td>${formatDate(c.data)}</td><td>${c.produto}</td><td>${c.fornecedor}</td>
              <td>${formatCurrency(c.quantidade * c.valorUnit)}</td>
              <td><span class="badge ${c.situacao === 'Pago' ? 'badge-success' : 'badge-danger'}">${c.situacao}</span></td>
            </tr>`).join('')}
            ${compras.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma compra</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openCadastroModal() {
  const modal = document.getElementById('cadastroModal');
  modal.style.display = 'flex';
  // Prevenir fechar ao arrastar mouse para fora
  modal.onmousedown = function(e) {
    // Só fechar se clicar exatamente no overlay (não ao arrastar)
    if (e.target === modal && e.detail === 1) {
      // Não fazer nada — modal só fecha com botão Cancelar/Fechar
    }
  };
}

function closeCadastroModal() {
  document.getElementById('cadastroModal').style.display = 'none';
}

function openViewModal() {
  const modal = document.getElementById('viewModal');
  modal.style.display = 'flex';
  modal.onmousedown = function(e) {
    // Não fechar ao clicar fora
  };
}

function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
}

// ============================================================
// FORMAT HELPERS
// ============================================================
function formatCurrency(val) {
  return 'R$ ' + (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '-';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
const mesesNav = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const pageTitles = {
  dashboard: 'Dashboard',
  janeiro: 'Fluxo de Caixa — Janeiro',
  fevereiro: 'Fluxo de Caixa — Fevereiro',
  marco: 'Fluxo de Caixa — Março',
  abril: 'Fluxo de Caixa — Abril',
  maio: 'Fluxo de Caixa — Maio',
  junho: 'Fluxo de Caixa — Junho',
  julho: 'Fluxo de Caixa — Julho',
  agosto: 'Fluxo de Caixa — Agosto',
  setembro: 'Fluxo de Caixa — Setembro',
  outubro: 'Fluxo de Caixa — Outubro',
  novembro: 'Fluxo de Caixa — Novembro',
  dezembro: 'Fluxo de Caixa — Dezembro',
  compras: 'Compras',
  vendas: 'Vendas',
  estoque: 'Estoque',
  produtos: 'Produtos',
  clientes: 'Clientes',
  fornecedores: 'Fornecedores',
  pfornecedores: 'Produtos de Fornecedores',
  boletos: 'Boletos',
  cheques: 'Cheques',
  prestacoes: 'Prestações',
  projetos: 'Projetos',
  pagclientes: 'Pagamentos de Clientes',
  garantias: 'Garantias',
  relatorios: 'Relatórios',
  notasentrada: 'Notas de Entrada',
  notassaida: 'Notas de Saída',
  receitasmei: 'Receitas MEI',
  configuracoes: 'Configurações',
  backup: 'Backup'
};

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');

  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) target.style.display = 'block';

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => {
    const onclick = n.getAttribute('onclick') || '';
    if (onclick.includes(`'${page}'`)) n.classList.add('active');
  });

  // Update title
  document.getElementById('pageTitle').textContent = pageTitles[page] || page;

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');

  // Render page content
  const mesIdx = mesesNav.indexOf(page);
  if (mesIdx > -1) {
    renderFluxoMes(page, mesesNomes[mesIdx], mesIdx);
  } else {
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
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast ' + (type || 'success');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================
// SUPABASE — CONEXÃO + LOAD/SAVE
// ============================================================
const SUPABASE_URL = 'https://iwbsmsadctvndhrcjkbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GQpRJ7CFZOFrdmYfsN8rcA_ucfNR2AM';

// Inicialização do Supabase Client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

let appData = {};

async function loadData() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('wdmaquinas_data')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && data.payload) {
        appData = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
        // Garantir categorias de fluxo
        if (!appData.categoriasFluxo) {
          appData.categoriasFluxo = getDefaultData().categoriasFluxo;
        }
        console.log('✅ Dados carregados do Supabase');
        return;
      }
    }
  } catch (err) {
    console.warn('⚠️ Falha ao carregar do Supabase, tentando localStorage:', err.message);
  }

  // Fallback: localStorage
  try {
    const local = localStorage.getItem('wdmaquinas_data');
    if (local) {
      appData = JSON.parse(local);
      if (!appData.categoriasFluxo) {
        appData.categoriasFluxo = getDefaultData().categoriasFluxo;
      }
      console.log('✅ Dados carregados do localStorage');
      return;
    }
  } catch (e) {
    console.warn('⚠️ localStorage falhou');
  }

  // Fallback: dados padrão
  appData = getDefaultData();
  console.log('✅ Dados padrão carregados');
}

async function saveData() {
  // Salvar no localStorage sempre (backup local)
  try {
    localStorage.setItem('wdmaquinas_data', JSON.stringify(appData));
  } catch (e) {
    console.warn('localStorage save failed');
  }

  // Salvar no Supabase
  if (supabase) {
    try {
      const { error } = await supabase
        .from('wdmaquinas_data')
        .upsert({
          id: 1,
          payload: appData,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      console.log('✅ Dados salvos no Supabase');
    } catch (err) {
      console.warn('⚠️ Erro ao salvar no Supabase:', err.message);
    }
  }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function init() {
  // Mostrar data atual
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('currentDate').textContent = dateStr;

  // Carregar dados
  await loadData();

  // Atualizar sidebar com dados da empresa
  if (appData.empresa) {
    document.querySelector('.sidebar-header h1').textContent = appData.empresa.nome.toUpperCase();
    document.querySelector('.sidebar-header p').textContent = 'CNPJ: ' + appData.empresa.cnpj;
    if (appData.empresa.logo) {
      const logoEl = document.getElementById('sidebarLogo');
      logoEl.src = appData.empresa.logo;
      logoEl.style.display = 'block';
    }
  }

  // Renderizar dashboard
  renderDashboard();
}

// Aguardar o Supabase JS carregar e iniciar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
