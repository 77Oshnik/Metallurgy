'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calculator
} from 'lucide-react';

interface CarbonCredit {
  id: string;
  seller: string;
  creditType: string;
  quantity: number;
  pricePerTon: number;
  totalValue: number;
  location: string;
  certification: string;
}

interface PurchaseDialogProps {
  credit: CarbonCredit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: (creditId: string, quantity: number) => void;
}

export const PurchaseDialog = ({ credit, isOpen, onClose, onConfirmPurchase }: PurchaseDialogProps) => {
  const [purchaseQuantity, setPurchaseQuantity] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');

  if (!isOpen || !credit) return null;

  const totalCost = purchaseQuantity * credit.pricePerTon;
  const platformFee = totalCost * 0.025; // 2.5% platform fee
  const finalTotal = totalCost + platformFee;

  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    setPurchaseQuantity(Math.min(quantity, credit.quantity));
  };

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setStep('confirmation');
      setIsProcessing(false);
      onConfirmPurchase(credit.id, purchaseQuantity);
    }, 2000);
  };

  const handleClose = () => {
    setStep('details');
    setPurchaseQuantity(100);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {step === 'details' && 'Purchase Carbon Credits'}
            {step === 'payment' && 'Payment Details'}
            {step === 'confirmation' && 'Purchase Confirmed'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'details' && (
            <>
              {/* Credit Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{credit.seller}</h3>
                    <Badge className="mt-1">{credit.creditType}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${credit.pricePerTon.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">per tonne</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Available:</span>
                    <p className="font-medium">{credit.quantity.toLocaleString()} tonnes</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">{credit.location}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-3">
                <Label htmlFor="quantity">Purchase Quantity (tonnes CO₂e)</Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    value={purchaseQuantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    min="1"
                    max={credit.quantity}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setPurchaseQuantity(credit.quantity)}
                  >
                    Max
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Maximum available: {credit.quantity.toLocaleString()} tonnes
                </p>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Cost Breakdown</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Credits ({purchaseQuantity.toLocaleString()} × ${credit.pricePerTon.toFixed(2)})</span>
                    <span>${totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (2.5%)</span>
                    <span>${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Secure Transaction</p>
                  <p className="text-green-700">
                    All purchases are verified and credits are transferred to your registry account within 24 hours.
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleProceedToPayment} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={purchaseQuantity <= 0 || purchaseQuantity > credit.quantity}
              >
                Proceed to Payment
              </Button>
            </>
          )}

          {step === 'payment' && (
            <>
              {/* Payment Form */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Order Summary</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{purchaseQuantity.toLocaleString()} tonnes from {credit.seller}</span>
                      <span>${finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">Demo Mode</p>
                    <p className="text-yellow-700">
                      This is a demonstration. No actual payment will be processed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmPurchase} 
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm Purchase'
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'confirmation' && (
            <>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Purchase Successful!
                  </h3>
                  <p className="text-gray-600">
                    You have successfully purchased {purchaseQuantity.toLocaleString()} tonnes of carbon credits.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg text-left">
                  <h4 className="font-semibold text-green-900 mb-2">Transaction Details</h4>
                  <div className="text-sm space-y-1 text-green-800">
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono">TXN-{Date.now()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credits Purchased:</span>
                      <span>{purchaseQuantity.toLocaleString()} tonnes CO₂e</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid:</span>
                      <span>${finalTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seller:</span>
                      <span>{credit.seller}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Credits will be transferred to your account within 24 hours</span>
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};