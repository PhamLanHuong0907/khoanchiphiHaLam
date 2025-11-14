import {
  BadgeRussianRuble,
  Bell,
  Boxes,
  ChevronDown,
  ClipboardList,
  FileBarChart2,
  Settings,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import DropdownMenu from "./dropdown";
import "./navbar.css";
const Navbar = () => {
  return (
    <header className="navbar-container">
      {/* Left: Logo + Company name */}
      <div className="navbar-logo">
        <img src={logo} alt="Logo" className="navbar-logo" />
        <div className="navbar-company">
          <span className="company-text">CÔNG TY CP Than Hà Lầm</span>
        </div>
      </div>

      {/* Middle: Menu items */}
      <nav className="navbar-menu">
        {/* Dashboard */}
        <div className="Menu-item-dashboard">
          <div className="Frame1">
            <FileBarChart2
              className="menu-icon icon-dashboard"
              strokeWidth={1}
            />
          </div>
          <div className="Text">
            <Link to="/" className="menu-dashboard">
              DASHBOARD
            </Link>
          </div>
        </div>

        {/* Dropdown Danh mục */}
        <DropdownMenu
          className="Menu-item-danhmuc"
          icon={
            <div className="Frame2">
              <ClipboardList
                className="menu-icon icon-danhmuc"
                strokeWidth={1}
              />
            </div>
          }
          label={
            <div className="Text">
              <span className="menu-danhmuc">DANH MỤC</span>
            </div>
          }
          items={[
            { label: "Đơn vị tính", path: "/Unit" },
            { label: "Công đoạn sản xuất", path: "/ProductionStepGroup" },
            { label: "Mã giao khoán", path: "/WorkCode" },
            { label: "Vật tư, tài sản", path: "/Materials" },
            { label: "Thiết bị", path: "/Equipment" },
            { label: "Phụ tùng", path: "/SpareParts" },
            { label: "Sản phẩm", path: "/Products" },
            { label: "Thông số", path: "/Specification01" },
            { label: "Hệ số điều chỉnh", path: "/AdjustmentFactors01" },
          ]}
        />

        {/* Dropdown Đơn giá */}
        <DropdownMenu
          className="Menu-item-dongia"
          icon={
            <div className="Frame3">
              <BadgeRussianRuble
                className="menu-icon icon-dongia"
                strokeWidth={1}
              />
            </div>
          }
          label={
            <div className="Text">
              <span className="menu-dongia">ĐƠN GIÁ</span>
            </div>
          }
          items={[
            {
              label: "Đơn giá và định mức vật liệu",
              path: "/MaterialsIngredient",
            },
            { label: "Đơn giá và định mức máng trượt", path: "/Repairs" },
            { label: "Đơn giá và định mức SCTX", path: "/SlideRails" },
            { label: "Đơn giá và định mức điện năng", path: "/ElectricRails" },
          ]}
        />
        <DropdownMenu
          className="Menu-item-thongke"
          icon={
            <div className="Frame3">
              <Boxes className="menu-icon icon-thongke" strokeWidth={1} />
            </div>
          }
          label={
            <div className="Text">
              <span className="menu-thongke">THỐNG KÊ VẬN HÀNH</span>
            </div>
          }
          items={[
            { label: "Chi phí kế hoạch ban đầu", path: "/UnifiedCost" },
            { label: "Vận hành sản xuất", path: "/UnifiedOperationCost" },
          ]}
        />
        {/* Thống kê */}
      </nav>

      {/* Right: Icons + user info */}
      <div className="navbar-user">
        <div className="Frame5">
          <div className="settings">
            <Settings className="menu-icon" strokeWidth={1} />
          </div>
        </div>
        <div className="Noti">
          <div className="bell">
            <Bell className="menu-icon" strokeWidth={1} />
          </div>
          <div className="Example">
            <div className="Textnoti">9+</div>
          </div>
        </div>
        <div className="divider"></div>
        <div className="chevron-down">
          <ChevronDown className="menu-icon" />
        </div>
        <div className="user-info">
          <div className="user-text">
            <span className="user-name">Nguyễn Hà</span>
            <span className="user-email">admin@gmail.com</span>
          </div>
          <div className="user-avatar">
            <User className="user-icon" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
