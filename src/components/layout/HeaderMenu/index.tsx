import { Menu } from "antd";
import {
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineLogout,
  AiOutlineCar,
} from "react-icons/ai";
import { MdOutlineManageAccounts } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import al_logo from "../../../assets/AquaticLogo-modified.png";
import { useUser } from "../../../hooks/useUser";

export default function HeaderMenu() {
  const navigate = useNavigate();
  const { users } = useUser((state) => state);
  const items1 = [
    { label: "Trang Chủ", key: "home", icon: <AiOutlineHome /> }, // remember to pass the key prop
    {
      label: "Quản Trị",
      key: "management",
      icon: <MdOutlineManageAccounts />,
      disabled: users.user.roles && users.user.roles === "admin" ? false : true,
    },
    {
      label: "Vận Chuyển",
      key: "shipping",
      icon: <AiOutlineCar />,
      disabled:
        users.user.roles && users.user.roles === "shipper" ? false : true,
    }, // which is required
    { label: "Cài Đặt", key: "settings", icon: <AiOutlineSetting /> }, // which is required
  ];

  const ButtonLogout = (
    <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "white",
          lineHeight: 1,
          borderStyle: "solid",
          borderWidth: 1,
          borderRadius: 6,
          padding: 8,
        }}
      >
        {/* <AiOutlineUser /> */}
        <div style={{ width: 20, height: 20 }}>
          <img
            src={`${users.user.avatar}`}
            alt="avatar"
            style={{ width: "100%", height: "100%", borderRadius: 9999 }}
          />
        </div>
        <span>{users.user.last_name}</span>
      </div>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        style={{
          display: "flex",
          alignItems: "center",
          lineHeight: 1,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
          backgroundColor: "white",
          color: "red",
          borderRadius: 4,
          cursor: "pointer",
        }}
        // className="flex items-center leading-none py-2 px-4 bg-white text-red-700 rounded hover:cursor-pointer hover:rounded-xl hover:scale-110 hover:transition-all ease-in-out duration-300"
      >
        <span style={{ minWidth: 70, width: "50%", marginRight: 8 }}>
          Đăng Xuất
        </span>
        <AiOutlineLogout size={18} />
      </button>
    </div>
  );
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ display: "flex" }}>
        <img
          style={{
            maxWidth: 50,
            minWidth: "10%",
            textAlign: "center",
            marginTop: 5,
            marginBottom: 5,
          }}
          src={al_logo}
          alt="logo"
        />
        <Menu
          theme="dark"
          mode="horizontal"
          items={items1}
          onClick={({ key, keyPath, domEvent }) => {
            navigate("/" + key.split("-").join("/"));
            // console.log(key);
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {ButtonLogout}
      </div>
    </div>
  );
}
