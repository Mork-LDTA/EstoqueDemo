import React from "react";
import { 
  Package, 
  Wrench, 
  AlertTriangle, 
  Activity, 
  MapPin, 
  ArrowUpRight 
} from "lucide-react";

export default function Dashboard({ products, osList, movements, setActiveTab }) {
  // Calculando as métricas
  const totalStockQuantity = products.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
  const totalUniqueItems = products.length;
  
  // OS abertas hoje
  const todayStr = new Date().toISOString().split("T")[0];
  const osToday = osList.filter(os => {
    if (!os.dataHora) return false;
    return os.dataHora.startsWith(todayStr);
  });
  const totalOsToday = osToday.length;

  // Itens com baixa de estoque (quantidade < 3)
  const lowStockItems = products.filter(p => (Number(p.quantidade) || 0) < 3);

  // Últimas movimentações (limitar a 4)
  const recentMovements = [...movements]
    .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight">
            Painel Geral de Controle
          </h2>
          <p className="text-sm text-gray-600">
            Visão geral em tempo real das operações e status do estoque industrial.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
          <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          <span>Atualizado às {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Itens no Estoque (Total peças) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total de Peças em Estoque
            </span>
            <div className="text-3xl font-black text-gray-950">
              {totalStockQuantity}
            </div>
            <p className="text-xs text-gray-500">
              Soma total de todas as unidades
            </p>
          </div>
          <div className="bg-gray-100 p-2.5 rounded-lg text-gray-700">
            <Package size={22} />
          </div>
        </div>

        {/* Itens Cadastrados (Únicos) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Itens Únicos Cadastrados
            </span>
            <div className="text-3xl font-black text-gray-950">
              {totalUniqueItems}
            </div>
            <p className="text-xs text-gray-500">
              Tipos de produtos catalogados
            </p>
          </div>
          <div className="bg-gray-100 p-2.5 rounded-lg text-gray-700">
            <Activity size={22} />
          </div>
        </div>

        {/* OS Abertas Hoje */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Ordens de Serviço Hoje
            </span>
            <div className="text-3xl font-black text-gray-950 text-orange-600">
              {totalOsToday}
            </div>
            <p className="text-xs text-gray-500">
              Retiradas registradas nas últimas 24h
            </p>
          </div>
          <div className="bg-orange-50 p-2.5 rounded-lg text-orange-600 border border-orange-100">
            <Wrench size={22} />
          </div>
        </div>

        {/* Alertas de Estoque Baixo */}
        <div className={`border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between ${
          lowStockItems.length > 0 
            ? "bg-red-50 border-red-200 text-red-950" 
            : "bg-white border-gray-200"
        }`}>
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Alertas de Baixa
            </span>
            <div className={`text-3xl font-black ${lowStockItems.length > 0 ? "text-red-600" : "text-gray-950"}`}>
              {lowStockItems.length}
            </div>
            <p className="text-xs text-gray-500">
              Itens com estoque crítico (&lt; 3)
            </p>
          </div>
          <div className={`p-2.5 rounded-lg ${
            lowStockItems.length > 0 
              ? "bg-red-100 text-red-600 border border-red-200" 
              : "bg-gray-100 text-gray-700"
          }`}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Grid Central */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel de Alerta de Baixa de Estoque */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="text-orange-500 stroke-[2.2]" size={20} />
              <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider">
                Alerta de Baixa de Estoque
              </h3>
            </div>
            {lowStockItems.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase border border-red-200">
                Ação Requerida
              </span>
            )}
          </div>
          
          <div className="p-5 flex-1 space-y-4">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center space-y-2">
                <Package size={40} className="text-gray-300" />
                <p className="font-medium">Nenhum item com estoque baixo no momento.</p>
                <p className="text-xs">Todos os itens cadastrados estão acima da quantidade mínima.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-bold text-xs uppercase">
                      <th className="py-2.5">Cód. Interno</th>
                      <th className="py-2.5">Descrição / Marca</th>
                      <th className="py-2.5">Cód. Produto</th>
                      <th className="py-2.5 text-center">Localização</th>
                      <th className="py-2.5 text-right pr-2">Qtd</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors font-medium">
                        <td className="py-3 font-mono text-orange-600 text-xs font-bold">
                          #{item.codInterno}
                        </td>
                        <td className="py-3">
                          <div className="text-gray-950 font-bold">{item.descricao}</div>
                          <div className="text-xs text-gray-500">{item.marca}</div>
                        </td>
                        <td className="py-3 font-mono text-xs text-gray-600">{item.codProduto}</td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center space-x-1 bg-gray-100 border border-gray-200 text-gray-800 text-xs px-2.5 py-0.5 rounded font-bold">
                            <MapPin size={11} className="text-gray-500" />
                            <span>{item.localizacao || "N/A"}</span>
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-block bg-red-100 border border-red-200 text-red-700 font-black px-3 py-1 rounded text-sm min-w-[36px] text-center">
                            {item.quantidade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Movimentações */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-950 text-sm uppercase tracking-wider">
              Movimentações Recentes
            </h3>
            <button 
              onClick={() => setActiveTab("relatorios")} 
              className="text-xs text-orange-600 font-bold hover:underline flex items-center space-x-0.5"
            >
              <span>Ver todas</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="p-5 flex-1 divide-y divide-gray-100 space-y-4">
            {recentMovements.length === 0 ? (
              <p className="text-center py-10 text-xs text-gray-500">
                Nenhuma movimentação registrada.
              </p>
            ) : (
              recentMovements.map((mov) => {
                const isEntry = mov.tipo.includes("Entrada");
                return (
                  <div key={mov.id} className="pt-4 first:pt-0 flex flex-col space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isEntry 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}>
                        {mov.tipo}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(mov.dataHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">
                      {mov.produtoDescricao}
                    </p>
                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                      {mov.descricao}
                    </p>
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>Ref: {mov.codProduto}</span>
                      <span className="font-bold text-gray-600">Qtd: {mov.quantidade}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>



    </div>
  );
}
