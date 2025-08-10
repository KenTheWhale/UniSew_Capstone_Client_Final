import React, {useEffect, useState} from 'react';
import {Avatar, Button, Card, Col, Divider, Form, Input, Radio, Row, Select, Space, Tag, Typography} from 'antd';
import {
    BankOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    EditOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    MessageOutlined,
    PhoneOutlined,
    PictureOutlined,
    SendOutlined,
    ShopOutlined,
    SmileOutlined,
    UploadOutlined,
    UserOutlined
} from '@ant-design/icons';
import {Box, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Paper} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import {useSnackbar} from 'notistack';
import {parseID} from '../../utils/ParseIDUtil.jsx';
import {addDoc, collection, onSnapshot, query, serverTimestamp, where} from 'firebase/firestore';
import {auth, db} from "../../configs/FirebaseConfig.jsx";
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DisplayImage from '../ui/DisplayImage.jsx';
import {
    createDesignDelivery,
    getDesignDeliveries,
    getDesignRequestDetailForDesigner,
    getUndoneRevisionRequests
} from "../../services/DesignService.jsx";
import {uploadCloudinary} from "../../services/UploadImageService.jsx";

const {TextArea} = Input;

// eslint-disable-next-line react-refresh/only-export-components
export function statusTag(status) {
    let color;
    let icon = null;
    switch (status) {
        case 'created':
            color = 'blue';
            icon = <FileTextOutlined/>;
            break;
        case 'paid':
            color = 'green';
            icon = <CheckCircleOutlined/>;
            break;
        case 'unpaid':
            color = 'orange';
            icon = <CloseCircleOutlined/>;
            break;
        case 'progressing':
            color = 'purple';
            icon = <SyncOutlined/>;
            break;
        case 'completed':
            color = 'cyan';
            icon = <CheckCircleOutlined/>;
            break;
        case 'rejected':
            color = 'red';
            icon = <CloseCircleOutlined/>;
            break;
        case 'pending':
            color = 'processing';
            icon = <ClockCircleOutlined/>;
            break;
        case 'selected':
            color = 'green';
            icon = <CheckCircleOutlined/>;
            break;
        default:
            color = 'default';
            break;
    }
    return <Tag style={{margin: 0}} color={color}>{icon} {status}</Tag>;
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
        return <FileTextOutlined/>;
    }
};

function DesignDetailDialog({visible, onCancel, request}) {
    if (!request) {
        return (
            <Dialog open={visible} onClose={onCancel} maxWidth="md" fullWidth>
                <DialogContent>
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4}}>
                        <Typography.Text>Loading request details...</Typography.Text>
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    const {Text, Title} = Typography;

    const getFooterButtons = (status) => {
        let buttonText = '';
        let buttonAction;

        switch (status) {
            case 'paid':
                buttonText = 'Continue Working';
                buttonAction = onCancel;
                break;
            case 'progressing':
                buttonText = 'Continue Working';
                buttonAction = onCancel;
                break;
            case 'completed':
                buttonText = 'View Final Design';
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
        return amount.toLocaleString("vi-VN");
    };
    return (
        <>
            <Dialog
                open={visible}
                onClose={onCancel}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            maxHeight: '85vh'
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <InfoCircleOutlined style={{color: 'white', fontSize: '18px'}}/>
                    <span style={{fontWeight: 600, fontSize: '16px'}}>
                        Design Request: {parseID(request.id, 'dr')}
                    </span>
                </DialogTitle>
                <DialogContent sx={{padding: '20px', overflowY: 'auto'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                        {/* Compact Header */}
                        <Card
                            size="small"
                            style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8
                            }}
                        >
                            <Row gutter={[16, 8]} align="middle">
                                <Col span={8}>
                                    <Space direction="vertical" size="small">
                                        <Text style={{fontWeight: 600, fontSize: '16px', color: '#1e293b'}}>
                                            {request.name}
                                        </Text>
                                        <Text style={{color: '#64748b', fontSize: '12px'}}>
                                            Working: {formatDate(request.creationDate)}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{textAlign: 'center'}}>
                                    <Space direction="vertical" size="small">
                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                            Design Request
                                        </Text>
                                        <Text style={{fontSize: '10px', color: '#94a3b8'}}>
                                            Project Information
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={8} style={{display: 'flex', justifyContent: 'flex-end', textAlign: 'right'}}>
                                    <Space direction="vertical" size="small">
                                        {statusTag(request.status)}
                                        <Text style={{color: '#64748b', fontSize: '12px'}}>
                                            Privacy: {request.privacy ? 'Private' : 'Public'}
                                        </Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>

                        {/* Main Content - Two Columns */}
                        <Row gutter={[16, 16]}>
                            {/* Left Column - School & Quotation */}
                            <Col span={12}>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                                    {/* School Info */}
                                    <Card
                                        title={
                                            <Space>
                                                <BankOutlined style={{color: '#1976d2'}}/>
                                                <span style={{
                                                    fontWeight: 600,
                                                    fontSize: '14px'
                                                }}>School Information</span>
                                            </Space>
                                        }
                                        size="small"
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8
                                        }}
                                    >
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                            <Avatar
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    backgroundColor: '#1976d2',
                                                    fontSize: '18px',
                                                    fontWeight: 600
                                                }}
                                                src={request.school?.avatar}
                                                slotProps={{
                                                    img: {
                                                        referrerPolicy: 'no-referrer'
                                                    }
                                                }}
                                            />
                                            <Box sx={{flex: 1}}>
                                                <Text style={{fontWeight: 600, fontSize: '14px', color: '#1e293b'}}>
                                                    {request.school?.business || 'School Name'}
                                                </Text>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5}}>
                                                    <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                        School Client
                                                    </Text>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Row gutter={[8, 8]}>
                                            <Col span={12}>
                                                <Space direction="vertical" size="small">
                                                    <Space>
                                                        <ShopOutlined style={{color: '#1976d2', fontSize: '12px'}}/>
                                                        <Text style={{fontSize: '12px'}}>
                                                            {request.school?.name || 'School Institution'}
                                                        </Text>
                                                    </Space>
                                                    <Space>
                                                        <PhoneOutlined style={{color: '#1976d2', fontSize: '12px'}}/>
                                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                            Contact: {request.school?.phone || 'Available'}
                                                        </Text>
                                                    </Space>
                                                </Space>
                                            </Col>
                                            <Col span={12}>
                                                <Space direction="vertical" size="small">
                                                    <Space>
                                                        <EnvironmentOutlined
                                                            style={{color: '#64748b', fontSize: '12px'}}/>
                                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                            Location: {request.school?.address || 'Available'}
                                                        </Text>
                                                    </Space>
                                                    <Space></Space>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* Quotation Summary */}
                                    {request.finalDesignQuotation && request.price && (
                                        <Card
                                            title={
                                                <Space>
                                                    <DollarOutlined style={{color: '#1976d2'}}/>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        fontSize: '14px'
                                                    }}>Your Quotation</span>
                                                </Space>
                                            }
                                            size="small"
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8
                                            }}
                                        >
                                            <Row gutter={[8, 8]} style={{display: 'flex'}}>
                                                <Col span={8} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: '#f0fdf4',
                                                        borderRadius: 6,
                                                        border: '1px solid #bbf7d0',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#166534',
                                                            fontWeight: 600
                                                        }}>
                                                            PRICE (VND)
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#166534',
                                                            fontWeight: 700
                                                        }}>
                                                            {formatCurrency(request.price || 0)}
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={8} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: '#fef3c7',
                                                        borderRadius: 6,
                                                        border: '1px solid #fde68a',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#92400e',
                                                            fontWeight: 600
                                                        }}>
                                                            DELIVERY
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#92400e',
                                                            fontWeight: 700
                                                        }}>
                                                            {request.finalDesignQuotation?.deliveryWithIn || 7} days
                                                        </Title>
                                                    </Box>
                                                </Col>
                                                <Col span={8} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: '#dbeafe',
                                                        borderRadius: 6,
                                                        border: '1px solid #93c5fd',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#1e40af',
                                                            fontWeight: 600
                                                        }}>
                                                            REVISIONS
                                                        </Text>
                                                        <Title level={4} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#1e40af',
                                                            fontWeight: 700
                                                        }}>
                                                            {request.revisionTime === 9999 ? 'Unlimited' : request.revisionTime}
                                                        </Title>
                                                    </Box>
                                                </Col>
                                            </Row>
                                            {request.finalDesignQuotation?.note && (
                                                <Box sx={{
                                                    mt: 1.5,
                                                    p: 1.5,
                                                    bgcolor: '#f8fafc',
                                                    borderRadius: 6,
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    <Text style={{
                                                        fontStyle: 'italic',
                                                        color: '#475569',
                                                        fontSize: '12px'
                                                    }}>
                                                        <strong>Your Note:</strong> {request.finalDesignQuotation.note}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Card>
                                    )}

                                    {/* Logo Image */}
                                    {request.logoImage && request.logoImage !== '' && (
                                        <Card
                                            title={
                                                <Space>
                                                    <PictureOutlined style={{color: '#1976d2'}}/>
                                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Logo Image</span>
                                                </Space>
                                            }
                                            size="small"
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8
                                            }}
                                        >
                                            <Box sx={{display: 'flex', justifyContent: 'center', p: 1}}>
                                                <DisplayImage
                                                    imageUrl={request.logoImage}
                                                    alt="Logo Design"
                                                    width="150px"
                                                    height="150px"
                                                />
                                            </Box>
                                        </Card>
                                    )}
                                </Box>
                            </Col>

                            {/* Right Column - Uniform Items */}
                            <Col span={12}>
                                <Card
                                    title={
                                        <Space>
                                            <FileTextOutlined style={{color: '#1976d2'}}/>
                                            <span style={{
                                                fontWeight: 600,
                                                fontSize: '14px'
                                            }}>Design Requirements ({request.items?.length || 0})</span>
                                        </Space>
                                    }
                                    size="small"
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        height: 'fit-content'
                                    }}
                                >
                                    <Row gutter={[12, 12]}>
                                        {request.items?.map((item, index) => (
                                            <Col span={12} key={index}>
                                                <Box sx={{
                                                    p: 2,
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 8,
                                                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}>
                                                    {/* Header */}
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        mb: 1.5
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 6,
                                                            bgcolor: '#e3f2fd',
                                                            flexShrink: 0
                                                        }}>
                                                            {getItemIcon(item.type)}
                                                        </Box>
                                                        <Box sx={{flex: 1}}>
                                                            <Text strong style={{
                                                                fontSize: '13px',
                                                                color: '#1e293b',
                                                                display: 'block'
                                                            }}>
                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                            </Text>
                                                            <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                                {item.category.toUpperCase()}
                                                            </Text>
                                                        </Box>
                                                    </Box>

                                                    {/* Details */}
                                                    <Box sx={{
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 0.5
                                                    }}>
                                                        <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                            Fabric: {item.fabricName}
                                                        </Text>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5,
                                                            mt: 0.5
                                                        }}>
                                                            <Text style={{fontSize: '11px', color: '#475569'}}>
                                                                Color: {item.color}
                                                            </Text>
                                                            <Box sx={{
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                bgcolor: item.color,
                                                                border: '1px solid #e0e0e0'
                                                            }}/>

                                                        </Box>

                                                        {item.logoPosition && (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                mt: 0.5
                                                            }}>
                                                                <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                                    Logo: {item.logoPosition}
                                                                </Text>
                                                            </Box>
                                                        )}

                                                        {item.note && (
                                                            <Text style={{
                                                                fontSize: '10px',
                                                                fontStyle: 'italic',
                                                                color: '#64748b',
                                                                mt: 0.5
                                                            }}>
                                                                Note: {item.note}
                                                            </Text>
                                                        )}
                                                    </Box>

                                                    {/* Sample Images */}
                                                    {item.sampleImages && item.sampleImages.length > 0 && (
                                                        <Box sx={{mt: 1.5, pt: 1, borderTop: '1px solid #f1f5f9'}}>
                                                            <Text style={{
                                                                fontSize: '9px',
                                                                fontWeight: 600,
                                                                mb: 0.5,
                                                                display: 'block',
                                                                color: '#475569',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                Reference Images
                                                            </Text>
                                                            <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                                                                {item.sampleImages?.map((image, imgIndex) => (
                                                                    <DisplayImage
                                                                        key={image.id || imgIndex}
                                                                        imageUrl={image.url}
                                                                        alt={`Reference ${imgIndex + 1}`}
                                                                        width="32px"
                                                                        height="32px"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card>
                            </Col>
                        </Row>

                        {/* Feedback */}
                        {request.feedback && request.feedback !== '' && request.feedback !== null && (
                            <Card
                                title={
                                    <Space>
                                        <InfoCircleOutlined style={{color: '#1976d2'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>School Feedback</span>
                                    </Space>
                                }
                                size="small"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    background: 'linear-gradient(135deg, #fff3cd 0%, #ffffff 100%)'
                                }}
                            >
                                <Box sx={{p: 1.5, bgcolor: '#fff3cd', borderRadius: 6, border: '1px solid #ffeaa7'}}>
                                    <Text style={{color: '#856404', fontSize: '12px'}}>
                                        {request.feedback}
                                    </Text>
                                </Box>
                            </Card>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                    {getFooterButtons(request.status)}
                </DialogActions>
            </Dialog>
        </>
    );
}

export function useDesignerChatMessages(roomId) {
    const [chatMessages, setChatMessages] = useState([]);

    useEffect(() => {
        if (!roomId) return;
        const messageRef = collection(db, "messages");
        const queryMessages = query(messageRef, where("room", "==", roomId));

        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            let messages = [];
            snapshot.forEach(doc => {
                messages.push({...doc.data(), id: doc.id});
            });
            messages.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
            setChatMessages(messages);
        });
        return () => unsubscribe();
    }, [roomId]);

    const sendMessage = async (text) => {
        if (!text) return;
        const messageRef = collection(db, "messages");
        await addDoc(messageRef, {
            text,
            createdAt: serverTimestamp(),
            user: auth.currentUser?.displayName || "Designer",
            room: roomId,
        });
    };

    return {chatMessages, sendMessage};
}

// New DeliverySubmissionModal component for designers
function DeliveryDetailModal({visible, onCancel, delivery}) {
    if (!delivery) return null;

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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                {delivery.name}
                            </Typography.Title>
                            <Typography.Text style={{color: 'rgba(255,255,255,0.8)', fontSize: '14px'}}>
                                Delivery Details
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
                {/* Left Side - Basic Info */}
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
                                <Typography.Text strong style={{fontSize: '16px'}}>Delivery Info</Typography.Text>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography.Text style={{color: '#64748b', fontSize: '13px'}}>Name</Typography.Text>
                                    <Typography.Text strong style={{fontSize: '14px'}}>{delivery.name}</Typography.Text>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography.Text
                                        style={{color: '#64748b', fontSize: '13px'}}>Version</Typography.Text>
                                    <Typography.Text strong
                                                     style={{fontSize: '14px'}}>v{delivery.version}</Typography.Text>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography.Text style={{color: '#64748b', fontSize: '13px'}}>Submit
                                        Date</Typography.Text>
                                    <Typography.Text strong style={{fontSize: '14px'}}>
                                        {new Date(delivery.submitDate).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </Typography.Text>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography.Text style={{color: '#64748b', fontSize: '13px'}}>Type</Typography.Text>
                                    <Tag color={delivery.isRevision ? 'purple' : 'blue'} style={{margin: 0}}>
                                        {delivery.isRevision ? 'Revision' : 'Normal'}
                                    </Tag>
                                </Box>
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
                                    <Typography.Text strong style={{fontSize: '16px'}}>Note</Typography.Text>
                                </Box>
                                <Typography.Text style={{color: '#475569', fontSize: '14px', lineHeight: 1.6}}>
                                    {delivery.note}
                                </Typography.Text>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Right Side - Design Items */}
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
                            {delivery.deliveryItems?.length || 0} items
                        </Tag>
                    </Box>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {delivery.deliveryItems?.map((item, index) => (
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
                                {/* Item Header */}
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
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
                                        <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                                            {item.designItem?.type?.charAt(0).toUpperCase() + item.designItem?.type?.slice(1)} - {item.designItem?.category}
                                        </Typography.Title>
                                        <Typography.Text style={{color: '#64748b', fontSize: '12px'}}>
                                            Item #{index + 1}
                                        </Typography.Text>
                                    </Box>
                                </Box>

                                {/* Item Details Grid */}
                                <Row gutter={[24, 16]}>
                                    <Col span={8}>
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 3,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Typography.Text strong style={{fontSize: '13px', color: '#475569'}}>
                                                Color
                                            </Typography.Text>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mt: 1}}>
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
                                    <Col span={8}>
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 3,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Typography.Text strong style={{fontSize: '13px', color: '#475569'}}>
                                                Fabric
                                            </Typography.Text>
                                            <Typography.Text style={{fontSize: '13px', display: 'block', mt: 1}}>
                                                {item.designItem?.fabricName}
                                            </Typography.Text>
                                        </Box>
                                    </Col>
                                    <Col span={8}>
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 3,
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <Typography.Text strong style={{fontSize: '13px', color: '#475569'}}>
                                                Logo Position
                                            </Typography.Text>
                                            <Typography.Text style={{fontSize: '13px', display: 'block', mt: 1}}>
                                                {item.designItem?.logoPosition || 'N/A'}
                                            </Typography.Text>
                                        </Box>
                                    </Col>
                                </Row>

                                {/* Logo Dimensions for Shirt */}
                                {item.designItem?.type?.toLowerCase().includes('shirt') && (
                                    <Row gutter={[24, 16]} style={{marginTop: 16}}>
                                        <Col span={12}>
                                            <Box sx={{
                                                p: 2,
                                                backgroundColor: '#fef3c7',
                                                borderRadius: 3,
                                                border: '1px solid #fde68a'
                                            }}>
                                                <Typography.Text strong style={{fontSize: '13px', color: '#92400e'}}>
                                                    Logo Height
                                                </Typography.Text>
                                                <Typography.Text style={{
                                                    fontSize: '14px',
                                                    display: 'block',
                                                    mt: 1,
                                                    fontWeight: 600,
                                                    color: '#92400e'
                                                }}>
                                                    {item.baseLogoHeight} cm
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
                                                <Typography.Text strong style={{fontSize: '13px', color: '#92400e'}}>
                                                    Logo Width
                                                </Typography.Text>
                                                <Typography.Text style={{
                                                    fontSize: '14px',
                                                    display: 'block',
                                                    mt: 1,
                                                    fontWeight: 600,
                                                    color: '#92400e'
                                                }}>
                                                    {item.baseLogoWidth} cm
                                                </Typography.Text>
                                            </Box>
                                        </Col>
                                    </Row>
                                )}

                                {/* Design Images */}
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

                                {/* Item Note */}
                                {item.designItem?.note && (
                                    <Box sx={{
                                        mt: 2,
                                        p: 2,
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Typography.Text type="secondary"
                                                         style={{fontSize: '12px', fontStyle: 'italic'}}>
                                            <strong>Note:</strong> {item.designItem.note}
                                        </Typography.Text>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
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

function DeliverySubmissionModal({visible, onCancel, onSubmit, requestData, designDeliveries}) {
    const [form] = Form.useForm();
    const [deliveryType, setDeliveryType] = useState('normal');
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [revisionRequests, setRevisionRequests] = useState([]);
    const [loadingRevisions, setLoadingRevisions] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setDeliveryType('normal');
            setUploadedFiles({});
            setRevisionRequests([]);
        }
    }, [visible, form]);

    // Fetch revision requests when modal opens
    useEffect(() => {
        if (visible && requestData?.id) {
            fetchRevisionRequests();
        }
    }, [visible, requestData?.id]);

    // Clear revision field when delivery type changes
    useEffect(() => {
        if (deliveryType === 'normal') {
            form.setFieldsValue({ revisionOf: undefined });
            form.setFieldsValue({ itemList: [] });
            setUploadedFiles({});
        }
    }, [deliveryType, form]);

    // Auto-fill form data when revision is selected
    useEffect(() => {
        if (deliveryType === 'revision' && form.getFieldValue('revisionOf') && designDeliveries && Array.isArray(designDeliveries)) {
            const selectedRevisionId = form.getFieldValue('revisionOf');
            const selectedRevision = revisionRequests.find(r => r.id === selectedRevisionId);
            
            if (selectedRevision) {
                // Find the delivery that matches the revision's deliveryId
                const previousDelivery = designDeliveries.find(d => d.id === selectedRevision.deliveryId);
                
                if (previousDelivery && previousDelivery.deliveryItems) {
                    // Auto-fill the form with previous delivery data
                    const itemListData = previousDelivery.deliveryItems.map(item => ({
                        designItemId: item.designItem?.id,
                        logoHeight: item.baseLogoHeight || 0,
                        logoWidth: item.baseLogoWidth || 0,
                        frontUrl: item.frontImageUrl,
                        backUrl: item.backImageUrl
                    }));
                    
                    form.setFieldsValue({
                        itemList: itemListData
                    });
                    
                    // Update uploaded files state to show the previous images
                    const uploadedFilesData = {};
                    previousDelivery.deliveryItems.forEach((item, index) => {
                        if (item.frontImageUrl) {
                            // Extract filename from URL
                            const frontFileName = item.frontImageUrl.split('/').pop().split('?')[0];
                            uploadedFilesData[`front-${index}`] = frontFileName || 'Front Design';
                        }
                        if (item.backImageUrl) {
                            // Extract filename from URL
                            const backFileName = item.backImageUrl.split('/').pop().split('?')[0];
                            uploadedFilesData[`back-${index}`] = backFileName || 'Back Design';
                        }
                    });
                    setUploadedFiles(uploadedFilesData);
                }
            }
        }
    }, [deliveryType, form.getFieldValue('revisionOf'), revisionRequests, designDeliveries]);

    const fetchRevisionRequests = async () => {
        try {
            setLoadingRevisions(true);
            const response = await getUndoneRevisionRequests({requestId: requestData.id});

            // Check different possible response formats
            let revisions = [];
            if (response && response.status === 200) {
                revisions = response.data?.body || response.data || [];
            } else if (response && response.data) {
                revisions = response.data?.body || response.data || [];
            } else if (Array.isArray(response)) {
                revisions = response;
            }

            setRevisionRequests(revisions);
        } catch (err) {
            setRevisionRequests([]);
            enqueueSnackbar('Failed to load revision requests. Please try again.', {
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }
            });
        } finally {
            setLoadingRevisions(false);
        }
    };

    // Check if there are existing deliveries to allow revision type
    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            // Format data for createDesignDelivery API
            const deliveryData = {
                designRequestId: requestData.id,
                revisionId: deliveryType === 'revision' ? values.revisionOf : -1,
                name: values.deliveryName,
                note: values.deliveryDescription,
                itemList: values.itemList || [],
                revision: deliveryType === 'revision'
            };

            onSubmit(deliveryData);
        } catch (info) {
            // Show error message using enqueueSnackbar
            if (info.errorFields && info.errorFields.length > 0) {
                const errorMessages = info.errorFields.map(field => field.errors[0]).join(', ');
                enqueueSnackbar(`Please fix the following errors: ${errorMessages}`, {
                    variant: 'error',
                    autoHideDuration: 5000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                });
            } else {
                enqueueSnackbar('Please check your input and try again.', {
                    variant: 'error',
                    autoHideDuration: 3000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                    }
                });
            }
        }
    };

    return (
        <Dialog
            open={visible}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        maxHeight: '85vh'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid #f0f0f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <FileTextOutlined style={{color: 'white', fontSize: '18px'}}/>
                <span style={{fontWeight: 600, fontSize: '16px'}}>
                    Submit New Delivery
                </span>
            </DialogTitle>
            <DialogContent sx={{padding: '24px'}}>
                <Form
                    form={form}
                    layout="vertical"
                    name="delivery_submission_form"
                    style={{width: '100%'}}
                >
                    {/* Delivery Type Selection */}
                    <Form.Item
                        label="Delivery Type:"
                        required
                    >
                        <Radio.Group
                            value={deliveryType}
                            onChange={(e) => {
                                setDeliveryType(e.target.value);
                            }}
                            disabled={revisionRequests.length === 0}
                        >
                            <Radio value="normal" style={{marginBottom: '8px'}}>
                                Normal Delivery
                            </Radio>
                            <Radio value="revision" disabled={revisionRequests.length === 0}>
                                Revision Delivery
                            </Radio>
                        </Radio.Group>
                        {revisionRequests.length === 0 && (
                            <Box sx={{fontSize: '12px', color: '#64748b', mt: 0.5}}>
                                Revision type will be available when there are revision requests from the school
                            </Box>
                        )}
                    </Form.Item>

                                        {/* Revision Selection - Only show if revision type is selected */}
                    {deliveryType === 'revision' && (
                        <>
                            <Form.Item
                                name="revisionOf"
                                label="Revision Request:"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (deliveryType === 'revision' && (!value || value === '')) {
                                                return Promise.reject(new Error('Please select a revision request ID!'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                    <Select
                                        name="revisionOf"
                                        placeholder={loadingRevisions ? "Loading revision requests..." : "Select a revision request ID..."}
                                        style={{borderRadius: '8px'}}
                                        loading={loadingRevisions}
                                        disabled={loadingRevisions || revisionRequests.length === 0}
                                        allowClear
                                        styles={{
                                            popup: {
                                                root: {zIndex: 9999}
                                            }
                                        }}
                                        onChange={(value) => {
                                            // Set the form field value
                                            form.setFieldsValue({ revisionOf: value });
                                            
                                            if (value && designDeliveries && Array.isArray(designDeliveries)) {
                                                const selectedRevision = revisionRequests.find(r => r.id === value);
                                                if (selectedRevision) {
                                                    const previousDelivery = designDeliveries.find(d => d.id === selectedRevision.deliveryId);
                                                    if (previousDelivery && previousDelivery.deliveryItems) {
                                                        // Auto-fill the form with previous delivery data
                                                        const itemListData = previousDelivery.deliveryItems.map(item => ({
                                                            designItemId: item.designItem?.id,
                                                            logoHeight: item.baseLogoHeight || 0,
                                                            logoWidth: item.baseLogoWidth || 0,
                                                            frontUrl: item.frontImageUrl,
                                                            backUrl: item.backImageUrl
                                                        }));
                                                        
                                                        form.setFieldsValue({
                                                            itemList: itemListData
                                                        });
                                                        
                                                        // Update uploaded files state to show the previous images
                                                        const uploadedFilesData = {};
                                                        previousDelivery.deliveryItems.forEach((item, index) => {
                                                            if (item.frontImageUrl) {
                                                                // Extract filename from URL
                                                                const frontFileName = item.frontImageUrl.split('/').pop().split('?')[0];
                                                                uploadedFilesData[`front-${index}`] = frontFileName || 'Front Design';
                                                            }
                                                            if (item.backImageUrl) {
                                                                // Extract filename from URL
                                                                const backFileName = item.backImageUrl.split('/').pop().split('?')[0];
                                                                uploadedFilesData[`back-${index}`] = backFileName || 'Back Design';
                                                            }
                                                        });
                                                        setUploadedFiles(uploadedFilesData);
                                                    }
                                                }
                                            } else {
                                                // Clear form when no revision is selected
                                                form.setFieldsValue({
                                                    itemList: []
                                                });
                                                setUploadedFiles({});
                                            }
                                        }}
                                    >
                                        {revisionRequests.length > 0 ? (
                                            revisionRequests.map(revision => {
                                                const relatedDelivery = designDeliveries && Array.isArray(designDeliveries) 
                                                    ? designDeliveries.find(d => d.id === revision.deliveryId)
                                                    : null;
                                                return (
                                                    <Select.Option key={revision.id} value={revision.id}>
                                                        Revision #{revision.id} - {relatedDelivery?.name || `Delivery ${revision.deliveryId}`}
                                                    </Select.Option>
                                                );
                                            })
                                        ) : (
                                            <Select.Option value="" disabled>
                                                No revision requests available
                                            </Select.Option>
                                        )}
                                    </Select>
                                    {form.getFieldValue('revisionOf') && (
                                        <Box sx={{
                                            p: 1.5,
                                            backgroundColor: '#e6f7ff',
                                            borderRadius: 4,
                                            border: '1px solid #91d5ff',
                                            fontSize: '12px',
                                            color: '#1890ff'
                                        }}>
                                            <Typography.Text style={{fontSize: '12px', color: '#1890ff'}}>
                                                💡 Data from the previous delivery has been auto-filled. You can modify the values as needed.
                                            </Typography.Text>
                                        </Box>
                                    )}
                                </Box>
                            </Form.Item>
                        </>
                    )}

                    <Form.Item
                        name="deliveryName"
                        label="Delivery Name:"
                        rules={[{required: true, message: 'Please enter delivery name!'}]}
                    >
                        <Input
                            placeholder={deliveryType === 'revision' ? "e.g., Revision 1.0, Updated Design v2.1..." : "e.g., Concept 1.0, Final Design v2.0..."}
                            style={{
                                borderRadius: '8px',
                                width: '100%'
                            }}
                            autoComplete="off"
                        />
                    </Form.Item>
                    <Form.Item
                        name="deliveryDescription"
                        label="Note:"
                        rules={[{required: false, message: 'Please add a note for your delivery!'}]}
                    >
                        <TextArea
                            rows={4}
                            placeholder={deliveryType === 'revision' ? "Add notes about the changes and improvements made to the previous version..." : "Add notes about the design changes, improvements, or new concepts included in this delivery..."}
                            style={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                resize: 'none',
                                borderRadius: '8px',
                                width: '100%'
                            }}
                            autoComplete="off"
                        />
                    </Form.Item>


                    {/* Design Items Section */}
                    <Divider>Design Items</Divider>

                    {requestData?.items?.map((item, index) => (
                        <Card key={index} size="small" style={{marginBottom: '16px', border: '1px solid #e2e8f0'}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                {getItemIcon(item.type)}
                                <Typography.Title level={5} style={{margin: 0}}>
                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.category}
                                </Typography.Title>
                            </Box>

                            {/* Logo Dimensions - Only show for shirt */}
                            {item.type.toLowerCase().includes('shirt') && (
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Form.Item
                                            name={['itemList', index, 'logoHeight']}
                                            label="Logo Height (cm):"
                                            rules={[
                                                {required: true, message: 'Please enter logo height!'},
                                                {
                                                    validator: (_, value) => {
                                                        if (value === undefined || value === '') {
                                                            return Promise.resolve();
                                                        }
                                                        const numValue = Number(value);
                                                        if (isNaN(numValue) || numValue < 1 || numValue > 999) {
                                                            return Promise.reject(new Error('Logo height must be between 1 and 999 cm!'));
                                                        }
                                                        return Promise.resolve();
                                                    }
                                                }
                                            ]}
                                        >
                                            <Input
                                                type="number"
                                                min={1}
                                                max={999}
                                                placeholder="e.g., 5"
                                                style={{borderRadius: '8px'}}
                                                autoComplete="off"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={['itemList', index, 'logoWidth']}
                                            label="Logo Width (cm):"
                                            rules={[
                                                {required: true, message: 'Please enter logo width!'},
                                                {
                                                    validator: (_, value) => {
                                                        if (value === undefined || value === '') {
                                                            return Promise.resolve();
                                                        }
                                                        const numValue = Number(value);
                                                        if (isNaN(numValue) || numValue < 1 || numValue > 999) {
                                                            return Promise.reject(new Error('Logo width must be between 1 and 999 cm!'));
                                                        }
                                                        return Promise.resolve();
                                                    }
                                                }
                                            ]}
                                        >
                                            <Input
                                                type="number"
                                                min={1}
                                                max={999}
                                                placeholder="e.g., 8"
                                                style={{borderRadius: '8px'}}
                                                autoComplete="off"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}

                            {/* Hidden fields for pants/skirt with default value 0 */}
                            {!item.type.toLowerCase().includes('shirt') && (
                                <>
                                    <Form.Item
                                        name={['itemList', index, 'logoHeight']}
                                        initialValue={0}
                                        hidden
                                    >
                                        <Input/>
                                    </Form.Item>
                                    <Form.Item
                                        name={['itemList', index, 'logoWidth']}
                                        initialValue={0}
                                        hidden
                                    >
                                        <Input/>
                                    </Form.Item>
                                </>
                            )}

                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['itemList', index, 'frontUrl']}
                                        label="Front Design:"
                                        rules={[{required: true, message: 'Please upload front design!'}]}
                                    >
                                        <Box sx={{position: 'relative'}}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id={`front-upload-${index}`}
                                                style={{display: 'none'}}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setUploading(true);
                                                        try {
                                                            const url = await uploadCloudinary(file);
                                                            form.setFieldsValue({
                                                                itemList: {
                                                                    ...form.getFieldValue('itemList'),
                                                                    [index]: {
                                                                        ...form.getFieldValue('itemList')?.[index],
                                                                        frontUrl: url
                                                                    }
                                                                }
                                                            });
                                                            // Save uploaded file name
                                                            setUploadedFiles(prev => ({
                                                                ...prev,
                                                                [`front-${index}`]: file.name
                                                            }));
                                                        } catch (error) {
                                                            enqueueSnackbar('Failed to upload front design image. Please try again.', {
                                                                variant: 'error',
                                                                autoHideDuration: 3000,
                                                                anchorOrigin: {
                                                                    vertical: 'top',
                                                                    horizontal: 'right',
                                                                }
                                                            });
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            <Box sx={{width: '100%'}}>
                                                <Button
                                                    onClick={() => document.getElementById(`front-upload-${index}`).click()}
                                                    icon={<UploadOutlined/>}
                                                    loading={uploading}
                                                    style={{
                                                        width: '100%',
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        border: '2px dashed #d9d9d9',
                                                        backgroundColor: '#fafafa',
                                                        color: '#666',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.3s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.borderColor = '#1976d2';
                                                        e.target.style.backgroundColor = '#e3f2fd';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.borderColor = '#d9d9d9';
                                                        e.target.style.backgroundColor = '#fafafa';
                                                    }}
                                                >
                                                    {uploading ? 'Uploading...' : 'Upload Front Design'}
                                                </Button>
                                                {uploadedFiles[`front-${index}`] && (
                                                    <Box sx={{
                                                        mt: 1,
                                                        p: 1,
                                                        backgroundColor: '#f6ffed',
                                                        borderRadius: '4px',
                                                        border: '1px solid #b7eb8f',
                                                        fontSize: '12px',
                                                        color: '#52c41a',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <CheckCircleOutlined style={{fontSize: '12px'}}/>
                                                        {uploadedFiles[`front-${index}`]}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['itemList', index, 'backUrl']}
                                        label="Back Design:"
                                        rules={[{required: true, message: 'Please upload back design!'}]}
                                    >
                                        <Box sx={{position: 'relative'}}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id={`back-upload-${index}`}
                                                style={{display: 'none'}}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setUploading(true);
                                                        try {
                                                            const url = await uploadCloudinary(file);
                                                            form.setFieldsValue({
                                                                itemList: {
                                                                    ...form.getFieldValue('itemList'),
                                                                    [index]: {
                                                                        ...form.getFieldValue('itemList')?.[index],
                                                                        backUrl: url
                                                                    }
                                                                }
                                                            });
                                                            // Save uploaded file name
                                                            setUploadedFiles(prev => ({
                                                                ...prev,
                                                                [`back-${index}`]: file.name
                                                            }));
                                                        } catch (error) {
                                                            enqueueSnackbar('Failed to upload back design image. Please try again.', {
                                                                variant: 'error',
                                                                autoHideDuration: 3000,
                                                                anchorOrigin: {
                                                                    vertical: 'top',
                                                                    horizontal: 'right',
                                                                }
                                                            });
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            <Box sx={{width: '100%'}}>
                                                <Button
                                                    onClick={() => document.getElementById(`back-upload-${index}`).click()}
                                                    icon={<UploadOutlined/>}
                                                    loading={uploading}
                                                    style={{
                                                        width: '100%',
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        border: '2px dashed #d9d9d9',
                                                        backgroundColor: '#fafafa',
                                                        color: '#666',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.3s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.borderColor = '#1976d2';
                                                        e.target.style.backgroundColor = '#e3f2fd';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.borderColor = '#d9d9d9';
                                                        e.target.style.backgroundColor = '#fafafa';
                                                    }}
                                                >
                                                    {uploading ? 'Uploading...' : 'Upload Back Design'}
                                                </Button>
                                                {uploadedFiles[`back-${index}`] && (
                                                    <Box sx={{
                                                        mt: 1,
                                                        p: 1,
                                                        backgroundColor: '#f6ffed',
                                                        borderRadius: '4px',
                                                        border: '1px solid #b7eb8f',
                                                        fontSize: '12px',
                                                        color: '#52c41a',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <CheckCircleOutlined style={{fontSize: '12px'}}/>
                                                        {uploadedFiles[`back-${index}`]}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name={['itemList', index, 'designItemId']}
                                initialValue={item.id}
                                hidden
                            >
                                <Input/>
                            </Form.Item>
                        </Card>
                    ))}
                </Form>
            </DialogContent>
            <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                <Button onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="primary"
                    onClick={handleOk}
                    style={{
                        backgroundColor: '#1976d2',
                        borderColor: '#1976d2'
                    }}
                >
                    Submit Delivery
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function DesignerChat() {
    const [requestData, setRequestData] = useState(null);
    const [designDeliveries, setDesignDeliveries] = useState([]);
    const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const [isDesignDetailModalVisible, setIsDesignDetailModalVisible] = useState(false);
    const [isDeliveryDetailModalVisible, setIsDeliveryDetailModalVisible] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [loadingDeliveries, setLoadingDeliveries] = useState(false);
    const [revisionRequests, setRevisionRequests] = useState([]);
    const [loadingRevisionRequests, setLoadingRevisionRequests] = useState(false);
    const roomId = requestData?.id;
    const {chatMessages, sendMessage} = useDesignerChatMessages(roomId);
    const [newMessage, setNewMessage] = useState('');

    // Fetch design deliveries from API
    const fetchDesignDeliveries = async (designRequestId) => {
        try {
            setLoadingDeliveries(true);
            const response = await getDesignDeliveries(designRequestId);
            if (response && response.status === 200) {
                const deliveries = response.data.body || [];
                setDesignDeliveries(deliveries);
            } else {
                setDesignDeliveries([]);
            }
        } catch (err) {
            setDesignDeliveries([]);
        } finally {
            setLoadingDeliveries(false);
        }
    };

    // Fetch revision requests from API
    const fetchRevisionRequests = async (requestId) => {
        try {
            setLoadingRevisionRequests(true);
            const response = await getUndoneRevisionRequests({requestId: requestId});
            if (response && response.status === 200) {
                setRevisionRequests(response.data.body || []);
            } else {
                setRevisionRequests([]);
            }
        } catch (err) {
            setRevisionRequests([]);
        } finally {
            setLoadingRevisionRequests(false);
        }
    };

    // Fetch request details from API
    const fetchRequestDetails = async (requestId) => {
        try {
            const response = await getDesignRequestDetailForDesigner(requestId);
            if (response && response.status === 200) {
                const request = response.data.body;

                if (request) {
                    // Check if request status is completed - redirect to applied requests
                    if (request.status === 'completed') {
                        window.location.href = '/designer/applied/requests';
                        return;
                    }

                    setRequestData(request);

                    // Fetch deliveries and revision requests for this request
                    if (request.id) {
                        await fetchDesignDeliveries(request.id);
                        await fetchRevisionRequests(request.id);
                    }
                } else {
                    window.location.href = '/designer/requests';
                }
            } else {
                window.location.href = '/designer/requests';
            }
        } catch (error) {
            window.location.href = '/designer/requests';
        }
    };

    // Fetch updated request data from API
    useEffect(() => {
        const storedRequestId = localStorage.getItem('currentDesignRequestId');
        if (storedRequestId) {
            // Fetch request details using API
            fetchRequestDetails(storedRequestId);
        } else {
            // If no request ID in localStorage, redirect to Designer Request
            window.location.href = '/designer/requests';
        }
    }, []);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage.trim());
            setNewMessage('');
            setShowEmojiPicker(false);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                enqueueSnackbar('Invalid file type. Only images are accepted.', {variant: 'error'});
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const now = new Date();
                const formattedTime = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                const formattedDay = now.toLocaleDateString('en-US', {weekday: 'short'});
                setChatMessages(prevMessages => [
                    ...prevMessages,
                    {imageUrl: reader.result, sender: 'designer', timestamp: `${formattedDay}, ${formattedTime}`}
                ]);
            };
            reader.readAsDataURL(file);
        }
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prevMsg => prevMsg + emojiData.emoji);
        setShowEmojiPicker(false); // Hide picker after selecting
    };

    const handleOpenDeliveryModal = async () => {
        // Fetch updated request data before opening modal
        if (requestData?.id) {
            try {
                const latestResponse = await getDesignRequestDetailForDesigner(requestData.id);
                if (latestResponse && latestResponse.status === 200) {
                    const updatedRequest = latestResponse.data.body;
                    if (updatedRequest) {
                        // Check if request status is completed - redirect to applied requests
                        if (updatedRequest.status === 'completed') {
                            window.location.href = '/designer/applied/requests';
                            return;
                        }
                        setRequestData(updatedRequest);
                    }
                }
            } catch (error) {
                // Error fetching latest request data
            }
        }
        setIsDeliveryModalVisible(true);
    };

    const handleCloseDeliveryModal = () => {
        setIsDeliveryModalVisible(false);
    };


    const handleOpenDesignDetailModal = () => {
        setIsDesignDetailModalVisible(true);
    };

    const handleCloseDesignDetailModal = () => {
        setIsDesignDetailModalVisible(false);
    };

    const handleOpenDeliveryDetailModal = (delivery) => {
        setSelectedDelivery(delivery);
        setIsDeliveryDetailModalVisible(true);
    };

    const handleCloseDeliveryDetailModal = () => {
        setIsDeliveryDetailModalVisible(false);
        setSelectedDelivery(null);
    };


    const handleDeliverySubmit = async (deliveryData) => {
        try {
            // Call createDesignDelivery API
            const response = await createDesignDelivery(deliveryData);

            if (response && response.status === 201) {
                enqueueSnackbar('Delivery submitted successfully!', {variant: 'success'});
                handleCloseDeliveryModal();

                // Refresh deliveries list and revision requests
                if (requestData?.id) {
                    fetchDesignDeliveries(requestData.id);
                    fetchRevisionRequests(requestData.id);

                    // Fetch latest request data from API instead of manually updating
                    try {
                        const latestResponse = await getDesignRequestDetailForDesigner(requestData.id);
                        if (latestResponse && latestResponse.status === 200) {
                            const updatedRequest = latestResponse.data.body;
                            if (updatedRequest) {
                                // Check if request status is completed - redirect to applied requests
                                if (updatedRequest.status === 'completed') {
                                    window.location.href = '/designer/applied/requests';
                                    return;
                                }
                                setRequestData(updatedRequest);
                            }
                        }
                    } catch (error) {
                        // Error fetching latest request data
                    }
                }
            } else {
                enqueueSnackbar('Failed to submit delivery. Please try again.', {variant: 'error'});
            }
        } catch (error) {
            enqueueSnackbar('Error submitting delivery. Please try again.', {variant: 'error'});
        }
    };

    return (
        <Box sx={{
            height: 'max-content',
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: {xs: 2, md: 4},
            marginBottom: '2vh'
        }}>
            <Container maxWidth="xl" sx={{height: 'max-content'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>

                    {/* Header Section */}
                    <Box sx={{
                        mb: 3,
                        p: 2,
                        backgroundColor: 'white',
                        borderRadius: 4,
                        border: '2px solid #1976d2',
                        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.2)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                        }
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                                <Box>
                                    <Typography.Title level={2} style={{margin: 0, color: '#1e293b', fontWeight: 700}}>
                                        Designer Chat
                                    </Typography.Title>
                                    <Typography.Text type="secondary" style={{fontSize: '16px', fontWeight: 500}}>
                                        Request ID: {requestData ? parseID(requestData.id, 'dr') : 'N/A'}
                                    </Typography.Text>
                                </Box>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Button
                                    type="primary"
                                    icon={<InfoCircleOutlined/>}
                                    onClick={handleOpenDesignDetailModal}
                                    style={{
                                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        height: '36px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                                        }
                                    }}
                                >
                                    View Design Details
                                </Button>
                                <Chip
                                    label={requestData?.status?.toUpperCase() || 'UNKNOWN'}
                                    color={requestData?.status === 'completed' ? 'default' : 'success'}
                                    size="large"
                                    style={{
                                        backgroundColor: requestData?.status === 'completed' ? '#1890ff' : '#52c41a',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        padding: '8px 16px'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Main Content */}
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minHeight: 0, height: '90vh'}}>

                        {/* Top Row - Chat and Deliveries */}
                        <Box sx={{display: 'flex', gap: 3, flex: 2}}>

                            {/* Left Half - School Chat */}
                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    borderRadius: 4,
                                    border: '2px solid #1976d2',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
                                    position: 'relative'
                                }}
                            >
                                {/* Chat Header */}
                                <Box sx={{
                                    py: 2,
                                    px: 4,
                                    borderBottom: '2px solid #e2e8f0',
                                    backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
                                    position: 'relative'
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                                        <Box sx={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '20px',
                                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                                        }}>
                                            <BankOutlined/>
                                        </Box>
                                        <Box>
                                            <Typography.Title level={4}
                                                              style={{margin: 0, color: '#1e293b', fontWeight: 600}}>
                                                School Chat
                                            </Typography.Title>
                                            <Typography.Text type="secondary"
                                                             style={{fontSize: '14px', fontWeight: 500}}>
                                                Communicate with the school
                                            </Typography.Text>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Chat Messages */}
                                <Box sx={{
                                    flex: 1,
                                    p: 3,
                                    overflowY: 'auto',
                                    backgroundColor: '#f8fafc',
                                    maxHeight: '70vh'
                                }}>
                                    {chatMessages.length === 0 ? (
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%',
                                            color: '#64748b'
                                        }}>
                                            <MessageOutlined style={{fontSize: '48px', marginBottom: '16px'}}/>
                                            <Typography.Text type="secondary" style={{fontSize: '16px'}}>
                                                No messages yet. Start the conversation!
                                            </Typography.Text>
                                        </Box>
                                    ) : (
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            {chatMessages.map((msg, index) => (
                                                <Box
                                                    key={msg.id || index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: msg.user === (auth.currentUser?.displayName || "Designer") ? 'flex-end' : 'flex-start',
                                                        mb: 2
                                                    }}
                                                >
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'flex-end',
                                                        gap: 1,
                                                        maxWidth: '70%'
                                                    }}>
                                                        {msg.user !== (auth.currentUser?.displayName || "Designer") && (
                                                            <Avatar
                                                                size="small"
                                                                style={{backgroundColor: '#1976d2'}}
                                                                icon={<BankOutlined/>}
                                                            />
                                                        )}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRadius: 4,
                                                            backgroundColor: msg.user === (auth.currentUser?.displayName || "Designer")
                                                                ? 'linear-gradient(135deg, #1976d2, #42a5f5)'
                                                                : 'white',
                                                            color: msg.user === (auth.currentUser?.displayName || "Designer") ? 'white' : '#1e293b',
                                                            border: msg.user !== (auth.currentUser?.displayName || "Designer") ? '2px solid #e2e8f0' : 'none',
                                                            maxWidth: '100%',
                                                            wordWrap: 'break-word',
                                                            boxShadow: msg.user === (auth.currentUser?.displayName || "Designer")
                                                                ? '0 4px 12px rgba(25, 118, 210, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                            position: 'relative'
                                                        }}>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    mb: 1
                                                                }}>
                                                                <Typography.Text
                                                                    style={{fontSize: '11px', color: '#94a3b8'}}
                                                                >
                                                                    {
                                                                        msg.createdAt?.seconds
                                                                            ? new Date(msg.createdAt.seconds * 1000).toLocaleString()
                                                                            : ''
                                                                    }
                                                                </Typography.Text>
                                                            </Box>
                                                            {msg.text && (
                                                                <Typography.Text style={{fontSize: '14px'}}>
                                                                    {msg.text}
                                                                </Typography.Text>
                                                            )}
                                                        </Box>
                                                        {msg.user === (auth.currentUser?.displayName || "Designer") && (
                                                            <Avatar
                                                                size="small"
                                                                style={{backgroundColor: '#52c41a'}}
                                                                icon={<UserOutlined/>}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                {/* Message Input */}
                                <Box sx={{
                                    py: 2,
                                    px: 2,
                                    borderTop: '2px solid #e2e8f0',
                                    backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)'
                                }}>
                                    <Box sx={{display: 'flex', gap: 3, alignItems: 'flex-end'}}>
                                        <Box sx={{flex: 1, position: 'relative'}}>
                                            <Input
                                                placeholder="Type your message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onPressEnter={handleSendMessage}
                                                style={{
                                                    borderRadius: '25px',
                                                    padding: '16px 20px',
                                                    fontSize: '16px',
                                                    border: '2px solid #e2e8f0',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                    transition: 'all 0.3s ease',
                                                    '&:focus': {
                                                        borderColor: '#1976d2',
                                                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                                                    }
                                                }}
                                            />
                                            {showEmojiPicker && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    bottom: '60px',
                                                    right: '0px',
                                                    zIndex: 10,
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                                }}>
                                                    <EmojiPicker onEmojiClick={onEmojiClick} height={300} width={280}/>
                                                </Box>
                                            )}
                                        </Box>
                                        <input
                                            type="file"
                                            accept=".jpg, .jpeg, .png, .gif"
                                            style={{display: 'none'}}
                                            id="image-upload-input"
                                            onChange={handleImageUpload}
                                        />
                                        <Button
                                            icon={<UploadOutlined/>}
                                            onClick={() => document.getElementById('image-upload-input').click()}
                                            style={{
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                backgroundColor: '#f8fafc',
                                                border: '2px solid #e2e8f0',
                                                color: '#64748b',
                                                fontSize: '18px',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: '#e3f2fd',
                                                    borderColor: '#1976d2',
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                        <Button
                                            icon={<SmileOutlined/>}
                                            onClick={() => setShowEmojiPicker(prev => !prev)}
                                            style={{
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                backgroundColor: '#f8fafc',
                                                border: '2px solid #e2e8f0',
                                                color: '#64748b',
                                                fontSize: '18px',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: '#e3f2fd',
                                                    borderColor: '#1976d2',
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined/>}
                                            onClick={handleSendMessage}
                                            style={{
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                                border: 'none',
                                                fontSize: '18px',
                                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Right Half - Deliveries and Revision Container */}
                            <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 3, maxHeight: '100vh'}}>

                                {/* My Deliveries Section */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: 'white',
                                        borderRadius: 4,
                                        border: '2px solid #1976d2',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
                                        position: 'relative'
                                    }}
                                >
                                    {/* My Deliveries Header */}
                                    <Box sx={{
                                        py: 2.5,
                                        px: 4,
                                        borderBottom: '2px solid #e2e8f0',
                                        backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
                                        position: 'relative'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                                                <Box sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '16px',
                                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                                                }}>
                                                    <FileTextOutlined/>
                                                </Box>
                                                <Typography.Title level={4}
                                                                  style={{
                                                                      margin: 0,
                                                                      color: '#1e293b',
                                                                      fontWeight: 600
                                                                  }}>
                                                    My Deliveries
                                                </Typography.Title>
                                            </Box>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: 32,
                                                height: 32,
                                                px: 2,
                                                borderRadius: '16px',
                                                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                                                border: '2px solid rgba(255, 255, 255, 0.2)'
                                            }}>
                                                Amount: {designDeliveries.length}
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Deliveries List */}
                                    <Box sx={{flex: 1, p: 2, overflowY: 'auto'}}>
                                        {loadingDeliveries ? (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                flexDirection: 'column',
                                                gap: 2
                                            }}>
                                                <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                                    Loading deliveries...
                                                </Typography.Text>
                                            </Box>
                                        ) : (
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                                {designDeliveries.length === 0 ? (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        height: '100%',
                                                        flexDirection: 'column',
                                                        gap: 2,
                                                        color: '#64748b'
                                                    }}>
                                                        <FileTextOutlined style={{fontSize: '48px', opacity: 0.5}}/>
                                                        <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                                            No deliveries yet. Start by adding your first delivery!
                                                        </Typography.Text>
                                                    </Box>
                                                ) : (
                                                    designDeliveries.map(item => (
                                                        <Paper
                                                            key={item.id}
                                                            elevation={0}
                                                            sx={{
                                                                p: 2,
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: 2,
                                                                backgroundColor: 'white',
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    borderColor: '#1976d2',
                                                                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                mb: 1.5
                                                            }}>
                                                                <Box sx={{flex: 1}}>
                                                                    <Typography.Title level={5}
                                                                                      style={{
                                                                                          margin: 0,
                                                                                          color: '#1e293b'
                                                                                      }}>
                                                                        {item.name}
                                                                    </Typography.Title>
                                                                    <Typography.Text type="secondary"
                                                                                     style={{fontSize: '12px'}}>
                                                                        {new Date(item.submitDate).toLocaleDateString('vi-VN', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </Typography.Text>
                                                                </Box>
                                                                <Tag color="blue" style={{margin: 0}}>
                                                                    {parseID(item.id, 'dd')}
                                                                </Tag>
                                                            </Box>

                                                            <Box sx={{
                                                                display: 'flex',
                                                                gap: 1,
                                                                justifyContent: 'space-between'
                                                            }}>
                                                                <Button
                                                                    size="small"
                                                                    icon={<EyeOutlined/>}
                                                                    onClick={() => handleOpenDeliveryDetailModal(item)}
                                                                    style={{borderRadius: '6px', flex: 1}}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </Box>
                                                        </Paper>
                                                    ))
                                                )}

                                                {/* Add New Delivery Button */}
                                                <Button
                                                    type="dashed"
                                                    icon={<FileTextOutlined/>}
                                                    onClick={handleOpenDeliveryModal}
                                                    style={{
                                                        borderRadius: '8px',
                                                        height: '48px',
                                                        border: '2px dashed #d9d9d9',
                                                        color: '#666',
                                                        fontSize: '14px',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    + Add New Delivery
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>

                                {/* Revision Requests Section */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: 'white',
                                        borderRadius: 4,
                                        border: '2px solid #ff6b35',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.15)',
                                        position: 'relative',
                                        height: 'max-content'
                                    }}
                                >
                                    {/* Revision Requests Header */}
                                    <Box sx={{
                                        py: 2,
                                        px: 3,
                                        borderBottom: '2px solid #e2e8f0',
                                        backgroundColor: 'linear-gradient(135deg, #fff5f0 0%, #ffe4d6 100%)',
                                        position: 'relative'
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '14px',
                                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                                            }}>
                                                <EditOutlined/>
                                            </Box>
                                            <Typography.Title level={5}
                                                              style={{margin: 0, color: '#ff6b35', fontWeight: 600}}>
                                                Revision Requests
                                            </Typography.Title>
                                        </Box>
                                    </Box>

                                    {/* Revision Requests Content */}
                                    <Box sx={{
                                        p: 3,
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: '2vh'
                                    }}>
                                        {loadingRevisionRequests ? (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                flexDirection: 'column',
                                                gap: 2
                                            }}>
                                                <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                                    Loading revision requests...
                                                </Typography.Text>
                                            </Box>
                                        ) : revisionRequests.length > 0 ? (
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
                                                {revisionRequests.map((revision, index) => (
                                                    <Paper
                                                        key={revision.id}
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: 2,
                                                            backgroundColor: 'white',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                borderColor: '#ff6b35',
                                                                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            mb: 1.5
                                                        }}>
                                                            <Box sx={{flex: 1}}>
                                                                <Typography.Title level={5}
                                                                                  style={{margin: 0, color: '#1e293b'}}>
                                                                    Revision #{index + 1}
                                                                </Typography.Title>
                                                                <Typography.Text type="secondary"
                                                                                 style={{fontSize: '12px'}}>
                                                                    {new Date(revision.requestDate).toLocaleDateString('vi-VN', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric'
                                                                    })}
                                                                </Typography.Text>
                                                            </Box>
                                                            <Tag color="orange" style={{margin: 0}}>
                                                                {parseID(revision.deliveryId, 'rr')}
                                                            </Tag>
                                                        </Box>
                                                        <Typography.Text style={{
                                                            fontSize: '13px',
                                                            color: '#475569',
                                                            lineHeight: 1.5
                                                        }}>
                                                            {revision.note}
                                                        </Typography.Text>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            gap: 1,
                                                            justifyContent: 'flex-end',
                                                            mt: 1.5
                                                        }}>
                                                            <Button
                                                                size="small"
                                                                icon={<EyeOutlined/>}
                                                                onClick={() => {
                                                                    const delivery = designDeliveries.find(d => d.id === revision.deliveryId);
                                                                    if (delivery) {
                                                                        handleOpenDeliveryDetailModal(delivery);
                                                                    }
                                                                }}
                                                                style={{borderRadius: '6px'}}
                                                            >
                                                                View Delivery
                                                            </Button>
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                flexDirection: 'column',
                                                gap: 2,
                                                color: '#64748b'
                                            }}>
                                                <EditOutlined style={{fontSize: '48px', opacity: 0.5}}/>
                                                <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                                    No revision requests
                                                </Typography.Text>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Container>

            <DeliverySubmissionModal
                visible={isDeliveryModalVisible}
                onCancel={handleCloseDeliveryModal}
                onSubmit={handleDeliverySubmit}
                designDeliveries={designDeliveries}
                requestData={requestData}
            />


            <DesignDetailDialog
                visible={isDesignDetailModalVisible}
                onCancel={handleCloseDesignDetailModal}
                request={requestData}
            />

            <DeliveryDetailModal
                visible={isDeliveryDetailModalVisible}
                onCancel={handleCloseDeliveryDetailModal}
                delivery={selectedDelivery}
            />
        </Box>
    );
}