"""Main service for analyzing investment portfolios."""
from app.services.openai_service import OpenAIService
from app.services.yahoo_finance_service import YahooFinanceService
from app.config import ENABLE_NEWS_SENTIMENT, ENABLE_TREND_FORECASTING


class AnalyzerService:
    @staticmethod
    async def analyze_portfolio(tickers):
        """
        Analyze a portfolio of stocks.
        
        Args:
            tickers (list): List of stock ticker symbols
            
        Returns:
            dict: Portfolio analysis including individual stock analyses
        """
        if not tickers:
            return {"error": "No tickers provided"}
            
        # Validate tickers
        valid_tickers = await YahooFinanceService.batch_validate_tickers(tickers)
        
        invalid_tickers = [ticker for ticker, valid in valid_tickers.items() if not valid]
        if invalid_tickers:
            return {"error": f"Invalid ticker(s): {', '.join(invalid_tickers)}"}
            
        # Valid tickers only
        valid_ticker_list = [ticker for ticker, valid in valid_tickers.items() if valid]
        
        # Analyze each stock
        analyses = {}
        for ticker in valid_ticker_list:
            analyses[ticker] = await AnalyzerService.analyze_stock(ticker)
            
        # Calculate portfolio-level metrics
        portfolio_risk = AnalyzerService._calculate_portfolio_risk(analyses)
        portfolio_sectors = AnalyzerService._extract_portfolio_sectors(analyses)
            
        return {
            "stocks": analyses,
            "portfolio_metrics": {
                "risk_level": portfolio_risk,
                "sector_distribution": portfolio_sectors
            }
        }
        
    @staticmethod
    async def analyze_stock(ticker):
        """
        Comprehensive analysis of a single stock.
        
        Args:
            ticker (str): Stock ticker symbol
            
        Returns:
            dict: Complete stock analysis
        """
        # Get basic stock data
        stock_data, company_info = await YahooFinanceService.get_stock_data(ticker)
        
        if "error" in stock_data:
            return {"error": stock_data["error"]}
            
        # Generate AI summary
        ai_summary = await OpenAIService.generate_summary(stock_data, company_info)
        
        result = {
            "ticker": ticker,
            "company_name": company_info.get("longName", "Unknown"),
            "sector": company_info.get("sector", "Unknown"),
            "current_price": stock_data.get("current_price", 0),
            "metrics": {
                "52_week_high": stock_data.get("fifty_two_week_high", 0),
                "52_week_low": stock_data.get("fifty_two_week_low", 0),
                "market_cap": company_info.get("marketCap", 0),
                "pe_ratio": company_info.get("trailingPE", 0),
                "dividend_yield": company_info.get("dividendYield", 0),
                "beta": company_info.get("beta", 0),
                "volatility_30d": stock_data.get("volatility_30d", 0)
            },
            "analysis": ai_summary.get("analysis", {}),
            "analysis_text": ai_summary.get("full_text", "")
        }
        
        # Add news sentiment analysis if enabled
        if ENABLE_NEWS_SENTIMENT:
            news = await YahooFinanceService.get_news(ticker)
            news_sentiment = await OpenAIService.analyze_news_sentiment(ticker, news)
            result["news"] = news
            result["news_sentiment"] = news_sentiment
            
        # Add trend forecasting if enabled
        if ENABLE_TREND_FORECASTING:
            forecast = await OpenAIService.forecast_trends(ticker, stock_data)
            result["forecast"] = forecast
            
        return result
        
    @staticmethod
    def _calculate_portfolio_risk(analyses):
        """
        Calculate overall portfolio risk based on individual stock analyses.
        
        Args:
            analyses (dict): Individual stock analyses
            
        Returns:
            str: Overall risk level (low, medium, high)
        """
        # Simple approach - average the risk assessments
        risk_mapping = {"low": 1, "medium": 2, "high": 3}
        risk_scores = []
        
        for ticker, analysis in analyses.items():
            # Extract risk assessment from AI analysis
            if "analysis" in analysis and "RISK ASSESSMENT" in analysis["analysis"]:
                risk_text = analysis["analysis"]["RISK ASSESSMENT"].lower()
                
                if "low" in risk_text:
                    risk_scores.append(risk_mapping["low"])
                elif "high" in risk_text:
                    risk_scores.append(risk_mapping["high"])
                else:
                    risk_scores.append(risk_mapping["medium"])
            else:
                # Default to medium if no assessment
                risk_scores.append(risk_mapping["medium"])
                
        if not risk_scores:
            return "medium"  # Default
            
        avg_risk = sum(risk_scores) / len(risk_scores)
        
        if avg_risk < 1.67:
            return "low"
        elif avg_risk > 2.33:
            return "high"
        else:
            return "medium"
            
    @staticmethod
    def _extract_portfolio_sectors(analyses):
        """
        Extract sector distribution from portfolio.
        
        Args:
            analyses (dict): Individual stock analyses
            
        Returns:
            dict: Sector distribution
        """
        sectors = {}
        
        for ticker, analysis in analyses.items():
            sector = analysis.get("sector", "Unknown")
            if sector in sectors:
                sectors[sector] += 1
            else:
                sectors[sector] = 1
                
        # Convert to percentages
        total = sum(sectors.values())
        if total > 0:
            for sector in sectors:
                sectors[sector] = round((sectors[sector] / total) * 100, 2)
                
        return sectors