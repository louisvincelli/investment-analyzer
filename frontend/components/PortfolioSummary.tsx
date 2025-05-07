import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Settings, Download, RefreshCw } from 'lucide-react';

interface Asset {
  name: string;
  value: number;
  allocation: number;
  color: string;
}

interface PortfolioData {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
  overallReturn: number;
  overallReturnPercentage: number;
  assets: Asset[];
}

interface PerformanceData {
  month: string;
  return: number;
}

const PortfolioSummary: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 0,
    dailyChange: 0,
    dailyChangePercentage: 0,
    overallReturn: 0,
    overallReturnPercentage: 0,
    assets: []
  });
  
  const [loading, setLoading] = useState<boolean>(true);

  // Mock data for demonstration
  const mockData: PortfolioData = {
    totalValue: 285750.42,
    dailyChange: 3241.87,
    dailyChangePercentage: 1.15,
    overallReturn: 35750.42,
    overallReturnPercentage: 14.3,
    assets: [
      { name: 'Stocks', value: 145250.33, allocation: 50.8, color: '#3366CC' },
      { name: 'Bonds', value: 57150.08, allocation: 20, color: '#DC3912' },
      { name: 'Cash', value: 28575.04, allocation: 10, color: '#FF9900' },
      { name: 'Real Estate', value: 34290.05, allocation: 12, color: '#109618' },
      { name: 'Crypto', value: 20002.53, allocation: 7, color: '#990099' },
      { name: 'Commodities', value: 482.39, allocation: 0.2, color: '#0099C6' }
    ]
  };

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setPortfolioData(mockData);
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Historical performance data
  const performanceData: PerformanceData[] = [
    { month: 'Jan', return: 2.3 },
    { month: 'Feb', return: -1.2 },
    { month: 'Mar', return: 3.5 },
    { month: 'Apr', return: 1.8 },
    { month: 'May', return: -0.7 },
    { month: 'Jun', return: 4.2 },
    { month: 'Jul', return: 2.1 },
    { month: 'Aug', return: 0.9 },
    { month: 'Sep', return: -2.3 },
    { month: 'Oct', return: 3.7 },
    { month: 'Nov', return: 2.8 },
    { month: 'Dec', return: 1.5 }
  ];

  // For pie chart colors
  const COLORS: string[] = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#0099C6'];

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Portfolio Summary</h2>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={refreshData}
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-gray-500 text-sm">Total Value</h3>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(portfolioData.totalValue)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-gray-500 text-sm">Daily Change</h3>
          <p className={`text-2xl font-bold ${portfolioData.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolioData.dailyChange >= 0 ? '+' : ''}{formatCurrency(portfolioData.dailyChange)} ({portfolioData.dailyChangePercentage}%)
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-gray-500 text-sm">Overall Return</h3>
          <p className={`text-2xl font-bold ${portfolioData.overallReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolioData.overallReturn >= 0 ? '+' : ''}{formatCurrency(portfolioData.overallReturn)} ({portfolioData.overallReturnPercentage}%)
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-gray-500 text-sm">Asset Count</h3>
          <p className="text-2xl font-bold text-gray-800">{portfolioData.assets.length}</p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Asset Allocation Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Asset Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData.assets}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {portfolioData.assets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(name) => `Asset: ${name}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance Chart */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  domain={[-3, 5]}
                />
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  dataKey="return" 
                  fill="#3366CC"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Asset breakdown table */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Asset Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioData.assets.map((asset, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: asset.color }}></div>
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(asset.value)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.allocation}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;