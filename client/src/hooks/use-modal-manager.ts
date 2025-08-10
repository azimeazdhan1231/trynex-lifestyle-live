
import { useState, useCallback } from 'react';

interface ModalState {
  [key: string]: boolean;
}

export function useModalManager(initialModals: string[] = []) {
  const [modals, setModals] = useState<ModalState>(() => {
    const initial: ModalState = {};
    initialModals.forEach(modal => {
      initial[modal] = false;
    });
    return initial;
  });

  const openModal = useCallback((modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const newState: ModalState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      return newState;
    });
  }, []);

  const isModalOpen = useCallback((modalName: string) => {
    return modals[modalName] || false;
  }, [modals]);

  return {
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    modals
  };
}
