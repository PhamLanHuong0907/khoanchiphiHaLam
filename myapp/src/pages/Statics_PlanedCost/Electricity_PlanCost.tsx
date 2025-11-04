import React from "react";
import Layout from "../../layout/layout_filter";
import AdvancedTable from "../../components/bodytable";
import PencilButton from "../../components/PencilButtons";
import EyeToggle from "../../components/eye";
import Materials_Ingredient_Grouped from "../../layout/test";
import Materials_Ingredient_Edit from "../UnitPrice/Materials_Ingredient_Input";
import Materials_Ingredient_Input from "../UnitPrice/Materials_Ingredient_Input";
import Electric_PlanPrice from "../../layout/CPDN_KH";
const Electricity_PlanCost: React.FC = () => {
  const columns = [
    "STT",
    "Mã chi phí điện năng kế hoạch",
    "Xem",
    "Sửa",
  ];

  const columnWidths = [
    6, 93,3,4
  ];
  const items = [
    { label: "Chi phí vật liệu kế hoạch", path: "/MaterialsPlanCost" },
    { label: "Chi phí SCTX kế hoạch", path: "/RepairsPlanCost" },
    { label: "Chi phí điện năng kế hoạch", path: "/ElectricityPlanCost" },
  ];

  // ✅ Dữ liệu gốc
  const dataRows = [
    {
      id: "1",
      ma: "TN01",
    },
    {
      id: "2",
      ma: "KD01",
    },
    {
      id: "3",
      ma: "EBH52",
    },
  ];

  // ✅ Map dataRows => data (giống file mẫu)
  const data = dataRows.map((row) => [
    row.id,
    row.ma,
    <EyeToggle detailComponent={<Electric_PlanPrice/>}/>,
    <PencilButton id={row.id} editElement={<Materials_Ingredient_Edit/>}/>,
  ]);
  return (
    <Layout>
      <div className="p-6">
        <AdvancedTable
          title01="Thống kê vận hành  /  Chi phí kế hoạch  /  Chi phí điện năng kế hoạch"
          title="Chi phí kế hoạch"
          columns={columns}
          columnWidths={columnWidths}
          data={data}
          createElement={<Materials_Ingredient_Input/>}
          navbarMiniItems={items}
          columnLefts={['undefined','undefined','undefined','undefined']}
        />
      </div>
    </Layout>
  );
};

export default Electricity_PlanCost;
