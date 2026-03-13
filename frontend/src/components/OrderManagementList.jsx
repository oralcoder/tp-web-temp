import { useState, useRef, useEffect } from 'react';

const OrderManagementList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef(null);
  
  // 뷰 모드 (list or calendar)
  const [viewMode, setViewMode] = useState('list');
  
  // 캘린더 날짜 상태
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const yearPickerRef = useRef(null);
  const monthPickerRef = useRef(null);
  
  // 날짜 범위 필터
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 필터 상태
  const [filters, setFilters] = useState({
    status: 'all', // 'all', '납품대기', '입고확인', '입고완료'
    company: 'all', // 'all', '금오기공소', '덱시스기공소'
  });
  
  // 필터 드롭다운 상태
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);

  // 샘플 데이터
  const allOrders = [
    {
      id: 1,
      orderNumber: '251030-130-4',
      chartNumber: '2024-001234',
      patientName: '홍길자',
      type: '크라운',
      material: '지르코니아',
      amount: 98000,
      receiptDate: '',
      requestCompany: '금오기공소',
      status: '입고대기',
    },
    {
      id: 2,
      orderNumber: '251030-130-2',
      chartNumber: '2024-001234',
      patientName: '홍길자',
      type: '크라운',
      material: '지르코니아',
      amount: 85000,
      receiptDate: '2025-10-30',
      requestCompany: '금오기공소',
      status: '발행요청',
    },
    {
      id: 3,
      orderNumber: '251030-130-1',
      chartNumber: '2024-001234',
      patientName: '홍길자',
      type: '크라운',
      material: '지르코니아',
      amount: 80000,
      receiptDate: '2025-10-30',
      requestCompany: '금오기공소',
      status: '요청완료',
    },
    {
      id: 4,
      orderNumber: '251029-130-1',
      chartNumber: '2024-005678',
      patientName: '오평가',
      type: '크라운',
      material: '지르코니아',
      amount: 100000,
      receiptDate: '',
      requestCompany: '금오기공소',
      status: '정산대기',
    },
    {
      id: 5,
      orderNumber: '251028-130-1',
      chartNumber: '2024-005678',
      patientName: '오평가',
      type: '크라운',
      material: '지르코니아',
      amount: 100000,
      receiptDate: '',
      requestCompany: '금오기공소',
      status: '입고대기',
    },
    {
      id: 6,
      orderNumber: '251027-130-1',
      chartNumber: '2024-009012',
      patientName: '김철수',
      type: '브릿지',
      material: '골드',
      amount: 150000,
      receiptDate: '2025-10-27',
      requestCompany: '덱시스기공소',
      status: '납품대기',
    },
  ];

  // 날짜 범위 필터 헬퍼 함수
  const isDateInRange = (dateString) => {
    if (!dateString || (!startDate && !endDate)) return true;
    
    const date = new Date(dateString);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && end) {
      return date >= start && date <= end;
    } else if (start) {
      return date >= start;
    } else if (end) {
      return date <= end;
    }
    
    return true;
  };

  // 검색 및 필터링
  const filteredOrders = allOrders.filter(order => {
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        order.orderNumber.toLowerCase().includes(query) ||
        order.chartNumber.toLowerCase().includes(query) ||
        order.patientName.toLowerCase().includes(query) ||
        order.requestCompany.toLowerCase().includes(query) ||
        order.type.toLowerCase().includes(query) ||
        order.material.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // 상태 필터
    if (filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }

    // 접수기업 필터
    if (filters.company !== 'all' && order.requestCompany !== filters.company) {
      return false;
    }

    // 날짜 범위 필터 (납품예정일 기준)
    if (!isDateInRange(order.deliveryDate)) {
      return false;
    }

    return true;
  });

  const totalItems = filteredOrders.length;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // 필터 관련 함수
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      company: 'all',
    });
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.company !== 'all') count++;
    return count;
  };

  const hasDateRange = () => {
    return startDate || endDate;
  };

  const isClickableStatus = (status) => {
    return status === '입고대기' || status === '정산대기' || status === '발행요청';
  };

  const getStatusButtonStyle = (status) => {
    const isClickable = isClickableStatus(status);
    
    // 클릭 불가능한 상태 (납품대기, 요청완료) - 회색 배지
    if (!isClickable) {
      return {
        className: 'bg-slate-100 text-slate-600 border-slate-200',
        clickable: false
      };
    }
    
    // 클릭 가능한 상태 - 컬러 버튼
    switch (status) {
      case '입고대기':
        return {
          className: 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-sm',
          clickable: true
        };
      case '정산대기':
        return {
          className: 'bg-sky-600 text-white hover:bg-sky-700 cursor-pointer shadow-sm',
          clickable: true
        };
      case '발행요청':
        return {
          className: 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-sm',
          clickable: true
        };
      default:
        return {
          className: 'bg-slate-100 text-slate-600 border-slate-200',
          clickable: false
        };
    }
  };

  const handleStatusClick = (order) => {
    const statusStyle = getStatusButtonStyle(order.status);
    if (statusStyle.clickable) {
      console.log('상태 버튼 클릭:', order.orderNumber, order.status);
      // 여기에 클릭 시 수행할 로직 추가
    }
  };

  // 캘린더 뷰용 데이터 처리
  const getCalendarEvents = () => {
    return filteredOrders
      .filter(order => order.deliveryDate || order.receiptDate)
      .map(order => ({
        id: order.id,
        title: `[${order.status}] ${order.patientName} - ${order.orderNumber}`,
        date: order.deliveryDate || order.receiptDate,
        status: order.status,
        orderNumber: order.orderNumber,
      }));
  };

  // 외부 클릭 시 필터 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // 년/월 선택 드롭다운 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target)) {
        setShowYearPicker(false);
      }
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 캘린더 관련 함수
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // 이전 달의 날짜들
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
      });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i),
      });
    }

    // 다음 달의 날짜들 (7의 배수로 맞추기)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          date: new Date(currentYear, currentMonth + 1, i),
        });
      }
    }

    return days;
  };

  const getOrdersForDate = (date) => {
    return filteredOrders.filter(order => {
      const orderDate = order.receiptDate ? new Date(order.receiptDate) : null;
      if (!orderDate) return false;
      
      return (
        orderDate.getFullYear() === date.getFullYear() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getDate() === date.getDate()
      );
    });
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <h1 className="text-3xl font-bold text-center mb-8">주문현황 관리</h1>

        {/* 검색 및 액션 바 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 검색창 + 날짜 범위 + 필터 */}
            <div className="flex items-center gap-3 flex-1">
              {/* 검색창 */}
              <div className="relative flex items-center w-80">
                <div className="absolute left-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="검색어를 입력하세요"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    type="button"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 날짜 범위 선택 */}
              <div className="flex items-center gap-2 px-3 border border-gray-300 rounded-lg bg-white h-[42px]">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-sm focus:outline-none"
                  placeholder="시작일"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-sm focus:outline-none"
                  placeholder="종료일"
                />
                {hasDateRange() && (
                  <button
                    onClick={clearDateRange}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    type="button"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 필터 버튼 */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors h-[42px] ${
                    getActiveFilterCount() > 0
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>필터</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* 필터 드롭다운 */}
                {showFilterDropdown && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">필터 설정</h3>
                        {getActiveFilterCount() > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            전체 초기화
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* 진행상태 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">진행상태</label>
                          <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                          >
                            <option value="all">전체</option>
                            <option value="납품대기">납품대기</option>
                            <option value="입고대기">입고대기</option>
                            <option value="정산대기">정산대기</option>
                            <option value="발행요청">발행요청</option>
                            <option value="요청완료">요청완료</option>
                          </select>
                        </div>

                        {/* 접수기업 */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">접수기업</label>
                          <select
                            value={filters.company}
                            onChange={(e) => handleFilterChange('company', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                          >
                            <option value="all">전체</option>
                            <option value="금오기공소">금오기공소</option>
                            <option value="덱시스기공소">덱시스기공소</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          적용
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 뷰 전환 + 엑셀 다운로드 */}
            <div className="flex items-center gap-2 ml-4">
              {/* 뷰 전환 버튼 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="리스트 보기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="캘린더 보기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* 엑셀 다운로드 버튼 */}
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                엑셀 다운로드
              </button>
            </div>
          </div>
        </div>

        {/* 리스트 뷰 */}
        {viewMode === 'list' && (
          <>
            {/* 테이블 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-600 text-white">
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium">주문번호</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">차트번호</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">환자명</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">항목</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">재료</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">제작금액(원)</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">입고일</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">접수기업</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">진행상태</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="w-4 h-4" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a href="#" className="text-blue-600 hover:underline">
                            {order.orderNumber}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-center">{order.chartNumber}</td>
                        <td className="px-4 py-3 text-center">{order.patientName}</td>
                        <td className="px-4 py-3 text-center">{order.type}</td>
                        <td className="px-4 py-3 text-center">{order.material}</td>
                        <td className="px-4 py-3 text-center">{order.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">{order.receiptDate || '-'}</td>
                        <td className="px-4 py-3 text-center text-sm">{order.requestCompany}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleStatusClick(order)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                              getStatusButtonStyle(order.status).className
                            } ${
                              !isClickableStatus(order.status) ? 'cursor-default' : ''
                            }`}
                            disabled={!isClickableStatus(order.status)}
                          >
                            {order.status}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                        {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '주문 정보가 없습니다.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 하단 버튼 및 페이지네이션 */}
            <div className="mt-6 flex items-center justify-between">
              {/* 왼쪽: 액션 버튼 */}
              <div className="flex items-center gap-3">
                <button className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors font-medium">
                  일괄 정산
                </button>
              </div>

              {/* 중앙: 페이지 정보 + 페이지네이션 */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>페이지당</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>개</span>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">1-{Math.min(itemsPerPage, totalItems)}</span>
                  <span className="mx-1">of</span>
                  <span className="font-medium">{totalItems}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="처음">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="이전">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors min-w-[2rem]">
                    1
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="다음">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="마지막">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 오른쪽: 빈 공간 (균형) */}
              <div className="w-32"></div>
            </div>
          </>
        )}

        {/* 캘린더 뷰 */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg shadow">
            {/* 캘린더 헤더 */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                {/* 왼쪽: 년월 선택 */}
                <div className="flex items-center gap-3">
                  {/* 년월 통합 선택 */}
                  <div className="relative" ref={yearPickerRef}>
                    <button
                      onClick={() => {
                        setShowYearPicker(!showYearPicker);
                        setShowMonthPicker(true); // 월 선택을 기본으로
                      }}
                      className="px-4 py-2 text-lg font-semibold text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {currentYear}년 {monthNames[currentMonth]}
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* 년월 선택 패널 */}
                    {showYearPicker && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-80">
                        {showMonthPicker ? (
                          /* 월 그리드 선택 (기본 화면) */
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <button
                                onClick={() => setShowMonthPicker(false)}
                                className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm font-medium"
                              >
                                {currentYear}년
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setShowYearPicker(false);
                                  setShowMonthPicker(true);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {monthNames.map((month, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setCurrentMonth(index);
                                    setShowYearPicker(false);
                                    setShowMonthPicker(true);
                                  }}
                                  className={`py-3 px-4 text-sm rounded-lg transition-colors ${
                                    index === currentMonth
                                      ? 'bg-blue-600 text-white font-semibold'
                                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  {month}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* 년도 그리드 선택 */
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-semibold text-gray-700">년도 선택</h3>
                              <button
                                onClick={() => {
                                  setShowYearPicker(false);
                                  setShowMonthPicker(true);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                <button
                                  key={year}
                                  onClick={() => {
                                    setCurrentYear(year);
                                    setShowMonthPicker(true);
                                  }}
                                  className={`py-3 px-4 text-sm rounded-lg transition-colors ${
                                    year === currentYear
                                      ? 'bg-blue-600 text-white font-semibold'
                                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 중앙: 이전/다음 월 버튼 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="이전 달"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    오늘
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="다음 달"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* 오른쪽: 필터 정보 */}
                <div className="text-sm text-gray-500">
                  전체 {filteredOrders.length}건
                </div>
              </div>
            </div>

            {/* 캘린더 그리드 */}
            <div className="p-6">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center py-2 text-sm font-semibold ${
                      index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
                {generateCalendarDays().map((dayInfo, index) => {
                  const ordersForDay = getOrdersForDate(dayInfo.date);
                  const isToday = dayInfo.isCurrentMonth &&
                    dayInfo.day === new Date().getDate() &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear();

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] bg-white p-2 ${
                        !dayInfo.isCurrentMonth ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          !dayInfo.isCurrentMonth
                            ? 'text-gray-400'
                            : index % 7 === 0
                            ? 'text-red-600'
                            : index % 7 === 6
                            ? 'text-blue-600'
                            : 'text-gray-900'
                        } ${isToday ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center' : ''}`}
                      >
                        {dayInfo.day}
                      </div>

                      {/* 주문 목록 */}
                      <div className="space-y-1">
                        {ordersForDay.slice(0, 3).map(order => (
                          <div
                            key={order.id}
                            className={`text-xs px-2 py-1 rounded cursor-pointer truncate ${
                              order.status === '납품대기' || order.status === '요청완료'
                                ? 'bg-slate-100 text-slate-700'
                                : order.status === '입고대기'
                                ? 'bg-indigo-100 text-indigo-800'
                                : order.status === '정산대기'
                                ? 'bg-sky-100 text-sky-800'
                                : order.status === '발행요청'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                            title={`[${order.status}] ${order.patientName} - ${order.orderNumber}`}
                          >
                            [{order.status}] {order.patientName}
                          </div>
                        ))}
                        {ordersForDay.length > 3 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{ordersForDay.length - 3}개 더보기
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagementList;
