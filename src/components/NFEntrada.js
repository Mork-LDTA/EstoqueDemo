import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  MapPin, 
  AlertCircle,
  Package,
  Layers
} from "lucide-react";

export default function NFEntrada({ products, setProducts, movements, setMovements }) {
  // Estado da chave da Nota Fiscal
  const [chaveNf, setChaveNf] = useState("");
  
  // Fila de itens extraídos da NF atual que aguardam triagem/alocação
  const [itemsFila, setItemsFila] = useState([]);
  
  // Feedback e Controle de Modais
  const [isFetched, setIsFetched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Item específico da fila que está passando pela triagem no momento
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [notasProcessadas, setNotasProcessadas] = useState([]);
  const [prateleiraAtiva, setPrateleiraAtiva] = useState("P1");

  // Grid de Prateleira (5 Linhas A-E, 3 Colunas 1-3)
  const rows = ["A", "B", "C", "D", "E"];
  const cols = ["1", "2", "3"];

  // Mecanismo de Simulação (Mock de Notas Fiscais com múltiplos itens)
  const handlePuxarDados = () => {
    setErrorMsg("");
    const trimmedChave = chaveNf.trim();

    if (notasProcessadas.includes(trimmedChave)) {
      setErrorMsg("Bloqueio Fiscal: Esta Nota Fiscal já foi lançada no sistema e não pode ser reprocessada!");
      return;
    }

    // Dicionário de Mocks simulando lotes reais de entrega com mais de 1 item por NF
    const bancoNotasFiscais = {
      // LOTEPADRÃO: Simulação completa contendo 3 itens distintos para a manutenção
       "3526061234567800019955001000004444123456114": [{ // Atalho rápido para digitação no Pitch
        descricao: "Filtro Separador de Combustível (Racor)",
        marca: "PARKER",
        codProduto: "R90-P",
        familia: "Filtros",
        quantidade: 15,
        localizacao: "",
        alocado: false
      }],
      "35260600012345678901234567890123456789012433": [
        {
          descricao: "Filtro Separador de Água Racor Combustível",
          marca: "DONALDSON",
          codProduto: "P550388",
          familia: "Filtros",
          quantidade: 5,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Tambor de Freio Traseiro Caminhão Traçado",
          marca: "FRAS-LE",
          codProduto: "T-284",
          familia: "Freios",
          quantidade: 4,
          localizacao: "",
          alocado: false
        }
      ],
      "35260600012345678901234567890123456789012444": [
        {
          descricao: "Válvula Moduladora do Sistema ABS / EBS",
          marca: "WABCO",
          codProduto: "4801020300",
          familia: "Freios",
          quantidade: 1,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Bolsa da Suspensão Pneumática do Eixo Traseiro",
          marca: "SUSPENSYS",
          codProduto: "BL-0042",
          familia: "Suspensão",
          quantidade: 2,
          localizacao: "",
          alocado: false
        }
      ],
      "35260600012345678901234567890123456789012455": [
        {
          descricao: "Kits de Filtro de Óleo Lubrificante Motor",
          marca: "MANN FILTER",
          codProduto: "HU12140X",
          familia: "Filtros",
          quantidade: 8,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Rolamento do Cubo de Roda Dianteira",
          marca: "SKF",
          codProduto: "VKBA5412",
          familia: "Suspensão",
          quantidade: 3,
          localizacao: "",
          alocado: false
        }
      ],

      "35260600012345678901234567890123456789012300": [
        {
          descricao: "Rolamento de Roda Traseira",
          marca: "TIMKEN",
          codProduto: "6205-2RS",
          familia: "Peças",
          quantidade: 4,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Filtro Separador de Combustível (Racor)",
          marca: "PARKER",
          codProduto: "R90-P",
          familia: "Filtros",
          quantidade: 8,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Correia do Alternador Poly-V 8PK1635",
          marca: "GATES",
          codProduto: "8PK1635",
          familia: "Correias",
          quantidade: 5,
          localizacao: "",
          alocado: false
        }
      ],
      // ATALHO 5555: Kit de Reparo Rápido de Injeção e Suspensão
      "35260600012345678901234567890123456789012422": [
        {
          descricao: "Bico Injetor Common Rail Sistema CRDI",
          marca: "BOSCH",
          codProduto: "0445120007",
          familia: "Motor",
          quantidade: 2,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Mola Pneumática da Cabine (Bolsão)",
          marca: "GOODYEAR",
          codProduto: "1T15R-6",
          familia: "Suspensão",
          quantidade: 3,
          localizacao: "",
          alocado: false
        }
      ],
      "35260600012345678901234567890123456789010022": [
        {
          descricao: "Bico Injetor Common Rail Sistema CRDI",
          marca: "BOSCH",
          codProduto: "0445120007",
          familia: "Motor",
          quantidade: 2,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Mola Pneumática da Cabine (Bolsão)",
          marca: "GOODYEAR",
          codProduto: "1T15R-6",
          familia: "Suspensão",
          quantidade: 3,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Rolamento de Roda Traseira",
          marca: "TIMKEN",
          codProduto: "6205-2RS",
          familia: "Peças",
          quantidade: 4,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Filtro Separador de Combustível (Racor)",
          marca: "PARKER",
          codProduto: "R90-P",
          familia: "Filtros",
          quantidade: 8,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Correia do Alternador Poly-V 8PK1635",
          marca: "GATES",
          codProduto: "8PK1635",
          familia: "Correias",
          quantidade: 5,
          localizacao: "",
          alocado: false
        }
      ]
    };

    // Fluxo lógico de validação e preenchimento da fila
    if (bancoNotasFiscais[trimmedChave]) {
      setItemsFila(bancoNotasFiscais[trimmedChave]);
      setIsFetched(true);
    } else if (trimmedChave.length === 44 && /^\d+$/.test(trimmedChave)) {
      // Comportamento genérico simulando uma nota com 2 itens para qualquer outra chave válida
      setItemsFila([
        {
          descricao: "Retentor Nitrílico de Cubo de Roda",
          marca: "SABÓ",
          codProduto: "9102-AR",
          familia: "Retentores",
          quantidade: 6,
          localizacao: "",
          alocado: false
        },
        {
          descricao: "Jogo de Pastilhas de Freio Dianteira (Truck)",
          marca: "FRAS-LE",
          codProduto: "PD-522",
          familia: "Freios",
          quantidade: 2,
          localizacao: "",
          alocado: false
        }
      ]);
      setIsFetched(true);
    } else {
      setErrorMsg("Chave de teste não localizada. Use chaves reais de 44 dígitos ou o atalho rápido: 5555.");
      setIsFetched(false);
    }
  };

  // Abrir modal de prateleira para um item específico da fila
  const handleAbrirMapeamento = (index) => {
    setActiveItemIndex(index);
    const item = itemsFila[index];
    
    // Se o item já existia no estoque global e já tinha posição física, sugere a mesma
    const itemEstoque = products.find(p => p.codProduto.trim().toLowerCase() === item.codProduto.trim().toLowerCase());
    const initialLocation = itemEstoque?.localizacao || "P1-A1";
    setSelectedLocation(initialLocation);
    
    // Define active shelf based on the initial location prefix
    const shelfPrefix = initialLocation.split("-")[0] || "P1";
    setPrateleiraAtiva(shelfPrefix);
    
    setShowLocationModal(true);
  };

  // Alternar prateleiras e remapear código no modal
  const handleShelfChange = (newShelf) => {
    setPrateleiraAtiva(newShelf);
    if (selectedLocation) {
      const parts = selectedLocation.split("-");
      if (parts.length > 1) {
        setSelectedLocation(`${newShelf}-${parts[1]}`);
      }
    }
  };

  // Salva a localização temporariamente na fila de conferência
  const handleConfirmarLocalizacaoItem = () => {
    setItemsFila(prev => prev.map((item, idx) => 
      idx === activeItemIndex 
        ? { ...item, localizacao: selectedLocation, alocado: true } 
        : item
    ));
    setShowLocationModal(false);
    setActiveItemIndex(null);
  };

  // Conclui a Nota Fiscal, atualizando o estoque real e gerando logs para cada item
  const handleFinalizarNotaCompleta = (e) => {
    e.preventDefault();

    // Validação de segurança: todos os itens precisam ter recebido uma posição física
    const pendentes = itemsFila.some(item => !item.alocado);
    if (pendentes) {
      alert("Atenção: É necessário definir a localização de todos os itens da Nota Fiscal antes de salvar.");
      return;
    }

    const trimmedChave = chaveNf.trim();
    let novosProdutos = [...products];
    let novasMovimentacoes = [];

    itemsFila.forEach(item => {
      const existingIndex = novosProdutos.findIndex(
        (p) => p.codProduto.trim().toLowerCase() === item.codProduto.trim().toLowerCase()
      );

      if (existingIndex !== -1) {
        // Incrementa o produto existente e atualiza a localização se necessário
        novosProdutos[existingIndex] = {
          ...novosProdutos[existingIndex],
          quantidade: novosProdutos[existingIndex].quantidade + item.quantidade,
          localizacao: item.localizacao
        };
      } else {
        // Insere um produto inédito gerando código interno único
        const codInterno = Math.floor(1000 + Math.random() * 9000);
        novosProdutos.unshift({
          id: "prod-" + Date.now() + Math.random(),
          descricao: item.descricao,
          marca: item.marca,
          codProduto: item.codProduto,
          codInterno,
          familia: item.familia,
          quantidade: item.quantidade,
          localizacao: item.localizacao
        });
      }

      // Cria a linha de histórico individual para o relatório
      novasMovimentacoes.push({
        id: "mov-" + Date.now() + Math.random(),
        tipo: "Entrada NF",
        descricao: `Lote NF (${chaveNf}) — Alocado na posição ${item.localizacao}`,
        codProduto: item.codProduto,
        produtoDescricao: `${item.descricao} (${item.marca})`,
        quantidade: item.quantidade,
        usuario: "Operador Almoxarifado",
        dataHora: new Date().toISOString(),
        chaveNf: chaveNf
      });
    });

    // Atualiza os estados globais do sistema
    setProducts(novosProdutos);
    setMovements(prev => [...novasMovimentacoes, ...prev]);
    setNotasProcessadas(prev => [...prev, trimmedChave]);

    // Reset operacional completo
    setChaveNf("");
    setItemsFila([]);
    setIsFetched(false);

    alert("Nota Fiscal processada com sucesso! Todos os itens foram integrados ao inventário.");
  };

  // Verifica se o lote todo já foi mapeado para liberar o botão de encerramento
  const todoLoteMapeado = itemsFila.length > 0 && itemsFila.every(item => item.alocado);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
          Entrada de Nota Fiscal
        </h2>
        <p className="text-sm text-gray-600">
          Simule a importação de lotes de itens de Notas Fiscais eletrônicas por meio da chave de acesso e realize a triagem por produto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel de Busca/Chave */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider flex items-center space-x-2">
            <FileText size={16} className="text-orange-500" />
            <span>Chave de Acesso</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase">
              Chave de Acesso da NF-e
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Insira a chave ou use o atalho 5555"
                value={chaveNf}
                onChange={(e) => setChaveNf(e.target.value)}
                maxLength={44}
                className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
            <p className="text-[10px] text-gray-400">
              Clique <span className="font-bold text-orange-600 cursor-pointer underline hover:text-orange-700" onClick={() => setChaveNf("35260600012345678901234567890123456789012345")}>aqui</span> para carregar a nota de simulação com múltiplos itens.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start space-x-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handlePuxarDados}
            className="w-full bg-orange-500 text-black font-black uppercase text-xs py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <Search size={14} className="stroke-[3]" />
            <span>Puxar Dados da NF</span>
          </button>
        </div>

        {/* Fila de Triagem / Múltiplos Itens Recebidos */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider flex items-center space-x-2">
              <Layers size={16} className="text-orange-500" />
              <span>Itens Identificados no XML ({itemsFila.length})</span>
            </h3>
            {isFetched && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gray-950 text-white font-mono">
                Lote Carregado
              </span>
            )}
          </div>

          {!isFetched ? (
            <div className="text-center py-16 text-gray-400 italic text-sm flex flex-col items-center justify-center space-y-2">
              <Package size={32} className="stroke-[1.5] text-gray-300" />
              <span>Aguardando leitura de chave de acesso para listar os produtos da nota.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-gray-150 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase bg-gray-50">
                      <th className="py-3 px-4">Produto / Descrição</th>
                      <th className="py-3 px-4">Cód. Fabricante</th>
                      <th className="py-3 px-4 text-center">Qtd</th>
                      <th className="py-3 px-4 text-center">Posição</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {itemsFila.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <p className="text-gray-950 font-bold">{item.descricao}</p>
                          <p className="text-gray-400 text-[10px] font-semibold uppercase">{item.marca} • {item.familia}</p>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-600">
                          {item.codProduto}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-gray-950">
                          {item.quantidade}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.alocado ? (
                            <span className="bg-orange-50 text-orange-700 font-bold border border-orange-200 px-2 py-0.5 rounded font-mono text-[10px]">
                              📍 {item.localizacao}
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 font-bold border border-amber-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleAbrirMapeamento(index)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm ${
                              item.alocado 
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200" 
                                : "bg-gray-950 text-white hover:bg-black"
                            }`}
                          >
                            {item.alocado ? "Remapear" : "Mapear Posição"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Botão de Encerramento do Lote */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinalizarNotaCompleta}
                  disabled={!todoLoteMapeado}
                  className={`w-full md:w-auto px-6 py-3 font-black uppercase text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm ${
                    todoLoteMapeado 
                      ? "bg-gray-950 text-white hover:bg-black cursor-pointer" 
                      : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 size={16} className={todoLoteMapeado ? "text-orange-500" : "text-gray-300"} />
                  <span>Concluir Entrada do Lote e Registrar Estoque</span>
                </button>
                {!todoLoteMapeado && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-1.5 flex items-center space-x-1">
                    <span>⚠️ Mapeie a posição física de todos os itens da tabela acima para liberar a conclusão fiscal.</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal/Overlay de Localização (Grade de Prateleira 5x3) */}
      {showLocationModal && activeItemIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gray-950 text-white p-5 border-b border-gray-800">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-orange-500">
                Triagem Logística: Prateleira Virtual
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Alocando: <span className="font-bold text-white">{itemsFila[activeItemIndex].descricao}</span> ({itemsFila[activeItemIndex].marca})
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-600 uppercase flex items-center space-x-1">
                  <MapPin size={12} className="text-orange-500" />
                  <span>Selecione a Posição Física na Prateleira</span>
                </span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Defina o quadrante no almoxarifado para as <span className="font-bold text-gray-800">{itemsFila[activeItemIndex].quantidade} unidades</span> deste produto.
                </p>
              </div>

              {/* Seletor de Estrutura Multi-Prateleiras */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleShelfChange("P1")}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-colors border ${
                    prateleiraAtiva === "P1"
                      ? "bg-gray-950 text-orange-500 border-gray-950 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Prateleira P1
                </button>
                <button
                  type="button"
                  onClick={() => handleShelfChange("P2")}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-colors border ${
                    prateleiraAtiva === "P2"
                      ? "bg-gray-950 text-orange-500 border-gray-950 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Prateleira P2
                </button>
              </div>

              {/* Grid 5x3 Visualizer */}
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5 shadow-inner">
                <div className="grid grid-cols-4 gap-2 text-center items-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Prateleira {prateleiraAtiva}</div>
                  {cols.map(c => (
                    <div key={c} className="text-xs font-bold text-gray-600">Coluna {c}</div>
                  ))}

                  {rows.map(r => (
                    <React.Fragment key={r}>
                      <div className="text-xs font-bold text-gray-600">Linha {r}</div>
                      {cols.map(c => {
                        const locCode = `${prateleiraAtiva}-${r}${c}`;
                        const isSelected = selectedLocation === locCode;

                        return (
                          <button
                            type="button"
                            key={locCode}
                            onClick={() => setSelectedLocation(locCode)}
                            className={`py-3.5 rounded-lg border text-xs font-black transition-all ${
                              isSelected
                                ? "bg-orange-500 text-black border-orange-600 shadow-md ring-2 ring-orange-500/30 scale-102"
                                : "bg-white text-gray-800 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                            }`}
                          >
                            {locCode}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Localização selecionada ativa */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Localização Mapeada:
                  </span>
                  <span className="text-lg font-black text-gray-900 font-mono">
                    {selectedLocation}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Lote do Item:
                  </span>
                  <span className="text-lg font-black text-orange-600">
                    {itemsFila[activeItemIndex].quantidade} unidades
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setShowLocationModal(false); setActiveItemIndex(null); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarLocalizacaoItem}
                className="px-5 py-2.5 bg-orange-500 text-black text-xs font-black uppercase rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
              >
                Confirmar Posição do Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}