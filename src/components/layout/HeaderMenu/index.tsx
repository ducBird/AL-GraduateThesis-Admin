export default function HeaderMenu() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <button
        style={{ color: "red" }}
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}
