import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Modal, Spin } from 'antd';
import { LoadingOutlined, ZoomInOutlined } from '@ant-design/icons';

export default function DisplayImage({ 
    imageUrl, 
    height = 'auto', 
    width = 'auto', 
    alt = "Display Image"
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
    };



    const handleImageClick = () => {
        if (!isLoading && !hasError) {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <Box sx={{ 
                position: 'relative', 
                display: 'inline-block',
                width: width,
                height: height,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
            }}>
                {/* Loading Spinner */}
                {isLoading && (
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                    }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </Box>
                )}

                {/* Error State */}
                {hasError && (
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1,
                        textAlign: 'center',
                        color: '#999'
                    }}>
                        <div>Failed to load image</div>
                    </Box>
                )}

                {/* Image */}
                <img 
                    src={imageUrl} 
                    alt={alt}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: isLoading || hasError ? 'none' : 'block',
                        cursor: !isLoading && !hasError ? 'pointer' : 'default'
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    onClick={handleImageClick}
                />
            </Box>

            {/* Modal for Full Size Image */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                width={600}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    <img 
                        src={imageUrl} 
                        alt={alt}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            </Modal>
        </>
    );
}