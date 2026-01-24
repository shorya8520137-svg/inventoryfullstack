/**
 * IP GEOLOCATION TRACKER
 * Tracks location information based on IP addresses
 * Integrates with multiple geolocation APIs for accuracy
 */

const axios = require('axios');

class IPGeolocationTracker {
    constructor() {
        // Cache for IP location data to avoid repeated API calls
        this.locationCache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        // Free geolocation APIs (no API key required)
        this.geoAPIs = [
            {
                name: 'ipapi.co',
                url: (ip) => `https://ipapi.co/${ip}/json/`,
                parser: (data) => ({
                    country: data.country_name,
                    countryCode: data.country_code,
                    region: data.region,
                    city: data.city,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timezone: data.timezone,
                    isp: data.org,
                    asn: data.asn
                })
            },
            {
                name: 'ip-api.com',
                url: (ip) => `http://ip-api.com/json/${ip}`,
                parser: (data) => ({
                    country: data.country,
                    countryCode: data.countryCode,
                    region: data.regionName,
                    city: data.city,
                    latitude: data.lat,
                    longitude: data.lon,
                    timezone: data.timezone,
                    isp: data.isp,
                    asn: data.as
                })
            },
            {
                name: 'ipinfo.io',
                url: (ip) => `https://ipinfo.io/${ip}/json`,
                parser: (data) => {
                    const [lat, lon] = (data.loc || '0,0').split(',');
                    return {
                        country: data.country,
                        countryCode: data.country,
                        region: data.region,
                        city: data.city,
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lon),
                        timezone: data.timezone,
                        isp: data.org,
                        asn: data.org
                    };
                }
            }
        ];
    }

    // Get location data for IP address
    async getLocationData(ip) {
        // Skip localhost and private IPs
        if (this.isPrivateIP(ip)) {
            return {
                country: 'Local Network',
                countryCode: 'LN',
                region: 'Private Network',
                city: 'Local',
                latitude: 0,
                longitude: 0,
                timezone: 'Local',
                isp: 'Private Network',
                asn: 'Private',
                flag: '🏠'
            };
        }

        // Check cache first
        const cacheKey = ip;
        const cached = this.locationCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }

        // Try each API until one works
        for (const api of this.geoAPIs) {
            try {
                console.log(`🌍 Fetching location for ${ip} using ${api.name}`);
                const response = await axios.get(api.url(ip), {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'StockIQ-Inventory-System/1.0'
                    }
                });

                const locationData = api.parser(response.data);
                
                // Add country flag emoji
                locationData.flag = this.getCountryFlag(locationData.countryCode);
                
                // Add formatted address
                locationData.address = this.formatAddress(locationData);
                
                // Cache the result
                this.locationCache.set(cacheKey, {
                    data: locationData,
                    timestamp: Date.now()
                });

                console.log(`✅ Location found: ${locationData.city}, ${locationData.country}`);
                return locationData;

            } catch (error) {
                console.log(`❌ ${api.name} failed: ${error.message}`);
                continue;
            }
        }

        // Fallback if all APIs fail
        console.log(`⚠️ All geolocation APIs failed for ${ip}`);
        return {
            country: 'Unknown',
            countryCode: 'UN',
            region: 'Unknown',
            city: 'Unknown',
            latitude: 0,
            longitude: 0,
            timezone: 'Unknown',
            isp: 'Unknown',
            asn: 'Unknown',
            flag: '🌍',
            address: 'Location Unknown'
        };
    }

    // Check if IP is private/local
    isPrivateIP(ip) {
        if (!ip || ip === '127.0.0.1' || ip === 'localhost') return true;
        
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4) return true;
        
        // Private IP ranges
        if (parts[0] === 10) return true; // 10.0.0.0/8
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
        if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
        
        return false;
    }

    // Get country flag emoji
    getCountryFlag(countryCode) {
        if (!countryCode || countryCode.length !== 2) return '🌍';
        
        const flagMap = {
            'IN': '🇮🇳', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
            'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷',
            'RU': '🇷🇺', 'KR': '🇰🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'MX': '🇲🇽',
            'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮',
            'SG': '🇸🇬', 'HK': '🇭🇰', 'TW': '🇹🇼', 'TH': '🇹🇭', 'MY': '🇲🇾',
            'PH': '🇵🇭', 'ID': '🇮🇩', 'VN': '🇻🇳', 'BD': '🇧🇩', 'PK': '🇵🇰',
            'LK': '🇱🇰', 'NP': '🇳🇵', 'MM': '🇲🇲', 'KH': '🇰🇭', 'LA': '🇱🇦'
        };
        
        return flagMap[countryCode.toUpperCase()] || '🌍';
    }

    // Format address string
    formatAddress(locationData) {
        const parts = [];
        if (locationData.city && locationData.city !== 'Unknown') parts.push(locationData.city);
        if (locationData.region && locationData.region !== 'Unknown') parts.push(locationData.region);
        if (locationData.country && locationData.country !== 'Unknown') parts.push(locationData.country);
        
        return parts.length > 0 ? parts.join(', ') : 'Location Unknown';
    }

    // Get distance between two coordinates (in km)
    getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(deg) {
        return deg * (Math.PI/180);
    }

    // Analyze location patterns for security
    analyzeLocationPattern(locations) {
        if (locations.length < 2) return { risk: 'low', message: 'Insufficient data' };
        
        const uniqueCountries = new Set(locations.map(loc => loc.country));
        const uniqueCities = new Set(locations.map(loc => loc.city));
        
        // Check for suspicious patterns
        if (uniqueCountries.size > 3) {
            return { risk: 'high', message: 'Multiple countries detected' };
        }
        
        if (uniqueCities.size > 5) {
            return { risk: 'medium', message: 'Multiple cities detected' };
        }
        
        // Check for rapid location changes
        for (let i = 1; i < locations.length; i++) {
            const prev = locations[i-1];
            const curr = locations[i];
            const timeDiff = new Date(curr.timestamp) - new Date(prev.timestamp);
            const distance = this.getDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
            
            // If moved more than 100km in less than 1 hour
            if (distance > 100 && timeDiff < 60 * 60 * 1000) {
                return { risk: 'high', message: 'Rapid location change detected' };
            }
        }
        
        return { risk: 'low', message: 'Normal location pattern' };
    }

    // Clear cache
    clearCache() {
        this.locationCache.clear();
        console.log('🗑️ Location cache cleared');
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.locationCache.size,
            entries: Array.from(this.locationCache.keys())
        };
    }
}

module.exports = IPGeolocationTracker;