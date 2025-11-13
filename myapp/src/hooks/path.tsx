//Import path và đường dẫn path của tất cả vào đây, rồi gọi path theo biến của file này
// ================================
// 🔗 FILE: src/constants/paths.tsx
// Dùng để quản lý toàn bộ đường dẫn (path) của hệ thống
// ================================

// eslint-disable-next-line react-refresh/only-export-components
export const PATHS = {
  HOME: "/",
  HOME_ALT: "/Home",

  // === Categories ===
  UNIT: {
    LIST: "/Unit",
    INPUT: "/Unit/Input",
    EDIT: (id: string | number) => `/Unit/Edit/${id}`,
  },

  PRODUCTION_STEP_GROUP: {
    LIST: "/ProductionStepGroup",
    INPUT: "/ProductionStepGroup/Input",
    EDIT: (id: string | number) => `/ProductionStepGroup/Edit/${id}`,
  },

  PRODUCTION_STEP: {
    LIST: "/ProductionStep",
    INPUT: "/ProductionStep/Input",
    EDIT: (id: string | number) => `/ProductionStep/Edit/${id}`,
  },

  WORK_CODE: {
    LIST: "/WorkCode",
    INPUT: "/WorkCode/Input",
    EDIT: (id: string | number) => `/WorkCode/Edit/${id}`,
  },

  MATERIALS: {
    LIST: "/Materials",
    INPUT: "/Materials/Input",
    EDIT: (id: string | number) => `/Materials/Edit/${id}`,
  },

  EQUIPMENT: {
    LIST: "/Equipment",
    INPUT: "/Equipment/Input",
    EDIT: (id: string | number) => `/Equipment/Edit/${id}`,
  },

  SPARE_PARTS: {
    LIST: "/SpareParts",
    INPUT: "/SpareParts/Input",
    EDIT: (id: string | number) => `/SpareParts/Edit/${id}`,
  },

  PRODUCTS: {
    LIST: "/Products",
    INPUT: "/Products/Input",
    EDIT: (id: string | number) => `/Products/Edit/${id}`,
  },

  ADJUSTMENT_FACTORS_01: {
    LIST: "/AdjustmentFactors01",
    INPUT: "/AdjustmentFactors01/Input",
    EDIT: (id: string | number) => `/AdjustmentFactors01/Edit/${id}`,
  },

  ADJUSTMENT_FACTORS_02: {
    LIST: "/AdjustmentFactors02",
    INPUT: "/AdjustmentFactors02/Input",
    EDIT: (id: string | number) => `/AdjustmentFactors02/Edit/${id}`,
  },

  SPECIFICATION_01: {
    LIST: "/Specification01",
    INPUT: "/Specification01/Input",
    EDIT: (id: string | number) => `/Specification01/Edit/${id}`,
  },

  SPECIFICATION_02: {
    LIST: "/Specification02",
    INPUT: "/Specification02/Input",
    EDIT: (id: string | number) => `/Specification02/Edit/${id}`,
  },

  SPECIFICATION_03: {
    LIST: "/Specification03",
    INPUT: "/Specification03/Input",
    EDIT: (id: string | number) => `/Specification03/Edit/${id}`,
  },

  SPECIFICATION_04: {
    LIST: "/Specification04",
    INPUT: "/Specification04/Input",
    EDIT: (id: string | number) => `/Specification04/Edit/${id}`,
  },

  SPECIFICATION_05: {
    LIST: "/Specification05",
    INPUT: "/Specification05/Input",
    EDIT: (id: string | number) => `/Specification05/Edit/${id}`,
  },

  // === Unit Price ===
  MATERIALS_INGREDIENT: {
    LIST: "/MaterialsIngredient",
    INPUT: "/MaterialsIngredient/Input",
    EDIT: (id: string | number) => `/MaterialsIngredient/Edit/${id}`,
  },

  REPAIRS: {
    LIST: "/Repairs",
    INPUT: "/Repairs/Input",
    EDIT: (id: string | number) => `/Repairs/Edit/${id}`,
  },

  SLIDE_RAILS: {
    LIST: "/SlideRails",
    INPUT: "/SlideRails/Input",
    EDIT: (id: string | number) => `/SlideRails/Edit/${id}`,
  },
  ELECTRIC_RAILS: {
    LIST: "/ElectricRails",
    INPUT: "/ElectricRails/Input",
    EDIT: (id: string | number) => `/ElectricRails/Edit/${id}`,
  },
  MARKET_RAILS: {
    LIST: "/MarketRails",
    INPUT: "/MarketRails/Input",
    EDIT: (id: string | number) => `/MarketRails/Edit/${id}`,
  },
  MATERIALS_COST: {
    LIST: "/MaterialsCost",
    INPUT: "/MaterialsCost/Input",
    EDIT: (id: string | number) => `/MaterialsCost/Edit/${id}`,
  },
  UNIFIED_COST: {
    LIST: "/UnifiedCost",
    INPUT: "/UnifiedCost/Input",
    EDIT: (id: string | number) => `/UnifiedCost/Edit/${id}`,
  },
  UNIFIED_OPERATION_COST: {
    LIST: "/UnifiedOperationCost",
    INPUT: "/UnifiedOperationCost/Input",
    EDIT: (id: string | number) => `/UnifiedOperationCost/Edit/${id}`,
  },
  REPAIRS_COST: {
    LIST: "/RepairsCost",
    INPUT: "/RepairsCost/Input",
    EDIT: (id: string | number) => `/RepairsCost/Edit/${id}`,
  },
  ELECTRICITY_COST: {
    LIST: "/ElectricityCost",
    INPUT: "/ElectricityCost/Input",
    EDIT: (id: string | number) => `/ElectricityCost/Edit/${id}`,
  },
  MATERIALS_PLANCOST: {
    LIST: "/MaterialsPlanCost",
    INPUT: "/MaterialsPlanCost/Input",
    EDIT: (id: string | number) => `/MaterialsPlanCost/Edit/${id}`,
  },
  REPAIRS_PLANCOST: {
    LIST: "/RepairsPlanCost",
    INPUT: "/RepairsPlanCost/Input",
    EDIT: (id: string | number) => `/RepairsPlanCost/Edit/${id}`,
  },
  ELECTRICITY_PLANCOST: {
    LIST: "/ElectricityPlanCost",
    INPUT: "/ElectricityPlanCost/Input",
    EDIT: (id: string | number) => `/ElectricityPlanCost/Edit/${id}`,
  },
};

export default PATHS;
