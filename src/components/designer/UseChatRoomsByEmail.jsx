import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig.jsx";

export function useChatRoomsByEmail(accountId) {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        if (!accountId) return;
        const msgsRef = collection(db, "messages");
        const q = query(msgsRef, where("accountId", "==", accountId));

        const unsub = onSnapshot(q, (snap) => {
            const byRoom = new Map();
            snap.forEach((d) => {
                const m = d.data();
                const roomId = m.room;
                const createdAt = m.createdAt;
                const prev = byRoom.get(roomId);
                if (!prev || (createdAt?.seconds || 0) > (prev.updatedAt?.seconds || 0)) {
                    byRoom.set(roomId, {
                        id: String(roomId),
                        requestId: String(roomId),
                        lastMessage: m.text,
                        updatedAt: createdAt,
                    });
                }
            });

            const list = Array.from(byRoom.values()).sort(
                (a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
            );
            setRooms(list);
        });

        return () => unsub();
    }, [accountId]);

    return rooms;
}
