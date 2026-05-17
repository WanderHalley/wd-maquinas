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
    '<div class="form-row"><div class="form-group"><label>Tipo</label><select class="form-control" id="flxTipo" onchange="updateFlxCatOptions()"><option value="entrada"'+(tipoVal==='entrada'?' selected':'')+'>Entrada</option><option value="saida"'+(tipoVal==='saida'?' selected':'')+'>Saída</option></select></div><div class="form-group"><label>Categoria</label><select class="form-control" id="flxCat"></select></div></div>'+
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
  if(!obj.descricao){showToast('Informe a descrição','error');return;}if(!obj.valor){showToast('Informe o valor','error');return;}
  if(!appData.fluxoCaixa) appData.fluxoCaixa={};if(!appData.fluxoCaixa[mesKey]) appData.fluxoCaixa[mesKey]=[];
  if(id){var idx=appData.fluxoCaixa[mesKey].findIndex(function(l){return l.id===id;});if(idx>-1){obj.id=id;appData.fluxoCaixa[mesKey][idx]=obj;}}
  else{obj.id=nextId(appData.fluxoCaixa[mesKey]);appData.fluxoCaixa[mesKey].push(obj);}
  saveData();closeCadastroModal();renderFluxoMes(mesIdx);showToast(id?'Atualizado!':'Cadastrado!','success');
}
function editLancamento(mesIdx,id){var mesKey=mesesKeys[mesIdx];var lanc=(appData.fluxoCaixa[mesKey]||[]).find(function(l){return l.id===id;});if(lanc)openLancamentoModal(mesIdx,lanc);}
function deleteLancamento(mesIdx,id){if(!confirm('Excluir lançamento?'))return;var mesKey=mesesKeys[mesIdx];appData.fluxoCaixa[mesKey]=(appData.fluxoCaixa[mesKey]||[]).filter(function(l){return l.id!==id;});saveData();renderFluxoMes(mesIdx);showToast('Excluído!','success');}

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

// ══════════════════════════════════════════════════════════════
// ── RECEITAS MEI — FORMATO OFICIAL ──
// ══════════════════════════════════════════════════════════════
function renderReceitasMeiPage(){
  var pg=document.getElementById('page-receitasmei');if(!pg)return;
  var ano=new Date().getFullYear();
  var mesAtual=new Date().getMonth();
  var mNomes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var mesOpts='<option value="todos">Todos (Resumo Anual)</option>';
  mNomes.forEach(function(n,i){mesOpts+='<option value="'+i+'"'+(i===mesAtual?' selected':'')+'>'+n+'</option>';});
  var vendas=appData.vendas||[];var notas=appData.notasSaida||[];
  function getVM(m){return vendas.filter(function(v){if(!v.data)return false;var d=new Date(v.data+'T00:00:00');return d.getMonth()===m&&d.getFullYear()===ano;});}
  function tB(arr){return arr.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);}
  function getNM(m){return notas.filter(function(n){if(!n.data)return false;var d=new Date(n.data+'T00:00:00');return d.getMonth()===m&&d.getFullYear()===ano;});}
  function tN(arr){return arr.reduce(function(s,n){return s+(n.valor||0);},0);}
  var mBruto=tB(getVM(mesAtual));var mCN=tN(getNM(mesAtual));var mSN=mBruto-mCN;
  var aBruto=0;var aCN=0;for(var i=0;i<12;i++){aBruto+=tB(getVM(i));aCN+=tN(getNM(i));}var aSN=aBruto-aCN;
  pg.innerHTML=
    '<div class="page-header"><h2>📄 Receitas MEI</h2><div style="display:flex;gap:8px;align-items:center"><select class="form-control" id="meiMesSelect" style="min-width:180px" onchange="onMeiMesChange()">'+mesOpts+'</select><button class="btn btn-primary" onclick="imprimirReceitaMei()">🖨️ Imprimir</button></div></div>'+
    '<div class="dashboard-grid"><div class="card"><div class="card-header"><span>💵 Sem Nota (Mês)</span></div><div class="card-value" id="meiSemNotaMes">'+formatCurrency(mSN)+'</div></div><div class="card"><div class="card-header"><span>📄 Com Nota (Mês)</span></div><div class="card-value" id="meiComNotaMes">'+formatCurrency(mCN)+'</div></div><div class="card"><div class="card-header"><span>💵 Sem Nota (Anual)</span></div><div class="card-value" id="meiSemNotaAnual">'+formatCurrency(aSN)+'</div></div><div class="card"><div class="card-header"><span>📄 Com Nota (Anual)</span></div><div class="card-value" id="meiComNotaAnual">'+formatCurrency(aCN)+'</div></div></div>'+
    '<div id="meiReportArea" style="margin-top:16px"></div>';
  onMeiMesChange();
}
function onMeiMesChange(){
  var sel=document.getElementById('meiMesSelect');if(!sel)return;var val=sel.value;
  var ano=new Date().getFullYear();var mNomes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var vendas=appData.vendas||[];var notas=appData.notasSaida||[];var empresa=appData.empresa||{};
  function getVM(m){return vendas.filter(function(v){if(!v.data)return false;var d=new Date(v.data+'T00:00:00');return d.getMonth()===m&&d.getFullYear()===ano;});}
  function tB(arr){return arr.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);}
  function getNM(m){return notas.filter(function(n){if(!n.data)return false;var d=new Date(n.data+'T00:00:00');return d.getMonth()===m&&d.getFullYear()===ano;});}
  function tN(arr){return arr.reduce(function(s,n){return s+(n.valor||0);},0);}
  function fc(v){return'R$ '+(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
  if(val!=='todos'){var mi=parseInt(val);var b=tB(getVM(mi));var cn=tN(getNM(mi));var sn=b-cn;var e1=document.getElementById('meiSemNotaMes');if(e1)e1.textContent=fc(sn);var e2=document.getElementById('meiComNotaMes');if(e2)e2.textContent=fc(cn);}
  var area=document.getElementById('meiReportArea');if(!area)return;
  if(val==='todos'){
    // Resumo Anual
    var rows='';var tAB=0;var tACN=0;var tASN=0;
    for(var i=0;i<12;i++){var b2=tB(getVM(i));var cn2=tN(getNM(i));var sn2=b2-cn2;tAB+=b2;tACN+=cn2;tASN+=sn2;rows+='<tr><td>'+mNomes[i]+'</td><td style="text-align:right">'+fc(sn2)+'</td><td style="text-align:right">'+fc(cn2)+'</td><td style="text-align:right;font-weight:600">'+fc(b2)+'</td></tr>';}
    rows+='<tr style="background:#f0f0f0;font-weight:700"><td>TOTAL ANUAL</td><td style="text-align:right">'+fc(tASN)+'</td><td style="text-align:right">'+fc(tACN)+'</td><td style="text-align:right">'+fc(tAB)+'</td></tr>';
    var lim=81000;var pct=tAB>0?((tAB/lim)*100).toFixed(1):'0.0';var rest=lim-tAB;var stLim=tAB>lim?'<span style="color:#e53e3e;font-weight:700">ULTRAPASSOU O LIMITE!</span>':'<span style="color:#38a169;font-weight:600">Dentro do limite</span>';
    area.innerHTML='<div class="card" style="padding:20px"><h3 style="margin-bottom:16px;color:var(--primary)">📊 Resumo Anual '+ano+'</h3><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Mês</th><th style="text-align:right">Sem Nota</th><th style="text-align:right">Com Nota</th><th style="text-align:right">Total Bruto</th></tr></thead><tbody>'+rows+'</tbody></table></div><div style="margin-top:20px;padding:16px;background:#f8f9fa;border-radius:8px;border:1px solid #dee2e6"><h4 style="margin-bottom:12px">📋 Controle do Limite MEI</h4><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px"><div><strong>Limite Anual:</strong><br>'+fc(lim)+'</div><div><strong>Receita Bruta:</strong><br>'+fc(tAB)+'</div><div><strong>Restante:</strong><br>'+fc(rest>0?rest:0)+'</div></div><div style="margin-top:8px"><strong>Utilizado:</strong> '+pct+'% — '+stLim+'</div></div><div style="margin-top:20px;padding:16px;background:#edf2f7;border-radius:8px;border:2px solid #4299e1"><h4 style="margin-bottom:12px;color:#2b6cb0">📝 DASN-SIMEI (Declaração Anual)</h4><table style="width:100%;font-size:14px"><tr style="border-bottom:1px solid #cbd5e0"><td style="padding:8px;font-weight:600">Receita Bruta Total '+ano+':</td><td style="padding:8px;text-align:right;font-weight:700;color:#2b6cb0">'+fc(tAB)+'</td></tr><tr style="border-bottom:1px solid #cbd5e0"><td style="padding:8px;font-weight:600">Receita Comércio/Indústria:</td><td style="padding:8px;text-align:right;font-weight:700">'+fc(tAB)+'</td></tr><tr style="border-bottom:1px solid #cbd5e0"><td style="padding:8px;font-weight:600">Receita Serviços:</td><td style="padding:8px;text-align:right;font-weight:700">'+fc(0)+'</td></tr><tr><td style="padding:8px;font-weight:600">Empregado:</td><td style="padding:8px;text-align:right;font-weight:700">Não</td></tr></table></div><div style="margin-top:20px;padding:16px;background:#fefcbf;border-radius:8px;border:2px solid #d69e2e"><h4 style="margin-bottom:12px;color:#975a16">🏛️ IRPF — Rendimentos Isentos</h4><table style="width:100%;font-size:14px"><tr style="border-bottom:1px solid #d69e2e"><td style="padding:8px;font-weight:600">Receita Bruta Anual:</td><td style="padding:8px;text-align:right;font-weight:700">'+fc(tAB)+'</td></tr><tr style="border-bottom:1px solid #d69e2e"><td style="padding:8px;font-weight:600">Parcela Isenta (8% Comércio):</td><td style="padding:8px;text-align:right;font-weight:700;color:#38a169">'+fc(tAB*0.08)+'</td></tr><tr><td style="padding:8px;font-weight:600">Parcela Isenta (32% Serviços):</td><td style="padding:8px;text-align:right;font-weight:700;color:#38a169">'+fc(0)+'</td></tr></table><p style="margin-top:8px;font-size:12px;color:#975a16"><strong>Nota:</strong> 8% comércio é isento. Restante menos despesas é tributável. Consulte seu contador.</p></div></div>';
  } else {
    // Relatório mensal formato oficial
    var mi=parseInt(val);var vMes=getVM(mi);var brutoMes=tB(vMes);var comNotaMes=tN(getNM(mi));var semNotaMes=brutoMes-comNotaMes;
    var cnpjNum=empresa.cnpj?empresa.cnpj.replace(/\D/g,''):'';
    var mesNome=mNomes[mi].toUpperCase();
    var bd='border:1px solid #333;padding:6px 10px;';
    area.innerHTML=
      '<div class="card" style="padding:20px;font-family:Arial,sans-serif;font-size:13px;color:#000">'+
        '<table style="width:100%;border-collapse:collapse;border:2px solid #333"><tbody>'+
          '<tr><td colspan="2" style="'+bd+'text-align:center;font-weight:bold;font-size:14px;background:#e8e8e8">RELATÓRIO MENSAL DAS RECEITAS BRUTAS</td></tr>'+
          '<tr><td style="'+bd+'width:30%">CNPJ:</td><td style="'+bd+'">'+(empresa.cnpj||'')+'</td></tr>'+
          '<tr><td style="'+bd+'">Empreendedor individual:</td><td style="'+bd+'">'+cnpjNum+' '+(empresa.empreendedor||'')+'</td></tr>'+
          '<tr><td style="'+bd+'">Período de apuração:</td><td style="'+bd+'">'+mesNome+' DE '+ano+'</td></tr>'+
          '<tr><td colspan="2" style="'+bd+'font-weight:bold;background:#e8e8e8">RECEITA BRUTA MENSAL – REVENDA DE MERCADORIAS (COMÉRCIO)</td></tr>'+
          '<tr><td style="'+bd+'">I – Revenda de mercadorias com dispensa de emissão de documento fiscal</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(semNotaMes)+'</td></tr>'+
          '<tr><td style="'+bd+'">II – Revenda de mercadorias com documento fiscal emitido</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(comNotaMes)+'</td></tr>'+
          '<tr><td style="'+bd+'">III – Total das receitas com revenda de mercadorias (I + II)</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(brutoMes)+'</td></tr>'+
          '<tr><td colspan="2" style="'+bd+'font-weight:bold;background:#e8e8e8">RECEITA BRUTA MENSAL – VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)</td></tr>'+
          '<tr><td style="'+bd+'">IV – Venda de produtos industrializados com dispensa de emissão de documento fiscal</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(0)+'</td></tr>'+
          '<tr><td style="'+bd+'">V – Venda de produtos industrializados com documento fiscal emitido</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(0)+'</td></tr>'+
          '<tr><td style="'+bd+'">VI – Total das receitas com venda de produtos industrializados (IV + V)</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(0)+'</td></tr>'+
          '<tr><td colspan="2" style="'+bd+'font-weight:bold;background:#e8e8e8">RECEITA BRUTA MENSAL – PRESTAÇÃO DE SERVIÇOS</td></tr>'+
          '<tr><td style="'+bd+'">VII – Receita com prestação de serviços com dispensa de emissão de documento fiscal</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(0)+'</td></tr>'+
          '<tr><td style="'+bd+'">VIII – Receita com prestação de serviços com documento fiscal emitido</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(0)+'</td></tr>'+
          '<tr><td style="'+bd+'">IX – Total das receitas com prestação de serviços (VII + VIII)</td><td style="'+bd+'text-align:right;font-weight:600">'+fc(0)+'</td></tr>'+
          '<tr><td style="'+bd+'font-weight:bold">X - Total geral das receitas brutas no mês (III + VI + IX)</td><td style="'+bd+'text-align:right;font-weight:bold;font-size:16px">'+fc(brutoMes)+'</td></tr>'+
          '<tr><td style="'+bd+'">LOCAL E DATA:<br><br>'+(empresa.cidade||'')+' - 01 de '+mNomes[mi]+' de '+ano+'</td><td style="'+bd+'">ASSINATURA DO EMPRESÁRIO:<br><br>'+(empresa.assinatura?'<img src="'+empresa.assinatura+'" style="max-height:40px">':empresa.empreendedor||'')+'</td></tr>'+
          '<tr><td colspan="2" style="'+bd+'font-size:10px">ENCONTRAM-SE ANEXADOS E ESTE RELATÓRIO:<br>- Os documentos fiscais comprobatórios das entradas de mercadorias e serviços tomados referentes ao período;<br>- As notas fiscais relativas às operações ou prestações realizadas eventualmente emitidas.</td></tr>'+
        '</tbody></table>'+
      '</div>';
  }
}
function imprimirReceitaMei(){
  var sel=document.getElementById('meiMesSelect');var val=sel?sel.value:'0';
  var ano=new Date().getFullYear();var mNomes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var vendas=appData.vendas||[];var notas=appData.notasSaida||[];var empresa=appData.empresa||{};
  function getVM(m){return vendas.filter(function(v){if(!v.data)return false;var d=new Date(v.data+'T00:00:00');return d.getMonth()===m&&d.getFullYear()===ano;});}
  function tB(arr){return arr.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);}
  function getNM(m){return notas.filter(function(n){if(!n.data)return false;var d=new Date(n.data+'T00:00:00');return d.getMonth()===m&&d.getFullYear()===ano;});}
  function tN(arr){return arr.reduce(function(s,n){return s+(n.valor||0);},0);}
  function fc(v){return'R$ '+(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
  var cnpjNum=empresa.cnpj?empresa.cnpj.replace(/\D/g,''):'';
  var conteudo='';var bd='border:1px solid #333;padding:4px 8px;';
  if(val==='todos'){
    var rows='';var tAB=0;var tACN=0;
    for(var i=0;i<12;i++){var b=tB(getVM(i));var cn=tN(getNM(i));var sn=b-cn;tAB+=b;tACN+=cn;rows+='<tr><td style="'+bd+'">'+mNomes[i]+'</td><td style="'+bd+'text-align:right">'+fc(sn)+'</td><td style="'+bd+'text-align:right">'+fc(cn)+'</td><td style="'+bd+'text-align:right;font-weight:bold">'+fc(b)+'</td></tr>';}
    rows+='<tr style="background:#ddd;font-weight:bold"><td style="'+bd+'">TOTAL</td><td style="'+bd+'text-align:right">'+fc(tAB-tACN)+'</td><td style="'+bd+'text-align:right">'+fc(tACN)+'</td><td style="'+bd+'text-align:right">'+fc(tAB)+'</td></tr>';
    conteudo='<h2 style="text-align:center;font-size:14px;margin-bottom:4px">RELATÓRIO ANUAL DE RECEITAS BRUTAS — MEI</h2><p style="text-align:center;font-size:10px;margin:0 0 8px">'+empresa.nome+' — CNPJ: '+empresa.cnpj+' — '+empresa.empreendedor+'<br>Ano-calendário: '+ano+'</p><table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr style="background:#ccc"><th style="'+bd+'text-align:left">Mês</th><th style="'+bd+'text-align:right">Sem Nota</th><th style="'+bd+'text-align:right">Com Nota</th><th style="'+bd+'text-align:right">Total Bruto</th></tr></thead><tbody>'+rows+'</tbody></table><div style="margin-top:10px;padding:6px;border:1px solid #333;font-size:10px"><strong>DASN-SIMEI:</strong> Receita Bruta Total: '+fc(tAB)+' | Comércio: '+fc(tAB)+' | Serviços: '+fc(0)+' | Empregado: Não</div><div style="margin-top:6px;padding:6px;border:1px solid #333;font-size:10px"><strong>IRPF:</strong> Parcela Isenta (8% Comércio): '+fc(tAB*0.08)+'</div><div style="margin-top:10px;text-align:center;font-size:10px">'+(empresa.cidade||'')+', ___/___/'+ano+'<br><br><br>___________________________________________<br>'+empresa.empreendedor+'</div>';
  } else {
    var mi=parseInt(val);var brutoMes=tB(getVM(mi));var comNotaMes=tN(getNM(mi));var semNotaMes=brutoMes-comNotaMes;var mesNome=mNomes[mi].toUpperCase();
    conteudo=
      '<table style="width:100%;border-collapse:collapse;font-size:11px;border:2px solid #333"><tbody>'+
        '<tr><td colspan="2" style="'+bd+'text-align:center;font-weight:bold;font-size:12px;background:#ddd">RELATÓRIO MENSAL DAS RECEITAS BRUTAS</td></tr>'+
        '<tr><td style="'+bd+'width:55%">CNPJ:</td><td style="'+bd+'">'+(empresa.cnpj||'')+'</td></tr>'+
        '<tr><td style="'+bd+'">Empreendedor individual:</td><td style="'+bd+'">'+cnpjNum+' '+(empresa.empreendedor||'')+'</td></tr>'+
        '<tr><td style="'+bd+'">Período de apuração:</td><td style="'+bd+'">'+mesNome+' DE '+ano+'</td></tr>'+
        '<tr><td colspan="2" style="'+bd+'font-weight:bold;background:#ddd">RECEITA BRUTA MENSAL – REVENDA DE MERCADORIAS (COMÉRCIO)</td></tr>'+
        '<tr><td style="'+bd+'">I – Revenda de mercadorias com dispensa de emissão de documento fiscal</td><td style="'+bd+'text-align:right">'+fc(semNotaMes)+'</td></tr>'+
        '<tr><td style="'+bd+'">II – Revenda de mercadorias com documento fiscal emitido</td><td style="'+bd+'text-align:right">'+fc(comNotaMes)+'</td></tr>'+
        '<tr><td style="'+bd+'">III – Total das receitas com revenda de mercadorias (I + II)</td><td style="'+bd+'text-align:right">'+fc(brutoMes)+'</td></tr>'+
        '<tr><td colspan="2" style="'+bd+'font-weight:bold;background:#ddd">RECEITA BRUTA MENSAL – VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)</td></tr>'+
        '<tr><td style="'+bd+'">IV – Venda de produtos industrializados com dispensa de emissão de documento fiscal</td><td style="'+bd+'text-align:right">'+fc(0)+'</td></tr>'+
        '<tr><td style="'+bd+'">V – Venda de produtos industrializados com documento fiscal emitido</td><td style="'+bd+'text-align:right">'+fc(0)+'</td></tr>'+
        '<tr><td style="'+bd+'">VI – Total das receitas com venda de produtos industrializados (IV + V)</td><td style="'+bd+'text-align:right">'+fc(0)+'</td></tr>'+
        '<tr><td colspan="2" style="'+bd+'font-weight:bold;background:#ddd">RECEITA BRUTA MENSAL – PRESTAÇÃO DE SERVIÇOS</td></tr>'+
        '<tr><td style="'+bd+'">VII – Receita com prestação de serviços com dispensa de emissão de documento fiscal</td><td style="'+bd+'text-align:right">'+fc(0)+'</td></tr>'+
        '<tr><td style="'+bd+'">VIII – Receita com prestação de serviços com documento fiscal emitido</td><td style="'+bd+'text-align:right">'+fc(0)+'</td></tr>'+
        '<tr><td style="'+bd+'">IX – Total das receitas com prestação de serviços (VII + VIII)</td><td style="'+bd+'text-align:right">'+fc(0)+'</td></tr>'+
        '<tr><td style="'+bd+'font-weight:bold">X - Total geral das receitas brutas no mês (III + VI + IX)</td><td style="'+bd+'text-align:right;font-weight:bold;font-size:14px">'+fc(brutoMes)+'</td></tr>'+
        '<tr><td style="'+bd+'">LOCAL E DATA:<br>'+(empresa.cidade||'')+' - 01 de '+mNomes[mi]+' de '+ano+'</td><td style="'+bd+'">ASSINATURA DO EMPRESÁRIO:<br>'+(empresa.assinatura?'<img src="'+empresa.assinatura+'" style="max-height:35px">':empresa.empreendedor||'')+'</td></tr>'+
        '<tr><td colspan="2" style="'+bd+'font-size:9px">ENCONTRAM-SE ANEXADOS E ESTE RELATÓRIO:<br>- Os documentos fiscais comprobatórios das entradas de mercadorias e serviços tomados referentes ao período;<br>- As notas fiscais relativas às operações ou prestações realizadas eventualmente emitidas.</td></tr>'+
      '</tbody></table>';
  }
  var w=window.open('','_blank','width=800,height=600');
  w.document.write('<!DOCTYPE html><html><head><title>Receitas MEI</title><style>@page{size:A4;margin:15mm 12mm}body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:10px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'+conteudo+'</body></html>');
  w.document.close();setTimeout(function(){w.print();},300);
}

// ══════════════════════════════════════════════════════════════
// ── RELATÓRIOS ──
// ══════════════════════════════════════════════════════════════
function renderRelatoriosPage(){
  var pg=document.getElementById('page-relatorios');if(!pg)return;
  var ano=new Date().getFullYear();
  var mNomes=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var mKeys=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var vendas=appData.vendas||[];var compras=appData.compras||[];var boletos=appData.boletos||[];var cheques=appData.cheques||[];var estoque=appData.estoque||[];

  // 1) Projeção de Lucro Mensal
  var projRows='';var totalProjLucro=0;
  mKeys.forEach(function(m,i){
    var vM=vendas.filter(function(v){if(!v.data)return false;var d=new Date(v.data+'T00:00:00');return d.getMonth()===i&&d.getFullYear()===ano;});
    var cM=compras.filter(function(c){if(!c.data)return false;var d=new Date(c.data+'T00:00:00');return d.getMonth()===i&&d.getFullYear()===ano;});
    var tV=vM.reduce(function(s,v){return s+((v.quantidade||1)*(v.valorUnit||0));},0);
    var tC=cM.reduce(function(s,c){return s+((c.quantidade||1)*(c.valorUnit||0));},0);
    var lucro=tV-tC;totalProjLucro+=lucro;
    projRows+='<tr><td>'+mNomes[i]+'</td><td class="text-success">'+formatCurrency(tV)+'</td><td class="text-danger">'+formatCurrency(tC)+'</td><td style="color:'+(lucro>=0?'#38a169':'#e53e3e')+';font-weight:600">'+formatCurrency(lucro)+'</td></tr>';
  });
  projRows+='<tr style="background:var(--bg-tertiary);font-weight:700"><td>TOTAL '+ano+'</td><td></td><td></td><td style="color:'+(totalProjLucro>=0?'#38a169':'#e53e3e')+'">'+formatCurrency(totalProjLucro)+'</td></tr>';

  // 2) Compras por Fornecedor
  var fornMap={};compras.forEach(function(c){var f=c.fornecedor||'Sem Fornecedor';if(!fornMap[f])fornMap[f]={total:0,qtd:0};fornMap[f].total+=((c.quantidade||1)*(c.valorUnit||0));fornMap[f].qtd++;});
  var fornRows='';Object.keys(fornMap).sort().forEach(function(f){fornRows+='<tr><td>'+f+'</td><td>'+fornMap[f].qtd+'</td><td>'+formatCurrency(fornMap[f].total)+'</td></tr>';});
  if(!fornRows) fornRows='<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Nenhuma compra</td></tr>';

  // 3) Vendas por Cliente
  var cliMap={};vendas.forEach(function(v){var c=v.cliente||'Sem Cliente';if(!cliMap[c])cliMap[c]={total:0,qtd:0};cliMap[c].total+=((v.quantidade||1)*(v.valorUnit||0));cliMap[c].qtd++;});
  var cliRows='';Object.keys(cliMap).sort().forEach(function(c){cliRows+='<tr><td>'+c+'</td><td>'+cliMap[c].qtd+'</td><td>'+formatCurrency(cliMap[c].total)+'</td></tr>';});
  if(!cliRows) cliRows='<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">Nenhuma venda</td></tr>';

  // 4) Fluxo Mensal
  var fluxoRows='';var totalEnt=0;var totalSai=0;
  mKeys.forEach(function(m,i){
    var lancs=(appData.fluxoCaixa&&appData.fluxoCaixa[m])?appData.fluxoCaixa[m]:[];
    var ent=lancs.filter(function(l){return l.tipo==='entrada';}).reduce(function(s,l){return s+(l.valor||0);},0);
    var sai=lancs.filter(function(l){return l.tipo==='saida';}).reduce(function(s,l){return s+(l.valor||0);},0);
    totalEnt+=ent;totalSai+=sai;var sal=ent-sai;
    fluxoRows+='<tr><td>'+mNomes[i]+'</td><td class="text-success">'+formatCurrency(ent)+'</td><td class="text-danger">'+formatCurrency(sai)+'</td><td style="color:'+(sal>=0?'#38a169':'#e53e3e')+';font-weight:600">'+formatCurrency(sal)+'</td></tr>';
  });
  fluxoRows+='<tr style="background:var(--bg-tertiary);font-weight:700"><td>TOTAL</td><td class="text-success">'+formatCurrency(totalEnt)+'</td><td class="text-danger">'+formatCurrency(totalSai)+'</td><td style="color:'+(totalEnt-totalSai>=0?'#38a169':'#e53e3e')+'">'+formatCurrency(totalEnt-totalSai)+'</td></tr>';

  // 5) Boletos pendentes
  var bolPend=boletos.filter(function(b){return b.situacao!=='Pago';});
  var bolRows='';bolPend.forEach(function(b){var dias=calcDiasRestantes(b.vencimento);bolRows+='<tr><td>'+b.descricao+'</td><td>'+formatCurrency(b.valor)+'</td><td>'+formatDate(b.vencimento)+'</td><td>'+formatDiasRestantes(dias,b.situacao)+'</td></tr>';});
  if(!bolRows) bolRows='<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum boleto pendente</td></tr>';

  // 6) Cheques pendentes
  var chPend=cheques.filter(function(ch){return ch.situacao!=='Compensado';});
  var chRows='';chPend.forEach(function(ch){var dias=calcDiasRestantes(ch.bomPara);chRows+='<tr><td>'+(ch.numero||'-')+'</td><td>'+(ch.emitente||'-')+'</td><td>'+formatCurrency(ch.valor)+'</td><td>'+formatDate(ch.bomPara)+'</td><td>'+formatDiasRestantes(dias,ch.situacao)+'</td></tr>';});
  if(!chRows) chRows='<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhum cheque pendente</td></tr>';

  // 7) Estoque valorizado
  var estTotal=estoque.reduce(function(s,e){return s+((e.quantidade||0)*(e.valorUnit||0));},0);
  var estRows='';estoque.forEach(function(e){estRows+='<tr><td>'+e.produto+'</td><td>'+(e.quantidade||0)+'</td><td>'+formatCurrency(e.valorUnit)+'</td><td>'+formatCurrency((e.quantidade||0)*(e.valorUnit||0))+'</td></tr>';});
  if(!estRows) estRows='<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Estoque vazio</td></tr>';

  pg.innerHTML=
    '<div class="page-header"><h2>📈 Relatórios</h2></div>'+
    '<div class="card" style="margin-bottom:16px;padding:16px"><h3 style="margin-bottom:12px">📊 Projeção de Lucro Mensal '+ano+'</h3><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Mês</th><th>Vendas</th><th>Compras</th><th>Lucro</th></tr></thead><tbody>'+projRows+'</tbody></table></div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'+
      '<div class="card" style="padding:16px"><h3 style="margin-bottom:12px">🛒 Compras por Fornecedor</h3><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Fornecedor</th><th>Qtd</th><th>Total</th></tr></thead><tbody>'+fornRows+'</tbody></table></div></div>'+
      '<div class="card" style="padding:16px"><h3 style="margin-bottom:12px">💰 Vendas por Cliente</h3><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Cliente</th><th>Qtd</th><th>Total</th></tr></thead><tbody>'+cliRows+'</tbody></table></div></div>'+
    '</div>'+
    '<div class="card" style="margin-bottom:16px;padding:16px"><h3 style="margin-bottom:12px">📅 Fluxo de Caixa Mensal '+ano+'</h3><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead><tbody>'+fluxoRows+'</tbody></table></div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'+
      '<div class="card" style="padding:16px"><h3 style="margin-bottom:12px">🔖 Boletos Pendentes</h3><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Dias</th></tr></thead><tbody>'+bolRows+'</tbody></table></div></div>'+
      '<div class="card" style="padding:16px"><h3 style="margin-bottom:12px">📝 Cheques Pendentes</h3><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Nº</th><th>Emitente</th><th>Valor</th><th>Bom Para</th><th>Dias</th></tr></thead><tbody>'+chRows+'</tbody></table></div></div>'+
    '</div>'+
    '<div class="card" style="padding:16px"><h3 style="margin-bottom:12px">📦 Estoque Valorizado (Total: '+formatCurrency(estTotal)+')</h3><div class="table-responsive"><table class="table" style="margin:0"><thead><tr><th>Produto</th><th>Qtd</th><th>V.Unit</th><th>Total</th></tr></thead><tbody>'+estRows+'</tbody></table></div></div>';
}

// ══════════════════════════════════════════════════════════════
// ── CONFIGURAÇÕES ──
// ══════════════════════════════════════════════════════════════
function renderConfiguracoesPage(){var pg=document.getElementById('page-configuracoes');if(!pg)return;var emp=appData.empresa||{};pg.innerHTML='<div class="page-header"><h2>⚙️ Configurações</h2></div><div class="card" style="padding:20px;max-width:700px"><h3 style="margin-bottom:16px">Dados da Empresa</h3><div class="form-group"><label>Nome da Empresa</label><input type="text" class="form-control" id="cfgNome" value="'+(emp.nome||'')+'"></div><div class="form-row"><div class="form-group"><label>CNPJ</label><input type="text" class="form-control" id="cfgCnpj" value="'+(emp.cnpj||'')+'"></div><div class="form-group"><label>Empreendedor</label><input type="text" class="form-control" id="cfgEmpreendedor" value="'+(emp.empreendedor||'')+'"></div></div><div class="form-group"><label>Cidade</label><input type="text" class="form-control" id="cfgCidade" value="'+(emp.cidade||'')+'"></div><div class="form-row"><div class="form-group"><label>Logo</label><input type="file" class="form-control" id="cfgLogoInput" accept="image/*"><div id="cfgLogoPreview">'+(emp.logo?'<img src="'+emp.logo+'" style="max-width:150px;max-height:80px;border-radius:4px;margin-top:6px">':'')+'</div></div><div class="form-group"><label>Assinatura</label><input type="file" class="form-control" id="cfgAssInput" accept="image/*"><div id="cfgAssPreview">'+(emp.assinatura?'<img src="'+emp.assinatura+'" style="max-width:150px;max-height:80px;border-radius:4px;margin-top:6px">':'')+'</div></div></div><button class="btn btn-primary" onclick="saveConfiguracoes()" style="margin-top:12px">Salvar Configurações</button></div>';setTimeout(function(){handleImageUpload('cfgLogoInput','cfgLogoPreview');handleImageUpload('cfgAssInput','cfgAssPreview');applyAllMasks();},50);}
function saveConfiguracoes(){appData.empresa.nome=document.getElementById('cfgNome').value.trim();appData.empresa.cnpj=document.getElementById('cfgCnpj').value;appData.empresa.empreendedor=document.getElementById('cfgEmpreendedor').value.trim();appData.empresa.cidade=document.getElementById('cfgCidade').value.trim();var logoEl=document.getElementById('cfgLogoInput');var logoB64=logoEl?logoEl.getAttribute('data-base64')||'':'';if(logoB64)appData.empresa.logo=logoB64;var assEl=document.getElementById('cfgAssInput');var assB64=assEl?assEl.getAttribute('data-base64')||'':'';if(assB64)appData.empresa.assinatura=assB64;saveData();updateSidebarInfo();showToast('Configurações salvas!','success');}

// ══════════════════════════════════════════════════════════════
// ── BACKUP ──
// ══════════════════════════════════════════════════════════════
function renderBackupPage(){var pg=document.getElementById('page-backup');if(!pg)return;pg.innerHTML='<div class="page-header"><h2>💾 Backup</h2></div><div class="card" style="padding:20px;max-width:600px"><h3 style="margin-bottom:16px">Exportar / Importar Dados</h3><p style="color:var(--text-muted);margin-bottom:16px">Exporte seus dados para um arquivo JSON ou importe um backup existente.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-primary" onclick="exportBackup()">📥 Exportar Backup</button><label class="btn btn-outline" style="cursor:pointer">📤 Importar Backup<input type="file" accept=".json" onchange="importBackup(this)" style="display:none"></label><button class="btn btn-danger" onclick="resetAllData()">🗑️ Resetar Tudo</button></div></div>';}
function exportBackup(){var blob=new Blob([JSON.stringify(appData,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='wdmaquinas_backup_'+todayStr()+'.json';a.click();URL.revokeObjectURL(url);showToast('Backup exportado!','success');}
function importBackup(input){var file=input.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(e){try{var data=JSON.parse(e.target.result);if(!confirm('Importar backup? Todos os dados atuais serão substituídos.'))return;appData=data;ensureDefaults();saveData();updateSidebarInfo();navigateTo('dashboard');showToast('Backup importado!','success');}catch(err){showToast('Arquivo inválido!','error');}};reader.readAsText(file);}
function resetAllData(){if(!confirm('ATENÇÃO: Isso apagará TODOS os dados! Deseja continuar?'))return;if(!confirm('Tem certeza absoluta? Essa ação não pode ser desfeita.'))return;appData=getDefaultData();saveData();updateSidebarInfo();navigateTo('dashboard');showToast('Dados resetados!','success');}

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
