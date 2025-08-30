import React, {useEffect, useRef, useState} from 'react';
import {Avatar, Badge, Button, Col, Form, Input, Modal, Row, Tag, Typography} from 'antd';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import {
    CheckCircleOutlined,
    CheckCircleOutlined as CheckCircleOutlinedIcon,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    DownloadOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    FileTextOutlined as FileTextOutlinedIcon,
    InfoCircleOutlined,
    MessageOutlined,
    SendOutlined,
    SmileOutlined,
    SyncOutlined,
    UserOutlined,
    UserSwitchOutlined
} from '@ant-design/icons';
import {Box, Chip, Container, Dialog, Paper} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import {useSnackbar} from 'notistack';
import {parseID} from '../../../utils/ParseIDUtil.jsx';
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

import RequestDetailPopup from './dialog/RequestDetailPopup.jsx';
import {getAccessCookie} from "../../../utils/CookieUtil.jsx";


const {TextArea} = Input;

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

const formatCategory = (category) => {
    const v = (category || '').toLowerCase();
    return v === 'pe' ? 'physical education' : (category || '');
};

// Function to download design as ZIP with organized folder structure
const downloadDesignAsZip = async (delivery) => {
    try {
        const zip = new JSZip();

        // Helper function to fetch image and convert to blob
        const fetchImageAsBlob = async (imageUrl) => {
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const blob = await response.blob();
                return blob;
            } catch (error) {
                console.error('Error fetching image:', error);
                return null;
            }
        };

        // Group items by gender and category
        const boyItems = delivery.deliveryItems?.filter(item =>
            item.designItem?.gender?.toLowerCase() === 'boy'
        ) || [];
        const girlItems = delivery.deliveryItems?.filter(item =>
            item.designItem?.gender?.toLowerCase() === 'girl'
        ) || [];

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
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                shirtFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                shirtFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add pants items
                if (pantsItems.length > 0) {
                    const pantsFolder = regularFolder.folder("pants");
                    for (let i = 0; i < pantsItems.length; i++) {
                        const item = pantsItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                pantsFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                pantsFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add skirt items
                if (skirtItems.length > 0) {
                    const skirtFolder = regularFolder.folder("skirt");
                    for (let i = 0; i < skirtItems.length; i++) {
                        const item = skirtItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                skirtFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                skirtFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add other items
                if (otherItems.length > 0) {
                    const otherFolder = regularFolder.folder("other");
                    for (let i = 0; i < otherItems.length; i++) {
                        const item = otherItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                otherFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                otherFolder.file(`back_design.png`, backBlob);
                            }
                        }
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
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                shirtFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                shirtFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add pants items
                if (pantsItems.length > 0) {
                    const pantsFolder = peFolder.folder("pants");
                    for (let i = 0; i < pantsItems.length; i++) {
                        const item = pantsItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                pantsFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                pantsFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add skirt items
                if (skirtItems.length > 0) {
                    const skirtFolder = peFolder.folder("skirt");
                    for (let i = 0; i < skirtItems.length; i++) {
                        const item = skirtItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                skirtFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                skirtFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add other items
                if (otherItems.length > 0) {
                    const otherFolder = peFolder.folder("other");
                    for (let i = 0; i < otherItems.length; i++) {
                        const item = otherItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                otherFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                otherFolder.file(`back_design.png`, backBlob);
                            }
                        }
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
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                shirtFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                shirtFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add pants items
                if (pantsItems.length > 0) {
                    const pantsFolder = regularFolder.folder("pants");
                    for (let i = 0; i < pantsItems.length; i++) {
                        const item = pantsItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                pantsFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                pantsFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add skirt items
                if (skirtItems.length > 0) {
                    const skirtFolder = regularFolder.folder("skirt");
                    for (let i = 0; i < skirtItems.length; i++) {
                        const item = skirtItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                skirtFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                skirtFolder.file(`back_design.png`, backBlob);
                            }
                        }
                    }
                }

                // Add other items
                if (otherItems.length > 0) {
                    const otherFolder = regularFolder.folder("other");
                    for (let i = 0; i < otherItems.length; i++) {
                        const item = otherItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                otherFolder.file(`front_design.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                otherFolder.file(`back_design.png`, backBlob);
                            }
                        }
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
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                shirtFolder.file(`front_design_${i + 1}.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                shirtFolder.file(`back_design_${i + 1}.png`, backBlob);
                            }
                        }
                    }
                }

                // Add pants items
                if (pantsItems.length > 0) {
                    const pantsFolder = peFolder.folder("pants");
                    for (let i = 0; i < pantsItems.length; i++) {
                        const item = pantsItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                pantsFolder.file(`front_design_${i + 1}.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                pantsFolder.file(`back_design_${i + 1}.png`, backBlob);
                            }
                        }
                    }
                }

                // Add skirt items
                if (skirtItems.length > 0) {
                    const skirtFolder = peFolder.folder("skirt");
                    for (let i = 0; i < skirtItems.length; i++) {
                        const item = skirtItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                skirtFolder.file(`front_design_${i + 1}.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                skirtFolder.file(`back_design_${i + 1}.png`, backBlob);
                            }
                        }
                    }
                }

                // Add other items
                if (otherItems.length > 0) {
                    const otherFolder = peFolder.folder("other");
                    for (let i = 0; i < otherItems.length; i++) {
                        const item = otherItems[i];
                        if (item.frontImageUrl) {
                            const frontBlob = await fetchImageAsBlob(item.frontImageUrl);
                            if (frontBlob) {
                                otherFolder.file(`front_design_${i + 1}.png`, frontBlob);
                            }
                        }
                        if (item.backImageUrl) {
                            const backBlob = await fetchImageAsBlob(item.backImageUrl);
                            if (backBlob) {
                                otherFolder.file(`back_design_${i + 1}.png`, backBlob);
                            }
                        }
                    }
                }
            }
        }

        // Generate and download ZIP file
        const content = await zip.generateAsync({type: "blob"});
        const fileName = `${delivery.name}_UniSew.zip`;
        saveAs(content, fileName);

        return true;
    } catch (error) {
        console.error('Error creating ZIP file:', error);
        return false;
    }
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


export function UseDesignChatMessages(roomId, userInfo) {
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
            accountId: accountId,
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
            {}
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

            {}
            <Box sx={{
                display: 'flex',
                height: 'calc(90vh - 120px)',
                overflow: 'hidden'
            }}>
                {}
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

                            {/* Download Design Button */}
                            <Box sx={{
                                mt: 3,
                                pt: 2,
                                borderTop: '1px solid #e2e8f0'
                            }}>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined/>}
                                    onClick={async () => {
                                        try {
                                            await downloadDesignAsZip(delivery);
                                        } catch (error) {
                                            console.error('Download error:', error);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        borderRadius: '6px',
                                        background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                        border: 'none',
                                        fontWeight: 600,
                                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(46, 125, 50, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(46, 125, 50, 0.2)';
                                    }}
                                >
                                    Download Design
                                </Button>
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

                {}
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
                        {}
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
                                    {}
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
                                                        {}
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

                                                        {}
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


                                                        {}
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

                                                        {}
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

                                    {}
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
                                                        {}
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

                                                        {}
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

                                                        {}
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

                                                        {}
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

                                    {}
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
                                                        {}
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

                                                        {}
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

                                                        {}
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

                                                        {}
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
                    return;
                }
                onSubmit(values);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const calculatePrice = (quantity) => {
        if (quantity === 9999) return extraRevisionPrice * 20;
        return quantity * extraRevisionPrice;
    };

    const maxQuantityAllowed = () => {
        const maxPrice = 200000000;
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

                {}
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
    const [userInfo, setUserInfo] = useState(null);
    const roomId = requestData?.id;
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isViewOnly = (isFinalDesignSet || requestData?.status === 'completed');
    const canAccessChat = requestData?.status !== 'canceled'; // Cho phép vào chat nếu không bị canceled
    const designerName = requestData?.finalDesignQuotation?.designer?.customer?.name
        || requestData?.designer?.customer?.name
        || 'Designer';
    const [isOpenButtonHover, setIsOpenButtonHover] = useState(false);
    const emojiPickerRef = useRef(null);

    const {chatMessages, unreadCount, sendMessage, markAsRead} = UseDesignChatMessages(roomId, userInfo);
    
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
        if (isChatOpen && chatMessages.length) {
            markAsRead();
        }
    }, [chatMessages, isChatOpen]);


    const fetchDesignDeliveries = async (designRequestId) => {
        try {
            setLoadingDeliveries(true);
            const response = await getDesignDeliveries(designRequestId);
            if (response && response.status === 200) {
                console.log("Design deliveries: ", response.data.body);
                const deliveries = response.data.body || [];
                setDesignDeliveries(deliveries);

                // Tìm delivery đã được set làm final
                const finalDelivery = deliveries.find(delivery => delivery.isFinal);
                if (finalDelivery) {
                    setFinalDelivery(finalDelivery);
                    setIsFinalDesignSet(true);
                } else if (requestData?.status === 'completed' && deliveries.length > 0) {
                    // Nếu request đã completed và không có delivery nào được đánh dấu là final
                    // Có thể delivery đã được xử lý ở backend hoặc cần được chọn thủ công
                    // Kiểm tra xem có delivery nào có thể là final không

                    // Ưu tiên tìm delivery có version cao nhất hoặc submitDate mới nhất
                    const sortedDeliveries = [...deliveries].sort((a, b) => {
                        // Nếu có version, sắp xếp theo version
                        if (a.version && b.version) {
                            return b.version - a.version;
                        }
                        // Nếu không có version, sắp xếp theo submitDate
                        return new Date(b.submitDate) - new Date(a.submitDate);
                    });

                    const mostRecentDelivery = sortedDeliveries[0];
                    if (mostRecentDelivery) {
                        setFinalDelivery(mostRecentDelivery);
                        setIsFinalDesignSet(true);
                    }
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

    const fetchRequestDetails = async (requestId) => {
        try {
            const response = await getDesignRequestDetailForSchool(requestId);
            if (response && response.status === 200) {
                console.log("Request details: ", response.data.body);
                const request = response.data.body;
                setRequestData(request);
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
            fetchRequestDetails(storedRequestId);
        } else {
            window.location.href = '/school/design';
        }
    }, []);

    // Effect để cập nhật finalDelivery khi requestData thay đổi
    useEffect(() => {
        if (requestData?.status === 'completed' && designDeliveries.length > 0 && !finalDelivery) {
            // Nếu request đã completed và có deliveries nhưng chưa có finalDelivery
            // Kiểm tra xem có delivery nào được set làm final không
            const finalDeliveryFromList = designDeliveries.find(delivery => delivery.isFinal);
            if (finalDeliveryFromList) {
                setFinalDelivery(finalDeliveryFromList);
                setIsFinalDesignSet(true);
            } else if (designDeliveries.length > 0) {
                // Nếu không có delivery nào được đánh dấu là final, 
                // có thể lấy delivery cuối cùng hoặc delivery đầu tiên
                const lastDelivery = designDeliveries[designDeliveries.length - 1];
                if (lastDelivery) {
                    setFinalDelivery(lastDelivery);
                    setIsFinalDesignSet(true);
                }
            }
        }
    }, [requestData, designDeliveries, finalDelivery]);

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

            const revisionPurchaseDetails = {
                requestId: requestData?.id,
                revisionQuantity: quantity,
                extraRevisionPrice: extraRevisionPrice,
                totalAmount: price,
                designerId: requestData?.finalDesignQuotation?.designer?.customer?.id || requestData?.designer?.id,
                designerName: requestData?.finalDesignQuotation?.designer?.customer?.name || requestData?.designer?.customer?.name || 'Unknown Designer'
            };
            sessionStorage.setItem('revisionPurchaseDetails', JSON.stringify(revisionPurchaseDetails));

            const amount = price;
            const description = "buy extra revision";
            const orderType = "revision";
            const returnURL = "/school/payment/result";

            sessionStorage.setItem('currentPaymentType', orderType);

            const paymentResponse = await getPaymentUrl(amount, description, orderType, returnURL);

            if (paymentResponse && paymentResponse.status === 200 && paymentResponse.data.body) {
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
                const response = await makeDesignFinal({
                    deliveryId: deliveryToMakeFinal.id
                });

                if (response && response.status === 201) {
                    setFinalDelivery(deliveryToMakeFinal);
                    setIsFinalDesignSet(true);

                    enqueueSnackbar(`'${deliveryToMakeFinal.name}' has been set as Final Design!`, {variant: 'success'});
                    handleCloseConfirmFinalModal();

                    if (requestData?.id) {
                        fetchDesignDeliveries(requestData.id);
                    }

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
                    enqueueSnackbar('Failed to set final design. Please try again.', {variant: 'error'});
                }
            } catch (error) {
                console.error('Error setting final design:', error);
                enqueueSnackbar('Error setting final design. Please try again.', {variant: 'error'});
            }
        }
    };

    const handleMakeFinal = (deliveryItem) => {
        handleOpenConfirmFinalModal(deliveryItem);
    };

    const handleRevisionSubmit = async (values) => {
        try {
            console.log('Revision Request:', values);

            const revisionData = {
                deliveryId: selectedDeliveryIdForRevision,
                note: values.revisionDescription
            };

            const response = await createRevisionRequest(revisionData);

            if (response && response.status === 201) {
                enqueueSnackbar('Revision request submitted successfully!', {variant: 'success'});
                handleCloseRevisionModal();

                if (requestData?.id) {
                    fetchDesignDeliveries(requestData.id);
                    fetchRevisionRequests(requestData.id);

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

                    {}
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
                                    {requestData?.status === 'completed' && (
                                        <Typography.Text style={{
                                            fontSize: '14px',
                                            color: '#52c41a',
                                            fontWeight: 600,
                                            display: 'block',
                                            mt: 0.5
                                        }}>
                                            ✅ Request completed - Chat history available for viewing
                                        </Typography.Text>
                                    )}
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
                                        backgroundColor: requestData?.status === 'processing' ? '#7c3aed' : '#2e7d32',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        padding: '8px 16px'
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
                        <Box sx={{display: 'flex', gap: 3, flex: 2}}>


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
                                        border: '2px solid #2e7d32',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(46, 125, 50, 0.15)',
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
                                                        Design
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

                                    {}
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
                                                    Loading designs...
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
                                                    No designs yet. Designer will add designs here.
                                                </Typography.Text>
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 2,
                                                p: 1,
                                                width: '100%'
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
                                                                width: '100%',
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
                                                                flexDirection: 'row',
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
                                                                        flex: 1,
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
                                                                                    flex: 1,
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
                                                                                flex: 1,
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

                                {}
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
                                    {}
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

                                    {}
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
                                                                        Revision {index + 1}
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

                        {}
                        {designDeliveries.length > 0 && (
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
                                {}
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

                                {}
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
                                                {requestData?.status === 'completed' ? 'Final design - Design completed' :
                                                    finalDelivery.note || 'Final design selected'}
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
                                    ) : requestData?.status === 'completed' ? (
                                        // Nếu request đã completed và có deliveries nhưng chưa có finalDelivery
                                        // Hiển thị thông báo và có thể cho phép chọn delivery làm final
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '100%',
                                            flexDirection: 'column',
                                            gap: 2,
                                            color: '#64748b',
                                            textAlign: 'center'
                                        }}>
                                            <CheckCircleOutlined
                                                style={{fontSize: '48px', opacity: 0.5, color: '#52c41a'}}/>
                                            <Typography.Title level={5} style={{margin: '0 0 8px 0', color: '#52c41a'}}>
                                                Design Request Completed
                                            </Typography.Title>
                                            <Typography.Text type="secondary"
                                                             style={{fontSize: '14px', fontWeight: 600}}>
                                                {designDeliveries.length} design{designDeliveries.length !== 1 ? 's' : ''} available
                                            </Typography.Text>
                                            <Typography.Text type="secondary"
                                                             style={{fontSize: '12px', color: '#52c41a'}}>
                                                Select a design as final from the Design section above
                                            </Typography.Text>
                                            <Button
                                                type="default"
                                                icon={<CheckCircleOutlined/>}
                                                onClick={() => {
                                                    // Tự động chọn delivery đầu tiên làm final
                                                    if (designDeliveries.length > 0) {
                                                        const firstDelivery = designDeliveries[0];
                                                        setFinalDelivery(firstDelivery);
                                                        setIsFinalDesignSet(true);
                                                        enqueueSnackbar(`'${firstDelivery.name}' has been set as Final Design!`, {variant: 'success'});
                                                    }
                                                }}
                                                size="small"
                                                style={{
                                                    borderColor: '#52c41a',
                                                    color: '#52c41a',
                                                    borderRadius: '6px',
                                                    height: '32px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    marginTop: '8px'
                                                }}
                                            >
                                                Set First Design as Final
                                            </Button>
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
                                            <FileTextOutlined style={{fontSize: '48px', opacity: 0.5}}/>
                                            <Typography.Text type="secondary" style={{fontSize: '14px'}}>
                                                No final design selected yet
                                            </Typography.Text>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        )}
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
                            Confirm Final Design
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
                    Are you sure you want to set this design as the final design? This action cannot be reversed.
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

            {}
            {canAccessChat && (
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
                                            {!userInfo ? 'Loading user info...' :
                                                requestData?.status === 'completed' ? 'Chat history available for completed requests' : 'No messages yet. Start the conversation!'}
                                        </Typography.Text>
                                    </Box>
                                ) : (
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                        {chatMessages.map((msg, index) => (
                                            <Box
                                                key={msg.id || index}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: msg.userId === userInfo?.id ? 'flex-end' : 'flex-start'
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-end',
                                                    gap: 0.5,
                                                    maxWidth: '80%'
                                                }}>
                                                    {msg.userId !== userInfo?.id && (
                                                        <Avatar size="small" style={{backgroundColor: '#1976d2'}}
                                                                icon={<UserSwitchOutlined/>}/>
                                                    )}
                                                    <Box sx={{
                                                        p: 1.5,
                                                        borderRadius: 3,
                                                        background: msg.userId === userInfo?.id
                                                            ? 'linear-gradient(135deg, #2e7d32, #4caf50)'
                                                            : 'white',
                                                        color: msg.userId === userInfo?.id ? 'white' : '#1e293b',
                                                        border: msg.userId !== userInfo?.id ? '1px solid #e2e8f0' : 'none',
                                                        boxShadow: msg.userId === userInfo?.id
                                                            ? '0 2px 8px rgba(46, 125, 50, 0.3)'
                                                            : '0 1px 4px rgba(0,0,0,0.1)'
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
                                <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                                    <Box sx={{flex: 1, position: 'relative'}}>
                                        <Input
                                            size="large"
                                            placeholder={!userInfo ? 'Loading user info...' : 
                                                requestData?.status === 'completed' ? 'Chat is read-only for completed requests' : 
                                                'Type your message...'}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onPressEnter={handleSendMessage}
                                            disabled={isViewOnly || !userInfo}
                                            style={{
                                                borderRadius: '24px',
                                                padding: '14px 18px',
                                                border: '1px solid #e2e8f0',
                                                height: 48
                                            }}
                                        />
                                        {showEmojiPicker && (
                                            <Box
                                                ref={emojiPickerRef}
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: '46px',
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
            )}
        </Box>
    );
}