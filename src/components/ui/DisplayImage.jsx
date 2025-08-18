import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Dialog, DialogContent, IconButton as MuiIconButton } from '@mui/material';
import { Spin } from 'antd';
import { LoadingOutlined, ZoomInOutlined } from '@ant-design/icons';
import { Close as CloseIcon } from '@mui/icons-material';

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
                    referrerPolicy="no-referrer"
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

            {/* Dialog for Full Size Image */}
                            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(0, 0, 0, 0.95)',
                        borderRadius: 2,
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        margin: 2
                    }
                }}
                sx={{
                    '& .MuiDialog-paper': {
                        margin: 0
                    }
                }}
            >
                <DialogContent sx={{ 
                    p: 0, 
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px'
                }}>
                    <MuiIconButton
                        onClick={() => setIsModalOpen(false)}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'white',
                            zIndex: 1,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </MuiIconButton>
                    
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        p: 3
                    }}>
                        <img
                            src={imageUrl}
                            alt={alt}
                            referrerPolicy="no-referrer"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                display: 'block'
                            }}
                            onLoad={() => {}}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                // Show error message
                                const errorDiv = document.createElement('div');
                                errorDiv.innerHTML = `
                                    <div style="color: white; text-align: center; padding: 20px;">
                                        <h3>Failed to load image</h3>
                                        <p>URL: ${imageUrl}</p>
                                        <p>Please check if the URL is valid and accessible.</p>
                                    </div>
                                `;
                                e.target.parentNode.appendChild(errorDiv);
                            }}
                        />
                        <Box sx={{
                            color: 'white',
                            textAlign: 'center',
                            fontSize: '0.875rem',
                            opacity: 0.7
                        }}>
                            <div>Image URL: {imageUrl}</div>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}