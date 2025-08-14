$(document).ready(async function() {
    // Initialize Property API MySQL Client
    const api = new PropertyAPIMySQL();
    let properties = [];

    try {
        // Load property data from API for consistent data across pages
        const apiProperties = await api.getAllProperties();
        properties = apiProperties.map(prop => ({
            address: prop.address,
            suburb: `${prop.suburb} ${prop.state} ${prop.postcode}`,
            type: prop.type,
            id: prop.id
        }));
        console.log('Loaded properties from API:', properties.length);
    } catch (error) {
        console.error('Failed to load properties from API:', error);
        // Fallback to basic data if API fails
        properties = [
            {
                address: "24 Arthur Street",
                suburb: "Woody Point QLD 4019",
                type: "Unit",
                id: "1"
            },
            {
                address: "15 Marine Parade",
                suburb: "Redcliffe QLD 4020",
                type: "House",
                id: "2"
            }
        ];
    }
    
    // Search input functionality
    $('#mainSearchInput').on('input', function() {
        const query = $(this).val().toLowerCase().trim();
        console.log('Search query:', query); // Debug log
        
        if (query.length >= 1) {
            showSearchSuggestions(query);
        } else {
            hideSearchSuggestions();
        }
    });
    
    // Also trigger on focus if there's already text
    $('#mainSearchInput').on('focus', function() {
        const query = $(this).val().toLowerCase().trim();
        if (query.length >= 1) {
            showSearchSuggestions(query);
        }
    });
    
    // Hide suggestions when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-container').length) {
            hideSearchSuggestions();
        }
    });
    
    function showSearchSuggestions(query) {
        console.log('Showing suggestions for:', query); // Debug log
        
        const $suggestions = $('#searchSuggestions');
        
        // Show loading state
        $suggestions.html(`
            <div class="suggestion-loading">
                <i class="bi bi-search"></i> Searching properties...
            </div>
        `).fadeIn(200);
        
        // Simulate API delay for better UX
        setTimeout(() => {
            const filteredProperties = properties.filter(property => 
                property.address.toLowerCase().includes(query.toLowerCase()) ||
                property.suburb.toLowerCase().includes(query.toLowerCase()) ||
                (property.type && property.type.toLowerCase().includes(query.toLowerCase()))
            );
            
            console.log('Filtered properties:', filteredProperties); // Debug log
            
            if (filteredProperties.length > 0) {
                let suggestionsHtml = '';
                
                // Limit to 5 suggestions for better UX
                const limitedProperties = filteredProperties.slice(0, 5);
                
                limitedProperties.forEach(property => {
                    const propertyType = property.type || 'House';
                    const propertyPrice = property.price ? `$${parseInt(property.price).toLocaleString()}` : 'Contact for price';
                    const bedroomInfo = property.bedrooms ? `${property.bedrooms} bed` : '';
                    const bathroomInfo = property.bathrooms ? `${property.bathrooms} bath` : '';
                    const roomInfo = bedroomInfo && bathroomInfo ? `${bedroomInfo}, ${bathroomInfo}` : (bedroomInfo || bathroomInfo);
                    
                    suggestionsHtml += `
                        <div class="suggestion-item" data-address="${property.address}" data-suburb="${property.suburb}" data-id="${property.id}">
                            <i class="bi bi-geo-alt suggestion-icon"></i>
                            <div class="suggestion-text">
                                <div class="suggestion-main">${property.address}</div>
                                <div class="suggestion-sub">${property.suburb}${roomInfo ? ' • ' + roomInfo : ''}</div>
                            </div>
                            ${propertyType ? `<span class="suggestion-badge">${propertyType}</span>` : ''}
                            ${property.price ? `<div class="suggestion-price">${propertyPrice}</div>` : ''}
                        </div>
                    `;
                });
                
                // Add "View all results" option if more properties exist
                if (filteredProperties.length > 5) {
                    suggestionsHtml += `
                        <div class="suggestion-item suggestion-view-all" data-query="${query}">
                            <i class="bi bi-list-ul suggestion-icon"></i>
                            <div class="suggestion-text">
                                <div class="suggestion-main">View all ${filteredProperties.length} results</div>
                                <div class="suggestion-sub">See complete search results</div>
                            </div>
                            <i class="bi bi-arrow-right" style="color: var(--flint-purple); margin-left: auto;"></i>
                        </div>
                    `;
                }
                
                $suggestions.html(suggestionsHtml).show();
                
                // Handle suggestion clicks (use event delegation)
                $suggestions.off('click', '.suggestion-item').on('click', '.suggestion-item', function() {
                    if ($(this).hasClass('suggestion-view-all')) {
                        // Handle "View all" click
                        const searchQuery = $(this).data('query');
                        $('#mainSearchInput').val(searchQuery);
                        hideSearchSuggestions();
                        // Could redirect to a search results page
                        console.log('View all results for:', searchQuery);
                        return;
                    }
                    
                    const address = $(this).data('address');
                    const suburb = $(this).data('suburb');
                    const propertyId = $(this).data('id');
                    $('#mainSearchInput').val(address + ', ' + suburb);
                    hideSearchSuggestions();
                    
                    // Add subtle feedback
                    $(this).css('background', 'var(--flint-purple)').find('.suggestion-text').css('color', 'white');
                    
                    // Navigate to property details page with property ID
                    setTimeout(() => {
                        window.location.href = `property-details.html?id=${propertyId}`;
                    }, 200);
                });
                
                // Add hover effects for better UX
                $suggestions.find('.suggestion-item').on('mouseenter', function() {
                    $(this).css('transform', 'translateX(4px)');
                }).on('mouseleave', function() {
                    $(this).css('transform', 'translateX(0)');
                });
                
            } else {
                // Enhanced "No results found" message
                $suggestions.html(`
                    <div class="suggestion-no-results">
                        <i class="bi bi-search"></i>
                        <div class="suggestion-main" style="color: var(--text-gray); margin-top: 8px;">No properties found</div>
                        <div class="suggestion-sub">Try searching for a different suburb or address</div>
                    </div>
                `).show();
            }
        }, 300); // 300ms delay for loading effect
    }
    
    function hideSearchSuggestions() {
        $('#searchSuggestions').fadeOut(200);
    }
    
    // Toggle advanced search form
    $('#advancedSearchBtn').on('click', function() {
        $('#advancedSearchForm').slideDown(400).addClass('fade-in');
        $(this).hide();
    });
    
    // Back to search button
    $('#backToSearchBtn').on('click', function(e) {
        e.preventDefault();
        $('#advancedSearchForm').slideUp(400);
        $('#advancedSearchBtn').show();
    });
    
    // Clear all form fields
    $('#clearAllBtn').on('click', function() {
        $('#propertySearchForm')[0].reset();
    });
    
    // Main search functionality
    $('#mainSearchInput').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            const query = $(this).val().trim();
            if (query) {
                // Try to find matching property
                const matchingProperty = properties.find(property => 
                    (property.address + ', ' + property.suburb).toLowerCase() === query.toLowerCase()
                );
                
                if (matchingProperty) {
                    // Navigate to property details page with specific ID
                    window.location.href = `property-details.html?id=${matchingProperty.id}`;
                } else {
                    // Navigate to property details page with default property
                    window.location.href = 'property-details.html';
                }
            }
        }
    });
    
    // Advanced search form submission
    $('#propertySearchForm').on('submit', function(e) {
        e.preventDefault();
        performAdvancedSearch();
    });
    
    // Advanced search function
    function performAdvancedSearch() {
        const formData = {
            unitNo: $('#unitNo').val(),
            streetNo: $('#streetNo').val(),
            lotNo: $('#lotNo').val(),
            streetName: $('#streetName').val(),
            streetType: $('#streetType').val(),
            suburbStatePostcode: $('#suburbStatePostcode').val()
        };
        // Filter out empty fields
        const searchData = Object.entries(formData)
            .filter(([key, value]) => value.trim() !== '')
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
        if (Object.keys(searchData).length === 0) {
            alert('Please fill in at least one field');
            return;
        }
        // Use the same properties array as main search
        const filteredProperties = properties.filter(property => {
            let match = true;
            if (searchData.unitNo && !property.address.toLowerCase().includes(searchData.unitNo.toLowerCase())) match = false;
            if (searchData.streetNo && !property.address.toLowerCase().includes(searchData.streetNo.toLowerCase())) match = false;
            if (searchData.lotNo && !property.address.toLowerCase().includes(searchData.lotNo.toLowerCase())) match = false;
            if (searchData.streetName && !property.address.toLowerCase().includes(searchData.streetName.toLowerCase())) match = false;
            if (searchData.streetType && !property.address.toLowerCase().includes(searchData.streetType.toLowerCase())) match = false;
            if (searchData.suburbStatePostcode && !property.suburb.toLowerCase().includes(searchData.suburbStatePostcode.toLowerCase())) match = false;
            return match;
        });
        const $suggestions = $('#advancedSearchSuggestions');
        
        // Show loading state for advanced search
        $suggestions.html(`
            <div class="suggestion-loading">
                <i class="bi bi-search"></i> Searching properties...
            </div>
        `).fadeIn(200);
        
        setTimeout(() => {
            if (filteredProperties.length === 1) {
                // Show single match before redirect
                const property = filteredProperties[0];
                const propertyType = property.type || 'House';
                const propertyPrice = property.price ? `$${parseInt(property.price).toLocaleString()}` : 'Contact for price';
                
                $suggestions.html(`
                    <div class="suggestion-item" style="background: linear-gradient(135deg, rgba(139, 69, 255, 0.1) 0%, rgba(139, 69, 255, 0.05) 100%);">
                        <i class="bi bi-check-circle-fill suggestion-icon" style="color: #28a745;"></i>
                        <div class="suggestion-text">
                            <div class="suggestion-main">Perfect Match Found!</div>
                            <div class="suggestion-sub">${property.address}, ${property.suburb}</div>
                        </div>
                        <span class="suggestion-badge">${propertyType}</span>
                        <div class="suggestion-price">${propertyPrice}</div>
                    </div>
                `).show();
                
                // Redirect after showing match
                setTimeout(() => {
                    window.location.href = `property-details.html?id=${filteredProperties[0].id}`;
                }, 1500);
                
            } else if (filteredProperties.length > 1) {
                let suggestionsHtml = '';
                
                // Limit to 8 results for advanced search
                const limitedProperties = filteredProperties.slice(0, 8);
                
                limitedProperties.forEach(property => {
                    const propertyType = property.type || 'House';
                    const propertyPrice = property.price ? `$${parseInt(property.price).toLocaleString()}` : 'Contact for price';
                    const bedroomInfo = property.bedrooms ? `${property.bedrooms} bed` : '';
                    const bathroomInfo = property.bathrooms ? `${property.bathrooms} bath` : '';
                    const roomInfo = bedroomInfo && bathroomInfo ? `${bedroomInfo}, ${bathroomInfo}` : (bedroomInfo || bathroomInfo);
                    
                    suggestionsHtml += `
                        <div class="suggestion-item" data-address="${property.address}" data-suburb="${property.suburb}" data-id="${property.id}">
                            <i class="bi bi-geo-alt suggestion-icon"></i>
                            <div class="suggestion-text">
                                <div class="suggestion-main">${property.address}</div>
                                <div class="suggestion-sub">${property.suburb}${roomInfo ? ' • ' + roomInfo : ''}</div>
                            </div>
                            <span class="suggestion-badge">${propertyType}</span>
                            <div class="suggestion-price">${propertyPrice}</div>
                        </div>
                    `;
                });
                
                // Add results summary
                if (filteredProperties.length > 8) {
                    suggestionsHtml = `
                        <div class="suggestion-item" style="background: #f8f9fa; border-bottom: 2px solid var(--flint-purple);">
                            <i class="bi bi-info-circle suggestion-icon" style="background: var(--flint-purple); color: white;"></i>
                            <div class="suggestion-text">
                                <div class="suggestion-main">Found ${filteredProperties.length} matching properties</div>
                                <div class="suggestion-sub">Showing top 8 results below</div>
                            </div>
                        </div>
                    ` + suggestionsHtml;
                }
                
                $suggestions.html(suggestionsHtml).show();
                
                // Enhanced click handlers for advanced search
                $suggestions.off('click', '.suggestion-item').on('click', '.suggestion-item', function() {
                    const propertyId = $(this).data('id');
                    if (propertyId) {
                        // Add click feedback
                        $(this).css('background', 'var(--flint-purple)').find('.suggestion-text, .suggestion-badge, .suggestion-price').css('color', 'white');
                        $(this).find('.suggestion-icon').css('background', 'white').css('color', 'var(--flint-purple)');
                        
                        setTimeout(() => {
                            window.location.href = `property-details.html?id=${propertyId}`;
                        }, 200);
                    }
                });
                
            } else {
                // Enhanced "No results found" for advanced search
                $suggestions.html(`
                    <div class="suggestion-no-results">
                        <i class="bi bi-search"></i>
                        <div class="suggestion-main" style="color: var(--text-gray); margin-top: 8px;">No properties found</div>
                        <div class="suggestion-sub">Please try different search criteria or broaden your search</div>
                    </div>
                `).show();
            }
        }, 300); // Loading delay
    }
    
    // Enhanced search input effects
    $('.search-input').on('focus', function() {
        $(this).closest('.search-box').addClass('focused');
    }).on('blur', function() {
        setTimeout(() => {
            $(this).closest('.search-box').removeClass('focused');
            // Don't hide suggestions immediately to allow clicks
        }, 300);
    });
    
    // Form field focus effects for advanced search
    $('.form-control').on('focus', function() {
        $(this).closest('.form-group').addClass('focused');
    }).on('blur', function() {
        $(this).closest('.form-group').removeClass('focused');
    });
});
