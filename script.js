// ============================================================
// WD MÁQUINAS - SISTEMA DE FLUXO DE CAIXA 2026
// script.js — PARTE 3 (Dados padrão + Funções base)
// ============================================================

// ==================== DADOS PADRÃO ====================
function getDefaultData() {
    return {
        empresa: {
            nome: "WD MÁQUINAS",
            cnpj: "29.595.239/0001-33",
            socios: ["Wander", "Daniel"],
            metaSalario: 6000,
            metaVendas: 30000
        },
        config: {
            vendedores: ["Wander", "Daniel"],
            formasPagamento: ["Dinheiro", "PIX", "Cartão Crédito", "Cartão Débito", "Boleto", "Cheque", "Transferência"],
            tiposUnidade: ["Unidade", "Metro", "Centímetro", "Milímetro", "Kg", "Litro", "Peça", "Par", "Caixa", "Rolo", "Pacote"],
            situacaoCompra: ["Pago", "Devendo", "Guardado"],
            tipoVenda: ["Direta", "Revenda"],
            situacaoEntrega: ["Entregue", "Não Entregue"],
            situacaoGarantia: ["Ativa", "Vencida"],
            situacaoCheque: ["Depositado", "Devolvido para o cliente", "Esperando para depositar"]
        },
        clientes: [
            { id: 1, nome: "Supermercado Bom Preço", cpfcnpj: "12.345.678/0001-99", telefone: "(34) 99999-1111", endereco: "Rua A, 100", numero: "100", cep: "38400-000", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 2, nome: "Fazenda São José", cpfcnpj: "98.765.432/0001-11", telefone: "(34) 99999-2222", endereco: "Rod. BR-050, Km 10", numero: "S/N", cep: "38400-100", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 3, nome: "Oficina do João", cpfcnpj: "111.222.333-44", telefone: "(34) 99999-3333", endereco: "Av. Brasil, 500", numero: "500", cep: "38400-200", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 4, nome: "Construtora ABC", cpfcnpj: "22.333.444/0001-55", telefone: "(34) 99999-4444", endereco: "Rua das Flores, 200", numero: "200", cep: "38400-300", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 5, nome: "Maria Silva", cpfcnpj: "555.666.777-88", telefone: "(34) 99999-5555", endereco: "Rua C, 50", numero: "50", cep: "38400-400", cidade: "Araguari", estado: "MG", imagem: "" },
            { id: 6, nome: "Pedro Souza", cpfcnpj: "999.888.777-66", telefone: "(34) 99999-6666", endereco: "Av. Central, 800", numero: "800", cep: "38400-500", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 7, nome: "Loja do Campo", cpfcnpj: "33.444.555/0001-66", telefone: "(34) 99999-7777", endereco: "Rua Rural, 300", numero: "300", cep: "38400-600", cidade: "Tupaciguara", estado: "MG", imagem: "" },
            { id: 8, nome: "Auto Peças Central", cpfcnpj: "44.555.666/0001-77", telefone: "(34) 99999-8888", endereco: "Av. Industrial, 1500", numero: "1500", cep: "38400-700", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 9, nome: "José Ferreira", cpfcnpj: "222.333.444-55", telefone: "(34) 99999-9999", endereco: "Rua D, 75", numero: "75", cep: "38400-800", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 10, nome: "Marcenaria Elite", cpfcnpj: "55.666.777/0001-88", telefone: "(34) 98888-1111", endereco: "Rua E, 450", numero: "450", cep: "38400-900", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 11, nome: "Serralheria Forte", cpfcnpj: "66.777.888/0001-99", telefone: "(34) 98888-2222", endereco: "Av. F, 600", numero: "600", cep: "38401-000", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 12, nome: "Carlos Mendes", cpfcnpj: "333.444.555-66", telefone: "(34) 98888-3333", endereco: "Rua G, 120", numero: "120", cep: "38401-100", cidade: "Araguari", estado: "MG", imagem: "" }
        ],
        fornecedores: [
            { id: 1, nome: "Aço Forte Distribuidor", cpfcnpj: "11.222.333/0001-44", telefone: "(11) 3333-1111", endereco: "Rua Industrial, 1000", numero: "1000", cep: "01000-000", cidade: "São Paulo", estado: "SP", imagem: "" },
            { id: 2, nome: "Ferramentas Brasil", cpfcnpj: "22.333.444/0001-55", telefone: "(11) 3333-2222", endereco: "Av. Máquinas, 500", numero: "500", cep: "02000-000", cidade: "São Paulo", estado: "SP", imagem: "" },
            { id: 3, nome: "Motores & Cia", cpfcnpj: "33.444.555/0001-66", telefone: "(19) 3333-3333", endereco: "Rod. Campinas, Km 5", numero: "S/N", cep: "13000-000", cidade: "Campinas", estado: "SP", imagem: "" },
            { id: 4, nome: "Hidráulica Total", cpfcnpj: "44.555.666/0001-77", telefone: "(34) 3333-4444", endereco: "Rua H, 200", numero: "200", cep: "38400-000", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 5, nome: "Elétrica Master", cpfcnpj: "55.666.777/0001-88", telefone: "(34) 3333-5555", endereco: "Av. Energia, 300", numero: "300", cep: "38400-100", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 6, nome: "Parafusos & Fixações", cpfcnpj: "66.777.888/0001-99", telefone: "(11) 3333-6666", endereco: "Rua Fixação, 150", numero: "150", cep: "03000-000", cidade: "São Paulo", estado: "SP", imagem: "" },
            { id: 7, nome: "Soldas Profissionais", cpfcnpj: "77.888.999/0001-00", telefone: "(34) 3333-7777", endereco: "Rua Solda, 400", numero: "400", cep: "38400-200", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 8, nome: "Rolamentos Express", cpfcnpj: "88.999.000/0001-11", telefone: "(11) 3333-8888", endereco: "Av. Rolamento, 700", numero: "700", cep: "04000-000", cidade: "São Paulo", estado: "SP", imagem: "" },
            { id: 9, nome: "Bombas Hidráulicas SA", cpfcnpj: "99.000.111/0001-22", telefone: "(19) 3333-9999", endereco: "Rod. Industrial, Km 15", numero: "S/N", cep: "13100-000", cidade: "Campinas", estado: "SP", imagem: "" },
            { id: 10, nome: "Correias & Polias", cpfcnpj: "10.111.222/0001-33", telefone: "(34) 3333-0000", endereco: "Rua Correia, 250", numero: "250", cep: "38400-300", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 11, nome: "Tintas Industrial", cpfcnpj: "11.222.333/0001-44", telefone: "(34) 3334-1111", endereco: "Av. Tinta, 800", numero: "800", cep: "38400-400", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 12, nome: "Mangueiras Flex", cpfcnpj: "12.333.444/0001-55", telefone: "(11) 3334-2222", endereco: "Rua Flex, 90", numero: "90", cep: "05000-000", cidade: "São Paulo", estado: "SP", imagem: "" },
            { id: 13, nome: "Vedações Center", cpfcnpj: "13.444.555/0001-66", telefone: "(34) 3334-3333", endereco: "Rua Veda, 110", numero: "110", cep: "38400-500", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 14, nome: "Compressores Max", cpfcnpj: "14.555.666/0001-77", telefone: "(19) 3334-4444", endereco: "Av. Ar, 600", numero: "600", cep: "13200-000", cidade: "Jundiaí", estado: "SP", imagem: "" },
            { id: 15, nome: "Filtros Industrial", cpfcnpj: "15.666.777/0001-88", telefone: "(34) 3334-5555", endereco: "Rua Filtro, 350", numero: "350", cep: "38400-600", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 16, nome: "Lubrificantes Pro", cpfcnpj: "16.777.888/0001-99", telefone: "(11) 3334-6666", endereco: "Av. Óleo, 450", numero: "450", cep: "06000-000", cidade: "Osasco", estado: "SP", imagem: "" },
            { id: 17, nome: "Cabos de Aço Ltda", cpfcnpj: "17.888.999/0001-00", telefone: "(34) 3334-7777", endereco: "Rua Cabo, 500", numero: "500", cep: "38400-700", cidade: "Uberlândia", estado: "MG", imagem: "" },
            { id: 18, nome: "Engrenagens Precisão", cpfcnpj: "18.999.000/0001-11", telefone: "(19) 3334-8888", endereco: "Rod. Engrenagem, Km 8", numero: "S/N", cep: "13300-000", cidade: "Campinas", estado: "SP", imagem: "" },
            { id: 19, nome: "Materiais Gerais MG", cpfcnpj: "19.000.111/0001-22", telefone: "(34) 3334-9999", endereco: "Av. Geral, 1200", numero: "1200", cep: "38400-800", cidade: "Uberlândia", estado: "MG", imagem: "" }
        ],
        produtos: [
            { id: 1, nome: "Motor Elétrico 5CV", valorCusto: 1200, valorRevenda: 1800, valorDireto: 2200, unidade: "Unidade", imagem: "" },
            { id: 2, nome: "Bomba Hidráulica P30", valorCusto: 850, valorRevenda: 1300, valorDireto: 1600, unidade: "Unidade", imagem: "" },
            { id: 3, nome: "Cilindro Hidráulico 50mm", valorCusto: 450, valorRevenda: 750, valorDireto: 950, unidade: "Unidade", imagem: "" },
            { id: 4, nome: "Mangueira Hidráulica 1/2", valorCusto: 35, valorRevenda: 65, valorDireto: 80, unidade: "Metro", imagem: "" },
            { id: 5, nome: "Rolamento 6205", valorCusto: 25, valorRevenda: 50, valorDireto: 65, unidade: "Unidade", imagem: "" },
            { id: 6, nome: "Correia A-60", valorCusto: 18, valorRevenda: 35, valorDireto: 45, unidade: "Unidade", imagem: "" },
            { id: 7, nome: "Válvula Direcional", valorCusto: 380, valorRevenda: 600, valorDireto: 750, unidade: "Unidade", imagem: "" },
            { id: 8, nome: "Filtro Óleo Hidráulico", valorCusto: 45, valorRevenda: 85, valorDireto: 110, unidade: "Unidade", imagem: "" },
            { id: 9, nome: "Óleo Hidráulico 68 (20L)", valorCusto: 180, valorRevenda: 280, valorDireto: 340, unidade: "Unidade", imagem: "" },
            { id: 10, nome: "Retentor 50x70x10", valorCusto: 12, valorRevenda: 28, valorDireto: 35, unidade: "Unidade", imagem: "" },
            { id: 11, nome: "Acoplamento Flexível", valorCusto: 95, valorRevenda: 160, valorDireto: 200, unidade: "Unidade", imagem: "" },
            { id: 12, nome: "Chapa de Aço 3mm", valorCusto: 120, valorRevenda: 200, valorDireto: 250, unidade: "Metro", imagem: "" },
            { id: 13, nome: "Tubo Hidráulico 1\"", valorCusto: 55, valorRevenda: 95, valorDireto: 120, unidade: "Metro", imagem: "" },
            { id: 14, nome: "Manômetro 0-250 bar", valorCusto: 65, valorRevenda: 120, valorDireto: 150, unidade: "Unidade", imagem: "" },
            { id: 15, nome: "Eletrodo Solda 3.25mm", valorCusto: 45, valorRevenda: 75, valorDireto: 90, unidade: "Kg", imagem: "" }
        ],
        pfornecedores: [
            { id: 1, nome: "Motor Elétrico 5CV", valor: 1200, unidade: "Unidade", fornecedor: "Motores & Cia", imagem: "" },
            { id: 2, nome: "Bomba Hidráulica P30", valor: 850, unidade: "Unidade", fornecedor: "Bombas Hidráulicas SA", imagem: "" },
            { id: 3, nome: "Cilindro Hidráulico 50mm", valor: 450, unidade: "Unidade", fornecedor: "Hidráulica Total", imagem: "" },
            { id: 4, nome: "Mangueira Hidráulica 1/2", valor: 35, unidade: "Metro", fornecedor: "Mangueiras Flex", imagem: "" },
            { id: 5, nome: "Rolamento 6205", valor: 25, unidade: "Unidade", fornecedor: "Rolamentos Express", imagem: "" },
            { id: 6, nome: "Correia A-60", valor: 18, unidade: "Unidade", fornecedor: "Correias & Polias", imagem: "" },
            { id: 7, nome: "Válvula Direcional", valor: 380, unidade: "Unidade", fornecedor: "Hidráulica Total", imagem: "" },
            { id: 8, nome: "Filtro Óleo Hidráulico", valor: 45, unidade: "Unidade", fornecedor: "Filtros Industrial", imagem: "" },
            { id: 9, nome: "Óleo Hidráulico 68 (20L)", valor: 180, unidade: "Unidade", fornecedor: "Lubrificantes Pro", imagem: "" },
            { id: 10, nome: "Retentor 50x70x10", valor: 12, unidade: "Unidade", fornecedor: "Vedações Center", imagem: "" },
            { id: 11, nome: "Acoplamento Flexível", valor: 95, unidade: "Unidade", fornecedor: "Engrenagens Precisão", imagem: "" },
            { id: 12, nome: "Chapa de Aço 3mm", valor: 120, unidade: "Metro", fornecedor: "Aço Forte Distribuidor", imagem: "" },
            { id: 13, nome: "Tubo Hidráulico 1\"", valor: 55, unidade: "Metro", fornecedor: "Hidráulica Total", imagem: "" },
            { id: 14, nome: "Manômetro 0-250 bar", valor: 65, unidade: "Unidade", fornecedor: "Hidráulica Total", imagem: "" },
            { id: 15, nome: "Eletrodo Solda 3.25mm", valor: 45, unidade: "Kg", fornecedor: "Soldas Profissionais", imagem: "" },
            { id: 16, nome: "Parafuso Sextavado M12", valor: 2.5, unidade: "Unidade", fornecedor: "Parafusos & Fixações", imagem: "" }
        ],
        compras: [
            { id: 1, data: "2026-01-10", vencimento: "2026-02-10", produto: "Motor Elétrico 5CV", qtd: 2, valorUnit: 1200, fornecedor: "Motores & Cia", formaPagto: "Boleto", status: "Pago" },
            { id: 2, data: "2026-01-15", vencimento: "2026-02-15", produto: "Bomba Hidráulica P30", qtd: 3, valorUnit: 850, fornecedor: "Bombas Hidráulicas SA", formaPagto: "PIX", status: "Pago" },
            { id: 3, data: "2026-01-22", vencimento: "2026-03-22", produto: "Mangueira Hidráulica 1/2", qtd: 50, valorUnit: 35, fornecedor: "Mangueiras Flex", formaPagto: "Boleto", status: "Devendo" },
            { id: 4, data: "2026-02-05", vencimento: "2026-03-05", produto: "Rolamento 6205", qtd: 20, valorUnit: 25, fornecedor: "Rolamentos Express", formaPagto: "Dinheiro", status: "Pago" },
            { id: 5, data: "2026-02-18", vencimento: "2026-04-18", produto: "Válvula Direcional", qtd: 2, valorUnit: 380, fornecedor: "Hidráulica Total", formaPagto: "Cartão Crédito", status: "Devendo" },
            { id: 6, data: "2026-03-01", vencimento: "2026-04-01", produto: "Óleo Hidráulico 68 (20L)", qtd: 5, valorUnit: 180, fornecedor: "Lubrificantes Pro", formaPagto: "PIX", status: "Pago" },
            { id: 7, data: "2026-03-10", vencimento: "2026-05-10", produto: "Chapa de Aço 3mm", qtd: 10, valorUnit: 120, fornecedor: "Aço Forte Distribuidor", formaPagto: "Boleto", status: "Guardado" }
        ],
        vendas: [
            { id: 1, data: "2026-01-08", produto: "Motor Elétrico 5CV", vendedor: "Wander", qtd: 1, valor: 2200, cliente: "Oficina do João", tipoVenda: "Direta", status: "Pago", entrega: "Entregue" },
            { id: 2, data: "2026-01-12", produto: "Bomba Hidráulica P30", vendedor: "Daniel", qtd: 2, valor: 1600, cliente: "Fazenda São José", tipoVenda: "Direta", status: "Pago", entrega: "Entregue" },
            { id: 3, data: "2026-01-25", produto: "Cilindro Hidráulico 50mm", vendedor: "Daniel", qtd: 3, valor: 950, cliente: "Construtora ABC", tipoVenda: "Direta", status: "Devendo", entrega: "Entregue" },
            { id: 4, data: "2026-02-03", produto: "Mangueira Hidráulica 1/2", vendedor: "Wander", qtd: 20, valor: 80, cliente: "Auto Peças Central", tipoVenda: "Revenda", status: "Pago", entrega: "Entregue" },
            { id: 5, data: "2026-02-14", produto: "Rolamento 6205", vendedor: "Daniel", qtd: 10, valor: 65, cliente: "Serralheria Forte", tipoVenda: "Revenda", status: "Pago", entrega: "Entregue" },
            { id: 6, data: "2026-03-02", produto: "Válvula Direcional", vendedor: "Wander", qtd: 1, valor: 750, cliente: "Marcenaria Elite", tipoVenda: "Direta", status: "Devendo", entrega: "Não Entregue" },
            { id: 7, data: "2026-03-08", produto: "Motor Elétrico 5CV", vendedor: "Daniel", qtd: 1, valor: 1800, cliente: "Loja do Campo", tipoVenda: "Revenda", status: "Pago", entrega: "Entregue" }
        ],
        estoque: [
            { id: 1, produto: "Motor Elétrico 5CV", emEstoque: 4, compras: 6, vendas: 2, valorCompra: 1200, valorVenda: 2000 },
            { id: 2, produto: "Bomba Hidráulica P30", emEstoque: 3, compras: 5, vendas: 2, valorCompra: 850, valorVenda: 1450 },
            { id: 3, produto: "Cilindro Hidráulico 50mm", emEstoque: 5, compras: 8, vendas: 3, valorCompra: 450, valorVenda: 850 },
            { id: 4, produto: "Mangueira Hidráulica 1/2", emEstoque: 80, compras: 100, vendas: 20, valorCompra: 35, valorVenda: 72.5 },
            { id: 5, produto: "Rolamento 6205", emEstoque: 30, compras: 40, vendas: 10, valorCompra: 25, valorVenda: 57.5 },
            { id: 6, produto: "Correia A-60", emEstoque: 15, compras: 20, vendas: 5, valorCompra: 18, valorVenda: 40 },
            { id: 7, produto: "Válvula Direcional", emEstoque: 2, compras: 4, vendas: 2, valorCompra: 380, valorVenda: 675 },
            { id: 8, produto: "Filtro Óleo Hidráulico", emEstoque: 12, compras: 15, vendas: 3, valorCompra: 45, valorVenda: 97.5 },
            { id: 9, produto: "Óleo Hidráulico 68 (20L)", emEstoque: 8, compras: 13, vendas: 5, valorCompra: 180, valorVenda: 310 },
            { id: 10, produto: "Retentor 50x70x10", emEstoque: 25, compras: 30, vendas: 5, valorCompra: 12, valorVenda: 31.5 }
        ],
        boletos: [
            { id: 1, dataSaida: "2026-01-15", cliente: "Construtora ABC", valor: 2850, vencimento: "2026-02-15", dataReceber: "2026-02-20", situacao: "Pago" },
            { id: 2, dataSaida: "2026-02-10", cliente: "Fazenda São José", valor: 3200, vencimento: "2026-03-10", dataReceber: "", situacao: "A Vencer" },
            { id: 3, dataSaida: "2026-03-05", cliente: "Serralheria Forte", valor: 1650, vencimento: "2026-04-05", dataReceber: "", situacao: "A Vencer" }
        ],
        cheques: [
            { id: 1, data: "2026-01-20", cliente: "Oficina do João", banco: "Bradesco", numCheque: "001234", valor: 2200, vencimento: "2026-02-20", compensou: "2026-02-22", situacao: "Depositado", obs: "" },
            { id: 2, data: "2026-02-15", cliente: "Auto Peças Central", banco: "Itaú", numCheque: "005678", valor: 1600, vencimento: "2026-03-15", compensou: "", situacao: "Esperando para depositar", obs: "Aguardando data" }
        ],
        prestacoes: [
            { id: 1, nome: "Nubank", valorParcela: 2368.63, numParcelas: 5, meses: [2368.63, 2368.63, 2368.63, 2368.63, 2368.63, 0, 0, 0, 0, 0, 0, 0] },
            { id: 2, nome: "Financiamento Veículo", valorParcela: 450, numParcelas: 12, meses: [450, 450, 450, 450, 450, 450, 450, 450, 450, 450, 450, 450] },
            { id: 3, nome: "Empréstimo Banco", valorParcela: 280, numParcelas: 8, meses: [280, 280, 280, 280, 280, 280, 280, 280, 0, 0, 0, 0] },
            { id: 4, nome: "Cartão Corporativo", valorParcela: 156.84, numParcelas: 3, meses: [156.84, 156.84, 156.84, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            { id: 5, nome: "Equipamento Solda", valorParcela: 32, numParcelas: 6, meses: [32, 32, 32, 32, 32, 32, 0, 0, 0, 0, 0, 0] }
        ],
        projetos: [
            { id: 1, nome: "Reforma Galpão", valorParcela: 1500, numParcelas: 4, meses: [1500, 1500, 1500, 1500, 0, 0, 0, 0, 0, 0, 0, 0] },
            { id: 2, nome: "Compra Torno CNC", valorParcela: 3000, numParcelas: 6, meses: [3000, 3000, 3000, 3000, 3000, 3000, 0, 0, 0, 0, 0, 0] }
        ],
        pagClientes: [
            { id: 1, data: "2026-01-20", cliente: "Construtora ABC", valor: 1500, formaPagto: "PIX", obs: "Parcela 1" },
            { id: 2, data: "2026-02-10", cliente: "Construtora ABC", valor: 1350, formaPagto: "Boleto", obs: "Parcela 2" },
            { id: 3, data: "2026-02-20", cliente: "Fazenda São José", valor: 3200, formaPagto: "Transferência", obs: "Pagamento total" }
        ],
        garantias: [
            { id: 1, inicio: "2026-01-08", cliente: "Oficina do João", produto: "Motor Elétrico 5CV", vencimento: "2027-01-08", situacao: "Ativa" },
            { id: 2, inicio: "2026-01-12", cliente: "Fazenda São José", produto: "Bomba Hidráulica P30", vencimento: "2027-01-12", situacao: "Ativa" },
            { id: 3, inicio: "2025-06-15", cliente: "Maria Silva", produto: "Rolamento 6205", vencimento: "2025-12-15", situacao: "Vencida" },
            { id: 4, inicio: "2026-02-03", cliente: "Auto Peças Central", produto: "Mangueira Hidráulica 1/2", vencimento: "2026-08-03", situacao: "Ativa" }
        ],
        notasEntrada: [
            { id: 1, data: "2026-01-10", fornecedor: "Motores & Cia", valor: 2400, mesRef: 0 },
            { id: 2, data: "2026-01-15", fornecedor: "Bombas Hidráulicas SA", valor: 2550, mesRef: 0 },
            { id: 3, data: "2026-02-05", fornecedor: "Rolamentos Express", valor: 500, mesRef: 1 },
            { id: 4, data: "2026-03-01", fornecedor: "Lubrificantes Pro", valor: 900, mesRef: 2 }
        ],
        notasSaida: [
            { id: 1, data: "2026-01-08", cliente: "Oficina do João", valor: 2200, mesRef: 0 },
            { id: 2, data: "2026-01-12", cliente: "Fazenda São José", valor: 3200, mesRef: 0 },
            { id: 3, data: "2026-02-03", cliente: "Auto Peças Central", valor: 1600, mesRef: 1 },
            { id: 4, data: "2026-03-02", cliente: "Marcenaria Elite", valor: 750, mesRef: 2 }
        ],
        fluxoCaixa: {
            janeiro: {
                entradas: [
                    [5765.34, 0, 0, 0, 0, 0, 0, 2200, 0, 0, 0, 0, 3200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2850, 0, 5765.34, 0, 0, 1932.78, 6300],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                dinheiro: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                wander: [0, 0, 0, 0, 0, 0, 0, 2200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5765.34, 0, 0, 1932.78, 1414.72],
                daniel: [5765.34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2850, 0, 0, 0, 0, 0, 11147.28],
                saidas: [
                    [0, 0, 0, 0, 0, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 1200, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                combustivel: [0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 250, 0]
            },
            fevereiro: {
                entradas: [
                    [0, 0, 1600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 650, 0, 0, 0, 0, 0, 3200, 0, 0, 0, 0, 0, 0, 2500, 4266.10],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                dinheiro: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                wander: [0, 0, 1600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4266.10],
                daniel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 650, 0, 0, 0, 0, 0, 3200, 0, 0, 0, 0, 0, 0, 2500, 0],
                saidas: [
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 380, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                combustivel: [0, 0, 0, 0, 200, 0, 0, 0, 0, 200, 0, 0, 0, 0, 0, 200, 0, 0, 0, 0, 200, 0, 0, 0, 0, 0, 0, 156.63]
            },
            marco: {
                entradas: [
                    [0, 750, 0, 0, 0, 0, 0, 1800, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4748.68],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                dinheiro: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                wander: [0, 750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4748.68],
                daniel: [0, 0, 0, 0, 0, 0, 0, 1800, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                saidas: [
                    [900, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                combustivel: [0, 0, 0, 0, 200, 0, 0, 0, 0, 200, 0, 0, 0, 0, 0, 200, 0, 0, 0, 0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 98.68]
            }
        }
    };
}

// ==================== VARIÁVEIS GLOBAIS ====================
var appData = {};
var currentPage = 'dashboard';
var currentCadastroType = '';
var currentEditId = null;

// ==================== MESES CONFIG ====================
var MESES_CONFIG = [
    { nome: 'Janeiro', chave: 'janeiro', ano: 2026, mes: 0, dias: 31 },
    { nome: 'Fevereiro', chave: 'fevereiro', ano: 2026, mes: 1, dias: 28 },
    { nome: 'Março', chave: 'marco', ano: 2026, mes: 2, dias: 31 },
    { nome: 'Abril', chave: 'abril', ano: 2026, mes: 3, dias: 30 },
    { nome: 'Maio', chave: 'maio', ano: 2026, mes: 4, dias: 31 },
    { nome: 'Junho', chave: 'junho', ano: 2026, mes: 5, dias: 30 },
    { nome: 'Julho', chave: 'julho', ano: 2026, mes: 6, dias: 31 },
    { nome: 'Agosto', chave: 'agosto', ano: 2026, mes: 7, dias: 31 },
    { nome: 'Setembro', chave: 'setembro', ano: 2026, mes: 8, dias: 30 },
    { nome: 'Outubro', chave: 'outubro', ano: 2026, mes: 9, dias: 31 },
    { nome: 'Novembro', chave: 'novembro', ano: 2026, mes: 10, dias: 30 },
    { nome: 'Dezembro', chave: 'dezembro', ano: 2026, mes: 11, dias: 31 }
];

var DIAS_SEMANA_ABREV = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
var NUM_LINHAS_ENTRADA = 7;
var NUM_LINHAS_SAIDA = 9;
var MESES_NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ==================== FUNÇÕES BASE ====================
function loadData() {
    var saved = localStorage.getItem('wdmaquinas_data');
    if (saved) {
        try {
            appData = JSON.parse(saved);
        } catch (e) {
            appData = getDefaultData();
        }
    } else {
        appData = getDefaultData();
    }
    // Garantir campos
    if (!appData.config) appData.config = getDefaultData().config;
    if (!appData.clientes) appData.clientes = [];
    if (!appData.fornecedores) appData.fornecedores = [];
    if (!appData.produtos) appData.produtos = [];
    if (!appData.pfornecedores) appData.pfornecedores = [];
    if (!appData.compras) appData.compras = [];
    if (!appData.vendas) appData.vendas = [];
    if (!appData.estoque) appData.estoque = [];
    if (!appData.boletos) appData.boletos = [];
    if (!appData.cheques) appData.cheques = [];
    if (!appData.prestacoes) appData.prestacoes = [];
    if (!appData.projetos) appData.projetos = [];
    if (!appData.pagClientes) appData.pagClientes = [];
    if (!appData.garantias) appData.garantias = [];
    if (!appData.notasEntrada) appData.notasEntrada = [];
    if (!appData.notasSaida) appData.notasSaida = [];
    if (!appData.fluxoCaixa) appData.fluxoCaixa = {};
}

function saveData() {
    localStorage.setItem('wdmaquinas_data', JSON.stringify(appData));
}

function formatCurrency(v) {
    var n = parseFloat(v) || 0;
    return 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDate(d) {
    if (!d) return '-';
    var parts = d.split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
    return d;
}

function formatCPFCNPJ(v) {
    var num = v.replace(/\D/g, '');
    if (num.length <= 11) {
        return num.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        return num.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

function formatTelefone(v) {
    var num = v.replace(/\D/g, '');
    if (num.length === 11) {
        return '(' + num.substr(0, 2) + ') ' + num.substr(2, 5) + '-' + num.substr(7, 4);
    } else if (num.length === 10) {
        return '(' + num.substr(0, 2) + ') ' + num.substr(2, 4) + '-' + num.substr(6, 4);
    }
    return v;
}

function formatCEP(v) {
    var num = v.replace(/\D/g, '');
    if (num.length === 8) {
        return num.substr(0, 5) + '-' + num.substr(5, 3);
    }
    return v;
}

function nextId(arr) {
    if (!arr || arr.length === 0) return 1;
    return Math.max.apply(null, arr.map(function (i) { return i.id || 0; })) + 1;
}

function showToast(msg) {
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function () {
        toast.remove();
    }, 3000);
}

function getDiasEntreHoje(dataStr) {
    if (!dataStr) return 0;
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var data = new Date(dataStr + 'T00:00:00');
    var diff = data.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ==================== NAVEGAÇÃO ====================
function navigateTo(page) {
    currentPage = page;

    // Remover active de todas as páginas
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }

    // Ativar página
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    // Atualizar nav
    var navItems = document.querySelectorAll('.nav-item');
    for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove('active');
    }
    var clickedNav = event ? event.currentTarget : null;
    if (clickedNav) clickedNav.classList.add('active');

    // Atualizar título
    var titles = {
        dashboard: 'Dashboard', janeiro: 'Janeiro 2026', fevereiro: 'Fevereiro 2026', marco: 'Março 2026',
        abril: 'Abril 2026', maio: 'Maio 2026', junho: 'Junho 2026', julho: 'Julho 2026',
        agosto: 'Agosto 2026', setembro: 'Setembro 2026', outubro: 'Outubro 2026', novembro: 'Novembro 2026',
        dezembro: 'Dezembro 2026', compras: 'Compras', vendas: 'Vendas', estoque: 'Estoque',
        produtos: 'Produtos', clientes: 'Clientes', fornecedores: 'Fornecedores', pfornecedores: 'Produtos dos Fornecedores',
        boletos: 'Boletos', cheques: 'Cheques', prestacoes: 'Prestações', projetos: 'Projetos',
        pagclientes: 'Pagamentos de Clientes', garantias: 'Garantias', relatorios: 'Relatórios',
        notasentrada: 'Notas de Entrada', notassaida: 'Notas de Saída', receitasmei: 'Receitas MEI',
        configuracoes: 'Configurações', backup: 'Backup & Restauração'
    };
    document.getElementById('topbarTitle').textContent = titles[page] || page;

    // Fechar sidebar mobile
    document.getElementById('sidebar').classList.remove('open');

    // Renderizar conteúdo da página
    renderPage(page);
}

function renderPage(page) {
    if (page === 'dashboard') renderDashboard();
    else if (page === 'compras') renderCompras();
    else if (page === 'vendas') renderVendas();
    else if (page === 'estoque') renderEstoque();
    else if (page === 'clientes') renderClientes();
    else if (page === 'fornecedores') renderFornecedores();
    else if (page === 'produtos') renderProdutos();
    else if (page === 'pfornecedores') renderPFornecedores();
    else if (page === 'boletos') renderBoletos();
    else if (page === 'cheques') renderCheques();
    else if (page === 'prestacoes') renderPrestacoes();
    else if (page === 'projetos') renderProjetos();
    else if (page === 'pagclientes') renderPagClientes();
    else if (page === 'garantias') renderGarantias();
    else if (page === 'relatorios') renderRelatorios();
    else if (page === 'notasentrada') renderNotasEntrada();
    else if (page === 'notassaida') renderNotasSaida();
    else if (page === 'receitasmei') renderReceitasMei();
    else if (page === 'configuracoes') renderConfiguracoes();
    else if (page === 'backup') renderBackupInfo();
    else {
        // Meses
        for (var m = 0; m < MESES_CONFIG.length; m++) {
            if (page === MESES_CONFIG[m].chave) {
                renderFluxoMes(MESES_CONFIG[m]);
                break;
            }
        }
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ============================================================
// PARTE 4 — DASHBOARD + FLUXO DE CAIXA MENSAL
// ============================================================

// ==================== DASHBOARD ====================
function renderDashboard() {
    var totalEntradas = 0, totalSaidas = 0;
    var totalWander = 0, totalDaniel = 0;
    var entradasMes = [], saidasMes = [];

    for (var m = 0; m < MESES_CONFIG.length; m++) {
        var mc = MESES_CONFIG[m];
        var fc = appData.fluxoCaixa[mc.chave];
        var entM = 0, saiM = 0;
        if (fc) {
            for (var d = 0; d < mc.dias; d++) {
                for (var r = 0; r < NUM_LINHAS_ENTRADA; r++) {
                    if (fc.entradas && fc.entradas[r] && fc.entradas[r][d]) entM += fc.entradas[r][d];
                }
                for (var s = 0; s < NUM_LINHAS_SAIDA; s++) {
                    if (fc.saidas && fc.saidas[s] && fc.saidas[s][d]) saiM += fc.saidas[s][d];
                }
                if (fc.combustivel && fc.combustivel[d]) saiM += fc.combustivel[d];
            }
            if (fc.wander) {
                for (var w = 0; w < mc.dias; w++) {
                    if (fc.wander[w]) totalWander += fc.wander[w];
                }
            }
            if (fc.daniel) {
                for (var dd = 0; dd < mc.dias; dd++) {
                    if (fc.daniel[dd]) totalDaniel += fc.daniel[dd];
                }
            }
        }
        totalEntradas += entM;
        totalSaidas += saiM;
        entradasMes.push(entM);
        saidasMes.push(saiM);
    }

    var totalCompras = 0, totalComprasPago = 0;
    for (var c = 0; c < appData.compras.length; c++) {
        var comp = appData.compras[c];
        var compTotal = (comp.qtd || 0) * (comp.valorUnit || 0);
        totalCompras += compTotal;
        if (comp.status === 'Pago') totalComprasPago += compTotal;
    }

    var totalVendas = 0, totalVendasPago = 0;
    for (var v = 0; v < appData.vendas.length; v++) {
        var ven = appData.vendas[v];
        var venTotal = (ven.qtd || 0) * (ven.valor || 0);
        totalVendas += venTotal;
        if (ven.status === 'Pago') totalVendasPago += venTotal;
    }

    var totalDividas = 0, totalPresMes = 0;
    for (var p = 0; p < appData.prestacoes.length; p++) {
        var pres = appData.prestacoes[p];
        if (pres.meses) {
            for (var pm = 0; pm < pres.meses.length; pm++) {
                totalDividas += (pres.meses[pm] || 0);
            }
        }
        var mesAtual = new Date().getMonth();
        if (pres.meses && pres.meses[mesAtual]) totalPresMes += pres.meses[mesAtual];
    }

    var totalEstoque = 0;
    for (var e = 0; e < appData.estoque.length; e++) {
        totalEstoque += (appData.estoque[e].emEstoque || 0) * (appData.estoque[e].valorCompra || 0);
    }

    var garantiasAtivas = 0;
    for (var g = 0; g < appData.garantias.length; g++) {
        if (appData.garantias[g].situacao === 'Ativa') garantiasAtivas++;
    }

    var boletosTotal = 0;
    for (var b = 0; b < appData.boletos.length; b++) {
        boletosTotal += (appData.boletos[b].valor || 0);
    }

    var caixaAtual = totalEntradas - totalSaidas;
    var lucro = totalVendas - totalCompras;

    // Cards
    var cardsHTML = '';
    var cardsData = [
        { icon: '💵', value: formatCurrency(caixaAtual), label: 'Caixa Atual', color: caixaAtual >= 0 ? 'var(--success)' : 'var(--danger)' },
        { icon: '📈', value: formatCurrency(totalEntradas), label: 'Total Entradas', color: 'var(--success)' },
        { icon: '📉', value: formatCurrency(totalSaidas), label: 'Total Saídas', color: 'var(--danger)' },
        { icon: '💰', value: formatCurrency(totalVendas), label: 'Vendas Anual', color: 'var(--orange-primary)' },
        { icon: '🛒', value: formatCurrency(totalCompras), label: 'Compras Anual', color: 'var(--info)' },
        { icon: '📊', value: formatCurrency(lucro), label: 'Lucro C/V', color: lucro >= 0 ? 'var(--success)' : 'var(--danger)' },
        { icon: '👤', value: formatCurrency(totalWander), label: 'Wander (Vendas)', color: '#2196f3' },
        { icon: '👤', value: formatCurrency(totalDaniel), label: 'Daniel (Vendas)', color: '#00c853' },
        { icon: '💳', value: formatCurrency(totalDividas), label: 'Total Dívidas', color: 'var(--danger)' },
        { icon: '📦', value: formatCurrency(totalEstoque), label: 'Valor Estoque', color: 'var(--warning)' },
        { icon: '🛡️', value: garantiasAtivas, label: 'Garantias Ativas', color: 'var(--info)' },
        { icon: '🔖', value: formatCurrency(boletosTotal), label: 'Total Boletos', color: 'var(--orange-primary)' }
    ];

    for (var ci = 0; ci < cardsData.length; ci++) {
        var cd = cardsData[ci];
        cardsHTML += '<div class="card"><div class="card-icon">' + cd.icon + '</div><div class="card-value" style="color:' + cd.color + '">' + cd.value + '</div><div class="card-label">' + cd.label + '</div></div>';
    }
    document.getElementById('dashboardCards').innerHTML = cardsHTML;

    // Metas
    var mesAtualIdx = new Date().getMonth();
    var vendasMesAtual = 0;
    var wanderMes = 0, danielMes = 0;
    var fcAtual = appData.fluxoCaixa[MESES_CONFIG[mesAtualIdx].chave];
    if (fcAtual) {
        for (var di = 0; di < MESES_CONFIG[mesAtualIdx].dias; di++) {
            for (var ri = 0; ri < NUM_LINHAS_ENTRADA; ri++) {
                if (fcAtual.entradas && fcAtual.entradas[ri] && fcAtual.entradas[ri][di]) vendasMesAtual += fcAtual.entradas[ri][di];
            }
            if (fcAtual.wander && fcAtual.wander[di]) wanderMes += fcAtual.wander[di];
            if (fcAtual.daniel && fcAtual.daniel[di]) danielMes += fcAtual.daniel[di];
        }
    }

    var metaVendas = appData.empresa ? appData.empresa.metaVendas : 30000;
    var metaSalario = appData.empresa ? appData.empresa.metaSalario : 6000;
    var pctVendas = Math.min(100, (vendasMesAtual / metaVendas) * 100);
    var pctWander = Math.min(100, (wanderMes / metaSalario) * 100);
    var pctDaniel = Math.min(100, (danielMes / metaSalario) * 100);

    document.getElementById('metaVendasValue').textContent = formatCurrency(vendasMesAtual) + ' / ' + formatCurrency(metaVendas);
    document.getElementById('metaVendasBar').style.width = pctVendas + '%';
    document.getElementById('metaWanderValue').textContent = formatCurrency(wanderMes) + ' / ' + formatCurrency(metaSalario);
    document.getElementById('metaWanderBar').style.width = pctWander + '%';
    document.getElementById('metaDanielValue').textContent = formatCurrency(danielMes) + ' / ' + formatCurrency(metaSalario);
    document.getElementById('metaDanielBar').style.width = pctDaniel + '%';

    // Chart Entradas vs Saídas
    var maxChart = 1;
    for (var ch = 0; ch < 12; ch++) {
        if (entradasMes[ch] > maxChart) maxChart = entradasMes[ch];
        if (saidasMes[ch] > maxChart) maxChart = saidasMes[ch];
    }

    var chartHTML = '';
    for (var cm = 0; cm < 12; cm++) {
        var hE = Math.max(2, (entradasMes[cm] / maxChart) * 170);
        var hS = Math.max(2, (saidasMes[cm] / maxChart) * 170);
        chartHTML += '<div class="chart-bar-group">';
        chartHTML += '<div class="chart-bars-double">';
        chartHTML += '<div><div class="chart-bar-value">' + (entradasMes[cm] > 0 ? (entradasMes[cm] / 1000).toFixed(1) + 'k' : '') + '</div><div class="chart-bar entrada" style="height:' + hE + 'px"></div></div>';
        chartHTML += '<div><div class="chart-bar-value">' + (saidasMes[cm] > 0 ? (saidasMes[cm] / 1000).toFixed(1) + 'k' : '') + '</div><div class="chart-bar saida" style="height:' + hS + 'px"></div></div>';
        chartHTML += '</div>';
        chartHTML += '<div class="chart-bar-label">' + MESES_NOMES[cm].substr(0, 3) + '</div>';
        chartHTML += '</div>';
    }
    document.getElementById('chartEntradasSaidas').innerHTML = chartHTML;

    // Chart Vendedores
    var maxVend = Math.max(totalWander, totalDaniel, 1);
    var vendHTML = '';
    vendHTML += '<div style="flex:1"><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.85rem;"><span>Wander</span><span style="color:#2196f3;font-weight:700;">' + formatCurrency(totalWander) + '</span></div>';
    vendHTML += '<div class="progress-bar"><div class="progress-fill" style="width:' + ((totalWander / maxVend) * 100) + '%;background:#2196f3;"></div></div></div>';
    vendHTML += '<div style="flex:1"><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.85rem;"><span>Daniel</span><span style="color:#00c853;font-weight:700;">' + formatCurrency(totalDaniel) + '</span></div>';
    vendHTML += '<div class="progress-bar"><div class="progress-fill" style="width:' + ((totalDaniel / maxVend) * 100) + '%;background:#00c853;"></div></div></div>';
    document.getElementById('chartVendedores').innerHTML = vendHTML;

    // Últimas compras
    var ucHTML = '';
    var ultCompras = appData.compras.slice(-5).reverse();
    for (var uc = 0; uc < ultCompras.length; uc++) {
        var uci = ultCompras[uc];
        var statusClass = uci.status === 'Pago' ? 'badge-success' : (uci.status === 'Devendo' ? 'badge-danger' : 'badge-warning');
        ucHTML += '<tr><td>' + formatDate(uci.data) + '</td><td>' + uci.produto + '</td><td>' + formatCurrency((uci.qtd || 0) * (uci.valorUnit || 0)) + '</td><td><span class="badge ' + statusClass + '">' + uci.status + '</span></td></tr>';
    }
    document.getElementById('dashUltimasCompras').innerHTML = ucHTML || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Nenhuma compra</td></tr>';

    // Últimas vendas
    var uvHTML = '';
    var ultVendas = appData.vendas.slice(-5).reverse();
    for (var uv = 0; uv < ultVendas.length; uv++) {
        var uvi = ultVendas[uv];
        var vendBadge = uvi.vendedor === 'Wander' ? 'badge-wander' : 'badge-daniel';
        uvHTML += '<tr><td>' + formatDate(uvi.data) + '</td><td>' + uvi.produto + '</td><td>' + formatCurrency((uvi.qtd || 0) * (uvi.valor || 0)) + '</td><td><span class="badge ' + vendBadge + '">' + uvi.vendedor + '</span></td></tr>';
    }
    document.getElementById('dashUltimasVendas').innerHTML = uvHTML || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Nenhuma venda</td></tr>';

    // Compras pendentes
    var cpHTML = '';
    var pendentes = appData.compras.filter(function (c) { return c.status === 'Devendo'; });
    for (var cp = 0; cp < pendentes.length; cp++) {
        var cpi = pendentes[cp];
        var diasV = getDiasEntreHoje(cpi.vencimento);
        var diasColor = diasV < 0 ? 'var(--danger)' : (diasV <= 7 ? 'var(--warning)' : 'var(--text-secondary)');
        cpHTML += '<tr><td>' + cpi.produto + '</td><td>' + cpi.fornecedor + '</td><td>' + formatCurrency((cpi.qtd || 0) * (cpi.valorUnit || 0)) + '</td><td style="color:' + diasColor + '">' + formatDate(cpi.vencimento) + ' (' + diasV + 'd)</td></tr>';
    }
    document.getElementById('dashComprasPendentes').innerHTML = cpHTML || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Nenhuma pendência</td></tr>';

    // Prestações do mês
    var prHTML = '';
    for (var pr = 0; pr < appData.prestacoes.length; pr++) {
        var pri = appData.prestacoes[pr];
        if (pri.meses && pri.meses[mesAtualIdx] > 0) {
            prHTML += '<tr><td>' + pri.nome + '</td><td>' + pri.numParcelas + 'x</td><td>' + formatCurrency(pri.meses[mesAtualIdx]) + '</td></tr>';
        }
    }
    document.getElementById('dashPrestacoes').innerHTML = prHTML || '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">Nenhuma prestação</td></tr>';
}

// ==================== FLUXO DE CAIXA MENSAL ====================
function initFluxoMes(mesKey, dias) {
    if (!appData.fluxoCaixa[mesKey]) {
        var ent = [];
        for (var r = 0; r < NUM_LINHAS_ENTRADA; r++) {
            var row = [];
            for (var d = 0; d < dias; d++) row.push(0);
            ent.push(row);
        }
        var sai = [];
        for (var rs = 0; rs < NUM_LINHAS_SAIDA; rs++) {
            var rowS = [];
            for (var ds = 0; ds < dias; ds++) rowS.push(0);
            sai.push(rowS);
        }
        var zeros = [];
        for (var z = 0; z < dias; z++) zeros.push(0);

        appData.fluxoCaixa[mesKey] = {
            entradas: ent,
            dinheiro: zeros.slice(),
            wander: zeros.slice(),
            daniel: zeros.slice(),
            saidas: sai,
            combustivel: zeros.slice()
        };
    }
}

function calcFluxoSimple(mesKey, dias) {
    var fc = appData.fluxoCaixa[mesKey];
    if (!fc) return { totalEntradas: 0, totalSaidas: 0 };
    var tE = 0, tS = 0;
    for (var d = 0; d < dias; d++) {
        for (var r = 0; r < NUM_LINHAS_ENTRADA; r++) {
            if (fc.entradas[r] && fc.entradas[r][d]) tE += fc.entradas[r][d];
        }
        for (var s = 0; s < NUM_LINHAS_SAIDA; s++) {
            if (fc.saidas[s] && fc.saidas[s][d]) tS += fc.saidas[s][d];
        }
        if (fc.combustivel && fc.combustivel[d]) tS += fc.combustivel[d];
    }
    return { totalEntradas: tE, totalSaidas: tS };
}

function getSaldoMesAnterior(mesIdx) {
    if (mesIdx === 0) return 0;
    var saldo = 0;
    for (var i = 0; i < mesIdx; i++) {
        var mc = MESES_CONFIG[i];
        var r = calcFluxoSimple(mc.chave, mc.dias);
        saldo += r.totalEntradas - r.totalSaidas;
    }
    return saldo;
}

function renderFluxoMes(mesConfig) {
    var mesKey = mesConfig.chave;
    var dias = mesConfig.dias;
    var ano = mesConfig.ano;
    var mes = mesConfig.mes;

    initFluxoMes(mesKey, dias);
    var fc = appData.fluxoCaixa[mesKey];

    // Calcular totais
    var totalEntradas = 0, totalSaidas = 0, totalWander = 0, totalDaniel = 0, totalDinheiro = 0, totalCombustivel = 0;
    var totalEntradaDia = [], totalSaidaDia = [];

    for (var d = 0; d < dias; d++) {
        var entDia = 0, saiDia = 0;
        for (var r = 0; r < NUM_LINHAS_ENTRADA; r++) {
            if (fc.entradas[r] && fc.entradas[r][d]) entDia += fc.entradas[r][d];
        }
        for (var s = 0; s < NUM_LINHAS_SAIDA; s++) {
            if (fc.saidas[s] && fc.saidas[s][d]) saiDia += fc.saidas[s][d];
        }
        if (fc.combustivel && fc.combustivel[d]) {
            saiDia += fc.combustivel[d];
            totalCombustivel += fc.combustivel[d];
        }
        if (fc.dinheiro && fc.dinheiro[d]) totalDinheiro += fc.dinheiro[d];
        if (fc.wander && fc.wander[d]) totalWander += fc.wander[d];
        if (fc.daniel && fc.daniel[d]) totalDaniel += fc.daniel[d];
        totalEntradas += entDia;
        totalSaidas += saiDia;
        totalEntradaDia.push(entDia);
        totalSaidaDia.push(saiDia);
    }

    var mesIdx = MESES_CONFIG.indexOf(mesConfig);
    var saldoAnterior = getSaldoMesAnterior(mesIdx);
    var diferenca = totalEntradas - totalSaidas;
    var caixaAtualFinal = saldoAnterior + diferenca;
    var metaSalario = appData.empresa ? appData.empresa.metaSalario : 6000;

    // Summary Cards
    var sumId = 'sum' + mesConfig.nome.replace('ç', 'c');
    var sumEl = document.getElementById(sumId);
    if (!sumEl) {
        // Tentar com nome capitalizado
        var possibleIds = ['sumJaneiro', 'sumFevereiro', 'sumMarco', 'sumAbril', 'sumMaio', 'sumJunho', 'sumJulho', 'sumAgosto', 'sumSetembro', 'sumOutubro', 'sumNovembro', 'sumDezembro'];
        sumEl = document.getElementById(possibleIds[mesIdx]);
    }

    if (sumEl) {
        var sumHTML = '';
        sumHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + formatCurrency(totalEntradas) + '</div><div class="s-label">Total Entradas</div></div>';
        sumHTML += '<div class="summary-card"><div class="s-value" style="color:var(--danger)">' + formatCurrency(totalSaidas) + '</div><div class="s-label">Total Saídas</div></div>';
        sumHTML += '<div class="summary-card"><div class="s-value" style="color:' + (diferenca >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + formatCurrency(diferenca) + '</div><div class="s-label">Diferença</div></div>';
        sumHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(caixaAtualFinal) + '</div><div class="s-label">Caixa Atual</div></div>';
        sumHTML += '<div class="summary-card"><div class="s-value" style="color:#2196f3">' + formatCurrency(totalWander) + '</div><div class="s-label">Wander (falta ' + formatCurrency(Math.max(0, metaSalario - totalWander)) + ')</div></div>';
        sumHTML += '<div class="summary-card"><div class="s-value" style="color:#00c853">' + formatCurrency(totalDaniel) + '</div><div class="s-label">Daniel (falta ' + formatCurrency(Math.max(0, metaSalario - totalDaniel)) + ')</div></div>';
        sumEl.innerHTML = sumHTML;
    }

    // Table
    var tableId = 'fluxo' + mesConfig.nome.replace('ç', 'c');
    var tableEl = document.getElementById(tableId);
    if (!tableEl) {
        var possibleTableIds = ['fluxoJaneiro', 'fluxoFevereiro', 'fluxoMarco', 'fluxoAbril', 'fluxoMaio', 'fluxoJunho', 'fluxoJulho', 'fluxoAgosto', 'fluxoSetembro', 'fluxoOutubro', 'fluxoNovembro', 'fluxoDezembro'];
        tableEl = document.getElementById(possibleTableIds[mesIdx]);
    }

    if (!tableEl) return;

    var html = '<thead><tr><th class="col-desc">DESCRIÇÃO</th>';
    for (var dh = 0; dh < dias; dh++) {
        var dateObj = new Date(ano, mes, dh + 1);
        var diaSemana = DIAS_SEMANA_ABREV[dateObj.getDay()];
        html += '<th>' + (dh + 1) + '<br><small>' + diaSemana + '</small></th>';
    }
    html += '<th style="background:var(--orange-primary);color:white;">TOTAL MÊS</th></tr></thead><tbody>';

    // ENTRADAS header
    html += '<tr class="row-header"><td class="col-desc">ENTRADAS</td>';
    for (var eh = 0; eh < dias; eh++) html += '<td></td>';
    html += '<td></td></tr>';

    // Linhas de entrada
    for (var re = 0; re < NUM_LINHAS_ENTRADA; re++) {
        var totalRow = 0;
        html += '<tr><td class="col-desc">Entrada ' + (re + 1) + '</td>';
        for (var de = 0; de < dias; de++) {
            var val = (fc.entradas[re] && fc.entradas[re][de]) ? fc.entradas[re][de] : 0;
            totalRow += val;
            html += '<td class="editable" ondblclick="editFluxoCell(this,\'' + mesKey + '\',\'entradas\',' + re + ',' + de + ',' + dias + ')">' + (val > 0 ? val.toFixed(2) : '') + '</td>';
        }
        html += '<td style="font-weight:700;color:var(--orange-primary);">' + (totalRow > 0 ? totalRow.toFixed(2) : '') + '</td></tr>';
    }

    // DINHEIRO
    var totalDinRow = 0;
    html += '<tr style="background:var(--bg-tertiary);"><td class="col-desc" style="font-weight:700;">DINHEIRO</td>';
    for (var dd2 = 0; dd2 < dias; dd2++) {
        var valD = (fc.dinheiro && fc.dinheiro[dd2]) ? fc.dinheiro[dd2] : 0;
        totalDinRow += valD;
        html += '<td class="editable" ondblclick="editFluxoCell(this,\'' + mesKey + '\',\'dinheiro\',0,' + dd2 + ',' + dias + ')">' + (valD > 0 ? valD.toFixed(2) : '') + '</td>';
    }
    html += '<td style="font-weight:700;">' + (totalDinRow > 0 ? totalDinRow.toFixed(2) : '') + '</td></tr>';

    // TOTAL ENTRADAS
    html += '<tr class="row-total"><td class="col-desc">TOTAL ENTRADAS</td>';
    for (var te = 0; te < dias; te++) {
        html += '<td>' + (totalEntradaDia[te] > 0 ? totalEntradaDia[te].toFixed(2) : '') + '</td>';
    }
    html += '<td>' + totalEntradas.toFixed(2) + '</td></tr>';

    // SEPARADOR
    html += '<tr class="row-separator"><td class="col-desc"></td>';
    for (var sep = 0; sep < dias; sep++) html += '<td></td>';
    html += '<td></td></tr>';

    // WANDER
    html += '<tr style="background:rgba(33,150,243,0.05);"><td class="col-desc" style="color:#2196f3;font-weight:700;">WANDER</td>';
    var totalWRow = 0;
    for (var dw = 0; dw < dias; dw++) {
        var valW = (fc.wander && fc.wander[dw]) ? fc.wander[dw] : 0;
        totalWRow += valW;
        html += '<td class="editable" ondblclick="editFluxoCell(this,\'' + mesKey + '\',\'wander\',0,' + dw + ',' + dias + ')">' + (valW > 0 ? valW.toFixed(2) : '') + '</td>';
    }
    html += '<td style="font-weight:700;color:#2196f3;">' + totalWRow.toFixed(2) + '</td></tr>';

    // DANIEL
    html += '<tr style="background:rgba(0,200,83,0.05);"><td class="col-desc" style="color:#00c853;font-weight:700;">DANIEL</td>';
    var totalDRow = 0;
    for (var ddn = 0; ddn < dias; ddn++) {
        var valDn = (fc.daniel && fc.daniel[ddn]) ? fc.daniel[ddn] : 0;
        totalDRow += valDn;
        html += '<td class="editable" ondblclick="editFluxoCell(this,\'' + mesKey + '\',\'daniel\',0,' + ddn + ',' + dias + ')">' + (valDn > 0 ? valDn.toFixed(2) : '') + '</td>';
    }
    html += '<td style="font-weight:700;color:#00c853;">' + totalDRow.toFixed(2) + '</td></tr>';

    // SAÍDAS header
    html += '<tr class="row-header"><td class="col-desc">SAÍDAS</td>';
    for (var sh = 0; sh < dias; sh++) html += '<td></td>';
    html += '<td></td></tr>';

    // Linhas de saída
    for (var rs2 = 0; rs2 < NUM_LINHAS_SAIDA; rs2++) {
        var totalSRow = 0;
        html += '<tr><td class="col-desc">Saída ' + (rs2 + 1) + '</td>';
        for (var ds2 = 0; ds2 < dias; ds2++) {
            var valS = (fc.saidas[rs2] && fc.saidas[rs2][ds2]) ? fc.saidas[rs2][ds2] : 0;
            totalSRow += valS;
            html += '<td class="editable" ondblclick="editFluxoCell(this,\'' + mesKey + '\',\'saidas\',' + rs2 + ',' + ds2 + ',' + dias + ')">' + (valS > 0 ? valS.toFixed(2) : '') + '</td>';
        }
        html += '<td style="font-weight:700;color:var(--danger);">' + (totalSRow > 0 ? totalSRow.toFixed(2) : '') + '</td></tr>';
    }

    // COMBUSTÍVEL
    html += '<tr style="background:rgba(255,193,7,0.05);"><td class="col-desc" style="color:var(--warning);font-weight:700;">COMBUSTÍVEL</td>';
    var totalCombRow = 0;
    for (var dc = 0; dc < dias; dc++) {
        var valC = (fc.combustivel && fc.combustivel[dc]) ? fc.combustivel[dc] : 0;
        totalCombRow += valC;
        html += '<td class="editable" ondblclick="editFluxoCell(this,\'' + mesKey + '\',\'combustivel\',0,' + dc + ',' + dias + ')">' + (valC > 0 ? valC.toFixed(2) : '') + '</td>';
    }
    html += '<td style="font-weight:700;color:var(--warning);">' + totalCombRow.toFixed(2) + '</td></tr>';

    // SAÍDA DO DIA
    html += '<tr class="row-total"><td class="col-desc">SAÍDA DO DIA</td>';
    for (var tsd = 0; tsd < dias; tsd++) {
        html += '<td style="color:var(--danger);">' + (totalSaidaDia[tsd] > 0 ? totalSaidaDia[tsd].toFixed(2) : '') + '</td>';
    }
    html += '<td style="color:var(--danger);">' + totalSaidas.toFixed(2) + '</td></tr>';

    // SALDO MÊS ANTERIOR
    html += '<tr class="row-saldo"><td class="col-desc">SALDO MÊS ANTERIOR</td>';
    var saldoAcum = saldoAnterior;
    for (var sa = 0; sa < dias; sa++) {
        if (sa === 0) {
            html += '<td>' + saldoAnterior.toFixed(2) + '</td>';
        } else {
            html += '<td></td>';
        }
    }
    html += '<td>' + saldoAnterior.toFixed(2) + '</td></tr>';

    // CAIXA ATUAL
    html += '<tr class="row-saldo"><td class="col-desc" style="color:var(--orange-primary);font-weight:800;">CAIXA ATUAL</td>';
    var caixaAcum = saldoAnterior;
    for (var ca = 0; ca < dias; ca++) {
        caixaAcum += totalEntradaDia[ca] - totalSaidaDia[ca];
        var caixaColor = caixaAcum >= 0 ? 'var(--success)' : 'var(--danger)';
        html += '<td style="color:' + caixaColor + ';font-weight:700;">' + caixaAcum.toFixed(2) + '</td>';
    }
    html += '<td style="color:var(--orange-primary);font-weight:800;">' + caixaAtualFinal.toFixed(2) + '</td></tr>';

    html += '</tbody>';
    tableEl.innerHTML = html;
}

function editFluxoCell(td, mesKey, tipo, row, col, dias) {
    if (td.querySelector('input')) return;

    var fc = appData.fluxoCaixa[mesKey];
    var currentVal = 0;
    if (tipo === 'entradas') {
        currentVal = (fc.entradas[row] && fc.entradas[row][col]) ? fc.entradas[row][col] : 0;
    } else if (tipo === 'saidas') {
        currentVal = (fc.saidas[row] && fc.saidas[row][col]) ? fc.saidas[row][col] : 0;
    } else if (tipo === 'dinheiro') {
        currentVal = (fc.dinheiro && fc.dinheiro[col]) ? fc.dinheiro[col] : 0;
    } else if (tipo === 'wander') {
        currentVal = (fc.wander && fc.wander[col]) ? fc.wander[col] : 0;
    } else if (tipo === 'daniel') {
        currentVal = (fc.daniel && fc.daniel[col]) ? fc.daniel[col] : 0;
    } else if (tipo === 'combustivel') {
        currentVal = (fc.combustivel && fc.combustivel[col]) ? fc.combustivel[col] : 0;
    }

    var input = document.createElement('input');
    input.type = 'number';
    input.className = 'cell-edit';
    input.value = currentVal > 0 ? currentVal : '';
    input.step = '0.01';
    td.textContent = '';
    td.appendChild(input);
    input.focus();
    input.select();

    function saveCell() {
        var newVal = parseFloat(input.value) || 0;
        if (tipo === 'entradas') {
            if (!fc.entradas[row]) fc.entradas[row] = [];
            fc.entradas[row][col] = newVal;
        } else if (tipo === 'saidas') {
            if (!fc.saidas[row]) fc.saidas[row] = [];
            fc.saidas[row][col] = newVal;
        } else if (tipo === 'dinheiro') {
            fc.dinheiro[col] = newVal;
        } else if (tipo === 'wander') {
            fc.wander[col] = newVal;
        } else if (tipo === 'daniel') {
            fc.daniel[col] = newVal;
        } else if (tipo === 'combustivel') {
            fc.combustivel[col] = newVal;
        }
        saveData();

        // Re-render
        for (var m = 0; m < MESES_CONFIG.length; m++) {
            if (MESES_CONFIG[m].chave === mesKey) {
                renderFluxoMes(MESES_CONFIG[m]);
                break;
            }
        }
    }

    input.addEventListener('blur', saveCell);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            saveCell();
        }
        if (e.key === 'Escape') {
            td.textContent = currentVal > 0 ? currentVal.toFixed(2) : '';
        }
    });
}

// ============================================================
// PARTE 5 — COMPRAS + VENDAS + ESTOQUE
// ============================================================

// ==================== COMPRAS ====================
function renderCompras() {
    var busca = document.getElementById('comprasBusca') ? document.getElementById('comprasBusca').value.toLowerCase() : '';
    var filterStatus = document.getElementById('comprasFilterStatus') ? document.getElementById('comprasFilterStatus').value : '';

    // Preencher filtro status
    var selectStatus = document.getElementById('comprasFilterStatus');
    if (selectStatus && selectStatus.options.length <= 1) {
        var sits = appData.config.situacaoCompra || [];
        for (var si = 0; si < sits.length; si++) {
            var opt = document.createElement('option');
            opt.value = sits[si];
            opt.textContent = sits[si];
            selectStatus.appendChild(opt);
        }
    }

    var lista = appData.compras || [];
    var totalGeral = 0, totalPago = 0, totalDevendo = 0, registros = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var c = lista[i];
        var total = (c.qtd || 0) * (c.valorUnit || 0);
        totalGeral += total;
        if (c.status === 'Pago') totalPago += total;
        if (c.status === 'Devendo') totalDevendo += total;

        // Filtros
        var matchBusca = !busca || (c.produto || '').toLowerCase().indexOf(busca) >= 0 || (c.fornecedor || '').toLowerCase().indexOf(busca) >= 0;
        var matchStatus = !filterStatus || c.status === filterStatus;
        if (!matchBusca || !matchStatus) continue;

        registros++;
        var dias = getDiasEntreHoje(c.vencimento);
        var statusClass = c.status === 'Pago' ? 'badge-success' : (c.status === 'Devendo' ? 'badge-danger' : 'badge-warning');
        var diasColor = dias < 0 ? 'color:var(--danger)' : (dias <= 7 ? 'color:var(--warning)' : '');

        html += '<tr>';
        html += '<td>' + formatDate(c.data) + '</td>';
        html += '<td>' + formatDate(c.vencimento) + '</td>';
        html += '<td>' + (c.produto || '') + '</td>';
        html += '<td>' + (c.qtd || 0) + '</td>';
        html += '<td>' + formatCurrency(c.valorUnit || 0) + '</td>';
        html += '<td>' + (c.fornecedor || '') + '</td>';
        html += '<td>' + (c.formaPagto || '') + '</td>';
        html += '<td style="font-weight:700;">' + formatCurrency(total) + '</td>';
        html += '<td><span class="badge ' + statusClass + '">' + c.status + '</span></td>';
        html += '<td style="' + diasColor + '">' + dias + 'd</td>';
        html += '<td><button class="btn btn-sm btn-secondary" onclick="editCompra(' + c.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCompra(' + c.id + ')">🗑️</button></td>';
        html += '</tr>';
    }

    document.getElementById('comprasBody').innerHTML = html || '<tr><td colspan="11" style="text-align:center;color:var(--text-muted);">Nenhuma compra encontrada</td></tr>';

    // Cards resumo
    var pendencias = appData.compras.filter(function (c) { return c.status === 'Devendo'; }).length;
    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalGeral) + '</div><div class="s-label">Total Compras</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + formatCurrency(totalPago) + '</div><div class="s-label">Total Pago</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--danger)">' + formatCurrency(totalDevendo) + '</div><div class="s-label">Total Devendo</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--warning)">' + pendencias + '</div><div class="s-label">Pendências</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value">' + appData.compras.length + '</div><div class="s-label">Registros</div></div>';
    document.getElementById('comprasCards').innerHTML = cardsHTML;
}

function openCompraModal(id) {
    currentEditId = id || null;
    var c = null;
    if (id) {
        for (var i = 0; i < appData.compras.length; i++) {
            if (appData.compras[i].id === id) { c = appData.compras[i]; break; }
        }
    }

    var fornecedoresOpts = '<option value="">Selecione</option>';
    for (var f = 0; f < appData.fornecedores.length; f++) {
        var sel = c && c.fornecedor === appData.fornecedores[f].nome ? ' selected' : '';
        fornecedoresOpts += '<option value="' + appData.fornecedores[f].nome + '"' + sel + '>' + appData.fornecedores[f].nome + '</option>';
    }

    var pagtoOpts = '<option value="">Selecione</option>';
    var formas = appData.config.formasPagamento || [];
    for (var fp = 0; fp < formas.length; fp++) {
        var selP = c && c.formaPagto === formas[fp] ? ' selected' : '';
        pagtoOpts += '<option value="' + formas[fp] + '"' + selP + '>' + formas[fp] + '</option>';
    }

    var statusOpts = '<option value="">Selecione</option>';
    var sits = appData.config.situacaoCompra || [];
    for (var st = 0; st < sits.length; st++) {
        var selS = c && c.status === sits[st] ? ' selected' : '';
        statusOpts += '<option value="' + sits[st] + '"' + selS + '>' + sits[st] + '</option>';
    }

    var html = '';
    html += '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" id="compraData" value="' + (c ? c.data : new Date().toISOString().split('T')[0]) + '"></div>';
    html += '<div class="form-group"><label>Vencimento</label><input type="date" id="compraVenc" value="' + (c ? c.vencimento : '') + '"></div></div>';
    html += '<div class="form-group"><label>Produto</label><input type="text" id="compraProduto" value="' + (c ? c.produto : '') + '"></div>';
    html += '<div class="form-row"><div class="form-group"><label>Quantidade</label><input type="number" id="compraQtd" value="' + (c ? c.qtd : 1) + '" min="1"></div>';
    html += '<div class="form-group"><label>Valor Unitário</label><input type="number" id="compraValorUnit" value="' + (c ? c.valorUnit : '') + '" step="0.01"></div></div>';
    html += '<div class="form-group"><label>Fornecedor</label><select id="compraFornecedor">' + fornecedoresOpts + '</select></div>';
    html += '<div class="form-row"><div class="form-group"><label>Forma Pagamento</label><select id="compraFormaPagto">' + pagtoOpts + '</select></div>';
    html += '<div class="form-group"><label>Status</label><select id="compraStatus">' + statusOpts + '</select></div></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Compra' : 'Nova Compra';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveCompra()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editCompra(id) {
    openCompraModal(id);
}

function saveCompra() {
    var data = {
        data: document.getElementById('compraData').value,
        vencimento: document.getElementById('compraVenc').value,
        produto: document.getElementById('compraProduto').value,
        qtd: parseInt(document.getElementById('compraQtd').value) || 1,
        valorUnit: parseFloat(document.getElementById('compraValorUnit').value) || 0,
        fornecedor: document.getElementById('compraFornecedor').value,
        formaPagto: document.getElementById('compraFormaPagto').value,
        status: document.getElementById('compraStatus').value
    };

    if (!data.produto) { showToast('Informe o produto!'); return; }

    if (currentEditId) {
        for (var i = 0; i < appData.compras.length; i++) {
            if (appData.compras[i].id === currentEditId) {
                appData.compras[i] = Object.assign(appData.compras[i], data);
                break;
            }
        }
        showToast('Compra atualizada!');
    } else {
        data.id = nextId(appData.compras);
        appData.compras.push(data);
        showToast('Compra adicionada!');
    }

    saveData();
    closeCadastroModal();
    renderCompras();
}

function deleteCompra(id) {
    if (!confirm('Excluir esta compra?')) return;
    appData.compras = appData.compras.filter(function (c) { return c.id !== id; });
    saveData();
    renderCompras();
    showToast('Compra excluída!');
}

// ==================== VENDAS ====================
function renderVendas() {
    var busca = document.getElementById('vendasBusca') ? document.getElementById('vendasBusca').value.toLowerCase() : '';
    var filterStatus = document.getElementById('vendasFilterStatus') ? document.getElementById('vendasFilterStatus').value : '';
    var filterVendedor = document.getElementById('vendasFilterVendedor') ? document.getElementById('vendasFilterVendedor').value : '';

    // Preencher filtros
    var selectStatusV = document.getElementById('vendasFilterStatus');
    if (selectStatusV && selectStatusV.options.length <= 1) {
        var sits = appData.config.situacaoCompra || [];
        for (var si = 0; si < sits.length; si++) {
            var opt = document.createElement('option');
            opt.value = sits[si];
            opt.textContent = sits[si];
            selectStatusV.appendChild(opt);
        }
    }
    var selectVendedor = document.getElementById('vendasFilterVendedor');
    if (selectVendedor && selectVendedor.options.length <= 1) {
        var vends = appData.config.vendedores || [];
        for (var vi = 0; vi < vends.length; vi++) {
            var optV = document.createElement('option');
            optV.value = vends[vi];
            optV.textContent = vends[vi];
            selectVendedor.appendChild(optV);
        }
    }

    var lista = appData.vendas || [];
    var totalGeral = 0, totalRecebido = 0, totalAReceber = 0, entregues = 0, pendentes = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var v = lista[i];
        var total = (v.qtd || 0) * (v.valor || 0);
        totalGeral += total;
        if (v.status === 'Pago') totalRecebido += total;
        if (v.status === 'Devendo') totalAReceber += total;
        if (v.entrega === 'Entregue') entregues++;
        if (v.entrega === 'Não Entregue') pendentes++;

        var matchBusca = !busca || (v.produto || '').toLowerCase().indexOf(busca) >= 0 || (v.cliente || '').toLowerCase().indexOf(busca) >= 0;
        var matchStatus = !filterStatus || v.status === filterStatus;
        var matchVendedor = !filterVendedor || v.vendedor === filterVendedor;
        if (!matchBusca || !matchStatus || !matchVendedor) continue;

        var statusClass = v.status === 'Pago' ? 'badge-success' : (v.status === 'Devendo' ? 'badge-danger' : 'badge-warning');
        var vendBadge = v.vendedor === 'Wander' ? 'badge-wander' : 'badge-daniel';
        var entregaClass = v.entrega === 'Entregue' ? 'badge-success' : 'badge-warning';

        html += '<tr>';
        html += '<td>' + formatDate(v.data) + '</td>';
        html += '<td>' + (v.produto || '') + '</td>';
        html += '<td><span class="badge ' + vendBadge + '">' + (v.vendedor || '') + '</span></td>';
        html += '<td>' + (v.qtd || 0) + '</td>';
        html += '<td>' + formatCurrency(v.valor || 0) + '</td>';
        html += '<td>' + (v.cliente || '') + '</td>';
        html += '<td style="font-weight:700;">' + formatCurrency(total) + '</td>';
        html += '<td><span class="badge ' + statusClass + '">' + (v.status || '') + '</span></td>';
        html += '<td><span class="badge ' + entregaClass + '">' + (v.entrega || '') + '</span></td>';
        html += '<td><button class="btn btn-sm btn-secondary" onclick="editVenda(' + v.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteVenda(' + v.id + ')">🗑️</button></td>';
        html += '</tr>';
    }

    document.getElementById('vendasBody').innerHTML = html || '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);">Nenhuma venda encontrada</td></tr>';

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalGeral) + '</div><div class="s-label">Total Vendas</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + formatCurrency(totalRecebido) + '</div><div class="s-label">Recebido</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--danger)">' + formatCurrency(totalAReceber) + '</div><div class="s-label">A Receber</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + entregues + '</div><div class="s-label">Entregues</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--warning)">' + pendentes + '</div><div class="s-label">Pendentes</div></div>';
    document.getElementById('vendasCards').innerHTML = cardsHTML;
}

function openVendaModal(id) {
    currentEditId = id || null;
    var v = null;
    if (id) {
        for (var i = 0; i < appData.vendas.length; i++) {
            if (appData.vendas[i].id === id) { v = appData.vendas[i]; break; }
        }
    }

    var vendedoresOpts = '<option value="">Selecione</option>';
    var vends = appData.config.vendedores || [];
    for (var vi = 0; vi < vends.length; vi++) {
        var sel = v && v.vendedor === vends[vi] ? ' selected' : '';
        vendedoresOpts += '<option value="' + vends[vi] + '"' + sel + '>' + vends[vi] + '</option>';
    }

    var clientesOpts = '<option value="">Selecione</option>';
    for (var ci = 0; ci < appData.clientes.length; ci++) {
        var selC = v && v.cliente === appData.clientes[ci].nome ? ' selected' : '';
        clientesOpts += '<option value="' + appData.clientes[ci].nome + '"' + selC + '>' + appData.clientes[ci].nome + '</option>';
    }

    var tipoOpts = '<option value="">Selecione</option>';
    var tipos = appData.config.tipoVenda || [];
    for (var ti = 0; ti < tipos.length; ti++) {
        var selT = v && v.tipoVenda === tipos[ti] ? ' selected' : '';
        tipoOpts += '<option value="' + tipos[ti] + '"' + selT + '>' + tipos[ti] + '</option>';
    }

    var statusOpts = '<option value="">Selecione</option>';
    var sits = appData.config.situacaoCompra || [];
    for (var st = 0; st < sits.length; st++) {
        var selS = v && v.status === sits[st] ? ' selected' : '';
        statusOpts += '<option value="' + sits[st] + '"' + selS + '>' + sits[st] + '</option>';
    }

    var entregaOpts = '<option value="">Selecione</option>';
    var entregas = appData.config.situacaoEntrega || [];
    for (var ei = 0; ei < entregas.length; ei++) {
        var selE = v && v.entrega === entregas[ei] ? ' selected' : '';
        entregaOpts += '<option value="' + entregas[ei] + '"' + selE + '>' + entregas[ei] + '</option>';
    }

    var html = '';
    html += '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" id="vendaData" value="' + (v ? v.data : new Date().toISOString().split('T')[0]) + '"></div>';
    html += '<div class="form-group"><label>Vendedor</label><select id="vendaVendedor">' + vendedoresOpts + '</select></div></div>';
    html += '<div class="form-group"><label>Produto</label><input type="text" id="vendaProduto" value="' + (v ? v.produto : '') + '"></div>';
    html += '<div class="form-row"><div class="form-group"><label>Quantidade</label><input type="number" id="vendaQtd" value="' + (v ? v.qtd : 1) + '" min="1"></div>';
    html += '<div class="form-group"><label>Valor Unitário</label><input type="number" id="vendaValor" value="' + (v ? v.valor : '') + '" step="0.01"></div></div>';
    html += '<div class="form-group"><label>Cliente</label><select id="vendaCliente">' + clientesOpts + '</select></div>';
    html += '<div class="form-row"><div class="form-group"><label>Tipo de Venda</label><select id="vendaTipo">' + tipoOpts + '</select></div>';
    html += '<div class="form-group"><label>Status</label><select id="vendaStatus">' + statusOpts + '</select></div></div>';
    html += '<div class="form-group"><label>Entrega</label><select id="vendaEntrega">' + entregaOpts + '</select></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Venda' : 'Nova Venda';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveVenda()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editVenda(id) {
    openVendaModal(id);
}

function saveVenda() {
    var data = {
        data: document.getElementById('vendaData').value,
        produto: document.getElementById('vendaProduto').value,
        vendedor: document.getElementById('vendaVendedor').value,
        qtd: parseInt(document.getElementById('vendaQtd').value) || 1,
        valor: parseFloat(document.getElementById('vendaValor').value) || 0,
        cliente: document.getElementById('vendaCliente').value,
        tipoVenda: document.getElementById('vendaTipo').value,
        status: document.getElementById('vendaStatus').value,
        entrega: document.getElementById('vendaEntrega').value
    };

    if (!data.produto) { showToast('Informe o produto!'); return; }

    if (currentEditId) {
        for (var i = 0; i < appData.vendas.length; i++) {
            if (appData.vendas[i].id === currentEditId) {
                appData.vendas[i] = Object.assign(appData.vendas[i], data);
                break;
            }
        }
        showToast('Venda atualizada!');
    } else {
        data.id = nextId(appData.vendas);
        appData.vendas.push(data);
        showToast('Venda adicionada!');
    }

    saveData();
    closeCadastroModal();
    renderVendas();
}

function deleteVenda(id) {
    if (!confirm('Excluir esta venda?')) return;
    appData.vendas = appData.vendas.filter(function (v) { return v.id !== id; });
    saveData();
    renderVendas();
    showToast('Venda excluída!');
}

// ==================== ESTOQUE ====================
function renderEstoque() {
    var busca = document.getElementById('estoqueBusca') ? document.getElementById('estoqueBusca').value.toLowerCase() : '';
    var lista = appData.estoque || [];

    var totalCompra = 0, totalVenda = 0, totalLucro = 0, totalEstocado = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var e = lista[i];
        if (busca && (e.produto || '').toLowerCase().indexOf(busca) < 0) continue;

        var tCompra = (e.compras || 0) * (e.valorCompra || 0);
        var tVenda = (e.vendas || 0) * (e.valorVenda || 0);
        var lucro = tVenda - tCompra;
        var vEstoque = (e.emEstoque || 0) * (e.valorCompra || 0);
        totalCompra += tCompra;
        totalVenda += tVenda;
        totalLucro += lucro;
        totalEstocado += vEstoque;

        var maxEst = 100;
        var pct = Math.min(100, ((e.emEstoque || 0) / maxEst) * 100);
        var estoqueClass = (e.emEstoque || 0) < 5 ? 'estoque-baixo' : ((e.emEstoque || 0) < 20 ? 'estoque-medio' : 'estoque-alto');

        html += '<tr>';
        html += '<td style="font-weight:600;">' + (e.produto || '') + '</td>';
        html += '<td><div>' + (e.emEstoque || 0) + '</div><div class="estoque-bar ' + estoqueClass + '"><div class="estoque-bar-fill" style="width:' + pct + '%"></div></div></td>';
        html += '<td>' + (e.compras || 0) + '</td>';
        html += '<td>' + (e.vendas || 0) + '</td>';
        html += '<td>' + formatCurrency(tCompra) + '</td>';
        html += '<td>' + formatCurrency(tVenda) + '</td>';
        html += '<td style="color:' + (lucro >= 0 ? 'var(--success)' : 'var(--danger)') + ';font-weight:700;">' + formatCurrency(lucro) + '</td>';
        html += '<td>' + formatCurrency(vEstoque) + '</td>';
        html += '</tr>';
    }

    document.getElementById('estoqueBody').innerHTML = html || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">Nenhum item no estoque</td></tr>';

    var pctLucro = totalCompra > 0 ? ((totalLucro / totalCompra) * 100).toFixed(1) : '0.0';
    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--info)">' + formatCurrency(totalCompra) + '</div><div class="s-label">V. Compra</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + formatCurrency(totalVenda) + '</div><div class="s-label">T. Venda</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:' + (totalLucro >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + formatCurrency(totalLucro) + '</div><div class="s-label">T. Lucros</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalEstocado) + '</div><div class="s-label">V. Estocado</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--warning)">' + pctLucro + '%</div><div class="s-label">% Lucros</div></div>';
    document.getElementById('estoqueCards').innerHTML = cardsHTML;
}

// ============================================================
// PARTE 6 — CADASTROS (Clientes, Fornecedores, Produtos, P.Fornecedores)
// ============================================================

// ==================== CLIENTES ====================
function renderClientes() {
    var busca = document.getElementById('clientesBusca') ? document.getElementById('clientesBusca').value.toLowerCase() : '';
    var lista = appData.clientes || [];
    var count = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var c = lista[i];
        var matchBusca = !busca || (c.nome || '').toLowerCase().indexOf(busca) >= 0 || (c.cpfcnpj || '').toLowerCase().indexOf(busca) >= 0 || (c.cidade || '').toLowerCase().indexOf(busca) >= 0;
        if (!matchBusca) continue;
        count++;

        var avatar = c.imagem ? '<img src="' + c.imagem + '" class="cadastro-avatar">' : '<div class="cadastro-avatar-placeholder">👤</div>';

        html += '<tr>';
        html += '<td>' + avatar + '</td>';
        html += '<td style="font-weight:600;">' + (c.nome || '') + '</td>';
        html += '<td>' + (c.cpfcnpj || '') + '</td>';
        html += '<td>' + (c.telefone || '') + '</td>';
        html += '<td>' + (c.cidade || '') + '/' + (c.estado || '') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-sm btn-secondary" onclick="viewCadastro(\'clientes\',' + c.id + ')">👁️</button> ';
        html += '<button class="btn btn-sm btn-secondary" onclick="editCadastro(\'clientes\',' + c.id + ')">✏️</button> ';
        html += '<button class="btn btn-sm btn-danger" onclick="deleteCadastro(\'clientes\',' + c.id + ')">🗑️</button>';
        html += '</td></tr>';
    }

    document.getElementById('clientesBody').innerHTML = html || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Nenhum cliente encontrado</td></tr>';
    document.getElementById('clientesCount').textContent = count;
}

// ==================== FORNECEDORES ====================
function renderFornecedores() {
    var busca = document.getElementById('fornecedoresBusca') ? document.getElementById('fornecedoresBusca').value.toLowerCase() : '';
    var lista = appData.fornecedores || [];
    var count = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var f = lista[i];
        var matchBusca = !busca || (f.nome || '').toLowerCase().indexOf(busca) >= 0 || (f.cpfcnpj || '').toLowerCase().indexOf(busca) >= 0 || (f.cidade || '').toLowerCase().indexOf(busca) >= 0;
        if (!matchBusca) continue;
        count++;

        var avatar = f.imagem ? '<img src="' + f.imagem + '" class="cadastro-avatar">' : '<div class="cadastro-avatar-placeholder">🏭</div>';

        html += '<tr>';
        html += '<td>' + avatar + '</td>';
        html += '<td style="font-weight:600;">' + (f.nome || '') + '</td>';
        html += '<td>' + (f.cpfcnpj || '') + '</td>';
        html += '<td>' + (f.telefone || '') + '</td>';
        html += '<td>' + (f.cidade || '') + '/' + (f.estado || '') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-sm btn-secondary" onclick="viewCadastro(\'fornecedores\',' + f.id + ')">👁️</button> ';
        html += '<button class="btn btn-sm btn-secondary" onclick="editCadastro(\'fornecedores\',' + f.id + ')">✏️</button> ';
        html += '<button class="btn btn-sm btn-danger" onclick="deleteCadastro(\'fornecedores\',' + f.id + ')">🗑️</button>';
        html += '</td></tr>';
    }

    document.getElementById('fornecedoresBody').innerHTML = html || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Nenhum fornecedor encontrado</td></tr>';
    document.getElementById('fornecedoresCount').textContent = count;
}

// ==================== PRODUTOS ====================
function renderProdutos() {
    var busca = document.getElementById('produtosBusca') ? document.getElementById('produtosBusca').value.toLowerCase() : '';
    var lista = appData.produtos || [];
    var count = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        var matchBusca = !busca || (p.nome || '').toLowerCase().indexOf(busca) >= 0;
        if (!matchBusca) continue;
        count++;

        var imgHTML = p.imagem ? '<img src="' + p.imagem + '" class="produto-card-img">' : '<div class="produto-card-img" style="display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:var(--text-muted);">🏷️</div>';

        html += '<div class="produto-card">';
        html += imgHTML;
        html += '<div class="produto-card-body">';
        html += '<h4>' + (p.nome || '') + '</h4>';
        html += '<div class="preco-label">Custo</div><div class="preco">' + formatCurrency(p.valorCusto || 0) + '</div>';
        html += '<div style="display:flex;gap:12px;margin-top:6px;">';
        html += '<div><div class="preco-label">Revenda</div><div style="font-weight:700;color:var(--success);font-size:0.85rem;">' + formatCurrency(p.valorRevenda || 0) + '</div></div>';
        html += '<div><div class="preco-label">Direto</div><div style="font-weight:700;color:#2196f3;font-size:0.85rem;">' + formatCurrency(p.valorDireto || 0) + '</div></div>';
        html += '</div>';
        html += '<div style="margin-top:6px;font-size:0.7rem;color:var(--text-muted);">Unidade: ' + (p.unidade || '-') + '</div>';
        html += '</div>';
        html += '<div class="produto-card-actions">';
        html += '<button class="btn btn-sm btn-secondary" onclick="viewCadastro(\'produtos\',' + p.id + ')">👁️</button>';
        html += '<button class="btn btn-sm btn-secondary" onclick="editCadastro(\'produtos\',' + p.id + ')">✏️</button>';
        html += '<button class="btn btn-sm btn-danger" onclick="deleteCadastro(\'produtos\',' + p.id + ')">🗑️</button>';
        html += '</div></div>';
    }

    document.getElementById('produtosGrid').innerHTML = html || '<div style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px;">Nenhum produto encontrado</div>';
    document.getElementById('produtosCount').textContent = count;
}

// ==================== P. FORNECEDORES ====================
function renderPFornecedores() {
    var busca = document.getElementById('pfornecedoresBusca') ? document.getElementById('pfornecedoresBusca').value.toLowerCase() : '';
    var lista = appData.pfornecedores || [];
    var count = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        var matchBusca = !busca || (p.nome || '').toLowerCase().indexOf(busca) >= 0 || (p.fornecedor || '').toLowerCase().indexOf(busca) >= 0;
        if (!matchBusca) continue;
        count++;

        var imgHTML = p.imagem ? '<img src="' + p.imagem + '" class="produto-card-img">' : '<div class="produto-card-img" style="display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:var(--text-muted);">📋</div>';

        html += '<div class="produto-card">';
        html += imgHTML;
        html += '<div class="produto-card-body">';
        html += '<h4>' + (p.nome || '') + '</h4>';
        html += '<div class="preco">' + formatCurrency(p.valor || 0) + '</div>';
        html += '<div style="margin-top:6px;font-size:0.75rem;color:var(--text-secondary);">Fornecedor: ' + (p.fornecedor || '-') + '</div>';
        html += '<div style="font-size:0.7rem;color:var(--text-muted);">Unidade: ' + (p.unidade || '-') + '</div>';
        html += '</div>';
        html += '<div class="produto-card-actions">';
        html += '<button class="btn btn-sm btn-secondary" onclick="viewCadastro(\'pfornecedores\',' + p.id + ')">👁️</button>';
        html += '<button class="btn btn-sm btn-secondary" onclick="editCadastro(\'pfornecedores\',' + p.id + ')">✏️</button>';
        html += '<button class="btn btn-sm btn-danger" onclick="deleteCadastro(\'pfornecedores\',' + p.id + ')">🗑️</button>';
        html += '</div></div>';
    }

    document.getElementById('pfornecedoresGrid').innerHTML = html || '<div style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px;">Nenhum produto de fornecedor encontrado</div>';
    document.getElementById('pfornecedoresCount').textContent = count;
}

// ==================== MODAL CADASTRO GENÉRICO ====================
function openCadastroModal(tipo, id) {
    currentCadastroType = tipo;
    currentEditId = id || null;

    var item = null;
    var lista = appData[tipo] || [];
    if (id) {
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id === id) { item = lista[i]; break; }
        }
    }

    var html = '';
    var titulo = '';

    if (tipo === 'clientes' || tipo === 'fornecedores') {
        titulo = id ? 'Editar ' + (tipo === 'clientes' ? 'Cliente' : 'Fornecedor') : 'Novo ' + (tipo === 'clientes' ? 'Cliente' : 'Fornecedor');

        html += '<div class="img-upload-area" onclick="document.getElementById(\'cadastroImgInput\').click()">';
        if (item && item.imagem) {
            html += '<img src="' + item.imagem + '" id="cadastroImgPreview">';
        } else {
            html += '<p id="cadastroImgPreview">📷 Clique para adicionar imagem</p>';
        }
        html += '</div>';
        html += '<input type="file" id="cadastroImgInput" accept="image/*" style="display:none" onchange="handleImageUpload(event)">';
        html += '<input type="hidden" id="cadastroImgData" value="' + (item && item.imagem ? item.imagem : '') + '">';

        html += '<div class="form-group"><label>Nome</label><input type="text" id="cadNome" value="' + (item ? item.nome : '') + '"></div>';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label>CPF/CNPJ</label><input type="text" id="cadCpfCnpj" value="' + (item ? item.cpfcnpj : '') + '" oninput="this.value=formatCPFCNPJ(this.value)" maxlength="18"></div>';
        html += '<div class="form-group"><label>Telefone</label><input type="text" id="cadTelefone" value="' + (item ? item.telefone : '') + '" oninput="this.value=formatTelefone(this.value)" maxlength="15"></div>';
        html += '</div>';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label>Endereço</label><input type="text" id="cadEndereco" value="' + (item ? item.endereco : '') + '"></div>';
        html += '<div class="form-group"><label>Número</label><input type="text" id="cadNumero" value="' + (item ? item.numero : '') + '"></div>';
        html += '</div>';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label>CEP</label><input type="text" id="cadCep" value="' + (item ? item.cep : '') + '" oninput="this.value=formatCEP(this.value)" maxlength="9"></div>';
        html += '<div class="form-group"><label>Cidade</label><input type="text" id="cadCidade" value="' + (item ? item.cidade : '') + '"></div>';
        html += '</div>';
        html += '<div class="form-group"><label>Estado</label><input type="text" id="cadEstado" value="' + (item ? item.estado : '') + '" maxlength="2" style="text-transform:uppercase;"></div>';

    } else if (tipo === 'produtos') {
        titulo = id ? 'Editar Produto' : 'Novo Produto';

        html += '<div class="img-upload-area" onclick="document.getElementById(\'cadastroImgInput\').click()">';
        if (item && item.imagem) {
            html += '<img src="' + item.imagem + '" id="cadastroImgPreview">';
        } else {
            html += '<p id="cadastroImgPreview">📷 Clique para adicionar imagem</p>';
        }
        html += '</div>';
        html += '<input type="file" id="cadastroImgInput" accept="image/*" style="display:none" onchange="handleImageUpload(event)">';
        html += '<input type="hidden" id="cadastroImgData" value="' + (item && item.imagem ? item.imagem : '') + '">';

        html += '<div class="form-group"><label>Nome do Produto</label><input type="text" id="cadNome" value="' + (item ? item.nome : '') + '"></div>';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label>Valor de Custo</label><input type="number" id="cadValorCusto" value="' + (item ? item.valorCusto : '') + '" step="0.01"></div>';
        html += '<div class="form-group"><label>Valor Revenda</label><input type="number" id="cadValorRevenda" value="' + (item ? item.valorRevenda : '') + '" step="0.01"></div>';
        html += '</div>';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label>Valor Venda Direto</label><input type="number" id="cadValorDireto" value="' + (item ? item.valorDireto : '') + '" step="0.01"></div>';

        var unidadeOpts = '<option value="">Selecione</option>';
        var unidades = appData.config.tiposUnidade || [];
        for (var u = 0; u < unidades.length; u++) {
            var selU = item && item.unidade === unidades[u] ? ' selected' : '';
            unidadeOpts += '<option value="' + unidades[u] + '"' + selU + '>' + unidades[u] + '</option>';
        }
        html += '<div class="form-group"><label>Tipo de Unidade</label><select id="cadUnidade">' + unidadeOpts + '</select></div>';
        html += '</div>';

    } else if (tipo === 'pfornecedores') {
        titulo = id ? 'Editar Produto do Fornecedor' : 'Novo Produto do Fornecedor';

        html += '<div class="img-upload-area" onclick="document.getElementById(\'cadastroImgInput\').click()">';
        if (item && item.imagem) {
            html += '<img src="' + item.imagem + '" id="cadastroImgPreview">';
        } else {
            html += '<p id="cadastroImgPreview">📷 Clique para adicionar imagem</p>';
        }
        html += '</div>';
        html += '<input type="file" id="cadastroImgInput" accept="image/*" style="display:none" onchange="handleImageUpload(event)">';
        html += '<input type="hidden" id="cadastroImgData" value="' + (item && item.imagem ? item.imagem : '') + '">';

        html += '<div class="form-group"><label>Nome do Produto</label><input type="text" id="cadNome" value="' + (item ? item.nome : '') + '"></div>';
        html += '<div class="form-row">';
        html += '<div class="form-group"><label>Valor</label><input type="number" id="cadValor" value="' + (item ? item.valor : '') + '" step="0.01"></div>';

        var unidadeOptsP = '<option value="">Selecione</option>';
        var unidadesP = appData.config.tiposUnidade || [];
        for (var up = 0; up < unidadesP.length; up++) {
            var selUp = item && item.unidade === unidadesP[up] ? ' selected' : '';
            unidadeOptsP += '<option value="' + unidadesP[up] + '"' + selUp + '>' + unidadesP[up] + '</option>';
        }
        html += '<div class="form-group"><label>Tipo de Unidade</label><select id="cadUnidade">' + unidadeOptsP + '</select></div>';
        html += '</div>';

        var fornecedorOpts = '<option value="">Selecione</option>';
        for (var fi = 0; fi < appData.fornecedores.length; fi++) {
            var selF = item && item.fornecedor === appData.fornecedores[fi].nome ? ' selected' : '';
            fornecedorOpts += '<option value="' + appData.fornecedores[fi].nome + '"' + selF + '>' + appData.fornecedores[fi].nome + '</option>';
        }
        html += '<div class="form-group"><label>Fornecedor</label><select id="cadFornecedor">' + fornecedorOpts + '</select></div>';
    }

    document.getElementById('cadastroModalTitle').textContent = titulo;
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveCadastro()');
    document.getElementById('cadastroModal').classList.add('active');
}

function handleImageUpload(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (file.size > 500000) {
        showToast('Imagem muito grande! Máximo 500KB.');
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var imgData = e.target.result;
        document.getElementById('cadastroImgData').value = imgData;
        var preview = document.getElementById('cadastroImgPreview');
        if (preview.tagName === 'IMG') {
            preview.src = imgData;
        } else {
            var parent = preview.parentElement;
            parent.innerHTML = '<img src="' + imgData + '" id="cadastroImgPreview">';
        }
    };
    reader.readAsDataURL(file);
}

function saveCadastro() {
    var tipo = currentCadastroType;
    if (!tipo) return;

    var lista = appData[tipo] || [];
    var item = {};

    if (tipo === 'clientes' || tipo === 'fornecedores') {
        item.nome = document.getElementById('cadNome').value;
        item.cpfcnpj = document.getElementById('cadCpfCnpj').value;
        item.telefone = document.getElementById('cadTelefone').value;
        item.endereco = document.getElementById('cadEndereco').value;
        item.numero = document.getElementById('cadNumero').value;
        item.cep = document.getElementById('cadCep').value;
        item.cidade = document.getElementById('cadCidade').value;
        item.estado = document.getElementById('cadEstado').value.toUpperCase();
        item.imagem = document.getElementById('cadastroImgData').value;

        if (!item.nome) { showToast('Informe o nome!'); return; }

    } else if (tipo === 'produtos') {
        item.nome = document.getElementById('cadNome').value;
        item.valorCusto = parseFloat(document.getElementById('cadValorCusto').value) || 0;
        item.valorRevenda = parseFloat(document.getElementById('cadValorRevenda').value) || 0;
        item.valorDireto = parseFloat(document.getElementById('cadValorDireto').value) || 0;
        item.unidade = document.getElementById('cadUnidade').value;
        item.imagem = document.getElementById('cadastroImgData').value;

        if (!item.nome) { showToast('Informe o nome!'); return; }

    } else if (tipo === 'pfornecedores') {
        item.nome = document.getElementById('cadNome').value;
        item.valor = parseFloat(document.getElementById('cadValor').value) || 0;
        item.unidade = document.getElementById('cadUnidade').value;
        item.fornecedor = document.getElementById('cadFornecedor').value;
        item.imagem = document.getElementById('cadastroImgData').value;

        if (!item.nome) { showToast('Informe o nome!'); return; }
    }

    if (currentEditId) {
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id === currentEditId) {
                item.id = currentEditId;
                appData[tipo][i] = item;
                break;
            }
        }
        showToast('Registro atualizado!');
    } else {
        item.id = nextId(lista);
        lista.push(item);
        appData[tipo] = lista;
        showToast('Registro adicionado!');
    }

    saveData();
    closeCadastroModal();

    if (tipo === 'clientes') renderClientes();
    else if (tipo === 'fornecedores') renderFornecedores();
    else if (tipo === 'produtos') renderProdutos();
    else if (tipo === 'pfornecedores') renderPFornecedores();
}

function editCadastro(tipo, id) {
    openCadastroModal(tipo, id);
}

function deleteCadastro(tipo, id) {
    if (!confirm('Excluir este registro?')) return;
    appData[tipo] = (appData[tipo] || []).filter(function (item) { return item.id !== id; });
    saveData();

    if (tipo === 'clientes') renderClientes();
    else if (tipo === 'fornecedores') renderFornecedores();
    else if (tipo === 'produtos') renderProdutos();
    else if (tipo === 'pfornecedores') renderPFornecedores();

    showToast('Registro excluído!');
}

function viewCadastro(tipo, id) {
    var lista = appData[tipo] || [];
    var item = null;
    for (var i = 0; i < lista.length; i++) {
        if (lista[i].id === id) { item = lista[i]; break; }
    }
    if (!item) return;

    var html = '';

    if (tipo === 'clientes' || tipo === 'fornecedores') {
        if (item.imagem) {
            html += '<img src="' + item.imagem + '" class="view-avatar-lg">';
        }
        html += '<div class="view-detail"><span class="view-label">Nome:</span><span>' + (item.nome || '-') + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">CPF/CNPJ:</span><span>' + (item.cpfcnpj || '-') + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Telefone:</span><span>' + (item.telefone || '-') + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Endereço:</span><span>' + (item.endereco || '-') + ', ' + (item.numero || '') + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">CEP:</span><span>' + (item.cep || '-') + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Cidade/UF:</span><span>' + (item.cidade || '-') + '/' + (item.estado || '-') + '</span></div>';

    } else if (tipo === 'produtos') {
        if (item.imagem) {
            html += '<img src="' + item.imagem + '" style="max-width:100%;max-height:200px;border-radius:8px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;">';
        }
        html += '<div class="view-detail"><span class="view-label">Nome:</span><span>' + (item.nome || '-') + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Valor Custo:</span><span>' + formatCurrency(item.valorCusto || 0) + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Valor Revenda:</span><span style="color:var(--success);">' + formatCurrency(item.valorRevenda || 0) + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Valor Direto:</span><span style="color:#2196f3;">' + formatCurrency(item.valorDireto || 0) + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Unidade:</span><span>' + (item.unidade || '-') + '</span></div>';

    } else if (tipo === 'pfornecedores') {
        if (item.imagem) {
            html += '<img src="' + item.imagem + '" style="max-width:100%;max-height:200px;border-radius:8px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;">';
        }
        html += '<div class="view-detail"><span class="view-label">Produto:</span><span>' + (item.nome || '-') + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Valor:</span><span style="color:var(--orange-primary);font-weight:700;">' + formatCurrency(item.valor || 0) + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Unidade:</span><span>' + (item.unidade || '-') + '</span></div>';
        html += '<div class="view-detail"><span class="view-label">Fornecedor:</span><span>' + (item.fornecedor || '-') + '</span></div>';
    }

    var tipoLabel = tipo === 'clientes' ? 'Cliente' : (tipo === 'fornecedores' ? 'Fornecedor' : (tipo === 'produtos' ? 'Produto' : 'Produto do Fornecedor'));
    document.getElementById('viewModalTitle').textContent = 'Detalhes - ' + tipoLabel;
    document.getElementById('viewModalBody').innerHTML = html;
    document.getElementById('viewModal').classList.add('active');
}

function closeCadastroModal() {
    document.getElementById('cadastroModal').classList.remove('active');
    currentCadastroType = '';
    currentEditId = null;
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
}

// ============================================================
// PARTE 7 — BOLETOS, CHEQUES, PRESTAÇÕES, PROJETOS, PAG.CLIENTES, GARANTIAS
// ============================================================

// ==================== BOLETOS ====================
function renderBoletos() {
    var lista = appData.boletos || [];
    var totalPago = 0, totalVencido = 0, totalAVencer = 0, totalAnual = 0, totalAReceber = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var b = lista[i];
        totalAnual += (b.valor || 0);

        var dias = getDiasEntreHoje(b.vencimento);
        var situacao = b.situacao;
        if (situacao !== 'Pago' && dias < 0) situacao = 'Vencido';

        if (situacao === 'Pago') totalPago += (b.valor || 0);
        else if (situacao === 'Vencido') totalVencido += (b.valor || 0);
        else { totalAVencer += (b.valor || 0); totalAReceber += (b.valor || 0); }

        var statusClass = situacao === 'Pago' ? 'badge-success' : (situacao === 'Vencido' ? 'badge-danger' : 'badge-warning');

        html += '<tr>';
        html += '<td>' + formatDate(b.dataSaida) + '</td>';
        html += '<td>' + (b.cliente || '') + '</td>';
        html += '<td style="font-weight:700;">' + formatCurrency(b.valor || 0) + '</td>';
        html += '<td>' + formatDate(b.vencimento) + '</td>';
        html += '<td>' + formatDate(b.dataReceber) + '</td>';
        html += '<td><span class="badge ' + statusClass + '">' + situacao + '</span></td>';
        html += '<td><button class="btn btn-sm btn-secondary" onclick="editBoleto(' + b.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteBoleto(' + b.id + ')">🗑️</button></td>';
        html += '</tr>';
    }

    document.getElementById('boletosBody').innerHTML = html || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Nenhum boleto</td></tr>';

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + formatCurrency(totalPago) + '</div><div class="s-label">Pagos</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--danger)">' + formatCurrency(totalVencido) + '</div><div class="s-label">Vencidos</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--warning)">' + formatCurrency(totalAVencer) + '</div><div class="s-label">A Vencer</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalAnual) + '</div><div class="s-label">Total Anual</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--info)">' + formatCurrency(totalAReceber) + '</div><div class="s-label">A Receber</div></div>';
    document.getElementById('boletosCards').innerHTML = cardsHTML;
}

function openBoletoModal(id) {
    currentEditId = id || null;
    var b = null;
    if (id) {
        for (var i = 0; i < appData.boletos.length; i++) {
            if (appData.boletos[i].id === id) { b = appData.boletos[i]; break; }
        }
    }

    var clienteOpts = '<option value="">Selecione</option>';
    for (var c = 0; c < appData.clientes.length; c++) {
        var sel = b && b.cliente === appData.clientes[c].nome ? ' selected' : '';
        clienteOpts += '<option value="' + appData.clientes[c].nome + '"' + sel + '>' + appData.clientes[c].nome + '</option>';
    }

    var html = '';
    html += '<div class="form-row"><div class="form-group"><label>Data Saída</label><input type="date" id="boletoDataSaida" value="' + (b ? b.dataSaida : new Date().toISOString().split('T')[0]) + '"></div>';
    html += '<div class="form-group"><label>Vencimento</label><input type="date" id="boletoVencimento" value="' + (b ? b.vencimento : '') + '"></div></div>';
    html += '<div class="form-group"><label>Cliente</label><select id="boletoCliente">' + clienteOpts + '</select></div>';
    html += '<div class="form-row"><div class="form-group"><label>Valor</label><input type="number" id="boletoValor" value="' + (b ? b.valor : '') + '" step="0.01"></div>';
    html += '<div class="form-group"><label>Data Receber</label><input type="date" id="boletoDataReceber" value="' + (b ? b.dataReceber : '') + '"></div></div>';
    html += '<div class="form-group"><label>Situação</label><select id="boletoSituacao"><option value="A Vencer"' + (b && b.situacao === 'A Vencer' ? ' selected' : '') + '>A Vencer</option><option value="Pago"' + (b && b.situacao === 'Pago' ? ' selected' : '') + '>Pago</option><option value="Vencido"' + (b && b.situacao === 'Vencido' ? ' selected' : '') + '>Vencido</option></select></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Boleto' : 'Novo Boleto';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveBoleto()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editBoleto(id) { openBoletoModal(id); }

function saveBoleto() {
    var data = {
        dataSaida: document.getElementById('boletoDataSaida').value,
        cliente: document.getElementById('boletoCliente').value,
        valor: parseFloat(document.getElementById('boletoValor').value) || 0,
        vencimento: document.getElementById('boletoVencimento').value,
        dataReceber: document.getElementById('boletoDataReceber').value,
        situacao: document.getElementById('boletoSituacao').value
    };

    if (!data.cliente) { showToast('Selecione o cliente!'); return; }

    if (currentEditId) {
        for (var i = 0; i < appData.boletos.length; i++) {
            if (appData.boletos[i].id === currentEditId) {
                appData.boletos[i] = Object.assign(appData.boletos[i], data);
                break;
            }
        }
        showToast('Boleto atualizado!');
    } else {
        data.id = nextId(appData.boletos);
        appData.boletos.push(data);
        showToast('Boleto adicionado!');
    }
    saveData();
    closeCadastroModal();
    renderBoletos();
}

function deleteBoleto(id) {
    if (!confirm('Excluir este boleto?')) return;
    appData.boletos = appData.boletos.filter(function (b) { return b.id !== id; });
    saveData();
    renderBoletos();
    showToast('Boleto excluído!');
}

// ==================== CHEQUES ====================
function renderCheques() {
    var lista = appData.cheques || [];
    var totalDescontado = 0, totalAVencer = 0, totalGeral = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var ch = lista[i];
        totalGeral += (ch.valor || 0);
        if (ch.situacao === 'Depositado') totalDescontado += (ch.valor || 0);
        else totalAVencer += (ch.valor || 0);

        var statusClass = ch.situacao === 'Depositado' ? 'badge-success' : (ch.situacao === 'Devolvido para o cliente' ? 'badge-danger' : 'badge-warning');

        html += '<tr>';
        html += '<td>' + formatDate(ch.data) + '</td>';
        html += '<td>' + (ch.cliente || '') + '</td>';
        html += '<td>' + (ch.banco || '') + '</td>';
        html += '<td>' + (ch.numCheque || '') + '</td>';
        html += '<td style="font-weight:700;">' + formatCurrency(ch.valor || 0) + '</td>';
        html += '<td>' + formatDate(ch.vencimento) + '</td>';
        html += '<td>' + formatDate(ch.compensou) + '</td>';
        html += '<td><span class="badge ' + statusClass + '">' + (ch.situacao || '') + '</span></td>';
        html += '<td style="font-size:0.75rem;">' + (ch.obs || '') + '</td>';
        html += '<td><button class="btn btn-sm btn-secondary" onclick="editCheque(' + ch.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteCheque(' + ch.id + ')">🗑️</button></td>';
        html += '</tr>';
    }

    document.getElementById('chequesBody').innerHTML = html || '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);">Nenhum cheque</td></tr>';

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + formatCurrency(totalDescontado) + '</div><div class="s-label">Descontados</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--warning)">' + formatCurrency(totalAVencer) + '</div><div class="s-label">A Vencer</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalGeral) + '</div><div class="s-label">Total</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value">' + lista.length + '</div><div class="s-label">Registros</div></div>';
    document.getElementById('chequesCards').innerHTML = cardsHTML;
}

function openChequeModal(id) {
    currentEditId = id || null;
    var ch = null;
    if (id) {
        for (var i = 0; i < appData.cheques.length; i++) {
            if (appData.cheques[i].id === id) { ch = appData.cheques[i]; break; }
        }
    }

    var clienteOpts = '<option value="">Selecione</option>';
    for (var c = 0; c < appData.clientes.length; c++) {
        var sel = ch && ch.cliente === appData.clientes[c].nome ? ' selected' : '';
        clienteOpts += '<option value="' + appData.clientes[c].nome + '"' + sel + '>' + appData.clientes[c].nome + '</option>';
    }

    var situacaoOpts = '<option value="">Selecione</option>';
    var sits = appData.config.situacaoCheque || [];
    for (var si = 0; si < sits.length; si++) {
        var selS = ch && ch.situacao === sits[si] ? ' selected' : '';
        situacaoOpts += '<option value="' + sits[si] + '"' + selS + '>' + sits[si] + '</option>';
    }

    var html = '';
    html += '<div class="form-row"><div class="form-group"><label>Data Entrada</label><input type="date" id="chequeData" value="' + (ch ? ch.data : new Date().toISOString().split('T')[0]) + '"></div>';
    html += '<div class="form-group"><label>Vencimento</label><input type="date" id="chequeVencimento" value="' + (ch ? ch.vencimento : '') + '"></div></div>';
    html += '<div class="form-group"><label>Cliente</label><select id="chequeCliente">' + clienteOpts + '</select></div>';
    html += '<div class="form-row"><div class="form-group"><label>Banco</label><input type="text" id="chequeBanco" value="' + (ch ? ch.banco : '') + '"></div>';
    html += '<div class="form-group"><label>Nº Cheque</label><input type="text" id="chequeNum" value="' + (ch ? ch.numCheque : '') + '"></div></div>';
    html += '<div class="form-row"><div class="form-group"><label>Valor</label><input type="number" id="chequeValor" value="' + (ch ? ch.valor : '') + '" step="0.01"></div>';
    html += '<div class="form-group"><label>Compensou em</label><input type="date" id="chequeCompensou" value="' + (ch ? ch.compensou : '') + '"></div></div>';
    html += '<div class="form-group"><label>Situação</label><select id="chequeSituacao">' + situacaoOpts + '</select></div>';
    html += '<div class="form-group"><label>Observação</label><textarea id="chequeObs" rows="2">' + (ch ? ch.obs || '' : '') + '</textarea></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Cheque' : 'Novo Cheque';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveCheque()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editCheque(id) { openChequeModal(id); }

function saveCheque() {
    var data = {
        data: document.getElementById('chequeData').value,
        cliente: document.getElementById('chequeCliente').value,
        banco: document.getElementById('chequeBanco').value,
        numCheque: document.getElementById('chequeNum').value,
        valor: parseFloat(document.getElementById('chequeValor').value) || 0,
        vencimento: document.getElementById('chequeVencimento').value,
        compensou: document.getElementById('chequeCompensou').value,
        situacao: document.getElementById('chequeSituacao').value,
        obs: document.getElementById('chequeObs').value
    };

    if (currentEditId) {
        for (var i = 0; i < appData.cheques.length; i++) {
            if (appData.cheques[i].id === currentEditId) {
                appData.cheques[i] = Object.assign(appData.cheques[i], data);
                break;
            }
        }
        showToast('Cheque atualizado!');
    } else {
        data.id = nextId(appData.cheques);
        appData.cheques.push(data);
        showToast('Cheque adicionado!');
    }
    saveData();
    closeCadastroModal();
    renderCheques();
}

function deleteCheque(id) {
    if (!confirm('Excluir este cheque?')) return;
    appData.cheques = appData.cheques.filter(function (c) { return c.id !== id; });
    saveData();
    renderCheques();
    showToast('Cheque excluído!');
}

// ==================== PRESTAÇÕES ====================
function renderPrestacoes() {
    var lista = appData.prestacoes || [];
    var totalDividas = 0, totalMes = 0, ativas = 0;
    var mesAtual = new Date().getMonth();

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        var totalP = 0;
        var temValor = false;
        for (var m = 0; m < 12; m++) {
            if (p.meses && p.meses[m]) {
                totalP += p.meses[m];
                temValor = true;
            }
        }
        totalDividas += totalP;
        if (p.meses && p.meses[mesAtual]) totalMes += p.meses[mesAtual];
        if (temValor) ativas++;

        html += '<div class="prestacao-card">';
        html += '<div class="prestacao-card-header"><div><h4>' + (p.nome || '') + '</h4><span style="font-size:0.75rem;color:var(--text-secondary);">' + (p.numParcelas || 0) + 'x de ' + formatCurrency(p.valorParcela || 0) + ' | Total: ' + formatCurrency(totalP) + '</span></div>';
        html += '<div><button class="btn btn-sm btn-secondary" onclick="editPrestacao(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePrestacao(' + p.id + ')">🗑️</button></div></div>';
        html += '<div class="prestacao-grid">';
        for (var m2 = 0; m2 < 12; m2++) {
            var val = (p.meses && p.meses[m2]) ? p.meses[m2] : 0;
            var bgColor = val > 0 ? (m2 === mesAtual ? 'border:1px solid var(--orange-primary);' : '') : 'opacity:0.4;';
            html += '<div class="prestacao-mes" style="' + bgColor + '"><div class="mes-nome">' + MESES_NOMES[m2].substr(0, 3) + '</div><div class="mes-valor">' + (val > 0 ? formatCurrency(val) : '-') + '</div></div>';
        }
        html += '</div></div>';
    }

    document.getElementById('prestacoesLista').innerHTML = html || '<div style="text-align:center;color:var(--text-muted);padding:40px;">Nenhuma prestação cadastrada</div>';

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--danger)">' + formatCurrency(totalDividas) + '</div><div class="s-label">Total Dívidas</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalMes) + '</div><div class="s-label">Total por Mês</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value">' + ativas + '</div><div class="s-label">Prestações Ativas</div></div>';
    document.getElementById('prestacoesCards').innerHTML = cardsHTML;
}

function openPrestacaoModal(id) {
    currentEditId = id || null;
    var p = null;
    if (id) {
        for (var i = 0; i < appData.prestacoes.length; i++) {
            if (appData.prestacoes[i].id === id) { p = appData.prestacoes[i]; break; }
        }
    }

    var html = '';
    html += '<div class="form-group"><label>Nome</label><input type="text" id="prestNome" value="' + (p ? p.nome : '') + '"></div>';
    html += '<div class="form-row"><div class="form-group"><label>Valor Parcela</label><input type="number" id="prestValor" value="' + (p ? p.valorParcela : '') + '" step="0.01"></div>';
    html += '<div class="form-group"><label>Nº Parcelas</label><input type="number" id="prestNum" value="' + (p ? p.numParcelas : '') + '" min="1" max="12"></div></div>';
    html += '<div style="margin-top:12px;"><label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">Valores por Mês</label>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px;">';
    for (var m = 0; m < 12; m++) {
        var val = (p && p.meses && p.meses[m]) ? p.meses[m] : '';
        html += '<div class="form-group" style="margin-bottom:0;"><label style="font-size:0.65rem;">' + MESES_NOMES[m].substr(0, 3) + '</label><input type="number" id="prestMes' + m + '" value="' + val + '" step="0.01" style="padding:6px 8px;font-size:0.8rem;"></div>';
    }
    html += '</div></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Prestação' : 'Nova Prestação';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'savePrestacao()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editPrestacao(id) { openPrestacaoModal(id); }

function savePrestacao() {
    var meses = [];
    for (var m = 0; m < 12; m++) {
        meses.push(parseFloat(document.getElementById('prestMes' + m).value) || 0);
    }

    var data = {
        nome: document.getElementById('prestNome').value,
        valorParcela: parseFloat(document.getElementById('prestValor').value) || 0,
        numParcelas: parseInt(document.getElementById('prestNum').value) || 0,
        meses: meses
    };

    if (!data.nome) { showToast('Informe o nome!'); return; }

    if (currentEditId) {
        for (var i = 0; i < appData.prestacoes.length; i++) {
            if (appData.prestacoes[i].id === currentEditId) {
                appData.prestacoes[i] = Object.assign(appData.prestacoes[i], data);
                break;
            }
        }
        showToast('Prestação atualizada!');
    } else {
        data.id = nextId(appData.prestacoes);
        appData.prestacoes.push(data);
        showToast('Prestação adicionada!');
    }
    saveData();
    closeCadastroModal();
    renderPrestacoes();
}

function deletePrestacao(id) {
    if (!confirm('Excluir esta prestação?')) return;
    appData.prestacoes = appData.prestacoes.filter(function (p) { return p.id !== id; });
    saveData();
    renderPrestacoes();
    showToast('Prestação excluída!');
}

// ==================== PROJETOS ====================
function renderProjetos() {
    var lista = appData.projetos || [];
    var totalProjetos = 0, totalMes = 0, ativos = 0;
    var mesAtual = new Date().getMonth();

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        var totalP = 0;
        var temValor = false;
        for (var m = 0; m < 12; m++) {
            if (p.meses && p.meses[m]) { totalP += p.meses[m]; temValor = true; }
        }
        totalProjetos += totalP;
        if (p.meses && p.meses[mesAtual]) totalMes += p.meses[mesAtual];
        if (temValor) ativos++;

        html += '<div class="prestacao-card">';
        html += '<div class="prestacao-card-header"><div><h4>' + (p.nome || '') + '</h4><span style="font-size:0.75rem;color:var(--text-secondary);">' + (p.numParcelas || 0) + 'x de ' + formatCurrency(p.valorParcela || 0) + ' | Total: ' + formatCurrency(totalP) + '</span></div>';
        html += '<div><button class="btn btn-sm btn-secondary" onclick="editProjeto(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteProjeto(' + p.id + ')">🗑️</button></div></div>';
        html += '<div class="prestacao-grid">';
        for (var m2 = 0; m2 < 12; m2++) {
            var val = (p.meses && p.meses[m2]) ? p.meses[m2] : 0;
            var bgColor = val > 0 ? (m2 === mesAtual ? 'border:1px solid var(--orange-primary);' : '') : 'opacity:0.4;';
            html += '<div class="prestacao-mes" style="' + bgColor + '"><div class="mes-nome">' + MESES_NOMES[m2].substr(0, 3) + '</div><div class="mes-valor">' + (val > 0 ? formatCurrency(val) : '-') + '</div></div>';
        }
        html += '</div></div>';
    }

    document.getElementById('projetosLista').innerHTML = html || '<div style="text-align:center;color:var(--text-muted);padding:40px;">Nenhum projeto cadastrado</div>';

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalProjetos) + '</div><div class="s-label">Total Projetos</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--info)">' + formatCurrency(totalMes) + '</div><div class="s-label">Total por Mês</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value">' + ativos + '</div><div class="s-label">Projetos Ativos</div></div>';
    document.getElementById('projetosCards').innerHTML = cardsHTML;
}

function openProjetoModal(id) {
    currentEditId = id || null;
    var p = null;
    if (id) {
        for (var i = 0; i < appData.projetos.length; i++) {
            if (appData.projetos[i].id === id) { p = appData.projetos[i]; break; }
        }
    }

    var html = '';
    html += '<div class="form-group"><label>Nome</label><input type="text" id="projNome" value="' + (p ? p.nome : '') + '"></div>';
    html += '<div class="form-row"><div class="form-group"><label>Valor Parcela</label><input type="number" id="projValor" value="' + (p ? p.valorParcela : '') + '" step="0.01"></div>';
    html += '<div class="form-group"><label>Nº Parcelas</label><input type="number" id="projNum" value="' + (p ? p.numParcelas : '') + '" min="1" max="12"></div></div>';
    html += '<div style="margin-top:12px;"><label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">Valores por Mês</label>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px;">';
    for (var m = 0; m < 12; m++) {
        var val = (p && p.meses && p.meses[m]) ? p.meses[m] : '';
        html += '<div class="form-group" style="margin-bottom:0;"><label style="font-size:0.65rem;">' + MESES_NOMES[m].substr(0, 3) + '</label><input type="number" id="projMes' + m + '" value="' + val + '" step="0.01" style="padding:6px 8px;font-size:0.8rem;"></div>';
    }
    html += '</div></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Projeto' : 'Novo Projeto';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveProjeto()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editProjeto(id) { openProjetoModal(id); }

function saveProjeto() {
    var meses = [];
    for (var m = 0; m < 12; m++) {
        meses.push(parseFloat(document.getElementById('projMes' + m).value) || 0);
    }

    var data = {
        nome: document.getElementById('projNome').value,
        valorParcela: parseFloat(document.getElementById('projValor').value) || 0,
        numParcelas: parseInt(document.getElementById('projNum').value) || 0,
        meses: meses
    };

    if (!data.nome) { showToast('Informe o nome!'); return; }

    if (currentEditId) {
        for (var i = 0; i < appData.projetos.length; i++) {
            if (appData.projetos[i].id === currentEditId) {
                appData.projetos[i] = Object.assign(appData.projetos[i], data);
                break;
            }
        }
        showToast('Projeto atualizado!');
    } else {
        data.id = nextId(appData.projetos);
        appData.projetos.push(data);
        showToast('Projeto adicionado!');
    }
    saveData();
    closeCadastroModal();
    renderProjetos();
}

function deleteProjeto(id) {
    if (!confirm('Excluir este projeto?')) return;
    appData.projetos = appData.projetos.filter(function (p) { return p.id !== id; });
    saveData();
    renderProjetos();
    showToast('Projeto excluído!');
}

// ==================== PAGAMENTOS CLIENTES ====================
function renderPagClientes() {
    var lista = appData.pagClientes || [];
    var totalPago = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        totalPago += (p.valor || 0);

        html += '<tr>';
        html += '<td>' + formatDate(p.data) + '</td>';
        html += '<td>' + (p.cliente || '') + '</td>';
        html += '<td style="font-weight:700;">' + formatCurrency(p.valor || 0) + '</td>';
        html += '<td>' + (p.formaPagto || '') + '</td>';
        html += '<td style="font-size:0.75rem;">' + (p.obs || '') + '</td>';
        html += '<td><button class="btn btn-sm btn-secondary" onclick="editPagCliente(' + p.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deletePagCliente(' + p.id + ')">🗑️</button></td>';
        html += '</tr>';
    }

    document.getElementById('pagclientesBody').innerHTML = html || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Nenhum pagamento</td></tr>';

    // Resumo por cliente
    var clienteMap = {};
    for (var j = 0; j < lista.length; j++) {
        var pc = lista[j];
        if (!clienteMap[pc.cliente]) clienteMap[pc.cliente] = 0;
        clienteMap[pc.cliente] += (pc.valor || 0);
    }

    // Total que devem (vendas com status Devendo)
    var deveMap = {};
    for (var v = 0; v < appData.vendas.length; v++) {
        var venda = appData.vendas[v];
        if (venda.status === 'Devendo') {
            if (!deveMap[venda.cliente]) deveMap[venda.cliente] = 0;
            deveMap[venda.cliente] += (venda.qtd || 0) * (venda.valor || 0);
        }
    }

    var resumoHTML = '<div class="cards-grid">';
    var todosClientes = Object.keys(Object.assign({}, clienteMap, deveMap));
    for (var k = 0; k < todosClientes.length; k++) {
        var cl = todosClientes[k];
        var deve = deveMap[cl] || 0;
        var pagou = clienteMap[cl] || 0;
        var falta = Math.max(0, deve - pagou);
        resumoHTML += '<div class="card"><div class="card-label">' + cl + '</div>';
        resumoHTML += '<div style="margin-top:8px;font-size:0.8rem;"><span style="color:var(--danger);">Deve: ' + formatCurrency(deve) + '</span></div>';
        resumoHTML += '<div style="font-size:0.8rem;"><span style="color:var(--success);">Pagou: ' + formatCurrency(pagou) + '</span></div>';
        resumoHTML += '<div style="font-size:0.8rem;font-weight:700;"><span style="color:var(--orange-primary);">Falta: ' + formatCurrency(falta) + '</span></div>';
        resumoHTML += '</div>';
    }
    resumoHTML += '</div>';
    document.getElementById('pagclientesResumo').innerHTML = resumoHTML;

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + formatCurrency(totalPago) + '</div><div class="s-label">Total Recebido</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value">' + lista.length + '</div><div class="s-label">Pagamentos</div></div>';
    document.getElementById('pagclientesCards').innerHTML = cardsHTML;
}

function openPagClienteModal(id) {
    currentEditId = id || null;
    var p = null;
    if (id) {
        for (var i = 0; i < appData.pagClientes.length; i++) {
            if (appData.pagClientes[i].id === id) { p = appData.pagClientes[i]; break; }
        }
    }

    var clienteOpts = '<option value="">Selecione</option>';
    for (var c = 0; c < appData.clientes.length; c++) {
        var sel = p && p.cliente === appData.clientes[c].nome ? ' selected' : '';
        clienteOpts += '<option value="' + appData.clientes[c].nome + '"' + sel + '>' + appData.clientes[c].nome + '</option>';
    }

    var pagtoOpts = '<option value="">Selecione</option>';
    var formas = appData.config.formasPagamento || [];
    for (var fp = 0; fp < formas.length; fp++) {
        var selP = p && p.formaPagto === formas[fp] ? ' selected' : '';
        pagtoOpts += '<option value="' + formas[fp] + '"' + selP + '>' + formas[fp] + '</option>';
    }

    var html = '';
    html += '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" id="pagData" value="' + (p ? p.data : new Date().toISOString().split('T')[0]) + '"></div>';
    html += '<div class="form-group"><label>Valor</label><input type="number" id="pagValor" value="' + (p ? p.valor : '') + '" step="0.01"></div></div>';
    html += '<div class="form-group"><label>Cliente</label><select id="pagCliente">' + clienteOpts + '</select></div>';
    html += '<div class="form-group"><label>Forma de Pagamento</label><select id="pagFormaPagto">' + pagtoOpts + '</select></div>';
    html += '<div class="form-group"><label>Observação</label><textarea id="pagObs" rows="2">' + (p ? p.obs || '' : '') + '</textarea></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Pagamento' : 'Novo Pagamento';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'savePagCliente()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editPagCliente(id) { openPagClienteModal(id); }

function savePagCliente() {
    var data = {
        data: document.getElementById('pagData').value,
        cliente: document.getElementById('pagCliente').value,
        valor: parseFloat(document.getElementById('pagValor').value) || 0,
        formaPagto: document.getElementById('pagFormaPagto').value,
        obs: document.getElementById('pagObs').value
    };

    if (!data.cliente) { showToast('Selecione o cliente!'); return; }

    if (currentEditId) {
        for (var i = 0; i < appData.pagClientes.length; i++) {
            if (appData.pagClientes[i].id === currentEditId) {
                appData.pagClientes[i] = Object.assign(appData.pagClientes[i], data);
                break;
            }
        }
        showToast('Pagamento atualizado!');
    } else {
        data.id = nextId(appData.pagClientes);
        appData.pagClientes.push(data);
        showToast('Pagamento adicionado!');
    }
    saveData();
    closeCadastroModal();
    renderPagClientes();
}

function deletePagCliente(id) {
    if (!confirm('Excluir este pagamento?')) return;
    appData.pagClientes = appData.pagClientes.filter(function (p) { return p.id !== id; });
    saveData();
    renderPagClientes();
    showToast('Pagamento excluído!');
}

// ==================== GARANTIAS ====================
function renderGarantias() {
    var lista = appData.garantias || [];
    var ativas = 0, vencidas = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var g = lista[i];
        var dias = getDiasEntreHoje(g.vencimento);
        var situacao = dias >= 0 ? 'Ativa' : 'Vencida';

        if (situacao === 'Ativa') ativas++;
        else vencidas++;

        var statusClass = situacao === 'Ativa' ? 'badge-success' : 'badge-danger';
        var diasClass = dias > 90 ? 'dias-ok' : (dias > 0 ? 'dias-alerta' : 'dias-vencido');
        var diasTexto = dias >= 0 ? dias + ' dias restantes' : Math.abs(dias) + ' dias vencida';

        html += '<tr>';
        html += '<td>' + formatDate(g.inicio) + '</td>';
        html += '<td>' + (g.cliente || '') + '</td>';
        html += '<td>' + (g.produto || '') + '</td>';
        html += '<td>' + formatDate(g.vencimento) + '</td>';
        html += '<td><span class="badge ' + statusClass + '">' + situacao + '</span></td>';
        html += '<td><span class="dias-restantes ' + diasClass + '">' + diasTexto + '</span></td>';
        html += '<td><button class="btn btn-sm btn-secondary" onclick="editGarantia(' + g.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteGarantia(' + g.id + ')">🗑️</button></td>';
        html += '</tr>';
    }

    document.getElementById('garantiasBody').innerHTML = html || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Nenhuma garantia</td></tr>';

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--success)">' + ativas + '</div><div class="s-label">Ativas</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--danger)">' + vencidas + '</div><div class="s-label">Vencidas</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value">' + lista.length + '</div><div class="s-label">Total</div></div>';
    document.getElementById('garantiasCards').innerHTML = cardsHTML;
}

function openGarantiaModal(id) {
    currentEditId = id || null;
    var g = null;
    if (id) {
        for (var i = 0; i < appData.garantias.length; i++) {
            if (appData.garantias[i].id === id) { g = appData.garantias[i]; break; }
        }
    }

    var clienteOpts = '<option value="">Selecione</option>';
    for (var c = 0; c < appData.clientes.length; c++) {
        var sel = g && g.cliente === appData.clientes[c].nome ? ' selected' : '';
        clienteOpts += '<option value="' + appData.clientes[c].nome + '"' + sel + '>' + appData.clientes[c].nome + '</option>';
    }

    var situacaoOpts = '<option value="">Selecione</option>';
    var sits = appData.config.situacaoGarantia || [];
    for (var si = 0; si < sits.length; si++) {
        var selS = g && g.situacao === sits[si] ? ' selected' : '';
        situacaoOpts += '<option value="' + sits[si] + '"' + selS + '>' + sits[si] + '</option>';
    }

    var html = '';
    html += '<div class="form-row"><div class="form-group"><label>Início</label><input type="date" id="garantiaInicio" value="' + (g ? g.inicio : new Date().toISOString().split('T')[0]) + '"></div>';
    html += '<div class="form-group"><label>Vencimento</label><input type="date" id="garantiaVencimento" value="' + (g ? g.vencimento : '') + '"></div></div>';
    html += '<div class="form-group"><label>Cliente</label><select id="garantiaCliente">' + clienteOpts + '</select></div>';
    html += '<div class="form-group"><label>Produto</label><input type="text" id="garantiaProduto" value="' + (g ? g.produto : '') + '"></div>';
    html += '<div class="form-group"><label>Situação</label><select id="garantiaSituacao">' + situacaoOpts + '</select></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Garantia' : 'Nova Garantia';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveGarantia()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editGarantia(id) { openGarantiaModal(id); }

function saveGarantia() {
    var data = {
        inicio: document.getElementById('garantiaInicio').value,
        cliente: document.getElementById('garantiaCliente').value,
        produto: document.getElementById('garantiaProduto').value,
        vencimento: document.getElementById('garantiaVencimento').value,
        situacao: document.getElementById('garantiaSituacao').value
    };

    if (!data.produto) { showToast('Informe o produto!'); return; }

    if (currentEditId) {
        for (var i = 0; i < appData.garantias.length; i++) {
            if (appData.garantias[i].id === currentEditId) {
                appData.garantias[i] = Object.assign(appData.garantias[i], data);
                break;
            }
        }
        showToast('Garantia atualizada!');
    } else {
        data.id = nextId(appData.garantias);
        appData.garantias.push(data);
        showToast('Garantia adicionada!');
    }
    saveData();
    closeCadastroModal();
    renderGarantias();
}

function deleteGarantia(id) {
    if (!confirm('Excluir esta garantia?')) return;
    appData.garantias = appData.garantias.filter(function (g) { return g.id !== id; });
    saveData();
    renderGarantias();
    showToast('Garantia excluída!');
}

// ============================================================
// PARTE 8 — RELATÓRIOS, NOTAS, RECEITAS MEI, CONFIG, BACKUP, INIT
// ============================================================

// ==================== RELATÓRIOS ====================
function renderRelatorios() {
    var mesIdx = parseInt(document.getElementById('relatorioMes').value) || 0;
    var mesNome = MESES_NOMES[mesIdx];
    var html = '';

    // COMPRAS DO MÊS
    var comprasMes = appData.compras.filter(function (c) {
        if (!c.data) return false;
        var d = new Date(c.data + 'T00:00:00');
        return d.getMonth() === mesIdx;
    });
    var totalComprasMes = 0;
    var fornecedorMap = {};
    html += '<div class="relatorio-section"><div class="relatorio-section-header"><h4>🛒 Compras - ' + mesNome + '</h4></div><div class="relatorio-section-body">';
    for (var i = 0; i < comprasMes.length; i++) {
        var c = comprasMes[i];
        var total = (c.qtd || 0) * (c.valorUnit || 0);
        totalComprasMes += total;
        if (!fornecedorMap[c.fornecedor]) fornecedorMap[c.fornecedor] = 0;
        fornecedorMap[c.fornecedor] += total;
        html += '<div class="relatorio-item"><span>' + formatDate(c.data) + ' - ' + c.produto + ' (' + c.fornecedor + ')</span><span>' + formatCurrency(total) + '</span></div>';
    }
    if (comprasMes.length === 0) html += '<div class="relatorio-item"><span style="color:var(--text-muted);">Nenhuma compra no mês</span><span>-</span></div>';
    html += '<div class="relatorio-item relatorio-total"><span>TOTAL COMPRAS ' + mesNome.toUpperCase() + '</span><span>' + formatCurrency(totalComprasMes) + '</span></div>';

    var topFornecedor = '';
    var topFornecedorVal = 0;
    for (var fk in fornecedorMap) {
        if (fornecedorMap[fk] > topFornecedorVal) { topFornecedor = fk; topFornecedorVal = fornecedorMap[fk]; }
    }
    if (topFornecedor) html += '<div class="relatorio-item"><span>Maior fornecedor: <strong>' + topFornecedor + '</strong></span><span style="color:var(--orange-primary);">' + formatCurrency(topFornecedorVal) + '</span></div>';
    html += '</div></div>';

    // VENDAS DO MÊS
    var vendasMes = appData.vendas.filter(function (v) {
        if (!v.data) return false;
        var d = new Date(v.data + 'T00:00:00');
        return d.getMonth() === mesIdx;
    });
    var totalVendasMes = 0;
    var vendedorMap = {};
    var clienteMap = {};
    html += '<div class="relatorio-section"><div class="relatorio-section-header"><h4>💰 Vendas - ' + mesNome + '</h4></div><div class="relatorio-section-body">';
    for (var j = 0; j < vendasMes.length; j++) {
        var v = vendasMes[j];
        var totalV = (v.qtd || 0) * (v.valor || 0);
        totalVendasMes += totalV;
        if (!vendedorMap[v.vendedor]) vendedorMap[v.vendedor] = 0;
        vendedorMap[v.vendedor] += totalV;
        if (!clienteMap[v.cliente]) clienteMap[v.cliente] = 0;
        clienteMap[v.cliente] += totalV;
        html += '<div class="relatorio-item"><span>' + formatDate(v.data) + ' - ' + v.produto + ' (' + v.vendedor + ' → ' + v.cliente + ')</span><span>' + formatCurrency(totalV) + '</span></div>';
    }
    if (vendasMes.length === 0) html += '<div class="relatorio-item"><span style="color:var(--text-muted);">Nenhuma venda no mês</span><span>-</span></div>';
    html += '<div class="relatorio-item relatorio-total"><span>TOTAL VENDAS ' + mesNome.toUpperCase() + '</span><span>' + formatCurrency(totalVendasMes) + '</span></div>';

    var topCliente = '';
    var topClienteVal = 0;
    for (var ck in clienteMap) {
        if (clienteMap[ck] > topClienteVal) { topCliente = ck; topClienteVal = clienteMap[ck]; }
    }
    if (topCliente) html += '<div class="relatorio-item"><span>Maior cliente: <strong>' + topCliente + '</strong></span><span style="color:var(--orange-primary);">' + formatCurrency(topClienteVal) + '</span></div>';
    html += '</div></div>';

    // COMPRAS ANUAL
    var totalComprasAnual = 0;
    for (var ca = 0; ca < appData.compras.length; ca++) {
        totalComprasAnual += (appData.compras[ca].qtd || 0) * (appData.compras[ca].valorUnit || 0);
    }
    html += '<div class="relatorio-section"><div class="relatorio-section-header"><h4>🛒 Compras Anual 2026</h4></div><div class="relatorio-section-body">';
    html += '<div class="relatorio-item relatorio-total"><span>TOTAL COMPRAS ANUAL</span><span>' + formatCurrency(totalComprasAnual) + '</span></div>';
    html += '<div class="relatorio-item"><span>Média mensal</span><span>' + formatCurrency(totalComprasAnual / 12) + '</span></div>';
    html += '</div></div>';

    // VENDAS ANUAL
    var totalVendasAnual = 0;
    for (var va = 0; va < appData.vendas.length; va++) {
        totalVendasAnual += (appData.vendas[va].qtd || 0) * (appData.vendas[va].valor || 0);
    }
    html += '<div class="relatorio-section"><div class="relatorio-section-header"><h4>💰 Vendas Anual 2026</h4></div><div class="relatorio-section-body">';
    html += '<div class="relatorio-item relatorio-total"><span>TOTAL VENDAS ANUAL</span><span>' + formatCurrency(totalVendasAnual) + '</span></div>';
    html += '<div class="relatorio-item"><span>Média mensal</span><span>' + formatCurrency(totalVendasAnual / 12) + '</span></div>';
    var metaVendas = appData.empresa ? appData.empresa.metaVendas : 30000;
    var projecao = totalVendasAnual > 0 ? (totalVendasAnual / (mesIdx + 1)) * 12 : 0;
    html += '<div class="relatorio-item"><span>Projeção anual (baseado em ' + (mesIdx + 1) + ' meses)</span><span style="color:var(--info);">' + formatCurrency(projecao) + '</span></div>';
    html += '<div class="relatorio-item"><span>Meta anual (R$ 30.000 x 12)</span><span>' + formatCurrency(metaVendas * 12) + '</span></div>';
    html += '</div></div>';

    // DIFERENÇA COMPRA/VENDA
    var lucroAnual = totalVendasAnual - totalComprasAnual;
    var lucroMes = totalVendasMes - totalComprasMes;
    html += '<div class="relatorio-section"><div class="relatorio-section-header"><h4>📊 Diferença Compra/Venda</h4></div><div class="relatorio-section-body">';
    html += '<div class="relatorio-item"><span>Lucro ' + mesNome + '</span><span style="color:' + (lucroMes >= 0 ? 'var(--success)' : 'var(--danger)') + ';font-weight:700;">' + formatCurrency(lucroMes) + '</span></div>';
    html += '<div class="relatorio-item relatorio-total"><span>LUCRO ANUAL</span><span style="color:' + (lucroAnual >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + formatCurrency(lucroAnual) + '</span></div>';
    html += '</div></div>';

    // VENDEDORES
    html += '<div class="relatorio-section"><div class="relatorio-section-header"><h4>👥 Vendedores - ' + mesNome + '</h4></div><div class="relatorio-section-body">';
    var vends = appData.config.vendedores || [];
    for (var vi = 0; vi < vends.length; vi++) {
        var vendNome = vends[vi];
        var vendTotal = vendedorMap[vendNome] || 0;
        var metaSalario = appData.empresa ? appData.empresa.metaSalario : 6000;
        var falta = Math.max(0, metaSalario - vendTotal);
        html += '<div class="relatorio-item"><span>' + vendNome + '</span><span>Vendas: ' + formatCurrency(vendTotal) + ' | Meta: ' + formatCurrency(metaSalario) + ' | Falta: <strong style="color:' + (falta > 0 ? 'var(--danger)' : 'var(--success)') + ';">' + formatCurrency(falta) + '</strong></span></div>';
    }
    html += '</div></div>';

    document.getElementById('relatoriosContent').innerHTML = html;
}

// ==================== NOTAS DE ENTRADA ====================
function renderNotasEntrada() {
    var lista = appData.notasEntrada || [];
    var totalGeral = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var n = lista[i];
        totalGeral += (n.valor || 0);
        html += '<tr>';
        html += '<td>' + formatDate(n.data) + '</td>';
        html += '<td>' + (n.fornecedor || '') + '</td>';
        html += '<td style="font-weight:700;">' + formatCurrency(n.valor || 0) + '</td>';
        html += '<td>' + MESES_NOMES[n.mesRef || 0] + '</td>';
        html += '<td><button class="btn btn-sm btn-secondary" onclick="editNotaEntrada(' + n.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaEntrada(' + n.id + ')">🗑️</button></td>';
        html += '</tr>';
    }

    document.getElementById('notasEntradaBody').innerHTML = html || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Nenhuma nota de entrada</td></tr>';

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalGeral) + '</div><div class="s-label">Total</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value">' + lista.length + '</div><div class="s-label">Registros</div></div>';
    document.getElementById('notasEntradaCards').innerHTML = cardsHTML;
}

function openNotaEntradaModal(id) {
    currentEditId = id || null;
    var n = null;
    if (id) {
        for (var i = 0; i < appData.notasEntrada.length; i++) {
            if (appData.notasEntrada[i].id === id) { n = appData.notasEntrada[i]; break; }
        }
    }

    var fornecedorOpts = '<option value="">Selecione</option>';
    for (var f = 0; f < appData.fornecedores.length; f++) {
        var sel = n && n.fornecedor === appData.fornecedores[f].nome ? ' selected' : '';
        fornecedorOpts += '<option value="' + appData.fornecedores[f].nome + '"' + sel + '>' + appData.fornecedores[f].nome + '</option>';
    }

    var mesOpts = '';
    for (var m = 0; m < 12; m++) {
        var selM = n && n.mesRef === m ? ' selected' : '';
        mesOpts += '<option value="' + m + '"' + selM + '>' + MESES_NOMES[m] + '</option>';
    }

    var html = '';
    html += '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" id="neData" value="' + (n ? n.data : new Date().toISOString().split('T')[0]) + '"></div>';
    html += '<div class="form-group"><label>Valor</label><input type="number" id="neValor" value="' + (n ? n.valor : '') + '" step="0.01"></div></div>';
    html += '<div class="form-group"><label>Fornecedor</label><select id="neFornecedor">' + fornecedorOpts + '</select></div>';
    html += '<div class="form-group"><label>Mês Referência</label><select id="neMesRef">' + mesOpts + '</select></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Nota de Entrada' : 'Nova Nota de Entrada';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveNotaEntrada()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editNotaEntrada(id) { openNotaEntradaModal(id); }

function saveNotaEntrada() {
    var data = {
        data: document.getElementById('neData').value,
        fornecedor: document.getElementById('neFornecedor').value,
        valor: parseFloat(document.getElementById('neValor').value) || 0,
        mesRef: parseInt(document.getElementById('neMesRef').value) || 0
    };

    if (currentEditId) {
        for (var i = 0; i < appData.notasEntrada.length; i++) {
            if (appData.notasEntrada[i].id === currentEditId) {
                appData.notasEntrada[i] = Object.assign(appData.notasEntrada[i], data);
                break;
            }
        }
        showToast('Nota atualizada!');
    } else {
        data.id = nextId(appData.notasEntrada);
        appData.notasEntrada.push(data);
        showToast('Nota adicionada!');
    }
    saveData();
    closeCadastroModal();
    renderNotasEntrada();
}

function deleteNotaEntrada(id) {
    if (!confirm('Excluir esta nota?')) return;
    appData.notasEntrada = appData.notasEntrada.filter(function (n) { return n.id !== id; });
    saveData();
    renderNotasEntrada();
    showToast('Nota excluída!');
}

// ==================== NOTAS DE SAÍDA ====================
function renderNotasSaida() {
    var lista = appData.notasSaida || [];
    var totalGeral = 0;

    var html = '';
    for (var i = 0; i < lista.length; i++) {
        var n = lista[i];
        totalGeral += (n.valor || 0);
        html += '<tr>';
        html += '<td>' + formatDate(n.data) + '</td>';
        html += '<td>' + (n.cliente || '') + '</td>';
        html += '<td style="font-weight:700;">' + formatCurrency(n.valor || 0) + '</td>';
        html += '<td>' + MESES_NOMES[n.mesRef || 0] + '</td>';
        html += '<td><button class="btn btn-sm btn-secondary" onclick="editNotaSaida(' + n.id + ')">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteNotaSaida(' + n.id + ')">🗑️</button></td>';
        html += '</tr>';
    }

    document.getElementById('notasSaidaBody').innerHTML = html || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Nenhuma nota de saída</td></tr>';

    // Fiscal
    var dasnSimei = totalGeral * 0.05;
    var lucroTotal = totalGeral * 0.32;
    var parcelaIsenta = lucroTotal;
    var rendTributario = totalGeral - parcelaIsenta;
    var inss = totalGeral * 0.05;
    var icms = totalGeral * 0.01;
    var impostoPago = dasnSimei + inss + icms;

    var fiscalHTML = '';
    fiscalHTML += '<div class="relatorio-item"><span>Total Notas de Saída</span><span style="font-weight:700;">' + formatCurrency(totalGeral) + '</span></div>';
    fiscalHTML += '<div class="relatorio-item"><span>DASN-SIMEI (5%)</span><span>' + formatCurrency(dasnSimei) + '</span></div>';
    fiscalHTML += '<div class="relatorio-item"><span>Lucro Total (32%)</span><span>' + formatCurrency(lucroTotal) + '</span></div>';
    fiscalHTML += '<div class="relatorio-item"><span>Parcela Isenta</span><span>' + formatCurrency(parcelaIsenta) + '</span></div>';
    fiscalHTML += '<div class="relatorio-item"><span>Rendimento Tributário</span><span>' + formatCurrency(rendTributario) + '</span></div>';
    fiscalHTML += '<div class="relatorio-item"><span>INSS (5%)</span><span>' + formatCurrency(inss) + '</span></div>';
    fiscalHTML += '<div class="relatorio-item"><span>ICMS (1%)</span><span>' + formatCurrency(icms) + '</span></div>';
    fiscalHTML += '<div class="relatorio-item relatorio-total"><span>TOTAL IMPOSTO PAGO</span><span>' + formatCurrency(impostoPago) + '</span></div>';
    document.getElementById('notasSaidaFiscal').innerHTML = fiscalHTML;

    var cardsHTML = '';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--orange-primary)">' + formatCurrency(totalGeral) + '</div><div class="s-label">Total</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value">' + lista.length + '</div><div class="s-label">Registros</div></div>';
    cardsHTML += '<div class="summary-card"><div class="s-value" style="color:var(--danger)">' + formatCurrency(impostoPago) + '</div><div class="s-label">Impostos</div></div>';
    document.getElementById('notasSaidaCards').innerHTML = cardsHTML;
}

function openNotaSaidaModal(id) {
    currentEditId = id || null;
    var n = null;
    if (id) {
        for (var i = 0; i < appData.notasSaida.length; i++) {
            if (appData.notasSaida[i].id === id) { n = appData.notasSaida[i]; break; }
        }
    }

    var clienteOpts = '<option value="">Selecione</option>';
    for (var c = 0; c < appData.clientes.length; c++) {
        var sel = n && n.cliente === appData.clientes[c].nome ? ' selected' : '';
        clienteOpts += '<option value="' + appData.clientes[c].nome + '"' + sel + '>' + appData.clientes[c].nome + '</option>';
    }

    var mesOpts = '';
    for (var m = 0; m < 12; m++) {
        var selM = n && n.mesRef === m ? ' selected' : '';
        mesOpts += '<option value="' + m + '"' + selM + '>' + MESES_NOMES[m] + '</option>';
    }

    var html = '';
    html += '<div class="form-row"><div class="form-group"><label>Data</label><input type="date" id="nsData" value="' + (n ? n.data : new Date().toISOString().split('T')[0]) + '"></div>';
    html += '<div class="form-group"><label>Valor</label><input type="number" id="nsValor" value="' + (n ? n.valor : '') + '" step="0.01"></div></div>';
    html += '<div class="form-group"><label>Cliente</label><select id="nsCliente">' + clienteOpts + '</select></div>';
    html += '<div class="form-group"><label>Mês Referência</label><select id="nsMesRef">' + mesOpts + '</select></div>';

    document.getElementById('cadastroModalTitle').textContent = id ? 'Editar Nota de Saída' : 'Nova Nota de Saída';
    document.getElementById('cadastroModalBody').innerHTML = html;
    document.getElementById('cadastroModalSaveBtn').setAttribute('onclick', 'saveNotaSaida()');
    document.getElementById('cadastroModal').classList.add('active');
}

function editNotaSaida(id) { openNotaSaidaModal(id); }

function saveNotaSaida() {
    var data = {
        data: document.getElementById('nsData').value,
        cliente: document.getElementById('nsCliente').value,
        valor: parseFloat(document.getElementById('nsValor').value) || 0,
        mesRef: parseInt(document.getElementById('nsMesRef').value) || 0
    };

    if (currentEditId) {
        for (var i = 0; i < appData.notasSaida.length; i++) {
            if (appData.notasSaida[i].id === currentEditId) {
                appData.notasSaida[i] = Object.assign(appData.notasSaida[i], data);
                break;
            }
        }
        showToast('Nota atualizada!');
    } else {
        data.id = nextId(appData.notasSaida);
        appData.notasSaida.push(data);
        showToast('Nota adicionada!');
    }
    saveData();
    closeCadastroModal();
    renderNotasSaida();
}

function deleteNotaSaida(id) {
    if (!confirm('Excluir esta nota?')) return;
    appData.notasSaida = appData.notasSaida.filter(function (n) { return n.id !== id; });
    saveData();
    renderNotasSaida();
    showToast('Nota excluída!');
}

// ==================== RECEITAS MEI ====================
function renderReceitasMei() {
    var mesIdx = parseInt(document.getElementById('meiMes').value) || 0;
    var mesNome = MESES_NOMES[mesIdx];

    var notasMes = (appData.notasSaida || []).filter(function (n) { return n.mesRef === mesIdx; });
    var totalComNota = 0;
    for (var i = 0; i < notasMes.length; i++) {
        totalComNota += (notasMes[i].valor || 0);
    }

    var vendasMes = (appData.vendas || []).filter(function (v) {
        if (!v.data) return false;
        return new Date(v.data + 'T00:00:00').getMonth() === mesIdx;
    });
    var totalVendasMes = 0;
    for (var j = 0; j < vendasMes.length; j++) {
        totalVendasMes += (vendasMes[j].qtd || 0) * (vendasMes[j].valor || 0);
    }
    var totalSemNota = Math.max(0, totalVendasMes - totalComNota);
    var totalGeral = totalComNota + totalSemNota;

    var html = '<div class="mei-doc" id="meiDocPrint">';
    html += '<h2>RELATÓRIO MENSAL DAS RECEITAS BRUTAS</h2>';
    html += '<p style="text-align:center;">MICROEMPREENDEDOR INDIVIDUAL - MEI</p>';
    html += '<br>';
    html += '<table>';
    html += '<tr><td><strong>CNPJ:</strong></td><td>' + (appData.empresa ? appData.empresa.cnpj : '29.595.239/0001-33') + '</td></tr>';
    html += '<tr><td><strong>Empreendedor:</strong></td><td>' + (appData.empresa ? appData.empresa.nome : 'WD MÁQUINAS') + '</td></tr>';
    html += '<tr><td><strong>Período de Apuração:</strong></td><td>' + mesNome + ' de 2026</td></tr>';
    html += '</table>';
    html += '<br>';

    html += '<table>';
    html += '<tr><th colspan="2">I - RECEITA BRUTA MENSAL - REVENDA DE MERCADORIAS (COMÉRCIO)</th></tr>';
    html += '<tr><td>1. Receita com emissão de nota fiscal/documento fiscal</td><td style="text-align:right;">' + formatCurrency(totalComNota) + '</td></tr>';
    html += '<tr><td>2. Receita sem emissão de nota fiscal/documento fiscal</td><td style="text-align:right;">' + formatCurrency(totalSemNota) + '</td></tr>';
    html += '<tr><td><strong>3. TOTAL (1+2)</strong></td><td style="text-align:right;"><strong>' + formatCurrency(totalGeral) + '</strong></td></tr>';
    html += '</table>';
    html += '<br>';

    html += '<table>';
    html += '<tr><th colspan="2">II - RECEITA BRUTA MENSAL - VENDA DE PRODUTOS INDUSTRIALIZADOS (INDÚSTRIA)</th></tr>';
    html += '<tr><td>4. Receita com emissão de nota fiscal/documento fiscal</td><td style="text-align:right;">' + formatCurrency(0) + '</td></tr>';
    html += '<tr><td>5. Receita sem emissão de nota fiscal/documento fiscal</td><td style="text-align:right;">' + formatCurrency(0) + '</td></tr>';
    html += '<tr><td><strong>6. TOTAL (4+5)</strong></td><td style="text-align:right;"><strong>' + formatCurrency(0) + '</strong></td></tr>';
    html += '</table>';
    html += '<br>';

    html += '<table>';
    html += '<tr><th colspan="2">III - RECEITA BRUTA MENSAL - PRESTAÇÃO DE SERVIÇOS</th></tr>';
    html += '<tr><td>7. Receita com emissão de nota fiscal/documento fiscal</td><td style="text-align:right;">' + formatCurrency(0) + '</td></tr>';
    html += '<tr><td>8. Receita sem emissão de nota fiscal/documento fiscal</td><td style="text-align:right;">' + formatCurrency(0) + '</td></tr>';
    html += '<tr><td><strong>9. TOTAL (7+8)</strong></td><td style="text-align:right;"><strong>' + formatCurrency(0) + '</strong></td></tr>';
    html += '</table>';
    html += '<br>';

    html += '<table>';
    html += '<tr style="background:#ddd;"><td><strong>IV - TOTAL GERAL DAS RECEITAS BRUTAS NO MÊS (3+6+9)</strong></td><td style="text-align:right;"><strong>' + formatCurrency(totalGeral) + '</strong></td></tr>';
    html += '</table>';
    html += '<br><br>';

    html += '<p style="text-align:center;">LOCAL E DATA: Uberlândia, _____ de ' + mesNome + ' de 2026</p>';
    html += '<br><br>';
    html += '<p style="text-align:center;">_____________________________________________</p>';
    html += '<p style="text-align:center;">ASSINATURA DO EMPRESÁRIO</p>';
    html += '</div>';

    document.getElementById('meiDocumento').innerHTML = html;
}

function gerarPDFMei() {
    var conteudo = document.getElementById('meiDocPrint');
    if (!conteudo) { showToast('Gere o relatório primeiro!'); return; }

    var win = window.open('', '_blank');
    win.document.write('<html><head><title>Receitas MEI - WD Máquinas</title>');
    win.document.write('<style>body{font-family:Arial,sans-serif;padding:40px;color:#333;font-size:14px;line-height:1.6;}');
    win.document.write('h2{text-align:center;margin-bottom:10px;}table{width:100%;border-collapse:collapse;margin:16px 0;}');
    win.document.write('th,td{border:1px solid #999;padding:8px 12px;font-size:13px;}th{background:#eee;font-weight:700;text-align:left;}');
    win.document.write('p{margin:4px 0;}@media print{body{padding:20px;}}</style></head><body>');
    win.document.write(conteudo.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    setTimeout(function () { win.print(); }, 500);
}

// ==================== CONFIGURAÇÕES ====================
function renderConfiguracoes() {
    var configs = [
        { key: 'vendedores', label: 'Vendedores', icon: '👥' },
        { key: 'formasPagamento', label: 'Formas de Pagamento', icon: '💳' },
        { key: 'tiposUnidade', label: 'Tipos de Unidade', icon: '📏' },
        { key: 'situacaoCompra', label: 'Situação da Compra', icon: '🛒' },
        { key: 'tipoVenda', label: 'Tipo de Venda', icon: '💰' },
        { key: 'situacaoEntrega', label: 'Situação de Entrega', icon: '📦' },
        { key: 'situacaoGarantia', label: 'Situação de Garantia', icon: '🛡️' },
        { key: 'situacaoCheque', label: 'Situação do Cheque', icon: '📝' }
    ];

    var html = '';
    for (var c = 0; c < configs.length; c++) {
        var cfg = configs[c];
        var items = appData.config[cfg.key] || [];

        html += '<div class="config-section">';
        html += '<div class="config-section-header"><h4>' + cfg.icon + ' ' + cfg.label + ' (' + items.length + ')</h4></div>';
        html += '<div class="config-section-body">';

        for (var i = 0; i < items.length; i++) {
            html += '<div class="config-item"><span>' + items[i] + '</span>';
            html += '<div class="config-item-actions">';
            html += '<button onclick="editConfigItem(\'' + cfg.key + '\',' + i + ')" title="Editar">✏️</button>';
            html += '<button class="del" onclick="deleteConfigItem(\'' + cfg.key + '\',' + i + ')" title="Excluir">🗑️</button>';
            html += '</div></div>';
        }

        html += '<div class="config-add">';
        html += '<input type="text" id="configAdd_' + cfg.key + '" placeholder="Adicionar ' + cfg.label.toLowerCase() + '...">';
        html += '<button class="btn btn-primary btn-sm" onclick="addConfigItem(\'' + cfg.key + '\')">+</button>';
        html += '</div></div></div>';
    }

    document.getElementById('configContent').innerHTML = html;
}

function addConfigItem(key) {
    var input = document.getElementById('configAdd_' + key);
    var valor = input.value.trim();
    if (!valor) { showToast('Digite um valor!'); return; }

    if (!appData.config[key]) appData.config[key] = [];
    appData.config[key].push(valor);
    saveData();
    renderConfiguracoes();
    showToast('Item adicionado!');
}

function editConfigItem(key, index) {
    var items = appData.config[key] || [];
    var novoValor = prompt('Editar valor:', items[index]);
    if (novoValor === null) return;
    novoValor = novoValor.trim();
    if (!novoValor) { showToast('Valor não pode ser vazio!'); return; }

    appData.config[key][index] = novoValor;
    saveData();
    renderConfiguracoes();
    showToast('Item atualizado!');
}

function deleteConfigItem(key, index) {
    if (!confirm('Excluir este item?')) return;
    appData.config[key].splice(index, 1);
    saveData();
    renderConfiguracoes();
    showToast('Item excluído!');
}

// ==================== BACKUP ====================
function exportBackup() {
    var dataStr = JSON.stringify(appData, null, 2);
    var blob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'wdmaquinas_backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso!');
}

function importBackup(event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var data = JSON.parse(e.target.result);
            appData = data;
            saveData();
            showToast('Backup restaurado com sucesso!');
            renderPage(currentPage);
        } catch (err) {
            showToast('Erro ao ler arquivo! Verifique se é um JSON válido.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function clearAllData() {
    if (!confirm('ATENÇÃO: Isso vai apagar TODOS os dados! Tem certeza?')) return;
    if (!confirm('Tem CERTEZA MESMO? Esta ação não pode ser desfeita!')) return;

    localStorage.removeItem('wdmaquinas_data');
    appData = {
        empresa: getDefaultData().empresa,
        config: getDefaultData().config,
        clientes: [], fornecedores: [], produtos: [], pfornecedores: [],
        compras: [], vendas: [], estoque: [],
        boletos: [], cheques: [], prestacoes: [], projetos: [],
        pagClientes: [], garantias: [],
        notasEntrada: [], notasSaida: [],
        fluxoCaixa: {}
    };
    saveData();
    renderPage(currentPage);
    showToast('Todos os dados foram limpos!');
}

function restoreDefaults() {
    if (!confirm('Restaurar todos os dados originais do Excel? Dados atuais serão perdidos!')) return;

    appData = getDefaultData();
    saveData();
    renderPage(currentPage);
    showToast('Dados restaurados ao padrão!');
}

function renderBackupInfo() {
    var dataSize = (new Blob([JSON.stringify(appData)])).size;
    var sizeKB = (dataSize / 1024).toFixed(2);

    var html = '';
    html += '<div class="view-detail"><span class="view-label">Tamanho dos dados:</span><span>' + sizeKB + ' KB</span></div>';
    html += '<div class="view-detail"><span class="view-label">Compras:</span><span>' + (appData.compras || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Vendas:</span><span>' + (appData.vendas || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Clientes:</span><span>' + (appData.clientes || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Fornecedores:</span><span>' + (appData.fornecedores || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Produtos:</span><span>' + (appData.produtos || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">P. Fornecedores:</span><span>' + (appData.pfornecedores || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Estoque:</span><span>' + (appData.estoque || []).length + ' itens</span></div>';
    html += '<div class="view-detail"><span class="view-label">Boletos:</span><span>' + (appData.boletos || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Cheques:</span><span>' + (appData.cheques || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Prestações:</span><span>' + (appData.prestacoes || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Projetos:</span><span>' + (appData.projetos || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Garantias:</span><span>' + (appData.garantias || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Notas Entrada:</span><span>' + (appData.notasEntrada || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Notas Saída:</span><span>' + (appData.notasSaida || []).length + ' registros</span></div>';
    html += '<div class="view-detail"><span class="view-label">Vendedores:</span><span>' + (appData.config.vendedores || []).length + '</span></div>';
    html += '<div class="view-detail"><span class="view-label">Formas Pagamento:</span><span>' + (appData.config.formasPagamento || []).length + '</span></div>';

    document.getElementById('backupInfo').innerHTML = html;
}

// ==================== INICIALIZAÇÃO ====================
function init() {
    loadData();

    // Data no topbar
    var hoje = new Date();
    var dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    var meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    document.getElementById('topbarDate').textContent = dias[hoje.getDay()] + ', ' + hoje.getDate() + ' de ' + meses[hoje.getMonth()] + ' de ' + hoje.getFullYear();

    // Fechar modais ao clicar fora
    document.getElementById('cadastroModal').addEventListener('click', function (e) {
        if (e.target === this) closeCadastroModal();
    });
    document.getElementById('viewModal').addEventListener('click', function (e) {
        if (e.target === this) closeViewModal();
    });

    // Render dashboard
    renderDashboard();

    saveData();
}

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', init);
