import React, {useEffect, useState} from "react";
import {Button, Popover, Typography} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
import {db} from "../../configs/FirebaseConfig.jsx";
import {getAccessCookie} from "../../utils/CookieUtil.jsx";

export const addNotification = async ({email, title, content}) => {
    if (!email || !title || !content) return;

    const notifRef = collection(db, "notifications");
    await addDoc(notifRef, {
        email,
        title,
        content,
        creation_date: serverTimestamp(),
        read: false
    });
};

export default function Bell() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [email, setEmail] = useState("");

    const formatFirebaseDate = (firebaseDate) => {
        if (!firebaseDate) return "Invalid Date";

        if (firebaseDate && typeof firebaseDate.toDate === 'function') {
            return firebaseDate.toDate();
        }

        if (firebaseDate instanceof Date) {
            return firebaseDate;
        }

        const date = new Date(firebaseDate);
        return isNaN(date.getTime()) ? new Date() : date;
    };

    const getMail = async () => {
        let cookie = await getAccessCookie()
        if (!cookie) {
            return false;
        }
        return cookie.email
    }

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const emailValue = await getMail();
                if (emailValue) {
                    setEmail(emailValue);
                }
            } catch (error) {
                console.error("Error fetching email:", error);
            }
        };

        fetchEmail();
    }, []);

    useEffect(() => {
        if (!email) return;

        const notifRef = collection(db, "notifications");
        const q = query(
            notifRef,
            where("email", "==", email)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setNotifications(list);
        });

        return () => unsub();
    }, [email]);





    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (id) => {
        try {
            setNotifications(prev =>
                prev.map(n => (n.id === id ? {...n, read: true} : n))
            );

            await updateDoc(doc(db, "notifications", id), {read: true});
        } catch (e) {
            setNotifications(prev =>
                prev.map(n => (n.id === id ? {...n, read: false} : n))
            );
            console.error("markAsRead error:", e);
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return;

        try {
            setNotifications(prev => prev.map(n => ({...n, read: true})));

            const batch = writeBatch(db);
            unread.forEach(n => {
                batch.update(doc(db, "notifications", n.id), {read: true});
            });
            await batch.commit();
        } catch (e) {
            console.error("markAllAsRead error:", e);
        }
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <Button
                aria-describedby={id}
                onClick={handleClick}
                sx={{
                    color: '#ff9800',
                    '&:hover': {
                        color: '#f57c00',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)'
                    }
                }}
            >
                <NotificationsIcon sx={{ color: 'inherit' }}/>
                {}
                {notifications.filter(n => !n.read).length > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: '#ff9800',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {notifications.filter(n => !n.read).length}
                    </span>
                )}
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                disableScrollLock={true}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: '80vh',
                            overflow: 'visible'
                        }
                    }
                }}
                sx={{
                    '& .MuiPopover-paper': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.12)'
                    }
                }}
            >
                <div style={{padding: 8, minWidth: 350, maxWidth: 400}}>
                    {notifications.length > 0 ? (
                        <div>
                            <Typography variant="h6"
                                        style={{marginBottom: 8, borderBottom: '1px solid #ddd', paddingBottom: 4}}>
                                Notifications ({notifications.length})
                            </Typography>
                            <div style={{maxHeight: 400, overflowY: 'auto'}}>
                                {notifications
                                    .sort((a, b) => {
                                        const dateA = formatFirebaseDate(a.creation_date);
                                        const dateB = formatFirebaseDate(b.creation_date);
                                        return dateB.getTime() - dateA.getTime();
                                    })
                                    .map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            style={{
                                                padding: 12,
                                                marginBottom: 8,
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 6,
                                                backgroundColor: notification.read ? '#ffffff' : '#f5f5f5',
                                                fontWeight: notification.read ? 'normal' : 'bold',
                                                boxShadow: notification.read ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: 6}}>
                                                <div
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        backgroundColor: notification.read ? '#4caf50' : '#2196f3',
                                                        marginRight: 8
                                                    }}
                                                />
                                                <Typography
                                                    variant="subtitle2"
                                                    style={{
                                                        fontWeight: notification.read ? 'normal' : 'bold',
                                                        color: '#333'
                                                    }}
                                                >
                                                    {notification.title}
                                                </Typography>
                                            </div>

                                            <Typography
                                                variant="body2"
                                                style={{
                                                    marginBottom: 8,
                                                    color: '#666',
                                                    lineHeight: 1.4,
                                                    fontWeight: notification.read ? 'normal' : '500'
                                                }}
                                            >
                                                {notification.content}
                                            </Typography>

                                            {}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap'
                                            }}>
                                                <Typography
                                                    variant="caption"
                                                    style={{
                                                        color: '#999',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {(() => {
                                                        try {
                                                            const date = formatFirebaseDate(notification.creation_date);
                                                            return date.toLocaleString('vi-VN', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            });
                                                        } catch (error) {
                                                            console.error('Date formatting error:', error);
                                                            return 'Invalid Date';
                                                        }
                                                    })()}
                                                </Typography>
                                            </div>

                                            <div style={{marginTop: 6, textAlign: 'right'}}>
                                                <Typography
                                                    variant="caption"
                                                    style={{
                                                        color: notification.read ? '#4caf50' : '#2196f3',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    {notification.read ? 'âœ?read' : 'â—?unread'}
                                                </Typography>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div
                                style={{marginTop: 8, textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: 8}}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    style={{fontSize: '0.75rem'}}
                                    onClick={markAllAsRead}
                                    disabled={notifications.filter(n => !n.read).length === 0}
                                >
                                    Mark all as read ({notifications.filter(n => !n.read).length})
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: 20}}>
                            <NotificationsIcon style={{fontSize: 48, color: '#ddd', marginBottom: 8}}/>
                            <Typography variant="body2" color="textSecondary">
                                No notifications
                            </Typography>
                        </div>
                    )}
                </div>
            </Popover>
        </>
    );
}