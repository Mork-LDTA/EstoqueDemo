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

  // Função para simular a exportação do XML
  const handleExportXML = () => {
    if (!products || products.length === 0) {
      alert("Nenhum produto em estoque para exportar.");
      return;
    }

    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<relatorio_estoque>\n';
    xmlContent += `  <data_geracao>${new Date().toLocaleString('pt-BR')}</data_geracao>\n`;
    xmlContent += '  <produtos>\n';

    products.forEach(p => {
      xmlContent += '    <produto>\n';
      xmlContent += `      <descricao>${p.descricao}</descricao>\n`;
      xmlContent += `      <marca>${p.marca}</marca>\n`;
      xmlContent += `      <codigo_produto>${p.codProduto}</codigo_produto>\n`;
      xmlContent += `      <codigo_interno>${p.codInterno}</codigo_interno>\n`;
      xmlContent += `      <familia_grupo>${p.familia}</familia_grupo>\n`;
      xmlContent += `      <localizacao>${p.localizacao || 'Não alocado'}</localizacao>\n`;
      xmlContent += '    </produto>\n';
    });

    xmlContent += '  </produtos>\n</relatorio_estoque>';

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_estoque_${Date.now()}.xml`;
    link.click();
    URL.revokeObjectURL(url);

    setToastMessage("Relatório XML gerado e baixado com sucesso!");
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Exportação Analítica e Download Direto do PDF (Usa html2pdf via CDN)
  const exportarParaPDF = () => {
    if (!products || products.length === 0) {
      alert("Nenhum produto em estoque para exportar.");
      return;
    }

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

    // Monta as linhas da tabela em formato de string HTML pura com estilos inline para o PDF
    const rowsHtml = products.map(item => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; font-weight: 600; color: #0f172a;">#${item.codInterno}</td>
          <td style="padding: 10px 12px; font-size: 11px; font-weight: 600; color: #0f172a;">${item.descricao}</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #334155;">${item.marca}</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #334155;">${item.codProduto}</td>
          <td style="padding: 10px 12px; font-size: 11px; color: #334155;">${item.familia}</td>
          <td style="padding: 10px 12px; font-size: 11px;">
            ${item.localizacao && item.localizacao.trim() !== ""
              ? `<span style="background-color: #ffedd5; color: #ea580c; border: 1px solid #fed7aa; padding: 2px 6px; font-size: 9px; font-weight: 700; border-radius: 4px; text-transform: uppercase;">${item.localizacao}</span>`
              : `<span style="background-color: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 2px 6px; font-size: 9px; font-weight: 700; border-radius: 4px; text-transform: uppercase;">Não Alocado</span>`
            }
          </td>
        </tr>
      `).join("");

    // Cria um elemento HTML temporário fora da tela apenas para renderizar o PDF estruturado
    const elementoRelatorio = document.createElement("div");
    elementoRelatorio.style.padding = "24px";
    elementoRelatorio.style.fontFamily = "'Inter', sans-serif";
    elementoRelatorio.style.backgroundColor = "#ffffff";

    elementoRelatorio.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <h1 style="font-size: 18px; font-weight: 700; color: #0f172a; text-transform: uppercase; margin: 0 0 4px 0;">Relatório Analítico de Inventário</h1>
          <p style="font-size: 11px; color: #64748b; font-weight: 500; margin: 0;">Gerado em: ${dataHoraAtual}</p>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #ea580c; line-height: 1;">FX</div>
          <div style="font-size: 9px; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-top: 2px; letter-spacing: 0.08em;">Minas Construtora</div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; flex-direction: column;">
          <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Total de Itens Salvos</span>
          <span style="font-size: 20px; font-weight: 800; color: #0f172a;">${totalItens}</span>
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; flex-direction: column;">
          <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Itens Alocados</span>
          <span style="font-size: 20px; font-weight: 800; color: #ea580c;">${alocados}</span>
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; flex-direction: column;">
          <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Pendentes de Alocação</span>
          <span style="font-size: 20px; font-weight: 800; color: #0f172a;">${pendentes}</span>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #0f172a;">
            <th style="color: #ffffff; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 10px 12px; text-align: left;">Cód. Interno</th>
            <th style="color: #ffffff; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 10px 12px; text-align: left;">Descrição</th>
            <th style="color: #ffffff; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 10px 12px; text-align: left;">Marca</th>
            <th style="color: #ffffff; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 10px 12px; text-align: left;">Cód. Fabricante</th>
            <th style="color: #ffffff; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 10px 12px; text-align: left;">Grupo / Família</th>
            <th style="color: #ffffff; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 10px 12px; text-align: left;">Localização</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px; text-align: center; font-size: 9px; color: #94a3b8; font-weight: 500;">
        Mork Development & Technology LTDA © ${anoAtual} — Todos os direitos reservados.
      </div>
    `;

    // Função interna que executa a geração do PDF real e o download automático
    const executarDownloadPDF = () => {
      const opcoesConfig = {
        margin: 10,
        filename: `relatorio_inventario_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().from(elementoRelatorio).set(opcoesConfig).save().then(() => {
        setToastMessage("Relatório PDF baixado automaticamente!");
        setTimeout(() => setToastMessage(""), 4000);
      });
    };

    // Verifica se a biblioteca injetada já existe na Window, senão carrega via script inline na hora
    if (!window.html2pdf) {
      const scriptCDN = document.createElement("script");
      scriptCDN.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      scriptCDN.onload = executarDownloadPDF;
      document.head.appendChild(scriptCDN);
    } else {
      executarDownloadPDF;
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
            <span>Baixar PDF</span>
          </button>
          
          <button
            onClick={handleExportXML}
            className="flex items-center space-x-2 bg-orange-500 text-black font-black uppercase text-xs px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
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
            <p className="text-xs text-emerald-700">Fluxo concluído com sucesso. O arquivo foi processado localmente pelo motor de visualização.</p>
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
                {movements.map((mov) => {
                  const isEntry = mov.tipo === "Entrada NF";
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