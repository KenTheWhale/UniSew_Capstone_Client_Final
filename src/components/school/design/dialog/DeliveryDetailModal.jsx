import React, {useState} from 'react';
import {Button, Col, Divider, Row, Tag, Typography} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    SyncOutlined
} from '@ant-design/icons';
import {Box, Dialog} from '@mui/material';
import DisplayImage from '../../../ui/DisplayImage.jsx';
import {formatDateTime} from '../../../../utils/TimestampUtil.jsx';
import JSZip from "jszip";
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import {saveAs} from 'file-saver';

const formatCategory = (category) => {
    const v = (category || '').toLowerCase();
    return v === 'pe' ? 'physical education' : (category || '');
};

const getItemIcon = (itemType) => {
    const type = itemType?.toLowerCase() || '';

    if (type.includes('shirt') || type.includes('áo')) {
        return <PiShirtFoldedFill style={{fontSize: '20px'}}/>;
    } else if (type.includes('pant') || type.includes('quần')) {
        return <PiPantsFill style={{fontSize: '20px'}}/>;
    } else if (type.includes('skirt') || type.includes('váy')) {
        return <GiSkirt style={{fontSize: '20px'}}/>;
    } else {
        return <FileTextOutlinedIcon/>;
    }
};

const downloadDesignAsZip = async (delivery) => {
    try {
        const zip = new JSZip();

        // Helper function to validate image URL
        const validateImageUrl = (imageUrl) => {
            if (!imageUrl || typeof imageUrl !== 'string') {
                return {valid: false, reason: 'Invalid URL format'};
            }

            try {
                const url = new URL(imageUrl);

                // Fix Mixed Content issue: convert HTTP to HTTPS
                if (url.protocol === 'http:') {
                    url.protocol = 'https:';
                    console.log('Converted HTTP to HTTPS:', imageUrl, '→', url.toString());
                }

                if (!url.protocol.startsWith('https')) {
                    return {valid: false, reason: 'Invalid protocol - only HTTPS allowed'};
                }

                return {valid: true, url: url.toString()};
            } catch (error) {
                console.error('URL validation error:', error, 'for URL:', imageUrl);
                return {valid: false, reason: 'Invalid URL structure'};
            }
        };

        // Helper function to fetch image and convert to blob with better error handling
        const fetchImageAsBlob = async (imageUrl) => {
            try {
                // Validate URL first
                const validation = validateImageUrl(imageUrl);
                if (!validation.valid) {
                    console.warn('Invalid image URL:', imageUrl, 'Reason:', validation.reason);
                    return null;
                }

                const validUrl = validation.url;
                console.log('Fetching image from:', validUrl);

                // Add timestamp to prevent caching issues
                const urlWithTimestamp = validUrl.includes('?')
                    ? `${validUrl}&t=${Date.now()}`
                    : `${validUrl}?t=${Date.now()}`;

                // Try different fetch strategies
                let response;
                let fetchError;

                // Strategy 1: Standard fetch with CORS
                try {
                    response = await fetch(urlWithTimestamp, {
                        method: 'GET',
                        mode: 'cors',
                        credentials: 'include',
                        headers: {
                            'Accept': 'image/*',
                            'Cache-Control': 'no-cache'
                        }
                    });
                } catch (error) {
                    fetchError = error;
                    console.log('Standard fetch failed, trying alternative methods...');
                }

                // Strategy 2: Try without credentials if first attempt failed
                if (!response && fetchError) {
                    try {
                        response = await fetch(urlWithTimestamp, {
                            method: 'GET',
                            mode: 'cors',
                            credentials: 'omit',
                            headers: {
                                'Accept': 'image/*',
                                'Cache-Control': 'no-cache'
                            }
                        });
                    } catch (error) {
                        console.log(error, 'Fetch without credentials also failed, trying no-cors...');
                    }
                }

                // Strategy 3: Try no-cors mode as last resort
                if (!response) {
                    try {
                        response = await fetch(validUrl, {
                            method: 'GET',
                            mode: 'no-cors'
                        });

                        if (response.type === 'opaque') {
                            console.warn('No-cors response received, cannot access image content');
                            return null;
                        }
                    } catch (error) {
                        console.error('All fetch strategies failed:', error);
                        return null;
                    }
                }

                if (!response) {
                    console.error('All fetch strategies failed for URL:', validUrl);
                    return null;
                }

                if (!response.ok) {
                    console.error(`HTTP error! status: ${response.status} for URL: ${validUrl}`);
                    return null;
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.startsWith('image/')) {
                    console.warn(`Invalid content type: ${contentType} for URL: ${validUrl}`);
                    return null;
                }

                const blob = await response.blob();
                if (blob.size === 0) {
                    console.warn(`Empty blob received for URL: ${validUrl}`);
                    return null;
                }

                console.log(`Successfully fetched image: ${validUrl}, size: ${blob.size} bytes, type: ${contentType}`);
                return blob;
            } catch (error) {
                console.error('Error fetching image:', error, 'URL:', imageUrl);
                return null;
            }
        };

        // Helper function to add image to zip with unique naming
        const addImageToZip = async (folder, imageUrl, fileName, index = 0) => {
            if (!imageUrl) return false;

            const blob = await fetchImageAsBlob(imageUrl);
            if (blob) {
                // Create unique filename to avoid conflicts
                const uniqueFileName = index > 0 ? `${fileName}_${index + 1}.png` : `${fileName}.png`;
                folder.file(uniqueFileName, blob);
                console.log(`Added image to ZIP: ${uniqueFileName}`);
                return true;
            } else {
                console.warn(`Failed to fetch image for: ${fileName}`);
                return false;
            }
        };

        // Log delivery information for debugging
        console.log('Processing delivery:', {
            name: delivery.name,
            id: delivery.id,
            totalItems: safeDelivery.deliveryItems?.length || 0,
            items: safeDelivery.deliveryItems?.map(item => ({
                frontImageUrl: item.frontImageUrl,
                backImageUrl: item.backImageUrl,
                type: item.designItem?.type,
                gender: item.designItem?.gender,
                category: item.designItem?.category
            }))
        });

        // Group items by gender and category
        const boyItems = safeDelivery.deliveryItems?.filter(item =>
            item.designItem?.gender?.toLowerCase() === 'boy'
        ) || [];
        const girlItems = safeDelivery.deliveryItems?.filter(item =>
            item.designItem?.gender?.toLowerCase() === 'girl'
        ) || [];
        const otherItems = safeDelivery.deliveryItems?.filter(item => {
            const gender = item.designItem?.gender?.toLowerCase();
            return gender !== 'boy' && gender !== 'girl';
        }) || [];

        let totalImagesAdded = 0;
        let totalImagesAttempted = 0;

        // Process Boy uniforms
        if (boyItems.length > 0) {
            const boyFolder = zip.folder("boy");

            // Group by category (regular, physical education)
            const boyRegular = boyItems.filter(item =>
                item.designItem?.category?.toLowerCase() === 'regular'
            );
            const boyPE = boyItems.filter(item =>
                item.designItem?.category?.toLowerCase() === 'pe'
            );

            // Add regular uniforms
            if (boyRegular.length > 0) {
                const regularFolder = boyFolder.folder("regular uniform");

                // Group by cloth type (shirt, pants, skirt, etc.)
                const shirtItems = boyRegular.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('shirt')
                );
                const pantsItems = boyRegular.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('pant')
                );
                const skirtItems = boyRegular.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('skirt')
                );
                const otherItems = boyRegular.filter(item => {
                    const type = item.designItem?.type?.toLowerCase();
                    return !type.includes('shirt') && !type.includes('pant') && !type.includes('skirt');
                });

                // Add shirt items
                if (shirtItems.length > 0) {
                    const shirtFolder = regularFolder.folder("shirt");
                    for (let i = 0; i < shirtItems.length; i++) {
                        const item = shirtItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(shirtFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(shirtFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add pants items
                if (pantsItems.length > 0) {
                    const pantsFolder = regularFolder.folder("pants");
                    for (let i = 0; i < pantsItems.length; i++) {
                        const item = pantsItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(pantsFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(pantsFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add skirt items
                if (skirtItems.length > 0) {
                    const skirtFolder = regularFolder.folder("skirt");
                    for (let i = 0; i < skirtItems.length; i++) {
                        const item = skirtItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(skirtFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(skirtFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add other items
                if (otherItems.length > 0) {
                    const otherFolder = regularFolder.folder("other");
                    for (let i = 0; i < otherItems.length; i++) {
                        const item = otherItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(otherFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(otherFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }
            }

            // Add physical education uniforms
            if (boyPE.length > 0) {
                const peFolder = boyFolder.folder("physical education uniform");

                // Group by cloth type (shirt, pants, skirt, etc.)
                const shirtItems = boyPE.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('shirt')
                );
                const pantsItems = boyPE.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('pant')
                );
                const skirtItems = boyPE.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('skirt')
                );
                const otherItems = boyPE.filter(item => {
                    const type = item.designItem?.type?.toLowerCase();
                    return !type.includes('shirt') && !type.includes('pant') && !type.includes('skirt');
                });

                // Add shirt items
                if (shirtItems.length > 0) {
                    const shirtFolder = peFolder.folder("shirt");
                    for (let i = 0; i < shirtItems.length; i++) {
                        const item = shirtItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(shirtFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(shirtFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add pants items
                if (pantsItems.length > 0) {
                    const pantsFolder = peFolder.folder("pants");
                    for (let i = 0; i < pantsItems.length; i++) {
                        const item = pantsItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(pantsFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(pantsFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add skirt items
                if (skirtItems.length > 0) {
                    const skirtFolder = peFolder.folder("skirt");
                    for (let i = 0; i < skirtItems.length; i++) {
                        const item = skirtItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(skirtFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(skirtFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add other items
                if (otherItems.length > 0) {
                    const otherFolder = peFolder.folder("other");
                    for (let i = 0; i < otherItems.length; i++) {
                        const item = otherItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(otherFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(otherFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }
            }
        }

        // Process Girl uniforms
        if (girlItems.length > 0) {
            const girlFolder = zip.folder("girl");

            // Group by category (regular, physical education)
            const girlRegular = girlItems.filter(item =>
                item.designItem?.category?.toLowerCase() === 'regular'
            );
            const girlPE = girlItems.filter(item =>
                item.designItem?.category?.toLowerCase() === 'pe'
            );

            // Add regular uniforms
            if (girlRegular.length > 0) {
                const regularFolder = girlFolder.folder("regular uniform");

                // Group by cloth type (shirt, pants, skirt, etc.)
                const shirtItems = girlRegular.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('shirt')
                );
                const pantsItems = girlRegular.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('pant')
                );
                const skirtItems = girlRegular.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('skirt')
                );
                const otherItems = girlRegular.filter(item => {
                    const type = item.designItem?.type?.toLowerCase();
                    return !type.includes('shirt') && !type.includes('pant') && !type.includes('skirt');
                });

                // Add shirt items
                if (shirtItems.length > 0) {
                    const shirtFolder = regularFolder.folder("shirt");
                    for (let i = 0; i < shirtItems.length; i++) {
                        const item = shirtItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(shirtFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(shirtFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add pants items
                if (pantsItems.length > 0) {
                    const pantsFolder = regularFolder.folder("pants");
                    for (let i = 0; i < pantsItems.length; i++) {
                        const item = pantsItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(pantsFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(pantsFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add skirt items
                if (skirtItems.length > 0) {
                    const skirtFolder = regularFolder.folder("skirt");
                    for (let i = 0; i < skirtItems.length; i++) {
                        const item = skirtItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(skirtFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(skirtFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add other items
                if (otherItems.length > 0) {
                    const otherFolder = regularFolder.folder("other");
                    for (let i = 0; i < otherItems.length; i++) {
                        const item = otherItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(otherFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(otherFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }
            }

            // Add physical education uniforms
            if (girlPE.length > 0) {
                const peFolder = girlFolder.folder("physical education uniform");

                // Group by cloth type (shirt, pants, skirt, etc.)
                const shirtItems = girlPE.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('shirt')
                );
                const pantsItems = girlPE.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('pant')
                );
                const skirtItems = girlPE.filter(item =>
                    item.designItem?.type?.toLowerCase().includes('skirt')
                );
                const otherItems = girlPE.filter(item => {
                    const type = item.designItem?.type?.toLowerCase();
                    return !type.includes('shirt') && !type.includes('pant') && !type.includes('skirt');
                });

                // Add shirt items
                if (shirtItems.length > 0) {
                    const shirtFolder = peFolder.folder("shirt");
                    for (let i = 0; i < shirtItems.length; i++) {
                        const item = shirtItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(shirtFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(shirtFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add pants items
                if (pantsItems.length > 0) {
                    const pantsFolder = peFolder.folder("pants");
                    for (let i = 0; i < pantsItems.length; i++) {
                        const item = pantsItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(pantsFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(pantsFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add skirt items
                if (skirtItems.length > 0) {
                    const skirtFolder = peFolder.folder("skirt");
                    for (let i = 0; i < skirtItems.length; i++) {
                        const item = skirtItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(skirtFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(skirtFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }

                // Add other items
                if (otherItems.length > 0) {
                    const otherFolder = peFolder.folder("other");
                    for (let i = 0; i < otherItems.length; i++) {
                        const item = otherItems[i];
                        totalImagesAttempted += 2; // front + back
                        if (await addImageToZip(otherFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                        if (await addImageToZip(otherFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
                    }
                }
            }
        }

        // Process Other items
        if (otherItems.length > 0) {
            const otherFolder = zip.folder("other");

            for (let i = 0; i < otherItems.length; i++) {
                const item = otherItems[i];
                const category = item.designItem?.category?.toLowerCase() || 'unknown';
                const type = item.designItem?.type?.toLowerCase() || 'unknown';

                const categoryFolder = otherFolder.folder(category);
                const typeFolder = categoryFolder.folder(type);

                totalImagesAttempted += 2; // front + back
                if (await addImageToZip(typeFolder, item.frontImageUrl, 'front_design', i)) totalImagesAdded++;
                if (await addImageToZip(typeFolder, item.backImageUrl, 'back_design', i)) totalImagesAdded++;
            }
        }

        // Check if any images were added
        if (totalImagesAdded === 0) {
            console.warn('No images were successfully added to the ZIP file');
            console.log(`Attempted to download ${totalImagesAttempted} images, but none succeeded`);
            throw new Error(`No images could be downloaded. Attempted ${totalImagesAttempted} images but all failed. Please check the image URLs and server configuration.`);
        }

        console.log(`Successfully added ${totalImagesAdded}/${totalImagesAttempted} images to ZIP file`);

        // Generate and download ZIP file
        const content = await zip.generateAsync({type: "blob"});
        const fileName = `${delivery.name}_UniSew.zip`;
        saveAs(content, fileName);

        return true;
    } catch (error) {
        console.error('Error creating ZIP file:', error);
        throw error;
    }
};

export default function DeliveryDetailModal({visible, onCancel, delivery}) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    if (!delivery) return null;

    // Debug log to see what data we're receiving
    console.log('DeliveryDetailModal received delivery data:', delivery);

    // Create a safe delivery object with fallback values
    const safeDelivery = {
        name: delivery.name || delivery.designRequest?.name || 'Design Details',
        version: delivery.version || 1,
        submitDate: delivery.submitDate || delivery.createdAt || new Date().toISOString(),
        deliveryItems: delivery.deliveryItems || [],
        designRequest: delivery.designRequest || {},
        ...delivery
    };

    const handleDownload = async () => {
        if (isDownloading) return;

        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            console.log('Starting download for delivery:', safeDelivery.name);
            console.log('Delivery items:', safeDelivery.deliveryItems);

            // Log image URLs for debugging
            if (safeDelivery.deliveryItems) {
                safeDelivery.deliveryItems.forEach((item, index) => {
                    console.log(`Item ${index + 1}:`, {
                        frontImageUrl: item.frontImageUrl,
                        backImageUrl: item.backImageUrl,
                        type: item.designItem?.type,
                        gender: item.designItem?.gender,
                        category: item.designItem?.category
                    });
                });
            }

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 200);

            await downloadDesignAsZip(safeDelivery);

            clearInterval(progressInterval);
            setDownloadProgress(100);
            console.log('Download completed successfully');

            // Reset after success
            setTimeout(() => {
                setIsDownloading(false);
                setDownloadProgress(0);
            }, 1000);

        } catch (error) {
            console.error('Download error:', error);

            // Show user-friendly error message
            let errorMessage = 'Download failed. ';
            if (error.message.includes('No images could be downloaded')) {
                errorMessage += 'No images could be downloaded. Please check if the image URLs are accessible.';
            } else if (error.message.includes('CORS')) {
                errorMessage += 'CORS error occurred. Please check server configuration.';
            } else if (error.message.includes('fetch')) {
                errorMessage += 'Network error occurred. Please check your internet connection.';
            } else {
                errorMessage += error.message || 'Unknown error occurred.';
            }

            // You can use your notification system here
            alert(errorMessage);

            // Reset on error
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    return (
        <Dialog
            open={visible}
            onClose={onCancel}
            maxWidth="xl"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                color: 'white',
                p: 3,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    zIndex: 0
                }}/>
                <Box sx={{position: 'relative', zIndex: 1}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <FileTextOutlined style={{fontSize: '24px'}}/>
                        </Box>
                        <Box>
                            <Typography.Title level={3} style={{margin: 0, color: 'white', fontWeight: 700}}>
                                {safeDelivery.name}
                            </Typography.Title>
                            <Typography.Text style={{color: 'rgba(255,255,255,0.8)', fontSize: '14px'}}>
                                Design Details
                            </Typography.Text>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{
                display: 'flex',
                height: 'calc(90vh - 120px)',
                overflow: 'hidden'
            }}>
                {/* Left Sidebar */}
                <Box sx={{
                    width: '35%',
                    p: 3,
                    borderRight: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    overflowY: 'auto'
                }}>
                    <Typography.Title level={4} style={{margin: '0 0 24px 0', color: '#1e293b'}}>
                        Basic Information
                    </Typography.Title>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <Box sx={{
                            p: 2.5,
                            backgroundColor: 'white',
                            borderRadius: 3,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '14px'
                                }}>
                                    <FileTextOutlined/>
                                </Box>
                                <Typography.Text strong style={{fontSize: '16px'}}>Design Info</Typography.Text>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography.Text style={{color: '#64748b', fontSize: '13px'}}>Name</Typography.Text>
                                    <Typography.Text strong style={{fontSize: '14px'}}>{safeDelivery.name}</Typography.Text>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography.Text
                                        style={{color: '#64748b', fontSize: '13px'}}>Version</Typography.Text>
                                    <Typography.Text strong
                                                     style={{fontSize: '14px'}}>v{safeDelivery.version}</Typography.Text>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography.Text style={{color: '#64748b', fontSize: '13px'}}>Submit
                                        Date</Typography.Text>
                                    <Typography.Text strong style={{fontSize: '14px'}}>
                                        {formatDateTime(safeDelivery.submitDate)}
                                    </Typography.Text>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography.Text style={{color: '#64748b', fontSize: '13px'}}>Type</Typography.Text>
                                    <Tag color={safeDelivery.isRevision ? 'purple' : 'blue'} style={{margin: 0}}>
                                        {safeDelivery.isRevision ? 'Revision' : 'Normal'}
                                    </Tag>
                                </Box>
                            </Box>

                            {/* Download Design Button */}
                            <Box sx={{
                                mt: 3,
                                pt: 2,
                                borderTop: '1px solid #e2e8f0'
                            }}>
                                <Button
                                    type="primary"
                                    icon={isDownloading ? <SyncOutlined spin/> : <DownloadOutlined/>}
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        borderRadius: '6px',
                                        background: isDownloading
                                            ? 'linear-gradient(135deg, #64748b, #94a3b8)'
                                            : 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                        border: 'none',
                                        fontWeight: 600,
                                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isDownloading) {
                                            e.target.style.transform = 'translateY(-1px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(46, 125, 50, 0.3)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDownloading) {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 2px 8px rgba(46, 125, 50, 0.2)';
                                        }
                                    }}
                                >
                                    {isDownloading ? 'Downloading...' : 'Download Design'}
                                </Button>

                                {/* Progress Bar */}
                                {isDownloading && (
                                    <Box sx={{mt: 2}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 1
                                        }}>
                                            <Typography.Text style={{fontSize: '12px', color: '#64748b'}}>
                                                Progress
                                            </Typography.Text>
                                            <Typography.Text style={{fontSize: '12px', color: '#64748b'}}>
                                                {Math.round(downloadProgress)}%
                                            </Typography.Text>
                                        </Box>
                                        <Box sx={{
                                            width: '100%',
                                            height: '4px',
                                            backgroundColor: '#e2e8f0',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <Box sx={{
                                                width: `${downloadProgress}%`,
                                                height: '100%',
                                                backgroundColor: '#2e7d32',
                                                borderRadius: '2px',
                                                transition: 'width 0.3s ease'
                                            }}/>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {delivery.note && (
                            <Box sx={{
                                p: 2.5,
                                backgroundColor: 'white',
                                borderRadius: 3,
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '14px'
                                    }}>
                                        <InfoCircleOutlined/>
                                    </Box>
                                    <Typography.Text strong style={{fontSize: '16px'}}>Design Note</Typography.Text>
                                </Box>
                                <Typography.Text style={{color: '#475569', fontSize: '14px', lineHeight: 1.6}}>
                                    {delivery.note}
                                </Typography.Text>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Box sx={{
                    width: '65%',
                    p: 3,
                    overflowY: 'auto'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                        <Typography.Title level={4} style={{margin: 0, color: '#1e293b'}}>
                            Design Items
                        </Typography.Title>
                        <Tag color="blue" style={{margin: 0}}>
                            {safeDelivery.deliveryItems?.length || 0} items
                        </Tag>
                    </Box>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {(() => {
                            const boyItems = safeDelivery.deliveryItems?.sort((i1,i2) => i1.id - i2.id).filter(item =>
                                item.designItem?.gender?.toLowerCase() === 'boy'
                            ) || [];
                            const girlItems = safeDelivery.deliveryItems?.sort((i1,i2) => i1.id - i2.id).filter(item =>
                                item.designItem?.gender?.toLowerCase() === 'girl'
                            ) || [];

                            return (
                                <>
                                    {boyItems.length > 0 && (
                                        <Box sx={{mb: 3}}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 2,
                                                p: 2,
                                                backgroundColor: '#dbeafe',
                                                borderRadius: 2,
                                                border: '1px solid #93c5fd'
                                            }}>
                                                <Typography.Title level={4} style={{
                                                    margin: 0,
                                                    color: '#1e40af',
                                                    fontWeight: 700
                                                }}>
                                                    BOY
                                                </Typography.Title>
                                                <Tag color="blue"
                                                     style={{margin: 0, fontSize: '12px', fontWeight: 600}}>
                                                    {boyItems.length} cloth{boyItems.length !== 1 ? 'es' : ''}
                                                </Tag>
                                            </Box>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                {boyItems.map((item, index) => (
                                                    <Box key={index} sx={{
                                                        p: 3,
                                                        backgroundColor: 'white',
                                                        borderRadius: 4,
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                            transform: 'translateY(-2px)'
                                                        }
                                                    }}>
                                                        <Box
                                                            sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                                                            <Box sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '16px'
                                                            }}>
                                                                {getItemIcon(item.designItem?.type)}
                                                            </Box>
                                                            <Box>
                                                                <Typography.Title level={5}
                                                                                  style={{margin: 0, color: '#1e293b'}}>
                                                                    {item.designItem?.type?.charAt(0).toUpperCase() + item.designItem?.type?.slice(1)} - {formatCategory(item.designItem?.category)}
                                                                </Typography.Title>
                                                            </Box>
                                                        </Box>

                                                        <Row gutter={[24, 16]}>
                                                            <Col span={item.designItem?.logoPosition ? 8 : 12}>
                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#f8fafc',
                                                                    borderRadius: 3,
                                                                    border: '1px solid #e2e8f0'
                                                                }}>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '13px',
                                                                        color: '#475569'
                                                                    }}>
                                                                        Color
                                                                    </Typography.Text>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1.5,
                                                                    }}>
                                                                        <Box sx={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: item.designItem?.color,
                                                                            border: '2px solid #e0e0e0',
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                        }}/>
                                                                        <Typography.Text style={{fontSize: '13px'}}>
                                                                            {item.designItem?.color}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Box>
                                                            </Col>
                                                            <Col span={item.designItem?.logoPosition ? 8 : 12}>
                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#f8fafc',
                                                                    borderRadius: 3,
                                                                    border: '1px solid #e2e8f0'
                                                                }}>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '13px',
                                                                        color: '#475569'
                                                                    }}>
                                                                        Fabric
                                                                    </Typography.Text>
                                                                    <Typography.Text style={{
                                                                        fontSize: '13px',
                                                                        display: 'block',
                                                                        mt: 1
                                                                    }}>
                                                                        {item.designItem?.fabricName}
                                                                    </Typography.Text>
                                                                </Box>
                                                            </Col>
                                                            {item.designItem?.logoPosition && (
                                                                <Col span={8}>
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        backgroundColor: '#f8fafc',
                                                                        borderRadius: 3,
                                                                        border: '1px solid #e2e8f0'
                                                                    }}>
                                                                        <Typography.Text strong style={{
                                                                            fontSize: '13px',
                                                                            color: '#475569'
                                                                        }}>
                                                                            Logo Position
                                                                        </Typography.Text>
                                                                        <Typography.Text style={{
                                                                            fontSize: '13px',
                                                                            display: 'block',
                                                                            mt: 1
                                                                        }}>
                                                                            {item.designItem.logoPosition}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Col>
                                                            )}
                                                        </Row>

                                                        {item.designItem?.type?.toLowerCase().includes('shirt') && (
                                                            <>
                                                                <Divider style={{margin: '16px 0'}}>Button
                                                                    Information</Divider>

                                                                <Row gutter={[24, 16]}>
                                                                    <Col span={6}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#e0f2fe',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #81d4fa',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#0277bd'
                                                                            }}>
                                                                                Button Quantity
                                                                            </Typography.Text>
                                                                            <Typography.Text style={{
                                                                                fontSize: '16px',
                                                                                display: 'block',
                                                                                mt: 1,
                                                                                fontWeight: 700,
                                                                                color: '#0277bd'
                                                                            }}>
                                                                                {item.buttonQty || 0}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    </Col>
                                                                    <Col span={6}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#e8f5e8',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #a5d6a7',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#2e7d32'
                                                                            }}>
                                                                                Button Holes
                                                                            </Typography.Text>
                                                                            <Typography.Text style={{
                                                                                fontSize: '16px',
                                                                                display: 'block',
                                                                                mt: 1,
                                                                                fontWeight: 700,
                                                                                color: '#2e7d32'
                                                                            }}>
                                                                                {item.buttonHoleQty || 0}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    </Col>
                                                                    <Col span={6}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#fff3e0',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #ffcc02',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#ef6c00'
                                                                            }}>
                                                                                Size (cm)
                                                                            </Typography.Text>
                                                                            <Typography.Text style={{
                                                                                fontSize: '14px',
                                                                                display: 'block',
                                                                                mt: 1,
                                                                                fontWeight: 600,
                                                                                color: '#ef6c00'
                                                                            }}>
                                                                                {item.buttonHeight || 0} × {item.buttonWidth || 0}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    </Col>
                                                                    <Col span={6}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#f8fafc',
                                                                            borderRadius: 4,
                                                                            border: '2px solid #e2e8f0',
                                                                            textAlign: 'center',
                                                                            position: 'relative',
                                                                            overflow: 'hidden',
                                                                            transition: 'all 0.3s ease',
                                                                            '&:hover': {
                                                                                transform: 'translateY(-2px)',
                                                                                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                                                borderColor: '#cbd5e1'
                                                                            }
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#64748b',
                                                                                letterSpacing: '0.5px',
                                                                                fontWeight: 600,
                                                                                display: 'block',
                                                                            }}>
                                                                                Button Color
                                                                            </Typography.Text>

                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                            }}>
                                                                                {/* Color Circle */}
                                                                                <Box sx={{
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                    borderRadius: '50%',
                                                                                    backgroundColor: item.buttonColor || '#FFFFFF',
                                                                                    border: '3px solid #ffffff',
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(0,0,0,0.1)',
                                                                                    position: 'relative',
                                                                                    transition: 'all 0.3s ease',
                                                                                    '&::before': {
                                                                                        content: '""',
                                                                                        position: 'absolute',
                                                                                        top: -3,
                                                                                        left: -3,
                                                                                        right: -3,
                                                                                        bottom: -3,
                                                                                        borderRadius: '50%',
                                                                                        background: 'linear-gradient(45deg, #f1f5f9, #e2e8f0)',
                                                                                        zIndex: -1
                                                                                    }
                                                                                }}/>

                                                                                {/* Color Code */}
                                                                                <Box sx={{
                                                                                    borderRadius: 3,
                                                                                    px: 2,
                                                                                    minWidth: '80px'
                                                                                }}>
                                                                                    <Typography.Text style={{
                                                                                        fontSize: '11px',
                                                                                        fontWeight: 700,
                                                                                        color: '#475569',
                                                                                    }}>
                                                                                        {item.buttonColor.toUpperCase() || '#FFFFFF'}
                                                                                    </Typography.Text>
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Col>
                                                                </Row>

                                                                {item.buttonNote && (
                                                                    <Box sx={{
                                                                        mt: 2,
                                                                        p: 2,
                                                                        backgroundColor: '#f8f9fa',
                                                                        borderRadius: 3,
                                                                        border: '1px solid #dee2e6'
                                                                    }}>
                                                                        <Typography.Text strong style={{
                                                                            fontSize: '13px',
                                                                            color: '#495057',
                                                                            display: 'block',
                                                                            mb: 1
                                                                        }}>
                                                                            Button Note:
                                                                        </Typography.Text>
                                                                        <Typography.Text style={{
                                                                            fontSize: '12px',
                                                                            color: '#6c757d',
                                                                            fontStyle: 'italic'
                                                                        }}>
                                                                            {item.buttonNote}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                )}

                                                                <Divider style={{margin: '16px 0'}}>Logo & Attaching
                                                                    Technique</Divider>

                                                                <Box sx={{
                                                                    mt: 2,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 2
                                                                }}>

                                                                    <Row gutter={[16, 16]}>
                                                                        <Col span={12}>
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                backgroundColor: '#fef3c7',
                                                                                borderRadius: 3,
                                                                                border: '1px solid #fde68a'
                                                                            }}>
                                                                                <Typography.Text strong style={{
                                                                                    fontSize: '13px',
                                                                                    color: '#92400e'
                                                                                }}>
                                                                                    Logo Height
                                                                                </Typography.Text>
                                                                                <Typography.Text style={{
                                                                                    fontSize: '14px',
                                                                                    display: 'block',
                                                                                    mt: 1,
                                                                                    fontWeight: 600,
                                                                                    color: '#92400e'
                                                                                }}>
                                                                                    {item.baseLogoHeight || item.logoHeight || 0} cm
                                                                                </Typography.Text>
                                                                            </Box>
                                                                        </Col>
                                                                        <Col span={12}>
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                backgroundColor: '#fef3c7',
                                                                                borderRadius: 3,
                                                                                border: '1px solid #fde68a'
                                                                            }}>
                                                                                <Typography.Text strong style={{
                                                                                    fontSize: '13px',
                                                                                    color: '#92400e'
                                                                                }}>
                                                                                    Logo Width
                                                                                </Typography.Text>
                                                                                <Typography.Text style={{
                                                                                    fontSize: '14px',
                                                                                    display: 'block',
                                                                                    mt: 1,
                                                                                    fontWeight: 600,
                                                                                    color: '#92400e'
                                                                                }}>
                                                                                    {item.baseLogoWidth || item.logoWidth || 0} cm
                                                                                </Typography.Text>
                                                                            </Box>
                                                                        </Col>
                                                                    </Row>
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        backgroundColor: '#f0f9ff',
                                                                        borderRadius: 3,
                                                                        border: '1px solid #bae6fd',
                                                                        display: 'flex',
                                                                        alignItems: 'flex-start',
                                                                        gap: 1
                                                                    }}>
                                                                        <Typography.Text strong style={{
                                                                            fontSize: '16px',
                                                                            color: '#0369a1',
                                                                            fontWeight: 800
                                                                        }}>
                                                                            Technique Type:
                                                                        </Typography.Text>
                                                                        <Typography.Text style={{
                                                                            fontSize: '16px',
                                                                            display: 'block',
                                                                            fontWeight: 600,
                                                                            color: 'black'
                                                                        }}>
                                                                            {item.logoAttachingTechnique === 'embroidery' ? 'Embroidery Techniques' :
                                                                                item.logoAttachingTechnique === 'printing' ? 'Printing Techniques' :
                                                                                    item.logoAttachingTechnique === 'heatpress' ? 'Heat Press Techniques' : 'N/A'}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                    {item.logoNote && (
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#f8fafc',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #e2e8f0'
                                                                        }}>
                                                                            <Typography.Text type="secondary"
                                                                                             style={{
                                                                                                 fontSize: '12px',
                                                                                                 fontStyle: 'italic'
                                                                                             }}>
                                                                                <strong>Technique
                                                                                    Note:</strong> {item.logoNote}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </>
                                                        )}

                                                        {item.designItem?.type?.toLowerCase().includes('pants') && (
                                                            <>
                                                                <Divider style={{margin: '16px 0'}}>Zipper
                                                                    Information</Divider>

                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: item.zipper ? '#f0fdf4' : '#fef2f2',
                                                                    borderRadius: 3,
                                                                    border: item.zipper ? '1px solid #bbf7d0' : '1px solid #fca5a5',
                                                                    textAlign: 'center',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: 2
                                                                }}>
                                                                    <Box sx={{
                                                                        width: 12,
                                                                        height: 12,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: item.zipper ? '#22c55e' : '#ef4444',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        {item.zipper ? (
                                                                            <CheckCircleOutlined style={{
                                                                                color: 'white',
                                                                                fontSize: '8px'
                                                                            }}/>
                                                                        ) : (
                                                                            <CloseCircleOutlined style={{
                                                                                color: 'white',
                                                                                fontSize: '8px'
                                                                            }}/>
                                                                        )}
                                                                    </Box>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '14px',
                                                                        color: item.zipper ? '#166534' : '#991b1b',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        {item.zipper ? 'Has Zipper' : 'No Zipper'}
                                                                    </Typography.Text>
                                                                </Box>
                                                            </>
                                                        )}

                                                        <Row gutter={[24, 16]} style={{marginTop: 16}}>
                                                            <Col span={12}>
                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#f0fdf4',
                                                                    borderRadius: 3,
                                                                    border: '1px solid #bbf7d0',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '13px',
                                                                        color: '#166534',
                                                                        display: 'block',
                                                                        mb: 1
                                                                    }}>
                                                                        Front Design
                                                                    </Typography.Text>
                                                                    <DisplayImage
                                                                        imageUrl={item.frontImageUrl}
                                                                        alt="Front Design"
                                                                        width="100%"
                                                                        height="200px"
                                                                        style={{borderRadius: 8, objectFit: 'cover'}}
                                                                    />
                                                                </Box>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#fef2f2',
                                                                    borderRadius: 3,
                                                                    border: '1px solid #fca5a5',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '13px',
                                                                        color: '#991b1b',
                                                                        display: 'block',
                                                                        mb: 1
                                                                    }}>
                                                                        Back Design
                                                                    </Typography.Text>
                                                                    <DisplayImage
                                                                        imageUrl={item.backImageUrl}
                                                                        alt="Back Design"
                                                                        width="100%"
                                                                        height="200px"
                                                                        style={{borderRadius: 8, objectFit: 'cover'}}
                                                                    />
                                                                </Box>
                                                            </Col>
                                                        </Row>

                                                        {item.designItem?.note && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                backgroundColor: '#f8fafc',
                                                                borderRadius: 3,
                                                                border: '1px solid #e2e8f0'
                                                            }}>
                                                                <Typography.Text type="secondary"
                                                                                 style={{
                                                                                     fontSize: '12px',
                                                                                     fontStyle: 'italic'
                                                                                 }}>
                                                                    <strong>Note:</strong> {item.designItem.note}
                                                                </Typography.Text>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {girlItems.length > 0 && (
                                        <Box sx={{mb: 3}}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 2,
                                                p: 2,
                                                backgroundColor: '#fce7f3',
                                                borderRadius: 2,
                                                border: '1px solid #f9a8d4'
                                            }}>
                                                <Typography.Title level={4} style={{
                                                    margin: 0,
                                                    color: '#be185d',
                                                    fontWeight: 700
                                                }}>
                                                    GIRL
                                                </Typography.Title>
                                                <Tag color="magenta"
                                                     style={{margin: 0, fontSize: '12px', fontWeight: 600}}>
                                                    {girlItems.length} cloth{girlItems.length !== 1 ? 'es' : ''}
                                                </Tag>
                                            </Box>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                {girlItems.map((item, index) => (
                                                    <Box key={`girl-${index}`} sx={{
                                                        p: 3,
                                                        backgroundColor: 'white',
                                                        borderRadius: 4,
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                            transform: 'translateY(-2px)'
                                                        }
                                                    }}>
                                                        <Box
                                                            sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                                                            <Box sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '16px'
                                                            }}>
                                                                {getItemIcon(item.designItem?.type)}
                                                            </Box>
                                                            <Box>
                                                                <Typography.Title level={5}
                                                                                  style={{margin: 0, color: '#1e293b'}}>
                                                                    {item.designItem?.type?.charAt(0).toUpperCase() + item.designItem?.type?.slice(1)} - {formatCategory(item.designItem?.category)}
                                                                </Typography.Title>
                                                            </Box>
                                                        </Box>

                                                        <Row gutter={[24, 16]}>
                                                            <Col span={item.designItem?.logoPosition ? 8 : 12}>
                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#f8fafc',
                                                                    borderRadius: 3,
                                                                    border: '1px solid #e2e8f0'
                                                                }}>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '13px',
                                                                        color: '#475569'
                                                                    }}>
                                                                        Color
                                                                    </Typography.Text>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 1.5,
                                                                    }}>
                                                                        <Box sx={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: item.designItem?.color,
                                                                            border: '2px solid #e0e0e0',
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                        }}/>
                                                                        <Typography.Text style={{fontSize: '13px'}}>
                                                                            {item.designItem?.color}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Box>
                                                            </Col>
                                                            <Col span={item.designItem?.logoPosition ? 8 : 12}>
                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#f8fafc',
                                                                    borderRadius: 3,
                                                                    border: '1px solid #e2e8f0'
                                                                }}>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '13px',
                                                                        color: '#475569'
                                                                    }}>
                                                                        Fabric
                                                                    </Typography.Text>
                                                                    <Typography.Text style={{
                                                                        fontSize: '13px',
                                                                        display: 'block',
                                                                        mt: 1
                                                                    }}>
                                                                        {item.designItem?.fabricName}
                                                                    </Typography.Text>
                                                                </Box>
                                                            </Col>
                                                            {item.designItem?.logoPosition && (
                                                                <Col span={8}>
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        backgroundColor: '#f8fafc',
                                                                        borderRadius: 3,
                                                                        border: '1px solid #e2e8f0'
                                                                    }}>
                                                                        <Typography.Text strong style={{
                                                                            fontSize: '13px',
                                                                            color: '#475569'
                                                                        }}>
                                                                            Logo Position
                                                                        </Typography.Text>
                                                                        <Typography.Text style={{
                                                                            fontSize: '13px',
                                                                            display: 'block',
                                                                            mt: 1
                                                                        }}>
                                                                            {item.designItem?.logoPosition}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Col>
                                                            )}
                                                        </Row>

                                                        {item.designItem?.type?.toLowerCase().includes('shirt') && (
                                                            <>
                                                                <Divider style={{margin: '16px 0'}}>Button Information</Divider>

                                                                <Row gutter={[24, 16]}>
                                                                    <Col span={6}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#e0f2fe',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #81d4fa',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#0277bd'
                                                                            }}>
                                                                                Button Quantity
                                                                            </Typography.Text>
                                                                            <Typography.Text style={{
                                                                                fontSize: '16px',
                                                                                display: 'block',
                                                                                mt: 1,
                                                                                fontWeight: 700,
                                                                                color: '#0277bd'
                                                                            }}>
                                                                                {item.buttonQty || 0}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    </Col>
                                                                    <Col span={6}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#e8f5e8',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #a5d6a7',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#2e7d32'
                                                                            }}>
                                                                                Button Holes
                                                                            </Typography.Text>
                                                                            <Typography.Text style={{
                                                                                fontSize: '16px',
                                                                                display: 'block',
                                                                                mt: 1,
                                                                                fontWeight: 700,
                                                                                color: '#2e7d32'
                                                                            }}>
                                                                                {item.buttonHoleQty || 0}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    </Col>
                                                                    <Col span={6}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#fff3e0',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #ffcc02',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#ef6c00'
                                                                            }}>
                                                                                Size (cm)
                                                                            </Typography.Text>
                                                                            <Typography.Text style={{
                                                                                fontSize: '14px',
                                                                                display: 'block',
                                                                                mt: 1,
                                                                                fontWeight: 600,
                                                                                color: '#ef6c00'
                                                                            }}>
                                                                                {item.buttonHeight || 0} × {item.buttonWidth || 0}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    </Col>
                                                                    <Col span={6}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#f8fafc',
                                                                            borderRadius: 4,
                                                                            border: '2px solid #e2e8f0',
                                                                            textAlign: 'center',
                                                                            position: 'relative',
                                                                            overflow: 'hidden',
                                                                            transition: 'all 0.3s ease',
                                                                            '&:hover': {
                                                                                transform: 'translateY(-2px)',
                                                                                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                                                                borderColor: '#cbd5e1'
                                                                            }
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#64748b',
                                                                                letterSpacing: '0.5px',
                                                                                fontWeight: 600,
                                                                                display: 'block',
                                                                            }}>
                                                                                Button Color
                                                                            </Typography.Text>

                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                            }}>
                                                                                {/* Color Circle */}
                                                                                <Box sx={{
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                    borderRadius: '50%',
                                                                                    backgroundColor: item.buttonColor || '#FFFFFF',
                                                                                    border: '3px solid #ffffff',
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 3px rgba(0,0,0,0.1)',
                                                                                    position: 'relative',
                                                                                    transition: 'all 0.3s ease',
                                                                                    '&::before': {
                                                                                        content: '""',
                                                                                        position: 'absolute',
                                                                                        top: -3,
                                                                                        left: -3,
                                                                                        right: -3,
                                                                                        bottom: -3,
                                                                                        borderRadius: '50%',
                                                                                        background: 'linear-gradient(45deg, #f1f5f9, #e2e8f0)',
                                                                                        zIndex: -1
                                                                                    }
                                                                                }}/>

                                                                                {/* Color Code */}
                                                                                <Box sx={{
                                                                                    borderRadius: 3,
                                                                                    px: 2,
                                                                                    minWidth: '80px'
                                                                                }}>
                                                                                    <Typography.Text style={{
                                                                                        fontSize: '11px',
                                                                                        fontWeight: 700,
                                                                                        color: '#475569',
                                                                                    }}>
                                                                                        {item.buttonColor.toUpperCase() || '#FFFFFF'}
                                                                                    </Typography.Text>
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </Col>
                                                                </Row>

                                                                {item.buttonNote && (
                                                                    <Box sx={{
                                                                        mt: 2,
                                                                        p: 2,
                                                                        backgroundColor: '#f8f9fa',
                                                                        borderRadius: 3,
                                                                        border: '1px solid #dee2e6'
                                                                    }}>
                                                                        <Typography.Text strong style={{
                                                                            fontSize: '13px',
                                                                            color: '#495057',
                                                                            display: 'block',
                                                                            mb: 1
                                                                        }}>
                                                                            Button Note:
                                                                        </Typography.Text>
                                                                        <Typography.Text style={{
                                                                            fontSize: '12px',
                                                                            color: '#6c757d',
                                                                            fontStyle: 'italic'
                                                                        }}>
                                                                            {item.buttonNote}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                )}

                                                                <Divider style={{margin: '16px 0'}}>Logo & Attaching Technique</Divider>

                                                                <Box sx={{
                                                                    mt: 2,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 2
                                                                }}>
                                                                    <Row gutter={[16, 16]}>
                                                                        <Col span={12}>
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                backgroundColor: '#fef3c7',
                                                                                borderRadius: 3,
                                                                                border: '1px solid #fde68a'
                                                                            }}>
                                                                                <Typography.Text strong style={{
                                                                                    fontSize: '13px',
                                                                                    color: '#92400e'
                                                                                }}>
                                                                                    Logo Height
                                                                                </Typography.Text>
                                                                                <Typography.Text style={{
                                                                                    fontSize: '14px',
                                                                                    display: 'block',
                                                                                    mt: 1,
                                                                                    fontWeight: 600,
                                                                                    color: '#92400e'
                                                                                }}>
                                                                                    {item.baseLogoHeight || item.logoHeight || 0} cm
                                                                                </Typography.Text>
                                                                            </Box>
                                                                        </Col>
                                                                        <Col span={12}>
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                backgroundColor: '#fef3c7',
                                                                                borderRadius: 3,
                                                                                border: '1px solid #fde68a'
                                                                            }}>
                                                                                <Typography.Text strong style={{
                                                                                    fontSize: '13px',
                                                                                    color: '#92400e'
                                                                                }}>
                                                                                    Logo Width
                                                                                </Typography.Text>
                                                                                <Typography.Text style={{
                                                                                    fontSize: '14px',
                                                                                    display: 'block',
                                                                                    mt: 1,
                                                                                    fontWeight: 600,
                                                                                    color: '#92400e'
                                                                                }}>
                                                                                    {item.baseLogoWidth || item.logoWidth || 0} cm
                                                                                </Typography.Text>
                                                                            </Box>
                                                                        </Col>
                                                                    </Row>
                                                                    <Box sx={{
                                                                        p: 2,
                                                                        backgroundColor: '#f0f9ff',
                                                                        borderRadius: 3,
                                                                        border: '1px solid #bae6fd'
                                                                    }}>
                                                                        <Typography.Text strong style={{
                                                                            fontSize: '13px',
                                                                            color: '#0369a1'
                                                                        }}>
                                                                            Technique Type
                                                                        </Typography.Text>
                                                                        <Typography.Text style={{
                                                                            fontSize: '14px',
                                                                            display: 'block',
                                                                            mt: 1,
                                                                            fontWeight: 600,
                                                                            color: '#0369a1'
                                                                        }}>
                                                                            {item.logoAttachingTechnique === 'embroidery' ? 'Embroidery Techniques' :
                                                                                item.logoAttachingTechnique === 'printing' ? 'Printing Techniques' :
                                                                                    item.logoAttachingTechnique === 'heatpress' ? 'Heat Press Techniques' : 'N/A'}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                    {item.logoNote && (
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            backgroundColor: '#f8fafc',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #e2e8f0'
                                                                        }}>
                                                                            <Typography.Text type="secondary"
                                                                                             style={{
                                                                                                 fontSize: '12px',
                                                                                                 fontStyle: 'italic'
                                                                                             }}>
                                                                                <strong>Technique
                                                                                    Note:</strong> {item.logoNote}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </>
                                                        )}

                                                        {item.designItem?.type?.toLowerCase().includes('pants') && (
                                                            <>
                                                                <Divider style={{margin: '16px 0'}}>Zipper Information</Divider>

                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: item.zipper ? '#f0fdf4' : '#fef2f2',
                                                                    borderRadius: 3,
                                                                    border: item.zipper ? '1px solid #bbf7d0' : '1px solid #fca5a5',
                                                                    textAlign: 'center',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: 2
                                                                }}>
                                                                    <Box sx={{
                                                                        width: 12,
                                                                        height: 12,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: item.zipper ? '#22c55e' : '#ef4444',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        {item.zipper ? (
                                                                            <CheckCircleOutlined style={{color: 'white', fontSize: '8px'}} />
                                                                        ) : (
                                                                            <CloseCircleOutlined style={{color: 'white', fontSize: '8px'}} />
                                                                        )}
                                                                    </Box>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '14px',
                                                                        color: item.zipper ? '#166534' : '#991b1b',
                                                                        fontWeight: 600
                                                                    }}>
                                                                        {item.zipper ? 'Has Zipper' : 'No Zipper'}
                                                                    </Typography.Text>
                                                                </Box>
                                                            </>
                                                        )}

                                                        <Row gutter={[24, 16]} style={{marginTop: 16}}>
                                                            <Col span={12}>
                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#f0fdf4',
                                                                    borderRadius: 3,
                                                                    border: '1px solid #bbf7d0',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '13px',
                                                                        color: '#166534',
                                                                        display: 'block',
                                                                        mb: 1
                                                                    }}>
                                                                        Front Design
                                                                    </Typography.Text>
                                                                    <DisplayImage
                                                                        imageUrl={item.frontImageUrl}
                                                                        alt="Front Design"
                                                                        width="100%"
                                                                        height="200px"
                                                                        style={{borderRadius: 8, objectFit: 'cover'}}
                                                                    />
                                                                </Box>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Box sx={{
                                                                    p: 2,
                                                                    backgroundColor: '#fef2f2',
                                                                    borderRadius: 3,
                                                                    border: '1px solid #fca5a5',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    <Typography.Text strong style={{
                                                                        fontSize: '13px',
                                                                        color: '#991b1b',
                                                                        display: 'block',
                                                                        mb: 1
                                                                    }}>
                                                                        Back Design
                                                                    </Typography.Text>
                                                                    <DisplayImage
                                                                        imageUrl={item.backImageUrl}
                                                                        alt="Back Design"
                                                                        width="100%"
                                                                        height="200px"
                                                                        style={{borderRadius: 8, objectFit: 'cover'}}
                                                                    />
                                                                </Box>
                                                            </Col>
                                                        </Row>

                                                        {item.designItem?.note && (
                                                            <Box sx={{
                                                                mt: 2,
                                                                p: 2,
                                                                backgroundColor: '#f8fafc',
                                                                borderRadius: 3,
                                                                border: '1px solid #e2e8f0'
                                                            }}>
                                                                <Typography.Text type="secondary"
                                                                                 style={{
                                                                                     fontSize: '12px',
                                                                                     fontStyle: 'italic'
                                                                                 }}>
                                                                    <strong>Note:</strong> {item.designItem.note}
                                                                </Typography.Text>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </>
                            );
                        })()}
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                p: 2,
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <Button
                    onClick={onCancel}
                    style={{
                        borderRadius: 8,
                        height: '40px',
                        padding: '0 24px',
                        fontWeight: 600
                    }}
                >
                    Close
                </Button>
            </Box>
        </Dialog>
    );
}