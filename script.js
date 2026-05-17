// ╔══════════════════════════════════════════════════════════════╗
// ║  WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026              ║
// ║  script.js — CÓDIGO COMPLETO CORRIGIDO v13                 ║
// ║  Novidades: Receitas MEI sem tabela (só cards mês/anual),  ║
// ║  Garantia sem campo Dias Garantia (auto-calc),             ║
// ║  Projeção Lucro, Upload Assinatura                         ║
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
// ── SCR-FLX-01: FLUXO MENSAL ──
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
function renderFluxoTable(mesIdx){
  var mesKey=mesesKeys[mesIdx];var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[mesKey])?appData.fluxoCaixa[mesKey]:[];
  if(fluxoFilterText) lancs=lancs.filter(function(l){return(l.descricao||'').toLowerCase().includes(fluxoFilterText)||(l.categoria||'').toLowerCase().includes(fluxoFilterText);});
  if(fluxoFilterTipo) lancs=lancs.filter(function(l){return l.tipo===fluxoFilterTipo;});
  var tbody=document.getElementById('fluxoBody');if(!tbody)return;
  if(lancs.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum lançamento</td></tr>';return;}
  tbody.innerHTML=lancs.map(function(l){
    var corValor=l.tipo==='entrada'?'text-success':'text-danger';var sinal=l.tipo==='entrada'?'+':'-';
    return'<tr><td>'+formatDate(l.data)+'</td><td>'+l.descricao+'</td><td>'+l.categoria+'</td><td>'+(l.tipo==='entrada'?'<span class="text-success">Entrada</span>':'<span class="text-danger">Saída</span>')+'</td><td class="'+corValor+'">'+sinal+' '+formatCurrency(l.valor)+'</td><td><button class="btn btn-sm btn-primary" onclick="editLancamento('+mesIdx+','+l.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteLancamento('+mesIdx+','+l.id+')">🗑️</button></td></tr>';
  }).join('');
}
function openLancamentoModal(mesIdx,lanc){
  var isEdit=!!lanc;var tipoVal=lanc?lanc.tipo:'entrada';
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Lançamento':'Novo Lançamento';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" class="form-control" id="flxData" value="'+(lanc?lanc.data:todayStr())+'"></div><div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="flxDesc" value="'+(lanc?lanc.descricao:'')+'"></div></div>'+
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
    '<div class="form-group"><label>Nota Fiscal</label><select class="form-control" id="vnNota"><option value="Sem Nota"'+(venda&&venda.notaFiscal==='Sem Nota'?' selected':'')+'>Sem Nota</option><option value="Com Nota"'+(venda&&venda.notaFiscal==='Com Nota'?' selected':'')+'>Com Nota</option></select></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="vnObs" rows="2">'+(venda?venda.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveVenda('+(isEdit?venda.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveVenda(id){
  var obj={data:document.getElementById('vnData').value,vencimento:document.getElementById('vnVenc').value,produto:document.getElementById('vnProd').value.trim(),quantidade:parseFloat(document.getElementById('vnQtd').value)||1,valorUnit:parseFloat(document.getElementById('vnValor').value)||0,cliente:document.getElementById('vnCli').value,vendedor:document.getElementById('vnVend').value,formaPagamento:document.getElementById('vnPgto').value,situacao:document.getElementById('vnSit').value,entrega:document.getElementById('vnEnt').value,notaFiscal:document.getElementById('vnNota').value,obs:document.getElementById('vnObs').value};
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
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Data</span>'+formatDate(v.data)+'</div><div class="detail-item"><span class="detail-label">Vencimento</span>'+formatDate(v.vencimento)+'</div><div class="detail-item"><span class="detail-label">Produto</span>'+v.produto+'</div><div class="detail-item"><span class="detail-label">Qtd</span>'+v.quantidade+'</div><div class="detail-item"><span class="detail-label">V.Unit</span>'+formatCurrency(v.valorUnit)+'</div><div class="detail-item"><span class="detail-label">Total</span>'+formatCurrency(total)+'</div><div class="detail-item"><span class="detail-label">Cliente</span>'+(v.cliente||'-')+'</div><div class="detail-item"><span class="detail-label">Vendedor</span>'+(v.vendedor||'-')+'</div><div class="detail-item"><span class="detail-label">Pgto</span>'+(v.formaPagamento||'-')+'</div><div class="detail-item"><span class="detail-label">Situação</span>'+situacaoBadge(v.situacao)+'</div><div class="detail-item"><span class="detail-label">Entrega</span>'+situacaoBadge(v.entrega)+'</div><div class="detail-item"><span class="detail-label">Nota Fiscal</span>'+(v.notaFiscal||'Sem Nota')+'</div></div>'+(v.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+v.obs+'</div>':'');
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
    '<div class="form-group"><label>Imagem do Produto</label><div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center;margin-top:4px"><input type="file" id="prdImgFile" accept="image/jpeg,image/png,image/webp" style="display:none"><button type="button" class="btn btn-outline" onclick="document.getElementById(\'prdImgFile\').click()" style="margin-bottom:8px">📁 Carregar Imagem</button><p style="font-size:.75rem;color:var(--text-muted);margin:4px 0 0 0">JPG, PNG ou WEBP — Máx: 2 MB</p></div><div id="prdImgPreview" style="margin-top:10px;text-align:center">'+(prod&&prod.imagem?'<img src="'+prod.imagem+'" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover">':'')+'</div></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="prdObs" rows="2">'+(prod?prod.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduto('+(isEdit?prod.id:'null')+')">Salvar</button>';
  openCadastroModal();setTimeout(function(){handleImageUpload('prdImgFile','prdImgPreview');},50);
}
function saveProduto(id){
  var imgInput=document.getElementById('prdImgFile');var base64=imgInput?imgInput.getAttribute('data-base64')||'':'';
  var obj={nome:document.getElementById('prdNome').value.trim(),categoria:document.getElementById('prdCat').value.trim(),unidade:document.getElementById('prdUnid').value,preco:parseFloat(document.getElementById('prdPreco').value)||0,obs:document.getElementById('prdObs').value};
  if(base64==='REMOVER') obj.imagem=''; else if(base64) obj.imagem=base64;
  else if(id){var old=(appData.produtos||[]).find(function(p){return p.id===id;});if(old) obj.imagem=old.imagem||'';}
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.produtos) appData.produtos=[];
  if(id){var idx=appData.produtos.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.produtos[idx]=obj;}}
  else{obj.id=nextId(appData.produtos);appData.produtos.push(obj);}
  saveData();closeCadastroModal();renderProdutosPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editProduto(id){var p=(appData.produtos||[]).find(function(x){return x.id===id;});if(p)openProdutoModal(p);}
function viewProduto(id){
  var p=(appData.produtos||[]).find(function(x){return x.id===id;});if(!p)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Produto';
  document.getElementById('viewModalBody').innerHTML=(p.imagem?'<div style="text-align:center;margin-bottom:16px"><img src="'+p.imagem+'" style="max-width:300px;max-height:250px;border-radius:12px;object-fit:cover"></div>':'')+'<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+p.nome+'</div><div class="detail-item"><span class="detail-label">Categoria</span>'+(p.categoria||'-')+'</div><div class="detail-item"><span class="detail-label">Unidade</span>'+(p.unidade||'-')+'</div><div class="detail-item"><span class="detail-label">Preço</span>'+formatCurrency(p.preco)+'</div></div>'+(p.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+p.obs+'</div>':'');
  openViewModal();
}
function deleteProduto(id){if(!confirm('Excluir produto?'))return;appData.produtos=(appData.produtos||[]).filter(function(p){return p.id!==id;});saveData();renderProdutosPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-CLI-01: CLIENTES ──
// ══════════════════════════════════════════════════════════════
function renderClientesPage(){
  var pg=document.getElementById('page-clientes');if(!pg)return;var items=appData.clientes||[];
  pg.innerHTML='<div class="page-header"><h2>👤 Clientes</h2><button class="btn btn-primary" onclick="openClienteModal()">+ Novo Cliente</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Clientes</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cliente..." oninput="filterClientes(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead><tbody id="clientesBody"></tbody></table></div>';
  renderClientesTable(items);
}
function renderClientesTable(items){var tbody=document.getElementById('clientesBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cliente</td></tr>';return;}tbody.innerHTML=items.map(function(c){return'<tr><td>'+(c.nome||'-')+'</td><td>'+(c.cpfCnpj||'-')+'</td><td>'+(c.telefone||'-')+'</td><td>'+(c.cidade||'-')+'</td><td><button class="btn btn-sm btn-outline" onclick="viewCliente('+c.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editCliente('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCliente('+c.id+')">🗑️</button></td></tr>';}).join('');}
function filterClientes(q){q=q.toLowerCase();renderClientesTable((appData.clientes||[]).filter(function(c){return(c.nome||'').toLowerCase().includes(q)||(c.cpfCnpj||'').includes(q);}));}
function openClienteModal(cli){
  var isEdit=!!cli;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cliente':'Novo Cliente';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="clNome" value="'+(cli?cli.nome:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>CPF/CNPJ</label><input type="text" class="form-control" id="clCpfCnpj" value="'+(cli?cli.cpfCnpj||'':'')+'"></div><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="clTelefone" value="'+(cli?cli.telefone||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="clCelular" value="'+(cli?cli.celular||'':'')+'"></div><div class="form-group"><label>Email</label><input type="email" class="form-control" id="clEmail" value="'+(cli?cli.email||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="clCidade" value="'+(cli?cli.cidade||'':'')+'"></div><div class="form-group"><label>Estado</label><input type="text" class="form-control" id="clEstado" value="'+(cli?cli.estado||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="clEndereco" value="'+(cli?cli.endereco||'':'')+'"></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="clObs" rows="2">'+(cli?cli.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCliente('+(isEdit?cli.id:'null')+')">Salvar</button>';
  openCadastroModal();applyAllMasks();
}
function saveCliente(id){
  var obj={nome:document.getElementById('clNome').value.trim(),cpfCnpj:document.getElementById('clCpfCnpj').value,telefone:document.getElementById('clTelefone').value,celular:document.getElementById('clCelular').value,email:document.getElementById('clEmail').value,cidade:document.getElementById('clCidade').value,estado:document.getElementById('clEstado').value,endereco:document.getElementById('clEndereco').value,obs:document.getElementById('clObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.clientes) appData.clientes=[];
  if(id){var idx=appData.clientes.findIndex(function(c){return c.id===id;});if(idx>-1){obj.id=id;appData.clientes[idx]=obj;}}
  else{obj.id=nextId(appData.clientes);appData.clientes.push(obj);}
  saveData();closeCadastroModal();renderClientesPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editCliente(id){var c=(appData.clientes||[]).find(function(x){return x.id===id;});if(c)openClienteModal(c);}
function viewCliente(id){
  var c=(appData.clientes||[]).find(function(x){return x.id===id;});if(!c)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Cliente';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+c.nome+'</div><div class="detail-item"><span class="detail-label">CPF/CNPJ</span>'+(c.cpfCnpj||'-')+'</div><div class="detail-item"><span class="detail-label">Telefone</span>'+(c.telefone||'-')+'</div><div class="detail-item"><span class="detail-label">Celular</span>'+(c.celular||'-')+'</div><div class="detail-item"><span class="detail-label">Email</span>'+(c.email||'-')+'</div><div class="detail-item"><span class="detail-label">Cidade</span>'+(c.cidade||'-')+'</div><div class="detail-item"><span class="detail-label">Estado</span>'+(c.estado||'-')+'</div><div class="detail-item"><span class="detail-label">Endereço</span>'+(c.endereco||'-')+'</div></div>'+(c.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+c.obs+'</div>':'');
  openViewModal();
}
function deleteCliente(id){if(!confirm('Excluir cliente?'))return;appData.clientes=(appData.clientes||[]).filter(function(c){return c.id!==id;});saveData();renderClientesPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-FRN-01: FORNECEDORES ──
// ══════════════════════════════════════════════════════════════
function renderFornecedoresPage(){
  var pg=document.getElementById('page-fornecedores');if(!pg)return;var items=appData.fornecedores||[];
  pg.innerHTML='<div class="page-header"><h2>🏭 Fornecedores</h2><button class="btn btn-primary" onclick="openFornecedorModal()">+ Novo Fornecedor</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Fornecedores</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar fornecedor..." oninput="filterFornecedores(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>CNPJ</th><th>Telefone</th><th>Cidade</th><th>Ações</th></tr></thead><tbody id="fornecedoresBody"></tbody></table></div>';
  renderFornecedoresTable(items);
}
function renderFornecedoresTable(items){var tbody=document.getElementById('fornecedoresBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum fornecedor</td></tr>';return;}tbody.innerHTML=items.map(function(f){return'<tr><td>'+(f.nome||'-')+'</td><td>'+(f.cnpj||'-')+'</td><td>'+(f.telefone||'-')+'</td><td>'+(f.cidade||'-')+'</td><td><button class="btn btn-sm btn-outline" onclick="viewFornecedor('+f.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editFornecedor('+f.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteFornecedor('+f.id+')">🗑️</button></td></tr>';}).join('');}
function filterFornecedores(q){q=q.toLowerCase();renderFornecedoresTable((appData.fornecedores||[]).filter(function(f){return(f.nome||'').toLowerCase().includes(q)||(f.cnpj||'').includes(q);}));}
function openFornecedorModal(forn){
  var isEdit=!!forn;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Fornecedor':'Novo Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="fnNome" value="'+(forn?forn.nome:'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="fnCnpj" value="'+(forn?forn.cnpj||'':'')+'"></div><div class="form-group"><label>Telefone</label><input type="text" class="form-control" id="fnTelefone" value="'+(forn?forn.telefone||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Celular</label><input type="text" class="form-control" id="fnCelular" value="'+(forn?forn.celular||'':'')+'"></div><div class="form-group"><label>Email</label><input type="email" class="form-control" id="fnEmail" value="'+(forn?forn.email||'':'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="fnCidade" value="'+(forn?forn.cidade||'':'')+'"></div><div class="form-group"><label>Estado</label><input type="text" class="form-control" id="fnEstado" value="'+(forn?forn.estado||'':'')+'"></div></div>'+
    '<div class="form-group"><label>Endereço</label><input type="text" class="form-control" id="fnEndereco" value="'+(forn?forn.endereco||'':'')+'"></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="fnObs" rows="2">'+(forn?forn.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveFornecedor('+(isEdit?forn.id:'null')+')">Salvar</button>';
  openCadastroModal();applyAllMasks();
}
function saveFornecedor(id){
  var obj={nome:document.getElementById('fnNome').value.trim(),cnpj:document.getElementById('fnCnpj').value,telefone:document.getElementById('fnTelefone').value,celular:document.getElementById('fnCelular').value,email:document.getElementById('fnEmail').value,cidade:document.getElementById('fnCidade').value,estado:document.getElementById('fnEstado').value,endereco:document.getElementById('fnEndereco').value,obs:document.getElementById('fnObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.fornecedores) appData.fornecedores=[];
  if(id){var idx=appData.fornecedores.findIndex(function(f){return f.id===id;});if(idx>-1){obj.id=id;appData.fornecedores[idx]=obj;}}
  else{obj.id=nextId(appData.fornecedores);appData.fornecedores.push(obj);}
  saveData();closeCadastroModal();renderFornecedoresPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editFornecedor(id){var f=(appData.fornecedores||[]).find(function(x){return x.id===id;});if(f)openFornecedorModal(f);}
function viewFornecedor(id){
  var f=(appData.fornecedores||[]).find(function(x){return x.id===id;});if(!f)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Fornecedor';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+f.nome+'</div><div class="detail-item"><span class="detail-label">CNPJ</span>'+(f.cnpj||'-')+'</div><div class="detail-item"><span class="detail-label">Telefone</span>'+(f.telefone||'-')+'</div><div class="detail-item"><span class="detail-label">Celular</span>'+(f.celular||'-')+'</div><div class="detail-item"><span class="detail-label">Email</span>'+(f.email||'-')+'</div><div class="detail-item"><span class="detail-label">Cidade</span>'+(f.cidade||'-')+'</div><div class="detail-item"><span class="detail-label">Estado</span>'+(f.estado||'-')+'</div><div class="detail-item"><span class="detail-label">Endereço</span>'+(f.endereco||'-')+'</div></div>'+(f.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+f.obs+'</div>':'');
  openViewModal();
}
function deleteFornecedor(id){if(!confirm('Excluir fornecedor?'))return;appData.fornecedores=(appData.fornecedores||[]).filter(function(f){return f.id!==id;});saveData();renderFornecedoresPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-PFN-01: P. FORNECEDORES ──
// ══════════════════════════════════════════════════════════════
function renderPFornecedoresPage(){
  var pg=document.getElementById('page-pfornecedores');if(!pg)return;var items=appData.pFornecedores||[];
  pg.innerHTML='<div class="page-header"><h2>🏭 P. Fornecedores</h2><button class="btn btn-primary" onclick="openPFornModal()">+ Novo</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPForn(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Produto</th><th>Contato</th><th>Ações</th></tr></thead><tbody id="pfornBody"></tbody></table></div>';
  renderPFornTable(items);
}
function renderPFornTable(items){var tbody=document.getElementById('pfornBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>';return;}tbody.innerHTML=items.map(function(p){return'<tr><td>'+(p.nome||'-')+'</td><td>'+(p.produto||'-')+'</td><td>'+(p.contato||'-')+'</td><td><button class="btn btn-sm btn-primary" onclick="editPForn('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePForn('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterPForn(q){q=q.toLowerCase();renderPFornTable((appData.pFornecedores||[]).filter(function(p){return(p.nome||'').toLowerCase().includes(q)||(p.produto||'').toLowerCase().includes(q);}));}
function openPFornModal(item){
  var isEdit=!!item;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar':'Novo P. Fornecedor';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="pfNome" value="'+(item?item.nome:'')+'"></div><div class="form-group"><label>Produto</label><input type="text" class="form-control" id="pfProduto" value="'+(item?item.produto||'':'')+'"></div><div class="form-group"><label>Contato</label><input type="text" class="form-control" id="pfContato" value="'+(item?item.contato||'':'')+'"></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="pfObs" rows="2">'+(item?item.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePForn('+(isEdit?item.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function savePForn(id){
  var obj={nome:document.getElementById('pfNome').value.trim(),produto:document.getElementById('pfProduto').value,contato:document.getElementById('pfContato').value,obs:document.getElementById('pfObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.pFornecedores) appData.pFornecedores=[];
  if(id){var idx=appData.pFornecedores.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.pFornecedores[idx]=obj;}}
  else{obj.id=nextId(appData.pFornecedores);appData.pFornecedores.push(obj);}
  saveData();closeCadastroModal();renderPFornecedoresPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editPForn(id){var p=(appData.pFornecedores||[]).find(function(x){return x.id===id;});if(p)openPFornModal(p);}
function deletePForn(id){if(!confirm('Excluir?'))return;appData.pFornecedores=(appData.pFornecedores||[]).filter(function(p){return p.id!==id;});saveData();renderPFornecedoresPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-BOL-01: BOLETOS ──
// ══════════════════════════════════════════════════════════════
function renderBoletosPage(){
  var pg=document.getElementById('page-boletos');if(!pg)return;var items=appData.boletos||[];
  var total=items.reduce(function(s,b){return s+(b.valor||0);},0);
  var pago=items.filter(function(b){return b.situacao==='Pago';}).reduce(function(s,b){return s+(b.valor||0);},0);
  var pend=items.filter(function(b){return b.situacao!=='Pago';}).reduce(function(s,b){return s+(b.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>📄 Boletos</h2><button class="btn btn-primary" onclick="openBoletoModal()">+ Novo Boleto</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+items.length+' boleto(s)</div></div><div class="card"><div class="card-header"><span>Pago</span></div><div class="card-value text-success">'+formatCurrency(pago)+'</div></div><div class="card"><div class="card-header"><span>Pendente</span></div><div class="card-value text-danger">'+formatCurrency(pend)+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar boleto..." oninput="filterBoletos(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Dias Rest.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="boletosBody"></tbody></table></div>';
  renderBoletosTable(items);
}
function renderBoletosTable(items){var tbody=document.getElementById('boletosBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum boleto</td></tr>';return;}var sitOpts=appData.situacaoBoleto||[];tbody.innerHTML=items.map(function(b){var dias=calcDiasRestantes(b.vencimento);var sitSel='<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changeBoletoSit('+b.id+',this.value)">'+sitOpts.map(function(s){return'<option value="'+s+'"'+(b.situacao===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>';return'<tr><td>'+(b.descricao||'-')+'</td><td>'+formatCurrency(b.valor)+'</td><td>'+formatDate(b.vencimento)+'</td><td>'+formatDiasRestantes(dias,b.situacao)+'</td><td>'+sitSel+'</td><td><button class="btn btn-sm btn-primary" onclick="editBoleto('+b.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBoleto('+b.id+')">🗑️</button></td></tr>';}).join('');}
function filterBoletos(q){q=q.toLowerCase();renderBoletosTable((appData.boletos||[]).filter(function(b){return(b.descricao||'').toLowerCase().includes(q);}));}
function changeBoletoSit(id,val){var b=(appData.boletos||[]).find(function(x){return x.id===id;});if(b){b.situacao=val;saveData();renderBoletosPage();}}
function openBoletoModal(bol){
  var isEdit=!!bol;var sitOpts=(appData.situacaoBoleto||[]).map(function(s){return'<option value="'+s+'"'+(bol&&bol.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Boleto':'Novo Boleto';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="bolDesc" value="'+(bol?bol.descricao:'')+'"></div><div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="bolValor" value="'+(bol?bol.valor:'')+'" step="0.01"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="bolVenc" value="'+(bol?bol.vencimento:'')+'"></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="bolSit">'+sitOpts+'</select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="bolObs" rows="2">'+(bol?bol.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBoleto('+(isEdit?bol.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveBoleto(id){
  var obj={descricao:document.getElementById('bolDesc').value.trim(),valor:parseFloat(document.getElementById('bolValor').value)||0,vencimento:document.getElementById('bolVenc').value,situacao:document.getElementById('bolSit').value,obs:document.getElementById('bolObs').value};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!appData.boletos) appData.boletos=[];
  if(id){var idx=appData.boletos.findIndex(function(b){return b.id===id;});if(idx>-1){obj.id=id;appData.boletos[idx]=obj;}}
  else{obj.id=nextId(appData.boletos);appData.boletos.push(obj);}
  saveData();closeCadastroModal();renderBoletosPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editBoleto(id){var b=(appData.boletos||[]).find(function(x){return x.id===id;});if(b)openBoletoModal(b);}
function deleteBoleto(id){if(!confirm('Excluir boleto?'))return;appData.boletos=(appData.boletos||[]).filter(function(b){return b.id!==id;});saveData();renderBoletosPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-CHQ-01: CHEQUES ──
// ══════════════════════════════════════════════════════════════
function renderChequesPage(){
  var pg=document.getElementById('page-cheques');if(!pg)return;var items=appData.cheques||[];
  var total=items.reduce(function(s,c){return s+(c.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>📝 Cheques</h2><button class="btn btn-primary" onclick="openChequeModal()">+ Novo Cheque</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+items.length+' cheque(s)</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar cheque..." oninput="filterCheques(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nº Cheque</th><th>Emitente</th><th>Valor</th><th>Bom Para</th><th>Dias Rest.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="chequesBody"></tbody></table></div>';
  renderChequesTable(items);
}
function renderChequesTable(items){var tbody=document.getElementById('chequesBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum cheque</td></tr>';return;}var sitOpts=appData.situacaoCheque||[];tbody.innerHTML=items.map(function(c){var dias=calcDiasRestantes(c.bomPara);var sitSel='<select class="form-control" style="min-width:110px;padding:4px 6px;font-size:12px" onchange="changeChequeSit('+c.id+',this.value)">'+sitOpts.map(function(s){return'<option value="'+s+'"'+(c.situacao===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select>';return'<tr><td>'+(c.numero||'-')+'</td><td>'+(c.emitente||'-')+'</td><td>'+formatCurrency(c.valor)+'</td><td>'+formatDate(c.bomPara)+'</td><td>'+formatDiasRestantes(dias,c.situacao)+'</td><td>'+sitSel+'</td><td><button class="btn btn-sm btn-primary" onclick="editCheque('+c.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCheque('+c.id+')">🗑️</button></td></tr>';}).join('');}
function filterCheques(q){q=q.toLowerCase();renderChequesTable((appData.cheques||[]).filter(function(c){return(c.numero||'').toLowerCase().includes(q)||(c.emitente||'').toLowerCase().includes(q);}));}
function changeChequeSit(id,val){var c=(appData.cheques||[]).find(function(x){return x.id===id;});if(c){c.situacao=val;saveData();renderChequesPage();}}
function openChequeModal(chq){
  var isEdit=!!chq;var sitOpts=(appData.situacaoCheque||[]).map(function(s){return'<option value="'+s+'"'+(chq&&chq.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Cheque':'Novo Cheque';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Nº Cheque</label><input type="text" class="form-control" id="chqNum" value="'+(chq?chq.numero:'')+'"></div><div class="form-group"><label>Emitente *</label><input type="text" class="form-control" id="chqEmit" value="'+(chq?chq.emitente:'')+'"></div></div><div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="chqValor" value="'+(chq?chq.valor:'')+'" step="0.01"></div><div class="form-group"><label>Bom Para</label><input type="date" class="form-control" id="chqBom" value="'+(chq?chq.bomPara:'')+'"></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="chqSit">'+sitOpts+'</select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="chqObs" rows="2">'+(chq?chq.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveCheque('+(isEdit?chq.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveCheque(id){
  var obj={numero:document.getElementById('chqNum').value.trim(),emitente:document.getElementById('chqEmit').value.trim(),valor:parseFloat(document.getElementById('chqValor').value)||0,bomPara:document.getElementById('chqBom').value,situacao:document.getElementById('chqSit').value,obs:document.getElementById('chqObs').value};
  if(!obj.emitente){showToast('Informe o emitente','error');return;}
  if(!appData.cheques) appData.cheques=[];
  if(id){var idx=appData.cheques.findIndex(function(c){return c.id===id;});if(idx>-1){obj.id=id;appData.cheques[idx]=obj;}}
  else{obj.id=nextId(appData.cheques);appData.cheques.push(obj);}
  saveData();closeCadastroModal();renderChequesPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editCheque(id){var c=(appData.cheques||[]).find(function(x){return x.id===id;});if(c)openChequeModal(c);}
function deleteCheque(id){if(!confirm('Excluir cheque?'))return;appData.cheques=(appData.cheques||[]).filter(function(c){return c.id!==id;});saveData();renderChequesPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-PRS-01: PRESTAÇÕES ──
// ══════════════════════════════════════════════════════════════
function renderPrestacoesPage(){
  var pg=document.getElementById('page-prestacoes');if(!pg)return;var items=appData.prestacoes||[];
  var total=items.reduce(function(s,p){return s+(p.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>💳 Prestações</h2><button class="btn btn-primary" onclick="openPrestacaoModal()">+ Nova Prestação</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+items.length+' prestação(ões)</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPrestacoes(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Parcela</th><th>Dias Rest.</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="prestacoesBody"></tbody></table></div>';
  renderPrestacoesTable(items);
}
function renderPrestacoesTable(items){var tbody=document.getElementById('prestacoesBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma prestação</td></tr>';return;}tbody.innerHTML=items.map(function(p){var dias=calcDiasRestantes(p.vencimento);var sitSel='<select class="form-control" style="min-width:100px;padding:4px 6px;font-size:12px" onchange="changePrestSit('+p.id+',this.value)"><option value="Pendente"'+(p.situacao==='Pendente'?' selected':'')+'>Pendente</option><option value="Pago"'+(p.situacao==='Pago'?' selected':'')+'>Pago</option></select>';return'<tr><td>'+(p.descricao||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+formatDate(p.vencimento)+'</td><td>'+(p.parcela||'-')+'</td><td>'+formatDiasRestantes(dias,p.situacao)+'</td><td>'+sitSel+'</td><td><button class="btn btn-sm btn-primary" onclick="editPrestacao('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePrestacao('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterPrestacoes(q){q=q.toLowerCase();renderPrestacoesTable((appData.prestacoes||[]).filter(function(p){return(p.descricao||'').toLowerCase().includes(q);}));}
function changePrestSit(id,val){var p=(appData.prestacoes||[]).find(function(x){return x.id===id;});if(p){p.situacao=val;saveData();renderPrestacoesPage();}}
function openPrestacaoModal(prest){
  var isEdit=!!prest;
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Prestação':'Nova Prestação';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="prsDesc" value="'+(prest?prest.descricao:'')+'"></div><div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prsValor" value="'+(prest?prest.valor:'')+'" step="0.01"></div><div class="form-group"><label>Vencimento</label><input type="date" class="form-control" id="prsVenc" value="'+(prest?prest.vencimento:'')+'"></div></div><div class="form-group"><label>Parcela (ex: 3/12)</label><input type="text" class="form-control" id="prsParcela" value="'+(prest?prest.parcela||'':'')+'"></div><div class="form-group"><label>Situação</label><select class="form-control" id="prsSit"><option value="Pendente"'+(prest&&prest.situacao==='Pendente'?' selected':'')+'>Pendente</option><option value="Pago"'+(prest&&prest.situacao==='Pago'?' selected':'')+'>Pago</option></select></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePrestacao('+(isEdit?prest.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function savePrestacao(id){
  var obj={descricao:document.getElementById('prsDesc').value.trim(),valor:parseFloat(document.getElementById('prsValor').value)||0,vencimento:document.getElementById('prsVenc').value,parcela:document.getElementById('prsParcela').value,situacao:document.getElementById('prsSit').value};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!appData.prestacoes) appData.prestacoes=[];
  if(id){var idx=appData.prestacoes.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.prestacoes[idx]=obj;}}
  else{obj.id=nextId(appData.prestacoes);appData.prestacoes.push(obj);}
  saveData();closeCadastroModal();renderPrestacoesPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editPrestacao(id){var p=(appData.prestacoes||[]).find(function(x){return x.id===id;});if(p)openPrestacaoModal(p);}
function deletePrestacao(id){if(!confirm('Excluir?'))return;appData.prestacoes=(appData.prestacoes||[]).filter(function(p){return p.id!==id;});saveData();renderPrestacoesPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-PRJ-01: PROJETOS ──
// ══════════════════════════════════════════════════════════════
function renderProjetosPage(){
  var pg=document.getElementById('page-projetos');if(!pg)return;var items=appData.projetos||[];
  pg.innerHTML='<div class="page-header"><h2>📋 Projetos</h2><button class="btn btn-primary" onclick="openProjetoModal()">+ Novo Projeto</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total Projetos</span></div><div class="card-value">'+items.length+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar projeto..." oninput="filterProjetos(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody id="projetosBody"></tbody></table></div>';
  renderProjetosTable(items);
}
function renderProjetosTable(items){var tbody=document.getElementById('projetosBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum projeto</td></tr>';return;}tbody.innerHTML=items.map(function(p){return'<tr><td>'+(p.nome||'-')+'</td><td>'+(p.cliente||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+situacaoBadge(p.status)+'</td><td><button class="btn btn-sm btn-outline" onclick="viewProjeto('+p.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editProjeto('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProjeto('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterProjetos(q){q=q.toLowerCase();renderProjetosTable((appData.projetos||[]).filter(function(p){return(p.nome||'').toLowerCase().includes(q)||(p.cliente||'').toLowerCase().includes(q);}));}
function openProjetoModal(proj){
  var isEdit=!!proj;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(proj&&proj.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Projeto':'Novo Projeto';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Nome *</label><input type="text" class="form-control" id="prjNome" value="'+(proj?proj.nome:'')+'"></div><div class="form-group"><label>Cliente</label><select class="form-control" id="prjCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="prjValor" value="'+(proj?proj.valor:'')+'" step="0.01"></div><div class="form-group"><label>Status</label><select class="form-control" id="prjStatus"><option value="Em Andamento"'+(proj&&proj.status==='Em Andamento'?' selected':'')+'>Em Andamento</option><option value="Concluído"'+(proj&&proj.status==='Concluído'?' selected':'')+'>Concluído</option><option value="Cancelado"'+(proj&&proj.status==='Cancelado'?' selected':'')+'>Cancelado</option></select></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="prjObs" rows="2">'+(proj?proj.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProjeto('+(isEdit?proj.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveProjeto(id){
  var obj={nome:document.getElementById('prjNome').value.trim(),cliente:document.getElementById('prjCli').value,valor:parseFloat(document.getElementById('prjValor').value)||0,status:document.getElementById('prjStatus').value,obs:document.getElementById('prjObs').value};
  if(!obj.nome){showToast('Informe o nome','error');return;}
  if(!appData.projetos) appData.projetos=[];
  if(id){var idx=appData.projetos.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.projetos[idx]=obj;}}
  else{obj.id=nextId(appData.projetos);appData.projetos.push(obj);}
  saveData();closeCadastroModal();renderProjetosPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editProjeto(id){var p=(appData.projetos||[]).find(function(x){return x.id===id;});if(p)openProjetoModal(p);}
function viewProjeto(id){
  var p=(appData.projetos||[]).find(function(x){return x.id===id;});if(!p)return;
  document.getElementById('viewModalTitle').textContent='Detalhes do Projeto';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Nome</span>'+p.nome+'</div><div class="detail-item"><span class="detail-label">Cliente</span>'+(p.cliente||'-')+'</div><div class="detail-item"><span class="detail-label">Valor</span>'+formatCurrency(p.valor)+'</div><div class="detail-item"><span class="detail-label">Status</span>'+situacaoBadge(p.status)+'</div></div>'+(p.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+p.obs+'</div>':'');
  openViewModal();
}
function deleteProjeto(id){if(!confirm('Excluir projeto?'))return;appData.projetos=(appData.projetos||[]).filter(function(p){return p.id!==id;});saveData();renderProjetosPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-PGC-01: PAG. CLIENTES ──
// ══════════════════════════════════════════════════════════════
function renderPagClientesPage(){
  var pg=document.getElementById('page-pagclientes');if(!pg)return;var items=appData.pagClientes||[];
  var total=items.reduce(function(s,p){return s+(p.valor||0);},0);
  var recebido=items.filter(function(p){return p.situacao==='Pago';}).reduce(function(s,p){return s+(p.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>💲 Pag. Clientes</h2><button class="btn btn-primary" onclick="openPagCliModal()">+ Novo</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div></div><div class="card"><div class="card-header"><span>Recebido</span></div><div class="card-value text-success">'+formatCurrency(recebido)+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterPagCli(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Cliente</th><th>Descrição</th><th>Valor</th><th>Data</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="pagcliBody"></tbody></table></div>';
  renderPagCliTable(items);
}
function renderPagCliTable(items){var tbody=document.getElementById('pagcliBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum registro</td></tr>';return;}tbody.innerHTML=items.map(function(p){return'<tr><td>'+(p.cliente||'-')+'</td><td>'+(p.descricao||'-')+'</td><td>'+formatCurrency(p.valor)+'</td><td>'+formatDate(p.data)+'</td><td>'+situacaoBadge(p.situacao)+'</td><td><button class="btn btn-sm btn-primary" onclick="editPagCli('+p.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePagCli('+p.id+')">🗑️</button></td></tr>';}).join('');}
function filterPagCli(q){q=q.toLowerCase();renderPagCliTable((appData.pagClientes||[]).filter(function(p){return(p.cliente||'').toLowerCase().includes(q)||(p.descricao||'').toLowerCase().includes(q);}));}
function openPagCliModal(item){
  var isEdit=!!item;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(item&&item.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Pagamento':'Novo Pagamento';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-group"><label>Cliente</label><select class="form-control" id="pcCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Descrição *</label><input type="text" class="form-control" id="pcDesc" value="'+(item?item.descricao:'')+'"></div><div class="form-row"><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="pcValor" value="'+(item?item.valor:'')+'" step="0.01"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="pcData" value="'+(item?item.data:todayStr())+'"></div></div><div class="form-group"><label>Situação</label><select class="form-control" id="pcSit"><option value="Pendente"'+(item&&item.situacao==='Pendente'?' selected':'')+'>Pendente</option><option value="Pago"'+(item&&item.situacao==='Pago'?' selected':'')+'>Pago</option></select></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="savePagCli('+(isEdit?item.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function savePagCli(id){
  var obj={cliente:document.getElementById('pcCli').value,descricao:document.getElementById('pcDesc').value.trim(),valor:parseFloat(document.getElementById('pcValor').value)||0,data:document.getElementById('pcData').value,situacao:document.getElementById('pcSit').value};
  if(!obj.descricao){showToast('Informe a descrição','error');return;}
  if(!appData.pagClientes) appData.pagClientes=[];
  if(id){var idx=appData.pagClientes.findIndex(function(p){return p.id===id;});if(idx>-1){obj.id=id;appData.pagClientes[idx]=obj;}}
  else{obj.id=nextId(appData.pagClientes);appData.pagClientes.push(obj);}
  saveData();closeCadastroModal();renderPagClientesPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editPagCli(id){var p=(appData.pagClientes||[]).find(function(x){return x.id===id;});if(p)openPagCliModal(p);}
function deletePagCli(id){if(!confirm('Excluir?'))return;appData.pagClientes=(appData.pagClientes||[]).filter(function(p){return p.id!==id;});saveData();renderPagClientesPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-GAR-01: GARANTIAS (SEM CAMPO DIAS GARANTIA NO MODAL, SEM COLUNA DIAS GARANTIA NA TABELA) ──
// ══════════════════════════════════════════════════════════════
function renderGarantiasPage(){
  var pg=document.getElementById('page-garantias');if(!pg)return;var items=appData.garantias||[];
  var ativas=items.filter(function(g){return getGarantiaSituacaoAuto(g.dataInicio,g.diasGarantia,g.situacao)==='Ativa';}).length;
  var vencidas=items.filter(function(g){return getGarantiaSituacaoAuto(g.dataInicio,g.diasGarantia,g.situacao)==='Vencida';}).length;
  pg.innerHTML='<div class="page-header"><h2>🛡️ Garantias</h2><button class="btn btn-primary" onclick="openGarantiaModal()">+ Nova Garantia</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+items.length+'</div></div><div class="card"><div class="card-header"><span>Ativas</span></div><div class="card-value text-success">'+ativas+'</div></div><div class="card"><div class="card-header"><span>Vencidas</span></div><div class="card-value text-danger">'+vencidas+'</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterGarantias(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Produto</th><th>Cliente</th><th>Data Início</th><th>Restantes</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="garantiasBody"></tbody></table></div>';
  renderGarantiasTable(items);
}
function renderGarantiasTable(items){
  var tbody=document.getElementById('garantiasBody');if(!tbody)return;
  if(items.length===0){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma garantia</td></tr>';return;}
  tbody.innerHTML=items.map(function(g){
    var dias=calcDiasGarantia(g.dataInicio,g.diasGarantia);
    var sitAuto=getGarantiaSituacaoAuto(g.dataInicio,g.diasGarantia,g.situacao);
    return'<tr><td>'+(g.produto||'-')+'</td><td>'+(g.cliente||'-')+'</td><td>'+formatDate(g.dataInicio)+'</td><td>'+formatDiasGarantia(dias,sitAuto)+'</td><td>'+situacaoBadge(sitAuto)+'</td><td><button class="btn btn-sm btn-outline" onclick="viewGarantia('+g.id+')">👁️</button> <button class="btn btn-sm btn-primary" onclick="editGarantia('+g.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGarantia('+g.id+')">🗑️</button></td></tr>';
  }).join('');
}
function filterGarantias(q){q=q.toLowerCase();renderGarantiasTable((appData.garantias||[]).filter(function(g){return(g.produto||'').toLowerCase().includes(q)||(g.cliente||'').toLowerCase().includes(q);}));}
function openGarantiaModal(gar){
  var isEdit=!!gar;
  var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(gar&&gar.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  var sitOpts=(appData.situacaoGarantia||[]).map(function(s){return'<option value="'+s+'"'+(gar&&gar.situacao===s?' selected':'')+'>'+s+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Garantia':'Nova Garantia';
  document.getElementById('cadastroModalBody').innerHTML=
    '<div class="form-group"><label>Produto *</label><input type="text" class="form-control" id="garProduto" value="'+(gar?gar.produto:'')+'"></div>'+
    '<div class="form-group"><label>Cliente</label><select class="form-control" id="garCliente"><option value="">Selecione...</option>'+cliOpts+'</select></div>'+
    '<div class="form-row"><div class="form-group"><label>Data Início *</label><input type="date" class="form-control" id="garDataInicio" value="'+(gar?gar.dataInicio:todayStr())+'"></div><div class="form-group"><label>Situação</label><select class="form-control" id="garSit">'+sitOpts+'</select></div></div>'+
    '<div class="form-group"><label>Obs</label><textarea class="form-control" id="garObs" rows="2">'+(gar?gar.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveGarantia('+(isEdit?gar.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveGarantia(id){
  var obj={produto:document.getElementById('garProduto').value.trim(),cliente:document.getElementById('garCliente').value,dataInicio:document.getElementById('garDataInicio').value,diasGarantia:90,situacao:document.getElementById('garSit').value,obs:document.getElementById('garObs').value};
  if(!obj.produto){showToast('Informe o produto','error');return;}
  if(!obj.dataInicio){showToast('Informe a data de início','error');return;}
  if(!appData.garantias) appData.garantias=[];
  if(id){var idx=appData.garantias.findIndex(function(g){return g.id===id;});if(idx>-1){obj.id=id;appData.garantias[idx]=obj;}}
  else{obj.id=nextId(appData.garantias);appData.garantias.push(obj);}
  saveData();closeCadastroModal();renderGarantiasPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editGarantia(id){var g=(appData.garantias||[]).find(function(x){return x.id===id;});if(g)openGarantiaModal(g);}
function viewGarantia(id){
  var g=(appData.garantias||[]).find(function(x){return x.id===id;});if(!g)return;
  var dias=calcDiasGarantia(g.dataInicio,g.diasGarantia);var sitAuto=getGarantiaSituacaoAuto(g.dataInicio,g.diasGarantia,g.situacao);
  document.getElementById('viewModalTitle').textContent='Detalhes da Garantia';
  document.getElementById('viewModalBody').innerHTML='<div class="detail-grid"><div class="detail-item"><span class="detail-label">Produto</span>'+g.produto+'</div><div class="detail-item"><span class="detail-label">Cliente</span>'+(g.cliente||'-')+'</div><div class="detail-item"><span class="detail-label">Data Início</span>'+formatDate(g.dataInicio)+'</div><div class="detail-item"><span class="detail-label">Dias Restantes</span>'+formatDiasGarantia(dias,sitAuto)+'</div><div class="detail-item"><span class="detail-label">Situação</span>'+situacaoBadge(sitAuto)+'</div></div>'+(g.obs?'<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)"><strong>Obs:</strong> '+g.obs+'</div>':'');
  openViewModal();
}
function deleteGarantia(id){if(!confirm('Excluir garantia?'))return;appData.garantias=(appData.garantias||[]).filter(function(g){return g.id!==id;});saveData();renderGarantiasPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-NTE-01: NOTAS ENTRADA ──
// ══════════════════════════════════════════════════════════════
function renderNotasEntradaPage(){
  var pg=document.getElementById('page-notasentrada');if(!pg)return;var items=appData.notasEntrada||[];
  var total=items.reduce(function(s,n){return s+(n.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>📥 Notas Entrada</h2><button class="btn btn-primary" onclick="openNotaEntradaModal()">+ Nova Nota</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+items.length+' nota(s)</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterNotasEntrada(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nº Nota</th><th>Fornecedor</th><th>Valor</th><th>Data</th><th>Ações</th></tr></thead><tbody id="notasEntradaBody"></tbody></table></div>';
  renderNotasEntradaTable(items);
}
function renderNotasEntradaTable(items){var tbody=document.getElementById('notasEntradaBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>';return;}tbody.innerHTML=items.map(function(n){return'<tr><td>'+(n.numero||'-')+'</td><td>'+(n.fornecedor||'-')+'</td><td>'+formatCurrency(n.valor)+'</td><td>'+formatDate(n.data)+'</td><td><button class="btn btn-sm btn-primary" onclick="editNotaEntrada('+n.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada('+n.id+')">🗑️</button></td></tr>';}).join('');}
function filterNotasEntrada(q){q=q.toLowerCase();renderNotasEntradaTable((appData.notasEntrada||[]).filter(function(n){return(n.numero||'').toLowerCase().includes(q)||(n.fornecedor||'').toLowerCase().includes(q);}));}
function openNotaEntradaModal(nota){
  var isEdit=!!nota;var fornOpts=(appData.fornecedores||[]).map(function(f){return'<option value="'+f.nome+'"'+(nota&&nota.fornecedor===f.nome?' selected':'')+'>'+f.nome+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota':'Nova Nota Entrada';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="neNum" value="'+(nota?nota.numero:'')+'"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="neData" value="'+(nota?nota.data:todayStr())+'"></div></div><div class="form-group"><label>Fornecedor</label><select class="form-control" id="neForn"><option value="">Selecione...</option>'+fornOpts+'</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="neValor" value="'+(nota?nota.valor:'')+'" step="0.01"></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="neObs" rows="2">'+(nota?nota.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaEntrada('+(isEdit?nota.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveNotaEntrada(id){
  var obj={numero:document.getElementById('neNum').value.trim(),data:document.getElementById('neData').value,fornecedor:document.getElementById('neForn').value,valor:parseFloat(document.getElementById('neValor').value)||0,obs:document.getElementById('neObs').value};
  if(!appData.notasEntrada) appData.notasEntrada=[];
  if(id){var idx=appData.notasEntrada.findIndex(function(n){return n.id===id;});if(idx>-1){obj.id=id;appData.notasEntrada[idx]=obj;}}
  else{obj.id=nextId(appData.notasEntrada);appData.notasEntrada.push(obj);}
  saveData();closeCadastroModal();renderNotasEntradaPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editNotaEntrada(id){var n=(appData.notasEntrada||[]).find(function(x){return x.id===id;});if(n)openNotaEntradaModal(n);}
function deleteNotaEntrada(id){if(!confirm('Excluir nota?'))return;appData.notasEntrada=(appData.notasEntrada||[]).filter(function(n){return n.id!==id;});saveData();renderNotasEntradaPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-NTS-01: NOTAS SAÍDA ──
// ══════════════════════════════════════════════════════════════
function renderNotasSaidaPage(){
  var pg=document.getElementById('page-notassaida');if(!pg)return;var items=appData.notasSaida||[];
  var total=items.reduce(function(s,n){return s+(n.valor||0);},0);
  pg.innerHTML='<div class="page-header"><h2>📤 Notas Saída</h2><button class="btn btn-primary" onclick="openNotaSaidaModal()">+ Nova Nota</button></div><div class="dashboard-grid"><div class="card card-accent"><div class="card-header"><span>Total</span></div><div class="card-value">'+formatCurrency(total)+'</div><div class="card-sub">'+items.length+' nota(s)</div></div></div><div class="filter-bar"><input type="text" class="form-control" style="max-width:250px" placeholder="Buscar..." oninput="filterNotasSaida(this.value)"></div><div class="table-responsive"><table class="table"><thead><tr><th>Nº Nota</th><th>Cliente</th><th>Valor</th><th>Data</th><th>Ações</th></tr></thead><tbody id="notasSaidaBody"></tbody></table></div>';
  renderNotasSaidaTable(items);
}
function renderNotasSaidaTable(items){var tbody=document.getElementById('notasSaidaBody');if(!tbody)return;if(items.length===0){tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhuma nota</td></tr>';return;}tbody.innerHTML=items.map(function(n){return'<tr><td>'+(n.numero||'-')+'</td><td>'+(n.cliente||'-')+'</td><td>'+formatCurrency(n.valor)+'</td><td>'+formatDate(n.data)+'</td><td><button class="btn btn-sm btn-primary" onclick="editNotaSaida('+n.id+')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaSaida('+n.id+')">🗑️</button></td></tr>';}).join('');}
function filterNotasSaida(q){q=q.toLowerCase();renderNotasSaidaTable((appData.notasSaida||[]).filter(function(n){return(n.numero||'').toLowerCase().includes(q)||(n.cliente||'').toLowerCase().includes(q);}));}
function openNotaSaidaModal(nota){
  var isEdit=!!nota;var cliOpts=(appData.clientes||[]).map(function(c){return'<option value="'+c.nome+'"'+(nota&&nota.cliente===c.nome?' selected':'')+'>'+c.nome+'</option>';}).join('');
  document.getElementById('cadastroModalTitle').textContent=isEdit?'Editar Nota':'Nova Nota Saída';
  document.getElementById('cadastroModalBody').innerHTML='<div class="form-row"><div class="form-group"><label>Nº Nota</label><input type="text" class="form-control" id="nsNum" value="'+(nota?nota.numero:'')+'"></div><div class="form-group"><label>Data</label><input type="date" class="form-control" id="nsData" value="'+(nota?nota.data:todayStr())+'"></div></div><div class="form-group"><label>Cliente</label><select class="form-control" id="nsCli"><option value="">Selecione...</option>'+cliOpts+'</select></div><div class="form-group"><label>Valor</label><input type="number" class="form-control" id="nsValor" value="'+(nota?nota.valor:'')+'" step="0.01"></div><div class="form-group"><label>Obs</label><textarea class="form-control" id="nsObs" rows="2">'+(nota?nota.obs||'':'')+'</textarea></div>';
  document.getElementById('cadastroModalFooter').innerHTML='<button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button><button class="btn btn-primary" onclick="saveNotaSaida('+(isEdit?nota.id:'null')+')">Salvar</button>';
  openCadastroModal();
}
function saveNotaSaida(id){
  var obj={numero:document.getElementById('nsNum').value.trim(),data:document.getElementById('nsData').value,cliente:document.getElementById('nsCli').value,valor:parseFloat(document.getElementById('nsValor').value)||0,obs:document.getElementById('nsObs').value};
  if(!appData.notasSaida) appData.notasSaida=[];
  if(id){var idx=appData.notasSaida.findIndex(function(n){return n.id===id;});if(idx>-1){obj.id=id;appData.notasSaida[idx]=obj;}}
  else{obj.id=nextId(appData.notasSaida);appData.notasSaida.push(obj);}
  saveData();closeCadastroModal();renderNotasSaidaPage();showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editNotaSaida(id){var n=(appData.notasSaida||[]).find(function(x){return x.id===id;});if(n)openNotaSaidaModal(n);}
function deleteNotaSaida(id){if(!confirm('Excluir nota?'))return;appData.notasSaida=(appData.notasSaida||[]).filter(function(n){return n.id!==id;});saveData();renderNotasSaidaPage();showToast('Excluído!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-RCM-01: RECEITAS MEI (SEM TABELA, SEM BUSCA, SÓ CARDS + RELATÓRIO MENSAL) ──
// ══════════════════════════════════════════════════════════════
var receitaMeiMesSel = new Date().getMonth();
var receitaMeiAnoSel = new Date().getFullYear();

function renderReceitasMeiPage(){
  var pg=document.getElementById('page-receitasmei');if(!pg)return;
  var vendas=appData.vendas||[];
  var mesesLabel=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var mesOpts=mesesLabel.map(function(m,i){return'<option value="'+i+'"'+(i===receitaMeiMesSel?' selected':'')+'>'+m+'</option>';}).join('');

  // Filtrar vendas do mês/ano selecionado
  var vendasMes=vendas.filter(function(v){
    if(!v.data) return false;
    var p=v.data.split('-');
    return parseInt(p[0])===receitaMeiAnoSel && parseInt(p[1])===(receitaMeiMesSel+1);
  });
  var comNotaMes=vendasMes.filter(function(v){return v.notaFiscal==='Com Nota';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var semNotaMes=vendasMes.filter(function(v){return v.notaFiscal!=='Com Nota';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var totalBrutasMes=comNotaMes+semNotaMes;

  // Total anual
  var vendasAno=vendas.filter(function(v){
    if(!v.data) return false;
    return parseInt(v.data.split('-')[0])===receitaMeiAnoSel;
  });
  var comNotaAno=vendasAno.filter(function(v){return v.notaFiscal==='Com Nota';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
  var semNotaAno=vendasAno.filter(function(v){return v.notaFiscal!=='Com Nota';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);

  // Relatório mensal das receitas brutas (formato MEI)
  var mesesReport='';
  for(var mi=0;mi<12;mi++){
    var vMes=vendas.filter(function(v){if(!v.data)return false;var pp=v.data.split('-');return parseInt(pp[0])===receitaMeiAnoSel&&parseInt(pp[1])===(mi+1);});
    var revCN=vMes.filter(function(v){return v.notaFiscal==='Com Nota';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
    var revSN=vMes.filter(function(v){return v.notaFiscal!=='Com Nota';}).reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
    mesesReport+='<tr><td style="padding:6px 10px;border:1px solid #ccc">'+mesesLabel[mi]+'</td><td style="padding:6px 10px;border:1px solid #ccc;text-align:right">'+formatCurrency(revCN)+'</td><td style="padding:6px 10px;border:1px solid #ccc;text-align:right">'+formatCurrency(revSN)+'</td><td style="padding:6px 10px;border:1px solid #ccc;text-align:right;font-weight:600">'+formatCurrency(revCN+revSN)+'</td></tr>';
  }
  mesesReport+='<tr style="background:#e8f5e9;font-weight:700"><td style="padding:8px 10px;border:1px solid #ccc">TOTAL</td><td style="padding:8px 10px;border:1px solid #ccc;text-align:right">'+formatCurrency(comNotaAno)+'</td><td style="padding:8px 10px;border:1px solid #ccc;text-align:right">'+formatCurrency(semNotaAno)+'</td><td style="padding:8px 10px;border:1px solid #ccc;text-align:right">'+formatCurrency(comNotaAno+semNotaAno)+'</td></tr>';

  var assinatura=appData.empresa&&appData.empresa.assinatura?'<div style="margin-top:24px;text-align:center"><img src="'+appData.empresa.assinatura+'" style="max-width:250px;max-height:100px"><br><hr style="width:250px;margin:4px auto"><span style="font-size:12px">'+(appData.empresa.empreendedor||'')+'</span></div>':'<div style="margin-top:24px;text-align:center"><br><hr style="width:250px;margin:4px auto"><span style="font-size:12px">'+(appData.empresa.empreendedor||'ASSINATURA')+'</span></div>';

  pg.innerHTML=
    '<div class="page-header"><h2>📋 Receitas MEI</h2></div>'+
    '<div class="filter-bar" style="margin-bottom:16px"><select class="form-control" style="max-width:180px" onchange="receitaMeiMesSel=parseInt(this.value);renderReceitasMeiPage()">'+mesOpts+'</select><select class="form-control" style="max-width:120px" onchange="receitaMeiAnoSel=parseInt(this.value);renderReceitasMeiPage()"><option value="2025"'+(receitaMeiAnoSel===2025?' selected':'')+'>2025</option><option value="2026"'+(receitaMeiAnoSel===2026?' selected':'')+'>2026</option><option value="2027"'+(receitaMeiAnoSel===2027?' selected':'')+'>2027</option></select></div>'+
    '<div class="dashboard-grid">'+
      '<div class="card" style="border-left:3px solid var(--success)"><div class="card-header"><span>Total Brutas do Mês</span></div><div class="card-value text-success">'+formatCurrency(totalBrutasMes)+'</div><div class="card-sub">'+mesesLabel[receitaMeiMesSel]+' '+receitaMeiAnoSel+'</div></div>'+
      '<div class="card" style="border-left:3px solid #dd6b20"><div class="card-header"><span>Total Sem Nota (Mês)</span></div><div class="card-value" style="color:#dd6b20">'+formatCurrency(semNotaMes)+'</div></div>'+
      '<div class="card" style="border-left:3px solid #3182ce"><div class="card-header"><span>Total Com Nota (Mês)</span></div><div class="card-value" style="color:#3182ce">'+formatCurrency(comNotaMes)+'</div></div>'+
      '<div class="card" style="border-left:3px solid #805ad5"><div class="card-header"><span>Total Anual Sem Nota</span></div><div class="card-value" style="color:#805ad5">'+formatCurrency(semNotaAno)+'</div><div class="card-sub">'+receitaMeiAnoSel+'</div></div>'+
      '<div class="card" style="border-left:3px solid #2b6cb0"><div class="card-header"><span>Total Anual Com Nota</span></div><div class="card-value" style="color:#2b6cb0">'+formatCurrency(comNotaAno)+'</div><div class="card-sub">'+receitaMeiAnoSel+'</div></div>'+
    '</div>'+
    '<div style="margin-top:24px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0">RELATÓRIO MENSAL DAS RECEITAS BRUTAS — '+receitaMeiAnoSel+'</h3><button class="btn btn-primary" onclick="imprimirReceitaMei()">🖨️ Imprimir</button></div>'+
    '<div id="receitaMeiPrint" style="background:#fff;color:#000;padding:24px;border-radius:8px;border:1px solid #ccc">'+
      '<div style="text-align:center;margin-bottom:16px"><strong style="font-size:16px">RELATÓRIO MENSAL DAS RECEITAS BRUTAS</strong><br><span style="font-size:13px">CNPJ: '+(appData.empresa.cnpj||'')+'</span><br><span style="font-size:13px">Empreendedor(a): '+(appData.empresa.empreendedor||'')+'</span><br><span style="font-size:13px">Período de Apuração: '+receitaMeiAnoSel+'</span></div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#1a365d;color:#fff"><th style="padding:8px 10px;border:1px solid #ccc;text-align:left">Mês</th><th style="padding:8px 10px;border:1px solid #ccc;text-align:right">Receita Com Nota</th><th style="padding:8px 10px;border:1px solid #ccc;text-align:right">Receita Sem Nota</th><th style="padding:8px 10px;border:1px solid #ccc;text-align:right">Total</th></tr></thead><tbody>'+mesesReport+'</tbody></table>'+
      assinatura+
      '<div style="text-align:center;margin-top:12px;font-size:11px;color:#666">'+(appData.empresa.cidade||'Franca, SP')+' — Impresso em '+new Date().toLocaleDateString('pt-BR')+'</div>'+
    '</div></div>';
}

function imprimirReceitaMei(){
  var el=document.getElementById('receitaMeiPrint');if(!el)return;
  var w=window.open('','','width=800,height=600');
  w.document.write('<html><head><title>Receitas MEI</title><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{padding:6px 10px;border:1px solid #ccc}@media print{body{margin:0}}</style></head><body>'+el.innerHTML+'</body></html>');
  w.document.close();w.focus();setTimeout(function(){w.print();w.close();},300);
}

// ══════════════════════════════════════════════════════════════
// ── SCR-REL-01: RELATÓRIOS ──
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
// ── SCR-CFG-02: CONFIGURAÇÕES (COM UPLOAD ASSINATURA) ──
// ══════════════════════════════════════════════════════════════
function renderConfiguracoesPage(){
  var pg=document.getElementById('page-configuracoes');if(!pg)return;
  var emp=appData.empresa||{};
  pg.innerHTML=
    '<div class="page-header"><h2>⚙️ Configurações</h2></div>'+
    '<div class="card" style="max-width:700px;margin-bottom:16px"><div class="card-header"><span>Dados da Empresa</span></div><div style="padding:16px">'+
      '<div class="form-group"><label>Nome da Empresa</label><input type="text" class="form-control" id="cfgNome" value="'+(emp.nome||'')+'"></div>'+
      '<div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="'+(emp.cnpj||'')+'"></div>'+
      '<div class="form-group"><label>Empreendedor</label><input type="text" class="form-control" id="cfgEmpreendedor" value="'+(emp.empreendedor||'')+'"></div>'+
      '<div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="cfgCidade" value="'+(emp.cidade||'')+'"></div>'+
      '<div class="form-group"><label>Logo da Empresa</label><div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center"><input type="file" id="cfgLogoFile" accept="image/jpeg,image/png,image/webp" style="display:none"><button type="button" class="btn btn-outline" onclick="document.getElementById(\'cfgLogoFile\').click()">📁 Carregar Logo</button></div><div id="cfgLogoPreview" style="margin-top:10px;text-align:center">'+(emp.logo?'<img src="'+emp.logo+'" style="max-width:200px;max-height:100px;border-radius:8px;object-fit:cover">':'')+'</div></div>'+
      '<div class="form-group"><label>Assinatura (PNG sem fundo)</label><div style="background:var(--bg-tertiary);border:2px dashed var(--border-color);border-radius:8px;padding:16px;text-align:center"><input type="file" id="cfgAssFile" accept="image/png" style="display:none"><button type="button" class="btn btn-outline" onclick="document.getElementById(\'cfgAssFile\').click()">📁 Carregar Assinatura</button><p style="font-size:.75rem;color:var(--text-muted);margin:4px 0 0 0">Envie um PNG sem fundo — aparecerá no Relatório de Receitas MEI</p></div><div id="cfgAssPreview" style="margin-top:10px;text-align:center">'+(emp.assinatura?'<img src="'+emp.assinatura+'" style="max-width:250px;max-height:100px;border-radius:8px"><br><button type="button" class="btn btn-sm btn-danger" style="margin-top:6px" onclick="appData.empresa.assinatura=\'\';saveData();renderConfiguracoesPage();showToast(\'Assinatura removida\',\'success\')">🗑️ Remover</button>':'')+'</div></div>'+
      '<button class="btn btn-primary" onclick="saveConfiguracoes()" style="margin-top:12px">💾 Salvar Configurações</button>'+
    '</div></div>'+
    '<div class="card" style="max-width:700px"><div class="card-header"><span>Vendedores</span></div><div style="padding:16px"><div id="cfgVendedoresList"></div><div style="display:flex;gap:8px;margin-top:8px"><input type="text" class="form-control" id="cfgNovoVend" placeholder="Nome do vendedor"><button class="btn btn-primary" onclick="addVendedor()">+ Adicionar</button></div></div></div>';
  renderVendedoresList();
  setTimeout(function(){
    handleImageUpload('cfgLogoFile','cfgLogoPreview');
    handleImageUpload('cfgAssFile','cfgAssPreview');
    applyAllMasks();
  },50);
}
function saveConfiguracoes(){
  appData.empresa.nome=document.getElementById('cfgNome').value.trim();
  appData.empresa.cnpj=document.getElementById('cfgCnpj').value.trim();
  appData.empresa.empreendedor=document.getElementById('cfgEmpreendedor').value.trim();
  appData.empresa.cidade=document.getElementById('cfgCidade').value.trim();
  var logoInput=document.getElementById('cfgLogoFile');
  var logoB64=logoInput?logoInput.getAttribute('data-base64')||'':'';
  if(logoB64) appData.empresa.logo=logoB64;
  var assInput=document.getElementById('cfgAssFile');
  var assB64=assInput?assInput.getAttribute('data-base64')||'':'';
  if(assB64) appData.empresa.assinatura=assB64;
  saveData();updateSidebarInfo();showToast('Configurações salvas!','success');
}
function renderVendedoresList(){
  var el=document.getElementById('cfgVendedoresList');if(!el)return;
  el.innerHTML=(appData.vendedores||[]).map(function(v,i){return'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="flex:1;padding:6px 10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)">'+v+'</span><button class="btn btn-sm btn-danger" onclick="removeVendedor('+i+')">🗑️</button></div>';}).join('');
}
function addVendedor(){
  var input=document.getElementById('cfgNovoVend');var nome=input.value.trim();
  if(!nome){showToast('Informe o nome','error');return;}
  if(!appData.vendedores) appData.vendedores=[];
  appData.vendedores.push(nome);input.value='';saveData();renderVendedoresList();showToast('Vendedor adicionado!','success');
}
function removeVendedor(i){if(!confirm('Remover vendedor?'))return;appData.vendedores.splice(i,1);saveData();renderVendedoresList();showToast('Removido!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-BKP-01: BACKUP ──
// ══════════════════════════════════════════════════════════════
function renderBackupPage(){
  var pg=document.getElementById('page-backup');if(!pg)return;
  pg.innerHTML=
    '<div class="page-header"><h2>💾 Backup</h2></div>'+
    '<div class="dashboard-grid">'+
      '<div class="card" style="text-align:center;padding:30px"><h3 style="margin:0 0 12px 0">📥 Exportar Dados</h3><p style="color:var(--text-muted);margin-bottom:16px">Baixe todos os dados do sistema em um arquivo JSON.</p><button class="btn btn-primary" onclick="exportarBackup()">📥 Exportar JSON</button></div>'+
      '<div class="card" style="text-align:center;padding:30px"><h3 style="margin:0 0 12px 0">📤 Importar Dados</h3><p style="color:var(--text-muted);margin-bottom:16px">Restaure dados de um backup JSON.</p><input type="file" id="importFile" accept=".json" style="display:none" onchange="importarBackup(event)"><button class="btn btn-outline" onclick="document.getElementById(\'importFile\').click()">📤 Importar JSON</button></div>'+
      '<div class="card" style="text-align:center;padding:30px"><h3 style="margin:0 0 12px 0;color:var(--danger)">🗑️ Limpar Dados</h3><p style="color:var(--text-muted);margin-bottom:16px">Remove TODOS os dados do sistema.</p><button class="btn btn-danger" onclick="limparDados()">🗑️ Limpar Tudo</button></div>'+
    '</div>';
}
function exportarBackup(){
  var blob=new Blob([JSON.stringify(appData,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='wdmaquinas_backup_'+todayStr()+'.json';a.click();URL.revokeObjectURL(url);showToast('Backup exportado!','success');
}
function importarBackup(event){
  var file=event.target.files[0];if(!file)return;
  var reader=new FileReader();reader.onload=function(e){
    try{var data=JSON.parse(e.target.result);appData=data;ensureDefaults();saveData();updateSidebarInfo();navigateTo('dashboard');showToast('Dados importados com sucesso!','success');}
    catch(err){showToast('Arquivo inválido!','error');}
  };reader.readAsText(file);
}
function limparDados(){if(!confirm('ATENÇÃO: Isso apagará TODOS os dados. Deseja continuar?'))return;if(!confirm('Tem certeza? Esta ação é irreversível!'))return;appData=getDefaultData();saveData();updateSidebarInfo();navigateTo('dashboard');showToast('Dados limpos!','success');}

// ══════════════════════════════════════════════════════════════
// ── SCR-INIT-01: INICIALIZAÇÃO ──
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async function(){
  if(typeof supabase!=='undefined' && supabase.createClient){
    supabaseClient=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  }
  await loadData();
  updateSidebarInfo();
  navigateTo('dashboard');
});
