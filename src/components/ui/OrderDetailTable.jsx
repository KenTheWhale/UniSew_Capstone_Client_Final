
import React, { useMemo, useState, useEffect } from 'react';
import '../../styles/OrderDetailTable.css';
import DisplayImage from './DisplayImage.jsx';
import { getSizes } from '../../services/OrderService.jsx';

export default function OrderDetailTable({ detail }) {
    const [sizeData, setSizeData] = useState([]);

    // Get size data from API
    useEffect(() => {
        const fetchSizeData = async () => {
            try {
                const response = await getSizes();
                if (response && response.data) {
                    setSizeData(response.data.body);
                }
            } catch (error) {
                console.error('Error fetching size data:', error);
            }
        };

        fetchSizeData();
    }, []);

    // Group items by design item and then by size
    const groupedData = useMemo(() => {
        if (!detail || !Array.isArray(detail)) return [];
        
        const grouped = {};
        
        detail.forEach(item => {
            const designItem = item.deliveryItem.designItem;
            const key = `${designItem.type}-${designItem.id}`;
            
            if (!grouped[key]) {
                grouped[key] = {
                    designItem,
                    deliveryItem: item.deliveryItem,
                    items: []
                };
            }
            
            grouped[key].items.push(item);
        });
        
        return Object.values(grouped);
    }, [detail]);

    const getTotalQuantity = (items) => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const formatColor = (color) => {
        return (
            <div className="color-display">
                <div 
                    className="color-box" 
                    style={{ backgroundColor: color }}
                ></div>
                <span>{color}</span>
            </div>
        );
    };

    // Calculate logo size based on size ratio
    const calculateLogoSizeForSize = (deliveryItem, targetSize, designItem) => {
        // Check if we have the necessary data
        if (!deliveryItem || !sizeData.length || designItem.type !== 'shirt') {
            return null;
        }

        // Check if logo dimensions exist
        if (!deliveryItem.baseLogoWidth || !deliveryItem.baseLogoHeight) {
            return null;
        }

        // Get gender mapping for API data
        const gender = designItem.gender === 'boy' ? 'male' : 'female';
        
        // Find base size (S) and target size data
        const baseSizeData = sizeData.find(s => 
            s.type === 'shirt' && 
            s.gender === gender && 
            s.size === 'S'
        );
        
        const targetSizeData = sizeData.find(s => 
            s.type === 'shirt' && 
            s.gender === gender && 
            s.size === targetSize
        );

        if (!baseSizeData || !targetSizeData) {
            return null;
        }

        // Calculate ratio based on average of height and weight ratio
        const heightRatio = (targetSizeData.maxHeight + targetSizeData.minHeight) / 
                           (baseSizeData.maxHeight + baseSizeData.minHeight);
        const weightRatio = (targetSizeData.maxWeight + targetSizeData.minWeight) / 
                           (baseSizeData.maxWeight + baseSizeData.minWeight);
        
        // Use average of height and weight ratio
        const ratio = (heightRatio + weightRatio) / 2;

        return {
            width: Math.round(deliveryItem.baseLogoWidth * ratio * 10) / 10,
            height: Math.round(deliveryItem.baseLogoHeight * ratio * 10) / 10
        };
    };

    // Get logo information for shirts (only unique logos)
    const getLogoInfo = () => {
        const logoItems = groupedData.filter(group => 
            group.designItem.type === 'shirt' && 
            group.designItem.logoImageUrl
        );
        
        // Get unique logos based on logoImageUrl to avoid duplicates
        const uniqueLogos = [];
        const seenLogoUrls = new Set();
        
        logoItems.forEach(group => {
            if (!seenLogoUrls.has(group.designItem.logoImageUrl)) {
                seenLogoUrls.add(group.designItem.logoImageUrl);
                uniqueLogos.push({
                    designItem: group.designItem,
                    deliveryItem: group.deliveryItem,
                    logoSizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map(size => ({
                        size,
                        dimensions: calculateLogoSizeForSize(group.deliveryItem, size, group.designItem)
                    })).filter(item => item.dimensions)
                });
            }
        });
        
        return uniqueLogos;
    };

    if (!detail || !Array.isArray(detail) || detail.length === 0) {
        return (
            <div className="order-detail-table-container">
                <p className="no-data">No order data available</p>
            </div>
        );
    }

    // LogoInfoSection component
    const LogoInfoSection = () => {
        const logoInfo = getLogoInfo();
        
        if (logoInfo.length === 0) return null;

        return (
            <div className="logo-info-section">
                <div className="logo-header">
                    <h3 style={{color: '#1976d2'}}>Logo Information</h3>
                </div>
                {logoInfo.map((item, index) => (
                    <div key={index} className="logo-item">
                        <div className="logo-details">
                            <div className="logo-image-container">
                                <DisplayImage
                                    imageUrl={item.designItem.logoImageUrl}
                                    alt="Logo"
                                    width="80px"
                                    height="80px"
                                    style={{
                                        objectFit: 'contain',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd'
                                    }}
                                />
                            </div>
                            <div className="logo-info-details">
                                <div className="logo-position">
                                    <strong>Position:</strong> {item.designItem.logoPosition || 'N/A'}
                                </div>
                                <div className="logo-sizes-grid">
                                    <strong>Logo Sizes by Size:</strong>
                                    <div className="sizes-grid">
                                        {item.logoSizes.length > 0 ? (
                                            item.logoSizes.map((sizeInfo, sizeIndex) => (
                                                <div key={sizeIndex} className="size-info">
                                                    <span className="size-label">{sizeInfo.size}</span>
                                                    <span className="size-dimensions">
                                                        {sizeInfo.dimensions.width} × {sizeInfo.dimensions.height} cm
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-sizes-message">
                                                <span style={{color: '#666', fontStyle: 'italic'}}>
                                                    No logo sizes available
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="order-detail-container">
            <LogoInfoSection />
            <div className="order-detail-table-container">
                <div className="table-header">
                    <h3 style={{color: '#1976d2'}}>Order Details</h3>
                    <div className="summary-info">
                        <span style={{backgroundColor: '#e3f2fd', color: '#1976d2', border: '1px solid #1976d2'}}>Total items: {detail.length}</span>
                    </div>
                </div>
            
            <div className="table-wrapper">
                <table className="order-detail-table">
                    <thead>
                        <tr>
                            <th rowSpan="2">No.</th>
                            <th rowSpan="2">Images</th>
                            <th rowSpan="2">Product Type</th>
                            <th rowSpan="2">Category</th>
                            <th rowSpan="2">Gender</th>
                            <th rowSpan="2">Color</th>
                            <th rowSpan="2">Fabric</th>
                            <th colSpan="7">Quantity by Size</th>
                            <th rowSpan="2">Total Qty</th>
                        </tr>
                        <tr>
                            <th>S</th>
                            <th>M</th>
                            <th>L</th>
                            <th>XL</th>
                            <th>XXL</th>
                            <th>3XL</th>
                            <th>4XL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedData.map((group, groupIndex) => {
                            const { designItem, deliveryItem, items } = group;
                            
                            // Create size quantity mapping
                            const sizeQuantities = {
                                'S': 0, 'M': 0, 'L': 0, 'XL': 0, 
                                'XXL': 0, '3XL': 0, '4XL': 0
                            };
                            
                            items.forEach(item => {
                                if (sizeQuantities.hasOwnProperty(item.size)) {
                                    sizeQuantities[item.size] = item.quantity;
                                }
                            });
                            
                            return (
                                <tr key={`${designItem.type}-${designItem.id}`} className="data-row">
                                    <td className="text-center">{groupIndex + 1}</td>
                                    <td className="image-cell">
                                        <div className="product-images">
                                            <div className="image-item">
                                                <DisplayImage
                                                    imageUrl={deliveryItem.frontImageUrl}
                                                    alt="Front"
                                                    width="50px"
                                                    height="50px"
                                                    style={{
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        border: '1px solid #ddd',
                                                        transition: 'transform 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <span className="image-label">Front</span>
                                            </div>
                                            <div className="image-item">
                                                <DisplayImage
                                                    imageUrl={deliveryItem.backImageUrl}
                                                    alt="Back"
                                                    width="50px"
                                                    height="50px"
                                                    style={{
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        border: '1px solid #ddd',
                                                        transition: 'transform 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <span className="image-label">Back</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center font-medium">
                                        {designItem.type === 'shirt' ? 'Shirt' : 
                                         designItem.type === 'pants' ? 'Pants' : 
                                         designItem.type}
                                    </td>
                                    <td className="text-center">
                                        {designItem.category === 'regular' ? 'Regular' : designItem.category}
                                    </td>
                                    <td className="text-center">
                                        {designItem.gender === 'boy' ? 'Boy' : 
                                         designItem.gender === 'girl' ? 'Girl' : 
                                         designItem.gender}
                                    </td>
                                    <td className="text-center">
                                        {formatColor(designItem.color)}
                                    </td>
                                    <td className="text-center">{designItem.fabricName}</td>
                                    <td className="text-center quantity-cell">
                                        {sizeQuantities.S || '-'}
                                    </td>
                                    <td className="text-center quantity-cell">
                                        {sizeQuantities.M || '-'}
                                    </td>
                                    <td className="text-center quantity-cell">
                                        {sizeQuantities.L || '-'}
                                    </td>
                                    <td className="text-center quantity-cell">
                                        {sizeQuantities.XL || '-'}
                                    </td>
                                    <td className="text-center quantity-cell">
                                        {sizeQuantities.XXL || '-'}
                                    </td>
                                    <td className="text-center quantity-cell">
                                        {sizeQuantities['3XL'] || '-'}
                                    </td>
                                    <td className="text-center quantity-cell">
                                        {sizeQuantities['4XL'] || '-'}
                                    </td>
                                    <td className="text-center font-bold total-quantity">
                                        {getTotalQuantity(items)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="summary-row">
                            <td colSpan="7" className="text-right font-bold">Total:</td>
                            {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map(size => {
                                const total = detail
                                    .filter(item => item.size === size)
                                    .reduce((sum, item) => sum + item.quantity, 0);
                                return (
                                    <td key={size} className="text-center font-bold summary-quantity">
                                        {total || '-'}
                                    </td>
                                );
                            })}
                            <td className="text-center font-bold grand-total">
                                {detail.reduce((total, item) => total + item.quantity, 0)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            </div>
        </div>
    );
}