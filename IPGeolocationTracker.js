/**
 * IP GEOLOCATION TRACKER
 * Tracks user location based on IP address for audit logs
 */

const https = require('https');

class IPGeolocationTracker {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
    }

    // Get location data from IP address
    async getLocationData(ipAddress) {
        try {
            // Handle localhost and private IPs
            if (this.isLocalIP(ipAddress)) {
                return {
                    country: 'Local Network',
                    city: 'Local',
                    region: 'Local Network',
                    coordinates: '0,0',
                    flag: '🏠',
                    address: 'Local Network',
                    timezone: 'Local',
                    isp: 'Local Network'
                };
            }

            // Check cache first
            const cacheKey = ipAddress;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Try to get location from free IP API
            const locationData = await this.fetchLocationFromAPI(ipAddress);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: locationData,
                timestamp: Date.now()
            });

            return locationData;

        } catch (error) {
            console.error('Location tracking error:', error.message);
            return this.getDefaultLocation();
        }
    }

    // Check if IP is local/private
    isLocalIP(ip) {
        if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
            return true;
        }
        
        // Check private IP ranges
        const privateRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^169\.254\./
        ];
        
        return privateRanges.some(range => range.test(ip));
    }

    // Fetch location from free IP API
    async fetchLocationFromAPI(ipAddress) {
        return new Promise((resolve, reject) => {
            // Use ip-api.com (free, no API key required)
            const url = `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,query`;
            
            const request = require('http').get(url, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        
                        if (result.status === 'success') {
                            const locationData = {
                                country: result.country || 'Unknown',
                                city: result.city || 'Unknown',
                                region: result.regionName || result.region || 'Unknown',
                                coordinates: `${result.lat || 0},${result.lon || 0}`,
                                flag: this.getCountryFlag(result.countryCode),
                                address: `${result.city}, ${result.regionName}, ${result.country}`,
                                timezone: result.timezone || 'Unknown',
                                isp: result.isp || 'Unknown'
                            };
                            
                            console.log(`📍 Added location for IP ${ipAddress}: ${locationData.flag} ${locationData.city}, ${locationData.country}`);
                            resolve(locationData);
                        } else {
                            console.log(`⚠️ Location API failed for IP ${ipAddress}: ${result.message}`);
                            resolve(this.getDefaultLocation());
                        }
                    } catch (parseError) {
                        console.error('Location API parse error:', parseError.message);
                        resolve(this.getDefaultLocation());
                    }
                });
            });
            
            request.on('error', (error) => {
                console.error('Location API request error:', error.message);
                resolve(this.getDefaultLocation());
            });
            
            request.setTimeout(5000, () => {
                request.destroy();
                console.log('Location API timeout for IP:', ipAddress);
                resolve(this.getDefaultLocation());
            });
        });
    }

    // Get country flag emoji
    getCountryFlag(countryCode) {
        if (!countryCode || countryCode.length !== 2) {
            return '🌍';
        }
        
        const flagMap = {
            'IN': '🇮🇳', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
            'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷',
            'RU': '🇷🇺', 'KR': '🇰🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'MX': '🇲🇽',
            'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮'
        };
        
        return flagMap[countryCode.toUpperCase()] || '🌍';
    }

    // Get default location for unknown IPs
    getDefaultLocation() {
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            coordinates: '0,0',
            flag: '🌍',
            address: 'Unknown Location',
            timezone: 'Unknown',
            isp: 'Unknown'
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('📍 Location cache cleared');
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

module.exports = IPGeolocationTracker;