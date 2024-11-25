import React, { ReactNode } from 'react';
import '../../assets/css/dashboard.css';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function Card({ children, title = '', subtitle = '', className = '' }: CardProps) {
  return (
    <div className={`card col mb-3 ${className}`}>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <h6 className="card-subtitle mb-2 ">{subtitle}</h6>
        <p className="card-text">{children}</p>
      </div>
    </div>
  );
}
