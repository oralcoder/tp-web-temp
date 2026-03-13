import { useState, useEffect, useRef } from 'react'
import PatientList from './components/PatientList'
import ProductionRequestList from './components/ProductionRequestList'
import ManufacturingProcessList from './components/ManufacturingProcessList'
import OrderManagementList from './components/OrderManagementList'
import MemberManagementList from './components/MemberManagementList'
import SalesStatistics from './components/SalesStatistics'
import PatientData from './components/PatientData'
import ChatPanel from './components/Chat/ChatPanel'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('patients') // 'patients', 'requests', 'manufacturing', 'orders', 'members', 'marketplace', 'sales', or 'patientData'
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showMyPageMenu, setShowMyPageMenu] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => {
    // localStorage에서 사용자 정보 가져오기 (없으면 기본값)
    return localStorage.getItem('currentUser') || '금오치과'
  })
  
  // 알림 관리 상태
  const [notificationPage, setNotificationPage] = useState(1)
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [readToggle, setReadToggle] = useState('read') // 'read' or 'unread'
  const notificationsPerPage = 5
  const notificationRef = useRef(null)
  const userMenuRef = useRef(null)
  const myPageMenuRef = useRef(null)

  // 사용자 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('currentUser', currentUser)
  }, [currentUser])

  const switchUser = () => {
    const newUser = currentUser === '금오치과' ? '서울치과' : '금오치과'
    setCurrentUser(newUser)
  }

  // 알림 데이터
  const [notifications, setNotifications] = useState([
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
    {
      id: 6,
      type: 'request',
      icon: 'document',
      title: '새로운 제작의뢰서',
      message: '김철수 환자의 브릿지 제작의뢰가 등록되었습니다.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 7,
      type: 'status',
      icon: 'refresh',
      title: '제조공정 상태 변경',
      message: '주문번호 251101-130-5가 제작 단계로 이동했습니다.',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 8,
      type: 'delivery',
      icon: 'truck',
      title: '납품 완료',
      message: '5건의 주문이 납품 완료되었습니다.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 9,
      type: 'payment',
      icon: 'receipt',
      title: '계산서 발행 요청',
      message: '이영희 환자 외 2건의 계산서 발행이 요청되었습니다.',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 10,
      type: 'complete',
      icon: 'check',
      title: '제작 완료',
      message: '주문번호 251025-130-3의 제작이 완료되었습니다.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 11,
      type: 'request',
      icon: 'document',
      title: '새로운 제작의뢰서',
      message: '박민수 환자의 크라운 제작의뢰가 등록되었습니다.',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 12,
      type: 'delivery',
      icon: 'truck',
      title: '납품 예정',
      message: '2건의 주문이 내일 납품 예정입니다.',
      timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 13,
      type: 'status',
      icon: 'refresh',
      title: '제조공정 상태 변경',
      message: '주문번호 251020-130-1이 확정 단계로 이동했습니다.',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 14,
      type: 'payment',
      icon: 'receipt',
      title: '계산서 발행 완료',
      message: '총 3건의 계산서가 발행 완료되었습니다.',
      timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: 15,
      type: 'complete',
      icon: 'check',
      title: '제작 완료',
      message: '주문번호 251018-130-2의 제작이 완료되었습니다.',
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      isRead: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.isRead).length

  // 시간 포맷팅 함수
  const formatTimestamp = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }



  const handleViewAllNotifications = () => {
    setShowNotifications(false)
    setShowAllNotifications(true)
    setNotificationPage(1)
    setSelectedNotifications([])
  }

  // 알림 선택/해제
  const toggleNotificationSelection = (id) => {
    setSelectedNotifications(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id];
      
      // 선택 해제 시 토글 초기화
      if (newSelection.length === 0) {
        setReadToggle('read');
      }
      
      return newSelection;
    });
  }

  // 전체 선택/해제
  const toggleAllNotifications = () => {
    const currentPageNotifications = paginatedNotifications.map(n => n.id)
    if (currentPageNotifications.every(id => selectedNotifications.includes(id))) {
      const newSelection = selectedNotifications.filter(id => !currentPageNotifications.includes(id));
      setSelectedNotifications(newSelection);
      if (newSelection.length === 0) {
        setReadToggle('read');
      }
    } else {
      setSelectedNotifications(prev => [...new Set([...prev, ...currentPageNotifications])])
    }
  }

  // 선택한 알림 삭제
  const deleteSelectedNotifications = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)))
    setSelectedNotifications([])
    setReadToggle('read')
  }

  // 모두 읽음 표시
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  // 선택한 알림 읽음 표시
  const markSelectedAsRead = () => {
    setNotifications(prev =>
      prev.map(n => selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n)
    )
  }

  // 선택한 알림 읽지않음 표시
  const markSelectedAsUnread = () => {
    setNotifications(prev =>
      prev.map(n => selectedNotifications.includes(n.id) ? { ...n, isRead: false } : n)
    )
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(notifications.length / notificationsPerPage)
  const startIndex = (notificationPage - 1) * notificationsPerPage
  const paginatedNotifications = notifications.slice(startIndex, startIndex + notificationsPerPage)

  // 외부 클릭 시 알림 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (myPageMenuRef.current && !myPageMenuRef.current.contains(event.target)) {
        setShowMyPageMenu(false)
      }
    }

    if (showNotifications || showUserMenu || showMyPageMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, showUserMenu, showMyPageMenu])

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
                환자정보
              </button>
              <button
                onClick={() => setCurrentPage('requests')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  currentPage === 'requests'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                제작의뢰서
              </button>
              <button
                onClick={() => setCurrentPage('manufacturing')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  currentPage === 'manufacturing'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                제조공정
              </button>
              <button
                onClick={() => setCurrentPage('orders')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  currentPage === 'orders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                주문현황
              </button>
              
              {/* 구분선 */}
              <div className="h-10 w-px bg-gray-300 self-center mx-2"></div>
              
              {/* 마켓플레이스 메뉴 */}
              <button
                onClick={() => setCurrentPage('marketplace')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  currentPage === 'marketplace'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                마켓플레이스
              </button>
              
              {/* 마이페이지 드롭다운 메뉴 */}
              <div className="relative" ref={myPageMenuRef}>
                <button
                  onClick={() => setShowMyPageMenu(!showMyPageMenu)}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-1 ${
                    currentPage === 'members' || currentPage === 'mypage-notice' || currentPage === 'mypage-faq' || currentPage === 'mypage-inquiry' || currentPage === 'mypage-purchase' || currentPage === 'sales' || currentPage === 'patientData'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  마이페이지
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* 드롭다운 메뉴 */}
                {showMyPageMenu && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-b-lg shadow-xl border border-gray-200 z-50 py-1">
                    <button
                      onClick={() => {
                        setCurrentPage('members');
                        setShowMyPageMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      회원정보수정
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage('mypage-notice');
                        setShowMyPageMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      공지사항
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage('mypage-faq');
                        setShowMyPageMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      FAQ
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage('mypage-inquiry');
                        setShowMyPageMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      1:1문의
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage('mypage-purchase');
                        setShowMyPageMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      구매 문의
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        setCurrentPage('sales');
                        setShowMyPageMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      제작의뢰 및 매출
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage('patientData');
                        setShowMyPageMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      환자데이터
                    </button>
                  </div>
                )}
              </div>
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

              {/* 사용자 메뉴 & 알림 */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm relative">
                    <span className="text-white text-sm font-semibold">{currentUser.charAt(0)}</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold">{currentUser.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{currentUser}</p>
                            <p className="text-xs text-gray-500">dental@kumoh.com</p>
                          </div>
                        </div>
                        {/* 알림 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifications(!showNotifications);
                            setShowUserMenu(false);
                          }}
                          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          {unreadCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </button>
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
                      {/*
                      <button 
                        onClick={switchUser}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>사용자 전환 ({currentUser === '금오치과' ? '서울치과' : '금오치과'})</span>
                      </button>
                      */}
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

              {/* 알림 드롭다운 (별도 영역) */}
              <div className="relative" ref={notificationRef}>
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
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                  <span className="text-sm text-gray-600">{formatTimestamp(notification.timestamp)}</span>
                                </div>
                                {!notification.isRead && (
                                  <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
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
      {currentPage === 'members' && <MemberManagementList />}
      {currentPage === 'sales' && <SalesStatistics />}
      {currentPage === 'patientData' && <PatientData />}
      {currentPage === 'marketplace' && (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">마켓플레이스</h1>
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg">마켓플레이스 페이지 준비 중입니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 모든 알림 보기 모달 */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">모든 알림</h2>
                  <span className="text-sm text-gray-500">총 {notifications.length}개</span>
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
              
              {/* Gmail 스타일 액션 바 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 전체 선택 체크박스 */}
                  <input
                    type="checkbox"
                    checked={paginatedNotifications.length > 0 && paginatedNotifications.every(n => selectedNotifications.includes(n.id))}
                    onChange={toggleAllNotifications}
                    className="w-5 h-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  
                  {/* 선택 시 액션 버튼들 */}
                  {selectedNotifications.length > 0 && (
                    <>
                      <span className="text-sm font-medium text-gray-700">
                        {selectedNotifications.length}개 선택됨
                      </span>
                      <div className="h-4 w-px bg-gray-300"></div>
                      {(() => {
                        const selectedNotifs = notifications.filter(n => selectedNotifications.includes(n.id));
                        const hasUnread = selectedNotifs.some(n => !n.isRead);
                        const hasRead = selectedNotifs.some(n => n.isRead);
                        
                        if (hasUnread && !hasRead) {
                          // 읽지 않은 메시지만 선택
                          return (
                            <button
                              onClick={markSelectedAsRead}
                              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            >
                              읽음 표시
                            </button>
                          );
                        } else if (hasRead && !hasUnread) {
                          // 읽은 메시지만 선택
                          return (
                            <button
                              onClick={markSelectedAsUnread}
                              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            >
                              읽지 않음 표시
                            </button>
                          );
                        } else {
                          // 섞여 있을 때 - 토글 버튼 (하나만 표시)
                          if (readToggle === 'read') {
                            return (
                              <button
                                onClick={() => {
                                  markSelectedAsRead();
                                  setReadToggle('unread');
                                }}
                                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              >
                                읽음 표시
                              </button>
                            );
                          } else {
                            return (
                              <button
                                onClick={() => {
                                  markSelectedAsUnread();
                                  setReadToggle('read');
                                }}
                                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              >
                                읽지 않음 표시
                              </button>
                            );
                          }
                        }
                      })()}
                    </>
                  )}
                </div>
                
                {/* 삭제 버튼 - 오른쪽 끝 (붉은 박스) */}
                {selectedNotifications.length > 0 && (
                  <button
                    onClick={deleteSelectedNotifications}
                    className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>

            {/* 알림 목록 */}
            <div className="flex-1 overflow-y-auto">
              {paginatedNotifications.length > 0 ? (
                paginatedNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    } ${index !== paginatedNotifications.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-base font-semibold text-gray-900">{notification.title}</h3>
                            <span className="text-sm text-gray-600">{formatTimestamp(notification.timestamp)}</span>
                          </div>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2.5 h-2.5 mt-1.5 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  알림이 없습니다.
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {startIndex + 1}-{Math.min(startIndex + notificationsPerPage, notifications.length)} / {notifications.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setNotificationPage(1)}
                      disabled={notificationPage === 1}
                      className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="처음"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setNotificationPage(prev => Math.max(1, prev - 1))}
                      disabled={notificationPage === 1}
                      className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="이전"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                      {notificationPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setNotificationPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={notificationPage === totalPages}
                      className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="다음"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setNotificationPage(totalPages)}
                      disabled={notificationPage === totalPages}
                      className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="마지막"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}


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
