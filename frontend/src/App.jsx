import { useState, useEffect, useRef } from 'react'
import PatientList from './components/PatientList'
import ProductionRequestList from './components/ProductionRequestList'
import ManufacturingProcessList from './components/ManufacturingProcessList'
import OrderManagementList from './components/OrderManagementList'
import ChatPanel from './components/Chat/ChatPanel'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('patients') // 'patients', 'requests', 'manufacturing', or 'orders'
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => {
    // localStorage에서 사용자 정보 가져오기 (없으면 기본값)
    return localStorage.getItem('currentUser') || '금오치과'
  })
  const notificationRef = useRef(null)
  const userMenuRef = useRef(null)

  // 사용자 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('currentUser', currentUser)
  }, [currentUser])

  const switchUser = () => {
    const newUser = currentUser === '금오치과' ? '서울치과' : '금오치과'
    setCurrentUser(newUser)
  }

  // 임시 알림 데이터
  const notifications = [
    {
      id: 1,
      type: 'request',
      icon: 'document',
      title: '새로운 제작의뢰서',
      message: '홍길동 환자의 크라운 제작의뢰가 등록되었습니다.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5분 전
      isRead: false,
    },
    {
      id: 2,
      type: 'status',
      icon: 'refresh',
      title: '제조공정 상태 변경',
      message: '주문번호 251103-130-2가 검토 단계로 이동했습니다.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
      isRead: false,
    },
    {
      id: 3,
      type: 'delivery',
      icon: 'truck',
      title: '납품 예정',
      message: '3건의 주문이 내일 납품 예정입니다.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3시간 전
      isRead: true,
    },
    {
      id: 4,
      type: 'payment',
      icon: 'receipt',
      title: '계산서 발행 요청',
      message: '오평가 환자 외 1건의 계산서 발행이 요청되었습니다.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1일 전
      isRead: true,
    },
    {
      id: 5,
      type: 'complete',
      icon: 'check',
      title: '제작 완료',
      message: '주문번호 251028-130-1의 제작이 완료되었습니다.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
      isRead: true,
    },
  ]

  const unreadCount = notifications.filter(n => !n.isRead).length

  // 시간 포맷팅 함수
  const formatTimestamp = (date) => {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  // 알림 아이콘 컴포넌트
  const NotificationIcon = ({ type }) => {
    const iconConfig = {
      request: { bg: 'bg-blue-100', text: 'text-blue-600', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      status: { bg: 'bg-purple-100', text: 'text-purple-600', path: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      delivery: { bg: 'bg-green-100', text: 'text-green-600', path: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
      payment: { bg: 'bg-orange-100', text: 'text-orange-600', path: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
      complete: { bg: 'bg-emerald-100', text: 'text-emerald-600', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    }
    
    const config = iconConfig[type] || iconConfig.request
    
    return (
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
        <svg className={`w-5 h-5 ${config.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.path} />
        </svg>
      </div>
    )
  }

  const handleViewAllNotifications = () => {
    setShowNotifications(false)
    setShowAllNotifications(true)
  }

  // 외부 클릭 시 알림 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, showUserMenu])

  return (
    <div>
      {/* 네비게이션 탭 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 탭 메뉴 */}
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage('patients')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  currentPage === 'patients'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                환자 정보
              </button>
              <button
                onClick={() => setCurrentPage('requests')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  currentPage === 'requests'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                제작의뢰서 관리
              </button>
              <button
                onClick={() => setCurrentPage('manufacturing')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  currentPage === 'manufacturing'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                제조공정 관리
              </button>
              <button
                onClick={() => setCurrentPage('orders')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  currentPage === 'orders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                주문현황 관리
              </button>
            </div>

            {/* 오른쪽: 사용자 정보 & 알림 */}
            <div className="flex items-center gap-4">
              {/* 채팅 버튼 */}
              <button
                onClick={() => setShowChat(!showChat)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="메시지"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* 읽지 않은 메시지 뱃지 (나중에 실제 데이터로 대체) */}
                {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
              </button>

              {/* 사용자 메뉴 */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-semibold">{currentUser.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{currentUser}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 사용자 드롭다운 메뉴 */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                    {/* 사용자 정보 헤더 */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold">{currentUser.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{currentUser}</p>
                          <p className="text-xs text-gray-500">dental@kumoh.com</p>
                        </div>
                      </div>
                    </div>

                    {/* 메뉴 항목들 */}
                    <div className="py-1">
                      <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>내 프로필</span>
                      </button>
                      
                      <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>설정</span>
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button 
                        onClick={switchUser}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>사용자 전환 ({currentUser === '금오치과' ? '서울치과' : '금오치과'})</span>
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 알림 아이콘 */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* 알림 드롭다운 */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[420px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900">알림</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-gray-500">{unreadCount}개의 읽지 않은 알림</span>
                      )}
                    </div>
                    <div className="max-h-[480px] overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <NotificationIcon type={notification.type} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                {!notification.isRead && (
                                  <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{formatTimestamp(notification.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                      <button 
                        onClick={handleViewAllNotifications}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-1 hover:bg-blue-50 rounded transition-colors"
                      >
                        모든 알림 보기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 페이지 컨텐츠 */}
      {currentPage === 'patients' && <PatientList />}
      {currentPage === 'requests' && <ProductionRequestList />}
      {currentPage === 'manufacturing' && <ManufacturingProcessList />}
      {currentPage === 'orders' && <OrderManagementList />}

      {/* 모든 알림 보기 모달 */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">모든 알림</h2>
                <p className="text-sm text-gray-500 mt-1">총 {notifications.length}개의 알림</p>
              </div>
              <button
                onClick={() => setShowAllNotifications(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 알림 목록 */}
            <div className="flex-1 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  } ${index !== notifications.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <NotificationIcon type={notification.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        <span>•</span>
                        <span>{notification.timestamp.toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 푸터 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowAllNotifications(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                닫기
              </button>
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                모두 읽음 표시
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 채팅 패널 */}
      <ChatPanel 
        isOpen={showChat} 
        onClose={() => setShowChat(false)}
        currentUser={currentUser}
      />
    </div>
  )
}

export default App
