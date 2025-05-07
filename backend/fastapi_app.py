"""FastAPI application for investment analyzer."""
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from app.config import ENABLE_CORS, BACKEND_PORT
from app.services.analyzer_service import AnalyzerService
from app.services.yahoo_finance_service import YahooFinanceService

app = FastAPI(
    title="Investment Analyzer API",
    description="AI-powered investment analysis using Yahoo Finance data",
    version="1.0.0"
)

# Enable CORS if configured
if ENABLE_CORS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust this in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Models
class PortfolioRequest(BaseModel):
    tickers: List[str]
    
class TickerResponse(BaseModel):
    ticker: str
    valid: bool

# Routes
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "investment-analyzer-api"}

@app.get("/api/validate-ticker")
async def validate_ticker(ticker: str = Query(..., description="Stock ticker symbol")):
    """Validate a stock ticker."""
    if not ticker:
        raise HTTPException(status_code=400, detail="No ticker provided")
        
    result = await YahooFinanceService.validate_ticker(ticker)
    return {"ticker": ticker, "valid": result}

@app.get("/api/stock")
async def analyze_stock(ticker: str = Query(..., description="Stock ticker symbol")):
    """Analyze a single stock."""
    if not ticker:
        raise HTTPException(status_code=400, detail="No ticker provided")
        
    result = await AnalyzerService.analyze_stock(ticker)
    return result

@app.post("/api/portfolio")
async def analyze_portfolio(request: PortfolioRequest):
    """Analyze a portfolio of stocks."""
    if not request.tickers:
        raise HTTPException(status_code=400, detail="Tickers must be a non-empty array")
        
    result = await AnalyzerService.analyze_portfolio(request.tickers)
    return result

@app.get("/api/news")
async def get_stock_news(
    ticker: str = Query(..., description="Stock ticker symbol"),
    limit: int = Query(10, description="Maximum number of news articles")
):
    """Get news for a specific stock."""
    if not ticker:
        raise HTTPException(status_code=400, detail="No ticker provided")
        
    result = await YahooFinanceService.get_news(ticker, limit)
    return {"ticker": ticker, "news": result}

if __name__ == "__main__":
    print(f"Starting FastAPI server on port {BACKEND_PORT}")
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=BACKEND_PORT, reload=True)