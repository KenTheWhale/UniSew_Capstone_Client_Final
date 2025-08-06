import React, { useState } from 'react';
import { Button, Modal, Space, Spin, Tag, Typography, Card, Row, Col, Avatar, Divider } from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    SyncOutlined,
    UserOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    EditOutlined,
    PictureOutlined,
    BankOutlined,
    GiftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { parseID } from "../../../utils/ParseIDUtil.jsx";
import { Box, Chip } from '@mui/material';
import { PiShirtFoldedFill, PiPantsFill } from "react-icons/pi";
import { GiSkirt } from "react-icons/gi";

// eslint-disable-next-line react-refresh/only-export-components
export function statusTag(status) {
    let color = '';
    let icon = null;
    switch (status) {
        case 'created':
            color = 'blue';
            icon = <FileTextOutlined />;
            break;
        case 'paid':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
        case 'unpaid':
            color = 'orange';
            icon = <CloseCircleOutlined />;
            break;
        case 'progressing':
            color = 'purple';
            icon = <SyncOutlined />;
            break;
        case 'completed':
            color = 'cyan';
            icon = <CheckCircleOutlined />;
            break;
        case 'rejected':
            color = 'red';
            icon = <CloseCircleOutlined />;
            break;
        case 'pending':
            color = 'processing';
            icon = <ClockCircleOutlined />;
            break;
        default:
            color = 'default';
            break;
    }
    return <Tag color={color}>{icon} {status}</Tag>;
}

// Function to get appropriate icon based on item type
const getItemIcon = (itemType) => {
    const type = itemType?.toLowerCase() || '';
    
    if (type.includes('shirt') || type.includes('áo')) {
        return <PiShirtFoldedFill style={{fontSize: '20px'}}/>;
    } else if (type.includes('pant') || type.includes('quần')) {
        return <PiPantsFill style={{fontSize: '20px'}}/>;
    } else if (type.includes('skirt') || type.includes('váy')) {
        return <GiSkirt style={{fontSize: '20px'}}/>;
    } else {
        return <FileTextOutlined />;
    }
};

export default function RequestDetailPopup({ visible, onCancel, request }) {
    const [selectedImage, setSelectedImage] = useState(null);
    
    if (!request) {
        return (
            <Modal open={visible} onCancel={onCancel} footer={null} centered>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <Spin size="large" tip="Loading request details..." />
                </Box>
            </Modal>
        );
    }

    const { Text, Title } = Typography;

    const getFooterButtons = (status) => {
        let buttonText = '';
        let buttonAction;

        switch (status) {
            case 'created':
                buttonText = 'Submit design request';
                buttonAction = onCancel;
                break;
            case 'completed':
                buttonText = 'Create Order';
                buttonAction = onCancel;
                break;
            case 'unpaid':
                buttonText = 'Make Payment';
                buttonAction = onCancel;
                break;
            case 'pending':
                buttonText = 'Chat with designer';
                buttonAction = () => {
                    localStorage.setItem('currentDesignRequest', JSON.stringify(request));
                    onCancel();
                    window.location.href = '/school/chat';
                };
                break;
            case 'progressing':
                buttonText = 'View request progress';
                buttonAction = onCancel;
                break;
            case 'rejected':
                return null;
            default:
                return null;
        }

        return [
            <Button key="action" type="primary" onClick={buttonAction}>
                {buttonText}
            </Button>,
        ];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + ' VND';
    };

    return (
        <>
            <Modal
                title={
                    <Space>
                        <InfoCircleOutlined style={{ color: '#1976d2' }} />
                        <span style={{ fontWeight: 600 }}>
                            Design Request Details: {parseID(request.id, 'dr')}
                        </span>
                    </Space>
                }
                open={visible}
                onCancel={onCancel}
                centered
                width={900}
                footer={getFooterButtons(request.status)}
                styles={{
                    body: { padding: '24px' },
                    header: { borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Header Information */}
                    <Card 
                        size="small" 
                        style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <Row gutter={[16, 16]} align="middle">
                            <Col span={8}>
                                <Space direction="vertical" size="small">
                                    <Space>
                                        <BankOutlined />
                                        <Text style={{ color: 'white', fontWeight: 600 }}>
                                            {request.school}
                                        </Text>
                                    </Space>
                                    <Space>
                                        <UserOutlined />
                                        <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            {request.schoolAdmin}
                                        </Text>
                                    </Space>
                                </Space>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <Space direction="vertical" size="small">
                                    <Title level={4} style={{ color: 'white', margin: 0 }}>
                                        {request.name}
                                    </Title>
                                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {request.pkgName} Package
                                    </Text>
                                </Space>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <Space direction="vertical" size="small">
                                    {statusTag(request.status)}
                                    <Space>
                                        <CalendarOutlined />
                                        <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            {formatDate(request.creationDate)}
                                        </Text>
                                    </Space>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {/* Package Information */}
                    <Card title={
                        <Space>
                            <GiftOutlined style={{ color: '#1976d2' }} />
                            <span>Package Information</span>
                        </Space>
                    } size="small">
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Space direction="vertical" size="small">
                                    <Text strong>Package Name:</Text>
                                    <Text>{request.pkgName}</Text>
                                </Space>
                            </Col>
                            <Col span={8}>
                                <Space direction="vertical" size="small">
                                    <Text strong>Fee:</Text>
                                    <Text style={{ color: '#1976d2', fontWeight: 600 }}>
                                        {formatCurrency(request.pkgFee)}
                                    </Text>
                                </Space>
                            </Col>
                            <Col span={8}>
                                <Space direction="vertical" size="small">
                                    <Text strong>Delivery Time:</Text>
                                    <Text>{request.pkgDeliveryWithin} days</Text>
                                </Space>
                            </Col>
                        </Row>
                        {request.pkgHeaderContent && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                                <Text style={{ color: '#856404' }}>
                                    <strong>Special Offer:</strong> {request.pkgHeaderContent}
                                </Text>
                            </Box>
                        )}
                    </Card>

                    {/* Logo Design */}
                    {request.logoImage && (
                        <Card title={
                            <Space>
                                <PictureOutlined style={{ color: '#1976d2' }} />
                                <span>Logo Design</span>
                            </Space>
                        } size="small">
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <img 
                                    src={request.logoImage} 
                                    alt="Logo Design"
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        objectFit: 'contain',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedImage(request.logoImage)}
                                />
                            </Box>
                        </Card>
                    )}

                    {/* Uniform Items */}
                    <Card title={
                        <Space>
                            <FileTextOutlined style={{ color: '#1976d2' }} />
                            <span>Uniform Items ({request.listItemDesign?.length || 0})</span>
                        </Space>
                    } size="small">
                        <Row gutter={[16, 16]}>
                            {request.listItemDesign?.map((item, index) => (
                                <Col span={12} key={index}>
                                    <Card 
                                        size="small" 
                                        style={{ 
                                            border: '1px solid #e0e0e0',
                                            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
                                        }}
                                    >
                                        <Row gutter={[8, 8]} align="middle">
                                            <Col span={4}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'center',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    bgcolor: '#e3f2fd'
                                                }}>
                                                    {getItemIcon(item.itemType)}
                                                </Box>
                                            </Col>
                                            <Col span={20}>
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Text strong style={{ fontSize: '14px' }}>
                                                        {item.itemType} - {item.gender}
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {item.itemCategory}
                                                    </Text>
                                                    <Space size="small">
                                                        <Box sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            bgcolor: item.color,
                                                            border: '1px solid #e0e0e0'
                                                        }} />
                                                        <Text style={{ fontSize: '12px' }}>
                                                            {item.color}
                                                        </Text>
                                                    </Space>
                                                    {item.logoPosition && (
                                                        <Text style={{ fontSize: '12px' }}>
                                                            Logo: {item.logoPosition}
                                                        </Text>
                                                    )}
                                                    {item.note && (
                                                        <Text style={{ fontSize: '12px', fontStyle: 'italic' }}>
                                                            Note: {item.note}
                                                        </Text>
                                                    )}
                                                </Space>
                                            </Col>
                                        </Row>
                                        
                                        {/* Item Images */}
                                        {item.images && item.images.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Text style={{ fontSize: '12px', fontWeight: 600, mb: 1, display: 'block' }}>
                                                    Reference Images:
                                                </Text>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {item.images.map((image, imgIndex) => (
                                                        <img
                                                            key={imgIndex}
                                                            src={image.url}
                                                            alt={`Reference ${imgIndex + 1}`}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                border: '1px solid #e0e0e0',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => setSelectedImage(image.url)}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>

                    {/* Additional Information */}
                    <Card title={
                        <Space>
                            <InfoCircleOutlined style={{ color: '#1976d2' }} />
                            <span>Additional Information</span>
                        </Space>
                    } size="small">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Space direction="vertical" size="small">
                                    <Text strong>Revision Limit:</Text>
                                    <Text>
                                        {request.pkgRevisionTime === 9999 ? 'Unlimited' : request.pkgRevisionTime} revisions
                                    </Text>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical" size="small">
                                    <Text strong>Privacy:</Text>
                                    <Text>
                                        {request.privacy ? 'Private' : 'Public'}
                                    </Text>
                                </Space>
                            </Col>
                        </Row>
                        {request.feedback && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                <Text style={{ fontStyle: 'italic' }}>
                                    <strong>Feedback:</strong> {request.feedback}
                                </Text>
                            </Box>
                        )}
                    </Card>
                </Box>
            </Modal>

            {/* Image Preview Modal */}
            <Modal
                open={!!selectedImage}
                onCancel={() => setSelectedImage(null)}
                footer={null}
                centered
                width={600}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    <img 
                        src={selectedImage} 
                        alt="Preview"
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