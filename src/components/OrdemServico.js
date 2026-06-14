import React, { useState } from "react";
import { 
  Wrench, 
  User, 
  Cpu, 
  AlertCircle,
  FileCheck,
  Calendar,
  Printer
} from "lucide-react";

export default function OrdemServico({ products, setProducts, osList, setOsList, movements, setMovements }) {
  // Estados do Formulário
  const [solicitante, setSolicitante] = useState("");
  const [recebedor, setRecebedor] = useState("");
  const [equipamento, setEquipamento] = useState("");
  const [problema, setProblema] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [aplicacao, setAplicacao] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  // Estados de Busca e Visibilidade do Dropdown
  const [productSearch, setProductSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filtragem e ordenação inteligente dos produtos
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

  // Mensagens de Erro e Sucesso
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Obter o produto selecionado
  const selectedProduct = products.find(p => p.id === selectedProductId);
// Função para Gerar e Baixar o Termo de Responsabilidade em formato HTML/PDF direto para Downloads
  const handlePrintOs = (os) => {
    // Tenta encontrar o produto no estoque para obter marca e codInterno
    const prod = products.find(p => p.codProduto === os.codProduto) || {
      descricao: os.produtoDescricao.split(" (")[0],
      marca: os.produtoDescricao.includes("(") ? os.produtoDescricao.split("(")[1].replace(")", "") : "",
      codProduto: os.codProduto,
      codInterno: "---"
    };
    
    const dateFormatted = new Date(os.dataHora).toLocaleString("pt-BR");

    // Montagem do template estruturado do documento contratual profissional
    const htmlContent = `
      <html>
        <head>
          <title>Termo de Retirada - ${os.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #111827;
              background-color: #ffffff;
              margin: 0;
              padding: 30px;
              font-size: 11px;
              line-height: 1.5;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 1px solid #111827;
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
              margin-top: 15px;
              line-height: 1.4;
            }
            .signatures-container {
              margin-top: 50px;
              display: table;
              width: 100%;
            }
            .signature-col {
              display: table-cell;
              width: 50%;
              text-align: center;
              vertical-align: bottom;
              padding: 0 20px;
            }
            .line-draw {
              border-top: 1px solid #000;
              width: 80%;
              margin: 0 auto 5px auto;
            }
            .signature-label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              white-space: pre-line;
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

          <div class="signatures-container">
            <div class="signature-col">
              <div class="line-draw"></div>
              <div class="signature-label">SOLICITANTE / RECEBEDOR<br>CPF/RE: ______________________________</div>
            </div>
            <div class="signature-col">
              <div class="line-draw"></div>
              <div class="signature-label">RESPONSÁVEL PELA LIBERAÇÃO<br>ALMOXARIFADO</div>
            </div>
          </div>
          
          <script>
            // Força a execução automática da impressão ao converter ou abrir o arquivo
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    // Converte a string HTML em um objeto Blob seguro
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    
    // Instancia uma URL temporária na memória do navegador
    const url = URL.createObjectURL(blob);
    
    // Constrói um elemento âncora oculto para injetar o evento de download
    const link = document.createElement("a");
    link.href = url;
    
    // Define a saída com a nomenclatura estruturada da OS correspondente
    link.download = `Termo_Responsabilidade_${os.id}.html`;
    
    // Insere o elemento, executa o clique virtual e o remove da estrutura do DOM
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libera a memória alocada para a URL temporária
    URL.revokeObjectURL(url);
  };

  // Submeter Ordem de Serviço (Saída de Estoque)
  const handleSubmitOs = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!solicitante || !recebedor || !equipamento || !problema || !selectedProductId || !aplicacao || !quantidade) {
      setErrorMsg("Por favor, preencha todos os campos da Ordem de Serviço.");
      return;
    }

    if (quantidade <= 0) {
      setErrorMsg("A quantidade a ser retirada deve ser maior que zero.");
      return;
    }

    if (!selectedProduct) {
      setErrorMsg("Produto inválido selecionado.");
      return;
    }

    // Validar se há estoque disponível
    if (selectedProduct.quantidade < quantidade) {
      setErrorMsg(`Estoque insuficiente. Quantidade disponível: ${selectedProduct.quantidade} unidades.`);
      return;
    }

    // Criar Nova OS
    const osId = "OS-" + (1000 + osList.length + 1);
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

    // Subtrair quantidade do produto
    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          quantidade: p.quantidade - Number(quantidade)
        };
      }
      return p;
    });

    // Criar Log de Movimentação (Saída)
    const newMov = {
      id: "mov-" + Date.now(),
      tipo: "Saída OS",
      descricao: `Retirada de ${quantidade} unidades para ${osId} (Equipamento: ${equipamento})`,
      codProduto: selectedProduct.codProduto,
      produtoDescricao: `${selectedProduct.descricao} (${selectedProduct.marca})`,
      quantidade: Number(quantidade),
      usuario: solicitante,
      dataHora: dataHoraStr
    };

    // Atualizar Estados Globais
    setProducts(updatedProducts);
    setOsList([newOs, ...osList]);
    setMovements([newMov, ...movements]);

    // Gerar e imprimir o Termo de Responsabilidade em PDF
    handlePrintOs(newOs);

    // Limpar Formulário e dar Feedback
    setSolicitante("");
    setRecebedor("");
    setEquipamento("");
    setProblema("");
    setSelectedProductId("");
    setProductSearch("");
    setAplicacao("");
    setQuantidade(1);

    setSuccessMsg(`Ordem de Serviço ${osId} registrada com sucesso! Estoque atualizado.`);
    alert(`Ordem de Serviço ${osId} salva com sucesso!\nO estoque do produto foi decrementado em ${quantidade} unidade(s).`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
          Ordem de Serviço (Saída de Estoque)
        </h2>
        <p className="text-sm text-gray-600">
          Abra uma nova requisição de retirada de materiais para manutenção ou aplicação em equipamentos, reduzindo o saldo em estoque em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel do Formulário */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-100 flex items-center space-x-2">
            <Wrench size={16} className="text-orange-500" />
            <span>Formulário de Abertura de OS</span>
          </h3>

          <form onSubmit={handleSubmitOs} className="space-y-4">
            
            {/* Mensagens de feedback */}
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
              
              {/* Solicitante */}
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
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              {/* Recebedor */}
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
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              {/* Equipamento */}
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
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              {/* Seleção do Produto com Busca Avançada */}
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Produto para Retirada
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquise por Nome, Fabricante ou Código Interno..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setIsOpen(true);
                      if (!e.target.value) {
                        setSelectedProductId("");
                      }
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => {
                      // Pequeno delay para permitir clique nas opções do dropdown
                      setTimeout(() => setIsOpen(false), 200);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    required
                  />
                  {selectedProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId("");
                        setProductSearch("");
                        setIsOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-black text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto divide-y divide-gray-100">
                    {filteredProductsForSelect.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 text-center">
                        Nenhum produto correspondente.
                      </div>
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
                            className={`w-full text-left px-4 py-2.5 hover:bg-orange-50/50 flex flex-col space-y-1 transition-colors ${
                              isDisabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                            } ${isExactMatch ? "bg-orange-50/80 border-l-4 border-l-orange-500" : ""}`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-xs text-gray-950">
                                {p.descricao} ({p.marca})
                              </span>
                              {isExactMatch && (
                                <span className="bg-orange-500 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none">
                                  Match Exato
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                              Fab: <span className="font-mono text-gray-700 font-bold">{p.codProduto}</span> • Int: <span className="font-mono text-gray-700 font-bold">#{p.codInterno}</span> • Estoque: <span className={`font-black ${p.quantidade < 3 ? "text-red-600" : "text-gray-900"}`}>{p.quantidade}</span> un
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Descrição do Problema */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Descrição do Problema / Diagnóstico
                </label>
                <textarea
                  rows="2"
                  placeholder="Descreva brevemente o problema mecânico ou necessidade"
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                ></textarea>
              </div>

              {/* Aplicação */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Aplicação / Finalidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Substituição de item desgastado"
                  value={aplicacao}
                  onChange={(e) => setAplicacao(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              {/* Quantidade a Retirar */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Quantidade Retirada
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

            </div>

            {/* Preenchimento Automático de Data e Hora */}
            <div className="bg-gray-50 border border-gray-150 p-3 rounded-lg flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1 font-medium">
                <Calendar size={13} className="text-gray-400" />
                <span>Data/Hora da OS(Automática):</span>
              </span>
              <span className="font-bold text-gray-700 font-mono">
                {new Date().toLocaleString()}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-orange-500 text-black font-black uppercase text-xs py-3.5 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
              >
                Registrar OS e Decrementar Estoque
              </button>
            </div>
          </form>
        </div>

        {/* Painel Informativo Lateral */}
        <div className="space-y-6">
          
          {/* Card do Produto Selecionado */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-950 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">
              Status do Item Selecionado
            </h3>

            {!selectedProduct ? (
              <div className="text-center py-6 text-xs text-gray-400">
                Selecione um produto no formulário para visualizar os detalhes de inventário aqui.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">CÓD. INTERNO</span>
                  <span className="font-mono font-bold text-orange-600">#{selectedProduct.codInterno}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">MARCA</span>
                  <span className="font-bold text-gray-800">{selectedProduct.marca}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">REFERÊNCIA</span>
                  <span className="font-mono text-gray-700">{selectedProduct.codProduto}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">LOCALIZAÇÃO</span>
                  <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[10px]">{selectedProduct.localizacao || "N/A"}</span>
                </div>
                
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold">ESTOQUE ATUAL</span>
                  <span className={`text-lg font-black ${selectedProduct.quantidade < 3 ? "text-red-600" : "text-gray-950"}`}>
                    {selectedProduct.quantidade} pçs
                  </span>
                </div>

                {selectedProduct.quantidade < 3 && (
                  <div className="bg-red-50 text-red-800 p-2.5 rounded border border-red-150 text-[10px] flex items-start space-x-1 leading-normal">
                    <span>⚠️</span>
                    <span>Atenção: A quantidade deste item está criticamente baixa. Recomenda-se abrir requisição de compras antes de retirar.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Últimos registros de OS */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-950 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">
              Ordens de Serviço Abertas ({osList.length})
            </h3>
            
            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-gray-100">
              {osList.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400">
                  Nenhuma ordem de serviço registrada.
                </div>
              ) : (
                osList.map((os, idx) => (
                  <div key={os.id || idx} className="pt-3 first:pt-0 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-orange-600 font-mono">{os.id}</span>
                        <button
                          type="button"
                          onClick={() => handlePrintOs(os)}
                          title="Reimprimir Termo"
                          className="text-gray-400 hover:text-orange-500 p-0.5 rounded transition-colors"
                        >
                          <Printer size={12} />
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400 font-normal">{new Date(os.dataHora).toLocaleDateString()}</span>
                    </div>
                    <p className="font-bold text-gray-800 leading-tight">{os.produtoDescricao}</p>
                    <p className="text-[10px] text-gray-500">Equipamento: {os.equipamento}</p>
                    <p className="text-[10px] text-gray-500">Retirante: {os.solicitante}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
