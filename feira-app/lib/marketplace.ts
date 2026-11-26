export const categorias = [
  "Moda e roupas",
  "Eletrônicos",
  "Casa e decoração",
  "Veículos",
  "Beleza",
  "Pets",
  "Serviços",
  "Games",
  "Esportes",
  "Brinquedos",
  "Acessórios",
  "Outros",
];

export const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

export type Anuncio = {
  id: string;
  vendedor_id: string;
  titulo: string;
  preco: number;
  categoria: string;
  estado: string;
  cidade: string;
  descricao: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};
