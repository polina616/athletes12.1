import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  align?: 'center' | 'top';
}

export default function Modal({ onClose, children, align = 'top' }: ModalProps) {
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: align === 'top' ? 'flex-start' : 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: align === 'top' ? '40px 16px' : '16px',
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </div>,
    document.body
  );
}