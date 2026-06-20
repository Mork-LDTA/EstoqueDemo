import React, { useState } from "react";
import { 
  Wrench, 
  User, 
  Cpu, 
  AlertCircle,
  FileCheck,
  Calendar,
  Printer,
  History,
  SlidersHorizontal,
  FileText,
  Trash2
} from "lucide-react";

export default function OrdemServico({ products, setProducts, osList, setOsList, movements, setMovements }) {
  // Estados do Formulário de Cadastro (Cabeçalho)
  const [solicitante, setSolicitante] = useState("");
  const [recebedor, setRecebedor] = useState("");
  const [funcaoRecebedor, setFuncaoRecebedor] = useState("");
  const [problema, setProblema] = useState("");
  const [aplicacao, setAplicacao] = useState("");

  // Estados do Produto Selecionado na Fila
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Fila de Retirada (Carrinho Temporário)
  const [cartItems, setCartItems] = useState([]);

  // Estados dos Filtros do Histórico Inferior
  const [filterId, setFilterId] = useState("");
  const [filterData, setFilterData] = useState("");
  const [filterRemetente, setFilterRemetente] = useState("");
  const [filterDestinatario, setFilterDestinatario] = useState("");

  // Mensagens de Erro e Sucesso
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // --- LOGICA DE BUSCA AVANÇADA DE PRODUTOS (FORMULÁRIO) ---
  const searchTrimmed = productSearch.trim().toLowerCase();
  const filteredProductsForSelect = products.filter(p => {
    if (!searchTrimmed) return true;
    return (
      p.descricao.toLowerCase().includes(searchTrimmed) ||
      p.codProduto.toLowerCase().includes(searchTrimmed) ||
      p.codInterno.toString().toLowerCase().includes(searchTrimmed)
    );
  });

  if (searchTrimmed) {
    filteredProductsForSelect.sort((a, b) => {
      const exactA = 
        a.codProduto.toLowerCase() === searchTrimmed ||
        a.codInterno.toString().toLowerCase() === searchTrimmed;
        
      const exactB = 
        b.codProduto.toLowerCase() === searchTrimmed ||
        b.codInterno.toString().toLowerCase() === searchTrimmed;
        
      if (exactA && !exactB) return -1;
      if (!exactA && exactB) return 1;
      return 0;
    });
  }

  // Obter o produto selecionado atualmente no formulário
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // --- LOGICA DE FILTRAGEM DO HISTÓRICO INFERIOR ---
  const filteredOSHistory = osList.filter(os => {
    const matchId = filterId.trim() ? os.id.toLowerCase().includes(filterId.trim().toLowerCase()) : true;
    const osDataISO = os.dataHora ? os.dataHora.split("T")[0] : "";
    const matchData = filterData ? osDataISO === filterData : true;
    const matchRemetente = filterRemetente.trim() ? os.solicitante.toLowerCase().includes(filterRemetente.trim().toLowerCase()) : true;
    const matchDestinatario = filterDestinatario.trim() ? os.recebedor.toLowerCase().includes(filterDestinatario.trim().toLowerCase()) : true;

    return matchId && matchData && matchRemetente && matchDestinatario;
  });

  // --- IMPRESSÃO DO TERMO DE RESPONSABILIDADE ---
  const handlePrintOs = (os) => {
    const dateFormatted = new Date(os.dataHora).toLocaleString("pt-BR");

    // Resolve as linhas da tabela de produtos do termo
    const itensToPrint = os.itens && os.itens.length > 0 
      ? os.itens.map((it, idx) => {
          // Busca dados complementares do produto
          const dbProd = products.find(p => p.id === it.id || p.codProduto === it.codProduto) || {};
          return {
            index: idx + 1,
            descricao: it.descricao,
            marca: it.marca || dbProd.marca || "---",
            codProduto: it.codProduto,
            codInterno: it.codInterno || dbProd.codInterno || "---",
            quantidade: it.quantidade
          };
        })
      : [{
          index: 1,
          descricao: os.produtoDescricao.split(" (")[0],
          marca: os.produtoDescricao.includes("(") ? os.produtoDescricao.split("(")[1].replace(")", "") : "---",
          codProduto: os.codProduto,
          codInterno: products.find(p => p.codProduto === os.codProduto)?.codInterno || "---",
          quantidade: os.quantidade
        }];

    const itemRowsHtml = itensToPrint.map(item => `
      <tr>
        <td style="text-align: center; border: 1px solid #000000; padding: 8px;">${item.index}</td>
        <td style="border: 1px solid #000000; padding: 8px;"><strong>${item.descricao}</strong></td>
        <td style="border: 1px solid #000000; padding: 8px;">${item.marca}</td>
        <td style="font-family: monospace; border: 1px solid #000000; padding: 8px;">${item.codProduto}</td>
        <td style="font-family: monospace; border: 1px solid #000000; padding: 8px;">#${item.codInterno}</td>
        <td style="text-align: center; font-weight: 900; font-size: 12px; border: 1px solid #000000; padding: 8px;">${item.quantidade}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Termo de Retirada - ${os.id}</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              color: #000000;
              background-color: #ffffff;
              margin: 0;
              padding: 40px;
              font-size: 11px;
              line-height: 1.5;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 2px solid #000000;
            }
            .header-table td {
              border: 1px solid #000000;
              padding: 10px;
              vertical-align: middle;
            }
            .company-name {
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 0.5px;
            }
            .doc-title {
              font-size: 11px;
              font-weight: 700;
              text-align: center;
              text-transform: uppercase;
            }
            .control-info {
              font-size: 10px;
              font-weight: 600;
              text-align: right;
            }
            .os-id {
              font-size: 14px;
              font-weight: 800;
              color: #000;
            }
            .section-header {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              background-color: #e5e7eb;
              padding: 6px 10px;
              border: 2px solid #000000;
              border-bottom: none;
              margin-top: 15px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000000;
              margin-bottom: 15px;
            }
            .info-table td {
              border: 1px solid #000000;
              padding: 10px;
              width: 50%;
              vertical-align: top;
            }
            .info-table p {
              margin: 4px 0;
            }
            .info-table span {
              font-weight: 700;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000000;
              margin-top: -1px;
              margin-bottom: 15px;
            }
            .items-table th {
              border: 1px solid #000000;
              background-color: #f3f4f6;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 9px;
              padding: 8px;
              text-align: left;
            }
            .items-table td {
              border: 1px solid #000000;
              padding: 8px;
              font-size: 11px;
            }
            .clause-box {
              border: 2px solid #000000;
              padding: 12px;
              font-size: 10.5px;
              text-align: justify;
              margin-top: -1px;
              line-height: 1.5;
              margin-bottom: 40px;
            }
            .signatures-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 65px;
            }
            .signatures-table td {
              width: 50%;
              text-align: center;
              vertical-align: bottom;
              padding: 0 15px;
              border: none;
            }
            .line-draw {
              border-top: 1px solid #000000;
              width: 90%;
              margin: 0 auto 5px auto;
            }
            .signature-label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .cpf-field {
              font-weight: 400;
              font-size: 8.5px;
              color: #444444;
              display: block;
              margin-top: 24px;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 40%;">
                <div class="company-name">FX MINAS CONSTRUTORA LTDA</div>
                <div style="font-size: 8px; color: #555555; font-weight: 600; margin-top: 2px;">DEPARTAMENTO DE LOGÍSTICA & ALMOXARIFADO</div>
              </td>
              <td style="width: 35%;">
                <div class="doc-title">TERMO DE RESPONSABILIDADE E RETIRADA DE MATERIAIS</div>
              </td>
              <td style="width: 25%;" class="control-info">
                <div>Nº CONTROLE: <span class="os-id">${os.id}</span></div>
                <div style="margin-top: 4px; color: #444444;">EMISSÃO: ${dateFormatted}</div>
              </td>
            </tr>
          </table>

          <div class="section-header">Bloco 1 - Identificação dos Envolvidos</div>
          <table class="info-table">
            <tr>
              <td>
                <p><span>RESPONSÁVEL PELA LIBERAÇÃO:</span> ${os.solicitante}</p>
                <p><span>DEPARTAMENTO:</span> Almoxarifado Central</p>
              </td>
              <td>
                <p><span>SOLICITANTE / RECEBEDOR:</span> ${os.recebedor}</p>
                <p><span>FUNÇÃO / CARGO:</span> ${os.funcaoRecebedor}</p>
                <p><span>APLICAÇÃO:</span> ${os.aplicacao}</p>
              </td>
            </tr>
          </table>

          <div class="section-header">Bloco 2 - Tabela de Itens Retirados</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 8%; text-align: center; color: #000000;">Item</th>
                <th style="width: 42%; color: #000000;">Descrição do Produto</th>
                <th style="width: 15%; color: #000000;">Marca</th>
                <th style="width: 15%; color: #000000;">Ref. Fabricante</th>
                <th style="width: 12%; color: #000000;">Cód. Int</th>
                <th style="width: 10%; text-align: center; color: #000000;">Qtd</th>
              </tr>
            </thead>
            <tbody>
              ${itemRowsHtml}
            </tbody>
          </table>

          <div class="section-header">Bloco 3 - Cláusula de Compromisso e Responsabilidade</div>
          <div class="clause-box">
            Declaro para os devidos fins que recebi em perfeito estado os materiais acima listados, assumindo total responsabilidade pelo uso adequado, aplicação na respectiva ordem de serviço e guarda dos mesmos conforme as diretrizes de segurança da construtora.
          </div>

          <table class="signatures-table">
            <tr>
              <td>
                <div class="line-draw"></div>
                <div class="signature-label">
                  SOLICITANTE / RECEBEDOR
                  <span class="cpf-field">CPF/RE: _____________________________________</span>
                </div>
              </td>
              <td>
                <div class="line-draw"></div>
                <div class="signature-label">
                  RESPONSÁVEL ALMOXARIFADO
                  <span style="font-weight: 400; font-size: 8px; color: #555555; display: block; margin-top: 24px;">FX MINAS CONSTRUTORA</span>
                </div>
              </td>
            </tr>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Termo_Responsabilidade_${os.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- ADICIONAR ITEM À FILA TEMPORÁRIA ---
  const handleAddToFila = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedProductId || !quantidade) {
      setErrorMsg("Selecione um produto e defina a quantidade.");
      return;
    }

    if (Number(quantidade) <= 0) {
      setErrorMsg("A quantidade deve ser maior que zero.");
      return;
    }

    if (!selectedProduct) {
      setErrorMsg("Produto selecionado é inválido.");
      return;
    }

    // Valida estoque considerando o que já está na fila
    const existingItem = cartItems.find(item => item.id === selectedProduct.id);
    const qtdExistente = existingItem ? existingItem.quantidade : 0;
    const qtdTotalRequisitada = qtdExistente + Number(quantidade);

    if (selectedProduct.quantidade < qtdTotalRequisitada) {
      setErrorMsg(`Estoque insuficiente. Disponível em estoque: ${selectedProduct.quantidade} un. Já adicionado na fila: ${qtdExistente} un.`);
      return;
    }

    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === selectedProduct.id
          ? { ...item, quantidade: qtdTotalRequisitada }
          : item
      ));
    } else {
      setCartItems([
        ...cartItems,
        {
          id: selectedProduct.id,
          codInterno: selectedProduct.codInterno,
          descricao: selectedProduct.descricao,
          marca: selectedProduct.marca,
          codProduto: selectedProduct.codProduto,
          quantidade: Number(quantidade)
        }
      ]);
    }

    // Limpa apenas campos de produto e quantidade
    setSelectedProductId("");
    setProductSearch("");
    setQuantidade(1);
    setSuccessMsg("Item adicionado à Fila de Retirada!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // --- REGISTRAR E EMITIR OS ---
  const handleSubmitOs = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!solicitante || !recebedor || !problema || !aplicacao) {
      setErrorMsg("Por favor, preencha todos os campos do cabeçalho da Ordem de Serviço.");
      return;
    }

    if (!funcaoRecebedor || !funcaoRecebedor.trim()) {
      setErrorMsg("O campo Função ou Cargo precisa ser preenchido");
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg("A Fila de Retirada está vazia. Adicione pelo menos 1 item.");
      return;
    }

    // Validação de segurança dupla de estoque
    for (const item of cartItems) {
      const dbProd = products.find(p => p.id === item.id);
      if (!dbProd) {
        setErrorMsg(`Produto "${item.descricao}" não foi encontrado no estoque.`);
        return;
      }
      if (dbProd.quantidade < item.quantidade) {
        setErrorMsg(`Estoque insuficiente para "${item.descricao}". Disponível: ${dbProd.quantidade} un.`);
        return;
      }
    }

    const proxNumero = osList.length + 1;
    const osId = "OS-" + String(proxNumero).padStart(4, "0");
    const dataHoraStr = new Date().toISOString();

    const newOs = {
      id: osId,
      solicitante,
      recebedor,
      funcaoRecebedor,
      problema,
      aplicacao,
      dataHora: dataHoraStr,
      itens: cartItems,
      // Fallbacks para compatibilidade retroativa:
      quantidade: cartItems.reduce((sum, item) => sum + item.quantidade, 0),
      produtoDescricao: cartItems.map(item => `${item.descricao} (${item.marca})`).join(", "),
      codProduto: cartItems.map(item => item.codProduto).join(", ")
    };

    // Decrementa o estoque real de cada um
    const updatedProducts = products.map(p => {
      const cartItem = cartItems.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, quantidade: p.quantidade - cartItem.quantidade };
      }
      return p;
    });

    // Gerar logs de histórico individuais
    const newMovements = cartItems.map((item, idx) => ({
      id: `mov-${Date.now()}-${idx}-${Math.random()}`,
      tipo: "Saída OS",
      descricao: `Retirada de ${item.quantidade} un para ${osId} (Recebedor: ${recebedor} - ${funcaoRecebedor})`,
      codProduto: item.codProduto,
      produtoDescricao: `${item.descricao} (${item.marca})`,
      quantidade: item.quantidade,
      usuario: solicitante,
      dataHora: dataHoraStr
    }));

    setProducts(updatedProducts);
    setOsList([newOs, ...osList]);
    setMovements([...newMovements, ...movements]);

    handlePrintOs(newOs);

    // Reseta todo o formulário e a fila
    setSolicitante("");
    setRecebedor("");
    setFuncaoRecebedor("");
    setProblema("");
    setAplicacao("");
    setSelectedProductId("");
    setProductSearch("");
    setQuantidade(1);
    setCartItems([]);

    setSuccessMsg(`Ordem de Serviço ${osId} registrada com sucesso! Termo de Responsabilidade gerado.`);
    alert(`Ordem de Serviço ${osId} salva com sucesso!\nO estoque dos itens retirados foi reduzido.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabeçalho de Aba */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
          Ordem de Serviço (Saída de Estoque)
        </h2>
        <p className="text-sm text-gray-600 font-medium">
          Abra novas requisições de retirada de múltiplos materiais, reduza saldos e emita Termos de Responsabilidade em tempo real.
        </p>
      </div>

      {/* Grid Principal Superior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bloco do Formulário */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-100 flex items-center space-x-2">
            <Wrench size={16} className="text-orange-500" />
            <span>Formulário de Abertura de OS (Lote)</span>
          </h3>

          <form onSubmit={handleSubmitOs} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center space-x-2 animate-in fade-in duration-200">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center space-x-2 animate-in fade-in duration-200">
                <FileCheck size={14} className="flex-shrink-0" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            {/* Cabeçalho do Termo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Responsável pela Liberação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Silva"
                  value={solicitante}
                  onChange={(e) => setSolicitante(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center space-x-1">
                  <User size={12} className="text-gray-400" />
                  <span>Entregue para (Recebedor)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marcos Lima"
                  value={recebedor}
                  onChange={(e) => setRecebedor(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center space-x-1">
                  <Cpu size={12} className="text-gray-400" />
                  <span>Função ou Cargo (Recebedor)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Supervisor de Manutenção"
                  value={funcaoRecebedor}
                  onChange={(e) => setFuncaoRecebedor(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Aplicação / Finalidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Substituição preventiva"
                  value={aplicacao}
                  onChange={(e) => setAplicacao(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-955 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Descrição do Problema / Diagnóstico
                </label>
                <textarea
                  rows="2"
                  placeholder="Descreva brevemente a necessidade mecânica..."
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-955 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                  required
                ></textarea>
              </div>
            </div>

            {/* SEÇÃO DO CARRINHO / SELEÇÃO DE PRODUTOS */}
            <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 space-y-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block font-sans">Seleção de Itens (Adicionar ao Lote)</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* Produto */}
                <div className="space-y-1 relative md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Produto para Retirada
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Busque por Nome, Marca ou Códigos..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setIsOpen(true);
                        if (!e.target.value) setSelectedProductId("");
                      }}
                      onFocus={() => setIsOpen(true)}
                      onBlur={() => setTimeout(() => setIsOpen(false), 250)}
                      className="w-full bg-white border border-gray-200 text-gray-955 px-4 py-3 pl-4 rounded-xl text-base font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 md:px-3 md:py-2 md:text-sm md:rounded-lg"
                    />
                    {selectedProductId && (
                      <button
                        type="button"
                        onClick={() => { setSelectedProductId(""); setProductSearch(""); setIsOpen(false); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer md:right-3 md:text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
                      {filteredProductsForSelect.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">Nenhum produto correspondente.</div>
                      ) : (
                        filteredProductsForSelect.map((p) => {
                          const isDisabled = p.quantidade <= 0;
                          const isExactMatch = searchTrimmed && (
                            p.codProduto.toLowerCase() === searchTrimmed ||
                            p.codInterno.toString().toLowerCase() === searchTrimmed
                          );

                          return (
                            <button
                              key={p.id}
                              type="button"
                              disabled={isDisabled}
                              onMouseDown={() => {
                                setSelectedProductId(p.id);
                                setProductSearch(`${p.descricao} (${p.marca})`);
                                setIsOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col space-y-1 ${isDisabled ? "opacity-40 cursor-not-allowed bg-gray-50" : ""} ${isExactMatch ? "bg-orange-50/70 border-l-4 border-l-orange-500" : ""}`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-extrabold text-sm text-gray-955">{p.descricao} ({p.marca})</span>
                                {isExactMatch && <span className="bg-orange-500 text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Match</span>}
                              </div>
                              <div className="text-xs text-gray-505 font-semibold flex flex-wrap gap-x-2 gap-y-0.5">
                                <span>Ref: <strong className="font-mono text-gray-700">{p.codProduto}</strong></span>
                                <span>Int: <strong className="font-mono text-gray-700">#{p.codInterno}</strong></span>
                                <span>Saldo: <strong className="text-gray-900">{p.quantidade} un</strong></span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Quantidade */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Quantidade Retirada
                  </label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setQuantidade(prev => Math.max(1, Number(prev) - 1))}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-900 dark:text-white font-black text-lg w-12 h-11 md:w-10 md:h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer flex items-center justify-center select-none active:scale-95 transition-transform"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      className="flex-1 min-w-0 text-center bg-white border border-gray-200 text-gray-955 h-11 md:h-9 rounded-lg text-sm font-bold focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantidade(prev => Number(prev) + 1)}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-900 dark:text-white font-black text-lg w-12 h-11 md:w-10 md:h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer flex items-center justify-center select-none active:scale-95 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Botão de Adicionar à Fila */}
              <button
                type="button"
                onClick={handleAddToFila}
                className="w-full bg-gray-950 hover:bg-orange-600 text-white font-bold uppercase text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer md:py-2.5 md:rounded-lg"
              >
                + Adicionar Item na OS
              </button>
            </div>

            {/* TABELA TEMPORÁRIA DE CONFERÊNCIA / CARDS MOBILE */}
            {cartItems.length > 0 && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center space-x-1.5">
                  <span>Fila de Retirada ({cartItems.length} {cartItems.length === 1 ? "item" : "itens"})</span>
                </label>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold uppercase">
                        <th className="py-2.5 px-4">Descrição do Item</th>
                        <th className="py-2.5 px-4">Marca</th>
                        <th className="py-2.5 px-4 text-center">Ref. Fabricante</th>
                        <th className="py-2.5 px-4 text-center">Qtd Retirada</th>
                        <th className="py-2.5 px-4 text-center">Remover</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {cartItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-gray-955">{item.descricao}</td>
                          <td className="py-3 px-4 text-gray-600">{item.marca}</td>
                          <td className="py-3 px-4 text-center font-mono text-gray-500">{item.codProduto}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-extrabold bg-gray-50 border border-gray-200 px-3 py-1 rounded text-gray-955">
                              {item.quantidade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setCartItems(cartItems.filter((_, i) => i !== idx));
                              }}
                              className="p-1.5 text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              title="Remover da fila"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS LIST */}
                <div className="block md:hidden space-y-3">
                  {cartItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between space-x-4 hover:border-gray-300 transition-colors animate-in slide-in-from-bottom-2 duration-255"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-extrabold text-sm text-gray-955 truncate">{item.descricao}</p>
                        <div className="text-xs text-gray-550 font-semibold flex flex-wrap gap-x-2">
                          <span>Marca: <strong className="text-gray-700">{item.marca}</strong></span>
                          <span>Ref: <strong className="font-mono text-gray-700">{item.codProduto}</strong></span>
                        </div>
                        <div className="pt-1 flex items-center space-x-1.5">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Qtd:</span>
                          <span className="font-extrabold bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded text-xs text-gray-955">
                            {item.quantidade}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setCartItems(cartItems.filter((_, i) => i !== idx));
                          }}
                          className="p-3 text-red-650 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer flex items-center justify-center active:scale-95"
                          title="Remover da fila"
                        >
                          <Trash2 size={18} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-150 p-3 rounded-lg flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1 font-medium">
                <Calendar size={13} className="text-gray-400" />
                <span>Data/Hora de Emissão (Automática):</span>
              </span>
              <span className="font-bold text-gray-700 font-mono">{new Date().toLocaleString()}</span>
            </div>

            {/* Registrar OS */}
            <button
              type="submit"
              disabled={cartItems.length === 0}
              className={`w-full text-black font-black uppercase text-xs py-3.5 rounded-lg transition-all shadow-sm ${
                cartItems.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                  : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
              }`}
            >
              REGISTRAR OS E EMITIR TERMO DE RESPONSABILIDADE
            </button>
          </form>
        </div>

        {/* Painel Lateral Informativo */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-gray-950 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center space-x-1.5">
            <FileText size={14} className="text-orange-500" />
            <span>Status do Item Selecionado</span>
          </h3>

          {!selectedProduct ? (
            <div className="text-center py-8 text-xs text-gray-400 italic">
              Nenhum produto em triagem de OS no momento.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-400 font-bold">CÓD. INTERNO</span>
                <span className="font-mono font-bold text-orange-600">#{selectedProduct.codInterno}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-400 font-bold">MARCA</span>
                <span className="font-bold text-gray-800">{selectedProduct.marca}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1.5">
                <span className="text-gray-400 font-bold">POSIÇÃO FÍSICA</span>
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-900 font-bold">{selectedProduct.localizacao || "PENDENTE"}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500 font-bold">ESTOQUE FÍSICO</span>
                <span className={`text-lg font-black ${selectedProduct.quantidade < 3 ? "text-red-600" : "text-gray-950"}`}>{selectedProduct.quantidade} pçs</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- HISTÓRICO INTEGRADO COM FILTROS AVANÇADOS --- */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
          <History size={18} className="text-orange-500" />
          <h3 className="font-black text-gray-950 text-sm uppercase tracking-wider">
            Histórico Consolidado de Ordens de Serviço
          </h3>
        </div>

        {/* Painel de Filtros */}
        <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-500 uppercase flex items-center space-x-1">
              <SlidersHorizontal size={10} /> <span>Nº Controle OS</span>
            </span>
            <input 
              type="text" 
              placeholder="Ex: 0001"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-500 uppercase flex items-center space-x-1">
              <Calendar size={10} /> <span>Data de Registro</span>
            </span>
            <input 
              type="date" 
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-500 uppercase flex items-center space-x-1">
              <User size={10} /> <span>Remetente (Solicitante)</span>
            </span>
            <input 
              type="text" 
              placeholder="Filtrar operador..."
              value={filterRemetente}
              onChange={(e) => setFilterRemetente(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-500 uppercase flex items-center space-x-1">
              <User size={10} /> <span>Destinatário (Recebedor)</span>
            </span>
            <input 
              type="text" 
              placeholder="Filtrar recebedor..."
              value={filterDestinatario}
              onChange={(e) => setFilterDestinatario(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
            />
          </div>
        </div>

        {/* Tabela do Histórico */}
        <div className="overflow-x-auto border border-gray-150 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase bg-gray-50">
                <th className="py-3 px-4">Nº OS</th>
                <th className="py-3 px-4">Data / Horário</th>
                <th className="py-3 px-4">Remetente (Emissor)</th>
                <th className="py-3 px-4">Destinatário (Aplicação)</th>
                <th className="py-3 px-4">Item Retirado</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredOSHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-400 italic">
                    Nenhum registro de Ordem de Serviço encontrado.
                  </td>
                </tr>
              ) : (
                filteredOSHistory.map((os) => (
                  <tr key={os.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-gray-950 font-bold font-mono tracking-wide">{os.id}</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(os.dataHora).toLocaleString("pt-BR")}</td>
                    <td className="py-3 px-4 text-gray-950 font-semibold">{os.solicitante}</td>
                    <td className="py-3 px-4">
                      <p className="text-gray-950 font-semibold">{os.recebedor}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{os.funcaoRecebedor}</p>
                    </td>
                    <td className="py-3 px-4">
                      {os.itens && os.itens.length > 0 ? (
                        <div className="space-y-2 py-1">
                          {os.itens.map((it, idx) => (
                            <div key={idx} className="border-b border-gray-50 last:border-none pb-1.5 last:pb-0">
                              <p className="text-gray-950 font-bold">
                                <span className="text-orange-600 font-black">{it.quantidade}x</span> {it.descricao}
                              </p>
                              <p className="text-[9px] text-gray-400 font-mono">Ref: {it.codProduto}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-950 font-bold"><span className="text-orange-600 font-black">{os.quantidade}x</span> {os.produtoDescricao}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Ref: {os.codProduto}</p>
                        </>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintOs(os)}
                        title="Baixar Segunda Via"
                        className="p-2 bg-gray-950 text-white rounded-lg hover:bg-black hover:text-orange-500 transition-all shadow-sm flex items-center justify-center mx-auto cursor-pointer"
                      >
                        <Printer size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}