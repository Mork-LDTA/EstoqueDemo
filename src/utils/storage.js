// Utility helper for localStorage operations and data seeding

const SEED_PRODUCTS = [
  {
    id: "prod-1",
    descricao: "Rolamento de Agulha",
    marca: "TIMKEN",
    codProduto: "HK2016",
    codInterno: 1084,
    familia: "Peças",
    localizacao: "P1-A1",
    quantidade: 10,
  },
  {
    id: "prod-2",
    descricao: "Rolamento de Esfera",
    marca: "SKF",
    codProduto: "6203-2RS",
    codInterno: 3942,
    familia: "Peças",
    localizacao: "P1-B2",
    quantidade: 2, // Low stock (< 3) to trigger alerts
  },
  {
    id: "prod-3",
    descricao: "Retentor Nitrílico",
    marca: "SABÓ",
    codProduto: "00213-BR",
    codInterno: 7541,
    familia: "Retentores",
    localizacao: "P1-D3",
    quantidade: 15,
  },
  {
    id: "prod-4",
    descricao: "Acoplamento Elástico",
    marca: "VULKAN",
    codProduto: "Vulkardan-F",
    codInterno: 9182,
    familia: "Acoplamentos",
    localizacao: "P1-C1",
    quantidade: 1, // Low stock (< 3) to trigger alerts
  },
  {
    id: "prod-5",
    descricao: "Filtro de Combustível Separador Racor",
    marca: "Mann Filter",
    codProduto: "PL420X",
    codInterno: 5001,
    familia: "FILTROS",
    localizacao: "P1-A1",
    quantidade: 8
  },
  {
    id: "prod-6",
    descricao: "Bolsa da Suspensão Pneumática Traseira Scania",
    marca: "Firestone",
    codProduto: "1T15MP-9",
    codInterno: 5002,
    familia: "SUSPENSÃO",
    localizacao: "P2-A2",
    quantidade: 4
  },
  {
    id: "prod-7",
    descricao: "Tambor de Freio Traseiro Volvo FH",
    marca: "Fras-le",
    codProduto: "T-204",
    codInterno: 5003,
    familia: "FREIOS",
    localizacao: "P2-B1",
    quantidade: 6
  },
  {
    id: "prod-8",
    descricao: "Compressor de Ar do Motor",
    marca: "Wabco",
    codProduto: "9111535100",
    codInterno: 5004,
    familia: "MOTOR",
    localizacao: "P1-C2",
    quantidade: 2
  },
  {
    id: "prod-9",
    descricao: "Unidade Injetora de Combustível Bosch",
    marca: "Bosch",
    codProduto: "0414701007",
    codInterno: 5005,
    familia: "SISTEMA INJETOR",
    localizacao: "P1-D1",
    quantidade: 5
  },
  {
    id: "prod-10",
    descricao: "Filtro de Óleo Lubrificante Motor",
    marca: "Donaldson",
    codProduto: "P550388",
    codInterno: 5006,
    familia: "FILTROS",
    localizacao: "P1-A2",
    quantidade: 12
  },
  {
    id: "prod-11",
    descricao: "Jogo de Pastilhas de Freio Dianteiro",
    marca: "Fras-le",
    codProduto: "PD/193",
    codInterno: 5007,
    familia: "FREIOS",
    localizacao: "P2-B2",
    quantidade: 10
  },
  {
    id: "prod-12",
    descricao: "Amortecedor Cabine Dianteiro Volvo",
    marca: "Sachs",
    codProduto: "311904",
    codInterno: 5008,
    familia: "SUSPENSÃO",
    localizacao: "P2-A3",
    quantidade: 7
  },
  {
    id: "prod-13",
    descricao: "Bico Injetor Common Rail",
    marca: "Bosch",
    codProduto: "0445120007",
    codInterno: 5009,
    familia: "SISTEMA INJETOR",
    localizacao: "P1-D2",
    quantidade: 4
  },
  {
    id: "prod-14",
    descricao: "Filtro de Ar Primário Motor",
    marca: "Mann Filter",
    codProduto: "C30850",
    codInterno: 5010,
    familia: "FILTROS",
    localizacao: "P1-A3",
    quantidade: 15
  },
  {
    id: "prod-15",
    descricao: "Válvula de Controle de Freio ABS",
    marca: "Wabco",
    codProduto: "4721950180",
    codInterno: 5011,
    familia: "FREIOS",
    localizacao: "P2-C1",
    quantidade: 3
  },
  {
    id: "prod-16",
    descricao: "Mola Mestra Suspensão Traseira",
    marca: "Suspensys",
    codProduto: "M-4809",
    codInterno: 5012,
    familia: "SUSPENSÃO",
    localizacao: "P2-A4",
    quantidade: 5
  },
  {
    id: "prod-17",
    descricao: "Bronzina de Biela STD",
    marca: "Mahle",
    codProduto: "H704/6",
    codInterno: 5013,
    familia: "MOTOR",
    localizacao: "P1-C3",
    quantidade: 8
  },
  {
    id: "prod-18",
    descricao: "Filtro Hidráulico Direção Assistida",
    marca: "Donaldson",
    codProduto: "P550386",
    codInterno: 5014,
    familia: "FILTROS",
    localizacao: "P1-A4",
    quantidade: 14
  },
  {
    id: "prod-19",
    descricao: "Lona de Freio Traseiro com Rebites",
    marca: "Fras-le",
    codProduto: "CA/32",
    codInterno: 5015,
    familia: "FREIOS",
    localizacao: "P2-B3",
    quantidade: 9
  }
];

const SEED_OS = [
  {
    id: "OS-1001",
    solicitante: "Carlos Silva (Manutenção)",
    recebedor: "Marcos Lima (Produção)",
    equipamento: "Transportador T-10",
    problema: "Desgaste prematuro e ruído excessivo no rolamento do mancal",
    codProduto: "6203-2RS",
    produtoDescricao: "Rolamento de Esfera (SKF)",
    aplicacao: "Substituição de item avariado",
    dataHora: new Date().toISOString(), // Today
  },
  {
    id: "OS-1002",
    solicitante: "Amanda Sousa (Mecânica)",
    recebedor: "Ronaldo Alves (Elétrica)",
    equipamento: "Bomba Centrífuga B-200",
    problema: "Vazamento de fluido pelo eixo traseiro",
    codProduto: "00213-BR",
    produtoDescricao: "Retentor Nitrílico (SABÓ)",
    aplicacao: "Manutenção preventiva periódica",
    dataHora: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  },
];

const SEED_MOVEMENTS = [
  {
    id: "mov-1",
    tipo: "Entrada NF",
    descricao: "Entrada de item via NF (Chave: 35260600000000000000000000000000000000001234)",
    codProduto: "6203-2RS",
    produtoDescricao: "Rolamento de Esfera (SKF 6203-2RS)",
    quantidade: 5,
    usuario: "Painel Entrada NF",
    dataHora: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mov-2",
    tipo: "Saída OS",
    descricao: "Retirada de 3 peças para OS-1001 (Equipamento: Transportador T-10)",
    codProduto: "6203-2RS",
    produtoDescricao: "Rolamento de Esfera (SKF 6203-2RS)",
    quantidade: 3,
    usuario: "Carlos Silva (Manutenção)",
    dataHora: new Date().toISOString(),
  },
];

export function getStorageData() {
  if (typeof window === "undefined") {
    return { products: SEED_PRODUCTS, osList: SEED_OS, movements: SEED_MOVEMENTS };
  }

  let products = localStorage.getItem("estoque_products");
  let osList = localStorage.getItem("estoque_os");
  let movements = localStorage.getItem("estoque_movements");

  if (!products) {
    localStorage.setItem("estoque_products", JSON.stringify(SEED_PRODUCTS));
    products = JSON.stringify(SEED_PRODUCTS);
  } else {
    try {
      const parsedProducts = JSON.parse(products);
      if (parsedProducts.length < SEED_PRODUCTS.length) {
        localStorage.setItem("estoque_products", JSON.stringify(SEED_PRODUCTS));
        products = JSON.stringify(SEED_PRODUCTS);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!osList) {
    localStorage.setItem("estoque_os", JSON.stringify(SEED_OS));
    osList = JSON.stringify(SEED_OS);
  }
  if (!movements) {
    localStorage.setItem("estoque_movements", JSON.stringify(SEED_MOVEMENTS));
    movements = JSON.stringify(SEED_MOVEMENTS);
  }

  return {
    products: JSON.parse(products),
    osList: JSON.parse(osList),
    movements: JSON.parse(movements),
  };
}

export function saveStorageData(products, osList, movements) {
  if (typeof window === "undefined") return;
  localStorage.setItem("estoque_products", JSON.stringify(products));
  localStorage.setItem("estoque_os", JSON.stringify(osList));
  localStorage.setItem("estoque_movements", JSON.stringify(movements));
}
