import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket, joinSOSRoom } from '../services/socketService';
import { setRealtimeSOS, updateRealtimeSOSStatus, updateRealtimeSOSLocation } from '../store/slices/sosSlice';
import { handleRealtimeContactUpdate } from '../store/slices/contactSlice';
import { handleRealtimeSafeZoneUpdate } from '../store/slices/safeZoneSlice';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Bell, MessageSquare, X } from 'lucide-react';

const SocketManager = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const { activeSOS } = useSelector((state) => state.sos);

  const [isConnected, setIsConnected] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Clear toast automatically after 6 seconds
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (!token) {
      setIsConnected(false);
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      if (activeSOS?._id) {
        joinSOSRoom(activeSOS._id);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleSOSTriggered = (data) => {
      console.log('⚡ [WebSocket Event] sos_triggered received:', data);
      dispatch(setRealtimeSOS(data));

      const isUserSOS = data?.user?.id === user?.id;
      setToastNotification({
        type: 'danger',
        title: isUserSOS ? 'SOS Emergency Triggered!' : `🚨 LIVE ALERT: ${data?.user?.name || 'A user'} triggered SOS!`,
        message: 'Real-time location sharing is now active.'
      });
    };

    const handleSOSStatusUpdated = (data) => {
      console.log('⚡ [WebSocket Event] sos_status_updated received:', data);
      dispatch(updateRealtimeSOSStatus(data));

      const status = data?.status || data?.sos?.status;
      setToastNotification({
        type: 'info',
        title: `SOS Status Updated: ${status}`,
        message: `Alert state changed to ${status} in real-time.`
      });
    };

    const handleSOSLocationUpdated = (data) => {
      console.log('⚡ [WebSocket Event] sos_location_updated received:', data);
      dispatch(updateRealtimeSOSLocation(data));
    };

    const handleContactUpdated = (data) => {
      console.log('⚡ [WebSocket Event] contact_updated received:', data);
      dispatch(handleRealtimeContactUpdate(data));
      setToastNotification({
        type: 'success',
        title: 'Circle Updated',
        message: 'Trusted contact list updated across your devices.'
      });
    };

    const handleSafeZoneUpdated = (data) => {
      console.log('⚡ [WebSocket Event] safe_zone_updated received:', data);
      dispatch(handleRealtimeSafeZoneUpdate(data));
      setToastNotification({
        type: 'success',
        title: 'Safe Zones Updated',
        message: 'Safe zones synchronized in real-time.'
      });
    };

    const handleReceivePrivateMessage = (data) => {
      console.log('⚡ [WebSocket Event] receive_private_message received:', data);
      const senderName = data?.sender?.name || data?.message?.sender?.name || 'A user';
      const senderId = data?.sender?.id || data?.message?.sender?._id || data?.message?.sender;

      if (senderId !== user?.id) {
        setToastNotification({
          type: 'info',
          title: `💬 Message from ${senderName}`,
          message: data?.message?.text || 'Sent you a private message.'
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('sos_triggered', handleSOSTriggered);
    socket.on('sos_status_updated', handleSOSStatusUpdated);
    socket.on('sos_location_updated', handleSOSLocationUpdated);
    socket.on('contact_updated', handleContactUpdated);
    socket.on('safe_zone_updated', handleSafeZoneUpdated);
    socket.on('receive_private_message', handleReceivePrivateMessage);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('sos_triggered', handleSOSTriggered);
      socket.off('sos_status_updated', handleSOSStatusUpdated);
      socket.off('sos_location_updated', handleSOSLocationUpdated);
      socket.off('contact_updated', handleContactUpdated);
      socket.off('safe_zone_updated', handleSafeZoneUpdated);
      socket.off('receive_private_message', handleReceivePrivateMessage);
    };
  }, [token, user?.id, dispatch]);

  // Join SOS room whenever activeSOS ID changes
  useEffect(() => {
    if (activeSOS?._id && isConnected) {
      joinSOSRoom(activeSOS._id);
    }
  }, [activeSOS?._id, isConnected]);

  if (!user) return null;

  return (
    <>
      {/* WebSocket Status Badge */}
      <div className="fixed bottom-3 right-4 z-[999] flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
        <span className={`relative flex h-2.5 w-2.5 items-center justify-center`}>
          {isConnected && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
        </span>
        <span className="tracking-tight">
          {isConnected ? 'Real-Time Sync Active' : 'Connecting WebSockets...'}
        </span>
      </div>

      {/* Real-time Floating Notification Toast */}
      {toastNotification && (
        <div className="fixed top-16 right-4 left-4 sm:left-auto sm:max-w-md z-[1000] animate-bounce-short">
          <div className={`flex items-start gap-3 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${
            toastNotification.type === 'danger'
              ? 'bg-rose-500/95 text-white border-rose-400 shadow-rose-500/30'
              : toastNotification.type === 'info'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 shadow-pink-500/30'
              : 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-500/30'
          }`}>
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
              {toastNotification.type === 'danger' ? <AlertTriangle size={20} /> : <MessageSquare size={20} />}
            </div>
            <div className="flex-1 pr-2">
              <h4 className="font-extrabold text-sm tracking-tight">{toastNotification.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 font-medium">{toastNotification.message}</p>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="rounded-lg p-1 transition-colors hover:bg-white/20 text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SocketManager;
