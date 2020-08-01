interface ActiveConnection {
  res: any;
  chatIds: string[];
  id: string;
}

// YOLO RAM
let active: ActiveConnection[] = [];

export const addConnection = (chatIds: string[], res: any, id: string) => {
  active.push({
    res,
    chatIds,
    id,
  });
};

export const pushNotification = (chatId: any) => {
  const connections = active.filter((obj) => {
    return obj.chatIds.includes(chatId);
  });

  connections.forEach((conn) => {
    conn.res.write(`event: reconcile\n`);
    conn.res.write(`data: ${JSON.stringify({ chatId })}\n\n`);
  });
};

export const pushNotificationTest = () => {
  active.forEach((conn) => {
    conn.res.write(`event: ping\n`);
    conn.res.write(`data: ${JSON.stringify({ msg: "Hello" })}\n\n`);
  });
};

export const removeConnection = (id: string) => {
  active = active.filter((conn) => conn.id !== id);
};
