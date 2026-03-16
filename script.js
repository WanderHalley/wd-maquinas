// ==========================================
// WD MÁQUINAS — SISTEMA DE FLUXO DE CAIXA 2026
// script.js — PARTE 3 (Dados, Base, Navegação)
// ==========================================

// ---------- ID helper ----------
function nextId(arr) {
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(i => i.id || 0)) + 1;
}

// ---------- DADOS PADRÃO ----------
function getDefaultData() {
  return {
    empresa: {
      nome: "WD Máquinas",
      cnpj: "59.483.994/0001-01",
      logo: ""
    },

    // CONFIGURAÇÕES
    vendedores: ["Wander", "Daniel"],
    formasPagamento: ["Boleto", "Caixa da Oficina", "Cartão de Crédito MP", "Cartão de Crédito PagBank", "Cartão de Débito MP", "Cartão de Débito PagBank", "Dinheiro", "Link MP", "Link PagBank", "MP", "PagBank", "Pix"],
    tipoUnidade: ["Unidade", "Kg", "Metro", "Litro", "Caixa", "Pacote", "Par", "Jogo", "Rolo", "Barra", "Chapa", "Peça"],
    tipoVenda: ["Direta", "Revenda"],
    situacaoCompra: ["Devendo", "Guardado", "Pago"],
    situacaoEntrega: ["Entregue com Defeito", "Entregue OK", "Não Entregue", "Pendente"],
    situacaoCheque: ["Compensado", "Depositado", "Devolvido", "Em Mãos", "Repassado"],
    situacaoGarantia: ["Ativa", "Expirada", "Utilizada"],
    situacaoBoleto: ["Pago", "Pendente", "Vencido"],

    // CLIENTES
    clientes: [
      { id:1, nome:"Renato", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"NOVA SERRANA", estado:"MG", cep:"", obs:"", img:"" },
      { id:2, nome:"Carlos Eduardo", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"MG", cep:"", obs:"", img:"" },
      { id:3, nome:"João Silva", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"MG", cep:"", obs:"", img:"" }
    ],

    // FORNECEDORES
    fornecedores: [
      { id:1, nome:"JOTAFRAN", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:2, nome:"PS INOX", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:3, nome:"MERCADO LIVRE", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:4, nome:"SHOPEE", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:5, nome:"LOJA DO MECANICO", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:6, nome:"AMAZON", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:7, nome:"AÇOS TRÊS CORAÇÕES", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:8, nome:"IRMÃOS FARIAS", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:9, nome:"LEROY MERLIN", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:10, nome:"CASA & CONSTRUÇÃO", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:11, nome:"MAGAZINE LUIZA", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:12, nome:"MAKITA", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:13, nome:"NORTON", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:14, nome:"CARBOGRAFITE", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:15, nome:"VONDER", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:16, nome:"ESAB", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:17, nome:"LYNUS", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:18, nome:"WORKER", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:19, nome:"INOX CENTER", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:20, nome:"AÇO CERTO", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:21, nome:"VELOE", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:22, nome:"COFERMETA", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:23, nome:"DANIEL MASSON", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:24, nome:"CLEITON LUCAS", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:25, nome:"DISTRIBUIDORA", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:26, nome:"FERRAGISTA", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:27, nome:"HIDRÁULICA", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:28, nome:"ELÉTRICA GERAL", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" },
      { id:29, nome:"TINTAS E CIA", cpfCnpj:"", telefone:"", email:"", endereco:"", cidade:"", estado:"", cep:"", obs:"", img:"" }
    ],

    // PRODUTOS
    produtos: [],

    // PRODUTOS DE FORNECEDORES
    pFornecedores: [],

    // COMPRAS (100 registros reais da planilha)
    compras: [
      { id:1, data:"2026-01-05", vencimento:"2026-01-15", produto:"Chapa de Aço 1020 3mm", quantidade:5, valorUnit:289.90, fornecedor:"JOTAFRAN", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:2, data:"2026-01-05", vencimento:"2026-01-20", produto:"Tubo Inox 304 2\"", quantidade:10, valorUnit:185.00, fornecedor:"PS INOX", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:3, data:"2026-01-06", vencimento:"2026-01-06", produto:"Disco de Corte 7\"", quantidade:50, valorUnit:5.90, fornecedor:"MERCADO LIVRE", formaPagamento:"Link MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:4, data:"2026-01-07", vencimento:"2026-01-07", produto:"Eletrodo 6013 3.25mm", quantidade:20, valorUnit:18.50, fornecedor:"ESAB", formaPagamento:"Cartão de Crédito MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:5, data:"2026-01-08", vencimento:"2026-01-25", produto:"Tinta Spray Preto Fosco", quantidade:12, valorUnit:14.90, fornecedor:"SHOPEE", formaPagamento:"Link MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:6, data:"2026-01-08", vencimento:"2026-01-08", produto:"Parafuso Sextavado M10", quantidade:100, valorUnit:0.85, fornecedor:"FERRAGISTA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:7, data:"2026-01-09", vencimento:"2026-02-09", produto:"Serra Circular Makita", quantidade:1, valorUnit:899.90, fornecedor:"MAKITA", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:8, data:"2026-01-10", vencimento:"2026-01-10", produto:"Lixa Flap 4.5\" Grão 60", quantidade:30, valorUnit:8.70, fornecedor:"NORTON", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:9, data:"2026-01-10", vencimento:"2026-01-10", produto:"Máscara de Solda Auto", quantidade:2, valorUnit:189.90, fornecedor:"CARBOGRAFITE", formaPagamento:"Cartão de Débito MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:10, data:"2026-01-12", vencimento:"2026-01-30", produto:"Barra Chata 1\" x 1/4\"", quantidade:20, valorUnit:32.50, fornecedor:"AÇOS TRÊS CORAÇÕES", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:11, data:"2026-01-13", vencimento:"2026-01-13", produto:"Cantoneira 1\" x 1/8\"", quantidade:15, valorUnit:28.00, fornecedor:"AÇOS TRÊS CORAÇÕES", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:12, data:"2026-01-14", vencimento:"2026-01-14", produto:"Rebolo Desbaste 7\"", quantidade:20, valorUnit:12.50, fornecedor:"NORTON", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:13, data:"2026-01-15", vencimento:"2026-02-15", produto:"Compressor 50L Lynus", quantidade:1, valorUnit:1450.00, fornecedor:"LYNUS", formaPagamento:"Cartão de Crédito MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:14, data:"2026-01-15", vencimento:"2026-01-15", produto:"Mangueira Ar 5/16 (10m)", quantidade:3, valorUnit:45.00, fornecedor:"HIDRÁULICA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:15, data:"2026-01-16", vencimento:"2026-01-16", produto:"Broca HSS 10mm", quantidade:10, valorUnit:15.80, fornecedor:"WORKER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:16, data:"2026-01-17", vencimento:"2026-01-17", produto:"Chapa Inox 304 1.5mm", quantidade:3, valorUnit:520.00, fornecedor:"INOX CENTER", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:17, data:"2026-01-18", vencimento:"2026-01-18", produto:"Arame MIG 0.8mm (15kg)", quantidade:2, valorUnit:195.00, fornecedor:"ESAB", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:18, data:"2026-01-20", vencimento:"2026-01-20", produto:"Luva Vaqueta Par", quantidade:20, valorUnit:22.00, fornecedor:"VONDER", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:19, data:"2026-01-20", vencimento:"2026-02-20", produto:"Furadeira Bancada", quantidade:1, valorUnit:1280.00, fornecedor:"LOJA DO MECANICO", formaPagamento:"Cartão de Crédito PagBank", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:20, data:"2026-01-22", vencimento:"2026-01-22", produto:"Fita Isolante 20m", quantidade:24, valorUnit:6.50, fornecedor:"ELÉTRICA GERAL", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:21, data:"2026-01-23", vencimento:"2026-01-23", produto:"Porca Sextavada M10", quantidade:100, valorUnit:0.50, fornecedor:"FERRAGISTA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:22, data:"2026-01-24", vencimento:"2026-01-24", produto:"Tubo Quadrado 30x30 1.5mm", quantidade:10, valorUnit:48.00, fornecedor:"AÇOS TRÊS CORAÇÕES", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:23, data:"2026-01-25", vencimento:"2026-01-25", produto:"Primer Universal 900ml", quantidade:6, valorUnit:38.00, fornecedor:"TINTAS E CIA", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:24, data:"2026-01-25", vencimento:"2026-01-25", produto:"Thinner 5L", quantidade:4, valorUnit:55.00, fornecedor:"TINTAS E CIA", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:25, data:"2026-01-27", vencimento:"2026-02-27", produto:"Morsa Bancada 6\"", quantidade:2, valorUnit:320.00, fornecedor:"LOJA DO MECANICO", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:26, data:"2026-01-28", vencimento:"2026-01-28", produto:"Chave Combinada Jg 8-22mm", quantidade:3, valorUnit:89.90, fornecedor:"WORKER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:27, data:"2026-01-29", vencimento:"2026-01-29", produto:"Dobradiça Industrial 4\"", quantidade:20, valorUnit:12.00, fornecedor:"FERRAGISTA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:28, data:"2026-01-30", vencimento:"2026-01-30", produto:"Cadeado 50mm", quantidade:5, valorUnit:35.00, fornecedor:"CASA & CONSTRUÇÃO", formaPagamento:"Cartão de Débito PagBank", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:29, data:"2026-01-30", vencimento:"2026-02-28", produto:"Esmerilhadeira 7\" Makita", quantidade:1, valorUnit:750.00, fornecedor:"MAKITA", formaPagamento:"Cartão de Crédito MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:30, data:"2026-01-31", vencimento:"2026-01-31", produto:"Gás CO2 (Cilindro 10kg)", quantidade:2, valorUnit:180.00, fornecedor:"COFERMETA", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:31, data:"2026-02-01", vencimento:"2026-02-15", produto:"Chapa de Aço 1020 2mm", quantidade:4, valorUnit:245.00, fornecedor:"JOTAFRAN", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:32, data:"2026-02-01", vencimento:"2026-02-01", produto:"Disco Flap 4.5\" Grão 80", quantidade:40, valorUnit:7.50, fornecedor:"NORTON", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:33, data:"2026-02-03", vencimento:"2026-02-03", produto:"Eletrodo Inox 308L 2.5mm", quantidade:10, valorUnit:42.00, fornecedor:"ESAB", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:34, data:"2026-02-04", vencimento:"2026-02-04", produto:"Fita Veda Rosca 18mm", quantidade:20, valorUnit:4.50, fornecedor:"HIDRÁULICA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:35, data:"2026-02-05", vencimento:"2026-02-05", produto:"Silicone Alta Temp.", quantidade:10, valorUnit:18.90, fornecedor:"CASA & CONSTRUÇÃO", formaPagamento:"Cartão de Débito MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:36, data:"2026-02-06", vencimento:"2026-03-06", produto:"Tubo Redondo Inox 1\"", quantidade:8, valorUnit:95.00, fornecedor:"PS INOX", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:37, data:"2026-02-07", vencimento:"2026-02-07", produto:"Pinca MIG Contato 0.8mm", quantidade:20, valorUnit:3.80, fornecedor:"COFERMETA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:38, data:"2026-02-08", vencimento:"2026-02-08", produto:"Bocal Cerâmica TIG", quantidade:10, valorUnit:8.50, fornecedor:"COFERMETA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:39, data:"2026-02-10", vencimento:"2026-02-25", produto:"Chapa Xadrez 3mm", quantidade:2, valorUnit:380.00, fornecedor:"AÇOS TRÊS CORAÇÕES", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:40, data:"2026-02-10", vencimento:"2026-02-10", produto:"Arruela Lisa M10", quantidade:200, valorUnit:0.30, fornecedor:"FERRAGISTA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:41, data:"2026-02-12", vencimento:"2026-02-12", produto:"Broca HSS 6mm", quantidade:15, valorUnit:8.90, fornecedor:"WORKER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:42, data:"2026-02-13", vencimento:"2026-02-13", produto:"Trena 5m", quantidade:5, valorUnit:25.00, fornecedor:"VONDER", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:43, data:"2026-02-14", vencimento:"2026-02-14", produto:"Alicate Universal 8\"", quantidade:4, valorUnit:38.00, fornecedor:"WORKER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:44, data:"2026-02-15", vencimento:"2026-02-15", produto:"Martelo Bola 500g", quantidade:3, valorUnit:45.00, fornecedor:"WORKER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:45, data:"2026-02-17", vencimento:"2026-03-17", produto:"Tubo Quadrado 50x50 2mm", quantidade:8, valorUnit:72.00, fornecedor:"AÇOS TRÊS CORAÇÕES", formaPagamento:"Boleto", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:46, data:"2026-02-18", vencimento:"2026-02-18", produto:"Disco Corte Inox 4.5\"", quantidade:30, valorUnit:4.80, fornecedor:"NORTON", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:47, data:"2026-02-19", vencimento:"2026-02-19", produto:"Bico Corte Oxi-GLP nº3", quantidade:5, valorUnit:28.00, fornecedor:"COFERMETA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:48, data:"2026-02-20", vencimento:"2026-02-20", produto:"Maçarico Solda PPU", quantidade:1, valorUnit:320.00, fornecedor:"COFERMETA", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:49, data:"2026-02-21", vencimento:"2026-02-21", produto:"Tinta Esmalte Preto 3.6L", quantidade:3, valorUnit:78.00, fornecedor:"TINTAS E CIA", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:50, data:"2026-02-22", vencimento:"2026-02-22", produto:"Lixadeira Orbital", quantidade:1, valorUnit:350.00, fornecedor:"MAKITA", formaPagamento:"Cartão de Crédito MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:51, data:"2026-02-24", vencimento:"2026-02-24", produto:"Tubo Retangular 40x20 1.5mm", quantidade:12, valorUnit:38.00, fornecedor:"AÇOS TRÊS CORAÇÕES", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:52, data:"2026-02-25", vencimento:"2026-02-25", produto:"Pingo de Solda Spray", quantidade:6, valorUnit:22.00, fornecedor:"ESAB", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:53, data:"2026-02-26", vencimento:"2026-02-26", produto:"Óculos Proteção Ampla Visão", quantidade:10, valorUnit:15.00, fornecedor:"CARBOGRAFITE", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:54, data:"2026-02-27", vencimento:"2026-02-27", produto:"Gás Argônio (Cilindro 10m³)", quantidade:1, valorUnit:280.00, fornecedor:"COFERMETA", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:55, data:"2026-02-28", vencimento:"2026-02-28", produto:"Mangote Solda Par", quantidade:6, valorUnit:28.00, fornecedor:"CARBOGRAFITE", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:56, data:"2026-03-01", vencimento:"2026-03-15", produto:"Chapa de Aço 1020 4mm", quantidade:3, valorUnit:340.00, fornecedor:"JOTAFRAN", formaPagamento:"Boleto", situacao:"Devendo", entrega:"Entregue OK", obs:"" },
      { id:57, data:"2026-03-01", vencimento:"2026-03-01", produto:"Disco Corte 4.5\"", quantidade:50, valorUnit:4.20, fornecedor:"NORTON", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:58, data:"2026-03-02", vencimento:"2026-03-02", produto:"Vareta TIG Inox 308L 2.4mm", quantidade:5, valorUnit:65.00, fornecedor:"ESAB", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:59, data:"2026-03-03", vencimento:"2026-03-03", produto:"Tubo Inox 304 1.5\"", quantidade:6, valorUnit:145.00, fornecedor:"PS INOX", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:60, data:"2026-03-04", vencimento:"2026-03-04", produto:"Parafuso Allen M8x30", quantidade:50, valorUnit:0.95, fornecedor:"FERRAGISTA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:61, data:"2026-03-05", vencimento:"2026-03-20", produto:"Cantoneira Inox 1\" x 1/8\"", quantidade:10, valorUnit:55.00, fornecedor:"INOX CENTER", formaPagamento:"Boleto", situacao:"Devendo", entrega:"Pendente", obs:"" },
      { id:62, data:"2026-03-05", vencimento:"2026-03-05", produto:"Lixa Ferro Grão 100", quantidade:30, valorUnit:3.50, fornecedor:"NORTON", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:63, data:"2026-03-06", vencimento:"2026-03-06", produto:"Ponta Montada Cônica", quantidade:10, valorUnit:6.80, fornecedor:"NORTON", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:64, data:"2026-03-07", vencimento:"2026-03-07", produto:"Protetor Auricular Plug", quantidade:20, valorUnit:4.50, fornecedor:"CARBOGRAFITE", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:65, data:"2026-03-08", vencimento:"2026-03-08", produto:"Barra Roscada M12 1m", quantidade:10, valorUnit:18.00, fornecedor:"FERRAGISTA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:66, data:"2026-03-10", vencimento:"2026-03-10", produto:"Arame MIG Inox 0.8mm (5kg)", quantidade:2, valorUnit:285.00, fornecedor:"ESAB", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:67, data:"2026-03-10", vencimento:"2026-04-10", produto:"Chapa Inox 430 1mm", quantidade:4, valorUnit:290.00, fornecedor:"INOX CENTER", formaPagamento:"Boleto", situacao:"Devendo", entrega:"Pendente", obs:"" },
      { id:68, data:"2026-03-11", vencimento:"2026-03-11", produto:"Spray Galvanização Frio", quantidade:8, valorUnit:32.00, fornecedor:"SHOPEE", formaPagamento:"Link MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:69, data:"2026-03-12", vencimento:"2026-03-12", produto:"Copo Vidro TIG nº7", quantidade:10, valorUnit:5.50, fornecedor:"COFERMETA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:70, data:"2026-03-13", vencimento:"2026-03-13", produto:"Esquadro Metalico 12\"", quantidade:3, valorUnit:42.00, fornecedor:"VONDER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:71, data:"2026-01-05", vencimento:"2026-01-05", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:72, data:"2026-01-12", vencimento:"2026-01-12", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:73, data:"2026-01-19", vencimento:"2026-01-19", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:74, data:"2026-01-26", vencimento:"2026-01-26", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:75, data:"2026-02-02", vencimento:"2026-02-02", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:76, data:"2026-02-09", vencimento:"2026-02-09", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:77, data:"2026-02-16", vencimento:"2026-02-16", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:78, data:"2026-02-23", vencimento:"2026-02-23", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:79, data:"2026-03-02", vencimento:"2026-03-02", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:80, data:"2026-03-09", vencimento:"2026-03-09", produto:"Combustível", quantidade:1, valorUnit:250.00, fornecedor:"VELOE", formaPagamento:"Caixa da Oficina", situacao:"Pago", entrega:"Entregue OK", obs:"Abastecimento semanal" },
      { id:81, data:"2026-01-07", vencimento:"2026-01-07", produto:"Rolo Fita Crepe 24mm", quantidade:10, valorUnit:9.00, fornecedor:"CASA & CONSTRUÇÃO", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:82, data:"2026-01-11", vencimento:"2026-01-11", produto:"Régua de Aço 1m", quantidade:3, valorUnit:35.00, fornecedor:"VONDER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:83, data:"2026-01-14", vencimento:"2026-01-14", produto:"Alicate Pressão 10\"", quantidade:4, valorUnit:42.00, fornecedor:"WORKER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:84, data:"2026-01-19", vencimento:"2026-01-19", produto:"Bucha Nylon S10", quantidade:100, valorUnit:0.25, fornecedor:"FERRAGISTA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:85, data:"2026-01-21", vencimento:"2026-01-21", produto:"Escova Aço Circular 6\"", quantidade:5, valorUnit:28.00, fornecedor:"NORTON", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:86, data:"2026-01-26", vencimento:"2026-01-26", produto:"Mangueira de Gás 5m", quantidade:2, valorUnit:65.00, fornecedor:"COFERMETA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:87, data:"2026-02-05", vencimento:"2026-02-05", produto:"Niple Inox 1/2\"", quantidade:15, valorUnit:8.00, fornecedor:"HIDRÁULICA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:88, data:"2026-02-11", vencimento:"2026-02-11", produto:"Anel Oring Kit", quantidade:5, valorUnit:22.00, fornecedor:"HIDRÁULICA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:89, data:"2026-02-16", vencimento:"2026-02-16", produto:"Graxa Azul 500g", quantidade:4, valorUnit:18.00, fornecedor:"LOJA DO MECANICO", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:90, data:"2026-02-22", vencimento:"2026-02-22", produto:"WD-40 Spray 300ml", quantidade:6, valorUnit:28.00, fornecedor:"AMAZON", formaPagamento:"Link MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:91, data:"2026-03-03", vencimento:"2026-03-03", produto:"Avental Raspa Soldador", quantidade:4, valorUnit:38.00, fornecedor:"CARBOGRAFITE", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:92, data:"2026-03-07", vencimento:"2026-03-07", produto:"Botina Segurança nº42", quantidade:2, valorUnit:95.00, fornecedor:"AMAZON", formaPagamento:"Link MP", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:93, data:"2026-03-11", vencimento:"2026-03-11", produto:"Rolo Lixa 120 (50m)", quantidade:2, valorUnit:85.00, fornecedor:"NORTON", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:94, data:"2026-03-14", vencimento:"2026-03-14", produto:"Difusor Gás MIG", quantidade:10, valorUnit:7.50, fornecedor:"COFERMETA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:95, data:"2026-01-03", vencimento:"2026-01-03", produto:"Pedra Esmeril 6\" Grão 36", quantidade:4, valorUnit:32.00, fornecedor:"NORTON", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:96, data:"2026-01-09", vencimento:"2026-01-09", produto:"Chave Allen Jg 1.5-10mm", quantidade:5, valorUnit:28.00, fornecedor:"WORKER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:97, data:"2026-02-08", vencimento:"2026-02-08", produto:"Mandril 13mm c/ Chave", quantidade:2, valorUnit:65.00, fornecedor:"LOJA DO MECANICO", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:98, data:"2026-02-20", vencimento:"2026-02-20", produto:"Nível Alumínio 24\"", quantidade:2, valorUnit:55.00, fornecedor:"VONDER", formaPagamento:"Pix", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:99, data:"2026-03-06", vencimento:"2026-03-06", produto:"Tampa Inox p/ Bocal MIG", quantidade:5, valorUnit:12.00, fornecedor:"COFERMETA", formaPagamento:"Dinheiro", situacao:"Pago", entrega:"Entregue OK", obs:"" },
      { id:100, data:"2026-03-14", vencimento:"2026-04-14", produto:"Chapa Perfurada 1.5mm", quantidade:2, valorUnit:210.00, fornecedor:"INOX CENTER", formaPagamento:"Boleto", situacao:"Devendo", entrega:"Pendente", obs:"" }
    ],

    // VENDAS
    vendas: [
      { id:1, data:"2026-01-08", cliente:"Renato", produto:"Grade Inox Sob Medida", quantidade:1, valorUnit:1800.00, vendedor:"Wander", formaPagamento:"Pix", tipo:"Direta", situacao:"Pago", obs:"" },
      { id:2, data:"2026-01-12", cliente:"Carlos Eduardo", produto:"Portão Basculante 3x2.5m", quantidade:1, valorUnit:4500.00, vendedor:"Wander", formaPagamento:"Cartão de Crédito MP", tipo:"Direta", situacao:"Pago", obs:"3x sem juros" },
      { id:3, data:"2026-01-18", cliente:"João Silva", produto:"Corrimão Inox 6m", quantidade:1, valorUnit:2200.00, vendedor:"Daniel", formaPagamento:"Pix", tipo:"Direta", situacao:"Pago", obs:"" },
      { id:4, data:"2026-01-25", cliente:"Renato", produto:"Escada Caracol", quantidade:1, valorUnit:6500.00, vendedor:"Wander", formaPagamento:"Boleto", tipo:"Direta", situacao:"Pago", obs:"" },
      { id:5, data:"2026-02-05", cliente:"Carlos Eduardo", produto:"Mezanino Estrutura", quantidade:1, valorUnit:8500.00, vendedor:"Wander", formaPagamento:"Boleto", tipo:"Direta", situacao:"Pago", obs:"" },
      { id:6, data:"2026-02-15", cliente:"Renato", produto:"Cobertura Policarbonato 4x3m", quantidade:1, valorUnit:3200.00, vendedor:"Daniel", formaPagamento:"Pix", tipo:"Direta", situacao:"Devendo", obs:"Falta R$910" },
      { id:7, data:"2026-02-22", cliente:"João Silva", produto:"Guarda Corpo Inox 8m", quantidade:1, valorUnit:3800.00, vendedor:"Daniel", formaPagamento:"Cartão de Crédito PagBank", tipo:"Direta", situacao:"Pago", obs:"" },
      { id:8, data:"2026-03-02", cliente:"Carlos Eduardo", produto:"Portão Pivotante 4x2m", quantidade:1, valorUnit:5200.00, vendedor:"Wander", formaPagamento:"Pix", tipo:"Direta", situacao:"Pago", obs:"" },
      { id:9, data:"2026-03-10", cliente:"Renato", produto:"Janela Guilhotina Inox", quantidade:2, valorUnit:1450.00, vendedor:"Wander", formaPagamento:"Link PagBank", tipo:"Direta", situacao:"Devendo", obs:"" }
    ],

    // ESTOQUE (gerado a partir de compras/vendas — pode ser complementado)
    estoque: [],

    // BOLETOS
    boletos: [
      { id:1, descricao:"Chapa de Aço 1020 3mm", fornecedor:"JOTAFRAN", valor:1449.50, vencimento:"2026-01-15", situacao:"Pago", obs:"" },
      { id:2, descricao:"Serra Circular Makita", fornecedor:"MAKITA", valor:899.90, vencimento:"2026-02-09", situacao:"Pago", obs:"" },
      { id:3, descricao:"Barra Chata 1\" x 1/4\"", fornecedor:"AÇOS TRÊS CORAÇÕES", valor:650.00, vencimento:"2026-01-30", situacao:"Pago", obs:"" },
      { id:4, descricao:"Compressor 50L Lynus", fornecedor:"LYNUS", valor:1450.00, vencimento:"2026-02-15", situacao:"Pago", obs:"" },
      { id:5, descricao:"Morsa Bancada 6\"", fornecedor:"LOJA DO MECANICO", valor:640.00, vencimento:"2026-02-27", situacao:"Pago", obs:"" },
      { id:6, descricao:"Esmerilhadeira 7\" Makita", fornecedor:"MAKITA", valor:750.00, vencimento:"2026-02-28", situacao:"Pago", obs:"" },
      { id:7, descricao:"Chapa de Aço 1020 2mm", fornecedor:"JOTAFRAN", valor:980.00, vencimento:"2026-02-15", situacao:"Pago", obs:"" },
      { id:8, descricao:"Tubo Redondo Inox 1\"", fornecedor:"PS INOX", valor:760.00, vencimento:"2026-03-06", situacao:"Pago", obs:"" },
      { id:9, descricao:"Chapa Xadrez 3mm", fornecedor:"AÇOS TRÊS CORAÇÕES", valor:760.00, vencimento:"2026-02-25", situacao:"Pago", obs:"" },
      { id:10, descricao:"Tubo Quadrado 50x50 2mm", fornecedor:"AÇOS TRÊS CORAÇÕES", valor:576.00, vencimento:"2026-03-17", situacao:"Pendente", obs:"" },
      { id:11, descricao:"Chapa de Aço 1020 4mm", fornecedor:"JOTAFRAN", valor:1020.00, vencimento:"2026-03-15", situacao:"Pendente", obs:"" },
      { id:12, descricao:"Cantoneira Inox 1\" x 1/8\"", fornecedor:"INOX CENTER", valor:550.00, vencimento:"2026-03-20", situacao:"Pendente", obs:"" },
      { id:13, descricao:"Chapa Inox 430 1mm", fornecedor:"INOX CENTER", valor:1160.00, vencimento:"2026-04-10", situacao:"Pendente", obs:"" },
      { id:14, descricao:"Chapa Perfurada 1.5mm", fornecedor:"INOX CENTER", valor:420.00, vencimento:"2026-04-14", situacao:"Pendente", obs:"" },
      { id:15, descricao:"Furadeira Bancada", fornecedor:"LOJA DO MECANICO", valor:1280.00, vencimento:"2026-02-20", situacao:"Pago", obs:"" },
      { id:16, descricao:"Tubo Quadrado 30x30 1.5mm", fornecedor:"AÇOS TRÊS CORAÇÕES", valor:480.00, vencimento:"2026-01-24", situacao:"Pago", obs:"" },
      { id:17, descricao:"Chapa Inox 304 1.5mm", fornecedor:"INOX CENTER", valor:1560.00, vencimento:"2026-01-17", situacao:"Pago", obs:"" }
    ],

    // CHEQUES
    cheques: [],

    // PRESTAÇÕES
    prestacoes: [
      { id:1, descricao:"Empréstimo", valor:2368.63, parcelas:5, parcelaAtual:1, vencimento:"2026-01-10", situacao:"Pago", obs:"" },
      { id:2, descricao:"Empréstimo", valor:2368.63, parcelas:5, parcelaAtual:2, vencimento:"2026-02-10", situacao:"Pago", obs:"" },
      { id:3, descricao:"Empréstimo", valor:2368.63, parcelas:5, parcelaAtual:3, vencimento:"2026-03-10", situacao:"Pendente", obs:"" },
      { id:4, descricao:"Empréstimo", valor:2368.63, parcelas:5, parcelaAtual:4, vencimento:"2026-04-10", situacao:"Pendente", obs:"" },
      { id:5, descricao:"Empréstimo", valor:2368.63, parcelas:5, parcelaAtual:5, vencimento:"2026-05-10", situacao:"Pendente", obs:"" },
      { id:6, descricao:"Bling", valor:214.83, parcelas:1, parcelaAtual:1, vencimento:"2026-01-15", situacao:"Pago", obs:"Sistema ERP" },
      { id:7, descricao:"Frenet", valor:85.00, parcelas:10, parcelaAtual:1, vencimento:"2026-01-05", situacao:"Pago", obs:"Frete" },
      { id:8, descricao:"Frenet", valor:85.00, parcelas:10, parcelaAtual:2, vencimento:"2026-02-05", situacao:"Pago", obs:"Frete" },
      { id:9, descricao:"Frenet", valor:85.00, parcelas:10, parcelaAtual:3, vencimento:"2026-03-05", situacao:"Pendente", obs:"Frete" },
      { id:10, descricao:"Flexível 1/2 C.WD", valor:269.96, parcelas:1, parcelaAtual:1, vencimento:"2026-01-20", situacao:"Pago", obs:"" },
      { id:11, descricao:"WD", valor:349.05, parcelas:1, parcelaAtual:1, vencimento:"2026-02-15", situacao:"Pago", obs:"" }
    ],

    // PROJETOS
    projetos: [
      { id:1, nome:"Cons. Carro", descricao:"Conserto de Carro", orcamento:6066.00, gasto:0, situacao:"Em Andamento", inicio:"2026-01-01", previsao:"2026-06-30", obs:"" },
      { id:2, nome:"C. Chapa", descricao:"Compra de Chapas", orcamento:6066.00, gasto:0, situacao:"Em Andamento", inicio:"2026-01-01", previsao:"2026-12-31", obs:"" }
    ],

    // PAGAMENTOS CLIENTES
    pagClientes: [
      { id:1, cliente:"Renato", cidade:"NOVA SERRANA", totalDevido:4320.00, totalPago:3410.00, restante:910.00, obs:"" }
    ],

    // GARANTIAS
    garantias: [],

    // NOTAS ENTRADA
    notasEntrada: [],

    // NOTAS SAIDA
    notasSaida: [],

    // RECEITAS MEI
    receitasMei: [],

    // FLUXO DE CAIXA — Estrutura por mês (valores diários)
    fluxoCaixa: {
      janeiro: {
        entradas: [0,3302.35,0,0,0,1800,0,0,0,0,0,4500,0,0,0,0,0,2200,0,0,0,0,0,0,6500,0,0,0,0,0,9711.11],
        saidas: [0,1577.90,295,0,460,178.80,90,899.90,641,0,0,1070,250,0,1450,293,0,158,548,0,1280,156,50,480,456,640,889.70,240,175,750,360],
        dinheiro: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        wander: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        daniel: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        combustivel: [250,0,0,0,0,0,0,0,0,0,0,250,0,0,0,0,0,0,250,0,0,0,0,0,0,250,0,0,0,0,0]
      },
      fevereiro: {
        entradas: [0,0,0,0,8500,0,0,0,0,0,0,0,0,0,3200,0,0,0,0,0,0,3800,0,0,0,0,0,0],
        saidas: [980,300,0,420,90,279,76,215,189,760,60,133.50,125,152,135,144,250,576,140,668,110,350,456,132,150,280,168,0],
        dinheiro: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        wander: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        daniel: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        combustivel: [0,250,0,0,0,0,0,0,250,0,0,0,0,0,0,250,0,0,0,0,0,0,250,0,0,0,0,0]
      },
      marco: {
        entradas: [5200,0,0,0,0,0,0,0,0,2900,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        saidas: [1020,460,477,870,635,130,280,0,250,570,426,256,126,495,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        dinheiro: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        wander: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        daniel: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        combustivel: [0,250,0,0,0,0,0,0,250,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      },
      abril: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] },
      maio: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] },
      junho: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] },
      julho: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] },
      agosto: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] },
      setembro: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] },
      outubro: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] },
      novembro: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] },
      dezembro: { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] }
    }
  };
}

// ---------- DADOS EM MEMÓRIA ----------
let appData = {};

function loadData() {
  const saved = localStorage.getItem('wdmaquinas_data');
  if (saved) {
    try { appData = JSON.parse(saved); } catch(e) { appData = getDefaultData(); }
  } else {
    appData = getDefaultData();
  }
  // garantir campos
  const def = getDefaultData();
  for (let k in def) {
    if (!(k in appData)) appData[k] = def[k];
  }
  if (!appData.fluxoCaixa) appData.fluxoCaixa = def.fluxoCaixa;
  updateSidebarLogo();
}

function saveData() {
  localStorage.setItem('wdmaquinas_data', JSON.stringify(appData));
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
  // esconder todas as páginas
  document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
  // mostrar a página
  const el = document.getElementById('page-' + page);
  if (el) el.style.display = 'block';
  // atualizar sidebar ativo
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const active = document.querySelector(`.nav-item[onclick*="'${page}'"]`);
  if (active) active.classList.add('active');
  // atualizar titulo topbar
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
  // renderizar conteúdo
  renderPage(page);
  // fechar sidebar mobile
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

// ---------- SIDEBAR TOGGLE ----------
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

// ---------- MODAL HELPERS ----------
function closeCadastroModal() {
  const m = document.getElementById('cadastroModal');
  if (m) m.style.display = 'none';
}
function closeViewModal() {
  const m = document.getElementById('viewModal');
  if (m) m.style.display = 'none';
}

// ==========================================
// PARTE 4 — DASHBOARD + FLUXO DE CAIXA MENSAL
// ==========================================

// ---------- DASHBOARD ----------
function renderDashboard() {
  const container = document.getElementById('dashboardCards');
  if (!container) return;

  // Cálculos
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

  // Entradas e Saídas totais dos fluxos
  let entradasFluxo = 0, saidasFluxo = 0;
  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  meses.forEach(m => {
    const fc = appData.fluxoCaixa[m];
    if (fc) {
      entradasFluxo += (fc.entradas||[]).reduce((a,b) => a+b, 0);
      saidasFluxo += (fc.saidas||[]).reduce((a,b) => a+b, 0) + (fc.combustivel||[]).reduce((a,b) => a+b, 0);
    }
  });
  const caixaAtual = entradasFluxo - saidasFluxo;

  // Metas
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
// FLUXO DE CAIXA MENSAL — ESTILO LISTA
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

function initFluxoMes(mesKey, dias) {
  if (!appData.fluxoCaixa) appData.fluxoCaixa = {};
  if (!appData.fluxoCaixa[mesKey]) {
    appData.fluxoCaixa[mesKey] = { entradas:[], saidas:[], dinheiro:[], wander:[], daniel:[], combustivel:[] };
  }
  const fc = appData.fluxoCaixa[mesKey];
  ['entradas','saidas','dinheiro','wander','daniel','combustivel'].forEach(tipo => {
    if (!fc[tipo]) fc[tipo] = [];
    while (fc[tipo].length < dias) fc[tipo].push(0);
  });
}

function getSaldoMesesAnteriores(mesKey) {
  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const idx = meses.indexOf(mesKey);
  let saldo = 0;
  for (let i = 0; i < idx; i++) {
    const fc = appData.fluxoCaixa[meses[i]];
    if (fc) {
      saldo += (fc.entradas||[]).reduce((a,b) => a+b, 0);
      saldo -= (fc.saidas||[]).reduce((a,b) => a+b, 0);
      saldo -= (fc.combustivel||[]).reduce((a,b) => a+b, 0);
    }
  }
  return saldo;
}

function renderFluxoMes(page) {
  const cfg = mesConfig[page];
  if (!cfg) return;
  const { key, dias, label } = cfg;
  initFluxoMes(key, dias);
  const fc = appData.fluxoCaixa[key];

  const container = document.getElementById('fluxo' + label.replace('ç','c').replace('Março','Marco'));
  // Usar um ID genérico — buscar pelo container da página
  const pageEl = document.getElementById('page-' + page);
  if (!pageEl) return;

  const totalEntradas = fc.entradas.reduce((a,b) => a+b, 0);
  const totalSaidas = fc.saidas.reduce((a,b) => a+b, 0);
  const totalCombustivel = fc.combustivel.reduce((a,b) => a+b, 0);
  const totalDinheiro = fc.dinheiro.reduce((a,b) => a+b, 0);
  const totalWander = fc.wander.reduce((a,b) => a+b, 0);
  const totalDaniel = fc.daniel.reduce((a,b) => a+b, 0);
  const saldoAnterior = getSaldoMesesAnteriores(key);
  const saldoMes = totalEntradas - totalSaidas - totalCombustivel;
  const caixaFinal = saldoAnterior + saldoMes;

  // Construir lista de lançamentos (entradas e saídas)
  let lancamentos = [];
  for (let d = 0; d < dias; d++) {
    const dia = d + 1;
    const dataStr = `2026-${String(mesIndexMap[key]+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    if (fc.entradas[d] > 0) {
      lancamentos.push({ id: `E-${d}`, data: dataStr, dia, tipo:'Entrada', categoria:'Entrada', valor: fc.entradas[d], idx: d, tipoKey:'entradas' });
    }
    if (fc.saidas[d] > 0) {
      lancamentos.push({ id: `S-${d}`, data: dataStr, dia, tipo:'Saída', categoria:'Saída Geral', valor: fc.saidas[d], idx: d, tipoKey:'saidas' });
    }
    if (fc.combustivel[d] > 0) {
      lancamentos.push({ id: `C-${d}`, data: dataStr, dia, tipo:'Saída', categoria:'Combustível', valor: fc.combustivel[d], idx: d, tipoKey:'combustivel' });
    }
    if (fc.dinheiro[d] > 0) {
      lancamentos.push({ id: `D-${d}`, data: dataStr, dia, tipo:'Saída', categoria:'Dinheiro', valor: fc.dinheiro[d], idx: d, tipoKey:'dinheiro' });
    }
    if (fc.wander[d] > 0) {
      lancamentos.push({ id: `W-${d}`, data: dataStr, dia, tipo:'Saída', categoria:'Wander', valor: fc.wander[d], idx: d, tipoKey:'wander' });
    }
    if (fc.daniel[d] > 0) {
      lancamentos.push({ id: `DN-${d}`, data: dataStr, dia, tipo:'Saída', categoria:'Daniel', valor: fc.daniel[d], idx: d, tipoKey:'daniel' });
    }
  }

  // Ordenar por data
  lancamentos.sort((a,b) => a.dia - b.dia);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Fluxo de Caixa — ${label} 2026</h2>
    </div>

    <!-- Cards Resumo -->
    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📈</span><span>Total Entradas</span></div>
        <div class="card-value text-success">${formatCurrency(totalEntradas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📉</span><span>Total Saídas</span></div>
        <div class="card-value text-danger">${formatCurrency(totalSaidas + totalCombustivel)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">⛽</span><span>Combustível</span></div>
        <div class="card-value text-warning">${formatCurrency(totalCombustivel)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">💵</span><span>Dinheiro</span></div>
        <div class="card-value">${formatCurrency(totalDinheiro)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">👤</span><span>Wander</span></div>
        <div class="card-value">${formatCurrency(totalWander)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">👤</span><span>Daniel</span></div>
        <div class="card-value">${formatCurrency(totalDaniel)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">🔙</span><span>Saldo Anterior</span></div>
        <div class="card-value ${saldoAnterior >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(saldoAnterior)}</div>
      </div>
      <div class="card card-accent">
        <div class="card-header"><span class="card-icon">💰</span><span>Caixa Final</span></div>
        <div class="card-value ${caixaFinal >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(caixaFinal)}</div>
      </div>
    </div>

    <!-- Filtros e Botão Adicionar -->
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
        <option value="Entrada">Entrada</option>
        <option value="Saída Geral">Saída Geral</option>
        <option value="Combustível">Combustível</option>
        <option value="Dinheiro">Dinheiro</option>
        <option value="Wander">Wander</option>
        <option value="Daniel">Daniel</option>
      </select>
      <button class="btn btn-primary" onclick="openFluxoModal('${key}', ${dias})">
        <span>+</span> Adicionar
      </button>
    </div>

    <!-- Tabela Lançamentos -->
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
        <tbody id="fluxoBody_${key}">
        </tbody>
      </table>
    </div>
  `;

  // Aplicar filtros
  const filtroDataInicio = document.getElementById('filtroDataInicio_' + key);
  const filtroDataFim = document.getElementById('filtroDataFim_' + key);
  const filtroTipo = document.getElementById('filtroTipo_' + key);
  const filtroCategoria = document.getElementById('filtroCategoria_' + key);

  let filtrados = [...lancamentos];

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
          <button class="btn btn-sm btn-outline" onclick="editFluxoLancamento('${key}', ${l.idx}, '${l.tipoKey}', ${dias})" title="Editar">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteFluxoLancamento('${key}', ${l.idx}, '${l.tipoKey}', '${page}')" title="Excluir">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  // Linha de totais filtrados
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

// ---------- MODAL ADICIONAR LANÇAMENTO ----------
function openFluxoModal(mesKey, dias, editIdx, editTipoKey) {
  const isEdit = editIdx !== undefined;
  const fc = appData.fluxoCaixa[mesKey];

  let valorAtual = 0;
  let categoriaAtual = 'entradas';
  let diaAtual = 1;

  if (isEdit && fc) {
    valorAtual = fc[editTipoKey][editIdx] || 0;
    categoriaAtual = editTipoKey;
    diaAtual = editIdx + 1;
  }

  const mesIdx = mesIndexMap[mesKey];
  const mesLabel = Object.values(mesConfig).find(c => c.key === mesKey)?.label || mesKey;

  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Lançamento' : 'Novo Lançamento — ' + mesLabel;

  let diasOptions = '';
  for (let d = 1; d <= dias; d++) {
    diasOptions += `<option value="${d}" ${d===diaAtual?'selected':''}>${d}</option>`;
  }

  modalBody.innerHTML = `
    <div class="form-group">
      <label>Dia</label>
      <select id="fluxoDia" class="form-control">${diasOptions}</select>
    </div>
    <div class="form-group">
      <label>Categoria</label>
      <select id="fluxoCategoria" class="form-control">
        <option value="entradas" ${categoriaAtual==='entradas'?'selected':''}>Entrada</option>
        <option value="saidas" ${categoriaAtual==='saidas'?'selected':''}>Saída Geral</option>
        <option value="combustivel" ${categoriaAtual==='combustivel'?'selected':''}>Combustível</option>
        <option value="dinheiro" ${categoriaAtual==='dinheiro'?'selected':''}>Dinheiro</option>
        <option value="wander" ${categoriaAtual==='wander'?'selected':''}>Wander</option>
        <option value="daniel" ${categoriaAtual==='daniel'?'selected':''}>Daniel</option>
      </select>
    </div>
    <div class="form-group">
      <label>Valor (R$)</label>
      <input type="number" id="fluxoValor" class="form-control" step="0.01" min="0" value="${valorAtual}">
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveFluxoLancamento('${mesKey}', ${dias}, ${isEdit ? editIdx : -1}, '${isEdit ? editTipoKey : ''}')">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveFluxoLancamento(mesKey, dias, editIdx, editTipoKey) {
  const dia = parseInt(document.getElementById('fluxoDia').value);
  const categoria = document.getElementById('fluxoCategoria').value;
  const valor = parseFloat(document.getElementById('fluxoValor').value) || 0;

  if (valor <= 0) {
    showToast('Informe um valor maior que zero', 'error');
    return;
  }
  if (dia < 1 || dia > dias) {
    showToast('Dia inválido', 'error');
    return;
  }

  initFluxoMes(mesKey, dias);
  const fc = appData.fluxoCaixa[mesKey];
  const idx = dia - 1;

  // Se é edição e mudou de categoria ou dia, zerar o antigo
  if (editIdx >= 0 && editTipoKey) {
    if (editIdx !== idx || editTipoKey !== categoria) {
      fc[editTipoKey][editIdx] = 0;
    }
  }

  // Se é novo lançamento, somar; se é edição no mesmo dia/categoria, substituir
  if (editIdx >= 0 && editIdx === idx && editTipoKey === categoria) {
    fc[categoria][idx] = valor;
  } else if (editIdx >= 0) {
    // mudou dia ou categoria
    fc[categoria][idx] += valor;
  } else {
    // novo
    fc[categoria][idx] += valor;
  }

  saveData();
  closeCadastroModal();
  showToast(editIdx >= 0 ? 'Lançamento atualizado!' : 'Lançamento adicionado!', 'success');

  // Re-renderizar a página do mês
  const page = mesKey;
  renderFluxoMes(page);
}

function editFluxoLancamento(mesKey, idx, tipoKey, dias) {
  openFluxoModal(mesKey, dias, idx, tipoKey);
}

function deleteFluxoLancamento(mesKey, idx, tipoKey, page) {
  if (!confirm('Deseja excluir este lançamento?')) return;
  const fc = appData.fluxoCaixa[mesKey];
  if (fc && fc[tipoKey]) {
    fc[tipoKey][idx] = 0;
    saveData();
    showToast('Lançamento excluído!', 'success');
    renderFluxoMes(page);
  }
}

// ==========================================
// PARTE 5 — COMPRAS, VENDAS, ESTOQUE
// ==========================================

// ============ COMPRAS ============
function renderCompras() {
  const pageEl = document.getElementById('page-compras');
  if (!pageEl) return;

  const compras = appData.compras || [];
  const totalGeral = compras.reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);
  const totalPago = compras.filter(c => c.situacao==='Pago').reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);
  const totalDevendo = compras.filter(c => c.situacao==='Devendo').reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);
  const totalGuardado = compras.filter(c => c.situacao==='Guardado').reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);
  const qtdTotal = compras.length;

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Compras</h2>
      <button class="btn btn-primary" onclick="openCompraModal()"><span>+</span> Nova Compra</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">🛒</span><span>Total Compras</span></div>
        <div class="card-value">${formatCurrency(totalGeral)}</div>
        <small>${qtdTotal} registros</small>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">✅</span><span>Pago</span></div>
        <div class="card-value text-success">${formatCurrency(totalPago)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">⚠️</span><span>Devendo</span></div>
        <div class="card-value text-danger">${formatCurrency(totalDevendo)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📦</span><span>Guardado</span></div>
        <div class="card-value text-warning">${formatCurrency(totalGuardado)}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroComprasBusca" class="form-control" placeholder="Buscar produto, fornecedor..." oninput="filtrarCompras()" style="max-width:280px">
      <input type="date" id="filtroComprasDataIni" class="form-control" style="max-width:170px" onchange="filtrarCompras()">
      <input type="date" id="filtroComprasDataFim" class="form-control" style="max-width:170px" onchange="filtrarCompras()">
      <select id="filtroComprasSit" class="form-control" style="max-width:150px" onchange="filtrarCompras()">
        <option value="">Todas Situações</option>
        ${(appData.situacaoCompra||[]).map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select id="filtroComprasForn" class="form-control" style="max-width:180px" onchange="filtrarCompras()">
        <option value="">Todos Fornecedores</option>
        ${[...new Set(compras.map(c=>c.fornecedor))].sort().map(f => `<option value="${f}">${f}</option>`).join('')}
      </select>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Vencimento</th>
            <th>Produto</th>
            <th>Qtd</th>
            <th>V. Unit</th>
            <th>Total</th>
            <th>Fornecedor</th>
            <th>Pagamento</th>
            <th>Situação</th>
            <th>Entrega</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="comprasBody"></tbody>
      </table>
    </div>
  `;

  filtrarCompras();
}

function filtrarCompras() {
  const busca = (document.getElementById('filtroComprasBusca')?.value || '').toLowerCase();
  const dataIni = document.getElementById('filtroComprasDataIni')?.value || '';
  const dataFim = document.getElementById('filtroComprasDataFim')?.value || '';
  const sit = document.getElementById('filtroComprasSit')?.value || '';
  const forn = document.getElementById('filtroComprasForn')?.value || '';

  let lista = [...(appData.compras || [])];

  if (busca) {
    lista = lista.filter(c =>
      (c.produto||'').toLowerCase().includes(busca) ||
      (c.fornecedor||'').toLowerCase().includes(busca) ||
      (c.formaPagamento||'').toLowerCase().includes(busca) ||
      (c.obs||'').toLowerCase().includes(busca)
    );
  }
  if (dataIni) lista = lista.filter(c => c.data >= dataIni);
  if (dataFim) lista = lista.filter(c => c.data <= dataFim);
  if (sit) lista = lista.filter(c => c.situacao === sit);
  if (forn) lista = lista.filter(c => c.fornecedor === forn);

  lista.sort((a,b) => (b.data||'').localeCompare(a.data||''));

  const tbody = document.getElementById('comprasBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhuma compra encontrada</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(c => {
    const total = c.quantidade * c.valorUnit;
    const diasVenc = getDiasEntreHoje(c.vencimento);
    let badgeSit = 'badge-warning';
    if (c.situacao === 'Pago') badgeSit = 'badge-success';
    else if (c.situacao === 'Devendo') badgeSit = 'badge-danger';

    let badgeEntrega = 'badge-warning';
    if (c.entrega === 'Entregue OK') badgeEntrega = 'badge-success';
    else if (c.entrega === 'Entregue com Defeito') badgeEntrega = 'badge-danger';
    else if (c.entrega === 'Não Entregue') badgeEntrega = 'badge-danger';

    return `<tr>
      <td>${formatDate(c.data)}</td>
      <td>${formatDate(c.vencimento)} ${c.situacao!=='Pago' && diasVenc <= 3 && diasVenc >= 0 ? '<span class="badge badge-danger" style="font-size:10px;margin-left:4px">VENCE BREVE</span>' : ''}</td>
      <td><strong>${c.produto}</strong></td>
      <td>${c.quantidade}</td>
      <td>${formatCurrency(c.valorUnit)}</td>
      <td><strong>${formatCurrency(total)}</strong></td>
      <td>${c.fornecedor}</td>
      <td>${c.formaPagamento}</td>
      <td><span class="badge ${badgeSit}">${c.situacao}</span></td>
      <td><span class="badge ${badgeEntrega}">${c.entrega}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editCompra(${c.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCompra(${c.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openCompraModal(compra) {
  const isEdit = !!compra;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Compra' : 'Nova Compra';

  const fornecedores = (appData.fornecedores||[]).map(f => f.nome).sort();
  const formas = appData.formasPagamento || [];
  const situacoes = appData.situacaoCompra || [];
  const entregas = appData.situacaoEntrega || [];

  modalBody.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Data *</label>
        <input type="date" id="compraData" class="form-control" value="${isEdit ? compra.data : new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Vencimento</label>
        <input type="date" id="compraVencimento" class="form-control" value="${isEdit ? compra.vencimento : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Produto *</label>
      <input type="text" id="compraProduto" class="form-control" value="${isEdit ? compra.produto : ''}" placeholder="Nome do produto">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Quantidade *</label>
        <input type="number" id="compraQtd" class="form-control" min="1" step="1" value="${isEdit ? compra.quantidade : 1}">
      </div>
      <div class="form-group">
        <label>Valor Unitário *</label>
        <input type="number" id="compraValorUnit" class="form-control" min="0" step="0.01" value="${isEdit ? compra.valorUnit : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Fornecedor *</label>
      <select id="compraFornecedor" class="form-control">
        <option value="">Selecione...</option>
        ${fornecedores.map(f => `<option value="${f}" ${isEdit && compra.fornecedor===f ? 'selected' : ''}>${f}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Forma de Pagamento</label>
        <select id="compraForma" class="form-control">
          <option value="">Selecione...</option>
          ${formas.map(f => `<option value="${f}" ${isEdit && compra.formaPagamento===f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Situação</label>
        <select id="compraSituacao" class="form-control">
          ${situacoes.map(s => `<option value="${s}" ${isEdit && compra.situacao===s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Entrega</label>
      <select id="compraEntrega" class="form-control">
        ${entregas.map(e => `<option value="${e}" ${isEdit && compra.entrega===e ? 'selected' : ''}>${e}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="compraObs" class="form-control" rows="2">${isEdit ? (compra.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveCompra(${isEdit ? compra.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveCompra(editId) {
  const data = document.getElementById('compraData').value;
  const vencimento = document.getElementById('compraVencimento').value;
  const produto = document.getElementById('compraProduto').value.trim();
  const quantidade = parseInt(document.getElementById('compraQtd').value) || 0;
  const valorUnit = parseFloat(document.getElementById('compraValorUnit').value) || 0;
  const fornecedor = document.getElementById('compraFornecedor').value;
  const formaPagamento = document.getElementById('compraForma').value;
  const situacao = document.getElementById('compraSituacao').value;
  const entrega = document.getElementById('compraEntrega').value;
  const obs = document.getElementById('compraObs').value.trim();

  if (!data || !produto || quantidade <= 0 || valorUnit <= 0 || !fornecedor) {
    showToast('Preencha os campos obrigatórios (Data, Produto, Qtd, Valor, Fornecedor)', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.compras.findIndex(c => c.id === editId);
    if (idx >= 0) {
      appData.compras[idx] = { ...appData.compras[idx], data, vencimento, produto, quantidade, valorUnit, fornecedor, formaPagamento, situacao, entrega, obs };
    }
  } else {
    appData.compras.push({
      id: nextId(appData.compras),
      data, vencimento, produto, quantidade, valorUnit, fornecedor, formaPagamento, situacao, entrega, obs
    });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Compra atualizada!' : 'Compra adicionada!', 'success');
  renderCompras();
}

function editCompra(id) {
  const compra = appData.compras.find(c => c.id === id);
  if (compra) openCompraModal(compra);
}

function deleteCompra(id) {
  if (!confirm('Deseja excluir esta compra?')) return;
  appData.compras = appData.compras.filter(c => c.id !== id);
  saveData();
  showToast('Compra excluída!', 'success');
  renderCompras();
}

// ============ VENDAS ============
function renderVendas() {
  const pageEl = document.getElementById('page-vendas');
  if (!pageEl) return;

  const vendas = appData.vendas || [];
  const totalGeral = vendas.reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
  const totalPago = vendas.filter(v => v.situacao==='Pago').reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
  const totalDevendo = vendas.filter(v => v.situacao==='Devendo').reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
  const vendasWander = vendas.filter(v => v.vendedor==='Wander').reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
  const vendasDaniel = vendas.filter(v => v.vendedor==='Daniel').reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Vendas</h2>
      <button class="btn btn-primary" onclick="openVendaModal()"><span>+</span> Nova Venda</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">🏷️</span><span>Total Vendas</span></div>
        <div class="card-value">${formatCurrency(totalGeral)}</div>
        <small>${vendas.length} registros</small>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">✅</span><span>Recebido</span></div>
        <div class="card-value text-success">${formatCurrency(totalPago)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">⚠️</span><span>A Receber</span></div>
        <div class="card-value text-danger">${formatCurrency(totalDevendo)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">👤</span><span>Wander</span></div>
        <div class="card-value">${formatCurrency(vendasWander)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">👤</span><span>Daniel</span></div>
        <div class="card-value">${formatCurrency(vendasDaniel)}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroVendasBusca" class="form-control" placeholder="Buscar cliente, produto..." oninput="filtrarVendas()" style="max-width:280px">
      <input type="date" id="filtroVendasDataIni" class="form-control" style="max-width:170px" onchange="filtrarVendas()">
      <input type="date" id="filtroVendasDataFim" class="form-control" style="max-width:170px" onchange="filtrarVendas()">
      <select id="filtroVendasSit" class="form-control" style="max-width:150px" onchange="filtrarVendas()">
        <option value="">Todas Situações</option>
        <option value="Pago">Pago</option>
        <option value="Devendo">Devendo</option>
      </select>
      <select id="filtroVendasVendedor" class="form-control" style="max-width:150px" onchange="filtrarVendas()">
        <option value="">Todos Vendedores</option>
        ${(appData.vendedores||[]).map(v => `<option value="${v}">${v}</option>`).join('')}
      </select>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Qtd</th>
            <th>V. Unit</th>
            <th>Total</th>
            <th>Vendedor</th>
            <th>Pagamento</th>
            <th>Tipo</th>
            <th>Situação</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="vendasBody"></tbody>
      </table>
    </div>
  `;

  filtrarVendas();
}

function filtrarVendas() {
  const busca = (document.getElementById('filtroVendasBusca')?.value || '').toLowerCase();
  const dataIni = document.getElementById('filtroVendasDataIni')?.value || '';
  const dataFim = document.getElementById('filtroVendasDataFim')?.value || '';
  const sit = document.getElementById('filtroVendasSit')?.value || '';
  const vendedor = document.getElementById('filtroVendasVendedor')?.value || '';

  let lista = [...(appData.vendas || [])];

  if (busca) {
    lista = lista.filter(v =>
      (v.cliente||'').toLowerCase().includes(busca) ||
      (v.produto||'').toLowerCase().includes(busca) ||
      (v.vendedor||'').toLowerCase().includes(busca) ||
      (v.obs||'').toLowerCase().includes(busca)
    );
  }
  if (dataIni) lista = lista.filter(v => v.data >= dataIni);
  if (dataFim) lista = lista.filter(v => v.data <= dataFim);
  if (sit) lista = lista.filter(v => v.situacao === sit);
  if (vendedor) lista = lista.filter(v => v.vendedor === vendedor);

  lista.sort((a,b) => (b.data||'').localeCompare(a.data||''));

  const tbody = document.getElementById('vendasBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhuma venda encontrada</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(v => {
    const total = v.quantidade * v.valorUnit;
    return `<tr>
      <td>${formatDate(v.data)}</td>
      <td><strong>${v.cliente}</strong></td>
      <td>${v.produto}</td>
      <td>${v.quantidade}</td>
      <td>${formatCurrency(v.valorUnit)}</td>
      <td><strong>${formatCurrency(total)}</strong></td>
      <td>${v.vendedor}</td>
      <td>${v.formaPagamento}</td>
      <td><span class="badge badge-info">${v.tipo}</span></td>
      <td><span class="badge ${v.situacao==='Pago'?'badge-success':'badge-danger'}">${v.situacao}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editVenda(${v.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteVenda(${v.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openVendaModal(venda) {
  const isEdit = !!venda;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Venda' : 'Nova Venda';

  const clientes = (appData.clientes||[]).map(c => c.nome).sort();
  const vendedores = appData.vendedores || [];
  const formas = appData.formasPagamento || [];
  const tipos = appData.tipoVenda || [];

  modalBody.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Data *</label>
        <input type="date" id="vendaData" class="form-control" value="${isEdit ? venda.data : new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Cliente *</label>
        <select id="vendaCliente" class="form-control">
          <option value="">Selecione...</option>
          ${clientes.map(c => `<option value="${c}" ${isEdit && venda.cliente===c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Produto *</label>
      <input type="text" id="vendaProduto" class="form-control" value="${isEdit ? venda.produto : ''}" placeholder="Descrição do produto/serviço">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Quantidade *</label>
        <input type="number" id="vendaQtd" class="form-control" min="1" step="1" value="${isEdit ? venda.quantidade : 1}">
      </div>
      <div class="form-group">
        <label>Valor Unitário *</label>
        <input type="number" id="vendaValorUnit" class="form-control" min="0" step="0.01" value="${isEdit ? venda.valorUnit : ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Vendedor</label>
        <select id="vendaVendedor" class="form-control">
          <option value="">Selecione...</option>
          ${vendedores.map(v => `<option value="${v}" ${isEdit && venda.vendedor===v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Forma de Pagamento</label>
        <select id="vendaForma" class="form-control">
          <option value="">Selecione...</option>
          ${formas.map(f => `<option value="${f}" ${isEdit && venda.formaPagamento===f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Tipo</label>
        <select id="vendaTipo" class="form-control">
          ${tipos.map(t => `<option value="${t}" ${isEdit && venda.tipo===t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Situação</label>
        <select id="vendaSituacao" class="form-control">
          <option value="Pago" ${isEdit && venda.situacao==='Pago' ? 'selected' : ''}>Pago</option>
          <option value="Devendo" ${isEdit && venda.situacao==='Devendo' ? 'selected' : ''}>Devendo</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="vendaObs" class="form-control" rows="2">${isEdit ? (venda.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveVenda(${isEdit ? venda.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveVenda(editId) {
  const data = document.getElementById('vendaData').value;
  const cliente = document.getElementById('vendaCliente').value;
  const produto = document.getElementById('vendaProduto').value.trim();
  const quantidade = parseInt(document.getElementById('vendaQtd').value) || 0;
  const valorUnit = parseFloat(document.getElementById('vendaValorUnit').value) || 0;
  const vendedor = document.getElementById('vendaVendedor').value;
  const formaPagamento = document.getElementById('vendaForma').value;
  const tipo = document.getElementById('vendaTipo').value;
  const situacao = document.getElementById('vendaSituacao').value;
  const obs = document.getElementById('vendaObs').value.trim();

  if (!data || !cliente || !produto || quantidade <= 0 || valorUnit <= 0) {
    showToast('Preencha os campos obrigatórios (Data, Cliente, Produto, Qtd, Valor)', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.vendas.findIndex(v => v.id === editId);
    if (idx >= 0) {
      appData.vendas[idx] = { ...appData.vendas[idx], data, cliente, produto, quantidade, valorUnit, vendedor, formaPagamento, tipo, situacao, obs };
    }
  } else {
    appData.vendas.push({
      id: nextId(appData.vendas),
      data, cliente, produto, quantidade, valorUnit, vendedor, formaPagamento, tipo, situacao, obs
    });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Venda atualizada!' : 'Venda adicionada!', 'success');
  renderVendas();
}

function editVenda(id) {
  const venda = appData.vendas.find(v => v.id === id);
  if (venda) openVendaModal(venda);
}

function deleteVenda(id) {
  if (!confirm('Deseja excluir esta venda?')) return;
  appData.vendas = appData.vendas.filter(v => v.id !== id);
  saveData();
  showToast('Venda excluída!', 'success');
  renderVendas();
}

// ============ ESTOQUE ============
function renderEstoque() {
  const pageEl = document.getElementById('page-estoque');
  if (!pageEl) return;

  // Calcular estoque a partir de compras e vendas
  const produtosMap = {};

  (appData.compras || []).forEach(c => {
    const key = c.produto;
    if (!produtosMap[key]) produtosMap[key] = { produto: key, qtdComprada: 0, valorCompra: 0, qtdVendida: 0, valorVenda: 0 };
    produtosMap[key].qtdComprada += c.quantidade;
    produtosMap[key].valorCompra += c.quantidade * c.valorUnit;
  });

  (appData.vendas || []).forEach(v => {
    const key = v.produto;
    if (!produtosMap[key]) produtosMap[key] = { produto: key, qtdComprada: 0, valorCompra: 0, qtdVendida: 0, valorVenda: 0 };
    produtosMap[key].qtdVendida += v.quantidade;
    produtosMap[key].valorVenda += v.quantidade * v.valorUnit;
  });

  let estoqueItems = Object.values(produtosMap).map(p => ({
    ...p,
    saldo: p.qtdComprada - p.qtdVendida,
    lucro: p.valorVenda - p.valorCompra
  }));

  const totalCompra = estoqueItems.reduce((s,e) => s + e.valorCompra, 0);
  const totalVenda = estoqueItems.reduce((s,e) => s + e.valorVenda, 0);
  const lucroTotal = totalVenda - totalCompra;
  const valorEstoque = estoqueItems.filter(e => e.saldo > 0).reduce((s,e) => {
    const custoMedio = e.qtdComprada > 0 ? e.valorCompra / e.qtdComprada : 0;
    return s + (e.saldo * custoMedio);
  }, 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Estoque</h2>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">🛒</span><span>Total Compras</span></div>
        <div class="card-value">${formatCurrency(totalCompra)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">🏷️</span><span>Total Vendas</span></div>
        <div class="card-value">${formatCurrency(totalVenda)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📊</span><span>Lucro</span></div>
        <div class="card-value ${lucroTotal >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(lucroTotal)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📦</span><span>Valor em Estoque</span></div>
        <div class="card-value text-warning">${formatCurrency(valorEstoque)}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroEstoqueBusca" class="form-control" placeholder="Buscar produto..." oninput="filtrarEstoque()" style="max-width:300px">
      <select id="filtroEstoqueSaldo" class="form-control" style="max-width:180px" onchange="filtrarEstoque()">
        <option value="">Todos</option>
        <option value="positivo">Com Saldo > 0</option>
        <option value="zerado">Saldo Zerado</option>
        <option value="negativo">Saldo Negativo</option>
      </select>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtd Comprada</th>
            <th>Qtd Vendida</th>
            <th>Saldo</th>
            <th>Valor Compra</th>
            <th>Valor Venda</th>
            <th>Lucro</th>
          </tr>
        </thead>
        <tbody id="estoqueBody"></tbody>
      </table>
    </div>
  `;

  // Guardar referência para filtro
  window._estoqueItems = estoqueItems;
  filtrarEstoque();
}

function filtrarEstoque() {
  const busca = (document.getElementById('filtroEstoqueBusca')?.value || '').toLowerCase();
  const saldoFiltro = document.getElementById('filtroEstoqueSaldo')?.value || '';

  let lista = [...(window._estoqueItems || [])];

  if (busca) {
    lista = lista.filter(e => e.produto.toLowerCase().includes(busca));
  }
  if (saldoFiltro === 'positivo') lista = lista.filter(e => e.saldo > 0);
  else if (saldoFiltro === 'zerado') lista = lista.filter(e => e.saldo === 0);
  else if (saldoFiltro === 'negativo') lista = lista.filter(e => e.saldo < 0);

  lista.sort((a,b) => b.saldo - a.saldo);

  const tbody = document.getElementById('estoqueBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum item encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(e => {
    let saldoClass = '';
    if (e.saldo > 0) saldoClass = 'text-success';
    else if (e.saldo < 0) saldoClass = 'text-danger';
    else saldoClass = 'text-muted';

    return `<tr>
      <td><strong>${e.produto}</strong></td>
      <td>${e.qtdComprada}</td>
      <td>${e.qtdVendida}</td>
      <td class="${saldoClass}"><strong>${e.saldo}</strong></td>
      <td>${formatCurrency(e.valorCompra)}</td>
      <td>${formatCurrency(e.valorVenda)}</td>
      <td class="${e.lucro >= 0 ? 'text-success' : 'text-danger'}"><strong>${formatCurrency(e.lucro)}</strong></td>
    </tr>`;
  }).join('');
}

// ==========================================
// PARTE 6 — CADASTROS (Clientes, Fornecedores, Produtos, P.Fornecedores)
// ==========================================

// ============ CLIENTES ============
function renderClientes() {
  const pageEl = document.getElementById('page-clientes');
  if (!pageEl) return;

  const clientes = appData.clientes || [];

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Clientes</h2>
      <button class="btn btn-primary" onclick="openClienteModal()"><span>+</span> Novo Cliente</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">👥</span><span>Total Clientes</span></div>
        <div class="card-value">${clientes.length}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroClientesBusca" class="form-control" placeholder="Buscar nome, cidade, CPF/CNPJ..." oninput="filtrarClientes()" style="max-width:350px">
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th></th>
            <th>Nome</th>
            <th>CPF/CNPJ</th>
            <th>Telefone</th>
            <th>Cidade</th>
            <th>Estado</th>
            <th style="width:150px">Ações</th>
          </tr>
        </thead>
        <tbody id="clientesBody"></tbody>
      </table>
    </div>
  `;

  filtrarClientes();
}

function filtrarClientes() {
  const busca = (document.getElementById('filtroClientesBusca')?.value || '').toLowerCase();
  let lista = [...(appData.clientes || [])];

  if (busca) {
    lista = lista.filter(c =>
      (c.nome||'').toLowerCase().includes(busca) ||
      (c.cpfCnpj||'').toLowerCase().includes(busca) ||
      (c.cidade||'').toLowerCase().includes(busca) ||
      (c.telefone||'').toLowerCase().includes(busca) ||
      (c.email||'').toLowerCase().includes(busca)
    );
  }

  lista.sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

  const tbody = document.getElementById('clientesBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum cliente encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(c => {
    const avatar = c.img
      ? `<img src="${c.img}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`
      : `<div style="width:36px;height:36px;border-radius:50%;background:var(--accent-primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px">${(c.nome||'?')[0].toUpperCase()}</div>`;

    return `<tr>
      <td>${avatar}</td>
      <td><strong>${c.nome}</strong></td>
      <td>${c.cpfCnpj || '-'}</td>
      <td>${c.telefone || '-'}</td>
      <td>${c.cidade || '-'}</td>
      <td>${c.estado || '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewCliente(${c.id})" title="Ver">👁️</button>
        <button class="btn btn-sm btn-outline" onclick="editCliente(${c.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCliente(${c.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openClienteModal(cliente) {
  const isEdit = !!cliente;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Cliente' : 'Novo Cliente';

  modalBody.innerHTML = `
    <div class="form-group" style="text-align:center">
      <div id="clienteImgPreview" style="width:80px;height:80px;border-radius:50%;background:var(--bg-tertiary);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;overflow:hidden">
        ${isEdit && cliente.img ? `<img src="${cliente.img}" style="width:100%;height:100%;object-fit:cover">` : '<span style="color:var(--text-muted);font-size:24px">👤</span>'}
      </div>
      <label class="btn btn-sm btn-outline" style="cursor:pointer">
        📷 Foto
        <input type="file" id="clienteImgInput" accept="image/*" onchange="handleCadastroImage('clienteImgInput','clienteImgPreview')" style="display:none">
      </label>
    </div>
    <div class="form-group">
      <label>Nome *</label>
      <input type="text" id="clienteNome" class="form-control" value="${isEdit ? cliente.nome : ''}" placeholder="Nome completo">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>CPF/CNPJ</label>
        <input type="text" id="clienteCpfCnpj" class="form-control" value="${isEdit ? (cliente.cpfCnpj||'') : ''}" placeholder="000.000.000-00">
      </div>
      <div class="form-group">
        <label>Telefone</label>
        <input type="text" id="clienteTelefone" class="form-control" value="${isEdit ? (cliente.telefone||'') : ''}" placeholder="(00) 00000-0000">
      </div>
    </div>
    <div class="form-group">
      <label>E-mail</label>
      <input type="email" id="clienteEmail" class="form-control" value="${isEdit ? (cliente.email||'') : ''}" placeholder="email@exemplo.com">
    </div>
    <div class="form-group">
      <label>Endereço</label>
      <input type="text" id="clienteEndereco" class="form-control" value="${isEdit ? (cliente.endereco||'') : ''}" placeholder="Rua, número, bairro">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Cidade</label>
        <input type="text" id="clienteCidade" class="form-control" value="${isEdit ? (cliente.cidade||'') : ''}">
      </div>
      <div class="form-group">
        <label>Estado</label>
        <input type="text" id="clienteEstado" class="form-control" value="${isEdit ? (cliente.estado||'') : ''}" maxlength="2" placeholder="MG">
      </div>
      <div class="form-group">
        <label>CEP</label>
        <input type="text" id="clienteCep" class="form-control" value="${isEdit ? (cliente.cep||'') : ''}" placeholder="00000-000">
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="clienteObs" class="form-control" rows="2">${isEdit ? (cliente.obs||'') : ''}</textarea>
    </div>
  `;

  // Guardar imagem temporária
  window._tempCadastroImg = isEdit ? (cliente.img || '') : '';

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveCliente(${isEdit ? cliente.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function handleCadastroImage(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !input.files || !input.files[0]) return;

  const file = input.files[0];
  if (file.size > 500 * 1024) {
    showToast('Imagem deve ter no máximo 500 KB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    window._tempCadastroImg = e.target.result;
    preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover">`;
  };
  reader.readAsDataURL(file);
}

function saveCliente(editId) {
  const nome = document.getElementById('clienteNome').value.trim();
  const cpfCnpj = document.getElementById('clienteCpfCnpj').value.trim();
  const telefone = document.getElementById('clienteTelefone').value.trim();
  const email = document.getElementById('clienteEmail').value.trim();
  const endereco = document.getElementById('clienteEndereco').value.trim();
  const cidade = document.getElementById('clienteCidade').value.trim();
  const estado = document.getElementById('clienteEstado').value.trim();
  const cep = document.getElementById('clienteCep').value.trim();
  const obs = document.getElementById('clienteObs').value.trim();
  const img = window._tempCadastroImg || '';

  if (!nome) {
    showToast('Informe o nome do cliente', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.clientes.findIndex(c => c.id === editId);
    if (idx >= 0) {
      appData.clientes[idx] = { ...appData.clientes[idx], nome, cpfCnpj, telefone, email, endereco, cidade, estado, cep, obs, img };
    }
  } else {
    appData.clientes.push({
      id: nextId(appData.clientes),
      nome, cpfCnpj, telefone, email, endereco, cidade, estado, cep, obs, img
    });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Cliente atualizado!' : 'Cliente adicionado!', 'success');
  renderClientes();
}

function editCliente(id) {
  const cliente = appData.clientes.find(c => c.id === id);
  if (cliente) openClienteModal(cliente);
}

function deleteCliente(id) {
  if (!confirm('Deseja excluir este cliente?')) return;
  appData.clientes = appData.clientes.filter(c => c.id !== id);
  saveData();
  showToast('Cliente excluído!', 'success');
  renderClientes();
}

function viewCliente(id) {
  const c = appData.clientes.find(cl => cl.id === id);
  if (!c) return;

  // Calcular vendas do cliente
  const vendasCliente = (appData.vendas||[]).filter(v => v.cliente === c.nome);
  const totalVendas = vendasCliente.reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);

  const modal = document.getElementById('viewModal');
  const modalTitle = document.getElementById('viewModalTitle');
  const modalBody = document.getElementById('viewModalBody');

  modalTitle.textContent = c.nome;
  modalBody.innerHTML = `
    <div style="text-align:center;margin-bottom:16px">
      ${c.img ? `<img src="${c.img}" style="width:80px;height:80px;border-radius:50%;object-fit:cover">` : `<div style="width:80px;height:80px;border-radius:50%;background:var(--accent-primary);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:28px">${(c.nome||'?')[0].toUpperCase()}</div>`}
    </div>
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">CPF/CNPJ</span><span>${c.cpfCnpj || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Telefone</span><span>${c.telefone || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">E-mail</span><span>${c.email || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Endereço</span><span>${c.endereco || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Cidade</span><span>${c.cidade || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Estado</span><span>${c.estado || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">CEP</span><span>${c.cep || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Total em Vendas</span><span class="text-success"><strong>${formatCurrency(totalVendas)}</strong></span></div>
      <div class="detail-item"><span class="detail-label">Nº Vendas</span><span>${vendasCliente.length}</span></div>
      <div class="detail-item"><span class="detail-label">Obs</span><span>${c.obs || '-'}</span></div>
    </div>
  `;

  modal.style.display = 'flex';
}

// ============ FORNECEDORES ============
function renderFornecedores() {
  const pageEl = document.getElementById('page-fornecedores');
  if (!pageEl) return;

  const fornecedores = appData.fornecedores || [];

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Fornecedores</h2>
      <button class="btn btn-primary" onclick="openFornecedorModal()"><span>+</span> Novo Fornecedor</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">🏭</span><span>Total Fornecedores</span></div>
        <div class="card-value">${fornecedores.length}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroFornBusca" class="form-control" placeholder="Buscar nome, cidade, CNPJ..." oninput="filtrarFornecedores()" style="max-width:350px">
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th></th>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Telefone</th>
            <th>Cidade</th>
            <th>Estado</th>
            <th style="width:150px">Ações</th>
          </tr>
        </thead>
        <tbody id="fornecedoresBody"></tbody>
      </table>
    </div>
  `;

  filtrarFornecedores();
}

function filtrarFornecedores() {
  const busca = (document.getElementById('filtroFornBusca')?.value || '').toLowerCase();
  let lista = [...(appData.fornecedores || [])];

  if (busca) {
    lista = lista.filter(f =>
      (f.nome||'').toLowerCase().includes(busca) ||
      (f.cpfCnpj||'').toLowerCase().includes(busca) ||
      (f.cidade||'').toLowerCase().includes(busca) ||
      (f.telefone||'').toLowerCase().includes(busca)
    );
  }

  lista.sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

  const tbody = document.getElementById('fornecedoresBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum fornecedor encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(f => {
    const avatar = f.img
      ? `<img src="${f.img}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`
      : `<div style="width:36px;height:36px;border-radius:50%;background:var(--accent-secondary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px">${(f.nome||'?')[0].toUpperCase()}</div>`;

    return `<tr>
      <td>${avatar}</td>
      <td><strong>${f.nome}</strong></td>
      <td>${f.cpfCnpj || '-'}</td>
      <td>${f.telefone || '-'}</td>
      <td>${f.cidade || '-'}</td>
      <td>${f.estado || '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewFornecedor(${f.id})" title="Ver">👁️</button>
        <button class="btn btn-sm btn-outline" onclick="editFornecedor(${f.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteFornecedor(${f.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openFornecedorModal(fornecedor) {
  const isEdit = !!fornecedor;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor';

  modalBody.innerHTML = `
    <div class="form-group" style="text-align:center">
      <div id="fornImgPreview" style="width:80px;height:80px;border-radius:50%;background:var(--bg-tertiary);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;overflow:hidden">
        ${isEdit && fornecedor.img ? `<img src="${fornecedor.img}" style="width:100%;height:100%;object-fit:cover">` : '<span style="color:var(--text-muted);font-size:24px">🏭</span>'}
      </div>
      <label class="btn btn-sm btn-outline" style="cursor:pointer">
        📷 Foto
        <input type="file" id="fornImgInput" accept="image/*" onchange="handleCadastroImage('fornImgInput','fornImgPreview')" style="display:none">
      </label>
    </div>
    <div class="form-group">
      <label>Nome *</label>
      <input type="text" id="fornNome" class="form-control" value="${isEdit ? fornecedor.nome : ''}" placeholder="Nome/Razão Social">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>CNPJ</label>
        <input type="text" id="fornCpfCnpj" class="form-control" value="${isEdit ? (fornecedor.cpfCnpj||'') : ''}" placeholder="00.000.000/0001-00">
      </div>
      <div class="form-group">
        <label>Telefone</label>
        <input type="text" id="fornTelefone" class="form-control" value="${isEdit ? (fornecedor.telefone||'') : ''}" placeholder="(00) 00000-0000">
      </div>
    </div>
    <div class="form-group">
      <label>E-mail</label>
      <input type="email" id="fornEmail" class="form-control" value="${isEdit ? (fornecedor.email||'') : ''}" placeholder="contato@empresa.com">
    </div>
    <div class="form-group">
      <label>Endereço</label>
      <input type="text" id="fornEndereco" class="form-control" value="${isEdit ? (fornecedor.endereco||'') : ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Cidade</label>
        <input type="text" id="fornCidade" class="form-control" value="${isEdit ? (fornecedor.cidade||'') : ''}">
      </div>
      <div class="form-group">
        <label>Estado</label>
        <input type="text" id="fornEstado" class="form-control" value="${isEdit ? (fornecedor.estado||'') : ''}" maxlength="2" placeholder="MG">
      </div>
      <div class="form-group">
        <label>CEP</label>
        <input type="text" id="fornCep" class="form-control" value="${isEdit ? (fornecedor.cep||'') : ''}" placeholder="00000-000">
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="fornObs" class="form-control" rows="2">${isEdit ? (fornecedor.obs||'') : ''}</textarea>
    </div>
  `;

  window._tempCadastroImg = isEdit ? (fornecedor.img || '') : '';

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveFornecedor(${isEdit ? fornecedor.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveFornecedor(editId) {
  const nome = document.getElementById('fornNome').value.trim();
  const cpfCnpj = document.getElementById('fornCpfCnpj').value.trim();
  const telefone = document.getElementById('fornTelefone').value.trim();
  const email = document.getElementById('fornEmail').value.trim();
  const endereco = document.getElementById('fornEndereco').value.trim();
  const cidade = document.getElementById('fornCidade').value.trim();
  const estado = document.getElementById('fornEstado').value.trim();
  const cep = document.getElementById('fornCep').value.trim();
  const obs = document.getElementById('fornObs').value.trim();
  const img = window._tempCadastroImg || '';

  if (!nome) {
    showToast('Informe o nome do fornecedor', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.fornecedores.findIndex(f => f.id === editId);
    if (idx >= 0) {
      appData.fornecedores[idx] = { ...appData.fornecedores[idx], nome, cpfCnpj, telefone, email, endereco, cidade, estado, cep, obs, img };
    }
  } else {
    appData.fornecedores.push({
      id: nextId(appData.fornecedores),
      nome, cpfCnpj, telefone, email, endereco, cidade, estado, cep, obs, img
    });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Fornecedor atualizado!' : 'Fornecedor adicionado!', 'success');
  renderFornecedores();
}

function editFornecedor(id) {
  const f = appData.fornecedores.find(f => f.id === id);
  if (f) openFornecedorModal(f);
}

function deleteFornecedor(id) {
  if (!confirm('Deseja excluir este fornecedor?')) return;
  appData.fornecedores = appData.fornecedores.filter(f => f.id !== id);
  saveData();
  showToast('Fornecedor excluído!', 'success');
  renderFornecedores();
}

function viewFornecedor(id) {
  const f = appData.fornecedores.find(fn => fn.id === id);
  if (!f) return;

  const comprasForn = (appData.compras||[]).filter(c => c.fornecedor === f.nome);
  const totalCompras = comprasForn.reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);

  const modal = document.getElementById('viewModal');
  const modalTitle = document.getElementById('viewModalTitle');
  const modalBody = document.getElementById('viewModalBody');

  modalTitle.textContent = f.nome;
  modalBody.innerHTML = `
    <div style="text-align:center;margin-bottom:16px">
      ${f.img ? `<img src="${f.img}" style="width:80px;height:80px;border-radius:50%;object-fit:cover">` : `<div style="width:80px;height:80px;border-radius:50%;background:var(--accent-secondary);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:28px">${(f.nome||'?')[0].toUpperCase()}</div>`}
    </div>
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">CNPJ</span><span>${f.cpfCnpj || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Telefone</span><span>${f.telefone || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">E-mail</span><span>${f.email || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Endereço</span><span>${f.endereco || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Cidade</span><span>${f.cidade || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Estado</span><span>${f.estado || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">CEP</span><span>${f.cep || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">Total em Compras</span><span class="text-warning"><strong>${formatCurrency(totalCompras)}</strong></span></div>
      <div class="detail-item"><span class="detail-label">Nº Compras</span><span>${comprasForn.length}</span></div>
      <div class="detail-item"><span class="detail-label">Obs</span><span>${f.obs || '-'}</span></div>
    </div>
  `;

  modal.style.display = 'flex';
}

// ============ PRODUTOS ============
function renderProdutos() {
  const pageEl = document.getElementById('page-produtos');
  if (!pageEl) return;

  const produtos = appData.produtos || [];

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Produtos</h2>
      <button class="btn btn-primary" onclick="openProdutoModal()"><span>+</span> Novo Produto</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📦</span><span>Total Produtos</span></div>
        <div class="card-value">${produtos.length}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroProdBusca" class="form-control" placeholder="Buscar produto..." oninput="filtrarProdutos()" style="max-width:350px">
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th></th>
            <th>Nome</th>
            <th>Custo</th>
            <th>Preço Revenda</th>
            <th>Preço Direto</th>
            <th>Unidade</th>
            <th>Margem</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="produtosBody"></tbody>
      </table>
    </div>
  `;

  filtrarProdutos();
}

function filtrarProdutos() {
  const busca = (document.getElementById('filtroProdBusca')?.value || '').toLowerCase();
  let lista = [...(appData.produtos || [])];

  if (busca) {
    lista = lista.filter(p => (p.nome||'').toLowerCase().includes(busca));
  }

  lista.sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

  const tbody = document.getElementById('produtosBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum produto cadastrado</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(p => {
    const margem = p.custo > 0 ? (((p.precoRevenda || p.precoDireto || 0) - p.custo) / p.custo * 100).toFixed(1) : '-';
    const avatar = p.img
      ? `<img src="${p.img}" style="width:36px;height:36px;border-radius:8px;object-fit:cover">`
      : `<div style="width:36px;height:36px;border-radius:8px;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:16px">📦</div>`;

    return `<tr>
      <td>${avatar}</td>
      <td><strong>${p.nome}</strong></td>
      <td>${formatCurrency(p.custo || 0)}</td>
      <td>${formatCurrency(p.precoRevenda || 0)}</td>
      <td>${formatCurrency(p.precoDireto || 0)}</td>
      <td>${p.unidade || '-'}</td>
      <td class="${Number(margem) > 0 ? 'text-success' : ''}">${margem}%</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editProduto(${p.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduto(${p.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openProdutoModal(produto) {
  const isEdit = !!produto;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Produto' : 'Novo Produto';

  const unidades = appData.tipoUnidade || [];

  modalBody.innerHTML = `
    <div class="form-group" style="text-align:center">
      <div id="prodImgPreview" style="width:80px;height:80px;border-radius:12px;background:var(--bg-tertiary);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;overflow:hidden">
        ${isEdit && produto.img ? `<img src="${produto.img}" style="width:100%;height:100%;object-fit:cover">` : '<span style="color:var(--text-muted);font-size:24px">📦</span>'}
      </div>
      <label class="btn btn-sm btn-outline" style="cursor:pointer">
        📷 Foto
        <input type="file" id="prodImgInput" accept="image/*" onchange="handleCadastroImage('prodImgInput','prodImgPreview')" style="display:none">
      </label>
    </div>
    <div class="form-group">
      <label>Nome *</label>
      <input type="text" id="prodNome" class="form-control" value="${isEdit ? produto.nome : ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Custo</label>
        <input type="number" id="prodCusto" class="form-control" step="0.01" min="0" value="${isEdit ? (produto.custo||'') : ''}">
      </div>
      <div class="form-group">
        <label>Preço Revenda</label>
        <input type="number" id="prodPrecoRevenda" class="form-control" step="0.01" min="0" value="${isEdit ? (produto.precoRevenda||'') : ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Preço Direto</label>
        <input type="number" id="prodPrecoDireto" class="form-control" step="0.01" min="0" value="${isEdit ? (produto.precoDireto||'') : ''}">
      </div>
      <div class="form-group">
        <label>Unidade</label>
        <select id="prodUnidade" class="form-control">
          <option value="">Selecione...</option>
          ${unidades.map(u => `<option value="${u}" ${isEdit && produto.unidade===u ? 'selected' : ''}>${u}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="prodObs" class="form-control" rows="2">${isEdit ? (produto.obs||'') : ''}</textarea>
    </div>
  `;

  window._tempCadastroImg = isEdit ? (produto.img || '') : '';

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveProduto(${isEdit ? produto.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveProduto(editId) {
  const nome = document.getElementById('prodNome').value.trim();
  const custo = parseFloat(document.getElementById('prodCusto').value) || 0;
  const precoRevenda = parseFloat(document.getElementById('prodPrecoRevenda').value) || 0;
  const precoDireto = parseFloat(document.getElementById('prodPrecoDireto').value) || 0;
  const unidade = document.getElementById('prodUnidade').value;
  const obs = document.getElementById('prodObs').value.trim();
  const img = window._tempCadastroImg || '';

  if (!nome) {
    showToast('Informe o nome do produto', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.produtos.findIndex(p => p.id === editId);
    if (idx >= 0) {
      appData.produtos[idx] = { ...appData.produtos[idx], nome, custo, precoRevenda, precoDireto, unidade, obs, img };
    }
  } else {
    appData.produtos.push({
      id: nextId(appData.produtos),
      nome, custo, precoRevenda, precoDireto, unidade, obs, img
    });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Produto atualizado!' : 'Produto adicionado!', 'success');
  renderProdutos();
}

function editProduto(id) {
  const p = appData.produtos.find(p => p.id === id);
  if (p) openProdutoModal(p);
}

function deleteProduto(id) {
  if (!confirm('Deseja excluir este produto?')) return;
  appData.produtos = appData.produtos.filter(p => p.id !== id);
  saveData();
  showToast('Produto excluído!', 'success');
  renderProdutos();
}

// ============ PRODUTOS DE FORNECEDORES ============
function renderPFornecedores() {
  const pageEl = document.getElementById('page-pfornecedores');
  if (!pageEl) return;

  const pf = appData.pFornecedores || [];

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Produtos dos Fornecedores</h2>
      <button class="btn btn-primary" onclick="openPFornModal()"><span>+</span> Novo Produto</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📋</span><span>Total Produtos</span></div>
        <div class="card-value">${pf.length}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroPFBusca" class="form-control" placeholder="Buscar produto, fornecedor..." oninput="filtrarPFornecedores()" style="max-width:300px">
      <select id="filtroPFForn" class="form-control" style="max-width:200px" onchange="filtrarPFornecedores()">
        <option value="">Todos Fornecedores</option>
        ${(appData.fornecedores||[]).map(f => f.nome).sort().map(n => `<option value="${n}">${n}</option>`).join('')}
      </select>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Fornecedor</th>
            <th>Preço</th>
            <th>Unidade</th>
            <th>Obs</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="pfBody"></tbody>
      </table>
    </div>
  `;

  filtrarPFornecedores();
}

function filtrarPFornecedores() {
  const busca = (document.getElementById('filtroPFBusca')?.value || '').toLowerCase();
  const forn = document.getElementById('filtroPFForn')?.value || '';

  let lista = [...(appData.pFornecedores || [])];

  if (busca) {
    lista = lista.filter(p =>
      (p.nome||'').toLowerCase().includes(busca) ||
      (p.fornecedor||'').toLowerCase().includes(busca)
    );
  }
  if (forn) lista = lista.filter(p => p.fornecedor === forn);

  lista.sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

  const tbody = document.getElementById('pfBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum produto de fornecedor cadastrado</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(p => `<tr>
    <td><strong>${p.nome}</strong></td>
    <td>${p.fornecedor}</td>
    <td>${formatCurrency(p.preco || 0)}</td>
    <td>${p.unidade || '-'}</td>
    <td>${p.obs || '-'}</td>
    <td>
      <button class="btn btn-sm btn-outline" onclick="editPForn(${p.id})" title="Editar">✏️</button>
      <button class="btn btn-sm btn-danger" onclick="deletePForn(${p.id})" title="Excluir">🗑️</button>
    </td>
  </tr>`).join('');
}

function openPFornModal(pf) {
  const isEdit = !!pf;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Produto do Fornecedor' : 'Novo Produto do Fornecedor';

  const fornecedores = (appData.fornecedores||[]).map(f => f.nome).sort();
  const unidades = appData.tipoUnidade || [];

  modalBody.innerHTML = `
    <div class="form-group">
      <label>Nome do Produto *</label>
      <input type="text" id="pfNome" class="form-control" value="${isEdit ? pf.nome : ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Fornecedor *</label>
        <select id="pfFornecedor" class="form-control">
          <option value="">Selecione...</option>
          ${fornecedores.map(f => `<option value="${f}" ${isEdit && pf.fornecedor===f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Preço</label>
        <input type="number" id="pfPreco" class="form-control" step="0.01" min="0" value="${isEdit ? (pf.preco||'') : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Unidade</label>
      <select id="pfUnidade" class="form-control">
        <option value="">Selecione...</option>
        ${unidades.map(u => `<option value="${u}" ${isEdit && pf.unidade===u ? 'selected' : ''}>${u}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="pfObs" class="form-control" rows="2">${isEdit ? (pf.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePForn(${isEdit ? pf.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function savePForn(editId) {
  const nome = document.getElementById('pfNome').value.trim();
  const fornecedor = document.getElementById('pfFornecedor').value;
  const preco = parseFloat(document.getElementById('pfPreco').value) || 0;
  const unidade = document.getElementById('pfUnidade').value;
  const obs = document.getElementById('pfObs').value.trim();

  if (!nome || !fornecedor) {
    showToast('Informe o nome e o fornecedor', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.pFornecedores.findIndex(p => p.id === editId);
    if (idx >= 0) {
      appData.pFornecedores[idx] = { ...appData.pFornecedores[idx], nome, fornecedor, preco, unidade, obs };
    }
  } else {
    appData.pFornecedores.push({
      id: nextId(appData.pFornecedores),
      nome, fornecedor, preco, unidade, obs
    });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Produto atualizado!' : 'Produto adicionado!', 'success');
  renderPFornecedores();
}

function editPForn(id) {
  const p = appData.pFornecedores.find(p => p.id === id);
  if (p) openPFornModal(p);
}

function deletePForn(id) {
  if (!confirm('Deseja excluir este produto do fornecedor?')) return;
  appData.pFornecedores = appData.pFornecedores.filter(p => p.id !== id);
  saveData();
  showToast('Produto excluído!', 'success');
  renderPFornecedores();
}

// ==========================================
// PARTE 7 — BOLETOS, CHEQUES, PRESTAÇÕES, PROJETOS, PAG.CLIENTES, GARANTIAS
// ==========================================

// ============ BOLETOS ============
function renderBoletos() {
  const pageEl = document.getElementById('page-boletos');
  if (!pageEl) return;

  const boletos = appData.boletos || [];
  const totalGeral = boletos.reduce((s,b) => s + b.valor, 0);
  const totalPago = boletos.filter(b => b.situacao==='Pago').reduce((s,b) => s + b.valor, 0);
  const totalPendente = boletos.filter(b => b.situacao==='Pendente').reduce((s,b) => s + b.valor, 0);
  const totalVencido = boletos.filter(b => b.situacao==='Vencido').reduce((s,b) => s + b.valor, 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Boletos</h2>
      <button class="btn btn-primary" onclick="openBoletoModal()"><span>+</span> Novo Boleto</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📄</span><span>Total Boletos</span></div>
        <div class="card-value">${formatCurrency(totalGeral)}</div>
        <small>${boletos.length} registros</small>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">✅</span><span>Pagos</span></div>
        <div class="card-value text-success">${formatCurrency(totalPago)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">⏳</span><span>Pendentes</span></div>
        <div class="card-value text-warning">${formatCurrency(totalPendente)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">🚨</span><span>Vencidos</span></div>
        <div class="card-value text-danger">${formatCurrency(totalVencido)}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroBoletosBusca" class="form-control" placeholder="Buscar descrição, fornecedor..." oninput="filtrarBoletos()" style="max-width:300px">
      <select id="filtroBoletosStatus" class="form-control" style="max-width:160px" onchange="filtrarBoletos()">
        <option value="">Todas Situações</option>
        ${(appData.situacaoBoleto||['Pago','Pendente','Vencido']).map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <input type="date" id="filtroBoletosDataIni" class="form-control" style="max-width:170px" onchange="filtrarBoletos()">
      <input type="date" id="filtroBoletosDataFim" class="form-control" style="max-width:170px" onchange="filtrarBoletos()">
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Fornecedor</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Dias</th>
            <th>Situação</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="boletosBody"></tbody>
      </table>
    </div>
  `;

  filtrarBoletos();
}

function filtrarBoletos() {
  const busca = (document.getElementById('filtroBoletosBusca')?.value || '').toLowerCase();
  const status = document.getElementById('filtroBoletosStatus')?.value || '';
  const dataIni = document.getElementById('filtroBoletosDataIni')?.value || '';
  const dataFim = document.getElementById('filtroBoletosDataFim')?.value || '';

  let lista = [...(appData.boletos || [])];

  if (busca) {
    lista = lista.filter(b =>
      (b.descricao||'').toLowerCase().includes(busca) ||
      (b.fornecedor||'').toLowerCase().includes(busca)
    );
  }
  if (status) lista = lista.filter(b => b.situacao === status);
  if (dataIni) lista = lista.filter(b => b.vencimento >= dataIni);
  if (dataFim) lista = lista.filter(b => b.vencimento <= dataFim);

  lista.sort((a,b) => (a.vencimento||'').localeCompare(b.vencimento||''));

  const tbody = document.getElementById('boletosBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum boleto encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(b => {
    const dias = getDiasEntreHoje(b.vencimento);
    let diasLabel = '';
    let badgeSit = 'badge-warning';

    if (b.situacao === 'Pago') {
      badgeSit = 'badge-success';
      diasLabel = '-';
    } else if (b.situacao === 'Vencido' || dias < 0) {
      badgeSit = 'badge-danger';
      diasLabel = `<span class="text-danger">${Math.abs(dias)}d atrás</span>`;
    } else if (dias <= 5) {
      badgeSit = 'badge-warning';
      diasLabel = `<span class="text-warning">${dias}d</span>`;
    } else {
      diasLabel = `${dias}d`;
    }

    return `<tr>
      <td><strong>${b.descricao}</strong></td>
      <td>${b.fornecedor || '-'}</td>
      <td><strong>${formatCurrency(b.valor)}</strong></td>
      <td>${formatDate(b.vencimento)}</td>
      <td>${diasLabel}</td>
      <td><span class="badge ${badgeSit}">${b.situacao}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editBoleto(${b.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteBoleto(${b.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openBoletoModal(boleto) {
  const isEdit = !!boleto;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Boleto' : 'Novo Boleto';

  const fornecedores = (appData.fornecedores||[]).map(f => f.nome).sort();
  const situacoes = appData.situacaoBoleto || ['Pago','Pendente','Vencido'];

  modalBody.innerHTML = `
    <div class="form-group">
      <label>Descrição *</label>
      <input type="text" id="boletoDesc" class="form-control" value="${isEdit ? boleto.descricao : ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Fornecedor</label>
        <select id="boletoForn" class="form-control">
          <option value="">Selecione...</option>
          ${fornecedores.map(f => `<option value="${f}" ${isEdit && boleto.fornecedor===f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Valor *</label>
        <input type="number" id="boletoValor" class="form-control" step="0.01" min="0" value="${isEdit ? boleto.valor : ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Vencimento *</label>
        <input type="date" id="boletoVenc" class="form-control" value="${isEdit ? boleto.vencimento : ''}">
      </div>
      <div class="form-group">
        <label>Situação</label>
        <select id="boletoSit" class="form-control">
          ${situacoes.map(s => `<option value="${s}" ${isEdit && boleto.situacao===s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="boletoObs" class="form-control" rows="2">${isEdit ? (boleto.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveBoleto(${isEdit ? boleto.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveBoleto(editId) {
  const descricao = document.getElementById('boletoDesc').value.trim();
  const fornecedor = document.getElementById('boletoForn').value;
  const valor = parseFloat(document.getElementById('boletoValor').value) || 0;
  const vencimento = document.getElementById('boletoVenc').value;
  const situacao = document.getElementById('boletoSit').value;
  const obs = document.getElementById('boletoObs').value.trim();

  if (!descricao || valor <= 0 || !vencimento) {
    showToast('Preencha Descrição, Valor e Vencimento', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.boletos.findIndex(b => b.id === editId);
    if (idx >= 0) {
      appData.boletos[idx] = { ...appData.boletos[idx], descricao, fornecedor, valor, vencimento, situacao, obs };
    }
  } else {
    appData.boletos.push({ id: nextId(appData.boletos), descricao, fornecedor, valor, vencimento, situacao, obs });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Boleto atualizado!' : 'Boleto adicionado!', 'success');
  renderBoletos();
}

function editBoleto(id) {
  const b = appData.boletos.find(b => b.id === id);
  if (b) openBoletoModal(b);
}

function deleteBoleto(id) {
  if (!confirm('Deseja excluir este boleto?')) return;
  appData.boletos = appData.boletos.filter(b => b.id !== id);
  saveData();
  showToast('Boleto excluído!', 'success');
  renderBoletos();
}

// ============ CHEQUES ============
function renderCheques() {
  const pageEl = document.getElementById('page-cheques');
  if (!pageEl) return;

  const cheques = appData.cheques || [];
  const totalGeral = cheques.reduce((s,c) => s + (c.valor||0), 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Cheques</h2>
      <button class="btn btn-primary" onclick="openChequeModal()"><span>+</span> Novo Cheque</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📝</span><span>Total Cheques</span></div>
        <div class="card-value">${formatCurrency(totalGeral)}</div>
        <small>${cheques.length} registros</small>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroChequesBusca" class="form-control" placeholder="Buscar..." oninput="filtrarCheques()" style="max-width:300px">
      <select id="filtroChequesStatus" class="form-control" style="max-width:170px" onchange="filtrarCheques()">
        <option value="">Todas Situações</option>
        ${(appData.situacaoCheque||[]).map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Nº Cheque</th>
            <th>Emitente</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Bom Para</th>
            <th>Situação</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="chequesBody"></tbody>
      </table>
    </div>
  `;

  filtrarCheques();
}

function filtrarCheques() {
  const busca = (document.getElementById('filtroChequesBusca')?.value || '').toLowerCase();
  const status = document.getElementById('filtroChequesStatus')?.value || '';

  let lista = [...(appData.cheques || [])];

  if (busca) {
    lista = lista.filter(c =>
      (c.numero||'').toLowerCase().includes(busca) ||
      (c.emitente||'').toLowerCase().includes(busca)
    );
  }
  if (status) lista = lista.filter(c => c.situacao === status);

  const tbody = document.getElementById('chequesBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum cheque cadastrado</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(c => {
    let badgeSit = 'badge-warning';
    if (c.situacao === 'Compensado') badgeSit = 'badge-success';
    else if (c.situacao === 'Devolvido') badgeSit = 'badge-danger';
    else if (c.situacao === 'Depositado') badgeSit = 'badge-info';
    else if (c.situacao === 'Repassado') badgeSit = 'badge-warning';

    return `<tr>
      <td><strong>${c.numero || '-'}</strong></td>
      <td>${c.emitente || '-'}</td>
      <td><strong>${formatCurrency(c.valor)}</strong></td>
      <td>${formatDate(c.data)}</td>
      <td>${formatDate(c.bomPara)}</td>
      <td><span class="badge ${badgeSit}">${c.situacao}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editCheque(${c.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCheque(${c.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openChequeModal(cheque) {
  const isEdit = !!cheque;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Cheque' : 'Novo Cheque';

  const situacoes = appData.situacaoCheque || [];

  modalBody.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Nº Cheque</label>
        <input type="text" id="chequeNumero" class="form-control" value="${isEdit ? (cheque.numero||'') : ''}">
      </div>
      <div class="form-group">
        <label>Emitente *</label>
        <input type="text" id="chequeEmitente" class="form-control" value="${isEdit ? (cheque.emitente||'') : ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor *</label>
        <input type="number" id="chequeValor" class="form-control" step="0.01" min="0" value="${isEdit ? cheque.valor : ''}">
      </div>
      <div class="form-group">
        <label>Situação</label>
        <select id="chequeSit" class="form-control">
          ${situacoes.map(s => `<option value="${s}" ${isEdit && cheque.situacao===s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Data</label>
        <input type="date" id="chequeData" class="form-control" value="${isEdit ? (cheque.data||'') : new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Bom Para</label>
        <input type="date" id="chequeBomPara" class="form-control" value="${isEdit ? (cheque.bomPara||'') : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="chequeObs" class="form-control" rows="2">${isEdit ? (cheque.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveCheque(${isEdit ? cheque.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveCheque(editId) {
  const numero = document.getElementById('chequeNumero').value.trim();
  const emitente = document.getElementById('chequeEmitente').value.trim();
  const valor = parseFloat(document.getElementById('chequeValor').value) || 0;
  const situacao = document.getElementById('chequeSit').value;
  const data = document.getElementById('chequeData').value;
  const bomPara = document.getElementById('chequeBomPara').value;
  const obs = document.getElementById('chequeObs').value.trim();

  if (!emitente || valor <= 0) {
    showToast('Preencha Emitente e Valor', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.cheques.findIndex(c => c.id === editId);
    if (idx >= 0) {
      appData.cheques[idx] = { ...appData.cheques[idx], numero, emitente, valor, situacao, data, bomPara, obs };
    }
  } else {
    appData.cheques.push({ id: nextId(appData.cheques), numero, emitente, valor, situacao, data, bomPara, obs });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Cheque atualizado!' : 'Cheque adicionado!', 'success');
  renderCheques();
}

function editCheque(id) {
  const c = appData.cheques.find(c => c.id === id);
  if (c) openChequeModal(c);
}

function deleteCheque(id) {
  if (!confirm('Deseja excluir este cheque?')) return;
  appData.cheques = appData.cheques.filter(c => c.id !== id);
  saveData();
  showToast('Cheque excluído!', 'success');
  renderCheques();
}

// ============ PRESTAÇÕES ============
function renderPrestacoes() {
  const pageEl = document.getElementById('page-prestacoes');
  if (!pageEl) return;

  const prestacoes = appData.prestacoes || [];
  const totalGeral = prestacoes.reduce((s,p) => s + p.valor, 0);
  const totalPago = prestacoes.filter(p => p.situacao==='Pago').reduce((s,p) => s + p.valor, 0);
  const totalPendente = prestacoes.filter(p => p.situacao!=='Pago').reduce((s,p) => s + p.valor, 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Prestações</h2>
      <button class="btn btn-primary" onclick="openPrestacaoModal()"><span>+</span> Nova Prestação</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">💳</span><span>Total Prestações</span></div>
        <div class="card-value">${formatCurrency(totalGeral)}</div>
        <small>${prestacoes.length} parcelas</small>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">✅</span><span>Pagas</span></div>
        <div class="card-value text-success">${formatCurrency(totalPago)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">⏳</span><span>Pendentes</span></div>
        <div class="card-value text-danger">${formatCurrency(totalPendente)}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroPrestBusca" class="form-control" placeholder="Buscar descrição..." oninput="filtrarPrestacoes()" style="max-width:300px">
      <select id="filtroPrestStatus" class="form-control" style="max-width:160px" onchange="filtrarPrestacoes()">
        <option value="">Todas</option>
        <option value="Pago">Pagas</option>
        <option value="Pendente">Pendentes</option>
      </select>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Parcela</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Dias</th>
            <th>Situação</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="prestacoesBody"></tbody>
      </table>
    </div>
  `;

  filtrarPrestacoes();
}

function filtrarPrestacoes() {
  const busca = (document.getElementById('filtroPrestBusca')?.value || '').toLowerCase();
  const status = document.getElementById('filtroPrestStatus')?.value || '';

  let lista = [...(appData.prestacoes || [])];

  if (busca) lista = lista.filter(p => (p.descricao||'').toLowerCase().includes(busca));
  if (status) lista = lista.filter(p => p.situacao === status);

  lista.sort((a,b) => (a.vencimento||'').localeCompare(b.vencimento||''));

  const tbody = document.getElementById('prestacoesBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhuma prestação encontrada</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(p => {
    const dias = getDiasEntreHoje(p.vencimento);
    let diasLabel = '-';
    let badgeSit = 'badge-warning';

    if (p.situacao === 'Pago') {
      badgeSit = 'badge-success';
    } else if (dias < 0) {
      badgeSit = 'badge-danger';
      diasLabel = `<span class="text-danger">${Math.abs(dias)}d atrás</span>`;
    } else if (dias <= 5) {
      diasLabel = `<span class="text-warning">${dias}d</span>`;
    } else {
      diasLabel = `${dias}d`;
    }

    return `<tr>
      <td><strong>${p.descricao}</strong></td>
      <td>${p.parcelaAtual}/${p.parcelas}</td>
      <td><strong>${formatCurrency(p.valor)}</strong></td>
      <td>${formatDate(p.vencimento)}</td>
      <td>${p.situacao === 'Pago' ? '-' : diasLabel}</td>
      <td><span class="badge ${badgeSit}">${p.situacao}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editPrestacao(${p.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deletePrestacao(${p.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openPrestacaoModal(prest) {
  const isEdit = !!prest;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Prestação' : 'Nova Prestação';

  modalBody.innerHTML = `
    <div class="form-group">
      <label>Descrição *</label>
      <input type="text" id="prestDesc" class="form-control" value="${isEdit ? prest.descricao : ''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Valor *</label>
        <input type="number" id="prestValor" class="form-control" step="0.01" min="0" value="${isEdit ? prest.valor : ''}">
      </div>
      <div class="form-group">
        <label>Total Parcelas</label>
        <input type="number" id="prestParcelas" class="form-control" min="1" step="1" value="${isEdit ? prest.parcelas : 1}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Parcela Atual</label>
        <input type="number" id="prestParcelaAtual" class="form-control" min="1" step="1" value="${isEdit ? prest.parcelaAtual : 1}">
      </div>
      <div class="form-group">
        <label>Vencimento *</label>
        <input type="date" id="prestVenc" class="form-control" value="${isEdit ? prest.vencimento : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Situação</label>
      <select id="prestSit" class="form-control">
        <option value="Pendente" ${isEdit && prest.situacao==='Pendente' ? 'selected' : ''}>Pendente</option>
        <option value="Pago" ${isEdit && prest.situacao==='Pago' ? 'selected' : ''}>Pago</option>
      </select>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="prestObs" class="form-control" rows="2">${isEdit ? (prest.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePrestacao(${isEdit ? prest.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function savePrestacao(editId) {
  const descricao = document.getElementById('prestDesc').value.trim();
  const valor = parseFloat(document.getElementById('prestValor').value) || 0;
  const parcelas = parseInt(document.getElementById('prestParcelas').value) || 1;
  const parcelaAtual = parseInt(document.getElementById('prestParcelaAtual').value) || 1;
  const vencimento = document.getElementById('prestVenc').value;
  const situacao = document.getElementById('prestSit').value;
  const obs = document.getElementById('prestObs').value.trim();

  if (!descricao || valor <= 0 || !vencimento) {
    showToast('Preencha Descrição, Valor e Vencimento', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.prestacoes.findIndex(p => p.id === editId);
    if (idx >= 0) {
      appData.prestacoes[idx] = { ...appData.prestacoes[idx], descricao, valor, parcelas, parcelaAtual, vencimento, situacao, obs };
    }
  } else {
    appData.prestacoes.push({ id: nextId(appData.prestacoes), descricao, valor, parcelas, parcelaAtual, vencimento, situacao, obs });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Prestação atualizada!' : 'Prestação adicionada!', 'success');
  renderPrestacoes();
}

function editPrestacao(id) {
  const p = appData.prestacoes.find(p => p.id === id);
  if (p) openPrestacaoModal(p);
}

function deletePrestacao(id) {
  if (!confirm('Deseja excluir esta prestação?')) return;
  appData.prestacoes = appData.prestacoes.filter(p => p.id !== id);
  saveData();
  showToast('Prestação excluída!', 'success');
  renderPrestacoes();
}

// ============ PROJETOS ============
function renderProjetos() {
  const pageEl = document.getElementById('page-projetos');
  if (!pageEl) return;

  const projetos = appData.projetos || [];
  const totalOrcamento = projetos.reduce((s,p) => s + (p.orcamento||0), 0);
  const totalGasto = projetos.reduce((s,p) => s + (p.gasto||0), 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Projetos</h2>
      <button class="btn btn-primary" onclick="openProjetoModal()"><span>+</span> Novo Projeto</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📐</span><span>Total Projetos</span></div>
        <div class="card-value">${projetos.length}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">💰</span><span>Orçamento Total</span></div>
        <div class="card-value">${formatCurrency(totalOrcamento)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📉</span><span>Gasto Total</span></div>
        <div class="card-value text-danger">${formatCurrency(totalGasto)}</div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Orçamento</th>
            <th>Gasto</th>
            <th>Restante</th>
            <th>Progresso</th>
            <th>Situação</th>
            <th>Início</th>
            <th>Previsão</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="projetosBody"></tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('projetosBody');
  if (projetos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum projeto cadastrado</td></tr>';
    return;
  }

  tbody.innerHTML = projetos.map(p => {
    const restante = (p.orcamento||0) - (p.gasto||0);
    const pct = p.orcamento > 0 ? Math.min(100, (p.gasto / p.orcamento * 100)).toFixed(1) : 0;

    let badgeSit = 'badge-info';
    if (p.situacao === 'Concluído') badgeSit = 'badge-success';
    else if (p.situacao === 'Cancelado') badgeSit = 'badge-danger';

    return `<tr>
      <td><strong>${p.nome}</strong></td>
      <td>${p.descricao || '-'}</td>
      <td>${formatCurrency(p.orcamento)}</td>
      <td class="text-danger">${formatCurrency(p.gasto)}</td>
      <td class="${restante >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(restante)}</td>
      <td>
        <div class="progress-bar" style="width:100px"><div class="progress-fill" style="width:${pct}%"></div></div>
        <small>${pct}%</small>
      </td>
      <td><span class="badge ${badgeSit}">${p.situacao}</span></td>
      <td>${formatDate(p.inicio)}</td>
      <td>${formatDate(p.previsao)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editProjeto(${p.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProjeto(${p.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openProjetoModal(projeto) {
  const isEdit = !!projeto;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Projeto' : 'Novo Projeto';

  modalBody.innerHTML = `
    <div class="form-group">
      <label>Nome *</label>
      <input type="text" id="projNome" class="form-control" value="${isEdit ? projeto.nome : ''}">
    </div>
    <div class="form-group">
      <label>Descrição</label>
      <textarea id="projDesc" class="form-control" rows="2">${isEdit ? (projeto.descricao||'') : ''}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Orçamento *</label>
        <input type="number" id="projOrcamento" class="form-control" step="0.01" min="0" value="${isEdit ? projeto.orcamento : ''}">
      </div>
      <div class="form-group">
        <label>Gasto</label>
        <input type="number" id="projGasto" class="form-control" step="0.01" min="0" value="${isEdit ? (projeto.gasto||0) : 0}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Data Início</label>
        <input type="date" id="projInicio" class="form-control" value="${isEdit ? (projeto.inicio||'') : new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Previsão Término</label>
        <input type="date" id="projPrevisao" class="form-control" value="${isEdit ? (projeto.previsao||'') : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Situação</label>
      <select id="projSit" class="form-control">
        <option value="Em Andamento" ${isEdit && projeto.situacao==='Em Andamento' ? 'selected' : ''}>Em Andamento</option>
        <option value="Concluído" ${isEdit && projeto.situacao==='Concluído' ? 'selected' : ''}>Concluído</option>
        <option value="Cancelado" ${isEdit && projeto.situacao==='Cancelado' ? 'selected' : ''}>Cancelado</option>
        <option value="Pausado" ${isEdit && projeto.situacao==='Pausado' ? 'selected' : ''}>Pausado</option>
      </select>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="projObs" class="form-control" rows="2">${isEdit ? (projeto.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveProjeto(${isEdit ? projeto.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveProjeto(editId) {
  const nome = document.getElementById('projNome').value.trim();
  const descricao = document.getElementById('projDesc').value.trim();
  const orcamento = parseFloat(document.getElementById('projOrcamento').value) || 0;
  const gasto = parseFloat(document.getElementById('projGasto').value) || 0;
  const inicio = document.getElementById('projInicio').value;
  const previsao = document.getElementById('projPrevisao').value;
  const situacao = document.getElementById('projSit').value;
  const obs = document.getElementById('projObs').value.trim();

  if (!nome || orcamento <= 0) {
    showToast('Preencha Nome e Orçamento', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.projetos.findIndex(p => p.id === editId);
    if (idx >= 0) {
      appData.projetos[idx] = { ...appData.projetos[idx], nome, descricao, orcamento, gasto, inicio, previsao, situacao, obs };
    }
  } else {
    appData.projetos.push({ id: nextId(appData.projetos), nome, descricao, orcamento, gasto, inicio, previsao, situacao, obs });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Projeto atualizado!' : 'Projeto adicionado!', 'success');
  renderProjetos();
}

function editProjeto(id) {
  const p = appData.projetos.find(p => p.id === id);
  if (p) openProjetoModal(p);
}

function deleteProjeto(id) {
  if (!confirm('Deseja excluir este projeto?')) return;
  appData.projetos = appData.projetos.filter(p => p.id !== id);
  saveData();
  showToast('Projeto excluído!', 'success');
  renderProjetos();
}

// ============ PAGAMENTOS CLIENTES ============
function renderPagClientes() {
  const pageEl = document.getElementById('page-pagclientes');
  if (!pageEl) return;

  const pags = appData.pagClientes || [];
  const totalDevido = pags.reduce((s,p) => s + (p.totalDevido||0), 0);
  const totalPago = pags.reduce((s,p) => s + (p.totalPago||0), 0);
  const totalRestante = pags.reduce((s,p) => s + (p.restante||0), 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Pagamentos de Clientes</h2>
      <button class="btn btn-primary" onclick="openPagClienteModal()"><span>+</span> Novo Registro</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📋</span><span>Total Devido</span></div>
        <div class="card-value">${formatCurrency(totalDevido)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">✅</span><span>Total Recebido</span></div>
        <div class="card-value text-success">${formatCurrency(totalPago)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">⚠️</span><span>Total Restante</span></div>
        <div class="card-value text-danger">${formatCurrency(totalRestante)}</div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Cidade</th>
            <th>Total Devido</th>
            <th>Total Pago</th>
            <th>Restante</th>
            <th>Progresso</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="pagClientesBody"></tbody>
      </table>
    </div>
  `;

  const tbody = document.getElementById('pagClientesBody');
  if (pags.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum registro</td></tr>';
    return;
  }

  tbody.innerHTML = pags.map(p => {
    const pct = p.totalDevido > 0 ? (p.totalPago / p.totalDevido * 100).toFixed(1) : 0;
    return `<tr>
      <td><strong>${p.cliente}</strong></td>
      <td>${p.cidade || '-'}</td>
      <td>${formatCurrency(p.totalDevido)}</td>
      <td class="text-success">${formatCurrency(p.totalPago)}</td>
      <td class="text-danger"><strong>${formatCurrency(p.restante)}</strong></td>
      <td>
        <div class="progress-bar" style="width:100px"><div class="progress-fill" style="width:${pct}%"></div></div>
        <small>${pct}%</small>
      </td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editPagCliente(${p.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deletePagCliente(${p.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openPagClienteModal(pag) {
  const isEdit = !!pag;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Pagamento' : 'Novo Pagamento de Cliente';

  const clientes = (appData.clientes||[]).map(c => c.nome).sort();

  modalBody.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Cliente *</label>
        <select id="pagCliente" class="form-control">
          <option value="">Selecione...</option>
          ${clientes.map(c => `<option value="${c}" ${isEdit && pag.cliente===c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Cidade</label>
        <input type="text" id="pagCidade" class="form-control" value="${isEdit ? (pag.cidade||'') : ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Total Devido *</label>
        <input type="number" id="pagDevido" class="form-control" step="0.01" min="0" value="${isEdit ? pag.totalDevido : ''}">
      </div>
      <div class="form-group">
        <label>Total Pago</label>
        <input type="number" id="pagPago" class="form-control" step="0.01" min="0" value="${isEdit ? pag.totalPago : 0}">
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="pagObs" class="form-control" rows="2">${isEdit ? (pag.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePagCliente(${isEdit ? pag.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function savePagCliente(editId) {
  const cliente = document.getElementById('pagCliente').value;
  const cidade = document.getElementById('pagCidade').value.trim();
  const totalDevido = parseFloat(document.getElementById('pagDevido').value) || 0;
  const totalPago = parseFloat(document.getElementById('pagPago').value) || 0;
  const obs = document.getElementById('pagObs').value.trim();
  const restante = totalDevido - totalPago;

  if (!cliente || totalDevido <= 0) {
    showToast('Preencha Cliente e Total Devido', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.pagClientes.findIndex(p => p.id === editId);
    if (idx >= 0) {
      appData.pagClientes[idx] = { ...appData.pagClientes[idx], cliente, cidade, totalDevido, totalPago, restante, obs };
    }
  } else {
    appData.pagClientes.push({ id: nextId(appData.pagClientes), cliente, cidade, totalDevido, totalPago, restante, obs });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Registro atualizado!' : 'Registro adicionado!', 'success');
  renderPagClientes();
}

function editPagCliente(id) {
  const p = appData.pagClientes.find(p => p.id === id);
  if (p) openPagClienteModal(p);
}

function deletePagCliente(id) {
  if (!confirm('Deseja excluir este registro?')) return;
  appData.pagClientes = appData.pagClientes.filter(p => p.id !== id);
  saveData();
  showToast('Registro excluído!', 'success');
  renderPagClientes();
}

// ============ GARANTIAS ============
function renderGarantias() {
  const pageEl = document.getElementById('page-garantias');
  if (!pageEl) return;

  const garantias = appData.garantias || [];

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Garantias</h2>
      <button class="btn btn-primary" onclick="openGarantiaModal()"><span>+</span> Nova Garantia</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">🛡️</span><span>Total Garantias</span></div>
        <div class="card-value">${garantias.length}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">✅</span><span>Ativas</span></div>
        <div class="card-value text-success">${garantias.filter(g => g.situacao==='Ativa').length}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">⏰</span><span>Expiradas</span></div>
        <div class="card-value text-warning">${garantias.filter(g => g.situacao==='Expirada').length}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroGarantiasBusca" class="form-control" placeholder="Buscar produto, cliente..." oninput="filtrarGarantias()" style="max-width:300px">
      <select id="filtroGarantiasStatus" class="form-control" style="max-width:160px" onchange="filtrarGarantias()">
        <option value="">Todas</option>
        ${(appData.situacaoGarantia||[]).map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Cliente</th>
            <th>Início</th>
            <th>Término</th>
            <th>Dias Rest.</th>
            <th>Situação</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody id="garantiasBody"></tbody>
      </table>
    </div>
  `;

  filtrarGarantias();
}

function filtrarGarantias() {
  const busca = (document.getElementById('filtroGarantiasBusca')?.value || '').toLowerCase();
  const status = document.getElementById('filtroGarantiasStatus')?.value || '';

  let lista = [...(appData.garantias || [])];

  if (busca) {
    lista = lista.filter(g =>
      (g.produto||'').toLowerCase().includes(busca) ||
      (g.cliente||'').toLowerCase().includes(busca)
    );
  }
  if (status) lista = lista.filter(g => g.situacao === status);

  const tbody = document.getElementById('garantiasBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhuma garantia cadastrada</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(g => {
    const diasRest = getDiasEntreHoje(g.termino);
    let badgeSit = 'badge-success';
    if (g.situacao === 'Expirada') badgeSit = 'badge-warning';
    else if (g.situacao === 'Utilizada') badgeSit = 'badge-info';

    return `<tr>
      <td><strong>${g.produto}</strong></td>
      <td>${g.cliente || '-'}</td>
      <td>${formatDate(g.inicio)}</td>
      <td>${formatDate(g.termino)}</td>
      <td>${g.situacao === 'Ativa' ? (diasRest > 0 ? diasRest + 'd' : '<span class="text-danger">Expirado</span>') : '-'}</td>
      <td><span class="badge ${badgeSit}">${g.situacao}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editGarantia(${g.id})" title="Editar">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteGarantia(${g.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openGarantiaModal(garantia) {
  const isEdit = !!garantia;
  const modal = document.getElementById('cadastroModal');
  const modalTitle = document.getElementById('cadastroModalTitle');
  const modalBody = document.getElementById('cadastroModalBody');
  const modalFooter = document.getElementById('cadastroModalFooter');

  modalTitle.textContent = isEdit ? 'Editar Garantia' : 'Nova Garantia';

  const clientes = (appData.clientes||[]).map(c => c.nome).sort();
  const situacoes = appData.situacaoGarantia || [];

  modalBody.innerHTML = `
    <div class="form-group">
      <label>Produto/Serviço *</label>
      <input type="text" id="garProduto" class="form-control" value="${isEdit ? garantia.produto : ''}">
    </div>
    <div class="form-group">
      <label>Cliente</label>
      <select id="garCliente" class="form-control">
        <option value="">Selecione...</option>
        ${clientes.map(c => `<option value="${c}" ${isEdit && garantia.cliente===c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Data Início *</label>
        <input type="date" id="garInicio" class="form-control" value="${isEdit ? garantia.inicio : new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Data Término *</label>
        <input type="date" id="garTermino" class="form-control" value="${isEdit ? garantia.termino : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Situação</label>
      <select id="garSit" class="form-control">
        ${situacoes.map(s => `<option value="${s}" ${isEdit && garantia.situacao===s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="garObs" class="form-control" rows="2">${isEdit ? (garantia.obs||'') : ''}</textarea>
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveGarantia(${isEdit ? garantia.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveGarantia(editId) {
  const produto = document.getElementById('garProduto').value.trim();
  const cliente = document.getElementById('garCliente').value;
  const inicio = document.getElementById('garInicio').value;
  const termino = document.getElementById('garTermino').value;
  const situacao = document.getElementById('garSit').value;
  const obs = document.getElementById('garObs').value.trim();

  if (!produto || !inicio || !termino) {
    showToast('Preencha Produto, Início e Término', 'error');
    return;
  }

  if (editId > 0) {
    const idx = appData.garantias.findIndex(g => g.id === editId);
    if (idx >= 0) {
      appData.garantias[idx] = { ...appData.garantias[idx], produto, cliente, inicio, termino, situacao, obs };
    }
  } else {
    appData.garantias.push({ id: nextId(appData.garantias), produto, cliente, inicio, termino, situacao, obs });
  }

  saveData();
  closeCadastroModal();
  showToast(editId > 0 ? 'Garantia atualizada!' : 'Garantia adicionada!', 'success');
  renderGarantias();
}

function editGarantia(id) {
  const g = appData.garantias.find(g => g.id === id);
  if (g) openGarantiaModal(g);
}

function deleteGarantia(id) {
  if (!confirm('Deseja excluir esta garantia?')) return;
  appData.garantias = appData.garantias.filter(g => g.id !== id);
  saveData();
  showToast('Garantia excluída!', 'success');
  renderGarantias();
}

// ==========================================
// PARTE 8 — RELATÓRIOS, NOTAS, RECEITAS MEI, CONFIGURAÇÕES, BACKUP, INIT
// ==========================================

// ============ RELATÓRIOS ============
function renderRelatorios() {
  const pageEl = document.getElementById('page-relatorios');
  if (!pageEl) return;

  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const mesesLabel = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  // Dados mensais
  let relMensal = meses.map((m, i) => {
    const fc = appData.fluxoCaixa[m];
    const entradas = fc ? (fc.entradas||[]).reduce((a,b) => a+b, 0) : 0;
    const saidas = fc ? (fc.saidas||[]).reduce((a,b) => a+b, 0) + (fc.combustivel||[]).reduce((a,b) => a+b, 0) : 0;
    const comprasMes = (appData.compras||[]).filter(c => {
      const d = new Date(c.data+'T00:00:00');
      return d.getMonth() === i && d.getFullYear() === 2026;
    }).reduce((s,c) => s + (c.quantidade * c.valorUnit), 0);
    const vendasMes = (appData.vendas||[]).filter(v => {
      const d = new Date(v.data+'T00:00:00');
      return d.getMonth() === i && d.getFullYear() === 2026;
    }).reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);

    return { mes: mesesLabel[i], entradas, saidas, lucro: entradas - saidas, compras: comprasMes, vendas: vendasMes };
  });

  const totalAnualEntradas = relMensal.reduce((s,r) => s + r.entradas, 0);
  const totalAnualSaidas = relMensal.reduce((s,r) => s + r.saidas, 0);
  const totalAnualLucro = totalAnualEntradas - totalAnualSaidas;
  const totalAnualCompras = relMensal.reduce((s,r) => s + r.compras, 0);
  const totalAnualVendas = relMensal.reduce((s,r) => s + r.vendas, 0);

  // Ranking fornecedores
  const fornMap = {};
  (appData.compras||[]).forEach(c => {
    if (!fornMap[c.fornecedor]) fornMap[c.fornecedor] = 0;
    fornMap[c.fornecedor] += c.quantidade * c.valorUnit;
  });
  const rankForn = Object.entries(fornMap).sort((a,b) => b[1]-a[1]).slice(0, 10);

  // Ranking clientes
  const cliMap = {};
  (appData.vendas||[]).forEach(v => {
    if (!cliMap[v.cliente]) cliMap[v.cliente] = 0;
    cliMap[v.cliente] += v.quantidade * v.valorUnit;
  });
  const rankCli = Object.entries(cliMap).sort((a,b) => b[1]-a[1]).slice(0, 10);

  // Ranking vendedores
  const vendMap = {};
  (appData.vendas||[]).forEach(v => {
    if (!vendMap[v.vendedor]) vendMap[v.vendedor] = 0;
    vendMap[v.vendedor] += v.quantidade * v.valorUnit;
  });
  const rankVend = Object.entries(vendMap).sort((a,b) => b[1]-a[1]);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Relatórios</h2>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📈</span><span>Entradas Anual</span></div>
        <div class="card-value text-success">${formatCurrency(totalAnualEntradas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📉</span><span>Saídas Anual</span></div>
        <div class="card-value text-danger">${formatCurrency(totalAnualSaidas)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">💰</span><span>Lucro Anual</span></div>
        <div class="card-value ${totalAnualLucro >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(totalAnualLucro)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">🛒</span><span>Compras Anual</span></div>
        <div class="card-value">${formatCurrency(totalAnualCompras)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">🏷️</span><span>Vendas Anual</span></div>
        <div class="card-value">${formatCurrency(totalAnualVendas)}</div>
      </div>
    </div>

    <div class="section-title">Resumo Mensal</div>
    <div class="table-responsive" style="margin-bottom:24px;">
      <table class="table">
        <thead>
          <tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Lucro</th><th>Compras</th><th>Vendas</th></tr>
        </thead>
        <tbody>
          ${relMensal.map(r => `<tr>
            <td><strong>${r.mes}</strong></td>
            <td class="text-success">${formatCurrency(r.entradas)}</td>
            <td class="text-danger">${formatCurrency(r.saidas)}</td>
            <td class="${r.lucro >= 0 ? 'text-success' : 'text-danger'}"><strong>${formatCurrency(r.lucro)}</strong></td>
            <td>${formatCurrency(r.compras)}</td>
            <td>${formatCurrency(r.vendas)}</td>
          </tr>`).join('')}
          <tr style="background:var(--bg-tertiary);font-weight:bold;">
            <td>TOTAL ANUAL</td>
            <td class="text-success">${formatCurrency(totalAnualEntradas)}</td>
            <td class="text-danger">${formatCurrency(totalAnualSaidas)}</td>
            <td class="${totalAnualLucro >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(totalAnualLucro)}</td>
            <td>${formatCurrency(totalAnualCompras)}</td>
            <td>${formatCurrency(totalAnualVendas)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:24px;">
      <div>
        <div class="section-title">Top 10 Fornecedores</div>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>#</th><th>Fornecedor</th><th>Total</th></tr></thead>
            <tbody>${rankForn.map((f,i) => `<tr><td>${i+1}</td><td><strong>${f[0]}</strong></td><td>${formatCurrency(f[1])}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
      <div>
        <div class="section-title">Top Clientes</div>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>#</th><th>Cliente</th><th>Total</th></tr></thead>
            <tbody>${rankCli.map((c,i) => `<tr><td>${i+1}</td><td><strong>${c[0]}</strong></td><td>${formatCurrency(c[1])}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
      <div>
        <div class="section-title">Vendedores</div>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>#</th><th>Vendedor</th><th>Total</th></tr></thead>
            <tbody>${rankVend.map((v,i) => `<tr><td>${i+1}</td><td><strong>${v[0]}</strong></td><td>${formatCurrency(v[1])}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ============ NOTAS DE ENTRADA ============
function renderNotasEntrada() {
  const pageEl = document.getElementById('page-notasentrada');
  if (!pageEl) return;

  const notas = appData.notasEntrada || [];
  const total = notas.reduce((s,n) => s + (n.valor||0), 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Notas de Entrada</h2>
      <button class="btn btn-primary" onclick="openNotaEntradaModal()"><span>+</span> Nova Nota</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📥</span><span>Total Notas Entrada</span></div>
        <div class="card-value">${formatCurrency(total)}</div>
        <small>${notas.length} notas</small>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroNEBusca" class="form-control" placeholder="Buscar..." oninput="filtrarNotasEntrada()" style="max-width:300px">
      <input type="date" id="filtroNEDataIni" class="form-control" style="max-width:170px" onchange="filtrarNotasEntrada()">
      <input type="date" id="filtroNEDataFim" class="form-control" style="max-width:170px" onchange="filtrarNotasEntrada()">
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>Nº Nota</th><th>Fornecedor</th><th>Data</th><th>Valor</th><th>Obs</th><th style="width:120px">Ações</th></tr></thead>
        <tbody id="notasEntradaBody"></tbody>
      </table>
    </div>
  `;

  filtrarNotasEntrada();
}

function filtrarNotasEntrada() {
  const busca = (document.getElementById('filtroNEBusca')?.value || '').toLowerCase();
  const dataIni = document.getElementById('filtroNEDataIni')?.value || '';
  const dataFim = document.getElementById('filtroNEDataFim')?.value || '';

  let lista = [...(appData.notasEntrada || [])];
  if (busca) lista = lista.filter(n => (n.numero||'').toLowerCase().includes(busca) || (n.fornecedor||'').toLowerCase().includes(busca));
  if (dataIni) lista = lista.filter(n => n.data >= dataIni);
  if (dataFim) lista = lista.filter(n => n.data <= dataFim);

  lista.sort((a,b) => (b.data||'').localeCompare(a.data||''));

  const tbody = document.getElementById('notasEntradaBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhuma nota de entrada</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(n => `<tr>
    <td><strong>${n.numero || '-'}</strong></td>
    <td>${n.fornecedor || '-'}</td>
    <td>${formatDate(n.data)}</td>
    <td><strong>${formatCurrency(n.valor)}</strong></td>
    <td>${n.obs || '-'}</td>
    <td>
      <button class="btn btn-sm btn-outline" onclick="editNotaEntrada(${n.id})" title="Editar">✏️</button>
      <button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada(${n.id})" title="Excluir">🗑️</button>
    </td>
  </tr>`).join('');
}

function openNotaEntradaModal(nota) {
  const isEdit = !!nota;
  const modal = document.getElementById('cadastroModal');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Nota de Entrada' : 'Nova Nota de Entrada';

  const fornecedores = (appData.fornecedores||[]).map(f => f.nome).sort();

  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Nº Nota</label>
        <input type="text" id="neNumero" class="form-control" value="${isEdit ? (nota.numero||'') : ''}">
      </div>
      <div class="form-group">
        <label>Data *</label>
        <input type="date" id="neData" class="form-control" value="${isEdit ? nota.data : new Date().toISOString().split('T')[0]}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Fornecedor</label>
        <select id="neFornecedor" class="form-control">
          <option value="">Selecione...</option>
          ${fornecedores.map(f => `<option value="${f}" ${isEdit && nota.fornecedor===f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Valor *</label>
        <input type="number" id="neValor" class="form-control" step="0.01" min="0" value="${isEdit ? nota.valor : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="neObs" class="form-control" rows="2">${isEdit ? (nota.obs||'') : ''}</textarea>
    </div>
  `;

  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveNotaEntrada(${isEdit ? nota.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveNotaEntrada(editId) {
  const numero = document.getElementById('neNumero').value.trim();
  const data = document.getElementById('neData').value;
  const fornecedor = document.getElementById('neFornecedor').value;
  const valor = parseFloat(document.getElementById('neValor').value) || 0;
  const obs = document.getElementById('neObs').value.trim();

  if (!data || valor <= 0) { showToast('Preencha Data e Valor', 'error'); return; }

  if (editId > 0) {
    const idx = appData.notasEntrada.findIndex(n => n.id === editId);
    if (idx >= 0) appData.notasEntrada[idx] = { ...appData.notasEntrada[idx], numero, data, fornecedor, valor, obs };
  } else {
    appData.notasEntrada.push({ id: nextId(appData.notasEntrada), numero, data, fornecedor, valor, obs });
  }

  saveData(); closeCadastroModal();
  showToast(editId > 0 ? 'Nota atualizada!' : 'Nota adicionada!', 'success');
  renderNotasEntrada();
}

function editNotaEntrada(id) { const n = appData.notasEntrada.find(n => n.id === id); if (n) openNotaEntradaModal(n); }
function deleteNotaEntrada(id) { if (!confirm('Excluir nota?')) return; appData.notasEntrada = appData.notasEntrada.filter(n => n.id !== id); saveData(); showToast('Nota excluída!','success'); renderNotasEntrada(); }

// ============ NOTAS DE SAÍDA ============
function renderNotasSaida() {
  const pageEl = document.getElementById('page-notassaida');
  if (!pageEl) return;

  const notas = appData.notasSaida || [];
  const total = notas.reduce((s,n) => s + (n.valor||0), 0);
  const dasn = total * 0.05;
  const lucro32 = total * 0.32;
  const inss = total * 0.05;
  const icms = total * 0.01;

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Notas de Saída</h2>
      <button class="btn btn-primary" onclick="openNotaSaidaModal()"><span>+</span> Nova Nota</button>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📤</span><span>Total Notas Saída</span></div>
        <div class="card-value">${formatCurrency(total)}</div>
        <small>${notas.length} notas</small>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📊</span><span>DASN-SIMEI (5%)</span></div>
        <div class="card-value text-warning">${formatCurrency(dasn)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">💼</span><span>Lucro 32%</span></div>
        <div class="card-value">${formatCurrency(lucro32)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">🏛️</span><span>INSS (5%)</span></div>
        <div class="card-value text-danger">${formatCurrency(inss)}</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="filtroNSBusca" class="form-control" placeholder="Buscar..." oninput="filtrarNotasSaida()" style="max-width:300px">
      <input type="date" id="filtroNSDataIni" class="form-control" style="max-width:170px" onchange="filtrarNotasSaida()">
      <input type="date" id="filtroNSDataFim" class="form-control" style="max-width:170px" onchange="filtrarNotasSaida()">
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead><tr><th>Nº Nota</th><th>Cliente</th><th>Data</th><th>Valor</th><th>Obs</th><th style="width:120px">Ações</th></tr></thead>
        <tbody id="notasSaidaBody"></tbody>
      </table>
    </div>
  `;

  filtrarNotasSaida();
}

function filtrarNotasSaida() {
  const busca = (document.getElementById('filtroNSBusca')?.value || '').toLowerCase();
  const dataIni = document.getElementById('filtroNSDataIni')?.value || '';
  const dataFim = document.getElementById('filtroNSDataFim')?.value || '';

  let lista = [...(appData.notasSaida || [])];
  if (busca) lista = lista.filter(n => (n.numero||'').toLowerCase().includes(busca) || (n.cliente||'').toLowerCase().includes(busca));
  if (dataIni) lista = lista.filter(n => n.data >= dataIni);
  if (dataFim) lista = lista.filter(n => n.data <= dataFim);

  lista.sort((a,b) => (b.data||'').localeCompare(a.data||''));

  const tbody = document.getElementById('notasSaidaBody');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhuma nota de saída</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(n => `<tr>
    <td><strong>${n.numero || '-'}</strong></td>
    <td>${n.cliente || '-'}</td>
    <td>${formatDate(n.data)}</td>
    <td><strong>${formatCurrency(n.valor)}</strong></td>
    <td>${n.obs || '-'}</td>
    <td>
      <button class="btn btn-sm btn-outline" onclick="editNotaSaida(${n.id})" title="Editar">✏️</button>
      <button class="btn btn-sm btn-danger" onclick="deleteNotaSaida(${n.id})" title="Excluir">🗑️</button>
    </td>
  </tr>`).join('');
}

function openNotaSaidaModal(nota) {
  const isEdit = !!nota;
  const modal = document.getElementById('cadastroModal');
  document.getElementById('cadastroModalTitle').textContent = isEdit ? 'Editar Nota de Saída' : 'Nova Nota de Saída';

  const clientes = (appData.clientes||[]).map(c => c.nome).sort();

  document.getElementById('cadastroModalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Nº Nota</label>
        <input type="text" id="nsNumero" class="form-control" value="${isEdit ? (nota.numero||'') : ''}">
      </div>
      <div class="form-group">
        <label>Data *</label>
        <input type="date" id="nsData" class="form-control" value="${isEdit ? nota.data : new Date().toISOString().split('T')[0]}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Cliente</label>
        <select id="nsCliente" class="form-control">
          <option value="">Selecione...</option>
          ${clientes.map(c => `<option value="${c}" ${isEdit && nota.cliente===c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Valor *</label>
        <input type="number" id="nsValor" class="form-control" step="0.01" min="0" value="${isEdit ? nota.valor : ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <textarea id="nsObs" class="form-control" rows="2">${isEdit ? (nota.obs||'') : ''}</textarea>
    </div>
  `;

  document.getElementById('cadastroModalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeCadastroModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveNotaSaida(${isEdit ? nota.id : 0})">Salvar</button>
  `;

  modal.style.display = 'flex';
}

function saveNotaSaida(editId) {
  const numero = document.getElementById('nsNumero').value.trim();
  const data = document.getElementById('nsData').value;
  const cliente = document.getElementById('nsCliente').value;
  const valor = parseFloat(document.getElementById('nsValor').value) || 0;
  const obs = document.getElementById('nsObs').value.trim();

  if (!data || valor <= 0) { showToast('Preencha Data e Valor', 'error'); return; }

  if (editId > 0) {
    const idx = appData.notasSaida.findIndex(n => n.id === editId);
    if (idx >= 0) appData.notasSaida[idx] = { ...appData.notasSaida[idx], numero, data, cliente, valor, obs };
  } else {
    appData.notasSaida.push({ id: nextId(appData.notasSaida), numero, data, cliente, valor, obs });
  }

  saveData(); closeCadastroModal();
  showToast(editId > 0 ? 'Nota atualizada!' : 'Nota adicionada!', 'success');
  renderNotasSaida();
}

function editNotaSaida(id) { const n = appData.notasSaida.find(n => n.id === id); if (n) openNotaSaidaModal(n); }
function deleteNotaSaida(id) { if (!confirm('Excluir nota?')) return; appData.notasSaida = appData.notasSaida.filter(n => n.id !== id); saveData(); showToast('Nota excluída!','success'); renderNotasSaida(); }

// ============ RECEITAS MEI ============
function renderReceitasMei() {
  const pageEl = document.getElementById('page-receitasmei');
  if (!pageEl) return;

  const mesesLabel = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  // Calcular receitas por mês baseado nas vendas
  let receitasMensal = mesesLabel.map((mes, i) => {
    const vendasMes = (appData.vendas||[]).filter(v => {
      const d = new Date(v.data+'T00:00:00');
      return d.getMonth() === i && d.getFullYear() === 2026;
    });
    const comNota = vendasMes.filter(v => v.tipo === 'Direta').reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
    const semNota = vendasMes.filter(v => v.tipo === 'Revenda').reduce((s,v) => s + (v.quantidade * v.valorUnit), 0);
    const total = comNota + semNota;
    return { mes, comNota, semNota, total };
  });

  const totalAnual = receitasMensal.reduce((s,r) => s + r.total, 0);
  const limiteMei = 81000;
  const pctLimite = Math.min(100, (totalAnual / limiteMei * 100));

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Receitas MEI — 2026</h2>
    </div>

    <div class="dashboard-grid" style="margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">💰</span><span>Receita Bruta Anual</span></div>
        <div class="card-value">${formatCurrency(totalAnual)}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📊</span><span>Limite MEI</span></div>
        <div class="card-value">${formatCurrency(limiteMei)}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pctLimite}%;${pctLimite > 80 ? 'background:var(--danger)' : ''}"></div></div>
        <small>${pctLimite.toFixed(1)}% utilizado</small>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">📋</span><span>DAS Mensal Estimado</span></div>
        <div class="card-value text-warning">${formatCurrency(71.60)}</div>
        <small>INSS + ISS/ICMS</small>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr><th>Mês</th><th>Com Nota Fiscal</th><th>Sem Nota Fiscal</th><th>Total Bruto</th></tr>
        </thead>
        <tbody>
          ${receitasMensal.map(r => `<tr>
            <td><strong>${r.mes}</strong></td>
            <td>${formatCurrency(r.comNota)}</td>
            <td>${formatCurrency(r.semNota)}</td>
            <td><strong>${formatCurrency(r.total)}</strong></td>
          </tr>`).join('')}
          <tr style="background:var(--bg-tertiary);font-weight:bold;">
            <td>TOTAL ANUAL</td>
            <td>${formatCurrency(receitasMensal.reduce((s,r) => s+r.comNota, 0))}</td>
            <td>${formatCurrency(receitasMensal.reduce((s,r) => s+r.semNota, 0))}</td>
            <td>${formatCurrency(totalAnual)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// ============ CONFIGURAÇÕES ============
function renderConfiguracoes() {
  const pageEl = document.getElementById('page-configuracoes');
  if (!pageEl) return;

  const configs = [
    { key: 'vendedores', label: 'Vendedores' },
    { key: 'formasPagamento', label: 'Formas de Pagamento' },
    { key: 'tipoUnidade', label: 'Tipos de Unidade' },
    { key: 'tipoVenda', label: 'Tipos de Venda' },
    { key: 'situacaoCompra', label: 'Situação de Compra' },
    { key: 'situacaoEntrega', label: 'Situação de Entrega' },
    { key: 'situacaoCheque', label: 'Situação de Cheque' },
    { key: 'situacaoGarantia', label: 'Situação de Garantia' },
    { key: 'situacaoBoleto', label: 'Situação de Boleto' }
  ];

  let logoSection = `
    <div class="card" style="margin-bottom:24px;">
      <div class="card-header"><span class="card-icon">🖼️</span><span>Logo da Empresa</span></div>
      <div style="padding:16px;">
        <p style="color:var(--text-secondary);margin-bottom:12px;">Tamanho recomendado: <strong>260 × 70 px</strong> | Máximo: 500 KB | Formatos: PNG, JPG, SVG</p>
        <div style="display:flex;align-items:center;gap:16px;">
          <div id="configLogoPreview" style="width:260px;height:70px;border:2px dashed var(--border-color);border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg-tertiary)">
            ${appData.empresa && appData.empresa.logo ? `<img src="${appData.empresa.logo}" style="max-width:100%;max-height:100%;object-fit:contain">` : '<span style="color:var(--text-muted)">Sem logo</span>'}
          </div>
          <div>
            <label class="btn btn-primary" style="cursor:pointer;margin-right:8px;">
              📷 Enviar Logo
              <input type="file" accept="image/*" onchange="handleLogoUpload(event)" style="display:none">
            </label>
            ${appData.empresa && appData.empresa.logo ? `<button class="btn btn-danger" onclick="removeLogo()">🗑️ Remover</button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  let configsHTML = configs.map(cfg => {
    const items = appData[cfg.key] || [];
    return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header" style="cursor:pointer" onclick="toggleConfigList('${cfg.key}')">
          <span><strong>${cfg.label}</strong> (${items.length})</span>
          <span id="configArrow_${cfg.key}">▶</span>
        </div>
        <div id="configList_${cfg.key}" style="display:none;padding:12px;">
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <input type="text" id="configInput_${cfg.key}" class="form-control" placeholder="Novo item..." style="flex:1">
            <button class="btn btn-primary btn-sm" onclick="addConfigItem('${cfg.key}')">+ Adicionar</button>
          </div>
          <div id="configItems_${cfg.key}">
            ${items.map((item, i) => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;margin-bottom:4px;">
                <span>${item}</span>
                <button class="btn btn-sm btn-danger" onclick="removeConfigItem('${cfg.key}', ${i})" style="padding:2px 8px;font-size:12px">✕</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Configurações</h2>
    </div>
    ${logoSection}
    <div class="section-title">Listas de Configuração</div>
    ${configsHTML}
  `;
}

function toggleConfigList(key) {
  const list = document.getElementById('configList_' + key);
  const arrow = document.getElementById('configArrow_' + key);
  if (list.style.display === 'none') {
    list.style.display = 'block';
    arrow.textContent = '▼';
  } else {
    list.style.display = 'none';
    arrow.textContent = '▶';
  }
}

function addConfigItem(key) {
  const input = document.getElementById('configInput_' + key);
  const val = input.value.trim();
  if (!val) { showToast('Digite um valor', 'error'); return; }
  if (!appData[key]) appData[key] = [];
  if (appData[key].includes(val)) { showToast('Item já existe', 'error'); return; }
  appData[key].push(val);
  saveData();
  showToast('Item adicionado!', 'success');
  renderConfiguracoes();
  // Reabrir a lista
  setTimeout(() => { toggleConfigList(key); }, 100);
}

function removeConfigItem(key, idx) {
  if (!confirm('Remover este item?')) return;
  appData[key].splice(idx, 1);
  saveData();
  showToast('Item removido!', 'success');
  renderConfiguracoes();
  setTimeout(() => { toggleConfigList(key); }, 100);
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024) {
    showToast('Imagem deve ter no máximo 500 KB', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!appData.empresa) appData.empresa = {};
    appData.empresa.logo = e.target.result;
    saveData();
    updateSidebarLogo();
    showToast('Logo atualizado!', 'success');
    renderConfiguracoes();
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  if (!confirm('Remover o logo da empresa?')) return;
  if (appData.empresa) appData.empresa.logo = '';
  saveData();
  updateSidebarLogo();
  showToast('Logo removido!', 'success');
  renderConfiguracoes();
}

// ============ BACKUP ============
function renderBackupInfo() {
  const pageEl = document.getElementById('page-backup');
  if (!pageEl) return;

  const dataSize = new Blob([JSON.stringify(appData)]).size;
  const dataSizeKB = (dataSize / 1024).toFixed(1);

  const counts = {
    compras: (appData.compras||[]).length,
    vendas: (appData.vendas||[]).length,
    clientes: (appData.clientes||[]).length,
    fornecedores: (appData.fornecedores||[]).length,
    produtos: (appData.produtos||[]).length,
    pFornecedores: (appData.pFornecedores||[]).length,
    boletos: (appData.boletos||[]).length,
    cheques: (appData.cheques||[]).length,
    prestacoes: (appData.prestacoes||[]).length,
    projetos: (appData.projetos||[]).length,
    pagClientes: (appData.pagClientes||[]).length,
    garantias: (appData.garantias||[]).length,
    notasEntrada: (appData.notasEntrada||[]).length,
    notasSaida: (appData.notasSaida||[]).length
  };

  const totalRegistros = Object.values(counts).reduce((a,b) => a+b, 0);

  pageEl.innerHTML = `
    <div class="page-header">
      <h2>Backup e Restauração</h2>
    </div>

    <div class="dashboard-grid" style="margin-bottom:24px;">
      <div class="card">
        <div class="card-header"><span class="card-icon">📊</span><span>Total Registros</span></div>
        <div class="card-value">${totalRegistros}</div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-icon">💾</span><span>Tamanho dos Dados</span></div>
        <div class="card-value">${dataSizeKB} KB</div>
      </div>
    </div>

    <div class="section-title">Registros por Módulo</div>
    <div class="table-responsive" style="margin-bottom:24px;">
      <table class="table">
        <thead><tr><th>Módulo</th><th>Registros</th></tr></thead>
        <tbody>
          ${Object.entries(counts).map(([k,v]) => `<tr><td>${k}</td><td><strong>${v}</strong></td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section-title">Ações</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;">
      <button class="btn btn-primary" onclick="exportBackup()">📥 Exportar Backup (JSON)</button>
      <label class="btn btn-outline" style="cursor:pointer">
        📤 Importar Backup
        <input type="file" accept=".json" onchange="importBackup(event)" style="display:none">
      </label>
      <button class="btn btn-warning" onclick="restoreDefaults()">🔄 Restaurar Padrão</button>
      <button class="btn btn-danger" onclick="clearAllData()">🗑️ Limpar Todos os Dados</button>
    </div>
  `;
}

function exportBackup() {
  const data = JSON.stringify(appData, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wdmaquinas_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exportado!', 'success');
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!confirm('Isso substituirá todos os dados atuais. Deseja continuar?')) return;
      appData = imported;
      saveData();
      updateSidebarLogo();
      showToast('Backup importado com sucesso!', 'success');
      navigateTo('dashboard');
    } catch(err) {
      showToast('Arquivo inválido!', 'error');
    }
  };
  reader.readAsText(file);
}

function restoreDefaults() {
  if (!confirm('Restaurar todos os dados para o padrão original? Isso apagará alterações feitas.')) return;
  appData = getDefaultData();
  saveData();
  updateSidebarLogo();
  showToast('Dados restaurados ao padrão!', 'success');
  navigateTo('dashboard');
}

function clearAllData() {
  if (!confirm('ATENÇÃO: Isso apagará TODOS os dados permanentemente! Deseja continuar?')) return;
  if (!confirm('Tem certeza ABSOLUTA? Esta ação não pode ser desfeita!')) return;
  localStorage.removeItem('wdmaquinas_data');
  appData = getDefaultData();
  // limpar todos os arrays
  Object.keys(appData).forEach(k => {
    if (Array.isArray(appData[k])) appData[k] = [];
  });
  appData.fluxoCaixa = {};
  saveData();
  updateSidebarLogo();
  showToast('Todos os dados foram apagados!', 'success');
  navigateTo('dashboard');
}

// ==========================================
// INIT
// ==========================================
function init() {
  loadData();

  // Data atual na topbar
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const hoje = new Date();
    const diasSemana = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    dateEl.textContent = `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
  }

  // Fechar modais ao clicar fora
  document.getElementById('cadastroModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeCadastroModal();
  });
  document.getElementById('viewModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeViewModal();
  });

  // Renderizar dashboard
  navigateTo('dashboard');
}

// Iniciar quando DOM pronto
document.addEventListener('DOMContentLoaded', init);
