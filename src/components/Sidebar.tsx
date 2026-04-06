export default function Sidebar() {
  return (
    <div id="sidebar">
      <div className="nav-icon active">
        <div
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
        />
      </div>
      <div className="nav-icon">
        <div
          style={{
            clipPath: "circle(50% at 50% 50%)",
            borderRadius: "50%",
          }}
        />
      </div>
      <div className="nav-icon">
        <div
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
      </div>
      <div className="nav-icon">
        <div
          style={{
            height: 2,
            width: 12,
            background: "transparent",
            boxShadow:
              "0 0 0 currentColor, 0 5px 0 currentColor, 0 10px 0 currentColor",
          }}
        />
      </div>
    </div>
  );
}
