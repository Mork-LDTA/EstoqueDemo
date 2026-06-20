import React, { useState } from "react";
import {
  LayoutDashboard,
  FileInput,
  PlusCircle,
  Package,
  SearchCode,
  Wrench,
  BarChart3,
  Factory,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, theme, toggleTheme }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Painel de Controle", icon: LayoutDashboard },
    { id: "nf-entrada", label: "Entrada de Nota Fiscal", icon: FileInput },
    { id: "cadastro-manual", label: "Cadastro Manual", icon: PlusCircle },
    { id: "estoque", label: "Estoque e Prateleira", icon: Package },
    { id: "rastrear-nf", label: "Rastrear NF", icon: SearchCode },
    { id: "ordem-servico", label: "Ordem de Serviço", icon: Wrench },
    { id: "relatorios", label: "Histórico e Relatórios", icon: BarChart3 },
  ];

  return (
    <>
      {/* 1. MOBILE TOP HEADER */}
      <header className="md:hidden w-full bg-gray-950 text-white flex items-center justify-between px-4 py-3 border-b border-gray-800 z-30">
        <div className="flex items-center space-x-2">
          <div className="bg-orange-500 p-1.5 rounded-lg text-black">
            <Factory size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider text-white">
              FX<span className="text-orange-500">Minas</span>
            </h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
              Almoxarifado
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Toggle Theme */}
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* 2. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-gray-950 text-white flex-col border-r border-gray-800 h-screen sticky top-0">
        {/* Brand/Logo */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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

          {/* Toggle Button */}
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all cursor-pointer flex items-center justify-center animate-in fade-in"
              title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
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

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-950 border-t border-gray-800 flex justify-around items-center text-white z-40 px-2 shadow-lg">
        <button
          onClick={() => setActiveTab("estoque")}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "estoque" ? "text-orange-500 font-bold" : "text-gray-400"
          }`}
        >
          <Package size={20} className={activeTab === "estoque" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[10px] mt-1">Estoque</span>
        </button>

        <button
          onClick={() => setActiveTab("rastrear-nf")}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "rastrear-nf" ? "text-orange-500 font-bold" : "text-gray-400"
          }`}
        >
          <SearchCode size={20} className={activeTab === "rastrear-nf" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[10px] mt-1">Rastrear NF</span>
        </button>

        <button
          onClick={() => setActiveTab("ordem-servico")}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "ordem-servico" ? "text-orange-500 font-bold" : "text-gray-400"
          }`}
        >
          <Wrench size={20} className={activeTab === "ordem-servico" ? "stroke-[2.5]" : "stroke-[1.8]"} />
          <span className="text-[10px] mt-1">Abrir OS</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1.5 text-xs font-semibold text-gray-400 active:text-white transition-all"
        >
          <Menu size={20} className="stroke-[1.8]" />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </div>

      {/* 4. MOBILE DRAWER OVERLAY */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        />

        {/* Sidebar content sliding from the left */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-72 bg-gray-950 text-white flex flex-col border-r border-gray-800 transition-transform duration-300 ease-out transform ${
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header of Drawer */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-500 p-1.5 rounded-lg text-black">
                <Factory size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wider text-white">
                  FX<span className="text-orange-500">Minas</span>
                </h1>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsDrawerOpen(false); // Fechar drawer ao selecionar
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold"
                      : "text-gray-400 hover:text-white hover:bg-gray-900"
                  }`}
                >
                  <Icon size={16} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-900 bg-black/40 text-[10px] text-gray-500">
            <div className="flex justify-between items-center mb-1">
              <span>Status do Sistema:</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-[9px] text-gray-600 font-mono">
              V1.0.0-MVP (Local Mode)
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
