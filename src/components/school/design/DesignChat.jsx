import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Avatar as AntAvatar,
    Button,
    Card,
    Col,
    Form,
    Input,
    Modal,
    Rate,
    Row,
    Space,
    Tag,
    Typography
} from 'antd';
import {
    CheckCircleOutlined,
    CheckCircleOutlined as CheckCircleOutlinedIcon,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    FileTextOutlined as FileTextOutlinedIcon,
    InfoCircleOutlined,
    InfoCircleOutlined as InfoCircleOutlinedIcon,
    MessageOutlined,
    PictureOutlined,
    SendOutlined,
    SmileOutlined,
    SyncOutlined,
    UploadOutlined,
    UserOutlined,
    UserOutlined as UserOutlinedIcon,
    UserSwitchOutlined
} from '@ant-design/icons';
import {
    Box,
    Box as MuiBox,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper
} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import {useSnackbar} from 'notistack';
import {parseID} from '../../../utils/ParseIDUtil.jsx';
import {addDoc, collection, onSnapshot, query, serverTimestamp, where} from 'firebase/firestore';
import {auth, db} from "../../../configs/FirebaseConfig.jsx";
import {
    createRevisionRequest,
    getDesignDeliveries,
    getDesignRequestDetailForSchool,
    getUndoneRevisionRequests,
    makeDesignFinal
} from "../../../services/DesignService.jsx";
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DisplayImage from '../../ui/DisplayImage.jsx';

const {TextArea} = Input;

// eslint-disable-next-line react-refresh/only-export-components
export function statusTag(status) {
    let color;
    let icon = null;
    switch (status) {
        case 'pending':
            color = 'blue';
            icon = <ClockCircleOutlined/>;
            break;
        case 'processing':
            color = 'green';
            icon = <SyncOutlined/>;
            break;
        case 'completed':
            color = 'cyan';
            icon = <CheckCircleOutlinedIcon/>;
            break;
        case 'canceled':
            color = 'red';
            icon = <CloseCircleOutlined/>;
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
        return <FileTextOutlinedIcon/>;
    }
};

// Design Detail Dialog Component
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN');
    };


    return (
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
                <InfoCircleOutlinedIcon style={{color: 'white', fontSize: '18px'}}/>
                <span style={{fontWeight: 600, fontSize: '16px'}}>
                    Design Request: {parseID(request.id, 'dr')}
                </span>
            </DialogTitle>
            <DialogContent sx={{padding: '20px', overflowY: 'auto'}}>
                <MuiBox sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                    {/* Compact Header */}
                    <Row gutter={[16, 8]} align="middle" style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '16px'
                    }}>
                        <Col span={8}>
                            <Space direction="vertical" size="small">
                                <Text style={{fontWeight: 600, fontSize: '16px', color: '#1e293b'}}>
                                    {request.name}
                                </Text>
                                <Text style={{color: '#64748b', fontSize: '12px'}}>
                                    Created: {formatDate(request.creationDate)}
                                </Text>
                            </Space>
                        </Col>
                        <Col span={8} style={{textAlign: 'center'}}>
                            <Space direction="vertical" size="small">
                                <Text style={{fontSize: '12px', color: '#64748b'}}>
                                    Design Request
                                </Text>
                                <Text style={{fontSize: '10px', color: '#94a3b8'}}>
                                    Basic Information
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

                    {/* Main Content - Two Columns */}
                    <Row gutter={[16, 16]}>
                        {/* Left Column - Designer & Quotation */}
                        <Col span={12}>
                            <MuiBox sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                                {/* Designer Info */}
                                {request.finalDesignQuotation && (
                                    <Row gutter={[8, 8]} style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: '16px',
                                        background: 'white'
                                    }}>
                                        <Col span={24}>
                                            <Space direction="vertical" size="small" style={{width: '100%'}}>
                                                <Space>
                                                    <UserOutlinedIcon style={{color: '#1976d2'}}/>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        fontSize: '14px'
                                                    }}>Selected Designer</span>
                                                </Space>
                                                <Space>
                                                    <AntAvatar
                                                        size={48}
                                                        src={request.finalDesignQuotation.designer.customer.avatar || request.finalDesignQuotation.designer.customer.name.charAt(0)}
                                                        style={{
                                                            border: '2px solid #1976d2',
                                                            backgroundColor: '#1976d2'
                                                        }}
                                                    >
                                                        {request.finalDesignQuotation.designer.customer.name.charAt(0)}
                                                    </AntAvatar>
                                                    <Space direction="vertical" size="small">
                                                        <Text style={{
                                                            fontWeight: 600,
                                                            fontSize: '14px',
                                                            color: '#1e293b'
                                                        }}>
                                                            {request.finalDesignQuotation.designer.customer.name}
                                                        </Text>
                                                        <Space>
                                                            <Rate
                                                                disabled
                                                                defaultValue={request.finalDesignQuotation.designer.rating}
                                                                style={{fontSize: '10px'}}
                                                            />
                                                            <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                                ({request.finalDesignQuotation.designer.rating})
                                                            </Text>
                                                        </Space>
                                                    </Space>
                                                </Space>
                                            </Space>
                                        </Col>
                                    </Row>
                                )}

                                {/* Service Summary */}
                                {request.finalDesignQuotation && (
                                    <Card
                                        title={
                                            <Space>
                                                <DollarOutlined style={{color: '#1976d2'}}/>
                                                <span style={{
                                                    fontWeight: 600,
                                                    fontSize: '14px'
                                                }}>Service Summary</span>
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
                                                        {formatCurrency(request.price)}
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
                                                        {request.finalDesignQuotation.deliveryWithIn} days
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
                                        {request.finalDesignQuotation.note && (
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
                                                    <strong>Note:</strong> {request.finalDesignQuotation.note}
                                                </Text>
                                            </Box>
                                        )}
                                    </Card>
                                )}

                                {/* Logo Design */}
                                {request.logoImage && (
                                    <Row gutter={[8, 8]} style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: '16px',
                                        background: 'white'
                                    }}>
                                        <Col span={24}>
                                            <Space direction="vertical" size="small" style={{width: '100%'}}>
                                                <Space>
                                                    <PictureOutlined style={{color: '#1976d2'}}/>
                                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Logo Image</span>
                                                </Space>
                                                <MuiBox sx={{display: 'flex', justifyContent: 'center', p: 1}}>
                                                    <DisplayImage
                                                        imageUrl={request.logoImage}
                                                        alt="Logo Design"
                                                        width="150px"
                                                        height="150px"
                                                    />
                                                </MuiBox>
                                            </Space>
                                        </Col>
                                    </Row>
                                )}
                            </MuiBox>
                        </Col>

                        {/* Right Column - Uniform Items */}
                        <Col span={12}>
                            <Row gutter={[8, 8]} style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                padding: '16px',
                                background: 'white',
                                height: 'fit-content'
                            }}>
                                <Col span={24}>
                                    <Space direction="vertical" size="small" style={{width: '100%'}}>
                                        <Space>
                                            <FileTextOutlinedIcon style={{color: '#1976d2'}}/>
                                            <span style={{
                                                fontWeight: 600,
                                                fontSize: '14px'
                                            }}>Uniform Items ({request.items?.length || 0})</span>
                                        </Space>
                                        <Row gutter={[12, 12]}>
                                            {request.items?.map((item, index) => (
                                                <Col span={12} key={index}>
                                                    <MuiBox sx={{
                                                        p: 2,
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: 8,
                                                        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}>
                                                        {/* Header */}
                                                        <MuiBox sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mb: 1.5
                                                        }}>
                                                            <MuiBox sx={{
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
                                                            </MuiBox>
                                                            <MuiBox sx={{flex: 1}}>
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
                                                            </MuiBox>
                                                        </MuiBox>

                                                        {/* Details */}
                                                        <MuiBox sx={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 0.5
                                                        }}>
                                                            <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                                Fabric: {item.fabricName}
                                                            </Text>

                                                            <Space>
                                                                <Text style={{fontSize: '11px', color: '#475569'}}>
                                                                    Color: {item.color}
                                                                </Text>
                                                                <MuiBox sx={{
                                                                    width: 10,
                                                                    height: 10,
                                                                    borderRadius: '50%',
                                                                    bgcolor: item.color,
                                                                    border: '1px solid #e0e0e0'
                                                                }}/>

                                                            </Space>

                                                            {item.logoPosition && (
                                                                <Space>
                                                                    <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                                        Logo: {item.logoPosition}
                                                                    </Text>
                                                                </Space>
                                                            )}

                                                            {item.note && (
                                                                <Text style={{
                                                                    fontSize: '10px',
                                                                    fontStyle: 'italic',
                                                                    color: '#64748b'
                                                                }}>
                                                                    Note: {item.note}
                                                                </Text>
                                                            )}
                                                        </MuiBox>

                                                        {/* Sample Images */}
                                                        {item.sampleImages && item.sampleImages.length > 0 && (
                                                            <MuiBox
                                                                sx={{mt: 1.5, pt: 1, borderTop: '1px solid #f1f5f9'}}>
                                                                <Text style={{
                                                                    fontSize: '9px',
                                                                    fontWeight: 600,
                                                                    mb: 0.5,
                                                                    display: 'block',
                                                                    color: '#475569',
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Sample Images
                                                                </Text>
                                                                <MuiBox
                                                                    sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                                                                    {item.sampleImages.map((image, imgIndex) => (
                                                                        <DisplayImage
                                                                            key={imgIndex}
                                                                            imageUrl={image.url}
                                                                            alt={`Sample ${imgIndex + 1}`}
                                                                            width="32px"
                                                                            height="32px"
                                                                        />
                                                                    ))}
                                                                </MuiBox>
                                                            </MuiBox>
                                                        )}
                                                    </MuiBox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Space>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* Feedback */}
                    {request.feedback && request.feedback !== '' && (
                        <Row gutter={[8, 8]} style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #fff3cd 0%, #ffffff 100%)'
                        }}>
                            <Col span={24}>
                                <Space direction="vertical" size="small" style={{width: '100%'}}>
                                    <Space>
                                        <InfoCircleOutlinedIcon style={{color: '#1976d2'}}/>
                                        <span style={{fontWeight: 600, fontSize: '14px'}}>Feedback</span>
                                    </Space>
                                    <MuiBox
                                        sx={{p: 1.5, bgcolor: '#fff3cd', borderRadius: 6, border: '1px solid #ffeaa7'}}>
                                        <Text style={{color: '#856404', fontSize: '12px'}}>
                                            {request.feedback}
                                        </Text>
                                    </MuiBox>
                                </Space>
                            </Col>
                        </Row>
                    )}
                </MuiBox>
            </DialogContent>
            <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                <Button onClick={onCancel}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function UseDesignChatMessages(roomId) {
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
            user: auth.currentUser?.displayName || "User",
            room: roomId,
        });
    };

    return {chatMessages, sendMessage, setChatMessages};
}

// New RevisionRequestModal component
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

function RevisionRequestModal({visible, onCancel, onSubmit, selectedDeliveryId, remainingRevisions}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (!visible) {
            form.resetFields();
        }
    }, [visible, form]);

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                onSubmit({...values, deliveryId: selectedDeliveryId});
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <EditOutlined style={{color: '#1976d2', fontSize: '18px'}}/>
                    <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                        Request Revision
                    </Typography.Title>
                    <Chip
                        label={`${parseID(selectedDeliveryId, 'dd') || 'N/A'}`}
                        color="primary"
                        size="small"
                        style={{backgroundColor: '#1976d2'}}
                    />
                </Box>
            }
            open={visible}
            onCancel={onCancel}
            onOk={remainingRevisions > 0 ? handleOk : undefined}
            okText="Submit Revision Request"
            cancelText="Cancel"
            okButtonProps={{
                disabled: remainingRevisions === 0,
                style: {
                    backgroundColor: remainingRevisions === 0 ? '#d1d5db' : '#1976d2',
                    borderColor: remainingRevisions === 0 ? '#d1d5db' : '#1976d2',
                    color: remainingRevisions === 0 ? '#6b7280' : 'white'
                }
            }}
            centered
            width={600}
            styles={{
                body: {padding: '24px'},
                header: {
                    borderBottom: '1px solid #e2e8f0',
                    padding: '20px 24px'
                }
            }}
        >
            {remainingRevisions === 0 ? (
                <Box sx={{
                    p: 3,
                    backgroundColor: '#fef2f2',
                    borderRadius: 2,
                    border: '1px solid #fca5a5',
                    textAlign: 'center'
                }}>
                    <Typography.Text style={{color: '#dc2626', fontSize: '16px', fontWeight: 600}}>
                        No revisions remaining!
                    </Typography.Text>
                    <Typography.Text style={{color: '#991b1b', fontSize: '14px', display: 'block', mt: 1}}>
                        You have used all available revisions for this design request.
                    </Typography.Text>
                </Box>
            ) : (
                <>
                    <Box sx={{
                        p: 2,
                        backgroundColor: '#fef3c7',
                        borderRadius: 2,
                        border: '1px solid #fde68a',
                        mb: 2
                    }}>
                        <Typography.Text style={{color: '#92400e', fontSize: '14px', fontWeight: 600}}>
                            Remaining revisions: {remainingRevisions}
                        </Typography.Text>
                    </Box>
                    <Form
                        form={form}
                        layout="vertical"
                        name="revision_request_form"
                    >
                        <Form.Item
                            name="revisionDescription"
                            label="Describe your revision request:"
                            rules={[{required: true, message: 'Please describe your revision!'}]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="e.g., Change the color of the logo to blue, adjust the font size, modify the layout..."
                                style={{
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    resize: 'none',
                                    borderRadius: '8px'
                                }}
                            />
                        </Form.Item>
                    </Form>
                </>
            )}
        </Modal>
    );
}

export default function DesignChat() {
    const [requestData, setRequestData] = useState(null);
    // const [chatMessages, setChatMessages] = useState([]);
    // const [newMessage, setNewMessage] = useState('');
    const [designDeliveries, setDesignDeliveries] = useState([]);
    const [finalDelivery, setFinalDelivery] = useState(null);
    const [isRevisionModalVisible, setIsRevisionModalVisible] = useState(false);
    const [selectedDeliveryIdForRevision, setSelectedDeliveryIdForRevision] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const [isConfirmFinalModalVisible, setIsConfirmFinalModalVisible] = useState(false);
    const [deliveryToMakeFinal, setDeliveryToMakeFinal] = useState(null);
    const [isFinalDesignSet, setIsFinalDesignSet] = useState(false);
    const [isDesignDetailModalVisible, setIsDesignDetailModalVisible] = useState(false);
    const [isDeliveryDetailModalVisible, setIsDeliveryDetailModalVisible] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [loadingDeliveries, setLoadingDeliveries] = useState(false);
    const [revisionRequests, setRevisionRequests] = useState([]);
    const [loadingRevisionRequests, setLoadingRevisionRequests] = useState(false);
    const roomId = requestData?.id;
    const {chatMessages, sendMessage, setChatMessages} = UseDesignChatMessages(roomId);
    const [newMessage, setNewMessage] = useState('');

    // Fetch design deliveries from API
    const fetchDesignDeliveries = async (designRequestId) => {
        try {
            setLoadingDeliveries(true);
            const response = await getDesignDeliveries(designRequestId);
            if (response && response.status === 200) {
                console.log("Design deliveries: ", response.data.body);
                const deliveries = response.data.body || [];
                setDesignDeliveries(deliveries);

                // Check if there's a final delivery
                const finalDelivery = deliveries.find(delivery => delivery.isFinal);
                if (finalDelivery) {
                    setFinalDelivery(finalDelivery);
                    setIsFinalDesignSet(true);
                }
            } else {
                console.log("No deliveries found or error occurred");
                setDesignDeliveries([]);
            }
        } catch (err) {
            console.error("Error fetching design deliveries:", err);
            setDesignDeliveries([]);
        } finally {
            setLoadingDeliveries(false);
        }
    };

    // Fetch request details from API
    const fetchRequestDetails = async (requestId) => {
        try {
            const response = await getDesignRequestDetailForSchool(requestId);
            if (response && response.status === 200) {
                console.log("Request details: ", response.data.body);
                const request = response.data.body;
                
                // Check if status is completed, redirect to design page
                if (request.status === 'completed') {
                    window.location.href = '/school/design';
                    return;
                }
                
                setRequestData(request);
                // Fetch deliveries and revision requests for this request
                if (request.id) {
                    fetchDesignDeliveries(request.id);
                    fetchRevisionRequests(request.id);
                }
            } else {
                console.error("Failed to fetch request details");
                window.location.href = '/school/design';
            }
        } catch (error) {
            console.error("Error fetching request details:", error);
            window.location.href = '/school/design';
        }
    };

    // Fetch revision requests from API
    const fetchRevisionRequests = async (requestId) => {
        try {
            setLoadingRevisionRequests(true);
            const response = await getUndoneRevisionRequests({requestId: requestId});
            if (response && response.status === 200) {
                console.log("Revision requests: ", response.data.body);
                setRevisionRequests(response.data.body || []);
            } else {
                console.log("No revision requests found or error occurred");
                setRevisionRequests([]);
            }
        } catch (err) {
            console.error("Error fetching revision requests:", err);
            setRevisionRequests([]);
        } finally {
            setLoadingRevisionRequests(false);
        }
    };

    useEffect(() => {
        const storedRequestId = localStorage.getItem('currentDesignRequestId');
        if (storedRequestId) {
            // Fetch request details using API
            fetchRequestDetails(storedRequestId);
        } else {
            // If no request ID in localStorage, redirect to Design Management
            window.location.href = '/school/design';
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
                    {imageUrl: reader.result, sender: 'user', timestamp: `${formattedDay}, ${formattedTime}`}
                ]);
            };
            reader.readAsDataURL(file);
        }
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prevMsg => prevMsg + emojiData.emoji);
        setShowEmojiPicker(false); // Hide picker after selecting
    };

    const handleOpenRevisionModal = (deliveryId) => {
        setSelectedDeliveryIdForRevision(deliveryId);
        setIsRevisionModalVisible(true);
    };

    const handleCloseRevisionModal = () => {
        setIsRevisionModalVisible(false);
        setSelectedDeliveryIdForRevision(null);
    };

    const handleOpenDeliveryDetailModal = (delivery) => {
        setSelectedDelivery(delivery);
        setIsDeliveryDetailModalVisible(true);
    };

    const handleCloseDeliveryDetailModal = () => {
        setIsDeliveryDetailModalVisible(false);
        setSelectedDelivery(null);
    };

    const handleOpenConfirmFinalModal = (item) => {
        setDeliveryToMakeFinal(item);
        setIsConfirmFinalModalVisible(true);
    };

    const handleCloseConfirmFinalModal = () => {
        setIsConfirmFinalModalVisible(false);
        setDeliveryToMakeFinal(null);
    };

    const handleConfirmMakeFinal = async () => {
        if (deliveryToMakeFinal) {
            try {
                // Call makeDesignFinal API
                const response = await makeDesignFinal({
                    deliveryId: deliveryToMakeFinal.id
                });

                if (response && response.status === 201) {
                    // Set final delivery data
                    setFinalDelivery(deliveryToMakeFinal);
                    setIsFinalDesignSet(true);

                    enqueueSnackbar(`'${deliveryToMakeFinal.name}' has been set as Final Delivery!`, {variant: 'success'});
                    handleCloseConfirmFinalModal();

                    // Refresh deliveries to get updated status
                    if (requestData?.id) {
                        fetchDesignDeliveries(requestData.id);
                    }

                    // Fetch latest request data from API instead of manually updating
                    try {
                        const latestResponse = await getDesignRequestDetailForSchool(requestData.id);
                        if (latestResponse && latestResponse.status === 200) {
                            const updatedRequest = latestResponse.data.body;
                            if (updatedRequest) {
                                // Check if status is completed, redirect to design page
                                if (updatedRequest.status === 'completed') {
                                    window.location.href = '/school/design';
                                    return;
                                }
                                setRequestData(updatedRequest);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching latest request data:', error);
                    }
                } else {
                    enqueueSnackbar('Failed to set final delivery. Please try again.', {variant: 'error'});
                }
            } catch (error) {
                console.error('Error setting final delivery:', error);
                enqueueSnackbar('Error setting final delivery. Please try again.', {variant: 'error'});
            }
        }
    };

    const handleMakeFinal = (deliveryItem) => {
        handleOpenConfirmFinalModal(deliveryItem);
    };

    const handleRevisionSubmit = async (values) => {
        try {
            console.log('Revision Request:', values);

            // Prepare data for createRevisionRequest API
            const revisionData = {
                deliveryId: selectedDeliveryIdForRevision,
                note: values.revisionDescription
            };

            // Call createRevisionRequest API
            const response = await createRevisionRequest(revisionData);

            if (response && response.status === 201) {
                enqueueSnackbar('Revision request submitted successfully!', {variant: 'success'});
                handleCloseRevisionModal();

                // Refresh deliveries and revision requests
                if (requestData?.id) {
                    fetchDesignDeliveries(requestData.id);
                    fetchRevisionRequests(requestData.id);

                    // Fetch latest request data from API instead of manually updating
                    try {
                        const latestResponse = await getDesignRequestDetailForSchool(requestData.id);
                        if (latestResponse && latestResponse.status === 200) {
                            const updatedRequest = latestResponse.data.body;
                            if (updatedRequest) {
                                // Check if status is completed, redirect to design page
                                if (updatedRequest.status === 'completed') {
                                    window.location.href = '/school/design';
                                    return;
                                }
                                setRequestData(updatedRequest);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching latest request data:', error);
                    }
                }
            } else {
                enqueueSnackbar('Failed to submit revision request. Please try again.', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error submitting revision request:', error);
            enqueueSnackbar('Error submitting revision request. Please try again.', {variant: 'error'});
        }
    };

    return (
        <Box sx={{
            height: 'max-content',
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: {xs: 2, md: 4}
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
                                        Design Chat
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
                                    onClick={() => setIsDesignDetailModalVisible(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        height: '40px',
                                        fontSize: '14px',
                                        fontWeight: 600,
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
                                        color: 'white',
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

                            {/* Left Half - Designer Chat */}
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
                                            <UserSwitchOutlined/>
                                        </Box>
                                        <Box>
                                            <Typography.Title level={4}
                                                              style={{margin: 0, color: '#1e293b', fontWeight: 600}}>
                                                Designer Chat
                                            </Typography.Title>
                                            <Typography.Text type="secondary"
                                                             style={{fontSize: '14px', fontWeight: 500}}>
                                                Communicate with your designer
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
                                    maxHeight: '70vh',
                                    opacity: isFinalDesignSet ? 0.6 : 1,
                                    pointerEvents: isFinalDesignSet ? 'none' : 'auto'
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
                                                        justifyContent: msg.user === (auth.currentUser?.displayName || "User") ? 'flex-end' : 'flex-start',
                                                        mb: 2
                                                    }}
                                                >
                                                    {/* ... Bubble/chat UI như cũ, chỉ đổi chỗ lấy sender/message */}
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'flex-end',
                                                        gap: 1,
                                                        maxWidth: '70%'
                                                    }}>
                                                        {msg.user !== (auth.currentUser?.displayName || "User") && (
                                                            <Avatar
                                                                size="small"
                                                                style={{backgroundColor: '#1976d2'}}
                                                                icon={<UserSwitchOutlined/>}
                                                            />
                                                        )}
                                                        <Box sx={{
                                                            p: 2,
                                                            borderRadius: 4,
                                                            backgroundColor: msg.user === (auth.currentUser?.displayName || "User")
                                                                ? 'linear-gradient(135deg, #1976d2, #42a5f5)'
                                                                : 'white',
                                                            color: msg.user === (auth.currentUser?.displayName || "User") ? 'white' : '#1e293b',
                                                            border: msg.user !== (auth.currentUser?.displayName || "User") ? '2px solid #e2e8f0' : 'none',
                                                            maxWidth: '100%',
                                                            wordWrap: 'break-word',
                                                            boxShadow: msg.user === (auth.currentUser?.displayName || "User")
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
                                                        {msg.user === (auth.currentUser?.displayName || "User") && (
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
                                    backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
                                    opacity: isFinalDesignSet ? 0.6 : 1,
                                    pointerEvents: isFinalDesignSet ? 'none' : 'auto'
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

                                {/* Design Deliveries Section */}
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
                                    {/* Deliveries Header */}
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
                                                <Box>
                                                    <Typography.Title level={4}
                                                                      style={{
                                                                          margin: 0,
                                                                          color: '#1e293b',
                                                                          fontWeight: 600
                                                                      }}>
                                                        Design Deliveries
                                                    </Typography.Title>
                                                    <Typography.Text type="secondary"
                                                                     style={{fontSize: '12px', color: '#64748b'}}>
                                                        Revisions: {requestData?.revisionTime === 9999 ? 'Unlimited' : (requestData?.revisionTime || 0)} remaining
                                                        {requestData?.revisionTime === 0 && (
                                                            <span style={{color: '#dc2626', fontWeight: 600}}> - No revisions left</span>
                                                        )}
                                                    </Typography.Text>
                                                </Box>
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
                                                            No deliveries yet. Designer will add deliveries here.
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
                                                                {!isFinalDesignSet && (
                                                                    <>
                                                                        {requestData?.revisionTime > 0 && (
                                                                            <Button
                                                                                size="small"
                                                                                icon={<EditOutlined/>}
                                                                                onClick={() => handleOpenRevisionModal(item.id)}
                                                                                style={{
                                                                                    borderRadius: '6px',
                                                                                    backgroundColor: '#722ed1',
                                                                                    borderColor: '#722ed1',
                                                                                    color: 'white',
                                                                                    flex: 1
                                                                                }}
                                                                            >
                                                                                Revision
                                                                            </Button>
                                                                        )}
                                                                        <Button
                                                                            size="small"
                                                                            icon={<CheckCircleOutlined/>}
                                                                            onClick={() => handleMakeFinal(item)}
                                                                            style={{
                                                                                borderRadius: '6px',
                                                                                backgroundColor: '#52c41a',
                                                                                borderColor: '#52c41a',
                                                                                color: 'white',
                                                                                flex: 1
                                                                            }}
                                                                        >
                                                                            Make final
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        </Paper>
                                                    ))
                                                )}
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
                                                    {requestData?.revisionTime === 0 ? 'No revisions left' : 'No revision requests'}
                                                </Typography.Text>
                                                {requestData?.revisionTime === 0 && (
                                                    <Typography.Text type="secondary"
                                                                     style={{fontSize: '12px', color: '#dc2626'}}>
                                                        You have used all available revisions
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>


                            </Box>
                        </Box>

                        {/* Bottom Row - Final Delivery */}
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: 'white',
                                borderRadius: 4,
                                border: '2px solid #52c41a',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(82, 196, 26, 0.15)',
                                position: 'relative',
                                height: 'max-content',
                                flex: 1
                            }}
                        >
                            {/* Final Delivery Header */}
                            <Box sx={{
                                py: 2,
                                px: 3,
                                borderBottom: '2px solid #e2e8f0',
                                backgroundColor: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                                position: 'relative'
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '14px',
                                        boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                                    }}>
                                        <CheckCircleOutlined/>
                                    </Box>
                                    <Typography.Title level={5}
                                                      style={{margin: 0, color: '#52c41a', fontWeight: 600}}>
                                        Final Delivery
                                    </Typography.Title>
                                </Box>
                            </Box>

                            {/* Final Delivery Content */}
                            <Box sx={{
                                p: 3,
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 'max-content'
                            }}>
                                {finalDelivery ? (
                                    <>
                                        <Typography.Title level={5} style={{margin: '0 0 8px 0', color: '#1e293b'}}>
                                            {finalDelivery.name}
                                        </Typography.Title>
                                        <Typography.Text type="secondary"
                                                         style={{fontSize: '12px', display: 'block', mb: 1}}>
                                            {finalDelivery.note || 'Final delivery selected'}
                                        </Typography.Text>
                                        <Typography.Text type="secondary"
                                                         style={{fontSize: '11px', display: 'block', mb: 2}}>
                                            {new Date(finalDelivery.submitDate).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </Typography.Text>
                                        <Button
                                            type="primary"
                                            icon={<EyeOutlined/>}
                                            onClick={() => handleOpenDeliveryDetailModal(finalDelivery)}
                                            size="small"
                                            style={{
                                                backgroundColor: '#52c41a',
                                                borderColor: '#52c41a',
                                                borderRadius: '6px',
                                                height: '32px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                marginTop: '8px'
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </>
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
                                        <FileTextOutlined style={{fontSize: '48px', opacity: 0.5}}/>
                                        <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                            No data
                                        </Typography.Text>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Container>

            <RevisionRequestModal
                visible={isRevisionModalVisible}
                onCancel={handleCloseRevisionModal}
                onSubmit={handleRevisionSubmit}
                selectedDeliveryId={selectedDeliveryIdForRevision}
                remainingRevisions={requestData?.revisionTime || 0}
            />

            <DesignDetailDialog
                visible={isDesignDetailModalVisible}
                onCancel={() => setIsDesignDetailModalVisible(false)}
                request={requestData}
            />

            <DeliveryDetailModal
                visible={isDeliveryDetailModalVisible}
                onCancel={handleCloseDeliveryDetailModal}
                delivery={selectedDelivery}
            />

            <Modal
                title={
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <CheckCircleOutlined style={{color: '#52c41a', fontSize: '18px'}}/>
                        <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                            Confirm Final Delivery
                        </Typography.Title>
                    </Box>
                }
                open={isConfirmFinalModalVisible}
                onCancel={handleCloseConfirmFinalModal}
                onOk={handleConfirmMakeFinal}
                okText="Confirm"
                cancelText="Cancel"
                okButtonProps={{
                    danger: true,
                    style: {backgroundColor: '#52c41a', borderColor: '#52c41a'}
                }}
                centered
                styles={{
                    body: {padding: '24px'},
                    header: {
                        borderBottom: '1px solid #e2e8f0',
                        padding: '20px 24px'
                    }
                }}
            >
                <Typography.Text style={{fontSize: '14px', color: '#475569'}}>
                    Are you sure you want to set this design as the final delivery? This action cannot be reversed.
                </Typography.Text>
                {deliveryToMakeFinal && (
                    <Box sx={{
                        mt: 2,
                        p: 2,
                        backgroundColor: '#f6ffed',
                        borderRadius: 2,
                        border: '1px solid #b7eb8f'
                    }}>
                        <Typography.Text strong style={{color: '#52c41a'}}>
                            Selected Design: {deliveryToMakeFinal.name}
                        </Typography.Text>
                    </Box>
                )}
            </Modal>
        </Box>
    );
}