import { useState, useRef, useEffect } from 'react';

const ProductionRequestList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef(null);
  
  // 날짜 범위 필터
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 필터 상태
  const [filters, setFilters] = useState({
    status: 'all', // 'all', '승인대기', '추가요청', '승인반려'
  });

  // 체크박스 선택 상태
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  // 제작의뢰서 등록 폼 상태
  const [registrationForm, setRegistrationForm] = useState({
    // 차과/기공 제작의뢰서
    company: '금오치과',
    productionType: '금오치과',
    chartNumber: '금정구',
    patientName: '',
    patientContact: '',
    // 납기 (기본값: 오늘)
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: 'before',
    // 신청일 관리자 연락처 (기본값: 오늘)
    requestDate: new Date().toISOString().split('T')[0],
    adminContact: '010-1234-5678',
    // 환자정보
    gender: 'female',
    age: '',
    // 환자의뢰사항
    patientRequest: '',
    // 성별 라디오
    genderRadio: 'male',
    // 상악
    upperTeeth: {
      '#1': false, '16': false, '17': false, '18': false, '15': false, '14': false, '13': false, '12': false, '11': false,
      '#2': false, '21': false, '22': false, '23': false, '24': false, '25': false, '26': false, '27': false, '28': false, '#3': false
    },
    // 하악
    lowerTeeth: {
      '#4': false, '46': false, '47': false, '48': false, '45': false, '44': false, '43': false, '42': false, '41': false,
      '#0': false, '31': false, '32': false, '33': false, '34': false, '35': false, '36': false, '37': false, '38': false, '#0': false
    },
    // 상악 라디오
    upperArch: 'full',
    // 치아
    toothType: 'partial',
    // 임플란트
    implantType: 'internal',
    // 용도
    usage: '',
    // 참고파일첨부
    attachments: [],
    // 재제작 모델요청 사항
    remakeNote: ''
  });

  // 샘플 데이터
  const allRequests = [
    {
      id: 1,
      orderNumber: '251103-130-2',
      chartNumber: '',
      patientName: '홍길자',
      requestDate: '2025-11-03',
      deliveryDate: '2025-11-04',
      requestType: '금오기공소',
      status: '검토요청',
    },
    {
      id: 2,
      orderNumber: '251103-130-3',
      chartNumber: '',
      patientName: '홍길자',
      requestDate: '2025-11-03',
      deliveryDate: '2025-11-04',
      requestType: '금오기공소',
      status: '매칭대기',
    },
    {
      id: 3,
      orderNumber: '251103-130-1',
      chartNumber: '',
      patientName: '홍길자',
      requestDate: '2025-11-03',
      deliveryDate: '2025-11-04',
      requestType: '금오기공소',
      status: '추가요청',
    },
    {
      id: 4,
      orderNumber: '251029-67-2',
      chartNumber: 'C-2410',
      patientName: '윤평가',
      requestDate: '2025-10-29',
      deliveryDate: '2025-10-29',
      requestType: '덱시스기공소',
      status: '의뢰취소',
    },
    {
      id: 5,
      orderNumber: '251029-67-3',
      chartNumber: 'C-2410',
      patientName: '윤평가',
      requestDate: '2025-10-29',
      deliveryDate: '2025-10-29',
      requestType: '덱시스기공소',
      status: '승인대기',
    },
    {
      id: 6,
      orderNumber: '251029-67-4',
      chartNumber: 'C-2410',
      patientName: '윤평가',
      requestDate: '2025-10-29',
      deliveryDate: '2025-10-29',
      requestType: '덱시스기공소',
      status: '검토요청',
    },
    {
      id: 7,
      orderNumber: '251029-67-1',
      chartNumber: 'C-2410',
      patientName: '윤평가',
      requestDate: '2025-10-29',
      deliveryDate: '2025-10-29',
      requestType: '덱시스기공소',
      status: '매칭대기',
    },
    {
      id: 8,
      orderNumber: '251028-76-6',
      chartNumber: 'C-1234',
      patientName: '이명가',
      requestDate: '2025-10-28',
      deliveryDate: '2025-11-07',
      requestType: '문영재_TEST_치과기공소',
      status: '승인대기',
    },
    {
      id: 9,
      orderNumber: '251028-76-5',
      chartNumber: 'C-1234',
      patientName: '이명가',
      requestDate: '2025-10-28',
      deliveryDate: '2025-11-07',
      requestType: '문영재_TEST_치과기공소',
      status: '승인대기',
    },
  ];

  // 날짜 범위 필터 헬퍼 함수
  const isDateInRange = (dateString) => {
    if (!startDate && !endDate) return true;
    
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
  const filteredRequests = allRequests.filter(request => {
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        request.orderNumber.toLowerCase().includes(query) ||
        request.chartNumber.toLowerCase().includes(query) ||
        request.patientName.toLowerCase().includes(query) ||
        request.requestType.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // 상태 필터
    if (filters.status !== 'all' && request.status !== filters.status) {
      return false;
    }

    // 날짜 범위 필터
    if (!isDateInRange(request.requestDate)) {
      return false;
    }

    return true;
  });

  const totalItems = filteredRequests.length;

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
    });
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
    return count;
  };

  const hasDateRange = () => {
    return startDate || endDate;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '승인대기':
        return 'text-gray-700';
      case '추가요청':
        return 'text-blue-600';
      case '의뢰취소':
        return 'text-red-600';
      case '검토요청':
        return 'text-purple-600';
      case '매칭대기':
        return 'text-orange-600';
      default:
        return 'text-gray-700';
    }
  };

  // 체크박스 관련 함수
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredRequests.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteClick = () => {
    if (selectedItems.length === 0) {
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    setSelectedItems([]);
    setShowToast(true);
  };

  // 토스트 자동 숨김
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <h1 className="text-3xl font-bold text-center mb-8">제작의뢰서 관리</h1>

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
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
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

              {/* 진행상태 필터 */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">진행상태: 전체</option>
                <option value="승인대기">진행상태: 승인대기</option>
                <option value="추가요청">진행상태: 추가요청</option>
                <option value="의뢰취소">진행상태: 의뢰취소</option>
                <option value="검토요청">진행상태: 검토요청</option>
                <option value="매칭대기">진행상태: 매칭대기</option>
              </select>

              {/* 필터 초기화 버튼 */}
              {(getActiveFilterCount() > 0 || hasDateRange()) && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    clearDateRange();
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  초기화
                </button>
              )}
            </div>

            {/* 오른쪽: 엑셀 다운로드 */}
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              엑셀 다운로드
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="px-4 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded cursor-pointer"
                    checked={selectedItems.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">주문번호</th>
                <th className="px-4 py-3 text-center text-sm font-medium">차트번호</th>
                <th className="px-4 py-3 text-center text-sm font-medium">환자명</th>
                <th className="px-4 py-3 text-center text-sm font-medium">접수일</th>
                <th className="px-4 py-3 text-center text-sm font-medium">납품예정일</th>
                <th className="px-4 py-3 text-center text-sm font-medium">접수기업</th>
                <th className="px-4 py-3 text-center text-sm font-medium">진행상태</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 cursor-pointer"
                        checked={selectedItems.includes(request.id)}
                        onChange={() => handleSelectItem(request.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a href="#" className="text-blue-600 hover:underline">
                        {request.orderNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">{request.chartNumber}</td>
                    <td className="px-4 py-3 text-center">{request.patientName}</td>
                    <td className="px-4 py-3 text-center">{request.requestDate}</td>
                    <td className="px-4 py-3 text-center">{request.deliveryDate}</td>
                    <td className="px-4 py-3 text-center text-sm">{request.requestType}</td>
                    <td className={`px-4 py-3 text-center font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '제작의뢰서가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 하단 버튼 및 페이지네이션 */}
        <div className="mt-6 flex items-center justify-between">
          {/* 왼쪽: 삭제 버튼 */}
          <button 
            onClick={handleDeleteClick}
            disabled={selectedItems.length === 0}
            className={`border-2 border-red-500 px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedItems.length === 0 
                ? 'text-red-300 border-red-300 cursor-not-allowed' 
                : 'text-red-500 hover:bg-red-50'
            }`}
          >
            삭제 {selectedItems.length > 0 && `(${selectedItems.length})`}
          </button>

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

          {/* 오른쪽: 제작의뢰서 등록 버튼 */}
          <button 
            onClick={() => setShowRegistrationModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            제작의뢰서 등록
          </button>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">제작의뢰서 삭제</h3>
                  <p className="text-sm text-gray-600">
                    선택한 {selectedItems.length}개의 제작의뢰서를 삭제하시겠습니까?
                    <br />
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 제작의뢰서 등록 모달 */}
        {showRegistrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
              {/* 모달 헤더 */}
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">제작의뢰서 등록</h2>
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 모달 본문 */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* 차과/기공 제작의뢰서 섹션 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">차과/기공 제작의뢰서</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">주문번호</label>
                      <input
                        type="text"
                        value={registrationForm.company}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">산업자/기공사(원)</label>
                      <input
                        type="text"
                        value={registrationForm.productionType}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">산업명/치과명</label>
                      <input
                        type="text"
                        value={registrationForm.chartNumber}
                        onChange={(e) => setRegistrationForm({...registrationForm, chartNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">신청일</label>
                      <input
                        type="text"
                        value={registrationForm.patientName}
                        onChange={(e) => setRegistrationForm({...registrationForm, patientName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="검색"
                      />
                    </div>
                  </div>
                </div>

                {/* 납기 섹션 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">납기</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="date"
                        value={registrationForm.deliveryDate}
                        onChange={(e) => setRegistrationForm({...registrationForm, deliveryDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deliveryTime"
                          value="before"
                          checked={registrationForm.deliveryTime === 'before'}
                          onChange={(e) => setRegistrationForm({...registrationForm, deliveryTime: e.target.value})}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">이전</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deliveryTime"
                          value="after"
                          checked={registrationForm.deliveryTime === 'after'}
                          onChange={(e) => setRegistrationForm({...registrationForm, deliveryTime: e.target.value})}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">이후</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 신청일 관리자 연락처 */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">신청일</label>
                      <input
                        type="date"
                        value={registrationForm.requestDate}
                        onChange={(e) => setRegistrationForm({...registrationForm, requestDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">신청일 관리자 연락처</label>
                      <input
                        type="text"
                        value={registrationForm.adminContact}
                        onChange={(e) => setRegistrationForm({...registrationForm, adminContact: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* 환자정보 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">환자정보</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">이름</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">나이</label>
                      <div className="flex gap-2 items-center">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={registrationForm.genderRadio === 'male'}
                            onChange={(e) => setRegistrationForm({...registrationForm, genderRadio: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">남성</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={registrationForm.genderRadio === 'female'}
                            onChange={(e) => setRegistrationForm({...registrationForm, genderRadio: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">여성</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 환자의뢰사항 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">환자의뢰사항</h3>
                  <textarea
                    value={registrationForm.patientRequest}
                    onChange={(e) => setRegistrationForm({...registrationForm, patientRequest: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded h-20 resize-none"
                  />
                </div>

                {/* 치아 선택 그리드 */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">상악</h3>
                    <div className="flex items-center gap-2">
                      {['#1', '16', '17', '18', '15', '14', '13', '12', '11', '#2', '21', '22', '23', '24', '25', '26', '27', '28', '#3'].map((tooth) => (
                        <button
                          key={tooth}
                          className={`px-3 py-2 text-xs border rounded ${
                            tooth.startsWith('#') 
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                          disabled={tooth.startsWith('#')}
                        >
                          {tooth}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">하악</h3>
                    <div className="flex items-center gap-2">
                      {['#4', '46', '47', '48', '45', '44', '43', '42', '41', '#0', '31', '32', '33', '34', '35', '36', '37', '38', '#0'].map((tooth, idx) => (
                        <button
                          key={`lower-${idx}`}
                          className={`px-3 py-2 text-xs border rounded ${
                            tooth.startsWith('#') 
                              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                          disabled={tooth.startsWith('#')}
                        >
                          {tooth}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 상악/하악 라디오 */}
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="upperArch"
                        value="full"
                        checked={registrationForm.upperArch === 'full'}
                        onChange={(e) => setRegistrationForm({...registrationForm, upperArch: e.target.value})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">상악</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="upperArch"
                        value="partial"
                        checked={registrationForm.upperArch === 'partial'}
                        onChange={(e) => setRegistrationForm({...registrationForm, upperArch: e.target.value})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">하악</span>
                    </label>
                  </div>
                </div>

                {/* 치아 / 임플란트 */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">치아</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="toothType"
                            value="partial"
                            checked={registrationForm.toothType === 'partial'}
                            onChange={(e) => setRegistrationForm({...registrationForm, toothType: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">부분</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="toothType"
                            value="full"
                            checked={registrationForm.toothType === 'full'}
                            onChange={(e) => setRegistrationForm({...registrationForm, toothType: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">전악</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">임플란트</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="implantType"
                            value="internal"
                            checked={registrationForm.implantType === 'internal'}
                            onChange={(e) => setRegistrationForm({...registrationForm, implantType: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">내부연결</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="implantType"
                            value="external"
                            checked={registrationForm.implantType === 'external'}
                            onChange={(e) => setRegistrationForm({...registrationForm, implantType: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">외부연결</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 용도 */}
                <div className="mb-6">
                  <label className="block text-xs text-gray-600 mb-2">용도</label>
                  <input
                    type="text"
                    value={registrationForm.usage}
                    onChange={(e) => setRegistrationForm({...registrationForm, usage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>

                {/* 참고파일첨부 */}
                <div className="mb-6">
                  <label className="block text-xs text-gray-600 mb-2">참고파일첨부</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50"
                      placeholder="주문을 선택해주세요"
                      readOnly
                    />
                    <button className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors">
                      파일첨부
                    </button>
                  </div>
                </div>

                {/* 재제작 모델요청 사항 */}
                <div className="mb-6">
                  <label className="block text-xs text-gray-600 mb-2">재제작 모델요청 사항</label>
                  <textarea
                    value={registrationForm.remakeNote}
                    onChange={(e) => setRegistrationForm({...registrationForm, remakeNote: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded h-20 resize-none"
                  />
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <div className="flex gap-2">
                  <button className="px-6 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    저장
                  </button>
                  <button className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium">
                    초기화
                  </button>
                  <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    등록
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 토스트 알림 */}
        {showToast && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
            <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[320px]">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">제작의뢰서가 삭제되었습니다.</span>
              <button
                onClick={() => setShowToast(false)}
                className="ml-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionRequestList;
