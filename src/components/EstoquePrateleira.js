import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Layers, 
  Tag, 
  Package, 
  X, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Trash2
} from "lucide-react";

export default function EstoquePrateleira({ products, setProducts, setMovements }) {
  // Estados de busca e filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("all");
  
  // Controle do Painel Lateral (Drawer) de Prateleira
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Grid de Prateleira (5 Linhas A-E, 3 Colunas 1-3)
  const rows = ["A", "B", "C", "D", "E"];
  const cols = ["1", "2", "3"];

  // Obter famílias únicas para o seletor de filtros
  const families = ["all", ...new Set(products.map(p => p.familia).filter(Boolean))];

  // Filtragem dinâmica de produtos
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.codProduto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.codInterno.toString().includes(searchQuery) ||
      (p.localizacao && p.localizacao.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFamily = selectedFamily === "all" || p.familia === selectedFamily;

    return matchesSearch && matchesFamily;
  });

  // Atualizar a localização de um produto pelo clique no quadrante
  const handleUpdateLocation = (locCode) => {
    if (!selectedProduct) return;

    const oldLocation = selectedProduct.localizacao || "Não Alocado";

    // Atualizar no estado global de produtos
    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        const updated = { ...p, localizacao: locCode };
        // Atualiza também o produto atualmente selecionado para refletir visualmente
        setSelectedProduct(updated);
        return updated;
      }
      return p;
    });
    setProducts(updatedProducts);

    // Adicionar log de movimentação de remanejamento
    const newMov = {
      id: "mov-" + Date.now(),
      tipo: "Remanejamento",
      descricao: `Remanejado de [${oldLocation}] para [${locCode}]`,
      codProduto: selectedProduct.codProduto,
      produtoDescricao: `${selectedProduct.descricao} (${selectedProduct.marca})`,
      quantidade: selectedProduct.quantidade,
      usuario: "Supervisor de Almoxarifado",
      dataHora: new Date().toISOString()
    };
    setMovements(prev => [newMov, ...prev]);
  };

  // Excluir produto sem gerar histórico (correção operacional)
  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
    setSelectedProduct(null);
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
          Controle de Estoque e Prateleira
        </h2>
        <p className="text-sm text-gray-600">
          Visualize a listagem geral, busque por qualquer parâmetro e gerencie a posição física do estoque na grade de prateleiras.
        </p>
      </div>

      {/* Filtros e Barra de Pesquisa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
        
        {/* Barra de Pesquisa */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por Descrição, Marca, Código ou Localização..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-950 pl-11 pr-4 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filtro por Família */}
        <div className="w-full md:w-60 flex items-center space-x-2">
          <label className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
            Grupo/Família:
          </label>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
          >
            {families.map(fam => (
              <option key={fam} value={fam}>
                {fam === "all" ? "Todos os Grupos" : fam}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Grid Principal - Tabela de Produtos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Tabela de Produtos (Ocupa 2 colunas se o painel estiver aberto, senão ocupa 3) */}
        <div className={`xl:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200`}>
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider">
              Listagem Geral do Inventário ({filteredProducts.length} itens encontrados)
            </h3>
            <span className="text-xs text-gray-500 font-medium">Clique em um item para ver a prateleira</span>
          </div>

          <div className="overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-500 flex flex-col items-center justify-center space-y-2">
                <Package size={44} className="text-gray-300" />
                <p className="font-medium">Nenhum produto cadastrado corresponde aos filtros.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-bold text-xs uppercase bg-gray-50/50">
                    <th className="py-3 px-4">Cód. Interno</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Marca</th>
                    <th className="py-3 px-4">Cód. Produto</th>
                    <th className="py-3 px-4">Família</th>
                    <th className="py-3 px-4 text-center">Localização</th>
                    <th className="py-3 px-4 text-right pr-6">Qtd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    const isLowStock = (Number(p.quantidade) || 0) < 3;

                    return (
                      <tr 
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`hover:bg-orange-50/20 transition-colors cursor-pointer font-medium ${
                          isSelected ? "bg-orange-50/40 border-l-4 border-l-orange-500" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-orange-600 text-xs font-bold">
                          #{p.codInterno}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-gray-950 font-bold">{p.descricao}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700">{p.marca}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-gray-600">{p.codProduto}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                            {p.familia}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center space-x-1 bg-gray-100 border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-md font-extrabold shadow-sm">
                            <MapPin size={11} className="text-orange-500" />
                            <span>{p.localizacao || "Sem Localização"}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right pr-6">
                          <span className={`inline-block font-black px-2.5 py-0.5 rounded text-sm ${
                            isLowStock 
                              ? "bg-red-100 border border-red-200 text-red-700 animate-pulse" 
                              : "bg-gray-100 border border-gray-200 text-gray-800"
                          }`}>
                            {p.quantidade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Visualização de Prateleira (Lateral/Col 3) */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 bg-gray-950 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers size={18} className="text-orange-500" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                Prateleira Inteligente
              </h3>
            </div>
            {selectedProduct && (
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-900"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="p-5 flex-1">
            {!selectedProduct ? (
              <div className="text-center py-24 text-gray-500 flex flex-col items-center justify-center space-y-3">
                <MapPin size={48} className="text-gray-300" />
                <p className="font-bold text-sm">Selecione um produto da lista</p>
                <p className="text-xs max-w-[200px] leading-relaxed">
                  Ao clicar em um produto da tabela, a representação visual da prateleira será carregada aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cabeçalho do Produto Selecionado */}
                <div className="space-y-3 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 font-mono">
                      CÓD. INTERNO: #{selectedProduct.codInterno}
                    </span>
                    <h4 className="font-black text-gray-950 text-lg leading-tight uppercase">
                      {selectedProduct.descricao}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Marca</span>
                      <span className="font-bold text-gray-800">{selectedProduct.marca}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Cód. Fabricante</span>
                      <span className="font-bold text-gray-800 font-mono">{selectedProduct.codProduto}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100 col-span-2 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Posição Atual</span>
                        <span className="font-black text-orange-600 font-mono text-sm">{selectedProduct.localizacao || "Indefinida"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Estoque</span>
                        <span className="font-black text-gray-800 text-sm">{selectedProduct.quantidade} pçs</span>
                      </div>
                    </div>
                  </div>

                  {(Number(selectedProduct.quantidade) || 0) < 3 && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-lg text-xs flex items-center space-x-2">
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      <span className="font-bold">Aviso: Estoque baixo necessita reabastecimento.</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs py-2.5 rounded-lg transition-colors shadow-sm mt-3"
                  >
                    <Trash2 size={14} />
                    <span>Excluir Item do Estoque</span>
                  </button>
                </div>

                {/* Grade 5x3 Visual da Prateleira */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-600 uppercase flex items-center space-x-1">
                    <Layers size={14} className="text-orange-500" />
                    <span>Grade de Ocupação</span>
                  </span>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-inner">
                    <div className="grid grid-cols-4 gap-1.5 text-center items-center">
                      
                      {/* Indicador superior */}
                      <div className="text-[9px] font-bold text-gray-400 uppercase">P1</div>
                      
                      {/* Colunas */}
                      {cols.map(c => (
                        <div key={c} className="text-[10px] font-bold text-gray-500">C{c}</div>
                      ))}

                      {/* Linhas */}
                      {rows.map(r => (
                        <React.Fragment key={r}>
                          <div className="text-[10px] font-bold text-gray-500">L{r}</div>
                          {cols.map(c => {
                            const locCode = `P1-${r}${c}`;
                            const isCurrent = selectedProduct.localizacao === locCode;

                            return (
                              <button
                                type="button"
                                key={locCode}
                                onClick={() => handleUpdateLocation(locCode)}
                                className={`py-2 rounded-md border text-[10px] font-black transition-all ${
                                  isCurrent
                                    ? "bg-orange-500 text-black border-orange-600 shadow ring-2 ring-orange-500/20"
                                    : "bg-white text-gray-800 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
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
                </div>

                <div className="text-[10px] text-gray-400 bg-gray-50 p-2.5 rounded-lg leading-relaxed border border-gray-100 flex items-start space-x-1">
                  <span>ℹ️</span>
                  <span>Clique em qualquer célula da grade acima para mover este item para uma nova prateleira. A alteração é instantânea.</span>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3 text-red-650">
                <div className="bg-red-50 p-2 rounded-lg text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="font-extrabold text-lg text-gray-950">
                  Excluir Item do Inventário?
                </h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tem certeza de que deseja remover o item <span className="font-bold text-gray-950">{selectedProduct.descricao}</span> (Cód. Interno <span className="font-bold font-mono">#{selectedProduct.codInterno}</span>) permanentemente do estoque? Esta ação não pode ser desfeita.
              </p>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProduct}
                  className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
