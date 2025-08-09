import CartModalFixed from "@/components/cart-modal-fixed";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  return <CartModalFixed isOpen={isOpen} onClose={onClose} />;
}