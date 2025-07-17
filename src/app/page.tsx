"use client";

import { useState } from "react";
import PizzaBuilder from "@/components/PizzaBuilder";
import { Check } from "lucide-react";

export default function Home() {
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleOrderPlaced = (id: number) => {
    setOrderId(id);
  };

  const resetOrder = () => {
    setOrderId(null);
  };

  if (orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bestelling bevestigd!
          </h1>
          <p className="text-gray-600 mb-6">
            Je pizza bestelling #{orderId} is ontvangen en wordt voorbereid.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Bedankt voor het kiezen voor Pizza Bakker!
          </p>
          <button
            onClick={resetOrder}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Plaats nog een bestelling
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PizzaBuilder onOrderPlaced={handleOrderPlaced} />
    </div>
  );
}
