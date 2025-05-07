"""API data models."""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class StockMetrics(BaseModel):
    """Stock metrics model."""
    fifty_two_week_high: float = Field(alias="52_week_high")
    fifty_two_week_low: float = Field(alias="52_week_low")
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    beta: Optional[float] = None
    volatility_30d: Optional[float] = None


class StockAnalysis(BaseModel):
    """Stock analysis model."""
    ticker: str
    company_name: str
    sector: Optional[str] = "Unknown"
    current_price: float
    metrics: StockMetrics
    analysis: Dict[str, str]
    analysis_text: str
    news: Optional[List[Dict[str, Any]]] = None
    news_sentiment: Optional[Dict[str, Any]] = None
    forecast: Optional[Dict[str, Any]] = None


class PortfolioMetrics(BaseModel):
    """Portfolio metrics model."""
    risk_level: str
    sector_distribution: Dict[str, float]


class PortfolioAnalysis(BaseModel):
    """Portfolio analysis model."""
    stocks: Dict[str, StockAnalysis]
    portfolio_metrics: PortfolioMetrics