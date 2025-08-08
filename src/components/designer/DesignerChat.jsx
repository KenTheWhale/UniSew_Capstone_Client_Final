import React, {useEffect, useState} from 'react';
import {Avatar, Button, Form, Input, Typography, Select, Radio, Card, Space, Tag, Row, Col, Divider, Rate} from 'antd';
import {
    CheckCircleOutlined,
    EyeOutlined,
    FileTextOutlined,
    MessageOutlined,
    BankOutlined,
    SendOutlined,
    SmileOutlined,
    UploadOutlined,
    UserOutlined,
    InfoCircleOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    PictureOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    ShopOutlined
} from '@ant-design/icons';
import {Box, Chip, Container, Paper, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import {useSnackbar} from 'notistack';
import {parseID} from '../../utils/ParseIDUtil.jsx';
import {addDoc, collection, onSnapshot, query, serverTimestamp, where} from 'firebase/firestore';
import {auth, db} from "../../configs/firebase-config.jsx";
import {PiShirtFoldedFill, PiPantsFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DisplayImage from '../ui/DisplayImage.jsx';

const {TextArea} = Input;

// eslint-disable-next-line react-refresh/only-export-components
export function statusTag(status) {
    let color = '';
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

    const formatDeadline = (deadlineString) => {
        const date = new Date(deadlineString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <>
            <Dialog
                open={visible}
                onClose={onCancel}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        maxHeight: '85vh'
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
                                                <span style={{fontWeight: 600, fontSize: '14px'}}>School Information</span>
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
                                                size={48}
                                                src={request.school?.avatar}
                                                style={{
                                                    border: '2px solid #1976d2',
                                                    backgroundColor: '#1976d2'
                                                }}
                                            >
                                                {request.school?.name?.charAt(0) || 'S'}
                                            </Avatar>
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
                                                        <EnvironmentOutlined style={{color: '#64748b', fontSize: '12px'}}/>
                                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                            Location: {request.school?.address || 'Available'}
                                                        </Text>
                                                    </Space>
                                                    <Space>
                                                        <ClockCircleOutlined style={{color: '#1976d2', fontSize: '12px'}}/>
                                                        <Text style={{fontSize: '12px', color: '#64748b'}}>
                                                            Project Timeline: Active
                                                        </Text>
                                                    </Space>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Card>

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
                                                <Col span={6} style={{display: 'flex'}}>
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
                                                <Col span={6} style={{display: 'flex'}}>
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
                                                <Col span={6} style={{display: 'flex'}}>
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
                                                <Col span={6} style={{display: 'flex'}}>
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: '#fef2f2',
                                                        borderRadius: 6,
                                                        border: '1px solid #fca5a5',
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Text style={{
                                                            fontSize: '10px',
                                                            color: '#991b1b',
                                                            fontWeight: 600
                                                        }}>
                                                            DEADLINE
                                                        </Text>
                                                        <Title level={5} style={{
                                                            margin: '4px 0 0 0',
                                                            color: '#991b1b',
                                                            fontWeight: 700
                                                        }}>
                                                            {request.finalDesignQuotation?.acceptanceDeadline ? formatDeadline(request.finalDesignQuotation.acceptanceDeadline) : 'TBD'}
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
                                                        <strong>Note:</strong> {request.finalDesignQuotation.note}
                                                    </Text>
                                                </Box>
                                            )}
                                        </Card>
                                    )}

                                    {/* Logo Design */}
                                    {request.logoImage && request.logoImage !== '' && (
                                        <Card 
                                            title={
                                                <Space>
                                                    <PictureOutlined style={{color: '#1976d2'}}/>
                                                    <span style={{fontWeight: 600, fontSize: '14px'}}>Logo Reference</span>
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
                                            <span style={{fontWeight: 600, fontSize: '14px'}}>Design Requirements ({request.items?.length || 0})</span>
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
                                                            <Text strong style={{fontSize: '13px', color: '#1e293b', display: 'block'}}>
                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                            </Text>
                                                            <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                                {item.category.toUpperCase()}
                                                            </Text>
                                                        </Box>
                                                    </Box>

                                                    {/* Details */}
                                                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                                        <Text style={{fontSize: '11px', color: '#64748b'}}>
                                                            Fabric: {item.fabricName}
                                                        </Text>
                                                        
                                                        <Space>
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
                                                        </Space>

                                                        {item.logoPosition && (
                                                            <Space>
                                                                <Text style={{fontSize: '10px', color: '#64748b'}}>
                                                                    Logo: {item.logoPosition}
                                                                </Text>
                                                            </Space>
                                                        )}

                                                        {item.note && (
                                                            <Text style={{fontSize: '10px', fontStyle: 'italic', color: '#64748b', mt: 0.5}}>
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
                    <Button onClick={onCancel}>
                        Close
                    </Button>
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
function DeliverySubmissionModal({visible, onCancel, onSubmit, designDeliveries}) {
    const [form] = Form.useForm();
    const [deliveryType, setDeliveryType] = useState('normal');

    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setDeliveryType('normal');
        }
    }, [visible, form]);

    // Check if there are existing deliveries to allow revision type
    const hasExistingDeliveries = designDeliveries && designDeliveries.length > 0;

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                onSubmit({...values, deliveryType});
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Dialog
            open={visible}
            onClose={onCancel}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    maxHeight: '85vh'
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
            >
                {/* Delivery Type Selection */}
                <Form.Item
                    label="Delivery Type:"
                    required
                >
                    <Radio.Group 
                        value={deliveryType} 
                        onChange={(e) => setDeliveryType(e.target.value)}
                        disabled={!hasExistingDeliveries}
                    >
                        <Radio value="normal" style={{marginBottom: '8px'}}>
                            Normal Delivery
                        </Radio>
                        <Radio value="revision" disabled={!hasExistingDeliveries}>
                            Revision Delivery
                        </Radio>
                    </Radio.Group>
                    {!hasExistingDeliveries && (
                        <Typography.Text type="secondary" style={{fontSize: '12px', display: 'block', marginTop: '4px'}}>
                            Revision type will be available after you have at least one delivery
                        </Typography.Text>
                    )}
                </Form.Item>

                {/* Revision Selection - Only show if revision type is selected */}
                {deliveryType === 'revision' && hasExistingDeliveries && (
                    <Form.Item
                        name="revisionOf"
                        label="Revision of:"
                        rules={[{required: true, message: 'Please select which delivery to revise!'}]}
                    >
                        <Select
                            placeholder="Select a delivery to revise..."
                            style={{borderRadius: '8px'}}
                        >
                            {designDeliveries.map(delivery => (
                                <Select.Option key={delivery.id} value={delivery.id}>
                                    {delivery.name} (Delivered: {delivery.date})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item
                    name="deliveryName"
                    label="Delivery Name:"
                    rules={[{required: true, message: 'Please enter delivery name!'}]}
                >
                    <Input
                        placeholder={deliveryType === 'revision' ? "e.g., Revision 1.0, Updated Design v2.1..." : "e.g., Concept 1.0, Final Design v2.0..."}
                        style={{
                            borderRadius: '8px'
                        }}
                    />
                </Form.Item>
                <Form.Item
                    name="deliveryDescription"
                    label="Description:"
                    rules={[{required: true, message: 'Please describe your delivery!'}]}
                >
                    <TextArea
                        rows={4}
                        placeholder={deliveryType === 'revision' ? "Describe the changes and improvements made to the previous version..." : "Describe the design changes, improvements, or new concepts included in this delivery..."}
                        style={{
                            maxHeight: '120px',
                            overflowY: 'auto',
                            resize: 'none',
                            borderRadius: '8px'
                        }}
                    />
                </Form.Item>
                <Form.Item
                    name="deliveryLink"
                    label="Design Link:"
                    rules={[{required: true, message: 'Please provide the design link!'}]}
                >
                    <Input
                        placeholder="https://figma.com/design-link..."
                        style={{
                            borderRadius: '8px'
                        }}
                    />
                </Form.Item>
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
    const [designDeliveries, setDesignDeliveries] = useState([
        {id: 1, name: 'Concept 1.0', link: '#', date: '2024-01-15', status: 'delivered'},
        {id: 2, name: 'Concept 2.0', link: '#', date: '2024-01-18', status: 'delivered'},
    ]);
    const [finalDelivery, setFinalDelivery] = useState({
        name: 'Final Design v3.0',
        link: '#',
        description: 'The approved final design including all revisions.',
        date: '2024-01-20'
    });
    const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const [isConfirmFinalModalVisible, setIsConfirmFinalModalVisible] = useState(false);
    const [deliveryToMakeFinal, setDeliveryToMakeFinal] = useState(null);
    const [isFinalDesignSet, setIsFinalDesignSet] = useState(false);
    const [isDesignDetailModalVisible, setIsDesignDetailModalVisible] = useState(false);
    const roomId = requestData?.id;
    const {chatMessages, sendMessage} = useDesignerChatMessages(roomId);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const storedRequest = localStorage.getItem('currentDesignRequest');
        if (storedRequest) {
            setRequestData(JSON.parse(storedRequest));
        } else {
            // If no request data in localStorage, redirect to Designer Dashboard
            window.location.href = '/designer/dashboard';
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

    const handleOpenDeliveryModal = () => {
        setIsDeliveryModalVisible(true);
    };

    const handleCloseDeliveryModal = () => {
        setIsDeliveryModalVisible(false);
    };

    const handleOpenConfirmFinalModal = (item) => {
        setDeliveryToMakeFinal(item);
        setIsConfirmFinalModalVisible(true);
    };

    const handleCloseConfirmFinalModal = () => {
        setIsConfirmFinalModalVisible(false);
        setDeliveryToMakeFinal(null);
    };

    const handleOpenDesignDetailModal = () => {
        setIsDesignDetailModalVisible(true);
    };

    const handleCloseDesignDetailModal = () => {
        setIsDesignDetailModalVisible(false);
    };

    const handleConfirmMakeFinal = () => {
        if (deliveryToMakeFinal) {
            setFinalDelivery({
                name: deliveryToMakeFinal.name,
                link: deliveryToMakeFinal.link,
                description: `Final version based on ${deliveryToMakeFinal.name}.`,
                date: new Date().toISOString().split('T')[0]
            });
            enqueueSnackbar(`'${deliveryToMakeFinal.name}' has been set as Final Delivery!`, {variant: 'success'});
            setIsFinalDesignSet(true); // Set state to disable buttons
            handleCloseConfirmFinalModal();
        }
    };

    const handleMakeFinal = (deliveryItem) => {
        handleOpenConfirmFinalModal(deliveryItem);
    };

    const handleDeliverySubmit = (values) => {
        console.log('Delivery Submission:', values);
        // Add new delivery to the list
        const newDelivery = {
            id: designDeliveries.length + 1,
            name: values.deliveryName,
            link: values.deliveryLink,
            description: values.deliveryDescription,
            date: new Date().toISOString().split('T')[0],
            status: 'delivered',
            type: values.deliveryType || 'normal',
            revisionOf: values.revisionOf || null
        };
        setDesignDeliveries(prev => [...prev, newDelivery]);
        enqueueSnackbar('Delivery submitted successfully!', {variant: 'success'});
        handleCloseDeliveryModal();
    };

    return (
        <Box sx={{
            height: 'max-content',
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: {xs: 2, md: 4},
            marginBottom: '2vh'
        }}>
            <Container maxWidth="xl">
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
                                    label="ACTIVE"
                                    color="success"
                                    size="large"
                                    style={{
                                        backgroundColor: '#52c41a',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        padding: '8px 16px'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Main Content */}
                    <Box sx={{display: 'flex', gap: 3, flex: 1, minHeight: 0, height: '90vh'}}>

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
                                        <Typography.Text type="secondary" style={{fontSize: '14px', fontWeight: 500}}>
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
                                                            sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
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

                        {/* Right Half - Deliveries and Final Container */}
                        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 3}}>

                            {/* Design Deliveries Section */}
                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 2,
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
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
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
                                                              style={{margin: 0, color: '#1e293b', fontWeight: 600}}>
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
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                        {designDeliveries.map(item => (
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
                                                    <Box>
                                                        <Typography.Title level={5}
                                                                          style={{margin: 0, color: '#1e293b'}}>
                                                            {item.name}
                                                        </Typography.Title>
                                                        <Typography.Text type="secondary" style={{fontSize: '12px'}}>
                                                            Delivered: {item.date}
                                                        </Typography.Text>
                                                    </Box>
                                                </Box>

                                                <Box sx={{display: 'flex', gap: 1, justifyContent: 'space-between'}}>
                                                    <Button
                                                        size="small"
                                                        icon={<EyeOutlined/>}
                                                        style={{borderRadius: '6px', flex: 1}}
                                                    >
                                                        View
                                                    </Button>
                                                </Box>
                                            </Paper>
                                        ))}
                                        
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
                                </Box>
                            </Paper>

                            {/* Final Delivery Section */}
                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'white',
                                    borderRadius: 4,
                                    border: '2px solid #52c41a',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 32px rgba(82, 196, 26, 0.15)',
                                    position: 'relative'
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
                                    p: 2,
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    marginBottom: '2vh'
                                }}>
                                    <Typography.Title level={5} style={{margin: '0 0 8px 0', color: '#1e293b'}}>
                                        {finalDelivery.name}
                                    </Typography.Title>
                                    <Typography.Text type="secondary"
                                                     style={{fontSize: '12px', display: 'block', mb: 1}}>
                                        {finalDelivery.description}
                                    </Typography.Text>
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined/>}
                                        href={finalDelivery.link}
                                        target="_blank"
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
                                        View Final Design
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            </Container>

            <DeliverySubmissionModal
                visible={isDeliveryModalVisible}
                onCancel={handleCloseDeliveryModal}
                onSubmit={handleDeliverySubmit}
                designDeliveries={designDeliveries}
            />

            <Dialog
                open={isConfirmFinalModalVisible}
                onClose={handleCloseConfirmFinalModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        maxHeight: '85vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    color: 'white'
                }}>
                    <CheckCircleOutlined style={{color: 'white', fontSize: '18px'}}/>
                    <span style={{fontWeight: 600, fontSize: '16px'}}>
                        Confirm Final Delivery
                    </span>
                </DialogTitle>
                <DialogContent sx={{padding: '24px'}}>
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
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                    <Button onClick={handleCloseConfirmFinalModal}>
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleConfirmMakeFinal}
                        style={{
                            backgroundColor: '#52c41a',
                            borderColor: '#52c41a'
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <DesignDetailDialog
                visible={isDesignDetailModalVisible}
                onCancel={handleCloseDesignDetailModal}
                request={requestData}
            />
        </Box>
    );
}