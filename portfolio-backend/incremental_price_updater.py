import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import pandas as pd
import yfinance as yf
from dotenv import load_dotenv
import asyncpg
from config import Config

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Config.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class IncrementalPriceUpdater:
    def __init__(self):
        self.db_config = {
            'host': Config.DB_HOST,
            'port': Config.DB_PORT,
            'user': Config.DB_USER,
            'password': Config.DB_PASSWORD,
            'database': Config.DB_NAME
        }
        self.start_date = Config.START_DATE
        
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
    
    async def get_last_price_date(self, symbol: str) -> Optional[str]:
        """Get the last date for which we have price data for a symbol"""
        try:
            conn = await self.get_db_connection()
            query = """
                SELECT MAX(date) as last_date
                FROM price_history 
                WHERE yahoo_symbol = $1
            """
            row = await conn.fetchrow(query, symbol)
            await conn.close()
            
            if row and row['last_date']:
                return row['last_date'].strftime('%Y-%m-%d')
            return None
            
        except Exception as e:
            logger.error(f"Error getting last price date for {symbol}: {e}")
            return None
    
    def fetch_yahoo_historical_data(self, symbol: str, start_date: str, end_date: str) -> Optional[pd.DataFrame]:
        """Fetch historical data from Yahoo Finance for a given symbol and date range"""
        try:
            logger.info(f"Fetching data for {symbol} from {start_date} to {end_date}")
            
            # Create ticker object
            ticker = yf.Ticker(symbol)
            
            # Fetch historical data
            hist_data = ticker.history(
                start=start_date,
                end=end_date,
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
    
    async def store_price_data_batch(self, price_data: pd.DataFrame):
        """Store price data in batches for better performance"""
        try:
            conn = await self.get_db_connection()
            
            # Prepare data for insertion
            records = []
            for _, row in price_data.iterrows():
                records.append((
                    row['yahoo_symbol'],
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
            
            # Process in batches
            batch_size = Config.BATCH_SIZE
            for i in range(0, len(records), batch_size):
                batch = records[i:i + batch_size]
                await conn.executemany(insert_query, batch)
                logger.info(f"Processed batch {i//batch_size + 1}/{(len(records)-1)//batch_size + 1}")
            
            await conn.close()
            logger.info(f"Successfully stored {len(records)} price records")
            
        except Exception as e:
            logger.error(f"Error storing price data: {e}")
            raise
    
    async def process_symbol_incremental(self, symbol_mapping: Dict) -> Tuple[bool, int]:
        """Process a single symbol mapping with incremental updates"""
        try:
            yahoo_symbol = symbol_mapping['yahoo_symbol']
            ibkr_symbol = symbol_mapping['ibkr_symbol']
            
            logger.info(f"Processing {ibkr_symbol} -> {yahoo_symbol}")
            
            # Get the last date we have data for
            last_date = await self.get_last_price_date(yahoo_symbol)
            
            if last_date:
                # Start from the next day after our last data
                start_date = (datetime.strptime(last_date, '%Y-%m-%d') + timedelta(days=1)).strftime('%Y-%m-%d')
                logger.info(f"Updating {yahoo_symbol} from {start_date}")
            else:
                # First time fetching data for this symbol
                start_date = self.start_date
                logger.info(f"First time fetching data for {yahoo_symbol} from {start_date}")
            
            end_date = datetime.now().strftime('%Y-%m-%d')
            
            # Check if we need to fetch data
            if start_date >= end_date:
                logger.info(f"No new data needed for {yahoo_symbol}")
                return True, 0
            
            # Fetch new data
            price_data = self.fetch_yahoo_historical_data(yahoo_symbol, start_date, end_date)
            
            if price_data is not None and not price_data.empty:
                # Store in database
                await self.store_price_data_batch(price_data)
                logger.info(f"Successfully processed {yahoo_symbol} with {len(price_data)} new records")
                return True, len(price_data)
            else:
                logger.warning(f"No new data found for {yahoo_symbol}")
                return True, 0
                
        except Exception as e:
            logger.error(f"Error processing symbol {symbol_mapping}: {e}")
            return False, 0
    
    async def run_incremental_update(self):
        """Run incremental update for all symbols"""
        try:
            logger.info("Starting incremental price data update process")
            
            # Get all symbol mappings
            symbol_mappings = await self.get_symbol_mappings()
            
            if not symbol_mappings:
                logger.warning("No symbol mappings found")
                return
            
            total_new_records = 0
            successful_symbols = 0
            
            # Process symbols with rate limiting
            for i, symbol_mapping in enumerate(symbol_mappings):
                success, new_records = await self.process_symbol_incremental(symbol_mapping)
                
                if success:
                    successful_symbols += 1
                    total_new_records += new_records
                
                # Add delay between requests to avoid rate limiting
                if i < len(symbol_mappings) - 1:
                    await asyncio.sleep(Config.RATE_LIMIT_DELAY)
            
            logger.info(f"Incremental update completed. {successful_symbols}/{len(symbol_mappings)} symbols processed successfully.")
            logger.info(f"Total new records added: {total_new_records}")
            
        except Exception as e:
            logger.error(f"Error in incremental update execution: {e}")
            raise
    
    async def run_daily_update(self):
        """Run daily update for all symbols (typically run via cron job)"""
        try:
            logger.info("Starting daily price data update process")
            
            # Get all symbol mappings
            symbol_mappings = await self.get_symbol_mappings()
            
            if not symbol_mappings:
                logger.warning("No symbol mappings found")
                return
            
            # For daily updates, we only need yesterday's data
            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            today = datetime.now().strftime('%Y-%m-%d')
            
            total_new_records = 0
            successful_symbols = 0
            
            # Process symbols with rate limiting
            for i, symbol_mapping in enumerate(symbol_mappings):
                try:
                    yahoo_symbol = symbol_mapping['yahoo_symbol']
                    ibkr_symbol = symbol_mapping['ibkr_symbol']
                    
                    logger.info(f"Processing daily update for {ibkr_symbol} -> {yahoo_symbol}")
                    
                    # Fetch yesterday's data
                    price_data = self.fetch_yahoo_historical_data(yahoo_symbol, yesterday, today)
                    
                    if price_data is not None and not price_data.empty:
                        # Store in database
                        await self.store_price_data_batch(price_data)
                        total_new_records += len(price_data)
                        successful_symbols += 1
                        logger.info(f"Successfully updated {yahoo_symbol} with {len(price_data)} records")
                    else:
                        logger.warning(f"No daily data found for {yahoo_symbol}")
                    
                except Exception as e:
                    logger.error(f"Error processing daily update for {symbol_mapping}: {e}")
                
                # Add delay between requests
                if i < len(symbol_mappings) - 1:
                    await asyncio.sleep(Config.RATE_LIMIT_DELAY)
            
            logger.info(f"Daily update completed. {successful_symbols}/{len(symbol_mappings)} symbols processed successfully.")
            logger.info(f"Total new records added: {total_new_records}")
            
        except Exception as e:
            logger.error(f"Error in daily update execution: {e}")
            raise

async def main():
    """Main function - can be configured for different update types"""
    import sys
    
    updater = IncrementalPriceUpdater()
    
    if len(sys.argv) > 1 and sys.argv[1] == 'daily':
        await updater.run_daily_update()
    else:
        await updater.run_incremental_update()

if __name__ == "__main__":
    asyncio.run(main())
