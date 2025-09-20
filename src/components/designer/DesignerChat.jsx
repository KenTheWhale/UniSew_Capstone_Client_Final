import React, {useEffect, useRef, useState} from 'react';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    ColorPicker,
    Divider,
    Form,
    Input,
    Radio,
    Row,
    Space,
    Tag,
    Tooltip,
    Typography
} from 'antd';
import '@ant-design/v5-patch-for-react-19';
import {
    BankOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    MessageOutlined,
    SendOutlined,
    SmileOutlined,
    UploadOutlined,
    UserOutlined
} from '@ant-design/icons';
import {Box, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Paper} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import {useSnackbar} from 'notistack';
import {parseID} from '../../utils/ParseIDUtil.jsx';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where,
    writeBatch
} from 'firebase/firestore';
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
import AppliedRequestDetail from './dialog/AppliedRequestDetail.jsx';
import {getAccessCookie} from "../../utils/CookieUtil.jsx";

const {TextArea} = Input;

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
        return <FileTextOutlined/>;
    }
};


export function UseDesignerChatMessages(roomId, userInfo) {
    const [chatMessages, setChatMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!roomId) return;
        const qAll = query(collection(db, "messages"), where("room", "==", roomId));

        const unsubAll = onSnapshot(qAll, (snap) => {
            const msgs = [];
            snap.forEach((d) => msgs.push({...d.data(), id: d.id}));
            msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setChatMessages(msgs);
        });

        const qUnread = query(
            collection(db, "messages"),
            where("room", "==", roomId),
            where("read", "==", false)
        );
        const unsubUnread = onSnapshot(qUnread, (snap) => {
            let count = 0;
            snap.forEach((d) => {
                const data = d.data();
                if (userInfo && data.userId !== userInfo.id) {
                    count++;
                } else if (!userInfo) {
                    // Fallback: count all unread messages if userInfo not available
                    count++;
                }
            });
            setUnreadCount(count);
        });

        return () => {
            unsubAll();
            unsubUnread();
        };
    }, [roomId, userInfo]);

    const sendMessage = async (textOrPayload) => {
        if (!roomId) return;
        console.log("Auth: ", auth)
        console.log("Auth user: ", auth.currentUser)

        let cookie = await getAccessCookie()
        if (!cookie) {
            return false;
        }
        const accountId = cookie.id;
        const userId = cookie.id; // Use id as userId
        const payload =
            typeof textOrPayload === "string"
                ? {text: textOrPayload}
                : {...textOrPayload};

        await addDoc(collection(db, "messages"), {
            ...payload,
            createdAt: serverTimestamp(),
            userId: userId, // Save userId instead of user and senderEmail
            accountId: accountId ? accountId : 0,
            room: roomId,
            read: false,
        });

        await setDoc(
            doc(db, "chatRooms", roomId),
            {lastMessage: payload.text || "[image]", updatedAt: serverTimestamp()},
            {merge: true}
        );
    };

    const markAsRead = async () => {
        if (!roomId) return;
        
        // Get current user info for comparison
        let cookie = await getAccessCookie();
        if (!cookie) return;
        const currentUserId = cookie.id;
        
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
            if (data.userId !== currentUserId) {
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

function DeliveryDetailModal({visible, onCancel, delivery, revision, showAddRevisionButton, onAddRevision}) {
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
            {}
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
                                Design Details
                            </Typography.Text>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex',
                height: 'calc(90vh - 120px)',
                overflow: 'hidden'
            }}>
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
                                    <Typography.Text strong style={{fontSize: '16px'}}>Delivery Note</Typography.Text>
                                </Box>
                                <Typography.Text style={{color: '#475569', fontSize: '14px', lineHeight: 1.6}}>
                                    {delivery.note}
                                </Typography.Text>
                            </Box>
                        )}

                        {revision?.note && (
                            <Box sx={{
                                p: 2.5,
                                backgroundColor: 'white',
                                borderRadius: 3,
                                border: '1px solid #ff6b35',
                                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                                borderLeftWidth: '4px'
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '14px'
                                    }}>
                                        <EditOutlined/>
                                    </Box>
                                    <Typography.Text strong style={{fontSize: '16px', color: '#ff6b35'}}>Revision Request</Typography.Text>
                                </Box>
                                <Typography.Text style={{color: '#475569', fontSize: '14px', lineHeight: 1.6}}>
                                    {revision.note}
                                </Typography.Text>
                                {revision.requestDate && (
                                    <Typography.Text style={{
                                        color: '#94a3b8', 
                                        fontSize: '12px', 
                                        display: 'block', 
                                        mt: 1,
                                        fontStyle: 'italic'
                                    }}>
                                        Requested on: {new Date(revision.requestDate).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography.Text>
                                )}
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
                            {(delivery.deliveryItems || delivery.items || []).length} items
                        </Tag>
                    </Box>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {(() => {
                            const items = delivery.deliveryItems || delivery.items || [];
                            const boyItems = items.filter(item =>
                                item.designItem?.gender?.toLowerCase() === 'boy'
                            ) || [];
                            const girlItems = items.filter(item =>
                                item.designItem?.gender?.toLowerCase() === 'girl'
                            ) || [];
                            const otherItems = items.filter(item => {
                                const gender = item.designItem?.gender?.toLowerCase();
                                return gender !== 'boy' && gender !== 'girl';
                            }) || [];

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
                                                                            backgroundColor: '#f3e5f5',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #ce93d8',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#7b1fa2'
                                                                            }}>
                                                                                Button Color
                                                                            </Typography.Text>
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 1,
                                                                                mt: 1
                                                                            }}>
                                                                                <Box sx={{
                                                                                    width: 24,
                                                                                    height: 24,
                                                                                    borderRadius: '50%',
                                                                                    backgroundColor: item.buttonColor || '#FFFFFF',
                                                                                    border: '2px solid #e0e0e0',
                                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                                    flexShrink: 0
                                                                                }}/>
                                                                                <Box sx={{flex: 1}}>
                                                                                    <Typography.Text style={{
                                                                                        fontSize: '14px',
                                                                                        fontWeight: 600,
                                                                                        color: '#7b1fa2',
                                                                                        fontFamily: 'monospace',
                                                                                        display: 'block'
                                                                                    }}>
                                                                                        {item.buttonColor || 'N/A'}
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

                                                                <Box sx={{mt: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                                                    <Typography.Text strong style={{fontSize: '14px', color: '#1e293b', mb: 1}}>
                                                                        Logo & Attaching Technique
                                                                    </Typography.Text>
                                                                    <Row gutter={[16, 16]}>
                                                                        <Col span={12}>
                                                                            <Box sx={{p: 2, backgroundColor: '#fef3c7', borderRadius: 3, border: '1px solid #fde68a'}}>
                                                                                <Typography.Text strong style={{fontSize: '13px', color: '#92400e'}}>
                                                                                    Logo Height
                                                                                </Typography.Text>
                                                                                <Typography.Text style={{fontSize: '14px', display: 'block', mt: 1, fontWeight: 600, color: '#92400e'}}>
                                                                                    {item.baseLogoHeight || item.logoHeight || 0} cm
                                                                                </Typography.Text>
                                                                            </Box>
                                                                        </Col>
                                                                        <Col span={12}>
                                                                            <Box sx={{p: 2, backgroundColor: '#fef3c7', borderRadius: 3, border: '1px solid #fde68a'}}>
                                                                                <Typography.Text strong style={{fontSize: '13px', color: '#92400e'}}>
                                                                                    Logo Width
                                                                                </Typography.Text>
                                                                                <Typography.Text style={{fontSize: '14px', display: 'block', mt: 1, fontWeight: 600, color: '#92400e'}}>
                                                                            {item.baseLogoWidth || item.logoWidth || 0} cm
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Col>
                                                            </Row>
                                                                    <Box sx={{p: 2, backgroundColor: '#f0f9ff', borderRadius: 3, border: '1px solid #bae6fd'}}>
                                                                        <Typography.Text strong style={{fontSize: '13px', color: '#0369a1'}}>
                                                                            Technique Type
                                                                        </Typography.Text>
                                                                        <Typography.Text style={{fontSize: '14px', display: 'block', mt: 1, fontWeight: 600, color: '#0369a1'}}>
                                                                            {item.logoAttachingTechnique === 'embroidery' ? 'Embroidery Techniques' :
                                                                             item.logoAttachingTechnique === 'printing' ? 'Printing Techniques' :
                                                                             item.logoAttachingTechnique === 'heatpress' ? 'Heat Press Techniques' : 'N/A'}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                    {item.techniqueNote && (
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
                                                                                <strong>Technique Note:</strong> {item.techniqueNote}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    )}
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
                                                                            backgroundColor: '#f3e5f5',
                                                                            borderRadius: 3,
                                                                            border: '1px solid #ce93d8',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <Typography.Text strong style={{
                                                                                fontSize: '13px',
                                                                                color: '#7b1fa2'
                                                                            }}>
                                                                                Button Color
                                                                            </Typography.Text>
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center'
                                                                            }}>
                                                                                <Box sx={{
                                                                                    width: 24,
                                                                                    height: 24,
                                                                                    borderRadius: '50%',
                                                                                    backgroundColor: item.buttonColor || '#FFFFFF',
                                                                                    border: '2px solid #e0e0e0',
                                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                                    flexShrink: 0
                                                                                }}/>
                                                                                <Box sx={{flex: 1}}>
                                                                                    <Typography.Text style={{
                                                                                        fontSize: '14px',
                                                                                        fontWeight: 600,
                                                                                        color: '#7b1fa2',
                                                                                        fontFamily: 'monospace',
                                                                                        display: 'block'
                                                                                    }}>
                                                                                        {item.buttonColor || 'N/A'}
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

                                                                <Box sx={{mt: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                                                                    <Typography.Text strong style={{fontSize: '14px', color: '#1e293b', mb: 1}}>
                                                                        Logo & Attaching Technique
                                                                    </Typography.Text>
                                                                    <Row gutter={[16, 16]}>
                                                                        <Col span={12}>
                                                                            <Box sx={{p: 2, backgroundColor: '#fef3c7', borderRadius: 3, border: '1px solid #fde68a'}}>
                                                                                <Typography.Text strong style={{fontSize: '13px', color: '#92400e'}}>
                                                                                    Logo Height
                                                                                </Typography.Text>
                                                                                <Typography.Text style={{fontSize: '14px', display: 'block', mt: 1, fontWeight: 600, color: '#92400e'}}>
                                                                                    {item.baseLogoHeight || item.logoHeight || 0} cm
                                                                                </Typography.Text>
                                                                            </Box>
                                                                        </Col>
                                                                        <Col span={12}>
                                                                            <Box sx={{p: 2, backgroundColor: '#fef3c7', borderRadius: 3, border: '1px solid #fde68a'}}>
                                                                                <Typography.Text strong style={{fontSize: '13px', color: '#92400e'}}>
                                                                                    Logo Width
                                                                                </Typography.Text>
                                                                                <Typography.Text style={{fontSize: '14px', display: 'block', mt: 1, fontWeight: 600, color: '#92400e'}}>
                                                                            {item.baseLogoWidth || item.logoWidth || 0} cm
                                                                        </Typography.Text>
                                                                    </Box>
                                                                </Col>
                                                            </Row>
                                                                    <Box sx={{p: 2, backgroundColor: '#f0f9ff', borderRadius: 3, border: '1px solid #bae6fd'}}>
                                                                        <Typography.Text strong style={{fontSize: '13px', color: '#0369a1'}}>
                                                                            Technique Type
                                                                        </Typography.Text>
                                                                        <Typography.Text style={{fontSize: '14px', display: 'block', mt: 1, fontWeight: 600, color: '#0369a1'}}>
                                                                            {item.attachingTechnique === 'embroidery' ? 'Embroidery Techniques' :
                                                                             item.attachingTechnique === 'printing' ? 'Printing Techniques' :
                                                                             item.attachingTechnique === 'heatpress' ? 'Heat Press Techniques' : 'N/A'}
                                                                        </Typography.Text>
                                                                    </Box>
                                                                    {item.techniqueNote && (
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
                                                                                <strong>Technique Note:</strong> {item.techniqueNote}
                                                                            </Typography.Text>
                                                                        </Box>
                                                                    )}
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

            {}
            <Box sx={{
                p: 2,
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: showAddRevisionButton ? 'space-between' : 'flex-end',
                alignItems: 'center'
            }}>
                {showAddRevisionButton && (
                    <Button
                        type="primary"
                        icon={<EditOutlined/>}
                        onClick={onAddRevision}
                        style={{
                            borderRadius: 8,
                            height: '40px',
                            padding: '0 24px',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(255, 107, 53, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                            }
                        }}
                    >
                        Add Revision Delivery
                    </Button>
                )}
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

function DeliverySubmissionModal({
                                     visible,
                                     onCancel,
                                     onSubmit,
                                     requestData,
                                     designDeliveries,
                                     initialDeliveryType = 'normal'
                                 }) {
    // State management instead of Form
    const [deliveryType, setDeliveryType] = useState('normal');
    const [deliveryName, setDeliveryName] = useState('');
    const [deliveryDescription, setDeliveryDescription] = useState('');
    const [revisionOf, setRevisionOf] = useState(undefined);
    const [itemList, setItemList] = useState([]);
    
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [revisionRequests, setRevisionRequests] = useState([]);
    const [loadingRevisions, setLoadingRevisions] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
    const [isFormValid, setIsFormValid] = useState(false);
    const validityTimerRef = useRef(null);
    const shirtIndexSetRef = useRef(new Set());
    const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!visible) return;
        const set = new Set();
        const arr = Array.isArray(requestData?.items) ? requestData.items : [];
        arr.forEach((it, idx) => {
            if (String(it?.type || '').toLowerCase().includes('shirt')) set.add(idx);
        });
        shirtIndexSetRef.current = set;
    }, [visible, requestData?.items]);

    const getItemLabel = (idx) => {
        const src = Array.isArray(requestData?.items) ? requestData.items[idx] : null;
        if (!src) return `item ${idx}`;
        const gender = String(src.gender || '').toLowerCase();
        const type = String(src.type || '').toLowerCase();
        const category = String(formatCategory(src.category || '')).toLowerCase();
        const parts = [gender, type, category].filter(Boolean);
        return parts.join(' ');
    };

    const isFormComplete = (currentDeliveryType) => {
        const deliveryNameOk = typeof deliveryName === 'string' && deliveryName.trim().length > 0;
        const items = Array.isArray(itemList) ? itemList : [];
        if (!deliveryNameOk) return {ok: false, reason: 'missing deliveryName'};
        if (items.length === 0) return {ok: false, reason: 'itemList empty'};
        for (let i = 0; i < items.length; i++) {
            const it = items[i] || {};
            const label = getItemLabel(i);
            if (!it.frontUrl) return {ok: false, reason: `${label} missing front design image`};
            if (!it.backUrl) return {ok: false, reason: `${label} missing back design image`};
            const requireLogoDims = shirtIndexSetRef.current.has(i);
            if (requireLogoDims) {
                const hOk = Number(it.logoHeight) > 0;
                const wOk = Number(it.logoWidth) > 0;
                if (!hOk) return {ok: false, reason: `${label}'s logo height invalid`};
                if (!wOk) return {ok: false, reason: `${label}'s logo width invalid`};
                
                // Check button information for shirts
                const buttonQuantityOk = Number(it.buttonQuantity) >= 1 && Number(it.buttonQuantity) <= 50;
                const buttonHolesOk = Number(it.buttonHoles) >= 2 && Number(it.buttonHoles) <= 4;
                const buttonLengthOk = Number(it.buttonLength) >= 0.5 && Number(it.buttonLength) <= 10;
                const buttonWidthOk = Number(it.buttonWidth) >= 0.5 && Number(it.buttonWidth) <= 10;
                const buttonColorOk = typeof it.buttonColor === 'string' && it.buttonColor.trim().length > 0;
                
                // Check attaching technique for shirts
                const attachingTechniqueOk = typeof it.attachingTechnique === 'string' && 
                    ['embroidery', 'printing', 'heatpress'].includes(it.attachingTechnique);
                
                if (!buttonQuantityOk) return {ok: false, reason: `${label}'s button quantity invalid`};
                if (!buttonHolesOk) return {ok: false, reason: `${label}'s button holes invalid`};
                if (!buttonLengthOk) return {ok: false, reason: `${label}'s button length invalid`};
                if (!buttonWidthOk) return {ok: false, reason: `${label}'s button width invalid`};
                if (!buttonColorOk) return {ok: false, reason: `${label}'s button color missing`};
                if (!attachingTechniqueOk) return {ok: false, reason: `${label}'s attaching technique missing`};
            }
        }
        if (currentDeliveryType === 'revision' && !revisionOf) {
            return {ok: false, reason: 'missing revisionOf'};
        }
        return {ok: true};
    };

    const updateFormValidity = () => {
        if (validityTimerRef.current) clearTimeout(validityTimerRef.current);
        validityTimerRef.current = setTimeout(() => {
            const hasErrors = Object.keys(errors).length > 0;
            const completeness = isFormComplete(deliveryType);
            const nextValid = completeness.ok && !hasErrors;
            console.debug('[DeliverySubmissionModal] validity check:', {
                hasErrors,
                completeness,
                valuesSummary: {
                    deliveryName: deliveryName,
                    revisionOf: revisionOf,
                    itemCount: Array.isArray(itemList) ? itemList.length : 0,
                }
            });
            setIsFormValid(nextValid);
        }, 100);
    };

    useEffect(() => {
        if (!visible) {
            setDeliveryType('normal');
            setDeliveryName('');
            setDeliveryDescription('');
            setRevisionOf(undefined);
            setItemList([]);
            setUploadedFiles({});
            setRevisionRequests([]);
            setIsFormValid(false);
            setErrors({});
        } else {
            setDeliveryType(initialDeliveryType);
        }
    }, [visible, initialDeliveryType]);

    useEffect(() => {
        if (visible && requestData?.id) {
            fetchRevisionRequests();
        }
    }, [visible, requestData?.id]);

    useEffect(() => {
        if (!visible) return;
        if (deliveryType === 'normal') {
            setUploadedFiles({});
            // Initialize itemList with default white color for all items
            const defaultItemList = Array.isArray(requestData?.items) 
                ? requestData.items.map((item, index) => ({
                    designItemId: item.id,
                    logoHeight: 0,
                    logoWidth: 0,
                    frontUrl: '',
                    backUrl: '',
                    buttonQuantity: 0,
                    buttonHoles: 0,
                    buttonLength: 0,
                    buttonWidth: 0,
                    buttonColor: '#FFFFFF',
                    buttonNote: '',
                    attachingTechnique: '',
                    techniqueNote: ''
                }))
                : [];
            setItemList(defaultItemList);
            setRevisionOf(undefined);
        }
    }, [visible, deliveryType]);

    useEffect(() => {
        if (!visible) return;
        if (deliveryType !== 'revision') return;

        if (revisionRequests.length > 0 && designDeliveries && Array.isArray(designDeliveries)) {
            const selectedRevision = revisionRequests[0];
            const selectedRevisionId = selectedRevision.id;

            const previousDelivery = designDeliveries.find(d => d.id === selectedRevision.deliveryId);
            if (previousDelivery && previousDelivery.deliveryItems) {
                const itemListData = Array(requestData?.items?.length || 0).fill(null);

                previousDelivery.deliveryItems.forEach(prevItem => {
                    const requestItemIndex = requestData?.items?.findIndex(reqItem => reqItem.id === prevItem.designItem?.id);
                    if (requestItemIndex !== -1) {
                        itemListData[requestItemIndex] = {
                            designItemId: prevItem.designItem?.id,
                            logoHeight: prevItem.baseLogoHeight || prevItem.logoHeight || 0,
                            logoWidth: prevItem.baseLogoWidth || prevItem.logoWidth || 0,
                            frontUrl: prevItem.frontImageUrl,
                            backUrl: prevItem.backImageUrl,
                            buttonQuantity: prevItem.buttonQuantity || 0,
                            buttonHoles: prevItem.buttonHoles || 0,
                            buttonLength: prevItem.buttonLength || 0,
                            buttonWidth: prevItem.buttonWidth || 0,
                            buttonColor: prevItem.buttonColor || '#FFFFFF',
                            buttonNote: prevItem.buttonNote || '',
                            attachingTechnique: prevItem.attachingTechnique || '',
                            techniqueNote: prevItem.techniqueNote || ''
                        };
                    }
                });

                setRevisionOf(selectedRevisionId);
                setItemList(itemListData);

                const uploadedFilesData = {};
                previousDelivery.deliveryItems.forEach((item, index) => {
                    if (item.frontImageUrl) uploadedFilesData[`front-${index}`] = item.frontImageUrl;
                    if (item.backImageUrl) uploadedFilesData[`back-${index}`] = item.backImageUrl;
                });
                setUploadedFiles(uploadedFilesData);
            }
        }
    }, [visible, deliveryType, revisionRequests, designDeliveries, requestData?.items]);

    const fetchRevisionRequests = async () => {
        try {
            setLoadingRevisions(true);
            const response = await getUndoneRevisionRequests({requestId: requestData.id});

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
            console.log(err)
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

    const handleOk = async () => {
        const hasErrors = Object.keys(errors).length > 0;
        const completeness = isFormComplete(deliveryType);
        if (hasErrors || !completeness.ok) {
            const message = hasErrors ? 'Some fields are invalid. Please fix highlighted errors.' : `Missing/invalid data: ${completeness.reason}`;
            enqueueSnackbar(message, {
                variant: 'error',
                autoHideDuration: 4000
            });
            return;
        }

        try {
            setIsSubmittingDelivery(true);
            // Transform itemList to new structure
            const transformedItemList = (itemList || []).map(item => {
                const isShirt = requestData?.items?.find(reqItem => reqItem.id === item.designItemId)?.type?.toLowerCase().includes('shirt');
                
                return {
                    designItemId: item.designItemId,
                    frontUrl: item.frontUrl || '',
                    backUrl: item.backUrl || '',
                    buttonData: isShirt ? {
                        quantity: item.buttonQuantity || 0,
                        height: item.buttonLength || 0,
                        width: item.buttonWidth || 0,
                        holeQty: item.buttonHoles || 0,
                        color: item.buttonColor || '#FFFFFF',
                        note: item.buttonNote || ''
                    } : null,
                    logoData: isShirt ? {
                        attachingTechnique: item.attachingTechnique || '',
                        baseHeight: item.logoHeight || 0,
                        baseWidth: item.logoWidth || 0,
                        note: item.techniqueNote || ''
                    } : null,
                    zipper: false // Default value, can be updated if needed
                };
            });

            const deliveryData = {
                designRequestId: requestData.id,
                revisionId: deliveryType === 'revision' ? revisionOf : 0,
                name: deliveryName,
                revision: deliveryType === 'revision',
                note: deliveryDescription || '',
                itemList: transformedItemList
            };
            await onSubmit(deliveryData);
        } catch (error) {
            console.error('Error submitting delivery:', error);
        } finally {
            setIsSubmittingDelivery(false);
        }
    };

    const indexedItems = Array.isArray(requestData?.items)
        ? requestData.items.map((it, idx) => ({...it, __index: idx}))
        : [];
    const modalBoyItems = indexedItems.filter(i => (i.gender || '').toLowerCase() === 'boy');
    const modalGirlItems = indexedItems.filter(i => (i.gender || '').toLowerCase() === 'girl');
    const modalOtherItems = indexedItems.filter(i => {
        const g = (i.gender || '').toLowerCase();
        return g !== 'boy' && g !== 'girl';
    });

    // Helper functions for updating item data
    const updateItemField = (itemIndex, field, value) => {
        setItemList(prev => prev.map((item, index) => 
            index === itemIndex ? { ...item, [field]: value } : item
        ));
    };

    const validateField = (field, value, itemIndex = null) => {
        const fieldKey = itemIndex !== null ? `item_${itemIndex}_${field}` : field;
        const newErrors = { ...errors };
        
        switch (field) {
            case 'deliveryName':
                if (!value || value.trim().length === 0) {
                    newErrors[fieldKey] = 'Please enter delivery name!';
                } else {
                    delete newErrors[fieldKey];
                }
                break;
            case 'buttonQuantity':
                const qty = Number(value);
                if (isNaN(qty) || qty < 1 || qty > 50) {
                    newErrors[fieldKey] = 'Button quantity must be between 1 and 50!';
                } else {
                    delete newErrors[fieldKey];
                }
                break;
            case 'buttonHoles':
                const holes = Number(value);
                if (isNaN(holes) || holes < 2 || holes > 4) {
                    newErrors[fieldKey] = 'Button holes must be between 2 and 4!';
                } else {
                    delete newErrors[fieldKey];
                }
                break;
            case 'buttonLength':
            case 'buttonWidth':
                const length = Number(value);
                if (isNaN(length) || length < 0.5 || length > 10) {
                    newErrors[fieldKey] = `${field === 'buttonLength' ? 'Button length' : 'Button width'} must be between 0.5 and 10 cm!`;
                } else {
                    delete newErrors[fieldKey];
                }
                break;
            case 'logoHeight':
            case 'logoWidth':
                const dim = Number(value);
                if (isNaN(dim) || dim < 1 || dim > 999) {
                    newErrors[fieldKey] = `${field === 'logoHeight' ? 'Logo height' : 'Logo width'} must be between 1 and 999 cm!`;
                } else {
                    delete newErrors[fieldKey];
                }
                break;
            case 'attachingTechnique':
                if (!value || !['embroidery', 'printing', 'heatpress'].includes(value)) {
                    newErrors[fieldKey] = 'Please select attaching technique!';
                } else {
                    delete newErrors[fieldKey];
                }
                break;
            case 'revisionOf':
                if (deliveryType === 'revision' && (!value || value === '')) {
                    newErrors[fieldKey] = 'Please select a revision request!';
                } else {
                    delete newErrors[fieldKey];
                }
                break;
            default:
                delete newErrors[fieldKey];
        }
        
        setErrors(newErrors);
        updateFormValidity();
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
                <Box sx={{width: '100%'}}>
                    {}
                    <Box sx={{mb: 3}}>
                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                            Delivery Type: <span style={{color: 'red'}}>*</span>
                        </Typography.Text>
                        <Radio.Group
                            value={deliveryType}
                            onChange={(e) => {
                                setDeliveryType(e.target.value);
                                updateFormValidity();
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
                    </Box>

                    {}
                    {deliveryType === 'revision' && (
                        <>
                            <Box sx={{mb: 3}}>
                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                    Revision Request: <span style={{color: 'red'}}>*</span>
                                </Typography.Text>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                    {loadingRevisions ? (
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0',
                                            textAlign: 'center'
                                        }}>
                                            <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                                Loading revision requests...
                                            </Typography.Text>
                                        </Box>
                                    ) : revisionRequests.length > 0 ? (
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: '#fff5f0',
                                            borderRadius: 2,
                                            border: '1px solid #ff8c42',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <EditOutlined style={{color: '#ff6b35', fontSize: '16px'}}/>
                                            <Box sx={{flex: 1}}>
                                                <Typography.Text strong style={{fontSize: '14px', color: '#ff6b35'}}>
                                                    Revision #{revisionRequests[0].id}
                                                </Typography.Text>
                                                <Typography.Text
                                                    style={{fontSize: '12px', color: '#ff6b35', display: 'block'}}>
                                                    {designDeliveries && Array.isArray(designDeliveries) ?
                                                        (() => {
                                                            const relatedDelivery = designDeliveries.find(d => d.id === revisionRequests[0].deliveryId);
                                                            return relatedDelivery?.name || `Delivery ${revisionRequests[0].deliveryId}`;
                                                        })() :
                                                        `Delivery ${revisionRequests[0].deliveryId}`
                                                    }
                                                </Typography.Text>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            p: 2,
                                            backgroundColor: '#fef2f2',
                                            borderRadius: 2,
                                            border: '1px solid #fca5a5',
                                            textAlign: 'center'
                                        }}>
                                            <Typography.Text type="secondary"
                                                             style={{fontSize: '14px', color: '#dc2626'}}>
                                                No revision requests available
                                            </Typography.Text>
                                        </Box>
                                    )}

                                    {revisionRequests.length > 0 && (
                                        <>
                                            <Radio.Group
                                                value={revisionOf}
                                                onChange={(e) => {
                                                    setRevisionOf(e.target.value);
                                                    validateField('revisionOf', e.target.value);
                                                }}
                                            >
                                                <Space direction="vertical">
                                                    {revisionRequests.map((req) => (
                                                        <Radio key={req.id} value={req.id}>
                                                            Revision #{req.id} - {req.reason}
                                                        </Radio>
                                                    ))}
                                                </Space>
                                            </Radio.Group>
                                        <Box sx={{
                                            p: 1.5,
                                            backgroundColor: '#e6f7ff',
                                            borderRadius: 4,
                                            border: '1px solid #91d5ff',
                                            fontSize: '12px',
                                                color: '#1890ff',
                                                mt: 1
                                        }}>
                                            <Typography.Text style={{fontSize: '12px', color: '#1890ff'}}>
                                                💡 Data from the previous delivery has been auto-filled. You can modify
                                                the values as needed.
                                            </Typography.Text>
                                        </Box>
                                        </>
                                    )}
                                </Box>
                                {errors.revisionOf && (
                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                        {errors.revisionOf}
                                    </Typography.Text>
                                )}
                            </Box>
                        </>
                    )}

                    <Box sx={{mb: 3}}>
                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                            Delivery Name: <span style={{color: 'red'}}>*</span>
                        </Typography.Text>
                        <Input
                            value={deliveryName}
                            onChange={(e) => {
                                setDeliveryName(e.target.value);
                                validateField('deliveryName', e.target.value);
                            }}
                            placeholder={deliveryType === 'revision' ? "e.g., Revision 1.0, Updated Design v2.1..." : "e.g., Concept 1.0, Final Design v2.0..."}
                            style={{
                                borderRadius: '8px',
                                width: '100%'
                            }}
                            autoComplete="off"
                        />
                        {errors.deliveryName && (
                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                {errors.deliveryName}
                            </Typography.Text>
                        )}
                    </Box>
                    <Box sx={{mb: 3}}>
                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                            Note:
                        </Typography.Text>
                        <TextArea
                            value={deliveryDescription}
                            onChange={(e) => {
                                setDeliveryDescription(e.target.value);
                            }}
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
                    </Box>


                    {}
                    <Divider>Design Items</Divider>

                    {modalBoyItems.length > 0 && (
                        <>
                            <Typography.Title level={5} style={{marginTop: 0}}>Boy
                                ({modalBoyItems.length} clothes)</Typography.Title>
                            {modalBoyItems.map((item) => (
                                <Card key={`boy-${item.__index}`} size="small"
                                      style={{marginBottom: '16px', border: '1px solid #e2e8f0'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                        {getItemIcon(item.type)}
                                        <Typography.Title level={5} style={{margin: 0}}>
                                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {formatCategory(item.category)}
                                        </Typography.Title>
                                        <Tag color="blue" style={{marginLeft: 'auto'}}>Boy</Tag>
                                    </Box>
                                    {}
                                    {item.type.toLowerCase().includes('shirt') && (
                                        <>
                                            
                                            <Divider style={{margin: '16px 0'}}>Button Information</Divider>
                                            
                                            <Row gutter={[16, 16]}>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Quantity: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={1} 
                                                            max={50} 
                                                            placeholder="e.g., 6"
                                                            value={itemList[item.__index]?.buttonQuantity || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonQuantity', Number(e.target.value));
                                                                validateField('buttonQuantity', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Holes: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={2} 
                                                            max={4} 
                                                            placeholder="e.g., 4"
                                                            value={itemList[item.__index]?.buttonHoles || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonHoles', Number(e.target.value));
                                                                validateField('buttonHoles', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                            </Row>
                                            
                                            <Row gutter={[16, 16]}>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Length (cm): <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={0.5} 
                                                            max={10} 
                                                            step={0.1} 
                                                            placeholder="e.g., 1.2"
                                                            value={itemList[item.__index]?.buttonLength || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonLength', Number(e.target.value));
                                                                validateField('buttonLength', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Width (cm): <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={0.5} 
                                                            max={10} 
                                                            step={0.1} 
                                                            placeholder="e.g., 1.0"
                                                            value={itemList[item.__index]?.buttonWidth || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonWidth', Number(e.target.value));
                                                                validateField('buttonWidth', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Color: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <ColorPicker
                                                            defaultValue="#FFFFFF"
                                                            value={itemList[item.__index]?.buttonColor || '#FFFFFF'}
                                                            onChange={(color) => {
                                                                const colorValue = color.toHexString();
                                                                updateItemField(item.__index, 'buttonColor', colorValue);
                                                            }}
                                                            showText
                                                            size="medium"
                                                            getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                                                            style={{
                                                                borderRadius: '8px',
                                                                width: '100%'
                                                            }}
                                                            popupStyle={{
                                                                zIndex: 9999
                                                            }}
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                            </Row>
                                            
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Button Note:
                                                </Typography.Text>
                                                <TextArea
                                                    rows={2}
                                                    placeholder="Add notes about buttons (optional)..."
                                                    style={{
                                                        borderRadius: '8px',
                                                        resize: 'none'
                                                    }}
                                                    autoComplete="off"
                                                />
                                                {errors[`item_${item.__index}_buttonNote`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_buttonNote`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>

                                            <Divider style={{margin: '16px 0'}}>Logo & Attaching Technique</Divider>

                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <Box sx={{mb: 3}}>
                                                    <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                        <Space size={4} style={{overflow: 'visible'}}>Logo Height
                                                            (cm): <Tooltip
                                                                title="This height is for the smallest size of cloth"
                                                                styles={{root: {zIndex: 3000}}}
                                                                getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                style={{
                                                                    color: '#64748b',
                                                                    cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                    </Typography.Text>
                                                    <Input 
                                                        type="number" 
                                                        min={1} 
                                                        max={999} 
                                                        placeholder="e.g., 5"
                                                        value={itemList[item.__index]?.logoHeight || ''}
                                                        onChange={(e) => {
                                                            updateItemField(item.__index, 'logoHeight', Number(e.target.value));
                                                            validateField('logoHeight', Number(e.target.value), item.__index);
                                                        }}
                                                        style={{borderRadius: '8px'}} 
                                                        autoComplete="off"
                                                    />
                                                    {errors[`item_${item.__index}_logoHeight`] && (
                                                        <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                            {errors[`item_${item.__index}_logoHeight`]}
                                                        </Typography.Text>
                                                    )}
                                                </Box>
                                            </Col>
                                            <Col span={12}>
                                                <Box sx={{mb: 3}}>
                                                    <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                        <Space size={4} style={{overflow: 'visible'}}>Logo Width
                                                            (cm): <Tooltip
                                                                title="This width is for the smallest size of cloth"
                                                                styles={{root: {zIndex: 3000}}}
                                                                getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                style={{
                                                                    color: '#64748b',
                                                                    cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                    </Typography.Text>
                                                    <Input 
                                                        type="number" 
                                                        min={1} 
                                                        max={999} 
                                                        placeholder="e.g., 8"
                                                        value={itemList[item.__index]?.logoWidth || ''}
                                                        onChange={(e) => {
                                                            updateItemField(item.__index, 'logoWidth', Number(e.target.value));
                                                            validateField('logoWidth', Number(e.target.value), item.__index);
                                                        }}
                                                        style={{borderRadius: '8px'}} 
                                                        autoComplete="off"
                                                    />
                                                    {errors[`item_${item.__index}_logoHeight`] && (
                                                        <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                            {errors[`item_${item.__index}_logoHeight`]}
                                                        </Typography.Text>
                                                    )}
                                                </Box>
                                            </Col>
                                        </Row>

                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Attaching Technique: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Radio.Group
                                                    value={itemList[item.__index]?.attachingTechnique || ''}
                                                    onChange={(e) => {
                                                        updateItemField(item.__index, 'attachingTechnique', e.target.value);
                                                        validateField('attachingTechnique', e.target.value, item.__index);
                                                    }}
                                                >
                                                    <Space direction="vertical">
                                                        <Radio value="embroidery">Embroidery Techniques</Radio>
                                                        <Radio value="printing">Printing Techniques</Radio>
                                                        <Radio value="heatpress">Heat Press Techniques</Radio>
                                                    </Space>
                                                </Radio.Group>
                                                {errors[`item_${item.__index}_attachingTechnique`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_attachingTechnique`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>

                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Technique Note:
                                                </Typography.Text>
                                                <TextArea
                                                    rows={2}
                                                    placeholder="Add notes about attaching technique (optional)..."
                                                    style={{
                                                        borderRadius: '8px',
                                                        resize: 'none'
                                                    }}
                                                    autoComplete="off"
                                                />
                                                {errors[`item_${item.__index}_buttonNote`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_buttonNote`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </>
                                    )}
                                    {}
                                    {/* Hidden fields are no longer needed with state management */}
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Front Design: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Box sx={{position: 'relative'}}>
                                                    <input type="file" accept="image/*"
                                                           id={`front-upload-${item.__index}`} style={{display: 'none'}}
                                                           onChange={async (e) => {
                                                               const file = e.target.files[0];
                                                               if (file) {
                                                                   setUploading(true);
                                                                   try {
                                                                       const url = await uploadCloudinary(file);
                                                                       updateItemField(item.__index, 'frontUrl', url);
                                                                       setUploadedFiles(prev => ({
                                                                           ...prev,
                                                                           [`front-${item.__index}`]: url
                                                                       }));
                                                                   } finally {
                                                                       setUploading(false);
                                                                   }
                                                               }
                                                           }}/>
                                                    <Box sx={{width: '100%'}}>
                                                        <Button
                                                            onClick={() => document.getElementById(`front-upload-${item.__index}`).click()}
                                                            icon={<UploadOutlined/>} loading={uploading} style={{
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
                                                        }}> {uploading ? 'Uploading...' : 'Upload Front Design'} </Button>
                                                        {uploadedFiles[`front-${item.__index}`] && (
                                                            <Box
                                                                sx={{mt: 1, display: 'flex', justifyContent: 'center'}}>
                                                                <DisplayImage
                                                                    imageUrl={uploadedFiles[`front-${item.__index}`]}
                                                                    alt="Front Design"
                                                                    width="120px"
                                                                    height="120px"/>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {errors[`item_${item.__index}_frontUrl`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_frontUrl`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </Col>
                                        <Col span={12}>
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Back Design: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Box sx={{position: 'relative'}}>
                                                    <input type="file" accept="image/*"
                                                           id={`back-upload-${item.__index}`} style={{display: 'none'}}
                                                           onChange={async (e) => {
                                                               const file = e.target.files[0];
                                                               if (file) {
                                                                   setUploading(true);
                                                                   try {
                                                                       const url = await uploadCloudinary(file);
                                                                       updateItemField(item.__index, 'backUrl', url);
                                                                       setUploadedFiles(prev => ({
                                                                           ...prev,
                                                                           [`back-${item.__index}`]: url
                                                                       }));
                                                                   } finally {
                                                                       setUploading(false);
                                                                   }
                                                               }
                                                           }}/>
                                                    <Box sx={{width: '100%'}}>
                                                        <Button
                                                            onClick={() => document.getElementById(`back-upload-${item.__index}`).click()}
                                                            icon={<UploadOutlined/>} loading={uploading} style={{
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
                                                        }}> {uploading ? 'Uploading...' : 'Upload Back Design'} </Button>
                                                        {uploadedFiles[`back-${item.__index}`] && (
                                                            <Box
                                                                sx={{mt: 1, display: 'flex', justifyContent: 'center'}}>
                                                                <DisplayImage
                                                                    imageUrl={uploadedFiles[`back-${item.__index}`]}
                                                                    alt="Back Design"
                                                                    width="120px"
                                                                    height="120px"/>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {errors[`item_${item.__index}_frontUrl`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_frontUrl`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </Col>
                                    </Row>
                                    {/* designItemId is handled by state management */}
                                    
                                    {/* Hidden fields for button info when not shirt */}
                                    {/* Hidden fields are no longer needed with state management */}
                                </Card>
                            ))}
                        </>
                    )}

                    {modalGirlItems.length > 0 && (
                        <>
                            <Typography.Title level={5} style={{marginTop: 16}}>Girl
                                ({modalGirlItems.length} clothes)</Typography.Title>
                            {modalGirlItems.map((item) => (
                                <Card key={`girl-${item.__index}`} size="small"
                                      style={{marginBottom: '16px', border: '1px solid #e2e8f0'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                        {getItemIcon(item.type)}
                                        <Typography.Title level={5} style={{margin: 0}}>
                                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {formatCategory(item.category)}
                                        </Typography.Title>
                                        <Tag color="magenta" style={{marginLeft: 'auto'}}>Girl</Tag>
                                    </Box>
                                    {}
                                    {item.type.toLowerCase().includes('shirt') && (
                                        <>
                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <Box sx={{mb: 3}}>
                                                    <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                        <Space size={4} style={{overflow: 'visible'}}>Logo
                                                            Height (cm): <Tooltip
                                                                title="This height is for the smallest size of cloth"
                                                                styles={{root: {zIndex: 3000}}}
                                                                getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                style={{
                                                                    color: '#64748b',
                                                                    cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                    </Typography.Text>
                                                    <Input 
                                                        type="number" 
                                                        min={1} 
                                                        max={999} 
                                                        placeholder="e.g., 5"
                                                        value={itemList[item.__index]?.logoHeight || ''}
                                                        onChange={(e) => {
                                                            updateItemField(item.__index, 'logoHeight', Number(e.target.value));
                                                            validateField('logoHeight', Number(e.target.value), item.__index);
                                                        }}
                                                        style={{borderRadius: '8px'}} 
                                                        autoComplete="off"
                                                    />
                                                    {errors[`item_${item.__index}_logoHeight`] && (
                                                        <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                            {errors[`item_${item.__index}_logoHeight`]}
                                                        </Typography.Text>
                                                    )}
                                                </Box>
                                            </Col>
                                            <Col span={12}>
                                                <Box sx={{mb: 3}}>
                                                    <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                        <Space size={4} style={{overflow: 'visible'}}>Logo
                                                            Width (cm): <Tooltip
                                                                title="This width is for the smallest size of cloth"
                                                                styles={{root: {zIndex: 3000}}}
                                                                getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                style={{
                                                                    color: '#64748b',
                                                                    cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                    </Typography.Text>
                                                    <Input 
                                                        type="number" 
                                                        min={1} 
                                                        max={999} 
                                                        placeholder="e.g., 8"
                                                        value={itemList[item.__index]?.logoWidth || ''}
                                                        onChange={(e) => {
                                                            updateItemField(item.__index, 'logoWidth', Number(e.target.value));
                                                            validateField('logoWidth', Number(e.target.value), item.__index);
                                                        }}
                                                        style={{borderRadius: '8px'}} 
                                                        autoComplete="off"
                                                    />
                                                    {errors[`item_${item.__index}_logoHeight`] && (
                                                        <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                            {errors[`item_${item.__index}_logoHeight`]}
                                                        </Typography.Text>
                                                    )}
                                                </Box>
                                            </Col>
                                        </Row>
                                            
                                            <Divider style={{margin: '16px 0'}}>Button Information</Divider>
                                            
                                            <Row gutter={[16, 16]}>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Quantity: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={1} 
                                                            max={50} 
                                                            placeholder="e.g., 6"
                                                            value={itemList[item.__index]?.buttonQuantity || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonQuantity', Number(e.target.value));
                                                                validateField('buttonQuantity', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Holes: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={2} 
                                                            max={4} 
                                                            placeholder="e.g., 4"
                                                            value={itemList[item.__index]?.buttonHoles || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonHoles', Number(e.target.value));
                                                                validateField('buttonHoles', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                            </Row>
                                            
                                            <Row gutter={[16, 16]}>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Length (cm): <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={0.5} 
                                                            max={10} 
                                                            step={0.1} 
                                                            placeholder="e.g., 1.2"
                                                            value={itemList[item.__index]?.buttonLength || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonLength', Number(e.target.value));
                                                                validateField('buttonLength', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Width (cm): <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={0.5} 
                                                            max={10} 
                                                            step={0.1} 
                                                            placeholder="e.g., 1.0"
                                                            value={itemList[item.__index]?.buttonWidth || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonWidth', Number(e.target.value));
                                                                validateField('buttonWidth', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Color: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <ColorPicker
                                                            defaultValue="#FFFFFF"
                                                            value={itemList[item.__index]?.buttonColor || '#FFFFFF'}
                                                            onChange={(color) => {
                                                                const colorValue = color.toHexString();
                                                                updateItemField(item.__index, 'buttonColor', colorValue);
                                                            }}
                                                            showText
                                                            size="medium"
                                                            getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                                                            style={{
                                                                borderRadius: '8px',
                                                                width: '100%'
                                                            }}
                                                            popupStyle={{
                                                                zIndex: 9999
                                                            }}
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                            </Row>
                                            
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Button Note:
                                                </Typography.Text>
                                                <TextArea
                                                    rows={2}
                                                    placeholder="Add notes about buttons (optional)..."
                                                    style={{
                                                        borderRadius: '8px',
                                                        resize: 'none'
                                                    }}
                                                    autoComplete="off"
                                                />
                                                {errors[`item_${item.__index}_buttonNote`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_buttonNote`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>

                                            <Divider style={{margin: '16px 0'}}>Logo & Attaching Technique</Divider>

                                            <Row gutter={[16, 16]}>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            <Space size={4} style={{overflow: 'visible'}}>Logo Height
                                                                (cm): <Tooltip
                                                                    title="This height is for the smallest size of cloth"
                                                                    styles={{root: {zIndex: 3000}}}
                                                                    getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                    style={{
                                                                        color: '#64748b',
                                                                        cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input type="number" min={1} max={999} placeholder="e.g., 5"
                                                               style={{borderRadius: '8px'}} autoComplete="off"/>
                                                    </Box>
                                                </Col>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            <Space size={4} style={{overflow: 'visible'}}>Logo Width
                                                                (cm): <Tooltip
                                                                    title="This width is for the smallest size of cloth"
                                                                    styles={{root: {zIndex: 3000}}}
                                                                    getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                    style={{
                                                                        color: '#64748b',
                                                                        cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                    <Input type="number" min={1} max={999} placeholder="e.g., 8"
                                                           style={{borderRadius: '8px'}} autoComplete="off"/>
                                                </Box>
                                            </Col>
                                        </Row>

                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Attaching Technique: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Radio.Group
                                                    value={itemList[item.__index]?.attachingTechnique || ''}
                                                    onChange={(e) => {
                                                        updateItemField(item.__index, 'attachingTechnique', e.target.value);
                                                        validateField('attachingTechnique', e.target.value, item.__index);
                                                    }}
                                                >
                                                    <Space direction="vertical">
                                                        <Radio value="embroidery">Embroidery Techniques</Radio>
                                                        <Radio value="printing">Printing Techniques</Radio>
                                                        <Radio value="heatpress">Heat Press Techniques</Radio>
                                                    </Space>
                                                </Radio.Group>
                                                {errors[`item_${item.__index}_attachingTechnique`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_attachingTechnique`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>

                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Technique Note:
                                                </Typography.Text>
                                                <TextArea
                                                    rows={2}
                                                    placeholder="Add notes about attaching technique (optional)..."
                                                    style={{
                                                        borderRadius: '8px',
                                                        resize: 'none'
                                                    }}
                                                    autoComplete="off"
                                                />
                                                {errors[`item_${item.__index}_buttonNote`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_buttonNote`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </>
                                    )}
                                    {/* Hidden fields are no longer needed with state management */}
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Front Design: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Box sx={{position: 'relative'}}>
                                                    <input type="file" accept="image/*"
                                                           id={`front-upload-${item.__index}`} style={{display: 'none'}}
                                                           onChange={async (e) => {
                                                               const file = e.target.files[0];
                                                               if (file) {
                                                                   setUploading(true);
                                                                   try {
                                                                       const url = await uploadCloudinary(file);
                                                                       updateItemField(item.__index, 'frontUrl', url);
                                                                       setUploadedFiles(prev => ({
                                                                           ...prev,
                                                                           [`front-${item.__index}`]: url
                                                                       }));
                                                                   } finally {
                                                                       setUploading(false);
                                                                   }
                                                               }
                                                           }}/>
                                                    <Box sx={{width: '100%'}}>
                                                        <Button
                                                            onClick={() => document.getElementById(`front-upload-${item.__index}`).click()}
                                                            icon={<UploadOutlined/>} loading={uploading} style={{
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
                                                        }}>{uploading ? 'Uploading...' : 'Upload Front Design'}</Button>
                                                        {uploadedFiles[`front-${item.__index}`] && (
                                                            <Box
                                                                sx={{mt: 1, display: 'flex', justifyContent: 'center'}}>
                                                                <DisplayImage
                                                                    imageUrl={uploadedFiles[`front-${item.__index}`]}
                                                                    alt="Front Design"
                                                                    width="120px"
                                                                    height="120px"/>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {errors[`item_${item.__index}_frontUrl`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_frontUrl`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </Col>
                                        <Col span={12}>
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Back Design: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Box sx={{position: 'relative'}}>
                                                    <input type="file" accept="image/*"
                                                           id={`back-upload-${item.__index}`} style={{display: 'none'}}
                                                           onChange={async (e) => {
                                                               const file = e.target.files[0];
                                                               if (file) {
                                                                   setUploading(true);
                                                                   try {
                                                                       const url = await uploadCloudinary(file);
                                                                       updateItemField(item.__index, 'backUrl', url);
                                                                       setUploadedFiles(prev => ({
                                                                           ...prev,
                                                                           [`back-${item.__index}`]: url
                                                                       }));
                                                                   } finally {
                                                                       setUploading(false);
                                                                   }
                                                               }
                                                           }}/>
                                                    <Box sx={{width: '100%'}}>
                                                        <Button
                                                            onClick={() => document.getElementById(`back-upload-${item.__index}`).click()}
                                                            icon={<UploadOutlined/>} loading={uploading} style={{
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
                                                        }}>{uploading ? 'Uploading...' : 'Upload Back Design'}</Button>
                                                        {uploadedFiles[`back-${item.__index}`] && (
                                                            <Box
                                                                sx={{mt: 1, display: 'flex', justifyContent: 'center'}}>
                                                                <DisplayImage
                                                                    imageUrl={uploadedFiles[`back-${item.__index}`]}
                                                                    alt="Back Design"
                                                                    width="120px"
                                                                    height="120px"/>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {errors[`item_${item.__index}_frontUrl`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_frontUrl`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </Col>
                                    </Row>
                                    {/* designItemId is handled by state management */}
                                    
                                    {/* Hidden fields for button info when not shirt */}
                                    {/* Hidden fields are no longer needed with state management */}
                                </Card>
                            ))}
                        </>
                    )}

                    {modalOtherItems.length > 0 && (
                        <>
                            <Typography.Title level={5} style={{marginTop: 16}}>Others
                                ({modalOtherItems.length})</Typography.Title>
                            {modalOtherItems.map((item) => (
                                <Card key={`other-${item.__index}`} size="small"
                                      style={{marginBottom: '16px', border: '1px solid #e2e8f0'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                        {getItemIcon(item.type)}
                                        <Typography.Title level={5} style={{margin: 0}}>
                                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {formatCategory(item.category)}
                                        </Typography.Title>
                                        <Tag style={{marginLeft: 'auto'}}>Unspecified</Tag>
                                    </Box>
                                    {}
                                    {/* Hidden fields are no longer needed with state management */}
                                    {item.type.toLowerCase().includes('shirt') && (
                                        <>
                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <Box sx={{mb: 3}}>
                                                    <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                        <Space size={4} style={{overflow: 'visible'}}>Logo
                                                            Height (cm): <Tooltip
                                                                title="This height is for the smallest size of cloth"
                                                                styles={{root: {zIndex: 3000}}}
                                                                getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                style={{
                                                                    color: '#64748b',
                                                                    cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                    </Typography.Text>
                                                    <Input 
                                                        type="number" 
                                                        min={1} 
                                                        max={999} 
                                                        placeholder="e.g., 5"
                                                        value={itemList[item.__index]?.logoHeight || ''}
                                                        onChange={(e) => {
                                                            updateItemField(item.__index, 'logoHeight', Number(e.target.value));
                                                            validateField('logoHeight', Number(e.target.value), item.__index);
                                                        }}
                                                        style={{borderRadius: '8px'}} 
                                                        autoComplete="off"
                                                    />
                                                    {errors[`item_${item.__index}_logoHeight`] && (
                                                        <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                            {errors[`item_${item.__index}_logoHeight`]}
                                                        </Typography.Text>
                                                    )}
                                                </Box>
                                            </Col>
                                            <Col span={12}>
                                                <Box sx={{mb: 3}}>
                                                    <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                        <Space size={4} style={{overflow: 'visible'}}>Logo
                                                            Width (cm): <Tooltip
                                                                title="This width is for the smallest size of cloth"
                                                                styles={{root: {zIndex: 3000}}}
                                                                getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                style={{
                                                                    color: '#64748b',
                                                                    cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                    </Typography.Text>
                                                    <Input 
                                                        type="number" 
                                                        min={1} 
                                                        max={999} 
                                                        placeholder="e.g., 8"
                                                        value={itemList[item.__index]?.logoWidth || ''}
                                                        onChange={(e) => {
                                                            updateItemField(item.__index, 'logoWidth', Number(e.target.value));
                                                            validateField('logoWidth', Number(e.target.value), item.__index);
                                                        }}
                                                        style={{borderRadius: '8px'}} 
                                                        autoComplete="off"
                                                    />
                                                    {errors[`item_${item.__index}_logoHeight`] && (
                                                        <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                            {errors[`item_${item.__index}_logoHeight`]}
                                                        </Typography.Text>
                                                    )}
                                                </Box>
                                            </Col>
                                        </Row>
                                            
                                            <Divider style={{margin: '16px 0'}}>Button Information</Divider>
                                            
                                            <Row gutter={[16, 16]}>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Quantity: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={1} 
                                                            max={50} 
                                                            placeholder="e.g., 6"
                                                            value={itemList[item.__index]?.buttonQuantity || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonQuantity', Number(e.target.value));
                                                                validateField('buttonQuantity', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Holes: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={2} 
                                                            max={4} 
                                                            placeholder="e.g., 4"
                                                            value={itemList[item.__index]?.buttonHoles || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonHoles', Number(e.target.value));
                                                                validateField('buttonHoles', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                            </Row>
                                            
                                            <Row gutter={[16, 16]}>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Length (cm): <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={0.5} 
                                                            max={10} 
                                                            step={0.1} 
                                                            placeholder="e.g., 1.2"
                                                            value={itemList[item.__index]?.buttonLength || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonLength', Number(e.target.value));
                                                                validateField('buttonLength', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Width (cm): <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input 
                                                            type="number" 
                                                            min={0.5} 
                                                            max={10} 
                                                            step={0.1} 
                                                            placeholder="e.g., 1.0"
                                                            value={itemList[item.__index]?.buttonWidth || ''}
                                                            onChange={(e) => {
                                                                updateItemField(item.__index, 'buttonWidth', Number(e.target.value));
                                                                validateField('buttonWidth', Number(e.target.value), item.__index);
                                                            }}
                                                            style={{borderRadius: '8px'}} 
                                                            autoComplete="off"
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                                <Col span={8}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            Button Color: <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <ColorPicker
                                                            defaultValue="#FFFFFF"
                                                            value={itemList[item.__index]?.buttonColor || '#FFFFFF'}
                                                            onChange={(color) => {
                                                                const colorValue = color.toHexString();
                                                                updateItemField(item.__index, 'buttonColor', colorValue);
                                                            }}
                                                            showText
                                                            size="medium"
                                                            getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                                                            style={{
                                                                borderRadius: '8px',
                                                                width: '100%'
                                                            }}
                                                            popupStyle={{
                                                                zIndex: 9999
                                                            }}
                                                        />
                                                        {errors[`item_${item.__index}_buttonQuantity`] && (
                                                            <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                                {errors[`item_${item.__index}_buttonQuantity`]}
                                                            </Typography.Text>
                                                        )}
                                                    </Box>
                                                </Col>
                                            </Row>
                                            
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Button Note:
                                                </Typography.Text>
                                                <TextArea
                                                    rows={2}
                                                    placeholder="Add notes about buttons (optional)..."
                                                    style={{
                                                        borderRadius: '8px',
                                                        resize: 'none'
                                                    }}
                                                    autoComplete="off"
                                                />
                                                {errors[`item_${item.__index}_buttonNote`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_buttonNote`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>

                                            <Divider style={{margin: '16px 0'}}>Logo & Attaching Technique</Divider>

                                            <Row gutter={[16, 16]}>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            <Space size={4} style={{overflow: 'visible'}}>Logo Height
                                                                (cm): <Tooltip
                                                                    title="This height is for the smallest size of cloth"
                                                                    styles={{root: {zIndex: 3000}}}
                                                                    getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                    style={{
                                                                        color: '#64748b',
                                                                        cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                        <Input type="number" min={1} max={999} placeholder="e.g., 5"
                                                               style={{borderRadius: '8px'}} autoComplete="off"/>
                                                    </Box>
                                                </Col>
                                                <Col span={12}>
                                                    <Box sx={{mb: 3}}>
                                                        <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                            <Space size={4} style={{overflow: 'visible'}}>Logo Width
                                                                (cm): <Tooltip
                                                                    title="This width is for the smallest size of cloth"
                                                                    styles={{root: {zIndex: 3000}}}
                                                                    getPopupContainer={() => document.body}><InfoCircleOutlined
                                                                    style={{
                                                                        color: '#64748b',
                                                                        cursor: 'pointer'
                                                                }}/></Tooltip></Space> <span style={{color: 'red'}}>*</span>
                                                        </Typography.Text>
                                                    <Input type="number" min={1} max={999} placeholder="e.g., 8"
                                                           style={{borderRadius: '8px'}} autoComplete="off"/>
                                                </Box>
                                            </Col>
                                        </Row>

                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Attaching Technique: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Radio.Group
                                                    value={itemList[item.__index]?.attachingTechnique || ''}
                                                    onChange={(e) => {
                                                        updateItemField(item.__index, 'attachingTechnique', e.target.value);
                                                        validateField('attachingTechnique', e.target.value, item.__index);
                                                    }}
                                                >
                                                    <Space direction="vertical">
                                                        <Radio value="embroidery">Embroidery Techniques</Radio>
                                                        <Radio value="printing">Printing Techniques</Radio>
                                                        <Radio value="heatpress">Heat Press Techniques</Radio>
                                                    </Space>
                                                </Radio.Group>
                                                {errors[`item_${item.__index}_attachingTechnique`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_attachingTechnique`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>

                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Technique Note:
                                                </Typography.Text>
                                                <TextArea
                                                    rows={2}
                                                    placeholder="Add notes about attaching technique (optional)..."
                                                    style={{
                                                        borderRadius: '8px',
                                                        resize: 'none'
                                                    }}
                                                    autoComplete="off"
                                                />
                                                {errors[`item_${item.__index}_buttonNote`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_buttonNote`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </>
                                    )}
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Front Design: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Box sx={{position: 'relative'}}>
                                                    <input type="file" accept="image/*"
                                                           id={`front-upload-${item.__index}`} style={{display: 'none'}}
                                                           onChange={async (e) => {
                                                               const file = e.target.files[0];
                                                               if (file) {
                                                                   setUploading(true);
                                                                   try {
                                                                       const url = await uploadCloudinary(file);
                                                                       updateItemField(item.__index, 'frontUrl', url);
                                                                       setUploadedFiles(prev => ({
                                                                           ...prev,
                                                                           [`front-${item.__index}`]: url
                                                                       }));
                                                                   } finally {
                                                                       setUploading(false);
                                                                   }
                                                               }
                                                           }}/>
                                                    <Box sx={{width: '100%'}}>
                                                        <Button
                                                            onClick={() => document.getElementById(`front-upload-${item.__index}`).click()}
                                                            icon={<UploadOutlined/>} loading={uploading} style={{
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
                                                        }}>{uploading ? 'Uploading...' : 'Upload Front Design'}</Button>
                                                        {uploadedFiles[`front-${item.__index}`] && (
                                                            <Box
                                                                sx={{mt: 1, display: 'flex', justifyContent: 'center'}}>
                                                                <DisplayImage
                                                                    imageUrl={uploadedFiles[`front-${item.__index}`]}
                                                                    alt="Front Design"
                                                                    width="120px"
                                                                    height="120px"/>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {errors[`item_${item.__index}_frontUrl`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_frontUrl`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </Col>
                                        <Col span={12}>
                                            <Box sx={{mb: 3}}>
                                                <Typography.Text strong style={{display: 'block', marginBottom: '8px'}}>
                                                    Back Design: <span style={{color: 'red'}}>*</span>
                                                </Typography.Text>
                                                <Box sx={{position: 'relative'}}>
                                                    <input type="file" accept="image/*"
                                                           id={`back-upload-${item.__index}`} style={{display: 'none'}}
                                                           onChange={async (e) => {
                                                               const file = e.target.files[0];
                                                               if (file) {
                                                                   setUploading(true);
                                                                   try {
                                                                       const url = await uploadCloudinary(file);
                                                                       updateItemField(item.__index, 'backUrl', url);
                                                                       setUploadedFiles(prev => ({
                                                                           ...prev,
                                                                           [`back-${item.__index}`]: url
                                                                       }));
                                                                   } finally {
                                                                       setUploading(false);
                                                                   }
                                                               }
                                                           }}/>
                                                    <Box sx={{width: '100%'}}>
                                                        <Button
                                                            onClick={() => document.getElementById(`back-upload-${item.__index}`).click()}
                                                            icon={<UploadOutlined/>} loading={uploading} style={{
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
                                                        }}>{uploading ? 'Uploading...' : 'Upload Back Design'}</Button>
                                                        {uploadedFiles[`back-${item.__index}`] && (
                                                            <Box
                                                                sx={{mt: 1, display: 'flex', justifyContent: 'center'}}>
                                                                <DisplayImage
                                                                    imageUrl={uploadedFiles[`back-${item.__index}`]}
                                                                    alt="Back Design"
                                                                    width="120px"
                                                                    height="120px"/>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {errors[`item_${item.__index}_frontUrl`] && (
                                                    <Typography.Text type="danger" style={{fontSize: '12px'}}>
                                                        {errors[`item_${item.__index}_frontUrl`]}
                                                    </Typography.Text>
                                                )}
                                            </Box>
                                        </Col>
                                    </Row>
                                    {/* designItemId is handled by state management */}
                                    
                                    {/* Hidden fields for button info when not shirt */}
                                    {/* Hidden fields are no longer needed with state management */}
                                </Card>
                            ))}
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #f0f0f0'}}>
                <Button onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="primary"
                    onClick={handleOk}
                    loading={isSubmittingDelivery}
                    disabled={isSubmittingDelivery}
                    style={{
                        backgroundColor: '#1976d2',
                        borderColor: '#1976d2'
                    }}
                >
                    {isSubmittingDelivery ? 'Submitting...' : 'Submit Delivery'}
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
    const [isAppliedRequestDetailVisible, setIsAppliedRequestDetailVisible] = useState(false);
    const [isDeliveryDetailModalVisible, setIsDeliveryDetailModalVisible] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [isDeliveryFromRevision, setIsDeliveryFromRevision] = useState(false);
    const [selectedRevision, setSelectedRevision] = useState(null);
    const [openDeliveryAsRevision, setOpenDeliveryAsRevision] = useState(false);
    const [loadingDeliveries, setLoadingDeliveries] = useState(false);
    const [revisionRequests, setRevisionRequests] = useState([]);
    const [loadingRevisionRequests, setLoadingRevisionRequests] = useState(false);
    const [finalDelivery, setFinalDelivery] = useState(null);
    const [isFinalDesignSet, setIsFinalDesignSet] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const roomId = requestData?.id;
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isViewOnly = requestData?.status === 'completed';
    const schoolName = requestData?.school?.business || 'School';
    const [isOpenButtonHover, setIsOpenButtonHover] = useState(false);
    const emojiPickerRef = useRef(null);

    const {chatMessages, unreadCount, sendMessage, markAsRead} = UseDesignerChatMessages(roomId, userInfo);
    
    // Get user info from cookie instead of Firebase auth
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userData = await getAccessCookie();
                if (userData) {
                    setUserInfo(userData);
                } else {
                    console.warn("No user data found in cookie");
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };
        
        fetchUserInfo();
        
        // Set up interval to refresh user info periodically (every 5 minutes)
        const interval = setInterval(fetchUserInfo, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isChatOpen) markAsRead();
    }, [isChatOpen, chatMessages, markAsRead]);

    const fetchDesignDeliveries = async (designRequestId) => {
        try {
            setLoadingDeliveries(true);
            const response = await getDesignDeliveries(designRequestId);
            if (response && response.status === 200) {
                const deliveries = response.data.body || [];
                setDesignDeliveries(deliveries);

                if (requestData?.resultDelivery) {
                    setFinalDelivery(requestData.resultDelivery);
                    setIsFinalDesignSet(true);
                } else {
                    const finalDelivery = deliveries.find(delivery => delivery.isFinal);
                    if (finalDelivery) {
                        setFinalDelivery(finalDelivery);
                        setIsFinalDesignSet(true);
                    }
                }
            } else {
                setDesignDeliveries([]);
            }
        } catch (err) {
            console.log(err)
            setDesignDeliveries([]);
        } finally {
            setLoadingDeliveries(false);
        }
    };

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
            console.log(err)
            setRevisionRequests([]);
        } finally {
            setLoadingRevisionRequests(false);
        }
    };

    const fetchRequestDetails = async (requestId) => {
        try {
            const response = await getDesignRequestDetailForDesigner(requestId);
            if (response && response.status === 200) {
                const request = response.data.body;

                if (request) {

                    setRequestData(request);

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
            console.log(error)
            window.location.href = '/designer/requests';
        }
    };

    useEffect(() => {
        const storedRequestId = localStorage.getItem('currentDesignRequestId');
        if (storedRequestId) {
            fetchRequestDetails(storedRequestId);
        } else {
            window.location.href = '/designer/requests';
        }
    }, []);

    useEffect(() => {
        if (requestData?.resultDelivery) {
            setFinalDelivery(requestData.resultDelivery);
            setIsFinalDesignSet(true);
        } else {
            setFinalDelivery(null);
            setIsFinalDesignSet(false);
        }
    }, [requestData?.resultDelivery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage.trim());
            setNewMessage('');
            setShowEmojiPicker(false);
        }
    };


    const onEmojiClick = (emojiData) => {
        setNewMessage(prevMsg => prevMsg + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleOpenDeliveryModal = async () => {
        setIsDeliveryModalVisible(true);
        if (requestData?.id) {
            getDesignRequestDetailForDesigner(requestData.id)
                .then((latestResponse) => {
                    if (latestResponse && latestResponse.status === 200) {
                        const updatedRequest = latestResponse.data.body;
                        if (updatedRequest) {
                            if (updatedRequest.status === 'completed') {
                                setIsDeliveryModalVisible(false);
                                window.location.href = '/designer/quotations';
                                return;
                            }
                            setRequestData(updatedRequest);
                        }
                    }
                })
                .catch(() => {
                });
        }
    };

    const handleCloseDeliveryModal = () => {
        setIsDeliveryModalVisible(false);
        setOpenDeliveryAsRevision(false);
    };


    const handleOpenAppliedRequestDetail = () => {
        setIsAppliedRequestDetailVisible(true);
    };

    const handleCloseAppliedRequestDetail = () => {
        setIsAppliedRequestDetailVisible(false);
    };

    const handleOpenDeliveryDetailModal = (delivery, fromRevision = false, revision = null) => {
        setSelectedDelivery(delivery);
        setIsDeliveryFromRevision(fromRevision);
        setSelectedRevision(revision);
        setIsDeliveryDetailModalVisible(true);
    };

    const handleCloseDeliveryDetailModal = () => {
        setIsDeliveryDetailModalVisible(false);
        setSelectedDelivery(null);
        setIsDeliveryFromRevision(false);
        setSelectedRevision(null);
    };

    const handleAddRevisionDelivery = () => {
        handleCloseDeliveryDetailModal();
        setOpenDeliveryAsRevision(true);
        handleOpenDeliveryModal();
    };


    const handleDeliverySubmit = async (deliveryData) => {
        try {
            const response = await createDesignDelivery(deliveryData);

            if (response && response.status === 201) {
                enqueueSnackbar('Delivery submitted successfully!', {variant: 'success'});
                handleCloseDeliveryModal();

                if (requestData?.id) {
                    fetchDesignDeliveries(requestData.id);
                    fetchRevisionRequests(requestData.id);

                    try {
                        const latestResponse = await getDesignRequestDetailForDesigner(requestData.id);
                        if (latestResponse && latestResponse.status === 200) {
                            const updatedRequest = latestResponse.data.body;
                            if (updatedRequest) {
                                if (updatedRequest.status === 'completed') {
                                    window.location.href = '/designer/quotations';
                                    return;
                                }
                                setRequestData(updatedRequest);
                            }
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
            } else {
                enqueueSnackbar('Failed to submit delivery. Please try again.', {variant: 'error'});
            }
        } catch (error) {
            console.log(error)
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

                    {}
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
                                    onClick={handleOpenAppliedRequestDetail}
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
                                    color={requestData?.status === 'completed' ? 'default' : 'warning'}
                                    size="large"
                                    style={{
                                        backgroundColor: requestData?.status === 'completed' ? '#1890ff' :
                                            requestData?.status === 'processing' ? '#7c3aed' : '#52c41a',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        padding: '8px 16px',
                                        color: 'white'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        flex: 1,
                        minHeight: 0,
                        height: '90vh',
                        position: 'relative'
                    }}>
                        {}
                        <Box sx={{display: 'flex', gap: 3, flex: 2, alignItems: 'stretch'}}>
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'stretch',
                                gap: 3,
                                maxHeight: '100vh',
                                minWidth: 0
                            }}>

                                {}
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
                                    {}
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
                                                    My Designs
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


                                    <Box sx={{
                                        flex: 1,
                                        p: 2,
                                        overflowY: 'auto',
                                        maxHeight: 'calc(4 * 140px + 2 * 16px)'
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
                                                    Loading designs...
                                                </Typography.Text>
                                            </Box>
                                        ) : designDeliveries.length === 0 ? (
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                gap: 3,
                                                color: '#64748b'
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}>
                                                    <FileTextOutlined style={{fontSize: '48px', opacity: 0.5}}/>
                                                    <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                                        {requestData?.status === 'completed' ? 'Design request completed - no actions available' :
                                                            'No designs yet. Start by adding your first design!'}
                                                    </Typography.Text>
                                                    {requestData?.status === 'completed' && (
                                                        <Typography.Text type="secondary"
                                                                         style={{
                                                                             fontSize: '12px',
                                                                             color: '#1890ff'
                                                                         }}>
                                                            This design request has been completed
                                                        </Typography.Text>
                                                    )}
                                                </Box>

                                                {requestData?.status === 'processing' && (
                                                    <Button
                                                        type="dashed"
                                                        icon={<FileTextOutlined/>}
                                                        onClick={handleOpenDeliveryModal}
                                                        style={{
                                                            borderRadius: '8px',
                                                            height: '48px',
                                                            width: '100%',
                                                            border: '2px dashed #d9d9d9',
                                                            color: '#666',
                                                            fontSize: '14px',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        + Add New Design
                                                    </Button>
                                                )}
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
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
                                                                width: '100%',
                                                                minHeight: '120px',
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                '&:hover': {
                                                                    borderColor: '#1976d2',
                                                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                                                                    transform: 'translateY(-2px)'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                flex: 1,
                                                                gap: 1
                                                            }}>
                                                                <Typography.Title level={5}
                                                                                  style={{
                                                                                      margin: 0,
                                                                                      color: '#1e293b'
                                                                                  }}>
                                                                    {item.name}
                                                                </Typography.Title>
                                                                <Typography.Text type="secondary"
                                                                                 style={{fontSize: '12px'}}>
                                                                    {(() => {
                                                                        const date = new Date(item.submitDate);
                                                                        const day = String(date.getDate()).padStart(2, '0');
                                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                        const year = date.getFullYear();
                                                                        const hours = String(date.getHours()).padStart(2, '0');
                                                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                                                        const seconds = String(date.getSeconds()).padStart(2, '0');
                                                                        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                                                                    })()}
                                                                </Typography.Text>
                                                            </Box>

                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'flex-end',
                                                                gap: 1
                                                            }}>
                                                                <Tag color="blue" style={{margin: 0}}>
                                                                    {parseID(item.id, 'dd')}
                                                                </Tag>
                                                                <Button
                                                                    size="small"
                                                                    icon={<EyeOutlined/>}
                                                                    onClick={() => handleOpenDeliveryDetailModal(item)}
                                                                    style={{
                                                                        borderRadius: '8px',
                                                                        minWidth: '120px',
                                                                        height: '36px',
                                                                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                                                        border: 'none',
                                                                        color: 'white',
                                                                        fontWeight: 600,
                                                                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                                                                    }}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </Box>
                                                        </Paper>
                                                    ))
                                                }

                                                {requestData?.status === 'processing' && (
                                                    <Box sx={{
                                                        gridColumn: '1 / -1',
                                                        mt: 2
                                                    }}>
                                                        <Button
                                                            type="dashed"
                                                            icon={<FileTextOutlined/>}
                                                            onClick={handleOpenDeliveryModal}
                                                            style={{
                                                                borderRadius: '8px',
                                                                height: '48px',
                                                                width: '100%',
                                                                border: '2px dashed #d9d9d9',
                                                                color: '#666',
                                                                fontSize: '14px',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            + Add New Design
                                                        </Button>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>

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
                                                        Track revision requests from school
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
                                                        'No revision requests'}
                                                </Typography.Text>
                                                {requestData?.status === 'completed' && (
                                                    <Typography.Text type="secondary"
                                                                     style={{fontSize: '12px', color: '#ff6b35'}}>
                                                        This design request has been completed
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
                                                {revisionRequests.map((revision, index) => (
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
                                                                    {(() => {
                                                                        const date = new Date(revision.requestDate);
                                                                        const day = String(date.getDate()).padStart(2, '0');
                                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                        const year = date.getFullYear();
                                                                        const hours = String(date.getHours()).padStart(2, '0');
                                                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                                                        const seconds = String(date.getSeconds()).padStart(2, '0');
                                                                        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                                                                    })()}
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
                                                                        handleOpenDeliveryDetailModal(delivery, true, revision);
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
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>

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
                                        Final Design
                                    </Typography.Title>
                                </Box>
                            </Box>

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
                                                         style={{fontSize: '11px', display: 'block', mb: 1}}>
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
                                            {requestData?.status === 'completed' ? 'Design completed' : 'No final design selected'}
                                        </Typography.Text>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Container>

            <DeliverySubmissionModal
                visible={isDeliveryModalVisible}
                onCancel={handleCloseDeliveryModal}
                onSubmit={handleDeliverySubmit}
                designDeliveries={designDeliveries}
                requestData={requestData}
                initialDeliveryType={openDeliveryAsRevision ? 'revision' : 'normal'}
            />


            <AppliedRequestDetail
                visible={isAppliedRequestDetailVisible}
                onCancel={handleCloseAppliedRequestDetail}
                request={requestData}
                hideFooterButtons={true}
            />

            <DeliveryDetailModal
                visible={isDeliveryDetailModalVisible}
                onCancel={handleCloseDeliveryDetailModal}
                delivery={selectedDelivery}
                revision={selectedRevision}
                showAddRevisionButton={isDeliveryFromRevision}
                onAddRevision={handleAddRevisionDelivery}
            />

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
                            border: '2px solid #1976d2',
                            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                            opacity: 1,
                            backgroundColor: '#ffffff'
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
                                <BankOutlined/>
                                <Typography.Text style={{fontWeight: 600}}>
                                    School: {schoolName}
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
                                        {!userInfo ? 'Loading user info...' : 'No messages yet. Start the conversation!'}
                                    </Typography.Text>
                                </Box>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {chatMessages.map((msg, index) => (
                                        <Box key={msg.id || index} sx={{
                                            display: 'flex',
                                            justifyContent: msg.userId === userInfo?.id ? 'flex-end' : 'flex-start'
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                gap: 0.5,
                                                maxWidth: '80%'
                                            }}>
                                                {msg.userId !== userInfo?.id && (
                                                    <Avatar size="small" style={{backgroundColor: '#1976d2'}}
                                                            icon={<BankOutlined/>}/>
                                                )}
                                                <Box sx={{
                                                    p: 1.5,
                                                    borderRadius: 3,
                                                    backgroundColor: msg.userId === userInfo?.id ? '#1976d2' : '#ffffff',
                                                    background: msg.userId === userInfo?.id ? 'linear-gradient(135deg, #1976d2, #42a5f5)' : 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                                    color: msg.userId === userInfo?.id ? 'white' : '#1e293b',
                                                    border: msg.userId !== userInfo?.id ? '1px solid #e2e8f0' : 'none',
                                                    boxShadow: msg.userId === userInfo?.id ? '0 2px 8px rgba(25, 118, 210, 0.3)' : '0 1px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    <Typography.Text style={{
                                                        fontSize: '10px',
                                                        color: msg.userId === userInfo?.id ? 'rgba(255,255,255,0.8)' : '#94a3b8'
                                                    }}>
                                                        {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : ''}
                                                    </Typography.Text>
                                                    {msg.text && (
                                                        <Typography.Text style={{
                                                            fontSize: '14px',
                                                            display: 'block',
                                                            color: (msg.userId === userInfo?.id) ? 'white' : '#1e293b'
                                                        }}>
                                                            {msg.text}
                                                        </Typography.Text>
                                                    )}
                                                </Box>
                                                {msg.userId === userInfo?.id && (
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
                            <Box sx={{display: 'flex', gap: 1, alignItems: 'flex-end'}}>
                                <Box sx={{flex: 1, position: 'relative'}}>
                                    <Input.TextArea
                                        size="large"
                                        placeholder={!userInfo ? 'Loading user info...' : 'Type your message...'}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onPressEnter={(e) => {
                                            if (!e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        disabled={isViewOnly || !userInfo}
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                        style={{
                                            borderRadius: '12px',
                                            padding: '12px 16px',
                                            border: '1px solid #e2e8f0',
                                            resize: 'none',
                                            lineHeight: '1.5'
                                        }}
                                    />
                                    {showEmojiPicker && (
                                        <Box
                                            ref={emojiPickerRef}
                                            sx={{
                                                position: 'absolute',
                                                bottom: 'calc(100% + 8px)',
                                                left: 0,
                                                zIndex: 10,
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                            }}
                                        >
                                            <EmojiPicker onEmojiClick={onEmojiClick} height={300} width={280}/>
                                        </Box>
                                    )}
                                </Box>


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
                            onMouseEnter={() => setIsOpenButtonHover(true)}
                            onMouseLeave={() => setIsOpenButtonHover(false)}
                            style={{
                                width: isOpenButtonHover ? '60px' : '56px',
                                height: isOpenButtonHover ? '60px' : '56px',
                                transform: isOpenButtonHover ? 'translateY(-2px)' : 'none',
                                transition: 'all 150ms ease',
                                boxShadow: isOpenButtonHover ? '0 10px 28px rgba(25, 118, 210, 0.5)' : '0 8px 24px rgba(25, 118, 210, 0.4)',
                                background: isOpenButtonHover ? 'linear-gradient(135deg, #1976d2, #1e88e5)' : 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                animation: isOpenButtonHover ? 'unisew-chat-shake 220ms ease-in-out' : 'none',
                                willChange: 'transform',
                                border: 'none'
                            }}
                        />
                    </Badge>
                )}
            </Box>
        </Box>
    );
}