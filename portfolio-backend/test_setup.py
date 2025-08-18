#!/usr/bin/env python3
"""
Test script to verify the setup and connectivity.
Run this before running the main historical prices fetcher.
"""

import asyncio
import logging
from dotenv import load_dotenv
from incremental_price_updater import IncrementalPriceUpdater
from config import Config

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_setup():
    """Test the setup and connectivity"""
    try:
        logger.info("Testing setup and connectivity...")
        
        # Test database connection
        logger.info("Testing database connection...")
        updater = IncrementalPriceUpdater()
        
        # Test connection
        conn = await updater.get_db_connection()
        logger.info("✅ Database connection successful")
        await conn.close()
        
        # Test symbol mappings fetch
        logger.info("Testing symbol mappings fetch...")
        symbol_mappings = await updater.get_symbol_mappings()
        
        if symbol_mappings:
            logger.info(f"✅ Found {len(symbol_mappings)} symbol mappings")
            logger.info("Sample mappings:")
            for i, mapping in enumerate(symbol_mappings[:3]):  # Show first 3
                logger.info(f"  {i+1}. {mapping['ibkr_symbol']} -> {mapping['yahoo_symbol']}")
        else:
            logger.warning("⚠️ No symbol mappings found. Please check your symbol_mappings table.")
        
        # Test table creation
        logger.info("Testing price_history table creation...")
        await updater.create_price_history_table()
        logger.info("✅ Price history table created/verified successfully")
        
        logger.info("🎉 Setup test completed successfully!")
        logger.info("\nNext steps:")
        logger.info("1. Run 'python historical_prices_fetcher.py' for initial data fetch")
        logger.info("2. Run 'python incremental_price_updater.py daily' for daily updates")
        logger.info("3. Set up scheduled tasks using scheduler.py")
        
    except Exception as e:
        logger.error(f"❌ Setup test failed: {e}")
        raise

def main():
    """Main function"""
    try:
        asyncio.run(test_setup())
    except Exception as e:
        logger.error(f"Fatal error in setup test: {e}")
        exit(1)

if __name__ == "__main__":
    main()
