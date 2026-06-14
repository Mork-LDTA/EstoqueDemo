import React, { useState } from "react";
import { 
  PlusCircle, 
  CheckCircle2, 
  MapPin, 
  AlertCircle 
} from "lucide-react";

export default function CadastroManual({ products, setProducts, movements, setMovements }) {
  // Form fields
  const [descricao, setDescricao] = useState("");
  const [marca, setMarca] = useState("");
  const [codProduto, setCodProduto] = useState("");
  const [familia, setFamilia] = useState("");
  const [quantidade, setQuantidade] = useState(5);
  
  // Feedback and Modal state
  const [errorMsg, setErrorMsg] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempProduct, setTempProduct] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");

  // Grid variables (5 Rows A-E, 3 Columns 1-3)
  const rows = ["A", "B", "C", "D", "E"];
  const cols = ["1", "2", "3"];

  const handleConfirmarCadastro = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!descricao || !marca || !codProduto || !familia || !quantidade) {
      setErrorMsg("Todos os campos são obrigatórios.");
      return;
    }

    // Validação de Duplicidade: Verificar se já existe produto com o mesmo codProduto (Código do Fabricante)
    const existingProduct = products.find(
      (p) => p.codProduto.trim().toLowerCase() === codProduto.trim().toLowerCase()
    );

    if (existingProduct) {
      // Se o produto já tem localização física definida, atualiza diretamente e pula o modal
      if (existingProduct.localizacao && existingProduct.localizacao.trim() !== "") {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === existingProduct.id
              ? { ...p, quantidade: p.quantidade + Number(quantidade) }
              : p
          )
        );

        // Criar Log de Movimentação
        const newMov = {
          id: "mov-" + Date.now(),
          tipo: "Cadastro Manual",
          descricao: `Entrada de item via cadastro manual no almoxarifado — Saldo incrementado na posição ${existingProduct.localizacao}`,
          codProduto: existingProduct.codProduto,
          produtoDescricao: `${existingProduct.descricao} (${existingProduct.marca})`,
          quantidade: Number(quantidade),
          usuario: "Operador Almoxarifado",
          dataHora: new Date().toISOString()
        };
        setMovements((prev) => [newMov, ...prev]);

        // Limpar formulário
        setDescricao("");
        setMarca("");
        setCodProduto("");
        setFamilia("");
        setQuantidade(5);

        alert(`Produto já cadastrado no sistema! A quantidade foi adicionada diretamente à posição ${existingProduct.localizacao}.`);
        return;
      } else {
        // Se já existe mas está sem localização vinculada, abre o modal
        const tempProd = {
          ...existingProduct,
          quantidade: Number(quantidade)
        };
        setTempProduct(tempProd);
        setSelectedLocation("P1-A1");
        setShowLocationModal(true);
        return;
      }
    }

    // Se for inédito, gera o codInterno aleatório de 4 dígitos entre 1000 e 9000
    const codInterno = Math.floor(1000 + Math.random() * 8001);
    const id = "prod-" + Date.now();

    const newProd = {
      id,
      descricao,
      marca,
      codProduto,
      codInterno,
      familia,
      quantidade: Number(quantidade),
      localizacao: ""
    };

    setTempProduct(newProd);
    setSelectedLocation("P1-A1");
    setShowLocationModal(true);
  };

  const handleSalvarLocalizacao = () => {
    if (!tempProduct) return;

    // Verificar duplicidade no estoque
    const existingIndex = products.findIndex(
      (p) => p.codProduto.trim().toLowerCase() === tempProduct.codProduto.trim().toLowerCase()
    );

    if (existingIndex !== -1) {
      const existingProduct = products[existingIndex];
      setProducts((prev) =>
        prev.map((p) =>
          p.id === existingProduct.id
            ? {
                ...p,
                quantidade: p.quantidade + tempProduct.quantidade,
                localizacao: selectedLocation
              }
            : p
        )
      );

      // Criar Log de Movimentação
      const newMov = {
        id: "mov-" + Date.now(),
        tipo: "Cadastro Manual",
        descricao: `Entrada de item via cadastro manual no almoxarifado — Mapeado na posição ${selectedLocation} e incrementado`,
        codProduto: tempProduct.codProduto,
        produtoDescricao: `${tempProduct.descricao} (${tempProduct.marca})`,
        quantidade: tempProduct.quantidade,
        usuario: "Operador Almoxarifado",
        dataHora: new Date().toISOString()
      };
      setMovements((prev) => [newMov, ...prev]);

      alert("Produto localizado e atualizado! Nova posição física sincronizada.");
    } else {
      // Produto inédito
      const finalizedProduct = {
        ...tempProduct,
        localizacao: selectedLocation
      };

      setProducts((prev) => [finalizedProduct, ...prev]);

      // Criar Log de Movimentação
      const newMov = {
        id: "mov-" + Date.now(),
        tipo: "Cadastro Manual",
        descricao: `Entrada de item via cadastro manual no almoxarifado — Alocado na posição ${selectedLocation}`,
        codProduto: finalizedProduct.codProduto,
        produtoDescricao: `${finalizedProduct.descricao} (${finalizedProduct.marca})`,
        quantidade: finalizedProduct.quantidade,
        usuario: "Operador Almoxarifado",
        dataHora: new Date().toISOString()
      };
      setMovements((prev) => [newMov, ...prev]);

      alert(`Item cadastrado com sucesso!\nCód. Interno Gerado: #${finalizedProduct.codInterno}\nLocalização: ${finalizedProduct.localizacao}`);
    }

    // Limpar formulário e fechar modal
    setDescricao("");
    setMarca("");
    setCodProduto("");
    setFamilia("");
    setQuantidade(5);
    setShowLocationModal(false);
    setTempProduct(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
          Cadastro Manual de Itens
        </h2>
        <p className="text-sm text-gray-600">
          Cadastre novos produtos ou incremente saldos de itens existentes no estoque de forma manual, sem necessidade de XML fiscal.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-100 flex items-center space-x-2">
          <PlusCircle size={18} className="text-orange-500" />
          <span>Formulário de Cadastro Manual</span>
        </h3>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start space-x-2 mb-4">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleConfirmarCadastro} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Descrição do Item
              </label>
              <input
                type="text"
                placeholder="Ex: Mangueira Hidráulica 1/2"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Marca
              </label>
              <input
                type="text"
                placeholder="Ex: BALFLEX"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Código do Produto (Fabricante)
              </label>
              <input
                type="text"
                placeholder="Ex: MH12-BAL"
                value={codProduto}
                onChange={(e) => setCodProduto(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Família / Grupo
              </label>
              <input
                type="text"
                placeholder="Ex: Mangueiras"
                value={familia}
                onChange={(e) => setFamilia(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Quantidade Inicial (Unidades)
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

          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-gray-950 text-white font-bold uppercase text-xs rounded-lg hover:bg-black transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle2 size={16} className="text-orange-500" />
              <span>Avançar & Definir Localização</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal/Overlay de Localização (Grade de Prateleira 5x3) */}
      {showLocationModal && tempProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gray-950 text-white p-5 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-orange-500">
                  Triagem Logística: Prateleira Virtual
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Item: {tempProduct.descricao} ({tempProduct.marca}) - Cód. Interno: <span className="font-bold text-white">#{tempProduct.codInterno || "EXISTENTE"}</span>
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-600 uppercase flex items-center space-x-1">
                  <MapPin size={12} className="text-orange-500" />
                  <span>Selecione a Posição Física na Prateleira</span>
                </span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Clique em um dos quadrantes abaixo para alocar o item no almoxarifado. A nomenclatura de localização segue o padrão <span className="font-semibold text-gray-800">P1-[Linha][Coluna]</span>.
                </p>
              </div>

              {/* Grid 5x3 Visualizer */}
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-5 shadow-inner">
                <div className="grid grid-cols-4 gap-2 text-center items-center">
                  
                  {/* Canto superior esquerdo em branco */}
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Prateleira P1</div>
                  
                  {/* Cabeçalho de Colunas */}
                  {cols.map(c => (
                    <div key={c} className="text-xs font-bold text-gray-600">Coluna {c}</div>
                  ))}

                  {/* Renderizando as linhas e quadrantes */}
                  {rows.map(r => (
                    <React.Fragment key={r}>
                      {/* Indicador de Linha */}
                      <div className="text-xs font-bold text-gray-600">Linha {r}</div>
                      
                      {/* Quadrantes da linha */}
                      {cols.map(c => {
                        const locCode = `P1-${r}${c}`;
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
                    Localização Final Selecionada:
                  </span>
                  <span className="text-lg font-black text-gray-900 font-mono">
                    {selectedLocation}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Quantidade de Peças:
                  </span>
                  <span className="text-lg font-black text-orange-600">
                    {tempProduct.quantidade} unidades
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarLocalizacao}
                className="px-5 py-2.5 bg-orange-500 text-black text-xs font-black uppercase rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
              >
                Salvar Localização e Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
