'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowDownRight, 
  MapPin, 
  Calendar, 
  Award, 
  Star,
  Info,
  TrendingUp
} from 'lucide-react';

interface CarbonCredit {
  id: string;
  seller: string;
  sellerRating: number;
  creditType: string;
  vintage: number;
  quantity: number;
  pricePerTon: number;
  totalValue: number;
  location: string;
  certification: string;
  expiryDate: string;
  description: string;
  verified: boolean;
}

interface CreditCardProps {
  credit: CarbonCredit;
  onBuy: (creditId: string) => void;
  onViewDetails: (creditId: string) => void;
}

export const CreditCard = ({ credit, onBuy, onViewDetails }: CreditCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCreditTypeColor = (type: string) => {
    const colors = {
      'Renewable Energy': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Forestry': 'bg-green-100 text-green-800 border-green-200',
      'Carbon Capture': 'bg-blue-100 text-blue-800 border-blue-200',
      'Agriculture': 'bg-orange-100 text-orange-800 border-orange-200',
      'Blue Carbon': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Waste Management': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCreditTypeIcon = (type: string) => {
    const icons = {
      'Renewable Energy': '⚡',
      'Forestry': '🌲',
      'Carbon Capture': '🏭',
      'Agriculture': '🌾',
      'Blue Carbon': '🌊',
      'Waste Management': '♻️'
    };
    return icons[type as keyof typeof icons] || '🌱';
  };

  return (
    <Card 
      className={`hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        isHovered ? 'scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left Section - Credit Info */}
          <div className="flex-1">
            {/* Header with badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCreditTypeIcon(credit.creditType)}</span>
                <Badge className={`${getCreditTypeColor(credit.creditType)} border`}>
                  {credit.creditType}
                </Badge>
              </div>
              <Badge variant="outline" className="text-xs">
                Vintage {credit.vintage}
              </Badge>
              {credit.verified && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <Award className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {credit.certification}
              </Badge>
            </div>
            
            {/* Seller info */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                {credit.seller}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{credit.sellerRating}</span>
                <span className="text-sm text-gray-500">/5.0</span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {credit.description}
            </p>
            
            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500 text-xs">Location</span>
                  <p className="font-medium text-gray-900">{credit.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500 text-xs">Quantity</span>
                  <p className="font-medium text-gray-900">{credit.quantity.toLocaleString()} tonnes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500 text-xs">Expires</span>
                  <p className="font-medium text-gray-900">{new Date(credit.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Section - Pricing and Actions */}
          <div className="lg:text-right lg:min-w-[200px]">
            {/* Price display */}
            <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  ${credit.pricePerTon.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mb-2">per tonne CO₂e</p>
                
                <div className="border-t border-green-200 pt-2">
                  <p className="text-lg font-semibold text-green-700">
                    ${credit.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">total value</p>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => onBuy(credit.id)}
                className="bg-green-600 hover:bg-green-700 text-white group-hover:shadow-lg transition-all"
              >
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onViewDetails(credit.id)}
                className="hover:bg-gray-50"
              >
                <Info className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            
            {/* Market indicator */}
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Market Active
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
      </CardContent>
    </Card>
  );
};