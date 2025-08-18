import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import pandas as pd
import yfinance as yf
from dotenv import load_dotenv
import asyncpg
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('historical_prices.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class HistoricalPricesFetcher:
    def __init__(self):
        #self.supabase_url = os.getenv('SUPABASE_URL')
        #self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', '6543'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME')
        }
        self.start_date = '2000-01-01'
        self.end_date = datetime.now().strftime('%Y-%m-%d')
        
    async def get_db_connection(self):
        """Create database connection"""
        try:
            conn = await asyncpg.connect(**self.db_config)
            return conn
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    async def get_symbol_mappings(self) -> List[Dict]:
        """Fetch all active symbol mappings from database"""
        try:
            conn = await self.get_db_connection()
            query = """
                SELECT id, ibkr_symbol, yahoo_symbol, security_name, exchange, asset_type
                FROM symbol_mappings 
                WHERE is_active = true
                ORDER BY id
            """
            rows = await conn.fetch(query)
            await conn.close()
            
            symbols = []
            for row in rows:
                symbols.append({
                    'id': row['id'],
                    'ibkr_symbol': row['ibkr_symbol'],
                    'yahoo_symbol': row['yahoo_symbol'],
                    'security_name': row['security_name'],
                    'exchange': row['exchange'],
                    'asset_type': row['asset_type']
                })
            
            logger.info(f"Found {len(symbols)} active symbol mappings")
            return symbols
            
        except Exception as e:
            logger.error(f"Error fetching symbol mappings: {e}")
            raise
    
    def fetch_yahoo_historical_data(self, symbol: str) -> Optional[pd.DataFrame]:
        """Fetch historical data from Yahoo Finance for a given symbol"""
        try:
            logger.info(f"Fetching data for {symbol}")
            
            # Create ticker object
            ticker = yf.Ticker(symbol)
            
            # Fetch historical data
            hist_data = ticker.history(
                start=self.start_date,
                end=self.end_date,
                interval='1d',
                auto_adjust=True
            )
            
            if hist_data.empty:
                logger.warning(f"No data found for symbol: {symbol}")
                return None
            
            # Reset index to make date a column
            hist_data = hist_data.reset_index()
            
            # Rename columns to match our database schema
            hist_data = hist_data.rename(columns={
                'Date': 'date',
                'Open': 'open_price',
                'High': 'high_price',
                'Low': 'low_price',
                'Close': 'close_price',
                'Volume': 'volume'
            })
            
            # Convert date to string format
            hist_data['date'] = hist_data['date'].dt.strftime('%Y-%m-%d')
            
            # Add symbol information
            hist_data['yahoo_symbol'] = symbol
            
            logger.info(f"Successfully fetched {len(hist_data)} records for {symbol}")
            return hist_data
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return None
    
    async def create_price_history_table(self):
        """Create the price_history table if it doesn't exist"""
        try:
            conn = await self.get_db_connection()
            
            create_table_query = """
                CREATE TABLE IF NOT EXISTS price_history (
                    id SERIAL PRIMARY KEY,
                    yahoo_symbol VARCHAR(50) NOT NULL,
                    date DATE NOT NULL,
                    open_price DECIMAL(10,4),
                    high_price DECIMAL(10,4),
                    low_price DECIMAL(10,4),
                    close_price DECIMAL(10,4),
                    volume BIGINT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(yahoo_symbol, date)
                );
                
                -- Create indexes for better performance
                CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(yahoo_symbol);
                CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date);
                CREATE INDEX IF NOT EXISTS idx_price_history_symbol_date ON price_history(yahoo_symbol, date);
            """
            
            await conn.execute(create_table_query)
            await conn.close()
            logger.info("Price history table created/verified successfully")
            
        except Exception as e:
            logger.error(f"Error creating price history table: {e}")
            raise
    
    async def store_price_data(self, symbol: str, price_data: pd.DataFrame):
        """Store price data in the database"""
        try:
            conn = await self.get_db_connection()
            
            # Prepare data for insertion
            records = []
            for _, row in price_data.iterrows():
                records.append((
                    symbol,
                    row['date'],
                    float(row['open_price']) if pd.notna(row['open_price']) else None,
                    float(row['high_price']) if pd.notna(row['high_price']) else None,
                    float(row['low_price']) if pd.notna(row['low_price']) else None,
                    float(row['close_price']) if pd.notna(row['close_price']) else None,
                    int(row['volume']) if pd.notna(row['volume']) else None
                ))
            
            # Use upsert to handle duplicates
            insert_query = """
                INSERT INTO price_history (yahoo_symbol, date, open_price, high_price, low_price, close_price, volume)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (yahoo_symbol, date) 
                DO UPDATE SET
                    open_price = EXCLUDED.open_price,
                    high_price = EXCLUDED.high_price,
                    low_price = EXCLUDED.low_price,
                    close_price = EXCLUDED.close_price,
                    volume = EXCLUDED.volume,
                    updated_at = CURRENT_TIMESTAMP
            """
            
            await conn.executemany(insert_query, records)
            await conn.close()
            
            logger.info(f"Successfully stored {len(records)} price records for {symbol}")
            
        except Exception as e:
            logger.error(f"Error storing price data for {symbol}: {e}")
            raise
    
    async def process_symbol(self, symbol_mapping: Dict):
        """Process a single symbol mapping"""
        try:
            yahoo_symbol = symbol_mapping['yahoo_symbol']
            ibkr_symbol = symbol_mapping['ibkr_symbol']
            
            logger.info(f"Processing {ibkr_symbol} -> {yahoo_symbol}")
            
            # Fetch historical data
            price_data = self.fetch_yahoo_historical_data(yahoo_symbol)
            
            if price_data is not None:
                # Store in database
                await self.store_price_data(yahoo_symbol, price_data)
                logger.info(f"Successfully processed {yahoo_symbol}")
            else:
                logger.warning(f"Skipping {yahoo_symbol} due to no data")
                
        except Exception as e:
            logger.error(f"Error processing symbol {symbol_mapping}: {e}")
    
    async def run(self):
        """Main execution method"""
        try:
            logger.info("Starting historical price data fetch process")
            
            # Create table if it doesn't exist
            await self.create_price_history_table()
            
            # Get all symbol mappings
            symbol_mappings = await self.get_symbol_mappings()
            
            if not symbol_mappings:
                logger.warning("No symbol mappings found")
                return
            
            # Process symbols with rate limiting to avoid API throttling
            for i, symbol_mapping in enumerate(symbol_mappings):
                await self.process_symbol(symbol_mapping)
                
                # Add delay between requests to avoid rate limiting
                if i < len(symbol_mappings) - 1:
                    await asyncio.sleep(1)
            
            logger.info("Historical price data fetch process completed successfully")
            
        except Exception as e:
            logger.error(f"Error in main execution: {e}")
            raise

async def main():
    """Main function"""
    fetcher = HistoricalPricesFetcher()
    await fetcher.run()

if __name__ == "__main__":
    asyncio.run(main())
