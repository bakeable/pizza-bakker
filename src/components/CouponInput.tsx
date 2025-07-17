import { useState } from "react";

interface CouponInputProps {
  couponCode: string;
  couponDiscount: number;
  applyCoupon: (code: string) => void;
}

export default function CouponInput({
  couponDiscount,
  applyCoupon,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setValidationError("Voer een kortingscode in");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch(
        `/api/coupon/validate?code=${encodeURIComponent(couponCode)}`
      );
      const data = await response.json();

      if (data.success) {
        setValidationError(null);
        applyCoupon(couponCode);
      } else {
        setValidationError(data.error || "Ongeldige kortingscode");
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setValidationError("Kon kortingscode niet valideren");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Kortingscode (Optioneel)</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Voer kortingscode in (WELCOME10, RETURN15, LOYAL20)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={validateCoupon}
          disabled={isValidating || !couponCode.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? "Valideren..." : "Toepassen"}
        </button>
      </div>

      {validationError && (
        <p className="text-red-600 mt-2">✗ {validationError}</p>
      )}

      {couponDiscount > 0 && !validationError && (
        <p className="text-green-600 mt-2">
          ✓{" "}
          {couponDiscount.toLocaleString("nl-NL", {
            style: "currency",
            currency: "EUR",
          })}{" "}
          korting
        </p>
      )}
    </div>
  );
}
