import React, {useEffect, useMemo, useState} from 'react';
import '../../styles/OrderDetailTable.css';
import DisplayImage from './DisplayImage.jsx';
import {getSizes} from '../../services/OrderService.jsx';
import {getGarmentFabricForQuotation} from '../../services/SystemService.jsx';

export default function OrderDetailTable({detail, garmentQuotation = false, orderId = 0, onTotalPriceChange}) {
    const [sizeData, setSizeData] = useState([]);
    const [quotationData, setQuotationData] = useState({totalPrice: 0, detailMap: {}});

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

    // Fetch garment quotation fabric prices when needed
    useEffect(() => {
        const fetchQuotationPrices = async () => {
            if (!garmentQuotation || !orderId) return;
            try {
                const response = await getGarmentFabricForQuotation(orderId);
                const data = response?.data?.body || null;
                if (data && Array.isArray(data.detail)) {
                    const detailMap = {};
                    data.detail.forEach(entry => {
                        const id = entry.orderDetailId;
                        if (!detailMap[id]) {
                            detailMap[id] = {unitPrice: entry.unitPrice, priceWithQty: 0};
                        }
                        // Keep latest unitPrice (they should be identical), and accumulate priceWithQty
                        detailMap[id].unitPrice = entry.unitPrice;
                        detailMap[id].priceWithQty += (entry.priceWithQty || 0);
                    });
                    setQuotationData({totalPrice: data.totalPrice || 0, detailMap});
                } else {
                    setQuotationData({totalPrice: 0, detailMap: {}});
                }
            } catch (e) {
                setQuotationData({totalPrice: 0, detailMap: {}});
                console.error('Error fetching garment quotation fabric prices:', e);
            }
        };
        fetchQuotationPrices();
    }, [garmentQuotation, orderId]);

    // Notify parent about total price for validation/warning
    useEffect(() => {
        if (garmentQuotation && orderId && typeof onTotalPriceChange === 'function') {
            onTotalPriceChange(quotationData.totalPrice || 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quotationData.totalPrice]);

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

    const formatVnd = (amount) => {
        if (amount === undefined || amount === null || isNaN(amount)) return '-';
        return amount.toLocaleString('vi-VN');
    };

    const formatColor = (color) => {
        return (
            <div className="color-display">
                <div
                    className="color-box"
                    style={{backgroundColor: color}}
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
            <LogoInfoSection/>
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
                            <th>No.</th>
                            <th>Images</th>
                            <th>Product Type</th>
                            <th>Category</th>
                            <th>Gender</th>
                            <th>Color</th>
                            <th>Fabric</th>
                            <th>Quantity</th>
                            <th>Size</th>
                            <th>Unit Cost</th>
                            <th>Total Qty</th>
                            <th>Total Cost</th>
                        </tr>
                        </thead>
                        <tbody>
                        {detail.map((item, index) => {
                            const designItem = item.deliveryItem.designItem;
                            const deliveryItem = item.deliveryItem;

                            const price = (garmentQuotation && orderId !== 0) ? quotationData.detailMap[item.id] : null;
                            return (
                                <tr key={`${designItem.type}-${designItem.id}-${index}`} className="data-row">
                                    <td className="text-center">{item.id}</td>
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
                                    <td className="text-center quantity-cell">{item.quantity}</td>
                                    <td className="text-center quantity-cell">{item.size}</td>
                                    <td className="text-center quantity-cell">{price ? formatVnd(price.unitPrice) : '-'}</td>
                                    <td className="text-center font-bold total-quantity">{item.quantity}</td>
                                    <td className="text-center">{price ? formatVnd(price.priceWithQty) : '-'}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan="12">
                                <div style={{
                                    marginTop: 8,
                                    padding: '12px 16px',
                                    borderRadius: 8,
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: 10
                                }}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: '#334155'
                                        }}>Total Quantity</span>
                                        <span style={{
                                            backgroundColor: '#e0f2fe',
                                            color: '#0369a1',
                                            border: '1px solid #bae6fd',
                                            borderRadius: 999,
                                            padding: '4px 10px',
                                            fontWeight: 700
                                        }}>{detail.reduce((total, item) => total + (item.quantity || 0), 0)}</span>
                                    </div>
                                    {garmentQuotation && orderId !== 0 && (
                                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: '#334155'
                                            }}>Total Cost</span>
                                            <span style={{
                                                backgroundColor: '#dcfce7',
                                                color: '#166534',
                                                border: '1px solid #bbf7d0',
                                                borderRadius: 999,
                                                padding: '4px 10px',
                                                fontWeight: 700
                                            }}>{formatVnd(quotationData.totalPrice)} VND</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}