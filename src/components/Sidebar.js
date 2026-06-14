import React from "react";
import { 
  LayoutDashboard, 
  FileInput, 
  PlusCircle,
  Package, 
  Wrench, 
  BarChart3,
  Factory
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "dashboard", label: "Painel de Controle", icon: LayoutDashboard },
    { id: "nf-entrada", label: "Entrada de Nota Fiscal", icon: FileInput },
    { id: "cadastro-manual", label: "Cadastro Manual", icon: PlusCircle },
    { id: "estoque", label: "Estoque e Prateleira", icon: Package },
    { id: "ordem-servico", label: "Ordem de Serviço", icon: Wrench },
    { id: "relatorios", label: "Histórico e Relatórios", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-gray-950 text-white flex flex-col border-r border-gray-800 h-screen sticky top-0">
      {/* Brand/Logo */}
      <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
        <div className="bg-orange-500 p-2 rounded-lg text-black">
          <Factory size={24} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-wider text-white">
            FX<span className="text-orange-500">Minas</span>
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Painel de Controle
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold"
                  : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`}
            >
              <Icon size={18} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-gray-900 bg-black/40 text-xs text-gray-500">
        <div className="flex justify-between items-center mb-1">
          <span>Status do Sistema:</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div className="text-[10px] text-gray-600 font-mono">
          V1.0.0-MVP (Local Mode)
        </div>
      </div>
    </aside>
  );
}
