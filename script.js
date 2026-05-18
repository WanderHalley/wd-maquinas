// ╔══════════════════════════════════════════════════════════════╗
// ║  WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026              ║
// ║  script.js — CÓDIGO COMPLETO v16                           ║
// ║  Receitas MEI formato oficial (I a X) + Relatórios completos║
// ╚══════════════════════════════════════════════════════════════╝

// ── CONFIGURAÇÃO GLOBAL ──
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
let fluxoFilterText = '';
let fluxoFilterTipo = '';

// ── HISTÓRICO UNDO/REDO ──
var undoHistory = [];
var redoHistory = [];
var undoMaxSteps = 10;
var undoSaving = false;
var backupSubTab = 'autosave';

// ── HELPERS ──
function nextId(arr) { if (!arr || arr.length === 0) return 1; return Math.max(...arr.map(function(i){ return i.id||0; }))+1; }
function formatCurrency(val) { return 'R$ '+(val||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function formatDate(d) { if(!d) return '-'; var p=d.split('-'); if(p.length===3) return p[2]+'/'+p[1]+'/'+p[0]; return d; }
function todayStr() { return new Date().toISOString().split('T')[0]; }

function calcDiasRestantes(dataVenc) {
  if (!dataVenc) return null;
  var hoje=new Date(); hoje.setHours(0,0,0,0);
  var venc=new Date(dataVenc+'T00:00:00');
  return Math.ceil((venc.getTime()-hoje.getTime())/(1000*60*60*24));
}
function formatDiasRestantes(dias,situacao) {
  if (situacao==='Pago'||situacao==='Compensado') return '<span style="color:var(--success);font-weight:600">—</span>';
  if (dias===null) return '-';
  if (dias<0) return '<span style="color:#e53e3e;font-weight:700">Vencido</span>';
  if (dias===0) return '<span style="color:#e53e3e;font-weight:700">Vence hoje</span>';
  if (dias<=7) return '<span style="color:#dd6b20;font-weight:600">'+dias+' dia'+(dias>1?'s':'')+'</span>';
  return '<span style="color:var(--text-muted)">'+dias+' dias</span>';
}

function calcDiasGarantia(dataFim) {
  if (!dataFim) return null;
  var hoje=new Date(); hoje.setHours(0,0,0,0);
  var dt=new Date(dataFim+'T00:00:00'); dt.setHours(0,0,0,0);
  return Math.ceil((dt.getTime()-hoje.getTime())/(1000*60*60*24));
}
function formatDiasGarantia(dias,situacao) {
  if (situacao==='Perdeu a Garantia') return '<span style="color:#e53e3e;font-weight:600">—</span>';
  if (dias===null) return '-';
  if (dias<=0) return '<span style="color:#e53e3e;font-weight:700">Expirada</span>';
  if (dias<=30) return '<span style="color:#dd6b20;font-weight:600">'+dias+' dia'+(dias>1?'s':'')+'</span>';
  return '<span style="color:var(--text-muted)">'+dias+' dia'+(dias>1?'s':'')+'</span>';
}
function getGarantiaSituacaoAuto(dataFim,situacaoManual) {
  if (situacaoManual==='Perdeu a Garantia') return 'Perdeu a Garantia';
  var dias=calcDiasGarantia(dataFim);
  if (dias===null) return 'Ativa';
  if (dias<=0) return 'Vencida';
  return 'Ativa';
}
function situacaoBadge(sit) {
  if (!sit) return '<span style="color:var(--text-muted)">-</span>';
  var s=sit.toLowerCase();
  if (s==='pago'||s==='compensado'||s==='entregue ok'||s==='ativa'||s==='concluído') return '<span style="color:#38a169;font-weight:600">'+sit+'</span>';
  if (s==='vencido'||s==='vencida'||s==='devendo'||s==='devolvido'||s==='cancelado'||s==='expirada'||s==='perdeu a garantia'||s==='entregue com defeito'||s==='não entregue') return '<span style="color:#e53e3e;font-weight:600">'+sit+'</span>';
  if (s==='pendente'||s==='parcial'||s==='guardado'||s==='depositado'||s==='em mãos'||s==='repassado'||s==='em andamento') return '<span style="color:#dd6b20;font-weight:600">'+sit+'</span>';
  return '<span style="font-weight:600">'+sit+'</span>';
}

// ── MÁSCARAS ──
function maskCPF(v){v=v.replace(/\D/g,'').substring(0,11);v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');return v;}
function maskCNPJ(v){v=v.replace(/\D/g,'').substring(0,14);v=v.replace(/^(\d{2})(\d)/,'$1.$2');v=v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3');v=v.replace(/\.(\d{3})(\d)/,'.$1/$2');v=v.replace(/(\d{4})(\d)/,'$1-$2');return v;}
function maskCPFouCNPJ(v){var d=v.replace(/\D/g,'');if(d.length<=11) return maskCPF(v);return maskCNPJ(v);}
function maskTelefone(v){v=v.replace(/\D/g,'').substring(0,11);if(v.length<=10){v=v.replace(/(\d{2})(\d)/,'($1) $2');v=v.replace(/(\d{4})(\d)/,'$1-$2');}else{v=v.replace(/(\d{2})(\d)/,'($1) $2');v=v.replace(/(\d{5})(\d)/,'$1-$2');}return v;}
function applyMask(inputId,maskFn){var el=document.getElementById(inputId);if(!el)return;el.addEventListener('input',function(){var pos=el.selectionStart;var oldLen=el.value.length;el.value=maskFn(el.value);var newLen=el.value.length;el.setSelectionRange(pos+(newLen-oldLen),pos+(newLen-oldLen));});}
function applyAllMasks(){setTimeout(function(){applyMask('clTelefone',maskTelefone);applyMask('clCelular',maskTelefone);applyMask('clCpf',maskCPF);applyMask('clCnpj',maskCNPJ);applyMask('clCpfCnpj',maskCPFouCNPJ);applyMask('fnTelefone',maskTelefone);applyMask('fnCelular',maskTelefone);applyMask('fnCpf',maskCPF);applyMask('fnCnpj',maskCNPJ);applyMask('fnCpfCnpj',maskCPFouCNPJ);applyMask('cfgCnpj',maskCNPJ);applyMask('gen_cpfCnpj',maskCPFouCNPJ);applyMask('gen_telefone',maskTelefone);applyMask('gen_celular',maskTelefone);},100);}

// ── UPLOAD DE IMAGEM ──
function handleImageUpload(inputId,previewId){
  var input=document.getElementById(inputId);if(!input) return;
  input.addEventListener('change',function(){
    var file=input.files[0];if(!file)return;
    if(!file.type.startsWith('image/')){showToast('Selecione um arquivo de imagem (JPG, PNG, WEBP)','error');return;}
    if(file.size>2*1024*1024){showToast('Imagem muito grande! Máximo 2 MB.','error');return;}
    var reader=new FileReader();
    reader.onload=function(e){
      var prev=document.getElementById(previewId);
      if(prev) prev.innerHTML='<img src="'+e.target.result+'" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover">';
      input.setAttribute('data-base64',e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// ── DADOS PADRÃO ──
function getDefaultData(){
  return {
    empresa:{nome:"WD Máquinas",cnpj:"29.595.239/0001-33",logo:"",assinatura:"",empreendedor:"WANDER HALLEY LEE ALVES",cidade:"Franca, SP"},
    vendedores:["Wander","Daniel"],
    formasPagamento:["Boleto","Caixa da Oficina","Cartão de Crédito MP","Cartão de Crédito PagBank","Cartão de Débito MP","Cartão de Débito PagBank","Dinheiro","Link MP","Link PagBank","MP","PagBank","Pix"],
    formasPagamentoVendas:["Boleto","Cartão de Crédito MP","Cartão de Crédito PagBank","Cartão de Débito MP","Cartão de Débito PagBank","Dinheiro","Link MP","Link PagBank","MP","PagBank","Pix","Transferência"],
    tipoUnidade:["Unidade","Kg","Metro","Litro","Caixa","Pacote","Par","Jogo","Rolo","Barra","Chapa","Peça"],
    tipoVenda:["Direta","Revenda"],
    situacaoCompra:["Devendo","Guardado","Pago"],
    situacaoVenda:["Devendo","Pago","Parcial"],
    situacaoEntrega:["Entregue com Defeito","Entregue OK","Não Entregue","Pendente"],
    situacaoCheque:["Compensado","Depositado","Devolvido","Em Mãos","Repassado"],
    situacaoGarantia:["Ativa","Perdeu a Garantia","Vencida"],
    situacaoBoleto:["Pago","Pendente","Vencido"],
    categoriasFluxo:[
      {nome:"Salário",tipo:"entrada"},{nome:"Venda",tipo:"entrada"},{nome:"Serviço",tipo:"entrada"},
      {nome:"Outros (Entrada)",tipo:"entrada"},{nome:"Dinheiro em Notas",tipo:"entrada"},
      {nome:"Material",tipo:"saida"},{nome:"Combustível",tipo:"saida"},{nome:"Alimentação",tipo:"saida"},
      {nome:"Conta de Luz",tipo:"saida"},{nome:"Aluguel",tipo:"saida"},{nome:"Outros (Saída)",tipo:"saida"}
    ],
    clientes:[],fornecedores:[],produtos:[],pFornecedores:[],
    compras:[],vendas:[],estoque:[],
    boletos:[],cheques:[],prestacoes:[],projetos:[],
    pagClientes:[],garantias:[],
    notasEntrada:[],notasSaida:[],receitasMei:[],
    fluxoCaixa:{}
  };
}

// ── LOAD / SAVE ──
async function loadData(){
  if(supabaseClient){try{var r=await supabaseClient.from('wdmaquinas_data').select('*').eq('id',1).single();if(r.data&&r.data.payload){appData=typeof r.data.payload==='string'?JSON.parse(r.data.payload):r.data.payload;ensureDefaults();return;}}catch(e){console.warn('Supabase load falhou:',e.message);}}
  try{var local=localStorage.getItem('wdmaquinas_data');if(local){appData=JSON.parse(local);ensureDefaults();return;}}catch(e){}
  appData=getDefaultData();
}
async function saveData(){
  // Salva snapshot para undo (máx 10)
  if(!undoSaving){
    undoSaving=true;
    try{
      var snapshot=JSON.stringify(appData);
      // Evita duplicar se igual ao último
      if(undoHistory.length===0||undoHistory[undoHistory.length-1]!==snapshot){
        undoHistory.push(snapshot);
        if(undoHistory.length>undoMaxSteps) undoHistory.shift();
        redoHistory=[];// limpa redo ao fazer nova ação
      }
    }catch(e){}
    undoSaving=false;
  }
  try{localStorage.setItem('wdmaquinas_data',JSON.stringify(appData));}catch(e){}
  if(supabaseClient){try{await supabaseClient.from('wdmaquinas_data').upsert({id:1,payload:appData,updated_at:new Date().toISOString()});}catch(e){}}
  updateBackupBadge();
}
function updateBackupBadge(){
  var el=document.getElementById('undoCount');if(el) el.textContent=undoHistory.length;
  var el2=document.getElementById('redoCount');if(el2) el2.textContent=redoHistory.length;
}

function ensureDefaults(){
  var def=getDefaultData();
  Object.keys(def).forEach(function(k){if(appData[k]===undefined) appData[k]=def[k];});
  if(!appData.categoriasFluxo||appData.categoriasFluxo.length===0) appData.categoriasFluxo=def.categoriasFluxo;
  if(!appData.formasPagamentoVendas) appData.formasPagamentoVendas=def.formasPagamentoVendas;
  if(!appData.empresa.assinatura) appData.empresa.assinatura='';
  if(!appData.empresa.empreendedor) appData.empresa.empreendedor=def.empresa.empreendedor;
  if(!appData.empresa.cidade) appData.empresa.cidade=def.empresa.cidade;
}

// ── UI HELPERS ──
function showToast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='toast '+(type||'success');t.classList.add('show');setTimeout(function(){t.classList.remove('show');},3000);}
function openCadastroModal(){document.getElementById('cadastroModal').style.display='flex';}
function closeCadastroModal(){document.getElementById('cadastroModal').style.display='none';}
function openViewModal(){document.getElementById('viewModal').style.display='flex';}
function closeViewModal(){document.getElementById('viewModal').style.display='none';}

// ── SIDEBAR ──
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('collapsed');syncExpandBtn();}
function collapseSidebar(){document.getElementById('sidebar').classList.toggle('collapsed');syncExpandBtn();}
function syncExpandBtn(){var sb=document.getElementById('sidebar');var eb=document.getElementById('expandBtn');var ar=document.getElementById('collapseArrow');var c=sb.classList.contains('collapsed');if(eb)eb.style.display=c?'inline-flex':'none';if(ar)ar.textContent=c?'»':'«';}
function updateSidebarInfo(){
  var ne=document.getElementById('sidebarNome');var ce=document.getElementById('sidebarCnpj');
  if(ne&&appData.empresa) ne.textContent=appData.empresa.nome||'WD Máquinas';
  if(ce&&appData.empresa) ce.textContent='CNPJ: '+(appData.empresa.cnpj||'');
  var le=document.getElementById('sidebarLogo');
  if(le&&appData.empresa&&appData.empresa.logo){le.src=appData.empresa.logo;le.style.display='block';}
}

// ── NAVEGAÇÃO ──
var pageTitles={'dashboard':'Dashboard','janeiro':'Janeiro','fevereiro':'Fevereiro','marco':'Março','abril':'Abril','maio':'Maio','junho':'Junho','julho':'Julho','agosto':'Agosto','setembro':'Setembro','outubro':'Outubro','novembro':'Novembro','dezembro':'Dezembro','compras':'Compras','vendas':'Vendas','estoque':'Estoque','produtos':'Produtos','clientes':'Clientes','fornecedores':'Fornecedores','pfornecedores':'P. Fornecedores','boletos':'Boletos','cheques':'Cheques','prestacoes':'Prestações','projetos':'Projetos','pagclientes':'Pag. Clientes','garantias':'Garantias','relatorios':'Relatórios','notasentrada':'Notas Entrada','notassaida':'Notas Saída','receitasmei':'Receitas MEI','configuracoes':'Configurações','backup':'Backup'};

function navigateTo(page){
  document.querySelectorAll('.page-content').forEach(function(p){p.style.display='none';});
  var el=document.getElementById('page-'+page);if(el)el.style.display='block';
  var te=document.getElementById('pageTitle');if(te)te.textContent=pageTitles[page]||page;
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  var ni=document.querySelector('.nav-item[onclick*="'+page+'"]');if(ni)ni.classList.add('active');
  document.getElementById('sidebar').classList.remove('active');
  var meses=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var mi=meses.indexOf(page);
  if(page==='dashboard') renderDashboard();
  else if(mi>-1) renderFluxoMes(mi);
  else if(page==='compras') renderComprasPage();
  else if(page==='vendas') renderVendasPage();
  else if(page==='estoque') renderEstoquePage();
  else if(page==='produtos') renderProdutosPage();
  else if(page==='clientes') renderClientesPage();
  else if(page==='fornecedores') renderFornecedoresPage();
  else if(page==='pfornecedores') renderPFornecedoresPage();
  else if(page==='boletos') renderBoletosPage();
  else if(page==='cheques') renderChequesPage();
  else if(page==='prestacoes') renderPrestacoesPage();
  else if(page==='projetos') renderProjetosPage();
  else if(page==='pagclientes') renderPagClientesPage();
  else if(page==='garantias') renderGarantiasPage();
  else if(page==='relatorios') renderRelatoriosPage();
  else if(page==='notasentrada') renderNotasEntradaPage();
  else if(page==='notassaida') renderNotasSaidaPage();
  else if(page==='receitasmei') renderReceitasMeiPage();
  else if(page==='configuracoes') renderConfiguracoesPage();
  else if(page==='backup') renderBackupPage();
}

// ══════════════════════════════════════════════════════════════
// ── DASHBOARD ──
// ══════════════════════════════════════════════════════════════
function renderDashboard(){
  var pg=document.getElementById('page-dashboard');if(!pg)return;
  var compras=appData.compras||[];var vendas=appData.vendas||[];var boletos=appData.boletos||[];var cheques=appData.cheques||[];var prestacoes=appData.prestacoes||[];
  var totalCompras=compras.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
  var totalVendas=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var lucro=totalVendas-totalCompras;
  var totalPrestacoes=prestacoes.reduce(function(s,p){return s+(p.valor||0);},0);
  var chequesPend=cheques.filter(function(ch){return ch.situacao!=='Compensado';}).reduce(function(s,ch){return s+(ch.valor||0);},0);
  var chequesPendQtd=cheques.filter(function(ch){return ch.situacao!=='Compensado';}).length;
  var boletosPend=boletos.filter(function(b){return b.situacao!=='Pago';}).reduce(function(s,b){return s+(b.valor||0);},0);
  var boletosPendQtd=boletos.filter(function(b){return b.situacao!=='Pago';}).length;
  var meses=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var mesesLabel=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var salarioRows='';
  meses.forEach(function(m,i){
    var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[m])?appData.fluxoCaixa[m]:[];
    var sLancs=lancs.filter(function(l){return(l.categoria||'').toLowerCase().includes('salário')||(l.categoria||'').toLowerCase().includes('salario');});
    var sTotal=sLancs.reduce(function(s,l){return s+(l.valor||0);},0);
    var sW=sLancs.filter(function(l){return(l.descricao||'').toLowerCase().includes('wander');}).reduce(function(s,l){return s+(l.valor||0);},0);
    var sD=sLancs.filter(function(l){return(l.descricao||'').toLowerCase().includes('daniel');}).reduce(function(s,l){return s+(l.valor||0);},0);
    if(sTotal>0) salarioRows+='<tr><td>'+mesesLabel[i]+'</td><td>'+formatCurrency(sW)+'</td><td>'+formatCurrency(sD)+'</td><td>'+formatCurrency(sTotal)+'</td></tr>';
  });
  var fluxoResumo='';
  meses.forEach(function(m,i){
    var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[m])?appData.fluxoCaixa[m]:[];
    var ent=lancs.filter(function(l){return l.tipo==='entrada';}).reduce(function(s,l){return s+(l.valor||0);},0);
    var sai=lancs.filter(function(l){return l.tipo==='saida';}).reduce(function(s,l){return s+(l.valor||0);},0);
    var sal=ent-sai;var cor=sal>=0?'text-success':'text-danger';
    fluxoResumo+='<tr onclick="navigateTo(\''+m+'\')" style="cursor:pointer"><td>'+mesesLabel[i]+'</td><td class="text-success">'+formatCurrency(ent)+'</td><td class="text-danger">'+formatCurrency(sai)+'</td><td class="'+cor+'">'+formatCurrency(sal)+'</td></tr>';
  });
  var uVendas=vendas.slice(-5).reverse();var vRows='';
  if(uVendas.length===0){vRows='<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma venda</td></tr>';}
  else{uVendas.forEach(function(v){vRows+='<tr><td>'+formatDate(v.data)+'</td><td>'+(v.produto||'-')+'</td><td>'+formatCurrency((v.quantidade||1)*(v.valorUnit||0))+'</td><td>'+situacaoBadge(v.situacao)+'</td></tr>';});}
  var uCompras=compras.slice(-5).reverse();var cRows='';
  if(uCompras.length===0){cRows='<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhuma compra</td></tr>';}
  else{uCompras.forEach(function(c){cRows+='<tr><td>'+formatDate(c.data)+'</td><td>'+(c.produto||'-')+'</td><td>'+formatCurrency((c.quantidade||1)*(c.valorUnit||0))+'</td><td>'+situacaoBadge(c.situacao)+'</td></tr>';});}
  pg.innerHTML=
    '<div class="page-header"><h2>📊 Dashboard</h2></div>'+
    '<div class="dashboard-grid">'+
      '<div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">'+formatCurrency(totalCompras)+'</div><div class="card-sub">'+compras.length+' registros</div></div>'+
      '<div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">'+formatCurrency(totalVendas)+'</div><div class="card-sub">'+vendas.length+' registros</div></div>'+
      '<div class="card"><div class="card-header"><span>Lucro</span></div><div class="card-value '+(lucro>=0?'text-success':'text-danger')+'">'+formatCurrency(lucro)+'</div></div>'+
      '<div class="card"><div class="card-header"><span>💳 Total Prestações</span></div><div class="card-value text-info">'+formatCurrency(totalPrestacoes)+'</div><div class="card-sub">'+prestacoes.length+' prestação(ões)</div></div>'+
      '<div class="card" style="border-left:3px solid var(--warning)"><div class="card-header"><span>📝 Cheques Pendentes</span></div><div class="card-value text-warning">'+formatCurrency(chequesPend)+'</div><div class="card-sub">'+chequesPendQtd+' cheque(s)</div></div>'+
      '<div class="card" style="border-left:3px solid var(--danger)"><div class="card-header"><span>📄 Boletos Pendentes</span></div><div class="card-value text-danger">'+formatCurrency(boletosPend)+'</div><div class="card-sub">'+boletosPendQtd+' boleto(s)</div></div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">'+
      '<div class="card"><div class="card-header"><span>📈 Resumo Fluxo Mensal</span></div><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>'+fluxoResumo+'</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><span>💼 Salários por Mês</span></div><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Mês</th><th>Wander</th><th>Daniel</th><th>Total</th></tr></thead><tbody>'+(salarioRows||'<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum salário</td></tr>')+'</tbody></table></div></div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">'+
      '<div class="card"><div class="card-header"><span>🛒 Últimas Compras</span></div><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Data</th><th>Produto</th><th>Total</th><th>Sit.</th></tr></thead><tbody>'+cRows+'</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><span>💰 Últimas Vendas</span></div><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Data</th><th>Produto</th><th>Total</th><th>Sit.</th></tr></thead><tbody>'+vRows+'</tbody></table></div></div>'+
    '</div>';
}

// ══════════════════════════════════════════════════════════════
// ── FLUXO MENSAL ──
// ══════════════════════════════════════════════════════════════
var mesesKeys=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var mesesNomes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function renderFluxoMes(mesIdx){
  var pg=document.getElementById('page-'+mesesKeys[mesIdx]);if(!pg)return;
  var mesKey=mesesKeys[mesIdx];var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[mesKey])?appData.fluxoCaixa[mesKey]:[];
  var prevKey=mesIdx>0?mesesKeys[mesIdx-1]:null;var prevLancs=prevKey&&appData.fluxoCaixa?appData.fluxoCaixa[prevKey]||[]:[];
  var prevEnt=prevLancs.filter(function(l){return l.tipo==='entrada';}).reduce(function(s,l){return s+(l.valor||0);},0);
  var prevSai=prevLancs.filter(function(l){return l.tipo==='saida';}).reduce(function(s,l){return s+(l.valor||0);},0);
  var saldoAnterior=prevEnt-prevSai;
  var entradas=lancs.filter(function(l){return l.tipo==='entrada';}).reduce(function(s,l){return s+(l.valor||0);},0);
  var saidas=lancs.filter(function(l){return l.tipo==='saida';}).reduce(function(s,l){return s+(l.valor||0);},0);
  var saldoFinal=saldoAnterior+entradas-saidas;
  var dinhNotas=lancs.filter(function(l){return(l.categoria||'').toLowerCase().includes('dinheiro em notas');}).reduce(function(s,l){return s+(l.valor||0);},0);
  var salLancs=lancs.filter(function(l){return(l.categoria||'').toLowerCase().includes('salário')||(l.categoria||'').toLowerCase().includes('salario');});
  var totalSal=salLancs.reduce(function(s,l){return s+(l.valor||0);},0);
  var salW=salLancs.filter(function(l){return(l.descricao||'').toLowerCase().includes('wander');}).reduce(function(s,l){return s+(l.valor||0);},0);
  var salD=salLancs.filter(function(l){return(l.descricao||'').toLowerCase().includes('daniel');}).reduce(function(s,l){return s+(l.valor||0);},0);
  pg.innerHTML=
    '<div class="page-header"><h2>📅 '+mesesNomes[mesIdx]+' 2026</h2><button class="btn btn-primary" onclick="openLancamentoModal('+mesIdx+')">+ Novo Lançamento</button></div>'+
    '<div class="dashboard-grid">'+
      '<div class="card"><div class="card-header"><span>Saldo Anterior</span></div><div class="card-value '+(saldoAnterior>=0?'text-success':'text-danger')+'">'+formatCurrency(saldoAnterior)+'</div></div>'+
      '<div class="card"><div class="card-header"><span>Entradas</span></div><div class="card-value text-success">'+formatCurrency(entradas)+'</div></div>'+
      '<div class="card"><div class="card-header"><span>Saídas</span></div><div class="card-value text-danger">'+formatCurrency(saidas)+'</div></div>'+
      '<div class="card card-accent"><div class="card-header"><span>Saldo Final</span></div><div class="card-value '+(saldoFinal>=0?'text-success':'text-danger')+'">'+formatCurrency(saldoFinal)+'</div></div>'+
      '<div class="card"><div class="card-header"><span>💵 Dinheiro em Notas</span></div><div class="card-value">'+formatCurrency(dinhNotas)+'</div></div>'+
      '<div class="card"><div class="card-header"><span>💼 Total Salário</span></div><div class="card-value">'+formatCurrency(totalSal)+'</div><div class="card-sub">Wander: '+formatCurrency(salW)+' | Daniel: '+formatCurrency(salD)+'</div></div>'+
    '</div>'+
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="fluxoFilterText=this.value.toLowerCase();renderFluxoTable('+mesIdx+')"><select class="form-control" style="max-width:160px" onchange="fluxoFilterTipo=this.value;renderFluxoTable('+mesIdx+')"><option value="">Tipo (todos)</option><option value="entrada">Entrada</option><option value="saida">Saída</option></select></div>'+
    '<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="fluxoBody"></tbody></table></div>';
  fluxoFilterText='';fluxoFilterTipo='';renderFluxoTable(mesIdx);
}
ffunction renderFluxoTable(mesKey){
  var container=document.getElementById('fluxoTableBody');if(!container)return;
  var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[mesKey])?appData.fluxoCaixa[mesKey]:[];
  
  // Filtros
  var filtered=lancs.filter(function(l){
    if(fluxoFilterText){
      var txt=fluxoFilterText.toLowerCase();
      var desc=(l.descricao||'').toLowerCase();
      var cat=(l.categoria||'').toLowerCase();
      if(desc.indexOf(txt)===-1&&cat.indexOf(txt)===-1) return false;
    }
    if(fluxoFilterTipo&&fluxoFilterTipo!==''){
      if(l.tipo!==fluxoFilterTipo) return false;
    }
    return true;
  });

  if(filtered.length===0){
    container.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">Nenhum lançamento encontrado</td></tr>';
    return;
  }

  // Ordenar por data
  filtered.sort(function(a,b){return(a.data||'').localeCompare(b.data||'');});

  var rows='';
  filtered.forEach(function(l,i){
    var isEntrada=l.tipo==='entrada';
    var valorClass=isEntrada?'text-success':'text-danger';
    var tipoLabel=isEntrada?'<span style="color:var(--success);font-weight:600">Entrada</span>':'<span style="color:var(--danger);font-weight:600">Saída</span>';
    // Encontrar o índice real no array original para editar/excluir
    var realIdx=lancs.indexOf(l);
    rows+='<tr>'+
      '<td>'+formatDate(l.data)+'</td>'+
      '<td>'+(l.descricao||'-')+'</td>'+
      '<td>'+(l.categoria||'-')+'</td>'+
      '<td>'+tipoLabel+'</td>'+
      '<td class="'+valorClass+'" style="font-weight:600">'+formatCurrency(l.valor)+'</td>'+
      '<td>'+(l.formaPagamento||'-')+'</td>'+
      '<td>'+
        '<button class="btn btn-sm btn-outline" onclick="editLancamento(\''+mesKey+'\','+realIdx+')" title="Editar">✏️</button> '+
        '<button class="btn btn-sm btn-danger" onclick="deleteLancamento(\''+mesKey+'\','+realIdx+')" title="Excluir">🗑️</button>'+
      '</td>'+
    '</tr>';
  });
  container.innerHTML=rows;
}

function openLancamentoModal(mesKey,lancamento,editIdx){
  var isEdit=!!lancamento;
  var l=lancamento||{};
  
  var catOpts='';
  (appData.categoriasFluxo||[]).forEach(function(c){
    var sel=(l.categoria===c.nome)?'selected':'';
    catOpts+='<option value="'+c.nome+'" data-tipo="'+c.tipo+'" '+sel+'>'+c.nome+(c.tipo==='entrada'?' (Entrada)':' (Saída)')+'</option>';
  });

  var pgtoOpts='<option value="">-- Opcional --</option>';
  (appData.formasPagamento||[]).forEach(function(f){
    var sel=(l.formaPagamento===f)?'selected':'';
    pgtoOpts+='<option value="'+f+'" '+sel+'>'+f+'</option>';
  });

  var tipoSel=l.tipo||'entrada';

  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Lançamento':'Novo Lançamento';
  document.getElementById('cadastroModalBody').innerHTML=
    '<input type="hidden" id="flxEditIdx" value="'+(isEdit?editIdx:'')+'">'+
    '<input type="hidden" id="flxMesKey" value="'+mesKey+'">'+
    '<div class="form-row">'+
      '<div class="form-group"><label>Data</label><input type="date" class="form-control" id="flxData" value="'+(l.data||todayStr())+'"></div>'+
      '<div class="form-group"><label>Tipo</label>'+
        '<div style="display:flex;gap:8px">'+
          '<button type="button" class="fluxo-tipo-btn '+(tipoSel==='entrada'?'entrada-active':'')+'" id="btnTipoEntrada" onclick="setFlxTipo(\'entrada\')">Entrada</button>'+
          '<button type="button" class="fluxo-tipo-btn '+(tipoSel==='saida'?'saida-active':'')+'" id="btnTipoSaida" onclick="setFlxTipo(\'saida\')">Saída</button>'+
        '</div>'+
        '<input type="hidden" id="flxTipo" value="'+tipoSel+'">'+
      '</div>'+
    '</div>'+
    '<div class="form-group"><label>Descrição</label><input class="form-control" id="flxDescricao" value="'+(l.descricao||'')+'"></div>'+
    '<div class="form-row">'+
      '<div class="form-group"><label>Categoria</label><select class="form-control" id="flxCategoria" onchange="updateFlxTipoFromCat()">'+catOpts+'</select></div>'+
      '<div class="form-group"><label>Valor (R$)</label><input type="text" class="form-control" id="flxValor" value="'+(l.valor||'')+'"></div>'+
    '</div>'+
    '<div class="form-group"><label>Forma de Pagamento</label><select class="form-control" id="flxFormaPgto">'+pgtoOpts+'</select></div>';

  document.getElementById('cadastroModalFooter').innerHTML=
    '<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>'+
    '<button class="btn btn-primary" onclick="saveLancamento(\''+mesKey+'\')">💾 Salvar</button>';

  openCadastroModal();
}

function setFlxTipo(tipo){
  document.getElementById('flxTipo').value=tipo;
  var btnE=document.getElementById('btnTipoEntrada');
  var btnS=document.getElementById('btnTipoSaida');
  if(btnE){btnE.className='fluxo-tipo-btn '+(tipo==='entrada'?'entrada-active':'');}
  if(btnS){btnS.className='fluxo-tipo-btn '+(tipo==='saida'?'saida-active':'');}
}

function updateFlxTipoFromCat(){
  var sel=document.getElementById('flxCategoria');
  if(!sel)return;
  var opt=sel.options[sel.selectedIndex];
  if(opt&&opt.getAttribute('data-tipo')){
    setFlxTipo(opt.getAttribute('data-tipo'));
  }
}

function updateFlxCatOptions(){
  var tipo=document.getElementById('flxTipo').value;var catSel=document.getElementById('flxCat');
  var cats=(appData.categoriasFluxo||[]).filter(function(c){return c.tipo===tipo;});
  catSel.innerHTML=cats.map(function(c){return'<option value="'+c.nome+'">'+c.nome+'</option>';}).join('');
}
function saveLancamento(mesKey){
  var data=document.getElementById('flxData').value;
  var descricao=document.getElementById('flxDescricao').value;
  var categoria=document.getElementById('flxCategoria').value;
  var tipo=document.getElementById('flxTipo').value;
  var valorStr=document.getElementById('flxValor').value;
  var formaPagamento=document.getElementById('flxFormaPgto')?document.getElementById('flxFormaPgto').value:'';

  if(!data||!descricao||!valorStr){showToast('Preencha Data, Descrição e Valor','error');return;}

  var valor=parseFloat(valorStr.replace(/[^\d,.-]/g,'').replace(',','.'));
  if(isNaN(valor)||valor<=0){showToast('Valor inválido','error');return;}

  var lancamento={
    id:Date.now(),
    data:data,
    descricao:descricao,
    categoria:categoria,
    tipo:tipo,
    valor:valor,
    formaPagamento:formaPagamento
  };

  // Garantir que a estrutura existe
  if(!appData.fluxoCaixa) appData.fluxoCaixa={};
  if(!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey]=[];

  // Se estiver editando
  var editIdx=document.getElementById('flxEditIdx');
  if(editIdx&&editIdx.value!==''){
    var idx=parseInt(editIdx.value);
    appData.fluxoCaixa[mesKey][idx]=lancamento;
    showToast('Lançamento atualizado!','success');
  } else {
    appData.fluxoCaixa[mesKey].push(lancamento);
    showToast('Lançamento adicionado!','success');
  }

  saveData();
  closeCadastroModal();
  renderFluxoMes(getMesIndex(mesKey));
}

function getMesIndex(mesKey){
  var meses=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return meses.indexOf(mesKey);
}

function editLancamento(mesKey,idx){
  var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[mesKey])?appData.fluxoCaixa[mesKey]:[];
  var l=lancs[idx];if(!l)return;
  openLancamentoModal(mesKey,l,idx);
}

function deleteLancamento(mesKey,idx){
  if(!confirm('Excluir este lançamento?'))return;
  if(!appData.fluxoCaixa||!appData.fluxoCaixa[mesKey])return;
  appData.fluxoCaixa[mesKey].splice(idx,1);
  saveData();
  renderFluxoMes(getMesIndex(mesKey));
  showToast('Lançamento excluído','success');
}

// ══════════════════════════════════════════════════════════════
// ── COMPRAS ──
// ══════════════════════════════════════════════════════════════
function renderComprasPage(){
  var pg=document.getElementById('page-compras');if(!pg)return;
  var sitOpts=(appData.situacaoCompra||[]).map(function(s){return'<option value="'+s+'">'+s+'</option>';}).join('');
  var pgtoOpts=(appData.formasPagamento||[]).map(function(f){return'<option value="'+f+'">'+f+'</option>';}).join('');
  pg.innerHTML='<div class="page-header"><h2>🛒 Compras</h2><div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openCompraModal()">+ Nova Compra</button><button class="btn btn-outline" id="btnComprasEdit" onclick="toggleComprasEditMode()">'+(comprasEditMode?'✅ Finalizar Edição':'✏️ Editar Todos')+'</button><button class="btn btn-danger" onclick="deleteAllCompras()">🗑️ Excluir Todos</button></div></div><div class="dashboard-grid" id="comprasResultPanel"></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar compra..." oninput="onComprasSearch(this.value)"><select class="form-control" style="max-width:160px" onchange="onComprasFilterSit(this.value)"><option value="">Situação (todas)</option>'+sitOpts+'</select><select class="form-control" style="max-width:160px" onchange="onComprasFilterPgto(this.value)"><option value="">Pgto (todos)</option>'+pgtoOpts+'</select></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>F.Pgto</th><th>Venc.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="comprasBody"></tbody></table></div>';
  comprasSearchQuery='';comprasFilterSit='';comprasFilterPgto='';applyComprasFilters();
}
function renderComprasTable(compras){
  var tbody=document.getElementById('comprasBody');if(!tbody)return;
  if(compras.length===0){tbody.innerHTML='<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma compra encontrada</td></tr>';return;}
  var sitOpts=(appData.situacaoCompra||[]);
  tbody.innerHTML=compras.map(function(c){var total=(c.quantidade||1)*(c.valorUnit||0);var sitSelect='<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeCompraField('+c.id+',\'situacao\',this.value)">'+sitOpts.map(function(s){return'<option value="'+s+'"'+(c.situacao===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>';var acoes=comprasEditMode?'<button class="btn btn-sm btn-outline" onclick="viewCompra('+c.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCompra('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCompra('+c.id+')">🗑️</button>':'<button class="btn btn-sm btn-outline" onclick="viewCompra('+c.id+')">👁️</button>';return'<tr><td>'+formatDate(c.data)+'</td><td>'+(c.produto||'-')+'</td><td>'+(c.fornecedor||'-')+'</td><td>'+(c.quantidade||1)+'</td><td>'+formatCurrency(c.valorUnit)+'</td><td>'+formatCurrency(total)+'</td><td>'+(c.formaPagamento||'-')+'</td><td>'+formatDate(c.vencimento)+'</td><td>'+sitSelect+'</td><td>'+acoes+'</td></tr>';}).join('');
}
function changeCompraField(id,field,value){var c=(appData.compras||[]).find(function(x){return x.id===id;});if(c){c[field]=value;saveData();applyComprasFilters();}}
function openCompraModal(compra){var isEdit=!!compra;var fornOpts=(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(compra&&compra.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');var pgtoOpts=(appData.formasPagamento||[]).map(function(f){return'<option value="'+f+'"'+(compra&&compra.formaPagamento===f?' selected':'')+'>'+f+'</option>';}).join('');var sitOpts=(appData.situacaoCompra||[]).map(function(s){return'<option value="'+s+'"'+(compra&&compra.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Compra':'Nova Compra';document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="cpData" value="'+(compra?compra.data:todayStr())+'"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="cpVenc" value="'+(compra?compra.vencimento||'':'')+'"></div></div><div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="cpProd" value="'+(compra?compra.produto:'')+'"></div><div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="cpQtd" value="'+(compra?compra.quantidade:1)+'" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="cpValor" value="'+(compra?compra.valorUnit:'')+'" step="0.01"></div></div><div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="cpForn"><option value="">Selecione...</option>'+fornOpts+'</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="cpPgto"><option value="">Selecione...</option>'+pgtoOpts+'</select></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="cpSit">'+sitOpts+'</select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="cpObs" rows="2">'+(compra?compra.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCompra('+(isEdit?compra.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveCompra(id){var obj={data:document.getElementById('cpData').value,vencimento:document.getElementById('cpVenc').value,produto:document.getElementById('cpProd').value.trim(),quantidade:parseFloat(document.getElementById('cpQtd').value)||1,valorUnit:parseFloat(document.getElementById('cpValor').value)||0,fornecedor:document.getElementById('cpForn').value,formaPagamento:document.getElementById('cpPgto').value,situacao:document.getElementById('cpSit').value,obs:document.getElementById('cpObs').value};if(!obj.produto){showToast('Informe o produto','error');return;}if(!appData.compras)appData.compras=[];if(id){var idx=appData.compras.findIndex(function(c){return c.id===id;});if(idx>-1){obj.id=id;appData.compras[idx]=obj;}}else{obj.id=nextId(appData.compras);appData.compras.push(obj);}saveData();closeCadastroModal();renderComprasPage();showToast(id?'Compra atualizada!':'Compra cadastrada!','success');}
function editCompra(id){var c=(appData.compras||[]).find(function(x){return x.id===id;});if(c)openCompraModal(c);}
function viewCompra(id){var c=(appData.compras||[]).find(function(x){return x.id===id;});if(!c)return;var total=(c.quantidade||1)*(c.valorUnit||0);document.getElementById('viewModalTitle').textContent='Detalhes da Compra';document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>'+formatDate(c.data)+'</div><div class="detail-item"><span class="detail-label">Vencimento</span>'+formatDate(c.vencimento)+'</div><div class="detail-item"><span class="detail-label">Produto</span>'+c.produto+'</div><div class="detail-item"><span class="detail-label">Qtd</span>'+c.quantidade+'</div><div class="detail-item"><span class="detail-label">V.Unit</span>'+formatCurrency(c.valorUnit)+'</div><div class="detail-item"><span class="detail-label">Total</span>'+formatCurrency(total)+'</div><div class="detail-item"><span class="detail-label">Fornecedor</span>'+(c.fornecedor||'-')+'</div><div class="detail-item"><span class="detail-label">Pgto</span>'+(c.formaPagamento||'-')+'</div><div class="detail-item"><span class="detail-label">Situação</span>'+situacaoBadge(c.situacao)+'</div></div>'+(c.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+c.obs+'</div>':'');openViewModal();}
function deleteCompra(id){if(!confirm('Excluir compra?'))return;appData.compras=(appData.compras||[]).filter(function(c){return c.id!==id;});saveData();renderComprasPage();showToast('Compra excluída!','success');}
function toggleComprasEditMode(){comprasEditMode=!comprasEditMode;var btn=document.getElementById('btnComprasEdit');if(btn)btn.textContent=comprasEditMode?'✅ Finalizar Edição':'✏️ Editar Todos';applyComprasFilters();}
function deleteAllCompras(){if(!confirm('Excluir TODAS as compras?'))return;appData.compras=[];saveData();renderComprasPage();showToast('Todas excluídas!','success');}
function onComprasSearch(q){comprasSearchQuery=q.toLowerCase();applyComprasFilters();}
function onComprasFilterSit(v){comprasFilterSit=v;applyComprasFilters();}
function onComprasFilterPgto(v){comprasFilterPgto=v;applyComprasFilters();}
function applyComprasFilters(){var list=appData.compras||[];if(comprasSearchQuery)list=list.filter(function(c){return(c.produto||'').toLowerCase().includes(comprasSearchQuery)||(c.fornecedor||'').toLowerCase().includes(comprasSearchQuery);});if(comprasFilterSit)list=list.filter(function(c){return c.situacao===comprasFilterSit;});if(comprasFilterPgto)list=list.filter(function(c){return c.formaPagamento===comprasFilterPgto;});renderComprasTable(list);renderComprasResultPanel(list);}
function renderComprasResultPanel(list){var panel=document.getElementById('comprasResultPanel');if(!panel)return;var total=list.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);var pago=list.filter(function(c){return c.situacao==='Pago';}).reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);var devendo=list.filter(function(c){return c.situacao==='Devendo';}).reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);panel.innerHTML='<div class="card"><div class="card-header"><span>Total Filtrado</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+list.length+' compra(s)</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">'+formatCurrency(pago)+'</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">'+formatCurrency(devendo)+'</div></div>';}

// ══════════════════════════════════════════════════════════════
// ── VENDAS ──
// ══════════════════════════════════════════════════════════════
function renderVendasPage(){var pg=document.getElementById('page-vendas');if(!pg)return;var sitOpts=(appData.situacaoVenda||[]).map(function(s){return'<option value="'+s+'">'+s+'</option>';}).join('');pg.innerHTML='<div class="page-header"><h2>💰 Vendas</h2><div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openVendaModal()">+ Nova Venda</button><button class="btn btn-outline" id="btnVendasEdit" onclick="toggleVendasEditMode()">'+(vendasEditMode?'✅ Finalizar Edição':'✏️ Editar Todos')+'</button><button class="btn btn-danger" onclick="deleteAllVendas()">🗑️ Excluir Todos</button></div></div><div class="dashboard-grid" id="vendasResultPanel"></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar venda..." oninput="onVendasSearch(this.value)"><select class="form-control" style="max-width:160px" onchange="onVendasFilterSit(this.value)"><option value="">Situação (todas)</option>'+sitOpts+'</select></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>F.Pgto</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="vendasBody"></tbody></table></div>';vendasSearchQuery='';vendasFilterSit='';applyVendasFilters();}
function renderVendasTable(vendas){var tbody=document.getElementById('vendasBody');if(!tbody)return;if(vendas.length===0){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma venda encontrada</td></tr>';return;}var sitOpts=(appData.situacaoVenda||[]);tbody.innerHTML=vendas.map(function(v){var total=(v.quantidade||1)*(v.valorUnit||0);var sitSelect='<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeVendaField('+v.id+',\'situacao\',this.value)">'+sitOpts.map(function(s){return'<option value="'+s+'"'+(v.situacao===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>';var acoes=vendasEditMode?'<button class="btn btn-sm btn-outline" onclick="viewVenda('+v.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editVenda('+v.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteVenda('+v.id+')">🗑️</button>':'<button class="btn btn-sm btn-outline" onclick="viewVenda('+v.id+')">👁️</button>';return'<tr><td>'+formatDate(v.data)+'</td><td>'+(v.produto||'-')+'</td><td>'+(v.cliente||'-')+'</td><td>'+(v.quantidade||1)+'</td><td>'+formatCurrency(v.valorUnit)+'</td><td>'+formatCurrency(total)+'</td><td>'+(v.formaPagamento||'-')+'</td><td>'+sitSelect+'</td><td>'+acoes+'</td></tr>';}).join('');}
function changeVendaField(id,field,value){var v=(appData.vendas||[]).find(function(x){return x.id===id;});if(v){v[field]=value;saveData();applyVendasFilters();}}
function openVendaModal(venda){var isEdit=!!venda;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(venda&&venda.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');var pgtoOpts=(appData.formasPagamentoVendas||[]).map(function(f){return'<option value="'+f+'"'+(venda&&venda.formaPagamento===f?' selected':'')+'>'+f+'</option>';}).join('');var sitOpts=(appData.situacaoVenda||[]).map(function(s){return'<option value="'+s+'"'+(venda&&venda.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');var entregaOpts=(appData.situacaoEntrega||[]).map(function(s){return'<option value="'+s+'"'+(venda&&venda.entrega===s?' selected':'')+'>'+s+'</option>';}).join('');var vendedorOpts=(appData.vendedores||[]).map(function(v2){return'<option value="'+v2+'"'+(venda&&venda.vendedor===v2?' selected':'')+'>'+v2+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Venda':'Nova Venda';document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="vnData" value="'+(venda?venda.data:todayStr())+'"></div><div class="form-group"><label>Vendedor</label><select class="form-control" id="vnVendedor"><option value="">Selecione...</option>'+vendedorOpts+'</select></div></div><div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="vnProd" value="'+(venda?venda.produto:'')+'"></div><div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="vnQtd" value="'+(venda?venda.quantidade:1)+'" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="vnValor" value="'+(venda?venda.valorUnit:'')+'" step="0.01"></div></div><div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="vnCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="vnPgto"><option value="">Selecione...</option>'+pgtoOpts+'</select></div></div><div class="form-row"><div class="form-group"><label>Situação</label><select class="form-control" id="vnSit">'+sitOpts+'</select></div><div class="form-group"><label>Entrega</label><select class="form-control" id="vnEntrega">'+entregaOpts+'</select></div></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="vnObs" rows="2">'+(venda?venda.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda('+(isEdit?venda.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveVenda(id){var obj={data:document.getElementById('vnData').value,produto:document.getElementById('vnProd').value.trim(),quantidade:parseFloat(document.getElementById('vnQtd').value)||1,valorUnit:parseFloat(document.getElementById('vnValor').value)||0,cliente:document.getElementById('vnCli').value,formaPagamento:document.getElementById('vnPgto').value,situacao:document.getElementById('vnSit').value,entrega:document.getElementById('vnEntrega').value,vendedor:document.getElementById('vnVendedor').value,obs:document.getElementById('vnObs').value};if(!obj.produto){showToast('Informe o produto','error');return;}if(!appData.vendas)appData.vendas=[];if(id){var idx=appData.vendas.findIndex(function(v){return v.id===id;});if(idx>-1){obj.id=id;appData.vendas[idx]=obj;}}else{obj.id=nextId(appData.vendas);appData.vendas.push(obj);}saveData();closeCadastroModal();renderVendasPage();showToast(id?'Venda atualizada!':'Venda cadastrada!','success');}
function editVenda(id){var v=(appData.vendas||[]).find(function(x){return x.id===id;});if(v)openVendaModal(v);}
function viewVenda(id){var v=(appData.vendas||[]).find(function(x){return x.id===id;});if(!v)return;var total=(v.quantidade||1)*(v.valorUnit||0);document.getElementById('viewModalTitle').textContent='Detalhes da Venda';document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>'+formatDate(v.data)+'</div><div class="detail-item"><span class="detail-label">Produto</span>'+v.produto+'</div><div class="detail-item"><span class="detail-label">Qtd</span>'+v.quantidade+'</div><div class="detail-item"><span class="detail-label">V.Unit</span>'+formatCurrency(v.valorUnit)+'</div><div class="detail-item"><span class="detail-label">Total</span>'+formatCurrency(total)+'</div><div class="detail-item"><span class="detail-label">Cliente</span>'+(v.cliente||'-')+'</div><div class="detail-item"><span class="detail-label">Pgto</span>'+(v.formaPagamento||'-')+'</div><div class="detail-item"><span class="detail-label">Situação</span>'+situacaoBadge(v.situacao)+'</div><div class="detail-item"><span class="detail-label">Entrega</span>'+situacaoBadge(v.entrega)+'</div><div class="detail-item"><span class="detail-label">Vendedor</span>'+(v.vendedor||'-')+'</div></div>'+(v.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+v.obs+'</div>':'');openViewModal();}
function deleteVenda(id){if(!confirm('Excluir venda?'))return;appData.vendas=(appData.vendas||[]).filter(function(v){return v.id!==id;});saveData();renderVendasPage();showToast('Venda excluída!','success');}
function toggleVendasEditMode(){vendasEditMode=!vendasEditMode;var btn=document.getElementById('btnVendasEdit');if(btn)btn.textContent=vendasEditMode?'✅ Finalizar Edição':'✏️ Editar Todos';applyVendasFilters();}
function deleteAllVendas(){if(!confirm('Excluir TODAS as vendas?'))return;appData.vendas=[];saveData();renderVendasPage();showToast('Todas excluídas!','success');}
function onVendasSearch(q){vendasSearchQuery=q.toLowerCase();applyVendasFilters();}
function onVendasFilterSit(v){vendasFilterSit=v;applyVendasFilters();}
function applyVendasFilters(){var list=appData.vendas||[];if(vendasSearchQuery)list=list.filter(function(v){return(v.produto||'').toLowerCase().includes(vendasSearchQuery)||(v.cliente||'').toLowerCase().includes(vendasSearchQuery);});if(vendasFilterSit)list=list.filter(function(v){return v.situacao===vendasFilterSit;});renderVendasTable(list);renderVendasResultPanel(list);}
function renderVendasResultPanel(list){var panel=document.getElementById('vendasResultPanel');if(!panel)return;var total=list.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);var pago=list.filter(function(v){return v.situacao==='Pago';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);var devendo=list.filter(function(v){return v.situacao==='Devendo';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);panel.innerHTML='<div class="card"><div class="card-header"><span>Total Filtrado</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+list.length+' venda(s)</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">'+formatCurrency(pago)+'</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">'+formatCurrency(devendo)+'</div></div>';}

// ══════════════════════════════════════════════════════════════
// ── ESTOQUE ──
// ══════════════════════════════════════════════════════════════
function renderEstoquePage(){var pg=document.getElementById('page-estoque');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>📦 Estoque</h2><button class="btn btn-primary" onclick="openEstoqueModal()">+ Novo Item</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar no estoque..." oninput="filterEstoque(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Unidade</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Local</th><th>Ações</th></tr></thead><tbody id="estoqueBody"></tbody></table></div>';renderEstoqueTable(appData.estoque||[]);}
function renderEstoqueTable(list){var tbody=document.getElementById('estoqueBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Estoque vazio</td></tr>';return;}tbody.innerHTML=list.map(function(e){var total=(e.quantidade||0)*(e.valorUnit||0);return'<tr><td>'+(e.produto||'-')+'</td><td>'+(e.unidade||'-')+'</td><td>'+(e.quantidade||0)+'</td><td>'+formatCurrency(e.valorUnit)+'</td><td>'+formatCurrency(total)+'</td><td>'+(e.local||'-')+'</td><td><button class="btn btn-sm btn-primary" onclick="editEstoque('+e.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteEstoque('+e.id+')">🗑️</button></td></tr>';}).join('');}
function openEstoqueModal(item){var isEdit=!!item;var unOpts=(appData.tipoUnidade||[]).map(function(u){return'<option value="'+u+'"'+(item&&item.unidade===u?' selected':'')+'>'+u+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Item':'Novo Item de Estoque';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="estProd" value="'+(item?item.produto:'')+'"></div><div class="form-row"><div class="form-group"><label>Unidade</label><select class="form-control" id="estUn">'+unOpts+'</select></div><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="estQtd" value="'+(item?item.quantidade:0)+'" min="0"></div></div><div class="form-row"><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="estValor" value="'+(item?item.valorUnit:'')+'" step="0.01"></div><div class="form-group"><label>Local</label><input type="text" class="form-control" id="estLocal" value="'+(item?item.local||'':'')+'"></div></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEstoque('+(isEdit?item.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveEstoque(id){var obj={produto:document.getElementById('estProd').value.trim(),unidade:document.getElementById('estUn').value,quantidade:parseFloat(document.getElementById('estQtd').value)||0,valorUnit:parseFloat(document.getElementById('estValor').value)||0,local:document.getElementById('estLocal').value.trim()};if(!obj.produto){showToast('Informe o produto','error');return;}if(!appData.estoque)appData.estoque=[];if(id){var idx=appData.estoque.findIndex(function(e){return e.id===id;});if(idx>-1){obj.id=id;appData.estoque[idx]=obj;}}else{obj.id=nextId(appData.estoque);appData.estoque.push(obj);}saveData();closeCadastroModal();renderEstoquePage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editEstoque(id){var e=(appData.estoque||[]).find(function(x){return x.id===id;});if(e)openEstoqueModal(e);}
function deleteEstoque(id){if(!confirm('Excluir item?'))return;appData.estoque=(appData.estoque||[]).filter(function(e){return e.id!==id;});saveData();renderEstoquePage();showToast('Excluído!','success');}
function filterEstoque(q){var list=appData.estoque||[];if(q)list=list.filter(function(e){return(e.produto||'').toLowerCase().includes(q.toLowerCase());});renderEstoqueTable(list);}

// ══════════════════════════════════════════════════════════════
// ── PRODUTOS ──
// ══════════════════════════════════════════════════════════════
function renderProdutosPage(){var pg=document.getElementById('page-produtos');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>🏷️ Produtos</h2><button class="btn btn-primary" onclick="openProdutoModal()">+ Novo Produto</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto..." oninput="filterProdutos(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Imagem</th><th>Nome</th><th>Categoria</th><th>V.Compra</th><th>V.Venda</th><th>Ações</th></tr></thead><tbody id="produtosBody"></tbody></table></div>';renderProdutosTable(appData.produtos||[]);}
function renderProdutosTable(list){var tbody=document.getElementById('produtosBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto</td></tr>';return;}tbody.innerHTML=list.map(function(p){var img=p.imagem?'<img src="'+p.imagem+'" style="width:40px;height:40px;border-radius:4px;object-fit:cover">':'<span style="color:var(--text-muted)">-</span>';return'<tr><td>'+img+'</td><td>'+(p.nome||'-')+'</td><td>'+(p.categoria||'-')+'</td><td>'+formatCurrency(p.valorCompra)+'</td><td>'+formatCurrency(p.valorVenda)+'</td><td><button class="btn btn-sm btn-primary" onclick="editProduto('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProduto('+p.id+')">🗑️</button></td></tr>';}).join('');}
function openProdutoModal(prod){var isEdit=!!prod;document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Produto':'Novo Produto';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prNome" value="'+(prod?prod.nome:'')+'"></div><div class="form-row"><div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="prCat" value="'+(prod?prod.categoria||'':'')+'"></div><div class="form-group"><label>V.Compra</label><input type="number" class="form-control" id="prVCompra" value="'+(prod?prod.valorCompra:'')+'" step="0.01"></div></div><div class="form-row"><div class="form-group"><label>V.Venda</label><input type="number" class="form-control" id="prVVenda" value="'+(prod?prod.valorVenda:'')+'" step="0.01"></div><div class="form-group"><label>Imagem</label><input type="file" class="form-control" id="prImgInput" accept="image/*"><div id="prImgPreview">'+(prod&&prod.imagem?'<img src="'+prod.imagem+'" style="max-width:100px;max-height:80px;border-radius:4px;object-fit:cover">':'')+'</div></div></div><div class="form-group"><label>Descrição</label><textarea class="form-control" id="prDesc" rows="2">'+(prod?prod.descricao||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduto('+(isEdit?prod.id:'null')+')">Salvar</button>';openCadastroModal();setTimeout(function(){handleImageUpload('prImgInput','prImgPreview');},50);}
function saveProduto(id){var imgEl=document.getElementById('prImgInput');var imgB64=imgEl?imgEl.getAttribute('data-base64')||'':'';var existing=id?(appData.produtos||[]).find(function(p){return p.id===id;}):null;var obj={nome:document.getElementById('prNome').value.trim(),categoria:document.getElementById('prCat').value.trim(),valorCompra:parseFloat(document.getElementById('prVCompra').value)||0,valorVenda:parseFloat(document.getElementById('prVVenda').value)||0,imagem:imgB64||(existing?existing.imagem||'':''),descricao:document.getElementById('prDesc').value};if(!obj.nome){showToast('Informe o nome','error');return;}if(!appData.produtos)appData.produtos=[];if(id){var idx=appData.produtos.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.produtos[idx]=obj;}}else{obj.id=nextId(appData.produtos);appData.produtos.push(obj);}saveData();closeCadastroModal();renderProdutosPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editProduto(id){var p=(appData.produtos||[]).find(function(x){return x.id===id;});if(p)openProdutoModal(p);}
function deleteProduto(id){if(!confirm('Excluir produto?'))return;appData.produtos=(appData.produtos||[]).filter(function(p){return p.id!==id;});saveData();renderProdutosPage();showToast('Excluído!','success');}
function filterProdutos(q){var list=appData.produtos||[];if(q)list=list.filter(function(p){return(p.nome||'').toLowerCase().includes(q.toLowerCase());});renderProdutosTable(list);}

// ══════════════════════════════════════════════════════════════
// ── CLIENTES ──
// ══════════════════════════════════════════════════════════════
function renderClientesPage(){var pg=document.getElementById('page-clientes');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>👥 Clientes</h2><button class="btn btn-primary" onclick="openClienteModal()">+ Novo Cliente</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cliente..." oninput="filterClientes(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead><tbody id="clientesBody"></tbody></table></div>';renderClientesTable(appData.clientes||[]);}
function renderClientesTable(list){var tbody=document.getElementById('clientesBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cliente</td></tr>';return;}tbody.innerHTML=list.map(function(c){return'<tr><td>'+(c.nome||'-')+'</td><td>'+(c.cpfCnpj||'-')+'</td><td>'+(c.telefone||'-')+'</td><td>'+(c.cidade||'-')+'</td><td><button class="btn btn-sm btn-outline" onclick="viewCliente('+c.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCliente('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCliente('+c.id+')">🗑️</button></td></tr>';}).join('');}
function openClienteModal(cli){var isEdit=!!cli;document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cliente':'Novo Cliente';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="clNome" value="'+(cli?cli.nome:'')+'"></div><div class="form-row"><div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="clCpfCnpj" value="'+(cli?cli.cpfCnpj||'':'')+'"></div><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="clTelefone" value="'+(cli?cli.telefone||'':'')+'"></div></div><div class="form-row"><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="clCelular" value="'+(cli?cli.celular||'':'')+'"></div><div class="form-group"><label>Email</label><input type="email" class="form-control" id="clEmail" value="'+(cli?cli.email||'':'')+'"></div></div><div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="clCidade" value="'+(cli?cli.cidade||'':'')+'"></div><div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="clEnd" value="'+(cli?cli.endereco||'':'')+'"></div></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="clObs" rows="2">'+(cli?cli.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCliente('+(isEdit?cli.id:'null')+')">Salvar</button>';openCadastroModal();applyAllMasks();}
function saveCliente(id){var obj={nome:document.getElementById('clNome').value.trim(),cpfCnpj:document.getElementById('clCpfCnpj').value,telefone:document.getElementById('clTelefone').value,celular:document.getElementById('clCelular').value,email:document.getElementById('clEmail').value,cidade:document.getElementById('clCidade').value,endereco:document.getElementById('clEnd').value,obs:document.getElementById('clObs').value};if(!obj.nome){showToast('Informe o nome','error');return;}if(!appData.clientes)appData.clientes=[];if(id){var idx=appData.clientes.findIndex(function(c){return c.id===id;});if(idx>-1){obj.id=id;appData.clientes[idx]=obj;}}else{obj.id=nextId(appData.clientes);appData.clientes.push(obj);}saveData();closeCadastroModal();renderClientesPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editCliente(id){var c=(appData.clientes||[]).find(function(x){return x.id===id;});if(c)openClienteModal(c);}
function viewCliente(id){var c=(appData.clientes||[]).find(function(x){return x.id===id;});if(!c)return;document.getElementById('viewModalTitle').textContent='Detalhes do Cliente';document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+c.nome+'</div><div class="detail-item"><span class="detail-label">CPF/CNPJ</span>'+(c.cpfCnpj||'-')+'</div><div class="detail-item"><span class="detail-label">Telefone</span>'+(c.telefone||'-')+'</div><div class="detail-item"><span class="detail-label">Celular</span>'+(c.celular||'-')+'</div><div class="detail-item"><span class="detail-label">Email</span>'+(c.email||'-')+'</div><div class="detail-item"><span class="detail-label">Cidade</span>'+(c.cidade||'-')+'</div><div class="detail-item"><span class="detail-label">Endereço</span>'+(c.endereco||'-')+'</div></div>'+(c.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+c.obs+'</div>':'');openViewModal();}
function deleteCliente(id){if(!confirm('Excluir cliente?'))return;appData.clientes=(appData.clientes||[]).filter(function(c){return c.id!==id;});saveData();renderClientesPage();showToast('Excluído!','success');}
function filterClientes(q){var list=appData.clientes||[];if(q)list=list.filter(function(c){return(c.nome||'').toLowerCase().includes(q.toLowerCase());});renderClientesTable(list);}

// ══════════════════════════════════════════════════════════════
// ── FORNECEDORES ──
// ══════════════════════════════════════════════════════════════
function renderFornecedoresPage(){var pg=document.getElementById('page-fornecedores');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>🏭 Fornecedores</h2><button class="btn btn-primary" onclick="openFornecedorModal()">+ Novo Fornecedor</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar fornecedor..." oninput="filterFornecedores(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead><tbody id="fornecedoresBody"></tbody></table></div>';renderFornecedoresTable(appData.fornecedores||[]);}
function renderFornecedoresTable(list){var tbody=document.getElementById('fornecedoresBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum fornecedor</td></tr>';return;}tbody.innerHTML=list.map(function(f){return'<tr><td>'+(f.nome||'-')+'</td><td>'+(f.cnpj||'-')+'</td><td>'+(f.telefone||'-')+'</td><td>'+(f.cidade||'-')+'</td><td><button class="btn btn-sm btn-outline" onclick="viewFornecedor('+f.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editFornecedor('+f.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFornecedor('+f.id+')">🗑️</button></td></tr>';}).join('');}
function openFornecedorModal(forn){var isEdit=!!forn;document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Fornecedor':'Novo Fornecedor';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="fnNome" value="'+(forn?forn.nome:'')+'"></div><div class="form-row"><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="fnCnpj" value="'+(forn?forn.cnpj||'':'')+'"></div><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="fnTelefone" value="'+(forn?forn.telefone||'':'')+'"></div></div><div class="form-row"><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="fnCelular" value="'+(forn?forn.celular||'':'')+'"></div><div class="form-group"><label>Email</label><input type="email" class="form-control" id="fnEmail" value="'+(forn?forn.email||'':'')+'"></div></div><div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="fnCidade" value="'+(forn?forn.cidade||'':'')+'"></div><div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="fnEnd" value="'+(forn?forn.endereco||'':'')+'"></div></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="fnObs" rows="2">'+(forn?forn.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFornecedor('+(isEdit?forn.id:'null')+')">Salvar</button>';openCadastroModal();applyAllMasks();}
function saveFornecedor(id){var obj={nome:document.getElementById('fnNome').value.trim(),cnpj:document.getElementById('fnCnpj').value,telefone:document.getElementById('fnTelefone').value,celular:document.getElementById('fnCelular').value,email:document.getElementById('fnEmail').value,cidade:document.getElementById('fnCidade').value,endereco:document.getElementById('fnEnd').value,obs:document.getElementById('fnObs').value};if(!obj.nome){showToast('Informe o nome','error');return;}if(!appData.fornecedores)appData.fornecedores=[];if(id){var idx=appData.fornecedores.findIndex(function(f){return f.id===id;});if(idx>-1){obj.id=id;appData.fornecedores[idx]=obj;}}else{obj.id=nextId(appData.fornecedores);appData.fornecedores.push(obj);}saveData();closeCadastroModal();renderFornecedoresPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editFornecedor(id){var f=(appData.fornecedores||[]).find(function(x){return x.id===id;});if(f)openFornecedorModal(f);}
function viewFornecedor(id){var f=(appData.fornecedores||[]).find(function(x){return x.id===id;});if(!f)return;document.getElementById('viewModalTitle').textContent='Detalhes do Fornecedor';document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+f.nome+'</div><div class="detail-item"><span class="detail-label">CNPJ</span>'+(f.cnpj||'-')+'</div><div class="detail-item"><span class="detail-label">Telefone</span>'+(f.telefone||'-')+'</div><div class="detail-item"><span class="detail-label">Celular</span>'+(f.celular||'-')+'</div><div class="detail-item"><span class="detail-label">Email</span>'+(f.email||'-')+'</div><div class="detail-item"><span class="detail-label">Cidade</span>'+(f.cidade||'-')+'</div><div class="detail-item"><span class="detail-label">Endereço</span>'+(f.endereco||'-')+'</div></div>'+(f.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+f.obs+'</div>':'');openViewModal();}
function deleteFornecedor(id){if(!confirm('Excluir fornecedor?'))return;appData.fornecedores=(appData.fornecedores||[]).filter(function(f){return f.id!==id;});saveData();renderFornecedoresPage();showToast('Excluído!','success');}
function filterFornecedores(q){var list=appData.fornecedores||[];if(q)list=list.filter(function(f){return(f.nome||'').toLowerCase().includes(q.toLowerCase());});renderFornecedoresTable(list);}

// ══════════════════════════════════════════════════════════════
// ── P. FORNECEDORES ──
// ══════════════════════════════════════════════════════════════
function renderPFornecedoresPage(){var pg=document.getElementById('page-pfornecedores');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>📋 P. Fornecedores</h2><button class="btn btn-primary" onclick="openPFornModal()">+ Novo</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPForn(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Fornecedor</th><th>Produto</th><th>Valor</th><th>Contato</th><th>Ações</th></tr></thead><tbody id="pfornBody"></tbody></table></div>';renderPFornTable(appData.pFornecedores||[]);}
function renderPFornTable(list){var tbody=document.getElementById('pfornBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>';return;}tbody.innerHTML=list.map(function(p){return'<tr><td>'+(p.fornecedor||'-')+'</td><td>'+(p.produto||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+(p.contato||'-')+'</td><td><button class="btn btn-sm btn-primary" onclick="editPForn('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePForn('+p.id+')">🗑️</button></td></tr>';}).join('');}
function openPFornModal(item){var isEdit=!!item;var fornOpts=(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(item&&item.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar':'Novo P. Fornecedor';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Fornecedor</label><select class="form-control" id="pfForn"><option value="">Selecione...</option>'+fornOpts+'</select></div><div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="pfProd" value="'+(item?item.produto:'')+'"></div><div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pfValor" value="'+(item?item.valor:'')+'" step="0.01"></div><div class="form-group"><label>Contato</label><input type="text" class="form-control" id="pfContato" value="'+(item?item.contato||'':'')+'"></div></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="pfObs" rows="2">'+(item?item.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePForn('+(isEdit?item.id:'null')+')">Salvar</button>';openCadastroModal();}
function savePForn(id){var obj={fornecedor:document.getElementById('pfForn').value,produto:document.getElementById('pfProd').value.trim(),valor:parseFloat(document.getElementById('pfValor').value)||0,contato:document.getElementById('pfContato').value,obs:document.getElementById('pfObs').value};if(!obj.produto){showToast('Informe o produto','error');return;}if(!appData.pFornecedores)appData.pFornecedores=[];if(id){var idx=appData.pFornecedores.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.pFornecedores[idx]=obj;}}else{obj.id=nextId(appData.pFornecedores);appData.pFornecedores.push(obj);}saveData();closeCadastroModal();renderPFornecedoresPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editPForn(id){var p=(appData.pFornecedores||[]).find(function(x){return x.id===id;});if(p)openPFornModal(p);}
function deletePForn(id){if(!confirm('Excluir?'))return;appData.pFornecedores=(appData.pFornecedores||[]).filter(function(p){return p.id!==id;});saveData();renderPFornecedoresPage();showToast('Excluído!','success');}
function filterPForn(q){var list=appData.pFornecedores||[];if(q)list=list.filter(function(p){return(p.produto||'').toLowerCase().includes(q.toLowerCase())||(p.fornecedor||'').toLowerCase().includes(q.toLowerCase());});renderPFornTable(list);}

// ══════════════════════════════════════════════════════════════
// ── BOLETOS ──
// ══════════════════════════════════════════════════════════════
function renderBoletosPage(){var pg=document.getElementById('page-boletos');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>🔖 Boletos</h2><button class="btn btn-primary" onclick="openBoletoModal()">+ Novo Boleto</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar boleto..." oninput="filterBoletos(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Dias Rest.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="boletosBody"></tbody></table></div>';renderBoletosTable(appData.boletos||[]);}
function renderBoletosTable(list){var tbody=document.getElementById('boletosBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>';return;}var sitOpts=(appData.situacaoBoleto||[]);tbody.innerHTML=list.map(function(b){var dias=calcDiasRestantes(b.vencimento);var sitSelect='<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeBoletoSit('+b.id+',this.value)">'+sitOpts.map(function(s){return'<option value="'+s+'"'+(b.situacao===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>';return'<tr><td>'+(b.descricao||'-')+'</td><td>'+formatCurrency(b.valor)+'</td><td>'+formatDate(b.vencimento)+'</td><td>'+formatDiasRestantes(dias,b.situacao)+'</td><td>'+sitSelect+'</td><td><button class="btn btn-sm btn-primary" onclick="editBoleto('+b.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBoleto('+b.id+')">🗑️</button></td></tr>';}).join('');}
function changeBoletoSit(id,val){var b=(appData.boletos||[]).find(function(x){return x.id===id;});if(b){b.situacao=val;saveData();renderBoletosPage();}}
function openBoletoModal(bol){var isEdit=!!bol;var sitOpts=(appData.situacaoBoleto||[]).map(function(s){return'<option value="'+s+'"'+(bol&&bol.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Boleto':'Novo Boleto';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="bolDesc" value="'+(bol?bol.descricao:'')+'"></div><div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="bolValor" value="'+(bol?bol.valor:'')+'" step="0.01"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="bolVenc" value="'+(bol?bol.vencimento:'')+'"></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="bolSit">'+sitOpts+'</select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="bolObs" rows="2">'+(bol?bol.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBoleto('+(isEdit?bol.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveBoleto(id){var obj={descricao:document.getElementById('bolDesc').value.trim(),valor:parseFloat(document.getElementById('bolValor').value)||0,vencimento:document.getElementById('bolVenc').value,situacao:document.getElementById('bolSit').value,obs:document.getElementById('bolObs').value};if(!obj.descricao){showToast('Informe a descrição','error');return;}if(!appData.boletos)appData.boletos=[];if(id){var idx=appData.boletos.findIndex(function(b){return b.id===id;});if(idx>-1){obj.id=id;appData.boletos[idx]=obj;}}else{obj.id=nextId(appData.boletos);appData.boletos.push(obj);}saveData();closeCadastroModal();renderBoletosPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editBoleto(id){var b=(appData.boletos||[]).find(function(x){return x.id===id;});if(b)openBoletoModal(b);}
function deleteBoleto(id){if(!confirm('Excluir boleto?'))return;appData.boletos=(appData.boletos||[]).filter(function(b){return b.id!==id;});saveData();renderBoletosPage();showToast('Excluído!','success');}
function filterBoletos(q){var list=appData.boletos||[];if(q)list=list.filter(function(b){return(b.descricao||'').toLowerCase().includes(q.toLowerCase());});renderBoletosTable(list);}

// ══════════════════════════════════════════════════════════════
// ── CHEQUES ──
// ══════════════════════════════════════════════════════════════
function renderChequesPage(){var pg=document.getElementById('page-cheques');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>📝 Cheques</h2><button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cheque..." oninput="filterCheques(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nº</th><th>Emitente</th><th>Valor</th><th>Bom Para</th><th>Dias Rest.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="chequesBody"></tbody></table></div>';renderChequesTable(appData.cheques||[]);}
function renderChequesTable(list){var tbody=document.getElementById('chequesBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>';return;}var sitOpts=(appData.situacaoCheque||[]);tbody.innerHTML=list.map(function(ch){var dias=calcDiasRestantes(ch.bomPara);var sitSelect='<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeChequeSit('+ch.id+',this.value)">'+sitOpts.map(function(s){return'<option value="'+s+'"'+(ch.situacao===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>';return'<tr><td>'+(ch.numero||'-')+'</td><td>'+(ch.emitente||'-')+'</td><td>'+formatCurrency(ch.valor)+'</td><td>'+formatDate(ch.bomPara)+'</td><td>'+formatDiasRestantes(dias,ch.situacao)+'</td><td>'+sitSelect+'</td><td><button class="btn btn-sm btn-primary" onclick="editCheque('+ch.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCheque('+ch.id+')">🗑️</button></td></tr>';}).join('');}
function changeChequeSit(id,val){var ch=(appData.cheques||[]).find(function(x){return x.id===id;});if(ch){ch.situacao=val;saveData();renderChequesPage();}}
function openChequeModal(ch){var isEdit=!!ch;var sitOpts=(appData.situacaoCheque||[]).map(function(s){return'<option value="'+s+'"'+(ch&&ch.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cheque':'Novo Cheque';document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Nº Cheque</label><input type="text" class="form-control" id="chNum" value="'+(ch?ch.numero||'':'')+'"></div><div class="form-group"><label>Emitente *</label><input type="text" class="form-control" id="chEmit" value="'+(ch?ch.emitente:'')+'"></div></div><div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="chValor" value="'+(ch?ch.valor:'')+'" step="0.01"></div><div class="form-group"><label>Bom Para</label><input type="date" class="form-control" id="chBom" value="'+(ch?ch.bomPara:'')+'"></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="chSit">'+sitOpts+'</select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="chObs" rows="2">'+(ch?ch.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCheque('+(isEdit?ch.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveCheque(id){var obj={numero:document.getElementById('chNum').value,emitente:document.getElementById('chEmit').value.trim(),valor:parseFloat(document.getElementById('chValor').value)||0,bomPara:document.getElementById('chBom').value,situacao:document.getElementById('chSit').value,obs:document.getElementById('chObs').value};if(!obj.emitente){showToast('Informe o emitente','error');return;}if(!appData.cheques)appData.cheques=[];if(id){var idx=appData.cheques.findIndex(function(c){return c.id===id;});if(idx>-1){obj.id=id;appData.cheques[idx]=obj;}}else{obj.id=nextId(appData.cheques);appData.cheques.push(obj);}saveData();closeCadastroModal();renderChequesPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editCheque(id){var ch=(appData.cheques||[]).find(function(x){return x.id===id;});if(ch)openChequeModal(ch);}
function deleteCheque(id){if(!confirm('Excluir cheque?'))return;appData.cheques=(appData.cheques||[]).filter(function(c){return c.id!==id;});saveData();renderChequesPage();showToast('Excluído!','success');}
function filterCheques(q){var list=appData.cheques||[];if(q)list=list.filter(function(ch){return(ch.emitente||'').toLowerCase().includes(q.toLowerCase())||(ch.numero||'').includes(q);});renderChequesTable(list);}

// ══════════════════════════════════════════════════════════════
// ── PRESTAÇÕES ──
// ══════════════════════════════════════════════════════════════
function renderPrestacoesPage(){var pg=document.getElementById('page-prestacoes');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>💳 Prestações</h2><button class="btn btn-primary" onclick="openPrestacaoModal()">+ Nova Prestação</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPrestacoes(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Parcela</th><th>Vencimento</th><th>Dias Rest.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="prestacoesBody"></tbody></table></div>';renderPrestacoesTable(appData.prestacoes||[]);}
function renderPrestacoesTable(list){var tbody=document.getElementById('prestacoesBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma prestação</td></tr>';return;}tbody.innerHTML=list.map(function(p){var dias=calcDiasRestantes(p.vencimento);return'<tr><td>'+(p.descricao||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+(p.parcela||'-')+'</td><td>'+formatDate(p.vencimento)+'</td><td>'+formatDiasRestantes(dias,p.situacao)+'</td><td>'+situacaoBadge(p.situacao)+'</td><td><button class="btn btn-sm btn-primary" onclick="editPrestacao('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePrestacao('+p.id+')">🗑️</button></td></tr>';}).join('');}
function openPrestacaoModal(prest){var isEdit=!!prest;document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Prestação':'Nova Prestação';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="prstDesc" value="'+(prest?prest.descricao:'')+'"></div><div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prstValor" value="'+(prest?prest.valor:'')+'" step="0.01"></div><div class="form-group"><label>Parcela</label><input type="text" class="form-control" id="prstParcela" value="'+(prest?prest.parcela||'':'')+'"></div></div><div class="form-row"><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="prstVenc" value="'+(prest?prest.vencimento:'')+'"></div><div class="form-group"><label>Situação</label><select class="form-control" id="prstSit"><option value="Pendente"'+(prest&&prest.situacao==='Pendente'?' selected':'')+'>Pendente</option><option value="Pago"'+(prest&&prest.situacao==='Pago'?' selected':'')+'>Pago</option></select></div></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="prstObs" rows="2">'+(prest?prest.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePrestacao('+(isEdit?prest.id:'null')+')">Salvar</button>';openCadastroModal();}
function savePrestacao(id){var obj={descricao:document.getElementById('prstDesc').value.trim(),valor:parseFloat(document.getElementById('prstValor').value)||0,parcela:document.getElementById('prstParcela').value,vencimento:document.getElementById('prstVenc').value,situacao:document.getElementById('prstSit').value,obs:document.getElementById('prstObs').value};if(!obj.descricao){showToast('Informe a descrição','error');return;}if(!appData.prestacoes)appData.prestacoes=[];if(id){var idx=appData.prestacoes.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.prestacoes[idx]=obj;}}else{obj.id=nextId(appData.prestacoes);appData.prestacoes.push(obj);}saveData();closeCadastroModal();renderPrestacoesPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editPrestacao(id){var p=(appData.prestacoes||[]).find(function(x){return x.id===id;});if(p)openPrestacaoModal(p);}
function deletePrestacao(id){if(!confirm('Excluir prestação?'))return;appData.prestacoes=(appData.prestacoes||[]).filter(function(p){return p.id!==id;});saveData();renderPrestacoesPage();showToast('Excluído!','success');}
function filterPrestacoes(q){var list=appData.prestacoes||[];if(q)list=list.filter(function(p){return(p.descricao||'').toLowerCase().includes(q.toLowerCase());});renderPrestacoesTable(list);}

// ══════════════════════════════════════════════════════════════
// ── PROJETOS ──
// ══════════════════════════════════════════════════════════════
function renderProjetosPage(){var pg=document.getElementById('page-projetos');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>📐 Projetos</h2><button class="btn btn-primary" onclick="openProjetoModal()">+ Novo Projeto</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar projeto..." oninput="filterProjetos(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Cliente</th><th>Valor</th><th>Início</th><th>Prazo</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="projetosBody"></tbody></table></div>';renderProjetosTable(appData.projetos||[]);}
function renderProjetosTable(list){var tbody=document.getElementById('projetosBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum projeto</td></tr>';return;}tbody.innerHTML=list.map(function(p){return'<tr><td>'+(p.nome||'-')+'</td><td>'+(p.cliente||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+formatDate(p.inicio)+'</td><td>'+formatDate(p.prazo)+'</td><td>'+situacaoBadge(p.situacao)+'</td><td><button class="btn btn-sm btn-primary" onclick="editProjeto('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProjeto('+p.id+')">🗑️</button></td></tr>';}).join('');}
function openProjetoModal(proj){var isEdit=!!proj;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(proj&&proj.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Projeto':'Novo Projeto';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prjNome" value="'+(proj?proj.nome:'')+'"></div><div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="prjCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prjValor" value="'+(proj?proj.valor:'')+'" step="0.01"></div></div><div class="form-row"><div class="form-group"><label>Início</label><input type="date" class="form-control" id="prjInicio" value="'+(proj?proj.inicio:'')+'"></div><div class="form-group"><label>Prazo</label><input type="date" class="form-control" id="prjPrazo" value="'+(proj?proj.prazo:'')+'"></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="prjSit"><option value="Em Andamento"'+(proj&&proj.situacao==='Em Andamento'?' selected':'')+'>Em Andamento</option><option value="Concluído"'+(proj&&proj.situacao==='Concluído'?' selected':'')+'>Concluído</option><option value="Cancelado"'+(proj&&proj.situacao==='Cancelado'?' selected':'')+'>Cancelado</option></select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="prjObs" rows="2">'+(proj?proj.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProjeto('+(isEdit?proj.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveProjeto(id){var obj={nome:document.getElementById('prjNome').value.trim(),cliente:document.getElementById('prjCli').value,valor:parseFloat(document.getElementById('prjValor').value)||0,inicio:document.getElementById('prjInicio').value,prazo:document.getElementById('prjPrazo').value,situacao:document.getElementById('prjSit').value,obs:document.getElementById('prjObs').value};if(!obj.nome){showToast('Informe o nome','error');return;}if(!appData.projetos)appData.projetos=[];if(id){var idx=appData.projetos.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.projetos[idx]=obj;}}else{obj.id=nextId(appData.projetos);appData.projetos.push(obj);}saveData();closeCadastroModal();renderProjetosPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editProjeto(id){var p=(appData.projetos||[]).find(function(x){return x.id===id;});if(p)openProjetoModal(p);}
function deleteProjeto(id){if(!confirm('Excluir projeto?'))return;appData.projetos=(appData.projetos||[]).filter(function(p){return p.id!==id;});saveData();renderProjetosPage();showToast('Excluído!','success');}
function filterProjetos(q){var list=appData.projetos||[];if(q)list=list.filter(function(p){return(p.nome||'').toLowerCase().includes(q.toLowerCase());});renderProjetosTable(list);}

// ══════════════════════════════════════════════════════════════
// ── PAG. CLIENTES ──
// ══════════════════════════════════════════════════════════════
function renderPagClientesPage(){var pg=document.getElementById('page-pagclientes');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>🤝 Pag. Clientes</h2><button class="btn btn-primary" onclick="openPagClienteModal()">+ Novo Pagamento</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPagClientes(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Cliente</th><th>Valor</th><th>Data</th><th>F.Pgto</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="pagClientesBody"></tbody></table></div>';renderPagClientesTable(appData.pagClientes||[]);}
function renderPagClientesTable(list){var tbody=document.getElementById('pagClientesBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum pagamento</td></tr>';return;}tbody.innerHTML=list.map(function(p){return'<tr><td>'+(p.cliente||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+formatDate(p.data)+'</td><td>'+(p.formaPagamento||'-')+'</td><td>'+situacaoBadge(p.situacao)+'</td><td><button class="btn btn-sm btn-primary" onclick="editPagCliente('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePagCliente('+p.id+')">🗑️</button></td></tr>';}).join('');}
function openPagClienteModal(pag){var isEdit=!!pag;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(pag&&pag.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');var pgtoOpts=(appData.formasPagamentoVendas||[]).map(function(f){return'<option value="'+f+'"'+(pag&&pag.formaPagamento===f?' selected':'')+'>'+f+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Pagamento':'Novo Pagamento de Cliente';document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="pgCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pgValor" value="'+(pag?pag.valor:'')+'" step="0.01"></div></div><div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="pgData" value="'+(pag?pag.data:todayStr())+'"></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="pgPgto"><option value="">Selecione...</option>'+pgtoOpts+'</select></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="pgSit"><option value="Pago"'+(pag&&pag.situacao==='Pago'?' selected':'')+'>Pago</option><option value="Pendente"'+(pag&&pag.situacao==='Pendente'?' selected':'')+'>Pendente</option><option value="Parcial"'+(pag&&pag.situacao==='Parcial'?' selected':'')+'>Parcial</option></select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="pgObs" rows="2">'+(pag?pag.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePagCliente('+(isEdit?pag.id:'null')+')">Salvar</button>';openCadastroModal();}
function savePagCliente(id){var obj={cliente:document.getElementById('pgCli').value,valor:parseFloat(document.getElementById('pgValor').value)||0,data:document.getElementById('pgData').value,formaPagamento:document.getElementById('pgPgto').value,situacao:document.getElementById('pgSit').value,obs:document.getElementById('pgObs').value};if(!appData.pagClientes)appData.pagClientes=[];if(id){var idx=appData.pagClientes.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.pagClientes[idx]=obj;}}else{obj.id=nextId(appData.pagClientes);appData.pagClientes.push(obj);}saveData();closeCadastroModal();renderPagClientesPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editPagCliente(id){var p=(appData.pagClientes||[]).find(function(x){return x.id===id;});if(p)openPagClienteModal(p);}
function deletePagCliente(id){if(!confirm('Excluir pagamento?'))return;appData.pagClientes=(appData.pagClientes||[]).filter(function(p){return p.id!==id;});saveData();renderPagClientesPage();showToast('Excluído!','success');}
function filterPagClientes(q){var list=appData.pagClientes||[];if(q)list=list.filter(function(p){return(p.cliente||'').toLowerCase().includes(q.toLowerCase());});renderPagClientesTable(list);}

// ══════════════════════════════════════════════════════════════
// ── GARANTIAS ──
// ══════════════════════════════════════════════════════════════
function renderGarantiasPage(){var pg=document.getElementById('page-garantias');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>🛡️ Garantias</h2><button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar garantia..." oninput="filterGarantias(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Cliente</th><th>Início</th><th>Vencimento</th><th>Dias Rest.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="garantiasBody"></tbody></table></div>';renderGarantiasTable(appData.garantias||[]);}
function renderGarantiasTable(list){var tbody=document.getElementById('garantiasBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>';return;}tbody.innerHTML=list.map(function(g){var dias=calcDiasGarantia(g.vencimento);var sitAuto=getGarantiaSituacaoAuto(g.vencimento,g.situacao);return'<tr><td>'+(g.produto||'-')+'</td><td>'+(g.cliente||'-')+'</td><td>'+formatDate(g.inicio)+'</td><td>'+formatDate(g.vencimento)+'</td><td>'+formatDiasGarantia(dias,sitAuto)+'</td><td>'+situacaoBadge(sitAuto)+'</td><td><button class="btn btn-sm btn-primary" onclick="editGarantia('+g.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGarantia('+g.id+')">🗑️</button></td></tr>';}).join('');}
function openGarantiaModal(gar){var isEdit=!!gar;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(gar&&gar.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');var sitOpts=(appData.situacaoGarantia||[]).map(function(s){return'<option value="'+s+'"'+(gar&&gar.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Garantia':'Nova Garantia';document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="garProd" value="'+(gar?gar.produto:'')+'"></div><div class="form-group"><label>Cliente</label><select class="form-control" id="garCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-row"><div class="form-group"><label>Data Início</label><input type="date" class="form-control" id="garInicio" value="'+(gar?gar.inicio:'')+'"></div><div class="form-group"><label>Data Vencimento</label><input type="date" class="form-control" id="garVenc" value="'+(gar?gar.vencimento:'')+'"></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="garSit">'+sitOpts+'</select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="garObs" rows="2">'+(gar?gar.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGarantia('+(isEdit?gar.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveGarantia(id){var obj={produto:document.getElementById('garProd').value.trim(),cliente:document.getElementById('garCli').value,inicio:document.getElementById('garInicio').value,vencimento:document.getElementById('garVenc').value,situacao:document.getElementById('garSit').value,obs:document.getElementById('garObs').value};if(!obj.produto){showToast('Informe o produto','error');return;}if(!appData.garantias)appData.garantias=[];if(id){var idx=appData.garantias.findIndex(function(g){return g.id===id;});if(idx>-1){obj.id=id;appData.garantias[idx]=obj;}}else{obj.id=nextId(appData.garantias);appData.garantias.push(obj);}saveData();closeCadastroModal();renderGarantiasPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editGarantia(id){var g=(appData.garantias||[]).find(function(x){return x.id===id;});if(g)openGarantiaModal(g);}
function deleteGarantia(id){if(!confirm('Excluir garantia?'))return;appData.garantias=(appData.garantias||[]).filter(function(g){return g.id!==id;});saveData();renderGarantiasPage();showToast('Excluído!','success');}
function filterGarantias(q){var list=appData.garantias||[];if(q)list=list.filter(function(g){return(g.produto||'').toLowerCase().includes(q.toLowerCase())||(g.cliente||'').toLowerCase().includes(q.toLowerCase());});renderGarantiasTable(list);}

// ══════════════════════════════════════════════════════════════
// ── NOTAS ENTRADA ──
// ══════════════════════════════════════════════════════════════
function renderNotasEntradaPage(){var pg=document.getElementById('page-notasentrada');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>📥 Notas de Entrada</h2><button class="btn btn-primary" onclick="openNotaEntradaModal()">+ Nova Nota</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar nota..." oninput="filterNotasEntrada(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nº Nota</th><th>Fornecedor</th><th>Valor</th><th>Data</th><th>Ações</th></tr></thead><tbody id="notasEntradaBody"></tbody></table></div>';renderNotasEntradaTable(appData.notasEntrada||[]);}
function renderNotasEntradaTable(list){var tbody=document.getElementById('notasEntradaBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota de entrada</td></tr>';return;}tbody.innerHTML=list.map(function(n){return'<tr><td>'+(n.numero||'-')+'</td><td>'+(n.fornecedor||'-')+'</td><td>'+formatCurrency(n.valor)+'</td><td>'+formatDate(n.data)+'</td><td><button class="btn btn-sm btn-outline" onclick="viewNotaEntrada('+n.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editNotaEntrada('+n.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada('+n.id+')">🗑️</button></td></tr>';}).join('');}
function openNotaEntradaModal(nota){var isEdit=!!nota;var fornOpts=(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(nota&&nota.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota Entrada':'Nova Nota de Entrada';document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="neNum" value="'+(nota?nota.numero||'':'')+'"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="neData" value="'+(nota?nota.data:todayStr())+'"></div></div><div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="neForn"><option value="">Selecione...</option>'+fornOpts+'</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="neValor" value="'+(nota?nota.valor:'')+'" step="0.01"></div></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="neObs" rows="2">'+(nota?nota.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaEntrada('+(isEdit?nota.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveNotaEntrada(id){var obj={numero:document.getElementById('neNum').value,data:document.getElementById('neData').value,fornecedor:document.getElementById('neForn').value,valor:parseFloat(document.getElementById('neValor').value)||0,obs:document.getElementById('neObs').value};if(!appData.notasEntrada)appData.notasEntrada=[];if(id){var idx=appData.notasEntrada.findIndex(function(n){return n.id===id;});if(idx>-1){obj.id=id;appData.notasEntrada[idx]=obj;}}else{obj.id=nextId(appData.notasEntrada);appData.notasEntrada.push(obj);}saveData();closeCadastroModal();renderNotasEntradaPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editNotaEntrada(id){var n=(appData.notasEntrada||[]).find(function(x){return x.id===id;});if(n)openNotaEntradaModal(n);}
function viewNotaEntrada(id){var n=(appData.notasEntrada||[]).find(function(x){return x.id===id;});if(!n)return;document.getElementById('viewModalTitle').textContent='Nota de Entrada';document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nº Nota</span>'+(n.numero||'-')+'</div><div class="detail-item"><span class="detail-label">Data</span>'+formatDate(n.data)+'</div><div class="detail-item"><span class="detail-label">Fornecedor</span>'+(n.fornecedor||'-')+'</div><div class="detail-item"><span class="detail-label">Valor</span>'+formatCurrency(n.valor)+'</div></div>'+(n.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+n.obs+'</div>':'');openViewModal();}
function deleteNotaEntrada(id){if(!confirm('Excluir nota?'))return;appData.notasEntrada=(appData.notasEntrada||[]).filter(function(n){return n.id!==id;});saveData();renderNotasEntradaPage();showToast('Excluído!','success');}
function filterNotasEntrada(q){var list=appData.notasEntrada||[];if(q)list=list.filter(function(n){return(n.numero||'').toLowerCase().includes(q.toLowerCase())||(n.fornecedor||'').toLowerCase().includes(q.toLowerCase());});renderNotasEntradaTable(list);}

// ══════════════════════════════════════════════════════════════
// ── NOTAS SAÍDA ──
// ══════════════════════════════════════════════════════════════
function renderNotasSaidaPage(){var pg=document.getElementById('page-notassaida');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>📤 Notas de Saída</h2><button class="btn btn-primary" onclick="openNotaSaidaModal()">+ Nova Nota</button></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar nota..." oninput="filterNotasSaida(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nº Nota</th><th>Cliente</th><th>Valor</th><th>Data</th><th>Ações</th></tr></thead><tbody id="notasSaidaBody"></tbody></table></div>';renderNotasSaidaTable(appData.notasSaida||[]);}
function renderNotasSaidaTable(list){var tbody=document.getElementById('notasSaidaBody');if(!tbody)return;if(list.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota de saída</td></tr>';return;}tbody.innerHTML=list.map(function(n){return'<tr><td>'+(n.numero||'-')+'</td><td>'+(n.cliente||'-')+'</td><td>'+formatCurrency(n.valor)+'</td><td>'+formatDate(n.data)+'</td><td><button class="btn btn-sm btn-outline" onclick="viewNotaSaida('+n.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editNotaSaida('+n.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaSaida('+n.id+')">🗑️</button></td></tr>';}).join('');}
function openNotaSaidaModal(nota){var isEdit=!!nota;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(nota&&nota.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota Saída':'Nova Nota de Saída';document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="nsNum" value="'+(nota?nota.numero||'':'')+'"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="nsData" value="'+(nota?nota.data:todayStr())+'"></div></div><div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="nsCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="nsValor" value="'+(nota?nota.valor:'')+'" step="0.01"></div></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="nsObs" rows="2">'+(nota?nota.obs||'':'')+'</textarea></div>';document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaSaida('+(isEdit?nota.id:'null')+')">Salvar</button>';openCadastroModal();}
function saveNotaSaida(id){var obj={numero:document.getElementById('nsNum').value,data:document.getElementById('nsData').value,cliente:document.getElementById('nsCli').value,valor:parseFloat(document.getElementById('nsValor').value)||0,obs:document.getElementById('nsObs').value};if(!appData.notasSaida)appData.notasSaida=[];if(id){var idx=appData.notasSaida.findIndex(function(n){return n.id===id;});if(idx>-1){obj.id=id;appData.notasSaida[idx]=obj;}}else{obj.id=nextId(appData.notasSaida);appData.notasSaida.push(obj);}saveData();closeCadastroModal();renderNotasSaidaPage();showToast(id?'Atualizado!':'Cadastrado!','success');}
function editNotaSaida(id){var n=(appData.notasSaida||[]).find(function(x){return x.id===id;});if(n)openNotaSaidaModal(n);}
function viewNotaSaida(id){var n=(appData.notasSaida||[]).find(function(x){return x.id===id;});if(!n)return;document.getElementById('viewModalTitle').textContent='Nota de Saída';document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nº Nota</span>'+(n.numero||'-')+'</div><div class="detail-item"><span class="detail-label">Data</span>'+formatDate(n.data)+'</div><div class="detail-item"><span class="detail-label">Cliente</span>'+(n.cliente||'-')+'</div><div class="detail-item"><span class="detail-label">Valor</span>'+formatCurrency(n.valor)+'</div></div>'+(n.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+n.obs+'</div>':'');openViewModal();}
function deleteNotaSaida(id){if(!confirm('Excluir nota?'))return;appData.notasSaida=(appData.notasSaida||[]).filter(function(n){return n.id!==id;});saveData();renderNotasSaidaPage();showToast('Excluído!','success');}
function filterNotasSaida(q){var list=appData.notasSaida||[];if(q)list=list.filter(function(n){return(n.numero||'').toLowerCase().includes(q.toLowerCase())||(n.cliente||'').toLowerCase().includes(q.toLowerCase());});renderNotasSaidaTable(list);}

// ══// ══════════════════════════════════════════════════════════════
// ── RECEITAS MEI ──
// ══════════════════════════════════════════════════════════════
function renderReceitasMeiPage(){
  var pg=document.getElementById('page-receitasmei');if(!pg)return;
  var meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var mesesKey=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var selOpts='<option value="">Selecione o mês</option>';
  selOpts+='<option value="todos">📊 Todos (Resumo Anual)</option>';
  meses.forEach(function(m,i){ selOpts+='<option value="'+mesesKey[i]+'">'+m+'</option>'; });
  var selectedMei=pg.getAttribute('data-mei-mes')||'';
  pg.innerHTML=
    '<div class="page-header"><h2>📄 Receitas MEI</h2></div>'+
    '<div style="margin-bottom:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">'+
      '<select class="form-control" id="meiMesSelect" onchange="changeMeiMes(this.value)" style="max-width:300px">'+selOpts+'</select>'+
      '<button class="btn btn-primary" onclick="printMeiPage()">🖨️ Imprimir</button>'+
    '</div>'+
    '<div id="meiContent"></div>';
  var sel=document.getElementById('meiMesSelect');
  if(sel&&selectedMei){sel.value=selectedMei;changeMeiMes(selectedMei);}
}

function changeMeiMes(val){
  var pg=document.getElementById('page-receitasmei');
  if(pg) pg.setAttribute('data-mei-mes',val);
  var container=document.getElementById('meiContent');if(!container)return;
  if(!val){container.innerHTML='<p style="color:var(--text-muted)">Selecione um mês ou "Todos" para ver o resumo anual.</p>';return;}
  if(val==='todos'){renderMeiAnual(container);return;}
  renderMeiMensal(container,val);
}

function getMeiDadosMes(mesKey){
  var meses=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var mi=meses.indexOf(mesKey);
  var mesNum=mi+1;
  var ano=new Date().getFullYear();
  var vendas=(appData.vendas||[]).filter(function(v){
    if(!v.data) return false;
    var p=v.data.split('-');
    return parseInt(p[1])===mesNum && parseInt(p[0])===ano;
  });
  var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[mesKey])?appData.fluxoCaixa[mesKey]:[];
  var entradas=lancs.filter(function(l){return l.tipo==='entrada';});

  // I - Revenda sem nota (vendas tipo Revenda)
  var revendaSemNota=vendas.filter(function(v){
    return (v.tipoVenda||'').toLowerCase().includes('revenda');
  }).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  // II - Revenda com nota
  var revendaComNota=0;
  // III - Total revenda
  var totalRevenda=revendaSemNota+revendaComNota;

  // IV - Industria sem nota
  var industriaSemNota=0;
  // V - Industria com nota
  var industriaComNota=0;
  // VI - Total industria
  var totalIndustria=industriaSemNota+industriaComNota;

  // VII - Serviço sem nota (entradas de fluxo categoria serviço)
  var servicoSemNota=entradas.filter(function(l){
    var cat=(l.categoria||'').toLowerCase();
    return cat.includes('serviço')||cat.includes('servico');
  }).reduce(function(s,l){return s+(l.valor||0);},0);
  // VIII - Serviço com nota
  var servicoComNota=0;
  // IX - Total serviço
  var totalServico=servicoSemNota+servicoComNota;

  // Vendas diretas vão para I (revenda sem nota) por padrão
  var diretaSemNota=vendas.filter(function(v){
    return !(v.tipoVenda||'').toLowerCase().includes('revenda');
  }).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  revendaSemNota+=diretaSemNota;
  totalRevenda=revendaSemNota+revendaComNota;

  // Outras entradas de fluxo (não serviço) vão para I
  var outrasEntradas=entradas.filter(function(l){
    var cat=(l.categoria||'').toLowerCase();
    return !cat.includes('serviço')&&!cat.includes('servico')&&!cat.includes('salário')&&!cat.includes('salario');
  }).reduce(function(s,l){return s+(l.valor||0);},0);
  revendaSemNota+=outrasEntradas;
  totalRevenda=revendaSemNota+revendaComNota;

  // X - Total geral
  var totalGeral=totalRevenda+totalIndustria+totalServico;

  return {
    revendaSemNota:revendaSemNota,revendaComNota:revendaComNota,totalRevenda:totalRevenda,
    industriaSemNota:industriaSemNota,industriaComNota:industriaComNota,totalIndustria:totalIndustria,
    servicoSemNota:servicoSemNota,servicoComNota:servicoComNota,totalServico:totalServico,
    totalGeral:totalGeral
  };
}

function renderMeiMensal(container,mesKey){
  var meses=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var mesesNome=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var mesesNomeFull=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var mi=meses.indexOf(mesKey);
  var mesNome=mi>-1?mesesNomeFull[mi]:mesKey;
  var ano=new Date().getFullYear();
  var emp=appData.empresa||{};
  var d=getMeiDadosMes(mesKey);

  var assinaturaHtml='';
  if(emp.assinatura){
    assinaturaHtml='<img src="'+emp.assinatura+'" style="max-height:50px;max-width:180px;object-fit:contain">';
  } else {
    assinaturaHtml='<div style="min-width:180px;border-bottom:1px solid #000;height:40px"></div>';
  }

  // Estilo da tabela idêntico à imagem
  var cs='border:1px solid #000;padding:5px 8px;color:#000;font-size:11px;'; // cell style
  var hs='border:1px solid #000;padding:6px 8px;color:#000;font-size:11px;font-weight:700;background:#e0e0e0;'; // header style
  var vs='border:1px solid #000;padding:5px 8px;color:#000;font-size:11px;text-align:right;white-space:nowrap;'; // value style
  var ts='border:1px solid #000;padding:6px 8px;color:#000;font-size:12px;font-weight:700;text-align:right;white-space:nowrap;'; // total style

  container.innerHTML=
  '<div id="meiPrintArea" style="background:#fff;color:#000;padding:20px;border-radius:4px;max-width:210mm">'+
    '<table style="width:100%;border-collapse:collapse;border:2px solid #000">'+
      // Cabeçalho
      '<tr><td colspan="2" style="'+hs+'text-align:center;font-size:13px;border:2px solid #000">RELATÓRIO MENSAL DAS RECEITAS BRUTAS</td></tr>'+
      '<tr><td style="'+cs+'width:30%">CNPJ:</td><td style="'+cs+'">'+(emp.cnpj||'')+'</td></tr>'+
      '<tr><td style="'+cs+'">Empreendedor individual:</td><td style="'+cs+'">'+(emp.cnpj?emp.cnpj.replace(/[.\-\/]/g,'').substring(0,10):'')+' '+(emp.empreendedor||emp.nome||'')+'</td></tr>'+
      '<tr><td style="'+cs+'">Período de apuração:</td><td style="'+cs+'">'+mesNome.toUpperCase()+' DE '+ano+'</td></tr>'+

      // SEÇÃO 1 - REVENDA DE MERCADORIAS (COMÉRCIO)
      '<tr><td colspan="2" style="'+hs+'background:#c0c0c0;font-size:11px;border:2px solid #000">RECEITA BRUTA MENSAL – REVENDA DE MERCADORIAS (COMÉRCIO)</td></tr>'+
      '<tr><td style="'+cs+'">I – Revenda de mercadorias com dispensa de emissão de documento fiscal</td><td style="'+vs+'">'+formatCurrency(d.revendaSemNota)+'</td></tr>'+
      '<tr><td style="'+cs+'">II – Revenda de mercadorias com documento fiscal emitido</td><td style="'+vs+'">'+formatCurrency(d.revendaComNota)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">III – Total das receitas com revenda de mercadorias (I + II)</td><td style="'+ts+'">'+formatCurrency(d.totalRevenda)+'</td></tr>'+

      // SEÇÃO 2 - VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)
      '<tr><td colspan="2" style="'+hs+'background:#c0c0c0;font-size:11px;border:2px solid #000">RECEITA BRUTA MENSAL – VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)</td></tr>'+
      '<tr><td style="'+cs+'">IV – Venda de produtos industrializados com dispensa de emissão de documento fiscal</td><td style="'+vs+'">'+formatCurrency(d.industriaSemNota)+'</td></tr>'+
      '<tr><td style="'+cs+'">V – Venda de produtos industrializados com documento fiscal emitido</td><td style="'+vs+'">'+formatCurrency(d.industriaComNota)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">VI – Total das receitas com venda de produtos industrializados (IV + V)</td><td style="'+ts+'">'+formatCurrency(d.totalIndustria)+'</td></tr>'+

      // SEÇÃO 3 - PRESTAÇÃO DE SERVIÇOS
      '<tr><td colspan="2" style="'+hs+'background:#c0c0c0;font-size:11px;border:2px solid #000">RECEITA BRUTA MENSAL – PRESTAÇÃO DE SERVIÇOS</td></tr>'+
      '<tr><td style="'+cs+'">VII – Receita com prestação de serviços com dispensa de emissão de documento fiscal</td><td style="'+vs+'">'+formatCurrency(d.servicoSemNota)+'</td></tr>'+
      '<tr><td style="'+cs+'">VIII – Receita com prestação de serviços com documento fiscal emitido</td><td style="'+vs+'">'+formatCurrency(d.servicoComNota)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">IX – Total das receitas com prestação de serviços (VII + VIII)</td><td style="'+ts+'">'+formatCurrency(d.totalServico)+'</td></tr>'+

      // TOTAL GERAL
      '<tr><td style="'+hs+'font-size:12px;border:2px solid #000">X - Total geral das receitas brutas no mês (III + VI + IX)</td><td style="border:2px solid #000;padding:8px;color:#000;font-size:14px;font-weight:800;text-align:right;white-space:nowrap">'+formatCurrency(d.totalGeral)+'</td></tr>'+

      // LOCAL E DATA + ASSINATURA
      '<tr>'+
        '<td style="'+cs+'vertical-align:top">LOCAL E DATA:<br><br>'+(emp.cidade||'Franca, SP')+' - 01 de '+mesNome+' de '+ano+'</td>'+
        '<td style="'+cs+'text-align:center;vertical-align:top">ASSINATURA DO EMPRESÁRIO:<br><br>'+assinaturaHtml+'</td>'+
      '</tr>'+

      // ANEXOS
      '<tr><td colspan="2" style="'+cs+'font-size:9px">'+
        'ENCONTRAM-SE ANEXADOS A ESTE RELATÓRIO:<br>'+
        '- Os documentos fiscais comprobatórios das entradas de mercadorias e serviços tomados referentes ao período.<br>'+
        '- As notas fiscais relativas às operações ou prestações realizadas eventualmente emitidas.'+
      '</td></tr>'+
    '</table>'+
  '</div>';
}

function renderMeiAnual(container){
  var ano=new Date().getFullYear();
  var meses=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var mesesNome=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var emp=appData.empresa||{};

  var totalAnualRevenda=0,totalAnualIndustria=0,totalAnualServico=0,totalAnualGeral=0;
  var dadosMeses=[];

  meses.forEach(function(mesKey,i){
    var d=getMeiDadosMes(mesKey);
    totalAnualRevenda+=d.totalRevenda;
    totalAnualIndustria+=d.totalIndustria;
    totalAnualServico+=d.totalServico;
    totalAnualGeral+=d.totalGeral;
    dadosMeses.push(d);
  });

  var cs='border:1px solid #000;padding:4px 6px;color:#000;font-size:10px;';
  var hs='border:1px solid #000;padding:5px 6px;color:#000;font-size:10px;font-weight:700;background:#e0e0e0;';
  var vs='border:1px solid #000;padding:4px 6px;color:#000;font-size:10px;text-align:right;white-space:nowrap;';

  // Tabela resumo mensal
  var resumoRows='';
  mesesNome.forEach(function(m,i){
    var d=dadosMeses[i];
    resumoRows+='<tr>'+
      '<td style="'+cs+'font-weight:600">'+m+'</td>'+
      '<td style="'+vs+'">'+(d.totalRevenda?formatCurrency(d.totalRevenda):'R$ 0,00')+'</td>'+
      '<td style="'+vs+'">'+(d.totalIndustria?formatCurrency(d.totalIndustria):'R$ 0,00')+'</td>'+
      '<td style="'+vs+'">'+(d.totalServico?formatCurrency(d.totalServico):'R$ 0,00')+'</td>'+
      '<td style="'+vs+'font-weight:700">'+formatCurrency(d.totalGeral)+'</td>'+
    '</tr>';
  });

  // Limite MEI
  var limiteMei=81000;
  var restante=limiteMei-totalAnualGeral;
  var percentual=totalAnualGeral>0?((totalAnualGeral/limiteMei)*100).toFixed(1):0;

  // Parcela isenta IRPF
  var isentoComercio=totalAnualRevenda*0.08;
  var isentoIndustria=totalAnualIndustria*0.08;
  var isentoServico=totalAnualServico*0.32;
  var totalIsento=isentoComercio+isentoIndustria+isentoServico;

  var assinaturaHtml='';
  if(emp.assinatura){
    assinaturaHtml='<img src="'+emp.assinatura+'" style="max-height:40px;max-width:160px;object-fit:contain">';
  } else {
    assinaturaHtml='<div style="min-width:160px;border-bottom:1px solid #000;height:35px"></div>';
  }

  container.innerHTML=
  '<div id="meiPrintArea" style="background:#fff;color:#000;padding:16px;border-radius:4px;max-width:210mm">'+

    // ═══ RESUMO ANUAL ═══
    '<table style="width:100%;border-collapse:collapse;border:2px solid #000;margin-bottom:12px">'+
      '<tr><td colspan="5" style="'+hs+'text-align:center;font-size:13px;border:2px solid #000">RESUMO ANUAL DAS RECEITAS BRUTAS — MEI — '+ano+'</td></tr>'+
      '<tr><td style="'+cs+'">CNPJ:</td><td colspan="4" style="'+cs+'">'+(emp.cnpj||'')+'</td></tr>'+
      '<tr><td style="'+cs+'">Empreendedor:</td><td colspan="4" style="'+cs+'">'+(emp.empreendedor||emp.nome||'')+'</td></tr>'+
    '</table>'+

    '<table style="width:100%;border-collapse:collapse;border:2px solid #000;margin-bottom:12px">'+
      '<thead>'+
        '<tr style="background:#c0c0c0">'+
          '<th style="'+hs+'text-align:center">Mês</th>'+
          '<th style="'+hs+'text-align:center">Revenda<br>Mercadorias (III)</th>'+
          '<th style="'+hs+'text-align:center">Venda Prod.<br>Industrializados (VI)</th>'+
          '<th style="'+hs+'text-align:center">Prestação de<br>Serviços (IX)</th>'+
          '<th style="'+hs+'text-align:center">Total Geral<br>do Mês (X)</th>'+
        '</tr>'+
      '</thead>'+
      '<tbody>'+resumoRows+'</tbody>'+
      '<tfoot>'+
        '<tr style="background:#e0e0e0">'+
          '<td style="'+hs+'text-align:right;font-size:11px">TOTAL ANUAL:</td>'+
          '<td style="border:1px solid #000;padding:5px 6px;color:#000;font-size:11px;font-weight:800;text-align:right">'+formatCurrency(totalAnualRevenda)+'</td>'+
          '<td style="border:1px solid #000;padding:5px 6px;color:#000;font-size:11px;font-weight:800;text-align:right">'+formatCurrency(totalAnualIndustria)+'</td>'+
          '<td style="border:1px solid #000;padding:5px 6px;color:#000;font-size:11px;font-weight:800;text-align:right">'+formatCurrency(totalAnualServico)+'</td>'+
          '<td style="border:2px solid #000;padding:5px 6px;color:#000;font-size:13px;font-weight:800;text-align:right">'+formatCurrency(totalAnualGeral)+'</td>'+
        '</tr>'+
      '</tfoot>'+
    '</table>'+

    // ═══ SITUAÇÃO MEI ═══
    '<table style="width:100%;border-collapse:collapse;border:2px solid #000;margin-bottom:12px">'+
      '<tr><td colspan="2" style="'+hs+'text-align:center;font-size:11px;background:#c0c0c0;border:2px solid #000">SITUAÇÃO DO LIMITE MEI — '+ano+'</td></tr>'+
      '<tr><td style="'+cs+'width:60%;font-weight:600">Receita Bruta Total Anual</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:12px;font-weight:700;text-align:right">'+formatCurrency(totalAnualGeral)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">Limite MEI Anual</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:12px;font-weight:700;text-align:right">'+formatCurrency(limiteMei)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">Restante disponível</td><td style="border:1px solid #000;padding:5px 8px;color:'+(restante>=0?'#006600':'#cc0000')+';font-size:12px;font-weight:700;text-align:right">'+formatCurrency(restante)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">Percentual utilizado</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:12px;font-weight:700;text-align:right">'+percentual+'%</td></tr>'+
      '<tr><td colspan="2" style="'+cs+'text-align:center;font-weight:700;font-size:11px">'+(totalAnualGeral>limiteMei?'⚠️ ULTRAPASSOU O LIMITE MEI!':'✅ Dentro do limite MEI')+'</td></tr>'+
    '</table>'+

    // ═══ DECLARAÇÃO ANUAL (DASN-SIMEI) ═══
    '<table style="width:100%;border-collapse:collapse;border:2px solid #000;margin-bottom:12px">'+
      '<tr><td colspan="2" style="'+hs+'text-align:center;font-size:11px;background:#c0c0c0;border:2px solid #000">DADOS PARA DECLARAÇÃO ANUAL DO SIMEI (DASN-SIMEI) — '+ano+'</td></tr>'+
      '<tr><td style="'+cs+'width:60%;font-weight:600">Receita Bruta Total — Comércio (Revenda de Mercadorias)</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:11px;font-weight:700;text-align:right">'+formatCurrency(totalAnualRevenda)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">Receita Bruta Total — Indústria (Venda Prod. Industrializados)</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:11px;font-weight:700;text-align:right">'+formatCurrency(totalAnualIndustria)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">Receita Bruta Total — Prestação de Serviços</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:11px;font-weight:700;text-align:right">'+formatCurrency(totalAnualServico)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:700;font-size:11px">RECEITA BRUTA TOTAL (Todas as Atividades)</td><td style="border:2px solid #000;padding:6px 8px;color:#000;font-size:13px;font-weight:800;text-align:right">'+formatCurrency(totalAnualGeral)+'</td></tr>'+
      '<tr><td style="'+cs+'font-weight:600">Contratou empregado(a) no período?</td><td style="'+cs+'text-align:center">( &nbsp; ) Sim &nbsp;&nbsp;&nbsp;&nbsp; ( &nbsp; ) Não</td></tr>'+
    '</table>'+

    // ═══ PARCELA ISENTA IRPF ═══
    '<table style="width:100%;border-collapse:collapse;border:2px solid #000;margin-bottom:12px">'+
      '<tr><td colspan="3" style="'+hs+'text-align:center;font-size:11px;background:#c0c0c0;border:2px solid #000">PARCELA ISENTA DO IRPF — RENDIMENTOS DO MEI — '+ano+'</td></tr>'+
      '<tr style="background:#e0e0e0"><th style="'+hs+'text-align:left">Atividade</th><th style="'+hs+'text-align:center">Receita × Alíquota</th><th style="'+hs+'text-align:right">Parcela Isenta</th></tr>'+
      '<tr><td style="'+cs+'">Comércio / Revenda (8%)</td><td style="'+cs+'text-align:center">'+formatCurrency(totalAnualRevenda)+' × 8%</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:11px;font-weight:700;text-align:right">'+formatCurrency(isentoComercio)+'</td></tr>'+
      '<tr><td style="'+cs+'">Indústria (8%)</td><td style="'+cs+'text-align:center">'+formatCurrency(totalAnualIndustria)+' × 8%</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:11px;font-weight:700;text-align:right">'+formatCurrency(isentoIndustria)+'</td></tr>'+
      '<tr><td style="'+cs+'">Prestação de Serviços (32%)</td><td style="'+cs+'text-align:center">'+formatCurrency(totalAnualServico)+' × 32%</td><td style="border:1px solid #000;padding:5px 8px;color:#000;font-size:11px;font-weight:700;text-align:right">'+formatCurrency(isentoServico)+'</td></tr>'+
      '<tr style="background:#e0e0e0"><td colspan="2" style="'+hs+'text-align:right;font-size:11px">TOTAL PARCELA ISENTA (Rendimentos Isentos e Não Tributáveis):</td><td style="border:2px solid #000;padding:6px 8px;color:#000;font-size:13px;font-weight:800;text-align:right">'+formatCurrency(totalIsento)+'</td></tr>'+
    '</table>'+

    '<div style="font-size:9px;color:#333;border:1px solid #999;padding:8px;margin-bottom:12px;background:#f9f9f0">'+
      '<strong>📌 Instruções para o IRPF:</strong><br>'+
      'Preencha o valor de <strong>'+formatCurrency(totalIsento)+'</strong> no campo "Rendimentos Isentos e Não Tributáveis" da sua declaração de Imposto de Renda Pessoa Física.<br>'+
      'O restante (Receita Total – Parcela Isenta – Despesas comprovadas) deve ser declarado como "Rendimentos Tributáveis recebidos de PJ".'+
    '</div>'+

    // LOCAL E DATA + ASSINATURA
    '<table style="width:100%;border-collapse:collapse;border:2px solid #000">'+
      '<tr>'+
        '<td style="'+cs+'vertical-align:top;width:50%">LOCAL E DATA:<br><br>'+(emp.cidade||'Franca, SP')+', ____/____/'+ano+'</td>'+
        '<td style="'+cs+'text-align:center;vertical-align:top">ASSINATURA DO EMPRESÁRIO:<br><br>'+assinaturaHtml+'</td>'+
      '</tr>'+
    '</table>'+

  '</div>';
}

function printMeiPage(){
  var area=document.getElementById('meiPrintArea');
  if(!area){showToast('Selecione um mês ou "Todos" primeiro','error');return;}
  var win=window.open('','','width=900,height=700');
  win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receitas MEI</title>'+
    '<style>@page{size:A4 portrait;margin:8mm 10mm}body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:0;color:#000;background:#fff}table{width:100%;page-break-inside:auto}tr{page-break-inside:avoid}img{max-height:50px}</style>'+
    '</head><body>'+area.innerHTML+'</body></html>');
  win.document.close();
  setTimeout(function(){win.print();},500);
}

// ══════════════════════════════════════════════════════════════
// ── RELATÓRIOS ──
// ══════════════════════════════════════════════════════════════
var relAnoSel = new Date().getFullYear();
var relMesSel = -1;
var relFornSel = '';
var relCliSel = '';
var relTipoRel = 'projecaoLucro';

function renderRelatoriosPage(){
  var pg=document.getElementById('page-relatorios');if(!pg)return;
  var mesesLabel=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var mesOpts='<option value="-1">Todos os Meses</option>'+mesesLabel.map(function(m,i){return'<option value="'+i+'"'+(i===relMesSel?' selected':'')+'>'+m+'</option>';}).join('');
  var fornOpts='<option value="">Todos Fornecedores</option>'+(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(relFornSel===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');
  var cliOpts='<option value="">Todos Clientes</option>'+(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(relCliSel===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');

  pg.innerHTML=
    '<div class="page-header"><h2>📊 Relatórios</h2></div>'+
    '<div class="filter-bar" style="flex-wrap:wrap;gap:8px;margin-bottom:16px">'+
      '<select class="form-control" style="max-width:120px" onchange="relAnoSel=parseInt(this.value);updateRelatorio()"><option value="2025"'+(relAnoSel===2025?' selected':'')+'>2025</option><option value="2026"'+(relAnoSel===2026?' selected':'')+'>2026</option><option value="2027"'+(relAnoSel===2027?' selected':'')+'>2027</option></select>'+
      '<select class="form-control" style="max-width:180px" onchange="relMesSel=parseInt(this.value);updateRelatorio()">'+mesOpts+'</select>'+
      '<select class="form-control" style="max-width:200px" onchange="relFornSel=this.value;updateRelatorio()">'+fornOpts+'</select>'+
      '<select class="form-control" style="max-width:200px" onchange="relCliSel=this.value;updateRelatorio()">'+cliOpts+'</select>'+
      '<select class="form-control" style="max-width:200px" onchange="relTipoRel=this.value;updateRelatorio()"><option value="projecaoLucro"'+(relTipoRel==='projecaoLucro'?' selected':'')+'>Projeção de Lucro</option><option value="comprasForn"'+(relTipoRel==='comprasForn'?' selected':'')+'>Compras por Fornecedor</option><option value="vendasCli"'+(relTipoRel==='vendasCli'?' selected':'')+'>Vendas por Cliente</option><option value="fluxoMensal"'+(relTipoRel==='fluxoMensal'?' selected':'')+'>Fluxo Mensal</option><option value="boletosRel"'+(relTipoRel==='boletosRel'?' selected':'')+'>Boletos</option><option value="chequesRel"'+(relTipoRel==='chequesRel'?' selected':'')+'>Cheques</option><option value="estoqueRel"'+(relTipoRel==='estoqueRel'?' selected':'')+'>Estoque</option></select>'+
    '</div>'+
    '<div id="relatorioContent"></div>';
  updateRelatorio();
}

function updateRelatorio(){
  var container=document.getElementById('relatorioContent');if(!container)return;

  if(relTipoRel==='projecaoLucro'){
    var compras=filtrarPorAnoMes(appData.compras||[]);
    var vendas=filtrarPorAnoMes(appData.vendas||[]);
    if(relFornSel) compras=compras.filter(function(c){return c.fornecedor===relFornSel;});
    if(relCliSel) vendas=vendas.filter(function(v){return v.cliente===relCliSel;});
    var totalCompras=compras.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
    var totalVendas=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
    var resultado=totalVendas-totalCompras;
    var qtdVendedores=(appData.vendedores||[]).length||1;
    var resultadoSalario=resultado/qtdVendedores;
    container.innerHTML=
      '<div class="dashboard-grid">'+
        '<div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">'+formatCurrency(totalVendas)+'</div><div class="card-sub">'+vendas.length+' venda(s)</div></div>'+
        '<div class="card"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">'+formatCurrency(totalCompras)+'</div><div class="card-sub">'+compras.length+' compra(s)</div></div>'+
        '<div class="card" style="border-left:3px solid '+(resultado>=0?'var(--success)':'var(--danger)')+'"><div class="card-header"><span>Resultado Total</span></div><div class="card-value '+(resultado>=0?'text-success':'text-danger')+'">'+formatCurrency(resultado)+'</div></div>'+
        '<div class="card" style="border-left:3px solid #805ad5"><div class="card-header"><span>Resultado Salário</span></div><div class="card-value" style="color:#805ad5">'+formatCurrency(resultadoSalario)+'</div><div class="card-sub">÷ '+qtdVendedores+' vendedor(es)</div></div>'+
      '</div>';
  } else if(relTipoRel==='comprasForn'){
    var compras=filtrarPorAnoMes(appData.compras||[]);
    if(relFornSel) compras=compras.filter(function(c){return c.fornecedor===relFornSel;});
    var total=compras.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
    var pago=compras.filter(function(c){return c.situacao==='Pago';}).reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
    var devendo=compras.filter(function(c){return c.situacao==='Devendo';}).reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
    var rows=compras.map(function(c){return'<tr><td>'+formatDate(c.data)+'</td><td>'+(c.produto||'-')+'</td><td>'+(c.fornecedor||'-')+'</td><td>'+formatCurrency((c.quantidade||1)*(c.valorUnit||0))+'</td><td>'+situacaoBadge(c.situacao)+'</td></tr>';}).join('');
    container.innerHTML='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+compras.length+' registros</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">'+formatCurrency(pago)+'</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">'+formatCurrency(devendo)+'</div></div></div><div class="table-responsive" style="margin-top:16px"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Total</th><th>Situação</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhum registro</td></tr>')+'</tbody></table></div>';
  } else if(relTipoRel==='vendasCli'){
    var vendas=filtrarPorAnoMes(appData.vendas||[]);
    if(relCliSel) vendas=vendas.filter(function(v){return v.cliente===relCliSel;});
    var total=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
    var recebido=vendas.filter(function(v){return v.situacao==='Pago';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
    var devendo=vendas.filter(function(v){return v.situacao==='Devendo';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
    var rows=vendas.map(function(v){return'<tr><td>'+formatDate(v.data)+'</td><td>'+(v.produto||'-')+'</td><td>'+(v.cliente||'-')+'</td><td>'+formatCurrency((v.quantidade||1)*(v.valorUnit||0))+'</td><td>'+situacaoBadge(v.situacao)+'</td></tr>';}).join('');
    container.innerHTML='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+vendas.length+' registros</div></div><div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">'+formatCurrency(recebido)+'</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">'+formatCurrency(devendo)+'</div></div></div><div class="table-responsive" style="margin-top:16px"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Total</th><th>Situação</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhum registro</td></tr>')+'</tbody></table></div>';
  } else if(relTipoRel==='fluxoMensal'){
    var mesesKeys=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    var mesesLabel=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    var rows='';var totalEnt=0;var totalSai=0;
    mesesKeys.forEach(function(m,i){
      if(relMesSel>-1 && i!==relMesSel) return;
      var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[m])?appData.fluxoCaixa[m]:[];
      var ent=lancs.filter(function(l){return l.tipo==='entrada';}).reduce(function(s,l){return s+(l.valor||0);},0);
      var sai=lancs.filter(function(l){return l.tipo==='saida';}).reduce(function(s,l){return s+(l.valor||0);},0);
      totalEnt+=ent;totalSai+=sai;
      rows+='<tr><td>'+mesesLabel[i]+'</td><td class="text-success">'+formatCurrency(ent)+'</td><td class="text-danger">'+formatCurrency(sai)+'</td><td class="'+(ent-sai>=0?'text-success':'text-danger')+'">'+formatCurrency(ent-sai)+'</td></tr>';
    });
    container.innerHTML='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Entradas</span></div><div class="card-value text-success">'+formatCurrency(totalEnt)+'</div></div><div class="card"><div class="card-header"><span>Saídas</span></div><div class="card-value text-danger">'+formatCurrency(totalSai)+'</div></div><div class="card"><div class="card-header"><span>Saldo</span></div><div class="card-value '+(totalEnt-totalSai>=0?'text-success':'text-danger')+'">'+formatCurrency(totalEnt-totalSai)+'</div></div></div><div class="table-responsive" style="margin-top:16px"><table class="table"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  } else if(relTipoRel==='boletosRel'){
    var items=appData.boletos||[];
    var total=items.reduce(function(s,b){return s+(b.valor||0);},0);
    var pago=items.filter(function(b){return b.situacao==='Pago';}).reduce(function(s,b){return s+(b.valor||0);},0);
    var pend=items.filter(function(b){return b.situacao!=='Pago';}).reduce(function(s,b){return s+(b.valor||0);},0);
    var rows=items.map(function(b){return'<tr><td>'+(b.descricao||'-')+'</td><td>'+formatCurrency(b.valor)+'</td><td>'+formatDate(b.vencimento)+'</td><td>'+situacaoBadge(b.situacao)+'</td></tr>';}).join('');
    container.innerHTML='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">'+formatCurrency(pago)+'</div></div><div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-danger">'+formatCurrency(pend)+'</div></div></div><div class="table-responsive" style="margin-top:16px"><table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Situação</th></tr></thead><tbody>'+(rows||'<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum</td></tr>')+'</tbody></table></div>';
  } else if(relTipoRel==='chequesRel'){
    var items=appData.cheques||[];
    var total=items.reduce(function(s,c){return s+(c.valor||0);},0);
    var rows=items.map(function(c){return'<tr><td>'+(c.numero||'-')+'</td><td>'+(c.emitente||'-')+'</td><td>'+formatCurrency(c.valor)+'</td><td>'+formatDate(c.bomPara)+'</td><td>'+situacaoBadge(c.situacao)+'</td></tr>';}).join('');
    container.innerHTML='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+items.length+' cheque(s)</div></div></div><div class="table-responsive" style="margin-top:16px"><table class="table"><thead><tr><th>Nº</th><th>Emitente</th><th>Valor</th><th>Bom Para</th><th>Situação</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhum</td></tr>')+'</tbody></table></div>';
  } else if(relTipoRel==='estoqueRel'){
    var items=appData.estoque||[];
    var totalVal=items.reduce(function(s,e){return s+((e.quantidade||0)*(e.valorUnit||0));},0);
    var rows=items.map(function(e){return'<tr><td>'+(e.produto||'-')+'</td><td>'+(e.quantidade||0)+'</td><td>'+formatCurrency(e.valorUnit)+'</td><td>'+formatCurrency((e.quantidade||0)*(e.valorUnit||0))+'</td></tr>';}).join('');
    container.innerHTML='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Itens</span></div><div class="card-value">'+items.length+'</div></div><div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value text-success">'+formatCurrency(totalVal)+'</div></div></div><div class="table-responsive" style="margin-top:16px"><table class="table"><thead><tr><th>Produto</th><th>Qtd</th><th>V.Unit</th><th>Total</th></tr></thead><tbody>'+(rows||'<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum</td></tr>')+'</tbody></table></div>';
  }
}

function filtrarPorAnoMes(arr){
  return arr.filter(function(item){
    if(!item.data) return false;
    var p=item.data.split('-');
    var ano=parseInt(p[0]);var mes=parseInt(p[1])-1;
    if(ano!==relAnoSel) return false;
    if(relMesSel>-1 && mes!==relMesSel) return false;
    return true;
  });
}

// ══════════════════════════════════════════════════════════════
// ── CONFIGURAÇÕES (drag & drop empilhado em todas as seções) ──
// ══════════════════════════════════════════════════════════════
function renderConfiguracoesPage(){
  var pg=document.getElementById('page-configuracoes');if(!pg)return;
  var emp=appData.empresa||{};

  // ─ Empresa ─
  var empresaHtml=
    '<div class="cfg-section">'+
      '<div class="cfg-section-header"><span class="cfg-section-icon">🏢</span><h3>Dados da Empresa</h3></div>'+
      '<div class="cfg-section-body">'+
        '<div class="form-row">'+
          '<div class="form-group"><label>Nome da Empresa</label><input class="form-control" id="cfgNome" value="'+(emp.nome||'')+'"></div>'+
          '<div class="form-group"><label>CNPJ</label><input class="form-control" id="cfgCnpj" value="'+(emp.cnpj||'')+'"></div>'+
        '</div>'+
        '<div class="form-row">'+
          '<div class="form-group"><label>Empreendedor</label><input class="form-control" id="cfgEmpreendedor" value="'+(emp.empreendedor||'')+'"></div>'+
          '<div class="form-group"><label>Cidade / UF</label><input class="form-control" id="cfgCidade" value="'+(emp.cidade||'')+'"></div>'+
        '</div>'+
        '<div class="form-row">'+
          '<div class="form-group"><label>Logo</label>'+
            '<div class="logo-upload-area" onclick="document.getElementById(\'cfgLogoInput\').click()">'+
              (emp.logo?'<img src="'+emp.logo+'" style="max-width:200px;max-height:80px;object-fit:contain">':'<div class="upload-text">Clique para enviar a logo</div>')+
              '<div class="upload-hint">JPG, PNG ou WEBP — máx 2 MB</div>'+
              '<input type="file" id="cfgLogoInput" accept="image/*" style="display:none">'+
            '</div>'+
          '</div>'+
          '<div class="form-group"><label>Assinatura (imagem)</label>'+
            '<div class="logo-upload-area" onclick="document.getElementById(\'cfgAssInput\').click()">'+
              (emp.assinatura?'<img src="'+emp.assinatura+'" style="max-width:200px;max-height:80px;object-fit:contain">':'<div class="upload-text">Clique para enviar</div>')+
              '<div class="upload-hint">JPG, PNG ou WEBP — máx 2 MB</div>'+
              '<input type="file" id="cfgAssInput" accept="image/*" style="display:none">'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div style="margin-top:12px"><button class="btn btn-primary" onclick="saveCfgEmpresa()">💾 Salvar Dados da Empresa</button></div>'+
      '</div>'+
    '</div>';

  // ─ Função genérica: drag & drop empilhado (igual Vendedores) ─
  function buildDragSection(icon,title,key,placeholder){
    var items='';
    (appData[key]||[]).forEach(function(v,i){
      items+='<div class="cfg-drag-item" draggable="true" data-cfg-list="'+key+'" data-cfg-idx="'+i+'">'+
        '<span class="cfg-drag-handle">⠿</span>'+
        '<input class="cfg-inline-input form-control" value="'+v+'" onchange="updateCfgItem(\''+key+'\','+i+',this.value)">'+
        '<button class="btn-tag-remove" onclick="removeCfgItem(\''+key+'\','+i+')">✕</button>'+
      '</div>';
    });
    return '<div class="cfg-section">'+
      '<div class="cfg-section-header"><span class="cfg-section-icon">'+icon+'</span><h3>'+title+'</h3></div>'+
      '<div class="cfg-section-body">'+
        '<div class="cfg-drag-list" id="cfgList_'+key+'">'+items+'</div>'+
        '<div class="cfg-add-row">'+
          '<input class="form-control" id="cfgAdd_'+key+'" placeholder="'+placeholder+'" onkeydown="if(event.key===\'Enter\')addCfgItem(\''+key+'\')">'+
          '<button class="btn btn-primary btn-sm" onclick="addCfgItem(\''+key+'\')">+ Adicionar</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }

  var vendedoresHtml=buildDragSection('👤','Vendedores','vendedores','Novo vendedor...');
  var formasPgtoHtml=buildDragSection('💳','Formas de Pagamento (Compras)','formasPagamento','Nova forma de pagamento...');
  var formasPgtoVendasHtml=buildDragSection('💳','Formas de Pagamento (Vendas)','formasPagamentoVendas','Nova forma de pagamento vendas...');
  var tipoUnidadeHtml=buildDragSection('📏','Tipos de Unidade','tipoUnidade','Nova unidade...');
  var tipoVendaHtml=buildDragSection('🏷️','Tipos de Venda','tipoVenda','Novo tipo de venda...');
  var sitCompraHtml=buildDragSection('📋','Situação (Compras)','situacaoCompra','Nova situação...');
  var sitVendaHtml=buildDragSection('📋','Situação (Vendas)','situacaoVenda','Nova situação...');
  var sitEntregaHtml=buildDragSection('🚚','Situação de Entrega','situacaoEntrega','Nova situação...');
  var sitChequeHtml=buildDragSection('📝','Situação (Cheques)','situacaoCheque','Nova situação...');
  var sitGarantiaHtml=buildDragSection('🛡️','Situação (Garantias)','situacaoGarantia','Nova situação...');
  var sitBoletoHtml=buildDragSection('🔖','Situação (Boletos)','situacaoBoleto','Nova situação...');

  // ─ Categorias do Fluxo de Caixa (empilhado com badge de tipo) ─
  var catItems='';
  (appData.categoriasFluxo||[]).forEach(function(c,i){
    var isEntrada=c.tipo==='entrada';
    catItems+='<div class="cfg-drag-item '+(isEntrada?'cfg-cat-entrada':'cfg-cat-saida')+'" draggable="true" data-cfg-list="categoriasFluxo" data-cfg-idx="'+i+'">'+
      '<span class="cfg-drag-handle">⠿</span>'+
      '<input class="cfg-inline-input form-control" value="'+c.nome+'" onchange="updateCfgCatNome('+i+',this.value)">'+
      '<span class="cfg-cat-badge '+(isEntrada?'badge-success':'badge-danger')+'">'+(isEntrada?'Entrada':'Saída')+'</span>'+
      '<button class="btn-tag-remove" onclick="removeCfgCat('+i+')">✕</button>'+
    '</div>';
  });
  var categoriasHtml=
    '<div class="cfg-section">'+
      '<div class="cfg-section-header"><span class="cfg-section-icon">📊</span><h3>Categorias do Fluxo de Caixa</h3></div>'+
      '<div class="cfg-section-body">'+
        '<div class="cfg-drag-list" id="cfgList_categoriasFluxo">'+catItems+'</div>'+
        '<div class="cfg-add-row">'+
          '<input class="form-control" id="cfgAdd_catNome" placeholder="Nome da categoria..." onkeydown="if(event.key===\'Enter\')addCfgCat()">'+
          '<select class="form-control" id="cfgAdd_catTipo" style="max-width:150px"><option value="entrada">Entrada</option><option value="saida">Saída</option></select>'+
          '<button class="btn btn-primary btn-sm" onclick="addCfgCat()">+ Adicionar</button>'+
        '</div>'+
      '</div>'+
    '</div>';

  pg.innerHTML=
    '<div class="page-header"><h2>⚙️ Configurações</h2></div>'+
    empresaHtml+vendedoresHtml+formasPgtoHtml+formasPgtoVendasHtml+tipoUnidadeHtml+tipoVendaHtml+
    sitCompraHtml+sitVendaHtml+sitEntregaHtml+sitChequeHtml+sitGarantiaHtml+sitBoletoHtml+categoriasHtml;

  setTimeout(function(){initCfgDragDrop();},100);
  handleImageUpload('cfgLogoInput','cfgLogoPreview');
  handleImageUpload('cfgAssInput','cfgAssPreview');
  applyMask('cfgCnpj',maskCNPJ);
}

// ══════════════════════════════════════════════════════════════
// ── BACKUP (Sub-abas + Auto-save + Undo/Redo 10 passos) ──
// ══════════════════════════════════════════════════════════════
var backupSubTab = 'autosave';

function renderBackupPage(){
  var pg=document.getElementById('page-backup');if(!pg)return;

  var tabs=[
    {id:'autosave',label:'💾 Auto-Save',icon:'💾'},
    {id:'manual',label:'📥 Backup Manual',icon:'📥'},
    {id:'historico',label:'🕐 Histórico (Undo/Redo)',icon:'🕐'},
    {id:'supabase',label:'☁️ Supabase (Nuvem)',icon:'☁️'}
  ];

  var tabBtns='';
  tabs.forEach(function(t){
    var active=backupSubTab===t.id?'background:var(--accent-primary);color:#fff;border-color:var(--accent-primary)':'';
    tabBtns+='<button class="btn btn-outline" style="'+active+'" onclick="backupSubTab=\''+t.id+'\';renderBackupPage()">'+t.label+'</button>';
  });

  var content='';

  // ─ SUB-ABA: AUTO-SAVE ─
  if(backupSubTab==='autosave'){
    var lastSave='';
    try{
      var raw=localStorage.getItem('wdmaquinas_data');
      if(raw) lastSave='Dados encontrados no localStorage ('+Math.round(raw.length/1024)+' KB)';
      else lastSave='Nenhum dado salvo localmente';
    }catch(e){lastSave='Erro ao verificar localStorage';}

    content=
      '<div class="card" style="margin-bottom:16px">'+
        '<div class="card-header"><span>💾 Salvamento Automático</span></div>'+
        '<div style="padding:20px">'+
          '<p style="color:var(--text-secondary);margin-bottom:12px">O sistema salva automaticamente a cada alteração no localStorage e no Supabase (se configurado).</p>'+
          '<div style="background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px;margin-bottom:16px">'+
            '<span style="color:var(--text-muted);font-size:0.8rem">Status: </span>'+
            '<span style="color:var(--success);font-weight:600">'+lastSave+'</span>'+
          '</div>'+
          '<button class="btn btn-primary" onclick="saveData();showToast(\'Dados salvos com sucesso!\',\'success\')">💾 Forçar Salvamento Agora</button>'+
        '</div>'+
      '</div>';
  }

  // ─ SUB-ABA: BACKUP MANUAL ─
  if(backupSubTab==='manual'){
    content=
      '<div class="card" style="margin-bottom:16px">'+
        '<div class="card-header"><span>📤 Exportar Backup</span></div>'+
        '<div style="padding:20px">'+
          '<p style="color:var(--text-secondary);margin-bottom:12px">Baixe todos os dados do sistema em um arquivo JSON.</p>'+
          '<button class="btn btn-primary" onclick="exportBackup()">📤 Exportar Backup (JSON)</button>'+
        '</div>'+
      '</div>'+
      '<div class="card" style="margin-bottom:16px">'+
        '<div class="card-header"><span>📥 Importar Backup</span></div>'+
        '<div style="padding:20px">'+
          '<p style="color:var(--text-secondary);margin-bottom:12px">Restaure dados a partir de um arquivo JSON exportado anteriormente. <strong style="color:var(--danger)">Atenção: isso substituirá todos os dados atuais!</strong></p>'+
          '<input type="file" id="importBackupInput" accept=".json" style="display:none" onchange="importBackup(this)">'+
          '<button class="btn btn-warning" onclick="document.getElementById(\'importBackupInput\').click()">📥 Importar Backup (JSON)</button>'+
        '</div>'+
      '</div>'+
      '<div class="card">'+
        '<div class="card-header"><span>🗑️ Limpar Dados</span></div>'+
        '<div style="padding:20px">'+
          '<p style="color:var(--text-secondary);margin-bottom:12px">Apaga todos os dados e restaura as configurações padrão. <strong style="color:var(--danger)">Esta ação não pode ser desfeita!</strong></p>'+
          '<button class="btn btn-danger" onclick="resetAllData()">🗑️ Limpar Todos os Dados</button>'+
        '</div>'+
      '</div>';
  }

  // ─ SUB-ABA: HISTÓRICO (UNDO/REDO) ─
  if(backupSubTab==='historico'){
    var histRows='';
    if(undoHistory.length===0){
      histRows='<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Nenhum histórico ainda. As alterações serão registradas automaticamente.</td></tr>';
    } else {
      // Mostra os últimos 10 snapshots (do mais recente ao mais antigo)
      var arr=undoHistory.slice().reverse();
      arr.forEach(function(snap,i){
        var idx=undoHistory.length-1-i;
        var tamanho=Math.round(snap.length/1024);
        histRows+='<tr>'+
          '<td style="text-align:center">'+(idx+1)+'</td>'+
          '<td>Snapshot #'+(idx+1)+' ('+tamanho+' KB)</td>'+
          '<td style="text-align:center"><button class="btn btn-sm btn-outline" onclick="restoreSnapshot('+idx+')">Restaurar</button></td>'+
        '</tr>';
      });
    }

    content=
      '<div class="card" style="margin-bottom:16px">'+
        '<div class="card-header"><span>🕐 Desfazer / Refazer — Histórico de Alterações</span></div>'+
        '<div style="padding:20px">'+
          '<p style="color:var(--text-secondary);margin-bottom:16px">O sistema guarda até <strong>10 snapshots</strong> automáticos a cada salvamento. Use os botões abaixo ou os atalhos <kbd style="background:var(--bg-tertiary);padding:2px 8px;border-radius:4px;border:1px solid var(--border-color);font-size:0.8rem">Ctrl+Z</kbd> (Desfazer) e <kbd style="background:var(--bg-tertiary);padding:2px 8px;border-radius:4px;border:1px solid var(--border-color);font-size:0.8rem">Ctrl+Y</kbd> (Refazer).</p>'+
          '<div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center">'+
            '<button class="btn btn-primary" onclick="undoAction()" '+(undoHistory.length===0?'disabled style="opacity:0.5"':'')+'>↩️ Desfazer (Ctrl+Z) <span id="undoCount" style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:10px;font-size:0.75rem;margin-left:4px">'+undoHistory.length+'</span></button>'+
            '<button class="btn btn-secondary" onclick="redoAction()" '+(redoHistory.length===0?'disabled style="opacity:0.5"':'')+'>↪️ Refazer (Ctrl+Y) <span id="redoCount" style="background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:10px;font-size:0.75rem;margin-left:4px">'+redoHistory.length+'</span></button>'+
            '<span style="color:var(--text-muted);font-size:0.8rem">|</span>'+
            '<button class="btn btn-outline btn-sm" onclick="clearUndoHistory()">🗑️ Limpar Histórico</button>'+
          '</div>'+
          '<div class="table-responsive"><table class="table"><thead><tr><th style="width:60px;text-align:center">#</th><th>Snapshot</th><th style="width:100px;text-align:center">Ação</th></tr></thead><tbody>'+histRows+'</tbody></table></div>'+
        '</div>'+
      '</div>';
  }

  // ─ SUB-ABA: SUPABASE ─
  if(backupSubTab==='supabase'){
    var sStatus=supabaseClient?'<span style="color:var(--success);font-weight:600">✅ Conectado</span>':'<span style="color:var(--danger);font-weight:600">❌ Desconectado</span>';
    content=
      '<div class="card">'+
        '<div class="card-header"><span>☁️ Sincronização Supabase</span></div>'+
        '<div style="padding:20px">'+
          '<div style="background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px;margin-bottom:16px">'+
            '<span style="color:var(--text-muted);font-size:0.8rem">Status da conexão: </span>'+sStatus+
          '</div>'+
          '<p style="color:var(--text-secondary);margin-bottom:12px">URL: <code style="color:var(--accent-secondary)">'+SUPABASE_URL+'</code></p>'+
          '<div style="display:flex;gap:12px;flex-wrap:wrap">'+
            '<button class="btn btn-primary" onclick="forceSyncSupabase()">☁️ Forçar Sincronização</button>'+
            '<button class="btn btn-secondary" onclick="loadFromSupabase()">📥 Carregar do Supabase</button>'+
          '</div>'+
        '</div>'+
      '</div>';
  }

  pg.innerHTML=
    '<div class="page-header"><h2>💾 Backup</h2></div>'+
    '<div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">'+tabBtns+'</div>'+
    content;
}

// ── Undo / Redo ──
function undoAction(){
  if(undoHistory.length===0){showToast('Nada para desfazer','error');return;}
  // Salva estado atual no redo
  redoHistory.push(JSON.stringify(appData));
  if(redoHistory.length>undoMaxSteps) redoHistory.shift();
  // Restaura último snapshot
  var snapshot=undoHistory.pop();
  undoSaving=true;
  appData=JSON.parse(snapshot);
  try{localStorage.setItem('wdmaquinas_data',JSON.stringify(appData));}catch(e){}
  undoSaving=false;
  showToast('Ação desfeita!','success');
  refreshCurrentPage();
}

function redoAction(){
  if(redoHistory.length===0){showToast('Nada para refazer','error');return;}
  // Salva estado atual no undo
  undoHistory.push(JSON.stringify(appData));
  if(undoHistory.length>undoMaxSteps) undoHistory.shift();
  // Restaura do redo
  var snapshot=redoHistory.pop();
  undoSaving=true;
  appData=JSON.parse(snapshot);
  try{localStorage.setItem('wdmaquinas_data',JSON.stringify(appData));}catch(e){}
  undoSaving=false;
  showToast('Ação refeita!','success');
  refreshCurrentPage();
}

function restoreSnapshot(idx){
  if(!undoHistory[idx]){showToast('Snapshot não encontrado','error');return;}
  if(!confirm('Restaurar snapshot #'+(idx+1)+'? Os dados atuais serão substituídos.')) return;
  redoHistory.push(JSON.stringify(appData));
  if(redoHistory.length>undoMaxSteps) redoHistory.shift();
  undoSaving=true;
  appData=JSON.parse(undoHistory[idx]);
  try{localStorage.setItem('wdmaquinas_data',JSON.stringify(appData));}catch(e){}
  undoSaving=false;
  showToast('Snapshot restaurado!','success');
  refreshCurrentPage();
}

function clearUndoHistory(){
  if(!confirm('Limpar todo o histórico de undo/redo?')) return;
  undoHistory=[];redoHistory=[];
  showToast('Histórico limpo','success');
  renderBackupPage();
}

function refreshCurrentPage(){
  // Re-renderiza a página atual
  var active=document.querySelector('.nav-item.active');
  if(active){
    var onclick=active.getAttribute('onclick')||'';
    var match=onclick.match(/navigateTo\('(.+?)'\)/);
    if(match) navigateTo(match[1]);
    else renderBackupPage();
  } else {
    renderBackupPage();
  }
}

// ── Export / Import ──
function exportBackup(){
  var json=JSON.stringify(appData,null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='wdmaquinas_backup_'+todayStr()+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exportado com sucesso!','success');
}

function importBackup(input){
  var file=input.files[0];if(!file)return;
  if(!confirm('Importar backup? Todos os dados atuais serão substituídos!')) return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var data=JSON.parse(e.target.result);
      // Salva snapshot antes de importar
      undoHistory.push(JSON.stringify(appData));
      if(undoHistory.length>undoMaxSteps) undoHistory.shift();
      appData=data;
      ensureDefaults();
      saveData();
      updateSidebarInfo();
      showToast('Backup importado com sucesso!','success');
      navigateTo('dashboard');
    }catch(err){
      showToast('Erro ao ler o arquivo: '+err.message,'error');
    }
  };
  reader.readAsText(file);
}

function resetAllData(){
  if(!confirm('ATENÇÃO: Isso apagará TODOS os dados! Deseja continuar?')) return;
  if(!confirm('Tem certeza MESMO? Esta ação NÃO pode ser desfeita!')) return;
  undoHistory.push(JSON.stringify(appData));
  if(undoHistory.length>undoMaxSteps) undoHistory.shift();
  appData=getDefaultData();
  saveData();
  updateSidebarInfo();
  showToast('Todos os dados foram apagados','success');
  navigateTo('dashboard');
}

async function forceSyncSupabase(){
  if(!supabaseClient){showToast('Supabase não conectado','error');return;}
  try{
    await supabaseClient.from('wdmaquinas_data').upsert({id:1,payload:appData,updated_at:new Date().toISOString()});
    showToast('Dados sincronizados com Supabase!','success');
  }catch(e){showToast('Erro: '+e.message,'error');}
}

async function loadFromSupabase(){
  if(!supabaseClient){showToast('Supabase não conectado','error');return;}
  if(!confirm('Carregar dados do Supabase? Os dados locais serão substituídos!')) return;
  try{
    var r=await supabaseClient.from('wdmaquinas_data').select('*').eq('id',1).single();
    if(r.data&&r.data.payload){
      undoHistory.push(JSON.stringify(appData));
      if(undoHistory.length>undoMaxSteps) undoHistory.shift();
      appData=typeof r.data.payload==='string'?JSON.parse(r.data.payload):r.data.payload;
      ensureDefaults();
      try{localStorage.setItem('wdmaquinas_data',JSON.stringify(appData));}catch(e){}
      updateSidebarInfo();
      showToast('Dados carregados do Supabase!','success');
      navigateTo('dashboard');
    } else {
      showToast('Nenhum dado encontrado no Supabase','error');
    }
  }catch(e){showToast('Erro: '+e.message,'error');}
}
// ── ATALHOS CTRL+Z / CTRL+Y ──
document.addEventListener('keydown',function(e){
  // Não captura quando está digitando em input/textarea/select
  var tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select') return;

  if((e.ctrlKey||e.metaKey)&&e.key==='z'){
    e.preventDefault();
    undoAction();
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='y'){
    e.preventDefault();
    redoAction();
  }
});

// ══════════════════════════════════════════════════════════════
// ── INICIALIZAÇÃO ──
// ══════════════════════════════════════════════════════════════
(async function init(){
  try{supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);}catch(e){console.warn('Supabase não disponível:',e.message);}
  await loadData();
  updateSidebarInfo();
  document.getElementById('currentDate').textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  renderDashboard();
  document.getElementById('cadastroModal').addEventListener('mousedown',function(e){if(e.target===this)closeCadastroModal();});
  document.getElementById('viewModal').addEventListener('mousedown',function(e){if(e.target===this)closeViewModal();});
  document.querySelector('.menu-toggle').addEventListener('click',function(){document.getElementById('sidebar').classList.toggle('active');});
})();
