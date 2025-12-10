import { useState, useRef, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ScreenShare = ({ conversationId, currentUser, onClose }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const roleRef = useRef(null);

  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // WebRTC 연결 초기화
  const createPeerConnection = (role) => {
    console.log('Creating peer connection as:', role);
    const peerConnection = new RTCPeerConnection(servers);
    roleRef.current = role;
    
    // 연결 상태 모니터링
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      setConnectionState(peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    peerConnection.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', peerConnection.iceGatheringState);
    };
    
    // ICE candidate 처리
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
        const callDoc = doc(db, 'conversations', conversationId, 'screenShare', 'current');
        const candidatesCollection = collection(callDoc, role === 'caller' ? 'callerCandidates' : 'calleeCandidates');
        
        try {
          await addDoc(candidatesCollection, event.candidate.toJSON());
          console.log('ICE candidate saved to Firebase');
        } catch (error) {
          console.error('Error saving ICE candidate:', error);
        }
      }
    };

    // 원격 스트림 수신
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event);
      const [stream] = event.streams;
      console.log('Remote stream:', stream);
      console.log('Stream tracks:', stream.getTracks());
      console.log('Video tracks:', stream.getVideoTracks());
      
      setRemoteStream(stream);
      
      // 즉시 비디오 엘리먼트에 연결
      setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          console.log('Remote video element updated');
          
          // 비디오 재생 확인
          remoteVideoRef.current.play().then(() => {
            console.log('Video playing successfully');
          }).catch((err) => {
            console.error('Video play error:', err);
          });
        }
      }, 100);
    };

    return peerConnection;
  };

  // remoteStream 변경 시 비디오 엘리먼트 업데이트
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('Updating remote video with stream:', remoteStream);
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [remoteStream]);

  // 화면 공유 시작 (발신자)
  const startScreenShare = async () => {
    try {
      console.log('Starting screen share...');
      
      // 화면 캡처
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      console.log('Screen captured:', stream);
      console.log('Local stream tracks:', stream.getTracks());
      console.log('Local video tracks:', stream.getVideoTracks());
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('Local video element updated');
        
        // 비디오 재생 확인
        localVideoRef.current.play().then(() => {
          console.log('Local video playing successfully');
        }).catch((err) => {
          console.error('Local video play error:', err);
        });
      }

      // 화면 공유 중지 시 처리
      stream.getVideoTracks()[0].onended = () => {
        console.log('Screen share ended by user');
        stopScreenShare();
      };

      // Peer Connection 생성
      const peerConnection = createPeerConnection('caller');
      peerConnectionRef.current = peerConnection;

      // 로컬 스트림 추가
      stream.getTracks().forEach((track) => {
        console.log('Adding track:', track);
        peerConnection.addTrack(track, stream);
      });

      // Offer 생성
      const offerDescription = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offerDescription);
      console.log('Offer created:', offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      // Firebase에 통화 정보 저장
      const callDoc = doc(db, 'conversations', conversationId, 'screenShare', 'current');
      await setDoc(callDoc, {
        offer,
        caller: currentUser,
        createdAt: new Date().toISOString()
      });
      console.log('Offer saved to Firebase');

      // Answer 대기
      const unsubscribeCall = onSnapshot(callDoc, async (snapshot) => {
        const data = snapshot.data();
        console.log('Call doc updated:', data);
        
        if (!peerConnection.currentRemoteDescription && data?.answer) {
          console.log('Received answer:', data.answer);
          const answerDescription = new RTCSessionDescription(data.answer);
          await peerConnection.setRemoteDescription(answerDescription);
          console.log('Remote description set');
        }
      });

      // Callee의 ICE candidates 수신
      const calleeCandidatesCollection = collection(callDoc, 'calleeCandidates');
      const unsubscribeCandidates = onSnapshot(calleeCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            console.log('Adding callee ICE candidate:', candidate);
            await peerConnection.addIceCandidate(candidate);
          }
        });
      });

      setIsSharing(true);

      // Cleanup 함수 저장
      peerConnectionRef.current.cleanup = () => {
        unsubscribeCall();
        unsubscribeCandidates();
      };
    } catch (error) {
      console.error('화면 공유 시작 실패:', error);
      alert('화면 공유를 시작할 수 없습니다. 브라우저에서 권한을 허용해주세요.');
    }
  };

  // 화면 공유 수신 (수신자)
  const joinScreenShare = async () => {
    try {
      console.log('Joining screen share...');
      
      const callDoc = doc(db, 'conversations', conversationId, 'screenShare', 'current');
      const callSnapshot = await new Promise((resolve) => {
        const unsubscribe = onSnapshot(callDoc, (snapshot) => {
          unsubscribe();
          resolve(snapshot);
        });
      });

      const callData = callSnapshot.data();
      console.log('Call data:', callData);
      
      if (!callData?.offer) {
        alert('화면 공유가 시작되지 않았습니다.');
        return;
      }

      // Peer Connection 생성
      const peerConnection = createPeerConnection('callee');
      peerConnectionRef.current = peerConnection;

      // Caller의 ICE candidates 수신
      const callerCandidatesCollection = collection(callDoc, 'callerCandidates');
      const unsubscribeCandidates = onSnapshot(callerCandidatesCollection, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            console.log('Adding caller ICE candidate:', candidate);
            await peerConnection.addIceCandidate(candidate);
          }
        });
      });

      // Offer 설정
      const offerDescription = new RTCSessionDescription(callData.offer);
      await peerConnection.setRemoteDescription(offerDescription);
      console.log('Remote description (offer) set');

      // Answer 생성
      const answerDescription = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answerDescription);
      console.log('Answer created:', answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      // Firebase에 Answer 저장
      await updateDoc(callDoc, { answer });
      console.log('Answer saved to Firebase');

      setIsReceiving(true);

      // Cleanup 함수 저장
      peerConnectionRef.current.cleanup = () => {
        unsubscribeCandidates();
      };
    } catch (error) {
      console.error('화면 공유 수신 실패:', error);
      alert('화면 공유에 참여할 수 없습니다.');
    }
  };

  // 화면 공유 중지
  const stopScreenShare = async () => {
    console.log('Stopping screen share...');
    
    // Cleanup 함수 호출
    if (peerConnectionRef.current?.cleanup) {
      peerConnectionRef.current.cleanup();
    }
    
    // 로컬 스트림 중지
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Peer Connection 종료
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Firebase에서 통화 정보 삭제
    try {
      const callDoc = doc(db, 'conversations', conversationId, 'screenShare', 'current');
      await deleteDoc(callDoc);
      console.log('Call doc deleted');
    } catch (error) {
      console.error('화면 공유 정보 삭제 실패:', error);
    }

    setIsSharing(false);
    setIsReceiving(false);
    setRemoteStream(null);
    setConnectionState('closed');
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isSharing || isReceiving ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <h3 className="text-white text-lg font-semibold">
              {isSharing ? '화면 공유 중' : isReceiving ? '화면 수신 중' : '화면 공유'}
            </h3>
            <span className="text-sm text-gray-400">({connectionState})</span>
          </div>
          <div className="flex items-center gap-2">
            {isSharing && (
              <button
                onClick={stopScreenShare}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                공유 중지
              </button>
            )}
            {isReceiving && (
              <button
                onClick={stopScreenShare}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                수신 종료
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 비디오 영역 */}
        <div className="flex-1 p-6 flex items-center justify-center gap-4">
          {/* 로컬 화면 (공유 중인 화면) */}
          {isSharing && (
            <div className="flex-1 bg-black rounded-lg overflow-hidden relative" style={{ minHeight: '400px' }}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
                style={{ backgroundColor: '#000' }}
                onLoadedMetadata={(e) => console.log('Local video metadata loaded:', e.target.videoWidth, 'x', e.target.videoHeight)}
                onPlay={() => console.log('Local video started playing')}
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                내 화면 (공유 중)
              </div>
            </div>
          )}

          {/* 원격 화면 (수신 중인 화면) */}
          {isReceiving && (
            <div className="flex-1 bg-black rounded-lg overflow-hidden relative" style={{ minHeight: '400px' }}>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                style={{ backgroundColor: '#000' }}
                onLoadedMetadata={(e) => console.log('Remote video metadata loaded:', e.target.videoWidth, 'x', e.target.videoHeight)}
                onPlay={() => console.log('Remote video started playing')}
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                상대방 화면
              </div>
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>화면 수신 대기 중...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 초기 상태 */}
          {!isSharing && !isReceiving && (
            <div className="text-center">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-4">화면 공유</h3>
              <p className="text-gray-400 mb-6">
                화면을 공유하거나 상대방의 화면을 볼 수 있습니다
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={startScreenShare}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  내 화면 공유
                </button>
                <button
                  onClick={joinScreenShare}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  상대방 화면 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="px-6 py-4 bg-gray-800 rounded-b-lg">
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-gray-300 mb-1">화면 공유 팁</p>
              <ul className="list-disc list-inside space-y-1">
                <li>브라우저에서 화면 공유 권한을 허용해주세요</li>
                <li>전체 화면, 특정 창, 또는 Chrome 탭을 공유할 수 있습니다</li>
                <li>F12를 눌러 콘솔에서 연결 상태를 확인할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenShare;
