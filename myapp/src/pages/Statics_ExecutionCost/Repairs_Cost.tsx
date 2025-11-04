import React from "react";
import Layout from "../../layout/layout_filter";
import AdvancedTable from "../../components/bodytable";
import PencilButton from "../../components/PencilButtons";
import EyeToggle from "../../components/eye";
import Materials_Ingredient_Edit from "../UnitPrice/Materials_Ingredient_Input";
import SCTX_Price from "../../layout/CPSCTX_TH";
import RepairsCostInput from "./Repairs_Cost_Input";
const Repairs_Cost: React.FC = () => {
  const columns = [
    "STT",
    "Mã chi phí SCTX thực hiện",
    "Xem",
    "Sửa",
  ];

  const columnWidths = [
    6, 93,3,4
  ];
  const items = [
    { label: "Chi phí vật liệu thực hiện", path: "/MaterialsCost" },
    { label: "Chi phí SCTX thực hiện", path: "/RepairsCost" },
    { label: "Chi phí điện năng thực hiện", path: "/ElectricityCost" },
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
    <EyeToggle detailComponent={<SCTX_Price/>}/>,
    <PencilButton id={row.id} editElement={<Materials_Ingredient_Edit/>}/>,
  ]);
  return (
    <Layout>
      <div className="p-6">
        <AdvancedTable
          title01="Thống kê vận hành  /  Chi phí thực hiện  /  Chi phí SCTX thực hiện"
          title="Chi phí thực hiện"
          columns={columns}
          columnWidths={columnWidths}
          data={data}
          createElement={<RepairsCostInput/>}
          navbarMiniItems={items}
          columnLefts={['undefined','undefined','undefined','undefined']}
        />
      </div>
    </Layout>
  );
};

export default Repairs_Cost;
