import React, { useState } from "react";
import AdvancedTable from "../../components/bodytable";
import "../../components/bodytable.css";
import PencilButton from "../../components/PencilButtons";
import Material_Unified_Cost from "../../layout/KHSX_VL";
import Layout from "../../layout/layout_filter";
import InitialElectricityPlanInput from "./Initial_Electricity_Plan_Input";
import InitialMaterialPlanInput from "./Initial_Material_Plan_Input";
import InitialRepairPlanInput from "./Initial_Repair_Plan_Input";
import ProductCostInput from "./Product_Cost_Input";

const Unified_Cost: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const columns = [
    "STT",
    "Mã sản phẩm",
    "Tên sản phẩm",
    "Mã nhóm công đoạn",
    "Sản lượng kế hoạch",
    "Chi phí",
    "Thời gian",
    "Sửa",
  ];
  const columnWidths = [6, 11, 55, 15, 11, 15, 15, 5];

  const dataRows = [
    {
      id: 1,
      ma: "TN01",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      macd: "DL",
      sanluong: 1000,
      thoigian: "1/1/2025-30/1/2025",
      chiphi: 500000000,
      subRows: [
        // SubRows riêng cho sản phẩm TN01
        {
          label: "Chi phí vật liệu kế hoạch ban đầu",
          validityPeriod: "1/1/2025-30/1/2025",
          sanluong: 500,
          chiphi: 100000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: (
            <InitialMaterialPlanInput
              selectedId={1}
              isEditMode={true}
              subRowId="vl-1-202501"
            />
          ),
          createComponent: (
            <InitialMaterialPlanInput selectedId={1} subRowId="vl-1-202501" />
          ),
        },
        {
          label: "Chi phí SCTX kế hoạch ban đầu",
          validityPeriod: "1/1/2025-30/1/2025",
          sanluong: 500,
          chiphi: 100000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: (
            <InitialRepairPlanInput
              selectedId={1}
              isEditMode={true}
              subRowId="sctx-2025-01"
            />
          ),
          createComponent: (
            <InitialRepairPlanInput selectedId={1} subRowId="sctx-2025-01" />
          ),
        },
        {
          label: "Chi phí điện năng kế hoạch ban đầu",
          validityPeriod: "1/1/2025-30/1/2025",
          sanluong: 500,
          chiphi: 100000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: (
            <InitialElectricityPlanInput
              selectedId={1}
              isEditMode={true}
              subRowId="dn-2025-01"
            />
          ),
          createComponent: (
            <InitialElectricityPlanInput selectedId={1} subRowId="dn-2025-01" />
          ),
        },
        {
          label: "Chi phí vật liệu kế hoạch ban đầu",
          validityPeriod: "30/1/2025-28/2/2025",
          sanluong: 500,
          chiphi: 50000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: (
            <InitialMaterialPlanInput
              selectedId={1}
              subRowId="vl-1-202502"
              isEditMode={true}
            />
          ),
          createComponent: (
            <InitialMaterialPlanInput selectedId={1} subRowId="vl-1-202502" />
          ),
        },
        {
          label: "Chi phí SCTX kế hoạch ban đầu",
          validityPeriod: "30/1/2025-28/2/2025",
          sanluong: 500,
          chiphi: 50000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: (
            <InitialRepairPlanInput
              selectedId={1}
              isEditMode={true}
              subRowId="sctx-2025-02"
            />
          ),
          createComponent: (
            <InitialRepairPlanInput selectedId={1} subRowId="sctx-2025-02" />
          ),
        },
        {
          label: "Chi phí điện năng kế hoạch ban đầu",
          validityPeriod: "30/1/2025-28/2/2025",
          sanluong: 500,
          chiphi: 100000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: (
            <InitialElectricityPlanInput
              selectedId={1}
              subRowId="dn-2025-02"
              isEditMode={true}
            />
          ),
          createComponent: (
            <InitialElectricityPlanInput selectedId={1} subRowId="dn-2025-02" />
          ),
        },
      ],
    },
    {
      id: 2,
      ma: "KD01",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      macd: "L1",
      sanluong: 2000,
      thoigian: "1/2/2025-28/2/2025",
      chiphi: 800000000,
      subRows: [
        // SubRows riêng cho sản phẩm KD01
        {
          label: "Chi phí vật liệu kế hoạch ban đầu",
          validityPeriod: "1/2/2025-28/2/2025",
          sanluong: 1600,
          chiphi: 300000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: <InitialMaterialPlanInput selectedId={2} />,
          createComponent: <InitialMaterialPlanInput selectedId={2} />,
        },
        {
          label: "Chi phí SCTX kế hoạch ban đầu",
          validityPeriod: "1/2/2025-28/2/2025",
          sanluong: 1700,
          chiphi: 350000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: (
            <InitialRepairPlanInput selectedId={2} isEditMode={true} />
          ),
          createComponent: <InitialRepairPlanInput selectedId={2} />,
        },
        {
          label: "Chi phí điện năng kế hoạch ban đầu",
          validityPeriod: "1/2/2025-28/2/2025",
          sanluong: 1800,
          chiphi: 150000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: <InitialElectricityPlanInput selectedId={2} />,
          createComponent: <InitialElectricityPlanInput selectedId={2} />,
        },
      ],
    },
    {
      id: 3,
      ma: "EBH52",
      tensp:
        "Lò than 11-1.26 lò chống giá xích chiều dài lò than: 72 m. Các yếu tố TT bằng chiều dài 80 m. Chiều dày vỉa: 9.77 m . Tỷ lệ đá kẹp 23% có trải lưới thép nóc.",
      macd: "L2",
      sanluong: 1500,
      thoigian: "1/3/2025-31/3/2025",
      chiphi: 600000000,
      subRows: [
        // SubRows riêng cho sản phẩm EBH52
        {
          label: "Chi phí vật liệu kế hoạch ban đầu",
          validityPeriod: "1/3/2025-31/3/2025",
          sanluong: 1200,
          chiphi: 250000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: <InitialMaterialPlanInput selectedId={3} />,
          createComponent: <InitialMaterialPlanInput selectedId={3} />,
        },
        {
          label: "Chi phí SCTX kế hoạch ban đầu",
          validityPeriod: "1/3/2025-31/3/2025",
          sanluong: 1300,
          chiphi: 200000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: (
            <InitialRepairPlanInput selectedId={3} isEditMode={true} />
          ),
          createComponent: (
            <InitialRepairPlanInput selectedId={3} isEditMode={true} />
          ),
        },
        {
          label: "Chi phí điện năng kế hoạch ban đầu",
          validityPeriod: "1/3/2025-31/3/2025",
          sanluong: 1400,
          chiphi: 150000000,
          detailComponent: <Material_Unified_Cost />,
          editComponent: <InitialElectricityPlanInput selectedId={3} />,
          createComponent: <InitialElectricityPlanInput selectedId={3} />,
        },
      ],
    },
  ];

  const data = dataRows.map((row) => [
    row.id,
    row.ma,
    row.tensp,
    row.macd,
    row.sanluong,
    row.chiphi.toLocaleString(),
    row.thoigian,
    <PencilButton
      id={row.id}
      editElement={<ProductCostInput id={row.id.toString()} />}
    />,
    row.subRows,
  ]);

  return (
    <Layout>
      <div className="p-6">
        <AdvancedTable
          title01="Thống kê vận hành / Chi phí kế hoạch ban đầu"
          title="Chi phí kế hoạch ban đầu"
          columns={columns}
          columnWidths={columnWidths}
          data={data}
          createElement={<ProductCostInput />}
          columnLefts={["undefined", "undefined", "undefined", "undefined"]}
          variant="cost"
          // Bỏ prop subRows ở đây vì giờ subRows nằm trong từng row
        />
      </div>
    </Layout>
  );
};
export default Unified_Cost;
