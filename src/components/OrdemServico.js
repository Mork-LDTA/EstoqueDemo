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
  FileText
} from "lucide-react";

export default function OrdemServico({ products, setProducts, osList, setOsList, movements, setMovements }) {
  // Estados do Formulário de Cadastro
  const [solicitante, setSolicitante] = useState("");
  const [recebedor, setRecebedor] = useState("");
  const [equipamento, setEquipamento] = useState("");
  const [problema, setProblema] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [aplicacao, setAplicacao] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  // Estados de Busca e Visibilidade do Dropdown no Formulário
  const [productSearch, setProductSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Estados dos Filtros do Histórico Inferior
  const [filterId, setFilterId] = useState("");
  const [filterData, setFilterData] = useState("");
  const [filterRemetente, setFilterRemetente] = useState("");
  const [filterDestinatario, setFilterDestinatario] = useState("");

  // Mensagens de Erro e Sucesso do Formulário
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
    
    // Filtro de data comparando apenas a parte YYYY-MM-DD
    const osDataISO = os.dataHora.split("T")[0];
    const matchData = filterData ? osDataISO === filterData : true;
    
    const matchRemetente = filterRemetente.trim() ? os.solicitante.toLowerCase().includes(filterRemetente.trim().toLowerCase()) : true;
    const matchDestinatario = filterDestinatario.trim() ? os.recebedor.toLowerCase().includes(filterDestinatario.trim().toLowerCase()) : true;

    return matchId && matchData && matchRemetente && matchDestinatario;
  });

  // --- FUNÇÃO PARA GERAR E BAIXAR O TERMO EXECUTÁVEL EM HTML ---
  const handlePrintOs = (os) => {
    const prod = products.find(p => p.codProduto === os.codProduto) || {
      descricao: os.produtoDescricao.split(" (")[0],
      marca: os.produtoDescricao.includes("(") ? os.produtoDescricao.split("(")[1].replace(")", "") : "",
      codProduto: os.codProduto,
      codInterno: "---"
    };
    
    const dateFormatted = new Date(os.dataHora).toLocaleString("pt-BR");

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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #111827;
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
              border: 2px solid #111827;
            }
            .header-table td {
              border: 1px solid #111827;
              padding: 10px;
              vertical-align: middle;
            }
            .company-name {
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 0.5px;
            }
            .doc-title {
              font-size: 12px;
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
              background-color: #f3f4f6;
              padding: 5px 8px;
              border: 1px solid #111827;
              border-bottom: none;
              margin-top: 15px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #111827;
              margin-bottom: 15px;
            }
            .info-table td {
              border: 1px solid #111827;
              padding: 8px 10px;
              width: 50%;
              vertical-align: top;
            }
            .info-table p {
              margin: 3px 0;
            }
            .info-table span {
              font-weight: 700;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #111827;
              margin-top: -1px;
              margin-bottom: 15px;
            }
            .items-table th {
              border: 1px solid #111827;
              background-color: #f3f4f6;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 9px;
              padding: 6px 8px;
              text-align: left;
            }
            .items-table td {
              border: 1px solid #111827;
              padding: 6px 8px;
              font-size: 10px;
            }
            .clause-box {
              border: 1px solid #111827;
              padding: 12px;
              font-size: 10px;
              text-align: justify;
              margin-top: -1px;
              line-height: 1.4;
              margin-bottom: 40px;
            }
            .signatures-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 40px;
            }
            .signatures-table td {
              width: 50%;
              text-align: center;
              vertical-align: bottom;
              padding: 0 20px;
              border: none;
            }
            .line-draw {
              border-top: 1px solid #000;
              width: 85%;
              margin: 0 auto 5px auto;
            }
            .signature-label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              white-space: pre-line;
            }
            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 35%;">
                <div class="company-name">FX MINAS CONSTRUTORA LTDA</div>
                <div style="font-size: 8px; color: #4b5563;">DEPARTAMENTO DE LOGÍSTICA & ALMOXARIFADO</div>
              </td>
              <td style="width: 40%;">
                <div class="doc-title">TERMO DE RESPONSABILIDADE E RETIRADA DE MATERIAIS</div>
              </td>
              <td style="width: 25%;" class="control-info">
                <div>Nº CONTROLE: <span class="os-id">${os.id}</span></div>
                <div style="margin-top: 4px;">EMISSÃO: ${dateFormatted}</div>
              </td>
            </tr>
          </table>

          <div class="section-header">Bloco 1 - Identificação dos Envolvidos</div>
          <table class="info-table">
            <tr>
              <td>
                <p><span>RESPONSÁVEL PELA LIBERAÇÃO:</span> Almoxarife</p>
                <p><span>DEPARTAMENTO:</span> Almoxarifado Central</p>
              </td>
              <td>
                <p><span>SOLICITANTE / RECEBEDOR:</span> ${os.solicitante}</p>
                <p><span>FUNÇÃO OU CARGO (RECEBEDOR):</span> ${os.recebedor} (${os.equipamento})</p>
                <p><span>APLICAÇÃO:</span> ${os.aplicacao}</p>
              </td>
            </tr>
          </table>

          <div class="section-header">Bloco 2 - Tabela de Itens Retirados</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">Item</th>
                <th style="width: 40%;">Descrição do Produto</th>
                <th style="width: 15%;">Marca</th>
                <th style="width: 15%;">Ref. Fabricante</th>
                <th style="width: 15%;">Cód. Interno</th>
                <th style="width: 10%; text-align: center;">Qtd Retirada</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center;">1</td>
                <td><strong>${prod.descricao || os.produtoDescricao}</strong></td>
                <td>${prod.marca || "---"}</td>
                <td style="font-family: monospace;">${os.codProduto}</td>
                <td style="font-family: monospace;">#${prod.codInterno}</td>
                <td style="text-align: center; font-weight: bold; font-size: 11px;">${os.quantidade}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-header">Bloco 3 - Cláusula de Compromisso e Responsabilidade</div>
          <div class="clause-box">
            Declaro para os devidos fins que recebi em perfeito estado os materiais acima listados, assumindo total responsabilidade pelo uso adequado, aplicação na respectiva ordem de serviço e guarda dos mesmos.
          </div>

          <table class="signatures-table">
            <tr>
              <td>
                <div class="line-draw"></div>
                <div class="signature-label">SOLICITANTE / RECEBEDOR<br><span style="font-weight: 400; font-size: 8px; color: #4b5563;">CPF/RE: ______________________________</span></div>
              </td>
              <td>
                <div class="line-draw"></div>
                <div class="signature-label">RESPONSÁVEL PELA LIBERAÇÃO<br><span style="font-weight: 400; font-size: 8px; color: #4b5563;">ALMOXARIFADO CENTRAL</span></div>
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

  // --- SUBMETER CADASTRO DE NOVA ORDEM DE SERVIÇO ---
  const handleSubmitOs = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!solicitante || !recebedor || !equipamento || !problema || !selectedProductId || !aplicacao || !quantidade) {
      setErrorMsg("Por favor, preencha todos os campos da Ordem de Serviço.");
      return;
    }

    if (Number(quantidade) <= 0) {
      setErrorMsg("A quantidade a ser retirada deve ser maior que zero.");
      return;
    }

    if (!selectedProduct) {
      setErrorMsg("Produto inválido selecionado.");
      return;
    }

    if (selectedProduct.quantidade < Number(quantidade)) {
      setErrorMsg(`Estoque insuficiente. Quantidade disponível: ${selectedProduct.quantidade} unidades.`);
      return;
    }

    const proxNumero = osList.length + 1;
    const osId = "OS-" + String(proxNumero).padStart(4, "0");
    const dataHoraStr = new Date().toISOString();

    const newOs = {
      id: osId,
      solicitante,
      recebedor,
      equipamento,
      problema,
      codProduto: selectedProduct.codProduto,
      produtoDescricao: `${selectedProduct.descricao} (${selectedProduct.marca})`,
      aplicacao,
      quantidade: Number(quantidade),
      dataHora: dataHoraStr,
    };

    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        return { ...p, quantidade: p.quantidade - Number(quantidade) };
      }
      return p;
    });

    const newMove = {
      id: "mov-" + Date.now() + Math.random(),
      tipo: "Saída OS",
      descricao: `Retirada de ${quantidade} un para ${osId} (Destinatário: ${recebedor})`,
      codProduto: selectedProduct.codProduto,
      produtoDescricao: `${selectedProduct.descricao} (${selectedProduct.marca})`,
      quantidade: Number(quantidade),
      usuario: solicitante,
      dataHora: dataHoraStr
    };

    setProducts(updatedProducts);
    setOsList([newOs, ...osList]);
    setMovements([newMove, ...movements]);

    handlePrintOs(newOs);

    setSolicitante("");
    setRecebedor("");
    setEquipamento("");
    setProblema("");
    setSelectedProductId("");
    setProductSearch("");
    setAplicacao("");
    setQuantidade(1);

    setSuccessMsg(`Ordem de Serviço ${osId} registrada com sucesso! Termo gerado.`);
    alert(`Ordem de Serviço ${osId} salva com sucesso!\nO estoque do produto foi reduzido.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabeçalho de Aba */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
          Ordem de Serviço (Saída de Estoque)
        </h2>
        <p className="text-sm text-gray-600">
          Abra novas requisições de retirada de materiais, reduza saldos e emita Termos de Responsabilidade em tempo real.
        </p>
      </div>

      {/* Grid Principal Superior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bloco do Formulário */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-100 flex items-center space-x-2">
            <Wrench size={16} className="text-orange-500" />
            <span>Formulário de Abertura de OS</span>
          </h3>

          <form onSubmit={handleSubmitOs} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center space-x-2">
                <FileCheck size={14} className="flex-shrink-0" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center space-x-1">
                  <User size={12} className="text-gray-400" />
                  <span>Retirado por (Solicitante)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Silva"
                  value={solicitante}
                  onChange={(e) => setSolicitante(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500"
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
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500"
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
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Input de Busca de Itens */}
              <div className="space-y-1 relative">
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
                    className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500"
                    required
                  />
                  {selectedProductId && (
                    <button
                      type="button"
                      onClick={() => { setSelectedProductId(""); setProductSearch(""); setIsOpen(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto divide-y divide-gray-100">
                    {filteredProductsForSelect.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 text-center">Nenhum produto correspondente.</div>
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
                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex flex-col space-y-0.5 ${isDisabled ? "opacity-40 cursor-not-allowed bg-gray-50" : ""} ${isExactMatch ? "bg-orange-50/70 border-l-4 border-l-orange-500" : ""}`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-xs text-gray-950">{p.descricao} ({p.marca})</span>
                              {isExactMatch && <span className="bg-orange-500 text-black text-[8px] font-black uppercase px-1 rounded">Match</span>}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                              Ref: <span className="font-mono font-bold text-gray-700">{p.codProduto}</span> • Int: <span className="font-mono font-bold text-gray-700">#{p.codInterno}</span> • Saldo: <span className="font-bold text-gray-900">{p.quantidade} un</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Descrição do Problema / Diagnóstico
                </label>
                <textarea
                  rows="2"
                  placeholder="Descreva brevemente a necessidade mecânica"
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500"
                  required
                ></textarea>
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
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Quantidade Retirada
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-150 p-3 rounded-lg flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1 font-medium">
                <Calendar size={13} className="text-gray-400" />
                <span>Data/Hora de Emissão (Automática):</span>
              </span>
              <span className="font-bold text-gray-700 font-mono">{new Date().toLocaleString()}</span>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-black font-black uppercase text-xs py-3.5 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
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
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{os.equipamento}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-950 font-bold"><span className="text-orange-600 font-black">{os.quantidade}x</span> {os.produtoDescricao}</p>
                      <p className="text-[10px] text-gray-400 font-mono">Ref: {os.codProduto}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintOs(os)}
                        title="Baixar Segunda Via"
                        className="p-2 bg-gray-950 text-white rounded-lg hover:bg-black hover:text-orange-500 transition-all shadow-sm flex items-center justify-center mx-auto"
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