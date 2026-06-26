"use client";

import CartDrawer from "@/components/cart/CartDrawer";
import ToastContainer from "@/components/ui/ToastContainer";

export default function ClientShell() {
  return (
    <>
      <CartDrawer />
      <ToastContainer />
    </>
  );
}
