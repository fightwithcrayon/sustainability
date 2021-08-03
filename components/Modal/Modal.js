import styles from "./Modal.module.css";
import { forwardRef } from "react";

const Modal = forwardRef(({ children, setIsOpen }, ref) => {
  return (
    <div ref={ref} className={styles.modal}>
      <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      <div className={styles.wrapper}>
        <div className={styles.content}>{children}</div>
      </div>
      <img
        className={styles.close}
        onClick={() => setIsOpen(false)}
        src="/close.svg"
      />
    </div>
  );
});

export default Modal;
