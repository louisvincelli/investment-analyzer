"""Service for interacting with Yahoo Finance API."""
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
import json
from app.config import RAPID_API_KEY


class YahooFinanceService:
    @staticmethod
    async def get_stock_data(ticker):
        """
        Get comprehensive stock data for a specific ticker.
        
        Args:
            ticker (str): Stock ticker symbol
            
        Returns:
            tuple: (stock_data, company_info) containing historical and fundamental data
        """
        try:
            # Get stock information
            stock = yf.Ticker(ticker)
            
            # Get company info
            company_info = stock.info
            
            # Get historical data (1 year)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            hist_data = stock.history(start=start_date, end=end_date)
            
            # Calculate key metrics
            if not hist_data.empty:
                current_price = hist_data['Close'].iloc[-1]
                fifty_two_week_high = hist_data['High'].max()
                fifty_two_week_low = hist_data['Low'].min()
                
                # Calculate volatility (30-day standard deviation of returns)
                returns = hist_data['Close'].pct_change().dropna()
                volatility_30d = returns[-30:].std() * np.sqrt(252) * 100  # Annualized and as percentage
                
                # Calculate 90-day trend
                trend_90d = "upward" if hist_data['Close'][-1] > hist_data['Close'][-90] else "downward"
                
                # Daily percent changes
                percent_changes = returns.multiply(100).tolist()
                
                # Close prices dict for display
                close_prices = hist_data['Close'].tail(30).to_dict()
                close_prices = {str(k.date()): float(v) for k, v in close_prices.items()}
                
                stock_data = {
                    "current_price": float(current_price),
                    "fifty_two_week_high": float(fifty_two_week_high),
                    "fifty_two_week_low": float(fifty_two_week_low),
                    "volatility_30d": float(volatility_30d),
                    "trend_90d": trend_90d,
                    "percent_changes": percent_changes,
                    "close_prices": close_prices,
                    "volume": hist_data['Volume'].tail(30).tolist(),
                }
            else:
                stock_data = {
                    "error": "No historical data available"
                }
            
            return stock_data, company_info
        
        except Exception as e:
            return {"error": f"Failed to fetch stock data: {str(e)}"}, {}

    @staticmethod
    async def get_news(ticker, limit=10):
        """
        Get news articles related to a stock.
        
        Args:
            ticker (str): Stock ticker symbol
            limit (int): Maximum number of news articles
            
        Returns:
            list: News articles related to the stock
        """
        try:
            # Standard yfinance way - limited but free
            stock = yf.Ticker(ticker)
            news = stock.news
            
            formatted_news = []
            for article in news[:limit]:
                formatted_news.append({
                    "title": article.get("title", "No Title"),
                    "publisher": article.get("publisher", "Unknown"),
                    "link": article.get("link", ""),
                    "date": datetime.fromtimestamp(article.get("providerPublishTime", 0)).strftime("%Y-%m-%d"),
                    "summary": article.get("summary", "No summary available")
                })
            
            return formatted_news
            
        except Exception as e:
            return [{"error": f"Failed to fetch news: {str(e)}"}]
    
    @staticmethod
    async def get_news_via_rapid_api(ticker, limit=10):
        """
        Get news articles related to a stock using Rapid API (Yahoo Finance API).
        This is an alternative method requiring a Rapid API key.
        
        Args:
            ticker (str): Stock ticker symbol
            limit (int): Maximum number of news articles
            
        Returns:
            list: News articles related to the stock
        """
        # Skip if no Rapid API key is provided
        if not RAPID_API_KEY:
            return await YahooFinanceService.get_news(ticker, limit)
            
        url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-news"
        
        querystring = {"category": ticker, "region": "US"}
        
        headers = {
            "X-RapidAPI-Key": RAPID_API_KEY,
            "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
        }
        
        try:
            response = requests.get(url, headers=headers, params=querystring)
            data = response.json()
            
            if "items" not in data or "result" not in data:
                # Fall back to standard method
                return await YahooFinanceService.get_news(ticker, limit)
                
            formatted_news = []
            for article in data["items"]["result"][:limit]:
                formatted_news.append({
                    "title": article.get("title", "No Title"),
                    "publisher": article.get("publisher", "Unknown"),
                    "link": article.get("link", ""),
                    "date": article.get("published_at", "Unknown date"),
                    "summary": article.get("summary", "No summary available")
                })
                
            return formatted_news
            
        except Exception as e:
            # Fall back to standard method on error
            return await YahooFinanceService.get_news(ticker, limit)
            
    @staticmethod
    async def validate_ticker(ticker):
        """
        Validate if a ticker symbol exists.
        
        Args:
            ticker (str): Stock ticker symbol
            
        Returns:
            bool: True if ticker exists, False otherwise
        """
        try:
            stock = yf.Ticker(ticker)
            # A simple check - try to get the current price
            info = stock.info
            return 'regularMarketPrice' in info or 'currentPrice' in info
        except:
            return False
            
    @staticmethod
    async def batch_validate_tickers(tickers):
        """
        Validate multiple ticker symbols.
        
        Args:
            tickers (list): List of stock ticker symbols
            
        Returns:
            dict: Dictionary with tickers as keys and boolean values
        """
        results = {}
        for ticker in tickers:
            results[ticker] = await YahooFinanceService.validate_ticker(ticker)
        return results