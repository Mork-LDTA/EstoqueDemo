import React, { useState } from "react";
import { 
  Wrench, 
  User, 
  Cpu, 
  AlertCircle,
  FileCheck,
  Calendar
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

  // Mensagens de Erro e Sucesso
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Obter o produto selecionado
  const selectedProduct = products.find(p => p.id === selectedProductId);

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

    // Limpar Formulário e dar Feedback
    setSolicitante("");
    setRecebedor("");
    setEquipamento("");
    setProblema("");
    setSelectedProductId("");
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
                  placeholder="Ex: Carlos Silva (Manutenção)"
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
                  placeholder="Ex: Marcos Lima (Produção)"
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
                  <span>Equipamento de Destino</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Transportador T-10"
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              {/* Seleção do Produto */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Produto para Retirada
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-950 px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                >
                  <option value="">Selecione um item...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.quantidade <= 0}>
                      {p.descricao} ({p.marca}) — #{p.codInterno} [Disponível: {p.quantidade}]
                    </option>
                  ))}
                </select>
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
                <span>Data/Hora da OS (Automática):</span>
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
                      <span className="text-orange-600 font-mono">{os.id}</span>
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
