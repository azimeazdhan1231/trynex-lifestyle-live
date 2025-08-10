import CartModalBulletproof from "@/components/cart-modal-bulletproof";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  return <CartModalBulletproof isOpen={isOpen} onClose={onClose} />;
}