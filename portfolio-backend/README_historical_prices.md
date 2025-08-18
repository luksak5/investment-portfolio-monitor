# Historical Prices Fetcher

This system fetches historical price data from Yahoo Finance API and stores it in your Supabase database for all mapped IBKR symbols.

## Features

- **Initial Data Fetch**: Downloads historical prices from 2000-01-01 to present for all mapped symbols
- **Incremental Updates**: Only fetches new data since the last update
- **Daily Updates**: Efficient daily updates for ongoing maintenance
- **Batch Processing**: Handles large datasets efficiently
- **Rate Limiting**: Respects API limits to avoid throttling
- **Error Handling**: Comprehensive logging and error recovery
- **Database Optimization**: Proper indexing and upsert handling

## Database Schema

The system creates a `price_history` table with the following structure:

```sql
CREATE TABLE price_history (
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
```

## Installation

1. **Install Dependencies**:
   ```bash
   cd portfolio-backend
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file in the `portfolio-backend` directory:
   ```env
   # Database Configuration
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   
   # Supabase Configuration (if using Supabase)
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Logging
   LOG_LEVEL=INFO
   ```

## Usage

### 1. Initial Data Fetch (One-time)

For the first time setup, fetch all historical data from 2000:

```bash
python historical_prices_fetcher.py
```

This will:
- Create the `price_history` table if it doesn't exist
- Fetch all mapped symbols from your `symbol_mappings` table
- Download historical prices from 2000-01-01 to present
- Store data in batches for efficiency

### 2. Incremental Updates

To update only new data since the last fetch:

```bash
python incremental_price_updater.py
```

This will:
- Check the last date for each symbol
- Fetch only new data since that date
- Update existing records if needed

### 3. Daily Updates

For regular daily updates (recommended for production):

```bash
python incremental_price_updater.py daily
```

Or use the scheduler:

```bash
python scheduler.py
```

### 4. Scheduled Updates

#### Linux/Mac (Cron)
Add to your crontab:
```bash
# Update prices daily at 6:00 AM
0 6 * * * cd /path/to/portfolio-backend && python scheduler.py

# Or update every 4 hours during market hours
0 9,13,17 * * 1-5 cd /path/to/portfolio-backend && python scheduler.py
```

#### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 6:00 AM)
4. Action: Start a program
5. Program: `python`
6. Arguments: `scheduler.py`
7. Start in: `C:\path\to\portfolio-backend`

## Configuration

Edit `config.py` to customize:

```python
class Config:
    START_DATE = '2000-01-01'        # Start date for historical data
    RATE_LIMIT_DELAY = 1             # Seconds between API requests
    BATCH_SIZE = 1000                 # Records per database batch
    MAX_RETRIES = 3                   # Retry attempts for failed requests
    LOG_LEVEL = 'INFO'                # Logging level
```

## Data Storage Strategy

### Why Store Each Symbol Separately?

1. **Efficient Queries**: Easy to query specific symbol data
2. **Indexing**: Better performance with symbol-specific indexes
3. **Maintenance**: Easier to update/delete specific symbol data
4. **Scalability**: Can handle large datasets without performance degradation

### Alternative Approaches Considered:

1. **Single Table with JSON**: Would make queries complex and slow
2. **Partitioned Tables**: Overkill for most use cases
3. **Time-series Database**: Good for analytics but complex for simple price storage

## Performance Considerations

- **Batch Processing**: Data is inserted in batches of 1000 records
- **Indexing**: Proper indexes on `yahoo_symbol`, `date`, and composite fields
- **Rate Limiting**: 1-second delay between API calls to avoid throttling
- **Connection Pooling**: Efficient database connection management

## Monitoring and Logging

- **Log Files**: All operations are logged to `historical_prices.log`
- **Console Output**: Real-time progress updates
- **Error Tracking**: Comprehensive error logging with context
- **Performance Metrics**: Timing information for operations

## Troubleshooting

### Common Issues:

1. **API Rate Limiting**: Increase `RATE_LIMIT_DELAY` in config
2. **Database Connection**: Check database credentials and network
3. **Memory Issues**: Reduce `BATCH_SIZE` for large datasets
4. **Symbol Not Found**: Check if Yahoo symbol is correct

### Debug Mode:

Set `LOG_LEVEL=DEBUG` in your `.env` file for detailed logging.

## Data Validation

The system includes several validation checks:

- **Date Range**: Ensures dates are within valid range
- **Price Validation**: Checks for reasonable price values
- **Volume Validation**: Ensures volume is non-negative
- **Duplicate Prevention**: Uses upsert to handle existing data

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live prices
- **Multiple Data Sources**: Integration with other financial APIs
- **Data Compression**: Storage optimization for large datasets
- **Analytics Integration**: Built-in performance calculations
- **Alert System**: Notifications for data issues or failures

## Support

For issues or questions:
1. Check the log files for error details
2. Verify your environment variables
3. Ensure your symbol mappings are correct
4. Check database connectivity and permissions
