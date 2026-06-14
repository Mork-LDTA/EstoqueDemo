import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  MapPin, 
  AlertCircle 
} from "lucide-react";

export default function NFEntrada({ products, setProducts, movements, setMovements }) {
  // Estado do formulário
  const [chaveNf, setChaveNf] = useState("");
  const [descricao, setDescricao] = useState("");
  const [marca, setMarca] = useState("");
  const [codProduto, setCodProduto] = useState("");
  const [familia, setFamilia] = useState("");
  const [quantidade, setQuantidade] = useState(5);
  
  // Feedback e Controle de Modais
  const [isFetched, setIsFetched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Produto recém cadastrado que aguarda localização
  const [tempProduct, setTempProduct] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [notasProcessadas, setNotasProcessadas] = useState([]);

  // Grid de Prateleira (5 Linhas A-E, 3 Colunas 1-3)
  const rows = ["A", "B", "C", "D", "E"];
  const cols = ["1", "2", "3"];

  // Mecanismo de Simulação (Mock)
  const handlePuxarDados = () => {
    setErrorMsg("");
    const trimmedChave = chaveNf.trim();

    // Dicionário de Mocks específicos para manutenção de Caminhões da Construtora
    const bancoNotasFiscais = {
      // ITEM 1: Filtro Separador de Água (Essencial para diesel de canteiro de obras)
      "35260612345678000199550010000011111234567891": {
        descricao: "Filtro Separador de Combustível (Racor)",
        marca: "PARKER",
        codProduto: "R90-P",
        familia: "Filtros"
      },
      "35260612345678000199550010000044441234566794": { // Atalho rápido para digitação no Pitch
        descricao: "Filtro Separador de Combustível (Racor)",
        marca: "PARKER",
        codProduto: "R90-P",
        familia: "Filtros"
      },

      // ITEM 2: Sistema de Freios de alta rodagem
      "35260612345678000199550010000022221234567892": {
        descricao: "Jogo de Pastilhas de Freio Dianteira (Truck)",
        marca: "FRAS-LE",
        codProduto: "PD-522",
        familia: "Freios"
      },
      "35260612345678000199550010000044441234567943": {
        descricao: "Jogo de Pastilhas de Freio Dianteira (Truck)",
        marca: "FRAS-LE",
        codProduto: "PD-522",
        familia: "Freios"
      },

      // ITEM 3: Suspensão Pesada para estradas de terra/obras
      "35260612345678000199550010000033331234567893": {
        descricao: "Mola Pneumática da Cabine (Bolsão)",
        marca: "GOODYEAR",
        codProduto: "1T15R-6",
        familia: "Suspensão"
      },
      "35260612345678000199550010000044441234567453": {
        descricao: "Mola Pneumática da Cabine (Bolsão)",
        marca: "GOODYEAR",
        codProduto: "1T15R-6",
        familia: "Suspensão"
      },

      // ITEM 4: Sistema de Injeção de Motores a Diesel
      "35260612345678000199550010000044441234567894": {
        descricao: "Bico Injetor Common Rail Sistema CRDI",
        marca: "BOSCH",
        codProduto: "0445120007",
        familia: "Motor"
      },
      "35260612345678000199550010000044441234567123": {
        descricao: "Bico Injetor Common Rail Sistema CRDI",
        marca: "BOSCH",
        codProduto: "0445120007",
        familia: "Motor"
      },

      // ITEM 5: Correias de Transmissão do Alternador
      "35260612345678000199550010000055551234567895": {
        descricao: "Correia do Alternador Poly-V 8PK1635",
        marca: "GATES",
        codProduto: "8PK1635",
        familia: "Correias"
      },
      "5555": {
        descricao: "Correia do Alternador Poly-V 8PK1635",
        marca: "GATES",
        codProduto: "8PK1635",
        familia: "Correias"
      },

      // Correção do alinhamento do ID final 5 para bater com o link de clique rápido da tela
      "35260600012345678901234567890123456789012345": {
        descricao: "Rolamento de Roda Traseira",
        marca: "TIMKEN",
        codProduto: "6205-2RS",
        familia: "Peças"
      }
    };

    // Fluxo lógico de validação e preenchimento
    if (bancoNotasFiscais[trimmedChave]) {
      setDescricao(bancoNotasFiscais[trimmedChave].descricao);
      setMarca(bancoNotasFiscais[trimmedChave].marca);
      setCodProduto(bancoNotasFiscais[trimmedChave].codProduto);
      setFamilia(bancoNotasFiscais[trimmedChave].familia);
      setIsFetched(true);
    } else if (trimmedChave.length === 44 && /^\d+$/.test(trimmedChave)) {
      // Comportamento padrão caso usem qualquer outra chave de 44 dígitos numéricos válida
      setDescricao("Retentor Nitrílico de Cubo de Roda");
      setMarca("SABÓ");
      setCodProduto("9102-AR");
      setFamilia("Retentores");
      setIsFetched(true);
    } else {
      setErrorMsg("Chave de teste não localizada. Use as chaves de 44 dígitos, o link auxiliar ou os atalhos: 1111, 2222, 3333, 4444 ou 5555.");
      setIsFetched(false);
    }
  };

  // Confirmar Entrada
  const handleConfirmarEntrada = (e) => {
    e.preventDefault();
    if (!descricao || !marca || !codProduto || !familia || !quantidade) {
      setErrorMsg("Todos os campos do produto são obrigatórios.");
      return;
    }

    // TRAVA 1: Impede reprocessamento da mesma Nota Fiscal (Segurança Logística)
    const trimmedChave = chaveNf.trim();
    if (notasProcessadas.includes(trimmedChave)) {
      setErrorMsg("Bloqueio Fiscal: Esta Nota Fiscal já foi lançada no sistema e não pode ser reprocessada!");
      alert("Bloqueio Fiscal: Esta Nota Fiscal já foi lançada na FX Minas Construtora e seu saldo já está computado.");
      return;
    }

    // TRAVA 2: Verificar duplicidade de peça por Código do Fabricante
    const existingProduct = products.find(
      (p) => p.codProduto.trim().toLowerCase() === codProduto.trim().toLowerCase()
    );

    if (existingProduct) {
      // Caso 2A: O produto já existe e já possui uma localização mapeada nas prateleiras
      if (existingProduct.localizacao && existingProduct.localizacao.trim() !== "") {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === existingProduct.id
              ? { ...p, quantidade: p.quantidade + Number(quantidade) }
              : p
          )
        );

        // Criar histórico cronológico de movimentações
        const newMov = {
          id: "mov-" + Date.now(),
          tipo: "Entrada NF",
          descricao: `Entrada via NF Chave (${chaveNf}) — Saldo incrementado na posição ${existingProduct.localizacao}`,
          codProduto: existingProduct.codProduto,
          produtoDescricao: `${existingProduct.descricao} (${existingProduct.marca})`,
          quantidade: Number(quantidade),
          usuario: "Operador Almoxarifado",
          dataHora: new Date().toISOString()
        };
        setMovements((prev) => [newMov, ...prev]);

        // Adiciona a nota atual à lista de notas processadas para bloqueio futuro
        setNotasProcessadas((prev) => [...prev, trimmedChave]);

        // Reset completo dos campos do formulário
        setChaveNf("");
        setDescricao("");
        setMarca("");
        setCodProduto("");
        setFamilia("");
        setQuantidade(5);
        setIsFetched(false);

        alert(`Produto já cadastrado no sistema! A quantidade foi adicionada diretamente à posição ${existingProduct.localizacao}.`);
        return;
      } else {
        // Caso 2B: O produto existe no histórico, mas por algum motivo ficou pendente de localização física
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

    // Caso 3: O produto é inteiramente inédito no almoxarifado
    const codInterno = Math.floor(1000 + Math.random() * 9000);
    const id = "prod-" + Date.now();

    const newProd = {
      id,
      descricao,
      marca,
      codProduto,
      codInterno,
      familia,
      quantidade: Number(quantidade),
      localizacao: "", 
    };

    setTempProduct(newProd);
    setSelectedLocation("P1-A1"); 
    setShowLocationModal(true);
  };

  // Salvar Localização e Concluir Fluxo
  const handleSalvarLocalizacao = () => {
    if (!tempProduct) return;

    const existingIndex = products.findIndex(
      (p) => p.codProduto.trim().toLowerCase() === tempProduct.codProduto.trim().toLowerCase()
    );

    const trimmedChave = chaveNf.trim();

    if (existingIndex !== -1) {
      // Integração de item existente que estava sem prateleira vinculada
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

      const newMov = {
        id: "mov-" + Date.now(),
        tipo: "Entrada NF",
        descricao: `Entrada via NF Chave (${chaveNf}) — Vinculado à posição ${selectedLocation} e incrementado`,
        codProduto: tempProduct.codProduto,
        produtoDescricao: `${tempProduct.descricao} (${tempProduct.marca})`,
        quantidade: tempProduct.quantidade,
        usuario: "Operador Almoxarifado",
        dataHora: new Date().toISOString()
      };
      setMovements((prev) => [newMov, ...prev]);

      alert("Produto localizado e atualizado! Nova posição física sincronizada.");
    } else {
      // Inserção de registro inédito completa
      const finalizedProduct = {
        ...tempProduct,
        localizacao: selectedLocation
      };

      setProducts((prev) => [finalizedProduct, ...prev]);

      const newMov = {
        id: "mov-" + Date.now(),
        tipo: "Entrada NF",
        descricao: `Entrada de novo item via NF Chave (${chaveNf}) — Alocado na posição ${selectedLocation}`,
        codProduto: finalizedProduct.codProduto,
        produtoDescricao: `${finalizedProduct.descricao} (${finalizedProduct.marca})`,
        quantidade: finalizedProduct.quantidade,
        usuario: "Operador Almoxarifado",
        dataHora: new Date().toISOString()
      };
      setMovements((prev) => [newMov, ...prev]);

      alert(`Item cadastrado com sucesso!\nCód. Interno Gerado: #${finalizedProduct.codInterno}\nLocalização: ${finalizedProduct.localizacao}`);
    }

    // Sela a Nota Fiscal no estado impedindo reuso em transações subsequentes
    setNotasProcessadas((prev) => [...prev, trimmedChave]);

    // Limpeza operacional completa de formulários e estados temporários
    setChaveNf("");
    setDescricao("");
    setMarca("");
    setCodProduto("");
    setFamilia("");
    setQuantidade(5);
    setIsFetched(false);
    setShowLocationModal(false);
    setTempProduct(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
          Entrada de Nota Fiscal (XML)
        </h2>
        <p className="text-sm text-gray-600">
          Simule a importação de Notas Fiscais eletrônicas por meio da chave de acesso e realize a triagem logística de novos itens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel de Busca/Chave */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider flex items-center space-x-2">
            <FileText size={16} className="text-orange-500" />
            <span>Chave de Acesso</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase">
              Chave de Acesso ou Atalho de Teste
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: 1111, 2222 ou a Chave Completa"
                value={chaveNf}
                onChange={(e) => setChaveNf(e.target.value)}
                maxLength={44}
                className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
            <p className="text-[10px] text-gray-400">
              Clique <span className="font-bold text-orange-600 cursor-pointer underline hover:text-orange-700" onClick={() => setChaveNf("35260600012345678901234567890123456789012345")}>aqui</span> para preencher o código de simulação padrão.
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

        {/* Formulário de Importação */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider mb-5 pb-2 border-b border-gray-100">
            Dados do Produto Recebido
          </h3>

          <form onSubmit={handleConfirmarEntrada} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Descrição do Item
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rolamento de Esfera"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  disabled={!isFetched}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Marca
                </label>
                <input
                  type="text"
                  placeholder="Ex: TIMKEN"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  disabled={!isFetched}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Código do Produto (Fabricante)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 6205-2RS"
                  value={codProduto}
                  onChange={(e) => setCodProduto(e.target.value)}
                  disabled={!isFetched}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Família / Grupo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Peças"
                  value={familia}
                  onChange={(e) => setFamilia(e.target.value)}
                  disabled={!isFetched}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Quantidade Recebida (Unidades)
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  disabled={!isFetched}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFetched}
                className="w-full md:w-auto px-6 py-3 bg-gray-950 text-white font-bold uppercase text-xs rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CheckCircle2 size={16} className="text-orange-500" />
                <span>Confirmar Entrada & Definir Localização</span>
              </button>
            </div>
          </form>

        </div>

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