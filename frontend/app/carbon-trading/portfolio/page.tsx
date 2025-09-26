'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Leaf, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Award,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Download
} from 'lucide-react';

interface PortfolioCredit {
  id: string;
  creditType: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  seller: string;
  certification: string;
  vintage: number;
  location: string;
  status: 'active' | 'retired' | 'pending';
}

interface PortfolioStats {
  totalCredits: number;
  totalValue: number;
  totalGainLoss: number;
  retiredCredits: number;
  activeCredits: number;
}

export default function PortfolioPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Hardcoded portfolio data
  const portfolioCredits: PortfolioCredit[] = [
    {
      id: 'PC001',
      creditType: 'Renewable Energy',
      quantity: 500,
      purchasePrice: 44.20,
      currentPrice: 45.50,
      purchaseDate: '2024-01-15',
      seller: 'EcoTech Industries',
      certification: 'VCS',
      vintage: 2024,
      location: 'California, USA',
      status: 'active'
    },
    {
      id: 'PC002',
      creditType: 'Forestry',
      quantity: 300,
      purchasePrice: 38.75,
      currentPrice: 39.20,
      purchaseDate: '2024-01-10',
      seller: 'Forest Carbon Ltd',
      certification: 'Gold Standard',
      vintage: 2023,
      location: 'British Columbia, Canada',
      status: 'active'
    },
    {
      id: 'PC003',
      creditType: 'Carbon Capture',
      quantity: 200,
      purchasePrice: 61.75,
      currentPrice: 62.00,
      purchaseDate: '2024-01-08',
      seller: 'Carbon Solutions Inc',
      certification: 'CAR',
      vintage: 2024,
      location: 'Texas, USA',
      status: 'retired'
    },
    {
      id: 'PC004',
      creditType: 'Agriculture',
      quantity: 150,
      purchasePrice: 29.50,
      currentPrice: 28.90,
      purchaseDate: '2024-01-05',
      seller: 'AgriCarbon Partners',
      certification: 'ACR',
      vintage: 2023,
      location: 'Iowa, USA',
      status: 'active'
    }
  ];

  const portfolioStats: PortfolioStats = {
    totalCredits: portfolioCredits.reduce((sum, credit) => sum + credit.quantity, 0),
    totalValue: portfolioCredits.reduce((sum, credit) => sum + (credit.quantity * credit.currentPrice), 0),
    totalGainLoss: portfolioCredits.reduce((sum, credit) => 
      sum + (credit.quantity * (credit.currentPrice - credit.purchasePrice)), 0),
    retiredCredits: portfolioCredits.filter(c => c.status === 'retired').reduce((sum, credit) => sum + credit.quantity, 0),
    activeCredits: portfolioCredits.filter(c => c.status === 'active').reduce((sum, credit) => sum + credit.quantity, 0)
  };

  const getCreditTypeColor = (type: string) => {
    const colors = {
      'Renewable Energy': 'bg-yellow-100 text-yellow-800',
      'Forestry': 'bg-green-100 text-green-800',
      'Carbon Capture': 'bg-blue-100 text-blue-800',
      'Agriculture': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'retired': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleRetireCredits = (creditId: string) => {
    alert(`Retiring credits ${creditId}. In a real system, this would permanently retire the credits from circulation.`);
  };

  const handleSellCredits = (creditId: string) => {
    alert(`Listing credits ${creditId} for sale. In a real system, this would open a sell order form.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/carbon-trading">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Trading
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Leaf className="h-6 w-6 mr-2 text-green-600" />
                  My Carbon Portfolio
                </h1>
                <p className="text-sm text-gray-500">
                  Track and manage your carbon credit investments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Link href="/carbon-trading">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Buy More Credits
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs">Total Credits</p>
                    <p className="text-xl font-bold">{portfolioStats.totalCredits.toLocaleString()}</p>
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
                    <p className="text-blue-100 text-xs">Portfolio Value</p>
                    <p className="text-xl font-bold">${portfolioStats.totalValue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className={`bg-gradient-to-r ${portfolioStats.totalGainLoss >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs">Total P&L</p>
                    <p className="text-xl font-bold flex items-center">
                      {portfolioStats.totalGainLoss >= 0 ? '+' : ''}${portfolioStats.totalGainLoss.toFixed(0)}
                      <TrendingUp className="h-4 w-4 ml-1" />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs">Active Credits</p>
                    <p className="text-xl font-bold">{portfolioStats.activeCredits.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-100 text-xs">Retired Credits</p>
                    <p className="text-xl font-bold">{portfolioStats.retiredCredits.toLocaleString()}</p>
                  </div>
                  <Award className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Portfolio Details */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Holdings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="impact">Impact Report</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-4">
              {portfolioCredits.map((credit) => {
                const gainLoss = credit.quantity * (credit.currentPrice - credit.purchasePrice);
                const gainLossPercent = ((credit.currentPrice - credit.purchasePrice) / credit.purchasePrice) * 100;
                
                return (
                  <Card key={credit.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={getCreditTypeColor(credit.creditType)}>
                              {credit.creditType}
                            </Badge>
                            <Badge variant="outline">
                              Vintage {credit.vintage}
                            </Badge>
                            <Badge className={getStatusColor(credit.status)}>
                              {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              {credit.certification}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {credit.seller}
                          </h3>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <p className="font-medium">{credit.quantity.toLocaleString()} tonnes</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <p className="font-medium">{credit.location}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Purchase Date:</span>
                              <p className="font-medium">{new Date(credit.purchaseDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Purchase Price:</span>
                              <p className="font-medium">${credit.purchasePrice.toFixed(2)}/tonne</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:text-right lg:min-w-[250px]">
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Current Price:</span>
                                <p className="font-semibold">${credit.currentPrice.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Current Value:</span>
                                <p className="font-semibold">${(credit.quantity * credit.currentPrice).toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">P&L:</span>
                                <p className={`font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(0)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Return:</span>
                                <p className={`font-semibold ${gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {credit.status === 'active' && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSellCredits(credit.id)}
                              >
                                Sell
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRetireCredits(credit.id)}
                              >
                                Retire
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>
                    Value changes over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Performance chart would appear here</p>
                      <p className="text-sm text-gray-400">Showing portfolio value over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Credit Type Allocation</CardTitle>
                  <CardDescription>
                    Distribution by credit type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Renewable Energy', 'Forestry', 'Carbon Capture', 'Agriculture'].map((type) => {
                      const credits = portfolioCredits.filter(c => c.creditType === type);
                      const totalQuantity = credits.reduce((sum, c) => sum + c.quantity, 0);
                      const percentage = (totalQuantity / portfolioStats.totalCredits) * 100;
                      const value = credits.reduce((sum, c) => sum + (c.quantity * c.currentPrice), 0);
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getCreditTypeColor(type)} variant="secondary">
                              {type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="font-medium">{totalQuantity.toLocaleString()} tonnes</p>
                              <p className="text-gray-500">${value.toLocaleString()}</p>
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 w-12">{percentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>
                  Your contribution to carbon reduction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-4xl mb-2">🌍</div>
                    <h3 className="text-2xl font-bold text-green-700">
                      {portfolioStats.totalCredits.toLocaleString()}
                    </h3>
                    <p className="text-green-600">tonnes CO₂e offset</p>
                  </div>
                  
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-4xl mb-2">🚗</div>
                    <h3 className="text-2xl font-bold text-blue-700">
                      {Math.round(portfolioStats.totalCredits * 2.3).toLocaleString()}
                    </h3>
                    <p className="text-blue-600">cars off road for 1 year</p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-4xl mb-2">🌳</div>
                    <h3 className="text-2xl font-bold text-purple-700">
                      {Math.round(portfolioStats.totalCredits * 45).toLocaleString()}
                    </h3>
                    <p className="text-purple-600">tree seedlings grown</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Impact Breakdown by Project Type</h4>
                  <div className="space-y-2 text-sm">
                    {portfolioCredits.map((credit) => (
                      <div key={credit.id} className="flex justify-between">
                        <span>{credit.creditType} - {credit.seller}</span>
                        <span className="font-medium">{credit.quantity.toLocaleString()} tonnes CO₂e</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}