import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trash2Icon } from 'lucide-react';

interface PortfolioHolding {
  ticker: string;
  shares: number;
}

interface PortfolioHoldingsProps {
  holdings: PortfolioHolding[];
  onRemove: (ticker: string) => void;
  onUpdate: (ticker: string, shares: number) => void;
}

export default function PortfolioHoldings({ holdings, onRemove, onUpdate }: PortfolioHoldingsProps) {
  return (
    <div className="space-y-4">
      {holdings.map((holding) => (
        <Card key={holding.ticker}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{holding.ticker}</h3>
                <p className="text-sm text-gray-500">{holding.shares} shares</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={holding.shares}
                  onChange={(e) => onUpdate(holding.ticker, parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded"
                  min="0"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRemove(holding.ticker)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {holdings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No holdings added yet. Add your first holding using the form above.
        </div>
      )}
    </div>
  );
} 