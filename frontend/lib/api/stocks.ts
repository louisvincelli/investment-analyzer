import { apiClient } from './client';

export interface StockQuote {
  ticker: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number | null;
  dividend: number | null;
  dividendYield: number | null;
  exchange: string;
}

export interface StockDetails {
  ticker: string;
  companyName: string;
  description: string;
  sector: string;
  industry: string;
  website: string;
  ceo: string;
  employees: number;
  headquarters: string;
  foundedYear: number;
}

export interface StockFinancials {
  ticker: string;
  revenue: number[];
  revenueGrowth: number[];
  eps: number[];
  epsGrowth: number[];
  freeCashFlow: number[];
  grossMargin: number[];
  operatingMargin: number[];
  netMargin: number[];
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  returnOnEquity: number;
  returnOnAssets: number;
  periods: string[];
}

export interface StockAnalysis {
  ticker: string;
  companyName: string;
  currentPrice: number;
  targetPriceLow: number;
  targetPriceAverage: number;
  targetPriceHigh: number;
  recommendation: 'strong buy' | 'buy' | 'hold' | 'sell' | 'strong sell';
  analystCount: number;
  strengthsWeaknesses: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  riskFactors: string[];
  technicalIndicators: {
    name: string;
    value: string;
    signal: 'bullish' | 'bearish' | 'neutral';
  }[];
}

export interface TickerValidationResult {
  isValid: boolean;
  ticker?: string;
  companyName?: string;
  exchange?: string;
  suggestions?: Array<{
    ticker: string;
    companyName: string;
    exchange: string;
  }>;
}

// Mock valid tickers for development
const VALID_TICKERS = new Set([
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 
  'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'HD', 'BAC', 'XOM', 'DIS', 'NFLX', 'ADBE', 
  'CRM', 'INTC', 'VZ', 'KO', 'PEP', 'T', 'CSCO', 'ABT', 'ORCL', 'NKE', 'MRK',
  'PFE', 'TMO', 'CMCSA', 'COST', 'ACN', 'AVGO', 'DHR', 'MCD', 'AMD', 'LLY',
  'TXN', 'NEE', 'UNP', 'PM', 'MS', 'C', 'AMT', 'QCOM', 'HON', 'IBM', 'GS', 'GE',
  'CVX', 'SPY', 'QQQ', 'VTI', 'GLD', 'IWM', 'EEM', 'AGG', 'VEA', 'BND', 'VWO'
]);

// Mock ticker data for development
const TICKER_INFO: Record<string, { companyName: string, exchange: string }> = {
  'AAPL': { companyName: 'Apple Inc.', exchange: 'NASDAQ' },
  'MSFT': { companyName: 'Microsoft Corporation', exchange: 'NASDAQ' },
  'GOOGL': { companyName: 'Alphabet Inc. Class A', exchange: 'NASDAQ' },
  'GOOG': { companyName: 'Alphabet Inc. Class C', exchange: 'NASDAQ' },
  'AMZN': { companyName: 'Amazon.com, Inc.', exchange: 'NASDAQ' },
  'META': { companyName: 'Meta Platforms, Inc.', exchange: 'NASDAQ' },
  'TSLA': { companyName: 'Tesla, Inc.', exchange: 'NASDAQ' },
  'NVDA': { companyName: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  'JPM': { companyName: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  'V': { companyName: 'Visa Inc.', exchange: 'NYSE' },
  'SPY': { companyName: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE ARCA' },
  'QQQ': { companyName: 'Invesco QQQ Trust', exchange: 'NASDAQ' },
  'VTI': { companyName: 'Vanguard Total Stock Market ETF', exchange: 'NYSE ARCA' },
  'GLD': { companyName: 'SPDR Gold Shares', exchange: 'NYSE ARCA' }
};

/**
 * Validate a stock ticker symbol
 * 
 * @param ticker - Ticker symbol to validate
 * @returns Validation result with suggestions if invalid
 */
export async function validateTicker(ticker: string): Promise<TickerValidationResult> {
  try {
    // In a real app, this would call the API
    // return await apiClient.get<TickerValidationResult>(`/stocks/validate/${ticker}`);
    
    // For development, use mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedTicker = ticker.toUpperCase().trim();
        
        if (VALID_TICKERS.has(normalizedTicker)) {
          const info = TICKER_INFO[normalizedTicker] || { 
            companyName: `${normalizedTicker} Inc.`,
            exchange: 'NASDAQ'
          };
          
          resolve({
            isValid: true,
            ticker: normalizedTicker,
            companyName: info.companyName,
            exchange: info.exchange
          });
        } else {
          // Generate suggestions for invalid tickers
          const suggestions = Array.from(VALID_TICKERS)
            .filter(validTicker => {
              // Simple suggestion algorithm - tickers that start with the same letter
              return validTicker.startsWith(normalizedTicker.charAt(0)) ||
                validTicker.includes(normalizedTicker.charAt(0));
            })
            .slice(0, 5)
            .map(ticker => ({
              ticker,
              companyName: TICKER_INFO[ticker]?.companyName || `${ticker} Inc.`,
              exchange: TICKER_INFO[ticker]?.exchange || 'NASDAQ'
            }));
          
          resolve({
            isValid: false,
            suggestions
          });
        }
      }, 500);
    });
  } catch (error) {
    console.error('Failed to validate ticker:', error);
    throw error;
  }
}

/**
 * Get a stock quote by ticker symbol
 * 
 * @param ticker - Ticker symbol
 * @returns Stock quote information
 */
export async function getStockQuote(ticker: string): Promise<StockQuote> {
  try {
    // In a real app, this would call the API
    // return await apiClient.get<StockQuote>(`/stocks/quote/${ticker}`);
    
    // For development, generate mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedTicker = ticker.toUpperCase().trim();
        const info = TICKER_INFO[normalizedTicker] || { 
          companyName: `${normalizedTicker} Inc.`,
          exchange: 'NASDAQ'
        };
        
        // Generate realistic mock data
        const basePrice = Math.round(100 + Math.random() * 900) / 2;
        const change = Math.round((Math.random() * 2 - 1) * basePrice * 0.05 * 100) / 100;
        const changePercent = Math.round((change / basePrice) * 10000) / 100;
        
        resolve({
          ticker: normalizedTicker,
          companyName: info.companyName,
          price: basePrice,
          change,
          changePercent,
          volume: Math.round(Math.random() * 10000000),
          avgVolume: Math.round(Math.random() * 15000000),
          marketCap: Math.round(basePrice * (10000000000 + Math.random() * 90000000000)),
          peRatio: Math.random() > 0.1 ? Math.round(Math.random() * 50 * 10) / 10 : null,
          dividend: Math.random() > 0.3 ? Math.round(Math.random() * 5 * 100) / 100 : null,
          dividendYield: Math.random() > 0.3 ? Math.round(Math.random() * 5 * 100) / 100 : null,
          exchange: info.exchange
        });
      }, 700);
    });
  } catch (error) {
    console.error('Failed to get stock quote:', error);
    throw error;
  }
}

/**
 * Get detailed stock analysis
 * 
 * @param ticker - Ticker symbol
 * @returns Detailed stock analysis
 */
export async function getStockAnalysis(ticker: string): Promise<StockAnalysis> {
  try {
    // In a real app, this would call the API
    // return await apiClient.get<StockAnalysis>(`/stocks/analysis/${ticker}`);
    
    // For development, generate mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedTicker = ticker.toUpperCase().trim();
        const info = TICKER_INFO[normalizedTicker] || { 
          companyName: `${normalizedTicker} Inc.`,
          exchange: 'NASDAQ'
        };
        
        // Generate realistic mock data
        const currentPrice = Math.round(100 + Math.random() * 900) / 2;
        const recommendations = ['strong buy', 'buy', 'hold', 'sell', 'strong sell'];
        const recommendationIndex = Math.floor(Math.random() * 5);
        
        // Generate target prices based on current price and recommendation
        const targetFactor = 1 + (2 - recommendationIndex) * 0.1; // Higher for buy, lower for sell
        
        resolve({
          ticker: normalizedTicker,
          companyName: info.companyName,
          currentPrice,
          targetPriceLow: Math.round(currentPrice * (0.9 + (recommendationIndex * 0.05)) * 100) / 100,
          targetPriceAverage: Math.round(currentPrice * targetFactor * 100) / 100,
          targetPriceHigh: Math.round(currentPrice * (1.3 - (recommendationIndex * 0.05)) * 100) / 100,
          recommendation: recommendations[recommendationIndex] as any,
          analystCount: 5 + Math.floor(Math.random() * 25),
          strengthsWeaknesses: {
            strengths: [
              'Strong market position',
              'Robust financial performance',
              'Innovative product pipeline'
            ],
            weaknesses: [
              'Increasing competition',
              'Margin pressure in core business',
              'Regulatory challenges'
            ],
            opportunities: [
              'Expansion into adjacent markets',
              'Growth in international regions',
              'Strategic acquisitions'
            ],
            threats: [
              'Changing consumer preferences',
              'Disruptive technologies',
              'Economic slowdown impact'
            ]
          },
          riskFactors: [
            'Concentration risk in key markets',
            'Supply chain disruptions',
            'Intellectual property challenges',
            'Talent retention challenges'
          ],
          technicalIndicators: [
            {
              name: 'Moving Average (50-day)',
              value: `$${(currentPrice * 0.95).toFixed(2)}`,
              signal: 'bullish'
            },
            {
              name: 'Moving Average (200-day)',
              value: `$${(currentPrice * 0.9).toFixed(2)}`,
              signal: 'bullish'
            },
            {
              name: 'Relative Strength Index (RSI)',
              value: `${Math.floor(40 + Math.random() * 30)}`,
              signal: 'neutral'
            },
            {
              name: 'MACD',
              value: `${(Math.random() * 2 - 1).toFixed(2)}`,
              signal: Math.random() > 0.5 ? 'bullish' : 'bearish'
            }
          ]
        });
      }, 1200);
    });
  } catch (error) {
    console.error('Failed to get stock analysis:', error);
    throw error;
  }
}