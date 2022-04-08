import { TEMPLATE } from "../Popup/Popup";
import "./Header.scss";

function Header({ showPopupHandler }) {
  return (
    <div className="Header">
      <div className="title">Wordle</div>
      <div className="helpMark" onClick={() => showPopupHandler(TEMPLATE.HELP)}>
        ?
      </div>
    </div>
  );
}

export default Header;
