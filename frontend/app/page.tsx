'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PlusCircleIcon } from 'lucide-react';
import PortfolioHoldings from '../components/PortfolioHoldings';
import PortfolioSummary from '../components/PortfolioSummary';
import StockAnalysis from '../components/StockAnalysis';
import TickerInput from '../components/TickerInput';
import { analyzePortfolio } from '../lib/api/portfolio';

interface PortfolioHolding {
  ticker: string;
  shares: number;
}

interface NewHolding {
  ticker: string;
  shares: number;
}

export default function Home() {
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([
    { ticker: 'AAPL', shares: 150 },
    { ticker: 'MSFT', shares: 100 },
    { ticker: 'AMZN', shares: 80 },
    { ticker: 'GOOGL', shares: 45 },
    { ticker: 'META', shares: 60 },
    { ticker: 'NVDA', shares: 120 },
    { ticker: 'SPY', shares: 200 },
    { ticker: 'QQQ', shares: 100 },
    { ticker: 'VTI', shares: 75 },
    { ticker: 'GLD', shares: 30 }
  ]);
  
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  const handleAddHolding = (newHolding: NewHolding) => {
    // Check if ticker already exists
    const existingIndex = portfolioHoldings.findIndex(
      holding => holding.ticker === newHolding.ticker
    );
    
    if (existingIndex >= 0) {
      // Update existing holding
      const updatedHoldings = [...portfolioHoldings];
      updatedHoldings[existingIndex] = {
        ...updatedHoldings[existingIndex],
        shares: updatedHoldings[existingIndex].shares + newHolding.shares
      };
      setPortfolioHoldings(updatedHoldings);
    } else {
      // Add new holding
      setPortfolioHoldings([...portfolioHoldings, newHolding]);
    }
  };

  const handleRemoveHolding = (ticker: string) => {
    setPortfolioHoldings(portfolioHoldings.filter(holding => holding.ticker !== ticker));
  };

  const handleUpdateHolding = (ticker: string, shares: number) => {
    setPortfolioHoldings(
      portfolioHoldings.map(holding => 
        holding.ticker === ticker ? { ...holding, shares } : holding
      )
    );
  };

  const handleAnalyzePortfolio = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzePortfolio(portfolioHoldings);
      setPortfolioAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze portfolio:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Investment Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-1">Track, analyze and optimize your investments</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleAnalyzePortfolio} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Portfolio'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 lg:col-span-2">
          <PortfolioSummary />
        </div>
        <div className="col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Add New Holding</h3>
                <div className="flex items-center gap-2">
                  <TickerInput onSelect={handleSelectTicker} />
                  <Button variant="outline" size="icon">
                    <PlusCircleIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Portfolio Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full" onClick={handleAnalyzePortfolio} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Risk & Return'}
                  </Button>
                  <Button className="w-full" variant="outline">
                    Import Holdings
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="holdings">
        <TabsList className="mb-4">
          <TabsTrigger value="holdings">Portfolio Holdings</TabsTrigger>
          <TabsTrigger value="analysis">Stock Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings">
          <PortfolioHoldings 
            holdings={portfolioHoldings}
            onRemove={handleRemoveHolding}
            onUpdate={handleUpdateHolding}
          />
        </TabsContent>
        <TabsContent value="analysis">
          {selectedTicker ? (
            <StockAnalysis ticker={selectedTicker} />
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-600">Select a ticker to view stock analysis</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}