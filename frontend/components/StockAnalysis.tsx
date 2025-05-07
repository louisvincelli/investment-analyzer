import React, { useState, useEffect } from 'react';
import { getStockAnalysis, getStockQuote, StockAnalysis as StockAnalysisType, StockQuote } from '../lib/api/stocks';
import { ArrowUpCircle, ArrowDownCircle, BarChart3, TrendingUp, TrendingDown, AlertCircle, Check, RefreshCw } from 'lucide-react';

interface StockAnalysisProps {
  ticker: string;
}

interface TechnicalIndicator {
  name: string;
  value: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

interface StrengthsWeaknesses {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface StockAnalysisData {
  recommendation: 'strong buy' | 'buy' | 'hold' | 'sell' | 'strong sell';
  analystCount: number;
  targetPriceLow: number;
  targetPriceAverage: number;
  targetPriceHigh: number;
  currentPrice: number;
  technicalIndicators: TechnicalIndicator[];
  strengthsWeaknesses: StrengthsWeaknesses;
  riskFactors: string[];
}

const StockAnalysis: React.FC<StockAnalysisProps> = ({ ticker }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [analysis, setAnalysis] = useState<StockAnalysisData | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!ticker) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch both quote and analysis in parallel
        const [quoteData, analysisData] = await Promise.all([
          getStockQuote(ticker),
          getStockAnalysis(ticker)
        ]);
        
        setQuote(quoteData);
        setAnalysis(analysisData);
      } catch (err: any) {
        console.error('Error fetching stock data:', err);
        setError(err.message || 'Failed to fetch stock data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [ticker]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatMarketCap = (value: number): string => {
    if (value >= 1e12) {
      return `${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else {
      return `${(value / 1e3).toFixed(2)}K`;
    }
  };

  const getRecommendationColor = (recommendation: StockAnalysisData['recommendation']): string => {
    switch (recommendation) {
      case 'strong buy':
        return 'bg-green-600';
      case 'buy':
        return 'bg-green-500';
      case 'hold':
        return 'bg-yellow-500';
      case 'sell':
        return 'bg-red-500';
      case 'strong sell':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getSignalIcon = (signal: TechnicalIndicator['signal']) => {
    switch (signal) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral':
        return <BarChart3 className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-500" />
            <p className="mt-4 text-gray-600">Loading stock analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="mt-4 text-gray-800 font-medium">Error loading stock analysis</p>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quote || !analysis) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
            <p className="mt-4 text-gray-600">No stock data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header with quote info */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{quote.ticker}</h2>
            <p className="text-gray-600">{quote.companyName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{formatCurrency(quote.price)}</div>
            <div className={`flex items-center justify-end ${quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {quote.change >= 0 ? 
                <ArrowUpCircle className="w-5 h-5 mr-1" /> : 
                <ArrowDownCircle className="w-5 h-5 mr-1" />
              }
              <span>
                {quote.change >= 0 ? '+' : ''}{formatCurrency(quote.change)} ({quote.changePercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Market Cap</p>
          <p className="font-medium">{formatMarketCap(quote.marketCap)}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">P/E Ratio</p>
          <p className="font-medium">{quote.peRatio !== null ? quote.peRatio.toFixed(2) : 'N/A'}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Dividend Yield</p>
          <p className="font-medium">{quote.dividendYield !== null ? `${quote.dividendYield}%` : 'N/A'}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Volume</p>
          <p className="font-medium">{quote.volume.toLocaleString()}</p>
        </div>
      </div>

      {/* Analyst Recommendations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Analyst Recommendations</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex flex-col items-center">
            <div className={`${getRecommendationColor(analysis.recommendation)} text-white text-lg font-bold py-2 px-4 rounded-lg uppercase`}>
              {analysis.recommendation}
            </div>
            <p className="mt-2 text-sm text-gray-600">Based on {analysis.analystCount} analysts</p>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Low Target</p>
                <p className="font-medium">{formatCurrency(analysis.targetPriceLow)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Average Target</p>
                <p className="font-bold">{formatCurrency(analysis.targetPriceAverage)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">High Target</p>
                <p className="font-medium">{formatCurrency(analysis.targetPriceHigh)}</p>
              </div>
            </div>
            
            {/* Price target bar */}
            <div className="relative h-6 bg-gray-200 rounded-full mt-3">
              <div className="absolute inset-y-0 left-0 bg-blue-100 rounded-l-full" 
                   style={{ width: `${(analysis.targetPriceLow / analysis.targetPriceHigh) * 100}%` }}></div>
              <div className="absolute inset-y-0 left-0 bg-blue-400" 
                   style={{ width: `${(analysis.targetPriceAverage / analysis.targetPriceHigh) * 100}%` }}></div>
              <div className="absolute inset-y-0 left-0 w-1 bg-gray-800 rounded-full" 
                   style={{ left: `${(analysis.currentPrice / analysis.targetPriceHigh) * 100}%` }}></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{formatCurrency(0)}</span>
              <span>Current: {formatCurrency(analysis.currentPrice)}</span>
              <span>{formatCurrency(analysis.targetPriceHigh)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Indicators and SWOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Technical Indicators */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Technical Indicators</h3>
          <div className="space-y-3">
            {analysis.technicalIndicators.map((indicator, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-2">
                <div>
                  <p className="font-medium">{indicator.name}</p>
                  <p className="text-sm text-gray-600">{indicator.value}</p>
                </div>
                <div className="flex items-center">
                  {getSignalIcon(indicator.signal)}
                  <span className="ml-1 text-sm">{indicator.signal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* SWOT Analysis */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">SWOT Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
              <ul className="text-sm space-y-1">
                {analysis.strengthsWeaknesses.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">Weaknesses</h4>
              <ul className="text-sm space-y-1">
                {analysis.strengthsWeaknesses.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-600 mb-2">Opportunities</h4>
              <ul className="text-sm space-y-1">
                {analysis.strengthsWeaknesses.opportunities.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-2">Threats</h4>
              <ul className="text-sm space-y-1">
                {analysis.strengthsWeaknesses.threats.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <TrendingDown className="w-4 h-4 text-orange-500 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Risk Factors</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.riskFactors.map((risk: string, idx: number) => (
            <li key={idx} className="flex items-start">
              <AlertCircle className="w-4 h-4 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{risk}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StockAnalysis;