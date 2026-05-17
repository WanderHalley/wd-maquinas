// ╔══════════════════════════════════════════════════════════════╗
// ║  WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026              ║
// ║  script.js — CÓDIGO COMPLETO CORRIGIDO v12                 ║
// ║  Novidades: Projeção Lucro, Receitas Brutas MEI,           ║
// ║  Upload Assinatura                                         ║
// ╚══════════════════════════════════════════════════════════════╝

// ── SCR-CFG-01: CONFIGURAÇÃO GLOBAL ──
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

// ── SCR-HLP-01: HELPERS ──
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
function calcDiasGarantia(dataInicio,diasGarantia) {
  if (!dataInicio||!diasGarantia) return null;
  var hoje=new Date(); hoje.setHours(0,0,0,0);
  var inicio=new Date(dataInicio+'T00:00:00'); inicio.setHours(0,0,0,0);
  var expiracao=new Date(inicio.getTime()+(diasGarantia*24*60*60*1000));
  return Math.ceil((expiracao.getTime()-hoje.getTime())/(1000*60*60*24));
}
function formatDiasGarantia(dias,situacao) {
  if (situacao==='Perdeu a Garantia') return '<span style="color:#e53e3e;font-weight:600">—</span>';
  if (dias===null) return '-';
  if (dias<=0) return '<span style="color:#e53e3e;font-weight:700">—</span>';
  if (dias<=30) return '<span style="color:#dd6b20;font-weight:600">'+dias+' dia'+(dias>1?'s':'')+'</span>';
  return '<span style="color:var(--text-muted)">'+dias+' dia'+(dias>1?'s':'')+'</span>';
}
function getGarantiaSituacaoAuto(dataInicio,diasGarantia,situacaoManual) {
  if (situacaoManual==='Perdeu a Garantia') return 'Perdeu a Garantia';
  var dias=calcDiasGarantia(dataInicio,diasGarantia);
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

// ── SCR-MSK-01: MÁSCARAS ──
function maskCPF(v){v=v.replace(/\D/g,'').substring(0,11);v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');return v;}
function maskCNPJ(v){v=v.replace(/\D/g,'').substring(0,14);v=v.replace(/^(\d{2})(\d)/,'$1.$2');v=v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3');v=v.replace(/\.(\d{3})(\d)/,'.$1/$2');v=v.replace(/(\d{4})(\d)/,'$1-$2');return v;}
function maskCPFouCNPJ(v){var d=v.replace(/\D/g,'');if(d.length<=11) return maskCPF(v);return maskCNPJ(v);}
function maskTelefone(v){v=v.replace(/\D/g,'').substring(0,11);if(v.length<=10){v=v.replace(/(\d{2})(\d)/,'($1) $2');v=v.replace(/(\d{4})(\d)/,'$1-$2');}else{v=v.replace(/(\d{2})(\d)/,'($1) $2');v=v.replace(/(\d{5})(\d)/,'$1-$2');}return v;}
function applyMask(inputId,maskFn){var el=document.getElementById(inputId);if(!el)return;el.addEventListener('input',function(){var pos=el.selectionStart;var oldLen=el.value.length;el.value=maskFn(el.value);var newLen=el.value.length;el.setSelectionRange(pos+(newLen-oldLen),pos+(newLen-oldLen));});}
function applyAllMasks(){setTimeout(function(){applyMask('clTelefone',maskTelefone);applyMask('clCelular',maskTelefone);applyMask('clCpf',maskCPF);applyMask('clCnpj',maskCNPJ);applyMask('clCpfCnpj',maskCPFouCNPJ);applyMask('fnTelefone',maskTelefone);applyMask('fnCelular',maskTelefone);applyMask('fnCpf',maskCPF);applyMask('fnCnpj',maskCNPJ);applyMask('fnCpfCnpj',maskCPFouCNPJ);applyMask('cfgCnpj',maskCNPJ);applyMask('gen_cpfCnpj',maskCPFouCNPJ);applyMask('gen_telefone',maskTelefone);applyMask('gen_celular',maskTelefone);},100);}

// ── SCR-IMG-01: UPLOAD DE IMAGEM ──
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

// ── SCR-DAT-01: DADOS PADRÃO ──
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

// ── SCR-LS-01: LOAD / SAVE ──
async function loadData(){
  if(supabaseClient){try{var r=await supabaseClient.from('wdmaquinas_data').select('*').eq('id',1).single();if(r.data&&r.data.payload){appData=typeof r.data.payload==='string'?JSON.parse(r.data.payload):r.data.payload;ensureDefaults();return;}}catch(e){console.warn('Supabase load falhou:',e.message);}}
  try{var local=localStorage.getItem('wdmaquinas_data');if(local){appData=JSON.parse(local);ensureDefaults();return;}}catch(e){}
  appData=getDefaultData();
}
async function saveData(){
  try{localStorage.setItem('wdmaquinas_data',JSON.stringify(appData));}catch(e){}
  if(supabaseClient){try{await supabaseClient.from('wdmaquinas_data').upsert({id:1,payload:appData,updated_at:new Date().toISOString()});}catch(e){}}
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

// ── SCR-UI-01: UI HELPERS ──
function showToast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='toast '+(type||'success');t.classList.add('show');setTimeout(function(){t.classList.remove('show');},3000);}
function openCadastroModal(){document.getElementById('cadastroModal').style.display='flex';}
function closeCadastroModal(){document.getElementById('cadastroModal').style.display='none';}
function openViewModal(){document.getElementById('viewModal').style.display='flex';}
function closeViewModal(){document.getElementById('viewModal').style.display='none';}

// ── SCR-SB-01: SIDEBAR ──
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

// ── SCR-NAV-01: NAVEGAÇÃO ──
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
// ── SCR-DSH-01: DASHBOARD ──
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
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
      '<div><div class="card" style="margin-bottom:16px"><div class="card-header"><span>Fluxo de Caixa Mensal</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>'+fluxoResumo+'</tbody></table></div></div></div>'+
      '<div>'+
        (salarioRows?'<div class="card" style="margin-bottom:16px"><div class="card-header"><span>💰 Salário por Mês</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Wander</th><th>Daniel</th><th>Pago Total</th></tr></thead><tbody>'+salarioRows+'</tbody></table></div></div>':'')+
        '<div class="card" style="margin-bottom:16px"><div class="card-header"><span>Últimas Vendas</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Valor</th><th>Situação</th></tr></thead><tbody>'+vRows+'</tbody></table></div></div>'+
        '<div class="card"><div class="card-header"><span>Últimas Compras</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Valor</th><th>Situação</th></tr></thead><tbody>'+cRows+'</tbody></table></div></div>'+
      '</div>'+
    '</div>';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-FLX-01: FLUXO DE CAIXA MENSAL ──
// ══════════════════════════════════════════════════════════════
var mesesNomes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
var mesesKeys=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function renderFluxoMes(mesIdx){
  var mesKey=mesesKeys[mesIdx];var mesNome=mesesNomes[mesIdx];
  var pg=document.getElementById('page-'+mesKey);if(!pg)return;
  if(!appData.fluxoCaixa) appData.fluxoCaixa={};
  if(!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey]=[];
  var lancs=appData.fluxoCaixa[mesKey];
  var saldoAnt=0;
  for(var i=0;i<mesIdx;i++){var mk=mesesKeys[i];var ls=(appData.fluxoCaixa[mk])||[];ls.forEach(function(l){if(l.tipo==='entrada')saldoAnt+=(l.valor||0);else saldoAnt-=(l.valor||0);});}
  var tEnt=lancs.filter(function(l){return l.tipo==='entrada';}).reduce(function(s,l){return s+(l.valor||0);},0);
  var tSai=lancs.filter(function(l){return l.tipo==='saida';}).reduce(function(s,l){return s+(l.valor||0);},0);
  var saldoFin=saldoAnt+tEnt-tSai;
  var dinNotas=lancs.filter(function(l){return l.categoria==='Dinheiro em Notas';}).reduce(function(s,l){return s+(l.valor||0);},0);
  var salLancs=lancs.filter(function(l){return(l.categoria||'').toLowerCase().includes('salário')||(l.categoria||'').toLowerCase().includes('salario');});
  var salTotal=salLancs.reduce(function(s,l){return s+(l.valor||0);},0);
  var salW=salLancs.filter(function(l){return(l.descricao||'').toLowerCase().includes('wander');}).reduce(function(s,l){return s+(l.valor||0);},0);
  var salD=salLancs.filter(function(l){return(l.descricao||'').toLowerCase().includes('daniel');}).reduce(function(s,l){return s+(l.valor||0);},0);
  var catEnt=(appData.categoriasFluxo||[]).filter(function(c){return c.tipo==='entrada';}).map(function(c){return'<option value="entrada:'+c.nome+'">'+c.nome+'</option>';}).join('');
  var catSai=(appData.categoriasFluxo||[]).filter(function(c){return c.tipo==='saida';}).map(function(c){return'<option value="saida:'+c.nome+'">'+c.nome+'</option>';}).join('');

  pg.innerHTML=
    '<div class="page-header"><h2>📅 '+mesNome+' 2026</h2><button class="btn btn-primary" onclick="openLancamentoModal('+mesIdx+')">+ Novo Lançamento</button></div>'+
    '<div class="dashboard-grid">'+
      '<div class="card"><div class="card-header"><span>Saldo Anterior</span></div><div class="card-value '+(saldoAnt>=0?'text-success':'text-danger')+'">'+formatCurrency(saldoAnt)+'</div></div>'+
      '<div class="card"><div class="card-header"><span>Entradas</span></div><div class="card-value text-success">'+formatCurrency(tEnt)+'</div></div>'+
      '<div class="card"><div class="card-header"><span>Saídas</span></div><div class="card-value text-danger">'+formatCurrency(tSai)+'</div></div>'+
      '<div class="card card-accent"><div class="card-header"><span>Saldo Final</span></div><div class="card-value '+(saldoFin>=0?'text-success':'text-danger')+'">'+formatCurrency(saldoFin)+'</div></div>'+
      '<div class="card"><div class="card-header"><span>Dinheiro em Notas</span></div><div class="card-value">'+formatCurrency(dinNotas)+'</div></div>'+
      '<div class="card" style="border-left:3px solid var(--danger);grid-column:span 2"><div class="card-header"><span>Salário Pago Total</span></div><div class="card-value text-danger">'+formatCurrency(salTotal)+'</div>'+
        '<div style="display:flex;align-items:center;gap:24px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);flex-wrap:wrap">'+
          '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase">Wander:</span><span style="font-size:1rem;font-weight:700;color:var(--warning)">'+formatCurrency(salW)+'</span></div>'+
          '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase">Daniel:</span><span style="font-size:1rem;font-weight:700;color:var(--warning)">'+formatCurrency(salD)+'</span></div>'+
        '</div></div>'+
    '</div>'+
    '<div class="filter-bar">'+
      '<input type="text" class="form-control" style="max-width:250px" placeholder="Buscar lançamento..." oninput="fluxoFilterText=this.value.toLowerCase();renderFluxoTable('+mesIdx+')">'+
      '<select class="form-control" style="max-width:200px" onchange="fluxoFilterTipo=this.value;renderFluxoTable('+mesIdx+')"><option value="">Todos os tipos</option><optgroup label="Entradas">'+catEnt+'</optgroup><optgroup label="Saídas">'+catSai+'</optgroup></select>'+
      '<div class="flux-toggle">'+
        '<button class="btn btn-sm '+(fluxoFilterTipo===''?'btn-primary':'btn-outline')+'" onclick="fluxoFilterTipo=\'\';renderFluxoTable('+mesIdx+')">Todos</button>'+
        '<button class="btn btn-sm '+(fluxoFilterTipo==='entrada'?'btn-primary':'btn-outline')+'" onclick="fluxoFilterTipo=\'entrada\';renderFluxoTable('+mesIdx+')">Entradas</button>'+
        '<button class="btn btn-sm '+(fluxoFilterTipo==='saida'?'btn-primary':'btn-outline')+'" onclick="fluxoFilterTipo=\'saida\';renderFluxoTable('+mesIdx+')">Saídas</button>'+
      '</div>'+
    '</div>'+
    '<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="fluxoBody"></tbody></table></div>';
  fluxoFilterText='';fluxoFilterTipo='';
  renderFluxoTable(mesIdx);
}

function renderFluxoTable(mesIdx){
  var mesKey=mesesKeys[mesIdx];var tbody=document.getElementById('fluxoBody');if(!tbody)return;
  var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[mesKey])?appData.fluxoCaixa[mesKey].slice():[];
  if(fluxoFilterText) lancs=lancs.filter(function(l){return(l.descricao||'').toLowerCase().includes(fluxoFilterText)||(l.categoria||'').toLowerCase().includes(fluxoFilterText);});
  if(fluxoFilterTipo){
    if(fluxoFilterTipo==='entrada'||fluxoFilterTipo==='saida') lancs=lancs.filter(function(l){return l.tipo===fluxoFilterTipo;});
    else if(fluxoFilterTipo.includes(':')){var pts=fluxoFilterTipo.split(':');lancs=lancs.filter(function(l){return l.tipo===pts[0]&&l.categoria===pts[1];});}
  }
  lancs.sort(function(a,b){return(a.data||'').localeCompare(b.data||'');});
  if(lancs.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum lançamento</td></tr>';return;}
  tbody.innerHTML=lancs.map(function(l){
    var isE=l.tipo==='entrada';
    return'<tr><td>'+formatDate(l.data)+'</td><td>'+(l.descricao||'-')+'</td><td>'+(l.categoria||'-')+'</td><td><span class="badge '+(isE?'badge-success':'badge-danger')+'">'+(isE?'Entrada':'Saída')+'</span></td><td class="'+(isE?'text-success':'text-danger')+'">'+formatCurrency(l.valor)+'</td><td><button class="btn btn-sm btn-primary" onclick="editLancamento('+mesIdx+','+l.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteLancamento('+mesIdx+','+l.id+')">🗑️</button></td></tr>';
  }).join('');
}

function openLancamentoModal(mesIdx,lanc){
  var mesKey=mesesKeys[mesIdx];var isEdit=!!lanc;
  var catEnt=(appData.categoriasFluxo||[]).filter(function(c){return c.tipo==='entrada';}).map(function(c){return'<option value="'+c.nome+'"'+(lanc&&lanc.categoria===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  var catSai=(appData.categoriasFluxo||[]).filter(function(c){return c.tipo==='saida';}).map(function(c){return'<option value="'+c.nome+'"'+(lanc&&lanc.categoria===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  var tipoVal=lanc?lanc.tipo:'entrada';
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Lançamento':'Novo Lançamento';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Data</label><input type="date" class="form-control" id="flxData" value="'+(lanc?lanc.data:todayStr())+'"></div>'+
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="flxDesc" value="'+(lanc?lanc.descricao||'':'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Tipo</label><select class="form-control" id="flxTipo" onchange="updateFlxCatOptions()"><option value="entrada"'+(tipoVal==='entrada'?' selected':'')+'>Entrada</option><option value="saida"'+(tipoVal==='saida'?' selected':'')+'>Saída</option></select></div>'+
    '<div class="form-group"><label>Categoria</label><select class="form-control" id="flxCat"></select></div></div>'+
    '<div class="form-group"><label>Valor *</label><input type="number" class="form-control" id="flxValor" value="'+(lanc?lanc.valor||'':'')+'" step="0.01"></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveLancamento('+mesIdx+','+(isEdit?lanc.id:'null')+')">Salvar</button>';
  openCadastroModal();
  setTimeout(function(){updateFlxCatOptions();if(lanc)document.getElementById('flxCat').value=lanc.categoria||'';},50);
}
function updateFlxCatOptions(){
  var tipo=document.getElementById('flxTipo').value;var catSel=document.getElementById('flxCat');
  var cats=(appData.categoriasFluxo||[]).filter(function(c){return c.tipo===tipo;});
  catSel.innerHTML=cats.map(function(c){return'<option value="'+c.nome+'">'+c.nome+'</option>';}).join('');
}
function saveLancamento(mesIdx,id){
  var mesKey=mesesKeys[mesIdx];
  var obj={data:document.getElementById('flxData').value,descricao:document.getElementById('flxDesc').value.trim(),tipo:document.getElementById('flxTipo').value,categoria:document.getElementById('flxCat').value,valor:parseFloat(document.getElementById('flxValor').value)||0};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!obj.valor){showToast('Informe o valor','error');return;}
  if(!appData.fluxoCaixa) appData.fluxoCaixa={};
  if(!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey]=[];
  if(id){var idx=appData.fluxoCaixa[mesKey].findIndex(function(l){return l.id===id;});if(idx>-1){obj.id=id;appData.fluxoCaixa[mesKey][idx]=obj;}}
  else{obj.id=nextId(appData.fluxoCaixa[mesKey]);appData.fluxoCaixa[mesKey].push(obj);}
  saveData();closeCadastroModal();renderFluxoMes(mesIdx);showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editLancamento(mesIdx,id){var mesKey=mesesKeys[mesIdx];var lanc=(appData.fluxoCaixa[mesKey]||[]).find(function(l){return l.id===id;});if(lanc)openLancamentoModal(mesIdx,lanc);}
function deleteLancamento(mesIdx,id){if(!confirm('Excluir lançamento?'))return;var mesKey=mesesKeys[mesIdx];appData.fluxoCaixa[mesKey]=(appData.fluxoCaixa[mesKey]||[]).filter(function(l){return l.id!==id;});saveData();renderFluxoMes(mesIdx);showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-CMP-01: COMPRAS ──
// ══════════════════════════════════════════════════════════════
function renderComprasPage(){
  var pg=document.getElementById('page-compras');if(!pg)return;
  var sitOpts=(appData.situacaoCompra||[]).map(function(s){return'<option value="'+s+'">'+s+'</option>';}).join('');
  var pgtoOpts=(appData.formasPagamento||[]).map(function(f){return'<option value="'+f+'">'+f+'</option>';}).join('');
  pg.innerHTML=
    '<div class="page-header"><h2>🛒 Compras</h2><div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openCompraModal()">+ Nova Compra</button><button class="btn btn-outline" id="btnComprasEdit" onclick="toggleComprasEditMode()">'+(comprasEditMode?'✅ Finalizar Edição':'✏️ Editar Todos')+'</button><button class="btn btn-danger" onclick="deleteAllCompras()">🗑️ Excluir Todos</button></div></div>'+
    '<div class="dashboard-grid" id="comprasResultPanel"></div>'+
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar compra..." oninput="onComprasSearch(this.value)"><select class="form-control" style="max-width:160px" onchange="onComprasFilterSit(this.value)"><option value="">Situação (todas)</option>'+sitOpts+'</select><select class="form-control" style="max-width:160px" onchange="onComprasFilterPgto(this.value)"><option value="">Pgto (todos)</option>'+pgtoOpts+'</select></div>'+
    '<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Fornecedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>F.Pgto</th><th>Venc.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="comprasBody"></tbody></table></div>';
  comprasSearchQuery='';comprasFilterSit='';comprasFilterPgto='';applyComprasFilters();
}
function renderComprasTable(compras){
  var tbody=document.getElementById('comprasBody');if(!tbody)return;
  if(compras.length===0){tbody.innerHTML='<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma compra encontrada</td></tr>';return;}
  var sitOpts=(appData.situacaoCompra||[]);
  tbody.innerHTML=compras.map(function(c){
    var total=(c.quantidade||1)*(c.valorUnit||0);
    var sitSelect='<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeCompraField('+c.id+',\'situacao\',this.value)">'+sitOpts.map(function(s){return'<option value="'+s+'"'+(c.situacao===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>';
    var acoes=comprasEditMode?'<button class="btn btn-sm btn-outline" onclick="viewCompra('+c.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCompra('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCompra('+c.id+')">🗑️</button>':'<button class="btn btn-sm btn-outline" onclick="viewCompra('+c.id+')">👁️</button>';
    return'<tr><td>'+formatDate(c.data)+'</td><td>'+(c.produto||'-')+'</td><td>'+(c.fornecedor||'-')+'</td><td>'+(c.quantidade||1)+'</td><td>'+formatCurrency(c.valorUnit)+'</td><td>'+formatCurrency(total)+'</td><td>'+(c.formaPagamento||'-')+'</td><td>'+formatDate(c.vencimento)+'</td><td>'+sitSelect+'</td><td>'+acoes+'</td></tr>';
  }).join('');
}
function changeCompraField(id,field,value){var c=(appData.compras||[]).find(function(x){return x.id===id;});if(c){c[field]=value;saveData();applyComprasFilters();}}
function openCompraModal(compra){
  var isEdit=!!compra;
  var fornOpts=(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(compra&&compra.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');
  var pgtoOpts=(appData.formasPagamento||[]).map(function(f){return'<option value="'+f+'"'+(compra&&compra.formaPagamento===f?' selected':'')+'>'+f+'</option>';}).join('');
  var sitOpts=(appData.situacaoCompra||[]).map(function(s){return'<option value="'+s+'"'+(compra&&compra.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Compra':'Nova Compra';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="cpData" value="'+(compra?compra.data:todayStr())+'"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="cpVenc" value="'+(compra?compra.vencimento||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="cpProd" value="'+(compra?compra.produto:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="cpQtd" value="'+(compra?compra.quantidade:1)+'" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="cpValor" value="'+(compra?compra.valorUnit:'')+'" step="0.01"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="cpForn"><option value="">Selecione...</option>'+fornOpts+'</select></div><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="cpPgto"><option value="">Selecione...</option>'+pgtoOpts+'</select></div></div>'+
    '<div class="form-group"><label>Situação</label><select class="form-control" id="cpSit">'+sitOpts+'</select></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="cpObs" rows="2">'+(compra?compra.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCompra('+(isEdit?compra.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveCompra(id){
  var obj={data:document.getElementById('cpData').value,vencimento:document.getElementById('cpVenc').value,produto:document.getElementById('cpProd').value.trim(),quantidade:parseFloat(document.getElementById('cpQtd').value)||1,valorUnit:parseFloat(document.getElementById('cpValor').value)||0,fornecedor:document.getElementById('cpForn').value,formaPagamento:document.getElementById('cpPgto').value,situacao:document.getElementById('cpSit').value,obs:document.getElementById('cpObs').value};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(!appData.compras) appData.compras=[];
  if(id){var idx=appData.compras.findIndex(function(c){return c.id===id;});if(idx>-1){obj.id=id;appData.compras[idx]=obj;}}
  else{obj.id=nextId(appData.compras);appData.compras.push(obj);}
  saveData();closeCadastroModal();renderComprasPage();showToast(id?'Compra atualizada!':'Compra cadastrada!','success');
}
function editCompra(id){var c=(appData.compras||[]).find(function(x){return x.id===id;});if(c)openCompraModal(c);}
function viewCompra(id){
  var c=(appData.compras||[]).find(function(x){return x.id===id;});if(!c)return;
  var total=(c.quantidade||1)*(c.valorUnit||0);
  document.getElementById('viewModalTitle').textContent='Detalhes da Compra';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>'+formatDate(c.data)+'</div><div class="detail-item"><span class="detail-label">Vencimento</span>'+formatDate(c.vencimento)+'</div><div class="detail-item"><span class="detail-label">Produto</span>'+c.produto+'</div><div class="detail-item"><span class="detail-label">Qtd</span>'+c.quantidade+'</div><div class="detail-item"><span class="detail-label">V.Unit</span>'+formatCurrency(c.valorUnit)+'</div><div class="detail-item"><span class="detail-label">Total</span>'+formatCurrency(total)+'</div><div class="detail-item"><span class="detail-label">Fornecedor</span>'+(c.fornecedor||'-')+'</div><div class="detail-item"><span class="detail-label">Pgto</span>'+(c.formaPagamento||'-')+'</div><div class="detail-item"><span class="detail-label">Situação</span>'+situacaoBadge(c.situacao)+'</div></div>'+(c.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+c.obs+'</div>':'');
  openViewModal();
}
function deleteCompra(id){if(!confirm('Excluir compra?'))return;appData.compras=(appData.compras||[]).filter(function(c){return c.id!==id;});saveData();renderComprasPage();showToast('Compra excluída!','success');}
function toggleComprasEditMode(){comprasEditMode=!comprasEditMode;var btn=document.getElementById('btnComprasEdit');if(btn)btn.textContent=comprasEditMode?'✅ Finalizar Edição':'✏️ Editar Todos';applyComprasFilters();}
function deleteAllCompras(){if(!confirm('Excluir TODAS as compras?'))return;appData.compras=[];saveData();renderComprasPage();showToast('Todas excluídas!','success');}
function onComprasSearch(q){comprasSearchQuery=q.toLowerCase();applyComprasFilters();}
function onComprasFilterSit(s){comprasFilterSit=s;applyComprasFilters();}
function onComprasFilterPgto(p){comprasFilterPgto=p;applyComprasFilters();}
function applyComprasFilters(){
  var filtered=appData.compras||[];
  if(comprasSearchQuery) filtered=filtered.filter(function(c){return(c.produto||'').toLowerCase().includes(comprasSearchQuery)||(c.fornecedor||'').toLowerCase().includes(comprasSearchQuery);});
  if(comprasFilterSit) filtered=filtered.filter(function(c){return c.situacao===comprasFilterSit;});
  if(comprasFilterPgto) filtered=filtered.filter(function(c){return c.formaPagamento===comprasFilterPgto;});
  renderComprasTable(filtered);renderComprasResultPanel(filtered);
}
function renderComprasResultPanel(filtered){
  var panel=document.getElementById('comprasResultPanel');if(!panel)return;
  var all=appData.compras||[];
  var total=filtered.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
  var pago=filtered.filter(function(c){return c.situacao==='Pago';}).reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
  var devendo=filtered.filter(function(c){return c.situacao==='Devendo';}).reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
  panel.innerHTML='<div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+filtered.length+' de '+all.length+' registros</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">'+formatCurrency(pago)+'</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">'+formatCurrency(devendo)+'</div></div>';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-VND-01: VENDAS ──
// ══════════════════════════════════════════════════════════════
function renderVendasPage(){
  var pg=document.getElementById('page-vendas');if(!pg)return;
  var sitOpts=(appData.situacaoVenda||[]).map(function(s){return'<option value="'+s+'">'+s+'</option>';}).join('');
  pg.innerHTML=
    '<div class="page-header"><h2>💰 Vendas</h2><div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openVendaModal()">+ Nova Venda</button><button class="btn btn-outline" id="btnVendasEdit" onclick="toggleVendasEditMode()">'+(vendasEditMode?'✅ Finalizar Edição':'✏️ Editar Todos')+'</button><button class="btn btn-danger" onclick="deleteAllVendas()">🗑️ Excluir Todos</button></div></div>'+
    '<div class="dashboard-grid" id="vendasResultPanel"></div>'+
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar venda..." oninput="onVendasSearch(this.value)"><select class="form-control" style="max-width:160px" onchange="onVendasFilterSit(this.value)"><option value="">Situação (todas)</option>'+sitOpts+'</select></div>'+
    '<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Vendedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>F.Pgto</th><th>Situação</th><th>Entrega</th><th>Ações</th></tr></thead><tbody id="vendasBody"></tbody></table></div>';
  vendasSearchQuery='';vendasFilterSit='';applyVendasFilters();
}
function renderVendasTable(vendas){
  var tbody=document.getElementById('vendasBody');if(!tbody)return;
  if(vendas.length===0){tbody.innerHTML='<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma venda encontrada</td></tr>';return;}
  var sitOpts=(appData.situacaoVenda||[]);var entOpts=(appData.situacaoEntrega||[]);
  tbody.innerHTML=vendas.map(function(v){
    var total=(v.quantidade||1)*(v.valorUnit||0);
    var sitSel='<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeVendaField('+v.id+',\'situacao\',this.value)">'+sitOpts.map(function(s){return'<option value="'+s+'"'+(v.situacao===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>';
    var entSel='<select class="form-control" style="min-width:120px;padding:4px 6px;font-size:12px" onchange="changeVendaField('+v.id+',\'entrega\',this.value)">'+entOpts.map(function(e){return'<option value="'+e+'"'+(v.entrega===e?' selected':'')+'>'+e+'</option>';}).join('')+'</select>';
    var acoes=vendasEditMode?'<button class="btn btn-sm btn-outline" onclick="viewVenda('+v.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editVenda('+v.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteVenda('+v.id+')">🗑️</button>':'<button class="btn btn-sm btn-outline" onclick="viewVenda('+v.id+')">👁️</button>';
    return'<tr><td>'+formatDate(v.data)+'</td><td>'+(v.produto||'-')+'</td><td>'+(v.cliente||'-')+'</td><td>'+(v.vendedor||'-')+'</td><td>'+(v.quantidade||1)+'</td><td>'+formatCurrency(v.valorUnit)+'</td><td>'+formatCurrency(total)+'</td><td>'+(v.formaPagamento||'-')+'</td><td>'+sitSel+'</td><td>'+entSel+'</td><td>'+acoes+'</td></tr>';
  }).join('');
}
function changeVendaField(id,field,value){var v=(appData.vendas||[]).find(function(x){return x.id===id;});if(v){v[field]=value;saveData();applyVendasFilters();}}
function openVendaModal(venda){
  var isEdit=!!venda;
  var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(venda&&venda.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  var vendOpts=(appData.vendedores||[]).map(function(v){return'<option value="'+v+'"'+(venda&&venda.vendedor===v?' selected':'')+'>'+v+'</option>';}).join('');
  var pgtoOpts=(appData.formasPagamentoVendas||[]).map(function(f){return'<option value="'+f+'"'+(venda&&venda.formaPagamento===f?' selected':'')+'>'+f+'</option>';}).join('');
  var sitOpts=(appData.situacaoVenda||[]).map(function(s){return'<option value="'+s+'"'+(venda&&venda.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');
  var entOpts=(appData.situacaoEntrega||[]).map(function(e){return'<option value="'+e+'"'+(venda&&venda.entrega===e?' selected':'')+'>'+e+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Venda':'Nova Venda';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="vnData" value="'+(venda?venda.data:todayStr())+'"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="vnVenc" value="'+(venda?venda.vencimento||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="vnProd" value="'+(venda?venda.produto:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="vnQtd" value="'+(venda?venda.quantidade:1)+'" min="1"></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="vnValor" value="'+(venda?venda.valorUnit:'')+'" step="0.01"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="vnCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Vendedor</label><select class="form-control" id="vnVend"><option value="">Selecione...</option>'+vendOpts+'</select></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Forma Pgto</label><select class="form-control" id="vnPgto"><option value="">Selecione...</option>'+pgtoOpts+'</select></div><div class="form-group"><label>Situação</label><select class="form-control" id="vnSit">'+sitOpts+'</select></div></div>'+
    '<div class="form-group"><label>Entrega</label><select class="form-control" id="vnEnt">'+entOpts+'</select></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="vnObs" rows="2">'+(venda?venda.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda('+(isEdit?venda.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveVenda(id){
  var obj={data:document.getElementById('vnData').value,vencimento:document.getElementById('vnVenc').value,produto:document.getElementById('vnProd').value.trim(),quantidade:parseFloat(document.getElementById('vnQtd').value)||1,valorUnit:parseFloat(document.getElementById('vnValor').value)||0,cliente:document.getElementById('vnCli').value,vendedor:document.getElementById('vnVend').value,formaPagamento:document.getElementById('vnPgto').value,situacao:document.getElementById('vnSit').value,entrega:document.getElementById('vnEnt').value,obs:document.getElementById('vnObs').value};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(!appData.vendas) appData.vendas=[];
  if(id){var idx=appData.vendas.findIndex(function(v){return v.id===id;});if(idx>-1){obj.id=id;appData.vendas[idx]=obj;}}
  else{obj.id=nextId(appData.vendas);appData.vendas.push(obj);}
  saveData();closeCadastroModal();renderVendasPage();showToast(id?'Venda atualizada!':'Venda cadastrada!','success');
}
function editVenda(id){var v=(appData.vendas||[]).find(function(x){return x.id===id;});if(v)openVendaModal(v);}
function viewVenda(id){
  var v=(appData.vendas||[]).find(function(x){return x.id===id;});if(!v)return;
  var total=(v.quantidade||1)*(v.valorUnit||0);
  document.getElementById('viewModalTitle').textContent='Detalhes da Venda';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>'+formatDate(v.data)+'</div><div class="detail-item"><span class="detail-label">Vencimento</span>'+formatDate(v.vencimento)+'</div><div class="detail-item"><span class="detail-label">Produto</span>'+v.produto+'</div><div class="detail-item"><span class="detail-label">Qtd</span>'+v.quantidade+'</div><div class="detail-item"><span class="detail-label">V.Unit</span>'+formatCurrency(v.valorUnit)+'</div><div class="detail-item"><span class="detail-label">Total</span>'+formatCurrency(total)+'</div><div class="detail-item"><span class="detail-label">Cliente</span>'+(v.cliente||'-')+'</div><div class="detail-item"><span class="detail-label">Vendedor</span>'+(v.vendedor||'-')+'</div><div class="detail-item"><span class="detail-label">Pgto</span>'+(v.formaPagamento||'-')+'</div><div class="detail-item"><span class="detail-label">Situação</span>'+situacaoBadge(v.situacao)+'</div><div class="detail-item"><span class="detail-label">Entrega</span>'+situacaoBadge(v.entrega)+'</div></div>'+(v.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+v.obs+'</div>':'');
  openViewModal();
}
function deleteVenda(id){if(!confirm('Excluir venda?'))return;appData.vendas=(appData.vendas||[]).filter(function(v){return v.id!==id;});saveData();renderVendasPage();showToast('Venda excluída!','success');}
function toggleVendasEditMode(){vendasEditMode=!vendasEditMode;var btn=document.getElementById('btnVendasEdit');if(btn)btn.textContent=vendasEditMode?'✅ Finalizar Edição':'✏️ Editar Todos';applyVendasFilters();}
function deleteAllVendas(){if(!confirm('Excluir TODAS as vendas?'))return;appData.vendas=[];saveData();renderVendasPage();showToast('Todas excluídas!','success');}
function onVendasSearch(q){vendasSearchQuery=q.toLowerCase();applyVendasFilters();}
function onVendasFilterSit(s){vendasFilterSit=s;applyVendasFilters();}
function applyVendasFilters(){
  var filtered=appData.vendas||[];
  if(vendasSearchQuery) filtered=filtered.filter(function(v){return(v.produto||'').toLowerCase().includes(vendasSearchQuery)||(v.cliente||'').toLowerCase().includes(vendasSearchQuery);});
  if(vendasFilterSit) filtered=filtered.filter(function(v){return v.situacao===vendasFilterSit;});
  renderVendasTable(filtered);renderVendasResultPanel(filtered);
}
function renderVendasResultPanel(filtered){
  var panel=document.getElementById('vendasResultPanel');if(!panel)return;
  var all=appData.vendas||[];
  var total=filtered.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var recebido=filtered.filter(function(v){return v.situacao==='Pago';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var devendo=filtered.filter(function(v){return v.situacao==='Devendo';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  panel.innerHTML='<div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+filtered.length+' de '+all.length+' registros</div></div><div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">'+formatCurrency(recebido)+'</div></div><div class="card"><div class="card-header"><span>Devendo</span></div><div class="card-value text-danger">'+formatCurrency(devendo)+'</div></div>';
}

// ══════════════════════════════════════════════════════════════
// ── SCR-EST-01: ESTOQUE ──
// ══════════════════════════════════════════════════════════════
function renderEstoquePage(){
  var pg=document.getElementById('page-estoque');if(!pg)return;
  var est=appData.estoque||[];
  pg.innerHTML=
    '<div class="page-header"><h2>📦 Estoque</h2><button class="btn btn-primary" onclick="openEstoqueModal()">+ Novo Item</button></div>'+
    '<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Itens</span></div><div class="card-value">'+est.length+'</div></div><div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value text-success">'+formatCurrency(est.reduce(function(s,e){return s+((e.quantidade||0)*(e.valorUnit||0));},0))+'</div></div></div>'+
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar no estoque..." oninput="filterEstoque(this.value)"></div>'+
    '<div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Unidade</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Ações</th></tr></thead><tbody id="estoqueBody"></tbody></table></div>';
  renderEstoqueTable(est);
}
function renderEstoqueTable(items){var tbody=document.getElementById('estoqueBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum item</td></tr>';return;}tbody.innerHTML=items.map(function(e){return'<tr><td>'+(e.produto||'-')+'</td><td>'+(e.unidade||'-')+'</td><td>'+(e.quantidade||0)+'</td><td>'+formatCurrency(e.valorUnit)+'</td><td>'+formatCurrency((e.quantidade||0)*(e.valorUnit||0))+'</td><td><button class="btn btn-sm btn-primary" onclick="editEstoque('+e.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteEstoque('+e.id+')">🗑️</button></td></tr>';}).join('');}
function filterEstoque(q){q=q.toLowerCase();renderEstoqueTable((appData.estoque||[]).filter(function(e){return(e.produto||'').toLowerCase().includes(q);}));}
function openEstoqueModal(item){
  var isEdit=!!item;var unidOpts=(appData.tipoUnidade||[]).map(function(u){return'<option value="'+u+'"'+(item&&item.unidade===u?' selected':'')+'>'+u+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Item':'Novo Item';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="estProd" value="'+(item?item.produto:'')+'"></div><div class="form-row"><div class="form-group"><label>Unidade</label><select class="form-control" id="estUnid">'+unidOpts+'</select></div><div class="form-group"><label>Qtd</label><input type="number" class="form-control" id="estQtd" value="'+(item?item.quantidade:0)+'" min="0"></div></div><div class="form-group"><label>Valor Unit.</label><input type="number" class="form-control" id="estValor" value="'+(item?item.valorUnit:'')+'" step="0.01"></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEstoque('+(isEdit?item.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveEstoque(id){
  var obj={produto:document.getElementById('estProd').value.trim(),unidade:document.getElementById('estUnid').value,quantidade:parseFloat(document.getElementById('estQtd').value)||0,valorUnit:parseFloat(document.getElementById('estValor').value)||0};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(!appData.estoque) appData.estoque=[];
  if(id){var idx=appData.estoque.findIndex(function(e){return e.id===id;});if(idx>-1){obj.id=id;appData.estoque[idx]=obj;}}
  else{obj.id=nextId(appData.estoque);appData.estoque.push(obj);}
  saveData();closeCadastroModal();renderEstoquePage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editEstoque(id){var e=(appData.estoque||[]).find(function(x){return x.id===id;});if(e)openEstoqueModal(e);}
function deleteEstoque(id){if(!confirm('Excluir?'))return;appData.estoque=(appData.estoque||[]).filter(function(e){return e.id!==id;});saveData();renderEstoquePage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-PRD-01: PRODUTOS ──
// ══════════════════════════════════════════════════════════════
function renderProdutosPage(){
  var pg=document.getElementById('page-produtos');if(!pg)return;var items=appData.produtos||[];
  pg.innerHTML='<div class="page-header"><h2>🏷️ Produtos</h2><button class="btn btn-primary" onclick="openProdutoModal()">+ Novo Produto</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Produtos</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar produto..." oninput="filterProdutos(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th style="width:70px">Imagem</th><th>Nome</th><th>Categoria</th><th>Unidade</th><th>Preço</th><th>Ações</th></tr></thead><tbody id="produtosBody"></tbody></table></div>';
  renderProdutosTable(items);
}
function renderProdutosTable(items){var tbody=document.getElementById('produtosBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto</td></tr>';return;}tbody.innerHTML=items.map(function(p){var img=p.imagem?'<img src="'+p.imagem+'" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="viewProduto('+p.id+')" onerror="this.style.display=\'none\'">':'<span style="color:var(--text-muted)">—</span>';return'<tr><td>'+img+'</td><td>'+(p.nome||'-')+'</td><td>'+(p.categoria||'-')+'</td><td>'+(p.unidade||'-')+'</td><td>'+formatCurrency(p.preco)+'</td><td><button class="btn btn-sm btn-outline" onclick="viewProduto('+p.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editProduto('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProduto('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterProdutos(q){q=q.toLowerCase();renderProdutosTable((appData.produtos||[]).filter(function(p){return(p.nome||'').toLowerCase().includes(q)||(p.categoria||'').toLowerCase().includes(q);}));}
function openProdutoModal(prod){
  var isEdit=!!prod;var unidOpts=(appData.tipoUnidade||[]).map(function(u){return'<option value="'+u+'"'+(prod&&prod.unidade===u?' selected':'')+'>'+u+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Produto':'Novo Produto';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prdNome" value="'+(prod?prod.nome:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="prdCat" value="'+(prod?prod.categoria||'':'')+'"></div><div class="form-group"><label>Unidade</label><select class="form-control" id="prdUnid">'+unidOpts+'</select></div></div>'+
    '<div class="form-group"><label>Preço</label><input type="number" class="form-control" id="prdPreco" value="'+(prod?prod.preco||'':'')+'" step="0.01"></div>'+
    '<div class="form-group"><label>Imagem do Produto</label><div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center;margin-top:4px"><input type="file" id="prdImgFile" accept="image/jpeg,image/png,image/webp" style="display:none"><button type="button" class="btn btn-outline" onclick="document.getElementById(\'prdImgFile\').click()" style="margin-bottom:8px">📁 Carregar Imagem do Computador</button><p style="font-size:.75rem;color:var(--text-muted);margin:4px 0 0 0">Tamanho ideal: <strong>500 x 500 px</strong> (quadrada) — JPG, PNG ou WEBP — Máx: 2 MB</p></div><div id="prdImgPreview" style="margin-top:10px;text-align:center">'+(prod&&prod.imagem?'<img src="'+prod.imagem+'" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover"><br><button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="document.getElementById(\'prdImgPreview\').innerHTML=\'\';document.getElementById(\'prdImgFile\').setAttribute(\'data-base64\',\'REMOVER\')">🗑️ Remover</button>':'')+'</div></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="prdObs" rows="2">'+(prod?prod.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduto('+(isEdit?prod.id:'null')+')">Salvar</button>';
  openCadastroModal();setTimeout(function(){handleImageUpload('prdImgFile','prdImgPreview');},50);
}
function saveProduto(id){
  var imgInput=document.getElementById('prdImgFile');var base64=imgInput?imgInput.getAttribute('data-base64'):null;var imagem='';
  if(base64==='REMOVER') imagem=''; else if(base64) imagem=base64; else if(id){var ex=(appData.produtos||[]).find(function(p){return p.id===id;});imagem=ex?ex.imagem||'':'';}
  var obj={nome:document.getElementById('prdNome').value.trim(),categoria:document.getElementById('prdCat').value.trim(),unidade:document.getElementById('prdUnid').value,preco:parseFloat(document.getElementById('prdPreco').value)||0,imagem:imagem,obs:document.getElementById('prdObs').value.trim()};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.produtos) appData.produtos=[];
  if(id){var idx=appData.produtos.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.produtos[idx]=obj;}}
  else{obj.id=nextId(appData.produtos);appData.produtos.push(obj);}
  saveData();closeCadastroModal();renderProdutosPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editProduto(id){var p=(appData.produtos||[]).find(function(x){return x.id===id;});if(p)openProdutoModal(p);}
function deleteProduto(id){if(!confirm('Excluir?'))return;appData.produtos=(appData.produtos||[]).filter(function(p){return p.id!==id;});saveData();renderProdutosPage();showToast('Excluído!','success');}
function viewProduto(id){
  var p=(appData.produtos||[]).find(function(x){return x.id===id;});if(!p)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Produto';
  document.getElementById('viewModalBody').innerHTML='<div style="text-align:center;margin-bottom:16px">'+(p.imagem?'<img src="'+p.imagem+'" style="max-width:300px;max-height:250px;border-radius:10px;object-fit:cover">':'<span style="color:var(--text-muted)">Sem imagem</span>')+'</div><div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+(p.nome||'-')+'</div><div class="detail-item"><span class="detail-label">Categoria</span>'+(p.categoria||'-')+'</div><div class="detail-item"><span class="detail-label">Unidade</span>'+(p.unidade||'-')+'</div><div class="detail-item"><span class="detail-label">Preço</span>'+formatCurrency(p.preco)+'</div></div>'+(p.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+p.obs+'</div>':'');
  openViewModal();
}

// ══════════════════════════════════════════════════════════════
// ── SCR-PFN-01: P. FORNECEDORES ──
// ══════════════════════════════════════════════════════════════
function renderPFornecedoresPage(){
  var pg=document.getElementById('page-pfornecedores');if(!pg)return;var items=appData.pFornecedores||[];
  pg.innerHTML='<div class="page-header"><h2>📋 P. Fornecedores</h2><button class="btn btn-primary" onclick="openPFornModal()">+ Novo Produto</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPForn(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th style="width:70px">Imagem</th><th>Produto</th><th>Fornecedor</th><th>Categoria</th><th>Unidade</th><th>Preço</th><th>Ações</th></tr></thead><tbody id="pfornBody"></tbody></table></div>';
  renderPFornTable(items);
}
function renderPFornTable(items){var tbody=document.getElementById('pfornBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>';return;}tbody.innerHTML=items.map(function(p){var img=p.imagem?'<img src="'+p.imagem+'" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer" onclick="viewPForn('+p.id+')" onerror="this.style.display=\'none\'">':'<span style="color:var(--text-muted)">—</span>';return'<tr><td>'+img+'</td><td>'+(p.produto||p.nome||'-')+'</td><td>'+(p.fornecedor||'-')+'</td><td>'+(p.categoria||'-')+'</td><td>'+(p.unidade||'-')+'</td><td>'+formatCurrency(p.preco)+'</td><td><button class="btn btn-sm btn-outline" onclick="viewPForn('+p.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editPForn('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePForn('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterPForn(q){q=q.toLowerCase();renderPFornTable((appData.pFornecedores||[]).filter(function(p){return(p.produto||p.nome||'').toLowerCase().includes(q)||(p.fornecedor||'').toLowerCase().includes(q);}));}
function openPFornModal(prod){
  var isEdit=!!prod;
  var fornOpts=(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(prod&&prod.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');
  var unidOpts=(appData.tipoUnidade||[]).map(function(u){return'<option value="'+u+'"'+(prod&&prod.unidade===u?' selected':'')+'>'+u+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Produto':'Novo Produto';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="pfProd" value="'+(prod?prod.produto||prod.nome||'':'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Fornecedor *</label><select class="form-control" id="pfForn"><option value="">Selecione...</option>'+fornOpts+'</select></div><div class="form-group"><label>Categoria</label><input type="text" class="form-control" id="pfCat" value="'+(prod?prod.categoria||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Unidade</label><select class="form-control" id="pfUnid">'+unidOpts+'</select></div><div class="form-group"><label>Preço</label><input type="number" class="form-control" id="pfPreco" value="'+(prod?prod.preco||'':'')+'" step="0.01"></div></div>'+
    '<div class="form-group"><label>Imagem</label><div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center;margin-top:4px"><input type="file" id="pfImgFile" accept="image/jpeg,image/png,image/webp" style="display:none"><button type="button" class="btn btn-outline" onclick="document.getElementById(\'pfImgFile\').click()" style="margin-bottom:8px">📁 Carregar Imagem do Computador</button><p style="font-size:.75rem;color:var(--text-muted);margin:4px 0 0 0">Tamanho ideal: <strong>500 x 500 px</strong> — JPG, PNG ou WEBP — Máx: 2 MB</p></div><div id="pfImgPreview" style="margin-top:10px;text-align:center">'+(prod&&prod.imagem?'<img src="'+prod.imagem+'" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover"><br><button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="document.getElementById(\'pfImgPreview\').innerHTML=\'\';document.getElementById(\'pfImgFile\').setAttribute(\'data-base64\',\'REMOVER\')">🗑️ Remover</button>':'')+'</div></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="pfObs" rows="2">'+(prod?prod.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePForn('+(isEdit?prod.id:'null')+')">Salvar</button>';
  openCadastroModal();setTimeout(function(){handleImageUpload('pfImgFile','pfImgPreview');},50);
}
function savePForn(id){
  var imgInput=document.getElementById('pfImgFile');var base64=imgInput?imgInput.getAttribute('data-base64'):null;var imagem='';
  if(base64==='REMOVER') imagem=''; else if(base64) imagem=base64; else if(id){var ex=(appData.pFornecedores||[]).find(function(p){return p.id===id;});imagem=ex?ex.imagem||'':'';}
  var obj={produto:document.getElementById('pfProd').value.trim(),fornecedor:document.getElementById('pfForn').value,categoria:document.getElementById('pfCat').value.trim(),unidade:document.getElementById('pfUnid').value,preco:parseFloat(document.getElementById('pfPreco').value)||0,imagem:imagem,obs:document.getElementById('pfObs').value.trim()};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(!obj.fornecedor){showToast('Selecione o fornecedor','error');return;}
  if(!appData.pFornecedores) appData.pFornecedores=[];
  if(id){var idx=appData.pFornecedores.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.pFornecedores[idx]=obj;}}
  else{obj.id=nextId(appData.pFornecedores);appData.pFornecedores.push(obj);}
  saveData();closeCadastroModal();renderPFornecedoresPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editPForn(id){var p=(appData.pFornecedores||[]).find(function(x){return x.id===id;});if(p)openPFornModal(p);}
function deletePForn(id){if(!confirm('Excluir?'))return;appData.pFornecedores=(appData.pFornecedores||[]).filter(function(p){return p.id!==id;});saveData();renderPFornecedoresPage();showToast('Excluído!','success');}
function viewPForn(id){
  var p=(appData.pFornecedores||[]).find(function(x){return x.id===id;});if(!p)return;
  document.getElementById('viewModalTitle').textContent='Detalhes';
  document.getElementById('viewModalBody').innerHTML='<div style="text-align:center;margin-bottom:16px">'+(p.imagem?'<img src="'+p.imagem+'" style="max-width:300px;max-height:250px;border-radius:10px;object-fit:cover">':'<span style="color:var(--text-muted)">Sem imagem</span>')+'</div><div class="detail-grid"><div class="detail-item"><span class="detail-label">Produto</span>'+(p.produto||p.nome||'-')+'</div><div class="detail-item"><span class="detail-label">Fornecedor</span>'+(p.fornecedor||'-')+'</div><div class="detail-item"><span class="detail-label">Categoria</span>'+(p.categoria||'-')+'</div><div class="detail-item"><span class="detail-label">Unidade</span>'+(p.unidade||'-')+'</div><div class="detail-item"><span class="detail-label">Preço</span>'+formatCurrency(p.preco)+'</div></div>'+(p.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+p.obs+'</div>':'');
  openViewModal();
}

// ══════════════════════════════════════════════════════════════
// ── SCR-CLI-01: CLIENTES ──
// ══════════════════════════════════════════════════════════════
function renderClientesPage(){
  var pg=document.getElementById('page-clientes');if(!pg)return;var items=appData.clientes||[];
  pg.innerHTML='<div class="page-header"><h2>👥 Clientes</h2><button class="btn btn-primary" onclick="openClienteModal()">+ Novo Cliente</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Clientes</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cliente..." oninput="filterClientes(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead><tbody id="clientesBody"></tbody></table></div>';
  renderClientesTable(items);
}
function renderClientesTable(items){var tbody=document.getElementById('clientesBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cliente</td></tr>';return;}tbody.innerHTML=items.map(function(c){return'<tr><td>'+(c.nome||'-')+'</td><td>'+(c.cpfCnpj||'-')+'</td><td>'+(c.telefone||c.celular||'-')+'</td><td>'+(c.cidade||'-')+'</td><td><button class="btn btn-sm btn-outline" onclick="viewCliente('+c.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCliente('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCliente('+c.id+')">🗑️</button></td></tr>';}).join('');}
function filterClientes(q){q=q.toLowerCase();renderClientesTable((appData.clientes||[]).filter(function(c){return(c.nome||'').toLowerCase().includes(q)||(c.cpfCnpj||'').includes(q);}));}
function openClienteModal(cli){
  var isEdit=!!cli;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cliente':'Novo Cliente';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="clNome" value="'+(cli?cli.nome:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="clCpfCnpj" value="'+(cli?cli.cpfCnpj||'':'')+'"></div><div class="form-group"><label>RG</label><input type="text" class="form-control" id="clRg" value="'+(cli?cli.rg||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="clTelefone" value="'+(cli?cli.telefone||'':'')+'"></div><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="clCelular" value="'+(cli?cli.celular||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Email</label><input type="email" class="form-control" id="clEmail" value="'+(cli?cli.email||'':'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="clEnd" value="'+(cli?cli.endereco||'':'')+'"></div><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="clCidade" value="'+(cli?cli.cidade||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Estado</label><input type="text" class="form-control" id="clEstado" value="'+(cli?cli.estado||'':'')+'"></div><div class="form-group"><label>CEP</label><input type="text" class="form-control" id="clCep" value="'+(cli?cli.cep||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="clObs" rows="2">'+(cli?cli.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCliente('+(isEdit?cli.id:'null')+')">Salvar</button>';
  openCadastroModal();applyAllMasks();
}
function saveCliente(id){
  var obj={nome:document.getElementById('clNome').value.trim(),cpfCnpj:document.getElementById('clCpfCnpj').value.trim(),rg:document.getElementById('clRg').value.trim(),telefone:document.getElementById('clTelefone').value.trim(),celular:document.getElementById('clCelular').value.trim(),email:document.getElementById('clEmail').value.trim(),endereco:document.getElementById('clEnd').value.trim(),cidade:document.getElementById('clCidade').value.trim(),estado:document.getElementById('clEstado').value.trim(),cep:document.getElementById('clCep').value.trim(),obs:document.getElementById('clObs').value.trim()};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.clientes) appData.clientes=[];
  if(id){var idx=appData.clientes.findIndex(function(c){return c.id===id;});if(idx>-1){obj.id=id;appData.clientes[idx]=obj;}}
  else{obj.id=nextId(appData.clientes);appData.clientes.push(obj);}
  saveData();closeCadastroModal();renderClientesPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editCliente(id){var c=(appData.clientes||[]).find(function(x){return x.id===id;});if(c)openClienteModal(c);}
function deleteCliente(id){if(!confirm('Excluir?'))return;appData.clientes=(appData.clientes||[]).filter(function(c){return c.id!==id;});saveData();renderClientesPage();showToast('Excluído!','success');}
function viewCliente(id){
  var c=(appData.clientes||[]).find(function(x){return x.id===id;});if(!c)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Cliente';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+(c.nome||'-')+'</div><div class="detail-item"><span class="detail-label">CPF/CNPJ</span>'+(c.cpfCnpj||'-')+'</div><div class="detail-item"><span class="detail-label">RG</span>'+(c.rg||'-')+'</div><div class="detail-item"><span class="detail-label">Telefone</span>'+(c.telefone||'-')+'</div><div class="detail-item"><span class="detail-label">Celular</span>'+(c.celular||'-')+'</div><div class="detail-item"><span class="detail-label">Email</span>'+(c.email||'-')+'</div><div class="detail-item"><span class="detail-label">Endereço</span>'+(c.endereco||'-')+'</div><div class="detail-item"><span class="detail-label">Cidade</span>'+(c.cidade||'-')+'</div><div class="detail-item"><span class="detail-label">Estado</span>'+(c.estado||'-')+'</div><div class="detail-item"><span class="detail-label">CEP</span>'+(c.cep||'-')+'</div></div>'+(c.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+c.obs+'</div>':'');
  openViewModal();
}

// ══════════════════════════════════════════════════════════════
// ── SCR-FRN-01: FORNECEDORES ──
// ══════════════════════════════════════════════════════════════
function renderFornecedoresPage(){
  var pg=document.getElementById('page-fornecedores');if(!pg)return;var items=appData.fornecedores||[];
  pg.innerHTML='<div class="page-header"><h2>🏭 Fornecedores</h2><button class="btn btn-primary" onclick="openFornecedorModal()">+ Novo Fornecedor</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Fornecedores</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar fornecedor..." oninput="filterFornecedores(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead><tbody id="fornecedoresBody"></tbody></table></div>';
  renderFornecedoresTable(items);
}
function renderFornecedoresTable(items){var tbody=document.getElementById('fornecedoresBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum fornecedor</td></tr>';return;}tbody.innerHTML=items.map(function(f){return'<tr><td>'+(f.nome||'-')+'</td><td>'+(f.cnpj||f.cpfCnpj||'-')+'</td><td>'+(f.telefone||f.celular||'-')+'</td><td>'+(f.cidade||'-')+'</td><td><button class="btn btn-sm btn-outline" onclick="viewFornecedor('+f.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editFornecedor('+f.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFornecedor('+f.id+')">🗑️</button></td></tr>';}).join('');}
function filterFornecedores(q){q=q.toLowerCase();renderFornecedoresTable((appData.fornecedores||[]).filter(function(f){return(f.nome||'').toLowerCase().includes(q)||(f.cnpj||'').includes(q);}));}
function openFornecedorModal(fn){
  var isEdit=!!fn;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Fornecedor':'Novo Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="fnNome" value="'+(fn?fn.nome:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="fnCpfCnpj" value="'+(fn?fn.cpfCnpj||fn.cnpj||'':'')+'"></div><div class="form-group"><label>IE</label><input type="text" class="form-control" id="fnIe" value="'+(fn?fn.ie||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="fnTelefone" value="'+(fn?fn.telefone||'':'')+'"></div><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="fnCelular" value="'+(fn?fn.celular||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Email</label><input type="email" class="form-control" id="fnEmail" value="'+(fn?fn.email||'':'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="fnEnd" value="'+(fn?fn.endereco||'':'')+'"></div><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="fnCidade" value="'+(fn?fn.cidade||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Estado</label><input type="text" class="form-control" id="fnEstado" value="'+(fn?fn.estado||'':'')+'"></div><div class="form-group"><label>CEP</label><input type="text" class="form-control" id="fnCep" value="'+(fn?fn.cep||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="fnObs" rows="2">'+(fn?fn.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFornecedor('+(isEdit?fn.id:'null')+')">Salvar</button>';
  openCadastroModal();applyAllMasks();
}
function saveFornecedor(id){
  var obj={nome:document.getElementById('fnNome').value.trim(),cpfCnpj:document.getElementById('fnCpfCnpj').value.trim(),ie:document.getElementById('fnIe').value.trim(),telefone:document.getElementById('fnTelefone').value.trim(),celular:document.getElementById('fnCelular').value.trim(),email:document.getElementById('fnEmail').value.trim(),endereco:document.getElementById('fnEnd').value.trim(),cidade:document.getElementById('fnCidade').value.trim(),estado:document.getElementById('fnEstado').value.trim(),cep:document.getElementById('fnCep').value.trim(),obs:document.getElementById('fnObs').value.trim()};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.fornecedores) appData.fornecedores=[];
  if(id){var idx=appData.fornecedores.findIndex(function(f){return f.id===id;});if(idx>-1){obj.id=id;appData.fornecedores[idx]=obj;}}
  else{obj.id=nextId(appData.fornecedores);appData.fornecedores.push(obj);}
  saveData();closeCadastroModal();renderFornecedoresPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editFornecedor(id){var f=(appData.fornecedores||[]).find(function(x){return x.id===id;});if(f)openFornecedorModal(f);}
function deleteFornecedor(id){if(!confirm('Excluir?'))return;appData.fornecedores=(appData.fornecedores||[]).filter(function(f){return f.id!==id;});saveData();renderFornecedoresPage();showToast('Excluído!','success');}
function viewFornecedor(id){
  var f=(appData.fornecedores||[]).find(function(x){return x.id===id;});if(!f)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Fornecedor';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+(f.nome||'-')+'</div><div class="detail-item"><span class="detail-label">CPF/CNPJ</span>'+(f.cpfCnpj||f.cnpj||'-')+'</div><div class="detail-item"><span class="detail-label">IE</span>'+(f.ie||'-')+'</div><div class="detail-item"><span class="detail-label">Telefone</span>'+(f.telefone||'-')+'</div><div class="detail-item"><span class="detail-label">Celular</span>'+(f.celular||'-')+'</div><div class="detail-item"><span class="detail-label">Email</span>'+(f.email||'-')+'</div><div class="detail-item"><span class="detail-label">Endereço</span>'+(f.endereco||'-')+'</div><div class="detail-item"><span class="detail-label">Cidade</span>'+(f.cidade||'-')+'</div><div class="detail-item"><span class="detail-label">Estado</span>'+(f.estado||'-')+'</div><div class="detail-item"><span class="detail-label">CEP</span>'+(f.cep||'-')+'</div></div>'+(f.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+f.obs+'</div>':'');
  openViewModal();
}

// ══════════════════════════════════════════════════════════════
// ── SCR-BOL-01: BOLETOS ──
// ══════════════════════════════════════════════════════════════
function renderBoletosPage(){
  var pg=document.getElementById('page-boletos');if(!pg)return;var items=appData.boletos||[];
  var totalBol=items.reduce(function(s,b){return s+(b.valor||0);},0);
  var pendBol=items.filter(function(b){return b.situacao!=='Pago';}).reduce(function(s,b){return s+(b.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>📄 Boletos</h2><button class="btn btn-primary" onclick="openBoletoModal()">+ Novo Boleto</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Boletos</span></div><div class="card-value">'+formatCurrency(totalBol)+'</div><div class="card-sub">'+items.length+' boleto(s)</div></div><div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-danger">'+formatCurrency(pendBol)+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar boleto..." oninput="filterBoletos(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Fornecedor</th><th>Valor</th><th>Vencimento</th><th>Dias</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="boletosBody"></tbody></table></div>';
  renderBoletosTable(items);
}
function renderBoletosTable(items){var tbody=document.getElementById('boletosBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>';return;}tbody.innerHTML=items.map(function(b){var dias=calcDiasRestantes(b.vencimento);return'<tr><td>'+formatDate(b.data)+'</td><td>'+(b.descricao||'-')+'</td><td>'+(b.fornecedor||'-')+'</td><td>'+formatCurrency(b.valor)+'</td><td>'+formatDate(b.vencimento)+'</td><td>'+formatDiasRestantes(dias,b.situacao)+'</td><td>'+situacaoBadge(b.situacao)+'</td><td><button class="btn btn-sm btn-primary" onclick="editBoleto('+b.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBoleto('+b.id+')">🗑️</button></td></tr>';}).join('');}
function filterBoletos(q){q=q.toLowerCase();renderBoletosTable((appData.boletos||[]).filter(function(b){return(b.descricao||'').toLowerCase().includes(q)||(b.fornecedor||'').toLowerCase().includes(q);}));}
function openBoletoModal(bol){
  var isEdit=!!bol;var fornOpts=(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(bol&&bol.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');
  var sitOpts=(appData.situacaoBoleto||[]).map(function(s){return'<option value="'+s+'"'+(bol&&bol.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Boleto':'Novo Boleto';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="bolData" value="'+(bol?bol.data:todayStr())+'"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="bolVenc" value="'+(bol?bol.vencimento||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="bolDesc" value="'+(bol?bol.descricao:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Fornecedor</label><select class="form-control" id="bolForn"><option value="">Selecione...</option>'+fornOpts+'</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="bolValor" value="'+(bol?bol.valor:'')+'" step="0.01"></div></div>'+
    '<div class="form-group"><label>Situação</label><select class="form-control" id="bolSit">'+sitOpts+'</select></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="bolObs" rows="2">'+(bol?bol.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBoleto('+(isEdit?bol.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveBoleto(id){
  var obj={data:document.getElementById('bolData').value,vencimento:document.getElementById('bolVenc').value,descricao:document.getElementById('bolDesc').value.trim(),fornecedor:document.getElementById('bolForn').value,valor:parseFloat(document.getElementById('bolValor').value)||0,situacao:document.getElementById('bolSit').value,obs:document.getElementById('bolObs').value.trim()};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!appData.boletos) appData.boletos=[];
  if(id){var idx=appData.boletos.findIndex(function(b){return b.id===id;});if(idx>-1){obj.id=id;appData.boletos[idx]=obj;}}
  else{obj.id=nextId(appData.boletos);appData.boletos.push(obj);}
  saveData();closeCadastroModal();renderBoletosPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editBoleto(id){var b=(appData.boletos||[]).find(function(x){return x.id===id;});if(b)openBoletoModal(b);}
function deleteBoleto(id){if(!confirm('Excluir?'))return;appData.boletos=(appData.boletos||[]).filter(function(b){return b.id!==id;});saveData();renderBoletosPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-CHQ-01: CHEQUES ──
// ══════════════════════════════════════════════════════════════
function renderChequesPage(){
  var pg=document.getElementById('page-cheques');if(!pg)return;var items=appData.cheques||[];
  var totalChq=items.reduce(function(s,ch){return s+(ch.valor||0);},0);
  var pendChq=items.filter(function(ch){return ch.situacao!=='Compensado';}).reduce(function(s,ch){return s+(ch.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>📝 Cheques</h2><button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Cheques</span></div><div class="card-value">'+formatCurrency(totalChq)+'</div><div class="card-sub">'+items.length+' cheque(s)</div></div><div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-warning">'+formatCurrency(pendChq)+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cheque..." oninput="filterCheques(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Nº Cheque</th><th>Emitente</th><th>Valor</th><th>Bom Para</th><th>Dias</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="chequesBody"></tbody></table></div>';
  renderChequesTable(items);
}
function renderChequesTable(items){var tbody=document.getElementById('chequesBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>';return;}tbody.innerHTML=items.map(function(ch){var dias=calcDiasRestantes(ch.bomPara);return'<tr><td>'+formatDate(ch.data)+'</td><td>'+(ch.numero||'-')+'</td><td>'+(ch.emitente||'-')+'</td><td>'+formatCurrency(ch.valor)+'</td><td>'+formatDate(ch.bomPara)+'</td><td>'+formatDiasRestantes(dias,ch.situacao)+'</td><td>'+situacaoBadge(ch.situacao)+'</td><td><button class="btn btn-sm btn-primary" onclick="editCheque('+ch.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCheque('+ch.id+')">🗑️</button></td></tr>';}).join('');}
function filterCheques(q){q=q.toLowerCase();renderChequesTable((appData.cheques||[]).filter(function(ch){return(ch.emitente||'').toLowerCase().includes(q)||(ch.numero||'').toLowerCase().includes(q);}));}
function openChequeModal(ch){
  var isEdit=!!ch;
  var sitOpts=(appData.situacaoCheque||[]).map(function(s){return'<option value="'+s+'"'+(ch&&ch.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cheque':'Novo Cheque';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="chqData" value="'+(ch?ch.data:todayStr())+'"></div><div class="form-group"><label>Bom Para</label><input type="date" class="form-control" id="chqBom" value="'+(ch?ch.bomPara||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Nº Cheque</label><input type="text" class="form-control" id="chqNum" value="'+(ch?ch.numero||'':'')+'"></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="chqValor" value="'+(ch?ch.valor:'')+'" step="0.01"></div></div>'+
    '<div class="form-group"><label>Emitente *</label><input type="text" class="form-control" id="chqEmit" value="'+(ch?ch.emitente:'')+'"></div>'+
    '<div class="form-group"><label>Situação</label><select class="form-control" id="chqSit">'+sitOpts+'</select></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="chqObs" rows="2">'+(ch?ch.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCheque('+(isEdit?ch.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveCheque(id){
  var obj={data:document.getElementById('chqData').value,bomPara:document.getElementById('chqBom').value,numero:document.getElementById('chqNum').value.trim(),valor:parseFloat(document.getElementById('chqValor').value)||0,emitente:document.getElementById('chqEmit').value.trim(),situacao:document.getElementById('chqSit').value,obs:document.getElementById('chqObs').value.trim()};
  if(!obj.emitente){showToast('Informe o emitente','error');return;}
  if(!appData.cheques) appData.cheques=[];
  if(id){var idx=appData.cheques.findIndex(function(ch){return ch.id===id;});if(idx>-1){obj.id=id;appData.cheques[idx]=obj;}}
  else{obj.id=nextId(appData.cheques);appData.cheques.push(obj);}
  saveData();closeCadastroModal();renderChequesPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editCheque(id){var ch=(appData.cheques||[]).find(function(x){return x.id===id;});if(ch)openChequeModal(ch);}
function deleteCheque(id){if(!confirm('Excluir?'))return;appData.cheques=(appData.cheques||[]).filter(function(ch){return ch.id!==id;});saveData();renderChequesPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-PRT-01: PRESTAÇÕES ──
// ══════════════════════════════════════════════════════════════
function renderPrestacoesPage(){
  var pg=document.getElementById('page-prestacoes');if(!pg)return;var items=appData.prestacoes||[];
  var totalPrest=items.reduce(function(s,p){return s+(p.valor||0);},0);
  var mesesLabel=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var porMes={};items.forEach(function(p){if(p.data){var m=parseInt(p.data.split('-')[1],10)-1;if(!porMes[m])porMes[m]=0;porMes[m]+=(p.valor||0);}});
  var mesCards='';for(var i=0;i<12;i++){if(porMes[i])mesCards+='<div class="card"><div class="card-header"><span>'+mesesLabel[i]+'</span></div><div class="card-value">'+formatCurrency(porMes[i])+'</div></div>';}
  pg.innerHTML='<div class="page-header"><h2>💳 Prestações</h2><button class="btn btn-primary" onclick="openPrestacaoModal()">+ Nova Prestação</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Prestações</span></div><div class="card-value">'+formatCurrency(totalPrest)+'</div><div class="card-sub">'+items.length+' prestação(ões)</div></div>'+mesCards+'</div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar prestação..." oninput="filterPrestacoes(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Parcelas</th><th>Valor</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="prestacoesBody"></tbody></table></div>';
  renderPrestacoesTable(items);
}
function renderPrestacoesTable(items){var tbody=document.getElementById('prestacoesBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma prestação</td></tr>';return;}tbody.innerHTML=items.map(function(p){return'<tr><td>'+formatDate(p.data)+'</td><td>'+(p.descricao||'-')+'</td><td>'+(p.parcelas||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+situacaoBadge(p.situacao)+'</td><td><button class="btn btn-sm btn-primary" onclick="editPrestacao('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePrestacao('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterPrestacoes(q){q=q.toLowerCase();renderPrestacoesTable((appData.prestacoes||[]).filter(function(p){return(p.descricao||'').toLowerCase().includes(q);}));}
function openPrestacaoModal(prest){
  var isEdit=!!prest;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Prestação':'Nova Prestação';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="prtData" value="'+(prest?prest.data:todayStr())+'"></div><div class="form-group"><label>Parcelas</label><input type="number" class="form-control" id="prtParcelas" value="'+(prest?prest.parcelas||'':'')+'" min="1"></div></div>'+
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="prtDesc" value="'+(prest?prest.descricao:'')+'"></div>'+
    '<div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prtValor" value="'+(prest?prest.valor:'')+'" step="0.01"></div>'+
    '<div class="form-group"><label>Situação</label><select class="form-control" id="prtSit"><option value="Pendente"'+(prest&&prest.situacao==='Pendente'?' selected':'')+'>Pendente</option><option value="Pago"'+(prest&&prest.situacao==='Pago'?' selected':'')+'>Pago</option></select></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="prtObs" rows="2">'+(prest?prest.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePrestacao('+(isEdit?prest.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function savePrestacao(id){
  var obj={data:document.getElementById('prtData').value,parcelas:parseInt(document.getElementById('prtParcelas').value)||0,descricao:document.getElementById('prtDesc').value.trim(),valor:parseFloat(document.getElementById('prtValor').value)||0,situacao:document.getElementById('prtSit').value,obs:document.getElementById('prtObs').value.trim()};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!appData.prestacoes) appData.prestacoes=[];
  if(id){var idx=appData.prestacoes.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.prestacoes[idx]=obj;}}
  else{obj.id=nextId(appData.prestacoes);appData.prestacoes.push(obj);}
  saveData();closeCadastroModal();renderPrestacoesPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editPrestacao(id){var p=(appData.prestacoes||[]).find(function(x){return x.id===id;});if(p)openPrestacaoModal(p);}
function deletePrestacao(id){if(!confirm('Excluir?'))return;appData.prestacoes=(appData.prestacoes||[]).filter(function(p){return p.id!==id;});saveData();renderPrestacoesPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-GAR-01: GARANTIAS ──
// ══════════════════════════════════════════════════════════════
function renderGarantiasPage(){
  var pg=document.getElementById('page-garantias');if(!pg)return;var items=appData.garantias||[];
  var ativas=items.filter(function(g){return getGarantiaSituacaoAuto(g.dataInicio,g.diasGarantia,g.situacao)==='Ativa';}).length;
  var vencidas=items.filter(function(g){return getGarantiaSituacaoAuto(g.dataInicio,g.diasGarantia,g.situacao)==='Vencida';}).length;
  pg.innerHTML='<div class="page-header"><h2>🛡️ Garantias</h2><button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+items.length+'</div></div><div class="card"><div class="card-header"><span>Ativas</span></div><div class="card-value text-success">'+ativas+'</div></div><div class="card"><div class="card-header"><span>Vencidas</span></div><div class="card-value text-danger">'+vencidas+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar garantia..." oninput="filterGarantias(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Cliente</th><th>Data Início</th><th>Dias Garantia</th><th>Dias Restantes</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="garantiasBody"></tbody></table></div>';
  renderGarantiasTable(items);
}
function renderGarantiasTable(items){var tbody=document.getElementById('garantiasBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>';return;}tbody.innerHTML=items.map(function(g){var dias=calcDiasGarantia(g.dataInicio,g.diasGarantia);var sit=getGarantiaSituacaoAuto(g.dataInicio,g.diasGarantia,g.situacao);return'<tr><td>'+(g.produto||'-')+'</td><td>'+(g.cliente||'-')+'</td><td>'+formatDate(g.dataInicio)+'</td><td>'+(g.diasGarantia||'-')+'</td><td>'+formatDiasGarantia(dias,sit)+'</td><td>'+situacaoBadge(sit)+'</td><td><button class="btn btn-sm btn-primary" onclick="editGarantia('+g.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGarantia('+g.id+')">🗑️</button></td></tr>';}).join('');}
function filterGarantias(q){q=q.toLowerCase();renderGarantiasTable((appData.garantias||[]).filter(function(g){return(g.produto||'').toLowerCase().includes(q)||(g.cliente||'').toLowerCase().includes(q);}));}
function openGarantiaModal(gar){
  var isEdit=!!gar;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(gar&&gar.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  var sitOpts=(appData.situacaoGarantia||[]).map(function(s){return'<option value="'+s+'"'+(gar&&gar.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Garantia':'Nova Garantia';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="garProd" value="'+(gar?gar.produto:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="garCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Data Início</label><input type="date" class="form-control" id="garData" value="'+(gar?gar.dataInicio:todayStr())+'"></div></div>'+
    '<div class="form-group"><label>Dias de Garantia *</label><input type="number" class="form-control" id="garDias" value="'+(gar?gar.diasGarantia:'')+'" min="1"></div>'+
    '<div class="form-group"><label>Situação</label><select class="form-control" id="garSit">'+sitOpts+'</select></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="garObs" rows="2">'+(gar?gar.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGarantia('+(isEdit?gar.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveGarantia(id){
  var obj={produto:document.getElementById('garProd').value.trim(),cliente:document.getElementById('garCli').value,dataInicio:document.getElementById('garData').value,diasGarantia:parseInt(document.getElementById('garDias').value)||0,situacao:document.getElementById('garSit').value,obs:document.getElementById('garObs').value.trim()};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(!obj.diasGarantia){showToast('Informe os dias','error');return;}
  if(!appData.garantias) appData.garantias=[];
  if(id){var idx=appData.garantias.findIndex(function(g){return g.id===id;});if(idx>-1){obj.id=id;appData.garantias[idx]=obj;}}
  else{obj.id=nextId(appData.garantias);appData.garantias.push(obj);}
  saveData();closeCadastroModal();renderGarantiasPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editGarantia(id){var g=(appData.garantias||[]).find(function(x){return x.id===id;});if(g)openGarantiaModal(g);}
function deleteGarantia(id){if(!confirm('Excluir?'))return;appData.garantias=(appData.garantias||[]).filter(function(g){return g.id!==id;});saveData();renderGarantiasPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-NTE-01: NOTAS ENTRADA ──
// ══════════════════════════════════════════════════════════════
function renderNotasEntradaPage(){
  var pg=document.getElementById('page-notasentrada');if(!pg)return;var items=appData.notasEntrada||[];
  var totalNE=items.reduce(function(s,n){return s+(n.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>📥 Notas Entrada</h2><button class="btn btn-primary" onclick="openNotaEntradaModal()">+ Nova Nota</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Notas Entrada</span></div><div class="card-value text-success">'+formatCurrency(totalNE)+'</div><div class="card-sub">'+items.length+' nota(s)</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar nota..." oninput="filterNotasEntrada(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Nº Nota</th><th>Fornecedor</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="notasEntradaBody"></tbody></table></div>';
  renderNotasEntradaTable(items);
}
function renderNotasEntradaTable(items){var tbody=document.getElementById('notasEntradaBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>';return;}tbody.innerHTML=items.map(function(n){return'<tr><td>'+formatDate(n.data)+'</td><td>'+(n.numero||'-')+'</td><td>'+(n.fornecedor||'-')+'</td><td>'+(n.descricao||'-')+'</td><td>'+formatCurrency(n.valor)+'</td><td><button class="btn btn-sm btn-primary" onclick="editNotaEntrada('+n.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada('+n.id+')">🗑️</button></td></tr>';}).join('');}
function filterNotasEntrada(q){q=q.toLowerCase();renderNotasEntradaTable((appData.notasEntrada||[]).filter(function(n){return(n.descricao||'').toLowerCase().includes(q)||(n.fornecedor||'').toLowerCase().includes(q);}));}
function openNotaEntradaModal(nota){
  var isEdit=!!nota;var fornOpts=(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(nota&&nota.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota Entrada':'Nova Nota Entrada';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="neData" value="'+(nota?nota.data:todayStr())+'"></div><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="neNum" value="'+(nota?nota.numero||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Fornecedor</label><select class="form-control" id="neForn"><option value="">Selecione...</option>'+fornOpts+'</select></div>'+
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="neDesc" value="'+(nota?nota.descricao:'')+'"></div>'+
    '<div class="form-group"><label>Valor</label><input type="number" class="form-control" id="neValor" value="'+(nota?nota.valor:'')+'" step="0.01"></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="neObs" rows="2">'+(nota?nota.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaEntrada('+(isEdit?nota.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveNotaEntrada(id){
  var obj={data:document.getElementById('neData').value,numero:document.getElementById('neNum').value.trim(),fornecedor:document.getElementById('neForn').value,descricao:document.getElementById('neDesc').value.trim(),valor:parseFloat(document.getElementById('neValor').value)||0,obs:document.getElementById('neObs').value.trim()};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!appData.notasEntrada) appData.notasEntrada=[];
  if(id){var idx=appData.notasEntrada.findIndex(function(n){return n.id===id;});if(idx>-1){obj.id=id;appData.notasEntrada[idx]=obj;}}
  else{obj.id=nextId(appData.notasEntrada);appData.notasEntrada.push(obj);}
  saveData();closeCadastroModal();renderNotasEntradaPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editNotaEntrada(id){var n=(appData.notasEntrada||[]).find(function(x){return x.id===id;});if(n)openNotaEntradaModal(n);}
function deleteNotaEntrada(id){if(!confirm('Excluir?'))return;appData.notasEntrada=(appData.notasEntrada||[]).filter(function(n){return n.id!==id;});saveData();renderNotasEntradaPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-NTS-01: NOTAS SAÍDA ──
// ══════════════════════════════════════════════════════════════
function renderNotasSaidaPage(){
  var pg=document.getElementById('page-notassaida');if(!pg)return;var items=appData.notasSaida||[];
  var totalNS=items.reduce(function(s,n){return s+(n.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>📤 Notas Saída</h2><button class="btn btn-primary" onclick="openNotaSaidaModal()">+ Nova Nota</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Notas Saída</span></div><div class="card-value text-danger">'+formatCurrency(totalNS)+'</div><div class="card-sub">'+items.length+' nota(s)</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar nota..." oninput="filterNotasSaida(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Nº Nota</th><th>Cliente</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="notasSaidaBody"></tbody></table></div>';
  renderNotasSaidaTable(items);
}
function renderNotasSaidaTable(items){var tbody=document.getElementById('notasSaidaBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>';return;}tbody.innerHTML=items.map(function(n){return'<tr><td>'+formatDate(n.data)+'</td><td>'+(n.numero||'-')+'</td><td>'+(n.cliente||'-')+'</td><td>'+(n.descricao||'-')+'</td><td>'+formatCurrency(n.valor)+'</td><td><button class="btn btn-sm btn-primary" onclick="editNotaSaida('+n.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaSaida('+n.id+')">🗑️</button></td></tr>';}).join('');}
function filterNotasSaida(q){q=q.toLowerCase();renderNotasSaidaTable((appData.notasSaida||[]).filter(function(n){return(n.descricao||'').toLowerCase().includes(q)||(n.cliente||'').toLowerCase().includes(q);}));}
function openNotaSaidaModal(nota){
  var isEdit=!!nota;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(nota&&nota.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota Saída':'Nova Nota Saída';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="nsData" value="'+(nota?nota.data:todayStr())+'"></div><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="nsNum" value="'+(nota?nota.numero||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Cliente</label><select class="form-control" id="nsCli"><option value="">Selecione...</option>'+cliOpts+'</select></div>'+
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="nsDesc" value="'+(nota?nota.descricao:'')+'"></div>'+
    '<div class="form-group"><label>Valor</label><input type="number" class="form-control" id="nsValor" value="'+(nota?nota.valor:'')+'" step="0.01"></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="nsObs" rows="2">'+(nota?nota.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaSaida('+(isEdit?nota.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveNotaSaida(id){
  var obj={data:document.getElementById('nsData').value,numero:document.getElementById('nsNum').value.trim(),cliente:document.getElementById('nsCli').value,descricao:document.getElementById('nsDesc').value.trim(),valor:parseFloat(document.getElementById('nsValor').value)||0,obs:document.getElementById('nsObs').value.trim()};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!appData.notasSaida) appData.notasSaida=[];
  if(id){var idx=appData.notasSaida.findIndex(function(n){return n.id===id;});if(idx>-1){obj.id=id;appData.notasSaida[idx]=obj;}}
  else{obj.id=nextId(appData.notasSaida);appData.notasSaida.push(obj);}
  saveData();closeCadastroModal();renderNotasSaidaPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editNotaSaida(id){var n=(appData.notasSaida||[]).find(function(x){return x.id===id;});if(n)openNotaSaidaModal(n);}
function deleteNotaSaida(id){if(!confirm('Excluir?'))return;appData.notasSaida=(appData.notasSaida||[]).filter(function(n){return n.id!==id;});saveData();renderNotasSaidaPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-RMI-01: RECEITAS MEI (v12 — COM RELATÓRIO MENSAL) ──
// ══════════════════════════════════════════════════════════════
var receitaMeiAnoSel = new Date().getFullYear();
var receitaMeiMesSel = new Date().getMonth();

function renderReceitasMeiPage(){
  var pg=document.getElementById('page-receitasmei');if(!pg)return;
  var items=appData.receitasMei||[];
  var totalRM=items.reduce(function(s,r){return s+(r.valor||0);},0);
  var anoAtual=new Date().getFullYear();
  var anosOpts='';for(var a=2024;a<=anoAtual+2;a++){anosOpts+='<option value="'+a+'"'+(a===receitaMeiAnoSel?' selected':'')+'>'+a+'</option>';}
  var mesesOpts='';mesesNomes.forEach(function(m,i){mesesOpts+='<option value="'+i+'"'+(i===receitaMeiMesSel?' selected':'')+'>'+m+'</option>';});

  pg.innerHTML=
    '<div class="page-header"><h2>📊 Receitas MEI</h2><div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openReceitaMeiModal()">+ Nova Receita</button></div></div>'+
    '<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Receita MEI</span></div><div class="card-value text-success">'+formatCurrency(totalRM)+'</div><div class="card-sub">'+items.length+' receita(s)</div></div></div>'+
    '<div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar receita..." oninput="filterReceitasMei(this.value)"></div>'+
    '<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="receitasMeiBody"></tbody></table></div>'+
    '<hr style="margin:24px 0;border-color:var(--border-color)">'+
    '<div class="card" style="padding:20px"><div class="card-header" style="margin-bottom:16px"><span style="font-size:1.1rem;font-weight:700">📄 Relatório Mensal das Receitas Brutas (MEI)</span></div>'+
      '<div class="filter-bar" style="margin-bottom:16px"><select class="form-control" style="max-width:110px" onchange="receitaMeiAnoSel=parseInt(this.value);renderReceitaBrutaMei()">'+anosOpts+'</select><select class="form-control" style="max-width:150px" onchange="receitaMeiMesSel=parseInt(this.value);renderReceitaBrutaMei()">'+mesesOpts+'</select><button class="btn btn-primary" onclick="imprimirReceitaBrutaMei()">🖨️ IMPRIMIR</button></div>'+
      '<div id="receitaBrutaMeiContainer"></div>'+
    '</div>';
  renderReceitasMeiTable(items);
  renderReceitaBrutaMei();
}

function renderReceitasMeiTable(items){var tbody=document.getElementById('receitasMeiBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma receita</td></tr>';return;}tbody.innerHTML=items.map(function(r){return'<tr><td>'+formatDate(r.data)+'</td><td>'+(r.descricao||'-')+'</td><td>'+formatCurrency(r.valor)+'</td><td><button class="btn btn-sm btn-primary" onclick="editReceitaMei('+r.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteReceitaMei('+r.id+')">🗑️</button></td></tr>';}).join('');}
function filterReceitasMei(q){q=q.toLowerCase();renderReceitasMeiTable((appData.receitasMei||[]).filter(function(r){return(r.descricao||'').toLowerCase().includes(q);}));}
function openReceitaMeiModal(rec){
  var isEdit=!!rec;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Receita MEI':'Nova Receita MEI';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Data</label><input type="date" class="form-control" id="rmData" value="'+(rec?rec.data:todayStr())+'"></div>'+
    '<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="rmDesc" value="'+(rec?rec.descricao:'')+'"></div>'+
    '<div class="form-group"><label>Valor</label><input type="number" class="form-control" id="rmValor" value="'+(rec?rec.valor:'')+'" step="0.01"></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="rmObs" rows="2">'+(rec?rec.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveReceitaMei('+(isEdit?rec.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveReceitaMei(id){
  var obj={data:document.getElementById('rmData').value,descricao:document.getElementById('rmDesc').value.trim(),valor:parseFloat(document.getElementById('rmValor').value)||0,obs:document.getElementById('rmObs').value.trim()};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!appData.receitasMei) appData.receitasMei=[];
  if(id){var idx=appData.receitasMei.findIndex(function(r){return r.id===id;});if(idx>-1){obj.id=id;appData.receitasMei[idx]=obj;}}
  else{obj.id=nextId(appData.receitasMei);appData.receitasMei.push(obj);}
  saveData();closeCadastroModal();renderReceitasMeiPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editReceitaMei(id){var r=(appData.receitasMei||[]).find(function(x){return x.id===id;});if(r)openReceitaMeiModal(r);}
function deleteReceitaMei(id){if(!confirm('Excluir?'))return;appData.receitasMei=(appData.receitasMei||[]).filter(function(r){return r.id!==id;});saveData();renderReceitasMeiPage();showToast('Excluído!','success');}

// ── Relatório Mensal Receitas Brutas MEI ──
function renderReceitaBrutaMei(){
  var container=document.getElementById('receitaBrutaMeiContainer');if(!container)return;
  var ano=receitaMeiAnoSel;var mes=receitaMeiMesSel;
  var mesNum=('0'+(mes+1)).slice(-2);
  var emp=appData.empresa||{};
  var cnpj=emp.cnpj||'29.595.239/0001-33';
  var cnpjNumeros=cnpj.replace(/\D/g,'');
  var empreendedor=emp.empreendedor||'WANDER HALLEY LEE ALVES';
  var cidade=emp.cidade||'Franca, SP';
  var assinatura=emp.assinatura||'';

  // Pega vendas do mês/ano selecionado
  var vendas=(appData.vendas||[]).filter(function(v){return v.data&&v.data.startsWith(ano+'-'+mesNum);});
  // Notas saída do mês (vendas com nota fiscal)
  var notasSaida=(appData.notasSaida||[]).filter(function(n){return n.data&&n.data.startsWith(ano+'-'+mesNum);});

  // I = vendas sem nota fiscal (total vendas - notas saída emitidas)
  var totalVendas=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var totalNotasSaida=notasSaida.reduce(function(s,n){return s+(n.valor||0);},0);
  var semNota=totalVendas-totalNotasSaida; if(semNota<0)semNota=0;
  var comNota=totalNotasSaida;
  var totalComercio=semNota+comNota;

  // IV, V, VI = produção (0 por padrão — MEI comércio)
  var industSemNota=0;var industComNota=0;var totalIndust=0;
  // VII, VIII, IX = serviços (0 por padrão)
  var servSemNota=0;var servComNota=0;var totalServ=0;
  var totalGeral=totalComercio+totalIndust+totalServ;

  var mesNome=mesesNomes[mes].toUpperCase();
  var dataLocal=cidade+' - 01 de '+mesesNomes[mes]+' de '+ano;

  var assinaturaHtml=assinatura?'<img src="'+assinatura+'" style="max-height:60px;max-width:250px;object-fit:contain">':'<span style="font-style:italic;color:#666">'+empreendedor+'</span>';

  container.innerHTML=
    '<div id="receitaBrutaPrint" style="background:#fff;color:#000;padding:20px;border:2px solid #000;font-family:Arial,sans-serif;font-size:13px">'+
      '<table style="width:100%;border-collapse:collapse;border:1px solid #000"><tbody>'+
        '<tr><td colspan="2" style="text-align:center;font-weight:700;font-size:14px;padding:10px;border:1px solid #000;background:#e8e8e8">RELATÓRIO MENSAL DAS RECEITAS BRUTAS</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000;width:35%">CNPJ:</td><td style="padding:6px 10px;border:1px solid #000;font-weight:600">'+cnpj+'</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000">Empreendedor individual:</td><td style="padding:6px 10px;border:1px solid #000;font-weight:600">'+cnpjNumeros+' '+empreendedor+'</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000">Período de apuração:</td><td style="padding:6px 10px;border:1px solid #000;font-weight:600">'+mesNome+' DE '+ano+'</td></tr>'+
        // COMÉRCIO
        '<tr><td colspan="2" style="padding:8px 10px;border:1px solid #000;font-weight:700;background:#d0d0d0">RECEITA BRUTA MENSAL – REVENDA DE MERCADORIAS (COMÉRCIO)</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000">I – Revenda de mercadorias com dispensa de emissão de documento fiscal</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:600">'+formatCurrency(semNota)+'</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000">II – Revenda de mercadorias com documento fiscal emitido</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:600">'+formatCurrency(comNota)+'</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000;background:#f5f5f5">III – Total das receitas com revenda de mercadorias (I + II)</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:700;background:#f5f5f5">'+formatCurrency(totalComercio)+'</td></tr>'+
        // INDÚSTRIA
        '<tr><td colspan="2" style="padding:8px 10px;border:1px solid #000;font-weight:700;background:#d0d0d0">RECEITA BRUTA MENSAL – VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000">IV – Venda de produtos industrializados com dispensa de emissão de documento fiscal</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:600">'+formatCurrency(industSemNota)+'</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000">V – Venda de produtos industrializados com documento fiscal emitido</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:600">'+formatCurrency(industComNota)+'</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000;background:#f5f5f5">VI – Total das receitas com venda de produtos industrializados (IV + V)</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:700;background:#f5f5f5">'+formatCurrency(totalIndust)+'</td></tr>'+
        // SERVIÇOS
        '<tr><td colspan="2" style="padding:8px 10px;border:1px solid #000;font-weight:700;background:#d0d0d0">RECEITA BRUTA MENSAL – PRESTAÇÃO DE SERVIÇOS</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000">VII – Receita com prestação de serviços com dispensa de emissão de documento fiscal</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:600">'+formatCurrency(servSemNota)+'</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000">VIII – Receita com prestação de serviços com documento fiscal emitido</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:600">'+formatCurrency(servComNota)+'</td></tr>'+
        '<tr><td style="padding:6px 10px;border:1px solid #000;background:#f5f5f5">IX – Total das receitas com prestação de serviços (VII + VIII)</td><td style="padding:6px 10px;border:1px solid #000;text-align:right;font-weight:700;background:#f5f5f5">'+formatCurrency(totalServ)+'</td></tr>'+
        // TOTAL GERAL
        '<tr><td style="padding:10px;border:1px solid #000;font-weight:700;font-size:14px;background:#e8e8e8">X – Total geral das receitas brutas no mês (III + VI + IX)</td><td style="padding:10px;border:1px solid #000;text-align:right;font-weight:700;font-size:16px;background:#e8e8e8">'+formatCurrency(totalGeral)+'</td></tr>'+
        // LOCAL E DATA / ASSINATURA
        '<tr><td style="padding:6px 10px;border:1px solid #000;vertical-align:top"><strong>LOCAL E DATA:</strong><br>'+dataLocal+'</td><td style="padding:6px 10px;border:1px solid #000;vertical-align:top"><strong>ASSINATURA DO EMPRESÁRIO:</strong><br><div style="margin-top:8px">'+assinaturaHtml+'</div></td></tr>'+
        '<tr><td colspan="2" style="padding:8px 10px;border:1px solid #000;font-size:11px;color:#333"><strong>ENCONTRAM-SE ANEXADOS E ESTE RELATÓRIO:</strong><br>- Os documentos fiscais comprobatórios das entradas de mercadorias e serviços tomados referentes ao período;<br>- As notas fiscais relativas às operações ou prestações realizadas eventualmente emitidas.</td></tr>'+
      '</tbody></table>'+
    '</div>';
}

function imprimirReceitaBrutaMei(){
  var el=document.getElementById('receitaBrutaPrint');if(!el){showToast('Gere o relatório primeiro','error');return;}
  var win=window.open('','_blank');
  win.document.write('<!DOCTYPE html><html><head><title>Relatório Mensal Receitas Brutas - MEI</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#000;margin:0}table{width:100%;border-collapse:collapse}td{border:1px solid #000;padding:6px 10px}@media print{body{padding:10px}}</style></head><body>'+el.innerHTML+'</body></html>');
  win.document.close();
  setTimeout(function(){win.print();},500);
}

// ══════════════════════════════════════════════════════════════
// ── SCR-PRJ-01: PROJETOS ──
// ══════════════════════════════════════════════════════════════
function renderProjetosPage(){
  var pg=document.getElementById('page-projetos');if(!pg)return;var items=appData.projetos||[];
  pg.innerHTML='<div class="page-header"><h2>📁 Projetos</h2><button class="btn btn-primary" onclick="openProjetoModal()">+ Novo Projeto</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Projetos</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar projeto..." oninput="filterProjetos(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Cliente</th><th>Início</th><th>Situação</th><th>Valor</th><th>Ações</th></tr></thead><tbody id="projetosBody"></tbody></table></div>';
  renderProjetosTable(items);
}
function renderProjetosTable(items){var tbody=document.getElementById('projetosBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum projeto</td></tr>';return;}tbody.innerHTML=items.map(function(p){return'<tr><td>'+(p.nome||'-')+'</td><td>'+(p.cliente||'-')+'</td><td>'+formatDate(p.dataInicio)+'</td><td>'+situacaoBadge(p.situacao)+'</td><td>'+formatCurrency(p.valor)+'</td><td><button class="btn btn-sm btn-primary" onclick="editProjeto('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProjeto('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterProjetos(q){q=q.toLowerCase();renderProjetosTable((appData.projetos||[]).filter(function(p){return(p.nome||'').toLowerCase().includes(q)||(p.cliente||'').toLowerCase().includes(q);}));}
function openProjetoModal(proj){
  var isEdit=!!proj;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(proj&&proj.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Projeto':'Novo Projeto';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prjNome" value="'+(proj?proj.nome:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Cliente</label><select class="form-control" id="prjCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Data Início</label><input type="date" class="form-control" id="prjData" value="'+(proj?proj.dataInicio:todayStr())+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prjValor" value="'+(proj?proj.valor:'')+'" step="0.01"></div><div class="form-group"><label>Situação</label><select class="form-control" id="prjSit"><option value="Em Andamento"'+(proj&&proj.situacao==='Em Andamento'?' selected':'')+'>Em Andamento</option><option value="Concluído"'+(proj&&proj.situacao==='Concluído'?' selected':'')+'>Concluído</option><option value="Cancelado"'+(proj&&proj.situacao==='Cancelado'?' selected':'')+'>Cancelado</option></select></div></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="prjObs" rows="2">'+(proj?proj.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProjeto('+(isEdit?proj.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveProjeto(id){
  var obj={nome:document.getElementById('prjNome').value.trim(),cliente:document.getElementById('prjCli').value,dataInicio:document.getElementById('prjData').value,valor:parseFloat(document.getElementById('prjValor').value)||0,situacao:document.getElementById('prjSit').value,obs:document.getElementById('prjObs').value.trim()};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.projetos) appData.projetos=[];
  if(id){var idx=appData.projetos.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.projetos[idx]=obj;}}
  else{obj.id=nextId(appData.projetos);appData.projetos.push(obj);}
  saveData();closeCadastroModal();renderProjetosPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editProjeto(id){var p=(appData.projetos||[]).find(function(x){return x.id===id;});if(p)openProjetoModal(p);}
function deleteProjeto(id){if(!confirm('Excluir?'))return;appData.projetos=(appData.projetos||[]).filter(function(p){return p.id!==id;});saveData();renderProjetosPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-PGC-01: PAG. CLIENTES ──
// ══════════════════════════════════════════════════════════════
function renderPagClientesPage(){
  var pg=document.getElementById('page-pagclientes');if(!pg)return;var items=appData.pagClientes||[];
  var total=items.reduce(function(s,p){return s+(p.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>💵 Pag. Clientes</h2><button class="btn btn-primary" onclick="openPagClienteModal()">+ Novo Pagamento</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Recebido</span></div><div class="card-value text-success">'+formatCurrency(total)+'</div><div class="card-sub">'+items.length+' pagamento(s)</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPagClientes(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Cliente</th><th>Descrição</th><th>Valor</th><th>F.Pgto</th><th>Ações</th></tr></thead><tbody id="pagClientesBody"></tbody></table></div>';
  renderPagClientesTable(items);
}
function renderPagClientesTable(items){var tbody=document.getElementById('pagClientesBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum pagamento</td></tr>';return;}tbody.innerHTML=items.map(function(p){return'<tr><td>'+formatDate(p.data)+'</td><td>'+(p.cliente||'-')+'</td><td>'+(p.descricao||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+(p.formaPagamento||'-')+'</td><td><button class="btn btn-sm btn-primary" onclick="editPagCliente('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePagCliente('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterPagClientes(q){q=q.toLowerCase();renderPagClientesTable((appData.pagClientes||[]).filter(function(p){return(p.cliente||'').toLowerCase().includes(q)||(p.descricao||'').toLowerCase().includes(q);}));}
function openPagClienteModal(pag){
  var isEdit=!!pag;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(pag&&pag.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  var pgtoOpts=(appData.formasPagamentoVendas||[]).map(function(f){return'<option value="'+f+'"'+(pag&&pag.formaPagamento===f?' selected':'')+'>'+f+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Pagamento':'Novo Pagamento';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Data</label><input type="date" class="form-control" id="pgcData" value="'+(pag?pag.data:todayStr())+'"></div>'+
    '<div class="form-group"><label>Cliente *</label><select class="form-control" id="pgcCli"><option value="">Selecione...</option>'+cliOpts+'</select></div>'+
    '<div class="form-group"><label>Descrição</label><input type="text" class="form-control" id="pgcDesc" value="'+(pag?pag.descricao||'':'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pgcValor" value="'+(pag?pag.valor:'')+'" step="0.01"></div><div class="form-group"><label>F.Pgto</label><select class="form-control" id="pgcPgto"><option value="">Selecione...</option>'+pgtoOpts+'</select></div></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="pgcObs" rows="2">'+(pag?pag.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePagCliente('+(isEdit?pag.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function savePagCliente(id){
  var obj={data:document.getElementById('pgcData').value,cliente:document.getElementById('pgcCli').value,descricao:document.getElementById('pgcDesc').value.trim(),valor:parseFloat(document.getElementById('pgcValor').value)||0,formaPagamento:document.getElementById('pgcPgto').value,obs:document.getElementById('pgcObs').value.trim()};
  if(!obj.cliente){showToast('Selecione o cliente','error');return;}
  if(!appData.pagClientes) appData.pagClientes=[];
  if(id){var idx=appData.pagClientes.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.pagClientes[idx]=obj;}}
  else{obj.id=nextId(appData.pagClientes);appData.pagClientes.push(obj);}
  saveData();closeCadastroModal();renderPagClientesPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editPagCliente(id){var p=(appData.pagClientes||[]).find(function(x){return x.id===id;});if(p)openPagClienteModal(p);}
function deletePagCliente(id){if(!confirm('Excluir?'))return;appData.pagClientes=(appData.pagClientes||[]).filter(function(p){return p.id!==id;});saveData();renderPagClientesPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-REL-01: RELATÓRIOS (v12 — COM PROJEÇÃO DE LUCRO) ──
// ══════════════════════════════════════════════════════════════
var relAnoSel = new Date().getFullYear();
var relMesSel = '';
var relFornSel = '';
var relCliSel = '';
var relTipoSel = 'geral';

function renderRelatoriosPage(){
  var pg=document.getElementById('page-relatorios');if(!pg)return;
  var anoAtual=new Date().getFullYear();
  var anosOpts='';for(var a=2024;a<=anoAtual+2;a++){anosOpts+='<option value="'+a+'"'+(a===relAnoSel?' selected':'')+'>'+a+'</option>';}
  var mesesOpts='<option value="">Todos os Meses</option>';mesesNomes.forEach(function(m,i){mesesOpts+='<option value="'+i+'"'+(relMesSel===''+i?' selected':'')+'>'+m+'</option>';});
  var fornOpts='<option value="">Todos os Fornecedores</option>';(appData.fornecedores||[]).forEach(function(f){fornOpts+='<option value="'+f.nome+'"'+(relFornSel===f.nome?' selected':'')+'>'+f.nome+'</option>';});
  var cliOpts='<option value="">Todos os Clientes</option>';(appData.clientes||[]).forEach(function(c){cliOpts+='<option value="'+c.nome+'"'+(relCliSel===c.nome?' selected':'')+'>'+c.nome+'</option>';});

  pg.innerHTML=
    '<div class="page-header"><h2>📊 Relatórios</h2><button class="btn btn-primary" onclick="imprimirRelatorio()">🖨️ Imprimir</button></div>'+
    '<div class="filter-bar" style="flex-wrap:wrap;gap:8px;margin-bottom:16px">'+
      '<select class="form-control" style="max-width:180px" onchange="relTipoSel=this.value;gerarRelatorio()">'+
        '<option value="geral"'+(relTipoSel==='geral'?' selected':'')+'>Relatório Geral</option>'+
        '<option value="projecao_lucro"'+(relTipoSel==='projecao_lucro'?' selected':'')+'>Projeção de Lucro</option>'+
        '<option value="compras_fornecedor"'+(relTipoSel==='compras_fornecedor'?' selected':'')+'>Compras por Fornecedor</option>'+
        '<option value="vendas_cliente"'+(relTipoSel==='vendas_cliente'?' selected':'')+'>Vendas por Cliente</option>'+
        '<option value="vendas_vendedor"'+(relTipoSel==='vendas_vendedor'?' selected':'')+'>Vendas por Vendedor</option>'+
        '<option value="vendas_produto"'+(relTipoSel==='vendas_produto'?' selected':'')+'>Vendas por Produto</option>'+
        '<option value="compras_produto"'+(relTipoSel==='compras_produto'?' selected':'')+'>Compras por Produto</option>'+
        '<option value="fluxo_caixa"'+(relTipoSel==='fluxo_caixa'?' selected':'')+'>Fluxo de Caixa</option>'+
        '<option value="boletos"'+(relTipoSel==='boletos'?' selected':'')+'>Boletos</option>'+
        '<option value="cheques"'+(relTipoSel==='cheques'?' selected':'')+'>Cheques</option>'+
        '<option value="prestacoes"'+(relTipoSel==='prestacoes'?' selected':'')+'>Prestações</option>'+
        '<option value="garantias"'+(relTipoSel==='garantias'?' selected':'')+'>Garantias</option>'+
        '<option value="estoque"'+(relTipoSel==='estoque'?' selected':'')+'>Estoque</option>'+
        '<option value="notas_entrada"'+(relTipoSel==='notas_entrada'?' selected':'')+'>Notas Entrada</option>'+
        '<option value="notas_saida"'+(relTipoSel==='notas_saida'?' selected':'')+'>Notas Saída</option>'+
        '<option value="receitas_mei"'+(relTipoSel==='receitas_mei'?' selected':'')+'>Receitas MEI</option>'+
        '<option value="lucro_mensal"'+(relTipoSel==='lucro_mensal'?' selected':'')+'>Lucro Mensal</option>'+
        '<option value="pagamentos_clientes"'+(relTipoSel==='pagamentos_clientes'?' selected':'')+'>Pagamentos Clientes</option>'+
      '</select>'+
      '<select class="form-control" style="max-width:110px" onchange="relAnoSel=parseInt(this.value);gerarRelatorio()">'+anosOpts+'</select>'+
      '<select class="form-control" style="max-width:150px" onchange="relMesSel=this.value;gerarRelatorio()">'+mesesOpts+'</select>'+
      '<select class="form-control" style="max-width:180px" onchange="relFornSel=this.value;gerarRelatorio()">'+fornOpts+'</select>'+
      '<select class="form-control" style="max-width:180px" onchange="relCliSel=this.value;gerarRelatorio()">'+cliOpts+'</select>'+
    '</div>'+
    '<div id="relatorioResultado"></div>';
  gerarRelatorio();
}

function relFilterByDate(items,dateField){
  return items.filter(function(item){
    var d=item[dateField];if(!d)return false;
    var parts=d.split('-');var ano=parseInt(parts[0],10);var mes=parseInt(parts[1],10)-1;
    if(ano!==relAnoSel) return false;
    if(relMesSel!==''&&mes!==parseInt(relMesSel,10)) return false;
    return true;
  });
}

function gerarRelatorio(){
  var container=document.getElementById('relatorioResultado');if(!container)return;
  var tipo=relTipoSel;var html='';
  var mesLabel=relMesSel!==''?mesesNomes[parseInt(relMesSel,10)]:'Todos os Meses';
  var titulo='<div style="text-align:center;margin-bottom:20px;padding:16px;background:var(--bg-secondary);border-radius:var(--radius)"><h3 style="margin:0 0 4px 0">'+(appData.empresa?appData.empresa.nome:'WD Máquinas')+'</h3><p style="margin:0;color:var(--text-muted);font-size:.85rem">CNPJ: '+(appData.empresa?appData.empresa.cnpj:'')+' — Ano: '+relAnoSel+' — Período: '+mesLabel+'</p></div>';

  if(tipo==='geral') html=titulo+relGeral();
  else if(tipo==='projecao_lucro') html=titulo+relProjecaoLucro();
  else if(tipo==='compras_fornecedor') html=titulo+relComprasFornecedor();
  else if(tipo==='vendas_cliente') html=titulo+relVendasCliente();
  else if(tipo==='vendas_vendedor') html=titulo+relVendasVendedor();
  else if(tipo==='vendas_produto') html=titulo+relVendasProduto();
  else if(tipo==='compras_produto') html=titulo+relComprasProduto();
  else if(tipo==='fluxo_caixa') html=titulo+relFluxoCaixa();
  else if(tipo==='boletos') html=titulo+relBoletos();
  else if(tipo==='cheques') html=titulo+relCheques();
  else if(tipo==='prestacoes') html=titulo+relPrestacoes();
  else if(tipo==='garantias') html=titulo+relGarantias();
  else if(tipo==='estoque') html=titulo+relEstoque();
  else if(tipo==='notas_entrada') html=titulo+relNotasEntrada();
  else if(tipo==='notas_saida') html=titulo+relNotasSaida();
  else if(tipo==='receitas_mei') html=titulo+relReceitasMei();
  else if(tipo==='lucro_mensal') html=titulo+relLucroMensal();
  else if(tipo==='pagamentos_clientes') html=titulo+relPagamentosClientes();

  container.innerHTML=html;
}

// ── PROJEÇÃO DE LUCRO (NOVO v12) ──
function relProjecaoLucro(){
  var compras=relFilterByDate(appData.compras||[],'data');
  var vendas=relFilterByDate(appData.vendas||[],'data');
  var totalCompras=compras.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
  var totalVendas=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var resultadoTotal=totalVendas-totalCompras;
  var qtdVendedores=(appData.vendedores||[]).length;
  if(qtdVendedores<1) qtdVendedores=1;
  var resultadoSalario=resultadoTotal/qtdVendedores;

  var vendedoresList=(appData.vendedores||[]).join(', ');

  // Tabela mensal detalhada
  var tabelaMensal='';var totalCM=0,totalVM=0;
  mesesNomes.forEach(function(m,i){
    if(relMesSel!==''&&i!==parseInt(relMesSel,10)) return;
    var mesNum=('0'+(i+1)).slice(-2);
    var mc=(appData.compras||[]).filter(function(c){return c.data&&c.data.startsWith(relAnoSel+'-'+mesNum);}).reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
    var mv=(appData.vendas||[]).filter(function(v){return v.data&&v.data.startsWith(relAnoSel+'-'+mesNum);}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
    totalCM+=mc;totalVM+=mv;
    var lucroM=mv-mc;var salM=lucroM/qtdVendedores;
    tabelaMensal+='<tr><td>'+m+'</td><td class="text-danger">'+formatCurrency(mc)+'</td><td class="text-success">'+formatCurrency(mv)+'</td><td class="'+(lucroM>=0?'text-success':'text-danger')+'">'+formatCurrency(lucroM)+'</td><td>'+formatCurrency(salM)+'</td></tr>';
  });
  var lucroTM=totalVM-totalCM;var salTM=lucroTM/qtdVendedores;
  tabelaMensal+='<tr style="font-weight:700;border-top:2px solid var(--border-color)"><td>TOTAL</td><td class="text-danger">'+formatCurrency(totalCM)+'</td><td class="text-success">'+formatCurrency(totalVM)+'</td><td class="'+(lucroTM>=0?'text-success':'text-danger')+'">'+formatCurrency(lucroTM)+'</td><td>'+formatCurrency(salTM)+'</td></tr>';

  return '<div class="dashboard-grid">'+
    '<div class="card"><div class="card-header"><span>🛒 Total Compras</span></div><div class="card-value text-danger">'+formatCurrency(totalCompras)+'</div><div class="card-sub">'+compras.length+' compra(s)</div></div>'+
    '<div class="card"><div class="card-header"><span>💰 Total Vendas</span></div><div class="card-value text-success">'+formatCurrency(totalVendas)+'</div><div class="card-sub">'+vendas.length+' venda(s)</div></div>'+
    '<div class="card card-accent" style="border-left:4px solid '+(resultadoTotal>=0?'var(--success)':'var(--danger)')+'"><div class="card-header"><span>📈 Resultado Total</span></div><div class="card-value '+(resultadoTotal>=0?'text-success':'text-danger')+'" style="font-size:1.8rem">'+formatCurrency(resultadoTotal)+'</div><div class="card-sub">Vendas − Compras</div></div>'+
    '<div class="card" style="border-left:4px solid var(--primary)"><div class="card-header"><span>🧑‍💼 Resultado Salário</span></div><div class="card-value" style="font-size:1.8rem;color:var(--primary)">'+formatCurrency(resultadoSalario)+'</div><div class="card-sub">Resultado ÷ '+qtdVendedores+' vendedor(es)<br><span style="font-size:.75rem;color:var(--text-muted)">'+vendedoresList+'</span></div></div>'+
  '</div>'+
  '<div class="card" style="margin-top:16px"><div class="card-header"><span>📊 Projeção de Lucro Mensal — '+relAnoSel+'</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Compras</th><th>Vendas</th><th>Resultado</th><th>Resultado/Vendedor</th></tr></thead><tbody>'+tabelaMensal+'</tbody></table></div></div>';
}

function relGeral(){
  var compras=relFilterByDate(appData.compras||[],'data');
  var vendas=relFilterByDate(appData.vendas||[],'data');
  var totalC=compras.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
  var totalV=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var lucro=totalV-totalC;
  var boletos=relFilterByDate(appData.boletos||[],'vencimento');
  var cheques=relFilterByDate(appData.cheques||[],'bomPara');
  var totalBol=boletos.reduce(function(s,b){return s+(b.valor||0);},0);
  var totalChq=cheques.reduce(function(s,ch){return s+(ch.valor||0);},0);
  return '<div class="dashboard-grid">'+
    '<div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">'+formatCurrency(totalC)+'</div><div class="card-sub">'+compras.length+' compra(s)</div></div>'+
    '<div class="card"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">'+formatCurrency(totalV)+'</div><div class="card-sub">'+vendas.length+' venda(s)</div></div>'+
    '<div class="card"><div class="card-header"><span>Lucro</span></div><div class="card-value '+(lucro>=0?'text-success':'text-danger')+'">'+formatCurrency(lucro)+'</div></div>'+
    '<div class="card"><div class="card-header"><span>Boletos</span></div><div class="card-value">'+formatCurrency(totalBol)+'</div><div class="card-sub">'+boletos.length+' boleto(s)</div></div>'+
    '<div class="card"><div class="card-header"><span>Cheques</span></div><div class="card-value">'+formatCurrency(totalChq)+'</div><div class="card-sub">'+cheques.length+' cheque(s)</div></div>'+
  '</div>'+
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">'+
    '<div class="card"><div class="card-header"><span>Compras por Situação</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Situação</th><th>Qtd</th><th>Total</th></tr></thead><tbody>'+relGroupBySituacao(compras)+'</tbody></table></div></div>'+
    '<div class="card"><div class="card-header"><span>Vendas por Situação</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Situação</th><th>Qtd</th><th>Total</th></tr></thead><tbody>'+relGroupBySituacao(vendas)+'</tbody></table></div></div>'+
  '</div>';
}

function relGroupBySituacao(items){
  var grupos={};items.forEach(function(i){var sit=i.situacao||'Sem Situação';if(!grupos[sit])grupos[sit]={qtd:0,total:0};grupos[sit].qtd++;grupos[sit].total+=(i.quantidade||1)*(i.valorUnit||i.valor||0);});
  var html='';Object.keys(grupos).forEach(function(k){html+='<tr><td>'+situacaoBadge(k)+'</td><td>'+grupos[k].qtd+'</td><td>'+formatCurrency(grupos[k].total)+'</td></tr>';});
  return html||'<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Sem dados</td></tr>';
}

function relComprasFornecedor(){
  var compras=relFilterByDate(appData.compras||[],'data');
  if(relFornSel) compras=compras.filter(function(c){return c.fornecedor===relFornSel;});
  var grupos={};compras.forEach(function(c){var f=c.fornecedor||'Sem Fornecedor';if(!grupos[f])grupos[f]={items:[],total:0};grupos[f].items.push(c);grupos[f].total+=(c.quantidade||1)*(c.valorUnit||0);});
  var totalGeral=compras.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">'+formatCurrency(totalGeral)+'</div><div class="card-sub">'+compras.length+' compra(s)'+(relFornSel?' — Fornecedor: '+relFornSel:'')+'</div></div></div>';
  Object.keys(grupos).sort().forEach(function(forn){
    var g=grupos[forn];
    html+='<div class="card" style="margin-top:16px"><div class="card-header"><span>🏭 '+forn+'</span><span style="font-weight:700;color:var(--danger)">'+formatCurrency(g.total)+'</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>F.Pgto</th><th>Situação</th></tr></thead><tbody>';
    g.items.forEach(function(c){html+='<tr><td>'+formatDate(c.data)+'</td><td>'+(c.produto||'-')+'</td><td>'+(c.quantidade||1)+'</td><td>'+formatCurrency(c.valorUnit)+'</td><td>'+formatCurrency((c.quantidade||1)*(c.valorUnit||0))+'</td><td>'+(c.formaPagamento||'-')+'</td><td>'+situacaoBadge(c.situacao)+'</td></tr>';});
    html+='</tbody></table></div></div>';
  });
  return html||'<p style="text-align:center;color:var(--text-muted);padding:40px">Nenhuma compra encontrada</p>';
}

function relVendasCliente(){
  var vendas=relFilterByDate(appData.vendas||[],'data');
  if(relCliSel) vendas=vendas.filter(function(v){return v.cliente===relCliSel;});
  var grupos={};vendas.forEach(function(v){var c=v.cliente||'Sem Cliente';if(!grupos[c])grupos[c]={items:[],total:0};grupos[c].items.push(v);grupos[c].total+=(v.quantidade||1)*(v.valorUnit||0);});
  var totalGeral=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">'+formatCurrency(totalGeral)+'</div><div class="card-sub">'+vendas.length+' venda(s)'+(relCliSel?' — Cliente: '+relCliSel:'')+'</div></div></div>';
  Object.keys(grupos).sort().forEach(function(cli){
    var g=grupos[cli];
    html+='<div class="card" style="margin-top:16px"><div class="card-header"><span>👤 '+cli+'</span><span style="font-weight:700;color:var(--success)">'+formatCurrency(g.total)+'</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Vendedor</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>F.Pgto</th><th>Situação</th><th>Entrega</th></tr></thead><tbody>';
    g.items.forEach(function(v){html+='<tr><td>'+formatDate(v.data)+'</td><td>'+(v.produto||'-')+'</td><td>'+(v.vendedor||'-')+'</td><td>'+(v.quantidade||1)+'</td><td>'+formatCurrency(v.valorUnit)+'</td><td>'+formatCurrency((v.quantidade||1)*(v.valorUnit||0))+'</td><td>'+(v.formaPagamento||'-')+'</td><td>'+situacaoBadge(v.situacao)+'</td><td>'+situacaoBadge(v.entrega)+'</td></tr>';});
    html+='</tbody></table></div></div>';
  });
  return html||'<p style="text-align:center;color:var(--text-muted);padding:40px">Nenhuma venda encontrada</p>';
}

function relVendasVendedor(){
  var vendas=relFilterByDate(appData.vendas||[],'data');
  var grupos={};vendas.forEach(function(v){var vd=v.vendedor||'Sem Vendedor';if(!grupos[vd])grupos[vd]={items:[],total:0};grupos[vd].items.push(v);grupos[vd].total+=(v.quantidade||1)*(v.valorUnit||0);});
  var totalGeral=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">'+formatCurrency(totalGeral)+'</div></div></div>';
  Object.keys(grupos).sort().forEach(function(vend){
    var g=grupos[vend];
    html+='<div class="card" style="margin-top:16px"><div class="card-header"><span>🧑‍💼 '+vend+'</span><span style="font-weight:700;color:var(--success)">'+formatCurrency(g.total)+'</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Qtd</th><th>V.Unit</th><th>Total</th><th>Situação</th></tr></thead><tbody>';
    g.items.forEach(function(v){html+='<tr><td>'+formatDate(v.data)+'</td><td>'+(v.produto||'-')+'</td><td>'+(v.cliente||'-')+'</td><td>'+(v.quantidade||1)+'</td><td>'+formatCurrency(v.valorUnit)+'</td><td>'+formatCurrency((v.quantidade||1)*(v.valorUnit||0))+'</td><td>'+situacaoBadge(v.situacao)+'</td></tr>';});
    html+='</tbody></table></div></div>';
  });
  return html||'<p style="text-align:center;color:var(--text-muted);padding:40px">Nenhuma venda encontrada</p>';
}

function relVendasProduto(){
  var vendas=relFilterByDate(appData.vendas||[],'data');
  var grupos={};vendas.forEach(function(v){var p=v.produto||'Sem Produto';if(!grupos[p])grupos[p]={qtd:0,total:0};grupos[p].qtd+=(v.quantidade||1);grupos[p].total+=(v.quantidade||1)*(v.valorUnit||0);});
  var totalGeral=vendas.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Vendas</span></div><div class="card-value text-success">'+formatCurrency(totalGeral)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="card-header"><span>Vendas por Produto</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Qtd Vendida</th><th>Total</th></tr></thead><tbody>';
  Object.keys(grupos).sort(function(a,b){return grupos[b].total-grupos[a].total;}).forEach(function(p){html+='<tr><td>'+p+'</td><td>'+grupos[p].qtd+'</td><td>'+formatCurrency(grupos[p].total)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relComprasProduto(){
  var compras=relFilterByDate(appData.compras||[],'data');
  if(relFornSel) compras=compras.filter(function(c){return c.fornecedor===relFornSel;});
  var grupos={};compras.forEach(function(c){var p=c.produto||'Sem Produto';if(!grupos[p])grupos[p]={qtd:0,total:0};grupos[p].qtd+=(c.quantidade||1);grupos[p].total+=(c.quantidade||1)*(c.valorUnit||0);});
  var totalGeral=compras.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Compras</span></div><div class="card-value text-danger">'+formatCurrency(totalGeral)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="card-header"><span>Compras por Produto</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Qtd</th><th>Total</th></tr></thead><tbody>';
  Object.keys(grupos).sort(function(a,b){return grupos[b].total-grupos[a].total;}).forEach(function(p){html+='<tr><td>'+p+'</td><td>'+grupos[p].qtd+'</td><td>'+formatCurrency(grupos[p].total)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relFluxoCaixa(){
  var html='<div class="card"><div class="card-header"><span>Fluxo de Caixa — '+relAnoSel+'</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>';
  var tE=0,tS=0;
  mesesKeys.forEach(function(mk,i){if(relMesSel!==''&&i!==parseInt(relMesSel,10))return;var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[mk])?appData.fluxoCaixa[mk]:[];var ent=lancs.filter(function(l){return l.tipo==='entrada';}).reduce(function(s,l){return s+(l.valor||0);},0);var sai=lancs.filter(function(l){return l.tipo==='saida';}).reduce(function(s,l){return s+(l.valor||0);},0);tE+=ent;tS+=sai;html+='<tr><td>'+mesesNomes[i]+'</td><td class="text-success">'+formatCurrency(ent)+'</td><td class="text-danger">'+formatCurrency(sai)+'</td><td class="'+(ent-sai>=0?'text-success':'text-danger')+'">'+formatCurrency(ent-sai)+'</td></tr>';});
  html+='<tr style="font-weight:700;border-top:2px solid var(--border-color)"><td>TOTAL</td><td class="text-success">'+formatCurrency(tE)+'</td><td class="text-danger">'+formatCurrency(tS)+'</td><td class="'+(tE-tS>=0?'text-success':'text-danger')+'">'+formatCurrency(tE-tS)+'</td></tr></tbody></table></div></div>';return html;
}

function relBoletos(){
  var boletos=relFilterByDate(appData.boletos||[],'vencimento');if(relFornSel)boletos=boletos.filter(function(b){return b.fornecedor===relFornSel;});
  var total=boletos.reduce(function(s,b){return s+(b.valor||0);},0);var pago=boletos.filter(function(b){return b.situacao==='Pago';}).reduce(function(s,b){return s+(b.valor||0);},0);var pend=total-pago;
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">'+formatCurrency(pago)+'</div></div><div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-danger">'+formatCurrency(pend)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Fornecedor</th><th>Valor</th><th>Vencimento</th><th>Situação</th></tr></thead><tbody>';
  if(!boletos.length)html+='<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">Sem boletos</td></tr>';
  else boletos.forEach(function(b){html+='<tr><td>'+formatDate(b.data)+'</td><td>'+(b.descricao||'-')+'</td><td>'+(b.fornecedor||'-')+'</td><td>'+formatCurrency(b.valor)+'</td><td>'+formatDate(b.vencimento)+'</td><td>'+situacaoBadge(b.situacao)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relCheques(){
  var cheques=relFilterByDate(appData.cheques||[],'bomPara');
  var total=cheques.reduce(function(s,ch){return s+(ch.valor||0);},0);var comp=cheques.filter(function(ch){return ch.situacao==='Compensado';}).reduce(function(s,ch){return s+(ch.valor||0);},0);var pend=total-comp;
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div></div><div class="card"><div class="card-header"><span>Compensado</span></div><div class="card-value text-success">'+formatCurrency(comp)+'</div></div><div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-warning">'+formatCurrency(pend)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Nº</th><th>Emitente</th><th>Valor</th><th>Bom Para</th><th>Situação</th></tr></thead><tbody>';
  if(!cheques.length)html+='<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">Sem cheques</td></tr>';
  else cheques.forEach(function(ch){html+='<tr><td>'+formatDate(ch.data)+'</td><td>'+(ch.numero||'-')+'</td><td>'+(ch.emitente||'-')+'</td><td>'+formatCurrency(ch.valor)+'</td><td>'+formatDate(ch.bomPara)+'</td><td>'+situacaoBadge(ch.situacao)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relPrestacoes(){
  var prest=relFilterByDate(appData.prestacoes||[],'data');var total=prest.reduce(function(s,p){return s+(p.valor||0);},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Parcelas</th><th>Valor</th><th>Situação</th></tr></thead><tbody>';
  if(!prest.length)html+='<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Sem prestações</td></tr>';
  else prest.forEach(function(p){html+='<tr><td>'+formatDate(p.data)+'</td><td>'+(p.descricao||'-')+'</td><td>'+(p.parcelas||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+situacaoBadge(p.situacao)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relGarantias(){
  var gars=appData.garantias||[];
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+gars.length+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Cliente</th><th>Data Início</th><th>Dias</th><th>Restantes</th><th>Situação</th></tr></thead><tbody>';
  if(!gars.length)html+='<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">Sem garantias</td></tr>';
  else gars.forEach(function(g){var d=calcDiasGarantia(g.dataInicio,g.diasGarantia);var sit=getGarantiaSituacaoAuto(g.dataInicio,g.diasGarantia,g.situacao);html+='<tr><td>'+(g.produto||'-')+'</td><td>'+(g.cliente||'-')+'</td><td>'+formatDate(g.dataInicio)+'</td><td>'+(g.diasGarantia||'-')+'</td><td>'+formatDiasGarantia(d,sit)+'</td><td>'+situacaoBadge(sit)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relEstoque(){
  var est=appData.estoque||[];var tv=est.reduce(function(s,e){return s+((e.quantidade||0)*(e.valorUnit||0));},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Itens</span></div><div class="card-value">'+est.length+'</div></div><div class="card"><div class="card-header"><span>Valor Total</span></div><div class="card-value text-success">'+formatCurrency(tv)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Unidade</th><th>Qtd</th><th>V.Unit</th><th>Total</th></tr></thead><tbody>';
  if(!est.length)html+='<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Sem itens</td></tr>';
  else est.forEach(function(e){html+='<tr><td>'+(e.produto||'-')+'</td><td>'+(e.unidade||'-')+'</td><td>'+(e.quantidade||0)+'</td><td>'+formatCurrency(e.valorUnit)+'</td><td>'+formatCurrency((e.quantidade||0)*(e.valorUnit||0))+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relNotasEntrada(){
  var notas=relFilterByDate(appData.notasEntrada||[],'data');if(relFornSel)notas=notas.filter(function(n){return n.fornecedor===relFornSel;});
  var total=notas.reduce(function(s,n){return s+(n.valor||0);},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value text-success">'+formatCurrency(total)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Nº</th><th>Fornecedor</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>';
  if(!notas.length)html+='<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Sem notas</td></tr>';
  else notas.forEach(function(n){html+='<tr><td>'+formatDate(n.data)+'</td><td>'+(n.numero||'-')+'</td><td>'+(n.fornecedor||'-')+'</td><td>'+(n.descricao||'-')+'</td><td>'+formatCurrency(n.valor)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relNotasSaida(){
  var notas=relFilterByDate(appData.notasSaida||[],'data');if(relCliSel)notas=notas.filter(function(n){return n.cliente===relCliSel;});
  var total=notas.reduce(function(s,n){return s+(n.valor||0);},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value text-danger">'+formatCurrency(total)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Nº</th><th>Cliente</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>';
  if(!notas.length)html+='<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Sem notas</td></tr>';
  else notas.forEach(function(n){html+='<tr><td>'+formatDate(n.data)+'</td><td>'+(n.numero||'-')+'</td><td>'+(n.cliente||'-')+'</td><td>'+(n.descricao||'-')+'</td><td>'+formatCurrency(n.valor)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relReceitasMei(){
  var rec=relFilterByDate(appData.receitasMei||[],'data');var total=rec.reduce(function(s,r){return s+(r.valor||0);},0);
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Receita MEI</span></div><div class="card-value text-success">'+formatCurrency(total)+'</div></div></div>';
  html+='<div class="card" style="margin-top:16px"><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>';
  if(!rec.length)html+='<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Sem receitas</td></tr>';
  else rec.forEach(function(r){html+='<tr><td>'+formatDate(r.data)+'</td><td>'+(r.descricao||'-')+'</td><td>'+formatCurrency(r.valor)+'</td></tr>';});
  html+='</tbody></table></div></div>';return html;
}

function relLucroMensal(){
  var html='<div class="card"><div class="card-header"><span>Lucro Mensal — '+relAnoSel+'</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Mês</th><th>Compras</th><th>Vendas</th><th>Lucro</th></tr></thead><tbody>';
  var tC=0,tV=0;
  mesesNomes.forEach(function(m,i){if(relMesSel!==''&&i!==parseInt(relMesSel,10))return;var mn=('0'+(i+1)).slice(-2);var mc=(appData.compras||[]).filter(function(c){return c.data&&c.data.startsWith(relAnoSel+'-'+mn);}).reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);var mv=(appData.vendas||[]).filter(function(v){return v.data&&v.data.startsWith(relAnoSel+'-'+mn);}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);tC+=mc;tV+=mv;var l=mv-mc;html+='<tr><td>'+m+'</td><td class="text-danger">'+formatCurrency(mc)+'</td><td class="text-success">'+formatCurrency(mv)+'</td><td class="'+(l>=0?'text-success':'text-danger')+'">'+formatCurrency(l)+'</td></tr>';});
  html+='<tr style="font-weight:700;border-top:2px solid var(--border-color)"><td>TOTAL</td><td class="text-danger">'+formatCurrency(tC)+'</td><td class="text-success">'+formatCurrency(tV)+'</td><td class="'+(tV-tC>=0?'text-success':'text-danger')+'">'+formatCurrency(tV-tC)+'</td></tr></tbody></table></div></div>';return html;
}

function relPagamentosClientes(){
  var pags=relFilterByDate(appData.pagClientes||[],'data');if(relCliSel)pags=pags.filter(function(p){return p.cliente===relCliSel;});
  var total=pags.reduce(function(s,p){return s+(p.valor||0);},0);
  var grupos={};pags.forEach(function(p){var c=p.cliente||'Sem Cliente';if(!grupos[c])grupos[c]={items:[],total:0};grupos[c].items.push(p);grupos[c].total+=(p.valor||0);});
  var html='<div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Recebido</span></div><div class="card-value text-success">'+formatCurrency(total)+'</div></div></div>';
  Object.keys(grupos).sort().forEach(function(cli){var g=grupos[cli];html+='<div class="card" style="margin-top:16px"><div class="card-header"><span>👤 '+cli+'</span><span style="font-weight:700;color:var(--success)">'+formatCurrency(g.total)+'</span></div><div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>F.Pgto</th></tr></thead><tbody>';g.items.forEach(function(p){html+='<tr><td>'+formatDate(p.data)+'</td><td>'+(p.descricao||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+(p.formaPagamento||'-')+'</td></tr>';});html+='</tbody></table></div></div>';});
  return html||'<p style="text-align:center;color:var(--text-muted);padding:40px">Nenhum pagamento encontrado</p>';
}

function imprimirRelatorio(){
  var conteudo=document.getElementById('relatorioResultado');
  if(!conteudo||!conteudo.innerHTML.trim()){showToast('Gere um relatório primeiro','error');return;}
  var win=window.open('','_blank');
  win.document.write('<!DOCTYPE html><html><head><title>Relatório — '+(appData.empresa?appData.empresa.nome:'WD Máquinas')+'</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5;font-weight:600}.text-success{color:#38a169}.text-danger{color:#e53e3e}.text-warning{color:#dd6b20}.card{border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:12px}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-weight:600}.card-value{font-size:1.5rem;font-weight:700}.card-sub{font-size:.8rem;color:#999}.dashboard-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px}.card-accent{border-left:3px solid #4299e1}@media print{body{padding:0}}</style></head><body>'+conteudo.innerHTML+'</body></html>');
  win.document.close();setTimeout(function(){win.print();},500);
}

// ══════════════════════════════════════════════════════════════
// ── SCR-CFG-02: CONFIGURAÇÕES (v12 — COM ASSINATURA) ──
// ══════════════════════════════════════════════════════════════
function renderConfiguracoesPage(){
  var pg=document.getElementById('page-configuracoes');if(!pg)return;
  var emp=appData.empresa||{};

  var catRows='';(appData.categoriasFluxo||[]).forEach(function(c,i){catRows+='<tr><td>'+c.nome+'</td><td><span class="badge '+(c.tipo==='entrada'?'badge-success':'badge-danger')+'">'+(c.tipo==='entrada'?'Entrada':'Saída')+'</span></td><td><button class="btn btn-sm btn-primary" onclick="editCategoriaFluxo('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCategoriaFluxo('+i+')">🗑️</button></td></tr>';});
  var fpRows='';(appData.formasPagamento||[]).forEach(function(f,i){fpRows+='<tr><td>'+f+'</td><td><button class="btn btn-sm btn-primary" onclick="editFormaPgtoCompra('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFormaPgtoCompra('+i+')">🗑️</button></td></tr>';});
  var fpvRows='';(appData.formasPagamentoVendas||[]).forEach(function(f,i){fpvRows+='<tr><td>'+f+'</td><td><button class="btn btn-sm btn-primary" onclick="editFormaPgtoVenda('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFormaPgtoVenda('+i+')">🗑️</button></td></tr>';});
  var scRows='';(appData.situacaoCompra||[]).forEach(function(s,i){scRows+='<tr><td>'+s+'</td><td><button class="btn btn-sm btn-primary" onclick="editSituacaoCompra('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteSituacaoCompra('+i+')">🗑️</button></td></tr>';});
  var svRows='';(appData.situacaoVenda||[]).forEach(function(s,i){svRows+='<tr><td>'+s+'</td><td><button class="btn btn-sm btn-primary" onclick="editSituacaoVenda('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteSituacaoVenda('+i+')">🗑️</button></td></tr>';});
  var vendRows='';(appData.vendedores||[]).forEach(function(v,i){vendRows+='<tr><td>'+v+'</td><td><button class="btn btn-sm btn-primary" onclick="editVendedor('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteVendedor('+i+')">🗑️</button></td></tr>';});
  var seRows='';(appData.situacaoEntrega||[]).forEach(function(s,i){seRows+='<tr><td>'+s+'</td><td><button class="btn btn-sm btn-primary" onclick="editSituacaoEntrega('+i+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteSituacaoEntrega('+i+')">🗑️</button></td></tr>';});

  pg.innerHTML=
    '<div class="page-header"><h2>⚙️ Configurações</h2></div>'+
    // EMPRESA
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><span>🏢 Dados da Empresa</span></div>'+
      '<div class="form-group"><label>Nome</label><input type="text" class="form-control" id="cfgNome" value="'+(emp.nome||'')+'"></div>'+
      '<div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="'+(emp.cnpj||'')+'"></div>'+
      '<div class="form-row"><div class="form-group"><label>Nome do Empreendedor</label><input type="text" class="form-control" id="cfgEmpreendedor" value="'+(emp.empreendedor||'')+'"></div><div class="form-group"><label>Cidade/UF</label><input type="text" class="form-control" id="cfgCidade" value="'+(emp.cidade||'')+'"></div></div>'+
      '<div class="form-group"><label>Logo da Empresa</label><div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center;margin-top:4px"><input type="file" id="cfgLogoFile" accept="image/jpeg,image/png,image/webp" style="display:none"><button type="button" class="btn btn-outline" onclick="document.getElementById(\'cfgLogoFile\').click()" style="margin-bottom:8px">📁 Carregar Logo do Computador</button><p style="font-size:.75rem;color:var(--text-muted);margin:4px 0 0 0">Tamanho ideal: <strong>200 x 200 px</strong> (quadrada) — JPG, PNG ou WEBP — Máx: 2 MB</p></div><div id="cfgLogoPreview" style="margin-top:10px;text-align:center">'+(emp.logo?'<img src="'+emp.logo+'" style="max-width:150px;max-height:150px;border-radius:8px;object-fit:cover"><br><button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="document.getElementById(\'cfgLogoPreview\').innerHTML=\'\';document.getElementById(\'cfgLogoFile\').setAttribute(\'data-base64\',\'REMOVER\')">🗑️ Remover</button>':'')+'</div></div>'+
      // ASSINATURA
      '<div class="form-group" style="margin-top:16px"><label>✍️ Assinatura do Empresário (PNG sem fundo)</label><div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center;margin-top:4px"><input type="file" id="cfgAssinaturaFile" accept="image/png,image/webp" style="display:none"><button type="button" class="btn btn-outline" onclick="document.getElementById(\'cfgAssinaturaFile\').click()" style="margin-bottom:8px">📁 Carregar Assinatura do Computador</button><p style="font-size:.75rem;color:var(--text-muted);margin:4px 0 0 0">Formato: <strong>PNG sem fundo</strong> — Tamanho ideal: <strong>400 x 150 px</strong> — Máx: 2 MB</p></div><div id="cfgAssinaturaPreview" style="margin-top:10px;text-align:center;padding:10px;background:var(--bg-tertiary);border-radius:8px">'+(emp.assinatura?'<img src="'+emp.assinatura+'" style="max-width:250px;max-height:80px;object-fit:contain"><br><button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="document.getElementById(\'cfgAssinaturaPreview\').innerHTML=\'\';document.getElementById(\'cfgAssinaturaFile\').setAttribute(\'data-base64\',\'REMOVER\')">🗑️ Remover</button>':'<span style="color:var(--text-muted)">Nenhuma assinatura enviada</span>')+'</div></div>'+
      '<button class="btn btn-primary" style="margin-top:12px" onclick="saveConfigEmpresa()">Salvar Empresa</button>'+
    '</div>'+
    // GRIDS DE CONFIGURAÇÃO
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
      '<div class="card"><div class="card-header"><span>📂 Categorias do Fluxo</span><button class="btn btn-sm btn-primary" onclick="addCategoriaFluxo()">+ Adicionar</button></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Tipo</th><th>Ações</th></tr></thead><tbody>'+catRows+'</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><span>💳 F.Pgto Compras</span><button class="btn btn-sm btn-primary" onclick="addFormaPgtoCompra()">+ Adicionar</button></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>'+fpRows+'</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><span>💳 F.Pgto Vendas</span><button class="btn btn-sm btn-primary" onclick="addFormaPgtoVenda()">+ Adicionar</button></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>'+fpvRows+'</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><span>📋 Situação Compras</span><button class="btn btn-sm btn-primary" onclick="addSituacaoCompra()">+ Adicionar</button></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>'+scRows+'</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><span>📋 Situação Vendas</span><button class="btn btn-sm btn-primary" onclick="addSituacaoVenda()">+ Adicionar</button></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>'+svRows+'</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><span>🧑‍💼 Vendedores</span><button class="btn btn-sm btn-primary" onclick="addVendedorCfg()">+ Adicionar</button></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>'+vendRows+'</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><span>🚚 Situação Entrega</span><button class="btn btn-sm btn-primary" onclick="addSituacaoEntrega()">+ Adicionar</button></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>'+seRows+'</tbody></table></div></div>'+
    '</div>';
  setTimeout(function(){handleImageUpload('cfgLogoFile','cfgLogoPreview');handleImageUpload('cfgAssinaturaFile','cfgAssinaturaPreview');applyAllMasks();},50);
}

function saveConfigEmpresa(){
  var imgInput=document.getElementById('cfgLogoFile');var base64=imgInput?imgInput.getAttribute('data-base64'):null;
  var assInput=document.getElementById('cfgAssinaturaFile');var assBase64=assInput?assInput.getAttribute('data-base64'):null;
  if(!appData.empresa) appData.empresa={};
  appData.empresa.nome=document.getElementById('cfgNome').value.trim();
  appData.empresa.cnpj=document.getElementById('cfgCnpj').value.trim();
  appData.empresa.empreendedor=document.getElementById('cfgEmpreendedor').value.trim();
  appData.empresa.cidade=document.getElementById('cfgCidade').value.trim();
  if(base64==='REMOVER') appData.empresa.logo='';
  else if(base64) appData.empresa.logo=base64;
  if(assBase64==='REMOVER') appData.empresa.assinatura='';
  else if(assBase64) appData.empresa.assinatura=assBase64;
  saveData();updateSidebarInfo();showToast('Dados da empresa salvos!','success');
}

// Config CRUDs
function addCategoriaFluxo(){var nome=prompt('Nome da categoria:');if(!nome)return;var tipo=prompt('Tipo (entrada ou saida):','entrada');if(tipo!=='entrada'&&tipo!=='saida'){showToast('Tipo deve ser "entrada" ou "saida"','error');return;}if(!appData.categoriasFluxo)appData.categoriasFluxo=[];appData.categoriasFluxo.push({nome:nome.trim(),tipo:tipo});saveData();renderConfiguracoesPage();showToast('Adicionado!','success');}
function editCategoriaFluxo(i){var c=appData.categoriasFluxo[i];if(!c)return;var nome=prompt('Nome:',c.nome);if(!nome)return;var tipo=prompt('Tipo (entrada ou saida):',c.tipo);if(tipo!=='entrada'&&tipo!=='saida')return;appData.categoriasFluxo[i]={nome:nome.trim(),tipo:tipo};saveData();renderConfiguracoesPage();showToast('Atualizado!','success');}
function deleteCategoriaFluxo(i){if(!confirm('Excluir?'))return;appData.categoriasFluxo.splice(i,1);saveData();renderConfiguracoesPage();showToast('Excluído!','success');}
function addFormaPgtoCompra(){var nome=prompt('Nova forma de pagamento (compras):');if(!nome)return;appData.formasPagamento.push(nome.trim());appData.formasPagamento.sort();saveData();renderConfiguracoesPage();showToast('Adicionado!','success');}
function editFormaPgtoCompra(i){var atual=appData.formasPagamento[i];var novo=prompt('Editar:',atual);if(!novo)return;appData.formasPagamento[i]=novo.trim();saveData();renderConfiguracoesPage();showToast('Atualizado!','success');}
function deleteFormaPgtoCompra(i){if(!confirm('Excluir?'))return;appData.formasPagamento.splice(i,1);saveData();renderConfiguracoesPage();showToast('Excluído!','success');}
function addFormaPgtoVenda(){var nome=prompt('Nova forma de pagamento (vendas):');if(!nome)return;appData.formasPagamentoVendas.push(nome.trim());appData.formasPagamentoVendas.sort();saveData();renderConfiguracoesPage();showToast('Adicionado!','success');}
function editFormaPgtoVenda(i){var atual=appData.formasPagamentoVendas[i];var novo=prompt('Editar:',atual);if(!novo)return;appData.formasPagamentoVendas[i]=novo.trim();saveData();renderConfiguracoesPage();showToast('Atualizado!','success');}
function deleteFormaPgtoVenda(i){if(!confirm('Excluir?'))return;appData.formasPagamentoVendas.splice(i,1);saveData();renderConfiguracoesPage();showToast('Excluído!','success');}
function addSituacaoCompra(){var nome=prompt('Nova situação (compras):');if(!nome)return;appData.situacaoCompra.push(nome.trim());saveData();renderConfiguracoesPage();showToast('Adicionado!','success');}
function editSituacaoCompra(i){var atual=appData.situacaoCompra[i];var novo=prompt('Editar:',atual);if(!novo)return;appData.situacaoCompra[i]=novo.trim();saveData();renderConfiguracoesPage();showToast('Atualizado!','success');}
function deleteSituacaoCompra(i){if(!confirm('Excluir?'))return;appData.situacaoCompra.splice(i,1);saveData();renderConfiguracoesPage();showToast('Excluído!','success');}
function addSituacaoVenda(){var nome=prompt('Nova situação (vendas):');if(!nome)return;appData.situacaoVenda.push(nome.trim());saveData();renderConfiguracoesPage();showToast('Adicionado!','success');}
function editSituacaoVenda(i){var atual=appData.situacaoVenda[i];var novo=prompt('Editar:',atual);if(!novo)return;appData.situacaoVenda[i]=novo.trim();saveData();renderConfiguracoesPage();showToast('Atualizado!','success');}
function deleteSituacaoVenda(i){if(!confirm('Excluir?'))return;appData.situacaoVenda.splice(i,1);saveData();renderConfiguracoesPage();showToast('Excluído!','success');}
function addVendedorCfg(){var nome=prompt('Novo vendedor:');if(!nome)return;appData.vendedores.push(nome.trim());saveData();renderConfiguracoesPage();showToast('Adicionado!','success');}
function editVendedor(i){var atual=appData.vendedores[i];var novo=prompt('Editar:',atual);if(!novo)return;appData.vendedores[i]=novo.trim();saveData();renderConfiguracoesPage();showToast('Atualizado!','success');}
function deleteVendedor(i){if(!confirm('Excluir?'))return;appData.vendedores.splice(i,1);saveData();renderConfiguracoesPage();showToast('Excluído!','success');}
function addSituacaoEntrega(){var nome=prompt('Nova situação de entrega:');if(!nome)return;appData.situacaoEntrega.push(nome.trim());saveData();renderConfiguracoesPage();showToast('Adicionado!','success');}
function editSituacaoEntrega(i){var atual=appData.situacaoEntrega[i];var novo=prompt('Editar:',atual);if(!novo)return;appData.situacaoEntrega[i]=novo.trim();saveData();renderConfiguracoesPage();showToast('Atualizado!','success');}
function deleteSituacaoEntrega(i){if(!confirm('Excluir?'))return;appData.situacaoEntrega.splice(i,1);saveData();renderConfiguracoesPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-BKP-01: BACKUP ──
// ══════════════════════════════════════════════════════════════
function renderBackupPage(){
  var pg=document.getElementById('page-backup');if(!pg)return;
  pg.innerHTML=
    '<div class="page-header"><h2>💾 Backup</h2></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
      '<div class="card" style="text-align:center;padding:32px"><h3>📥 Exportar Backup</h3><p style="color:var(--text-muted);margin:8px 0 16px">Baixe um arquivo JSON com todos os dados.</p><button class="btn btn-primary" onclick="exportBackup()">📥 Exportar JSON</button></div>'+
      '<div class="card" style="text-align:center;padding:32px"><h3>📤 Importar Backup</h3><p style="color:var(--text-muted);margin:8px 0 16px">Restaure dados de um arquivo JSON.</p><input type="file" id="importBackupFile" accept=".json" style="display:none" onchange="importBackup(this)"><button class="btn btn-primary" onclick="document.getElementById(\'importBackupFile\').click()">📤 Importar JSON</button></div>'+
    '</div>'+
    '<div class="card" style="margin-top:16px;text-align:center;padding:24px"><h3>🗑️ Limpar Dados</h3><p style="color:var(--text-muted);margin:8px 0 16px">Remove todos os dados e restaura configurações padrão.</p><button class="btn btn-danger" onclick="limparDados()">🗑️ Limpar Todos os Dados</button></div>';
}
function exportBackup(){var data=JSON.stringify(appData,null,2);var blob=new Blob([data],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='wdmaquinas_backup_'+todayStr()+'.json';a.click();URL.revokeObjectURL(url);showToast('Backup exportado!','success');}
function importBackup(input){var file=input.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){try{var data=JSON.parse(e.target.result);if(!confirm('Isso substituirá todos os dados atuais. Continuar?'))return;appData=data;ensureDefaults();saveData();updateSidebarInfo();navigateTo('dashboard');showToast('Backup importado!','success');}catch(err){showToast('Arquivo inválido!','error');}};reader.readAsText(file);}
function limparDados(){if(!confirm('Tem certeza? Todos os dados serão perdidos!'))return;if(!confirm('ÚLTIMA CHANCE! Realmente limpar tudo?'))return;appData=getDefaultData();saveData();updateSidebarInfo();navigateTo('dashboard');showToast('Dados limpos!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-INIT-01: INICIALIZAÇÃO ──
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async function(){
  try{if(typeof window.supabase!=='undefined'&&window.supabase.createClient){supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);}}catch(e){}
  await loadData();
  updateSidebarInfo();
  navigateTo('dashboard');
});
