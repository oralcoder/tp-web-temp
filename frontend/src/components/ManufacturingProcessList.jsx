import { useState, useRef } from 'react';

const ManufacturingProcessList = () => {
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
    status: 'all', // 'all', '설계', '실계'
  });
  
  // 정렬 상태
  const [sortField, setSortField] = useState(null); // 'patientName', 'requestDate', 'deliveryDate'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // 샘플 데이터
  const allProcesses = [
    {
      id: 1,
      orderNumber: '251028-130-2',
      chartNumber: 'PT-20251028-01065',
      patientName: '오평가',
      type: '크라운',
      material: '지르코니아',
      requestDate: '2025-10-28',
      deliveryDate: '2025-11-07',
      requestType: '금오기공소',
      status: '설계',
    },
    {
      id: 2,
      orderNumber: '251030-130-3',
      chartNumber: 'PT-20251030-01068',
      patientName: '홍길자',
      type: '크라운',
      material: '지르코니아',
      requestDate: '2025-10-30',
      deliveryDate: '2025-10-31',
      requestType: '금오기공소',
      status: '검토',
    },
    {
      id: 3,
      orderNumber: '251028-130-3',
      chartNumber: 'PT-20251028-01063',
      patientName: '정평가',
      type: '크라운',
      material: '지르코니아',
      requestDate: '2025-10-28',
      deliveryDate: '2025-11-07',
      requestType: '금오기공소',
      status: '확정',
    },
    {
      id: 4,
      orderNumber: '251029-130-2',
      chartNumber: 'PT-20251028-01065',
      patientName: '오평가',
      type: '브릿지',
      material: '골드',
      requestDate: '2025-10-29',
      deliveryDate: '2025-10-30',
      requestType: '금오기공소',
      status: '제작',
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
  const filteredProcesses = allProcesses.filter(process => {
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        process.orderNumber.toLowerCase().includes(query) ||
        process.chartNumber.toLowerCase().includes(query) ||
        process.patientName.toLowerCase().includes(query) ||
        process.requestType.toLowerCase().includes(query) ||
        process.type.toLowerCase().includes(query) ||
        process.material.toLowerCase().includes(query) ||
        process.status.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // 상태 필터
    if (filters.status !== 'all' && process.status !== filters.status) {
      return false;
    }

    // 날짜 범위 필터
    if (!isDateInRange(process.requestDate)) {
      return false;
    }

    return true;
  });

  // 정렬 적용
  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue, bValue;
    
    if (sortField === 'patientName') {
      aValue = a.patientName;
      bValue = b.patientName;
    } else if (sortField === 'requestDate') {
      aValue = new Date(a.requestDate);
      bValue = new Date(b.requestDate);
    } else if (sortField === 'deliveryDate') {
      aValue = new Date(a.deliveryDate);
      bValue = new Date(b.deliveryDate);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  const totalItems = sortedProcesses.length;

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
  
  // 정렬 핸들러
  const handleSort = (field) => {
    if (sortField === field) {
      // 같은 필드 클릭 시 방향 전환
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 필드 클릭 시 해당 필드로 오름차순 정렬
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // 정렬 아이콘 렌더링
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
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

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case '설계':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '검토':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case '확정':
        return 'bg-green-100 text-green-700 border-green-200';
      case '제작':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <h1 className="text-3xl font-bold text-center mb-8">제조공정 관리</h1>

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

              {/* 진행상태 필터 */}
              { /* 레이블 추가 */ }
              <label htmlFor="statusFilter" className="sr-only">진행상태 필터</label>
              <select
                id="statusFilter" 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer h-[42px]"
              >
                <option value="all">진행상태: 전체</option>
                <option value="설계">설계</option>
                <option value="검토">검토</option>
                <option value="확정">확정</option>
                <option value="제작">제작</option>
              </select>

              {/* 필터 초기화 버튼 */}
              {(getActiveFilterCount() > 0 || hasDateRange()) && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    clearDateRange();
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors h-[42px]"
                >
                  초기화
                </button>
              )}
            </div>

            {/* 오른쪽: 엑셀 다운로드 버튼 */}
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium ml-4">
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
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">주문번호</th>
                <th className="px-4 py-3 text-center text-sm font-medium">차트번호</th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  <button
                    onClick={() => handleSort('patientName')}
                    className="flex items-center justify-center gap-1 w-full hover:text-gray-200 transition-colors"
                  >
                    환자명
                    {renderSortIcon('patientName')}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">항목</th>
                <th className="px-4 py-3 text-center text-sm font-medium">재료</th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  <button
                    onClick={() => handleSort('requestDate')}
                    className="flex items-center justify-center gap-1 w-full hover:text-gray-200 transition-colors"
                  >
                    접수일
                    {renderSortIcon('requestDate')}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  <button
                    onClick={() => handleSort('deliveryDate')}
                    className="flex items-center justify-center gap-1 w-full hover:text-gray-200 transition-colors"
                  >
                    납품예정일
                    {renderSortIcon('deliveryDate')}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">접수기업</th>
                <th className="px-4 py-3 text-center text-sm font-medium">진행상태</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProcesses.length > 0 ? (
                sortedProcesses.map((process) => (
                  <tr key={process.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a href="#" className="text-blue-600 hover:underline">
                        {process.orderNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">{process.chartNumber}</td>
                    <td className="px-4 py-3 text-center">{process.patientName}</td>
                    <td className="px-4 py-3 text-center">{process.type}</td>
                    <td className="px-4 py-3 text-center">{process.material}</td>
                    <td className="px-4 py-3 text-center">{process.requestDate}</td>
                    <td className="px-4 py-3 text-center">{process.deliveryDate}</td>
                    <td className="px-4 py-3 text-center text-sm">{process.requestType}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(process.status)}`}>
                        {process.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '제조공정 정보가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 하단 버튼 및 페이지네이션 */}
        <div className="mt-6 flex items-center justify-between">
          {/* 왼쪽: 삭제 버튼 */}
          <button className="border-2 border-red-500 text-red-500 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium">
            삭제
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

          {/* 오른쪽: 빈 공간 (균형) */}
          <div className="w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingProcessList;
