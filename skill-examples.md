# Skills System - API Ideas & Use Cases

This document outlines practical API ideas that can be built using the Skills system. Each API is created by demonstrating the task once, then becomes a reusable endpoint.

---

## 1. Find the Cheapest Flight from A to B for Date C to D

### User Journey
- Navigate to Google Flights or Kayak
- Click origin airport field
- Enter departure city/airport code
- Click destination airport field
- Enter arrival city/airport code
- Select departure date from calendar
- Select return date from calendar
- Click search/explore button
- Wait for results to load
- Extract price of cheapest flight option
- Extract airline, flight times, and duration

### Variables to Capture
- `origin`: Departure city/airport (e.g., "Vancouver", "YVR")
- `destination`: Arrival city/airport (e.g., "LAX", "Los Angeles")
- `departureDate`: Outbound date (e.g., "2024-12-25")
- `returnDate`: Return date (e.g., "2025-01-05")
- `passengers`: Number of travelers (optional, default: 1)
- `class`: Cabin class (optional, default: "economy")

### Output Data
- Cheapest price
- Airline name
- Departure/arrival times
- Flight duration
- Number of stops
- Booking URL

---

## 2. Find Price Change for Product 'C' on Amazon

### User Journey
- Navigate to Amazon.com
- Click search bar
- Enter product name or ASIN
- Click search button
- Click on first matching product
- Extract current price
- Extract product title
- Extract availability status
- (Optional) Check price history if available

### Variables to Capture
- `productName`: Product name or ASIN (e.g., "iPhone 15 Pro")
- `marketplace`: Amazon domain (optional, default: "amazon.com")

### Output Data
- Current price
- Original price (if on sale)
- Discount percentage
- Product title
- Availability status
- Product URL
- Rating and review count

---

## 3. Fill Out Contact Form with Information on Site 'X'

### User Journey
- Navigate to target website contact page
- Locate contact form
- Click name field
- Enter full name
- Click email field
- Enter email address
- Click phone field (if present)
- Enter phone number
- Click message/comment field
- Enter message text
- Click submit button
- Wait for confirmation message

### Variables to Capture
- `websiteUrl`: Target website URL (e.g., "https://example.com/contact")
- `name`: Full name (e.g., "John Doe")
- `email`: Email address (e.g., "john@example.com")
- `phone`: Phone number (optional)
- `message`: Message content (e.g., "Interested in your services")
- `company`: Company name (optional)

### Output Data
- Submission status (success/failure)
- Confirmation message (if available)
- Submission timestamp

---

## 4. How Much Does 'B' Cost on Amazon

### User Journey
- Navigate to Amazon.com
- Click search bar
- Enter product name
- Click search button
- Click on first result
- Extract price from product page
- Extract product details (title, rating, availability)

### Variables to Capture
- `productName`: Product to search for (e.g., "MacBook Pro")
- `marketplace`: Amazon domain (optional, default: "amazon.com")

### Output Data
- Current price
- Product title
- Availability
- Seller information
- Product URL

---

## 5. Check Hotel Availability and Prices for Location X, Check-in Y, Check-out Z

### User Journey
- Navigate to Booking.com or Hotels.com
- Enter destination city/hotel name
- Select check-in date from calendar
- Select check-out date from calendar
- Enter number of guests
- Click search button
- Wait for results to load
- Extract available hotels with prices
- Sort by price (lowest first)

### Variables to Capture
- `location`: City or hotel name (e.g., "New York", "Times Square Hotel")
- `checkInDate`: Check-in date (e.g., "2024-12-20")
- `checkOutDate`: Check-out date (e.g., "2024-12-25")
- `guests`: Number of guests (optional, default: 2)
- `rooms`: Number of rooms (optional, default: 1)

### Output Data
- Available hotels list
- Price per night
- Total price for stay
- Hotel rating
- Hotel amenities
- Booking URL

---

## 6. Find Job Listings for Position 'X' in Location 'Y' on LinkedIn

### User Journey
- Navigate to LinkedIn Jobs
- Click search bar
- Enter job title/keywords
- Click location field
- Enter city or location
- Click search button
- Wait for results to load
- Extract job listings with details

### Variables to Capture
- `jobTitle`: Position title (e.g., "Software Engineer", "Data Scientist")
- `location`: City or region (e.g., "San Francisco", "Remote")
- `experienceLevel`: Experience level (optional: "Entry", "Mid", "Senior")

### Output Data
- Job titles
- Company names
- Locations
- Salary ranges (if available)
- Job descriptions (summary)
- Application URLs
- Posted dates

---

## 7. Track Stock Price for Ticker Symbol 'X'

### User Journey
- Navigate to Yahoo Finance or Google Finance
- Enter stock ticker symbol in search
- Click search or press enter
- Wait for stock page to load
- Extract current price
- Extract price change (dollar and percentage)
- Extract market cap, volume, and other metrics

### Variables to Capture
- `tickerSymbol`: Stock ticker (e.g., "AAPL", "TSLA", "GOOGL")
- `exchange`: Stock exchange (optional, default: auto-detect)

### Output Data
- Current price
- Price change (absolute and percentage)
- Market cap
- Volume
- 52-week high/low
- P/E ratio
- Dividend yield (if applicable)

---

## 8. Find Restaurant Reservations for Party Size X on Date Y at Time Z

### User Journey
- Navigate to OpenTable or Resy
- Enter restaurant name or location
- Click search
- Select restaurant from results
- Click "Reserve" or "Book a Table"
- Select date from calendar
- Select time slot
- Enter party size
- (Optional) Extract available time slots

### Variables to Capture
- `restaurantName`: Restaurant name or location (e.g., "The French Laundry", "Napa Valley")
- `date`: Reservation date (e.g., "2024-12-25")
- `time`: Preferred time (e.g., "19:00", "7:00 PM")
- `partySize`: Number of guests (e.g., 4)
- `cuisine`: Cuisine type (optional filter)

### Output Data
- Available time slots
- Reservation confirmation (if booking)
- Restaurant details (address, phone, rating)
- Booking URL

---

## 9. Compare Product Prices Across Multiple E-commerce Sites

### User Journey
- Navigate to Google Shopping
- Enter product name in search
- Click search
- Wait for results from multiple retailers
- Extract prices from different stores
- Sort by lowest price
- Extract store names and product links

### Variables to Capture
- `productName`: Product to search (e.g., "Sony WH-1000XM5")
- `maxPrice`: Maximum price filter (optional)
- `minPrice`: Minimum price filter (optional)

### Output Data
- List of retailers with prices
- Lowest price and retailer
- Product availability
- Shipping costs (if available)
- Product URLs

---

## 10. Check Real Estate Listings for Property Type X in Location Y with Budget Z

### User Journey
- Navigate to Zillow or Realtor.com
- Enter location/city
- Click search
- Apply filters (price range, property type, bedrooms)
- Wait for results to load
- Extract property listings with details

### Variables to Capture
- `location`: City or address (e.g., "San Francisco, CA")
- `propertyType`: Type of property (e.g., "House", "Condo", "Apartment")
- `minPrice`: Minimum budget (optional)
- `maxPrice`: Maximum budget (optional)
- `bedrooms`: Number of bedrooms (optional)
- `bathrooms`: Number of bathrooms (optional)

### Output Data
- Property addresses
- Prices
- Property details (bedrooms, bathrooms, sqft)
- Property images (URLs)
- Listing URLs
- Days on market

---

## 11. Find Event Tickets for Event 'X' on Date 'Y' at Venue 'Z'

### User Journey
- Navigate to Ticketmaster or Eventbrite
- Search for event name
- Click on event from results
- Select date from available dates
- Select number of tickets
- Extract ticket prices and availability
- (Optional) Check seating chart

### Variables to Capture
- `eventName`: Event name (e.g., "Taylor Swift Concert", "NBA Finals")
- `date`: Event date (e.g., "2024-12-25")
- `venue`: Venue name or location (optional)
- `ticketQuantity`: Number of tickets needed (optional, default: 2)

### Output Data
- Available ticket prices (by section)
- Lowest available price
- Ticket availability status
- Event date and time
- Venue information
- Purchase URL

---

## 12. Monitor Social Media Mentions for Keyword 'X' on Platform 'Y'

### User Journey
- Navigate to Twitter/X or Reddit
- Enter search query/keyword
- Click search
- Wait for results to load
- Extract posts/tweets matching keyword
- Extract engagement metrics (likes, retweets, comments)

### Variables to Capture
- `keyword`: Search term or hashtag (e.g., "#AI", "ChatGPT")
- `platform`: Social media platform (e.g., "twitter", "reddit")
- `timeRange`: Time filter (optional: "24h", "7d", "30d")
- `maxResults`: Number of results to return (optional, default: 10)

### Output Data
- Post/tweet content
- Author username
- Engagement metrics (likes, shares, comments)
- Post URLs
- Timestamps

---

## 13. Check Package Delivery Status for Tracking Number 'X' on Carrier 'Y'

### User Journey
- Navigate to carrier website (UPS, FedEx, USPS, DHL)
- Enter tracking number
- Click track button
- Wait for tracking page to load
- Extract current status and location
- Extract delivery date estimate
- Extract delivery history/timeline

### Variables to Capture
- `trackingNumber`: Package tracking number (e.g., "1Z999AA10123456784")
- `carrier`: Shipping carrier (e.g., "UPS", "FedEx", "USPS", "DHL")

### Output Data
- Current status (e.g., "In Transit", "Delivered")
- Current location
- Estimated delivery date
- Delivery address
- Tracking timeline/history

---

## 14. Find Course Availability and Enrollment for Course 'X' on Platform 'Y'

### User Journey
- Navigate to Coursera, Udemy, or university portal
- Search for course name
- Click on course from results
- Extract course details (price, duration, instructor)
- Check enrollment availability
- Extract course curriculum/syllabus

### Variables to Capture
- `courseName`: Course title or keywords (e.g., "Machine Learning", "Python for Data Science")
- `platform`: Learning platform (e.g., "Coursera", "Udemy", "edX")
- `instructor`: Instructor name (optional filter)

### Output Data
- Course title and description
- Price (if paid)
- Duration/estimated time
- Instructor name
- Rating and reviews
- Enrollment status
- Course URL

---

## 15. Check Weather Forecast for Location 'X' for Date Range 'Y' to 'Z'

### User Journey
- Navigate to Weather.com or AccuWeather
- Enter city name or location
- Click search
- Wait for weather page to load
- Navigate to forecast section
- Extract daily forecasts
- Extract temperature, precipitation, wind conditions

### Variables to Capture
- `location`: City or location (e.g., "New York, NY", "90210")
- `startDate`: Start date for forecast (e.g., "2024-12-20")
- `endDate`: End date for forecast (e.g., "2024-12-25")
- `units`: Temperature units (optional: "F" or "C", default: "F")

### Output Data
- Daily forecasts with dates
- High and low temperatures
- Precipitation probability
- Wind speed and direction
- Weather conditions (sunny, rainy, etc.)
- Humidity levels

---

## 16. Find Used Car Listings for Make 'X', Model 'Y', Max Price 'Z'

### User Journey
- Navigate to Cars.com or AutoTrader
- Select make from dropdown
- Select model from dropdown
- Enter maximum price
- Click search
- Wait for results to load
- Extract car listings with details

### Variables to Capture
- `make`: Car manufacturer (e.g., "Toyota", "Honda", "Tesla")
- `model`: Car model (e.g., "Camry", "Civic", "Model 3")
- `maxPrice`: Maximum price (e.g., 30000)
- `minYear`: Minimum year (optional)
- `maxYear`: Maximum year (optional)
- `location`: City or zip code (optional)

### Output Data
- Car listings with prices
- Year, mileage, condition
- Dealer information
- Car images (URLs)
- Listing URLs
- VIN numbers (if available)

---

## 17. Check Cryptocurrency Price for Symbol 'X' Across Exchanges

### User Journey
- Navigate to CoinMarketCap or CoinGecko
- Search for cryptocurrency symbol
- Click on cryptocurrency
- Extract current price
- Extract price change (24h, 7d, 30d)
- Extract market cap and volume
- Check prices on different exchanges

### Variables to Capture
- `symbol`: Cryptocurrency symbol (e.g., "BTC", "ETH", "SOL")
- `exchange`: Specific exchange (optional: "Binance", "Coinbase")

### Output Data
- Current price (USD and other currencies)
- Price changes (1h, 24h, 7d, 30d)
- Market cap
- Trading volume
- All-time high/low
- Exchange prices (if multiple)

---

## 18. Find Available Appointment Slots for Service 'X' at Business 'Y' on Date 'Z'

### User Journey
- Navigate to business website or booking platform
- Select service type
- Select date from calendar
- View available time slots
- Extract available appointments
- Extract service duration and price

### Variables to Capture
- `businessName`: Business or service provider name (e.g., "Hair Salon Downtown")
- `serviceType`: Service needed (e.g., "Haircut", "Massage", "Dental Cleaning")
- `date`: Preferred date (e.g., "2024-12-25")
- `location`: Business location (optional)

### Output Data
- Available time slots
- Service duration
- Service price
- Provider information
- Booking URL

---

## 19. Monitor Product Reviews and Ratings for Product 'X' on Site 'Y'

### User Journey
- Navigate to e-commerce site (Amazon, Best Buy, etc.)
- Search for product
- Click on product
- Navigate to reviews section
- Extract review ratings distribution
- Extract recent reviews with text
- Extract average rating

### Variables to Capture
- `productName`: Product name or ASIN (e.g., "iPhone 15 Pro")
- `site`: E-commerce platform (e.g., "amazon", "bestbuy")
- `minRating`: Minimum rating filter (optional, default: 1)
- `maxReviews`: Number of reviews to extract (optional, default: 10)

### Output Data
- Average rating
- Total review count
- Rating distribution (5-star, 4-star, etc.)
- Recent reviews (text, author, date, rating)
- Review helpfulness scores

---

## 20. Check Shipping Costs and Delivery Times for Package from Origin X to Destination Y

### User Journey
- Navigate to shipping carrier website (UPS, FedEx, USPS)
- Enter origin address/zip code
- Enter destination address/zip code
- Enter package weight and dimensions
- Click calculate
- Extract shipping options with prices and delivery times

### Variables to Capture
- `originZip`: Origin zip code or address (e.g., "90210")
- `destinationZip`: Destination zip code or address (e.g., "10001")
- `weight`: Package weight in pounds (e.g., 5)
- `packageType`: Package type (optional: "envelope", "box", "package")

### Output Data
- Available shipping methods
- Shipping costs for each method
- Estimated delivery dates
- Delivery time estimates
- Insurance options (if available)

---

## Implementation Notes

### Best Practices for Recording Skills

1. **Use Variables from the Start**: When recording, use placeholder values like `%origin%` instead of hardcoded values like "Vancouver" to make skills reusable.

2. **Test with Multiple Values**: After recording, test the skill with different variable values to ensure it works correctly.

3. **Handle Dynamic Content**: Some websites have dynamic content that changes. The triple replay strategy (exact → natural language → AI re-learn) handles this automatically.

4. **Error Handling**: Skills should handle cases where:
   - Elements are not found
   - Pages take time to load
   - Websites have changed their UI

5. **Rate Limiting**: Be mindful of rate limits when executing skills frequently. Consider adding delays between executions.

### Common Patterns

- **Search → Filter → Extract**: Most e-commerce and booking sites follow this pattern
- **Form Fill → Submit → Confirm**: Contact forms and booking systems
- **Navigate → Search → Click → Extract**: Information gathering tasks
- **Login → Navigate → Extract**: For authenticated content (requires additional setup)

---

## Next Steps

1. **Start Simple**: Begin with straightforward tasks like product price checks
2. **Add Complexity**: Gradually move to multi-step workflows
3. **Test Thoroughly**: Test with various inputs to ensure reliability
4. **Monitor Performance**: Track which strategy (1, 2, or 3) is used most often
5. **Iterate**: Re-record skills if websites change significantly

---

**Ready to build?** Start recording your first skill at `/skills/record`! 🚀

