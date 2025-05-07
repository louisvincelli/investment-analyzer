"""Service for interacting with OpenAI API."""
import openai
from app.config import OPENAI_API_KEY, OPENAI_MODEL

# Configure OpenAI API
openai.api_key = OPENAI_API_KEY


class OpenAIService:
    @staticmethod
    async def generate_summary(stock_data, company_info):
        """
        Generate a summary of stock analysis using OpenAI.
        
        Args:
            stock_data (dict): Historical stock data and metrics
            company_info (dict): Company fundamental information
            
        Returns:
            dict: AI-generated analysis including risk assessment,
                 volatility analysis and fundamental analysis
        """
        try:
            # Prepare prompt with stock data
            prompt = f"""
            As a financial expert, analyze this stock data and provide insights:
            
            Ticker: {company_info.get('symbol', 'Unknown')}
            Company: {company_info.get('longName', 'Unknown')}
            Sector: {company_info.get('sector', 'Unknown')}
            Industry: {company_info.get('industry', 'Unknown')}
            
            Key Metrics:
            - Current Price: ${stock_data.get('current_price', 'N/A')}
            - 52-Week High: ${stock_data.get('fifty_two_week_high', 'N/A')}
            - 52-Week Low: ${stock_data.get('fifty_two_week_low', 'N/A')}
            - P/E Ratio: {company_info.get('trailingPE', 'N/A')}
            - Market Cap: ${company_info.get('marketCap', 'N/A')}
            - Beta: {company_info.get('beta', 'N/A')}
            - Average Volume: {company_info.get('averageVolume', 'N/A')}
            
            Based on this information, provide a concise analysis with these sections:
            1. RISK ASSESSMENT: Evaluate the overall risk level (low/medium/high) with reasoning.
            2. VOLATILITY ANALYSIS: Analyze price stability and comparison to market.
            3. FUNDAMENTAL ANALYSIS: Key strengths and concerns based on the fundamentals.
            4. SUMMARY: A 2-3 sentence overall assessment.
            
            Keep each section brief and focused on actionable insights.
            """
            
            response = await openai.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a precise financial analyst providing concise stock assessments."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            analysis_text = response.choices[0].message.content
            
            # Simple parsing of the sections
            sections = {}
            current_section = None
            section_content = []
            
            for line in analysis_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                    
                if any(section in line.upper() for section in ["RISK ASSESSMENT", "VOLATILITY ANALYSIS", "FUNDAMENTAL ANALYSIS", "SUMMARY"]):
                    if current_section and section_content:
                        sections[current_section] = '\n'.join(section_content)
                        section_content = []
                    current_section = line.split(':')[0].strip()
                else:
                    if current_section:
                        section_content.append(line)
            
            # Add the last section
            if current_section and section_content:
                sections[current_section] = '\n'.join(section_content)
                
            return {
                "analysis": sections,
                "full_text": analysis_text
            }
            
        except Exception as e:
            return {
                "error": f"Failed to generate analysis: {str(e)}",
                "analysis": {},
                "full_text": ""
            }
    
    @staticmethod
    async def analyze_news_sentiment(ticker, news_data):
        """
        Analyze news sentiment for a given stock using OpenAI.
        
        Args:
            ticker (str): Stock ticker symbol
            news_data (list): List of news articles related to the stock
            
        Returns:
            dict: Sentiment analysis of recent news
        """
        if not news_data or len(news_data) == 0:
            return {"sentiment": "neutral", "explanation": "No recent news data available"}
        
        # Prepare news snippets for the prompt
        news_snippets = []
        for i, article in enumerate(news_data[:5]):  # Limit to 5 articles
            title = article.get('title', 'No title')
            date = article.get('date', 'Unknown date')
            news_snippets.append(f"{i+1}. {title} ({date})")
        
        news_text = "\n".join(news_snippets)
        
        prompt = f"""
        As a financial news analyst, review these recent news headlines about {ticker}:
        
        {news_text}
        
        Based on these headlines, provide:
        1. Overall sentiment: bullish, bearish, or neutral
        2. A brief explanation (2-3 sentences) of your assessment
        3. Potential market impact (short-term)
        """
        
        try:
            response = await openai.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a financial news analyst providing concise sentiment analysis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            analysis = response.choices[0].message.content
            
            # Extract overall sentiment (simple approach)
            sentiment = "neutral"  # Default
            if "bullish" in analysis.lower():
                sentiment = "bullish"
            elif "bearish" in analysis.lower():
                sentiment = "bearish"
                
            return {
                "sentiment": sentiment,
                "analysis": analysis
            }
            
        except Exception as e:
            return {
                "error": f"Failed to analyze news sentiment: {str(e)}",
                "sentiment": "neutral",
                "analysis": ""
            }

    @staticmethod
    async def forecast_trends(ticker, historical_data):
        """
        Generate forecast and trend analysis using OpenAI.
        
        Args:
            ticker (str): Stock ticker symbol
            historical_data (dict): Historical price and volume data
            
        Returns:
            dict: Trend forecasting and analysis
        """
        try:
            # Extract key metrics for the prompt
            recent_prices = []
            for date, price in list(historical_data.get('close_prices', {}).items())[-10:]:
                recent_prices.append(f"{date}: ${price:.2f}")
            
            price_trend = "\n".join(recent_prices)
            
            recent_changes = historical_data.get('percent_changes', [])[-5:]
            avg_change = sum(recent_changes) / len(recent_changes) if recent_changes else 0
            
            prompt = f"""
            As a technical analyst, forecast trends for {ticker} based on this data:
            
            Recent closing prices:
            {price_trend}
            
            Average recent daily change: {avg_change:.2f}%
            30-day volatility: {historical_data.get('volatility_30d', 'N/A')}
            90-day trend direction: {historical_data.get('trend_90d', 'N/A')}
            
            Based on technical analysis principles, provide:
            1. SHORT-TERM OUTLOOK (1-2 weeks): Direction and key levels
            2. POTENTIAL CATALYSTS: Technical factors that could affect price
            3. KEY INDICATORS: Important technical signals currently showing
            4. SUMMARY: A concise forecast statement
            
            Avoid making specific price predictions. Focus on trend direction and technical patterns.
            """
            
            response = await openai.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a precise technical analyst providing trend forecasts based on historical data."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            forecast_text = response.choices[0].message.content
            
            # Simple parsing of the sections
            sections = {}
            current_section = None
            section_content = []
            
            for line in forecast_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                    
                if any(section in line.upper() for section in ["SHORT-TERM OUTLOOK", "POTENTIAL CATALYSTS", "KEY INDICATORS", "SUMMARY"]):
                    if current_section and section_content:
                        sections[current_section] = '\n'.join(section_content)
                        section_content = []
                    current_section = line.split(':')[0].strip()
                else:
                    if current_section:
                        section_content.append(line)
            
            # Add the last section
            if current_section and section_content:
                sections[current_section] = '\n'.join(section_content)
                
            return {
                "forecast_sections": sections,
                "full_forecast": forecast_text
            }
            
        except Exception as e:
            return {
                "error": f"Failed to generate forecast: {str(e)}",
                "forecast_sections": {},
                "full_forecast": ""
            }