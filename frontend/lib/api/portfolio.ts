import { apiClient } from './client';

export interface PortfolioHolding {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  weight: number;
}

export interface PortfolioSummary {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
  overallReturn: number;
  overallReturnPercentage: number;
  riskScore: number;
  diversificationScore: number;
  assets: {
    name: string;
    value: number;
    allocation: number;
    color: string;
  }[];
}

export interface PortfolioAnalysis {
  summary: PortfolioSummary;
  holdings: PortfolioHolding[];
  riskAnalysis: {
    volatility: number;
    sharpeRatio: number;
    betaToSP500: number;
    drawdowns: {
      period: string;
      percentage: number;
    }[];
  };
  sectorExposure: {
    sector: string;
    allocation: number;
    benchmark: number;
    difference: number;
  }[];
  recommendations: {
    type: 'buy' | 'sell' | 'hold' | 'rebalance';
    description: string;
    rationale: string;
    tickers?: string[];
  }[];
}

/**
 * Mock portfolio data for development
 */
const MOCK_PORTFOLIO_ANALYSIS: PortfolioAnalysis = {
  summary: {
    totalValue: 285750.42,
    dailyChange: 3241.87,
    dailyChangePercentage: 1.15,
    overallReturn: 35750.42,
    overallReturnPercentage: 14.3,
    riskScore: 7.2,
    diversificationScore: 8.5,
    assets: [
      { name: 'Stocks', value: 145250.33, allocation: 50.8, color: '#3366CC' },
      { name: 'Bonds', value: 57150.08, allocation: 20, color: '#DC3912' },
      { name: 'Cash', value: 28575.04, allocation: 10, color: '#FF9900' },
      { name: 'Real Estate', value: 34290.05, allocation: 12, color: '#109618' },
      { name: 'Crypto', value: 20002.53, allocation: 7, color: '#990099' },
      { name: 'Commodities', value: 482.39, allocation: 0.2, color: '#0099C6' }
    ]
  },
  holdings: [
    {
      ticker: 'AAPL',
      shares: 150,
      avgCost: 135.75,
      currentPrice: 175.25,
      value: 26287.50,
      dayChange: 412.50,
      dayChangePercent: 1.59,
      totalReturn: 5925.00,
      totalReturnPercent: 29.10,
      weight: 9.2
    },
    {
      ticker: 'MSFT',
      shares: 100,
      avgCost: 245.30,
      currentPrice: 312.75,
      value: 31275.00,
      dayChange: 225.00,
      dayChangePercent: 0.73,
      totalReturn: 6745.00,
      totalReturnPercent: 27.50,
      weight: 10.9
    },
    {
      ticker: 'AMZN',
      shares: 80,
      avgCost: 115.45,
      currentPrice: 142.30,
      value: 11384.00,
      dayChange: 187.20,
      dayChangePercent: 1.67,
      totalReturn: 2148.00,
      totalReturnPercent: 23.26,
      weight: 4.0
    },
    {
      ticker: 'GOOGL',
      shares: 45,
      avgCost: 95.35,
      currentPrice: 133.20,
      value: 5994.00,
      dayChange: 47.25,
      dayChangePercent: 0.79,
      totalReturn: 1704.75,
      totalReturnPercent: 39.70,
      weight: 2.1
    },
    {
      ticker: 'META',
      shares: 60,
      avgCost: 192.45,
      currentPrice: 324.35,
      value: 19461.00,
      dayChange: 357.00,
      dayChangePercent: 1.87,
      totalReturn: 7914.00,
      totalReturnPercent: 68.54,
      weight: 6.8
    },
    {
      ticker: 'NVDA',
      shares: 120,
      avgCost: 175.20,
      currentPrice: 424.80,
      value: 50976.00,
      dayChange: 1524.00,
      dayChangePercent: 3.08,
      totalReturn: 29952.00,
      totalReturnPercent: 142.47,
      weight: 17.8
    },
    {
      ticker: 'SPY',
      shares: 200,
      avgCost: 383.15,
      currentPrice: 415.75,
      value: 83150.00,
      dayChange: 518.00,
      dayChangePercent: 0.63,
      totalReturn: 6520.00,
      totalReturnPercent: 8.51,
      weight: 29.1
    },
    {
      ticker: 'QQQ',
      shares: 100,
      avgCost: 315.25,
      currentPrice: 375.45,
      value: 37545.00,
      dayChange: 487.00,
      dayChangePercent: 1.31,
      totalReturn: 6020.00,
      totalReturnPercent: 19.09,
      weight: 13.1
    },
    {
      ticker: 'VTI',
      shares: 75,
      avgCost: 195.40,
      currentPrice: 225.10,
      value: 16882.50,
      dayChange: 97.50,
      dayChangePercent: 0.58,
      totalReturn: 2227.50,
      totalReturnPercent: 15.20,
      weight: 5.9
    },
    {
      ticker: 'GLD',
      shares: 30,
      avgCost: 162.35,
      currentPrice: 198.75,
      value: 5962.50,
      dayChange: -114.00,
      dayChangePercent: -1.88,
      totalReturn: 1092.00,
      totalReturnPercent: 22.42,
      weight: 2.1
    }
  ],
  riskAnalysis: {
    volatility: 15.7,
    sharpeRatio: 1.2,
    betaToSP500: 1.05,
    drawdowns: [
      { period: 'Max', percentage: 18.5 },
      { period: '1 Year', percentage: 12.3 },
      { period: '6 Months', percentage: 8.7 },
      { period: '3 Months', percentage: 5.2 }
    ]
  },
  sectorExposure: [
    { sector: 'Technology', allocation: 42.5, benchmark: 28.7, difference: 13.8 },
    { sector: 'Communication Services', allocation: 8.9, benchmark: 10.2, difference: -1.3 },
    { sector: 'Consumer Discretionary', allocation: 12.3, benchmark: 14.5, difference: -2.2 },
    { sector: 'Health Care', allocation: 6.2, benchmark: 13.1, difference: -6.9 },
    { sector: 'Financials', allocation: 7.5, benchmark: 12.8, difference: -5.3 },
    { sector: 'Industrials', allocation: 8.2, benchmark: 9.5, difference: -1.3 },
    { sector: 'Consumer Staples', allocation: 4.3, benchmark: 5.9, difference: -1.6 },
    { sector: 'Energy', allocation: 3.2, benchmark: 4.3, difference: -1.1 },
    { sector: 'Materials', allocation: 2.8, benchmark: 2.5, difference: 0.3 },
    { sector: 'Utilities', allocation: 2.4, benchmark: 2.9, difference: -0.5 },
    { sector: 'Real Estate', allocation: 1.7, benchmark: 2.5, difference: -0.8 }
  ],
  recommendations: [
    {
      type: 'rebalance',
      description: 'Consider reducing tech exposure',
      rationale: 'Your portfolio is overweight in technology at 42.5% vs benchmark 28.7%. Consider diversifying into other sectors.',
      tickers: ['NVDA', 'AAPL']
    },
    {
      type: 'buy',
      description: 'Add healthcare exposure',
      rationale: 'Healthcare is significantly underweight in your portfolio. Consider adding exposure to this defensive sector.',
      tickers: ['JNJ', 'UNH', 'XLV']
    },
    {
      type: 'hold',
      description: 'Maintain current bond allocation',
      rationale: 'Your current bond allocation is appropriate for your risk profile.',
    },
    {
      type: 'sell',
      description: 'Consider taking some profits in NVDA',
      rationale: 'NVDA has appreciated significantly (+142%) and now represents a large portion of your portfolio. Consider trimming to manage risk.',
      tickers: ['NVDA']
    }
  ]
};

/**
 * Analyze a portfolio based on provided holdings
 * 
 * @param holdings - List of portfolio holdings with ticker and shares
 * @returns Portfolio analysis results
 */
export async function analyzePortfolio(
  holdings: Array<{ ticker: string; shares: number }>
): Promise<PortfolioAnalysis> {
  try {
    // In a real app, this would call the API
    // return await apiClient.post<PortfolioAnalysis>('/portfolio/analyze', { holdings });
    
    // For development, return mock data with a delay to simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_PORTFOLIO_ANALYSIS);
      }, 1500);
    });
  } catch (error) {
    console.error('Failed to analyze portfolio:', error);
    throw error;
  }
}

/**
 * Get detailed portfolio summary 
 * 
 * @returns Portfolio summary data
 */
export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  try {
    // In a real app, this would call the API
    // return await apiClient.get<PortfolioSummary>('/portfolio/summary');
    
    // For development, return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_PORTFOLIO_ANALYSIS.summary);
      }, 800);
    });
  } catch (error) {
    console.error('Failed to get portfolio summary:', error);
    throw error;
  }
}

/**
 * Get portfolio holdings
 * 
 * @returns List of portfolio holdings
 */
export async function getPortfolioHoldings(): Promise<PortfolioHolding[]> {
  try {
    // In a real app, this would call the API
    // return await apiClient.get<PortfolioHolding[]>('/portfolio/holdings');
    
    // For development, return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_PORTFOLIO_ANALYSIS.holdings);
      }, 800);
    });
  } catch (error) {
    console.error('Failed to get portfolio holdings:', error);
    throw error;
  }
}