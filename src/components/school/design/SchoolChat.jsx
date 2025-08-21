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
    Radio,
    Rate,
    Row,
    Space,
    Tag,
    Typography,
    Badge
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
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where,
    writeBatch,
    getDocs
} from 'firebase/firestore';
import {auth, db} from "../../../configs/FirebaseConfig.jsx";
import {
    createRevisionRequest,
    getDesignDeliveries,
    getDesignRequestDetailForSchool,
    getUndoneRevisionRequests,
    makeDesignFinal
} from "../../../services/DesignService.jsx";
import {getPaymentUrl} from "../../../services/PaymentService.jsx";
import {PiPantsFill, PiShirtFoldedFill} from "react-icons/pi";
import {GiSkirt} from "react-icons/gi";
import DisplayImage from '../../ui/DisplayImage.jsx';
import RequestDetailPopup from '../popup/RequestDetailPopup.jsx';

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
            color = 'success';
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

// Format design category for display across components
const formatCategory = (category) => {
    const v = (category || '').toLowerCase();
    return v === 'pe' ? 'physical education' : (category || '');
};

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


export function UseDesignChatMessages(roomId) {
    const [chatMessages, setChatMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const me = auth.currentUser?.email || "";

    useEffect(() => {
        if (!roomId) return;
        const qAll = query(collection(db, "messages"), where("room", "==", roomId));

        const unsubAll = onSnapshot(qAll, (snap) => {
            const msgs = [];
            snap.forEach((d) => msgs.push({...d.data(), id: d.id}));
            msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setChatMessages(msgs);
        });

        // stream đếm chưa đọc từ đối phương
        const qUnread = query(
            collection(db, "messages"),
            where("room", "==", roomId),
            where("read", "==", false)
        );
        const unsubUnread = onSnapshot(qUnread, (snap) => {
            let count = 0;
            snap.forEach((d) => {
                const data = d.data();
                if (data.senderEmail !== me) count++;
            });
            setUnreadCount(count);
        });

        return () => {
            unsubAll();
            unsubUnread();
        };
    }, [roomId, me]);

    const sendMessage = async (textOrPayload) => {
        if (!roomId) return;
        const email = auth.currentUser?.email || "designer@unknown";
        const displayName = auth.currentUser?.displayName || "Designer";

        const payload =
            typeof textOrPayload === "string"
                ? {text: textOrPayload}
                : {...textOrPayload};

        await addDoc(collection(db, "messages"), {
            ...payload,                // {text?, imageUrl? ...}
            createdAt: serverTimestamp(),
            user: displayName,
            senderEmail: email,
            room: roomId,
            read: false,               // 👈 mặc định chưa đọc
        });

        await setDoc(
            doc(db, "chatRooms", roomId),
            {lastMessage: payload.text || "[image]", updatedAt: serverTimestamp()},
            {merge: true}
        );
    };

    const markAsRead = async () => {
        if (!roomId) return;
        const q = query(
            collection(db, "messages"),
            where("room", "==", roomId),
            where("read", "==", false)
        );
        const snap = await getDocs(q);
        if (snap.empty) return;

        const batch = writeBatch(db);
        let count = 0;
        snap.forEach((d) => {
            const data = d.data();
            if (data.senderEmail !== me) {
                batch.update(doc(db, "messages", d.id), {
                    read: true,
                    readAt: serverTimestamp(),
                });
                count++;
            }
        });
        if (count > 0) await batch.commit();
    };

    return {chatMessages, unreadCount, sendMessage, markAsRead};
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
                        {/* Group items by gender */}
                        {(() => {
                            const boyItems = delivery.deliveryItems?.filter(item =>
                                item.designItem?.gender?.toLowerCase() === 'boy'
                            ) || [];
                            const girlItems = delivery.deliveryItems?.filter(item =>
                                item.designItem?.gender?.toLowerCase() === 'girl'
                            ) || [];
                            const otherItems = delivery.deliveryItems?.filter(item => {
                                const gender = item.designItem?.gender?.toLowerCase();
                                return gender !== 'boy' && gender !== 'girl';
                            }) || [];

                            return (
                                <>
                                    {/* Boy Section */}
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
                                                        {/* Item Header */}
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
                                                                <Typography.Text
                                                                    style={{color: '#64748b', fontSize: '12px'}}>
                                                                    Item #{index + 1}
                                                                </Typography.Text>
                                                            </Box>
                                                        </Box>

                                                        {/* Item Details Grid */}
                                                        <Row gutter={[24, 16]}>
                                                            <Col
                                                                span={item.designItem?.type?.toLowerCase().includes('shirt') ? 8 : 12}>
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
                                                                        mt: 1
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
                                                            <Col
                                                                span={item.designItem?.type?.toLowerCase().includes('shirt') ? 8 : 12}>
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
                                                            {item.designItem?.type?.toLowerCase().includes('shirt') && (
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
                                                                            {item.designItem?.logoPosition || 'N/A'}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Col>
                                                            )}
                                                        </Row>


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

                                    {/* Girl Section */}
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
                                                        {/* Item Header */}
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
                                                                <Typography.Text
                                                                    style={{color: '#64748b', fontSize: '12px'}}>
                                                                    Item #{index + 1}
                                                                </Typography.Text>
                                                            </Box>
                                                        </Box>

                                                        {/* Item Details Grid */}
                                                        <Row gutter={[24, 16]}>
                                                            <Col
                                                                span={item.designItem?.type?.toLowerCase().includes('shirt') ? 8 : 12}>
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
                                                                        mt: 1
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
                                                            <Col
                                                                span={item.designItem?.type?.toLowerCase().includes('shirt') ? 8 : 12}>
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
                                                            {item.designItem?.type?.toLowerCase().includes('shirt') && (
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
                                                                            {item.designItem?.logoPosition || 'N/A'}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Col>
                                                            )}
                                                        </Row>

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

                                    {/* Others Section */}
                                    {otherItems.length > 0 && (
                                        <Box sx={{mb: 3}}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 2,
                                                p: 2,
                                                backgroundColor: '#f3f4f6',
                                                borderRadius: 2,
                                                border: '1px solid #d1d5db'
                                            }}>
                                                <Typography.Title level={4} style={{
                                                    margin: 0,
                                                    color: '#374151',
                                                    fontWeight: 700
                                                }}>
                                                    OTHERS
                                                </Typography.Title>
                                                <Tag color="default"
                                                     style={{margin: 0, fontSize: '12px', fontWeight: 600}}>
                                                    {otherItems.length} cloth{otherItems.length !== 1 ? 'es' : ''}
                                                </Tag>
                                            </Box>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                {otherItems.map((item, index) => (
                                                    <Box key={`other-${index}`} sx={{
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
                                                                <Typography.Text
                                                                    style={{color: '#64748b', fontSize: '12px'}}>
                                                                    Item #{index + 1}
                                                                </Typography.Text>
                                                            </Box>
                                                        </Box>

                                                        {/* Item Details Grid */}
                                                        <Row gutter={[24, 16]}>
                                                            <Col
                                                                span={item.designItem?.type?.toLowerCase().includes('shirt') ? 8 : 12}>
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
                                                                        mt: 1
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
                                                            <Col
                                                                span={item.designItem?.type?.toLowerCase().includes('shirt') ? 8 : 12}>
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
                                                            {item.designItem?.type?.toLowerCase().includes('shirt') && (
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
                                                                            {item.designItem?.logoPosition || 'N/A'}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Col>
                                                            )}
                                                        </Row>

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
    const [formKey, setFormKey] = useState(0);
    const [initialValues, setInitialValues] = useState({revisionDescription: ''});

    useEffect(() => {
        if (!visible) {
            setInitialValues({revisionDescription: ''});
            setFormKey(k => k + 1);
        }
    }, [visible]);

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
                    <EditOutlined style={{color: '#2e7d32', fontSize: '18px'}}/>
                    <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                        Request Revision
                    </Typography.Title>
                    <Chip
                        label={`${parseID(selectedDeliveryId, 'dd') || 'N/A'}`}
                        color="success"
                        size="small"
                        style={{backgroundColor: '#2e7d32'}}
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
                    backgroundColor: remainingRevisions === 0 ? '#d1d5db' : '#2e7d32',
                    borderColor: remainingRevisions === 0 ? '#d1d5db' : '#2e7d32',
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
            <Form
                key={formKey}
                form={form}
                layout="vertical"
                name="revision_request_form"
                initialValues={initialValues}
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
                )}
            </Form>
        </Modal>
    );
}

function BuyMoreRevisionsModal({visible, onCancel, onSubmit, extraRevisionPrice}) {
    const [form] = Form.useForm();
    const [formKey, setFormKey] = useState(0);
    const [initialValues, setInitialValues] = useState({revisionQuantity: 1});
    const [revisionQuantity, setRevisionQuantity] = useState(1);

    useEffect(() => {
        if (!visible) {
            setInitialValues({revisionQuantity: 1});
            setRevisionQuantity(1);
            setFormKey(k => k + 1);
        }
    }, [visible]);

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                const totalPrice = calculatePrice(values.revisionQuantity);
                if (totalPrice > 200000000) {
                    // Show error message
                    return;
                }
                onSubmit(values);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    // Calculate price based on quantity using extraRevisionPrice from API
    const calculatePrice = (quantity) => {
        if (quantity === 9999) return extraRevisionPrice * 20; // Unlimited = 20x normal price
        return quantity * extraRevisionPrice;
    };

    // Calculate max quantity allowed (200 million VND limit)
    const maxQuantityAllowed = () => {
        const maxPrice = 200000000; // 200 million VND
        return Math.floor(maxPrice / extraRevisionPrice);
    };

    const handleQuantityChange = (value) => {
        setRevisionQuantity(value);
        form.setFieldsValue({revisionQuantity: value});
    };

    return (
        <Modal
            title={
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <DollarOutlined style={{color: '#2e7d32', fontSize: '18px'}}/>
                    <Typography.Title level={5} style={{margin: 0, color: '#1e293b'}}>
                        Buy More Revisions
                    </Typography.Title>
                </Box>
            }
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Purchase Revisions"
            cancelText="Cancel"
            okButtonProps={{
                style: {
                    backgroundColor: '#2e7d32',
                    borderColor: '#2e7d32',
                    color: 'white'
                }
            }}
            centered
            width={700}
            styles={{
                body: {padding: '24px'},
                header: {
                    borderBottom: '1px solid #e2e8f0',
                    padding: '20px 24px'
                }
            }}
        >
            <Form
                key={formKey}
                form={form}
                layout="vertical"
                name="buy_revisions_form"
                initialValues={initialValues}
            >
                <Box sx={{mb: 3}}>
                    <Typography.Text style={{fontSize: '14px', color: '#475569'}}>
                        You have used all available revisions. Choose a package to continue requesting revisions:
                    </Typography.Text>
                </Box>

                <Form.Item
                    name="revisionQuantity"
                    label="Number of Revisions:"
                    rules={[
                        {required: true, message: 'Please enter number of revisions!'},
                        {
                            type: 'number',
                            min: 1,
                            max: maxQuantityAllowed(),
                            message: `Quantity must be between 1 and ${maxQuantityAllowed()} (max 200 million VND)!`
                        }
                    ]}
                >
                    <Input
                        type="number"
                        min={1}
                        max={maxQuantityAllowed()}
                        placeholder={`Enter number of revisions (1-${maxQuantityAllowed()})`}
                        style={{borderRadius: '8px'}}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        autoComplete="off"
                    />
                </Form.Item>

                {/* Price Display */}
                <Box sx={{
                    p: 2,
                    backgroundColor: '#f6ffed',
                    borderRadius: 2,
                    border: '1px solid #b7eb8f',
                    mb: 2
                }}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography.Text strong style={{fontSize: '14px', color: '#1e293b'}}>
                            Total Price:
                        </Typography.Text>
                        <Typography.Text strong style={{fontSize: '18px', color: '#2e7d32'}}>
                            {calculatePrice(revisionQuantity).toLocaleString('vi-VN')} VND
                        </Typography.Text>
                    </Box>
                    <Typography.Text style={{fontSize: '12px', color: '#64748b', display: 'block', mt: 0.5}}>
                        {revisionQuantity === 9999 ? 'Unlimited revisions' : `${revisionQuantity} revision${revisionQuantity !== 1 ? 's' : ''} × ${extraRevisionPrice?.toLocaleString('vi-VN') || '0'} VND each`}
                    </Typography.Text>
                    {calculatePrice(revisionQuantity) > 200000000 && (
                        <Typography.Text
                            style={{fontSize: '12px', color: '#dc2626', display: 'block', mt: 0.5, fontWeight: 600}}>
                            ⚠️ Total price exceeds 200 million VND limit!
                        </Typography.Text>
                    )}
                </Box>

                <Box sx={{
                    p: 2,
                    backgroundColor: '#e6f7ff',
                    borderRadius: 2,
                    border: '1px solid #91d5ff',
                    mt: 2
                }}>
                    <Typography.Text style={{fontSize: '12px', color: '#1890ff'}}>
                        💡 Price: {extraRevisionPrice?.toLocaleString('vi-VN') || '0'} VND per revision.
                        Maximum {maxQuantityAllowed()} revisions allowed (200 million VND limit).
                    </Typography.Text>
                </Box>
            </Form>
        </Modal>
    );
}

export default function SchoolChat() {
    const [requestData, setRequestData] = useState(null);
    const [designDeliveries, setDesignDeliveries] = useState([]);
    const [finalDelivery, setFinalDelivery] = useState(null);
    const [isRevisionModalVisible, setIsRevisionModalVisible] = useState(false);
    const [selectedDeliveryIdForRevision, setSelectedDeliveryIdForRevision] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const [isConfirmFinalModalVisible, setIsConfirmFinalModalVisible] = useState(false);
    const [deliveryToMakeFinal, setDeliveryToMakeFinal] = useState(null);
    const [isFinalDesignSet, setIsFinalDesignSet] = useState(false);
    const [isRequestDetailPopupVisible, setIsRequestDetailPopupVisible] = useState(false);
    const [isDeliveryDetailModalVisible, setIsDeliveryDetailModalVisible] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [loadingDeliveries, setLoadingDeliveries] = useState(false);
    const [revisionRequests, setRevisionRequests] = useState([]);
    const [loadingRevisionRequests, setLoadingRevisionRequests] = useState(false);
    const [isBuyMoreRevisionsModalVisible, setIsBuyMoreRevisionsModalVisible] = useState(false);
    const roomId = requestData?.id;
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isViewOnly = (isFinalDesignSet || requestData?.status === 'completed');
    const designerName = requestData?.finalDesignQuotation?.designer?.customer?.name
        || requestData?.designer?.customer?.name
        || 'Designer';
    const [isOpenButtonHover, setIsOpenButtonHover] = useState(false);

    const {chatMessages, unreadCount, sendMessage, markAsRead} = UseDesignChatMessages(roomId);
    useEffect(() => {
        if (isChatOpen && chatMessages.length) {
            markAsRead();
        }
    }, [chatMessages, isChatOpen]);


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

    const handleOpenBuyMoreRevisionsModal = () => {
        setIsBuyMoreRevisionsModalVisible(true);
    };

    const handleCloseBuyMoreRevisionsModal = () => {
        setIsBuyMoreRevisionsModalVisible(false);
    };

    const handleBuyMoreRevisions = async (values) => {
        try {
            const quantity = values.revisionQuantity;
            const extraRevisionPrice = requestData?.finalDesignQuotation?.extraRevisionPrice || 0;
            const price = quantity * extraRevisionPrice;

            // Store revision purchase details in sessionStorage for PaymentResult
            const revisionPurchaseDetails = {
                requestId: requestData?.id,
                revisionQuantity: quantity,
                extraRevisionPrice: extraRevisionPrice,
                totalAmount: price,
                requestData: requestData
            };
            sessionStorage.setItem('revisionPurchaseDetails', JSON.stringify(revisionPurchaseDetails));

            // Get payment URL using getPaymentUrl API
            const amount = price;
            const description = "buy extra revision";
            const orderType = "DESIGN";
            const returnURL = "/school/payment/result";

            const paymentResponse = await getPaymentUrl(amount, description, orderType, returnURL);

            if (paymentResponse && paymentResponse.status === 200 && paymentResponse.data.body) {
                // Redirect to payment gateway
                window.location.href = paymentResponse.data.body.url;
            } else {
                enqueueSnackbar('Failed to get payment URL. Please try again.', {variant: 'error'});
            }

            handleCloseBuyMoreRevisionsModal();
        } catch (error) {
            console.error('Error processing revision purchase:', error);
            enqueueSnackbar('Failed to process revision purchase. Please try again.', {variant: 'error'});
        }
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
            backgroundColor: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(27, 94, 32, 0.08) 100%)',
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
                        border: '2px solid #2e7d32',
                        boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)',
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
                                    onClick={() => setIsRequestDetailPopupVisible(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        height: '40px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)'
                                        }
                                    }}
                                >
                                    View Design Details
                                </Button>
                                <Chip
                                    label={requestData?.status?.toUpperCase() || 'UNKNOWN'}
                                    color="success"
                                    size="large"
                                    style={{
                                        backgroundColor: '#2e7d32',
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
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        flex: 1,
                        minHeight: 0,
                        height: '90vh',
                        position: 'relative'
                    }}>


                        {/* Top Row - Chat and Deliveries */}
                        <Box sx={{display: 'flex', gap: 3, flex: 2}}>

                            {/* Left Half - Designer Chat */}
                            <Paper
                                elevation={0}
                                sx={{display: 'none'}}
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
                                            background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '20px',
                                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
                                        }}>
                                            <UserSwitchOutlined/>
                                        </Box>
                                        <Box>
                                            <Typography.Title level={4}
                                                              style={{margin: 0, color: '#1e293b', fontWeight: 600}}>
                                                Designer: {designerName}
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
                                    opacity: (isFinalDesignSet || requestData?.status === 'completed') ? 0.6 : 1,
                                    pointerEvents: (isFinalDesignSet || requestData?.status === 'completed') ? 'none' : 'auto'
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
                                                                ? 'linear-gradient(135deg, #2e7d32, #4caf50)'
                                                                : 'white',
                                                            color: msg.user === (auth.currentUser?.displayName || "User") ? 'white' : '#1e293b',
                                                            border: msg.user !== (auth.currentUser?.displayName || "User") ? '2px solid #e2e8f0' : 'none',
                                                            maxWidth: '100%',
                                                            wordWrap: 'break-word',
                                                            boxShadow: msg.user === (auth.currentUser?.displayName || "User")
                                                                ? '0 4px 12px rgba(46, 125, 50, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
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
                                                                <Typography.Text style={{
                                                                    fontSize: '14px',
                                                                    color: (msg.user === (auth.currentUser?.displayName || "User")) ? 'white' : '#1e293b'
                                                                }}>
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
                                    opacity: (isFinalDesignSet || requestData?.status === 'completed') ? 0.6 : 1,
                                    pointerEvents: (isFinalDesignSet || requestData?.status === 'completed') ? 'none' : 'auto'
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
                                                background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                                border: 'none',
                                                fontSize: '18px',
                                                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Right Half - Deliveries and Revision Container */}
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'stretch',
                                gap: 3,
                                maxHeight: '100vh',
                                minWidth: 0
                            }}>

                                {/* Design Deliveries Section */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: 'white',
                                        borderRadius: 4,
                                        border: '2px solid #2e7d32',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(46, 125, 50, 0.15)',
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
                                                    background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '16px',
                                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
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
                                                gap: 2
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: 32,
                                                    height: 32,
                                                    px: 2,
                                                    borderRadius: '16px',
                                                    background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
                                                    border: '2px solid rgba(255, 255, 255, 0.2)'
                                                }}>
                                                    Amount: {designDeliveries.length}
                                                </Box>
                                                {requestData?.revisionTime === 0 && requestData?.status !== 'completed' && (
                                                    <Button
                                                        size="small"
                                                        icon={<DollarOutlined/>}
                                                        onClick={handleOpenBuyMoreRevisionsModal}
                                                        style={{
                                                            borderRadius: '8px',
                                                            height: '32px',
                                                            padding: '0 12px',
                                                            backgroundColor: '#dc2626',
                                                            borderColor: '#dc2626',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                backgroundColor: '#b91c1c',
                                                                borderColor: '#b91c1c',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                                                            }
                                                        }}
                                                    >
                                                        Buy More
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Deliveries List */}
                                    <Box sx={{
                                        flex: 1,
                                        p: 2,
                                        overflowY: 'auto',
                                        maxHeight: 'calc(4 * 140px + 2 * 16px)',
                                    }}>
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
                                        ) : designDeliveries.length === 0 ? (
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
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                                gap: 2,
                                                p: 1
                                            }}>
                                                {
                                                    designDeliveries.map(item => (
                                                        <Paper
                                                            key={item.id}
                                                            elevation={0}
                                                            sx={{
                                                                p: 2.5,
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: 3,
                                                                backgroundColor: 'white',
                                                                transition: 'all 0.3s ease',
                                                                height: 'fit-content',
                                                                minHeight: '120px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                '&:hover': {
                                                                    borderColor: '#2e7d32',
                                                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)',
                                                                    transform: 'translateY(-2px)'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                mb: 2,
                                                                flex: 1
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
                                                                flexDirection: 'column',
                                                                gap: 1,
                                                                justifyContent: 'center',
                                                                mt: 'auto'
                                                            }}>
                                                                <Button
                                                                    size="small"
                                                                    icon={<EyeOutlined/>}
                                                                    onClick={() => handleOpenDeliveryDetailModal(item)}
                                                                    style={{
                                                                        borderRadius: '8px',
                                                                        width: '100%',
                                                                        height: '32px',
                                                                        background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                                                        border: 'none',
                                                                        color: 'white',
                                                                        fontWeight: 600,
                                                                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)'
                                                                    }}
                                                                >
                                                                    View Details
                                                                </Button>
                                                                {!isFinalDesignSet && requestData?.status !== 'completed' && (
                                                                    <>
                                                                        {requestData?.revisionTime > 0 && (
                                                                            <Button
                                                                                size="small"
                                                                                icon={<EditOutlined/>}
                                                                                onClick={() => handleOpenRevisionModal(item.id)}
                                                                                style={{
                                                                                    borderRadius: '8px',
                                                                                    width: '100%',
                                                                                    height: '32px',
                                                                                    backgroundColor: '#722ed1',
                                                                                    borderColor: '#722ed1',
                                                                                    color: 'white',
                                                                                    fontWeight: 600,
                                                                                    boxShadow: '0 2px 8px rgba(114, 46, 209, 0.2)'
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
                                                                                borderRadius: '8px',
                                                                                width: '100%',
                                                                                height: '32px',
                                                                                backgroundColor: '#52c41a',
                                                                                borderColor: '#52c41a',
                                                                                color: 'white',
                                                                                fontWeight: 600,
                                                                                boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)'
                                                                            }}
                                                                        >
                                                                            Make final
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        </Paper>
                                                    ))
                                                }
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>

                                {/* Revision Requests Section */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: 'white',
                                        borderRadius: 4,
                                        border: '2px solid #ff6b35',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.15)',
                                        position: 'relative',
                                        minWidth: 0
                                    }}
                                >
                                    {/* Revision Requests Header */}
                                    <Box sx={{
                                        py: 2.5,
                                        px: 4,
                                        borderBottom: '2px solid #e2e8f0',
                                        backgroundColor: 'linear-gradient(135deg, #fff5f0 0%, #ffe4d6 100%)',
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
                                                    background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '16px',
                                                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                                                }}>
                                                    <EditOutlined/>
                                                </Box>
                                                <Box>
                                                    <Typography.Title level={4}
                                                                      style={{
                                                                          margin: 0,
                                                                          color: '#ff6b35',
                                                                          fontWeight: 600
                                                                      }}>
                                                        Revision Requests
                                                    </Typography.Title>
                                                    <Typography.Text type="secondary"
                                                                     style={{fontSize: '12px', color: '#ff6b35'}}>
                                                        Track your revision requests
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
                                                background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                                                border: '2px solid rgba(255, 255, 255, 0.2)'
                                            }}>
                                                Amount: {revisionRequests.length}
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Revision Requests List */}
                                    <Box sx={{flex: 1, p: 2, overflowY: 'auto'}}>
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
                                        ) : revisionRequests.length === 0 ? (
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
                                                    {requestData?.status === 'completed' ? 'Design request completed - no actions available' :
                                                        requestData?.revisionTime === 0 ? 'No revisions left' : 'No revision requests'}
                                                </Typography.Text>
                                                {requestData?.status === 'completed' && (
                                                    <Typography.Text type="secondary"
                                                                     style={{fontSize: '12px', color: '#2e7d32'}}>
                                                        This design request has been completed
                                                    </Typography.Text>
                                                )}
                                                {requestData?.status !== 'completed' && requestData?.revisionTime === 0 && (
                                                    <Typography.Text type="secondary"
                                                                     style={{fontSize: '12px', color: '#dc2626'}}>
                                                        You have used all available revisions
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                                gap: 2,
                                                p: 1
                                            }}>
                                                {
                                                    revisionRequests.map((revision, index) => (
                                                        <Paper
                                                            key={revision.id}
                                                            elevation={0}
                                                            sx={{
                                                                p: 2.5,
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: 3,
                                                                backgroundColor: 'white',
                                                                transition: 'all 0.3s ease',
                                                                height: 'fit-content',
                                                                minHeight: '120px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                '&:hover': {
                                                                    borderColor: '#ff6b35',
                                                                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.15)',
                                                                    transform: 'translateY(-2px)'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                mb: 2,
                                                                flex: 1
                                                            }}>
                                                                <Box sx={{flex: 1}}>
                                                                    <Typography.Title level={5}
                                                                                      style={{
                                                                                          margin: 0,
                                                                                          color: '#1e293b'
                                                                                      }}>
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

                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 1,
                                                                justifyContent: 'center',
                                                                mt: 'auto'
                                                            }}>
                                                                <Typography.Text style={{
                                                                    fontSize: '13px',
                                                                    color: '#475569',
                                                                    lineHeight: 1.5,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    mb: 1
                                                                }}>
                                                                    {revision.note}
                                                                </Typography.Text>
                                                                <Button
                                                                    size="small"
                                                                    icon={<EyeOutlined/>}
                                                                    onClick={() => {
                                                                        const delivery = designDeliveries.find(d => d.id === revision.deliveryId);
                                                                        if (delivery) {
                                                                            handleOpenDeliveryDetailModal(delivery);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        borderRadius: '8px',
                                                                        width: '100%',
                                                                        height: '32px',
                                                                        background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                                                                        border: 'none',
                                                                        color: 'white',
                                                                        fontWeight: 600,
                                                                        boxShadow: '0 2px 8px rgba(255, 107, 53, 0.2)'
                                                                    }}
                                                                >
                                                                    View Delivery
                                                                </Button>
                                                            </Box>
                                                        </Paper>
                                                    ))
                                                }
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
                                            {requestData?.status === 'completed' ? 'Final delivery - Design completed' :
                                                finalDelivery.note || 'Final delivery selected'}
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
                                            {requestData?.status === 'completed' ? 'Design completed' : 'No data'}
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

            <BuyMoreRevisionsModal
                visible={isBuyMoreRevisionsModalVisible}
                onCancel={handleCloseBuyMoreRevisionsModal}
                onSubmit={handleBuyMoreRevisions}
                extraRevisionPrice={requestData?.finalDesignQuotation?.extraRevisionPrice || 0}
            />

            <RequestDetailPopup
                visible={isRequestDetailPopupVisible}
                onCancel={() => setIsRequestDetailPopupVisible(false)}
                request={requestData}
                hideFooterButtons={true}
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

            {/* Floating Chat Bubble - only on SchoolChat page */}
            <Box sx={{position: 'fixed', bottom: 24, right: 24, zIndex: 2000}}>
                {isChatOpen ? (
                    <Paper
                        elevation={4}
                        sx={{
                            width: 380,
                            height: '65vh',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: '2px solid #2e7d32',
                            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.3)',
                            opacity: 1
                        }}
                    >
                        <Box sx={{
                            py: 1,
                            px: 2,
                            borderBottom: '2px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                                <UserSwitchOutlined/>
                                <Typography.Text style={{fontWeight: 600}}>
                                    Designer: {designerName}
                                </Typography.Text>
                            </Box>
                            <Button type="text" icon={<CloseCircleOutlined style={{color: '#ff4d4f'}}/>}
                                    onClick={() => setIsChatOpen(false)}/>
                        </Box>

                        <Box sx={{flex: 1, p: 2, overflowY: 'auto', backgroundColor: '#f8fafc'}}>
                            {chatMessages.length === 0 ? (
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#64748b'
                                }}>
                                    <MessageOutlined style={{fontSize: '36px', marginBottom: '12px'}}/>
                                    <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                        No messages yet. Start the conversation!
                                    </Typography.Text>
                                </Box>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {chatMessages.map((msg, index) => (
                                        <Box
                                            key={msg.id || index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: msg.user === (auth.currentUser?.displayName || "User") ? 'flex-end' : 'flex-start'
                                            }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                gap: 0.5,
                                                maxWidth: '80%'
                                            }}>
                                                {msg.user !== (auth.currentUser?.displayName || "User") && (
                                                    <Avatar size="small" style={{backgroundColor: '#1976d2'}}
                                                            icon={<UserSwitchOutlined/>}/>
                                                )}
                                                <Box sx={{
                                                    p: 1.5,
                                                    borderRadius: 3,
                                                    background: msg.user === (auth.currentUser?.displayName || "User")
                                                        ? 'linear-gradient(135deg, #2e7d32, #4caf50)'
                                                        : 'white',
                                                    color: msg.user === (auth.currentUser?.displayName || "User") ? 'white' : '#1e293b',
                                                    border: msg.user !== (auth.currentUser?.displayName || "User") ? '1px solid #e2e8f0' : 'none',
                                                    boxShadow: msg.user === (auth.currentUser?.displayName || "User")
                                                        ? '0 2px 8px rgba(46, 125, 50, 0.3)'
                                                        : '0 1px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    <Typography.Text style={{
                                                        fontSize: '10px',
                                                        color: msg.user === (auth.currentUser?.displayName || "User") ? 'rgba(255,255,255,0.8)' : '#94a3b8'
                                                    }}>
                                                        {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : ''}
                                                    </Typography.Text>
                                                    {msg.text && (
                                                        <Typography.Text style={{
                                                            fontSize: '14px',
                                                            display: 'block',
                                                            color: (msg.user === (auth.currentUser?.displayName || "User")) ? 'white' : '#1e293b'
                                                        }}>
                                                            {msg.text}
                                                        </Typography.Text>
                                                    )}
                                                </Box>
                                                {msg.user === (auth.currentUser?.displayName || "User") && (
                                                    <Avatar size="small" style={{backgroundColor: '#52c41a'}}
                                                            icon={<UserOutlined/>}/>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box sx={{
                            p: 1.5,
                            borderTop: '2px solid #e2e8f0',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)'
                        }}>
                            <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                                <Box sx={{flex: 1, position: 'relative'}}>
                                    <Input
                                        size="large"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onPressEnter={handleSendMessage}
                                        disabled={isViewOnly}
                                        style={{
                                            borderRadius: '24px',
                                            padding: '14px 18px',
                                            border: '1px solid #e2e8f0',
                                            height: 48
                                        }}
                                    />
                                    {showEmojiPicker && (
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: '46px',
                                            right: 0,
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
                                    id="image-upload-input-bubble"
                                    onChange={handleImageUpload}
                                />
                                <Button disabled={isViewOnly} shape="circle" size="large" icon={<UploadOutlined/>}
                                        onClick={() => document.getElementById('image-upload-input-bubble').click()}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}/>
                                <Button disabled={isViewOnly} shape="circle" size="large" icon={<SmileOutlined/>}
                                        onClick={() => setShowEmojiPicker(prev => !prev)} style={{
                                    width: 48,
                                    height: 48,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}/>
                                <Button disabled={isViewOnly} type="primary" shape="circle" size="large"
                                        icon={<SendOutlined/>} onClick={handleSendMessage} style={{
                                    width: 48,
                                    height: 48,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}/>
                            </Box>
                        </Box>
                    </Paper>
                ) : (
                    <Badge count={unreadCount} overflowCount={99} offset={[-6, 6]}>
                        <Button
                            type="primary"
                            shape="circle"
                            size="large"
                            icon={<MessageOutlined/>}
                            onClick={() => setIsChatOpen(true)}
                            style={{
                                width: isOpenButtonHover ? '60px' : '56px',
                                height: isOpenButtonHover ? '60px' : '56px',
                                transform: isOpenButtonHover ? 'translateY(-2px)' : 'none',
                                transition: 'all 150ms ease',
                                boxShadow: isOpenButtonHover ? '0 10px 28px rgba(46, 125, 50, 0.5)' : '0 8px 24px rgba(46, 125, 50, 0.4)',
                                background: isOpenButtonHover ? 'linear-gradient(135deg, #2e7d32, #43a047)' : 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                animation: isOpenButtonHover ? 'unisew-chat-shake 220ms ease-in-out' : 'none',
                                willChange: 'transform',
                                border: 'none'
                            }}
                            onMouseEnter={() => setIsOpenButtonHover(true)}
                            onMouseLeave={() => setIsOpenButtonHover(false)}
                        />
                    </Badge>
                )}
            </Box>
        </Box>
    );
}