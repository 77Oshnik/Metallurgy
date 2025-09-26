'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard } from '@/components/carbon-trading/CreditCard';
import { PurchaseDialog } from '@/components/carbon-trading/PurchaseDialog';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  DollarSign, 
  Users, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  RefreshCw
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

interface TradeHistory {
  id: string;
  type: 'buy' | 'sell';
  creditType: string;
  quantity: number;
  pricePerTon: number;
  totalValue: number;
  counterparty: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface MarketStats {
  totalVolume: number;
  averagePrice: number;
  priceChange: number;
  activeListings: number;
  totalTraders: number;
}

export default function CarbonTradingPage() {
  const [selectedTab, setSelectedTab] = useState('marketplace');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreditType, setSelectedCreditType] = useState('all');
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalVolume: 0,
    averagePrice: 0,
    priceChange: 0,
    activeListings: 0,
    totalTraders: 0
  });

  // Hardcoded market data
  const carbonCredits: CarbonCredit[] = [
    {
      id: 'CC001',
      seller: 'GreenTech Solutions',
      sellerRating: 4.8,
      creditType: 'Renewable Energy',
      vintage: 2024,
      quantity: 1500,
      pricePerTon: 45.50,
      totalValue: 68250,
      location: 'California, USA',
      certification: 'VCS',
      expiryDate: '2027-12-31',
      description: 'Solar farm project generating clean energy credits',
      verified: true
    },
    {
      id: 'CC002',
      seller: 'Forest Carbon Ltd',
      sellerRating: 4.6,
      creditType: 'Forestry',
      vintage: 2023,
      quantity: 2800,
      pricePerTon: 38.75,
      totalValue: 108500,
      location: 'British Columbia, Canada',
      certification: 'Gold Standard',
      expiryDate: '2028-06-30',
      description: 'Reforestation project with biodiversity co-benefits',
      verified: true
    },
    {
      id: 'CC003',
      seller: 'Industrial Carbon Co',
      sellerRating: 4.2,
      creditType: 'Carbon Capture',
      vintage: 2024,
      quantity: 950,
      pricePerTon: 62.00,
      totalValue: 58900,
      location: 'Texas, USA',
      certification: 'CAR',
      expiryDate: '2029-03-15',
      description: 'Direct air capture and storage facility',
      verified: true
    },
    {
      id: 'CC004',
      seller: 'AgriCarbon Partners',
      sellerRating: 4.4,
      creditType: 'Agriculture',
      vintage: 2023,
      quantity: 3200,
      pricePerTon: 28.90,
      totalValue: 92480,
      location: 'Iowa, USA',
      certification: 'ACR',
      expiryDate: '2026-09-20',
      description: 'Regenerative agriculture and soil carbon sequestration',
      verified: true
    },
    {
      id: 'CC005',
      seller: 'Ocean Blue Carbon',
      sellerRating: 4.9,
      creditType: 'Blue Carbon',
      vintage: 2024,
      quantity: 750,
      pricePerTon: 85.25,
      totalValue: 63937.50,
      location: 'Florida, USA',
      certification: 'VCS',
      expiryDate: '2030-01-10',
      description: 'Mangrove restoration and coastal wetland protection',
      verified: true
    },
    {
      id: 'CC006',
      seller: 'Metro Waste Solutions',
      sellerRating: 4.1,
      creditType: 'Waste Management',
      vintage: 2023,
      quantity: 1800,
      pricePerTon: 35.60,
      totalValue: 64080,
      location: 'New York, USA',
      certification: 'Gold Standard',
      expiryDate: '2027-08-25',
      description: 'Landfill gas capture and methane destruction',
      verified: true
    }
  ];

  const tradeHistory: TradeHistory[] = [
    {
      id: 'T001',
      type: 'buy',
      creditType: 'Renewable Energy',
      quantity: 500,
      pricePerTon: 44.20,
      totalValue: 22100,
      counterparty: 'EcoTech Industries',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: 'T002',
      type: 'sell',
      creditType: 'Forestry',
      quantity: 800,
      pricePerTon: 39.50,
      totalValue: 31600,
      counterparty: 'Green Investments LLC',
      timestamp: '2024-01-12T14:45:00Z',
      status: 'completed'
    },
    {
      id: 'T003',
      type: 'buy',
      creditType: 'Carbon Capture',
      quantity: 200,
      pricePerTon: 61.75,
      totalValue: 12350,
      counterparty: 'Carbon Solutions Inc',
      timestamp: '2024-01-10T09:15:00Z',
      status: 'pending'
    }
  ];

  // Simulate real-time market updates
  useEffect(() => {
    const updateMarketStats = () => {
      const totalVolume = carbonCredits.reduce((sum, credit) => sum + credit.quantity, 0);
      const totalValue = carbonCredits.reduce((sum, credit) => sum + credit.totalValue, 0);
      const averagePrice = totalValue / totalVolume;
      const priceChange = (Math.random() - 0.5) * 10; // Random price change
      
      setMarketStats({
        totalVolume,
        averagePrice,
        priceChange,
        activeListings: carbonCredits.length,
        totalTraders: 1247 + Math.floor(Math.random() * 10)
      });
    };

    updateMarketStats();
    const interval = setInterval(updateMarketStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredCredits = carbonCredits.filter(credit => {
    const matchesSearch = credit.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.creditType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedCreditType === 'all' || credit.creditType === selectedCreditType;
    return matchesSearch && matchesType;
  });

  const handleBuyCredit = (creditId: string) => {
    const credit = carbonCredits.find(c => c.id === creditId);
    if (credit) {
      setSelectedCredit(credit);
      setIsPurchaseDialogOpen(true);
    }
  };

  const handleViewDetails = (creditId: string) => {
    alert(`Viewing detailed information for credit ${creditId}. In a real system, this would show comprehensive credit details, verification documents, and project information.`);
  };

  const handleConfirmPurchase = (creditId: string, quantity: number) => {
    // Simulate successful purchase
    setTimeout(() => {
      setIsPurchaseDialogOpen(false);
      setSelectedCredit(null);
    }, 1000);
  };

  const handleSellCredit = () => {
    // Simulate selling process
    alert('Opening sell credit form. In a real system, this would open a form to list credits for sale.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Leaf className="h-6 w-6 mr-2 text-green-600" />
                  Carbon Credit Trading
                </h1>
                <p className="text-sm text-gray-500">
                  Trade verified carbon credits in the global marketplace
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleSellCredit} variant="outline">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Sell Credits
              </Button>
              <Link href="/carbon-trading/portfolio">
                <Button className="bg-green-600 hover:bg-green-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  My Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Overview */}
        <div className="mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">Total Volume</p>
                    <p className="text-xl font-bold">{marketStats.totalVolume.toLocaleString()}</p>
                    <p className="text-green-100 text-xs">tonnes CO₂e</p>
                  </div>
                  <Leaf className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Avg Price</p>
                    <p className="text-xl font-bold">${marketStats.averagePrice.toFixed(2)}</p>
                    <p className="text-blue-100 text-xs">per tonne</p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className={`bg-gradient-to-r ${marketStats.priceChange >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs">24h Change</p>
                    <p className="text-xl font-bold flex items-center">
                      {marketStats.priceChange >= 0 ? '+' : ''}{marketStats.priceChange.toFixed(1)}%
                      {marketStats.priceChange >= 0 ? 
                        <TrendingUp className="h-4 w-4 ml-1" /> : 
                        <TrendingDown className="h-4 w-4 ml-1" />
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs">Active Listings</p>
                    <p className="text-xl font-bold">{marketStats.activeListings}</p>
                  </div>
                  <Filter className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs">Active Traders</p>
                    <p className="text-xl font-bold">{marketStats.totalTraders.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Trading Interface */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="my-trades">My Trades</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Credits</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by seller, type, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:w-48">
                    <Label htmlFor="creditType">Credit Type</Label>
                    <select
                      id="creditType"
                      value={selectedCreditType}
                      onChange={(e) => setSelectedCreditType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Types</option>
                      <option value="Renewable Energy">Renewable Energy</option>
                      <option value="Forestry">Forestry</option>
                      <option value="Carbon Capture">Carbon Capture</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Blue Carbon">Blue Carbon</option>
                      <option value="Waste Management">Waste Management</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credits Marketplace */}
            <div className="space-y-6">
              {filteredCredits.map((credit) => (
                <CreditCard
                  key={credit.id}
                  credit={credit}
                  onBuy={handleBuyCredit}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-trades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>
                  Your recent carbon credit transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradeHistory.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          trade.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {trade.type === 'buy' ? 
                            <ArrowDownRight className="h-4 w-4" /> : 
                            <ArrowUpRight className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">
                            {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.quantity} tonnes
                          </p>
                          <p className="text-sm text-gray-500">
                            {trade.creditType} • {trade.counterparty}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(trade.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${trade.totalValue.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${trade.pricePerTon.toFixed(2)}/tonne
                        </p>
                        <Badge 
                          variant={trade.status === 'completed' ? 'default' : 
                                  trade.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {trade.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Trends</CardTitle>
                  <CardDescription>
                    Price movements over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would appear here</p>
                      <p className="text-sm text-gray-400">Showing price trends and volume data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Credit Type Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of available credits by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Renewable Energy', 'Forestry', 'Carbon Capture', 'Agriculture', 'Blue Carbon', 'Waste Management'].map((type) => {
                      const count = carbonCredits.filter(c => c.creditType === type).length;
                      const percentage = (count / carbonCredits.length) * 100;
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Purchase Dialog */}
      <PurchaseDialog
        credit={selectedCredit}
        isOpen={isPurchaseDialogOpen}
        onClose={() => {
          setIsPurchaseDialogOpen(false);
          setSelectedCredit(null);
        }}
        onConfirmPurchase={handleConfirmPurchase}
      />
    </div>
  );
}