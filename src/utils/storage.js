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
