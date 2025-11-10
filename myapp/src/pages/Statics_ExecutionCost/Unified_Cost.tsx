import React from "react";
import AdvancedTable from "../../components/bodytable";
import "../../components/bodytable.css";
import PencilButton from "../../components/PencilButtons";
import Material_Unified_Cost from "../../layout/KHSX_VL";
import Layout from "../../layout/layout_filter";
import Materials_Ingredient_Edit from "../UnitPrice/Materials_Ingredient_Input";
import MaterialsCostInput from "./Materials_Cost_Input";

const Unified_Cost: React.FC = () => {
  const columns = [
    "STT",
    "Mã sản phẩm",
    "Mã nhóm công đoạn",
    "Sản lượng kế hoạch",
    "Thời gian hiệu lực",
    "Chi phí kế hoạch",
    "Sửa",
  ];
  const columnWidths = [6, 10, 26, 40, 20, 25, 5];

  const dataRows = [
    {
      id: 1,
      ma: "TN01",
      macd: "DL",
      sanluong: 1000,
      thoigian: "1/1/2025-30/1/2025",
      chiphi: 500000000,
    },
    {
      id: 2,
      ma: "KD01",
      macd: "L1",
      sanluong: 2000,
      thoigian: "1/2/2025-28/2/2025",
      chiphi: 800000000,
    },
    {
      id: 3,
      ma: "EBH52",
      macd: "L2",
      sanluong: 1500,
      thoigian: "1/3/2025-31/3/2025",
      chiphi: 600000000,
    },
  ];

  const data = dataRows.map((row) => [
    row.id,
    row.ma,
    row.macd,
    row.sanluong,
    row.thoigian,
    row.chiphi.toLocaleString(),
    <PencilButton id={row.id} editElement={<Materials_Ingredient_Edit />} />,
  ]);

  const subRows = [
    {
      label: "Kế hoạch vật liệu ban đầu",
      validityPeriod: "1/1/2025-30/1/2025",
      detailComponent: <Material_Unified_Cost />,
      editComponent: <Materials_Ingredient_Edit onClose={() => {}} />,
      createComponent: <MaterialsCostInput onClose={() => {}} />,
    },
    {
      label: "Kế hoạch SCTX ban đầu",
      validityPeriod: "1/1/2025-30/1/2025",
      detailComponent: <Material_Unified_Cost />,
      editComponent: <Materials_Ingredient_Edit onClose={() => {}} />,
      createComponent: <MaterialsCostInput onClose={() => {}} />,
    },
    {
      label: "Kế hoạch điện năng ban đầu",
      validityPeriod: "1/1/2025-30/1/2025",
      detailComponent: <Material_Unified_Cost />,
      editComponent: <Materials_Ingredient_Edit onClose={() => {}} />,
      createComponent: <MaterialsCostInput onClose={() => {}} />,
    },
    {
      label: "Kế hoạch vật liệu ban đầu",
      validityPeriod: "1/2/2025-28/2/2025",
      detailComponent: <Material_Unified_Cost />,
      editComponent: <Materials_Ingredient_Edit onClose={() => {}} />,
      createComponent: <MaterialsCostInput onClose={() => {}} />,
    },
    {
      label: "Kế hoạch SCTX ban đầu",
      validityPeriod: "1/2/2025-28/2/2025",
      detailComponent: <Material_Unified_Cost />,
      editComponent: <Materials_Ingredient_Edit onClose={() => {}} />,
      createComponent: <MaterialsCostInput onClose={() => {}} />,
    },
    {
      label: "Kế hoạch điện năng ban đầu",
      validityPeriod: "1/2/2025-28/2/2025",
      detailComponent: <Material_Unified_Cost />,
      editComponent: <Materials_Ingredient_Edit onClose={() => {}} />,
      createComponent: <MaterialsCostInput onClose={() => {}} />,
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        <AdvancedTable
          title01="Thống kê vận hành  /  Kế hoạch sản xuất ban đầu"
          title="Kế hoạch sản xuất ban đầu"
          columns={columns}
          columnWidths={columnWidths}
          data={data}
          createElement={<MaterialsCostInput />}
          columnLefts={["undefined", "undefined", "undefined", "undefined"]}
          variant="cost"
          subRows={subRows}
        />
      </div>
    </Layout>
  );
};

export default Unified_Cost;
