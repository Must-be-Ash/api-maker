/**
 * Schema Templates for Variable-Based Skills
 *
 * Provides pre-defined extraction schemas for common goal categories.
 * These templates ensure generic, reusable schemas for variable-based goals.
 */

import type { ExtractionSchema } from './schema-generator';
import type { GoalCategory } from './schema-generator';

/**
 * Schema templates mapped by goal category.
 * Each template defines fields, instruction, and description for a specific use case.
 */
export const SCHEMA_TEMPLATES: Record<GoalCategory, ExtractionSchema> = {
  /**
   * Generic search results (Google, Bing, etc.)
   * Works for any search query regardless of topic
   */
  generic_search: {
    fields: [
      {
        name: 'answer',
        type: 'string',
        description: 'The main answer or result from the search'
      },
      {
        name: 'source',
        type: 'string',
        description: 'Source of the information (e.g., website name)',
        optional: true
      },
      {
        name: 'title',
        type: 'string',
        description: 'Title of the result page or featured snippet',
        optional: true
      },
      {
        name: 'url',
        type: 'string',
        description: 'URL of the source or result page',
        optional: true
      },
      {
        name: 'snippet',
        type: 'string',
        description: 'Text snippet or excerpt from the result',
        optional: true
      }
    ],
    instruction: 'Extract the main answer and source information from search results',
    description: 'Generic schema for extracting search results across different queries'
  },

  /**
   * Job search results (LinkedIn, Indeed, etc.)
   * Extracts job listing details
   */
  job_search: {
    fields: [
      {
        name: 'title',
        type: 'string',
        description: 'Job title or position name'
      },
      {
        name: 'company',
        type: 'string',
        description: 'Company or employer name'
      },
      {
        name: 'location',
        type: 'string',
        description: 'Job location (city, state, or remote)'
      },
      {
        name: 'salary',
        type: 'string',
        description: 'Salary range or compensation information',
        optional: true
      },
      {
        name: 'description',
        type: 'string',
        description: 'Job description or summary',
        optional: true
      },
      {
        name: 'postedDate',
        type: 'string',
        description: 'Date when the job was posted',
        optional: true
      },
      {
        name: 'url',
        type: 'string',
        description: 'URL to the job posting or application page',
        optional: true
      }
    ],
    instruction: 'Extract job listing details including title, company, location, and compensation',
    description: 'Schema for job search results from job boards and career sites'
  },

  /**
   * Weather lookups (Weather.com, Google Weather, etc.)
   * Extracts current weather conditions
   */
  weather_lookup: {
    fields: [
      {
        name: 'temperature',
        type: 'string',
        description: 'Current temperature with units (e.g., "14°C" or "57°F")'
      },
      {
        name: 'condition',
        type: 'string',
        description: 'Weather condition description (e.g., "Sunny", "Cloudy", "Rainy")'
      },
      {
        name: 'location',
        type: 'string',
        description: 'Location name for validation (city, state, country)'
      },
      {
        name: 'precipitation',
        type: 'string',
        description: 'Chance of precipitation or rainfall amount',
        optional: true
      },
      {
        name: 'wind',
        type: 'string',
        description: 'Wind speed and direction with units',
        optional: true
      },
      {
        name: 'humidity',
        type: 'string',
        description: 'Humidity percentage',
        optional: true
      },
      {
        name: 'feelsLike',
        type: 'string',
        description: 'Feels-like temperature',
        optional: true
      }
    ],
    instruction: 'Extract current weather conditions including temperature, condition, and location',
    description: 'Schema for weather lookups across different locations'
  },

  /**
   * Flight search results (Google Flights, airline sites, etc.)
   * Extracts flight pricing and details
   */
  flight_search: {
    fields: [
      {
        name: 'price',
        type: 'string',
        description: 'Flight price with currency (e.g., "$450 USD")'
      },
      {
        name: 'airline',
        type: 'string',
        description: 'Airline name or carrier'
      },
      {
        name: 'route',
        type: 'string',
        description: 'Flight route (e.g., "SFO → NYC" or "Vancouver to Los Angeles")'
      },
      {
        name: 'departureTime',
        type: 'string',
        description: 'Departure time and date',
        optional: true
      },
      {
        name: 'arrivalTime',
        type: 'string',
        description: 'Arrival time and date',
        optional: true
      },
      {
        name: 'duration',
        type: 'string',
        description: 'Flight duration (e.g., "5h 30m")',
        optional: true
      },
      {
        name: 'stops',
        type: 'string',
        description: 'Number of stops (e.g., "Nonstop", "1 stop")',
        optional: true
      },
      {
        name: 'bookingUrl',
        type: 'string',
        description: 'URL to book the flight',
        optional: true
      }
    ],
    instruction: 'Extract flight details including price, airline, route, and timing information',
    description: 'Schema for flight search results across different routes and dates'
  },

  /**
   * Product search results (Amazon, eBay, etc.)
   * Extracts product pricing and details
   */
  product_search: {
    fields: [
      {
        name: 'price',
        type: 'string',
        description: 'Product price with currency'
      },
      {
        name: 'title',
        type: 'string',
        description: 'Product name or title'
      },
      {
        name: 'availability',
        type: 'string',
        description: 'Availability status (e.g., "In Stock", "Out of Stock")',
        optional: true
      },
      {
        name: 'rating',
        type: 'string',
        description: 'Product rating or review score',
        optional: true
      },
      {
        name: 'reviewCount',
        type: 'string',
        description: 'Number of reviews',
        optional: true
      },
      {
        name: 'seller',
        type: 'string',
        description: 'Seller or brand name',
        optional: true
      },
      {
        name: 'shipping',
        type: 'string',
        description: 'Shipping cost or delivery information',
        optional: true
      },
      {
        name: 'url',
        type: 'string',
        description: 'URL to the product page',
        optional: true
      }
    ],
    instruction: 'Extract product details including price, title, availability, and ratings',
    description: 'Schema for product search results across different items and retailers'
  },

  /**
   * Hotel search results (Booking.com, Hotels.com, etc.)
   * Extracts hotel pricing and details
   */
  hotel_search: {
    fields: [
      {
        name: 'pricePerNight',
        type: 'string',
        description: 'Price per night with currency'
      },
      {
        name: 'totalPrice',
        type: 'string',
        description: 'Total price for the stay',
        optional: true
      },
      {
        name: 'hotelName',
        type: 'string',
        description: 'Hotel or property name'
      },
      {
        name: 'location',
        type: 'string',
        description: 'Hotel location (city, neighborhood, address)'
      },
      {
        name: 'rating',
        type: 'string',
        description: 'Hotel rating or review score',
        optional: true
      },
      {
        name: 'amenities',
        type: 'array',
        description: 'List of amenities (e.g., WiFi, Pool, Breakfast)',
        optional: true
      },
      {
        name: 'checkIn',
        type: 'string',
        description: 'Check-in date',
        optional: true
      },
      {
        name: 'checkOut',
        type: 'string',
        description: 'Check-out date',
        optional: true
      },
      {
        name: 'bookingUrl',
        type: 'string',
        description: 'URL to book the hotel',
        optional: true
      }
    ],
    instruction: 'Extract hotel details including pricing, name, location, and amenities',
    description: 'Schema for hotel search results across different locations and dates'
  },

  /**
   * Stock price lookups (Yahoo Finance, Bloomberg, etc.)
   * Extracts stock market data
   */
  stock_lookup: {
    fields: [
      {
        name: 'currentPrice',
        type: 'string',
        description: 'Current stock price with currency'
      },
      {
        name: 'priceChange',
        type: 'string',
        description: 'Price change in dollars (e.g., "+$2.50" or "-$1.20")',
        optional: true
      },
      {
        name: 'percentChange',
        type: 'string',
        description: 'Percentage change (e.g., "+2.5%" or "-1.2%")',
        optional: true
      },
      {
        name: 'ticker',
        type: 'string',
        description: 'Stock ticker symbol for validation',
        optional: true
      },
      {
        name: 'companyName',
        type: 'string',
        description: 'Company or security name',
        optional: true
      },
      {
        name: 'marketCap',
        type: 'string',
        description: 'Market capitalization',
        optional: true
      },
      {
        name: 'volume',
        type: 'string',
        description: 'Trading volume',
        optional: true
      },
      {
        name: 'high',
        type: 'string',
        description: 'Day high price',
        optional: true
      },
      {
        name: 'low',
        type: 'string',
        description: 'Day low price',
        optional: true
      }
    ],
    instruction: 'Extract stock price and trading information',
    description: 'Schema for stock price lookups across different securities'
  },

  /**
   * Contact form submissions
   * Extracts confirmation details
   */
  contact_form: {
    fields: [
      {
        name: 'status',
        type: 'string',
        description: 'Submission status (e.g., "Success", "Submitted", "Confirmed")'
      },
      {
        name: 'confirmationMessage',
        type: 'string',
        description: 'Confirmation message or response text',
        optional: true
      },
      {
        name: 'referenceNumber',
        type: 'string',
        description: 'Confirmation or reference number',
        optional: true
      },
      {
        name: 'timestamp',
        type: 'string',
        description: 'Submission timestamp',
        optional: true
      },
      {
        name: 'nextSteps',
        type: 'string',
        description: 'Information about next steps or expected response time',
        optional: true
      }
    ],
    instruction: 'Extract form submission confirmation details',
    description: 'Schema for contact form or inquiry submission results'
  },

  /**
   * Custom/unknown category
   * Uses AI to generate schema (fallback)
   */
  custom: {
    fields: [
      {
        name: 'result',
        type: 'string',
        description: 'The main result or output from the task'
      },
      {
        name: 'status',
        type: 'string',
        description: 'Status or outcome of the operation',
        optional: true
      },
      {
        name: 'details',
        type: 'string',
        description: 'Additional details or information',
        optional: true
      }
    ],
    instruction: 'Extract the main result and relevant details from the page',
    description: 'Generic fallback schema for custom or unrecognized tasks'
  }
};
