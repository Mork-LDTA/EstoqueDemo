import React, { useState } from "react";
import { 
  FileText, 
  FileCode, 
  Clock, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  CheckCircle2,
  Package,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  Printer
} from "lucide-react";

export default function Relatorios({ movements = [], products = [] }) {
  // Estado para controle de Toast/Mensagem de Exportação
  const [toastMessage, setToastMessage] = useState("");

  // Estados para Filtros Avançados
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedOperation, setSelectedOperation] = useState("all");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("recentes"); // "recentes", "quantidade_desc", "quantidade_asc", "alfabetica"

  // Famílias e marcas dinâmicas baseadas no estoque real
  const families = ["all", ...new Set(products.map(p => p.familia).filter(Boolean))].sort();
  const brands = ["all", ...new Set(products.map(p => p.marca).filter(Boolean))].sort();

  // Localizações dinâmicas agrupadas por prateleira (P1, P2) e células específicas
  const rawLocations = products.map(p => p.localizacao).filter(Boolean);
  const uniqueShelves = [...new Set(rawLocations.map(loc => loc.split("-")[0]))].sort();
  const uniqueCells = [...new Set(rawLocations)].sort();

  // Função para limpar todos os filtros aplicados
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedFamily("all");
    setSelectedBrand("all");
    setSelectedLocation("all");
    setSelectedOperation("all");
    setMinQty("");
    setMaxQty("");
    setStartDate("");
    setEndDate("");
    setSortBy("recentes");
  };

  // 1. Filtragem dinâmica das movimentações com base em todos os filtros
  const filteredMovements = movements.filter(mov => {
    const prod = products.find(p => p.codProduto === mov.codProduto);

    // Busca por Identificadores: Código Interno do Produto associado, Código do Fabricante ou Descrição do Item
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      String(mov.codProduto).toLowerCase().includes(query) ||
      String(mov.produtoDescricao).toLowerCase().includes(query) ||
      String(mov.descricao).toLowerCase().includes(query) ||
      (prod && String(prod.codInterno).toLowerCase().includes(query));

    // Filtros de Categoria (herdados do produto associado)
    const matchesFamily = selectedFamily === "all" || (prod && prod.familia === selectedFamily);
    const matchesBrand = selectedBrand === "all" || (prod && prod.marca === selectedBrand);
    
    let matchesLocation = true;
    if (selectedLocation === "unallocated") {
      matchesLocation = !prod || !prod.localizacao || prod.localizacao.trim() === "";
    } else if (selectedLocation !== "all") {
      if (prod && prod.localizacao) {
        const shelf = prod.localizacao.split("-")[0];
        matchesLocation = prod.localizacao === selectedLocation || shelf === selectedLocation;
      } else {
        matchesLocation = false;
      }
    }

    // Filtro por Operação
    const matchesOperation = selectedOperation === "all" || mov.tipo === selectedOperation;

    // Filtro por Volume/Lote (Quantidade movimentada)
    const matchesMinQty = minQty === "" || mov.quantidade >= Number(minQty);
    const matchesMaxQty = maxQty === "" || mov.quantidade <= Number(maxQty);

    // Filtros de Data (Período de movimentação)
    let matchesDate = true;
    if (startDate) {
      const start = new Date(startDate);
      const movDate = new Date(mov.dataHora);
      matchesDate = matchesDate && movDate >= start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Ajuste para o fim do dia
      const movDate = new Date(mov.dataHora);
      matchesDate = matchesDate && movDate <= end;
    }

    return matchesSearch && matchesFamily && matchesBrand && matchesLocation && matchesOperation && matchesMinQty && matchesMaxQty && matchesDate;
  });

  // 2. Filtragem dinâmica dos produtos em tempo real
  const baseFilteredProducts = products.filter(p => {
    // Busca por Identificadores: Código Interno, Código do Fabricante ou Descrição do Item
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      String(p.codInterno).toLowerCase().includes(query) ||
      String(p.codProduto).toLowerCase().includes(query) ||
      String(p.descricao).toLowerCase().includes(query);

    // Filtros de Categoria
    const matchesFamily = selectedFamily === "all" || p.familia === selectedFamily;
    const matchesBrand = selectedBrand === "all" || p.marca === selectedBrand;
    
    let matchesLocation = true;
    if (selectedLocation === "unallocated") {
      matchesLocation = !p.localizacao || p.localizacao.trim() === "";
    } else if (selectedLocation !== "all") {
      if (p.localizacao) {
        const shelf = p.localizacao.split("-")[0];
        matchesLocation = p.localizacao === selectedLocation || shelf === selectedLocation;
      } else {
        matchesLocation = false;
      }
    }

    // Filtro por Volume (Quantidade em estoque)
    const matchesMinQty = minQty === "" || p.quantidade >= Number(minQty);
    const matchesMaxQty = maxQty === "" || p.quantidade <= Number(maxQty);

    return matchesSearch && matchesFamily && matchesBrand && matchesLocation && matchesMinQty && matchesMaxQty;
  });

  // Lógica de Consistência de Dados: Se filtros de Operação ou Datas estiverem ativos,
  // mostramos na lista de produtos apenas aqueles que sofreram movimentações que atendem a esses critérios.
  const hasActiveOperation = selectedOperation !== "all";
  const hasActiveDateRange = startDate || endDate;

  const finalFilteredProducts = baseFilteredProducts.filter(p => {
    if (hasActiveOperation || hasActiveDateRange) {
      return filteredMovements.some(mov => mov.codProduto === p.codProduto);
    }
    return true;
  });

  // Função auxiliar para obter a data da última movimentação de um produto
  const getLatestMovementTime = (p) => {
    const prodMovs = movements.filter(m => m.codProduto === p.codProduto);
    if (prodMovs.length === 0) return 0;
    return Math.max(...prodMovs.map(m => new Date(m.dataHora).getTime()));
  };

  // 3. Ordenação Dinâmica em Tempo Real
  const sortedProducts = [...finalFilteredProducts].sort((a, b) => {
    if (sortBy === "quantidade_desc") {
      return b.quantidade - a.quantidade;
    }
    if (sortBy === "quantidade_asc") {
      return a.quantidade - b.quantidade;
    }
    if (sortBy === "alfabetica") {
      return a.descricao.localeCompare(b.descricao);
    }
    if (sortBy === "recentes") {
      const timeA = getLatestMovementTime(a);
      const timeB = getLatestMovementTime(b);
      return timeB - timeA;
    }
    return 0;
  });

  const sortedMovements = [...filteredMovements].sort((a, b) => {
    if (sortBy === "recentes") {
      return new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime();
    }
    if (sortBy === "quantidade_desc") {
      return b.quantidade - a.quantidade;
    }
    if (sortBy === "quantidade_asc") {
      return a.quantidade - b.quantidade;
    }
    if (sortBy === "alfabetica") {
      return a.produtoDescricao.localeCompare(b.produtoDescricao);
    }
    return 0;
  });

  // Função para gerar o Relatório Gerencial em HTML via Blob para Impressão
  const handlePrint = () => {
    const totalItens = sortedProducts.length;
    const totalGiro = sortedMovements.reduce((sum, m) => sum + m.quantidade, 0);
    const saldoFisico = sortedProducts.reduce((sum, p) => sum + p.quantidade, 0);

    const dataHoraAtual = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    // Construção da descrição detalhada do escopo dos filtros aplicados
    const filterDesc = [];
    if (searchQuery.trim()) filterDesc.push(`Busca: "${searchQuery.trim()}"`);
    if (selectedFamily !== "all") filterDesc.push(`Família: ${selectedFamily}`);
    if (selectedBrand !== "all") filterDesc.push(`Marca: ${selectedBrand}`);
    if (selectedLocation !== "all") {
      const locText = selectedLocation === "unallocated" ? "Não Alocado" : selectedLocation;
      filterDesc.push(`Localização: ${locText}`);
    }
    if (selectedOperation !== "all") filterDesc.push(`Operação: ${selectedOperation}`);
    if (minQty) filterDesc.push(`Qtd Mín: ${minQty}`);
    if (maxQty) filterDesc.push(`Qtd Máx: ${maxQty}`);
    if (startDate) filterDesc.push(`De: ${new Date(startDate).toLocaleDateString("pt-BR")}`);
    if (endDate) filterDesc.push(`Até: ${new Date(endDate).toLocaleDateString("pt-BR")}`);
    
    const filtersAppliedString = filterDesc.length > 0 ? filterDesc.join(" | ") : "Todos os registros (Sem Filtros)";

    // Linhas da tabela de produtos filtrados
    const productRows = sortedProducts.map(p => `
      <tr>
        <td style="border: 1px solid #000000; padding: 8px; font-family: monospace; font-size: 11px; text-align: center;">#${p.codInterno}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 11px; font-weight: bold;">${p.descricao}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 11px;">${p.marca}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-family: monospace; font-size: 11px;">${p.codProduto}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 11px;">${p.familia}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 11px; text-align: center;">${p.localizacao || "Não Alocado"}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 11px; font-weight: bold; text-align: center;">${p.quantidade}</td>
      </tr>
    `).join("");

    // Linhas da tabela de histórico de movimentações filtradas
    const movementRows = sortedMovements.map(m => `
      <tr>
        <td style="border: 1px solid #000000; padding: 8px; font-family: monospace; font-size: 10px;">${new Date(m.dataHora).toLocaleString("pt-BR")}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 10px; font-weight: bold;">${m.tipo}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 10px;">${m.produtoDescricao}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-family: monospace; font-size: 10px;">${m.codProduto}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 10px; font-weight: bold; text-align: center;">${m.quantidade}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 10px;">${m.usuario}</td>
        <td style="border: 1px solid #000000; padding: 8px; font-size: 10px; color: #333333;">${m.descricao}</td>
      </tr>
    `).join("");

    // Conteúdo HTML estruturado e otimizado para impressão
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Auditoria de Inventário</title>
        <style>
          @page {
            margin: 0mm;
          }
          body {
            font-family: 'Arial', 'Inter', sans-serif;
            padding: 40px;
            margin: 0;
            background-color: #ffffff;
            color: #000000;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            border-bottom: 2px solid #000000;
            padding-bottom: 12px;
            margin-bottom: 25px;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .logo {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.02em;
          }
          .doc-info {
            text-align: right;
            font-size: 11px;
            color: #111111;
          }
          .doc-title {
            font-size: 15px;
            font-weight: 800;
            margin-top: 10px;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .filter-scope {
            font-size: 10px;
            color: #222222;
            background-color: #f7f7f7;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #000000;
            margin-top: 8px;
            font-style: italic;
          }
          
          .cards-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 25px;
          }
          .card {
            border: 1px solid #000000;
            padding: 12px 15px;
            border-radius: 4px;
            background-color: #ffffff;
          }
          .card-title {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            color: #333333;
            margin-bottom: 4px;
          }
          .card-value {
            font-size: 20px;
            font-weight: 900;
          }

          .section-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 25px;
            margin-bottom: 10px;
            border-left: 3px solid #000000;
            padding-left: 8px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th {
            border: 1px solid #000000;
            background-color: #f2f2f2;
            color: #000000;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 8px;
            text-align: left;
          }
          tr {
            page-break-inside: avoid;
          }

          .footer-signature {
            margin-top: 50px;
            page-break-inside: avoid;
          }
          .signature-line-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 35px;
          }
          .signature-box {
            width: 320px;
            text-align: center;
          }
          .line {
            border-top: 1px solid #000000;
            margin-bottom: 6px;
          }
          .role {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .system-info {
            font-size: 9px;
            color: #555555;
            text-align: center;
            margin-top: 60px;
            border-top: 1px dashed #000000;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-top">
            <div>
              <div class="logo">FX MINAS CONSTRUTORA LTDA</div>
              <div class="doc-title">RELATÓRIO GERENCIAL DE AUDITORIA DE INVENTÁRIO</div>
            </div>
            <div class="doc-info">
              <div><strong>Data/Hora de Emissão:</strong> ${dataHoraAtual}</div>
              <div><strong>Almoxarifado Geral</strong></div>
            </div>
          </div>
          <div class="filter-scope">
            <strong>Escopo dos Filtros Aplicados:</strong> ${filtersAppliedString}
          </div>
        </div>

        <div class="cards-container">
          <div class="card">
            <div class="card-title">Total de Itens Mapeados</div>
            <div class="card-value">${totalItens}</div>
          </div>
          <div class="card">
            <div class="card-title">Volume Total de Peças em Giro</div>
            <div class="card-value">${totalGiro}</div>
          </div>
          <div class="card">
            <div class="card-title">Saldo Físico Atualizado</div>
            <div class="card-value">${saldoFisico}</div>
          </div>
        </div>

        <div class="section-title">Tabela Consolidada (Posição Geral do Inventário)</div>
        ${totalItens === 0 ? `
          <p style="font-size: 11px; font-style: italic; padding: 15px; border: 1px solid #000000; text-align: center;">Nenhum produto correspondente aos filtros de auditoria na posição atual do estoque.</p>
        ` : `
          <table>
            <thead>
              <tr>
                <th style="width: 12%; text-align: center;">Cód. Interno</th>
                <th style="width: 30%;">Descrição do Item</th>
                <th style="width: 13%;">Marca</th>
                <th style="width: 17%;">Cód. Fabricante</th>
                <th style="width: 13%;">Família / Grupo</th>
                <th style="width: 15%; text-align: center;">Localização</th>
                <th style="width: 10%; text-align: center;">Qtd</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>
        `}

        <div class="section-title">Registro Cronológico de Movimentações Mapeadas</div>
        ${sortedMovements.length === 0 ? `
          <p style="font-size: 11px; font-style: italic; padding: 15px; border: 1px solid #000000; text-align: center;">Nenhum evento de movimentação registrado para os parâmetros selecionados.</p>
        ` : `
          <table>
            <thead>
              <tr>
                <th style="width: 16%;">Data / Hora</th>
                <th style="width: 12%;">Operação</th>
                <th style="width: 22%;">Produto</th>
                <th style="width: 14%;">Cód. Fabricante</th>
                <th style="width: 8%; text-align: center;">Qtd</th>
                <th style="width: 13%;">Operador</th>
                <th style="width: 15%;">Histórico / Observação</th>
              </tr>
            </thead>
            <tbody>
              ${movementRows}
            </tbody>
          </table>
        `}

        <div class="footer-signature">
          <div class="signature-line-container">
            <div class="signature-box">
              <div class="line"></div>
              <div class="role">Gestor de Logística / Almoxarife Responsável</div>
              <div style="font-size: 9px; color: #444444; margin-top: 2px;">Assinatura por Extenso</div>
            </div>
          </div>
        </div>

        <div class="system-info">
          Relatório Oficial de Auditoria. Processado com segurança de dados locais via Blob funcional.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.focus();
    } else {
      alert("O bloqueador de pop-ups impediu a visualização do relatório de auditoria. Por favor, libere pop-ups para este sistema.");
    }
  };

  // Função para exportação de dados em XML baseada no estoque filtrado
  const handleExportXML = () => {
    if (!sortedProducts || sortedProducts.length === 0) {
      alert("Nenhum produto correspondente aos filtros para exportar.");
      return;
    }

    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<relatorio_estoque>\n';
    xmlContent += `  <data_geracao>${new Date().toLocaleString('pt-BR')}</data_geracao>\n`;
    xmlContent += '  <produtos>\n';

    sortedProducts.forEach(p => {
      xmlContent += '    <produto>\n';
      xmlContent += `      <descricao>${p.descricao}</descricao>\n`;
      xmlContent += `      <marca>${p.marca}</marca>\n`;
      xmlContent += `      <codigo_produto>${p.codProduto}</codigo_produto>\n`;
      xmlContent += `      <codigo_interno>${p.codInterno}</codigo_interno>\n`;
      xmlContent += `      <familia_grupo>${p.familia}</familia_grupo>\n`;
      xmlContent += `      <localizacao>${p.localizacao || 'Não alocado'}</localizacao>\n`;
      xmlContent += `      <quantidade>${p.quantidade}</quantidade>\n`;
      xmlContent += '    </produto>\n';
    });

    xmlContent += '  </produtos>\n</relatorio_estoque>';

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_estoque_${Date.now()}.xml`;
    link.click();
    URL.revokeObjectURL(url);

    setToastMessage("Relatório XML gerado e baixado com sucesso!");
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
            Módulo de Auditoria Avançado
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Realize auditoria detalhada de inventário em tempo real, aplique filtros avançados e gere relatórios gerenciais profissionais.
          </p>
        </div>
        
        {/* Ações de Impressão e XML */}
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-gray-950 hover:bg-orange-600 text-white font-bold uppercase text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <Printer size={15} />
            <span>Imprimir Relatório</span>
          </button>
          
          <button
            onClick={handleExportXML}
            className="flex items-center space-x-2 bg-orange-500 text-black font-black uppercase text-xs px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm cursor-pointer"
          >
            <FileCode size={15} className="stroke-[2.5]" />
            <span>Baixar XML</span>
          </button>
        </div>
      </div>

      {/* Toast Informativo de Sucesso */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-3 shadow-md animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-bold text-sm">{toastMessage}</p>
            <p className="text-xs text-emerald-700">Fluxo concluído com sucesso. O arquivo XML foi compilado e transferido para a sua máquina.</p>
          </div>
        </div>
      )}

      {/* NOVO PAINEL DE FILTROS AVANÇADOS */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-800">
            <SlidersHorizontal size={16} className="text-orange-500" />
            <span className="font-extrabold text-xs uppercase tracking-wider">Painel de Parâmetros de Auditoria</span>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-tight flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw size={12} className="stroke-[2.5]" />
            <span>Limpar Filtros</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Bloco 1: Busca e Ordenação */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider flex items-center space-x-1">
                <Search size={11} className="text-gray-400" />
                <span>Busca por Identificadores</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Código Interno, Código do Fabricante ou Descrição do Item..."
                  className="w-full bg-white border border-gray-200 text-gray-950 px-3 py-2 pl-9 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-gray-400"
                />
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider flex items-center space-x-1">
                <ArrowUpDown size={11} className="text-gray-400" />
                <span>Ordenação Dinâmica</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="recentes">Mais Recentes</option>
                <option value="quantidade_desc">Maior Quantidade</option>
                <option value="quantidade_asc">Menor Quantidade</option>
                <option value="alfabetica">Ordem Alfabética (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Bloco 2: Filtros de Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Família / Grupo</label>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="bg-white border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">Todas as Famílias</option>
                {families.filter(f => f !== "all").map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Marca</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-white border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">Todas as Marcas</option>
                {brands.filter(b => b !== "all").map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Localização / Prateleira</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-white border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">Todas as Localizações</option>
                <option value="unallocated">Sem Localização (Não Alocado)</option>
                {uniqueShelves.length > 0 && (
                  <optgroup label="Prateleiras (Geral)">
                    {uniqueShelves.map(shelf => (
                      <option key={shelf} value={shelf}>Prateleira {shelf}</option>
                    ))}
                  </optgroup>
                )}
                {uniqueCells.length > 0 && (
                  <optgroup label="Células Específicas">
                    {uniqueCells.map(cell => (
                      <option key={cell} value={cell}>{cell}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Bloco 3: Operações, Volumes e Períodos */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
            {/* Operação */}
            <div className="flex flex-col md:col-span-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Tipo de Operação</label>
              <select
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
                className="bg-white border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">Todas as Operações</option>
                <option value="Entrada NF">Entrada NF</option>
                <option value="Cadastro Manual">Cadastro Manual</option>
                <option value="Saída OS">Saída OS</option>
              </select>
            </div>

            {/* Volume / Estoque */}
            <div className="flex flex-col md:col-span-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Volume (Quantidade Mín/Máx)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                  placeholder="Mínimo"
                  className="w-full bg-white border border-gray-200 text-gray-950 px-2.5 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-400"
                />
                <input
                  type="number"
                  value={maxQty}
                  onChange={(e) => setMaxQty(e.target.value)}
                  placeholder="Máximo"
                  className="w-full bg-white border border-gray-200 text-gray-950 px-2.5 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Intervalo de Datas */}
            <div className="flex flex-col md:col-span-6">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider flex items-center space-x-1">
                <Calendar size={11} className="text-gray-400" />
                <span>Intervalo de Datas (Movimentações)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DE INDICADORES DE AUDITORIA NA TELA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Package size={80} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total de Itens Mapeados</span>
          <p className="text-3xl font-black mt-2 tracking-tight text-white">{sortedProducts.length}</p>
          <span className="text-[10px] text-gray-500 mt-1 block">Variedade de códigos de produtos filtrados</span>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 border border-orange-500/20 rounded-xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <RefreshCw size={80} />
          </div>
          <span className="text-[10px] font-bold text-orange-100 uppercase tracking-wider">Volume Total de Peças em Giro</span>
          <p className="text-3xl font-black mt-2 tracking-tight text-white">
            {sortedMovements.reduce((sum, m) => sum + m.quantidade, 0)}
          </p>
          <span className="text-[10px] text-orange-200/70 mt-1 block">Peças que transitaram pelo estoque (filtrado)</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <SlidersHorizontal size={80} />
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Saldo Físico Atualizado</span>
          <p className="text-3xl font-black mt-2 tracking-tight text-orange-600">
            {sortedProducts.reduce((sum, p) => sum + p.quantidade, 0)}
          </p>
          <span className="text-[10px] text-gray-400 mt-1 block">Saldo de peças armazenadas em estoque (filtrado)</span>
        </div>
      </div>

      {/* LISTAGEM DO INVENTÁRIO ATUAL (ESTOQUE NA TELA) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider flex items-center space-x-2">
            <Package size={16} className="text-orange-500" />
            <span>Posição Geral do Inventário ({sortedProducts.length} de {products.length} itens)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic text-sm">
              Nenhum produto correspondente aos filtros selecionados.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold text-xs uppercase bg-gray-50/50">
                  <th className="py-3.5 px-6">Cód. Interno</th>
                  <th className="py-3.5 px-6">Descrição</th>
                  <th className="py-3.5 px-6">Marca</th>
                  <th className="py-3.5 px-6">Cód. Fabricante</th>
                  <th className="py-3.5 px-6">Família</th>
                  <th className="py-3.5 px-6 text-center">Localização</th>
                  <th className="py-3.5 px-6 text-center">Qtd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {sortedProducts.map((item) => (
                  <tr key={item.id || item.codInterno} className="hover:bg-gray-50/80 transition-colors font-medium">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-orange-600">
                      #{item.codInterno}
                    </td>
                    <td className="py-4 px-6 text-gray-950 font-bold">
                      {item.descricao}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {item.marca}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      {item.codProduto}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 uppercase">
                        {item.familia}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {item.localizacao && item.localizacao.trim() !== "" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border bg-orange-50 border-orange-200 text-orange-700 font-mono">
                          📍 {item.localizacao}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border bg-gray-50 border-gray-200 text-gray-400 uppercase tracking-wider">
                          Não Alocado
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-black text-gray-950 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
                        {item.quantidade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Histórico/Log de Movimentações */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider flex items-center space-x-2">
            <Clock size={16} className="text-orange-500" />
            <span>Registro Cronológico de Movimentações Mapeadas ({sortedMovements.length} eventos)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {sortedMovements.length === 0 ? (
            <div className="text-center py-20 text-gray-500 italic text-sm">
              Nenhuma movimentação registrada no histórico para os filtros ativos.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold text-xs uppercase bg-gray-50/50">
                  <th className="py-3.5 px-6">Data / Hora</th>
                  <th className="py-3.5 px-6">Operação</th>
                  <th className="py-3.5 px-6">Produto</th>
                  <th className="py-3.5 px-6">Referência</th>
                  <th className="py-3.5 px-6 text-center">Quantidade</th>
                  <th className="py-3.5 px-6">Operador</th>
                  <th className="py-3.5 px-6">Histórico / Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {sortedMovements.map((mov) => {
                  const isEntry = mov.tipo === "Entrada NF";
                  const isExit = mov.tipo === "Saída OS";
                  const isManual = mov.tipo === "Cadastro Manual";

                  let typeBadge = "";
                  let icon = null;
                  if (isEntry) {
                    typeBadge = "bg-emerald-50 border-emerald-200 text-emerald-700";
                    icon = <ArrowDownLeft size={12} className="text-emerald-600" />;
                  } else if (isExit) {
                    typeBadge = "bg-amber-50 border-amber-200 text-amber-700";
                    icon = <ArrowUpRight size={12} className="text-amber-600" />;
                  } else if (isManual) {
                    typeBadge = "bg-purple-50 border-purple-200 text-purple-700";
                    icon = <RefreshCw size={12} className="text-purple-600" />;
                  } else {
                    typeBadge = "bg-blue-50 border-blue-200 text-blue-700";
                    icon = <Clock size={12} className="text-blue-600" />;
                  }

                  return (
                    <tr key={mov.id} className="hover:bg-gray-50/80 transition-colors font-medium">
                      <td className="py-4 px-6 font-mono text-xs text-gray-500">
                        {new Date(mov.dataHora).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${typeBadge}`}>
                          {icon}
                          <span>{mov.tipo}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-950 font-bold">
                        {mov.produtoDescricao}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-600">
                        {mov.codProduto}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-extrabold text-gray-950">
                          {mov.quantidade}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 text-xs">
                        <span className="flex items-center space-x-1 font-semibold">
                          <User size={12} className="text-gray-400" />
                          <span>{mov.usuario}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs max-w-xs truncate">
                        {mov.descricao}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}