#!/usr/bin/env python3
"""
Simple scheduler script for running price updates at regular intervals.
This can be used with cron jobs (Linux/Mac) or Windows Task Scheduler.
"""

import asyncio
import logging
from datetime import datetime
from incremental_price_updater import IncrementalPriceUpdater
from config import Config

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

async def run_scheduled_update():
    """Run the scheduled update"""
    try:
        logger.info("Starting scheduled price update")
        start_time = datetime.now()
        
        updater = IncrementalPriceUpdater()
        await updater.run_daily_update()
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        logger.info(f"Scheduled update completed successfully in {duration}")
        
    except Exception as e:
        logger.error(f"Error in scheduled update: {e}")
        raise

def main():
    """Main function for the scheduler"""
    try:
        asyncio.run(run_scheduled_update())
    except Exception as e:
        logger.error(f"Fatal error in scheduler: {e}")
        exit(1)

if __name__ == "__main__":
    main()
