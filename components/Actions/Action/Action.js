import styles from "./Action.module.css";
import { useEffect, useState, createRef } from "react";
import ReactMarkdown from "react-markdown";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import Modal from "../../Modal/Modal";

const Action = ({ copy, markdown, isContact, title }) => {
  const modalRef = createRef();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!modalRef.current || !isOpen) {
      return;
    }

    disableBodyScroll(modalRef.current, { reserveScrollBarGap: true });

    return () => {
      clearAllBodyScrollLocks();
    };
  }, [isOpen]);

  const Component = isContact ? "a" : "div";
  const classNames = `${styles.tile} ${title ? styles.hasTitle : ""} ${
    isContact ? styles.isContact : ""
  } ${markdown ? styles.hasContext : ""}`;
  return (
    <>
      <Component
        onClick={() => markdown && setIsOpen(true)}
        className={classNames}
        {...(isContact ? { href: "mailto:sustainability@random.studio" } : {})}
      >
        {title && <h3 className={styles.title}>{title}</h3>}
        <p className={styles.copy}>{copy}</p>
        {markdown && (
          <img
            className={styles.context}
            onClick={() => setIsOpen(true)}
            src="/context.svg"
          />
        )}
      </Component>

      {markdown && isOpen && (
        <Modal ref={modalRef} setIsOpen={setIsOpen}>
          <ReactMarkdown children={markdown} />
        </Modal>
      )}
    </>
  );
};

export default Action;
