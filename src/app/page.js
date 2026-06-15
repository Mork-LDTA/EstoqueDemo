"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import NFEntrada from "@/components/NFEntrada";
import EstoquePrateleira from "@/components/EstoquePrateleira";
import OrdemServico from "@/components/OrdemServico";
import Relatorios from "@/components/Relatorios";
import CadastroManual from "@/components/CadastroManual";
import { getStorageData, saveStorageData } from "@/utils/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [osList, setOsList] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  // Carregar dados e preferência de tema ao montar
  useEffect(() => {
    const data = getStorageData();
    setProducts(data.products);
    setOsList(data.osList);
    setMovements(data.movements);
    setIsMounted(true);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Monitorar alterações no tema e persistir/aplicar classe dark
  useEffect(() => {
    if (isMounted) {
      const root = window.document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    }
  }, [theme, isMounted]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // Salvar no localStorage sempre que houver alteração nos estados
  useEffect(() => {
    if (isMounted) {
      saveStorageData(products, osList, movements);
    }
  }, [products, osList, movements, isMounted]);

  // Tela de carregamento enquanto o Next.js resolve a montagem no cliente
  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Inicializando Terminal Logístico...
          </span>
        </div>
      </div>
    );
  }

  // Renderizar o conteúdo correto com base na aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            products={products}
            osList={osList}
            movements={movements}
            setActiveTab={setActiveTab}
          />
        );
      case "nf-entrada":
        return (
          <NFEntrada
            products={products}
            setProducts={setProducts}
            movements={movements}
            setMovements={setMovements}
          />
        );
      case "cadastro-manual":
        return (
          <CadastroManual
            products={products}
            setProducts={setProducts}
            movements={movements}
            setMovements={setMovements}
          />
        );
      case "estoque":
        return (
          <EstoquePrateleira
            products={products}
            setProducts={setProducts}
            setMovements={setMovements}
          />
        );
      case "ordem-servico":
        return (
          <OrdemServico
            products={products}
            setProducts={setProducts}
            osList={osList}
            setOsList={setOsList}
            movements={movements}
            setMovements={setMovements}
          />
        );
      case "relatorios":
        return <Relatorios movements={movements} products={products} />;
      default:
        return (
          <div className="bg-white border border-gray-200 p-8 rounded-xl text-center text-gray-500">
            Painel indisponível.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50 transition-colors duration-200 overflow-hidden">
      {/* Barra de Navegação Lateral */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      {/* Conteúdo Principal da SPA */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6 md:p-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
