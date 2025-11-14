import React, { useState } from "react";
import AdvancedTable from "../../components/bodytable";
import "../../components/bodytable.css";
import PencilButton from "../../components/PencilButtons";
import Material_Unified_Cost from "../../layout/KHSX_VL";
import Layout from "../../layout/layout_filter";
import ExecutionMaterialInput from "./Excecution_Material_Input";
import ExecutionElectricityInput from "./Execution_Electricity_Input";
import ExecutionRepairInput from "./Execution_Repair_Input";
import ProductCostInput from "./Product_Cost_Input";

const UnifiedOperationCost: React.FC = () => {
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
  const columnWidths = [6, 11, 60, 10, 11, 15, 15, 5];

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
      middleLevels: [
        {
          label: "Chi phí thực hiện",
          subRows: [
            {
              label: "Chi phí vật liệu thực hiện",
              validityPeriod: "1/1/2025-30/1/2025",
              sanluong: 500,
              chiphi: 100000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: (
                <ExecutionMaterialInput
                  selectedId={1}
                  isEditMode={true}
                  subRowId="vl-th-1-202501"
                />
              ),
              createComponent: (
                <ExecutionMaterialInput
                  selectedId={1}
                  subRowId="vl-th-1-202501"
                />
              ),
            },
            {
              label: "Chi phí SCTX thực hiện",
              validityPeriod: "1/1/2025-30/1/2025",
              sanluong: 500,
              chiphi: 100000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: (
                <ExecutionRepairInput
                  selectedId={1}
                  isEditMode={true}
                  subRowId="sctx-th-2025-01"
                />
              ),
              createComponent: (
                <ExecutionRepairInput
                  selectedId={1}
                  subRowId="sctx-th-2025-01"
                />
              ),
            },
            {
              label: "Chi phí điện năng thực hiện",
              validityPeriod: "1/1/2025-30/1/2025",
              sanluong: 500,
              chiphi: 100000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: (
                <ExecutionElectricityInput
                  selectedId={1}
                  isEditMode={true}
                  subRowId="dn-th-2025-01"
                />
              ),
              createComponent: (
                <ExecutionElectricityInput
                  selectedId={1}
                  subRowId="dn-th-2025-01"
                />
              ),
            },
            {
              label: "Chi phí vật liệu thực hiện",
              validityPeriod: "30/1/2025-28/2/2025",
              sanluong: 500,
              chiphi: 50000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: (
                <ExecutionMaterialInput
                  selectedId={1}
                  subRowId="vl-th-1-202502"
                  isEditMode={true}
                />
              ),
              createComponent: (
                <ExecutionMaterialInput
                  selectedId={1}
                  subRowId="vl-th-1-202502"
                />
              ),
            },
            {
              label: "Chi phí SCTX thực hiện",
              validityPeriod: "30/1/2025-28/2/2025",
              sanluong: 500,
              chiphi: 50000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: (
                <ExecutionRepairInput
                  selectedId={1}
                  isEditMode={true}
                  subRowId="sctx-th-2025-02"
                />
              ),
              createComponent: (
                <ExecutionRepairInput
                  selectedId={1}
                  subRowId="sctx-th-2025-02"
                />
              ),
            },
            {
              label: "Chi phí điện năng thực hiện",
              validityPeriod: "30/1/2025-28/2/2025",
              sanluong: 500,
              chiphi: 100000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: (
                <ExecutionElectricityInput
                  selectedId={1}
                  subRowId="dn-th-2025-02"
                  isEditMode={true}
                />
              ),
              createComponent: (
                <ExecutionElectricityInput
                  selectedId={1}
                  subRowId="dn-th-2025-02"
                />
              ),
            },
          ],
        },
        {
          label: "Chi phí kế hoạch",
          subRows: [
            {
              label: "Chi phí vật liệu kế hoạch",
              validityPeriod: "1/1/2025-30/1/2025",
              sanluong: 500,
              chiphi: 100000000,
              detailComponent: <Material_Unified_Cost />,
              // No editComponent and createComponent for read-only section
            },
            {
              label: "Chi phí SCTX kế hoạch",
              validityPeriod: "1/1/2025-30/1/2025",
              sanluong: 500,
              chiphi: 100000000,
              detailComponent: <Material_Unified_Cost />,
            },
            {
              label: "Chi phí điện năng kế hoạch",
              validityPeriod: "1/1/2025-30/1/2025",
              sanluong: 500,
              chiphi: 100000000,
              detailComponent: <Material_Unified_Cost />,
            },
            {
              label: "Chi phí vật liệu kế hoạch",
              validityPeriod: "30/1/2025-28/2/2025",
              sanluong: 500,
              chiphi: 50000000,
              detailComponent: <Material_Unified_Cost />,
            },
            {
              label: "Chi phí SCTX kế hoạch",
              validityPeriod: "30/1/2025-28/2/2025",
              sanluong: 500,
              chiphi: 50000000,
              detailComponent: <Material_Unified_Cost />,
            },
            {
              label: "Chi phí điện năng kế hoạch",
              validityPeriod: "30/1/2025-28/2/2025",
              sanluong: 500,
              chiphi: 100000000,
              detailComponent: <Material_Unified_Cost />,
            },
          ],
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
      middleLevels: [
        {
          label: "Chi phí thực hiện",
          subRows: [
            {
              label: "Chi phí vật liệu thực hiện",
              validityPeriod: "1/2/2025-28/2/2025",
              sanluong: 1600,
              chiphi: 300000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: <ExecutionMaterialInput selectedId={2} />,
              createComponent: <ExecutionMaterialInput selectedId={2} />,
            },
            {
              label: "Chi phí SCTX thực hiện",
              validityPeriod: "1/2/2025-28/2/2025",
              sanluong: 1700,
              chiphi: 350000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: (
                <ExecutionRepairInput selectedId={2} isEditMode={true} />
              ),
              createComponent: <ExecutionRepairInput selectedId={2} />,
            },
            {
              label: "Chi phí điện năng thực hiện",
              validityPeriod: "1/2/2025-28/2/2025",
              sanluong: 1800,
              chiphi: 150000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: <ExecutionElectricityInput selectedId={2} />,
              createComponent: <ExecutionElectricityInput selectedId={2} />,
            },
          ],
        },
        {
          label: "Chi phí kế hoạch",
          subRows: [
            {
              label: "Chi phí vật liệu kế hoạch",
              validityPeriod: "1/2/2025-28/2/2025",
              sanluong: 1600,
              chiphi: 250000000,
              detailComponent: <Material_Unified_Cost />,
            },
            {
              label: "Chi phí SCTX kế hoạch",
              validityPeriod: "1/2/2025-28/2/2025",
              sanluong: 1700,
              chiphi: 300000000,
              detailComponent: <Material_Unified_Cost />,
            },
            {
              label: "Chi phí điện năng kế hoạch",
              validityPeriod: "1/2/2025-28/2/2025",
              sanluong: 1800,
              chiphi: 250000000,
              detailComponent: <Material_Unified_Cost />,
            },
          ],
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
      middleLevels: [
        {
          label: "Chi phí thực hiện",
          subRows: [
            {
              label: "Chi phí vật liệu thực hiện",
              validityPeriod: "1/3/2025-31/3/2025",
              sanluong: 1200,
              chiphi: 250000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: <ExecutionMaterialInput selectedId={3} />,
              createComponent: <ExecutionMaterialInput selectedId={3} />,
            },
            {
              label: "Chi phí SCTX thực hiện",
              validityPeriod: "1/3/2025-31/3/2025",
              sanluong: 1300,
              chiphi: 200000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: (
                <ExecutionRepairInput selectedId={3} isEditMode={true} />
              ),
              createComponent: (
                <ExecutionRepairInput selectedId={3} isEditMode={true} />
              ),
            },
            {
              label: "Chi phí điện năng thực hiện",
              validityPeriod: "1/3/2025-31/3/2025",
              sanluong: 1400,
              chiphi: 150000000,
              detailComponent: <Material_Unified_Cost />,
              editComponent: <ExecutionElectricityInput selectedId={3} />,
              createComponent: <ExecutionElectricityInput selectedId={3} />,
            },
          ],
        },
        {
          label: "Chi phí kế hoạch",
          subRows: [
            {
              label: "Chi phí vật liệu kế hoạch",
              validityPeriod: "1/3/2025-31/3/2025",
              sanluong: 1200,
              chiphi: 200000000,
              detailComponent: <Material_Unified_Cost />,
            },
            {
              label: "Chi phí SCTX kế hoạch",
              validityPeriod: "1/3/2025-31/3/2025",
              sanluong: 1300,
              chiphi: 180000000,
              detailComponent: <Material_Unified_Cost />,
            },
            {
              label: "Chi phí điện năng kế hoạch",
              validityPeriod: "1/3/2025-31/3/2025",
              sanluong: 1400,
              chiphi: 120000000,
              detailComponent: <Material_Unified_Cost />,
            },
          ],
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
    row.middleLevels,
  ]);

  return (
    <Layout>
      <div className="p-6">
        <AdvancedTable
          title01="Thống kê vận hành / Chi phí vận hành"
          title="Chi phí vận hành"
          columns={columns}
          columnWidths={columnWidths}
          data={data}
          createElement={<ProductCostInput />}
          columnLefts={["undefined", "undefined", "undefined", "undefined"]}
          variant="advance-cost"
        />
      </div>
    </Layout>
  );
};

export default UnifiedOperationCost;
