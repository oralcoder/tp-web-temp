import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ScreenShare from './ScreenShare';

const ChatPanel = ({ isOpen, onClose, currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [showScreenShare, setShowScreenShare] = useState(false);

  // 대화 목록 실시간 로드
  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'conversations'),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convos);
    });

    return () => unsubscribe();
  }, [isOpen]);

  // 선택된 대화의 메시지 실시간 로드
  useEffect(() => {
    if (!selectedConversation) return;

    const q = query(
      collection(db, 'conversations', selectedConversation.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await addDoc(collection(db, 'conversations', selectedConversation.id, 'messages'), {
        text: newMessage,
        sender: currentUser,
        timestamp: serverTimestamp(),
        read: false
      });

      // 대화의 마지막 메시지 업데이트
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const createNewConversation = async () => {
    if (!newChatName.trim()) return;

    try {
      const conversationRef = await addDoc(collection(db, 'conversations'), {
        name: newChatName,
        participants: [currentUser, newChatName],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        createdAt: serverTimestamp()
      });

      setShowNewChatModal(false);
      setNewChatName('');
      
      // 새로 생성된 대화방으로 이동
      setSelectedConversation({
        id: conversationRef.id,
        name: newChatName,
        participants: [currentUser, newChatName],
        lastMessage: '',
        unreadCount: 0
      });
      setShowConversationList(false);
    } catch (error) {
      console.error('대화 생성 실패:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedConversation && (
            <button
              onClick={() => {
                setSelectedConversation(null);
                setShowConversationList(true);
              }}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h3 className="font-semibold">
            {selectedConversation ? selectedConversation.name : '메시지'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {selectedConversation && (
            <button
              onClick={() => setShowScreenShare(true)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="화면 공유"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 대화 목록 */}
      {showConversationList && !selectedConversation && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* 새 대화 버튼 */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 대화 시작
            </button>
          </div>

          {conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm mb-2">대화가 없습니다</p>
                <p className="text-xs text-gray-400">위 버튼을 클릭하여 새 대화를 시작하세요</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => {
                    setSelectedConversation(convo);
                    setShowConversationList(false);
                  }}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">
                        {convo.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {convo.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {convo.lastMessageTime?.toDate().toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {convo.lastMessage}
                      </p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 메시지 창 */}
      {selectedConversation && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => {
              const isMyMessage = msg.sender === currentUser;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isMyMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        isMyMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {msg.timestamp?.toDate().toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 메시지 입력 */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* 새 대화 모달 */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 대화 시작</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대화 상대 이름
              </label>
              <input
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createNewConversation()}
                placeholder="예: 서울치과, 김철수 기공사..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                실제 사용 시에는 사용자 목록에서 선택하거나 초대할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatName('');
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={createNewConversation}
                disabled={!newChatName.trim()}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                대화 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 화면 공유 모달 */}
      {showScreenShare && selectedConversation && (
        <ScreenShare
          conversationId={selectedConversation.id}
          currentUser={currentUser}
          onClose={() => setShowScreenShare(false)}
        />
      )}
    </div>
  );
};

export default ChatPanel;
