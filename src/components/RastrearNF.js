import React, { useState, useMemo } from "react";
import {
  Search,
  FileText,
  MapPin,
  AlertCircle,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  Hash,
  X
} from "lucide-react";

export default function RastrearNF({ movements = [], products = [] }) {
  const [chaveBusca, setChaveBusca] = useState("");
  const [chavePesquisada, setChavePesquisada] = useState("");
  const [erroValidacao, setErroValidacao] = useState("");

  // Formatar a chave para exibição em blocos de 4 dígitos (padrão NF-e)
  const formatarChave = (chave) => {
    if (!chave || chave.length !== 44) return chave;
    return chave.replace(/(.{4})/g, "$1 ").trim();
  };

  // Extrair chaves únicas das movimentações de Entrada NF para exibição como atalhos
  const chavesDisponiveis = useMemo(() => {
    const chaves = new Set();
    movements.forEach((m) => {
      if (m.tipo === "Entrada NF") {
        if (m.chaveNf) {
          chaves.add(m.chaveNf);
        } else {
          // Fallback para extrair da descrição caso não tenha o campo chaveNf
          const match = m.descricao && m.descricao.match(/\d{44}/);
          if (match) {
            chaves.add(match[0]);
          }
        }
      }
    });
    return Array.from(chaves);
  }, [movements]);

  // Realizar a validação e pesquisa
  const handleBuscar = (e) => {
    if (e) e.preventDefault();
    setErroValidacao("");

    const chaveLimpa = chaveBusca.trim();

    if (!chaveLimpa) {
      setErroValidacao("Por favor, insira uma chave de acesso.");
      return;
    }

    if (chaveLimpa.length !== 44 || !/^\d+$/.test(chaveLimpa)) {
      setErroValidacao("A chave de acesso deve conter exatamente 44 dígitos numéricos.");
      return;
    }

    setChavePesquisada(chaveLimpa);
  };

  // Limpar a busca
  const handleLimpar = () => {
    setChaveBusca("");
    setChavePesquisada("");
    setErroValidacao("");
  };

  // Buscar itens da NF pesquisada nas movimentações e cruzar com os produtos ativos
  const dadosNf = useMemo(() => {
    if (!chavePesquisada) return null;

    // Filtrar movimentações associadas a esta chave
    const movimentosFiltrados = movements.filter((m) => {
      if (m.tipo !== "Entrada NF") return false;
      if (m.chaveNf === chavePesquisada) return true;
      if (m.descricao && m.descricao.includes(chavePesquisada)) return true;
      return false;
    });

    if (movimentosFiltrados.length === 0) {
      return null;
    }

    // Cruzar cada movimento com o produto ativo correspondente para obter localização em tempo real
    const itens = movimentosFiltrados.map((mov) => {
      const produtoAtivo = products.find(
        (p) => p.codProduto.trim().toLowerCase() === mov.codProduto.trim().toLowerCase()
      );

      return {
        id: mov.id,
        codProduto: mov.codProduto,
        quantidadeEntrada: mov.quantidade,
        descricao: produtoAtivo ? produtoAtivo.descricao : mov.produtoDescricao.split(" (")[0],
        marca: produtoAtivo ? produtoAtivo.marca : (mov.produtoDescricao.match(/\((.*?)\)/)?.[1] || "N/A"),
        familia: produtoAtivo ? produtoAtivo.familia : "Peças",
        // Posição física em tempo real obtida do cadastro global de produtos
        localizacaoAtual: produtoAtivo ? produtoAtivo.localizacao : "Não Cadastrado",
        estoqueTotalAtual: produtoAtivo ? produtoAtivo.quantidade : 0,
        existeNoEstoque: !!produtoAtivo
      };
    });

    // Calcular metadados consolidados da nota
    const totalItens = itens.length;
    const totalPecas = itens.reduce((sum, item) => sum + item.quantidadeEntrada, 0);
    const dataProcessamento = movimentosFiltrados[0]?.dataHora;

    return {
      chave: chavePesquisada,
      totalItens,
      totalPecas,
      dataProcessamento,
      itens
    };
  }, [chavePesquisada, movements, products]);

  // Função para carregar uma chave de atalho e buscar imediatamente
  const selecionarAtalho = (chave) => {
    setChaveBusca(chave);
    setChavePesquisada(chave);
    setErroValidacao("");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-2xl font-black text-gray-950 dark:text-white uppercase tracking-tight">
          Rastreabilidade de Notas Fiscais
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Consulte onde cada item importado por uma Nota Fiscal está localizado fisicamente no almoxarifado em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Lateral - Filtros e Busca */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-5 h-fit">
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-950 dark:text-white text-sm uppercase tracking-wider flex items-center space-x-2">
              <FileText size={16} className="text-orange-500" />
              <span>Chave de Consulta</span>
            </h3>
            <p className="text-xs text-gray-500">
              Insira a chave numérica de 44 dígitos da NF-e para verificar a alocação dos itens.
            </p>
          </div>

          <form onSubmit={handleBuscar} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chave de Acesso (44 dígitos)
                </label>
                <span className="text-[10px] font-mono text-gray-400">
                  {chaveBusca.length}/44
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="00000000000000000000000000000000000000000000"
                  value={chaveBusca}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ""); // Apenas dígitos
                    if (val.length <= 44) {
                      setChaveBusca(val);
                    }
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-950 dark:text-white px-3 py-3 rounded-lg text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
              {erroValidacao && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-400 p-3 rounded-lg text-xs flex items-start space-x-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="font-semibold">{erroValidacao}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase text-xs py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Search size={14} className="stroke-[3]" />
                <span>Localizar Itens</span>
              </button>
              {chavePesquisada && (
                <button
                  type="button"
                  onClick={handleLimpar}
                  className="bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-lg transition-colors flex items-center justify-center border border-gray-250 dark:border-gray-800 cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </form>

          {/* Atalhos Rápidos para Teste */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Notas Registradas no Sistema
            </h4>

            {chavesDisponiveis.length === 0 ? (
              <div className="space-y-3">
                <p className="text-[11px] text-gray-400 italic">
                  Nenhuma Nota Fiscal processada recentemente nas movimentações.
                </p>
                <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/50 dark:border-orange-900/20 p-3 rounded-lg space-y-2">
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    Você pode usar o atalho de demonstração padrão para popular a busca instantaneamente:
                  </p>
                  <button
                    type="button"
                    onClick={() => selecionarAtalho("35260600000000000000000000000000000000001234")}
                    className="w-full text-left bg-white dark:bg-gray-950 border border-orange-350 dark:border-orange-900 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-650 dark:text-orange-400 font-mono text-[10px] p-2 rounded font-bold transition-all flex items-center justify-between"
                  >
                    <span>352606...1234 (Seeded)</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {chavesDisponiveis.map((chave) => (
                  <button
                    key={chave}
                    type="button"
                    onClick={() => selecionarAtalho(chave)}
                    className={`w-full text-left border p-2.5 rounded-lg transition-all flex items-center justify-between font-mono text-[10px] font-bold ${
                      chavePesquisada === chave
                        ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500 text-orange-650 dark:text-orange-400"
                        : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Hash size={12} className="text-orange-500 flex-shrink-0" />
                      <span className="truncate">{chave.substring(0, 8)}...{chave.substring(36)}</span>
                    </div>
                    <ArrowRight size={10} className="flex-shrink-0 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel Central - Resultados do Cruzamento */}
        <div className="lg:col-span-2 space-y-6">
          {!chavePesquisada ? (
            /* Estado Vazio - Aguardando Busca */
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-full text-orange-500">
                <Search size={36} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base uppercase tracking-wide">
                  Consulta de Rastreabilidade
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Digite a chave de acesso de 44 dígitos da Nota Fiscal no painel ao lado ou selecione um atalho para mapear a posição física dos itens.
                </p>
              </div>
            </div>
          ) : !dadosNf ? (
            /* Estado - Nota Não Encontrada */
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-6 min-h-[350px] flex flex-col justify-center">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/50 p-6 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
                <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <AlertCircle size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-gray-950 dark:text-white text-sm uppercase tracking-wider">
                    Nota Fiscal Não Encontrada
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    A chave <span className="font-mono font-bold text-gray-950 dark:text-white break-all">{formatarChave(chavePesquisada)}</span> não consta no histórico de notas fiscais processadas.
                  </p>
                </div>
                <div className="pt-2">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-150 dark:border-gray-850">
                    💡 <strong>Como resolver:</strong> Vá até a aba <strong>Entrada de Nota Fiscal</strong>, insira esta chave de acesso para carregar e triar os produtos e depois conclua o lançamento do lote.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Estado - Resultados Encontrados */
            <div className="space-y-6">
              {/* Card Resumo do Lote da NF */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-750 dark:text-emerald-400 text-[9px] font-black uppercase px-2.5 py-0.5 rounded font-semibold tracking-wider">
                      <CheckCircle2 size={10} className="stroke-[2.5]" />
                      <span>Processada no Sistema</span>
                    </span>
                    <h3 className="font-mono font-bold text-gray-950 dark:text-white text-sm tracking-wide break-all">
                      {formatarChave(dadosNf.chave)}
                    </h3>
                  </div>
                  {dadosNf.dataProcessamento && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-955 px-3 py-1.5 rounded-lg border border-gray-150 dark:border-gray-850 font-medium">
                      <Calendar size={14} className="text-orange-500" />
                      <span>{new Date(dadosNf.dataProcessamento).toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Produtos Vinculados</span>
                    <span className="text-xl font-black text-gray-950 dark:text-white">{dadosNf.totalItens}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Volume Alocado (Qtd)</span>
                    <span className="text-xl font-black text-gray-950 dark:text-white">{dadosNf.totalPecas} un.</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 col-span-2 md:col-span-1">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Status do Almoxarifado</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      <span>Sincronizado</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabela de Itens e Localizações */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-950 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-2">
                    <Layers size={14} className="text-orange-500" />
                    <span>Mapeamento Físico de Produtos ({dadosNf.totalItens} itens)</span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-850 text-gray-500 font-bold uppercase bg-gray-50/50 dark:bg-gray-950/50">
                        <th className="py-3.5 px-5">Produto / Descrição</th>
                        <th className="py-3.5 px-5">Cód. Fabricante</th>
                        <th className="py-3.5 px-5 text-center">Qtd Entrada</th>
                        <th className="py-3.5 px-5 text-center">Localização Atual</th>
                        <th className="py-3.5 px-5 text-right pr-6">Estoque Geral</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                      {dadosNf.itens.map((item) => {
                        const noLocal = !item.localizacaoAtual || item.localizacaoAtual === "Sem Localização" || item.localizacaoAtual === "Não Alocado" || item.localizacaoAtual === "Não Cadastrado";
                        
                        return (
                          <tr key={item.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-950/40 transition-colors font-medium">
                            <td className="py-4 px-5">
                              <p className="text-gray-955 dark:text-white font-bold">{item.descricao}</p>
                              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase mt-0.5">
                                {item.marca} • <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1 py-0.2 rounded">{item.familia}</span>
                              </p>
                            </td>
                            <td className="py-4 px-5 font-mono font-bold text-gray-650 dark:text-gray-300">
                              {item.codProduto}
                            </td>
                            <td className="py-4 px-5 text-center font-black text-gray-950 dark:text-white">
                              {item.quantidadeEntrada}
                            </td>
                            <td className="py-4 px-5 text-center">
                              {noLocal ? (
                                <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 rounded text-[10px] uppercase tracking-wider inline-block">
                                  Sem Posição
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 bg-orange-100 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 text-orange-800 dark:text-orange-400 text-xs px-2.5 py-1 rounded-md font-extrabold shadow-sm">
                                  <MapPin size={12} className="text-orange-500 stroke-[2.5]" />
                                  <span className="font-mono">{item.localizacaoAtual}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right pr-6 font-semibold text-gray-500 dark:text-gray-400">
                              {item.existeNoEstoque ? (
                                <span>{item.estoqueTotalAtual} pçs</span>
                              ) : (
                                <span className="text-red-500 text-[10px] font-bold uppercase">Deletado</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 dark:bg-gray-950 p-4 border-t border-gray-150 dark:border-gray-850 text-[10px] text-gray-500 dark:text-gray-450 leading-relaxed flex items-start space-x-1.5">
                  <span>ℹ️</span>
                  <span>
                    A coluna <strong>Localização Atual</strong> reflete o quadrante em tempo real no estoque. Se o produto for remanejado de prateleira ou retirado por meio de uma Ordem de Serviço, a alteração se refletirá imediatamente aqui.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
