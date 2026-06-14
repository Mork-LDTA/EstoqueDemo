import React, { useState } from "react";
import { 
  FileText, 
  FileCode, 
  Download, 
  Clock, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  CheckCircle2
} from "lucide-react";

export default function Relatorios({ movements, products = [] }) {
  // Estado para controle de Toast/Mensagem de Exportação
  const [toastMessage, setToastMessage] = useState("");

  // Função para simular a exportação
  const handleExport = (format) => {
    setToastMessage(`Relatório ${format} gerado e exportado com sucesso!`);
    
    // Auto fechar toast em 3 segundos
    setTimeout(() => {
      setToastMessage("");
    }, 4000);

    // Alerta em tela solicitado nas especificações
    alert(`Relatório gerado com sucesso em formato ${format}!`);
  };

  // Exportação Analítica para PDF (Layout Corporativo & SaaS Industrial)
  const exportarParaPDF = () => {
    const totalItens = products.length;
    const alocados = products.filter(p => p.localizacao && p.localizacao.trim() !== "").length;
    const pendentes = products.filter(p => !p.localizacao || p.localizacao.trim() === "").length;
    
    const dataHoraAtual = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    
    const anoAtual = new Date().getFullYear();

    const rowsHtml = products.length > 0 
      ? products.map(item => `
          <tr>
            <td><span class="font-bold cod-interno">#${item.codInterno}</span></td>
            <td><span class="font-bold">${item.descricao}</span></td>
            <td>${item.marca}</td>
            <td>${item.codProduto}</td>
            <td>${item.familia}</td>
            <td>
              ${item.localizacao && item.localizacao.trim() !== ""
                ? `<span class="badge badge-allocated">${item.localizacao}</span>`
                : `<span class="badge badge-pending">Não Alocado</span>`
              }
            </td>
          </tr>
        `).join("")
      : `<tr><td colspan="6" class="no-data">Nenhum produto cadastrado no inventário.</td></tr>`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Relatório Analítico de Inventário</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      padding: 40px;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header-left h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: -0.025em;
      margin-bottom: 4px;
    }
    
    .header-left p {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }
    
    .header-right {
      text-align: right;
    }
    
    .brand-mork {
      font-size: 24px;
      font-weight: 800;
      color: #ea580c;
      letter-spacing: 0.05em;
      line-height: 1;
    }
    
    .brand-sub {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      color: #94a3b8;
      margin-top: 4px;
      letter-spacing: 0.08em;
    }
    
    /* KPI Cards Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    
    .kpi-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }
    
    .kpi-label {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    
    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    
    .kpi-value.allocated {
      color: #ea580c;
    }
    
    /* Table Styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    
    th {
      background-color: #0f172a;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 12px 14px;
      text-align: left;
    }
    
    td {
      padding: 12px 14px;
      font-size: 11px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
    }
    
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    
    .font-bold {
      font-weight: 600;
    }
    
    .cod-interno {
      font-family: monospace;
      font-size: 11px;
      color: #0f172a;
    }
    
    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 3px 8px;
      font-size: 9px;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .badge-allocated {
      background-color: #ffedd5;
      color: #ea580c;
      border: 1px solid #fed7aa;
    }
    
    .badge-pending {
      background-color: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }
    
    .no-data {
      text-align: center;
      color: #94a3b8;
      padding: 30px;
      font-style: italic;
    }
    
    /* Footer */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      font-weight: 500;
    }
    
    @media print {
      body {
        padding: 20px 0;
      }
      .kpi-card {
        background-color: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
      }
      th {
        background-color: #0f172a !important;
        color: #ffffff !important;
      }
      .badge-allocated {
        background-color: #ffedd5 !important;
        color: #ea580c !important;
        border: 1px solid #fed7aa !important;
      }
      .badge-pending {
        background-color: #f1f5f9 !important;
        color: #64748b !important;
        border: 1px solid #e2e8f0 !important;
      }
      tr:nth-child(even) td {
        background-color: #f8fafc !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-container">
    <div class="header-left">
      <h1>Relatório Analítico de Inventário</h1>
      <p>Gerado em: ${dataHoraAtual}</p>
    </div>
    <div class="header-right">
      <div class="brand-mork">MORK</div>
      <div class="brand-sub">Development & Tech</div>
    </div>
  </div>
  
  <div class="kpi-grid">
    <div class="kpi-card">
      <span class="kpi-label">Total de Itens Salvos</span>
      <span class="kpi-value">${totalItens}</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Itens Alocados</span>
      <span class="kpi-value allocated">${alocados}</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">Pendentes de Alocação</span>
      <span class="kpi-value">${pendentes}</span>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Cód. Interno</th>
        <th>Descrição</th>
        <th>Marca</th>
        <th>Cód. Fabricante</th>
        <th>Grupo / Família</th>
        <th>Localização</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  
  <div class="footer">
    Mork Development & Technology LTDA © ${anoAtual} — Todos os direitos reservados.
  </div>

  <script>
    window.onload = function() {
      // Pequeno delay para garantir que recursos e fontes estão processados
      setTimeout(function() {
        window.print();
        window.close();
      }, 300);
    };
  </script>
</body>
</html>
`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
            Relatórios e Logs de Movimentação
          </h2>
          <p className="text-sm text-gray-600">
            Acompanhe o histórico de todas as transações, remanejamentos e retiradas realizadas no sistema.
          </p>
        </div>
        
        {/* Ações de Exportação */}
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={exportarParaPDF}
            className="flex items-center space-x-2 bg-red-600 text-white font-bold uppercase text-xs px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <FileText size={15} />
            <span>Exportar PDF</span>
          </button>
          
          <button
            onClick={() => handleExport("XML")}
            className="flex items-center space-x-2 bg-orange-500 text-black font-black uppercase text-xs px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            <FileCode size={15} className="stroke-[2.5]" />
            <span>Exportar XML</span>
          </button>
        </div>
      </div>

      {/* Toast Informativo */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-3 shadow-md animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-bold text-sm">{toastMessage}</p>
            <p className="text-xs text-emerald-700">Simulação comercial ativa. O download do arquivo correspondente foi registrado no terminal logístico.</p>
          </div>
        </div>
      )}

      {/* Histórico/Log de Movimentações */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider flex items-center space-x-2">
            <Clock size={16} className="text-orange-500" />
            <span>Registro Cronológico de Movimentações ({movements.length} eventos)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {movements.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Nenhuma movimentação registrada no histórico.
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
                {movements
                  .map((mov) => {
                    const isEntry = mov.tipo === "Entrada NF";
                    const isTransfer = mov.tipo === "Remanejamento";
                    const isExit = mov.tipo === "Saída OS";

                    let typeBadge = "";
                    let icon = null;
                    if (isEntry) {
                      typeBadge = "bg-emerald-50 border-emerald-200 text-emerald-700";
                      icon = <ArrowDownLeft size={12} className="text-emerald-600" />;
                    } else if (isExit) {
                      typeBadge = "bg-amber-50 border-amber-200 text-amber-700";
                      icon = <ArrowUpRight size={12} className="text-amber-600" />;
                    } else {
                      typeBadge = "bg-purple-50 border-purple-200 text-purple-700";
                      icon = <RefreshCw size={12} className="text-purple-600" />;
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
