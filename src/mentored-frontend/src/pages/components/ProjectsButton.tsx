import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/ProjectsButton.css';

const ButtonDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button className="button projects" onClick={() => setIsOpen(!isOpen)}>
        Projects
      </button>
      {isOpen && (
        <div className="itens">
          <div>Project 1</div>
          <button>
            <Link to="/experiments">Experiments</Link>
          </button>
          <button>
            <Link to="/executions">Experiments Executions</Link>
          </button>
        </div>
      )}
    </div>
  );
};

export default ButtonDropdown;
