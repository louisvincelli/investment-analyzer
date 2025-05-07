"""Flask application for investment analyzer."""
from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
from app.config import ENABLE_CORS, BACKEND_PORT
from app.services.analyzer_service import AnalyzerService
from app.services.yahoo_finance_service import YahooFinanceService

app = Flask(__name__)

# Enable CORS if configured
if ENABLE_CORS:
    CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "investment-analyzer-api"})

@app.route('/api/validate-ticker', methods=['GET'])
def validate_ticker():
    """Validate a stock ticker."""
    ticker = request.args.get('ticker', '')
    if not ticker:
        return jsonify({"error": "No ticker provided"}), 400
        
    # Run async function in synchronous Flask context
    result = asyncio.run(YahooFinanceService.validate_ticker(ticker))
    return jsonify({"ticker": ticker, "valid": result})

@app.route('/api/stock', methods=['GET'])
def analyze_stock():
    """Analyze a single stock."""
    ticker = request.args.get('ticker', '')
    if not ticker:
        return jsonify({"error": "No ticker provided"}), 400
        
    # Run async function in synchronous Flask context
    result = asyncio.run(AnalyzerService.analyze_stock(ticker))
    return jsonify(result)

@app.route('/api/portfolio', methods=['POST'])
def analyze_portfolio():
    """Analyze a portfolio of stocks."""
    data = request.get_json()
    if not data or 'tickers' not in data:
        return jsonify({"error": "No tickers provided in request body"}), 400
        
    tickers = data['tickers']
    if not tickers or not isinstance(tickers, list):
        return jsonify({"error": "Tickers must be a non-empty array"}), 400
        
    # Run async function in synchronous Flask context
    result = asyncio.run(AnalyzerService.analyze_portfolio(tickers))
    return jsonify(result)

@app.route('/api/news', methods=['GET'])
def get_stock_news():
    """Get news for a specific stock."""
    ticker = request.args.get('ticker', '')
    if not ticker:
        return jsonify({"error": "No ticker provided"}), 400
        
    limit = int(request.args.get('limit', 10))
    
    # Run async function in synchronous Flask context
    result = asyncio.run(YahooFinanceService.get_news(ticker, limit))
    return jsonify({"ticker": ticker, "news": result})

if __name__ == '__main__':
    print(f"Starting Flask server on port {BACKEND_PORT}")
    app.run(host='0.0.0.0', port=BACKEND_PORT, debug=True)