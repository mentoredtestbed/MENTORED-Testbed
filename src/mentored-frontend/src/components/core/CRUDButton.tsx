import React, { useState } from 'react';

// import React, { useEffect } from 'react';

import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';

// import * as React from 'react';
import '../../assets/css/tabela.css';
import '../../assets/css/CRUDButton.css';
import { confirmAlert } from 'react-confirm-alert'; // Import
// import { AiOutlineCloseSquare } from 'react-icons/ai';
// import { BsSearch } from 'react-icons/bs';
// import { ImDisplay } from 'react-icons/im';
// import { SlEye } from 'react-icons/sl';
import { TiPencil, TiDeleteOutline } from 'react-icons/ti';
import { Button, Modal } from 'react-bootstrap';
import { FiDownload } from "react-icons/fi";
import { useTranslation } from 'react-i18next';
import { BiDoorOpen } from "react-icons/bi";
import { FaArrowDown } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { MdBlockFlipped } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegClone } from "react-icons/fa";

// import { TiPencil } from "react-icons/ti";
// import { TiDeleteOutline } from "react-icons/ti";

interface Props {
  operation: string;
  triggerFunction: () => void;
  name: string;
}

const CRUDButton: React.FC<Props> = ({ operation, name, triggerFunction, customClass, suffixText }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const { t } = useTranslation();

  const handleConfirm = () => {
    triggerFunction();
    closeModal();
  };

  const capitalizeOperation = (op) => {
    return op.charAt(0).toUpperCase() + op.slice(1);
  }

  let icon_html = null;

  // if customClass is defined, use it, otherwise use the default class
  const buttonClass = customClass ? customClass : "table-icons";
  const suffixTextHtml = suffixText ? suffixText : "";

  switch (operation) {
    case 'update':
      icon_html = <TiPencil className={buttonClass} onClick={openModal} />;
      break;
    case 'delete':
      icon_html = <FaRegTrashAlt className={buttonClass} onClick={openModal} />;
      break;
    case 'leave':
      icon_html = <BiDoorOpen className={buttonClass} onClick={openModal} />;
      break;
    case 'remove':
      icon_html = <TiDeleteOutline className={buttonClass} onClick={openModal} />;
      break;
    case 'deactivate':
      icon_html = <MdBlockFlipped className={buttonClass} onClick={openModal} />;
      break;
    case 'activate':
      icon_html = <FaRegCheckCircle className={buttonClass} onClick={openModal} />;
      break;
    case 'download':
      icon_html = <FiDownload className={buttonClass} onClick={openModal} />;
      break;
    case 'clone':
      icon_html = <FaRegClone className={buttonClass} onClick={openModal} />;
      break;
    default:
      icon_html = null;
  }

  return (
    <div>
      {icon_html} {suffixTextHtml}
      <Modal
        show={isOpen}
        onHide={closeModal}
      >
        <Modal.Header>
          <Modal.Title>{capitalizeOperation(t(`crudbutton.${operation}`))}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t(`crudbutton.text`) + t(`crudbutton.${operation}Action`) + name + "?"}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal} className="btn-custom-primary">
            { t('crudbutton.deny') }
          </Button>
          <Button variant="primary" onClick={handleConfirm} className="btn-custom-primary">
            { t('crudbutton.confirm') }
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CRUDButton;
